import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..').replace(/%20/g, ' ');
const OUT_DIR = path.join(ROOT, 'docs/audits/2026-05-09-unlim-response-quality-speed');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function importTsModule(relativePath) {
  const { transformSync } = await import('esbuild');
  const sourcePath = path.join(ROOT, relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const transformed = transformSync(source, {
    loader: 'ts',
    format: 'esm',
    target: 'es2022',
  }).code;
  const encoded = Buffer.from(transformed).toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

const {
  buildDirectOperationalResponse,
  capWordsPreservingControlTags,
  classifyResponseQualityIntent,
  splitControlTags,
  visibleSentenceCount,
  visibleWordCount,
  UNLIM_THINKING_LABEL,
} = await importTsModule('supabase/functions/_shared/operational-response.ts');

const categories = [
  ['vague', ['fai tu', 'non so da dove partire', 'sono in panico, aiutami', 'boh', 'decidi tu']],
  ['teacher_panic', ['la classe aspetta, cosa faccio?', 'ho 2 minuti e il LED non va', 'devo salvare la lezione ora', 'mi si e bloccato tutto', 'parti da una cosa semplice']],
  ['circuit_changed', ['e cambiato qualcosa, come mai?', 'ho spostato un filo e ora fa cosi', 'prima andava, ora no', 'dopo la modifica il LED resta spento', 'il circuito sembra diverso']],
  ['led_fail', ['il LED non si accende', 'il LED e spento', 'perche il LED non va?', 'non vedo luce', 'il LED si accende appena']],
  ['scratch', ['apri Scratch', 'carica i blocchi LED', 'fammi il blink a blocchi', 'usa Blockly per lampeggiare', 'prepara Scratch per pin 13']],
  ['arduino', ['prepara Arduino blink', 'compila il codice', 'fammi un semaforo Arduino', 'scrivi sketch LED', 'carica programma lampeggio']],
  ['screen', ['guarda lo schermo', 'analizza la schermata', 'fammi uno screenshot', 'controlla cosa vedi', 'osserva il circuito sullo schermo']],
  ['do_it', ['monta tu il circuito LED', 'collega D13 al LED', 'costruisci il blink', 'metti un secondo LED in parallelo', 'fai partire la simulazione']],
  ['book_narrative', ['racconta esperimento LED dal libro', 'spiega il percorso del volume 1', 'narra il semaforo come lezione', 'come continua questo capitolo?', 'raccontami il robot del volume 3']],
  ['no_citation', ['spiegami PWM semplice', 'come funziona un pulsante?', 'perche serve GND?', 'cos e analogRead?', 'differenza tra serie e parallelo']],
  ['micro_citation', ['cosa dice il libro sul LED?', 'dammi pagina del primo LED', 'cita il volume sul resistore', 'leggi una micro ancora del PWM', 'dove lo trovo nel volume?']],
  ['act_verify', ['monta e verifica LED', 'compila e dimmi se e ok', 'carica Scratch e verifica', 'apri report fumetto sessione', 'diagnostica e evidenzia']],
  ['clarify', ['quello li', 'sistemalo', 'non va sta cosa', 'mettilo giusto', 'fai come prima']],
];

const circuitWithError = {
  text: 'LED2 spento dopo spostamento',
  components: [{ id: 'led2', type: 'led', state: 'off' }, { id: 'r2', type: 'resistor' }],
  errors: ['led2 scollegato: non esiste un percorso chiuso'],
};

function expandCases() {
  const out = [];
  let id = 1;
  for (const [category, prompts] of categories) {
    for (const prompt of prompts) {
      out.push({
        id: `qr-${String(id).padStart(3, '0')}`,
        category,
        prompt,
        circuitState: /led|circuit|modifica|diagnostica|scolleg|spostato|non va|spento/i.test(prompt) ? circuitWithError : null,
      });
      id += 1;
    }
  }
  const seeds = out.slice();
  while (out.length < 100) {
    const base = seeds[out.length % seeds.length];
    out.push({ ...base, id: `qr-${String(out.length + 1).padStart(3, '0')}`, prompt: `${base.prompt} (classe rumorosa)` });
  }
  return out;
}

function fallbackCandidate(route, prompt) {
  switch (route.intent) {
    case 'explain_brief':
      return 'In breve: e un modo per trasformare un comando elettrico in un effetto visibile. Pensatelo come un rubinetto: non serve parlarne tanto, proviamolo sul kit ELAB.';
    case 'screen_look':
      return 'Guardo la schermata e controllo solo cio che si vede davvero. Se manca lo screenshot, lo catturo prima di dare diagnosi.';
    case 'book_narrative':
      return 'Partiamo dal gesto del volume: componente reale, collegamento semplice, prova visibile. Niente riassunto lungo: facciamo vedere il passaggio chiave sul kit ELAB.';
    default:
      return `Ci sono. Per "${prompt}" faccio il primo passo verificabile e tengo la risposta corta.`;
  }
}

function evaluate(testCase) {
  const route = classifyResponseQualityIntent(testCase.prompt, testCase.circuitState);
  const direct = buildDirectOperationalResponse(testCase.prompt, testCase.circuitState);
  const raw = direct?.response || fallbackCandidate(route, testCase.prompt);
  const response = capWordsPreservingControlTags(raw, route.maxVisibleWords);
  const { prose, tags } = splitControlTags(response);
  const lower = response.toLowerCase();
  const checks = {
    notGeneric: !/(non posso aiutarti|non ho abbastanza contesto|in base al contesto|ottima domanda|certamente)/i.test(response),
    maxLength: visibleWordCount(response) <= route.maxVisibleWords && visibleSentenceCount(response) <= route.maxSentences,
    natural: !/(come assistente|sono un modello|contesto fornito|Sto elaborando|elaborandg)/i.test(response),
    noUselessCitation: testCase.category === 'micro_citation' || !/\b(vol\.\s*\d|pag\.|pagina\s*\d|—\s*vol\.)\b/i.test(prose),
    actionWhenRequested: !/monta|collega|compila|apri|carica|verifica|diagnostica|fai partire|report/i.test(testCase.prompt) || tags.length > 0 || route.toolPlan.length > 0,
    noObjectObject: !response.includes('[object Object]'),
    noDuplicateThinking: !lower.includes('sto elaborando') && !lower.includes('elaborandg'),
    thinkingLabel: UNLIM_THINKING_LABEL === 'Sto ELABorando...',
  };
  return {
    ...testCase,
    route,
    source: direct?.source || 'router-fallback-proxy',
    response,
    visibleWords: visibleWordCount(response),
    visibleSentences: visibleSentenceCount(response),
    controlTags: tags,
    checks,
    pass: Object.values(checks).every(Boolean),
  };
}

function summarizeLatency(samples) {
  const sorted = samples.slice().sort((a, b) => a - b);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 0;
  return {
    count: sorted.length,
    min: sorted[0] || 0,
    p50: at(0.50),
    p95: at(0.95),
    p99: at(0.99),
    max: sorted[sorted.length - 1] || 0,
  };
}

function benchmark(cases) {
  const local = [];
  const routed = [];
  const feedback = [];
  for (let i = 0; i < 400; i += 1) {
    const c = cases[i % cases.length];
    let t0 = performance.now();
    classifyResponseQualityIntent(c.prompt, c.circuitState);
    feedback.push(performance.now() - t0);
    t0 = performance.now();
    buildDirectOperationalResponse(c.prompt, c.circuitState);
    local.push(performance.now() - t0);
    t0 = performance.now();
    evaluate(c);
    routed.push(performance.now() - t0);
  }
  return {
    generatedAt: new Date().toISOString(),
    thresholds: {
      firstUiFeedbackMs: 100,
      localUsefulResponseMs: 500,
      knownOperationalResponseMs: 1500,
      localActionVerifiedMs: 3000,
    },
    firstUiFeedback: summarizeLatency(feedback),
    localUsefulResponse: summarizeLatency(local),
    routedResponse: summarizeLatency(routed),
    apiReady: { measuredBy: 'Playwright benchmark, not this unit microbench' },
    longTask: { measuredBy: 'Playwright benchmark, not this unit microbench' },
    actionVerified: { measuredBy: 'Playwright fast-active benchmark; local parser has tags preserved here' },
    localVsLlm: {
      localCases: cases.filter(c => buildDirectOperationalResponse(c.prompt, c.circuitState)).length,
      llmFallbackCases: cases.filter(c => !buildDirectOperationalResponse(c.prompt, c.circuitState)).length,
    },
  };
}

const cases = expandCases();
const results = cases.map(evaluate);
const quality = {
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed: results.filter(r => r.pass).length,
  failed: results.filter(r => !r.pass).length,
  note: 'Router/local quality harness. Provider LLM quality still requires live/manual audit; this artifact does not claim final PASS.',
  results,
};

fs.writeFileSync(path.join(OUT_DIR, 'response-quality-tests.json'), JSON.stringify(quality, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'speed-benchmark.json'), JSON.stringify(benchmark(cases), null, 2));
console.log(JSON.stringify({ outDir: OUT_DIR, total: quality.total, passed: quality.passed, failed: quality.failed }, null, 2));
