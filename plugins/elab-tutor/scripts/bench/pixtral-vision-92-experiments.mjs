#!/usr/bin/env node
/**
 * Sprint T iter 28 — Pixtral 12B Vision Bench (92 esperimenti audit scaffold)
 *
 * Goal: harness STRINGENT Livello 3 VISUAL — invoke `unlim-vision` Edge Function
 * (Mistral Pixtral 12B FR EU) on each esperimento screenshot fixture and
 * aggregate Italian K-12 audit results per Andrea iter 25 PM mandate
 * "componenti disposti male o mal connessi".
 *
 * INPUT
 *   - 94 lesson-paths v1-v3 JSON in src/data/lesson-paths/*.json
 *     (38 Vol1 + 27 Vol2 + 29 Vol3, scaffold counts variants, target 92 canon)
 *   - 20 placeholder PNGs in tests/fixtures/screenshots/circuit-NN.png
 *     (iter 12 originals replaced iter 14 with real captures from prod)
 *   - mapping screenshot → experimentId via tests/fixtures/screenshots/INDEX.md
 *
 * OUTPUT
 *   automa/state/pixtral-vision-bench-results.json (live mode)
 *   automa/state/pixtral-vision-bench-results-MOCK.json (default, no API key)
 *
 * MODE
 *   Default = MOCK (ELAB_API_KEY/SUPABASE_ANON_KEY missing tolerated, scaffold
 *   only). Live mode requires both env vars. NO COMMITTING bench output.
 *
 * 8 CRITERIA CHECK (Pixtral Italian prompt — Principio Zero v3 morphic):
 *   C1. Palette Omaric kit fisico coerente (NON generic blue/red SaaS)
 *   C2. Componenti coerenti con kit ELAB (LED + R + breadboard + batteria)
 *   C3. Topology breadboard mounting corretto
 *   C4. Pin connessione integri (ANODO long → +, CATODO short → GND via R)
 *   C5. Breadboard usage idiomatico (rail bus + holes contiguous)
 *   C6. LED orientation polarità corretta (anodo lato +)
 *   C7. Wire color convention (rosso = +, nero = GND)
 *   C8. NO short circuit (NON connettere + direttamente a GND senza load)
 *
 * PRINCIPIO ZERO V3 (mandate iter 28):
 *   - "Il kit fisico ELAB è protagonista nell'immagine?"
 *   - "Componenti coerenti con palette Omaric kit (non SaaS generic)?"
 *   - "Vol/pag citation match con experimentId?"
 *
 * HONEST CAVEATS (G45 anti-inflation, NO claim 92 broken count revealed):
 *   - 20 PNG fixtures only (NOT 92 ground truth) → 72 esperimenti SKIPPED
 *   - Pixtral 12B K-12 Italian accuracy NOT benchmarked against gold set
 *   - Judge LLM bias possibile (Pixtral self-judges its own output schema)
 *   - Threshold pass/fail empirico (NO calibration sample iter 28)
 *
 * (c) Andrea Marro — 2026-04-29 — Sprint T iter 28 visual harness scaffold
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..');
const LESSON_PATHS_DIR = resolve(REPO_ROOT, 'src', 'data', 'lesson-paths');
const SCREENSHOTS_DIR = resolve(REPO_ROOT, 'tests', 'fixtures', 'screenshots');
const STATE_DIR = resolve(REPO_ROOT, 'automa', 'state');

const UNLIM_VISION_URL = (process.env.UNLIM_VISION_URL ||
  'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-vision').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const REQUEST_TIMEOUT_MS = 45000;

// ─── PRINCIPIO ZERO V3 PROMPT (8 criteria) ──────────────────────────────────

export const PIXTRAL_AUDIT_PROMPT = `Sei un revisore visivo del kit fisico ELAB Tutor (Italian K-12, 8-14 anni).

Analizza la foto del circuito su breadboard ELAB e rispondi in italiano plurale "Ragazzi,".

8 CRITERI CHECK (rispondi PASS o FAIL per ciascuno con 1 frase motivazione):
C1. Palette: i colori dei componenti sono coerenti con il kit fisico Omaric (NON palette SaaS generica blu/rosso)?
C2. Componenti: LED + resistore + breadboard + batteria visibili e coerenti con il kit ELAB?
C3. Topology: il montaggio sulla breadboard è corretto (componenti nelle righe giuste)?
C4. Pin: anodo LED (piedino lungo) collegato al + tramite resistore, catodo a GND?
C5. Breadboard: uso idiomatico delle bus rail e dei fori contigui?
C6. LED orientation: polarità rispettata (anodo lato +)?
C7. Wire color: rosso = +, nero = GND, convenzione rispettata?
C8. NO short circuit: nessun collegamento diretto + → GND senza carico?

DOMANDE PRINCIPIO ZERO V3:
PZ1. Il kit fisico ELAB è protagonista nell'immagine (NON simulatore web)?
PZ2. I componenti sono coerenti con la palette Omaric kit (NON SaaS generic)?
PZ3. La citazione Vol/pag che farei combacia con l'experimentId atteso?

Output JSON SCHEMA (rispondi SOLO con JSON, no markdown):
{
  "criteria": {
    "C1": {"verdict": "PASS|FAIL", "motivation": "..."},
    "C2": {...}, ..., "C8": {...}
  },
  "principio_zero": {
    "PZ1": {"verdict": "PASS|FAIL", "motivation": "..."},
    "PZ2": {...},
    "PZ3": {...}
  },
  "overall_verdict": "PASS|FAIL",
  "summary_ragazzi": "Ragazzi, ... (1-2 frasi sintesi)"
}`;

// ─── SCREENSHOT INDEX PARSING ───────────────────────────────────────────────

/**
 * Parse INDEX.md table mapping screenshot file → experiment_id.
 * Format: | NN | circuit-NN.png | v1-cap6-esp1 | desc | status | ... |
 * Returns Map<experimentId, { file: string, description: string }>.
 */
export function parseScreenshotIndex(markdown) {
  const map = new Map();
  if (!markdown) return map;
  const lines = markdown.split('\n');
  for (const line of lines) {
    const m = line.match(/^\|\s*\d+\s*\|\s*(circuit-\d+\.png)\s*\|\s*([\w-]+)\s*\|\s*([^|]+)/);
    if (m) {
      map.set(m[2].trim(), { file: m[1].trim(), description: m[3].trim() });
    }
  }
  return map;
}

// ─── LESSON-PATH LOADER ──────────────────────────────────────────────────────

/**
 * Read all lesson-paths JSON files (excludes index.js).
 * Returns array of { id, volume, chapter, title, file }.
 */
export function loadLessonPaths(dir = LESSON_PATHS_DIR) {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));
  const paths = [];
  for (const f of files) {
    try {
      const content = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      paths.push({
        id: content.experiment_id || basename(f, '.json'),
        volume: content.volume,
        chapter: content.chapter,
        title: content.title || '(no title)',
        file: f,
      });
    } catch {
      // skip malformed
    }
  }
  return paths.sort((a, b) => a.id.localeCompare(b.id));
}

// ─── PIXTRAL EDGE FUNCTION CALL ─────────────────────────────────────────────

/**
 * Send single screenshot to unlim-vision Edge Fn with audit prompt.
 * Returns { success, response, latencyMs, raw } OR { success:false, error }.
 * Tolerates missing creds in MOCK MODE.
 */
export async function callPixtralVision({ promptText, imageBase64, sessionId, fetchImpl = fetch }) {
  if (!SUPABASE_ANON_KEY || !ELAB_API_KEY) {
    return {
      success: false,
      mockMode: true,
      error: 'MOCK_MODE: SUPABASE_ANON_KEY or ELAB_API_KEY missing',
    };
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetchImpl(UNLIM_VISION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Elab-Api-Key': ELAB_API_KEY,
      },
      body: JSON.stringify({
        prompt: promptText,
        images: [imageBase64],
        sessionId,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const errTxt = await res.text();
      return { success: false, status: res.status, error: errTxt.slice(0, 200), latencyMs };
    }
    const data = await res.json();
    return { success: true, response: data.response || '', model: data.model, latencyMs, raw: data };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
    };
  }
}

// ─── RESULT AGGREGATION ─────────────────────────────────────────────────────

/**
 * Parse Pixtral JSON response and extract verdicts (defensive — model may add markdown).
 */
export function parsePixtralResponse(text) {
  if (!text || typeof text !== 'string') return null;
  // Strip markdown fences defensively
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // try to extract { ... } block
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { return null; }
    }
    return null;
  }
}

/**
 * Aggregate per-experiment results into pass/fail counts.
 * Input: array of { experimentId, status, parsed?, error? }.
 * Output: { total, pass, fail, skipped, error, perCriterion, byVolume }.
 */
export function aggregateResults(results) {
  const agg = {
    total: results.length,
    pass: 0,
    fail: 0,
    skipped: 0,
    error: 0,
    perCriterion: {
      C1: { pass: 0, fail: 0 }, C2: { pass: 0, fail: 0 }, C3: { pass: 0, fail: 0 },
      C4: { pass: 0, fail: 0 }, C5: { pass: 0, fail: 0 }, C6: { pass: 0, fail: 0 },
      C7: { pass: 0, fail: 0 }, C8: { pass: 0, fail: 0 },
    },
    principioZero: {
      PZ1: { pass: 0, fail: 0 }, PZ2: { pass: 0, fail: 0 }, PZ3: { pass: 0, fail: 0 },
    },
    byVolume: { 1: { pass: 0, fail: 0, skipped: 0 }, 2: { pass: 0, fail: 0, skipped: 0 }, 3: { pass: 0, fail: 0, skipped: 0 } },
  };
  for (const r of results) {
    if (r.status === 'skipped') agg.skipped++;
    else if (r.status === 'error') agg.error++;
    else if (r.status === 'pass') agg.pass++;
    else if (r.status === 'fail') agg.fail++;

    if (r.volume && agg.byVolume[r.volume]) {
      if (r.status === 'pass') agg.byVolume[r.volume].pass++;
      else if (r.status === 'fail') agg.byVolume[r.volume].fail++;
      else if (r.status === 'skipped') agg.byVolume[r.volume].skipped++;
    }
    if (r.parsed && r.parsed.criteria) {
      for (const k of Object.keys(agg.perCriterion)) {
        const v = r.parsed.criteria[k];
        if (v && v.verdict === 'PASS') agg.perCriterion[k].pass++;
        else if (v && v.verdict === 'FAIL') agg.perCriterion[k].fail++;
      }
    }
    if (r.parsed && r.parsed.principio_zero) {
      for (const k of Object.keys(agg.principioZero)) {
        const v = r.parsed.principio_zero[k];
        if (v && v.verdict === 'PASS') agg.principioZero[k].pass++;
        else if (v && v.verdict === 'FAIL') agg.principioZero[k].fail++;
      }
    }
  }
  return agg;
}

// ─── MAIN HARNESS ────────────────────────────────────────────────────────────

async function runOneExperiment({ experiment, screenshotMap }) {
  const screenshot = screenshotMap.get(experiment.id);
  if (!screenshot) {
    return {
      experimentId: experiment.id,
      volume: experiment.volume,
      title: experiment.title,
      status: 'skipped',
      reason: 'NO_SCREENSHOT_FIXTURE (ground truth DEBT iter 28-29 Andrea+Tea)',
    };
  }
  const screenshotPath = join(SCREENSHOTS_DIR, screenshot.file);
  if (!existsSync(screenshotPath)) {
    return {
      experimentId: experiment.id,
      volume: experiment.volume,
      title: experiment.title,
      status: 'skipped',
      reason: `SCREENSHOT_FILE_MISSING: ${screenshot.file}`,
    };
  }

  // Read PNG → base64 data URI
  const png = readFileSync(screenshotPath);
  const dataUri = `data:image/png;base64,${png.toString('base64')}`;

  const sessionId = `pixtral_bench_${Date.now()}_${experiment.id}`;
  const apiResult = await callPixtralVision({
    promptText: PIXTRAL_AUDIT_PROMPT,
    imageBase64: dataUri,
    sessionId,
  });

  if (!apiResult.success) {
    return {
      experimentId: experiment.id,
      volume: experiment.volume,
      title: experiment.title,
      status: apiResult.mockMode ? 'skipped' : 'error',
      reason: apiResult.error,
      mockMode: !!apiResult.mockMode,
    };
  }

  const parsed = parsePixtralResponse(apiResult.response);
  const verdict = parsed && parsed.overall_verdict === 'PASS' ? 'pass' : 'fail';
  return {
    experimentId: experiment.id,
    volume: experiment.volume,
    title: experiment.title,
    status: parsed ? verdict : 'error',
    latencyMs: apiResult.latencyMs,
    parsed,
    raw: apiResult.response,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const mockMode = !SUPABASE_ANON_KEY || !ELAB_API_KEY;

  console.log('[pixtral-bench] Sprint T iter 28 — Pixtral 12B vision audit scaffold');
  console.log(`[pixtral-bench] Mode: ${mockMode ? 'MOCK (no live Edge Fn calls)' : 'LIVE'}`);
  console.log(`[pixtral-bench] Edge Fn URL: ${UNLIM_VISION_URL}`);

  const lessonPaths = loadLessonPaths();
  console.log(`[pixtral-bench] Loaded ${lessonPaths.length} lesson-paths from ${LESSON_PATHS_DIR}`);

  let screenshotMap = new Map();
  const indexPath = join(SCREENSHOTS_DIR, 'INDEX.md');
  if (existsSync(indexPath)) {
    screenshotMap = parseScreenshotIndex(readFileSync(indexPath, 'utf-8'));
    console.log(`[pixtral-bench] Loaded ${screenshotMap.size} screenshot mappings from INDEX.md`);
  } else {
    console.warn('[pixtral-bench] WARNING: INDEX.md not found, all experiments will skip');
  }

  if (dryRun) {
    console.log('[pixtral-bench] --dry-run: schema check only, no API calls');
  }

  const results = [];
  for (const exp of lessonPaths) {
    if (dryRun) {
      results.push({
        experimentId: exp.id,
        volume: exp.volume,
        title: exp.title,
        status: screenshotMap.has(exp.id) ? 'pass' : 'skipped',
        reason: screenshotMap.has(exp.id) ? 'DRY_RUN_OK' : 'NO_SCREENSHOT_FIXTURE',
      });
      continue;
    }
    const r = await runOneExperiment({ experiment: exp, screenshotMap });
    results.push(r);
    process.stdout.write(`[${results.length}/${lessonPaths.length}] ${exp.id} → ${r.status}\n`);
  }

  const agg = aggregateResults(results);

  const output = {
    _meta: {
      generated: new Date().toISOString(),
      iteration: 'Sprint T iter 28',
      mode: mockMode ? 'MOCK' : 'LIVE',
      dryRun,
      edgeFnUrl: UNLIM_VISION_URL,
      lessonPathsCount: lessonPaths.length,
      screenshotsAvailable: screenshotMap.size,
      caveats: [
        '20 PNG fixtures only — 70+ esperimenti SKIPPED (ground truth DEBT iter 28-29 Andrea+Tea)',
        'Pixtral 12B Italian K-12 accuracy NOT benchmarked against gold set',
        'Judge LLM bias possibile — Pixtral self-judges schema',
        'Pass/fail threshold empirico — NO calibration sample iter 28',
        'ELAB_API_KEY BLOCKED iter 28 default → MOCK MODE; live mode pending Andrea provision',
      ],
    },
    aggregate: agg,
    perExperiment: results,
  };

  mkdirSync(STATE_DIR, { recursive: true });
  const outFile = join(
    STATE_DIR,
    mockMode ? 'pixtral-vision-bench-results-MOCK.json' : 'pixtral-vision-bench-results.json',
  );
  writeFileSync(outFile, JSON.stringify(output, null, 2));
  console.log(`\n[pixtral-bench] Results written: ${outFile}`);
  console.log(`[pixtral-bench] Aggregate: pass=${agg.pass} fail=${agg.fail} skipped=${agg.skipped} error=${agg.error}`);
  console.log('[pixtral-bench] G45: NO claim "92 broken count REVEALED" — scaffold framework only.');
}

// Execute only when run as main script (handle spaced paths via pathToFileURL)
import { pathToFileURL } from 'node:url';
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error('[pixtral-bench] FATAL', err);
    process.exit(1);
  });
}
