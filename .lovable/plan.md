# Auth + Trading Account Connection

## 1. Auth gating

- Keep existing `AuthContext` / Supabase auth.
- Public routes (no auth): `/`, `/pricing`, `/features`, `/academy-preview`, `/community-preview`, `/stats`, `/contact`, `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- Protected routes (wrap `AppLayout` in a `RequireAuth` guard that redirects to `/login?next=...`):
  `/dashboard`, `/live-signals`, `/tools/*`, `/journal`, `/academy`, `/community`, `/coach`, `/account`, `/account/trading-accounts`, `/portal`, `/client`.
- New pages: `Login`, `Signup`, `ForgotPassword`, `ResetPassword` (all using Supabase: `signInWithPassword`, `signUp` with `emailRedirectTo`, `resetPasswordForEmail` with `redirectTo`, `updateUser`).
- Logout already exists in `AppLayout` dropdown.

## 2. User roles (Member / Admin)

Separate `user_roles` table + `app_role` enum + `has_role()` SECURITY DEFINER function (per project rule — roles never on profile table). All new users default to `member` via trigger on `auth.users`.

## 3. Database (new tables)

```
trading_accounts        broker, account_name, account_login, server, currency,
                        leverage, provider ('myfxbook'|'mt5'|'mt4'|'ctrader'|'tradelocker'),
                        provider_account_id, status, last_sync_at, user_id

account_snapshots       account_id, balance, equity, open_pl, growth_pct,
                        drawdown_pct, captured_at

trade_history           account_id, ticket, symbol, side, lots, open_price,
                        close_price, open_time, close_time, pips, profit, commission, swap

performance_metrics     account_id, period ('all'|'30d'|'7d'|'today'),
                        trades, wins, losses, win_rate, profit_factor,
                        avg_win, avg_loss, best_trade, worst_trade,
                        total_pips, total_profit, computed_at

ai_insights             user_id, account_id, kind, title, body, score, created_at
trader_scores           user_id, account_id, score, breakdown jsonb, computed_at
weekly_reviews          user_id, account_id, week_start, summary, metrics jsonb
daily_reviews           user_id, account_id, review_date, summary, metrics jsonb
```

All have RLS scoped to `auth.uid()`, plus `service_role` full access. Standard GRANTs + `updated_at` triggers.

**Credentials are NOT stored in the DB.** Myfxbook email/password go to Supabase Vault via an edge function and are referenced by `account_id` — only the edge function can read them. (If Vault isn't acceptable, fallback: store only myfxbook email + provider account id and require the user to re-enter the password to re-sync.)

## 4. Trading Account connection flow

New page `/account/trading-accounts` (Settings → Trading Accounts):

- **Intro card** (no "Myfxbook" mention): "Want to connect your trading account?" — bullets, single CTA "Connect Trading Account".
- **Step 1 — Method picker**: Myfxbook (Recommended) + MT5/MT4/TradeLocker/cTrader as "Coming soon" cards.
- **Step 2 — Instructions**: "Connect via Myfxbook" walkthrough with placeholder slots for screenshots/video.
- **Step 3 — Form**: Myfxbook Email, Password, System Name → "Sync My Trading Account".
- **Step 4 — Validation**: live checks (Account Found / History Available / Sync Ready).
- **Step 5 — Sync complete**: redirect to `/dashboard` populated with imported data.

## 5. Edge functions

- `trading-account-connect` — accept `{ email, password, system_name }`, call Myfxbook `login` + `get-my-accounts`, persist `trading_accounts` row, stash credentials in Vault, kick off first sync.
- `trading-account-sync` — re-login (or use vault), fetch `get-my-accounts` + `get-history` + `get-data-daily`, write `account_snapshots`, `trade_history`, `performance_metrics`. Reuses the calc logic already in `myfxbook-stats`.
- `trading-account-disconnect` — remove vault secret + delete row (cascade).

CORS, zod validation, JWT validation in code.

## 6. Dashboard wiring

`Dashboard.tsx`:
- Read user's primary `trading_account` → latest `account_snapshots` row → latest `performance_metrics` row.
- Replace every hardcoded number (balance, equity, daily/weekly/monthly P&L, win rate, drawdown, equity curve) with these values.
- Empty state when no account connected → big "Connect Trading Account" CTA linking to `/account/trading-accounts`.
- Keep existing signal/AI insight panels intact.

## 7. Out of scope (this pass)

- Building Academy / Community / Coach pages — they'll be auth-gated placeholders.
- Actual AI generation (only the table scaffolding).
- Replacing the homepage.

## Files touched (approx)

- New: `src/pages/auth/{Login,Signup,ForgotPassword,ResetPassword}.tsx`, `src/components/RequireAuth.tsx`, `src/pages/account/TradingAccounts.tsx`, `src/components/trading-accounts/{IntroCard,MethodPicker,Instructions,ConnectForm,SyncStatus}.tsx`, edge functions above.
- Edited: `src/App.tsx` (route map + guards), `src/pages/Dashboard.tsx` (real data), `AppSidebar` (Settings → Trading Accounts link).
- New migration: tables + RLS + grants + roles.

## Confirm before I build

1. OK to skip Vault and just re-prompt for password on each re-sync? (simpler, no extra secret surface)
2. OK that Academy/Community/Coach stay as auth-gated "Coming soon" pages for now?
3. OK to use email/password auth only (no Google/Apple OAuth) in this pass?
