# Blueprint T1-001 + T1-002 -- Lavagna Bugs Fix

**Autore**: Architect Agent  
**Data**: 2026-04-20  
**Branch**: feature/pdr-ambizioso-8-settimane  
**Status**: ready_for_dev

---

## Terminologia -- cosa si intende per "lavagna"

Il progetto ha DUE layer di disegno sovrapposti al canvas del simulatore:

1. **DrawingOverlay** (`src/components/simulator/canvas/DrawingOverlay.jsx`) -- SVG freehand annotation, attivato dal bottone "Penna" nella FloatingToolbar. Persistenza tramite `src/utils/drawingStorage.js` (localStorage per-experiment, chiave `elab-drawing-<expId>`).

2. **WhiteboardOverlay** (`src/components/simulator/panels/WhiteboardOverlay.jsx`) -- Canvas 2D completo (matita, forme, testo, select/move/resize). Attivato dal ControlBar/MinimalControlBar. Persistenza propria `elab_wb_<expId>`.

Entrambi sono montati dentro `NewElabSimulator.jsx:887-886` e controllati da state locali (`drawingEnabled`, `showWhiteboard`) in NewElabSimulator.

I due bug P0 si manifestano su **entrambi** i layer, ma con root cause distinte.

---

## Root Cause Analysis

### T1-001: Lavagna vuota non selezionabile

**Sintomo**: l'utente apre la lavagna (DrawingOverlay o WhiteboardOverlay) ma il canvas vuoto non risponde a click/touch.

**Root cause -- DrawingOverlay** (`DrawingOverlay.jsx:123-124`):

```javascript
const handlePointerDown = useCallback((e) => {
  if (!drawingMode || !drawingEnabled || !showToolbar) return;  // <-- GATE
```

Al primo mount, `drawingMode` e `true` (riga 90), `drawingEnabled` e la prop passata dal parent, e `showToolbar` e `true` (riga 91). Queste condizioni sono soddisfatte, quindi il problema NON e qui per il DrawingOverlay isolato.

**Root cause reale -- stale closure su `isDrawingEnabled`** (`NewElabSimulator.jsx:168-183`):

```javascript
useEffect(() => {
  const toggle = (enabled) => setDrawingEnabled(typeof enabled === 'boolean' ? enabled : (p) => !p);
  const check = setInterval(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api) {
      api.toggleDrawing = toggle;
      api.isDrawingEnabled = () => drawingEnabled; // STALE CLOSURE
      clearInterval(check);
    }
  }, 200);
  // ...
}, [drawingEnabled]); // <-- re-runs every time drawingEnabled changes
```

Il `useEffect` ha `[drawingEnabled]` come dependency. Ogni volta che `drawingEnabled` cambia, il cleanup elimina `api.toggleDrawing` e `api.isDrawingEnabled` (riga 181), poi il nuovo effect crea un NUOVO `setInterval` per riassegnarli. Durante il gap tra cleanup e la prossima iterazione del setInterval (fino a 200ms), **`api.toggleDrawing` non esiste**. Se LavagnaShell chiama `api.toggleDrawing(true)` in quel gap, il disegno non si attiva.

Inoltre, `api.isDrawingEnabled` cattura `drawingEnabled` tramite closure al momento della creazione, quindi restituisce un valore stale. Questo causa il problema nel polling di LavagnaShell (righe 617-627) che controlla `api.isDrawingEnabled()` per sincronizzare lo stato.

**Root cause -- WhiteboardOverlay**: il WhiteboardOverlay ha una guardia `if (!active) return null;` (riga 742). Il problema qui e diverso: il Whiteboard richiede `experimentId` per il load/save da localStorage (riga 361: `if (!experimentId || !canvasRef.current) return;`). Se nessun esperimento e caricato, `experimentId` e null, e il canvas non viene inizializzato. Questo e by-design (il whiteboard e per-experiment), ma l'utente non riceve feedback sul perche non funziona.

### T1-002: Scritti spariscono su Esci

**Sintomo**: cliccando "Esci" dalla lavagna (DrawingOverlay o WhiteboardOverlay), i contenuti spariscono e non si ritrovano riaprendo.

**Root cause -- DrawingOverlay**: NESSUN BUG QUI per il DrawingOverlay. La persistenza funziona correttamente:
- `saveDrawingPaths()` e chiamato su ogni `handlePointerUp` (riga 154)
- I paths sono salvati in localStorage scoped per experiment (o legacy bucket)
- Al remount, `loadDrawingPaths(experimentId)` (riga 85) ricarica i dati
- Il bottone "ESCI" chiama `onClose()` (riga 406) che in NewElabSimulator e `() => setDrawingEnabled(false)` (riga 887). Lo state `paths` e gia stato persistito.

**Root cause -- WhiteboardOverlay** (`WhiteboardOverlay.jsx:392-451`):

Il `saveToStorage()` e chiamato solo in punti specifici:
- Dopo `endDraw` (riga 648)
- Dopo `undo`/`redo` (righe 266, 287)
- Dopo `commitText` (riga 687)
- Dopo `clearAll` (riga 699)
- Dopo select-move (riga 628)

**MA**: il `saveToStorage` ha una guardia critica alla riga 393:

```javascript
const saveToStorage = useCallback(() => {
  if (!experimentId || !canvasRef.current) return; // <-- GUARD
```

Se `experimentId` e null/undefined (scenario "lavagna libera" / freeMode / sandbox senza experiment caricato), **NULLA viene salvato**. Questo e il bug T1-002 per il WhiteboardOverlay.

Per il DrawingOverlay il salvataggio funziona anche senza experimentId (usa la chiave legacy `elab-drawing-paths`), quindi il bug T1-002 colpisce solo il WhiteboardOverlay.

**Root cause -- stato penna (DrawingOverlay) perso su close/reopen rapido**: C'e un bug sottile. Quando l'utente clicca "ESCI" dal DrawingOverlay, `onClose()` setta `drawingEnabled = false`. Il DrawingOverlay returna `null` (riga 215), facendo unmount del componente. Al remount (riclick su "Penna"), lo state `paths` viene re-inizializzato da `useState(() => loadDrawingPaths(experimentId))` (riga 85), quindi i dati persistiti vengono correttamente ricaricati. Il problema appare solo se l'utente sta disegnando e il `handlePointerUp` non e ancora stato chiamato (traccia in corso non salvata). Pero questo e un edge case raro, non il bug P0 segnalato.

---

## Architettura attuale lavagna (as-is)

### Component tree

```
LavagnaShell
  +-- AppHeader (tab: lavagna/lezione/classe/progressi)
  +-- FloatingToolbar (select/wire/delete/undo/redo/pen)
  +-- <main className="canvas">
  |     +-- NewElabSimulator (lazy)
  |     |     +-- SimulatorCanvas (SVG circuito)
  |     |     +-- WhiteboardOverlay (Canvas 2D, active={showWhiteboard})
  |     |     +-- DrawingOverlay (SVG, drawingEnabled={drawingEnabled})
  |     +-- FloatingToolbar
  |     +-- VisionButton
  +-- GalileoAdapter (UNLIM)
  +-- MascotPresence
  +-- ExperimentPicker
  +-- BentornatiOverlay
```

### State flow per disegno

```
LavagnaShell                          NewElabSimulator
  activeTool = 'pen'                    drawingEnabled (state)
       |                                      |
  handleToolChange('pen')               useEffect registers
       |                                api.toggleDrawing = toggle
  api.toggleDrawing(true)                     |
       |                               setDrawingEnabled(true)
       v                                      |
  (polling 300ms)                        DrawingOverlay
  api.isDrawingEnabled()           drawingEnabled=true --> renders SVG
       |                                      |
  drawingEnabled changes                pointerDown/Move/Up
       |                                      |
  sync back to                          saveDrawingPaths()
  LavagnaShell state                    --> localStorage
```

### Event handling chain

1. **LavagnaShell** `handleToolChange('pen')` (riga 573-580)
2. Calls `window.__ELAB_API.toggleDrawing(true)` via `syncDrawing()` (riga 562-566)
3. **NewElabSimulator** `setDrawingEnabled(true)` (riga 169)
4. **DrawingOverlay** renders with `drawingEnabled=true`, mounts SVG
5. User draws -- pointer events captured on SVG (riga 268-271)
6. `handlePointerUp` saves paths to localStorage (riga 154)
7. "ESCI" button calls `onClose()` --> `setDrawingEnabled(false)` (riga 887)
8. LavagnaShell polling detects `!api.isDrawingEnabled()` (righe 617-627)
9. LavagnaShell resets `activeTool` to 'select'

---

## Soluzione proposta

### T1-001 fix: eliminare stale closure e race condition su toggleDrawing

**File**: `src/components/simulator/NewElabSimulator.jsx`, righe 166-183

**Problema**: il `useEffect` con `[drawingEnabled]` ricrea continuamente `api.toggleDrawing` e `api.isDrawingEnabled`, creando gap dove non esistono.

**Fix**: usare un `useRef` per tenere lo stato corrente e registrare le funzioni UNA SOLA VOLTA (dependency array vuoto). In questo modo non c'e mai un gap.

```javascript
// BEFORE (buggy):
useEffect(() => {
  const toggle = (enabled) => setDrawingEnabled(...);
  const check = setInterval(() => {
    const api = window.__ELAB_API;
    if (api) {
      api.toggleDrawing = toggle;
      api.isDrawingEnabled = () => drawingEnabled; // stale!
      clearInterval(check);
    }
  }, 200);
  return () => { clearInterval(check); delete api.toggleDrawing; ... };
}, [drawingEnabled]); // re-registers on every change!

// AFTER (fixed):
const drawingEnabledRef = useRef(drawingEnabled);
useEffect(() => { drawingEnabledRef.current = drawingEnabled; }, [drawingEnabled]);

useEffect(() => {
  const toggle = (enabled) => setDrawingEnabled(
    typeof enabled === 'boolean' ? enabled : (p) => !p
  );
  const check = setInterval(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api) {
      api.toggleDrawing = toggle;
      api.isDrawingEnabled = () => drawingEnabledRef.current;
      clearInterval(check);
    }
  }, 200);
  return () => {
    clearInterval(check);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api) { delete api.toggleDrawing; delete api.isDrawingEnabled; }
  };
}, []); // stable -- registered once, cleaned up on unmount only
```

**Perche funziona**: `toggle` chiama `setDrawingEnabled` che e stabile (React guarantees). `isDrawingEnabled` legge da ref che e sempre aggiornato. Le funzioni vengono registrate una volta e rimangono disponibili senza gap.

**File aggiuntivo**: feedback per WhiteboardOverlay senza experiment. Quando `experimentId` e null, mostrare un avviso inline "Carica un esperimento per usare la lavagna" oppure usare una chiave fallback (come fa DrawingOverlay con `elab-drawing-paths`).

**File**: `src/components/simulator/panels/WhiteboardOverlay.jsx`, riga 361-362

```javascript
// BEFORE:
if (!experimentId || !canvasRef.current) return;

// AFTER (feedback):
if (!canvasRef.current) return;
const key = experimentId ? `elab_wb_${experimentId}` : 'elab_wb_sandbox';
```

### T1-002 fix: WhiteboardOverlay persistenza senza experimentId

**File**: `src/components/simulator/panels/WhiteboardOverlay.jsx`

**Cambiamento 1** -- `saveToStorage` (riga 392-451): rimuovere la guardia `if (!experimentId)` e usare chiave fallback `elab_wb_sandbox`.

```javascript
// BEFORE (riga 393):
if (!experimentId || !canvasRef.current) return;
const key = `elab_wb_${experimentId}`;

// AFTER:
if (!canvasRef.current) return;
const key = experimentId ? `elab_wb_${experimentId}` : 'elab_wb_sandbox';
```

**Cambiamento 2** -- load effect (riga 360-389): stessa logica per la chiave.

```javascript
// BEFORE (riga 361):
if (!experimentId || !canvasRef.current) return;
const key = `elab_wb_${experimentId}`;

// AFTER:
if (!canvasRef.current) return;
const key = experimentId ? `elab_wb_${experimentId}` : 'elab_wb_sandbox';
```

**Cambiamento 3** -- debounce auto-save: aggiungere un `useEffect` che fa auto-save ogni 5 secondi durante il disegno attivo, per proteggere da crash/close accidentali.

```javascript
useEffect(() => {
  if (!active) return;
  const interval = setInterval(() => {
    saveToStorage();
  }, 5000);
  return () => clearInterval(interval);
}, [active, saveToStorage]);
```

**Raccomandazione auto-save vs prompt "vuoi salvare?"**:

| Approccio | Pro | Contro |
|-----------|-----|--------|
| Auto-save (raccomandato) | Zero friction, target bambini 8-14, nessuna decisione | Usa localStorage silenziosamente |
| Prompt "Vuoi salvare?" | Controllo esplicito | Friction per docente, bambini non leggono prompt, delay |

**Verdetto**: AUTO-SAVE. Il target utente (bambini 8-14 + docente non tecnico) richiede zero friction. Il DrawingOverlay gia usa auto-save e funziona. Allineare il WhiteboardOverlay allo stesso pattern.

---

## Edge cases enumerati

1. **Canvas resize durante disegno**: WhiteboardOverlay ha un ResizeObserver (riga 355) che ridimensiona il canvas e preserva il contenuto tramite `toDataURL` + redraw. Il DrawingOverlay usa dimensioni fisse dalla prop. OK per entrambi.

2. **Multiple lavagne aperte**: impossibile per design -- DrawingOverlay e WhiteboardOverlay sono mutualmente esclusivi nel DOM (uno solo attivo alla volta). Nessun rischio di conflitto.

3. **localStorage pieno (QuotaExceededError)**: DrawingOverlay lo gestisce (drawingStorage.js riga 43: `catch { /* quota exceeded */ }`). WhiteboardOverlay lo gestisce (riga 450: `catch { /* quota exceeded */ }`). Pero nessuno dei due notifica l'utente. Aggiungere un toast "Spazio esaurito, i disegni non verranno salvati" su catch QuotaExceededError.

4. **Dati corrotti in localStorage**: DrawingOverlay gestisce (drawingStorage.js riga 32: `catch { return []; }`). WhiteboardOverlay gestisce parzialmente (riga 380: `catch { /* legacy format */ }` poi tenta come immagine). OK ma aggiungere `try/catch` anche intorno al load come Image per evitare crash su dati totalmente corrotti.

5. **Browser private/incognito**: localStorage e disponibile ma effimero. Comportamento corretto: salva nella sessione, perde al close. Nessuna azione richiesta, ma documentare nel tooltip "I disegni vengono salvati localmente nel browser".

6. **Touch vs mouse event handling**: entrambi i layer usano Pointer Events API (unificata mouse/touch/pen). WhiteboardOverlay ha palm rejection per Apple Pencil (riga 506-513). DrawingOverlay usa `setPointerCapture` (riga 125). OK, nessun bug qui.

7. **Unmount durante salvataggio async**: il `saveToStorage` del WhiteboardOverlay e sincrono (localStorage.setItem e sincrono). Il `saveDrawingPaths` e sincrono. Nessun rischio di race condition su unmount.

8. **Penna chiusa durante traccia in corso**: se l'utente sta disegnando (pointer down) e chiude il DrawingOverlay (ESC/ESCI), `handlePointerUp` non viene chiamato e la traccia corrente viene persa. Fix: nel `onClose` callback, flush manuale della traccia corrente.

9. **Experiment switch senza close/reopen**: DrawingOverlay gestisce (riga 103-108: useEffect su `[experimentId]` ricarica paths). WhiteboardOverlay gestisce (riga 360-389: useEffect su `[experimentId]`). OK.

10. **FreeMode (nessun experiment)**: DrawingOverlay usa chiave legacy `elab-drawing-paths`. WhiteboardOverlay con il fix usa `elab_wb_sandbox`. OK dopo il fix.

---

## File impattati (lista esaustiva)

| File path | Tipo modifica | Righe stimate |
|-----------|---------------|---------------|
| `src/components/simulator/NewElabSimulator.jsx` | edit | ~15 righe (ref pattern per toggleDrawing) |
| `src/components/simulator/panels/WhiteboardOverlay.jsx` | edit | ~20 righe (chiave fallback + auto-save interval) |
| `tests/unit/simulator/toggleDrawingStable.test.js` | new | ~60 righe |
| `tests/unit/simulator/whiteboardPersistence.test.js` | new | ~80 righe |
| `tests/unit/drawingStorage.test.js` | edit | ~15 righe (test per edge case T1-001 con null experimentId) |

---

## Test Strategy

### Vitest unit

**T1-001 tests** (`tests/unit/simulator/toggleDrawingStable.test.js`):
- `api.toggleDrawing` rimane disponibile dopo cambio drawingEnabled (no gap)
- `api.isDrawingEnabled()` restituisce il valore corrente (non stale)
- Cleanup su unmount rimuove le funzioni dall'API
- Race condition: toggle chiamato prima che API esista (polling)

**T1-002 tests** (`tests/unit/simulator/whiteboardPersistence.test.js`):
- `saveToStorage` scrive in localStorage quando `experimentId` e null (usa chiave sandbox)
- `saveToStorage` scrive in localStorage quando `experimentId` e presente (usa chiave scoped)
- Load da localStorage ripristina dati salvati (round-trip)
- QuotaExceededError viene catturato silenziosamente
- Dati corrotti in localStorage non causano crash, restituiscono canvas vuoto
- Auto-save interval viene creato quando `active=true` e distrutto su cleanup
- Chiavi diverse per experiment diversi non si sovrascrivono

**DrawingOverlay edge case tests** (edit `tests/unit/drawingStorage.test.js`):
- `loadDrawingPaths(null)` usa chiave legacy
- `saveDrawingPaths([], null)` usa chiave legacy
- Nessun bleed cross-experiment verificato

### Playwright E2E

**Smoke**: apri app --> click "Penna" --> disegna linea --> verifica SVG path visibile
**T1-001**: click su canvas vuoto con penna attiva --> verifica `pointerdown` event registrato --> verifica path creato
**T1-002**: disegna --> click "ESCI" --> riclick "Penna" --> verifica paths ancora visibili
**WhiteboardOverlay**: apri whiteboard --> disegna --> chiudi --> riapri --> verifica canvas non vuoto

### Principio Zero v3 preservato

- Nessun file tocca: system prompt, AI behavior, UNLIM chat, base prompt, RAG chunks
- Il fix e confinato a: event handler registration, localStorage persistence
- La lavagna resta strumento del docente (proiettato su LIM) -- nessun cambio al flusso docente/studente
- File `src/services/unlimContextCollector.js`: NON toccato
- File `src/data/rag-chunks.json`: NON toccato
- File `src/components/lavagna/useGalileoChat.js`: NON toccato

---

## Sequenza implementazione DEV

### Step 1: RED -- scrivere test per T1-001

File: `tests/unit/simulator/toggleDrawingStable.test.js`

Test che verificano:
- `api.toggleDrawing` e sempre una funzione stabile
- `api.isDrawingEnabled()` riflette lo stato corrente
- Nessun gap tra cleanup e re-registrazione

Questi test FALLISCONO con il codice attuale (stale closure).

### Step 2: GREEN -- fix T1-001 in NewElabSimulator

File: `src/components/simulator/NewElabSimulator.jsx`

Applicare il ref pattern descritto sopra. Eseguire `npx vitest run` -- i test del Step 1 passano, baseline non regredisce.

### Step 3: RED -- scrivere test per T1-002

File: `tests/unit/simulator/whiteboardPersistence.test.js`

Test che verificano:
- Persistenza senza experimentId (chiave sandbox)
- Round-trip save/load
- QuotaExceededError handling
- Auto-save interval

### Step 4: GREEN -- fix T1-002 in WhiteboardOverlay

File: `src/components/simulator/panels/WhiteboardOverlay.jsx`

Applicare i 3 cambiamenti descritti. Eseguire `npx vitest run` -- tutti i test passano.

### Step 5: REFACTOR -- edge case flush traccia su close

File: `src/components/simulator/canvas/DrawingOverlay.jsx`

Aggiungere flush della traccia corrente nel `onClose` handler (edge case #8). Eseguire `npx vitest run`.

### Step 6: CoV -- triple vitest run + build

```bash
npx vitest run  # run 1
npx vitest run  # run 2
npx vitest run  # run 3
npm run build
```

Tutti e 3 devono PASSARE con count >= baseline (12103).

---

## Rischi e mitigazione

| Rischio | Impatto | Probabilita | Mitigazione |
|---------|---------|-------------|-------------|
| Ref pattern introduce bug di sincronizzazione React | Alto | Basso | Il pattern `useRef` + `useEffect` sync e idiomatico React. Testare con rapid toggle. |
| WhiteboardOverlay chiave `elab_wb_sandbox` crea dati orfani in localStorage | Basso | Medio | Aggiungere cap (gia presente: MAX_WB_ENTRIES=10) che include la chiave sandbox nel conteggio. |
| Auto-save interval causa performance degradation | Basso | Basso | `saveToStorage` e leggero (canvas.toDataURL chiamato solo se ci sono modifiche). Interval 5s e conservativo. |
| File lockati toccati per errore | Alto | Basso | I file modificati (`NewElabSimulator.jsx`, `WhiteboardOverlay.jsx`) NON sono nella lista lockati. `engine/*` non viene toccato. |
| Regressione test baseline | Alto | Basso | CoV 3x prima di dichiarare PASS. Git tag `baseline-HHMM` prima di ogni modifica. |
