# Vol2 Inline Functional Test (Phase 2)

- Started: 2026-05-07T02:42:04Z (mega-loop start)
- Completed: 2026-05-07T02:42:58Z (~54s for 27 esperimenti)
- Source: prod https://www.elabtutor.school/#lavagna
- Tool: Claude in Chrome MCP (browser_batch + javascript_exec)
- Browser tabId: 1259340882
- Spec: docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md
- Plan: docs/superpowers/plans/2026-05-07-sprint-u-cycle2-vol2-audit.md

## Methodology

Mega-loop async via JS:
1. `await __ELAB_API.mountExperiment(id)` per ogni id Vol2
2. wait 1500ms
3. `__ELAB_API.getLayout()` → components, connections arrays
4. `__ELAB_API.getCircuitDescription()` → human-readable string
5. `await __ELAB_API.captureScreenshot()` → base64 PNG (12KB avg)
6. Stored full data in `window.__VOL2_AUDIT[]`, retrieved metadata via 1000-char chunks

**Screenshot decision (honest scope reduction)**: per-esperimento screenshot save to disk attempted via base64 download trigger AND `mcp__Claude_in_Chrome__computer save_to_disk:true` — both methods unreliable in this environment (download trigger requires UI, save_to_disk returns ID not file path). Decided pragmatic compromise: representative screenshots taken for 2-3 esperimenti only (cap3-esp1 + cap6-esp4 + cap12-esp1) instead of 27. Per-esperimento metadata (mount, components, connections, desc) is sufficient evidence for audit purposes.

## Summary Statistics

- Mount success: **27/27** (100%)
- Errors: **0/27**
- Captured screenshot data (base64 in browser): **27/27**
- Zero connections_count: **9/27** (5 anomalous cap4+cap5; 4 expected cap3 multimetro-only)

## Anomaly Pattern: Zero Connections

| Esperimento | components_count | connections_count | Expected per PDF | Status |
|-------------|------------------|-------------------|------------------|--------|
| v2-cap3-esp1 | 2 (bat+mm) | 0 | 0 (puntali only) | ✓ OK |
| v2-cap3-esp2 | 2 (bat+mm) | 0 | 0 (puntali only) | ✓ OK |
| v2-cap3-esp3 | 2 (R+mm) | 0 | 0 (puntali on R) | ✓ OK |
| v2-cap3-esp4 | 4 (bat+bb+R+mm) | 0 | ~3-4 (full circuit + ammeter) | ⚠️ ANOMALY |
| v2-cap4-esp1 | 4 (bb+2R+mm) | 0 | ~4-6 (parallel on breadboard) | ⚠️ ANOMALY |
| v2-cap4-esp2 | 5 (bb+3R+mm) | 0 | ~5-7 (series on breadboard) | ⚠️ ANOMALY |
| v2-cap4-esp3 | 6 (bat+bb+3R+mm) | 0 | ~6-8 (partitore + measurement) | ⚠️ ANOMALY |
| v2-cap5-esp1 | 3 (2bat+mm) | 0 | 0 (batterie serie via puntali) | ✓ OK |
| v2-cap5-esp2 | 3 (2bat+mm) | 0 | 0 (batterie antiserie via puntali) | ✓ OK |

**Anomaly count**: **4/27** esperimenti hanno componenti che richiedono wires breadboard ma `connections_count: 0`. Il `desc` conferma "Nessun filo collegato sulla breadboard" — esperimenti pre-built incompleti dal punto di vista wiring runtime, OR API non espone wire definitions di certi esperimenti.

Per cap3-esp4, cap4-esp1..esp3: PDF richiede circuiti completi su breadboard ma simulator presenta componenti slegati. Studente deve aggiungere wires manualmente OR esperimento è broken.

## Results — 27 Esperimenti

## v2-cap3-esp1
- mounted: true
- components_count: 2
- connections_count: 0
- components_list: bat1:battery9v, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 3 Esp. 1 - Controlliamo la carica della batteria\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 12246
- live_issue: null (puntali multimetro design — no breadboard wires expected)
- screenshot_evidence: docs/audits/screenshots/task5-vol2-cap3-esp1.png (representative)
- ts: 2026-05-07T02:42:06.011Z

## v2-cap3-esp2
- mounted: true
- components_count: 2
- connections_count: 0
- components_list: bat1:battery9v, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 3 Esp. 2 - Diario di misurazione della pila\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 12246
- live_issue: null (puntali multimetro design)
- ts: 2026-05-07T02:42:08.008Z

## v2-cap3-esp3
- mounted: true
- components_count: 2
- connections_count: 0
- components_list: r1:resistor, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 3 Esp. 3 - Misuriamo una resistenza\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): resistore (r1), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 12146
- live_issue: null (puntali su R, no breadboard wires)
- ts: 2026-05-07T02:42:10.227Z

## v2-cap3-esp4
- mounted: true
- components_count: 4
- connections_count: 0
- components_list: bat1:battery9v, bb1:breadboard-half, r1:resistor, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 3 Esp. 4 - Misuriamo la corrente in un circuito\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), resistore (r1), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 10934
- live_issue: ⚠️ ANOMALY — bb1 presente ma 0 wires; PDF richiede circuito chiuso bat+R+amperometro
- ts: 2026-05-07T02:42:12.083Z

## v2-cap4-esp1
- mounted: true
- components_count: 4
- connections_count: 0
- components_list: bb1:breadboard-half, r1:resistor, r2:resistor, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 4 Esp. 1 - Due resistori in parallelo\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): resistore (r1), resistore (r2), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 10622
- live_issue: ⚠️ ANOMALY — bb1+2R presenti ma 0 wires parallel
- ts: 2026-05-07T02:42:14.025Z

## v2-cap4-esp2
- mounted: true
- components_count: 5
- connections_count: 0
- components_list: bb1:breadboard-half, r1:resistor, r2:resistor, r3:resistor, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 4 Esp. 2 - Tre resistori in serie\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): resistore (r1), resistore (r2), resistore (r3), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 10798
- live_issue: ⚠️ ANOMALY — bb1+3R presenti ma 0 wires serie
- ts: 2026-05-07T02:42:16.038Z

## v2-cap4-esp3
- mounted: true
- components_count: 6
- connections_count: 0
- components_list: bat1:battery9v, bb1:breadboard-half, r1:resistor, r2:resistor, r3:resistor, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 4 Esp. 3 - Partitore di tensione\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), resistore (r1), resistore (r2), resistore (r3), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 11350
- live_issue: ⚠️ ANOMALY — bat+bb+3R presenti ma 0 wires partitore
- ts: 2026-05-07T02:42:18.026Z

## v2-cap5-esp1
- mounted: true
- components_count: 3
- connections_count: 0
- components_list: bat1:battery9v, bat2:battery9v, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 5 Esp. 1 - Batterie in serie (più spinta!)\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), batteria 9V (bat2), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 12738
- live_issue: null (batterie congiunte via puntali, no breadboard wires by design)
- ts: 2026-05-07T02:42:20.010Z

## v2-cap5-esp2
- mounted: true
- components_count: 3
- connections_count: 0
- components_list: bat1:battery9v, bat2:battery9v, mm1:multimeter
- connections_list: (none)
- desc: "Esperimento: \"Cap. 5 Esp. 2 - Batterie in antiserie\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), batteria 9V (bat2), multimetro (mm1). Nessun filo collegato sulla breadboard."
- screenshot_b64_length: 12738
- live_issue: null (puntali design)
- ts: 2026-05-07T02:42:22.010Z

## v2-cap6-esp1
- mounted: true
- components_count: 5
- connections_count: 6
- components_list: bat1:battery9v, bb1:breadboard-half, r1:resistor, led1:led, led2:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-5→bb1:a5; bb1:a12→bb1:a14; bb1:a15→bb1:a18; bb1:a19→bb1:bus-top-minus-19; bb1:bus-top-minus-1→bat1:negative
- desc: "Esperimento: \"Cap. 6 Esp. 1 - LED in serie con 1 resistore\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), resistore (r1), LED [acceso] (led1), LED [acceso] (led2). Fili: 6 collegamenti sulla breadboard."
- screenshot_b64_length: 11134
- live_issue: null (LED acceso, circuit chiuso)
- ts: 2026-05-07T02:42:24.195Z

## v2-cap6-esp2
- mounted: true
- components_count: 5
- connections_count: 6
- components_list: bat1:battery9v, bb1:breadboard-half, r1:resistor, led1:led, led2:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-5→bb1:a5; bb1:a12→bb1:a14; bb1:a15→bb1:a18; bb1:a19→bb1:bus-top-minus-19; bb1:bus-top-minus-1→bat1:negative
- desc: "Esperimento: \"Cap. 6 Esp. 2 - LED in serie colori diversi\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), resistore (r1), LED [acceso] (led1), LED [acceso] (led2). Fili: 6 collegamenti sulla breadboard."
- screenshot_b64_length: 11150
- live_issue: null
- ts: 2026-05-07T02:42:26.039Z

## v2-cap6-esp3
- mounted: true
- components_count: 6
- connections_count: 6
- components_list: bat1:battery9v, bb1:breadboard-half, r1:resistor, led1:led, led2:led, led3:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-3→bb1:a3; bb1:a11→bb1:a17; bb1:a18→bb1:a22; bb1:a23→bb1:bus-top-minus-23; bb1:bus-top-minus-1→bat1:negative
- desc: "Esperimento: \"Cap. 6 Esp. 3 - Tre LED in serie\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), resistore (r1), LED [acceso] (led1), LED [acceso] (led2), LED [acceso] (led3). Fili: 6 collegamenti sulla breadboard."
- screenshot_b64_length: 11586
- live_issue: null
- ts: 2026-05-07T02:42:28.029Z

## v2-cap6-esp4
- mounted: true
- components_count: 5
- connections_count: 8
- components_list: bat1:battery9v, bb1:breadboard-half, r1:resistor, led1:led, mm1:multimeter
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-2→bb1:a2; bb1:e9→bb1:f9; bb1:f10→bb1:e10; bb1:e10→bb1:bus-top-minus-10; bb1:bus-top-minus-1→bat1:negative; mm1:probe-positive→bb1:f9; mm1:probe-negative→bb1:f10
- desc: "Esperimento: \"Cap. 6 Esp. 4 - Misurare Vf con multimetro\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), resistore (r1), LED [acceso] (led1), multimetro (mm1). Fili: 8 collegamenti sulla breadboard."
- screenshot_b64_length: 11402
- live_issue: ⚠️ NOTE — Maker-1 audit flag HIGH: "PDF Vol.2 cap6 esp4 usa multimetro 'prova diodi/continuità' funzione SENZA alimentazione (coccodrilli direct). Code invece costruisce full circuit con bb+8 fili = methodology divergente."
- screenshot_evidence: docs/audits/screenshots/task5-vol2-cap6-esp4.png (representative)
- ts: 2026-05-07T02:42:30.029Z

## v2-cap7-esp1
- mounted: true
- components_count: 6
- connections_count: 9
- components_list: bat1:battery9v, bb1:breadboard-half, c1:capacitor, btn1:push-button, r1:resistor, mm1:multimeter
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-10→bb1:a10; bb1:g12→bb1:c5; bb1:a5→bb1:a16; bb1:a23→bb1:bus-top-minus-23; bb1:a6→bb1:bus-top-minus-6; bb1:bus-top-minus-1→bat1:negative; mm1:probe-positive→bb1:b5; mm1:probe-negative→bb1:b6
- desc: "Esperimento: \"Cap. 7 Esp. 1 - Scarica condensatore + multimetro\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), condensatore (c1), push-button (btn1), resistore (r1), multimetro (mm1). Fili: 9 collegamenti sulla breadboard."
- screenshot_b64_length: 12090
- live_issue: null
- ts: 2026-05-07T02:42:32.055Z

## v2-cap7-esp2
- mounted: true
- components_count: 7
- connections_count: 10
- components_list: bat1:battery9v, bb1:breadboard-half, c1:capacitor, btn1:push-button, led1:led, r1:resistor, mm1:multimeter
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-10→bb1:a10; bb1:a6→bb1:bus-top-minus-6; bb1:bus-top-minus-1→bat1:negative; bb1:g12→bb1:c5; bb1:a5→bb1:a15; bb1:a22→bb1:a23; bb1:a24→bb1:bus-top-minus-24; mm1:probe-positive→bb1:b5; mm1:probe-negative→bb1:b6
- desc: "Esperimento: \"Cap. 7 Esp. 2 - Scarica con LED rosso\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), condensatore (c1), push-button (btn1), LED [spento] (led1), resistore (r1), multimetro (mm1). Fili: 10 collegamenti sulla breadboard."
- screenshot_b64_length: 12410
- live_issue: ⚠️ NOTE — LED spento iniziale (atteso, è scarica RC ramp-down)
- ts: 2026-05-07T02:42:34.036Z

## v2-cap7-esp3
- mounted: true
- components_count: 8
- connections_count: 11
- components_list: bat1:battery9v, bb1:breadboard-half, c1:capacitor, c2:capacitor, c3:capacitor, btn1:push-button, r1:resistor, led1:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-14→bb1:a14; bb1:g16→bb1:a3; bb1:a3→bb1:a7; bb1:a7→bb1:a10; bb1:a4→bb1:bus-top-minus-4; bb1:a8→bb1:bus-top-minus-8; bb1:a11→bb1:bus-top-minus-11; bb1:bus-top-minus-1→bat1:negative; bb1:a10→bb1:a19; bb1:a27→bb1:bus-top-minus-27
- desc: "Esperimento: \"Cap. 7 Esp. 3 - Condensatori in parallelo\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), condensatore (c1), condensatore (c2), condensatore (c3), push-button (btn1), resistore (r1), LED [spento] (led1). Fili: 11 collegamenti sulla breadboard."
- screenshot_b64_length: 12118
- live_issue: null
- ts: 2026-05-07T02:42:36.030Z

## v2-cap7-esp4
- mounted: true
- components_count: 7
- connections_count: 10
- components_list: bat1:battery9v, bb1:breadboard-half, c1:capacitor, btn1:push-button, r1:resistor, led1:led, mm1:multimeter
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-10→bb1:a10; bb1:a6→bb1:bus-top-minus-6; bb1:bus-top-minus-1→bat1:negative; bb1:g12→bb1:c5; bb1:a5→bb1:a15; bb1:a22→bb1:a23; bb1:a24→bb1:bus-top-minus-24; mm1:probe-positive→bb1:b5; mm1:probe-negative→bb1:b6
- desc: "Esperimento: \"Cap. 7 Esp. 4 - Variare R nella scarica RC\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), condensatore (c1), push-button (btn1), resistore (r1), LED [spento] (led1), multimetro (mm1). Fili: 10 collegamenti sulla breadboard."
- screenshot_b64_length: 12410
- live_issue: ⚠️ NOTE — Maker-2 audit flag MEDIUM: "Stesso circuito di cap7-esp2 (10 wires), R fissa 1000 identica. 'Variazione R' non parametrizzata strutturalmente."
- ts: 2026-05-07T02:42:38.028Z

## v2-cap8-esp1
- mounted: true
- components_count: 5
- connections_count: 7
- components_list: bat1:battery9v, bb1:breadboard-half, mos1:mosfet-n, r1:resistor, led1:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-5→bb1:a5; bb1:a12→bb1:a14; bb1:a15→bb1:g18; bb1:g19→bb1:bus-top-minus-19; bb1:bus-top-minus-1→bat1:negative; bb1:bus-top-plus-17→bb1:g17
- desc: "Esperimento: \"Cap. 8 Esp. 1 - MOSFET come interruttore\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), MOSFET [acceso] (mos1), resistore (r1), LED [acceso] (led1). Fili: 7 collegamenti sulla breadboard."
- screenshot_b64_length: 11102
- live_issue: null
- ts: 2026-05-07T02:42:40.030Z

## v2-cap8-esp2
- mounted: true
- components_count: 5
- connections_count: 5
- components_list: bat1:battery9v, bb1:breadboard-half, mos1:mosfet-n, r1:resistor, led1:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-5→bb1:a5; bb1:a13→bb1:g19; bb1:g20→bb1:bus-top-minus-20; bb1:bus-top-minus-1→bat1:negative
- desc: "Esperimento: \"Cap. 8 Esp. 2 - MOSFET e carica del corpo\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), MOSFET [spento] (mos1), resistore (r1), LED [spento] (led1). Fili: 5 collegamenti sulla breadboard."
- screenshot_b64_length: 10798
- live_issue: null (MOSFET off, atteso senza carica)
- ts: 2026-05-07T02:42:42.042Z

## v2-cap8-esp3
- mounted: true
- components_count: 7
- connections_count: 10
- components_list: bat1:battery9v, bb1:breadboard-half, mos1:mosfet-n, pot1:potentiometer, r1:resistor, led1:led, mm1:multimeter
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-5→bb1:a5; bb1:a13→bb1:g18; bb1:g19→bb1:bus-top-minus-19; bb1:bus-top-minus-1→bat1:negative; bb1:bus-top-plus-24→bb1:g24; bb1:g25→bb1:g17; bb1:g26→bb1:bus-top-minus-26; mm1:probe-positive→bb1:h17; mm1:probe-negative→bb1:bus-top-minus-27
- desc: "Esperimento: \"Cap. 8 Esp. 3 - MOSFET: l'interruttore magico\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), MOSFET [acceso] (mos1), potenziometro (pot1), resistore (r1), LED [acceso] (led1), multimetro (mm1). Fili: 10 collegamenti sulla breadboard."
- screenshot_b64_length: 12550
- live_issue: null
- ts: 2026-05-07T02:42:44.167Z

## v2-cap9-esp1
- mounted: true
- components_count: 5
- connections_count: 7
- components_list: bat1:battery9v, bb1:breadboard-half, pt1:phototransistor, r1:resistor, mm1:multimeter
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-8→bb1:a8; bb1:a9→bb1:a14; bb1:a21→bb1:bus-top-minus-21; bb1:bus-top-minus-1→bat1:negative; mm1:probe-positive→bb1:b9; mm1:probe-negative→bb1:bus-top-minus-25
- desc: "Esperimento: \"Cap. 9 Esp. 1 - Fototransistor come sensore\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), phototransistor (pt1), resistore (r1), multimetro (mm1). Fili: 7 collegamenti sulla breadboard."
- screenshot_b64_length: 11250
- live_issue: null
- ts: 2026-05-07T02:42:46.029Z

## v2-cap9-esp2
- mounted: true
- components_count: 10
- connections_count: 12
- components_list: bat1:battery9v, bb1:breadboard-half, pt1:phototransistor, mos1:mosfet-n, r1:resistor, r2:resistor, r3:resistor, r4:resistor, r5:resistor, led1:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-3→bb1:a3; bb1:bus-top-plus-20→bb1:a20; bb1:bus-top-minus-1→bat1:negative; bb1:a10→bb1:g3; bb1:a11→bb1:g11; bb1:g18→bb1:bus-top-minus-18; bb1:g10→bb1:g20; bb1:g20→bb1:g28; bb1:g27→bb1:bus-top-minus-27; bb1:a28→bb1:g29; bb1:g30→bb1:bus-top-minus-30
- desc: "Esperimento: \"Cap. 9 Esp. 2 - Luce notturna automatica\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), phototransistor (pt1), MOSFET [spento] (mos1), resistore (r1), resistore (r2), resistore (r3), resistore (r4), resistore (r5), LED [spento] (led1). Fili: 12 collegamenti sulla breadboard."
- screenshot_b64_length: 11902
- live_issue: null
- ts: 2026-05-07T02:42:48.029Z

## v2-cap10-esp1
- mounted: true
- components_count: 3
- connections_count: 4
- components_list: bat1:battery9v, bb1:breadboard-half, mot1:motor-dc
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-5→bb1:a5; bb1:a10→bb1:bus-top-minus-10; bb1:bus-top-minus-1→bat1:negative
- desc: "Esperimento: \"Cap. 10 Esp. 1 - Far girare il motore\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), motore DC [acceso] (mot1). Fili: 4 collegamenti sulla breadboard."
- screenshot_b64_length: 10278
- live_issue: null
- ts: 2026-05-07T02:42:50.039Z

## v2-cap10-esp2
- mounted: true
- components_count: 3
- connections_count: 4
- components_list: bat1:battery9v, bb1:breadboard-half, mot1:motor-dc
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-5→bb1:a5; bb1:a10→bb1:bus-top-minus-10; bb1:bus-top-minus-1→bat1:negative
- desc: "Esperimento: \"Cap. 10 Esp. 2 - Invertire la rotazione\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), motore DC [acceso] (mot1). Fili: 4 collegamenti sulla breadboard."
- screenshot_b64_length: 10278
- live_issue: ⚠️ NOTE — circuito IDENTICO a cap10-esp1 (stessi 4 wires, stesso motor "acceso"). "Invertire" non rappresentato strutturalmente; richiederebbe wire swap interactive da utente.
- ts: 2026-05-07T02:42:52.027Z

## v2-cap10-esp3
- mounted: true
- components_count: 4
- connections_count: 5
- components_list: bat1:battery9v, bb1:breadboard-half, btn1:push-button, mot1:motor-dc
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-10→bb1:a10; bb1:g12→mot1:positive; mot1:negative→bb1:bus-top-minus-12; bb1:bus-top-minus-1→bat1:negative
- desc: "Esperimento: \"Cap. 10 Esp. 3 - Motore con pulsante\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), push-button (btn1), motore DC [spento] (mot1). Fili: 5 collegamenti sulla breadboard."
- screenshot_b64_length: 11114
- live_issue: null
- ts: 2026-05-07T02:42:54.045Z

## v2-cap10-esp4
- mounted: true
- components_count: 6
- connections_count: 7
- components_list: bat1:battery9v, bb1:breadboard-half, btn1:push-button, mot1:motor-dc, r1:resistor, led1:led
- connections_list: bat1:positive→bb1:bus-top-plus-1; bb1:bus-top-plus-10→bb1:a10; bb1:g12→mot1:positive; mot1:negative→bb1:bus-top-minus-12; bb1:bus-top-minus-1→bat1:negative; bb1:g12→bb1:a16; bb1:a24→bb1:bus-top-minus-24
- desc: "Esperimento: \"Cap. 10 Esp. 4 - Motore + pulsante + LED indicatore\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), push-button (btn1), motore DC [spento] (mot1), resistore (r1), LED [spento] (led1). Fili: 7 collegamenti sulla breadboard."
- screenshot_b64_length: 11854
- live_issue: null
- ts: 2026-05-07T02:42:56.028Z

## v2-cap12-esp1
- mounted: true
- components_count: 12
- connections_count: 20
- components_list: bat1:battery9v, bb1:breadboard-full, pt1:phototransistor, pt2:phototransistor, mos1:mosfet-n, mos2:mosfet-n, r1:resistor, r2:resistor, d1:diode, d2:diode, mot1:motor-dc, mot2:motor-dc
- connections_list: bat1:positive→bb1:bus-plus-1; bb1:bus-minus-1→bat1:negative; bb1:bus-plus-5→bb1:a5; bb1:a6→bb1:a9; bb1:a16→bb1:bus-minus-16; bb1:bus-plus-19→bb1:a19; bb1:a20→bb1:a23; bb1:a30→bb1:bus-minus-30; bb1:a6→bb1:g21; bb1:a20→bb1:g7; bb1:bus-plus-8→mot1:positive; mot1:negative→bb1:g8; bb1:g9→bb1:bus-minus-9; bb1:g12→bb1:g8; bb1:g13→bb1:bus-plus-13; bb1:bus-plus-22→mot2:positive; mot2:negative→bb1:g22; bb1:g23→bb1:bus-minus-23; bb1:g26→bb1:g22; bb1:g27→bb1:bus-plus-27
- desc: "Esperimento: \"Cap. 12 - Robot Segui Luce\". Simulazione in corso. Componenti sul kit fisico ELAB (breadboard): batteria 9V (bat1), phototransistor (pt1), phototransistor (pt2), MOSFET [acceso] (mos1), MOSFET [acceso] (mos2), resistore (r1), resistore (r2), diodo (d1), diodo (d2), motore DC [acceso] (mot1), motore DC [acceso] (mot2). Fili: 20 collegamenti sulla breadboard."
- screenshot_b64_length: 15062
- live_issue: ⚠️ NOTE — Maker-2 audit flag MEDIUM: "capstone gap meccanici (ruote/supporto-batteria) extra-SVG. Capstone software OK ma kit fisico richiede componenti meccanici aggiuntivi non rappresentati."
- screenshot_evidence: docs/audits/screenshots/task5-vol2-cap12-esp1.png (representative)
- ts: 2026-05-07T02:42:58.248Z

---

## Phase 2 Summary

| Metric | Value |
|--------|-------|
| Esperimenti tested | 27/27 (100%) |
| Mount success | 27/27 (100%) |
| Errors | 0/27 |
| Zero connections (anomalous) | 4/27 (cap3-esp4, cap4-esp1..esp3) |
| Zero connections (by design — multimetro/puntali) | 5/27 (cap3-esp1..esp3, cap5-esp1..esp2) |
| Identical circuit duplicates | 1/27 (cap10-esp2 = cap10-esp1) |
| Methodology divergent vs PDF | 1/27 (cap6-esp4 per Maker-1 HIGH finding) |
| Mechanical gap capstone | 1/27 (cap12-esp1 per Maker-2 MEDIUM finding) |
| Average connections (cap6+) | ~7.4 wires per esperimento |
| Largest experiment | cap12-esp1 (12 components, 20 wires) |

## Top 5 Live Test Issues (severity-ranked)

1. **HIGH — Methodology divergent v2-cap6-esp4** (Maker-1 cross-check): PDF uses multimeter standalone "prova diodi" function with coccodrilli (no power); code builds full breadboard circuit with battery+R+LED+multimeter parallel. Same goal (measure Vf), different approach.
2. **MEDIUM — 4 esperimenti con 0 wires anomali** (cap3-esp4, cap4-esp1..esp3): components present (bat/bb/R/mm) but no breadboard connections. Studente deve costruire wires manualmente OR esperimento broken (TBD by Andrea decision).
3. **MEDIUM — cap10-esp2 circuit identico a cap10-esp1**: "Invertire la rotazione" non rappresentato strutturalmente, stessi 4 wires + motor "acceso". Richiede wire swap interactive utente.
4. **MEDIUM — cap7-esp4 circuit identico a cap7-esp2**: "Variare R nella scarica RC" non parametrizzata — R fissa 1000 stessa di cap7-esp2 (Maker-2 cross-check).
5. **MEDIUM — cap12-esp1 capstone gap meccanico**: Componenti software OK (12 components, 20 wires) ma kit fisico richiede ruote/supporto-batteria/struttura meccanica non rappresentati SVG.

## Anti-Inflation Mandate Compliance (per spec sezione 11)

- ✅ All data measured live via __ELAB_API
- ✅ Mount counts: actual return values from API
- ✅ Component lists: from getLayout() JSON output
- ✅ Connections lists: from getLayout() JSON output
- ✅ Desc strings: verbatim from getCircuitDescription()
- ✅ Timestamps: actual JS Date.toISOString()
- ✅ Screenshot lengths: actual base64 string.length
- ⚠️ Per-esperimento PNG screenshots: NOT saved to disk (technical limitation Claude in Chrome MCP base64 return blocked + headless download fail). Representative 2-3 screenshots taken via mcp__Claude_in_Chrome__computer for evidence. Documented honest scope reduction.
- ✅ NO synthesis: zero connections in cap3-5 documented as observed, not synthesized
