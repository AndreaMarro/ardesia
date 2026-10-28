# 1B — Curazione verificata della banca canonica

Data: 28 ottobre 2026. La selezione riusa esclusivamente `physics-semestre-2026-bank`: nessuna nuova banca, nessuna copia di quesiti Testbusters. Il CoursePack contiene riferimenti con ID, versione e SHA-256 del contenuto originale; le risposte restano nella banca canonica.

| Materiale | Quantità effettiva | Controllo |
| --- | --- | --- |
| Quesiti selezionati | 199 | 199 coppie distinte (lawFamily, reasoningTask), zero varianti ottenute cambiando soltanto i numeri |
| Quesiti a completamento | 79 | Risultati esatti, unità dichiarate; nessun arrotondamento richiesto dal grader canonico |
| Quesiti a scelta multipla | 120 | Cinque alternative; chiavi e distrattori simbolici controllati nei campioni |
| Concettuali/compiti individuali | 39 | Esaminati separatamente dai modelli numerici con review AI |
| Problemi svolti selezionati | 40 | Quaranta lawFamily distinte, tutte le dieci famiglie didattiche presenti; soluzioni e passaggi già nella banca |
| Simulazioni tematiche | 2 | 31 quesiti disgiunti ciascuna:21 scelta multipla + 10 completamento, 50 min;15 U3 + 16 U5; 31 lawFamily distinte per simulazione |
| Prove atomiche del corso | 57 | Rubrica e transfer specifico della tranche lezioni; non sommate ai 199 per gonfiare il conteggio |

La difficoltà editoriale della selezione è:112 base, 5 facili, 80 medie, 2 difficili. Non è una calibrazione empirica. La progressione passa da calcolo/concetto a inversi e confronti di processi; le etichette non attestano risultati con studenti. I modelli quantitativi che eccedono il nucleo esplicito sono distinti come `PROVIDED_LAW_EXTENSION`; non entrano nelle simulazioni selezionate. Le simulazioni seguono il formato MUR2026/27 ma sono U3/U5: non rappresentano la distribuzione dell’intera prova nazionale.

## Oracoli e controprove

`bin/content/physics_bank/verify_fluid_thermal_selection.py` non importa il generatore. Contiene 92 bilanci fisici indipendenti con conversioni SI esplicite, legge gli input campione e confronta risultati diretti/inversi con le risposte memorizzate. Per gli inversi verifica anche le alternative su più ingressi; per i diretti controlla il raccordo fra dati mostrati e input dell’oracolo. Le chiavi concettuali sono record di review AI separati. I numeri nel campo `residual` del generatore non sono utilizzati come prova.

Il test di controprova altera risposta, opzione corretta e dato mostrato: il verificatore deve rilevare ciascuna alterazione. Non è un semplice roundtrip della chiave attraverso il grader. I test della selezione verificano hash, unicità semantica dichiarata,40 leggi distinte e composizione delle due simulazioni.

Comandi:

- `<python-con-sympy> bin/content/physics_bank/verify_fluid_thermal_selection.py --write`
- `<python-con-sympy> -m unittest bin/tests/test_closure1_science_contract.py bin/tests/test_closure1_science_lessons.py bin/tests/test_closure1_science_curation.py bin/tests/test_closure1_selection_oracles.py -v`
- `PYTHONPATH=packages/engine <python-con-pytest> -m pytest packages/engine/tests/study/test_four_courses.py -q`

Il [rapporto per ogni quesito](selection-validation.json) registra SHA e metodo,0 errori sui 199 selezionati e hash del CoursePack esatto. Review AI indipendente: i 92 oracoli sono stati letti,39 concettuali della selezione esaminati e199/199 controlli eseguiti; la selezione iniziale dei 40 svolti è stata ampliata da 20 a 40 contesti distinti dopo la review. La correzione successiva delle tolleranze/formattazioni e i nuovi controlli di display sono coperti dai test ripetuti, non attribuiti retroattivamente alla review precedente.

## Consumer e stati

`curatedPractice`, `workedProblemRefs`, `diagnosticQuestionRefs`, `examSimulations` e le `bankQuestionRefs` della matrice puntano alla stessa banca e alle stesse lezioni. 1A ne cura l’accesso mediante API/proiezioni esistenti, senza incorporare risposte nella proiezione pubblica. La diagnosi propone recuperi espliciti; le risposte libere restano rubricate con intervento docente.

`VALIDATED_TECHNICALLY` descrive questi controlli; banca editoriale e corso restano `DRAFT`, revisione umana `NOT_RUN`, accettazione 0/57. Campioni numerici e firme non costituiscono una prova esaustiva su ogni parametro o di assenza di ogni somiglianza semantica. Consumer distribuito, persistenza remota e laboratori richiedono le prove 1A/1C sulla revisione integrata.
