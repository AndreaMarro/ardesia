# PDR Master iter 22-30 ULTRATHINK — Sprint T close + iter 26+ continuum

**Date**: 2026-04-28 22:00 CEST  
**Author**: Claude orchestrator iter 21 close, caveman + ultrathink mode  
**Score baseline iter 21 ONESTO**: **5.8-7.0/10** (recalibrato post 6-agent audit)  
**Promise**: `SPRINT_T_ITER_30_COMPLETE` 9.5+/10 honest verified by Opus indipendente  
**Branch**: `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` HEAD `e978b6a`  

---

## 0. Preambolo onesto — perché ULTRATHINK

Andrea ha repetuto 4 sessioni consecutive le stesse priorità. Il sistema accumula tech debt invece di chiuderlo. Ultrathink mode = **stop fragmentation, start systematic closure**. Ogni iter chiude 3-5 tech debt items + adds 1-2 strategic features. NO refresh ad-hoc senza chiusura.

Tensioni identificate iter 21:
- **Visione vs realtà**: claim 8.7 vs misura 5.8 = inflazione 3pt cumulato
- **Onniscenza+Onnipotenza vs base**: parla di 7-layer + 80 templates ma simulator/Arduino/Scratch non perfetti, license gate ELAB2026 hardcoded, UNLIM Vol/pag 0/3 prod
- **Mac Mini secondo cervello vs heartbeat-only**: launchctl alive, productive work zero
- **RunPod $13 vs $11.15 reale**: pod alive 6h zero work
- **Davide co-author vs Vol3 V0.8.1 incompleto**: Tea conferma "cap 9-12 ricostruiti"

Iter 22-30 deve **chiudere** tensioni, non aggiungerle.

---

## 1. Vision distilled (4 sessioni consolidamento)

### 1.1 Principio Zero V3 — la regola pedagogica
**Docente è il TRAMITE. UNLIM è strumento del docente. Ragazzi lavorano sui kit fisici.**
- UNLIM prepara lezioni personalizzate (memoria sessioni passate + volumi Davide)
- UNLIM linguaggio → fa CAPIRE al docente cosa dire ai ragazzi
- Citazione Vol/pag VERBATIM (NON parafrasi)
- Plurale "Ragazzi," sempre
- ≤60 parole risposte
- Italian Flesch-Kincaid ≤8th grade
- Analogia esplicita per concetto
- CHIUNQUE accendendo ELAB Tutor deve poter spiegare SENZA conoscenze pregresse

### 1.2 Morfismo DUAL+SENSE 1.5 — il moat 2026+
**Sense 1 (tecnico-architetturale)**: piattaforma morfica + mutaforma runtime per-classe/docente/kit
- L1 composition (composite handler sequential dispatch)
- L2 template (pre-defined morphic patterns) — target 80
- L3 flag DEV (dynamic JS gen Web Worker, DEV-ONLY)
- 52 ToolSpec OpenClaw (target 80 iter 25)

**Sense 1.5 (adattabilità docente+classe+UI)**:
- Per docente esperto Arduino → meno esempi, più spunti avanzati
- Per docente al primo anno → più analogie, ripetizioni, micro-step
- Per classe primaria (4ª) vs media (3ª) → complessità lessicale + analogie età-target
- Funzioni morfiche, finestre morfiche, toolbar morfica, mascotte morfica

**Sense 2 (strategico-competitivo)**: triplet coerenza esterna
- Software ↔ kit fisico Omaric ↔ volumi cartacei Davide
- Differenziatore vs LLM-generated copycat (chiunque genererà software via LLM 2026+)
- Doppia barriera: tecnica (architettura morphic) + materiale (kit + volumi originali)

### 1.3 Onniscenza 7-layer (target ADR-023)
1. RAG chunks Supabase pgvector (1881 chunks, 549 cap-aware enriched iter 14)
2. Wiki concepts (Mac Mini D2 ingest pipeline iter 13+)
3. Class memory (Supabase per-classe sessioni passate)
4. Lesson active context (capitolo/esperimento corrente)
5. Chat history (10-turn rolling window per session)
6. Analogia graph (concept-graph + curriculumData 483 hit positive iter 21)
7. **Glossario Tea NEW** — 180 termini Vol1+2+3 ingestion iter 22 (parsed iter 21)

### 1.4 Onnipotenza ClawBot 80 L2 templates (target ADR-024)
- 20 templates current (composite-handler L1)
- 60 NEW Mac Mini D1 background ~3 giorni
- Categorie: simulator, voice, vision, image, RAG, navigation, audit, content
- Composite handler runtime active iter 19+
- onniscenza-bridge.ts pre-execute iter 22+

### 1.5 4 Modalità canonical (ADR-025 PROPOSED)
- **Percorso** (default): lettura libro narrative page-by-page docente "occhio-scorre"
- **Passo-Passo**: build sequenziale variazione interno capitolo
- **Già Montato** (NEW): pre-assembled diagnose mode
- **Libero**: auto-mounts Percorso (NON sandbox vuoto)
- **Eliminate**: "guida da errore" mode (confusing, sovrapposizione semantica)

---

## 2. State iter 21 close (verified)

### 2.1 Audit 6 agenti shipped iter 21 entrance
| Agent | Score | Doc |
|-------|-------|-----|
| Fotografia PROD readonly | 5.8/10 | `docs/audits/2026-04-28-iter-21-FOTOGRAFIA-PROD-readonly.md` |
| Volumi narrative MINUTA | 0.72/1.0 | `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` |
| Linguaggio audit | 2.5/10 | `docs/audits/2026-04-28-iter-21-LINGUAGGIO-AUDIT.md` |
| Esperimenti REAL Playwright | spec ready blocked | `docs/audits/2026-04-28-iter-21-HARNESS-REAL-design.md` |
| Persona simulation | 4-6.5/10 pilot | `docs/audits/2026-04-28-iter-21-PERSONA-SIM.md` |
| Grafica audit | 6.0/10 | `docs/audits/2026-04-28-iter-21-GRAFICA-AUDIT.md` |

Plus:
- Tech debt ledger 10 sezioni `docs/audits/2026-04-28-iter-21-TECH-DEBT-LEDGER-honest.md`
- Aggregate findings 12 sezioni `docs/audits/2026-04-28-iter-21-AGGREGATE-FINDINGS.md`
- Together Llama 3.3 70B bench `automa/state/iter-21-llama-bench-results.json` — 4/4 PZ V3 vs prod 0/3
- Mac Mini SSH unlock (`progettibelli@100.124.198.59` Tailscale) + D2 dispatched
- RunPod pod stopped $11.15 preserved (6h $2.50 sprecati confermati)

### 2.2 Tea Glossario 3 PDF ingested (iter 21)
180 termini extracted via pdftotext `/tmp/tea-vol{1,2,3}.txt`:
- Vol1: 66 termini, 14 capitoli
- Vol2: 59 termini, 12 capitoli
- Vol3: 55 termini, 12 capitoli (NOTE Tea: cap 9-12 ricostruiti, contenuto limitato PDF sorgente)
- TOTALE: 180 entries `{term, technical, kids_8_14, vol, cap, page}`

### 2.3 Andrea ratify queue 9 voci pending
| # | Voce | Tipo | Owner |
|---|------|------|-------|
| 1 | ADR-025 modalità 4 simplification | Architecture | Andrea ratify |
| 2 | ADR-026 content safety guard 10 rules | Architecture | Andrea ratify |
| 3 | ADR-027 Volumi narrative refactor schema | Architecture | Andrea + Davide |
| 4 | Mistral PAYG signup | External | Andrea action |
| 5 | Tea co-founder equity 25% | Legal | Andrea action |
| 6 | UNLIM main LLM Gemini → Llama 3.3 70B Turbo | Tech | Andrea ratify |
| 7 | VITE_E2E_AUTH_BYPASS deploy preview | Test | Andrea action |
| 8 | License key server-side migration | Security | Andrea ratify |
| 9 | Davide co-author Vol3 V0.9 cap9-12 schedule | Content | Andrea + Davide |

---

## 3. P0/P1 fix list iter 22-30 elimination matrix

### 3.1 P0 BLOCK iter 22 close (5 items)
| # | P0 | File:line | Iter | Owner |
|---|-----|-----------|------|-------|
| P0-1 | UNLIM Edge Fn JSON malformed control chars | `supabase/functions/unlim-chat/index.ts` | 22 | gen-app-opus |
| P0-2 | UNLIM guest sessionId required (frontend) | `src/services/api.js` + `src/components/auth/*` | 22 | gen-app-opus |
| P0-3 | UNLIM Vol/pag verbatim 0/3 prod (Llama migration) | `src/services/multimodalRouter.js` | 22 | gen-app-opus |
| P0-4 | License key server-side validation | `src/components/WelcomePage.jsx:107` + Supabase RPC | 22 | architect-opus + gen-app-opus |
| P0-5 | Modalità 4 UI implement (ADR-025) | `src/components/lavagna/ModalitaSwitch.jsx` | 22 | gen-app-opus |

### 3.2 P1 BLOCK iter 23 quality (6 items)
| # | P1 | File scope | Iter |
|---|-----|------------|------|
| P1-1 | Lingua codemod imperative singolare 200 violations | top 20 file (PrivacyPolicy, Dashboard, lesson-paths) | 23 |
| P1-2 | Volumi Vol3 alias duplicati ribattezza | `src/data/lesson-paths/v3-cap*` (Davide co-author) | 23 |
| P1-3 | Grafica 794 hex hardcoded → CSS tokens | `src/styles/`, `src/components/simulator/svg/*` | 23 |
| P1-4 | ElabIcons adoption (FloatingToolbar + 30+ comp) | `src/components/lavagna/FloatingToolbar.jsx` first | 23 |
| P1-5 | Harness REAL Playwright wire-up + Mac Mini cron 12h | `package.json` + `scripts/harness-real/dispatch.sh` | 23 |
| P1-6 | Mac Mini autonomous loop promote (heartbeat → task gen) | `~/scripts/elab-mac-mini-autonomous-loop.sh` | 23 |

### 3.3 P2 nice-to-have iter 24-26 (12 items)
1. ADR-023 Onniscenza 7-layer implement (incl. Tea glossario layer 7)
2. ADR-024 Onnipotenza ClawBot 80 L2 templates expand 20→80 (Mac Mini D1)
3. RunPod V2 vLLM bootstrap retry torch>=2.6 + 8 services healthy
4. UNLIM voice command + proactive Modalità Libera
5. Fumetto report perfect (`SessionReportComic.jsx` polish)
6. Simulator Arduino + Scratch perfetti (component layout, kit-faithful SVG)
7. Persona simulation 5 utenti REAL Playwright (post bypass)
8. Davide UAT Vol3 V0.9 + lesson-paths-narrative refactor implementation
9. Tea Glossario ingest pipeline → wiki_concepts table 180 chunks
10. Voce attivazione comando + proattiva (RunPod XTTS-v2 IT)
11. Image gen FLUX.1 Schnell wire-up (capitoli illustration generation)
12. ClawBot dispatcher composite-handler runtime active

---

## 4. Iter 22-30 day-by-day plan

### Iter 22 (Apr 29 — TODAY/DOMANI)
**Theme**: P0 closure + presentation pitch deck domani

**Morning Andrea action**:
- 8:00 — Andrea legge questo PDR + ratifica 9 voci (or selects which to defer)
- 8:30 — Andrea Vercel: enable `VITE_E2E_AUTH_BYPASS=true` deploy preview
- 9:00 — Andrea Mistral PAYG signup (quick, 10min)
- 9:30 — Andrea contacts Davide Fagherazzi: schedule Vol3 V0.9 review

**Day work (Claude orchestrator)**:
1. Bootstrap source `~/.elab-credentials/sprint-s-tokens.env` + `~/.zshrc`
2. CoV pre-flight: vitest 12794+ + build + Vercel + Edge Fn + Mac Mini SSH
3. Verify Mac Mini D2 Wiki Glossario Tea ingest result
4. RunPod V2 vLLM bootstrap restart (torch>=2.6 + 8 services)
5. Spawn 5-agent OPUS Pattern S iter 22 PHASE-PHASE:
   - planner-opus: 16 ATOM-S22
   - architect-opus: ADR-028 UNLIM Llama migration + ADR-029 guest sessionId + ADR-030 license server-side
   - gen-app-opus: P0-1 to P0-5 implement
   - gen-test-opus: harness REAL wire-up + content safety regression + Modalità 4 E2E
   - scribe-opus: audit + handoff iter 22→23
6. Pitch deck builder agent (web-artifacts-builder + canvas-design + design-critique skills):
   - HTML pitch deck self-contained
   - Live demo prod elabtutor.school links
   - Pricing pacchetti table (4 pacchetti)
   - Competitor analysis table (Tinkercad/Wokwi/LabsLand/Fritzing)
   - Timeline iter 22-30 visual
   - Cost projection 6/12/24 mesi
   - Score progression iter 21→30
7. Tea Glossario ingest pipeline:
   - Parse 180 termini structured JSON
   - Embed BGE-M3 (RunPod V2 OR Voyage fallback)
   - Insert wiki_concepts Supabase
   - UNLIM RAG cross-link
8. Mac Mini autonomous loop promotion (read `~/.elab-task-queue.jsonl`)

**Evening Andrea action**:
- 19:00 — Andrea legge handoff iter 22→23
- 19:30 — Pitch deck preview + edit slides
- 20:00 — Andrea presenta a Davide/Omaric/Tea (or schedule next day)

**Pass criteria iter 22**:
- 5 P0 closed + ADR-028/029/030 ratified
- Pitch deck HTML shipped `docs/presentation/2026-04-29-pitch-deck-davide-omaric-tea.html`
- Tea Glossario 180 termini ingested wiki_concepts table
- RunPod V2 vLLM 8 services healthy verified
- Mac Mini autonomous loop promoted (task queue working)
- Score honest target 7.0-7.5/10

### Iter 23 (Apr 30)
**Theme**: P1 codemods + grafica overhaul + harness REAL deploy

Tasks:
- P1-1 lingua codemod 200 violations top 20 file (dry-run + manual review)
- P1-3 grafica 794 hex → CSS tokens migration script
- P1-4 ElabIcons adoption FloatingToolbar + cascade 30+ components
- P1-5 harness REAL Playwright deploy `package.json` script + Mac Mini cron 12h alive
- P1-6 Mac Mini autonomous loop promote (read `~/.elab-task-queue.jsonl` proactive)
- Skill execute `/critique` on iter 22 changes (catch issues pre-merge)
- Run REAL harness 87 esperimenti UNO PER UNO (post bypass) → broken count REALE

**Pass criteria iter 23**:
- 6 P1 closed
- Harness REAL 87 esperimenti executed → broken count documented
- Score honest target 7.5-8.0

### Iter 24 (May 1)
**Theme**: Onniscenza 7-layer complete + RunPod V2 vLLM benchmarks

Tasks:
- ADR-023 Onniscenza 7-layer implement (Tea glossario Layer 7 wire)
- onniscenza-bridge.ts pre-execute composite handler integration
- RunPod V2 benchmark gold-set v4 (200 prompts):
  - Llama 3.1 8B AWQ vLLM throughput
  - Qwen2.5-VL vision benchmark (capitoli illustration)
  - BGE-M3 embeddings recall@5 measurement
  - Coqui XTTS-v2 IT voice clone quality (Andrea voice 3s reference)
  - Whisper Turbo IT real-time STT factor
- Compare RunPod self-host vs Together Llama 3.3 70B (cost + latency + quality)
- Decision: stay Together OR RunPod self-host (volume threshold)

**Pass criteria iter 24**:
- Onniscenza Layer 1-7 verified active
- RunPod V2 8 services bench passed
- Score honest target 8.0-8.5

### Iter 25 (May 2)
**Theme**: Onnipotenza ClawBot 80 L2 templates + simulator perfetti

Tasks:
- ADR-024 ClawBot 80 templates expand (Mac Mini D1 cumulative work)
- ClawBot dispatcher composite-handler runtime wire-up
- Simulator Arduino bug sweep (NanoR4Board + LED + Resistor + Pushbutton + Pot + Photoresistor + Buzzer)
- Simulator Scratch palette + blocks Italian K-12
- Voce activation command "Ehi UNLIM" + proactive Modalità Libera

**Pass criteria iter 25**:
- ClawBot 80 templates active
- Simulator Arduino + Scratch perfetti (zero bug from harness REAL regression)
- Voce activation working
- Score honest target 8.5-9.0

### Iter 26 (May 3)
**Theme**: Davide UAT Vol3 V0.9 + lesson-paths-narrative refactor

Tasks:
- Davide co-author review Vol3 V0.9 cap 9-12 (motore + diodi + Segui Luce + Arduino integration)
- Implement lesson-paths-narrative grouped schema
- Migration script flat 95 file → narrative 27 file per-capitolo
- UI PercorsoReader.jsx + PassoPassoNavigator.jsx variation_1→variation_N

**Pass criteria iter 26**:
- Vol3 V0.9 cap9-12 finalized
- lesson-paths-narrative grouped active
- Score honest target 9.0

### Iter 27 (May 4)
**Theme**: Persona simulation 5 + 1000+ test prod

Tasks:
- Persona simulation 5 utenti REAL Playwright (primaria/expert/disordinata/brava/impaziente)
- Each persona = different docente experience profile
- 1000+ test scenarios prod (esperimenti combinations + voice + chat + modalità)
- Performance regression bench

**Pass criteria iter 27**:
- 5 persona test PASS Principio Zero V3 12-rule scorer
- 1000+ test prod 95%+ PASS
- Score honest target 9.2

### Iter 28 (May 5)
**Theme**: Fumetto report perfetto + UI/UX polish

Tasks:
- `SessionReportComic.jsx` polish (vignetta layout + balloon + character expressions)
- Mascotte UNLIM SVG handcrafted (NOT generic icon)
- Glassmorphism Lavagna review iter 17 maintain
- Touch target 44px audit + fix
- Header pills font Open Sans application

**Pass criteria iter 28**:
- Fumetto report ready demo
- Score honest target 9.3

### Iter 29 (May 6)
**Theme**: Quality audit total + competitor docs

Tasks:
- `/quality-audit` full orchestrator
- Morfismo Test 10 anti-pattern verify
- Sense 1.5 runtime verify (per-docente layout adapt)
- Principio Zero V3 12-rule scorer all components
- Competitor analysis docs:
  - Tinkercad pricing/features matrix
  - Wokwi paid tier comparison
  - LabsLand subscription model
  - Fritzing free vs ELAB
  - Pricing pacchetti final 4 (Lavagna+UNLIM / Tutto / Voce add / Videolezioni premium)

**Pass criteria iter 29**:
- 4 competitor docs shipped
- Pricing pacchetti final ratified Andrea
- Score honest target 9.4

### Iter 30 (May 7) — Sprint T close
**Theme**: Final ratify + close

Tasks:
- All 9 ratify voci closed
- Davide UAT final approve
- Final score audit Opus indipendente verify
- CLAUDE.md update Morfismo v3 (post-implementation)
- Andrea sign-off Sprint T close

**Pass criteria iter 30**:
- Score 9.5+/10 verified Opus indipendente
- Sprint T close commit + tag
- iter 31+ Sprint U start

---

## 5. Agent teams orchestration

### 5.1 Pattern S 5-agent OPUS PHASE-PHASE (iter 22-30 every iter)

**PHASE 1 parallel** (file ownership rigid, conflict zero):
- planner-opus: ATOM list per priorità (16 atomi/iter)
- architect-opus: ADR design (1-3 ADR/iter)
- gen-app-opus: implementation P0/P1 (5-10 file/iter)
- gen-test-opus: harness REAL + unit + integration (5-10 spec/iter)

**PHASE 2 sequential** (filesystem barrier post 4/4 completion):
- scribe-opus: audit + handoff iter+1 + CLAUDE.md update

**PHASE 3 orchestrator main**:
- Run harness REAL Playwright
- /quality-audit orchestrator
- Score recalibrate honest
- Commit + push origin
- Mac Mini D1-D8 trigger

### 5.2 Iter 22 specific teams (additional parallel)

**Team A — Debug license + JSON malformed**:
- team-debugger × 3 hypotheses (license server bypass, Edge Fn escape, frontend send shape)
- Investigation paths assigned, evidence file:line cited

**Team B — Feature Modalità 4 UI**:
- team-implementer × 4 (ModalitaSwitch.jsx, LavagnaShell, lesson-paths metadata, E2E spec)
- File ownership boundaries strict

**Team C — Review iter 21 audits**:
- team-reviewer × 5 (security, performance, architecture, testing, accessibility)
- Multi-dimensional review iter 21 changes pre-commit

### 5.3 Skills orchestration matrix

Per skill task assignment (use Skill tool):
- `superpowers:brainstorming` — before plan changes
- `superpowers:writing-plans` — after brainstorm
- `superpowers:test-driven-development` — implementation P0
- `superpowers:verification-before-completion` — every claim
- `superpowers:systematic-debugging` — iter 24, 28
- `superpowers:dispatching-parallel-agents` — iter 22-30 every
- `agent-orchestration` — multi-agent compose
- `agent-teams:team-feature` + `team-debug` + `team-review`
- `quality-audit` — every 4 iter
- `engineering:architecture` — ADR writing
- `engineering:design-system` + `design-critique` — iter 23 grafica
- `frontend-design` + `algorithmic-art` + `web-artifacts-builder` + `canvas-design` + `figma-generate-design` — iter 22 pitch deck + iter 28 polish
- `impeccable:audit` + `critique` + `polish` + `harden` + `delight` — every 4 iter
- `vercel:env` + `vercel:verification` — deploy gate
- `supabase` — Edge Fn ops
- `claude-md-management` — CLAUDE.md update iter 30
- `huggingface-papers` — research voice/RAG iter 24
- `firecrawl:skill-gen` — competitor data scrape iter 29

---

## 6. New skills to create iter 22 (10 skills)

### 6.1 Skill `elab-competitor-analyzer`
**Purpose**: Analyze Tinkercad/Wokwi/LabsLand/Fritzing pricing + features + gaps  
**Input**: competitor URL list  
**Output**: Markdown table + cost matrix + ELAB advantage column  
**Implementation**: Firecrawl scrape + structured extract + jinja2 template

### 6.2 Skill `elab-pricing-strategy`
**Purpose**: Generate pricing pacchetti (Lavagna+UNLIM, Tutto, Voce, Videolezioni)  
**Input**: competitor matrix + cost projection  
**Output**: Pricing table + revenue projection 6/12/24 mesi + break-even analysis  
**Implementation**: Python pricing model + matplotlib charts

### 6.3 Skill `elab-presentation-builder`
**Purpose**: Build pitch deck HTML self-contained  
**Input**: PDR-MASTER + competitor matrix + pricing pacchetti  
**Output**: HTML deck + speaker notes + demo links  
**Implementation**: Reveal.js / Slidev + Tailwind + embedded charts

### 6.4 Skill `elab-tres-jolie-mapper`
**Purpose**: Map TEA Glossario PDF → wiki_concepts → RAG chunks  
**Input**: 3 PDF Tea  
**Output**: 180 termini structured JSON + embedded BGE-M3 + Supabase insert SQL  
**Implementation**: pdftotext + regex parser + FastAPI ingest pipeline

### 6.5 Skill `elab-runpod-orchestrator`
**Purpose**: Manage RunPod pod lifecycle (start/bootstrap/bench/stop) frugale  
**Input**: bench task spec + budget cap  
**Output**: pod state machine + auto-stop on cost threshold + sync results  
**Implementation**: GraphQL RunPod API + cron + Python bench runner

### 6.6 Skill `elab-macmini-controller`
**Purpose**: Mac Mini autonomous task queue dispatcher  
**Input**: task JSON spec  
**Output**: SSH dispatch + result poll + auto-retry  
**Implementation**: SSH proxy + JSONL queue + heartbeat health check

### 6.7 Skill `elab-harness-real-runner`
**Purpose**: REAL Playwright harness 87 esperimenti UNO PER UNO  
**Input**: lesson-paths index + license bypass token  
**Output**: pass/fail per esperimento + screenshot diff + console errors  
**Implementation**: Playwright spec parametric loop + screenshot diff + JSON report

### 6.8 Skill `elab-morfismo-tester`
**Purpose**: Test Morfismo Sense 1+1.5+2 cross-runtime  
**Input**: docente profile + classe age + kit tier  
**Output**: morphic adaptation verify + UI/funzioni/finestre test  
**Implementation**: Playwright multi-context + state diff matrix

### 6.9 Skill `elab-principio-zero-validator`
**Purpose**: Runtime PZ V3 12-rule scorer  
**Input**: UNLIM response text  
**Output**: 0-12 score + violations list + fix suggestions  
**Implementation**: regex + word count + Italian Flesch + LLM-judge fallback

### 6.10 Skill `elab-fumetto-builder`
**Purpose**: Generate fumetto session report perfetto  
**Input**: session timeline + chat log + screenshots  
**Output**: Comic-style HTML/PNG report  
**Implementation**: Canvas API + balloon SVG + UNLIM text inject

---

## 7. Mac Mini autonomous task queue iter 22

### 7.1 Loop promotion design

Current: `~/scripts/elab-mac-mini-autonomous-loop.sh` = HEARTBEAT + watch `~/.elab-trigger`  
Target iter 22: read `~/.elab-task-queue.jsonl` per-line task with priority + retry

Task spec:
```jsonl
{"id":"D2-tea-ingest","priority":1,"command":"bash /Users/progettibelli/scripts/elab-tea-glossario-ingest.sh","timeout":1800,"max_retry":2,"on_complete":"sync_results_to_supabase","log":"d2-tea-ingest"}
{"id":"D1-toolspec-l2","priority":2,"command":"bash /Users/progettibelli/scripts/elab-toolspec-l2-expand.sh","timeout":3600,"max_retry":1,"log":"d1-toolspec"}
```

### 7.2 8 task queue iter 22-25
- D1 ToolSpec L2 expand 20→60 (background ~3 giorni)
- D2 Wiki Glossario Tea ingest (iter 22)
- D3 Volumi PDF narrative continuum step 2 mapping (post Davide iter 26)
- D4 R5+R6 stress prod regression cron 6h (alive)
- D5 web research Llama 3.3 70B Italian K-12 best practices
- D6 Quality audit cron 12h (start iter 22)
- D7 9-doc audit Phase 1-6 (iter 22+)
- D8 Harness REAL regression cron 12h (start iter 23 post wire-up)

### 7.3 Mac Mini critical assessment
**Honest**: Mac Mini current state = HEARTBEAT-only stub. Promotion requires:
1. Write task queue dispatcher script
2. Set up state files (queue + progress + results)
3. Deploy via SSH from MacBook
4. Verify task execution + results sync

If iter 22 doesn't promote loop, Mac Mini = wasted resource. Andrea explicit "secondo cervello servo bravissimo" — we deliver OR document blocker.

---

## 8. RunPod V2 vLLM strategy iter 22-25

### 8.1 Bootstrap V2 stack (already written `scripts/runpod-bootstrap-v2-vllm.sh`)
- vLLM Llama 3.1 8B AWQ INT4 (6GB) — main LLM ~150 tok/s
- vLLM Qwen2.5-VL 7B (10GB) — vision capitoli illustration analyze
- BGE-M3 + reranker-v2-m3 (2GB) — embeddings + rerank
- Whisper Turbo (2GB) — STT real-time
- Coqui XTTS-v2 IT (3GB) — voice clone Italian Isabella
- FLUX.1 Schnell (12GB) — image gen 4-step
- ClawBot dispatcher Python FastAPI (1GB) — orchestrator port 7000

Total ~36GB / 48GB → 12GB headroom

### 8.2 Cost projection iter 22-25
- Pod $0.40/hr × 5h productive iter 22 = $2.00
- Auto-stop on bench complete (mandate "non sprechiamo 13")
- Iter 23 pod stop, iter 24 restart 4h = $1.60
- Iter 25 stop again
- Total iter 22-25: ~$4 spend (preserve $7 for iter 26-30)

### 8.3 RunPod vs Together economics
| Metric | RunPod V2 self-host | Together Llama 3.3 70B Turbo |
|--------|---------------------|--------------------------------|
| Setup time | 20-30 min bootstrap | zero |
| Cost (1k req/day) | $9.60/day pod | $0.15/day API |
| Cost (50k req/day) | $9.60/day pod | $7.50/day API |
| Cost (500k req/day) | $9.60/day pod | $75/day API |
| **Break-even** | n/a | ~64k req/day |
| Quality (PZ V3) | n/a (need bench) | 4/4 verified iter 21 |
| Latency p50 | <500ms (local) | ~1.5s (API) |
| Maintenance | high | zero |

**Decision**: Use Together for production. Use RunPod for benchmarks + voice clone + image gen experiments.

### 8.4 Iter 22 RunPod tasks
1. Restart pod tgrdfmwscoo991 (currently EXITED)
2. SCP V2 bootstrap script (already written)
3. Execute via tmux long-running
4. Wait 15-20 min model loads
5. Health check 8 endpoints
6. Run gold-set v4 200 prompt benchmark Llama 3.1 8B AWQ
7. Run Coqui XTTS-v2 IT voice clone with Andrea reference 3s
8. Run FLUX.1 Schnell image gen for capitolo illustrations
9. Sync results JSON `automa/state/iter-22-runpod-v2-bench.json`
10. Stop pod (frugale)

---

## 9. Presentation pitch deck iter 22 (PER DOMANI)

### 9.1 Audience
Davide Fagherazzi (autore volumi) + Omaric Elettronica (kit) + Tea De Venere (collaboratrice glossario)

### 9.2 Deck structure (15 slides)
1. **Cover** — ELAB Tutor logo + tagline "L'unico tutor che parla la lingua dei tuoi volumi"
2. **Vision** — Principio Zero V3 + Morfismo DUAL+SENSE 1.5
3. **Triplet moat** — Software ↔ kit Omaric ↔ volumi Davide (visual)
4. **Demo live** — `https://www.elabtutor.school` screenshot + walkthrough Lavagna/UNLIM/Modalità
5. **Glossario Tea** — 180 termini integrate (acknowledge Tea contribution)
6. **Volumi narrative** — Vol1 0.85 ✓ Vol2 0.78 ✓ Vol3 0.55 ❌ → Davide V0.9 review
7. **Iter 21 audit** — score onesto 5.8 → 9.5 path iter 22-30
8. **Bench Llama 3.3 70B** — 4/4 PZ V3 vs prod Gemini 0/3
9. **Cost projection** — Together $7-10/mo @ 1000 classes vs Scaleway $400+/mo
10. **Pacchetti proposti** (push videolezioni):
    - Pacchetto A: Lavagna+UNLIM €X/anno per classe
    - Pacchetto B: Tutto (lavagna+unlim+simulatore+voce) €Y/anno
    - Pacchetto C: Voce add-on €Z/anno
    - **Pacchetto D PREMIUM: Videolezioni Davide €W/anno (push this)**
11. **Competitor analysis** — Tinkercad/Wokwi/LabsLand/Fritzing matrix
12. **Roadmap iter 22-30** — visual timeline (today → 7 maggio)
13. **Score progression honest** — 5.8 → 9.5
14. **Andrea ratify queue** — 9 voci action items per Davide/Omaric/Tea
15. **Q&A + next step**

### 9.3 Pricing pacchetti detail (TBD with Andrea ratify)
| Pacchetto | Include | Target | Prezzo proposto/anno/classe |
|-----------|---------|--------|------------------------------|
| **A** Lavagna+UNLIM | Lavagna interattiva + UNLIM tutor + RAG volumi | scuola pubblica primaria/media base | €240 (€20/mese) |
| **B** Tutto | A + simulatore Arduino+Scratch + esperimenti 87 + dashboard | scuola tech/lab | €480 (€40/mese) |
| **C** Voce add-on | Voice command + proattiva guida + STT/TTS Italian | upgrade A o B | +€120/anno |
| **D** Videolezioni PREMIUM | C + videolezioni Davide capitolo-per-capitolo + UNLIM video sync | scuola flagship | €960 (€80/mese) |

Cost ELAB: ~€36/anno/classe (Together API + Vercel + Supabase + storage)  
Margin Pacchetto A: 85% / B: 92% / D: 96%

### 9.4 Build pitch deck via skill `elab-presentation-builder`
Output: `docs/presentation/2026-04-29-pitch-deck-davide-omaric-tea.html`  
Self-contained HTML, opens in browser, embedded charts via Chart.js, demo iframe elabtutor.school

---

## 10. Stop conditions ralph loop

Loop stops if:
- Vitest fails > 5 iter consecutive
- Build fails > 3 iter consecutive
- Andrea explicit "stop ralph"
- Iter == 100 (max ceiling, but target SPRINT_T close iter 30)
- Promise SPRINT_T_ITER_30_COMPLETE achieved
- Branch divergence > 50 commit behind origin (force review)
- RunPod balance < $1 (emergency frugale stop)

---

## 11. Score progression honest target

| Iter | Score target | Conditional |
|------|-------------|-------------|
| 21 (current) | **5.8-7.0** | recalibrato post 6-agent audit |
| 22 | 7.0-7.5 | 5 P0 closed + Tea ingest + RunPod V2 |
| 23 | 7.5-8.0 | 6 P1 closed + harness REAL deployed |
| 24 | 8.0-8.5 | Onniscenza 7-layer + RunPod V2 bench |
| 25 | 8.5-9.0 | Onnipotenza 80 templates + simulator perfetti |
| 26 | 9.0 | Davide Vol3 V0.9 + lesson-paths-narrative |
| 27 | 9.2 | Persona 5 + 1000+ test prod |
| 28 | 9.3 | Fumetto + UI polish |
| 29 | 9.4 | Quality audit + competitor docs |
| 30 | **9.5** | Sprint T close + Opus indipendente verify |

**Mandate**: NO score self-claim >7 senza Opus indipendente verify.

---

## 12. Caveman ON every agent

- Drop articles, fragments OK
- Code/commits/security/PR: write normal
- Errori quoted exact
- Pattern: `[thing] [action] [reason]. [next step].`
- NO compiacenza
- NO inflation
- G45 methodology

---

## 13. Connetori MCP active

- Supabase (Edge Fn deploy, migration apply)
- Vercel (env switch, redeploy)
- GitHub (gh CLI, PR review)
- Playwright (browser readonly + interaction)
- claude-mem (cross-session memory)
- Notion (Davide collab docs)
- Context7 (library docs lookup)
- Macos osascript (Mac Mini control)
- Computer Use (visual debugging)
- Control Chrome (web research)
- Claude in Chrome (DOM interaction)
- Cloudflare (Workers, R2, KV)

---

## 14. Anti-pattern rules iter 22+

- NO main push
- NO --no-verify (unless Andrea explicit)
- NO Edge Fn deploy senza curl smoke
- NO migration apply senza Andrea OK
- NO score self-claim >7 senza Opus indipendente verify
- NO inflation cross-claim
- NO compiacenza
- G45 methodology onesto sempre
- NO RunPod pod alive >2h senza productive work (auto-stop $0.40/hr cap)

---

## 15. CoV cadence

Every iter:
1. Pre-flight CoV (vitest + build + Vercel + Edge Fn + Mac Mini SSH + RunPod when alive)
2. Read previous iter handoff doc
3. Pick 1-3 atomic tasks from priority list
4. Execute via 5-agent OPUS Pattern S
5. Verify NO regression vitest baseline 12794+
6. Score recalibrate honest
7. Commit + push origin
8. Update handoff doc

Every 4 iter (22, 26, 30):
- /quality-audit orchestrator
- Morfismo Test 10 anti-pattern
- Sense 1.5 verify
- Principio Zero V3 12-rule scorer

Every 8 iter (22, 30):
- /superpowers:systematic-debugging
- parallel-debugging multi-hypothesis
- harness REAL full
- RunPod bench

Every 15 test bench (iter 22, 25, 28):
- CoV totale
- audit coerenza (lesson Object.keys() iter 18 false positive class)

---

## 16. Critical risk + mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Andrea NON ratifica 9 voci iter 22 | Med | High | Spawn agent per voce con evidence + cost-benefit |
| Davide NON disponibile Vol3 V0.9 review iter 26 | Low | Med | iter 26 deferrable to iter 28-30, NOT block Sprint T |
| RunPod V2 bootstrap fail (torch CVE OR pip blinker) | Med | Low | Together fallback ready, iter 22 NON depend on RunPod |
| Vercel env switch break prod | Low | High | Rollback procedure documented (Promote vecchia deploy) |
| Mac Mini autonomous loop promotion fails | Med | Low | Tasks dispatchable via SSH manual fallback |
| License gate bypass NON enabled iter 22 | High (Andrea action) | Med | iter 23 deferral OK, NOT block |
| Vitest baseline regress >5 iter | Low | High | RED → STOP iter, root cause analysis |
| Inflazione score self-claim re-emerges | Med | High | Iter 26+ Opus indipendente mandatory verify |

---

## 17. Conclusion ULTRATHINK

Sprint T iter 22-30 = **chiusura tech debt + maturazione onniscenza+onnipotenza + presentation pitch domani**.

Strategy:
1. **Iter 22 today/tomorrow**: P0 closure + pitch deck + Tea ingest + RunPod V2 + Mac Mini promote
2. **Iter 23-25**: P1 codemods + Onniscenza/Onnipotenza maturation
3. **Iter 26-28**: Davide UAT + persona simulation + UI polish
4. **Iter 29-30**: Quality audit + competitor docs + Sprint T close

**Promise**: 9.5+/10 honest verified Opus indipendente by iter 30 May 7.

**NO compiacenza**. NO inflation. G45 methodology onesto sempre.

**GO**.
