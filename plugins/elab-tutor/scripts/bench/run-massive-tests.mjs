#!/usr/bin/env node
/**
 * MASSIVE prod tests — Voxtral, Pixtral, FLUX, STT (Batches 2-5)
 *
 * Andrea iter 21 mandate: TANTISSIMI test sul prodotto deployato.
 * Evidence file-system grounded, NO mock.
 *
 * Run: node scripts/bench/run-massive-tests.mjs [batch]
 *   batch ∈ {voxtral, pixtral, flux, stt, all}
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, '..', '..');

// Load .env
const envFile = fs.readFileSync(path.join(REPO, '.env'), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const SUPABASE_URL = 'https://euqpdueopmlllqjmqnyb.supabase.co';
const ANON = env.VITE_SUPABASE_EDGE_KEY;
if (!ANON) throw new Error('VITE_SUPABASE_EDGE_KEY missing');

const HEADERS = {
  'Authorization': `Bearer ${ANON}`,
  'apikey': ANON,
  'Content-Type': 'application/json',
};

const OUT = path.join(REPO, 'scripts', 'bench', 'output');

function pct(arr, p) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
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

// ============= BATCH 2 — Voxtral 20 IT =============
const VOXTRAL_PROMPTS = [
  // 5 LED + breadboard
  'Ragazzi, oggi accendiamo un LED rosso con il kit ELAB sul vostro Arduino Nano R4.',
  'Inserite il LED nella breadboard al foro E5 e collegate la gamba lunga al pin 13.',
  'Il LED ha due gambe: l anodo lungo va al positivo, il catodo corto al negativo.',
  'Sul libro Volume uno pagina quaranta trovate lo schema della breadboard ELAB.',
  'Se il LED non si accende, controllate l orientamento e la resistenza in serie.',
  // 5 resistenze + Ohm
  'La legge di Ohm dice che la tensione e uguale alla resistenza per la corrente.',
  'Per un LED rosso con cinque volt usate sempre una resistenza da duecentoventi Ohm.',
  'Le bande colorate della resistenza vi dicono il valore: rosso rosso marrone e duecentoventi.',
  'Capitolo sei pagina quarantadue: come leggere il codice colore delle resistenze.',
  'Se mettete una resistenza piu piccola il LED brucia subito, occhio ragazzi.',
  // 5 Arduino code intro
  'Aprite l editor Scratch e trascinate il blocco accendi LED tredici quando inizia.',
  'Il setup viene eseguito una volta sola, il loop si ripete all infinito.',
  'pinMode tredici OUTPUT dichiara il pin tredici come uscita digitale.',
  'digitalWrite tredici HIGH accende il LED, LOW lo spegne.',
  'delay millesecondi mille ferma il programma per un secondo intero.',
  // 5 safety + diagnosi
  'Prima di collegare l Arduino al computer, scollegate la batteria di sicurezza.',
  'Se sentite odore di bruciato, staccate subito il cavo USB dal Nano R4.',
  'Verificate sempre la polarita del LED prima di alimentare il circuito.',
  'Una resistenza calda significa che sta dissipando troppa potenza, controllate.',
  'Se il sensore non risponde, ragazzi controllate i collegamenti sulla breadboard.',
];

async function batchVoxtral() {
  const results = [];
  const dir = path.join(OUT, 'voxtral-20-sample');
  fs.mkdirSync(dir, { recursive: true });
  console.log(`[voxtral] running ${VOXTRAL_PROMPTS.length} samples`);
  for (let i = 0; i < VOXTRAL_PROMPTS.length; i++) {
    const text = VOXTRAL_PROMPTS[i];
    const t0 = Date.now();
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/unlim-tts`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ text, provider: 'voxtral' }),
      });
      const total = Date.now() - t0;
      const serverMs = parseInt(r.headers.get('x-tts-latency-ms') || '0', 10);
      const provider = r.headers.get('x-tts-provider');
      const voice = r.headers.get('x-tts-voice');
      const model = r.headers.get('x-tts-model');
      const buf = Buffer.from(await r.arrayBuffer());
      const file = path.join(dir, `voxtral-${String(i + 1).padStart(2, '0')}.mp3`);
      if (r.ok && buf.length > 1000) fs.writeFileSync(file, buf);
      results.push({
        i: i + 1, text, http: r.status, totalMs: total, serverMs,
        provider, voice, model, size: buf.length,
        file: r.ok ? path.relative(REPO, file) : null,
      });
      console.log(`[voxtral] ${i + 1}/${VOXTRAL_PROMPTS.length} HTTP ${r.status} ${total}ms ${buf.length}B`);
    } catch (e) {
      results.push({ i: i + 1, text, error: String(e.message || e) });
      console.log(`[voxtral] ${i + 1} ERROR ${e.message}`);
    }
  }
  const success = results.filter(r => r.http === 200);
  const summary = {
    total: results.length,
    success: success.length,
    failed: results.length - success.length,
    serverLatency: stats(success.map(r => r.serverMs).filter(Boolean)),
    totalLatency: stats(success.map(r => r.totalMs)),
    avgSize: success.length ? Math.round(success.reduce((a, b) => a + b.size, 0) / success.length) : 0,
    errorRate: ((results.length - success.length) / results.length * 100).toFixed(1) + '%',
  };
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ summary, results }, null, 2));
  console.log('[voxtral] DONE', JSON.stringify(summary, null, 2));
  return { summary, results };
}

// ============= BATCH 3 — Pixtral 20 image =============
// Generate distinct PNGs (different solid colors) so we can verify Pixtral describes them differently
function makePNG(r, g, b) {
  // 8x8 solid color PNG via PNG-8 minimal: simpler approach use canvas-like fake — actually craft a tiny valid PNG
  // For test purposes use a base64 1x1 RGB PNG with known color
  const png = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0, 0, 0, 13, 73, 72, 68, 82,
    0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222,
    0, 0, 0, 12, 73, 68, 65, 84,
    8, 0x99, 99, ((r & 0xff)) , ((g & 0xff)), ((b & 0xff)), 0, 0, 0, 0xff, 0xff, 3, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 73, 69, 78, 68, 0xAE, 0x42, 0x60, 0x82,
  ]);
  // crc fields will be wrong; better to embed a fixed valid 1x1 PNG and just vary the prompt text for variation.
  return png;
}

const VALID_1x1_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const VALID_RED_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

const PIXTRAL_PROMPTS = [
  // 5 mock circuiti LED
  { p: 'Cosa vedi? È un circuito con LED rosso?', tag: 'led-1' },
  { p: 'Descrivi i componenti elettronici in questa immagine.', tag: 'led-2' },
  { p: 'Il LED è collegato correttamente al pin di Arduino?', tag: 'led-3' },
  { p: 'Vedi una resistenza in serie con il LED?', tag: 'led-4' },
  { p: 'Quanti LED ci sono nel circuito?', tag: 'led-5' },
  // 5 mock breadboard
  { p: 'Descrivi il layout della breadboard mostrato.', tag: 'bb-1' },
  { p: 'Quali fori della breadboard sono utilizzati?', tag: 'bb-2' },
  { p: 'Vedi i ponticelli sulla breadboard?', tag: 'bb-3' },
  { p: 'La breadboard è collegata al pin 5V?', tag: 'bb-4' },
  { p: 'Spiega ai ragazzi come è disposta la breadboard.', tag: 'bb-5' },
  // 5 mock errori
  { p: 'Vedi errori in questo circuito? Il LED è invertito?', tag: 'err-1' },
  { p: 'La resistenza ha il valore sbagliato?', tag: 'err-2' },
  { p: 'Ci sono cortocircuiti pericolosi?', tag: 'err-3' },
  { p: 'Il pin GND è collegato male?', tag: 'err-4' },
  { p: 'Il LED brucerà se accendiamo? Spiega perché.', tag: 'err-5' },
  // 5 mock circuiti completi
  { p: 'Spiega tutto il circuito mostrato passo passo.', tag: 'full-1' },
  { p: 'Questo è un semaforo? Descrivilo.', tag: 'full-2' },
  { p: 'Vedi un sensore? Come funziona?', tag: 'full-3' },
  { p: 'Conta tutti i componenti elettronici.', tag: 'full-4' },
  { p: 'Volume 1 pag 45: questo circuito corrisponde?', tag: 'full-5' },
];

async function batchPixtral() {
  const dir = path.join(OUT, 'pixtral-20-image');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  console.log(`[pixtral] running ${PIXTRAL_PROMPTS.length} requests`);
  for (let i = 0; i < PIXTRAL_PROMPTS.length; i++) {
    const { p: prompt, tag } = PIXTRAL_PROMPTS[i];
    const imgB64 = (i % 2 === 0 ? VALID_1x1_PNG_BASE64 : VALID_RED_PNG_BASE64);
    const t0 = Date.now();
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/unlim-vision`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          prompt,
          images: [`data:image/png;base64,${imgB64}`],
          sessionId: `massive-pixtral-${tag}`,
        }),
      });
      const total = Date.now() - t0;
      const json = await r.json().catch(() => ({}));
      const wordCount = (json.response || '').split(/\s+/).filter(Boolean).length;
      const startsWithRagazzi = /^ragazzi/i.test((json.response || '').trim());
      const italianHint = /\b(il|la|le|i|gli|che|nel|della|sono|vedo)\b/i.test(json.response || '');
      results.push({
        i: i + 1, tag, prompt, http: r.status, totalMs: total,
        serverMs: json.latencyMs, model: json.model, provider: json.provider,
        success: !!json.success, wordCount, startsWithRagazzi, italianHint,
        responseExcerpt: (json.response || '').slice(0, 200),
      });
      fs.writeFileSync(path.join(dir, `pixtral-${String(i + 1).padStart(2, '0')}-${tag}.json`),
        JSON.stringify(json, null, 2));
      console.log(`[pixtral] ${i + 1}/${PIXTRAL_PROMPTS.length} HTTP ${r.status} ${total}ms words=${wordCount}`);
    } catch (e) {
      results.push({ i: i + 1, tag, prompt, error: String(e.message || e) });
      console.log(`[pixtral] ${i + 1} ERROR ${e.message}`);
    }
  }
  const success = results.filter(r => r.http === 200 && r.success);
  const italianRate = success.filter(r => r.italianHint).length / Math.max(1, success.length);
  const ragazziRate = success.filter(r => r.startsWithRagazzi).length / Math.max(1, success.length);
  const summary = {
    total: results.length,
    success: success.length,
    failed: results.length - success.length,
    italianRate: (italianRate * 100).toFixed(1) + '%',
    ragazziRate: (ragazziRate * 100).toFixed(1) + '%',
    avgWordCount: Math.round(success.reduce((a, b) => a + b.wordCount, 0) / Math.max(1, success.length)),
    serverLatency: stats(success.map(r => r.serverMs).filter(Boolean)),
    totalLatency: stats(success.map(r => r.totalMs)),
  };
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ summary, results }, null, 2));
  console.log('[pixtral] DONE', JSON.stringify(summary, null, 2));
  return { summary, results };
}

// ============= BATCH 4 — FLUX 20 prompt =============
const FLUX_PROMPTS = [
  // 5 circuiti Arduino base
  'circuito Arduino LED rosso breadboard didattico ELAB',
  'Arduino Nano R4 con potenziometro su breadboard, foto educativa',
  'circuito semplice pulsante e LED, schema elettronico',
  'fotoresistenza connessa ad Arduino, circuito con LED',
  'sensore ultrasuoni HC-SR04 collegato ad Arduino Nano',
  // 5 componenti close-up
  'close-up resistenza elettronica con bande colorate',
  'LED rosso 5mm con gamba lunga e gamba corta in primo piano',
  'breadboard 830 punti vista dall alto in primo piano',
  'cavetti dupont colorati per breadboard primo piano',
  'sensore di temperatura DHT22 in primo piano fotorealistico',
  // 5 mappa concettuale
  'diagramma flusso programma Arduino setup loop',
  'mappa concettuale legge di Ohm V=IR didattica',
  'schema blocchi Scratch for Arduino bambini',
  'diagramma stati semaforo rosso giallo verde',
  'mappa mentale componenti kit elettronica scuola',
  // 5 schema kit
  'schema kit elettronica scuola primaria con Arduino e cavi',
  'foto kit ELAB completo: Arduino, breadboard, LED, resistenze, cavi',
  'organizzazione componenti elettronici in valigetta scuola',
  'tavolo didattico con kit elettronica per classe quinta primaria',
  'esposizione ordinata dei componenti del kit ELAB su sfondo chiaro',
];

async function batchFlux() {
  const dir = path.join(OUT, 'imggen-20-flux');
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  console.log(`[flux] running ${FLUX_PROMPTS.length} prompts`);
  for (let i = 0; i < FLUX_PROMPTS.length; i++) {
    const prompt = FLUX_PROMPTS[i];
    const t0 = Date.now();
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/unlim-imagegen`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ prompt, sessionId: `massive-flux-${i}`, width: 512, height: 512 }),
      });
      const total = Date.now() - t0;
      const json = await r.json().catch(() => ({}));
      let pngFile = null, byteSize = 0;
      if (json.success && json.image) {
        const b64 = json.image.replace(/^data:image\/[a-z]+;base64,/, '');
        const buf = Buffer.from(b64, 'base64');
        byteSize = buf.length;
        pngFile = path.join(dir, `flux-${String(i + 1).padStart(2, '0')}.bin`);
        fs.writeFileSync(pngFile, buf);
      }
      results.push({
        i: i + 1, prompt, http: r.status, totalMs: total,
        success: !!json.success, model: json.model, byteSize,
        file: pngFile ? path.relative(REPO, pngFile) : null,
        error: json.error || null,
      });
      console.log(`[flux] ${i + 1}/${FLUX_PROMPTS.length} HTTP ${r.status} ${total}ms ${byteSize}B`);
    } catch (e) {
      results.push({ i: i + 1, prompt, error: String(e.message || e) });
      console.log(`[flux] ${i + 1} ERROR ${e.message}`);
    }
  }
  const success = results.filter(r => r.http === 200 && r.success);
  const summary = {
    total: results.length,
    success: success.length,
    failed: results.length - success.length,
    avgByteSize: success.length ? Math.round(success.reduce((a, b) => a + b.byteSize, 0) / success.length) : 0,
    totalLatency: stats(success.map(r => r.totalMs)),
  };
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ summary, results }, null, 2));
  console.log('[flux] DONE', JSON.stringify(summary, null, 2));
  return { summary, results };
}

// ============= BATCH 5 — STT 10 audio =============
async function batchStt() {
  const dir = path.join(OUT, 'stt-10-audio');
  fs.mkdirSync(dir, { recursive: true });
  // Use existing voxtral mp3 outputs as inputs (already saved by Batch 2)
  const inputs = [];
  const voxDir = path.join(OUT, 'voxtral-20-sample');
  if (fs.existsSync(voxDir)) {
    const files = fs.readdirSync(voxDir).filter(f => f.endsWith('.mp3')).sort().slice(0, 10);
    for (const f of files) inputs.push(path.join(voxDir, f));
  }
  // Fallback: use voxtral-test directory from previous run
  if (inputs.length < 10) {
    const fallbackDir = path.join(OUT, 'voxtral-test');
    if (fs.existsSync(fallbackDir)) {
      const fbFiles = fs.readdirSync(fallbackDir).filter(f => f.endsWith('.mp3')).sort();
      for (const f of fbFiles) {
        if (inputs.length >= 10) break;
        inputs.push(path.join(fallbackDir, f));
      }
    }
  }
  if (inputs.length === 0) {
    console.log('[stt] SKIP no audio files available');
    fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({
      summary: { total: 0, skip: true, reason: 'no audio inputs' }, results: [] }, null, 2));
    return { summary: { total: 0, skip: true } };
  }
  const results = [];
  console.log(`[stt] running ${inputs.length} requests`);
  for (let i = 0; i < inputs.length; i++) {
    const f = inputs[i];
    const buf = fs.readFileSync(f);
    const b64 = buf.toString('base64');
    const t0 = Date.now();
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/unlim-stt`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ audio_base64: b64, mime: 'audio/mpeg' }),
      });
      const total = Date.now() - t0;
      const text = await r.text();
      let json = null;
      try { json = JSON.parse(text); } catch { json = null; }
      results.push({
        i: i + 1, file: path.basename(f), audioSize: buf.length,
        http: r.status, totalMs: total,
        ok: r.ok, transcript: json?.text || null, error: json?.error || (r.ok ? null : text.slice(0, 300)),
      });
      fs.writeFileSync(path.join(dir, `stt-${String(i + 1).padStart(2, '0')}.json`),
        JSON.stringify({ http: r.status, response: json || text }, null, 2));
      console.log(`[stt] ${i + 1}/${inputs.length} HTTP ${r.status} ${total}ms`);
    } catch (e) {
      results.push({ i: i + 1, file: path.basename(f), error: String(e.message || e) });
      console.log(`[stt] ${i + 1} ERROR ${e.message}`);
    }
  }
  const success = results.filter(r => r.ok);
  const summary = {
    total: results.length,
    success: success.length,
    failed: results.length - success.length,
    bugConfirmed: results.length > 0 && success.length === 0 && results.some(r =>
      (r.error || '').includes('Whisper') || (r.error || '').includes('Type mismatch')
    ),
    totalLatency: stats(results.map(r => r.totalMs).filter(Boolean)),
  };
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ summary, results }, null, 2));
  console.log('[stt] DONE', JSON.stringify(summary, null, 2));
  return { summary, results };
}

// ============= MAIN =============
const which = process.argv[2] || 'all';
const out = {};
if (which === 'voxtral' || which === 'all') out.voxtral = await batchVoxtral();
if (which === 'pixtral' || which === 'all') out.pixtral = await batchPixtral();
if (which === 'flux' || which === 'all') out.flux = await batchFlux();
if (which === 'stt' || which === 'all') out.stt = await batchStt();

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const summaryFile = path.join(OUT, `iter-29-massive`, `massive-summary-${stamp}.json`);
fs.mkdirSync(path.dirname(summaryFile), { recursive: true });
fs.writeFileSync(summaryFile, JSON.stringify({
  generatedAt: new Date().toISOString(),
  summaries: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.summary])),
}, null, 2));
console.log(`\n=== ALL DONE ===\nSummary: ${path.relative(REPO, summaryFile)}`);
