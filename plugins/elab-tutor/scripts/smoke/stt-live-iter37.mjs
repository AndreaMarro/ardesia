#!/usr/bin/env node
/**
 * STT live smoke test — iter 37 Phase 3 verification (Tester-4)
 *
 * Goal: verify Maker-1 iter 37 Phase 1 A4 STT CF Whisper 3-shape input handler
 *       (multipart + JSON base64 + raw audio/* binary) ACTUALLY works prod.
 *
 * Matrix: 3 audio formats x 3 input shapes = 9 test cases per audio sample.
 *   - Formats: WAV 16kHz PCM | MP3 22kHz | OGG Opus (best effort)
 *   - Shapes:  A) raw binary `audio/<container>`
 *              B) multipart/form-data `audio` field
 *              C) JSON {audio_base64}
 *
 * Acceptance per cell: HTTP 200 + non-empty transcript + at least one IT word
 *                      from set: ['ragazzi','oggi','led','accendere','accendiamo']
 * Verdict: PASS >=6/9, WARN 3-5/9, FAIL <3/9.
 *
 * Env required:
 *   SUPABASE_ANON_KEY  (auth bearer for Supabase Edge Function)
 *   ELAB_API_KEY       (X-Elab-Api-Key header per project guard)
 *
 * (c) Andrea Marro / Tester-4 — 2026-04-30
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();

const STT_URL = `${SUPABASE_URL}/functions/v1/unlim-stt`;
const TTS_URL = `${SUPABASE_URL}/functions/v1/unlim-tts`;

const PHRASE_IT = 'Ragazzi, oggi accendiamo il LED.';
const ITALIAN_KEYWORDS = ['ragazz', 'oggi', 'led', 'accend'];

const OUT_DIR = path.join(REPO_ROOT, 'scripts', 'bench', 'output', 'stt-live-iter37');

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function preflightCheck() {
  const missing = [];
  if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
  if (!ELAB_API_KEY) missing.push('ELAB_API_KEY');
  return missing;
}

// ---------- Magic-byte container detection (mirror cloudflare-client) ----------
function detectAudioContainer(bytes) {
  if (!bytes || bytes.length < 12) return 'unknown';
  // OggS
  if (bytes[0]===0x4f && bytes[1]===0x67 && bytes[2]===0x67 && bytes[3]===0x53) return 'ogg';
  // RIFF....WAVE
  if (bytes[0]===0x52 && bytes[1]===0x49 && bytes[2]===0x46 && bytes[3]===0x46
      && bytes[8]===0x57 && bytes[9]===0x41 && bytes[10]===0x56 && bytes[11]===0x45) return 'wav';
  // 1A45DFA3 EBML => WebM/Matroska
  if (bytes[0]===0x1a && bytes[1]===0x45 && bytes[2]===0xdf && bytes[3]===0xa3) return 'webm';
  // fLaC
  if (bytes[0]===0x66 && bytes[1]===0x4c && bytes[2]===0x61 && bytes[3]===0x43) return 'flac';
  // ID3 (MP3 with ID3v2)
  if (bytes[0]===0x49 && bytes[1]===0x44 && bytes[2]===0x33) return 'mp3';
  // MPEG sync (FF Fx)
  if (bytes[0]===0xff && (bytes[1] & 0xe0) === 0xe0) return 'mp3';
  // ftyp box (MP4/M4A): bytes 4-7 'ftyp'
  if (bytes[4]===0x66 && bytes[5]===0x74 && bytes[6]===0x79 && bytes[7]===0x70) return 'mp4';
  return 'unknown';
}

function contentTypeFor(container) {
  switch (container) {
    case 'wav':  return 'audio/wav';
    case 'mp3':  return 'audio/mpeg';
    case 'ogg':  return 'audio/ogg';
    case 'webm': return 'audio/webm';
    case 'flac': return 'audio/flac';
    case 'mp4':  return 'audio/mp4';
    default:     return 'application/octet-stream';
  }
}

// ---------- Synthesize minimal WAV (PCM 16-bit mono 16kHz, ~1s sine 440Hz) ----------
// Used ONLY if TTS WAV format unsupported. Will NOT contain Italian speech, so
// the matrix cell will record container detection but transcription text empty
// (graceful FAIL on transcript content, not on infrastructure).
function synthesizeWavStub() {
  const sampleRate = 16000;
  const duration = 1; // seconds
  const numSamples = sampleRate * duration;
  const dataSize = numSamples * 2; // 16-bit mono
  const buf = Buffer.alloc(44 + dataSize);
  // RIFF header
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);          // fmt chunk size
  buf.writeUInt16LE(1, 20);           // PCM
  buf.writeUInt16LE(1, 22);           // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);           // block align
  buf.writeUInt16LE(16, 34);          // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  // 440Hz sine
  for (let i = 0; i < numSamples; i++) {
    const v = Math.round(Math.sin(2 * Math.PI * 440 * i / sampleRate) * 16000);
    buf.writeInt16LE(v, 44 + i * 2);
  }
  return buf;
}

// ---------- Fetch TTS in target format ----------
async function tts(text, format) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Elab-Api-Key': ELAB_API_KEY,
    },
    body: JSON.stringify({
      text,
      sessionId: crypto.randomUUID(),
      provider: 'voxtral',
      format,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: errText.slice(0, 200) };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') || '';
  return { ok: true, status: res.status, buf, contentType: ct };
}

// ---------- Send to STT in given input shape ----------
async function sttRawBinary(audioBuf, container) {
  const t0 = Date.now();
  const ct = contentTypeFor(container);
  const sessionId = crypto.randomUUID();
  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Elab-Api-Key': ELAB_API_KEY,
      'Content-Type': ct,
      'x-session-id': sessionId,
      'x-language': 'it',
    },
    body: audioBuf,
  });
  const latency_ms = Date.now() - t0;
  let body;
  try { body = await res.json(); } catch { body = { _raw: await res.text().catch(() => '') }; }
  return { status: res.status, latency_ms, body, contentTypeSent: ct };
}

async function sttMultipart(audioBuf, container) {
  const t0 = Date.now();
  const ct = contentTypeFor(container);
  const ext = container === 'mp3' ? 'mp3' : (container === 'wav' ? 'wav' : (container === 'ogg' ? 'ogg' : 'bin'));
  const file = new File([audioBuf], `sample.${ext}`, { type: ct });
  const fd = new FormData();
  fd.append('audio', file);
  fd.append('language', 'it');
  fd.append('sessionId', crypto.randomUUID());
  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Elab-Api-Key': ELAB_API_KEY,
      // Content-Type set automatically by FormData with boundary
    },
    body: fd,
  });
  const latency_ms = Date.now() - t0;
  let body;
  try { body = await res.json(); } catch { body = { _raw: await res.text().catch(() => '') }; }
  return { status: res.status, latency_ms, body };
}

async function sttJsonBase64(audioBuf) {
  const t0 = Date.now();
  const audio_base64 = audioBuf.toString('base64');
  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Elab-Api-Key': ELAB_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_base64,
      language: 'it',
      sessionId: crypto.randomUUID(),
    }),
  });
  const latency_ms = Date.now() - t0;
  let body;
  try { body = await res.json(); } catch { body = { _raw: await res.text().catch(() => '') }; }
  return { status: res.status, latency_ms, body };
}

function evaluateCell(result) {
  const { status, body } = result;
  const transcript = (body && (body.text || body.transcript)) || '';
  const lower = transcript.toLowerCase();
  const matchedKeywords = ITALIAN_KEYWORDS.filter(k => lower.includes(k));
  const httpOk = status === 200;
  const hasText = transcript.length > 0;
  const hasItWord = matchedKeywords.length > 0;
  const verdict = (httpOk && hasText && hasItWord) ? 'PASS' : (httpOk && hasText ? 'WARN' : 'FAIL');
  return { transcript, matchedKeywords, verdict };
}

async function loadAudioSamples() {
  const samples = [];

  // 1. MP3 fixture (existing iter 31 Voxtral output Italian)
  const mp3FixturePath = path.join(REPO_ROOT, 'scripts', 'bench', 'output', 'voxtral-test', 'voxtral-T1.mp3');
  if (fs.existsSync(mp3FixturePath)) {
    const buf = fs.readFileSync(mp3FixturePath);
    samples.push({
      label: 'mp3-fixture',
      desiredFormat: 'mp3',
      buf,
      sourceNote: `fixture ${path.relative(REPO_ROOT, mp3FixturePath)} (Voxtral IT)`,
    });
  } else {
    samples.push({
      label: 'mp3-fixture',
      desiredFormat: 'mp3',
      buf: null,
      error: 'mp3 fixture missing',
    });
  }

  // 2. WAV via TTS request format=wav
  const wavTts = await tts(PHRASE_IT, 'wav');
  if (wavTts.ok && wavTts.buf && wavTts.buf.length > 0) {
    samples.push({
      label: 'wav-tts',
      desiredFormat: 'wav',
      buf: wavTts.buf,
      sourceNote: `Voxtral TTS format=wav (${wavTts.buf.length} bytes, ct=${wavTts.contentType})`,
    });
  } else {
    // Fallback: synthesize stub WAV (no Italian speech, infra-only test)
    const stub = synthesizeWavStub();
    samples.push({
      label: 'wav-stub',
      desiredFormat: 'wav',
      buf: stub,
      sourceNote: `synthetic 440Hz sine 1s (TTS wav failed: ${wavTts.error || 'unknown'})`,
      stubAudio: true,
    });
  }

  // 3. OGG via TTS request format=opus (Voxtral may emit Ogg Opus)
  const oggTts = await tts(PHRASE_IT, 'opus');
  if (oggTts.ok && oggTts.buf && oggTts.buf.length > 0) {
    samples.push({
      label: 'ogg-tts',
      desiredFormat: 'ogg',
      buf: oggTts.buf,
      sourceNote: `Voxtral TTS format=opus (${oggTts.buf.length} bytes, ct=${oggTts.contentType})`,
    });
  } else {
    samples.push({
      label: 'ogg-tts',
      desiredFormat: 'ogg',
      buf: null,
      error: `TTS opus failed: ${oggTts.error || `status ${oggTts.status}`}`,
    });
  }

  return samples;
}

async function runMatrix() {
  ensureDir(OUT_DIR);
  const samples = await loadAudioSamples();
  const matrix = [];
  for (const sample of samples) {
    const audioOut = path.join(OUT_DIR, `${sample.label}.bin`);
    if (sample.buf) {
      fs.writeFileSync(audioOut, sample.buf);
      sample.detectedContainer = detectAudioContainer(sample.buf);
    }
    for (const shape of ['raw-binary', 'multipart', 'json-base64']) {
      const cellId = `${sample.label}__${shape}`;
      if (!sample.buf) {
        matrix.push({
          sample: sample.label,
          shape,
          status: null,
          latency_ms: null,
          transcript: '',
          matchedKeywords: [],
          verdict: 'BLOCKED',
          error: sample.error,
        });
        continue;
      }
      let res;
      try {
        if (shape === 'raw-binary') {
          res = await sttRawBinary(sample.buf, sample.detectedContainer);
        } else if (shape === 'multipart') {
          res = await sttMultipart(sample.buf, sample.detectedContainer);
        } else {
          res = await sttJsonBase64(sample.buf);
        }
      } catch (e) {
        matrix.push({
          sample: sample.label,
          shape,
          status: null,
          latency_ms: null,
          transcript: '',
          matchedKeywords: [],
          verdict: 'ERROR',
          error: String(e?.message || e),
        });
        continue;
      }
      const ev = evaluateCell(res);
      matrix.push({
        sample: sample.label,
        shape,
        status: res.status,
        latency_ms: res.latency_ms,
        transcript: ev.transcript.slice(0, 200),
        matchedKeywords: ev.matchedKeywords,
        verdict: ev.verdict,
        responseError: (res.body && res.body.error) || null,
        responseDetails: (res.body && res.body.details) ? String(res.body.details).slice(0, 500) : null,
        contentTypeSent: res.contentTypeSent || null,
        stubAudio: !!sample.stubAudio,
      });
      console.log(`[${cellId}] HTTP ${res.status} ${res.latency_ms}ms verdict=${ev.verdict} matched=[${ev.matchedKeywords.join(',')}] text="${ev.transcript.slice(0, 60)}"`);
    }
  }
  return { samples, matrix };
}

function summarize(matrix) {
  const total = matrix.length;
  const pass = matrix.filter(c => c.verdict === 'PASS').length;
  const warn = matrix.filter(c => c.verdict === 'WARN').length;
  const fail = matrix.filter(c => c.verdict === 'FAIL').length;
  const blocked = matrix.filter(c => c.verdict === 'BLOCKED' || c.verdict === 'ERROR').length;
  let verdict = 'FAIL';
  if (pass >= 6) verdict = 'PASS';
  else if (pass >= 3) verdict = 'WARN';
  return { total, pass, warn, fail, blocked, verdict };
}

async function main() {
  const missing = preflightCheck();
  if (missing.length > 0) {
    console.error(`[preflight] missing env: ${missing.join(', ')}`);
    console.error(`[preflight] runner exit early — provide envs and re-run.`);
    process.exit(2);
  }
  console.log(`[setup] STT_URL=${STT_URL}`);
  console.log(`[setup] phrase="${PHRASE_IT}"`);
  const startedAt = new Date().toISOString();
  const { samples, matrix } = await runMatrix();
  const summary = summarize(matrix);
  const finishedAt = new Date().toISOString();
  const out = {
    iteration: 'iter-37-phase3-tester4',
    startedAt,
    finishedAt,
    phrase: PHRASE_IT,
    samples: samples.map(s => ({
      label: s.label,
      desiredFormat: s.desiredFormat,
      detectedContainer: s.detectedContainer || null,
      sourceNote: s.sourceNote || null,
      error: s.error || null,
      stubAudio: !!s.stubAudio,
      bytes: s.buf ? s.buf.length : 0,
    })),
    matrix,
    summary,
  };
  ensureDir(OUT_DIR);
  const reportJson = path.join(OUT_DIR, `stt-live-iter37-${Date.now()}.json`);
  fs.writeFileSync(reportJson, JSON.stringify(out, null, 2));
  console.log(`\n=== SUMMARY ===`);
  console.log(`total=${summary.total} pass=${summary.pass} warn=${summary.warn} fail=${summary.fail} blocked=${summary.blocked}`);
  console.log(`verdict=${summary.verdict}`);
  console.log(`report=${reportJson}`);
}

main().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
