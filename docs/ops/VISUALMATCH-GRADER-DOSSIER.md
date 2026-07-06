# Dossier — visualMatch grader: cosa misura oggi, cosa è GATE

Data: 2026-07-07 (sessione NOTTE-5). Non decide: fotografa lo stato con
evidenza, per il 4° validator del canon (`visualMatch`, ELAB-SCENE-FORGE-CANON
§4/§5/§8) e per la promozione `candidate→verified` (gate umano).

## Fatto (firsthand)

Il canon §4 step 4 chiede un OVERLAY VALIDATOR: render della scena → PNG,
allineato al crop del manuale via OpenCV ORB/ECC o SSIM → `visualOverlayScore`.
Tre blocchi al calcolo onesto di quel punteggio OGGI:

1. **Dip mancanti = GATE.** `python3 -c "import cv2"` e `import skimage`
   falliscono (ModuleNotFoundError). numpy 2.4.6 + PIL 12.2 presenti. Aggiungere
   OpenCV/scikit-image = nuova dipendenza = GATE-Andrea (regola dura: no dip
   senza gate). Nessuna dip npm equivalente installata (`apps/studio/package.json`
   non ha librerie CV).
2. **Il riferimento è art stilizzata, non una foto del render.** I crop reali
   (`apps/studio/public/elab/manuals/vol1/page-030-esercizio-6-1.png`, hash
   `11318b54…`, e `page-031…`, hash `2f686a8a…`) sono le figure ILLUSTRATE del
   libro. Il nostro render è SVG schematico (`ToolCanvasEmbeddable.tsx:662`,
   `viewBox 0 0 920 520`). Un overlay pixel (SSIM/ORB) fra due stili grafici
   diversi ha segnale strutturalmente basso: anche una scena perfetta non
   sovrapporrebbe pixel-identica l'art del libro.
3. **Serve ground-truth annotato.** Per un pose/wire-error contro il crop
   servono le coordinate pixel dei componenti/fili NELLA figura del libro,
   annotate a mano. Corpus book-photos = 3/88 (canon §1.4/§8). Annotazione =
   GATE (lavoro umano, non inventabile).

→ `visualOverlayScore` NON è onestamente calcolabile no-dep. Resta `null`.
   `provenance.checks.visualMatch` resta `unknown`. Nessuna promozione.

## Cosa misura INVECE il grader strutturale (no-dep, no-CV)

`apps/studio/sim/visual/structuralGrader.ts` — `gradeSceneGeometry(scene)`.

La scena porta DUE sorgenti di geometria autorate in modo INDIPENDENTE:
- **pixel**: `components[].pose`, `wires[].path.points`;
- **topologica**: `pinAssignments`, `wires[].from/to` (ref foro, es. `bb1:i9`).

Il modello griglia `pointForBreadboardRef` (`sim/breadboard/simulationBreadboard.ts`,
pitch 7.5) mappa ref→(x,y). Incrociando le due sorgenti si ottengono px-error
REALI, senza CV:
- **wireEndpointErrorPx**: `|path.end − grid(wire.to)|` (e start↔from) sui soli
  endpoint che sono fori/rail. Gli endpoint internal-net (`bat1:negative`,
  `bat1:positive`) NON hanno griglia → saltati onestamente, non contati.
- **componentPoseErrorPx**: `|pose − centroide dei grid-point dei pin
  assegnati|`. Componenti senza pin-su-griglia o senza pose (batteria,
  breadboard) saltati.

Evidenza sulla fixture hand-authored `elab-scene-v2-candidate-v1cap6esp1.json`:
tutti gli endpoint-foro e le pose cadono ESATTI sulla griglia (delta 0.0).
Tolleranza tarata SOLO su questa scena = `0.5 px` (margine float), non un numero
inventato su scene mai viste. Falsificabile: una `path.end` corrotta di 3px
alza `wireEndpointErrorPx` sopra tolleranza e mette `onGrid=false` (test
`structuralGrader.test.ts`).

Questo NON è l'overlay del §4: è la **metà topologica** dell'invariante
"componenti/fili nel posto giusto", misurabile in px oggi. È regression-guard
per l'auto-consistenza della geometria autorata di ogni scena futura, e produce
i primi `wireEndpointErrorPx`/`componentPoseErrorPx` REALI che §2/§8 chiamano
nuovi ("nessun concetto px-error esiste oggi").

## Cosa NON fa (per costruzione)

- Non confronta col crop del libro (serve CV+GT = gate sopra).
- Non promuove `candidate→verified`: emette evidenza, `visualMatch` resta
  `unknown`. La promozione è gate umano (canon §3).
- Non misura `scale` (il renderer non applica ancora `pose.scale`, canon §9.8).

## Gate aperti (per Andrea)

1. Aggiungere OpenCV/scikit-image per il vero `visualOverlayScore` (nuova dip).
2. Annotare a mano le coordinate pixel della figura p30/p31 come ground-truth
   (o decidere che l'overlay confronta render-vs-render hand-authored invece
   dell'art del libro, dato il blocco #2 sopra).
3. Promozione `candidate→verified` di v1-cap6-esp1 (✓ umano su crop vs render).
