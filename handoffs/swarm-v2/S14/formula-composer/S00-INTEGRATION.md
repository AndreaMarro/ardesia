# Consegna del composer — 26 ottobre 2026

PR318 rimane la stessa candidata. Il composer è raggiunto dalla toolbar Formula
esistente; Room v3 è consegnata come patch e non applicata al sorgente. S00 ha
riservato il raccordo dopo la 311. Nessuna delega a questa chat è dedotta dal
PASS su una copia temporanea.

## Primo raccordo, per il writer S00

1. Consolidare la Room della 311; identificare la SHA realmente integrata.
2. Applicare soltanto `room-insert-math-v3.patch` a Room e ai test; v1/v2 sono
   superate. Non sostituire l'intero file Room con la copia di questa chat.
3. Conservare l'API asincrona del composer: risoluzione = inserimento riuscito,
   rigetto = bozza conservata e retry. Il mutex Room blocca anche il toggle
   esterno; canvas/journal catturati prima dell'await vanno ricontrollati dopo.
4. Provare nel consumer consolidato: errore renderer, richiesta duplicata,
   toggle durante pending, cambio lifecycle e menu mobile→Formula→chiudi.
5. Eseguire i gate sulla SHA consolidata ferma e poi la verifica post-merge.

La v3 era apply-check compatibile con main992d1a0b e S07head77c2178d. Questo
non garantisce l'applicabilità a una futura head diversa. Il controllo su copie
è riproducibile con verify-room-patch.py; non è prova di main.

## Prove disponibili e limiti

- Host: 15 PASS su23604bc; native MathLive verificato separatamente.
- Room v3 composta: 4 RED con consumer originale →4 PASS candidate.
- Browser12: 15 controlli funzionali PASS/EXIT0, zero errori inattesi. Formula
  SVG reale, flush normale Continuità, reload, isolamento lezioni, export/import
  in store nuovo. Pannello mobile tagliato trovato dalla lettura screenshot:
  il PASS sul solo scrollWidth non lo rilevava e il claim visuale è ritirato.
- Layout e cleanup finali:16host PASS,4native touch PASS su1e086d9; pannello
  opaco in hover e keyboard fisicamente fuori viewport suclose. Vedi FINAL.md.
  Il runner può disabilitare solo il CSS nuovo per il controllo negativo.
- Il salvataggio della sola board non prova il flush del journal: il percorso
  verificato attraversa Continuità prima del reload/export. Nessun journal
  artificiale è iniettato dal runner.
- Goodnotes è osservato solo tramite metadati e documentazione; REA MathLive
  è statica parziale. Il nuovo valore viene dalle API MIT già acquisite, senza
  aggiungere un editor o motore di rendering.

## Memoria da appendere da S00

RUNLOG/NEXT restano single-writer. Appendere risultati e limiti con SHA e link
alle prove, incluse le correzioni dei claim anticipati; non riscrivere i FAIL.
Non usare i verdi della 318 per certificare merge tree, main o preview S00.
L'aggiornamento TARGET081 va dal delta locale al registro condiviso soltanto
dopo riconciliazione; i nuovi candidati restano senza ID per evitare duplicati.
