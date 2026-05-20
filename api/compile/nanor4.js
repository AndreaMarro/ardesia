/**
 * Vercel serverless — secure proxy browser → ELAB Cloud Compile (Render)
 *
 * Iter 98 Atom E (Andrea iter 97 PM mandate "questo DEVE FUNZIONARE" — Compila
 * button #compile-home prod). Root cause diagnosed iter 98 entrance:
 *   - prod Vercel has NO local ELAB Agent (localhost:8765 unreachable browser)
 *   - compile-proxy → n8n webhook forwards { code } ONLY, no fqbn → n8n
 *     legacy AVR core, Renesas Nano R4 NOT supported
 *   - infra/cloud-compile/ Render service (arduino-cli + Renesas core 1.5.3)
 *     deploy-ready (Dockerfile + render.yaml COMPLETE) MA deploy pending
 *
 * This serverless function resolves code-reviewer iter 93 atom 32 CRITICAL-1
 * (`/api/compile/nanor4` referenced in IdeShell CompileButton.tsx MA never
 * existed). It IS the canonical secure proxy Andrea iter 94 PM mandate verbatim
 * "/api/compile/nanor4 o proxy sicuro" + "no chiave segreta nel browser come
 * soluzione finale".
 *
 * Architecture (secure — server-side key, NEVER exposed client bundle):
 *   browser POST /api/compile/nanor4 { sketchCode, fqbn, boardId, sessionId }
 *     → this function reads process.env.ELAB_CLOUD_COMPILE_URL (server-only,
 *       NOT VITE_ prefix → not in client bundle)
 *     → forwards POST ${ELAB_CLOUD_COMPILE_URL}/compile with header
 *       x-elab-api-key: process.env.ELAB_CLOUD_COMPILE_API_KEY (server-only)
 *     → returns Cloud Render response { ok, fqbn, hexBase64, artifactSize, ... }
 *   Same-origin call → no CORS preflight + no client API key exposure.
 *
 * Andrea deploy steps to activate (see infra/cloud-compile/render.yaml):
 *   1. Render dashboard → New Web Service → connect repo elab-tutor
 *      → rootDir infra/cloud-compile → Docker → Starter $7/mo → Frankfurt
 *   2. Render auto-generates ELAB_CLOUD_COMPILE_API_KEY (render.yaml envVars)
 *   3. Copy Render service URL + API key
 *   4. Vercel env (Production + Preview):
 *      - ELAB_CLOUD_COMPILE_URL = https://elab-cloud-compile.onrender.com
 *      - ELAB_CLOUD_COMPILE_API_KEY = <copied from Render dashboard>
 *      (server-side, NO VITE_ prefix → not exposed browser bundle)
 *   5. Vercel redeploy
 *   Until step 1-5 done → this proxy returns honest 503 cloud_compile_not_configured.
 *
 * © Andrea Marro — iter 98 Atom E — 2026-05-20
 */

export const config = { runtime: 'nodejs' };

// Server-side env (NOT VITE_ prefix → never bundled into client JS).
const CLOUD_COMPILE_URL = (process.env.ELAB_CLOUD_COMPILE_URL || '').trim().replace(/\/$/, '');
const CLOUD_COMPILE_API_KEY = (process.env.ELAB_CLOUD_COMPILE_API_KEY || '').trim();

// arduino-cli Renesas RA4M1 compile takes ~10-30s cold + core toolchain.
// 45s timeout = generous buffer. Render free tier cold start adds ~5-15s.
const UPSTREAM_TIMEOUT_MS = 45_000;

const CANONICAL_FQBN = 'arduino:renesas_uno:nanor4';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  // Honest 503 when Cloud Compile not yet deployed/configured. Client
  // (api.js compileCode) falls through to next chain entry on non-2xx.
  if (!CLOUD_COMPILE_URL) {
    res.status(503).json({
      ok: false,
      error: 'cloud_compile_not_configured',
      message: 'Servizio Cloud Compile non ancora configurato. '
        + 'Deploy infra/cloud-compile su Render + imposta ELAB_CLOUD_COMPILE_URL '
        + 'nelle variabili ambiente Vercel.',
    });
    return;
  }

  try {
    const body = req.body || {};
    // Accept both `sketchCode` (cloud-compile canonical) + `code` (legacy alias).
    const sketchCode = typeof body.sketchCode === 'string'
      ? body.sketchCode
      : (typeof body.code === 'string' ? body.code : '');
    const fqbn = (typeof body.fqbn === 'string' && body.fqbn) ? body.fqbn : CANONICAL_FQBN;
    const boardId = typeof body.boardId === 'string' ? body.boardId : undefined;
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : undefined;

    if (!sketchCode || sketchCode.trim().length === 0) {
      res.status(400).json({ ok: false, error: 'missing_sketch_code' });
      return;
    }

    // Defensive sketch size cap (mirrors cloud-compile SKETCH_SIZE_LIMIT_KB=100).
    if (sketchCode.length > 100 * 1024) {
      res.status(413).json({ ok: false, error: 'sketch_too_large', limit_kb: 100 });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    const headers = { 'Content-Type': 'application/json' };
    // Server-side API key injection — never reaches browser. Cloud Render
    // authMiddleware (server.js:93-107) requires x-elab-api-key when API_KEY set.
    if (CLOUD_COMPILE_API_KEY) headers['x-elab-api-key'] = CLOUD_COMPILE_API_KEY;

    const upstream = await fetch(`${CLOUD_COMPILE_URL}/compile`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sketchCode, fqbn, boardId, sessionId }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await upstream.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {
        ok: false,
        error: 'upstream_non_json',
        detail: text.slice(0, 300),
      };
    }

    res.status(upstream.status).json(payload);
  } catch (e) {
    const isAbort = e && e.name === 'AbortError';
    res.status(isAbort ? 504 : 500).json({
      ok: false,
      error: isAbort ? 'cloud_compile_timeout' : 'cloud_compile_proxy_error',
      detail: String((e && e.message) || e).slice(0, 200),
    });
  }
}
