# Stevino revision 047: text and mathematics only

Independent AI review of ROOT author commit `223fb0d6185aa5536a30ec13e48165df2665a53a`. All 17 candidate blocks, formula, transfer prompt, control, references, prerequisites and binding were read after the original ten-activity review and primary had been frozen. No authoring module was imported or executed. The package contains no uploaded assets.

The textual/mathematical review **passes**. The candidate consistently assigns the working model g=981/100 m/s² and ρ=1000 kg/m³. An imaginary static column gives (p_base−p_surface)A=ρAhg and Δp=ρgh; the positive area cancels. Units are kg/(m·s²)=Pa. The surface-zeroed instrument measures the difference, so atmospheric pressure must not be added.

At 2 m, 1000×981/100×2=19620 Pa=19.62 kPa. At 1.5 m=3/2 m, the result is 2943/200 kPa. The stated manual conversion is correct: multiply numerator and denominator by 5 to obtain 14715/1000=14.715 kPa. The alternative 9.81+4.905 is the same exact result. The inverse 19620/9810 gives 2 m. Surface zero, depth doubling and equal-depth pressure follow from the assigned static constant-density model. The comparison with g=10 describes a different approximation/model choice and does not replace the required arithmetic.

The selected inputs [2,1.5] lie on the unchanged 0–3 m grid with step 0.25 m. Apparatus, measurement, references and installed substitution remain unchanged. Version 2/base version 1 is additive. Prerequisite C2-L001 supplies the prior density/pressure foundations. Exactness is relative to the explicitly assigned model constants, not a claim of measured terrestrial gravity without uncertainty.

One coordinated local subprocess, protected by `/private/tmp/cric-bounded-local-work.lock`, ran 23 exact SymPy/Pint checks and rejected five rebound mutations: text, source reference, base version, task selection and physical references. Free space after lock acquisition was 5.541 GiB, above the 2 GiB guard. No browser, Node engine, database, publication operation or heavy suite was run.

This is **not an accepted complete activity**. The native 320 px left probe remains hidden by the opaque Sonda label on runtime 1a35. New DRAFT delivery, rendering, formula layout and numeric-input behavior were not retested. The report therefore keeps consumer FAIL, UI NOT_RUN, overallComplete=false, acceptedCount=0, activityCredit=0 and humanApproval=NOT_RUN. The original version 1's g=10 versus 9.81 conflict remains explicitly FAIL in the retained published-edition judgment.

Package file SHA256: `93db02e08192e5774987059ee3cfb07c7baccf975b85d6bb188d12c1bd66b60d`.

Binding file SHA256: `9ba5f05bca0e911b48cf52899f9e1897a98bc6dd6eccc18786af3ef7c8b1dbe7`.

Independently frozen candidate/source signature: `9f57c2e0b5180e7c3cce84d78abe4fc2ad051b5cf77594ecaaa9ee78bad1a0a3`.

Report SHA256: `1a2dc7672d8acdde510a31da4fbdebaea14cd92c830a3605bb8f4773f2f0c0c1`.
