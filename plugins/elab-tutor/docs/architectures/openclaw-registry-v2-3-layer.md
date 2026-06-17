# OpenClaw Tools Registry v2 — Architettura 3-Layer

**Data:** 2026-04-23
**Autore:** Andrea Marro + Claude (audit post-commit 71c5b46)
**Status:** DRAFT → approvato per Sprint 6 Day 37

---

## 0. Perché questa revisione

Post-commit 71c5b46 audit trovato 3 problemi:

1. **Handler paths sbagliati**: 42/52 ToolSpec usavano `handler: 'unlim.X'` ma solo 5 metodi esistono sotto `window.__ELAB_API.unlim.*`. Il resto è flat su `__ELAB_API.*`. → Correggeva silenziosamente al primo dispatch live → crash.
2. **52 tool sono pochi**: __ELAB_API ha ~60 metodi flat + 5 unlim + eventi. Copertura reale deve arrivare a **~80 tool** con composites.
3. **Zero validazione runtime**: nessuno verificava che l'handler risolvesse davvero. Drift silenzioso.

Questa architettura v2 risolve tutti e tre.

---

## 1. Tre layer

```
┌───────────────────────────────────────────────────────────┐
│                                                             │
│   LAYER A — BASE API REFLECTION                             │
│   ──────────────────────────────                             │
│   Fonte: window.__ELAB_API introspection                    │
│   Contenuto: tutti i metodi (~60 flat + 5 unlim.*)          │
│   Generato: al mount (OpenClaw init) via getApiSurface()   │
│   Scopo: verità oggettiva di cosa esiste                    │
│                                                             │
├───────────────────────────────────────────────────────────┤
│                                                             │
│   LAYER B — SEMANTIC OVERLAY (tools-registry.ts)            │
│   ──────────────────────────────────────────────             │
│   Fonte: file dichiarativo manuale                           │
│   Contenuto: ToolSpec con category, pz_v3_sensitive,         │
│              effect, params schema, status                   │
│   Generato: scritto a mano (reviewed in PR)                 │
│   Scopo: metadata semantica che LLM non può inferire        │
│                                                             │
├───────────────────────────────────────────────────────────┤
│                                                             │
│   LAYER C — MORPHIC GENERATED                                │
│   ───────────────────────────                                │
│   Fonte: morphic-generator.ts (L1/L2) a runtime             │
│   Contenuto: GeneratedTool persistiti in                     │
│              openclaw_tool_memory (pgvector)                 │
│   Generato: on-demand dall'LLM quando A+B non bastano        │
│   Scopo: copertura richieste atipiche, riuso con GC         │
│                                                             │
└───────────────────────────────────────────────────────────┘

            ↓ Runtime dispatch (flusso)

              1. LLM plan usa SOLO tool da Layer A ∩ B (live)
              2. Se richiesta atipica → morphic-generator.ts
              3. Genera L1 composition (solo Layer A ∩ B)
              4. Se fallisce → L2 template gap-fill
              5. Risultato persistito in Layer C
              6. Prossima richiesta simile → findReuseCandidate
              7. GC daily elimina low-quality/stale
```

---

## 2. Contratti TypeScript (tools-registry.ts v2)

```ts
export type HandlerStatus = 'live' | 'todo_sett5' | 'composite';

export interface ToolSpec {
  name: string;
  category: 'circuit' | 'read' | 'simulate' | 'visual' | 'code'
          | 'navigate' | 'vision' | 'ui' | 'voice' | 'memory' | 'meta';
  handler: string;              // dot-path into window.__ELAB_API
  status?: HandlerStatus;        // optional: resolveStatus() fornisce default
  params: Record<string, {
    type: string;
    required?: boolean;
    enum?: string[];
    description: string;
  }>;
  returns?: string;
  effect: string;
  pz_v3_sensitive: boolean;
  since: string;
  added_in_sprint?: string;
  composite_of?: string[];       // solo se status='composite'
}

// Runtime checks
export function resolveStatus(spec: ToolSpec): HandlerStatus;
export function ensureHandlerResolves(
  spec: ToolSpec,
  api: Record<string, unknown>
): { resolved: boolean; reason?: string };
export function auditRegistry(
  api: Record<string, unknown>,
  registry: ToolSpec[]
): {
  total: number;
  live_ok: number;
  live_broken: Array<{ name: string; reason: string }>;
  todo: number;
  composite: number;
};
```

### Mappatura namespace (verificata src/services/simulator-api.js 22/04/2026)

**FLAT** (~60 metodi diretti su `__ELAB_API.*`):
- Experiment: `getExperimentList`, `getExperiment`, `loadExperiment`, `getCurrentExperiment`, `mountExperiment`
- Lifecycle: `play`, `pause`, `reset`, `clearAll`, `clearCircuit`
- Components: `addComponent`, `removeComponent`, `moveComponent`, `interact`, `setComponentValue`, `getComponentStates`, `getComponentPositions`, `getSelectedComponent`
- Wires: `addWire`, `removeWire`, `connectWire`
- Description: `getCircuitDescription`, `getLayout`
- Editor: `getEditorCode`, `setEditorCode`, `appendEditorCode`, `resetEditorCode`, `showEditor`, `hideEditor`, `setEditorMode`, `getEditorMode`, `isEditorVisible`
- Scratch: `loadScratchWorkspace`
- Undo/redo: `undo`, `redo`, `canUndo`, `canRedo`
- Pin (flat): `highlightPin`, `serialWrite`
- Build: `setBuildMode`, `getBuildMode`, `setToolMode`, `getToolMode`
- Step: `nextStep`, `prevStep`, `getBuildStepIndex`
- UI: `showBom`, `hideBom`, `showSerialMonitor`
- Status: `isSimulating`, `getSimulationStatus`
- Experiment code: `getExperimentOriginalCode`
- Context: `getSimulatorContext`
- Compile: `compile`
- Screenshot: `captureScreenshot`
- Events: `on`, `off`

**UNLIM** (5 metodi sotto `__ELAB_API.unlim.*`):
- `unlim.highlightComponent`
- `unlim.highlightPin`
- `unlim.clearHighlights`
- `unlim.serialWrite`
- `unlim.getCircuitState`

Alcuni metodi esistono sia flat che in unlim (es. `highlightPin`, `serialWrite`). Motivo: legacy del refactor 12/02/2026 (bridge UNLIM). Preferire la versione flat per nuovi tool.

---

## 3. Espansione Sprint 6 (da 52 → ~80 tool)

### Tool da AGGIUNGERE (Layer A oggi non coperti in B)

| Tool                         | Category  | Status | Note                                          |
|------------------------------|-----------|--------|-----------------------------------------------|
| `loadExperiment`             | navigate  | live   | dup di mountExperiment? valutare              |
| `interact`                   | circuit   | live   | controlla pulsante/LDR/potenziometro          |
| `getComponentPositions`      | read      | live   | utile per composition L1                      |
| `getLayout`                  | read      | live   | struttura esportabile                         |
| `getSelectedComponent`       | read      | live   | UI state                                      |
| `getEditorMode`              | read      | live   | 'code' vs 'scratch'                           |
| `setEditorMode`              | code      | live   |                                               |
| `resetEditorCode`            | code      | live   | ripristina originale                          |
| `getExperimentOriginalCode`  | read      | live   |                                               |
| `isEditorVisible`            | read      | live   |                                               |
| `setToolMode`                | ui        | live   | 'select'/'wire'/'pen'                         |
| `getToolMode`                | read      | live   |                                               |
| `hideEditor`                 | ui        | live   |                                               |
| `hideBom`                    | ui        | live   |                                               |
| `isSimulating`               | read      | live   |                                               |
| `on` / `off`                 | meta      | live   | event sub/unsub (tipicamente non esposto LLM) |
| `getSimulatorContext`        | read      | live   | bundle full state, utile aggregator           |

### Tool da AGGIUNGERE come `todo_sett5` (da implementare Day 37)

| Tool                         | Category | Handler target                 | Note                                      |
|------------------------------|----------|--------------------------------|-------------------------------------------|
| `speakTTS`                   | voice    | `unlim.speakTTS`               | Voxtral TTS bridge                        |
| `listenSTT`                  | voice    | `unlim.listenSTT`              | Whisper STT + wake word                   |
| `saveSessionMemory`          | memory   | `unlim.saveSessionMemory`      | compound mem Supabase                     |
| `recallPastSession`          | memory   | `unlim.recallPastSession`      | retrieve past by classKey                 |
| `showNudge`                  | ui       | `unlim.showNudge`              | overlay proactivity                       |
| `generateQuiz`               | code     | `unlim.generateQuiz`           | 5 domande printable                       |
| `exportFumetto`              | visual   | `unlim.exportFumetto`          | report PDF                                |
| `videoLoad`                  | ui       | `unlim.videoLoad` (videocorso) |                                          |
| `alertDocente`               | ui       | `unlim.alertDocente`           | non-voice signal (errore circuito grave)  |
| `toggleDrawing`              | ui       | `toggleDrawing` (flat)         | pen mode sulla lavagna                    |
| `analyzeImage`               | vision   | composite                      | captureScreenshot + Edge Function         |

### Tool da AGGIUNGERE come `composite` (L1 orchestration)

| Tool                    | Composes                                                    | Note                                      |
|-------------------------|-------------------------------------------------------------|-------------------------------------------|
| `diagnoseCircuit`       | getCircuitState + getCircuitDescription + LLM diagnosis      | risponde "perché non funziona"            |
| `walkThroughExperiment` | loadExperiment + nextStep loop + speakTTS per step          | passo-passo guidato                        |
| `blinkLedPattern`       | addComponent led + connectWire + setEditorCode + compile    | generato dinamicamente da pattern         |
| `experimentsByConcept`  | getExperimentList + filter by concept                        | discovery tool per docenti                |
| `focusOn`               | clearHighlights + highlightComponent + speakTTS "guardate"   | pattern molto usato, vale la scorciatoia  |

**Totale target Sprint 6 end:** ~80 ToolSpec live + todo + composite.

---

## 4. Test strategy (Layer A+B)

### A. Unit test `tools-registry.test.ts` (~150 righe)
```ts
describe('tools-registry invariants', () => {
  it('every ToolSpec has valid handler path shape', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      expect(spec.handler).toMatch(/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)?$/);
    }
  });

  it('pz_v3_sensitive tools all have non-empty effect', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => t.pz_v3_sensitive)) {
      expect(spec.effect.length).toBeGreaterThan(10);
    }
  });

  it('composite tools have composite_of populated', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => resolveStatus(t) === 'composite')) {
      expect(spec.composite_of).toBeDefined();
      expect(spec.composite_of!.length).toBeGreaterThan(1);
    }
  });

  it('todo_sett5 tools have added_in_sprint set', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => resolveStatus(t) === 'todo_sett5')) {
      expect(spec.added_in_sprint).toBe('sett5');
    }
  });
});
```

### B. Mock-API audit test `tools-registry.audit.test.ts` (~100 righe)
```ts
describe('auditRegistry against mock __ELAB_API', () => {
  const fullMockApi = buildFullMockFromSimulatorApi(); // helper che reflette src/services/simulator-api.js
  it('all live tools resolve handler', () => {
    const report = auditRegistry(fullMockApi, OPENCLAW_TOOLS_REGISTRY);
    expect(report.live_broken).toEqual([]);
    expect(report.live_ok + report.todo + report.composite).toBe(report.total);
  });
});
```

### C. Playwright E2E smoke `openclaw-registry-live.spec.js` (~50 righe)
```js
test('__ELAB_API surface matches registry live entries', async ({ page }) => {
  await page.goto('/?e=v1-cap6-esp1');
  const missing = await page.evaluate((registry) => {
    const api = window.__ELAB_API;
    return registry
      .filter(t => !t.status || t.status === 'live')
      .filter(t => {
        const path = t.handler.split('.');
        let cur = api;
        for (const p of path) cur = cur?.[p];
        return typeof cur !== 'function';
      })
      .map(t => t.name);
  }, OPENCLAW_TOOLS_REGISTRY);
  expect(missing).toEqual([]);
});
```

---

## 5. Dispatcher design (Sprint 6 Day 39)

```ts
// src/services/openclaw-dispatcher.js (da creare)
import { OPENCLAW_TOOLS_REGISTRY, resolveStatus } from '../../scripts/openclaw/tools-registry.ts';

export async function dispatchToolCall({ action, args }) {
  const spec = OPENCLAW_TOOLS_REGISTRY.find(t => t.name === action);
  if (!spec) throw new Error(`unknown tool: ${action}`);

  const status = resolveStatus(spec);
  if (status === 'todo_sett5') {
    console.warn(`[openclaw] tool "${action}" not yet implemented, skipping`);
    return { ok: false, reason: 'not_implemented', retry_after: 'Sprint 6 Day 37' };
  }
  if (status === 'composite') {
    // delegate to morphic-generator L1 composition
    return dispatchCompositeCall(spec, args);
  }

  // PZ v3 check — if pz_v3_sensitive, require paired speakTTS
  if (spec.pz_v3_sensitive && !isAccompaniedBySpeak()) {
    throw new Error(`PZ v3: "${action}" is sensitive, must be paired with speakTTS`);
  }

  // Resolve and call
  const path = spec.handler.split('.');
  let fn = window.__ELAB_API;
  for (const seg of path) fn = fn?.[seg];
  if (typeof fn !== 'function') throw new Error(`handler "${spec.handler}" unresolved`);

  return await fn(...Object.values(args));
}
```

---

## 6. Onestà: cosa ancora NON sappiamo

1. **Params schema validation runtime**: oggi il params è solo documentazione, non validato. Aggiungere Zod o JSON-Schema runtime check è +100 righe ma serve.
2. **PZ v3 pairing enforcement**: il check `isAccompaniedBySpeak` è pseudo-code. Servirebbe tenere una "transaction" che bundlezza multi-tool-call con speakTTS richiesto.
3. **Event tools**: `on`/`off` sono usati dall'UNLIM chat ma se esposti come tool LLM si rischia loop. Probabilmente da ESCLUDERE dal registry visibile all'LLM.
4. **Permission model**: alcuni tool (es. `mountExperiment`) sono destructive. Un docente in classe può non volerli. Aggiungere `user_level: 'student_visible' | 'teacher_only'` al contratto.
5. **Internationalization tool**: oggi speakTTS ha param `voice` con 5 voci. Altro metadata (prompt language per LLM call) non coperto.

---

## 7. Piano esecuzione Sprint 6

| Day | Task                                                             | Exit criteria                                   |
|-----|------------------------------------------------------------------|--------------------------------------------------|
| 36  | Unit test tools-registry (invariant + audit mock)                | 2 test file PASS, 0 live_broken                  |
| 37  | Implementa 11 handler todo_sett5 in simulator-api.js + unlim bridge | tutti `live` risolvono                        |
| 38  | Espandi registry a ~80 tool (composite + missing Layer A)        | coverage A ∩ B almeno 85%                        |
| 39  | Dispatcher + PZ v3 enforcement pairing + Zod params validation   | 3 E2E spec openclaw-* PASS                       |
| 40  | Playwright smoke live su prod deploy behind flag                 | 0 missing su run contro www.elabtutor.school     |
| 41  | Tool memory live + reuse rate dashboard                          | misurato reuse-rate > 30%                        |
| 42  | Sett-gate Sprint 6 + retro + Sprint 7 draft                      | retro ≥9.0/10                                    |

---

## 8. Link al lavoro loop esistente

- **ADR-006 karpathy-llm-wiki-three-layer**: OpenClaw Layer A è l'estensione del pattern Karpathy applicato all'API surface. Same mental model, diverso asset.
- **ADR-007 module-extraction-pattern**: `tools-registry.ts` è puro ESM-compatibile, nessuna dipendenza DOM diretta. Testabile in Node + Deno.
- **ADR-002 gemini-to-together-switch**: `together-teacher-mode.ts` rispetta l'env flip tramite provider abstraction. Gate `canUseTogether` è il nuovo layer prima di chiamare il provider switched.
- **PDR loop Sprint 5 Day 27 wiki-corpus-loader**: consumato da state-snapshot-aggregator come WikiRetrieverLike.
- **PDR loop Sprint 5 Day 29 watchdog suppression**: useremo stesso pattern (severity+threshold+cooldown) per together_audit_log alerting.
