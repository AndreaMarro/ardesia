# Revisione indipendente dielectric-connected-charge-226

Tutti gli 80 prompt originali U6-04 B225–229 sono stati letti e risolti individualmente prima dei candidati, tramite allowlist id/prompt dal pin Git. Primaria SHA256 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, commit47cb9cbefc0def9db276d2ba106e3f2491b60e7f: copia immutata nella fixture. Nessuna opzione, chiave, solutionSteps, hint o modulo autore B era stato aperto. Nessuna primaria B è stata letta. Fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json, file SHA256179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf.

Dopo la consegna iniziale di tutti gli 80 A220–224, durante la pausa per spazio insufficiente, ho letto tutti gli 80 prompt finali B tramite la sola allowlist id/prompt. I dati corrispondevano alla primaria. Ho poi scritto ed eseguito realmente i modelli prima di aprire le chiavi: model-run-1.json registra exit0, 80 derivazioni e 79.2844342909957 secondi, codice SHA25642da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. La successiva correzione A22415 riguardava soltanto parentesi; nessuna chiave B era aperta durante quel fix. L’ulteriore correzione di metadata A220–224 a C4-L08 è stata fatta dopo la lettura B, ma non ha mutato leggi, scelte, numeri o asset A. Non viene attribuita alla primaria manuale la data della successiva preparazione del modello.

Solo dopo ho letto integralmente tutti i record finali B: prompt, tutte e cinque le alternative, risposta proposta, ciascun blocco e formula, hint, feedback, metadati, didascalie, source binding e asset. Edizione effettivamente letta 0e189e8a589fd53f025fd2c84980407db30a339b. Nessun modulo autore è stato importato. I risultati sono derivati da Q=CV, capacità geometrica, energia Q²/(2C), carica libera isolata o generatore ideale, e forza vettoriale di Lorentz. Le lezioni reali C4-L07, C4-L08 e C4-L09 sono state rilette nel pin Cric5d1d: L07 tratta proprio il singolo condensatore e il dielettrico, L08 le reti distinte, L09 Lorentz. Pertanto225–228 restano correttamente L07 e229 L09.

Tutti i dati numerici sono esatti, reali e finiti prima dell’aritmetica; denominatori non nulli, κ≥1 e s≥1 anche nelle inverse. I fattori di confronto possono essere minori di uno purché gli stati rispettino il dominio. Il regime di piastre estese è una premessa distinta, non dedotta dalla sola positività. Il limite v<c del modello è necessario ma non certifica quantitativamente il regime non relativistico: quest’ultimo è una premessa esplicita letta nei candidati. Per Lorentz03 la potenza q(v×B)·v=0 è dimostrata anche con componente parallela; il modulo della velocità è distinto dal vettore.

Il modello pre-key è copiato byte per byte come dipendenza di review. Il suo docstring descrive l’istante storico prima delle chiavi; la presente nota documenta la successiva lettura completa e i test finali. Decoder AST esatto SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente SHA256 42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. Entrambi sono controllati e riportati per ogni ID, senza eval né roundtrip attraverso float.

Tutti i cinque XML e i cinque PNG nativi indipendenti completi sono stati letti realmente, sotto mutex e guardia≥2 GiB. I processi sono terminati exit0; non è bastata la comparsa del PNG. Dimensioni640×1480 e bounds riportati nelle fixture, insieme alle osservazioni di processo. Nessun server o app aperto e nessun marker di UI prodotto creato. Non sono emersi finding testuali, matematici o grafici nei cinque finali dopo questa lettura.

## Prove individuali

### AR-u6-dielectric-connected-charge-01

Derivazione primaria storica, conservata: Generatore ideale collegato mantiene V=2 V durante l’inserimento. La capacità finale è κC₀ e il modulo di carica su una piastra è Q=κC₀V. In unità μF, V e μC, Q[μC]=2 κC₀[μF]. Con C₀=2 μF e κ=2 si trova Q=8 μC; il generatore fornisce la carica libera aggiuntiva.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: C finale 4 μF e Vg 2 V danno 8 μC su una piastra. Quattro ignora κ; due divide il valore iniziale 4 perκ; sedici conta entrambi i moduli. Il generatore trasferisce carica libera.

Esito esatto indipendente: 8. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-02

Derivazione primaria storica, conservata: La carica ha unità coulomb C, qui μC. F·V=C dimostra la dimensione dalla legge Q=CV. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: C è l’unità di carica: F·V=C. F, V, J, T sono rispettivamente capacità, tensione, energia, campo. Prefisso micro non cambia dimensione.

Esito esatto indipendente: C. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-dielectric-connected-charge-03

Derivazione primaria storica, conservata: Il vincolo del generatore ideale fissa la differenza di potenziale, mentre può scambiare carica con le armature. A geometria invariata l’inserimento ideale con κ>1 aumenta C e il modulo Q; al confine κ=1 non li cambia. Non si conserva la carica libera di ciascuna piastra come nel caso scollegato e non si crea carica netta dal nulla.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Con κ>1 il generatore fissa V 2 V, C aumenta e Q aumenta. Polarizzazione non crea libera aggiuntiva; quella passa dal circuito. κ 1 è il caso limite senza aumento, esplicitamente separato nel prompt.

Esito esatto indipendente: V resta 2 V e il modulo Q aumenta. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-dielectric-connected-charge-04

Derivazione primaria storica, conservata: κ=2 e V=2 V restano uguali. C₀ passa da 2 a 4 μF, quindi Q passa da 2·2·2=8 a 2·2·4=16 μC. Dipendenza lineare dalla capacità iniziale; sono preparati distinti e non una carica isolata che deve restare uguale.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: C₀ raddoppia, κ e Vg uguali:8→16 μC. Quattro inverte, otto ignora, trentadue quadra il fattore due; due dimezza ulteriormente senza legge.

Esito esatto indipendente: Da 8 μC a 16 μC. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-05

Derivazione primaria storica, conservata: Dalla legge Q=κC₀V si isola C₀=Q/(κV). Con Q=8 μC, κ=2 e V=2 V: C₀=8/4=2 μF. Il denominatore è positivo e la capacità cercata è quella prima dell’inserimento, non la capacità finale 4 μF.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: C₀=8/(2·2)=2 μF. Quattro è C finale, otto copia Q, mezzo ricostruisce solo 2 μC e non 8. Denominatori non nulli.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-06

Derivazione primaria storica, conservata: κ=Q/(C₀V)=8/(2·2)=2. È puro e soddisfa κ≥1. In generale le misure devono dare Q≥C₀V nel modello di inserimento completo con costante relativa almeno uno.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: κ=8/(2·2)=2. Mezzo è reciproco fuori dominio; quattro copia C finale, sedici non forma il rapporto Q/(C₀Vg).

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-07

Derivazione primaria storica, conservata: A ha Q_A=8 μC. B con κ=1 e stessa C₀=2 μF ha Q_B=4 μC. Rapporto Q_B/Q_A=1/2; il confine κ=1 è valido e il generatore mantiene ancora 2 V.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: κ_B 1 dà 4 μC contro 8 μC A: rapporto 1/2. Due reciproco, 1/4 quadrato, zero confonde κ 1 con capacità nulla, uno ignora il cambio.

Esito esatto indipendente: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-08

Derivazione primaria storica, conservata: Q corretto=8 μC e proposta=16 μC. Scarto proposto meno corretto=+8 μC. Il valore non è la carica netta delle due piastre e non si aggiunge un ulteriore fattore due alla carica di una sola armatura.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Scarto+8 μC. −8 inverte, due è rapporto, 16 copia proposta, zero non verificaQ=κC₀Vg.

Esito esatto indipendente: 8. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-09

Derivazione primaria storica, conservata: La formula fisica è C₀=Q/(κV), con V=2 V assegnata. La forma per i valori numerici è C₀[μF]=Q[μC]/(2 κ). Il numero 2 non può sostituire una tensione dimensionata fuori da queste unità dichiarate. κ≥1 e V>0 rendono lecita l’inversa.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: C₀=Q/(κVg) ha F. Qκ/Vg non annulla κ; QVg/κ ha energia; κVg/Q è capacità inversa; Q/Vg è C finale.

Esito esatto indipendente: C₀ = Q / (κ V_g). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-dielectric-connected-charge-10

Derivazione primaria storica, conservata: Q_A=κC₀V e Q_B=(κ₂κ)(κ₁C₀)V con lo stesso generatore da 2 V. Il rapporto è κ₁κ₂. Le due costanti relative devono rimanere almeno uno; un fattore comune su entrambi gli ingressi produce un quadrato, senza rendere quadratica la singola legge in C₀.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: κ₁κ₂ segue il prodotto a Vg fisso. Quozienti invertono un ingresso, κ₂² aggiunge potenza; somma è due per prove identiche. Entrambi κ fisici≥1.

Esito esatto indipendente: κ₁ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-dielectric-connected-charge-11

Derivazione primaria storica, conservata: A: Q_A=2·2·2=8 μC. B: Q_B=2·3·1=6 μC. Rapporto 6/8=3/4. Aumentare κ non basta a garantire aumento di Q quando contemporaneamente si dimezza C₀.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Q_A 8 e Q_B 6 μC: rapporto 3/4; 4/3 reciproco, mezzo sola C₀, 3/2 soloκ, uno presume compensazione completa.

Esito esatto indipendente: 3/4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-12

Derivazione primaria storica, conservata: Media delle uscite=(8+6)/2=7 μC. Ai dati medi C₀=3/2 μF e κ=5/2 si otterrebbe 2·(3/2)·(5/2)=15/2 μC, diverso di 1/2 μC. Si mediano i risultati fisici delle due prove, non prima gli ingressi del prodotto.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Media 7 μC, prodotto degli ingressi medi 15/2 μC, differenza mezzo. 14 è somma, 1 semidifferenza, zero carica netta del condensatore.

Esito esatto indipendente: 7. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-13

Derivazione primaria storica, conservata: Bersaglio Q_B=(3/4)·8=6 μC con C₀,B=1 μF. Dalla legge 6=2 κ_B·1 segue κ_B=3. Rapporto κ_B/κ_A=3/2, compatibile con κ_A=2 e κ_B=3.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Bersaglio 6 μC con C₀1 μF e 2 V richiede κ 3, rapporto 3/2; 2/3 inverte, 3/4 copia rapporto cariche, 2 darebbeκ 4 e 8 μC. Mezzo non raggiunge il bersaglio.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-14

Derivazione primaria storica, conservata: Il riferimento Q_A=8 μC con lettura 24 dà guadagno 3 unità/μC. Lettura 18 indica Q=6 μC. Per κ=3 e V=2 V, C₀=6/(3·2)=1 μF. La taratura agisce sulla carica e non sulla capacità direttamente.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 3 μC⁻¹, D 18 dà Q 6 μC, κ 3 e 2 V danno C₀1 μF. Tre usa D come Q; due omette numericamente Vg; sei copia Q come capacità.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-15

Derivazione primaria storica, conservata: Q_A=8 μC e Q_B=6 μC, letture 17 e 13: a_cal=(17−13)/(8−6)=2 unità/μC, b_cal=1. Lettura 33 dà Q_C=(33−1)/2=16 μC. Con κ_C=2 e V=2 V, C₀,C=16/4=4 μF.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 2 μC⁻¹, offset 1, D 33→Q 16 μC→C₀4 μF. 33/8 omette offset e dàD 34; 8 omette Vg, 16 copia Q con altra dimensione.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-connected-charge-16

Derivazione primaria storica, conservata: Il vincolo è C₀=(1 μF)κ, non una capacità adimensionale. Inserendo nella legge a 2 V si ottiene Q[μC]=2 κ². Misura 8 implica κ²=4, radici ±2; solo κ=2 rispetta κ≥1. C₀=2 μF. Il vincolo confronta preparazioni e non una κ temporale durante la carica.

Ipotesi fisiche controllate: Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Q/(1 μC)=2 κ² e Q 8 impongono κ²4, κ 2 con C₀2 μF.−2 viola dominio e capacità positiva, 4 copia quadrato, 8 copia Q, nessuna ridondanza.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML completo e PNG nativo 640 × 1480 letti: batteria 2 V collegata con polo lungo positivo verso piastra+; C₀2 μF, κ 2, C 4 μF, Q 8 μC. Barre 320/240/280 per 8/6/7 μC da origine 150, scala 40 coordinate/μC. Grafico a κ 2, Vg 2: x=150+160 C₀, y=1300−20 Q, segmento(470, 1140)=(2 μF, 8 μC), scala indipendente. Originecome limite, zeri e tutte punte leggibili.

UI prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI inventato, copiato o aggiornato. Publication DRAFT, publicationAction NONE. Le identità fresh/saved sono confrontate con le fixture realmente lette e con i commit Git dei finali. Confronto canonico ROOT e integrazione restano PENDING_ROOT: nessun credito anticipato. Nessun candidato, registry, ledger, runtime o Git ROOT modificato.

Verifier SHA256 b1127a40658a0e7a2563381b1b78f1867a31bc3488e6025c18912f278513a8ff. Package canonico SHA256 a4d50565318196b6c2e82fa34fa650853700ec6070b0f349c8ded359a72d1b61. Binding canonico SHA256 b62bb4d5d97b53d567e3eb7015952ab060f83a1b78471ce91bdfc8861905885f. Report SHA256 19acda1bf79393635a74b2f41d351af305b9726583f6377283e096a3f5578c5f.
