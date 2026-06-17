# 07 — Arduino Nano R4 / ELAB NanoBreakout V1.1 GP

> Ultimo aggiornamento: Sprint 1.4 (11/03/2026)

## Descrizione

Il componente `nano-r4` (NanoR4Board.jsx) rappresenta l'ELAB NanoBreakout V1.1 GP, una PCB breakout gialla con:
- Semicerchio a sinistra (modulo Nano inserito)
- Ala a destra (connettore di espansione con pin duplicati)

## Layout Constants

```
PIN_PITCH   = 7.5    (allineato a griglia breadboard)
BOARD_W     = 168    (pixel)
BOARD_H     = 99     (pixel)
TOP_PIN_Y   = 35
BOTTOM_PIN_Y = 64
SEMI_R      = 49.5   (raggio semicerchio)
WING_X      = 128    (inizio ala)
CORNER_R    = 3.5
```

## Pin Header Top (15 pin, sinistra -> destra)

| ID | Label | Type | Arduino # |
|----|-------|------|-----------|
| D13 | D13 | digital | 13 |
| 3V3 | 3V3 | power | - |
| AREF | AREF | analog | - |
| A0 | A0 | analog | 14 |
| A1 | A1 | analog | 15 |
| A2 | A2 | analog | 16 |
| A3 | A3 | analog | 17 |
| A4 | A4 | analog | 18 |
| A5 | A5 | analog | 19 |
| A6 | A6 | analog | 20 |
| A7 | A7 | analog | 21 |
| 5V | 5V | power | - |
| MINUS | - | power | - |
| GND | GND | power | - |
| VIN | VIN | power | - |

## Pin Header Bottom (15 pin, sinistra -> destra)

| ID | Label | Type | Arduino # |
|----|-------|------|-----------|
| D12 | D12 | digital | 12 |
| D11 | ~D11 | pwm | 11 |
| D10 | ~D10 | pwm | 10 |
| D9 | ~D9 | pwm | 9 |
| D8 | D8 | digital | 8 |
| D7 | D7 | digital | 7 |
| D6 | ~D6 | pwm | 6 |
| D5 | ~D5 | pwm | 5 |
| D4 | D4 | digital | 4 |
| D3 | ~D3 | pwm | 3 |
| D2 | D2 | digital | 2 |
| GND_R | GND | power | - |
| RST_R | RST | control | - |
| RX | D0/RX | digital | 0 |
| TX | D1/TX | digital | 1 |

## Wing Pins (16 pin, duplicati con mapsTo)

| ID | Label | Arduino # | Maps To |
|----|-------|-----------|---------|
| W_A0 | A0 | 14 | A0 |
| W_A1 | A1 | 15 | A1 |
| W_A2 | A2 | 16 | A2 |
| W_A3 | A3 | 17 | A3 |
| W_D3 | ~D3 | 3 | D3 |
| W_D5 | ~D5 | 5 | D5 |
| W_D6 | ~D6 | 6 | D6 |
| W_D9 | ~D9 | 9 | D9 |
| W_A4 | A4/SDA | 18 | A4 |
| W_A5 | A5/SCL | 19 | A5 |
| W_D0 | D0/RX | 0 | RX |
| W_D1 | D1/TX | 1 | TX |
| W_D13 | D13/SCK | 13 | D13 |
| W_D12 | D12/MISO | 12 | D12 |
| W_D11 | ~D11/MOSI | 11 | D11 |
| W_D10 | ~D10 | 10 | D10 |
| W_D8 | D8 | 8 | D8 |

## Pin Invalidi (NanoBreakout enforcement)

I seguenti pin NON sono disponibili sull'ala fisica (nanobot.yml):
- D2, D4, D7 — non hanno connessione all'ala, solo header principale
- ~~D8~~ — aggiunto all'ala virtuale (Sprint 1.4) per v3-extra-simon (buzzer pin)

## PWM Pins

~D3, ~D5, ~D6, ~D9, ~D10, ~D11 (6 pin PWM, tilde nel label)

## LED Interni

- Power LED
- D13 LED (pin 13)
- RGB LED (3 canali)
- TX LED
- RX LED

## Default State

```js
{
  running: false,
  pinStates: {},
  leds: { power: false, d13: false, rgb: [0,0,0], tx: false, rx: false }
}
```

## Pin Mapping Verificato (Sprint 1.4)

13 pin nano unici usati in 12 esperimenti Vol3 AVR:
- Wing: W_A0, W_D3, W_D5, W_D6, W_D8, W_D9, W_D10, W_D11, W_D12, W_D13
- Header: 5V, GND, GND_R
- Tutti 13/13 risolti — 12/12 esperimenti caricano e renderizzano senza errori

## Problemi Noti

- SVG attuale e il "breaknano" — non e identico alla scheda Arduino Nano R4 del libro
- Sprint 4 prevede sostituzione SVG per parita visiva col libro (Sprint 1.11)
- Pin IDs DEVONO rimanere invariati per compatibilita CircuitSolver/PlacementEngine/experiments
- ~~W_D8 mancante~~ RISOLTO Sprint 1.4: aggiunto a WING_PINS (17 pin totali ala)
