/**
 * awareness-flags — UNLIM Slice 1A (Cervello / Percezione)
 *
 * Funzione pura: dato lo snapshot corrente della lavagna, lo snapshot del turno
 * precedente e il messaggio utente, calcola i "flag di consapevolezza" — segnali
 * strutturati che (1) instradano la pipeline e (2) vengono iniettati nel contesto
 * LLM come segnali di attenzione espliciti.
 *
 * NESSUNA chiamata LLM. NESSUN accesso a Deno.env / DB / rete. Solo logica pura.
 * Difensivo: non lancia MAI — su input degenere torna i flag a default (tutti spenti).
 *
 * Spec: docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md §7.2
 * (c) Andrea Marro 2026-05-21 — ELAB Tutor
 */

// ─── Tipi input ──────────────────────────────────────────────────────────────

/** Stato del circuito nello snapshot. */
export interface CircuitSnapshot {
  components?: Array<{ id?: string; type?: string }>;
  connections?: Array<{ from?: string; to?: string }>;
  /** Errori/incongruenze segnalati dalla simulazione. */
  errors?: string[];
}

/** Snapshot della lavagna per il calcolo dei flag. */
export interface BoardSnapshot {
  circuit?: CircuitSnapshot | null;
  /** Hash del disegno a mano libera (cambia quando il disegno cambia). */
  drawingHash?: string | null;
  /** Id esperimento attivo (es. "v1-cap6-esp1"). */
  experimentId?: string | null;
  /** Step corrente in modalità passo-passo. */
  step?: number | null;
  /** Esito ultima compilazione Arduino. */
  compileStatus?: 'ok' | 'error' | null;
  /** Messaggio di compilazione (se errore). */
  compileMessage?: string | null;
}

// ─── Tipo output ─────────────────────────────────────────────────────────────

export interface AwarenessFlags {
  /** Componenti/fili differiscono dal turno precedente. */
  circuit_changed: boolean;
  /** Il disegno a mano libera è cambiato. */
  drawing_changed: boolean;
  /** Serve un giro di vision sulla lavagna (flag di routing). */
  vision_needed: boolean;
  /** La simulazione segnala un'incongruenza nel circuito. */
  circuit_error: boolean;
  /** L'esperimento attivo è cambiato. */
  experiment_changed: boolean;
  /** Lo step passo-passo è cambiato. */
  step_changed: boolean;
  /** Esito ultima compilazione. */
  compile_status: 'ok' | 'error' | null;
  /** La classe ha sessioni precedenti. */
  returning_class: boolean;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Default: tutti i flag spenti. */
function emptyFlags(): AwarenessFlags {
  return {
    circuit_changed: false,
    drawing_changed: false,
    vision_needed: false,
    circuit_error: false,
    experiment_changed: false,
    step_changed: false,
    compile_status: null,
    returning_class: false,
  };
}

/**
 * Parole nel messaggio utente che richiedono uno sguardo alla lavagna.
 * Alternazione semplice — nessun backtracking catastrofico.
 */
const VISION_MENTION_RE =
  /\b(lavagn|disegn|scritt|scarabocch|grafic|schizz|guarda|cosa\s+vedi|sullo\s+schermo|domanda\s+scritta)/i;

/** Firma normalizzata e ordinata del circuito, per confronto turno-su-turno. */
function circuitSignature(circuit: CircuitSnapshot | null | undefined): string {
  if (!circuit || typeof circuit !== 'object') return '';
  const comps = Array.isArray(circuit.components) ? circuit.components : [];
  const conns = Array.isArray(circuit.connections) ? circuit.connections : [];
  const compSig = comps
    .map((c) => `${c?.id ?? '?'}:${c?.type ?? '?'}`)
    .sort()
    .join(',');
  const connSig = conns
    .map((c) => `${c?.from ?? '?'}>${c?.to ?? '?'}`)
    .sort()
    .join(',');
  return `${compSig}|${connSig}`;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Calcola i flag di consapevolezza per il turno corrente.
 *
 * @param current  snapshot della lavagna ORA
 * @param previous snapshot del turno precedente (null al primo turno)
 * @param userMessage messaggio dell'utente (testo)
 * @param hasClassMemory true se esiste memoria di classe per questa classe
 */
export function computeAwarenessFlags(
  current: BoardSnapshot | null | undefined,
  previous: BoardSnapshot | null | undefined,
  userMessage: string | null | undefined,
  hasClassMemory: boolean,
): AwarenessFlags {
  const flags = emptyFlags();
  try {
    const msg = typeof userMessage === 'string' ? userMessage : '';
    const hasPrev = !!previous && typeof previous === 'object';

    // Flag confronto-col-precedente (richiedono uno snapshot precedente).
    if (hasPrev && current && typeof current === 'object') {
      if (circuitSignature(current.circuit) !== circuitSignature(previous!.circuit)) {
        flags.circuit_changed = true;
      }
      if ((current.experimentId ?? null) !== (previous!.experimentId ?? null)) {
        flags.experiment_changed = true;
      }
      if ((current.step ?? null) !== (previous!.step ?? null)) {
        flags.step_changed = true;
      }
      const curHash = current.drawingHash ?? null;
      const prevHash = previous!.drawingHash ?? null;
      if (curHash && curHash !== prevHash) {
        flags.drawing_changed = true;
      }
    }

    // Flag stato-corrente (non richiedono il precedente).
    if (current && typeof current === 'object') {
      const errs = current.circuit?.errors;
      flags.circuit_error = Array.isArray(errs) && errs.length > 0;
      flags.compile_status =
        current.compileStatus === 'ok' || current.compileStatus === 'error'
          ? current.compileStatus
          : null;
    }

    flags.returning_class = hasClassMemory === true;

    // vision_needed: routing — disegno cambiato OPPURE l'utente nomina la lavagna.
    flags.vision_needed = flags.drawing_changed || VISION_MENTION_RE.test(msg);

    return flags;
  } catch {
    return emptyFlags();
  }
}

/**
 * Rende i flag attivi in un blocco compatto italiano da iniettare nel contesto
 * LLM. `vision_needed` è un flag di routing — NON viene reso nel testo.
 * Torna stringa vuota se nessun flag "narrabile" è attivo.
 */
export function renderAwarenessFlags(
  flags: AwarenessFlags | null | undefined,
  current: BoardSnapshot | null | undefined,
): string {
  if (!flags || typeof flags !== 'object') return '';
  const parts: string[] = [];

  if (flags.circuit_changed) parts.push("il circuito è cambiato dall'ultimo turno");
  if (flags.circuit_error) {
    const errs = current?.circuit?.errors;
    const detail =
      Array.isArray(errs) && errs.length > 0 ? `: ${errs.slice(0, 3).join('; ')}` : '';
    parts.push(`problema rilevato nel circuito${detail}`);
  }
  if (flags.experiment_changed) {
    parts.push(
      `esperimento cambiato${current?.experimentId ? ` (ora ${current.experimentId})` : ''}`,
    );
  }
  if (flags.step_changed) {
    parts.push(
      `passo cambiato${typeof current?.step === 'number' ? ` (ora step ${current.step})` : ''}`,
    );
  }
  if (flags.compile_status === 'error') parts.push('la compilazione ha dato errore');
  else if (flags.compile_status === 'ok') parts.push('la compilazione è andata a buon fine');
  if (flags.drawing_changed) parts.push('il disegno sulla lavagna è cambiato');
  if (flags.returning_class) parts.push('questa classe ha già fatto lezioni in precedenza');

  if (parts.length === 0) return '';
  return `Segnali di attenzione: ${parts.join('; ')}.`;
}

/** Marker di versione del modulo. */
export const AWARENESS_FLAGS_VERSION = '1.0-slice1a';
