# EXTERNAL RESEARCH LEDGER — ARDESIA NOTTE-12
## Simulation Plugin ELAB — pattern da rubare/trasformare, licenze verificate alla fonte

> Ricerca web reale (sessione NOTTE-12), licenze lette dai file LICENSE / repo ufficiali. Vincoli: nessun asset protetto copiato, nessuna nuova dipendenza proposta come *necessaria* — solo "candidate con gate-Andrea". Contesto: breadboard educativa dentro lavagna Excalidraw, React 19 + Vite, motore MNA proprio, zero-dep.

## 1. Tinkercad Circuits (Autodesk)
- Link: https://www.tinkercad.com/learn/circuits — **PROPRIETARIO** (TRAP per asset, SAFE per pattern osservati).
- Rubare/trasformare: (1) **Starters** pre-fatti trascinabili+remixabili → ogni esperimento del libro = "starter" scena firmata; (2) tri-view codice (blocchi/testo/combinato); (3) tray componenti a destra + un solo "Start Simulation".
- Evitare: cloud-only/closed; non reverse-engineerare il formato scena.

## 2. Wokwi — diagram.json (mini-lingua percorsi filo)
- Link: https://docs.wokwi.com/diagram-format — formato documentato pubblicamente; `wokwi-elements`/`avr8js` = **MIT** → SAFE.
- **Spec da rubare**: connessione = `["led1:A", "uno:13", "green", ["v10","h5","*","v-15","h10"]]` — `v±n`/`h±n` movimenti ortogonali, `*` delimitatore (prima=lato sorgente, dopo=lato target in ordine inverso), resto auto-completato. **Mai diagonali**. Coordinate pixel (limite: non lega al foro).
- Impatto ALTO: modello per i bend-points ARDESIA — trasformare in celle-breadboard (non pixel), mantenendo ortogonalità+delimitatore+auto-completamento.

## 3. Fritzing
- Link: https://github.com/fritzing/fritzing-app (**GPL-3.0** ⛔) · fritzing-parts (**CC-BY-SA 3.0** ⚠️ share-alike).
- Concetti: bend-point col drag del centro-filo; doppio-click aggiunge/rimuove; curve Bézier con `<cp0>/<cp1>`.
- Evitare: SVG delle parti (contagiosi); i Bézier liberi rendono ambiguo il grader → ARDESIA usa bend ortogonali.

## 4. tscircuit / Circuit JSON — https://github.com/tscircuit/circuit-json (**MIT** ✅)
- Rubare: array PIATTO di circuit-elements, un record per elemento con id stabile → serializzazione scena diff-abile. Evitare la surface PCB/Gerber/SPICE.

## 5. avr8js — https://github.com/wokwi/avr8js (**MIT** ✅)
- Solo core CPU AVR: gli dai il .hex, tu implementi glue+hardware funzionale+viste. Candidato futuro (gate-Andrea) per ESEGUIRE gli sketch; NON sostituisce il MNA (non risolve reti resistive).

## 6. Arduino CLI + WebSerial/WebUSB (upload onesto, stato 2025-26)
- arduino-cli = **GPL-3.0** (⚠️ TRAP se linkato; OK binario separato via subprocess, arm's length). Web Serial/WebUSB = standard web ✅.
- Verificato: Web Serial solo Chromium (da v89), secure context HTTPS/localhost + gesto utente; per UNO/Nano serve Web Serial (WebUSB non copre USB-serial); flash browser dimostrato (uploader AVR109 in JS puro).
- Pattern onesto: compile-server arduino-cli (binario) + flash client Web-Serial proprio, con avvisi espliciti "Chrome/Edge + HTTPS".

## 7. Blockly / Scratch Blocks — **Apache-2.0** entrambi ✅
- Rubare: serializzazione JSON a serializer registrabili; **"invalido = warning visibile, mai fallimento silenzioso"** (da importare subito nel grader breadboard); workspace+toolbox.

## 8. Excalidraw — **MIT** ✅ (già in casa)
- Rubare (nativo, non reinventare): (1) linear element = sequenza `points` con midpoint-handle per aggiungere punti col drag → i bend-points possono essere i points nativi; (2) **FixedPointBinding** con `fixedPoint` normalizzato [0..1] + `updateBoundElements` → ancora stabile filo↔foro; (3) **elbow arrows**: intermedi auto-routed ortogonali (stessa filosofia Wokwi).
- Scelta architetturalmente più economica per il wire-editing interattivo.

## 9. Falstad / CircuitJS1 — **GPLv2** ⛔ (solo ispirazione)
- Concetto: puntini in movimento ∝ corrente, colore ∝ tensione → overlay ARDESIA guidato SOLO dai valori MNA reali. Zero codice.

## 10. Brevi (tutte MIT, candidate gate-Andrea, nessuna necessaria)
KaTeX (formule V=RI nell'evidence panel) · MiniSearch (ricerca fuzzy palette) · dnd-kit (drag accessibile; Excalidraw ha già il suo) · XYFlow (ridondante con Excalidraw — non aggiungere).

## (a) 5 raccomandazioni per il breadboard copy system
1. **Modello filo nativo Excalidraw** (points + FixedPointBinding + elbow ortogonale) come base bend-points — MIT, zero-dep.
2. **Grammatica Wokwi `v/h/*` in celle-breadboard** (non pixel) per `wires[].path`: ripetibile e diff-abile.
3. **Layer semantico row/col→pin** stile Circuit JSON flat sopra la geometria (estende `pointForBreadboardRef`/`sceneAuthoring`).
4. **Principio Blockly nel grader**: invalido = warning visibile motivato (foro sbagliato/polarità/filo mancante), calcolato dal MNA — mai verde finto. (In parte già fatto: `gradeSceneGeometryStrict` nomina i buchi.)
5. **Overlay corrente onesto** (ispirazione Falstad, implementazione propria) sui valori MNA reali.

## (b) Licenze — SAFE vs TRAP (prodotto commerciale)
| Progetto | Licenza | Verdetto |
|---|---|---|
| Excalidraw, tscircuit/Circuit JSON, avr8js, wokwi-elements, KaTeX, MiniSearch, dnd-kit, XYFlow | MIT | ✅ SAFE |
| formato diagram.json (docs) | pubblico | ✅ SAFE (idea) |
| Blockly, scratch-blocks | Apache-2.0 | ✅ SAFE |
| Web Serial / WebUSB | standard web | ✅ SAFE (Chromium+HTTPS) |
| arduino-cli | GPL-3.0 (+comm.) | ⚠️ solo binario subprocess |
| Fritzing parti/SVG | CC-BY-SA 3.0 | ⚠️ non riusare asset |
| Fritzing app · CircuitJS1 | GPL-3.0 · GPLv2 | ⛔ zero codice |
| Tinkercad | proprietario | ⛔ solo osservazione UX |

**Regola d'oro**: il copy system si costruisce quasi tutto su MIT già-in-casa (Excalidraw) + grammatica Wokwi (idea) + layer semantico stile Circuit JSON, restando zero-dep. GPL/AGPL/CC-BY-SA = evitare o arm's length. Cross-check col canon §7 (PyMuPDF/Ultralytics AGPL = veleno, confermato).
