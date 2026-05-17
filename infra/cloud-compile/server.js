/**
 * ELAB Cloud Compile Service — iter 76 WebUSB cross-compile direction.
 *
 * Andrea direttiva iter 75 PM 2026-05-17:
 * "Non deve essere qualcosa che scarichi. Deve funzionare DIRETTAMENTE
 *  dalla piattaforma elabtutor."
 *
 * Arch: browser POST sketch → cloud Render Docker arduino-cli compile →
 *       return HEX base64 → browser WebUSB flash direct Nano R4 DFU mode.
 *
 * Endpoints:
 *   GET  /health                  — uptime + arduino-cli version + Renesas core status
 *   POST /compile                  — body {sketchCode, fqbn, sessionId?} → HEX base64
 *   GET  /boards                   — supported boards (Nano R4 + AVR Nano + Uno)
 *
 * Security:
 *   - API key header X-Elab-Api-Key (env ELAB_CLOUD_COMPILE_API_KEY)
 *   - Strict CORS allowlist (elabtutor.school + Vercel previews + localhost dev)
 *   - Rate limit 10 req/min per IP (in-memory)
 *   - Sketch size limit 100KB
 *   - Sandbox per-job temp dir + auto-cleanup 5min idle
 *
 * NO local install required for docente (Andrea pivot direction iter 76).
 */

import express from 'express';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rm, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT) || 8765;
const API_KEY = process.env.ELAB_CLOUD_COMPILE_API_KEY || '';
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN) || 10;
const SKETCH_SIZE_LIMIT_KB = Number(process.env.SKETCH_SIZE_LIMIT_KB) || 100;
const SANDBOX_IDLE_MIN = Number(process.env.SANDBOX_IDLE_MIN) || 5;
const SANDBOX_BASE = join(tmpdir(), 'elab-cloud-compile');

const ALLOWED_ORIGINS = new Set([
  'https://www.elabtutor.school',
  'https://elabtutor.school',
  'http://localhost:5173',
  'http://localhost:4173',
]);
const VERCEL_PREVIEW_REGEX = /^https:\/\/elab-tutor-[a-z0-9-]+-andreas-projects-[a-z0-9-]+\.vercel\.app$/;

const ALLOWED_BOARDS = new Set([
  'arduino:renesas_uno:nanor4',
  'arduino:avr:nano:cpu=atmega328old',
  'arduino:avr:uno',
]);

// In-memory rate limit Map<ip, [timestamps]> sliding 60s window.
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_PER_MIN) {
    rateLimitMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function isOriginAllowed(origin) {
  if (!origin) return true; // server-to-server OR curl
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (VERCEL_PREVIEW_REGEX.test(origin)) return true;
  return false;
}

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Elab-Api-Key,X-Elab-Probe');
  res.setHeader('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!isOriginAllowed(origin)) {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }
  next();
}

function authMiddleware(req, res, next) {
  // /health always public (browser probe + WebUSB feature detect ping)
  if (req.path === '/health') return next();
  if (!API_KEY) {
    console.warn('[cloud-compile] ELAB_CLOUD_COMPILE_API_KEY not set — DEV MODE allow all');
    return next();
  }
  const key = req.headers['x-elab-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'api_key_required' });
  }
  next();
}

function rateLimitMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'rate_limit_exceeded', limit_per_min: RATE_LIMIT_PER_MIN });
  }
  next();
}

async function ensureSandboxBase() {
  await mkdir(SANDBOX_BASE, { recursive: true });
}

async function cleanupOrphanedSandboxes() {
  try {
    const entries = await readdir(SANDBOX_BASE);
    const now = Date.now();
    const maxAgeMs = SANDBOX_IDLE_MIN * 60_000;
    for (const entry of entries) {
      const fullPath = join(SANDBOX_BASE, entry);
      try {
        const s = await stat(fullPath);
        if (now - s.mtimeMs > maxAgeMs) {
          await rm(fullPath, { recursive: true, force: true });
        }
      } catch (_) {
        // ignore individual entry errors
      }
    }
  } catch (err) {
    console.error('[cloud-compile] cleanup error', err.message);
  }
}

setInterval(cleanupOrphanedSandboxes, 60_000);

function runArduinoCli(args, timeoutMs = 60_000) {
  return new Promise((resolve) => {
    const proc = spawn('arduino-cli', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (_) { /* noop */ }
    }, timeoutMs);
    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: `spawn_error: ${err.message}` });
    });
  });
}

const app = express();
app.use(corsMiddleware);
app.use(express.json({ limit: `${SKETCH_SIZE_LIMIT_KB}kb` }));
app.use(authMiddleware);
app.use(rateLimitMiddleware);

app.get('/health', async (_req, res) => {
  const ver = await runArduinoCli(['version'], 5_000);
  const cores = await runArduinoCli(['core', 'list'], 5_000);
  res.json({
    service: 'elab-cloud-compile',
    version: '1.0.0',
    arduino_cli_ready: ver.code === 0,
    arduino_cli_version_raw: ver.stdout.trim(),
    core_renesas_uno_installed: cores.stdout.includes('arduino:renesas_uno'),
    core_avr_installed: cores.stdout.includes('arduino:avr'),
    timestamp: new Date().toISOString(),
  });
});

app.get('/boards', (_req, res) => {
  res.json({
    supported: Array.from(ALLOWED_BOARDS),
    default: 'arduino:renesas_uno:nanor4',
  });
});

app.post('/compile', async (req, res) => {
  const t0 = Date.now();
  // iter 76 PHASE 3 P0.4 fix (Codex Pattern V verdict #1 + OpenAPI 76-D.3
  // HC-2/HC-3): accept both `fqbn` (canonical) AND `boardId` (LOCAL agent
  // parity). Map boardId → fqbn via lookup. `fqbn` precedence when both.
  const BOARD_ID_TO_FQBN = {
    'arduino-nano-r4': 'arduino:renesas_uno:nanor4',
    'arduino-uno': 'arduino:avr:uno',
  };
  const { sketchCode, fqbn, boardId, sessionId } = req.body || {};
  if (typeof sketchCode !== 'string' || sketchCode.length === 0) {
    return res.status(400).json({ error: 'sketchCode_required' });
  }
  if (sketchCode.length > SKETCH_SIZE_LIMIT_KB * 1024) {
    return res.status(413).json({ error: 'sketch_too_large', limit_kb: SKETCH_SIZE_LIMIT_KB });
  }
  let resolvedFqbn = typeof fqbn === 'string' && fqbn ? fqbn : null;
  if (!resolvedFqbn && typeof boardId === 'string' && boardId) {
    resolvedFqbn = BOARD_ID_TO_FQBN[boardId] || null;
  }
  const targetFqbn = resolvedFqbn || 'arduino:renesas_uno:nanor4';
  if (!ALLOWED_BOARDS.has(targetFqbn)) {
    return res.status(400).json({ error: 'fqbn_not_allowed', fqbn: targetFqbn, allowed: Array.from(ALLOWED_BOARDS) });
  }

  await ensureSandboxBase();
  const jobId = randomUUID();
  const sandboxDir = join(SANDBOX_BASE, jobId);
  const sketchDir = join(sandboxDir, 'sketch');
  const sketchFile = join(sketchDir, 'sketch.ino');
  const buildDir = join(sandboxDir, 'build');

  try {
    await mkdir(sketchDir, { recursive: true });
    await mkdir(buildDir, { recursive: true });
    await writeFile(sketchFile, sketchCode, 'utf8');

    const compileResult = await runArduinoCli([
      'compile',
      '--fqbn', targetFqbn,
      '--build-path', buildDir,
      sketchDir,
    ], 60_000);

    if (compileResult.code !== 0) {
      return res.status(422).json({
        jobId,
        sessionId,
        status: 'compile_failed',
        errors: compileResult.stderr,
        stdout: compileResult.stdout,
        latencyMs: Date.now() - t0,
      });
    }

    // Read HEX file (Renesas uses .hex OR .bin per board variant — try both)
    const candidates = ['sketch.ino.hex', 'sketch.ino.bin', 'sketch.ino.elf'];
    let hexBytes = null;
    let hexFilename = null;
    for (const name of candidates) {
      try {
        const buf = await readFile(join(buildDir, name));
        hexBytes = buf;
        hexFilename = name;
        break;
      } catch (_) { /* try next */ }
    }
    if (!hexBytes) {
      return res.status(500).json({
        jobId,
        sessionId,
        status: 'hex_not_found',
        candidates,
        latencyMs: Date.now() - t0,
      });
    }

    res.json({
      jobId,
      sessionId,
      status: 'success',
      hexFilename,
      hexSize: hexBytes.length,
      hexBase64: hexBytes.toString('base64'),
      stdout: compileResult.stdout,
      stderr: compileResult.stderr,
      latencyMs: Date.now() - t0,
    });
  } catch (err) {
    res.status(500).json({
      jobId,
      sessionId,
      status: 'server_error',
      error: err.message,
      latencyMs: Date.now() - t0,
    });
  } finally {
    // Cleanup sandbox immediate (no 5min wait per-job — only interval catches orphans)
    rm(sandboxDir, { recursive: true, force: true }).catch(() => { /* swallow */ });
  }
});

app.use((req, res) => res.status(404).json({ error: 'not_found', path: req.path }));

// iter 76 PHASE 3 P0.5 fix (Codex Pattern V verdict #5 + #6):
// Refuse boot in production when ELAB_CLOUD_COMPILE_API_KEY is unset.
// Dev mode (NODE_ENV !== 'production') retains permissive default for
// localhost iteration. Render production env MUST provide API_KEY via
// render.yaml `generateValue: true` — boot fails fast otherwise.
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
if (IS_PRODUCTION && !API_KEY) {
  console.error('[cloud-compile] FATAL: ELAB_CLOUD_COMPILE_API_KEY not set in production');
  console.error('[cloud-compile] Refuse to boot — set env var via Render dashboard');
  console.error('[cloud-compile] render.yaml envVars[0] generateValue:true should auto-create');
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[cloud-compile] listening 0.0.0.0:${PORT}`);
  console.log(`[cloud-compile] NODE_ENV=${process.env.NODE_ENV || 'undefined'} ${IS_PRODUCTION ? '(PRODUCTION mode)' : '(DEV mode)'}`);
  console.log(`[cloud-compile] API_KEY ${API_KEY ? 'set (auth required)' : 'NOT SET (DEV permissive — refuse boot in PROD)'}`);
  console.log(`[cloud-compile] rate limit ${RATE_LIMIT_PER_MIN} req/min · sketch limit ${SKETCH_SIZE_LIMIT_KB}KB`);
  console.log('[cloud-compile] endpoints: GET /health, GET /boards, POST /compile');
});
