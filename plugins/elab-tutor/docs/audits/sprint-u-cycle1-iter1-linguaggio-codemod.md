# Sprint U Cycle 1 — Linguaggio Codemod Audit
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815

## Replacement Matrix

| Pattern | Replaced with | Files affected |
|---------|--------------|----------------|
| "Premi Play" | "Premete Play" | ~50 (done previous iteration) |
| "Gira la manopola" | "Girate la manopola" | ~10 |
| "Gira le manopole" | "Girate le manopole" | ~5 |
| "muovi il cursore" | "muovete il cursore" | ~2 |
| "Avvicina il magnete" | "Avvicinate il magnete" | ~5 |
| "avvicina il magnete" | "avvicinate il magnete" | ~3 |
| "Prova " | "Provate " | ~10 |
| "Prova a " | "Provate a " | ~5 |
| "prova a " | "provate a " | ~3 |
| "Osserva " | "Osservate " | ~3 |
| "Guarda il" | "Guardate il" | ~3 |
| "Guarda l" | "Guardate l" | ~2 |
| "Guarda come" | "Guardate come" | ~2 |
| "Confronta " | "Confrontate " | ~3 |
| "fermandoti" | "fermandovi" | 1 |
| "apri il" | "aprite il" | 1 |
| "Prova resistori" | "Provate resistori" | 1 |
| "Prova ad espandere" | "Provate ad espandere" | 1 |
| "Prova ogni pulsante" | "Provate ogni pulsante" | 1 |
| "gira: il colore" | "girate: il colore" | 1 |
| "premi il pulsante. Guarda:" | "premete il pulsante. Guardate:" | 1 |
| "Osserva il valore sul display" | "Osservate il valore sul display" | 2 |
| "Prova a invertire" | "Provate a invertire" | 1 |
| "Prova con resistori" | "Provate con resistori" | 1 |
| "Confronta sempre" | "Confrontate sempre" | 1 |
| "Gira il potenziometro" (mid-sentence) | "Girate il potenziometro" | 1 |
| "Osserva:" → (mid-sentence) | "Osservate:" | 1 |
| "e osserva i numeri" | "e osservate i numeri" | 1 |
| "Prova a trovare" | "Provate a trovare" | 1 |

## Files modified: 84/94 lesson-path JSONs

## Verification result
- `grep -rn '"teacher_message"' src/data/lesson-paths/*.json | grep singolare-pattern | count` = **0**
- All 94 JSON files valid (node parse verify PASS)
- Vitest baseline preserved: 13472 PASS (unchanged)

## Honest gaps
- "Ragazzi," opener: 3/94 files have it (91/94 missing) — deferred Cycle 2
- Some "Prova" in CHIEDI phase remain as provocative questions (intentionally singular in rhetorical context)

