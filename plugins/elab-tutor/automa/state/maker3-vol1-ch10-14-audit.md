# Maker-3 Vol1 Audit ch10-14
- Date: 2026-05-07
- Esperimenti audited: 15/15
- Chapters covered: 10 (LDR), 11 (Buzzer), 12 (Reed), 13 (Plastilina), 14 (Capstone Robot)
- PDF source: /tmp/vol1-full.txt
- Code source: src/data/experiments-vol1.js
- Lesson groups source: src/data/lesson-groups.js (lines 57-97)
- Spec: docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md (NOT FOUND on disk; using ground-truth file as fallback)
- Ground truth: automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md (lines 44-65 Vol1 inventory)
- Vol2 patterns ref: automa/state/task5-parita.json
- Andrea spiattellato feedback target: cap10 LDR 6-esp + cap12 Reed 4-esp
- Gaps:
  - cap10 esp1 PDF says "non c'è bisogno di inserire un resistore in serie al LED" but code adds 220Ω r1 — DIRECT PDF↔code contradiction (PDF→ESP1)
  - cap10 esp3 PDF (RGB+3 LDR) does NOT mention resistors; code adds 3× 220Ω resistors — silent addition of safety component vs PDF text
  - cap14 (Capstone Robot) breadboard layout coordinates DRAMATICALLY differ from PDF: PDF says pot1 e-1, pot2 e-5, pot3 e-9, LEDs g-15/d-15, RGB g-24..g-27; code uses pot1 e-28..e-30, pot2 e-33..e-35, pot3 e-38..e-40, LEDs b21/h23, RGB d53..d56
  - cap14 PDF says "tre resistenze da 220 Ohm sulla linea del positivo" (3 resistors); code uses 4× 220Ω resistors (r1..r4) — count mismatch
  - cap14 PDF has 5 PASSI numbered structure ("1° PASSO ... 5° PASSO"); code has flat buildSteps without PASSO grouping — narrative structure lost
  - cap10 esp2 PDF text 2 lines ("Prova adesso a cambiare il LED con uno di un colore diverso e osserva come cambia il comportamento!"); code esp2 reuses 220Ω resistor (same as esp1 problem) — PDF doesn't mention it
  - cap10 esp5 PDF only 4 lines hint ("Partendo dall'esperimento 4 aggiungiamo un potenziometro per cambiare l'intensità luminosa del LED bianco"); code expands to 13-step buildSteps — aggressive expansion (defensible but PDF↔code asymmetry)
  - cap12 esp3 PDF ("Prova a realizzare un circuito che accenda un LED RGB del colore che preferisci utilizzando un interruttore magnetico"); code chooses ONLY rosso channel; PDF says "del colore che preferisci" — choice limitation
  - cap12 esp4 PDF ("Prova ad utilizzare insieme potenziometri, LED RGB e un interruttore magnetico"); code uses 1 potenziometro; PDF says "potenziometri" plural — count mismatch
  - cap13 PDF cap intro lists "RICETTA INGREDIENTI" (PROCEDIMENTO), code does NOT include recipe context for teacher — pedagogical context loss for teacher use
  - cap11 esp2 PDF only 2-line hint ("Prova ora a realizzare un circuito in cui il cicalino suona solo se premi un pulsante. Ti ricordi come fare?"); code provides full 11-step buildSteps — aggressive expansion (acceptable but asymmetric)

---

## Section 6.1 — Per-experiment audit (markdown template)

### v1-cap10-esp1 — LED controllato dalla luce
- **Title**: "Cap. 10 Esp. 1 - LED controllato dalla luce"
- **PDF anchor**: `/tmp/vol1-full.txt:1937` "ESPERIMENTO 1 ... Proviamo ad accendere un LED utilizzando un fotoresistore"
- **PDF components**: LED, breadboard, batteria 9V, clip batteria, fotoresistore (NO resistor explicitly stated; PDF :1990-1992 explicitly says: "in questo circuito non c'è bisogno di inserire un resistore in serie al LED perché il fotoresistore anche quando illuminato ha una resistenza abbastanza elevata da non bruciare il LED")
- **Code components**: bat1, bb1, ldr1, led1 (red) — BUT buildSteps step 4 inserts 220Ω r1 in D7-D9
- **Severity**: **CRITICAL** — direct PDF↔code contradiction. PDF explicitly states no resistor needed; code adds it. Pedagogical Principio Zero violation: docente reads volume aloud "non serve resistore", classe vede simulator con resistore = confusione.
- **Suggested concept (Andrea spiattellato target)**: "Reagisci alla luce" (LDR cambia resistenza con luce, LED si accende quando LDR vede luce)
- **Linguaggio plurale**: present in unlimPrompt "il docente sta mostrando ALLA CLASSE" but desc/buildSteps/quiz use singolare "Inserisci/Collega/Prendi" — Andrea iter 21+ codemod target

### v1-cap10-esp2 — LED diverso colore con LDR
- **Title**: "Cap. 10 Esp. 2 - LED diverso colore con LDR"
- **PDF anchor**: `/tmp/vol1-full.txt:1997` "ESPERIMENTO 2 ... Prova adesso a cambiare il LED con uno di un colore diverso e osserva come cambia il comportamento!"
- **PDF components**: same as esp1 (LED diverso colore, no resistor)
- **Code components**: bat1, bb1, ldr1, led1 (blue) + 220Ω r1 (D7-D9)
- **Severity**: **HIGH** — same resistor issue inherited from esp1; PDF only 2 lines (variation prompt); code 11-step buildSteps detailed expansion
- **Linguaggio plurale**: singolare imperative

### v1-cap10-esp3 — 3 LDR controllano RGB
- **Title**: "Cap. 10 Esp. 3 - 3 LDR controllano RGB"
- **PDF anchor**: `/tmp/vol1-full.txt:2011` "ESPERIMENTO 3 ... LED RGB e tre fotoresistori"
- **PDF components**: 1× LED RGB, 1× breadboard, 1× batteria 9V, 1× clip, 3× fotoresistori, 3× fili colorati (NO resistors mentioned in component list :2017-2023)
- **Code components**: bat1, bb1, 3× LDR, 1× rgb1 + (in buildSteps but not components array) 3× 220Ω r1/r2/r3
- **Severity**: **HIGH** — PDF component list omits resistors; code adds 3× 220Ω. Code components array also missing r1/r2/r3 declaration but buildSteps reference them = component declaration gap
- **Componenti array**: only 6 declared (bat1, bb1, ldr1-3, rgb1) — buildSteps reference r1/r2/r3 NOT in components array → simulator instantiation bug risk
- **Severity (component-array)**: **CRITICAL** declaration mismatch — buildSteps step 6/7/8 reference componentId r1/r2/r3 but they are not in the `components` array (line 4487-4494 only declares 4 + battery + breadboard)

### v1-cap10-esp4 — LED bianco illumina LDR → LED blu
- **Title**: "Cap. 10 Esp. 4 - LED bianco illumina LDR → LED blu"
- **PDF anchor**: `/tmp/vol1-full.txt:2082` "ESPERIMENTO 4 ... LED bianco per illuminare un fotoresistore e quindi cambiare la luminosità di un LED blu"
- **PDF components**: breadboard, batteria 9V, clip, LED bianco, LED blu, fotoresistore, **resistore da 470 Ohm**, 2 fili colorati (PDF :2087-2096)
- **Code components**: bat1, bb1, r1@470Ω, led1 white, ldr1, led2 blue
- **Severity**: **MEDIUM** — components match. PDF places resistor between catodo del LED bianco and breadboard line negativo; code places r1 c5-c12 (different but functionally similar layout)
- **Concept narrativa**: "accoppiamento ottico luce → sensore → luce" — strong concept matched in code

### v1-cap10-esp5 — Aggiungi pot per controllare LED bianco
- **Title**: "Cap. 10 Esp. 5 - Aggiungi pot per controllare LED bianco"
- **PDF anchor**: `/tmp/vol1-full.txt:2164` "ESPERIMENTO 5 ... Partendo dall'esperimento 4 aggiungiamo un potenziometro per cambiare l'intensità luminosa del LED bianco"
- **PDF components**: same as esp4 + potenziometro (additive variation)
- **Code components**: bat1, bb1, pot1@10kΩ, r1@470Ω, led1 white, ldr1, led2 blue
- **Severity**: **MINOR** — components match. PDF very terse (3 lines); code expansion 13 buildSteps (acceptable since "aggiungiamo a esp 4")
- **Concept narrativa**: "controllo a catena: pot → LED bianco → LDR → LED blu"

### v1-cap10-esp6 — Aggiungi pulsante al circuito LDR
- **Title**: "Cap. 10 Esp. 6 - Aggiungi pulsante al circuito LDR"
- **PDF anchor**: `/tmp/vol1-full.txt:2179` "ESPERIMENTO 6 ... Partendo dall'esperimento 4 aggiungiamo un pulsante per cambiare l'intensità luminosa del LED blu solo quando premiamo il pulsante"
- **PDF components**: esp4 base + pulsante (additive variation)
- **Code components**: bat1, bb1, btn1, ldr1, r1@470Ω, led1 white, led2 blue
- **Severity**: **MINOR** — concept "AND logico: pulsante E luce" well represented
- **Concept narrativa**: "doppio controllo: pulsante AND luce"

### v1-cap11-esp1 — Buzzer suona continuo
- **Title**: "Cap. 11 Esp. 1 - Buzzer suona continuo"
- **PDF anchor**: `/tmp/vol1-full.txt:2226` "ESPERIMENTO 1 ... Per questo esperimento abbiamo bisogno di: Un cicalino, Una breadboard, Una batteria 9V, La clip per la batteria 9V" + :2213 "Un cicalino non ha bisogno di resistori ma basta collegarlo direttamente alla batteria"
- **PDF components**: cicalino, breadboard, batteria 9V, clip (NO resistor)
- **Code components**: bat1, bb1, buz1 (buzzer-piezo)
- **Severity**: **MINOR** — components match exactly. Code aligns with PDF "non ha bisogno di resistori"
- **Concept narrativa**: "cicalino polarizzato suona se collegato a tensione"

### v1-cap11-esp2 — Campanello con pulsante
- **Title**: "Cap. 11 Esp. 2 - Campanello con pulsante"
- **PDF anchor**: `/tmp/vol1-full.txt:2255` "ESPERIMENTO 2 ... Prova ora a realizzare un circuito in cui il cicalino suona solo se premi un pulsante. Ti ricordi come fare?"
- **PDF components**: NOT explicitly listed but implied (buzzer + pulsante + breadboard + batteria, replicating LED+pulsante pattern)
- **Code components**: bat1, bb1, btn1, buz1
- **Severity**: **MINOR** — PDF terse 2-line variant; code 11-step buildSteps detailed expansion (acceptable). Concept "campanello" matches
- **Concept narrativa**: "pulsante + buzzer = campanello"

### v1-cap12-esp1 — LED con reed switch
- **Title**: "Cap. 12 Esp. 1 - LED con reed switch"
- **PDF anchor**: `/tmp/vol1-full.txt:2305` "ESPERIMENTO 1 ... applicheremo quanto fatto prima, ma anziché utilizzare il pulsante, utilizzeremo un interruttore magnetico"
- **PDF components**: LED, breadboard, batteria 9V, clip, **resistore da 470 Ohm**, interruttore magnetico (PDF :2311-2317)
- **Code components**: bat1, bb1, reed1, r1@470Ω, led1 red
- **Severity**: **OK** — components match exactly. 470Ω value precise.
- **Suggested concept (Andrea spiattellato target)**: "Magnete attiva il circuito" (reed switch chiude circuito quando magnete avvicina)
- **Concept narrativa**: "interruttore senza tocco, attivato a distanza"

### v1-cap12-esp2 — Cambia luminosità con magnete
- **Title**: "Cap. 12 Esp. 2 - Cambia luminosità con magnete"
- **PDF anchor**: `/tmp/vol1-full.txt:2359` "ESPERIMENTO 2 ... Come fatto con il pulsante, prova a sperimentare con i valori di resistenza per rendere più o meno luminoso il LED"
- **PDF components**: same as esp1 (variazione resistore)
- **Code components**: bat1, bb1, reed1, r1, led1 (need verification of r1 value vs PDF "valori diversi")
- **Severity**: **MINOR** — concept "valori diversi di R" matched if code allows R-value change
- **Concept narrativa**: "varia R = varia luminosità"

### v1-cap12-esp3 — Sfida: RGB + reed switch
- **Title**: "Cap. 12 Esp. 3 - Sfida: RGB + reed switch"
- **PDF anchor**: `/tmp/vol1-full.txt:2373` "ESPERIMENTO 3 ... Prova a realizzare un circuito che accenda un LED RGB del colore che preferisci utilizzando un interruttore magnetico"
- **PDF components**: LED RGB + reed switch + (resistor implicit from previous chapter pattern)
- **Code components**: bat1, bb1, reed1, r1@470Ω, rgb1
- **Severity**: **MEDIUM** — code wires only ROSSO channel (`a21→a24` to red pin); PDF says "del colore che preferisci" implies free choice. Code limits to red.
- **Concept narrativa**: "Sfida aperta" matched (note text "Sfida aperta: progetta il circuito completo")

### v1-cap12-esp4 — Sfida: pot + RGB + reed switch
- **Title**: "Cap. 12 Esp. 4 - Sfida: pot + RGB + reed switch"
- **PDF anchor**: `/tmp/vol1-full.txt:2381` "ESPERIMENTO 4 ... Prova ad utilizzare insieme potenziometri, LED RGB e un interruttore magnetico"
- **PDF components**: potenziometri (PLURAL), LED RGB, interruttore magnetico
- **Code components**: bat1, bb1, reed1, pot1 (SINGOLARE), r1@470Ω, rgb1
- **Severity**: **MEDIUM** — PDF says "potenziometri" plural; code uses 1 potentiometer. Mismatch quantità. Could be 3 (one per RGB channel like cap14 robot).

### v1-cap13-esp1 — LED nell'elettropongo
- **Title**: "Cap. 13 Esp. 1 - LED nell'elettropongo"
- **PDF anchor**: `/tmp/vol1-full.txt:2441` "ESPERIMENTO 1 ... principio di funzionamento base dell'elettropongo"
- **PDF components**: LED, batteria 9V, elettropongo
- **Code components**: bat1, led1 white (NO breadboard, NO elettropongo as component — `simulable: false` flag with `simulableReason: "Richiede pasta conduttiva (elettropongo) - solo kit fisico"`)
- **Severity**: **OK** — `simulable: false` flag honest with kit-only nature. PDF instructions to "Stacca due pezzettini di elettropongo, forma due striscettine" preserved as buildSteps.
- **Pedagogical context loss**: PDF chapter intro lines 2400-2425 contain RICETTA + INGREDIENTI + PROCEDIMENTO for elettropongo — code does NOT surface recipe to teacher (Principio Zero gap: docente has no UI access to recipe via UNLIM unless RAG retrieves it)

### v1-cap13-esp2 — Circuiti artistici con plastilina
- **Title**: "Cap. 13 Esp. 2 - Circuiti artistici con plastilina"
- **PDF anchor**: `/tmp/vol1-full.txt:2465` "ESPERIMENTO 2 ... Dai sfogo alla tua fantasia e prova a creare un circuiti artistico utilizzando l'elettropongo e i LED!"
- **PDF components**: elettropongo + LEDs (preferibilmente stesso colore, secondo PDF :2470-2472)
- **Code components**: bat1, 3× LED bianchi (`simulable: false`)
- **Severity**: **OK** — PDF "preferibilmente stesso colore" = code 3× white LED matches preference

### v1-cap14-esp1 — Il Primo Robot ELAB
- **Title**: "Cap. 14 - Il Primo Robot ELAB"
- **PDF anchor**: `/tmp/vol1-full.txt:2486-2600` "CAPITOLO 14 — COSTRUIAMO IL NOSTRO PRIMO ROBOT" + 5 PASSI numbered
- **PDF structure**: 1° PASSO 3 potenziometri (Pin e-1, e-5, e-9) + tre resistenze 220Ω. 2° PASSO 2 LED verdi (g-15/g-16, d-15/d-16) + resistenza 220Ω da a-15. 3° PASSO 3 fili lunghi pot connections (j-2→j-27, j-6→j-26, j-10→j-24). 4° PASSO interruttore magnetico (g-18, d-18) + connessioni j-16→j-18, i-18→j-25, c-16→linea negativo. 5° PASSO RGB su g-24..g-27 con piedino lungo g-25.
- **PDF components**: 3 potenziometri + 3 (or 4 with LED bianco-eyes resistor) resistenze 220Ω + 2 LED verdi + interruttore magnetico + LED RGB + breadboard
- **Code components**: bat1, bb1 (full), 3 potenziometri (pot1/pot2/pot3@10kΩ), 4 resistori 220Ω (r1/r2/r3/r4), 2 LED verdi (led1/led2), 1 RGB (rgb1), 1 reed-switch (reed1)
- **Severity**: **CRITICAL** — count match for components but **breadboard layout coordinates DRAMATICALLY differ** (PDF e-1/e-5/e-9 vs code e-28/e-33/e-38; PDF g-15/d-15 vs code b21/h23; PDF g-24..g-27 with long pin g-25 vs code d53..d56; PDF g-18/d-18 reed vs code c3/c9). Resistor count: PDF cap14 says "tre resistenze da 220 Ohm sulla linea del positivo" + 1 resistenza on a-15 for 2 LED verdi = 4 totale (matches code 4 r). But PDF breadboard layout is half-size (cols 1-30); code uses breadboard-full (cols 1-60+). **Layout migration not annotated** — code SHOULD have a comment "PDF cap14 reference layout half-bb cols 1-30; code expanded to full-bb for clarity".
- **Mechanical kit gap (Andrea spiattellato target)**: capstone Robot needs physical mechanical components (corpo robot, "occhi" LED, "mano" RGB, "scettro" RGB) — code only simulates the electrical circuit. PDF :2580-2598 references "il nostro amico ELAB sulla breadboard centrando i due verdi" + "RGB nei quattro fori sulla pancia di ELAB" — implies physical mascot/case kit Omaric. Code has no representation/instruction for mechanical assembly = mechanical-fisica gap CRITICAL for capstone narrative ("Costruiamo il nostro primo robot" → just circuit?).
- **PASSO narrative loss**: PDF 5-step PASSO structure ("1° PASSO ... 5° PASSO") is pedagogically meaningful (sequential build); code flat buildSteps loses PASSO grouping = narrative continuity gap
- **Suggested concept**: "Capstone Vol1: integrazione tutto (LED, RGB, pot, reed) in un robot funzionante con magnete-power-on"

---

## Severity summary

| Severity | Count | Items |
|----------|-------|-------|
| **CRITICAL** | 3 | cap10-esp1 PDF↔code resistor contradiction; cap10-esp3 components array missing r1/r2/r3 declaration; cap14 breadboard layout coordinate massive shift + mechanical kit assembly gap |
| **HIGH** | 2 | cap10-esp2 inherited resistor issue; cap10-esp3 3× resistor silent addition |
| **MEDIUM** | 4 | cap10-esp4 resistor placement different from PDF; cap12-esp3 RGB color choice limited to red; cap12-esp4 pot count plurale vs singolare; cap14 PASSO narrative structure loss |
| **MINOR** | 6 | cap10-esp5 expansion; cap10-esp6 expansion; cap11-esp2 expansion; cap12-esp2 R-value variation; cap13-esp1 elettropongo recipe context loss; cap13-esp2 PDF preference matched |

## Andrea spiattellato finding verdicts

### cap10 LDR (6 esp candidate)
- **YES** spiattellato candidate. Concept "Reagisci alla luce" coherent across 6 esp:
  - esp1 base (LDR + LED rosso)
  - esp2 colore diverso (LED blu)
  - esp3 RGB con 3 LDR (3 sensori)
  - esp4 accoppiamento ottico (LED bianco illumina LDR → LED blu)
  - esp5 pot + LED bianco (controllo a catena)
  - esp6 pulsante AND LDR (logica AND)
- **Rationale**: chapter unifies around "fotoresistore = sensore di luce" with consistent narrative escalation (singolo → multi → ottico → controllo → AND). Strong narrative target IF resistor PDF↔code issue resolved.
- **Blocker**: cap10-esp1 PDF explicitly says "non c'è bisogno di inserire un resistore" but code adds 220Ω. Must reconcile — either remove resistor from code (match PDF text) OR amend PDF with errata note.

### cap12 Reed (4 esp candidate)
- **YES** spiattellato candidate. Concept "Magnete attiva il circuito" coherent across 4 esp:
  - esp1 base (LED + reed)
  - esp2 R diversi (luminosità variabile)
  - esp3 RGB + reed (sfida colore)
  - esp4 pot + RGB + reed (sfida integrazione)
- **Rationale**: chapter unifies around "reed switch = interruttore magnetico" with progressive complexity (semplice → variazione → RGB → integrazione). Andrea spiattellato narrative target STRONG.
- **Blocker**: cap12-esp4 PDF says "potenziometri" plural but code uses 1; cap12-esp3 PDF says "del colore che preferisci" but code limits to rosso channel. Both fixable in code.

## Top 3 issues (priority order)

1. **CRITICAL — cap14 Capstone layout + mechanical kit gap**: code breadboard coordinates do NOT match PDF (e-28 vs PDF e-1, b21 vs PDF g-15, d53 vs PDF g-24, etc.) AND no mechanical assembly instructions for ELAB robot mascot/case. Sprint U Cycle 2 candidate fix MAJOR — either rewrite code to PDF coords or add explicit "code uses full-bb layout, PDF uses half-bb" annotation.
2. **CRITICAL — cap10-esp1 PDF↔code resistor contradiction**: PDF text :1990 explicitly says "non c'è bisogno di inserire un resistore"; code buildSteps step 4 inserts 220Ω r1. Pedagogically destructive: docente reads volume aloud, classe vede simulator with resistor → contraddizione visibile in classe.
3. **CRITICAL — cap10-esp3 components array gap**: components array (line 4487-4494) declares only 6 components (battery, bb, 3 LDR, RGB) but buildSteps step 6/7/8 reference componentId r1/r2/r3 (220Ω each). Simulator instantiation may fail because resistors not declared. Code declaration bug + same PDF↔code unresolved.

## Capstone cap14 robot status (Andrea mechanical kit gap)

- **Mechanical gap**: PRESENT and SIGNIFICANT
- PDF references `il nostro amico ELAB` (a physical mascot/robot character, presumably plastic case Omaric kit), but code has only electrical breadboard simulation. Build narrative says "Avvicina il magnete: il robot si accende! Gli occhi verdi si illuminano e la mano RGB cambia colore" — code/sim does NOT visualize "occhi" or "mano RGB" as anatomical features; just LEDs + RGB on breadboard.
- Andrea iter 21+ feedback ("fotografia prod", "esperimenti broken Playwright UNO PER UNO"): cap14 capstone is HIGH-RISK candidate because:
  - mechanical assembly steps absent
  - PDF references physical "ELAB" mascot/case → if Omaric kit doesn't include mascot SVG/3D, capstone narrative is incomplete
  - simulator visual is just abstract circuit, not "robot ELAB" character
- Recommendation: cap14 needs (a) mascot SVG/asset for visual "robot ELAB" (eyes, hand), OR (b) "kit-only" flag with `simulable: false` + mascot photo/illustration in build instructions, OR (c) PDR for mechanical kit assembly step-by-step in physical kit Omaric

## Linguaggio plurale audit (Andrea iter 21+ codemod target)

- 15/15 esperimenti use **singolare imperative** in buildSteps: "Inserisci...", "Collega...", "Prendi...", "Posiziona..."
- Andrea Principio Zero requires **plurale "Ragazzi" + voi-form**: "Inserite...", "Collegate...", "Prendete..."
- Codemod target: ~15 esp × ~10 buildSteps + ~5 quiz options + steps[] flat = ~200+ violations Vol1 cap10-14 alone
- Ground truth file V2 line 18-22 mentions same issue Vol1 cap6-9 (Sprint U Cycle 1 audit similar)

## ESPERIMENTO PDF count verification (vs ground truth line 56-63)

| Cap | Ground truth count | PDF /tmp/vol1-full.txt grep count | Code count | Match |
|-----|-------------------|------------------------------------|------------|-------|
| 10 LDR | 6 | 6 (lines 1937, 1997, 2011, 2082, 2164, 2179) | 6 | OK |
| 11 Buzzer | 2 | 2 (lines 2226, 2255) | 2 | OK |
| 12 Reed | 4 | 4 (lines 2305, 2359, 2373, 2381) | 4 | OK |
| 13 Pongo | 2 | 2 (lines 2441, 2465) | 2 | OK |
| 14 Robot | 1 | 1 (lines 2486+, 5 PASSI) | 1 | OK |
| **Total** | **15** | **15** | **15** | **OK** |

Counts numerically aligned. Issues are content/coordinate/component-detail level, NOT count level.

## Lesson groups (src/data/lesson-groups.js lines 57-97) verification

| Group key | chapter | experiments[] | Match code IDs |
|-----------|---------|---------------|----------------|
| `v1-sensore-luce` | 10 | 6 esp v1-cap10-esp1..6 | OK |
| `v1-buzzer` | 11 | 2 esp v1-cap11-esp1..2 | OK |
| `v1-reed-switch` | 12 | 4 esp v1-cap12-esp1..4 | OK |
| `v1-plastilina` | 13 | 2 esp v1-cap13-esp1..2 | OK |
| `v1-robot` | 14 | 1 esp v1-cap14-esp1 (advancedProject:true) | OK |

All 5 lesson groups properly map to 15 esp IDs; no orphan/missing IDs.

---

## File system anchors

- experiments-vol1.js cap10 esp1: line 4170-4325
- experiments-vol1.js cap10 esp2: line 4326-4478
- experiments-vol1.js cap10 esp3: line 4479-4732
- experiments-vol1.js cap10 esp4: line 4733-4936
- experiments-vol1.js cap10 esp5: line 4937-5173
- experiments-vol1.js cap10 esp6: line 5174-5354
- experiments-vol1.js cap11 esp1: line 5359-5490
- experiments-vol1.js cap11 esp2: line 5491-5639
- experiments-vol1.js cap12 esp1: line 5644-5791
- experiments-vol1.js cap12 esp2: line 5792-5938
- experiments-vol1.js cap12 esp3: line 5939-6097
- experiments-vol1.js cap12 esp4: line 6098-6293
- experiments-vol1.js cap13 esp1: line 6294-6380
- experiments-vol1.js cap13 esp2: line 6383-6530
- experiments-vol1.js cap14 esp1: line 6533-end-of-cap14
- lesson-groups.js Vol1 cap10-14: line 57-97
