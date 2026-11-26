# 047 — primary source-first derivations, not final review

Independent AI reading of the ten actual C2 source IDs, pinned `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/esperienze-C2.json`. C2 catalog context is Fluidi: pressures, buoyancy and conduits, from rest to viscous motion. Source file SHA256 `33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1`. No candidate, solution-bearing source field, source ordinate or law/model implementation was read before these derivations were saved. Whole-row SHA values identify source provenance only; they are not reviewed-source approval signatures.

No browser replay or scientific approval was made. No runtime fingerprint was changed or newly certified. Human NOT_RUN, publication NONE, zero completion credit. This document intentionally retains unresolved given constants instead of inventing values from familiar textbook conventions.

The two input values per ID were traced from the generic assessment selection: source second reference abscissa, plus middle unused point of the control grid. The actual installed consumer still requires later verification, including rounding/formatter/grader, clock, geometry, phase progression, apparatus and all inputs. Empty source blocks are not evidence of absent scientific work.

The first safe projection extraction stopped because references are `[x,y]` pairs rather than objects; extraction was corrected to read index0 only. No ordinate was displayed.

## SIM-C2-L001-01 — Stati di aggregazione

Inputs: first `3`, transfer `2` 1.

Density definition rho=m/V gives V=m/rho. For each assigned state use its own given density, not a universal density inferred from its phase name. Transfer at state2 (Liquido) uses6g and yields6/rho_liquid cm3 if density is in g/cm3. The first assignment at state3 cannot be numeric without model mass and gas density.

Control is discrete1,2,3, not continuous phase interpolation. Same mass is specified for the comparison. Assigned phase densities are model data; no universal monotonic solid/liquid/gas density law or thermodynamic transition path is inferred.

Manual procedure: Divide the given mass by the state-specific density; g cancels g in g/cm3. Numerical manual work remains pending until model mass/density table is legitimately read.

Still to inspect: model comparison mass; three assigned phase densities; compressibility vs fixed toy-phase display.

## SIM-C2-L001-02 — Fluidi e solidi

Inputs: first `6`, transfer `4` cm/s.

For stationary plane Couette flow, u(z)=U*z/d under no slip. Newtonian shear tau=eta*du/dz=eta*U/d. With eta1Pa s,d2cm,U=xcm/s, tau=x/2Pa. First6cm/s gives3Pa; transfer4cm/s gives2Pa.

U0..8cm/s; nonnegative shear magnitude. Parallel stationary lower plate and uniformly moving upper plate; incompressible Newtonian constant viscosity, linear developed profile/no pressure gradient. Startup is not automatically this steady profile.

Manual procedure: The same centimetres cancel in U/d, leaving s^-1. Multiply by1Pa s and divide by2. Zero speed giveszero stress. Fluids sustain steady shear by continuous deformation; an elastic solid may sustain static shear.

Still to inspect: whether student-delivered context states steady linear Newtonian profile rather than arbitrary startup.

## SIM-C2-L001-03 — Densità

Inputs: first `6`, transfer `5` cm³.

Uniform material mass m=rho V. rho=5/2g/cm3, xcm3 gives(5/2)xg. First6cm3 gives15g; transfer5cm3 gives25/2g=12.5g.

V1..8cm3; same uniform density, content mass excluding container tare. Density2500kg/m3 is material property here, not mass or apparent weight.

Manual procedure: Multiply volume by5, then halve; units cm3 cancel. Use the contents only, not the tube mass.

Still to inspect: delivered tare/context and apparatus calibration.

## SIM-C2-L001-04 — Pressione e forza normale

Inputs: first `5`, transfer `7` cm².

Mean normal contact pressure p=F_perp/A. A=x*10^-4m2,F10N yields100000/xPa=100/xkPa. First5cm2 gives20kPa; transfer7cm2 gives100/7kPa.

Positive area1..10cm2; total normal load10N fixed. Mean pressure formula does not prove uniform local pressure or shear-normal equality.

Manual procedure: 1cm2=(1/100m)^2=1/10000m2; divide Pa by1000 for kPa. 100/7=14+2/7=14.285714...;100000=7*14285+5 supports decimal by long division. Entering14.286 gives relativeerror1/50000; actual grader tolerance still to inspect.

Still to inspect: effective formatter/parser/grader tolerance.

## SIM-C2-L001-05 — Pressione assoluta e relativa

Inputs: first `100`, transfer `90` kPa.

Open stationary liquid: dp/dz=-rho*g. At depth1m, p_abs=p_atm+rho*g*(1m). In kPa output is x+rho*g/1000 (rho SI,g SI). First100kPa and transfer90kPa become110 and100kPa ONLY IF assigned rho1000kg/m3 andg10m/s2. Relative pressure at that depth is independent of atmosphere.

Atmosphere70..110kPa; open surface, same liquid density and uniform g, depth held1m. Absolute zero refers to vacuum; relative pressure references surface atmospheric pressure.

Manual procedure: Add the same hydrostatic increment to each atmospheric value. Do not replace rho*g by10000Pa/m until actual assigned constants are read.

Still to inspect: assigned water density; assigned g; actual surface/boundary assumptions.

## SIM-C2-L002-01 — Legge di Stevino

Inputs: first `2`, transfer `3/2` m.

Sensor zeroed at surface measures rho*g*h. Assigned g10m/s2, h=xm. If water density1000kg/m3 is assigned, output10xkPa: first2m20kPa, transfer3/2m15kPa.

Depth0..3m measured downward from free surface, static constant-density liquid, constantg10. Zero depth giveszero relative pressure, notzero absolute pressure.

Manual procedure: Multiply depth byrho*10 and divide by1000. Withrho1000 this reduces to10x. Column-area cancels:rho*A*h*g/A.

Still to inspect: explicit assigned water density; actual zeroed sensor behavior.

## SIM-C2-L002-02 — Pressione con la profondità

Inputs: first `2`, transfer `3/2` m.

Quota z abovebottom differs from depth. With surface quota3m, h=3-z. Relativep=rho*g*(3-z). In kPa outputrho*g*(3-x)/1000. Withrho1000,g10, firstz2m gives10kPa; transferz3/2m gives15kPa.

z0..3m; uniform static liquid andg. Pressure decreases upward, derivative-rho*g; top boundary relative0. No negative pressures inside this assigned interval.

Manual procedure: Subtract selected quota from3 before multiplying. Never substitute quota itself for depth. Constants remain conditional until delivered context is read.

Still to inspect: assigned water density andg; actual rendered surface/depth coordinate.

## SIM-C2-L002-03 — Esperimento di Torricelli

Inputs: first `102`, transfer `442/5` kPa.

Balance on a stationary barometer column with negligible top-vapor pressure gives p_air=rho*g*h. rho13600kg/m3,g10; h_cm=100*x*1000/136000=(25/34)x. First102kPa gives75cm; transfer442/5kPa=88.4 gives65cm.

p68..108.8kPa, increments1.36kPa. Ideal vacuum above mercury or vaporpressure explicitly neglected. Nonzero top pressure would require subtraction; tube must be tall enough and surface reference clear.

Manual procedure: 13600*10=136000; cmconversion reduces multiplier to25/34.102/34=3 ->75;88.4/34=2.6 ->65. Each1.36kPa grid increment corresponds exactly1cm.

Still to inspect: actual top-vacuum/vaporpressure assumption and rendered height reference.

## SIM-C2-L002-04 — Manometro a U

Inputs: first `2`, transfer `0` kPa.

At commonbottomlevel, p_L+rho*g*(H-z_L)=p_R+rho*g*(H-z_R). Thus dp=p_L-p_R=rho*g*(z_R-z_L), so signedright-minus-left height in cm=100000*x/(rho*g) for xkPa. First2kPa gives200000/(rho*g)cm, transfer0 gives0cm. If liquidrho1000,g10 these are20 and0cm, but liquid is not assumed from apparatus name.

Signed pressure difference-2..2kPa; one static constant-density manometer liquid, negligible/known gascolumns, equal bottomreference. Equal section area needed only for symmetric displacement of individual levels, not difference formula. Positiveleft excess makes left level lower/right levelhigher.

Manual procedure: Convert kPa toPa, divide byrho*g to metres, thenmultiply100 forcm; preserve sign. Transfer0 requires no division approximation, both levels equal. Numerical first task remains conditional on material constants.

Still to inspect: identity/density of manometer liquid; assignedg; rendered right-minus-left orientation.

## SIM-C2-L003-01 — Principio di Pascal

Inputs: first `6`, transfer `5` kPa.

Pascal transmits added pressure, not equalforces across unequalareas. DeltaF=DeltaP*Aout. Aout20cm2=1/500m2, xkPa=1000xPa, so DeltaF=2xN. First6kPa gives12N; transfer5kPa gives10N.

Addedpressure0..10kPa; confined ideal static incompressible liquid, connected pistons, area fixed20cm2, no unmodeled pressureloss. Hydrostatic baseline differences may exist but same pressureincrement is transmitted.

Manual procedure: Square the cm conversion:20/10000m2=1/500m2;1000/500=2. Multiply eachpressureincrement by2. This is increment force, nottotal piston force including baseline or mass.

Still to inspect: actual piston areas/forceincrement vs total force readout; geometric rendering and constraints.

19 independent exact/SI checks executed successfully with SymPy/Pint. Two reviewer-harness errors were corrected before this successful run: the Pint quantity constructor was used explicitly, and rational unit exponents were serialized structurally to avoid Pint display-format limitations; neither changed a physical derivation. These validate the primary derivations, not source keys, consumer delivery or the still-missing constants.

Primary JSON SHA256 `df774db7d881fe6387c3d028237f2e44ccf218d8178e69d8127458563648559b`. Module SHA256 `acf55282278b8d0d06524ca11d49622498a35ead1e31ea8a56e1316d833800c3`. Safe source projection SHA256 `273adba78ecb93e16b76cb5b0a62a1a80e7108c606300ceae8259c84519a182a`.
