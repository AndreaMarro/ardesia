# Revisione distinta cric-c2-l009

Dieci problemi originali distinti. Primaria e modello pre-key congelati prima delle chiavi; nessun modulo autore B o primaria opposta aperti. Edizione finale confrontata byte per byte con Git. Lettura individuale completa; figura nuova controllata in XML e in un PNG indipendente intero.

Verdetti AI degli oracoli: 10/10. Il target comune effettivo è 19/19; non è una prova UI del prodotto né un’approvazione umana. Integrazione canonica Root ancora da eseguire.

## C2-Q081

Ipotesi e dominio: Tre resistenze assegnate nel modello lineare pressione-portata, senza rami e con liquido incomprimibile stazionario; Q comune 3/2 mL/s.

Calcolo e controllo manuale: Per tre resistenze lineari in serie, senza rami o accumulo, la portata è comune e le cadute si sommano. R_tot=2+5+1=8 kPa·s/mL; con Q=3/2 mL/s, Δp_tot=12 kPa. Le singole cadute sono 3,15/2 e 3/2 kPa. Il valore riguarda il modello Δp=R_hQ: quote o variazioni cinetiche aggiuntive non devono essere inserite tacitamente nel significato della pressione misurata.

Confronto delle risposte errate: Otto è R_eq, non Δp; dividere perQ altera le unità e il parallelo non descrive tre tratti senza diramazioni.

Verifica: EXACT_ORACLE; firma `5c8e641cbae33586359b7ed4b00d510eaa83e0736f791bd9c7d3ae36bb058cc2`.

## C2-Q082

Ipotesi e dominio: Quattro rami lineari identici fra la stessa coppia di nodi uniformi; resistenza positiva 20, somma delle conduttanze.

Calcolo e controllo manuale: Quattro rami identici hanno lo stesso salto di pressione e portate che si sommano: 1/R_eq=4/20, dunque R_eq=5 kPa·s/mL. Non si sommano le quattro resistenze, come si farebbe in serie. La legge lineare di ciascun ramo rende determinata la ripartizione.

Confronto delle risposte errate: 80 descrive serie;20 ignora tre rami.1/4 è rapporto rispetto al singolo ramo, non 5 nelle unità di resistenza.

Verifica: EXACT_ORACLE; firma `026661fa1d0e7dc9866dad56ce5749c79096ce40c512d470aefb2cf4e0a6d9ed`.

## C2-Q083

Ipotesi e dominio: Δp positiva fissata ai nodi e proprietà del ramo aperto invariate: non si controlla la portata totale.

Calcolo e controllo manuale: Con nodi mantenuti alla stessa differenza di pressione prima e dopo la chiusura, il ramo rimasto ha Q=Δp/R_h invariato. La portata totale invece perde il contributo del ramo chiuso. Se la pompa mantenesse la portata totale anziché Δp la conclusione cambierebbe: le condizioni al contorno sono parte essenziale del problema.

Confronto delle risposte errate: Ramo invariato vede stessi Δp/R; raddoppio richiederebbe più Δp. Totale ridotto non significa ramo aperto fermo.

Verifica: AI_CONCEPTUAL; firma `049a8591d61ad69c4531fb0ad462380fe0bc595231427013d0c6bb1bcb2a09a7`.

## C2-Q084

Ipotesi e dominio: Q totale 8 mL/s imposta prima e dopo; due ramiR>0 iniziali poi uno chiuso, la sorgente può aumentare Δp.

Calcolo e controllo manuale: Prima i due rami identici dividono gli 8 mL/s in 4 ciascuno, con resistenza equivalente R/2. Dopo resta un ramo e la pompa impone ancora 8: resistenza equivalente R. Quindi il salto di pressione raddoppia. La portata totale non raddoppia; raddoppia quella dell’unico ramo rimasto rispetto a prima.

Confronto delle risposte errate: A Q totale imposta, R_eq passaR/2 → R. Non si riusa il risultato a Δp fissata e non compare una legge quadratica.

Verifica: AI_CONCEPTUAL; firma `776d7ff64b4f3b6c591fef46345b0e84e78749d577b989c87fe80f50cd38dbd5`.

## C2-Q085

Ipotesi e dominio: Un tratto comune 2 in serie con 6||6, tutti kPa·s/mL;20 kPa sull’intera rete e portata iniziale totale, non portata di ramo.

Calcolo e controllo manuale: Calcolo prima il parallelo: due resistenze 6 danno 3 kPa·s/mL. In serie col tratto iniziale 2, R_tot=5 kPa·s/mL. Con 20 kPa, Q_tot=20/5=4 mL/s e questa stessa portata attraversa il tratto iniziale; ogni ramo finale ne prende 2. Controllo:8 kPa nel primo tratto e 12 nel parallelo sommano 20.

Confronto delle risposte errate: 14 è la somma in serie errata, che darebbe 20/14;10 ignora il blocco e 2 è la portata di ciascun ramo, non iniziale.

Verifica: EXACT_ORACLE; firma `ad8c14d8a46c51a37e028f8bc5358402f3d75fec7b4c83c92ee86e741e448c29`.

## C2-Q086

Ipotesi e dominio: La topologia è fissata da entrambi gli estremi A/B dei due rami. Il pannello è uno schema di connessione, non una quota fisica.

Calcolo e controllo manuale: Dal solo testo, entrambi i condotti collegano il medesimo nodo A al medesimo nodo B: sono in parallelo, qualunque sia la forma del disegno. Hanno comune differenza di pressione, non necessariamente uguale portata se le resistenze sono diverse. La figura originale non è stata aperta nella primaria; la sua effettiva coerenza andrà letta nella revisione successiva.

Confronto delle risposte errate: Sopra/sotto sul foglio non decide serie. Raggi o resistenze uguali non sono condizioni necessarie della topologia parallela.

Verifica: AI_CONCEPTUAL; firma `b2f5acf0b582b4b61fd7745dab08097c7a4c098894f785e565b3ae94144b6559`.

## C2-Q087

Ipotesi e dominio: R_eq 3 eR₁ 4 nelle stesse unità: R_eq<R₁ garantisce conduttanza residua eR₂ strettamente positive.

Calcolo e controllo manuale: Per il parallelo 1/R_eq=1/R_1+1/R_2. Il residuo è 1/3−1/4=1/12, quindi R_2=12 kPa·s/mL. Il ramo passivo richiede R_eq<R_1;3<4 soddisfa il dominio. Controllo:4·12/(4+12)=48/16=3.

Confronto delle risposte errate: 1 e 7 sono differenza/somma delle resistenze. Con 12 si verifica 4·12/(4+12)=3;4/3 e 3/4 falliscono quel vincolo.

Verifica: EXACT_ORACLE; firma `c70895f633a26a472bd2ac93967678f555159deca9b92b2cc1c32af3b2c6e2fa`.

## C2-Q088

Ipotesi e dominio: Regime lineare positivo:Δp non nulla permetteQ/Δp; il coefficiente reciproco diR_h è additivo in parallelo.

Calcolo e controllo manuale: G è la conduttanza idraulica, reciproco della resistenza, con unità SI m³/(Pa·s). Nei rami paralleli Q_tot=ΣG_i Δp, perciò G_tot=ΣG_i. Il rapporto misurato Q/Δp richiede Δp non nullo; a pressione nulla la conduttanza del modello lineare si definisce come coefficiente, non ricavando 0/0.

Confronto delle risposte errate: Resistenza è inversa della conduttanza; viscosità non contiene la geometria, potenza è un prodotto e densità riguarda massa/volume.

Verifica: AI_CONCEPTUAL; firma `2631bc5b8318325c76a64a50b0a9ec8c1d5e0a6eb62d32785a700c25580298db`.

## C2-Q089

Ipotesi e dominio: Portata positiva esplicita, liquido incomprimibile senza accumuli/diramazioni; resistenzeR e 2 R e confronto di cadute.

Calcolo e controllo manuale: In serie la portata è comune e, per flusso non nullo, il segmento con resistenza doppia ha caduta doppia in modulo: Δp=Q R_h. Non ha una portata diversa dal segmento in serie. Se Q=0 entrambe le cadute sono nulle e non c’è una maggiore caduta: la futura candidata deve rendere chiaro il ramo di scorrimento effettivo.

Confronto delle risposte errate: StessaQ conR doppia implica Δp doppia. Cadute uguali riguardano parallelo; una caduta minore qui violerebbe il rapportoR.

Verifica: AI_CONCEPTUAL; firma `58b1e863febbfb63946fc3147721c22a68ed8497ad43c11674776b455fee7a57`.

## C2-Q090

Ipotesi e dominio: Raggi r>0 e 2 r, stessaL/η e caduta positiva; tutti i rami restano di Poiseuille. Si normalizza con il totale di 17 contributi.

Calcolo e controllo manuale: A Δp, η, L comuni, Poiseuille dà Q∝r⁴. Il ramo largo di raggio 2 r porta 16 volte quello stretto. La portata totale è 17 volte quella stretta, dunque la frazione chiesta è 1/17. Un sedicesimo è il rapporto stretto/largo, non stretto/totale.

Confronto delle risposte errate: 1/16 confronta i rami, non il totale;1/5 usa area invece di r⁴;1/2 richiederebbe identità e 16/17 appartiene al ramo largo.

Verifica: EXACT_ORACLE; firma `d516f3f67f951bc7a824cc4f3fd960a4dd3f85cb50632787b0013c422b6e4e5a`.
