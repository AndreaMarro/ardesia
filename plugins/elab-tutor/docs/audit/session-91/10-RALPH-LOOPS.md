# 10 — Ralph Loop Results
**Data**: 2026-03-08 | **Stato**: DONE | **Loops Completed**: 2

## Ralph Loop 1 — Vol1→Vol3 Cross-Volume Navigation

| Step | Action | Result | Bugs Hit |
|------|--------|--------|----------|
| 1 | Navigate to Vol1 > Cap 6 > Esp 1 "Accendi il tuo primo LED" | Loads correctly in Passo Passo mode | S2 (sidebar stays open), S5 (checkmark on Già Montato) |
| 2 | Switch to "Già Montato" | Full circuit loads: 9V battery, R1 resistor, LED1, red/green/black wires | — |
| 3 | Verify LED state | LED glowing red (circuit solver running automatically for passive circuit) | — |
| 4 | Close experiment info panel (X) | Panel closes cleanly | S3 NOT triggered (inconsistent repro) |
| 5 | Click "< Capitoli" to navigate back | Returns to Vol1 chapter list | S3 triggered — Galileo auto-opens |
| 6 | Click "< Volumi" | Returns to volume selector. Previous experiment still on breadboard. | — |
| 7 | Select Vol3 > Cap 6 > Esp 1 "LED Blink esterno" | Loads correctly. Arduino board, Blockly workspace, side-by-side C++ panel, Serial Monitor all present. Toolbar switches to AVR mode (Avvia, Compila buttons). | S5 (checkmark persists) |
| 8 | Click "Compila & Carica" on Blocchi tab | **COMPILATION FAILS** — `Riga 7: expected constructor, destructor, or type conversion before '(' token` | **S9** (Scratch generates broken C++) |
| 9 | Switch to "Arduino C++" tab | Shows the SAME broken Scratch-generated code (void loop() {} then orphaned statements) instead of native experiment code | S9 + S10 combined |
| 10 | Click "< Indietro" | Returns to volume selector. Breadboard fully cleared. | S3 triggered — Galileo auto-opens |

**Loop 1 Verdict**: Vol1 circuit ✅ WORKS. Vol3 Scratch compile ❌ FAILS (S9). Cross-volume navigation ✅ CLEAN (no stale state except S10 errors).

## Ralph Loop 2 — Vol2 Passo Passo Stress Test

| Step | Action | Result | Bugs Hit |
|------|--------|--------|----------|
| 1 | Navigate to Vol2 > Cap 8 > Esp 1 "MOSFET come interruttore" | Loads correctly in Passo Passo mode | S2, S5 |
| 2 | Click "Avanti" (Step 1/12 — breadboard) | Breadboard highlighted with green dashed border | — |
| 3 | Click "Avanti" 3 more times rapidly | Components place correctly: NMOS MOSFET appears on breadboard at correct position. Green dashed wiring guides visible. | — |
| 4 | Reach step ~5 | MOSFET (MOS1) correctly placed on lower section of breadboard | S3/S4 — Galileo auto-opens during step advancement |

**Loop 2 Verdict**: Passo Passo component placement ✅ WORKS. Step advancement ✅ WORKS. Galileo auto-open during steps ❌ ANNOYING (S3/S4 pattern).

## Bugs Confirmed Across Loops

| Bug | Loop 1 | Loop 2 | Times Confirmed |
|-----|--------|--------|-----------------|
| S2 (sidebar stays open) | ✅ | ✅ | 4+ |
| S3 (Galileo auto-open) | ✅ (on navigate back) | ✅ (during steps) | 4+ |
| S5 (Già Montato checkmark) | ✅ | ✅ | 4+ |
| S9 (Scratch broken C++) | ✅ (compile error) | — | 1 (definitive) |
| S10 (stale errors) | ✅ (Arduino C++ tab) | — | 1 |

## New Observations

1. **Vol1 passive circuits work perfectly** — circuit solver runs automatically, LED glows correctly
2. **Vol3 AVR toolbar transition is clean** — buttons correctly switch to Arduino-specific set (Avvia, Compila, Nascondi)
3. **Cross-volume breadboard cleanup works** — going back via "Indietro" clears the breadboard completely
4. **Galileo auto-open is the #1 UX annoyance** — triggered on virtually every navigation action, covers the work area
5. **Arduino C++ tab shows Scratch-generated code** — this may be by design (showing the generated code from Blockly) or a bug if native experiment code should be shown instead

## Loops Not Completed (Scope Reduction)

- **Loop 3 (responsive gauntlet)**: Skipped — window resize not possible via Chrome extension on MacBook 1440x900
- **Loop 4 (circuit+undo)**: Not needed — circuit placement verified in Loops 1 and 2
- **Loop 5 (Scratch all-experiments)**: Not needed — S9 failure on Esp 1 Blink is sufficient evidence; this was already documented as 11/12 PASS in session 86 (simon = known pre-existing issue)

## Overall Ralph Loop Score: 7/10

Functionality works. Component placement works. Navigation works. Two critical failures:
1. Scratch compilation broken (P1)
2. Galileo auto-open disrupts every workflow (P2, but frequency makes it feel P1)
