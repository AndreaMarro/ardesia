import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedGateBypass, bypassWelcomeGate, dismissExperimentPicker } from './helpers/welcome-gate-bypass.js';

test.describe.configure({ mode: 'serial' });
test.skip(process.env.RUN_VOICE_BENCHMARK !== '1', 'Opt-in severe voice benchmark: set RUN_VOICE_BENCHMARK=1');
test.setTimeout(75_000);

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'docs/audits/2026-05-09-unlim-voice-benchmark');
const LOCAL_BASE = /127\.0\.0\.1|localhost/.test(BASE);

const THRESHOLDS = {
  apiReadyMs: 10_000,
  voxtralTtsMs: 10_000,
  kokoroTtsMs: 10_000,
  edgeTtsMs: 15_000,
  minAudioBytes: 1_500,
  voiceUiReadyMs: 10_000,
};

async function fetchAudioBenchmark(page, endpoint, options = {}, timeoutMs = 15_000) {
  return page.evaluate(async ({ endpoint, options }) => {
    const started = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.__timeoutMs || 15_000);
    const fetchOptions = { ...options, signal: controller.signal };
    delete fetchOptions.__timeoutMs;
    try {
      const response = await fetch(endpoint, fetchOptions);
      const contentType = response.headers.get('content-type') || '';
      const provider = response.headers.get('x-tts-provider') || '';
      const voice = response.headers.get('x-tts-voice') || '';
      const model = response.headers.get('x-tts-model') || '';
      const providerLatencyMs = Number(response.headers.get('x-tts-latency-ms') || 0);
      const buffer = await response.arrayBuffer();
      clearTimeout(timer);
      return {
        ok: response.ok,
        status: response.status,
        contentType,
        provider,
        voice,
        model,
        providerLatencyMs,
        bytes: buffer.byteLength,
        latencyMs: performance.now() - started,
      };
    } catch (error) {
      clearTimeout(timer);
      return {
        ok: false,
        status: 0,
        contentType: '',
        bytes: 0,
        latencyMs: performance.now() - started,
        error: error?.message || String(error),
      };
    }
  }, { endpoint, options: { ...options, __timeoutMs: timeoutMs } });
}

test('UNLIM severe voice/reactivity benchmark: TTS, voice UI, no console noise, post-deploy proof', async ({ page }) => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const consoleErrors = [];
  const consoleWarnings = [];
  const networkFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('elab-galileo.onrender.com/health')) return;
    networkFailures.push({
      url,
      resourceType: request.resourceType(),
      errorText: request.failure()?.errorText || '',
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      networkFailures.push({
        url: response.url(),
        resourceType: response.request().resourceType(),
        status: response.status(),
      });
    }
  });

  await seedGateBypass(page);
  const started = Date.now();
  await page.goto(`${BASE}/#lavagna`, { waitUntil: 'domcontentloaded' });
  await bypassWelcomeGate(page);
  await page.waitForFunction(() => !!window.__ELAB_API, null, { timeout: THRESHOLDS.apiReadyMs });
  const apiReadyMs = Date.now() - started;
  await dismissExperimentPicker(page);

  const browserVoice = await page.evaluate(() => ({
    speechSynthesis: typeof window.speechSynthesis !== 'undefined',
    audioConstructor: typeof window.Audio === 'function',
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: typeof navigator.mediaDevices?.getUserMedia === 'function',
    mediaRecorder: typeof window.MediaRecorder === 'function',
    autoplayMedia: document.querySelectorAll('audio[autoplay], video[autoplay]').length,
  }));

  const openUnlim = page.getByRole('button', { name: /Parla con UNLIM/i }).first();
  await expect(openUnlim).toBeVisible({ timeout: THRESHOLDS.voiceUiReadyMs });
  await openUnlim.click();

  const voiceToggle = page.getByRole('button', { name: /Attiva modalità vocale/i }).first();
  await expect(voiceToggle).toBeVisible({ timeout: THRESHOLDS.voiceUiReadyMs });
  await voiceToggle.click();
  const recordButton = page.getByRole('button', { name: /Parla con UNLIM/i }).first();
  const recordVisible = await recordButton.isVisible({ timeout: 5_000 }).catch(() => false);
  const disabledVoiceMessage = await page
    .getByText(/La voce non e disponibile|manca il permesso microfono/i)
    .isVisible({ timeout: 1_000 })
    .catch(() => false);

  const text = encodeURIComponent('Ragazzi, osserviamo il LED: e come un piccolo semaforo del circuito.');
  const voxtralEndpoint = '/api/voxtral';
  const voxtral = await fetchAudioBenchmark(page, voxtralEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: 'Andrea, test Voxtral con voce clonata per UNLIM. Se mi senti, questa e una prova severa.',
      provider: 'voxtral',
      response_format: 'mp3',
    }),
  }, THRESHOLDS.voxtralTtsMs);
  const kokoro = LOCAL_BASE ? { skipped: true, reason: 'Vite dev does not serve Vercel /api/kokoro' } : await fetchAudioBenchmark(page, '/api/kokoro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: 'Ragazzi, osserviamo il LED: e come un piccolo semaforo del circuito.',
      voice: 'if_sara',
      response_format: 'mp3',
    }),
  }, THRESHOLDS.kokoroTtsMs);
  const edgeTts = LOCAL_BASE ? { skipped: true, reason: 'Vite dev does not serve Vercel /api/tts' } : await fetchAudioBenchmark(page, `/api/tts?text=${text}`, {}, THRESHOLDS.edgeTtsMs);

  const realMicProven = process.env.REAL_MIC_PROVEN === '1';
  const failures = [];
  const warnings = [];
  const check = (name, ok, details = {}) => {
    if (!ok) failures.push({ name, ...details });
  };

  check('apiReadyMs', apiReadyMs <= THRESHOLDS.apiReadyMs, { value: apiReadyMs, threshold: THRESHOLDS.apiReadyMs });
  check('speechSynthesis', browserVoice.speechSynthesis, { value: browserVoice.speechSynthesis });
  check('audioConstructor', browserVoice.audioConstructor, { value: browserVoice.audioConstructor });
  check('mediaDevices.getUserMedia', browserVoice.getUserMedia, { value: browserVoice.getUserMedia });
  check('MediaRecorder', browserVoice.mediaRecorder, { value: browserVoice.mediaRecorder });
  check('noAutoplayMedia', browserVoice.autoplayMedia === 0, { value: browserVoice.autoplayMedia });
  check('voiceRecordButtonVisibleAfterToggle', recordVisible, { disabledVoiceMessage });
  check('voxtralStatus', voxtral.ok, voxtral);
  check('voxtralProvider', voxtral.provider === 'voxtral', { value: voxtral.provider, expected: 'voxtral' });
  check('voxtralCloneVoice', voxtral.voice === '9234f1b6-766a-485f-acc4-e2cf6dc42327', {
    value: voxtral.voice,
    expected: '9234f1b6-766a-485f-acc4-e2cf6dc42327',
  });
  check('voxtralAudioBytes', voxtral.bytes >= THRESHOLDS.minAudioBytes, { value: voxtral.bytes, threshold: THRESHOLDS.minAudioBytes });
  check('voxtralLatencyMs', voxtral.latencyMs <= THRESHOLDS.voxtralTtsMs, { value: voxtral.latencyMs, threshold: THRESHOLDS.voxtralTtsMs });
  if (!LOCAL_BASE) {
    check('kokoroStatus', kokoro.ok, kokoro);
    check('kokoroAudioBytes', kokoro.bytes >= THRESHOLDS.minAudioBytes, { value: kokoro.bytes, threshold: THRESHOLDS.minAudioBytes });
    check('kokoroLatencyMs', kokoro.latencyMs <= THRESHOLDS.kokoroTtsMs, { value: kokoro.latencyMs, threshold: THRESHOLDS.kokoroTtsMs });
    check('edgeTtsStatus', edgeTts.ok, edgeTts);
    check('edgeTtsAudioBytes', edgeTts.bytes >= THRESHOLDS.minAudioBytes, { value: edgeTts.bytes, threshold: THRESHOLDS.minAudioBytes });
    check('edgeTtsLatencyMs', edgeTts.latencyMs <= THRESHOLDS.edgeTtsMs, { value: edgeTts.latencyMs, threshold: THRESHOLDS.edgeTtsMs });
  }
  check('consoleErrors', consoleErrors.length === 0, { value: consoleErrors.length, errors: consoleErrors });
  check('networkFailures', networkFailures.length === 0, { value: networkFailures.length, failures: networkFailures });
  if (!realMicProven) {
    warnings.push({
      name: 'realMicrophoneHardwareLog',
      value: 'NOT_PROVEN',
      reason: 'Headless browser endpoint/UI checks do not prove real microphone capture or classroom audio playback.',
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    thresholds: THRESHOLDS,
    apiReadyMs,
    browserVoice,
    ui: { recordVisible, disabledVoiceMessage },
    endpoints: { voxtral, kokoro, edgeTts },
    console: { errors: consoleErrors, warnings: consoleWarnings },
    networkFailures,
    warnings,
    verdict: failures.length === 0 ? 'PASS' : 'FAIL',
    failures,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, 'voice-reactivity-benchmark.json'),
    JSON.stringify(report, null, 2),
  );

  expect(failures).toEqual([]);
});
