# MEGA-PROMPT LAVAGNA S4→S8 — Esecuzione Autonoma Continua

## ISTRUZIONI DI AVVIO — COPIA TUTTO QUESTO BLOCCO IN UNA NUOVA SESSIONE

```
Leggi COMPLETAMENTE questi file PRIMA di qualsiasi azione:
1. CLAUDE.md
2. docs/plans/2026-04-01-lavagna-redesign.md
3. docs/plans/2026-04-01-lavagna-master-plan.md
4. docs/prompts/LAVAGNA-MEGA-S4-S8.md
5. automa/PDR.md (i 16 aspetti del piano)

Poi:
/ralph-loop "Leggi docs/prompts/LAVAGNA-MEGA-S4-S8.md e esegui la sessione corrente. Controlla MEMORY.md per sapere a che sessione sei. Esegui TUTTI i task con audit severi, CoV, stress test, e onesta brutale. Quando finisci una sessione passa alla successiva. NON fermarti MAI." --max-iterations 50 --completion-promise "LAVAGNA S8 COMPLETATA"
```

---

## ANALISI CONTESTO — ULTIME 15 SESSIONI (G6→Lavagna S3)

Queste sessioni hanno costruito il prodotto che stai migliorando. LEGGILE per capire il perche di ogni scelta.

### Fase "UNLIM Onnipotente" (G6→G17, 27-28/03/2026)
- **G6**: Vol 1 completo (38/38 esperimenti), 9 lesson paths
- **G10**: studentTracker.js (bridge eventi→localStorage), WCAG Lime #4A7A25
- **G11**: #prova senza login, deep-link esperimenti, PWA 16MB→4MB (-75%), Toast non-bloccanti
- **G12**: Progressive Disclosure (toolbar 14→3 bottoni), sidebar default chiusa, fontSize 54→2 fix
- **G13**: Mascotte robot reale (PNG), messaggi contestuali posizionati accanto ai componenti
- **G14**: TTS+STT integrati, 3 domande live testate via Playwright, Galileo risponde con voce
- **G16**: Sessioni salvate (useSessionTracker), classProfile per contesto AI, welcome contestuale
- **G17**: Report fumetto ELAB, Error Boundary UNLIM, deploy Vercel

### Fase "Piano 5 Sessioni" (31/03-01/04/2026)
- **Sessione 1/5**: simulator-api.js +5 metodi, autoPlacement, 24 comandi vocali, INTENT system, circuitContext
- **Sessione 2/5**: CSS Module refactor UNLIM (-87% inline), ElabIcons 24 SVG, report fumetto riscritto
- **Sessione 3/5**: Supabase schema 8 tabelle, offline queue, unlimMemory 3 tier, TeacherDashboard cloud
- **Sessione 4/5**: NanoR4Board SVG bellezza, HEX 100% copertura, Scratch palette ELAB, offline migliorato
- **Sessione 5/5**: TTS voce naturale, integration test 10+7 passi, 6.1MB dead images rimossi, audit 5 agenti → **6.4/10 reale**

### Fase "Lavagna Redesign" (01-02/04/2026)
- **S1**: AppShell + AppHeader glassmorphism + FloatingWindow + RetractablePanel + FloatingToolbar + route #lavagna
- **S2**: GalileoAdapter (UNLIM in FloatingWindow), useGalileoChat, voice STT/TTS, action execution
- **S3**: VideoFloat (YouTube catalogo + ricerca + Videocorsi ELAB premium + PiP), Video button in header

### LEZIONE CHIAVE da queste sessioni:
- **Score inflation e il nemico #1**: G45 auto-score 8.6 → reale 5.8 (differenza +2.8!)
- **Dashboard senza backend = shell vuota**: Supabase schema pronto ma non configurato
- **UNLIM auto-explain 232 parole + hallucination**: fix client-side necessario
- **L'insegnante (PDR aspetto #6) e a 3.5/10**: UNICO aspetto criticamente basso
- **Il simulatore FUNZIONA (10/10)**: non romperlo. Zero regressioni.
- **Hack accumulati**: auto-click UNLIM, welcome screen visibile, toolbar non connessa

---

## ANTI-CONTEXT-ROT — IL LOOP NON PERDE MAI IL FILO

### Problema: nelle sessioni lunghe il contesto si degrada. Soluzioni:

1. **FILE DI STATO PERSISTENTE** — aggiorna SEMPRE a meta e fine sessione:
   ```
   docs/prompts/LAVAGNA-CURRENT-STATE.md
   ```
   Contiene: sessione corrente, task completati, task in corso, blocker, score parziale

2. **MEMORY.md = fonte di verita globale** — aggiorna a fine sessione

3. **GIT COMMIT OGNI TASK** — cosi il prossimo loop vede la storia:
   ```
   git log --oneline -20
   ```

4. **RILEGGI ALL'INIZIO DI OGNI ITERAZIONE**:
   ```
   1. cat MEMORY.md | head -200
   2. cat docs/prompts/LAVAGNA-CURRENT-STATE.md
   3. git log --oneline -20
   4. npm run build (verifica che non e rotto)
   ```

5. **CHECKPOINT OGNI 3 TASK** — salva stato su disco, non solo in memoria

6. **MAI assumere che il codice sia come lo ricordi** — LEGGI il file prima di modificarlo

7. **Se non ricordi cosa hai fatto** → leggi git log, non inventare

---

## LOOP AUTONOMO — REGOLE

Questo prompt e progettato per girare in **Ralph Loop** (`/ralph-loop`).
Ogni iterazione del loop:
1. Leggi MEMORY.md per capire a che sessione sei (S4? S5? S6?...)
2. Esegui i task della sessione corrente
3. Audit finale con CoV
4. Aggiorna MEMORY.md con score e limiti onesti
5. Passa alla sessione successiva
6. Se un audit FALLISCE: fix il problema, ri-testa, poi continua
7. Se bloccato dopo 3 tentativi: documenta il limite e vai avanti

**Il loop NON si ferma finche:**
- TUTTE le sessioni S4→S8 sono completate
- Il vecchio #tutor e stato sostituito da #lavagna
- Il simulatore Arduino + Scratch + UNLIM sono hyper-testati
- Il piano automa (PDR 16 aspetti) e allineato con i target

**Output `<promise>LAVAGNA S8 COMPLETATA</promise>` SOLO quando tutto e VERO.**

---

## MANTENIMENTO CONTESTO — TECNICHE OBBLIGATORIE

Il loop puo durare molte iterazioni. Per non perdere contesto:

1. **MEMORY.md e la fonte di verita**: aggiornalo a FINE di ogni sessione con:
   - Sessione completata (numero + score)
   - File creati/modificati
   - Debiti tecnici aperti
   - Score onesto post-CoV

2. **State file**: a meta sessione, scrivi lo stato corrente in:
   `docs/prompts/LAVAGNA-CURRENT-STATE.md` — cosa hai fatto, cosa manca, dove sei

3. **Git commit frequenti**: commit dopo ogni task completato (non alla fine)
   - Pattern: `feat(lavagna-S{N}): task {M} — {descrizione}`
   - Cosi il loop successivo vede la storia nel git log

4. **TodoWrite**: usa SEMPRE il todo list per tracciare i task della sessione corrente

5. **Rileggi all'inizio**: ogni iterazione del loop DEVE iniziare leggendo:
   - MEMORY.md (stato globale)
   - docs/prompts/LAVAGNA-CURRENT-STATE.md (stato sessione)
   - git log --oneline -20 (storia recente)

---

## SKILLS ELAB DA USARE E ADATTARE

### Skills esistenti da invocare:
```
/elab-quality-gate     — gate pre/mid/post sessione (build + test + precache)
/quality-audit         — audit end-to-end con agenti
/arduino-simulator     — test compilatore + AVR emulation
/tinkercad-simulator   — test simulatore visuale
/nano-breakout         — test hardware NanoBreakout
/analisi-simulatore    — analisi approfondita CircuitSolver, AVRBridge, canvas
/analisi-galileo       — analisi tutor AI Galileo
/ricerca-bug           — ricerca sistematica bug e regressioni
/lavagna-benchmark     — benchmark 15 metriche (1/3, 1/2, fine)
/lim-simulator         — test LIM 1024x768
/impersonatore-utente  — impersona docente 55 anni per test Principio Zero
/volume-replication    — verifica parita con volumi fisici ELAB
```

### Skills da creare/adattare con /skill-factory se mancanti:
- Se manca una skill per testare Scratch blocks → creala
- Se manca una skill per testare UNLIM voice commands → creala
- Se manca una skill per testare il flow docente completo → creala
- Usa `/skill-factory` per creare skill specifiche per ogni sessione

### Hyper-test obbligatori (OGNI sessione):

**Simulatore Arduino:**
- Compilare almeno 3 sketch diversi (Blink, AnalogRead, SerialPrint)
- Verificare che AVR emulation produce output corretto
- Verificare che pin mapping e corretto (D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC)

**Scratch:**
- Verificare che TUTTI i blocchi ELAB palette funzionano
- Verificare che la traduzione Scratch→C++ e corretta
- Verificare categorie kid-friendly in italiano

**UNLIM:**
- Testare almeno 5 comandi vocali
- Verificare che INTENT system funziona (AI controlla simulatore)
- Verificare che circuitContext e aggiornato
- Verificare che mascotte SVG appare con mood corretto

---

## INTEGRAZIONE PIANO AUTOMA

Il piano automa (`automa/PDR.md`) e il piano Lavagna devono convergere.
Il loop NON si ferma finche i target PDR non sono raggiunti:

| Aspetto PDR | Target | Verificato come |
|-------------|--------|-----------------|
| Simulatore funzionalita (1) | 10/10 mantenuto | 62 esperimenti caricabili |
| Simulatore estetica (2) | >= 9/10 | Shell 95% workspace |
| iPad + LIM (3) | >= 9.5/10 | Touch 48px + LIM 1024x768 |
| Arduino/Scratch (4) | 10/10 mantenuto | Compilazione + blocchi OK |
| AI Galileo (5) | 10/10 mantenuto | UNLIM voice + intent OK |
| **Insegnante (6)** | **>= 7/10** | **Picker + Dashboard + Principio Zero** |
| Design/UX (11) | >= 9/10 | Glassmorphism + animazioni |

---

## PRINCIPIO ZERO (OGNI SESSIONE)
**L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.**
UNLIM e un assistente INVISIBILE. Il docente non deve capire l'interfaccia, deve insegnare. Zero configurazione. Zero tutorial. Zero click prima di iniziare.

## DESIGN SHELL — LA VISIONE (OGNI SESSIONE)
La Lavagna e una **shell unica**: 95% workspace, 5% chrome. NON un sito web con pagine.
- **Un solo schermo**: simulatore al centro, pannelli flottanti attorno
- **Pannelli come finestre OS**: trascinabili, ridimensionabili, minimizzabili
- **Zero navigazione tra pagine**: tutto accessibile dalla lavagna (picker, video, codice, AI)
- **Stato-driven**: l'interfaccia cambia in base a cosa fai (costruisci→codice→esegui→bloccato)
- **Primo accesso = lavagna pulita**: breadboard vuoto, Galileo dice "Cosa costruiamo?"
- **Riferimenti estetici**: PhET (98% workspace), Tinkercad (parts slide-in), Claude.ai (chat panel), tldraw (floating toolbar)
- **Coerenza con ELAB Tres Jolie**: Kit + Volumi + Tutor = UNICO PRODOTTO. Allineamento visivo obbligatorio.

## OBIETTIVI DAL PIANO AUTOMA (PDR — `automa/PDR.md`)

Il PDR (Piano di Riferimento) definisce 16 aspetti del prodotto. La Lavagna deve migliorare QUESTI numeri:

| # | Aspetto | Score PRE-Lavagna | Target POST-S8 | Come la Lavagna aiuta |
|---|---------|-------------------|-----------------|----------------------|
| 1 | Simulatore funzionalita | 10/10 | 10/10 | NON rompere. Zero regressioni. |
| 2 | Simulatore estetica | 8.5/10 | 9/10 | Shell pulita, 95% workspace |
| 3 | iPad + LIM | 8.8/10 | 9.5/10 | Touch-first, 48px targets, responsive |
| 4 | Arduino/Scratch/C++ | 10/10 | 10/10 | Wrappato in RetractablePanel bottom |
| 5 | AI / Galileo | 10/10 | 10/10 | FloatingWindow stile Claude.ai |
| **6** | **Insegnante — UTENTE REALE** | **3.5/10** | **7/10** | **ExperimentPicker + Dashboard tab + Principio Zero** |
| 7 | Contenuti / Percorso | 9.5/10 | 9.5/10 | 62 esperimenti nel picker |
| 8 | Performance | 8/10 | 8.5/10 | Code splitting, lazy loading |
| 9 | PWA / Offline | 7/10 | 7.5/10 | Precache stabile |
| 10 | Sicurezza / A11y | 9.2/10 | 9.5/10 | WCAG AA, aria-labels, focus ring |
| 11 | Design / UX | 8/10 | 9/10 | Glassmorphism, animazioni, coerenza |
| 12 | i18n | 0/10 | 0/10 | NON in scope |
| 13 | Business / Mercato | 1/10 | 2/10 | VetrinaV2 (S6) |

**IL SINGOLO OBIETTIVO PIU IMPORTANTE: portare "Insegnante" da 3.5 a 7+.**
- Il docente inesperto DEVE poter usare ELAB senza formazione
- ExperimentPicker (S4) = il docente trova gli esperimenti senza navigazione
- Dashboard tab (S5) = il docente vede i progressi senza cambiare app
- Stato-driven (S4) = la lavagna si adatta automaticamente a cosa sta facendo
- Principio Zero = zero click prima di iniziare

### Vincoli non negoziabili dal PDR:
1. Zero regressioni (`npm run build` sempre verde)
2. L'insegnante inesperto e il vero utente
3. Andrea Marro e l'autore di tutto
4. iPad e LIM centrali (touch >=48px, font >=14px)
5. Linguaggio per bambini 10-14 anni
6. CoV su ogni output
7. Massima onesta — numeri reali, mai compiacenza

### Knowledge base automa da consultare se bloccato:
- `automa/knowledge/research-ux-lim.md` — Font 28pt min LIM, split-attention fix
- `automa/knowledge/research-browser-testing.md` — 10 test Playwright, BackstopJS, axe-core
- `automa/knowledge/research-performance.md` — DOM thrashing, will-change iPad, Worker solver
- `automa/knowledge/brainstorm-teacher-scaffolding.md` — 20 esempi teacher-mode

**AD OGNI TASK chiediti**: "Questo migliora il score 'Insegnante' del PDR? Se no, perche lo sto facendo?"

## ONESTA BRUTALE CON TE STESSO (OGNI SESSIONE)

**Sei un AI. Hai un bias naturale verso l'ottimismo e la compiacenza. COMBATTILO ATTIVAMENTE.**

### Regole anti-inflazione:
- MAI auto-assegnare score > 7 senza verifica REALE nel browser con screenshot
- Se qualcosa non funziona nel browser, il suo score e 0, non "parziale" o "quasi"
- Se uso hack (auto-click, setTimeout, finti eventi), devo dichiararlo e penalizzare -2
- Ogni feature DEVE essere testata con click reali nel preview, non solo "il codice sembra giusto"
- Se dico "funziona" senza screenshot/snapshot di prova, il score e automaticamente 0
- Se self-score > evidenze + 1.5 → RIFIUTA il self-score e ricalcola

### Domande da farti PRIMA di assegnare ogni score:
1. "Ho testato QUESTA ESATTA feature nel browser con un click reale?" — se no, score = 0
2. "Un docente di 55 anni che non sa cos'e un browser potrebbe usare questo?" — se no, Principio Zero violato
3. "Sto dando un voto alto perche funziona DAVVERO o perche ho scritto il codice e mi sembra giusto?" — il codice NON e prova
4. "Se Andrea vedesse questo nel browser, direbbe 'bello' o 'ma non funziona'?" — sii onesto
5. "Sto nascondendo un limite dietro parole come 'parziale', 'quasi pronto', 'funziona in parte'?" — queste sono BUGIE. O funziona o non funziona.

### Pattern di auto-inganno da riconoscere:
- "Il codice e corretto quindi funziona" → NO. Il codice puo essere corretto e non funzionare nel browser.
- "Funziona nel test" → I test passano ma il browser puo avere comportamento diverso. TESTA nel browser.
- "Non ho potuto testare X per limitazioni del tool" → Dichiaralo e assegna score 0 per X.
- "Piccolo hack necessario" → Dichiaralo, penalizza -2, e aggiungi ai debiti tecnici.
- "Score 8.5/10" dopo aver testato solo 3 feature su 10 → Il score copre TUTTO, non solo quello che hai testato.

### Storico inflazione (IMPARA DA QUESTI):
- S3 auto-score 8.1 → reale ~7 (inflato +1.1)
- G45 auto-score 8.6 → reale 5.8 (inflato +2.8!!!)
- G20 audit: 6.2/10 reale vs auto-score molto piu alto
- **Pattern: ogni sessione infla di 1-2 punti. ASPETTALO e correggilo.**

### PARITA CON IL PRODOTTO FISICO ELAB
Il kit ELAB nella cartella Tres Jolie e un prodotto FISICO bellissimo. I volumi sono stampati con cura. Il packaging e professionale. La Lavagna DEVE sembrare parte dello STESSO prodotto.
- Se la Lavagna sembra "un progetto di uno studente" → FALLIMENTO
- Se la Lavagna sembra "un prodotto professionale venduto a scuole" → SUCCESSO
- Confronta OGNI screenshot con le foto in `ELAB - TRES JOLIE/FOTO/` e `RENDERING SCATOLE/`
- I colori DEVONO essere gli stessi dei volumi fisici (Lime, Orange, Red)
- Il logo DEVE essere coerente con `ELAB - TRES JOLIE/LOGO/`

---

## PIANO GENERALE — 8 SESSIONI
```
S1 ✅ AppShell + Header + FloatingWindow + route #lavagna
S2 ✅ Galileo/UNLIM in FloatingWindow (drag/resize/fullscreen)
S3 ✅ VideoFloat (YouTube + catalogo + videocorsi)
S4 → ExperimentPicker + Stato-Driven Panels
S5    Dashboard docente come tab nello shell
S6    Dashboard studente + Vetrina V2
S7    Rimozione giochi + dead code + pulizia
S8    Switch #tutor → #lavagna + rimozione vecchio layout
```
**Architettura Strangler Fig**: #lavagna cresce accanto a #tutor (S1-S7). A S8 il vecchio #tutor viene sostituito.
**Regola d'oro S1-S4**: ZERO file esistenti modificati (solo NUOVI in src/components/lavagna/).
**Regola d'oro S5-S6**: solo file adapter/wrapper nuovi.
**Regola d'oro S7-S8**: solo rimozione (sottrarre, non aggiungere).

## DEBITI TECNICI EREDITATI DA S1-S3 (NON FIX FINO A S7)
- S1: FloatingToolbar Select/Wire/Pen non controllano il tool mode del simulatore
- S1: RetractablePanel left ha solo quick-add, non drag-and-drop reale
- S2: ChatOverlay auto-click hack per montare UNLIM
- S2: Welcome screen simulatore ancora visibile sotto la lavagna
- S3: videoId nel catalogo curato sono placeholder (thumbnail YouTube non caricano)
- S3: PiP minimize implementato ma non stress-testato

---

## REGOLE ESECUZIONE (OGNI SESSIONE)
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
- ZERO REGRESSIONI: #tutor IDENTICO (fino a S8)
- STRANGLER FIG: solo file NUOVI in src/components/lavagna/ (S1-S6)
- TOUCH FIRST: pointer events, min 48px target
- CSS MODULES per tutto il nuovo codice
- ZERO EMOJI: usa SVG Feather-style

### TOOL DI TEST — USALI TUTTI, NON SALTARE
```
preview_start / preview_screenshot / preview_click / preview_fill  — TEST PRIMARIO per ogni feature
preview_snapshot    — accessibility tree: verifica aria-labels, ruoli, struttura
preview_inspect     — CSS values: font-size, min-height, color, contrast
preview_eval        — debug JS: stato React, memory, eventi, DOM queries
preview_resize      — responsive: 1024x768 (LIM), 1366x768 (Chromebook), 375x812 (mobile)
preview_console_logs — errori runtime: DEVE essere 0 a fine sessione
preview_network     — verificare che non ci siano fetch fallite
Control Chrome      — test nel browser REALE quando preview non basta
Playwright (agenti) — test automatizzati: drag, touch simulation, click sequence
```

**REGOLA: MAPPA TUTTO, TESTA TUTTO.**
Prima di scrivere codice per una feature:
1. Identifica TUTTI gli elementi interattivi che verranno creati (bottoni, input, pannelli, modal)
2. Per OGNUNO, scrivi cosa testerai e con quale tool
3. Dopo aver scritto il codice, esegui OGNI test pianificato
4. Se un test non e possibile (tool limitation), dichiaralo e proponi alternativa

**Esempio mappa test per ExperimentPicker:**
```
| Elemento | Test | Tool | Criterio |
|----------|------|------|----------|
| Backdrop click | Click fuori chiude | preview_click + preview_snapshot | Modal sparisce |
| Tab Volume 1 | Click seleziona | preview_click | Cards Vol1 visibili |
| Tab Volume 2 | Click seleziona | preview_click | Cards Vol2 visibili |
| Search input | Digitare "LED" | preview_fill + preview_snapshot | Solo LED visibili |
| Card esperimento | Click carica | preview_click + preview_screenshot | Simulatore cambia |
| Close button | Click chiude | preview_click + preview_snapshot | Modal sparisce |
| LIM 1024x768 | Resize | preview_resize + preview_screenshot | Tutto leggibile |
| Touch 48px | Inspect | preview_inspect min-height su ogni button | >= 48px |
| Aria labels | Snapshot | preview_snapshot | Ogni elemento ha label |
| Font size | Inspect | preview_inspect font-size | >= 14px |
| Contrast | Inspect | preview_inspect color vs background | WCAG AA |
```

### Prima di OGNI sessione
1. Leggi `CLAUDE.md` + design doc + master plan
2. `npm run build && npx vitest run` — DEVE passare
3. `preview_start` → #tutor screenshot (baseline) → #lavagna screenshot (stato attuale)
4. `preview_console_logs level=error` → DEVE essere 0

### Dopo OGNI sessione
1. Build + test PASS
2. Audit finale con checklist screenshot
3. Score card ONESTA
4. Genera prompt sessione successiva
5. Aggiorna MEMORY.md con limiti onesti
6. **Passa alla sessione successiva SENZA fermarti**

---

## ═══════════════════════════════════════════
## SESSIONE 4/8 — ExperimentPicker + Stato-Driven Panels
## ═══════════════════════════════════════════

### Task 4.1: ExperimentPicker.jsx — modal selezione esperimenti
- Creare `src/components/lavagna/ExperimentPicker.jsx` + `.module.css`
- Modal overlay con backdrop scuro (click fuori = chiudi)
- 3 tab volume (Lime #4A7A25 / Orange #E8941C / Red #E54B3D)
- Card per ogni esperimento: titolo + icona capitolo + stato (completato/in corso/bloccato)
- Leggere dati REALI da experiments*.json (TROVA i file, non inventare il path)
- Ricerca per nome esperimento (input con clear button)
- Animazione apertura: fade + scale 0.95→1.0, 300ms cubic-bezier
- **STRESS TEST**: aprire/chiudere 5 volte nel browser

### Task 4.2: Colori volume + lucchetti + progress badge
- Volume 1 = #4A7A25, Volume 2 = #E8941C, Volume 3 = #E54B3D
- Volumi bloccati: lucchetto SVG + "Sblocca con codice licenza"
- Badge completamento: check verde SVG / cerchio vuoto
- Progress counter: "3/7 completati"
- **STRESS TEST**: verificare TUTTI i 62 esperimenti listati correttamente

### Task 4.3: Click su esperimento = carica nella Lavagna
- PRIMA: leggi simulator-api.js e NewElabSimulator per capire come caricare esperimenti
- Click card → API reale → chiude picker → simulatore cambia
- Header aggiorna nome + progress dots
- **STRESS TEST**: caricare 3 esperimenti diversi in sequenza

### Task 4.4: AUDIT 1/3 — SEVERO
```
[ ] build PASS | test 1008+ PASS
[ ] screenshot #lavagna con picker APERTO
[ ] click esperimento → screenshot circuito visibile
[ ] screenshot #tutor IDENTICO baseline
[ ] console errors = 0
```

### Task 4.5: LavagnaStateManager.js — state machine
- 5 stati: BUILD / CODE / RUN / STUCK / CLEAN
- Transizioni da eventi __ELAB_API
- Output: { leftPanel, bottomPanel, galileo, toolbar }
- **STRESS TEST**: log transizioni, verificare no loop

### Task 4.6: Auto-apertura/chiusura pannelli per stato
- BUILD: left APERTO, codice CHIUSO, Galileo minimizzato
- CODE: left CHIUSO, codice APERTO
- RUN: codice ridotto (monitor)
- STUCK: Galileo si ESPANDE
- CLEAN: tutto chiuso
- **CRUCIALE**: utente puo SEMPRE override manualmente
- **STRESS TEST**: 10 cambi stato, nessun pannello incastrato

### Task 4.7: AUDIT 1/2 — STRESS
```
[ ] tutti punti 1/3 + resize 1024x768 + 1366x768
[ ] picker cerca "LED" → filtra
[ ] seleziona Vol1 → circuito appare
[ ] seleziona Vol2 → circuito CAMBIA
[ ] state machine: esperimento → BUILD → left apre
```

### Task 4.8: Animazioni transizione stato (300ms)
### Task 4.9: Test e2e: picker → esperimento → passo passo nel browser
### Task 4.10: AUDIT FINALE S4 + genera S5 prompt + MEMORY

---

## ═══════════════════════════════════════════
## SESSIONE 5/8 — Dashboard Docente come Tab
## ═══════════════════════════════════════════

### Task 5.1: Tab "Classe" nella AppHeader
- Solo per ruolo docente (controlla auth state)
- Tab in AppHeader: "Lavagna" | "Classe"
- Click "Classe" → body mostra dashboard, non simulatore
- Click "Lavagna" → torna al simulatore (stato preservato)

### Task 5.2: Wrappare TeacherDashboard nel body
- NON modificare TeacherDashboard.jsx — solo wrapparlo
- Creare `src/components/lavagna/DashboardAdapter.jsx` + `.module.css`
- Transizione Lavagna ↔ Classe con fade 300ms
- Stato simulatore PRESERVATO quando si va in Classe

### Task 5.3: Banner connessione Supabase
- Se Supabase non configurato: banner "Connetti Supabase per i dati cloud"
- Se configurato: dati reali
- Fallback: localStorage (gia funzionante)

### Task 5.4: AUDIT 1/3
```
[ ] build + test PASS
[ ] tab "Classe" visibile (solo docente)
[ ] click Classe → dashboard visibile
[ ] click Lavagna → simulatore INTATTO
[ ] #tutor IDENTICO
```

### Task 5.5: Dashboard studente come drawer/tab secondario
- Wrappare StudentDashboard (senza modificarlo)
- Accessibile da menu hamburger o da Galileo

### Task 5.6: Gamification preservata
- Badge, punti, streak, confetti — tutto wrappato, non modificato
- Verificare che funziona identicamente

### Task 5.7: AUDIT 1/2
```
[ ] tutti punti 1/3 + switch tab 5 volte senza perdere stato
[ ] LIM 1024x768 dashboard leggibile
[ ] touch test su tab switch
```

### Task 5.8: CSV export + print report
- Verificare che funzionano dal wrapper (non modificare)

### Task 5.9: Test regressione completo
- #tutor IDENTICO | picker funziona | video funziona | dashboard funziona

### Task 5.10: AUDIT FINALE S5 + genera S6 prompt + MEMORY

---

## ═══════════════════════════════════════════
## SESSIONE 6/8 — Dashboard Studente + Vetrina V2
## ═══════════════════════════════════════════

### Task 6.1: VetrinaV2.jsx — landing pre-login
- Creare `src/components/lavagna/VetrinaV2.jsx` + `.module.css`
- NON modificare VetrinaSimulatore.jsx — file NUOVO
- Hero con palette ELAB, stats, CTA chiara
- Card 3 volumi con colori gradient (Lime/Orange/Red)
- Responsive LIM + iPad + mobile

### Task 6.2: Form attivazione licenza
- Wrappare form esistente (NON riscrivere)
- Input codice licenza → sblocca volume

### Task 6.3: Link a #lavagna dopo login
- Post-login redirect a #lavagna (non #tutor)
- Pre-login: VetrinaV2

### Task 6.4: AUDIT 1/3
```
[ ] build + test PASS
[ ] VetrinaV2 visibile pre-login
[ ] 3 card volumi con colori corretti
[ ] #tutor IDENTICO
```

### Task 6.5-6.6: Responsive + touch test

### Task 6.7: AUDIT 1/2
```
[ ] LIM 1024x768 vetrina leggibile
[ ] mobile 375x812 vetrina usabile
[ ] flusso: vetrina → login → #lavagna
```

### Task 6.8-6.9: Flusso completo + regressione

### Task 6.10: AUDIT FINALE S6 + genera S7 prompt + MEMORY

---

## ═══════════════════════════════════════════
## SESSIONE 7/8 — Rimozione Giochi + Dead Code + Polish
## ═══════════════════════════════════════════

### Task 7.1-7.5: Rimuovere giochi (CircuitDetective, PredictObserve, ReverseEngineering, CircuitReview + dati + hook)
- ~2,290 LOC da rimuovere
- Build + test dopo OGNI rimozione

### Task 7.6: Rimuovere sezione giochi da TutorSidebar

### Task 7.7: AUDIT 1/3
```
[ ] build + test PASS (nessun import rotto)
[ ] #tutor funziona senza giochi (no crash)
[ ] #lavagna invariata
```

### Task 7.8: Rimuovere VetrinaSimulatore const S={} dead code (400 LOC)
### Task 7.9: Rimuovere 57 unicode emoji escapes → verificare ElabIcons SVG

### Task 7.10: AUDIT 1/2
### Task 7.11: Polish — animazioni, micro-interazioni, canvas dot pattern
### Task 7.12: Progress dots animati nella header

### Task 7.13: AUDIT FINALE S7 + genera S8 prompt + MEMORY

---

## ═══════════════════════════════════════════
## SESSIONE 8/8 — Lo Switch: #tutor → #lavagna
## ═══════════════════════════════════════════

**QUESTA E LA SESSIONE PIU CRITICA. OGNI ERRORE E IRREVERSIBILE.**

### Task 8.1: Test COMPLETO #lavagna
- TUTTI i 62 esperimenti apribili dal picker
- Voice, TTS, STT funzionanti
- Dashboard docente e studente funzionanti
- VideoFloat funzionante
- ExperimentPicker funzionante
- State machine funzionante

### Task 8.2: AUDIT pre-switch (DEVE essere >= 8.5/10)
```
[ ] 62 esperimenti: almeno 10 caricati e verificati
[ ] voice: 3 comandi testati
[ ] dashboard: tab switch 3 volte
[ ] video: ricerca + play
[ ] picker: apri/cerca/seleziona
[ ] LIM 1024x768: tutto leggibile
```

### Task 8.3: App.jsx — #tutor diventa redirect a #lavagna
- `if (hash === '#tutor') hash = '#lavagna';`
- Vecchi bookmark/link continuano a funzionare

### Task 8.4: Rimuovere vecchio TutorLayout, TutorTopBar, TutorSidebar
- DOPO backup (git commit prima della rimozione)
- Rimuovere import e route in App.jsx

### Task 8.5: AUDIT post-rimozione
```
[ ] build + test PASS
[ ] #tutor reindirizza a #lavagna
[ ] #lavagna funziona come prima
[ ] nessun import rotto
[ ] bundle size DIMINUITO
```

### Task 8.6: Rimuovere VetrinaSimulatore (sostituito da VetrinaV2)
### Task 8.7: Bundle optimization — verificare chunk rimossi

### Task 8.8: AUDIT FINALE TOTALE — 5 AGENTI
```
Lanciare 5 agenti paralleli:
1. Spec agent: 62 esperimenti, picker, state machine
2. UX agent: flusso docente completo (vetrina → login → lavagna → esperimento → codice → esegui)
3. Student agent: flusso studente (badge, gamification, report)
4. Security agent: CSP, GDPR, PII
5. Performance agent: bundle size, lazy loading, precache
```

### Task 8.9: Aggiornare CLAUDE.md con nuova architettura
### Task 8.10: Screenshot confronto PRIMA/DOPO
### Task 8.11: Deploy Vercel: `npm run build && npx vercel --prod --yes`

### Task 8.12: AUDIT FINALE DEFINITIVO + MEMORY update

**SCORE TARGET S8: >= 8.5/10 o la sessione viene RIPETUTA.**

---

## PROTOCOLLO AUDIT UNIVERSALE (per tutte le sessioni)

### Checklist minima per ogni audit:
```
1. npm run build → PASS + precache entries + KB
2. npx vitest run → numero test esatto
3. preview_console_logs level=error → 0
4. preview_screenshot #lavagna → feature della sessione visibili
5. preview_screenshot #tutor → IDENTICO (fino a S7)
6. preview_resize 1024x768 → LIM leggibile
7. Ogni feature testata con click REALE nel preview
```

### Score card template:
```
| Feature | Funziona nel browser? | Screenshot? | Score |
|---------|----------------------|-------------|-------|
| [nome]  | SI/NO               | si/no       | 0-10  |

Score composito = media pesata dei SI
Se F1-F5 non PASS → Score = 0
Se self-score > evidenze + 1.5 → RICALCOLA
```

---

## CHAIN OF VERIFICATION (CoV) — OBBLIGATORIA A FINE OGNI SESSIONE

Il CoV e il protocollo anti-bugie. Lo applichiamo dal 19/02/2026. Funziona cosi:

### Protocollo CoV per Lavagna:
1. **3 agenti indipendenti** lanciati in parallelo alla fine di ogni sessione:
   - **Agente Spec**: verifica che TUTTE le feature dichiarate funzionino davvero (click nel browser, non solo codice)
   - **Agente UX**: testa il flusso docente completo su LIM 1024x768 (da apertura a esperimento a codice)
   - **Agente Security/A11y**: WCAG contrast, touch targets 48px, focus ring, aria-labels

2. **Ogni agente produce una scorecard indipendente** con SI/NO per ogni feature testata

3. **Score finale = MINIMO dei 3 score** (non la media — il piu basso vince)
   - Se Spec dice 8 ma UX dice 5 → score = 5
   - Questo previene l'inflazione

4. **Deduzioni obbligatorie** per ogni issue trovata:
   - Feature dichiarata ma non funzionante nel browser: -2
   - Hack non dichiarato: -3
   - Console error ignorato: -1
   - Touch target < 48px: -0.5 per violazione
   - Contrasto WCAG fail: -0.5 per violazione

5. **Il CoV non puo MAI alzare il score** — puo solo abbassarlo o confermarlo

### Template output CoV:
```
## CoV Report — Sessione {N}

### Agente Spec (feature verification)
| Feature | Testata nel browser? | Funziona? | Note |
|---------|---------------------|-----------|------|
Score Spec: X/10

### Agente UX (flusso docente LIM)
| Step | Eseguito? | Screenshot? | Note |
|------|-----------|-------------|------|
Score UX: X/10

### Agente Security/A11y
| Check | PASS/FAIL | Dettaglio |
|-------|-----------|-----------|
Score A11y: X/10

### Score Finale CoV: MIN(Spec, UX, A11y) = X/10
### Deduzioni: [lista]
### Score Onesto Post-CoV: X/10
```

---

## ELAB TRES JOLIE — RIFERIMENTO VISIVO OBBLIGATORIO

La cartella `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/` contiene TUTTO il materiale ELAB fisico:
```
ELAB - TRES JOLIE/
  1 ELAB VOLUME UNO/          — Scansioni/foto Volume 1
  2 ELAB VOLUME DUE/          — Scansioni/foto Volume 2
  3 ELAB VOLUME TRE/          — Scansioni/foto Volume 3
  BOM KIT CON ELENCO COMPONENTI/  — Lista componenti del kit fisico
  CODICI A BARRE 1+5/         — Codici prodotto
  DOCUMENTI/                   — Documentazione
  FOTO/                        — Foto prodotto
  LOGO/                        — Logo ELAB ufficiale
  RENDERING SCATOLE/           — Rendering 3D packaging
  Video/                       — Video didattici (6 mp4)
```

**Kit + Volumi + Tutor = UNICO PRODOTTO.**
- Ogni scelta visiva nella Lavagna DEVE essere coerente con il materiale in Tres Jolie
- I colori dei volumi (Lime/Orange/Red) vengono dai libri fisici
- Il logo ELAB e in `LOGO/`
- Se un componente UI non sembra "parte dello stesso prodotto" del kit fisico → e sbagliato

---

## STRESS TEST DURISSIMI — PER OGNI SESSIONE

### ST1: Stress Sequenza Rapida
- Aprire/chiudere OGNI pannello 10 volte in successione rapida
- Se un pannello rimane incastrato, animazione si blocca, o stato si corrompe → -3

### ST2: Stress Multi-Window
- Aprire VideoFloat + UNLIM + picker contemporaneamente
- Drag tutte le finestre, sovrapponi, minimizza, ri-espandi
- Z-index deve essere corretto (ultima cliccata in primo piano)
- Se overlap crea buchi visivi o click-through → -2

### ST3: Stress LIM Proiettore (1024x768)
- Resize a 1024x768
- OGNI testo deve essere leggibile (font >= 14px)
- OGNI bottone deve avere area touch >= 48px
- OGNI colore deve passare WCAG AA (contrast ratio >= 4.5:1)
- Se qualsiasi cosa fallisce → -1 per violazione

### ST4: Stress Cambio Esperimento
- Caricare 5 esperimenti diversi in sequenza (Vol1, Vol1, Vol2, Vol3, Vol1)
- Il simulatore DEVE mostrare il circuito corretto OGNI volta
- Non devono esserci componenti "fantasma" dal caricamento precedente
- Se componenti si sommano o rimangono → -3

### ST5: Stress Stato-Driven (da S4)
- Caricare esperimento → BUILD → aprire codice → CODE → avviare → RUN → chiedere aiuto → STUCK
- Poi chiudere tutto → CLEAN → ricominciare
- I pannelli DEVONO rispondere a OGNI transizione
- Se un pannello si incastra o lo stato non transiziona → -2

### ST6: Stress Memory (sessioni lunghe)
- Dopo tutti gli stress test, verificare:
  - `preview_eval` → `performance.memory` (se disponibile)
  - Nessun listener orfano (addEventListener senza removeEventListener)
  - localStorage non cresce oltre 5MB
- Se memory leak evidente → -2

### ST7: Stress Offline
- Simulare offline: `preview_eval → navigator.onLine`
- OfflineBanner deve apparire
- Tornare online: banner sparisce
- Nessun crash durante la transizione
