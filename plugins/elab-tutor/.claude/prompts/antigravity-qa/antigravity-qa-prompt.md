# ELAB Simulator — Antigravity QA Session

> Sessione di Quality Assurance completa per il simulatore ELAB Tutor.
> Obiettivo: verificare che TUTTO funzioni correttamente in produzione.

---

## Contesto

Leggi i file di contesto in questa cartella PRIMA di iniziare:
- `.claude/prompts/antigravity-qa/context-file-map.md` — mappa di tutti i file critici
- `.claude/prompts/antigravity-qa/context-known-issues.md` — regole architetturali e issue noti
- `.claude/prompts/antigravity-qa/context-test-matrix.md` — matrice esperimenti e scenari di test

L'app gira su Vercel: `https://elab-builder.vercel.app`
Il backend AI (nanobot) gira su Render: `https://elab-galileo.onrender.com`

---

## FASE 0 — Salute Build (5 min)

1. Esegui `npm run build` e verifica **0 errori, 0 warning critici**
2. Controlla la dimensione dei chunk principali:
   - `Main` deve essere < 350 KB gzip
   - `ScratchEditor` deve essere < 950 KB gzip (lazy-loaded)
3. Verifica che `patch-blockly.js` postinstall funzioni (`ELAB-PATCHED:safe-disposal-v2` nel file patchato)
4. Controlla che non ci siano `console.error` o `console.warn` non gestiti nella console del browser su produzione (dopo hard reload)

**Output**: tabella con chunk sizes + PASS/FAIL per ogni check

---

## FASE 1 — AVR & Scratch (20 min)

### 1A. Caricamento esperimenti AVR
Per OGNI esperimento Vol3 AVR:
1. Carica l'esperimento in modalita "Gia Montato"
2. Verifica che tutti i componenti appaiano sulla breadboard nelle posizioni corrette
3. Verifica che l'Arduino Nano sia visibile e connesso
4. Verifica che il tab "Blocchi" (Scratch) sia visibile nella barra degli editor

**Esperimenti da testare**: v3-avr-led-blink, v3-avr-cambia-pin, v3-avr-2led, v3-avr-pulsante, v3-avr-pot-serial, v3-avr-sos-morse, v3-avr-semaforo

### 1B. Editor Scratch (Blockly)
Per almeno 3 esperimenti AVR:
1. Clicca sul tab "Blocchi"
2. Verifica che la **toolbox** Blockly appaia con TUTTE le categorie: Logica, Cicli, Matematica, Variabili, Testo, Input/Output, Suono, Servo, LCD
3. Verifica che il **workspace** mostri i blocchi pre-caricati (Setup + Loop)
4. **Trascina** un blocco dalla toolbox al workspace — deve funzionare senza errori
5. Verifica che il pannello **"Codice Generato"** (CodeEditorCM6 read-only, 40% destra) mostri il C++ corrispondente
6. Verifica che il C++ si **aggiorni in tempo reale** quando modifichi i blocchi
7. Verifica che non ci siano errori nella console (`removeElem`, `ReferenceError`, `TypeError`)

### 1C. Compilazione
1. Premi "Compila & Carica"
2. Verifica che il compilatore risponda (NO "Il traduttore del codice non risponde")
3. Verifica che gli errori di compilazione vengano mostrati in modo leggibile
4. Per LED Blink: verifica che dopo la compilazione il LED lampeggi nell'animazione

### 1D. Switch Arduino C++ <-> Scratch
1. Passa dal tab "Blocchi" al tab "Arduino C++"
2. Verifica che il codice C++ nell'editor sia modificabile
3. Torna al tab "Blocchi" — i blocchi devono essere ancora li
4. Ripeti 3 volte velocemente — nessun crash

**Output per FASE 1**: tabella con PASS/FAIL per ogni sotto-test

---

## FASE 2 — Interfaccia Grafica Scratch (15 min)

### 2A. Layout Side-by-Side
1. Con un esperimento AVR caricato e tab "Blocchi" attivo:
   - Il workspace Blockly deve occupare circa il **60% sinistro**
   - Il pannello "Codice Generato" deve occupare circa il **40% destro**
   - La divisione deve essere netta, senza overlap

### 2B. Tema e Colori
1. I blocchi devono usare il **tema ELAB** (colori coerenti con la palette):
   - Logica: un colore, Cicli: un altro, IO: un altro, ecc.
2. Lo sfondo del workspace deve essere **scuro** (dark theme Blockly)
3. Il renderer deve essere **Zelos** (blocchi con angoli arrotondati)

### 2C. Categorie e Blocchi
Verifica la presenza di TUTTI i blocchi custom:
- **Input/Output**: digitalWrite, digitalRead, analogWrite, analogRead, pinMode
- **Logica**: if, if-else, comparison operators
- **Cicli**: repeat, while, for (count)
- **Variabili**: create variable, set, change, get
- **Testo**: print (Serial.println), text join
- **Suono**: tone, noTone
- **Servo**: servo_attach, servo_write
- **LCD** (S111): lcd_init, lcd_print, lcd_set_cursor, lcd_clear
- **Tempo**: delay (ms)

### 2D. Interazione
1. Drag di blocchi dalla toolbox — smooth, senza scatti
2. Snap dei blocchi tra loro — devono agganciarsi correttamente
3. Delete di blocchi (trascinare nel cestino o tasto Canc) — deve funzionare
4. Undo/Redo (Ctrl+Z / Ctrl+Shift+Z) nel workspace Blockly
5. Zoom (scroll wheel) nel workspace Blockly

**Output**: tabella dettagliata PASS/FAIL + screenshot di qualsiasi anomalia

---

## FASE 3 — Breadboard Antigravity (20 min)

> Questa e la fase PIU CRITICA. I componenti devono restare INCOLLATI alla breadboard durante ogni traslazione.

### 3A. Parent-Child Integrity
1. Carica un esperimento con almeno 3 componenti sulla breadboard (es. v1-led-simple o v3-avr-led-blink)
2. **Afferra la breadboard** (non un componente su di essa) e trascinala
3. **VERIFICA** che TUTTI i componenti figli (LED, resistori, Arduino, fili) si muovano ESATTAMENTE con la breadboard
4. **VERIFICA** che nessun componente "si stacchi" o resti indietro
5. **VERIFICA** che i fili (Wire) seguano i pin dei componenti senza scollamento
6. Ripeti 5 volte con movimenti veloci e ampi
7. Rilascia — tutti i componenti devono essere nella posizione corretta relativa

### 3B. Post-Drag Integrity
Dopo aver trascinato la breadboard:
1. I pin overlay (pallini dei pin) devono coincidere con i fori della breadboard
2. Avvia la simulazione — il circuito deve funzionare identicamente a prima dello spostamento
3. Le connessioni nel CircuitSolver devono essere intatte (verifica che LED si accenda)

### 3C. Drag Singolo Componente
1. Afferra un componente SINGOLO dalla breadboard (es. LED)
2. Il componente deve staccarsi dalla breadboard (perdere parentId)
3. I fili connessi devono seguire il componente O staccarsi visivamente
4. Rilascia il componente su un'altra zona della breadboard — deve ri-snapparsi a un foro

### 3D. Drag su BreadboardFull
Ripeti test 3A-3C su un esperimento che usa la BreadboardFull (layout verticale, 63 righe).

### 3E. Edge Cases
1. Trascina breadboard fuori dal viewport visibile — deve poter tornare
2. Trascina breadboard su un'altra breadboard — nessun crash
3. Aggiungi un componente, snappalo, trascina BB, rimuovi componente — nessun orfano

**Output**: PASS/FAIL per ogni sotto-test. Qualsiasi "staccamento" e un FAIL CRITICO.

---

## FASE 4 — Fori Funzionanti & Snap (15 min)

### 4A. Tutti i Fori Rispondono
1. In modo "Libero", prendi un LED dalla ComponentPalette
2. **Prova a dropparlo su OGNI riga** della breadboard (a, b, c, d, e, f, g, h, i, j)
3. Verifica che il LED si **agganci al foro piu vicino** in ogni caso
4. Verifica che il `pinAssignment` risultante sia corretto (controlla via console: `__ELAB_API.getSimulatorState().pinAssignments`)

### 4B. Colonne Estreme
1. Prova a piazzare un resistore alla colonna 1 (estremo sinistro)
2. Prova a piazzare un resistore alla colonna 30 (estremo destro)
3. Il resistore NON deve uscire dai limiti — il clamping deve funzionare

### 4C. Componenti Multi-Pin
1. Piazza un **PushButton** (4 pin) — deve cavalcare il gap tra sezione top e bottom
2. Piazza un **Potentiometer** (3 pin) — tutti e 3 i pin devono assegnarsi a fori validi
3. Piazza un **MOSFET** (3 pin TO-220) — deve usare il layout TO-220 (pin adiacenti)
4. Piazza un **RgbLed** (4 pin) — tutti i pin devono avere fori assegnati

### 4D. Connettivita Elettrica dei Fori
1. Piazza 2 componenti sulla **stessa colonna** della breadboard (stessa sezione top o bottom)
2. Verifica che il CircuitSolver li consideri **elettricamente connessi** (stesso net)
3. Piazza 2 componenti sulla stessa colonna ma in **sezioni diverse** (top vs bottom)
4. Verifica che siano **NON connessi** (il gap li separa)
5. Connetti un filo dal bus + al foro a1 — verifica che il bus funzioni

**Output**: tabella PASS/FAIL. Qualsiasi foro che non risponde e un FAIL CRITICO.

---

## FASE 5 — Circuit Solver Responsivo (15 min)

### 5A. Adattamento Viewport
1. Apri il simulatore a **1920x1080** (desktop)
2. Verifica che il circuito sia centrato e visibile
3. Ridimensiona a **1024x768** (iPad landscape)
4. Verifica che il circuito **non si tagli** e che i pin rimangano allineati ai fori
5. Ridimensiona a **768x1024** (iPad portrait)
6. Verifica la stessa cosa
7. In TUTTI i viewport: avvia la simulazione e verifica che il CircuitSolver funzioni identicamente

### 5B. Zoom & Pan
1. Usa scroll wheel per zoomare in/out
2. In ogni livello di zoom: piazza un componente, verifica che lo snap funzioni
3. Effettua pan (drag sullo sfondo) — i componenti devono restare in posizione relativa
4. Dopo zoom+pan: avvia simulazione — tutto deve funzionare

### 5C. Coordinate Consistency
Il CircuitSolver lavora in coordinate SVG, non screen. Verifica che:
1. A QUALSIASI livello di zoom, un LED piazzato su un foro della breadboard sia **elettricamente connesso** al foro
2. I fili creati a zoom 100% funzionino anche a zoom 200% e 50%
3. Le posizioni dei pin overlay (pallini) corrispondano esattamente ai fori SVG della breadboard

**Output**: tabella PASS/FAIL per viewport + zoom level

---

## FASE 6 — Drag & Drop Perfetto (15 min)

### 6A. Dalla Palette al Canvas
1. Apri la ComponentPalette
2. **Trascina** un LED dalla palette al canvas — deve crearsi un'istanza
3. Rilascia sul canvas — il componente appare dove rilasciato
4. Rilascia sulla breadboard — il componente si snappa al foro piu vicino

### 6B. Responsivita del Drag
1. Trascina un componente **lentamente** — deve seguire il cursore pixel-per-pixel
2. Trascina un componente **velocemente** — NON deve perdere il tracking
3. Trascina fuori dal viewport e rientra — il componente deve seguire
4. Trascina con **touch** (se iPad disponibile) — stessa precisione del mouse

### 6C. Wiring Drag
1. Clicca su un pin per iniziare un filo
2. Trascina il filo verso un altro pin
3. Il filo deve **seguire il cursore** in tempo reale con routing A*
4. Al rilascio su un pin valido: il filo si connette
5. Al rilascio nel vuoto: il filo si cancella (no fili orfani)

### 6D. Z-Index e Sovrapposizioni
1. Trascina un componente sopra un altro — il componente in drag deve essere **sopra** (z-index elevato)
2. Dopo il rilascio: il z-index deve tornare alla normalita
3. Verifica gerarchia: Canvas (20-80) < Editor (200) < Chat (400) < Hints (1000)

### 6E. No Ghost Components
1. Drag rapido + rilascio fuori area — nessun componente fantasma
2. Doppio click su palette — crea UN solo componente (no duplicati)
3. Drag da palette + Escape — annulla il drag, nessun residuo

**Output**: PASS/FAIL per ogni scenario + note su qualsiasi lag o imprecisione

---

## FASE 7 — Ralph Loop (10 min)

Esegui il Ralph Loop completo per conferma finale:

1. **Load Vol1** — carica un esperimento passivo, verifica funzionamento
2. **Play** — avvia simulazione, LED si accende
3. **Pause** — simulazione si ferma
4. **Load Vol3 AVR** — carica esperimento Arduino
5. **Tab Blocchi** — verifica Scratch funzionante
6. **Switch Arduino C++** — editor C++ attivo
7. **Compile** — compilazione senza errori
8. **Play AVR** — LED blink nell'animazione
9. **Clear All** — azzera tutto
10. **Load altro esperimento** — nessun residuo dal precedente

**Output**: 10/10 o dettaglio dei fallimenti

---

## Report Finale

Produci un report con:

```
| Fase | Area | Score | PASS | FAIL | Note |
|------|------|-------|------|------|------|
| 0 | Build Health | /10 | | | |
| 1 | AVR & Scratch | /10 | | | |
| 2 | UI Scratch | /10 | | | |
| 3 | Breadboard Antigravity | /10 | | | |
| 4 | Fori & Snap | /10 | | | |
| 5 | Circuit Solver Responsivo | /10 | | | |
| 6 | Drag & Drop | /10 | | | |
| 7 | Ralph Loop | /10 | | | |
| **TOTALE** | | **/80** | | | |
```

Per ogni FAIL:
1. Descrivi il bug con screenshot
2. Identifica il file/funzione responsabile
3. Proponi la fix (codice o strategia)
4. Priorita: P0 (bloccante) / P1 (importante) / P2 (medio) / P3 (minore)

---

## Regole di Ingaggio

- **Non fixare niente durante il test** — solo osservare e documentare
- Usa `window.__ELAB_API` per ispezionare lo stato interno del simulatore
- Usa la console del browser per verificare errori
- Testa SEMPRE su produzione (`elab-builder.vercel.app`), non locale
- Fai hard reload (`Cmd+Shift+R`) all'inizio di ogni fase
- Se un test FAIL, non saltare i successivi — completa TUTTA la matrice
