# ARDESIA — ELAB-SCENE-FORGE-CANON (23/06/2026)

> Il moat profondo dell'ELABTutor Pack: ogni circuito dei volumi = **scena fisica fedele** (stessi componenti, stessi fili piegati uguali, montabile/diagnosticabile). Verificato firsthand (`wf_2d42b1b8`, 5 agenti) su `~/VOLUME 3/PRODOTTO/elab-builder` (HEAD `7681789d`). Estende [ELAB-AS-PLUGIN-CANON](ELAB-AS-PLUGIN-CANON.md).

## §0 TL;DR + VERDETTO
- **Geometria: ~60% ESISTE, ~40% greenfield.** Pose componenti + griglia-breadboard ci sono; **il path dei fili NO** (= la metà che definisce il moat).
- **Schema: ESTENDI `CircuitScene` → `circuit-scene/2`, NON forkare** (anti "3 API divergenti").
- **Strategia: HAND-AUTHOR 5 scene PRIMA (consumer prima del producer).** La CV-forge come step-1 = trappola moat-by-artifact (stessa forma del "+0.33").
- **Licenze: lo stack MIT/Apache basta per il percorso minimo; il set AGPL (PyMuPDF, Ultralytics) è veleno** per un prodotto vendibile → quarantena dietro decisione esplicita.

## §1 GROUND TRUTH (file-verificato, HEAD 7681789d)
**1.1 Cosa MEMORIZZA geometria oggi:** pose componente `experiment.layout{x,y}` per componente (`src/data/experiments-vol1.js:66-83`, es. `r1:{x:151.5,y:43.75}`); rotazione runtime-editabile (`SimulatorCanvas.jsx:2406`, `WireRenderer.jsx:184-203`) ma authored=0; **scale assente**. Griglia breadboard bidirezionale hole↔(x,y) **deterministica e completa** (`BreadboardHalf.jsx:361-389 getHolePosition`, `breadboardSnap.js:62,508 findNearestHole`, pitch 7.5, snap 30px) — **è il target dell'omografia** per una pipeline vision: presente e load-bearing, MA costanti runtime, non persistite in scena.
**1.2 Cosa NON memorizza:** **il PATH dei fili** — connessioni puramente topologiche `{from,to,color}` (`experiments-vol1.js:54-65`, `lesson-paths/v1-cap6-esp1.json:147-158`). `grep waypoints src/data` = **0**. Ogni piega è ri-sintetizzata ad ogni render (sag `WIRE_SAG_FACTOR=0.03`, corner R=15, A*-avoidance in `WireRenderer.jsx:223-349,529-705`) → **due circuiti identici NON renderizzano fili byte-identici**. Esiste un **seam di persistenza** (`conn.waypoints` onorato end-to-end `WireRenderer.jsx:999`, drag-handles `:1262`) ma **0 fili authored lo usano**.
**1.3 Provenienza spec:** `docs/architectures/circuit-scene-model.md` esiste **solo sul commit PR#195 `6b5fa2e3`, ASSENTE a HEAD** (verificato `git cat-file -e HEAD:... ` → non esiste). Nessun TS-type del modello da nessuna parte (repo JS-primary).
**1.4 Corpus:** 88 esperimenti (vol1 38+vol2 27+vol3 23), scene-provenance **0/88**, book-photos **3/88**, pinAssignments 79/88. **3 bug geometrici** (due pin nello stesso foro `bb1:c21`: `v3-cap7-esp3`, `v3-cap8-esp5`, `v3-cap8-esp6`) — elettricamente innocui, reported-not-patched (`automa/graph/scene-geometry-report.json @9beb6db9`: 79 scene, 76 pass, 3 fail, 0 hole-ref invalidi).

## §2 SCHEMA — `ElabScene` = `CircuitScene v1` + layer geometria persistita
**Decisione: BUMP a `circuit-scene/2`, NON forkare.** ~60% overlap, ZERO conflitto: tutte le aggiunte sono sub-oggetti additivi. Un nuovo schema duplicherebbe la state-machine di provenance (che È il moat) → ripete il pattern "3 API no-superset".
**Già in `CircuitScene v1` (@6b5fa2e3):** `schemaVersion`, `experimentId`, asse `provenance{status:candidate|reviewed|verified|rejected|deprecated (default candidate), origin, sourceRef, verifiedBy/At, checks{electrical,geometry,bookMatch}}`, state-machine candidate→verified, `book{volume,page,ref,photo}`, `components[]`, `pinAssignments{}`, `connections[]{from,to,color}`, `netlist`(derived). Il *"la vision emette sempre candidate, mai verified"* del piano è **verbatim** §3/§5 della v1.
**`ElabScene` AGGIUNGE esattamente UNA categoria (geometria fisica persistita + crop-provenance + fidelity):**
- `source.cropBBox` + `source.sourceImageHash` (NEW — provenienza/idempotenza del crop immagine)
- `board.{pose, grid}` (NEW — persisti le costanti `breadboardSnap.js` nella scena)
- `component.pose{x,y,rotationDeg,scale}` (x/y già in `layout{}`; **scale è nuovo stato** che il renderer deve imparare ad applicare)
- `wire.path{kind:polyline|bezier, points, bendRadius}` (NEW — **il gap più affilato**; si attacca rinominando `connections`→`wires`)
- `visualFidelity{componentPoseErrorPx, wireEndpointErrorPx, visualOverlayScore}` (NEW — nessun concetto px-error esiste oggi)
- `provenance.checks.visualMatch` (NEW 4° validator; la v1 ne definisce 3)
**1 SOLA rottura:** rinomina `connections`→`wires` (per appendere `path[]`) → guida il bump v2 + un **read-shim**. Tutto il resto è additivo. **Deriva lo schema dallo stato in-memory del simulatore funzionante, non top-down.** **Backfill 88 esperimenti** = `verified, origin:hand-authored, pose/path/visualFidelity VUOTI` → onesto: *"abbiamo netlist, non geometria fisica px-verificata"* diventa segnale misurabile.

## §3 PROVENANCE LIFECYCLE
`candidate → reviewed → verified` (state-machine v1 §3/§5). **La vision/CV emette SEMPRE `candidate`.** Promozione a `verified` **solo su ✓ umano**. 4 validator come gate: **electrical · geometry · bookMatch · visualMatch**. **REGOLA DURA: solo scene `verified` guidano lezioni reali** (Passo Passo / Già Montato); `candidate`/`reviewed` solo in authoring/review.

## §4 PERCORSO MINIMO (zero nuova ML) — il primo passo reale
**HAND-AUTHOR le 5 scene, costruisci il CONSUMER prima del PRODUCER.** Invariante da provare per prima = **ROUND-TRIP IDENTITY** su una scena fatta a mano: ElabScene JSON → renderer disegna → overlay sul crop-manuale entro tolleranza → CircuitSolver simula → validator passano → umano dice *"sì, è la figura del libro"*. Finché questo loop non è verde, ogni bug-CV è ambiguo (detector? schema? renderer? validator?) = l'ordine di debug più costoso.
**6 step (~1-2 settimane, 1 builder, solo tool MIT-clean):**
1. **FREEZE `ElabScene`** come validator JSON-Schema/Zod reale (keystone — l'unica cosa che renderer+solver leggono). Derivato dallo stato in-memory del sim.
2. **RENDERER ROUND-TRIP:** adapter sottile `ElabScene` → stato simulatore esistente. Riusa `BreadboardHalf.jsx`(grid), `WireRenderer.jsx`, `registry.js` — tutto esiste (88 esperimenti lo provano).
3. **HAND-AUTHOR + verifica-umana le 5 scene starter** (LED+R+batteria · LED+Arduino-pin · pulsante · potenziometro · condensatore carica/scarica): monta nella UI esistente → export stato → `ElabScene` JSON. Geometria dalla griglia breadboard, **NON da CV**. Ore/scena, zero ML. **Per "fili piegati uguali": popola `wire.path.points` via il seam waypoint esistente (`WireRenderer.jsx:999`)** — instradare dati in un seam esistente, non costruire un renderer.
4. **OVERLAY VALIDATOR (CV classica, NO training):** render scena→PNG, allinea al crop-manuale via OpenCV ORB/ECC o SSIM → `visualOverlayScore`. Solo OpenCV+scikit-image. Un **grader, non un detector**.
5. **ELECTRICAL VALIDATOR:** gira `CircuitSolver.js` (2533 LOC, MNA) esistente → asserisci comportamento (LED conduce, cap carica con τ giusto).
6. **HUMAN-REVIEW GATE:** candidate→verified solo su ✓ umano (già designed §3/§5 — cabla il booleano).
**ML nuova su questo percorso: ZERO.** Schema, adapter-renderer, overlay-scorer, electrical-validator, review-gate = **infrastruttura permanente** che la CV-forge richiederà comunque. Il reality-test della vision è raggiungibile agli step 3-4 senza ML.

## §5 I VALIDATOR = l'asset durevole
- **geometry** (ESISTE, 3 bug noti) · **electrical** (`CircuitSolver.js` ESISTE) · **visualMatch** (OpenCV ORB/ECC/SSIM — nuovo ma classico) · **bookMatch** (pagina/capitolo/BOM coerenti).
- Sono sul critical-path **comunque** (anche una CV perfetta li richiede) → costruiscili **prima**, contro ground-truth hand-authored.

## §6 CV FORGE (DIFFERITA)
Solo **dopo** §4 verde. Spec della forge = *"emetti JSON che passa i validator §5"*. Pipeline: PyMuPDF crop → YOLO/SAM2 detect → omografia → snap-to-breadboard → scena `candidate`. **Difficoltà reale:** diagramma→scena è genuinamente difficile (error-compounding multi-stadio; wire-tracing/junction-disambiguation = modo-di-fallimento dominante = esattamente la geometria che conta; letteratura Image2Net/SINA/OmniSch → consenso detect→validate→human, mai fiducia cieca). **Effort: hand-author 5 (~1 unità, rischio BASSO) vs forge piena (~8-12 unità, rischio ALTO compounding, ~2-4 mesi).** *(NB: cifre-letteratura da conoscenza-training, non live-fetch — direzionalmente robuste; web-verifica prima di citare numeri esatti.)*

## §7 LICENZE (critico per marketplace)
**CLEAN — depend ora (MIT/Apache, proprietary-safe):** wokwi avr8js (MIT) · wokwi-elements (MIT) · tscircuit/circuit-json (MIT) · Docling-code (MIT) · LayoutParser (Apache-2.0) · SAM2 code+checkpoint (Apache-2.0) · GroundingDINO code (Apache; pesi non-etichettati→verifica) · PaddleOCR (Apache) · docTR (Apache) · Surya code (Apache-2.0; pesi RAIL-M free <$5M→prototype).
**TRAP — NON spedire senza licenza pagata:** **PyMuPDF (AGPL-3.0+commercial Artifex) · Ultralytics YOLO (AGPL+enterprise)** = peggiori, **network-copyleft contamina anche il backend SaaS** · Marker (code **GPL-3.0**; pesi RAIL-M <$2M+commercial Datalab) · Fritzing (GPL code; parti CC-BY-SA → NON forkare parti nel prodotto chiuso) · CircuitJS1/Falstad (GPL-2.0 → copia l'approccio MNA, scrivi il tuo — `CircuitSolver.js` già lo fa).
**Correzioni alla vision:** Marker=GPL-3.0 (non generico "GPL"); Surya-code=Apache-2.0 (più permissivo). **Lo stack MIT/Apache-clean è SUFFICIENTE per §4** → un'altra ragione per differire la forge AGPL-heavy dietro decisione esplicita.

## §8 METRICHE (per scena)
`component_count_match` · `wire_count_match` · `componentPoseErrorPx` · `wireEndpointErrorPx` · `visualOverlayScore` · 4 validator pass/fail · `human_verified`. **Baseline onesto: 0/88 provenance, 3/88 photos.** Senza metriche è "sembra uguale" — non basta.

## §9 RISCHI / aperti
1. **FORGE-FIRST TRAP (max):** la CV prima del loop round-trip ripete il fallimento "+0.33" (moat che credi esista ma non servi). → hard-gate la forge dietro 5 scene verified.
2. **WIRE-PATH non-determinismo = il vero gap moat:** "fili identici" oggi è impossibile (path ri-sintetizzati). Il seam c'è (`WireRenderer.jsx:999`), 0 fili lo popolano. Finché non popoli `wires[].path`, il claim è falso.
3. **Spec NON merged** (`circuit-scene-model.md` solo su `6b5fa2e3`, no TS-types) → landa schema+validator come keystone (§4.1) prima della geometria.
4. **Esposizione AGPL** per prodotto vendibile (PyMuPDF+Ultralytics). → stack MIT/Apache basta per il minimo; quarantena.
5. **Rinomina `connections`→`wires`** deve guidare il bump v2 + read-shim (unico hazard di migrazione).
6. **diagram→scena difficile** (yield end-to-end può scendere ~50-70% anche a 90%/stadio → rifai a mano gran parte degli 88; validator+human obbligatori comunque).
7. **Ground-truth scarso:** solo 3/88 book-photos = tassa-annotazione nascosta per ogni detector. Le 5 scene starter sono lo scope giusto per scoprirlo a basso costo.
8. **`scale` mancante** ovunque (dati+runtime) = nuovo stato che il renderer deve applicare.

## §10 INDICE FILE (tutti sotto `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`)
`src/data/experiments-vol1.js:54-83` · `src/components/simulator/BreadboardHalf.jsx:361-389` · `.../WireRenderer.jsx:184-203,223-349,529-705,999,1262` · `.../breadboardSnap.js:62,508` · `.../engine/CircuitSolver.js` (2533 LOC) · `.../registry.js` · `src/data/lesson-paths/*.json` · `automa/graph/scene-geometry-report.json @9beb6db9` · `docs/architectures/circuit-scene-model.md @6b5fa2e3` (non a HEAD).
