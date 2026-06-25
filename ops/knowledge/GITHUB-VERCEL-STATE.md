# GITHUB-VERCEL-STATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — GitHub deep + Vercel deep

## GitHub — 7 repos (owner AndreaMarro)

| repo | default | #branches | open PRs | protection (default) | latest |
|---|---|---|---|---|---|
| ardesia | main | 2 | 1 (#1 draft CLEAN) | NONE (404) | `2b7c08e` |
| lessonos | auto/main | 6 | 1 (#3 BLOCKED) | NONE (404) | `20560ec` |
| ardesia-studio | main | 6 | 1 (#2 CLEAN) | `gate` check (strict=F, enforce_admins=F) | `839e009` |
| ardesia-vault | main | 1 | 0 | NONE (404) | `f0145f6` |
| ardesia-tools | main | 1 | 0 | NONE (404) | `0f0a2ba` |
| ardesia-wiki | **master** | 1 | 0 | NONE (404) | `05b924f` |
| elab-tutor | main | **815** | **14** | weak (req-reviews=0, no checks) | `edb11e8` |

### Flags
- **No branch protection** on 5/7 defaults, incl. canonical lessonos/auto/main and ardesia/main → factory line force-pushable.
- **No README/docs** in ardesia-vault, ardesia-tools, ardesia-wiki; **no docs/** in ardesia-studio.
- ardesia-wiki default branch is `master` (inconsistent).
- elab-tutor branch explosion: ~700 `mac-mini/iter36-user-sim-*` + ~33 `auto/test-*` + 8 `task-t_*` = prunable; 14 stale PRs (PR graveyard).
- **Lineage trap**: lessonos & maestro-studio origin = local bare `/Users/progettibelli/*.git`; GitHub secondary → GitHub lags by design.

### Open PRs
- ardesia #1 (draft, CLEAN) — Knowledge Fabric (ops/knowledge) + GSD context-packet. head `session/long-2026-06-25`.
- lessonos #3 (BLOCKED, MERGEABLE) — ratifica auto/main→main (12 commits). Block likely on base/main side (no protection on auto/main).
- ardesia-studio #2 (CLEAN) — ratifica auto/main→main (3 commits, stale).

## Vercel — team andreas-projects-6d4e9791 (auth andreamarro), 11 projects

| project | prod | preview | git-linked | serves |
|---|---|---|---|---|
| ardesia-api-vercel | ● Error → **404 DEPLOYMENT_NOT_FOUND** | `neaicikfq` ● Ready, **SSO-gated** | no (CLI-manual) | moat read-path API |
| ardesia-lavagna | 200 | Ready | no | static lavagna UI |
| ardesia-workspace | 200 | Ready | no | static workspace UI |
| elab-tutor | `www.elabtutor.school` 200 | mixed | **yes** (main) | tutor app, 24 env |

### api-vercel 404 root cause (firsthand)
Prod deploy `ct10aohku` FAILED at build: `Error: The pattern "index.py" defined in 'functions' doesn't match any Serverless Functions inside the 'api' directory.` Entrypoint `index.py` is at repo root, **no `api/` dir** → zero functions → alias 404. NOT a routing issue; a failed prod build.

### vercel.json fix = ON-DISK ONLY
Local `…/ardesia-api-vercel/vercel.json` now `{ "$schema": "https://openapi.vercel.sh/vercel.json" }` (functions block removed → FastAPI auto-detected). This built the working preview `neaicikfq` (λ index 13.54MB) but was **never redeployed to prod**. Source dir intact + project-linked (`prj_9nkDJqNncHhbYoVVeNPwL6hMVcN6`) → a SAFE `vercel deploy` (no --prod) rebuilds cleanly.

### T1-web options
(a) attach custom/exempt domain (SSO exempts custom domains → public, cleanest); or (b) thin same-origin proxy injecting a protection-bypass token (keeps AI_GATEWAY/TURSO secrets server-side). Real prod fix = authorized `vercel --prod`.

### 🔴 Security flag (gate-Andrea)
elab-tutor exposes `VITE_SESSION_SECRET`, `VITE_ADMIN_PWD_HASH`, `VITE_ACCESS_HASH`, `VITE_ELAB_API_KEY` as `VITE_`-prefixed → inlined into the client bundle = browser-readable. Review/rotate.

## Gate-Andrea
- Branch protection on lessonos/auto/main + ardesia/main.
- Authorized `vercel --prod` redeploy of ardesia-api-vercel.
- Attach exempt domain to api-vercel.
- Rotate the 4 VITE_ elab-tutor secrets.
- Prune ~700 elab-tutor stale branches; triage 14 stale PRs.
