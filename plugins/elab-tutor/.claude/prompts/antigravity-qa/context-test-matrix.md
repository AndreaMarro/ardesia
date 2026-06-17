# Test Matrix — Reference Experiments

## Vol1 (Passive) — Circuit Solver focus
| ID | Name | Components | Tests |
|----|------|-----------|-------|
| v1-led-simple | LED Semplice | battery, resistor, LED, bb | LED lights up, correct Vf |
| v1-parallel-led | LED in Parallelo | battery, 2 LED, resistors, bb | Both LEDs light, current split |
| v1-pushbutton | Pulsante | battery, LED, resistor, button, bb | Press=ON, release=OFF |
| v1-pot-led | Potenziometro | battery, LED, pot, bb | Pot rotation dims LED |

## Vol2 (Active) — Transistor/MOSFET focus
| ID | Name | Components | Tests |
|----|------|-----------|-------|
| v2-transistor-switch | Transistor Switch | battery, NPN, LED, resistors, bb | Base current switches LED |
| v2-mosfet-motor | MOSFET Motor | battery, MOSFET, motor, bb | Gate voltage threshold |

## Vol3 (AVR) — Arduino + Scratch focus
| ID | Name | Components | Tests |
|----|------|-----------|-------|
| v3-avr-led-blink | LED Blink esterno | nano, LED, resistor, bb | Compile, run, LED blinks D13 |
| v3-avr-cambia-pin | Cambia pin (D5) | nano, LED, resistor, bb | Different pin output |
| v3-avr-2led | Due LED | nano, 2 LED, 2 resistor, bb | Two pins alternate |
| v3-avr-pulsante | Pulsante | nano, LED, resistor, button, bb | digitalRead + button state |
| v3-avr-pot-serial | Potenziometro Serial | nano, pot, bb | analogRead + Serial.println |
| v3-avr-sos-morse | SOS Morse | nano, LED, resistor, bb | Timing pattern |
| v3-avr-semaforo | Semaforo | nano, 3 LED, 3 resistor, bb | Sequential traffic light |
| v3-avr-simon | Simon Says | nano, 4 LED, 4 button, bb | Game logic (complex) |

## Drag Test Scenarios
1. **Single component drag**: Pick up LED → move → drop on breadboard → snaps to hole
2. **Breadboard group drag**: Pick up breadboard → ALL children (LED, resistor, wires) move together
3. **Wire follow**: During group drag, wire endpoints must follow pin positions exactly
4. **Cross-gap placement**: Component with 2 pins spanning top/bottom breadboard sections
5. **Edge column placement**: Place resistor at column 28-30 (clamping test)
6. **BreadboardFull drag**: Same tests on vertical breadboard

## Screen Sizes to Test
| Device | Width × Height | Key checks |
|--------|---------------|------------|
| Desktop | 1920×1080 | Full toolbar, all panels |
| Laptop | 1366×768 | Toolbar overflow |
| iPad Pro landscape | 1366×1024 | Touch targets ≥44px |
| iPad landscape | 1024×768 | Compact toolbar |
| iPad portrait | 768×1024 | Vertical Scratch layout |
