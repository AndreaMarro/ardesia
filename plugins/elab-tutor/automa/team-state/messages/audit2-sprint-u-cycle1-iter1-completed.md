# Audit-2 Completion — Sprint U Cycle 1 Iter 1

**Agent**: Audit-2 (vol3)
**Timestamp**: 2026-05-01T08:30:00Z
**Status**: COMPLETE
**Output**: docs/audits/sprint-u-cycle1-iter1-audit-vol3.md

## Summary

- Experiments audited: 29
- Circuit issues (structural gaps): 1 (v3-cap8-serial: 1 component only, missing bb1)
- Linguaggio violations in unlimPrompt (score<6): 0
- Linguaggio score=6 (no "Ragazzi,"): 26 out of 29
- Missing bookText: 0 (all 29 present)
- Missing lesson-path: 0 (all 29 present)
- Arduino experiments with C++ code: 29
- Scratch experiments with scratchXml: 26 (3 missing: v3-cap6-esp1, v3-cap7-mini, v3-cap8-serial)
- Lesson-path teacher_msg with singolare violations: 21
- Lesson-path without "Ragazzi": 28 out of 29

## Top 5 Issues

1. **LINGUAGGIO unlimPrompt no "Ragazzi," (26/29)** — impatto alto; UNLIM riceve contesto senza rinforzo plurale; fix: prefisso "Ragazzi," in 26 unlimPrompt
2. **LP teacher_message senza "Ragazzi" (28/29) + 21 singolare violations** — impatto alto; docente legge direttamente; fix: codemod plurale
3. **v3-cap8-serial circuit: solo 1 componente (nano1), mancante bb1** — impatto medio; UX incoerente
4. **Title/ID mismatch (4 casi) + content mismatch unlimPrompt v3-cap6-esp4** — impatto medio; confonde navigazione docente
5. **v3-cap6-esp1 senza scratchXml** — impatto basso-medio; unico Cap6 senza Scratch; fix: aggiungere BLINK_EXTERNAL_SCRATCH già definito nel file

## Additional Findings

- v3-cap6-morse: unlimPrompt non inizia con "Sei UNLIM, il tutor AI di ELAB." (unico dei 29)
- v3-cap6-esp4: unlimPrompt descrive "semaforo" ma titolo è "effetto polizia" (content mismatch)
- v3-cap6-esp3: bookText solo 10 parole (scarso per citazione VERBATIM)
- 3 esperimenti Extra (lcd-hello, servo-sweep, simon) non sono nel libro fisico standard
- Tutti 29 LP: 5/5 fasi + teacher_message non vuota + action_tags presenti (struttura LP COMPLETA)
- Tutti 29 bookText presenti, tutti 29 bookInstructions presenti
