# Independent AI review — examples-coverage-fluid-007

Separate AI reviewer, not the original author. All eight complete original records, including every text/formula/figure block, and all seven SVGs were independently read before the module hashes were frozen. The SVGs were also rendered with Quick Look into reviewer scratch space and visually inspected in full. No source, historical asset, candidate, registry, application, or authoring file was changed. There is no human approval or publication action.

Result: **8/8 original editions PASS under their stated physical models; 44 independent checks**. These are worked examples with numerical calculations, so every record uses `EXACT_MANUAL_CALCULATION`, never `NO_STUDENT_CALCULATION`. No new edition is required by this review. `humanApproval=NOT_RUN`, `publicationAction=NONE`, `originalEditionRetained=true`, and no failed published edition are recorded explicitly. This result does not certify the full corpus or the human publication gate.

## Provenance actually checked

Baseline: Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`. The current checkpoint's individual activity manifest entries identify the three C1 records in **`content/esempi-di-copertura.json`**, not `C1.json`, and the five C2 records in `content/C2.json`. Each file's local SHA-256 matches that provenance; each selected canonical record matches its individual manifest hash. Additionally, fetched all nine source/figure paths through the GitHub file API at that exact baseline and compared the returned Git blob SHA to SHA-1 of `blob <length>\0<local bytes>`: all nine agree. Thus current copies used for reading are the pinned historical bytes.

| Source file (repository-relative) | SHA-256 | Baseline Git blob |
|---|---|---|
| `officina-di-fisica/content/esempi-di-copertura.json` | `a2db79961bac47ce346d482990d1fb47105151d0650de9c4e05c5b7a5e311d82` | `a2656d03194861e8e8f16ac1f849076fa95f2f81` |
| `officina-di-fisica/content/C2.json` | `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23` | `e9221db5dabf744a20d457fb9ee13249ec999565` |

Per-ID canonical SHA-256 and source-file provenance, plus all seven actual asset SHA-256 values, are persisted in the module and both reports. Historical figure Git blobs: porzioni `faf80c5c33a021f2697b41640518ed93dbed396d`; pattino-inerziale `709f014331fc14b43a664ed0ef3075e82ce90800`; pattinatori `414d0f91404464922f79f2e907c4fbceec31a741`; piastre `d1caf611d16b558febf1e1a9c621837f7c3c4934`; profilo `9e359939da0311f13f167c2846544aa580432fb2`; raggio `611b892dace3598560774495de08cf7899af5daa`; reti `32fa43f76abf601129e59b667e1f963228c4e97c`.

## Individual scientific and manual review

**C1-E021 — Riunire due aliquote senza cambiare sostanza (6 checks).** Density is 4/5 g/mL. The two masses are 30·4/5=24 g and 70·4/5=56 g. No losses gives 80 g; volume additivity is explicitly assigned in the figure caption, giving 100 mL and density 80/100=4/5 g/mL. Equal initial temperatures of the same substance, with no appreciable energy exchange, leave 22 °C. Equal-temperature thermal balance works with any positive common heat-capacity weighting; adding thermometer readings to 44 °C is invalid. No inference is made about volume additivity for different substances. Figure fill heights 30/70/100 px at equal width exactly reproduce the volume ratio 3:7:10. PASS.

**C1-E022 — Forze equilibrate su un pattino già in moto (5 checks).** In the explicitly inertial frame, +4−4=0 N, so acceleration is zero for positive constant mass. The initial +4/5 m/s persists for 3 s; integrating gives +12/5=+2.4 m. Starting from rest gives zero velocity and displacement under the same resultant. No mass value is required. Normal/weight cancellation is declared, while the drawing intentionally shows only horizontal forces. Both force shafts are 105 px and opposite on the same body; positive x is right. Addresses the actual misconception that equilibrium implies rest. PASS.

**C1-E023 — A chi appartengono le due forze? (5 checks).** Newton's third law gives the opposite mean reaction over the same contact interval. Impulse magnitude is 120·(1/5)=24 N·s. Thus vA=−24/40=−3/5 m/s and vB=24/60=2/5 m/s. Momentum check: 40·(−3/5)+60·(2/5)=−24+24=0. The given force is a mean; no assumption of a constant instantaneous force is necessary. Equal and opposite forces act on different bodies; they cancel only in the two-body system balance. The SVG attaches equal 95 px force arrows to the proper 40/60 kg bodies, in the stated directions. PASS.

**C2-E013 — L'olio fra due piastre (6 checks).** Solve the linear Couette profile from the no-slip boundary values v(0)=0 and v(d)=3/10 m/s with d=1/500 m. Its slope is (3/10)·500=150 s⁻¹; the second derivative vanishes. Newtonian shear stress (2/5 Pa·s)·150 s⁻¹=60 Pa. On area 1/50 m² the resisting force is 60/50=6/5 N; maintaining the assigned speed requires the opposite external force. Doubling d halves force to 3/5 N. The source explicitly supplies extensive plates, stationary laminar flow and uniform pressure along motion, avoiding an unassigned Poiseuille contribution. The SVG's arrows have lengths 0.92·(161−y) at the four drawn levels: linear variation to the stationary lower wall, with d transverse. No absolute geometric scale is claimed. PASS.

**C2-E014 — Una sonda a metà raggio (3 checks).** For the stated Newtonian developed laminar circular-pipe model with no-slip stationary walls, normalized radial profile is v(q)=(2/5)(1−q²), q=r/R. At q=1/2: v=(2/5)·3/4=3/10 m/s. The sectional mean is 2∫₀¹qv(q)dq=(4/5)(1/2−1/4)=1/5 m/s. Local and mean differ by 1/10 m/s; averaging evenly over radial coordinates would use the wrong area weights. Figure walls y=48/172 and axis y=110 give radius 62 px. Its quadratic Bézier is exactly x=151+186[1−((y−110)/62)²]; arrow tips agree within rounding below one pixel. Correct zero-wall and center maximum behavior. PASS.

**C2-E015 — Mezzo raggio, nuova portata (4 checks).** Independent cylindrical viscous-stress balance gives ηdv/dr=−Δp·r/(2L); integrate with v(R)=0 and then over circular area to obtain Q=πΔpR⁴/(8ηL). In the two explicitly separate trials, the common factors cancel: Q2/Q1=(1/2)⁴=1/16. Q2=(24/5)/16=3/10 mL/s; fraction 1/16 is 25/4%=6.25%. Cross-sectional area and mean speed each shrink by 1/4, independently confirming the product 1/16. Both trials stay within the assigned Poiseuille regime; this is not a series constriction with conserved common Q. The two SVG radii are exactly 66/33 px. PASS.

**C2-E016 — Da una misura alla viscosità (8 checks).** Convert r=10⁻³ m, L=1/5 m, Q=(1/2)·10⁻⁶=5·10⁻⁷ m³/s and Δp=10³ Pa before taking powers. Independently invert the cylindrical-flow result: η=πr⁴Δp/(8LQ). Numerator π·10⁻⁹, denominator 8·10⁻⁷, so η=π/800 Pa·s. Pint confirms cancellation to Pa·s. The original already displays this exact π-containing fraction and labels the final 3.9·10⁻³ with an approximation sign. It can be rounded manually without calculating π: the coarse classical bound 3.1<π<22/7 gives 31/8000<η<11/2800, entirely between the two-significant-figure rounding thresholds 0.00385 and 0.00395. Therefore 3.9·10⁻³ is correct. This is not an inverse transcendental decimal requirement, and no missing exact form is invented to excuse one. No figure in this record. PASS.

**C2-E017 — La pressione al raccordo (7 checks).** Same-reference terminal pressures give Δp=22−4=18 kPa. Linear series resistance is 2+4=6 kPa·s/mL, so Q=3 mL/s. Solve both node equations: 22−p=2Q and p−4=4Q, giving p=16 kPa. Drops are 6 and 12 kPa, sum 18, and exit reconstructs 16−12=4 kPa. Pint verifies the stated composite units. The source caption explicitly sets the upper series row order, first resistance 2 and then 4; thus the otherwise ambiguous node pressure is fixed. The lower parallel drawing is separately labelled and not used in this calculation. No equal division of pressure or reciprocal series rule. PASS.

## Reproduction and adversarial limits

Runtime: `/private/tmp/cric-recovery-venv/bin/python`, SymPy 1.14.0, Pint 0.25.2, rational arithmetic using `Fraction` and `sympy.Rational`; bytecode writes disabled and scratch cache outside iCloud workspace. The module imports no candidate/authoring code. `report(sources)` was recomputed twice, byte/content deterministic; the actual `assert_activity_identity` accepts the eight results with no revision package. Both report files contain the same unchanged-original judgments.

Executed independent adversarial checks in memory/scratch space: mutate each of the eight source prompts individually (all eight correctly fail their frozen reading while the other seven remain valid); omit each source individually (all eight raise); remove each of the seven figures individually (the corresponding record fails while the others remain valid); restore all figures (all eight pass). These checks establish binding completeness, not automatic semantic interpretation of arbitrary replacement prose. A changed record or SVG requires a new independent reading rather than rebinding its hash.

No real application DB, production server, exam material, publication, or registry edit occurred. A broad initial `rg --files` traversal blocked on the workspace and was terminated as the reviewer's own process (exit143); it is not reported as a successful check. All direct source/asset reads, pinned Git API comparisons, exact checks and adversarial checks above completed.

## Final artifact hashes

| Artifact | SHA-256 |
|---|---|
| `tools/corpus_engineering/examples_coverage_fluid_activity_verifier.py` | `e37a53b5e96d9d36c36b1c80e6aca042f74cb76ae12d6569433053300c58839b` |
| `editorial/reviews/examples-coverage-fluid-007-originals.json` (file bytes) | `93a978f7d3a2f881370d8151b0525f9616e59d3ec2f87651b83152b0d1ecfdda` |
| `editorial/reviews/examples-coverage-fluid-007.json` (file bytes) | `93a978f7d3a2f881370d8151b0525f9616e59d3ec2f87651b83152b0d1ecfdda` |
| Both reports (canonical JSON digest) | `0b7547d11002ffc4ef057b7030b8c6dad70340a83dee41052fcd2a7f537f88a8` |
