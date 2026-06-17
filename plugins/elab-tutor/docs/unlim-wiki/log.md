# UNLIM Wiki — Append-only audit log

Format: `ISO-8601 | agent | file | action | note`

```
2026-04-23T10:00Z | architect | SCHEMA.md                | create | L3 schema + conventions
2026-04-23T10:01Z | architect | index.md                 | create | catalog seed
2026-04-23T10:02Z | architect | concepts/led.md          | create | LED concept base Vol.1 pag.27
2026-04-23T10:03Z | architect | concepts/resistenza.md   | create | resistenza concept Vol.1 pag.35
2026-04-23T10:04Z | architect | concepts/legge-ohm.md    | create | legge di Ohm Vol.1 pag.45
2026-04-26T11:41Z | scribe(mac-mini) | concepts/analog-read.md   | update | Vol.3 pag.77 ADC 10-bit, batch wiki-concepts-batch-20260426-112238
2026-04-26T11:41Z | scribe(mac-mini) | concepts/digital-write.md | update | Vol.3 pag.47 HIGH/LOW pin OUTPUT, batch wiki-concepts-batch-20260426-112238
2026-04-26T11:41Z | scribe(mac-mini) | concepts/pin-mode.md      | update | Vol.3 pag.47 OUTPUT/INPUT/INPUT_PULLUP, batch wiki-concepts-batch-20260426-112238
2026-04-26T11:41Z | scribe(mac-mini) | concepts/ohm.md           | create | Vol.1 pag.35 unità misura Ω + codice colori, batch wiki-concepts-batch-20260426-112238
2026-04-26T11:41Z | scribe(mac-mini) | concepts/amperometro.md   | create | Vol.1 pag.25 misura corrente serie, batch wiki-concepts-batch-20260426-112238
2026-04-26T14:00Z | scribe-opus      | concepts/analog-write.md  | create | Vol.3 pag.89 PWM output ~3-5-6-9-10-11, Sprint S iter 3 by-hand
2026-04-26T14:00Z | scribe-opus      | concepts/if-else.md       | create | Vol.3 pag.102 controllo flusso decisione, Sprint S iter 3 by-hand
2026-04-26T21:30Z | scribe-opus      | concepts/matrice-led-8x8.md | create | Vol.3 pag.134 capstone MAX7219 multiplexing 64 LED, Sprint S iter 5 Phase 2 by-hand
2026-04-26T21:30Z | scribe-opus      | index.md                  | update | count 61 → 87 (catch-up post Mac Mini batches + iter 5 P2 +1)
```

NOTE: append-only. Non modificare righe precedenti. Se correzione serve, append nuova riga con action="correct:<file>".
