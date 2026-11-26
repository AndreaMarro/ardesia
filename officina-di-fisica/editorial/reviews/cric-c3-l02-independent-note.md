# Revisione indipendente cric-c3-l02

Dieci problemi distinti, risolti prima delle candidate nella primaria C3 A50 commit030d4658, SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80. Modello realmente eseguito prima dei candidati, SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti10 record finali 589b36b3556dcd2c57d5299e705ea25dbe4794e8 letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C3-L02 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

XML e nuovo PNG indipendente 640×1500 letti per intero. Barre p da origine 140 con 320/240 coordinate per 160/120 kPa: scala comune 2 coordinate/kPa. Barre V da origine 140 con 252/294 per 1,80/2,10 L: scala 140 coordinate/L. Diagramma normalizzato: origine(140,1420),T/T*=2 a x 480; p/p*=2 a y 1140 perV e 1 a y 1280 per 2 V. I due coefficienti angolari sono in rapporto 2. Etichette fuori dai tratti, nessun taglio residuo.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Intervalli in kelvin e letture Celsius sono distinti: il confronto di opzioni equivalenti applica l’offset soltanto alle temperature assolute, non agli intervalli. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C3-Q011

Ipotesi: Gas ideale in recipiente rigido; stessi T e V nei due stati, perdita di moli e pressioni assolute 160/120 kPa.

Derivazione: A volume e temperatura fissati, per gas ideale n è proporzionale alla pressione assoluta. Resta n_f/n_i=120/160=3/4; la frazione uscita è 1/4, cioè 25%. La massa specifica del gas non occorre al rapporto fra moli.

Distrattori: 75% è residuo; 40 kPa deve essere confrontato con 160 iniziali; conservare n contraddice la perdita.

Didattica: Frazione uscita distinta dalla residua.

Modalità: EXACT_ORACLE; esito True; firma f9f4010e2c99fe44610d5e5379ac60dcd8929bf9cf5419b6b31bf652c616e3cf.

## C3-Q012

Ipotesi: Gas ideali diversi con stessi p,V,T e costante R universale; masse molari non vincolate uguali.

Derivazione: Da n=pV/(RT), gli stessi valori di p, V e T implicano lo stesso numero di moli e quindi di molecole. Non implicano la stessa massa, perché le masse molari possono essere diverse.

Distrattori: Masse,densità e U dipendono anche dalla specie; n e numero di particelle sono uguali.

Didattica: Quantità di sostanza distinta dalla massa.

Modalità: AI_CONCEPTUAL; esito True; firma 2ef7f8aac02e91c2cb64162fbc77a4593432f46fb5f8656bb344b41aa7a1e226.

## C3-Q013

Ipotesi: Gas chiuso, stessa pressione assoluta positiva, T 270→315 K e V iniziale 1,80 L.

Derivazione: Con gas chiuso ideale a pressione costante, V/T è costante. V_f=(9/5 L)(315/270)=21/10 L=2,10 L. Si impiegano temperature assolute, non letture Celsius.

Distrattori: 54/35 L usa rapportoT inverso; 1,8 L ignora ΔT; 46,8 somma lettura termica e volume; 0,3 L omette fattore 7.

Didattica: Proporzione diretta V/T con dati assoluti.

Modalità: EXACT_ORACLE; esito True; firma 007d6de2e6fc639b024c06f3cfd796aef83dd80099c754bc1d94e27e0e46b27b.

## C3-Q014

Ipotesi: Sensore azzerato all’atmosfera locale; pressione assoluta ottenuta sommando il riferimento.

Derivazione: La pressione ottenuta è assoluta: p_ass=p_rel+p_atm quando la lettura relativa è stata azzerata all’atmosfera. È quella da usare nell’equazione di stato.

Distrattori: Relativa è prima della somma, tangenziale non è origine della scala, divisione per n non produce p assoluta.

Didattica: Riferimento atmosferico distinto dallo zero nel vuoto.

Modalità: AI_CONCEPTUAL; esito True; firma 7a16891b8a703a57d7464827e7f6d412f38b77f54c69ffc732b35f600768769b.

## C3-Q015

Ipotesi: R assegnata esattamente 8,314 J/(molK),n 1/4 mol,pV 620 J.

Derivazione: Con kPa e litri il prodotto è già in joule: pV=100·6,20=620 J. nR=(1/4)(4157/500)=4157/2000 J/K. Quindi T=1240000/4157 K. È una frazione esatta, circa 298 K solo se si desidera un’approssimazione successiva; senza istruzione di arrotondamento non si pretende un intero esatto.

Distrattori: 620/4157 perde 2000; 1240000/8314 dimezza; reciproco non ricostruisce pV; 310 K userebbe R 8, non 8,314.

Didattica: Frazione esatta mantenuta senza divisione decimale lunga.

Modalità: EXACT_ORACLE; esito True; firma c73fc93852af6f99e051df07ae173406f96adfcead7f117a51768c6952186b42.

## C3-Q016

Ipotesi: Modello ideale confrontato con gas reale denso vicino alla condensazione, non errore di unità.

Derivazione: Il modello ideale richiede cautela a densità elevata o vicino alla condensazione, dove volume molecolare e interazioni non sono trascurabili. Senza opzioni non si sceglie uno stato numerico specifico; alte temperature e basse densità tendono invece a favorire l’approssimazione.

Distrattori: Diluizione favorisce modello; Pa,K,mol sono unità corrette, non cause di non idealità.

Didattica: Limiti fisici distinti dalla coerenza delle unità.

Modalità: AI_CONCEPTUAL; esito True; firma d3eed67c2fa7cbb1d4cfffb7b4c05ba2e77465ff6bf70b75380e1317fa479184.

## C3-Q017

Ipotesi: Quantità e composizione fisse,p 90 kPa,V 2→3 L,T 270→360 K.

Derivazione: Per n costante, p_f=p_i(V_i/V_f)(T_f/T_i). Il fattore è (2/3)(360/270)=8/9, perciò 90·8/9=80 kPa. Variazioni di volume e temperatura agiscono in versi opposti qui.

Distrattori: 120 kPa soloT,60 soloV,180 usaVf/Vi invece diVi/Vf; il risultato 80 combina entrambi.

Didattica: Effetti opposti di volume e temperatura combinati.

Modalità: EXACT_ORACLE; esito True; firma b0f4b7b751002a07ea86f4b18f4f6d3e55f29def25276174d86b356a7da1a682.

## C3-Q018

Ipotesi: Rapporto pV/T per gas perfetto,n positivo e temperatura assoluta.

Derivazione: La costante richiesta è R, costante universale dei gas. pV/T=nR usa pressione assoluta e temperatura termodinamica.

Distrattori: g,c,σ,λ non sono la costante universale richiesta; R distinta dalla massa molare.

Didattica: Costante universale distinta da proprietà della specie.

Modalità: AI_CONCEPTUAL; esito True; firma 20d565a4b93326f0616af6d1584085ff6d9847cd7302db2984d7760828c45fed.

## C3-Q019

Ipotesi: Stesse moli positive a V>0 e 2 V; grafico p assoluta contro Kelvin.

Derivazione: La legge è p=(nR/V)T. A volume V la pendenza è doppia rispetto a 2 V, con le stesse moli; entrambe le rette ideali passano per l’origine del diagramma in kelvin.

Distrattori: V doppio dimezza coefficiente nR/V; cambio origine Celsius modifica intercetta, non rapporto delle pendenze.

Didattica: Pendenza con origine Kelvin e volumi distinti.

Modalità: AI_CONCEPTUAL; esito True; firma edc9c262e73f25a7f5ff89af09c878278cfd26ca4a44d5fbf8e9378b07f984a8.

## C3-Q020

Ipotesi: Gas ideale con p 100000 Pa,M 0,0280 kg/mol,T 300 K e R 8,314 assegnata.

Derivazione: Eliminando n con n=m/M ottengo ρ=pM/(RT). pM=100000·(7/250)=2800 in unità SI; RT=300·(4157/500)=12471/5. Ne segue ρ=14000/12471 kg/m³, frazione esatta. Non si usa la massa molare in grammi senza convertire.

Distrattori: 14/12471 omette kPa→Pa; 14000000/12471 usa 28 kg/mol anziché 0,028; reciproco e 28 non danno densità corretta.

Didattica: Massa molare in SI e controllo fra 1 e 6/5 kg/m³.

Modalità: EXACT_ORACLE; esito True; firma 234175d7b8b4e38521bcdf46c53cebdbb2c939bbbc9b069de81eb466027f0c5a.
