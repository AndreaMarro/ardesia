# SESSIONE: Lavagna Completa — PDF Volumi + Penna + Sidebar Intelligente

## CONTESTO ONESTO — Dove siamo DAVVERO

### Cosa funziona (verificato in produzione 03/04/2026):
- **Simulatore**: circuiti V1 si montano e funzionano, 5/5 endpoint HTTP 200
- **UNLIM AI**: 12/12 comandi rispondono, 3 modelli Gemini (flash-lite/flash/pro), RAG 246 chunk
- **Lavagna base**: AppHeader, FloatingToolbar, FloatingWindow, ExperimentPicker, UNLIM chat
- **Test**: 1075 unit + 32 E2E = 1107 PASS, Build ~3555KB
- **Security**: 10/10 injection bloccati, CORS ristretto, admin protetto, GDPR auth
- **Voce italiana**: STT it-IT + TTS browser con ranking voci italiane + 24 comandi vocali

### Cosa NON funziona (onesta brutale):
1. **Penna/DrawingOverlay**: il bottone penna nella FloatingToolbar non attiva il DrawingOverlay. Il file esiste (`src/components/simulator/canvas/DrawingOverlay.jsx`) ma non è collegato alla Lavagna — vive solo dentro il vecchio NewElabSimulator
2. **Sidebar componenti**: mostra 8 componenti fissi (LED, Resistore, Pulsante, Buzzer, Potenziometro, Batteria, Condensatore, Motore) — NON filtrati per volume. Vol.2 ha anche fototransistore, MOSFET, diodo. Vol.3 ha Arduino Nano, servo, LCD
3. **Pannello "Scegli un Volume"**: il vecchio ExperimentPicker del simulatore appare SOPRA il canvas nella Lavagna. Fix parziale applicato (sidebar nascosta) ma il pannello può riapparire
4. **Visualizzazione volumi PDF**: NON ESISTE. Il docente non può aprire le pagine del manuale nella Lavagna
5. **VPS Voxtral TTS**: processo NON in esecuzione sulla porta 8880. Ollama (11434) funziona
6. **Rate limit**: DB conta solo 11/33 richieste (serverless isolation). Il 31° messaggio non viene bloccato
7. **Test flaky**: 5/30 file test falliscono intermittentemente (crypto, consent-minori, edge cases timing)

### Score ONESTO del debug notturno:
- **13/15 benchmark PASS certi** = 8.67/10
- **+1 contestabile** (TTS ritorna 200 ma VPS down, browser fallback funziona) = 9.33/10
- **Range reale: 8.67 — 9.33**

## TASK — 3 feature FONDAMENTALI richieste da Andrea

### 1. VIEWER PDF VOLUMI (Priorità MASSIMA)

**Cosa vuole Andrea**: "Devo poter usufruire e scrivere sui volumi. UNLIM deve poterli vedere e capire le pagine."

**I 3 manuali**:
```
/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf
/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf
/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/MANUALE VOLUME 3 WORD.odt  ← nota: ODT, non PDF
```

**Architettura suggerita**:
1. **FloatingWindow "Volume"** — nuovo pannello nella Lavagna che mostra le pagine del PDF
2. Usa `react-pdf` (già nel bundle — `react-pdf.browser-C6vP9pHX.js` da 1485KB nel build!)
3. Il PDF viene caricato da una URL (Supabase Storage o asset statico in `public/`)
4. Navigazione: prev/next pagina, zoom, miniature
5. **Layer annotazione** sopra il PDF — il docente può scrivere con la penna
6. **UNLIM vede la pagina**: quando il docente è su una pagina, UNLIM riceve il contesto (già nel RAG per chunk testuale, ma ora anche visivo)

**Decisioni architetturali**:
- I PDF vanno in `public/volumes/` (asset statici) o su Supabase Storage?
- Il Vol.3 è ODT — va convertito in PDF prima
- react-pdf è GIÀ importato nel progetto (ChatOverlay lo usa per il report fumetto)

### 2. STRUMENTI PENNA (Priorità ALTA)

**Cosa non va**: il bottone "Penna" nella FloatingToolbar (`src/components/lavagna/FloatingToolbar.jsx`) ha un click handler che fa `setActiveTool('pen')` ma NON apre il DrawingOverlay.

**Il DrawingOverlay esiste**: `src/components/simulator/canvas/DrawingOverlay.jsx` — penna smooth bezier, 3 spessori, 5 colori, fullscreen. Ma è collegato solo al vecchio simulatore (NewElabSimulator).

**Fix necessario**:
1. Importare DrawingOverlay nella LavagnaShell
2. Collegare il bottone penna al DrawingOverlay
3. Aggiungere undo/redo per i tratti (attualmente mancante — richiesto in sessioni precedenti)
4. L'annotazione deve funzionare SOPRA il simulatore E sopra il PDF viewer

### 3. SIDEBAR COMPONENTI INTELLIGENTE (Priorità ALTA)

**Cosa non va**: la sidebar mostra 8 componenti fissi indipendentemente dal volume:
- LED, Resistore, Pulsante, Buzzer, Potenziometro, Batteria 9V, Condensatore, Motore DC

**Cosa serve**:
- **Vol.1** (Le Basi): LED, Resistore, Pulsante, Batteria 9V, Potenziometro, Condensatore, LDR
- **Vol.2** (Approfondiamo): + Buzzer, Motore DC, Fototransistore, MOSFET, Diodo, ReedSwitch
- **Vol.3** (Arduino): + Arduino Nano, Servo, LCD 16x2 (tutti i componenti disponibili)

**I componenti SVG che MANCANO nella sidebar** (esistono nel simulatore ma non nella sidebar):
- `Phototransistor.jsx` → nessuna icona nella sidebar
- `MosfetN.jsx` → nessuna icona
- `Diode.jsx` → nessuna icona
- `ReedSwitch.jsx` → nessuna icona
- `PhotoResistor.jsx` → nessuna icona (esiste nel simulatore come LDR)
- `NanoR4Board.jsx` → nessuna icona
- `Servo.jsx` → nessuna icona
- `LCD16x2.jsx` → nessuna icona
- `RgbLed.jsx` → nessuna icona

**Fix**: `buildQuickComponents()` in LavagnaShell.jsx deve accettare il volume corrente e filtrare

## CONTEXT FILES — Leggi TUTTI

```
CLAUDE.md                                          — Stack, palette, regole engine
src/components/lavagna/LavagnaShell.jsx            — Shell principale (include buildQuickComponents)
src/components/lavagna/FloatingToolbar.jsx          — Toolbar con bottone penna
src/components/lavagna/FloatingWindow.jsx           — Contenitore pannelli draggabili
src/components/lavagna/RetractablePanel.jsx         — Sidebar ritraibile
src/components/simulator/canvas/DrawingOverlay.jsx  — Penna esistente (da collegare)
src/components/simulator/NewElabSimulator.jsx       — Simulatore (sidebar da nascondere in lavagna)
src/components/simulator/components/registry.js     — Registry tutti i componenti SVG
src/data/experiments-vol1.js                        — 38 esperimenti Vol.1
src/data/experiments-vol2.js                        — 18 esperimenti Vol.2
src/data/experiments-vol3.js                        — 6 esperimenti Vol.3
```

## ESTETICA & PRINCIPI

1. **Principio Zero**: solo il docente usa UNLIM. Gli studenti vedono il simulatore/volume sulla LIM
2. **Palette**: Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D
3. **Font**: Oswald per titoli, Open Sans per body. Min 13px
4. **Touch**: min 44px per elementi interattivi (WCAG AA)
5. **No overlay cognitivo**: pannelli manipolabili, allargabili, nascondibili, ritrovabili
6. **Estetica Tinkercad**: componenti SVG devono sembrare elettronica reale

## REGOLE

1. **Engine intoccabile**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js
2. **Zero regressioni**: `npx vitest run` (1075+ PASS) e `npm run build` devono passare PRIMA e DOPO ogni fix
3. **Modalità notturna**: Andrea non è al computer. Non chiedere conferme. Fai tutto autonomamente.
4. **Test**: scrivi test per ogni feature nuova
5. **Deploy**: `npm run build && npx vercel --prod --yes`

## PIANO — 8 Cicli

### Ciclo 1: PDF Viewer base
- Copia i 2 PDF (Vol1, Vol2) in `public/volumes/` (Vol3 è ODT, convertire o saltare)
- Crea `VolumeViewer.jsx` dentro `src/components/lavagna/` usando react-pdf
- FloatingWindow wrapper con navigazione pagina prev/next
- Bottone "Volume" nell'AppHeader per aprire/chiudere

### Ciclo 2: Navigazione PDF avanzata
- Thumbnails laterali (miniature pagine)
- Zoom pinch/scroll
- Ricerca testo nel PDF
- Il volume aperto corrisponde al volume dell'esperimento selezionato

### Ciclo 3: Annotazione su PDF
- Layer canvas trasparente sopra la pagina PDF
- Penna con 3 spessori, 5 colori (palette ELAB)
- Evidenziatore semitrasparente
- Eraser
- Le annotazioni si salvano in localStorage per pagina

### Ciclo 4: Collegare DrawingOverlay alla Lavagna
- Importare DrawingOverlay in LavagnaShell
- Bottone penna della FloatingToolbar → apre DrawingOverlay
- DrawingOverlay funziona sopra IL SIMULATORE (non solo il PDF)
- Undo/redo tratti

### Ciclo 5: Sidebar componenti per volume
- `buildQuickComponents(prefix, volume)` — filtra per volume
- Vol.1: 7 componenti base
- Vol.2: +5 componenti avanzati (con nuove icone SVG)
- Vol.3: +3 componenti Arduino (con icone)
- Aggiornare `handleExperimentSelect` per passare il volume alla sidebar

### Ciclo 6: Icone SVG mancanti
- Creare icone 28x28 per: Fototransistore, MOSFET, Diodo, ReedSwitch, LDR, Arduino Nano, Servo, LCD, RGB LED
- Stile coerente con le icone esistenti (gradienti, realismo)
- Test: ogni componente deve avere un'icona nella sidebar

### Ciclo 7: UNLIM contestuale al volume
- Quando il docente è su una pagina del volume, inviare il contesto a UNLIM
- "Sei sulla pagina X del Volume Y — l'argomento è Z"
- UNLIM può suggerire: "Mostra ai ragazzi il diagramma a pagina 23 e chiedi cosa notano"

### Ciclo 8: Test + Deploy + Stress
- 10 nuovi test: PDF viewer, sidebar filtrata, penna, annotazione
- Stress: apri Volume + Simulatore + UNLIM + Penna contemporaneamente → 0 crash
- Deploy produzione
- Verifica su LIM 1024x768

## VPS VOXTRAL — Istruzioni per Andrea

```bash
# Sul VPS (72.60.129.50):
python3 -m venv ~/voxtral-env
source ~/voxtral-env/bin/activate
pip install fastapi uvicorn

# Opzione A: Voxtral completo (richiede GPU/molta RAM)
pip install transformers torch torchaudio
# Copia lo script:
scp "VOLUME 3/PRODOTTO/elab-builder/supabase/vps-scripts/voxtral-tts-server.py" root@72.60.129.50:~/
nohup uvicorn voxtral-tts-server:app --host 0.0.0.0 --port 8880 &

# Opzione B: gTTS leggero (funziona su qualsiasi VPS, niente GPU)
pip install gtts
# Serve uno script gTTS server — chiedere nella prossima sessione
```

## CREDENZIALI
```
Supabase:      euqpdueopmlllqjmqnyb / sbp_REVOKED_20260423_REDACTED
Gemini:        [REDACTED_GOOGLE_API_KEY]
VPS:           72.60.129.50 (Ollama :11434 ✓, Voxtral :8880 ✗)
Admin:         #admin → [REDACTED-MOVED-TO-ENV]
Vercel Prod:   https://elab-builder.vercel.app
Anon Key:      [REDACTED_JWT]
```

## OUTPUT ATTESO
1. VolumeViewer.jsx con react-pdf, navigazione, annotazione
2. DrawingOverlay collegato alla FloatingToolbar
3. Sidebar componenti filtrata per volume con 9 nuove icone SVG
4. UNLIM contestuale alla pagina del volume
5. 10+ nuovi test
6. Deploy produzione funzionante
7. Il docente può: aprire il volume, scrivere sopra, chiedere a UNLIM, montare il circuito — tutto nella stessa Lavagna
