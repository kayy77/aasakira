
# AASAKIRA Funnel — Build Plan (Pass 1)

Scope locked from your answers: **Onboarding + Verification** as the first slice, **AI-assisted auto-review** for screenshots, **stub the paywall**, **full landing rebuild**. Everything else (Risk Suite, Claude Intelligence, Community, real Stripe paywall) ships as "Coming Soon" placeholders in this pass.

## 1. Landing page rebuild (`/`, public)

Replace `AasakiraLanding` with a funnel-focused page in luxury black + gold:

- **Hero**: "The Operating System for Serious Traders" + single CTA `Start Free` → `/signup`. Live ticker strip (XAUUSD, US30, EURUSD) pulled from existing `fetch-live-prices`.
- **Preview rail** (7 tiles, each links to `/signup`):
  Live Signals · Recent Wins · Verified Trading Account · Performance Metrics · Academy · Risk Suite · AI Coach.
  Tiles use real data where it exists (recent `active_trades`, MyFxBook stats), otherwise a sealed "Members only" state.
- **Trust band**: MyFxBook verified card (existing `myfxbook-stats`) + win-rate + total pips this week.
- **Funnel explainer**: 3-step strip — Create Workspace → Verify Account → Unlock AASAKIRA.
- **Footer CTA**: `Create Your Trading Workspace` → `/signup`.

## 2. Signup copy + onboarding entry

- Change Signup page title to **"Create Your Trading Workspace"**.
- After successful signup, redirect to **`/onboarding`** instead of `/dashboard`.
- `RequireAuth` gains an onboarding gate: if `user_profiles.onboarding_status != 'verified'` and route is in the gated set, redirect to `/onboarding`.

## 3. Onboarding flow (`/onboarding`, authenticated)

Single page, stepper UI, persists progress to `user_profiles.onboarding_*` fields.

**Step 1 — Trader type**
Cards: `Personal Account` · `Funded Account` · `Prop Firm Challenge`.

**Step 2A — Personal route (STARTRADER)**
Checklist with link-outs to the official STARTRADER live registration URL:
- Open MT5 Hedge STP account
- Claim 100% deposit bonus
- Verify ID
- Submit address verification
- Fund account
Each item is a checkbox the user ticks as they complete it. CTA: `I've completed all steps → Upload verification`.

**Step 2B — Funded / Prop route**
- "3-Day Free Trial Active" banner with countdown (trial start = now, persisted).
- Pricing cards: `$75/month` and `$475 Lifetime` with **stubbed** `Upgrade` button (opens existing VIP WhatsApp link from memory). No Stripe wiring yet.
- After trial expiry: route is soft-locked to the pricing screen until upgraded (manual admin flip for now).
- Still allows Step 3 verification during trial.

**Step 3 — Verification upload**
Three screenshot slots (Trading account number, Broker dashboard, MT5 account screen) → uploaded to a new private `verification-screenshots` Storage bucket.
On submit:
1. Insert `verification_requests` row (status `pending`).
2. Invoke edge function `verify-trading-account` → calls Lovable AI (Gemini 2.5 Flash vision) on each screenshot, extracts `{ account_number, broker, platform, confidence }`, and:
   - If all 3 screenshots agree on broker = STARTRADER and account number is present with confidence ≥ 0.8 → status `verified`.
   - Else → status `needs_review` (visible to admin queue later).
3. UI shows: `Pending Verification` → polls every 5s → `Verified` (green) or `Needs review`.

**Step 4 — Verified hand-off**
Verified users see: `Connect Your Trading Account` CTA → `/account/trading-accounts` (already built).

## 4. Database (single migration)

- `verification_requests` (id, user_id, trader_type, account_number, broker, platform, ai_confidence, status enum `pending|verified|needs_review|rejected`, ai_raw jsonb, reviewed_by, reviewed_at, created_at).
- `verification_screenshots` (id, request_id, user_id, slot enum, storage_path, ai_extraction jsonb, created_at).
- Add to `user_profiles`: `trader_type`, `onboarding_status` (`not_started|in_progress|pending_verification|verified`), `onboarding_step`, `trial_started_at`.
- Add `admin` value to existing `app_role` enum (for future admin queue).
- Full GRANTs + RLS (`auth.uid() = user_id` for own rows, admin role can read all).
- Private Storage bucket `verification-screenshots` with per-user folder RLS.

## 5. Edge function

`verify-trading-account/index.ts` — JWT-validated, Zod-validated body `{ request_id }`. Loads the 3 screenshots from Storage, calls Lovable AI Gateway with vision, writes extractions back, updates request status. Uses existing `LOVABLE_API_KEY`.

## 6. Coming Soon placeholders

Stub pages (auth-gated, "Coming soon — launching with onboarding GA" card):
- `/risk-suite` (with the 9 calculator names listed)
- `/community` (free feed + link to existing Telegram community URL)
- `/coach` (Claude Intelligence Engine teaser)
- `/academy` (already exists or stub if not)

Sidebar items added with `Soon` badge.

## 7. Out of scope this pass

- Real Stripe price IDs for $75/$475 (button is stub).
- Admin queue UI for `needs_review` (table exists, UI later).
- Daily/Weekly AI reviews (Claude layer).
- Risk Suite calculator logic.
- Community feed backend.

## Technical notes

- All new colors via existing gold tokens in `index.css`; no raw hex in components.
- New files: `src/pages/Onboarding.tsx`, `src/components/onboarding/*` (TraderTypeStep, PersonalBrokerStep, PropTrialStep, VerificationUploadStep, VerificationStatus), `src/components/landing/v2/*`, `supabase/functions/verify-trading-account/index.ts`, 4 stub pages.
- Edited: `src/App.tsx` (routes + onboarding gate), `src/pages/auth/Signup.tsx` (copy + redirect), `src/components/RequireAuth.tsx` (onboarding gate), `src/pages/Index.tsx` (new landing), `src/components/app-shell/AppSidebar.tsx` (placeholder items).
- One migration file for tables + bucket policies.
