# Rivalidazione indipendente 039 sul profilo finale 1a3502

Si rieseguono gli stessi 6 ID già revisionati, senza nuovo credito. Gli originali completi sono stati riletti individualmente dal pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d; il file esperienze-C1.json ha SHA256 84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3. Le leggi, i segni e i conti manuali riportati sotto sono stati nuovamente ricavati. Gli oracoli recuperati erano già noti: questa è rivalidazione e non una prima revisione cieca.

Le snapshot f897, 0e208, 5405 e, per 039, il positivo b963 restano storiche e immutate. I negativi b963 della caduta e del cerchio sono conservati separatamente; non sono stati ritaggati né convertiti in esiti positivi. Nessun file di produzione, candidato, registro, checkpoint o Git è stato modificato da questa revisione.

Il delta effettivo rispetto a b963 riguarda le legende HTML e l’apparato meccanico. I modelli, i clock, le secanti e le leggi del moto assegnate non cambiano. Le etichette flottanti ridondanti vengono tolte; il via del binario è identificato dalla tacca ocra e dalla legenda. In caduta il peso mantiene il delta verticale −21/50 ma viene traslato sopra il corpo. Nel cerchio le due frecce sono nel piano parallelo y=57/100, come dichiarato dalla legenda, conservando tutte le componenti e le due scale fisiche distinte. Le 22 dipendenze esplicite e l’intero profilo sono vincolati prima e dopo ogni replay. L’ulteriore delta confronti rispetto a 5405 riguarda un’altra esperienza e non queste leggi.

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


## Replay effettivo e limiti

Il protocollo reale ha completato 66 casi, processo exit 0, Chrome nativo e fallback, sessione demo e SQLite privati, richieste esterne bloccate. Nessun page error. Sono state respinte risposte sbagliate e accettate quelle ricavate indipendentemente. scientificApproval=false è emesso direttamente dal protocollo: il report browser non costituisce da solo un giudizio scientifico.

Confrontati 100 valori di controllo e 249 campioni temporali, con grafici, unità, posizioni, clock e assegnazioni. Tutte le 66 immagini nuove sono state realmente lette nelle 6 tavole di contatto; gli originali sono conservati. Per 040 sono stati aperti anche gli originali nativi della caduta al contatto e del cerchio alla velocità minima. Il perimetro visivo di questo replay è la vista predefinita a 1280 px, nativa e fallback; non si attribuiscono a questi PNG prove a 320 px o su tutte le rotazioni manuali. Le griglie angolari e le ulteriori viste del revisore distinto rimangono prove separate.

Nove test PASS, exit 0 in 141.545 s. Identità fresh e saved controllata con assert_activity_identity e report byte canonici equivalenti. Le controprove su fonte, dipendenze, leggi, grafici, segni, unità, clock, prove alterate e falsa firma umana rimangono attive. Nessuna promozione automatica da chiave autore.

Human NOT_RUN; publicationAction NONE; originalEditionRetained true. Esito AI limitato alle dieci esperienze e ai consumer effettivamente provati; nessun nuovo ID accreditato.

## Impronte finali

- Runtime: 1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba.
- Verifier: da7c9f1a758be6c41f397ff8a490d4ecc9ef3bbd900f3794c54e952e04626268.
- Protocollo browser: 406ca3d925d2bb21c1ec24698a4a3cf65430832c6c54dfce674e43ebb926b1ab.
- Prova browser: ed8fdb40b10bdabd9c3e756c5bad2f8b1feb01df595e885ca1e21d6f1dec19c9.
- Test: 50a496c2c6812ba06d27503f8abee64ac872990913ba5748b2733eba9dc2bda5.
- Report: 368389bbc7c0772fbba35e9e4362a915b94d3fb5323ff70ad03f5eaf32870650.
