#!/usr/bin/env node
/**
 * Iter 31 — MASSIVE E2E PROD TEST (Batches B,C,D,E,F,G)
 * Andrea mandate: marea test E2E prod, NO REGRESSIONI, evidence-driven, no mock.
 *
 * Run: node scripts/bench/iter-31-massive-e2e.mjs [batch]
 *   batch ∈ {chat, voxtral, vision, stt, imagegen, xflow, all}
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, '..', '..');

// ── Config ──
const SUPABASE_URL = 'https://euqpdueopmlllqjmqnyb.supabase.co';
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ';
const ELAB_API_KEY = (process.env.ELAB_API_KEY || 'f673b9a0ba541addb02d69912611a92941359b63fa29ff666153433c3419326d').trim();
const ORIGIN = 'https://www.elabtutor.school';
const ANDREA_VOICE_ID = '9234f1b6-766a-485f-acc4-e2cf6dc42327';

const BASE_HEADERS = {
  Authorization: `Bearer ${ANON}`,
  apikey: ANON,
  'Content-Type': 'application/json',
  'X-Elab-Api-Key': ELAB_API_KEY,
  Origin: ORIGIN,
};

const OUT = path.join(REPO, 'scripts', 'bench', 'output', 'iter-31-massive-test');
const ts = new Date().toISOString().replace(/[:.]/g, '-');

function uuid() {
  return crypto.randomUUID();
}
function pct(arr, p) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}
function stats(arr) {
  if (!arr.length) return { n: 0 };
  return {
    n: arr.length,
    min: Math.min(...arr),
    max: Math.max(...arr),
    mean: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    p50: pct(arr, 50),
    p95: pct(arr, 95),
    p99: pct(arr, 99),
  };
}
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}
async function postJson(url, body, extraHeaders = {}) {
  const t0 = Date.now();
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: { ...BASE_HEADERS, ...extraHeaders },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, status: 0, error: String(e), latency_ms: Date.now() - t0 };
  }
  const latency_ms = Date.now() - t0;
  const ct = resp.headers.get('content-type') || '';
  let data = null;
  let text = null;
  if (ct.includes('application/json')) {
    try {
      data = await resp.json();
    } catch (e) {
      text = await resp.text().catch(() => '');
    }
  } else {
    text = await resp.text().catch(() => '');
  }
  return { ok: resp.ok, status: resp.status, data, text, latency_ms, headers: Object.fromEntries(resp.headers) };
}
async function postBinary(url, body, extraHeaders = {}) {
  const t0 = Date.now();
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: { ...BASE_HEADERS, ...extraHeaders },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, status: 0, error: String(e), latency_ms: Date.now() - t0 };
  }
  const latency_ms = Date.now() - t0;
  const buf = Buffer.from(await resp.arrayBuffer());
  return {
    ok: resp.ok,
    status: resp.status,
    buf,
    latency_ms,
    contentType: resp.headers.get('content-type') || '',
    headers: Object.fromEntries(resp.headers),
  };
}

// ============ BATCH B — UNLIM CHAT (10 cases) ============
const CHAT_PROMPTS = [
  { id: 'B01', message: 'Spiega LED rosso ai ragazzi 4° primaria', experiment: 'v1-cap6-esp1' },
  { id: 'B02', message: 'Cap.6 esp.1 LED + R: cosa serve?', experiment: 'v1-cap6-esp1' },
  { id: 'B03', message: 'Perché il LED non si accende?', experiment: 'v1-cap6-esp1' },
  { id: 'B04', message: 'Vol1 pag.45: legge di Ohm', experiment: 'v1-cap6-esp1' },
  { id: 'B05', message: 'Quanti tipi di componenti ci sono nel kit?', experiment: 'v1-cap6-esp1' },
  { id: 'B06', message: 'Costruite il circuito sul kit', experiment: 'v1-cap6-esp1' },
  { id: 'B07', message: 'Differenza tra LED e LDR', experiment: 'v1-cap6-esp1' },
  { id: 'B08', message: 'Come collegare resistore?', experiment: 'v1-cap6-esp1' },
  { id: 'B09', message: 'Verifica circuito', experiment: 'v1-cap6-esp1' },
  { id: 'B10', message: 'Genera quiz LED 5 domande', experiment: 'v1-cap6-esp1' },
];
async function runChat() {
  console.log(`[chat] start ${CHAT_PROMPTS.length} cases`);
  const dir = path.join(OUT, 'chat-batch');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  const latencies = [];
  for (const p of CHAT_PROMPTS) {
    const sessionId = uuid();
    const r = await postJson(`${SUPABASE_URL}/functions/v1/unlim-chat`, {
      message: p.message,
      experiment: p.experiment,
      sessionId,
    });
    const responseText = r.data?.response || '';
    const wc = (responseText.match(/\b\w+\b/g) || []).length;
    const checks = {
      http_ok: r.ok,
      http_status: r.status,
      ragazzi_plural: /\bragazz[ie]\b/i.test(responseText),
      vol_pag: /vol(\.|ume)\s*\d+\s*pag/i.test(responseText),
      kit_mention: /\bkit\b/i.test(responseText),
      word_count_60: wc <= 60,
      word_count: wc,
    };
    results.push({
      id: p.id,
      message: p.message,
      experiment: p.experiment,
      sessionId,
      latency_ms: r.latency_ms,
      status: r.status,
      response_text: responseText,
      source: r.data?.source,
      template_id: r.data?.template_id,
      raw: r.data,
      error: r.text || r.error,
      checks,
    });
    latencies.push(r.latency_ms);
    console.log(`[chat] ${p.id} ${r.status} ${r.latency_ms}ms wc=${wc} ragazzi=${checks.ragazzi_plural} volpag=${checks.vol_pag}`);
  }
  const summary = {
    total: results.length,
    pass_http: results.filter((x) => x.checks.http_ok).length,
    pass_ragazzi: results.filter((x) => x.checks.ragazzi_plural).length,
    pass_vol_pag: results.filter((x) => x.checks.vol_pag).length,
    pass_kit: results.filter((x) => x.checks.kit_mention).length,
    pass_wc60: results.filter((x) => x.checks.word_count_60).length,
    latency_stats: stats(latencies),
  };
  writeJson(path.join(dir, `summary-${ts}.json`), { summary, results });
  console.log(`[chat] done`, summary);
  return { batch: 'chat', summary, results };
}

// ============ BATCH C — VOXTRAL TTS (10 cases) ============
const VOXTRAL_TEXTS = [
  'Ragazzi, oggi accendiamo un LED rosso con il kit ELAB sul vostro Arduino Nano R4.',
  'La legge di Ohm dice tensione uguale resistenza per corrente. Sul Volume uno pagina quaranta trovate la formula.',
  'Inserite il LED nella breadboard al foro E5 e collegate al pin tredici di Arduino.',
  'Il LED rosso ha bisogno di una resistenza da duecentoventi Ohm per non bruciare.',
  'Capitolo sei pagina quarantadue: come leggere il codice colore delle resistenze.',
  'Aprite Scratch e trascinate il blocco accendi LED tredici quando inizia il programma.',
  'pinMode tredici OUTPUT dichiara il pin tredici come uscita digitale del vostro Arduino.',
  'Prima di collegare l Arduino al computer, scollegate sempre la batteria di sicurezza ragazzi.',
  'Sul Volume due pagina ottanta trovate lo schema completo del semaforo a tre LED.',
  'Verificate sempre che la gamba lunga del LED sia collegata al positivo del circuito.',
];
async function runVoxtral() {
  console.log(`[voxtral] start ${VOXTRAL_TEXTS.length} cases (voice_id Andrea)`);
  const dir = path.join(OUT, 'voxtral-batch');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  const latencies = [];
  let i = 0;
  for (const text of VOXTRAL_TEXTS) {
    i++;
    const id = `C${String(i).padStart(2, '0')}`;
    const r = await postBinary(`${SUPABASE_URL}/functions/v1/unlim-tts`, {
      text,
      voice_id: ANDREA_VOICE_ID,
    });
    const fileName = `voxtral-${id}.mp3`;
    const filePath = path.join(dir, fileName);
    let size = 0;
    let isMp3 = false;
    if (r.ok && r.buf && r.buf.length > 0) {
      fs.writeFileSync(filePath, r.buf);
      size = r.buf.length;
      isMp3 = r.contentType.includes('audio/mpeg') || r.buf.slice(0, 3).toString() === 'ID3' || (r.buf[0] === 0xff && (r.buf[1] & 0xe0) === 0xe0);
    }
    const voxProvider = r.headers?.['x-tts-provider'] || r.headers?.['X-Tts-Provider'] || '';
    const voxVoiceId = r.headers?.['x-tts-voice'] || r.headers?.['X-Tts-Voice'] || '';
    results.push({
      id,
      text,
      latency_ms: r.latency_ms,
      status: r.status,
      file: fileName,
      size_bytes: size,
      content_type: r.contentType,
      tts_provider: voxProvider,
      tts_voice_id: voxVoiceId,
      is_mp3: isMp3,
      ok: r.ok && size > 0 && isMp3,
    });
    latencies.push(r.latency_ms);
    console.log(`[voxtral] ${id} ${r.status} ${r.latency_ms}ms size=${size}B mp3=${isMp3} provider=${voxProvider}`);
  }
  const summary = {
    total: results.length,
    pass: results.filter((x) => x.ok).length,
    voice_clone_andrea_used: results.filter((x) => x.tts_voice_id === ANDREA_VOICE_ID || x.tts_voice_id.includes('9234f1b6')).length,
    avg_size: Math.round(results.reduce((a, b) => a + (b.size_bytes || 0), 0) / Math.max(1, results.length)),
    latency_stats: stats(latencies),
  };
  writeJson(path.join(dir, `summary-${ts}.json`), { summary, results });
  console.log(`[voxtral] done`, summary);
  return { batch: 'voxtral', summary, results };
}

// ============ BATCH D — PIXTRAL VISION (5 cases) ============
// 1x1 valid PNGs of different colors (red/green/blue/yellow/black)
function pngBase64(color) {
  // Tiny 8x8 PNG of a single color via a known minimal PNG generator
  const w = 8, h = 8;
  const raw = Buffer.alloc((1 + w * 3) * h);
  const [R, G, B] = color;
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0; // filter byte
    for (let x = 0; x < w; x++) {
      const off = y * (1 + w * 3) + 1 + x * 3;
      raw[off] = R;
      raw[off + 1] = G;
      raw[off + 2] = B;
    }
  }
  const idat = zlib.deflateSync(raw);
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crcBuf = Buffer.concat([t, data]);
    let c = ~0;
    for (const b of crcBuf) {
      c = c ^ b;
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(~c >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const iend = Buffer.alloc(0);
  const buf = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', iend)]);
  return buf.toString('base64');
}
const VISION_CASES = [
  { id: 'D01', label: 'red square (mock LED on)', color: [220, 30, 30], prompt: 'Cosa vedi nel circuito?' },
  { id: 'D02', label: 'black square (mock LED off / inverso)', color: [10, 10, 10], prompt: 'Il LED è acceso o spento? Spiega ai ragazzi.' },
  { id: 'D03', label: 'gray square (breadboard vuota)', color: [180, 180, 180], prompt: 'Cosa c è sulla breadboard?' },
  { id: 'D04', label: 'green square (componenti scattered)', color: [60, 180, 60], prompt: 'Identifica i componenti nel kit.' },
  { id: 'D05', label: 'yellow (circuito completo)', color: [240, 220, 30], prompt: 'Il circuito è corretto? Vol/pag riferimento.' },
];
async function runVision() {
  console.log(`[vision] start ${VISION_CASES.length} cases`);
  const dir = path.join(OUT, 'vision-batch');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  const latencies = [];
  for (const c of VISION_CASES) {
    const b64 = pngBase64(c.color);
    const dataUri = `data:image/png;base64,${b64}`;
    fs.writeFileSync(path.join(dir, `${c.id}.png`), Buffer.from(b64, 'base64'));
    const sessionId = uuid();
    const r = await postJson(`${SUPABASE_URL}/functions/v1/unlim-vision`, {
      prompt: c.prompt,
      images: [dataUri],
      sessionId,
    });
    const responseText = r.data?.response || r.data?.text || '';
    const checks = {
      http_ok: r.ok,
      http_status: r.status,
      italian: /\b(il|la|lo|le|gli|un|una|circuito|LED|kit)\b/i.test(responseText),
      response_present: responseText.length > 10,
    };
    results.push({
      ...c,
      sessionId,
      latency_ms: r.latency_ms,
      status: r.status,
      response_text: responseText,
      raw: r.data,
      error: r.text || r.error,
      checks,
    });
    latencies.push(r.latency_ms);
    console.log(`[vision] ${c.id} ${r.status} ${r.latency_ms}ms italian=${checks.italian} resp_len=${responseText.length}`);
  }
  const summary = {
    total: results.length,
    pass_http: results.filter((x) => x.checks.http_ok).length,
    pass_italian: results.filter((x) => x.checks.italian).length,
    pass_response: results.filter((x) => x.checks.response_present).length,
    latency_stats: stats(latencies),
  };
  writeJson(path.join(dir, `summary-${ts}.json`), { summary, results });
  console.log(`[vision] done`, summary);
  return { batch: 'vision', summary, results };
}

// ============ BATCH E — STT (5 cases) ============
async function runStt() {
  console.log(`[stt] start 5 cases`);
  const dir = path.join(OUT, 'stt-batch');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  const latencies = [];

  // We'll first generate 5 short TTS audio samples, then send each to STT
  const phrases = [
    'Ragazzi accendiamo il LED.',
    'La legge di Ohm.',
    'Volume uno pagina quaranta.',
    'Pin tredici Arduino.',
    'Resistenza duecentoventi Ohm.',
  ];
  for (let i = 0; i < phrases.length; i++) {
    const id = `E${String(i + 1).padStart(2, '0')}`;
    const text = phrases[i];
    // 1) Get TTS mp3
    const tts = await postBinary(`${SUPABASE_URL}/functions/v1/unlim-tts`, { text });
    if (!tts.ok || !tts.buf || tts.buf.length === 0) {
      results.push({ id, text, stage: 'tts', error: `tts ${tts.status}`, latency_ms: tts.latency_ms, ok: false });
      continue;
    }
    const audioPath = path.join(dir, `${id}.mp3`);
    fs.writeFileSync(audioPath, tts.buf);

    // 2) Send audio buf to STT — try octet-stream POST
    const sttUrl = `${SUPABASE_URL}/functions/v1/unlim-stt`;
    const t0 = Date.now();
    let resp;
    try {
      resp = await fetch(sttUrl, {
        method: 'POST',
        headers: {
          ...BASE_HEADERS,
          'Content-Type': 'audio/mpeg',
        },
        body: tts.buf,
      });
    } catch (e) {
      results.push({ id, text, stage: 'stt', error: String(e), latency_ms: Date.now() - t0, ok: false });
      continue;
    }
    const latency_ms = Date.now() - t0;
    let body = null;
    try {
      body = await resp.json();
    } catch (e) {
      body = { error: 'non-json', text: await resp.text().catch(() => '') };
    }
    const transcript = body?.transcript || body?.text || '';
    const ok = resp.ok && transcript.length > 0;
    results.push({
      id,
      text,
      stage: 'stt',
      status: resp.status,
      latency_ms,
      audio_size: tts.buf.length,
      transcript,
      raw: body,
      ok,
    });
    latencies.push(latency_ms);
    console.log(`[stt] ${id} ${resp.status} ${latency_ms}ms transcript="${transcript.slice(0, 40)}"`);
  }
  const summary = {
    total: results.length,
    pass: results.filter((x) => x.ok).length,
    bug_400_persist: results.some((x) => x.status === 400),
    latency_stats: stats(latencies),
  };
  writeJson(path.join(dir, `summary-${ts}.json`), { summary, results });
  console.log(`[stt] done`, summary);
  return { batch: 'stt', summary, results };
}

// ============ BATCH F — FLUX IMG GEN (5 cases) ============
const IMG_PROMPTS = [
  'F01: circuito Arduino LED breadboard didattico',
  'F02: schema kit ELAB componenti',
  'F03: bambino programma Arduino classe scuola',
  'F04: LED rosso giallo verde circuito',
  'F05: breadboard con resistore e LED',
];
async function runImagegen() {
  console.log(`[imagegen] start ${IMG_PROMPTS.length} cases`);
  const dir = path.join(OUT, 'imagegen-batch');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  const latencies = [];
  for (const p of IMG_PROMPTS) {
    const id = p.split(':')[0];
    const prompt = p.split(':').slice(1).join(':').trim();
    const sessionId = uuid();
    const r = await postJson(`${SUPABASE_URL}/functions/v1/unlim-imagegen`, { prompt, sessionId });
    let pngFile = null;
    let pngSize = 0;
    if (r.ok && r.data) {
      const dataUri = r.data.image || r.data.image_b64 || r.data.url || '';
      let b64 = '';
      if (typeof dataUri === 'string') {
        if (dataUri.startsWith('data:image/')) {
          b64 = dataUri.split(',')[1] || '';
        } else if (dataUri.startsWith('http')) {
          // url; fetch
          try {
            const imgResp = await fetch(dataUri);
            const buf = Buffer.from(await imgResp.arrayBuffer());
            pngFile = `${id}.png`;
            fs.writeFileSync(path.join(dir, pngFile), buf);
            pngSize = buf.length;
          } catch (e) {
            // ignore
          }
        } else {
          b64 = dataUri; // raw b64
        }
      }
      if (b64) {
        const buf = Buffer.from(b64, 'base64');
        pngFile = `${id}.png`;
        fs.writeFileSync(path.join(dir, pngFile), buf);
        pngSize = buf.length;
      }
    }
    results.push({
      id,
      prompt,
      sessionId,
      latency_ms: r.latency_ms,
      status: r.status,
      file: pngFile,
      file_size: pngSize,
      raw_keys: r.data ? Object.keys(r.data) : [],
      error: r.text || r.error,
      ok: r.ok && pngSize > 0,
    });
    latencies.push(r.latency_ms);
    console.log(`[imagegen] ${id} ${r.status} ${r.latency_ms}ms size=${pngSize}B file=${pngFile}`);
  }
  const summary = {
    total: results.length,
    pass: results.filter((x) => x.ok).length,
    avg_size: Math.round(results.reduce((a, b) => a + (b.file_size || 0), 0) / Math.max(1, results.length)),
    latency_stats: stats(latencies),
  };
  writeJson(path.join(dir, `summary-${ts}.json`), { summary, results });
  console.log(`[imagegen] done`, summary);
  return { batch: 'imagegen', summary, results };
}

// ============ BATCH G — Cross-component flow (5 cases) ============
async function runXFlow() {
  console.log('[xflow] start 5 cases');
  const dir = path.join(OUT, 'xflow-batch');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];

  // G1 — chat → TTS audio reply (mount + speak)
  {
    const sessionId = uuid();
    const chat = await postJson(`${SUPABASE_URL}/functions/v1/unlim-chat`, {
      message: 'Monta esperimento LED Vol1 cap6 esp1 e spiega in 50 parole',
      experiment: 'v1-cap6-esp1',
      sessionId,
    });
    const txt = chat.data?.response || '';
    const tts = await postBinary(`${SUPABASE_URL}/functions/v1/unlim-tts`, { text: txt.slice(0, 200) || 'Ragazzi accendiamo il LED.' });
    const audioOk = tts.ok && tts.buf?.length > 0;
    if (audioOk) fs.writeFileSync(path.join(dir, 'G01-chat-tts.mp3'), tts.buf);
    results.push({
      id: 'G01',
      desc: 'mount → speak chain',
      sessionId,
      chat_status: chat.status,
      chat_latency_ms: chat.latency_ms,
      tts_status: tts.status,
      tts_latency_ms: tts.latency_ms,
      audio_size: tts.buf?.length || 0,
      ok: chat.ok && audioOk,
    });
    console.log(`[xflow] G01 chat=${chat.status} tts=${tts.status} audio=${tts.buf?.length || 0}B`);
  }

  // G2 — vision response → TTS speech
  {
    const b64 = pngBase64([200, 30, 30]);
    const vision = await postJson(`${SUPABASE_URL}/functions/v1/unlim-vision`, {
      prompt: 'Cosa vedi? Spiega ai ragazzi in italiano semplice.',
      images: [`data:image/png;base64,${b64}`],
    });
    const visTxt = vision.data?.response || vision.data?.text || '';
    const tts = await postBinary(`${SUPABASE_URL}/functions/v1/unlim-tts`, { text: visTxt.slice(0, 300) || 'Vediamo il circuito.' });
    const audioOk = tts.ok && tts.buf?.length > 0;
    if (audioOk) fs.writeFileSync(path.join(dir, 'G02-vision-tts.mp3'), tts.buf);
    results.push({
      id: 'G02',
      desc: 'vision → speak chain',
      vision_status: vision.status,
      vision_latency_ms: vision.latency_ms,
      vision_response_len: visTxt.length,
      tts_status: tts.status,
      tts_latency_ms: tts.latency_ms,
      audio_size: tts.buf?.length || 0,
      ok: vision.ok && audioOk,
    });
    console.log(`[xflow] G02 vision=${vision.status} tts=${tts.status}`);
  }

  // G3 — Passo Passo plurale Ragazzi check
  {
    const sessionId = uuid();
    const chat = await postJson(`${SUPABASE_URL}/functions/v1/unlim-chat`, {
      message: 'Modalità Passo Passo: spiega step 1 LED in 30 parole rivolgendoti ai ragazzi',
      experiment: 'v1-cap6-esp1',
      sessionId,
      mode: 'passo-passo',
    });
    const txt = chat.data?.response || '';
    const ragazzi = /\bragazz[ie]\b/i.test(txt);
    results.push({
      id: 'G03',
      desc: 'Passo-Passo plurale Ragazzi',
      sessionId,
      status: chat.status,
      latency_ms: chat.latency_ms,
      response_text: txt,
      ragazzi_present: ragazzi,
      ok: chat.ok && ragazzi,
    });
    console.log(`[xflow] G03 ragazzi=${ragazzi}`);
  }

  // G4 — Switch experiment Vol2
  {
    const sessionId = uuid();
    const chat1 = await postJson(`${SUPABASE_URL}/functions/v1/unlim-chat`, {
      message: 'Cosa facciamo con Vol1 cap6 esp1?',
      experiment: 'v1-cap6-esp1',
      sessionId,
    });
    const sessionId2 = uuid();
    const chat2 = await postJson(`${SUPABASE_URL}/functions/v1/unlim-chat`, {
      message: 'Cosa facciamo con Vol2 cap1 esp1?',
      experiment: 'v2-cap1-esp1',
      sessionId: sessionId2,
    });
    results.push({
      id: 'G04',
      desc: 'Switch Vol1 → Vol2',
      v1_status: chat1.status,
      v1_response: chat1.data?.response?.slice(0, 200),
      v2_status: chat2.status,
      v2_response: chat2.data?.response?.slice(0, 200),
      ok: chat1.ok && chat2.ok,
    });
    console.log(`[xflow] G04 v1=${chat1.status} v2=${chat2.status}`);
  }

  // G5 — Onniscenza recall
  {
    const sessionId = uuid();
    const chat = await postJson(`${SUPABASE_URL}/functions/v1/unlim-chat`, {
      message: 'Riepiloga la sessione precedente con LED, le difficoltà incontrate e cita Vol/pag.',
      experiment: 'v1-cap6-esp1',
      sessionId,
    });
    const txt = chat.data?.response || '';
    const volpag = /vol(\.|ume)\s*\d+\s*pag/i.test(txt);
    results.push({
      id: 'G05',
      desc: 'Onniscenza recall + Vol/pag',
      sessionId,
      status: chat.status,
      latency_ms: chat.latency_ms,
      response_text: txt,
      vol_pag_cited: volpag,
      ok: chat.ok,
    });
    console.log(`[xflow] G05 volpag=${volpag}`);
  }

  const summary = {
    total: results.length,
    pass: results.filter((x) => x.ok).length,
  };
  writeJson(path.join(dir, `summary-${ts}.json`), { summary, results });
  console.log('[xflow] done', summary);
  return { batch: 'xflow', summary, results };
}

// ============ MAIN ============
async function main() {
  const arg = (process.argv[2] || 'all').toLowerCase();
  fs.mkdirSync(OUT, { recursive: true });
  const all = {};
  const startedAt = new Date().toISOString();

  if (arg === 'chat' || arg === 'all') all.chat = await runChat();
  if (arg === 'voxtral' || arg === 'all') all.voxtral = await runVoxtral();
  if (arg === 'vision' || arg === 'all') all.vision = await runVision();
  if (arg === 'stt' || arg === 'all') all.stt = await runStt();
  if (arg === 'imagegen' || arg === 'all') all.imagegen = await runImagegen();
  if (arg === 'xflow' || arg === 'all') all.xflow = await runXFlow();

  const finishedAt = new Date().toISOString();
  const aggregate = {
    startedAt,
    finishedAt,
    batches: Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.summary])),
  };
  writeJson(path.join(OUT, `aggregate-${ts}.json`), aggregate);
  console.log('\n=== ITER 31 MASSIVE E2E AGGREGATE ===');
  console.log(JSON.stringify(aggregate, null, 2));
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
