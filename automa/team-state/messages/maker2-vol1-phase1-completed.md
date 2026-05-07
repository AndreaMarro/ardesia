# Maker-2 Vol1 Phase 1 Completion
- Date: 2026-05-07T07:23:18Z
- Esperimenti audited: 14/14
- Chapters covered: 8, 9
- Output file: automa/state/maker2-vol1-ch8-9-audit.md
- File size:      507 lines
- Spiattellato finding cap9 Potenziometro: YES HIGH severity — 5/9 esp spiattellati (esp 2 medium + esp 3, 7, 8, 9 high). Esp 7-9 sono UNA RIGA TESTO PDF ciascuno ("Vuoi provare?", "Prova a fare insieme", "Aggiungi un pulsante!"). Codice card-flat con buildSteps inventati = violazione triplet coerenza Morfismo Sense 2. Cap 9 narrativa = UN concetto manopola con 4 esp principali (1, 4, 5, 6) + 5 variazioni/sfide collassate inappropriately a card-flat. Esattamente come previsto da Andrea iter 21+ feedback.
- Spiattellato finding cap8 Pulsante: YES MEDIUM severity — 2/5 esp spiattellati (esp 2 + esp 5). PDF Esp 2 = "Partendo dall'esperimento appena finito, cambia colore..." (8 righe testo, no BOM PDF). PDF Esp 5 = "Giocando con l'esperimento 4 prova a cambiare i valori di resistenza" (4 righe testo, no BOM PDF). Codice card-flat con BOM duplicate. Cap 8 narrativa = UN concetto pulsante con 3 esp principali (1, 3, 4) + 2 variazioni didattiche (2, 5) collassate.
- Top 3 findings:
  1. CAP 9 ESP 7-9 SPIATTELLATO ESTREMO — sfide aperte UNA RIGA inflate a esperimenti card-flat con BOM/steps inventati. Convertire in v1-cap9-esp6.suggestedVariations[].
  2. CAP 8 ESP 2+5 SPIATTELLATO MODERATO — variazioni testuali con riferimento esplicito al precedente. Convertire in v1-cap8-esp1+esp4.suggestedVariations[].
  3. LINGUAGGIO SINGOLARE IMPERATIVO 14/14 — TUTTE desc di cap 8+9 violano Andrea iter 21+ mandate plurale "Ragazzi, premete...". Codemod regex incluso in mandate 200 violazioni iter 21+.
- Status: COMPLETED
