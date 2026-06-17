#!/usr/bin/env node
/**
 * Iter 25 ClawBot Multi-Tool Dispatch Bench Runner
 * Caveman terse. ESM Node.
 *
 * Uses Edge Function unlim-chat as orchestration entry-point (composite-handler
 * is browser-runtime; bench uses Edge Fn end-to-end as proxy for multi-tool
 * dispatch — UNLIM v3 prompt + RAG + tool-emit pipeline).
 *
 * Output: automa/state/iter-25-clawbot-multitool-results.jsonl (one row per scenario)
 *
 * Run pilot 5:
 *   node scripts/bench/clawbot-multi-tool-50-scenarios.mjs --pilot
 * Run all 50:
 *   node scripts/bench/clawbot-multi-tool-50-scenarios.mjs --full
 *
 * Env required:
 *   SUPABASE_URL=https://euqpdueopmlllqjmqnyb.supabase.co
 *   SUPABASE_ANON_KEY=...
 *   ELAB_API_KEY=...
 */

import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co').trim();
const ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_EDGE_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const OUT_PATH = path.resolve(process.cwd(), 'automa/state/iter-25-clawbot-multitool-results.jsonl');

const ENDPOINT = `${SUPABASE_URL}/functions/v1/unlim-chat`;

// 50 Italian K-12 scenarios — 10 per categoria
const SCENARIOS = [
  // 1. Costruzione circuito (10)
  { id: 'build-01', cat: 'build', q: 'Ragazzi, costruite un LED rosso con resistore 220 ohm su breadboard collegato a D13.' },
  { id: 'build-02', cat: 'build', q: 'Aggiungi 3 LED in parallelo con resistori 220 ohm su pin D11, D12, D13.' },
  { id: 'build-03', cat: 'build', q: 'Monta il circuito Blink standard di Arduino: LED su D13.' },
  { id: 'build-04', cat: 'build', q: 'Costruisci circuito pulsante con pull-up interno su D2 e LED su D13.' },
  { id: 'build-05', cat: 'build', q: 'Monta potenziometro su A0 e LED PWM su D9 per fade.' },
  { id: 'build-06', cat: 'build', q: 'Costruisci semaforo: LED rosso D11, giallo D12, verde D13 con resistori.' },
  { id: 'build-07', cat: 'build', q: 'Costruisci circuito buzzer attivo su D8 con pulsante D2.' },
  { id: 'build-08', cat: 'build', q: 'Monta sensore di luminosità LDR con resistore 10k su A0.' },
  { id: 'build-09', cat: 'build', q: 'Costruisci circuito servo motore SG90 su D9 alimentato 5V.' },
  { id: 'build-10', cat: 'build', q: 'Monta display 7-segmenti pilotato da Arduino su D2-D8.' },

  // 2. Spiegazione + analogia + cita libro (10)
  { id: 'explain-01', cat: 'explain', q: 'Spiega la legge di Ohm citando Vol.1 capitolo 2.' },
  { id: 'explain-02', cat: 'explain', q: 'Cosa è un LED a 3ª media?' },
  { id: 'explain-03', cat: 'explain', q: 'Spiega cosa fa un resistore in serie con un LED.' },
  { id: 'explain-04', cat: 'explain', q: 'Spiega il PWM ai ragazzi di prima media.' },
  { id: 'explain-05', cat: 'explain', q: 'Cita pagina del Volume 1 sul condensatore ceramico.' },
  { id: 'explain-06', cat: 'explain', q: 'Spiega la differenza tra digitalRead e analogRead.' },
  { id: 'explain-07', cat: 'explain', q: 'Cosa è la breadboard? Spiega ai ragazzi di 4ª primaria.' },
  { id: 'explain-08', cat: 'explain', q: 'Cosa significa GND e VCC?' },
  { id: 'explain-09', cat: 'explain', q: 'Spiega delay() e millis() ai ragazzi.' },
  { id: 'explain-10', cat: 'explain', q: 'Spiega la corrente continua citando Vol.2.' },

  // 3. Diagnosi (10)
  { id: 'diag-01', cat: 'diagnose', q: 'Ragazzi, perché il LED non si accende?' },
  { id: 'diag-02', cat: 'diagnose', q: 'Controlla connessioni breadboard: il circuito non funziona.' },
  { id: 'diag-03', cat: 'diagnose', q: 'Il LED è troppo fioco, cosa controllo?' },
  { id: 'diag-04', cat: 'diagnose', q: 'Codice non compila, errore "expected ;".' },
  { id: 'diag-05', cat: 'diagnose', q: 'Servo motore non si muove dopo upload.' },
  { id: 'diag-06', cat: 'diagnose', q: 'LED rovesciato: come riconosco anodo da catodo?' },
  { id: 'diag-07', cat: 'diagnose', q: 'Cortocircuito breadboard: cosa è successo?' },
  { id: 'diag-08', cat: 'diagnose', q: 'Pulsante non risponde quando premo.' },
  { id: 'diag-09', cat: 'diagnose', q: 'Buzzer suona sempre, anche senza segnale.' },
  { id: 'diag-10', cat: 'diagnose', q: 'Serial monitor mostra caratteri strani.' },

  // 4. Voce + comando (10)
  { id: 'voice-01', cat: 'voice', q: 'Carica esperimento v1-cap6-esp1.' },
  { id: 'voice-02', cat: 'voice', q: 'Apri il capitolo 5 del volume 1.' },
  { id: 'voice-03', cat: 'voice', q: 'Mostra il LED sul simulatore.' },
  { id: 'voice-04', cat: 'voice', q: 'Avvia simulazione del circuito attuale.' },
  { id: 'voice-05', cat: 'voice', q: 'Pulisci il canvas.' },
  { id: 'voice-06', cat: 'voice', q: 'Compila il codice Arduino.' },
  { id: 'voice-07', cat: 'voice', q: 'Apri Scratch per programmare visualmente.' },
  { id: 'voice-08', cat: 'voice', q: 'Vai al prossimo esperimento.' },
  { id: 'voice-09', cat: 'voice', q: 'Salva il progetto.' },
  { id: 'voice-10', cat: 'voice', q: 'Chiudi UNLIM e torna alla lavagna.' },

  // 5. Multi-modal (10)
  { id: 'mm-01', cat: 'multimodal', q: 'Foto kit: spiega cosa vedi sui banchi.' },
  { id: 'mm-02', cat: 'multimodal', q: 'Genera illustrazione del capitolo 6 LED Blink e spiega.' },
  { id: 'mm-03', cat: 'multimodal', q: 'Vedi il mio circuito? Diagnostica problemi visivi.' },
  { id: 'mm-04', cat: 'multimodal', q: 'Crea schema breadboard per LED + resistore + pulsante.' },
  { id: 'mm-05', cat: 'multimodal', q: 'Leggi la pagina 87 del Volume 2 ad alta voce.' },
  { id: 'mm-06', cat: 'multimodal', q: 'Genera fumetto report di fine lezione.' },
  { id: 'mm-07', cat: 'multimodal', q: 'Foto componenti kit: identifica resistori da bande colore.' },
  { id: 'mm-08', cat: 'multimodal', q: 'Mostra video di Arduino IDE upload e spiega.' },
  { id: 'mm-09', cat: 'multimodal', q: 'Disegna grafico V/I per resistore 220 ohm.' },
  { id: 'mm-10', cat: 'multimodal', q: 'Voce + immagine: spiega legge Ohm con disegno.' },
];

function pickPilot() {
  return [
    SCENARIOS.find(s => s.id === 'build-01'),
    SCENARIOS.find(s => s.id === 'explain-01'),
    SCENARIOS.find(s => s.id === 'diag-01'),
    SCENARIOS.find(s => s.id === 'voice-01'),
    SCENARIOS.find(s => s.id === 'mm-03'),
  ];
}

async function runOne(scenario) {
  const t0 = Date.now();
  const body = {
    message: scenario.q,
    sessionId: `iter25-${scenario.id}-${Date.now()}`,
    experimentId: 'v1-cap6-esp1',
    circuitState: null,
    images: [],
  };
  let status = 'error', result_text = '', tools_emitted = [], http_status = 0, err_msg = null;
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
        'x-elab-api-key': ELAB_API_KEY,
      },
      body: JSON.stringify(body),
    });
    http_status = r.status;
    const json = await r.json().catch(() => ({}));
    result_text = json.message || json.response || JSON.stringify(json).slice(0, 500);
    // Extract [AZIONE:...] tags
    const azioniMatch = result_text.match(/\[AZIONE:[^\]]+\]/g) || [];
    tools_emitted = azioniMatch.map(t => t.replace(/^\[AZIONE:/, '').replace(/\]$/, ''));
    if (r.ok) status = 'ok';
    else err_msg = `HTTP ${r.status}`;
  } catch (e) {
    err_msg = e.message;
  }
  const elapsed = Date.now() - t0;
  return {
    scenario_id: scenario.id,
    category: scenario.cat,
    query: scenario.q,
    status,
    http_status,
    latency_ms: elapsed,
    result_text: result_text.slice(0, 800),
    tools_emitted,
    tool_count: tools_emitted.length,
    error: err_msg,
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  const mode = process.argv.includes('--full') ? 'full' : 'pilot';
  const scenarios = mode === 'full' ? SCENARIOS : pickPilot();
  console.log(`[bench] mode=${mode} scenarios=${scenarios.length} endpoint=${ENDPOINT}`);
  console.log(`[bench] anon_key=${ANON_KEY ? ANON_KEY.slice(0, 24) + '…' : 'MISSING'}`);
  console.log(`[bench] elab_api=${ELAB_API_KEY ? ELAB_API_KEY.slice(0, 12) + '…' : 'MISSING'}`);

  if (!ANON_KEY) { console.error('SUPABASE_ANON_KEY missing'); process.exit(1); }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  // Truncate fresh per run
  fs.writeFileSync(OUT_PATH, '');

  const results = [];
  for (const s of scenarios) {
    process.stdout.write(`  → ${s.id} (${s.cat})… `);
    const r = await runOne(s);
    results.push(r);
    fs.appendFileSync(OUT_PATH, JSON.stringify(r) + '\n');
    console.log(`[${r.status}] ${r.latency_ms}ms tools=${r.tool_count} http=${r.http_status}`);
  }

  // Summary
  const ok = results.filter(r => r.status === 'ok').length;
  const total = results.length;
  const lats = results.map(r => r.latency_ms).sort((a, b) => a - b);
  const p50 = lats[Math.floor(lats.length / 2)] || 0;
  const p95 = lats[Math.floor(lats.length * 0.95)] || 0;
  const avgTools = (results.reduce((s, r) => s + r.tool_count, 0) / total).toFixed(2);

  console.log('\n=== SUMMARY ===');
  console.log(`success: ${ok}/${total} (${((ok / total) * 100).toFixed(1)}%)`);
  console.log(`latency p50: ${p50}ms`);
  console.log(`latency p95: ${p95}ms`);
  console.log(`avg tools emitted: ${avgTools}`);
  console.log(`output: ${OUT_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
