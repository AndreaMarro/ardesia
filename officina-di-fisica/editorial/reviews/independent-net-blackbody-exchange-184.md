# Revisione indipendente net-blackbody-exchange-184

Primaria completa degli 80 prompt originali U5-04 salvata prima di candidati, opzioni o chiavi: primary-thermal-transport-183-187-before-candidates-20261125.md, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. I messaggi di consegna hanno anticipato soltanto SHA, percorsi e ipotesi generali, senza risultati. Nessun modulo d’autore importato o usato per le derivazioni.

Poi sono stati letti individualmente tutti i 16 prompt finali, tutte le opzioni, ogni blocco, formula, hint, feedback, metadato e didascalia. Le leggi, i numeri e i domini finali sono stati ricalcolati separatamente. Package e binding ROOT sono byte-identici al pin finale B 9a91216d48df3b948e601e9fb06c7c4a70919973; non si congela una versione precedente. Il catalogo reale C3-L01/L05/L06/L09/L10 è stato riletto: scala assoluta per radiazione ed entropia, vie di trasferimento e distinzione fra variazione di una parte e produzione totale. La competenza primaria effettiva è C3-L05.

Gli oracoli derivano le leggi e le inverse con SymPy, verificano unità con Pint/Fraction e mantengono calcoli razionali esatti. La quarta e quinta radice dei casi numerici si riconoscono tramite potenze intere perfette; nessuna valutazione a calcolatrice o approssimazione logaritmica è necessaria. Le alternative simboliche sono confrontate come leggi generali: una coincidenza per parametri particolari non rende corretta una falsa legge. Non si attribuisce PASS dalla sola chiave o da dichiarazioni dell’autore.

## Lettura e prova individuale

### AR-u5-net-blackbody-exchange-01

σ·1 m²·(100 K)⁴=6 W. P_net=6(θ_s⁴−θ_a⁴) W. Con 3 e 1: 6(81−1)=480 W, positivi dal corpo caldo al grande ambiente.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 486 W è sola emissione,6 assorbimento,492 somma dei moduli,0 non rispetta temperature diverse.

Esito indipendente esatto: 480. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-02

La differenza fra potenze è una potenza in W, dimensione M L² t⁻³; un’energia J richiederebbe integrazione nel tempo. Nessuna opzione ancora letta. Le alternative candidate sono state poi lette integralmente: unica unità compatibile W.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: J è energia, K temperatura, W/m² intensità, J/K altra dimensione.

Esito indipendente esatto: W. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u5-net-blackbody-exchange-03

Caso distinto: a T_s=T_a=T>0 emissione e assorbimento sono entrambe σAT⁴>0, uguali. Solo la potenza netta è zero. Equilibrio non significa arresto dei due flussi radiativi.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Equilibrio ammette due flussi uguali non nulli; due flussi nulli violano σAT⁴ con T>0.

Esito indipendente esatto: Emissione e assorbimento sono uguali e positivi; il saldo è zero. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-net-blackbody-exchange-04

θ_a=1 fissa: θ_s=3 dà 480 W; θ_s=4 dà 6(256−1)=1530 W. Rapporto 1530/480=51/16, non (4/3)⁴ perché si sottrae l’ambiente.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 1536 W dimentica l’assorbimento6 W; il solo fattore(4/3)⁴ non scala la differenza.

Esito indipendente esatto: Da 480 a 1530 W. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-05

480/6+1⁴=80+1=81=3⁴. Radice quarta positiva θ_s=3; in generale θ_s=(P_net/(6 W)+θ_a⁴)^(1/4)>θ_a.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 80 è differenza delle quarte potenze; aggiungere1 dà81 prima della radice.

Esito indipendente esatto: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-06

θ_a⁴=3⁴−480/6=81−80=1. θ_a=1>0. L’inversa richiede 0<P_net<6θ_s⁴ W per conservare ambiente positivo e più freddo.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Ambiente positivo richiede0<P<6θ_s⁴ W; uguaglianza darebbe temperatura zero esclusa.

Esito indipendente esatto: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-07

A=6(81−1)=480 W. B con θ_a=2 dà 6(81−16)=390 W. Rapporto 390/480=13/16, diminuendo la cessione netta.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 16/13 è reciproco;1 ignora assorbimento cresciuto;13/16 risulta da390/480.

Esito indipendente esatto: 13/16. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-08

Proposta 960 W meno corretto 480 W: +480 W. Il segno dello scarto non è un’inversione del flusso reale.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: −480 inverte differenza;960 copia proposta;0 accetta errore;2 è rapporto senzaW.

Esito indipendente esatto: 480. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-09

Da P_net/(6 W)=θ_s⁴−θ_a⁴, si aggiunge θ_a⁴ e si estrae la radice quarta positiva. In unità fisiche T_s=[P_net/(σA)+T_a⁴]^(1/4).

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Si aggiunge θ_a⁴, poi radice quarta; sottrarre ambiente o omettere radice non è inversa.

Esito indipendente esatto: θ_s = (p + θ_a⁴)^(1/4). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-net-blackbody-exchange-10

Rapporto [κ₁⁴θ_s⁴−κ₂⁴θ_a⁴]/[θ_s⁴−θ_a⁴]. Le due prove richiedono θ_s>θ_a>0 e κ₁θ_s>κ₂θ_a>0; il denominatore è positivo. Nel candidato sono esplicitamente definiti u=θ_s,A⁴ e v=θ_a,A⁴.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: I pesi u,v restano: semplici quozienti dei κ non ricostruiscono la differenza delle emissioni.

Esito indipendente esatto: (κ₁⁴ u − κ₂⁴ v)/(u − v). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-net-blackbody-exchange-11

A=480 W. B con θ_s=4, θ_a=2 dà 6(256−16)=1440 W. Rapporto B/A=3.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 81/16 non è rapporto netto;3 segue1440/480;1/3 è reciproco.

Esito indipendente esatto: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-12

Media (480+1440)/2=960 W. Alle temperature medie θ_s=7/2 e θ_a=3/2: 6(2401−81)/16=870 W, diversa dalla media delle uscite di 90 W.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 870 W usa temperature medie;1920 non dimezza;480 e1440 ignorano una prova.

Esito indipendente esatto: 960. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-13

Target 3·480=1440 W a θ_s=4: θ_a⁴=256−1440/6=16=2⁴. θ_a,B=2 e rapporto con 1 pari a 2; ancora 4>2>0.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Rapporto2 di temperatura ambiente è diverso dal rapporto3 della potenza; il reciproco sbaglia ordine.

Esito indipendente esatto: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-14

Guadagno da 1440/480=3 W⁻¹. Lettura 4320 dà P=1440 W; con θ_a=2, θ_s⁴=1440/6+16=256=4⁴, θ_s=4.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Display4320/q3=1440 W, poi240+16=256:4⁴. Usare display comeW non dà la misura.

Esito indipendente esatto: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-15

a=(2881−961)/(1440−480)=1920/960=2 W⁻¹; b=1. S_C=3061 dà P_C=1530 W. θ_a=1 implica θ_s⁴=255+1=256, θ_s=4.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 3061/2 senza b dà1530,5 W e θ⁴=256+1/12;4 predice3061 solo con b=1.

Esito indipendente esatto: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-net-blackbody-exchange-16

Vincolo θ_s=3θ_a dà P_net=6(81−1)θ_a⁴=480θ_a⁴ W. A 480 W: θ_a⁴=1, quindi θ_a=1>0 unico e θ_s=3. Caso diverso dall’equilibrio del record03.

Ipotesi: Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.

Distrattori e controprove: −1 viola temperatura assoluta;3 e80 non soddisfano θ_a⁴=1; il vincolo non elimina la scala dalla potenza.

Esito indipendente esatto: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti delle prove

XML e PNG nativo integrale letti. Frecce entrante6W e uscente486W schematiche esplicitamente non confrontabili per lunghezza. Barre emissione/assorbimento/netto486/6/480W con larghezze1701/5,21/5,336 a stessa scala7/10; finali480/1440/960W larghezze120/360/240 scala1/4. Origini comuni, zeri chiari. L’equilibrio03 è distinto dalla scena300/100K.

Cinque rendering nativi Quick Look realmente terminati con exit 0, sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB; PNG integrali letti, XML e log conservati. Queste sono prove asset-only, non un replay del prodotto o del layout a 320 px. Tutta UI del prodotto rimane NOT_RUN in questo perimetro; nessun marker inventato o riusato. Nessuna modifica a candidati, runtime, registro, checkpoint o Git ROOT.

## Provenienza congelata

Verifier SHA256 c4a0632a0c7d6a6f73242c3b93b6d2ac2d2e8eb5965c56cee3d4f2ac824cadd6. Package canonico SHA256 910d632ddde6aafda180538285ee2d083729aee4df986b7d344032510995a9e0. Binding canonico SHA256 4caaf0bc44fb8be62eb4b2974c74e7ed053525bd0caf5328707941d76899e3f5. Report SHA256 c2ae8d7a0870bbbfa303440e29b78dcbf8663359cd742f41ce9ea9269be86580.

Review AI distinta dall’autore; human NOT_RUN; publication DRAFT; publicationAction NONE. Nessuna nuova integrazione o pubblicazione attribuita.

## Controlli automatici distinti conclusi

Il test comune indipendente è terminato realmente con exit 0: 13 test in 3,763 s. Sono state respinte 125 mutazioni dei pacchetti, di cui 80 risposte errate con binding, token e pin sostituiti soltanto in memoria per isolare gli oracoli matematici; respinti anche cinque guasti alle funzioni costitutive. Sono state provate 240 configurazioni Hypothesis e le identità canoniche dei report fresh e salvati di tutti gli 80 record. Log autentico conservato in thermal-entropy-183-187-independent-tests-20261125.txt. Tutta la suite del corpus e la UI del prodotto sono fuori da questa prova locale.
