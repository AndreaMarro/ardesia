# Revisione indipendente emitted-blackbody-power-183

Primaria completa degli 80 prompt originali U5-04 salvata prima di candidati, opzioni o chiavi: primary-thermal-transport-183-187-before-candidates-20261125.md, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. I messaggi di consegna hanno anticipato soltanto SHA, percorsi e ipotesi generali, senza risultati. Nessun modulo d’autore importato o usato per le derivazioni.

Poi sono stati letti individualmente tutti i 16 prompt finali, tutte le opzioni, ogni blocco, formula, hint, feedback, metadato e didascalia. Le leggi, i numeri e i domini finali sono stati ricalcolati separatamente. Package e binding ROOT sono byte-identici al pin finale B 1f06ede324e1aa8c7c2022429ad6a4fe491a668c; non si congela una versione precedente. Il catalogo reale C3-L01/L05/L06/L09/L10 è stato riletto: scala assoluta per radiazione ed entropia, vie di trasferimento e distinzione fra variazione di una parte e produzione totale. La competenza primaria effettiva è C3-L05.

Gli oracoli derivano le leggi e le inverse con SymPy, verificano unità con Pint/Fraction e mantengono calcoli razionali esatti. La quarta e quinta radice dei casi numerici si riconoscono tramite potenze intere perfette; nessuna valutazione a calcolatrice o approssimazione logaritmica è necessaria. Le alternative simboliche sono confrontate come leggi generali: una coincidenza per parametri particolari non rende corretta una falsa legge. Non si attribuisce PASS dalla sola chiave o da dichiarazioni dell’autore.

## Lettura e prova individuale

### AR-u5-emitted-blackbody-power-01

Conversioni: A[cm²]·10⁻⁴ m² e T=100θ K. σAT⁴ in W ha coefficiente 6·10⁻⁸·10⁻⁴·10⁸=6·10⁻⁴; in mW è (3/5)Aθ⁴. θ=2, A=5: P=3·16=48 mW. È emissione, non differenza con ambiente.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 3 mW isola il coefficiente a θ=1; 12 mW usa θ²; 96 mW duplica l’area; 48000 scambia W e mW.

Esito indipendente esatto: 48. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-02

Potenza ha dimensione M L² t⁻³: W o un suo prefisso è compatibile; mW è la scala chiesta. Senza leggere le opzioni non si sceglie una lettera. Le alternative candidate sono state poi lette integralmente: unica unità compatibile mW.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: mJ è energia, K temperatura, W/m² intensità e J/K entropia/capacità; solo mW è potenza.

Esito indipendente esatto: mW. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u5-emitted-blackbody-power-03

Formula numerica nelle unità dichiarate: P_em[mW]=(3/5)A[cm²]θ⁴. La formula fisica resta σA(100θ K)⁴. θ è puro, A fisica in m² dopo conversione; nessuna temperatura Celsius nella quarta potenza.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Le altre leggi usano θ o θ², rendono inversa l’area o la temperatura. Solo la quarta potenza segue σAT⁴.

Esito indipendente esatto: p = (3/5) a θ⁴. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-emitted-blackbody-power-04

A=5 cm² fissa: θ=2 dà 48 mW, θ=3 dà 3·81=243 mW. Rapporto 81/16. Non è un aumento lineare o quadratico.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Il fattore corretto è81/16. Una variazione lineare o quadratica di θ non ricostruisce243 mW.

Esito indipendente esatto: Da 48 a 243 mW. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-05

48=(3/5)·5·θ⁴ implica θ⁴=16. Si riconosce 16=2⁴ e si sceglie θ=2>0, quindi T=200 K. Radice negativa esclusa dalla temperatura assoluta positiva.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 16 è θ⁴, non θ; il ramo−2 viola T>0.

Esito indipendente esatto: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-06

48=(3/5)A·16; A=48·5/48=5 cm². I fattori di conversione sono già nel coefficiente numerico.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: L’inversa deve dividere per (3/5)θ⁴; omettere la conversione cambia la scala dell’area.

Esito indipendente esatto: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-07

θ=2 costante: P proporzionale ad A. Passare da 5 a 10 cm² dà 48→96 mW e rapporto B/A=2.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 1/2 è reciproco;4 introduce un quadrato nell’area;1 ignora il raddoppio.

Esito indipendente esatto: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-08

Valore corretto 48 mW; proposta 96 mW. Scarto proposta meno corretto +48 mW, senza cambiare la convenzione della potenza emessa.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: −48 inverte lo scarto;96 copia la proposta;0 la accetta;2 è rapporto puro.

Esito indipendente esatto: 48. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-09

θ⁴=5 P_em[mW]/(3 A[cm²]); θ è la radice quarta positiva. In forma fisica T=(P/(σA))^(1/4), poi θ=T/(100 K). Richiesti A>0 e P>0.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: La radice è quarta e positiva; il reciproco, l’assenza di radice e il coefficiente omesso non invertono la legge.

Esito indipendente esatto: θ = [5p/(3a)]^(1/4). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-emitted-blackbody-power-10

P_B/P_A=(κ₁θ)⁴κ₂A/(θ⁴A)=κ₁⁴κ₂. Quarta potenza soltanto sul fattore di temperatura; area al primo grado.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Solo κ₁ è elevato alla quarta; area è lineare. Quozienti e quadrati alterano una dipendenza.

Esito indipendente esatto: κ₁⁴ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-emitted-blackbody-power-11

A=48 mW; B=(3/5)·10·3⁴=6·81=486 mW. Rapporto 486/48=81/8. Entrambi i cambiamenti sono inclusi.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 81/16 segue solo temperatura;2 segue area;8/81 inverte tutto il confronto.

Esito indipendente esatto: 81/8. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-12

Media delle letture (48+486)/2=267 mW. Il modello sugli ingressi medi θ=5/2, A=15/2 darebbe (9/2)(625/16)=5625/32 mW, non la media delle uscite.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 5625/32 mW usa ingressi medi;534 omette la metà;48 e486 ignorano una prova.

Esito indipendente esatto: 267. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-13

Bersaglio (81/8)·48=486 mW. A θ_B=3, ogni cm² contribuisce 243/5 mW; serve A_B=10 cm² e rapporto con A_A=5 pari a 2.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 81/8 è fattore della potenza, non dell’area a temperatura cambiata;1/2 capovolge il rapporto.

Esito indipendente esatto: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-14

S_A=144 su P_A=48 mW dà guadagno 3 mW⁻¹. S_B=1458 implica P_B=486 mW. A_B=10 cm²: θ_B⁴=486/6=81=3⁴, quindi θ_B=3.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Ignorare q porta θ⁴=243; usare l’area A al posto di B porta162, nessuno uguale81.

Esito indipendente esatto: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-15

Riferimenti 48 e 486 mW, letture 97 e 973: a=(973−97)/(486−48)=876/438=2 mW⁻¹, b=1. S_C=487 dà P_C=243 mW. A_C=5 cm²: θ_C⁴=243/3=81, θ_C=3.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Omettere b dà θ⁴=487/6, non81; la radice3 predice487 solo con b=1.

Esito indipendente esatto: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-emitted-blackbody-power-16

Fra preparazioni θ=(2/5)A nei numeri in cm²; il coefficiente fisico è (2/5) cm⁻². Sostituendo: P=(48/3125)A⁵ mW=48 mW. Quindi A⁵=3125=5⁵: A=5 cm² unico ramo positivo, θ=2. La legge è monotona per A>0; non è una massa o temperatura che varia durante il processo.

Ipotesi: Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.

Distrattori e controprove: −5 viola area positiva;25 e2 non danno a⁵=3125; a>0 rende la quinta potenza monotona.

Esito indipendente esatto: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti delle prove

XML e PNG nativo integrale letti. Frecce di emissione schematiche separate con punte visibili. Barre centrali3/48/243 mW con larghezze9/2,72,729/2 a origine comune; rapporto1:16:81. Barre finali48/486/267 mW con larghezze36,729/2,801/4. Scale intrinseche3/2 e3/4 coordinate/mW, ciascun pannello coerente. Zeri separati dagli assi; nessun pixel fisico dichiarato dopo resize.

Cinque rendering nativi Quick Look realmente terminati con exit 0, sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB; PNG integrali letti, XML e log conservati. Queste sono prove asset-only, non un replay del prodotto o del layout a 320 px. Tutta UI del prodotto rimane NOT_RUN in questo perimetro; nessun marker inventato o riusato. Nessuna modifica a candidati, runtime, registro, checkpoint o Git ROOT.

## Provenienza congelata

Verifier SHA256 202e77c6d620460127e2e4c58c4086166ed386ec4a9123325c85a506e9b27e90. Package canonico SHA256 dbc3093d49bec30cf2c62804016dbfed918df96bca4fc1b8e54bdb86741cb45c. Binding canonico SHA256 6bdab47cea1611e3f025bf10b4c509eafb42148771855ebf562b7e277b4da461. Report SHA256 9fa036bf67820c1baf7dbb6c61bbb60dc47be3c52026416bea4359ae47c2c33b.

Review AI distinta dall’autore; human NOT_RUN; publication DRAFT; publicationAction NONE. Nessuna nuova integrazione o pubblicazione attribuita.

## Controlli automatici distinti conclusi

Il test comune indipendente è terminato realmente con exit 0: 13 test in 3,763 s. Sono state respinte 125 mutazioni dei pacchetti, di cui 80 risposte errate con binding, token e pin sostituiti soltanto in memoria per isolare gli oracoli matematici; respinti anche cinque guasti alle funzioni costitutive. Sono state provate 240 configurazioni Hypothesis e le identità canoniche dei report fresh e salvati di tutti gli 80 record. Log autentico conservato in thermal-entropy-183-187-independent-tests-20261125.txt. Tutta la suite del corpus e la UI del prodotto sono fuori da questa prova locale.
