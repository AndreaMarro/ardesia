# Test Factory Report — 01:47 07/04/2026

## Risultato
- PRIMA: 1442 test
- DOPO: 1471 test (+29)
- Area: voiceCommands.js (da 0% a full coverage)
- PR: #21 su AndreaMarro/elabtutor
- Branch: auto/test-factory-0747

## Test Scritti (29)
- Exact match: 7 test (play, stop, compila, reset, annulla, ripeti, all 24 commands)
- Normalization: 6 test (case, accents, punctuation, whitespace, trim, mixed)
- Edge cases: 8 test (null, undefined, empty, short, nonsense, emoji, regex injection)
- Execute commands: 14 test (play, stop, reset, compile, addLed, clear, describe, undo, redo, error, no API)
- Mount experiments: 4 test (first, LED, semaforo, not found)
- Build mode: 2 test (sandbox, guided)
- getAvailableCommands: 4 test (count, structure, readable feedback, unique actions)

## Prossimo ciclo
Target: unlimMemory.js o simulator-api.js (entrambi con bassa coverage)
