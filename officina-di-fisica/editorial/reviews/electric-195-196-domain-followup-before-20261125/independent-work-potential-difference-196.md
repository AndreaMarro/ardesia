# Revisione indipendente work-potential-difference-196

Primaria completa degli 80 prompt U6-01 letti e risolti prima di candidati, opzioni e chiavi: SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, copia byte-identica in u6-independent-195-199-fixtures-20261125/primary-source-only.md. Originale ROOT primary-electric-195-199-before-candidates-20261125.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, shard U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Nessuna esposizione alle chiavi U6 altrui prima della primaria; messaggi successivi di consegna limitati a SHA, file e ipotesi generali.

Successivamente ho letto integralmente e individualmente ogni campo dei sedici record finali: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie, confrontando i dati con la derivazione primaria. Sono stati letti tutto l’XML e il rendering nativo integrale dell’SVG effettivamente prodotto con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Il pin finale letto è 8f5df28d5865c6a832330b387bdcfc515d1bbfa1. La fixture è copia esatta dei byte Git e dell’asset verificato contro il payload; non sostituisce l’integrazione ROOT.

Riletti catalogo reale C4-L01/L02/L03/L04 e competenze richiamate: forze e campi distinti, campo prescritto vs induzione in conduttore, lavoro elettrostatico con segni e potenziale con riferimento comune. Per il lavoro/energia la competenza C1-L007 è pertinente; nessuna dipendenza da C1-L006 aggiunta. Ogni eccezione ha ipotesi individuali e non eredita tacitamente un ramo di segno opposto.

Gli oracoli SymPy derivano leggi, inverse, fattori, tarature e vincoli; Pint/Fraction controllano unità e prefissi esatti. Il decoder AST dedicato electric_exact_literals.py legge i lessemi numerici originali e non ricostruisce decimali da float binari. Il suo SHA256 è vincolato nel verificatore e riportato in ogni record, con rifiuto se cambia; nessuno dei decoder legacy o entropy_state_review è modificato. Nessun modulo autore importato o usato per ottenere le risposte.

## Prova individuale

### AR-u6-work-potential-difference-01

In elettrostatica U=qV e W_campo=−ΔU=q(V_A−V_B). Con carica positiva e caduta positiva il lavoro è positivo. μC·V=μJ:2·3=6 μJ.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: −6μJ èΔU_e,nonW;copie 2 o 3 ignorano prodotto;6 J perde micro.

Esito indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-02

Il lavoro è energia, dimensione M L² t⁻²: J o μJ sono compatibili. Volt è energia per carica, coulomb è carica; nessuna opzione è stata aperta.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: μC carica,V potenziale,N/C campo,W come unità è potenza;μJ energia.

Esito indipendente: μJ. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-work-potential-difference-03

La caduta definita è ΔV=V_A−V_B, quindi W=qΔV, non−qΔV. μC e volt danno direttamente μJ nei numeri. Il campo elettrostatico rende il lavoro indipendente dal cammino, fissati gli estremi.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: −qδ èΔU_e;quozienti q/δ eδ/q non sono energie;δ² aggiunge un volt.

Esito indipendente: W = q δ. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-work-potential-difference-04

A caduta 3 V, q da 2 a 1 μC dà W da 6 a 3 μJ. La variazione di energia potenziale è invece−W in ciascuna prova.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 12 inverte q;6 ignora cambio;1 copiaq_B;−3 èΔU_e e nonW.

Esito indipendente: Da 6 a 3 μJ. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-05

q=W/ΔV=6 μJ/(3 V)=2 μC. Divisione per caduta positiva, non per il potenziale assoluto di uno dei due punti.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: Wδ non ècarica;δ/W dàC⁻¹;segno meno estraneo alla caduta giàpositiva.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-06

ΔV=W/q=6 μJ/(2 μC)=3 V. La caduta è V_A−V_B; non va scambiata con V_B−V_A senza cambiare segno della legge.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: Micro nei due fattori del rapporto si cancella:3μV non è 3 V;−3 V èdifferenza finale−iniziale.

Esito indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-07

A:6 μJ. B:2 μC·1 V=2 μJ. Rapporto W_B/W_A=1/3.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 3 reciproco;1 ignora caduta;1/9 aggiunge quadrato;segno meno incompatibile conq,δ positivi.

Esito indipendente: 1/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-08

Caso autonomo dell’elettrone: q=−e, V_i=−2 kV e V_f=+3 kV. V_i−V_f=−5 kV, perciò W=(−e)(−5 kV)=+5 keV. Parte da fermo e lavora solo il campo: K_f=5 keV. L’energia potenziale diminuisce di 5 keV; non si usa il ramo di carica positiva del prefisso degli altri ID.

Ipotesi: Caso autonomo dell’elettrone q=−e, con e>0: parte da fermo a −2 kV e arriva a +3 kV sotto la sola forza elettrostatica. Il lavoro del campo è tutta la variazione di energia cinetica. Non si impongono qui q>0 o caduta positiva del modello comune. Energia richiesta in keV, senza inferire una velocità né usare una formula cinetica non relativistica.

Distrattori e controprove: −5 keV èΔU_e e nonK_f;1 keV sottrae i moduli 3−2;3 o 2 copiano un estremo.

Esito indipendente: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-09

Isolare q da W=qΔV dà q=W/ΔV. Con W>0 e ΔV>0 la carica risultante è positiva. Volt=J/C garantisce che J/V=C.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: W/δ dàC;Wδ introduceV;δ/W dàC⁻¹;W²/δ haJ C.

Esito indipendente: q = W/δ. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-work-potential-difference-10

W_B/W_A=(κ₁q·κ₂ΔV)/(qΔV)=κ₁κ₂. I fattori positivi conservano il verso della caduta e il segno del lavoro del ramo dichiarato.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: Quozienti invertono una dipendenza;somma dà 2 per prove uguali;quadratoδ non è nella legge.

Esito indipendente: κ₁ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-work-potential-difference-11

A=6 μJ; B=1 μC·5 V=5 μJ. Rapporto 5/6, con entrambi i cambiamenti inclusi.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 6/5 reciproco;1/2 segueq;5/3 segueδ;1 nonricostruisce 6 e 5μJ.

Esito indipendente: 5/6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-12

Media(6+5)/2=11/2 μJ. Ai dati medi q=3/2 μC e ΔV=4 V il prodotto dà 6 μJ, non 11/2: differenza−1/2 μJ.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 6μJ èmodello dei dati medi oA;11 non dimezza;1/2 èmetà differenza;5 copiaB.

Esito indipendente: 11/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-13

Bersaglio(5/6)·6=5 μJ. Con q_B=1 μC occorre ΔV_B=5 V, quindi rapporto con 3 V iniziali 5/3.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 3/5 reciproco;5/6 ignoraq dimezzata;2 dà 6μJ;5 copiaδ_B.

Esito indipendente: 5/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-14

Fattore strumentale 18/(6 μJ)=3 μJ⁻¹. Lettura 15 indica 5 μJ; con caduta 5 V segue q=1 μC.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 3μC usa D comeμJ;2μC dàD 30;5 copia lavoro senza dividerlo perδ.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-15

Riferimenti W_A=6 e W_B=5 μJ, letture 13 e 11: guadagno 2 μJ⁻¹, offset 1. Lettura 17 dà 8 μJ. Caduta 2 V: q_C=4 μC.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.

Distrattori e controprove: 17/4μC ometteb e prediceD 18;2,8,1μC prediconoD 9,33,5.

Esito indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-work-potential-difference-16

Vincolo numerico q=(2/3)ΔV, coefficiente fisico(2/3) μC/V. Misura 6 μJ impone 6=(2/3)ΔV², dunque ΔV²=9. Solo ΔV=3 V positivo, con q=2 μC; radice−3 viola entrambi i moduli positivi.

Ipotesi: Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Vincolo soltanto fra preparazioni, non legge temporale entro la singola prova.

Distrattori e controprove: −3 V dàq negativa;9 copiaquadrato;2 V dà 8/3μJ;6 V dà 24μJ.

Esito indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura, integrità e limiti

XML e PNG nativo integrale letti. Schemi di estremi con frecce di passaggio dichiarate schematiche, non traiettorie o campo uniforme. Primo pannello 3 V→0 V conq 2μC:ΔU−6μJ eW+6μJ, senza inferire automaticamenteΔK. Barre 6/5/11/2μJ larghezze 240/200/220, scala 40 coordinate/μJ e origine 130. Ultimo pannello elettrone−2 kV→+3 kV:K_i 0,K_f 5 keV e due segni negativi nel lavoro. Zeri ed etichette liberi.

Il rendering è asset-only. UI del prodotto e layout a 320 px NOT_RUN in questa review; nessun marker UI generato o copiato. L’approvazione umana rimane NOT_RUN, publication DRAFT e publicationAction NONE. Nessun candidato, registro, ledger, runtime o Git ROOT modificato.

Verifier SHA256 35c615e912a0bcea2b6c56659b868e020222eebc71dbd1758932a02d9bd7c86f. Decoder SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc. Package canonico SHA256 8bc362d4e7a672b7e45ee916402d5f10aed3c7347570324f784da274fc2494ed. Binding canonico SHA256 2d08c715c5f29796914534b39244ed2f0ace11e8157d92603d8b6dd4e3a6f490. Report SHA256 2cfc62f196cf389361756a8fcaf8a5782622b0c1fe2011c84e1d169365dc7f25.

## Controlli automatici effettivamente conclusi

Il test comune dei primi 32 ID è terminato con exit 0: 12 test in 1,822 s, 50 mutazioni dei pacchetti respinte e due guasti costitutivi rilevati. In 32 casi una chiave errata è stata provata con binding, token e pin di edizione aggiornati soltanto in memoria: il rifiuto deriva dagli oracoli matematici e non soltanto dagli hash. Sono state provate 200 configurazioni Hypothesis, identità canoniche dei report fresh e salvati, precisione lessicale dei decimali e rifiuto della deriva SHA del decoder. Nessuna suite completa o UI del prodotto eseguita localmente. Log autentico electric-195-196-independent-tests-20261125.txt.
