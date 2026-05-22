# UNLIM Slice 1A — Awareness Flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Creare il modulo puro `awareness-flags.ts` che calcola gli 8 flag di consapevolezza di UNLIM da uno snapshot della lavagna.

**Architecture:** Funzione pura — nessuna I/O, nessuna chiamata LLM/DB/rete. Difensiva (non lancia mai; su input degenere torna tutti i flag spenti). Modulo isolato: verrà *cablato* nella pipeline `unlim-chat` nello Slice 1B, qui si costruisce e si testa soltanto. Zero rischio di regressione (file nuovo, niente import di codice esistente).

**Tech Stack:** TypeScript (Deno-compatibile, modulo `supabase/functions/_shared/`), test Vitest.

**Latenza:** 1A è una funzione sincrona pura — impatto latenza nullo. Il budget di latenza è una preoccupazione dello Slice 1B (pipeline).

**GDPR:** 1A elabora solo dati strutturali (componenti, fili, id, hash, step) — nessun messaggio grezzo, nessun PII, nessuna persistenza. GDPR-neutro.

**Spec di riferimento:** `docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md` §7.2.

---

## Setup

- [ ] **Crea il branch dedicato e committa i documenti di design**

```bash
git checkout -b feat/unlim-slice-1a-awareness-flags
git add docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md docs/superpowers/plans/2026-05-21-unlim-slice-1a-awareness-flags.md
git commit -m "docs(unlim): spec overhaul + piano Slice 1A awareness-flags"
```

Nota: il pre-commit hook esegue l'intera suite Vitest (~1-3 min) e confronta la baseline. È atteso — non saltarlo, mai `--no-verify`.

---

## File Structure

- **Create:** `supabase/functions/_shared/awareness-flags.ts` — modulo puro: tipi, `computeAwarenessFlags`, `renderAwarenessFlags`, marker di versione. Una sola responsabilità: calcolare e rendere i flag di consapevolezza.
- **Create:** `tests/unit/awareness-flags.test.js` — test Vitest del modulo.

Run dei test del modulo: `npx vitest run tests/unit/awareness-flags.test.js`

---

### Task 1: Scaffold modulo + input degeneri

**Files:**
- Create: `supabase/functions/_shared/awareness-flags.ts`
- Test: `tests/unit/awareness-flags.test.js`

- [ ] **Step 1: Scrivi il test che fallisce**

Crea `tests/unit/awareness-flags.test.js`:

```js
/**
 * UNLIM Slice 1A — test del modulo awareness-flags.
 * Spec: docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md §7.2
 */
import { describe, it, expect } from 'vitest';
import { computeAwarenessFlags } from '../../supabase/functions/_shared/awareness-flags.ts';

describe('computeAwarenessFlags — scaffold e input degeneri', () => {
  it('torna un oggetto con tutti gli 8 flag spenti su input null', () => {
    const f = computeAwarenessFlags(null, null, null, false);
    expect(f).toEqual({
      circuit_changed: false,
      drawing_changed: false,
      vision_needed: false,
      circuit_error: false,
      experiment_changed: false,
      step_changed: false,
      compile_status: null,
      returning_class: false,
    });
  });

  it('non lancia su input garbage', () => {
    expect(() => computeAwarenessFlags(42, 'x', {}, undefined)).not.toThrow();
  });

  it('non lancia su undefined ovunque', () => {
    expect(() => computeAwarenessFlags(undefined, undefined, undefined, undefined)).not.toThrow();
  });
});
```

- [ ] **Step 2: Esegui il test — deve fallire**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: FAIL — `Failed to resolve import ".../awareness-flags.ts"` (il modulo non esiste).

- [ ] **Step 3: Crea il modulo scaffold**

Crea `supabase/functions/_shared/awareness-flags.ts`:

```ts
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
  try {
    return emptyFlags();
  } catch {
    return emptyFlags();
  }
}
```

- [ ] **Step 4: Esegui il test — deve passare**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: PASS — 3/3 test verdi.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/awareness-flags.ts tests/unit/awareness-flags.test.js
git commit -m "feat(unlim): scaffold modulo awareness-flags (Slice 1A)"
```

---

### Task 2: Flag confronto-col-precedente

`circuit_changed`, `drawing_changed`, `experiment_changed`, `step_changed` — i flag che confrontano lo snapshot corrente con quello del turno precedente.

**Files:**
- Modify: `supabase/functions/_shared/awareness-flags.ts`
- Modify: `tests/unit/awareness-flags.test.js`

- [ ] **Step 1: Scrivi i test che falliscono**

Aggiungi in fondo a `tests/unit/awareness-flags.test.js`:

```js
describe('computeAwarenessFlags — flag confronto-col-precedente', () => {
  const base = {
    circuit: { components: [{ id: 'led1', type: 'led' }], connections: [] },
    experimentId: 'v1-cap6-esp1',
    step: 1,
    drawingHash: 'h1',
  };

  it('circuit_changed=false al primo turno (previous null)', () => {
    expect(computeAwarenessFlags(base, null, '', false).circuit_changed).toBe(false);
  });

  it('circuit_changed=true se i componenti cambiano', () => {
    const next = {
      ...base,
      circuit: {
        components: [{ id: 'led1', type: 'led' }, { id: 'r1', type: 'resistor' }],
        connections: [],
      },
    };
    expect(computeAwarenessFlags(next, base, '', false).circuit_changed).toBe(true);
  });

  it('circuit_changed=false se gli stessi componenti sono in ordine diverso', () => {
    const a = {
      ...base,
      circuit: {
        components: [{ id: 'led1', type: 'led' }, { id: 'r1', type: 'resistor' }],
        connections: [],
      },
    };
    const b = {
      ...base,
      circuit: {
        components: [{ id: 'r1', type: 'resistor' }, { id: 'led1', type: 'led' }],
        connections: [],
      },
    };
    expect(computeAwarenessFlags(a, b, '', false).circuit_changed).toBe(false);
  });

  it('experiment_changed=true se cambia experimentId', () => {
    const next = { ...base, experimentId: 'v1-cap7-esp1' };
    expect(computeAwarenessFlags(next, base, '', false).experiment_changed).toBe(true);
  });

  it('step_changed=true se cambia lo step', () => {
    const next = { ...base, step: 2 };
    expect(computeAwarenessFlags(next, base, '', false).step_changed).toBe(true);
  });

  it('drawing_changed=true se cambia il drawingHash', () => {
    const next = { ...base, drawingHash: 'h2' };
    expect(computeAwarenessFlags(next, base, '', false).drawing_changed).toBe(true);
  });

  it('drawing_changed=false se il drawingHash è identico', () => {
    expect(computeAwarenessFlags(base, base, '', false).drawing_changed).toBe(false);
  });
});
```

- [ ] **Step 2: Esegui i test — devono fallire**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: FAIL — i nuovi test su `circuit_changed`/`experiment_changed`/`step_changed`/`drawing_changed` falliscono (lo scaffold torna sempre `false`). I 3 test del Task 1 restano verdi.

- [ ] **Step 3: Implementa i flag confronto-col-precedente**

In `awareness-flags.ts`, aggiungi l'helper `circuitSignature` SUBITO PRIMA di `// ─── Entry point ───`:

```ts
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
```

Poi sostituisci INTERAMENTE il corpo di `computeAwarenessFlags` con:

```ts
  const flags = emptyFlags();
  try {
    const hasPrev = !!previous && typeof previous === 'object';
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
    return flags;
  } catch {
    return emptyFlags();
  }
```

- [ ] **Step 4: Esegui i test — devono passare**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: PASS — 10/10 test verdi.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/awareness-flags.ts tests/unit/awareness-flags.test.js
git commit -m "feat(unlim): awareness-flags — flag confronto-col-precedente (Slice 1A)"
```

---

### Task 3: Flag stato-corrente + vision_needed

`circuit_error`, `compile_status`, `returning_class` e il flag di routing `vision_needed`.

**Files:**
- Modify: `supabase/functions/_shared/awareness-flags.ts`
- Modify: `tests/unit/awareness-flags.test.js`

- [ ] **Step 1: Scrivi i test che falliscono**

Aggiungi in fondo a `tests/unit/awareness-flags.test.js`:

```js
describe('computeAwarenessFlags — flag stato-corrente', () => {
  it('circuit_error=true se circuit.errors non è vuoto', () => {
    const cur = { circuit: { components: [], connections: [], errors: ['LED spento'] } };
    expect(computeAwarenessFlags(cur, null, '', false).circuit_error).toBe(true);
  });

  it('circuit_error=false se errors è vuoto o assente', () => {
    expect(computeAwarenessFlags({ circuit: { errors: [] } }, null, '', false).circuit_error).toBe(false);
    expect(computeAwarenessFlags({ circuit: {} }, null, '', false).circuit_error).toBe(false);
  });

  it('compile_status riflette lo stato di compilazione', () => {
    expect(computeAwarenessFlags({ compileStatus: 'error' }, null, '', false).compile_status).toBe('error');
    expect(computeAwarenessFlags({ compileStatus: 'ok' }, null, '', false).compile_status).toBe('ok');
    expect(computeAwarenessFlags({}, null, '', false).compile_status).toBe(null);
  });

  it('returning_class=true se hasClassMemory è true', () => {
    expect(computeAwarenessFlags({}, null, '', true).returning_class).toBe(true);
    expect(computeAwarenessFlags({}, null, '', false).returning_class).toBe(false);
  });
});

describe('computeAwarenessFlags — vision_needed (routing)', () => {
  it('vision_needed=true se l\'utente nomina la lavagna', () => {
    expect(computeAwarenessFlags({}, null, 'guarda la lavagna', false).vision_needed).toBe(true);
  });

  it('vision_needed=true per "rispondi alla domanda scritta"', () => {
    expect(computeAwarenessFlags({}, null, 'rispondi alla domanda scritta', false).vision_needed).toBe(true);
  });

  it('vision_needed=true se il disegno è cambiato', () => {
    const prev = { drawingHash: 'h1' };
    const cur = { drawingHash: 'h2' };
    expect(computeAwarenessFlags(cur, prev, 'ciao', false).vision_needed).toBe(true);
  });

  it('vision_needed=false per un messaggio normale senza disegno cambiato', () => {
    expect(computeAwarenessFlags({}, null, "cos'è un LED?", false).vision_needed).toBe(false);
  });
});
```

- [ ] **Step 2: Esegui i test — devono fallire**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: FAIL — i nuovi test falliscono (`circuit_error`/`compile_status`/`returning_class`/`vision_needed` non ancora implementati). I 10 test precedenti restano verdi.

- [ ] **Step 3: Implementa i flag stato-corrente + vision_needed**

In `awareness-flags.ts`, aggiungi la costante regex SUBITO DOPO `emptyFlags()` (prima di `// ─── Entry point ───`):

```ts
/**
 * Parole nel messaggio utente che richiedono uno sguardo alla lavagna.
 * Alternazione semplice — nessun backtracking catastrofico.
 */
const VISION_MENTION_RE =
  /\b(lavagn|disegn|scritt|scarabocch|grafic|schizz|guarda|cosa\s+vedi|sullo\s+schermo|domanda\s+scritta)/i;
```

Poi sostituisci INTERAMENTE il corpo di `computeAwarenessFlags` con la versione completa:

```ts
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
```

- [ ] **Step 4: Esegui i test — devono passare**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: PASS — 18/18 test verdi.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/awareness-flags.ts tests/unit/awareness-flags.test.js
git commit -m "feat(unlim): awareness-flags — flag stato-corrente + vision_needed (Slice 1A)"
```

---

### Task 4: renderAwarenessFlags + marker di versione

Rende i flag attivi in un blocco compatto italiano da iniettare nel contesto LLM. `vision_needed` NON viene reso (è solo un flag di routing).

**Files:**
- Modify: `supabase/functions/_shared/awareness-flags.ts`
- Modify: `tests/unit/awareness-flags.test.js`

- [ ] **Step 1: Scrivi i test che falliscono**

Sostituisci la riga di import in cima a `tests/unit/awareness-flags.test.js` con:

```js
import {
  computeAwarenessFlags,
  renderAwarenessFlags,
  AWARENESS_FLAGS_VERSION,
} from '../../supabase/functions/_shared/awareness-flags.ts';
```

Aggiungi in fondo al file:

```js
describe('renderAwarenessFlags', () => {
  function flagsWith(overrides) {
    return {
      circuit_changed: false,
      drawing_changed: false,
      vision_needed: false,
      circuit_error: false,
      experiment_changed: false,
      step_changed: false,
      compile_status: null,
      returning_class: false,
      ...overrides,
    };
  }

  it('torna stringa vuota se nessun flag narrabile è attivo', () => {
    expect(renderAwarenessFlags(flagsWith({}), {})).toBe('');
  });

  it('rende circuit_changed col prefisso "Segnali di attenzione:"', () => {
    const out = renderAwarenessFlags(flagsWith({ circuit_changed: true }), {});
    expect(out).toMatch(/^Segnali di attenzione:/);
    expect(out).toContain('il circuito è cambiato');
  });

  it('rende circuit_error col dettaglio degli errori', () => {
    const cur = { circuit: { errors: ['LED spento', 'GND mancante'] } };
    const out = renderAwarenessFlags(flagsWith({ circuit_error: true }), cur);
    expect(out).toContain('problema rilevato');
    expect(out).toContain('LED spento');
  });

  it('NON rende vision_needed (è solo routing)', () => {
    expect(renderAwarenessFlags(flagsWith({ vision_needed: true }), {})).toBe('');
  });

  it('non lancia su flags null e torna stringa vuota', () => {
    expect(() => renderAwarenessFlags(null, null)).not.toThrow();
    expect(renderAwarenessFlags(null, null)).toBe('');
  });

  it('AWARENESS_FLAGS_VERSION è una stringa definita', () => {
    expect(typeof AWARENESS_FLAGS_VERSION).toBe('string');
    expect(AWARENESS_FLAGS_VERSION.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Esegui i test — devono fallire**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: FAIL — import di `renderAwarenessFlags` / `AWARENESS_FLAGS_VERSION` non risolto (non esistono). I 18 test precedenti non vengono eseguiti finché l'import fallisce.

- [ ] **Step 3: Implementa renderAwarenessFlags + il marker**

In `awareness-flags.ts`, aggiungi in fondo al file (dopo `computeAwarenessFlags`):

```ts
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
```

- [ ] **Step 4: Esegui i test — devono passare**

Run: `npx vitest run tests/unit/awareness-flags.test.js`
Atteso: PASS — 24/24 test verdi.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/awareness-flags.ts tests/unit/awareness-flags.test.js
git commit -m "feat(unlim): awareness-flags — renderAwarenessFlags + versione (Slice 1A)"
```

---

## Verifica finale Slice 1A

- [ ] **Esegui l'intera suite per confermare zero regressioni**

Run: `npx vitest run`
Atteso: PASS — baseline preservata, +24 test nuovi. Il modulo è isolato (nessun import lo consuma ancora) → non può aver rotto nulla.

---

## Self-Review (compilata dall'autore del piano)

**Copertura spec (§7.2):** gli 8 flag del catalogo sono tutti coperti — `circuit_changed`/`drawing_changed`/`experiment_changed`/`step_changed` (Task 2), `circuit_error`/`compile_status`/`returning_class`/`vision_needed` (Task 3), `renderAwarenessFlags` (Task 4). Il *cablaggio* dei flag nella pipeline è esplicitamente Slice 1B — fuori scope qui.

**Placeholder:** nessuno — ogni step ha codice completo e comandi esatti.

**Consistenza tipi:** `AwarenessFlags` ha le stesse 8 chiavi in `emptyFlags`, nei test e in `renderAwarenessFlags`. `BoardSnapshot`/`CircuitSnapshot` usate coerentemente. `computeAwarenessFlags` ha la stessa firma a 4 parametri in tutti i task.

**Limite onesto v1:** la terza condizione di `vision_needed` da spec §7.2 ("diagnosi con stato insufficiente") NON è in 1A — richiede contesto di pipeline. Restano le due condizioni nette (disegno cambiato, menzione utente). Da rivalutare in 1B.
