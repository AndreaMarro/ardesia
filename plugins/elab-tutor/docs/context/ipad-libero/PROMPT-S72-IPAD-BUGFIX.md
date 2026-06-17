# PROMPT S72 — iPad Real-Device Bugfix (Post-Test Chiara)

> Copia-incolla questo intero prompt nella nuova sessione Claude Code.

---

## CONTESTO

Progetto ELAB Tutor — simulatore di circuiti per studenti 8-14 anni.
Root: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`

**Sessione precedente (S71)**: 10 bugfix touch target + font (T1-T6, F1-F4). Build 0 errori. Score 9.2/10.
**Test iPad reale**: Chiara ha testato su iPad con Apple Pencil USB-C. Risultati sotto.

**LEGGI PRIMA DI TUTTO** (in parallelo):
1. `docs/context/ipad-libero/02-INVARIANTS.md` — regole inviolabili
2. `docs/context/ipad-libero/05-TASK-TRACKER.md` — stato sprint
3. `.team-status/QUALITY-AUDIT.md` — audit S71

---

## RISULTATI TEST iPAD (Chiara — 2026-03-05)

```
LAYOUT: Pagina non fitta bene. Elenco menu esce fuori campo.
        Pulsanti +/- zoom coperti in modalita' Passo Passo.
        Serve un FIT VIEW automatico.

A1 PASS — Pan 1 dito OK
A2 PASS — Pinch zoom OK (senza componenti su breadboard)
A3 PASS — Palm rejection OK
A4 PASS — Selezione componente OK
A5 FAIL — Drag impreciso col dito, piu' preciso con penna.
           Alcuni fori dove il collegamento dovrebbe funzionare non accettano il componente.

B1 PASS — Tap-to-place dalla palette OK
B2 PASS — Tap canvas piazza OK
B3 PASS — Passo Passo posizione esatta OK

C1 PASS — Long-press context menu OK
C2 FAIL — Long-press su potenziometri NON funziona
C3 PASS — Elimina OK
C4 PASS — Ruota OK
C5 PASS — Chiudi menu OK
C6 FAIL — ControlBar non chiaramente trovabile su iPad

D1 FAIL — Apple Pencil USB-C: pressione NON funziona
D2 FAIL — Tratto con Pencil USB-C: spessore NON variabile
D3 PASS — Dito: tratto piu' spesso della penna (coerente)
D4 PASS — No scroll/bounce durante disegno

E1 PASS — :active feedback OK
E2 PASS — No sticky hover OK
E3 FAIL — Pin tooltips NON funzionano
E4 FAIL — Tooltip non appare, quindi auto-dismiss non testabile
E5 NOTE — Tocco fuori breadboard deseleziona componenti (forse corretto ma confuso)

F1-F3 NOTE — Componenti funzionano MA a volte non funzionano in certi fori
F4 NOTE — No crash, ma componenti a volte non seguono breadboard, alcuni non trascinabili

EXTRA: Avvisi errore (resistenza in serie) sfarfallano
```

---

## BUG DA FIXARE — Ordinati per priorita'

### P0 — Critici (bloccano l'esperienza iPad)

| ID | Bug | File principali | Righe chiave | Causa probabile | Fix proposto |
|----|-----|----------------|-------------|-----------------|-------------|
| P0-LAYOUT-1 | Pagina non fitta, serve fitView automatico al caricamento | `SimulatorCanvas.jsx` | 1574-1579 (resetView), 1582-1595 (auto-reset) | `calcAutoFitViewbox()` potrebbe non considerare iPad viewport o aspetto ratio correttamente | Verificare `calcAutoFitViewbox()` su viewport iPad (1024x768 / 1180x820). Aggiungere un pulsante "Centra Vista" visibile anche su mobile. Valutare `resetView()` al primo render se viewBox e' fuori schermo |
| P0-LAYOUT-2 | Pulsanti zoom +/- coperti da BuildModeGuide in Passo Passo | `SimulatorCanvas.jsx` L2662, `overlays.module.css` L145-148, `BuildModeGuide.jsx` L69 | Zoom buttons: `position:absolute; bottom:8; right:8`. BuildModeGuide (guideRoot): `position:absolute; top:8; right:8; width:270px`. Su mobile (< 600px): guideRoot diventa `position:fixed; bottom:0; left:0; right:0` e copre i pulsanti | **Spostare zoom buttons a bottom-LEFT** (`left:8` invece di `right:8`), oppure dare loro z-index piu' alto. Su mobile verificare che guideRoot fixed non copra nulla |
| P0-LAYOUT-3 | Elenco menu/esperimenti esce fuori campo su iPad | `ExperimentPicker.jsx`, `ComponentPalette.jsx` | Verificare `max-height` e `overflow-y: auto` sui pannelli lista. iPad Safari ha viewport diverso per barre indirizzo | Aggiungere `max-height: calc(100dvh - 120px)` e `overflow-y: auto` ai container lista. Usare `dvh` (dynamic viewport height) per gestire la barra indirizzo Safari |
| P0-SNAP-1 | Componenti non si agganciano in alcuni fori validi (A5, F1-F3) | `breadboardSnap.js` L44-76 (`findNearestHole`), L188-280 (`computeAutoPinAssignment`) | `BB_SNAP_RADIUS = 22.5px` (3 * BB_PITCH). Possibile che su iPad il touch point sia meno preciso e cada fuori raggio, o che certi fori della breadboard non siano mappati nel modello | **Aumentare BB_SNAP_RADIUS a 30px** (4 * BB_PITCH) per touch su iPad. Verificare che TUTTE le righe della breadboard siano mappate (a-e, f-j, bus top/bottom). Aggiungere log diagnostico temporaneo per debug |
| P0-DRAG-1 | Componenti a volte non seguono breadboard / non trascinabili (F4) | `SimulatorCanvas.jsx` L1614+ (`handleComponentPointerDown`) | Il drag usa `setPointerCapture`. Se il pointer viene perso (es. palm rejection falso positivo su iPrimary check, o pointercancel da iOS), il componente resta bloccato | Verificare che `pointercancel` faccia cleanup completo. Aggiungere fallback: se `isPrimary === false` ma e' l'unico touch attivo, non ignorarlo |

### P1 — Importanti (degradano l'esperienza)

| ID | Bug | File principali | Righe chiave | Causa probabile | Fix proposto |
|----|-----|----------------|-------------|-----------------|-------------|
| P1-TOOLTIP-1 | Pin tooltips non appaiono su iPad (E3, E4) | `SimulatorCanvas.jsx` L1078-1099 (`hitTestPin` call), L359-393 (`hitTestPin` function) | Il tooltip si attiva solo quando `e.pointerType === 'touch' || e.pointerType === 'pen'` E `!compClickedRef.current`. Se il tocco seleziona il componente PRIMA di controllare il pin, `compClickedRef.current` e' true e il pin check viene saltato | **Indagare l'ordine**: il `compClickedRef` viene settato nel `handleComponentPointerDown` (L1614) che potrebbe eseguire PRIMA dell'SVG background handler. Verificare che il pin hit-test avvenga. Aumentare `pinTolerance = Math.max(8, 14/zoom)` a `Math.max(12, 20/zoom)` per touch impreciso su iPad |
| P1-CTXMENU-1 | Long-press non funziona su potenziometri (C2) | `SimulatorCanvas.jsx` L1734-1736 | Il codice esplicito: `if (compType === 'potentiometer') { ... }` fa partire la rotazione knob immediatamente su pointerdown, BYPASSANDO il timer di long-press 500ms | **Il potenziometro ruba il pointer** prima che il long-press timer scatti. Fix: nel branch potentiometer, aggiungere un timer 500ms PRIMA di attivare la rotazione. Se il dito resta fermo per 500ms, mostrare il context menu invece di ruotare. Se si muove entro 500ms, attivare la rotazione come adesso |
| P1-CONTROLBAR-1 | ControlBar non trovabile su iPad (C6) | `ControlBar.jsx`, `ElabSimulator.css` | Su schermi < 600px, la ControlBar potrebbe nascondersi dietro un hamburger menu. iPad in portrait e' 768px ma con split view o Safari UI potrebbe essere < 600px | Verificare breakpoint. Se `@media (max-width: 600px)` nasconde troppo, alzare a 500px. Aggiungere indicatore visivo (badge, colore) quando un componente e' selezionato per indicare che azioni sono disponibili nella toolbar |
| P1-PENCIL-1 | Apple Pencil USB-C: pressione non funziona (D1, D2) | `CanvasTab.jsx` L120-126 (`getPressure`) | `e.pointerType === 'pen'` con `e.pressure`. Apple Pencil USB-C (2a gen) su iPad 10a gen potrebbe riportare `pointerType: 'touch'` invece di `'pen'`, o `pressure: 0` costante | **Aggiungere log diagnostico**: `console.log('pointerType:', e.pointerType, 'pressure:', e.pressure)` per capire cosa riporta il Pencil USB-C. Se `pointerType !== 'pen'`, provare a usare `pressure > 0 && pressure !== 0.5` come euristica per rilevare una penna. Documentare: potrebbe essere una limitazione hardware del Pencil USB-C (non Bluetooth = nessun dato pressione via PointerEvents API) |

### P2 — Miglioramenti (non bloccanti ma fastidiosi)

| ID | Bug | File principali | Righe chiave | Causa probabile | Fix proposto |
|----|-----|----------------|-------------|-----------------|-------------|
| P2-DESELECT-1 | Tocco fuori breadboard deseleziona componenti (E5) | `SimulatorCanvas.jsx` L1058+ (`handleBackgroundClick` o SVG pointerdown) | Il click sullo sfondo SVG deseleziona il componente (comportamento voluto per mouse, confuso per touch su iPad) | **Comportamento by-design** ma confuso su touch. Valutare: NON deselezionare su touch se il tap e' involontario (es. durante pan). Se `pointerType === 'touch'` e la distanza del pan e' < 5px, NON deselezionare. Oppure aggiungere un feedback "Componente deselezionato" |
| P2-FLICKER-1 | Avvisi errore (resistenza in serie) sfarfallano | `NewElabSimulator.jsx` L977-980, L3283-3309 | Il warning overlay usa `animation: pulse 0.6s ease-in-out infinite alternate` (L3304). `onWarning` viene chiamato ad ogni ciclo di simulazione → `setCircuitWarning()` ripetuto → smonta/rimonta il div → restart animazione = flicker | **Fix**: non ri-settare `circuitWarning` se il messaggio e' identico al precedente. Aggiungere check: `if (circuitWarning?.message === message) return;` prima di `setCircuitWarning`. Usare `useRef` per il messaggio corrente per evitare re-render |

---

## ORDINE DI ESECUZIONE

### Fase 1: Diagnostica (30 min)

1. **LEGGI** `02-INVARIANTS.md`, `05-TASK-TRACKER.md`, `.team-status/QUALITY-AUDIT.md`
2. **LEGGI** `breadboardSnap.js` completo — capire la mappa fori e snap radius
3. **LEGGI** `SimulatorCanvas.jsx` L1050-1110 — capire ordine pin hit-test vs component select
4. **LEGGI** `SimulatorCanvas.jsx` L1614-1770 — capire handleComponentPointerDown + potentiometer branch
5. **LEGGI** `overlays.module.css` — capire responsive breakpoints guideRoot
6. **LEGGI** `CanvasTab.jsx` L110-185 — capire getPressure + pointerType detection

### Fase 2: Fix P0 (2h)

7. **P0-LAYOUT-2**: Sposta zoom buttons da `right:8` a `left:8` in `SimulatorCanvas.jsx` L2662
8. **P0-LAYOUT-3**: Aggiungi `max-height: calc(100dvh - 120px)` + `overflow-y: auto` ai container lista overflow
9. **P0-SNAP-1**: Aumenta `BB_SNAP_RADIUS` in `breadboardSnap.js` L31 (22.5 -> 30) e testa snap su fori critici
10. **P0-LAYOUT-1**: Verifica `calcAutoFitViewbox()` — se il viewBox iniziale taglia la breadboard su iPad, aggiusta
11. **P0-DRAG-1**: Verifica cleanup in `pointercancel` e `isPrimary` check — assicurati che il drag non si blocchi

### Fase 3: Fix P1 (2h)

12. **P1-TOOLTIP-1**: Indaga `compClickedRef` timing. Se blocca i pin tooltips, riordina la logica: pin check PRIMA di component select
13. **P1-CTXMENU-1**: Nel branch potentiometer (L1734-1736), aggiungi 500ms delay prima di attivare rotazione. Se fermo → context menu, se muove → rotazione
14. **P1-CONTROLBAR-1**: Verifica che la ControlBar sia visibile su iPad portrait. Se necessario, aggiungi un indicatore "componente selezionato → usa la toolbar"
15. **P1-PENCIL-1**: Aggiungi logging diagnostico per capire cosa riporta il Pencil USB-C. Se `pointerType !== 'pen'`, documenta la limitazione e considera workaround

### Fase 4: Fix P2 (30 min)

16. **P2-FLICKER-1**: Aggiungi check `if (circuitWarning?.message === message) return;` in `onWarning` handler (L977-980)
17. **P2-DESELECT-1**: Valuta se filtrare deselect su touch quando `panDistance < 5px`

### Fase 5: Verifica (30 min)

18. `npm run build` — DEVE passare con 0 errori
19. Aggiorna `05-TASK-TRACKER.md` — task 6d con tutti i fix
20. Lancia skill `/quality-audit` — brutalmente onesto

---

## FILE DA LEGGERE/MODIFICARE

### Modifiche principali
| File | Tipo | Bug |
|------|------|-----|
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | MODIFICA | P0-LAYOUT-1, P0-LAYOUT-2, P0-DRAG-1, P1-TOOLTIP-1, P1-CTXMENU-1, P2-DESELECT-1 |
| `src/components/simulator/utils/breadboardSnap.js` | MODIFICA | P0-SNAP-1 |
| `src/components/simulator/overlays.module.css` | MODIFICA | P0-LAYOUT-2, P0-LAYOUT-3 |
| `src/components/simulator/NewElabSimulator.jsx` | MODIFICA | P2-FLICKER-1 |
| `src/components/simulator/panels/BuildModeGuide.jsx` | VERIFICA | P0-LAYOUT-2 |
| `src/components/simulator/panels/ExperimentPicker.jsx` | MODIFICA | P0-LAYOUT-3 |
| `src/components/simulator/panels/ComponentPalette.jsx` | MODIFICA | P0-LAYOUT-3 |
| `src/components/tutor/CanvasTab.jsx` | MODIFICA | P1-PENCIL-1 |
| `src/components/simulator/ControlBar.jsx` | VERIFICA | P1-CONTROLBAR-1 |

### Contesto (solo lettura)
| File | Motivo |
|------|--------|
| `docs/context/ipad-libero/02-INVARIANTS.md` | Regole inviolabili |
| `docs/context/ipad-libero/05-TASK-TRACKER.md` | Stato sprint |
| `.team-status/QUALITY-AUDIT.md` | Audit S71 |

---

## REGOLE CRITICHE

- **ZERO emoji** nei file sorgente (salvo richiesta esplicita)
- **NON toccare** handler: `handleWheel`, `handleKeyDown`, `handleBackgroundClick`
- **NON toccare** `touch-action: none` su SVG canvas
- **NON rompere** il comportamento mouse (tutti i fix devono essere backward-compatible)
- **Build DEVE passare con 0 errori**
- **Palette**: Navy `#1E4D8C`, Lime `#7CB342`
- **BB_HOLE_PITCH = 7.5px** (invariante, non cambiare)
- **SNAP_THRESHOLD = 4.5px** (invariante)
- I numeri di riga sono riferiti alla versione post-S71 — **VERIFICA** leggendo il file prima di editare
- Accenti corretti: `perche'` con backtick, NON `perché` con UTF-8

---

## SKILLS DA USARE

1. `tinkercad-simulator` — per dubbi su componenti SVG, snap, drag
2. `quality-audit` — per il re-audit finale (step 20)
3. `systematic-debugging` — per P0-SNAP-1 (capire quali fori falliscono)
4. `ralph-loop` — per validazione end-to-end dopo i fix

---

## SCORE ATTUALE (post-S71)

| Area | Score | Target post-S72 |
|------|-------|-----------------|
| iPad Touch | 9.2/10 | 9.5+ |
| Apple Pencil | 9.0/10 | 9.0 (documentare limitazione USB-C) |
| Layout iPad | ~7.0/10 | 9.0+ |
| Snap/Drag | ~7.5/10 | 9.0+ |
| Accessibility | 8.8/10 | 8.8 (non toccare) |
| Performance | 8.5/10 | 8.5 (non toccare) |
| Code Hygiene | 9.8/10 | 9.8+ |
| **Overall** | **~8.5/10** | **9.0+** |

Il quality audit deve essere BRUTALMENTE ONESTO.

---

## NOTA SUL PENCIL USB-C

Apple Pencil USB-C (1a gen USB-C, modello MUWA3) **potrebbe non supportare la pressione** via Pointer Events API. Solo Apple Pencil 1a gen (Lightning) e 2a gen (magnetica) supportano `e.pressure` via Safari PointerEvents. Il Pencil USB-C potrebbe riportare `pointerType: 'touch'` e `pressure: 0` costante.

Se confermato dal log diagnostico:
- Documentare come limitazione hardware nota
- Il disegno con Pencil USB-C funzionera' comunque (spessore costante come il dito)
- NON e' un bug del nostro codice

---

*Prompt generato automaticamente — S71 — 2026-03-05*
