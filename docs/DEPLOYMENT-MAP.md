# DEPLOYMENT-MAP

Source: WF1 Vercel deep audit (read-only, no deploy/promote, 2026-06-25). Team `andreas-projects-6d4e9791`, auth `andreamarro`. 11 projects total; ARDESIA-relevant ones below.

## Project → deploy → domain → status

| Project | Prod URL | Prod state | Preview | Git-linked | Domain / SSO | Serves |
|---|---|---|---|---|---|---|
| **ardesia-api-vercel** | `…-andreas-projects-….vercel.app` | ● **Error** → alias **404 DEPLOYMENT_NOT_FOUND** | `neaicikfq` ● Ready (SSO-gated) | No (CLI-manual; source dir not a git repo) | no custom domain; ssoProtection exempts custom domains only | read-only moat API (`lessonos.api.app:app`, bundled assets, AI Gateway egress) |
| ardesia-lavagna | `ardesia-lavagna.vercel.app` → 200 | ● Ready | Ready | No (manual) | public alias | static (lavagna UI) |
| ardesia-workspace | `ardesia-workspace.vercel.app` → 200 | ● Ready | Ready | No (manual) | public alias | static (workspace UI) |
| elab-tutor | `www.elabtutor.school` → 200, `/health` → 200 | ● Ready | mixed | **Yes** (auto-deploy `main`) | custom domain `elabtutor.school`; SSO = None (public) | ELAB tutor app (24 env, `VITE_*`) |

Other projects (out of ARDESIA scope, not deeply audited): numeria-lab, crea-un-app-html-javascript-che, elab-builder-blockly-definitivo, elab-builder-slice1a, elab-builder-hotfix, studiaasino, stress-test.

## Which project serves what

- The ARDESIA **moat read-path** lives in `ardesia-api-vercel` (currently 404 in prod).
- `ardesia-lavagna` and `ardesia-workspace` are static front-ends (public 200).
- `elab-tutor` is the tutor app on the only custom domain (`elabtutor.school`); it tracks GitHub `main` and auto-deploys.

## ardesia-api-vercel prod 404 — root cause

The production deploy `ct10aohku` (`dpl_AGd19iGv4c8TZAEynEXQBubVZgGK`) **FAILED at build**:

```
Error: The pattern "index.py" defined in `functions` doesn't match any
Serverless Functions inside the `api` directory.
```

The entrypoint is `index.py` at repo root and there is **no `api/` directory**, so the old `functions` block in `vercel.json` matched zero functions → build error → zero deployed functions → the prod alias points at a deployment with no servable output, surfaced by Vercel as **DEPLOYMENT_NOT_FOUND / 404**. It is NOT a routing/missing-route issue; it is a **failed production build**.

## vercel.json fix — on-disk only

The fix is **on-disk only, never redeployed to prod**. Local `/Users/andreamarro/VOLUME 3/ardesia-api-vercel/vercel.json` is now:

```json
{ "$schema": "https://openapi.vercel.sh/vercel.json" }
```

(functions block removed → FastAPI auto-detected.) This fix was applied to the working preview `neaicikfq` (which DID build `index` λ functions, 13.54 MB), but prod still serves the broken `ct10aohku`.

## Which deploy is online

- **api-vercel:** the *production* deploy online is `ct10aohku` but it is ● Error (failed build → alias 404). The only working build is the *preview* `neaicikfq` (● Ready, SSO-gated).
- **lavagna / workspace / elab-tutor:** prod deploys all ● Ready / 200. elab-tutor tracks GitHub `main`.

## SSO gating

`ardesia-api-vercel` preview `neaicikfq` is SSO-gated: `/health` returns `302 → vercel.com/sso-api?...` with a `_vercel_sso_nonce` cookie. ssoProtection covers all deployments **except custom domains**; since api-vercel has no custom domain, every hash/preview URL is gated. lavagna / workspace / elab-tutor are public.

## Deployable tree (intact, project still linked)

`/Users/andreamarro/VOLUME 3/ardesia-api-vercel/` contains `index.py`, `requirements.txt`, `assets`, `lessonos`, `lessonos.db` and the fixed `vercel.json`. `.vercel/project.json` → `prj_9nkDJqNncHhbYoVVeNPwL6hMVcN6` (still linked). A `vercel deploy` (PREVIEW, no `--prod`) would rebuild cleanly without touching prod.

## What "T1 web" needs (make moat API public)

ONE of:
- **(a)** attach a custom/exempt domain to `ardesia-api-vercel` (ssoProtection exempts custom domains → public, no token, no proxy — cleanest), OR
- **(b)** a thin same-origin server-side proxy injecting a Vercel protection-bypass token (keeps `AI_GATEWAY_API_KEY`/`TURSO_*` server-side).

The real prod fix (clear the Error/404) requires an authorized `vercel --prod` redeploy of the current on-disk tree — **gate-Andrea**.

## Env var NAMES (values never accessed; from prior firsthand 2026-06-25 baseline — `vercel env ls` returned a "Custom Environment not found" CLI quirk this pass)

- ardesia-api-vercel (3): `TURSO_AUTH_TOKEN`, `TURSO_DATABASE_URL`, `AI_GATEWAY_API_KEY`.
- lavagna / workspace: 0 (static).
- elab-tutor (24): many `VITE_*`.

## 🔴 Security flag (gate-Andrea)

elab-tutor exposes `VITE_SESSION_SECRET`, `VITE_ADMIN_PWD_HASH`, `VITE_ACCESS_HASH`, `VITE_ELAB_API_KEY` as `VITE_`-prefixed env → **inlined into the client bundle at build time = browser-readable**. Any real secret among them is effectively public. Review / rotate.
