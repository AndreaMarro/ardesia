# MAPPA PROGRAMMATICA: iPad + Apple Pencil + Libero Guidato

> **Documento operativo per esecuzione in sessioni successive.**
> Ogni sessione ha: contesto da caricare, task da eseguire, verifiche, contesto da salvare.
> Aggiornato: 2026-03-04 — Stato codice verificato, 0 task completati.

---

## INDICE

- [Pre-Requisiti e Setup](#pre-requisiti-e-setup)
- [Sessione 1: Pointer Events Core](#sessione-1-pointer-events-core-tasks-1-2--6h)
- [Sessione 2: iPad Complete](#sessione-2-ipad-complete-tasks-3-5--7h)
- [Sessione 3: Deploy + Test iPad](#sessione-3-deploy--test-ipad-task-6--2h)
- [Sessione 4: Libero Foundation](#sessione-4-libero-foundation-tasks-7-8--6h)
- [Sessione 5: Galileo Coach](#sessione-5-galileo-coach-tasks-9-10--7h)
- [Sessione 6: Deploy Finale](#sessione-6-deploy-finale-task-11--1h)
- [Matrice Skills/Plugin per Task](#matrice-skillsplugin-per-task)
- [Anti-Regressione e Context Management](#anti-regressione-e-context-management)

---

## PRE-REQUISITI E SETUP

### Branch Strategy

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git checkout -b feature/ipad-pencil-libero
```

Ogni task fa un commit atomico. Merge in main solo dopo Task 6 (Sprint 1) o Task 11 (Sprint 2).

### Skills da invocare ad OGNI inizio sessione

```
1. superpowers:executing-plans    → carica il piano e la todo list
2. tinkercad-simulator            → per qualsiasi modifica al canvas SVG
3. quality-audit                  → dopo ogni deploy per verificare regressioni
```

### File di contesto da leggere ad inizio sessione

```
SEMPRE:
- docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md  (questo file)
- docs/plans/2026-03-04-ipad-pencil-libero-guidato.md  (piano tecnico dettagliato)

PER SPRINT 1 (Tasks 1-6):
- src/components/simulator/canvas/SimulatorCanvas.jsx  (2629 righe — il file centrale)
- src/components/simulator/panels/ComponentPalette.jsx  (292 righe)
- src/components/simulator/panels/ComponentDrawer.jsx  (528 righe)
- src/components/simulator/panels/ControlBar.jsx  (850 righe)
- src/components/tutor/CanvasTab.jsx  (315 righe)

PER SPRINT 2 (Tasks 7-11):
- src/components/simulator/panels/ExperimentGuide.jsx  (304 righe)
- src/components/simulator/NewElabSimulator.jsx  (3582 righe)
- src/components/tutor/ElabTutorV4.jsx  (2152 righe)
- src/data/experiments-vol1.js  (struttura buildSteps di riferimento)
```

### Invarianti da NON violare MAI

```
1. handleWheel (zoom con rotella) NON si tocca — resta event listener separato
2. handleKeyDown (keyboard shortcuts) NON si tocca — resta separato
3. handleBackgroundClick NON si tocca — resta su onClick dell'SVG
4. touchAction: 'none' OBBLIGATORIO sull'SVG per Pointer Events
5. Pin names: bus-bot-plus/minus (NON bus-bottom-plus/minus)
6. buildSteps posizione FINALE (mai posizioni temporanee)
7. Galileo parla in linguaggio 8-14 anni per TUTTI
8. Force-light theme: data-theme="light" sempre
9. Zero emoji nei file se non esplicitamente richiesto dall'utente (emoji OK nei messaggi chat Galileo)
10. Watermark: Andrea Marro con data dinamica
```

---

## SESSIONE 1: Pointer Events Core (Tasks 1-2 — ~6h)

### Prompt di apertura sessione

```
Sto continuando il piano iPad + Apple Pencil + Libero Guidato.
Leggi: docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md
Stato: Task 1 e 2 da iniziare. Branch: feature/ipad-pencil-libero
```

### TASK 1: SimulatorCanvas → Pointer Events API (4h)

**Obiettivo**: Convertire 7 handler separati (3 mouse + 4 touch) in 3 handler Pointer Events unificati.

**Skill da invocare**: `tinkercad-simulator` (modifica al canvas SVG del simulatore)

**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Stato attuale verificato (2026-03-04)**:
- Riga 864: `handleMouseDown` (useCallback)
- Riga 901: `handleMouseMove` (useCallback)
- Riga 1064: `handleMouseUp` (useCallback)
- Riga 1242: `handleTouchStart` (useCallback)
- Riga 1321: `handleTouchMove` (useCallback)
- Riga 1427: `handleTouchEnd` (useCallback)
- Righe 2208-2214: 7 event handler sull'SVG (onMouseDown/Move/Up/Leave + onTouchStart/Move/End)
- Riga 2215: `onClick={handleBackgroundClick}` — NON TOCCARE
- Riga 439: `touchRef = useRef({ lastDist: 0, lastMid: null })` — per pinch zoom
- Riga 1239: `touchDragRef = useRef(...)` — per drag componenti touch
- Riga 504: `lastMousePosRef = useRef({ x: 200, y: 150 })`

**Passi operativi**:

```
PASSO 1: Aggiungere nuove ref per Pointer Events (dopo riga 504)
──────────────────────────────────────────────────────────────
- pointerTypeRef = useRef('mouse')
- activeTouchesRef = useRef(new Map())
- pinchStartDistRef = useRef(0)
- pinchStartZoomRef = useRef(1)
- [isPinching, setIsPinching] = useState(false)

PASSO 2: Creare handlePointerDown unificato
──────────────────────────────────────────────
- Unifica handleMouseDown (864) + handleTouchStart (1242)
- DEVE includere: isPrimary check, setPointerCapture, pointerType tracking
- DEVE includere: pinch-to-zoom per secondo touch (come in handleTouchStart)
- DEVE includere: pan con middle button o Alt+left (da handleMouseDown 866)
- DEVE includere: wire mode (da handleMouseDown 874)
- DEVE includere: component drag (da handleTouchStart 1248+)
- DEVE includere: single touch pan (da handleTouchStart)
- Codice completo: vedi piano tecnico Task 1, Step 1

PASSO 3: Creare handlePointerMove unificato
──────────────────────────────────────────────
- Unifica handleMouseMove (901) + handleTouchMove (1321)
- DEVE includere: pinch-zoom aggiornamento (da handleTouchMove 1386)
- DEVE includere: Apple Pencil hover (pointerType==='pen' && buttons===0)
- DEVE includere: mouse position tracking (da handleMouseMove)
- DEVE includere: drag component con snap (da handleMouseMove 916+)
- DEVE includere: pan (da handleMouseMove/handleTouchMove)
- DEVE includere: hover pin per wire mode (da handleMouseMove)
- Codice completo: vedi piano tecnico Task 1, Step 2

PASSO 4: Creare handlePointerUp unificato
──────────────────────────────────────────────
- Unifica handleMouseUp (1064) + handleTouchEnd (1427)
- DEVE includere: rimozione touch da activeTouchesRef
- DEVE includere: releasePointerCapture
- DEVE includere: finalize drag con snap + buildValidation
- DEVE includere: stop pan
- Codice completo: vedi piano tecnico Task 1, Step 3

PASSO 5: Aggiornare JSX SVG (righe 2208-2214)
──────────────────────────────────────────────
PRIMA (7 handler):
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={(e) => { handleMouseUp(); setHoveredPin(null); }}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}

DOPO (3+2 handler):
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerLeave={(e) => { handlePointerUp(e); setHoveredPin(null); }}
  onPointerCancel={handlePointerUp}

MANTENERE:
  onClick={handleBackgroundClick}  ← NON TOCCARE
  style={{ touchAction: 'none' }}  ← CRITICO per Pointer Events

PASSO 6: ELIMINARE handler obsoleti
──────────────────────────────────────
- handleMouseDown (righe 864-899) → ELIMINA
- handleMouseMove (righe 901-1062) → ELIMINA
- handleMouseUp (righe 1064-1240) → ELIMINA
- handleTouchStart (righe 1242-1319) → ELIMINA
- handleTouchMove (righe 1321-1425) → ELIMINA
- handleTouchEnd (righe 1427-1462) → ELIMINA
- touchDragRef (riga 1239) → ELIMINA (sostituito da activeTouchesRef)

NON ELIMINARE:
- handleWheel (riga 1201) → MANTIENI
- handleKeyDown (riga 603) → MANTIENI
- handleBackgroundClick → MANTIENI
- touchRef (riga 439) → ELIMINA solo SE la logica pinch e' stata migrata completamente

PASSO 7: Verifica build
──────────────────────────
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
ATTESO: 0 errori, bundle ~955KB

PASSO 8: Test manuale (Chrome DevTools → Toggle device toolbar)
──────────────────────────────────────────────────────────────
[ ] Mouse: click componente → drag → rilascio → snap ai buchi
[ ] Mouse: wire mode → click pin → click pin → filo creato
[ ] Mouse: Alt+drag → pan funziona
[ ] Mouse: scroll wheel → zoom funziona (handleWheel invariato)
[ ] Touch (DevTools touch simulation): drag componente → snap
[ ] Touch: pinch-to-zoom con due dita simulato
[ ] Touch: single finger pan
[ ] Keyboard: Delete, Ctrl+C, Ctrl+V funzionano

PASSO 9: Commit atomico
──────────────────────────
git add src/components/simulator/canvas/SimulatorCanvas.jsx
git commit -m "refactor: SimulatorCanvas → Pointer Events API (7→3 handler)

Unifica mouse/touch/pen. Abilita: palm rejection (isPrimary),
stylus detection (pointerType), hover Pencil (buttons===0).
Riduce ~200 righe. Zero regressioni su mouse/keyboard.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

**Rischi e mitigazioni Task 1**:
| Rischio | Mitigazione |
|---------|-------------|
| Regressione pinch-zoom | Testare PRIMA di passare a Task 2. Se rotto, controllare activeTouchesRef.size === 2 |
| handleWheel non funziona | NON deve essere toccato. Se rotto = bug altrove |
| Rotazione potenziometro rotta | `potRotatingRef` (riga 454) non va eliminato — verificare che handlePointerMove lo gestisca |
| Multimetro probe drag rotto | `probeDragRef` (riga 486) va preservato — verificare nel nuovo handlePointerDown/Move |
| Selection box rotta | `selectionStartRef` (riga 500) va preservato |

---

### TASK 2: Tap-to-Place dalla ComponentPalette (2h)

**Obiettivo**: Permettere di aggiungere componenti su iPad dove il drag HTML5 non funziona.

**Skill da invocare**: Nessuna addizionale (gia' in contesto da Task 1)

**File**:
- `src/components/simulator/panels/ComponentPalette.jsx` (righe 31-51)
- `src/components/simulator/panels/ComponentDrawer.jsx` (righe 86-103)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (handlePointerDown, nuovo)

**Stato attuale verificato**:
- ComponentPalette riga 31: `handleDragStart` con `e.dataTransfer.setData()`
- ComponentPalette riga 47: `draggable="true"`
- ComponentDrawer DraggableChip riga 86: stesso pattern drag
- ComponentDrawer riga 99: `draggable="true"`

**Passi operativi**:

```
PASSO 1: ComponentPalette — aggiungere handleTapSelect (dopo riga 38)
──────────────────────────────────────────────────────────────────────
- Crea callback handleTapSelect(e):
  - if (e.pointerType === 'mouse') return; → mouse usa drag nativo
  - e.preventDefault() + e.stopPropagation()
  - window.__elabPendingComponent = type
  - window.dispatchEvent(new CustomEvent('elab-component-selected', { detail: { type } }))
  - Feedback visivo: setDragging(true)
  - Auto-reset dopo 15s
- Aggiungere onPointerDown={handleTapSelect} al div (riga 47)
- Aggiungere onPointerEnter/onPointerLeave accanto a onMouseEnter/Leave

PASSO 2: ComponentDrawer DraggableChip — stessa modifica
─────────────────────────────────────────────────────────
- Identica logica handleTapSelect nel DraggableChip (riga 86+)
- Stessi event handler

PASSO 3: SimulatorCanvas — ricevere tap-to-place
─────────────────────────────────────────────────
- Aggiungere state: [pendingComponentType, setPendingComponentType] = useState(null)
- Aggiungere useEffect per listener 'elab-component-selected' e 'elab-component-placed'
- In handlePointerDown (nuovo), PRIMA di tutto il resto:
  if (window.__elabPendingComponent && !wireMode) {
    → clientToSVG per posizione
    → onComponentAdd(type, {x, y})
    → cleanup __elabPendingComponent
    → return
  }

PASSO 4: Banner visivo "Tocca il canvas per piazzare"
─────────────────────────────────────────────────────
- Div absolutely positioned, bottom: 16, centered
- Background #1E4D8C, color white, borderRadius 24
- Testo: "Tocca il canvas per piazzare {pendingComponentType}"
- pointerEvents: 'none' (non cattura click)
- Visibile solo quando pendingComponentType !== null

PASSO 5: Verifica + Commit
──────────────────────────
npm run build → 0 errori
Test Chrome DevTools Touch:
  [ ] Tap componente nella palette → banner appare
  [ ] Tap canvas → componente piazzato
  [ ] Mouse drag dalla palette → funziona come prima (drag HTML5)
  [ ] Secondo tap palette con componente pendente → sostituisce
  [ ] Timeout 15s → banner scompare

git add -A && git commit -m "feat: tap-to-place per iPad (touch/pen fallback)
..."
```

### Fine Sessione 1 — Contesto da salvare

```markdown
## SESSION 1 COMPLETAMENTO (da copiare in MEMORY.md se tutto PASS)

### Tasks completati
- Task 1: SimulatorCanvas Pointer Events ✅/❌
- Task 2: Tap-to-place ComponentPalette ✅/❌

### Stato post-sessione
- SimulatorCanvas.jsx: ora ha 3 handler (handlePointerDown/Move/Up)
- Righe cambiate: [annotare nuove righe dopo refactor]
- ComponentPalette: ha handleTapSelect + onPointerDown
- ComponentDrawer: ha handleTapSelect + onPointerDown
- Nuove ref: pointerTypeRef, activeTouchesRef, pinchStartDistRef, pinchStartZoomRef
- Nuovo state: isPinching, pendingComponentType
- Window globals: __elabPendingComponent, CustomEvent 'elab-component-selected/placed'

### Regressioni verificate
- [ ] Mouse drag: OK/FAIL
- [ ] Wire mode: OK/FAIL
- [ ] Pinch-zoom: OK/FAIL
- [ ] Pan: OK/FAIL
- [ ] Keyboard: OK/FAIL
- [ ] Potentiometer rotation: OK/FAIL
- [ ] Multimeter probe drag: OK/FAIL

### Build
- Bundle size: ___KB (atteso ~955KB)
- Errori: 0/N
```

---

## SESSIONE 2: iPad Complete (Tasks 3-5 — ~7h)

### Prompt di apertura sessione

```
Sto continuando il piano iPad + Apple Pencil + Libero Guidato.
Leggi: docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md
Stato: Tasks 1-2 completati. Task 3 da iniziare. Branch: feature/ipad-pencil-libero
SimulatorCanvas ora usa Pointer Events (3 handler unificati).
```

### TASK 3: Pulsante Elimina + Context Menu Long-Press (3h)

**Obiettivo**: Rendere possibile eliminare componenti su iPad senza tastiera fisica.

**Skill da invocare**: `tinkercad-simulator`

**File**:
- `src/components/simulator/panels/ControlBar.jsx` (riga 559 — dopo Group 5)
- `src/components/simulator/ElabSimulator.css` (nuovo stile `.toolbar-btn--danger`)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (long-press + context menu)

**Stato attuale verificato**:
- ControlBar NON ha prop `onComponentDelete` — va aggiunto
- ControlBar NON ha prop `selectedComponent` — va aggiunto
- `onComponentDelete` ESISTE in NewElabSimulator come `handleComponentDelete` (riga 2605)
- `selectedComponent` ESISTE come `selectedComponentId` state in SimulatorCanvas

**Attenzione architetturale**: Il pulsante Elimina in ControlBar richiede che NewElabSimulator
passi `selectedComponentId` e `handleComponentDelete` come nuove props a ControlBar.
Attualmente `selectedComponentId` vive DENTRO SimulatorCanvas — serve lifting dello stato
OPPURE un ref/callback pattern per comunicare la selezione.

**Passi operativi**:

```
PASSO 1: Decidere come passare selectedComponentId a ControlBar
─────────────────────────────────────────────────────────────
OPZIONE A (consigliata): Callback onSelectionChange da SimulatorCanvas
  → SimulatorCanvas chiama onSelectionChange(compId) quando la selezione cambia
  → NewElabSimulator tiene selectedComponentId in state
  → Lo passa a ControlBar

OPZIONE B: Window event (piu' semplice ma meno React-idiomatic)

Implementare OPZIONE A:
1. In SimulatorCanvas.jsx: aggiungere prop onSelectionChange
2. In ogni punto dove si fa setSelectedComponentId(id), aggiungere:
   onSelectionChange?.(id)
3. In NewElabSimulator.jsx: aggiungere state [selectedComponentId, setSelectedComponentId]
4. Passare onSelectionChange={setSelectedComponentId} a SimulatorCanvas
5. Passare selectedComponent={selectedComponentId} a ControlBar
6. Passare onComponentDelete={handleComponentDelete} a ControlBar (gia' esiste riga 2605)

PASSO 2: ControlBar — Pulsante Elimina
──────────────────────────────────────
- Aggiungere props: selectedComponent, onComponentDelete
- Dopo Group 5 Undo/Redo (riga 559):
  {onComponentDelete && selectedComponent && (
    <button className="toolbar-btn toolbar-btn--danger" ...>
    Icona SVG cestino + label "Elimina" (secondary)
  )}

PASSO 3: CSS .toolbar-btn--danger
──────────────────────────────────
In ElabSimulator.css:
.toolbar-btn--danger:hover:not(:disabled),
.toolbar-btn--danger:active:not(:disabled) {
  background: #FEE2E2;
  color: #DC2626;
}

PASSO 4: Long-press context menu in SimulatorCanvas
──────────────────────────────────────────────────
- Aggiungere ref: longPressTimerRef = useRef(null)
- Aggiungere state: [contextMenu, setContextMenu] = useState(null)
- In handlePointerDown: se pointerType !== 'mouse' && hitComp trovato:
  longPressTimerRef.current = setTimeout(() => {
    setContextMenu({ x: e.clientX, y: e.clientY, componentId: hitComp.id })
  }, 500)
- In handlePointerMove: se dragMovedRef.current, clearTimeout(longPressTimerRef)
- In handlePointerUp: clearTimeout(longPressTimerRef)
- JSX: context menu fixed con 3 opzioni (Copia/Duplica/Elimina)
- Click fuori → setContextMenu(null) (useEffect con document click listener)

PASSO 5: Verifica + Commit
──────────────────────────
[ ] Seleziona componente → pulsante Elimina appare in toolbar
[ ] Click Elimina → componente rimosso
[ ] Deseleziona → pulsante Elimina scompare
[ ] Long-press touch (500ms) → context menu appare
[ ] Context menu: click Elimina → componente rimosso, menu chiude
[ ] Context menu: click fuori → menu chiude
[ ] Mouse right-click → NO context menu (solo long-press touch/pen)
[ ] Delete key → ancora funzionante (keyboard handler invariato)

git commit -m "feat: delete button toolbar + long-press context menu iPad"
```

---

### TASK 4: Pressione Apple Pencil nel CanvasTab (2h)

**Obiettivo**: Tratto a spessore variabile con Apple Pencil nell'area disegno.

**Skill da invocare**: Nessuna addizionale

**File**: `src/components/tutor/CanvasTab.jsx` (righe 111-133, 287-293)

**Stato attuale verificato**:
- Righe 287-293: 7 handler (onMouseDown/Move/Up/Leave + onTouchStart/Move/End)
- Riga 120-128: `draw()` con lineWidth fisso da `brushSize`
- Riga 111-118: `startDrawing()` senza isPrimary check
- Nessun uso di e.pressure

**Passi operativi**:

```
PASSO 1: Convertire canvas a Pointer Events (righe 287-293)
──────────────────────────────────────────────────────────
PRIMA (7 handler):
  onMouseDown/onMouseMove/onMouseUp/onMouseLeave
  onTouchStart/onTouchMove/onTouchEnd

DOPO (4 handler):
  onPointerDown={startDrawing}
  onPointerMove={draw}
  onPointerUp={stopDrawing}
  onPointerLeave={stopDrawing}

CRITICO: aggiungere style={{ touchAction: 'none' }} al canvas

PASSO 2: startDrawing con palm rejection (riga 111-118)
──────────────────────────────────────────────────────
- Aggiungere: if (!e.isPrimary) return;
- Aggiungere: const pressure = e.pressure ?? 0.5;
- lineWidth = brushSize * (0.3 + pressure * 0.7)
  → 30% del pennello quando sfiora, 100% quando preme forte

PASSO 3: draw con pressione variabile (riga 120-128)
──────────────────────────────────────────────────────
- Aggiungere: const pressure = e.pressure ?? 0.5;
- ctxRef.current.lineWidth = brushSize * (0.3 + pressure * 0.7);
  → Aggiornato ad ogni move, crea tratto che varia

PASSO 4: Verifica + Commit
──────────────────────────
[ ] Mouse: disegno → spessore fisso (pressure default 0.5 → 65% brushSize)
[ ] Touch DevTools: disegno → spessore fisso (pressure default 0.5)
[ ] Palm rejection: secondo dito sullo schermo → non disegna
[ ] Gomma: funziona ancora
[ ] Cambia colore: funziona ancora
[ ] Clear: funziona ancora

git commit -m "feat: Apple Pencil pressure in CanvasTab drawing"
```

---

### TASK 5: CSS Active States + Pin Tooltips (2h)

**Obiettivo**: Feedback visivo su touch (`:active` come fallback per `:hover`) + tooltip SVG sui pin.

**File**:
- `src/components/simulator/ElabSimulator.css`
- `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Passi operativi**:

```
PASSO 1: CSS :active fallback in ElabSimulator.css
─────────────────────────────────────────────────
Per OGNI regola :hover, aggiungere :active come selector alternativo.
Aggiungere @media (hover: none) per dispositivi touch-only.

Cercare tutte le occorrenze di :hover nel file e duplicare con :active.
Esempio pattern:
  .toolbar-btn:hover:not(:disabled),
  .toolbar-btn:active:not(:disabled) { ... }

PASSO 2: Pin tooltip SVG in SimulatorCanvas
──────────────────────────────────────────
- hoveredPin state GIA' esiste nel componente
- Renderizzare tooltip SVG quando hoveredPin !== null:
  → <g> con <rect> navy + <text> bianco con nome pin
  → Posizionato sopra il pin (absY - 12)
  → pointerEvents: 'none' (non cattura click)
- Il tooltip appare sia su hover mouse sia su hover Pencil (gia' gestito da handlePointerMove)

PASSO 3: Verifica + Commit
──────────────────────────
[ ] Mouse hover su bottone toolbar → evidenziazione
[ ] Touch tap su bottone toolbar → flash evidenziazione
[ ] Mouse hover su pin in wire mode → tooltip con nome pin
[ ] Apple Pencil hover su pin → tooltip (se iPad disponibile)

git commit -m "feat: :active CSS fallback + SVG pin tooltips"
```

### Fine Sessione 2 — Contesto da salvare

```markdown
## SESSION 2 COMPLETAMENTO

### Tasks completati
- Task 3: Pulsante Elimina + Context Menu ✅/❌
- Task 4: Apple Pencil pressione CanvasTab ✅/❌
- Task 5: CSS :active + Pin tooltips ✅/❌

### Cambiamenti architetturali
- selectedComponentId ora e' lifted in NewElabSimulator (da SimulatorCanvas)
- onSelectionChange callback: SimulatorCanvas → NewElabSimulator
- ControlBar ha 2 nuove props: selectedComponent, onComponentDelete
- CanvasTab usa Pointer Events (non piu' mouse+touch)
- SimulatorCanvas ha context menu state + long-press timer
```

---

## SESSIONE 3: Deploy + Test iPad (Task 6 — ~2h)

### Prompt di apertura sessione

```
Sto continuando il piano iPad + Apple Pencil + Libero Guidato.
Sprint 1 completato (Tasks 1-5). Task 6: deploy e test su iPad reale.
Branch: feature/ipad-pencil-libero — pronto per merge.
```

### TASK 6: Deploy + Test iPad Reale

**Skill da invocare**: `quality-audit` (verifica regressioni post-deploy)

**Passi operativi**:

```
PASSO 1: Build di produzione
────────────────────────────
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build
ATTESO: 0 errori, bundle ~960KB

PASSO 2: Merge in main e deploy
────────────────────────────────
git checkout main
git merge feature/ipad-pencil-libero
npm run build && npx vercel --prod --yes

PASSO 3: Quality Audit
───────────────────────
Invocare skill: quality-audit
Verificare: bundle size, console errors, touch targets 44px+

PASSO 4: Test iPad con Apple Pencil (SU DEVICE REALE)
─────────────────────────────────────────────────────
Aprire https://www.elabtutor.school su iPad Safari:

COMPONENTI (6 test):
[ ] Tap componente nella palette → banner "Tocca per piazzare" appare
[ ] Tap canvas → componente piazzato nella posizione
[ ] Drag componente con dito → snap ai buchi breadboard
[ ] Long-press componente → context menu con Copia/Duplica/Elimina
[ ] Click Elimina da context menu → componente rimosso
[ ] Pulsante Elimina in toolbar → funziona quando selezionato

NAVIGAZIONE (4 test):
[ ] Pinch-to-zoom con due dita → zoom fluido
[ ] Pan con un dito → canvas scorre
[ ] Rotazione potenziometro → controllo fine
[ ] Wire mode: tap pin A → tap pin B → filo creato

APPLE PENCIL (5 test):
[ ] Disegno nel CanvasTab → spessore variabile con pressione
[ ] Hover vicino a pin → tooltip con nome pin (iPadOS 16.1+)
[ ] Palmo sullo schermo → NESSUN input involontario
[ ] Drag componente con Pencil → preciso, snap funziona
[ ] Wire con Pencil → tap pin preciso

TOOLBAR + UI (3 test):
[ ] Toolbar responsive → pulsanti visibili, overflow "..." accessibile
[ ] Button :active → flash feedback su touch
[ ] Keyboard (con Magic Keyboard): Delete, Ctrl+C, Ctrl+V

PASSO 5: Se PASS → annotare in MEMORY.md
────────────────────────────────────────
Aggiungere riga:
"S70: Sprint 1 iPad+Pencil completato. Pointer Events, tap-to-place, delete button,
Pencil pressure, pin tooltips. 18/18 test iPad PASS."
```

---

## SESSIONE 4: Libero Foundation (Tasks 7-8 — ~6h)

### Prompt di apertura sessione

```
Sto continuando il piano iPad + Apple Pencil + Libero Guidato.
Sprint 1 completato e deployato. Inizio Sprint 2: Libero Guidato.
Task 7 (CircuitComparator) e Task 8 (ExperimentGuide progress).
```

### Nuova branch

```bash
git checkout -b feature/libero-guidato
```

### TASK 7: CircuitComparator Utility (3h)

**Obiettivo**: Utility frontend-only che confronta circuito attuale vs buildSteps target.

**Skill da invocare**: `superpowers:test-driven-development` (nuova utility con test)

**File da CREARE**:
- `src/utils/circuitComparator.js` (NON ESISTE)
- `src/utils/__tests__/circuitComparator.test.js` (NON ESISTE)

**Nessun file da modificare** — utility isolata.

**Interfaccia definita**:

```javascript
/**
 * @param {Object} circuitState - Da buildStructuredState() di NewElabSimulator
 *   circuitState.components: [{ type, id, ... }]
 *   circuitState.connections: [{ from: 'comp:pin', to: 'comp:pin', color }]
 *
 * @param {Array} buildSteps - Da experiment.buildSteps
 *   Formato componente: { step, text, hint, componentId, componentType, targetPins }
 *   Formato filo: { step, text, hint, wireFrom, wireTo, wireColor }
 *
 * @returns {Object}
 *   completedSteps: number[]   — indici degli step completati
 *   missingSteps: number[]     — indici degli step mancanti
 *   errors: string[]           — errori rilevati (pin sbagliato, etc.)
 *   progress: string           — "3/5"
 *   progressPercent: number    — 60
 *   isComplete: boolean        — true se done >= total
 *   nextStep: object|null      — il prossimo step mancante
 *   nextStepIndex: number|null — indice del prossimo step
 */
```

**Passi operativi**:

```
PASSO 1: Scrivere i test PRIMA (TDD)
────────────────────────────────────
Test cases:
1. Input null/undefined → return safe defaults
2. Circuito vuoto vs buildSteps → tutti missingSteps
3. Componente presente → completedStep
4. Componente mancante → missingStep
5. Filo presente (entrambe le direzioni from↔to) → completedStep
6. Filo mancante → missingStep
7. Circuito completo → isComplete=true, progress="N/N"
8. nextStep punta al primo step mancante
9. Componenti multipli dello stesso tipo (2 LED) → conta correttamente
10. Pin connection reversed (from/to swapped) → ancora detected

PASSO 2: Implementare compareCircuit()
──────────────────────────────────────
- Logica per componenti: cerca component.type nel circuitState.components
- Logica per fili: cerca from/to (o invertiti) nelle connections
- Edge case: componenti multipli dello stesso tipo → match per quantita'
- Edge case: fili con pin alias (bus-bot-plus-1 vs bus-bot-plus-2)

PASSO 3: Run test
──────────────────
npx vitest run src/utils/__tests__/circuitComparator.test.js
ATTESO: tutti PASS

PASSO 4: Commit
───────────────
git add src/utils/circuitComparator.js src/utils/__tests__/circuitComparator.test.js
git commit -m "feat: CircuitComparator — confronto circuito vs buildSteps"
```

**NOTA CANDIDATO PTC**: Dopo l'implementazione, il CircuitComparator puo' essere testato
programmaticamente su tutti i 69 esperimenti caricando ogni `experiment.buildSteps` e
simulando diversi stati circuito. Questo e' il caso d'uso ideale per PTC batch testing.

---

### TASK 8: ExperimentGuide Progress Tracking (3h)

**Obiettivo**: La guida mostra ✅/⬜ per ogni step e una progress bar in tempo reale.

**Skill da invocare**: Nessuna addizionale

**File**:
- `src/components/simulator/panels/ExperimentGuide.jsx` (righe 15, 66-78)
- `src/components/simulator/NewElabSimulator.jsx` (righe 3300-3305 — dove renderizza ExperimentGuide)

**Stato attuale verificato**:
- ExperimentGuide props: `{ experiment, onClose, onSendToGalileo }` — NO circuitState
- NewElabSimulator rendering: NO circuitState passato a ExperimentGuide
- `circuitStateRef` esiste in ElabTutorV4 (riga 143) — non in NewElabSimulator
- `circuitStateRef` e' passato come prop a NewElabSimulator (riga 157)

**Decisione architetturale**: Come passare circuitState a ExperimentGuide?

```
OPZIONE A (consigliata): Aggiungere state locale in NewElabSimulator
  → [circuitStateForGuide, setCircuitStateForGuide] = useState(null)
  → Nel bridge onCircuitStateChange (400ms debounce), aggiornare anche questo state
  → Passare a ExperimentGuide come prop
  MOTIVO: coerente con data flow React, non forza re-render su ElabTutorV4

OPZIONE B: Passare circuitStateRef direttamente
  → Ref non causa re-render → ExperimentGuide non si aggiorna automaticamente
  → Servirebbe un interval nel guide → BRUTTO, sconsigliato
```

**Passi operativi**:

```
PASSO 1: NewElabSimulator — aggiungere circuitState state
─────────────────────────────────────────────────────────
- Aggiungere: const [circuitStateForGuide, setCircuitStateForGuide] = useState(null);
- In onCircuitStateChange (dentro il debounce 400ms, riga 1077+):
  aggiungere: setCircuitStateForGuide(circuitStateRef.current);
- Passare a ExperimentGuide (riga 3300):
  <ExperimentGuide
    experiment={currentExperiment}
    circuitState={circuitStateForGuide}  // NUOVO
    ...
  />

PASSO 2: ExperimentGuide — import + useMemo
───────────────────────────────────────────
- import { compareCircuit } from '../../../utils/circuitComparator';
- Aggiungere prop circuitState alla destructuring
- const comparison = useMemo(() => {
    if (!experiment?.buildSteps || !circuitState?.structured) return null;
    return compareCircuit(circuitState.structured, experiment.buildSteps);
  }, [circuitState, experiment?.buildSteps]);

PASSO 3: Progress bar + step indicators
───────────────────────────────────────
- Sotto titolo "Cosa Fare": mostrare "3/5" o "Completo!"
- Progress bar: div con height 4px, width = progressPercent%
- Ogni step <li>: icona numerata se mancante, checkmark verde se completato
- textDecoration: 'line-through' su step completati, opacity: 0.6

PASSO 4: Celebrazione completamento
───────────────────────────────────
- Se comparison.isComplete:
  div centrato con emoji festa, "Circuito completato!", suggerimento ▶

PASSO 5: Verificare
───────────────────
[ ] Apri esperimento Libero → guida mostra "0/N"
[ ] Piazza primo componente → step 1 diventa ✅
[ ] Collega filo → step corrispondente ✅
[ ] Progress bar avanza
[ ] Completa tutto → celebrazione appare
[ ] Gia' Montato → tutti step gia' ✅ (circuito pre-costruito)
[ ] Passo Passo → step si completano uno alla volta

git commit -m "feat: ExperimentGuide progress tracking real-time"
```

### Fine Sessione 4 — Contesto da salvare

```markdown
## SESSION 4 COMPLETAMENTO

### Tasks completati
- Task 7: CircuitComparator ✅/❌ (test: __/__ PASS)
- Task 8: ExperimentGuide progress ✅/❌

### File creati
- src/utils/circuitComparator.js (NUOVO)
- src/utils/__tests__/circuitComparator.test.js (NUOVO)

### Cambiamenti architetturali
- NewElabSimulator: nuovo state circuitStateForGuide, aggiornato ogni 400ms
- ExperimentGuide: nuova prop circuitState, usa compareCircuit()
- Data flow: SimulatorCanvas → onCircuitStateChange → circuitStateForGuide → ExperimentGuide
```

---

## SESSIONE 5: Galileo Coach (Tasks 9-10 — ~7h)

### Prompt di apertura sessione

```
Sto continuando il piano Libero Guidato. Tasks 7-8 completati.
CircuitComparator funzionante, ExperimentGuide mostra progress.
Ora: Task 9 (Galileo Coach proattivo) e Task 10 (canvas highlighting).
```

### TASK 9: useGalileoCoach Hook (4h)

**Obiettivo**: Hook che monitora il circuito ogni 30s e manda suggerimenti proattivi.

**File da CREARE**: `src/hooks/useGalileoCoach.js` (NON ESISTE)
**File da MODIFICARE**: `src/components/tutor/ElabTutorV4.jsx`

**Stato attuale verificato**:
- ElabTutorV4 riga 143: `circuitStateRef = useRef(null)`
- ElabTutorV4 riga 146: `[activeExperiment, setActiveExperiment] = useState(null)`
- Nessun import di useGalileoCoach

**Passi operativi**:

```
PASSO 1: Creare src/hooks/useGalileoCoach.js
─────────────────────────────────────────────
Parametri:
- circuitStateRef: ref al circuitState corrente
- experiment: esperimento attivo (con buildSteps)
- enabled: boolean per toggle
- onSuggestion: callback(msg: string)

Logica:
- setInterval 30 secondi
- Cooldown 60 secondi tra suggerimenti (lastSuggestionRef)
- Confronta con compareCircuit()
- Genera suggerimento SOLO se il progresso e' CAMBIATO dall'ultimo check
- Tipi di suggerimento:
  a) Completamento → congratulazioni + "prova ▶"
  b) Prossimo step → descrizione step con formatting markdown
  c) Nessun progresso per 2+ check → incoraggiamento generico
- Cleanup: clearInterval nel return della useEffect

PASSO 2: Integrare in ElabTutorV4
──────────────────────────────────
- import { useGalileoCoach } from '../../hooks/useGalileoCoach';
- Nuovo state: [coachEnabled, setCoachEnabled] = useState(true)
- Attivazione: enabled quando buildMode === 'sandbox' E coachEnabled
- onSuggestion: aggiunge messaggio a chat con source: 'coach', proactive: true

PASSO 3: Toggle nel ChatOverlay
────────────────────────────────
- Checkbox "Galileo Coach" visibile solo in modalita' Libero
- Controllato da coachEnabled state

PASSO 4: Stile messaggi coach
────────────────────────────────
- In ChatOverlay/formatMarkdown: messaggi con source='coach' hanno
  bordo sinistro verde (#7CB342) per distinguerli da risposte normali

PASSO 5: Verifica
──────────────────
[ ] Apri esperimento Libero → nessun messaggio immediato
[ ] Piazza un componente → dopo max 30s, suggerimento prossimo passo
[ ] Non fare nulla per 60s → nessun messaggio ripetuto (cooldown)
[ ] Completa circuito → messaggio congratulazioni
[ ] Disabilita toggle → nessun messaggio proattivo
[ ] Passo Passo mode → coach NON attivo
[ ] Gia' Montato mode → coach NON attivo

git commit -m "feat: useGalileoCoach — suggerimenti proattivi in Libero"
```

---

### TASK 10: Canvas Target Highlighting (3h)

**Obiettivo**: Cerchi pulsanti SVG sui buchi target del prossimo step.

**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Dipendenza**: Task 7 (CircuitComparator) — usa nextStep per sapere dove evidenziare.

**Passi operativi**:

```
PASSO 1: Props per target highlighting
──────────────────────────────────────
- Aggiungere prop: nextTargetPins (array di {x, y} posizioni SVG)
- Calcolato in NewElabSimulator da comparison.nextStep:
  - Se step ha targetPins → risolvere posizioni buchi breadboard
  - Se step ha wireFrom/wireTo → risolvere posizioni pin

PASSO 2: Calcolo posizioni pin in NewElabSimulator
──────────────────────────────────────────────────
- Nuova funzione: resolveStepTargetPositions(nextStep, experiment)
  → Dato un buildStep, ritorna array di {x, y} assolute dei pin target
  → Richiede experiment.layout per offset componente + pin definitions
  → Per fili: entrambe le posizioni from e to

- Passare come prop a SimulatorCanvas:
  nextTargetPins={showGuide && comparison?.nextStep
    ? resolveStepTargetPositions(comparison.nextStep, currentExperiment)
    : null}

PASSO 3: Rendering SVG con animazione
─────────────────────────────────────
- Nel SVG di SimulatorCanvas, DOPO i componenti ma PRIMA del tooltip:
  {nextTargetPins?.map((pin, i) => (
    <circle cx={pin.x} cy={pin.y} r={4}
      fill="none" stroke="#1E4D8C" strokeWidth={1.5}
      style={{ pointerEvents: 'none' }}>
      <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
    </circle>
  ))}

PASSO 4: Solo in modalita' Libero
──────────────────────────────────
- Condizione: buildMode === 'sandbox' e showGuide === true
- In Passo Passo la guida gia' forza la sequenza — non servono highlights aggiuntivi
- In Gia' Montato tutto e' pre-costruito — non serve

PASSO 5: Verifica
──────────────────
[ ] Libero con guida aperta → cerchi pulsanti sul prossimo step
[ ] Completa step → cerchi si spostano al prossimo
[ ] Completa tutto → cerchi spariscono
[ ] Passo Passo → nessun cerchio (gia' guidato)
[ ] Gia' Montato → nessun cerchio

git commit -m "feat: canvas target highlighting per Libero Guidato"
```

### Fine Sessione 5 — Contesto da salvare

```markdown
## SESSION 5 COMPLETAMENTO

### Tasks completati
- Task 9: useGalileoCoach ✅/❌
- Task 10: Canvas highlighting ✅/❌

### File creati
- src/hooks/useGalileoCoach.js (NUOVO)

### Cambiamenti architetturali
- ElabTutorV4: integrato useGalileoCoach con toggle
- NewElabSimulator: calcola nextTargetPins e passa a SimulatorCanvas
- SimulatorCanvas: renderizza cerchi SVG animati
- Data flow completo: circuitState → comparison → nextStep → targetPins → SVG circles
```

---

## SESSIONE 6: Deploy Finale (Task 11 — ~1h)

### TASK 11: Deploy + Validazione Completa

**Skill da invocare**: `quality-audit`

```
PASSO 1: Build + Merge + Deploy
────────────────────────────────
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build  # 0 errori attesi
git checkout main
git merge feature/libero-guidato
npm run build && npx vercel --prod --yes

PASSO 2: Quality Audit completo
────────────────────────────────
Invocare skill: quality-audit
Focus: bundle size, console errors, touch targets

PASSO 3: Checklist finale Libero Guidato
────────────────────────────────────────
[ ] Apri esperimento Libero → guida con "0/N" + progress bar vuota
[ ] Piazza primo componente → step 1 ✅, progress avanza
[ ] Cerchi target pulsano per prossimo step
[ ] Collega primo filo → step corrispondente ✅
[ ] Dopo 30s inattivita' → Galileo suggerisce prossimo passo
[ ] Completa tutti i passi → celebrazione + Galileo "Prova ▶!"
[ ] Toggle Coach off → nessun messaggio proattivo
[ ] Buchi target smettono di pulsare quando si apre il prossimo step

Su iPad:
[ ] Tutto quanto sopra funziona con touch
[ ] Tutto quanto sopra funziona con Apple Pencil
[ ] Palm rejection attiva (nessun input dal palmo)

PASSO 4: Aggiornare MEMORY.md
──────────────────────────────
- Aggiornare scores:
  iPad Touch: 6.5 → 9.0
  Apple Pencil: 6.0 → 9.0
  Libero Mode: 5.0 → 9.0
  Simulatore: 9.2 → 9.5
- Aggiungere sezione "Resolved in Session XX"
```

---

## MATRICE SKILLS/PLUGIN PER TASK

| Task | Skill Principale | Skill Secondaria | Plugin |
|------|-----------------|-------------------|--------|
| 1 | `tinkercad-simulator` | — | — |
| 2 | `tinkercad-simulator` | — | — |
| 3 | `tinkercad-simulator` | — | — |
| 4 | — | — | — |
| 5 | — | — | — |
| 6 | `quality-audit` | `ralph-loop:ralph-loop` (per test automatico) | — |
| 7 | `superpowers:test-driven-development` | — | — |
| 8 | — | — | — |
| 9 | — | — | — |
| 10 | `tinkercad-simulator` | — | — |
| 11 | `quality-audit` | `ralph-loop:ralph-loop` | — |

### Skills di processo (OGNI sessione)

| Momento | Skill |
|---------|-------|
| Inizio sessione | `superpowers:executing-plans` |
| Prima di codificare | Leggere questo file |
| Dopo ogni commit | `npm run build` per verifica |
| Prima di deploy | `quality-audit` |
| Se bug trovato | `superpowers:systematic-debugging` |
| Fine sessione | Salvare contesto (template sopra) |
| Merge finale | `superpowers:finishing-a-development-branch` |

---

## ANTI-REGRESSIONE E CONTEXT MANAGEMENT

### Regola dei 40 turni

Ogni sessione: massimo **40 turni** di conversazione. Dopo 40 turni, il contesto degrada.
Se servono piu' turni → chiudere sessione, salvare contesto, aprire sessione nuova.

### CLAUDE.md Invariants da aggiungere (dopo Task 1)

```markdown
## Pointer Events Invariants
- SimulatorCanvas usa SOLO Pointer Events (onPointerDown/Move/Up)
- MAI aggiungere onMouse* o onTouch* su SimulatorCanvas SVG
- touchAction: 'none' OBBLIGATORIO sull'SVG
- handleWheel resta separato (non e' Pointer Event)
- handleKeyDown resta separato
- handleBackgroundClick resta su onClick
```

### Checklist build pre-commit (OGNI task)

```bash
# Eseguire SEMPRE prima di git commit:
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build 2>&1 | tail -5
# ATTESO: "built in XXs" senza errori
```

### Verifica regressione rapida (OGNI task)

```
Aprire localhost:5173, esperimento qualsiasi:
1. Click Play → simulazione parte
2. Click Reset → circuito torna a stato iniziale
3. Wire mode → crea un filo
4. Quiz → si apre, domande funzionano
5. Galileo "Chiedi" → risponde
Tempo: 2 minuti. Se qualcosa fallisce → NON committare, debuggare.
```

### Template messaggio per nuova sessione

```
Sono Andrea, continuo il piano iPad + Libero Guidato.
- Leggi: docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md
- Ultimo task completato: Task N
- Prossimo task: Task N+1
- Branch: feature/ipad-pencil-libero (o feature/libero-guidato)
- Note dalla sessione precedente: [incollare contesto salvato]
```

---

## TRACKER PROGRESSO

Aggiornare qui dopo ogni task:

| Task | Stato | Sessione | Data | Note |
|------|-------|----------|------|------|
| 1. Pointer Events | ⬜ TODO | — | — | — |
| 2. Tap-to-place | ⬜ TODO | — | — | — |
| 3. Delete button | ⬜ TODO | — | — | — |
| 4. Pencil pressure | ⬜ TODO | — | — | — |
| 5. CSS :active + tooltips | ⬜ TODO | — | — | — |
| 6. Deploy iPad | ⬜ TODO | — | — | — |
| 7. CircuitComparator | ⬜ TODO | — | — | — |
| 8. Guide progress | ⬜ TODO | — | — | — |
| 9. Galileo Coach | ⬜ TODO | — | — | — |
| 10. Canvas highlights | ⬜ TODO | — | — | — |
| 11. Deploy finale | ⬜ TODO | — | — | — |

Legenda: ⬜ TODO | 🔄 IN PROGRESS | ✅ DONE | ❌ BLOCKED
