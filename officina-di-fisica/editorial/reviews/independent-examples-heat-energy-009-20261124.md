# Independent AI review — examples-heat-energy-009

Reviewer is separate from the historical author. Independently read all eight original C3-E005..012 records, including every block and caption, and the four related historical SVGs in XML and full rendered views. Source and figure hashes were frozen only after this reading and the independent calculations below. No source, asset, candidate, registry, checkpoint, application or authoring file was changed. All work and new reviewer-owned files are in `/private/tmp/cric-resident-integrator`.

**Result: 8/8 original editions PASS within the stated models; 49 independent checks.** Every activity requires actual numeric work and therefore uses `EXACT_MANUAL_CALCULATION`; none is labelled calculation-free merely because it is a worked example. No new edition is required by this scoped review. Every result has `humanApproval=NOT_RUN`, `publicationAction=NONE`, `originalEditionRetained=true`, and no failed-published-edition flag. This is an AI technical/scientific reading, not human approval or authorization to publish.

## Source identity and assets

All eight IDs exist in the pinned Cric source and the activity checkpoint manifest; no substitute IDs were chosen. Manifest provenance is `officina-di-fisica/content/C3.json` at commit `5d1dc8dc7b601aef959d10d564c75462be74708d`, file SHA-256 `44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0` (Git blob `22d6b819c0329d35f5d42699e98287acee378432`). Direct `git show` returned byte-identical contents to the local JSON and each of the four local figures. Each selected record's canonical hash matches its manifest entry; the verifier and reports persist those individual hashes and source paths.

| Historical figure | SHA-256 |
|---|---|
| `C3-scambi.svg` | `5fe72c5b200c4e14ad3db3c88469737cf19a1aca4b1516c9c391b025dc6f9c8f` |
| `C3-fasi.svg` | `59316774d57a882676062fc86650c6a080c6aebda3180da2e5aaf83fc6940828` |
| `C3-parete.svg` | `c7241066dc2e892527868cecb8fa7cbb1c14a2771b080d6c17b3edaf2ed4346f` |
| `C3-compressione.svg` | `d5d094fbd32e0532a21a45ab170b8517b10c54f59155ba6793c5de5091945829` |

## Eight individual reviews

**C3-E005 — Unire due masse d'acqua (7 checks, PASS).** With the assigned equal specific heat, isolated container and negligible container capacity, solve mh·c(Tf−Th)+mc·c(Tf−Tc)=0. In kelvin the solution is 303.15 K=30 °C; Celsius weighted balance gives the same result because the weights sum. Manual numerator100·60+300·20=6000+6000=12000, denominator400. Hot100 g cools30 K and cold300 g warms10 K: equal and opposite3000 g·K times c. Specific heat is treated constant in the model over20–60 °C; no phase change. Simple arithmetic mean40 °C would ignore the threefold cold-side capacity. Figure shows heat hot→cold within one insulating boundary and opposite-body heat balance. The nearly equal rectangle sizes are schematic bodies, not a stated mass/volume scale for100/300 g.

**C3-E006 — Calibrare un calorimetro (5 checks, PASS).** Total heat capacity960 J/4 K=240 J/K; container240−180=60 J/K. Container energy60·4=240 J, sample180·4=720 J, sum960 J. Assumes both share the4 K rise, capacities effectively constant and losses neglected as requested. Capacity J/K is distinct from mass-specific heat J/(kg·K). No numerical value of the sample mass is needed. No figure.

**C3-E007 — Dal ghiaccio all'acqua tiepida (6 checks, PASS).** Mass50 g=1/20 kg. Melting at the initial0 °C costs334/20=16.7 kJ; heating the resulting liquid through10 K costs(4.18·10)/20=2.09 kJ. Sum18.79 kJ, explicitly followed by approximation18.8 kJ in the original. Manual nearest-tenth bracket18.75<18.79<18.85 verifies that approximation. Melting exceeds warming by14.61 kJ, consistent with the explanation that melting dominates. No extra term for warming ice below0 °C: initial ice is already at the model's melting point. Uses the assigned latent heat and liquid heat capacity, without container losses or vaporization. The generic T-versus-Q plot has a solid branch, phase-coexistence plateau and liquid branch; the caption explicitly selects a start on the plateau. Its unnumbered axes and segment lengths do not encode the quantitative16.7/2.09 ratio and are not measured as such.

**C3-E008 — Resta ancora del ghiaccio? (7 checks, PASS).** Complete melting would require0.080·334=26.72 kJ. Absorbed10.02 kJ is lower, by16.70 kJ, so first select partial melting rather than a liquid-heating branch. Melted mass10.02/334=0.0300 kg exactly, since334·3/100=10.02. Thus30 g liquid and80−30=50 g ice remain; mass sum80 g. At the explicitly atmospheric-pressure melting equilibrium, coexistence leaves0 °C. Latent heat is assigned; no need for a sensible-heat coefficient until all ice has melted. No figure.

**C3-E009 — Un diaframma conduttore (7 checks, PASS).** Steady one-dimensional Fourier conduction through the stated plane slab: s=5 mm=1/200 m, ΔT32−22=10 K and gradient−2000 K/m from hot to cold. P=−λA·gradient=(1/5)·(1/50)·2000=8 W. Two minutes are120 s, so energy magnitude960 J. Independent thermal resistance s/(λA)=5/4 K/W gives P=10/(5/4)=8 W. Fixed face temperatures, constant conductivity, negligible lateral/extra contact effects are the plane-slab model. Steady transport is not accumulation of960 J inside the slab. The figure's hot left face, cold right face, positive transfer arrow and perpendicular thickness agree; no metric area/thickness scale is assigned to the picture.

**C3-E010 — Due strati in successione (6 checks, PASS).** Series thermal resistances1+3=4 K/W and face temperature difference20 K give common P=5 W. Solving both interface equations40−Ti=1·P and Ti−20=3·P gives Ti=35 °C. First drop5 K, second15 K, and35−15=20 °C checks the exit. Order is explicitly given in the prompt, so the interface is unique; reversing the materials would change Ti but not total P. Stationary flow, no additional interface resistance or lateral losses. No figure.

**C3-E011 — Compressione con raffreddamento (6 checks, PASS).** With Q positive entering gas and W positive leaving gas, volume change2−4=−2 L. External-pressure boundary-work model at constant80 kPa gives W=−160 kPa·L=−160 J because1 kPa·L=1000 Pa·10⁻³ m³=1 J. Gas heat loss means Q=−50 J. First-law balance ΔU=Q−W=−50−(−160)=+110 J, independently160 J mechanical input minus50 J heat output. Assumes the usual closed-gas pressure-work balance with no other work mode or net unaccounted mechanical energy stored in the piston; it does not require internal gas pressure constant, ideal gas, or a reversible path. The title's cooling means heat removal, not a calculated fall in temperature: no final T is given, and positive internal-energy change is explicit. Figure labels and directions correctly show50 J out as heat,160 J in as work, and Qin/Wout sign convention. Arrow lengths are not a claimed energy scale.

**C3-E012 — Due cammini fra gli stessi stati (5 checks, PASS).** First path fixes ΔU=240−160=80 J. Same closed system and same endpoints mean second path has the same ΔU; hence Q2=80+90=170 J. Cross-check: second Q−W=170−90=80 J, while differences Q1−Q2=70 J and W1−W2=70 J agree. Only U is a state function here; no separate preservation of Q or W is assumed. Uses the chapter's Qin/Wout convention and excludes unmentioned macroscopic kinetic/potential energy changes from this internal-energy balance. No figure.

## Validation, counterexamples and limits

Runtime: `/private/tmp/cric-recovery-venv/bin/python`, SymPy1.14.0, Pint0.25.2, rational `Fraction`/`sympy.Rational`. The model equations are constructed independently from the statements; no source answer field, authoring module, or printed formula is parsed as an oracle. The sole rounded numeric result is explicitly declared in the original and recorded with a rounding relation and nonzero residual, rather than pretending to be an exact equality.

Reviewer-owned `tests/corpus/test_examples_heat_energy_review.py`: **4/4 PASS, 0.156 s**. Checks fresh deterministic/canonical JSON report, actual `assert_activity_identity` for all eight IDs, honest no-approval/no-publication and numeric-work scope, all eight individual source changes, all eight missing-source cases, and each of four missing **or byte-changed** historical figures (even an otherwise harmless appended newline invalidates the frozen reading). Restored assets return all eight to PASS. Adversarial mutations are in memory or temporary files, with originals untouched. These integrity tests do not claim arbitrary new prose can be auto-certified; a new content hash requires another independent reading.

The two reports are identical unchanged-original judgments. No revised draft, registry/checkpoint update, browser/import proof, production DB/server operation, exam access or publication was performed by this reviewer. A future changed source or figure must be re-reviewed; this scope does not certify the remaining corpus or human scientific approval.

## Current artifact hashes

| Artifact | SHA-256 |
|---|---|
| `tools/corpus_engineering/examples_heat_energy_activity_verifier.py` | `46806c11508c20fb6c1460e5807f24097ac7b96c58203f6d57788e797b074911` |
| `tests/corpus/test_examples_heat_energy_review.py` | `48646f4fa0ec7f1f6e8ab2cc17d0759f33af0d768972c22351bfcb968b42a743` |
| `examples-heat-energy-009-originals.json` bytes | `864734dc627f1becf283cc85293d38f068e915bb77856c3bcfba4dcfd845831d` |
| `examples-heat-energy-009.json` bytes | `864734dc627f1becf283cc85293d38f068e915bb77856c3bcfba4dcfd845831d` |
| Both reports, canonical JSON | `a9191919994d5baf871c1f1cfcb4677a947e173140710ffbf22139604c180e2c` |
