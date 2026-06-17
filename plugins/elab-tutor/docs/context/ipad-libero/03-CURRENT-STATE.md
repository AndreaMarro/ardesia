# STATO ATTUALE DEL CODICE — Verificato 2026-03-04

> Numeri di riga verificati direttamente sul codice sorgente.
> Se una sessione modifica un file, aggiornare i numeri di riga qui.

---

## SimulatorCanvas.jsx (2629 righe) — FILE CENTRALE

### Handler attuali (DA CONVERTIRE in Pointer Events)

| Handler | Riga | Tipo | Note |
|---------|------|------|------|
| `handleMouseDown` | 864 | useCallback | Pan, wire mode, wire drag, selection box |
| `handleMouseMove` | 901 | useCallback | Drag componente + snap, wire drag, selection box, pin hover |
| `handleMouseUp` | 1064 | useCallback | Wire end, selection finalize, overlap revert, click resolve |
| `handleTouchStart` | 1242 | useCallback | Component hit test, wire tap, pan, pinch zoom |
| `handleTouchMove` | 1321 | useCallback | Touch drag + snap, wire preview, pan, pinch zoom |
| `handleTouchEnd` | 1427 | useCallback | Finalize touch drag, pinch reset, wire completion |
| `handleWheel` | 1201 | useEffect | Zoom — NON TOCCARE |

### SVG Event Bindings (riga 2208-2214)
```jsx
onMouseDown={handleMouseDown}
onMouseMove={handleMouseMove}
onMouseUp={handleMouseUp}
onMouseLeave={(e) => { handleMouseUp(); setHoveredPin(null); }}
onTouchStart={handleTouchStart}
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}
```

**Dopo Task 1, diventano:**
```jsx
onPointerDown={handlePointerDown}
onPointerMove={handlePointerMove}
onPointerUp={handlePointerUp}
onPointerLeave={(e) => { handlePointerUp(e); setHoveredPin(null); }}
onPointerCancel={handlePointerUp}
```

### State e Ref critici (riga 430-510)

```
svgRef, viewBox, isPanning, panStart, zoom, selectedComponent,
touchRef (439) — pinch zoom tracking,
isDragging, dragCompId, dragOffset,
dragMovedRef, lastDragPosRef, compClickedRef, wireDragState,
potRotatingRef, pendingClickRef, wireMode states, dragPreview,
autoCorrection, highlightedHoles, snapGhost, dragStartPosRef,
hoveredPin, hoverThrottleRef, probePositions/Connections/Snapped,
probeDragRef, probeListenersRef, selectedComponents (multi-select),
selectionBox, selectionStartRef, clipboard, lastMousePosRef
```

### Nuovi ref DA CREARE per Pointer Events:
```
activeTouchesRef — Map<pointerId, {x, y}> per tracciare multi-touch
pointerTypeRef   — 'mouse' | 'touch' | 'pen' per uso nei handler successivi
isPinching       — state boolean per bloccare drag durante pinch
pinchStartDistRef, pinchStartZoomRef — per pinch zoom calculation
```

---

## ComponentPalette.jsx (292 righe)

| Riga | Cosa | Problema iPad |
|------|------|---------------|
| 31-38 | `handleDragStart` | Usa `e.dataTransfer` — NULL su iOS Safari |
| 47 | `draggable` attribute | Non funziona su touch |

**Fix (Task 2)**: Tap-to-select nel pannello + tap-to-place sul canvas.

---

## ComponentDrawer.jsx (528 righe)

| Riga | Cosa | Problema iPad |
|------|------|---------------|
| 78-135 | `DraggableChip` | Stesso problema drag HTML5 |

**Fix (Task 2)**: Stesso pattern tap-to-select.

---

## ControlBar.jsx (850 righe)

| Riga | Cosa | Note |
|------|------|------|
| ~559 | Fine Group 5 (Undo/Redo) | Inserire pulsante Elimina qui |
| — | `onComponentDelete` | NON ESISTE — va aggiunto come prop |

**Fix (Task 3)**: Aggiungere pulsante Elimina + prop `onComponentDelete`.

---

## CanvasTab.jsx (315 righe)

| Riga | Cosa | Note |
|------|------|------|
| 111-118 | `startDrawing` | Usa `e.nativeEvent.offsetX` — OK per Pointer Events |
| 120-128 | `draw` | Tratto piatto — non usa `pressure` |
| 287-293 | Canvas event handlers | onMouseDown/Move/Up — da convertire |

**Fix (Task 4)**: Aggiungere `e.pressure` per tratto variabile con Apple Pencil.

---

## ExperimentGuide.jsx (304 righe)

| Riga | Cosa | Note |
|------|------|------|
| 66-78 | Rendering steps | Lista testuale senza tracking |
| — | `circuitState` prop | NON ESISTE — va passato da NewElabSimulator |
| — | `compareCircuit` import | NON ESISTE — circuitComparator.js da creare |

**Fix (Task 8)**: Aggiungere progress tracking e barra completamento.

---

## NewElabSimulator.jsx (3582 righe)

| Riga | Cosa | Note |
|------|------|------|
| 3300-3305 | `<ExperimentGuide>` render | NON passa `circuitState` — va aggiunto |

**Fix (Task 8)**: Aggiungere `circuitState={circuitState}` come prop.

---

## ElabTutorV4.jsx (2152 righe)

| Riga | Cosa | Note |
|------|------|------|
| 143 | `circuitStateRef` | useRef che riceve circuitState ogni 400ms |
| — | `useGalileoCoach` import | NON ESISTE — hook da creare |

**Fix (Task 9)**: Importare e usare `useGalileoCoach` hook.

---

## File DA CREARE (non esistono ancora)

| File | Task | Scopo |
|------|------|-------|
| `src/components/simulator/utils/circuitComparator.js` | 7 | Confronto circuitState vs buildSteps |
| `src/components/simulator/hooks/useGalileoCoach.js` | 9 | Hook coach proattivo (30s interval, 60s cooldown) |

---

## Build Status (verificato)

```
Build: 0 errori
ElabTutorV4: 955KB
index: 666KB
Deploy: Vercel (https://www.elabtutor.school)
```

## Env Vars Critiche (Vercel)

```
VITE_NANOBOT_URL     → https://elab-galileo.onrender.com (SEMPRE .trim())
VITE_N8N_CHAT_URL    → n8n su Hostinger
VITE_COMPILE_URL     → compilatore remoto
VITE_COMPILE_WEBHOOK_URL → webhook compilazione
VITE_LOCAL_API_URL   → API locale
VITE_LOCAL_COMPILE_URL → compilatore locale
```
