# ARDESIA — ARCHITECTURE-CANON (23/06/2026)

> Spec architetturale canonica, ricavata dai repo reali e verificata firsthand (workflow `wf_a3b09ee4`, 10 agenti). Ogni claim a file:riga + stato **EXISTS / PARTIAL / MISSING**. NON marketing. Vedi [PRODUCT-CANON](PRODUCT-CANON.md) · [PLUGIN-MARKETPLACE-CANON](PLUGIN-MARKETPLACE-CANON.md) · [ELAB-AS-PLUGIN-CANON](ELAB-AS-PLUGIN-CANON.md).

## 0. Verdetto
La gerarchia **ARDESIA (OS didattico plugin-native) → Plugin → Pack → Workflow** è **già il design dichiarato** del monorepo (`~/ardesia/README.md:3`, verbatim: *"Piattaforma didattica local-first... marketplace di plugin immutabili... AI metodologica (mappa il metodo, NON insegna, NO-training)"*; FABBRICA≠PRODOTTO `:17`). **MA non esiste ancora come UN layer**: è Python engine-side (`~/lessonos`) + TS studio-side (`~/maestro-studio`) senza contratto Core condiviso. **Il primo lavoro del canon è DISEGNARE questo confine, non documentarne uno esistente.**

## 1. Mappa delle sorgenti canoniche (regola anti-divergenza)
| Cosa | Sorgente di verità | Note |
|---|---|---|
| **Struttura monorepo** | `~/ardesia` (Mini, git `main` HEAD `2b7c08ed`, 18/06, 766M) | Frozen dal 18/06 |
| **Comportamento ENGINE** | `~/lessonos@auto/main` (`08705fa`) | Il subtree `packages/engine` del monorepo è uno **snapshot STALE** (≈17-18/06, manca `api/app.py`,`voice_retrieval.py`,`content_loop.py`) |
| **Comportamento STUDIO/host** | `~/maestro-studio@auto/main` (`bc7b7a9`) | Il subtree `apps/studio` è STALE (manca `CanvasToolMount`/`killFeed`/`pluginRuntime`/`seam`) |
| **ELAB standalone** | `~/VOLUME 3/PRODOTTO/elab-builder` (MacBook, `7681789d`) | Mirrorato verbatim in `~/ardesia/plugins/elab-tutor` |
| **DA ARCHIVIARE** | `~/ardesia-monorepo` (Mini, `83b2852`, 17/06, 11M, solo packages+docs) | Dup stale → archivia per evitare una 3ª divergenza |

**REGOLA DURA #1:** per il comportamento corrente NON studiare mai i subtree `packages/engine`/`apps/studio` del monorepo — usa i repo vivi `~/lessonos` e `~/maestro-studio`. Il monorepo serve per STRUTTURA/governance, non per behavior.

## 2. La REGOLA DI CLASSIFICAZIONE (legge del progetto)
Ogni nuova funzione si classifica e va dove segue:
- **Capacità universale (vale per tutte le materie)** → **Core Ardesia**
- **Strumento riusabile** → **Plugin**
- **Contenuto/metodo di una materia** → **Pack** (gira dentro un Plugin)
- **Sequenza didattica vendibile** → **Workflow/Template** (marketplace)

Esempi (verificati): Lavagna→Core · Memoria studente→Core · Marketplace→Core · Firma/hash plugin→Core · Manual Reader→Plugin first-party · UNLIM→Plugin copilot · Simulatore→Plugin first-party · ELABTutor→**Pack** · CircuitSolver→dentro Simulation/ELAB pack · esperimenti LED/Arduino→contenuto del Pack.

## 3. I quattro layer reali — AS-IS vs AS-DESIGNED
| Layer | AS-DESIGNED | AS-IS (verificato) | Stato |
|---|---|---|---|
| **Engine** (Python, `~/lessonos`) | memoria+grafo+recap+CRM+export | method-graph (`graph/builder.py`,`suggest.py:serve_method_graph`), capsules+saved_lessons, CRM+consenso GDPR (`store/sqlite.py:739-955`, `purge_student`), recap ZERO-LLM (`recap_export.py`), PathMemory (`graph/path_memory.py:792`) | **EXISTS** |
| **Studio/board+host** (TS, `~/maestro-studio`) | lavagna + plugin host | board = Excalidraw stock; ToolHost reale (`src/toolhost/`, 28 file, ~71 test) | **host EXISTS, UNMOUNTED** |
| **Plugins** | tassonomia tool/pack/manual/workflow/copilot | manifest **senza `kind`** (`toolhost-protocol/manifest.ts:28`) | **taxonomy MISSING** |
| **Packs/Workflows** | pacchetti disciplinari versionati | solo dati ELAB (88 lesson-path) **fusi** nell'app standalone | **PARTIAL/fused** |

## 4. Il confine Core da disegnare (chi possiede cosa)
- **Engine possiede:** method-graph · grounded-memory · retrieval · recap · CRM/student-memory · content-graph · lesson-graph · export(generator).
- **Studio possiede:** board/ink · pagine PDF/immagini (`loadFile.ts` pdf.js raster) · citazioni · plugin-embeds · ToolHost(mount/sign/kill/storage/snapshot/CSP).
- **Contratti condivisi MANCANTI (da creare):** `ArdesiaPluginManifest` con `kind` · `ManualSource/ManualRef/BoardCitation` · `LessonMode` enum · `SedimentedContent` · l'event-bus tipizzato Core↔Plugin. **Nessuno dei 10 nomi `SedimentedContent` esiste come simbolo di codice.**

## 5. Tabella ONESTA persisted-vs-ephemeral (engine, `store/sqlite.py`)
| Dato | Stato |
|---|---|
| method-graph, capsules, saved_lessons, CRM+consenso, recap | **PERSISTED, REALE** |
| learning-debt (`graph/learning_debt.py`) | **COMPUTED, 0 scritture DB** |
| recurring-misconceptions (`path_memory.py:805`) | **ricalcolato ogni chiamata** (estrazione piena "not done") |
| quiz grading (`app.py:2189`) | **stateless** — score mai salvato, nessuna tabella `quiz_results`/`attempts` |
| **Conseguenza:** la memoria per-studente del vision (errori ricorrenti, debt) **richiede nuova persistenza**, non solo wiring. |

## 6. Sequenza di decoupling (vedi ELAB-AS-PLUGIN-CANON §6)
**Confine #1 = HOST BOUNDARY.** Precondizione accoppiata P0: (a) **montare l'host in una route di produzione** (oggi unmounted — unico consumer `ReferenceBlinkDemo` srcDoc che **bypassa** firma/install) + (b) **far montare ELAB attraverso l'host** via `renderEmbeddable()` (= task MOUNT-CANVAS già in `ARDESIA-MAP`). + **lint/CI gate** che fallisce se `plugins/elab-tutor/src/{App.jsx,main.jsx}`, `components/auth/`, `supabase/functions/` riappaiono.

## 7. Roadmap grounding (A–H)
A(canon)=greenfield(=questi doc) · **B(plugin host)=~90% COSTRUITO / 0% montato** (la sicurezza dura è fatta; manca wiring-in-route + `kind`/visibility/marketplace nel manifest + routing capability non-board) · C(Manual Reader)=**greenfield** a livello Core (esiste solo PDF-board studio-side `loadFile.ts`; manca il data-model manuale) · D(Simulation Plugin)=**engine fatto** (CircuitSolver MNA+path-tracing+validators, 22 componenti, AVR) → decouple+manifest+mount · E(ELABTutor Pack)=**dati fatti** (88 lesson-path/volume-ref/buildSteps/2-modi) ma fusi + provenance 0/88 → estrai+gate-provenance · F(UNLIM)=**fragile** (tag-regex) → formalizza typed-intent · G(student-pack)=**PARTIAL** (route study-pack esiste, manca `/v1/export` + board/plugin-state) · H(marketplace)=**greenfield** (solo kill-list+sign+local-install).

**Conclusione:** B/D/E/G = parzialmente fatti (decouple+wire+persist); C/H = greenfield; F = fragile-da-formalizzare. Il moat dell'architettura non è "fare più feature" ma **disegnare il contratto Core + montare l'host + estrarre ELAB in Pack**.
