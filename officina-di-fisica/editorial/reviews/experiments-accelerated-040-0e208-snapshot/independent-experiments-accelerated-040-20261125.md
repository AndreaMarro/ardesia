# Rivalidazione indipendente — experiments-accelerated-040

Rivalidazione degli stessi ID già revisionati, senza nuovo credito nel corpus. Riletti individualmente i record originali completi dal pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, file content/esperienze-C1.json, SHA256 84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3, e le lezioni C1-L003/C1-L004. Le derivazioni seguenti sono state rifatte dalle leggi; gli oracoli recuperati erano già conosciuti, quindi non si presenta questa fase come prima revisione cieca. I riferimenti fonte, le chiavi generate e i flag editoriali non costituiscono l’oracolo.

Il runtime attuale è 0e2083691b9233b26bc3a9e294813288d5c3eed97b29d4728431123684d8e3bd. La precedente prova f897 resta storica: sette file per lotto sono conservati byte per byte nella cartella di provenienza con manifest SHA256. Non è stato cambiato un fingerprint dentro un vecchio report per farlo apparire corrente. Prima dell’aggiornamento, i test hanno riprodotto tre fallimenti per lotto, sei in totale: le vecchie dipendenze congelate rifiutavano correttamente il nuovo consumer. I trascritti RED sono conservati separatamente; non sono PASS.

Sono state rilette le nuove dipendenze. assessment-selection.js e il validatore server ammettono soltanto due ingressi numerici finiti, distinti e sulla griglia; non forniscono risultati attesi e non cambiano le leggi installate. Questi originali non possiedono assessmentSelection e mantengono il fallback precedente. Il consumer inoltra gli stessi ingressi sia ai quesiti sia al testo del trasferimento. I contratti JSON e TypeScript, authoring e adapter sono ora inclusi nei pin espliciti: 22 dipendenze per verificatore, oltre al profilo completo. I test sfidano ciascuna dipendenza. L’unico aggiornamento alle loro vecchie asserzioni è il conteggio da 16 a 22, con nuove verifiche di presenza: nessuna vecchia verifica è rimossa o allentata.

La modifica del banco riusa il lettore dei blocchi editoriali; nei dieci originali blocks è vuoto, perciò non aggiunge spiegazioni alternative. Il formatter elimina il separatore delle migliaia e lascia leggibili i numeri assegnati qui. Le modifiche trigonometriche dei confronti L002 e le nuove scale delle forze negli apparati non cambiano le leggi L003/L004 qui esaminate. Sono stati riletti i rami effettivi di binario, caduta senza filo, volo e cerchio, non soltanto il nome del modello.

Le funzioni exact_value, check, independent_checks, runtime_values e compare_runtime sono byte identiche alla snapshot storica. SymPy, Pint e Fraction vengono rieseguiti, non rietichettati: la parte nuova consiste nel confronto con i consumer finali e nei nuovi replay. Il profilo e i singoli byte sono controllati prima e dopo l’esecuzione; fonte sconosciuta, runtime mancante o mutato, errore del consumer e drift durante la prova continuano a rifiutare il report. Nessun codice app, sorgente, registro, checkpoint o Git ROOT è stato modificato.

Human NOT_RUN, publicationAction NONE, originalEditionRetained true. L’esito AI riguarda questi modelli ideali e i consumer provati; non certifica misure empiriche, esiti di apprendimento, accessibilità su ogni dispositivo o una revisione umana.

## Derivazioni e letture per ID

### SIM-C1-L004-01 — Moto uniformemente accelerato

Accelerazione prescritta 2 m/s², riposo iniziale e origine al via danno s=at²/2=t² metri e v=2t m/s. I riferimenti a 1 e 3 s producono 1 e 9 m; il trasferimento a 2 s richiede 4 m. Il primo secondo copre 1 m e il secondo 3 m: tempi uguali non danno distanze uguali. Raddoppiare t quadruplica s. Il clock 0..4 s mantiene lo stesso modello; la freccia positiva è proporzionale a v e omessa al riposo. La risultante costante è letta nel modello di carrello a massa costante, senza introdurre sistemi a massa variabile.

Fonte SHA256 c2c99b924db08b43187c7eb88d9b81e504fa6995799cad7f98e756061d131f80, versione 1. Confronto attuale: 17 configurazioni di controllo, 68 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L004-02 — Caduta libera

Con quota iniziale 20 m, riposo e g=10 m/s² assegnato, h=20−5t², v_y=−10t e a_y=−10 nelle rispettive unità. I riferimenti a 1 e 2 s danno 15 e 0 m. A 0,9 s, h=20−5·81/100=319/20 m=15,95 m. La radice positiva dell’atterraggio è √4=2 s, un quadrato perfetto; non si richiedono radicali arbitrari. Il clock si ferma al pavimento, senza prosecuzione sotterranea, rimbalzo o attrito. Il corpo resta alla stessa coordinata orizzontale e la gravità punta in basso. L’offset grafico del centro della sfera è illustrativo, non una misura pixel della quota fisica rispetto a una superficie reale.

Fonte SHA256 3bb5899e3fa9bc10a78bad83060a8e03f1477134499276f7e4629f11e369735b, versione 1. Confronto attuale: 21 configurazioni di controllo, 84 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L004-03 — Moto parabolico

A parità di v₀y=10 m/s e g=10 m/s², con ritorno alla stessa quota e senza aria, T=2v₀y/g=2 s. La gittata R=v_xT=2v_x: per 2 e 5 m/s vale 4 e 10 m, e per il trasferimento 7/2 m/s vale 7 m. Apice a 1 s e 5 m. Il clock mantiene il v_x selezionato e anima x=v_xt, y=10t−5t² da 0 a 2 s. La lettura Gittata è l’esito dell’intero volo; Quota in volo cambia nel tempo. Le due lunghezze hanno scala grafica comune 0,32. Le miniature al culmine e la freccia della gittata finale non dichiarano che il culmine coincida con l’arrivo.

Fonte SHA256 f97b094eef0ba9eca0051d8d2b4f0114cd1f6d545028782dcd51dee131775d28, versione 1. Confronto attuale: 11 configurazioni di controllo, 44 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L004-04 — Moto circolare uniforme

Per r=2 m e rapidità v costante, ω=v/r e r⃗(t)=2(cosωt,sinωt). Due derivate danno a⃗=−ω²r⃗; v⃗·a⃗=0 e |a⃗|=v²/2. Le rapidità 2 e 4 m/s danno 2 e 8 m/s²; il trasferimento 7/2 m/s richiede 49/8 m/s²=6,125 m/s². Raddoppiare v quadruplica l’accelerazione. Il periodo esatto 4π/v e il coseno del clock sono coerenza del modello strumentale, non nuovi quesiti numerici assegnati allo studente. Il cerchio di raggio 1,4 in scena rappresenta 2 m, la velocità è tangente e l’accelerazione punta al centro. Le frecce hanno scale separate e unità proprie. I campioni di tempo e angolo binary64 sono confrontati con tolleranza software stretta, distinta da incertezza fisica e tolleranza della risposta scolastica.

Fonte SHA256 3d6bac09cc4251efa1ec64b24cb51fff6be12c593b28e8dc1011a09f45b9204b, versione 1. Confronto attuale: 11 configurazioni di controllo, 44 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

## Replay effettivo e controlli

Il protocollo browser esistente è stato rieseguito nel consumer reale, con app e SQLite temporanei, sessione demo privata, richieste esterne bloccate, Chrome di proprietà del test e WebGL abilitato o disabilitato. Output /private/tmp/cric-refresh-accelerated-0e208/consumer.json; log /private/tmp/cric-refresh-accelerated-0e208.log. Uscita 0, 52 casi, zero page error. Sono state esercitate le quattro fasi didattiche e tutte le risposte generate, respingendo numeri sbagliati e accettando i valori risolti indipendentemente. Nessun browser o dato dell’utente è stato toccato.

Gli oracoli rinnovati confrontano 60 configurazioni e 240 osservazioni temporali: griglie, valori scalari, previsioni e quesiti, grafici, posizioni effettive e direzioni dei vettori. In questi campioni la coincidenza fra controllo e clock è distinta dai clock che mantengono una velocità o una durata selezionata. Tutte le prove matematiche recuperate restano invariate e vengono davvero eseguite.

Ispezionate visivamente tutte le immagini di default dei dieci ID, in 3D e fallback. Riletti inoltre i grafici nativi delle due secanti, della cuspide, del volo e del moto circolare, il quarto di giro circolare in 3D, l’atterraggio in fallback e il carrello alla cuspide in fallback. Le altre immagini di stati limite e temporali sono prove eseguibili più confronti geometrici indipendenti: non si afferma di aver guardato ogni PNG. I file immagini restano temporanei; i nuovi report ne conservano gli hash e gli strumenti le rigenerano.

Test mirati: 9/9 PASS, uscita 0 in 22.795 s. Il trascritto GREEN e il precedente RED da tre fallimenti sono versionabili accanto a questa nota. Si mantengono tutti i test su domini, segni, unità, grafici, direzioni fuori piano, sorgenti sconosciute, prove mancanti, drift runtime e falsa approvazione umana. Fresh e saved soddisfano assert_activity_identity e risultano identici. Nessun PASS è ricavato dalla sola chiave o da un vecchio flag.

## Identità finali

- Runtime completo: 0e2083691b9233b26bc3a9e294813288d5c3eed97b29d4728431123684d8e3bd.
- Verifier: 87249cd455f3f326d31fed5f4a31d620e3991d14886c54aee1408257c987c909.
- Test Python: 032fb6b09ef630eceb46ffd418df38b7a62bd7966d8a3e310b34452524308f0f.
- Protocollo browser: a1dfda7ac7af471a7a63e39d9b6fd5e5bc8a53d19f8ff6f4ac670636398c7bf6.
- Prova browser corrente: dc7a716c9ccfbb740314a42b3069aeca31b9eb421b0233965fac4efc68282e1d.
- Report: b8b1e37eae36d5a89cb636d13196fa48a71504d7aae1c0f7ead43336ea73566c.
- Provenienza storica: editorial/reviews/experiments-accelerated-040-f897-snapshot, manifest 619c583e6424a01e20562dbbaf3ca7738070aaa70914f7e176252cd1cbeeaf60.

La rivalidazione conferma la stessa edizione originale sul nuovo runtime, non completa nuovi ID. Il precedente materiale f897 resta byte identico e identificato come storico. Nessuna nuova pubblicazione o firma umana.
