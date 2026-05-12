/**
 * OpenClaw State Snapshot Aggregator
 *
 * Single-pass context builder for UNLIM onniscenza. Fetches in parallel:
 *   1. Live simulator state   → window.__ELAB_API.unlim.getCircuitState() + getCircuitDescription()
 *   2. Wiki LLM RAG           → makeRetriever(corpus) from scripts/wiki-query-core.mjs (Sett-4 POC)
 *   3. RAG chunks offline     → src/data/rag-chunks.json (549 chunks, legacy but still useful)
 *   4. Past sessions memory   → Supabase sessions table via unlimMemory 3-tier
 *   5. Vision (on demand)     → window.__ELAB_API.captureScreenshot() + Gemini Vision
 *
 * Target latency (local VPS): <100ms total (P95).
 * Target latency (cloud fallback Together AI teacher-mode only): <400ms.
 *
 * INTEGRATION WITH EXISTING WORK (do NOT duplicate):
 *   - scripts/wiki-query-core.mjs     → keyword retriever (Sett-4 Day 27)
 *   - scripts/wiki-corpus-loader.mjs  → markdown+front-matter loader (Sett-4 Day 27)
 *   - supabase/functions/unlim-wiki-query/index.ts → Deno edge runtime sibling (Sett-4)
 *   - src/services/unlimContextCollector.js → already collects circuit/code/step/errors/pin (reuse)
 *   - src/services/unlimMemory.js    → 3-tier memory (short/mid/long) Supabase-backed (reuse)
 *
 * Anti-pattern avoided: this is a THIN aggregator. No new retrieval logic.
 * Just orchestrates existing modules with Promise.all + graceful degradation.
 *
 * (c) ELAB Tutor — 2026-04-22
 */

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

export interface CircuitState {
  components: Array<{ id: string; type: string; x: number; y: number; value?: number }>;
  wires: Array<{ id: string; from: string; to: string }>;
  serialOutput?: string;
  experimentId?: string;
  step?: number;
  isRunning?: boolean;
}

export interface WikiHit {
  id: string;
  title: string;
  volume?: string | number;
  chapter?: string | number;
  page?: string | number;
  excerpt: string;
  score: number;
}

export interface RagChunk {
  id: string;
  text: string;
  source?: string;
  volume?: string;
  page?: number;
  score?: number;
}

export interface PastSession {
  id: string;
  startedAt: string;
  durationSec: number;
  experimentId?: string;
  highlights?: string[];
  diagnosis?: string[];
}

export interface VisionResult {
  captured: boolean;
  blobDataUrl?: string;       // data:image/png;base64,...
  dimensions?: { w: number; h: number };
  description?: string;        // Gemini Vision diagnosis (if requested)
}

export interface StateSnapshot {
  fetchedAt: string;           // ISO timestamp
  latencyMs: number;            // total wall time
  perLayerMs: Record<string, number>;
  // Layers
  circuit: CircuitState | null;
  circuitDescription: string | null;
  wiki: WikiHit[];             // from Sett-4 Wiki LLM retriever
  rag: RagChunk[];             // from legacy rag-chunks.json (549 offline)
  pastSessions: PastSession[]; // unlimMemory
  vision: VisionResult | null; // only if requested
  student: { locale: string; age?: number; classKey?: string };
  experiment: { id?: string; step?: number; volume?: number; page?: number };
  // Layer statuses for debugging
  status: Record<string, 'ok' | 'empty' | 'error'>;
  errors: Array<{ layer: string; message: string }>;
}

export interface AggregatorOptions {
  query?: string;              // used for Wiki + RAG semantic search
  topKWiki?: number;           // default 3
  topKRag?: number;            // default 5
  includeVision?: boolean;     // default false (slow + bandwidth)
  pastSessionsLimit?: number;  // default 3
  volumeFilter?: string | number; // wiki/rag volume filter
  locale?: string;             // default 'it'
  timeoutMs?: number;          // overall timeout, default 400
}

// ════════════════════════════════════════════════════════════════════
// Interface for injected dependencies (testable)
// ════════════════════════════════════════════════════════════════════

export interface ElabApiLike {
  unlim: {
    getCircuitState(): Promise<CircuitState> | CircuitState;
    getCircuitDescription?(): Promise<string> | string;
  };
  captureScreenshot?(): Promise<{ dataUrl: string; w: number; h: number }> | { dataUrl: string; w: number; h: number };
}

export interface WikiRetrieverLike {
  retrieve(req: { query: string; topK: number; filter?: { volume?: string | number } }): Promise<WikiHit[]>;
  size: number;
}

export interface UnlimMemoryLike {
  recentSessions(limit: number): Promise<PastSession[]>;
}

export interface RagSearcherLike {
  searchRAGChunks(query: string, topK: number): Promise<RagChunk[]> | RagChunk[];
}

export interface VisionClientLike {
  analyzeScreenshot(dataUrl: string, prompt: string): Promise<string>;
}

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * Wrap a promise with a timeout. On timeout resolves to `fallback` + rejects-race nothing.
 * We swallow timeouts here and report them via the status/errors channel rather than throwing.
 */
async function withTimeout<T>(
  p: Promise<T> | T,
  timeoutMs: number,
  fallback: T,
  label: string,
  errors: Array<{ layer: string; message: string }>
): Promise<{ value: T; ms: number; status: 'ok' | 'empty' | 'error' }> {
  const start = nowMs();
  try {
    const result = await Promise.race<T>([
      Promise.resolve(p),
      new Promise<T>((resolve) => setTimeout(() => {
        errors.push({ layer: label, message: `timeout after ${timeoutMs}ms` });
        resolve(fallback);
      }, timeoutMs)),
    ]);
    const ms = Math.round(nowMs() - start);
    const status = result === fallback
      ? 'error'
      : (Array.isArray(result) && result.length === 0) ? 'empty' : 'ok';
    return { value: result, ms, status };
  } catch (e) {
    const ms = Math.round(nowMs() - start);
    errors.push({ layer: label, message: e instanceof Error ? e.message : String(e) });
    return { value: fallback, ms, status: 'error' };
  }
}

// ════════════════════════════════════════════════════════════════════
// Main aggregator
// ════════════════════════════════════════════════════════════════════

export interface AggregatorDeps {
  elabApi: ElabApiLike | null;              // null → status 'error'
  wikiRetriever: WikiRetrieverLike | null;  // Sett-4 makeRetriever(corpus)
  ragSearcher: RagSearcherLike | null;      // legacy searchRAGChunks
  unlimMemory: UnlimMemoryLike | null;      // 3-tier memory
  visionClient?: VisionClientLike;          // only if includeVision
}

/**
 * Build a full snapshot in parallel. Never throws — all failures are reported
 * via `.status` and `.errors` so the caller can decide how to handle partial data.
 */
export async function buildStateSnapshot(
  deps: AggregatorDeps,
  opts: AggregatorOptions = {}
): Promise<StateSnapshot> {
  const {
    query = '',
    topKWiki = 3,
    topKRag = 5,
    includeVision = false,
    pastSessionsLimit = 3,
    volumeFilter,
    locale = 'it',
    timeoutMs = 400,
  } = opts;

  const errors: Array<{ layer: string; message: string }> = [];
  const t0 = nowMs();

  // Fire all layers in parallel
  const [
    circuitRes,
    descRes,
    wikiRes,
    ragRes,
    memoryRes,
    visionRes,
  ] = await Promise.all([
    withTimeout<CircuitState | null>(
      deps.elabApi ? Promise.resolve(deps.elabApi.unlim.getCircuitState()) : Promise.resolve(null),
      timeoutMs,
      null,
      'circuit',
      errors
    ),
    withTimeout<string | null>(
      deps.elabApi?.unlim.getCircuitDescription
        ? Promise.resolve(deps.elabApi.unlim.getCircuitDescription())
        : Promise.resolve(null),
      timeoutMs,
      null,
      'circuitDescription',
      errors
    ),
    withTimeout<WikiHit[]>(
      deps.wikiRetriever && query
        ? deps.wikiRetriever.retrieve({ query, topK: topKWiki, filter: volumeFilter !== undefined ? { volume: volumeFilter } : undefined })
        : Promise.resolve([]),
      timeoutMs,
      [],
      'wiki',
      errors
    ),
    withTimeout<RagChunk[]>(
      deps.ragSearcher && query
        ? Promise.resolve(deps.ragSearcher.searchRAGChunks(query, topKRag))
        : Promise.resolve([]),
      timeoutMs,
      [],
      'rag',
      errors
    ),
    withTimeout<PastSession[]>(
      deps.unlimMemory ? deps.unlimMemory.recentSessions(pastSessionsLimit) : Promise.resolve([]),
      timeoutMs,
      [],
      'memory',
      errors
    ),
    includeVision && deps.elabApi?.captureScreenshot
      ? (async () => {
          const start = nowMs();
          try {
            const shot = await Promise.resolve(deps.elabApi!.captureScreenshot!());
            let description: string | undefined;
            if (deps.visionClient && query) {
              description = await deps.visionClient.analyzeScreenshot(shot.dataUrl, query);
            }
            return {
              value: { captured: true, blobDataUrl: shot.dataUrl, dimensions: { w: shot.w, h: shot.h }, description } as VisionResult,
              ms: Math.round(nowMs() - start),
              status: 'ok' as const,
            };
          } catch (e) {
            errors.push({ layer: 'vision', message: e instanceof Error ? e.message : String(e) });
            return { value: null as VisionResult | null, ms: Math.round(nowMs() - start), status: 'error' as const };
          }
        })()
      : Promise.resolve({ value: null as VisionResult | null, ms: 0, status: 'empty' as const }),
  ]);

  const latencyMs = Math.round(nowMs() - t0);
  const circuit = circuitRes.value;

  return {
    fetchedAt: new Date().toISOString(),
    latencyMs,
    perLayerMs: {
      circuit: circuitRes.ms,
      circuitDescription: descRes.ms,
      wiki: wikiRes.ms,
      rag: ragRes.ms,
      memory: memoryRes.ms,
      vision: visionRes.ms,
    },
    circuit,
    circuitDescription: descRes.value,
    wiki: wikiRes.value,
    rag: ragRes.value,
    pastSessions: memoryRes.value,
    vision: visionRes.value,
    student: { locale },
    experiment: {
      id: circuit?.experimentId,
      step: circuit?.step,
      volume: volumeFilter !== undefined ? Number(volumeFilter) : undefined,
    },
    status: {
      circuit: circuitRes.status,
      circuitDescription: descRes.status,
      wiki: wikiRes.status,
      rag: ragRes.status,
      memory: memoryRes.status,
      vision: visionRes.status,
    },
    errors,
  };
}

// ════════════════════════════════════════════════════════════════════
// Prompt builder (consumes a snapshot, produces a single LLM prompt)
// ════════════════════════════════════════════════════════════════════

/**
 * Serialize a snapshot into a compact prompt fragment for the LLM.
 *
 * IMPORTANT DESIGN CHOICE (Andrea feedback 2026-04-23):
 *   Il RAG NON deve essere usato letteralmente (copia-incolla estratti).
 *   Deve essere usato come ANCORA per:
 *     - Citazione Vol.X pag.Y (autorevolezza fonte fisica)
 *     - Topic anchor (quale concetto trattare)
 *     - Disambiguazione (stesso nome, contesti diversi)
 *
 *   Il modello LLM USA la sua conoscenza generale + contesto runtime
 *   (circuito live, screenshot, memoria classe) + RAG come anchor.
 *   Sintetizza, NON cita verbatim.
 *
 *   Questa funzione quindi passa ANCHORS compatti (titoli, citazioni brevi,
 *   refs), non dump completi, e istruisce esplicitamente il modello a
 *   "ragionare, non ripetere".
 *
 * Principio Zero v3: the LLM MUST address the class ("Ragazzi, ..."),
 * cite Vol.X pag.Y when present, never "Docente leggi".
 */
export function snapshotToPromptFragment(snap: StateSnapshot, userMsg: string): string {
  const lines: string[] = [];

  lines.push('=== SISTEMA: come usare il contesto ===');
  lines.push('Sei UNLIM, tutor ELAB. Hai 4 fonti:');
  lines.push('  (1) la tua CONOSCENZA GENERALE del dominio elettronica');
  lines.push('  (2) LIVE STATE: circuito, esperimento, eventuali screenshot');
  lines.push('  (3) MEMORIA: sessioni precedenti della classe');
  lines.push('  (4) ANCHOR testuali: citazioni brevi dai volumi ELAB (RAG + Wiki)');
  lines.push('');
  lines.push('REGOLA D\'ORO: mescola le 4 fonti. NON copiare verbatim dagli anchor.');
  lines.push('Gli anchor servono per citare Vol.X pag.Y correttamente e non contraddire il libro.');
  lines.push('La spiegazione concreta, l\'analogia, il livello-linguaggio nascono da TE.');
  lines.push('');

  lines.push('=== LIVE STATE ===');
  lines.push(`Locale: ${snap.student.locale}`);

  if (snap.experiment.id) {
    const volPag = [snap.experiment.volume && `Vol. ${snap.experiment.volume}`, snap.experiment.page && `pag. ${snap.experiment.page}`]
      .filter(Boolean).join(', ');
    lines.push(`Esperimento corrente: ${snap.experiment.id}${snap.experiment.step != null ? ` (step ${snap.experiment.step})` : ''}${volPag ? ' — ' + volPag : ''}`);
  }

  if (snap.circuit) {
    lines.push(`Circuito: ${snap.circuit.components?.length || 0} componenti, ${snap.circuit.wires?.length || 0} fili${snap.circuit.isRunning ? ', SIMULAZIONE ATTIVA' : ''}`);
    if (snap.circuitDescription) {
      lines.push(`Descrizione runtime: ${snap.circuitDescription.slice(0, 300)}${snap.circuitDescription.length > 300 ? '...' : ''}`);
    }
  } else {
    lines.push('Circuito: [nessuno caricato]');
  }

  if (snap.vision?.description) {
    lines.push('');
    lines.push('=== VISIONE (screenshot Gemini Vision) ===');
    lines.push(`[ground truth visiva] ${snap.vision.description.slice(0, 500)}`);
    lines.push('Usa questa descrizione per verificare lo stato vero del circuito contro ciò che pensano i ragazzi.');
  }

  if (snap.pastSessions.length > 0) {
    lines.push('');
    lines.push('=== MEMORIA CLASSE (sessioni precedenti) ===');
    snap.pastSessions.slice(0, 3).forEach((s) => {
      const diag = s.diagnosis?.length ? ` [diagnosi: ${s.diagnosis.slice(0, 2).join('; ')}]` : '';
      lines.push(`- ${s.startedAt.slice(0, 10)}: ${s.experimentId || 'unk'} (${s.durationSec}s)${diag}`);
    });
    lines.push('Ricorda dove la classe ha già avuto difficoltà. Non ripetere spiegazioni inutilmente.');
  }

  if (snap.wiki.length > 0 || snap.rag.length > 0) {
    lines.push('');
    lines.push('=== ANCHOR (citazioni brevi ELAB, NON copiare verbatim) ===');
    lines.push('Usa questi SOLO per:');
    lines.push('  a) citare Vol.X pag.Y esatto quando spieghi concetti core');
    lines.push('  b) rispettare terminologia e progressione didattica del libro');
    lines.push('  c) non contraddire esempi/valori dai volumi');

    if (snap.wiki.length > 0) {
      lines.push('');
      lines.push('[wiki L2 — concetti LLM-owned]');
      snap.wiki.forEach((h, i) => {
        const ref = [h.volume && `Vol.${h.volume}`, h.page && `pag.${h.page}`].filter(Boolean).join(', ');
        lines.push(`${i + 1}. ${h.title}${ref ? ` (${ref})` : ''} — "${h.excerpt.slice(0, 100)}"`);
      });
    }

    if (snap.rag.length > 0) {
      lines.push('');
      lines.push('[rag L1 — chunks raw dai PDF volumi]');
      snap.rag.slice(0, 3).forEach((c, i) => {
        const ref = c.volume && c.page ? ` (Vol.${c.volume} pag.${c.page})` : '';
        lines.push(`${i + 1}. ${c.source || c.id}${ref}: "${c.text.slice(0, 100)}..."`);
      });
    }
  }

  lines.push('');
  lines.push('=== DOMANDA UTENTE ===');
  lines.push(userMsg);
  lines.push('');
  lines.push('=== VINCOLI RISPOSTA (Principio Zero v3) ===');
  lines.push('- Rivolgiti ai RAGAZZI in plurale, MAI al docente');
  lines.push('- Max 120 parole ben formattate (feedback 2026-05-10), analogie opzionali quando aggiungono valore');
  lines.push('- Se usi un concetto chiave (LED, resistenza, Ohm, potenziometro...), CITA Vol.X pag.Y');
  lines.push('- Se il circuito live mostra qualcosa di specifico, menzionalo (diagnosi concreta)');
  lines.push('- Se vuoi eseguire azioni (highlight componente, aggiungi resistenza, avvia simulazione), usa tool-call strutturato OLTRE al testo — non confondere i due canali');
  lines.push('- Linguaggio bambino 8-14: niente gergo tecnico non spiegato, analogie concrete');
  lines.push('- NON copiare frasi intere dagli anchor sopra — riformula nel tuo stile adatto alla classe');

  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════════
// Observability: export a summary row for logging/metrics
// ════════════════════════════════════════════════════════════════════

export function snapshotSummary(snap: StateSnapshot): Record<string, unknown> {
  return {
    at: snap.fetchedAt,
    latency_ms: snap.latencyMs,
    per_layer_ms: snap.perLayerMs,
    has_circuit: !!snap.circuit,
    circuit_components: snap.circuit?.components?.length ?? 0,
    wiki_hits: snap.wiki.length,
    rag_hits: snap.rag.length,
    past_sessions: snap.pastSessions.length,
    has_vision: !!snap.vision?.captured,
    locale: snap.student.locale,
    experiment_id: snap.experiment.id,
    status: snap.status,
    errors_count: snap.errors.length,
  };
}
