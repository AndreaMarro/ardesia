# SESSION START — Prompt di Avvio

> Copia-incolla il prompt appropriato all'inizio della nuova sessione Claude Code.

---

## PROMPT SESSIONE 1 (Tasks 1-2: Pointer Events + Tap-to-place)

```
Devo implementare il piano iPad + Apple Pencil + Libero Guidato per ELAB Tutor.

CONTESTO: Leggi questi file in ordine:
1. docs/context/ipad-libero/00-INDEX.md (indice cartella contesto)
2. docs/context/ipad-libero/02-INVARIANTS.md (regole inviolabili)
3. docs/context/ipad-libero/03-CURRENT-STATE.md (stato codice con righe)
4. docs/context/ipad-libero/05-TASK-TRACKER.md (stato avanzamento)
5. docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md (piano operativo — Sessione 1)

TASK DA FARE: Task 1 (Pointer Events migration) + Task 2 (Tap-to-place iPad)

SKILLS DA USARE:
- superpowers:executing-plans
- tinkercad-simulator (per modifiche al canvas SVG)

FILE SORGENTE DA LEGGERE:
- src/components/simulator/canvas/SimulatorCanvas.jsx (2629 righe — handler da riga 864 a 1470, SVG bindings riga 2208-2214)
- src/components/simulator/panels/ComponentPalette.jsx (292 righe — handleDragStart riga 31)
- src/components/simulator/panels/ComponentDrawer.jsx (528 righe — DraggableChip riga 78)

REGOLE CRITICHE:
- handleWheel NON SI TOCCA (resta useEffect separato)
- touch-action: none OBBLIGATORIO sull'SVG
- isPrimary=false → IGNORARE (palm rejection)
- setPointerCapture su pointerdown, releasePointerCapture su pointerup/cancel
- npm run build DEVE passare con 0 errori dopo ogni modifica
- Andrea Marro watermark ogni 200 righe (gia' nel vite.config.js)
- NO git nel progetto principale — backup file prima di modifiche

NOTA: Nessun task e' stato iniziato. Il codice e' nel suo stato originale.
Procedi con Task 1, poi Task 2. Sequenziale, non parallelo.
```

---

## PROMPT SESSIONE 2 (Tasks 3-5: Delete + Pencil + CSS)

```
Continuo il piano iPad + Apple Pencil + Libero Guidato per ELAB Tutor.

CONTESTO: Leggi questi file in ordine:
1. docs/context/ipad-libero/02-INVARIANTS.md
2. docs/context/ipad-libero/03-CURRENT-STATE.md (ATTENZIONE: i numeri di riga potrebbero essere cambiati dopo Sessione 1)
3. docs/context/ipad-libero/05-TASK-TRACKER.md (verifica Tasks 1-2 = DONE)
4. docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md (piano operativo — Sessione 2)

TASK DA FARE: Task 3 (Pulsante Elimina + Long-press) + Task 4 (Apple Pencil pressure) + Task 5 (CSS :active + tooltips)

SKILLS DA USARE:
- superpowers:executing-plans
- tinkercad-simulator

FILE SORGENTE DA LEGGERE:
- src/components/simulator/panels/ControlBar.jsx (850 righe)
- src/components/simulator/canvas/SimulatorCanvas.jsx (righe aggiornate dopo Task 1)
- src/components/tutor/CanvasTab.jsx (315 righe)
- src/components/simulator/ElabSimulator.css

PREREQUISITI VERIFICATI:
- Task 1 (Pointer Events) COMPLETATO — handler onPointerDown/Move/Up funzionanti
- Task 2 (Tap-to-place) COMPLETATO — componenti piazzabili su iPad
```

---

## PROMPT SESSIONE 3 (Task 6: Deploy + Test iPad)

```
Continuo il piano iPad + Apple Pencil. Sprint 1 completato, devo deployare e testare.

CONTESTO: Leggi:
1. docs/context/ipad-libero/05-TASK-TRACKER.md (verifica Tasks 1-5 = DONE)
2. docs/context/ipad-libero/02-INVARIANTS.md

TASK DA FARE: Task 6 (Deploy Vercel + Test iPad reale)

SKILLS DA USARE:
- quality-audit
- ralph-loop (per test sistematico)

COMANDI:
- npm run build (DEVE passare con 0 errori)
- npx vercel --prod --yes

TEST DA FARE SU iPAD:
1. Pinch-to-zoom funziona (2 dita)
2. Pan funziona (1 dito su sfondo)
3. Drag componente funziona (1 dito su componente)
4. Tap-to-place dalla palette funziona
5. Pulsante Elimina funziona
6. Apple Pencil: palm rejection funziona
7. Apple Pencil: hover pin mostra tooltip
8. CanvasTab: pressione Pencil cambia spessore tratto
```

---

## PROMPT SESSIONE 4 (Tasks 7-8: CircuitComparator + Guide)

```
Inizio Sprint 2: Libero Guidato. iPad funziona (Sprint 1 completato).

CONTESTO: Leggi:
1. docs/context/ipad-libero/02-INVARIANTS.md
2. docs/context/ipad-libero/03-CURRENT-STATE.md
3. docs/context/ipad-libero/05-TASK-TRACKER.md (verifica Tasks 1-6 = DONE)
4. docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md (piano operativo — Sessione 4)

TASK DA FARE: Task 7 (CircuitComparator) + Task 8 (ExperimentGuide progress)

SKILLS DA USARE:
- superpowers:executing-plans
- superpowers:test-driven-development (per CircuitComparator)

FILE DA LEGGERE:
- src/data/experiments-vol1.js (struttura buildSteps)
- src/components/simulator/panels/ExperimentGuide.jsx (304 righe)
- src/components/simulator/NewElabSimulator.jsx (3582 righe — riga 3300 render ExperimentGuide)

FILE DA CREARE:
- src/components/simulator/utils/circuitComparator.js
```

---

## PROMPT SESSIONE 5 (Tasks 9-10: Galileo Coach + Highlighting)

```
Continuo Sprint 2: Galileo Coach proattivo.

CONTESTO: Leggi:
1. docs/context/ipad-libero/02-INVARIANTS.md
2. docs/context/ipad-libero/03-CURRENT-STATE.md
3. docs/context/ipad-libero/05-TASK-TRACKER.md (verifica Tasks 7-8 = DONE)
4. docs/plans/MAPPA-PROGRAMMATICA-IPAD-LIBERO.md (piano operativo — Sessione 5)

TASK DA FARE: Task 9 (useGalileoCoach hook) + Task 10 (Canvas highlighting)

SKILLS DA USARE:
- superpowers:executing-plans
- tinkercad-simulator (per highlighting SVG)

FILE DA LEGGERE:
- src/components/tutor/ElabTutorV4.jsx (2152 righe — circuitStateRef riga 143)
- src/components/simulator/canvas/SimulatorCanvas.jsx (per SVG highlighting)
- src/components/simulator/utils/circuitComparator.js (creato in Sessione 4)

FILE DA CREARE:
- src/components/simulator/hooks/useGalileoCoach.js
```

---

## PROMPT SESSIONE 6 (Task 11: Deploy Finale)

```
Deploy finale Sprint 2: Libero Guidato completo.

CONTESTO: Leggi:
1. docs/context/ipad-libero/05-TASK-TRACKER.md (verifica Tasks 1-10 = DONE)
2. docs/context/ipad-libero/02-INVARIANTS.md

TASK DA FARE: Task 11 (Deploy + validazione completa)

SKILLS DA USARE:
- quality-audit
- ralph-loop
- superpowers:finishing-a-development-branch

TEST FINALE (tutte le modalita'):
1. Gia' Montato: circuito piazzato, Play funziona, Quiz funziona
2. Passo Passo: step evidenziati, validazione verde/rosso, completamento
3. Libero Guidato: progress tracking, Galileo coach suggerisce, highlighting canvas
4. iPad: tutto funziona con touch + Apple Pencil
5. PC: nessuna regressione su mouse + tastiera
```

---

## PROMPT SESSIONE BUGFIX S70 (Fix 12 bug audit + Re-audit brutale)

```
Devo fixare 12 bug trovati in un audit brutalmente onesto dello Sprint 1 iPad + Apple Pencil di ELAB Tutor.
Score attuale: 7.8/10. Target: 9.0/10.

CONTESTO: Leggi questi file in ordine:
1. docs/context/ipad-libero/02-INVARIANTS.md (regole inviolabili)
2. docs/context/ipad-libero/05-TASK-TRACKER.md (stato avanzamento — Tasks 1-5 DONE, Task 6 WIP)

SKILLS DA USARE:
- tinkercad-simulator (per modifiche al canvas SVG)
- quality-audit (per re-audit DOPO i fix)

FILE DA LEGGERE E MODIFICARE:
- src/components/simulator/canvas/SimulatorCanvas.jsx (~2829 righe)
- src/components/simulator/ElabSimulator.css
- src/components/tutor/CanvasTab.jsx
- src/components/simulator/panels/ControlBar.jsx

---

## 12 BUG DA FIXARE (ordinati per priorita')

### P1 — CRITICI (3 bug)

B1 (P1) — PERFORMANCE: hoveredPin in dependency array di handlePointerDown
  File: SimulatorCanvas.jsx
  Problema: `hoveredPin` (riga ~504) e' nello state e usato nel dependency array di handlePointerDown (riga ~1108).
  Ogni volta che un tooltip appare/scompare, handlePointerDown viene ricreato → ri-render di tutto.
  Fix: Usare un ref (hoveredPinRef) invece di state nel dep array, oppure rimuoverlo dal dep array e usare functional update.
  Verifica: grep per `hoveredPin` in dependency arrays di useCallback.

B2 (P1) — TOUCH TARGET: Context menu items 36px, non 44px
  File: SimulatorCanvas.jsx, sezione context menu SVG (~righe 2553-2632)
  Problema: ITEM_H = 32, hit area height = ITEM_H + 4 = 36px. Il commento dice "min 44px" ma e' FALSO.
  Fix: ITEM_H = 40, hit area height = 44. Ricalcolare MENU_H, MENU_Y, posizioni testo.
  Verifica: grep per ITEM_H nel context menu, verificare che tutti i touch target >= 44px.

B3 (P1) — ZOOM BUG: Context menu SVG scala con il viewBox
  File: SimulatorCanvas.jsx, sezione context menu SVG
  Problema: Il menu e' un <g> dentro l'SVG con coordinate SVG. Quando l'utente zooma, il menu si ingrandisce/rimpicciolisce.
  A zoom 50% diventa illeggibile, a zoom 200% e' gigantesco.
  Fix: Convertire il context menu da SVG a HTML overlay (come gia' fatto per il pin tooltip).
  Usare position:fixed o absolute con coordinate screenX/screenY dal pointer event.
  Oppure applicare transform inverso al viewBox zoom (piu' fragile).
  Approccio consigliato: HTML overlay come il tooltip — piu' robusto, indipendente dallo zoom.
  Verifica: zoomare al 50% e al 200%, il menu deve avere SEMPRE la stessa dimensione visiva.

### P2 — IMPORTANTI (5 bug)

B4 (P2) — TOUCH TARGET: Banner cancel button 24x24px
  File: SimulatorCanvas.jsx, riga ~2656
  Problema: Il pulsante X per chiudere il banner tap-to-place e' 24x24px. Minimo 44px per bambini 8-12.
  Fix: width: 44, height: 44, mantenere il simbolo X al centro.
  Verifica: ispezionare le dimensioni del pulsante cancel nel banner.

B5 (P2) — FONT SIZE: Pin tooltip 12px e 11px
  File: ElabSimulator.css
  Problema: .elab-pin-tooltip font-size: 12px (riga ~930), .elab-pin-tooltip__detail font-size: 11px (riga ~958).
  Sotto il target di 14px minimo.
  Fix: Portare a 14px e 12px minimo, o meglio 14px e 13px.
  Verifica: grep per font-size sotto 14px in ElabSimulator.css.

B6 (P2) — CLIPPING: Pin tooltip non ha flip logic
  File: SimulatorCanvas.jsx, sezione tooltip HTML overlay (~righe 2797-2809)
  Problema: Il tooltip appare SEMPRE sopra il pin. Se il pin e' vicino al bordo superiore del viewport,
  il tooltip esce dallo schermo ed e' invisibile.
  Fix: Calcolare se c'e' spazio sopra. Se non c'e', mostrare sotto il pin.
  Servono le coordinate viewport del pin e l'altezza del tooltip (~40px).
  Verifica: posizionare un componente in alto nello schermo, toccare un pin, il tooltip deve essere visibile.

B7 (P2) — CSS CONFLICT: regola generica .elab-simulator-canvas button:active
  File: ElabSimulator.css, riga ~914
  Problema: La regola `.elab-simulator-canvas button:active` potrebbe sovrascrivere le regole
  specifiche `.toolbar-btn:active`, `.toolbar-btn--primary:active` etc.
  Fix: Aggiungere `:not(.toolbar-btn)` al selettore generico, oppure rimuoverlo se ridondante.
  Verifica: confrontare specificita' CSS tra la regola generica e quelle specifiche.

B8 (P2) — DEAD CODE: 6 file .backup in src/ (357KB che vanno in deploy)
  File: 6 file nella cartella src/:
    - ElabSimulator.css.backup-pre-task5
    - SimulatorCanvas.jsx.backup-pre-task3
    - SimulatorCanvas.jsx.backup-pre-task5
    - ControlBar.jsx.backup-pre-task3
    - NewElabSimulator.jsx.backup-pre-task3
    - CanvasTab.jsx.backup-pre-task4
  Problema: Questi file vengono inclusi nel deploy Vercel. Peso morto 357KB.
  Fix: Spostarli in docs/backups/ oppure eliminarli (sono backup pre-sprint, il codice originale
  e' recuperabile dalla history delle sessioni Claude).
  Verifica: ls src/**/*.backup* deve dare 0 risultati.

### P3 — MINORI (4 bug)

B9 (P3) — STATE LEAK: pendingPlacement non resettato al cambio esperimento
  File: SimulatorCanvas.jsx, stato `pendingPlacement` (riga ~550)
  Problema: Se l'utente seleziona un componente dalla palette (pendingPlacement != null) e poi cambia esperimento,
  il banner "Tocca il canvas per piazzare" resta visibile con il vecchio componente.
  Fix: Aggiungere useEffect che resetta pendingPlacement quando cambia `currentExperiment` o `buildMode`.
  Verifica: selezionare un componente, cambiare esperimento, il banner deve sparire.

B10 (P3) — PRESSURE CLAMP: nessun Math.min su pressure
  File: CanvasTab.jsx, funzione getPressure (~riga 120)
  Problema: e.pressure puo' teoricamente restituire valori > 1.0 su alcuni dispositivi/driver.
  Fix: return Math.min(1.0, Math.max(0, pressure))
  Verifica: leggere il codice di getPressure.

B11 (P3) — UX: shortcut "Click destro" inutile su iPad
  File: ControlBar.jsx, riga ~586
  Problema: Il tooltip del pulsante Elimina dice shortcut="Click destro". Su iPad non esiste il click destro.
  Fix: Cambiare in "Tieni premuto" o rendere il testo dinamico basandosi su pointer type.
  Suggerimento: `shortcut={isTouchDevice ? "Tieni premuto" : "Click destro"}`
  Verifica: leggere il prop shortcut dei pulsanti ControlBar.

B12 (P3) — A11Y: zero attributi aria in tutti i componenti sprint
  File: SimulatorCanvas.jsx (context menu, banner, tooltip)
  Problema: Nessun aria-label, role, o tabIndex sugli elementi interattivi aggiunti nello sprint.
  Fix: Aggiungere role="menu", role="menuitem", aria-label ai pulsanti del context menu.
  Aggiungere role="alert" al banner tap-to-place. aria-label al tooltip.
  Verifica: grep per aria-label, role, tabIndex nei componenti modificati.

---

## ORDINE DI ESECUZIONE

1. B8 — Spostare i 6 backup files (veloce, riduce noise)
2. B1 — Fix hoveredPin deps (performance)
3. B2 + B3 — Convertire context menu SVG -> HTML overlay (risolve ENTRAMBI: touch targets + zoom)
4. B4 — Banner cancel button 44px
5. B5 — Font sizes tooltip
6. B6 — Tooltip flip logic
7. B7 — CSS conflict
8. B9 — pendingPlacement reset
9. B10 — Pressure clamp
10. B11 — Shortcut text
11. B12 — Aria attributes
12. npm run build (DEVE passare con 0 errori)
13. RE-AUDIT con skill quality-audit — STESSA brutale onesta'

## REGOLE CRITICHE
- handleWheel NON SI TOCCA (invariante #1)
- touch-action: none OBBLIGATORIO sull'SVG (invariante #2)
- isPrimary=false → IGNORARE (invariante #10)
- Zero emoji nei file sorgente (invariante #6)
- npm run build DEVE passare con 0 errori (invariante #7)
- NO git nel progetto — creare backup .backup-pre-bugfix dei file PRIMA di modificarli
  (ma NON in src/ — metterli in docs/backups/)
- Palette: Navy #1E4D8C, Lime #7CB342
- Font minimo 14px per tutto il testo utente
- Touch target minimo 44px per tutti gli elementi interattivi
- CoV (Chain of Verification) dopo OGNI fix: verificare con grep/lettura che il fix sia corretto
- Aggiornare 05-TASK-TRACKER.md con i risultati del bugfix
```

---

## TEMPLATE FINE SESSIONE

Alla fine di ogni sessione, aggiornare:

1. **05-TASK-TRACKER.md** — stato dei task completati
2. **03-CURRENT-STATE.md** — nuovi numeri di riga se file sono cambiati
3. **Note nella colonna "Note"** del tracker se ci sono state decisioni importanti

```
FORMATO NOTE:
Task X — DONE — "Usato Map invece di array per activeTouches perche' serve lookup O(1) per pointerId"
```
