# Revisione indipendente cric-c1-l001

Dieci problemi distinti C1-Q001–C1-Q010. Primaria prompt-only dei primi cinquanta congelata in a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a, e modello realmente eseguito prima dei candidati in 7a2a3784, SHA f7e59ee2a8652933cccd27248b6798c5a6a75c66c8f9f111efe81b20a10fd88c. Nessuna risposta originale o candidata aveva fornito le derivazioni.

Tutti i dieci record finali a9e769aeb23260ed09fea6646ca17a2c5749f69d sono stati letti integralmente: enunciati, passaggi, formule, opzioni, hint, feedback e contesto individuale. Il catalogo C1-L001 effettivo al pin Cric è stato letto; unità, vettori, estensività e densità intensiva sono competenze pertinenti. La conservazione delle versioni individuali, famiglie, difficoltà, prerequisiti ed eventuali exam viene controllata anche dopo retoken ostile.

XML e nuovo PNG indipendente 640×1650 interamente letti. Prisma obliquo con lati di lunghezza proiettata100,100,200 per5,5,10mm: volume250mm³, senza attribuire al disegno la forma della micropipetta. Barre massa tutte da x155:273,210,63 corrispondono54,6/42/12,6g, scala comune5 coordinate/g; differenza63. Freccia nord da(320,1500) a(320,1300), quattro intervalli uguali50 per1m; origine e verso coerenti. Tre pannelli indipendenti, nessuna label attraversata o tagliata rilevata.

Prove automatiche distinte dalle letture concettuali. Il decoder esatto canonico conserva il lessema decimale; la virgola è normalizzata come separatore decimale senza passare da float. Le cinque espressioni scientifiche in potenze di dieci appartengono a una mappa esplicita delle forme lette, non a una nuova grammatica generale o eval. Le unità riconosciute servono a distinguere grandezze e scelte numericamente equivalenti.

La resa nativa è asset-only, realmente terminale 0 e letta per intero. UI del prodotto e approvazione umana NOT_RUN; nessuna pubblicazione, tutto DRAFT. Il file git-inputs.json con snapshot verbatim rende recuperabile il modello storico in CI.

## C1-Q001

Ipotesi: Volume di 250 µL assegnato; confronto fra unità di volume SI equivalenti, senza ipotesi sulla forma reale della micropipetta o una sua calibrazione.

Procedura manuale: 1 µL=10⁻⁶ L=10⁻⁹ m³ e 1 mm³=(10⁻³ m)³=10⁻⁹ m³. La conversione mantiene il coefficiente 250: volume 250 mm³. Il prisma è solo un volume equivalente.

Distrattori: 0,25 mm³ copia il coefficiente in mL; 250000 mm³ tratta µL come mL. Il prefisso in una lunghezza va elevato al cubo nel volume.

Didattica: Conversione cubica motivata attraverso m³; volume equivalente distinto dalla forma della pipetta.

Controllo distinto: EXACT_ORACLE, ok=True. Firma: 3a42c3fbc2fafdcbc48e6fd01724a02829cc54b5207944cf8ceb35f27fc5f682.

## C1-Q002

Ipotesi: Forza costante concorde al tratto rettilineo del punto di applicazione; m è massa, v rapidità e ℓ lunghezza. Si chiede omogeneità dimensionale di entrambi i termini della coppia, non una legge dinamica aggiuntiva.

Procedura manuale: Fℓ e mv²/2 hanno entrambi dimensione ML²T⁻². Il caso di forza concorde rende Fℓ un lavoro positivo. Non basta che uno solo dei due termini abbia la dimensione di energia.

Distrattori: F e mv non sono energie; Fv è potenza. mℓ, Ft e v² hanno dimensioni differenti da energia, quindi non formano la coppia richiesta.

Didattica: Controllati entrambi i termini di ogni coppia; dimensioni uguali indicate come condizione necessaria per sommare energie.

Controllo distinto: AI_CONCEPTUAL, ok=True. Firma: 0df8f5b58fc6436bf423e8a02c2fc4a59a89fe313e3fdaad7a3464d369512f4c.

## C1-Q003

Ipotesi: Campione omogeneo diviso in due parti uguali senza mutarne lo stato. La massa classica è additiva fra le parti; dimensione, natura scalare ed estensività sono classificazioni distinte.

Procedura manuale: La massa si somma fra le parti ed è estensiva. Per due metà identiche m₁=m₂=m/2; la densità nello stesso stato resta invece intensiva.

Distrattori: Intensiva non scala con la quantità; adimensionale e vettoriale non descrivono la dipendenza additiva della massa. La proprietà resta scalare con dimensione M.

Didattica: Distinte additività, dimensione e natura scalare della massa.

Controllo distinto: AI_CONCEPTUAL, ok=True. Firma: f33a2fa0cbc15854de107be05f6ed5857ca2dca0d99a8f4602c76b03dce2a7af.

## C1-Q004

Ipotesi: Lunghezze ideali di segmenti: 4 cm e 80 µm. Copertura esatta senza sovrapposizioni; si contano intervalli di lunghezza e non i loro punti estremi.

Procedura manuale: 4 cm sono 40 000 µm. Divido 40 000 per 80: 500 segmenti, risultato puro. Il prompt finale chiarisce che si contano lunghezze, non i punti che delimitano gli intervalli.

Distrattori: 50 e 5000 perdono o aggiungono un fattore dieci. 1/500 è il rapporto inverso. I 501 estremi di 500 intervalli non sono le 500 lunghezze richieste.

Didattica: Il prompt finale elimina la possibile ambiguità fra numero di segmenti e numero di estremi.

Controllo distinto: EXACT_ORACLE, ok=True. Firma: 323dbf19684404a069b21a887c02b3da30699676b6d67e5a8a126687b3808e35.

## C1-Q005

Ipotesi: Grandezza positiva 7·10⁻⁵ m e definizione esplicita di potenza più vicina in scala logaritmica. Soglia geometrica √10, non arrotondamento lineare né semplice esponente della notazione scientifica.

Procedura manuale: In scala logaritmica la soglia fra 10⁻⁵ e 10⁻⁴ è √10·10⁻⁵. Poiché 7²=49>10, il coefficiente è sopra la soglia e la potenza più vicina è 10⁻⁴ m. Nessun logaritmo decimale è necessario.

Distrattori: 10⁻⁵ copia l’esponente senza la soglia; 10⁻⁶ e 10⁻³ sono più lontane. 7·10⁻⁵ non è una singola potenza di dieci.

Didattica: Procedura senza calcolatrice mediante confronto di quadrati positivi, con definizione logaritmica esplicita.

Controllo distinto: EXACT_ORACLE, ok=True. Firma: 489fe9869c4df1f8ee060bbbb99aa968986aa6d484d20263d8f708c3e0d9c7ff.

## C1-Q006

Ipotesi: Spostamento di modulo 4 m verso nord. Si distingue un vettore spostamento da una lunghezza scalare, una forza o il percorso realmente compiuto.

Procedura manuale: Quattro metri verso nord contiene modulo, direzione e verso: è uno spostamento vettoriale. La dimensione rimane lunghezza; non diventa forza o numero puro.

Distrattori: Scalare perde il verso nord; il numero 4 non elimina l’unità. Una forza ha dimensione diversa e non qualunque vettore è una forza; il tempo non è una lunghezza.

Didattica: Modulo, direzione e verso separati dall’unità di lunghezza.

Controllo distinto: AI_CONCEPTUAL, ok=True. Firma: 12888786f3af14b166a34236f0833df055b18ec66ed0ecaa328973a9d93bcb1f.

## C1-Q007

Ipotesi: Stessa fiala piena e vuota, masse assegnate 54,6 g e 0,0420 kg; il contenuto non altera la massa del contenitore. Conversione delle unità prima della sottrazione, senza dedurre incertezze non fornite.

Procedura manuale: Converto la tara 0,0420 kg in 42,0 g. La massa del contenuto è 54,6−42,0=12,6 g, minore della massa lorda e positiva. Tutti i decimali vengono trattati come frazioni esatte nel modello assegnato.

Distrattori: 54,558 g sottrae dati non uniformati. 96,6 somma la tara; 42,0 è la tara stessa. 0,0126 è il coefficiente in kg, non in g.

Didattica: Tara portata in grammi prima della sottrazione; risultato reinserito nella somma massa vuota più contenuto.

Controllo distinto: EXACT_ORACLE, ok=True. Firma: cbc3e05963aa0ebaf41a051f22a4f74a83bf0886c7f3025aab229852fea5e2ca.

## C1-Q008

Ipotesi: Legge dimensionale x=kt² con x lunghezza e t tempo; k è un coefficiente costante della legge. La sua unità coincide con quella di accelerazione, ma il valore dinamico sarebbe 2k se la stessa x descrive un moto.

Procedura manuale: Da x=kt², k=x/t² ha dimensione LT⁻² e unità m/s². Nella stessa legge d²x/dt²=2k: uguale dimensione non implica uguale valore numerico di k e accelerazione.

Distrattori: Nel prodotto kt², m/s darebbe LT; m²/s² darebbe L², s²/m darebbe T⁴/L e m darebbe LT². Soltanto m/s² ricostruisce L.

Didattica: Dimensione corretta e fattore dinamico 2k distinti, senza identificare unità uguali con valori uguali.

Controllo distinto: AI_CONCEPTUAL, ok=True. Firma: 21cf4b0b71d7064efa79fbe0fb2b162194ecdfc922853ecc804a30f39c662122.

## C1-Q009

Ipotesi: Rapidità assegnata 1,25 m/s, da esprimere in km/h. Le definizioni 1 km=1000 m e 1 h=3600 s sono esatte; non cambia la rapidità fisica.

Procedura manuale: Il fattore di conversione da m/s a km/h è 3600/1000=18/5. Moltiplico 5/4 per 18/5: 9/2=4,5 km/h, stessa rapidità fisica in una diversa unità.

Distrattori: 0,45 e 45 introducono un fattore dieci; 5/4 copia il coefficiente precedente senza convertire e 25/72 divide per 18/5 invece di moltiplicare.

Didattica: Fattori di conversione con cancellazione delle unità e controllo del verso della conversione.

Controllo distinto: EXACT_ORACLE, ok=True. Firma: 5a4fd2406742afc73313623e1be805ce9c9887fc039eef4b8667a2bd57dda569.

## C1-Q010

Ipotesi: Due porzioni positive dello stesso liquido omogeneo, stessa composizione, temperatura e pressione. Stato identico e volume proporzionale alla massa: densità intensiva, senza cambiamenti di fase o composizione.

Procedura manuale: Stesso liquido omogeneo nello stesso stato termodinamico dà la stessa densità. Se la massa cresce di un fattore λ>0, il volume cresce dello stesso fattore e m/V resta invariato.

Distrattori: Le proporzioni diretta e inversa dalla sola massa omettono la variazione del volume. Masse diverse non impongono densità diverse e densità nulla contraddice massa positiva e volume finito.

Didattica: La maggiore quantità di campione cambia insieme massa e volume, non la densità allo stesso stato.

Controllo distinto: AI_CONCEPTUAL, ok=True. Firma: 07e0a4292d9a466d8264ea674b639ddde174f6ec7ebf1c4f9351c9e8e5059158.
