# PROMPT: Implementa Antigravity Phase 1 — Parent-Child Grouping

Sei un esperto sviluppatore React/SVG. Implementa il sistema "Antigravity" nel simulatore ELAB seguendo ESATTAMENTE queste istruzioni. Non inventare, non aggiungere, non cambiare nulla che non sia specificato.

## CONTESTO ARCHITETTURALE

Il simulatore ELAB usa coordinate SVG assolute per tutti i componenti. Non esiste gerarchia padre-figlio tra breadboard e componenti. L'unico legame logico e' `pinAssignments` (es. `"led1:anode": "bb1:a5"`).

**Problema**: quando l'utente trascina la breadboard, i componenti snappati NON la seguono.

**Soluzione**: aggiungere un campo `parentId` nel layout di ogni componente. Quando la breadboard viene trascinata, propagare il delta a tutti i figli.

## FILE DA MODIFICARE

1. `src/components/simulator/utils/parentChild.js` — CREARE (nuovo)
2. `src/components/simulator/canvas/SimulatorCanvas.jsx` — MODIFICARE
3. `src/components/simulator/NewElabSimulator.jsx` — MODIFICARE
4. `src/components/simulator/utils/breadboardSnap.js` — SOLO LEGGERE (non modificare)

## ARCHITETTURA DRAG ATTUALE (per capire dove inserire il codice)

### SimulatorCanvas.jsx — Variabili di stato del drag

```
isDragging         — State boolean, true durante il drag
dragCompId         — State string, ID del componente trascinato
dragOffset         — State {x, y}, offset dal mouse all'origine del componente
dragStartPosRef    — Ref {x, y, rotation}, posizione originale (per revert)
lastDragPosRef     — Ref {x, y, rotation}, posizione finale in tempo reale
selectedComponents — State Set<string>, componenti multi-selezionati
```

### handleComponentMouseDown (L1492-1637)

Inizia il drag:
```javascript
const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
const pos = experiment?.layout?.[componentId] || { x: 0, y: 0 };
dragStartPosRef.current = pos;
setDragOffset({ x: svgPt.x - pos.x, y: svgPt.y - pos.y });
setDragCompId(componentId);
setIsDragging(true);
```

### handleMouseMove (L899-1017) — IL CUORE DEL DRAG

1. Converte coordinate client -> SVG (L907-908):
```javascript
const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
let newX = svgPt.x - dragOffset.x;
let newY = svgPt.y - dragOffset.y;
```

2. Snap-to-hole (L913-931):
```javascript
const noSnapTypes = ['breadboard-half', 'breadboard-full', 'battery9v', 'nano-r4'];
if (draggedComp && !noSnapTypes.includes(draggedComp.type)) {
  const breadboards = (experiment.components || []).filter(
    c => c.type === 'breadboard-half' || c.type === 'breadboard-full'
  );
  for (const bb of breadboards) {
    const bbPos = experiment.layout?.[bb.id] || { x: 0, y: 0 };
    const snap = snapComponentToHole(draggedComp.type, newX, newY, bbPos.x, bbPos.y);
    if (snap) {
      newX = snap.x;
      newY = snap.y;
      break;
    }
  }
}
```

3. Calcola delta e aggiorna layout (L933-955):
```javascript
const existingPos = experiment.layout?.[dragCompId] || { x: 0, y: 0 };
const newRenderX = Math.round(newX * 4) / 4;
const newRenderY = Math.round(newY * 4) / 4;
const dx = newRenderX - existingPos.x;
const dy = newRenderY - existingPos.y;

lastDragPosRef.current = { ...existingPos, x: newRenderX, y: newRenderY };

if (selectedComponents.has(dragCompId) && selectedComponents.size > 1) {
  for (const compId of selectedComponents) {
    const cPos = experiment.layout?.[compId] || { x: 0, y: 0 };
    onLayoutChange(compId, { ...cPos, x: cPos.x + dx, y: cPos.y + dy }, false);
  }
} else {
  onLayoutChange(dragCompId, lastDragPosRef.current, false);
}
```

### handleMouseUp (L1019-1086) — COMMIT

```javascript
const finalPos = lastDragPosRef.current || experiment.layout?.[pending.componentId];
if (!isValidDropPosition(pending.compType, finalPos.x, finalPos.y, ...)) {
  onLayoutChange(pending.componentId, dragStartPosRef.current, true); // REVERT
} else {
  onLayoutChange(pending.componentId, finalPos, true); // COMMIT
}
```

### onLayoutChange callback

Firma: `onLayoutChange(compId, positionObject, isCommit)`
- `isCommit=false` durante il drag (intermedio, ogni frame)
- `isCommit=true` al rilascio del mouse (finale, salva in undo stack)

## IMPLEMENTAZIONE — 5 TASK

---

### TASK 1: Creare `src/components/simulator/utils/parentChild.js`

Crea questo file ESATTAMENTE:

```javascript
/**
 * Antigravity: Parent-Child component grouping utilities.
 * Components can be "parented" to a breadboard via layout[compId].parentId.
 * When the parent is dragged, all children move by the same delta.
 */

/**
 * Find all components whose parentId matches the given parent.
 * @param {string} parentId - The parent component ID (typically a breadboard)
 * @param {Object} layout - The experiment layout { compId: { x, y, rotation, parentId? } }
 * @returns {string[]} Array of child component IDs
 */
export function getChildComponents(parentId, layout) {
  if (!layout || !parentId) return [];
  return Object.keys(layout).filter(
    compId => compId !== parentId && layout[compId]?.parentId === parentId
  );
}

/**
 * Given pinAssignments, infer parentId for each component.
 * Used when loading "Gia Montato" experiments that don't have parentId set.
 * @param {Object} pinAssignments - e.g. { "led1:anode": "bb1:a5", "r1:pin1": "bb1:c3" }
 * @returns {Object} Map of compId -> parentBbId (e.g. { "led1": "bb1", "r1": "bb1" })
 */
export function inferParentFromPinAssignments(pinAssignments) {
  if (!pinAssignments) return {};
  const parentMap = {};
  for (const [compPin, bbHole] of Object.entries(pinAssignments)) {
    const compId = compPin.split(':')[0];
    const bbId = bbHole.split(':')[0];
    if (compId !== bbId) {
      parentMap[compId] = bbId;
    }
  }
  return parentMap;
}
```

---

### TASK 2: Modificare SimulatorCanvas.jsx — Import + Drag Propagation

**2a. Aggiungi import** (dopo gli altri import, intorno alla riga 15):

```javascript
import { getChildComponents } from '../utils/parentChild';
```

**2b. In handleMouseMove**, DOPO il blocco di aggiornamento layout (dopo la riga ~955, dopo la chiusura dell'if/else di multi-selection), AGGIUNGI:

```javascript
// ── Antigravity: propagate delta to child components ──
const draggedComp = experiment.components?.find(c => c.id === dragCompId);
const isBreadboard = draggedComp && (
  draggedComp.type === 'breadboard-half' || draggedComp.type === 'breadboard-full'
);
if (isBreadboard && experiment.layout && dx !== 0 || dy !== 0) {
  const children = getChildComponents(dragCompId, experiment.layout);
  for (const childId of children) {
    if (selectedComponents.has(childId) && selectedComponents.size > 1) continue;
    const childPos = experiment.layout[childId];
    if (childPos) {
      onLayoutChange(childId, { ...childPos, x: childPos.x + dx, y: childPos.y + dy }, false);
    }
  }
}
```

ATTENZIONE: Questo codice usa `dx` e `dy` che sono gia' calcolati nel blocco precedente (L937-938). Le variabili `draggedComp` potrebbe gia' esistere alcune righe sopra (L914) — in quel caso, riusa quella variabile o rinomina questa. Verifica leggendo il codice.

NOTA: la variabile `draggedComp` e' gia' definita a L914:
```javascript
const draggedComp = experiment.components?.find(c => c.id === dragCompId);
```
Quindi NON ri-dichiararla. Usa direttamente:
```javascript
// ── Antigravity: propagate delta to child components ──
const isBreadboard = draggedComp && (
  draggedComp.type === 'breadboard-half' || draggedComp.type === 'breadboard-full'
);
if (isBreadboard && experiment.layout && (dx !== 0 || dy !== 0)) {
  const children = getChildComponents(dragCompId, experiment.layout);
  for (const childId of children) {
    if (selectedComponents.has(childId) && selectedComponents.size > 1) continue;
    const childPos = experiment.layout[childId];
    if (childPos) {
      onLayoutChange(childId, { ...childPos, x: childPos.x + dx, y: childPos.y + dy }, false);
    }
  }
}
```

---

### TASK 3: Modificare SimulatorCanvas.jsx — Auto-parenting su snap

**3a. Traccia se lo snap e' avvenuto.** Nel blocco snap-to-hole (L913-931), PRIMA del loop `for (const bb of breadboards)`, aggiungi:

```javascript
let snapFound = false;
```

**3b. Dentro `if (snap)` (L929)**, aggiungi `snapFound = true` e il parenting:

```javascript
if (snap) {
  newX = snap.x;
  newY = snap.y;
  snapFound = true;
  // Auto-parenting: mark this component as child of the breadboard
  if (experiment.layout?.[dragCompId]) {
    const currentLayout = experiment.layout[dragCompId];
    if (currentLayout.parentId !== bb.id) {
      onLayoutChange(dragCompId, { ...currentLayout, x: newX, y: newY, parentId: bb.id }, false);
    }
  }
  break;
}
```

**3c. De-parenting.** DOPO la chiusura del loop `for (const bb of breadboards)` (dopo il `}` di chiusura dell'`if (!noSnapTypes...)`), aggiungi:

```javascript
// De-parenting: if no breadboard snapped, remove parentId
if (!snapFound && experiment.layout?.[dragCompId]?.parentId) {
  const currentLayout = experiment.layout[dragCompId];
  const { parentId: _removed, ...layoutWithoutParent } = currentLayout;
  onLayoutChange(dragCompId, { ...layoutWithoutParent, x: newX, y: newY }, false);
}
```

NOTA: `snapFound` deve essere accessibile qui. Se il blocco `if (!noSnapTypes...)` e' dentro un altro scope, dovrai dichiarare `snapFound` a un livello superiore o usare un approccio diverso. Leggi il codice attuale per decidere.

---

### TASK 4: Modificare NewElabSimulator.jsx — Infer parentId all'apertura

**4a. Aggiungi import** (dopo gli altri import):

```javascript
import { inferParentFromPinAssignments } from './utils/parentChild';
```

**4b. Trova dove l'esperimento viene caricato.** Cerca `loadExperiment` nel file. Ci sono circa 3-4 chiamate. La piu' importante e' quella che carica l'esperimento completo (in "Gia Montato" mode).

Cerca un pattern come:
```javascript
solverRef.current.loadExperiment(mergedExperiment, { preserveState: true });
```

**SUBITO PRIMA** di questa riga, aggiungi l'inferenza parentId:

```javascript
// Antigravity: infer parentId from pinAssignments for pre-built experiments
if (mergedExperiment.pinAssignments && mergedExperiment.layout) {
  const parentMap = inferParentFromPinAssignments(mergedExperiment.pinAssignments);
  for (const [compId, bbId] of Object.entries(parentMap)) {
    if (mergedExperiment.layout[compId] && !mergedExperiment.layout[compId].parentId) {
      mergedExperiment.layout[compId] = {
        ...mergedExperiment.layout[compId],
        parentId: bbId
      };
    }
  }
}
```

ATTENZIONE: Potresti dover mutare l'oggetto mergedExperiment prima che venga passato al solver. Assicurati che `mergedExperiment` non sia frozen/immutabile. Se lo e', fai una copia: `const layoutCopy = { ...mergedExperiment.layout };` e poi riassegna.

NOTA: Applica questo SOLO al primo/principale `loadExperiment` call, NON a quelli con `preserveState: true` che vengono chiamati durante il drag. L'inferenza deve avvenire UNA VOLTA all'apertura dell'esperimento.

---

### TASK 5: Modificare SimulatorCanvas.jsx — Commit dei figli su mouseUp

**5a. In handleMouseUp**, dopo la riga che committa il componente principale:

```javascript
onLayoutChange(pending.componentId, finalPos, true); // Questa riga GIA' ESISTE
```

AGGIUNGI subito dopo:

```javascript
// Antigravity: commit child positions when breadboard drag ends
const dragComp = experiment.components?.find(c => c.id === pending.componentId);
const isBB = dragComp && (
  dragComp.type === 'breadboard-half' || dragComp.type === 'breadboard-full'
);
if (isBB && experiment.layout) {
  const children = getChildComponents(pending.componentId, experiment.layout);
  for (const childId of children) {
    const childPos = experiment.layout[childId];
    if (childPos) {
      onLayoutChange(childId, childPos, true);
    }
  }
}
```

NOTA: C'e' ANCHE un blocco di revert (quando `isValidDropPosition` fallisce). In quel caso i figli dovrebbero tornare alle posizioni originali. Ma siccome il revert ripristina `dragStartPosRef.current` solo per il componente trascinato, i figli rimangono spostati. Per ora accettiamo questo comportamento — il revert e' raro e si puo' sistemare dopo.

---

## VERIFICA FINALE

Dopo aver completato tutti e 5 i task:

1. `npm run build` — DEVE dare 0 errori
2. Apri Chrome su http://localhost:5173 (o il dev server)
3. Carica un esperimento Vol1 in "Gia Montato" (es. "LED Rosso")
4. Trascina la BREADBOARD → tutti i componenti (LED, resistore, fili) devono seguire
5. Trascina un singolo LED via dalla breadboard → si stacca (de-parenting)
6. Trascina il LED di nuovo sulla breadboard → si ri-attacca (auto-parenting)
7. Trascina la breadboard → il LED appena ri-attaccato segue

Se tutto funziona, committa:
```bash
git add -A
git commit -m "feat(antigravity): Phase 1 complete — parent-child component grouping

- parentChild.js: getChildComponents + inferParentFromPinAssignments helpers
- SimulatorCanvas: drag propagation to children on breadboard move
- SimulatorCanvas: auto-parent on snap, de-parent on drag away
- SimulatorCanvas: commit child positions on mouseUp
- NewElabSimulator: infer parentId from pinAssignments on experiment load

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

## COSA NON FARE

- NON modificare `breadboardSnap.js` (SNAP_THRESHOLD resta 4.5 per ora)
- NON modificare `WireRenderer.jsx` (i fili si aggiornano automaticamente)
- NON modificare `CircuitSolver.js`
- NON aggiungere nuovi pacchetti npm
- NON creare file CSS
- NON aggiungere console.log (il progetto ha 0 console.log in produzione)
