# 1B — Lezioni e prove per lo studio autonomo

Revisione del 28 ottobre 2026, owner CHAT 1B. Sorgente: `packages/engine/lessonos/study/content/sf-fluidi-termodinamica-v1.json`; stessi dieci familyId e stessi 57 objectiveId. La demo pubblica preesistente resta un undicesimo esempio, non un’ulteriore famiglia coperta.

Le dieci unità contengono 5049 parole di spiegazione originale, con paragrafi separati per i sotto-obiettivi, derivazioni proporzionate, dieci nuovi esempi svolti, esercizi autonomi e problemi diversi. Il conteggio parole descrive il materiale: non è un gate di qualità. Le 57 prove atomiche esistenti sono riscritte in italiano leggibile e arricchite con errore osservabile, tre aiuti, rubrica esplicita e un transfer specifico per obiettivo. Una risposta libera richiede evidenza e può essere corretta dal docente; nessuna percentuale di comprensione nasce dal numero di tentativi o clic.

| Unità | Ragionamento che lo studente esercita |
| --- | --- |
| Pressione e densità | Scegliere il rapporto corretto e controllare aree/volumi e unità |
| Idrostatica | Derivare Stevino dall’equilibrio, separare pressione e risultante, leggere strumenti |
| Continuità e Bernoulli | Conservare massa prima dell’energia, distinguere quota e accelerazione, dichiarare il vincolo |
| Viscosità e reti | Leggere un profilo e un gradiente, confrontare Δp/Q imposte e comporre resistenze |
| Superfici | Contare interfacce, confrontare curvatura e bagnabilità, limitare le analogie biologiche |
| Stato e gas | Definire il sistema, distinguere stato/percorso e usare pressioni e temperature assolute |
| Calorimetria | Decidere la fase finale mediante un bilancio prima di calcolare T |
| Trasmissione | Distinguere meccanismi, energia e potenza, emissione e scambio netto |
| Primo principio | Usare segni coerenti e ipotesi di reversibilità, confrontare percorsi diversi |
| Secondo principio | Separare conservazione e possibilità, sistema e universo, molteplicità e metafora |

## Verifica e correzioni

Review AI indipendente: leggi, segni, ipotesi e aritmetica dei dieci esempi e dei venti esercizi di lezione esaminati. Corrette una frase ambigua sul gradiente viscoso a Δp imposta e la descrizione di un serbatoio nell’esercizio entropico. Corretto inoltre il refuso preesistente della demo: 0,02494338785446 m³ equivale a 24,943388 L, non 24,942 L. Correzioni delle specifiche e del gate di accettazione sono nella PR330.

Prove locali della sola tranche lezioni: `python3 -m unittest bin/tests/test_closure1_science_contract.py bin/tests/test_closure1_science_lessons.py -v` e `PYTHONPATH=packages/engine <python-con-pytest> -m pytest packages/engine/tests/study/test_four_courses.py -q`. Il secondo comando verifica le proiezioni Core esistenti. Il riferimento alla banca selezionata, i 40 problemi e le simulazioni vengono aggiunti dalla tranche curazione, con oracoli separati.

## Contratto consumer e limiti

`observableObjective`, `prerequisiteRecovery`, `learningSequence`, `objectiveSections` e `assessmentRefs` sono campi additivi della lezione. `practice`/`transfer` mantengono `prompt`, `answer`, `feedback`; `answer` aggiunge tolleranze assoluta/relativa e `hints` offre aiuti graduati. Ogni item atomico conserva ID/obiettivo e aggiunge `rubric`, `hints`, `errorFeedback` e `transfer`. Il percorso usa il CoursePack e la proiezione esistenti; nessun nuovo player, ledger o grader libero. Core e renderer appartengono a 1A/1C.

La mappa dei sedici lab e i limiti osservati sono in [laboratory-consumer-map.json](laboratory-consumer-map.json), con i blob ispezionati. La review di 1B sui modelli 1C è pubblicata nella PR331, commento6466662476. Densità/forza-area diretta, barometro, libera espansione e conteggio microstati non sono attribuiti ai renderer esistenti.

Stati: contenuti `VALIDATED_TECHNICALLY`, stato editoriale `DRAFT`, `humanApproval=false`, obiettivi `ACCEPTED=0/57`. Revisione umana, interazioni funzionanti e prove sul consumer distribuito non sono attestate da questa consegna. Il reader deve conservare hash esatti di pack e lezione e rigenerare la proiezione dalla sorgente canonica.
