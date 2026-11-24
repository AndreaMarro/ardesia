# Independent AI review — examples-cycles-entropy-010

Separate AI reviewer, distinct from the historical author and from root, author of the new C3-E020 edition. Read every block of all eight originals C3-E013..020 and all five historical SVGs, including XML and full rendered views, before freezing hashes. Then separately read the complete v2 candidate package, bindings, authoring text and new SVG, and viewed its full render before freezing its independent signature. No candidate, original, SVG, registry, checkpoint or application was changed by this reviewer.

**Originals: 7 PASS, 1 FAIL (C3-E020), 39 checks. Effective report: 7 unchanged valid originals plus 1 valid DRAFT, 47 checks.** The original failed judgment remains unchanged and nested under the new draft. `humanApproval=NOT_RUN` throughout, `publicationAction=NONE` for unchanged originals and DRAFT only for the reviewed new edition. No human approval or publication is represented.

## Actual provenance

All eight IDs exist, are `ACCOUNTED` in the checkpoint manifest and originate in `officina-di-fisica/content/C3.json` at Cric commit `5d1dc8dc7b601aef959d10d564c75462be74708d`. No substitute IDs. Source file SHA-256 `44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0`, Git blob `22d6b819c0329d35f5d42699e98287acee378432`. Direct `git show` returned byte-identical content to the local JSON and all five historical figures. The eight canonical record hashes match their individual activity-manifest entries and are frozen in the module/reports.

Historical figures and SHA-256: `C3-percorsi.svg` `3bf54a3478de1a5cc2c30b33268d91d49456b432af41d5df7b0bdd2560edb85f`; `C3-espansione-libera.svg` `2680bd9d79eae11adcf6592bfc4d9e8f32091c106462c93d5c3babac9a08bb0e`; `C3-ciclo.svg` `84d1b1fb87683ae92240d45760932a7a844a5e01da70037130d703d64690cb03`; `C3-macchina.svg` `d731c50778f96cbb5e0038adb43ee4196ed99af557dece4c7de381d1485fb193`; `C3-entropia.svg` `8d95c2e3952150bb1a206ee74e61635e13fa841522aa1a06383d736ed49c7782`.

## Individual original reviews

**C3-E013 — Confrontare due espansioni (5 checks, PASS).** Same initial200 kPa/2 L and doubled volume. Isothermal ideal gas with fixed n gives pf=200/2=100 kPa. For a reversible adiabat with the assigned constant γ=7/5, combine Cv ln(Tf/Ti)+R ln(Vf/Vi)=0, Cv=R/(γ−1), and pV=nRT: pf=200/2^(7/5)=50·2^(3/5) kPa. This is the exact symbolic expression already present as200·(1/2)^1.4 in the source; no decimal precision is required by the prompt. The following **≈75.8 kPa** is explicitly secondary, not an exact equality.

The secondary number also has a real manual verification. For the lower threshold75.75 kPa, divide by50 to obtain1.515=(3/2)·1.01. Binomial expansion gives1.01⁵=1.0510100501<1.052=263/250. Thus1.515⁵<(243/32)(263/250)=63909/8000<8. At the upper threshold75.85 kPa, divide by50 to obtain1.517=1.5+0.017. Keeping only the positive constant/linear binomial terms gives1.517⁵>243/32+5·(81/16)·(17/1000)=128385/16000>8. Monotonic fifth roots prove75.75<50·root5(8)<75.85, hence the printed75.8. No numerical inverse operation is forced on the student; the exact expression is a valid answer.

Adiabatic final T/Ti=2^(−2/5)<1, so it lies below the isotherm and uses internal energy for positive work. Do not extend pV^γ to an arbitrary irreversible adiabat. The figure shares A at(167,86), has vertical isochore/horizontal isobar, and descending isotherm above adiabat; normalized graph coordinates relative to x=76,y=205 are compatible with p∝V⁻¹ and V⁻¹·⁴. No numeric tick labels are inferred from its pixels.

**C3-E014 — Lasciare un gas espandersi nel vuoto (4 symbolic checks, PASS).** This record requires no student numeric arithmetic, so only this activity uses `NO_STUDENT_CALCULATION`. It still has an actual physical verification: external vacuum gives W=0, rigid adiabatic boundary Q=0, first law ΔU=0; fixed-composition ideal gas with positive Cv gives equal equilibrium endpoint temperatures. It is adiabatic and irreversible, not a quasistatic pV^γ path. The original explicitly limits equilibrium to endpoints. Figure has eight gas particles before and after, a removed partition and unchanged rigid outer boundary. It does not imply uniform equilibrium at all intermediate times or supply velocity/temperature data to measure.

**C3-E015 — Il rettangolo nel piano p–V (6 checks, PASS).** In the quasistatic boundary-work p–V interpretation with Qin/Wout, integrate the upper expansion200 kPa from1 to3 L:400 J. Lower compression100 kPa from3 to1 L gives−200 J. Vertical fixed-volume legs give zero. Net200 J equals oriented area(200−100)(3−1), since kPa·L=J. Full-cycle ΔU=0 gives Qnet=200 J. The source correctly distinguishes this from heat absorbed on individual legs; efficiency is not determined by Qnet alone. The four arrows are clockwise with A/B above C/D and V rightward. Its unnumbered axes are schematic, not an asserted pixel scale of100/200 kPa or1/3 L.

**C3-E016 — Chiudere un bilancio incompleto (4 checks, PASS).** State-function closure gives ΔU3=−(130−90)=−40 J. The third leg produces15 J work, so Qin3=ΔU3+Wout3=−40+15=−25 J. Heat loss25 J plus work output15 J remove40 J; all three ΔU sum zero. Closed system, common sign convention and no omitted macroscopic energy term in the stated balance. No figure.

**C3-E017 — Esaminare una proposta di motore (6 checks, PASS of the example's impossibility diagnosis).** Energy balances:800−560=240 J. Efficiency240/800=3/10, while the two-reservoir cyclic limit1−300/400=1/4. Excess1/20 and maximum allowed work800/4=200 J show that promised240 J is impossible despite a closed first-law balance. Independent reservoir entropy560/300−800/400=28/15−2=−2/15 J/K violates the second law. The record correctly diagnoses that impossibility; its review PASS does **not** call the proposed engine physically feasible. Temperatures are absolute, reservoirs fixed, only these heat/work exchanges. Figure is a generic energy-flow diagram, correctly Qh into engine, Qc to cold reservoir and work outward; no numerical arrow-width scale or claim of an actual realized engine.

**C3-E018 — Consumo minimo di un frigorifero ideale (5 checks, PASS).** Reversible reservoir entropy balance fixes Qh/Qc=Th/Tc=300/270=10/9. Therefore Qh=270·10/9=300 J and Win=300−270=30 J. COP=Qc/Win=9, which is not an efficiency bounded by one. Reservoir entropy300/300−270/270=0. The general nonnegative entropy inequality(Qc+Win)/Th−Qc/Tc≥0 gives the same minimum30 J for the same extracted heat and two reservoir temperatures. No figure.

**C3-E019 — Entropia di due serbatoi (4 checks, PASS).** Reservoir temperatures are fixed as explicitly stated in the caption. Hot entropy change−120/400=−3/10 J/K; cold+120/300=+2/5 J/K; total+1/10 J/K. Heat-energy changes sum zero, entropy does not. Reservoir state changes can be computed via Q/T even though the combined finite-temperature-difference transfer is irreversible. Do not use Celsius or cancel the signed heats before dividing by different T. Diagram and signs match hot→cold with a common Q magnitude and separate−Q/Th,+Q/Tc formulas.

**C3-E020 — Espandere un gas e contare le possibilità (5 checks, FAIL original).** The physical auxiliary-path derivation is sound: for fixed one-mole ideal gas with equal endpoint T, an imagined reversible isotherm has Qrev=Wrev and ΔS=nR∫dV/V=nR ln2. Actual free expansion may have Q=0 while producing entropy; Qreal/T is not the defining reversible integral. However, the source prints **8.314·ln2=5.76 J/K**, with neither approximation sign nor declared precision in prompt or blocks. That equality is not exact. With the assigned R the exact answer is(4157/500)ln2 J/K. Manual feasibility of this symbolic form does not correct the missing approximation qualification.

A rigorous secondary arithmetic check makes the defect concrete without a calculator. From ln2=2Σ(1/3)^(2k+1)/(2k+1), the first three terms are842/1215 and the positive remaining tail is less than1/6804. Multiplying both bounds by4157/500 places the exact entropy strictly between about5.7616 and5.7629 J/K, inside the rounding interval5.755–5.765 but strictly above5.76 itself. The original result is viable only as an approximation; a reviewer cannot add the missing sign retroactively. The failed original remains in its report and in the revised draft's nested judgment. No original figure for this record.

## Separate new-edition review — examples-entropy-revisions-043

Root authored C3-E020 v2/base1. I independently read the final statement, every text/formula block, binding, authoring and SVG before freezing the source/candidate/asset signature. The new prompt explicitly gives rigid insulated equal-volume chambers, one mole initially equilibrated at T>0, vacuum in the other chamber, set removal and a new final equilibrium. It requests **exact symbolic ln2**, not a numerical logarithm. It explicitly assigns R8.314 for model arithmetic without claiming infinite physical precision.

All physical distinctions are correct: actual Q=W=0 implies ΔU=0 and equal endpoint T for a fixed ideal gas; there is no assertion of homogeneous equilibrium throughout the irreversible real process. A **different** reversible isotherm between the same endpoint states, supported by a thermal reservoir, allows δQrev=p dV, p=nRT/V and dS=δQrev/T=nR dV/V. T cancels, logarithm argument Vf/Vi=2 is dimensionless, and nR has units J/K. Fraction8314/1000=4157/500 gives exact ΔS=(4157/500)ln2 J/K. The new edition contains no unqualified equality to5.76.

The required manual check is explicit and short:1/x is between1/2 and1 on[1,2], strictly in the interior, so1/2<ln2<1. Multiply by8.314 to obtain4.157<ΔS<8.314 J/K. Positivity and dimensions are verified without a log table or numerical inversion. The new SVG repeats actual versus auxiliary paths, exact symbolic answer and integral bounds consistently. Chamber widths and arrows are explicitly schematic; they do not measure a real time path or imply that the entire vessel physically shrinks. Full render shows readable labels inside the viewBox; local asset bytes match the uploaded Base64 and its protected asset ref.

The new oracle has13 independent checks, all PASS. Effective report has8PASS/47checks and exactly one DRAFT; `report(sources)`/`verify_originals` still return7PASS1FAIL/39checks. Original C3-E020 FALSE judgment is preserved verbatim under `publishedEditionReview`, with `failedPublishedEdition=true`, original source hash/version1, candidateVersion2/baseVersion1 and originalEditionRetained=true. No human approval is inferred from signature freezing or from the integrator's separate structural import/browser reports.

## Validation and explicit limits

Recovery Python with bytecode disabled, SymPy1.14.0, Pint0.25.2 and exact Fraction/Rational arithmetic. No authoring module or source key is imported by the oracle. Model equations come from the statements and physical balances, not supplied automatic checks. Numeric intervals remain rational; the exact entropy contains a symbolic logarithm.

Reviewer-owned `tests/corpus/test_examples_cycles_entropy_review.py`: **9/9 PASS, 0.444 s**. Covers original7/1 with viable rounding not repairing its exact-equality failure; adiabatic fifth-root bounds; deterministic canonical mixed report and actual activity-identity acceptance; nested original failure; all eight changed/omitted source cases; all five required historical figures; candidate mutation with rebinding; source/version/kind-of-record safeguards after test-only signature retoken; complete unique package and missing/corrupt new asset rejection; honest conceptual calculation scope only forE014. No production pin is refreshed by those test-only retokens.

Actual scientific checks also distinguish an impossible **engine proposal** correctly diagnosed by a valid example from an invalid published **example**. Frozen reading checks are not a universal prose/TeX semantic interpreter: new content requires a fresh independent reading. No registry/checkpoint edit, candidate authorship, real DB/server operation, import/browser claim, human approval or publication was performed here.

## Frozen candidate and current artifact hashes

| Item | SHA-256 |
|---|---|
| C3-E020 candidate canonical row | `643aa168c9a4fcd8d62c638161610766b99bccd6d67a09fdf3612adb34a97a33` |
| Reviewed source/candidate/asset signature | `87add702a0089aaa85ffd06fd4be7ad507ea53d90938d5b67470834156548bff` |
| `example-entropy-state-path.svg` | `b34e21c4f91bcdace0df154c2bfd5863a612f00544c8a6269324ea9008135d26` |
| Package043 bytes | `023d502ead8b49b894609b17925d355b3f5e5c8963a71d1fdc2b23ff516022f0` |
| Package043 canonical JSON | `7b0b3c01fc0e2c27c305ff2b30b4676b5043e9e18fa6d2da7892d56dd12ddee0` |
| Bindings043 bytes | `4e172d3eb99576f97fc7504f86b1bf516125cb10f540bc8a97b5a7692452d4c2` |
| Bindings043 canonical JSON | `992d7f58657dc8cc4605cf7b414911be3cb0fae590d3589b919a1d92e2c46c61` |
| Verifier module | `6c15b3c9cc49a9cf968332e54818131af606080c26f5cc3f0d4d4ed361867465` |
| Reviewer-owned tests | `13afd2bf41cba4448b3e2502e72163aca512be400cc9bbe00a6d634b37d618c7` |
| Originals report bytes (7/1) | `328e2dcb52324f4dea19fcca1e0d404a104e8f1edf9d170bdfe90d7dd3ed3320` |
| Originals report canonical JSON | `b4d6f89acbec10c49e6889dff08a5809f53b7216afb419c5b396a2ac63558bc0` |
| Effective report bytes (8/0,one DRAFT) | `b17070653d8a7fb84e7dc6d9a2a8e9af7bc5d18b41a43c485b68b2738bd80a04` |
| Effective report canonical JSON | `b2c474552f3336e8e1d482ea4568955de8a70c10e97e35648edf1928b016fbe2` |
