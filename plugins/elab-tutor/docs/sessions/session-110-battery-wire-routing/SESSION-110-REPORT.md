# Session 110 Report — Fix Battery Wire Routing

**Data**: 10/03/2026
**Autore**: Andrea Marro + Claude
**Commits**: `2fcf024` (v1 — L-shaped jog, peggiorava), `146cbff` (v2 — clean Bézier, FINALE)

## Problema
I fili della batteria 9V (rosso + e nero −) si sovrapponevano visivamente perché entrambi partivano da pin a x:0 (positive y:32, negative y:58). In `buildRoutedPath()`, i fili quasi-verticali ricevevano lo STESSO `sagX = sag * 0.5` (sempre positivo), causando sovrapposizione totale.

Inoltre, i terminali sulla batteria SVG erano invertiti rispetto ai pin: il (+) era sul clip INFERIORE ma il pin positive era in ALTO (y:32), e il (−) sul clip SUPERIORE ma il pin negative in BASSO (y:58). Questo causava l'incrocio dei fili decorativi interni alla batteria.

## Root Cause
Tre problemi concorrenti:
1. **`buildRoutedPath()`**: il sag laterale per fili quasi-verticali era sempre `sag * 0.5` (positivo) — entrambi i fili curvavano nella stessa direzione
2. **`applyComponentAvoidance()`**: l'A* pathfinding aggiungeva waypoint complessi ai fili batteria, creando percorsi multi-segmento aggrovigliati
3. **`Battery9V.jsx`**: terminali (+)/(−) invertiti rispetto ai pin — i fili decorativi si incrociavano internamente

## Fix v1 (SCARTATO — commit `2fcf024`)
Il primo tentativo aggiungeva un jog L-shaped in `routeToBreadboardPin()` (3-point path con offset ±15px). Questo creava waypoint intermedi che l'A* pathfinding trasformava in percorsi ancora più aggrovigliati. **Feedback utente: "sono ancora più attorcigliati".**

## Fix v2 FINALE (commit `146cbff`)

### WireRenderer.jsx — 3 modifiche

**1. Rimosso jog L-shaped da `routeToBreadboardPin()`**
- Ritorna sempre 2-point path diretto `[offPos, bbPinPos]`
- La separazione è gestita interamente dal sag in `buildRoutedPath()`

**2. Skip `applyComponentAvoidance()` per battery wires**
- Rilevamento: `conn.from.startsWith('bat') || conn.to.startsWith('bat')`
- I fili batteria vanno da off-board a bus rail — nessun componente da evitare
- Risultato: curve Bézier pulite senza waypoint A*

**3. Sag depth polarity-aware per fili orizzontali/diagonali**
- Aggiunto parametro `opts.polarity` a `buildRoutedPath()`
- Fili orizzontali con polarità: `sagX = sag * 0.2 * sagDirection` + `sagY = polarity > 0 ? sag * 1.4 : sag * 0.4`
- Positivi droop di più, negativi di meno → separazione verticale visibile

### Battery9V.jsx — Swap terminali +/−

**Clip superiore ora è (+), inferiore è (−)**
- Etichette arancione scambiate (+ in alto, − in basso)
- Terminale grande (ring/socket) spostato sul clip superiore (+)
- Terminale piccolo (nub) spostato sul clip inferiore (−)
- Filo rosso: da clip sup (+) → pin positive (0, 32) — percorso corto, in zona alta
- Filo nero: da clip inf (−) → pin negative (0, 58) — percorso corto, in zona bassa
- **Zero incroci interni** — ogni filo resta nel suo corridoio verticale

### Helper function: `detectPolarity(fromRef, toRef)` (invariata da v1)
- Rileva polarità da pin names: `positive/plus/vcc/5v/3v3/vin` → +1
- `negative/minus/gnd` → -1
- Bus rails: `bus-*-plus` → +1, `bus-*-minus` → -1
- Neutro → 0

## File Modificati
- `src/components/simulator/canvas/WireRenderer.jsx`:
  - `routeToBreadboardPin()` — rimosso polarity param e jog L-shaped (semplificato)
  - `buildRoutedPath()` — aggiunto `polarity` option per sag depth orizzontale
  - `computeRoutedWire()` Case 4 — rimossa detectPolarity (non più necessaria qui)
  - Rendering loop — aggiunto `isBatteryWire` check per skip A*, passaggio `polarity`
- `src/components/simulator/components/Battery9V.jsx`:
  - Swap clip: (+) upper, (−) lower
  - Swap etichette arancione
  - Swap terminali (dimensioni)
  - Swap fili decorativi interni

## COV Results

| # | Test | Risultato | Note |
|---|------|-----------|------|
| 1 | Carica esperimento con batteria → fili non si sovrappongono | PASS | Clean 2-point Bézier, no A* |
| 2 | Separazione visiva >10px al midpoint | PASS | 15.2px separazione verticale |
| 3 | Battery SVG: + in alto, − in basso | PASS | Etichette, terminali, fili interni corretti |
| 4 | Fili interni batteria non si incrociano | PASS | Red y:-21→32, Black y:-1→58 — nessun crossing |
| 5 | 2° esperimento (v1-cap6-esp3) → stessa separazione | PASS | Path identici, consistente |
| 6 | Console errors = 0 | PASS | Nessun errore JS |
| 7 | npm run build → 0 errori | PASS | Build OK |

## Separazione Visiva — Come Funziona (v2)

```
PRIMA (overlap + incrocio interno):     DOPO v2 (separated + no crossing):

Battery:                                Battery:
  [−] upper clip ──╲─── pin neg y:58      [+] upper clip ──── pin pos y:32
  [+] lower clip ──╱─── pin pos y:32      [−] lower clip ──── pin neg y:58
  (wires cross!)                           (no crossing!)

External wires:                         External wires:
  pin pos y:32 ──── Bus+ y:24            pin pos y:32 ─⌒─── Bus+ y:24  (deeper sag)
  pin neg y:58 ──── Bus− y:31            pin neg y:58 ─⌣─── Bus− y:31  (shallower sag)
  (same sag = overlap)                    (15.2px gap at midpoint)
```

## Lezione Appresa
L'approccio L-shaped (3-point path con jog laterale) **peggiora** la situazione quando combinato con A* pathfinding: l'algoritmo aggiunge waypoint extra attorno al punto intermedio del jog, creando percorsi multi-segmento aggrovigliati. La soluzione corretta è mantenere **2-point Bézier diretti** e differenziare la curvatura (sag depth) tramite la polarità. Più semplice = più pulito.

## Deliverables
- [x] Fix applicato v2 (WireRenderer.jsx + Battery9V.jsx)
- [x] Skill creata: `.claude/skills/wire-visual-test.md`
- [x] Build: 0 errori
- [x] Deploy: Vercel production (https://www.elabtutor.school)
- [x] GitHub: commits `2fcf024` + `146cbff` pushed
- [x] Report aggiornato con v1 (scartato) + v2 (finale)
- [x] Session 111 prompt: `docs/sessions/session-111-lcd-blockly-blocks/SESSION-111-PROMPT.md`

## Prossima Sessione
**Session 111 — LCD Blockly Blocks** — Add lcd_init, lcd_print, lcd_setCursor, lcd_clear blocks to scratchBlocks.js + scratchGenerator.js for LCD experiments in Scratch mode. Currently P1 feature gap: students must use C++ for LCD experiments.
