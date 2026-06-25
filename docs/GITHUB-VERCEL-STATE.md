# GITHUB + VERCEL STATE (one page)

Source: WF1 GitHub deep audit + Vercel deep audit (read-only, 2026-06-25). Combined current state.

## GitHub — current state

- **7 repos** (all private, owner `AndreaMarro`): 3 canonical code (`ardesia`, `lessonos`, `ardesia-studio`), 3 support (`ardesia-vault`, `ardesia-tools`, `ardesia-wiki`), 1 legacy product (`elab-tutor`).
- **Latest commits:** ardesia `2b7c08e`, lessonos `auto/main` `20560ec`, ardesia-studio `839e009` (auto/main `f881a78`).
- **Open PRs (canonical):** ardesia #1 (draft, CLEAN), lessonos #3 (BLOCKED), ardesia-studio #2 (CLEAN, stale). elab-tutor: 14 stale PRs (graveyard) — #198 is the green-able keystone.
- **Branch protection:** only 2 of 7 default branches protected — `ardesia-studio/main` (status check `gate`, strict=false, enforce_admins=false) and `elab-tutor/main` (req reviews=0, no status checks → effectively weak). The other 5 (incl. canonical `lessonos/auto/main` and `ardesia/main`) are **UNPROTECTED**.
- **3 local-only tech branches** (on mac-mini, absent on GitHub): `lessonos/fix/auth-validator-flag-gated`, `lessonos/feat/mcp-stdio-transport`, `ardesia/ci/engine-sync-guard`.
- **Lineage trap:** lessonos & ardesia-studio origin = local bare `/Users/progettibelli/*.git`; GitHub is a secondary push remote → GitHub lags by design. ardesia origin = GitHub directly.
- **Studio divergent lineage:** mini `auto/main` `899a350` ≠ GitHub `auto/main` `f881a78`; mini work pushed as `studio/consolidate-2026-06-25` (`899a350`).

## Vercel — current state

- **ardesia-api-vercel** (moat read-path): prod ● **Error → 404 DEPLOYMENT_NOT_FOUND** (prod deploy `ct10aohku` failed build: `functions:index.py` matched no `api/` dir). vercel.json fix is **on-disk only**, never redeployed to prod. Working build exists as preview `neaicikfq` (● Ready) but **SSO-gated** (no custom domain → all previews gated).
- **ardesia-lavagna / ardesia-workspace:** static, public 200, ● Ready.
- **elab-tutor:** `www.elabtutor.school` public 200, git-linked auto-deploy from `main`; exposes `VITE_*` secrets in client bundle.

## Combined flags

| flag | severity | location |
|---|---|---|
| Moat API prod is 404 (failed build; fix on-disk-only) | HIGH | Vercel ardesia-api-vercel |
| `VITE_*` secrets browser-readable in elab-tutor bundle | HIGH (security) | Vercel elab-tutor env |
| No branch protection on canonical `lessonos/auto/main` + `ardesia/main` | MED | GitHub |
| 3 tech branches local-only (not durable) | MED | mac-mini |
| Studio divergent lineage (auto/main stale on GitHub) | MED | GitHub ardesia-studio |
| elab-tutor 815 branches + 14 stale PRs (hygiene debt) | MED | GitHub elab-tutor |
| No README/docs in vault/tools/wiki; no docs/ in studio | LOW | GitHub |
| ardesia-wiki default branch `master` (inconsistent) | LOW | GitHub |
| Lineage trap: GitHub lags mini by design (lessonos/studio) | INFO | mac-mini origins |

## One-line status

GitHub canonical lines are healthy but **unprotected and partly local-only**; the **Vercel moat API is down in prod (404)** with the fix staged on-disk only; the biggest security item is **browser-exposed `VITE_*` secrets** in elab-tutor. Nothing here is blocked by code — every remediation is a gate-Andrea action (see NEXT-GATES.md / OPEN-DECISIONS.md).
