# Revisione indipendente cric-c2-l002

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in 9dc54dba, SHA 34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; modello realmente eseguito prima dei candidati in e37686ebab9f1ac50919592f189ab8cf7f37184f, SHA 02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali 83b8639f9f0796f680c2266f1f8b5a6fbbf1f440 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C2-L002 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML finale e nuovo PNG indipendente 640×1490 letti integralmente. Primo profilo: pressione da 0 a 2000 Pa in 300 coordinate, profondità 0,20 m in 210 coordinate; media 1000 Pa su area 0,08 m² dà 80 N. Non è localizzata la risultante al punto medio. Manometro: triangolo con cateti 346,4101615 e 200, ipotenusa 400 per 0,50 m; verticale 200 per 0,25 m. Arco corretto centrato(140,850), raggio 100, inizio(240,850), fine(226,60254,800), angolo 30°. Terzo grafico: 360 coordinate per 0,50 m e 240 per 4,5 kPa, pendenza 9 kPa/m, densità 900 kg/m³. Vecchio arco negativo preservato; nessun taglio o contatto residuo.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C2-Q011

Ipotesi: Acqua omogenea fermaρ1000 kg/m³, g 10 m/s²; incremento 4 kPa rispetto alla superficie, non pressione assoluta.

Derivazione manuale: Dall’incremento idrostatico Δp=ρgh isolo h=4000/(1000·10)=2/5 m=0,40 m. Conta la differenza rispetto alla superficie, quindi non serve assegnare p superficiale.

Distrattori: 4 m e 0,04 m cambiano fattore 10; 40 m e 400 m darebbero 400 e 4000 kPa.4 Pa invece di 4 kPa produrrebbe 0,0004 m.

Didattica: Inversa della differenza idrostatica senza aggiungere atmosfera.

Modalità distinta: EXACT_ORACLE; esito True. Firma 24b821333fc219518d1d66bb0b6f13c13c4328b08dfe1a5635807bc2ddbcc61f.

## C2-Q012

Ipotesi: Stesso liquido connesso in quiete, due recipienti aperti alla stessa atmosfera, capillarità esclusa.

Derivazione manuale: Stesso liquido collegato in quiete e uguale pressione atmosferica sulle superfici libere: alla stessa quota la pressione deve essere uguale. Trascurando capillarità, le superfici hanno la stessa quota, indipendentemente dalle larghezze.

Distrattori: Aree e volumi non sostituiscono l’uguaglianza di pressione alla base; un dislivello non capillare produrrebbe un flusso prima dell’equilibrio.

Didattica: Pressioni alla stessa quota prima del confronto dei livelli.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 96dd1e45eb58fd80f1dbc70400ac78c304fe387efafb25b82f5f8f89f8411a0f.

## C2-Q013

Ipotesi: Mercurioρ13600 kg/m³, colonna 0,740 m, pressione superiore trascurabile, g 9,81 m/s²; risposta proposta arrotondata a 0,1 kPa dopo prodotto esatto.

Derivazione manuale: Con pressione superiore trascurabile p_atm=ρgh=13600·(74/100)·(981/100) Pa=98727,84 Pa=98,72784 kPa. Una stima coerente è circa 99 kPa, oppure 98,7 kPa a tre cifre. Il prodotto può essere eseguito con interi, senza introdurre una diversa altezza o omettere la pressione sopra la colonna. Il verificatore mantiene il prodotto razionale 617049/6250 kPa e controlla l’arrotondamento al decimo con confronti esatti, senza usare float.

Distrattori: 9,87 e 987 kPa spostano una potenza 10; 100,6 deriva da g 10 anziché 9,81; 0,740 copia altezza numerica senzaρg. Il valore esatto 98,72784 cade nell’intervallo che arrotonda a 98,7 kPa.

Didattica: Prodotto intero manuale e arrotondamento finale controllato con limiti esatti.

Modalità distinta: EXACT_ORACLE; esito True. Firma 7f821a6ebdcffc70b8f9d2800138aade7662eebf77a09bb1192e05edece11af4.

## C2-Q014

Ipotesi: Quota crescente di h>0, densità e g uniformi; variazione finale meno iniziale, non modulo della diminuzione.

Derivazione manuale: Risale di h significa aumento di quota: in un liquido omogeneo Δp=−ρgh. La pressione diminuisce, restando distinta dal modulo positivo della differenza; la legge richiede densità e g costanti sul tratto o l’integrale appropriato.

Distrattori: +ρgh descrive il verso opposto; zero richiede h 0; ρg/h eρgh² hanno dimensioni diverse da pressione.

Didattica: Verso della quota prima del segno della pressione.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 5b5801cebc0fa5259781fd9bcf08b81a5f865b6ed853a27ab4ff119689e14c94.

## C2-Q015

Ipotesi: Sportello verticale b 0,40 m, H 0,20 m; superficie d’acqua al bordo superiore, stessa atmosfera sull’altro lato, ρ1000, g 10.

Derivazione manuale: Le pressioni atmosferiche sui due lati si cancellano. La sovrapressione cresce linearmente da 0 al bordo alto aρgH al bordo basso; la media èρgH/2=1000 Pa. Area 0,40·0,20=0,08 m², forza netta 80 N. Equivale all’integrale ρgbH²/2.

Distrattori: 160 N usa pressione massima uniforme; zero considera il solo bordo alto; 800 N introduce fattore 10; 2000 N copia il numero dei pascal senza area.

Didattica: Integrale lineare o media triangolare, senza assegnare erroneamente la posizione della risultante.

Modalità distinta: EXACT_ORACLE; esito True. Firma 68917da94cd861d98e22dc83e36ea177e5426135567edaa97558cab03743cc75.

## C2-Q016

Ipotesi: Due livelli in liquido fermo, densità costante e capillarità trascurata; dislivello verticale, non lunghezza obliqua.

Derivazione manuale: Nella legge idrostatica entra il dislivello verticale fra le interfacce, non la lunghezza lungo il tubo inclinato. Se il tubo forma α con l’orizzontale, h=L sinα.

Distrattori: Tutta la lunghezza è altezza solo per tubo verticale; proiezione orizzontale, diametro e loro somme non sono dislivello lungo gravità.

Didattica: Proiezione verticale distinta dalla forma del tubo.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 738fb35fcc0bb2d4cbe4c329a063ea9b3804bace1010b733f11ac11dc998a992.

## C2-Q017

Ipotesi: Lunghezza obliqua 0,50 m a 30° dall’orizzontale, densità 800, g 10; si chiede modulo inPa, non il segno orientato.

Derivazione manuale: Il dislivello verticale è 0,50 sin 30°=0,25 m. Quindi |Δp|=800·10·0,25=2000 Pa=2 kPa. Usare 0,50 m come h raddoppierebbe impropriamente il risultato. La nuova risposta è in pascal: 2 kPa=2000 Pa, con conversione esatta del coefficiente del modello pre-key.

Distrattori: 4000 Pa omette sin 30°; 1000 Pa applica due volte 1/2; 20 Pa perde fattore 100; 800 Pa copia il coefficiente della densità senza g h.

Didattica: Seno notevole esatto e modulo esplicito.

Modalità distinta: EXACT_ORACLE; esito True. Firma ffbc275777336cdff98d9177188cb54da3cd8c239b78d96187b3c15279100a68.

## C2-Q018

Ipotesi: Recipienti separati, stesso liquido modellato con densità uniforme comune, stessa profondità e g, pressioni dei gas superiori diverse.

Derivazione manuale: A stessa profondità nello stesso liquido, ciascuna pressione è p_s+ρgh. La pressione del gas superficiale maggiore si ritrova come uguale differenza positiva fra le pressioni al fondo; le due pressioni di fondo non sono uguali per il solo h uguale.

Distrattori: Uguale h dà uguali incrementi, non uguale pressione assoluta con riferimenti diversi; aggiungere stessoρgh non conserva in generale un rapporto.

Didattica: Differenze e rapporti di pressioni distinti.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma b23e73dd3f45b8335bba4744987c53d8344e8ac01dbfb2c3586837953c79a34c.

## C2-Q019

Ipotesi: Incremento 4500 Pa per 0,50 m di profondità, g 10 m/s², densità uniforme; pendenza, non intercetta.

Derivazione manuale: La pendenza Δp/Δh èρg. Con 4500 Pa in 0,50 m ricavoρ=4500/(10·0,50)=900 kg/m³. La pressione superficiale influenza l’intercetta, non questa pendenza.

Distrattori: 9000 non divide per g; 450 non divide per 0,50 m; 0,9 interpreta kPa comePa; 2250 kg/m³ darebbe 11250 Pa, non 4500.

Didattica: Pendenza depurata dall’intercetta prima di dividere per g.

Modalità distinta: EXACT_ORACLE; esito True. Firma ca3e98cbd7f45c45e1a8196640ef5c359a6f9925a039b537ae8b170c2bca5e5a.

## C2-Q020

Ipotesi: Stesso barometro e atmosfera, gas superiore con 0<p_g<p_atm, ρ e g invariati; colonna positiva confrontata col vuoto superiore.

Derivazione manuale: Con gas residuo p_atm=p_gas+ρgh. A p_atm eρg uguali, h=(p_atm−p_gas)/(ρg) è minore dell’altezza con vuoto superiore. Non si aggiunge p_gas alla colonna disponibile.

Distrattori: Sommare p_g all’atmosfera inverte il suo ruolo superiore; altezza non uguale né raddoppiata universalmente; dominio 0<p_g<p_atm esclude altezze negative.

Didattica: Dominio del gas residuo esplicito prima di confrontare altezze.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma bcfde8efaa0cade5678f441d108879955de4d8c4dda6f70fd94e4c5b6e5692bc.
