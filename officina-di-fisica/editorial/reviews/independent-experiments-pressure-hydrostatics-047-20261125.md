# Original activities 047: pressure and hydrostatics

Independent AI reviewer, separate from the historical source author and the author of any future corrected edition. Sources: Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/esperienze-C2.json`, file SHA256 `33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1`. Catalog C2 is *Fluidi*, from fluids at rest to viscous motion. All ten complete records and the actual installed consumer paths were read. The earlier 19-check source-first primary remains a separate, uncredited artifact.

Runtime: `1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba`. Newly executed 140 legal control values, model/graph/readout/geometry checks and 228 real browser observations: ten activities in native/fallback at 320/1280 px, with 188 boundary/assignment frames. None has a motion clock. A separate eight-record supplement captures the full Stevino question and accepted/rejected forms in all four profiles.

Overall: **five accepted, five failed originals**. Nine source physics/manual reviews pass; Stevino has a source task conflict. The five failed IDs also have material consumer visibility defects. Nothing was registered, published or human-approved. Source versions are 1 except U-manometer `SIM-C2-L002-04`, which is already version 2 in the pinned source.

| ID suffix | Actual comparison / transfer | Source science | Consumer |
|---|---|---|---|
| L001-01 | 60 / 7.5 cm³ | PASS | PASS within scope |
| L001-02 | 3 / 2 Pa | PASS | FAIL: upper velocity arrow inside plate |
| L001-03 | 15 / 12.5 g | PASS | PASS within scope |
| L001-04 | 20 / 100÷7 kPa | PASS | PASS within scope |
| L001-05 | 110 / 100 kPa | PASS | FAIL: probe and pressure-tip labels |
| L002-01 | 19.62 kPa model reading / 15 kPa explicitly requested | FAIL | FAIL: probe; actual key 14.715 contradicts transfer |
| L002-02 | 10 / 15 kPa | PASS | FAIL: left probe hidden |
| L002-03 | 75 / 65 cm | PASS | PASS within scope |
| L002-04 | +20 / 0 cm | PASS | PASS with partial-overlay observation |
| L003-01 | 12 / 10 N | PASS | FAIL: force tips under area labels |

**L001-01, aggregation.** The same 6 g and assigned densities 1, 4/5 and 1/10 g/cm³ give volumes 6, 15/2 and 60 cm³. Divide by a fraction by multiplying its reciprocal: 6÷(4/5)=7.5. These are illustrative state data, not a universal density ordering or a continuous phase-transition path. The selector has precisely three legal states. All 24 particle markers remain the same mass representation; the separate volume indicator has the correct common scale. Bounding chambers are illustrative, not calibrated physical volumes.

**L001-02, fluid versus solid.** The source explicitly says *a regime* and Newtonian. For a stationary no-slip plane Couette profile, τ=ηU/h; centimetres cancel between U and h. With η=1 Pa·s and h=2 cm, 6 cm/s gives 3 Pa and 4 cm/s gives 2 Pa. At zero speed all stresses/velocity arrows vanish. The actual five nonzero layer velocities are linear, but the upper arrow has y=1.4575 inside the opaque plate y=[1.3875,1.5275]. Its horizontal shaft and tip are concealed. Cone radius 0.0812 exceeds plate half-thickness 0.07, so this is **not** a claim that every cone vertex is contained. Native and fallback PNGs were read; only the lower four nonzero layer arrows are recognizable.

**L001-03, density.** For homogeneous material, m=(5/2)V g: 6 cm³ gives 15 g; 5 cm³ gives 25/2 g. Multiply by five, then halve. The transfer specifies content only, avoiding container tare. Density converts to 2500 kg/m³. The rendered cube edge varies as the cube root of volume; this renderer calculation is not an additional student-assigned cube-root task.

**L001-04, pressure.** One cm² is 10⁻⁴ m². Thus 10 N on A cm² gives 100/A kPa: 5 gives 20, while 7 gives 100/7. Manual division gives 100000=7×14285+5 in pascals, then conversion to kPa. Input 14.286 has relative error 1/50000 and was accepted by the actual 0.5% grader. The relation is mean normal pressure; no uniform local-stress distribution is inferred. The contact plate area varies proportionally with A while the 10 N load stays fixed.

**L001-05, absolute and relative pressure.** The source assigns ρ=1000 kg/m³, g=10 m/s² and depth 1 m, so the hydrostatic addition is 10 kPa. Absolute pressures are 100+10=110 and 90+10=100 kPa; relative pressure remains 10 kPa. At native 320 px the entire projected left probe circle lies inside the opaque *Sonda* rectangle. Its center is (116.019,160.202) px, radius 3.811 px; the box is x=[76.430,123.783], y=[144.770,164.770]. *Superficie* also covers the red pressure tip at sampled 70–100 kPa. At 110 kPa the tip leaves that box; the claim is not extended to that point.

**L002-01, Stevino.** Hydrostatic balance gives Δp=ρgh. The source substitution and model use 9.81h; the first comparison question asks for that model reading, giving 19.62 kPa at 2 m. It does not separately specify g=10. The actual transfer **does** specify g=10 at 1.5 m, requiring 15 kPa, but the consumer rejects 15 and accepts 14.715. Direct form PNGs contain the full question and both statuses. The original version 1 therefore fails; the left-probe occlusion is a separate consumer failure. A separate author may create version 2/base 1 with explicit g=981/100 and unchanged model/references: (981/100)×(3/2)=2943/200 kPa=14.715. This reviewer created no corrected candidate.

**L002-02, quota versus depth.** Water surface quota is 3 m, so depth is 3−z and the assigned pressure law is 10(3−z) kPa. At z=2 the result is 10; at z=1.5 it is 15. Pressure decreases upward, and the relative pressure is zero at the free surface. The actual probes follow the correct vertical relation and equal-depth comparison, but the left probe is hidden by the same opaque label at native 320 px.

**L002-03, Torricelli.** The source supplies mercury density 13600 kg/m³, g=10 and negligible vapor pressure above the column. Force balance gives h=p/(ρg), or h_cm=25p_kPa/34. At 102 kPa, 102/34=3 and h=75 cm. At 88.4 kPa, 88.4/34=2.6 and h=65 cm. Each 1.36 kPa control step adds exactly 1 cm; no calculator is needed. The column fits below the closed tube top. Changes of displayed height use a common scale; the small fixed clearance offset is not interpreted as a different pressure baseline.

**L002-04, signed U-manometer.** Common-bottom balance gives pL−pR=ρg(zR−zL). The supplied calibration is +1 kPa→+10 cm; with equal sections each surface moves half the total difference. Tasks +2 and 0 give +20 and 0 cm. Negative pressure difference reverses the level ordering. At native 320 px and small ±0.2 kPa, a tip enters the edge of the Δh label by only 0.253 px horizontally; cone rim remains partially visible, and native 1280/fallback views were read. This is retained as a limited partial-overlay observation, not asserted as total invisibility or used alone to fail the activity.

**L003-01, Pascal.** Added pressure transmits through the confined fluid; force increments depend on area. Twenty cm² is 1/500 m², so x kPa produces 2x N: 6→12 and 5→10. The drawn radius ratio 2 gives area ratio 4. No common calibrated force-glyph gain is inferred, and different baseline heights are not used as a pressure-height measurement. Material failure is instead directly observed: the A₁ label covers the red tip at 2 kPa, and 4A₁ covers the green tip at 10 kPa, at both tested native widths.

The initial eight-test run correctly found a reviewer-instrument defect: its `prompt` field contained the response label. The original 228 observations, statuses, protocol and images remain unchanged. A targeted new four-profile supplement captured the actual first paragraph and eight form PNGs; it did not rerun or relabel the original matrix. Final tests must be read with that distinction.

Limits: bounded control grids/default cameras and actual Chrome environment, not arbitrary camera angles or every possible browser/platform. There is no student calibration. Empty source `blocks` arrays do not mean absent student calculations. All failures remain explicit; sources, production, global browser helpers, registry, ledger and the frozen prior C1 delivery were not modified.
