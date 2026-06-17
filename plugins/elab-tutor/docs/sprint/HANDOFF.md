# Sprint Handoff — Principio Zero

> Aggiornato: 2026-04-10 07:20
> Sessione: S1-S8 COMPLETATE + audit + quality fix
> LEGGI ANCHE: docs/sprint/DIRETTIVE-CLAUDE-WEB.md (regole obbligatorie)

## Stato Metriche FINALI

| Metrica | Valore | Target | % |
|---------|--------|--------|---|
| BuildSteps Vol1 | 38/38 | 38/38 | 100% ✅ |
| BuildSteps Vol2 | 27/27 | 27/27 | 100% ✅ |
| BuildSteps Vol3 | 27/27 | 27/27 | 100% ✅ |
| ScratchXml Vol3 | 31 | ~27 | 96% ✅ |
| Lesson Paths | 94 | 92 | 100%+2 ✅ |
| Alias Mapping | 24 cap | 24 | 100% ✅ |
| Voice Commands | 36 | 36 | 100% ✅ |
| Vol2 targetPins | 72 | all | fixed ✅ |
| "area di lavoro" | 0 | 0 | fixed ✅ |
| Test count | 1649 | >= 1595 | OK ✅ |
| CI | GREEN (test+build+e2e) | GREEN | OK ✅ |

## S1 Completata (2026-04-09 23:40)

### Cosa e' stato fatto
1. Creato `src/data/chapter-map.js` con alias mapping completo Tea
   - 24 chapter entries (9 Vol1 + 9 Vol2 + 6 Vol3)
   - Vol1: Cap 6-14 -> display Cap 2-10 (Cap 1 breadboard futuro)
   - Vol2: Cap 3-10 + Cap 12 -> display Cap 1-9
   - Vol3: Cap 5 + Cap 6 OUTPUT + Cap 6 INPUT + Cap 7 + Cap 8 + Extra -> display Cap 1-6
   - Cap 6 INPUT split: esp5 (INPUT_PULLUP), esp6 (debounce toggle), esp7 (debounce while)
   - Extra: lcd-hello, servo-sweep, simon
   - Funzioni: getDisplayInfo(experimentId), getVolumeChapters(volumeNumber)

2. Creato `tests/unit/chapterMap.test.js` con 23 test
   - Tutti 3 volumi verificati
   - Cap 6 OUTPUT/INPUT split verificato
   - Tutti 92 experiment IDs mappati e verificati
   - Consecutivita' e unicita' displayChapter verificate

3. Audit parita' reale (numeri oggettivi):
   - Vol1: 38/38 buildSteps (100%), 0 scratchXml (N/A - no Arduino)
   - Vol2: 18/27 buildSteps (67%), 0 scratchXml (N/A - no Arduino)
   - Vol3: 6/27 buildSteps (22%), 10/27 scratchXml (37%)
   - Lesson paths: 83 file JSON (90%)
   - Totale buildSteps: 62/92 (67%)
   - Gap piu' critico: Vol3 manca 21 buildSteps

### Prova oggettiva
- `npx vitest run tests/unit/chapterMap.test.js` -> 23/23 PASS
- `npx vitest run` -> 1618/1618 PASS, 0 fail
- Branch: sprint/s1-alias-mapping

## Cosa Manca (per S2+)

### BuildSteps mancanti Vol2 (9 esperimenti)
- v2-cap5-esp1, v2-cap5-esp2
- v2-cap7-esp3, v2-cap7-esp4
- v2-cap8-esp2, v2-cap8-esp3
- v2-cap9-esp1, v2-cap9-esp2
- v2-cap12-esp1

### BuildSteps mancanti Vol3 (21 esperimenti)
- v3-cap5-esp1, v3-cap5-esp2
- v3-cap6-esp1, v3-cap6-esp2, v3-cap6-morse, v3-cap6-esp3, v3-cap6-esp4, v3-cap6-semaforo
- v3-cap6-esp5, v3-cap6-esp7
- v3-cap7-esp1, v3-cap7-esp2, v3-cap7-esp3, v3-cap7-esp4, v3-cap7-esp5, v3-cap7-esp6, v3-cap7-esp7, v3-cap7-esp8
- v3-cap8-esp1, v3-cap8-esp2, v3-cap8-esp3

### ScratchXml mancanti Vol3 (17 esperimenti)
Da verificare quali dei 27 hanno gia' scratchXml e quali no.

### Lesson paths mancanti (9)
83/92 file presenti. Servono 9 nuovi file JSON.

## Cosa deve fare S2

1. Completare buildSteps Vol1 Cap 6-8 (verificare qualita' dei 14 esistenti)
2. Oppure: iniziare Vol2 buildSteps mancanti (9 esperimenti)
3. Audit qualita' buildSteps Vol1 esistenti

## Regole FERREE

- MAI pushare su main — sempre branch + PR
- MAI dichiarare "finito" senza prova oggettiva
- CI deve essere verde prima di qualsiasi merge
- Ogni sessione aggiorna QUESTO file prima di finire
