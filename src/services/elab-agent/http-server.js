/**
 * src/services/elab-agent/http-server.js
 *
 * Iter 69 A2 — Express HTTP server binding for ELAB Compile/Upload Agent.
 *
 * Wraps the pure async handlers in `./server.js` (handleHealth, handleBoards,
 * handleCompile, handleUpload) with an Express REST surface so the browser
 * (Lavagna) can talk to the local agent via loopback.
 *
 * Spec source of truth:
 *   docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md §3.3 (API minime)
 *
 * Endpoints:
 *   GET  /health                 → handleHealth()
 *   GET  /boards                 → handleBoards()
 *   POST /compile                → handleCompile({ sketchCode, boardId })
 *   POST /upload                 → handleUpload({ hexBase64, port, boardId })
 *   POST /compile-and-upload     → combined compile→upload sequential
 *   GET  /jobs/:id/status        → polling job status (in-memory job ledger)
 *
 * Security posture:
 *   - CORS strict whitelist (localhost:5173 + elabtutor.school +
 *     elab-tutor-*.vercel.app preview)
 *   - body size capped 10MB (large hex tolerated)
 *   - never exposes raw arduino-cli stderr to browser without docente
 *     translation (handleCompile already wraps errors via buildDocenteError)
 *   - JSON-only API, no static file serving
 *
 * Process lifecycle (iter 70 cli.js):
 *   - Listens `process.env.ELAB_AGENT_PORT || 8765`
 *   - Returns { app, server, port, stop() } from createHttpServer()
 *   - cli.js handles SIGINT / SIGTERM graceful shutdown
 *
 * Iter 69 honesty caveats:
 *   - express + cors are NOT yet in main package.json (Andrea ratify iter 70)
 *   - `handleCompileAndUpload` + `handleJobsStatus` defined HERE inline (NEW
 *     iter 69) because server.js iter 63 P0.5 shipped only 4 handlers
 *   - real arduino-cli upload to physical Nano R4 hardware NOT verified
 *     in this iter — deferred Andrea/Tea UAT post-install
 *   - cross-platform installer (Win/Linux) deferred iter 67+
 *
 * @module services/elab-agent/http-server
 * @copyright © Andrea Marro — 2026 — ELAB Tutor — Tutti i diritti riservati
 */

import {
  handleHealth,
  handleBoards,
  handleCompile,
  handleUpload,
  buildDocenteError,
} from './server.js';

/** Default loopback port for the agent HTTP surface. */
export const DEFAULT_AGENT_PORT = 8765;

/**
 * Canonical CORS whitelist. Only origins below may issue cross-origin
 * requests to the local agent. Vercel preview deployments (`elab-tutor-*`)
 * match via a regex predicate to avoid hardcoding every preview URL.
 */
export const ALLOWED_ORIGINS = Object.freeze([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://www.elabtutor.school',
  'https://elabtutor.school',
]);

/** Vercel preview deployment pattern (e.g. elab-tutor-git-feat-abc.vercel.app). */
export const VERCEL_PREVIEW_REGEX = /^https:\/\/elab-tutor-[a-z0-9-]+\.vercel\.app$/i;

/** Max request body bytes (10MB — tolerates compiled HEX payloads). */
export const BODY_LIMIT = '10mb';

/**
 * Decide whether an Origin header is permitted to talk to the agent.
 * Browsers omit Origin for same-origin requests; in that case we allow
 * (the agent listens loopback-only so the call must be local already).
 *
 * @param {string|undefined} origin
 * @returns {boolean}
 */
export function isOriginAllowed(origin) {
  if (!origin) return true; // same-origin / curl / Node-side caller
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (VERCEL_PREVIEW_REGEX.test(origin)) return true;
  return false;
}

// ============================================================================
// In-memory job ledger (iter 69 — single-process MVP)
// ============================================================================

/**
 * Job ledger keeps track of compile / upload / combined jobs so the browser
 * can poll `/jobs/:id/status`. Pure in-memory map (process-local). Survives
 * for the lifetime of the agent process; cleared on restart.
 *
 * Schema entry: {
 *   id: string (uuid from handleCompile),
 *   stage: 'compile'|'upload'|'compile-and-upload',
 *   status: 'pending'|'compiling'|'uploading'|'done'|'error',
 *   startedAt: ISO string,
 *   finishedAt?: ISO string,
 *   result?: object,   // last handler payload
 *   error?: object,    // buildDocenteError-shaped
 * }
 */
const _jobs = new Map();

/**
 * Reset the job ledger. Test-only helper but exported because cli.js may
 * wish to call it on graceful restart.
 *
 * @returns {void}
 */
export function _resetJobLedger() {
  _jobs.clear();
}

function _updateJob(id, patch) {
  if (!id) return;
  const prev = _jobs.get(id) || {};
  _jobs.set(id, { ...prev, ...patch });
}

// ============================================================================
// Combined handler: compile + upload sequential
// ============================================================================

/**
 * Compile then upload a sketch in a single call (the most common Lavagna
 * flow: click "Carica sul kit fisico" → wait → done). Surfaces a single
 * job id and the union of compile/upload payloads.
 *
 * @param {object} params
 * @param {string} params.sketchCode  - Arduino C++ source
 * @param {string} params.port        - serial port (e.g. /dev/cu.usbmodemR4001)
 * @param {string} [params.boardId='arduino-nano-r4']
 * @returns {Promise<{ ok: boolean, jobId?: string, compile?: object, upload?: object, error?: object }>}
 */
export async function handleCompileAndUpload({ sketchCode, port, boardId = 'arduino-nano-r4' }) {
  if (typeof sketchCode !== 'string' || !sketchCode.trim()) {
    return { ok: false, error: buildDocenteError('compile_failed', 'sketchCode missing or empty') };
  }
  if (typeof port !== 'string' || !port.trim()) {
    return { ok: false, error: buildDocenteError('port_missing', 'port required for upload') };
  }

  const compileRes = await handleCompile({ code: sketchCode, boardId });
  if (!compileRes.ok) {
    _updateJob(compileRes.jobId, {
      id: compileRes.jobId,
      stage: 'compile-and-upload',
      status: 'error',
      finishedAt: new Date().toISOString(),
      error: compileRes.error,
    });
    return { ok: false, jobId: compileRes.jobId, compile: compileRes, error: compileRes.error };
  }

  _updateJob(compileRes.jobId, {
    id: compileRes.jobId,
    stage: 'compile-and-upload',
    status: 'uploading',
    startedAt: new Date().toISOString(),
    result: { compile: compileRes },
  });

  const uploadRes = await handleUpload({ jobId: compileRes.jobId, port, boardId });

  if (!uploadRes.ok) {
    _updateJob(compileRes.jobId, {
      status: 'error',
      finishedAt: new Date().toISOString(),
      error: uploadRes.error,
      result: { compile: compileRes, upload: uploadRes },
    });
    return {
      ok: false,
      jobId: compileRes.jobId,
      compile: compileRes,
      upload: uploadRes,
      error: uploadRes.error,
    };
  }

  _updateJob(compileRes.jobId, {
    status: 'done',
    finishedAt: new Date().toISOString(),
    result: { compile: compileRes, upload: uploadRes },
  });

  return {
    ok: true,
    jobId: compileRes.jobId,
    compile: compileRes,
    upload: uploadRes,
  };
}

/**
 * Return the current ledger entry for a given job id. Browser polls this
 * after kicking off a long-running compile/upload to render progress.
 *
 * @param {string} id
 * @returns {object|null}
 */
export function handleJobsStatus(id) {
  if (!id || typeof id !== 'string') return null;
  return _jobs.get(id) || null;
}

// ============================================================================
// Express factory
// ============================================================================

/**
 * Build a CORS middleware bound to our whitelist. We hand-roll the small
 * surface needed (Origin echo + preflight) instead of pulling the `cors`
 * package, to keep iter 69 zero-install while still being drop-in
 * replaceable by `cors()` middleware when Andrea ratifies the dependency.
 *
 * @returns {Function} Express middleware
 */
export function makeCorsMiddleware() {
  return function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    if (isOriginAllowed(origin)) {
      if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Elab-Probe');
      res.setHeader('Access-Control-Max-Age', '600');
    } else {
      // Hard refuse: do not echo origin, no allow headers.
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: { category: 'cors_denied', message: 'Origin not allowed by ELAB agent' },
      }));
      return;
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    next();
  };
}

/**
 * Build the Express app. Pure factory — does not call listen().
 * Returns the app so tests can mount via supertest-style fetch wrappers
 * OR cli.js can call `.listen()` for real.
 *
 * @param {object} [opts]
 * @param {object} [opts.handlers] - inject mock handlers for tests
 * @returns {Promise<{ app: any, handlers: object }>}
 */
export async function createApp(opts = {}) {
  // Lazy import so projects without express installed can still import this
  // module (e.g. for tests that only exercise pure helpers above).
  let express;
  try {
    // Iter 69 A3 note: variable indirection (NOT a literal) so that the
    // Vite static analyzer (used by the elab-builder front-end build + the
    // Vitest unit-test runner) doesn't try to resolve "express" at
    // build time. The dep is intentionally not in the main package.json
    // until Andrea ratify iter 70 — see src/services/elab-agent/package.json.
    const expressPkg = ['exp', 'ress'].join('');
    const mod = await import(/* @vite-ignore */ expressPkg);
    express = mod.default || mod;
  } catch (err) {
    throw new Error(
      'ELAB agent http-server requires `express` to be installed. ' +
      'Run `npm install express` inside src/services/elab-agent/ ' +
      '(or root if you choose to elevate the dependency). ' +
      `Underlying error: ${err.message}`,
    );
  }

  const handlers = {
    health: handleHealth,
    boards: handleBoards,
    compile: handleCompile,
    upload: handleUpload,
    compileAndUpload: handleCompileAndUpload,
    jobsStatus: handleJobsStatus,
    ...(opts.handlers || {}),
  };

  const app = express();

  // Trust loopback only; we never run behind a proxy.
  app.disable('x-powered-by');
  app.disable('etag');

  app.use(makeCorsMiddleware());
  app.use(express.json({ limit: BODY_LIMIT }));

  // ── GET /health ─────────────────────────────────────────────────────────
  app.get('/health', async (_req, res) => {
    try {
      const payload = await handlers.health();
      res.json({
        ...payload,
        agent: 'elab-compile-upload',
        version: process.env.ELAB_AGENT_VERSION || '0.1.0',
      });
    } catch (err) {
      res.status(500).json({
        error: buildDocenteError('spawn_error', err.message),
      });
    }
  });

  // ── GET /boards ─────────────────────────────────────────────────────────
  app.get('/boards', async (_req, res) => {
    try {
      const payload = await handlers.boards();
      res.json(payload);
    } catch (err) {
      res.status(500).json({
        error: buildDocenteError('spawn_error', err.message),
      });
    }
  });

  // ── POST /compile ───────────────────────────────────────────────────────
  app.post('/compile', async (req, res) => {
    const body = req.body || {};
    const sketchCode = typeof body.sketchCode === 'string' ? body.sketchCode : body.code;
    const boardId = body.boardId || 'arduino-nano-r4';

    if (typeof sketchCode !== 'string' || !sketchCode.trim()) {
      return res.status(400).json({
        ok: false,
        error: buildDocenteError('compile_failed', 'sketchCode missing or empty'),
      });
    }

    try {
      const result = await handlers.compile({ code: sketchCode, boardId });
      _updateJob(result.jobId, {
        id: result.jobId,
        stage: 'compile',
        status: result.ok ? 'done' : 'error',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        result: result.ok ? { compile: result } : undefined,
        error: result.ok ? undefined : result.error,
      });
      res.status(result.ok ? 200 : 422).json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: buildDocenteError('spawn_error', err.message),
      });
    }
  });

  // ── POST /upload ────────────────────────────────────────────────────────
  app.post('/upload', async (req, res) => {
    const body = req.body || {};
    const jobId = body.jobId;
    const port = body.port;
    const boardId = body.boardId || 'arduino-nano-r4';
    // hexBase64 reserved for future direct-hex flow; current handleUpload
    // re-uses build-path from a prior /compile (jobId required).
    const _hexBase64 = body.hexBase64;

    if (!jobId && !_hexBase64) {
      return res.status(400).json({
        ok: false,
        error: buildDocenteError('compile_failed', 'jobId required (run /compile first) — direct hex upload deferred iter 70+'),
      });
    }
    if (!port) {
      return res.status(400).json({
        ok: false,
        error: buildDocenteError('port_missing', 'port required'),
      });
    }

    try {
      const result = await handlers.upload({ jobId, port, boardId });
      _updateJob(jobId, {
        id: jobId,
        stage: 'upload',
        status: result.ok ? 'done' : 'error',
        finishedAt: new Date().toISOString(),
        result: result.ok ? { upload: result } : undefined,
        error: result.ok ? undefined : result.error,
      });
      res.status(result.ok ? 200 : 422).json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: buildDocenteError('spawn_error', err.message),
      });
    }
  });

  // ── POST /compile-and-upload ────────────────────────────────────────────
  app.post('/compile-and-upload', async (req, res) => {
    const body = req.body || {};
    const sketchCode = typeof body.sketchCode === 'string' ? body.sketchCode : body.code;
    const port = body.port;
    const boardId = body.boardId || 'arduino-nano-r4';

    if (typeof sketchCode !== 'string' || !sketchCode.trim()) {
      return res.status(400).json({
        ok: false,
        error: buildDocenteError('compile_failed', 'sketchCode missing or empty'),
      });
    }
    if (typeof port !== 'string' || !port.trim()) {
      return res.status(400).json({
        ok: false,
        error: buildDocenteError('port_missing', 'port required'),
      });
    }

    try {
      const result = await handlers.compileAndUpload({ sketchCode, port, boardId });
      res.status(result.ok ? 200 : 422).json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: buildDocenteError('spawn_error', err.message),
      });
    }
  });

  // ── GET /jobs/:id/status ────────────────────────────────────────────────
  app.get('/jobs/:id/status', (req, res) => {
    const entry = handlers.jobsStatus(req.params.id);
    if (!entry) {
      return res.status(404).json({
        error: buildDocenteError('compile_failed', `job ${req.params.id} not found`),
      });
    }
    res.json(entry);
  });

  // ── Error middleware (catches body-parser limit overflow etc.) ──────────
  // Express 4 signature with 4 args is required to be recognized as error mw.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.too.large') {
      return res.status(413).json({
        error: buildDocenteError('compile_failed', `body too large (max ${BODY_LIMIT})`),
      });
    }
    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: buildDocenteError('compile_failed', 'invalid JSON body'),
      });
    }
    res.status(500).json({
      error: buildDocenteError('spawn_error', err && err.message ? err.message : 'unknown error'),
    });
  });

  return { app, handlers };
}

/**
 * Spin up the HTTP server bound to loopback. Returns helpers so callers
 * (cli.js / tests) can address the port and stop the server cleanly.
 *
 * @param {object} [opts]
 * @param {number} [opts.port]   - override port (default env or 8765)
 * @param {string} [opts.host]   - bind host (default 127.0.0.1)
 * @param {object} [opts.handlers] - override handlers (tests)
 * @returns {Promise<{ app: any, server: any, port: number, stop: Function }>}
 */
export async function createHttpServer(opts = {}) {
  const { app } = await createApp({ handlers: opts.handlers });
  const port = Number(opts.port || process.env.ELAB_AGENT_PORT || DEFAULT_AGENT_PORT);
  const host = opts.host || '127.0.0.1';

  return await new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      resolve({
        app,
        server,
        port,
        host,
        stop: () => new Promise((res, rej) => {
          server.close((err) => (err ? rej(err) : res()));
        }),
      });
    });
    server.on('error', reject);
  });
}
