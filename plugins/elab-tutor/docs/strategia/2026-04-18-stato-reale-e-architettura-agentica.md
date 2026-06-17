# ELAB Tutor — Stato Reale e Architettura Agentica
## 18 aprile 2026 — Documento strategico onesto

> **Scopo**: questo documento è la base per i due PDR seguenti. Prima di
> pianificare cosa fare, chiariamo cosa **È** il progetto oggi, cosa
> serve **veramente**, e perché alcune idee passate non hanno funzionato.
> Zero compiacimento. Zero inflazione. Se qualcosa non ha funzionato,
> lo diciamo.

---

## 1. Stato reale del progetto (verificato 18/04/2026)

### 1.1 Codice
- `session/2026-04-17-pdr-v3-prep` branch con 12 commit sopra main, tutti pushati su `elab-tutor` repo.
- Baseline: **12056/12056 test PASS** (stabile con `pool=forks` in vitest.config)
- Build: **PASS** (precache 4794 KiB, 30 entries)
- Sito produzione: https://www.elabtutor.school → 200 OK
- UNLIM backend: ✅ LIVE (verificato via Playwright su elabtutor.school)
- Kokoro TTS: ✅ LIVE su VPS `72.60.129.50:8881` (Docker container restart unless-stopped)

### 1.2 Tea e progettibelli-go — stato onesto (non quello mitologico)

Le "14 PR orfane" citate nel PDR esempio che hai inviato sono **inesatte**. Dati reali:

| Repo | PR aperte | Ultimo commit |
|---|---|---|
| `AndreaMarro/elab-tutor` (origin, io) | 0 aperte, 1 MERGED | oggi |
| `AndreaMarro/elabtutor` (work, progettibelli/tea) | **1 aperta (Tea #73)**, tutte le altre MERGED | 13/04 |

**Tea PR #73 ("fix: gestione errori import dinamici + icone esperimenti")**:
- Aperta 13/04/2026 — **5 giorni fa, mai mergiata**
- Stato: **CONFLICTING** (main del repo `elabtutor` ha divergenza)
- Contenuto: `importWithRetry.js` (nuovo helper), handler `vite:preloadError` in `main.jsx`, fix 8 icone `''` → emoji in `experiments-vol1.js` e `experiments-vol2.js`
- **+117/-86 linee, 6 file toccati**
- Tu hai già fatto un cherry-pick su `elabtutor` con commit `60884c6` ("feat: importWithRetry + chunk error handler (credit Tea PR #73)") ma la PR è rimasta aperta senza essere chiusa.

**Azione richiesta (non in PDR): chiudere PR #73 con commento di credito** — non c'è da rebase-mergiare perché i 6 file sono già sul repo `elabtutor`, e lei ha fatto una buona PR.

**progettibelli-go**:
- Ultimo PR mergiato #70 "fix(ExperimentPicker): wrap meta row on V3" il 11/04 — **7 giorni fa**
- 0 PR aperte oggi
- Silenzio totale da una settimana
- Perché? Tre ipotesi:
  a) Ha esaurito il contesto ed è rimasto in loop
  b) Tu hai smesso di invocarlo
  c) Il suo prompt iniziale era mono-turno
- Il PDR #2 serve a svegliarlo con un task concreto, limitato, ben definito.

### 1.3 Lavoro svolto in questa sessione (27-28h cumulative)

| Categoria | Volume reale | Note onestà |
|---|---|---|
| Commit pushati | 12 su `elab-tutor` | tutti con test 12056+ PASS |
| Test netti aggiunti | +73 (11983 → 12056) | comportamentali, non cosmetici |
| Bug critici fixati | 2 reali | UNLIM down (Gemini 3.x→2.5 GA), CSP health check |
| TASK PDR v3 chiusi | 3 (TASK 1, 3, 10, 11b) + 2 revertati (TASK 4, 5) | onestà: TASK 4/5 basati su testo libro errato vs sketch ufficiali |
| Deploy reali | Kokoro VPS 8881, 5 Edge Functions Supabase | con test curl |
| Audit doc | Vol3 vs sketch ufficiali (17/25 match) | doc pushato |
| Loop orchestratore attivo | **0 commit prodotti autonomamente** | scheduled tasks MCP non sono veri cron |
| Tempo Andrea sbloccante | ~30 min totali (SSH key, Gemini key, Supabase token) | molto bene |

### 1.4 Cosa ha funzionato

1. **Claude interactive con dispatch SSH + Supabase** → alta velocità (TASK 3/4/5 in 3h, Kokoro deploy 45min, UNLIM fix 20min)
2. **Commit ferrei + push ogni task** → zero perdita lavoro
3. **Baseline test come gate** → 0 regressioni sfuggite (quelle che pareva fossero regressioni erano flakiness di saturazione Mac)
4. **Playwright test live** → ha rilevato bug CSP che in dev sarebbero invisibili

### 1.5 Cosa NON ha funzionato (da cancellare dalla narrativa)

1. **Ralph Loop avversariale con 2 scheduled-tasks**: zero commit prodotti in 24h. Gli scheduled-tasks MCP dipendono dalla Claude Code app attiva e non sono cron di sistema. Disabilitati oggi.
2. **Ipotesi "14 PR orfane di progettibelli-go"** (dal PDR esempio): inesatta. Sono 0.
3. **TASK 4/5 PDR v3** basati sul testo del PDF libro Vol3: revertati dopo confronto con sketch ufficiali ELAB (zip che mi hai mandato). Gli sketch `.ino` sono la fonte di verità operativa, non il testo del libro.
4. **"UNLIM onnisciente e onnipotente"** come slogan: fumo. Concretamente UNLIM è un chat + vision + TTS con fallback chain. Non è onnisciente (non conosce lo stato delle sessioni degli altri studenti), non è onnipotente (non modifica il database del sito).

---

## 2. Le 15 repository/fonti che mi hai indicato — valutazione onesta

### 2.1 Fonti Anthropic ufficiali (da leggere e seguire)

#### `anthropic.com/engineering/harness-design-long-running-apps` ⭐⭐⭐⭐⭐

**Prende**:
- Pattern **triad Planner/Generator/Evaluator** validato da Anthropic (NON è un'invenzione nostra, è raccomandato).
- **Context resets > compaction** quando il contesto si riempie: il modello sviluppa "context anxiety" e abbandona i task. Fresh context da zero è meglio.
- **Sprint contracts** (definition of done esplicito) prima di implementare.
- Evaluator deve essere **aggressivo** (self-eval bias forte). La guardia che va tenuta più stretta.
- Regola dorata: **"rivedi complessità dell'harness ad ogni nuovo modello"**. Con Opus 4.6 alcuni orchestratori diventano zavorra. Con Sonnet 4.5 no. Sii disposto a buttare scaffolding.

#### `anthropic.com/engineering/managed-agents` ⭐⭐⭐⭐ (promettente ma incerto)

**Cosa è**: servizio hosted che gestisce sessioni long-horizon per te. Componenti decoupling:
- `Session` = append-only log events
- `Harness` = loop che chiama Claude
- `Sandbox` = container execution

**API chiave**: `wake(sessionId)`, `getSession(id)`, `emitEvent(id, event)`, `getEvents()`.

**Limiti onesti**:
- Pricing NON disclosed nel doc (potrebbe costare parecchio)
- Production case studies NON pubblicati
- È servizio nuovo, rischio di maturità non provata

**Raccomandazione per ELAB**: **NON adottare ora**. Valuta in Q3 2026 quando pricing e case studies saranno disponibili. Oggi Claude Code CLI + Git + scheduled tasks è sufficiente.

#### `anthropic.com/engineering/claude-code-auto-mode` ⭐⭐⭐⭐⭐

**Cosa è**: sistema permessi che decide automaticamente quali azioni approvare. Due strati:
- Layer 1: input prompt-injection probe (blocca attacchi)
- Layer 2: output transcript classifier (blocca azioni rischiose)

**Configurazione**: `claude auto-mode defaults` (~20 block rules sensate di default)

**Tre tier filtering**:
- Tier 1: file reads/search → allow automatico
- Tier 2: in-project file writes → allow (reviewable via git)
- Tier 3: shell/fetch/external → classifier gating

**Limite critico onesto**: **17% false-negative rate** su azioni pericolose. NON drop-in replacement per review umano su infrastruttura high-stakes.

**Raccomandazione per ELAB**: **ADOTTARE** per le sessioni Claude CLI long-running. Più sicuro di `--dangerously-skip-permissions`. Combinarlo con baseline-gate (test count + build) come guardia secondaria. Dettagli nel PDR #1.

#### `anthropic.com/research/long-running-Claude` ⭐⭐⭐⭐⭐

**Pattern validati da Anthropic**:
- **CLAUDE.md** + **CHANGELOG.md** = memoria portabile long-running
- **Ralph loop pattern** (completion promise + max iterations) → overcomes premature abandonment
- **Test oracles** essenziali (non "feedback soggettivo": numeri verificabili)
- **Commit discipline**: git commit per ogni unit of work + `vitest run` prima del commit
- **Failure mode primary**: "agentic laziness" → l'agent si ferma presto trovando scuse
- **Async monitoring via git**: controlli da lontano senza supervisione continua

**Raccomandazione**: è il playbook. Il nostro `CLAUDE.md` è già buono. Manca un vero **CHANGELOG.md** con pattern Anthropic (registro failed approaches e perché). Aggiunto al PDR #1.

### 2.2 Repository GitHub — valutazione una per una

Ho fatto `gh api repos/…` per metadata reali + READMEs. Onestà sugli astro della utility.

#### ⭐⭐⭐⭐⭐ **da integrare nel CLAUDE.md subito** (free, zero licenze)

**`forrestchang/andrej-karpathy-skills`** (54K stars, MIT)

Single `CLAUDE.md` con 4 principi derivati da osservazioni Karpathy su LLM coding pitfalls:

1. **Think Before Coding** — no assunzioni silenziose, surface tradeoffs, ask quando confuso
2. **Simplicity First** — no over-engineering. "Se 200 linee possono essere 50, riscrivi"
3. **Surgical Changes** — touch SOLO quello che serve. No refactor adiacente non richiesto
4. **Goal-Driven Execution** — success criteria verificabili (non vaghi)

Questi 4 principi risolvono **3 problemi che abbiamo visto in questa sessione**:
- Over-engineering (TASK 4/5 aggiungevano test che non servivano al caso reale)
- Assunzioni silenziose (ho assunto pulsante per Cap 7 senza verificare sketch)
- Changes chirurgiche (i commit di Vercel/CSP erano minimi, buono; altri commit toccavano più del necessario)

**Azione**: includere questi 4 principi in `CLAUDE.md`. Nel PDR #1.

#### ⭐⭐⭐⭐ **pattern da replicare (NON integrare codice per licenza)**

**`thedotmack/claude-mem`** (61K stars, **AGPL-3.0**)

Memoria persistente cross-session via ChromaDB + sqlite + RAG + Claude Agent SDK.

**Problema AGPL**: se integriamo il loro codice in ELAB, ELAB diventa copyleft AGPL. **Non va bene** per prodotto commerciale destinato a scuole + partnership Fagherazzi.

**Soluzione**: replicare il **design pattern** (compressione conversation history + retrieval) con nostro codice. Già abbiamo `unlimMemory.js` (3-tier: localStorage → Supabase → RAG). Possiamo estenderlo con:
- Session compression con Claude API dopo ogni fine sessione
- Embedding dei summary in Pinecone (già collegato via plugin)
- Retrieval dei summary rilevanti quando nuova sessione parte

**Azione**: "Session-Memory v2" nel PDR #1 come Fase 6.

#### ⭐⭐⭐⭐ **alternativa interessante per voce**

**`jamiepine/voicebox`** (19K stars, TypeScript)

Open-source voice synthesis studio locale. Clone voci + generate + effects.
Corre localmente (CUDA / MLX / Whisper). Supporta Qwen3-TTS.

Rispetto a Kokoro (già deployato):
- Kokoro: 82M params, solo IT limitato (1F + 1M voci)
- Voicebox + Qwen3-TTS: più flessibile, voice cloning possibile
- Voicebox richiede GPU per performance (Kokoro gira su CPU)

**Raccomandazione onesta**: **NON sostituire Kokoro ora**. Voicebox come roadmap Q3 quando avremo dati reali di uso classe per sapere se Kokoro basta. Oggi Kokoro funziona e costa €0/mese extra.

#### ⭐⭐⭐ **interessanti ma non priority**

**`hesreallyhim/awesome-claude-code`** (39K stars) — curated list di skills/hooks/slash-commands. Directory da spulciare per idee. Non integro ma bookmark.

**`quemsah/awesome-claude-plugins`** (498 stars) — collection di plugin metrics. Troppo piccolo per guidare decisioni.

**`Donchitos/Claude-Code-Game-Studios`** (11K stars) — 49 AI agents + 72 workflow skills per game dev. Pattern di **agent-mirror-hierarchy** (designer, coder, QA, PM) che potrebbe ispirare ELAB. Ma è game-specific, servirebbe adattamento pesante.

#### ⭐⭐ **gimmicky o speculativi**

**`JuliusBrussee/caveman`** (36K stars) — "caveman speak" per ridurre 75% token. **Controindicato per ELAB** che ha bisogno di linguaggio pedagogico completo per bambini 10-14 anni. Skip.

**`lsdefine/GenericAgent`** (3.5K stars) — self-evolving agent con skill tree. Interessante pattern ma troppo complesso, integrazione richiederebbe mesi. Skip.

**`EvoMap/evolver`** (4K stars) — "Genome Evolution Protocol". Nome ambizioso, documentazione vaga. Sembra marketing. Skip.

**`BasedHardware/omi`** (9K stars) — wearable AI (necklace). Fuori scope totalmente. Skip.

#### ⭐ **Non applicabile**

**`jamiepine/voicebox`** — vedi sopra, roadmap Q3.

---

## 3. Scelte infrastrutturali — onestà brutale

### 3.1 Secondo account Max parallelo? **NO**, salvo evidenza oggettiva

Un secondo account Anthropic Max costa **$200/mese**. Vale la pena solo se:
- Hai >1 agent che lavora 24/7 consumando quota Max al 80%+
- I task sono parallelizzabili (non dipendenti tra loro)

**Stato oggi**:
- 1 account attivo (questo)
- Consumo real: quando lavoro interattivo, picchi al 40-60% della quota
- Progettibelli-go è silenzioso da 7 giorni = 0% quota

**Raccomandazione**: **non aggiungere ora**. Prima scala l'utilizzo del singolo account con il PDR #1 (Claude CLI auto-mode long session). Se arriviamo a saturare quota regolarmente (>3 giorni consecutivi), allora valuta.

Alternativa fattibile a costo 0: **usare Anthropic API key in scripts/cron che lanciano Claude Code headless con -p**. Non richiede Max subscription, paghi a consumo.

### 3.2 GitHub Copilot? **NO per orchestrazione, SÌ per autocomplete**

Copilot è **autocomplete di codice**, non agent orchestrator. Non rimpiazza Claude per:
- Sessioni long-running
- Planning multi-step
- Tool execution (shell/fetch/test)

**Utilità reale per ELAB**:
- Andrea scrive codice in VS Code → Copilot autocomplete = +20% velocità scrittura
- Ma il grosso del lavoro (architettura, debug, test) resta Claude

**Raccomandazione**: attivalo se già hai subscription GitHub Pro (incluso in molti piani). Non comprare per ELAB.

### 3.3 AutoClaw GLM5.1? **Probabilmente no**, valuta dopo

Non ho trovato documentazione ufficiale matura per "AutoClaw GLM5.1" al 18/04/2026. GLM5.1 è un modello open di Zhipu AI, buono per inferenza offline, ma "AutoClaw" non appare in fonti Anthropic o awesome-lists.

**Raccomandazione onesta**: se non trovi product page ufficiale con SLA, docs API e case studies, skip. Non rischiare il prodotto ELAB su una tecnologia poco matura. Meglio investire le stesse ore su Kokoro v2 o LangGraph.

### 3.4 Claude CLI long-running con auto-mode — **SÌ, questa è la via**

La combinazione reale funzionante per ELAB è:

```
Claude CLI (installato localmente)
  + auto-mode (approvazioni automatiche + classifier)
  + tmux (detach + persistenza shell)
  + Git commit discipline (ogni unit of work)
  + Playwright per E2E verification live
  + vitest pool=forks per test stabilità sotto carico
```

Questo è il pattern del documento `anthropic.com/research/long-running-Claude` (Boltzmann solver case study). Validato da Anthropic. Zero bullshit.

**PDR #1** è costruito esattamente su questo stack.

### 3.5 Claude Design? **Sì prova, ma realistico**

"Claude Design" è uscito di recente (richiamato nell'immagine che mi hai inviato). Non ho visibilità diretta in questa sessione (non è tra i miei tool/skill attivi). Provalo tu separatamente per UI mocks, ma **non buttare il tempo aspettandolo come soluzione**. UI di ELAB è già funzionante e Tea ha dato contributi UX concreti.

---

## 4. Architettura proposta: "ELAB Agent Mesh v1"

Non un altro "Ralph Loop avversariale" fantasma. Un sistema operativo vero.

```
┌───────────────────────────────────────────────────────────────┐
│                  ANDREA (human supervisor)                     │
│   github notifications / slack / email per alert critici       │
└───────────────────────────────────────────────────────────────┘
                              ▲
                              │ async review PRs + benchmark
                              │
┌───────────────────────────────────────────────────────────────┐
│              BENCHMARK GATE (oggettivo, automatizzato)         │
│   10 metriche pesate → score 0-10 → pubblicato benchmark.json  │
│   scripts/benchmark.cjs eseguito post-ogni-commit               │
└───────────────────────────────────────────────────────────────┘
                              ▲
                              │ score must not drop
                              │
┌───────────────────────────────────────────────────────────────┐
│                    PLANNER AGENT (Opus)                         │
│   Legge CLAUDE.md + CHANGELOG.md + issues + git log             │
│   Produce specs atomiche in automa/tasks/*.md                   │
│   Non scrive mai codice sorgente                                │
│   TTL: 30 min                                                   │
└───────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│   GENERATOR AGENTS x3      │    │       EVALUATOR AGENT         │
│   (Sonnet parallel)        │    │   (Haiku — no self-eval bias) │
│   - generator-simulator    │    │   git diff analysis           │
│   - generator-unlim        │    │   npx vitest run verified     │
│   - generator-dashboard    │◄───┤   npm run build verified      │
│   Scope: src/** separato   │    │   Playwright E2E check        │
│   tools: Read/Edit/Write   │    │   Verdict: APPROVE/REVERT     │
│   TTL: 60-90 min each      │    │   Writes automa/evals/*.json  │
└──────────────────────────┘    └──────────────────────────────┘
                    │                           │
                    └─────────┬─────────────────┘
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                  GIT LAYER (single source of truth)             │
│   Branch feature/agent-mesh-* per ogni task completato         │
│   PR auto-creato via gh CLI                                     │
│   Andrea review + merge manuale (no auto-merge)                 │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                  MEMORY LAYER (cross-session)                   │
│   CLAUDE.md (instructions, evolving)                            │
│   CHANGELOG.md (history + failed approaches)                    │
│   automa/memory/sessions/*.json (session summaries compressi)   │
│   Pinecone index "elab-session-memory" (embedding summary)       │
│   RAG retrieval on new session start                            │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│            ANTI-REGRESSION LAYER (7 layer shield)               │
│   1. Pre-edit: grep forbidden patterns                          │
│   2. Post-edit: lint + type check                               │
│   3. Pre-commit hook: test count ≥ baseline                     │
│   4. Pre-push hook: build + playwright smoke                    │
│   5. CI GitHub Actions: full suite + E2E                        │
│   6. Snapshot tag ogni 2h (rollback atomico)                    │
│   7. Guard critical files: CircuitSolver/AVRBridge → auth req   │
└───────────────────────────────────────────────────────────────┘
```

### 4.1 Come questo si differenzia dal "Ralph Loop" fantasma

| Aspetto | Ralph Loop precedente | Agent Mesh v1 |
|---|---|---|
| Fonte di verità | automa/state/*.md scritti dal loop | **Git** (commit history ufficiale) |
| Trigger | scheduled-tasks MCP (dipende Claude app) | **Git push** → CI → benchmark → next planner invoke |
| Orchestratore | Claude interno che si auto-dispatcha | **Anthropic harness pattern** (separation concerns) |
| Comunicazione | File .md append-only | File + **git semantic** (commit = evento atomico) |
| Evaluator | Un altro scheduled task, mai davvero girato | Esegue davvero: `vitest` + `build` + `playwright` |
| Rollback | Nessuno | **Snapshot tag + CI block + revert automatico** |
| Memoria | Nessuna cross-session | **CLAUDE.md + compressed summaries in Pinecone** |

### 4.2 Come si interfaccia a un "orchestratore potente" (se ne aggiungi uno)

Il mesh espone 4 endpoint file-based che qualsiasi orchestratore esterno può consumare:

- `automa/tasks/pending/*.md` → lista task non ancora presi
- `automa/evals/verdicts/*.json` → esito ogni task completato
- `automa/memory/sessions/latest.json` → summary sessione corrente
- `automa/benchmark.json` → score oggettivo

Un orchestratore esterno (anche un tuo software custom) può:
- `read` questi file
- `push` nuovi task creando file in `automa/tasks/pending/`
- `monitor` evals e benchmark

Niente vendor lock-in: il mesh funziona standalone ma può essere "pilotato dall'alto".

---

## 5. Decisioni concrete da prendere ora

### Priorità alta (ti sblocca subito)

1. **Chiudi Tea PR #73 con messaggio di ringraziamento**. È stata aperta 5 giorni fa, i contenuti sono già tuoi (commit 60884c6). Non farla languire.
   ```bash
   gh pr close 73 --repo AndreaMarro/elabtutor \
     --comment "Grazie Tea! Il contenuto è stato integrato in commit 60884c6 sul repo principale elab-tutor. Cherry-pick manuale perché main era avanti di troppi commit per un rebase pulito. Ottimo lavoro sull'importWithRetry — è in produzione."
   ```

2. **Revoca chiave Gemini leaked** `AIzaSyB3IjfrHe...` su Google Cloud Console (rischio billing).

3. **Deploy Vercel** (`npx vercel login` + `npx vercel --prod`) — sblocca `/api/kokoro` e `/api/tts` in produzione.

4. **Eseguire PDR #1** (`docs/plans/2026-04-18-PDR-session-long-running.md`) in una sessione Claude CLI con auto-mode. 8-12h stimate. Non in questa chat interattiva — lancialo dal terminale.

### Priorità media (roadmap 2 settimane)

5. **Setup CLAUDE.md aggiornato con 4 principi Karpathy** + link Anthropic harness-design.
6. **Sistema Benchmark oggettivo** (vedi sezione dedicata più giù).
7. **Session-Memory v2** con Pinecone.

### Priorità bassa (roadmap Q3)

8. Valutare Voicebox se Kokoro inadeguato.
9. Valutare Managed Agents Anthropic quando pricing disclosed.
10. Secondo account Max solo se 1° account saturo 3 giorni di fila.

---

*Base per PDR #1 (Claude CLI long session) e PDR #2 (progettibelli-go risveglio).*
