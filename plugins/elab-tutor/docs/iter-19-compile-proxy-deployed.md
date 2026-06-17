# Iter 19 P0 — compile-proxy Edge Function deployed

**Date**: 2026-04-28
**Status**: DEPLOYED + CORS verified production
**Author**: autonomous compile-proxy-opus iter 19
**Branch base**: `main` HEAD `e6f0159` (iter 18 close)

---

## 1. Edge Function deployed

| Field | Value |
| --- | --- |
| Function name | `compile-proxy` |
| Project ref | `euqpdueopmlllqjmqnyb` |
| Endpoint | `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy` |
| Source file | `supabase/functions/compile-proxy/index.ts` (~150 LOC Deno) |
| Verify JWT | `--no-verify-jwt` (compile is anonymous, matches `src/services/api.js` flow) |
| Region | `eu-central-2` (header `x-sb-edge-region`) |
| Runtime | `supabase-edge-runtime` (header `x-served-by`) |
| Deploy execution id | `fc13cc33-20a2-4c63-8d5a-afbc2ab845bd` |
| Deploy command | `SUPABASE_ACCESS_TOKEN=sbp_46e... npx supabase functions deploy compile-proxy --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt` |

Deploy log verbatim:

```
WARNING: Docker is not running
Uploading asset (compile-proxy): supabase/functions/compile-proxy/index.ts
Deployed Functions on project euqpdueopmlllqjmqnyb: compile-proxy
You can inspect your deployment in the Dashboard:
https://supabase.com/dashboard/project/euqpdueopmlllqjmqnyb/functions
```

### Behavior

- `OPTIONS` → 204 + CORS allow-list headers (preflight unblock).
- `POST { code: string }` → forward to `https://n8n.srv1022317.hstgr.cloud/webhook/compile`,
  return n8n body+status verbatim with CORS headers added.
- 400 `code_required` if body missing/non-string.
- 413 `payload_too_large` if `Content-Length` or `code.length` > 50 000.
- 405 if method not POST/OPTIONS.
- 502 `upstream_timeout` (30 s abort) or `upstream_error` on fetch failure.

### CORS allow-list

```
https://www.elabtutor.school
https://elabtutor.school
https://elab-builder.vercel.app
https://elab-tutor.it
https://www.elab-tutor.it
http://localhost:5173
http://localhost:3000
```

Origin not in allow-list → falls back to first entry (`https://www.elabtutor.school`).
This matches the existing `_shared/guards.ts` pattern used by all UNLIM Edge
Functions; no client behavior change for legit origins.

---

## 2. CORS verification (curl evidence)

### Test 1 — OPTIONS preflight

Command:
```bash
curl -i -X OPTIONS https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy \
  -H "Origin: https://www.elabtutor.school" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, x-elab-api-key"
```

Response (verbatim, headers truncated to relevant):
```
HTTP/2 204
access-control-allow-origin: https://www.elabtutor.school
access-control-allow-headers: Content-Type, Authorization, apikey, X-Elab-Api-Key, x-client-info
access-control-allow-methods: POST, OPTIONS
vary: Accept-Encoding, Origin
sb-request-id: 019dd41b-aec5-7023-a2ca-8ace5ff2f014
x-sb-edge-region: eu-central-2
```

Browser preflight will accept this — bug iter 18 unblocked.

### Test 2 — POST forwarded to n8n

Command:
```bash
curl -i -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy \
  -H "Origin: https://www.elabtutor.school" \
  -H "Content-Type: application/json" \
  -d '{"code":"void setup(){} void loop(){}"}'
```

Response (verbatim):
```
HTTP/2 200
access-control-allow-origin: https://www.elabtutor.school
content-type: application/json; charset=utf-8
sb-request-id: 019dd41b-b118-7296-b80c-304566534fe7

{"success":false,"hex":null,"errors":"Errore di compilazione","output":null}
```

The body is whatever n8n returned; we verified it matches a direct call to
`https://n8n.srv1022317.hstgr.cloud/webhook/compile` for the same payload —
the `success:false` is an n8n-side issue (orthogonal, out of scope iter 19),
NOT a proxy bug. Proxy is transparent.

### Test 3 — Validation 400

Command:
```bash
curl -X POST .../compile-proxy -H "Origin: https://www.elabtutor.school" \
  -H "Content-Type: application/json" -d '{}'
```

Response:
```
{"error":"code_required"}
```

### Test 4 — n8n parity check

Direct call `https://n8n.srv1022317.hstgr.cloud/webhook/compile` returns
`{"success":false,"hex":null,"errors":"Errore di compilazione","output":null}` —
identical to proxy. Proxy fidelity confirmed.

---

## 3. Integration path for `src/services/api.js`

**No client code change required.** The existing path at line 1192 already uses
`VITE_COMPILE_WEBHOOK_URL` AS-IS (no append). Switching the env var value from
the n8n direct URL to the proxy URL is enough.

Current behavior (`src/services/api.js:32`):
```js
const COMPILE_WEBHOOK = (import.meta.env.VITE_COMPILE_WEBHOOK_URL || '').trim() || null;
```

Used at line 1192:
```js
const result = await tryCompile(COMPILE_WEBHOOK, 'Backend webhook');
```

`tryCompile` POSTs `{ code }` JSON — exactly what the proxy expects.

---

## 4. Andrea Vercel env update — REQUIRED action

Switch the `VITE_COMPILE_WEBHOOK_URL` env on Vercel **Production + Preview** to:

```
VITE_COMPILE_WEBHOOK_URL=https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy
```

Steps:
1. Vercel dashboard → project `elab-builder` → Settings → Environment Variables.
2. Find `VITE_COMPILE_WEBHOOK_URL`.
3. Update value (overwrite previous n8n direct URL).
4. Apply to **Production** + **Preview** scopes.
5. Trigger redeploy (push commit OR `npx vercel --prod --yes`).

Optional rollback: revert env var to previous n8n direct URL — Edge Function
stays deployed but unused, no cleanup needed.

---

## 5. Verification post Vercel redeploy

After Andrea redeploys with the new env, verify CORS clean by re-running the
Playwright capstone smoke specs from iter 18:

```bash
npx playwright test tests/e2e/v3-cap5.spec.js
npx playwright test tests/e2e/v3-cap6.spec.js
npx playwright test tests/e2e/v3-cap7.spec.js
npx playwright test tests/e2e/v3-cap8.spec.js
```

Expected: **0 CORS errors** in browser console (`browser_console_messages` MCP
or DevTools Network tab). Compile request to
`https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy` returns
200 with `access-control-allow-origin: https://www.elabtutor.school`.

If the n8n upstream returns `success:false` (as observed in test 2/4 above),
that's a separate issue — fix n8n side OR investigate why a real Arduino sketch
fails compilation. Out of scope iter 19 (CORS unblock only).

---

## 6. Anti-regression

- ✅ `supabase/functions/compile-proxy/index.ts` is the only new file.
- ✅ Zero changes to `src/services/api.js` (Andrea decides Vercel switch).
- ✅ Zero changes to other Edge Functions (`unlim-chat`, `unlim-tts`, etc.).
- ✅ No npm dep added.
- ⊘ vitest + build NOT re-run (Edge Function deploy = no src changes touched
  by anti-regression hook; the Stop hook gate triggers on src build only).
- ✅ Existing CORS pattern reused from `_shared/guards.ts`
  `getCorsHeaders` for consistency (same allow-list structure, same headers).

---

## 7. Files refs iter 19

- `supabase/functions/compile-proxy/index.ts` — NEW ~150 LOC Deno handler.
- `docs/iter-19-compile-proxy-deployed.md` — this doc.

## 8. Activation iter 20 / next session

Andrea actions (~5 min):
1. Vercel env switch `VITE_COMPILE_WEBHOOK_URL` → proxy URL (above).
2. Redeploy Vercel.
3. Re-run Playwright capstone v3-cap5/6/7/8 → expect 0 CORS errors.
4. If n8n still returns `success:false` on real sketches, open iter 20 issue
   for n8n compile pipeline (orthogonal scope).

Score iter 19 close: **CORS production unblock SHIPPED + verified**. The bug
that blocked iter 18 capstone smoke is removed pending Andrea env switch.
