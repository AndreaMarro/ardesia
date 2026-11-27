"""Individual separate reading after immutable prompt-only derivations; no author imports."""
READING_COMPLETE=True
PRIMARY_MANUAL={13: 'Scelgo destra positiva. Lo spostamento complessivo è 12−4=8 m e la durata è 3+1=4 s. La velocità media '
     'orientata è quindi +2 m/s. La distanza percorsa 16 m divisa per 4 s darebbe la rapidità media 4 m/s, '
     'che è una grandezza differente. La media semplice delle due velocità non pesa correttamente durate '
     'diverse.',
 14: 'Nello stesso ambiente atmosferico, con la stessa acqua in quiete, p_fondo=p_atm+ρgh. Profondità h, '
     'densità e gravità sono uguali: le pressioni sui fondi sono uguali, indipendentemente dalla forma delle '
     'pareti. Le basi uguali rendono uguali anche le risultanti della pressione su quelle basi, ma non '
     'obbligano a uguagliare il peso totale del liquido. I carichi delle pareti partecipano al paradosso '
     'idrostatico.',
 15: 'Uso calore entrante positivo e lavoro compiuto sul gas positivo. Il primo principio dà '
     'ΔU=Q+W_sul_gas=60+25=85 J. Con il lavoro compiuto dal gas si avrebbe W_gas=−25 J e la forma '
     'equivalente ΔU=Q−W_gas. Il semplice fatto che il sistema sia un gas non permette di omettere il lavoro '
     'di compressione.',
 16: 'Per gli stessi estremi ΔU_e=qΔV. La carica +e ha aumento +3 eV, quella −e ha diminuzione −3 eV. Le '
     'variazioni hanno lo stesso modulo e segni opposti. Il lavoro della sola forza elettrica ha invece il '
     'segno contrario a ΔU_e. Lo spostamento può richiedere altre forze: non si sta deducendo la traiettoria '
     'dal solo segno della carica.',
 17: 'Per sorgenti in fase, contributi di uguale ampiezza e polarizzazione compatibile, un minimo completo '
     'richiede differenza di fase (2n+1)π. Le differenze di cammino in modulo sono quindi (n+1/2)λ=0,30 '
     'm+n·0,60 m, con n intero non negativo. Il minimo positivo è 0,30 m. Prima delle alternative non scelgo '
     'un singolo valore: potrebbero essere proposti anche 0,90 m, 1,50 m o altri semi-interi. Cammini interi '
     'di λ danno invece massimi.',
 18: 'I vettori sono perpendicolari: il quadrato del modulo della somma è 5²+12²=25+144=169 N². La radice '
     'positiva è 13 N. La somma scalare 17 N varrebbe per forze concordi sulla stessa retta; la differenza 7 '
     'N per forze opposte collineari. Non confondo un modulo con una componente.',
 19: 'La spinta di Archimede è il peso del liquido spostato, quindi 9 N verso l’alto. Il peso del blocco è 6 '
     'N verso il basso. Per equilibrio serve una forza aggiuntiva di 3 N verso il basso: 9−6−T=0. Il filo '
     'deve essere teso verso un ancoraggio sotto il blocco, non sospenderlo dall’alto. Il modulo della '
     'tensione è positivo; il verso discendente è parte necessaria della risposta.',
 20: 'Il secondo ramo vale 3+3=6 Ω perché i due resistori sono in serie senza derivazioni. Fra A e B '
     'rimangono due rami uguali da 6 Ω in parallelo: R_eq=6·6/(6+6)=3 Ω. L’equivalente è minore di ciascun '
     'ramo. Sommare tutti i valori senza seguire entrambi i nodi confonderebbe la topologia.',
 21: 'Durante la fusione all’equilibrio di una sostanza pura, a pressione mantenuta costante, la temperatura '
     'resta quella di fusione finché coesistono entrambe le fasi. L’energia fornita cambia la frazione fusa '
     'attraverso il calore latente; non produce necessariamente un aumento di temperatura. Il plateau '
     'termina quando la trasformazione è completata. Impurità, variazioni di pressione o assenza di '
     'equilibrio richiederebbero altro modello.',
 22: 'Per una sola specie senza produzione il rapporto fra attività segue lo stesso esponenziale della '
     'popolazione. 120/960=1/8=2⁻³: in 15 h sono trascorse tre emivite. L’emivita è quindi 15/3=5 h. Non si '
     'divide il tempo per il rapporto otto: i fattori di dimezzamento si contano mediante potenze di due.',
 23: 'Partenza da ferma e sole variazioni gravitazionali danno mgh=mv²/2. La massa si semplifica e '
     'v=√(2gh)=√(2·10·1,8)=√36=6 m/s. La radice positiva rappresenta il modulo. Se la biglia rotolasse con '
     'energia rotazionale o ci fossero perdite, questa ripartizione energetica andrebbe modificata; il '
     'prompt deve restare nel modello di caduta considerato.',
 24: 'Ogni capillare identico vede lo stesso salto di pressione imposto dalla pompa. A viscosità, raggio e '
     'lunghezza invariati, il suo flusso rimane Q=Δp/R_idraulica. Affiancare un secondo ramo uguale in '
     'parallelo aggiunge una seconda portata Q: il totale raddoppia. Occorrono capillari passivi, fluido '
     'newtoniano nel regime laminare sviluppato e nessun cambiamento del salto imposto; non si assume '
     'portata totale fissata.',
 25: 'Su un’interfaccia ferma e lineare il ritmo temporale della perturbazione incidente impone lo stesso '
     'ritmo alla perturbazione trasmessa. La frequenza è identica. Velocità e lunghezza d’onda possono '
     'cambiare mantenendo v=λf. L’intensità può cambiare per trasmissione/riflessione anche se i mezzi sono '
     'trasparenti. L’incidenza e la dispersione richiedono dati ulteriori per altri confronti.',
 26: 'Una traslazione rigida in un campo uniforme statico non cambia il flusso BAcosθ, perché area e '
     'orientazione sono fisse e la spira resta tutta dentro. La f.e.m. totale è zero. Equivalentemente '
     '∮(v×B)·dl=(v×B)·∮dl=0 quando v e B sono uniformi. Questo non afferma che ogni forza magnetica locale o '
     'ogni separazione di carica sia nulla.',
 27: 'Rispetto al gomito la reazione del perno ha braccio nullo. Il peso produce momento 18 N·0,30 m=5,4 '
     'N·m. Per equilibrio il tendine deve dare momento opposto: T·0,03 m=5,4 N·m. Ne segue T=180 N. I bracci '
     'sono già perpendicolari; non si aggiunge un seno o si usa la sola uguaglianza delle forze verticali.',
 28: 'Per una macchina termica reversibile che opera fra le sole sorgenti a 500 e 300 K, '
     'η_max=1−T_fredda/T_calda=1−300/500=2/5. La percentuale è 40%. Uso temperature assolute positive. Un '
     'motore irreversibile fra le stesse sole sorgenti non supera questo limite; rendimento e COP di un '
     'frigorifero sono rapporti diversi.',
 29: 'Bernoulli lungo la stessa linea di corrente, senza perdite e senza macchina nel tratto orizzontale, dà '
     'p+ρv²/2 costante. Poiché v_B>v_A e ρ>0, p_B−p_A=−ρ(v_B²−v_A²)/2<0: la pressione statica diminuisce. '
     'Non si deduce che la pressione totale diminuisca; la quota è uguale e il contributo dinamico aumenta.',
 30: 'Il condensatore è isolato e conserva la carica libera sulle armature. L’energia elettrostatica '
     'U=Q²/(2C) diventa metà quando C raddoppia. La locuzione senza perdite non rende costante la sola '
     'energia del campo: un’azione meccanica può ricevere il lavoro della forza sul dielettrico. Il caso con '
     'generatore collegato avrebbe il vincolo V costante e una conclusione diversa.',
 31: 'Nel vuoto E=hc/λ con h e c comuni positivi. Raddoppiare l’energia dimezza la lunghezza d’onda: '
     'λ_altaE=λ_bassaE/2. Raddoppia anche la frequenza, non la velocità della luce. Confronto energie di '
     'fotoni distinti, senza attribuire carica elettrica al fotone.',
 32: 'L’impulso è ∫Fdt, area del diagramma forza-tempo. La figura mostra un triangolo di base totale 0,50 s '
     'e altezza 12 N: J=12·0,50/2=3 N·s. Il picco non deve essere temporalmente a metà per conservare '
     'quest’area. Il verso unidirezionale rende l’impulso concorde alla forza. N·s coincide dimensionalmente '
     'con kg·m/s.',
 33: 'I due blocchi hanno la stessa capacità termica totale positiva e costante e il sistema non scambia '
     'energia con l’esterno. Il bilancio C(T_f−15)+C(T_f−45)=0 dà 2T_f=60 e T_f=30 °C. Si usano differenze '
     'di temperatura, per cui la media è coerente anche cambiando origine Celsius/kelvin. Non si moltiplica '
     'ancora per una massa se la capacità assegnata è già totale.',
 34: 'Il volume materiale di campioni disgiunti si somma nel confronto descritto: è una grandezza estensiva. '
     'Aggiungere un secondo campione non raddoppia necessariamente una grandezza intensiva come temperatura '
     'o densità. L’enunciato parla di volumi materiali disgiunti, non dell’additività di volumi di una '
     'miscela che può contrarsi.',
 35: 'La differenza p_assoluta−p_atmosferica è la pressione relativa, detta anche manometrica o gauge. Può '
     'essere negativa se la pressione assoluta è inferiore a quella atmosferica, senza che sia negativa la '
     'pressione assoluta. Il nome dipende dal riferimento sottratto, non dalla densità del fluido.',
 36: 'L’ampere è il nome SI del coulomb al secondo: una corrente di 1 A trasferisce una carica di 1 C in 1 s '
     'nel bilancio medio uniforme. Coulomb misura carica e ampere corrente, non energia. Per correnti '
     'variabili la relazione integrata è Δq=∫Idt.',
 37: 'ω=2πf si chiama pulsazione o frequenza angolare. L’unità di presentazione è rad/s, mentre f conta '
     'cicli al secondo in hertz. Il fattore 2π converte cicli in radianti e non indica un raddoppio della '
     'frequenza temporale.',
 38: 'La trasformazione a volume costante è isocora, detta anche isovolumica. Per il solo lavoro di volume '
     '∫p dV essa ha lavoro nullo. Non ne segue che siano costanti pressione, temperatura o energia interna, '
     'né che siano assenti altri tipi di lavoro se presenti.',
 39: 'Per una goccia sferica di liquido con singola interfaccia, il salto di pressione interno meno esterno '
     'è Δp=2γ/r: legge di Laplace o Young–Laplace, nel modello statico di tensione superficiale uniforme. La '
     'formula a doppia interfaccia di una bolla saponosa non va applicata automaticamente a una goccia.',
 40: 'La terza legge di Newton parla di azione e reazione. Le due forze hanno uguale modulo, verso opposto e '
     'sono applicate a corpi diversi. Non si annullano nel bilancio delle forze di uno stesso corpo. Le '
     'accelerazioni possono differire se differiscono le masse.',
 41: 'L’argomento di un’esponenziale reale che descrive un rapporto fisico deve essere adimensionale. Dunque '
     'μx è adimensionale e μ ha dimensione di lunghezza inversa se x è una lunghezza. Per attenuazione '
     'passiva usuale μ≥0 e x≥0 danno trasmissione non maggiore di uno; questa disuguaglianza è distinta dal '
     'requisito dimensionale.',
 42: 'Il rapporto vettoriale F_e/q_prova definisce il campo elettrico E, per una carica di prova positiva '
     'non nulla sufficientemente piccola da non perturbare la sorgente. Il verso coincide con quello della '
     'forza sulla prova positiva. La dimensione è N/C, equivalente a V/m; non è il potenziale scalare.',
 43: 'S è l’entropia, funzione di stato con unità J/K. Una variazione si può calcolare tramite un cammino '
     'reversibile di riferimento ∫δQ_rev/T fra gli stessi stati. Non si identifica in generale con il solo '
     'calore reale diviso per una temperatura scelta e non è una funzione di percorso.'}
ASSUMPTIONS={13: 'Durate positive; spostamenti orientati, non distanza. Non occorre moto uniforme nei singoli tratti.',
 14: 'Stessa acqua ferma, gravità, profondità e pressione atmosferica; capillarità trascurata.',
 15: 'Sistema chiuso; calore entrante e lavoro ricevuto positivi; energia cinetica/potenziale macroscopica '
     'trascurata.',
 16: 'Stessi estremi del campo elettrostatico e cariche opposte di modulo e; ΔV finale meno iniziale.',
 17: 'Sorgenti coerenti in fase, contributi non nulli di uguale ampiezza e stessa polarizzazione; '
     'controllate tutte le alternative semi-intere.',
 18: 'Forze ortogonali sullo stesso corpo; modulo positivo della somma vettoriale.',
 19: 'Equilibrio lontano da pareti/fondo; spinta 9 N e peso 6 N, ancoraggio inferiore; il verso della '
     'tensione è parte del risultato.',
 20: 'Stessi due nodi per entrambi i rami; due 3 Ω in serie nel secondo ramo; resistenze positive.',
 21: 'Sostanza pura, pressione fissa, coesistenza delle due fasi in equilibrio; plateau limitato alla '
     'trasformazione.',
 22: 'Una singola specie senza produzione; decadimento statistico con costante invariata; attività e numero '
     'atteso hanno uguale fattore.',
 23: 'Partenza da ferma, solo peso, perdite assenti e dislivello positivo; rapidità come modulo.',
 24: 'Stessa caduta positiva di pressione mantenuta dal generatore e rami identici indipendenti: ogni ramo '
     'conserva la portata.',
 25: 'Interfaccia fissa e lineare, luce monocromatica e onda effettivamente trasmessa.',
 26: 'Spira rigida chiusa interamente in campo uniforme statico; traslazione uniforme, area e orientazione '
     'fisse.',
 27: 'Modello statico con bracci perpendicolari; reazione nel polo senza momento; altri pesi trascurati.',
 28: 'Ciclo reversibile fra due sorgenti ideali a temperature assolute costanti 500 K e 300 K.',
 29: 'Stazionario incomprimibile lungo la stessa linea orizzontale, nessuna perdita o macchina/lavoro '
     'd’albero fra le sezioni.',
 30: 'Condensatore isolato con carica libera non nulla; inserimento completo raddoppia C; energia del campo '
     'scambia lavoro meccanico.',
 31: 'Fotoni nel vuoto; hc comune e positivo; energia doppia implica λ dimezzata, non rapidità diversa.',
 32: 'Forza unidirezionale triangolare di base 0,50 s e altezza 12 N, due rampe lineari; picco interno '
     'irrilevante per area.',
 33: 'Due capacità totali uguali positive costanti, isolamento, nessuna fase o capacità aggiuntiva; media '
     'affine Celsius lecita.',
 34: 'Campioni disgiunti senza trasformazione; nessuna additività di volumi di miscela implicita.',
 35: 'Pressione relativa definita con riferimento atmosferico; può essere negativa con assoluta positiva.',
 36: 'Nome SI della corrente, carica netta per durata; C/s=A.',
 37: 'ω=2πf è pulsazione in rad/s; k spaziale in rad/m distinto.',
 38: 'Volume fisso: nullo solo il lavoro di frontiera p_ext dV; non implica assenza di ogni lavoro/calorico.',
 39: 'Goccia sferica in equilibrio a una sola interfaccia;2γ/r, non 4γ/r del film doppio.',
 40: 'Forze reciproche contemporanee su due corpi distinti; moduli opposti senza imporre accelerazioni '
     'uguali.',
 41: 'Argomento esponenziale puro; μ dimensione inversa di lunghezza, I e I0 stessa unità.',
 42: 'Campo elettrico vettoriale F/q con carica positiva non perturbante; cambio q non cambia campo '
     'prescritto.',
 43: 'Entropia funzione di stato, J/K; integrale reversibile fra estremi per qualunque processo reale.'}
DISTRACTORS={13: 'Alternative lette individualmente. 4 m/s sarebbe la distanza totale 16 m divisa per 4 s, cioè la '
     'rapidità media, non la velocità media orientata. Fare la media semplice delle velocità dei due tratti '
     'ignorerebbe le durate diverse. Lo spostamento positivo fissa il segno del risultato.',
 14: 'Alternative lette individualmente. La forma e il volume possono cambiare il peso d’acqua senza '
     'cambiare ρgh. Aperto significa pressione atmosferica alla superficie, non pressione assoluta nulla sul '
     'fondo. Le basi uguali rendono uguali anche le forze di pressione corrispondenti, ma non sono '
     'necessarie all’uguaglianza delle pressioni.',
 15: 'Alternative lette individualmente. 35 J sottrarrebbe il modulo del lavoro ricevuto come se fosse '
     'lavoro ceduto. 60 J omette il trasferimento meccanico e 25 J omette il calore. Non si assegna il segno '
     'dal solo verbo lavoro: conta chi lo compie su chi.',
 16: 'Alternative lette individualmente. Il lavoro del campo ha segno opposto a ΔU e non è la grandezza '
     'richiesta. Stessi punti significano stesso ΔV, non stessa ΔU per cariche opposte. I moduli sono uguali '
     'perché anche i moduli delle cariche sono uguali.',
 17: 'Alternative lette individualmente. 0 m, 0,60 m, 1,20 m e 1,80 m corrispondono a un numero intero di '
     'lunghezze d’onda e conservano la fase concorde. Non basta una distanza maggiore per ottenere un '
     'minimo: conta il resto rispetto al ciclo. Le condizioni sulle ampiezze e sulla polarizzazione sono '
     'necessarie per annullare la somma.',
 18: 'Alternative lette individualmente. 17 N somma i moduli come per forze concordi sulla stessa retta. 7 N '
     'sarebbe la differenza per forze collineari opposte. 169 N copia il valore numerico del quadrato senza '
     'estrarre la radice e senza mantenerne le unità N².',
 19: 'Alternative lette individualmente. Una forza del filo verso l’alto aumenterebbe lo squilibrio invece '
     'di compensarlo. 15 N è la somma dei due moduli, ma peso e spinta sono opposti. Il peso del corpo non '
     'sostituisce il peso d’acqua spostata nella legge di Archimede.',
 20: 'Alternative lette individualmente. 12 Ω tratterebbe i due rami come se fossero in serie. 6 Ω considera '
     'un solo ramo e ignora il percorso aggiuntivo per la corrente. I resistori da 3 Ω non sono direttamente '
     'in parallelo perché non condividono entrambi i nodi.',
 21: 'Alternative lette individualmente. Temperatura costante non significa trasferimento energetico nullo. '
     'La legge Q=mcΔT da sola non descrive il calore latente durante la coesistenza. Non si estende il '
     'tratto a temperatura costante a ogni successivo riscaldamento del liquido.',
 22: 'Alternative lette individualmente. 15 h è il tempo totale per tre dimezzamenti, non per uno. Dividere '
     'il tempo per otto confonde il fattore di diminuzione con il numero di emivite. I becquerel misurano '
     'un’attività, non un conteggio cumulativo di decadimenti.',
 23: 'Alternative lette individualmente. 36 copia il valore numerico di v² senza estrarre la radice. Usare '
     'solo gh ometterebbe il fattore due del bilancio cinetico. Una velocità orientata richiederebbe anche '
     'una convenzione per l’asse, mentre la rapidità è un modulo.',
 24: 'Alternative lette individualmente. Lasciare invariata la totale richiederebbe modificare il vincolo di '
     'pressione o le resistenze. Quadruplicare confonderebbe l’aggiunta di un ramo con una diversa '
     'variazione della geometria di ciascun capillare. Qui ogni ramo è identico e la pressione comune resta '
     'assegnata.',
 25: 'Alternative lette individualmente. L’uguaglianza delle velocità non è imposta se cambiano gli indici. '
     'A frequenza uguale, una diversa velocità richiede una diversa λ. La direzione può restare invariata a '
     'incidenza normale, ma questa è una condizione particolare, non una necessità a ogni incidenza.',
 26: 'Alternative lette individualmente. Una spira che entra o esce dalla regione di campo sarebbe un’altra '
     'preparazione, esclusa qui dal vincolo interamente nel campo uniforme. Anche una rotazione o una '
     'variazione di B potrebbe cambiare il flusso, ma nessuna è presente.',
 27: 'Alternative lette individualmente. 18 N ignorerebbe i bracci diversi. 1,8 N userebbe il rapporto dei '
     'bracci al contrario. Una tensione maggiore del peso è coerente con il braccio del tendine dieci volte '
     'più corto: equilibrio dei momenti non significa uguaglianza di queste due forze.',
 28: 'Alternative lette individualmente. 60% è il rapporto T_c/T_h, non il suo complemento. 200 K è una '
     'differenza di temperature e non un rendimento. Usare temperature Celsius nel rapporto non conserva il '
     'bilancio reversibile.',
 29: 'Alternative lette individualmente. La sola uguaglianza delle quote non rende costante la pressione se '
     'cambia la velocità. Conservare la portata è una condizione di continuità e non sostituisce il bilancio '
     'di energia. In presenza di perdite o macchine occorrerebbero termini aggiuntivi, assenti dal modello.',
 30: 'Alternative lette individualmente. Usare U=CV²/2 mantenendo anche V costante descriverebbe il '
     'collegamento a un generatore, non l’isolamento. La carica non nulla e la capacità finita mantengono '
     'energia positiva, quindi non si annulla.',
 31: 'Alternative lette individualmente. Una lunghezza d’onda doppia darebbe energia dimezzata, al contrario '
     'del dato. Stessa velocità di propagazione nel vuoto non significa stessa frequenza o λ. Un’energia '
     'finita positiva non corrisponde a λ nulla.',
 32: 'Alternative lette individualmente. 6 N·s sarebbe l’area del rettangolo che mantiene 12 N per tutta la '
     'durata. La forza media è 6 N, ma il suo valore numerico non è l’impulso: va ancora moltiplicato per '
     '0,50 s. Il grafico forza-tempo non è una traiettoria.',
 33: 'Alternative lette individualmente. 60 °C è la somma delle letture, non una temperatura d’equilibrio '
     'compatibile con due corpi inizialmente più freddi. Le sole masse uguali non sarebbero sufficienti se i '
     'calori specifici fossero diversi: il dato usato qui è l’uguaglianza delle capacità totali.',
 34: 'Alternative lette individualmente. Una grandezza intensiva non cresce nello stesso modo aggiungendo '
     'copie del sistema. Estensiva non significa priva di unità: il volume ha unità m³. La classificazione '
     'non riguarda un verso vettoriale o la conservatività di una forza.',
 35: 'Alternative lette individualmente. La pressione assoluta non sottrae questo riferimento. Il termine '
     'idrostatico descrive una variazione con la profondità e non è il nome della scelta di zero. Pressione '
     'e tensione superficiale hanno unità diverse.',
 36: 'Alternative lette individualmente. Volt misura differenza di potenziale, ohm resistenza, farad '
     'capacità e joule energia. Nessuno di questi nomi sostituisce C/s. Una carica totale è in coulomb e non '
     'va confusa con la corrente.',
 37: 'Alternative lette individualmente. Il periodo è un tempo e vale 1/f. Il numero d’onda spaziale k è in '
     'rad/m, non rad/s. L’ampiezza misura una grandezza oscillante massima e non la rapidità con cui cresce '
     'la fase.',
 38: 'Alternative lette individualmente. Isobara mantiene la pressione e isoterma la temperatura. Adiabatica '
     'riguarda il calore scambiato. Tornare allo stato iniziale è una proprietà di un ciclo, non una '
     'conseguenza del solo volume costante.',
 39: 'Alternative lette individualmente. Ohm riguarda un legame elettrico, Hooke una risposta elastica, '
     'Faraday l’induzione e Snell la rifrazione. Il fattore 4γ/R appartiene al modello di una bolla con due '
     'superfici, non alla goccia con una sola interfaccia.',
 40: 'Alternative lette individualmente. Stesso corpo o ritardo temporale non descrivono la terza legge. Le '
     'accelerazioni dei due corpi possono differire se le masse differiscono, senza violare l’uguaglianza '
     'dei moduli delle forze reciproche.',
 41: 'Alternative lette individualmente. Il coefficiente μ non ha le stesse unità di x: le deve cancellare '
     'nel prodotto. Adimensionale non significa che μ sia zero o che l’intensità non diminuisca. L’unità di '
     'I non entra nell’esponente.',
 42: 'Alternative lette individualmente. Il potenziale è energia per carica e ha natura scalare, mentre qui '
     'si divide una forza vettoriale. N/C è l’unità del campo; J/C sarebbe invece il volt del potenziale. '
     'Una prova che perturba le sorgenti richiederebbe un diverso modello.',
 43: 'Alternative lette individualmente. Energia interna, lavoro e calore hanno unità joule; temperatura '
     'assoluta kelvin. Calore e lavoro sono trasferimenti e non funzioni di stato del sistema. Non si '
     'identifica S con Q/T per qualunque processo reale senza controllare le ipotesi.'}
CONCEPTUAL={14: 'Sono uguali',
 16: '+3 eV per +e e −3 eV per −e',
 19: '3 N verso il basso',
 21: 'La temperatura resta costante mentre aumenta la frazione liquida',
 24: 'Raddoppia',
 25: 'La frequenza',
 29: 'Diminuisce',
 30: 'Diventa la metà',
 31: 'È la metà',
 34: 'Estensiva',
 35: 'Relativa o manometrica',
 36: 'Ampere',
 37: 'Pulsazione',
 38: 'Isocora',
 39: 'Legge di Laplace',
 40: 'Una forza di reazione uguale in modulo e opposta in verso sull’altro corpo',
 41: 'Adimensionale',
 42: 'Campo elettrico',
 43: 'Entropia'}
