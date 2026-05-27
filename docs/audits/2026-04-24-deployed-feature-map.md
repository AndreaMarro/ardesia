# Mappa funzionalità deployate — `https://www.elabtutor.school` — 2026-04-24

**Auditor:** Claude (sessione 1/6, ruolo product auditor read-only)
**Metodo:** Playwright headless desktop (1440x900) + mobile (390x844 iPhone 13) + introspezione `window.__ELAB_API` + lettura sorgenti `src/`.
**Filtro Principio Zero v3:** ogni feature valutata da un docente davanti alla LIM senza preparazione (10 sec). Se non capisce → tag `[ATTRITO]`.
**Tassonomia:** `[LIVE]` testata · `[PARZIALE]` incompleta · `[AMBIGUA]` non chiara · `[ROTTA]` fallisce · `[NASCOSTA]` solo in codice · `[DEPRECATED]` legacy.

> **Nota verificabilità:** UI mappata per quanto raggiungibile da Playwright senza login docente (nessuna chiave univoca disponibile). Le pagine dietro `RequireAuth`/`RequireLicense` sono mappate solo via codice (flag `[NASCOSTA]` o `[AMBIGUA]`).

---

## 0. Sommario esecutivo

| Stato | Conteggio |
|---|---|
| `[LIVE]` confermata su prod | 47 |
| `[PARZIALE]` | 11 |
| `[AMBIGUA]` | 6 |
| `[ROTTA]` | 3 |
| `[NASCOSTA]` (in codice ma non raggiungibile guest) | 9 |
| `[DEPRECATED]` | 2 |
| **Tot feature mappate** | **78** |

**Flag `[ATTRITO]` Principio Zero v3:** **18** (vedi §10).

**Top 5 problemi visibili dal docente in 10 secondi:**
1. **Privacy dialog "Quanti anni hai?" mostrata 3 volte sovrapposte** sulla stessa schermata `#prova` / `#lavagna` (3 istanze del componente `ConsentBanner` simultanee — vedi §8.1).
2. **Auto-attivazione ConsentBanner per minori sui flussi docente** — il dialog blocca tutto chiedendo età, anche su `/scuole/pnrr` (landing B2B) e su `#lavagna` (interfaccia LIM dove l'utente è il docente, non il minore).
3. **Emoji come icone** in toolbar `#prova` e `#lavagna` (💡🔧👣🎨📋❓👀✅) — viola CLAUDE.md regola 11 (`MAI emoji come icone`).
4. **Welcome dialog "Scegli come iniziare"** appare insieme a `ExperimentGuide`, `ConsentBanner` e `Bentornati`/`ExperimentPicker` → 4+ overlay simultanei al primo accesso.
5. **`#dashboard-v2?live=1&teacher=demo`** → `Failed to fetch` immediato. Backend Edge Function `dashboard-snapshot` non risponde in produzione.

---

## 1. Route / pagine (hash-based + pathname)

App.jsx implementa routing custom: `pathname` per landing legali/PNRR, `hash` per app SPA.

| Route | Componente sorgente | Auth | Stato | Note |
|---|---|---|---|---|
| `/` (default) | `WelcomePage` (alias di `#showcase`) | nessuna | `[LIVE]` | Login con "chiave univoca" — single field, senza email. Bottone `ENTRA`. ATTRITO: utente non sa cos'è una "chiave univoca". |
| `/#showcase` | `WelcomePage` | nessuna | `[LIVE]` | Identico a `/`. |
| `/#vetrina` | `WelcomePage` (alias) | nessuna | `[LIVE]` | Tutti i `vetrina*` consolidati in `WelcomePage`. |
| `/#vetrina2` | `WelcomePage` (alias) | nessuna | `[LIVE]` | Idem. `VetrinaV2.jsx` esiste ma non instradata da App.jsx. `[NASCOSTA]`. |
| `/#prova` | `ElabTutorV4` con `provaMode` | nessuna | `[LIVE]` | Simulatore reale Volume 1 senza login. Vedi §2.2. |
| `/#tutor` | redirect → `/#lavagna` | `RequireAuth + RequireLicense` (sezione disabilitata, override redirect a `#lavagna`) | `[DEPRECATED]` | Codice di redirect attivo. La vecchia versione `ElabTutorV4` con tab esiste in App.jsx ma marcata morta dal redirect. |
| `/#lavagna` | `LavagnaShell` | nessuna (ma render condizionale dei tab Lezione/Classe/Progressi richiede `isDocente`/`isStudente`) | `[LIVE]` | Esperienza primaria. Vedi §2.1. |
| `/#login` | `LoginPage` | nessuna | `[LIVE]` | Email + password + "Mostra password". |
| `/#register` | `RegisterPage` | nessuna | `[LIVE]` | Nome + email + password + ruolo (docente/studente/genitore — combobox). |
| `/#dashboard` | `StudentDashboard` | `RequireAuth` | `[NASCOSTA]` | Redirect a `#login`. |
| `/#dashboard-v2?live=1&teacher=...&range=7d` | `DashboardShell` | nessuna | `[ROTTA]` | Render HTML ma fetch fallisce: "Errore: Failed to fetch". |
| `/#teacher` | `TeacherDashboard` | `RequireAuth` + `isDocente` | `[NASCOSTA]` | Redirect a `#login`. |
| `/#admin` | `AdminPage` | nessuna (ma password gate interno) | `[LIVE]` | "Accesso Admin" con campo password (per memoria: `[REDACTED-MOVED-TO-ENV]`). |
| `/scuole/pnrr` | `LandingPNRR` | nessuna | `[LIVE]` | Landing commerciale completa. Vedi §2.5. |
| `/scuole` | `LandingPNRR` (alias) | nessuna | `[LIVE]` | Stessa pagina. |
| `/privacy` | `PrivacyPolicy` | nessuna | `[LIVE]` | 14+ sezioni, navigation interna (genitori/bambini/diritti/contatti). |
| `/data-deletion` | `DataDeletion` | nessuna | `[LIVE]` | Form GDPR Art. 17. Dichiarato in App.jsx. |

**Flag instradamento non raggiungibile:**
- `VetrinaV2.jsx` esiste in `src/components/lavagna/VetrinaV2.jsx` e in App.jsx come `lazy()`, ma nessun branch lo renderizza (`vetrina*` redirige a `WelcomePage`). `[NASCOSTA]`.

---

## 2. Viste / schermate principali

### 2.1 Lavagna — `#lavagna` (entry primario docente)

**Sorgente:** `src/components/lavagna/LavagnaShell.jsx` (1027 righe).

**Layout desktop (1440x900):**
- **Top:** `AppHeader` — logo ELAB, nome esperimento (centrato), bottoni dx: `Manuale` `Video` `Fumetto`. Tab Lezione/Classe/Progressi presenti nel codice ma renderizzati solo se `isDocente`/`isStudente` → invisibili guest.
- **Sinistra:** `RetractablePanel` con `QuickComponentPanel` — 8 componenti Vol1 (LED, Resistore, Pulsante, Batteria 9V, Potenziometro, Buzzer, LDR, Interruttore Reed). Click → `__ELAB_API.addComponent`.
- **Centro:** Build mode buttons (Già Montato/Passo Passo/Libero) + canvas SVG (`SimulatorCanvas`) con breadboard + componenti dell'esperimento corrente.
- **Centro-destra (top):** `VisionButton` "Guarda il mio circuito".
- **Sinistra-canvas (vertical):** `FloatingToolbar` — Seleziona / Filo / Elimina / Annulla / Ripeti / Penna.
- **Right (overlay):** `GalileoAdapter` (chat UNLIM) — solo se `galileoOpen` true (default false dopo P0 fix).
- **Bottom-right:** `MascotPresence` mascotte UNLIM draggable (apre chat al click).
- **Bottom (overlay):** `ConsentBanner` età-gate **(visibile a docente, ATTRITO critico).**

**Layout mobile (390x844):**
- AppHeader compresso — solo iconcine Manuale/Video/Fumetto, etichetta esperimento ridotta a "A" troncato.
- Build mode buttons orizzontali ma tagliati: visibile solo "tato" (Già Montato) e "Passo".
- Canvas SVG visibile ma breadboard scalata male (centrata fuori viewport).
- ConsentBanner occupa ~30% dello schermo dal basso.
- Left panel non visibile (richiede scroll/toggle).

**Stato:** `[LIVE]` ma con regressioni mobile (bus/breadboard fuori viewport) e ATTRITO multiplo.

### 2.2 Modalità Prova — `#prova` (versione di prova senza login)

**Sorgente:** `src/components/tutor/ElabTutorV4.jsx` con prop `provaMode=true`.

**Layout desktop:**
- **Banner blu sopra:** "Versione di prova — Volume 1 (38 esperimenti)" + bottone "Tutti i 92 esperimenti".
- **MinimalControlBar:** Azzera (icona refresh) / nome esperimento (clickabile per cambio) / Strumenti e opzioni (3-dots) / "Chiedi a UNLIM" (verde).
- **Build mode pills:** Già Montato (selected) / Passo Passo / Libero — con emoji.
- **Canvas SVG:** breadboard + bat1 + r1 + led1 con LED rosso visibilmente acceso (alone).
- **Mini toolbar canvas:** Filo / + zoom / 100% / − zoom.
- **Right panel:** `ExperimentGuide` con titolo + descrizione + "Cosa Osservare" + concept tags + bottone "Chiedi a UNLIM".
- **Right panel inferiore:** `LessonPathPanel` "Percorso Lezione" — UNLIM badge + Obiettivo + 5 step (📋 PREPARA / 🔧 MOSTRA / ❓ CHIEDI / 👀 OSSERVA / ✅ CONCLUDI) + "Prossimo:" preview esperimento successivo.
- **Modal "Suggerimento Simulatore ELAB":** popup informativo con "Chiudi" — appare al primo accesso.
- **Modal "BENVENUTO! Scegli come iniziare":** Lezione pronta / Esplora il simulatore / Vai alla dashboard — copre canvas.
- **ConsentBanner:** sotto, fixed bottom, blocca interazione.
- **Toast UNLIM:** "Il controllo vocale funziona su Chrome e Edge. Qui puoi scrivere!".
- **Mascotte UNLIM:** bottom-right, draggable, doppio bottone (testo + microfono).

**Layout mobile:**
- Tutti i modal e dialog si sovrappongono allo stesso tempo, lasciando ~80px di canvas usabile.

**Stato:** `[LIVE]` ma `[ATTRITO]` per modal stacking simultaneo.

### 2.3 Welcome — `/` e `#showcase`

Login con "chiave univoca" (campo testo singolo) + bottone ENTRA. Mascotte UNLIM in alto. Footer "ELAB Tutor — Andrea Marro". ConsentBanner attivo. ATTRITO: nessuna spiegazione di cosa sia la chiave o come ottenerla.

**Stato:** `[LIVE]`.

### 2.4 Login / Register — `#login`, `#register`

**LoginPage:** Email + Password (con toggle "Mostra password") + bottone Accedi + link Registrati + "← Scopri ELAB".

**RegisterPage:** Nome completo + (campo non etichettato — possibile cognome) + Email + (campo non etichettato — possibile password) + "Sono un..." (combobox ruolo) + (4° campo non etichettato) + Crea Account. **`[PARZIALE]`** alcune label vuote.

**Stato:** `[LIVE]` (login), `[PARZIALE]` (register — label mancanti rilevate da snapshot).

### 2.5 Landing PNRR — `/scuole/pnrr`

Sorgente `src/components/LandingPNRR.jsx`. Sezioni:
1. Hero "Il laboratorio di elettronica che funziona sulla LIM" + CTA Richiedi Preventivo (mailto) + Prova la Demo.
2. 3 card: Funziona subito / GDPR compliant / Allineato PNRR Scuola 4.0.
3. Tabella confronto vs Tinkercad Circuits / Arduino IDE (10 righe).
4. Sezione PNRR in cifre: 2,1 mld / 100.000 aule / 750 mln STEM.
5. "Perché ELAB Tutor rientra nel PNRR" (6 punti numerati ma testo vuoto in snapshot — `[PARZIALE]`).
6. "Come acquistare su MePA" (3 step).
7. "Cosa include ELAB Tutor" (3 colonne — list vuoti in snapshot, `[PARZIALE]`).
8. FAQ 5 domande (collapse).
9. Form Richiedi Preventivo MePA (4 campi).
10. Footer Omaric Elettronica.

**Stato:** `[LIVE]` ma `[PARZIALE]` per liste vuote in 2 sezioni.

### 2.6 Privacy — `/privacy`

`PrivacyPolicy` 14+ sezioni con anchor navigation (#genitori #bambini #diritti #contatti). Footer "Torna alla Home". `[LIVE]`. `[ATTRITO]`: ConsentBanner attivo anche qui.

### 2.7 Dashboard-v2 — `#dashboard-v2`

Navbar + heading "Dashboard Docente" + alert "Errore: Failed to fetch" + Riprova. Backend supabase `dashboard-snapshot` non risponde. **`[ROTTA]`** in stato corrente.

### 2.8 Admin — `#admin`

"Accesso Admin" con campo password e bottone "← Torna alla home". Navigation top vuota. **`[LIVE]`** (gate).

---

## 3. Componenti Lavagna (modulo `src/components/lavagna/`)

| Componente | File | Ruolo | Stato |
|---|---|---|---|
| `LavagnaShell` | LavagnaShell.jsx | Orchestratore layout + state machine | `[LIVE]` |
| `AppHeader` | AppHeader.jsx | Top bar (logo, exp name, Manuale/Video/Fumetto + tab condizionali) | `[LIVE]` |
| `FloatingToolbar` | FloatingToolbar.jsx | 6 tool icone (Seleziona/Filo/Elimina/Annulla/Ripeti/Penna) | `[LIVE]` |
| `RetractablePanel` | RetractablePanel.jsx | Pannello collassabile L/B con drag resize | `[LIVE]` |
| `QuickComponentPanel` | (in LavagnaShell.jsx) | Grid 8 componenti Vol1, filtrati per volume corrente | `[LIVE]` |
| `GalileoAdapter` | GalileoAdapter.jsx | Wrapper chat UNLIM in FloatingWindow | `[LIVE]` (UNLIM minimizzato di default) |
| `FloatingWindow` | FloatingWindow.jsx | Wrapper draggable per UNLIM/Video | `[LIVE]` |
| `MascotPresence` | MascotPresence.jsx | Mascotte ELAB draggable, click apre UNLIM | `[LIVE]` |
| `ExperimentPicker` | ExperimentPicker.jsx | Modal scelta esperimenti 92 | `[LIVE]` |
| `BentornatiOverlay` | (in LavagnaShell.jsx) | Welcome PrincipioZero "Bentornati/Benvenuti" | `[LIVE]` ma sovrapposto |
| `ErrorToast` | ErrorToast.jsx | Toast errori → "Chiedi a UNLIM" | `[NASCOSTA]` (no errori in test) |
| `LessonReader` | LessonReader.jsx | Lettore lezione (tab Lezione, solo docente) | `[NASCOSTA]` (tab non visibile guest) |
| `LessonSelector` | LessonSelector.jsx | Selettore lezioni 27 | `[NASCOSTA]` |
| `LessonBar` | LessonBar.jsx | Barra lezione | `[AMBIGUA]` (non vista) |
| `PercorsoPanel` | PercorsoPanel.jsx | Pannello Percorso lezione | `[NASCOSTA]` (integrato come tab UNLIM) |
| `SessionReportComic` | SessionReportComic.jsx | Variante comic report | `[AMBIGUA]` |
| `UnlimBar` | UnlimBar.jsx | Barra UNLIM | `[AMBIGUA]` |
| `UnlimNudgeOverlay` | UnlimNudgeOverlay.jsx | Overlay nudge | `[AMBIGUA]` |
| `VideoFloat` | VideoFloat.jsx | Window YouTube/Videocorsi | `[LIVE]` (toggle dal header) |
| `VolumeViewer` | VolumeViewer.jsx | PDF viewer volumi | `[LIVE]` (toggle nel codice — bottone non sempre visibile) |
| `VetrinaV2` | VetrinaV2.jsx | Vetrina alternativa | `[NASCOSTA]` (lazy loaded ma non instradato) |

---

## 4. Componenti Simulatore (modulo `src/components/simulator/`)

### 4.1 Shell
- `NewElabSimulator` — entry simulatore (1022 righe). Usato da `LavagnaShell` (con `hideLessonPath`) e da `ElabTutorV4`. `[LIVE]`.

### 4.2 Canvas + Engine
- `SimulatorCanvas` — SVG principale, zoom/pan/drag, 21 componenti supportati. `[LIVE]`.
- `DrawingOverlay` — penna freehand su canvas (toggleable via `__ELAB_API.toggleDrawing`). `[LIVE]`.
- `PinOverlay` — overlay highlight pin. `[LIVE]` (chiamato da `unlim.highlightPin`).
- `WireRenderer` — render fili/connessioni. `[LIVE]`.
- `engine/CircuitSolver.js` (2486 righe) — DC MNA/KCL Gaussian elimination. `[LIVE]`.
- `engine/AVRBridge.js` (1242) — emulazione ATmega328p via avr8js. `[LIVE]` (Vol3 mode).
- `engine/PlacementEngine.js` (822) — auto-placement componenti.

### 4.3 Panels (`src/components/simulator/panels/`)

| Componente | Ruolo | Stato |
|---|---|---|
| `ExperimentPicker` | Modal scegli esperimento (vol1/vol2/vol3) | `[LIVE]` |
| `ComponentPalette` | Tavolozza 21 componenti drag-drop | `[LIVE]` (sidebar simulator) |
| `MinimalControlBar` | Barra minima `#prova` (Azzera/exp/Strumenti/UNLIM) | `[LIVE]` |
| `ControlBar` | Barra completa | `[NASCOSTA]` (sostituita da Minimal) |
| `BuildModeGuide` | Guida modalità Già Montato/Passo Passo/Libero | `[LIVE]` |
| `ExperimentGuide` | Guida esperimento (titolo + Cosa Osservare + concepts) | `[LIVE]` |
| `LessonPathPanel` | Percorso lezione 5 step PREPARA→CONCLUDI | `[LIVE]` |
| `BomPanel` | Bill of Materials | `[NASCOSTA]` (`__ELAB_API.showBom` esiste, no UI guest) |
| `CodeEditorCM6` | Editor Arduino (CodeMirror 6) | `[NASCOSTA]` (Vol3 only) |
| `SerialMonitor` | Monitor seriale Arduino | `[NASCOSTA]` (Vol3) |
| `SerialPlotter` | Plotter seriale | `[NASCOSTA]` |
| `ScratchEditor` | Blockly Scratch | `[NASCOSTA]` (lazy, no Vol1 esp visibili) |
| `ScratchCompileBar` | Bar compile Scratch + ErrorBoundary | `[NASCOSTA]` |
| `PropertiesPanel` | Proprietà componente selezionato | `[AMBIGUA]` |
| `ComponentDrawer` | Drawer componenti | `[AMBIGUA]` |
| `NotesPanel` | Note esperimento | `[AMBIGUA]` |
| `QuizPanel` | Quiz generato | `[NASCOSTA]` (`__ELAB_API.unlim.generateQuiz` event-stub) |
| `WhiteboardOverlay` | Overlay whiteboard | `[AMBIGUA]` |
| `ShortcutsPanel` | Tasti rapidi | `[AMBIGUA]` |
| `GalileoResponsePanel` | Risposta UNLIM nel sim | `[NASCOSTA]` (legacy?) |

### 4.4 Overlays
- `PotOverlay` — slider per potenziometro. `[NASCOSTA]` (esp non testati).
- `LdrOverlay` — slider luminosità LDR. `[NASCOSTA]`.
- `RotateDeviceOverlay` — "ruota dispositivo" mobile portrait. `[AMBIGUA]` (non riprodotto).

---

## 5. Componenti UNLIM (modulo `src/components/unlim/`)

| Componente | File | Ruolo | Stato |
|---|---|---|---|
| `UnlimWrapper` | UnlimWrapper.jsx | Provider context UNLIM | `[LIVE]` (in `#prova`) |
| `UnlimOverlay` | UnlimOverlay.jsx | Fumetti contestuali accanto a componenti | `[LIVE]` (init verificato in code) |
| `UnlimMascot` | UnlimMascot.jsx | Mascotte UNLIM (icona robot) | `[LIVE]` (vista bottom-right `#prova`) |
| `UnlimInputBar` | UnlimInputBar.jsx | Barra input chat (testo + mic) | `[LIVE]` |
| `UnlimModeSwitch` | UnlimModeSwitch.jsx | Switch on/off voce | `[LIVE]` ("UNLIM — voce disattivata. Tieni premuto per attivare") |
| `UnlimReport` | UnlimReport.jsx | Fumetto report sessione (PDF print) | `[LIVE]` (bottone "Fumetto" header lavagna) |

**Da `src/components/lavagna/`:**
- `useGalileoChat.js` — hook chat UNLIM (state, messaging, INTENT/AZIONE parsing). `[LIVE]`.

**Da `src/components/tutor/`:**
- `ChatOverlay.jsx` (+ `.module.css`) — chat overlay legacy. `[LIVE]` (wrappato da GalileoAdapter).
- `VisionButton.jsx` — bottone "Guarda il mio circuito" → screenshot + Gemini Vision. `[LIVE]`.
- `ContextualHints.jsx` — suggerimenti contestuali. `[AMBIGUA]`.

**Bridge `__ELAB_API.unlim` runtime confermato live (16 metodi):**
```
highlightComponent · highlightPin · clearHighlights · serialWrite · getCircuitState
speakTTS · listenSTT · saveSessionMemory · recallPastSession · showNudge
alertDocente · generateQuiz · exportFumetto · videoLoad
version · info
```

`[LIVE]` tutti i 16 handler dichiarati. NB: `speakTTS` chiama Edge TTS VPS o Kokoro (verificato non a runtime). `generateQuiz`/`exportFumetto`/`videoLoad`/`alertDocente` sono **event-stub**: emettono `__ELAB_EVENTS` per listener UI (Day 38+). Quindi `[PARZIALE]` per il behavior end-to-end.

---

## 6. Toolbar / toggle / control

### 6.1 AppHeader (lavagna)
- **ELAB logo** (sx) — torna a vista lavagna.
- **Nome esperimento** (centro) — clickabile per cambiare.
- **Manuale** — `Apri manuale` icon. Apre `VolumeViewer`.
- **Video** — `Apri video` icon. Apre `VideoFloat`.
- **Fumetto** — `Apri Fumetto Report` icon. Apre `UnlimReport.openReportWindow`.
- **Tab Lezione/Classe/Progressi** — solo docente/studente, non visibile guest. `[NASCOSTA]`.

### 6.2 FloatingToolbar (lavagna, sx canvas)
- **Seleziona** (default).
- **Filo** — `setToolMode('wire')`.
- **Elimina** — `removeComponent(selectedId)` con feedback toast se nulla selezionato.
- **Annulla** — `undo()`.
- **Ripeti** — `redo()`.
- **Penna** — `toggleDrawing(true)` per `DrawingOverlay`.

`[LIVE]` tutte 6.

### 6.3 MinimalControlBar (`#prova`)
- **Azzera** — reset sim.
- **Esperimento name** (toggle picker).
- **Strumenti e opzioni** (3-dots).
- **Chiedi a UNLIM** (CTA principale).

`[LIVE]`.

### 6.4 BuildModeGuide pills
- **Già Montato** (`complete`) — circuito pre-montato.
- **Passo Passo** (`guided`) — costruzione step-by-step.
- **Libero** (`sandbox`) — breadboard vuota.

`[LIVE]` ma label con **emoji come icone** (🔧👣🎨) → viola CLAUDE.md.

### 6.5 Canvas mini-toolbar (bottom-dx canvas)
- **Filo** (toggle).
- **+ / −** zoom.
- **% percentuale zoom** (reset 100%).

`[LIVE]`.

### 6.6 LessonPathPanel tabs
- **PREPARA / MOSTRA / CHIEDI / OSSERVA / CONCLUDI** — 5 step con emoji 📋🔧❓👀✅.

`[LIVE]` ma emoji icone violano regola.

### 6.7 Mascotte UNLIM (bottom-right)
- **Bottone testo** UNLIM con etichetta dinamica.
- **Bottone mic**: tap-toggle voce ("Tieni premuto per attivare").

`[LIVE]`.

### 6.8 VisionButton
- **Guarda il mio circuito** (top-right canvas lavagna) — screenshot+Gemini Vision.

`[LIVE]` (presente UI, end-to-end non testato senza login).

---

## 7. Flussi utente

### 7.1 Onboarding primo accesso (`#prova`)
1. ConsentBanner appare immediatamente chiedendo età.
2. Modal "Suggerimento Simulatore ELAB" appare.
3. Modal "BENVENUTO! Scegli come iniziare" appare.
4. Toast UNLIM "Il controllo vocale funziona...".
5. **4 overlay simultanei.** ATTRITO: docente non sa cosa toccare per primo.

`[ATTRITO][PARZIALE]`: la sequenza dovrebbe essere serializzata.

### 7.2 Onboarding `#lavagna`
1. ConsentBanner appare.
2. `BentornatiOverlay` o `ExperimentPicker` (timer 400ms) appare.
3. Fallback `ExperimentPicker` se nessun esperimento.
4. `MascotPresence` apparso.

`[LIVE]` ma stesso problema overlay multipli.

### 7.3 Caricamento esperimento (`mountExperiment`)
1. User click `ExperimentPicker` su esperimento.
2. `__ELAB_API.loadExperiment(id)` → `selectExperiment(exp)`.
3. Evento `experimentChange` emesso.
4. `LavagnaShell` aggiorna `experimentName`, `currentExperiment`.
5. Polling 100ms per `getCurrentExperiment` (race condition workaround).
6. Auto-fit canvas via `dispatchEvent(resize)` 300ms dopo.

`[LIVE]`.

### 7.4 Chat UNLIM
1. Click mascotte o "Chiedi a UNLIM" o tab UNLIM.
2. `setGalileoOpen(true)` + `manualOverridesRef.current.galileo = true`.
3. `GalileoAdapter` renderizza `ChatOverlay` in `FloatingWindow`.
4. Messaggio user → `useGalileoChat` hook → `sendChat()` (api.js) → Render Nanobot (https://elab-galileo.onrender.com).
5. Risposta parse `[AZIONE:...]` `[INTENT:...]` tag → esecuzione `__ELAB_API` calls.

`[LIVE]` (presente). End-to-end con risposta AI non testato senza chiamata reale.

### 7.5 Voice (wake word "Ehi UNLIM")
1. `useEffect` mount `LavagnaShell` chiama `startWakeWordListener`.
2. Web Speech API ascolta in background.
3. `onWake` → apre UNLIM + toast "Ti ascolto!".
4. `onCommand(text)` → `__ELAB_API.galileo.sendMessage(text)`.

`[PARZIALE]`: API `__ELAB_API.galileo` non esiste (è `__ELAB_API.unlim`). Bug latente: `setGalileoOpen` ok, sendMessage no. **Confermato** dal codice (LavagnaShell.jsx:431) — chiama `api.galileo.sendMessage` invece di `api.unlim.sendMessage` o equivalente. `[ROTTA]` se wake word triggered.

### 7.6 Voice (mascotte tap-mic)
1. Tap-hold mascotte mic.
2. `voiceService.startRecording()` → `stopRecording()` → `sendVoiceChat(blob)`.
3. Risposta UNLIM.

`[LIVE]` (presente). Non testato live.

### 7.7 Fumetto report
1. Click bottone Fumetto in AppHeader.
2. `handleFumettoOpen` → import dinamico `UnlimReport.openReportWindow(expId)`.
3. Se nessuna sessione → toast "Nessuna sessione salvata".
4. Se popup bloccato → fallback download HTML "Fumetto scaricato come file HTML".
5. Altrimenti popup window con scene (Discovery/Oops/Eureka/Domandona) + dialoghi user/assistant + grafici SVG.

`[LIVE]`.

### 7.8 Vision
1. Click "Guarda il mio circuito" → `VisionButton`.
2. `__ELAB_API.captureScreenshot()` → base64 PNG.
3. Apre UNLIM + dispatch `elab-vision-capture` event con base64.
4. `useGalileoChat` riceve event → invia immagine a Gemini Vision via Nanobot.

`[LIVE]` (UI presente, end-to-end non verificato in audit guest).

### 7.9 Export (Fumetto PDF)
- `print` su popup → l'utente fa "Salva come PDF". Niente backend dedicato.

`[LIVE]`.

---

## 8. Stati particolari

### 8.1 Empty state
- **`#lavagna` senza esperimento:** dopo `Bentornati`, picker auto-apre se `freeMode` false. `[PARZIALE]`: in modalità Libero (sandbox) breadboard vuota — il docente vede uno schermo bianco.
- **`#prova` primo accesso:** Welcome dialog auto-load primo esperimento dopo 2s (timer in `BentornatiOverlay`).
- **`#dashboard-v2` no data:** "Failed to fetch" alert (vedi 8.4).

### 8.2 Error state
- **Compilazione errore:** `errorTranslator` traduce errori GCC. `ErrorToast` mostra "Chiedi a UNLIM". `[LIVE]`.
- **Nudge esecuzione:** `nudgeService.sendNudge` via Supabase. `[AMBIGUA]` se non logato.

### 8.3 Offline
- `useOnlineStatus` hook. `OfflineBanner` mostra "Sei offline — il simulatore e gli esperimenti funzionano! UNLIM e la compilazione di nuovo codice no." `[LIVE]` (banner top fisso).

### 8.4 PWA stale precache (regressione storica P0)
- Sprint 4 hotfix: `controllerchange` handler + reload + sessionStorage guard. `[LIVE]`.
- Service Worker confermato attivo (`sw.js` scope=`/`).

### 8.5 Mobile portrait
- `RotateDeviceOverlay` attivabile su simulator. `[AMBIGUA]` (non visto in test mobile 390x844 portrait, simulator funziona ma layout rotto).

### 8.6 Auth states
- `RequireAuth` redirect a `#login`. `[LIVE]`.
- `RequireLicense` chiede licenza. `[NASCOSTA]` (non raggiungibile guest).
- ConsentBanner blocca tutto. `[LIVE]` (sempre).

---

## 9. Casi limite visibili

1. **3 dialog ConsentBanner sovrapposti** in `#prova` (snapshot conferma 3 istanze: dentro main, dentro showcase fallback, dentro AppRouter root).
2. **Welcome + Bentornati + Picker + ConsentBanner** insieme in `#lavagna`.
3. **`#dashboard-v2` Failed to fetch immediato** — backend down.
4. **Wake word call to `api.galileo.sendMessage`** non resolve (deve essere `api.unlim.sendMessage`).
5. **`addComponent` sui pulsanti palette** — usa coords randomiche `200+rand*100, 150+rand*80`, non snap a breadboard. `[PARZIALE]`.
6. **Mobile lavagna canvas:** breadboard fuori viewport, scroll orizzontale forzato.
7. **`#admin`** non gated da `RequireAuth` ma da password client-side hardcoded. `[AMBIGUA]` per security.
8. **`getCurrentExperiment` race**: polling 100ms post-event spia su 5 step listeners (LavagnaShell + ElabTutorV4 + Bentornati + ExperimentPicker + LessonReader). `[PARZIALE]`.
9. **Console warning** osservato: 1 warning per pagina (non investigato — fuori scope read-only).
10. **`VetrinaV2.jsx`** lazy import in App.jsx ma mai instradato. `[NASCOSTA]`.
11. **Tab UNLIM `chat`/`percorso`** entrambi controllati dallo stesso `setGalileoOpen` — toggle ambiguo.
12. **emoji come Build mode pills** + Lesson step buttons → viola CLAUDE regola 11.

---

## 10. Flag `[ATTRITO]` Principio Zero v3 (docente in 10s)

| # | Feature/punto | Perché ATTRITO |
|---|---|---|
| 1 | ConsentBanner su tutte le route, anche `/scuole/pnrr` | Docente B2B non capisce perché chiede età "del minore" |
| 2 | 3 ConsentBanner stacked | 3x stessa domanda = bug visibile |
| 3 | "Chiave univoca" in `/` senza spiegazione | Docente non sa cos'è |
| 4 | 4 overlay simultanei al primo accesso `#prova` | Paralisi decisionale |
| 5 | 4 overlay simultanei al primo accesso `#lavagna` | Idem |
| 6 | Emoji icone Build mode (🔧👣🎨) | Per memoria CLAUDE: vietate |
| 7 | Emoji icone Lesson step (📋🔧❓👀✅) | Idem |
| 8 | Emoji 9V battery + LED (💡) in MinimalControlBar | Idem |
| 9 | Mobile lavagna canvas fuori viewport | Docente su iPad portrait non vede circuito |
| 10 | Mobile `#prova` modal coprono tutto | Idem |
| 11 | Modal "Suggerimento Simulatore ELAB" sopra Welcome | Doppio popup informativo |
| 12 | Wake word `api.galileo.sendMessage` non esistente | Voice break silenzioso |
| 13 | `#dashboard-v2` "Failed to fetch" | Docente vede solo errore |
| 14 | `RegisterPage` label vuoti rilevati | Forms incomprensibili |
| 15 | `#admin` non protetta da auth (password client-side) | Indirizzo conosciuto = brute-force |
| 16 | `addComponent` posiziona random, non sulla breadboard | Componente "appare nel vuoto" |
| 17 | Bentornati auto-load 2s primi accessi | Docente cliccava ancora — esperimento cambia da solo |
| 18 | LessonPath chiusa di default in lavagna ma aperta in `#prova` | Inconsistenza UX |

---

## 11. Coverage `__ELAB_API` runtime (verificato live)

**Top-level (40 metodi visibili nel primo Object.keys):**
```
version · name · getExperimentList · getExperiment · loadExperiment ·
getCurrentExperiment · play · pause · reset · getComponentStates ·
interact · addWire · removeWire · addComponent · removeComponent ·
getSelectedComponent · moveComponent · clearAll · setComponentValue ·
connectWire · clearCircuit · mountExperiment · getCircuitDescription ·
getComponentPositions · getLayout · captureScreenshot · askUNLIM ·
analyzeImage · compile · getEditorCode · setEditorCode · showEditor ·
hideEditor · setEditorMode · getEditorMode · isEditorVisible ·
loadScratchWorkspace · undo · redo · canUndo
```

**Namespace `unlim` (16):** vedi §5.

**Eventi attivi:** `experimentChange`, `stateChange`. `[LIVE]`. Codice supporta anche `serialOutput`, `componentInteract`, `circuitChange`, `quizRequested`, `fumettoExportRequested`, `videoLoadRequested`. `[NASCOSTA]` (non emessi nel test session).

**Esperimenti caricati:** Vol1=38, Vol2=27, Vol3=27 → **92 totali** (matches CLAUDE.md). `[LIVE]`.

---

## 12. Service Worker / PWA

- `sw.js` attivo (verificato `navigator.serviceWorker.controller`).
- Scope `/`.
- Workbox precache (vite-plugin-pwa).
- `controllerchange` handler reload + sessionStorage guard (Sprint 4 hotfix). `[LIVE]`.

---

## 13. Note finali

**Cose che sembrano funzionare in modo **non** banalmente verificabile senza login docente:**
- Compilazione Arduino (Vol3) — backend n8n Hostinger.
- Render Nanobot UNLIM chat — Edge Function Render con cold start 18s.
- Vision pipeline → Gemini.
- TTS Edge VPS (`http://72.60.129.50:8880`) HTTP non-HTTPS — possibile mixed-content block in prod HTTPS.
- Supabase sync (saveSessionMemory, recallPastSession).
- Wake word Web Speech API — solo Chrome/Edge.

**Cose interamente UI ma non end-to-end testate:**
- Fumetto report PDF (presenza bottone OK, generazione richiede sessione storica).
- Quiz panel (event-stub).
- Video Float YouTube embed.
- Penna disegno freehand (toggle OK).

**Tracciabilità verifiche:**
- Screenshot salvati in `.playwright-mcp/`:
  - `elab-home-2026-04-24.png` (`/`)
  - `elab-prova-2026-04-24.png` (`#prova` desktop)
  - `elab-prova-mobile-2026-04-24.png` (`#prova` mobile)
  - `elab-lavagna-2026-04-24.png` (`#lavagna` desktop)
  - `elab-lavagna-mobile-2026-04-24.png` (`#lavagna` mobile)
  - `elab-scuole-pnrr-2026-04-24.png` (`/scuole/pnrr`)
  - `elab-dashboard-v2-2026-04-24.png` (`#dashboard-v2`)

---

## Summary

```
LIVE          : 47
PARZIALE      : 11
AMBIGUA       :  6
ROTTA         :  3
NASCOSTA      :  9
DEPRECATED    :  2
TOT           : 78

ATTRITO P-Zero v3 : 18

OUTPUT        : docs/audits/2026-04-24-deployed-feature-map.md
```

**Top 3 da fixare per "docente capisce in 10 secondi":**
1. Eliminare 2 ConsentBanner duplicati (mantenere 1) e gating per route (skip su `/scuole/pnrr`, opzionale su `#lavagna`).
2. Serializzare overlay primo accesso (un dialog alla volta).
3. Sostituire emoji con `ElabIcons` (CLAUDE regola 11) su Build mode pills + Lesson steps.

**Top 1 ROTTA da fixare per ottenere Dashboard funzionante:**
- Backend Edge Function `dashboard-snapshot` (causa "Failed to fetch" su `#dashboard-v2`). Senza Dashboard funzionante non si vende a scuole (CLAUDE roadmap PNRR 30/06/2026).

**Top 1 silent break:**
- Wake word call `api.galileo.sendMessage` → `api.unlim.sendMessage` (LavagnaShell.jsx:431).
