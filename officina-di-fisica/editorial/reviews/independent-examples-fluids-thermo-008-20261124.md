# Independent AI review — examples-fluids-thermo-008

Separate AI reviewer, not the original author. Read all eight complete original records and all five related SVGs, including XML and rendered views, before freezing the source/asset hashes. Work took place only in the new resident checkout `/private/tmp/cric-resident-integrator`; no further old iCloud-root writes. No original, figure, registry, application, candidate, or authoring file was changed.

**Originals: 7 PASS, 1 FAIL (C3-E003).** There are 39 independent checks, including the deliberately failing printed exact equality, four correct rounding checks and three symbolic conceptual checks. The ability to round correctly does not repair an undeclared approximation in the student-facing original. Root subsequently authored v2, separately read and reviewed below: the effective report is now seven unchanged valid originals plus one valid DRAFT, while the originals report preserves 7/1. `humanApproval=NOT_RUN` throughout; no publication is authorized. This is a separate AI draft review, not a retrospective PASS of the historical edition.

## Provenance checked per record

All eight IDs exist as `ACCOUNTED` in the checkpoint activity manifest. C2-E018..020 originate in `content/C2.json`; **C2-E021 originates in `content/esempi-di-copertura.json`**; C3-E001..004 originate in `content/C3.json`. No ID substitution was needed. Their individual canonical hashes match the manifest and are persisted with file provenance in the verifier/report. `git show` at baseline `5d1dc8dc7b601aef959d10d564c75462be74708d` returned byte-identical contents for all three current JSON files and all five historical SVGs.

| Repository-relative source | SHA-256 | Pinned Git blob |
|---|---|---|
| `officina-di-fisica/content/C2.json` | `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23` | `e9221db5dabf744a20d457fb9ee13249ec999565` |
| `officina-di-fisica/content/esempi-di-copertura.json` | `a2db79961bac47ce346d482990d1fb47105151d0650de9c4e05c5b7a5e311d82` | `a2656d03194861e8e8f16ac1f849076fa95f2f81` |
| `officina-di-fisica/content/C3.json` | `44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0` | `22d6b819c0329d35f5d42699e98287acee378432` |

## Individual judgments

**C2-E018 — Dividere il flusso in due (6 checks, PASS).** Each parallel branch has the same 12 kPa drop. Q1=12/3=4 mL/s, Q2=12/6=2 mL/s. Continuity gives Qtotal=6 mL/s; Req=12/6=2 kPa·s/mL. Independently 1/3+1/6=1/2 in conductance units, inverse 2. Req is below both branch resistances and the larger resistance carries half the flow. The caption selects the lower parallel circuit, whose two branches genuinely connect the same input/output nodes; the upper series circuit is separately labelled. Physical model is steady incompressible flow with assigned linear resistances. No geometric scale inferred from the resistor widths.

**C2-E019 — Risale davvero di qualche centimetro? (6 checks, PASS in the stated column model).** Balance vertical surface-tension force around the inner circumference against the supported column weight: 2πrγ=ρgπr²h. With complete wetting cosθ=1, h=2γ/(ρgr). Convert r=0.50 mm=1/2000 m. Numerator 2γ=0.144=18/125 N/m; denominator 1000·10/2000=5 N/m², so h=18/625 m=0.0288 m=2.88 cm, explicitly reported approximately as 2.9 cm. Doubling radius halves this value. This is the standard slender-column Jurin model, ignoring the small meniscus-volume correction; it is not claimed as an exact solution of the entire Young–Laplace shape. Bath is large, same atmosphere at both surfaces, static wetting equilibrium. Figure has concave meniscus above the bath, vertical h, and same-atmosphere label. Its drawn quadratic curve is qualitative: there is no assigned metric scale or angle from which to measure θ=0 or h/r.

**C2-E020 — Una goccia e un film sferico (5 checks, PASS).** Derive from surface-energy virtual work rather than recall the answer: A=4πR², V=4πR³/3, d(γA)/dV=2γ/R for a single spherical interface. Two near-equal-radius interfaces in a very thin film give 4γ/R. R=2 mm=1/500 m and γ=3/100 N/m give Δpdrop=(6/100)·500=30 Pa and Δpfilm≈60 Pa. Positive interior-minus-exterior pressure; gas bubble within liquid has one interface, unlike soap film. The figure's enlarged film thickness is explicitly disclosed, so its 58/50 px contours are not wrongly treated as equal physical radii to measure. The single filled droplet and air-filled double interface are correctly distinguished.

**C2-E021 — Che cosa osservano il tracciante e la sonda (3 quantitative checks plus conceptual reading, PASS).** At fixed probe location, Δv=0.30−0.18=0.12=3/25 m/s. Dividing by 3 s yields 1/25=0.040 m/s²: the average local temporal change, not necessarily the instantaneous derivative or material acceleration. The ordered tracer is correctly called compatible with laminar flow, while A is nonstationary during startup. B has turbulent mixing/fluctuations; a stable long-time mean can accompany statistical stationarity but alone cannot prove all higher moments/correlations stationary. The original uses the cautious 'può', not a universal sufficient criterion. A concrete dimensional counterexample is v(x,t)=0.18 m/s+(0.04 m/s²)t+(1 s⁻¹)x: at x=0,t=1.5 s the convective contribution is 0.24 m/s² in addition to the local derivative. Do not infer an A time average of 0.24 from only its endpoints: the intervening history is unspecified. The two tracer sketches carry no time/velocity scale and correctly depict ordered versus irregular mixing.

**C3-E001 — Due letture dello stesso bagno (4 checks, PASS).** Exact Celsius–kelvin offset gives 26+273.15=299.15 K and 18+273.15=291.15 K. Difference is +8 K, reported +8.0 K with the reading precision. The explicit approximation 299.2 K rounds the final absolute reading to a tenth, as stated. Offset cancels in the difference; adding 273.15 to 8 would be wrong. Pint's offset-temperature conversion, using rational magnitudes, independently agrees. No figure.

**C3-E002 — Scegliere il confine in un contenitore (3 symbolic checks, PASS).** This activity asks no student numerical computation: `NO_STUDENT_CALCULATION` is limited to this record. It was nevertheless checked physically: rigid V(t)=V0 makes dV/dt=0, hence ∫p(t)(dV/dt)dt=0 for any pressure history. Sealed boundary forbids matter exchange. The first law ΔU=Q−W reduces to ΔU=Q only **if other work modes are absent**, precisely the condition the original states. Rigidity alone does not exclude electrical or stirring work; closed is not isolated. Widening the system to include bath makes gas–bath transfer internal, without destroying energy. The figure shows stationary walls, closed gas and inward heat from an initially hotter bath, with no piston or mass-flow arrow.

**C3-E003 — Volume di un campione gassoso (7 checks, FAIL original).** The ideal-gas model, SI units and manual operation are viable: n=1/50 mol, nT=6 mol·K, R=8.314 J/(mol·K) as supplied by the solution. Thus nRT=6·8.314=49.884 J; dividing by 100000 Pa gives **0.00049884 m³ = 0.49884 L**, or 12471/25000000 m³ exactly for those numerical inputs. The source instead prints an equality to 4.99·10⁻⁴ m³ and then 0.499 L without declaring rounding or significant figures. Exact-minus-printed residual is **−1/6250000 m³**, equivalently −0.00016 L. Both rounded outputs are reasonable at three significant figures (0.4985<0.49884<0.4995 L), but the reviewer may not silently replace '=' by '≈'. The later 'circa' modifies a comparison with the one-mole volume, not this result. My initial provisional interpretation as normal rounding was corrected after the integrator requested a check of what the student actually sees; the frozen original judgment and saved reports are FAIL. No calculator is needed: multiply 8.314 by 6 and shift powers of ten. A new edition should explicitly state rounding/use approximation while retaining the exact finite arithmetic; original remains unchanged. No figure.

**C3-E004 — Il manometro prima e dopo (5 checks, PASS).** Within the section's ideal-gas model, sealed rigid vessel has fixed n,V. Initial absolute pressure is 40+100=140 kPa. Absolute temperature factor 330/300=11/10 gives final absolute 154 kPa. Subtract unchanged atmosphere 100 kPa to obtain manometer reading 54 kPa; rise is 14 kPa. Increasing the relative 40 kPa by 10% would incorrectly give 44 kPa. Kelvin temperatures and same atmospheric reference are required, not generic proportionality of real-gas or gauge pressure. No figure.

## Reproduction and scope limits

Runtime `/private/tmp/cric-recovery-venv/bin/python`, SymPy 1.14.0 and Pint 0.25.2. Exact rational arithmetic uses `Fraction` and `sympy.Rational`; rounded claims retain nonzero residual and their actual rounding relation instead of being called exact equalities. No source answer/key import or authoring dependency.

`tests/corpus/test_examples_fluids_thermo_review.py`: **5/5 PASS, 0.216 s**. It verifies deterministic reports with 7/1 outcome, the exact original residual and separately viable rounding, rejection by `assert_activity_identity` of the incomplete original batch, honest no-human/no-publication flags, each of eight changed sources (including the already failed source), eight source omissions, five individual missing figures, and the uniquely conceptual calculation scope. Source/figure mutations occur only in memory or scratch files. A new arbitrary prose or equation cannot be approved by merely changing its binding; frozen reading requires a fresh reviewer assessment.

At original-review completion no new candidate was authored or reviewed, no registry edit, no production DB/server operation, no exam exposure, no publication. At that point `examples-fluids-thermo-008.json` was identical to its `-originals` report and deliberately FAIL for C3-E003. The separate revised-draft phase below preserves that failed published-edition judgment.

## Artifact hashes at original-review completion

| Artifact | SHA-256 |
|---|---|
| `tools/corpus_engineering/examples_fluids_thermo_activity_verifier.py` | `80f7e7fefd917052098cc7a8ab25d0ff691bf26dfffed8619a2689a0a0573b68` |
| `tests/corpus/test_examples_fluids_thermo_review.py` | `330cfb3e6ef557508243cc75e3379686ca1f6a610e3f227aa49eea3e976a94e7` |
| Both original report files, byte SHA-256 | `be234ba667cf071d1d3963f15e9a3a6e3cc90d9d180c599321775c2230b94dc7` |
| Both reports, canonical JSON digest | `8960aa4e2ac62fa107e151d133f6f0fe3c67aa4f39e38f68925295aea34f08a8` |

## Separate review of new C3-E003 v2/base1 — examples-thermo-revisions-042

Root is the new edition's author; this reviewer did not edit the candidate, binding, authoring or SVG. Independently read the entire final package row, source binding, authoring text and SVG XML, and viewed the fully rendered SVG. Only then froze the candidate/source/actual-asset signature. New statement explicitly supplies R=8.314 J/(mol·K), ideal-gas model, absolute p/T and assigned numerical values; it distinguishes exact arithmetic relative to these numbers from infinite physical measurement precision. It requests exact intermediate arithmetic and makes the separately labelled three-significant-figure form optional.

All numbers and dimensions are correct: n=1/50 mol, nT=6 mol·K, nRT=49.884 J, pressure100000 Pa, J/Pa=m³, V=4.9884·10⁻⁴ m³=0.49884 L=12471/25000 L. Decimal multiplication is explicitly explained as 8314·6=49884 followed by restoring three decimal places. The new approximation uses **≈0.499 L**, explicitly three significant figures. Bounds 49850≤49884<49950 after scaling by100000 correctly prove rounding, and error0.00016 L is below0.5 mL. None of those approximations are falsely marked equal to the exact model value. One-mole comparison factor50 is correct. Pressure100 with SI R overestimates V by1000; dividing m³ by1000 to get L errs in the opposite direction.

The three-stage SVG repeats correct assigned state, conversions, exact result and marked rounding. It explicitly says the vessel is not to scale. Its labels remain within the viewBox and are readable in the full render; no physical vessel size or process path is inferred. Local SVG bytes and the Base64-uploaded asset are hash-bound and checked by `reviewed_rows`; protected `/asset/<hash>` reference matches exactly.

The independent revised oracle has **12 checks, all PASS**; the effective eight-record report has **44 checks, all PASS**. `verify_originals` and `report(sources)` still return7PASS/1FAIL, with the original nonzero residual. `verify(sources,package,bindings)` and corresponding report return8PASS, exactly one `publicationAction=DRAFT`, seven NONE. The new draft nests the original failed judgment in `publishedEditionReview`, preserves `failedPublishedEdition=true`, source hash and edition1, and records candidateVersion2/baseVersion1. `originalEditionRetained=true` and humanNOT_RUN do not mean the old content was corrected in place or approved by a human.

Added explicit guards for pinned original ref/ID/hash, correct next edition/base, kind example without an invented answer key, complete unique single-candidate package/binding, unchanged reviewed signature and exact uploaded/local asset bytes. Rebound changed prose still fails the signature. Test-only retokening of source ref/hash, base/version or inserted answer key still fails the separate structural/provenance guards. These retokens exist only under scoped test patches, never as new production review signatures.

Expanded reviewer-owned tests: **9/9 PASS, 0.321 s**. Includes previous source/figure adversarial cases, mixed-report canonical JSON roundtrip, exact activity-identity acceptance only for the corrected mixed report, equality of the retained nested original judgment, source/version guards after test-only retoken, missing/duplicate package IDs, absent binding and missing/corrupt uploaded asset rejection. During report writing an initial new integer-bound check returned a SymPy BooleanTrue, which JSON correctly rejected; converted that check's result to a Python bool and added the canonical roundtrip regression. No candidate/hash was changed to repair that verifier serialization error. Both final reports were then regenerated successfully and deterministic replay/activity identity passed.

No registry or canonical import/browser proof was produced by this reviewer; those remain integrator work. No human approval, original source modification or publication.

### Final frozen candidate and current artifact hashes

| Item | SHA-256 |
|---|---|
| Candidate C3-E003 canonical row | `c894474dd43011a440c7a62aa3c724fb6df0e5e7b98779f4271c0013e25cf44c` |
| Reviewed signature, including source and asset | `b1ab57f00243fba73c320a0509906487f452377782883eba9120e157ce1184f4` |
| `example-gas-volume-exact.svg` | `335cd396838996a34eb341572ff788d55464a38f91cd3c23cf41deb95d492a4c` |
| `examples-thermo-revisions-042.json` bytes | `e4fcc91706723760db17ebb8fd930e1fc900373d829faf9301fa085e5e76fd01` |
| Package canonical JSON | `2d7267fe9bc6c7661e46180106b529149f48bae19ca76047c7440b2169ad9aa9` |
| `examples-thermo-revisions-042-bindings.json` bytes | `e22f5b6012efc4582db893c7d900704c594ed35883dcb929600743a03d35cf68` |
| Bindings canonical JSON | `9434dcca7c896c98028ae3aacc970c3298f9fc4edaf12b865667f5c3ccd6974d` |
| Current verifier module | `d1f1d0aaebb5988abffc6b1bd8acfe5d8d926fdd2134e3b729e1ecd5c7ad5afa` |
| Current reviewer-owned test | `c322f61602320923128a9de84fceb1ca1a438136449050fea5b15263e34c0b02` |
| Originals report bytes (still7/1) | `1c5e06cf6430747233c53d83bb06de35b4ce94cb0f1a2960d4207e103e92bb91` |
| Originals report canonical JSON | `219245c9c319b6725fdfc7d3504b88c8b283235689224ed96693cea09bfd4462` |
| Effective report bytes (8/0,one DRAFT) | `a36283e8f66a9eca902f5760d96055544857dc5c27455a33b9406d69eb208698` |
| Effective report canonical JSON | `4702a6ac047b3d4bc336260bf604c656814322f40322993786ccc2a556b5c796` |
