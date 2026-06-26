# Deployment Map — Ardesia / ELAB

> **Dated 2026-06-26.** Every row verified firsthand (Claim → Evidence). Read-only audit, no mutations. Secrets referenced by name/presence only.

## 1. Surface table

| Surface | Host | URL | Auth | State |
|---|---|---|---|---|
| **served :8200** (lessonos API / moat) | mac mini (`progettibelli@100.124.198.59`, Tailscale) via **cloudflared quick-tunnel** | `legislature-poetry-financing-approved.trycloudflare.com` → `localhost:8200` | **AUTH_STRICT armed** — junk-Bearer=**401**, no-auth=**401** (`LESSONOS_AUTH_STRICT=1`) | **UP**, `git_sha=98ac0f4` (==auth/main), corpus=`served`/**1224 segments**. Binds `*:8200` (tailnet, auth-gated). **STOP sentinel present**. |
| **web moat** (ardesia-api-vercel) | Vercel `andreas-projects-6d4e9791` | `https://ardesia-api-vercel.vercel.app` | **Public** on alias (`/health`=200, `/docs`=200); **immutable URLs SSO-gated** (302) | **Ready** `7ren954yv` (24h). Apex `/`=404. corpus=`lessonos`/**4 segments (SMALL** vs served 1224). |
| **elab-tutor** (frontend) | Vercel `andreas-projects-6d4e9791` | `https://www.elabtutor.school` (apex→307→www) | **Public** (200) | **Ready** `o2xxl8j4q` (2h, == #201 merge + admin rotation). |
| **elab edge fns** (Supabase) | Supabase (14 fns incl. `unlim-chat`) | invoked from elab frontend | Supabase JWT / fn-level | **NOT auto-deployed** — `deploy.yml`=Vercel only, no `supabase functions deploy` in any workflow → `unlim-chat` **NOT yet redeployed**. |
| **AgentMemory :3111** | mac mini (`iii` engine, PID 49315) | `http://127.0.0.1:3111/agentmemory/*` via **SSH tunnel** | localhost-bound | **UP**, circuit-breaker `closed`. Binds **`127.0.0.1` only**; MacBook reaches via `ssh -N -L 127.0.0.1:3111:localhost:3111`. |

## 2. 2026-06 session history

| # | Event | Evidence (SHA) |
|---|---|---|
| 1 | lessonos auth-strict armed | PR #4 `d1985490`; junk-Bearer→401 live |
| 2 | lessonos MCP stdio merged | PR #5 `98ac0f4` == served git_sha == auth/main |
| 3 | web prod fixed (vercel.json @vercel/python + /tmp SQLite) | Ready `7ren954yv` superseded Error `ct10aohku` |
| 4 | elab #198 merged (CI unblock) | `d3589ac6` (06-25) |
| 5 | elab #201 merged (X-Elab-Api-Key theater removal) | `4760e2be` == elab main HEAD (06-26) |
| 6 | elab admin pwd rotated (`VITE_ADMIN_PWD_HASH`) | elab redeploy `o2xxl8j4q` (2h) |

**Open/not done:** 6 elab PRs OPEN (#194/195/196/197/199/200); unlim-chat Supabase edge NOT redeployed (manual `supabase functions deploy` needed); Vercel moat 4 seg vs served 1224.

Full doc at `docs/DEPLOYMENT-MAP.md` (absolute: `/Users/andreamarro/VOLUME 3/docs/DEPLOYMENT-MAP.md`) — includes topology ASCII diagram + operational notes (launchd services, ephemeral tunnel caveat, secrets-by-name-only).