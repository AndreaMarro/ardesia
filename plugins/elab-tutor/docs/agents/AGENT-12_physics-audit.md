# AGENT-12 Component Physics Audit Report

**Date**: 13/02/2026
**Auditor**: AGENT-12 (Component Physics Auditor)
**Scope**: READ-ONLY audit of all 21 SVG components in ELAB Simulator
**Target audience**: Educational tool for children ages 8-14

---

## 1. Component-by-Component Audit Table

### 1.1 Power Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score (1-10) | Physics Score (1-10) |
|-----------|--------------|------------|----------------|-----------|----------------|---------------------|----------------------|
| Battery9V | `battery9v` | `positive` (x:-15,y:42), `negative` (x:15,y:42) | `_initState`: voltage=9, connected=true | MATCH | 9V (correct PP3) | 9 | 9 |
| NanoR4Board | `nano-r4` | 30 Nano pins + 16 Wing pins = 46 total | No solver handler (AVR bridge) | N/A | pinStates={}, leds, running | 9 | 8 |

**Battery9V Notes**:
- SVG shows photorealistic PP3 form factor with snap terminals (smaller + post, larger - socket) -- physically accurate
- Red wire to +, black wire to - -- correct polarity convention
- Voltage display shows "9.0V" -- appropriate for the component
- Solver uses comp.value||9, supporting alternative voltages (e.g. 1.5V) -- good flexibility
- Pin types: both `power` -- correct

**NanoR4Board Notes**:
- Based on real DWG extraction (NanoBreakout V1.1 GP, 77.5x55.0mm at 5:1 scale)
- 2x15 pin headers at 2.54mm pitch (PIN_PITCH=12.7 SVG units) -- physically accurate
- USB-C connector, MCU chip, SMD passives, reset button -- all present
- PWM pins correctly marked with ~ prefix (D3, D5, D6, D9, D10, D11)
- Wing connection pins duplicate Arduino pins for student access -- matches real hardware
- 5 on-board LEDs (PWR, D13/L, TX, RX, RGB) -- matches Arduino Nano specs

---

### 1.2 Passive Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score | Physics Score |
|-----------|--------------|------------|----------------|-----------|----------------|-------------|---------------|
| Resistor | `resistor` | `pin1` (x:-26.25,y:0), `pin2` (x:26.25,y:0) | pin1/pin2 in _getOtherPin, R=comp.value\|\|470 | MATCH | 470 ohm | 9 | 9 |
| Capacitor | `capacitor` | `positive` (x:0,y:-18), `negative` (x:0,y:18) | positive/negative, C=comp.value*1e-6 | MATCH | 100uF | 8 | 8 |
| Potentiometer | `potentiometer` | `vcc` (x:-8,y:22), `signal` (x:0,y:22), `gnd` (x:8,y:22) | vcc/signal/gnd in solver | MATCH | 10kOhm, position=0.5 | 8 | 9 |
| Diode | `diode` | `anode` (x:-20,y:0), `cathode` (x:20,y:0) | anode/cathode, Vf=0.7V | MATCH | 1N4148 | 8 | 9 |

**Resistor Notes**:
- 4-band color code calculated from value (calculateBands function) -- physically accurate
- Correct band mapping: digit1, digit2, multiplier, tolerance (gold=5%) -- standard IEC
- Axial through-hole form factor with 3D cylindrical gradient -- recognizable
- Lead spacing: 52.5 SVG units (7 columns x 7.5px pitch) -- fits breadboard correctly
- Current flow animation when hasFlow -- good pedagogical feedback

**Capacitor Notes**:
- Electrolytic vertical form factor with white polarity stripe on negative side -- correct
- K-groove vent mark on top -- realistic detail
- Charge indicator (green glow proportional to state.charge) -- good educational feature
- Solver implements RC transient: V(t) = V_target + (V_current - V_target) * e^(-dt/tau) -- physically correct
- Default 100uF appropriate for Vol2 experiments

**Potentiometer Notes**:
- Blue rotary body with knurled silver knob -- recognizable trimpot appearance
- Voltage divider formula: signal = vLow + (vHigh - vLow) * position -- correct physics
- Interactive rotation via PotOverlay -- good for children
- Pin names (vcc/signal/gnd) match the CRITICAL PIN NAME MAP specification

**Diode Notes**:
- Glass-orange body (1N4148 style) with cathode band -- correct identification marking
- Internal silicon die visible -- good educational detail
- Vf=0.7V in solver (DIODE_VF constant) -- correct for silicon signal diode
- Conducting/non-conducting state with animation -- clear visual feedback
- Current calculation: I = (V - Vf) / R -- correct Shockley simplification for education

---

### 1.3 Output Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score | Physics Score |
|-----------|--------------|------------|----------------|-----------|----------------|-------------|---------------|
| LED | `led` | `anode` (x:-3.75,y:22), `cathode` (x:3.75,y:22) | anode/cathode, Vf by color | MATCH | brightness=0, burned=false | 9 | 9 |
| RGB LED | `rgb-led` | `red` (x:-4,y:22), `common` (x:-1,y:24), `green` (x:2,y:22), `blue` (x:5,y:22) | red/common/green/blue per-channel solve | MATCH | r=0, g=0, b=0 | 8 | 8 |
| Buzzer | `buzzer-piezo` | `positive` (x:-4,y:20), `negative` (x:4,y:20) | positive/negative, threshold=2V | MATCH | on=false, freq=2000Hz | 8 | 7 |
| Motor DC | `motor-dc` | `positive` (x:-6,y:-16), `negative` (x:6,y:-16) | positive/negative, threshold=1.5V | MATCH | on=false, speed=0 | 8 | 8 |
| Servo | `servo` | `signal` (x:-6,y:24), `vcc` (x:0,y:24), `gnd` (x:6,y:24) | No DC solver (AVR bridge) | N/A | angle=90, active=false | 8 | 7 |
| LCD 16x2 | `lcd16x2` | `rs`, `e`, `d4-d7`, `vcc`, `gnd` (8 pins) | No DC solver (AVR bridge) | N/A | 2-line text, backlight=true | 9 | 8 |

**LED Notes**:
- 5mm through-hole form factor with dome, flat spot (cathode indicator), epoxy base -- physically accurate
- Forward voltage by color: red=1.8V, green=2.0V, blue=3.0V, yellow=2.0V, white=3.2V -- correct real-world values
- Burn detection at >40mA (or V>>Vf without resistor) -- excellent educational feature
- "BRUCIATO!" overlay with smoke animation for burned LED -- highly visible for children
- Brightness = min(1, current/0.02) -- 20mA = full brightness, correct typical LED spec
- Glow effect with radial gradient -- visually clear on/off state
- Lead spacing: 7.5 SVG units (1 breadboard column) -- correct for 5mm LED

**RGB LED Notes**:
- 4-pin common cathode, translucent dome with internal dies visible -- recognizable
- Each channel solved independently via _solveRGBLed -- correct for CC configuration
- Pin names match CRITICAL PIN NAME MAP (red/common/green/blue)
- Color mixing through opacity channels -- effective educational visualization

**Buzzer Notes**:
- Cylindrical form factor, metallic top rim, sound hole, "+" polarity mark -- recognizable
- Web Audio API with OscillatorNode square wave at 2000Hz -- audible feedback
- Threshold voltage 2.0V -- appropriate for piezo buzzer
- Sound wave animation when active -- good visual feedback
- Fixed frequency (2000Hz) regardless of voltage -- simplified but acceptable for education
- **Minor issue**: Real piezo buzzers are typically louder at resonance (~4kHz), 2kHz is adequate for demo

**Motor DC Notes**:
- Silver cylinder with end cap, rotating shaft cross indicator -- recognizable
- Speed proportional to voltage: speed = min(1, V/9) -- simple but effective model
- Direction tracking (state.direction based on polarity) -- physically correct
- Rotation animation with variable speed -- clear visual feedback
- Threshold 1.5V -- reasonable for small DC motors
- Internal resistance modeled as 10 ohm in solver -- simplified but adequate

**Servo Notes**:
- SG90-style blue body with mounting tabs, white horn, 3 colored wires (orange/red/brown) -- recognizable
- Angle range 0-180 degrees, default 90 -- correct for micro servos
- PWM-to-angle conversion handled by AVR bridge -- correct architecture
- Horn rotation animation -- clear visual feedback
- **Minor issue**: No DC solver handler (expected -- servo is driven by PWM from AVR)

**LCD 16x2 Notes**:
- Green PCB with metal bezel, green backlight screen -- recognizable HD44780 module
- Full 5x7 dot-matrix font covering ASCII 32-126 (95 characters) -- complete and correct
- 4-bit mode with RS, E, D4-D7 pins -- correct HD44780 interface
- Blinking cursor support -- matches real LCD behavior
- Mounting holes at corners -- realistic detail
- Pin labels (RS, E, D4, D5, D6, D7, V+, GND) -- clear for students

---

### 1.4 Input Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score | Physics Score |
|-----------|--------------|------------|----------------|-----------|----------------|-------------|---------------|
| PushButton | `push-button` | `pin1-pin4` (4 pins at corners) | pin1/pin2 only (pair treated as switch) | PARTIAL | pressed=false | 8 | 8 |
| PhotoResistor (LDR) | `photo-resistor` | `pin1` (x:-3,y:20), `pin2` (x:3,y:20) | pin1/pin2, R=1k-10k based on light | MATCH | lightLevel=0.5, R=5000 | 8 | 8 |
| Phototransistor | `phototransistor` | `collector` (x:0,y:-18), `emitter` (x:0,y:18) | collector/emitter, light>0.05 threshold | MATCH | lightLevel=0.5, conducting=false | 8 | 7 |
| ReedSwitch | `reed-switch` | `pin1` (x:-22,y:0), `pin2` (x:22,y:0) | pin1/pin2 (closed when magnetic) | MATCH | closed=false | 8 | 8 |

**PushButton Notes**:
- 4-pin tactile switch layout (6x6mm form factor) with black square body, round button cap -- physically accurate
- JSX defines 4 pins (pin1-4 at corners) but solver only uses pin1/pin2 as a switch pair
- In real 6x6mm tactile switches, pin1-pin3 and pin2-pin4 are internally connected pairs -- the 4-pin JSX is correct
- The solver treats it as a simple SPST switch (pin1/pin2 connected when pressed) -- adequate simplification
- Press animation with visual feedback -- clear state indication
- **Note**: The pin3/pin4 are defined in JSX for breadboard placement but solver ignores them; the internal connections (pin1=pin3, pin2=pin4) should be handled by Union-Find or breadboard connectivity

**PhotoResistor (LDR) Notes**:
- Brown ceramic disc with CdS serpentine pattern -- recognizable LDR appearance
- Light arrows showing incident light -- good educational detail
- Resistance formula: R = 1000 + (1-lightLevel)*9000 giving 1kOhm-10kOhm range -- reasonable for CdS cells
- Interactive light slider via LdrOverlay -- excellent for children
- Non-polarized (pin1/pin2 are generic) -- correct, LDRs have no polarity

**Phototransistor Notes**:
- Semi-transparent dark dome with internal silicon die -- recognizable
- Light arrows showing incident light -- good educational consistency with LDR
- 2 pins only (collector/emitter, no base) -- correct for light-activated NPN
- Conducting threshold: lightLevel > 0.05 (solver) vs > 0.2 (JSX display) -- **MINOR MISMATCH** in threshold values between solver and JSX
- Current model: I = 5mA * lightLevel -- simplified but adequate

**ReedSwitch Notes**:
- Green glass ampule with internal ferromagnetic contacts -- physically accurate
- Horizontal layout matching real reed switch form factor -- correct
- "Click = magnete" hint text -- helpful for children
- Toggle interaction (click simulates magnet approach) -- intuitive
- Contact animation when closed -- clear state indication

---

### 1.5 Semiconductor Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score | Physics Score |
|-----------|--------------|------------|----------------|-----------|----------------|-------------|---------------|
| MOSFET-N | `mosfet-n` | `gate` (x:-20,y:0), `drain` (x:0,y:-22), `source` (x:0,y:22) | gate/drain/source, Vgs_th=2.0V | MATCH | on=false, vgs=0, ids=0 | 8 | 8 |

**MOSFET-N Notes**:
- TO-92 package with black body, flat side, 3 metal legs -- correct package identification
- Modeled as 2N7000 N-channel enhancement MOSFET -- appropriate for education
- Vgs threshold = 2.0V -- correct for 2N7000 (datasheet typ. 1.0-2.5V)
- Gate/Drain/Source pin layout matches TO-92 standard pinout (G-D-S left to right) -- correct
- Status LED indicator (green=conducting, red=off) -- clear for children
- GateTouched bypass for floating gate experiments -- nice educational feature
- Ids calculation: |Vds|/0.1 -- simplified but demonstrates switch behavior

---

### 1.6 Board Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score | Physics Score |
|-----------|--------------|------------|----------------|-----------|----------------|-------------|---------------|
| BreadboardHalf | `breadboard-half` | 422 pins (300 main + 120 bus + 2 legacy) | No solver handler (connectivity only) | N/A | activeHoles={} | 9 | 9 |
| BreadboardFull | `breadboard-full` | 758 pins (630 main + 126 bus + 2 legacy) | No solver handler (connectivity only) | N/A | activeHoles={} | 9 | 9 |

**BreadboardHalf Notes**:
- 30 columns x 10 rows (a-e + f-j) = 400 tie-points -- correct standard breadboard
- Central IC channel with alignment notches -- physically accurate
- 4 power bus rails (top+/top-, bot+/bot-) -- correct layout
- HOLE_PITCH = 7.5px (mapping from 2.54mm at 5:1 would be 12.7, but 7.5 works for the SVG scale used) -- consistent internal convention
- Internal connectivity: columns a-e per row = 1 net, f-j per row = 1 net, gap = no connection -- correct
- Bus naming: `bus-top-plus`, `bus-bot-plus` etc. -- matches project convention (NOT bus-bottom)
- Row/column labels (a-j, 1-30) visible -- essential for education
- Color-coded power rails (red +, blue -) -- standard convention
- Interactive holes in wire mode (crosshair cursor) -- good UX

**BreadboardFull Notes**:
- 63 rows x 10 columns = 830 tie-points -- correct for full-size breadboard
- Vertical orientation (rotated 90 degrees vs half breadboard) -- matches real vertical breadboards
- 2 vertical bus rails on left side (plus/minus) -- correct
- Same internal connectivity rules as half breadboard -- consistent

---

### 1.7 Tool Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score | Physics Score |
|-----------|--------------|------------|----------------|-----------|----------------|-------------|---------------|
| Multimeter | `multimeter` | `probe-positive` (x:6,y:45), `probe-negative` (x:-6,y:45) | probe-positive/probe-negative | MATCH | reading=0, mode=voltage | 9 | 9 |
| Wire | `wire` | `start` (x:0,y:0), `end` (x:50,y:0) | Not solved (connectivity only) | N/A | current=0 | 7 | 8 |

**Multimeter Notes**:
- Yellow body (standard DMM color), LCD display, rotary selector knob -- recognizable
- 3 modes: Voltage (V), Resistance (Ohm), Current (A) -- complete for education
- Pin names match CRITICAL PIN NAME MAP (probe-positive/probe-negative)
- Draggable probes with snap-to-pin and visual glow -- excellent interaction
- Bezier wire curves from body to probe tips -- realistic
- Voltage mode: V = |V_pos - V_neg| -- correct
- Resistance mode: BFS path trace between probes -- correct approach
- Current mode: I = V_supply / R_total (in mA) -- correct
- Click knob to cycle modes (V -> Ohm -> A) -- intuitive for children

**Wire Notes**:
- 8 color options (red, black, orange, yellow, green, blue, purple, white) -- adequate set
- Bezier curve routing for natural appearance -- good
- Current flow animation (green dot along path) -- good educational visualization
- 3D shadow and highlight for depth -- visually appealing
- **Note**: Wire component in registry is a basic point-to-point wire; the more sophisticated WireRenderer.jsx handles bezier routing with corner radius in the canvas

---

### 1.8 Non-Circuit Components

| Component | Registry Type | Pins (JSX) | Pins (Solver) | Pin Match | Default Values | Visual Score | Physics Score |
|-----------|--------------|------------|----------------|-----------|----------------|-------------|---------------|
| Annotation | N/A (not registered) | N/A | N/A | N/A | text='', editable | 7 | N/A |

**Annotation Notes**:
- Not a circuit component -- it is a UI element for canvas notes
- Sticky-note style (#FFF9C4 yellow) with shadow and fold line -- visually consistent
- Double-click to edit, Ctrl+Enter to save, Escape to cancel -- standard editing paradigm
- Draggable, selectable, deletable -- full CRUD operations
- Not registered in component registry (correct -- it is not an electrical component)

---

## 2. Cross-Reference Matrix

### 2.1 Registry <-> Solver <-> Experiments

| Registry Type | Category (Registry) | Category (Palette) | Category Match? | Solver Handler | Solver _initState | Used in Vol1 | Used in Vol2 | Used in Vol3 |
|--------------|--------------------|--------------------|-----------------|----------------|-------------------|-------------|-------------|-------------|
| `battery9v` | `power` | `power` | YES | YES (supply source) | voltage=9, connected=true | YES (all 38) | YES (all 18) | NO |
| `nano-r4` | `board` | `power` | MISMATCH | NO (AVR bridge) | running, pinStates, leds | NO | NO | YES (all 11) |
| `resistor` | `passive` | `passive` | YES | `_solveResistor` | current=0, voltage=0 | YES | YES | YES |
| `capacitor` | `passive` | `passive` | YES | `_solveCapacitor` | charge=0, voltage=0, current=0 | NO | YES | NO |
| `potentiometer` | `input` | `passive` | MISMATCH | `_solvePotentiometer` | position=0.5, R=5000 | YES | YES | YES |
| `diode` | `passive` | `passive` | YES | `_solveDiode` | conducting=false, current=0 | YES | NO | NO |
| `mosfet-n` | `active` | `semi` | MISMATCH | `_solveMOSFET` | on=false, vgs=0, ids=0 | YES | YES | NO |
| `led` | `output` | `output` | YES | `_solveLED` | brightness=0, on=false, burned=false | YES | YES | YES |
| `rgb-led` | `output` | `output` | YES | `_solveRGBLed` | on=false, per-channel state | YES | NO | NO |
| `buzzer-piezo` | `output` | `output` | YES | `_solveBuzzer` | frequency=0, on=false | YES | NO | YES |
| `motor-dc` | `output` | `output` | YES | `_solveMotor` | speed=0, on=false, direction=1 | YES | YES | NO |
| `servo` | `actuators` | `output` | MISMATCH | NO (AVR bridge) | angle=90, active=false | NO | NO | YES |
| `lcd16x2` | `output` | `output` | YES | NO (AVR bridge) | text, cursorPos, backlight | NO | NO | YES |
| `push-button` | `input` | `input` | YES | Switch merge in Union-Find | pressed=false | YES | YES | YES |
| `reed-switch` | `input` | `input` | YES | Switch merge in Union-Find | closed=false | YES | YES | NO |
| `photo-resistor` | `input` | `input` | YES | Resistance value in solver | lightLevel=0.5, R=5000 | YES | YES | YES |
| `phototransistor` | `input` | `input` | YES | `_solvePhototransistor` | lightLevel=0.5, conducting=false | YES | NO | NO |
| `breadboard-half` | `passive` | `board` | MISMATCH | NO (connectivity) | activeHoles={} | YES | YES | YES |
| `breadboard-full` | `passive` | `board` | MISMATCH | NO (connectivity) | activeHoles={} | NO | NO | YES |
| `multimeter` | `passive` | `tool` | MISMATCH | `_solveMultimeter` | reading=0, mode=voltage | NO | YES | NO |
| `wire` | `wire` | `tool` | MISMATCH | NO (connectivity) | current=0 | YES | YES | YES |

### 2.2 Category Mismatches Summary

The ComponentPalette uses a **user-facing** category system that differs from the registry's **technical** categories. This is **not necessarily a bug** -- the palette categories are designed for children's comprehension (grouping by what the component "does" in the circuit), while registry categories are for internal classification.

| Component | Registry Category | Palette Category | Assessment |
|-----------|------------------|-----------------|------------|
| `nano-r4` | `board` | `power` | ACCEPTABLE -- Nano provides 5V power, so "Alimentazione" makes sense to kids |
| `potentiometer` | `input` | `passive` | QUESTIONABLE -- Pot is both passive and input; palette "Passivi" groups it with R/C/diode which is reasonable |
| `mosfet-n` | `active` | `semi` | ACCEPTABLE -- "Semiconduttori" is the correct electronics term |
| `servo` | `actuators` | `output` | ACCEPTABLE -- servo is an output actuator |
| `breadboard-half/full` | `passive` | `board` | ACCEPTABLE -- "Board" is more intuitive for children |
| `multimeter` | `passive` | `tool` | ACCEPTABLE -- "Strumenti" is the correct grouping |
| `wire` | `wire` | `tool` | ACCEPTABLE -- wire is a tool in the palette context |

**Recommendation**: Only the potentiometer mismatch is worth reviewing. In the palette, potentiometer is grouped with resistor/capacitor/diode under "Passivi" -- but it is actually an interactive input device. Consider moving it to "Input" in the palette, or leave it as-is since it is technically a passive component (variable resistor).

---

## 3. Physical Accuracy Assessment

### 3.1 Forward Voltage Values (LED_VF in CircuitSolver.js)

| LED Color | Solver Vf | Real-World Range | Assessment |
|-----------|-----------|------------------|------------|
| Red | 1.8V | 1.6-2.2V | CORRECT (typical) |
| Green | 2.0V | 1.8-2.4V | CORRECT (typical) |
| Blue | 3.0V | 2.8-3.5V | CORRECT (typical) |
| Yellow | 2.0V | 1.8-2.2V | CORRECT (typical) |
| White | 3.2V | 3.0-3.5V | CORRECT (typical) |

### 3.2 Component Default Values

| Component | Default Value | Real-World Typical | Assessment |
|-----------|-------------|-------------------|------------|
| Resistor | 470 ohm | Common E24 value | CORRECT |
| Capacitor | 100uF | Common electrolytic | CORRECT |
| Potentiometer | 10kOhm | Common trimpot value | CORRECT |
| Diode (1N4148) | Vf=0.7V | Typ. 0.65-0.75V | CORRECT |
| MOSFET (2N7000) | Vgs_th=2.0V | Typ. 1.0-2.5V | CORRECT (mid-range) |
| Buzzer threshold | 2.0V | Varies (1.5-5V) | ACCEPTABLE |
| Motor threshold | 1.5V | Varies | ACCEPTABLE |
| LDR range | 1kOhm-10kOhm | Typ. 200ohm-10kOhm (at varying light) | SLIGHTLY NARROW but acceptable for education |
| LED burn threshold | >40mA | Typ. 20-30mA max for standard LEDs | SLIGHTLY HIGH -- real LEDs can be damaged at 30mA continuous; 40mA is acceptable as a safety margin for the simulation |

### 3.3 SVG Scale Consistency

| Parameter | Value | Assessment |
|-----------|-------|------------|
| Project scale | 5:1 (1mm = 5 SVG units) | Standard |
| BB_HOLE_PITCH | 7.5px | Note: This maps to 1.5mm physical, not 2.54mm. The breadboard uses its own internal coordinate system that is self-consistent but not at the 5:1 project scale. This is acceptable since breadboard and components align visually. |
| Resistor body | 26px wide (5.2mm at 5:1) | Correct for axial 1/4W |
| LED body | ~15px wide (3mm at 5:1) | Slightly smaller than real 5mm LED but recognizable |
| Battery body | 36x62 SVG units (7.2x12.4mm at 5:1) | Underscale vs real PP3 (26.5x48.5mm) but proportionally correct |
| Servo body | 40x30 SVG units (8x6mm at 5:1) | Underscale vs real SG90 (23x12.2mm) but recognizable |

**Assessment**: Components are not all to the exact same physical scale, which is common and acceptable in educational circuit simulators. The relative proportions (LED < resistor < battery < breadboard) are maintained, ensuring visual clarity for children.

### 3.4 Circuit Solver Physics Assessment

| Feature | Implementation | Assessment |
|---------|---------------|------------|
| Ohm's Law (V=IR) | `_solveResistor`: I = V_drop / R | CORRECT |
| Kirchhoff's Current Law | MNA/Gaussian elimination with partial pivoting | CORRECT (Sprint 2) |
| LED threshold + burn | Vf check, I = (V-Vf)/R, burn at >40mA | CORRECT |
| Voltage divider (pot) | signal = vLow + (vHigh-vLow) * position | CORRECT |
| RC transient | V(t) = V_target + (V_curr - V_target) * e^(-dt/tau) | CORRECT (exponential decay) |
| MOSFET switch | Vgs >= threshold -> conducting | CORRECT (simplified switch model) |
| Diode forward bias | V_anode - V_cathode >= 0.7V -> conducting | CORRECT |
| Parallel resistance | MNA solver handles multiple current paths | CORRECT (Sprint 2, ~90%+ accuracy) |
| Series LED voltage drops | Path VDrop accumulation in _solveLED | CORRECT |

---

## 4. Findings Summary

### 4.1 Issues Found

| # | Severity | Component | Description |
|---|----------|-----------|-------------|
| 1 | LOW | PushButton | JSX defines 4 pins (pin1-4) but solver only uses pin1/pin2 as switch pair. Pin3/pin4 internal connections (pin1=pin3, pin2=pin4) rely on breadboard Union-Find, which is correct but not explicitly documented in the component. |
| 2 | LOW | Phototransistor | Conducting threshold mismatch: solver uses lightLevel>0.05, JSX display condition uses lightLevel>0.2 for "conducting" text/animation. The solver is more sensitive than the visual feedback suggests. |
| 3 | INFO | Category mismatches | 7 components have different categories in registry vs palette. All are justifiable for the educational context (see Section 2.2). |
| 4 | INFO | Potentiometer | Registry category is 'input' but palette groups it under 'passive'. Consider consistency, though both are defensible. |
| 5 | INFO | Scale | Components are not all at exactly 5:1 physical scale -- each component uses proportions optimized for visual clarity on the canvas. This is standard practice for educational simulators. |
| 6 | INFO | Servo/LCD | No CircuitSolver handlers -- by design, these are AVR-driven components solved by AVRBridge.js. Correct architecture. |
| 7 | LOW | Buzzer | Fixed 2kHz frequency regardless of applied voltage. Real piezo buzzers have voltage-dependent loudness and a resonant frequency (~4kHz for typical buzzers). Adequate for education. |
| 8 | INFO | LED burn | Burn threshold at 40mA is slightly generous (real LEDs: 20-30mA max continuous). This provides a safety margin so students see the LED "working" before it "burns" -- appropriate pedagogical choice. |

### 4.2 Missing Components for Experiments

Based on the experiment data files:

| Component Needed | Available? | Notes |
|-----------------|------------|-------|
| battery9v | YES | Used in all Vol1 + Vol2 experiments |
| nano-r4 | YES | Used in all Vol3 experiments |
| breadboard-half | YES | Used in most experiments |
| breadboard-full | YES | Used in some Vol3 experiments |
| resistor | YES | Used extensively |
| led | YES | Used extensively |
| rgb-led | YES | Used in Vol1 |
| push-button | YES | Used in Vol1, Vol2, Vol3 |
| potentiometer | YES | Used in Vol1, Vol2, Vol3 |
| photo-resistor | YES | Used in Vol1, Vol2, Vol3 |
| capacitor | YES | Used in Vol2 |
| multimeter | YES | Used in Vol2 |
| buzzer-piezo | YES | Used in Vol1, Vol3 |
| motor-dc | YES | Used in Vol1, Vol2 |
| diode | YES | Used in Vol1 |
| mosfet-n | YES | Used in Vol1, Vol2 |
| reed-switch | YES | Used in Vol1, Vol2 |
| phototransistor | YES | Used in Vol1 |
| servo | YES | Used in Vol3 (extras) |
| lcd16x2 | YES | Used in Vol3 (extras) |
| wire | YES | Used in all experiments |

**Result**: ALL 21 component types needed by the 69 experiments are available and registered. No missing components.

---

## 5. Physical Accuracy Scores (per component)

| # | Component | Visual Accuracy | Physics Accuracy | Overall Score |
|---|-----------|----------------|-----------------|---------------|
| 1 | Battery9V | 9/10 | 9/10 | 9/10 |
| 2 | NanoR4Board | 9/10 | 8/10 | 8.5/10 |
| 3 | Resistor | 9/10 | 9/10 | 9/10 |
| 4 | Capacitor | 8/10 | 8/10 | 8/10 |
| 5 | Potentiometer | 8/10 | 9/10 | 8.5/10 |
| 6 | Diode | 8/10 | 9/10 | 8.5/10 |
| 7 | LED | 9/10 | 9/10 | 9/10 |
| 8 | RGB LED | 8/10 | 8/10 | 8/10 |
| 9 | Buzzer | 8/10 | 7/10 | 7.5/10 |
| 10 | Motor DC | 8/10 | 8/10 | 8/10 |
| 11 | Servo | 8/10 | 7/10 | 7.5/10 |
| 12 | LCD 16x2 | 9/10 | 8/10 | 8.5/10 |
| 13 | PushButton | 8/10 | 8/10 | 8/10 |
| 14 | PhotoResistor | 8/10 | 8/10 | 8/10 |
| 15 | Phototransistor | 8/10 | 7/10 | 7.5/10 |
| 16 | ReedSwitch | 8/10 | 8/10 | 8/10 |
| 17 | MOSFET-N | 8/10 | 8/10 | 8/10 |
| 18 | BreadboardHalf | 9/10 | 9/10 | 9/10 |
| 19 | BreadboardFull | 9/10 | 9/10 | 9/10 |
| 20 | Multimeter | 9/10 | 9/10 | 9/10 |
| 21 | Wire | 7/10 | 8/10 | 7.5/10 |

### Aggregate Scores

| Category | Average Visual | Average Physics | Average Overall |
|----------|---------------|----------------|-----------------|
| Power (2) | 9.0 | 8.5 | 8.75 |
| Passive (4) | 8.25 | 8.75 | 8.50 |
| Output (6) | 8.33 | 7.83 | 8.08 |
| Input (4) | 8.0 | 7.75 | 7.88 |
| Semiconductor (1) | 8.0 | 8.0 | 8.0 |
| Board (2) | 9.0 | 9.0 | 9.0 |
| Tool (2) | 8.0 | 8.5 | 8.25 |
| **OVERALL (21)** | **8.38** | **8.24** | **8.31** |

---

## 6. Conclusion

The ELAB Simulator's 21 SVG components achieve a strong **8.3/10 overall physics accuracy score** for an educational tool targeting children ages 8-14. Key strengths:

1. **Pin naming**: All critical pin names match the CRITICAL PIN NAME MAP specification with zero mismatches.
2. **Forward voltages**: LED Vf values match real-world datasheets for all 5 colors.
3. **Circuit solver**: Implements Ohm's law, KCL/MNA, voltage dividers, RC transients, and diode/MOSFET switching correctly.
4. **Visual quality**: Photorealistic SVG with gradients, shadows, and highlights -- consistently high quality across all components.
5. **Educational features**: Burn detection, current flow animation, interactive overlays (pot/LDR sliders), and AI tutoring highlights are excellent pedagogical additions.
6. **Component coverage**: All 21 types needed by the 69 experiments are available and registered.

The 3 minor issues found (PushButton 4-pin solver usage, phototransistor threshold mismatch, buzzer fixed frequency) do not impact the educational effectiveness of the simulator.

---

*Report generated by AGENT-12 (Component Physics Auditor) on 13/02/2026*
