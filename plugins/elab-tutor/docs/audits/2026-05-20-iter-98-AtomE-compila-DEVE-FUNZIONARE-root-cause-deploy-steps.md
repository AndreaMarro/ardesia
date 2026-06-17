# Iter 98 Atom E — Compila "DEVE FUNZIONARE" root cause + Cloud deploy steps

> **Date**: 2026-05-20 iter 98
> **Andrea mandate verbatim**: "questo DEVE FUNZIONARE" (Compila button #compile-home prod)
> **Status**: code-side FIX shipped (Vercel proxy) — ONE Andrea deploy action remaining
> **Cross-check**: Codex BG Pattern V GPT-5.5 high (running)

## Root cause — why Compila fails prod today

Andrea clicked "Compila" on `https://elab-builder.vercel.app/#compile-home`. The button does NOT produce a working Arduino Nano R4 binary. Empirical diagnosis:

### Compile fallback chain (`src/services/api.js` compileCode)

| Priority | Endpoint | Renesas Nano R4 support | Available prod? |
|---|---|---|---|
| 0 (iter 98 NEW) | `/api/compile/nanor4` Vercel proxy | ✅ (proxies Cloud Render) | ✅ shipped this PR — returns 503 until Render deployed |
| 1 | `CLOUD_COMPILE_URL` direct | ✅ (Cloud Render) | ❌ `VITE_ELAB_CLOUD_COMPILE_URL` env unset → null → SKIPPED |
| 2 | `compile-proxy` Supabase Edge → n8n | ❌ **n8n legacy AVR core only** | ✅ reachable BUT wrong target |
| 3 | `COMPILE_URL` standalone | ❌ AVR | conditional |
| 4 | `localhost:8765` local ELAB Agent | ✅ (arduino-cli + Renesas core 1.5.3) | ❌ no local agent on prod Vercel |

**The failure**: prod browser has NO local agent. Chain falls to `compile-proxy` → `n8n.srv1022317.hstgr.cloud/webhook/compile`. The compile-proxy Edge Function forwards `{ code }` ONLY — **no `fqbn` parameter**. n8n compile webhook uses legacy AVR core. Andrea's `arduino:renesas_uno:nanor4` FQBN is silently ignored. Result: either AVR binary (wrong chip — Nano R4 is Renesas RA4M1 ARM Cortex-M4, NOT ATmega328) OR compile error.

Andrea iter 94 PM mandate verbatim: "Non AVR. Non avr8js come prova Nano R4." The current prod chain VIOLATES this.

### What ALREADY works (verified)

`infra/cloud-compile/` Render service is **deploy-ready**:
- `Dockerfile`: node:22-bookworm + arduino-cli 1.4.1 + `arduino:renesas_uno@1.5.3` core + `arduino:avr@1.8.7` core ✅
- `server.js`: Express + POST /compile + GET /health + authMiddleware (x-elab-api-key) + rateLimit 10/min + `arduino:renesas_uno:nanor4` in ALLOWED_BOARDS ✅
- `render.yaml`: web service Docker Frankfurt Starter $7/mo + 5 envVars + healthCheck /health ✅
- `openapi.yaml`: 966 LOC contract ✅

**The ONLY blocker**: `infra/cloud-compile/` has never been deployed to Render. CLAUDE.md iter 77 PHASE 4: "Render deploy still NOT done".

## Code fix shipped this PR (iter 98 Atom E)

### NEW `api/compile/nanor4.js` — Vercel serverless secure proxy

Resolves code-reviewer iter 93 atom 32 CRITICAL-1 (`/api/compile/nanor4` referenced in IdeShell CompileButton.tsx MA never existed). Implements Andrea iter 94 PM mandate verbatim "`/api/compile/nanor4` o proxy sicuro" + "no chiave segreta nel browser come soluzione finale".

Architecture (secure):
```
browser POST /api/compile/nanor4 { sketchCode, fqbn, boardId }
  → Vercel serverless reads process.env.ELAB_CLOUD_COMPILE_URL (server-only,
    NO VITE_ prefix → never in client bundle)
  → forwards POST ${ELAB_CLOUD_COMPILE_URL}/compile + header
    x-elab-api-key: process.env.ELAB_CLOUD_COMPILE_API_KEY (server-only)
  → returns Cloud Render { ok, hexBase64, artifactSize, stdout, stderr }
```
Same-origin → no CORS preflight + no client key exposure.

Behavior:
- `ELAB_CLOUD_COMPILE_URL` unset → honest 503 `cloud_compile_not_configured` → client falls through legacy chain (ZERO regression)
- configured → forwards with server-side key, 45s timeout, 100KB sketch cap

### `src/services/api.js` compileCode wired

- Priority-0 chain entry: `/api/compile/nanor4` (httpsBrowser gated)
- `isCloudShape` flag extends `isCloudRender` — same `{sketchCode, fqbn}` body + `{ok, hexBase64}` response mapping for the proxy
- Legacy chain UNCHANGED below — pure additive, zero regression

### Tests

`tests/unit/api/compile-nanor4-proxy.test.js` — **12/12 PASS**:
- method gate 405
- honest 503 when URL unset
- input validation (missing/empty sketchCode 400, >100KB 413)
- upstream forwarding + x-elab-api-key injection
- fqbn default canonical
- legacy `code` alias
- upstream error propagation (401)
- non-JSON handling (502)
- timeout 504
- generic error 500

## Andrea action — make Compila work prod (15 min)

ONE deploy + 2 env vars. After this, Compila button produces real Nano R4 binary.

### Step 1 — Deploy `infra/cloud-compile/` to Render (~10 min)

1. Render dashboard → **New** → **Web Service**
2. Connect GitHub repo `elab-tutor`
3. **Root Directory**: `infra/cloud-compile`
4. **Runtime**: Docker (auto-detected from Dockerfile)
5. **Plan**: Starter $7/mo (needs ~500MB disk for Renesas core toolchain)
6. **Region**: Frankfurt (EU GDPR consistent ELAB stack)
7. **Health Check Path**: `/health`
8. **Auto Deploy**: yes
9. Render auto-generates `ELAB_CLOUD_COMPILE_API_KEY` (per render.yaml `generateValue: true`)
10. Deploy → wait ~5-8 min (Docker build installs arduino-cli + 150MB Renesas core)
11. Verify: open `https://<render-service>.onrender.com/health` → expect `{ "core_renesas_uno_installed": true }`

### Step 2 — Vercel env vars (~3 min)

Vercel dashboard → elab-builder project → Settings → Environment Variables. Add for **Production + Preview**:

| Key | Value | Notes |
|---|---|---|
| `ELAB_CLOUD_COMPILE_URL` | `https://<render-service>.onrender.com` | server-side, NO `VITE_` prefix |
| `ELAB_CLOUD_COMPILE_API_KEY` | `<copy from Render dashboard env>` | server-side, NO `VITE_` prefix |

**Critical**: NO `VITE_` prefix. These are server-side only (read by `api/compile/nanor4.js` serverless). `VITE_` prefix would bundle them into client JS = security leak (Andrea iter 94 mandate "no chiave segreta nel browser").

### Step 3 — Vercel redeploy (~2 min)

Vercel dashboard → Deployments → Redeploy latest. OR push any commit to main → auto-deploy.

### Step 4 — Verify Compila works

1. Open `https://elab-builder.vercel.app/#compile-home`
2. C++ tab → default Blink sketch
3. Click **Compila**
4. Expect: "Compilato per Arduino Nano R4" + artifact size (e.g. ~39048 byte flash)
5. Network tab → POST `/api/compile/nanor4` → 200 (NOT 503)

## What this does NOT fix (honest scope)

- **Physical upload** ("Carica sul kit fisico"): WebUSB DFU still requires real Nano R4 USB-connected. Compile produces the binary; flash needs hardware. Andrea/Tea/Riccardo hardware UAT separate.
- **iter 93 atoms 32/33/34**: IdeShell + CodePalette + unlimScreenAgent still NO-GO/REVIEW per code-reviewer (PR #121 + iter 97 audit). This PR fixes the COMPILE BACKEND only, used by current LIVE HomeCompileEntry route.
- **n8n compile-proxy**: left as legacy fallback. Could be enhanced to forward fqbn iter 99+ but n8n upstream has no Renesas core anyway — Cloud Render is canonical.

## Anti-inflation G45 mandate iter 98 enforced

- NO claim "Compila WORKS prod" — code-side fix shipped, MA needs Andrea Render deploy + Vercel env (Step 1-3). Until then proxy returns honest 503.
- NO claim "cross-compile LIVE" — chain ready, deploy pending.
- NO claim "hardware verified" — physical flash needs Nano R4 USB (separate UAT).
- Verified empirical: 12/12 proxy tests PASS + build.

## Cross-link

- `api/compile/nanor4.js` — NEW Vercel serverless proxy (iter 98 Atom E)
- `src/services/api.js` compileCode — priority-0 wiring `/api/compile/nanor4`
- `infra/cloud-compile/{Dockerfile,render.yaml,server.js,openapi.yaml}` — Render service deploy-ready
- `supabase/functions/compile-proxy/index.ts` — legacy n8n proxy (AVR-only, fallback)
- code-reviewer iter 93 atom 32 CRITICAL-1 — `/api/compile/nanor4` referenced non-existent → RESOLVED this PR
- `tests/unit/api/compile-nanor4-proxy.test.js` — 12/12 PASS

---

**Andrea action richiesta**: execute Step 1-3 (Render deploy + 2 Vercel env vars + redeploy) → Compila works prod. ~15 min total. Then Step 4 verify.
