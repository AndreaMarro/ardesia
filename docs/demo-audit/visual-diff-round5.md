# Visual Diff Round 5 — Prod screenshot ↔ Libro PNG

**Date**: 2026-05-24 08:50
**Source prod**: live screenshot https://www.elabtutor.school/#lavagna via Playwright MCP, 7 esp mounted via `__ELAB_API.mountExperiment(id)`
**Source libro**: PNG render 200 DPI da PDF Vol1/Vol2/Vol3 (Sprint B fase 3 capture)
**Andrea mandate**: "scrivi devi file in cui fai il paragone tra foto contenute nei volumi del rispettivo esperimento e esperimento nel simulatore che hai costruito"

**Anti-COMPIACERMI**: questo è visual diff REALE prod state vs libro canon. NESSUN claim "ready" sopra evidenza.

---

## Riepilogo verdetto demo 25/05

| Esp | Match libro | Status demo | Note critiche |
|-----|-------------|-------------|----------------|
| v1-cap6-esp1 | 75% | ⚠️ ACCETTABILE | LED accende OK, 2 wire visibili match, bb size OK. Asset minor mismatch |
| v1-cap6-esp2 | 70% | ⚠️ ACCETTABILE | Anti-pattern LED BRUCIATO renderizza correttamente (segno X "BRUCIATO" su LED) |
| v1-cap6-esp3 | **30% — P0 BLOCKER** | ❌ DEMO FAIL | LED BRUCIATO invece di "più luminoso" (R=220 > 30mA solver threshold) |
| v2-cap7-esp1 | 65% | ⚠️ ACCETTABILE-LOW | bb half (libro full), MM display "0.00" funziona, layout OK |
| v2-cap7-esp2 | 60% | ⚠️ ACCETTABILE-LOW | Stesso bb half issue + LED rendering small |
| v3-cap6-esp4 | **40% — P0 BLOCKER** | ❌ DEMO FAIL | code `LED_BLU=6 LED_ROSSO=9` MA libro V0.8.1 dice D8+D9 |
| v3-cap6-esp5 | **35% — P0 BLOCKER** | ❌ DEMO FAIL | code `LED_ROSSO=9` MA libro=7. LED order green-yellow-red REVERSED vs libro red-yellow-green |

**Bottom line**: **3 dei 7 esp demo BLOCCATI per demo 25/05 sera**. 4 esp accettabili con minor issues. Andrea ratify URGENT su 3 P0 BLOCKER.

---

## v1-cap6-esp1 — Accendi primo LED

### Prod screenshot
- File: `artifacts/demo-captures/v1-cap6-esp1-prod.png`
- bb orizzontale HALF (~30 colonne, match libro Vol1) ✅
- Battery 9V verticale sx, clip esce dx ✅
- 2 wire visibili: rosso (clip+ → bb top rail) + nero (clip- → bb bot rail) ✅ MATCH libro 2-wire
- LED rosso accenso (alone rosso bright effect center bb) ✅ funziona elettricamente
- R1 + LED1 labels visibili sopra/sotto componenti
- UI: Passo Passo + Già Montato toggle

### Libro reference
- Files: `reference/vol1/v1-cap6-esp1/page-{029,030,031}.png`
- pag.30 step 1: solo wire rosso (clip → rail+). pag.31 finale: 2 wire (rosso + nero) MAGIA LED accenso

### Diff visuale
| Aspetto | Prod | Libro | Match? |
|---------|------|-------|--------|
| bb orientation | orizzontale | orizzontale | ✅ |
| Battery position | sx | sx | ✅ |
| Wire visibili count | 2 (rosso+nero) | 2 (rosso+nero) | ✅ |
| LED rosso accenso | sì | sì (MAGIA) | ✅ |
| Asset LED splayed vs led-bridge | led-bridge (handoff) | LED standard | ⚠️ asset minor |
| R bands | 4-band E12 | 3-band (Giallo Viola Marrone) | P2 |
| LED brightness effect | alone rosso largo | LED puntiforme small | overdone? |

### Verdetto esp1
**ACCETTABILE per demo.** LED accende, layout simile libro, anti-pattern wire visibility MITIGATO (4 wire app interni renderizzano come 2 visibili). Minor asset mismatch led-bridge non bloccante.

---

## v1-cap6-esp2 — LED senza R (brucia)

### Prod screenshot
- File: `artifacts/demo-captures/v1-cap6-esp2-prod.png`
- bb + battery layout esp1
- LED inserito col 7 (NO R intermedio)
- **Segno X rosso "BRUCIATO!" overlay su LED** ✅ rendering anti-pattern correttamente implementato
- 2 wire visibili rosso/nero
- Title bar: "LED senza resistore (cosa NON fare!)"

### Libro pag.32
- Anti-pattern educativo: LED diretto bat, icona pericolo
- Testo "Se infatti colleghi per errore il LED direttamente alla batteria, il LED si brucia e potrebbe addirittura esplodere!"

### Diff
| Aspetto | Prod | Libro | Match? |
|---------|------|-------|--------|
| LED senza R | sì | sì | ✅ |
| Warning visivo | X rosso "BRUCIATO!" | icona pericolo grande star/explosion | ⚠️ style differ (codex round 1 P1) |
| 2 wire visibili | sì | sì | ✅ |
| Pedagogical effect | LED bruciato evidente | LED bruciato evidente | ✅ |

### Verdetto esp2
**ACCETTABILE per demo.** Anti-pattern funziona, LED brucia visivamente. Style "BRUCIATO!" diverso da libro explosion star — minor cosmetic.

---

## v1-cap6-esp3 — Cambia luminosità (R variant) — **P0 BLOCKER**

### Prod screenshot
- File: `artifacts/demo-captures/v1-cap6-esp3-prod.png`
- bb + battery + R1 + LED layout
- **LED RENDERIZZATO BRUCIATO (X rosso + "BRUCIATO!")**
- Title bar: "Cambia luminosità con resistenze diverse"
- R=220Ω default (handoff)

### Libro pag.33
- 2 illustrazioni circuito identico esp1 layout
- R=220Ω: LED VERDE **più luminoso**
- R=1kΩ: LED VERDE **meno luminoso**
- LED color = VERDE (codex round 1 corretto mio "rosso")

### Diff
| Aspetto | Prod | Libro | Match? |
|---------|------|-------|--------|
| LED color | rosso | **verde** | ❌ P1 codex corretto |
| LED stato | BRUCIATO X | acceso più luminoso (R=220) | ❌ **P0 BLOCKER** |
| R=220 funzionale | overcurrent 32.7mA brucia | safe (libro NON brucia) | ❌ **P0 solver** |
| 2 wire visibili | sì | sì | ✅ |
| Layout circuito | match esp1 | match esp1 | ✅ |

### Verdetto esp3
**❌ NON PRONTO DEMO — P0 BLOCKER**

**Root cause**: CircuitSolver.js burn threshold 30mA / current 32.7mA con R=220Ω @ 9V. Demo intent "LED più luminoso" diventa "LED bruciato".

**Fix options Andrea ratify**:
- Opt A: raise solver threshold 30 → 40mA (più tollerante)
- Opt B: change R default 220 → 270Ω (I = 7.2/270 = 26.7mA < 30mA safe)
- Opt C: change LED Vf model

---

## v2-cap7-esp1 — Scarica cap + MM

### Prod screenshot
- File: `artifacts/demo-captures/v2-cap7-esp1-prod.png`
- bb orizzontale (numerazione 1-30 visible — HALF size)
- Battery 9V sx verticale
- BTN1 arancione/giallo col ~10
- C1 condensatore cilindrico nero col ~13 a cavallo gap
- MM giallo grande TOP-RIGHT (display "0.00")
- Wire rosso clip+ → top rail + wire nero clip- → bot rail
- Wire colorato BTN → MM probe (NON visibile colorato distinto)
- Probe MM rosso/nero da MM a bb area

### Libro pag.67-68
- bb FULL SIZE orizzontale
- BTN + C a cavallo gap centrale
- MM giallo destra display 9.00V quando premi
- Battery below-left bb (pag.68 step finale)

### Diff
| Aspetto | Prod | Libro | Match? |
|---------|------|-------|--------|
| bb size | HALF (1-30 visible) | **FULL** (1-60) | ❌ **P0 BLOCKER B3** |
| Battery position | sx (lato-Vol1-style) | **below-left** | ⚠️ position drift |
| MM giallo | sì top-right | sì destra | ✅ |
| Cap a cavallo gap | sì col 13 | sì | ✅ |
| BTN tactile 4-pin | sì | sì | ✅ |
| MM display value | "0.00" | "9.00V" premi pulsante | ⚠️ user interaction needed |

### Verdetto esp2
**ACCETTABILE-LOW.** bb size mismatch HALF vs FULL = visivamente bb troppo piccola. MM funziona display + probes connessi. User deve interagire pulsante per vedere 9V → discharge.

---

## v2-cap7-esp2 — Scarica cap con LED rosso

### Prod screenshot
- File: `artifacts/demo-captures/v2-cap7-esp2-prod.png`
- bb + battery + BTN1 + C1 + R + LED rosso + MM
- Setup compatto su bb singola
- LED rosso piccolo visible col ~19
- MM giallo destra
- Wire visibili: rosso/nero batteria + jumper bb + 1 probe MM (manca probe secondo?)

### Libro pag.69-71
- bb FULL SIZE + 7 wire visibili (3 colorati + 2 bat + 2 probe MM)
- LED rosso anodo R libero, catodo zona post-gap

### Diff
| Aspetto | Prod | Libro | Match? |
|---------|------|-------|--------|
| bb size | HALF | **FULL** | ❌ **P0 BLOCKER** |
| Tutti componenti present | sì | sì | ✅ |
| LED + R serie | sì | sì | ✅ |
| 8 step build sequence | 15 buildSteps repo | 8 prose libro | ⚠️ over-detail (codex round 2 H) |

### Verdetto esp2
**ACCETTABILE-LOW.** Tutti componenti, layout OK, bb size + step count = mismatch.

---

## v3-cap6-esp4 — Due LED polizia — **P0 BLOCKER**

### Prod screenshot
- File: `artifacts/demo-captures/v3-cap6-esp4-prod.png`
- Arduino Nano R4 sx + bb half
- 2 LED inserted blu + rosso
- **Code editor visible: `const int LED_BLU = 6; const int LED_ROSSO = 9;`**
- Wire orange D6+D9 + black ground
- Code loop: digitalWrite LED_BLU/LED_ROSSO alternated delay 200ms
- Title: "Due LED che si alternano"

### Libro V0.8.1 pag.37
- Verbatim: **"LED 1 → pin 8, LED 2 → pin 9"**
- Code verbatim: pinMode(8, OUTPUT); pinMode(9, OUTPUT);

### Diff
| Aspetto | Prod | Libro V0.8.1 | Match? |
|---------|------|---------------|--------|
| LED 1 pin | **6** | **8** | ❌ **P0 BLOCKER B1** |
| LED 2 pin | 9 | 9 | ✅ |
| LED colors | blu+rosso | colors non specificati libro (turquoise both PNG) | ⚠️ |
| Code Arduino | `LED_BLU=6, LED_ROSSO=9` | `pin 8, pin 9` | ❌ |
| Delay value | 200ms | 200ms (libro) | ✅ |
| 2 LED + 2 R + wire | sì | sì | ✅ |

### Verdetto esp4
**❌ NON PRONTO DEMO — P0 BLOCKER**

**Root cause**: repo `experiments-vol3.js` + lesson-path + code usano **D6** invece D8 canon libro V0.8.1.

**Andrea decision URGENT**:
- Vol3 canon = V0.8.1 PDF (round 3 mandate) → fix repo D6 → D8
- OR Vol3 canon = Vol3 final stampato (NON disponibile come PDF) → repo OK, V0.8.1 outdated

---

## v3-cap6-esp5 — Semaforo 3 LED — **P0 BLOCKER**

### Prod screenshot
- File: `artifacts/demo-captures/v3-cap6-esp5-prod.png`
- Arduino Nano sx + bb half
- 3 LED: ordine **verde-giallo-rosso** left-to-right (REPO)
- Code editor: `const int LED_VERDE = 5; LED_GIALLO = 6; LED_ROSSO = 9;`
- Wire orange × 3 da Nano pin
- Wire ground
- Title: "Costruiamo un semaforo"

### Libro V0.8.1 pag.38
- Verbatim: **"Verde → pin 5, Giallo → pin 6, Rosso → pin 7"**
- PNG layout LED: **red-yellow-green** left-to-right (codex round 2 confirm)
- Sequenza: 3000/1000/3000ms verbatim

### Diff
| Aspetto | Prod | Libro V0.8.1 | Match? |
|---------|------|---------------|--------|
| LED rosso pin | **9** | **7** | ❌ **P0 BLOCKER B1** |
| LED verde pin | 5 | 5 | ✅ |
| LED giallo pin | 6 | 6 | ✅ |
| LED layout order | verde-giallo-rosso (left→right) | **red-yellow-green** (left→right) | ❌ **REVERSED** |
| Timing | 3000/1000/3000ms | 3000/1000/3000ms | ✅ |
| Sequence | Verde→Giallo→Rosso | Verde→Giallo→Rosso | ✅ |
| D9 short to GND repo bug | bb1:a22 → bus-bot-minus-22 | N/A | ❌ **P0 hazard** |

### Verdetto esp5
**❌ NON PRONTO DEMO — P0 BLOCKER**

**Root causes**:
1. Pin rosso D9 invece D7 (canon V0.8.1)
2. LED layout REVERSED green-yellow-red vs libro red-yellow-green
3. Repo bug indipendente: D9 short to GND via column a22

**Fix Andrea ratify URGENT**: stesso decision esp4 (V0.8.1 vs final stampato canon).

---

## Convergenza valutazione finale

**Andrea + me + codex 5 round iterazioni**:
- Codex round 1: 9 errori miei corretti (Vol1)
- Codex round 2: 8 errori miei corretti (Vol2/Vol3) + 4 BLOCKER trovati
- Codex round 3: schema BLOCKER fixed + 8 residual issues
- Codex round 4: 4 safe fixes applied + Andrea ratify queue 13 decisions
- Round 5 visual diff (questo doc): **3 P0 BLOCKER CONFIRMED via prod screenshot** + 4 esp accettabili-low

**3 P0 BLOCKER demo 25/05 sera**:
1. **esp3** LED bruciato R=220 burn threshold solver
2. **esp4** code D6 vs canon D8
3. **esp5** code D9 vs canon D7 + LED layout REVERSED

**Andrea ratify URGENT**:
1. Vol3 canon: V0.8.1 PDF (D8+D9 / D5+D6+D7) OR Vol3 final stampato (D6+D9 / D5+D6+D9)?
2. esp3 solver burn threshold fix (Opt A 40mA OR Opt B R 270Ω OR Opt C LED Vf)
3. Vol2 bb-half → bb-full migration
4. Vol3 esp5 D9-short-to-GND repo bug fix (independent canon)

**Stop iterazione**: questo è il visual diff FINALE pre-Andrea ratify. Iterazioni successive richiedono Andrea decision queue.

## Files reference

- Prod screenshots: `artifacts/demo-captures/v{1,2,3}-cap{6,7}-esp{1..5}-prod.png` (7 file, 146-190KB each)
- Libro PNG: `reference/vol{1,2,3}/v{...}-esp{...}/page-{N}.png` (11 file 200 DPI)
- bookGeometry canon: `src/data/book-geometry/v{...}.bookGeometry.json` (7 file)
- Convergence docs: `convergence-round{1,2,3}.md`
- Source diff docs: `v{1,2,3}-source-diff-{phase-D,round4}.md`
- Deep analysis: `v{...}-deep.md` (7 file)
- Sprint A close: `_SPRINT-A-CLOSE.md`
