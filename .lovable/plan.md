# AASAKIRA Copy Trading Engine — Phase 1

Build production-ready copy trading infrastructure. This is scaffolding for real MT5 execution — the execution layer is abstracted so a broker adapter (MT5, cTrader) can be plugged in later without touching the queue, risk engine, or UI.

## Scope boundary

- Phase 1 (this pass): database, encryption, queue, risk engine, execution service abstraction, dashboards, admin panel, sidebar, AI hook tables.
- Out of scope: live MT5 socket integration, real broker order placement (stubbed executor that writes to `execution_logs` and marks jobs `completed`/`failed`), AI analysis logic (tables only, no Claude calls yet), payment gating.

## 1. Database (single migration)

New tables in `public`, each with GRANTs + RLS + policies:

- `master_accounts` — id, name, broker, server, account_number, status, balance, equity, growth, drawdown, is_active, created_by (admin), timestamps. Readable by all authenticated; write = admin only (`has_role`).
- `follower_accounts` — id, user_id, account_number, server, broker, encrypted_password (bytea), encryption_iv, connection_status (connected/connecting/syncing/disconnected/error), last_sync_at, balance, equity. RLS: user owns row.
- `copy_relationships` — master_account_id, follower_account_id, copy_mode (fixed_lot/risk_percent/balance_multiplier), copy_config (jsonb: lot_size/risk_pct/multiplier), status (active/paused/stopped), created_at. RLS via follower ownership.
- `copy_events` — master_account_id, event_type (OPEN/MODIFY/PARTIAL_CLOSE/FULL_CLOSE), payload jsonb, master_ticket, created_at. Admin write, authenticated read.
- `copy_jobs` — copy_event_id, copy_relationship_id, follower_account_id, status (pending/processing/completed/failed/rejected), attempts, last_error, executed_at. RLS via follower ownership; service role writes.
- `copy_activity` — denormalized feed: follower_account_id, master_account_id, action, symbol, volume, result, pnl, occurred_at.
- `execution_logs` — copy_job_id, level (info/warn/error), message, context jsonb.
- `risk_profiles` — follower_account_id, max_daily_drawdown_pct, max_drawdown_pct, max_lot_size, max_open_trades, min_margin_level, equity_floor.
- `copy_settings` — per follower: auto_pause_on_drawdown, notifications, whitelist_symbols, blacklist_symbols.
- `sync_status` — follower_account_id, last_heartbeat, latency_ms, error_count.
- `trade_modifications` — history of MODIFY events applied.
- `trade_closures` — history of PARTIAL/FULL closures.
- `ai_copy_insights`, `ai_risk_reports`, `ai_trader_scores` — empty shells with follower_account_id, generated_at, payload jsonb, score numeric.

Reuse existing `trade_history` (already present) — no schema change.

## 2. Encryption

Edge function `follower-account-connect` uses AES-256-GCM (Deno `crypto.subtle`) with a `COPY_TRADING_ENCRYPTION_KEY` secret (generated via `generate_secret`, 64 chars). Never store plaintext broker passwords. Store `encrypted_password` + `encryption_iv` in `follower_accounts`.

## 3. Edge functions

- `follower-account-connect` — encrypt & store credentials, mark `connecting` → `connected`.
- `copy-event-dispatch` — admin/master action posts a `copy_events` row + fan-out `copy_jobs` for every active `copy_relationships` row.
- `copy-job-processor` — runs risk engine per job, calls stub executor, writes `execution_logs` + `copy_activity`, updates job status. Cron-invoked every minute via `pg_cron` (existing pattern).
- `copy-emergency-stop` — pauses/stops relationships for a user or master.

## 4. Services (frontend)

- `src/services/copyTrading/executionService.ts` — abstract interface `TradeExecutor` with `openTrade/modifyTrade/partialClose/closeTrade`. Default `StubExecutor` returns success; future `MT5Executor` implements the same interface.
- `src/services/copyTrading/riskEngine.ts` — pure functions validating a job against `risk_profiles` + current account state.
- `src/services/copyTrading/lotSizing.ts` — converts master volume to follower volume per copy_mode.

## 5. UI

New sidebar group "Copy Trading" with routes:

```text
/copy               Overview
/copy/accounts      My Accounts (connect + status)
/copy/masters       Masters (browse + subscribe)
/copy/activity      Copy Activity feed
/copy/risk          Risk Settings
/copy/performance   Performance
/copy/settings      Settings + Emergency Stop
```

Dashboards:
- Follower dashboard cards (copy status, current master, trades copied, PnL, drawdown, health).
- Master dashboard (followers, allocated capital, open positions, execution metrics).
- Admin panel at `/copy/admin` (guarded by `has_role('admin')`): masters CRUD, event log, force-disconnect, broadcast.

## 6. Cron

Add `pg_cron` job invoking `copy-job-processor` every minute via `net.http_post` (via `supabase--insert` per project rule).

## Deliverables

- 1 migration (all tables, RLS, GRANTs, cron extensions).
- 4 edge functions.
- 3 frontend services + hooks.
- 8 new pages + admin sub-page.
- Sidebar update.
- 1 encryption secret via `generate_secret`.

Approve to proceed.
