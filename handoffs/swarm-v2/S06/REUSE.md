# Fonti, riuso e alternative S06

Base Ardesia37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Riuso prioritario di CoursePack, GRIDS, evaluator, renderer scientifici, StudyStore/resources/revisions/submissions/receipts e sessionBoundary già adottati. Nessun codice/asset esterno copiato, nuova dipendenza o servizio installato. Codice S06 originale; stessi termini del repository. Nessuna licenza terza dedotta dal fatto che un repository sia pubblico.

Fonti ufficiali consultate il26ottobre2026:

- https://github.com/open-spaced-repetition/ts-fsrs — README corrente indica MIT e v6 richiede Node>=24. Non adottato: mancano rating/parametri/review log canonici sufficienti e il primo consumer richiede un piano spiegabile. Non è una decisione di incompatibilità perpetua. Nessun pin, closure, asset o test upstream importato; valutazione immutabile completa ancora da svolgere prima di adozione.
- https://github.com/numbas/Numbas — benchmark browser assessment; README indica Apache2.0 per codice e diritti dei contenuti agli autori. Nessun bundle/item copiato, né runtime provato in S06. Pin/licenze closure/compatibilità da verificare solo se l'owner assessment adotta un modulo.
- https://github.com/Doenet/DoenetML — benchmark per composizioni interattive; repository osservato indica AGPL3.0. Nessuna adozione o estrazione, perimetro copyleft da valutare concretamente se proposta. Nessuna prova di UI donor rivendicata.

REA skill effettiva letta: metadata version42,207tool dichiarati; istruisce a saltare REA per analisi ordinaria di repository sorgente completo. Si sono usati sorgenti/test Ardesia per il riuso presente. Nessuna cattura, decompilazione o scenario runtime donor eseguito; non attribuire capacità o risparmi non misurati. Costo totale e confronto con implementazione alternativaUNKNOWN. Non eseguiti provider/doctor/installazioni per aggiungere attività senza bisogno.

Scenario implementato: da obiettivo a diagnostica e fonte, modello parametrico, tentativo canonico, confronto/indizi, recupero, problema diverso, ripasso e riapertura. Manutenzione: namespace S06, tipi condivisi futuri a S10. Rimozione/rollback: rimuovere soli hook UI/API di composizione; risorse e ricevute rimangono Core per consultazione/esportazione, senza migrazioni distruttive. Materiali DRAFT mantengono humanApproval=false.

## Addendum del 26 ottobre 2026 — mandato REA-FIRST

Il testo precedente è la fotografia del primo incremento e rimane intatto. Nuovo confronto immutabile di tre scheduler, acquisizione py-fsrs6.3.2 MIT, REA processo reale, provenance/test e consumer in [acquisition/README.md](acquisition/README.md). Corregge esplicitamente il riferimento al README mainv6 di ts-fsrs: il tag stabile5.4.2 richiede Node>=20. Nessun esito storico viene riscritto.
