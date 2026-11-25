# Separate-author worklist: 19 failures and 4 support gaps

This is a correction proposal, not a candidate package or acceptance. No runtime, source edition or answer key was changed. Activity credit: 0. Human approval: NOT_RUN. Publication: NONE.

All 23 original records are version 1. Pure consumer fixes can retain that source version. If learner fields, selected questions or instructions change, the separate author must create version 2 with baseVersion 1 through the existing pipeline. The existing Root-authored Stevino v2 remains a partial candidate, not an accepted activity.

The JSON contains source/line/SHA pins, exact failure classifications and frozen evidence references. The shared apparatus function is an entry point; the author must inspect its complete branch and every shared caller before editing.

## SIM-C2-L001-02 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:52 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:11; static/js/banchi/voci/apparati/fluidi.js:47. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:55.

**Finding and limits.** The upper-layer velocity shaft and tip lie inside the opaque upper plate. The cone rim may protrude; complete cone containment is not claimed.

**Separate-author proposal.** Reposition the velocity annotations in a clear plane, with an explicit association to each layer. Preserve the velocity deltas, their common gain and the linear profile. Do not hide the plate or clamp the vectors to a minimum length.

**Physical contract.** Newtonian shear stress is proportional to the assigned velocity gradient. Preserve the stationary lower layer, no slip, the Pa stress readout and cm/s velocity control.

**Frozen negative scope.** Original real native view at 6 cm/s; the top arrow is missing while the four lower nonzero arrows remain. Historical native/fallback 320/1280 evidence is retained. Code geometry also covers the legal grid.

**Manual conditions.** No new manual-method defect was acquired. Preserve the original tasks, substitutions, units and accepted numeric precision unless a separate author proposes a new edition.

**Required positive/adversarial proof.** Replay the full velocity grid, including zero and the assigned 6 cm/s. Check the whole shaft, cone base and rim against both plates, labels and viewport in all four display profiles. The lower-wall zero velocity may legitimately have no arrow.

## SIM-C2-L001-05 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:172 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:29; static/js/banchi/voci/apparati/fluidi.js:60. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:83, static/js/banchi/voci/apparati/fluidi.js:84.

**Finding and limits.** At native 320 px, the Sonda sprite covers the left probe. Superficie covers the pressure-arrow tip from 70 through 100 kPa; at 110 kPa the tip lies outside that rectangle, so the narrower probe/partial-shaft finding applies.

**Separate-author proposal.** Move the labels to clear callouts or the existing HTML legend while preserving their names and their association with the probe, surface and force annotation. Do not make an opaque object transparent to conceal the defect.

**Physical contract.** Preserve absolute pressure as atmospheric pressure plus the assigned hydrostatic contribution, with kPa throughout. Varying atmospheric pressure does not change that hydrostatic contribution.

**Frozen negative scope.** The failures are observed in real native 320 px views. The 110 kPa boundary and fallback comparisons must retain their documented limits.

**Manual conditions.** No manual-method change is required by the acquired finding. Preserve the distinction between absolute and gauge pressure in both actual generated questions.

**Required positive/adversarial proof.** Test every legal atmospheric-pressure value, both probes, the complete pressure glyph and the surface reference. Use native/fallback 320/1280 and bounded named camera views. Any HTML legend must remain visible and keyboard accessible.

## SIM-C2-L002-01 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:212 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:35; static/js/banchi/voci/apparati/fluidi.js:60. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:83.

**Finding and limits.** There are two independent failures: the original transfer text uses g=10 while the installed law and numeric grader use 9.81; separately, the native 320 px Sonda label covers the left probe.

**Separate-author proposal.** Complete the already separately authored Root v2 review rather than creating a third edition. Preserve the original FAIL and the v2 partial status. Fix the shared probe-label layout independently; do not change the correct installed law to fit the inconsistent v1 text.

**Physical contract.** Use one working value of g consistently in prompt, substitution, units, references and grader. The existing v2 uses 981/100 m/s². Preserve density, depth and kPa conversion, and retain the old edition.

**Frozen negative scope.** Original source/grader conflict and real native probe occlusion are frozen. The v2 text/math partial has no accepted consumer UI and does not close either historical finding automatically.

**Manual conditions.** The separate author must provide learner-facing exact decimal/fraction multiplication and the Pa-to-kPa conversion. A reviewer-derived answer alone is insufficient; the installed numeric input and declared rounding must agree with the taught procedure.

**Required positive/adversarial proof.** Read both actual v2 questions and test their Number inputs after the manual procedure. Independently verify both probes and complete annotations over the full depth grid in native/fallback 320/1280.

## SIM-C2-L002-02 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:252 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:41; static/js/banchi/voci/apparati/fluidi.js:60. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:83.

**Finding and limits.** The native 320 px Sonda background covers the left probe, preventing the complete equal-level comparison. The right probe and comparison line remain visible; the tank is not claimed to be wholly hidden.

**Separate-author proposal.** Apply the shared clear-label/callout solution without moving the measurement points or changing the depth and bottom-height references.

**Physical contract.** Keep z above the bottom distinct from depth h=H−z. Preserve this source’s assigned working density/gravity and its pressure interpretation; do not globally replace its toy value of g with 9.81.

**Frozen negative scope.** Real native 320 px evidence at multiple legal heights is frozen, including the still-visible right probe and equal-level line.

**Manual conditions.** Preserve both actual tasks and the height-to-depth subtraction. No additional manual support failure was acquired.

**Required positive/adversarial proof.** Test the entire height grid, both probes, the equal-level line and surface label. Check all four display profiles and bounded named camera views.

## SIM-C2-L003-01 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:372 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:59; static/js/banchi/voci/apparati/fluidi.js:117. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:143, static/js/banchi/voci/apparati/fluidi.js:144.

**Finding and limits.** The real native views show A1 covering the red arrow tip at 2 kPa and 4A1 covering the green tip at 10 kPa. Both 320 and 1280 px cases were observed.

**Separate-author proposal.** Relocate the area labels/callouts so both full force glyphs and piston faces remain readable. Retain the accessible area names. The acquired failure is label occlusion; it does not establish a common force-length-scale defect.

**Physical contract.** Preserve Pascal pressure transmission, the fourfold piston-area ratio and the installed scalar force law. Any new explicit scale introduced by the author must be independently checked.

**Frozen negative scope.** Original real native 320/1280 cases at 2 and 10 kPa, with the documented fallback comparisons, remain unchanged.

**Manual conditions.** Preserve the area-unit conversion and pressure-times-area procedure in the original actual questions. No new answer key is supplied by this worklist.

**Required positive/adversarial proof.** Check both entire arrows at every pressure, including the legitimate zero case, plus piston areas, area labels and readouts. State whether vector lengths share a gain before making a quantitative length comparison.

## SIM-C2-L005-05 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:772 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:119; static/js/banchi/voci/apparati/fluidi.js:242. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:264.

**Finding and limits.** All 13 legal code states show two outgoing arrows but omit the incoming-flow arrow required by the guide. No UI observation has yet been acquired for this partial review.

**Separate-author proposal.** Add an interpretable incoming-flow annotation derived from the actual incoming flow. Audit every shared rete caller instead of hard-coding this activity’s incoming value for other models.

**Physical contract.** Preserve stationary incompressible flow balance Qin=Qa+Qb, mL/s units and the original source data. A branch with zero flow may legitimately omit its arrow; the incoming flow here remains nonzero.

**Frozen negative scope.** Confirmed code omission over the 13-state grid; UI NOT_RUN. This is not a screenshot-based finding.

**Manual conditions.** The existing subtraction task is manual. Preserve both actual generated questions; do not add an unstated flow model while fixing its representation.

**Required positive/adversarial proof.** Replay every branch split, including each endpoint where one branch is zero. Verify flow direction, junction balance, units, annotation scale and all three flow associations in the four real UI profiles.

## SIM-C2-L006-02 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:852 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:131; static/js/banchi/voci/apparati/fluidi.js:164. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:182, static/js/banchi/voci/apparati/fluidi.js:190, static/js/banchi/voci/apparati/fluidi.js:191.

**Finding and limits.** The pressure-head column extends above its glass tube at 4.5, 4.75 and 5 m/s. At 5 m/s the computed column top is Y=2.893125 while the glass ends at 2.75.

**Separate-author proposal.** Provide a tube extent and common vertical mapping that contain the full liquid readout across the domain. Preserve its baseline and pressure-head comparison. Never clamp the readout to the glass top.

**Physical contract.** Preserve stagnation-minus-static pressure ρv²/2, the pressure-head relation for the same fluid and working g, and the installed kPa readout. Keep frontal and side pressure taps distinct.

**Frozen negative scope.** Code-geometry failure only; UI NOT_RUN. The top values and glass extent are exact observations from the frozen code review.

**Manual conditions.** Preserve the original quadratic substitution and unit conversion. The author must not replace the physical square law with a visual saturation rule.

**Required positive/adversarial proof.** Test the full speed grid, zero and maximum. Inspect the entire liquid column and caps inside the glass, the two pressure heads, tap names, labels, viewport and bounded camera projections.

## SIM-C2-L007-03 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:1052 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:161; static/js/banchi/voci/apparati/fluidi.js:47. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:55.

**Finding and limits.** The upper-layer velocity shaft and tip lie inside the upper plate in all 20 viscosity states. Complete containment of the cone is not claimed.

**Separate-author proposal.** Use the shared clear annotation-plane solution. Preserve the fixed velocity profile as viscosity changes; do not change velocity to make stress more visible.

**Physical contract.** Keep the assigned gradient of 4 s⁻¹ and Newtonian τ=η times that gradient. The velocity field stays fixed while stress changes; preserve Pa·s to Pa dimensional consistency.

**Frozen negative scope.** Confirmed code geometry over all 20 legal viscosities; UI NOT_RUN.

**Manual conditions.** Preserve the manual viscosity-times-gradient task. The source’s quantity distinction between velocity and stress must remain explicit.

**Required positive/adversarial proof.** Check every viscosity, especially the smallest nonzero stress glyph, all velocity layers, complete heads/rims, stress naming, plate clearance and label/viewport projection.

## SIM-C2-L007-04 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:1092 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:167; static/js/banchi/voci/apparati/fluidi.js:47. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:55.

**Finding and limits.** The top velocity shaft and tip intersect the upper plate for all eight legal plate spacings.

**Separate-author proposal.** Apply the shared layer-annotation fix while preserving the physical gap control and the linear velocity profile. Do not restrict the control to remove a counterexample.

**Physical contract.** Keep fixed velocity difference and inverse-gap gradient, including mm-to-m conversion. The installed gradient is 40 divided by the gap in mm, in s⁻¹; do not confuse that readout with stress or velocity.

**Frozen negative scope.** Confirmed code geometry for all eight spacings; UI NOT_RUN.

**Manual conditions.** Preserve the inverse-proportion and unit-conversion tasks. No new manual support defect was acquired.

**Required positive/adversarial proof.** Check the minimum, maximum and every intermediate gap, all layer arrows and their cone rims, gap/tick names and projection in native/fallback 320/1280.

## SIM-C2-L008-02 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C2.json:1212 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C2.js:185; static/js/banchi/voci/apparati/fluidi.js:164. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/fluidi.js:176, static/js/banchi/voci/apparati/fluidi.js:177.

**Finding and limits.** The correct scalar flow ratio between doubled radius and doubled viscosity is 32, but the scene’s mean-speed ratio is 6 rather than 8. Combining its displayed area and speed gives 24 rather than 32.

**Separate-author proposal.** Correct the categorical-trial apparatus driver or its declared common velocity gain, while preserving the correct scalar measure and pipe cross sections. Do not conceal the discrepancy with a velocity cap.

**Physical contract.** For the assigned laminar, stationary, fully developed model, retain Q proportional to R⁴Δp/(ηL), mean speed Q/(πR²) and area proportional to R². Preserve all four trial factors.

**Frozen negative scope.** The acquired finding is a code-level cross-case ratio mismatch. UI NOT_RUN.

**Manual conditions.** Preserve the original exponent/proportion reasoning and both actual questions. No revised answers are generated here.

**Required positive/adversarial proof.** Check all four categorical trials. Independently compute displayed radius, area and speed with the declared gain, then compare area times mean speed with scalar Q. Hidden per-case gains cannot justify a quantitative comparison.

## SIM-C3-L01-04 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C3.json:123 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C3.js:21; static/js/banchi/voci/apparati/termica.js:43. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/termica.js:44, static/js/banchi/voci/apparati/termica.js:46.

**Finding and limits.** At −50 and −45 °C the upper red column cap lies wholly inside the opaque bulb. The frozen actual mesh-plane check covers all XYZ coordinates, rather than using Y overlap alone.

**Separate-author proposal.** Redesign the bulb/capillary/tick placement with one consistent affine readout mapping, so the whole readout cap is outside the bulb throughout the control range. Do not crop the domain or fade the bulb.

**Physical contract.** Preserve T=t+273.15 K and equal temperature increments in kelvins and Celsius degrees. Any changed geometric mapping must move the ticks consistently with the column.

**Frozen negative scope.** Code/mesh finding at −50 and −45; the −40 °C cap-outside case is a positive boundary control. UI NOT_RUN.

**Manual conditions.** Preserve the manual affine conversion and its decimal arithmetic. Geometric correction must not change the numeric measurement.

**Required positive/adversarial proof.** Check all 31 temperatures, particularly −50/−45/−40, full cap and glass bounds, both unit scales, labels, four display profiles and bounded cameras.

## SIM-C3-L07-05 — SUPPORT_GAP_ONLY

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C3.json:964 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C3.js:148; static/js/banchi/voci/apparati/termica.js:13. File hashes are pinned in JSON.

**Finding and limits.** The actual transfer needs a decimal square-root approximation. A short bound exists, but the frozen addendum identifies it as reviewer-provided rather than source-provided. This is a support gap, not a demonstrated physical-law error or impossibility.

**Separate-author proposal.** Let a separate author choose positive perfect-square expansion ratios on the existing grid, or provide a usable manual root/error/rounding procedure in a new learner edition.

**Physical contract.** Preserve reversible adiabatic ideal-gas assumptions, γ=1.5 and pV^γ constant, positive volume/temperature and cooling on expansion. Q=0 alone must not be substituted for the reversible-adiabatic condition.

**Frozen negative scope.** Gap-only frozen addendum; no UI credit and no retrospective replacement of the original partial judgment.

**Manual conditions.** The author must assign the root approximation and a sufficient error bound, or select simpler data. A reviewer’s existence proof is not evidence that students received those steps.

**Required positive/adversarial proof.** Inspect both actual questions, the finite Number parser and declared precision. Compare clock endpoints and the 40 s path with the model; distinguish an isothermal comparison from the adiabatic law.

## SIM-C3-L09-01 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C3.json:1125 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C3.js:172; static/js/banchi/voci/apparati/termica.js:241. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/termica.js:254, static/js/banchi/voci/apparati/termica.js:260.

**Finding and limits.** At cold-side heat 75 and 80 J, a heat-arrow tip lies inside the hot opaque box in all three coordinates. At 70 J it is outside. Whole-cone containment is not claimed.

**Separate-author proposal.** Place the heat/work annotations outside the opaque reservoirs and engine while preserving deltas, gain, direction and association. Audit all shared motore callers.

**Physical contract.** Preserve the reversible refrigerator with the assigned 300/450 K reservoirs, Qh=Qc+Win and Qh/Qc=Th/Tc for nonzero heat. Treat zero heat as the legitimate degenerate state.

**Frozen negative scope.** Frozen code XYZ counterexamples at 75/80 and positive outside control at 70; UI NOT_RUN.

**Manual conditions.** Preserve the energy-balance and absolute-temperature ratio procedure. Do not change the thermodynamic law to keep an arrow inside a visual normalization range.

**Required positive/adversarial proof.** Check the entire heat grid and shared engine/refrigerator branches, full heat/work heads and rims, labels, signs, gains, material bounds and camera projections.

## SIM-C4-L02-01 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C4.json:84 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C4.js:18; static/js/banchi/voci/apparati/campi.js:14. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/campi.js:34, static/js/banchi/voci/apparati/campi.js:35.

**Finding and limits.** The field tip lies inside the opaque probe from 4 through 8 cm; the whole actual glyph lies inside it from 5.5 through 8 cm. At the assigned transfer distance of 5 cm the tip, but not the whole glyph, is hidden.

**Separate-author proposal.** Place the field annotation clearly outside the probe with an unambiguous association to P. Preserve the inverse-square readout/length relation. Do not introduce an undeclared minimum arrow length or normalize away magnitude.

**Physical contract.** Keep the positive point-charge field radial and proportional to kq/r². A common gain must remain common if lengths are compared. Any explicit magnification scheme must be declared and independently reviewed.

**Frozen negative scope.** Code/actual mesh: nine tip-intersection states and six whole-glyph states. UI NOT_RUN; do not claim a screenshot observation.

**Manual conditions.** Preserve the inverse-square and centimetre conversion tasks. Any learner-visible magnification must not alter the numeric measure or grading.

**Required positive/adversarial proof.** Check all distances, including the 3/4/5/5.5/8 cm boundaries and the largest field. Verify the whole glyph and P label; the smallest field must be interpretable at 320 px, not merely nonintersecting in world coordinates.

## SIM-C4-L09-02 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C4.json:924 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C4.js:144; static/js/banchi/voci/apparati/campi.js:219. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/campi.js:223, static/js/banchi/voci/apparati/campi.js:226.

**Finding and limits.** The small Lorentz-force glyph is wholly inside the charge at 5° and 175°. Separately, the actual transfer at 95° needs a numeric trigonometric method that the original activity does not supply.

**Separate-author proposal.** Place the annotation so small nonzero forces remain visible with the correct v/B/F orientation. A separate learner edition may select standard angles or actually teach a suitable bounded numeric procedure; the author must choose its keys.

**Physical contract.** Preserve F=qvB sinθ and positive-charge right-hand v×B orientation. The force is zero at 0°/180°, but not at 5°/175°. Do not raise the zero threshold to remove small forces.

**Frozen negative scope.** Code full-glyph containment at 5°/175° and source manuality FAIL for the actual 90°/95° question pair. UI NOT_RUN.

**Manual conditions.** A reviewer-derived sin95° identity/bound is not learner support. The new edition must supply a usable procedure, or choose standard grid angles whose results can be computed with the taught arithmetic.

**Required positive/adversarial proof.** Check all 37 angles, zero endpoints and 90° maximum, complete v/F glyphs, common gain, labels and cameras. Inspect both actual tasks and unchanged Number tolerance after the author’s learner support is present.

## SIM-C5-L01-01 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C5.json:3 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C5.js:5; static/js/banchi/voci/apparati/onde.js:22. File hashes are pinned in JSON.

**Finding and limits.** The actual transfer at t/T=17/16 requires a nonstandard half-angle/nested-root numeric approximation. The original substitution does not provide the needed manual procedure.

**Separate-author proposal.** A separate learner edition may select standard phase fractions on the unchanged grid, or teach the complete half-angle, root and error procedure. No replacement answer key is supplied by the reviewer.

**Physical contract.** Preserve undamped x=A cos(2πt/T), initial positive extreme, sign and phase, centimetres/seconds and the existing clock trajectory.

**Frozen negative scope.** Original source manuality FAIL; model coherence is distinct. UI NOT_RUN.

**Manual conditions.** Use t/T fractions that are actually on the control grid and supported by the taught trigonometry, or include every extra approximation step with a sufficient rounding/error bound. Do not equate numeric-key existence with usability.

**Required positive/adversarial proof.** After authoring, inspect two distinct actual assessment points. Check familiar quarter-cycle signs, zeros and extrema against source, clock and numeric input, then complete position-glyph and label visibility.

## SIM-C5-L02-03 — SUPPORT_GAP_ONLY

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C5.json:163 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C5.js:29; static/js/banchi/voci/apparati/onde.js:47. File hashes are pinned in JSON.

**Finding and limits.** The actual transfer gives a familiar 45° phase but needs a decimal √2 approximation. A short reviewer bound is feasible; the source does not provide that support. This remains gap-only, not impossibility.

**Separate-author proposal.** A separate author may provide the basic √2 approximation/precision procedure or choose suitable quarter-period assessment points with rational outputs.

**Physical contract.** Preserve y=A sin(ωt−kx), the probe position, propagation direction, centimetres/seconds and the clock phase.

**Frozen negative scope.** Frozen support-gap-only judgment; UI NOT_RUN and credit zero.

**Manual conditions.** Declare how to obtain and round √2 by hand, with sufficient accuracy for the unchanged tolerance, rather than silently importing the reviewer’s derivation.

**Required positive/adversarial proof.** Inspect both actual generated questions and their learner-facing finite procedure. Check local probe phase, root and rational controls, Number acceptance and actual wave/label rendering.

## SIM-C5-L03-02 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C5.json:283 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C5.js:47; static/js/banchi/voci/apparati/onde.js:94. File hashes are pinned in JSON.

**Finding and limits.** The actual transfer at path difference 0.55 wavelengths requires a nonstandard trigonometric value. The source supplies substitution but no usable angle/bound calculation.

**Separate-author proposal.** A separate learner edition may choose familiar path/phase fractions or supply a concrete manual bounded method. Preserve the full interactive domain and coherent equal-amplitude model.

**Physical contract.** Keep resultant amplitude 2A|cos(πΔs/λ)| nonnegative, distinct from instantaneous displacement, with coherent in-phase sources and the original units.

**Frozen negative scope.** Original source manuality FAIL; the scalar model itself is coherent. UI NOT_RUN.

**Manual conditions.** The author must make the trigonometric values usable from taught fractions or provide the actual bound/table procedure. Reviewer-created bounds alone do not repair the original edition.

**Required positive/adversarial proof.** Inspect two distinct actual selected grid points, constructive/destructive controls and the path-difference geometry. Test manual Number entry without a trigonometric calculator and inspect the probe/amplitude representation.

## SIM-C5-L05-03 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C5.json:532 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C5.js:83; static/js/banchi/voci/apparati/onde.js:142. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/onde.js:190, static/js/banchi/voci/apparati/onde.js:193.

**Finding and limits.** For negative instantaneous pressure, the pressure-arrow tip intersects the receiver sphere in 18 observations and its rod in 22; these overlap into 22 distinct clock contexts. Part of the cone can remain visible, so complete containment is not claimed.

**Separate-author proposal.** Move the pressure annotation into a clear plane while preserving its association with the stationary receiver, instantaneous sign/amplitude and retarded wavefronts.

**Physical contract.** Preserve the subsonic moving-source/stationary-receiver model, assigned 300 m/s sound speed and source frequency. The pressure glyph is a dimensionless signal annotation, not a force or trajectory.

**Frozen negative scope.** Code-only counterexample: at u=0 and t=5 ms, tip (.84,.83,0) intersects the receiver sphere/rod. The 18+22 counts are not 40 unique states. UI NOT_RUN.

**Manual conditions.** Preserve the actual Doppler-frequency arithmetic. A visual pressure correction must not alter the physical retarded-time or frequency model.

**Required positive/adversarial proof.** Test all 17 source speeds, clock quarters, positive/negative/zero signal phases and front arrivals. Check the entire pressure glyph and receiver geometry, source/receiver names, all four UI profiles and bounded cameras.

## SIM-C5-L07-02 — SUPPORT_GAP_ONLY

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C5.json:749 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C5.js:113; static/js/banchi/voci/apparati/onde.js:262. File hashes are pinned in JSON.

**Finding and limits.** The transfer at 2.5 half-value layers needs √2. A feasible short reviewer bound is absent from the source, so learner readiness remains unverified rather than physically false.

**Separate-author proposal.** A separate edition may provide a clear hand-root/rounding method or select integer half-layer assessment points within the unchanged domain.

**Physical contract.** Preserve exponential transmission I/I0=2^−n for the assigned monochromatic model, percent units and the distinction from subtracting a fixed amount per layer.

**Frozen negative scope.** Frozen support-gap-only judgment; UI NOT_RUN.

**Manual conditions.** The author must teach the fractional-power approximation with an error bound or assign integer layer counts. Neither a numeric literal nor an unprovided reviewer bound establishes manual accessibility.

**Required positive/adversarial proof.** Inspect both actual tasks and Number acceptance, preserve the fractional original counterexample and integer reference controls, and verify beam transmittance geometry and labels.

## SIM-C5-L08-02 — SUPPORT_GAP_ONLY

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C5.json:870 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C5.js:131; static/js/banchi/voci/apparati/onde.js:346. File hashes are pinned in JSON.

**Finding and limits.** The transfer at 2.5 half-lives needs √2. The reviewer can bound it, but that procedure is not supplied by the original activity. This is gap-only.

**Separate-author proposal.** A separate edition may give the manual root/precision procedure or choose integer half-life assessment points. Do not alter the decay model to force a simpler answer.

**Physical contract.** Preserve expected N=N0·2^(−t/T½), its statistical interpretation rather than exact individual survivors, and the clock’s half-life units. Any displayed particle-count rounding must remain explicit.

**Frozen negative scope.** Frozen support-gap-only judgment; no UI observation and no physical decay-law failure.

**Manual conditions.** The author must provide sufficient root/rounding support or simpler assessment points. If activity is introduced, its ln2 factor and units require a separate explicit assumption.

**Required positive/adversarial proof.** Inspect both actual tasks, fractional and integer controls, Number entry, clock units, labels and the relation between expected count and illustrative particles.

## SIM-C5-L09-02 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C5.json:999 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C5.js:149; static/js/banchi/voci/apparati/onde.js:354. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/onde.js:360, static/js/banchi/voci/apparati/onde.js:371.

**Finding and limits.** Incident-angle states 0° through 60° have refracted ray segments crossing the opaque base. At 0°–25° the tips emerge below it; at 30°–60° the tips themselves lie inside it. Independently, the actual 30°/45° questions need unsupported inverse-angle numerics.

**Separate-author proposal.** Keep complete rays outside the base with correct angles and a clearly declared illustrative length, without opacity/clipping bypass. A separate learner edition must provide a genuine hand inverse-angle bracket/table or an approved equivalent task strategy.

**Physical contract.** Preserve n1 sinθ1=n2 sinθ2, air-to-glass indices, normal-based angle convention and degree output. On this 5° incidence grid, assessmentSelection alone cannot supply two distinct familiar exact refracted-angle outputs.

**Frozen negative scope.** Code-only 13 crossing-ray states; tip-only classification differs as stated. Assigned 30° and transfer 45° tips are inside the base. Separate original source manuality FAIL; UI NOT_RUN.

**Manual conditions.** A two-standard-input selection is insufficient if the required output still needs an inverse trig calculator. The author must supply actual usable angle brackets/sine data, or obtain a reviewed task-contract strategy while preserving physics and units.

**Required positive/adversarial proof.** Check all 17 input angles, especially 0/25/30/45/60/65/80, full shafts/cones and the base/camera/normal label. Inspect both actual tasks, taught inverse-angle method and finite degree input; do not duplicate the trivial zero point.

## SIM-C6-L01-01 — CONFIRMED_FAIL

**Version:** original 1; learner edition 2/base 1 only if learner fields change. Pure runtime correction preserves the source.

**Read-only source:** officina-di-fisica/content/esperienze-C6.json:3 at 5d1dc8dc7b601aef959d10d564c75462be74708d.

**Runtime entry points:** static/js/banchi/voci/modelli/C6.js:3; static/js/banchi/voci/apparati/onde.js:142. File hashes are pinned in JSON. Critical operations: static/js/banchi/voci/apparati/onde.js:148, static/js/banchi/voci/apparati/onde.js:150.

**Finding and limits.** The return-arrow tip (−2.13,.7,0) lies inside the opaque source/microphone sphere centred at (−2.13,.82,0), radius .15. The whole glyph is not claimed contained.

**Separate-author proposal.** Separate the path annotation from the opaque emitter while preserving outward/return direction, path association, endpoint interpretation, common scale and the moving pulse. Do not merely shorten away the return at small nonzero travel time.

**Physical contract.** Preserve d=cT/2, milliseconds-to-seconds conversion, the same propagation speed on each leg and the installed pulse clock. At T=0 the state remains finite and zero-length path arrows may be omitted.

**Frozen negative scope.** Code-only: 20 nonzero control values, 120 repeated static/clock observations. These are not 120 independent control states. UI NOT_RUN.

**Manual conditions.** Preserve both actual finite decimal tasks and the factor-of-two echo reasoning. No new manual support failure was acquired.

**Required positive/adversarial proof.** Test all 21 travel-time values and clock quarters, reflection and arrival. Inspect both complete path glyphs, the moving pulse, microphone/source/reflector labels, native/fallback and bounded cameras.

## Shared acceptance contracts

- Keep every published original and negative 1a proof unchanged. Use the existing revisionPackage/import pipeline and actual baseVersion for learner editions; never edit the historical source in place.
- This reviewer supplies constraints, not candidate statements or replacement keys. A distinct author must derive and commit the actual changes before independent re-review.
- Do not change a scalar law, legal domain, clock, units, sign or magnitude to hide an occlusion. Do not use opacity-zero, an arbitrary epsilon, vector normalization or a concealed clamp as a visibility repair.
- World-space nonintersection alone is insufficient: inspect the full shaft, head, cone rim, actual material/depth behavior, viewport and label overlays in native/fallback at 320/1280 px.
- Use the default and every camera preset actually used by these activities, plus bounded named orbit views with matrices recorded. Legitimate edge-on foreshortening is not zero magnitude; finite camera coverage does not prove all possible orbit angles.
- Changes to a common renderer, material or label helper affect callers beyond these 23 activities. Inventory those callers/benches and run actual new-fingerprint proofs; never retag historical evidence.
- Read the two ACTUAL generated questions after assessment selection. Verify finite Number input, learner-facing manual procedure, units and declared rounding. A permissive tolerance or reviewer-derived approximation is not source support.
- On the present Snell input grid and degree-output task, selecting two distinct familiar standard-output points alone does not repair manuality. A separate author must supply usable inverse-angle data/brackets or an explicitly reviewed existing-contract strategy; never duplicate the zero point or silently change the quantity.

## Sequence

1. A distinct author groups the scoped runtime fixes and new learner drafts; this reviewer does not write or self-approve them.
2. The independent reviewer reads the actual diff against frozen primaries and invariants, checking exact laws, domains, units and code geometry first.
3. Run canonical actual UI, native/fallback, camera and manual Number-input checks on the final runtime. Historical 1a evidence remains historical.
4. The integrator reconciles the failures and registry only after every required proof is complete. This worklist contributes zero activity credit.
