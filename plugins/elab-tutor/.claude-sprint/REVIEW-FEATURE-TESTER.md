# REVIEW FEATURE TESTER -- ELAB Simulator
# Deep Code Audit (Feature-by-Feature)

**Tester**: QA Senior (15 anni, ex-Google, "break everything" mentality)
**Data**: 14/02/2026
**Metodo**: Static code analysis riga per riga, ogni file critico letto integralmente
**Scope**: 10 aree funzionali, ~8,500 LOC analizzate

---

## SCORE CARD

| #  | Feature                        | Verdict    | Note sintetica                                           |
|----|-------------------------------|------------|----------------------------------------------------------|
| 1  | Simulator Core (NES)          | WARN       | Stale closure in reSolve via rAF, _avrSetupInProgress module-level risk |
| 2  | CircuitSolver (MNA)           | WARN       | Green LED Vf mismatch (2.8 vs 2.0), _hasParallelPaths heuristic fragile |
| 3  | AVRBridge (Worker)            | PASS       | Worker fallback solido, LCD nibble logic corretta        |
| 4  | Wire System                   | PASS       | Bezier routing, net highlight, current animation OK      |
| 5  | ControlBar                    | PASS       | Keyboard nav overflow, ARIA labels, tutti i bottoni wired |
| 6  | Experiments Data               | PASS       | pinAssignments strutturati, buildSteps completi per Vol1 |
| 7  | SVG Components                | WARN       | LED Vf inconsistency cross-file, Multimeter probe drag depends on parent |
| 8  | Undo/Redo                     | WARN       | cloneSnapshot fa shallow copy di layout/pinAssignments   |
| 9  | Save/Load                     | WARN       | No user feedback on import failure, localStorage silently fails |
| 10 | Copy/Paste                    | WARN       | Component properties (value, color) non copiate nel paste |

**Totale: 3 PASS, 7 WARN, 0 FAIL**

---

## 1. SIMULATOR CORE (NewElabSimulator.jsx ~1900 LOC)

### Analisi

Il file e' stato decomposto in Sprint 1 da ~3500 a ~1900 LOC. Struttura pulita con:
- 30+ `useState`, ~15 `useRef`, ~12 `useCallback`, ~10 `useEffect`
- `trackedTimeout` pattern per cleanup dei timer (riga 124-131) -- buono
- Cleanup su unmount (riga 466-470): solver.destroy(), avr.destroy(), clearInterval -- completo
- `_avrSetupInProgress` e `_avrSetupExpId` sono **variabili module-level** (riga ~545-546), NON state -- sopravvivono a remount ma possono causare stale state se il componente viene rimontato in contesto diverso

### Bug trovati

**B1 (P2)** -- `reSolve` via `requestAnimationFrame` potenziale stale closure
- File: `NewElabSimulator.jsx:1527`
- Molti callback chiamano `requestAnimationFrame(() => reSolve())` dopo aver aggiornato state via setState
- `reSolve` dipende da `mergedExperiment` (riga 357-368), che e' un useMemo derivato
- Il `requestAnimationFrame` esegue nel frame successivo, ma React potrebbe non aver ancora committato il nuovo state
- **Mitigazione**: l'useEffect su `mergedExperiment` (riga 374-381) chiama `loadExperiment` comunque, rendendo il rAF reSolve ridondante nella maggior parte dei casi
- **Severita'**: P2 (race condition intermittente, non critica grazie all'useEffect di safety net)

**B2 (P3)** -- `_avrSetupInProgress` module-level flag
- File: `NewElabSimulator.jsx:~545-546`
- In StrictMode o hot-reload, il componente viene smontato e rimontato. La variabile module-level mantiene `true` dal mount precedente, bloccando l'init dell'AVR bridge
- `handleBack` resetta la flag (riga 871-872), ma se il componente viene smontato senza passare da handleBack, la flag resta sporca
- **Severita'**: P3 (solo in dev/StrictMode, non in produzione)

**B3 (P2)** -- `handleCompile` chiude su `currentExperiment` stale
- File: `NewElabSimulator.jsx:1694`
- `useCallback` dipende solo da `[currentExperiment]`, ma internamente usa `mergedExperiment` (riga 1594, 1627) che potrebbe essere piu' recente
- Se l'utente modifica il circuito e poi compila, `mergedExperiment` nel corpo del callback potrebbe non essere quello corrente
- **Severita'**: P2 (la compilazione e' asincrona, il risultato hex viene comunque caricato correttamente)

### Verdict: WARN

---

## 2. CIRCUIT SOLVER (CircuitSolver.js ~1700 LOC)

### Analisi

Architettura a 3 livelli:
1. Union-Find per net building (riga 34-69)
2. Path-tracer per circuiti serie (fallback)
3. MNA solver con eliminazione gaussiana + pivoting parziale (riga 859-1150)

MNA solver e' corretto algoritmicamente:
- Matrice aumentata, pivoting parziale, back substitution
- LED modellati come voltage source + 20ohm forward resistance
- Reverse-biased LED detection con re-solve loop (max pass non specificato, potenziale loop infinito)
- Potentiometer come 2 resistori (vcc-signal, signal-gnd)

### Bug trovati

**B4 (P1)** -- Green LED Vf mismatch: 2.8V nel solver, 2.0V nel componente SVG
- File: `CircuitSolver.js:23` -> `green: 2.8`
- File: `Led.jsx:13` -> `green: { ... vf: 2.0 }`
- Il solver usa 2.8V per calcolare la corrente, ma il componente LED dichiara 2.0V
- Impatto: il LED verde si accende con meno corrente di quanto dovrebbe (solver sottostima brightness)
- **Severita'**: P1 (errore didattico -- i bambini vedono un comportamento fisicamente sbagliato)

**B5 (P2)** -- MNA reverse-biased LED re-solve loop senza limite massimo
- File: `CircuitSolver.js:1063-1080`
- Il loop `for (let mnaPass = 0; mnaPass < 10; mnaPass++)` ha un hard cap di 10 iterazioni, che e' OK
- PERO': ogni iterazione puo' escludere un LED, ma non c'e' check se lo STESSO LED viene escluso e ri-incluso (oscillazione)
- **Mitigazione**: l'`excludedLEDs` set solo aggiunge, non rimuove -- quindi convergenza e' garantita
- **Severita'**: P2 (il limit di 10 impedisce loop infiniti, ma 10 iterazioni MNA sono pesanti per circuiti complessi)

**B6 (P2)** -- `_hasParallelPaths` heuristic: conta edges per net, threshold a >=3
- File: `CircuitSolver.js:788-808`
- L'euristica conta quanti pin di componenti resistivi toccano ogni net. Se un net ha >=3, assume parallelo
- Falso positivo: un net con 3 resistori in SERIE (pin1-A, pin2-A e pinX-A sullo stesso net) triggera MNA inutilmente
- Falso negativo: impossibile in pratica (se i paralleli esistono, il conteggio sara' corretto)
- **Impatto**: MNA viene chiamato piu' spesso del necessario, rallentando la simulazione
- **Severita'**: P2 (performance, non correttezza)

**B7 (P3)** -- `_gaussianElimination` con pivot near-zero: `continue` anziche' return null
- File: `CircuitSolver.js:1115`
- Se il pivot e' < 1e-15, il codice fa `continue` (salta la colonna), lasciando una riga di zeri
- Il back-substitution assegna 0 a quella variabile (riga 1139)
- Questo e' accettabile per matrici singolari (circuiti aperti), ma potrebbe produrre risultati errati per near-singular (circuiti quasi-corti)
- **Severita'**: P3 (edge case raro)

### Verdict: WARN

---

## 3. AVR BRIDGE (AVRBridge.js ~1050 LOC + avrWorker.js ~350 LOC)

### Analisi

Architettura dual-mode:
1. Web Worker (preferito): avrWorker.js esegue la CPU off-thread
2. Main-thread fallback via MessageChannel (se Worker fallisce)

Pin mapping ATmega328p corretto:
- D0-D7 = PORTD, D8-D13 = PORTB, A0-A7 = PORTC
- PWM: timer registers corretti (TCCR0A, TCCR1A, TCCR2A con bit COM corretti)
- Servo: duty cycle range 0.0272-0.12 (544-2400us), mapping lineare a 0-180 gradi
- LCD HD44780: 4-bit mode, E falling edge, nibble assembly, DDRAM addressing

Worker protocol completo: loadHex, start, stop, setPin, setAnalog, serialInput
Batching: pin changes ogni 8ms, PWM ogni 50ms
Fallback: se Worker crash, retry su main thread (riga 558+ nel NES, riga ~650 in AVRBridge)

### Nessun bug critico trovato

- BUG-E-07 fix per `configureLCDPins()` e' applicato (riga 558-565)
- `_pendingLCDConfig` salva la config LCD prima del start()
- `_checkLCDPinChange` tracka RS e E pin separatamente
- `pause()` chiude MessageChannel ports (riga 651-655) -- nessun leak
- `reset()` pulisce serialBuffer, analogValues, externalOverrides, lcdState

### Verdict: PASS

---

## 4. WIRE SYSTEM (WireRenderer.jsx ~820 LOC)

### Analisi

WireRenderer e' un componente puramente presentazionale che riceve connections e layout come props.

Features verificate:
- `computeRoutedWire`: calcolo waypoints con routing intelligente (evita sovrapposizioni)
- `buildRoutedPath`: genera path SVG con bezier curves (CORNER_RADIUS=5)
- `computeNetHighlight`: Union-Find inline per trovare tutti i wire nello stesso net elettrico
- `getAutoWireColor`: inferenza colore da pin function (bus-plus=red, bus-minus=black, Dx=orange, Ax=blue)
- Current flow animation: 3 dot circolanti con velocita' proporzionale alla corrente, colore gold/orange/red
- Hit area: path trasparente strokeWidth=10 per facile click
- Selection glow: dashed green animato
- Net highlight: glow verde 30% opacita' su wire dello stesso net

### Bug minori

**B8 (P3)** -- `normalize()` in `computeNetHighlight` non gestisce breadboard-full
- File: `WireRenderer.jsx:548-568`
- Il normalize riconosce rows a-e come "top" e f-j come "bot", ma non gestisce rows k-t che esistono in breadboard-full
- **Mitigazione**: il progetto usa solo `breadboard-half` (nessun esperimento usa breadboard-full)
- **Severita'**: P3 (non raggiungibile nel codebase attuale)

### Verdict: PASS

---

## 5. CONTROLBAR (ControlBar.jsx ~655 LOC)

### Analisi

Toolbar completa con:
- Play/Pausa (con toggle condizionale), Reset, Wire Mode, Panels toggle, BOM, Export PNG, Shortcuts
- OverflowMenu per mobile con keyboard navigation (ArrowUp/Down, Home/End, Escape)
- Focus management corretto (useEffect su focusIndex, itemRefs)
- Click-outside handler per chiudere menu
- ARIA: role="toolbar", aria-label, aria-haspopup, aria-expanded
- Tutti i bottoni hanno title con shortcut
- Galileo button con spinner loading state
- Timer display mm:ss

### Nessun bug trovato

- Conditional rendering basato su props nullable (onTogglePalette, onToggleCodeEditor, etc.) -- corretto
- `if (!experiment && !isFreeForm) return null` -- guard corretto per non renderizzare toolbar vuota
- SVG icons inline, 18x18, consistent strokeWidth

### Verdict: PASS

---

## 6. EXPERIMENTS DATA (experiments-vol1.js, experiments-vol3.js)

### Analisi (primi 2 esperimenti Vol1, header Vol3)

Struttura dati completa per ogni esperimento:
- `id`: unico, formato `v{vol}-cap{N}-esp{M}` o semantico
- `components`: array con type, id, value/color
- `pinAssignments`: mappa component:pin -> bb:hole (breadboard coordinates)
- `connections`: array from/to con color esplicito
- `layout`: posizioni x,y per ogni componente
- `steps`: istruzioni testuali per il bambino
- `buildSteps`: istruzioni strutturate con targetPins, hints
- `observe`: descrizione del risultato atteso
- `galileoPrompt`: prompt per l'AI tutor
- `quiz`: domande multiple choice con spiegazioni
- `code`: codice Arduino (null per Vol1)
- `hexFile`: path hex precompilato (null per Vol1)

### Bug minori

**B9 (P3)** -- `code: null, hexFile: null` su ogni esperimento Vol1
- File: `experiments-vol1.js:60-61`
- Questi campi sono inutili per Vol1 (solo batteria 9V, niente Arduino)
- Non causa errori ma appesantisce inutilmente l'oggetto
- **Severita'**: P3 (cosmetic)

**B10 (P3)** -- `concept` e `layer` fields non usati da nessun componente
- File: `experiments-vol1.js:62-63`
- `concept: "Circuito base..."` e `layer: "terra"` non sono referenziati nel codebase
- Dead data
- **Severita'**: P3 (cosmetic)

### Verdict: PASS

---

## 7. SVG COMPONENTS (LED.jsx, Resistor.jsx, NanoR4Board.jsx, Multimeter.jsx)

### Analisi

**LED.jsx** (159 LOC):
- Pin registration corretta: anode (-3.75, 22), cathode (3.75, 22) allineati a BB grid 7.5px
- Burned state: overlay nero + X rossa + smoke animation + label "BRUCIATO!" -- eccellente UX
- Glow effect: radialGradient + halo proporzionale a brightness
- Highlight: dashed green rect animato per tutoring AI
- `registerComponent('led', ...)` con `vfByColor` -- usato da solver per lookup

**Resistor.jsx** (172 LOC):
- Color bands auto-calcolate da valore (4-band system)
- Pin1 (-26.25, 0), Pin2 (26.25, 0) -- span 52.5px = 7 colonne BB (corretto)
- Gradiente 3D per corpo cilindrico
- Current flow indicator: dot animato che si muove tra -13 e 13

**NanoR4Board.jsx** (~350+ LOC):
- 46 pin totali (LEFT=15, RIGHT=15, WING=16)
- Scale 1.8:1 da DWG reale
- Board outline path con semicerchio sul bottom + wing a destra
- USB-C, MCU chip, Reset button, VIN terminal block -- tutti sub-components
- Pin positions calcolate da breakout pad coordinates (non Nano header) -- corretto per wiring

**Multimeter.jsx** (~200+ LOC):
- Probe drag via onProbeMove callback + probePositions props
- Mode cycling V/Ohm/A con knob click
- Display LCD con font Fira Code monospace
- Probe wires: bezier curves dinamiche verso posizioni draggabili
- Snap glow quando probe e' vicino a un pin valido

### Bug trovati

**B4 (gia' contato)** -- LED Vf mismatch (2.0 in LED.jsx vs 2.8 in CircuitSolver.js per green)

**B11 (P2)** -- Multimeter probe drag richiede onProbeMove dal parent
- File: `Multimeter.jsx:22-25`
- Se `onProbeMove` non e' passato, il probe non e' draggabile ma non c'e' feedback visivo
- L'utente vede le sonde ma non puo' interagire -- confuso per un bambino
- **Severita'**: P2 (UX confuso, non crash)

**B12 (P3)** -- Multimeter knob `onClick` chiama `onInteract(id, 'cycle-mode')` ma il componente riceve `id` come prop
- File: `Multimeter.jsx:147`
- Il callback passa `id` (string) come primo argomento, ma `handleComponentClick` in NES si aspetta `componentId` come primo arg
- Funziona perche' l'`id` prop IS il componentId, ma e' un accidental coupling
- **Severita'**: P3 (funziona, ma fragile)

### Verdict: WARN

---

## 8. UNDO/REDO (useUndoRedo.js ~115 LOC)

### Analisi

Implementazione con useRef per i dati (nessun re-render per ogni push) + useState counter per forzare re-render quando canUndo/canRedo cambiano.

API pulita: pushSnapshot, undo, redo, resetHistory, canUndo, canRedo.
MAX_HISTORY = 50.

### Bug trovati

**B13 (P1)** -- `cloneSnapshot` fa shallow copy di `layout` e `pinAssignments`
- File: `useUndoRedo.js:16-22`
```js
function cloneSnapshot(s) {
  return {
    layout: { ...s.layout },           // SHALLOW: nested objects (x,y) condivisi
    connections: s.connections.map(c => ({ ...c })),  // OK: 1 livello
    components: s.components.map(c => ({ ...c })),    // OK: 1 livello
    pinAssignments: { ...s.pinAssignments },          // OK: valori string
  };
}
```
- `layout` contiene `{ componentId: { x: N, y: N } }` -- lo spread operator copia solo il primo livello, quindi `layout[compId]` e' lo STESSO oggetto nel snapshot e nello stato corrente
- Se il layout viene mutato (es. drag component), lo snapshot viene corrotto retroattivamente
- **Mitigazione parziale**: `handleLayoutChange` in NES crea un NUOVO oggetto per il componente draggato con `setCustomLayout(prev => ({ ...prev, [componentId]: newPos }))`, quindi in pratica lo spread e' sufficiente SOLO SE la convenzione e' rispettata ovunque
- **Rischio residuo**: se qualsiasi codice muta `layout[compId].x` direttamente anziche' creare un nuovo oggetto, lo snapshot e' corrotto
- **Severita'**: P1 (data corruption silenziosa -- l'undo restora lo stato sbagliato)

**B14 (P2)** -- `canUndo`/`canRedo` sono calcolati nel render, non nello stato
- File: `useUndoRedo.js:111-112`
```js
canUndo: pastRef.current.length > 0,
canRedo: futureRef.current.length > 0,
```
- Questi valori sono computati al momento del render, leggendo dai ref. Il `tick()` forza un re-render per aggiornarli.
- Ma se il componente padre si ri-rende per un'altra ragione PRIMA che `tick()` venga chiamato, i valori potrebbero essere stale (mostrare il bottone undo come disabilitato quando in realta' c'e' history)
- **Severita'**: P2 (UI out of sync temporaneo, si risolve al prossimo render)

### Verdict: WARN

---

## 9. SAVE/LOAD (useCircuitStorage.js ~137 LOC)

### Analisi

- Auto-save ogni 5 secondi a localStorage con change detection (JSON string comparison)
- Export JSON: download via Blob + URL.createObjectURL + click
- Import JSON: file input con accept=".json", parsing + validazione shape
- Key formato: `elab-simulator-circuit-{experimentId}`

### Bug trovati

**B15 (P2)** -- Import JSON non da' feedback su failure
- File: `useCircuitStorage.js:119-120`
- Il `catch` block fa `resolve(false)` ma il chiamante in NES non mostra nessun messaggio di errore all'utente
- Un bambino carica un file corrotto e non succede niente -- nessun feedback
- **Severita'**: P2 (UX: utente non sa che l'import e' fallito)

**B16 (P3)** -- localStorage failure silenzioso su auto-save
- File: `useCircuitStorage.js:36-38`
- Se localStorage e' pieno, il catch blocca silenziosamente senza feedback
- Un bambino potrebbe perdere il lavoro senza saperlo
- **Severita'**: P3 (raro, localStorage ha ~5MB, i circuiti sono pochi KB)

**B17 (P3)** -- `exportJSON` non revoca URL.createObjectURL se il click fallisce
- File: `useCircuitStorage.js:94-95`
- `URL.revokeObjectURL(url)` e' chiamato immediatamente dopo `a.click()`, ma click() e' asincrono su alcuni browser
- Potenziale memory leak della Blob URL
- **Mitigazione**: i browser moderni gestiscono il revoke dopo il download
- **Severita'**: P3 (edge case browser-specific)

### Verdict: WARN

---

## 10. COPY/PASTE (SimulatorCanvas.jsx ~200 LOC sezione)

### Analisi

Implementato in SimulatorCanvas.jsx, riga 460-567:
- Ctrl+C: copia componenti selezionati + wire interni alla selezione
- Ctrl+V: incolla con offset (+20, +20), ID remapping, wire re-routing
- Ctrl+D: duplicate (copy+paste immediato)
- Clipboard e' useState locale al canvas (non system clipboard)

### Bug trovati

**B18 (P1)** -- Copy non preserva le proprieta' del componente (value, color)
- File: `SimulatorCanvas.jsx:475-491`
```js
const selComps = experiment.components.filter(c => selSet.has(c.id));
// ...
setClipboard({
  components: selComps.map(c => ({ ...c, _origPos: experiment.layout?.[c.id] })),
  // ...
});
```
- La copia preserva `type` e `id` originale del componente
- MA nel paste (riga 502-509):
```js
const newId = onComponentAdd(c.type, newPos);
```
- `onComponentAdd` crea un componente con valori DEFAULT, non con il valore del componente copiato
- Se copi un resistore da 1K, il paste crea un resistore da 470 (default)
- Lo stesso vale per LED color, capacitor value, etc.
- **Severita'**: P1 (funzionalita' broken -- il paste non e' un vero paste)

**B19 (P2)** -- Clipboard e' in-memory volatile (perso al cambio esperimento)
- File: `SimulatorCanvas.jsx:419`
- `const [clipboard, setClipboard] = useState(null)` -- state locale del canvas
- Quando l'utente cambia esperimento o torna alla lista, il clipboard e' perso
- **Severita'**: P2 (limitazione nota, ma frustrante)

**B20 (P2)** -- Paste non rispetta i confini del canvas
- File: `SimulatorCanvas.jsx:503-504`
- `const newPos = { x: origPos.x + offset, y: origPos.y + offset }` -- offset fisso +20
- Se il componente originale e' vicino al bordo destro/basso, il paste va fuori dal viewport
- Nessun clamping o centering sulla posizione del mouse
- **Severita'**: P2 (UX: componenti incollati fuori dal view)

### Verdict: WARN

---

## BUG TROVATI -- RIEPILOGO

| # | Severity | File | Linea | Descrizione |
|---|----------|------|-------|-------------|
| B4 | **P1** | CircuitSolver.js / Led.jsx | 23 / 13 | Green LED Vf mismatch: solver usa 2.8V, componente dichiara 2.0V |
| B13 | **P1** | useUndoRedo.js | 17 | cloneSnapshot shallow copy di layout -- potenziale data corruption |
| B18 | **P1** | SimulatorCanvas.jsx | 502-505 | Copy/Paste non preserva value/color dei componenti |
| B1 | P2 | NewElabSimulator.jsx | 1527 | reSolve via rAF potenziale stale closure |
| B3 | P2 | NewElabSimulator.jsx | 1694 | handleCompile chiude su currentExperiment stale |
| B5 | P2 | CircuitSolver.js | 1063-1080 | MNA re-solve loop 10 iterazioni -- pesante per circuiti grandi |
| B6 | P2 | CircuitSolver.js | 788-808 | _hasParallelPaths heuristic con falsi positivi |
| B11 | P2 | Multimeter.jsx | 22-25 | Probe non draggabile senza callback, nessun feedback |
| B14 | P2 | useUndoRedo.js | 111-112 | canUndo/canRedo calcolati in render, potenzialmente stale |
| B15 | P2 | useCircuitStorage.js | 119-120 | Import JSON failure senza feedback utente |
| B19 | P2 | SimulatorCanvas.jsx | 419 | Clipboard volatile -- perso al cambio esperimento |
| B20 | P2 | SimulatorCanvas.jsx | 503-504 | Paste senza clamping -- componenti fuori viewport |
| B2 | P3 | NewElabSimulator.jsx | ~545 | _avrSetupInProgress module-level flag (solo dev) |
| B7 | P3 | CircuitSolver.js | 1115 | Gaussian elimination pivot near-zero con continue |
| B8 | P3 | WireRenderer.jsx | 548-568 | normalize non gestisce breadboard-full (non usata) |
| B9 | P3 | experiments-vol1.js | 60-61 | code/hexFile null inutili su ogni exp Vol1 |
| B10 | P3 | experiments-vol1.js | 62-63 | concept/layer fields non usati (dead data) |
| B12 | P3 | Multimeter.jsx | 147 | onInteract accidental coupling su id prop |
| B16 | P3 | useCircuitStorage.js | 36-38 | localStorage full silenzioso |
| B17 | P3 | useCircuitStorage.js | 94-95 | Blob URL revoke timing |

**Totale: 3 P1, 9 P2, 8 P3**

---

## PUNTI DI FORZA

1. **Cleanup pattern solido**: `trackedTimeout`, cleanup su unmount, `destroy()` su solver/bridge
2. **MNA solver corretto**: Gaussian elimination con partial pivoting, LED voltage source model, reverse-bias detection
3. **AVR bridge dual-mode**: Worker + main-thread fallback con MessageChannel (non-throttled)
4. **ControlBar accessibile**: ARIA roles, keyboard nav, overflow menu con focus management
5. **Wire rendering**: bezier routing, net highlight con Union-Find, current flow animation con color coding
6. **Experiment data ricchi**: pinAssignments, buildSteps con hints, quiz con spiegazioni, galileoPrompt
7. **LED burned state**: feedback visivo eccellente (scorch, smoke, X, label) per insegnare i limiti dei componenti

## RACCOMANDAZIONI PRIORITARIE

1. **Fix B4 (P1)**: Allineare green LED Vf a un singolo valore (2.0V e' corretto per LED standard verdi, 2.8V e' sbagliato)
2. **Fix B13 (P1)**: Usare deep clone per layout in `cloneSnapshot`: `layout: Object.fromEntries(Object.entries(s.layout).map(([k, v]) => [k, { ...v }]))`
3. **Fix B18 (P1)**: Passare `value` e `color` nel paste: modificare `onComponentAdd` per accettare proprieta' opzionali, o aggiungere un `onComponentUpdate` post-add

---

## NOTA METODOLOGICA

Questa review e' basata esclusivamente su analisi statica del codice sorgente. Non e' stato eseguito nessun test runtime. Alcuni bug classificati come P2 potrebbero non manifestarsi in pratica grazie a safety net presenti nel codice (es. l'useEffect su mergedExperiment che rende ridondante il rAF reSolve). Viceversa, alcuni comportamenti runtime (timing, race conditions) potrebbero rivelare bug non identificabili da analisi statica.
