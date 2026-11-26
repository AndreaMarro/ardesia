# Rivalidazione indipendente — experiments-kinematics-039

Rivalidazione degli stessi ID già revisionati, senza nuovo credito nel corpus. Riletti individualmente i record originali completi dal pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, file content/esperienze-C1.json, SHA256 84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3, e le lezioni C1-L003/C1-L004. Le derivazioni seguenti sono state rifatte dalle leggi; gli oracoli recuperati erano già conosciuti, quindi non si presenta questa fase come prima revisione cieca. I riferimenti fonte, le chiavi generate e i flag editoriali non costituiscono l’oracolo.

Il runtime attuale è 0e2083691b9233b26bc3a9e294813288d5c3eed97b29d4728431123684d8e3bd. La precedente prova f897 resta storica: sette file per lotto sono conservati byte per byte nella cartella di provenienza con manifest SHA256. Non è stato cambiato un fingerprint dentro un vecchio report per farlo apparire corrente. Prima dell’aggiornamento, i test hanno riprodotto tre fallimenti per lotto, sei in totale: le vecchie dipendenze congelate rifiutavano correttamente il nuovo consumer. I trascritti RED sono conservati separatamente; non sono PASS.

Sono state rilette le nuove dipendenze. assessment-selection.js e il validatore server ammettono soltanto due ingressi numerici finiti, distinti e sulla griglia; non forniscono risultati attesi e non cambiano le leggi installate. Questi originali non possiedono assessmentSelection e mantengono il fallback precedente. Il consumer inoltra gli stessi ingressi sia ai quesiti sia al testo del trasferimento. I contratti JSON e TypeScript, authoring e adapter sono ora inclusi nei pin espliciti: 22 dipendenze per verificatore, oltre al profilo completo. I test sfidano ciascuna dipendenza. L’unico aggiornamento alle loro vecchie asserzioni è il conteggio da 16 a 22, con nuove verifiche di presenza: nessuna vecchia verifica è rimossa o allentata.

La modifica del banco riusa il lettore dei blocchi editoriali; nei dieci originali blocks è vuoto, perciò non aggiunge spiegazioni alternative. Il formatter elimina il separatore delle migliaia e lascia leggibili i numeri assegnati qui. Le modifiche trigonometriche dei confronti L002 e le nuove scale delle forze negli apparati non cambiano le leggi L003/L004 qui esaminate. Sono stati riletti i rami effettivi di binario, caduta senza filo, volo e cerchio, non soltanto il nome del modello.

Le funzioni exact_value, check, independent_checks, runtime_values e compare_runtime sono byte identiche alla snapshot storica. SymPy, Pint e Fraction vengono rieseguiti, non rietichettati: la parte nuova consiste nel confronto con i consumer finali e nei nuovi replay. Il profilo e i singoli byte sono controllati prima e dopo l’esecuzione; fonte sconosciuta, runtime mancante o mutato, errore del consumer e drift durante la prova continuano a rifiutare il report. Nessun codice app, sorgente, registro, checkpoint o Git ROOT è stato modificato.

Human NOT_RUN, publicationAction NONE, originalEditionRetained true. L’esito AI riguarda questi modelli ideali e i consumer provati; non certifica misure empiriche, esiti di apprendimento, accessibilità su ogni dispositivo o una revisione umana.

## Derivazioni e letture per ID

### SIM-C1-L003-01 — Posizione e spostamento

Il via è fissato a 2 m, distinto dall’origine della rotaia. Δx=x_f−2 m: i riferimenti x_f=0 e 5 m danno −2 e +3 m; il trasferimento effettivo a 2 m dà zero. Il dominio −2..6 m con passo mezzo metro richiede soltanto sottrazioni esatte. Una posizione positiva minore di 2 m produce spostamento negativo. Il corpo va disegnato alla coordinata finale, non al valore dello spostamento; la tacca del via resta fissa. Nessun cronometro è previsto per questo confronto di posizioni.

Fonte SHA256 5e2e0856674e2faeab10fb23ec0770bd42268aa694d6e4e8fb43b08c8c9b6b10, versione 1. Confronto attuale: 17 configurazioni di controllo, 0 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-02 — Traiettoria e legge oraria

Con v₀x=3 m/s, v₀y=10 m/s e g=10 m/s² assegnato, x=3t e y=10t−5t². L’apice è a 1 s e 5 m; il ritorno alla quota di lancio è a 2 s, con gittata 6 m. Il trasferimento a 1,1 s usa 11/10: y=11−121/20=99/20 m=4,95 m. È aritmetica finita, senza trigonometria. La codifica binary64 4,949999999999999 è conformità software allo stesso risultato, non un diverso dato fisico. Clock e corpo condividono t fra 0 e 2 s; scala comune 0,32 per le coordinate, nessuna continuazione dopo il ritorno.

Fonte SHA256 573673a59d997610dad354b2ea255409cbb57936fc7f9bb1ee887f04962dcc2d, versione 1. Confronto attuale: 21 configurazioni di controllo, 63 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-03 — Velocità media e istantanea

Da s(t)=k t² con k=1 m/s² e t₀=1 s, la secante dà [s(t₀+D)−s(t₀)]/D=k(2t₀+D). I riferimenti D=1 e 2 s danno 3 e 4 m/s; D=7/4 s dà 15/4 m/s=3,75 m/s. D è positivo; il limite per D→0⁺ vale 2 m/s. Nel grafico strumentale il tempo è trascorso dalla prima misura: gli estremi sono (0,1 m) e (D,(1+D)² m). Il carrello animato segue (1+t)², mentre la lettura media resta associata alla finestra D. La quarta lettura è una posizione che cambia, non una velocità media che dovrebbe seguire il clock.

Fonte SHA256 3cff2c0ef18a1f98cd66167f3e25abd99c6aae7b67b244deb1070b9e6d6fb4a7, versione 2. Confronto attuale: 12 configurazioni di controllo, 36 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-04 — Accelerazione media e istantanea

La legge ora è v(t)=k t² con k=1 m/s³. La stessa algebra produce [v(t₀+D)−v(t₀)]/D=k(2t₀+D), ma le unità sono m/s². I risultati 3, 4 e 15/4 sono quindi accelerazioni. La derivata dà 2 m/s² a 1 s. La posizione integrata è k t³/3 nell’origine scelta; l’animazione usa (1+t)³/3 e la freccia rappresenta velocità proporzionale a (1+t)². La secante nel secondo grafico collega letture di velocità, non di posizione. Non si attribuisce una distanza alla lunghezza della freccia, che ha scala propria.

Fonte SHA256 f475c471a8cf4bb33890a1642ae16f49988d8180d5ade06b1753017e4d1ea4a6, versione 2. Confronto attuale: 12 configurazioni di controllo, 36 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-05 — Moto rettilineo uniforme

x=−1 m+(2 m/s)t implica velocità costante +2 m/s e accelerazione nulla. A 1 e 3 s le posizioni sono 1 e 5 m; al trasferimento effettivo 5/2 s sono 4 m. Ogni secondo aggiunge 2 m. La posizione iniziale negativa non significa velocità negativa. Il clock copre 0..5 s sulla stessa legge uniforme e la freccia conserva verso positivo.

Fonte SHA256 7ace68920b58c5ec04db0caea277cda7b95574de483c5a072b6976242f9655b6, versione 1. Confronto attuale: 21 configurazioni di controllo, 63 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-06 — Grafici cinematici e cuspide

x=2t fino a 2 s, poi x=8−2t, in metri. Le due espressioni coincidono a 2 s con x=4 m, ma le derivate laterali sono +2 e −2 m/s: la velocità istantanea unica non esiste alla cuspide. La dicitura Inversione e l’assenza di una freccia di velocità in quell’istante non affermano una derivata nulla. I riferimenti 1 e 3 s danno entrambi 2 m, il trasferimento a 2 s dà 4 m e il ritorno a 4 s dà zero. Il percorso totale è 8 m, la rapidità media 2 m/s, la velocità media zero. La manovra istantanea è dichiarata idealizzazione; il grafico conserva l’angolo, senza smussarlo falsamente.

Fonte SHA256 6787e3a853e7d23107c36e07be2de2a2b948e4b4abb6701cca121e4a644cfa93, versione 2. Confronto attuale: 17 configurazioni di controllo, 51 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

## Replay effettivo e controlli

Il protocollo browser esistente è stato rieseguito nel consumer reale, con app e SQLite temporanei, sessione demo privata, richieste esterne bloccate, Chrome di proprietà del test e WebGL abilitato o disabilitato. Output /private/tmp/cric-refresh-kinematics-0e208/consumer.json; log /private/tmp/cric-refresh-kinematics-0e208.log. Uscita 0, 66 casi, zero page error. Sono state esercitate le quattro fasi didattiche e tutte le risposte generate, respingendo numeri sbagliati e accettando i valori risolti indipendentemente. Nessun browser o dato dell’utente è stato toccato.

Gli oracoli rinnovati confrontano 100 configurazioni e 249 osservazioni temporali: griglie, valori scalari, previsioni e quesiti, grafici, posizioni effettive e direzioni dei vettori. In questi campioni la coincidenza fra controllo e clock è distinta dai clock che mantengono una velocità o una durata selezionata. Tutte le prove matematiche recuperate restano invariate e vengono davvero eseguite.

Ispezionate visivamente tutte le immagini di default dei dieci ID, in 3D e fallback. Riletti inoltre i grafici nativi delle due secanti, della cuspide, del volo e del moto circolare, il quarto di giro circolare in 3D, l’atterraggio in fallback e il carrello alla cuspide in fallback. Le altre immagini di stati limite e temporali sono prove eseguibili più confronti geometrici indipendenti: non si afferma di aver guardato ogni PNG. I file immagini restano temporanei; i nuovi report ne conservano gli hash e gli strumenti le rigenerano.

Test mirati: 9/9 PASS, uscita 0 in 19.981 s. Il trascritto GREEN e il precedente RED da tre fallimenti sono versionabili accanto a questa nota. Si mantengono tutti i test su domini, segni, unità, grafici, direzioni fuori piano, sorgenti sconosciute, prove mancanti, drift runtime e falsa approvazione umana. Fresh e saved soddisfano assert_activity_identity e risultano identici. Nessun PASS è ricavato dalla sola chiave o da un vecchio flag.

## Identità finali

- Runtime completo: 0e2083691b9233b26bc3a9e294813288d5c3eed97b29d4728431123684d8e3bd.
- Verifier: f295405978d7b647e81cd303ed601a1bc42c48a652fd36fa1412d7daf8fdf999.
- Test Python: 50a496c2c6812ba06d27503f8abee64ac872990913ba5748b2733eba9dc2bda5.
- Protocollo browser: 7a00f0041316cb47591ea6bd0e00ceb06e3547a9b3dafb84e4a4eb4c89c29104.
- Prova browser corrente: 01bf9cd85430521b2bc43d1af1bf58394917501c484434dd03453583ee74ca26.
- Report: c9f324e6fe1db7212ecbf4ec8a4a2d88cc99de37708cdd910cee38feb6e802bc.
- Provenienza storica: editorial/reviews/experiments-kinematics-039-f897-snapshot, manifest 0a230c6be284f46e5ccaaff81cc47ac700c1c9496eacde465d9ad76a36e4c5b1.

La rivalidazione conferma la stessa edizione originale sul nuovo runtime, non completa nuovi ID. Il precedente materiale f897 resta byte identico e identificato come storico. Nessuna nuova pubblicazione o firma umana.
