"""Lezioni ed esempi di elettricità e magnetismo."""

from c34_base import *

lesson(
    "C4",
    1,
    "Cariche che si attraggono e si respingono",
    "6.1 Carica elettrica, segno, unità e conservazione|6.1 Interazione fra cariche puntiformi e legge di Coulomb",
    [],
    "Strofina due materiali isolanti e separali. Il trasferimento di elettroni lascia un eccesso di carica negativa su uno e un difetto sull’altro. La carica q è una grandezza algebrica, misurata in coulomb (C). In un sistema isolato la somma algebrica delle cariche si conserva. In un normale processo di elettrizzazione non cambiano i nuclei degli atomi.",
    "Le cariche dello stesso segno si respingono e quelle opposte si attraggono. Per due oggetti piccoli rispetto alla loro distanza, assimilabili a cariche puntiformi ferme nel vuoto, la forza agisce lungo la congiungente. Ciascuna carica esercita sull’altra una forza di uguale modulo e verso opposto.",
    fig(
        "C4-coulomb",
        "Le frecce sono applicate a due corpi distinti. La distanza r collega le posizioni delle cariche puntiformi.",
    ),
    eq(r"F=k\frac{|q_1q_2|}{r^2},\qquad k\simeq8{,}99\cdot10^9\ \mathrm{N\,m^2/C^2}"),
    "Il modulo F è in newton usando coulomb e metri. Il segno del prodotto determina attrazione o repulsione, mentre il modulo stabilisce la grandezza delle frecce. Dimezzare la distanza a cariche costanti moltiplica F per quattro.",
    "Le cariche ordinarie sono multipli della carica elementare e ≈ 1,602 × 10⁻¹⁹ C. Se occorre contare elettroni trasferiti, dividi il modulo della carica per e. Il segno dice se c’è un eccesso o un difetto di elettroni. Per più interazioni costruisci una freccia per ogni forza e somma le frecce applicate allo stesso corpo.",
)
ex(
    "Una coppia di cariche di segno opposto",
    "Due piccole sfere nel vuoto portano +2,0 nC e −3,0 nC a distanza di 3,0 cm fra i centri. Calcola il modulo e indica il verso della forza su ciascuna. Usa k = 9,0 × 10⁹ N·m²/C².",
    2,
    fig(
        "C4-coulomb",
        "Ogni freccia punta verso la carica di segno opposto. Nessuna delle due sfere è il punto di applicazione di entrambe le forze.",
    ),
    eq(
        r"r=0{,}030\ \mathrm m,\qquad |q_1q_2|=(2\cdot10^{-9})(3\cdot10^{-9})=6\cdot10^{-18}\ \mathrm{C^2}"
    ),
    eq(
        r"F=9{,}0\cdot10^9\frac{6\cdot10^{-18}}{(0{,}030)^2}=6{,}0\cdot10^{-5}\ \mathrm N"
    ),
    "La forza è attrattiva. Le due forze hanno uguale modulo anche se i moduli delle cariche sono diversi.",
)
ex(
    "Trasferimento fra due conduttori identici",
    "Due sfere conduttrici identiche, inizialmente con +8 nC e −2 nC, vengono collegate da un filo e poi separate. Trascuriamo il filo e altri conduttori; la disposizione è simmetrica. Trova le cariche finali.",
    2,
    "Il filo consente il movimento degli elettroni. Il sistema delle due sfere è elettricamente isolato e la carica totale iniziale è la somma algebrica.",
    eq(r"Q_{\rm tot}=+8+(-2)=+6\ \mathrm{nC}"),
    "Per simmetria, a equilibrio le sfere identiche portano la stessa carica: due volte tale valore deve restituire il totale.",
    eq(r"2q_f=+6\ \mathrm{nC}\quad\Longrightarrow\quad q_f=+3\ \mathrm{nC}"),
    "La prima sfera è diventata meno positiva, quindi ha ricevuto elettroni. La seconda è diventata più positiva e ne ha ceduti.",
)

lesson(
    "C4",
    2,
    "Guardare il campo prima della forza",
    "6.1 Campo elettrico e linee di forza|6.1 Campo di una o più cariche puntiformi|6.1 Moto in un campo elettrico uniforme",
    [1],
    "Metti in un punto una piccola carica di prova positiva che perturbi in modo trascurabile le sorgenti. Il rapporto fra la forza misurata e la carica definisce il campo E in quel punto. Il campo appartiene alla distribuzione sorgente. Quando vi si introduce una carica q, la forza elettrica su quella carica è qE.",
    eq(
        r"\vec E=\frac{\vec F_{\rm prova}}{q_{\rm prova}},\qquad\vec F=q\vec E,\qquad [E]=\mathrm{N/C}"
    ),
    fig(
        "C4-campo",
        "Fra due grandi piastre cariche, lontano dai bordi, le linee quasi parallele vanno dalla piastra positiva alla negativa. La forza su una carica negativa va in verso opposto al campo.",
    ),
    "La tangente a una linea di campo dà la direzione del campo locale. La freccia segue la forza su una prova positiva. Le linee escono dalle cariche positive ed entrano nelle negative. Dove il campo è diverso da zero due linee non si incrociano: altrimenti darebbero due direzioni nello stesso punto.",
    eq(r"\vec E_i=k\frac{q_i}{r_i^2}\hat r_i,\qquad \vec E_{\rm tot}=\sum_i\vec E_i"),
    "Il versore radiale punta dalla sorgente al punto di osservazione. Una sorgente negativa inverte il verso. Con più sorgenti si sommano vettori: puoi sommare algebricamente le componenti lungo assi scelti. Aggiungere sempre i moduli ignora possibili cancellazioni.",
    "Se il campo è uniforme e le altre forze sono trascurabili, una particella di massa m ha accelerazione costante qE/m. Lungo una direzione perpendicolare al campo conserva la componente iniziale di velocità. Con velocità iniziale trasversale la combinazione dà una parabola nel regime non relativistico.",
    eq(r"\vec a=\frac{q}{m}\vec E,\quad x=x_0+v_{0x}t+\tfrac12a_xt^2"),
)
ex(
    "Il punto medio di un dipolo",
    "Due sorgenti +1,0 nC a sinistra e −1,0 nC a destra distano 20 cm. Calcola il campo nel punto medio nel vuoto con k = 9,0 × 10⁹ N·m²/C².",
    2,
    fig(
        "C4-dipolo",
        "Nel punto P il campo generato dalla carica positiva si allontana da essa. Il campo generato dalla negativa si dirige verso di essa.",
    ),
    eq(
        r"r=0{,}10\ \mathrm m,\qquad E_1=E_2=9{,}0\cdot10^9\frac{10^{-9}}{(0{,}10)^2}=900\ \mathrm{N/C}"
    ),
    "Entrambe le frecce in P puntano verso destra. Definendo quel verso come positivo, entrambe le componenti hanno il segno più.",
    eq(r"E_x=900+900=1800\ \mathrm{N/C}"),
    "Il risultato ha verso dalla carica positiva alla negativa. Il fatto che la somma delle cariche sia zero non annulla il campo in questo punto.",
)
ex(
    "Deviazione di una particella",
    "Una particella di massa 2,0 × 10⁻⁶ kg e carica +4,0 × 10⁻⁸ C entra orizzontalmente a 3,0 m/s in una regione con campo uniforme 500 N/C diretto in alto. Trascurando altre forze, trova lo spostamento verticale dopo 0,20 s.",
    2,
    "Scegliamo l’alto come verso y positivo. La carica è positiva e subisce forza verso l’alto. La componente iniziale vy è zero.",
    eq(
        r"a_y=qE/m=\frac{4{,}0\cdot10^{-8}\cdot500}{2{,}0\cdot10^{-6}}=10\ \mathrm{m/s^2}"
    ),
    eq(r"\Delta y=\tfrac12 a_y t^2=\tfrac12\cdot10\cdot(0{,}20)^2=0{,}20\ \mathrm m"),
    "Intanto lo spostamento orizzontale è 3,0 × 0,20 = 0,60 m. Il moto è curvo benché il campo abbia direzione costante.",
)

lesson(
    "C4",
    3,
    "Dal potenziale all’energia",
    "6.2 Energia potenziale di una distribuzione di cariche|6.2 Potenziale e differenza di potenziale|6.2 Conservazione dell’energia in un campo elettrico",
    [1, 2],
    "Un campo elettrostatico può accelerare una particella. Descrivendo due punti con i potenziali VA e VB, la loro differenza ΔV = VB − VA rende immediato il cambiamento di energia potenziale di una carica q. Il potenziale si riferisce alla configurazione sorgente. L’energia della carica di prova dipende anche da q.",
    eq(
        r"\Delta U=q\Delta V,\qquad W_{\rm campo}=-\Delta U,\qquad 1\ \mathrm V=1\ \mathrm{J/C}"
    ),
    fig(
        "C4-potenziale",
        "Lungo un campo uniforme il potenziale scende. Le linee tratteggiate collegano punti equipotenziali. Attraversarle o seguirle produce differenze di potenziale diverse.",
    ),
    "È lecito scegliere un riferimento per lo zero del potenziale. Cambiare questa scelta sposta entrambi i valori della stessa costante e lascia invariata la differenza. Per una carica puntiforme nel vuoto poniamo spesso V = 0 all’infinito. Sommando più sorgenti si conservano i segni delle cariche, poiché V è scalare.",
    eq(r"V(P)=\sum_i k\frac{q_i}{r_i},\qquad U_{\rm coppia}=k\frac{q_1q_2}{r_{12}}"),
    "Per assemblare più cariche, si aggiunge l’energia di ciascuna coppia una sola volta. Se agisce solo la forza elettrica, la diminuzione di U uguaglia l’aumento di energia cinetica. Per una carica negativa il segno di ΔU si inverte rispetto a ΔV.",
    eq(
        r"\Delta K=-q\Delta V,\qquad \Delta V=-\vec E\cdot\Delta\vec r\quad(\vec E\ \text{uniforme})"
    ),
    "Usa il campo e la seconda legge quando il quesito riguarda tempi, forze o accelerazioni. Un bilancio con ΔV è particolarmente diretto quando si chiedono velocità fra punti e non serve ricostruire il percorso.",
)
ex(
    "Una carica negativa sale di potenziale",
    "Una particella con carica −2,0 μC passa da 10 a 40 V. Calcola ΔU e il lavoro del campo, supponendo forze elettrostatiche.",
    2,
    eq(r"\Delta V=40-10=+30\ \mathrm V,\qquad q=-2{,}0\cdot10^{-6}\ \mathrm C"),
    eq(r"\Delta U=q\Delta V=(-2{,}0\cdot10^{-6})(30)=-60\ \mu\mathrm J"),
    eq(r"W_{\rm campo}=-\Delta U=+60\ \mu\mathrm J"),
    "Pur raggiungendo un potenziale più alto, la carica negativa perde energia potenziale. Se agisce solo il campo il guadagno cinetico è 60 μJ.",
)
ex(
    "Tre cariche ai vertici",
    "Tre cariche uguali +1,0 nC stanno ai vertici di un triangolo equilatero di lato 0,10 m. Quale energia potenziale ha la configurazione rispetto alle cariche lontane? Usa k = 9,0 × 10⁹ N·m²/C².",
    3,
    "Elenca le coppie di vertici AB, BC e CA. Ciascuna coppia è distinta e ha lo stesso contributo. L’energia è positiva perché occorre lavoro esterno per avvicinare cariche che si respingono.",
    eq(r"U_{AB}=kq^2/r=9{,}0\cdot10^9(10^{-9})^2/0{,}10=9{,}0\cdot10^{-8}\ \mathrm J"),
    eq(r"U=U_{AB}+U_{BC}+U_{CA}=2{,}7\cdot10^{-7}\ \mathrm J"),
    "Contare anche BA, CB e AC conterebbe ogni coppia due volte. Il riferimento scelto assegna energia zero alle cariche infinitamente distanti.",
)

lesson(
    "C4",
    4,
    "Cariche mobili e cariche legate",
    "6.3 Conduttori e induzione elettrostatica|6.3 Dielettrici e polarizzazione",
    [1, 2, 3],
    "Avvicina una bacchetta positiva a un conduttore neutro isolato. Nel metallo gli elettroni mobili si accumulano sul lato vicino. Sul lato lontano rimane un difetto di elettroni. Il riassetto genera un campo che, all’equilibrio elettrostatico, cancella il campo all’interno del materiale conduttore.",
    fig(
        "C4-materiali",
        "A sinistra gli elettroni mobili del conduttore hanno lasciato cariche superficiali separate. A destra le cariche restano legate in dipoli localmente polarizzati. I due campioni sono complessivamente neutri.",
    ),
    "La ridistribuzione dovuta a un oggetto vicino è induzione elettrostatica. Un conduttore isolato conserva la carica totale. Collegarlo temporaneamente a terra può invece consentire ingresso o uscita di elettroni. Staccare la terra mentre la bacchetta è ancora vicina permette di isolare la carica acquisita.",
    "In un isolante le cariche possono spostarsi di poco in un atomo o in una molecola, oppure dipoli permanenti possono orientarsi parzialmente. Il materiale si polarizza pur rimanendo globalmente neutro. Per un dielettrico lineare la risposta viene descritta dalla permittività ε = εr ε0. Nei modelli usuali con εr > 1 un dielettrico riduce il campo tra piastre a carica libera fissata.",
    "In equilibrio elettrostatico, lungo il materiale di un conduttore collegato il potenziale è uniforme. Il campo immediatamente fuori dalla superficie è normale ad essa: una componente tangenziale farebbe continuare il moto delle cariche libere. Queste affermazioni esigono la condizione di equilibrio elettrostatico; un filo resistivo attraversato da corrente continua può avere una caduta di potenziale.",
)
ex(
    "Elettrizzare senza toccare",
    "Una sfera metallica neutra isolata viene avvicinata a una bacchetta positiva. Si collega la sfera a terra, si interrompe la terra e infine si allontana la bacchetta. Quale segno rimane?",
    2,
    fig(
        "C4-materiali",
        "Sulla sfera isolata il primo effetto è la separazione delle cariche. Il contatto con terra modifica poi il bilancio delle cariche mobili.",
    ),
    "La bacchetta positiva attira elettroni verso di sé. Quando la terra viene collegata, essa può fornire ulteriori elettroni alla sfera. Interrompendo il collegamento si impedisce loro di tornare a terra.",
    fig(
        "C4-induzione-terra",
        "Prima la terra può fornire elettroni. Il suo collegamento viene rimosso mentre la bacchetta è ancora vicina. La figura finale mostra la sfera dopo l’allontanamento della bacchetta.",
    ),
    "Rimossa la bacchetta, gli elettroni in eccesso si ridistribuiscono sulla superficie. La sfera resta negativa. Il procedimento dipende dall’ordine delle due ultime operazioni.",
)
ex(
    "Una goccia neutra attratta",
    "Una bacchetta carica attira un piccolo corpo dielettrico neutro in un campo non uniforme. Come può esserci una forza senza carica netta?",
    2,
    fig(
        "C4-dipolo-indotto",
        "La figura considera una bacchetta positiva. I contributi opposti alla forza hanno moduli diversi.",
    ),
    "Il campo polarizza il corpo. Le cariche legate di segno opposto a quello della bacchetta sono mediamente più vicine, quelle dello stesso segno più lontane.",
    "Le due regioni subiscono forze con versi opposti. Nel campo più intenso vicino alla bacchetta il contributo attrattivo è maggiore. La risultante può quindi orientarsi verso la regione di campo più intenso, pur restando nulla la somma delle cariche.",
    "In un campo esattamente uniforme le forze opposte su un dipolo ideale di carica totale nulla si compensano nella traslazione. Può rimanere un momento che tende a orientare il dipolo.",
)

lesson(
    "C4",
    5,
    "Quanto vale una corrente",
    "6.4 Corrente continua e intensità|6.4 Generatore ideale|6.4 Conduzione ohmica|6.4 Prima e seconda legge di Ohm|6.4 Resistività",
    [1, 3],
    "Immagina una sezione trasversale di un filo. La corrente media I conta la carica netta che attraversa la sezione nell’unità di tempo nel verso di riferimento. Per una corrente costante, detto Δq il transito algebrico, I = Δq/Δt. L’ampere vale un coulomb al secondo.",
    eq(r"I=\frac{\Delta q}{\Delta t},\qquad 1\ \mathrm A=1\ \mathrm{C/s}"),
    "Il verso convenzionale è quello del moto di cariche positive. In un metallo gli elettroni di conduzione derivano in senso opposto. Un generatore ideale di tensione mantiene la differenza di potenziale ai suoi morsetti. Collegando un carico diverso, cambia la corrente necessaria a mantenere tale tensione.",
    fig(
        "C4-ohm",
        "Nel grafico V in ordinata e I in ascissa, per un conduttore ohmico a temperatura fissata la pendenza V/I misura la resistenza.",
    ),
    eq(r"\Delta V=RI,\qquad 1\ \Omega=1\ \mathrm{V/A},\qquad R=\rho\frac{\ell}{A}"),
    "Per un resistore ohmico R resta costante al variare di I nelle condizioni considerate. Con la convenzione passiva ΔV in questa legge è la caduta di tensione dal morsetto in cui entra la corrente a quello da cui esce. Un filo omogeneo e uniforme di lunghezza ℓ e area trasversale A ha resistenza proporzionale alla lunghezza e inversamente proporzionale all’area. La resistività ρ, in Ω·m, è una proprietà del materiale alla temperatura specificata.",
    "Una retta V(I) passante per l’origine indica comportamento ohmico nella misura considerata. Se si scambiano gli assi la pendenza diventa la conduttanza 1/R. Se il filo si scalda abbastanza da modificare la resistività, il rapporto V/I può cambiare durante la misura.",
)
ex(
    "La pendenza del resistore",
    "In un grafico V in ordinata e I in ascissa, una retta passante per l’origine attraversa il punto 20 mA, 4,0 V. Ricava R e prevedi la corrente a 6,0 V.",
    2,
    fig(
        "C4-ohm",
        "Per determinare la pendenza si divide l’altezza espressa in volt per la base espressa in ampere. Il disegno indica la costruzione, senza fissare una scala numerica.",
    ),
    eq(r"I=0{,}020\ \mathrm A,\qquad R=4{,}0/0{,}020=200\ \Omega"),
    eq(r"I_{6\mathrm V}=6{,}0/200=0{,}030\ \mathrm A=30\ \mathrm{mA}"),
    "Il rapporto fra le correnti è 30/20 = 1,5, come quello fra le tensioni. La previsione vale se il resistore resta nel medesimo regime ohmico.",
)
ex(
    "Scegliere una sezione di filo",
    "Un filo uniforme lungo 2,0 m di resistività 1,7 × 10⁻⁸ Ω·m deve avere resistenza 0,068 Ω alla temperatura indicata. Qual è l’area in mm²?",
    2,
    "La grandezza ricercata è la sezione perpendicolare alla corrente. Partiamo dalla resistenza di un conduttore uniforme.",
    eq(r"R=\rho\ell/A\quad\Longrightarrow\quad A=\rho\ell/R"),
    eq(
        r"A=\frac{1{,}7\cdot10^{-8}\cdot2{,}0}{0{,}068}=5{,}0\cdot10^{-7}\ \mathrm{m^2}=0{,}50\ \mathrm{mm^2}"
    ),
    "Un millimetro quadrato vale un milionesimo di metro quadrato. Sostituendo la sezione nell’espressione iniziale si recupera 0,068 Ω.",
)

lesson(
    "C4",
    6,
    "Seguire i nodi di un circuito",
    "6.4 Resistenze in serie e in parallelo|6.4 Potenza elettrica ed effetto Joule",
    [5],
    "Segui i fili di un circuito prima di sommare resistenze. Due resistori sono in serie se il nodo che li unisce non offre altre diramazioni: la stessa corrente attraversa entrambi. Sono in parallelo se i loro due estremi sono collegati alla stessa coppia di nodi: la differenza di potenziale è identica.",
    fig(
        "C4-reti",
        "Nel ramo in serie I è comune ai due resistori. A destra i due resistori condividono i nodi A e B, e ciascun ramo riceve l’intera tensione fra A e B.",
    ),
    eq(r"R_{\rm serie}=R_1+R_2,\qquad\frac1{R_{\rm par}}=\frac1{R_1}+\frac1{R_2}"),
    "In serie le cadute si sommano: ΔV = I R1 + I R2. In parallelo le correnti si sommano: I = ΔV/R1 + ΔV/R2. La resistenza equivalente in parallelo è minore del più piccolo dei resistori positivi, perché offrire un ulteriore percorso aumenta la corrente totale a tensione fissata.",
    "Per una differenza di potenziale V e una corrente I che entra nel morsetto a potenziale maggiore, la potenza assorbita vale VI. Nel resistore l’energia elettrica diventa energia interna per effetto Joule. Le forme I²R e V²/R si ottengono dalla legge di Ohm.",
    eq(r"P=VI=I^2R=\frac{V^2}{R},\qquad E=P\Delta t\quad(P\ \text{costante})"),
    "Prima di decidere se un resistore maggiore dissipa di più, individua la grandezza mantenuta costante. In serie la corrente è comune e conviene usare I²R. In parallelo è comune la tensione e conviene usare V²/R. Nel laboratorio modifica una resistenza e confronta le cadute con la somma imposta dal generatore.",
)
ex(
    "Due resistori si dividono la tensione",
    "Un generatore ideale da 9,0 V alimenta in serie 100 Ω e 200 Ω. Trova la corrente, le cadute sui resistori e la potenza totale.",
    2,
    fig(
        "C4-reti",
        "Segui il percorso in serie a sinistra. Ogni carica che attraversa R₁ attraversa anche R₂.",
    ),
    eq(r"R_{\rm eq}=100+200=300\ \Omega,\qquad I=9{,}0/300=0{,}030\ \mathrm A"),
    eq(
        r"V_1=0{,}030\cdot100=3{,}0\ \mathrm V,\qquad V_2=0{,}030\cdot200=6{,}0\ \mathrm V"
    ),
    eq(r"P_{\rm tot}=9{,}0\cdot0{,}030=0{,}270\ \mathrm W"),
    "Le due cadute ricostruiscono 9 V. Le singole potenze, 0,090 e 0,180 W, si sommano a 0,270 W.",
)
ex(
    "Due rami con correnti diverse",
    "Fra gli stessi due nodi di un generatore ideale a 12 V si collegano un resistore da 60 Ω e uno da 120 Ω. Calcola corrente totale e resistenza equivalente.",
    2,
    fig(
        "C4-reti", "A destra ciascun ramo ha un estremo al nodo A e l’altro al nodo B."
    ),
    eq(r"I_1=12/60=0{,}200\ \mathrm A,\quad I_2=12/120=0{,}100\ \mathrm A"),
    eq(r"I_{\rm tot}=0{,}300\ \mathrm A,\qquad R_{\rm eq}=12/0{,}300=40\ \Omega"),
    "La resistenza equivalente è sotto 60 Ω. Il ramo con resistenza dimezzata porta corrente doppia alla stessa tensione.",
)

lesson(
    "C4",
    7,
    "Immagazzinare carica ed energia",
    "6.5 Capacità elettrica e condensatore piano|6.5 Effetto del dielettrico|6.5 Energia immagazzinata",
    [3, 4],
    "Due piastre conduttrici separate da un isolante conservano cariche +Q e −Q. La configurazione possiede un campo e una differenza di potenziale fra le piastre. La capacità C misura quanta carica, in modulo su una sola armatura, corrisponde a un volt di differenza fra le armature.",
    eq(r"C=\frac{Q}{|\Delta V|},\qquad 1\ \mathrm F=1\ \mathrm{C/V}"),
    fig(
        "C4-condensatore",
        "Le piastre di area affacciata A distano d. Nel disegno in sezione il campo fra le armature è diretto dalla positiva alla negativa.",
    ),
    "Per piastre parallele di area affacciata A, separate di distanza d piccola rispetto alle dimensioni laterali e riempite uniformemente di permittività ε, il campo si può approssimare uniforme lontano dai bordi. La capacità cresce con A e con ε, diminuisce all’aumentare della distanza.",
    eq(
        r"C=\varepsilon\frac{A}{d},\quad \varepsilon=\varepsilon_0\varepsilon_r,\quad \varepsilon_0\simeq8{,}85\cdot10^{-12}\ \mathrm{F/m}"
    ),
    "Caricare le piastre richiede lavoro per aggiungere ulteriore carica contro una tensione crescente. Sul grafico |ΔV| contro Q la tensione cresce linearmente da zero al valore finale e l’area sottesa è triangolare. Il lavoro immagazzinato nel campo del condensatore ideale è quindi metà di Q|ΔV|.",
    eq(r"U=\tfrac12Q|\Delta V|=\tfrac12 C(\Delta V)^2=\frac{Q^2}{2C}"),
    "Introducendo un dielettrico, determina prima se il generatore rimane collegato. In isolamento Q resta costante e la tensione scende se C cresce. Con generatore ideale collegato V resta costante e cambia la carica sulle piastre. Il bilancio energetico completo include il generatore e l’eventuale lavoro meccanico sul dielettrico.",
)
ex(
    "Energia di un piccolo condensatore",
    "Un condensatore da 4,0 μF è caricato a 5,0 V. Calcola il modulo della carica su ciascuna piastra e l’energia del campo.",
    1,
    fig(
        "C4-condensatore",
        "Le cariche sulle piastre sono uguali in modulo e opposte. Q si riferisce al modulo su una piastra.",
    ),
    eq(r"Q=C|\Delta V|=4{,}0\cdot10^{-6}\cdot5{,}0=20\ \mu\mathrm C"),
    eq(
        r"U=\tfrac12 C(\Delta V)^2=\tfrac12\cdot4{,}0\cdot10^{-6}\cdot25=50\ \mu\mathrm J"
    ),
    "La carica totale delle due armature ideali è zero, ma la separazione delle cariche conserva energia nel campo.",
)
ex(
    "Il dielettrico dopo il distacco",
    "Un condensatore da 2 μF caricato a 12 V viene scollegato da entrambi i morsetti. Un dielettrico che riempie lo spazio triplica la capacità. Trova tensione ed energia finali.",
    2,
    "Le piastre isolate conservano Q. Il dielettrico aumenta C senza che elettroni possano passare attraverso un circuito esterno.",
    eq(
        r"Q_i=2\cdot12=24\ \mu\mathrm C,\quad C_f=6\ \mu\mathrm F,\quad V_f=Q_i/C_f=4\ \mathrm V"
    ),
    eq(r"U_f=\tfrac12 C_f V_f^2=\tfrac12\cdot6\cdot16=48\ \mu\mathrm J"),
    "L’energia iniziale era 144 μJ. A Q fisso l’aumento triplo di capacità riduce a un terzo l’energia immagazzinata. La differenza può essere scambiata meccanicamente durante l’inserimento.",
)

lesson(
    "C4",
    8,
    "Mettere insieme i condensatori",
    "6.5 Condensatori in serie e in parallelo|6.5 Conservazione di carica nei collegamenti",
    [7],
    "Più condensatori consentono di controllare la capacità totale. Disegna i nodi. In parallelo ogni condensatore vede la medesima differenza di potenziale, mentre il generatore separa la somma delle cariche sulle piastre collegate allo stesso morsetto.",
    fig(
        "C4-reti-c",
        "In parallelo le armature corrispondenti appartengono agli stessi due nodi. Nella serie il nodo intermedio, inizialmente neutro e isolato, conserva carica totale zero.",
    ),
    eq(r"C_{\rm par}=C_1+C_2,\qquad Q_{\rm tot}=(C_1+C_2)V"),
    "In serie, se il nodo intermedio isolato è inizialmente neutro, le due piastre che vi appartengono mantengono cariche opposte uguali in modulo. Le cadute di potenziale sono Q/C1 e Q/C2 e devono sommarsi alla tensione applicata. Il condensatore più piccolo porta la tensione maggiore.",
    eq(
        r"V=\frac{Q}{C_1}+\frac{Q}{C_2}=\frac{Q}{C_{\rm serie}},\qquad \frac1{C_{\rm serie}}=\frac1{C_1}+\frac1{C_2}"
    ),
    "Quando si collegano fra loro due condensatori già carichi e separati dalla sorgente, identifica i nuovi gruppi di piastre. La carica algebrica di ciascun gruppo isolato si conserva. Dopo il transitorio, i condensatori in parallelo assumono la stessa tensione. Una parte dell’energia iniziale può dissiparsi durante il transitorio reale.",
    "Confronta le condizioni al contorno prima di scegliere una formula. Per le resistenze si sommano direttamente i valori in serie; per le capacità, l’addizione diretta nasce dalla tensione comune in parallelo.",
)
ex(
    "Due condensatori in serie",
    "Si collegano in serie 3 μF e 6 μF a 12 V, con nodo interno inizialmente neutro. Determina capacità equivalente, carica e tensioni.",
    2,
    fig(
        "C4-reti-c",
        "Segui lo schema in serie. La stessa carica in modulo determina due cadute diverse.",
    ),
    eq(
        r"C_{\rm eq}=\frac{3\cdot6}{3+6}=2\ \mu\mathrm F,\quad Q=C_{\rm eq}V=24\ \mu\mathrm C"
    ),
    eq(r"V_1=Q/C_1=24/3=8\ \mathrm V,\qquad V_2=24/6=4\ \mathrm V"),
    "La somma delle cadute è 12 V e la capacità equivalente è minore della più piccola delle due.",
)
ex(
    "Approfondimento · Ridividere una carica",
    "Un condensatore da 2 μF è caricato a 9 V e scollegato. Viene connesso, armatura positiva con armatura corrispondente, a uno scarico da 4 μF. Calcola la tensione comune e confronta le energie.",
    3,
    "La carica totale del nodo delle armature positive è inizialmente 2 × 9 = 18 μC. Non esiste un collegamento alla sorgente. A equilibrio le armature collegate hanno il medesimo potenziale.",
    eq(r"V_f=\frac{Q_{\rm nodo}}{C_1+C_2}=\frac{18}{2+4}=3\ \mathrm V"),
    eq(
        r"U_i=\tfrac12\cdot2\cdot9^2=81\ \mu\mathrm J,\qquad U_f=\tfrac12\cdot6\cdot3^2=27\ \mu\mathrm J"
    ),
    "La carica del nodo resta 18 μC. In un circuito reale la differenza di 54 μJ lascia il campo dei condensatori durante la ridistribuzione, per esempio come calore nei collegamenti.",
)

lesson(
    "C4",
    9,
    "Correnti, bussole e traiettorie curve",
    "6.6 Origine magnetica delle correnti ed esperimento di Oersted|6.6 Forza di Lorentz su una carica in moto e su un filo|6.6 Moto circolare in campo magnetico uniforme",
    [2, 5],
    "Una bussola vicino a un filo rettilineo si orienta diversamente quando passa corrente. Invertendo il verso della corrente si inverte il contributo magnetico del filo. L’esperimento di Oersted lega la corrente al campo magnetico B, misurato in tesla (T). Intorno a un filo rettilineo lungo le linee del campo sono circonferenze centrate sull’asse del filo. Il pollice della mano destra segue la corrente convenzionale, le dita seguono B.",
    fig(
        "C4-filo-b",
        "Un punto nel filo rappresenta corrente uscente dal foglio. La linea del campo la circonda in senso antiorario. La freccia tangente indica B nel punto P.",
    ),
    "Una particella carica in moto in un campo B subisce una forza perpendicolare sia alla velocità sia a B. Per q positiva la mano destra dà il verso del prodotto vettoriale v × B; una q negativa inverte la freccia. Quando v è parallela a B, la forza magnetica è nulla.",
    eq(r"\vec F_B=q\vec v\times\vec B,\qquad F_B=|q|vB\sin\theta"),
    fig(
        "C4-orbita",
        "Le croci rappresentano B entrante nel foglio. Per q positiva con v iniziale verso destra la forza è verso l’alto e curva la traiettoria.",
    ),
    "La forza magnetica è perpendicolare alla velocità istante per istante. Il suo lavoro sulla carica puntiforme è nullo. Con velocità iniziale perpendicolare a un campo uniforme e senza altre forze, il modulo della velocità resta costante e l’accelerazione è centripeta. Un’estensione del modello riguarda una velocità iniziale inclinata: con una componente parallela si sovrappongono rotazione e avanzamento lungo il campo.",
    eq(
        r"|q|vB=\frac{mv^2}{r}\quad\Longrightarrow\quad r=\frac{mv}{|q|B}\quad(\vec v\perp\vec B)"
    ),
    "Un segmento rettilineo di filo immerso in un campo uniforme subisce la forza magnetica sulle cariche che lo attraversano. Il vettore lunghezza ℓ segue la corrente convenzionale. Il modulo della forza è massimo con filo perpendicolare al campo.",
    eq(r"\vec F=I\vec\ell\times\vec B,\qquad F=I\ell B\sin\theta"),
)
ex(
    "Raggio della traiettoria",
    "Un protone con massa 1,67 × 10⁻²⁷ kg e carica 1,60 × 10⁻¹⁹ C entra a 2,0 × 10⁵ m/s perpendicolarmente a un campo uniforme di 0,10 T. Calcola il raggio in cm.",
    2,
    fig(
        "C4-orbita",
        "La forza si dirige verso il centro; la velocità è tangente. Il disegno fissa l’orientamento di una possibile entrata.",
    ),
    eq(r"|q|vB=mv^2/r\quad\Longrightarrow\quad r=\frac{mv}{|q|B}"),
    eq(
        r"r=\frac{1{,}67\cdot10^{-27}\cdot2{,}0\cdot10^5}{1{,}60\cdot10^{-19}\cdot0{,}10}=2{,}09\cdot10^{-2}\ \mathrm m=2{,}09\ \mathrm{cm}"
    ),
    "Una velocità maggiore a campo fissato allargherebbe l’orbita. Il segno della carica determina il verso di curvatura.",
)
ex(
    "Forza su un segmento di filo",
    "Un segmento rettilineo di 8,0 cm è percorso da 2,0 A verso destra in un campo di 0,25 T diretto verso l’alto nel piano del foglio. Trova modulo e verso della forza.",
    2,
    "La lunghezza immersa nel campo è 0,080 m. Il vettore lunghezza segue la corrente verso destra. Il campo è perpendicolare al filo e il seno dell’angolo è uno.",
    eq(r"F=I\ell B\sin90^\circ=2{,}0\cdot0{,}080\cdot0{,}25=0{,}040\ \mathrm N"),
    "Con asse x verso destra e y verso l’alto, x × y punta verso chi osserva. La forza è uscente dal foglio. Invertire solo la corrente ne invertirebbe il verso.",
)

lesson(
    "C4",
    10,
    "Indurre una tensione cambiando il flusso",
    "6.7 Flusso magnetico|6.7 Forza elettromotrice indotta|6.7 Legge di Faraday–Neumann–Lenz|6.7 Correnti indotte e loro verso",
    [5, 9],
    "Una spira ferma può essere attraversata da un campo senza sviluppare corrente. Per generare una forza elettromotrice indotta conta la variazione nel tempo del flusso concatenato. Per una spira piana in campo uniforme il flusso Φ dipende dall’area, dal modulo del campo e dall’angolo tra il campo e la normale scelta alla superficie.",
    fig(
        "C4-flusso",
        "La normale n è perpendicolare al piano della spira. L’angolo θ si misura fra il campo e la normale. Quando B giace nel piano, la sua componente normale è nulla.",
    ),
    eq(r"\Phi_B=BA\cos\theta,\qquad [\Phi_B]=\mathrm{T\,m^2}=\mathrm{Wb}"),
    "Cambiando l’intensità del campo, ruotando la spira o modificando l’area attraversata si può cambiare il flusso. Per N spire con lo stesso flusso per spira, la forza elettromotrice media è la variazione del flusso concatenato divisa per il tempo, con segno meno. Un weber al secondo equivale a un volt.",
    eq(r"\overline{\mathcal E}=-N\frac{\Phi_f-\Phi_i}{\Delta t}"),
    fig(
        "C4-lenz",
        "Vista frontale della spira. Un campo esterno entrante che aumenta induce una corrente antioraria, il cui campo è uscente.",
    ),
    "Il verso positivo di percorrenza della spira si abbina alla normale con la regola della mano destra. La legge di Lenz dice che il campo della corrente indotta si oppone alla variazione del flusso esterno. Se un campo entrante diminuisce, l’induzione tende quindi a sostenerlo. Invertire sempre il verso del campo esterno darebbe una previsione errata quando il flusso si riduce.",
    "Una forza elettromotrice può esistere anche a circuito aperto. Una corrente persistente richiede un cammino chiuso e dipende dalle proprietà del circuito. In una spira resistiva con autoinduzione trascurabile, il suo modulo si ricava dalla legge di Ohm.",
)
ex(
    "Quanto vale l’impulso induttivo?",
    "Una bobina di 40 spire, area 5,0 cm² per spira, giace perpendicolare a un campo che cresce uniformemente da 0,10 a 0,30 T in 20 ms. Calcola il modulo della f.e.m. media.",
    2,
    "L’area è 5,0 × 10⁻⁴ m² e il tempo 0,020 s. Il campo è parallelo alla normale delle spire. Ogni spira concatena la stessa variazione di flusso.",
    eq(
        r"|\Delta\Phi|=A|\Delta B|=(5{,}0\cdot10^{-4})(0{,}20)=1{,}0\cdot10^{-4}\ \mathrm{Wb}"
    ),
    eq(
        r"|\overline{\mathcal E}|=N|\Delta\Phi|/\Delta t=40\cdot10^{-4}/0{,}020=0{,}20\ \mathrm V"
    ),
    "Il numero di spire moltiplica la variazione per spira. Il risultato è una tensione, non una forza meccanica.",
)
ex(
    "Decidere il verso durante una diminuzione",
    "Una spira chiusa è vista frontalmente. Il campo esterno è entrante nel foglio e sta diminuendo in modulo. Qual è il verso della corrente indotta visto dall’osservatore?",
    2,
    fig(
        "C4-lenz-decrescente",
        "Il campo esterno entra nel foglio e diminuisce. Osserva la croce rossa al centro della spira per il verso del campo indotto.",
    ),
    "Poiché diminuisce un flusso entrante, la corrente indotta deve creare un campo entrante che contrasti la diminuzione. Immagina il pollice destro diretto dentro il foglio.",
    "Le dita si chiudono in senso orario. Questa è la direzione della corrente convenzionale nella spira vista frontalmente. Se il campo smette di cambiare, la f.e.m. indotta da quella variazione si annulla.",
)
