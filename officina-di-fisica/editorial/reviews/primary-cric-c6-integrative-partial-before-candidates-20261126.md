# Preparazione parziale C6: primaria indipendente dei 13 problemi integrativi

Questa parte copre soltanto il cohort cric-c6-integrative dell’assegnazione: 12 prompt in C6.json e C6-AQ01 in lotto-001.json. Non copre ancora i 31 problemi del secondo esame protetto assegnati alla futura review B. Nessun credito scientifico deriva da questa preparazione.

Estrazione con allowlist dei soli id e prompt dalle fonti individuali dell’assegnazione, senza opzioni, chiavi, svolgimenti, hint o figure. I due file grezzi sono stati deserializzati per selezionare la whitelist; i campi esclusi non sono stati mostrati o utilizzati nelle derivazioni. La prima lettura si era fermata su AQ01 assente dal file C6.json: il percorso corretto è stato poi risolto dall’assegnazione, senza inventare un ID.

Disclosure: il revisore ha già studiato e revisionato contenuti degli altri corsi e problemi Ardesia sugli stessi argomenti. Non è una prima esposizione ai modelli fisici. Nessuna chiave, opzione, soluzione o candidatura C6 è stata aperta; eventuali somiglianze con problemi già noti non sono attribuite a cecità assoluta. Le condizioni mancanti sono registrate, non supplite tacitamente come fatti del prompt.

Fonte Git 5d1dc8dc7b601aef959d10d564c75462be74708d. Modello computazionale di questa parte ancora NOT_RUN; primaria manuale soltanto. Esami nell’app default-deny, nessuna pubblicazione o approvazione umana.

## C6-Q001

Prompt originale: Due sensori sono distanti 30 cm. Un segnale acustico attraversa il tratto d’acqua a 1500 m/s. Il primo sensore avvia il cronometro e il secondo lo ferma. Qual è la lettura in µs?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Un tempo di transito, non di andata e ritorno. Derivazione indipendente: Il primo sensore avvia e il secondo arresta: t=d/c=(3/10)/1500 s=1/5000 s=200 μs. Non compare il fattore due dell’eco. La distanza è il percorso effettivo nel mezzo e la velocità è assegnata costante.

## C6-Q002

Prompt originale: Un pistone di area 2,0 cm² sostiene una differenza di pressione di 25 kPa. Quale massa in kg eserciterebbe lo stesso peso se g = 10 m/s²?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

La differenza di pressione produce la forza netta. Derivazione indipendente: A=2·10⁻⁴ m², Δp=25000 Pa. La forza risultante delle due facce è Δp A=5 N, equivalente a m=F/g=1/2 kg con g assegnata. Non occorre sommare la pressione atmosferica comune sulle due facce; il dato è una differenza.

## C6-Q003

Prompt originale: Una pompa manda 90 mL/min a un raccordo. Un ramo scarica 30 mL/min e un serbatoio laterale accumula 12 mL/min. Quanto scorre nel terzo ramo, in mL/min?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

L’accumulo è un’uscita dal bilancio del raccordo. Derivazione indipendente: Per un liquido incomprimibile, con portate volumetriche riferite allo stesso liquido, il flusso entrante 90 si ripartisce in 30, nell’accumulo laterale di 12 e nel terzo ramo. Quindi 90−30−12=48 mL/min. Non imporre stazionarietà dell’intero sistema: il serbatoio sta accumulando.

## C6-Q004

Prompt originale: In un tratto di filo passano 12 C in un minuto mentre la caduta di tensione vale 5,0 V. Quale potenza in W riceve il tratto?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

La durata determina una corrente media. Derivazione indipendente: In un minuto passa Q=12 C: I media=12/60 A=1/5 A. Se la caduta è 5 V costante nell’intervallo, P media=VQ/Δt=1 W. I dati non determinano una potenza istantanea se la corrente varia: una nuova edizione deve chiedere la media o dichiarare corrente costante.

## C6-Q005

Prompt originale: Un blocco che scende perde 30 J di energia potenziale. Un calorimetro collegato registra 24 J. La velocità del blocco resta costante. Quanta energia in J finisce in altri canali nel bilancio complessivo?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

La velocità costante esclude un saldo cinetico. Derivazione indipendente: La diminuzione potenziale fornisce 30 J. Con ΔK=0, se questo è l’ingresso meccanico complessivo del sistema considerato, i 24 J registrati lasciano 30−24=6 J ad altri canali, compreso eventuale accumulo interno non misurato. Esplicitare che non sono presenti ulteriori apporti energetici al bilancio.

## C6-Q006

Prompt originale: Una macchina assorbe 900 J di calore da una sorgente e cede 600 J a una seconda tornando allo stato iniziale. Un generatore converte l’80% del lavoro in elettricità. Qual è l’energia elettrica in J?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Un ciclo prima della conversione elettrica. Derivazione indipendente: Il ritorno allo stato iniziale annulla ΔU. Il lavoro netto prodotto è 900−600=300 J. La conversione elettrica all’80% ne rende 4/5·300=240 J. Il 20% restante del lavoro non va confuso con i 600 J ceduti direttamente dalla macchina.

## C6-Q007

Prompt originale: In un tubo rigido a flusso laminare stazionario, stessa viscosità e lunghezza, il raggio raddoppia. Quale Δp₂/Δp₁ serve per conservare la stessa portata?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Mantenere una portata non nulla con il raggio doppio. Derivazione indipendente: Nel modello laminare newtoniano sviluppato di Poiseuille, Q è proporzionale a Δp r⁴ a lunghezza e viscosità comuni positive. Raddoppiare r moltiplica il coefficiente per 16; per mantenere la stessa portata non nulla serve Δp₂/Δp₁=1/16. Il rapporto richiede Δp₁≠0; una preparazione a portata nulla lo renderebbe indefinito.

## C6-Q008

Prompt originale: L’attività di una sorgente puntiforme scende alla metà. Un piccolo rivelatore identico e perpendicolare viene spostato a distanza tripla. Senza fondo o assorbimento, di quale fattore si riduce il tasso di conteggio, cioè quanto vale iniziale/finale?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Due fattori indipendenti del conteggio. Derivazione indipendente: Per emissione isotropa, stessa efficienza e piccola area normale, il tasso è proporzionale all’attività e a 1/r². Il secondo tasso è (1/2)(1/9)=1/18 del primo, perciò iniziale/finale=18. Attività e distanza iniziali devono essere positive, fondo e attenuazione sono esclusi dal prompt.

## C6-Q009

Prompt originale: Una corrente vale +0,30 A per 4 s e poi −0,10 A per 5 s. Qual è la carica netta passata nel verso positivo, in coulomb?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Integrare una corrente orientata. Derivazione indipendente: Il primo intervallo trasporta (3/10)·4=6/5 C nel verso positivo; il secondo (−1/10)·5=−1/2 C. La somma algebrica è 7/10 C. Sommare i moduli produrrebbe 17/10 C e risponderebbe a un’altra domanda.

## C6-Q010

Prompt originale: Un tubo pieno dello stesso liquido ha due prese verticalmente separate di 0,25 m. La pressione alla presa inferiore supera quella superiore di 2,0 kPa. Con g = 10 m/s², trova la densità in kg/m³.

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Un dislivello richiede una condizione idrostatica. Derivazione indipendente: Se il liquido è fermo, Δp=ρgΔh e ρ=2000/(10·1/4)=800 kg/m³. Il solo fatto che il tubo sia pieno non esclude contributi dinamici: una nuova edizione deve dire fluido fermo o specificare condizioni che cancellino quei contributi. Non assumere una legge idrostatica universale per ogni flusso.

## C6-Q011

Prompt originale: Al maggiore livello di un segnale luminoso, quale singola osservazione permette di attribuire l’aumento al numero di fotoni incidenti al secondo e non a un cambiamento della loro energia, per un fascio monocromatico che investe tutto il sensore?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

La frequenza distingue l’energia del singolo fotone. Derivazione indipendente: L’energia per fotone monocromatico è hf. Fra le due ipotesi date, osservare frequenza invariata (equivalentemente lunghezza d’onda invariata nello stesso mezzo) esclude un cambiamento di hf. Con geometria, risposta ed efficienza del sensore invariati, il livello maggiore si attribuisce allora al tasso di fotoni maggiore. La sola intensità non separa i due fattori.

## C6-Q012

Prompt originale: Una lampada trasforma il 20% di 5 W elettrici in luce. Un rivelatore riceve il 2% di tutta la luce emessa. Che energia in mJ riceve in 3 s?

Fonte: officina-di-fisica/content/C6.json (SHA256 3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c).

Seguire due rendimenti prima della durata. Derivazione indipendente: La potenza luminosa è (1/5)·5=1 W. Il rivelatore ne riceve 1/50 W; in 3 s riceve3/50 J=60 mJ. Le frazioni sono di energie o potenze successive, non vanno sommate; assumere regime e frazioni costanti durante i 3 s.

## C6-AQ01

Prompt originale: In un banco ad acqua un riscaldatore trasferisce 8,0 W al liquido. In regime stazionario l’acqua esce 0,50 K più calda. Trascurando dispersioni e variazioni di quota e velocità, calcola la portata in mL/s. Usa c = 4 000 J/(kg K) e ρ = 1 000 kg/m³.

Fonte: officina-di-fisica/content/lotto-001.json (SHA256 71c563d3ea98f92602f04d1956df968bf125b85fad72521bd6742d8070e53e2a).

Una portata da un bilancio di energia aperto. Derivazione indipendente: In regime stazionario e con le perdite e i contributi macroscopici esclusi, P=ṁ c ΔT. Quindi ṁ=8/(4000·1/2)=1/250 kg/s. Dividendo per ρ = 1000 kg/m³ si ottiene 1/250000 m³/s=4 mL/s. Il dato 8 W è già la potenza trasferita al liquido, senza introdurre un rendimento aggiuntivo.
