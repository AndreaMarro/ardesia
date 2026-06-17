# SESSIONE LAVAGNA 4/8 — ExperimentPicker + Stato-Driven Panels

## PRINCIPIO ZERO
**L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.**
UNLIM e un assistente INVISIBILE. Il docente non deve capire l'interfaccia, deve insegnare. Zero configurazione. Zero tutorial. Zero click prima di iniziare.

## DESIGN SHELL — LA VISIONE
La Lavagna e una **shell unica**: 95% workspace, 5% chrome. NON un sito web con pagine.
- **Un solo schermo**: simulatore al centro, pannelli flottanti attorno
- **Pannelli come finestre OS**: trascinabili, ridimensionabili, minimizzabili
- **Zero navigazione tra pagine**: tutto accessibile dalla lavagna (picker, video, codice, AI)
- **Stato-driven**: l'interfaccia cambia in base a cosa fai (costruisci→codice→esegui→bloccato)
- **Primo accesso = lavagna pulita**: breadboard vuoto, Galileo dice "Cosa costruiamo?"
- **Riferimenti estetici**: PhET (98% workspace), Tinkercad (parts slide-in), Claude.ai (chat panel), tldraw (floating toolbar)
- **Coerenza con ELAB Tres Jolie**: Kit + Volumi + Tutor = UNICO PRODOTTO. Allineamento visivo obbligatorio.

## ONESTA BRUTALE OBBLIGATORIA
- MAI auto-assegnare score > 7 senza verifica REALE nel browser con screenshot
- Se qualcosa non funziona nel browser, il suo score e 0, non "parziale" o "quasi"
- Se uso hack (auto-click, setTimeout, finti eventi), devo dichiararlo e penalizzare -2
- Ogni feature DEVE essere testata con click reali nel preview, non solo "il codice sembra giusto"
- Se dico "funziona" senza screenshot/snapshot di prova, il score e automaticamente 0

## DEBITI TECNICI EREDITATI DA S1-S3 (NON FIX IN S4)
- S1: FloatingToolbar Select/Wire/Pen non controllano il tool mode del simulatore
- S1: RetractablePanel left ha solo quick-add, non drag-and-drop reale
- S2: ChatOverlay auto-click hack per montare UNLIM
- S2: Welcome screen simulatore ancora visibile sotto la lavagna
- S3: videoId nel catalogo curato sono placeholder (thumbnail YouTube non caricano)
- S3: PiP minimize implementato ma non stress-testato

---

## Stato Ereditato
Score sessione precedente: **S3 reale ~7/10** (auto-score 8.1 probabilmente inflato di ~1 punto)

File creati in src/components/lavagna/:
- AppHeader.jsx + .module.css (glassmorphism, Video + UNLIM toggle)
- FloatingWindow.jsx + .module.css (drag/resize/z-index/localStorage)
- FloatingToolbar.jsx + .module.css (7 icone SVG — 3 non connesse al simulatore)
- RetractablePanel.jsx + .module.css (3 dir, left con quick-add)
- LavagnaShell.jsx + .module.css (assemblaggio)
- GalileoAdapter.jsx + .module.css (UNLIM chat con voice)
- useGalileoChat.js (hook chat)
- VideoFloat.jsx + .module.css (YouTube catalogo + Videocorsi ELAB)

src/data/:
- video-courses.js (9 videocorsi premium)

Test: 1008/1008 PASS | Build: 33 precache, 4016KB

---

## PIANO GENERALE — 8 SESSIONI (da master plan)
```
S1 ✅ AppShell + Header + FloatingWindow + route #lavagna
S2 ✅ Galileo/UNLIM in FloatingWindow (drag/resize/fullscreen)
S3 ✅ VideoFloat (YouTube + catalogo + videocorsi)
S4 → ExperimentPicker + Stato-Driven Panels ← SEI QUI
S5    Dashboard docente come tab nello shell
S6    Dashboard studente + Vetrina V2
S7    Rimozione giochi + dead code + pulizia
S8    Switch #tutor → #lavagna + rimozione vecchio layout
```
**Architettura Strangler Fig**: #lavagna cresce accanto a #tutor (S1-S7). A S8 il vecchio #tutor viene sostituito.
**Regola d'oro**: sessioni 1-4 = ZERO file esistenti modificati (solo file NUOVI in src/components/lavagna/). Solo App.jsx ha 1 riga aggiunta per il route.

## PRIMA DI TUTTO (OBBLIGATORIO, NON SALTARE)
1. Leggi COMPLETAMENTE: `CLAUDE.md`
2. Leggi COMPLETAMENTE: `docs/plans/2026-04-01-lavagna-redesign.md`
3. Leggi COMPLETAMENTE: `docs/plans/2026-04-01-lavagna-master-plan.md`
4. `npm run build && npx vitest run` — DEVE passare. Se FAIL = STOP.
5. `preview_start` → naviga a #tutor → `preview_screenshot` → SALVA come baseline
6. Naviga a #lavagna → `preview_screenshot` → verifica stato attuale
7. `preview_console_logs level=error` → DEVE essere 0

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
- UNLIM INTOCCABILE: 11 file, 2430 LOC — solo wrappare
- ZERO REGRESSIONI: #tutor IDENTICO
- STRANGLER FIG: tutti i file nuovi in src/components/lavagna/
- TOUCH FIRST: pointer events, min 48px target
- CSS MODULES per tutto il nuovo codice
- ZERO EMOJI: usa SVG Feather-style

---

## 10 TASK

### Task 1: ExperimentPicker.jsx — modal selezione esperimenti
- Creare `src/components/lavagna/ExperimentPicker.jsx` + `.module.css`
- Modal overlay con backdrop scuro (click fuori = chiudi)
- 3 tab volume (Lime #4A7A25 / Orange #E8941C / Red #E54B3D)
- Card per ogni esperimento: titolo + icona capitolo + stato (completato/in corso/bloccato)
- Leggere dati REALI da experiments*.json (TROVA i file, non inventare il path)
- Ricerca per nome esperimento (input con clear button)
- Animazione apertura: fade + scale 0.95→1.0, 300ms cubic-bezier
- **STRESS TEST**: aprire/chiudere 5 volte, verificare no memory leak o stato sporco

### Task 2: Colori volume + lucchetti + progress badge
- Volume 1 = #4A7A25, Volume 2 = #E8941C, Volume 3 = #E54B3D
- Volumi bloccati: lucchetto SVG + testo "Sblocca con codice licenza"
- Badge completamento: check verde SVG se fatto, cerchio vuoto se no
- Progress counter per capitolo: "3/7 completati"
- **STRESS TEST**: caricare TUTTI i 62 esperimenti, verificare nomi corretti vs JSON

### Task 3: Click su esperimento = carica nella Lavagna
- PRIMA: trova come __ELAB_API carica un esperimento (leggi simulator-api.js e NewElabSimulator)
- Collegare click card → API reale del simulatore
- Click su card = chiude picker + carica esperimento nel simulatore
- Header aggiorna nome esperimento + progress dots
- **STRESS TEST**: caricare 3 esperimenti diversi in sequenza, verificare che ognuno appare

### Task 4: AUDIT 1/3 — SEVERO
```
CHECKLIST OBBLIGATORIA (ogni punto = screenshot o snapshot):
[ ] npm run build PASS
[ ] npx vitest run — 1008+ PASS
[ ] preview_screenshot #lavagna con picker APERTO — esperimenti visibili
[ ] preview_click su un esperimento — simulatore carica
[ ] preview_screenshot DOPO caricamento — circuito visibile
[ ] preview_screenshot #tutor — IDENTICO alla baseline
[ ] preview_console_logs level=error — 0 errori
[ ] Se QUALCOSA fallisce → STOP, fix, poi riprendi
```

### Task 5: LavagnaStateManager.js — state machine
- Creare `src/components/lavagna/LavagnaStateManager.js`
- 5 stati: BUILD / CODE / RUN / STUCK / CLEAN
- Transizioni basate su eventi __ELAB_API:
  - experimentChange → BUILD
  - codeEditorOpen → CODE
  - simulationStart → RUN
  - galileoExpand (utente chiede aiuto) → STUCK
  - nessun esperimento → CLEAN
- Restituisce: { leftPanel, bottomPanel, galileo, toolbar } per ogni stato
- **STRESS TEST**: loggare ogni transizione in console, verificare che non ci siano loop

### Task 6: Auto-apertura/chiusura pannelli per stato
- BUILD: left panel APERTO (componenti), codice CHIUSO, Galileo minimizzato
- CODE: left panel CHIUSO, codice APERTO, Galileo hints mode
- RUN: left panel CHIUSO, codice ridotto (monitor), Galileo narra output
- STUCK: Galileo si ESPANDE automaticamente, tutto il resto invariato
- CLEAN: tutto chiuso, Galileo dice "Cosa costruiamo?"
- **CRUCIALE**: l'utente puo SEMPRE override manualmente. Lo state manager suggerisce, non forza.
- **STRESS TEST**: cambiare stato 10 volte, verificare che non ci siano pannelli "incastrati"

### Task 7: AUDIT 1/2 — STRESS TEST COMPLETO
```
CHECKLIST OBBLIGATORIA:
[ ] Tutti i punti di AUDIT 1/3 ri-verificati
[ ] preview_resize 1024x768 → picker leggibile su LIM
[ ] preview_resize 1366x768 → Chromebook OK
[ ] Aprire picker, cercare "LED", verificare filtro funziona
[ ] Selezionare esperimento Vol1 → circuito appare
[ ] Selezionare esperimento Vol2 → circuito CAMBIA (non si somma al precedente)
[ ] State machine: caricare esperimento → stato diventa BUILD → left panel si apre
[ ] 3 agenti paralleli: a11y check, visual consistency, performance
[ ] Se QUALCOSA fallisce → STOP, fix, poi riprendi
```

### Task 8: Animazioni transizione stato (300ms)
- Pannelli: apertura/chiusura con transition smooth (opacity + transform)
- No jank, no layout shift (verifica con preview_screenshot prima/dopo)
- **STRESS TEST**: cambiare stato rapidamente 5 volte, screenshot a ogni cambio

### Task 9: Test end-to-end: picker → esperimento → passo passo
- Flow COMPLETO nel browser:
  1. Apri picker dalla header
  2. Seleziona "v1-cap6-esp1" (LED base)
  3. Circuito appare nel simulatore
  4. Left panel si apre (stato BUILD)
  5. Verifica che il simulatore ha i componenti giusti
- **Se il circuito NON appare** = score 0 per l'intera sessione
- **Se il passo passo NON funziona** = penalita -3

### Task 10: AUDIT FINALE — BRUTALE
```
CHECKLIST FINALE (OGNI punto documentato):
[ ] npm run build PASS — precache entries e KB esatti
[ ] npx vitest run — numero test esatto
[ ] preview_console_logs level=error — 0
[ ] #tutor screenshot — IDENTICO a baseline (confronto visivo)
[ ] #lavagna screenshot desktop — tutte le feature visibili
[ ] #lavagna 1024x768 — LIM leggibile
[ ] ExperimentPicker: apri, cerca, seleziona, chiudi — TUTTO nel browser
[ ] State machine: almeno 3 transizioni verificate con screenshot
[ ] 62 esperimenti: almeno 5 caricati e verificati nel simulatore
[ ] Generare LAVAGNA-S5-PROMPT.md
[ ] Aggiornare MEMORY.md con LIMITI ONESTI

SCORE CARD ONESTA:
- Per ogni feature: "Funziona nel browser? SI/NO"
- Se NO = score 0 per quella feature, non "parziale"
- Score finale = media dei SI pesata
- MAI score > 7 senza 10+ screenshot di prova
- Confrontare self-score con evidenze: se evidenze < score, abbassare
```

---

## BENCHMARK TARGET S4 (BRUTALE)

| Metrica | Cosa misuro | Come lo verifico | Se fallisce |
|---------|-------------|-------------------|-------------|
| F1 Build | PASS | `npm run build` output | Score = 0 |
| F2 Test | 1008+ PASS | `npx vitest run` output | Score = 0 |
| F3 Precache | 33 entries +-200KB | Build output | Warning |
| F4 Console | 0 errors | `preview_console_logs` | -2 per errore |
| F5 #tutor | IDENTICO | Screenshot confronto | Score = 0 |
| P1 Picker apre | Click → modal visibile | preview_screenshot | Score = 0 |
| P2 Picker cerca | Input filtra | preview_snapshot dopo input | -1 se non filtra |
| P3 Picker carica | Click → simulatore cambia | preview_screenshot | Score = 0 |
| P4 62 esperimenti | Tutti listati | Contare card nel picker | -1 ogni 5 mancanti |
| S1 State BUILD | Esperimento → left apre | preview_screenshot | -2 |
| S2 State CODE | Editor → left chiude | preview_screenshot | -2 |
| S3 Override utente | Manuale > auto | Chiudi pannello, non riapre | -2 |
| D1 Animazioni | Smooth 300ms | Screenshot prima/dopo | -1 |
| U1 LIM 1024x768 | Tutto leggibile | preview_resize + screenshot | -2 |
| U2 Touch 48px | Tutti i bottoni | preview_inspect su bottoni | -1 per violazione |

**Formula: Se F1-F5 non tutte PASS → Score = 0 (sessione fallita)**
**Se P1 o P3 falliscono → Score max 4/10**
**Target composito ONESTO: >= 7.0/10**
**Se self-score > evidenze + 1.5 → RIFIUTA il self-score e ricalcola**
