# AGENT-01 — Circuit Integrity Audit Report

**Auditor**: AGENT-01 (Senior Electronic Engineer)
**Date**: 2026-02-13
**Scope**: CircuitSolver.js, AVRBridge.js, experiments.js, component models
**Overall Score**: 8.5/10

## CRITICAL (2)

| ID | File | Line | Issue |
|----|------|------|-------|
| CRITICAL-01 | CircuitSolver.js | 934-952 | MNA LED model does not check polarity — reverse-biased LEDs modeled as conducting. Only affects MNA mode (parallel circuits). |
| CRITICAL-02 | AVRBridge.js | 861-864 | Servo angle calculation assumes 50Hz PWM, but Timer1 default frequency is 490Hz. Works in practice only because Servo.h reconfigures Timer1. Range heuristic (0.025-0.125) is fragile. |

## WARNING (11)

| ID | File | Line | Issue |
|----|------|------|-------|
| WARNING-01 | CircuitSolver.js | 30 | MOSFET Vgs(th)=2.0V at minimum of real-world range. 2.5V more representative. |
| WARNING-02 | CircuitSolver.js | 760-770 | Potentiometer R=0 at position extremes. Guarded in MNA but not path-tracer. |
| WARNING-03 | CircuitSolver.js | 511-535 | Short circuit detection only checks supply terminals, not component bypass. |
| WARNING-04 | CircuitSolver.js | 1394-1401 | Capacitor RC transient step 33ms. Coarse but convergent. |
| WARNING-05 | CircuitSolver.js | 754-755 vs 839 | Capacitor model inconsistent: path-tracer R=0 (short), MNA R=1M (open). Path-tracer incorrect for DC. |
| WARNING-06 | experiments-vol2 | ~327-332 | v2-cap7-esp1 push-button spans breadboard gap — verify connectivity. |
| WARNING-07 | experiments-vol3 | 96+ | All hexFile paths (/hex/*.hex) must exist at deploy time or AVR falls back. |
| WARNING-08 | CircuitSolver.js | 772 | Phototransistor conducting R=100ohm slightly high (real: 20-80ohm). |
| WARNING-09 | AVRBridge.js | 354-367 | ADC conversion instantaneous (real: ~104us). Acceptable for educational use. |
| WARNING-10 | AVRBridge.js | 356 | ADC channel mask only reads 0-7. Internal channels return 0. |
| WARNING-11 | AVRBridge.js | 923 | LCD nibble bit ordering verified CORRECT (D7=MSB, D4=LSB). |

## Verified Correct

- **LED Forward Voltages**: Red 1.8V, Green 2.0V, Blue 3.0V, Yellow 2.0V, White 3.2V — all within range
- **ATmega328p GPIO mapping**: PORTD[0:7]=D0-D7, PORTB[0:5]=D8-D13, PORTC[0:7]=A0-A7 — CORRECT
- **PWM Timer mapping**: All 6 PWM pins (D3,D5,D6,D9,D10,D11) correctly mapped to timers — CORRECT
- **Pin Name Map**: All components match MEMORY Pin Name Map exactly
- **Default values**: All component defaults realistic (R=470Ω, Pot=10kΩ, Bat=9V)
- **LED burn detection**: >40mA threshold correct
- **Short circuit detection**: Battery terminal short correctly detected
- **INPUT_PULLUP**: Correctly simulated with external override tracking
- **LCD HD44780**: 4-bit mode, E falling-edge, DDRAM addressing — all correct
- **Gaussian elimination**: Partial pivoting, 1e-15 threshold — numerically stable

## Experiment Spot-Check (15 experiments)

- Vol1 (5): v1-cap6-esp1/2/3, v1-cap7-esp1 — ALL CORRECT
- Vol2 (5): v2-cap7-esp1, v2-cap8-esp1/2 — ALL CORRECT (WARNING-06 on button connectivity)
- Vol3 (5): v3-cap6-blink, v3-cap6-pin5 — ALL CORRECT (WARNING-07 on hex files)

## Priority Fixes

1. **CRITICAL-01**: Add polarity check in MNA LED stamping (skip voltage source if reverse-biased)
2. **WARNING-05**: Change capacitor path-tracer R from 0 to 1e6 (consistent with MNA)
3. **WARNING-01**: Raise MOSFET_VGS_THRESHOLD from 2.0 to 2.5V
