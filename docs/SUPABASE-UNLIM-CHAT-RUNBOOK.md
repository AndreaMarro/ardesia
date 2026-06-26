Produced `/Users/andreamarro/VOLUME 3/docs/SUPABASE-UNLIM-CHAT-RUNBOOK.md` — a PREPARED, DO-NOT-EXECUTE, gate-Andrea runbook for the F1-live `unlim-chat` redeploy. Every claim is backed by a firsthand check (Claim→Evidence below).

## Key findings that shaped the runbook

**The order-criticality has a precise mechanism I verified in code.** `verifyElabApiKey` in `supabase/functions/_shared/guards.ts` is **fail-CLOSED in production**: if `ELAB_API_KEY` is missing AND `DENO_DEPLOYMENT_ID` is set (Supabase Edge runtime), it returns 401 `server_misconfigured`; and if the client omits `X-Elab-Api-Key` it returns 401 `missing X-Elab-Api-Key header`. It fail-OPENs only in local dev. So the **live (old) function 401s if you delete EITHER var before redeploying**. Correct sequence is fixed: deploy new edge (stops checking) → verify → only THEN delete vars. The runbook documents server-secret-first then client-var, with re-verify between.

**Two distinct 401 layers** — I separated them so the integration test is unambiguous: the visible `UNAUTHORIZED_NO_AUTH_HEADER` 401 is the Supabase **gateway** anon-key check (always present, unrelated to #201); the `verifyElabApiKey` 401 is the **app layer** that only fires after the gateway passes. The "verify no 401" step targets the app layer (200 with anon key, no `X-Elab-Api-Key`).

**Live state confirms "not yet redeployed":** `main` HEAD == PR#201 merge SHA `4760e2be…` and main's `unlim-chat` no longer imports `verifyElabApiKey`, but there is **no auto-deploy workflow** (grep of `.github/workflows/` for `functions deploy` = 0 hits), so the deployed function still runs the old gate — exactly why the runbook is needed.

## Runbook structure
0. Preconditions (on merged code, secret present, `npx supabase` since CLI not global) → 1. Local serve + client exercise (body needs `message`+`sessionId` per `validateChatInput`) → 2. `supabase functions deploy unlim-chat` (first destructive step) → 3. Live integration test (200 without header proves gate gone) → 4. Delete `ELAB_API_KEY` (Supabase) then `VITE_ELAB_API_KEY` (Vercel, all envs) → 5. Verify no 401 → 6. Rollback (re-deploy prior edge / restore vars + Vercel redeploy). Plus #201 diff reference, Phase-2 (real per-user JWT + RLS audit) scope note, and a firsthand-evidence appendix.

Project ref: `euqpdueopmlllqjmqnyb` (name `elab-unlim`). Client senders of the dead header: `src/services/{api,voiceService,multimodalRouter,fumettoGeminiService}.js`.

Note: PostToolUse semgrep hook emitted the known-innocuous `No SEMGREP_APP_TOKEN` warning — file wrote successfully (confirmed by harness). All steps are gate-Andrea; nothing was executed or mutated (read-only).