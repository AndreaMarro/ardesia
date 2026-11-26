# Revisione indipendente cric-c1-l003

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; modello realmente eseguito prima dei candidati in 7a2a3784421f346b4784a581e275760a623b4adf, SHA f7e59ee2a8652933cccd27248b6798c5a6a75c66c8f9f111efe81b20a10fd88c. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali bb1838bc2cda1fa04a269dbca40c2284190f5889 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C1-L003 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML finale e nuovo PNG indipendente640×1740 letti per intero; vecchia resa con due contatti conservata separatamente. Primo grafico: origine velocità y200, scala60/(m/s),−3 a380,−1 a260; due secondi in160coordinate. Le label2 e titolo v sono ora lontane dalle linee. Secondo:40coordinate/s e12/m, incontro(320,870) corrisponde5s,10m. Terzo:40/s e40/(m/s), aree3·4=12m e−2·5=−10m, spostamento2m e distanza22m. Nessuna nuova ambiguità grafica.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C1-Q021

Ipotesi: Un solo asse, x₀=−12 m e velocità costante+2,5 m/s per8 s; origine e orientazione fisse.

Derivazione manuale: La legge uniforme x=x₀+vt usa x₀=−12 m,v=5/2 m/s,t=8 s: x=−12+20=8 m. La posizione finale è distinta dallo spostamento20 m.

Distrattori: 20 m omette x₀;−32 m usa velocità negativa;32 m aggiunge il modulo della posizione iniziale;−8 m cambia il segno del risultato.

Didattica: Condizione iniziale con segno conservata prima del prodotto vt.

Modalità distinta: EXACT_ORACLE; esito True. Firma 53d552c1deafbcb0786e6f72723d8ad87c012c2d55121980dff7a32ee0106288.

## C1-Q022

Ipotesi: Percorso complessivo24 m diviso in due tratte di12 m, senza pause, rapidità costanti2 e3 m/s.

Derivazione manuale: Due tratti uguali12 m a2 e3 m/s richiedono6 e4 s. La rapidità media è24/10=12/5 m/s; la media aritmetica5/2 non pesa le durate diverse.

Distrattori: 5/2 m/s è la media semplice non temporale;5 somma rapidità;6/5 dimezza ancora;2 copia la prima rapidità.

Didattica: Media totale come rapporto spazio/tempo, con due durate diverse esplicite.

Modalità distinta: EXACT_ORACLE; esito True. Firma d05f233aff97897f7fad424acb5e477392fabf5263f310a264c59ee83c092bd8.

## C1-Q023

Ipotesi: Grafico della componente v nel tempo con v negativa e crescente nell’intervallo; non un grafico di posizione.

Derivazione manuale: v<0 indica verso x decrescenti; pendenza positiva del grafico v–t implica a>0. Poiché |v|=−v nell’intervallo, la rapidità diminuisce: non si deduce il segno di x.

Distrattori: Grafico crescente non implica moto verso x crescente; v negativa non significa quiete o posizione necessariamente negativa.

Didattica: Segni di x,v,a e rapidità distinti.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 3391341f32f3f23e3ca8e33d0ad77d04e834c6fe320137d2a9e9ec88a4396572.

## C1-Q024

Ipotesi: Legge x(t) differenziabile nell’istante, velocità istantanea e non media fra tempi lontani.

Derivazione manuale: La velocità istantanea è dx/dt, pendenza della tangente a x–t nel punto. Una secante dà una media su un intervallo e coincide solo in casi particolari.

Distrattori: La secante è velocità media; l’orizzontale ha pendenza zero; dall’origine vale solo se quel punto è pertinente; la normale non dà dx/dt.

Didattica: Tangente e secante separate mediante derivata e media.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 3bf5fbeb9911963a1bbeaa259751125849a90746e9abe2b4f8ea0023852366ed.

## C1-Q025

Ipotesi: Riferimento traslato spazialmente di5 m a destra, stesso verso, unità e origine temporale; traslazione fissa.

Derivazione manuale: Spostando l’origine5 m a destra, x′=x−5 m. La differenza fra due posizioni e le derivate sono invariate; cambia la coordinata assoluta.

Distrattori: Differenze e derivate eliminano la costante−5 m; anche distanza fisica e verso del moto restano invariati.

Didattica: Stessa traslazione sottratta agli estremi prima del bilancio.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 6de7abb913d59c9bad0571b8321cf080a1ab8109b13df85c71774c1befc668fd.

## C1-Q026

Ipotesi: Due punti sulla stessa retta, x_A=(2 m/s)t e x_B=15 m−(1 m/s)t, t≥0 e nessun cambio di regime.

Derivazione manuale: Incontro:2t=15−t con unità dei coefficienti m/s. Da3t=15 ricavo t=5 s e in entrambe le leggi x=10 m; dominio t≥0 rispettato.

Distrattori: 15 s e15/2 s usano una sola velocità;10 copia la posizione in metri;−5 s non soddisfa l’incontro né il dominio.

Didattica: Condizione simultanea di incontro e controllo in entrambe le leggi.

Modalità distinta: EXACT_ORACLE; esito True. Firma d0e1c753c3ed5793712a646b75b49eed76f400341a57c164f9b215ba1bcb70b2.

## C1-Q027

Ipotesi: Due intervalli successivi,4 s a+3 m/s e5 s a−2 m/s, stessa orientazione.

Derivazione manuale: Le aree orientate sono3·4=12 m e−2·5=−10 m. Somma2 m; la distanza è22 m perché somma i moduli dei due spostamenti.

Distrattori: 22 m è distanza,−2 inverte la differenza,−22 impone segni entrambi negativi;7 m non è la somma delle aree.

Didattica: Aree positive e negative confrontate con distanza cumulativa.

Modalità distinta: EXACT_ORACLE; esito True. Firma c7aa677c3556d327bfd1c3cb4ebe802d6a716d38eab917bde395c08554ae65c6.

## C1-Q028

Ipotesi: Due grafici autonomi: uno x–t e uno v–t, entrambi piatti con ordinata positiva; ordinata da identificare prima del moto.

Derivazione manuale: Orizzontale sopra zero in x–t significa x positiva costante e v=0. In v–t significa v positiva costante e a=0; la posizione di quel secondo moto resta non determinata.

Distrattori: La linea orizzontale annulla la derivata dell’ordinata, che cambia fra i due grafici; v>0 non determina x>0.

Didattica: Nome degli assi letto prima della forma del grafico.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma c77e5fb731d2df11f2c399b8dffee766c494dcb53d237699d3f367afa983134f.

## C1-Q029

Ipotesi: Velocità orientate iniziale−3 m/s e finale+1 m/s separate da2 s; nessuna ipotesi di accelerazione costante.

Derivazione manuale: La media è(v_f−v_i)/Δt=(1−(−3))/2=2 m/s². L’accelerazione non deve essere costante; −1 m/s² deriva dai moduli(1−3)/2.

Distrattori: −1 usa i moduli,1 perde la variazione attraverso zero,−2 scambia estremi;4 copia Δv senza dividere per2 s.

Didattica: Variazione orientata e media senza introdurre a costante.

Modalità distinta: EXACT_ORACLE; esito True. Firma 06b7c98b3bd75ae556087f4193674354b18a68f1f661be2bc62c9a89b5249f06.

## C1-Q030

Ipotesi: Descrizione geometrica del luogo delle posizioni, distinta dall’assegnazione temporale di un moto.

Derivazione manuale: La traiettoria è l’insieme geometrico delle posizioni attraversate. La legge oraria vi associa tempi; né velocità né accelerazione sono l’insieme di punti nello spazio.

Distrattori: Legge oraria comprende il tempo; il grafico v–t riguarda velocità e tempo, spostamento è differenza di posizioni e accelerazione una derivata.

Didattica: Geometria della traiettoria separata dalla temporizzazione.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma e4a8ca37b9a61b19ab0fd092778459de312a96cc6cc170845a7a8c1392b1a1b1.
