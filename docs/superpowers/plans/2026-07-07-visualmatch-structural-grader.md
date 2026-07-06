# Piano — visualMatch structural grader (no-dep, no-CV) — 2026-07-07 NOTTE-5

## Contesto / dead-end
Canon §4 step 4 vuole un OVERLAY VALIDATOR (render→PNG allineato al crop
manuale via OpenCV ORB/ECC o SSIM → `visualOverlayScore`). Blocco reale:
- `cv2`/`skimage` **NON installati** → aggiungerli = GATE-Andrea (nuova dip).
- Anche con le dip, il riferimento è **art stilizzata del libro** (p30/p31),
  non una foto del nostro render SVG: un overlay pixel (SSIM/ORB) fra due
  stili grafici diversi ha segnale strutturalmente basso.
- Serve inoltre **ground-truth annotato a mano** dei pixel del crop
  (dove stanno componenti/fili nella figura) = altro GATE.
→ `visualOverlayScore` non è onestamente calcolabile ora. Resta `unknown`.

## Metà onesta calcolabile SUBITO (no-dep, no-CV)
La fixture `elab-scene-v2-candidate-v1cap6esp1.json` porta **due sorgenti di
geometria autorate in modo indipendente**:
1. topologica: `pinAssignments` + `wires[].from/to` (ref foro, es. `bb1:i9`).
2. pixel: `components[].pose` e `wires[].path.points`.
Il modello griglia `pointForBreadboardRef(ref)` (`sim/breadboard/simulationBreadboard.ts`,
pitch 7.5) mappa ref→(x,y). Incrociando le due sorgenti misuro px-error REALI:
- **wireEndpointErrorPx**: |path.end − pointForBreadboardRef(wire.to)| (e start
  vs `from` quando è un foro; gli endpoint internal-net tipo `bat1:negative`
  si saltano onestamente — non sono fori griglia).
- **componentPoseErrorPx**: |pose − centroide dei grid-point dei pin assegnati|
  (2-pin: r1 = midpoint bus-top-plus-9/i9; led1 = midpoint f9/e9). Verificato
  a mano: delta 0.0 sulla fixture verified.
Non vacuo: `path`/`pose` e i ref sono autorati in sub-oggetti diversi; una
`path.end` corrotta di N px viene flaggata. Falsificabile.

## Regole soglia (niente numeri inventati)
- Tolleranza tarata SOLO sulla scena hand-authored verified (l'unica): la
  fixture dà 0.0 px → tolleranza = `0.5 px` (margine per float), NON inventata
  su scene mai viste.
- `visualMatch` resta `unknown` finché non c'è overlay CV + GT + gate umano.
  Il grader strutturale NON promuove candidate→verified: emette evidenza.
- `visualOverlayScore` = `null` (non calcolabile no-dep), documentato.

## Slice (TDD RED→GREEN)
1. **RED**: `sim/visual/structuralGrader.test.ts`
   - fixture verified → wireEndpointErrorPx ≤ tol, componentPoseErrorPx ≤ tol,
     `onGrid` true, `visualMatch: "unknown"`, `visualOverlayScore: null`.
   - path corrotta (+3px) → error > tol, `onGrid` false (guard falsificabile).
2. **GREEN**: `sim/visual/structuralGrader.ts`
   - `gradeSceneGeometry(elabScene): StructuralGradeReport`.
   - riusa `pointForBreadboardRef`; salta endpoint internal-net; centroide pin.
3. typecheck (`tsc -b`) + vitest (da apps/studio) + build.
4. Dossier `docs/ops/VISUALMATCH-GRADER-DOSSIER.md`: cosa manca per
   `visualOverlayScore` (dip cv2/skimage=gate, GT annotata=gate, book-art
   weakness), cosa misura oggi il grader, perché candidate resta candidate.

## Fuori scope (gate)
- overlay CV vero, promozione fixture→verified, nuove dip, scale-error
  (renderer non applica ancora `scale`).
