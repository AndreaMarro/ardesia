---
id: ADR-024
title: Onnipotenza ClawBot mature — 80-tool L1+L2 dispatcher + composite-handler runtime + integration ALL ELAB modules (Sprint T iter 22-25 maturazione)
status: PROPOSED
date: 2026-04-28
deciders:
  - architect-opus (Sprint S iter 18 PM, ralph loop /caveman dynamic mode)
  - Andrea Marro (final approver iter 22 entrance — ClawBot dispatcher prod activation + 80 L2 templates ratify)
context-tags:
  - sprint-t-iter-22
  - sprint-t-iter-23
  - sprint-t-iter-24
  - sprint-t-iter-25
  - onnipotenza-clawbot-mature
  - 80-tool-l1-l2-dispatcher
  - composite-handler-runtime
  - integration-all-elab-modules
  - sense-1.5-morfismo-runtime-tuning
  - principio-zero-v3
  - dual-moat
  - fiera-trieste-demo-style
related:
  - CLAUDE.md §0 DUE PAROLE D'ORDINE Principio Zero V3 + Morfismo Sense 1+1.5+2
  - ADR-013 (ClawBot composite handler L1 morphic — runtime tool composition iter 6, base 52 ToolSpec + composite-handler.ts 492 LOC iter 6 P1)
  - ADR-019 (Sense 1.5 Morfismo runtime docente + classe — morphic invocation L2 templates)
  - ADR-022 (VPS GPU GDPR-compliant production stack — VPS host Llama 3.3 70B + Qwen 2.5-VL + ClawBot Edge inference)
  - ADR-023 (Onniscenza completa 7-layer — sibling ADR, ClawBot reads onniscenza pre-execute)
  - docs/architectures/pdr-sett5-openclaw-onnipotenza-morfica-v4.md (Sett 5 master architecture 52 ToolSpec + L1+L2+L3 layers)
  - docs/architectures/openclaw-registry-v2-3-layer.md (registry v2 3-layer structure)
  - docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §6 Sprint T iter 22-25 maturazione Onniscenza+Onnipotenza
input-files:
  - scripts/openclaw/tools-registry.ts (52 ToolSpec declarative iter 5 base)
  - scripts/openclaw/composite-handler.ts (492 LOC iter 6 P1, executeComposite ADR-013 D2)
  - scripts/openclaw/dispatcher.ts (~285 LOC iter 6 + composite branch wire-up + auditDispatcher)
  - scripts/openclaw/morphic-generator.ts (L1 composition + L2 template + L3 flag-DEV-ONLY iter 5)
  - scripts/openclaw/state-snapshot-aggregator.ts (orchestratore parallelo iter 6, port Edge runtime ADR-023 §5)
  - scripts/openclaw/tool-memory.ts (Supabase pgvector cache + GC iter 5)
  - src/services/simulator-api.js (window.__ELAB_API global, 755 LOC iter 12 — Simulator integration host)
  - src/services/multimodalRouter.js (367 LOC iter 6 routeTTS real, multi-module routing)
output-files:
  - docs/architectures/ADR-024-onnipotenza-clawbot-iter-22-25.md (THIS file, NEW)
  - Future iter 22+: scripts/openclaw/l2-templates-60.ts (NEW 60 L2 templates, 40 NEW + 20 existing)
  - Future iter 22+: scripts/openclaw/composite-handler.ts EXTEND runtime active (composite dispatch sequential + halt-on-error + telemetry)
  - Future iter 23+: scripts/openclaw/l2-templates-80.ts (80 L2 templates total, +20 NEW)
  - Future iter 23+: scripts/openclaw/onniscenza-bridge.ts (NEW bridge ClawBot pre-execute reads ADR-023 §5 state-snapshot)
  - Future iter 24+: src/services/clawbot-integration-{simulator,scratch,arduino,dashboard,lavagna,fumetto,voice,giochi}.js (8 integration files NEW)
  - Future iter 25+: scripts/openclaw/sense-1.5-morphic-tuner.ts (NEW runtime tuning per docente/classe ADR-019)
  - Future iter 25+: tests/integration/clawbot-80-tool-end-to-end.test.js (NEW E2E harness 2.0 verifies ogni L2 template)
---

# ADR-024 — Onnipotenza ClawBot mature 80-tool Sprint T iter 22-25

> Codificare l'**Onnipotenza** ClawBot come livello architetturale runtime di ELAB Tutor: ClawBot pilota TUTTE funzionalità ELAB (Simulator + Scratch/Blockly + Arduino n8n + Dashboard + Lavagna LIM + Fumetto + Voice Isabella + 4 giochi) tramite **80-tool L1+L2 dispatcher** + **composite-handler runtime** sequential dispatch + halt-on-error + telemetry + **Sense 1.5 morfismo** runtime tuning per docente esperienza + classe età + kit tier + LIM/iPad. Base 52 ToolSpec L1 (atomic actions) + 20 L2 templates iter 13-17 → target **80 L2 templates iter 22-25 expand**. ClawBot legge **Onniscenza** ADR-023 sibling pre-execute per parametri morphic. Demo Fiera-style: docente "Ehi UNLIM, mostra LED + carica codice + spiega" → ClawBot esegue 6 tool L1 sequence senza intervento. Maturazione Sprint T iter 22-25 post-procurement VPS GPU (ADR-022 ACCEPTED).

---

## 1. Status

**PROPOSED** — architect-opus iter 18 PM 2026-04-28 propone Onnipotenza canonical 4-layer architecture per Sprint T iter 22-25 maturazione. Andrea ratify iter 22 entrance.

Sign-off chain previsto:
- architect-opus iter 18 PM prep ADR-024 PROPOSED 4-layer canonical
- gen-app-opus iter 22-23 implement 60→80 L2 templates + composite-handler runtime active
- gen-test-opus iter 22-25 verify harness 2.0 ogni L2 template end-to-end PASS
- Andrea Marro iter 22 ratify post-procurement VPS GPU + ClawBot dispatcher prod activation

---

## 2. Context

### 2.1 Stato attuale ClawBot iter 18 (HEAD `de9cdb9`)

Componenti shipped iter 5-17:
- **52 base ToolSpec L1** (`scripts/openclaw/tools-registry.ts` iter 5): atomic actions declarative JSON schema per LLM tool-use (highlightComponent, mountExperiment, captureScreenshot, clearCircuit, getCircuitState, ecc.)
- **20 L2 templates** iter 13-17: composite pre-defined morphic patterns (`explain-led`, `diagnose-circuit-basic`, `guide-mount-resistor`, `compile-arduino-helper`, ecc.)
- **composite-handler.ts** 492 LOC iter 6 P1 (`executeComposite` ADR-013 D2): sequential dispatch + halt-on-error scaffold, NOT prod active
- **dispatcher.ts** ~285 LOC iter 6 + composite branch wire-up + `auditDispatcher` telemetry
- **morphic-generator.ts** iter 5: L1 composition + L2 template + L3 flag-DEV-ONLY (Web Worker sandbox, NOT prod)
- **state-snapshot-aggregator.ts** iter 6 scaffold orchestratore parallelo, port Edge runtime ADR-023 §5 iter 22+
- **tool-memory.ts** iter 5: Supabase pgvector cache + GC con `MIGRATION_SQL` 4 RPC, iter 13 migrations applied prod
- **5 NEW composite-handler tests** iter 6 P1: 5/5 PASS, dispatcher opt-in shipped
- **129 OpenClaw vitest PASS** iter 8 baseline preserved iter 12+

Componenti NON live (gap iter 22-25 close):
- **40 NEW L2 templates** iter 22 expand (20 → 60 total)
- **20 NEW L2 templates** iter 23 expand (60 → 80 total)
- **composite-handler runtime active prod** (currently scaffold only)
- **ClawBot integration ALL ELAB modules** (currently Simulator-only)
- **Sense 1.5 morphic tuner runtime** (ADR-019 dependencies, iter 25)
- **Onniscenza bridge** ClawBot pre-execute reads ADR-023 §5 state-snapshot (sibling dependency iter 22-23)
- **Harness 2.0 E2E** verify ogni L2 template (iter 25 close)

### 2.2 Andrea mandate Sprint T iter 22-25

Master PDR `docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md` §6 codifica Sprint T iter 22-25 maturazione Onnipotenza scope:
- iter 22: 60 L2 templates (40 NEW), composite-handler runtime active prod
- iter 23: 80 L2 templates (20 NEW), state-snapshot-aggregator integrated (ADR-023 §5)
- iter 24: ClawBot integration ALL 8 ELAB modules
- iter 25: morfismo Sense 1.5 runtime tuning per docente/classe + harness 2.0 + demo Fiera-style

Andrea iter 18 PM mandate verbatim ralph loop /caveman: "implementare Onniscenza + Onnipotenza Sprint T iter 22-25 maturare". Onnipotenza scope = ClawBot pilota TUTTE funzionalità ELAB via 80-tool dispatcher + composite handler L2 templates 20→80 expand.

### 2.3 Perché ADR adesso (iter 18 PM)

Tre motivi cogenti:
1. **80 L2 templates expand richiede cataloging canonical**: senza ADR esplicita, gen-app divergence + duplicate templates + naming chaos.
2. **Composite-handler runtime prod activation è breaking change**: dispatcher.ts wire-up + telemetry schema + halt-on-error semantics necessitano ratify Andrea.
3. **Onnipotenza ClawBot è incarnazione fisica Onniscenza ADR-023**: senza ClawBot mature, Onniscenza resta knowledge passivo. ClawBot = braccia + occhi + voce UNLIM runtime.

### 2.4 Rischio non-codifica

Se ADR-024 non shipped iter 18 PM:
- Implementazione iter 22-25 rischia ClawBot dispatcher fragmentato per modulo (Simulator-only sopravvive, altri 7 ELAB moduli isolati)
- Risk Sense 1.5 morfismo runtime tuning regressione (L2 templates hardcoded NO morphic adaptation)
- Risk demo Fiera-style 06/05/2026 NON funziona (multi-tool sequence senza intervento docente)
- Risk composite-handler prod activation incidente production senza halt-on-error tested

---

## 3. Decision

**Onnipotenza ClawBot mature = 4-layer architecture (L1 ToolSpec atomic + L2 Template composite morphic + L3 Dynamic DEV-only flag + Composite-handler runtime sequential dispatch) + 80 L2 templates total iter 25 close + integration ALL 8 ELAB modules + Sense 1.5 morfismo runtime tuning per docente/classe/kit/LIM + Onniscenza bridge pre-execute reads ADR-023 §5 state-snapshot.**

Architettura runtime ClawBot dispatcher Edge Function:
1. UNLIM LLM emit JSON tool-use call (single L1 tool OR L2 template invocation)
2. **dispatcher.ts** receive call + parse + validate ToolSpec/Template schema
3. **onniscenza-bridge.ts** pre-execute fetch ADR-023 §5 state-snapshot 7-layer aggregation
4. **sense-1.5-morphic-tuner.ts** read teacher_memory + class_memory + adapt L2 template parameters morfico (es. classe primaria → highlight grosso, secondaria → highlight subtle)
5. **composite-handler.ts** L2 template → resolve sequential L1 calls + halt-on-error + telemetry per step
6. Execute L1 atomic actions on target ELAB module via integration adapter (Simulator/Scratch/Arduino/Dashboard/Lavagna/Fumetto/Voice/Giochi)
7. Aggregate result + emit final response to UNLIM
8. Audit log Supabase `openclaw_tool_memory` table

Non-goal:
- L3 dynamic JS generation Web Worker (resta DEV-only flag, iter 30+ defer per safety)
- Multi-agent autonomous reasoning (resta single LLM call ClawBot dispatcher iter 22-25)
- Open ToolSpec marketplace (custom tools 3rd-party DEFER iter 30+)

---

## 4. Architecture 4-Layer

### 4.1 L1 ToolSpec atomic action (52 base, stable iter 5+)

**Definition**: dichiarazione JSON schema action atomica eseguibile su ELAB module specifico. ZERO logica composita, ZERO multi-step.

**Schema canonical**:
```typescript
interface ToolSpec {
  id: string  // 'highlightComponent'
  module: 'simulator' | 'scratch' | 'arduino' | 'dashboard' | 'lavagna' | 'fumetto' | 'voice' | 'giochi'
  description: string
  parameters: { [name: string]: { type: string; required: boolean; description: string } }
  returns: { type: string; schema: object }
  side_effects: string[]  // ['ui-update', 'serial-write', 'persist-supabase']
  morphic_hints: { docente_esperto?: object; classe_eta?: object }
}
```

**52 ToolSpec base** (categoria coverage):
- Simulator (10): highlightComponent, highlightPin, mountExperiment, clearCircuit, getCircuitState, setComponentValue, connectWire, captureScreenshot, getCircuitDescription, clearHighlights
- Scratch/Blockly (5): loadScratchWorkspace, compileScratchToArduino, getBlocksUsed, exportScratchXML, validateBlocks
- Arduino (8): compileArduinoCode, uploadToBoard, serialMonitor, serialWrite, getCompilationStatus, getHEX, downloadFirmware, resetBoard
- Dashboard (6): exportCSV, getProgressClasse, getNudges, getAnalyticsCapitolo, getStudentList, addNudge
- Lavagna LIM (8): setDrawingMode, clearCanvas, addAnnotation, setToolbarMode, captureLavagnaPDF, undoLavagna, redoLavagna, setBrushColor
- Fumetto (4): exportFumettoPDF, addFumettoFrame, voiceCmdFumetto, getFumettoState
- Voice (6): ttsIsabella, sttWhisperTurbo, wakeWordEhiUNLIM, voiceCmdDispatch, getVoiceMode, setVoiceLang
- Giochi (5): gameStart, gameGetScore, gameSubmitAnswer, gameNextQuestion, gameGetState

**Stability iter 22+**: 52 ToolSpec base **NO breaking change** iter 22-25, solo addition se necessario (es. iter 24 +3 ToolSpec NEW per moduli edge case → 55 total).

### 4.2 L2 Template composite morphic (20 → 80, iter 22-25 expand)

**Definition**: pattern pre-defined sequenza N L1 calls + parameters morphic adaptation Sense 1.5. NO custom JS code, solo composition declarative.

**Schema canonical**:
```typescript
interface L2Template {
  id: string  // 'explain-led-with-mount-and-voice'
  intent_class: 'concept_explain' | 'diagnose_visual' | 'code_help' | ...  // ADR-023 §6.1
  description: string
  parameters: object  // input parameters
  steps: Array<{
    tool_id: string  // L1 ToolSpec id
    parameters: object | '$ref:context.X'  // static OR reference to context
    halt_on_error: boolean
    morphic_adaptation: {
      docente_esperto?: { skip_steps?: string[]; modify_params?: object }
      classe_primaria?: { add_steps?: object[]; modify_params?: object }
    }
  }>
  expected_output: object
  test_fixture_path: string  // tests/fixtures/clawbot-l2/<id>.json
}
```

### 4.2.1 20 L2 templates iter 13-17 base (existing)

| ID | Intent | Modules touched |
|---|---|---|
| `explain-led` | concept_explain | Simulator + Voice |
| `explain-resistenza` | concept_explain | Simulator + Voice |
| `diagnose-circuit-basic` | diagnose_visual | Simulator + Vision + Voice |
| `guide-mount-resistor` | concept_explain | Simulator + Lavagna |
| `compile-arduino-helper` | code_help | Arduino + Voice |
| `load-scratch-workspace` | code_help | Scratch + Voice |
| `capture-and-explain` | diagnose_visual | Simulator + Vision + Fumetto |
| `start-gioco-detective` | meta_question | Giochi + Voice |
| `export-fumetto-session` | meta_question | Fumetto + Dashboard |
| `nudge-classe-pausa` | lesson_navigation | Dashboard + Voice |
| ... (10 more iter 13-17) | various | various |

### 4.2.2 40 NEW L2 templates iter 22 expand (60 total)

Categoria expand iter 22:
- **+10 Simulator**: explain-resistenza-pull-down, mount-pulsante-debounce, diagnose-cortocircuito, explain-condensatore-RC, mount-LDR-fotoresistenza, explain-transistor-NPN, mount-relay-modulo, diagnose-current-overcurrent, explain-MOSFET-capstone, mount-7segment-display
- **+8 Arduino**: compile-with-debug-serial, fix-pinmode-error, explain-PWM-analog-write, debug-serial-output, fix-uart-baudrate, explain-interrupt-attach, fix-millis-vs-delay, explain-EEPROM-read-write
- **+6 Scratch**: explain-blocco-evento, fix-loop-infinito, explain-variable-scratch, generate-scratch-from-arduino, suggest-scratch-block-next, explain-broadcast-message
- **+5 Lavagna LIM**: highlight-circuit-visual-LIM, draw-schema-vol-pag, annotate-component-LIM, switch-mode-pen-LIM, capture-lavagna-explain
- **+5 Voice**: voice-explain-vol-pag-italian, voice-recap-sessione, voice-nudge-pausa, voice-comando-mount-experiment, voice-stt-decode-italian
- **+3 Dashboard**: dashboard-progress-classe-explain, dashboard-export-pdf-genitore, dashboard-nudge-suggest-next
- **+3 Fumetto**: fumetto-frame-add-current, fumetto-export-genitore, fumetto-replay-narration

### 4.2.3 20 NEW L2 templates iter 23 expand (80 total)

Categoria expand iter 23 cross-module compositi avanzati:
- **+5 Multi-module compositi**: explain-and-mount-and-load (Simulator+Arduino+Voice), diagnose-photo-and-fix (Vision+Simulator+Voice), capstone-MOSFET-full-flow (Simulator+Arduino+Vision+Lavagna), gioco-ripasso-fine-lezione (Giochi+Dashboard+Voice), sessione-recap-genitore (Fumetto+Dashboard+Voice)
- **+5 Sense 1.5 morfismo runtime**: adapt-classe-primaria-vs-secondaria, adapt-docente-esperto-vs-novizio, adapt-LIM-1080-vs-4K, adapt-kit-base-vs-avanzato, adapt-iPad-tablet-vs-LIM
- **+5 Onniscenza-aware**: cross-volume-citation-vol1-vol2, multi-capitolo-progressive-disclosure, glossario-tea-cross-ref-analogia, wiki-llm-deep-dive-concept, principio-zero-rephrase-on-violation
- **+5 ELAB-modules edge cases**: gioco-circuit-review-collaborative, fumetto-multi-frame-narrazione, voice-multi-turno-conversazione, lavagna-LIM-multi-touch-collaborative, dashboard-analytics-cross-classi

### 4.3 L3 Dynamic DEV-only flag (defer iter 30+, NO PROD)

**Definition**: dynamic JS code generation Web Worker sandbox per custom tool 3rd-party.

**Status iter 22-25**: REMAIN behind feature flag `VITE_ENABLE_MORPHIC_L3=true` DEV-ONLY. NO prod activation Sprint T iter 22-25.

**Razionale defer**: safety review + sandbox escape audit + Web Worker postMessage threat model NOT ready. Defer iter 30+ post-Sprint T close.

### 4.4 Composite-handler runtime active prod

**File**: `scripts/openclaw/composite-handler.ts` (492 LOC iter 6 P1, EXTEND iter 22+).

**Funzione `executeComposite(template, input, context)`** semantics:
1. Resolve template L1 steps sequence
2. Per ogni step:
   a. Apply Sense 1.5 morphic adaptation (skip_steps + modify_params)
   b. Inject `$ref:context.X` references (es. precedenti step output)
   c. Invoke L1 tool via integration adapter
   d. Capture output + telemetry (latency, errors, side_effects)
   e. Halt-on-error: if step.halt_on_error AND error → return partial result + abort
3. Aggregate steps output → expected_output schema
4. Emit `auditDispatcher` log Supabase `openclaw_tool_memory`
5. Return `{ status: 'ok'|'partial'|'error', steps_output, telemetry }`

**Telemetry schema** (iter 23+ Grafana dashboard):
```typescript
{
  template_id: string
  total_latency_ms: number
  steps: Array<{ tool_id, latency_ms, status, error? }>
  morphic_adaptations_applied: string[]
  onniscenza_layers_used: string[]  // from ADR-023 bridge
  classe_key, teacher_id, capitolo_id
}
```

---

## 5. ClawBot tool dispatcher unified per 8 ELAB modules

ClawBot pilota TUTTE 8 ELAB funzionalità via 80-tool dispatcher unified. Iter 24 P0 implement integration adapters NEW per 7/8 moduli (Simulator existing iter 5+).

### 5.1 Simulator (CircuitSolver MNA/KCL + AVRBridge avr8js + PlacementEngine)

**Integration adapter**: `src/services/clawbot-integration-simulator.js` NEW iter 24 (~200 LOC).
**Bridge**: `window.__ELAB_API` global iter 12 (`src/services/simulator-api.js` 755 LOC).
**L1 tools (10)**: già wired iter 5+. Iter 24 verify all 10 GREEN harness 2.0.
**L2 templates touched (15)**: explain-led, explain-resistenza-pull-down, mount-pulsante-debounce, diagnose-cortocircuito, ecc.

### 5.2 Scratch/Blockly compile

**Integration adapter**: `src/services/clawbot-integration-scratch.js` NEW iter 24 (~150 LOC).
**Bridge**: Scratch VM API + Blockly workspace serialization + n8n compile endpoint Hostinger.
**L1 tools (5)**: loadScratchWorkspace, compileScratchToArduino, getBlocksUsed, exportScratchXML, validateBlocks.
**L2 templates touched (6)**: explain-blocco-evento, fix-loop-infinito, generate-scratch-from-arduino, ecc.

### 5.3 Arduino n8n compile (post fix arduino-cli iter 17+)

**Integration adapter**: `src/services/clawbot-integration-arduino.js` NEW iter 24 (~180 LOC).
**Bridge**: n8n Hostinger endpoint `https://n8n.srv1022317.hstgr.cloud/compile` + AVRBridge avr8js emulation in-browser.
**L1 tools (8)**: compileArduinoCode, uploadToBoard, serialMonitor, ecc.
**L2 templates touched (8)**: compile-with-debug-serial, fix-pinmode-error, explain-PWM-analog-write, ecc.

### 5.4 Dashboard docente

**Integration adapter**: `src/services/clawbot-integration-dashboard.js` NEW iter 24 (~120 LOC).
**Bridge**: Supabase Edge Functions `dashboard-progress` + `dashboard-export` + Pages routing custom.
**L1 tools (6)**: exportCSV, getProgressClasse, getNudges, ecc.
**L2 templates touched (3)**: dashboard-progress-classe-explain, dashboard-export-pdf-genitore, dashboard-nudge-suggest-next.

### 5.5 Lavagna LIM (drawing + toolbar mode)

**Integration adapter**: `src/services/clawbot-integration-lavagna.js` NEW iter 24 (~140 LOC).
**Bridge**: LavagnaShell.jsx + RetractablePanel + FloatingToolbar (iter 12 Lavagna Redesign S1-S8).
**L1 tools (8)**: setDrawingMode, clearCanvas, addAnnotation, setToolbarMode, ecc.
**L2 templates touched (5)**: highlight-circuit-visual-LIM, draw-schema-vol-pag, annotate-component-LIM, ecc.

### 5.6 Fumetto sessione

**Integration adapter**: `src/services/clawbot-integration-fumetto.js` NEW iter 24 (~100 LOC).
**Bridge**: Fumetto component MVP iter PR #6 watchdog 19/04 + voice cmd integration.
**L1 tools (4)**: exportFumettoPDF, addFumettoFrame, voiceCmdFumetto, getFumettoState.
**L2 templates touched (3)**: fumetto-frame-add-current, fumetto-export-genitore, fumetto-replay-narration.

### 5.7 Voice Isabella TTS + STT Whisper

**Integration adapter**: `src/services/clawbot-integration-voice.js` NEW iter 24 (~130 LOC).
**Bridge**: Edge Function `unlim-tts` Isabella WS Deno (ADR-016 iter 8) + Whisper Turbo VPS GPU iter 17+.
**L1 tools (6)**: ttsIsabella, sttWhisperTurbo, wakeWordEhiUNLIM, voiceCmdDispatch, ecc.
**L2 templates touched (5)**: voice-explain-vol-pag-italian, voice-recap-sessione, voice-nudge-pausa, ecc.

### 5.8 4 giochi didattici (Detective, POE, Reverse Engineering, Circuit Review)

**Integration adapter**: `src/services/clawbot-integration-giochi.js` NEW iter 24 (~110 LOC).
**Bridge**: 4 giochi component existing in `src/components/tutor/giochi/`.
**L1 tools (5)**: gameStart, gameGetScore, gameSubmitAnswer, gameNextQuestion, gameGetState.
**L2 templates touched (2)**: start-gioco-detective, gioco-ripasso-fine-lezione.

---

## 6. Sense 1.5 morfismo runtime adaptation

ClawBot L2 template invocation morphic per docente esperienza + classe età + kit tier + LIM/iPad. ADR-019 dependency (teacher_memory + class_memory Postgres).

### 6.1 Adaptation matrix canonical

| Dimensione morfismo | Source ADR-019 | L2 template adattation example |
|---|---|---|
| Docente esperienza | teacher_memory.esperienza_rilevata | `explain-led`: docente esperto Arduino → skip step "spiegazione base ohm", solo step "verifica pin connection" |
| Classe età | class_memory.eta_studenti | `explain-resistenza-pull-down`: 8-10 anni → analogia rubinetto acqua, 11-14 anni → calcolo R = V/I |
| Kit tier | class_memory.kit_dotazione | `mount-LDR-fotoresistenza`: kit_omaric_base → no LDR available → suggest substitution potenziometro |
| LIM/iPad config | runtime detection ADR-019 §C | `highlight-circuit-visual-LIM`: LIM 1080p 65" → highlight grosso colorato 8px, iPad → highlight subtle 2px |
| Capitolo corrente | class_memory.capitolo_corrente | `explain-MOSFET-capstone`: capitolo <8 → block + suggest "non hai ancora visto MOSFET, vediamo prima resistenza?" |

### 6.2 `sense-1.5-morphic-tuner.ts` runtime (iter 25 NEW)

```typescript
function applyMorphicTuning(
  template: L2Template,
  context: { teacher_memory, class_memory, runtime_state }
): L2Template {
  const tuned = deepClone(template)
  for (const step of tuned.steps) {
    if (context.teacher_memory?.esperienza_rilevata === 'expert_arduino' && step.morphic_adaptation?.docente_esperto?.skip_steps?.includes(step.tool_id)) {
      step._skip = true
    }
    if (context.class_memory?.eta_studenti <= 10 && step.morphic_adaptation?.classe_primaria?.modify_params) {
      Object.assign(step.parameters, step.morphic_adaptation.classe_primaria.modify_params)
    }
    // ... LIM resolution + kit_dotazione + capitolo_corrente checks
  }
  return tuned
}
```

### 6.3 Test morphic invariance

Per ogni L2 template + 5 contesti morphic combinati = 80 × 5 = 400 test cases. Iter 25 P1 fixture `tests/fixtures/clawbot-l2-morphic/`.

Invariante: stesso L2 template + 2 contesti diversi (docente A vs B) = 2 sequence step diverse MA Principio Zero V3 valid + Vol/pag canonical preserved INVARIANT.

---

## 7. Implementation iter 22-25 step-by-step

### Iter 22 (Sprint T): 60 L2 templates + composite-handler runtime active prod

P0 atoms:
1. **gen-app**: 40 NEW L2 templates write `scripts/openclaw/l2-templates-60.ts` (~2000 LOC, 50 LOC × 40 templates).
2. **gen-app**: composite-handler.ts EXTEND runtime active prod (`executeComposite` halt-on-error + telemetry full).
3. **gen-app**: dispatcher.ts wire-up composite-handler runtime branch (NOT scaffold opt-in iter 6).
4. **gen-test**: 40 NEW L2 template fixture happy path tests (`tests/fixtures/clawbot-l2/<id>.json`).
5. **gen-test**: composite-handler runtime tests halt-on-error + telemetry verify (10 NEW tests).
6. **architect**: spec sense-1.5-morphic-tuner.ts iter 25 prep doc.

Score lift: Onnipotenza Box (10/SPRINT_S) ClawBot composite 0.95 → 1.0 + L2 templates 60 NEW. Sprint T Onnipotenza Box NEW = 0.4 (40 L2 templates expand).

### Iter 23: 80 L2 templates + state-snapshot-aggregator integrated

P0 atoms:
1. **gen-app**: 20 NEW L2 templates write `scripts/openclaw/l2-templates-80.ts` (~1000 LOC, 50 LOC × 20 templates).
2. **gen-app**: `onniscenza-bridge.ts` NEW (~150 LOC) — ClawBot pre-execute reads ADR-023 §5 state-snapshot via Edge runtime aggregateOnniscenza().
3. **gen-app**: dispatcher.ts wire-up onniscenza-bridge pre-execute (every L2 template invocation).
4. **gen-test**: 20 NEW L2 template fixture tests.
5. **gen-test**: onniscenza-bridge integration test (mock ADR-023 state-snapshot + verify L2 template params morphic adapted).

Score lift: Onnipotenza Box = 0.65. Onniscenza Box ADR-023 = 0.7 (sibling lift).

### Iter 24: ClawBot integration ALL 8 ELAB modules

P0 atoms:
1. **gen-app**: 7 NEW integration adapter files (`src/services/clawbot-integration-{scratch,arduino,dashboard,lavagna,fumetto,voice,giochi}.js`).
2. **gen-app**: `__ELAB_API` global extend with `clawbot.dispatch(toolId, params)` unified entry point per ELAB module routing.
3. **gen-test**: 8 module integration E2E tests (1 per modulo, happy path + 1 failure mode each = 16 tests NEW).
4. **gen-test**: Playwright E2E cross-module sequence test (es. demo Fiera-style 6 tool L1 sequence senza intervento).

Score lift: Onnipotenza Box = 0.85. Integration ALL ELAB modules COMPLETE.

### Iter 25: Sense 1.5 morphic tuner runtime + harness 2.0 + close

P0 atoms:
1. **gen-app**: `scripts/openclaw/sense-1.5-morphic-tuner.ts` NEW (~250 LOC, ADR-019 implementation).
2. **gen-app**: composite-handler.ts EXTEND apply morphic tuning pre-step via tuner.
3. **gen-test**: harness 2.0 E2E `tests/integration/clawbot-80-tool-end-to-end.test.js` NEW (~600 LOC) verify ogni 80 L2 template happy path + 1 morphic variant each = 160 test cases.
4. **gen-test**: 400 morphic test cases fixture `tests/fixtures/clawbot-l2-morphic/` (80 × 5 contesti).
5. **scribe**: demo Fiera-style script `docs/demos/fiera-trieste-2026-05-06-clawbot-demo.md` (Sense 1.5 morfismo evidence).
6. **Andrea ratify**: SPRINT_T_COMPLETE 9.95+/10 onesto.

Score lift: Onnipotenza Box = 1.0. Sense 1.5 runtime tuning live. SPRINT_T_COMPLETE.

---

## 8. Test plan harness 2.0

Harness 2.0 verifica ogni 80 L2 template end-to-end PASS iter 25 close. Replace harness 1.0 iter 6 P1 (5/5 PASS composite-handler).

### 8.1 Test categories

| Category | Test count | Coverage |
|---|---|---|
| L2 happy path (80) | 80 | Ogni L2 template fixture input → expected output |
| L2 morphic variant (80 × 5) | 400 | 5 contesti morphic per template (docente esperto/novizio + classe primaria/secondaria + LIM 1080/4K + kit base/avanzato + capitolo prima/dopo) |
| Composite halt-on-error (10) | 10 | Inject error step N → verify halt + partial result returned |
| Telemetry schema (5) | 5 | Verify telemetry log Supabase `openclaw_tool_memory` schema valid |
| Onniscenza bridge (10) | 10 | Mock ADR-023 state-snapshot + verify L2 template params morphic adapted |
| Integration ELAB module E2E (16) | 16 | 8 modules × 2 (happy + failure) |
| Demo Fiera-style multi-tool (3) | 3 | "Ehi UNLIM mostra LED + carica codice + spiega" full flow |
| **Total harness 2.0** | **524** | iter 25 close PASS gate |

### 8.2 CoV iter 25 entrance gate

- 524/524 PASS harness 2.0
- 12599+ vitest preserved (ZERO regression)
- 129+ openclaw vitest preserved
- Build PASS
- R5 91.80%+ stress prod preserved
- Demo Fiera-style live screencast (Andrea record + share)

---

## 9. Failure modes + telemetry + cost

### 9.1 Failure modes per L2 template

| Failure | Behavior | Mitigation |
|---|---|---|
| L1 step error halt-on-error=true | Return partial result + abort sequence | UNLIM response template "Mi e' caduto il segnale a metà, riprova tra un momento" italiano |
| L1 step error halt-on-error=false | Skip step + log warning + continue | Silent recovery, telemetry flag step_skipped |
| Onniscenza bridge timeout (>5s) | Skip onniscenza, use teacher_memory cached only | Degraded morphism, response baseline default |
| Sense 1.5 tuner missing context | Apply default (classe medio + docente novizio + LIM 1080) | Safe fallback morphism |
| ELAB module API down (es. n8n compile) | Return error step + suggest reload | Telemetry flag module_down + Andrea alert |
| Multi-tool sequence partial failure | Continue with available steps + report partial | UNLIM response transparent "Ho mostrato il LED ma il caricamento codice non e' riuscito, controlla connessione Arduino" |

### 9.2 Telemetry Grafana dashboard iter 25+

Metrics per L2 template:
- p50/p95/p99 latency
- Success rate (status='ok' / total)
- Halt-on-error rate (errore step → abort)
- Morphic adaptation rate (% tuned vs raw)
- Onniscenza bridge cache hit rate
- Top 10 most-invoked L2 templates (per docente/classe)

### 9.3 Cost analysis

| Component | Cost iter 25 close (100 scuole scale) |
|---|---|
| ClawBot dispatcher Edge runtime | €0 (Supabase Edge Function included Pro tier) |
| `openclaw_tool_memory` Postgres logs (1M rows/mo) | €0 (Supabase Pro 8GB included) |
| Onniscenza bridge calls | shared ADR-023 (~€460/mese cumulato) |
| Telemetry Grafana Cloud free tier | €0 (10k metrics/mo free) |
| **Totale Onnipotenza dedicato** | **€0/mese** (cumulato Onniscenza ADR-023) |

---

## 10. Onnipotenza demo Fiera-style 06/05/2026

### 10.1 Scenario canonical

Docente apre ELAB Tutor su LIM 65" 4K, capitolo Vol.1 cap.6 LED. Dice voce naturale: **"Ehi UNLIM, mostra il LED + carica il codice + spiega"**.

### 10.2 ClawBot runtime sequence

1. **wakeWordEhiUNLIM** detected → STT Whisper Turbo decode "mostra il LED + carica il codice + spiega"
2. **UNLIM LLM call** Llama 3.3 70B → emit JSON tool-use: `executeComposite("explain-and-mount-and-load", {component: "LED", capitolo: "v1-cap6"})`
3. **dispatcher.ts** receive + validate L2 template `explain-and-mount-and-load`
4. **onniscenza-bridge.ts** fetch ADR-023 state-snapshot 7-layer:
   - L1 RAG: Vol.1 pag.34 LED definizione
   - L2 Wiki: led.md analogia rubinetto
   - L3 Glossario Tea: termine "LED" + analogia "luce di emergenza"
   - L4 Class memory: classe primaria 9 anni + kit_omaric_base + capitolo_corrente=v1-cap6
   - L7 State current: simulator empty, no LED mounted
5. **sense-1.5-morphic-tuner** apply morphism: classe primaria → highlight grosso colorato + analogia rubinetto + voce slow rate
6. **executeComposite** sequence 6 L1 steps:
   - Step 1: `mountExperiment("v1-cap6-esp1")` → Simulator monta LED + R + Nano R4
   - Step 2: `highlightComponent(["led1"])` → highlight grosso giallo colorato Sense 1.5 LIM
   - Step 3: `loadScratchWorkspace(scratchXmlBlinkLed)` → Scratch carica blink LED
   - Step 4: `compileScratchToArduino()` → n8n compile Hostinger
   - Step 5: `uploadToBoard()` → AVRBridge upload HEX simulato
   - Step 6: `ttsIsabella("Ragazzi, vediamo il LED. E' come una luce di emergenza, si accende e si spegne. Aprite Vol.1 a pagina 34.")` → Voice Isabella italiana
7. **executeComposite** return `{ status: 'ok', steps_output: [...], telemetry: {...} }`
8. **UNLIM response final**: testo + voce + visual highlight → docente vede + sente + classe LIM proietta tutto

### 10.3 Tempo totale demo Fiera-style

p50 target: <8s end-to-end (wake word → response complete).

Breakdown:
- STT Whisper: 1s
- UNLIM LLM call: 2s (Llama 70B Q4 ~80 token)
- Onniscenza bridge 7-layer: 2s
- ClawBot 6 steps sequential: 2.5s (mount 200ms + highlight 50ms + Scratch load 300ms + compile n8n 800ms + upload 100ms + TTS Isabella stream 1s)
- Slack tolerance: 0.5s

Total: ~8s. Senza intervento docente. **Onnipotenza incarnata + Sense 1.5 morfismo evidence per Andrea + Davide + Giovanni + buyer Fiera Trieste**.

---

## 11. Cross-reference

- **ADR-013 ClawBot composite handler L1 morphic** (iter 6): base 52 ToolSpec + composite-handler scaffold dependencies, ADR-024 EXTEND prod active runtime.
- **ADR-019 Sense 1.5 Morfismo runtime**: teacher_memory + class_memory tabelle dependencies, sense-1.5-morphic-tuner.ts iter 25 implementation.
- **ADR-022 VPS GPU GDPR**: Llama 3.3 70B Q4 + Qwen 2.5-VL self-hosted EU host ClawBot inference.
- **ADR-023 Onniscenza completa** (sibling): state-snapshot-aggregator + onniscenza-bridge.ts pre-execute.
- **CLAUDE.md DUE PAROLE D'ORDINE**: Principio Zero V3 plurale Ragazzi + Vol/pag canonical INVARIANT (ogni L2 template emit response respect this) + Morfismo Sense 1+1.5+2 dual moat.

---

## 12. Sense 1.5 Morfismo alignment

Onnipotenza ClawBot 4-layer rispetta morfismo runtime ADR-019:
- **L2 template morphic_adaptation** schema (§4.2) = morfismo per docente esperienza + classe età + kit + LIM nel template stesso (declarative).
- **sense-1.5-morphic-tuner.ts** iter 25 = morfismo runtime application (NON hardcoded preference).
- **Adaptation matrix canonical §6.1** = morfismo dimensionale 5-axis (docente + classe + kit + LIM + capitolo).
- **400 morphic test cases harness 2.0** (§8.1) = invarianza morfica verified (stesso template + contesti diversi → step diverse MA Principio Zero V3 + Vol/pag canonical INVARIANT preserved).

---

## 13. Activation iter 22

Andrea iter 22 entrance ratify queue (~10 min):
1. Verify VPS GPU procurement complete (ADR-022 §10 timeline iter 17-21 close).
2. Verify Postgres migrations ADR-023 §7 applied prod (`unlim_session_memory` + `class_memory` + `teacher_memory`).
3. Approve composite-handler runtime active prod activation (breaking change).
4. Approve gen-app 5-agent OPUS Pattern S Phase 1 spawn iter 22 (40 NEW L2 templates).
5. Confirm demo Fiera-style 06/05/2026 booking (Andrea + Davide + Giovanni present).

**Iter 22 score target**: Onnipotenza Box NEW = 0.4 (40/80 L2 templates + composite-handler runtime active).

**Sprint T iter 25 close target ONESTO**: 9.95/10 (Onniscenza Box 1.0 ADR-023 + Onnipotenza Box 1.0 ADR-024 + Sense 1.5 morfismo runtime tuning live + demo Fiera-style PASS).
