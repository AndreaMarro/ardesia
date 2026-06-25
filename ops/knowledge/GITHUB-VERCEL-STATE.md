# GITHUB-VERCEL-STATE
last-verified: 2026-06-25
verified-by: gh api + vercel CLI + ssh git firsthand

## Repos (github AndreaMarro)
- lessonos: auto/main 20560ec (pushed; F2a + F2b served-SHA gate; graph-lint-dup removed). github==local. origin/auto/main 9fac811 = STALE OLD remote (ignore; use remote "github").
- ardesia (monorepo): main 9b7047ad; this session branch = session/long-2026-06-25.
- ardesia-studio: github auto/main f881a78 ; LOCAL maestro-studio 899a350 -> DIVERGENT (local 332 commits/309 files AHEAD of f881a78, ancestor 3d52a78 2026-06-18; github auto/main itself 55 behind main). ~6 days Impeccable work unpushed. T3 = GATE-ANDREA (push needs target-branch decision). See ADR-STUDIO-LINEAGE-UPDATE-2026-06-25.
- ardesia-vault: github repo exists; MacBook local copy has NO git remote (Syncthing-synced).
- elab-tutor: open PRs #194-200 mostly CI-RED; #198 mixed (latest mostly green).

## Vercel (team andreas-projects-6d4e9791)
- api-vercel PROD = Error+404 (vercel.json functions block; LOCAL vercel.json ALREADY FIXED, not redeployed). BUT Ready Preview neaicikfq boots FULL moat (moat_wired, segments 161), only SSO-gated. Unblock = attach custom-domain (all_except_custom_domains exempts) OR server-side bypass-proxy (no secrets in bundle). T1 = GATE-ANDREA. SECURITY: elab-tutor VITE_SESSION_SECRET/VITE_ADMIN_PWD_HASH/VITE_ACCESS_HASH/VITE_ELAB_API_KEY browser-inlined. See ADR-AUTH-BROWSER-VERCEL-UPDATE-2026-06-25.
- ardesia-lavagna=200, ardesia-workspace=200 (stale SPAs serving). elab-tutor=www.elabtutor.school.

Deep: ~/ardesia-vault/REALITY-REVERIFY-2026-06-25, ADR-STUDIO-LINEAGE, ADR-AUTH-BROWSER-VERCEL.
