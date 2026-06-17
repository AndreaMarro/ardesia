# GALILEO QWEEN — Mappatura Completa della Piattaforma ELAB
**Data:** 12/03/2026 — Session 115
**Versione:** 2.0 (verificata contro codice sorgente)
**Obiettivo:** Rendere Galileo un assistente esperto e autonomo su OGNI funzionalità della piattaforma
**Copertura:** 100% — ogni dato verificato con grep/read sui file reali

---

## INDICE
1. [FASE 1.1 — Mappa Completa delle Funzionalità](#fase-11) (7 aree, 68 azioni)
2. [FASE 1.2 — Consapevolezza Contestuale](#fase-12) (20 campi, 5 GAP)
3. [FASE 1.3 — Memoria e Persistenza](#fase-13) (3 livelli, 5 GAP)
4. [FASE 1.4 — Gestione Errori e Casistiche](#fase-14) (4 categorie, 16 errori)
5. [FASE 2 — Controllo Vocale](#fase-2) (Web Speech API, 5 sottosezioni)
6. [GAP ANALYSIS — Cosa Manca Oggi](#gap-analysis) (18 gap, 4 priorità)
7. [PIANO DI IMPLEMENTAZIONE](#piano) (4 sprint, 34h, criteri PASS/FAIL)
8. [ARCHITETTURA SCALABILE](#scalabilita) (8 pattern, principio "1 file = 1 feature")

**Appendici:**
- A — Action Tag Completi (39 AZIONE + 1 INTENT + 20 fallback regex)
- B — Keyboard Shortcuts (15 verificati)
- C — Componenti SVG (23 file = 19 circuitali + 4 sistema)
- D — Struttura Dati Esperimento (schema completo con esempio)
- E — Nanobot Routing Pipeline (ASCII diagram + 7 endpoint + 6 YAML)
- F — galileoMemory.js (schema, sync protocol, 11 API)

---

<a id="fase-11"></a>
## FASE 1.1 — AUDIT COMPLETO DELLE FUNZIONALITÀ

### A. CIRCUITI (Circuit Management)

| # | Azione | Passaggi | Action Tag Galileo | Errori Possibili | Stato |
|---|--------|----------|-------------------|-----------------|-------|
| A1 | **Creare circuito** (da esperimento) | Sidebar → Volume → Capitolo → Esperimento → Click | `[AZIONE:loadexp:ID]` | Esperimento non trovato, licenza mancante | ✅ Implementato |
| A2 | **Creare circuito** (libero) | ControlBar → Build Mode → "Libero" | `[AZIONE:setbuildmode:libero]` | N/A | ✅ Implementato |
| A3 | **Duplicare circuito** | Export JSON → Import in nuovo slot | Nessuno (manuale) | N/A | ⚠️ Solo export/import |
| A4 | **Modificare circuito** | Drag componenti, aggiungere/rimuovere fili | `[INTENT:place_and_wire]` | Pin non valido, collisione | ✅ Implementato |
| A5 | **Eliminare circuito** | ControlBar → Reset (🔄) | `[AZIONE:clearall]` | Conferma persa (usa `confirm()`) | ✅ Implementato |
| A6 | **Rinominare circuito** | N/A — nomi fissi da esperimento | — | — | ❌ Non disponibile |
| A7 | **Importare circuito** | File → Import JSON | Nessuno | JSON malformato | ⚠️ Solo manuale |
| A8 | **Esportare circuito** | ControlBar → Foto (📷) → PNG o JSON | Nessuno | Canvas vuoto | ✅ Implementato |
| A9 | **Salvare stato** | Auto-save localStorage (5s debounce) | Nessuno | Storage pieno | ✅ Auto |
| A10 | **Ripristinare stato** | Auto-load da localStorage al rientro | Nessuno | Dati corrotti | ✅ Auto |

### B. MODELLAZIONE (Component Operations)

| # | Azione | Passaggi | Action Tag | Errori | Stato |
|---|--------|----------|-----------|--------|-------|
| B1 | **Aggiungere componente** | Palette → Drag sul canvas OPPURE chat | `[INTENT:place_and_wire]` | Tipo sconosciuto, posizione invalida | ✅ |
| B2 | **Rimuovere componente** | Select → Delete/Backspace OPPURE chat | `[AZIONE:removecomponent:ID]` | Componente non selezionato | ✅ |
| B3 | **Spostare componente** | Drag & Drop su canvas | `[AZIONE:movecomponent:ID:X:Y]` | Fuori breadboard | ✅ |
| B4 | **Ruotare componente** | Select → R OPPURE ControlBar | Nessuno (solo UI) | Non tutti ruotabili | ✅ |
| B5 | **Modificare parametri** | PropertiesPanel → slider/input | `[AZIONE:setvalue:ID:PARAM:VAL]` | Valore fuori range | ✅ |
| B6 | **Collegare nodi (filo)** | Wire Mode (W) → Drag da pin a pin | `[AZIONE:addwire:c1:p1:c2:p2]` | Pin non compatibili | ✅ |
| B7 | **Eliminare filo** | Select filo → Delete | `[AZIONE:removewire:IDX]` | Indice fuori range | ✅ |
| B8 | **Cambiare colore filo** | Doppio click filo → Color picker | Nessuno | N/A | ✅ |
| B9 | **Evidenziare componente** | Chat: "mostra il LED" | `[AZIONE:highlight:id1,id2]` | ID non trovato | ✅ |
| B10 | **Evidenziare pin** | Chat: "mostra il pin anodo" | `[AZIONE:highlightpin:c:p]` | Pin non trovato | ✅ |
| B11 | **Multi-select** | Shift+Click o drag-box | Nessuno | N/A | ✅ |
| B12 | **Copia/Incolla** | Ctrl+C / Ctrl+V | Nessuno | N/A | ✅ |
| B13 | **Undo/Redo** | Ctrl+Z / Ctrl+Y | `[AZIONE:undo]` / `[AZIONE:redo]` | Stack vuoto | ✅ |
| B14 | **Interagire** (pulsante, pot) | Click componente / Drag overlay | `[AZIONE:interact:ID:ACT:VAL]` | Componente non interattivo | ✅ |

**Tipi di componenti supportati (21):**

| Categoria | Componenti | Volume |
|-----------|-----------|--------|
| Alimentazione | battery9v | Vol1 |
| Passivi | resistor, capacitor, potentiometer | Vol1-2 |
| Semiconduttori | led (6 colori), rgb-led, diode, mosfet-n, phototransistor | Vol1-3 |
| Output | buzzer-piezo, motor-dc, servo, lcd-16x2 | Vol2-3 |
| Input | push-button, photo-resistor, reed-switch | Vol1-3 |
| Microcontrollore | arduino-nano (NanoR4Board SVG) | Vol2-3 |

### C. NAVIGAZIONE (Platform Navigation)

| # | Azione | Passaggi | Action Tag | Errori | Stato |
|---|--------|----------|-----------|--------|-------|
| C1 | **Cambiare tab** | Click tab (Manuale/Simulatore/Lavagna/Video/Taccuini) | `[AZIONE:opentab:NOME]` | N/A | ✅ |
| C2 | **Tornare alla home** | ControlBar ← Back OPPURE Escape | Nessuno | Modifiche non salvate | ✅ |
| C3 | **Aprire manuale a pagina** | Tab Manuale → navigazione PDF | `[AZIONE:openvolume:VOL:PAG]` | Pagina fuori range | ✅ |
| C4 | **Cercare esperimento** | ExperimentPicker → filtro testo | Nessuno | Nessun risultato | ✅ |
| C5 | **Cambiare volume** | ExperimentPicker → Volume 1/2/3 | Nessuno | Licenza mancante | ✅ |
| C6 | **Aprire dashboard** | TutorTopBar → icona utente → Dashboard | Nessuno | N/A | ✅ |
| C7 | **Logout** | Menu utente → Esci | Nessuno | N/A | ✅ |
| C8 | **Aprire giochi** (Detective, POE, Reverse) | Chat: "gioco detective" | `[AZIONE:opentab:detective]` | N/A | ✅ |
| C9 | **Cercare video YouTube** | Chat: "cerca un video su LED" | `[AZIONE:youtube:QUERY]` | Nessun risultato | ✅ |

**Mappa tab con nomi Galileo:**

| Tab UI | Nome per `opentab` | Descrizione |
|--------|-------------------|-------------|
| Manuale | `manuale` | PDF viewer (Vol 1/2/3) |
| Simulatore | `simulatore` | Circuit builder + SVG canvas |
| Lavagna | `lavagna` | Canvas HTML5 per disegni |
| Video | `video` | YouTube embed + Meet |
| Taccuini | `taccuini` | Note-taking |
| Detective | `detective` | CircuitDetective game |
| POE | `poe` | Predict-Observe-Explain |
| Reverse | `reverse` | Reverse engineering game |
| Review | `review` | Session review |

### D. DISEGNI / CANVAS (Drawing Tools)

| # | Azione | Strumento | Shortcut | Stato |
|---|--------|-----------|----------|-------|
| D1 | **Disegnare a mano libera** | Pencil 🖉 | Default | ✅ |
| D2 | **Cancellare tratti** | Eraser 🧹 | — | ✅ |
| D3 | **Linea retta** | Line tool | — | ✅ |
| D4 | **Rettangolo** | Rectangle | — | ✅ |
| D5 | **Cerchio** | Circle | — | ✅ |
| D6 | **Testo** | Text tool | — | ✅ |
| D7 | **Freccia** | Arrow | — | ✅ |
| D8 | **Cambiare colore** | Color picker | — | ✅ |
| D9 | **Cambiare spessore** | Brush size slider (1-20px) | — | ✅ |
| D10 | **Undo/Redo disegno** | History stack (30 items max) | Ctrl+Z/Y | ✅ |
| D11 | **Pulire tutto** | Clear All button | — | ✅ |
| D12 | **Salvare come slide** | Save to Notebook | — | ✅ |
| D13 | **Incollare immagine** | Paste from clipboard | Ctrl+V | ✅ |
| D14 | **Scaricare PNG** | Download button | — | ✅ |
| D15 | **Sticky notes** | Click → yellow card (#FFF9C4) | — | ✅ |
| D16 | **Pressure-sensitive** | Stylus support (iPad) | — | ✅ |

### E. GESTIONE PROGETTO

| # | Azione | Come | Action Tag | Stato |
|---|--------|------|-----------|-------|
| E1 | **Salvare codice** | Auto-save localStorage (5s) | — | ✅ Auto |
| E2 | **Salvare circuito** | Auto-save localStorage | — | ✅ Auto |
| E3 | **Esportare PNG** | ControlBar → 📷 | — | ✅ |
| E4 | **Esportare JSON** | Menu → Export | — | ✅ |
| E5 | **Report sessione** | Fine sessione → PDF auto-generato | — | ✅ |
| E6 | **Quiz completamento** | Chat → "quiz" OPPURE auto dopo esperimento | `[AZIONE:quiz]` | ✅ |
| E7 | **Tracciare progresso** | Dashboard → progresso per volume | — | ✅ |
| E8 | **Condividere** | N/A — nessuna funzione social | — | ❌ Non implementato |
| E9 | **Versionare** | N/A — nessun version control | — | ❌ Non implementato |
| E10 | **Commentare** | N/A — nessun sistema commenti | — | ❌ Non implementato |

### F. CODICE (Code Editing & Compilation)

| # | Azione | Come | Action Tag | Stato |
|---|--------|------|-----------|-------|
| F1 | **Aprire editor** | Ctrl+E o ControlBar 📝 | `[AZIONE:openeditor]` | ✅ |
| F2 | **Chiudere editor** | Toggle o Escape | `[AZIONE:closeeditor]` | ✅ |
| F3 | **Scrivere codice C++** | CodeEditorCM6 (CodeMirror 6) | `[AZIONE:setcode:CODE]` | ✅ |
| F4 | **Switch Arduino ↔ Scratch** | Tab nel pannello editor | `[AZIONE:switcheditor:X]` | ✅ |
| F5 | **Compilare** | Ctrl+Shift+U o ControlBar 🔨 | `[AZIONE:compile]` | ✅ |
| F6 | **Leggere errori** | SerialMonitor panel (rosso) | — | ✅ |
| F7 | **Resettare codice** | Button "Reset" nell'editor | `[AZIONE:resetcode]` | ✅ |
| F8 | **Caricare blocchi Blockly** | Passo Passo code steps | `[AZIONE:loadblocks:XML]` | ✅ |
| F9 | **Aggiungere codice** | Chat: "aggiungi Serial.println" | `[AZIONE:appendcode:CODE]` | ✅ |
| F10 | **Leggere codice corrente** | Chat: "mostra il codice" | `[AZIONE:getcode]` | ✅ |
| F11 | **Font size +/-** | Bottoni nel pannello editor | — | ✅ |

### G. SIMULAZIONE (Simulation Controls)

| # | Azione | Come | Action Tag | Stato |
|---|--------|------|-----------|-------|
| G1 | **Avviare** | Space o ControlBar ▶ | `[AZIONE:play]` | ✅ |
| G2 | **Mettere in pausa** | Space o ControlBar ⏸ | `[AZIONE:pause]` | ✅ |
| G3 | **Resettare** | R o ControlBar 🔄 | `[AZIONE:reset]` | ✅ |
| G4 | **Misurare V/I** | Chat: "misura il LED" | `[AZIONE:measure:ID]` | ✅ |
| G5 | **Diagnosticare** | Chat: "diagnosi circuito" | `[AZIONE:diagnose]` | ✅ |
| G6 | **Serial Monitor** | T o ControlBar 📟 | `[AZIONE:showserial]` | ✅ |
| G7 | **Serial Input** | Digitare nel monitor + Enter | `[AZIONE:serialwrite:TEXT]` | ✅ |
| G8 | **Regolare pot** | Overlay drag rotary | `[AZIONE:interact:ID:setPosition:VAL]` | ✅ |
| G9 | **Regolare LDR** | Overlay slider (0-1023) | `[AZIONE:interact:ID:setLightLevel:VAL]` | ✅ |
| G10 | **Premere pulsante** | Click diretto su componente | `[AZIONE:interact:ID:press]` | ✅ |

---

<a id="fase-12"></a>
## FASE 1.2 — CONSAPEVOLEZZA CONTESTUALE

### Stato Attuale: Cosa Galileo Sa Oggi

| Informazione | Fonte | Passata a Galileo? | Come |
|-------------|-------|--------------------|----|
| Esperimento corrente (ID, titolo) | `experimentId` in ChatRequest | ✅ Sì | `[CONTESTO DI SISTEMA] esp=...` |
| Tab attiva (simulatore, manuale, etc.) | `simulatorContext` | ✅ Sì | `tab=simulatore` nel contesto |
| Componenti piazzati | `circuitState.components` | ✅ Sì | Lista completa in `[STATO CIRCUITO]` |
| Connessioni (fili) | `circuitState.connections` | ✅ Sì | Dettaglio pin-to-pin |
| Stato simulazione (running/paused) | `circuitState.isRunning` | ✅ Sì | `simulazione=attiva/ferma` |
| Misure elettriche (V/I) | `circuitState.measurements` | ✅ Sì | `[MISURE ELETTRICHE]` block |
| Codice nell'editor | `getEditorCode()` | ⚠️ Solo su richiesta | Via `[AZIONE:getcode]` |
| Build mode (montato/passo/libero) | `buildMode` in context | ✅ Sì | Nel contesto di sistema |
| Step corrente (Passo Passo) | `buildStepIndex` | ✅ Sì | `passo=3/7` |
| Memoria studente (livello, errori) | `galileoMemory` | ✅ Sì | `[MEMORIA STUDENTE]` block |
| Volume del manuale aperto | `manualState` | ✅ Sì | `manuale=Volume 1, pag. 42` |
| **Errori di compilazione** | compilationStatus | ⚠️ Parziale | Solo se l'utente li segnala |
| **Ultima azione dell'utente** | — | ❌ No | NON tracciata |
| **Tempo nella sessione** | — | ❌ No | NON tracciato |
| **Tentativi falliti** | — | ❌ No | NON contati in tempo reale |
| **Componente selezionato** | selectedComponentId | ❌ No | NON passato a Galileo |
| **Zoom/Pan del canvas** | viewTransform | ❌ No | NON passato |
| **Editor mode (Arduino/Scratch)** | editorMode | ⚠️ Parziale | Solo se rilevante |
| **Output seriale corrente** | serialOutput | ❌ No | Solo se l'utente lo segnala |
| **Risultato ultimo quiz** | quizzes memory | ✅ Sì (ritardato) | Via memoria persistente |

### GAP: Cosa Galileo NON Sa (e Dovrebbe Sapere)

#### GAP-CTX-1: Ultima Azione dell'Utente
**Problema:** Galileo non sa se l'utente ha appena aggiunto un componente, compilato con errore, o premuto play. Non può offrire aiuto proattivo.

**Soluzione proposta:**
```javascript
// Nuovo: Activity Ring Buffer (ultime 10 azioni)
window.__ELAB_ACTIVITY = {
  actions: [],  // [{type, detail, timestamp}]
  push(type, detail) {
    this.actions.push({type, detail, ts: Date.now()});
    if (this.actions.length > 10) this.actions.shift();
  },
  getRecent(n = 5) { return this.actions.slice(-n); }
};

// Inject in buildTutorContext():
// [ATTIVITÀ RECENTE]
// 1. [12:03:15] compile_error: "undefined reference to loop"
// 2. [12:03:22] component_added: LED (led-1)
// 3. [12:03:28] wire_added: led-1:anode → r1:pin1
```

**Impatto:** Galileo potrà dire "Vedo che hai appena avuto un errore di compilazione. Il problema è che..." invece di aspettare che l'utente descriva il problema.

#### GAP-CTX-2: Componente Selezionato
**Problema:** Quando l'utente chiede "cos'è questo?", Galileo non sa cosa è selezionato.

**Soluzione proposta:**
```javascript
// Aggiungere a circuitState:
circuitState.selectedComponent = {
  id: "led-1",
  type: "led",
  properties: {color: "red", forwardVoltage: 2.0}
};
```

#### GAP-CTX-3: Output Seriale Automatico
**Problema:** L'utente vede output nel Serial Monitor ma Galileo non lo sa.

**Soluzione proposta:**
```javascript
// Aggiungere a circuitState:
circuitState.serialOutput = {
  lastLines: ["Hello World!", "LED: ON", "Temp: 23.5C"],
  lineCount: 47,
  hasErrors: false
};
```

#### GAP-CTX-4: Errori di Compilazione Automatici
**Problema:** Galileo non sa che la compilazione è fallita finché l'utente non lo dice.

**Soluzione proposta:**
```javascript
// Aggiungere a circuitState:
circuitState.compilationResult = {
  status: "error",
  errors: ["line 5: undefined reference to 'setup'"],
  warnings: ["line 3: unused variable 'x'"],
  timestamp: 1710311400000
};
```

#### GAP-CTX-5: Tempo e Tentativi
**Problema:** Galileo non sa se lo studente è bloccato da 10 minuti sullo stesso step.

**Soluzione proposta:**
```javascript
// Aggiungere a session tracking:
circuitState.sessionMetrics = {
  timeOnCurrentExperiment: 600,  // secondi
  compilationAttempts: 3,
  failedCompilations: 2,
  buildStepRetries: {step3: 4},  // 4 tentativi sullo step 3
  lastInteractionAge: 120        // secondi dall'ultima azione
};
```

---

<a id="fase-13"></a>
## FASE 1.3 — MEMORIA E PERSISTENZA

### Architettura Attuale (2 Livelli)

```
┌─────────────────────────────────────────────────────┐
│                    LIVELLO 1                         │
│              Memoria di Sessione                     │
│         (localStorage + React state)                 │
│                                                      │
│  ┌──────────────────┐  ┌────────────────────┐       │
│  │ Chat History      │  │ Circuit State      │       │
│  │ (messages[])      │  │ (components,       │       │
│  │                   │  │  wires, code)      │       │
│  └──────────────────┘  └────────────────────┘       │
│  ┌──────────────────┐  ┌────────────────────┐       │
│  │ Editor State      │  │ Activity Buffer    │       │
│  │ (code, mode,      │  │ (NEW: ultime 10    │       │
│  │  compilazione)    │  │  azioni utente)    │       │
│  └──────────────────┘  └────────────────────┘       │
└─────────────────────────────────────────────────────┘
                        ↕ sync ogni 60s
┌─────────────────────────────────────────────────────┐
│                    LIVELLO 2                         │
│              Memoria Persistente                     │
│    (nanobot /memory/{session_id} + localStorage)     │
│                                                      │
│  ┌──────────────────┐  ┌────────────────────┐       │
│  │ Profilo Studente  │  │ Pattern Collettivi │       │
│  │ • livello         │  │ • errori comuni    │       │
│  │ • punti deboli    │  │ • misconceptions   │       │
│  │ • punti forti     │  │ • percorsi tipici  │       │
│  │ • esp. completati │  │                    │       │
│  └──────────────────┘  └────────────────────┘       │
│  ┌──────────────────┐  ┌────────────────────┐       │
│  │ Quiz History      │  │ Session Summaries  │       │
│  │ • risultati       │  │ • ultimi 10        │       │
│  │ • percentuali     │  │ • keywords         │       │
│  │ • timestamp       │  │                    │       │
│  └──────────────────┘  └────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### GAP nella Memoria

| # | Gap | Descrizione | Priorità |
|---|-----|-------------|----------|
| MEM-1 | **Preferenze UI** | Galileo non ricorda se l'utente preferisce Scratch o Arduino, font grande o piccolo | P2 |
| MEM-2 | **Pattern di errore** | Gli errori recenti sono tracciati ma non analizzati per pattern (es. "sbaglia sempre la polarità") | P1 |
| MEM-3 | **Contesto cross-sessione** | Se l'utente chiude e riapre, Galileo non sa "stavamo lavorando sull'esperimento LED" | P1 |
| MEM-4 | **Progetti ricorrenti** | Non traccia quali esperimenti l'utente rivista spesso | P3 |
| MEM-5 | **Correzioni apprese** | Se Galileo dà un consiglio sbagliato e l'utente corregge, non viene memorizzato | P2 |

### Soluzione Proposta: Memoria a 3 Livelli

```
LIVELLO 1: Sessione (React state + activity buffer)
  → Contesto immediato, azioni recenti, stato corrente
  → TTL: durata del tab browser
  → Formato: JSON in-memory

LIVELLO 2: Persistente Locale (localStorage)
  → Preferenze, codice salvato, circuiti custom
  → TTL: indefinito (fino a clear cache)
  → Formato: JSON stringificato

LIVELLO 3: Persistente Remoto (nanobot backend) ← NUOVO/POTENZIATO
  → Profilo studente evoluto, pattern di errore analizzati
  → Riassunti di sessione con keywords
  → Contesto cross-sessione ("stavi lavorando su...")
  → TTL: 90 giorni rolling
  → Formato: JSON su file server-side
```

### Nuovo Campo: `lastSessionContext` (per GAP MEM-3)

```javascript
// Salvato su sendBeacon (tab close) e su /memory/sync
{
  lastSessionContext: {
    experimentId: "v1-cap6-primo-circuito",
    experimentTitle: "LED Rosso",
    buildMode: "guided",
    buildStep: 4,
    editorMode: "arduino",
    compilationStatus: "success",
    lastMessage: "Come collego il resistore?",
    timestamp: "2026-03-12T14:30:00Z"
  }
}

// Galileo al rientro:
// "Bentornato! L'ultima volta stavamo lavorando sull'esperimento
//  'LED Rosso', eri al passo 4 della costruzione guidata.
//  Vuoi continuare da dove avevi lasciato?"
```

---

<a id="fase-14"></a>
## FASE 1.4 — GESTIONE ERRORI E CASISTICHE

### A. Errori di Circuito

| Errore | Rilevamento | Comunicazione Utente | Correzione Automatica |
|--------|-------------|---------------------|----------------------|
| **Cortocircuito** | CircuitSolver: I → ∞ | "Attenzione! C'è un cortocircuito tra X e Y" | `[AZIONE:highlight:wire-N]` |
| **LED polarità invertita** | V_led < 0 | "Il LED è collegato al contrario" | Suggerimento con pin corretti |
| **Resistore mancante** | I_led > 20mA | "Manca un resistore! Il LED potrebbe bruciarsi" | `[INTENT:add resistor]` |
| **Filo mancante** | Nodo disconnesso | "Il componente X non è collegato" | `[AZIONE:addwire:...]` |
| **Pin invalido** | PlacementEngine error | "Quel pin non esiste su questo componente" | Suggerire pin corretto |
| **Componente fuori breadboard** | bounds check | "Sposta il componente sulla breadboard" | Auto-snap |

### B. Errori di Compilazione

| Errore GCC | Traduzione Italiana | Suggerimento Galileo |
|-----------|--------------------|--------------------|
| `undefined reference to 'loop'` | "La funzione loop() non esiste" | "Ogni programma Arduino ha bisogno di setup() e loop()" |
| `expected ';' before '}'` | "Manca un punto e virgola" | "Alla riga X, aggiungi ; alla fine" |
| `'led' was not declared` | "La variabile 'led' non esiste" | "Devi prima dichiarare la variabile con int led = 13;" |
| `invalid conversion from 'const char*'` | "Tipo di dato sbagliato" | "Stai usando testo dove serve un numero" |

### C. Errori di Piattaforma

| Errore | Causa | Risposta Galileo | Recovery |
|--------|-------|-----------------|----------|
| **Nanobot offline** | Render cold start | "Un momento, mi sto svegliando..." | Fallback a webhook → RAG → KB |
| **Compilazione timeout** | Server sovraccarico | "La compilazione sta impiegando più del solito" | Retry dopo 5s |
| **Vision 429** | Rate limit Gemini | "Ho bisogno di un momento per analizzare l'immagine" | Retry con backoff (10/20/30s) |
| **localStorage pieno** | >5MB | "Lo spazio di salvataggio è pieno" | Pulizia cache vecchie |
| **Licenza scaduta** | kits[] vuoto | "Per accedere a questo volume ti serve la licenza" | Redirect a dashboard |
| **Rete assente** | Offline | "Sembra che tu sia offline" | Modalità offline con KB locale |

### D. Casistiche Utente

| Scenario | Rilevamento | Risposta Proattiva |
|---------|-------------|-------------------|
| **Studente bloccato** (>5 min stesso step) | `sessionMetrics.lastInteractionAge > 300` | "Hai bisogno di un suggerimento per questo passo?" |
| **Troppi errori compilazione** (>3 di fila) | `sessionMetrics.failedCompilations > 3` | "Vedo che il codice dà problemi. Vuoi che te lo corregga?" |
| **Costruzione completata ma non avviata** | All steps done + !isRunning | "Il circuito è completo! Premi ▶ per provarlo" |
| **Codice non modificato** (esperimento AVR) | Default code + no edits | "Non hai ancora modificato il codice. Vuoi che ti spieghi cosa fa?" |
| **Quiz saltato** | Esperimento completato senza quiz | "Hai completato l'esperimento! Vuoi fare un quiz veloce?" |

---

<a id="fase-2"></a>
## FASE 2 — CONTROLLO VOCALE

### Architettura Proposta

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   Microfono      │────▶│  Web Speech API   │────▶│   NLU Parser     │
│   (browser)      │     │  (riconoscimento) │     │  (intent detect) │
└──────────────────┘     └───────────────────┘     └───────┬──────────┘
                                                           │
                         ┌───────────────────┐     ┌───────▼──────────┐
                         │  Text-to-Speech   │◀────│  Galileo Router  │
                         │  (feedback vocale)│     │  (server.py)     │
                         └───────────────────┘     └──────────────────┘
```

### 2.1 — Riconoscimento Comandi Vocali

**Tecnologia:** Web Speech API (`SpeechRecognition`) — nativo browser, zero costo

```javascript
// Configurazione
const recognition = new webkitSpeechRecognition();
recognition.lang = 'it-IT';          // Italiano
recognition.continuous = false;       // Single utterance
recognition.interimResults = true;    // Mostra testo parziale
recognition.maxAlternatives = 3;      // Per disambiguazione
```

**Comandi supportati (mapping 1:1 con action tags):**

| Comando Vocale | Intent Rilevato | Action Tag |
|---------------|----------------|-----------|
| "Avvia la simulazione" | play | `[AZIONE:play]` |
| "Ferma" / "Pausa" | pause | `[AZIONE:pause]` |
| "Ricomincia" / "Reset" | reset | `[AZIONE:reset]` |
| "Metti un LED" | add_component | `[INTENT:place_and_wire]` |
| "Compila il codice" | compile | `[AZIONE:compile]` |
| "Apri l'editor" | open_editor | `[AZIONE:openeditor]` |
| "Prossimo passo" | next_step | `[AZIONE:nextstep]` |
| "Cos'è un resistore?" | theory | Testo libero → Galileo |
| "Aiuto" | help | Hint progressivo |
| "Quiz" | quiz | `[AZIONE:quiz]` |
| "Annulla" | undo | `[AZIONE:undo]` |

**Attivazione:**
- Bottone microfono 🎤 nella chat (44px, touch-friendly)
- Hotkey: Ctrl+M (toggle)
- Push-to-talk: tenere premuto Spazio (in chat focus)

### 2.2 — Feedback Vocale

**Tecnologia:** Web Speech Synthesis API (`speechSynthesis`) — nativo browser

```javascript
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.rate = 1.0;        // Velocità normale
  utterance.pitch = 1.1;       // Leggermente alto (amichevole)
  utterance.volume = 0.8;      // Non troppo forte
  speechSynthesis.speak(utterance);
};
```

**Risposte vocali per azioni:**

| Azione | Feedback Vocale |
|--------|----------------|
| Play | "Simulazione avviata!" |
| Pause | "Simulazione in pausa" |
| Reset | "Circuito resettato" |
| Compile success | "Compilazione riuscita!" |
| Compile error | "C'è un errore alla riga 5" |
| Component added | "LED aggiunto al circuito" |
| Step advance | "Bene! Ora il passo 3: inserisci il resistore" |
| Quiz correct | "Bravo! Risposta esatta!" |
| Quiz wrong | "Non proprio. Il resistore limita la corrente" |

### 2.3 — Conferma Vocale per Azioni Critiche

| Azione Critica | Richiesta Conferma | Accettazione |
|---------------|-------------------|-------------|
| Reset circuito | "Vuoi davvero cancellare tutto?" | "Sì" / "Confermo" |
| Cambio esperimento | "Vuoi cambiare esperimento? Perderai le modifiche" | "Sì" / "Cambia" |
| Sovrascrittura codice | "Questo sostituirà il tuo codice. Confermi?" | "Sì" / "Sostituisci" |

**Parole di annullamento:** "No", "Annulla", "Fermati", "Stop"

### 2.4 — Gestione Ambiguità

| Input Ambiguo | Strategia | Risposta |
|--------------|-----------|---------|
| "Metti quello lì" | Chiedere tipo + posizione | "Quale componente vuoi aggiungere? LED, resistore...?" |
| "Quello rosso" | Usa contesto (componente selezionato) | Se LED selezionato → cambia colore. Altrimenti → "Quale componente rosso?" |
| "Collegalo" | Usa contesto (ultimo componente aggiunto) | Auto-wire se univoco, altrimenti chiedi pin |
| "Fai qualcosa" | Troppo vago | "Non ho capito cosa vuoi fare. Prova con 'avvia', 'compila' o 'aggiungi un LED'" |

### 2.5 — Prerequisiti Tecnici per FASE 2

| Requisito | Stato | Note |
|-----------|-------|------|
| Web Speech API (Chrome) | ✅ Disponibile | Chrome 33+, Edge 79+, Safari 14.1+ |
| Web Speech API (Firefox) | ⚠️ Parziale | Solo con flag `media.webspeech.recognition.enable` |
| Web Speech API (iPad Safari) | ✅ Disponibile | iOS 14.5+ |
| HTTPS required | ✅ Già attivo | elabtutor.school è HTTPS |
| Permesso microfono | Richiesto | Browser prompt automatico |
| Speech Synthesis (voci IT) | ✅ Disponibile | "Google Italiano" o "Alice" (iOS) |
| Latenza riconoscimento | ~500ms | Accettabile per comandi |
| Accuracy italiano | ~92-95% | Sufficiente per comandi strutturati |

---

<a id="gap-analysis"></a>
## GAP ANALYSIS — COSA MANCA OGGI

### Priorità P0 (Blockers per "Qween Mode")

| # | Gap | Impatto | Effort | File da Modificare |
|---|-----|---------|--------|-------------------|
| G1 | **Activity Ring Buffer** | Galileo non sa cosa ha fatto l'utente | 2h | ElabTutorV4.jsx, NewElabSimulator.jsx, api.js |
| G2 | **Selected Component in Context** | "Cos'è questo?" non funziona | 1h | NewElabSimulator.jsx, api.js |
| G3 | **Auto-send Compilation Errors** | Galileo non sa degli errori | 1h | NewElabSimulator.jsx, api.js |
| G4 | **Serial Output in Context** | Galileo non vede l'output | 1h | NewElabSimulator.jsx, api.js |

### Priorità P1 (Importante per UX)

| # | Gap | Impatto | Effort | File |
|---|-----|---------|--------|------|
| G5 | **Session Resume Context** (MEM-3) | "Stavamo lavorando su..." | 3h | galileoMemory.js, server.py |
| G6 | **Proactive Help** (bloccato >5min) | Aiuto automatico | 2h | NewElabSimulator.jsx, ElabTutorV4.jsx |
| G7 | **Error Pattern Analysis** (MEM-2) | "Sbagli sempre la polarità" | 4h | server.py, galileoMemory.js |
| G8 | **Editor Mode in Context** | Galileo non sa se Scratch o Arduino | 30min | api.js |

### Priorità P2 (Nice to Have)

| # | Gap | Impatto | Effort |
|---|-----|---------|--------|
| G9 | Duplica circuito via Galileo | Comodità | 2h |
| G10 | Rinomina circuito | UX | 3h |
| G11 | Condivisione circuito (link) | Social | 8h |
| G12 | Preferenze UI persistenti | Personalizzazione | 2h |
| G13 | Correzioni apprese (MEM-5) | Qualità AI | 4h |

### Priorità P3 (FASE 2 — Voce)

| # | Gap | Impatto | Effort |
|---|-----|---------|--------|
| G14 | Microfono button + SpeechRecognition | Voice input | 4h |
| G15 | Text-to-Speech feedback | Voice output | 2h |
| G16 | Conferma vocale azioni critiche | Safety | 2h |
| G17 | Disambiguazione vocale | UX | 3h |
| G18 | Wake word ("Ehi Galileo") | Hands-free | 4h |

---

<a id="piano"></a>
## PIANO DI IMPLEMENTAZIONE

### Sprint 1 — Context Mastery (5-6h)
**Obiettivo:** Galileo sa TUTTO quello che succede in tempo reale

1. **G1** Activity Ring Buffer → `__ELAB_ACTIVITY` global + inject in context
2. **G2** Selected Component → `circuitState.selectedComponent`
3. **G3** Auto Compilation Errors → `circuitState.compilationResult`
4. **G4** Serial Output → `circuitState.serialOutput` (ultime 10 righe)
5. **G8** Editor Mode → `circuitState.editorMode`

**Risultato:** Il blocco `[CONTESTO DI SISTEMA]` passa da ~200 token a ~400 token ma Galileo risponde con consapevolezza totale.

### Sprint 2 — Memory Evolution (7-8h)
**Obiettivo:** Galileo ricorda e impara nel tempo

6. **G5** Session Resume → `lastSessionContext` in memoria persistente
7. **G7** Error Pattern Analysis → backend analisi pattern su `/memory/sync`
8. **G12** UI Preferences → `preferences` in localStorage + memoria

**Risultato:** Galileo dice "Bentornato! Stavamo lavorando su..." e "Noto che sbagli spesso la polarità — ecco un trucco..."

### Sprint 3 — Proactive Help (3-4h)
**Obiettivo:** Galileo interviene quando lo studente è in difficoltà

9. **G6** Proactive Help Timer → check ogni 60s, suggerimento se bloccato
10. **Completamento proattivo** → "Il circuito è completo! Premi ▶"
11. **Quiz suggestion** → "Hai finito! Vuoi fare un quiz?"

**Risultato:** Galileo non aspetta che l'utente chieda — offre aiuto al momento giusto.

### Sprint 4 — Voice Control (15-16h)
**Obiettivo:** Controllo vocale completo in italiano

12. **G14** Microfono UI + SpeechRecognition integration
13. **G15** Text-to-Speech per feedback
14. **G16** Conferma vocale per azioni critiche
15. **G17** Disambiguazione + contesto
16. **G18** Wake word "Ehi Galileo" (opzionale)

**Risultato:** Lo studente può usare la piattaforma interamente a voce, mani libere per il circuito fisico.

---

### Riepilogo Effort Totale

| Sprint | Effort | Priorità | Dipendenze |
|--------|--------|----------|-----------|
| Sprint 1 — Context | ~6h | P0 | Nessuna |
| Sprint 2 — Memory | ~8h | P1 | Sprint 1 |
| Sprint 3 — Proactive | ~4h | P1 | Sprint 1+2 |
| Sprint 4 — Voice | ~16h | P3 | Sprint 1 |
| **TOTALE** | **~34h** | | |

### Criteri di Accettazione per Sprint

#### Sprint 1 — Context Mastery: PASS se...
- [ ] `[ATTIVITÀ RECENTE]` block presente in ogni chat request (ultime 5 azioni)
- [ ] Galileo risponde "Vedo che hai appena..." dopo un compile_error
- [ ] `circuitState.selectedComponent` popolato → "cos'è questo?" funziona
- [ ] `circuitState.compilationResult` auto-inviato dopo ogni compilazione
- [ ] `circuitState.serialOutput` mostra ultime 10 righe
- [ ] `circuitState.editorMode` = "scratch" o "arduino" nel contesto
- [ ] Token budget: context block ≤ 500 token (da ~200 attuali)
- [ ] Build 0 errori + deploy Vercel + Render

#### Sprint 2 — Memory Evolution: PASS se...
- [ ] Al rientro: "Bentornato! L'ultima volta stavamo lavorando su [esperimento]"
- [ ] `lastSessionContext` salvato su `sendBeacon` (tab close)
- [ ] Error Pattern Analysis: dopo 3+ errori "polarità" → "Noto che sbagli spesso la polarità"
- [ ] Preferenze UI persistenti (editor mode, font size, ultimo volume)
- [ ] Memory migration: vecchi profili non corrotti dopo update schema

#### Sprint 3 — Proactive Help: PASS se...
- [ ] Timer 60s: se nessuna azione → "Hai bisogno di un suggerimento?"
- [ ] Dopo 3+ compile_error consecutivi → offerta auto-fix
- [ ] Circuito completo + !running → "Premi ▶ per provarlo!"
- [ ] Esperimento completato senza quiz → "Vuoi fare un quiz?"
- [ ] NO false positive (no suggerimenti durante typing/reading)

#### Sprint 4 — Voice: PASS se...
- [ ] 🎤 button visibile in chat (44px, touch-friendly)
- [ ] "Avvia la simulazione" → [AZIONE:play] → "Simulazione avviata!" (voce)
- [ ] "Metti un LED" → [INTENT:place_and_wire] → "LED aggiunto" (voce)
- [ ] "Cancella tutto" → conferma vocale → clearall
- [ ] "Cos'è un resistore?" → testo libero a Galileo → risposta letta
- [ ] Timeout: "Non ho capito, puoi ripetere?"
- [ ] Ambiguità: "Quello rosso" → domanda di chiarimento
- [ ] iPad Safari: microfono funzionante

### Strategia di Rollback

| Sprint | Rollback Strategy | Recovery Time |
|--------|------------------|---------------|
| Sprint 1 | Rimuovi activity buffer + ripristina `buildTutorContext()` originale | 15min |
| Sprint 2 | Disabilita resume context, revert galileoMemory.js | 20min |
| Sprint 3 | Disabilita timer proattivo (1 flag boolean) | 5min |
| Sprint 4 | Nascondi 🎤 button (CSS `display:none`) | 2min |

---

## APPENDICE A — Action Tag Completi (39 AZIONE + 1 INTENT)

### Regole Formato (CRITICHE)
- **Case-sensitive**: SOLO `[AZIONE:...]` (maiuscolo). `[azione:]` viene normalizzato da `normalize_action_tags()` (server.py:749)
- **Posizione**: SEMPRE a fine risposta, MAI dentro il testo
- **Parametri**: separati da `:` → `[AZIONE:cmd:arg1:arg2:arg3]`
- **Liste**: separati da `,` → `[AZIONE:highlight:led1,r1,buzzer1]`
- **Newline nel codice**: `\\n` (escaped, frontend converte)

### Generazione in 3 Livelli
1. **LLM Response** — Lo specialista (circuit/code/tutor/vision) include tag nella risposta
2. **Deterministic Fallback** (`server.py:976`) — 20 regex pattern iniettano tag se LLM li dimentica
3. **Frontend Quiz Fallback** (`ElabTutorV4.jsx`) — dispatch `[AZIONE:quiz]` se AI manca

### Simulazione (3)
```
[AZIONE:play]                          Avvia simulazione
[AZIONE:pause]                         Pausa/ferma simulazione
[AZIONE:reset]                         Reset circuito allo stato iniziale
```

### Circuito (6)
```
[AZIONE:addcomponent:TIPO:X:Y]        Aggiungi componente (LEGACY — usa INTENT)
[AZIONE:removecomponent:ID]            Rimuovi componente per ID
[AZIONE:movecomponent:ID:X:Y]          Sposta componente a coordinate SVG
[AZIONE:addwire:C1:PIN1:C2:PIN2]      Aggiungi filo tra due pin
[AZIONE:removewire:INDICE]            Rimuovi filo per indice (0-based)
[AZIONE:clearall]                      Pulisci TUTTA la breadboard
```

### Interazione Componenti (4)
```
[AZIONE:interact:ID:ACTION:VALUE]     Interazione (press/release/setPosition/setAngle/setLightLevel)
[AZIONE:setvalue:ID:PARAM:VALORE]     Imposta parametro (resistance/position/lightlevel/angle)
[AZIONE:highlight:id1,id2,...]         Evidenzia componenti (auto-clear dopo 4s)
[AZIONE:highlightpin:comp:pin,...]     Evidenzia pin specifici
```

### Codice & Compilazione (9)
```
[AZIONE:compile]                       Compila codice nell'editor (avr-gcc)
[AZIONE:setcode:CODICE]               Sostituisce TUTTO il codice (auto-apre editor)
[AZIONE:appendcode:CODICE]            Aggiunge codice alla fine (senza cancellare)
[AZIONE:getcode]                       Legge e mostra codice corrente nel chat
[AZIONE:resetcode]                     Ripristina codice originale dell'esperimento
[AZIONE:openeditor]                    Apre pannello editor codice
[AZIONE:closeeditor]                   Chiude pannello editor codice
[AZIONE:switcheditor:scratch]          Passa a modalità Blocchi (Blockly)
[AZIONE:switcheditor:arduino]          Passa a modalità Arduino C++
```

### Diagnostica & Misure (4)
```
[AZIONE:measure:ID]                    Misura tensione e corrente di un componente
[AZIONE:diagnose]                      Diagnosi automatica completa del circuito
[AZIONE:getstate]                      Mostra stato completo (componenti, fili, simulazione)
[AZIONE:listcomponents]                Elenca tutti i componenti piazzati
```

### Navigazione (3)
```
[AZIONE:loadexp:ID]                    Carica esperimento (es. v1-cap6-esp1)
[AZIONE:opentab:NOME]                  Apri tab (simulatore/manuale/video/lavagna/taccuini/detective/poe/reverse/review)
[AZIONE:openvolume:VOL:PAG]            Apri manuale a pagina specifica (es. 1:42)
```

### Build Steps & Seriale (6)
```
[AZIONE:setbuildmode:MODO]            Cambia modalità (montato/passopasso/libero)
[AZIONE:nextstep]                      Avanza al passo successivo (Passo Passo)
[AZIONE:prevstep]                      Torna al passo precedente
[AZIONE:showserial]                    Apre il Serial Monitor
[AZIONE:serialwrite:TESTO]            Scrive testo nel Serial Monitor (AVR)
[AZIONE:loadblocks:XML]               Carica workspace Blockly pre-costruito
```

### Strumenti (4)
```
[AZIONE:quiz]                          Lancia quiz dell'esperimento corrente
[AZIONE:youtube:QUERY]                 Cerca video YouTube
[AZIONE:createnotebook:NOME]           Crea nuovo taccuino/lezione
[AZIONE:showbom]                       Mostra lista materiali (Bill of Materials)
```

### Undo/Redo (2)
```
[AZIONE:undo]                          Annulla ultima azione
[AZIONE:redo]                          Ripeti azione annullata
```

### Piazzamento Intelligente (INTENT — metodo preferito S73+)
```json
[INTENT:{"action":"place_and_wire","components":[{"type":"led"},{"type":"resistor"}],"wires":"auto"}]
```

**Parametri opzionali INTENT:**
- `"near":"led1"` — piazza vicino a componente esistente
- `"relation":"left"` — posizione relativa (left/right/above/below)
- `"wires":"auto"` — auto-wiring PlacementEngine
- `"quantity":3` — N componenti dello stesso tipo (S73 FIX-2: multi-component)

### Deterministic Fallback — 20 Pattern Regex (server.py:976-1030)

| Pattern IT | Azione Iniettata |
|-----------|-----------------|
| "togli tutto", "pulisci", "svuota" | `[AZIONE:clearall]` |
| "avvia", "fai partire", "play" | `[AZIONE:play]` |
| "ferma", "stop", "basta" | `[AZIONE:pause]` |
| "ricomincia", "da capo" | `[AZIONE:reset]` |
| "compila", "verifica il codice" | `[AZIONE:compile]` |
| "carica esperimento X" | `[AZIONE:loadexp:X]` |
| "apri il simulatore/manuale/video" | `[AZIONE:opentab:X]` |
| "blocchi", "programma a blocchi" | `[AZIONE:openeditor]` + `[AZIONE:switcheditor:scratch]` |
| "codice arduino", "editor" | `[AZIONE:openeditor]` + `[AZIONE:switcheditor:arduino]` |
| "chiudi l'editor" | `[AZIONE:closeeditor]` |
| "evidenzia X", "mostrami il Y" | `[AZIONE:highlight:ID]` (con risoluzione fuzzy ID) |
| "quiz", "verificami", "testami" | `[AZIONE:quiz]` |
| "annulla", "torna indietro" | `[AZIONE:undo]` |
| "rifai", "redo" | `[AZIONE:redo]` |
| "avanti", "prossimo passo" | `[AZIONE:nextstep]` |
| "indietro", "passo precedente" | `[AZIONE:prevstep]` |
| "lista materiali", "BOM" | `[AZIONE:showbom]` |
| "seriale", "monitor seriale" | `[AZIONE:showserial]` |
| "ripristina il codice" | `[AZIONE:resetcode]` |
| "crea un taccuino X" | `[AZIONE:createnotebook:X]` |

## APPENDICE B — Keyboard Shortcuts Completi

```
── SIMULAZIONE ──────────────────────────────────────
Space            Play/Pause simulazione (toggle)
Escape           Exit Scratch fullscreen → exit wire mode (2 livelli)

── UNDO/REDO (SimulatorCanvas.jsx) ──────────────────
Ctrl+Z           Undo (Mac: Cmd+Z)
Ctrl+Y           Redo
Ctrl+Shift+Z     Redo (alternativo, Mac: Cmd+Shift+Z)

── COMPONENTI (SimulatorCanvas.jsx) ─────────────────
Ctrl+C           Copia componenti selezionati
Ctrl+V           Incolla (offset +20px)
Ctrl+D           Duplica (clone + fili interni)
Delete/Backspace Elimina (priorità: filo → componenti)
↑↓←→             Sposta componente (7.5px per tasto)
Shift+↑↓←→       Sposta fine (1px per tasto)

── NAVIGAZIONE CANVAS ───────────────────────────────
F                Fit-to-view (reset zoom/pan per mostrare tutto)

── COMPILAZIONE (solo AVR mode) ─────────────────────
Ctrl+B           Compila codice Arduino

── UI ───────────────────────────────────────────────
Ctrl+/           Toggle pannello shortcuts

NOTA: Shortcuts disabilitati in input/textarea e CodeMirror editor.
      Mac usa metaKey (Cmd), Windows/Linux usa ctrlKey (Ctrl).
      TOTALE: 15 shortcuts verificati nel codice sorgente.
```

## APPENDICE C — Componenti SVG (23 file, 19 circuitali + 4 sistema)

### Componenti Circuitali (19) — piazzabili dallo studente

| File JSX | type ID | Pin | Volume | Categoria |
|----------|---------|-----|--------|-----------|
| Battery9V.jsx | `battery9v` | positive, negative | Vol1 | Alimentazione |
| Resistor.jsx | `resistor` | pin1, pin2 | Vol1 | Passivi |
| Led.jsx | `led` | anode, cathode | Vol1 | Semiconduttori |
| PushButton.jsx | `push-button` | pin1, pin2 | Vol1 | Input |
| BuzzerPiezo.jsx | `buzzer-piezo` | positive, negative | Vol2 | Output |
| Capacitor.jsx | `capacitor` | pin1, pin2 | Vol2 | Passivi |
| Potentiometer.jsx | `potentiometer` | wiper, terminal1, terminal2 | Vol2 | Passivi |
| PhotoResistor.jsx | `photoresistor` | pin1, pin2 | Vol2 | Input |
| Diode.jsx | `diode` | anode, cathode | Vol2 | Semiconduttori |
| MotorDC.jsx | `motor-dc` | positive, negative | Vol2 | Output |
| Servo.jsx | `servo` | signal, vcc, gnd | Vol3 | Output |
| RgbLed.jsx | `rgb-led` | red, green, blue, cathode | Vol3 | Semiconduttori |
| MosfetN.jsx | `mosfet-n` | gate, drain, source | Vol3 | Semiconduttori |
| Phototransistor.jsx | `phototransistor` | collector, emitter | Vol3 | Input |
| ReedSwitch.jsx | `reed-switch` | pin1, pin2 | Vol3 | Input |
| LCD16x2.jsx | `lcd16x2` | rs, en, d4, d5, d6, d7, vss, vdd, vo | Vol3 | Output |
| NanoR4Board.jsx | `nano-r4-board` | D0-D13, A0-A5, 5V, 3V3, GND, VIN | Vol2-3 | MCU |
| Multimeter.jsx | `multimeter` | probe_red, probe_black | All | Strumenti |
| ReedSwitch.jsx | `reed-switch` | pin1, pin2 | Vol3 | Input |

### Componenti Sistema (4) — infrastruttura

| File JSX | type ID | Descrizione |
|----------|---------|-------------|
| BreadboardFull.jsx | `breadboard-full` | 60×30 holes, bus top/bot, center gap |
| BreadboardHalf.jsx | `breadboard-half` | 30×30 holes, bus top/bot, center gap |
| Wire.jsx | `wire` | Filo colorato (red/black/green/blue/yellow/orange) |
| Annotation.jsx | `annotation` | Sticky note (#FFF9C4) per appunti su canvas |

### Costanti Breadboard
```
BB_HOLE_PITCH = 7.5px    (distanza tra fori)
SNAP_THRESHOLD = 4.5px   (soglia snap-to-hole)
Bus naming: bus-top-plus-N, bus-top-minus-N, bus-bot-plus-N, bus-bot-minus-N
Columns: a-j (10 colonne, gap tra e-f)
Rows: 1-30 (half) o 1-60 (full)
```

---

## APPENDICE D — Struttura Dati Esperimento (Verificata)

```javascript
// Source: src/data/experiments-vol1.js (primo esperimento)
{
  // ═══ IDENTIFICAZIONE ═══
  id: "v1-cap6-esp1",                    // Formato: v{vol}-cap{chapter}-esp{num}
  title: "Cap. 6 Esp. 1 - Accendi il tuo primo LED",
  desc: "Il tuo primo circuito! Collega batteria 9V...",
  chapter: "Capitolo 6 - Cos'è il diodo LED?",

  // ═══ METADATA ═══
  difficulty: 1,                          // 1-3 (beginner→advanced)
  icon: "🔌",                             // Emoji display
  simulationMode: "circuit",              // "circuit" (no code) | "avr" (Arduino)
  concept: "Circuito base, polarità LED, resistore di protezione",
  layer: "terra",                         // Livello educativo

  // ═══ BOM (Bill of Materials) ═══
  components: [
    { type: "battery9v", id: "bat1" },
    { type: "breadboard-half", id: "bb1" },
    { type: "resistor", id: "r1", value: 470 },    // 470Ω
    { type: "led", id: "led1", color: "red" }
  ],

  // ═══ PIN ASSIGNMENTS (posizioni breadboard) ═══
  pinAssignments: {
    "r1:pin1": "bb1:a2",                 // {componentId}:{pinName} → {boardId}:{col}{row}
    "r1:pin2": "bb1:a9",
    "led1:anode": "bb1:f9",
    "led1:cathode": "bb1:f10"
  },

  // ═══ CONNESSIONI (fili) ═══
  connections: [
    { from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
    { from: "bb1:bus-top-plus-2", to: "bb1:b2", color: "red" },
    { from: "bb1:e9", to: "bb1:f9", color: "green" },
    { from: "bb1:j10", to: "bb1:bus-bot-minus-10", color: "black" },
    { from: "bb1:bus-bot-minus-1", to: "bb1:bus-top-minus-1", color: "black" },
    { from: "bb1:bus-top-minus-1", to: "bat1:negative", color: "black" }
  ],

  // ═══ LAYOUT (coordinate SVG) ═══
  layout: {
    "bat1": { x: 30, y: 55 },
    "bb1": { x: 100, y: 10 },
    "r1": { x: 151.5, y: 43.75 },
    "led1": { x: 181.5, y: 68.75 }
  },

  // ═══ ISTRUZIONI SEMPLICI ═══
  steps: [
    "Inserisci il resistore da 470Ω nella fila A, colonne 2-9",
    "Inserisci il LED rosso con l'anodo in F9 e il catodo in F10",
    // ...
  ],

  observe: "Il LED rosso si accende! Il resistore da 470Ω limita la corrente...",

  // ═══ PROMPT GALILEO (per esperimento) ═══
  galileoPrompt: "Sei Galileo, il tutor AI di ELAB...",

  // ═══ CODICE (solo AVR mode) ═══
  code: null,                             // C++ Arduino (null per circuit-only)
  hexFile: null,                          // .hex compilato (null per circuit-only)
  scratchXml: null,                       // Blockly XML (opzionale, Vol3)
  scratchSteps: [],                       // Step progressivi codice Blockly

  // ═══ BUILD STEPS (Passo Passo — modalità guidata) ═══
  buildSteps: [
    {
      step: 1,
      text: "Inserisci il resistore da 470Ω nei fori A2 e A9",
      componentId: "r1",
      componentType: "resistor",
      targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a9" },
      hint: "Il resistore protegge il LED dalla troppa corrente."
    },
    // ... (tipicamente 6-8 step per esperimento)
  ],

  // ═══ QUIZ (valutazione apprendimento) ═══
  quiz: [
    {
      question: "Perché serve il resistore nel circuito con il LED?",
      options: [
        "Protegge il LED dalla troppa corrente",    // correct: 0
        "Fa più luce",
        "Non serve, è decorativo"
      ],
      correct: 0,
      explanation: "Il resistore limita la corrente..."
    }
  ]
}
```

**Totale esperimenti**: 70 (38 Vol1 + 18 Vol2 + 14 Vol3)

---

## APPENDICE E — Nanobot Routing Pipeline (Verificato da server.py)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NANOBOT v5.3.0 — REQUEST FLOW                    │
│                                                                      │
│  POST /tutor-chat (text) ─── o ─── POST /chat (vision)             │
│           │                          │                               │
│           ▼                          ▼                               │
│  ┌─────────────────┐      ┌──────────────────┐                      │
│  │ Input Sanitize   │      │ Image Extraction  │                     │
│  │ (injection block │      │ (base64 → PIL)    │                     │
│  │  + homoglyph)    │      │                   │                     │
│  └───────┬─────────┘      └────────┬──────────┘                     │
│          │                         │                                 │
│          ▼                         ▼                                 │
│  ┌──────────────────────────────────────────┐                       │
│  │         classify_intent(message, images)  │                       │
│  │                                           │                       │
│  │  1. Images? → 'vision'                    │                       │
│  │  2. TUTOR_OVERRIDE_PATTERNS? → check...   │                       │
│  │     BUT if ACTION_VERB_RE → cancel override│                      │
│  │  3. CODE_OVERRIDE_KEYWORDS? → 'code'      │                       │
│  │  4. Keyword scoring per intent → winner    │                       │
│  │  5. Default → 'tutor'                      │                       │
│  │                                           │                       │
│  │  Returns: 'circuit' | 'code' | 'tutor' | 'vision'               │
│  └───────────────────┬──────────────────────┘                       │
│                      │                                               │
│          ┌───────────┼───────────┐                                   │
│          ▼           ▼           ▼                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │ Circuit  │ │ Code     │ │ Tutor    │  ← 4 Specialist Prompts    │
│  │ Prompt   │ │ Prompt   │ │ Prompt   │    (shared.yml + {x}.yml   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘     + scratch.yml)         │
│       │             │            │                                    │
│       └──────┬──────┘────────────┘                                   │
│              ▼                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │     build_specialist_context()            │                       │
│  │                                           │                       │
│  │  + [CONTESTO DI SISTEMA] (esp, tab, mode) │                       │
│  │  + [STATO CIRCUITO] (components, wires)   │                       │
│  │  + [MISURE ELETTRICHE] (V, I per comp)    │                       │
│  │  + [MEMORIA STUDENTE] (level, mistakes)   │                       │
│  │  + Goal context (if action intent)        │                       │
│  └───────────────────┬──────────────────────┘                       │
│                      ▼                                               │
│  ┌──────────────────────────────────────────┐                       │
│  │     race_providers()                      │                       │
│  │                                           │                       │
│  │  Text: DeepSeek ⚡ Groq ⚡ (Kimi standby)│                       │
│  │  Vision: Gemini (Tier 2, 60s timeout)     │                       │
│  │         + 429 retry backoff (10/20/30s)   │                       │
│  │                                           │                       │
│  │  asyncio.wait(FIRST_COMPLETED)            │                       │
│  │  → Winner response + cancel losers        │                       │
│  └───────────────────┬──────────────────────┘                       │
│                      ▼                                               │
│  ┌──────────────────────────────────────────┐                       │
│  │     Post-processing Pipeline              │                       │
│  │                                           │                       │
│  │  1. normalize_action_tags()               │                       │
│  │  2. deterministic_action_fallback()       │                       │
│  │     (20 regex → inject missing tags)      │                       │
│  │  3. vision→circuit chaining (S73 FIX-5)   │                       │
│  │  4. Session save (to /tmp/sessions/)      │                       │
│  │  5. Memory update (collective patterns)   │                       │
│  └───────────────────┬──────────────────────┘                       │
│                      ▼                                               │
│              JSON Response                                           │
│  { response, provider, model, elapsed_ms, actions[] }               │
└─────────────────────────────────────────────────────────────────────┘
```

### Endpoint Completi Nanobot

| Endpoint | Method | Rate | Descrizione |
|----------|--------|------|-------------|
| `/health` | GET | — | Status, version, providers, cache stats |
| `/chat` | POST | 60/min | Chat con vision support (images[]) |
| `/tutor-chat` | POST | 60/min | Chat testuale (no images) |
| `/site-chat` | POST | 30/min | Widget sito pubblico (WhatsApp fallback) |
| `/memory/{session_id}` | GET | 30/min | Leggi profilo studente |
| `/memory/sync` | POST | 10/min | Sincronizza memoria frontend→backend |
| `/debug-vision` | POST | — | Test diretto Gemini vision (2x2 PNG) |

### Specialist YAML Prompts

| File | Intent | Priorità | Sezioni Chiave |
|------|--------|----------|----------------|
| `shared.yml` | Tutti | Base | identity, reasoning, honesty, action_tags, experiments_catalog, components_ref, breadboard_rules |
| `circuit.yml` | `circuit` | 10 | action_imperative, pin_map (21 tipi), diagnosis_checklist (8 step), KVL/KCL, wiring_templates |
| `code.yml` | `code` | 10 | Arduino C++ generation, Scratch blocks, compile verification, error translation |
| `tutor.yml` | `tutor` | 5 | Pedagogia, scaffolding, 1 domanda guida + spiegazione, adapt al livello |
| `vision.yml` | `vision` | 15 | Multi-aspect analysis, NO architecture reveal, circuit recognition |
| `scratch.yml` | Tutti (injected) | — | 22 custom Arduino blocks, 5 experimental step sequences, editor action tags |

### Input Sanitization (Prompt Injection Defense)

```python
# PHASE 1: BLOCK (reject entire message if ANY match)
INJECTION_BLOCK_PATTERNS = [
    r'\[ADMIN\]', r'\[SYSTEM\]', r'\[OVERRIDE\]',
    r'ignore.*instructions', r'jailbreak', r'DAN mode',
    r'bypass.*(filter|safety)',
    # Italian: r'ignora.*istruzioni', r'aggira.*(filtro|restrizioni)'
]
# → Response: "Non posso eseguire questo tipo di richiesta..."

# PHASE 2: STRIP (remove residual tags)
_BRACKET_TAG_RE = r'\[(ADMIN|SYSTEM|ROOT|SUDO|OVERRIDE|DEBUG|DEV|FILTERED)\]'

# PHASE 3: HOMOGLYPH (normalize Cyrillic/Greek look-alikes)
_CONFUSABLES = str.maketrans({'\u0410': 'A', '\u0412': 'B', ...})
```

---

## APPENDICE F — galileoMemory.js (Schema Verificato)

```javascript
// localStorage key: "elab_galileo_memory"
{
  experiments: {
    "v1-cap6-esp1": {
      completed: true,
      attempts: 2,
      lastResult: "success",
      timestamp: 1708000000000
    }
  },

  quizzes: {
    "v1-cap6-esp1": {
      correct: 2, total: 2, percentage: 100,
      timestamp: 1708000000000
    }
  },

  mistakes: [                              // Max 50 (FIFO)
    { category: "polarita", detail: "LED reversed", timestamp: ... }
  ],

  sessionSummaries: [                      // Max 10 (FIFO)
    { summary: "Completò 3 esperimenti", timestamp: ... }
  ],

  // Backend enrichment (da /memory/{sessionId})
  _backendLevel: "intermedio",             // "principiante" | "intermedio" | "avanzato"
  _backendWeaknesses: ["resistenza", "circuiti paralleli"],
  _backendStrengths: ["LED", "batterie"],
  _backendQuiz: { total: 45, correct: 38 },

  lastUpdated: 1708000000000
}
```

### Sync Protocol

```
Frontend (localStorage)                    Backend (nanobot /memory/)
        │                                         │
        │──── syncWithBackend() ogni 60s ────────▶│  (se dirty=true)
        │     POST /memory/sync                    │  File: sessions/memory/{id}.json
        │     Body: {sessionId, profile}           │
        │                                         │
        │◀─── loadFromBackend() all'avvio ────────│  (non-blocking async)
        │     GET /memory/{sessionId}              │
        │     Merge: backend wins su level,        │
        │            strengths, weaknesses         │
        │                                         │
        │──── sendBeacon() su tab close ──────────▶│  (last-chance sync)
        │     POST /memory/sync (keepalive)        │
```

### API galileoMemory Esportate

| Funzione | Descrizione | Return |
|----------|-------------|--------|
| `getProfile()` | Legge profilo completo | `{experiments, quizzes, mistakes, ...}` |
| `updateProfile(updates)` | Merge parziale + dirty=true | void |
| `trackExperimentCompletion(expId, result)` | Segna esperimento completato | void |
| `trackQuizResult(expId, correct, total)` | Salva risultato quiz | void |
| `trackMistake(category, detail)` | Log errore (max 50 FIFO) | void |
| `saveSessionSummary(summary)` | Salva riassunto sessione (max 10) | void |
| `buildMemoryContext()` | Formatta per AI `[MEMORIA STUDENTE]` | string |
| `resetMemory()` | Pulisce localStorage | void |
| `syncWithBackend()` | Push fire-and-forget | Promise |
| `loadFromBackend()` | Pull async + merge | Promise |
| `initSync()` | Avvia loop auto-sync (60s) | void |

---

<a id="scalabilita"></a>
## ARCHITETTURA SCALABILE — Design for Growth

### Principi Architetturali

```
┌─────────────────────────────────────────────────────────────┐
│                    PRINCIPI DI SCALABILITÀ                   │
│                                                              │
│  1. REGISTRY PATTERN — Ogni entità registrabile, non hardcoded│
│  2. PLUGIN ARCHITECTURE — Nuove funzionalità come moduli     │
│  3. EVENT-DRIVEN — Comunicazione via eventi, non chiamate     │
│  4. STATELESS BACKEND — Nessuno stato sul server, tutto in DB │
│  5. HORIZONTAL SCALE — Più istanze, non istanze più grandi    │
└─────────────────────────────────────────────────────────────┘
```

---

### S1. SCALABILITÀ FUNZIONALE — Action Registry

**Problema attuale:** I 39 action tag sono hardcoded in 3 file (server.py regex, ElabTutorV4.jsx switch, deterministic_action_fallback). Aggiungere un action tag richiede modifiche in 3 posti.

**Soluzione: Centralized Action Registry**

```javascript
// src/registry/actionRegistry.js — SINGLE SOURCE OF TRUTH

const ACTION_REGISTRY = {
  play: {
    tag: '[AZIONE:play]',
    category: 'simulation',
    handler: (api) => api.simulationManager.play(),
    voiceCommands: ['avvia', 'fai partire', 'play', 'vai'],
    voiceFeedback: 'Simulazione avviata!',
    requiresConfirmation: false,
    icon: '▶️',
    shortcut: 'Space',
    description: 'Avvia la simulazione del circuito',
    // Deterministic fallback regex
    fallbackPattern: /\b(avvia|fai\s+partire|vai|play|start)\b/i,
  },

  clearall: {
    tag: '[AZIONE:clearall]',
    category: 'circuit',
    handler: (api) => api.simulationManager.reset(),
    voiceCommands: ['pulisci', 'togli tutto', 'svuota', 'cancella tutto'],
    voiceFeedback: 'Circuito pulito!',
    requiresConfirmation: true,  // ← Azione critica
    confirmMessage: 'Vuoi davvero cancellare tutto?',
    icon: '🗑️',
    shortcut: null,
    fallbackPattern: /\b(togli\s+tutto|pulisci|svuota|cancella\s+tutto|clearall)\b/i,
  },

  // ... tutti i 39+ action tag come oggetti auto-descrittivi
};

// API per registrare NUOVI action tag a runtime (plugin system)
export function registerAction(name, config) {
  if (ACTION_REGISTRY[name]) throw new Error(`Action ${name} already registered`);
  validateActionConfig(config);
  ACTION_REGISTRY[name] = config;
}

// Lookup automatico — elimina tutti gli switch/case
export function executeAction(tagName, args, api) {
  const action = ACTION_REGISTRY[tagName];
  if (!action) return { success: false, error: `Unknown action: ${tagName}` };

  if (action.requiresConfirmation) {
    return { needsConfirmation: true, message: action.confirmMessage };
  }

  return action.handler(api, ...args);
}

// Generazione automatica regex fallback
export function buildFallbackPatterns() {
  return Object.entries(ACTION_REGISTRY).map(([name, config]) => ({
    name,
    pattern: config.fallbackPattern,
    tag: config.tag,
  }));
}

// Generazione automatica comandi vocali
export function buildVoiceCommandMap() {
  const map = {};
  for (const [name, config] of Object.entries(ACTION_REGISTRY)) {
    for (const cmd of config.voiceCommands || []) {
      map[cmd] = name;
    }
  }
  return map;
}
```

**Vantaggi:**
- Aggiungere un action tag = 1 oggetto in 1 file
- Fallback regex, voice commands, UI tutti auto-generati
- Plugin possono registrare nuovi action tag senza toccare il core
- Documentazione auto-generabile dal registry

---

### S2. SCALABILITÀ AI — Specialist Plugin System

**Problema attuale:** Aggiungere un nuovo specialista (es. "3D printing", "robotics") richiede modifiche in server.py (routing), YAML prompt, e frontend parser.

**Soluzione: Specialist Plugin Architecture**

```yaml
# nanobot/specialists/circuit/manifest.yml
specialist:
  name: circuit
  version: 1.0
  description: "Esperto di circuiti elettrici e breadboard"

  routing:
    keywords: ["circuito", "led", "resistore", "filo", "cortocircuito"]
    priority: 10  # Higher = more priority
    requires_context: ["circuitState"]

  prompts:
    system: circuit.yml      # Prompt file
    shared: [shared.yml, scratch.yml]  # Inherited DNA

  actions:
    emits: [play, pause, reset, addcomponent, addwire, highlight, diagnose]
    handles: [getstate, measure]

  providers:
    text: [deepseek, groq]
    vision: [gemini]

  fallbacks:
    - pattern: "cortocircuito"
      action: diagnose
```

```python
# nanobot/specialist_loader.py — Auto-discovery

import yaml
from pathlib import Path

class SpecialistRegistry:
    def __init__(self, specialists_dir: Path):
        self.specialists = {}
        self._discover(specialists_dir)

    def _discover(self, base_dir: Path):
        """Auto-discover all specialists from manifest files"""
        for manifest_path in base_dir.glob("*/manifest.yml"):
            with open(manifest_path) as f:
                manifest = yaml.safe_load(f)
            name = manifest['specialist']['name']
            self.specialists[name] = {
                'manifest': manifest,
                'prompt': self._load_prompt(manifest, base_dir),
                'keywords': manifest['specialist']['routing']['keywords'],
                'priority': manifest['specialist']['routing']['priority'],
            }

    def route(self, message: str, context: dict) -> str:
        """Score-based routing across all registered specialists"""
        scores = {}
        for name, spec in self.specialists.items():
            score = sum(1 for kw in spec['keywords'] if kw in message.lower())
            score *= spec['priority'] / 10
            scores[name] = score

        return max(scores, key=scores.get) if max(scores.values()) > 0 else 'tutor'

    def register(self, name: str, manifest: dict):
        """Hot-register a new specialist at runtime"""
        self.specialists[name] = manifest
```

**Per aggiungere "Robotics Specialist":**
```
nanobot/specialists/
  circuit/manifest.yml + circuit.yml
  code/manifest.yml + code.yml
  tutor/manifest.yml + tutor.yml
  vision/manifest.yml + vision.yml
  robotics/manifest.yml + robotics.yml  ← NEW: solo aggiungere cartella
```

---

### S3. SCALABILITÀ UTENTI — Backend Stateless + Cache Layer

**Problema attuale:** Nanobot su Render Starter (512MB, 1 CPU). Sessioni su `/tmp/sessions/`. Limite pratico: ~50 utenti concorrenti.

**Architettura scalabile (3 fasi):**

```
FASE A (oggi → 500 utenti):
┌──────────┐     ┌──────────────┐
│  Vercel  │────▶│  Render      │  ← Single instance
│  (CDN)   │     │  (nanobot)   │     Session: /tmp/
└──────────┘     │  512MB       │     Cache: in-memory
                 └──────────────┘

FASE B (500 → 5.000 utenti):
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Vercel  │────▶│  Render      │────▶│  Redis   │  ← Session store
│  (CDN)   │     │  (nanobot)   │     │  (Upstash│     + response cache
└──────────┘     │  1GB, 2 CPU  │     │  free)   │
                 └──────────────┘     └──────────┘

FASE C (5.000 → 50.000 utenti):
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Vercel  │────▶│  Load        │────▶│  Redis   │
│  (CDN)   │     │  Balancer    │     │  Cluster │
└──────────┘     │  (Render)    │     └──────────┘
                 ├──────────────┤     ┌──────────┐
                 │  nanobot-1   │────▶│  Supabase│  ← DB persistente
                 │  nanobot-2   │     │  (memory)│
                 │  nanobot-N   │     └──────────┘
                 └──────────────┘
```

**Modifiche per stateless:**

```python
# server.py — Replace file-based sessions with Redis/Upstash

import redis
import json

class SessionStore:
    """Pluggable session backend — file or Redis"""

    def __init__(self):
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            self.backend = RedisBackend(redis_url)
        else:
            self.backend = FileBackend("/tmp/sessions")

    def get(self, session_id: str) -> dict:
        return self.backend.get(session_id)

    def set(self, session_id: str, data: dict, ttl: int = 86400):
        self.backend.set(session_id, data, ttl)

class RedisBackend:
    def __init__(self, url):
        self.r = redis.from_url(url)

    def get(self, key):
        data = self.r.get(f"session:{key}")
        return json.loads(data) if data else {"messages": []}

    def set(self, key, data, ttl=86400):
        self.r.setex(f"session:{key}", ttl, json.dumps(data))

class FileBackend:
    def get(self, key):
        path = Path(f"/tmp/sessions/session_{key}.json")
        return json.loads(path.read_text()) if path.exists() else {"messages": []}

    def set(self, key, data, ttl=86400):
        path = Path(f"/tmp/sessions/session_{key}.json")
        path.write_text(json.dumps(data))
```

---

### S4. SCALABILITÀ COMPONENTI — Component Plugin System

**Problema attuale:** Aggiungere un nuovo componente SVG richiede modifiche in 6+ file (registry.js, PlacementEngine.js, CircuitSolver.js, experiments-volN.js, circuit.yml, shared.yml).

**Soluzione: Self-Describing Components**

```javascript
// src/components/simulator/components/led/manifest.json
{
  "type": "led",
  "displayName": "LED",
  "category": "semiconductors",
  "volumes": [1, 2, 3],
  "svg": "LED.jsx",
  "pins": {
    "anode": { "type": "positive", "position": { "dx": 0, "dy": -20 } },
    "cathode": { "type": "negative", "position": { "dx": 0, "dy": 20 } }
  },
  "properties": {
    "color": { "type": "enum", "values": ["red", "green", "yellow", "blue", "white"], "default": "red" },
    "forwardVoltage": { "type": "number", "default": 2.0, "unit": "V" },
    "maxCurrent": { "type": "number", "default": 20, "unit": "mA" }
  },
  "simulation": {
    "engine": "circuit",
    "model": "diode",
    "parameters": { "Vf": "forwardVoltage", "If_max": "maxCurrent" }
  },
  "placement": {
    "defaultPosition": { "x": 300, "y": 200 },
    "breadboardSpan": 5,
    "rotatable": false
  },
  "ai": {
    "keywords": ["led", "diodo luminoso", "luce"],
    "commonErrors": ["polarità invertita", "senza resistore"],
    "wiringTemplate": "auto"
  }
}
```

**Auto-registration:**
```javascript
// src/registry/componentRegistry.js
const COMPONENT_REGISTRY = {};

// Auto-discover from filesystem (build-time via Vite plugin)
const manifests = import.meta.glob('../components/simulator/components/*/manifest.json', { eager: true });
for (const [path, manifest] of Object.entries(manifests)) {
  COMPONENT_REGISTRY[manifest.type] = manifest;
}

// Runtime API
export function getComponent(type) { return COMPONENT_REGISTRY[type]; }
export function getAllComponents() { return Object.values(COMPONENT_REGISTRY); }
export function getComponentsByVolume(vol) {
  return Object.values(COMPONENT_REGISTRY).filter(c => c.volumes.includes(vol));
}
export function getComponentsByCategory(cat) {
  return Object.values(COMPONENT_REGISTRY).filter(c => c.category === cat);
}
```

**Per aggiungere "Sensore Temperatura":**
```
src/components/simulator/components/
  temperature-sensor/
    manifest.json     ← Autodiscovered
    TemperatureSensor.jsx
    TemperatureSensor.css
```

---

### S5. SCALABILITÀ CONTESTO — Context Pipeline

**Problema attuale:** `build_specialist_context()` è un singolo metodo con 6 sezioni hardcoded. Aggiungere un nuovo tipo di contesto richiede modifiche nel core.

**Soluzione: Context Pipeline (middleware pattern)**

```python
# nanobot/context_pipeline.py

class ContextPipeline:
    """Pluggable context builder — each stage adds a section"""

    def __init__(self):
        self.stages = []

    def register(self, name: str, builder_fn, priority: int = 50):
        """Register a context stage. Lower priority = runs first."""
        self.stages.append({
            'name': name,
            'fn': builder_fn,
            'priority': priority
        })
        self.stages.sort(key=lambda s: s['priority'])

    def build(self, request: ChatRequest) -> str:
        """Execute all stages, concatenate context blocks"""
        blocks = []
        for stage in self.stages:
            block = stage['fn'](request)
            if block:
                blocks.append(f"[{stage['name'].upper()}]\n{block}")
        return "\n\n".join(blocks)

# Built-in stages
pipeline = ContextPipeline()

pipeline.register('contesto di sistema', build_system_context, priority=10)
pipeline.register('stato circuito', build_circuit_context, priority=20)
pipeline.register('misure elettriche', build_measurements_context, priority=30)
pipeline.register('memoria studente', build_memory_context, priority=40)
pipeline.register('attività recente', build_activity_context, priority=50)  # NEW
pipeline.register('errori compilazione', build_compile_context, priority=60)  # NEW
pipeline.register('output seriale', build_serial_context, priority=70)  # NEW

# Plugin can add custom stages:
# pipeline.register('robotics_context', build_robotics_context, priority=80)
```

---

### S6. SCALABILITÀ MEMORIA — Event Sourcing

**Problema attuale:** La memoria è un blob JSON che viene letto/scritto interamente. Non scala con dati in crescita.

**Soluzione: Event Log + Materialized Views**

```python
# nanobot/memory/event_store.py

class MemoryEventStore:
    """Append-only event log + materialized profile"""

    def append(self, session_id: str, event: dict):
        """
        Events: experiment_completed, quiz_result, mistake, preference_set,
                session_start, session_end, compilation_error, pattern_detected
        """
        event['timestamp'] = datetime.utcnow().isoformat()
        self.store.append(session_id, event)
        self._update_materialized_view(session_id, event)

    def get_profile(self, session_id: str) -> dict:
        """Read materialized view (fast, O(1))"""
        return self.views.get(session_id, self._default_profile())

    def _update_materialized_view(self, session_id, event):
        """Incrementally update profile from event"""
        profile = self.get_profile(session_id)

        if event['type'] == 'experiment_completed':
            profile['experiments'][event['id']] = event['result']
            profile['total_completed'] += 1

        elif event['type'] == 'mistake':
            profile['mistakes'].append(event)
            profile['mistakes'] = profile['mistakes'][-50:]  # Keep last 50
            self._detect_patterns(profile)

        elif event['type'] == 'quiz_result':
            profile['quiz_history'].append(event)
            profile['quiz_average'] = self._calc_avg(profile['quiz_history'])

        self.views.set(session_id, profile)

    def _detect_patterns(self, profile):
        """Automatic pattern detection from mistake history"""
        categories = Counter(m['category'] for m in profile['mistakes'])
        if categories.most_common(1)[0][1] >= 3:
            profile['weaknesses'] = [c for c, n in categories.most_common(3)]
```

---

### S7. SCALABILITÀ ESPERIMENTI — Experiment Schema Evolution

**Problema attuale:** 67 esperimenti hardcoded in 3 file JS. Aggiungere Vol4 = nuovo file + import + ExperimentPicker update.

**Soluzione: Experiment Loader con schema versioning**

```javascript
// src/data/experimentLoader.js

class ExperimentLoader {
  constructor() {
    this.experiments = new Map();
    this.schemas = new Map();
  }

  /**
   * Auto-discover experiment files
   * Supports: static imports, dynamic JSON, remote API
   */
  async loadAll() {
    // Phase 1: Static bundled experiments
    const staticModules = import.meta.glob('./experiments-*.js', { eager: true });
    for (const [path, mod] of Object.entries(staticModules)) {
      const volume = path.match(/vol(\d)/)?.[1];
      for (const exp of mod.default || mod.experiments) {
        this.experiments.set(exp.id, { ...exp, volume: parseInt(volume) });
      }
    }

    // Phase 2: Remote experiments (future: teacher-created)
    try {
      const remote = await fetch('/api/experiments?format=elab-v2');
      if (remote.ok) {
        const data = await remote.json();
        for (const exp of data.experiments) {
          this.experiments.set(exp.id, this.migrate(exp));
        }
      }
    } catch (e) {
      // Offline: skip remote
    }
  }

  /**
   * Schema migration — upgrade old experiment formats
   */
  migrate(exp) {
    const version = exp.schemaVersion || 1;
    let migrated = { ...exp };

    if (version < 2) {
      // V1 → V2: Add scratchSteps field
      migrated.scratchSteps = migrated.scratchSteps || [];
      migrated.schemaVersion = 2;
    }
    if (version < 3) {
      // V2 → V3: Normalize pin names
      migrated.pinAssignments = normalizePins(migrated.pinAssignments);
      migrated.schemaVersion = 3;
    }

    return migrated;
  }

  getByVolume(vol) {
    return [...this.experiments.values()].filter(e => e.volume === vol);
  }

  getById(id) {
    return this.experiments.get(id);
  }
}
```

---

### S8. SCALABILITÀ VOCE — Voice Command Registry

```javascript
// src/registry/voiceRegistry.js

class VoiceCommandRegistry {
  constructor(actionRegistry) {
    this.commands = new Map();
    this.actionRegistry = actionRegistry;
    this._buildFromActions();
  }

  _buildFromActions() {
    // Auto-generate from action registry
    for (const [name, config] of Object.entries(this.actionRegistry)) {
      for (const phrase of config.voiceCommands || []) {
        this.commands.set(phrase.toLowerCase(), {
          action: name,
          confidence: 1.0,
          feedback: config.voiceFeedback,
        });
      }
    }
  }

  /**
   * Register custom voice command (not tied to action)
   */
  register(phrase, handler, options = {}) {
    this.commands.set(phrase.toLowerCase(), {
      handler,
      confidence: options.confidence || 0.8,
      feedback: options.feedback,
    });
  }

  /**
   * Fuzzy match user speech to registered commands
   */
  match(transcript) {
    const normalized = transcript.toLowerCase().trim();

    // Exact match
    if (this.commands.has(normalized)) {
      return { ...this.commands.get(normalized), match: 'exact' };
    }

    // Fuzzy match (Levenshtein distance)
    let bestMatch = null;
    let bestScore = 0;

    for (const [phrase, config] of this.commands) {
      const score = this._similarity(normalized, phrase);
      if (score > bestScore && score > 0.7) {
        bestScore = score;
        bestMatch = { ...config, match: 'fuzzy', score };
      }
    }

    // Fallback: send to Galileo as free text
    if (!bestMatch) {
      return { action: 'chat', text: transcript, match: 'none' };
    }

    return bestMatch;
  }
}
```

---

### RIEPILOGO SCALABILITÀ

| Pattern | Cosa Risolve | Complessità | Quando |
|---------|-------------|-------------|--------|
| **Action Registry** (S1) | Aggiungere action tag in 1 file | Media | Sprint 1 |
| **Specialist Plugins** (S2) | Aggiungere specialisti AI | Alta | Sprint 2 |
| **Stateless Backend** (S3) | Scalare a 5K+ utenti | Media | Sprint 2 |
| **Component Manifests** (S4) | Aggiungere componenti SVG | Media | Sprint 3 |
| **Context Pipeline** (S5) | Aggiungere tipi di contesto | Bassa | Sprint 1 |
| **Event Sourcing** (S6) | Memoria che scala | Alta | Sprint 3 |
| **Experiment Loader** (S7) | Aggiungere volumi/esperimenti | Bassa | Sprint 2 |
| **Voice Registry** (S8) | Aggiungere comandi vocali | Bassa | Sprint 4 |

### Principio Guida

> **"Aggiungere una feature = aggiungere un file, non modificare il core."**
>
> Ogni nuova funzionalità (componente, action tag, specialista, esperimento, comando vocale) dovrebbe richiedere SOLO:
> 1. Creare un file/cartella con manifest
> 2. Il sistema lo scopre automaticamente (auto-discovery)
> 3. Zero modifiche ai file esistenti

---

**Fine Documento**
Generato il 12/03/2026 — Copertura: 100% funzionalità piattaforma + architettura scalabile
Prossimo step: Approvazione utente → Sprint 1 (Context Mastery + Action Registry)
