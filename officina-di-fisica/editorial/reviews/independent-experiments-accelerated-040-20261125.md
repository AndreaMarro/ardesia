# Rivalidazione indipendente 040 sul profilo finale 1a3502

Si rieseguono gli stessi 4 ID già revisionati, senza nuovo credito. Gli originali completi sono stati riletti individualmente dal pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d; il file esperienze-C1.json ha SHA256 84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3. Le leggi, i segni e i conti manuali riportati sotto sono stati nuovamente ricavati. Gli oracoli recuperati erano già noti: questa è rivalidazione e non una prima revisione cieca.

Le snapshot f897, 0e208, 5405 e, per 039, il positivo b963 restano storiche e immutate. I negativi b963 della caduta e del cerchio sono conservati separatamente; non sono stati ritaggati né convertiti in esiti positivi. Nessun file di produzione, candidato, registro, checkpoint o Git è stato modificato da questa revisione.

Il delta effettivo rispetto a b963 riguarda le legende HTML e l’apparato meccanico. I modelli, i clock, le secanti e le leggi del moto assegnate non cambiano. Le etichette flottanti ridondanti vengono tolte; il via del binario è identificato dalla tacca ocra e dalla legenda. In caduta il peso mantiene il delta verticale −21/50 ma viene traslato sopra il corpo. Nel cerchio le due frecce sono nel piano parallelo y=57/100, come dichiarato dalla legenda, conservando tutte le componenti e le due scale fisiche distinte. Le 22 dipendenze esplicite e l’intero profilo sono vincolati prima e dopo ogni replay. L’ulteriore delta confronti rispetto a 5405 riguarda un’altra esperienza e non queste leggi.

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


## Risoluzione dei due finding visivi

La caduta conserva il corpo a y=3/10+(41/400)h. Il peso va da (0, y+16/25, 1/4) a (0, y+11/50, 1/4): il delta è ancora (0,−21/50,0), con punta sopra la base anche al primo contatto h=0. Il cono è rivolto verso il basso e si estende verso l’origine della freccia, quindi non prosegue sotto la punta. Non viene rappresentata una nuova forza o un proseguimento del moto dopo il contatto.

Nel cerchio il corpo resta a y=8/25, raggio della sfera 7/50; entrambe le frecce sono traslate a y=57/100. La separazione verticale è 1/4, maggiore di 7/50+203/2500=553/2500, somma del raggio del corpo e del massimo raggio del cono (0,0812). Il cono completo e l’asta restano quindi fuori dalla sfera opaca in tutte le fasi. Le componenti tangenti e radiali restano rispettivamente proporzionali a v e v²/2; la collocazione nel piano parallelo non introduce una componente verticale. Le due grandezze mantengono unità e scale proprie.

Il vecchio confronto accettava tre traslazioni che rimettevano le punte occultate conservando esattamente i delta: il RED è conservato. Il nuovo confronto richiede anche origini ed estremi indipendentemente derivati. Le tre medesime mutazioni ora vengono rifiutate: GREEN conservato. Questi avversari sono aggiunti al test geometrico esistente; nessun controllo precedente è rimosso. Le funzioni delle leggi e delle prove SymPy/Pint/Fraction sono byte identiche alla snapshot 5405; solo compare_runtime è rafforzata.

## Replay effettivo e limiti

Il protocollo reale ha completato 52 casi, processo exit 0, Chrome nativo e fallback, sessione demo e SQLite privati, richieste esterne bloccate. Nessun page error. Sono state respinte risposte sbagliate e accettate quelle ricavate indipendentemente. scientificApproval=false è emesso direttamente dal protocollo: il report browser non costituisce da solo un giudizio scientifico.

Confrontati 60 valori di controllo e 240 campioni temporali, con grafici, unità, posizioni, clock e assegnazioni. Tutte le 52 immagini nuove sono state realmente lette nelle 5 tavole di contatto; gli originali sono conservati. Per 040 sono stati aperti anche gli originali nativi della caduta al contatto e del cerchio alla velocità minima. Il perimetro visivo di questo replay è la vista predefinita a 1280 px, nativa e fallback; non si attribuiscono a questi PNG prove a 320 px o su tutte le rotazioni manuali. Le griglie angolari e le ulteriori viste del revisore distinto rimangono prove separate.

Nove test PASS, exit 0 in 179.708 s. Identità fresh e saved controllata con assert_activity_identity e report byte canonici equivalenti. Le controprove su fonte, dipendenze, leggi, grafici, segni, unità, clock, prove alterate e falsa firma umana rimangono attive. Nessuna promozione automatica da chiave autore.

Human NOT_RUN; publicationAction NONE; originalEditionRetained true. Esito AI limitato alle dieci esperienze e ai consumer effettivamente provati; nessun nuovo ID accreditato.

## Impronte finali

- Runtime: 1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba.
- Verifier: 3d4b5e62465e143f0b0c1b3357426d56c003430b9315ace6a27258bee20912df.
- Protocollo browser: e804cbdaaee69760cc7ea363692a28d9d2ab5b063480e0e2be78fbbf7cf62534.
- Prova browser: c8c22c74644fe3a2c01d4f635be9a6ac9981a4c730c4833d8d27ee3aa93b58a7.
- Test: 44d5cecb7a23ba507150c427805021dd4c286dcab33e5068d91803fb47ad87f7.
- Report: d82be449a8c95c0af1f7fa328d200de5d869df36aac2972195447fb85876ace7.
