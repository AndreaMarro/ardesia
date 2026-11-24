# Independent AI whole-lesson review — lessons-foundations-011

Separate AI reviewer, not the historical author and not root, author of the two new editions. Read **every block** of C1-L001..004, all six historical SVGs as XML and full rendered images, then both complete revised lessons and the additional signed-vector SVG. No PASS was inferred from flags, kind, or absence of an answer key. Mathematical review includes all unit conversions, generic identities, examples internal to figures, signed counterexamples and physical assumptions.

**Originals: 2 PASS, 2 FAIL, 60 checks.** L002 has P2 signed-projection overgeneralization; L003 has P3 endpoint-caption precision only. **Effective report: 2 unchanged valid lessons plus 2 separately reviewed DRAFT lessons, 75 checks, all PASS.** Both original judgments and severities remain nested under their drafts. No source, asset, candidate, registry, checkpoint or application file was edited by reviewer. All results have humanNOT_RUN; only two revised rows have publicationActionDRAFT, others NONE. This is not human approval or publication.

## Immutable source/asset identity

All four real IDs are `ACCOUNTED` in the activity manifest. Source is `officina-di-fisica/content/C1.json` at Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`, SHA-256 `0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf`. Direct `git show` matched local bytes for this entire JSON and each of the six figures. The individual record hashes match the manifest and are frozen in the verifier. Original versions are L001v2, L002v1, L003v1 and L004v2.

| Historical figure | SHA-256 |
|---|---|
| `C1-scala.svg` | `6c59566179802d99d4bc34c78f1a5074d2c3c1f0fd273c850631d0992ec19bad` |
| `C1-vettore.svg` | `aba4cee638235b6a99ea823d57361e3b1366cd79ce92b8ac46240ec29580ff8c` |
| `C1-posizione.svg` | `60f8e433938fb419332373efd343b8986057bea63c44691770fa8d40454e6d89` |
| `C1-velocita.svg` | `0983a43aa7f3bb6aeb9493172a1bdc7361ef602887b9bb29c0e4db4e02776d3a` |
| `C1-parabola.svg` | `dd8d8c1f3bd2470e26e9867d6d5475286f1bfab0030be95597f689031df37bcb` |
| `C1-circolo.svg` | `158b6a3f5b0614ce90034b870182536612b95171a10fc9cb51ee6d7d749341cf` |

## Four complete original readings

**C1-L001 — Dare una misura alle cose (11 checks, PASS).** Read progression from unit choice through SI bases, density dimensions, powers in conversions, scientific notation, logarithmic order, extensive/intensive quantities and scalar/vector distinction. Actual arithmetic:3mm=3/1000m=0.003m;1cm²=(10mm)²=100mm²;1cm³=(10⁻²m)³=10⁻⁶m³. Density1g/cm³=(10⁻³kg)/(10⁻⁶m³)=1000kg/m³, with dimension ML⁻³. Multiplying−3 by10⁻³ recovers−0.003, sign retained. Scientific normalization1≤|a|<10 is explicitly nonzero; zero is separately written with unit, not assigned a logarithmic order. For nearest powers on a **logarithmic** scale, equal log distances give log10|a|=1/2, hence√10; tie chooses upper exponent as source states. Integer comparisons3²<10<4² check the threshold without numerical roots. Dividing a uniform unchanged-state liquid into equal parts gives(m/2)/(V/2)=m/V: density intensive, mass/volume extensive. All seven listed SI base dimensions are distinct. Figure156px square has9 internal lines per side, step15.6px, exactly10×10 cells; highlighted cell has1/100 square area. No linear factor10 mistakenly used for area/volume.

**C1-L002 — Costruire e proiettare un vettore (16 checks, FAIL original P2).** Correct generic components A cosθ/A sinθ, norm from Pythagoras, signed axes and opposite-quadrant tangent warning. Independently expanded dot product to ABcos(θ−φ), checked cross²+dot²=A²B², coordinatewise sum and cancellation with opposite, right-handed basis cross, and Nm=J for work. Reviewer probe(3,4)m has norm5m and opposite(−3,−4) same tangent4/3 but opposite signs/quadrant. This probe was reviewer-constructed for the original, not a falsely claimed assigned original exercise. Figure origin(88,174),tip(328,54) gives perpendicular positive projections240/120px, ratio1/2; arc is measured from+x toward+y and is schematic rather than a required decimal atan.

The original final sentence says parallel vectors have a **maximum projection** after signed projections have already been introduced. Counterexample A=(1,0)m and directionB=(−1,0):signed projection−1m is the **minimum**, not maximum+1m; signed dot for unit magnitudes is−1 rather than+1. A correct formula elsewhere does not repair that overgeneralization. “Concordant” or “maximum magnitude” must be made explicit in a new edition. Cross product of parallel vectors is zero; its direction is not defined in that degenerate case. The original formula is correct, the issue is the signed explanatory claim. Report retains that exact P2 finding.

**C1-L003 — Leggere il movimento nel tempo (15 checks, FAIL original P3 precision).** All motion formulas and main conclusions are correct. The labelled position graph has points(0s,0m),(2s,6m),(4s,6m),(6s,2m). Slopes are+3,0,−2m/s; the plateau is a stop at6m; displacement2m differs from distance6+4=10m. Mean velocity1/3m/s differs from mean speed5/3m/s. Secant limits independently yield instantaneous velocity/acceleration where derivatives exist; ideal corners need one-sided treatment. A falling x–t graph means negative velocity.

The second v–t graphic is a **different illustration**: intended labelled endpoints0m/s,peak6m/s at3s,end0m/s at6s; its one-pixel baseline path offset lies within stroke thickness and is not interpreted as a physically assigned residual speed. Acceleration+2 then−2m/s² and two areas9+9=18m are positive; no return occurs. Its caption says velocity remains positive, although the displayed endpoints are zero. Classify this as **P3 editorial boundary precision**, not a wrong law, negative velocity or false position-increase conclusion: the velocity is nonnegative overall and strictly positive internally. The source's conclusion that position continues increasing until the final stop remains correct. Original FAIL refers only to that strict wording; root independently authored a more precise edition.

**C1-L004 — Accelerare in linea retta e in curva (18 checks, PASS).** Independently integrate constant acceleration to v=v0+at and displacementv0t+at²/2. Signed displacement differs from distance if direction reverses: reviewer probev0=−1m/s,a1m/s²,t3s gives displacement3/2m and path1/2+2=5/2m. Source does not require this numerical probe; it verifies its stated distinction. Near Earth, negligible air and small height compared with Earth's radius justify approximate uniform downwardg;9.81 is explicitly an approximation. With y upward, y''=−g during both ascent/descent, including apex. For an oblique launch with nonzero horizontal component, apexvy=0 but vx remains; same clock for both axes. Eliminating time yields a quadratic y(x), curvature−g/vx². Figure Bézier has exact apex(276,36), horizontal tangent there and downward acceleration arrow; launch and return share height, no numerical physical scale asserted.

For uniform circle r,T>0, differentiate r(cosωt,sinωt),ω2π/T: speedωr, acceleration−ω²r-vector, v·a=0 and ac=ω²r=v²/r. Circle figure center(235,111),right point(311,111),r76px has upward tangent and inward left acceleration. Source correctly treats centripetal as acceleration direction and asks for a real radial interaction, rather than adding a fictitious extra centripetal force. No decimal evaluation ofπ required.

All four use `EXACT_MANUAL_CALCULATION` because real conversions, graph arithmetic and exact symbolic mathematical procedures were performed. That does not invent an assigned numeric exercise for symbolic-only parts of L002/L004. The report explicitly distinguishes original data from reviewer-constructed exact probes; absence of answer keys is never a reason to skip physics.

## Separate new editions — lessons-foundations-revisions-054

Root authored L002v2/base1 and L003v2/base1. Read both complete final rows, bindings and all asset bytes after corrections; source originals remain unchanged. L002 now distinguishes codirected maximum+AB, opposite minimum−AB, and maximum absolute projection in both cases; dot0 for orthogonal while cross magnitude is maximal. Nonzero angle0..π is distinguished from a single-vector orientedθ; zero-vector angle undefined and Ax0 vertical branch avoids division by zero. New3-4-5 numerical example is explicitly **different from the illustration**, with exactcos3/5,sin4/5 and no required inverse-trig decimal. Checked all formulas and examples against independent vector algebra.

L003 now explicitly labels the two graphs as different motions, fixes nonnegative velocity with zero endpoints, derives first graph slopes/displacement/distance/means and second triangle displacement18m/mean velocity3m/s. Acceleration±2 and average0 are correct; derivative is explicitly undefined at3s vertex. It does not misdiagnose the original motion merely to justify the editorial correction.

Two candidate findings were resolved **before signature freezing**. Initial automatic equality splitting left dangling/mixed expressions for Rx/Ry and angle conditions. Root replaced these with autonomous component/product formulas and angle conditions in prose; reread every final formula block. Initial retained `/figures/...` refs were outside `reviewed_rows`' hashed-asset contract. Root uploaded byte-identical historical vector/position/velocity SVGs as three protected hashed assets, in addition to the new signed-vector graphic; actual payload/local bytes were compared against Git baseline. No shared helper/contract or original static asset was changed to bypass that guard.

New `lesson-vector-sign-limits.svg` was read and fully rendered. Dimensionless unit vectors use common geometric path-endpoint scale120px/unit; perpendicular vectors form120×120 square with area1. Concordant arrows coincide; opposite vectors share origin and have opposite signed projections. Arrowhead ink is not an additional length datum. Dot results+1/0/−1 and cross areas0/1/0 are correct. All labels fit the viewBox; historical copies retain their original geometry. Browser responsiveness and canonical import remain integrator evidence, not claimed here.

Effective report has4PASS/75checks and exactly2DRAFT; originals report still2PASS2FAIL/60checks. Each draft contains its original failed judgment verbatim under `publishedEditionReview`, retaining different priorities, original hash/version1, `failedPublishedEdition=true`, current version2/base1 and originalEditionRetained=true. No human approval inferred from these AI signatures or seed author metadata.

## Validation and limitations

Recovery Python, SymPy1.14.0/Pint0.25.2, exact Fraction/Rational arithmetic. No authoring import or source key acts as an oracle. Equations are constructed independently from the lessons; frozen prose/TeX signatures bind the actually read presentation. A new content hash cannot be accepted by mere rebinding without another separate reading.

`tests/corpus/test_lessons_foundations_review.py`: **8/8 PASS,11.505s**. Covers original2/2 with exactly the two scoped counterexamples, deterministic canonical report, actual mixed activity-identity acceptance, separate nested failed judgments, four source changes/omissions, six missing or byte-changed historical figures, both changed/rebound new lessons, source/ref/version/base/kind/invented-answer guards after test-only retoken, unique complete two-candidate identity and each corrupt uploaded asset among all4. Retained historical figures are checked even for drafts. Test-only retokens never alter production frozen signatures. No real DB/server, exam exposure, registry/checkpoint edit or publication.

## Final hashes

| Item | SHA-256 |
|---|---|
| L002 canonical candidate | `a65de515addfb7590fe7a99f17789707e6f7661b30307cfab98bd20ed2ef2d9c` |
| L002 source/candidate/assets signature | `324fbaf412dfe2e9ce582999433a950820fa4250ede765c59f4d56cf22ace2c5` |
| L003 canonical candidate | `e2d1d47ff9a162bf49828fb3c28b3162e8e62219c1af2240fcb549448f5de166` |
| L003 source/candidate/assets signature | `5bbc6f5055a9345120879dc10a7016c4be35a0cc8883e2866e02820d6cd3dc8f` |
| New signed-vector SVG | `ccb458e193fc5cc51ffb9acb50987a6a7c241491e2f23a0d50656263803ccd66` |
| Package054 bytes | `8dd275a9a8ed52f695877cfd3bce8e0bc636c5fad9feaaaafe7099d9e3a954fc` |
| Package054 canonical JSON | `f644a93db618d25e16de1a8b19a31db9829997eb9dd0dfe9736c9f6f8f96d1e6` |
| Bindings054 bytes | `53a37b109589e97e9b28882df7438eb5cee19ac8a73a67289d59c1b1263246ac` |
| Bindings054 canonical JSON | `9b06a746038f15e3a9e5976608b0bb4702bacf977e7107c04914075c38944dd0` |
| `lessons_foundations_activity_verifier.py` | `316337bf6aad5b99e5a68644133ed8db2265b16cb336f49cd2c450bc5f233cee` |
| Reviewer-owned tests | `c59e5ea6fbb9e27787ef290f9745ce9c5bb02babed2173e2fafad3cbe899b42e` |
| Originals report bytes (2/2) | `00a511d8305e4e0319fbdcafa97a39a4f1021054f7e018f9c4e552e915088977` |
| Originals report canonical JSON | `26bdb804cfca2aeab6180773046eabde21473407c63dc2289fa1aa3319c98184` |
| Effective report bytes (4/0) | `f5ab5191b810f031a588be7f33b85f7342d83a2034d6c1b911fbcab8b6610b3a` |
| Effective report canonical JSON | `b8fb88d62af24b84daad26c2ccc426c2527ebf87c1584ee7684347b6d217ec3b` |
