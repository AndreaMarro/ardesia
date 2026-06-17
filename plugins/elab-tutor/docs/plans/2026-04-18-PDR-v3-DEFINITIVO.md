# PDR v3 DEFINITIVO — ELAB Tutor
## 18 Aprile 2026 — Verso il prodotto commerciale

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Portare ELAB Tutor a 9.5+/10 con UNLIM onnisciente e onnipotente, parallelismo volumi ↔ simulatore al 100%, bug lavagna e toolbar risolti, Principio Zero perfetto, test E2E reali con Control Chrome.

**Architecture:** Ralph Loop agile lungo (20+ iterazioni) con CoV ogni 3 cicli. Worker paralleli ORARI che scrivono in `automa/state/*.json`. Test non triviali via Playwright MCP / Control Chrome su scenari utente reali. Commit frequenti, zero regressioni.

**Tech Stack:** React 19 + Vite 7 + Vitest 3 + Playwright + Supabase (VIVO) + Gemini 2.5 + Edge TTS VPS + Kokoro 82M

---

## BASELINE VERIFICATO (17/04/2026 ore 06:35 UTC)

| Metrica | Valore | Verifica |
|---------|--------|----------|
| Test | **11983 PASS** | `npx vitest run` (190 file, 0 fail) |
| Build | **PASS** 4821 KiB | `npm run build` |
| Sito | elabtutor.school **200** | curl |
| Git HEAD | `c6b04a0` | `git rev-parse --short HEAD` |
| Esperimenti | 92 (38+27+27) | `experiments-vol*.js` |
| `bookText` | 92/92 | `grep bookText:` |
| `bookDivergence` | **0** (rimosso) | `grep -c` |
| Supabase | VIVO 25 tab, 190 sessioni | CLI verificato |
| Compiler n8n | POST /compile 200 | curl verificato |
| Edge TTS VPS | /tts 200 | curl verificato |
| Score onesto | **8.5/10** | Self-eval con CoV |

---

## PRINCIPIO ZERO — Versione definitiva 17/04

> **CHIUNQUE accendendo ELAB Tutor deve essere in grado, SENZA conoscenze pregresse, di spiegare ai ragazzi.**

Come funziona:
1. Il docente apre ELAB, sceglie la lezione
2. UNLIM prepara il contenuto in modo quasi invisibile — linguaggio 10-14 anni, basato su volumi + storia sessioni
3. Il contenuto è utile a TUTTA la classe — il docente lo proietta sulla LIM
4. I ragazzi vedono sulla LIM, lavorano sui KIT FISICI (non il simulatore)
5. Il docente non deve studiare, non deve interpretare — UNLIM ha già fatto il lavoro
6. UNLIM NON si rivolge al docente con "fai questo". Produce contenuto nel linguaggio dei ragazzi che il docente veicola naturalmente.
7. **Il docente guarda con la coda dell'occhio.** Capisce al volo cosa fare guardando lo schermo. Se totalmente impreparato → UNLIM diventa PIÙ PROATTIVO: suggerisce il prossimo passo, prepara la domanda da fare alla classe, indica cosa guardare, o proprio UNLIM pone la domanda direttamente.

**Differenziatore unico:** Nessun competitor prepara lezioni personalizzate basate su sessioni precedenti + contenuto specifico dei volumi.

---

## PRIORITÀ ORDINATE

### P0 — PARALLELISMO VOLUMI REALE (allineamento simulatore ↔ libro)

**Problema:** `bookText` ora descrive IL LIBRO VERO (fix sessione 17/04), ma 3 esperimenti Vol3 del simulatore fanno circuiti diversi:
- `v3-cap6-esp1`: simulatore → AND/OR logic con 2 pulsanti + LED. Libro → Primo LED esterno con digitalWrite(13) + resistenza 470Ω
- `v3-cap7-esp1`: simulatore → potenziometro + analogRead. Libro → pulsante + digitalRead + if/else
- `v3-cap7-esp5`: simulatore → PWM con analogWrite. Libro → analogRead + Serial Monitor

**Azione:** Riscrivere questi 3 esperimenti in `experiments-vol3.js` per allinearsi al libro. Richiede:
- Modifica `components[]`, `connections[]`, `pinAssignments{}`, `buildSteps[]`, `desc`, `unlimPrompt`
- Aggiornare lesson-paths JSON corrispondenti
- CircuitSolver test potrebbero richiedere update (verifica pre/post)

**Inoltre:** tutti gli altri 15 esperimenti con similarity <0.8 in `volume-parity-audit-v2.json` vanno rivisti sistematicamente.

### P0 — UNLIM ONNISCIENTE E ONNIPOTENTE (la versione vera)

**Cosa significa:**
- **Onnisciente** = sa TUTTO: contesto circuito, codice, storia sessioni, volume book text, capitolo evolutivo, errori passati, domande frequenti, ciclo Passo Passo, stato LED/pin/componenti, tempo trascorso, difficoltà osservate
- **Onnipotente** = può AGIRE su tutto: caricare esperimenti, modificare circuito, compilare codice, cambiare modalità, mostrare volumi, pronunciare domande alla classe, nudge proattivi, generare quiz, adattare percorso

**Stato attuale (verificato):**
- Context collector ricco (circuitState, buildStep, errors, pin states) ✓
- Volume-references injection nel prompt ✓
- Evolutivo prevExp bookText nel prompt ✓
- shouldNudge + useUnlimNudge cablabile ma NON integrato
- 37 comandi `[AZIONE:...]` parser ma non tutti testati E2E
- Vision trigger regex implementato MAI verificato live
- Voice E2E MAI verificato live

**Azione sessione:**
1. Integrare `useUnlimNudge` in `EmbeddedGuide` (GalileoAdapter.jsx)
2. Test E2E ogni comando AZIONE via Playwright MCP (non mock)
3. Test Vision live: apri simulatore, popola circuito, digita "guarda il mio circuito" → verifica risposta Gemini con screenshot reale
4. Test Voice E2E: STT → UNLIM → TTS → azione circuito (scenari reali)
5. UNLIM deve citare libro in OGNI risposta quando `experimentId` presente (attualmente a2-unlim diceva `citesBook: 0`)

### P1 — BUG LAVAGNA

1. **Scritte non persistono all'uscita** — quando il docente disegna/annota e preme "Esci", i disegni svaniscono. Dovrebbero essere salvati in `localStorage` per experimentId. Possibile location: `src/components/simulator/canvas/DrawingOverlay.jsx` o `panels/WhiteboardOverlay.jsx`.
2. **Trascinamento toolbar (puntore/cestino)** — la barra strumenti flottante non si trascina correttamente. Verificare `FloatingToolbar.jsx`, eventi pointer, constraints.

### P1 — TEST PLAYGROUND + CONTROL CHROME

**Obiettivo:** Test utente reali, non triviali, tramite browser vero.

Scenari target:
1. **Docente impreparato apre ELAB** — naviga homepage → sceglie classe → carica v1-cap6-esp1 → UNLIM prepara lezione → docente legge sulla LIM
2. **Studente preme "non funziona"** — LED spento → UNLIM chiede cosa osservare → suggerisce diagnostica → alza resistenza
3. **Docente trascina toolbar** — verifica no bugs visuali + persistenza
4. **Docente usa lavagna** — disegna schema, esce, rientra → disegno c'è
5. **UNLIM vision** — "guarda il circuito" → Gemini risponde accurato
6. **UNLIM voice** — "Ehi UNLIM, cos'è il resistore?" → risposta TTS

### P2 — KOKORO TTS PRODUZIONE

- Deploy Kokoro 82M su VPS oppure Vast.ai (doc strategia: `docs/strategia/2026-04-17-stack-tts-llm-slm.md`)
- Proxy CORS Vercel → Edge TTS VPS (rotte `/api/tts`)
- Fallback chain: Kokoro → Edge → Browser

### P2 — DASHBOARD DOCENTE CON DATI REALI

Supabase VIVO con 190 sessioni + 25 tabelle. Sfruttare:
- `student_sessions` → grafico progresso classe
- `student_progress` → stato per esperimento
- `nudges` → elenco interventi UNLIM
- `confusion_reports` + `mood_reports` → sentiment analisi
- `daily_metrics` → dashboard KPI

---

## CHECKLIST TASK (bite-sized, TDD)

### TASK 1: Fix Lavagna persistenza disegni

**Files:**
- Modify: `src/components/simulator/canvas/DrawingOverlay.jsx` (o `WhiteboardOverlay.jsx` — verifica quale)
- Test: `tests/unit/lavagnaPersistence.test.js` (CREATE)

**Step 1:** Scrivere test RED
```js
it('drawing persists after exit and re-enter', () => {
  // save drawing to localStorage with key 'elab-drawing-{expId}'
  // exit (unmount)
  // re-mount component with same expId
  // expect: previous drawing loaded
});
```

**Step 2:** Run test → FAIL (no persistence yet)

**Step 3:** Implementation: `useEffect` that saves `canvas.toDataURL()` to `localStorage.setItem('elab-drawing-' + expId, dataUrl)` on unmount/save; load on mount.

**Step 4:** Run test → PASS

**Step 5:** Manual verify via Playwright MCP: draw → exit → re-enter → visible

**Step 6:** Commit: `fix(lavagna): persist drawings across session (P1)`

### TASK 2: Fix Toolbar trascinamento

**Files:**
- Modify: `src/components/lavagna/FloatingToolbar.jsx` (verificare)
- Test: `tests/unit/floatingToolbarDrag.test.js` (CREATE)

**Step 1:** Reproduce bug (scopri cosa rompe: offset errato? clamp viewport? pointer events?)

**Step 2:** Scrivi test che verifica: drag da (100,100) a (500,500) → posizione finale (500,500) (non (400,400))

**Step 3:** Fix: probabile `pointerdown.clientX - rect.left` per offset iniziale, poi `clientX - offset` in move

**Step 4:** Test passa → commit

### TASK 3: Riscrivere v3-cap6-esp1 per allinearsi al libro

**Files:**
- Modify: `src/data/experiments-vol3.js` (v3-cap6-esp1)
- Modify: `src/data/lesson-paths/v3-cap6-esp1.json`
- Test: esistenti non devono rompere + aggiungere `tests/unit/v3Cap6Esp1ParityLibro.test.js`

**Libro dice (v3 p.56):** Arduino Nano + 1 LED + resistenza 470Ω. pinMode(13, OUTPUT). digitalWrite(13, HIGH/LOW) + delay(500).

**Step 1:** Componenti correnti (AND/OR pulsanti) documentati in git

**Step 2:** Riscrivere components: `[breadboard-half, nano-r4, led(red), resistor(470)]`

**Step 3:** Connections: D13 → anodo LED; catodo LED → resistenza → GND

**Step 4:** pinAssignments aggiornati

**Step 5:** unlimPrompt aggiornato con linguaggio 10-14 anni + citazione libro

**Step 6:** Test: `npx vitest run` → tutti pass, no regressioni CircuitSolver

**Step 7:** Commit: `feat(vol3): align v3-cap6-esp1 simulator to book (LED esterno + digitalWrite(13))`

### TASK 4: Riscrivere v3-cap7-esp1 per libro (pulsante + digitalRead)

Come Task 3 ma con pulsante + LED + INPUT_PULLUP.

### TASK 5: Riscrivere v3-cap7-esp5 per libro (analogRead + Serial)

Come Task 3 ma con potenziometro + Serial.begin(9600) + Serial.println.

### TASK 6: Integrare `useUnlimNudge` in EmbeddedGuide

**Files:**
- Modify: `src/components/lavagna/GalileoAdapter.jsx` (funzione `EmbeddedGuide`)
- Test: esistenti + `tests/unit/embeddedGuideNudge.test.jsx`

**Step 1:** In `EmbeddedGuide`, importare `useUnlimNudge`

**Step 2:** Chiamare hook con `{currentExperimentId, currentStepIndex, totalSteps, enabled: true}`

**Step 3:** Quando `nudge === true`, mostrare overlay/toast proattivo con `message` + bottone "Ok" → `dismiss()`

**Step 4:** Test: unmount→remount con step fisso per 31+ secondi simulato → `nudge` diventa `true`

**Step 5:** Playwright MCP: apri simulatore → rimani su step 1 per 40s → verifica overlay compare

**Step 6:** Commit: `feat(lavagna): integrate useUnlimNudge for proactive UNLIM (Principio Zero)`

### TASK 7: UNLIM cita libro in OGNI risposta con experimentId

**Files:**
- Modify: `src/services/api.js` (funzione `sendChat`)
- Test: `tests/unit/unlimCitesBook.test.js` (CREATE)

**Problema:** a2-unlim.json diceva `citesBook: 0` su 20 domande.

**Step 1:** Verificare system prompt istruisce a citare libro (dovrebbe già)

**Step 2:** Implementare post-processing: se risposta NON contiene "pagina" o "vol" e `experimentId` presente, aggiungere in coda "(Riferimento: Vol. X, pag. Y del libro)"

**Step 3:** Test: 10 query simulate con `experimentId='v1-cap6-esp1'` → almeno 8/10 contengono "pagina" o "Vol"

**Step 4:** Commit

### TASK 8: Test Vision E2E con Playwright

**Files:**
- Create: `tests/e2e/unlimVisionLive.spec.js`

**Step 1:** Setup Playwright test: apri `/tutor#tutor?exp=v1-cap6-esp1`, bypass consent

**Step 2:** Apri chat UNLIM, digita "guarda il mio circuito"

**Step 3:** Mock Gemini Vision response OR test reale con API key valida

**Step 4:** Verifica screenshot catturato (base64 non vuoto) + risposta UNLIM >20 parole

**Step 5:** Commit

### TASK 9: Test Voice E2E (STT + TTS)

**Files:**
- Create: `tests/e2e/unlimVoiceLive.spec.js`

**Step 1:** Verificare browser permessi mic in Playwright (`context.grantPermissions(['microphone'])`)

**Step 2:** Simulare comando vocale tramite `speechSynthesis` + `SpeechRecognition` mock

**Step 3:** Flow: docente dice "Ehi UNLIM, carica il primo esperimento" → UNLIM esegue `[AZIONE:loadexp:v1-cap6-esp1]`

**Step 4:** Verifica esperimento caricato + TTS ha parlato (via evento)

**Step 5:** Commit

### TASK 10: Proxy CORS Edge TTS

**Files:**
- Create: `api/tts.js` (Vercel serverless function)

**Step 1:** Stub function che proxy: prende `text`, chiama `http://72.60.129.50:8880/tts`, restituisce audio

**Step 2:** Modificare `src/services/voiceService.js` synthesizeSpeech → usa `/api/tts` invece di IP diretto

**Step 3:** Test curl produzione

**Step 4:** Commit: `feat(tts): Vercel proxy route for Edge TTS VPS (CORS fix)`

### TASK 11: Dashboard docente con dati Supabase reali

**Files:**
- Modify: `src/components/teacher/TeacherDashboard.jsx`

**Step 1:** Query Supabase `student_sessions` last 30 giorni

**Step 2:** Grafico progresso classe (recharts già presente)

**Step 3:** Lista esperimenti piu difficili (errori frequenti)

**Step 4:** Export CSV con dati reali

**Step 5:** Test E2E

### TASK 11a: Valutazione OpenClaw seria (Andrea priorità esplicita)

**Files:**
- Create: `docs/strategia/2026-04-18-openclaw-valutazione.md`

**Step 1:** WebSearch "OpenClaw Claude Code Telegram integration 2026" — doc ufficiali, features, pricing/limiti

**Step 2:** WebSearch "OpenClaw alternatives: n8n Claude, Make.com, Zapier + Claude webhook"

**Step 3:** Valutare 3 use case ELAB concreti:
- A) **Operativo dev**: Ralph Loop notturno manda update/alert ad Andrea via Telegram, Andrea approva deploy
- B) **Classe**: docente riceve su Telegram il "report fine lezione" di UNLIM (auto-generato)
- C) **Fagherazzi/commerciale**: alert via Telegram quando sessioni classe fallite, KPI settimanali

**Step 4:** Per ogni use case:
- Fattibilità tecnica (API/webhook disponibili?)
- Costo mensile
- Alternative (email, Slack, Discord, push PWA)
- Raccomandazione: SÌ/NO con motivazione

**Step 5:** Setup proof-of-concept A (Ralph alert Telegram) se fattibile in <2h

**Step 6:** Scrivi doc finale con decisione motivata. Se NO → documenta perché (onesto)

**Step 7:** Commit

### TASK 11b: Ricerca web (OBBLIGATORIO — WebSearch MCP)

**Files:**
- Create: `docs/strategia/2026-04-18-ricerca-web-validata.md`

**Step 1:** Cerca `Kokoro TTS 82M benchmark italian 2026` — valida numeri doc strategia

**Step 2:** Cerca `Porcupine wake word pricing custom keyword 2026` — verifica free tier limits

**Step 3:** Cerca `Gemini 2.5 Flash pricing tokens 2026 April` — aggiorna costi scala

**Step 4:** Cerca `ElevenLabs Flash v2 latency benchmark` + `XTTS v3 italian quality`

**Step 5:** Cerca `Silero VAD WASM browser integration barge-in TTS`

**Step 6:** Cerca `Wokwi Tinkercad competitor 2026 STEM AI tutor` — aggiorna competitor analysis

**Step 7:** Sintetizzare in `docs/strategia/2026-04-18-ricerca-web-validata.md` con link fonti, numeri aggiornati, decisione finale stack TTS/LLM

**Step 8:** Aggiornare `docs/strategia/2026-04-17-stack-tts-llm-slm.md` con nuovi benchmark

**Step 9:** Commit

### TASK 12: Debug sistematico finale + handoff

**Step 1:** Rilanciare tutte le routine manualmente (no auto-schedule)

**Step 2:** Rileggere tutti i findings post-sessione

**Step 3:** Aggiornare `commercial-readiness.json` con score finale

**Step 4:** Creare `docs/plans/2026-04-19-next-session-plan.md` handoff

---

## REGOLE FERREE (CoV e Audit)

1. `npx vitest run` PRIMA e DOPO ogni modifica — ZERO regressioni
2. `npm run build` dopo ogni task
3. Commit con "Test: NNNN/NNNN PASS" nel messaggio
4. CoV audit ogni 3 task completati
5. MAI inflazionare score — chain of verification SEMPRE
6. Ogni test deve verificare COMPORTAMENTO REALE (non strutturale)
7. Playwright MCP / Control Chrome obbligatorio per UI E2E
8. Se qualcosa rompe il baseline: `git stash && npx vitest run` per isolare causa
9. Commit frequenti (ogni task = 1-3 commit)
10. Documentazione in tempo reale in `session-summary-YYYY-MM-DD.md`

---

## DELIVERABLE ATTESI

- 11983 test → **14000+** (target) ma tutti comportamentali non banali
- 3 esperimenti Vol3 allineati al libro
- Lavagna + toolbar bug risolti
- useUnlimNudge integrato
- Vision E2E verificato live
- Voice E2E verificato live
- CORS TTS risolto
- Dashboard docente con dati reali
- Score: **9.5/10** onesto (CoV indipendente)
- Commercial readiness: **27/30** (era 20.5/30)

---

## DOCUMENTI DI RIFERIMENTO

**Leggere PRIMA di iniziare:**
- `docs/plans/2026-04-17-session-summary.md` — handoff sessione precedente
- `docs/plans/2026-04-15-PDR-v2-ULTRA.md` — PDR precedente (per continuità)
- `docs/strategia/2026-04-17-stack-tts-llm-slm.md` — schema decisionale AI stack
- `CLAUDE.md` — contesto codice, regole ferree, anti-regressione
- `automa/state/commercial-readiness.json` — audit 30 criteri
- `automa/state/volume-parity-audit-v2.json` — 15 esperimenti auditati con similarity
- `automa/state/a2-unlim.json` — qualità risposte UNLIM
- `automa/state/t1-utenti.json` — simulazione utenti
- `VOLUME 3/CONTENUTI/volumi-pdf/` — 3 PDF libri ELAB fonte verità
- `/tmp/vol1.txt`, `/tmp/vol2.txt`, `/tmp/vol3.txt` — testo estratto

**Skills obbligatorie:**
- `superpowers:executing-plans` per implementazione task
- `superpowers:systematic-debugging` per bug
- `superpowers:test-driven-development` per nuove feature
- `superpowers:verification-before-completion` prima di claim
- `ralph-loop:ralph-loop` per sessione lunga
- `elab-quality-gate` per gate qualità

**MCP OBBLIGATORI (non opzionali):**
- **Playwright MCP** — test E2E browser reale (`mcp__plugin_playwright_playwright__*`)
- **Control Chrome / Claude-in-Chrome** — DOM-aware navigation in produzione (`mcp__Claude_in_Chrome__*` o `mcp__Control_Chrome__*`)
- **WebSearch / WebFetch** — ricerca web live per:
  - Benchmark TTS 2026 (Kokoro vs ElevenLabs vs XTTS) — verificare numeri del doc strategia
  - Porcupine wake word setup corrente (API/pricing 2026)
  - Gemini 2.5 pricing updates
  - Competitor analysis corrente (Tinkercad, Wokwi, CampuStore)
  - Best practices TTS italiano educativo 2026

**MCP utili:**
- Claude Preview (dev server)
- Supabase CLI (token `sbp_REVOKED_20260423_REDACTED`)

**Istruzione alla nuova sessione:** se questi MCP non sono connessi all'avvio, FERMATI e chiedi ad Andrea di connetterli prima di procedere con i task UI/E2E/ricerca. Procedere senza di loro = compromesso inaccettabile.

---

## CREDENZIALI / ENDPOINTS VERIFICATI

| Servizio | URL/Token | Status |
|----------|-----------|--------|
| Supabase Management | `sbp_REVOKED_20260423_REDACTED` | VALID 17/04 |
| Supabase ghost-tutor | `vxvqalmxqtezvgiboxyv` | VIVO 25 tab |
| Supabase elab-unlim | `euqpdueopmlllqjmqnyb` | Edge funcs |
| Compiler n8n | `https://n8n.srv1022317.hstgr.cloud/compile` POST | 200 |
| Edge TTS VPS | `http://72.60.129.50:8880/tts` | 200 |
| Brain VPS | `http://72.60.129.50:11434` | OK (Qwen 3.5 2B) |
| Render Nanobot | `https://elab-galileo.onrender.com` | cold start 15s |
| Site | `https://www.elabtutor.school` | 200 |

---

*PDR generato 17/04/2026. Ralph Loop 20+ iter, agile, Control Chrome massivo, zero compromessi.*
