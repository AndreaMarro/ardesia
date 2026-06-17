# Maker-3 Vol1 Phase 1 Completion
- Date: 2026-05-07T00:00:00Z
- Esperimenti audited: 15/15
- Chapters covered: 10, 11, 12, 13, 14
- Output file: automa/state/maker3-vol1-ch10-14-audit.md
- File size: 253 lines
- Spiattellato finding cap10 LDR: YES — concept "Reagisci alla luce" coherent across 6 esp (singolo→multi→ottico→controllo→AND), strong narrative target IF cap10-esp1 PDF↔code resistor contradiction resolved (PDF :1990 explicitly says "non c'è bisogno di inserire un resistore" but code adds 220Ω)
- Spiattellato finding cap12 Reed: YES — concept "Magnete attiva il circuito" coherent across 4 esp (semplice→variazione→RGB→integrazione), strong narrative target IF cap12-esp4 plurale potenziometri vs singolare in code resolved + cap12-esp3 RGB color choice unlocked from solo rosso
- Top 3 findings:
  1. CRITICAL — cap14 Capstone Robot ELAB: breadboard layout coordinates dramatically diverge from PDF (e-28 vs PDF e-1, b21 vs PDF g-15, d53..d56 vs PDF g-24..g-27) AND mechanical kit assembly gap (PDF references "il nostro amico ELAB" mascot/case but code only simulates breadboard; missing mascot SVG/visualization for "occhi" + "mano RGB" + "scettro")
  2. CRITICAL — cap10-esp1 PDF↔code resistor contradiction: PDF :1990 "in questo circuito non c'è bisogno di inserire un resistore in serie al LED" but code buildSteps step 4 inserts 220Ω r1; pedagogically destructive (docente reads volume aloud, classe vede simulator with resistor)
  3. CRITICAL — cap10-esp3 components array gap: components array (line 4487-4494) declares 6 components (battery, breadboard, 3 LDR, RGB) but buildSteps step 6/7/8 reference componentId r1/r2/r3 (3× 220Ω resistors) NOT in components array; simulator instantiation may fail
- Status: COMPLETED
