# ELAB Tutor — Contesto per Claude Code

## DUE PAROLE D'ORDINE — coppia inseparabile

### 1. PRINCIPIO ZERO (la regola pedagogica)

**Il docente e il tramite. UNLIM e lo strumento del docente. Gli studenti lavorano sui kit fisici ELAB.**

- UNLIM prepara lezioni personalizzate basate sui volumi fisici + contesto delle sessioni passate
- Gli studenti NON interagiscono direttamente con UNLIM ne con ELAB Tutor: vedono tutto sulla LIM (Lavagna Interattiva Multimediale) proiettata dal docente
- Il linguaggio di UNLIM NON e rivolto direttamente all'insegnante come "fai questo" — deve fargli CAPIRE cosa fare e cosa dire ai ragazzi, usando le stesse parole del libro
- I ragazzi lavorano sui kit ELAB fisici (breadboard, componenti, batterie) seguendo le istruzioni del docente che legge dal Volume + dalla schermata UNLIM
- **CHIUNQUE** accendendo ELAB Tutor deve essere in grado, SENZA conoscenze pregresse, di giostrarsi sulla piattaforma e spiegare ai ragazzi
- Il testo dei volumi deve essere CITATO e USATO per la lettura — le stesse parole, non parafrasi
- Il differenziatore competitivo: nessun competitor prepara lezioni personalizzate basate sulle sessioni precedenti + contenuto specifico dei volumi

### 2. MORFISMO (DUE SENSI combinati — duale moat)

**Sense 1 — Tecnico-architetturale: piattaforma MORFICA + MUTAFORMA**

Il software ELAB Tutor è MORFICO runtime. Adatta forma + comportamento per-classe / per-docente / per-kit / per-livello-studente in tempo reale.
- **Codice morfico** (OpenClaw "Onnipotenza Morfica v4"): 57 ToolSpec declarative + L1 composition (composite handler sequential dispatch) + L2 template (pre-defined morphic patterns) + L3 flag DEV (dynamic JS generation Web Worker sandbox, DEV-ONLY)
- **Mutaforma**: UNLIM compone tools dinamicamente in base al contesto (classe primaria vs secondaria, kit basic vs avanzato, capitolo iniziale vs capstone)
- **Sintesi runtime**: prompt + RAG + Wiki + memoria classe + stato live → risposta adattiva NON pre-compilata
- **Adattamento progressivo**: stesso UNLIM diverse classi = comportamento diverso (memoria classe Supabase + analisi sessioni)

**Sense 1.5 — Adattabilità docente + classe + UI/funzioni (iter 10 estensione 2026-04-27)**

Il Morfismo runtime non è solo "stack di codice", è ESPERIENZA adattiva multi-dimensionale. Stesso prodotto, forma diversa per chi lo usa + dove lo usa:

**A. Per docente specifico** (linguaggio INVARIATO, contesto adatta):
- Linguaggio Italiano scuola pubblica plurale "Ragazzi," + cita Vol/pag VERBATIM = INVARIANTE (Principio Zero non negoziabile)
- Adatta dettagli: docente esperto Arduino → meno esempi base, più spunti avanzati. Docente al primo anno → più analogie esplicite, ripetizioni concetto, micro-step.
- Memoria docente: UNLIM ricorda quale docente ha già spiegato cosa nelle sessioni precedenti, NON ripete inutile, suggerisce next step coerente con percorso fatto.
- Stile docente: rilevato da pattern interazioni (es. docente che chiede sempre verifica componenti prima di codice → UNLIM proattivo highlight breadboard prima di mostrare codice).

**B. Per contesto classe specifico**:
- Età studenti rilevata (4ª primaria vs 3ª media) → complessità lessicale + analogie target età.
- Livello competenza classe rilevato sessioni passate (memoria classe Supabase) → progressivo difficoltà esperimenti.
- Kit specifico in dotazione (Omaric base vs avanzato vs custom) → mostra solo componenti effettivamente disponibili nel kit fisico classe.
- Capitolo corrente nel libro (lesson-paths active) → contesto retrieval RAG focused su chapter.
- Numero alunni + dispositivi (LIM 1 vs LIM+iPad ragazzi vs solo LIM) → adatta interfaccia (finestre più grandi LIM, denser LIM+iPad).

**C. Morfismo funzionale + UI/finestre (NEW iter 10)**:
- **Funzioni morfiche**: stesse capacità (highlight, mountExperiment, captureScreenshot, ecc.) MA invocazione + presentazione adatta contesto. Es: in Lavagna lezione frontale → highlight grosso colorato per visibilità LIM 5m. In Dashboard docente → highlight subtle inline per analisi puntuale.
- **Finestre morfiche**: pannelli/overlay/floating window adattano dimensione, posizione, contenuto, gerarchia VISUALE in base a:
  - Risoluzione LIM (1080p vs 4K) → font + componenti scalati
  - Mode active (Lezione vs Lavagna libera vs Dashboard vs Esperimento) → finestre rilevanti in primo piano, altre minimizzate
  - Touch vs mouse vs voice → target size + interaction zones adattive
  - Stato sessione (intro vs costruzione vs verifica vs report) → diversi pannelli prominenti per fase
- **Toolbar morfica**: 4 strumenti core (Pen / Wire / Select / Delete) + AI command bar UNLIM, MA layout/icone scalano per LIM front-class vs iPad student
- **Mascotte UNLIM finestra morfica**: posizione + dimensione + stato (parla/ascolta/aspetta) adatta workflow corrente
- **Quick-access pannelli**: docente esperienza accumulata → ELAB Tutor mostra shortcut frequenti suoi (es. docente che usa sempre "captureScreenshot+postToVision" → quick button)
- **Layout adattivo**: stesso schermo LIM proietta DIVERSO per docente A (ama dashboard sempre visibile) vs docente B (ama focus su Lavagna grande)

**Test Morfismo funzionale**: stesso esperimento aperto da 2 docenti diversi su stessa LIM = layout/funzioni/finestre adattate identità + storia ciascuno. Non è "preferenze utente" generiche → è MORFISMO automatico runtime apprendimento.

Differenziatore vs static-config competitor: Tinkercad/Wokwi/LabsLand = scripted/configurato + UI fissa per tutti utenti. ELAB = morfico runtime self-adapting docente+classe+contesto+funzioni+finestre + memoria persistente.

**Sense 2 — Strategico-competitivo: triplet coerenza esterna**

Il software ELAB Tutor è MORFICO al kit fisico + volumi cartacei. Stessa forma. Stessi nomi. Stesse pagine. Stesso ordine. Stessa estetica.

In mesi chiunque potrà generare software via LLM. Il differenziatore non sarà più "abbiamo software". Sarà la **coerenza esatta tra software ↔ kit fisico Omaric ↔ volumi cartacei** = singola esperienza unificata. Questo è il moat che NON si può copiare senza avere il kit fisico + i volumi originali.

**Combinato — DUAL MOAT 2026+**:
- INTERNO: software morfico runtime (Sense 1) = differenziatore tecnico vs static competitor
- ESTERNO: triplet coerenza materiale (Sense 2) = differenziatore competitivo vs LLM-generated copycat
- Doppia barriera entry: tecnica (richiede architettura morphic) + materiale (richiede kit + volumi originali)
- Nessun competitor puro-software può replicare entrambi senza investire kit fisico + volumi originali Omaric

Implicazioni morfiche IMMUTABILI:

**A. Visivo — ogni elemento UI deriva dal kit/volumi**
- NanoR4Board SVG simulatore = identico ad Arduino Nano del kit Omaric (colori, pin, layout, dimensioni)
- Componenti SVG (LED, R, condensatori, breadboard) = stessa palette + stessa proporzione del kit fisico
- Iconografia derivata dai disegni dei volumi (NON icone generiche stock)
- Palette ELAB = palette stampa volumi (Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D)

**B. Linguistico — testo dei volumi è CANONE**
- UNLIM cita VERBATIM dai volumi (Vol.X pag.Y "testo esatto") — `volume-references.js` 94/94 enriched (iter 37 +2 Vol3 cap7-mini + cap8-serial)
- Nomi capitoli software = nomi capitoli libro (NO "Lesson 1" — usa "Capitolo 6 — I LED")
- Esercizio nel software = identico esercizio nel libro (numerazione, ordine, parole-chiave)
- 37 Capitoli (Sprint Q) mantengono narrativa continua del libro (NO card flat indipendenti)

**C. Strutturale — ordine = ordine libro**
- Volume 1 → 6 capitoli software stesso ordine fisico (no Lezione 1 = capitolo random Vol.2)
- Lesson-paths JSON (`v1-cap6-esp1`) = mapping diretto volume + capitolo + esperimento
- Schema dati (`Capitolo.js`, `volume-structure.json`) = modello del libro fisico stesso

**D. Pedagogico — kit fisico SEMPRE protagonista**
- UNLIM mai sostituisce kit. Mai dice "puoi fare in simulatore". Sempre "costruite sul vostro kit + verifichiamo insieme"
- Simulatore = compagno di kit (verifica + diagnosi + tinkering), NON sostituto
- Diagnosi UNLIM riferisce SEMPRE al kit fisico ("controllate la breadboard fila E pin 13")

**E. Multimodale — voce + visione + tatto**
- Voce Isabella italiana = stesso registro narratore volumi
- Vision UNLIM = vede cosa hanno costruito sul kit fisico (foto/webcam) + cosa hanno simulato
- TTS legge testo dai volumi quando docente clicca "leggi questa pagina"

**F. Aggiornabile coerentemente**
- Quando volumi v2 escono → software auto-aggiorna RAG + lesson-paths + Capitoli (script `npm run sync-volumi`)
- Quando kit Omaric aggiunge componente → SVG simulator aggiunge componente identico (NON generico)

**Regola Morfismo TEST**: prendi una pagina random del Volume + una schermata random del software. Se NON sembrano "lo stesso prodotto fatto da persone che hanno parlato", Morfismo è violato.

**Anti-pattern Morfismo (vietati)**:
- Componenti SVG con palette generica (es. blu/rosso standard) invece kit Omaric
- UNLIM che parafrasa il libro invece di citarlo
- Capitoli software con titoli inventati (NO "Cap. 1: Introduzione")
- Esercizi software che esistono SOLO nel software (NON nel libro fisico)
- Icone generiche material-design invece icone derivate volumi
- Layout simulatore non riconducibile a setup fisico kit

**Differenziatore competitivo 2026+**:
- LLM coding renderà software facilmente generabile
- Chiunque può costruire "Arduino tutor" — ma NON può copiare kit Omaric + volumi cartacei + Morfismo coerente
- ELAB = unico prodotto dove software è "scritto dallo stesso autore dei libri" (Andrea coding, **Davide Fagherazzi volumi cartacei** già scritti completamente, Omaric kit hardware, Tea collaboratrice ruolo specifico TBD — il prodotto è UNIFICATO morficamente)

## Cosa e' questo progetto
ELAB e' un tutor educativo per elettronica e Arduino per bambini 8-14 anni.
Il prodotto include kit fisici (3 volumi + componenti) e questo software web.
Live: https://www.elabtutor.school

Include:
- **Simulatore di circuiti** proprietario (CircuitSolver MNA/KCL + AVRBridge avr8js)
- **94 esperimenti** in 3 volumi (38 Vol1 + 27 Vol2 + 29 Vol3), raggruppati in **27 Lezioni** (iter 37 +2 v3-cap7-mini + v3-cap8-serial)
- **Tutor AI "UNLIM"** (chat, voice, vision, RAG 549 chunk, report fumetto) — NON "Galileo"
- **Scratch/Blockly** per programmare Arduino visualmente
- **Compilatore Arduino** (C++ -> HEX -> emulazione AVR nel browser)
- **Dashboard docente** con progressi, nudge, export CSV
- **4 giochi didattici** (Detective, POE, Reverse Engineering, Circuit Review)
- **PWA** con service worker e offline support

## Stack tecnico
- React 19 + Vite 7 (NO react-router — routing custom con useState e hash)
- Vitest — **baseline**: unica fonte di verità `automa/baseline-tests.txt` (aggiornata automaticamente). Target 14000 entro Sprint 8. NON citare numeri a mano, usa sempre il file.
- Deploy: Vercel (frontend) + Supabase (backend DB)
- Nanobot AI: Render (https://elab-galileo.onrender.com)
- Compilatore: n8n su Hostinger (https://n8n.srv1022317.hstgr.cloud/compile)
- CPU emulation: avr8js (ATmega328p nel browser)
- Styling: CSS Modules (preferiti) + inline styles (legacy, da migrare)

## Anti-regressione (FERREA)
- BASELINE: `npx vitest run` PRIMA e DOPO ogni modifica — se test scendono → REVERT IMMEDIATO
- `npm run build` deve passare prima di ogni commit
- MAI fare `git add -A` senza controllare `git diff` prima
- MAI `--no-verify` su commit (pre-commit hook è lì per proteggerti)
- MAI push diretto su `main` — solo PR via `gh pr create`
- Snapshot baseline ogni sessione: `git tag baseline-HHMM`
- Se qualcosa si rompe: `git stash && npx vitest run` — se passa, il problema è nel tuo codice
- Score oggettivo: `node scripts/benchmark.cjs --write` — è la verità, non la self-claim
- Guard critical files: `scripts/guard-critical-files.sh` blocca modifiche engine senza `authorized-engine-change`

## Principi Karpathy (da `forrestchang/andrej-karpathy-skills`, 54K stars)
1. **Think**: ragiona prima di scrivere codice. Un minuto di pensiero ≫ 10 minuti di refactor
2. **Simple**: la soluzione più semplice che risolve il problema è quella giusta. Niente astrazioni premature
3. **Surgical**: tocca il minimo necessario. Un file, una funzione, una riga — mai "già che ci sei"
4. **Goal-driven**: ogni riga deve servire un goal esplicito. Se non sai perché la stai scrivendo, non scriverla

## Regola anti-inflazione numerica (CoV — Chain of Verification)
- **Mai inventare numeri**: se citi test count, deve essere appena visto in `vitest run` output o letto da `automa/baseline-tests.txt`, non ricordato a memoria
- **Mai inflazionare progress**: "quasi pronto" = 0%, "funziona" = testato live con utente reale
- **Mai self-rate**: il benchmark `node scripts/benchmark.cjs` è l'unico score valido. I claim del generator non valgono
- **CoV su ogni PR**: 3 volte `npx vitest run` prima di dichiarare "test passano" — se uno dei 3 fallisce → indaga flakiness, non nascondere

## Volumi fisici — parallelismo CRITICO
- **PDF**: `/VOLUME 3/CONTENUTI/volumi-pdf/` (Vol1 27MB, Vol2 17MB, Vol3 18MB)
- **Testo estratto**: `pdftotext "percorso.pdf" /tmp/volN.txt`
- **Regola**: OGNI esperimento nel simulatore DEVE citare pagina e testo esatto del volume
- **Struttura**: il libro presenta esperimenti come racconto continuo per capitolo, NON come card separate
- **27 Lezioni** raggruppano per concetto come nel libro fisico (src/data/lesson-groups.js)
- **Riferimenti**: src/data/volume-references.js (94/94 enriched con bookText dai PDF/ODT, ~1280 righe iter 37)

## Team — ruoli aggiornati 2026-04-28 PM (correzione Andrea)
- **Andrea Marro** — founder + software dev primario
- **Tea** — aiutante/socia/amica + co-dev + tester + creativa (USA CLAUDE CODE come Andrea, dev parallelo + QA + UX/idee creative + UAT)
  - Documenti: `/VOLUME 3/TEA/` (4 documenti del 13/04/2026)
    - analisi_complessita_esperimenti.pdf — 92 esperimenti analizzati, 4 capstone, MOSFET problematico
    - riepilogo_correzioni_github.pdf — PR #73 mergiata (chunk error + icone + Scratch)
    - schema_ux_semplificato.docx — 3 zone, Guida Docente, toolbar 4 comandi
    - 10_idee_miglioramento.docx — Dashboard, Proietta in Classe, Quaderno, Glossario, etc.
  - Capabilities: coding contributor + test E2E/UAT + idee creative UX + design feedback
- **Davide Fagherazzi** — autore VOLUMI CARTACEI (Vol1+2+3 già scritti completi) + procurement MePA (listing GIÀ COMPLETATO 2026-04-28)
- **Giovanni Fagherazzi** — ex Arduino global sales, network commerciale + warm intros scuole
- **Omaric Elettronica** — kit hardware filiera Strambino
- **Matteo** — nuovo collaboratore onboarding 2026-05-15 (iter 58 brief `/VOLUME 3/TEA/iter-58-brief-matteo.md`)
  - Onboarding 2 giorni × 30 min: capire progetto + ambiente + primo PR
  - Capabilities TBD (post-onboarding scope iter 70+)

## UNLIM AI (nome corretto, NON Galileo)
- **RAG**: 549 chunk in `src/data/rag-chunks.json` (volumi + glossario + FAQ + errori + analogie + codice)
- **KB**: `src/data/unlim-knowledge-base.js` → `searchKnowledgeBase()` + `searchRAGChunks()`
- **Context**: `src/services/unlimContextCollector.js` → `collectFullContext()` (circuit, code, compilation, step, errors, pin states)
- **Chat hook**: `src/components/lavagna/useGalileoChat.js` (nome file legacy, contenuto UNLIM)
- **Vision**: "guarda il mio circuito" → screenshot → Gemini Vision → diagnosi
- **Voce**: Kokoro TTS (localhost) + Edge TTS (VPS) + wake word "Ehi UNLIM" + 36 comandi vocali
- **Brevita'**: MAX 3 frasi + 1 analogia, MAX 60 parole, tag [AZIONE:...] non contano

## Regole immutabili

### Tecniche
1. Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
2. Scala SVG: NanoR4Board SCALE=1.8
3. BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px
4. Bus naming: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`
5. `.trim()` su TUTTE le letture di env var (bug Vercel trailing \n)

### Qualita'
6. `npm run build` deve passare prima di ogni deploy
7. `npx vitest run` deve passare prima di ogni commit. Baseline in `automa/baseline-tests.txt` — pre-commit hook confronta delta
8. Font minimo 13px testi, 10px label secondarie
9. Touch target minimo 44x44px per bottoni interattivi
10. Contrasto WCAG AA: 4.5:1 testo, 3:1 grafici
11. MAI emoji come icone nei componenti — usare ElabIcons.jsx
12. MAI dati finti o demo — tutto deve funzionare con dati reali
13. MAI aggiungere dipendenze npm senza approvazione di Andrea
14. MAI chiamare il tutor "Galileo" — il nome è **UNLIM**

### Design
15. Target: bambini 8-14 — interfaccia chiara, feedback visivo forte
16. Palette: Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D
17. Font: Oswald (titoli) + Open Sans (body) + Fira Code (codice)

## Collaborazione (multi-developer)
- **Mai pushare su `main` direttamente** — sempre branch + Pull Request
- Branch protection attiva: CI deve passare prima del merge
- Pre-push hook: blocca push su main se il build fallisce
- Branch naming: `feature/`, `fix/`, `style/`, `refactor/`, `docs/`
- Commit format: `tipo(area): descrizione` (es. `feat(unlim): aggiungi nudge vocale`)
- Leggi `CONTRIBUTING.md` per la guida completa
- Leggi `docs/HISTORY.md` per la storia completa del progetto

## File critici — coordinamento OBBLIGATORIO prima di modificare

| File | Righe | Ruolo |
|------|-------|-------|
| `src/components/simulator/engine/CircuitSolver.js` | 2486 | Solver DC MNA/KCL, Gaussian elimination |
| `src/components/simulator/engine/AVRBridge.js` | 1242 | Bridge CPU emulation avr8js, GPIO/ADC/PWM/USART |
| `src/components/simulator/engine/PlacementEngine.js` | 822 | Posizionamento automatico componenti |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | 3149 | Canvas SVG principale, zoom/pan/drag, 21 componenti |
| `src/components/simulator/NewElabSimulator.jsx` | 1022 | Shell simulatore, orchestrazione pannelli |
| `src/services/api.js` | 1040 | Tutte le API calls, routing, retry, fallback chain |
| `src/services/simulator-api.js` | 755 | API globale __ELAB_API, eventi, bridge |
| `src/services/unlimContextCollector.js` | 250 | Raccolta contesto completo per UNLIM |
| `src/data/lesson-groups.js` | 250 | 27 Lezioni raggruppate per concetto |
| `src/data/rag-chunks.json` | 4463 | 549 chunk RAG per ricerca offline |
| `vite.config.js` | 293 | Build config, chunk splitting, obfuscation |
| `package.json` | - | Dipendenze — mai modificare senza OK |

## Aree dove si puo' lavorare liberamente
- `src/components/lavagna/` — Redesign lavagna (in corso)
- `src/components/unlim/` — UNLIM mode UI (chat, mascotte, voice)
- `src/components/tutor/` — Tab, giochi didattici, layout
- `src/components/common/` — Componenti condivisi (ElabIcons, Toast, etc.)
- `src/components/dashboard/` — Dashboard docente
- `src/styles/` — CSS globali
- `src/data/lesson-paths/` — Percorsi lezione JSON
- `src/data/volume-references.js` — Mapping pagine volumi (DA COMPLETARE)
- `docs/` — Documentazione
- `tests/` — Test

## API globale simulatore
```javascript
window.__ELAB_API
  .unlim.highlightComponent(['led1', 'r1'])
  .unlim.highlightPin(['nano:D13'])
  .unlim.clearHighlights()
  .unlim.serialWrite('Hello')
  .unlim.getCircuitState()
  .on('experimentChange', callback)
  .on('stateChange', callback)
  .on('serialOutput', callback)
  .on('componentInteract', callback)
  .on('circuitChange', callback)
  .toggleDrawing(true/false)
  .setComponentValue(id, param, value)
  .connectWire(from, to)
  .clearCircuit()
  .mountExperiment(id)
  .getCircuitDescription()
  .captureScreenshot()
```

## Deploy commands
```bash
# Frontend -> Vercel (deploy automatico via GitHub Actions)
npm run build && npx vercel --prod --yes

# Backend -> Supabase
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy --project-ref euqpdueopmlllqjmqnyb
```

## Infrastruttura
| Servizio | URL | Stato |
|----------|-----|-------|
| Frontend | https://www.elabtutor.school (Vercel) | OK |
| Supabase | euqpdueopmlllqjmqnyb.supabase.co | OK |
| Nanobot AI | https://elab-galileo.onrender.com (Render) | OK (18s cold start, dice UNLIM) |
| Compilatore | https://n8n.srv1022317.hstgr.cloud/compile (Hostinger) | OK |
| Brain V13 | http://72.60.129.50:11434 (VPS (provider 72.60.129.50), Qwen35 1.9B Q5_K_M) | ⚠️ ALIVE ma **DEPRECATED** (verify 26/04 — 12s inference, JSON intent OK) — non in critical path, Gemini Flash-Lite più capace + economico |
| Kokoro TTS | localhost:8881 | SOLO LOCALE |
| Edge TTS | http://72.60.129.50:8880 (VPS (provider 72.60.129.50)) | ❌ **DOWN** (verify 26/04 — timeout 5s, HTTP 000) — discrepanza vs claim 16/04 OK; servizio crashed o firewall; **decommissioning candidate** se Coqui RunPod copre TTS prod |

## Bug/gap aperti (aggiornamento 23/04/2026)

Fonte dinamica: `automa/tasks/pending/*.md` + `docs/audits/`. Lista breve sintetica:

1. **Dashboard docente** — `src/components/dashboard/` ancora vuoto
2. **Playwright E2E** — 0 spec in `tests/e2e/` (target Sprint 6 Day 40: primo spec)
3. **Vision live** — trigger ok, E2E end-to-end non verificato
4. **Kokoro TTS prod** — Edge TTS VPS OK come alternativa
5. **Esperimenti non fattibili** — audit 92 vs kit fisico pending con Omaric
6. **Render cold start 18s** — warmup automatico presente, prima call lenta
7. **OpenClaw 11 handler TODO** — speakTTS, listenSTT, etc. (Sprint 6 Day 37)
8. **Supabase migrations non applicate** — `openclaw_tool_memory` + `together_audit_log` (Day 38)

Issue tracker autorevole: `automa/tasks/pending/`. Elenco qui è cache.

## Team agent — 8 ruoli (3 attivi + 5 roadmap Sprint 6+)

Attivi via `.claude/agents/`:
- **planner** opus → task atomici in `automa/tasks/pending/`
- **generator-app** sonnet → `src/**`, `supabase/functions/**`, commit atomici con test count
- **generator-test** sonnet → `tests/**`, `scripts/openclaw/*.test.ts`, mai src code
- **evaluator** haiku → `automa/evals/*.json`, scetticismo calibrato, no self-eval bias

Roadmap (plan `docs/superpowers/plans/2026-04-30-agent-team-cli-orchestration.md`):
- **architect** opus → `docs/architectures/`, `docs/adrs/`, read-only sul codice
- **security-auditor** opus → `docs/audits/security-*.md`, OWASP+GDPR+dati minori
- **performance-engineer** sonnet → `docs/audits/performance-*.md`, `scripts/bench/**`
- **scribe** sonnet → `docs/sunti/`, `docs/retrospectives/`

Team charter + handoff protocol: `automa/team-charter.md` + `automa/hand-off-protocol.md` (da creare Sprint 6).

**Lancio tipico** (da Claude CLI in sessione lunga):
```
@planner leggi stato, produci 1 task su metrica benchmark più bassa
@generator-app prendi il task in automa/tasks/pending/ATOM-001 e implementa
@evaluator verifica HEAD, verdetto PASS/WARN/FAIL
```

Dashboard team: `npm run team:dashboard` (roadmap).

## Benchmark oggettivo
- Script: `scripts/benchmark.cjs` (10 metriche pesate, score 0-10)
- Output: `automa/state/benchmark.json` con commit SHA + delta vs run precedente
- **Target 2026**: 8.0/10 (realistico in 2-3 mesi)
- **Baseline 18/04/2026 fast mode**: 2.77/10 (onesta, sotto i claim passati di 7-8)
- Fast mode: `node scripts/benchmark.cjs --fast` (legge artifact cache, no vitest/build)
- Full mode: `node scripts/benchmark.cjs --write` (gira tutto, scrive state)

## Test organization (filosofia: molti test ordinati)

**Regola**: ogni commit aumenta baseline o è refactor puro dichiarato. Pre-commit hook verifica delta.

**Struttura**:
```
tests/
├── unit/             # Vitest — <50ms, isolati
│   ├── services/     # api.js, unlimMemory, unlimContext
│   ├── components/   # React via @testing-library
│   ├── engine/       # CircuitSolver, AVRBridge, PlacementEngine
│   └── openclaw/     # OpenClaw dispatcher (Sprint 6+)
├── integration/      # Vitest — cross-module, <500ms
│   ├── supabase/     # Edge Function contracts
│   └── wiki/         # Wiki retriever + corpus
└── e2e/              # Playwright — browser, <10s/spec
    └── NN-*.spec.js  # Numbered per execution order

scripts/openclaw/*.test.ts  # OpenClaw unit (vitest.openclaw.config.ts)
```

**Command cheat-sheet**:
```bash
npx vitest run                                      # Tutti
npx vitest run tests/unit/services/                 # Un layer
npx vitest run -c vitest.openclaw.config.ts         # OpenClaw only
npx vitest --watch                                  # Dev loop
npx playwright test                                 # E2E tutti
npx playwright test tests/e2e/NN-*.spec.js          # Uno E2E
```

**Coverage target**:
- `src/services/**` → 70% entro Sprint 7
- `scripts/openclaw/**` → 80% entro Sprint 6 Day 42
- `src/components/**` → 50% entro Sprint 8

Long-form: `docs/test-organization.md`.

## Worktree convention

Feature major su worktree isolato `elab-builder-<slug>/`. Dopo merge: `git worktree remove <path>`.

| Worktree                   | Branch                                              | Stato         |
|----------------------------|-----------------------------------------------------|---------------|
| `elab-builder/`            | `main`                                              | Primary       |
| `elab-builder-openclaw/`   | `feature/pdr-sett5-openclaw-onnipotenza-morfica-v4` | PR #25 aperto |
| `elab-builder-watchdog/`   | watchdog work                                       | Sprint 4 eredità |
| `elab-builder-csp/`        | CSP hardening                                       | Merged, rimuovere |
| `elab-builder-wireup/`     | wire-up feature                                     | Merged, rimuovere |
| `elab-builder-fumetto/`    | fumetto feature                                     | Merged, rimuovere |
| `elab-builder-final/`      | CoV integration runs                                | Scratch       |

## OpenClaw "Onnipotenza Morfica v4" — Sett 5 architettura (22/04/2026)
Branch: `feature/pdr-sett5-openclaw-onnipotenza-morfica-v4` (worktree `elab-builder-openclaw/`).

**NON DUPLICA il lavoro Sett-4 POC — lo integra come Layer 1 di OpenClaw.**

- **Sett-4 eredità (già presente su main)**:
  - `scripts/wiki-query-core.mjs` — `makeRetriever(corpus)` keyword-based scaffold
  - `scripts/wiki-corpus-loader.mjs` — markdown+front-matter reader
  - `supabase/functions/unlim-wiki-query/` — Deno edge runtime sibling
  - 7 wiki test files + ADR-007 module extraction pattern

- **Sett-5 aggiunta (branch feature)** in `scripts/openclaw/`:
  1. `tools-registry.ts` — 57 ToolSpec declarative (JSON schema per LLM tool-use)
  2. `morphic-generator.ts` — L1 composition + L2 template + L3 flag-DEV-ONLY (Web Worker sandbox)
  3. `pz-v3-validator.ts` — Principio Zero v3 enforcement IT primary + EN/ES/FR/DE stub
  4. `tool-memory.ts` — Supabase pgvector cache + GC con `MIGRATION_SQL` 4 RPC
  5. `state-snapshot-aggregator.ts` — orchestratore parallelo (circuit + Wiki + RAG + memoria + vision)
  6. `together-teacher-mode.ts` — GDPR-gated fallback (batch/teacher/emergency, BLOCK su student runtime)

- **Deliverable docs**:
  - `docs/architectures/pdr-sett5-openclaw-onnipotenza-morfica-v4.md` (master doc)
  - `docs/business/revenue-model-elab-2026.md` (break-even onesto Stage 2b = 8-10 scuole)

**Decisione onesta:**
- L3 dynamic JS generation NON attiva in produzione. Flag `VITE_ENABLE_MORPHIC_L3=true` solo DEV.
- GPU VPS mensile premature optimization. GPU orarie €15-20/weekend per benchmark.
- Together AI solo per batch-ingest Wiki LLM una-tantum ($0,07) + teacher-context con consenso.
- Student runtime chat SEMPRE EU-only (Gemini EU / Mistral FR / Qwen locale su VPS EU TBD provider).


## Design Context

**Source of truth design**: → `.impeccable.md` (project root, generated 2026-04-27 via `/impeccable:teach-impeccable` skill).

Contiene:
- **Users** primario (docente LIM 8-14 anni studenti) + secondario (bambini via LIM) + terziario (Tea + Andrea dev)
- **Brand personality 3 parole**: Affidabile / Didattico / Accogliente (Andrea-confirmed iter 8 close 2026-04-27)
- **Aesthetic direction** (kit-coupled didactic, reference Lego Education + Khan Academy + volumi cartacei stessi)
- **Anti-references** (no Material Design SaaS, no cartoon Disney, no enterprise B2B Salesforce, no gaming RGB)
- **5 Design Principles**: Morfismo Triplet + Principio Zero Pedagogico + LIM-First Light Mode + Mai Demo Mai Mock + Anti-Inflation CoV
- **Anti-pattern checklist pre-merge** Test Morfismo (10 check, REJECT se viola anche solo 1)

**Source of truth orchestration sprint**: → CLAUDE.md (questo file, sezioni "DUE PAROLE D'ORDINE" + sprint history iter 1-8 close).

Single source of truth principle: design knowledge = `.impeccable.md`, orchestration history + tech stack = `CLAUDE.md`. Cross-link only, no duplication.


## NARRATIVE ARC CONTINUO — Andrea principio guida (richiamato 2026-05-17)

**Andrea verbatim**:

> "Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate. Significa che ogni esperimento del software deve agganciarsi al precedente e al successivo nella stessa sequenza del libro stampato. Se ti capita di lavorare su qualcosa che riguarda la modalità Percorso o la Modalità Passo Passo o le transizioni fra esperimenti, questo è il principio guida."

### Principio applicato (3 livelli)

1. **Data schema**: ogni esperimento ha `prev_id` + `next_id` + `cliffhanger_in` + `cliffhanger_out` references (libro fisico ordine sequenziale Morfismo Sense 2)
2. **Componenti transizione**: dove esperimento finisce (compile success + upload success + Album save + Passo Passo step complete) — UI MUST render cliffhanger CTA + page reference next esperimento
3. **Modalità rendering**:
   - Percorso (default): card sequenziali + cliffhanger render TRA ogni card (NO flat list)
   - Passo Passo: step preview NEXT + recap PREVIOUS (intra-esperimento narrative)
   - Libero: quick-access tutti esperimenti, narrative optional
   - Guida: narrative + on-error redirect

### Anti-pattern verbatim Andrea ("card flat scollegate")

= flat list rendering senza:
- Cliffhanger preview NEXT
- Recap micro PREVIOUS
- Continuous navigation (NO esci-rientra fra esperimenti)
- Page number visibile (volume/capitolo/pagina libro stampato — Morfismo Sense 2)

### Audit empirico stato iter 72 close 2026-05-17

**Schema esiste**:
- ✅ `src/data/cliffhanger-table.json` 14 Vol3 entries Tea-authored con `cliffhanger` + `next_id`
- ✅ `src/data/narrative-map-94.json` strutturato per-volume (`_meta + volumes`)
- ✅ `src/data/lesson-paths/v*.json` 79 files (38 Vol1 + 27 Vol2 + 14 Vol3)

**Wire-up UI mancante**:
- ❌ `ScratchCompileBar.jsx`: compile success → NO next-exp cliffhanger CTA
- ❌ `CompileUploadButton.jsx`: upload success → NO cliffhanger CTA
- ❌ `AlbumStudente.jsx`: save → NO link prossimo esperimento (iter 72 BG-A6 GAP)
- ❌ `PercorsoCapitoloView`: ZERO `cliffhanger|next_id` consume = flat card list anti-pattern
- ❌ `BuildModeGuide` passo-passo: iter 36 PM regression + narrative MISSING
- ❌ `lesson-paths/v*.json` schema MANCA `prev_id` + `next_id` + `cliffhanger_in` + `cliffhanger_out` fields

**Vol3 narrative gap**: 14 IDs implementati vs 29 Tea narrative-map references → 15 esperimenti narrativi non implementati (BG-A5 skeleton-first abandon iter 72, Davide co-author iter 73-74 mandatory).

### Iter 72 deliverables review narrative-lens (honest)

| Atom | Tipo | Narrative impact | Gap |
|---|---|---|---|
| ORCH-A4 PZ V3 fix | language | NEUTRAL | none |
| BG-A6 HomePage emoji | cosmetic | NEUTRAL | none |
| BG-A6 Album Supabase | END-OF-EXP artifact | **CRITICAL** | save → NO next-exp link |
| BG-A6 2 NEW ElabIcons | cosmetic | NEUTRAL | none |
| BG-A7 api.js Nano R4 | backend | NEUTRAL | none |
| BG-A7 ScratchCompileBar wire | END-OF-CODE artifact | **CRITICAL** | compile success → NO cliffhanger |

Iter 72 ha shipped infrastructure tecnica MA NON ha rinforzato arco narrativo continuo. Andrea richiamo principio applies retroactively iter 73 P0.4 follow-up wire components transizione.

### Sprint U close gate narrative

- ALL 79 esperimenti correnti hanno cliffhanger consumed UI
- Vol3 14→29 expanded con cliffhangers (Davide co-author iter 73-74)
- PercorsoCapitoloView renders narrative continuity (NO flat)
- Passo Passo fix iter 36 PM regression
- 3 transition components wired (ScratchCompileBar + CompileUploadButton + AlbumStudente)
- Playwright 79-94 esperimenti narrative spec PASS

### Cross-link docs narrative

- Strategy audit ORIGINAL: `docs/strategy/2026-05-17-iter-72-NARRATIVE-ARC-AUDIT.md`
- Strategy audit CORRECTION post Tea: `docs/strategy/2026-05-17-iter-72.5-NARRATIVE-AUDIT-CORRECTION.md`
- Cliffhanger source: `src/data/cliffhanger-table.json` (14 Vol3 entries wrapper format) + Tea canonical `/VOLUME 3/TEA/Nuovo lavoro tea/cliffhanger_table.json` (94 flat array)
- Narrative map: `src/data/narrative-map-94.json` (per-volume structured)
- Lesson-paths: `src/data/lesson-paths/v*.json` (79 files, schema HAS `next_experiment {id,title,preview}` validated iter 57)
- Feedback regression Passo Passo iter 36 PM: `feedback_passo_passo_regression_06may2026.md`
- Iter 57 close audit (Vol3 narrative arc shipped): `docs/audits/2026-05-14-iter-57-close-audit.md`
- Tea brief iter 58 (T1-T5 PENDING): `/VOLUME 3/TEA/iter-58-brief-tea.md`

### CORRECTION iter 72.5 audit (Tea materials read 2026-05-17 PM)

3 errori fattuali iter 72.5 audit precedente corretti post Tea folder + iter 57 close audit empirical read:

| Mia claim iter 72.5 | Realtà empirica | Status |
|---|---|---|
| "PercorsoCapitoloView ZERO cliffhanger consume = card flat scollegate" | renders `narrative_flow.transitions` line 40-43 + `intro_text` 216 + `closing_text` 298 | ❌ MY ERROR (grep too narrow) |
| "lesson-paths schema MANCA prev_id+next_id+cliffhanger" | HAS `next_experiment {id,title,preview}` object validated iter 57 `validate-lesson-paths.mjs` 94/94 pass | ❌ MY ERROR |
| "Vol3 14 vs Tea 29 = 15 missing requires Davide co-author" | Vol3 14 = iter 57 INTENTIONAL pedagogical chain Andrea+Tea ratified. Tea 29 = canonical SUPERSET reference (15 esclusi consapevolmente) | ❌ MY ERROR |

### Valid gaps iter 72.5 confirmed empirical post-correction

1. ScratchCompileBar.jsx ZERO `next_experiment` consume — compile success NO cliffhanger CTA
2. CompileUploadButton.jsx ZERO narrative consume — upload success NO cliffhanger CTA
3. AlbumStudente.jsx ZERO link to next experiment — iter 72 BG-A6 real gap
4. cliffhanger-table.json wrapper format vs Tea canonical flat array — Codex iter 70 TEAM A HIGH (audit runtime usage iter 73)
5. BuildModeGuide passo-passo regression iter 36 PM — 9+ iter carryover

### Iter 73 P0 RESTRUCTURE POST-CORRECTION (realistic)

1. Components transition cliffhanger CTA wire (~2h) — ScratchCompileBar + CompileUploadButton + AlbumStudente, pattern LessonPathPanel:462-471
2. cliffhanger-table audit decide runtime usage (~30min)
3. BuildModeGuide passo-passo regression fix (~2h iter 36 PM carryover)
4. Vol1/Vol2 coupled-title cleanup 33 drifts (~2h iter 57 deferred)
5. Tea T1-T5 review status check (Andrea ask OR Mac Mini delegate)
6. USB Web Serial port detection (~2h iter 72 BG-A7 follow-up)
7. Andrea ratify queue iter 72 close 8 voci

### REMOVED iter 73 P0 post correction

- ~~Vol3 Davide co-author 14→29~~ (iter 57 INTENTIONAL chain, Tea SUPERSET reference)
- ~~PercorsoCapitoloView cliffhanger render~~ (ALREADY renders narrative_flow)
- ~~lesson-paths schema add prev/next~~ (HAS next_experiment iter 57)
- ~~"94 esperimenti Playwright narrative audit"~~ (79 canonical iter 57 NOT 94 Tea SUPERSET)

### Anti-inflation G45 mandate post correction

Iter 72 close score 8.95/10 UNCHANGED (correction = post-doc audit, NON modifica deliverables iter 72). NON COMPIACERE applies to MY audit errors: admitted retroactively. Iter 73 priorities REALISTIC narrative gap (4 components + cliffhanger-table format + Passo Passo regression + Vol1/Vol2 titles) NON inflated false "15 missing Vol3".


## REVERT POST-DEMO 25/05/2026 — STATO IMMUTABILE

**STAY REVERTED**. Andrea ha rebbattezzato simulator + esperimenti a pre-demo (origin/main post `e290f779`). NON cadere nelle modifiche demo-era — sono REGRESSIONI causa.

### Cose REVERTED (mai più re-introdurre senza Andrea OK):
- `src/data/book-geometry/*.bookGeometry.json` — 8 file ELIMINATI (demo pixel-perfect parity)
- `src/data/demo-mode.js` — ELIMINATO
- `src/data/manual-index.json` — ELIMINATO
- `src/data/experiments-vol1.js`, `vol2.js`, `vol3.js` — full revert origin/main (eccetto v2-cap7-esp1 fix 25/05 PM)
- `src/data/lesson-paths/v1-cap6-esp1/2/3.json` + `v2-cap7-esp1/2.json` — reverted
- `src/components/simulator/components/{Capacitor,Led,PushButton,Resistor,Wire,WireRenderer}.jsx` — reverted (pre-demo SVG)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — reverted
- `src/components/simulator/engine/{CircuitSolver,PlacementEngine,useCircuitHandlers}.js` — reverted
- `src/components/simulator/panels/{BomPanel,ComponentDrawer,ComponentPalette,LessonPathPanel,PropertiesPanel}.jsx` — reverted
- `src/components/lavagna/{LessonSelector,ExperimentPicker,PercorsoCapitoloView,CompileUploadButton}.jsx` — reverted (rimosso demo-mode dependency)
- Test file demo-aware mocked patterns — reverted

### Cose PRESERVATE (NON revertire):
- `src/components/simulator/components/Battery9V.jsx` — keep (Andrea verbatim "la batteria che va bene con i fili che partono così")
- `src/features/elabBlocks/codeSync.js` — keep (real cppToAst translator iter 105)
- `src/components/home/HomeCompileEntry.jsx`, `UnlimCompileHelper.jsx` — keep (home-codekit sessione 24/05)
- `src/components/HomePage.jsx`, common/ElabIcons.jsx — keep
- `src/components/lavagna/LavagnaShell.module.css`, `VolumeViewer.jsx`, `ModalitaSwitch.module.css` — keep
- `src/components/simulator/NewElabSimulator.jsx` — keep (tab repalette + UNLIM forward)

### Anti-pattern signal (red flags):
- Vedi `bookGeometry` / `renderMode='clip_simplified'` / `Wire path waypoint mode='book'` riferito in nuovo codice → REGRESSIONE, indaga + revert
- Vedi nuovi file `book-geometry/*.json` → REGRESSIONE
- Vedi `demo-mode.js` re-introdotto → REGRESSIONE
- Vedi `experiments-vol*.js` diff massive da main senza ratify Andrea → REGRESSIONE

### Restoration emergency:
Se Andrea esplicitamente chiede ripristino → `git revert 530a35d8 ba82df0f` (i 2 commit revert) + cherry-pick selettivo demo-era commits.

## ESPERIMENTI VISIBILI UI — 8 su 94 (whitelist 25/05/2026)

Andrea verbatim "nascondi tutti quelli (con possibilità di farli tornare tutti) tranne i primi 3 volume 1 + pwm crea tuo colore, volume 2 i primi 2 sul condensatore volume tre lampeggiante e semaforo. ASSICURATI DI POTERE RESUSCITARE TUTTO. DOCUMENTA QUESTE COSE NEL MINIMO DETTAGLIO."

**Whitelist 8 esp** (source: `src/data/experiment-visibility.js`):
- Vol1: `v1-cap6-esp1`, `v1-cap6-esp2`, `v1-cap6-esp3`, `v1-cap9-esp6` (Lampada RGB 3 potenziometri)
- Vol2: `v2-cap7-esp1`, `v2-cap7-esp2` (condensatore)
- Vol3: `v3-cap6-esp4` (Due LED sirena pin 6+9), `v3-cap6-esp5` (semaforo)

**Filter applicato in**: `src/data/lesson-groups.js getLessonsForVolume()` + `src/components/lavagna/ExperimentPicker.jsx`. `findExperimentById()` NON filtrato (API calls always succeed).

**RESTORE**:
- 1 esp: append ID a `VISIBLE_EXP_IDS` in `src/data/experiment-visibility.js`
- Tutti: imposta `VISIBILITY_FILTER_DISABLED = true` nello stesso file
- Git: `git revert ba82df0f` annulla intera meccanica

**Doc completa**: [docs/HIDDEN-EXPERIMENTS-RESTORE.md](docs/HIDDEN-EXPERIMENTS-RESTORE.md)

**ZERO modifica** a `experiments-vol1/2/3.js` (dati integri, filter only UI).

**NON ricadere**: prossimi sessioni dev NON devono auto-aggiungere ID al `VISIBLE_EXP_IDS` senza esplicita richiesta Andrea. La selezione 8 esp è curata.

## Sprint history archive

Storia completa iter 3-82 (Sprint S/T/U close logs, ~3500 righe) archiviata in [docs/sprint-history-iter3-82-archive.md](docs/sprint-history-iter3-82-archive.md) — Fase 3 riconciliazione doc 2026-05-20. In CLAUDE.md restano solo: regole evergreen + Design Context + Narrative Arc.
