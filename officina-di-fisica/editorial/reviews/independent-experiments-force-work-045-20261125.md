# Independent AI original review — force/work045

Final result: **4PASS/2FAIL**, six original experiment records;71 checks (66 valid mathematical/conformance checks and five reproduced consumer-counterexample checks). The two failing records are not complete and the six-record group is not registered by this reviewer. No DRAFT authored, no human approval, no publication. Reviewer is a separate AI from historical source and future fix authors.

Source pinned to `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/esperienze-C1.json`, fileSHA `84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3`. All six complete records read, not only keys: topic/summary/interpretation/control/measure/formula/reference data/transfer prompts and generated consumer prediction options, first/transfer questions and worked substitutions. Last record is sourceversion2; other five version1. Empty blocks did not waive actual numerical work.

Runtime `54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d` held unchanged. Read shared adapter, installed-engine selector, assessment selection, primary law/instrument files, geometric builder/3D/tavola renderers, comparisons, legends, clocks, plots, scene and actual bench parameter/phase/grade path. Seventeen relevant files are individually bound plus the entire bundled runtime. No approval inferred from a cache, source review flag or original answer.

## Prioritized actionable findings

1. **P3 SIM-C1-L006-02 — nonzero restoring force is hidden in native3D.** At the actually generated transfer x=+1cm, Hooke law gives−0.5N, but no green force arrow can be seen. `static/js/banchi/voci/apparati/meccanica.js:272` creates an opaque sphere r0.25 and line273 starts the force arrow at its centre with length0.2. Read Three conversion/materials in `scena.js`: opaque/depth-writing sphere, shaft radius0.028, head radius0.0812 at axial joint0.136. Maximum radial extent is0.2, below the sphere surface, including the triangulation margin. It is enclosed from every camera, not a single occluding view. Four reachable nonzero inputs−1,−0.5,+0.5,+1cm reproduce containment. At zero, omission is correct. Fallback paints the arrow over the sphere, so numerical model and fallback are distinct from this native3D defect. Recommendation for the separate author: expose the force direction outside the opaque body while preserving signed force, declared scale and zero behavior. No fix made here.

2. **P3 SIM-C1-L007-02 — empty-interval average displayed as0W.** Actual t=0 is reachable by slider and elapsed clock. Consumer label“Potenza media dall’avvio”shows0W without a limit/undefined qualifier (`confronti.js:21`). Derivation F3N/m1.5kg yields a2,v2t,s=t²,W3t²; meanW/t=3t only for t>0. At0 the average is0/0 and undefined; its continuous right-limit0 exists but is not the same quantity. Instantaneous powerP=dW/dt=6t correctly gives0W at0, and both graded tasks18/12W are correct and manual. Recommendation for the separate author: explicitly show an empty interval/undefined mean, or label the0W right-limit, retaining instantaneous0W. No source/runtime fix made here.

## Individual solutions, domains, figures and actual assigned work

### SIM-C1-L006-01 — PASS within stated scope

Each trial restarts from rest. Static magnitude equals applied F through6N, then assigned kinetic3N beyond6. Actual tasks10N=>3N and threshold6N=>6N. At7N net right force4N, not a negative friction. All finite integer arithmetic; no source mass or unassigned acceleration inferred.

Assumptions: Independent starts from rest, one oriented horizontal force, constant normal/contact and assigned Coulomb maximum6N versus kinetic3N. Domain0..12N; equality can remain static. The slider compares independent trials, not deceleration hysteresis of one already moving block. Diagram is a force snapshot, not a time trajectory.

Figure/clock/graph: One block, green right applied force and red left friction use common gain57/350 scene units perN; origins slightly separated on same body for clarity. Equal arrows through6N; kinetic friction drops to3N at7N. Graph has a NaN break, not an interpolated slope through the jump. Exact threshold active point/readout remains6N, and lower branch represents the right-hand kinetic limit.

Source canonicalSHA `444a3d9fe8c31446e477dd3d72c9af784c84b1060678c31679f8ac3f1227c263`.

### SIM-C1-L006-02 — FAIL consumer; scalar physics and assigned manual tasks PASS

50N/m times x_cm/100 yields -x_cm/2N. References-2cm=>+1N and4cm=>-2N; actual transfer+1cm=>-1/2N. Boundaries-4=>+2N,0=>0,6=>-3N. Restoring sign follows negative derivative of kx²/2, within the assigned ideal elastic interval.

Assumptions: Ideal linear spring, fixed positive k50N/m, signed displacement from a fixed rest position, actual interval-4..6cm declared elastic. No preload, gravity component or extra force included. Diagram length remains positive throughout; cm input is converted to m before Hooke law.

Figure/clock/graph: Fixed spring support x-2.1, rest tip-0.6, actual tip-0.6+0.21*x_cm. Length1.5+0.21*x remains0.66..2.76, always positive. Green force delta-0.2*x_cm points toward rest on either side and vanishes at0. Spring coil geometry is illustrative, not a real material strain calibration.

Source canonicalSHA `3dd3ca74965f5e0fa3ce70272105418d5c1db2642f893da0ec77c1edd4632582`.

### SIM-C1-L006-03 — PASS within stated scope

Divide Gm1m2/r² by its value at fixed nonzero r0: ratio1/x², with x=r/r0. References1=>1 and2=>1/4; actual transfer x11/4 gives16/121. Finite long division160000=121*1322+38 yields0.1322; relative error19/80000<0.005, so the Number-only grader has a feasible manual input. This reviewer procedure is not claimed as text supplied by the source. No numeric G or astronomical masses needed.

Assumptions: Fixed positive masses and Newtonian inverse-square law, finite nonzero reference distance. Spherical symmetric bodies do not overlap: displayed radii0.27 each versus minimum centre separation1.2 scene units. Centre distance, not surface gap, scales with x1..4. Force ratio dimensionless; equal/opposite forces act on distinct bodies. Static configuration comparison, no unassigned orbital or falling dynamics.

Figure/clock/graph: Centres at plus/minus0.6*x, constant radii0.27; centre line and equal inward force arrows. Each force length0.85/x²: doubling distance quarters both arrows. Minimum spheres do not overlap. Arrow origins lifted above centre line for visibility, not a claimed off-centre torque.

Source canonicalSHA `e44f957cf45b4effcd3f36f85850c95a04ffd10871075e7c2f6fe54a7b94ac43`.

### SIM-C1-L007-01 — PASS within stated scope

W=F dot displacement, constant4N over straight3m:12cos(theta)J. First assessed120deg uses cos=-1/2=>-6J. Actual transfer is90deg=>0J, not95deg. Opposite180deg=>-12J; aligned0=>12J. Negative work is energy transferred out through this force, not a negative displacement length or necessarily total net work.

Assumptions: Force constant in magnitude and direction within each straight3m trial;4N and angle0..180deg from rightward displacement. Scalar work of this force, not necessarily net work. Variable control rotates between separate trials. Metre displacement and newton force vectors have separate display scales; work is not represented as a vector.

Figure/clock/graph: Green horizontal displacement delta1.6 represents3m; orange rotating force length1.5 represents4N, logical+y is negative scene z. The dashed projection closes onto the displacement axis. Different physical units are not compared as equal screen lengths; displayed work remains scalar and may be negative.

Source canonicalSHA `f85003b40a9ad21a9aebb9d5568a2bbc15664d957dddf4dd47473d4e9182ad5c`.

### SIM-C1-L007-02 — FAIL consumer; scalar physics and assigned manual tasks PASS

F3N/mass3/2kg gives a2m/s²; from rest v2t and s=t². Work3t² and instantaneous derivative6t W. Actual tasks3s=>18W and2s=>12W are manual and correct. Mean from start is3t W only for t>0. At0 the instantaneous power is0, but the average over a zero-duration interval is undefined0/0. Its right-limit0 exists; the original consumer displays0W without that qualification. This failure is a readout domain issue, not a failure of the assessed instantaneous-power calculations.

Assumptions: Constant resultant/tractive3N on inertial mass1.5kg, from rest, straight horizontal positive motion with no opposing work. Time0..4s is actual elapsed input. Instantaneous power valid also at0; average work/time requires t>0. No average-over-empty-interval convention is specified. This domain distinction is retained as an original consumer failure.

Figure/clock/graph: Cart position is t²m mapped to rail-2.38+(119/400)t², speed arrow delta13t/60. Elapsed clock0..4s updates scalar P6t, geometry and readings from the same instant; default selected1s is not a separate initial condition. Positive-duration average3t matches its physical definition; at0 the observed0W label remains the explicit boundary failure.

Source canonicalSHA `fca8abba8445694bc3af22eef6156a0c96916efe31b4c2a752aab49043bdbe09`.

### SIM-C1-L007-03 — PASS within stated scope

Net work DeltaK, from rest and m2kg gives speed sqrt(W) in SI. References4J=>2m/s,9J=>3m/s. Actual transfer8J=>2sqrt2m/s. Manual2.82²=7.9524<8<8.0089=2.83² bounds the root; .01/2.82<.005, so numeric2.83 is safely accepted. Source explicitly derives the perfect-square9 case; this extra bracket is a reviewer feasibility proof, not a supplied source instruction. Positive1N resultant gives distanceW/(1N), matching rail coordinate. Fourfold work doubles speed, not twofold work.

Assumptions: Net work0..16J on a2kg cart initially at rest, positive1N resultant along straight guide. Speed is nonnegative square root; no real negative-work-from-rest branch in the domain. Work control determines independent final states; there is no clock in this experiment. Velocity arrow is speed, not force or a vector representation of energy.

Figure/clock/graph: Cart coordinateW/(1N) mapped linearly to rail-2.38+(119/400)W. Speed arrow delta13sqrt(W)/60, omitted at0. Work and speed use their correct distinct units; concave square-root graph, not a linear speed/work relation. No artificial motion clock or negative-energy speed shown.

Source canonicalSHA `6729a0318bbef2a6dabc6febcddd78b6cb95c3a086105947cea3744c43c77cc9`.

## Manual feasibility and distractors

Predictions are the actual three categorical options Diminuisce/Resta uguale/Aumenta. Solving the reference-state comparisons independently gives decrease for friction4→3N, signed spring+1→−2N, gravity1→1/4 and work12→−6J; increase for power6→18W and speed2→3m/s. Signed spring/work quantities are not silently replaced by their absolute magnitudes. The constant-force versus constant-power and static/kinetic threshold distractors are distinct. There are no five-choice question options in these experiment records.

No automatic nonnotable-angle failure: work references0/120 leave generated90, so its transfer is exactly0J. Gravity generated11/4 produces exact16/121, for which long division yields0.1322 within19/80000 relative error. Kinetic generated8 produces2sqrt2; squaring2.82 and2.83 brackets the root within a relative0.01/2.82<0.005. Those two reviewer manual procedures prove feasible Number-only inputs; they are not claimed as source-provided steps or acceptance of symbolic strings. Arbitrary instrument trig/root outputs are not invented additional required tasks.

## Actual consumer, independence and limits

Final34-case run terminalPASS means the observation instrument completed and reproduced **both failures**, not that all six scientific reviews passed. Six default records in actual nativeWebGL and forced fallback give12 cases;22 further native parameter/threshold/zero/boundary states give34 total. All four phase guides were exercised and all12 actual assessed responses rejected an obviously wrong answer and accepted independent literal/manual values. The extended Hooke case captures the missing native arrow at the actual transfer. The mean-zero DOM readout is captured even when below the screenshot viewport; no claim that every item is above the fold.

Complete118 reachable control inputs, their graphs/apparatus, and68 elapsed-clock observations are compared afresh against exact independent models. Friction graph has an explicit NaN discontinuity break and correct threshold cursor; gravity centre separation and equal inward force scaling checked; power clock updates t² position, velocity and6t power from the same time; kinetic work-control has no invented clock. Native/fallback default images read, both defect images examined, and all other boundary readings asserted programmatically. No claim every generated PNG was separately inspected or that a pixel classifier measured invisibility: spring defect uses actual screenshot reading plus analytic containment of the actual canonical geometry/Three mesh.

Runtime profile and individually bound files checked before/after the portable browser run. Temporary localhost app/database/demo session, network restricted to local app, owned Chrome/server closed; no real DB, attempt ledger, source, asset, app, candidate, registry or Git mutation. Screenshots stay temporary; their actual byte hashes are frozen in the proof. Source figures are live generated apparatus, not omitted because no staticSVG block exists. No certification of other source families, all browsers/accessibility, empirical student learning or real-material calibration.

Initial33-case instrument lacked the Hooke transfer-visibility probe; preserved before extending it in `experiments-force-work-045-initial-consumer-probe/`. No complete scientific approval was issued from that probe. Reviewer code also corrected Boolean conversion/typo while constructing its exact checks. A meaningful8-test run was7GREEN/1RED because the verifier omitted a guard against an absent fresh comparison; the failing test observed5 false approvals under that explicit missing-comparison counterfixture. Guard added in the reviewer only; no product changed. The final8/8 tests passed in65.194s, retaining that regression and both original consumer FAILs.

Tests include two fresh model executions for two deterministic reports, complete source/file/profile hashes and IDs, every wrong scalar and rebound assigned answer, every omitted case, changed assumptions blocked before engine execution, corrupted force/vector geometry, discontinuity/clock mutation, individual runtime-file/full-profile drift, execution failure/in-flight drift, absent/changed consumer proof/protocol, exact unit/manual bounds and source-domain versus consumer failures. The full six-record activity gate rejects the report; no FAIL is counted complete.

## Frozen final identities

- Verifier `b8c1cd2ac3f02229fdf19993f9ba0a02b01a5b83ebfdb409d4b9c097ab841068`.
- Python test `0883c10e83546af63265cf35cc303d31e5aaea707ed0e2e41c094053ca131a02`.
- Browser protocol `66ca14b85372ea0fcc1b854c1d38a2882a344382324014ef4b16101cf4f68a32`.
- Observed browser proof `4c03ce23dc6518a8a5a720f0cfcf5391e332f202dcd5aba069e98a394fbfd375`.
- Both original/effective reports `83ab66037510f99a28d6d49c3716d1ac9e439c11f993759ea51da88c70b1bccf`.
- Canonical report `f79f43a8a366c57750b80e4aeb99094834c1acd7a3530d03a5123cda2c5ffb52`.

Owned files: experiments_force_work_045_verifier.py; test_experiments_force_work_045_review.py; browser-experiments-force-work-045.mjs; two reportJSONs; browser proof; this individual note and the initial-instrument snapshot. HumanNOT_RUN, publicationNONE, originalEditionRetainedTrue.
