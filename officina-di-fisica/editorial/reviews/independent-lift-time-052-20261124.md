# Independent AI review — lift-time-052

Root authored these16 candidates; this separate AI reviewer authored no candidate, statement, option or SVG. **Blind phase completed first:** extracted only the16 source IDs/prompts from Git shard U2-04 at `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, without keys, solutions or options. Solved all16 from an independent useful-work balance and recorded those answers before opening candidate packages. Then read all final candidate prompts, five-option sets, every solution/hint/error block, metadata/bindings, and the SVG XML/full render. Hashes were frozen only after that reading and the author's final wording correction.

**16/16 PASS as DRAFT; no human approval or publication.** `publication=DRAFT` and `humanApproval=NOT_RUN` for every result. The separate actual registry-identity helper accepts all16 fresh results. This review does not claim the integrator's structural import or browser checks, student calibration, or completion of the full corpus.

## Independent model and provenance

For the upward uniform observed segment, balancing lift force is mg. Integrate useful lift work ∫₀ʰmg dz=mgh; constant useful power gives PT=mgh and T=mgh/P. The load's gravitational work is−mgh, useful lift work+mgh and total-force work zero, consistent with ΔK=0. Taking load+Earth instead places potential energy in the system and the useful lift work across its boundary. The candidate explicitly excludes startup/shutdown, fixes h2m and uniform g10m/s², and defines P as **useful** mechanical power to the load, rather than absorbed machine power. An unknown efficiency is therefore unnecessary. All divisors and durations are positive.

Source: `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json`, file SHA-256 `78b540e0bf35105eb6a849b3fa85937b84071c8080425e7b7ddf8f2e2d5eb980`. All16 full-row source hashes in bindings were compared with the actual Git rows at that ref; they are independently pinned in the verifier, in addition to the frozen candidate/source/asset signatures. Runtime cannot refresh these literals. Author provenance envelope hashes, ref/path/ID, DRAFT status and no-human-approval state are checked separately.

## Per-ID reading and arithmetic

| Suffix | Independently solved result and individual review |
|---|---|
|01|2kg weighs20N; useful energy20·2=40J;40/2=20s. Correct useful-work versus net-work distinction;P already useful.|
|02|J/(J/s)=s. Options m,kg,s,J,W are physically distinct; only s is duration. g,h retain dimensions even when numerically fixed.|
|03|PT=mgh⇒T=mgh/P. Key `mg h / P`; alternatives inverse, product or different mass/power placement are not equivalent. In particular product has J²/s, reciprocal1/s.|
|04|Energy40→80J at2W means20→40s, doubles. Same P does not mean same velocity: v=P/(mg) halves. Other offered factors do not match linear mass scaling.|
|05|PT40J divided by gh20J/kg gives2kg. Control mgh40J.|
|06|40J/20s=2W; v2/20=1/10m/s and Fv20/10=2W. Final wording explicitly says **energia utile totale del tratto**, removing an unnecessary ambiguity about total input or net work. No numeric/key change.|
|07|Same40J:20s at2W,10s at4W;TB/TA=1/2. Offered2 is reciprocal,1/4 and4 are spurious quadratic factors.|
|08|Correct20s; proposed40s gives signed proposed−correct=+20s. The proposed value would transfer80J. Sign is estimation direction, not motion direction.|
|09|m=PT/(gh); J/(J/kg)=kg. Other formula options fail algebra/dimensions; division by positive gh is valid.|
|10|TB/TA=[κ1mgh/(κ2P)]/[mgh/P]=κ1/κ2. With both factors1 the answer is1, not the offered sum2. Equal common scaling leaves T unchanged.|
|11|TA40/2=20s;TB120/4=30s;ratio3/2. Distinct offered1/2,2/3,2,3 isolate incomplete factors or reverse the ratio.|
|12|Equal-weight durations mean(20+30)/2=25s. Mean inputs m4kg,P3W give80/3s, a different operation; total time50s is not the mean.|
|13|Target30s for6kg requires120/30=4W;PB/PA=2. Ratio2 is dimensionless, distinct from4W new power.|
|14|Continuous dimensionless display: a60/(20s)=3s⁻¹. Reading90 gives30s;4W·30s=120J⇒6kg. Raw90 is not seconds; display continuity excludes an invented integer-tick restriction.|
|15|TA20s/TB30s and readings41/61 give a2s⁻¹,b1 dimensionless. Reading81⇒(81−1)/2=40s⇒m4kg at2W. Alternatives2,3,5,8kg predict readings41,61,101,161, so exactly one works. Raw reading ratios retain offset.|
|16|Dimensional constraint m=cP,c1kg/W givesT=cgh=20s for **every**P>0. ParameterizationP=λW,m=λkg for all realλ>0 satisfies both measurements; Jacobian rank1 confirms redundancy. Infinite continuous positive pairs, not one or finitely many integers.|

Gain for14/15 has units1/s; b is dimensionless because the final candidate explicitly defines S as a continuous pure number. The coefficient in16 has kg/W, so writing numerical m=P never asserts equality of incompatible physical dimensions. Source-prompt blind solutions already gave these answers before seeing the candidate keys.

## Figure and pedagogy

`lift-time-progressive.svg` was read and rendered in full. Centers at y155/275 differ by120px; declared60px/m gives2m exactly. Four energy rectangles have equal125px widths and labels10J, total40J. The timeline has equal125px intervals at0,5,10,15,20s;10J per2J/s takes5s. These are separate declared height/energy/time scales; the block dimensions are explicitly schematic. Useful work positive and gravity work negative are correctly stated. Asset bytes match the uploaded Base64, `/asset/<hash>` reference and binding. No clipped or misleading scale label was found in this scientific asset reading; private-browser responsiveness remains an integrator check.

The C1 skill/prerequisite mapping covers force/work/energy/unit prerequisites; explanations distinguish mass from force, energy from power, pure ratios from units, mean outputs from mean inputs, and calibrated display from time. Course metadata and source envelope were read, not treated as scientific proof.

## Reproducible adversarial checks

Independent module imports only shared integrity code, SymPy and Pint, never authoring/key code. Exact `Fraction`/Rational arithmetic, SymPy inverses/scaling/affine solve/rank, and Pint SI cancellations support the oracle. `tests/corpus/test_lift_time_review.py` has7 tests; the two-family run passed **14/14 in0.934s**. Each of these16 wrong numeric or alternative-choice keys is rejected **after** rebinding and a scoped test-only signature retoken, demonstrating an actual answer oracle beyond a frozen hash. Each of16 rebound changed statements without a new independent signature fails. Empty/subset/duplicate identity, source/ref/version mutation after test-only retoken, missing local SVG/corrupt upload and equivalent W/J/s distractors are rejected. Report canonical roundtrip, fresh determinism, modes, no-human-approval and DRAFT status are checked.

Two reviewer implementation-run errors were corrected without changing any candidate: Pint could not format Fraction-dimensionality as a whole string, so identities now use tuples of exact dimension exponents; a missing space in a test ternary was corrected. The subsequent14-test run and fresh report/registry-identity checks completed successfully. No failed run is claimed passing. Test-only retokens never modify production frozen signatures.

## Final snapshot hashes

| Artifact | SHA-256 |
|---|---|
| Candidate package bytes | `463ba5420c12d6c26875e6c29038bd2082948d3b354f1d05c28586f18abea409` |
| Candidate package canonical JSON | `ca20dc7dc2dd91d68e38d6f0ab657af1666608be1b83d05a073de9a3760a8734` |
| Bindings bytes | `a37d3f0ccce7f6dcf5633a0d64335f90ede9fb3287609708ad0e32b56c3dd3db` |
| Bindings canonical JSON | `114c4f51ae4e55ceecca0426f43cb9a5aa47ce9b37c689e0cd20ec550c6373eb` |
| Scientific SVG | `00fff4945f634eac90cff28e557d34794c9699afa56cdfd1587c9a8a06fbaaa4` |
| `lift_time_verifier.py` | `803501b28a87164031202838bd750ffe88c7a44f04d83efdc6f49d2cff1820e9` |
| `test_lift_time_review.py` | `1a2c887665e709b2b752282137d067ae0e902193400a15fa6aa93bc7aa3c27bd` |
| `lift-time-052.json` review bytes | `52985ff2356a23035eeb805c732069930045a66d3e5895ed5c9f2bcebda90c18` |
| Review canonical JSON | `40cedd610431700c8b7b353439845f0b590b1eda367336dd4dfb6f57b9a1e44b` |
