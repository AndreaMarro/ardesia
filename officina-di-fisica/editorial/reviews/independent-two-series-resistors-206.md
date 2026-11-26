# Revisione indipendente two-series-resistors-206

Gli 80 prompt originali U6-02 B205–209 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave o soluzione altrui. Primaria SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, copia byte-identica in u6-independent-205-209-fixtures-20261125/primary-source-only.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json, SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Nessuna esposizione anticipata alle chiavi U6-02. La primaria è rimasta immutata.

Successivamente ho letto integralmente i sedici record finali: ogni consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Le leggi e gli esiti sono stati confrontati con la primaria indipendente; nessun modulo autore è stato importato. Edizione finale letta: 0188d3f00956cf376c2090bf822826a5fa02c25d. I modelli derivano da conservazione del volume, legge ohmica e leggi di Kirchhoff secondo la topologia pertinente. Catalogo reale C4-L05/L06 riletto; il caso sui materiali è distinto dalla riduzione delle reti.

Le inverse conservano parametri reali finiti, resistenze positive e denominatori non nulli; il conteggio di elementi rimane intero positivo dove richiesto. Le tarature hanno guadagno positivo e possono avere offset negativo. Il decoder AST legge esattamente i lessemi originali, senza eval né ricostruzione da float binari. Il suo SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc è controllato e riportato per ogni record. SymPy, Pint e Fraction forniscono oracoli separati dai generatori.

Tutto l’XML e il nuovo rendering nativo completo sono stati letti. I cinque render asset-only sono realmente terminati con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Le copie esatte di SVG, PNG e log sono nella fixture con manifest. Le rettifiche d’autore sono state rilette prima del congelamento: 205 didascalia dei due fili e descrizione simbolica; 206 parentesi della somma e attribuzione del numero puro; 207 controprova della conduttanza e tensione positiva esplicita; 208 scale comuni solo entro il pannello; 209 somma di N cadute senza uguaglianza interna spezzata. Chiavi, leggi e geometrie sono rimaste invariate; nessun helper autore globale è stato modificato.

## Prove individuali

### AR-u6-two-series-resistors-01

Senza derivazioni e senza accumulo al nodo, la corrente è uguale nei due resistori; le cadute si sommano: V=I(R₁+R₂), dunque R_eq=R₁+R₂. Con 2 e 3 Ω si ottiene 5 Ω. Fili ideali e regime ohmico.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 6/5 Ω è il parallelo; 6 Ω è il prodotto numerico; 2 e 3 Ω omettono rispettivamente un elemento della serie.

Esito esatto indipendente: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-02

R_eq è una resistenza, V/I, quindi Ω. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: S, A, V e W misurano conduttanza, corrente, tensione e potenza; Ω deriva da V/I.

Esito esatto indipendente: Ω. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-two-series-resistors-03

Corrente comune I, cadute V₁=IR₁, V₂=IR₂. La tensione totale è I(R₁+R₂), quindi R_eq=R₁+R₂. Non si sommano reciproci come nel parallelo.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: Il prodotto diviso per la somma descrive il parallelo; la differenza non descrive una serie passiva; la somma dei reciproci ha unità S e il prodotto ha unità Ω².

Esito esatto indipendente: R_eq = R₁ + R₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-two-series-resistors-04

R₂ resta 3 Ω. Cambiare R₁ da 2 a 1 Ω porta R_eq da 5 a 4 Ω; non dimezza tutto il totale perché il secondo elemento resta invariato.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 5/2 Ω dimezza entrambi gli elementi; 6 Ω aumenta il totale mentre un addendo diminuisce; 5 Ω ignora la modifica; 2 Ω omette il secondo elemento.

Esito esatto indipendente: Da 5 a 4 Ω. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-05

R₁=R_eq−R₂=5−3=2 Ω. R₁>0 richiede in generale R_eq>R₂>0; l’uguaglianza darebbe un corto e uscirebbe dal dominio dei resistori strettamente positivi.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 8 Ω aggiunge il valore noto e predice un totale 11 Ω; 5 Ω copia il totale e ne predice 8 Ω; una resistenza negativa è esclusa.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-06

Il filo ideale collega i due capi del solo 4 Ω e li rende equipotenziali. Quel resistore ha V=0 e nessuna corrente finita: viene bypassato. Resta il 2 Ω fra i morsetti esterni, quindi R_eq finale 2 Ω, non 6 o 0. Il corto non collega i morsetti dell’intera catena.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 6 Ω conserva la vecchia topologia; 4 Ω elimina l’elemento sbagliato; 4/3 Ω pone erroneamente i resistori in parallelo; zero cortocircuiterebbe anche il 2 Ω.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-07

A:2+3=5 Ω. B:2+1=3 Ω. Rapporto B/A=3/5, non il rapporto 1/3 dei soli secondi elementi.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 5/3 è il reciproco; 1/3 segue soltanto il secondo resistore; 1 ignora la modifica; 3 copia il valore numerico dell’equivalente finale in Ω.

Esito esatto indipendente: 3/5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-08

Corretto 5 Ω, proposta 10 Ω: scarto+5 Ω. Il rapporto 2 senza unità non è una differenza di resistenze.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: −5 Ω inverte l’ordine; 10 Ω copia la proposta; zero la accetta; 2 è il rapporto senza unità, non lo scarto in Ω.

Esito esatto indipendente: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-09

Isolare la prima resistenza dà R₁=R_eq−R₂. Dominio della soluzione positiva: R_eq>R₂>0; dimensione Ω e non Ω².

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: Il segno più non isola l’addendo; R₂−R_eq è negativo nel dominio; R_eq/R₂ è adimensionale; la differenza dei reciproci ha unità S.

Esito esatto indipendente: R₁ = R_eq − R₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-two-series-resistors-10

La nuova somma è κ₁R₁+κ₂R₂. Rapporto col totale iniziale:(κ₁R₁+κ₂R₂)/(R₁+R₂). Non in generale κ₁κ₂; se i fattori coincidono κ il rapporto èκ.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: Prodotto e quoziente dei fattori omettono i pesi dei due resistori; il reciproco scambia le prove; il rapporto delle differenze può avere denominatore nullo e non segue la serie.

Esito esatto indipendente: (κ₁ R₁ + κ₂ R₂) / (R₁ + R₂). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-two-series-resistors-11

A=2+3=5 Ω; B=3+5=8 Ω; rapporto 8/5. I due termini restano positivi e la topologia non cambia.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 5/8 inverte il rapporto; 3/2 segue solo R₁; 5/3 segue solo R₂; 2 richiederebbe 10 Ω, mentre il totale finale è 8 Ω.

Esito esatto indipendente: 8/5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-12

Media(5+8)/2=13/2 Ω. In questo modello lineare coincide anche con la somma dei dati medi R₁=5/2, R₂=4 Ω:5/2+4=13/2. La coincidenza è giustificata dalla linearità, non da una regola universale delle medie.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 13 Ω omette la divisione per due; 3/2 Ω è metà della differenza; 5 e 8 Ω ripetono le singole prove. La coincidenza con la somma dei dati medi è giustificata dalla linearità.

Esito esatto indipendente: 13/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-13

Bersaglio(8/5)·5=8 Ω. Imposto R₁, B 3 Ω: R₂, B=8−3=5 Ω. Rapporto con R₂, A 3 Ω pari 5/3.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 3/5 è il reciproco; 8/5 copia il rapporto dei totali; 5 copia il valore numerico di R₂,B in Ω senza dividerlo per R₂,A; 3/2 segue soltanto R₁.

Esito esatto indipendente: 5/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-14

Riferimento 5 Ω e S 15 danno a=3 Ω⁻¹. Lettura 24 indica 8 Ω; noto R₂5 Ω, segue R₁=3 Ω. Non usare 24 direttamente come una resistenza.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 19 Ω usa 24 come totale senza rimuovere il guadagno; 8 Ω copia l’equivalente; 5 Ω copia il resistore noto. La taratura del display non è un resistore aggiunto.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-15

R_A 5, R_B 8 Ω e letture 11,17: a=6/3=2 Ω⁻¹, b=1. S_C 5 restituisce R_eq, C=(5−1)/2=2 Ω; sottraendo R₂, C 1 Ω si trova R₁, C 1 Ω.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 3/2 Ω ricostruisce una lettura 6; 2 Ω ricostruisce 7; 3 Ω ricostruisce 9; 5 Ω ricostruisce 13. Solo 1 Ω restituisce la lettura 5.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-two-series-resistors-16

R₁=(2/3)R₂ ⇒R_eq=(5/3)R₂. Misura 5 Ω implica R₂=3 Ω e R₁=2 Ω. Unica soluzione positiva perché il coefficiente 5/3 non è nullo.

Ipotesi: Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.

Distrattori e controprove: 2 Ω è R₁ e non R₂; 5 Ω copia il totale; −3 Ω viola la passività. La misura del totale elimina la scala libera del solo rapporto fra i resistori.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML e rendering nativo indipendente integrale letti. Il primo circuito è una serie di 2 e 3 Ω senza derivazioni. Nel caso separato di bypass il filo collega (340,620) e (500,620), soltanto ai capi del 4 Ω; il 2 Ω fra x=170 e 270 resta attivo. Nessun corto dei morsetti esterni. Le barre 5,8,13/2 Ω sono larghe 200,320,260 con origine 150 e scala comune 40 coordinate/Ω. L’etichetta zero a x=125 è libera dall’asse.

UI del prodotto, verifica del layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Le fixture e l’identità fresh/saved sono controlli della revisione locale; confronto con ROOT integrato e replay canonico dell’integratore restano PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Nessun push o upload durante il vincolo operativo di ROOT.

Verifier SHA256 a2a4dbe1da418ba47de3a178881af2bcff3c73ffae055faaf8052ae7ff874fe3. Package canonico SHA256 3347656e1bce348063cefb0a4dac241efa1851c1d1beca7712b880bb4d432d50. Binding canonico SHA256 be3d2d3359658ed3e1b2bd5c5a561532a0b71acd53210366e0ed81198e0e6994. Report SHA256 0269bd59286830ce4acb675de415f06784259b0b548756b4ce2e8d2be8ae7c47.
