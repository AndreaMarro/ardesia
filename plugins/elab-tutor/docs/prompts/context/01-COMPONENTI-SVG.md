# 01 — Componenti SVG

> Ultimo aggiornamento: Sprint 1.1 (11/03/2026)
> Totale: 22 componenti registrati (20 circuito + Wire + Annotation)

## Mappa Completa

| # | Type ID | File | Pins | Category | Volume | Label |
|---|---------|------|------|----------|--------|-------|
| 1 | `led` | Led.jsx | anode, cathode | output | 1 | LED |
| 2 | `resistor` | Resistor.jsx | pin1, pin2 | passive | 1 | Resistore |
| 3 | `rgb-led` | RgbLed.jsx | red, common, green, blue | output | 1 | LED RGB |
| 4 | `push-button` | PushButton.jsx | pin1, pin2, pin3, pin4 | input | 1 | Pulsante |
| 5 | `potentiometer` | Potentiometer.jsx | (3 pins) | input | 1 | Potenziometro |
| 6 | `photo-resistor` | PhotoResistor.jsx | pin1, pin2 | input | 1 | Fotoresistore (LDR) |
| 7 | `buzzer-piezo` | BuzzerPiezo.jsx | positive, negative | output | 1 | Cicalino Piezo |
| 8 | `reed-switch` | ReedSwitch.jsx | (2 pins) | input | 1 | Reed Switch |
| 9 | `battery9v` | Battery9V.jsx | (2 pins) | power | 1 | Batteria 9V |
| 10 | `breadboard-half` | BreadboardHalf.jsx | (griglia fori) | passive | 1 | Breadboard (Half) |
| 11 | `breadboard-full` | BreadboardFull.jsx | (griglia fori) | passive | 1 | Breadboard (Full) |
| 12 | `capacitor` | Capacitor.jsx | positive, negative | passive | 2 | Condensatore |
| 13 | `diode` | Diode.jsx | anode, cathode | passive | 2 | Diodo |
| 14 | `mosfet-n` | MosfetN.jsx | gate, drain, source | active | 2 | MOSFET N-Channel |
| 15 | `phototransistor` | Phototransistor.jsx | collector, emitter | input | 2 | Fototransistor |
| 16 | `motor-dc` | MotorDC.jsx | positive, negative | output | 2 | Motore DC |
| 17 | `multimeter` | Multimeter.jsx | (2 pins) | passive | 2 | Multimetro |
| 18 | `nano-r4` | NanoR4Board.jsx | (top+bottom+wing) | board | 3 | ELAB NanoBreakout V1.1 GP |
| 19 | `servo` | Servo.jsx | (3 pins) | actuators | 3 | Servo |
| 20 | `lcd16x2` | LCD16x2.jsx | rs, e, d4-d7, vcc, gnd | output | 3 | LCD 16x2 |
| 21 | `wire` | Wire.jsx | start, end | wire | 1 | Filo |
| 22 | `annotation` | Annotation.jsx | - | - | - | Annotazione |

## Pin Details Critici

### LED: `anode` (A+) x:-3.75 y:22.5, `cathode` (K-) x:3.75 y:22.5
### Resistor: `pin1` x:-26.25 y:0, `pin2` x:26.25 y:0 (orizzontale)
### RGB LED: `red` x:-11.25, `common` x:-3.75, `green` x:3.75, `blue` x:11.25 (tutti y:22.5)
### PushButton: `pin1` x:-7.5 y:-7.5, `pin2` x:7.5 y:-7.5, `pin3` x:-7.5 y:7.5, `pin4` x:7.5 y:7.5
### Buzzer: `positive` x:-3.75 y:22.5, `negative` x:3.75 y:22.5
### PhotoResistor: `pin1` x:-3.75 y:22.5, `pin2` x:3.75 y:22.5
### Capacitor: `positive` x:0 y:-15, `negative` x:0 y:15 (verticale)
### Diode: `anode` x:-20 y:0, `cathode` x:20 y:0 (orizzontale)
### Phototransistor: `collector` x:0 y:-18, `emitter` x:0 y:18
### LCD16x2: rs, e, d4, d5, d6, d7, vcc, gnd (bottom row, spaced)
### NanoR4: Dynamic pins (allTopPins + allBottomPins + allWingPins)

## Note

- Volume cumulativo: Vol2 mostra componenti Vol1+Vol2, Vol3 mostra tutti
- NanoR4Board ha pin dinamici calcolati da arrays (non statici)
- Wire ha pin `start`/`end` con posizioni relative
- Breadboard ha pin generati dalla griglia (63 colonne, a-j righe + bus)
- Multimeter ha modalita DCV/DCA/Ohm con probe dinamiche
