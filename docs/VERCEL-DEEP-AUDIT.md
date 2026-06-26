# Vercel Deep Audit — 2026-06-26

Read-only audit via LOCAL `vercel` CLI (v53.4.0, user `andreamarro`, team `andreas-projects-6d4e9791`). No deploys, no mutations. Secret values never printed.

## TL;DR (Claim → Evidence backed)
- **Why API prod was 404:** failed prod build `ct10aohku` (5d) errored at build time — `The pattern "index.py" defined in functions doesn't match any Serverless Functions inside the api directory`. The old config used `functions: {index.py}`, which Vercel resolves relative to `api/`; `index.py` is at repo root → zero functions matched → build Error → prod alias served nothing. (Memory's "empty vercel.json/no functions" is close but the precise error is an *unmatched function pattern*.)
- **Is the fix deployed? YES.** Prod = `7ren954yv` ● Ready (24h), build `λ index.py (13.59MB)`. On-disk `vercel.json` switched to `builds`+`@vercel/python`+`includeFiles:{lessonos.db,assets/**,lessonos/**}`. Public alias `/health`=200 (`corpus.segments=4`, SMALL), `/docs`=200, `/`=404 (FastAPI no-route, app up — NOT prod-down).
- **SSO gating:** ardesia-api-vercel **immutable deployment URLs** are SSO-gated (302 → vercel.com/sso-api + `_vercel_sso_nonce`), but its **public project alias is NOT gated** (public health works). **elab-tutor NOT gated anywhere** tested (custom domain, git-main alias, immutable previews all 200). lavagna/workspace public aliases 200.
- **Custom-domain/proxy:** API public read access already works via public alias; no domain/proxy needed. Sharing a *specific immutable* API URL without login requires disabling protection / bypass token / custom domain = GATE.

## Projects (4 audited + 2 probed)
| Project | Prod | State |
|---|---|---|
| ardesia-api-vercel | ardesia-api-vercel.vercel.app | ● Ready `7ren954yv` (1 stale Error `ct10aohku`) |
| elab-tutor | www.elabtutor.school | ● Ready `o2xxl8j4q` (4 fns: compile/nanor4, kokoro, tts, voxtral) |
| ardesia-lavagna | ardesia-lavagna.vercel.app | ● Ready `q608azxs4` |
| ardesia-workspace | ardesia-workspace.vercel.app | ● Ready `mb18unja4` |

API env var names only (values Encrypted, never printed): `TURSO_AUTH_TOKEN`, `TURSO_DATABASE_URL` (Prod/Preview/Dev), `AI_GATEWAY_API_KEY` (Prod).

## Safe actions WITHOUT Andrea (read-only, used here)
`vercel projects ls`, `vercel ls`, `vercel inspect [--logs]`, `vercel domains ls`, `vercel env ls` (names), public-alias curl probes.

## VERCEL-ACTION-PLAN
1. Leave prod as-is — `7ren954yv` Ready, public endpoints 200. No action.
2. (Optional) Delete stale Error build `ct10aohku` — cosmetic; destructive delete = **GATE-Andrea**.
3. (Optional) Disable Deployment Protection / mint bypass token to share API previews — config = **GATE-Andrea**.
4. API corpus `segments=4` (SMALL) — if a fuller corpus is intended, content+prod redeploy = **GATE-Andrea**.
5. `AI_GATEWAY_API_KEY` validity for `/v1/packages` LLM paths — read-only probe safe, rotate = GATE.
6. elab-tutor needs no Vercel-side action (edge unlim-chat redeploy is Supabase, out of Vercel scope).

**Bottom line:** API prod healthy, vercel.json fix is live; only open items are optional cleanup + the 4-segment corpus question, both gated. Nothing on Vercel is currently broken.

Full doc written to `/Users/andreamarro/VOLUME 3/docs/VERCEL-DEEP-AUDIT.md`.