# REGRESSIONS

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output)
Purpose: record live regressions / drift so future sessions do not re-discover them cold.

---

## R1 — F0→P0-2 correction: web-deploy drift was ACTIVE, not latent
**Claim corrected:** the ardesia-api-vercel prod 404 is sometimes filed as a latent/config issue waiting on a redeploy. WF1 firsthand evidence shows the drift was **ACTIVE**: the production deploy `ct10aohku` is in state ● **Error** — it FAILED to build (`The pattern "index.py" defined in 'functions' doesn't match any Serverless Functions inside the 'api' directory`). The prod alias resolves to a deployment with zero servable functions → live 404 DEPLOYMENT_NOT_FOUND **right now**, not a dormant risk.
**Why it matters:** the moat API has been *serving 404 to real traffic*, while the working build (preview `neaicikfq`, ● Ready) is hidden behind SSO. The fix exists on-disk only and was never redeployed. → escalate F0 to **P0-2** (active outage), not a backlog config-tidy.
**Fix:** authorized `vercel --prod` of the current on-disk tree (gate-Andrea); the vercel.json fix is already correct.

## R2 — vercel.json fix is on-disk only (not deployed)
Local `vercel.json` is now schema-only (functions block removed). It built the working preview but was **never promoted to prod**. Regression risk: a future session may assume "fixed" because the file looks right on disk. It is NOT live until `vercel --prod`.

## R3 — GitHub lag (lineage trap) masquerades as "no progress"
lessonos/studio commit to local bare origins; GitHub is secondary. A session reading GitHub alone will under-report factory progress and may re-do work. Always check the local bare HEAD. (See FACTORY-STATE / DECISIONS D6.)

## R4 — ELAB unit-test cluster drift
`principioZeroCompliance`, `compiler`, HomePage component tests fail across feature branches from supabase mock-chain gaps (`.ilike`/`.eq not a function`), `Deno is not defined` under jsdom, and drifted assertions. #198 repairs this (470 green). PRs that predate #198 still show the cluster — rebase, don't re-debug.

## R5 — ELAB governance Rule 5 trips silently on supabase edits
Editing `src/supabase` without a CHANGELOG.md entry hard-fails CI (Rule 5) on #199/#197/#196/#194/#200. Recurring footgun. Add CHANGELOG entry as part of any supabase-touching PR.

## R6 — 🔴 elab-tutor secrets browser-inlined
`VITE_SESSION_SECRET`, `VITE_ADMIN_PWD_HASH`, `VITE_ACCESS_HASH`, `VITE_ELAB_API_KEY` are `VITE_`-prefixed → inlined into the client bundle = browser-readable. Any real secret among them is effectively public. Rotate (gate-Andrea). This is a standing security regression until rotated.

## R7 — no branch protection on factory lines
lessonos/auto/main and ardesia/main are UNPROTECTED → force-push to the factory line is possible. Standing risk until protection added (gate-Andrea).
