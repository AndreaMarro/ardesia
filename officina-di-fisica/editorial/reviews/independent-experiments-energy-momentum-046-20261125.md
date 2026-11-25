# Independent AI review 046 — original energy, impulse, centre of mass and levers

Reviewer: separate AI reviewer, not the historical author. Human approval NOT_RUN; publication NONE. No source, runtime, candidate or registry mutation. Original editions retained. Verdict: 7 PASS and 3 consumer FAIL; all ten numerical source models and all twenty actual assigned calculations are correct and manually feasible. A technical browser run PASS does not approve the three visual failures.

Pinned source: `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/esperienze-C1.json`, file SHA256 `84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3`. Actual runtime profile before/after execution: `54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d`. The verifier freshly executes the installed engine on every report; only pure exact expressions are memoized, never runtime results or approval.

Coverage: 145 reachable control configurations, 177 elapsed/collision clock frames, all graph/readout models and actual apparatus coordinates; 79 independent exact/dimensional checks and 20 formatted input roundtrips. Total report 114 checks, of which five consumer scene checks retain three failed records. Source collision version 2 explicitly treats zero speed. No static SVG blocks exist for these ten: the live apparatus, labels and renderers were read instead.

Observed consumer run: 57 technical cases (20 native/fallback defaults, 29 native boundary states, 8 signed collision frames). All 20 real assessment tasks reject a wrong answer and accept an independently solved value. Independently viewed native images cover all ten IDs, with rigid/torque reviewed at their critical boundary rather than default; all ten default fallback images were viewed. Not every PNG in the 57-case run was visually inspected. Other states are programmatic assertions.

## Individual calculations, assumptions and visual judgments

### SIM-C1-L008-01 — PASS

Source canonical SHA256: `2b8d6d010928997afc9f7fd8d8c11280c378b19a5d62ba6a00697c899b1c9d12`.

Horizontal-path line integral of constant opposing2N friction is-2*length J; gravity work only depends on equal endpoint height and is0. Piecewise planar zigzag has true physical length when segment sqrt(dx²+dz²) is summed, to be compared with controller, not assumed schematic. Generated tasks4m=>-8J and3m=>-6J.

Horizontal planar piecewise-smooth paths, same endpoints within each comparison and equal height. Constant kinetic friction2N always opposes tangential motion; no other dissipative work inferred. Path control1..5m, direct path1m. Gravity conservative with zero height change; corners are ideal geometric constraints, not an assigned acceleration history.

Four zigzag segments have dx1.55/4, alternating dz=(1.55/4)sqrt(L²-1), so sum of lengths1.55L with common1.55scene/m scale; direct endpoints span1.55. At L1 paths coincide correctly. Their common vertical level ensures zero weight work. Endpoint z translation between separate trials is not falsely called a change of relative endpoints.

### SIM-C1-L008-02 — PASS

Source canonical SHA256: `9c45efcc810be79778c82fbbc3c64b2d0a4a189091f4f544f7c2618b2f2650e6`.

Assigned weight1N and springk10N/m; h=x_cm/100m. Gravitational increase .01xJ=10x mJ; spring increase .5*10*(x/100)²J=.5x²mJ. Total10x+.5x²;10cm150mJ and generated5cm125/2mJ. External lifting agent implied, not free equilibrium of the unloaded vertical spring.

Assigned weight1N, ideal springk10N/m initially unstrained below body, common positive vertical rise/extension0..10cm. Potential reference at that initial quota/unstrained spring. Externally imposed lifting, not spontaneous equilibrium of an unsupported weight at the unloaded position. No mass/g value or actual material yield calibration invented.

Vertical spring length1.5+0.105*x_cm, mass centre1.6+0.105*x. Height increase and spring extension have common metric, no force arrow falsely showing free equilibrium. Energy contributions independently checked in mJ, and zero reference is assigned, not inferred from desktop pixels.

### SIM-C1-L008-03 — PASS

Source canonical SHA256: `d22fc2f2c71f9e014f8416f7093cf82d2e4ef54e2a9cd75451dba35383eb280f`.

Conserved mechanical energy from rest at h0=5m,m1kg,g10 is50J. U10h and K50-10h on0<=h<=5. Tasks2m=>30J, generated2.5m=>25J. Static height comparison, not a prescribed-time trajectory.

Mass1kg,g10m/s², from rest at5m, no friction; mechanical energy50J. Quota0..5m, potential reference at zero quota, not an asserted physical tabletop height. Static comparison of energies at selected positions, no clock or post-impact rebound model.

Quota maps linearly to sphere centre0.3+0.41h, red weight constant, no inappropriate20N label from the different tension caller. K and U readings sum50. Figure is an energy-at-height comparison; no elapsed-motion trajectory or quantitative force-arrow scale inferred.

### SIM-C1-L009-01 — PASS

Source canonical SHA256: `eccdf47fee4ba0e66fa1b39662cc1fb43a15668928e9afdef5e08533cc54f91e`.

Impulse4N*t changes momentum from0. Mass8kg has a1/2 m/s², v=t/2, displacementt²/4. Tasks2s8Ns, generated1.5s6Ns. Ns=kgm/s. Actual elapsed clock must synchronize scalar, speed arrow and position.

Mass8kg from rest under constant net4N along one straight axis; duration0..3s, a0.5m/s². Impulse equals signed momentum change; zero duration0impulse. This is an elapsed-time experiment, not independent repeated-parameter animation.

One purple cart centre-1.8+t²/4, velocity-arrowdelta t/2, elapsedinput0..3s. Geometry, scalar4t impulse, clock and readings share the actual elapsed instant. Cart shape is illustrative, not an inferred8kg-from-volume calibration.

### SIM-C1-L009-02 — PASS

Source canonical SHA256: `30b511ec4f02a6306a50fdcf8154e765d0427287ed06d1213ba321fe11d2afb6`.

Equal masses, isolated perfectly inelastic collinear collision: m*u+0=2m*v=>v=u/2. Kf/Ki1/2 only u!=0; u0 both K0 and no collision, source explicitly distinguishes. Generated transfer0 gives unchanged0 velocities; source first tasku3=>1.5m/s. Before/after event at0.5s must be checked with signed approach side, current velocities and final-labeled instrument; no ratio0/0.

Equal masses, initially B at rest, perfectly inelastic collinear contact at0.5s with negligible external impulse. Initial u-3..3m/s sets approach side; scalar readout is explicitly final, while position signal/arrows are current. At u0 both energieszero, no collision and no numerical kinetic ratio0/0. Sourceversion2 explicitly describes this degenerate branch.

Native/fallback before/after contact in both signs read. Motion uses physical A=centreB-sign0.7+u*min(t-0.5,0), B=centreB=u*max(t-0.5,0)/2; scene positions gain0.8. At contact separation0.56 matches two cart half-widths0.28, rather than an unexplained gap/overlap. Velocity arrows correctly change from u/0 to u/2,u/2; time plot/current-A readout agree. Base no-time pose is separately checked and is not mistaken for the animated frame.

### SIM-C1-L010-01 — PASS

Source canonical SHA256: `f6b55612be3759babf84f15ac73ec255231ebfaab03289b66c4d86eb4a4edd2f`.

mA1kg,mB3kg,xA=-2+t,xB=2+t; xCM=(xA+3xB)/4=1+t, velocity1, zero acceleration. Centre is3m fromA/1m fromB. Tasks2s=>3m, generated1.5s=>2.5m. Renderer off=-.9 andscale.65 keep both carts on rail through3s; do not falsely infer raw position exceeds rail before applying actual mapping.

Point centres for masses1/3kg, both +1m/s from positions-2/+2m, zero net external horizontal force, elapsedtime0..3s. Centre weighted by mass, not visual cart volume or arithmetic midpoint. Actual off=-0.9/scale0.65 keep cart centres/wheels on the rail over the whole domain.

World x=-0.9+0.65*physicalx; centre marker uses the same mapping. At t3 heavycart centre2.35 with outerbody2.63<rail2.65, and lightcart start-2.2 also fits. Centre stays between carts and three times closer to heavy in physical distance. Body height styling is not a claimed density/volume measurement.

### SIM-C1-L010-02 — FAIL consumer

Source canonical SHA256: `3cd2f92e596fc283f3701196e6a1dfa830fbedaa3be927f5529d2d1d5ded7a63`.

Rigid endpoint separation20cm decomposes20cos(theta),20sin(theta), squared norm400cm². First task90=>20cm; algorithm transfer45, not50, yields10sqrt2cm. Manual14.14²199.9396<200<200.2225=14.15² gives sub0.5percent numeric14.14. Arbitrary slider angles are observations, not all assigned inverse-trig work.

Ideal rigid20cm endpoint separation, angle0..90deg in a fixed vertical plane, static configuration comparison with no angular-speed claim. Measurement is endpoint vertical difference, not half-rod from fulcrum. Native occlusion of the lower marker at90deg is separate from correct geometry and manualsin45.

Rod endpoints pivot+/-unit direction have invariant2sceneunits representing20cm; actual90deg difference2scene. In native3D the lower endpoint r0.11 at y0.25 is fully inside support r0.13 on0.08..1.25, so lower half is lost visually at the assessed90deg. Fallback paints the marker over the support; this is a consumer FAIL, not wrong20sin(theta).

### SIM-C1-L010-03 — FAIL consumer

Source canonical SHA256: `87d69e9d1164d74700948dce8e744e4e8613d0fcb28e3667f268ab5847d83634`.

Moment magnitude10N*(b_cm/100)=b/10 Nm; signed CCW-positive torque would be negative for right-down force, but source explicitly measures modulus. Tasks30cm3Nm, generated20cm2Nm. Pivot reaction haszero moment and actual perpendicular distance, not total rod length, is used.

Constant downward10N at a perpendicular right-side arm0..40cm. Source explicitly reports torque magnitude; signedz with CCW-positive would be negative. A pivot reaction has zero moment about pivot. At zero arm force remains nonzero though torquezero; native support hides that force arrow.

Right force arm worldx=b_cm/24, force delta-0.8 for10N; left reference extension is not the arm. At b0 the entire red force arrow lies inside the post, although the actual10N remains. Source explicitly distinguishes torque modulus and clockwise sense. Native zero-arm visibility remains FAIL.

### SIM-C1-L010-04 — PASS

Source canonical SHA256: `89d0958e0230b3d1213481b542974af688857d4825eae01cb66e50094ec2fb96`.

Equilibrium about pivot:6N*20cm=F*b_cm; F120/b N. Positive arm10..40cm. Source30cm4N, generated26cm60/13N. Long division60000=13*4615+5 gives4.615N; relative error1/12000<0.005. Opposite sides/downward forces have opposite moments; fulcrum reaction provides translation balance and is not another pivot torque.

Ideal weightless lever, opposed-side downward forces6N at20cm versus positive balancing force at10..40cm. Pivot supplies translational reaction; no reaction torque. Equation is rotational balance, not a claim that the two downward forces cancel vectorially. Positive nonzero arm makes inverse identifiable.

Left arm b_cm/22/right20/22, downward arrows F/10 and6/10 use common scale. Their moments match; net downward forces are balanced by pivot reaction, not by one another. Both native and fallback show two forces and separate application sides.

### SIM-C1-L010-05 — FAIL consumer

Source canonical SHA256: `e8e0c72bb68751a27756cf288ae133a61450c3d7f832271d6aa6870419d9201a`.

Same-side muscle-up andhand-weight-down have opposite moments: T*b=10N*30cm, soT300/b_cm. Arms2..6cm imply T150..50N. First task6cm50N, generated4cm75N. Uses perpendicular musclearm; neglects forearm weight explicitly. Joint reaction notzero and no physiological calibration/patient recommendation inferred. Manual torque balance remains correct; load visibility is a separate observed consumer failure.

Ideal static forearm lever; muscle and10N hand load on same side with opposite vertical forces. Perpendicular musclearm2..6cm, loadarm30cm; forearm weight neglected explicitly. Joint reaction generally nonzero. This is a toy mechanics calculation, not a patient/muscle calibration or biological force safety estimate.

Rod same-side handarm1.9 represents30cm, musclearm1.9*b/30. Muscle up T/90 and load down10/90 have common scale and correct moments. Default and assigned4/6cm native photos do not reveal the red load direction recognizably; nominal shaft-minus-marker radius1/900 is only a size comparison, not total containment or an exposed-mesh bound. Fallback overpaints a red glyph. Consumer visibility FAIL is separate from correct torque balance.

## Three concrete consumer findings

- **SIM-C1-L010-02**: P3 native3D at actually assessed90deg: lower marked endpoint at y0.25 and the lower half of the rod are hidden inside the opaque support. Endpoint sphere r0.11 is contained by support r0.13 on y0.08..1.25. Only upper half/one marked end is visible while the task asks full20cm vertical separation. Scalar rigid-body relation and manual tasks correct; fallback overpaints the lower marker.
- **SIM-C1-L010-03**: P3 native3D at reachable zero arm: constant10N force remains nonzero but its whole downward force arrow is inside the opaque pivot support. Arrow length0.8 lies on support axis y1.25..0.45, inside support y0.08..1.25/r0.13; shaft/head radii0.028/0.0812 fit. Moment0 is correctly caused by zero lever arm, not vanishing force; the visual loses that distinction.
- **SIM-C1-L010-05**: P3 native3D load10N direction is not recognizably visible in the default and both actually assigned4/6cm views. Red arrow length1/9 starts at centre of opaque hand marker r0.11, with shaft-minus-nominal-radius only1/900; actual polygonal mesh/projection determines the exposed cap and nearly all is masked. This is observed default-projection visibility, NOT a claim of total3D containment. Muscle arrow is visible. Fallback overpaints the red glyph. Scalar torque balance/manual answers correct.

The human-lever issue is near occlusion in the actual default projection at default 3 cm and assigned 4/6 cm, not total containment or invisibility from every camera. The nominal 1/900 scene-unit shaft-minus-radius comparison is not a bound on exposed polygonal mesh. The rigid lower endpoint and zero-arm torque arrow have separate analytic containment arguments. Torque zero arm is reachable observation, not a graded transfer. No incorrect scalar physics is alleged.

## Durable evidence and limits

Critical real PNG bytes and exact input/mode/SHA manifests are in `editorial/reviews/evidence/energy-momentum-046-negative-20261125/`. Fallback images are reference states (30 degrees, 10 cm, 3 cm), not same-input comparisons to 90 degrees, zero arm or 4/6 cm. Source and runtime remain unchanged. The separate 045 evidence manifest likewise says fallback −2 cm differs from +1 cm and that its original t=0 viewport does not visibly contain the mean-power readout; the frozen DOM case preserves the actual mean label/value.

Adversarial tests mutate each source, scalar, re-bound assessment answer/formatter, grid coverage, independently modeled physical coordinate, clock signal, graph/readout; invalidate runtime profile/files, mid-run changes, engine errors/missing comparisons and proof/protocol/critical image identities. The first geometry mutation test was RED because it targeted a decorative spring rather than the independent ball coordinate; the test was corrected to target the modeled physical coordinate, without production changes. Test result is recorded in the completion message after execution.

## Reproducibility identities

- `tools/corpus_engineering/experiments_energy_momentum_046_verifier.py`: `2b6cbeb4a2f58b8ae546e60ac058801c20602f768f4867fc2bab2ccc75222056`.
- `tests/corpus/test_experiments_energy_momentum_046_review.py`: `73cdb1b32f01096c938599f1752ff8d05b4598e67773a7e8b75dfcbb9f08edec`.
- `tests/corpus/browser-experiments-energy-momentum-046.mjs`: `dedd53a2a8a593f75c8a8ed8c1cd18c01ae9f74b847307968748b10a3bc21f64`.
- `editorial/reviews/experiments-energy-momentum-046-browser-originals.json`: `52f889654d1b6afb8497855d7684d1630c0217495c6849ced22734c9cc2b4478`.
- `editorial/reviews/experiments-energy-momentum-046.json`: `3da592a5c4342d8220c1ce3e0b8e93a81873ff8ad42865e8468817805718e022`.
- `editorial/reviews/experiments-energy-momentum-046-originals.json`: `3da592a5c4342d8220c1ce3e0b8e93a81873ff8ad42865e8468817805718e022`.
- `editorial/reviews/evidence/energy-momentum-046-negative-20261125/manifest.json`: `ba5ccfbe0e140c7f1e5e96b291da7d8c20db086db6a1c715bfa82ba0f7e68500`.

Canonical report digest: `26b172f46f17472e0342bac1ccfde41ca4d4887cdadb895250c5e6528e41000a`. No registry credit or statement of human approval follows from this review.
