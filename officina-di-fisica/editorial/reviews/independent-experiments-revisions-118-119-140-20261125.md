# Independent AI review: experiments118/119/140 and16 effective records

Reviewer is a separate AI agent from all three revision authors. Human approval NOT_RUN; no publication. Original physics/reference/control records remain pinned to Git5d1dc8dc7b601aef959d10d564c75462be74708d. Original037/038/041 negative snapshots are immutable and are not reclassified by this review.

FINAL AI REVIEW:16/16 effective records PASS,3 additive DRAFT editions,162 exact/conformance checks, all271 reachable slider inputs. Final independent consumer58/58 PASS on54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d with identical pre/post profile;8/8 tests PASS in38.454s. Each of the3 revised records retains a separate nested published-edition FAIL. No human approval or publication.

Each original was previously read in full, including generated assessments, stage guides, readings, clock behavior, apparatus and graph. The effective16 are reread/replayed on the corrected runtime. New candidate blocks and both uploaded SVG XML/native renders have been read independently, with exact solutions derived before acceptance. Source approval flags are not used. The tests are reviewer counterprobes, not empirical student calibration.

## Per-record mathematics, domains and representations

### SIM-C1-L001-01

Physical/manual sourcecorrect:2*10^n metres becomes2*10^(n+6)micrometres. Integergrid-6,-5,-4,-3,-2gives2,20,200,2000,20000um; advancingoneexponent multiplies10. Actualgeneratedfirsttaskn-3=>2000um,transfern-4=>200um. No calculator. Current formatter displays2000 without grouping; actual copied literal is accepted. Historical2.000→2 failure remains in037.

Domain/assumptions: Idealcaliperdemonstratesdecimalpowers/units, ninteger-6..-2, d2*10^nm,notempiricalpaperthickness/metrologyclaim. Verysmallgapsuseexplicitlabelledzoomdetail;scalarconversionssamephysicalthickness.

Representation: Readcalibro/meccanicaandgeometria3D/fallback. Mainjawgap4*(d_um/20000),sameµmscale;whenfraction<.06explicitDettagliozoomlabeluses10powerandgapmultipliedconsistently. Idealnotactualmetrologyresolution. Actual3D/fallbackrenderandminzoomviewreviewed;current ungrouped display/input roundtrip separately verified; historical failure retained.

Source record canonical SHA256: `95be0791df31f0b0e38b8055a618719112a1b0f0f32b1c76db2eed1664581211`.

### SIM-C1-L001-02

Physical/manual sourcecorrect:volumeell³withellincm givescm³. References2³8/3³27, generatedtransfer4³64. Countcellsinthreedirections,faceareaell²;doublingsidegives8volume,not2or4.1cm³=1e-6m³becausecubedprefix. Finiteintegerproducts,notcalculatorreadoutonly.

Domain/assumptions: Cubeedgepositive1..5cm,Euclideanvolume/facearea,unitcubescm³,constantcommonmetricgeometry. Surfacegriddrawingshowspartitions;nounseenmaterialdensityorprecisioninferred.

Representation: Read3Dcubeconstructionat2.05*x/5sceneunitsisotropically,cellcountxperedgeandthreefamiliesoffacelines. Exactvolumechangesx³,faceareaextra-readingx²;no arbitraryvolumeperpixel. Fallbackobliqueprojectionpreservessame3Dgeometry,notisometricmeasurementfromscreenpixels.

Source record canonical SHA256: `c170530c1f7116c9574fe3af3a1065bd61500761afb652e79f985d71a5c708de`.

### SIM-C1-L001-03

Physical/manual sourcecorrect:1cm10mm, sothenumberincm=x_mm/10. Reference10=>1,25=>5/2=2.5cm; generatedtransfer26=>13/5=2.6cm;zeroaperturezero. Samejawpositions/readingsconvertunits,notphysicalsize. Finitedecimalsmanual.

Domain/assumptions: Samephysicalcaliperopening0..50mm,linearunitconversioncm/mm,noerrors/offsetassigned. Closingjaws0isvalid;rendererillustrationnotrealcalibrationclaim.

Representation: Readsamecaliperlinearjawopening4*x/50,ticks50equalintervals,10mmpercmreadingconsistent. Zerojawgapallowed,notnegativegap. 3D/fallbackrendersactuallyseen.

Source record canonical SHA256: `29dc5d3c82f32dd484b34ecd5be9ae998fce5b57e91596b4e9b63a08e415472c`.

### SIM-C1-L001-04

Physical/manual sourcecorrect:rho1000kg/m³andinnercubeellmetresgives1000ell³kg. References1=>1000kg1t,2=>8000kg8t;generatedtransfer4=>64000kg64t. Rhoisassignedroundedconstant;waterstate/realstructuralcapacitynotinferred. Current formatter displays8000/64000 without grouping, and copied values are accepted. Historical grouped display failure remains in037.

Domain/assumptions: Cubeinnerside1..5mfilledhomogeneouswateratassignedworkingrho1000kg/m³, massesinKg/tonnes,notweightsinnewtons. No realreservoirthermalexpansion/compressibility/structuralengineeringcapacityassertion.

Representation: Readisotropicwatercubegeometryproportionaltox,scaledillustration,notclaimingmetresperrenderunit. x2/x1sidefactor2supportsvolumefactor8. No quantitativeunitcubegridassignedwhenonlyouterboxshown. Actualrenderlabels/readingsshow8000kg;current ungrouped display/input roundtrip verified; historical failure retained.

Source record canonical SHA256: `5040595c576e6ba26e06a372bb12f9e3f8dd69e7e6bc5c5549a5a26c73358d1b`.

### SIM-C1-L001-05

Physical/manual sourcecorrect:60gpersample,30cm³peridenticalsample. Npiecesmass60N,volume30N,density60N/(30N)=2g/cm³invariantforpositiveintegerN. References2=>120g/4=>240g,generatedtransfer3=>180g. No extensivedensityadditionorclaimarbitrarymixesaddvolumes. N1..5onlyactualcontrol,discretegraphmarkers.

Domain/assumptions: NpositiveintegeridenticalsamplesN1..5,each60g/30cm³,samematerialstate. Addsamematerialmassesandvolumes;densitynotextensive. Pesa60gisordinarymassreadinglanguagewithgunit,notforceunitclaim.

Representation: ReadNconstant-sizeboxesatnonoverlappingpositions,eachsamegeometry,correctN1..5count. Extraactualreadingdensity2g/cm³invariant. Diagramnotnumeric30cm³-per-pixelcalibration;no color/opacitymassinference.

Source record canonical SHA256: `6ebf5c65c1f32d8f6708e2c9e88963abfa842bef3d3882b60c9e408f46b28f91`.

### SIM-C1-L001-06

NEW DRAFT: v=4m/s; vx=v cos(theta). Orthogonal90deg gives0; antiparallel180deg gives-4m/s. Speed remains4, since16cos²+16sin²=16. Inverse vx/cos(theta) is valid only when cos(theta) is nonzero; at90deg0/0 cannot recover speed. The domain0..180 uniquely gives180deg for vx=-v. Selection is explicitly90/180 in the actual consumer, replacing unsupported numeric95deg. No nonnotable decimal trig task remains.

Domain/assumptions: Fixedspeed4m/s,Euclidean2Dvelocityrotation,anglefrom+x0..180degrees,scalarcomponentmeasurementalongx. Arbitrarysin/cosoutputsareinstrumentvalues;onlyactuallyassignednumericgraderquestionscounttowardmanuality. Original95transfer remains a separate published-edition FAIL; new selected90/180 tasks are exact.

Representation: Uploaded SVG XML/native render read: three equal72px velocity arrows represent4m/s at0(right),90(up),180(left), common18px per m/s. Components+4/0/-4 are consistent; zero projection omitted. All15 authored blocks delivered through native bench reading panel, with progressive reader and exact formulas.

Source record canonical SHA256: `e988e5038ec9bd4dbe127ed85df5eb1f6ce5a08a076add82b378ecf146f87bd0`.

### SIM-C1-L002-01

A10cm rod has height10sin(theta). At30deg height5cm and horizontal5sqrt3cm; at90deg height10cm. Actual transfer45deg has exact5sqrt2cm. Numeric7.07cm is feasible manually by squaring707/100 and708/100 to bracket sqrt50:49.9849<50<50.1264; relativeerror<1/707<0.005. This is reviewer-documented manual feasibility, not a claim that the source supplies these squaring instructions or that an exact symbolic string is accepted by Number. Arbitrary intermediate instrumentangles are not extra student tasks.

Domain/assumptions: Rigid10cm segment in a Euclidean right triangle, inclinationfromhorizontal0..90deg, positiveheight;degenerateflat/upright limits allowed. Idealinstrumentoutputs atallangles not automatically assigned numeric work.

Representation: Read actual green segment2.5(cosθ,0,-sinθ), purpleverticalprojection(0,0,-2.5sinθ), ypositive=-z consistent. Scale1sceneunit=4cm for this rod. Zeroheight at0 does not manufacture a nonzero arrow.

Source record canonical SHA256: `256f3fa7716a412ca99fcea5ce7cf887afc0692784d0c882c341298b89d53e30`.

### SIM-C1-L002-02

Orthogonal3m horizontal and ym vertical give sqrt(9+y²)m. References0=>3m and4=>5m; actual transfer5=>sqrt34m. Numeric5.83m is manually bounded:5.83²33.9889<34<34.1056=5.84², relativeerror<1/583<0.005. Reviewer manual root-bracketing, distinct from actual source worked approximation sqrt34≈5.831. No false exact decimal identity or requirement to evaluate inverse trig.

Domain/assumptions: Perpendicular axes; fixed3m east component, nonnegative0..8m north. The magnitude is displacement norm, not path length3+y. Positive root only; zerovertical still3m.

Representation: Green (1,0,-y/3), horizontalprojection(1,0,0), common1sceneunit=3m. Orthogonal dashed projections and Pythagorean norm; inputzero gives coincidenthorizontalvector/projection, not missing displacement.

Source record canonical SHA256: `7c818614c4453b022ade14d6d966aa1cee663391bb89747217cb3eb253da824e`.

### SIM-C1-L002-03

Signed one-dimensional addition3m+b. References b-2=>1m/b3=>6m, generated b0=>3m. Boundaryb-4=>-1m versus7m path length; b-3=>0displacement versus6m path. Finite signed integer arithmetic; a negative second displacement is not a negative path length.

Domain/assumptions: Two collinear displacements on same oriented axis; +3m first and signedb-4..4m second. Result can be negative orzero; path distance always3+abs(b). Small scene-height offsets separate overlapping arrows, not new physical out-of-plane components.

Representation: Green offset1.2for3m, orangeoffset.4b from firsttip, purpleresultoffset.4(3+b) fromoriginalorigin. Originslifted by.12/.42sceneunits for readability; logicalxcomponentsand head-to-tail construction remain correct. Atb-3zeroresultarrowomitted; atb-4resultpointsleft.

Source record canonical SHA256: `05348eae34b1bbdb55997da094229a707d39015915f8e8e77b47497667c79100`.

### SIM-C1-L002-04

NEW DRAFT: A=(3,0,0)m, B=2(cos(theta),sin(theta),0)m in a right-handed frame. A dot B=6cos(theta)m² gives0 at90 and-6 at180. Cross z=6sin(theta)m² gives+6 at90 and0 at180; reversing order reverses its sign. S²+cross²=36m⁴. Negative scalar product is not negative geometric area. Inverse b=S/(a cos(theta)) gives(-6)/(3*(-1))=2m at180, and is undefined at90. Actual consumer selects90/180, not legacy95.

Domain/assumptions: Common-tail vectors3m and2m in oriented right-handedxyplane, angle0..180deg froma to b. Dot signed; cross normal+z forinteriorangles, zeroatparallel/antiparallel; reversingorder reversesnormal. Cross unitsm², notlength. Scene normal scale distinct from vectorlength scale.

Representation: Final corrected uploaded SVG XML/native render read: A3m is90px and B2m60px in all three panels, common30px/m. Dot products6/0/-6m² and cross orientation agree with right-handed coordinates. The superseded88/72px asset is not approved. All20 authored blocks delivered through native bench reading panel.

Source record canonical SHA256: `fdf6f4118b32662950c450dbe557abd7299fe0758e31783fad3a7da88b66643e`.

### SIM-C1-L005-01

Inertialframe,zeronetforce preservesgiveninitial1.5m/s, x=1.5t. References1=>1.5/4=>6, actual2.5=>15/4=3.75m. Zeroresultantdoesnotforcezerovelocity. Finitequarterproducts.

Domain/assumptions: Full source physical setup and units retained; force results are in an inertialframe on the stated domain. Actual tasks distinguished from idealized force-only drawings and optional instrument outputs; no measuredstudentcalibration or motion inferredfromforcealone.

Representation: Rail0..7.5m, body1.5t; fixedpositivevelocityarrow, actualelapsedclock0..5s. Zeroforce isnotcodedaszerovelocity.

Source record canonical SHA256: `b9dfdc98daf4d56e9998cb667dfcb3f21fad96e3d20ec44091c9c984c1f488ec`.

### SIM-C1-L005-02

Bothforcesonsamebody, +F and-6N: totalF-6. Ref6=>0/9=>3, actual4=>-2N. InitiallyrestbodyremainsrestonlyatbalanceF6; weight/normalverticalbalanceasstated, notan actionreactionpaironsamebody.

Domain/assumptions: Full source physical setup and units retained; force results are in an inertialframe on the stated domain. Actual tasks distinguished from idealized force-only drawings and optional instrument outputs; no measuredstudentcalibration or motion inferredfromforcealone.

Representation: Forcesfromsameblock rightFandleft6 sharecommon1.14/6gain andopposeddirections, equalarrowsatF6. No motiontrajectoryclaimed bystaticFBD.

Source record canonical SHA256: `a242feda39348f6bc774adb2643e992ad03e74f3045597084093ac1320458ff5`.

### SIM-C1-L005-03

Fixedmass2kg,inertialhorizontalfrictionlessguide, a=F/2. Ref-4=>-2/6=>3,actual0=>0m/s². Oppositeforcesignchangesaccelerationsign, notmass. N/kg=m/s², forceandaccelerationnotcommensuratelengthunits.

Domain/assumptions: Full source physical setup and units retained; force results are in an inertialframe on the stated domain. Actual tasks distinguished from idealized force-only drawings and optional instrument outputs; no measuredstudentcalibration or motion inferredfromforcealone.

Representation: Signedforcegreen andaccelerationpurple sharecorrectdirection butdifferentphysicalunits/scales explicitlydistinguished. Weight/normalnotdrawnin horizontal-onlyview.

Source record canonical SHA256: `dff8e8986cde6a2d31a15c48e55ebf8f781ada93df3ac5b059e0a10159060a2f`.

### SIM-C1-L005-04

AonB +F, BonA -F ondistinctbodies. Ref3=>-3/8=>-8, actual6=>-6N. Internalforcescancelonlyinthecombinedsystem, not singlecartforcebalance. Directionlabels/appliedbodiesmatter; nopredictedvelocityfromforcealone.

Domain/assumptions: Full source physical setup and units retained; force results are in an inertialframe on the stated domain. Actual tasks distinguished from idealized force-only drawings and optional instrument outputs; no measuredstudentcalibration or motion inferredfromforcealone.

Representation: Two carts Aleft/Bright, forcearrowsappliedtoeachbody atseparateorigins withsamegain1/9 andequalopposeddeltas; zerointeractionomitsbotharrows.

Source record canonical SHA256: `0a8955d3271923573c49aa0c711719d7924ae3913d604de7b1b34d0879221900`.

### SIM-C1-L005-05

NEW DRAFT: mg20N, m2kg and g10m/s² are consistent. With contact and zero acceleration perpendicular to a fixed straight plane, N-mg cos(theta)=0. At60deg N20/2=10N; at0deg N20N. Parallel support forces do not alter this perpendicular balance. Domain0..75 has0<N<=20; inverse m=10/(10*1/2)=2kg and cos(theta)=1/2 gives60deg uniquely there. Normal and weight act on the same body and are not an action-reaction pair. Actual consumer selects60/0, not unsupported40.

Domain/assumptions: Full source physical setup and units retained; force results are in an inertialframe on the stated domain. Actual tasks distinguished from idealized force-only drawings and optional instrument outputs; no measuredstudentcalibration or motion inferredfromforcealone.

Representation: Actual force renderer read with every builtin caller. Normal/weight use common0.75 scene units per20N, giving green/red1 at0 and1/2 at60deg. Tension/weight now use common0.42 per20N: ratios1 at a0 and7/10 at a-3. Independent actual SVG toggle measurements confirm these same-unit ratios; separate-unit acceleration/velocity arrows retain independent scales. Native authored reading is reachable in Comprendi.

Source record canonical SHA256: `9117caf0752244e252695fd63abff0dc6fbcdacb500edb960cf430807f4f5ea7`.

### SIM-C1-L005-06

Upwardpositive: T-mg=ma,m2kg,g10 ->T20+2a. Ref0=>20/3=>26, actual-1=>18N. Domaina-5..5givesT10..30positive, no slack/negativeTbranch. a-3 givesT14N andnet-6N downward; constantvelocitya0givesTmg20. ScalarNewtonrelation/manualarithmeticcorrect, separatevisualforce-scaleconcern retained.

Domain/assumptions: Full source physical setup and units retained; force results are in an inertialframe on the stated domain. Actual tasks distinguished from idealized force-only drawings and optional instrument outputs; no measuredstudentcalibration or motion inferredfromforcealone.

Representation: Common force scale now0.42 per20N; T20 equalsweight20 and T14 is0.7 ofweight20. Fixed body pose represents force comparison, not trajectory. All other caduta callers read: free fall and kinetic-energy cases have no filo, so do not inherit the20N tension legend.

Source record canonical SHA256: `bf9444ff3003230c2f8ca274a523d15b737e49a806dd3ef75ccfb710d48f135b`.

## New-edition boundaries and retained failures

118 selects90/180 degrees, yielding0/-4m/s, while preserving the original0/90 reference pair and all physical/control fields. Its original automatically chosen95-degree numerical transfer remains a published-edition FAIL. The inverse speed formula explicitly excludes cos(theta)=0; speed is nonnegative while the component may be negative.

119 selects90/180 degrees, yielding0/-6m², while retaining original references. Dot product is commutative; the ordered cross product is not. The final asset has common30px/m scale (3m90px,2m60px), not the superseded88/72px drawing. Original95-degree numerical transfer remains FAIL. The panel explains both the area interpretation and why a negative scalar product is not a negative area.

140 selects60/0 degrees, yielding10/20N. It explicitly gives consistent auxiliary parametersm2kg,g10m/s² and normal acceleration zero. This does not assume zero parallel acceleration. Original40-degree numerical transfer remains FAIL. Weight and normal act on the same body and arise from different interactions.

## Technical and delivery findings resolved before final proof

The first root-authored revisions were visible in generic editorial preview but absent from the actual bench: banco.js ignored activity.blocks. This was a concrete delivery blocker, not a physics error. The author added a native details panel from Comprendi, using the existing blocks/typeset and personal reader. Full block reachability, image decoding, formula count/layout and reading progress across actual parameter changes are checked by the independent consumer instrument. The panel is initialized once and suspended when hidden/disposed. No new attempt, publication or study event is created by the fixture.

Corrected core uses ungrouped numeric display so2000/8000/64000 copy back to the Number grader. Exact zeros at trigonometric quadrants are localized to the relevant extra projections, rather than suppressing arbitrary small nonzero values globally. The normal and tension apparatus now use common same-unit force gains; all builtin callers were read to avoid injecting a20N legend into unrelated free-fall or kinetic-energy examples.

Independent instrument probes were discarded, not counted as PASS: hidden controls in Comprendi/Transfer required changing back to Misura; a generic reset locator collided with the reader reset button and was scoped to bench settings; bare-guest author API correctly returns401 (authenticated nonowner403); raw fallback pixel lengths are not Euclidean physical lengths because the known oblique projection uses x47/y44. The final force measurement inverts that known projection for z0 force vectors and retains raw pixel lengths separately. These corrections are reviewer-tool issues, not product defects.

## Isolation and limits

The consumer instrument uses a disposable canonical DB import, owner-only author fetch and an explicitly private exact-item transport fixture for the three DRAFTs. Other13 items use the native published port. Bare guests cannot access author items or DRAFT assets; a demo learner still receives publishedv1 without the new assessment selection. No public DRAFT route, publication, or human approval is inferred. Native WebGL and forced fallback are explicitly distinguished. Three widths apply to each revised record; unchanged records are replayed in both modes at1280px.

035/036/039/040 positive groups are outside this review; they require their own genuine rereading and replay on the final runtime. Historical f897 tests use an authentic Git-pinned disposable runtime, with complete profile checks, rather than changing current fingerprints. See the separate technical note for the limited code audit of that helper.

## Additional read-only classical-plane renderer audit

A separate defect in LAB3D01 Tavola2D was confirmed by reading the full classic model/control/consumer path: reachableangle0..55deg (75deg is not reachable in this classic bench), positive mass0.5..5kg, and all assigned applied forces are parallel to the plane. Original constant normal40px vs weight42px gave40/42 at every angle despite N/P=cos(theta); at55deg the physical ratio is about0.574. Purple Pparallel also used48px sin(theta), an inconsistent gain. The label did not declare independent or purely directional arrows, and fallback claimed the same parameters/calculations. This is distinct from the voci apparatus used by the16 experiments.

Read final author patch f466146578b01fa97a31e7000667b59743d1ea0e: forceScale42/weight, positive finiteweight guaranteed by actual controls; normal gets42N/P and parallel42Pparallel/P with correct screen sign and perpendicular/tangent directions. Therefore -Nvector+Pparallelvector reconstructs weight. Explicit normalized common-scale label is supplied. Arrowhead length min(9,0.3shaft) preserves small-component readability and direction while leaving shaft geometry unchanged. The0.1px omission threshold is unchanged. No new blocker found in this bounded read-only technical/scientific code audit. The classic bench full visual acceptance belongs to the separately assigned035 reviewer, not this16-record report.

The diagnostic97cd replay reached58 cases but correctly terminated FAIL when its final full-profile check observed this renderer change. It is not credited or retagged. The subsequent entire58-case run on0e2083691b9233b26bc3a9e294813288d5c3eed97b29d4728431123684d8e3bd completed terminalPASS with zero errors for that runtime. All thirteen files were then archived byte-identically in experiments-revisions-118-119-140-0e208-snapshot before the later layout correction; that proof is not current-runtime evidence.

## Frozen final consumer evidence and validation

Final proof `experiments-revisions-118-119-140-independent-browser.json` SHA256 beaab749fa681a3dee74185e8749bc3c7f98d379fd13729cf22a0a18c6873fd7; independent protocol SHA256ab78a9ace3b5de16d7286c08d918e19105a521180c294c6543c6181eb9138de6.44 effective bench cases plus8 force-scale closures,4 copied-display roundtrips and2 exact quadrant-zero closures. Three revised records at1440/768/320px in real native WebGL and forced fallback; other13 records at1280px in both actual modes. All authored blocks reachable, images decoded and correct, every formula typeset and fitting its container, reading progress preserved across real parameter changes. Actual wrong inputs are rejected and independently calculated correct inputs accepted.

Canonical imports each save1 then save0/unchanged1. All991 published records retain the same hash99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee before/after; old version payloads preserved and attempts remain0. The three canonical owner-fetched draft payloads alone are privately mounted for review. Bare guest author requests401 and new draft assets403; authenticated demo learner author requests403 and native item port still returns originalv1 without assessmentSelection. This proves isolation in a disposable installation, not public delivery or publication.

Tests cover complete source hashes against pinned Git, all16 exact models and271 control values,16 scalar mutations and16 rebound answer mutations, rejection before engine execution for every changed source, candidate/binding/unsupported selection/version/source-ref mutations, missing/duplicate records and corrupt assets, strict exact quadrant zeros, force-gain mutations and changed-runtime rejection. A previous8-test run was7GREEN/1RED because terminal browser evidence was absent; the final8/8 is real, not a relaxed gate.

Frozen final report hashes:
- `experiments-foundations-revision-118`: file `3846e73a93245c77c80c2345f18d3fcdf7a06fff77b589f3792c4024bd9574d1`, canonical `c7f4d99d40eb7c445b0a38b5614f400caddccfc588b286a4ecc826184a2ff21d`; module `5eab7c3526e9b23ab472979acdd6f2d1f9da4996e55be725225e8f330c91127e`;6accepted,57checks,108inputs.
- `experiments-vectors-revision-119`: file `fa1f70fb699e0de5adeee57d9df4be5da45f7556580d2ab8872a72dbbd27c67a`, canonical `d9513caf3071c88f4a38ac4d070321452f49938e8068ca58966d6efad8363d23`; module `763e5442449327970d1d32c93e54e9ef9fe449cbd39a61099812fd5cf254cff7`;4accepted,44checks,74inputs.
- `experiments-forces-revision-140`: file `00d942fb02ce9a6aee2a36d5834c4bb99810b2060abbf41b4644e3d387e87def`, canonical `76fc77b445ddab7d21048369f0320015fd98e753cce277102378c38a0938abbd`; module `51f79f1ef9c06ed302b4722369b8c30582bf50b14328d147a531326f0d4129a9`;6accepted,61checks,89inputs.

## Final epoch after independent viewport review

The classic-plane0e208 layout had clipped arrows and overlapping text identified by the separate035 reviewer. The author also withdrew an incorrectly reported NodeGREEN that had actually stopped at importdocument; none of that author test claim is used as scientific approval here. Our own58-case0e208 proof and8 Python tests were real and remain authentic in their byte-identical snapshot, but are excluded from current-runtime reuse.

Read the complete final9387ad9 layout delta: origin(295,100), rail tangent±75, a shared tangent/normal basis and separate left legend. For reachable0..55deg, rail bounds x220..370,y38.56..161.44 andbase<=171.44; force shafts<=42px remain safely inside before their bounded heads. No further concrete issue found in this read; complete classic035 viewport acceptance remains the assigned separate reviewer scope. Source records, all three candidate editions and assets are unchanged.

A new whole58-case consumer execution genuinely completedPASS on54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d, with the same pre/post full profile, zero errors, actual nativeWebGL/fallback and all three draft widths. Its own newly hashed protocol and proof are the final identities above; no prior data was retagged. Eight independent tests reran and passed in38.454s, including fresh actual-engine reports, all16 individual identity guards and complete271 slider input comparisons. The reports were then freshly generated on that same runtime and preserved as6/4/6 effective records with one DRAFT and one nested originalFAIL each. No source/candidate/app/registry/Git edit by this reviewer and no human approval or publication.
