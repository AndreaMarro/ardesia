# Breadboard Copy System — procedura ripetibile figura→scena (NOTTE-12)

> Obiettivo: rendere il sistema BRAVO a **copiare** circuiti su breadboard da una
> foto/pagina del volume, non solo a disegnarli. Usato firsthand per le scene
> v1-cap6-esp1/esp2/esp3 (le prime 3 del catalogo onestà).

## Strumenti

- **Helper authoring** (`apps/studio/sim/breadboard/sceneAuthoring.ts`, puri, no-dep):
  `holePoint(ref)`, `poseBetween(refA, refB)`, `straightPath(from, to)`,
  `pathWithBends(from, bends, to)`, `insertBendPoint(path, i, p)`, `describeHole(ref)`.
  Ogni coordinata deriva da `pointForBreadboardRef` — la STESSA griglia del grader.
- **Grader severo** (`apps/studio/sim/visual/structuralGrader.ts` →
  `gradeSceneGeometryStrict`): oltre a `onGrid`, pretende COPERTURA — ogni wire
  con `path` autorato, ogni componente con pin in griglia con `pose`. I buchi
  escono per nome (`uncoveredWires`, `unposedComponents`, `wireErrors` per-filo).
- **Hover node highlight** (post-it Simulation Plugin): passare su un foro
  illumina l'intera tie-strip/rail e mostra `ref — vocabolario del libro`
  ("foro f9 — metà sopra (f-j), colonna 9"). È il ponte visivo tra la figura
  del volume ("un punto qualsiasi della striscia rossa") e la griglia.

## Procedura (ripetibile, ~30-60 min a scena)

1. **Pagina**: identifica la bookPage in `packs/elab-tutor/data/volume-references.js`;
   estrai la pagina dal PDF INTERNO (`plugins/elab-tutor/public/volumes/volumeN.pdf`):
   `pdftoppm -png -r 180 -f <pag> -l <pag> volumeN.pdf out` (poppler, MIT-clean).
   Verifica il footer stampato = pagina attesa. Commit del PNG in
   `apps/studio/public/elab/manuals/volN/page-0NN-esercizio-C-E.png`, sha256 → fixture.
2. **Fori**: leggi la figura (zoom con `sips -c/-z` se serve) e trascrivi ogni
   gamba/estremo in ref ELAB (`bb1:f9`, `bb1:bus-top-plus-9`, …). L'orientamento
   dei volumi è verticale: riga-figura = colonna-sim, lettera = riga-sim.
   Se il foro esatto non è leggibile, scegli il canonical placement DENTRO la
   stessa tie-strip e dichiaralo in `provenance.sourceRef` (precedente: esp1).
3. **Geometria**: genera pose e path con gli helper — MAI numeri a mano:
   `poseBetween` per i 2-pin, `straightPath` per i jumper, `pathWithBends`
   con le pieghe lette dalla figura per i fili lunghi (estremi ancorati).
4. **Fixture** `circuit-scene/2`: status `candidate`, checks onesti
   (`visualMatch: "unknown"` sempre; `electrical` solo se = verdetto calcolato,
   altrimenti `unknown` + gate dichiarato — precedente: esp3/D4-2).
5. **Verifica falsificabile**: `gradeSceneGeometryStrict` → `strictOnGrid` true;
   bookConstraints per-esperimento (verdetto calcolato dal testo/figura, con
   falsificatori e controprova incrociata con le altre scene); solve reale
   (il claim electrical della fixture DEVE coincidere col verdetto).
6. **UI/screenshot**: post-it (catalogo onestà) solo se il runtime può dire la
   verità del motore; e2e con screenshot desktop+mobile.

## Cosa NON fare

- Non inventare pixel: se un numero non esce da un helper, è un bend-point
  letto dalla figura e va dichiarato tale.
- Non promuovere: il grader strutturale NON tocca `visualMatch` (overlay CV +
  ground-truth + gate-Andrea).
- Non riconciliare in silenzio i drift col corpus/lesson-path: annotarli in
  `provenance.sourceRef` (esp1, esp2, esp3 li hanno tutti).

## Stato e prossimi passi

- Coperte: esp1 (2 fili), esp2 (3 fili), esp3 (2 fili) — tutte strictOnGrid.
- Bend-point interattivi (drag nella UI): il modello dati c'è
  (`insertBendPoint` + polyline persistita); la superficie di editing è
  lavoro futuro dichiarato.
- Vol.2 richiede la breadboard INTERA orizzontale (v2-cap7): componente board
  full-size non ancora nel renderer di scena — gap noto in matrice.
