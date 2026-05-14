# Archive — 13 no-counterpart Vol 3 experiments (EPIC 1 A4.1b)

These 13 experiments were removed in A4.1b (iter 55) — no printed counterpart in Volume 3 V0.8.1. Git-recoverable. If a future complete Vol 3 edition adds the content, the experiments are authored fresh from that edition, not resurrected (A4 spec P2).

## Removed lesson-paths (13)

The A3 evidence is the verbatim `note` field from `scripts/epic1/a3-corrections.json` `.experiments[<id>]` (each `action: "remove"`).

| id | original path | A3 evidence (verbatim `note`) |
|----|---------------|-------------------------------|
| `v3-cap6-esp6` | `src/data/lesson-paths/v3-cap6-esp6.json` | No 6th Ch6 experiment exists in the volume — Vol3 V0.8.1 Chapter 6 has ESPERIMENTO 1-5 only (vol3 lines 890-1234). |
| `v3-cap6-esp7` | `src/data/lesson-paths/v3-cap6-esp7.json` | No 7th Ch6 experiment exists in the volume — Vol3 V0.8.1 Chapter 6 has ESPERIMENTO 1-5 only. |
| `v3-cap7-esp4` | `src/data/lesson-paths/v3-cap7-esp4.json` | No PWM / luminosità-variabile experiment exists in volume Ch7 (Ch7 = pin di input/pulsante). grep for pwm\|analogwrite\|fade returns zero hits in vol3-v0.8.1.txt. |
| `v3-cap7-esp5` | `src/data/lesson-paths/v3-cap7-esp5.json` | No Fade-LED experiment exists in the volume. |
| `v3-cap7-esp7` | `src/data/lesson-paths/v3-cap7-esp7.json` | No contatore-binario experiment exists in the volume. |
| `v3-cap7-esp8` | `src/data/lesson-paths/v3-cap7-esp8.json` | No debounce experiment exists in the volume. |
| `v3-cap7-mini` | `src/data/lesson-paths/v3-cap7-mini.json` | No Ch7 mini-progetto exists in the volume; the volume's 'potenziometro ADC + LED' content is in Chapter 8, and the long 'ESERCIZIO 7.1' Tea/repo quote does not exist in this edition. |
| `v3-cap8-esp4` | `src/data/lesson-paths/v3-cap8-esp4.json` | No 'Serial Plotter / 2 potenziometri' experiment exists in the volume; Tea 'Legge di Ohm' is not in the volume either. |
| `v3-cap8-esp5` | `src/data/lesson-paths/v3-cap8-esp5.json` | No 'Pot + 3 LED' experiment exists in the volume; Tea 'Predire e misurare' is not in the volume either. |
| `v3-cap8-serial` | `src/data/lesson-paths/v3-cap8-serial.json` | No standalone 'comunicazione seriale: primo messaggio dal Nano al PC' experiment exists. Serial in the volume is only part of the Ch8 potentiometer program. Tea's quoted 'ESERCIZIO 8.1 / Ciao dal Team di ELAB!' passage is fabricated (not in V0.8.1). |
| `v3-extra-lcd-hello` | `src/data/lesson-paths/v3-extra-lcd-hello.json` | No LCD / display content exists anywhere in Volume 3 V0.8.1. |
| `v3-extra-servo-sweep` | `src/data/lesson-paths/v3-extra-servo-sweep.json` | No servo / servomotor content exists anywhere in Volume 3 V0.8.1. |
| `v3-extra-simon` | `src/data/lesson-paths/v3-extra-simon.json` | No 'Simon' game content exists anywhere in Volume 3 V0.8.1. |

## Archived `capitoli` whole-files (2)

Each of these `capitoli` files wraps a single removed experiment, so the whole file is archived.

| archived file | original path | wraps removed experiment |
|---------------|---------------|--------------------------|
| `capitoli-v3-bonus-lcd-hello.json` | `src/data/capitoli/v3-bonus-lcd-hello.json` | `v3-extra-lcd-hello` |
| `capitoli-v3-bonus-servo-sweep.json` | `src/data/capitoli/v3-bonus-servo-sweep.json` | `v3-extra-servo-sweep` |

## Deferred to A4.1d

These 4 SURVIVING lesson-paths have a `next_experiment.id` that points at a removed id. They must be re-threaded by A4.1d — NOT by A4.1b.

| surviving lesson-path | dangling `next_experiment.id` (removed) |
|-----------------------|-----------------------------------------|
| `v3-cap6-semaforo` | `v3-cap6-esp6` |
| `v3-cap7-esp3` | `v3-cap7-esp4` |
| `v3-cap7-esp6` | `v3-cap7-esp7` |
| `v3-cap8-esp3` | `v3-extra-lcd-hello` |
