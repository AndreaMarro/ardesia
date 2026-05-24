# `src/plugins/bookGeometry/` — Renderer plugin

Bridge runtime tra `src/data/book-geometry/<esp-id>.bookGeometry.json` (source-of-truth canonical visiva libro) e simulator React canvas.

## Scope (Sprint B Phase J)

- ✅ `resolveBookPoint.js` — utility risolve pseudo-pin (`bb1:e7`) → coords cartesiane
- ✅ `BookGeometryRenderer.jsx` — React SVG component placeholder rendering bookGeometry
- ✅ Unit tests (Vitest)
- ⏳ Asset SVG suite specifici (battery9v-vol1-horizontal-clip-right, breadboard-vol1-horizontal-half, etc.) — Sprint B Phase K
- ⏳ Wire path bezier renderer migliorato (curve vs polyline) — Sprint B Phase K
- ⏳ Integration con NewElabSimulator (overlay mode) — Sprint C
- ⏳ Visual diff automatizzato vs reference PNG — Sprint F

## Usage

```jsx
import { BookGeometryRenderer } from '@/plugins/bookGeometry';
import bookGeometryV1Esp1 from '@/data/book-geometry/v1-cap6-esp1.bookGeometry.json';

// Modalità complete (già montato — tutti components + wires visibili)
<svg viewBox="0 0 900 300">
  <BookGeometryRenderer
    bookGeometry={bookGeometryV1Esp1}
    mode="complete"
  />
</svg>

// Modalità guided (passo-passo — subset progressivo)
<BookGeometryRenderer
  bookGeometry={bookGeometryV1Esp1}
  mode="guided"
  stepIndex={2}    // mostra step 3 (zero-indexed)
/>
```

## Output SVG structure

```html
<g class="book-geometry-renderer" data-experiment="v1-cap6-esp1" data-mode="complete">
  <g class="bg-components">
    <g class="bg-component" data-component="bat1" data-type="battery9v" transform="translate(80,150) rotate(0)">
      <rect width="70" height="36" fill="#2a2a2a" ...>
      <text>bat1</text>
    </g>
    ...
  </g>
  <g class="bg-wires">
    <polyline class="bg-wire" data-wire-id="wire-positive-clip-to-rail" stroke="red" points="120,130 150,110 410,110 410,145" ...>
    ...
  </g>
</g>
```

## `resolveBookPoint(pinSpec, components)` API

```js
import { resolveBookPoint } from '@/plugins/bookGeometry';

const components = bookGeometryV1Esp1.components;

// Breadboard hole
resolveBookPoint('bb1:e7', components);
// → { x: 495, y: 30 } (assumendo bb1.x=450, bb1.y=150 + offset)

// Breadboard rail
resolveBookPoint('bb1:topPlusRail-col1', components);
// → { x: 450, y: 135 }

// Battery clip terminal
resolveBookPoint('bat1:positive', components);
// → { x: 150, y: 160 }

// Componente non esistente
resolveBookPoint('xyz:foo', components);
// → null
```

### Convention pin spec

| Spec | Risolto |
|------|---------|
| `bb1:e7` | foro bb fila e colonna 7 |
| `bb1:f10` | foro bb fila f colonna 10 |
| `bb1:topPlusRail-col1` | rail superiore positivo colonna 1 |
| `bb1:bottomMinusRail-col30` | rail inferiore negativo colonna 30 |
| `bat1:positive` | terminal positivo batteria (clip esce destra) |
| `bat1:negative` | terminal negativo batteria |
| `led1:anode` | anodo LED |
| `led1:cathode` | catodo LED |

### Constants

```js
BB_HOLE_PITCH = 7.5   // px per colonna (CLAUDE.md regola immutabile)
BB_ROW_PITCH = 7.5     // px per riga
BB_GAP_HEIGHT = 25     // gap centrale bb tra section top + bot
```

## Component placeholder styles

`COMPONENT_PLACEHOLDER_STYLES` mappa `type` → `{width, height, fill, stroke}`:
- battery9v: 70x36 black + gold trim
- breadboard: 450x75 cream + gray
- led / led-bridge: 12x18 red
- resistor: 38x8 tan + brown
- capacitor: 14x30 black
- push-button: 20x20 orange
- multimeter: 70x100 yellow
- nano-r4: 50x80 navy

Default fallback: 20x20 gray.

## 7 bookGeometry available

```
src/data/book-geometry/
  bookGeometry.schema.json     (JSON Schema validation, ajv-cli verified)
  v1-cap6-esp1.bookGeometry.json     Primo LED
  v1-cap6-esp2.bookGeometry.json     LED senza R (anti-pattern)
  v1-cap6-esp3.bookGeometry.json     Cambia luminosità R variant
  v2-cap7-esp1.bookGeometry.json     Scarica cap + MM
  v2-cap7-esp2.bookGeometry.json     Scarica cap con LED
  v3-cap6-esp4.bookGeometry.json     Due LED polizia (V0.8.1 canon D8+D9)
  v3-cap6-esp5.bookGeometry.json     Semaforo (V0.8.1 canon D5+D6+D7)
```

## Anti-regressione

NEW files only (NO touch SimulatorCanvas.jsx critical, NO touch CircuitSolver.js).
Vitest baseline preserve verification post-add.

## Roadmap (post-Andrea ratify)

1. Wire-up `<NewElabSimulator>` mount esp demo → overlay BookGeometryRenderer canvas
2. Implement asset SVG suite (battery9v-vol1-horizontal-clip-right, etc.) from PNG libro reference
3. Bezier curve wire path rendering (vs polyline current)
4. Visual diff tool: screenshot simulator + BookGeometryRenderer overlay vs reference libro PNG
5. Sprint F demo gate automated
