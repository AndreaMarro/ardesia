# Revisione indipendente identical-series-resistors-209

Gli 80 prompt originali U6-02 B205–209 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave o soluzione altrui. Primaria SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, copia byte-identica in u6-independent-205-209-fixtures-20261125/primary-source-only.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json, SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Nessuna esposizione anticipata alle chiavi U6-02. La primaria è rimasta immutata.

Successivamente ho letto integralmente i sedici record finali: ogni consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Le leggi e gli esiti sono stati confrontati con la primaria indipendente; nessun modulo autore è stato importato. Edizione finale letta: 07d1f0a80b73ea6f3768b6ff3aa7f3fc6fc2a4a0. I modelli derivano da conservazione del volume, legge ohmica e leggi di Kirchhoff secondo la topologia pertinente. Catalogo reale C4-L05/L06 riletto; il caso sui materiali è distinto dalla riduzione delle reti.

Le inverse conservano parametri reali finiti, resistenze positive e denominatori non nulli; il conteggio di elementi rimane intero positivo dove richiesto. Le tarature hanno guadagno positivo e possono avere offset negativo. Il decoder AST legge esattamente i lessemi originali, senza eval né ricostruzione da float binari. Il suo SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc è controllato e riportato per ogni record. SymPy, Pint e Fraction forniscono oracoli separati dai generatori.

Tutto l’XML e il nuovo rendering nativo completo sono stati letti. I cinque render asset-only sono realmente terminati con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Le copie esatte di SVG, PNG e log sono nella fixture con manifest. Le rettifiche d’autore sono state rilette prima del congelamento: 205 didascalia dei due fili e descrizione simbolica; 206 parentesi della somma e attribuzione del numero puro; 207 controprova della conduttanza e tensione positiva esplicita; 208 scale comuni solo entro il pannello; 209 somma di N cadute senza uguaglianza interna spezzata. Chiavi, leggi e geometrie sono rimaste invariate; nessun helper autore globale è stato modificato.

## Prove individuali

### AR-u6-identical-series-resistors-01

N elementi in serie hanno corrente uguale e cadute additive: R=Nr. Con N 3 e r 2 Ω: R 6 Ω. N è conteggio intero positivo, r resistenza positiva di ogni elemento.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 2/3 Ω è il parallelo; 5 somma grandezze incompatibili r+N; 2 Ω rappresenta un solo elemento; 12 Ω raddoppia ancora il totale.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-02

La resistenza totale ha unità Ω, perché N è adimensionale. Conteggio privo di unità non significa resistenza priva di unità. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: A, V e S misurano altre grandezze; 1 è l’unità del conteggio N, non della resistenza totale.

Esito esatto indipendente: Ω. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-identical-series-resistors-03

Ogni caduta è Ir; N elementi identici danno V=N·Ir, quindi R=V/I=Nr. N non compare al denominatore come in N rami paralleli identici.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: r/N è il parallelo; N/r ha unità S; r+N mescola Ω e numero puro; N²r introduce un fattore N non ottenuto sommando le cadute.

Esito esatto indipendente: R = N r. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-identical-series-resistors-04

N resta 3. r passa da 2 a 5 Ω: totale 6→15 Ω. La variazione è lineare in r e non cambia il numero degli elementi.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 5 Ω è un solo elemento; 10 Ω ne conta due anziché tre; 6 Ω ignora la modifica; 75/2 Ω quadra erroneamente il fattore 5/2.

Esito esatto indipendente: Da 6 a 15 Ω. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-05

r=R/N=6/3=2 Ω. Divisione per un intero positivo; la resistenza di ciascun elemento è positiva.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 18 Ω moltiplica per N; 6 Ω copia il totale; 1/2 Ω non soddisfa R=6 Ω con tre elementi. Solo 2 Ω ricostruisce il totale.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-06

N=R/r=6/2=3. Oltre alla positività serve integrità: il rapporto deve essere un intero positivo, non va arrotondato se i dati dessero un valore frazionario.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 12 moltiplica invece di dividere; 1/3 non è un conteggio ammesso; zero è escluso. Non si arrotonda un rapporto R/r frazionario per costruire una catena esatta.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-07

A N 3, r 2 Ω dà 6 Ω. B N 1 con stesso r dà 2 Ω; rapporto 1/3. Un singolo elemento è il confine N=1 ammesso.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 3 inverte il rapporto; 1 ignora la rimozione; 1/9 usa N²; 2 copia il valore numerico della resistenza finale in Ω.

Esito esatto indipendente: 1/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-08

Proposta 12 Ω meno corretto 6 Ω=+6 Ω; il rapporto 2 è puro, non lo scarto richiesto.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: −6 Ω inverte lo scarto; 12 Ω copia la proposta; zero la accetta; 2 è un rapporto e non una differenza in Ω.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-09

Da R=Nr si divide per N>0: r=R/N. Dimensione Ω perché N è puro; non R·N o N/R.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: RN non isola r; N/R ha unità S; R−N sottrae grandezze incompatibili; R/N² divide per un fattore N ulteriore privo di giustificazione.

Esito esatto indipendente: r = R / N. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-identical-series-resistors-10

R_B/R_A=(κ₂N)(κ₁r)/(Nr)=κ₁κ₂. Occorre anche N e κ₂N interi positivi; κ₂ può essere razionale purché il numero finale sia intero. Non imporre senza motivo κ₂ intero.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: I quozienti invertono un fattore; la somma darebbe 2 per due prove identiche; N² non segue dalla serie. κ₂ può essere 4/3 quando N_A=3 e N_B=4.

Esito esatto indipendente: κ₁ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-identical-series-resistors-11

A r 2, N 3⇒6 Ω; B r 3, N 4⇒12 Ω. Rapporto 2.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 1/2 è il reciproco; 3/2 segue solo r; 4/3 segue solo N; 4 copia N_B senza confrontare i prodotti Nr.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-12

Media(6+12)/2=9 Ω. Il prodotto dei dati medi sarebbe(5/2)(7/2)=35/4 Ω, diverso di 1/4 Ω; inoltre N_medio 7/2 non è un conteggio ammesso per una catena reale. La media statistica delle resistenze non richiede una catena con N frazionario.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 35/4 Ω è il prodotto formale dei dati medi, con N=7/2 non ammesso come catena reale; 18 Ω omette la divisione per due; 3 Ω è metà della differenza; 6 Ω ripete la prima prova.

Esito esatto indipendente: 9. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-13

Bersaglio 2·6=12 Ω e r_B 3 Ω danno N_B=4, intero positivo. Rapporto N_B/N_A=4/3; il rapporto non deve essere un intero anche se entrambi i conteggi lo sono.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 3/4 è il reciproco; 2 copia il rapporto dei totali; 4 copia N_B; 3/2 segue solo r. Il rapporto di conteggi interi non deve essere intero.

Esito esatto indipendente: 4/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-14

A R 6 Ω con lettura 18 dà a=3 Ω⁻¹. Lettura 36 indica R 12 Ω; N_C 4⇒r_C 3 Ω. Il conteggio 4 è ammesso.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 9 Ω usa la lettura 36 senza taratura; 12 Ω copia il totale; 4 Ω copia N e ricostruisce una lettura 48. Il display continuo non è un conteggio di resistori.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-15

A R 6, B R 12 Ω e letture 13,25 danno a=2 Ω⁻¹, b=1. S_C 17⇒R_C 8 Ω; N_C 2⇒r_C 4 Ω. L’offset viene sottratto prima di dividere per N.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 17/4 Ω omette l’offset e ricostruisce 18; 2 Ω ricostruisce 9; 8 Ω ricostruisce 33; 1 Ω ricostruisce 5. Solo 4 Ω restituisce la lettura 17.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-identical-series-resistors-16

Vincolo r=(2/3 Ω)N. Allora R=(2/3 Ω)N²=6 Ω ⇒N²=9. Radici±3, ma N deve essere intero positivo: N=3, r=2 Ω. Non aggiungere altri valori arrotondando una radice.

Ipotesi: N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.

Distrattori e controprove: 9 copia N²; −3 è escluso; N=2 produrrebbe 8/3 Ω. La misura N²=9 seleziona il solo intero positivo 3 e non infinite soluzioni.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML e rendering nativo indipendente completo letti. I circuiti contengono esattamente tre e quattro resistori; i simboli schematici non codificano il valore con la larghezza. Le barre 6,12,9 Ω sono larghe 180,360,270, con origine 150 e scala comune 30 coordinate/Ω. N_medio=7/2 è dichiarato conteggio non ammesso per una catena reale; non viene disegnato alcun mezzo resistore. Gli zeri a x=125 sono liberi dagli assi.

UI del prodotto, verifica del layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Le fixture e l’identità fresh/saved sono controlli della revisione locale; confronto con ROOT integrato e replay canonico dell’integratore restano PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Nessun push o upload durante il vincolo operativo di ROOT.

Verifier SHA256 55e664c78ca833ac5aa793000b5cb4cae2be5f5fde18d4bdb09e2f8caf8d06a1. Package canonico SHA256 860b4e067fd175e48d54808fbc656e24783ecec083ab9af359cc42b797c5bef8. Binding canonico SHA256 7c2eed43adae4bf03b921a2e779a270bc1b8a8d4907e9ca87da6cef85ca20539. Report SHA256 7ddc0e193c822121dbf05762eac1f22a1c328a2610807349823638ef6d2a4f96.
