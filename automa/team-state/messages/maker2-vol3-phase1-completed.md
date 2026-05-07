# Maker-2 Vol3 cap7 audit — Phase 1 completed

- Date: 2026-05-07
- Agent: Maker-2 (Sprint U Cycle 2 Vol3 audit)
- Scope: Vol3 v0.13 capitolo 7 "Il mondo continuo: i pin analogici"
- PDF source: /tmp/vol3-v013.txt (versione 0.13, NOT v0.8.1)
- Esperimenti audited: 9/9 (v3-cap7-esp1..esp8 + v3-cap7-mini)

## Deliverable

`automa/state/maker2-vol3-cap7-audit.md` (~270 LOC), formato markdown sezione 6.1 con header conforme + per-esperimento mapping PDF + severity issues + cross-cutting + severity counts + note metodologiche.

## Top findings

1. **CRITICAL — count spiattellato**: PDF v0.13 cap7 contiene 7 esercizi narrativi (7.1..7.7), JS espone 9 entry. Eccedenza = 2 entry: `v3-cap7-esp5` INVENTED + `v3-cap7-mini` DUPLICATE di esp1.
2. **CRITICAL — v3-cap7-esp5 INVENTED**: nessuna corrispondenza nel PDF v0.13. Esercizio "PWM con valori manuali / 4 livelli luminosità" non esiste nel volume cartaceo. Anti-pattern Morfismo Sense 2 esplicito in CLAUDE.md.
3. **CRITICAL — v3-cap7-mini DUPLICATE + PAGE-WRONG**: codice + concetto identici a esp1 (analogRead + soglia + LED13). Citation `Vol.3 pag.75` ERRATA in v0.13 (ESERCIZIO 7.1 sta a pag.84-86).
4. **HIGH — numbering shift**: esp6/esp7/esp8 numerazione JS = PDF (n-1) per via di esp5 invented. Studente cerca "Esercizio 7.5 libro" → non trova match diretto nel software.
5. **HIGH — LED color systemic**: 5/9 esp usano LED rosso vs PDF prescrive verde. Solo `v3-cap7-mini` aderente kit Omaric.
6. **HIGH — esp1 soglia off-by-one**: codice JS `> 511` vs PDF testo "> 512". Ironicamente `mini` (duplicate) ha soglia corretta 512.
7. **HIGH — esp8 no multimetro fallback**: PDF chiede misurare tensione con multimetro ma simulatore non ha multimetro virtuale + esp8 non ha LED/display → output "muto" in simulazione.
8. **MEDIUM — Vol/pag citation missing 8/9**: solo `v3-cap7-mini` cita Vol/pag (peraltro sbagliata). PRINCIPIO ZERO Andrea iter 21 mandate "Vol/pag VERBATIM" violato 8/9.

## Severity counts cap7

- critical: 4
- high: 7
- medium: 9
- minor: 7
- total: 27 issues

## Concept coverage check (cap7-specific)

PDF v0.13 cap7 concetti chiave tutti presenti almeno una volta nel JS:
- analogRead ✓ (esp1, esp2, esp3, esp7, esp8, mini)
- ADC 0-1023 / 10 bit ✓
- V calc formula ✓ (esp2)
- trimmer / partitore ✓
- PWM / analogWrite ✓ (esp4, esp5, esp6, esp7)
- duty cycle ✓ (in unlimPrompt esp4)
- ciclo for ✓ (esp4, esp6)
- effetto respiro ✓ (esp6)
- map() ✓ (esp7)
- analogWriteResolution(10) ✓ (esp8)
- DAC vs PWM ✓ (esp8)

Sketch C++ unici 9/9, nessun copia-incolla.

## Methodological notes

- File `task5-volumi-vol1.json` (mandato spec) **NOT FOUND** `automa/state/`. Pattern usato: stesso schema severity/area/detail di `task5-parita.json`.
- File spec `2026-05-07-task5-volumi-vol2-design.md` (mandato spec) **NOT FOUND** `docs/superpowers/specs/`. Audit condotta seguendo direttamente checks cap7-specific da messaggio.
- ANTI-INVENTIONS rispettato: ogni claim cita riga PDF v0.13 (`riga NNNN`) o range pagine, oppure flag esplicito INVENTED/DUPLICATE.
- Ground truth `/tmp/vol3-v013.txt` letto sezione cap7 righe 2570-3568. Indice righe 19-47 conferma cap7 inizia pag.79.
- NO src/ modifiche. NO sintesi inventata.

## Files written

- `automa/state/maker2-vol3-cap7-audit.md` (audit deliverable)
- `automa/team-state/messages/maker2-vol3-phase1-completed.md` (this completion msg)

## Status

PHASE 1 COMPLETED. Ready for orchestrator dispatch Phase 2 (scribe consolidation OR fix-cycle-3 dispatcher).
