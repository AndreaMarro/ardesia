# Revisione indipendente two-parallel-resistors-207

Gli 80 prompt originali U6-02 B205–209 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave o soluzione altrui. Primaria SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, copia byte-identica in u6-independent-205-209-fixtures-20261125/primary-source-only.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json, SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Nessuna esposizione anticipata alle chiavi U6-02. La primaria è rimasta immutata.

Successivamente ho letto integralmente i sedici record finali: ogni consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Le leggi e gli esiti sono stati confrontati con la primaria indipendente; nessun modulo autore è stato importato. Edizione finale letta: c5cb085c15bdbadd305ef6295475a04cfed65d23. I modelli derivano da conservazione del volume, legge ohmica e leggi di Kirchhoff secondo la topologia pertinente. Catalogo reale C4-L05/L06 riletto; il caso sui materiali è distinto dalla riduzione delle reti.

Le inverse conservano parametri reali finiti, resistenze positive e denominatori non nulli; il conteggio di elementi rimane intero positivo dove richiesto. Le tarature hanno guadagno positivo e possono avere offset negativo. Il decoder AST legge esattamente i lessemi originali, senza eval né ricostruzione da float binari. Il suo SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc è controllato e riportato per ogni record. SymPy, Pint e Fraction forniscono oracoli separati dai generatori.

Tutto l’XML e il nuovo rendering nativo completo sono stati letti. I cinque render asset-only sono realmente terminati con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Le copie esatte di SVG, PNG e log sono nella fixture con manifest. Le rettifiche d’autore sono state rilette prima del congelamento: 205 didascalia dei due fili e descrizione simbolica; 206 parentesi della somma e attribuzione del numero puro; 207 controprova della conduttanza e tensione positiva esplicita; 208 scale comuni solo entro il pannello; 209 somma di N cadute senza uguaglianza interna spezzata. Chiavi, leggi e geometrie sono rimaste invariate; nessun helper autore globale è stato modificato.

## Prove individuali

### AR-u6-two-parallel-resistors-01

Stessi nodi implicano stessa tensione V; le correnti si sommano I=V/R₁+V/R₂. Quindi 1/R_eq=1/R₁+1/R₂ e R_eq=R₁R₂/(R₁+R₂). Con 2,2 Ω risulta 1 Ω, inferiore a ciascun ramo.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 4 Ω è la serie; 2 Ω omette un ramo; 1/2 Ω dimezza ancora il valore. La resistenza equivalente deve essere minore di ciascun ramo positivo finito.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-02

La resistenza equivalente è in Ω, dimensione V/A. Il reciproco è conduttanza in siemens, che non è la stessa grandezza. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: S misura la somma delle conduttanze, non la resistenza equivalente; Ω² deriva da un prodotto senza denominatore; A e V misurano altre grandezze.

Esito esatto indipendente: Ω. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-two-parallel-resistors-03

Due resistori fra gli stessi nodi hanno la stessa differenza di potenziale orientata con riferimenti concordi. Le correnti valgono V/R₁ e V/R₂ e non sono necessariamente uguali se le resistenze sono diverse; per tensione non nulla sono diverse.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: La tensione comune segue dai due nodi condivisi. Correnti e potenze possono differire: a 6 V, rami da 2 e 3 Ω hanno correnti 3 e 2 A e potenze 18 e 12 W.

Esito esatto indipendente: La tensione ai capi dei due resistori è la stessa. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-two-parallel-resistors-04

A 2,2 Ω dà 1 Ω; B 1,2 Ω dà(1·2)/(1+2)=2/3 Ω. Il totale diminuisce perché cresce la conduttanza del ramo modificato.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 3 Ω usa la serie; 1/2 Ω dimezza entrambi i rami; 1 Ω ignora il cambiamento; 3/2 copia il valore numerico della conduttanza finale in S senza prenderne il reciproco.

Esito esatto indipendente: Da 1 a 2/3 Ω. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-05

Da S=R₁R₂/(R₁+R₂): S(R₁+R₂)=R₁R₂ ⇒SR₂=R₁(R₂−S) ⇒R₁=SR₂/(R₂−S). ConS 1, R₂2 Ω:2 Ω. Per valori finiti positivi occorre 0<S<R₂.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 1 Ω copia l’equivalente e produce 2/3 Ω; 3 Ω somma invece di sottrarre le conduttanze nella ricostruzione. R_eq=R₂ corrisponderebbe a un ramo sconosciuto aperto, non a una resistenza finita.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-06

All’inizio G=1/3+1/6=1/2 Ω⁻¹, quindi I_i=V/2. Aperto solo 3 Ω rimane I_f=V/6. Per tensione imposta non nulla I_f/I_i=(1/6)/(1/2)=1/3. Se V=0 entrambe le correnti sono nulle e il rapporto è 0/0: questa condizione era da precisare nella fonte. Nella candidata finale V>0 è esplicita nel prompt, nel pannello e nella descrizione SVG.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 3 è il rapporto delle resistenze equivalenti finali e iniziali, reciproco del rapporto delle correnti; 1/2 presume rami uguali; 2/3 è la quota della corrente iniziale eliminata; 1 ignora l’apertura. La tensione positiva rende definito il rapporto.

Esito esatto indipendente: 1/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-07

A 2,2 Ω dà 1 Ω; B 2,1 Ω dà 2/3 Ω. Rapporto B/A=2/3, non 1/2 che considera solo il ramo modificato.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 3/2 è il reciproco; 1/2 segue soltanto il ramo modificato; 2 implicherebbe R_eq,B=2 Ω, impossibile con un ramo da 1 Ω; 1 ignora la modifica. G_B/G_A=3/2 e non 2.

Esito esatto indipendente: 2/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-08

Il corretto è 1 Ω. Proposta 2 Ω meno corretto=+1 Ω; il parallelo di due elementi uguali dimezza il singolo valore.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: −1 Ω inverte lo scarto; 2 Ω copia la proposta; zero la accetta; 2 senza unità è un rapporto e non la differenza richiesta.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-09

Formula inversa R₁=R_eq R₂/(R₂−R_eq), con 0<R_eq<R₂. Il denominatore positivo garantisce R₁>0; R_eq=R₂ richiederebbe limite di ramo aperto infinito, non un resistore finito.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: Il segno più al denominatore non isola R₁; differenze semplici trattano i resistori come serie; R₂/R_eq è puro e non misura resistenza.

Esito esatto indipendente: R₁ = R_eq R₂ / (R₂ − R_eq). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-two-parallel-resistors-10

R_eq, B=(κ₁κ₂R₁R₂)/(κ₁R₁+κ₂R₂). Dividendo per R_eq, A dàκ₁κ₂(R₁+R₂)/(κ₁R₁+κ₂R₂). I fattori ugualiκ producono rapportoκ, utile controllo.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: Prodotto e quoziente dei soli fattori omettono i pesi; il rapporto delle somme descrive una serie; l’inverso del prodotto non segue la somma delle conduttanze.

Esito esatto indipendente: κ₁ κ₂ (R₁ + R₂) / (κ₁ R₁ + κ₂ R₂). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-two-parallel-resistors-11

A=1 Ω. B 3,6 Ω:18/9=2 Ω. Rapporto 2. R_eq, B resta inferiore al minimo 3 Ω.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 1/2 è il reciproco; 3 segue soltanto R₂; 9/4 confronta le somme; 9/2 confronta i prodotti senza il denominatore del parallelo.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-12

Media delle uscite(1+2)/2=3/2 Ω. Ai dati medi R₁=5/2, R₂=4 Ω si avrebbe 10/(13/2)=20/13 Ω;20/13−3/2=1/26 Ω. Nessuna approssimazione decimale.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 20/13 Ω applica il modello ai dati medi; 3 Ω non dimezza la somma; 1/2 Ω è metà della differenza; 1 Ω ripete la prima prova.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-13

Bersaglio 2 Ω, R₁, B 3 Ω. Inversa sull’altro ramo: R₂, B=2·3/(3−2)=6 Ω. Rapporto R₂, B/R₂, A=6/2=3. La condizione bersaglio<R₁, B è rispettata.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 1/3 è il reciproco; 2 copia il rapporto dei totali; 6 copia il valore numerico finale di R₂ senza dividerlo per quello iniziale; 3/2 segue soltanto R₁.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-14

Riferimento 1 Ω con S 3: a=3 Ω⁻¹. S 6 indica R_eq 2 Ω. R₂6 Ω: R₁=2·6/(6−2)=3 Ω.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: R₁=6 Ω produce R_eq=3 Ω e lettura 9; R₁=2 Ω produce R_eq=3/2 Ω. Usare la lettura 6 come equivalente rende nullo il denominatore dell’inversa.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-15

Riferimenti 1 e 2 Ω, letture 3 e 5: a=2 Ω⁻¹, b=1. S_C 2 dà R_eq, C=1/2 Ω. Con R₂, C 1 Ω, inversa R₁=(1/2)·1/(1−1/2)=1 Ω, nel dominio 0<R_eq<R₂.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 2 Ω produce una lettura 7/3; 1/2 Ω produce 5/3; zero viola la passività; 3 Ω produce 5/2. Solo 1 Ω restituisce la lettura 2.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-parallel-resistors-16

R₁=R₂=x>0 impone R_eq=x/2. Misura 1 Ω⇒x=2 Ω, dunque seconda resistenza 2 Ω e prima 2 Ω. La misura non è ridondante perché fissa la scala.

Ipotesi: Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.

Distrattori e controprove: 1 Ω copia l’equivalente; 1/2 Ω dimezza nel verso errato; −2 Ω viola la passività. La misura del totale fissa la scala dei due rami uguali.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML finale e rendering nativo indipendente integrale letti. I due rami condividono i nodi (130,230) e (510,230). Nel caso separato, il contatto aperto del 3 Ω segue (180,655)→(220,620), separato dal contatto (240,655); il 6 Ω resta integro. V_AB>0 è dichiarato nel pannello e nella descrizione, rendendo definito il rapporto delle correnti. Le barre 1,2,3/2 Ω sono larghe 160,320,240, con origine 150 e scala comune 160 coordinate/Ω. Gli zeri a x=125 sono separati dagli assi.

UI del prodotto, verifica del layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Le fixture e l’identità fresh/saved sono controlli della revisione locale; confronto con ROOT integrato e replay canonico dell’integratore restano PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Nessun push o upload durante il vincolo operativo di ROOT.

Verifier SHA256 0682310cc79c530de896ba1342f406d42c6855c9e8cd711c19145a7a8e1e2031. Package canonico SHA256 888291b226f2050f26f167c7bbbe1282444bf8090bd1fb6038784ba77737d722. Binding canonico SHA256 e048771736cba0e3b0c867a67613c0904d47393f4ddf4d5dee47a3b9df66ffbc. Report SHA256 8dc935d13beed1717e6abcb790281b2bfcffa61980d6adc667f1588e5f6c9f07.
