# Workflow Operativo Obbligatorio — ELAB Tutor Demo 25/05/2026

**Mandato Andrea 24/05/2026 PM**: ogni esperimento nasce dal libro, non dal simulatore.

## Principio cardinale

> Il riferimento primario è sempre la cartella volumi PDF MD o manuali PDF MD.
> Il workflow non è "guardare il PDF e rifare più o meno il circuito",
> ma una procedura sistematica di confronto geometrico, visivo, elettrico,
> didattico e interattivo tra manuale e simulatore.

## Scope congelato (7 esp demo locked)

| ID | Vol | Cap | Titolo | Pagine libro |
|----|-----|-----|--------|--------------|
| `v1-cap6-esp1` | 1 | 6 | Primo LED | 29-31 |
| `v1-cap6-esp2` | 1 | 6 | LED senza resistore | 32 |
| `v1-cap6-esp3` | 1 | 6 | Cambiare luminosità | 33 |
| `v2-cap7-esp1` | 2 | 7 | Scarica condensatore + multimetro | 67-68 |
| `v2-cap7-esp2` | 2 | 7 | Scarica con LED rosso | 69-70 |
| `v3-cap6-esp4` | 3 | 6 | Due LED alternati | 54-56 |
| `v3-cap6-esp5` | 3 | 6 | Semaforo | 57-59 |

Non migliorare genericamente tutti gli esperimenti. Rendere questi sette PERFETTI.

## Pipeline 15 fasi

```
1. manual-indexer
2. reference-cropper
3. geometry-annotator
4. breadboard-calibrator
5. asset-inspector
6. wire-path-editor
7. bookgeometry-generator
8. netlist-auditor
9. step-state-validator
10. bookgeometry-renderer
11. simulator capture
12. visual diff
13. responsive compactness test
14. UNLIM context test
15. demo gate
```

Non saltare fasi.

## Fase 0 — Scope locked

Lista chiusa 7 esp (sopra). `DEMO_MODE_ENABLED=true` in `src/data/demo-mode.js`.
Filter applicato a tutti i picker UI + findExperimentById STRICT.

## Fase 1 — Scheda canonica per esperimento

`docs/demo-audit/<esp-id>.md` per ciascuno dei 7:

```markdown
# Audit demo — <esp-id>

## Identità
Volume:
Capitolo:
Esperimento:
Titolo libro:
Titolo app:
ID repository:
Pagine PDF:
Screenshot reference:
File dati app:

## Stato demo
P0 bloccante:
P1 importante:
P2 rifinitura:

## Verdetto
Non pronto / quasi pronto / pronto demo
```

## Fase 2 — Riferimento manuale esatto

Per ogni esp identificare:
- volume, capitolo, numero esperimento
- pagina iniziale, finale
- immagini circuito (tutti gli stati)
- stato iniziale, intermedi, finale

## Fase 3 — Estrazione immagini reference

```
reference/
  vol1/
    v1-cap6-esp1/
      page-030-full.png
      page-030-step-01.png
      ...
      manifest.json
  vol2/...
  vol3/...
```

Crop: solo circuito, no testo, sempre stessa scala, nomenclatura coerente.

Manifest schema:
```json
{
  "experimentId": "v1-cap6-esp1",
  "volume": 1,
  "chapter": 6,
  "bookPages": [30, 31],
  "references": [
    {
      "id": "step-01-positive",
      "page": 30,
      "file": "page-030-step-01.png",
      "description": "Batteria 9V collegata al positivo rail superiore"
    }
  ]
}
```

## Fase 4 — Analisi geometrica generale

Per ogni esp documentare:
- breadboard: posizione, orientamento, scala, simmetria, rail visibili
- batteria/Arduino: posizione, distanza, orientamento, entrata cavi, scala relativa
- direzione lettura: sx→dx, alto→basso, compattezza
- centro visivo: breadboard / LED / multimetro / Arduino

## Fase 5 — Analisi componente per componente

Tabella per ogni componente:

| ID libro | Tipo | Colore/valore | Posizione | Orientamento | Scala | Asset compat? | Note |

Verificare 12 punti:
1. presente nel libro?
2. presente nel simulatore?
3. stessa forma?
4. stesso colore?
5. stesso valore?
6. orientato uguale?
7. stessa zona?
8. stessa scala?
9. pin negli stessi fori?
10. gambe dritte/curve/inclinate?
11. copre fori visibili nel libro?
12. serve nuovo asset?

Classificazione: OK / FIX / ASSET / BLOCKER

## Fase 6 — Breadboard + coordinate

### 6.1 Calibrazione famiglia immagine
- `vol1-breadboard-horizontal`
- `vol2-large-breadboard`
- `vol3-breakout-breadboard`

Schema:
```json
{
  "breadboardModel": "vol1-half-book",
  "origin": { "a1": { "x": 0, "y": 0 } },
  "pitch": { "column": 7.5, "row": 7.5 },
  "rows": {
    "top": ["a", "b", "c", "d", "e"],
    "bottom": ["f", "g", "h", "i", "j"]
  },
  "rails": { "topPlus": {}, "topMinus": {}, "bottomPlus": {}, "bottomMinus": {} }
}
```

### 6.2 Coordinate relative non assolute

❌ Errore:
```json
"led1": { "x": 181.5, "y": 68.75 }
```

✅ Corretto:
```json
"led1": {
  "anchor": "bb1",
  "pins": { "anode": "f9", "cathode": "f10" },
  "pose": {
    "rotation": 0,
    "bodyOffset": { "x": 0, "y": -32 },
    "legStyle": "book-curved-vol1"
  }
}
```

## Fase 7 — Analisi cavi (critica)

Per ogni cavo scheda completa:
```
Colore:
Partenza libro / elettrica:
Arrivo libro / elettrica:
Visibile nel libro?
Visibile nel simulatore?
Forma: diritto / U / L / morbido / angolare / diagonale
Numero curve + punti intermedi:
Passa sopra/sotto componenti?
Copre fori?
Lunghezza relativa:
Gravità problema:
```

## Fase 8 — Separare connessioni elettriche e geometria visibile

**Due livelli distinti**:

### Livello 1 — Netlist elettrica (cosa è collegato davvero)
```json
{
  "from": "r1:pin2",
  "to": "led1:anode",
  "electrical": true
}
```

### Livello 2 — Geometria visibile (cosa si vede nel libro)
```json
{
  "id": "wire-battery-positive",
  "visible": true,
  "color": "red",
  "path": [
    { "x": 108, "y": 90 },
    { "x": 130, "y": 82 },
    { "x": 420, "y": 82 },
    { "x": 420, "y": 120 }
  ]
}
```

**Regola**: non tutto ciò che è elettricamente collegato deve diventare un filo visibile.

## Fase 9 — Scrivere `bookGeometry`

`src/data/book-geometry/<esp-id>.bookGeometry.json` schema completo:

```json
{
  "experimentId": "v1-cap6-esp1",
  "source": {
    "volume": 1,
    "pages": [30, 31],
    "referenceImages": ["reference/vol1/v1-cap6-esp1/page-030-step-01.png"]
  },
  "scene": {
    "width": 900,
    "height": 300,
    "anchor": "bb1",
    "background": "book-light-green"
  },
  "components": {
    "bat1": {
      "type": "battery9v",
      "asset": "battery9v-vol1-horizontal",
      "x": 40, "y": 62, "rotation": 0, "locked": true
    },
    "led1": {
      "type": "led",
      "color": "red",
      "asset": "led-book-curved-red",
      "pins": { "anode": "bb1:f9", "cathode": "bb1:f10" },
      "pose": {
        "bodyOffset": { "x": 0, "y": -28 },
        "legStyle": "vol1-curved"
      }
    }
  },
  "visibleWires": [
    {
      "id": "wire-positive-main",
      "color": "red",
      "from": "bat1:positive",
      "to": "bb1:topPlusRail",
      "pathStyle": "bezier",
      "points": [
        { "x": 400, "y": 105 },
        { "x": 430, "y": 70 },
        { "x": 800, "y": 70 },
        { "x": 800, "y": 115 }
      ]
    }
  ],
  "hiddenElectricalConnections": [
    {
      "id": "r1-to-led1",
      "from": "r1:pin2",
      "to": "led1:anode",
      "reason": "Collegamento implicito tramite breadboard, non filo visibile."
    }
  ],
  "steps": [
    {
      "id": "step-01",
      "visibleComponents": ["bat1", "bb1"],
      "visibleWires": ["wire-positive-main"],
      "instruction": "Collega il positivo della batteria alla rail rossa superiore."
    }
  ]
}
```

## Fase 10 — Passo-passo dalla geometria finale

**Regola**: la modalità passo-passo NON deve generare geometria diversa.
Deve rivelare progressivamente la stessa scena canonica.

```json
"steps": [
  { "id": "s1", "show": ["bat1", "bb1", "wire-positive-main"], "hide": ["r1", "led1"] },
  { "id": "s2", "show": [...prev, "r1"], "activeTargets": ["r1"] },
  { "id": "s3", "show": [...prev, "led1"], "activeTargets": ["led1"] },
  { "id": "s4", "show": [...prev, "wire-negative-led"], "activeTargets": ["wire-negative-led"] }
]
```

## Fase 11 — Spostamenti, rotazioni, compattezza

Due stati per oggetto:
```json
{
  "canonicalPose": { "anchor": "bb1", "x": 120, "y": 80, "rotation": 0 },
  "userPose": { "x": 132, "y": 88, "rotation": 0 },
  "snapTolerance": { "positionPx": 18, "rotationDeg": 10 }
}
```

Logica:
- canonical layout = libro
- actual layout = utente
- validation = confronto
- next step = calcolato dalla build sequence

## Fase 12 — Validazione elettrica

Checklist:
- batteria, rail positiva/negativa corrette
- LED polarizzato correttamente
- resistore in serie
- condensatore polarizzato + verso giusto
- pulsante a cavallo gap centrale
- multimetro parallelo/serie corretto
- pin Arduino coerenti con codice
- simulazione corretta

Doppia per Volume 3: geometria + coerenza codice/pin.

## Fase 13 — Validazione didattica

- studente capisce cosa succede?
- libro e simulatore coincidono?
- UNLIM spiega in base a stato corrente?
- passo successivo ovvio?
- componente importante evidenziato?
- comportamento fisico visibile?

## Fase 14 — Screenshot e visual diff

```
artifacts/demo-captures/
  v1-cap6-esp1/
    tutor-step-01.png
    tutor-step-02.png
    tutor-final.png
    diff-step-01.png
    diff-final.png
```

Classificazione: PASS / WARN / FAIL / BLOCK.

## Fase 15 — Demo gate finale

```markdown
## Libro
[ ] riferimento PDF trovato
[ ] pagine corrette
[ ] crop generati
[ ] step libro identificati

## Geometria
[ ] breadboard uguale
[ ] batteria/Arduino uguale
[ ] componenti uguali
[ ] fili uguali
[ ] curve fili uguali
[ ] nessun filo extra
[ ] nessun componente extra

## Elettrica
[ ] netlist corretta
[ ] polarità corretta
[ ] valori corretti
[ ] codice coerente
[ ] simulazione funzionante

## Passo-passo
[ ] parte smontato
[ ] procede correttamente
[ ] non cambia geometria
[ ] prossimo esperimento resta in passo-passo
[ ] annotazioni manuale restano funzionanti

## Demo
[ ] screenshot approvato
[ ] responsive approvato
[ ] UNLIM coerente
[ ] nessun errore in console
```

P0 fallisce → esperimento NON entra in demo.

## Skills (procedure agentiche riusabili)

```
skills/
  elab-manual-locator/          # trova riferimento libro
  elab-geometry-auditor/        # confronto geometrico
  elab-bookgeometry-writer/     # scrive bookGeometry
  elab-wire-router/             # disegna fili
  elab-electrical-auditor/      # verifica netlist
  elab-stepbuilder/              # passo-passo da geometria
  elab-unlim-context-builder/   # contesto UNLIM
  elab-demo-gate/                # verdetto finale
```

Ogni skill = SKILL.md + schema + examples.

## Plugins (strumenti eseguibili)

```
tools/
  elab-manual-indexer/          # PDF → JSON index
  elab-reference-cropper/       # crop circuit dai PDF
  elab-geometry-annotator/      # UI annotazione componenti+fili
  elab-bookgeometry-generator/  # genera bookGeometry
  elab-wire-editor/             # disegna curve fili
  elab-netlist-auditor/         # verifica elettrica
  elab-visual-diff/             # confronto screenshot
  elab-demo-gate/                # verdetto eseguibile

src/plugins/
  bookGeometry/                  # renderer
  simulatorOverlay/              # diff overlay
  manualSync/                    # collega passo-passo a pagina libro
  unlimContext/                  # contesto UNLIM
```

## MCP server locale per agenti

```
tools/elab-mcp-server/
  Tool: manual.findExperiment
  Tool: manual.renderPage
  Tool: manual.cropReference
  Tool: repo.readExperiment
  Tool: repo.readBookGeometry
  Tool: geometry.createTemplate
  Tool: geometry.validate
  Tool: sim.captureExperiment
  Tool: audit.visualDiff
  Tool: audit.netlist
  Tool: audit.demoGate
```

## Sprint ordinato (NON saltare)

### Sprint A — Fondazione dati
- `manual-index.json`
- reference manifests (7 esp)
- bookGeometry schema
- geometry audit templates
- demo gate template

### Sprint B — Volume 1 LED
- v1-cap6-esp1/esp2/esp3
- asset batteria + breadboard + LED gambe curve + resistore bande corrette
- wire rosso/nero libro

Se Vol1 non perfetto, NON procedere.

### Sprint C — BookGeometry Renderer
- `BookGeometryRenderer.jsx`
- visibleWires + hiddenElectricalConnections
- step visibility
- component states

Solo dopo Sprint B + renderer test su Vol1.

### Sprint D — Volume 3
- v3-cap6-esp4/esp5
- Nano Breakout asset
- wire style angolare corto
- pin-code visual sync

### Sprint E — Volume 2 condensatori
- v2-cap7-esp1/esp2
- multimetro giallo asset
- condensatore orizzontale asset
- pulsante 4-pin
- stato carica/scarica
- LED fading
- display multimetro animato

### Sprint F — Automazione (dopo 3 esp manuali)
- visual diff
- demo gate
- step validator
- responsive test

Automatizzare troppo presto = automatizzare errori.

## Prompt operativo agente

```
Devi correggere l'esperimento ELAB Tutor [ID].

Non iniziare dal codice. Inizia dal manuale ufficiale.

1. Trova volume, capitolo, pagine, immagini esperimento.
2. Elenca stati visivi del circuito nel libro.
3. Analizza layout generale: breadboard, batteria/Arduino, componenti principali.
4. Analizza ogni componente: tipo, colore, valore, orientamento, scala, posizione, pin.
5. Analizza ogni cavo: colore, partenza, arrivo, curva, lunghezza, punti intermedi, visibilità.
6. Distingui connessioni elettriche da fili visibili.
7. Confronta con dati attuali repository.
8. Classifica ogni differenza come P0, P1, P2.
9. Scrivi o aggiorna bookGeometry.
10. Non aggiungere fili visibili se libro non li mostra.
11. Non cambiare geometria tra passo-passo e già montato.
12. Breadboard resta ancora principale.
13. Circuito resta compatto su resize, pan, zoom, rotazione, traslazione.
14. Verifica netlist elettrica.
15. Verifica codice/pin per Arduino.
16. Genera report finale con file modificati + motivazione.

Output obbligatorio:
- manual reference
- geometry audit
- electrical audit
- modifiche dati
- screenshot/diff
- demo verdict
```

## Cose da NON fare

AI generativa NON deve decidere autonomamente:
- pin
- polarità
- curve definitive fili
- posizione finale componenti
- valori elettrici

I circuiti devono essere DETERMINISTICI.

AI può:
- riassumere differenze
- generare checklist
- scrivere audit
- proporre coordinate iniziali
- generare fumetto/diario

## Verdetto

❌ Workflow sbagliato: apro esperimento → aggiusto layout → vedo se funziona

✅ Workflow corretto:
```
manuale → crop → annotazione → geometria canonica →
netlist → step → renderer → diff → gate demo
```

Skills = ragionamento ripetibile.
Plugins = correzioni misurabili.
Demo gate = blocco esperimenti non pronti.
bookGeometry = uniche source of truth visiva.

Senza queste 4 cose: il simulatore continuerà a essere elettricamente
simile ma visivamente diverso dal libro.

---

## Stato corrente sessione 23-24/05/2026

**Branch**: `feat/demo-25may`
**Live**: https://www.elabtutor.school
**Commits**: 17 (round 1-16 sessione)
**Demo filter**: STRICT (7 esp visibili, altri nascosti)
**Tests**: 263/263 lavagna + 251/251 simulator + 18/18 index

**Topology baked**:
- v1-cap6-esp1/2/3: led-bridge col 7, R a2-a7 (5-col span)
- v2-cap7-esp1: cap+btn 4-pin+MM (NO R)
- v2-cap7-esp2: cap+btn+R a14-a19+LED col 19+MM
- v3-cap6-esp4/5: base origin/main (DA RIFARE con workflow nuovo)

**Componenti SVG aggiornati**:
- Battery9V pins clip (9,-30)+(9,-10), bbox 85x40+ox/oy
- Resistor pin distance 5 col (37.5px), body 8px, leads 14.75px
- LED splay+ + LedBridge variant pins x=0
- COMP_SIZES includes led-bridge

**Bug residui post-demo**:
- Vol1 bb verticale (PlacementEngine coord rotation)
- Auto-save persistence
- Color picker draggable
- Multimetro discharge path

## Prossima sessione

Use this doc as canonical workflow.
Andrea descrive → Claude bake + applica workflow 15 fasi.

```
Riprendo sessione demo 25/05/2026 sera.

Leggi PRIMA:
1. /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25/docs/demo-25may-workflow-v2.md (workflow obbligatorio)
2. /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25/docs/demo-25may-handoff.md (stato sessione)

Sito LIVE: https://www.elabtutor.school
Branch: feat/demo-25may

Andrea verbatim mandate:
- "FAI UN LAVORO IMPECCABILE. NON COMPIACERMI"
- "ogni esperimento nasce dal libro, non dal simulatore"
- "il riferimento primario è sempre la cartella volumi PDF MD"
- "il workflow non è guardare il PDF e rifare più o meno il circuito"

7 esp demo locked (NON migliorare altri):
- v1-cap6-esp1/2/3 (Vol1 cap6 pag.29-33)
- v2-cap7-esp1/2 (Vol2 cap7 pag.67-70)
- v3-cap6-esp4/5 (Vol3 cap6 pag.54-59)

Workflow pipeline 15 fasi (NON saltare):
1.manual-indexer → 2.reference-cropper → 3.geometry-annotator →
4.breadboard-calibrator → 5.asset-inspector → 6.wire-path-editor →
7.bookgeometry-generator → 8.netlist-auditor → 9.step-state-validator →
10.bookgeometry-renderer → 11.simulator-capture → 12.visual-diff →
13.responsive-test → 14.unlim-context-test → 15.demo-gate

Caveman mode active. Use codex/impeccable/ultrathink/plugin-creator/skill-creator
quando necessario.

Andrea DESCRIVE topologia libro, io BAKE bookGeometry.
Andrea NON monta — Andrea verifica risultato.

Sprint corrente: A (fondazione dati) — manual-index + reference manifests +
bookGeometry schema + audit templates.

Continua da audit Sprint A o fix specifici Andrea segnala.
```
