# Revisione indipendente cric-c1-l004

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; modello realmente eseguito prima dei candidati in 7a2a3784421f346b4784a581e275760a623b4adf, SHA f7e59ee2a8652933cccd27248b6798c5a6a75c66c8f9f111efe81b20a10fd88c. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali 4854852966e56fbf26f9cbd4dfb85661b8a345e9 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C1-L004 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML e nuovo PNG indipendente640×1820 letti integralmente. Triangolo velocità-tempo:2s in320coordinate,4m/s in240, area fisica4m. Quota-tempo: ritorno6/5s in360coordinate; Bezier quadratica da(120,1030) controllo(300,670) a(480,1030), vertice(300,850)=3/5s,9/5m; scala100coordinate/m. Disco:r80,2r160, frecce radiali50 e100 verso il centro, rapporto2 aω comune. Nessuna label tagliata o sovrapposta rilevata.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C1-Q031

Ipotesi: Moto rettilineo con v₀=4 m/s,a=−2 m/s² costante, arresto al primo zero, nessuna estensione al moto successivo.

Derivazione manuale: Primo arresto da v=4−2t=0: T=2 s. Fino a T velocità non negativa, distanza uguale allo spostamento. L’area triangolare è(1/2)·2·4=4 m.

Distrattori: 8 m usa l’area del rettangolo,2 copia la durata,16 omette2|a| dalla relazione;−4 assegna alla distanza il segno di a.

Didattica: Evento di arresto definito prima della distanza.

Modalità distinta: EXACT_ORACLE; esito True. Firma bbdb47ac6708df95e4a93387b690b69b3ce41ded9462f79643225ae2b50bf80e.

## C1-Q032

Ipotesi: Lancio obliquo con componente orizzontale non nulla, riferimento terrestre inerziale approssimato, g uniforme e nessuna aria.

Derivazione manuale: Al culmine del lancio obliquo senza aria, v_y=0 ma v_x=v₀x≠0. La forza gravitazionale resta presente e a_y=−g, a_x=0.

Distrattori: Il culmine annulla solo v_y; gravità e accelerazione non si annullano. v_x non nulla impedisce la quiete istantanea.

Didattica: Moduli, componenti e forza residua al culmine distinti.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 92a85db50914b07b8a1da728ac0fa0c19509bd7af0153c80b1d685f219b97b2a.

## C1-Q033

Ipotesi: Lancio verticale da quota iniziale con v₀=6 m/s,g=10 m/s²; ritorno alla stessa quota a tempo strettamente positivo.

Derivazione manuale: Ritorno verticale: y=t(v₀−gt/2)=0. La radice iniziale0 è esclusa; T=2v₀/g=12/10=6/5 s, doppio del tempo di salita3/5 s.

Distrattori: 3/5 s è la salita;3 s non ricostruisce y=0;5/6 inverte la durata;zero è la partenza, non il ritorno.

Didattica: Due radici e ramo temporale fisico identificati.

Modalità distinta: EXACT_ORACLE; esito True. Firma e9c689b6f66e4c83f909dc3e38533dab41ff8707791a82fab74358032c5a392d.

## C1-Q034

Ipotesi: Rilascio da fermo,g=10 m/s² costante, suolo non raggiunto entro2 s; intervallo1–2 s dal rilascio.

Derivazione manuale: Caduta da fermo:s(t)=gt²/2. Fra1 e2 s la distanza è5(4−1)=15 m, non il totale20 m misurato dall’inizio.

Distrattori: 20 m è cumulativo;5 m è la prima caduta;10 presuppone uguali distanze a ogni secondo;25 somma le posizioni.

Didattica: Due posizioni dalla stessa origine sottratte.

Modalità distinta: EXACT_ORACLE; esito True. Firma 3e052fb8e18b958f029509738088b071b48e0c57d60fceaf49d9701200fe5343.

## C1-Q035

Ipotesi: Due sfere dalla stessa altezza positiva sullo stesso piano orizzontale, rilascio simultaneo, v₀y=0 per entrambe e assenza di aria.

Derivazione manuale: Stessa quota, v₀y=0 e stessa g rendono identico y(t), quindi T=√(2h/g) per entrambe. La componente orizzontale cambia solo la posizione di arrivo.

Distrattori: La componente orizzontale non modifica l’equazione verticale; massa e percorso obliquo non danno durate differenti nel modello.

Didattica: Indipendenza delle componenti motivata dalle leggi verticali.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 7f07e7d6761879def92182da46aa9d69411b1714e4891a35edb90fb75a7f7634.

## C1-Q036

Ipotesi: Rotazione uniforme a30 giri/min, conteggio completo dei giri e conversione esatta60 s per minuto.

Derivazione manuale: 30 giri/min sono1/2 giri/s. Il tempo di un giro è60/30=2 s, inverso della frequenza e non il conteggio30.

Distrattori: 30 e60 copiano conteggio o durata totale;1/2 è frequenza in Hz,1800 moltiplica anziché dividere.

Didattica: Frequenza e periodo separati dimensionalmente.

Modalità distinta: EXACT_ORACLE; esito True. Firma 6c1d6f756f47f7c421cf45e029e6873e01618d537fc445d9a03311bf6b2b3c05.

## C1-Q037

Ipotesi: Moto circolare con rapidità3 m/s e componente centripeta9/2 m/s² positive, raggio geometrico positivo.

Derivazione manuale: Raggio:v²/a_c=9/(9/2)=2 m. Controprova del distrattore3/2 m:9/(3/2)=6 m/s², non9/2. Il rapporto v/a_c avrebbe invece unità s e valore2/3.

Distrattori: 1/2 m inverte il rapporto;3/2 m darebbe6 m/s²;9 m non divide v² per a_c;6 m non ricostruisce9/2 m/s².

Didattica: Inversa simbolica e ricostruzione del dato a_c; attribuzione errata del vecchio distrattore corretta prima del freeze.

Modalità distinta: EXACT_ORACLE; esito True. Firma ca4f745e7758a91b765ec424fcb634d254b728cb0a15ba1ba4ba700f24804553.

## C1-Q038

Ipotesi: Disco rigido in rotazione uniforme,ω≠0, due distanze positive r e2r dall’asse; accelerazioni confrontate allo stessoω.

Derivazione manuale: A ω comune non nulla, a_c=ω²r. Il rapporto per2r e r è2; in v²/r anche v=ωr raddoppia, quindi la semplificazione dà4/2=2.

Distrattori: 1/2 tiene v fisso erroneamente;4 omette il raggio raddoppiato al denominatore;1 confondeω e a;1/4 inverte un rapporto quadratico non pertinente.

Didattica: Grandezza realmente comune scelta prima della scalatura.

Modalità distinta: EXACT_ORACLE; esito True. Firma 8ca562d7f9f9291bdf6f462bcc98a56da1d8bead83def9a6a1ab6a53f97be4e1.

## C1-Q039

Ipotesi: Moto circolare uniforme con r>0,v>0: direzione dell’accelerazione fisica, senza forza centrifuga nel riferimento inerziale.

Derivazione manuale: Il vettore velocità gira anche a modulo costante. La sua derivata è radiale entrante, modulo v²/r>0; l’accelerazione tangenziale è nulla.

Distrattori: Tangente è direzione della velocità; accelerazione uscente ha verso errato;zero richiederebbe velocità vettoriale costante, impossibile sul cerchio.

Didattica: Accelerazione come variazione vettoriale distinta dal solo modulo.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 7a62b57241b681ee258009b1336fc9fda4807d0c85a69fbaff094e5e9bd4b2fb.

## C1-Q040

Ipotesi: Legge x=1 m+(2 m/s)t+(3 m/s²)t² differenziabile, velocità istantanea richiesta a2 s.

Derivazione manuale: La derivata di1+2t+3t² con coefficienti dimensionati è2+6t. A2 s vale14 m/s;8 m/s omette il fattore2 della derivata di t² ma mantiene t.

Distrattori: 17 copia x in metri;8 omette2 in d(t²)/dt;12 omette la velocità iniziale;6 copia il coefficiente di accelerazione, con altra unità.

Didattica: Derivata con unità dei coefficienti, fattore2 esplicito e controprova del vecchio feedback corretto.

Modalità distinta: EXACT_ORACLE; esito True. Firma f7427ac5db7d9fd24298f9a13baf4cf83e938f36b63b279fc525adc83ede2efa.
