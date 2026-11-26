# Revisione indipendente line-load-efficiency-215

Gli 80 prompt originali U6-03 B215–219 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave, soluzione o generatore. Primaria SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b; copia byte-identica nella fixture. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json, SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Nessuna esposizione anticipata alle chiavi. Nessuna primaria altrui è stata aperta. I modelli sono stati scritti e realmente eseguiti prima dei candidati: model-run-1.json documenta exit 0; il modello finale deriva da quella versione e restringe inoltre la corrente operativa al dominio I>0 dichiarato nei candidati. Conserva il docstring storico NOT_RUN dell’istante iniziale, superato dal run documentato e dai nuovi test finali.

Dopo il congelamento della primaria ho letto integralmente ogni record finale: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Nessun modulo autore è stato importato. Edizione finale letta: aea78b9bbe3e4218b719049d231b31b54ebbc848. I risultati derivano da potenza in serie, bilancio di calore latente, modello elettrostatico piano, Q=CV e integrale di carica del condensatore lineare. Catalogo reale C4-L03/L04/L07 e C3-L03/L04 riletto per le eccezioni autonome. Il modello della fusione non descrive il successivo circuito aperto; la polarizzazione non coincide con conduzione libera; l’energia immagazzinata non è tutto il lavoro della batteria.

Le quantità numeriche sono esatte, finite e reali prima di ogni operazione; denominatori e rami positivi controllati. I parametri geometrici devono inoltre restare nel regime di piastre estese. Il decoder AST conserva i lessemi originali e non usa eval o roundtrip attraverso float. SHA256 decoder b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4. Entrambi sono controllati e riportati per ciascun record. SymPy, Pint e Fraction sono separati dall’authoring. Le formule generali sono confrontate simbolicamente con tutte le cinque alternative; le domande concettuali hanno prove fisiche specifiche, non una semplice flag.

Tutto l’XML e ciascuno dei cinque nuovi PNG nativi completi sono stati realmente letti. Il processo SVG-only è terminato exit 0 sotto mutex e guardia ≥2 GiB; bounds, dimensioni PNG e source SHA sono nel render.json e nel manifest della fixture. Nessuna app, server o dati studenti sono stati usati nel rendering. Rettifiche B rilette: 21511 identifica il reciproco della sola quota iniziale, 21514 conserva una controprova senza falsa attribuzione al guadagno; 21601 nomina il primo pannello e 21609 fissa la potenza nel confronto della durata; 21814 usa una sostituzione verificabile senza attribuzione falsa al reciproco. Tutte le chiavi, leggi e figure sono rimaste identiche. Nessun finding residuo dopo queste riletture.

## Prove individuali

### AR-u6-line-load-efficiency-01

La corrente è comune nella serie. P_L=I²R_L e P_c=I²R_c; per I≠0 la frazione η=R_L/(R_L+R_c). Con 3 e 1 Ω si ottiene 3/4, compreso strettamente fra zero e uno. Se I=0 la definizione come rapporto di potenze sarebbe 0/0: l’edizione futura deve dichiarare funzionamento con corrente non nulla, oppure definire esplicitamente il rapporto dei coefficienti dissipativi come limite.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: Le alternative sono state tutte lette: 1/4 è quota persa; 4/3 supera uno; 3 confronta utile con perdita anziché totale; 1 richiederebbe R_c=0. Solo 3/4 rispetta il modello.

Esito esatto indipendente: 3/4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-02

η è rapporto di potenze e quindi adimensionale: unità 1, eventualmente espresso in percentuale dopo moltiplicazione per cento. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: 1 è adimensionale. W, J e Ω rappresentano altre dimensioni; %·W conserva dimensione di potenza, non quella di una quota.

Esito esatto indipendente: 1. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-line-load-efficiency-03

Dalla somma delle potenze P_tot=I²(R_L+R_c) segue η=R_L/(R_L+R_c) per corrente comune non nulla. Non è un rendimento di conversione dell’intera rete termodinamica: qui utile significa precisamente potenza dissipata nel carico e persa significa quella nei cavi. Con resistenze positive finite, 0<η<1.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: R_c/(R_L+R_c) è la perdita; R_L/R_c e R_c/R_L non hanno il totale al denominatore; (R_L+R_c)/R_L è il reciproco della quota e supera uno. Il fattore I² si cancella soltanto con I>0, reso esplicito.

Esito esatto indipendente: R_L / (R_L + R_c). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-line-load-efficiency-04

R_c resta 1 Ω. Passare da R_L=3 a 4 Ω dà η da 3/4 a 4/5: aumenta, ma non di un fattore 4/3 perché cambia anche il denominatore. La corrente può cambiare a seconda del generatore; il rapporto delle potenze conserva questa formula.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: 4/5−3/4=1/20. Le alternative 1,3/5,3/4,1/2 eliminano perdite, conservano il vecchio numeratore, ignorano la modifica o impongono resistenze uguali. Non si inferisce una maggiore potenza utile assoluta senza controllo del generatore.

Esito esatto indipendente: Da 3/4 a 4/5. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-05

η(R_L+R_c)=R_L implica (1−η)R_L=ηR_c. Con η=3/4 e R_c=1 Ω, R_L=(3/4)/(1/4) Ω=3 Ω. In generale servono R_c>0 e 0<η<1 per resistenza finita positiva.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: Il valore 3 Ω ricompone la quota 3/4. I controesempi 3/4 Ω e 4/3 Ω danno quote 3/7 e 4/7. Il dominio inverso è aperto 0<η<1.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-06

ηR_c=(1−η)R_L, quindi R_c=R_L(1−η)/η. Con R_L=3 Ω e η=3/4 si ottiene 3·(1/4)/(3/4)=1 Ω. Il denominatore η è strettamente positivo.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: R_c=1 Ω. Il valore errato 3/4 Ω è il prodotto R_L(1−η), privo della divisione per η; 9 Ω dà η=1/4 e zero darebbe η=1, esclusa. Quote sul totale e fra utile/perdita sono distinte.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-07

η_A=3/4 e η_B=3/(3+2)=3/5. Rapporto (3/5)/(3/4)=4/5: l’aumento delle perdite nei cavi diminuisce la frazione utile. Il valore non è il reciproco semplice del rapporto delle resistenze dei cavi.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: 4/5 è il rapporto delle due uscite; 5/4 ne è il reciproco, 1/2 considera solo R_c, 2 copia il suo fattore e 1 ignora la variazione.

Esito esatto indipendente: 4/5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-08

Valore corretto 3/4; proposta 3/2. Scarto proposta−corretto=3/2−3/4=3/4, adimensionale. La proposta stessa supera uno, già incompatibile con due potenze dissipate positive nella definizione assegnata.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: La differenza è +3/4. Le altre scelte invertono il segno, formano il rapporto 2, ripetono 3/2 o accettano lo zero. La proposta non è fisicamente ammissibile anche se lo scarto si può calcolare.

Esito esatto indipendente: 3/4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-09

Da η(R_L+R_c)=R_L si raccolgono i termini in R_L: (1−η)R_L=ηR_c. Si divide per 1−η>0: R_L=ηR_c/(1−η). Unità Ω; η=1 non ammette R_c>0 finita e η=0 non ammette R_L>0.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: Con η=3/4 e R_c=1 Ω, il rapporto invertito darebbe R_L=1/3 Ω e quota1/4; ηR_c dà 3/4 Ω e quota3/7; R_c/(1−η) dà4 Ω e quota4/5. η/R_c ha unità S. Il noto resta R_c nelle formule effettive.

Esito esatto indipendente: η R_c / (1 − η). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-line-load-efficiency-10

η_B=κ₁R_L/(κ₁R_L+κ₂R_c). Dividendo per η_A=R_L/(R_L+R_c), il rapporto è κ₁(R_L+R_c)/(κ₁R_L+κ₂R_c). Fattori positivi mantengono denominatore positivo; una scalatura comune κ₁=κ₂ lascia η invariata.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: La candidata definisce a=R_L/(R_L+R_c), b=R_c/(R_L+R_c). κ₁/(κ₁a+κ₂b) equivale esattamente alla formula della primaria. Il numeratore κ₂ segue i cavi; κ₁/κ₂ omette i pesi; la somma è il solo fattore totale; il prodotto fallisce già con κ₁=κ₂=2.

Esito esatto indipendente: κ₁ / (κ₁ a + κ₂ b). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-line-load-efficiency-11

A: 3/(3+1)=3/4. B: 2/(2+2)=1/2. Rapporto (1/2)/(3/4)=2/3. La potenza utile resta definita sul carico, senza cambiare il significato del rapporto fra le prove.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: 2/3 è il rapporto corretto; 3/2 è il reciproco e 1/2 copia η_B. 4/3 inverte la sola quota iniziale 3/4, non il rapporto dei carichi. Uno confonde totale uguale con ripartizione uguale. Finding 11 corretto nel finale aea78b9 e riletto.

Esito esatto indipendente: 2/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-12

Media delle due uscite: (3/4+1/2)/2=5/8. Ai dati medi R_L=5/2 Ω e R_c=3/2 Ω si ottiene ancora (5/2)/4=5/8 perché in queste due prove il totale R_L+R_c è identico, 4 Ω. È una coincidenza motivata, non una regola generale per questa funzione non lineare.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: Media5/8. Le alternative3/4 e1/2 ripetono una prova,5/4 non dimezza,1/8 è metà differenza. Il controesempio(1,1),(3,1) Ω dà media5/8 ma uscita ai dati medi2/3: la coincidenza del caso richiesto dipende dal totale4 Ω.

Esito esatto indipendente: 5/8. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-13

Bersaglio η_B=(2/3)(3/4)=1/2. Con R_L,B=2 Ω, 2/(2+R_c,B)=1/2 dà R_c,B=2 Ω. Dividendo per R_c,A=1 Ω segue il rapporto richiesto 2.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: Il bersaglioη_B=1/2 e R_L,B=2 Ω danno R_c,B=2 Ω e rapporto2. Le altre alternative invertono il rapporto, seguono soltanto le quote o lasciano R_c invariata; quest’ultima darebbeη_B=2/3.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-14

Il riferimento ha η=3/4 e lettura 9/4, quindi a_cal=(9/4)/(3/4)=3. La nuova lettura 3/2 restituisce η=1/2. Con R_c=2 Ω, R_L=ηR_c/(1−η)=2 Ω. La lettura strumentale non è direttamente una resistenza.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: Guadagno 3, quota decodificata 1/2 e R_L=2 Ω. Sei Ω darebbe D=9/4 anziché 3/2; non è l’omissione del guadagno applicato alla quota. Finding 14 corretto nel finale aea78b9 e riletto.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-15

η_A=3/4 e η_B=1/2. Guadagno a_cal=[5/2−2]/[3/4−1/2]=2, offset b_cal=2−2·(1/2)=1. Lettura 13/5 restituisce η_C=(13/5−1)/2=4/5. Con R_c=1 Ω si trova R_L=(4/5)/(1/5) Ω=4 Ω, nel dominio fisico.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: Guadagno2, offset1,η_C=4/5,R_L,C=4 Ω. Omettere offset dà13/10; omettere guadagno dopo sottrazione dà8/5: entrambe quote impossibili. Le controprove R_L=1 e2 Ω ricostruiscono D=2 e7/3.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-line-load-efficiency-16

Il vincolo R_L=3R_c rende η=3R_c/(4R_c)=3/4 per ogni R_c>0 finita. La misura è ridondante e non fissa la scala: infinite coppie positive (R_L,R_c)=(3x,x), x>0. Nessuna ulteriore misura assoluta è stata fornita.

Ipotesi: Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.

Distrattori e controprove: R_L=3R_c elimina la scala dalla quota. Le coppie(3,1) e(6,2) Ω sono esempi di una famiglia continua, non le uniche due. Nessuna e coppie indipendenti contraddicono rispettivamente gli esempi e il vincolo; R_c=0 è esclusa.

Esito esatto indipendente: Infinite coppie positive. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

SVG completo e PNG indipendente 640×1470 letti. Serie R_L=3 Ω e R_c=1 Ω, corrente 1 A e generatore 4 V: topologia senza ramo. Barre di potenza 180/60/240 corrispondono a 3/1/4 W, origine 150; barre delle quote 300/200/250 a 3/4,1/2,5/8 con scala distinta. Unica freccia separata, punta visibile e verso dal polo positivo. Simboli resistivi schematici, zeri 118 esterni agli assi.

UI del prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Identità fresh/saved su fixture finali effettive; confronto con ROOT integrato e replay canonico dell’integratore PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Il push pubblico è stato esplicitamente autorizzato dall’utente tramite ROOT.

Verifier SHA256 14db64e697dad8af806c91cd13892a7242b49003a4e366f44ae5b314585a889c. Package canonico SHA256 c0adf6ca14559a267adaa84f45dc16da8439d00f50514928631c170a5cb57fef. Binding canonico SHA256 62525f3c389b0497d31703be39cac636bb5734a53a6449253d1ff6bf9c30f95b. Report SHA256 15d806ae7870e9eb39a4a1fdb4042e80ff43da4bec61c4ee228d2d5494894a76.
