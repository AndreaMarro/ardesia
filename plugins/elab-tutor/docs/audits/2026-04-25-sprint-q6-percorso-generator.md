# Sprint Q6 Audit — percorsoGenerator service

**Branch:** `feat/sprint-q6-percorso-generator-2026-04-25`
**Baseline:** 12481 (Q5) → 12498 (+17 Q6)

## Deliverable

### src/services/percorsoGenerator.js (160 lines)

Service generativo Percorso dinamico runtime.

**Input** (Karpathy Wiki LLM applied):
- capitolo (Capitolo schema)
- classMemory (livello, errori_ricorrenti)
- teacherMemory (stile_didattico)
- liveState (circuit attivo)
- llmCall injected (mockable)

**Output** Percorso JSON enriched:
- capitolo_id + livello + stile
- intro_text (narrative_flow.intro contestualizzato)
- esperimenti_ordered (riordinati per livello + errori)
- transitions (narrative_flow)
- citations (Vol.X pag.Y pointers)
- teacher_sidebar_summary (stile-adapted)
- closing
- llm_meta (preview + tokens + model)

**Funzioni pure esposte**:
- `orderEsperimentiByLivello(esp, livello, errori)` — sort priorità
- `estimateComplexity(esp)` — scoring (components×2 + phases + incremental)
- `extractCitationPointers(cap)` — theory + experiment pointers
- `buildTeacherSidebarSummary(stile, esp)` — sidebar summary
- `buildStaticFallback(cap)` — fallback se LLM down

**Architecture decisions**:
- Pure functions testabili (no LLM dipendenza diretta)
- LLM client iniettato (default stub mock)
- Graceful degradation: fail LLM → static fallback con minimal info
- Tutti gli output schema-validati

### tests/unit/services/percorsoGenerator.test.js (17 test PASS)

- estimateComplexity (3): null, components weight, incremental bonus
- orderEsperimentiByLivello (3): principiante asc, avanzato desc complex, errori priority
- extractCitationPointers (2): null, theory + experiment
- buildTeacherSidebarSummary (2): hands-on label, default
- buildStaticFallback (2): minimal output, null capitolo
- generatePercorso (5): null capitolo, full flow, default memories,
  LLM failure fallback, liveState in prompt

## CoV Q6

Baseline 12481 → 12498 (+17). Full suite 228 test files PASS.

## Architecture cumulative Q0-Q6

```
Q0 analysis 35 Cap reali (volume-structure.json + audit)
  ↓
Q1 schema Capitolo + migration 94→37 + percorsoService
  ↓
Q2 5 UI components consumer schema
  ↓
Q3 Edge Function: aggregator + Deno loader + prompt builder + validator + 20 fixtures
  ↓
Q4 Wiki L2: 30 concept md (PRINCIPIO ZERO, citazioni)
  ↓
Q5 memoryWriter: student/teacher compounding markdown
  ↓
Q6 percorsoGenerator: dynamic Percorso JSON da capitolo + memorie + LLM
```

**Stack completo runtime**:
1. UI Q2 mounta Capitolo da percorsoService.getCapitolo()
2. UNLIM chiama Edge Function con context Q3
3. Edge Function carica capitoli-loader (Deno) + buildCapitoloPromptFragment
4. percorsoGenerator può essere chiamato server-side per Percorso enriched
5. classMemory + teacherMemory da Q5 alimentano personalization
6. Wiki Q4 concept linking inline citations

## PRINCIPIO ZERO end-to-end Q0→Q6

| Sprint | PRINCIPIO ZERO check |
|--------|---------------------|
| Q0 | Tresjolie analysis honest, no inflation |
| Q1 | Schema enforce: classe_display + docente_sidebar duality |
| Q1.D | Field rename nominali (step_corrente, spunto_per_classe) |
| Q2 | UI separa display 70% classe + sidebar 25% docente |
| Q3 | Validator enforcement runtime (max_words, plurale, citations) |
| Q4 | Wiki L2 ogni concept include sezione PRINCIPIO ZERO |
| Q5 | memoryWriter note: "NO comandi al docente" |
| Q6 | generatePercorso passa rules in prompt fragment |

## Verdetto Q6

**PASS**. Service pure-function, LLM iniettabile, fallback graceful.

Sprint 6+ wire-up: integra in Edge Function `unlim-chat/index.ts` come call optional per "Percorso preview" requests. Default static Capitolo (Q1.C percorsoService) per request normali.
