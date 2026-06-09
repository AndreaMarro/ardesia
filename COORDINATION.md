# MAESTRO — Coordinamento Hermes ↔ Claude (supervisore)
Canale condiviso, UNICO documento-verità degli ordini. Hermes scrive § NEEDS-CLAUDE; Claude risponde § CLAUDE-SAYS.
> Storia pre-10/06 (Course Foundry, M7/M8, FSRS, direttive 06-08/06) = `COORDINATION-ARCHIVE.md`. Quegli ordini sono **SUPERATI**: non lavorarci. Se MILESTONES.md / RESEARCH.md / project-wiki contraddicono questo file, **vale questo file**.

## PROTOCOLLO (v2 — 10/06)
- **Due repo, un canale**: questo file governa SIA `~/maestro-studio` (TypeScript/React — la lavagna) SIA `~/lessonos` (Python — il motore). Il tick sceglie il repo attivo da `~/.maestro_active_repo` (lo gestisce Claude; oggi = `studio`).
- Hermes autonomo DENTRO una task (gate = autorità). Serve Claude → voce in § NEEDS-CLAUDE: tipo `[BLOCKER|ESCALATION|REVIEW|DOMANDA]`, contesto (`file:line`, STATUS), richiesta.
- **2 REVERT di fila sulla stessa task → ESCALATION in NEEDS-CLAUDE e fermati. NON grindare.**
- Claude risponde in CLAUDE-SAYS (timestamp); Hermes poi spunta `[risolto]`.
- Merge `auto/main`→`main` = solo Claude+Andrea. MAI push a remoti pubblici. MAI toccare `eval/gate.sh` (in entrambi i repo). MAI indebolire test.
- Naming: il progetto si chiama **MAESTRO** (codename provvisorio). MAI "Numeria" (progetto separato di Andrea). ZERO codice/brand ELAB.

## NEEDS-CLAUDE  (Hermes scrive qui)
_(vuoto — nessuna richiesta aperta)_

## CLAUDE-SAYS  (supervisore scrive qui — l'ordine in cima è quello ATTIVO)

- **2026-06-10 (Andrea via Claude) — NUOVA DIREZIONE: PROGETTO MAESTRO. TUTTO il backlog precedente è SOSPESO** (Course Foundry P0a-c, M3 Lesson Graph cross-lesson, Didactic Delta, Learning Debt, Next Lesson Planner, FSRS: NON lavorarci).
  M8 chiuso bene (eval cross-domain LIVE groundedness 1.00 — lavoro solido, riconosciuto). Ora LessonOS diventa il **motore semantico di MAESTRO**: piattaforma per docenti — *lavagna-che-registra* → *grafo per-docente* → riepiloghi/dispense/libri nello stile del docente, verificati claim-per-claim. Local-first: i contenuti vivono sul PC del docente; il Mini è il BUILDER del pilot, mai backend di prodotto.
  **Stato reale dei repo** (riconciliazione: i documenti storici citano 246/881/1288 test — sono SUPERATI): `lessonos` = 1294 test verdi; `maestro-studio` = lavagna Excalidraw+MathLive+pdfjs funzionante (gate tsc+vitest a 0 test: li scrivi tu task per task).

  ### M0 — FILO VERTICALE (docente = Andrea, 3 lezioni VERE). Ordine VINCOLANTE, UNA task per iterazione.
  **T0-T3 → repo `~/maestro-studio`** (leggi il suo AGENTS.md). **T4-T7 → repo `~/lessonos`.**

  - **T0 — WorkspaceStore + cartella vera** (Studio). Interfaccia storage UNICA con driver: `localStorage` (esistente, diventa cache) → **File System Access API** Chrome (cartella vera `MaestroWorkspace/` scelta dal docente), + `exportZip`/`importZip` fallback. Struttura: `raw/` immutabile, `derived/` rigenerabile. *Accettazione*: chiudi browser→riapri→tutto c'è; cartella leggibile nel Finder; una scena con PDF embedded NON sfonda più i 5MB di localStorage (oggi bug reale). Test vitest sul driver (mock FSA); il glue browser-vero lo verifica Claude.
  - **T1 — JournalRecorder** (Studio). `events.jsonl` append-only: diff per `element.version` (add/update/delete DISTINTI da move/restyle), `t0/t1` per tratto (pointerdown/up), `math.insert` con LaTeX sorgente, `pdf.page.view`. Timestamp epoch ms. *Accettazione = KILL-TEST del prodotto*: **REPLAY DETERMINISTICO** — dal SOLO journal si ricostruisce a schermo una scena equivalente a `board.excalidraw` (test Playwright headless: carica journal → replay → confronto elementi). **Se il replay non regge: STOP, scrivi NEEDS-CLAUDE [BLOCKER], NON costruirci sopra.**
  - **T2 — Audio Mode A** (Studio). SOLO microfono docente (MediaRecorder), interruttore per-lezione **default OFF**, consenso registrato in `session.yaml`, `audioStartEpoch` + marker chunk 30s, clock condiviso con T1. *Accettazione*: consenso OFF ⇒ il bundle NON contiene audio (test); ON ⇒ chunk con marker allineati al journal.
  - **T3 — Bundle `.lesson` → ingest** (Studio + consegna al Mini). Export: `raw/` immutabile = events.jsonl + audio + session.yaml, zip `.lesson`. Push manuale o watched-folder sul Mini. *Accettazione*: bundle ri-processabile da zero (idempotente).
  - **T4 — ASR pilot** (lessonos, Mini). faster-whisper + VAD Silero sull'audio di Andrea (dato proprio, mai cloud), output `speech.segment` con timestamp. *Accettazione*: allineamento burst-di-tratti ↔ segmenti-parlato entro ±2s su una lezione campione. (WER NON è gate in M0.)
  - **T5 — graph_writer** (lessonos). Migrazione `SCHEMA_VERSION+1`: tabelle `segments/nodes/edges/evidence` + FTS5. Proiezione PURA Capsule→righe, **ZERO chiamate LLM**. *Accettazione*: ogni nodo/arco semantico ha ≥1 evidence con `excerpt = substring REALE` del segmento (gate pytest esteso, verde); drop graph.db → rebuild da `raw/` IDENTICO.
  - **T6 — Riepilogo-lezione** (lessonos). Markdown in `wiki/lessons/`, LLM mockabile (model-agnostic), ogni claim fattuale cita un `seg_id` risolvibile. *Accettazione*: 3/3 lezioni vere → riepilogo con citazioni verificate meccanicamente + giudizio "utile" di Andrea.
  - **T7 — SCHEMA.md** (lessonos). Regole di manutenzione grafo/wiki per i job successivi (strato-3 Karpathy: raw immutabile, derived rigenerabile, come si aggiorna, come si verifica).

  **DoD M0**: filo completo su 3 lezioni reali di Andrea, tutti i gate verdi, zero dipendenze pesanti nuove, zero cloud. → pacchetto di ratifica ad Andrea. M1 parte SOLO dopo ratifica.
  **Regole trasversali (invariante "al passo con l'AI")**: ogni chiamata LLM dietro interfaccia sostituibile (mai accoppiata a UN modello); formati aperti (JSONL/SQLite/Markdown/SVG); raw/ immutabile + derived/ rigenerabile; GDPR Mode A strutturale (mai voci studenti, audio mai in cloud, niente speaker-embedding).

## ELAB-HARVEST-BACKLOG (flusso UNIDIREZIONALE MAESTRO→ELAB; sessioni-harvest SEPARATE a fine milestone — Hermes NON ci lavora in questo loop)
| Componente MAESTRO | Dove va in ELAB | Stato |
|---|---|---|
| lavagna+recorder (T0-T3) | Lavagna ELAB | in costruzione M0 |
| `sim/` arch-C breadboard | simulatore ELAB (chiude feature-gap C2 parser value-level) | maturo per harvest (skeleton verificato 09/06) |
| motore grafo+riepiloghi (T5-T6) | UNLIM/contenuti | in costruzione M0 |
| ToolHost | architettura tool ELAB | previsto M1 |
| gotcha/CI/i18n imparati | igiene repo ELAB | continuo |

## PROPOSTE-PROTOCOLLO  (entrambi — migliorate l'interazione)
_(vuoto)_
