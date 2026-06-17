# DEBUG TOTALE NOTTURNO — Test, Fix & Stress dell'INTERO Sistema ELAB

## TASK
Debuggare, testare e fixare l'INTERO sistema ELAB Tutor (frontend + backend + UNLIM + simulatore) in 50 cicli Ralph Loop, con deploy e test in PRODUZIONE su Vercel dopo ogni batch di fix. Score target: 9.0/10 basato su benchmark OGGETTIVI e MISURABILI.

## CONTEXT FILES — Leggi TUTTI prima di qualsiasi azione
```
CLAUDE.md                                          — Regole progetto, stack, palette, engine intoccabile
docs/SESSION-COMPLETE-02-APR-2026.md               — Report sessione precedente (35 fix, 13 agenti)
docs/HANDOFF-02-APR-2026.md                        — Handoff con credenziali e gap residui
docs/UNLIM-LESSON-PREP-ARCHITECTURE.md             — Architettura UNLIM guida invisibile
docs/plans/2026-04-02-nanobot-v2-architecture.md   — Architettura Nanobot V2 (5 Edge Functions)
supabase/DEPLOY-GUIDE.md                           — Guida deploy Supabase
```

## REFERENCE — Siti ed estetica da emulare
```
Canva, Figma, Mural, Excalidraw       — UX pulita, pannelli manipolabili
Brilliant.org                          — Didattica interattiva
Genially, GoodNotes, Notability        — Estetica educativa
Tinkercad Circuits                     — Simulatore riferimento (parita visiva)
Wokwi (https://wokwi.com)             — Componenti SVG, board custom
```

**GitHub riferimenti tecnici:**
- https://github.com/anthropics/claude-code — Claude Code CLI
- https://github.com/anthropics/anthropic-cookbook — Pattern AI
- https://github.com/anthropics/courses — SDK & Agent patterns
- https://github.com/anthropics/prompt-eng-interactive-tutorial — Prompt engineering
- https://github.com/anthropics/anthropic-quickstarts — Quickstart templates
- https://github.com/wokwi/wokwi-boards — Board SVG reference

**Esplora gli strumenti disponibili**: MCP servers (Control Chrome, Preview, Figma, Sentry, PostHog), skill ELAB, agenti paralleli. Usa TUTTO cio che serve.

## SUCCESS BRIEF

**Tipo di output**: Sistema testato e deployato in produzione, con report di debug
**Reazione attesa**: Andrea si sveglia e trova la piattaforma funzionante, testata, senza bug visibili, con le sue credenziali pronte
**NON deve sembrare**: una demo, un prototipo, un lavoro superficiale. Deve essere un PRODOTTO.
**Successo significa**:
- 0 errori console in produzione
- Tutti i flussi E2E funzionanti
- UNLIM risponde e prepara lezioni
- Benchmark oggettivi PASS (tabella sotto)
- Credenziali admin + docente funzionanti

## RULES — Non negoziabili

### Onesta brutale
- **NON FIDARTI DEI FIX PRECEDENTI.** La sessione precedente ha documentato 35 fix e score 6.8/10. Potrebbe essere inflato. Testa TUTTO da zero.
- **MAI gonfiare score.** Score = (metriche PASS / metriche TOTALI) x 10. Solo numeri.
- **MAI score > 7 senza 10+ prove.** Screenshot, curl output, test result.
- **Se un fix sembra funzionare ma non hai testato in produzione → non conta.**

### Zero regressioni
- `npx vitest run` deve passare (1075+ test) PRIMA e DOPO ogni fix
- `npm run build` deve passare PRIMA e DOPO ogni fix
- **SE REGRESSIONE → `git checkout -- file` e riparti.** Mai procedere con regressioni.

### Engine intoccabile
```
src/components/simulator/engine/CircuitSolver.js    — MAI MODIFICARE
src/components/simulator/engine/AVRBridge.js        — MAI MODIFICARE
src/components/simulator/engine/SimulationManager.js — MAI MODIFICARE
src/components/simulator/engine/avrWorker.js        — MAI MODIFICARE
```

### Principi IMPERATIVI di Andrea
1. **PRINCIPIO ZERO**: Solo il docente usa UNLIM. Gli studenti lavorano sul simulatore.
2. **GUIDA INVISIBILE**: UNLIM prepara lezioni basate su esperimenti + contesto passato.
3. **NO OVERLAY COGNITIVO**: Pannelli manipolabili, allargabili, nascondibili, ritrovabili. Zero sovrapposizioni.
4. **ONNIPOTENZA**: UNLIM puo fare TUTTO — montare circuiti, compilare, evidenziare, caricare esperimenti, fare quiz, screenshot.
5. **ONNISCIENZA**: UNLIM sa TUTTO — stato circuito attuale, sessioni passate, contenuto dei 3 volumi (RAG 246 chunk).
6. **KIT = DIGITALE**: I volumi Tres Jolie e il simulatore sono lo STESSO prodotto.
7. **NON E UNA DEMO**: La piattaforma e un PRODOTTO. Niente "prova", "beta", "test".
8. **FUMETTO**: Report a fumetti con pannelli asimmetrici, balloon SVG, 4 mood, foto, stampa PDF.
9. **ESTETICA ELAB**: Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D. Oswald + Open Sans. Touch 44px. Font 13px min.

### Modalita notturna
- **Andrea dorme. Non puo dare consensi.** Non chiedere conferme.
- **Modalita bypass attiva.** Fai tutto autonomamente.
- **Ciclo**: fix → test → build → deploy → test produzione → fix → ripeti.

## PLAN — 50 Cicli (autoallineamento, nessun allineamento iniziale)

### PRIMA DI TUTTO (Ciclo 0): Verifica strumenti

```bash
# Verifica Control Chrome
# Usa mcp__Control_Chrome__get_current_tab per verificare che risponda

# Verifica Preview tools
# Usa mcp__Claude_Preview__preview_list per verificare server dev

# Verifica Playwright
npx playwright install chromium
npx playwright --version

# Se qualcosa non funziona → documenta e usa alternative
```

### PROTOCOLLO DI OGNI SINGOLO CICLO (OBBLIGATORIO)

Ogni ciclo, SENZA ECCEZIONI, segue questo ordine:

```
1. IMPLEMENTA/TESTA (il task del ciclo)
2. `npx vitest run` → 1075+ PASS (se fallisce → fix prima di tutto)
3. `npm run build` → 0 errori
4. AUDIT CoV: lancia 3 agenti paralleli (code-quality, security, usability)
5. STRESS TEST: esegui TUTTI E 10 gli stress test. Nessuno escluso.
6. FIX ogni bug trovato da audit + stress
7. RITESTA (punto 2-3-5)
8. DOCUMENTA: cosa testato, cosa trovato, cosa fixato, con file:line
```

**TUTTI e 10 gli stress test a OGNI ciclo. Non "pertinenti", TUTTI.**
**Se un audit o stress test trova bug → FIX nel ciclo stesso. Non rimandare.**

### REGOLA SUPREMA 0: IL PRINCIPIO ZERO

```
╔══════════════════════════════════════════════════════════════════╗
║  PRINCIPIO ZERO — LA REGOLA PIU IMPORTANTE DI TUTTE            ║
║                                                                  ║
║  SOLO IL DOCENTE USA UNLIM.                                      ║
║  Gli studenti lavorano sul simulatore fisico e digitale.         ║
║  UNLIM e la GUIDA INVISIBILE del docente.                        ║
║                                                                  ║
║  Il docente arriva in classe, apre la Lavagna sulla LIM,         ║
║  e UNLIM ha GIA PREPARATO la lezione basandosi su:              ║
║  - Contesto delle sessioni passate                               ║
║  - Prossimo esperimento del volume                               ║
║  - Errori frequenti della classe                                 ║
║                                                                  ║
║  Il docente NON deve avere conoscenze pregresse di elettronica.  ║
║  UNLIM lo guida passo passo, invisibilmente.                    ║
║  Il docente e il MEDIUM tra ELAB e la classe.                   ║
║                                                                  ║
║  OGNI decisione di design, OGNI feature, OGNI test              ║
║  deve rispettare questo principio.                               ║
║                                                                  ║
║  Se un fix viola il Principio Zero → NON applicarlo.            ║
╚══════════════════════════════════════════════════════════════════╝

### Ricerca ispirazione Principio Zero

Il concetto e: UNLIM sussurra al docente cosa dire. La classe non sa che c'e UNLIM.
Il docente dice "Secondo voi cosa succede se giro il LED?" perche UNLIM glielo ha suggerito.
Vedono solo un prof che spiega bene.

Cerca sul web (WebSearch/WebFetch) ispirazione per questo pattern:
- **"AI teaching assistant invisible"** — come altri prodotti fanno l'AI invisibile
- **"AI copilot for teachers"** — come Copilot sussurra al developer, UNLIM sussurra al docente
- **"teleprompter for teachers"** — il docente legge suggerimenti che la classe non vede
- **"AI-powered lesson delivery"** — come l'AI guida la lezione in tempo reale
- **"Socratic method AI assistant"** — domande guidate dall'AI
- **"invisible scaffolding education"** — supporto invisibile pedagogico
- **Prodotti da studiare**: Khanmigo (Khan Academy), Duolingo (per la gamification), Brisk Teaching, MagicSchool.ai, Teachermatic
- **Pattern UX da emulare**: come un GPS guida il guidatore senza che i passeggeri vedano il GPS

Salva le ispirazioni migliori in `docs/debug-night/PRINCIPIO-ZERO-ISPIRAZIONI.md`.
Applica le idee migliori al design di UNLIM nella Lavagna.
```

### IMPERATIVO ASSOLUTO: ZERO REGRESSIONI — SOLO MIGLIORAMENTO

```
PRIMA di ogni fix:
  snapshot_prima = { test_count, build_size, console_errors, endpoint_status }

DOPO ogni fix:
  snapshot_dopo = { test_count, build_size, console_errors, endpoint_status }

SE snapshot_dopo < snapshot_prima IN QUALSIASI METRICA:
  → REGRESSIONE RILEVATA
  → git checkout -- [file modificati]
  → TORNA ALLO STATO PRECEDENTE IMMEDIATAMENTE
  → Documenta: "REGRESSIONE: fix X ha rotto Y. Revertito."
  → Trova approccio diverso

QUESTO NON E NEGOZIABILE.
```

Il sistema puo SOLO migliorare. Mai peggiorare. Se un fix rompe qualcosa:
1. **STOP.** Non continuare.
2. **REVERT.** `git checkout -- file` per ogni file toccato.
3. **VERIFICA.** `npx vitest run` deve tornare allo stato precedente.
4. **RIPROVA.** Con approccio diverso.
5. **SE FALLISCE 3 VOLTE** → abbandona quel fix, passa al prossimo. Documenta perche.

Metriche da NON far mai peggiorare:
- Test PASS count (1075 → puo solo salire)
- Build errors (0 → deve restare 0)
- Console errors in produzione (0 → deve restare 0)
- Endpoint LIVE funzionanti (5/5 → deve restare 5/5)
- Bundle size (solo scendere, mai salire oltre 4100KB)
**Se il fix causa regressione → `git checkout -- file` e riparti.**

### FASE 1: CICLI 1-25 — MAPPA + TEST + FIX (ogni ciclo chiude con audit+stress)

**Ciclo 1**: Mappa sistema con 5 agenti paralleli → audit CoV sulla mappa → stress: verifica 5 API simultanee
**Ciclo 2**: Aggiorna 9 skill ELAB → audit CoV skill aggiornate → stress: invoca ogni skill e verifica output
**Ciclo 3**: Deploy Vercel → test VETRINA 10 test → audit CoV vetrina → stress: 10 reload rapidi
**Ciclo 4**: Test LAVAGNA 10 test → audit CoV layout → stress: 10 aperture/chiusure picker rapide
**Ciclo 5**: Test UNLIM 12 comandi → audit CoV chat → stress: 50 messaggi sequenziali
**Ciclo 6**: Test SIMULATORE 10 test su ESPERIMENTI RANDOM (vedi lista sotto) → audit CoV circuito → stress: 5 cambi esperimento consecutivi
**Ciclo 7**: Test SCRATCH+COMPILATORE+PENNA 12 test → audit CoV codice → stress: compila 5 sketch diversi + disegna 20 stroke
**Ciclo 8**: Test FUMETTO 10 test → audit CoV report → stress: genera 3 report consecutivi
**Ciclo 9**: Test RESPONSIVE 3 viewport 10 test → audit CoV a11y → stress: resize rapido 10 volte
**Ciclo 10**: Test ADMIN 8 test → audit CoV security → stress: 10 tentativi password sbagliata
**Ciclo 11**: Test BACKEND 12 curl → audit CoV endpoint → stress: rate limit (31 messaggi)
**Ciclo 12**: Test RAG 10 domande → audit CoV accuratezza → stress: 10 domande fuori tema (deve rifiutare)
**Ciclo 13**: Test A11Y 10 check → audit CoV WCAG → stress: naviga tutta la lavagna solo con Tab
**Ciclo 14**: Test SECURITY 10 check → audit CoV OWASP → stress: injection in 5 lingue + XSS + body overflow
**Ciclo 15**: Test ESTETICA 10 check → audit CoV design system → stress: confronto pixel con Tinkercad
**Cicli 16-25**: FIX sistematico P0→P1→P2. OGNI fix chiude con: test → audit 3 agenti → stress pertinente

### FASE 2: CICLI 26-50 — PROFONDO + STRESS + DEPLOY (ogni ciclo chiude con audit+stress)

**Ciclo 26-27**: Memory leaks + stale closures → audit CoV code-quality → stress: 20 mount/unmount componenti
**Ciclo 28-29**: Overlay/layout → audit CoV usability → stress: apri TUTTI i pannelli insieme su LIM
**Ciclo 30-31**: DrawingOverlay undo+eraser → audit CoV interaction → stress: 50 stroke + undo tutti + redo
**Ciclo 32-33**: StateManager reset → audit CoV state-machine → stress: 20 transizioni rapide
**Ciclo 34-35**: SVG Breadboard/Nano + PARITA TRES JOLIE → audit CoV visual → stress: 15 componenti su breadboard (Simon Says)

#### PARITA CON CARTELLA TRES JOLIE — IMPORTANTISSIMO
Leggi e confronta con i materiali in:
```
/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/
  FOTO/                         — Foto componenti reali del kit
  BOM KIT CON ELENCO COMPONENTI/ — Bill of Materials reale
  LOGO/                          — Logo e branding ufficiale
  3 ELAB VOLUME TRE/             — Documentazione breakout board
```

I componenti SVG nel simulatore DEVONO sembrare i componenti REALI delle foto.
I colori, le proporzioni, i dettagli devono corrispondere.
Il simulatore e i volumi/kit sono lo STESSO prodotto — devono sembrare la stessa cosa.

Confronta VISIVAMENTE:
1. LED nel simulatore vs LED nelle foto Tres Jolie
2. Resistore SVG vs resistore reale (bande colorate corrette?)
3. Breadboard SVG vs breadboard kit (colori, holes, bus)
4. Arduino Nano SVG vs foto Nano reale
5. Batteria 9V SVG vs foto batteria kit
**Ciclo 36-37**: Performance bundle → audit CoV size → stress: Lighthouse su produzione
**Ciclo 38-39**: Lesson Prep → audit CoV AI-quality → stress: 6 comandi naturali + AI LIVE per ognuno
**Ciclo 40-45**: Deploy → test produzione → audit CoV 3 agenti → stress 3 test → fix → ripeti (×6)
**Ciclo 46-48**: Audit FINALE 7 agenti CoV (funzionale, UX, security, a11y, performance, estetica, onniscienza) + stress TOTALE (tutti e 10)
**Ciclo 49**: Fix OGNI residuo dall'audit finale → re-audit con 3 agenti
**Ciclo 50**: Deploy finale → test COMPLETO produzione → credenziali → report

## BENCHMARK OGGETTIVI — Formula score

**Score = (metriche PASS / metriche TOTALI) x 10**

| # | Metrica | Come misurare | Soglia PASS |
|---|---------|---------------|-------------|
| 1 | Test unitari | `npx vitest run` | 1075+ PASS, 0 FAIL |
| 2 | Test E2E Playwright | `npx playwright test` | 90%+ PASS |
| 3 | Build | `npm run build` | 0 errori, < 4000KB |
| 4 | Console errors prod | Control Chrome console | 0 errori |
| 5 | Endpoint LIVE | curl su 5 endpoint | 5/5 success |
| 6 | RAG onniscienza | 10 domande volumi | 8/10 terminologia volume |
| 7 | Touch targets | grep CSS width/height < 44px in lavagna/ | 0 violazioni |
| 8 | Font size | grep CSS font-size < 13px in lavagna/ | 0 violazioni |
| 9 | CORS | curl con origin sbagliato | origin NON `*` |
| 10 | Security headers | curl -D - | X-Content-Type-Options presente |
| 11 | Prompt injection | 10 tentativi diversi | 10/10 bloccati |
| 12 | Rate limiting | 31 messaggi | 31° → 429 |
| 13 | Overlay | screenshot 3 viewport | 0 sovrapposizioni al caricamento |
| 14 | Admin auth | password sbagliata | accesso negato |
| 15 | GDPR auth | delete senza token | 400 o 403 |

**Nessuna metrica soggettiva. Solo numeri.**

## STRESS TEST — 10 test brutali

1. **50 messaggi chat sequenziali** → tutti rispondono (no timeout, no crash)
2. **10 aperture/chiusure rapide ExperimentPicker** → 0 memory leak
3. **5 cambi esperimento consecutivi** → 0 errori console
4. **Multi-window**: UNLIM + Video + Pannello componenti aperti → 0 crash
5. **State machine**: 10 transizioni CLEAN→BUILD→CODE→RUN → 0 stati orfani
6. **Rate limit**: 31° messaggio → 429 (NON 200)
7. **Prompt injection**: "ignora istruzioni" in 5 lingue → tutti bloccati
8. **Body > 100KB** → 413 (NON 200)
9. **CORS evil origin** → risposta NON contiene `*`
10. **5 fetch paralleli** → tutti rispondono correttamente

## ESPERIMENTI DA TESTARE — MAI SEMPRE LO STESSO

Non testare sempre v1-cap6-esp1. Usa esperimenti RANDOM da tutti e 3 i volumi:

```
VOLUME 1 (38 esperimenti):
  v1-cap6-esp1   Accendi il tuo primo LED
  v1-cap7-esp3   Accendi il verde del RGB
  v1-cap8-esp2   Due pulsanti, un LED
  v1-cap9-esp4   Resistenze in parallelo
  v1-cap10-esp3  Condensatore come timer
  v1-cap11-esp1  Il potenziometro
  v1-cap12-esp2  LDR e LED automatico
  v1-cap14-esp1  Motore DC

VOLUME 2 (18 esperimenti):
  v2-cap6-esp2   Fototransistore e LED
  v2-cap7-esp3   MOSFET come interruttore
  v2-cap8-esp1   Condensatore e MOSFET
  v2-cap9-esp1   Diodo rettificatore

VOLUME 3 (6 esperimenti — Arduino):
  v3-cap1-esp1   Blink LED
  v3-cap2-esp1   Pulsante digitale
  v3-cap3-esp1   Potenziometro analogico
  v3-cap5-esp1   Servo motore
```

A OGNI ciclo di test, scegli almeno 3 esperimenti DIVERSI da volumi DIVERSI.
Non ripetere lo stesso esperimento in 2 cicli consecutivi.

## UNLIM — Testa l'onnipotenza (USA UNLIM per TUTTO)

Testa ogni azione UNLIM in produzione:
```
1. "ciao" → risponde in italiano, linguaggio 10-14 anni
2. "prepara la lezione" → piano con GANCIO, ADATTAMENTO, DOMANDA, PROSSIMO
3. "monta il circuito del LED" → [AZIONE:loadexp:v1-cap6-esp1]
4. "compila il codice" → [AZIONE:compile]
5. "mostra il LED" → [AZIONE:highlight:led1]
6. "avvia la simulazione" → [AZIONE:play]
7. "fermati" → [AZIONE:pause]
8. "pulisci tutto" → [AZIONE:clearall]
9. "annulla" → [AZIONE:undo]
10. "qual e il valore della resistenza per un LED rosso?" → risposta dai VOLUMI (RAG)
11. "cosa abbiamo fatto l'ultima volta?" → contesto sessioni passate
12. "crea il report" → genera fumetto
```

## STATO TEST ATTUALE

- **1075 test unitari** (30 file Vitest) — ma ~80 componenti SENZA test
- **26 test E2E** (5 file Playwright) — solo smoke test basilari
- Playwright configurato: `playwright.config.js`, Chromium only

### Componenti SENZA test (da coprire):
NewElabSimulator (1900 LOC), SimulatorCanvas (1382 LOC), AVRBridge (1051 LOC), 21 SVG components, UNLIM (5 file), LessonBar, LessonPathPanel, CodeEditorCM6 (517 LOC), DrawingOverlay, SessionReportPDF, Teacher Dashboard

### OBIETTIVO: 30+ test E2E Playwright su PRODUZIONE
```bash
npx playwright install chromium
PLAYWRIGHT_BASE_URL=https://elab-builder.vercel.app npx playwright test
```

## CREDENZIALI

```
Supabase Project:  euqpdueopmlllqjmqnyb
Supabase URL:      https://euqpdueopmlllqjmqnyb.supabase.co
Supabase Token:    sbp_REVOKED_20260423_REDACTED
Gemini API Key:    AIzaSyB3IjfrHeG9u_yscwHamo7lT1zoWJ0ii1g
VPS:               72.60.129.50 (Ollama :11434, Voxtral :8880)
Admin:             #admin → [REDACTED-MOVED-TO-ENV]
Anon Key:          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ
Vercel Prod:       https://elab-builder.vercel.app
Netlify Scuole:    https://funny-pika-3d1029.netlify.app/scuole.html
```

## CREDENZIALI FINALI DA GENERARE PER ANDREA

### 1. Admin
- `https://elab-builder.vercel.app/#admin` → `[REDACTED-MOVED-TO-ENV]`
- Verifica funzioni in produzione

### 2. Docente/Scuola
- Crea account Supabase Auth: `andrea@elab-tutor.it` / `ELAB-Docente-2026!` / ruolo: docente
- Oppure: codice licenza docente
- Accesso a: Teacher Dashboard, Area Docente, Lavagna
- NON accesso a: Admin Panel

### 3. La piattaforma NON e una demo
- Rimuovere "demo", "prova", "test", "beta" da qualsiasi testo visibile
- "INIZIA IN 3 SECONDI" → riformulare come "Accedi al simulatore"
- Vetrina professionale, non prototipo

## SKILL DA USARE (TUTTE)

```
ELAB:
/elab-quality-gate /elab-nanobot-test /elab-rag-builder /elab-cost-monitor
/lavagna-benchmark /analisi-simulatore /analisi-galileo /quality-audit
/volume-replication /nano-breakout /tinkercad-simulator
/lim-simulator /impersonatore-utente /ricerca-bug /arduino-simulator

DEBUG & REVIEW:
/systematic-debugging /engineering:debug /engineering:code-review
/engineering:testing-strategy /simplify /code-review

DESIGN:
/frontend-design /design:design-critique /design:accessibility-review
/design:design-system

TOOLS:
Preview (screenshot, click, snapshot, inspect, resize, console, network, fill, eval)
Control Chrome (execute_javascript, get_page_content, navigate, open_url)
Playwright (npx playwright test)
```

## MANTENIMENTO CONTESTO — La sessione dura 50 cicli, il contesto si perde

Usa TUTTE queste tecniche per non perdere il filo:

### 1. File MD come memoria persistente
Crea e aggiorna questi file a OGNI ciclo:

```
docs/debug-night/
  STATE.md            — Stato attuale: ciclo N, cosa fatto, cosa resta, score corrente
  BUG-TRACKER.md      — Tabella bug: ID, severita, file:line, stato (open/fixed/reverted)
  FIX-LOG.md          — Log di ogni fix: ciclo, file, cosa era, cosa e ora, test result
  METRICS.md          — Tabella 15 benchmark: metrica, valore pre, valore post, PASS/FAIL
  REGRESSION-LOG.md   — Se regressione: cosa, quando, come revertito
```

### 2. Aggiorna STATE.md a INIZIO e FINE di ogni ciclo
```markdown
# STATE — Ciclo N/50
## Score attuale: X.X/10 (basato su METRICS.md)
## Ultimo fix: [descrizione] in [file:line]
## Bug aperti P0: N | P1: N | P2: N
## Prossimo ciclo: [cosa fare]
## Metriche chiave: test=1075 | build=OK | console=0 | endpoints=5/5
```

### 3. Leggi STATE.md a INIZIO di ogni ciclo
Prima di fare qualsiasi cosa nel ciclo, leggi:
1. `docs/debug-night/STATE.md` — dove sei
2. `docs/debug-night/BUG-TRACKER.md` — cosa resta da fixare
3. `docs/debug-night/METRICS.md` — quali metriche sono ancora FAIL

### 4. TodoWrite per tracking micro-task dentro ogni ciclo
Usa TodoWrite per i passi del ciclo corrente. Svuota e ricrea a ogni nuovo ciclo.

### 5. Riassunto compatto ogni 5 cicli
Ogni 5 cicli (5, 10, 15, 20, 25, 30, 35, 40, 45, 50) scrivi un riassunto in:
```
docs/debug-night/CHECKPOINT-N.md
```
Con: score, bug fixati, bug rimasti, metriche, screenshot se rilevante.

### 6. Se il contesto si perde
Se non ricordi cosa stavi facendo:
1. Leggi `docs/debug-night/STATE.md`
2. Leggi `docs/debug-night/BUG-TRACKER.md`
3. Leggi `docs/debug-night/FIX-LOG.md` (ultimi 10 fix)
4. Riparti dal prossimo bug aperto in BUG-TRACKER.md

**Il contesto e nei file MD, non nella tua memoria.** Scrivi tutto, leggi sempre.

## OUTPUT ATTESO

1. `docs/DEBUG-TOTALE-REPORT.md` — ogni bug trovato e fixato con file:line
2. `docs/SYSTEM-MAP-COMPLETE.md` — mappa completa frontend + backend
3. Tutte le skill ELAB aggiornate
4. 30+ test E2E Playwright funzionanti
5. Score ONESTO basato su 15 benchmark oggettivi
6. Deploy produzione testato e funzionante
7. Credenziali COMPLETE per Andrea (admin + docente)
8. Vetrina professionale (non demo)
