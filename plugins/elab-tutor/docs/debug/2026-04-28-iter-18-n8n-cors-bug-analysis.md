# Iter 18 P0 — n8n /compile CORS Bug Analysis

**Date**: 2026-04-28
**Sprint**: cors-fix-opus iter 18
**Severity**: P0 — capstone esperimenti v3-cap5/6/7/8 auto-trigger compile blocked prod
**Author**: investigation agent (no src/supabase/n8n modifications)

---

## 1. Bug reproduction confirmed

Playwright iter 18 systematic test 10 esperimenti:
- 14 console errors origin `https://www.elabtutor.school`
- Pattern: `Access to fetch at 'https://n8n.srv1022317.hstgr.cloud/compile' from origin 'https://www.elabtutor.school' blocked by CORS policy: Response to preflight request doesn't pass access control check.`
- Trigger: capstone esperimenti `v3-cap5`, `v3-cap6`, `v3-cap7`, `v3-cap8` auto-call compile on mount
- Impact: zero compile success prod browser; HEX never produced; AVR sim never runs HEX path

## 2. Path tracing ELAB → n8n

src/services/api.js:33
```js
const COMPILE_WEBHOOK = (import.meta.env.VITE_COMPILE_WEBHOOK_URL || '').trim() || null;
```

src/services/api.js:1192-1195 (`compileCode` fallback chain step 2):
```js
if (COMPILE_WEBHOOK) {
    const result = await tryCompile(COMPILE_WEBHOOK, 'Backend webhook');
    if (result) return result;
}
```

`tryCompile` (src/services/api.js:1143-1183):
- Uses URL **AS-IS** (no append `/compile` or `/webhook/compile`)
- POST + `Content-Type: application/json` + body `{code, board}`
- Browser triggers CORS preflight OPTIONS automatically (non-simple Content-Type JSON)

**Conclusion**: env var must contain FULL path. If env = `https://n8n.srv1022317.hstgr.cloud/compile` → that's the URL the browser hits.

## 3. CORS preflight: expected vs returned

Browser OPTIONS request expectations:
- `Access-Control-Allow-Origin` matches `https://www.elabtutor.school` (or `*`)
- `Access-Control-Allow-Methods` includes `POST`
- `Access-Control-Allow-Headers` includes `content-type`
- HTTP 2xx (typically 204)

If preflight fails → browser blocks the actual POST → no diagnostic in network tab beyond "blocked".

## 4. Diagnostic — curl OPTIONS evidence

### Endpoint A — `/webhook/compile` (n8n native webhook prefix)

```
curl -i -X OPTIONS 'https://n8n.srv1022317.hstgr.cloud/webhook/compile' \
  -H 'Origin: https://www.elabtutor.school' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Response (verified iter 18):
```
HTTP/2 204
access-control-allow-headers: content-type
access-control-allow-methods: OPTIONS, POST
access-control-allow-origin: https://www.elabtutor.school
access-control-max-age: 300
```

**PASS**: preflight clean, allow-origin echoes ELAB prod origin.

POST validation `/webhook/compile`:
```
curl -i -X POST 'https://n8n.srv1022317.hstgr.cloud/webhook/compile' \
  -H 'Origin: https://www.elabtutor.school' \
  -H 'Content-Type: application/json' \
  -d '{"code":"void setup(){} void loop(){}","board":"arduino:avr:nano:cpu=atmega328old"}'
```

Response: HTTP/2 200 + `access-control-allow-origin: https://www.elabtutor.school` + JSON body
`{"success":false,"hex":null,"errors":"Errore di compilazione",...}` (success false = empty sketch, but webhook reachable + CORS-clean).

### Endpoint B — `/compile` (no `/webhook/` prefix)

```
curl -i -X OPTIONS 'https://n8n.srv1022317.hstgr.cloud/compile' \
  -H 'Origin: https://www.elabtutor.school' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Response (verified iter 18):
```
HTTP/2 502
content-length: 11

Bad Gateway
```

**FAIL**: 502 returns no Allow-Origin header → browser preflight rejects → CORS error surfaces. Iter 16 path-rename `elab-compile→compile` set workflow.path = `compile`, but **n8n production webhooks remain mounted under `/webhook/<path>`**, not at root `/<path>`. Reverse proxy at `/compile` returns 502 (no upstream).

## 5. Why curl POST "works" but browser fails

The "curl POST direct 200 OK" claim from iter 16 is true ONLY for `/webhook/compile`. Curl bypasses CORS entirely (CORS = browser-only same-origin-policy enforcement). If env var was set to `/compile`, browser hits 502 + missing Allow-Origin → preflight rejected → 14 console errors.

**Root cause hypothesis**: VITE_COMPILE_WEBHOOK_URL on Vercel prod = `https://n8n.srv1022317.hstgr.cloud/compile` (without `/webhook/` prefix).

Cannot verify directly without Vercel OAuth / `vercel env pull`. Andrea validation needed. Assumption confidence: HIGH (matches console error string exactly).

## 6. Fix Path A — Vercel env update (RECOMMENDED PRIMARY)

**Action**: Update Vercel env var on prod scope:
```
VITE_COMPILE_WEBHOOK_URL=https://n8n.srv1022317.hstgr.cloud/webhook/compile
```
Then redeploy (env-var change requires rebuild for Vite — `import.meta.env.*` is bake-time).

**Steps**:
1. Andrea OAuth Vercel MCP → Project ELAB → Settings → Environment Variables.
2. Edit `VITE_COMPILE_WEBHOOK_URL` → new value above.
3. Apply scope: Production (+ Preview/Development se vuole consistenza).
4. Trigger redeploy: `npx vercel --prod --yes` OR Vercel dashboard Redeploy.
5. Wait build ~3 min.

**Effort**: 5 min Andrea + 3 min build = ~8 min total
**Risk**: low, fully reversible (just revert env var + redeploy)
**Verification**: re-run Playwright iter 18 systematic on capstone v3-cap5/6/7/8 → expect 0 CORS errors + actual HEX output (or compile-error JSON).
**Why primary**: zero code change, zero infra change, fix matches root cause exactly. n8n endpoint already CORS-clean for `https://www.elabtutor.school`.

## 7. Fix Path B — n8n CORS headers add (workaround if path A blocked)

**Use case**: Andrea wants to keep `/compile` path (no `/webhook/` prefix) for branding/rewrite.

**Action**: Add reverse-proxy or n8n workflow node response headers at `/compile` route.

Two sub-paths:

**B.1**: n8n workflow Webhook node → "Response" options → add header:
```
Access-Control-Allow-Origin: https://www.elabtutor.school
Access-Control-Allow-Methods: OPTIONS, POST
Access-Control-Allow-Headers: content-type
```
But this only fixes the POST response, NOT preflight OPTIONS at `/compile` (which currently 502s — upstream unreachable, not n8n-served).

**B.2**: Hostinger/n8n reverse-proxy config (nginx/caddy) to alias `/compile → /webhook/compile`:
```
location /compile { proxy_pass http://n8n_upstream/webhook/compile; }
```
Plus inject CORS headers at proxy layer for OPTIONS.

**Effort**: 15-30 min (requires SSH to Hostinger or n8n hosting layer access)
**Risk**: medium — proxy config errors block production webhook
**Verification**: curl OPTIONS `/compile` returns 204 + Allow-Origin header.

**Why NOT primary**: more moving parts; iter 16 already attempted `path = 'compile'` workflow rename without proxy fix → resulted in current broken state.

## 8. Fix Path C — Supabase Edge Function proxy (RESILIENCE backup)

**Action**: New Edge Function `supabase/functions/compile-proxy/index.ts` that:
1. Accepts POST from prod origin (CORS-friendly — Supabase Edge Fn pattern already used in `unlim-chat`, `unlim-tts`, etc.)
2. Forwards to `https://n8n.srv1022317.hstgr.cloud/webhook/compile` server-side (no CORS — server-to-server).
3. Returns response with `Access-Control-Allow-Origin: https://www.elabtutor.school`.

**Skeleton** (~80 LOC, mirrors existing `unlim-tts/index.ts` pattern):
```ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ALLOWED_ORIGIN = "https://www.elabtutor.school";
const N8N_COMPILE = "https://n8n.srv1022317.hstgr.cloud/webhook/compile";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const upstream = await fetch(N8N_COMPILE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, errors: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**Wire-up**: Then update env var:
```
VITE_COMPILE_WEBHOOK_URL=https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy
```

**Effort**: 30 min impl + 10 min deploy + 5 min curl verify = ~45 min
**Risk**: low, additive (no n8n change, no existing path change)
**Deploy**: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy compile-proxy --project-ref euqpdueopmlllqjmqnyb`
**Verification**: curl OPTIONS proxy URL → 204 + Allow-Origin; curl POST proxy → forwards JSON; Playwright iter 18 → 0 errors.

**Why backup not primary**: extra hop = 100-300 ms latency penalty; extra surface area; depends on Supabase Edge Fn cold start. Path A solves same problem with zero indirection. BUT Path C provides resilience if n8n endpoint URL changes again, since src/services/api.js doesn't need to know n8n directly.

## 9. Recommendation

**Primary**: **Path A — Vercel env update** (5 min, lowest risk, exact root-cause fix).
**Backup**: Path C only if Andrea wants long-term decoupling from n8n URL drift OR if Path A reveals n8n endpoint isn't actually CORS-clean for prod (already disproved iter 18 — verified working).

**Skip Path B** unless `/compile` (no `/webhook/`) path is hard requirement (it's not — env var can hold any URL).

## 10. Verification plan post-fix

1. **Pre-deploy**: `curl -i -X OPTIONS https://n8n.srv1022317.hstgr.cloud/webhook/compile -H 'Origin: https://www.elabtutor.school' ...` → 204 + Allow-Origin (already verified iter 18).
2. **Deploy**: Andrea Vercel env update + redeploy ~8 min.
3. **Post-deploy curl**: `curl -i -X POST https://www.elabtutor.school/...` (n/a, browser-only test).
4. **Playwright iter 18 systematic**: re-run capstone v3-cap5/6/7/8 → assert 0 console errors matching `/CORS|preflight|blocked/`.
5. **Network tab assert**: `tryCompile` POST returns 200 + body `{success: true|false, hex: string|null, errors: ...}`.
6. **Functional**: open v3-cap5 prod, click Play → expect HEX produced + AVR sim runs (or graceful "Errore di compilazione" on real syntax error).

## CoV

- Doc path: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/debug/2026-04-28-iter-18-n8n-cors-bug-analysis.md`
- Curl OPTIONS evidence: §4 above (both endpoints, raw HTTP/2 status + headers).
- 3 fix paths actionable: §6 (A 8min) + §7 (B 15-30min) + §8 (C 45min) with effort + risk + verify per path.
- No src/supabase/n8n modifications performed (analysis-only deliverable, per scope).
