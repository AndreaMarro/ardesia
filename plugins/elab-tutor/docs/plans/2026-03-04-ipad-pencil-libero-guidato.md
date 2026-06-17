# iPad + Apple Pencil + Libero Guidato — Piano Definitivo

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rendere il simulatore ELAB perfettamente funzionante su iPad con Apple Pencil e trasformare la modalità Libero in un'esperienza guidata con Galileo coach.

**Architecture:** Sprint 1 converte SimulatorCanvas da 7 handler mouse/touch separati a 3 handler Pointer Events API unificati, abilitando palm rejection, stylus detection e hover. Sprint 2 aggiunge un CircuitComparator che confronta lo stato del circuito con i buildSteps dell'esperimento, alimentando progress tracking in ExperimentGuide e suggerimenti proattivi di Galileo.

**Tech Stack:** React 19, SVG Pointer Events API, CSS `touch-action`, useCallback/useMemo hooks, CanvasRenderingContext2D pressure API.

---

## SPRINT 1: iPad + Apple Pencil (15h — 3 sessioni)

### Task 1: Pointer Events API — SimulatorCanvas (4h)

**Il cuore di tutto.** Convertire SimulatorCanvas.jsx da 7 handler separati (3 mouse + 4 touch) a 3 handler Pointer Events unificati. Questo singolo refactor sblocca: iPad touch, Apple Pencil, palm rejection, hover, pressione.

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx:864-1470, 2208-2214`

**Principio architetturale:** `PointerEvent` è un superset di `MouseEvent`. Ha le stesse proprietà (`clientX`, `clientY`, `button`, `altKey`) PIÙ: `pointerId`, `pointerType` ('mouse'|'touch'|'pen'), `isPrimary`, `pressure` (0-1), `tiltX/tiltY`. Un singolo `onPointerDown` sostituisce sia `onMouseDown` che `onTouchStart`.

**Step 1: Creare handlePointerDown unificato**

Sostituisce `handleMouseDown` (riga 864) + `handleTouchStart` (riga 1242). La logica:

```javascript
const handlePointerDown = useCallback((e) => {
  // Palm rejection: ignora contatti non-primari (palmo durante uso Pencil)
  if (!e.isPrimary) return;

  // Cattura il pointer per ricevere tutti gli eventi futuri
  e.target.setPointerCapture?.(e.pointerId);

  // Salva il tipo di input per uso nei Move/Up
  pointerTypeRef.current = e.pointerType; // 'mouse' | 'touch' | 'pen'

  // Pinch-to-zoom: secondo tocco inizia il pinch
  if (e.pointerType === 'touch') {
    activeTouchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activeTouchesRef.current.size === 2) {
      // Inizia pinch-zoom
      const [t1, t2] = [...activeTouchesRef.current.values()];
      pinchStartDistRef.current = Math.hypot(t2.x - t1.x, t2.y - t1.y);
      pinchStartZoomRef.current = zoom;
      setIsPinching(true);
      return;
    }
  }

  // Pan con middle button o Alt+left (logica da handleMouseDown riga 866)
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    return;
  }

  // Wire mode (logica da handleMouseDown riga 874)
  if (wireMode && e.button === 0 && !e.altKey && experiment) {
    const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
    const pinTolerance = Math.max(PIN_HIT_TOLERANCE, PIN_HIT_TOLERANCE * 2 / zoom);
    const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment.components, experiment.layout, pinTolerance);
    if (pinRef) {
      // ... stessa logica wire di handleMouseDown ...
      e.stopPropagation();
      return;
    }
  }

  // Component drag (logica da handleTouchStart riga 1248)
  if (!wireMode && experiment && !isPanning) {
    const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
    const compList = experiment.components || [];
    const hitComp = compList.find(comp => {
      const layout = experiment.layout?.[comp.id];
      if (!layout) return false;
      const bbox = getBoundingBox(comp);
      if (!bbox) return false;
      return svgPt.x >= bbox.x && svgPt.x <= bbox.x + bbox.w &&
        svgPt.y >= bbox.y && svgPt.y <= bbox.y + bbox.h;
    });
    if (hitComp) {
      e.preventDefault();
      const compPos = experiment.layout?.[hitComp.id] || { x: 0, y: 0 };
      setDragCompId(hitComp.id);
      setIsDragging(true);
      setDragOffset({ x: svgPt.x - compPos.x, y: svgPt.y - compPos.y });
      return;
    }
  }

  // Pan con tocco singolo (logica da handleTouchStart)
  if (e.pointerType === 'touch' && activeTouchesRef.current.size === 1) {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }
}, [wireMode, experiment, zoom, isPanning, /* ... deps ... */]);
```

**Step 2: Creare handlePointerMove unificato**

Sostituisce `handleMouseMove` (riga 901) + `handleTouchMove` (riga 1321).

```javascript
const handlePointerMove = useCallback((e) => {
  if (!e.isPrimary && e.pointerType !== 'touch') return;

  // Pinch-zoom: aggiorna con secondo tocco
  if (e.pointerType === 'touch') {
    activeTouchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (isPinching && activeTouchesRef.current.size === 2) {
      const [t1, t2] = [...activeTouchesRef.current.values()];
      const newDist = Math.hypot(t2.x - t1.x, t2.y - t1.y);
      const scale = newDist / pinchStartDistRef.current;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchStartZoomRef.current * scale));
      // ... aggiorna viewBox centrato sul midpoint (logica da handleTouchMove riga 1386) ...
      return;
    }
  }

  // Apple Pencil Hover: penna vicina senza toccare (buttons === 0)
  if (e.pointerType === 'pen' && e.buttons === 0) {
    const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
    const pinTolerance = Math.max(PIN_HIT_TOLERANCE, PIN_HIT_TOLERANCE * 2 / zoom);
    const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment?.components, experiment?.layout, pinTolerance);
    setHoveredPin(pinRef);
    return;
  }

  // Track mouse position per paste
  if (svgRef.current) {
    const mp = clientToSVG(svgRef.current, e.clientX, e.clientY);
    lastMousePosRef.current = { x: mp.x, y: mp.y };
  }

  // Drag component (logica unificata da handleMouseMove + handleTouchMove)
  if (isDragging && dragCompId && experiment) {
    dragMovedRef.current = true;
    const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
    let newX = svgPt.x - dragOffset.x;
    let newY = svgPt.y - dragOffset.y;
    // ... snap-to-hole logic identica (da handleMouseMove riga 916) ...
  }

  // Pan
  if (isPanning && !isDragging) {
    const dx = (e.clientX - panStart.x) / zoom;
    const dy = (e.clientY - panStart.y) / zoom;
    // ... aggiorna viewBox ...
    setPanStart({ x: e.clientX, y: e.clientY });
  }

  // Hover pin (mouse, non Apple Pencil — già gestito sopra)
  if (e.pointerType === 'mouse' && wireMode) {
    const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
    const pinTolerance = Math.max(PIN_HIT_TOLERANCE, PIN_HIT_TOLERANCE * 2 / zoom);
    setHoveredPin(hitTestPin(svgPt.x, svgPt.y, experiment?.components, experiment?.layout, pinTolerance));
  }
}, [isDragging, dragCompId, isPanning, isPinching, wireMode, zoom, experiment, /* ... */]);
```

**Step 3: Creare handlePointerUp unificato**

Sostituisce `handleMouseUp` (riga 1064) + `handleTouchEnd` (riga 1427).

```javascript
const handlePointerUp = useCallback((e) => {
  // Rimuovi touch dalla lista attiva
  if (e.pointerType === 'touch') {
    activeTouchesRef.current.delete(e.pointerId);
    if (activeTouchesRef.current.size < 2) {
      setIsPinching(false);
    }
  }

  // Rilascia pointer capture
  e.target.releasePointerCapture?.(e.pointerId);

  // Finalize drag (logica da handleMouseUp riga 1064+)
  if (isDragging && dragCompId) {
    // ... snap finale + buildValidation check ...
  }

  // Stop pan
  if (isPanning) setIsPanning(false);
  setIsDragging(false);
  setDragCompId(null);
}, [isDragging, dragCompId, isPanning, /* ... */]);
```

**Step 4: Aggiungere ref e stato per pinch e pointer tracking**

All'inizio del componente (dopo riga 235):

```javascript
// Pointer Events state
const pointerTypeRef = useRef('mouse');
const activeTouchesRef = useRef(new Map()); // Track multi-touch for pinch
const pinchStartDistRef = useRef(0);
const pinchStartZoomRef = useRef(1);
const [isPinching, setIsPinching] = useState(false);
```

**Step 5: Aggiornare il JSX dell'SVG**

Riga 2208-2214 — sostituire i 7 handler con 3:

```jsx
<svg
  ref={svgRef}
  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
  style={{ position: 'relative', touchAction: 'none', ...style }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerLeave={(e) => { handlePointerUp(e); setHoveredPin(null); }}
  onPointerCancel={handlePointerUp}
  onClick={handleBackgroundClick}
>
```

**Step 6: Rimuovere handler obsoleti**

Eliminare le funzioni:
- `handleMouseDown` (righe 864-899)
- `handleMouseMove` (righe 901-1062)
- `handleMouseUp` (righe 1064-1240)
- `handleTouchStart` (righe 1242-1319)
- `handleTouchMove` (righe 1321-1425)
- `handleTouchEnd` (righe 1427-1462)

**NON eliminare**: `handleWheel` (zoom con rotella, riga 1201), `handleKeyDown` (riga 603), `handleBackgroundClick`.

**Step 7: Verificare**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
```
Expected: 0 errori. Bundle size simile (~955KB ElabTutorV4).

**Step 8: Test manuale**

Aprire https://localhost:5173, esperimento qualsiasi:
- [ ] Mouse: click componente → drag → rilascio → snap ✓
- [ ] Mouse: wire mode → click pin → click pin → filo creato ✓
- [ ] Mouse: Alt+drag → pan ✓
- [ ] Mouse: scroll wheel → zoom ✓
- [ ] Touch (DevTools): drag componente → snap ✓
- [ ] Touch: pinch-to-zoom ✓
- [ ] Touch: single finger pan ✓

**Step 9: Commit**

```bash
git add src/components/simulator/canvas/SimulatorCanvas.jsx
git commit -m "refactor: SimulatorCanvas → Pointer Events API (unifica mouse/touch/pen)

Sostituisce 7 handler separati (3 mouse + 4 touch) con 3 handler Pointer Events unificati.
Abilita: palm rejection (isPrimary), stylus detection (pointerType),
Apple Pencil hover (buttons===0), pressione futura.
Riduce codice (~200 righe in meno) e normalizza input cross-device.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Touch Drag dalla ComponentPalette (2h)

**Problema:** `e.dataTransfer` è `null` su `touchstart`/`pointerdown` con type `touch`|`pen`. L'API HTML5 Drag & Drop non funziona su iOS Safari.

**Files:**
- Modify: `src/components/simulator/panels/ComponentPalette.jsx:31-51`
- Modify: `src/components/simulator/panels/ComponentDrawer.jsx:86-103`
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (drop target)

**Strategia:** Tap-to-select + tap-to-place (più affidabile di custom touch drag su iPad).

**Step 1: ComponentPalette — aggiungere tap fallback**

In `ComponentPalette.jsx`, righe 31-51, aggiungere accanto a `handleDragStart`:

```javascript
// Tap-to-select per touch/pen (iPad)
const handleTapSelect = useCallback((e) => {
  // Solo per touch e pen — mouse usa drag nativo
  if (e.pointerType === 'mouse') return;
  e.preventDefault();
  e.stopPropagation();
  // Imposta il componente selezionato globalmente
  window.__elabPendingComponent = type;
  window.dispatchEvent(new CustomEvent('elab-component-selected', { detail: { type } }));
  setDragging(true); // visual feedback
  // Auto-reset dopo 15s se non piazzato
  setTimeout(() => {
    if (window.__elabPendingComponent === type) {
      window.__elabPendingComponent = null;
      setDragging(false);
    }
  }, 15000);
}, [type]);
```

Aggiornare JSX del card (riga 47+):

```jsx
<div
  draggable="true"
  onDragStart={handleDragStart}
  onPointerDown={handleTapSelect}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  onPointerEnter={() => setHovered(true)}
  onPointerLeave={() => setHovered(false)}
  style={{ ...styles.card, cursor: 'pointer' }}
>
```

**Step 2: ComponentDrawer DraggableChip — stessa modifica**

In `ComponentDrawer.jsx`, DraggableChip (riga 86-103), stessa logica `handleTapSelect`.

**Step 3: SimulatorCanvas — ricevere tap-to-place**

In `handlePointerDown` (nuovo), aggiungere alla fine:

```javascript
// Tap-to-place: se c'è un componente pendente e l'utente tocca il canvas
if (window.__elabPendingComponent && !wireMode) {
  const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
  const componentType = window.__elabPendingComponent;
  window.__elabPendingComponent = null;
  window.dispatchEvent(new CustomEvent('elab-component-placed'));

  if (onComponentAdd) {
    onComponentAdd(componentType, { x: svgPt.x, y: svgPt.y });
  }
  e.preventDefault();
  return;
}
```

**Step 4: Feedback visivo — "Tocca il canvas per piazzare"**

In `SimulatorCanvas.jsx`, aggiungere listener per `elab-component-selected`:

```javascript
const [pendingComponentType, setPendingComponentType] = useState(null);

useEffect(() => {
  const onSelect = (e) => setPendingComponentType(e.detail.type);
  const onPlace = () => setPendingComponentType(null);
  window.addEventListener('elab-component-selected', onSelect);
  window.addEventListener('elab-component-placed', onPlace);
  return () => {
    window.removeEventListener('elab-component-selected', onSelect);
    window.removeEventListener('elab-component-placed', onPlace);
  };
}, []);
```

Mostrare banner nel canvas quando `pendingComponentType`:

```jsx
{pendingComponentType && (
  <div style={{
    position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
    background: '#1E4D8C', color: 'white', padding: '8px 20px',
    borderRadius: 24, fontSize: 14, fontFamily: 'var(--font-sans)',
    zIndex: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
  }}>
    📍 Tocca il canvas per piazzare {pendingComponentType}
  </div>
)}
```

**Step 5: Verificare + commit**

```bash
npm run build && git add -A && git commit -m "feat: tap-to-place components on iPad (touch/pen fallback)

HTML5 Drag API non funziona su iOS Safari. Aggiunto tap-to-select nella
palette + tap-to-place sul canvas per touch e pen. Mouse usa drag nativo.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Pulsante Elimina + Context Menu Long-Press (3h)

**Files:**
- Modify: `src/components/simulator/panels/ControlBar.jsx:537-559`
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (long-press)

**Step 1: Pulsante Elimina nella toolbar**

In `ControlBar.jsx`, dopo il gruppo Undo/Redo (riga 559), aggiungere:

```jsx
{/* Group 5c: Delete */}
{onComponentDelete && selectedComponent && (
  <button
    className="toolbar-btn toolbar-btn--danger"
    onClick={() => onComponentDelete(selectedComponent)}
    title="Elimina componente selezionato (Canc)"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span className="toolbar-btn__label toolbar-btn__label--secondary">Elimina</span>
  </button>
)}
```

Aggiungere prop `selectedComponent` e `onComponentDelete` alla destructuring dei props di ControlBar.

**Step 2: CSS per pulsante danger**

In `ElabSimulator.css`, dopo la classe `.toolbar-btn--secondary`:

```css
.toolbar-btn--danger:hover:not(:disabled) {
  background: #FEE2E2;
  color: #DC2626;
}
```

**Step 3: Long-press context menu su SimulatorCanvas**

In `handlePointerDown` unificato, aggiungere rilevamento long-press (500ms):

```javascript
// Long-press: mostra context menu (touch/pen)
if (e.pointerType !== 'mouse' && hitComp) {
  longPressTimerRef.current = setTimeout(() => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      componentId: hitComp.id,
    });
  }, 500);
}
```

In `handlePointerMove`, cancellare long-press se si muove:

```javascript
if (longPressTimerRef.current && dragMovedRef.current) {
  clearTimeout(longPressTimerRef.current);
  longPressTimerRef.current = null;
}
```

JSX context menu:

```jsx
{contextMenu && (
  <div style={{
    position: 'fixed', left: contextMenu.x, top: contextMenu.y,
    background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    padding: '4px 0', zIndex: 100, minWidth: 160,
    fontFamily: 'var(--font-sans)', fontSize: 14,
  }}>
    <button onClick={() => { handleCopy(contextMenu.componentId); setContextMenu(null); }}
      style={ctxItemStyle}>📋 Copia</button>
    <button onClick={() => { handleDuplicate(contextMenu.componentId); setContextMenu(null); }}
      style={ctxItemStyle}>📄 Duplica</button>
    <hr style={{ margin: '4px 8px', border: 'none', borderTop: '1px solid #E5E7EB' }} />
    <button onClick={() => { onComponentDelete(contextMenu.componentId); setContextMenu(null); }}
      style={{ ...ctxItemStyle, color: '#DC2626' }}>🗑️ Elimina</button>
  </div>
)}
```

**Step 4: Verificare + commit**

```bash
npm run build && git add -A && git commit -m "feat: delete button + long-press context menu for iPad

Aggiunto pulsante Elimina nella toolbar (visibile quando componente selezionato).
Long-press 500ms su touch/pen mostra context menu con Copia/Duplica/Elimina.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Pressione Apple Pencil nel CanvasTab (2h)

**Files:**
- Modify: `src/components/tutor/CanvasTab.jsx:111-133, 287-293`

**Step 1: Convertire a Pointer Events**

Righe 287-293, sostituire mouse+touch con pointer:

```jsx
<canvas
  ref={canvasRef}
  style={{ touchAction: 'none', cursor: canvasTool === 'brush' ? 'crosshair' : 'default' }}
  onPointerDown={canvasTool === 'brush' ? startDrawing : undefined}
  onPointerMove={canvasTool === 'brush' ? draw : undefined}
  onPointerUp={stopDrawing}
  onPointerLeave={stopDrawing}
/>
```

**Step 2: Pressione variabile nel draw()**

Riga 120-128, aggiornare:

```javascript
const draw = useCallback((e) => {
  if (!isDrawing) return;
  e.preventDefault();
  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Pressione Apple Pencil: 0.0 (sfiora) → 1.0 (preme forte)
  const pressure = e.pressure ?? 0.5;
  const variableWidth = brushSize * (0.3 + pressure * 0.7); // 30-100% del pennello
  ctxRef.current.lineWidth = variableWidth;

  ctxRef.current.lineTo(x, y);
  ctxRef.current.stroke();
}, [isDrawing, brushSize]);
```

**Step 3: startDrawing con pressione iniziale**

```javascript
const startDrawing = useCallback((e) => {
  if (!e.isPrimary) return; // Palm rejection
  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const pressure = e.pressure ?? 0.5;
  ctxRef.current.lineWidth = brushSize * (0.3 + pressure * 0.7);
  ctxRef.current.beginPath();
  ctxRef.current.moveTo(x, y);
  setIsDrawing(true);
}, [brushSize]);
```

**Step 4: Commit**

```bash
git add src/components/tutor/CanvasTab.jsx
git commit -m "feat: Apple Pencil pressure sensitivity in CanvasTab

Tratto variabile basato su e.pressure (30-100% del pennello).
Palm rejection con isPrimary. Pointer Events unificati.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Hover + Active CSS + Pin Tooltips (2h)

**Files:**
- Modify: `src/components/simulator/ElabSimulator.css`
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (pin tooltip rendering)

**Step 1: CSS :active come fallback per :hover**

In `ElabSimulator.css`, aggiungere a TUTTE le regole `:hover`:

```css
/* Ogni regola :hover deve avere una corrispondente :active per touch */
.toolbar-btn:hover:not(:disabled),
.toolbar-btn:active:not(:disabled) {
  background: var(--color-bg-tertiary, #ECECF1);
}

.toolbar-overflow-item:hover,
.toolbar-overflow-item:active {
  background: #F0F0F5;
}

/* Media query per dispositivi senza hover (iPad, touch) */
@media (hover: none) {
  .toolbar-btn:active:not(:disabled) {
    background: var(--color-bg-tertiary, #ECECF1);
    transition: background 0.1s;
  }
}
```

**Step 2: Pin tooltip su hover (Pencil) e tap**

In `SimulatorCanvas.jsx`, il `hoveredPin` state già esiste. Renderizzare tooltip:

```jsx
{hoveredPin && (() => {
  const [compId, pinId] = hoveredPin.split(':');
  const comp = experiment?.components?.find(c => c.id === compId);
  const pos = experiment?.layout?.[compId];
  if (!comp || !pos) return null;
  const registered = getComponent(comp.type);
  const pinDef = registered?.pins?.find(p => p.id === pinId);
  if (!pinDef) return null;
  const absX = pos.x + pinDef.x;
  const absY = pos.y + pinDef.y - 12;
  return (
    <g transform={`translate(${absX},${absY})`} style={{ pointerEvents: 'none' }}>
      <rect x="-30" y="-14" width="60" height="16" rx="4" fill="#1E4D8C" opacity="0.9" />
      <text textAnchor="middle" y="-3" fill="white" fontSize="9" fontFamily="var(--font-sans)">
        {pinId}
      </text>
    </g>
  );
})()}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: touch-friendly hover states + pin tooltips

CSS :active fallback per tutti i :hover (iPad).
Pin tooltip SVG su hover (Pencil) e stato hoveredPin.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Deploy + Test iPad (2h)

**Step 1: Build di produzione**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
```

Expected: 0 errori, bundle size ~960KB.

**Step 2: Deploy Vercel**

```bash
npx vercel --prod --yes
```

**Step 3: Checklist test iPad con Apple Pencil**

Su iPad reale (o BrowserStack), aprire https://www.elabtutor.school:

- [ ] Tap componente nella palette → banner "Tocca per piazzare" appare
- [ ] Tap canvas → componente piazzato nella posizione corretta
- [ ] Drag componente sul canvas → snap ai buchi breadboard
- [ ] Pinch-to-zoom con due dita → zoom fluido
- [ ] Pan con un dito → canvas scorre
- [ ] Wire mode: tap pin A → tap pin B → filo creato
- [ ] Seleziona componente → pulsante Elimina appare in toolbar
- [ ] Long-press componente → context menu con Copia/Duplica/Elimina
- [ ] Apple Pencil: disegno nel CanvasTab → spessore variabile con pressione
- [ ] Apple Pencil: hover vicino a pin → tooltip con nome pin
- [ ] Apple Pencil: palmo sullo schermo → nessun input involontario
- [ ] Rotazione potenziometro con Pencil → controllo fine
- [ ] Toolbar responsive → pulsanti 48px, overflow menu funzionante

---

## SPRINT 2: Libero Guidato con Galileo Coach (14h — 3 sessioni)

### Task 7: CircuitComparator Utility (3h)

**Files:**
- Create: `src/utils/circuitComparator.js`

**Step 1: Creare la utility**

Questa funzione confronta lo stato ATTUALE del circuito con i `buildSteps` dell'esperimento target e ritorna il progresso.

```javascript
/**
 * Confronta il circuito attuale con i buildSteps dell'esperimento target.
 * Gira interamente nel frontend — nessun endpoint backend necessario.
 *
 * @param {Object} circuitState - Da buildStructuredState() (NewElabSimulator)
 * @param {Array} buildSteps - Da experiment.buildSteps
 * @returns {Object} { completedSteps, missingSteps, errors, progress, isComplete, nextStep }
 */
export function compareCircuit(circuitState, buildSteps) {
  if (!circuitState || !buildSteps?.length) {
    return { completedSteps: [], missingSteps: [], errors: [], progress: '0/0', isComplete: false, nextStep: null };
  }

  const components = circuitState.components || [];
  const connections = circuitState.connections || [];
  const completedSteps = [];
  const missingSteps = [];
  const errors = [];

  for (let i = 0; i < buildSteps.length; i++) {
    const step = buildSteps[i];

    if (step.componentId && step.componentType) {
      // Step di componente: verifica che esista nel circuito
      const found = components.find(c => c.type === step.componentType);
      if (found) {
        completedSteps.push(i);
        // Verifica posizione (opzionale, tolleranza ±30px)
        // ... check position proximity ...
      } else {
        missingSteps.push(i);
      }
    } else if (step.wireFrom && step.wireTo) {
      // Step di filo: verifica connessione
      const wireExists = connections.some(c =>
        (c.from === step.wireFrom && c.to === step.wireTo) ||
        (c.from === step.wireTo && c.to === step.wireFrom)
      );
      if (wireExists) {
        completedSteps.push(i);
      } else {
        missingSteps.push(i);
      }
    }
  }

  const total = buildSteps.length;
  const done = completedSteps.length;
  const nextStep = missingSteps.length > 0 ? buildSteps[missingSteps[0]] : null;

  return {
    completedSteps,
    missingSteps,
    errors,
    progress: `${done}/${total}`,
    progressPercent: total > 0 ? Math.round((done / total) * 100) : 0,
    isComplete: done >= total,
    nextStep,
    nextStepIndex: missingSteps[0] ?? null,
  };
}
```

**Step 2: Test unitario**

```javascript
// src/utils/__tests__/circuitComparator.test.js
import { compareCircuit } from '../circuitComparator';

test('rileva componente mancante', () => {
  const state = { components: [{ type: 'led', id: 'led1' }], connections: [] };
  const steps = [
    { step: 1, componentId: 'r1', componentType: 'resistor' },
    { step: 2, componentId: 'led1', componentType: 'led' },
  ];
  const result = compareCircuit(state, steps);
  expect(result.completedSteps).toEqual([1]);
  expect(result.missingSteps).toEqual([0]);
  expect(result.progress).toBe('1/2');
  expect(result.isComplete).toBe(false);
  expect(result.nextStep.componentType).toBe('resistor');
});

test('circuito completo', () => {
  const state = {
    components: [{ type: 'resistor', id: 'r1' }, { type: 'led', id: 'led1' }],
    connections: [{ from: 'bat1:positive', to: 'bb1:bus-top-plus-1' }],
  };
  const steps = [
    { step: 1, componentId: 'r1', componentType: 'resistor' },
    { step: 2, componentId: 'led1', componentType: 'led' },
    { step: 3, wireFrom: 'bat1:positive', wireTo: 'bb1:bus-top-plus-1' },
  ];
  const result = compareCircuit(state, steps);
  expect(result.isComplete).toBe(true);
  expect(result.progress).toBe('3/3');
});
```

**Step 3: Commit**

```bash
git add src/utils/circuitComparator.js src/utils/__tests__/circuitComparator.test.js
git commit -m "feat: CircuitComparator — confronto circuito vs buildSteps target

Utility frontend-only che analizza componenti e connessioni attuali vs
target esperimento. Ritorna: completedSteps, missingSteps, progress,
isComplete, nextStep. Nessun endpoint backend necessario.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: ExperimentGuide con Progress Tracking (3h)

**Files:**
- Modify: `src/components/simulator/panels/ExperimentGuide.jsx:16, 66-78`
- Modify: `src/components/simulator/NewElabSimulator.jsx` (passare circuitState come prop)

**Step 1: Aggiungere prop circuitState a ExperimentGuide**

In `NewElabSimulator.jsx`, dove ExperimentGuide viene renderizzato (riga 3300):

```jsx
<ExperimentGuide
  experiment={currentExperiment}
  circuitState={circuitStateForGuide}  // NUOVO
  onClose={() => setShowGuide(false)}
  onSendToGalileo={handleSendToGalileo}
/>
```

Dove `circuitStateForGuide` è derivato da un nuovo state locale aggiornato dal bridge 400ms.

**Step 2: ExperimentGuide — usare CircuitComparator**

```javascript
import { compareCircuit } from '../../../utils/circuitComparator';

export default function ExperimentGuide({ experiment, circuitState, onClose, onSendToGalileo }) {
  const [expanded, setExpanded] = useState(true);

  // Confronto real-time circuito vs target
  const comparison = useMemo(() => {
    if (!experiment?.buildSteps || !circuitState?.structured) return null;
    return compareCircuit(circuitState.structured, experiment.buildSteps);
  }, [circuitState, experiment?.buildSteps]);

  const steps = experiment?.steps || [];
  // ...
```

**Step 3: Rendering passi con ✅/⬜**

Sostituire il blocco "Cosa Fare" (righe 66-78):

```jsx
{steps.length > 0 && (
  <div style={S.section}>
    <div style={{ ...S.sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>Cosa Fare</span>
      {comparison && (
        <span style={{ fontSize: 12, color: comparison.isComplete ? '#16A34A' : '#6B7280', fontWeight: 600 }}>
          {comparison.isComplete ? '✅ Completo!' : comparison.progress}
        </span>
      )}
    </div>

    {/* Progress bar */}
    {comparison && (
      <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 0 8px 0' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: comparison.isComplete ? '#16A34A' : '#1E4D8C',
          width: `${comparison.progressPercent}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    )}

    <ol style={S.stepsList}>
      {steps.map((s, i) => {
        const isCompleted = comparison?.completedSteps?.includes(i);
        return (
          <li key={i} style={{ ...S.step, opacity: isCompleted ? 0.6 : 1 }}>
            <span style={{
              ...S.stepNum,
              background: isCompleted ? '#16A34A' : '#1E4D8C',
              color: 'white',
            }}>
              {isCompleted ? '✓' : (i + 1)}
            </span>
            <span style={{
              ...S.stepText,
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}>{s}</span>
          </li>
        );
      })}
    </ol>
  </div>
)}
```

**Step 4: Celebrazione completamento**

```jsx
{comparison?.isComplete && (
  <div style={{
    textAlign: 'center', padding: '12px 8px', margin: '8px 0',
    background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0',
  }}>
    <div style={{ fontSize: 24 }}>🎉</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>
      Circuito completato!
    </div>
    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
      Prova ad avviare la simulazione ▶
    </div>
  </div>
)}
```

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: ExperimentGuide con progress tracking real-time

CircuitComparator confronta circuito vs buildSteps ogni 400ms.
Progress bar, ✅/⬜ per step, celebrazione al completamento.
Funziona in modalità Libero senza bloccare la costruzione.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9: Galileo Coach Proattivo (4h)

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx:186-216`
- Create: `src/hooks/useGalileoCoach.js`

**Step 1: Hook useGalileoCoach**

```javascript
import { useEffect, useRef, useCallback } from 'react';
import { compareCircuit } from '../utils/circuitComparator';

/**
 * Hook che monitora il circuito e genera suggerimenti proattivi.
 * Intervallo: 30 secondi. Cooldown: 60 secondi tra messaggi.
 */
export function useGalileoCoach({
  circuitStateRef,
  experiment,
  enabled = true,
  onSuggestion,
}) {
  const lastSuggestionRef = useRef(0);
  const lastComparisonRef = useRef(null);

  useEffect(() => {
    if (!enabled || !experiment?.buildSteps) return;

    const interval = setInterval(() => {
      const state = circuitStateRef.current?.structured;
      if (!state) return;

      const now = Date.now();
      if (now - lastSuggestionRef.current < 60000) return; // 60s cooldown

      const comparison = compareCircuit(state, experiment.buildSteps);

      // Evita ripetizioni: suggerisci solo se il progresso è cambiato
      const prevProgress = lastComparisonRef.current?.progress;
      if (comparison.progress === prevProgress) return;
      lastComparisonRef.current = comparison;

      // Genera suggerimento
      if (comparison.isComplete && prevProgress !== comparison.progress) {
        lastSuggestionRef.current = now;
        onSuggestion('🎉 **Complimenti!** Il circuito è completo! Prova a premere ▶ per avviare la simulazione e vedere cosa succede.');
        return;
      }

      if (comparison.nextStep && comparison.completedSteps.length > 0) {
        lastSuggestionRef.current = now;
        const step = comparison.nextStep;
        const stepText = step.text || (step.componentType
          ? `Aggiungi un ${step.componentType}`
          : `Collega un filo da ${step.wireFrom} a ${step.wireTo}`);
        onSuggestion(`💡 **Prossimo passo**: ${stepText}`);
      }
    }, 30000); // Check ogni 30 secondi

    return () => clearInterval(interval);
  }, [enabled, experiment, circuitStateRef, onSuggestion]);
}
```

**Step 2: Integrare in ElabTutorV4**

In `ElabTutorV4.jsx`, aggiungere:

```javascript
import { useGalileoCoach } from '../../hooks/useGalileoCoach';

// Dentro il componente, dopo circuitStateRef:
const [coachEnabled, setCoachEnabled] = useState(true);

useGalileoCoach({
  circuitStateRef,
  experiment: activeExperiment,
  enabled: coachEnabled && activeExperiment?.buildMode === 'sandbox',
  onSuggestion: useCallback((msg) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'assistant',
      content: msg,
      proactive: true,
      source: 'coach',
    }]);
    setShowChat(true);
  }, []),
});
```

**Step 3: Toggle suggerimenti nel ChatOverlay**

Aggiungere piccolo toggle in cima al chat:

```jsx
{activeExperiment?.buildMode === 'sandbox' && (
  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280', cursor: 'pointer' }}>
    <input type="checkbox" checked={coachEnabled} onChange={e => setCoachEnabled(e.target.checked)} />
    Galileo Coach
  </label>
)}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: Galileo Coach proattivo in modalità Libero

useGalileoCoach monitora il circuito ogni 30s, suggerisce il prossimo
passo se il progresso cambia. Cooldown 60s anti-spam. Toggle on/off.
Celebrazione automatica al completamento del circuito.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Canvas Target Highlighting (3h)

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (SVG overlay)

**Step 1: Overlay pulsante sui buchi target**

Quando ExperimentGuide sa qual è il prossimo step, mostrare cerchi pulsanti sui buchi target:

```jsx
{/* Target highlighting per Libero Guidato */}
{nextTargetPins && nextTargetPins.map((pin, i) => (
  <circle
    key={`target-${i}`}
    cx={pin.x}
    cy={pin.y}
    r={4}
    fill="none"
    stroke="#1E4D8C"
    strokeWidth={1.5}
    opacity={0.6}
    style={{ pointerEvents: 'none' }}
  >
    <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
  </circle>
))}
```

Il `nextTargetPins` array va calcolato dal `nextStep` del comparator:
- Se step ha `targetPins`: risolvi le posizioni dei buchi del breadboard
- Se step ha `wireFrom/wireTo`: risolvi le posizioni dei pin da collegare

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: target highlighting pulsante per Libero Guidato

Cerchi SVG animati sui buchi target del prossimo step.
Pulsazione 2s con opacity variabile. Solo in modalità Libero.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 11: Deploy Finale + Validazione Completa (1h)

**Step 1: Build + Deploy**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build && npx vercel --prod --yes
```

**Step 2: Checklist finale Libero Guidato**

- [ ] Apri esperimento in modalità Libero → ExperimentGuide mostra "0/N" con progress bar vuota
- [ ] Piazza primo componente → step 1 si segna ✅, progress bar avanza
- [ ] Collega primo filo → step corrispondente ✅
- [ ] Dopo 30s senza azione → Galileo suggerisce il prossimo passo nel chat
- [ ] Completa tutti i passi → 🎉 celebrazione + Galileo dice "Prova a simulare!"
- [ ] Disabilita toggle Coach → nessun messaggio proattivo
- [ ] Buchi target pulsano per il prossimo step
- [ ] Tutto funziona su PC + iPad

---

## RIEPILOGO SCORE

| Area | Prima | Dopo | Effort |
|------|-------|------|--------|
| iPad Touch | 6.5/10 | 9.0/10 | 10h |
| Apple Pencil | 6.0/10 | 9.0/10 | 5h (incluso in Sprint 1) |
| Libero Mode | 5.0/10 | 9.0/10 | 14h |
| PC Desktop | 9.0/10 | 9.0/10 | Invariato |
| **Totale** | **6.6/10** | **9.0/10** | **29h (~6 sessioni)** |
