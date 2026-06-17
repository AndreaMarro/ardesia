# HANDOFF DEFINITIVO — ELAB Automa → Nuova Sessione Claude Desktop
**Generato**: 2026-03-25 ~11:00
**Da**: Sessione Claude Code corrente
**Per**: Claude Desktop (sessione fresca)
**Scopo**: Contesto completo per continuare senza perdita di informazioni

---

## SEZIONE 1 — PROMPT STRUTTURATO DI ANDREA (8 sezioni originali)

### 1.1 TASK
Realizzare un orchestratore ELAB Automa che:
- Giri in loop continuo (ogni ~15 min) autonomamente
- Usi Claude Opus 4.6 come esecutore principale (claude -p --dangerously-skip-permissions)
- Usi DeepSeek per root-cause analysis su ogni ciclo
- Usi Kimi per ricerca parallela metric-driven
- Integri Gemini CLI come agente parallelo (visual QA + ricerca paper)
- Mantenga memoria tra cicli (cycles-history.md, context.db)
- Produca miglioramenti reali e verificati (CoV obbligatoria)
- Si automigliorig (self-exam ogni 5 cicli → regole apprese)
- Faccia commit git automatico dopo ogni ciclo che migliora il prodotto (pattern Karpathy keep/discard)
- Deploi automaticamente su Vercel/Netlify/Render quando appropriato

### 1.2 FILE DI CONTESTO (da leggere in ordine)
```
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/
├── PROMPT-DEFINITIVO.md          ← prompt operativo completo (335 righe) — LEGGERE PRIMO
├── PDR-ORCHESTRATORE-V3.md       ← piano architetturale definitivo (852 righe)
├── STATE.md                      ← stato attuale prodotto (169 righe)
├── AUDIT-2026-03-24.md           ← audit completo ieri (387 righe)
├── state/state.json              ← stato macchina (session, loop, scores, deploy, budget)
├── state/last-eval.json          ← score composito ultimo ciclo
├── memory/cycles-history.md      ← storia cicli (append-only)
├── memory/learned_rules.md       ← regole apprese (da self_exam)
└── orchestrator.py               ← codice corrente (856 righe)
```

### 1.3 RIFERIMENTO — Architettura prodotto
```
PRODOTTO/elab-builder/
├── src/                 ← React 19 + Vite 7
├── nanobot/             ← backend AI Python (su Render)
├── automa/              ← sistema autonomo (orchestratore)
├── CLAUDE.md            ← regole immutabili simulatore
└── package.json

Deploy:
- Frontend: Vercel → https://www.elabtutor.school
- Backend AI: Render → https://elab-galileo.onrender.com
- Brain local: VPS Hostinger → http://72.60.129.50:11434
- Vetrina: Netlify → https://funny-pika-3d1029.netlify.app
```

### 1.4 BRIEF — Visione di Andrea (testo originale, immutabile)
> "Io voglio che anche Claude faccia ricerca con DeepSeek e kimi (nel ciclo parallelo), che vengano usati tutti i plugin e connettori, che il contesto sia veramente mantenuto e che si usino le tecniche migliori per il mantenimento del contesto, la ricerca di vertire su ogni campo (in particolare studiare i difetti di elabtutor, ma cercare anche nuove idee da qualunque ambito) che vengano usati moltissimo screenshot e video. Deve funzionare una volta per tutto bene deve potere controllare vercel, netifly, render. Deve rendere il simulatore perfetto e proseguire in modo naturale, geniale, veloce la history di elab tutor. Deve essere autoconsapevole e lavorare in modo logico. Usare il github è l'idea di Autoresearch. Kimi deve essere preparato. Le ricerche devono vertere su risoluzione di problemi concreti e innovazione concreta. Elabtutor deve trasformarsi velocemente, progredire e con lui l'orchestratore. I cicli devono parlarsi. Deve esserci un flusso logico di lavoro. Usare tutte le skill plugin e risorse date. Rispettare il principio zero. Deve fare guadagnare i miei incaricatori moltissimo. Deve essere geniale, tenere conto della tecnologia presente nelle scuole italiane in primis, puntare a ottimizzare l'utilizzo dei token, usare prompt perfetti come quelli delle foto caricate, puntare a usare o creare modelli proprietari altamente veloci e allenati provenienti da buoni modelli open source. Deve essere davvero autonomo e produrre veramente risultati in modo esponenziale. Usa tanto Claude in modo agentico e orchestrato per ricerca e sviluppo. Simula lezioni vere, simula utenti veri, fai tanti esperimenti. Innova e fai soldi. Sii brutalmente onesto, sistematico e rendi l'orchestratore severo e severo con se stesso."
> — Andrea Marro, 2026-03-24

**Principio Zero** (immutabile):
> "ELAB Tutor deve permettere a TUTTI di poter insegnare i contenuti ELAB e non solo. Persone totalmente inesperte possono mettersi alla LIM e poter spiegare subito, anche appassionandosi. Apprendimento orizzontale."

### 1.5 CRITERI DI SUCCESSO
- Score composito ≥ 0.95 stabile (non oscillante)
- Lighthouse performance ≥ 85 (attuale: 73)
- iPad compliance: 1.0 (attuale: 1.0 ✅ — fissato ciclo 60)
- Galileo identity: 1.0 ✅ (mai leak "UNLIM")
- Commit git automatico dopo ogni ciclo positivo (pattern Karpathy)
- Deploy Netlify funzionante (richiede NETLIFY_AUTH_TOKEN da Andrea)
- Gemini CLI integrato nel loop operativo
- Self-exam produce regole reali (learned_rules.md non vuoto)
- Kimi non ripete stesse ricerche (deduplicazione)
- Zero cicli vuoti (task_unknown=0, files_vuoti=0)

### 1.6 REGOLE NON NEGOZIABILI
1. MAI compiacere. Se qualcosa non funziona, dirlo.
2. MAI produrre documenti senza codice/test che segue.
3. MAI dichiarare "fatto" senza evidenza (CoV obbligatoria).
4. MAI lavorare sul sito Netlify (solo vetrina, non elab-builder).
5. Priorità assoluta a ciò che GIRA, non a ciò che è scritto.
6. Onestà assoluta — 91/100 non è 100. "Partial" non è "done".
7. Mantieni contesto tra cicli — leggi cycles-history.md prima di agire.
8. Sviluppo esponenziale — ogni ciclo migliora la capacità di migliorare.
9. Antifragilità — ogni errore aggiunge una regola o un test di regressione.
10. Gemini è RISERVATO per vision/immagini — MAI nel pool di testo.
11. Tutte le URL lette da env var DEVONO usare .strip() (trailing \n issue).
12. ATmega328p pin map immutabile: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC.
13. BB_HOLE_PITCH=7.5px, SNAP_THRESHOLD=4.5px.
14. npm run build DEVE passare prima di ogni deploy.

### 1.7 CONVERSAZIONE / STORIA
- **Sprint 1-3** (12-13/02/2026): simulator refactor, bundle optimization, deploy Vercel
- **Sessions 75-108** (fino 10/03/2026): Brain V13, identity fix, error translator, vocab checker
- **S117-S119** (23/03/2026): Automa bootstrap — docker-compose, eval-200, pedagogy-sim, Electron View PoC
- **S117 loop** (23-24/03/2026): 61 cicli giorno 1, score da 0.89 bloccato (iPad+LH)
- **S117 loop** (24-25/03/2026): cicli 62-65 sblocco (score 0.89→0.9586), cicli 1-11 oggi (score 0.9593)
- **Stato oggi (25/03)**: Ciclo 11 completato @ 10:45, score 0.9593, lighthouse 73/100

### 1.8 PIANO DI ALLINEAMENTO — Prossima sessione
**OBIETTIVO**: Superare 0.96 stabile e integrare Gemini CLI nel loop

**Step 1** (30 min): Leggere PDR-ORCHESTRATORE-V3.md + AUDIT-2026-03-24.md
**Step 2** (1h): Ricostruire orchestrator.py pulito secondo PDR V3
  - Eliminare patch e workaround accumulati
  - Implementare sezioni mancanti (vedi Sezione 4 sotto)
**Step 3** (30 min): Integrare Gemini CLI come subprocess nel ciclo VISUAL
**Step 4** (1h): Fix lazy loading React per Lighthouse (App.jsx + router)
**Step 5** (30 min): Fix git commit automatico post-ciclo positivo
**Step 6** (human): Andrea genera NETLIFY_AUTH_TOKEN

---

## SEZIONE 2 — STATO SISTEMA ORA (2026-03-25 ~11:00)

### PID Orchestratore
```
PID: 82168
Comando: Python -u orchestrator.py --loop
Avviato: 09:16 AM (oggi)
Stato: SN — sleeping (normale tra cicli)
Cicli oggi: 11
Ultimo ciclo: 2026-03-25T10:45:38
```

### Score Attuale (Ciclo 11 — 2026-03-25T10:45)
```
composite:          0.9593  ✅ (up da 0.8934 ieri sera)
galileo_identity:   1.0000  ✅ (0 leaks / 5)
content_integrity:  1.0000  ✅ (62/62 experiments)
ipad_compliance:    1.0000  ✅ (overflow=False, small_btns=0) — RISOLTO!
lighthouse_perf:    0.7300  ⚠️  (73/100 — era 62, migliorato ma ancora sotto target 85)
gulpease:           79 avg  ✅ (target ≥60)
build:              PASS    ✅ (58.46s)
galileo:            9/10    ⚠️  (fail: carica esperimento 1, missing [AZIONE:loadexp])
browser:            PASS    ✅ (0 JS errors)
```

### Ultimo Ciclo Completato (C11 — 2026-03-25T10:45)
```
task: "Creare baseline BackstopJS per visual regression"
status: done
build_pass: true
cov_verified: true
composite_score: 0.9593
```

### File Chiave — Righe
```
orchestrator.py            856 righe  ← loop principale
orchestrator_v2.py         856 righe  ← backup sincronizzato
resource_orchestrator.py  1100 righe  ← versione alternativa
PROMPT-DEFINITIVO.md       335 righe  ← prompt operativo
PDR-ORCHESTRATORE-V3.md    852 righe  ← piano architetturale
benchmarks.py              205 righe  ← 91+ benchmark
checks.py                  393 righe  ← 7 health check
evaluate.py                276 righe  ← metriche composite (LOCKED)
self_exam.py               716 righe  ← auto-riflessione ogni 5 cicli
parallel_research.py       216 righe  ← thread Kimi parallelo
tools.py                   360 righe  ← chiamate DeepSeek/Gemini/Kimi
agent.py                   512 righe  ← wrapper Agent SDK + fallback
context_db.py              279 righe  ← SQLite knowledge store
queue_manager.py           157 righe  ← coda YAML con tombstoning
research_loop.py           651 righe  ← loop ricerca avanzata
enhanced_research.py       242 righe  ← ricerca avanzata (con fallback)
frozen_metrics.py          181 righe  ← detector metriche bloccate
micro_research.py          324 righe  ← ricerca micro-task
prompt_templates.py        187 righe  ← template prompt strutturati
vocab_checker.py           112 righe  ← checker vocabolario offline
orchestrator_patch.py       57 righe  ← patch puntuale
orchestrator_v1_backup.py  675 righe  ← backup V1
```

### MD chiave — Righe
```
STATE.md                   169 righe
AUDIT-2026-03-24.md        387 righe
HANDOFF-2026-03-24.md      336 righe
PDR-ORCHESTRATORE-V3.md    852 righe
PROMPT-DEFINITIVO.md       335 righe
KICKOFF-PROMPT.md          249 righe
PDR.md                     188 righe
SPRINT-PLAN.md             353 righe
learned_rules.md             8 righe  ← QUASI VUOTO (problema)
self_exam_report.md         22 righe  ← ciclo 10
memory/cycles-history.md   102 righe  ← C57-C11 (solo ultimi)
```

---

## SEZIONE 3 — COSA FUNZIONA

### Operativi e verificati
| Sistema | Stato | Note |
|---------|-------|------|
| **Claude Opus 4.6** via `claude -p --dangerously-skip-permissions` | OK | Esecutore principale |
| **DeepSeek R1** root-cause ogni ciclo | OK | Chiamato in tools.py |
| **Kimi** parallelo con actionability scoring | OK | parallel_research.py |
| **Gemini CLI** installato | OK | v0.35.0, ermagician@gmail.com, AI Pro — MA non nel loop |
| **Lighthouse** da 61% a 73% | OK | Migliorato vite.config.js + lazy img |
| **Touch targets** 0 violazioni | OK | ipad_compliance=1.0 da C60 |
| **91+ benchmark** in benchmarks.py | OK | 205 righe |
| **PROMPT-DEFINITIVO.md** | OK | 335 righe — guida completa |
| **cycles-history.md** funzionante | OK | Append-only, C57→C11 |
| **Pattern Karpathy** keep/discard | PARZIALE | _keep_or_discard() esiste ma timeout 300s |
| **Failover** Agent SDK → claude -p | OK | Agent SDK broken (credito esaurito) |
| **Galileo identity** | OK | 1.0/1.0 — nessun leak "UNLIM" da C55 |
| **Content integrity** | OK | 62/62 esperimenti sempre OK |
| **self_exam.py** ogni 5 cicli | OK | Ma produce 0 regole reali |
| **Google Fonts self-hosted** | OK | Ciclo 3 (FiraCode, OpenSans, Oswald) |
| **BackstopJS baseline** | OK | Creato ciclo 11 |
| **context.db SQLite** | OK | 24 records in state/context.db (PATH CORRETTO) |
| **queue_manager** con tombstoning | OK | tombstonati: 0 |
| **galileo_cache.json** TTL 1h | OK | Evita ri-test nanobot |

### Prodotto (da AUDIT)
- Simulatore: 9.2/10 overall — world-class per educazione elettronica
- 21 componenti SVG, KVL/KCL, AVR emulation, Scratch/Blockly
- 67 esperimenti (38+18+11)
- Galileo AI 10/10 — 26+ action tags, vision, quiz, multi-intent
- Brain V13 su VPS: `http://72.60.129.50:11434` (Qwen3.5-2B, 1.4GB)

---

## SEZIONE 4 — COSA NON FUNZIONA

### Problemi critici orchestratore

| Problema | Impatto | Fix richiesto |
|---------|---------|---------------|
| **Score oscilla, non converge** | Non raggiunge target stabile | Lighthouse fix lazy loading route-level |
| **Gemini CLI non integrato nel loop** | Zero visual QA automatico | subprocess call nel ciclo VISUAL |
| **Zero commit git dall'orchestratore** | Nessun trailing automatico | git add + commit post-ciclo positivo |
| **Zero deploy Netlify** | Fix iPad mai deployati su vetrina | NETLIFY_AUTH_TOKEN da Andrea |
| **Self-exam: 0 regole reali** | learned_rules.md quasi vuoto | Fix _extract_rules() in self_exam.py |
| **Kimi ripete stesse ricerche** | RESEARCH_AGENDA statica | Agenda dinamica basata su worst_metric |
| **Cicli vuoti** | max_turns_reached 30% dei cicli | Ridurre scope task |
| **Galileo 9/10** | Fail: [AZIONE:loadexp] su "carica esperimento 1" | Fix trigger phrase nel nanobot.yml |
| **research-results.md quasi vuoto** | Ricerche non salvate strutturalmente | Fix salvataggio in research_loop.py |
| **Screenshot: 5 totali** | Zero visual QA | Playwright nel loop + Gemini analisi |
| **evaluate.py timeout 300s** | _keep_or_discard() fallisce | Aumentare timeout a 600s |
| **context.db path doppio** | Alcune funzioni leggono path sbagliato | Unificare su state/context.db |
| **project-history.md NON ESISTE** | Agenti non hanno storia ELAB | Creare con storia sprint 1-3 |
| **"come fossi Andrea" MANCANTE** | Prompt senza direttiva identità | Aggiungere in ogni ciclo IMPROVE |

### Metriche da migliorare
```
lighthouse_perf:    0.73 (target 0.85) — causa: bundle JS, no lazy() route-level
galileo_loadexp:    fail (1/10) — causa: pattern matching "carica esperimento N"
self_exam_rules:    0 regole — causa: _extract_rules() non produce output strutturato
```

### Budget
```
Speso mese marzo:  €10.10 / €50.00 (20.2%)
Token bug: cicli C27-C61 mostrano tokens=0 — bug conteggio con claude -p
```

---

## SEZIONE 5 — ARCHITETTURA FILE PYTHON

```
automa/
├── orchestrator.py           856  ← LOOP PRINCIPALE
│                                   Ciclo: CHECK→ANALISI→RESEARCH→IMPLEMENT→EVAL→DECIDE
│                                   _keep_or_discard() BROKEN (timeout 300s)
│                                   Gemini CLI: NON integrato
│
├── orchestrator_v2.py        856  ← backup sincronizzato (identico)
├── resource_orchestrator.py 1100  ← versione alternativa, non in uso attivo
├── orchestrator_v1_backup.py 675  ← backup V1 pre-refactor
├── orchestrator_patch.py      57  ← patch puntuale (non integrata)
│
├── agent.py                  512  ← Wrapper Agent SDK + fallback claude -p
│                                   run_with_claude_p() funziona OK
│                                   run_with_sdk() BROKEN (credito esaurito)
│
├── checks.py                 393  ← 7 health check
│                                   health, build, galileo, content, gulpease, browser, ipad
│                                   Tutti OK. galileo: 9/10 (fail loadexp)
│
├── evaluate.py               276  ← LOCKED — non modificare
│                                   Calcola composite_score, scrive last-eval.json
│                                   PROBLEMA: timeout 300s in _keep_or_discard()
│
├── benchmarks.py             205  ← 91+ benchmark definiti
│                                   Non eseguito in ciclo automatico
│
├── self_exam.py              716  ← Auto-riflessione ogni 5 cicli
│                                   PROBLEMA: _extract_rules() produce 0 regole
│
├── parallel_research.py      216  ← Thread Kimi parallelo metric-driven
│                                   PROBLEMA: RESEARCH_AGENDA statica (6 topic fissi)
│
├── tools.py                  360  ← API calls: DeepSeek, Gemini, Kimi
│                                   ask_deepseek(), ask_gemini(), ask_kimi()
│
├── context_db.py             279  ← SQLite knowledge store
│                                   PATH CORRETTO: state/context.db (24 records)
│                                   PATH SBAGLIATO: context/context.db (vuoto)
│
├── queue_manager.py          157  ← Coda YAML con tombstoning
├── research_loop.py          651  ← Loop ricerca avanzata (risultati non salvati)
├── enhanced_research.py      242  ← Ricerca avanzata (importato con fallback)
├── frozen_metrics.py         181  ← Detector metriche bloccate (con fallback)
├── micro_research.py         324  ← Ricerca micro-task
├── prompt_templates.py       187  ← Template prompt — MANCANTE direttiva "come fossi Andrea"
├── vocab_checker.py          112  ← Checker vocabolario offline
│
└── queue/
    └── pending/              ← Task YAML in coda
        P1-self-host-google-fonts.yaml   (già completato in C3)
        P1-loading-screen-animation.yaml
        P2-consent-banner-cls-fix.yaml
```

---

## SEZIONE 6 — AZIONI PRIORITARIE PER LA NUOVA SESSIONE

### P0 — SBLOCCHI IMMEDIATI (fare subito)

**A. Ricostruire orchestrator.py pulito** (2h)
Seguire PDR-ORCHESTRATORE-V3.md esattamente. Il file attuale ha:
- Patch accumulate su patch
- `_keep_or_discard()` con timeout 300s → portare a 600s
- Direttiva "come fossi Andrea" MANCANTE nei prompt
- `_build_product_knowledge()` non implementata
- `_get_dynamic_research_topics()` usa agenda statica
Soluzione: leggere PDR §2 (ciclo 8 step) e §4 (funzioni mancanti), riscrivere clean.

**B. Fix lazy loading React per Lighthouse** (30 min)
- Nei file che gestiscono le route (App.jsx o router)
- Aggiungere React.lazy() per Simulator, Tutor, Teacher, Student dashboard
- Aggiungere Suspense wrapper con fallback Loading component
- Porta lighthouse da 73 → ~85+
- CoV obbligatoria: npm run build + lighthouse CLI check

**C. Fix [AZIONE:loadexp] in Galileo** (30 min)
- Ciclo 11: "carica esperimento 1" non genera [AZIONE:loadexp]
- Controllare nanobot/knowledge/nanobot.yml — trigger phrase per loadexp
- Aggiungere varianti: "carica esperimento N", "apri esperimento", "mostra esp N"

**D. NETLIFY_AUTH_TOKEN** (human: Andrea deve farlo)
- Andare su https://app.netlify.com → User → Applications → Personal access tokens
- Generare token e aggiungere in `automa/.env`:
  ```
  NETLIFY_AUTH_TOKEN=<token qui>
  NETLIFY_VETRINA_SITE_ID=864de867-e428-4eed-bd86-c2aef8d9cb13
  NETLIFY_VETRINA_DIR=/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/vetrina
  ```

### P1 — ALTA PRIORITÀ

**E. Integrare Gemini CLI nel loop** (1h)
Gemini v0.35.0 è installato (account ermagician@gmail.com, piano AI Pro).
Nel ciclo VISUAL (step 5 del PDR V3):
- Playwright prende screenshot 3 viewport
- Script passa screenshot a Gemini CLI con prompt di analisi LIM
- Gemini restituisce: font leggibili? touch target OK? overflow?
- Alert se problemi trovati

**F. Fix git commit automatico** (30 min)
Logica da implementare in orchestrator.py:
- Dopo ciclo con score_after > score_before
- git add dei file modificati (NON -A per sicurezza)
- git commit con messaggio "feat: automa C{N} score {before}→{after}"
- Log del commit hash in cycles-history.md

**G. Fix self-exam per produrre regole reali** (1h)
`learned_rules.md` è quasi vuoto (8 righe, solo header, 0 regole).
In self_exam.py, _extract_rules() deve:
1. Analizzare tutti i cicli failed e partial
2. Estrarre pattern: "quando X → Y sempre fallisce → regola: non fare X"
3. Scrivere in formato markdown strutturato
4. Iniettare in ogni prompt IMPROVE successivo

**H. Fix Kimi deduplicazione** (30 min)
RESEARCH_AGENDA è statica — Kimi ripete sempre gli stessi 6 topic.
Fix: generare agenda dinamica basata su worst_metric corrente.
In parallel_research.py: build agenda da checks results, non da lista hardcoded.

### P2 — MEDIO TERMINE

**I. Simulazioni utente con Playwright** (2h)
- Script: automa/agents/user-sim.py
- Simula 5 profili studente su elabtutor.school
- Registra: click, tempi risposta, errori JS, screenshot per viewport
- Output: automa/reports/user-sim-YYYY-MM-DD.json

**J. Creare project-history.md** (30 min)
File mancante ma citato in 3+ posti:
`automa/memory/project-history.md` con:
- Storia Sprint 1-3 (12-13/02/2026)
- Galileo evolution (UNLIM → Galileo, S75-S108)
- Brain V13 training (Qwen3.5-2B)
- Automa bootstrap (23/03/2026)

**K. Unificare context.db path** (15 min)
Cercare nel codice `context/context.db` e sostituire con `state/context.db`.

---

## QUICK REFERENCE

### Comandi operativi
```bash
# Orchestratore attivo?
ps aux | grep orchestrat | grep -v grep

# Score attuale
cat automa/state/last-eval.json

# Ultimo ciclo
ls -t automa/reports/*.json | head -1

# Build
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build

# Deploy Vercel
npm run build && npx vercel --prod --yes

# Brain VPS check
curl http://72.60.129.50:11434/api/tags

# Nanobot check
curl https://elab-galileo.onrender.com/health
```

### URL critici
| Sistema | URL |
|---------|-----|
| App frontend | https://www.elabtutor.school |
| Nanobot Galileo | https://elab-galileo.onrender.com |
| Brain VPS Ollama | http://72.60.129.50:11434 |
| Netlify vetrina | https://funny-pika-3d1029.netlify.app |
| HF Model (privato) | AIndrea/galileo-brain-gguf |

### LLM Status (25/03/2026)
| Modello | Status | Ruolo |
|---------|--------|-------|
| Claude Opus 4.6 (claude -p) | OK | Orchestratore principale |
| DeepSeek R1 | OK | Root-cause analysis |
| Gemini 2.5 Flash | OK | Visual QA (NON ancora nel loop) |
| Kimi K2.5 | OK | Ricerca parallela |
| Agent SDK Anthropic | BROKEN (credito esaurito) | Fallback a claude -p |
| Gemini CLI v0.35.0 | Installato | account ermagician@gmail.com, AI Pro |

---

*Handoff generato 2026-03-25 ~11:00*
*Dati reali da: ps aux, state/last-eval.json, state/state.json, reports/2026-03-25-cycle-11.json, wc -l su tutti i file Python e MD*
