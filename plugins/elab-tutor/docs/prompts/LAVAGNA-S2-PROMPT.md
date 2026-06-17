# SESSIONE LAVAGNA 2/8 — Galileo in FloatingWindow + RetractablePanel Live

## PRINCIPIO ZERO
**L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.**
Galileo e un assistente INVISIBILE — non una video lezione. Il docente non deve capire l'interfaccia, deve insegnare. La Lavagna e lo strumento, non il soggetto.

Questo significa:
- Zero configurazione. Zero tutorial. Zero click prima di iniziare.
- Il simulatore e GIA visibile appena apri la Lavagna.
- Galileo e li se serve, nascosto se non serve.
- I pannelli si aprono quando servono, non prima.
- L'esperienza deve essere "apro, insegno" — come una lavagna vera.

## SPECIFICHE GENERALI (da rispettare SEMPRE)
- **Target**: bambini 8-12 anni, docenti non tecnici, LIM scolastiche
- **Dispositivi**: LIM (1024x768 min), iPad (1024x768 / 1366x1024), Chromebook (1366x768), PC
- **Touch target**: minimo 48px su TUTTO
- **Font minimo**: 14px (proiettori LIM = colori lavati, bassa risoluzione)
- **Contrasto**: WCAG AA su TUTTO (proiettore peggiora il contrasto)
- **Palette**: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373, BG #F0F4F8
- **Font**: Oswald (titoli/brand), Open Sans (body), Fira Code (codice)
- **Icone**: ElabIcons.jsx SVG (Feather-style). ZERO emoji.
- **Animazioni**: 300ms cubic-bezier(0.4, 0, 0.2, 1) — Material motion
- **Offline**: tutto deve funzionare senza rete (HEX precache, SW, fallback localStorage)
- **A11y**: aria-label su ogni bottone, focus visible, skip-to-content, role="dialog" su modal
- **Budget**: €50/mese. No servizi costosi. Supabase free, Render free, Vercel free.
- **62 esperimenti** (38 Vol1 + 18 Vol2 + 6 Vol3) — tutti devono funzionare
- **Build**: `npm run build` deve passare SEMPRE. 33 precache, ~5000KB.
- **Test**: 1001+ test devono passare SEMPRE. Zero regressioni.

---

## AUTOCRITICA SEVERA DALLA S1

Score S1 auto-assegnato: 9.2/10. **ONESTAMENTE: 6.5/10.** Ecco perche:

### Cosa manca DAVVERO dopo S1
1. **FloatingWindow non e montata da nessuna parte** — il componente esiste ma nessuno lo usa nella shell. Score D1/D2 sono N/A, non 10.
2. **RetractablePanel non e montato** — stessa storia. Componente morto.
3. **FloatingToolbar non e connessa al simulatore** — i bottoni fanno setState ma non controllano niente. E decorazione.
4. **AppHeader non e connessa a niente** — il picker non apre nulla, il play non avvia nulla, il menu non fa nulla.
5. **Il simulatore e montato "nudo"** — senza props, senza UNLIM, senza esperimento. E un simulatore vuoto con il welcome screen.
6. **La Lavagna oggi e**: header glassmorphism + simulatore vuoto + toolbar decorativa. NON e una lavagna.

### Cosa e andato bene
- Architettura pulita, file separati, CSS modules
- Zero regressioni (l'unica cosa che conta)
- Componenti base pronti e testati

### Lezione
NON auto-assegnare score > 7 se i componenti non sono MONTATI e FUNZIONANTI nel browser. Un componente non montato vale 0.

---

## Stato Ereditato (ONESTO)
Score sessione precedente: **6.5/10** (componenti creati ma non integrati)
Bug P0 aperti: nessuno
File creati in src/components/lavagna/:
- AppHeader.jsx + .module.css (glassmorphism 48px, NON connessa)
- FloatingWindow.jsx + .module.css (drag/resize/z-index, NON montata)
- FloatingToolbar.jsx + .module.css (7 icone, NON connessa al simulatore)
- RetractablePanel.jsx + .module.css (3 dir, NON montato)
- LavagnaShell.jsx + .module.css (grid, monta solo simulatore vuoto + toolbar)
Test: 1008/1008 PASS (+7 FloatingWindow test)
Build: 33 precache, 4070KB

---

## PRIMA DI TUTTO
Leggi COMPLETAMENTE questi file PRIMA di qualsiasi azione:
1. `CLAUDE.md`
2. `docs/plans/2026-04-01-lavagna-redesign.md` — il design document completo
3. `docs/plans/2026-04-01-lavagna-master-plan.md` — il piano master con benchmark
4. `src/components/lavagna/LavagnaShell.jsx` — lo stato attuale della shell
5. `src/components/lavagna/FloatingWindow.jsx` — il componente da usare
6. `src/components/lavagna/RetractablePanel.jsx` — il componente da usare
7. `src/components/tutor/ChatOverlay.jsx` — il componente da wrappare (LEGGERE TUTTE LE PROPS)
8. `src/components/tutor/ElabTutorV4.jsx` righe 2580-2610 — come ChatOverlay e montato oggi
9. `npm run build && npx vitest run` — DEVE passare
10. `/elab-quality-gate pre`
11. Screenshot BASELINE di #tutor (salvare — ogni audit confrontera)
12. Screenshot BASELINE di #lavagna (salvare — vedere stato attuale)

---

## REGOLE ESECUZIONE
```
PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
```

### Vincoli assoluti
- PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
- FONT: Oswald (display), Open Sans (body), Fira Code (mono)
- ENGINE INTOCCABILE: CircuitSolver.js, AVRBridge.js, SimulationManager.js
- UNLIM INTOCCABILE: 11 file, 2430 LOC — solo wrappare, mai modificare
- ChatOverlay.jsx: NON modificare — wrappare in FloatingWindow
- ZERO REGRESSIONI: #tutor IDENTICO in ogni momento. Verificare con screenshot.
- STRANGLER FIG: tutti i file nuovi in src/components/lavagna/
- TOUCH FIRST: pointer events, min 48px target
- CSS MODULES per tutto il nuovo codice
- ZERO EMOJI: usa ElabIcons.jsx SVG

### Estetica ELAB — Parita con i manuali
I volumi fisici ELAB hanno un'estetica precisa: colori saturi ma caldi, illustrazioni pulite, tipografia forte (Oswald bold per titoli), tanto bianco, bordi arrotondati, icone semplici. La Lavagna deve SEMBRARE un prodotto ELAB, non un'app web generica.
- Header: deve sembrare la copertina di un volume ELAB (Navy saturo, Oswald bold bianco)
- FloatingWindow: bordi morbidi (16px radius), ombra calda, barra titolo che richiama il Navy
- Toolbar: icone pulite come le illustrazioni dei manuali, non troppo "tech"
- Transizioni: fluide ma non appariscenti — professionale, non giocoso

---

## SKILL DA USARE
```
/elab-quality-gate          — prima, meta, fine
/lavagna-benchmark          — 1/3, 1/2, fine (15 metriche)
/verification-before-completion — prima di ogni commit
/simplify                   — dopo ogni implementazione
/systematic-debugging       — dopo OGNI test failure
/frontend-design            — per ogni componente UI nuovo
/design:design-critique     — review design prima di procedere
```

---

## IL PROBLEMA ARCHITETTURALE DI QUESTA SESSIONE

ChatOverlay ha ~20 props passate da ElabTutorV4. Non puoi semplicemente `<FloatingWindow><ChatOverlay /></FloatingWindow>` perche ChatOverlay ha bisogno di:
- messages, input, onInputChange, onSend, isLoading (stato chat)
- voiceEnabled, onVoiceToggle, voiceRecording, onVoiceRecord (STT)
- onScreenshot (cattura circuito)
- socraticMode, onToggleSocraticMode
- visible, onClose, expanded, onToggleExpanded

### Soluzione: GalileoAdapter.jsx
Crea un **adapter** in `src/components/lavagna/GalileoAdapter.jsx` che:
1. Replica lo stato chat (messages, input, loading) con hook locali
2. Usa gli stessi endpoint n8n/nanobot gia usati da ElabTutorV4
3. Importa i servizi esistenti (galileoService, voiceService, unlimMemory)
4. Monta ChatOverlay con TUTTE le props richieste
5. Wrappa il tutto in FloatingWindow

**NON copiare codice da ElabTutorV4.** Importa i servizi. Se un servizio non esporta una funzione necessaria, crea un helper minimo.

**ATTENZIONE**: Questo e il task piu rischioso del piano. Se il wiring non e perfetto, Galileo non funziona. Testa OGNI singola feature: streaming, voice, intent, mascotte.

---

## 12 TASK

### Task 1: Analizzare il wiring ChatOverlay ↔ ElabTutorV4
- Leggere ElabTutorV4.jsx righe 1-100 (imports), 200-400 (stato chat), 800-1000 (handlers chat), 2580-2610 (mount ChatOverlay)
- Documentare OGNI prop, da dove viene, cosa fa
- Decidere: quali props possiamo passare da LavagnaShell, quali servono un adapter
- OUTPUT: lista prop con sorgente e strategia

### Task 2: GalileoAdapter.jsx — stato chat + servizi
- Hook: useGalileoChat() — messages, input, loading, send, retry
- Importare galileoService (o il webhook URL da config)
- Supportare streaming (SSE/fetch con reader)
- Integrare circuitContext (dal simulatore, via window.__ELAB_API)
- Test: mandare un messaggio e ricevere risposta

### Task 3: GalileoAdapter — voice (STT/TTS)
- Importare voiceService (esistente)
- STT: press-to-talk o toggle (come oggi)
- TTS: chunking, voice ranking, rate 0.95 (come oggi)
- Guard feedback loop (STT non ascolta mentre TTS parla)
- Test: parlare e ricevere risposta vocale

### Task 4: Montare ChatOverlay in FloatingWindow dentro LavagnaShell
- FloatingWindow a destra (default 360x full height)
- ChatOverlay con TUTTE le props dal GalileoAdapter
- Bottone "Galileo" nella AppHeader per aprire/chiudere
- Default: aperta al primo accesso, poi ricorda stato in localStorage

### Task 5: AUDIT 1/3
- /lavagna-benchmark 1/3
- Verificare: Galileo risponde? Streaming funziona? Voice funziona?
- Screenshot #lavagna con FloatingWindow aperta
- Screenshot #tutor — DEVE essere IDENTICO

### Task 6: RetractablePanel sinistro — ComponentDrawer
- Montare RetractablePanel(direction="left") nella LavagnaShell
- Contenuto: la lista componenti del simulatore (ComponentDrawer/ComponentPalette)
- Il drag-and-drop dalla palette al canvas DEVE funzionare
- Toggle button per aprire/chiudere
- Default: aperto

### Task 7: RetractablePanel basso — CodeEditor con tab
- Montare RetractablePanel(direction="bottom") nella LavagnaShell
- Tab: Arduino C++ | Blocchi | Monitor | Passi
- Wrappare CodeEditorCM6, ScratchEditor, SerialMonitor, ExperimentGuide (esistenti)
- La compilazione DEVE funzionare
- Default: chiuso (si apre quando selezioni un esperimento con codice)

### Task 8: AUDIT 1/2
- /lavagna-benchmark 1/2 (tutte 15 metriche)
- D1: drag FloatingWindow — DEVE funzionare smooth
- D2: resize FloatingWindow — DEVE funzionare da angoli e bordi
- D3: RetractablePanel — animazione 300ms smooth
- Touch test 1024x768
- 3 agenti paralleli: a11y, visual, performance

### Task 9: Connettere FloatingToolbar al simulatore
- I 7 bottoni devono FARE qualcosa:
  - Select → modo selezione (default)
  - Wire → modo filo (setTool('wire') su simulatore)
  - Delete → elimina selezionato
  - Undo/Redo → chiama undo/redo del simulatore
  - Pen → attiva DrawingOverlay
- Usare window.__ELAB_API dove possibile

### Task 10: Connettere AppHeader al simulatore
- Nome esperimento: mostra il nome dell'esperimento attuale (da simulatore state)
- Progress dots: mostra step corrente (se Passo Passo)
- Play button: avvia/ferma simulazione (chiama simulatore play/stop)
- Hamburger: apre un menu contestuale (per ora: link a #tutor, "Cambia volume")

### Task 11: Test end-to-end della Lavagna
- Navigare a #lavagna
- Aprire pannello sinistro → trascinare un LED sulla breadboard
- Aprire pannello basso → scrivere codice
- Compilare → avviare simulazione
- Chiedere a Galileo "cosa fa questo circuito?"
- Verificare che TUTTO funziona insieme

### Task 12: AUDIT FINE SESSIONE
- /lavagna-benchmark fine (tutte 15 metriche)
- 5 agenti audit completi
- Screenshot confronto #tutor vs #lavagna
- Score card ONESTA (se qualcosa non funziona, dire 0, non N/A)
- Generare LAVAGNA-S3-PROMPT.md
- Aggiornare MEMORY.md

---

## BENCHMARK TARGET S2 (SEVERO)
- F1-F5: tutte PASS (bloccante)
- U1 Chrome ratio: >= 8 (header + pannello Galileo aperto = max 25% chrome)
- U2 Touch 48px: 10 (zero violazioni nei nuovi componenti)
- U3 LIM 1024x768: >= 8 (tutto leggibile, pannelli non coprono il canvas)
- U5 Coerenza: >= 8 (FloatingWindow stile ELAB, non generico)
- D1 Drag: >= 8 (smooth, nessun glitch visibile)
- D2 Resize: >= 7 (angoli + bordi funzionanti)
- D3 Pannelli animati: >= 8 (300ms smooth, non scattoso)
- D4 Glassmorphism: >= 9 (header E FloatingWindow)
- D5 Palette: 10 (zero colori fuori palette)
- **Target composito ONESTO S2: >= 7.0/10**
- Se Galileo non risponde a messaggi = sessione FALLITA (score 0)
- Se RetractablePanel non si anima = D3 vale 0, non N/A
- Se FloatingWindow non si trascina = D1 vale 0, non N/A

---

## REGOLA D'ORO S2
**Ogni componente creato in S1 deve essere MONTATO e FUNZIONANTE nel browser entro fine S2.** Se a fine sessione un componente e ancora "pronto ma non montato", il suo score e 0.

La Lavagna a fine S2 deve essere:
- Header connessa (nome esperimento, play, menu)
- Pannello sinistro con componenti (apri/chiudi)
- Canvas con simulatore + toolbar FUNZIONANTE
- Pannello basso con codice (apri/chiudi)
- FloatingWindow Galileo a destra (chat funzionante, drag, resize)

Se manca anche solo uno di questi 5 elementi, la sessione non raggiunge 7.
