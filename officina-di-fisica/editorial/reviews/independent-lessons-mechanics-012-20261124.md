# Revisione indipendente AI — lessons-mechanics-012

Revisore AI separato dall'autore storico e dagli autori delle nuove bozze. Lettura integrale di **C1-L005..C1-L008**, incluse formule, paragrafi, didascalie e tre SVG originali, seguita da derivazioni indipendenti con SymPy 1.14.0, Pint 0.25.2 e frazioni esatte. Nessuna chiave o modulo di authoring usato come oracolo. **4 originali PASS, 0 FAIL, 66 controlli esatti**. Non è un'approvazione umana: `humanApproval=NOT_RUN`, `publicationAction=NONE`, edizioni originali conservate. Nessuna modifica a contenuti, candidati, registro o checkpoint.

Fonte immutabile: Git `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/C1.json`, SHA256 file `0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf`. Byte e hash canonici dei singoli record confrontati con Git; tre asset locali confrontati byte per byte con la stessa revisione. Anteprime originali generate e viste individualmente, oltre alla lettura XML.

| ID/versione | SHA256 canonico del record letto | Esito / controlli |
|---|---|---|
| C1-L005 / 1 | `b31d059be5483e5b03604a72e1a2cbc0cc85ef37f274ab954231a13ea3ecbe24` | PASS / 12 |
| C1-L006 / 2 | `980579f3788f171777b116945d26043a5f8a0ed6322a91ed9a28c7931b23e6b2` | PASS / 22 |
| C1-L007 / 1 | `3c1635ae6031ba25c8ed8e4467d54c759b107e0ea4fe4ab1c3d3503908081ede` | PASS / 16 |
| C1-L008 / 1 | `c6f724bcee46cc869778a7e3e48a29c18802f42fb756b0f6f073eb1f62793af5` | PASS / 16 |

## C1-L005 — isolare il corpo e disegnare le forze

Controllati tutti i passaggi: agenti delle interazioni, peso e normale, tensione, equilibrio traslazionale e inerzia, componenti della seconda legge a massa costante, unità newton, normale non automaticamente uguale al peso, terza legge applicata a corpi diversi. Il riferimento inerziale è esplicito; per l'equilibrio statico di corpi estesi il testo richiede anche il bilancio dei momenti. Risultante nulla conserva una velocità iniziale arbitraria, compreso il riposo, senza imporre erroneamente velocità nulla.

Da `N+Fup-mg=may` ricavo `N=mg+may-Fup`. **Prove costruite dal revisore**, non dati assegnati dalla lezione: con m=2kg, g=10m/s², ay=3m/s² e Fup=0 risulta N=26N; nel caso orizzontale (10−6)N/4kg=1m/s². Il contatto richiede inoltre N≥0. Le forze di azione e reazione si cancellano nel sistema comprendente entrambi i corpi, non nel diagramma di uno solo.

`C1-forze.svg`: N e mg hanno aste uguali di 80px; trazione destra 140px e attrito sinistro 79px sono coerenti con la risultante a destra e con la didascalia. Nessuna scala fisica N/px è assegnata: controllo solo direzioni, equilibrio verticale e ordine dei moduli, senza ricavare valori numerici di forza dalle frecce.

## C1-L006 — contatto, elasticità e gravitazione

Controllati separatamente il limite dell'attrito statico e il modello approssimato dell'attrito dinamico opposto allo scorrimento relativo. Il contesto è la cassa inizialmente ferma tirata lentamente: l'attrito statico si adatta alla forza necessaria finché il limite consente il riposo. Non è presentato come sempre uguale a μsN. La normale si determina prima della soglia. Per Hooke sono espliciti deformazione firmata rispetto alla lunghezza naturale, segno di richiamo e regime elastico lineare.

**Prove del revisore**: N=80N e μs=2/5 danno 32N; una trazione di 20N ammette attrito −20N, mentre 40N supera la soglia. Se scorre, μd=3/10 dà 24N e una massa di 8kg ha accelerazione (40−24)/8=2m/s². k=250N/m e x=±1/25m danno F=∓10N. Tutta l'aritmetica è eseguibile con interi e frazioni.

Verificati forza gravitazionale, dimensioni di G, cancellazione della massa di prova e fattore 1/4 raddoppiando la distanza. Controllo indipendente del guscio: l'integrale angolare del nucleo `1/sqrt(r²+a²−2ra*u)` vale 2/a per r<a e 2/r per r>a. Il potenziale interno −GM/a è costante e il campo è nullo; quello esterno −GM/r dà campo radiale −GM/r². Per densità uniforme, l'integrale della massa dà `M(r)=4πρr³/3`, quindi `g(r)=4πGρr/3`, limite zero al centro e continuità al bordo. Ciò verifica il passaggio interno senza estendere indebitamente la formula esterna fino a r=0. Le ipotesi di simmetria sferica, densità uniforme per la proporzionalità lineare e piccole quote per g locale sono rispettate. Non si richiede allo studente una valutazione numerica di G o π.

`C1-molla.svg`: configurazione naturale sopra e allungata sotto, riferimento dell'allungamento e verso x positivo a destra, forza di richiamo rossa a sinistra. Nessuna scala numerica di forza/allungamento è dichiarata; la disposizione schematica non è un esercizio di misura.

## C1-L007 — lavoro, energia cinetica e potenza

Letti lavoro scalare e proiezione con segno, dipendenza dall'angolo per forza costante, area firmata per forza variabile, teorema del lavoro totale per punto materiale a massa costante, energia cinetica, potenza media e istantanea e il caso del motore che lavora a velocità costante. Le velocità della formula F·v e lo spostamento riguardano il punto di applicazione; per sistemi estesi occorre il bilancio appropriato.

Derivazione indipendente: da F=m dv/dt, `F·v=d(mv²/2)/dt`; integrando la forza elastica da 0 a x si ottiene −kx²/2. Verificate J=N·m e W=J/s=N·m/s. **Prove del revisore**: 4N per 3m danno 12, 0 o −12J agli angoli 0, π/2 e π. Per m=2kg, vi=1m/s e lavoro 12J: Ki=1J, Kf=13J, vf=√13m/s, ammesso esattamente senza decimale. Motore +10N e resistenza −10N a 2m/s per 3s danno lavori +60J e −60J: lavoro totale zero, lavori individuali non nulli. W(t)=βt² dà potenza istantanea 2βt e media βt su [0,t], t>0. Questi numeri e questa funzione sono controlli aggiunti dal revisore, non richieste numeriche della lezione. Nessuna figura o opzione di scelta presente.

## C1-L008 — potenziali e bilanci fra configurazioni

Controllati dipendenza dagli estremi per forza conservativa, segno `Lcons=Ui−Uf`, riferimento comune arbitrario, potenziali gravitazionale ed elastico con i loro domini, energia meccanica e lavoro delle altre forze, conversione in energia interna sotto l'isolamento dichiarato e scelta del metodo in base alla domanda. Derivando mgz e kx²/2 si ritrovano −mg e −kx. Sostituendo Wcons nel teorema cinetico si ottiene `Δ(K+U)=Wother`; aggiungere una costante comune al potenziale non cambia il bilancio.

Il lavoro del peso lungo due curve costruite dal revisore, `(Ls,H(1−s))` e `(Ls,H(1−s²))`, s∈[0,1], vale in entrambi i casi mgH. L'energia elastica è uguale per ±x. **Prove numeriche del revisore**: k=200N/m, x=1/10m danno 1J; trasferiti a m=1/2kg danno velocità di modulo 2m/s. Una massa di 1kg che scende 2m con g=10m/s² e lavoro d'attrito −2J termina con K=18J e rapidità 6m/s; con l'isolamento opportuno l'aumento di energia interna è 2J. Il valore identico di K per ±v verifica il limite dichiarato: l'energia determina spesso la rapidità, non la direzione.

`C1-energia.svg`: A in alto, B sul livello tratteggiato scelto come zero e h verticale; il confronto pertinente è quota contro lunghezza del percorso. Non ci sono quote numeriche né scala metrica: l'icona del corpo sopra il piano non assegna un'altezza del centro di massa ricavabile dai pixel.

## Integrità e limiti

I tre SHA256 degli SVG originali sono congelati nel verificatore:

- C1-forze.svg: `23032966207743fa88c6b6c4491a80d13b9da68c1e913bd4ebd8719f610c620a`
- C1-molla.svg: `0a74e505ec7655923b437653802e23302be900f6f2292751d1c56735f41868c1`
- C1-energia.svg: `13899393ff8432b08112f3766b163b4223d5d6f3d3541630b24f5a56faa1d21b`

Cinque test PASS, ultima esecuzione 0,578s: riproducibilità e identità di tutti i record, confronto reale con Git, mutazione/omissione di ciascuna lezione, rimozione o modifica di ciascun SVG e distinzione esplicita tra controlli costruiti e richieste dello studente. Nessuna equazione è considerata valida solo perché esiste un flag o manca una chiave. Non rilevati difetti concreti nelle quattro edizioni effettivamente lette; questo giudizio non copre altri record, pubblicazione o interfaccia browser.

Artefatti esatti:

- Verificatore SHA256: `1763646410d34b6c25b74396e4ffde453d1cd628583f581ecaa562276e061f86`
- Test SHA256: `655e282947e51b865c6f840cdb36df5b7f32d6fdbd12ef431bcaf63767df0e03`
- Entrambi i report originali/effective SHA256 file: `9a948c3c550fa384120ed433d339569eef036b9632775b245838d226c31b48ea`
- Digest JSON canonico di ciascun report: `a013200303950a8889639029d478cdc2d63b13b08dd9f150e46b4c0582921112`
- Contratto letto dal report SHA256: `a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60`
