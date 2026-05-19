# Prompt Template - Fumetto Leonardo AI

Data: 2026-05-09

## Decisione

I fumetti nuovi vanno generati in pipeline editoriale/admin con Leonardo AI, non live durante la lezione. Il runtime legge solo asset e metadata pre-generati.

## Input obbligatori

- `volume`
- `chapter`
- `chapterTitle`
- `experimentId`
- `experimentTitle`
- `page`
- `components`
- `circuitState`
- `didacticConcept`
- `cliffhanger`
- `styleReference`
- `sessionScreenshot`
- `sessionContext`
- `sessionMessages`
- `unlimMemory`
- `teaMaterial`

## Template

```text
Brief editoriale fumetto ELAB Tutor per Leonardo AI.

Volume: {{volume}}
Capitolo: {{chapter}} - {{chapterTitle}}
Esperimento: {{experimentId}} - {{experimentTitle}}
Pagina volume: {{page}}
Componenti: {{components}}
Stato circuito/codice: {{circuitState}}
Concetto didattico: {{didacticConcept}}
Cliffhanger narrativo: {{cliffhanger}}
Reference stile: {{styleReference}}

Dati sessione da usare come verita narrativa:
- screenshot della sessione: allegato/disponibile
- contesto sessione: {{sessionContext}}
- cronologia messaggi: {{sessionMessages}}
- memoria UNLIM: {{unlimMemory}}
- materiale Tea: {{teaMaterial}}

Vincoli:
- Massimo 6 pannelli.
- Linguaggio 10-14 anni, frasi brevi, niente testo tecnico eccessivo.
- Mantieni continuita narrativa con narrative_map e con il fumetto precedente/successivo.
- Usa fumetti v2 come reference di stile, personaggi, ritmo e palette.
- Usa la mascotte UNLIM canonica, mai Galileo.
- Kit fisico Omaric protagonista, non simulatore.
- Output per pipeline editoriale/admin: niente rigenerazione live durante la lezione.
- Asset finale pre-generato, salvato su storage stabile, runtime solo lettura.
```

## Materiale Tea da iniettare

- `narrative_map.json`: story arc, capitolo, esperimento, pagina, next_id.
- `narrative_metadata_94.json`: titolo, target age, componenti, analogia, success citation.
- `cliffhanger_table.json`: ponte narrativo verso esperimento successivo.
- `album_studente_spec`: timeline, vista volume, vista capitolo, dettaglio fumetto.
- `mascotte_unlim_canonica.md` e fumetti v2: stile, palette, personaggi, continuita.

