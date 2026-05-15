/**
 * src/services/elab-agent/server.js
 *
 * Iter 63 P0.5 ELAB Compile/Upload Agent MVP — Local Agent handlers.
 * Andrea mandate verbatim 2026-05-15 PM (docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md §3.3).
 *
 * Pure async handler functions (NO http binding nello scope MVP iter 63).
 * Compatibili con qualunque framework (Express/Fastify/Hono/Bun) via wrapper.
 *
 * Anti-debito:
 *   - usa spawn (NO exec con stringhe shell, prevent injection)
 *   - ogni job in cartella temporanea isolata (UUID-based)
 *   - --build-path esplicito + riutilizzato compile→upload
 *   - errori categorizzati 7 tipi (arduino_cli_absent / core_missing / board_missing / port_missing / compile_failed / upload_failed / permission_denied)
 *   - tradurre errori tecnici in docente-friendly messages
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { loadBoardProfile } from './sketch-builder.js';

const ARDUINO_CLI = process.env.ELAB_ARDUINO_CLI || 'arduino-cli';
const DEFAULT_BOARD_ID = 'arduino-nano-r4';

// ============================================================================
// arduino-cli subprocess wrapper (spawn, NO exec, NO shell)
// ============================================================================

/**
 * Esegue arduino-cli con array argomenti (safe da injection).
 * @param {string[]} args - es. ['compile', '--fqbn', 'arduino:renesas_uno:nanor4', sketchDir]
 * @param {object} [opts]
 * @param {number} [opts.timeoutMs=120000] - timeout 2min default
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
export function runArduinoCli(args, opts = {}) {
  const { timeoutMs = 120000 } = opts;

  return new Promise((resolve, reject) => {
    if (!Array.isArray(args) || args.some((a) => typeof a !== 'string')) {
      return reject(new TypeError('args must be array of strings'));
    }

    const child = spawn(ARDUINO_CLI, args, { shell: false });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));

    child.on('error', (err) => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') {
        return reject({ category: 'arduino_cli_absent', message: 'arduino-cli not found in PATH', detail: err.message });
      }
      reject({ category: 'spawn_error', message: err.message, detail: err.code });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) {
        return reject({ category: 'timeout', message: `arduino-cli timed out after ${timeoutMs}ms`, stdout, stderr });
      }
      resolve({ code, stdout, stderr });
    });
  });
}

// ============================================================================
// Error categorization (docente-friendly messages)
// ============================================================================

const ERROR_MESSAGES_DOCENTE = {
  arduino_cli_absent:
    'Arduino CLI non è installato. Per usare il caricamento sul kit fisico, installate Arduino CLI dal sito ufficiale arduino.cc.',
  core_missing:
    'Il core Arduino per Nano R4 non è installato. Aprite il Terminale e digitate: arduino-cli core install arduino:renesas_uno',
  board_missing:
    'La scheda Nano R4 non è collegata o non viene riconosciuta. Verificate che il cavo USB sia inserito correttamente.',
  port_missing:
    'Non ho trovato una porta USB per la scheda. Provate a scollegare e ricollegare il cavo. Se serve, fate doppio-click sul pulsante di reset della Nano R4.',
  compile_failed:
    'Il codice contiene un errore di compilazione. Controllate parentesi, punto e virgola e nomi delle funzioni.',
  upload_failed:
    'Il caricamento sulla scheda è fallito. Verificate che la Nano R4 sia in modalità DFU (LED arancione lampeggiante dopo doppio-click reset).',
  permission_denied:
    'Il sistema non ha i permessi per accedere alla porta USB. Su Linux serve aggiungere lo studente al gruppo dialout: sudo usermod -a -G dialout $USER',
  timeout:
    'L\'operazione ha impiegato troppo tempo (>2 minuti). Probabile problema di rete o computer molto lento. Provate a riavviare ELAB Tutor.',
  spawn_error:
    'Errore tecnico interno. Riprovate. Se il problema persiste, contattate il supporto ELAB.',
};

/**
 * Categorizza stderr arduino-cli in 7 tipi noti.
 * @param {string} stderr
 * @returns {string} category
 */
function categorizeError(stderr) {
  const s = String(stderr || '').toLowerCase();
  if (s.includes('board not found') || s.includes('platform not found') || s.includes('invalid fqbn')) {
    return 'board_missing';
  }
  if (s.includes('core not installed') || s.includes('platform missing')) {
    return 'core_missing';
  }
  if (s.includes('serial port') || s.includes('no port') || s.includes('port not found')) {
    return 'port_missing';
  }
  if (s.includes('permission denied') || s.includes('access denied') || s.includes('cannot access')) {
    return 'permission_denied';
  }
  if (s.includes('error:') || s.includes('expected') || s.includes("'") && s.includes('not declared')) {
    return 'compile_failed';
  }
  return 'spawn_error';
}

/**
 * Costruisce response docente-friendly da error category.
 * @param {string} category
 * @param {string} [technicalDetail] - sviluppatori log only
 * @returns {{ category: string, message: string, detail?: string }}
 */
export function buildDocenteError(category, technicalDetail) {
  return {
    category,
    message: ERROR_MESSAGES_DOCENTE[category] || ERROR_MESSAGES_DOCENTE.spawn_error,
    detail: technicalDetail,
  };
}

// ============================================================================
// GET /health — agent alive + arduino-cli version + core list
// ============================================================================

export async function handleHealth() {
  try {
    const versionRes = await runArduinoCli(['version', '--format', 'json']);
    const coreRes = await runArduinoCli(['core', 'list', '--format', 'json']);

    const arduinoCliVersion = (() => {
      try {
        const j = JSON.parse(versionRes.stdout);
        return j.VersionString || j.Version || 'unknown';
      } catch {
        return 'parse-error';
      }
    })();

    const coreList = (() => {
      try {
        const j = JSON.parse(coreRes.stdout);
        return j.platforms || j || [];
      } catch {
        return [];
      }
    })();

    const renesasInstalled = coreList.some((c) =>
      (c.id || c.ID || '').includes('renesas_uno') || (c.name || '').toLowerCase().includes('uno r4'),
    );

    return {
      agent: 'ok',
      arduino_cli_version: arduinoCliVersion,
      core_renesas_uno_installed: renesasInstalled,
      core_count: coreList.length,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      agent: 'degraded',
      error: buildDocenteError(err.category || 'spawn_error', err.message),
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// GET /boards — board list connected via USB
// ============================================================================

export async function handleBoards() {
  try {
    const res = await runArduinoCli(['board', 'list', '--format', 'json']);
    let boards = [];
    try {
      const j = JSON.parse(res.stdout);
      // arduino-cli format: { detected_ports: [...] } or array
      boards = j.detected_ports || j.boards || j || [];
// © Andrea Marro — 15/05/2026 — ELAB Tutor — Tutti i diritti riservati
    } catch {
      boards = [];
    }

    return {
      boards: boards.map((b) => ({
        port: b.port?.address || b.address || b.port,
        protocol: b.port?.protocol || b.protocol,
        boards: b.matching_boards || b.boards || [],
      })),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      error: buildDocenteError(err.category || 'spawn_error', err.message),
      boards: [],
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// POST /compile — compile sketch (NO upload)
// ============================================================================

/**
 * Compila sketch Arduino C++ per board target.
 * @param {object} params
 * @param {string} params.code - sketch C++ completo (es. da buildSketch)
 * @param {string} [params.boardId='arduino-nano-r4'] - BoardProfile id
 * @returns {Promise<{ ok: boolean, jobId: string, sketchDir: string, buildDir: string, error?: object }>}
 */
export async function handleCompile({ code, boardId = DEFAULT_BOARD_ID }) {
  if (typeof code !== 'string' || code.trim().length === 0) {
    return { ok: false, error: buildDocenteError('compile_failed', 'Sketch code missing or empty') };
  }

  const profile = loadBoardProfile(boardId);
  const jobId = crypto.randomUUID();
  const root = path.join(os.tmpdir(), 'elab-arduino', jobId);
  const sketchDir = path.join(root, 'ElabSketch');
  const buildDir = path.join(root, 'build');
  const inoPath = path.join(sketchDir, 'ElabSketch.ino');

  try {
    await fs.mkdir(sketchDir, { recursive: true });
    await fs.mkdir(buildDir, { recursive: true });
    await fs.writeFile(inoPath, code, 'utf8');

    const res = await runArduinoCli([
      'compile',
      '--fqbn', profile.fqbn,
      '--build-path', buildDir,
      sketchDir,
    ]);

    if (res.code !== 0) {
      return {
        ok: false,
        jobId,
        sketchDir,
        buildDir,
        error: buildDocenteError(categorizeError(res.stderr), res.stderr),
      };
    }

    return { ok: true, jobId, sketchDir, buildDir, stdout: res.stdout };
  } catch (err) {
    return {
      ok: false,
      jobId,
      sketchDir,
      buildDir,
      error: buildDocenteError(err.category || 'spawn_error', err.message || err.detail),
    };
  }
}

// ============================================================================
// POST /upload — upload pre-compiled sketch (richiede jobId precedente compile)
// NOTE iter 63 MVP: skeleton solo, real upload defer iter 64+ (Andrea Nano R4 hardware UAT)
// ============================================================================

export async function handleUpload({ jobId, port, boardId = DEFAULT_BOARD_ID }) {
  if (!jobId || !port) {
    return { ok: false, error: buildDocenteError('port_missing', 'jobId + port required') };
  }

  const profile = loadBoardProfile(boardId);
  const root = path.join(os.tmpdir(), 'elab-arduino', jobId);
  const sketchDir = path.join(root, 'ElabSketch');
  const buildDir = path.join(root, 'build');

  // Verify build artifacts exist (prev compile required)
  try {
    await fs.access(buildDir);
  } catch {
    return { ok: false, error: buildDocenteError('compile_failed', `Build dir missing for jobId ${jobId} — run /compile first`) };
  }

  try {
    const res = await runArduinoCli([
      'upload',
      '--fqbn', profile.fqbn,
      '--build-path', buildDir,
      '-p', port,
      sketchDir,
    ], { timeoutMs: 60000 });

    if (res.code !== 0) {
      return {
        ok: false,
        jobId,
        error: buildDocenteError(categorizeError(res.stderr), res.stderr),
      };
    }

    return { ok: true, jobId, port, stdout: res.stdout };
  } catch (err) {
    return {
      ok: false,
      jobId,
      error: buildDocenteError(err.category || 'spawn_error', err.message || err.detail),
    };
  }
}
