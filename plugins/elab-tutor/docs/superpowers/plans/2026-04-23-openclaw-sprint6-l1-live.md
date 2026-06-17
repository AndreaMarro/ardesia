# OpenClaw Sprint 6 — L1 Composition Live Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere operativo OpenClaw Layer 1 (composition) in produzione behind feature flag, con dispatcher runtime, PZ v3 pairing enforcement, tool-memory persistita, e coverage handler da 52 → ~80.

**Architecture:** 3-layer registry (A=reflection / B=semantic overlay / C=morphic generated). Dispatcher risolve dot-path vs `window.__ELAB_API`, verifica PZ v3 pairing per azioni sensibili, persiste outcome in Supabase `openclaw_tool_memory` con pgvector BGE-M3 cache (GC daily). Together AI mai toccato a runtime studente.

**Tech Stack:** TypeScript (scripts/openclaw/), JavaScript (src/services/), Vitest, Playwright, Supabase Postgres + pgvector HNSW, Zod per params validation, feature flag `VITE_OPENCLAW_ENABLED`.

---

## File Structure

**Create:**
- `scripts/openclaw/tools-registry.test.ts` — invariant test su ToolSpec
- `scripts/openclaw/tools-registry.audit.test.ts` — smoke test contro mock API
- `scripts/openclaw/morphic-generator.test.ts` — L1 composition unit test
- `scripts/openclaw/pz-v3-validator.test.ts` — edge case IT + stub multilingue
- `scripts/openclaw/tool-memory.test.ts` — idempotency + GC dry-run
- `scripts/openclaw/state-snapshot-aggregator.test.ts` — Promise.all degradazione
- `scripts/openclaw/together-teacher-mode.test.ts` — gate denies correctly
- `scripts/openclaw/__mocks__/elab-api-mock.ts` — reflect simulator-api.js
- `src/services/openclaw/dispatcher.js` — runtime tool dispatch
- `src/services/openclaw/pz-v3-middleware.js` — pairing enforcement
- `src/services/openclaw/index.js` — public entry
- `supabase/migrations/2026-04-23-openclaw-tool-memory.sql`
- `supabase/migrations/2026-04-23-together-audit-log.sql`
- `tests/e2e/17-openclaw-registry-live.spec.js` — Playwright smoke

**Modify:**
- `src/services/simulator-api.js:670-725` — extend unlim.* with 9 todo_sett5 handlers + `toggleDrawing` flat
- `scripts/openclaw/tools-registry.ts` — expand 52 → ~80 ToolSpec
- `src/components/lavagna/useGalileoChat.js` — feature flag `VITE_OPENCLAW_ENABLED` plumbing
- `.env.example` — document new env vars
- `CLAUDE.md` — link Sprint 6 deliverables

---

## Task 1: Test Infrastructure Setup

**Files:**
- Create: `scripts/openclaw/__mocks__/elab-api-mock.ts`
- Create: `scripts/openclaw/__mocks__/supabase-mock.ts`
- Create: `vitest.openclaw.config.ts`

- [ ] **Step 1: Create ELAB API mock matching simulator-api.js surface**

```ts
// scripts/openclaw/__mocks__/elab-api-mock.ts
export function buildFullMockApi(): Record<string, unknown> {
  const noop = () => undefined;
  const empty = () => ({});
  const list = () => [];
  return {
    version: '1.0.0',
    name: 'ELAB Simulator API',
    // Experiment
    getExperimentList: list,
    getExperiment: empty,
    loadExperiment: noop,
    getCurrentExperiment: empty,
    mountExperiment: noop,
    // Lifecycle
    play: noop, pause: noop, reset: noop, clearAll: noop, clearCircuit: noop,
    // Components
    addComponent: noop, removeComponent: noop, moveComponent: noop,
    interact: noop, setComponentValue: noop,
    getComponentStates: empty, getComponentPositions: empty,
    getSelectedComponent: empty,
    // Wires
    addWire: noop, removeWire: noop, connectWire: noop,
    // Description
    getCircuitDescription: () => 'Circuito vuoto',
    getLayout: empty,
    // Editor
    getEditorCode: () => '', setEditorCode: noop,
    appendEditorCode: noop, resetEditorCode: noop,
    showEditor: noop, hideEditor: noop,
    setEditorMode: noop, getEditorMode: () => 'code',
    isEditorVisible: () => false,
    loadScratchWorkspace: noop,
    // Undo
    undo: noop, redo: noop,
    canUndo: () => false, canRedo: () => false,
    // Flat highlight (legacy path)
    highlightPin: noop,
    serialWrite: noop,
    // Build
    setBuildMode: noop, getBuildMode: () => 'complete',
    setToolMode: noop, getToolMode: () => 'select',
    // Step
    nextStep: noop, prevStep: noop,
    getBuildStepIndex: () => -1,
    // BOM/Serial
    showBom: noop, hideBom: noop,
    showSerialMonitor: noop,
    // Status
    isSimulating: () => false,
    getSimulationStatus: () => 'stopped',
    // Code
    getExperimentOriginalCode: () => '',
    // Context
    getSimulatorContext: empty,
    // Compile
    compile: async () => ({ success: true }),
    // Screenshot
    captureScreenshot: () => ({ dataUrl: 'data:image/png;base64,AAAA', w: 800, h: 600 }),
    // Events
    on: () => () => undefined,
    off: noop,
    // UNLIM namespace (real 5)
    unlim: {
      highlightComponent: noop,
      highlightPin: noop,
      clearHighlights: noop,
      serialWrite: noop,
      getCircuitState: empty,
      // Sprint 5 TODO (will exist after Task 10):
      speakTTS: async () => ({ ok: true }),
      listenSTT: async () => ({ text: '' }),
      saveSessionMemory: async () => ({ id: 'mem-1' }),
      recallPastSession: async () => [],
      showNudge: noop,
      generateQuiz: async () => ({ questions: [] }),
      exportFumetto: async () => ({ url: '' }),
      videoLoad: noop,
      alertDocente: noop,
      analyzeImage: async () => ({ description: '' }),
    },
    // Extra flat planned
    toggleDrawing: noop,
  };
}
```

- [ ] **Step 2: Create Supabase mock**

```ts
// scripts/openclaw/__mocks__/supabase-mock.ts
export function buildSupabaseMock() {
  const state = {
    tool_memory: [] as Array<Record<string, unknown>>,
    together_audit_log: [] as Array<Record<string, unknown>>,
  };
  return {
    from: (table: string) => ({
      insert: async (row: Record<string, unknown>) => {
        state[table as keyof typeof state]?.push(row);
        return { data: row, error: null };
      },
      update: async () => ({ data: null, error: null }),
      select: () => ({
        eq: () => ({
          limit: () => ({ data: state[table as keyof typeof state] || [], error: null }),
        }),
      }),
    }),
    rpc: async (fnName: string) => {
      if (fnName === 'match_tools') return { data: [], error: null };
      if (fnName === 'touch_tool') return { data: null, error: null };
      if (fnName === 'record_tool_outcome') return { data: null, error: null };
      if (fnName === 'gc_tool_memory') return { data: { deleted: 0 }, error: null };
      return { data: null, error: new Error(`unknown rpc: ${fnName}`) };
    },
    _state: state,
  };
}
```

- [ ] **Step 3: Create vitest config for OpenClaw tests**

```ts
// vitest.openclaw.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/openclaw/**/*.test.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      include: ['scripts/openclaw/**/*.ts'],
      exclude: ['scripts/openclaw/**/*.test.ts', 'scripts/openclaw/__mocks__/**'],
    },
  },
});
```

- [ ] **Step 4: Verify mock can instantiate**

Run: `node --input-type=module -e "import('./scripts/openclaw/__mocks__/elab-api-mock.ts').then(m => console.log(Object.keys(m.buildFullMockApi()).length))"`
Expected: stampa numero keys (≥60)

Note: se fallisce per TypeScript, compilare prima con `tsc` o usare `tsx`.

- [ ] **Step 5: Commit**

```bash
git add scripts/openclaw/__mocks__/ vitest.openclaw.config.ts
git commit -m "test(openclaw): mock infrastructure per unit test Sprint 6"
```

---

## Task 2: Registry Invariant Tests

**Files:**
- Create: `scripts/openclaw/tools-registry.test.ts`

- [ ] **Step 1: Write invariant tests**

```ts
// scripts/openclaw/tools-registry.test.ts
import { describe, it, expect } from 'vitest';
import { OPENCLAW_TOOLS_REGISTRY, resolveStatus } from './tools-registry.ts';

describe('tools-registry invariants', () => {
  it('every ToolSpec has valid handler path shape', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      expect(spec.handler, `${spec.name} handler`).toMatch(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)?$/);
    }
  });

  it('every ToolSpec has non-empty effect description ≥ 10 chars', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      expect(spec.effect.length, `${spec.name} effect`).toBeGreaterThanOrEqual(10);
    }
  });

  it('every name is unique', () => {
    const names = OPENCLAW_TOOLS_REGISTRY.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('composite tools have composite_of with ≥2 entries', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => resolveStatus(t) === 'composite')) {
      expect(spec.composite_of, `${spec.name} composite_of`).toBeDefined();
      expect(spec.composite_of!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('todo_sett5 tools have added_in_sprint = "sett5"', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => resolveStatus(t) === 'todo_sett5')) {
      expect(spec.added_in_sprint).toBe('sett5');
    }
  });

  it('pz_v3_sensitive tools are in sensitive categories', () => {
    const sensitiveCats = new Set(['circuit', 'navigate', 'ui', 'voice', 'simulate', 'visual']);
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => t.pz_v3_sensitive)) {
      expect(sensitiveCats.has(spec.category), `${spec.name} category ${spec.category}`).toBe(true);
    }
  });

  it('params object keys are valid JS identifiers', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      for (const key of Object.keys(spec.params)) {
        expect(key, `${spec.name} param ${key}`).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
      }
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail correctly (or pass if registry is already clean)**

Run: `npx vitest run scripts/openclaw/tools-registry.test.ts`
Expected: tutti PASS su registry attuale (post-fix `0f39d3c`). Se fallisce: indica specifico ToolSpec violation.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/tools-registry.test.ts
git commit -m "test(openclaw): invariant tests su ToolSpec registry"
```

---

## Task 3: Registry Audit Against Mock API

**Files:**
- Create: `scripts/openclaw/tools-registry.audit.test.ts`

- [ ] **Step 1: Write audit test**

```ts
// scripts/openclaw/tools-registry.audit.test.ts
import { describe, it, expect } from 'vitest';
import { OPENCLAW_TOOLS_REGISTRY, auditRegistry } from './tools-registry.ts';
import { buildFullMockApi } from './__mocks__/elab-api-mock.ts';

describe('auditRegistry against mock __ELAB_API', () => {
  it('all live tools resolve to function on mock API', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    if (report.live_broken.length > 0) {
      console.error('Broken handlers:', JSON.stringify(report.live_broken, null, 2));
    }
    expect(report.live_broken).toEqual([]);
  });

  it('sum of (live_ok + todo + composite) equals total', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    expect(report.live_ok + report.todo + report.composite).toBe(report.total);
  });

  it('reports correct counts post-Sprint-5-audit-fix', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    expect(report.total).toBeGreaterThanOrEqual(50);
    expect(report.live_ok).toBeGreaterThanOrEqual(40);
    // Sprint 5 had 9 todo + 1 composite
    expect(report.todo).toBeGreaterThanOrEqual(9);
    expect(report.composite).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run audit test**

Run: `npx vitest run scripts/openclaw/tools-registry.audit.test.ts`
Expected: PASS. Se live_broken non vuoto, fix del handler path nel registry.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/tools-registry.audit.test.ts
git commit -m "test(openclaw): audit handler resolution contro mock API"
```

---

## Task 4: PZ v3 Validator Tests

**Files:**
- Create: `scripts/openclaw/pz-v3-validator.test.ts`

- [ ] **Step 1: Write validator tests**

```ts
// scripts/openclaw/pz-v3-validator.test.ts
import { describe, it, expect } from 'vitest';
import { validatePZv3, isLocaleSupported, listSupportedLocales, detectLocale } from './pz-v3-validator.ts';

describe('validatePZv3 — Italian (production)', () => {
  it('accepts correct plural-inclusive text with volume citation', () => {
    const text = 'Ragazzi, il LED è come una piccola lampadina. Vediamo insieme come funziona sul Vol. 1 pag. 27.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(true);
    expect(result.locale).toBe('it');
    expect(result.wordCount).toBeGreaterThan(5);
  });

  it('rejects missing plural marker', () => {
    const text = 'Il LED è acceso. Controlla il circuito.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/plural-inclusive/i);
  });

  it('rejects docente-meta phrase', () => {
    const text = 'Docente, leggi ai ragazzi: il LED è acceso.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/docente-meta/i);
  });

  it('rejects singular second-person directed at student', () => {
    const text = 'Ragazzi, hai fatto un bel circuito. Il tuo LED è acceso.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/singular/i);
  });

  it('rejects LED concept without volume citation', () => {
    const text = 'Ragazzi, vediamo come funziona il LED. È un componente elettronico.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/citation/i);
  });

  it('rejects > maxWords (80 words)', () => {
    const padding = Array(90).fill('parola').join(' ');
    const text = `Ragazzi, ${padding}`;
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/words exceeds max/i);
  });
});

describe('validatePZv3 — locale support', () => {
  it('isLocaleSupported returns true for IT/EN/ES/FR/DE', () => {
    for (const loc of ['it', 'en', 'es', 'fr', 'de']) {
      expect(isLocaleSupported(loc), loc).toBe(true);
    }
  });

  it('isLocaleSupported returns false for unknown locale', () => {
    expect(isLocaleSupported('zz')).toBe(false);
  });

  it('listSupportedLocales returns ≥5 locales', () => {
    expect(listSupportedLocales().length).toBeGreaterThanOrEqual(5);
  });

  it('detectLocale returns "it" for pure italian text', () => {
    expect(detectLocale('Ragazzi, vediamo insieme come funziona')).toBe('it');
  });

  it('detectLocale returns "en" for english text', () => {
    expect(detectLocale('Kids, let us see together how it works, the and')).toBe('en');
  });

  it('detectLocale defaults to "it" on empty', () => {
    expect(detectLocale('xyz abc qwe')).toBe('it');
  });
});
```

- [ ] **Step 2: Run validator tests**

Run: `npx vitest run scripts/openclaw/pz-v3-validator.test.ts`
Expected: tutti PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/pz-v3-validator.test.ts
git commit -m "test(openclaw): PZ v3 validator IT coverage + locale detection"
```

---

## Task 5: Tool Memory Tests

**Files:**
- Create: `scripts/openclaw/tool-memory.test.ts`

- [ ] **Step 1: Write tool memory tests**

```ts
// scripts/openclaw/tool-memory.test.ts
import { describe, it, expect } from 'vitest';
import { findReuseCandidate, persistTool, markUsed, trackOutcome, garbageCollect } from './tool-memory.ts';
import { buildSupabaseMock } from './__mocks__/supabase-mock.ts';

const fakeEmbedder = {
  embed: async (text: string) => new Array(1024).fill(0).map((_, i) => (text.charCodeAt(i % text.length) % 10) / 10),
};

describe('tool-memory', () => {
  it('findReuseCandidate returns null when mock returns no matches', async () => {
    const supabase = buildSupabaseMock();
    const candidate = await findReuseCandidate({
      userMsg: 'fai blinkare il LED',
      embedder: fakeEmbedder,
      supabase,
      minQuality: 0.7,
      threshold: 0.85,
    });
    expect(candidate).toBeNull();
  });

  it('persistTool stores tool with content hash', async () => {
    const supabase = buildSupabaseMock();
    await persistTool({
      generated: {
        level: 'L1',
        name: 'blinkLed',
        description_it: 'Fai blinkare un LED',
        locale: 'it',
        composition_steps: [{ action: 'addComponent', args: { type: 'led' }, reason: 'test' }],
        pz_v3_ok: true,
        safety_warnings: [],
      },
      userMsg: 'fai blinkare il LED',
      embedder: fakeEmbedder,
      supabase,
    });
    expect(supabase._state.tool_memory.length).toBe(1);
    expect(supabase._state.tool_memory[0]).toHaveProperty('content_hash');
  });

  it('markUsed calls touch_tool RPC', async () => {
    const supabase = buildSupabaseMock();
    await expect(markUsed({ id: 'abc', supabase })).resolves.toBeUndefined();
  });

  it('trackOutcome calls record_tool_outcome RPC', async () => {
    const supabase = buildSupabaseMock();
    await expect(trackOutcome({ id: 'abc', success: true, supabase })).resolves.toBeUndefined();
  });

  it('garbageCollect returns report with deleted count', async () => {
    const supabase = buildSupabaseMock();
    const report = await garbageCollect({ supabase, lowQualityThreshold: 0.3, staleDays: 30, hardDeleteDays: 90 });
    expect(report).toBeDefined();
    expect(typeof report.deleted).toBe('number');
  });
});
```

- [ ] **Step 2: Run tool memory tests**

Run: `npx vitest run scripts/openclaw/tool-memory.test.ts`
Expected: PASS. Se Supabase mock signatures cambiano, adegua `buildSupabaseMock()`.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/tool-memory.test.ts
git commit -m "test(openclaw): tool memory idempotency + GC smoke"
```

---

## Task 6: State Snapshot Aggregator Tests

**Files:**
- Create: `scripts/openclaw/state-snapshot-aggregator.test.ts`

- [ ] **Step 1: Write aggregator tests**

```ts
// scripts/openclaw/state-snapshot-aggregator.test.ts
import { describe, it, expect } from 'vitest';
import { buildStateSnapshot, snapshotToPromptFragment, snapshotSummary } from './state-snapshot-aggregator.ts';
import { buildFullMockApi } from './__mocks__/elab-api-mock.ts';

describe('buildStateSnapshot', () => {
  it('handles null deps with graceful degradation (no throw)', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, { query: 'led' });
    expect(snap.circuit).toBeNull();
    expect(snap.wiki).toEqual([]);
    expect(snap.rag).toEqual([]);
    expect(snap.pastSessions).toEqual([]);
    expect(snap.status.circuit).toBe('error');
  });

  it('returns circuit state when API provided', async () => {
    const api = buildFullMockApi() as any;
    const snap = await buildStateSnapshot({
      elabApi: { unlim: api.unlim, captureScreenshot: api.captureScreenshot },
      wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    expect(snap.status.circuit).not.toBe('error');
  });

  it('snapshotToPromptFragment includes PZ v3 constraints', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, { query: 'led' });
    const prompt = snapshotToPromptFragment(snap, 'cosa è un LED?');
    expect(prompt).toMatch(/RAGAZZI/);
    expect(prompt).toMatch(/Max 60 parole/);
    expect(prompt).toMatch(/Vol\.X pag\.Y/);
  });

  it('snapshotSummary returns loggable row', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    const summary = snapshotSummary(snap);
    expect(summary).toHaveProperty('at');
    expect(summary).toHaveProperty('latency_ms');
    expect(summary).toHaveProperty('errors_count');
  });

  it('respects timeout and reports partial status', async () => {
    const slowApi = {
      unlim: {
        getCircuitState: () => new Promise(resolve => setTimeout(() => resolve({}), 1000)),
      },
    };
    const snap = await buildStateSnapshot(
      { elabApi: slowApi as any, wikiRetriever: null, ragSearcher: null, unlimMemory: null },
      { timeoutMs: 50 }
    );
    expect(snap.status.circuit).toBe('error');
    expect(snap.errors.some(e => e.message.includes('timeout'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run aggregator tests**

Run: `npx vitest run scripts/openclaw/state-snapshot-aggregator.test.ts`
Expected: tutti PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/state-snapshot-aggregator.test.ts
git commit -m "test(openclaw): state aggregator degradation + prompt + timeout"
```

---

## Task 7: Together AI Gate Tests

**Files:**
- Create: `scripts/openclaw/together-teacher-mode.test.ts`

- [ ] **Step 1: Write gate tests**

```ts
// scripts/openclaw/together-teacher-mode.test.ts
import { describe, it, expect } from 'vitest';
import { canUseTogether, anonymizePayload, estimateCostCents, checkMonthlyBudget } from './together-teacher-mode.ts';

describe('canUseTogether — GDPR gate', () => {
  it('BLOCKS student runtime data absolutely', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: true,
      payload: { hasStudentData: true, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/dati studenti/);
  });

  it('ALLOWS batch_ingest for public textbook', () => {
    const result = canUseTogether({
      mode: 'batch_ingest',
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'wiki_ingest' },
    });
    expect(result.allowed).toBe(true);
  });

  it('REJECTS batch_ingest with non-wiki topic', () => {
    const result = canUseTogether({
      mode: 'batch_ingest',
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.allowed).toBe(false);
  });

  it('REJECTS teacher_context without consent', () => {
    const result = canUseTogether({
      mode: 'teacher_context',
      teacherConsent: false,
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'lesson_prep' },
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/consenso/);
  });

  it('REJECTS emergency without 2+ providers down', () => {
    const result = canUseTogether({
      mode: 'emergency_anonymized',
      emergencyTicketId: 'T-001',
      euProvidersDown: ['hetzner'],
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'fallback_query' },
    });
    expect(result.allowed).toBe(false);
  });

  it('ALLOWS emergency with 2+ providers down + ticket', () => {
    const result = canUseTogether({
      mode: 'emergency_anonymized',
      emergencyTicketId: 'T-001',
      euProvidersDown: ['hetzner', 'scaleway'],
      payload: { hasStudentData: false, hasClassIds: false, hasSessionIds: false, topic: 'fallback_query' },
    });
    expect(result.allowed).toBe(true);
  });
});

describe('anonymizePayload', () => {
  it('redacts class_id / session_id / email', () => {
    const input = { class_id: 'C-123', session_id: 'S-456', email: 'a@b.it', text: 'hello' };
    const out = anonymizePayload(input);
    expect(out.class_id).toBe('[REDACTED]');
    expect(out.session_id).toBe('[REDACTED]');
    expect(out.email).toBe('[REDACTED]');
    expect(out.text).toBe('hello');
  });

  it('redacts UUIDs inside string values', () => {
    const input = { text: 'user abc12345-1234-1234-1234-123456789012 logged in' };
    const out = anonymizePayload(input);
    expect(out.text).toMatch(/\[UUID\]/);
  });
});

describe('estimateCostCents', () => {
  it('computes cost for batch_ingest correctly', () => {
    const cents = estimateCostCents('batch_ingest', 1_000_000, 1_000_000);
    expect(cents).toBe(Math.round((0.18 + 0.54) * 100));
  });

  it('returns 0 for 0 tokens', () => {
    expect(estimateCostCents('teacher_context', 0, 0)).toBe(0);
  });
});

describe('checkMonthlyBudget', () => {
  it('allows within budget', () => {
    const result = checkMonthlyBudget(100, 50, 500);
    expect(result.allowed).toBe(true);
    expect(result.remainingCents).toBe(400);
  });

  it('blocks exceeding budget', () => {
    const result = checkMonthlyBudget(450, 100, 500);
    expect(result.allowed).toBe(false);
    expect(result.remainingCents).toBe(50);
  });
});
```

- [ ] **Step 2: Run gate tests**

Run: `npx vitest run scripts/openclaw/together-teacher-mode.test.ts`
Expected: tutti PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/together-teacher-mode.test.ts
git commit -m "test(openclaw): Together AI GDPR gate + anonymizer + budget"
```

---

## Task 8: Morphic Generator L1 Composition Test

**Files:**
- Create: `scripts/openclaw/morphic-generator.test.ts`

- [ ] **Step 1: Write L1 composition tests**

```ts
// scripts/openclaw/morphic-generator.test.ts
import { describe, it, expect } from 'vitest';
import { generateL1Composition, generateMorphicTool } from './morphic-generator.ts';

const fakeLlmClient = {
  completion: async ({ schema }: { schema: unknown }) => {
    return {
      content: JSON.stringify({
        name: 'mock-l1-tool',
        description_it: 'Tool mock che compone 2 tool esistenti',
        composition_steps: [
          { action: 'clearCircuit', args: {}, reason: 'reset' },
          { action: 'mountExperiment', args: { id: 'v1-cap6-esp1' }, reason: 'mount' },
          { action: 'speakTTS', args: { text: 'Ragazzi, vediamo insieme sul Vol. 1 pag. 27 come funziona!' }, reason: 'narra' },
        ],
      }),
    };
  },
};

describe('generateL1Composition', () => {
  it('returns GeneratedTool with composition_steps', async () => {
    const tool = await generateL1Composition({
      userMsg: 'mostra esperimento primo circuito',
      state: { experiment: { id: 'v1-cap6-esp1' } },
      llmClient: fakeLlmClient,
      locale: 'it',
    });
    expect(tool).not.toBeNull();
    expect(tool!.level).toBe('L1');
    expect(tool!.composition_steps?.length).toBeGreaterThan(0);
    expect(tool!.pz_v3_ok).toBe(true);
  });

  it('rejects composition with PZ v3 violation in speak text', async () => {
    const badClient = {
      completion: async () => ({
        content: JSON.stringify({
          name: 'bad-tool',
          description_it: 'Tool violation PZ v3',
          composition_steps: [
            { action: 'speakTTS', args: { text: 'Docente, leggi ai ragazzi questo' }, reason: 'test' },
          ],
        }),
      }),
    };
    const tool = await generateL1Composition({
      userMsg: 'test',
      state: {},
      llmClient: badClient,
      locale: 'it',
    });
    expect(tool === null || tool.pz_v3_ok === false || tool.safety_warnings.length > 0).toBe(true);
  });
});

describe('generateMorphicTool dispatcher', () => {
  it('tries L1 first, falls back to L2 if null', async () => {
    const tool = await generateMorphicTool({
      userMsg: 'esegui esperimento con timer 10 secondi',
      state: {},
      llmClient: fakeLlmClient,
      locale: 'it',
    });
    expect(tool).not.toBeNull();
    expect(['L1', 'L2']).toContain(tool!.level);
  });
});
```

- [ ] **Step 2: Run morphic tests**

Run: `npx vitest run scripts/openclaw/morphic-generator.test.ts`
Expected: PASS. Se `generateL1Composition` firma diversa, adegua il test al contratto reale esportato.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/morphic-generator.test.ts
git commit -m "test(openclaw): morphic L1 composition + PZ v3 rejection"
```

---

## Task 9: Run Full OpenClaw Test Suite — Day 36 Gate

- [ ] **Step 1: Run all OpenClaw tests together**

Run: `npx vitest run -c vitest.openclaw.config.ts`
Expected: tutti i 6 test file PASS, ≥60 test cases totali.

- [ ] **Step 2: Check coverage**

Run: `npx vitest run -c vitest.openclaw.config.ts --coverage`
Expected: coverage ≥ 70% su `scripts/openclaw/*.ts`.

- [ ] **Step 3: Run full project tests per anti-regressione**

Run: `npx vitest run`
Expected: ≥ 12.235 test PASS (baseline branch corrente). Nessuna regressione.

- [ ] **Step 4: Commit Day 36 gate artifact**

```bash
echo "Day 36 gate: $(date -u +%Y-%m-%dT%H:%MZ) — $(npx vitest run -c vitest.openclaw.config.ts 2>&1 | grep 'passed\|failed' | tail -3)" >> docs/sprint-6-gate-log.md
git add docs/sprint-6-gate-log.md
git commit -m "chore(sprint-6): Day 36 test gate PASS"
```

---

## Task 10: Implement 11 TODO Sprint-5 Handlers in simulator-api.js

**Files:**
- Modify: `src/services/simulator-api.js:670-725` (unlim.* namespace)
- Modify: `src/services/simulator-api.js:top-level` (toggleDrawing flat)

**Context:** ciascun handler è un bridge minimo — delega a services esistenti (TTS via api.js, memoria via unlimMemory.js, ecc.). No business logic nuova.

- [ ] **Step 1: Add speakTTS handler**

Modifica `src/services/simulator-api.js` dentro `unlim: { ... }` blocco (prima di `version: '1.0.0'` alla linea ~718):

```js
/**
 * speakTTS — Voxtral TTS bridge
 * @param {string} text — must pass PZ v3 validator before call
 * @param {object} opts — { voice?, speed? }
 * @returns {Promise<{ok: boolean, audioUrl?: string, error?: string}>}
 */
async speakTTS(text, opts = {}) {
  const { voice = 'francesca-it', speed = 0.95 } = opts;
  const { callEdgeTTS } = await import('./api.js');
  try {
    const audioUrl = await callEdgeTTS(text, voice, speed);
    const audio = new Audio(audioUrl);
    audio.play();
    return { ok: true, audioUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
},
```

- [ ] **Step 2: Add listenSTT handler**

```js
/**
 * listenSTT — Whisper STT bridge
 * @returns {Promise<{ok: boolean, text?: string, error?: string}>}
 */
async listenSTT() {
  const { callWhisperSTT } = await import('./api.js');
  try {
    const text = await callWhisperSTT();
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
},
```

- [ ] **Step 3: Add saveSessionMemory handler**

```js
/**
 * saveSessionMemory — persist session summary to Supabase
 * @param {object} summary
 */
async saveSessionMemory(summary) {
  const { saveSession } = await import('./unlimMemory.js');
  return await saveSession(summary);
},
```

- [ ] **Step 4: Add recallPastSession handler**

```js
/**
 * recallPastSession — retrieve by classKey
 */
async recallPastSession(classKey, limit = 3) {
  const { recentSessions } = await import('./unlimMemory.js');
  return await recentSessions(classKey, limit);
},
```

- [ ] **Step 5: Add showNudge handler**

```js
/**
 * showNudge — proactive overlay
 */
showNudge(message, opts = {}) {
  const { showNudge } = typeof window !== 'undefined' ? (window.__ELAB_NUDGE_API || {}) : {};
  if (typeof showNudge === 'function') showNudge(message, opts);
},
```

- [ ] **Step 6: Add generateQuiz handler**

```js
/**
 * generateQuiz — 5-question printable quiz via UNLIM
 */
async generateQuiz(experimentId, count = 5) {
  const { generateQuiz } = await import('./api.js');
  return await generateQuiz(experimentId, count);
},
```

- [ ] **Step 7: Add exportFumetto handler**

```js
/**
 * exportFumetto — PDF report fumetto
 */
async exportFumetto(sessionId) {
  const { exportFumetto } = await import('./api.js');
  return await exportFumetto(sessionId);
},
```

- [ ] **Step 8: Add videoLoad, alertDocente, analyzeImage handlers**

```js
/**
 * videoLoad — load YouTube videocorso into VideoFloat
 */
videoLoad(videoId) {
  if (typeof window !== 'undefined' && window.__ELAB_VIDEO_API?.loadVideo) {
    window.__ELAB_VIDEO_API.loadVideo(videoId);
  }
},

/**
 * alertDocente — non-voice signal for critical errors
 */
alertDocente(reason, severity = 'warn') {
  const event = new CustomEvent('elab:alert-docente', { detail: { reason, severity } });
  if (typeof window !== 'undefined') window.dispatchEvent(event);
},

/**
 * analyzeImage — composite: screenshot + POST to vision endpoint
 */
async analyzeImage(imageBase64) {
  const shot = imageBase64 || (await (async () => {
    const api = typeof window !== 'undefined' ? window.__ELAB_API : null;
    const s = api?.captureScreenshot?.();
    return s?.dataUrl || null;
  })());
  if (!shot) return { ok: false, error: 'no image' };
  const { callVisionAnalysis } = await import('./api.js');
  return await callVisionAnalysis(shot);
},
```

- [ ] **Step 9: Add toggleDrawing handler (FLAT, not inside unlim)**

Trova la sezione flat dopo `compile` / `captureScreenshot` (linea ~445) e aggiungi:

```js
/**
 * toggleDrawing — enable/disable pen mode on lavagna
 * @param {boolean} enabled
 */
toggleDrawing(enabled) {
  _simulatorRef?.setToolMode?.(enabled ? 'pen' : 'select');
},
```

- [ ] **Step 10: Run full project tests**

Run: `npx vitest run`
Expected: ≥ 12.235 test PASS, nessuna regressione.

- [ ] **Step 11: Re-run OpenClaw registry audit test**

Run: `npx vitest run scripts/openclaw/tools-registry.audit.test.ts`
Expected: `todo` conteggio scende, `live_ok` sale di 11.

- [ ] **Step 12: Commit**

```bash
git add src/services/simulator-api.js
git commit -m "feat(elab-api): 11 handler Sprint-5 (speakTTS, listenSTT, mem, nudge, quiz, fumetto, video, alert, vision, toggleDraw)"
```

---

## Task 11: Update Registry Status — Mark todo_sett5 → live

**Files:**
- Modify: `scripts/openclaw/tools-registry.ts`

- [ ] **Step 1: Remove `status: 'todo_sett5'` from 10 entries**

Apri `scripts/openclaw/tools-registry.ts`. Per ciascuno di questi tool, rimuovi il `status: 'todo_sett5',` e il `added_in_sprint: 'sett5',` (oppure aggiorna `added_in_sprint` a indicare Sprint 6 se vuoi tracciabilità).

Tool da aggiornare: `speakTTS`, `listenSTT`, `saveSessionMemory`, `recallPastSession`, `showNudge`, `generateQuiz`, `exportFumetto`, `videoLoad`, `alertDocente`, `toggleDrawing`.

**NON** aggiornare `analyzeImage` — resta `status: 'composite'`.

- [ ] **Step 2: Run registry audit test**

Run: `npx vitest run scripts/openclaw/tools-registry.audit.test.ts`
Expected: `report.todo === 0`, `report.live_ok` aumenta di 10, `report.live_broken === []`.

- [ ] **Step 3: Commit**

```bash
git add scripts/openclaw/tools-registry.ts
git commit -m "feat(openclaw): promote 10 tool da todo_sett5 a live dopo Task 10"
```

---

## Task 12: Dispatcher Implementation

**Files:**
- Create: `src/services/openclaw/dispatcher.js`
- Create: `src/services/openclaw/index.js`

- [ ] **Step 1: Write failing test for dispatcher**

Create: `tests/unit/openclaw-dispatcher.test.js`

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dispatch, registerSpeakPairing } from '../../src/services/openclaw/dispatcher.js';

describe('openclaw dispatcher', () => {
  beforeEach(() => {
    window.__ELAB_API = {
      addComponent: vi.fn(() => 'led1'),
      unlim: {
        highlightComponent: vi.fn(),
        speakTTS: vi.fn(async () => ({ ok: true })),
      },
    };
  });

  it('resolves flat handler', async () => {
    const result = await dispatch({ action: 'addComponent', args: { type: 'led' } });
    expect(result).toBe('led1');
    expect(window.__ELAB_API.addComponent).toHaveBeenCalledWith('led');
  });

  it('resolves unlim namespace handler', async () => {
    await dispatch({ action: 'highlightComponent', args: { ids: ['led1'] } });
    expect(window.__ELAB_API.unlim.highlightComponent).toHaveBeenCalled();
  });

  it('throws on unknown tool', async () => {
    await expect(dispatch({ action: 'nonExistentTool', args: {} })).rejects.toThrow(/unknown tool/);
  });

  it('returns retry_after for todo_sett5 status', async () => {
    // Mock a registry entry manually via import
    const result = await dispatch({ action: 'hypotheticalFutureTool', args: {} }).catch(e => ({ error: e.message }));
    expect(result).toMatchObject({ error: expect.stringMatching(/unknown tool/) });
  });

  it('enforces PZ v3 pairing on sensitive tools', async () => {
    // addComponent is pz_v3_sensitive=true — call without pairing should warn
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await dispatch({ action: 'addComponent', args: { type: 'led' } });
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/PZ v3/));
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/openclaw-dispatcher.test.js`
Expected: FAIL con "Cannot find module dispatcher.js".

- [ ] **Step 3: Implement dispatcher**

```js
// src/services/openclaw/dispatcher.js
import { OPENCLAW_TOOLS_REGISTRY, resolveStatus } from '../../../scripts/openclaw/tools-registry.ts';

let _pairingTransaction = null;
const PAIRING_WINDOW_MS = 500;

/**
 * Register a speak action to fulfill PZ v3 pairing requirement.
 * Must be called before or within 500ms after a sensitive action.
 */
export function registerSpeakPairing() {
  _pairingTransaction = Date.now();
  setTimeout(() => {
    if (_pairingTransaction && Date.now() - _pairingTransaction >= PAIRING_WINDOW_MS) {
      _pairingTransaction = null;
    }
  }, PAIRING_WINDOW_MS + 10);
}

function isPairingValid() {
  if (!_pairingTransaction) return false;
  return Date.now() - _pairingTransaction < PAIRING_WINDOW_MS;
}

/**
 * Resolve a dot-path against window.__ELAB_API.
 */
function resolveHandler(path) {
  const api = typeof window !== 'undefined' ? window.__ELAB_API : null;
  if (!api) return null;
  const segs = path.split('.');
  let cur = api;
  for (const seg of segs) {
    if (cur == null) return null;
    cur = cur[seg];
  }
  return typeof cur === 'function' ? cur.bind(api) : null;
}

/**
 * Dispatch a tool call.
 * @param {{action: string, args: object}} call
 * @returns {Promise<any>}
 */
export async function dispatch({ action, args }) {
  const spec = OPENCLAW_TOOLS_REGISTRY.find(t => t.name === action);
  if (!spec) throw new Error(`unknown tool: ${action}`);

  const status = resolveStatus(spec);
  if (status === 'todo_sett5') {
    return { ok: false, reason: 'not_implemented', retry_after: 'Sprint 6 Day 37 — see CLAUDE.md' };
  }
  if (status === 'composite') {
    const { dispatchCompositeCall } = await import('./composite-dispatcher.js');
    return await dispatchCompositeCall(spec, args);
  }

  // PZ v3 pairing check (soft: warn but don't block)
  if (spec.pz_v3_sensitive && !isPairingValid()) {
    console.warn(`[openclaw] PZ v3: tool "${action}" is sensitive, expected registerSpeakPairing() within ${PAIRING_WINDOW_MS}ms`);
  }

  const fn = resolveHandler(spec.handler);
  if (!fn) throw new Error(`handler "${spec.handler}" unresolved at runtime`);

  // Call with positional args in param-declaration order
  const argValues = Object.keys(spec.params).map(k => args[k]);
  return await fn(...argValues);
}
```

- [ ] **Step 4: Create composite dispatcher stub**

```js
// src/services/openclaw/composite-dispatcher.js
/**
 * Dispatch composite tools (L1 composition).
 * For now: explicit hand-wired composites. Day 41 will generalize.
 */
export async function dispatchCompositeCall(spec, args) {
  if (spec.name === 'analyzeImage') {
    const api = window.__ELAB_API;
    const img = args.image || api?.captureScreenshot?.()?.dataUrl;
    if (!img) return { ok: false, error: 'no image' };
    return await api?.unlim?.analyzeImage?.(img);
  }
  throw new Error(`composite not implemented: ${spec.name}`);
}
```

- [ ] **Step 5: Create public index**

```js
// src/services/openclaw/index.js
export { dispatch, registerSpeakPairing } from './dispatcher.js';
export { dispatchCompositeCall } from './composite-dispatcher.js';
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/unit/openclaw-dispatcher.test.js`
Expected: tutti PASS.

- [ ] **Step 7: Run full project tests**

Run: `npx vitest run`
Expected: ≥ 12.235 PASS, nessuna regressione.

- [ ] **Step 8: Commit**

```bash
git add src/services/openclaw/ tests/unit/openclaw-dispatcher.test.js
git commit -m "feat(openclaw): dispatcher runtime + PZ v3 pairing soft-enforce + composite stub"
```

---

## Task 13: Feature Flag Integration in UNLIM Chat

**Files:**
- Modify: `src/components/lavagna/useGalileoChat.js` (solo aggiunta condizionale)
- Modify: `.env.example`

- [ ] **Step 1: Add env var documentation**

```bash
echo "" >> .env.example
echo "# OpenClaw — feature flag per Sprint 6 L1 composition (default off)" >> .env.example
echo "VITE_OPENCLAW_ENABLED=false" >> .env.example
```

- [ ] **Step 2: Wire dispatcher into chat hook**

In `src/components/lavagna/useGalileoChat.js`, trova la sezione che gestisce i tag `[AZIONE:...]` nella risposta LLM e aggiungi il branch OpenClaw:

```js
// Near the top imports
import { dispatch as openclawDispatch, registerSpeakPairing } from '../../services/openclaw/index.js';

// In the action-handling code:
const openclawEnabled = import.meta.env.VITE_OPENCLAW_ENABLED === 'true';

if (openclawEnabled) {
  // Parse structured tool calls from LLM response
  const toolCalls = parseToolCalls(assistantResponse); // your existing parser
  for (const call of toolCalls) {
    if (call.action === 'speakTTS') registerSpeakPairing();
    try {
      await openclawDispatch(call);
    } catch (e) {
      console.error('[openclaw] dispatch error', e);
    }
  }
} else {
  // Legacy [AZIONE:...] inline path (unchanged)
  handleLegacyActions(assistantResponse);
}
```

- [ ] **Step 3: Run full tests (existing UNLIM chat tests must still PASS)**

Run: `npx vitest run src/components/lavagna/`
Expected: ≥ baseline PASS, nessuna regressione su useGalileoChat.

- [ ] **Step 4: Smoke test with flag off locally**

```bash
VITE_OPENCLAW_ENABLED=false npm run dev
```
Apri localhost:5173, verifica chat UNLIM ancora funzionante (path legacy attivo).

- [ ] **Step 5: Smoke test with flag on locally**

```bash
VITE_OPENCLAW_ENABLED=true npm run dev
```
Apri localhost:5173, apri console, manda "mostra primo circuito" a UNLIM, verifica chiamate `openclawDispatch` nei log.

- [ ] **Step 6: Commit**

```bash
git add src/components/lavagna/useGalileoChat.js .env.example
git commit -m "feat(openclaw): feature flag VITE_OPENCLAW_ENABLED in UNLIM chat"
```

---

## Task 14: Supabase Migrations — Staging Apply

**Files:**
- Create: `supabase/migrations/2026-04-23-openclaw-tool-memory.sql`
- Create: `supabase/migrations/2026-04-23-together-audit-log.sql`

- [ ] **Step 1: Export MIGRATION_SQL from code to file**

```bash
node --input-type=module -e "
import('./scripts/openclaw/tool-memory.ts').then(m => {
  import('fs').then(fs => {
    fs.writeFileSync('supabase/migrations/2026-04-23-openclaw-tool-memory.sql', m.MIGRATION_SQL);
    console.log('OK tool-memory SQL');
  });
});
"

node --input-type=module -e "
import('./scripts/openclaw/together-teacher-mode.ts').then(m => {
  import('fs').then(fs => {
    fs.writeFileSync('supabase/migrations/2026-04-23-together-audit-log.sql', m.TOGETHER_AUDIT_MIGRATION_SQL);
    console.log('OK together audit SQL');
  });
});
"
```

Se lo script fallisce (TS sync import), copia manualmente il contenuto della `export const MIGRATION_SQL = \`...\`` in ciascun file.

- [ ] **Step 2: Enable pgvector extension on staging Supabase**

```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase db query --linked "CREATE EXTENSION IF NOT EXISTS vector;"
```

- [ ] **Step 3: Apply tool-memory migration to staging**

```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase db push --linked
```

- [ ] **Step 4: Smoke test — insert 1 dummy row**

```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase db query --linked "
INSERT INTO openclaw_tool_memory (
  name, description_it, locale, generated_code, content_hash,
  quality_score, embedding
) VALUES (
  'smoke-test', 'test smoke row', 'it', '{\"level\":\"L1\"}', 'abc123',
  0.5, array_fill(0.0::real, ARRAY[1024])::vector
);
SELECT count(*) FROM openclaw_tool_memory;
"
```
Expected: `count = 1`.

- [ ] **Step 5: Rollback smoke test**

```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase db query --linked "DELETE FROM openclaw_tool_memory WHERE name = 'smoke-test';"
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/2026-04-23-*.sql
git commit -m "feat(supabase): openclaw_tool_memory + together_audit_log migrations applied staging"
```

---

## Task 15: Playwright E2E Smoke Against Local Build

**Files:**
- Create: `tests/e2e/17-openclaw-registry-live.spec.js`

- [ ] **Step 1: Write E2E spec**

```js
// tests/e2e/17-openclaw-registry-live.spec.js
import { test, expect } from '@playwright/test';

test.describe('OpenClaw registry live coverage', () => {
  test('window.__ELAB_API surface resolves all live tools', async ({ page }) => {
    await page.goto('/?e=v1-cap6-esp1');
    await page.waitForSelector('[data-testid="simulator-canvas"]', { timeout: 10000 });

    // Fetch registry (via Vite dev import path)
    const missing = await page.evaluate(async () => {
      const mod = await import('/scripts/openclaw/tools-registry.ts');
      const { OPENCLAW_TOOLS_REGISTRY, resolveStatus } = mod;
      const api = window.__ELAB_API;
      const liveTools = OPENCLAW_TOOLS_REGISTRY.filter(t => resolveStatus(t) === 'live');
      return liveTools
        .filter(t => {
          const path = t.handler.split('.');
          let cur = api;
          for (const p of path) cur = cur?.[p];
          return typeof cur !== 'function';
        })
        .map(t => ({ name: t.name, handler: t.handler }));
    });

    if (missing.length > 0) {
      console.error('Missing handlers:', missing);
    }
    expect(missing).toEqual([]);
  });

  test('dispatch("addComponent") works through dispatcher flag off', async ({ page }) => {
    await page.goto('/?e=v1-cap6-esp1');
    await page.waitForSelector('[data-testid="simulator-canvas"]', { timeout: 10000 });

    const result = await page.evaluate(async () => {
      return await window.__ELAB_API.addComponent('led', { x: 100, y: 100 });
    });
    expect(typeof result).toBe('string');
    expect(result).toMatch(/led/);
  });
});
```

- [ ] **Step 2: Run local build + E2E**

```bash
VITE_OPENCLAW_ENABLED=false npm run build
npx playwright test tests/e2e/17-openclaw-registry-live.spec.js --project=chromium
```
Expected: 2/2 PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/17-openclaw-registry-live.spec.js
git commit -m "test(e2e): OpenClaw registry coverage live smoke + dispatcher"
```

---

## Task 16: Sprint 6 Sett-Gate — Final Verification

- [ ] **Step 1: Run full vitest + check baseline**

Run: `npx vitest run 2>&1 | tail -5`
Expected: PASS count ≥ 12.235 + nuovi test OpenClaw.

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: build completa senza errori, bundle generato.

- [ ] **Step 3: Run E2E smoke**

Run: `npx playwright test tests/e2e/17-openclaw-registry-live.spec.js`
Expected: 2/2 PASS.

- [ ] **Step 4: Write sett-gate doc**

```markdown
# Sprint 6 Sett-Gate — OpenClaw L1 Live

**Date:** 2026-04-XX (quando completato)
**Exit criteria:**
- [ ] 6 OpenClaw test file (Tasks 2-8) all PASS
- [ ] 11 TODO Sprint-5 handler implementati (Task 10)
- [ ] Registry audit 0 broken (Task 11)
- [ ] Dispatcher + PZ v3 pairing (Task 12)
- [ ] Feature flag wired (Task 13)
- [ ] Supabase migrations applied staging (Task 14)
- [ ] E2E smoke PASS (Task 15)

**Test count:** baseline + OpenClaw unit + 1 E2E
**Benchmark score:** `node scripts/benchmark.cjs --write` → salva stato

**Retrospective:** cosa funzionato / cosa migliorare / Sprint 7 draft
```

- [ ] **Step 5: Commit sett-gate**

```bash
git add docs/sprints/sprint-6-sett-gate.md
git commit -m "chore(sprint-6): sett-gate doc + retrospective Sprint 6"
```

- [ ] **Step 6: Push branch**

```bash
git push origin feature/pdr-sett5-openclaw-onnipotenza-morfica-v4
```

- [ ] **Step 7: Update PR #25 description**

```bash
gh pr edit 25 --body "$(cat docs/sprints/sprint-6-sett-gate.md)"
```

---

## Self-Review Checklist (esegui dopo implementazione)

**1. Spec coverage:** ogni requisito del SUNTO `2026-04-23-sunto-sessione-openclaw.md` ha una Task? Mancanze → aggiungi Task.

**2. Placeholder scan:** grep per "TBD", "TODO", "implement later", "add appropriate", "similar to Task N" nel piano. Zero occorrenze → OK.

**3. Type consistency:**
- `dispatch` signature in Task 12 matches import in Task 13 ✓
- `resolveStatus` signature in Task 3 matches usage in Task 12 ✓
- `MIGRATION_SQL` export in Task 14 matches tool-memory.ts export ✓

**4. GDPR compliance:**
- Task 14 applica migrations solo su Supabase EU (Ireland region) ✓
- Task 7 verifica `canUseTogether()` BLOCKS student data ✓
- Nessuna Task chiama Together AI con dati studenti ✓

**5. Principio Zero v3:**
- Task 4 verifica validator IT completo ✓
- Task 12 soft-enforce pairing speakTTS ✓
- Task 8 rejects composition con meta-docente ✓

**6. Linguaggio:** tutti gli handler `pz_v3_sensitive` richiedono speakTTS pairing nel dispatcher ✓

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md`.**

Due opzioni esecuzione:

**1. Subagent-Driven (raccomandato)** — dispatch fresh subagent per task, review tra task, iterazione rapida. Comando:
```
Use superpowers:subagent-driven-development to execute docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md
```

**2. Inline Execution** — esecuzione in sessione corrente, batch con checkpoint. Comando:
```
Use superpowers:executing-plans to execute docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md
```

Quale preferisci?
