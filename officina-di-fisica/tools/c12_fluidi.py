"""Unità ministeriale 3. Testi e famiglie di esercizi C2."""

from math import pi, sqrt, cos, radians


def build(c):
    L, E, N, M, T = c.lesson, c.example, c.num, c.choice, c.word
    L(
        "Distribuire massa e forza",
        "Fluidi in quiete",
        "Stati di aggregazione|Fluidi e solidi|Densità|Pressione e forza normale|Pressione assoluta e relativa",
        r"""Una siringa chiusa piena d’aria si comprime facilmente; piena d’acqua oppone molta più resistenza. Gas e liquidi prendono la forma del contenitore e scorrono sotto uno sforzo tangenziale persistente. Un solido può sostenere uno sforzo di taglio statico deformandosi fino a una nuova configurazione di equilibrio. Un gas occupa tutto il volume disponibile; un liquido forma normalmente una superficie libera e, per variazioni moderate di pressione, si può trattare come incomprimibile.
Per confrontare campioni di dimensioni diverse, rapporta la massa al volume. La densità media descrive l’intero campione; in un liquido omogeneo coincide con il valore locale. In un gas la densità può variare sensibilmente con temperatura e pressione.
$\rho=\frac{m}{V},\qquad [\rho]=\mathrm{kg/m^3}
Una parete bagnata riceve una forza distribuita. Per pressione uniforme, la forza perpendicolare è pressione per area. Localmente la pressione misura la forza normale per unità di area. Il valore è scalare; il verso della forza dipende dall’orientamento della parete. Se le due facce sono soggette a pressioni diverse, usa la loro differenza per la forza risultante normale.
$p=F_\perp/A,\qquad 1\,\mathrm{Pa}=1\,\mathrm{N/m^2},\qquad F_{\rm netta}=(p_1-p_2)A
La pressione assoluta ha come riferimento il vuoto. Un manometro relativo confronta la pressione con quella atmosferica locale: p relativa = p assoluta − p atmosferica. Per capire perché la distinzione conta, immagina la stessa atmosfera su entrambi i lati di una membrana: le due spinte si compensano.""",
    )
    E(
        "Dal campione al materiale",
        1,
        "Un piccolo contenitore vuoto ha massa 24,0 g. Riempito con 30,0 mL di liquido, ha massa 49,5 g. Ricava la densità del liquido in kg/m³.",
        r"""La bilancia misura insieme recipiente e liquido. Sottrai la tara per ricavare la massa pertinente, poi abbinala al volume occupato dal solo liquido.
$m=49{,}5-24{,}0=25{,}5\,\mathrm g=0{,}0255\,\mathrm{kg}
$V=30{,}0\,\mathrm{mL}=30{,}0\times10^{-6}\,\mathrm{m^3}
$\rho=m/V=0{,}0255/(30{,}0\times10^{-6})=850\,\mathrm{kg/m^3}
Lo stesso risultato è 0,850 g/mL, minore della densità dell’acqua a temperatura ambiente. Il confronto ha senso perché le unità sono state rese omogenee.""",
    )
    E(
        "Una membrana fra due camere",
        2,
        "Una membrana piana di area 6,0 cm² separa due camere a pressioni uniformi assolute di 104 kPa e 100 kPa. Calcola la forza risultante dovuta alle pressioni e il suo verso.",
        r"""Le due forze sono normali alla medesima membrana e opposte. La forza netta è quindi proporzionale alla differenza di pressione. Converti area e pressione.
$A=6{,}0(10^{-2}\,\mathrm m)^2=6{,}0\times10^{-4}\,\mathrm{m^2}
$\Delta p=(104-100)\,\mathrm{kPa}=4{,}0\times10^3\,\mathrm{Pa}
$F_{\rm netta}=\Delta p\,A=(4{,}0\times10^3)(6{,}0\times10^{-4})\,\mathrm N=2{,}4\,\mathrm N
La spinta netta va dalla camera a 104 kPa verso quella a 100 kPa. Con pressioni uguali la stessa area riceverebbe forza risultante zero.""",
    )
    M(
        "Uno sforzo tangenziale persistente",
        "Quale comportamento in condizioni ordinarie distingue un liquido da un solido elastico sotto una piccola sollecitazione tangenziale costante?",
        "Il liquido continua a deformarsi nel tempo",
        "Il liquido conserva sempre la sua forma|Il solido scorre sempre a velocità costante|Il liquido resta senza viscosità",
        "Considera come evolve la forma dopo l’applicazione della sollecitazione.",
        "Un liquido in condizioni ordinarie fluisce finché persiste lo sforzo di taglio. Un solido elastico può equilibrare uno sforzo di taglio statico con una deformazione finita.",
        "concetto|Distingui la deformazione iniziale dal suo proseguimento nel tempo.",
    )
    N(
        "Una pressione media al contatto",
        "Una superficie di 0,015 m² riceve una forza normale uniforme complessiva di 45 N. Qual è la pressione media in kPa?",
        3,
        "kPa",
        0.01,
        45 / 0.015 / 1000,
        "Calcola prima la pressione in pascal.",
        r"$p=F_\perp/A=45/0{,}015=3000\,\mathrm{Pa}=3{,}0\,\mathrm{kPa}~Per ogni metro quadrato l’interazione corrisponderebbe a 3000 N, se la distribuzione restasse uniforme.",
        "unità|Un kilopascal vale mille pascal.",
    )
    M(
        "Ruotare una piccola parete",
        "In un punto di un liquido in quiete la pressione assoluta è p. Ruoto una piccola parete di prova mantenendola nello stesso punto. Che cosa accade idealmente?",
        "La pressione resta p e cambia la direzione della forza",
        "La pressione ruota come un vettore|La forza resta verticale qualunque sia la parete|La pressione raddoppia a 90°",
        "Distingui il valore locale dal vettore normale alla superficie.",
        "In quiete la pressione è isotropa. Su ciascuna faccia la forza del liquido è perpendicolare alla parete; la sua direzione cambia con la superficie.",
        "concetto|Ricostruisci la normale alla parete dopo la rotazione.",
    )
    N(
        "Un sensore con riferimento atmosferico",
        "Un manometro segna −12 kPa rispetto a un’atmosfera di 99 kPa. Quanto vale la pressione assoluta nella camera?",
        87,
        "kPa",
        0.02,
        99 - 12,
        "La lettura è lo scarto rispetto alla pressione esterna.",
        r"$p_{\rm rel}=p_{\rm ass}-p_{\rm atm}\quad\Rightarrow\quad p_{\rm ass}=99+(-12)=87\,\mathrm{kPa}~Il valore assoluto resta positivo benché la lettura relativa sia negativa.",
        "algebra|Aggiungi al riferimento la lettura completa di segno.",
    )
    N(
        "Densità di un composto di due porzioni",
        "Si uniscono 20 mL di liquido di densità 0,8 g/mL e 30 mL di densità 1,2 g/mL. Supponi volumi additivi. Qual è la densità media finale?",
        1.04,
        "g/mL",
        0.002,
        (20 * 0.8 + 30 * 1.2) / (20 + 30),
        "Somma masse e volumi prima di dividerli.",
        r"$m_1=20(0{,}8)=16\,\mathrm g,\quad m_2=30(1{,}2)=36\,\mathrm g~$\rho=(16+36)/(20+30)=52/50=1{,}04\,\mathrm{g/mL}~Il valore è compreso tra le due densità, più vicino a quella del componente di volume maggiore.",
        "modello|La media aritmetica semplice richiederebbe volumi uguali.",
        3,
    )
    T(
        "Il riferimento al vuoto",
        "Quale aggettivo identifica una pressione espressa rispetto al vuoto?",
        "assoluta",
        "pressione assoluta",
        "Che cosa vale zero quando il riferimento è il vuoto?",
        "Per convenzione la pressione assoluta conta la pressione a partire dal vuoto. La pressione relativa indica invece uno scarto rispetto a un riferimento dichiarato, spesso l’atmosfera.",
        "concetto|Riconosci lo zero della scala impiegata.",
    )
    N(
        "Aumentare la superficie di appoggio",
        "Una forza resta costante; inizialmente produce una pressione media di 18 kPa su 4 cm². Quale pressione produce su 12 cm²?",
        6,
        "kPa",
        0.01,
        18 * 4 / 12,
        "Con forza fissata il prodotto pA resta costante.",
        r"$p_1A_1=p_2A_2\quad\Rightarrow\quad p_2=18(4/12)=6\,\mathrm{kPa}~L’area triplica e la stessa forza si distribuisce su tre volte la superficie.",
        "modello|Identifica la forza come grandezza mantenuta costante.",
    )
    M(
        "Il grafico massa–volume",
        "Per un liquido omogeneo si rappresenta la massa del solo liquido in funzione del volume dosato. Che cosa misura la pendenza della retta?",
        "La densità",
        "La pressione|Il volume specifico|La forza peso",
        "Scrivi le unità dell’asse verticale divise per quelle dell’asse orizzontale.",
        r"$m=\rho V\quad\Rightarrow\quad\Delta m/\Delta V=\rho~Una densità maggiore dà più massa per ogni millilitro aggiunto e quindi una retta più ripida.",
        "unità|Controlla se il grafico mostra m in funzione di V o il contrario.",
    )
    N(
        "Conservare la massa comprimendo un gas",
        "Un gas chiuso di densità iniziale 1,20 kg/m³ passa da 6,0 L a 4,0 L senza perdite. Quanto vale la densità finale?",
        1.8,
        "kg/m³",
        0.01,
        1.2 * 6 / 4,
        "La stessa massa occupa due volumi diversi.",
        r"$\rho_1V_1=\rho_2V_2\quad\Rightarrow\quad\rho_2=1{,}20(6{,}0/4{,}0)=1{,}80\,\mathrm{kg/m^3}~Il volume diminuisce: una densità finale maggiore è coerente anche senza conoscere la temperatura.",
        "algebra|Per massa costante densità e volume sono inversamente proporzionali.",
    )
    M(
        "Una forza parallela alla faccia",
        "Sulla faccia di una piastra agiscono contemporaneamente una forza normale e uno sforzo tangenziale. Quale componente entra nella definizione della pressione media?",
        "La sola componente normale compressiva",
        "La somma dei moduli di tutte le forze|La sola componente tangenziale|Il modulo della risultante indipendentemente dall’angolo",
        "Identifica che cosa comprime direttamente la faccia.",
        "La forza normale per unità di area definisce la pressione media sulla faccia. La componente parallela genera uno sforzo di taglio, con diversa direzione e diverso effetto meccanico.",
        "modello|Scomponi la forza rispetto alla superficie.",
    )
    L(
        "Leggere una colonna di liquido",
        "Fluidi in quiete",
        "Legge di Stevino|Pressione con la profondità|Esperimento di Torricelli|Manometro a U",
        r"""Più scendi in acqua, maggiore è la colonna che grava sopra il tuo livello. Considera un cilindro immaginario di liquido in quiete, sezione A e altezza h. Le forze laterali si compensano. La forza verso l’alto sulla base deve equilibrare la pressione verso il basso sul tetto più il peso ρAhg. Dividendo per A si ottiene la legge di Stevino.
@C2-colonna|Il punto A è sotto la superficie di un dislivello verticale h. Una quota misurata lungo una parete inclinata richiederebbe prima una proiezione.
$p_{\rm fondo}-p_{\rm alto}=\rho gh,\qquad p(h)=p_0+\rho gh
Usa densità uniforme e g quasi costante, liquido fermo e riferimento di profondità rivolto verso il basso. Alla stessa quota in uno stesso liquido connesso in equilibrio la pressione è uguale. La forma del recipiente non entra nella legge. Con strati di liquidi diversi somma i contributi ρgh, uno per strato.
@C2-manometro|Il gas a sinistra spinge l’interfaccia più in basso. Alla quota tratteggiata inferiore entrambe le colonne hanno la stessa pressione.
Un manometro a U traduce una differenza di pressione in un dislivello verticale. Parti da una pressione nota, aggiungi ρgh scendendo nel liquido, sottraila salendo. In un barometro di Torricelli l’atmosfera spinge sul serbatoio di mercurio; in cima alla colonna c’è una pressione di vapore molto piccola. Trascurandola, p atmosferica = ρ del mercurio × g × altezza della colonna. È il riferimento superiore quasi vuoto che rende possibile la misura assoluta.""",
        (1,),
    )
    E(
        "La lettura nei due rami",
        2,
        "Un manometro a U contiene acqua (1000 kg/m³). Un ramo è aperto all’atmosfera, l’altro al gas. La superficie dal lato del gas è 12 cm più in basso. Calcola la pressione relativa del gas con g = 9,8 m/s².",
        r"""@C2-manometro|Dal livello libero di destra scendi fino alla quota del livello di sinistra. Lungo questa discesa la pressione cresce.
Alla stessa quota nel liquido connesso le pressioni coincidono. A sinistra sulla superficie c’è p_gas, a destra alla medesima quota c’è p_atm più il contributo della colonna.
$h=0{,}12\,\mathrm m,\qquad p_{\rm gas}=p_{\rm atm}+\rho gh
$p_{\rm gas}-p_{\rm atm}=(1000)(9{,}8)(0{,}12)\,\mathrm{Pa}=1176\,\mathrm{Pa}\simeq1{,}18\,\mathrm{kPa}
Il segno è positivo, coerente con l’interfaccia depressa sul lato del gas.""",
    )
    E(
        "Un fondo sotto due strati",
        2,
        "In un vaso aperto si sovrappongono 10 cm di olio (800 kg/m³) a 25 cm d’acqua (1000 kg/m³). Con g = 10 m/s², trova la pressione relativa sul fondo.",
        r"""Parti dalla superficie libera e scendi attraverso i due strati in quiete. La pressione raggiunta in fondo all’olio costituisce il riferimento per l’acqua. Trascuriamo effetti capillari all’interfaccia piana.
$\Delta p_o=\rho_o gh_o=800\cdot10\cdot0{,}10=800\,\mathrm{Pa}
$\Delta p_a=\rho_a gh_a=1000\cdot10\cdot0{,}25=2500\,\mathrm{Pa}
$p_{\rm fondo}-p_{\rm atm}=800+2500=3300\,\mathrm{Pa}=3{,}3\,\mathrm{kPa}
Usare una singola densità arbitraria per tutti i 35 cm confonderebbe i due contributi. Ciascuno ha il segno positivo perché entrambi gli attraversamenti sono in discesa.""",
    )
    N(
        "Un livello sotto la superficie",
        "In acqua omogenea di densità 1000 kg/m³, a quale profondità la pressione supera quella superficiale di 4,0 kPa? Usa g = 10 m/s².",
        0.40,
        "m",
        0.002,
        4000 / (1000 * 10),
        "Il dato è una differenza di pressione.",
        r"$h=\Delta p/(\rho g)=4000/(1000\cdot10)=0{,}40\,\mathrm m~Con 10 kPa circa per metro d’acqua, quattro decimi di metro sono plausibili.",
        "unità|Porta i kilopascal in pascal prima della divisione.",
    )
    M(
        "Due recipienti comunicanti",
        "Due recipienti aperti, uno largo e uno stretto, sono collegati alla base e contengono lo stesso liquido fermo. Trascurando la capillarità, come si dispongono le superfici libere?",
        "Alla stessa quota",
        "Più in alto nel recipiente largo|Più in alto nel recipiente stretto|Alla stessa distanza dal fondo lungo la parete inclinata",
        "Confronta la pressione alla base lungo i due percorsi.",
        "Al medesimo punto di collegamento la pressione è unica. Poiché sopra le due superfici agisce la stessa atmosfera e la densità è comune, i dislivelli verticali devono essere uguali.",
        "modello|La larghezza della colonna si cancella nell’equilibrio delle forze.",
    )
    N(
        "La colonna di mercurio",
        "Un barometro contiene mercurio di densità 13 600 kg/m³. La colonna è alta 0,740 m e sopra la colonna la pressione è trascurabile. Con g = 9,81 m/s², stima p atmosferica in kPa.",
        98.73,
        "kPa",
        0.05,
        13600 * 9.81 * 0.740 / 1000,
        "L’altezza si misura verticalmente tra le superfici.",
        r"$p_{\rm atm}\simeq\rho g h=(13600)(9{,}81)(0{,}740)\,\mathrm{Pa}\simeq98730\,\mathrm{Pa}=98{,}7\,\mathrm{kPa}~In questo strumento lo zero di riferimento è il quasi vuoto nella parte alta.",
        "unità|Fissa il riferimento prima di decidere se aggiungere la pressione atmosferica.",
    )
    M(
        "Risalire lungo un tubo",
        "Partendo da un punto a pressione nota in un liquido in quiete, si risale verticalmente di h. Quale variazione subisce la pressione?",
        "Diminuisce di ρgh",
        "Aumenta di ρgh|Resta sempre costante|Diminuisce di ρg/h",
        "Chiediti dove si trova lo strato che sosteneva il peso del liquido.",
        "In quota aumenta l’altezza già percorsa verso la superficie e si riduce la colonna sovrastante. La variazione finale meno iniziale è −ρgh.",
        "concetto|Scrivi una freccia verso il basso per il verso in cui p aumenta.",
    )
    N(
        "Una parete verticale rettangolare",
        "Da una parte di uno sportello verticale largo 0,40 m e alto 0,20 m c’è acqua fino al bordo superiore, dall’altra aria alla pressione atmosferica. Con ρ = 1000 kg/m³ e g = 10 m/s², calcola la forza netta.",
        80,
        "N",
        0.1,
        1000 * 10 * (0.2 / 2) * (0.4 * 0.2),
        "La pressione relativa cresce linearmente da zero al bordo inferiore.",
        r"$p_{\rm media}=\rho g(h/2)=1000\cdot10\cdot0{,}10=1000\,\mathrm{Pa}~$F=p_{\rm media}A=1000(0{,}40\cdot0{,}20)=80\,\mathrm N~Per uno sportello rettangolare verticale la media coincide con il valore alla profondità del centro geometrico.",
        "modello|La pressione del fondo vale soltanto sul bordo inferiore.",
        3,
    )
    T(
        "L’asse da misurare",
        "In un manometro inclinato il liquido sale lungo un tubo obliquo. Quale componente del dislivello entra in ρgh?",
        "verticale",
        "componente verticale|altezza verticale",
        "La gravità ha la stessa direzione del tubo oppure un’altra?",
        "Solo la differenza di quota verticale determina la variazione di energia gravitazionale per unità di volume. La lunghezza letta lungo il tubo va proiettata sulla verticale.",
        "testo|Disegna un segmento perpendicolare al pavimento tra i due livelli.",
    )
    N(
        "Un manometro inclinato",
        "Su un ramo inclinato di 30° rispetto all’orizzontale, la distanza lungo il tubo fra le quote delle due interfacce è 0,50 m. Con ρ = 800 kg/m³ e g = 10 m/s², calcola il modulo della differenza di pressione.",
        2000,
        "Pa",
        1,
        800 * 10 * 0.5 * 0.5,
        "Proietta prima la distanza inclinata sulla verticale.",
        r"$h=\ell\sin30^\circ=0{,}50\cdot0{,}5=0{,}25\,\mathrm m~$|\Delta p|=800\cdot10\cdot0{,}25=2000\,\mathrm{Pa}~La proiezione dimezza il dislivello rispetto alla lettura lungo la scala.",
        "modello|L’angolo è riferito all’orizzontale.",
    )
    M(
        "Stesso livello, gas differenti",
        "Due recipienti separati contengono lo stesso liquido alla stessa profondità h. Il gas sopra il primo ha pressione assoluta maggiore. Come si confrontano le pressioni al fondo?",
        "È maggiore quella del primo",
        "Sono uguali perché h coincide|È maggiore quella del secondo|Dipendono solo dalla massa totale di liquido",
        "Mantieni il termine p₀ nell’equazione.",
        r"$p_{\rm fondo}=p_0+\rho gh~Il contributo idrostatico è uguale per entrambi, mentre il diverso riferimento superficiale resta nel valore assoluto.",
        "concetto|La legge aggiunge un incremento alla pressione di superficie.",
    )
    N(
        "Riconoscere il liquido dalla pendenza",
        "Un grafico p–h per un liquido fermo mostra un incremento di 4,5 kPa su 0,50 m di profondità. Usa g = 10 m/s². Qual è la densità?",
        900,
        "kg/m³",
        1,
        4500 / (0.5 * 10),
        "La pendenza del grafico è ρg.",
        r"$\Delta p/\Delta h=4500/0{,}50=9000\,\mathrm{Pa/m}~$\rho=9000/10=900\,\mathrm{kg/m^3}~Cambiare la pressione di superficie sposterebbe l’intercetta e lascerebbe questa pendenza invariata.",
        "unità|Converti la differenza di pressione in pascal.",
    )
    M(
        "Il quasi vuoto nel barometro",
        "Se sopra il mercurio di un barometro resta una quantità significativa di gas a pressione positiva, come varia l’altezza a parità di p atmosferica?",
        "Diminuisce",
        "Aumenta|Resta identica|Diventa necessariamente zero",
        "La colonna misura una differenza fra le due superfici.",
        r"$\rho gh=p_{\rm atm}-p_{\rm cima}~Un valore positivo di p in cima riduce la differenza che la colonna deve sostenere. A densità e gravità fisse, h diminuisce.",
        "modello|Nell’esperimento di Torricelli conta la pressione nella parte alta.",
        3,
    )
    L(
        "Trasmettere una pressione",
        "Fluidi in quiete",
        "Principio di Pascal|Pressa idraulica|Trasmissione dell’incremento di pressione in un liquido confinato",
        r"""Due pistoni di area diversa chiudono un recipiente pieno di liquido. Premendo lentamente sul più piccolo si può sostenere un carico maggiore sul più grande. La quantità trasmessa al liquido confinato è l’incremento di pressione. Il principio di Pascal afferma che in equilibrio l’incremento imposto si ritrova in tutto il fluido.
@C2-pressa|I pistoni sono alla stessa quota, entrambi esposti alla stessa atmosfera. La stessa sovrapressione agisce sulle due aree.
$\Delta p=F_1/A_1=F_2/A_2,\qquad F_2=F_1\,A_2/A_1
Qui le forze indicano gli incrementi normali dovuti al carico, al netto dell’atmosfera. Le quote uguali, i pistoni ideali senza attrito e la manovra lenta consentono di trascurare correzioni idrostatiche, inerziali e dissipative. A quote diverse l’incremento si trasmette comunque, ma le pressioni assolute iniziali differiscono di ρgΔh.
Se il liquido incomprimibile riempie il circuito senza perdite, il volume ceduto da un pistone è quello acquistato dall’altro. Il pistone più grande sale quindi di una distanza minore di quella di cui scende il piccolo.
$A_1s_1=A_2s_2,\qquad F_1s_1=F_2s_2
Le distanze s sono moduli. Il secondo risultato segue moltiplicando la relazione delle forze per quella degli spostamenti. Idealmente si conserva il lavoro trasmesso. Se compare un guadagno simultaneo di forza e di corsa, ricontrolla dove hai messo il rapporto delle aree.""",
        (1, 2),
    )
    E(
        "Un tavolo elevatore da banco",
        2,
        "Due pistoni ideali sono alla stessa quota. Il piccolo ha area 5 cm² e riceve una forza di 40 N; il grande ha area 60 cm². Calcola forza sul secondo e sua corsa se il primo scende di 12 cm.",
        r"""@C2-pressa|Osserva le aree dei due pistoni e i versi opposti dei loro spostamenti. Il disegno mostra il principio di funzionamento, senza scala.
Il rapporto tra le aree è 60/5 = 12. La pressione aggiuntiva è comune e il secondo pistone esercita una forza dodici volte maggiore.
$F_2=F_1A_2/A_1=40(60/5)=480\,\mathrm N
Per conservare il volume, il pistone grande deve spostarsi di meno.
$s_2=A_1s_1/A_2=(5/60)12\,\mathrm{cm}=1\,\mathrm{cm}
Il controllo dei lavori dà 40 × 0,12 = 4,8 J all’ingresso e 480 × 0,01 = 4,8 J all’uscita, nel modello ideale.""",
    )
    E(
        "Un pistone posto più in alto",
        3,
        "Un circuito chiuso contiene acqua (1000 kg/m³); il pistone di uscita è 0,40 m più in alto dell’ingresso. All’ingresso si mantengono 18 kPa sopra l’atmosfera. Quale carico sostiene a riposo un pistone di uscita da 20 cm²? Usa g = 10 m/s² e pistoni leggeri.",
        r"""La pressione relativa è data all’ingresso. Salendo nel liquido in quiete, la pressione relativa all’uscita diminuisce. Le due superfici esterne dei pistoni vedono la stessa atmosfera.
$\rho g\Delta h=1000\cdot10\cdot0{,}40=4000\,\mathrm{Pa}=4\,\mathrm{kPa}
$p_{2,\rm rel}=18-4=14\,\mathrm{kPa},\qquad A_2=20\times10^{-4}=0{,}0020\,\mathrm{m^2}
$F_2=p_{2,\rm rel}A_2=14000\cdot0{,}0020=28\,\mathrm N
L’uscita sollevata sostiene meno carico rispetto a un’uscita alla stessa quota. L’incremento di pressione dovuto a un’ulteriore piccola spinta in ingresso si trasmetterebbe a entrambi i punti.""",
    )
    M(
        "Che cosa arriva uguale?",
        "Un pistone aumenta di 7 kPa la pressione in un liquido confinato fermo, con geometria e quote invariate. Quale grandezza aumenta della stessa quantità in un punto più in basso?",
        "La pressione locale",
        "La forza su ogni parete qualunque sia l’area|La profondità del punto|La massa di liquido sottostante",
        "Confronta la stessa posizione prima e dopo la spinta.",
        "La parte ρgh resta uguale e cresce il termine imposto al contorno. Il principio di Pascal riguarda l’incremento di pressione, espresso qui in kPa.",
        "concetto|Confronta gli incrementi, mantenendo il medesimo punto del fluido.",
    )
    N(
        "I diametri dei pistoni",
        "Una pressa ideale a quote uguali ha un pistone di diametro 2 cm e l’altro di 6 cm. Se sul piccolo si applicano 25 N, quale forza si ottiene sul grande?",
        225,
        "N",
        0.1,
        25 * (6 / 2) ** 2,
        "Le aree dei cerchi sono proporzionali ai quadrati dei diametri.",
        r"$A_2/A_1=(d_2/d_1)^2=(6/2)^2=9~$F_2=25\cdot9=225\,\mathrm N~Il triplo diametro produce nove volte l’area, quindi nove volte la forza a pari pressione.",
        "algebra|Prima di usare i diametri trasformali in un rapporto di aree.",
    )
    N(
        "Ricavare la forza di comando",
        "Per sostenere 300 N sul pistone grande di area 90 cm², quale forza sul pistone piccolo di area 6 cm² è richiesta in equilibrio ideale e a quota uguale?",
        20,
        "N",
        0.05,
        300 * 6 / 90,
        "Questa volta la forza ignota è sul pistone piccolo.",
        r"$F_1/A_1=F_2/A_2\quad\Rightarrow\quad F_1=300(6/90)=20\,\mathrm N~La forza richiesta è minore della forza sul carico perché agisce su area minore.",
        "algebra|Isola la forza richiesta prima di sostituire i numeri.",
    )
    M(
        "Una bolla intrappolata",
        "All’inizio della corsa di un sistema idraulico una bolla d’aria si comprime sensibilmente. Quale equazione fra gli spostamenti dei pistoni perde validità durante questa fase?",
        "A₁s₁ = A₂s₂",
        "L’area di un pistone circolare è πr²|La massa del liquido chiuso si conserva|Una forza normale uniforme è pA",
        "Dove può finire parte del volume spinto dal primo pistone?",
        "Parte del volume spazzato dal primo pistone comprime il gas. Il secondo pistone può ricevere un volume minore. La relazione fra le corse richiede volume del fluido praticamente invariabile.",
        "modello|Controlla l’ipotesi di incomprimibilità dell’intero contenuto.",
        3,
    )
    N(
        "Un limite di corsa",
        "Un sollevatore ideale ha A₂/A₁ = 8. Il pistone piccolo può scendere al massimo di 0,24 m. Di quanti centimetri può salire il grande?",
        3,
        "cm",
        0.01,
        0.24 / 8 * 100,
        "La corsa si riduce nello stesso rapporto in cui cresce l’area.",
        r"$s_2=s_1(A_1/A_2)=0{,}24/8=0{,}030\,\mathrm m=3{,}0\,\mathrm{cm}~L’uscita spazza lo stesso volume con una corsa otto volte più breve.",
        "unità|Dopo aver calcolato lo spostamento in metri convertilo nell’unità richiesta.",
    )
    T(
        "La macchina con due pistoni",
        "Quale principio, identificato dal cognome del fisico, descrive la trasmissione di un incremento di pressione in un fluido confinato?",
        "Pascal",
        "principio di Pascal",
        "Distingui la trasmissione dallo studio della profondità e dal galleggiamento.",
        "Il principio di Pascal lega gli aumenti di pressione nei diversi punti del liquido confinato. Per passare da pressione a forza occorre conoscere l’area su cui essa agisce.",
        "concetto|Individua quale fenomeno il pistone mette in evidenza.",
    )
    N(
        "Quanto volume percorre la linea?",
        "Un pistone di area 12 cm² avanza di 5 mm in una linea piena di liquido incomprimibile. Quale volume sposta in mL?",
        6,
        "mL",
        0.01,
        12 * 0.5,
        "Usa centimetri sia per l’area sia per la corsa.",
        r"$s=5\,\mathrm{mm}=0{,}5\,\mathrm{cm},\qquad V=As=12\cdot0{,}5=6\,\mathrm{cm^3}~Un centimetro cubo equivale a un millilitro; lo spostamento vale 6 mL.",
        "unità|Un’area in cm² moltiplicata per una lunghezza in cm dà cm³.",
    )
    M(
        "Un impianto reale dissipa",
        "In una pressa reale con attriti, durante una manovra lenta il lavoro fornito supera il lavoro utile sul carico. Dove può andare la differenza?",
        "In aumento dell’energia interna delle parti a contatto",
        "In una creazione di massa liquida|In una pressione negativa obbligatoria|Nell’annullamento del volume spostato",
        "Identifica l’effetto meccanico dell’attrito sulle superfici.",
        "Gli attriti dissipano parte del lavoro fornito in energia interna. I lavori uguali dei due pistoni sono una previsione del modello ideale senza dissipazioni né accumuli.",
        "modello|Chiediti dove il sistema reale può trasferire energia.",
    )
    N(
        "Verifica della pressione ammissibile",
        "Una membrana di area 2 cm² separa il circuito dall’atmosfera. Quale forza netta corrisponde a una sovrapressione uniforme di 150 kPa?",
        30,
        "N",
        0.02,
        150e3 * 2e-4,
        "Il dato è già al netto della pressione atmosferica.",
        r"$F=\Delta p A=(150\times10^3)(2\times10^{-4})=30\,\mathrm N~Aggiungere l’atmosfera produrrebbe la forza su una sola faccia e trascurerebbe quella opposta.",
        "testo|Usa la pressione relativa per la forza netta fra interno ed esterno.",
    )
    M(
        "Due manometri alla stessa quota",
        "Due manometri ideali sono collegati a un liquido fermo alla medesima quota, sotto pistoni di area diversa; hanno lo stesso riferimento. Che cosa mostrano?",
        "La stessa pressione",
        "Pressioni proporzionali alle aree dei pistoni|Pressione maggiore sotto il pistone piccolo in ogni situazione|Una lettura nulla nel ramo largo",
        "Confronta due punti connessi alla stessa quota.",
        "L’equilibrio idrostatico dà pressioni uguali nei due punti. Le diverse aree influenzano le forze che i pistoni possono sostenere sotto quella pressione.",
        "concetto|Un manometro legge pressione e non una forza totale.",
    )
    L(
        "Guardare il volume spostato",
        "Fluidi in quiete",
        "Principio di Archimede|Spinta idrostatica|Condizioni di galleggiamento e immersione",
        r"""Immergi un corpo senza appoggiarlo sul fondo. Sulla sua superficie la pressione agisce in direzioni diverse. Poiché in profondità la pressione è maggiore, la somma delle forze su una superficie chiusa produce una risultante verso l’alto. Si può sostituire mentalmente il corpo con un volume di liquido della stessa forma: in equilibrio il liquido circostante dovrebbe sostenere proprio quel peso. Questa è la spinta di Archimede.
$S=\rho_f g V_{\rm immerso},\qquad P=mg
La densità ρ_f è quella del fluido che verrebbe spostato. Il volume immerso è la sola porzione che esclude il liquido. Se il corpo è completamente immerso in un liquido omogeneo, variarne la profondità senza cambiare il volume non cambia S. Cambiano le singole pressioni, ma la loro risultante resta la stessa.
@C2-spinta|In galleggiamento libero S e P hanno lo stesso modulo. L’acqua esclusa occuperebbe la sola parte del blocco sotto il livello libero.
$S=P\quad\Rightarrow\quad \frac{V_{\rm immerso}}{V_{\rm totale}}=\frac{\rho_{\rm corpo,media}}{\rho_f}
Questa relazione vale per un corpo libero che galleggia all’equilibrio con la sola gravità e la spinta del liquido, trascurando l’aria. Un oggetto cavo può galleggiare anche se le sue pareti hanno densità elevata: conta la massa totale sul volume esterno. Se devi trattenerlo sott’acqua, disegna anche la forza del vincolo prima di imporre l’equilibrio.""",
        (1, 2),
    )
    E(
        "La parte che emerge",
        1,
        "Un blocco uniforme di volume 450 cm³ e densità 800 kg/m³ galleggia liberamente in acqua di densità 1000 kg/m³. Quanto volume resta emerso?",
        r"""@C2-spinta|Il volume spostato è la parte sommersa. Il peso del blocco dipende dalla massa di tutto il blocco.
In equilibrio la forza di Archimede uguaglia il peso. Scrivi la massa del blocco come densità del blocco per il suo intero volume.
$\rho_f g V_i=\rho_b g V\quad\Rightarrow\quad V_i=(800/1000)450=360\,\mathrm{cm^3}
$V_{\rm emerso}=450-360=90\,\mathrm{cm^3}
Il rapporto Vᵢ/V è 0,80. Se il blocco avesse densità più vicina a quella dell’acqua, la parte emergente sarebbe ancora minore.""",
    )
    E(
        "Una lettura sotto la superficie",
        2,
        "Un oggetto appeso a un dinamometro segna 5,0 N in aria e 3,0 N quando è completamente immerso in acqua. Usa g = 10 m/s² e ρ acqua = 1000 kg/m³. Trascurando la spinta dell’aria, ricava volume e densità media.",
        r"""L’oggetto è fermo e non tocca il recipiente. In acqua il dinamometro sostiene solo parte del peso, mentre il liquido esercita la spinta verso l’alto.
$T+S=P\;\Rightarrow\;S=5{,}0-3{,}0=2{,}0\,\mathrm N
$V=S/(\rho_f g)=2/(1000\cdot10)=2{,}0\times10^{-4}\,\mathrm{m^3}
$m=P/g=5/10=0{,}50\,\mathrm{kg},\qquad \rho_b=m/V=2500\,\mathrm{kg/m^3}
La densità è maggiore di quella dell’acqua. Questo è coerente con la tensione verso l’alto richiesta per mantenere l’oggetto sospeso.""",
    )
    N(
        "Un volume totalmente immerso",
        "Un oggetto di forma irregolare sposta 75 cm³ d’acqua quando è immerso completamente. Con g = 10 m/s² e ρ = 1000 kg/m³, calcola la spinta.",
        0.75,
        "N",
        0.005,
        75e-6 * 1000 * 10,
        "Un cm³ è un milionesimo di metro cubo.",
        r"$S=\rho gV=1000\cdot10\cdot(75\times10^{-6})=0{,}75\,\mathrm N~La massa dell’acqua esclusa è 75 g. La sua forza peso conferma il risultato.",
        "unità|Converti un volume applicando il fattore di lunghezza tre volte.",
    )
    M(
        "Scendere più in profondità",
        "Una sfera rigida completamente immersa viene portata più in basso in un liquido omogeneo e incomprimibile. Quale affermazione vale per la spinta?",
        "Resta invariata",
        "Aumenta quanto la pressione sul fondo|Scompare|Dipende dalla sola pressione sulla sommità",
        "Confronta il volume e la densità di liquido spostato nei due stati.",
        "Crescono sia la pressione sulla parte bassa sia quella sulla parte alta. A parità di volume e di densità del liquido, il peso del liquido spostato e quindi la spinta restano gli stessi.",
        "concetto|Distingui pressione locale e risultante su tutta la superficie.",
    )
    N(
        "Tenere un galleggiante sommerso",
        "Un galleggiante di massa 0,12 kg e volume 200 cm³ viene tenuto fermo completamente sott’acqua. Usa ρ = 1000 kg/m³, g = 10 m/s². Qual è il modulo della forza esterna diretta verso il basso?",
        0.8,
        "N",
        0.005,
        1000 * 10 * 200e-6 - 0.12 * 10,
        "Confronta spinta e peso prima di inserire il vincolo.",
        r"$S=1000\cdot10\cdot200\times10^{-6}=2{,}0\,\mathrm N,\quad P=0{,}12\cdot10=1{,}2\,\mathrm N~$S-P-F=0\quad\Rightarrow\quad F=0{,}8\,\mathrm N~Senza la forza diretta in basso il galleggiante tenderebbe a risalire.",
        "modello|Nel diagramma entrano tre forze.",
        3,
    )
    M(
        "Un cubetto fra acqua e olio",
        "Un cubetto galleggia separatamente in acqua e in un olio meno denso, senza affondare in alcuno dei due. Dove è più grande il volume immerso?",
        "Nell’olio",
        "Nell’acqua|È sempre uguale|Dipende solo dalla profondità del recipiente",
        "I due liquidi devono sostenere lo stesso peso.",
        "Vale Vᵢ = m/ρ_f. Per spostare la stessa massa di liquido serve più volume nel liquido meno denso.",
        "algebra|Individua la densità del liquido al denominatore.",
    )
    T(
        "Sospensione senza appoggio",
        "Una sfera omogenea ha densità uguale a quella del liquido e resta sospesa liberamente a qualunque profondità. Completa: il suo galleggiamento è …",
        "neutro",
        "neutrale",
        "Confronta peso e spinta quando è tutta sommersa.",
        "Peso e spinta si bilanciano per l’intero volume sommerso. Se il liquido è omogeneo, un piccolo spostamento verticale non cambia il loro bilancio.",
        "concetto|Considera che cosa succede cambiando profondità a volume fisso.",
    )
    N(
        "Portata di carico di un pontone",
        "Un piccolo pontone di massa 5 kg può spostare fino a 0,018 m³ d’acqua di densità 1000 kg/m³ al livello massimo consentito. Quale massa aggiuntiva può sostenere al limite?",
        13,
        "kg",
        0.02,
        1000 * 0.018 - 5,
        "La massa totale sostenuta uguaglia quella d’acqua spostata.",
        r"$m_{\rm totale}=\rho V=1000\cdot0{,}018=18\,\mathrm{kg}~$m_{\rm carico}=18-5=13\,\mathrm{kg}~La tara del pontone occupa già parte della capacità di galleggiamento.",
        "testo|Il carico aggiuntivo si trova dopo aver sottratto la massa propria.",
    )
    M(
        "Due solidi dello stesso volume",
        "Due oggetti rigidi di uguale volume esterno e massa diversa sono completamente immersi nello stesso liquido. Cosa misurano due dinamometri che li tengono sospesi dall’alto se entrambi affonderebbero?",
        "Spinte uguali e tensioni diverse",
        "Spinte diverse e tensioni uguali|Entrambe le tensioni nulle|Spinta maggiore sul più pesante in proporzione alla massa",
        "Scrivi separatamente la legge della spinta e il bilancio verticale.",
        r"$S=\rho_f gV,\qquad T=mg-S~Il primo termine dipende dal volume comune; il peso e quindi la tensione crescono invece con la massa dell’oggetto.",
        "modello|La massa del corpo entra nel peso, la densità del fluido nella spinta.",
    )
    N(
        "Galleggiamento alla superficie di due liquidi",
        "Un oggetto di volume 100 cm³ è totalmente immerso fra due liquidi immiscibili. Sposta 60 cm³ d’acqua (1,0 g/cm³) e 40 cm³ d’olio (0,8 g/cm³). Quale massa ha se è libero e fermo?",
        92,
        "g",
        0.05,
        60 * 1 + 40 * 0.8,
        "Somma le masse di ciascun liquido escluso.",
        r"$S=g(\rho_a V_a+\rho_oV_o)=mg~$m=1{,}0\cdot60+0{,}8\cdot40=60+32=92\,\mathrm g~La densità media del corpo è 0,92 g/cm³, intermedia fra quelle dei due liquidi.",
        "modello|Ciascun volume escluso va pesato con la propria densità.",
        3,
    )
    N(
        "Un areometro sale di poco",
        "Un galleggiante di massa 60 g è in equilibrio in liquido di densità 1,20 g/cm³. Quale volume di liquido sposta?",
        50,
        "cm³",
        0.05,
        60 / 1.2,
        "La massa di liquido spostato coincide con quella del galleggiante.",
        r"$\rho_f V_i=m\quad\Rightarrow\quad V_i=60/1{,}20=50\,\mathrm{cm^3}~Il liquido più denso dell’acqua sostiene il galleggiante spostando meno di 60 cm³.",
        "algebra|Dividi la massa per la densità del fluido.",
    )
    M(
        "Una ciotola pesante galleggia",
        "Una ciotola metallica aperta galleggia, una pallina compatta dello stesso metallo affonda. Quale differenza spiega l’osservazione?",
        "La ciotola può escludere un volume d’acqua maggiore a parità di massa",
        "La gravità è minore nella ciotola|La densità del metallo cambia con la forma|La ciotola non ha peso",
        "Confronta il volume delimitato dall’involucro tenendo l’acqua fuori.",
        "Il grande volume esterno della ciotola permette una spinta sufficiente prima che l’acqua entri. La densità media riferita al volume escluso può essere inferiore a quella dell’acqua.",
        "concetto|Usa il volume effettivamente sottratto al liquido.",
    )
    L(
        "Contare ciò che attraversa una sezione",
        "Fluidi in movimento",
        "Flusso e portata volumetrica|Conservazione della massa|Equazione di continuità|Velocità media di sezione|Biforcazioni",
        r"""Segna un piano immaginario di traverso a un tubo e chiediti quanto liquido lo attraversa ogni secondo. La portata volumetrica Q è il volume transitato diviso per il tempo. Se la velocità varia da punto a punto, si usa la componente normale media sulla sezione. Nel caso di velocità uniforme perpendicolare, in un tempo Δt la colonna che attraversa il piano è lunga vΔt e ha volume AvΔt.
$Q=\frac{\Delta V}{\Delta t}=A\bar v_n,\qquad [Q]=\mathrm{m^3/s},\qquad \dot m=\rho Q
@C2-condotto|Le linee verticali delimitano le sezioni di misura. La freccia più lunga nella sezione stretta indica una velocità media maggiore quando Q è comune.
In regime stazionario nessuna regione accumula massa nel tempo. A una biforcazione la somma delle portate di massa entranti è uguale alla somma di quelle uscenti. Se il fluido ha densità costante e non ci sono perdite, puoi applicare lo stesso bilancio ai volumi. La continuità segue dalla conservazione della massa e vale anche per un liquido viscoso.
$\rho_1 A_1\bar v_1=\rho_2 A_2\bar v_2,\quad \rho_1=\rho_2\;\Rightarrow\; A_1\bar v_1=A_2\bar v_2
In un condotto più stretto la velocità media deve crescere se permane la stessa portata. In una rete di molti rami in parallelo conta la somma delle loro aree. È così possibile avere scorrimento medio più lento attraverso un letto di piccoli condotti nonostante il ridotto diametro dei singoli rami. Se il recipiente si riempie, mantieni nel bilancio il volume accumulato.""",
        (1,),
    )
    E(
        "Dalla sacca al tubo",
        2,
        "In 40 s passano 120 mL di acqua attraverso una sezione di 15 mm². In condizioni stazionarie, trova la portata e la velocità media.",
        r"""Il volume è una misura integrata nel tempo, quindi inizia dalla portata. Per ricavare la velocità media usa la sezione perpendicolare al flusso.
$Q=120/40=3{,}0\,\mathrm{mL/s}=3{,}0\times10^{-6}\,\mathrm{m^3/s}
$A=15(10^{-3}\,\mathrm m)^2=1{,}5\times10^{-5}\,\mathrm{m^2}
$\bar v=Q/A=(3{,}0\times10^{-6})/(1{,}5\times10^{-5})=0{,}20\,\mathrm{m/s}
Un cilindro lungo 0,20 m e di base 15 mm² contiene 3 mL: è il volume che in media attraversa la sezione in un secondo.""",
    )
    E(
        "Molti rami, un bilancio",
        2,
        "Un tubo di raggio 2,0 mm alimenta quattro rami uguali di raggio 1,5 mm. La velocità media in ingresso è 0,45 m/s e i rami ricevono la stessa portata. Calcola la velocità media in un ramo in regime stazionario incomprimibile.",
        r"""Disegna un contorno attorno alla biforcazione. L’intera portata in ingresso viene divisa fra i quattro rami. La velocità in un ramo si ricava usando la sezione di quel ramo.
$Q_{\rm in}=\pi r_i^2v_i=4\pi r_b^2v_b
$v_b=v_i\frac{r_i^2}{4r_b^2}=0{,}45\frac{(2{,}0)^2}{4(1{,}5)^2}=0{,}20\,\mathrm{m/s}
Usare entrambi i raggi in mm è lecito nel rapporto. La sezione totale dei rami supera quella dell’ingresso; la minore velocità media è quindi coerente.""",
    )
    N(
        "Un recipiente si riempie",
        "In una vasca entrano 9 L/min e ne escono 5 L/min. Quanto volume si accumula in 45 s a portate costanti?",
        3,
        "L",
        0.01,
        (9 - 5) * 45 / 60,
        "Usa la portata netta e converti i secondi in minuti.",
        r"$Q_{\rm netto}=9-5=4\,\mathrm{L/min},\quad\Delta t=45/60=0{,}75\,\mathrm{min}~$\Delta V=4\cdot0{,}75=3\,\mathrm L~Il segno positivo indica un livello crescente.",
        "testo|Le due portate hanno versi opposti rispetto al recipiente.",
    )
    M(
        "Un getto che si assottiglia",
        "Un getto d’acqua verticale cade e accelera nell’aria. Nel tratto continuo e stazionario perché la sezione si restringe?",
        "La stessa portata attraversa sezioni con velocità crescente",
        "L’acqua diventa molto più densa|La portata deve ridursi con la quota|La gravità consuma volume",
        "Applica il bilancio di massa fra due sezioni del getto.",
        r"$Q=A\bar v=\text{costante}~L’acqua è quasi incomprimibile. Dove il getto è più rapido serve area minore per far passare lo stesso volume per secondo.",
        "modello|Confronta area e velocità a portata fissata.",
    )
    N(
        "Ricavare il diametro dal flusso",
        "In un tubo circolare passano 8π cm³/s alla velocità media di 2 cm/s. Calcola il diametro interno.",
        4,
        "cm",
        0.01,
        2 * sqrt((8 * pi / 2) / pi),
        "Dividi Q per v per ottenere l’area interna.",
        r"$A=Q/\bar v=(8\pi)/2=4\pi\,\mathrm{cm^2}~$r=\sqrt{A/\pi}=2\,\mathrm{cm},\qquad d=2r=4\,\mathrm{cm}~L’area determina direttamente il raggio dopo la radice.",
        "algebra|Il testo richiede il doppio del raggio.",
    )
    N(
        "Un ramo laterale non misurato",
        "Da un raccordo escono due rami. In ingresso transitano 36 mL/s, nel primo ramo si misurano 840 mL/min. Quanto scorre in mL/s nel secondo ramo, in stato stazionario?",
        22,
        "mL/s",
        0.05,
        36 - 840 / 60,
        "Rendi omogenee le unità temporali.",
        r"$Q_1=840/60=14\,\mathrm{mL/s},\quad Q_2=Q_{\rm in}-Q_1=36-14=22\,\mathrm{mL/s}~La somma delle uscite 14 + 22 restituisce la portata in ingresso.",
        "unità|Non sottrarre portate espresse per minuto e per secondo.",
    )
    M(
        "Stazionario non vuol dire uniforme",
        "Un tubo ha due sezioni diverse e una portata costante nel tempo. Cosa deve rimanere costante nel tempo per chiamare stazionario il campo di velocità?",
        "La velocità misurata in ciascun punto fisso",
        "La velocità lungo tutto il tubo deve essere la stessa|La velocità di ciascuna particella deve essere nulla|Le sezioni del tubo devono avere la stessa area",
        "Scegli una sonda e lasciala ferma nello stesso punto.",
        "In regime stazionario una sonda fissa continua a leggere lo stesso valore. In punti diversi i valori possono differire e una particella in viaggio può accelerare.",
        "concetto|Distingui la variazione nel tempo alla sonda da quella nello spazio.",
    )
    N(
        "Una portata di massa",
        "Un liquido di densità 0,85 kg/L attraversa una sezione con portata di 12 L/min. Quanti chilogrammi passano in un secondo?",
        0.17,
        "kg",
        0.001,
        0.85 * 12 / 60,
        "Moltiplica la portata volumetrica per la densità.",
        r"$\dot m=0{,}85\cdot12=10{,}2\,\mathrm{kg/min}=0{,}17\,\mathrm{kg/s}~In un intervallo di 1 s passano quindi 0,17 kg.",
        "unità|Il fattore 60 converte da minuto a secondo.",
    )
    M(
        "Gas in un restringimento",
        "Un gas scorre senza accumulo. Fra due sezioni la densità raddoppia e l’area si dimezza. Come cambia la velocità media se la densità è uniforme in ciascuna sezione?",
        "Resta uguale",
        "Raddoppia|Si dimezza|Quadruplica",
        "Per il gas conserva la portata di massa.",
        r"$\rho_1A_1v_1=\rho_2A_2v_2~Il prodotto ρA è lo stesso nelle due sezioni: il raddoppio della densità compensa il dimezzamento dell’area. Segue v₂ = v₁.",
        "modello|Se la densità varia, la portata volumetrica può cambiare.",
    )
    T(
        "Velocità efficace per la portata",
        "In Q = A v, per un profilo non uniforme v è la velocità normale … sulla sezione. Completa con una parola.",
        "media",
        "mediata",
        "Immagina di sommare i contributi delle piccole porzioni di area.",
        "Ogni porzione porta un contributo vₙ ΔA. Dividendo la somma per l’area totale si ottiene la velocità media di sezione, che riproduce la portata reale.",
        "concetto|Il valore al centro del tubo è solo una lettura locale.",
    )
    N(
        "Un residuo nella linea",
        "Una pompa trasferisce 2,4 L in 3 min a ritmo uniforme. All’avvio la linea vuota deve riempirsi con 120 mL. Per quanti secondi occorre attendere prima dell’arrivo all’uscita ideale?",
        9,
        "s",
        0.05,
        0.12 / (2.4 / 180),
        "Calcola il tempo per spostare il volume interno della linea.",
        r"$Q=2400/180=13{,}33\,\mathrm{mL/s}~$t=V_{\rm linea}/Q=120/13{,}33\simeq9{,}0\,\mathrm s~Il calcolo assume assenza di aria intrappolata, comprimibilità e perdite di volume.",
        "testo|Il volume da riempire è quello della linea, non il totale pompato.",
    )
    N(
        "Somma delle aree capillari",
        "In un modello di rete entrano 6 mL/s e la velocità media nelle sezioni complessive del letto terminale è 0,20 cm/s. Qual è l’area totale aperta?",
        30,
        "cm²",
        0.05,
        6 / 0.20,
        "Porta i millilitri in centimetri cubi.",
        r"$Q=6\,\mathrm{cm^3/s},\qquad A_{\rm tot}=Q/\bar v=6/0{,}20=30\,\mathrm{cm^2}~È la somma delle aree attraversate, che può essere grande anche se ciascun ramo è piccolo.",
        "modello|Distingui area totale della rete e area di un suo ramo.",
        3,
    )
    L(
        "Seguire l’energia lungo una corrente",
        "Fluidi in movimento",
        "Teorema di Bernoulli|Pressione statica e dinamica|Stenosi e aneurisma in modello ideale|Condizioni di validità",
        r"""Quando un liquido accelera in un restringimento, da dove proviene l’energia cinetica in più? Segui una piccola porzione lungo una linea di corrente. Le pressioni ai suoi estremi possono compiere lavoro e la gravità può cambiare l’energia di quota. Nel modello di Bernoulli, flusso stazionario incomprimibile senza dissipazione né macchine fra le due sezioni, la somma delle tre energie per unità di volume resta costante lungo quella linea.
$p+\tfrac12\rho v^2+\rho gz=\mathrm{costante}
Ogni termine si misura in pascal: pressione statica, contributo cinetico e contributo di quota. La z cresce verso l’alto. Per usare velocità medie di sezione nello schema monodimensionale si assumono profili approssimativamente uniformi. Nei liquidi reali i termini cinetici e le perdite richiedono maggior cura.
@C2-bernoulli|Due tubicini aperti rilevano la pressione statica. Nel modello orizzontale ideale il livello è più basso nella sezione stretta, dove la velocità è maggiore.
$p_1-p_2=\tfrac12\rho(v_2^2-v_1^2)+\rho g(z_2-z_1)
Per una stenosi idealizzata, la continuità prevede maggiore velocità nella sezione ristretta. Alla stessa quota la pressione statica può quindi calare localmente. In una dilatazione idealizzata la velocità media scende e la pressione statica può recuperare. Nel flusso ematico reale contribuiscono viscosità, pulsazioni, elasticità delle pareti, separazione del getto e perdite irreversibili: un recupero ideale di pressione non equivale a una misura in un paziente. Prima di scegliere Bernoulli, disegna i punti e verifica quali ipotesi puoi difendere.""",
        (2, 5),
    )
    E(
        "Leggere i due tubicini",
        2,
        "In un tubo orizzontale ideale scorre acqua con velocità uniforme di 1 m/s nella parte larga e 3 m/s in quella stretta. ρ = 1000 kg/m³ e g = 10 m/s². Quanto differiscono pressione statica e altezza dei piezometri?",
        r"""@C2-bernoulli|La sezione veloce è quella in corrispondenza del livello libero più basso. I piezometri sono aperti alla stessa atmosfera.
Con z₁ = z₂, il lavoro di pressione sostiene l’aumento dell’energia cinetica per unità di volume.
$p_1-p_2=\tfrac12\rho(v_2^2-v_1^2)=\tfrac12(1000)(9-1)=4000\,\mathrm{Pa}
Nelle colonnine il liquido è fermo, perciò la differenza fra le altezze libere vale la differenza di pressione divisa per ρg.
$h_1-h_2=4000/(1000\cdot10)=0{,}40\,\mathrm m
La sezione larga ha 4 kPa di pressione statica in più. Il termine dinamico aumenta esattamente di 4 kPa nel modello.""",
    )
    E(
        "Efflusso da un grande recipiente",
        2,
        "Un foro piccolo è 0,80 m sotto il livello libero di un grande recipiente aperto. Il getto sbocca in atmosfera. Con g = 10 m/s², stima la velocità ideale all’uscita.",
        r"""Prendi come punto 1 la superficie libera e come punto 2 il getto appena fuori dal foro. Entrambi sono alla pressione atmosferica. L’area del recipiente è così grande che la velocità della superficie è trascurabile; approssimiamo il deflusso come quasi stazionario.
$p_{\rm atm}+\rho g z_1=p_{\rm atm}+\tfrac12\rho v_2^2+\rho g z_2
$g(z_1-z_2)=\tfrac12v_2^2\quad\Rightarrow\quad v_2=\sqrt{2gh}=\sqrt{2(10)(0{,}80)}=4{,}0\,\mathrm{m/s}
La densità si cancella. Resistenze e contrazione del getto possono modificare portata e velocità osservate; questa è una stima ideale dell’efflusso.""",
    )
    M(
        "Una stenosi idealizzata",
        "Un fluido ideale incomprimibile scorre stazionario in un tubo orizzontale senza rami. Che cosa avviene entrando in un restringimento?",
        "Aumenta la velocità e cala la pressione statica",
        "Aumentano velocità e pressione statica|Diminuiscono entrambe|Aumenta la portata e resta uguale la velocità",
        "Usa prima il bilancio di massa, poi quello dell’energia.",
        "La stessa Q richiede v maggiore nella sezione piccola. A quota uguale, p + ρv²/2 resta costante lungo la linea di corrente; il termine di pressione diminuisce.",
        "modello|Esegui i due bilanci in successione.",
    )
    N(
        "Una dilatazione ideale",
        "In una dilatazione orizzontale ideale la velocità passa da 2,0 m/s a 1,0 m/s. Per ρ = 1000 kg/m³, calcola p finale meno p iniziale.",
        1500,
        "Pa",
        1,
        0.5 * 1000 * (2**2 - 1**2),
        "Il contributo cinetico diminuisce nella sezione finale.",
        r"$p_2-p_1=\tfrac12\rho(v_1^2-v_2^2)=500(4-1)=1500\,\mathrm{Pa}~Il risultato positivo indica un recupero di pressione statica nel modello senza perdite.",
        "algebra|Rispetta l’ordine richiesto della differenza di pressione.",
    )
    N(
        "Una salita a velocità invariata",
        "In un tubo ideale a sezione costante un liquido di densità 800 kg/m³ sale di 0,75 m a velocità costante. Con g = 10 m/s², di quanti pascal diminuisce la pressione?",
        6000,
        "Pa",
        1,
        800 * 10 * 0.75,
        "I contributi cinetici sono uguali nei due punti.",
        r"$p_1-p_2=\rho g(z_2-z_1)=800\cdot10\cdot0{,}75=6000\,\mathrm{Pa}~Il lavoro della pressione finanzia il guadagno di quota pur senza cambiare la velocità.",
        "modello|Se la quota cambia includi il termine gravitazionale.",
    )
    N(
        "Fermare una linea di corrente",
        "In aria trattata come incomprimibile (ρ = 1,2 kg/m³) un punto di ristagno alla stessa quota ha pressione superiore di 60 Pa alla statica della corrente. Quanto vale la velocità indisturbata nel modello ideale?",
        10,
        "m/s",
        0.02,
        sqrt(2 * 60 / 1.2),
        "Nel punto di ristagno v = 0.",
        r"$p_{\rm rist}-p=\tfrac12\rho v^2\quad\Rightarrow\quad v=\sqrt{2(60)/1{,}2}=\sqrt{100}=10\,\mathrm{m/s}~L’energia cinetica per unità di volume è convertita in pressione di ristagno.",
        "algebra|Dopo aver isolato v² estrai la radice positiva.",
    )
    M(
        "Dove la formula ideale fallisce",
        "Un lungo tubo orizzontale uniforme con liquido viscoso in regime stazionario mostra pressione più bassa a valle, con la stessa velocità media. Quale fenomeno deve entrare nel bilancio?",
        "La dissipazione viscosa",
        "Una diminuzione necessaria di massa|Un aumento necessario della quota|La scomparsa della pressione atmosferica",
        "Confronta i termini di quota e velocità nelle due sezioni.",
        "Quota e velocità media non cambiano. Una caduta di pressione persistente alimenta la dissipazione viscosa; Bernoulli senza perdite non può descrivere tale caduta.",
        "modello|Controlla l’ipotesi di perdite trascurabili.",
    )
    N(
        "Stimare il rapporto di sezioni",
        "In un tubo orizzontale ideale il fluido ha ρ = 1000 kg/m³ e a monte v₁ = 1 m/s. A valle la pressione è 1500 Pa più bassa. Calcola il rapporto A₁/A₂.",
        2,
        "",
        0.005,
        sqrt(1 + 2 * 1500 / 1000) / 1,
        "Ricava la velocità a valle prima di confrontare le aree.",
        r"$v_2^2=v_1^2+2(p_1-p_2)/\rho=1+3=4\,\mathrm{m^2/s^2}~$v_2=2\,\mathrm{m/s},\qquad A_1/A_2=v_2/v_1=2~La sezione finale più piccola è coerente con l’aumento di velocità.",
        "modello|Bernoulli fornisce le velocità, la continuità collega le aree.",
        3,
    )
    T(
        "Il punto in cui la velocità si annulla",
        "Come si chiama il punto nel quale una linea di corrente si arresta contro un ostacolo? Rispondi con il sostantivo dopo «punto di».",
        "ristagno",
        "stagnazione",
        "In quel punto il termine ρv²/2 si annulla.",
        "Il punto di ristagno ha velocità nulla nel riferimento dell’ostacolo. Nelle condizioni ideali la sua pressione include il contributo cinetico della corrente incidente alla medesima quota.",
        "concetto|Distingui un punto di arresto locale dall’intero fluido in quiete.",
    )
    M(
        "Limite nel modello di aneurisma",
        "In un allargamento brusco reale si osservano zone di ricircolo. Perché il recupero di pressione può essere inferiore alla stima ideale?",
        "Separazione e dissipazione sottraggono energia meccanica",
        "Il sangue perde necessariamente massa|Il termine di quota cambia sempre segno|Poiché la pressione non può mai aumentare lungo il flusso",
        "Confronta il contenuto energetico di flussi ordinati e dissipativi.",
        "La minore velocità media rende possibile il recupero di pressione, ma separazione del flusso e viscosità dissipano parte dell’energia. Il modello ideale trascura questi processi.",
        "modello|Distingui una previsione del modello dal comportamento del flusso reale.",
    )
    N(
        "Cambiare l’altezza del serbatoio",
        "Un piccolo foro di un grande serbatoio aperto ha velocità ideale 2 m/s. Se il dislivello sopra il foro quadruplica, quale diventa la velocità ideale?",
        4,
        "m/s",
        0.01,
        2 * sqrt(4),
        "La velocità di efflusso varia con la radice del dislivello.",
        r"$v_2/v_1=\sqrt{h_2/h_1}=\sqrt4=2\quad\Rightarrow\quad v_2=2\cdot2=4\,\mathrm{m/s}~Quadruplicare l’energia gravitazionale disponibile per unità di massa raddoppia la rapidità.",
        "algebra|La potenza un mezzo appartiene alla dipendenza della velocità dall’altezza.",
    )
    M(
        "Differenza di quadrati",
        "Per due sezioni orizzontali di un tubo ideale qualcuno scrive p₁ − p₂ = ρ(v₂ − v₁)²/2. Quale correzione riflette il bilancio energetico?",
        "Usare ρ(v₂² − v₁²)/2",
        "Togliere solo il fattore 1/2|Usare ρ(v₂ + v₁)²/2|Dividere per la densità",
        "Calcola l’energia cinetica per unità di volume in ciascuno stato.",
        "Si sottraggono due energie ciascuna proporzionale al proprio quadrato della velocità. La differenza di quadrati è (v₂ − v₁)(v₂ + v₁), che in generale differisce dal quadrato della differenza.",
        "algebra|Eleva al quadrato ogni velocità prima della sottrazione.",
    )
    L(
        "Dal movimento degli strati alla viscosità",
        "Fluidi in movimento",
        "Flussi laminari e turbolenti|Regime stazionario|Viscosità dinamica|Gradiente di velocità|Profilo parabolico laminare",
        r"""Fai scorrere lentamente una lastra sopra uno strato d’olio, mantenendo ferma la lastra inferiore. Lo strato vicino alla lastra mobile si muove più rapidamente di quello vicino alla lastra fissa. Per conservare la velocità della lastra serve una forza tangenziale. La viscosità dinamica η misura quanto sforzo è necessario per mantenere un dato gradiente di velocità in un liquido newtoniano.
$|\tau|=\eta\left|\frac{\mathrm dv_x}{\mathrm dy}\right|,\quad [\tau]=\mathrm{Pa},\quad [\eta]=\mathrm{Pa\,s}
Il gradiente dice quanto cambia la velocità passando da uno strato a quello vicino in direzione trasversale. Per due piastre piane parallele, flusso stazionario sviluppato, senza gradiente di pressione e con aderenza alle superfici, il profilo è lineare e il gradiente è la differenza delle velocità divisa per la distanza fra le piastre.
@C2-profilo|Nel tubo mosso da una caduta di pressione il profilo è invece parabolico. Le frecce verdi sono velocità e la linea rossa unisce le loro punte.
In un tubo diritto e circolare un flusso laminare pienamente sviluppato di fluido newtoniano aderente alle pareti presenta velocità nulla alla parete e massima sull’asse. La media d’area vale metà della velocità centrale. Nel regime laminare gli strati scorrono in modo ordinato. Un flusso turbolento presenta fluttuazioni e mescolamento; la sua media può essere stazionaria nel tempo. «Laminare» descrive l’organizzazione del moto, «stazionario» la sua dipendenza temporale.
$v(r)=v_{\max}\left[1-(r/R)^2\right],\qquad \bar v=v_{\max}/2
Un confronto di scala utile, come approfondimento, è il numero di Reynolds Re = ρv̄D/η: mette in rapporto inerzia e viscosità. L’eventuale transizione dipende anche da geometria, perturbazioni e ingresso. Nessuna soglia universale sostituisce il controllo del regime nel caso reale.""",
        (5, 6),
    )
    E(
        "L’olio fra due piastre",
        2,
        "Una lastra di area 0,020 m² scorre a 0,30 m/s sopra una lastra ferma, con 2,0 mm di olio fra le due. La viscosità è 0,40 Pa·s. Nel modello lineare senza gradiente di pressione, che forza occorre per mantenerla in moto?",
        r"""Il moto relativo genera una variazione di velocità trasversale. Con due piastre estese, regime stazionario e aderenza, il gradiente è costante.
$d=0{,}0020\,\mathrm m,\qquad |\Delta v/\Delta y|=0{,}30/0{,}0020=150\,\mathrm{s^{-1}}
$|\tau|=\eta|\Delta v/\Delta y|=0{,}40\cdot150=60\,\mathrm{Pa}
$F=|\tau|A=60\cdot0{,}020=1{,}2\,\mathrm N
La forza esterna necessaria punta nel verso del moto della lastra. Il liquido esercita sulla lastra una forza opposta di uguale modulo in questo moto uniforme.""",
    )
    E(
        "Una sonda a metà raggio",
        2,
        "In un tubo in regime laminare sviluppato la velocità al centro è 0,40 m/s. Calcola la velocità locale a metà raggio e la velocità media sulla sezione.",
        r"""@C2-profilo|L’asse si trova sulla linea tratteggiata. A metà della distanza radiale fra asse e parete la freccia è ancora lunga.
Per liquido newtoniano nel tubo circolare usa r = R/2. Prima esprimi la distanza come rapporto al raggio esterno.
$v(R/2)=v_{\max}[1-(1/2)^2]=0{,}40(1-0{,}25)=0{,}30\,\mathrm{m/s}
$\bar v=v_{\max}/2=0{,}20\,\mathrm{m/s}
La media pesa anche le corone vicine alla parete, dove il liquido procede lentamente e l’area è ampia. Non è la lettura locale a metà raggio.""",
    )
    M(
        "Riconoscere il regime da un tracciante",
        "Un sottile filamento colorato rimane ordinato in un tubo diritto e le linee di moto scorrono affiancate. Quale regime è suggerito nel tratto osservato?",
        "Laminare",
        "Obbligatoriamente turbolento|Sicuramente privo di viscosità|In quiete",
        "Stai osservando la struttura del moto.",
        "Un filamento che segue ordinatamente il flusso indica assenza di forte mescolamento trasversale nel tratto osservato. Questo è compatibile con regime laminare; anche un fluido viscoso può scorrere così.",
        "concetto|Non confondere moto ordinato con viscosità nulla.",
    )
    N(
        "Velocità media dalla sonda assiale",
        "In flusso di Poiseuille pienamente sviluppato una sonda sull’asse registra 0,56 m/s. Calcola la velocità media.",
        0.28,
        "m/s",
        0.002,
        0.56 / 2,
        "Il profilo nel tubo circolare è parabolico.",
        r"$\bar v=v_{\rm asse}/2=0{,}56/2=0{,}28\,\mathrm{m/s}~La sonda centrale campiona il massimo. Per la portata occorre la media pesata sull’area.",
        "modello|Controlla la posizione della sonda nella sezione.",
    )
    N(
        "Misurare un gradiente locale",
        "Fra due strati a distanza 0,50 mm la velocità varia di 0,020 m/s. Qual è il modulo del gradiente medio trasversale?",
        40,
        "s⁻¹",
        0.05,
        0.020 / 0.0005,
        "Dividi una velocità per una lunghezza.",
        r"$|\Delta v/\Delta y|=0{,}020/(0{,}50\times10^{-3})=40\,\mathrm{s^{-1}}~Il metro si semplifica. Stai confrontando punti diversi nello stesso istante.",
        "unità|Il gradiente spaziale di velocità ha dimensione di inverso del tempo.",
    )
    N(
        "Risultato di un viscosimetro piano",
        "Una prova su un liquido newtoniano misura uno sforzo tangenziale di 3,6 Pa per un gradiente di velocità di 12 s⁻¹. Qual è η?",
        0.30,
        "Pa·s",
        0.002,
        3.6 / 12,
        "Isola il coefficiente che collega sforzo e gradiente.",
        r"$\eta=|\tau|/|\mathrm dv/\mathrm dy|=3{,}6/12=0{,}30\,\mathrm{Pa\,s}~Dividere per s⁻¹ equivale a moltiplicare per secondi.",
        "algebra|Identifica quale grandezza è il coefficiente di proporzionalità.",
    )
    M(
        "Scorrimento uniforme degli strati",
        "Due strati adiacenti di un fluido newtoniano hanno la stessa velocità in un tratto di campo uniforme. Qual è lo sforzo viscoso di taglio dovuto a quel gradiente?",
        "Nullo",
        "Massimo se la velocità è elevata|Uguale alla pressione assoluta|Sempre uguale alla viscosità",
        "La legge lega lo sforzo alla variazione trasversale della velocità.",
        "Un campo uniforme ha gradiente di velocità nullo. Anche a velocità elevata questo contributo di taglio è nullo; la pressione normale può restare diversa da zero.",
        "concetto|Confronta velocità assoluta e differenza fra strati.",
    )
    T(
        "Il valore sulla parete",
        "Per una parete ferma con condizione di aderenza, la velocità del liquido direttamente a contatto con essa è …",
        "nulla",
        "zero|0|pari a zero",
        "La condizione è anche detta no-slip.",
        "La velocità del fluido coincide con quella della parete all’interfaccia. Se la parete è ferma questo valore è zero, anche quando nel centro del tubo il liquido scorre.",
        "concetto|Applica l’aderenza al punto in contatto.",
    )
    M(
        "Dove è maggiore il taglio?",
        "Nel profilo parabolico completamente sviluppato di un tubo diritto, dove è massimo il modulo del gradiente radiale di velocità?",
        "Alla parete",
        "Sull’asse|È uguale in tutta la sezione|Dove la pressione assoluta è nulla",
        "Guarda dove le lunghezze delle frecce cambiano più rapidamente.",
        "La parabola è piatta sull’asse e più inclinata vicino alla parete. Per un fluido newtoniano anche il modulo dello sforzo di taglio è massimo alla parete.",
        "concetto|La velocità massima e la pendenza massima del profilo sono proprietà diverse.",
    )
    N(
        "Un valore intermedio nel profilo",
        "Che frazione della velocità massima si misura a r = 0,80R in un profilo di Poiseuille?",
        0.36,
        "",
        0.002,
        1 - 0.8**2,
        "Sostituisci il rapporto radiale nella parabola.",
        r"$v/v_{\max}=1-(r/R)^2=1-0{,}80^2=1-0{,}64=0{,}36~Avvicinandosi alla parete il rapporto scende verso zero.",
        "algebra|Calcola prima il quadrato del rapporto radiale.",
    )
    M(
        "Un fluido a viscosità dipendente dal gradiente",
        "Si ripete una prova raddoppiando il gradiente di velocità e si osserva che lo sforzo cresce di un fattore 1,3. Temperatura, composizione e misura sono controllate. Quale ipotesi è messa in dubbio?",
        "Viscosità costante di un fluido newtoniano",
        "Conservazione della massa|Definizione di volume|Esistenza di pressione normale",
        "Controlla se sforzo e gradiente sono proporzionali.",
        "Per η costante, raddoppiare il gradiente dovrebbe raddoppiare lo sforzo. Il rapporto tra i due cambia in questa prova, segnalando che un solo valore di η non descrive entrambe le condizioni.",
        "modello|La proporzionalità diretta richiede lo stesso fattore di crescita.",
        3,
    )
    N(
        "Dilatare lo spazio fra piastre",
        "Due piastre nel modello di scorrimento lineare hanno velocità relativa e area costanti. Se la distanza passa da 1,0 a 2,5 mm, quale frazione della forza iniziale serve a parità di viscosità?",
        0.4,
        "",
        0.002,
        1 / 2.5,
        "A Δv fissata il gradiente diminuisce quando aumenta la distanza.",
        r"$F=\eta A\Delta v/d\quad\Rightarrow\quad F_2/F_1=d_1/d_2=1{,}0/2{,}5=0{,}40~Il liquido deve accomodare lo stesso salto di velocità su uno strato più spesso.",
        "algebra|Nel rapporto delle forze la distanza compare invertita.",
    )
    L(
        "Perché il raggio conta quattro volte",
        "Fluidi in movimento",
        "Legge di Hagen–Poiseuille|Ruolo di raggio, lunghezza, viscosità e salto di pressione|Resistenza idraulica|Limiti dei modelli fisiologici",
        r"""In un tubo reale lungo e orizzontale, mantenere una portata richiede lavoro continuo contro gli attriti interni. Una pressione maggiore a monte esercita questo lavoro. Poniamo Δp = p ingresso − p uscita e Q positiva nel verso del flusso. Per un tubo diritto, rigido e circolare, con raggio uniforme, fluido incomprimibile newtoniano, moto laminare stazionario pienamente sviluppato e aderenza alla parete, la legge di Hagen–Poiseuille fornisce la portata.
$Q=\frac{\pi r^4}{8\eta L}\,\Delta p,\qquad R_h=\frac{\Delta p}{Q}=\frac{8\eta L}{\pi r^4}
r e L sono in metri, η in Pa·s, Δp in Pa, Q in m³/s e R_h in Pa·s/m³. La quarta potenza ha due origini: a caduta di pressione e lunghezza fissate la velocità media cresce come r², e l’area cresce a sua volta come r².
@C2-raggio|Le due sezioni appartengono a tubi confrontati alla stessa Δp, alla stessa viscosità e alla stessa lunghezza. Quello di destra ha metà raggio.
$\frac{Q_2}{Q_1}=\frac{r_2^4}{r_1^4}=\left(\frac{r_2}{r_1}\right)^4,\qquad r_2=\frac{r_1}{2}\;\Rightarrow\;\frac{Q_2}{Q_1}=\frac1{16}
La portata finale è un sedicesimo di quella iniziale. Qui il salto di pressione è mantenuto uguale: nel laboratorio scegli la stessa Δp per le due prove, dimezza il raggio, poi confronta le letture. Se invece una pompa imponesse la stessa portata, per quel raggio dimezzato servirebbe una caduta di pressione sedici volte maggiore. Identificare la grandezza controllata cambia la risposta. Le condotte fisiologiche possono pulsare e deformarsi; il sangue ha una reologia più complessa. Questa legge isola gli effetti delle variabili in un modello.""",
        (5, 7),
    )
    E(
        "Mezzo raggio, nuova portata",
        2,
        "Un tubo laminare porta 4,8 mL/s di liquido. Lo si sostituisce con un tubo di uguale lunghezza e metà raggio; viscosità e caduta di pressione sono invariate. Quanto vale la nuova portata?",
        r"""@C2-raggio|Confronta i due raggi. La figura rappresenta due prove a Δp uguale; non sono due tratti consecutivi dello stesso tubo.
Scrivi Poiseuille nei due stati. Il fattore πΔp/(8ηL) è comune e si elimina nel rapporto.
$\frac{Q_2}{Q_1}=\left(\frac{r_2}{r_1}\right)^4=\left(\frac12\right)^4=\frac{1\times1\times1\times1}{2\times2\times2\times2}=\frac1{16}
$Q_2=Q_1/16=4{,}8/16=0{,}30\,\mathrm{mL/s}
La portata diventa il 6,25% della precedente. Nel laboratorio dimezza il raggio lasciando invariati pressione, lunghezza e viscosità: verifica il rapporto fra le due portate ottenute.""",
    )
    E(
        "Da una misura alla viscosità",
        3,
        "In un tubo diritto di raggio 1,0 mm e lunghezza 20 cm scorrono 0,50 mL/s con caduta di pressione 1,0 kPa. Assumendo valide le condizioni di Poiseuille, stima la viscosità.",
        r"""La geometria è nota e viene misurato il rapporto fra Δp e Q. Converti tutti i dati prima di elevare il raggio alla quarta.
$r=10^{-3}\,\mathrm m,\quad L=0{,}20\,\mathrm m,\quad Q=5{,}0\times10^{-7}\,\mathrm{m^3/s},\quad\Delta p=10^3\,\mathrm{Pa}
$8\eta LQ=\pi r^4\Delta p\quad\Rightarrow\quad\eta=\frac{\pi(10^{-3})^4(10^3)}{8(0{,}20)(5{,}0\times10^{-7})}
$\eta=\frac{\pi\times10^{-9}}{8{,}0\times10^{-7}}\,\mathrm{Pa\,s}\simeq3{,}9\times10^{-3}\,\mathrm{Pa\,s}
L’unità si verifica: m⁴ Pa diviso per m·m³/s dà Pa·s. Una piccola incertezza sul raggio ha effetto amplificato su questa stima.""",
    )
    N(
        "La pompa mantiene la portata",
        "Una pompa fornisce portata costante. A parità di lunghezza e viscosità il raggio di un tubo di Poiseuille passa da 3 mm a 2 mm. Quanto vale Δp₂/Δp₁?",
        5.0625,
        "",
        0.006,
        (3 / 2) ** 4,
        "Ora è Q la grandezza bloccata, non il salto di pressione.",
        r"$\Delta p=8\eta LQ/(\pi r^4)\quad\Rightarrow\quad\Delta p_2/\Delta p_1=(3/2)^4=81/16\simeq5{,}06~La pompa deve compensare l’aumento di resistenza del tubo più stretto.",
        "modello|Scrivi quale variabile è fissata prima di confrontare le due prove.",
    )
    N(
        "Lunghezza e viscosità cambiano insieme",
        "Due prove hanno lo stesso raggio e la stessa Δp. Nella seconda la viscosità si dimezza e la lunghezza triplica. Se Q₁ = 9 mL/s, quanto vale Q₂?",
        6,
        "mL/s",
        0.02,
        9 / (0.5 * 3),
        "Nel denominatore figura il prodotto ηL.",
        r"$Q_2/Q_1=\eta_1L_1/(\eta_2L_2)=1/[(1/2)\cdot3]=2/3~$Q_2=9\cdot(2/3)=6\,\mathrm{mL/s}~La maggiore lunghezza prevale sulla minore viscosità.",
        "algebra|Combina i due cambiamenti come fattori, non come somme.",
    )
    M(
        "Scegliere la pendenza pertinente",
        "In un grafico con Δp sull’asse verticale e Q su quello orizzontale, un tubo di Poiseuille dà una retta per l’origine. Qual è la sua pendenza?",
        "La resistenza idraulica",
        "Il reciproco della resistenza|La portata|Il raggio alla quarta",
        "Scrivi l’equazione esplicita per l’asse verticale.",
        r"$\Delta p=R_h Q~A un dato incremento di portata corrisponde un incremento di pressione R_h volte maggiore. Invertendo gli assi si leggerebbe la conduttanza.",
        "testo|Controlla l’ordine degli assi.",
    )
    N(
        "Quanto raggio serve?",
        "A parità di Δp, viscosità e lunghezza, di quale fattore occorre moltiplicare il raggio per triplicare Q?",
        1.316,
        "",
        0.005,
        3**0.25,
        "Inverti una quarta potenza con una radice quarta.",
        r"$Q_2/Q_1=(r_2/r_1)^4=3\quad\Rightarrow\quad r_2/r_1=\sqrt[4]{3}\simeq1{,}316~Una crescita del raggio di circa il 32% triplica la portata nel modello.",
        "algebra|La radice quadrata va applicata due volte.",
    )
    M(
        "Diametro inserito al posto del raggio",
        "Un calcolo inserisce nella formula di Poiseuille il diametro d nel posto riservato a r. A parità degli altri dati, quale errore produce sulla Q prevista?",
        "La sovrastima di un fattore 16",
        "La sottostima di un fattore 16|La sovrastima di un fattore 2|Nessun errore",
        "Prima confronta d ed r, poi usa la potenza corretta.",
        r"$Q_{\rm err}/Q_{\rm corretta}=d^4/r^4=(2r)^4/r^4=16~Il valore quadruplicherebbe soltanto se la dipendenza fosse quadratica.",
        "testo|Identifica esplicitamente se il dato è il raggio o il diametro.",
    )
    N(
        "La caduta misurata",
        "Una prova fornisce R_h = 8,0 × 10⁸ Pa·s/m³ e Q = 2,5 mL/s. Quanto vale la caduta di pressione in kPa?",
        2,
        "kPa",
        0.01,
        8e8 * 2.5e-6 / 1e3,
        "Un millilitro vale 10⁻⁶ m³.",
        r"$\Delta p=R_hQ=(8{,}0\times10^8)(2{,}5\times10^{-6})=2000\,\mathrm{Pa}=2{,}0\,\mathrm{kPa}~Il segno è positivo nella convenzione pressione a monte meno pressione a valle.",
        "unità|Rendi coerenti il volume nella portata e quello nell’unità di resistenza.",
    )
    T(
        "Una proprietà che raddoppia la resistenza",
        "A geometria invariata, quale proprietà del liquido, espressa in Pa·s, raddoppia R_h quando raddoppia?",
        "viscosità",
        "viscosita|viscosità dinamica|viscosita dinamica",
        "Guarda il numeratore di R_h nella legge di Poiseuille.",
        "La resistenza è direttamente proporzionale alla viscosità dinamica η. A maggiore η serve un salto di pressione più grande per mantenere una data Q.",
        "concetto|La densità ha un’altra dimensione e un altro ruolo nel modello.",
    )
    M(
        "Tubetto corto appena dopo un raccordo",
        "Si vuole dedurre η applicando subito il profilo parabolico appena dopo un ingresso brusco. Quale condizione deve essere controllata in particolare?",
        "Che il profilo sia pienamente sviluppato nel tratto di misura",
        "Che la pressione atmosferica sia esattamente 100 kPa|Che il raggio e il diametro coincidano|Che il fluido sia fermo ovunque",
        "Un flusso entrante può modificare la forma del suo profilo lungo il tubo.",
        "Il profilo di ingresso deve assestarsi per diventare parabolico. Perdite concentrate e sviluppo del profilo possono falsare la relazione fra Δp e Q misurata sul breve tratto.",
        "modello|Distingui una regione d’ingresso dalla zona di flusso sviluppato.",
        3,
    )
    N(
        "Potenza fornita dal salto di pressione",
        "Un tubo orizzontale dissipativo trasporta 4,0 × 10⁻⁶ m³/s con caduta di 3,0 kPa fra sezioni uguali. Quanta potenza meccanica fornisce questa differenza di pressione?",
        0.012,
        "W",
        0.0001,
        4e-6 * 3000,
        "Il lavoro di pressione per un volume V è ΔpV.",
        r"$P=\Delta p Q=(3{,}0\times10^3)(4{,}0\times10^{-6})=1{,}2\times10^{-2}\,\mathrm W~Le unità sono Pa·m³/s = N·m/s = W. In assenza di variazioni di quota e velocità la potenza compensa le dissipazioni.",
        "modello|Collega il lavoro per volume alla quantità di volume che passa ogni secondo.",
        3,
    )
    M(
        "Pressioni ai due estremi uguali",
        "Un tubo orizzontale passivo contiene un liquido newtoniano in condizioni di Poiseuille. Se la pressione statica è identica ai due estremi, che cosa prevede il modello stazionario?",
        "Portata nulla",
        "Portata infinita|Portata proporzionale alla pressione assoluta|Flusso periodico obbligatorio",
        "Individua la grandezza che alimenta il flusso.",
        "Con Δp = 0 manca il lavoro di pressione che sostiene lo scorrimento contro la viscosità. Per resistenza finita e positiva si ha Q = Δp/R_h = 0.",
        "concetto|Compare una differenza di pressione, non il suo valore assoluto.",
    )
    L(
        "Decidere come sono collegati i condotti",
        "Fluidi in movimento",
        "Resistenze idrauliche in serie e in parallelo|Portata nei rami|Resistenze e pressioni nei sistemi biologici",
        r"""Due strozzature una dopo l’altra e due rami alternativi non producono lo stesso effetto sulla portata complessiva. Rappresenta ogni tratto laminare con la sua resistenza idraulica R = Δp/Q. Per collegare le resistenze, individua prima i nodi, cioè le giunzioni che idealizziamo alla stessa pressione. Le relazioni semplici qui valgono per flussi stazionari incomprimibili e resistenze lineari.
@C2-reti|Nella riga alta ogni porzione di fluido deve attraversare entrambi i tratti. Nella riga bassa i due tratti collegano la stessa coppia di nodi.
In serie la portata è comune. Le cadute di pressione si sommano perché, passando da un estremo all’altro, la pressione al nodo intermedio si cancella. In parallelo la caduta di pressione è comune a ciascun ramo; sono le portate che si sommano al nodo.
$R_{\rm serie}=R_1+R_2,\qquad \frac{1}{R_{\rm parallelo}}=\frac{1}{R_1}+\frac{1}{R_2}
$R_{\rm parallelo}=\frac{R_1R_2}{R_1+R_2}\quad\text{per due rami}
Un nuovo ramo parallelo offre un altro passaggio e riduce la resistenza equivalente sotto quella del ramo meno resistente. In serie ogni tratto aggiunge una caduta e la resistenza totale supera ciascun contributo. In una rete biologica idealizzata puoi confrontare distribuzioni di flusso a parità di pressioni ai nodi. Le pareti elastiche, la regolazione fisiologica e le condizioni pulsanti modificano i parametri reali. Per controllare un calcolo, prova a chiudere mentalmente un ramo mettendo la sua resistenza molto grande.""",
        (5, 8),
    )
    E(
        "La pressione al raccordo",
        2,
        "Due resistenze idrauliche in serie valgono 2 e 4 kPa·s/mL. Il punto di ingresso è a 22 kPa e l’uscita a 4 kPa con lo stesso riferimento. Quali sono portata e pressione al nodo intermedio?",
        r"""@C2-reti|Segui la riga superiore dall’ingresso verso l’uscita: la prima resistenza è quella da 2 kPa·s/mL.
La caduta disponibile è 18 kPa; entrambi i tratti ricevono la stessa portata. Le unità fornite sono coerenti per ottenere Q in mL/s.
$R_{\rm eq}=2+4=6\,\mathrm{kPa\,s/mL},\qquad Q=(22-4)/6=3\,\mathrm{mL/s}
$\Delta p_1=R_1Q=2\cdot3=6\,\mathrm{kPa},\qquad p_{\rm nodo}=22-6=16\,\mathrm{kPa}
Il secondo tratto perde 4 × 3 = 12 kPa e porta proprio da 16 a 4 kPa. La pressione al nodo è intermedia fra le pressioni terminali.""",
    )
    E(
        "Dividere il flusso in due",
        2,
        "Due tratti in parallelo hanno R₁ = 3 e R₂ = 6 kPa·s/mL. Ai nodi si impone Δp = 12 kPa. Trova le due portate, la totale e la resistenza equivalente.",
        r"""@C2-reti|Usa la riga inferiore: ciascun ramo collega il nodo di ingresso all’unico nodo di uscita.
$Q_1=\Delta p/R_1=12/3=4\,\mathrm{mL/s},\qquad Q_2=12/6=2\,\mathrm{mL/s}
Il ramo più resistente trasporta metà della portata del primo. Al nodo serve la somma delle portate uscenti.
$Q_{\rm tot}=4+2=6\,\mathrm{mL/s},\quad R_{\rm eq}=12/6=2\,\mathrm{kPa\,s/mL}
Il valore 2 è inferiore a entrambe le singole resistenze. Con un secondo passaggio aperto il circuito offre globalmente meno resistenza.""",
    )
    N(
        "Tre tubi in fila",
        "Tre segmenti laminari consecutivi senza diramazioni hanno resistenze 2, 5 e 1 kPa·s/mL. Con una portata di 1,5 mL/s, quale caduta totale si misura?",
        12,
        "kPa",
        0.02,
        (2 + 5 + 1) * 1.5,
        "Lo stesso flusso attraversa i tre tratti.",
        r"$R_{\rm eq}=2+5+1=8\,\mathrm{kPa\,s/mL}~$\Delta p=R_{\rm eq}Q=8\cdot1{,}5=12\,\mathrm{kPa}~Ogni tratto consuma una parte della caduta totale.",
        "modello|Verifica se il flusso si divide o attraversa tutti i tratti.",
    )
    N(
        "Quattro rami identici",
        "Quattro rami identici in parallelo hanno ciascuno resistenza 20 kPa·s/mL. Qual è la resistenza equivalente?",
        5,
        "kPa·s/mL",
        0.01,
        20 / 4,
        "Ogni ramo trasporta la stessa Q_b alla medesima Δp.",
        r"$Q_{\rm tot}=4\Delta p/R\quad\Rightarrow\quad R_{\rm eq}=\Delta p/Q_{\rm tot}=R/4=5\,\mathrm{kPa\,s/mL}~Le quattro vie moltiplicano la conduttanza per quattro.",
        "algebra|Sono i reciproci delle resistenze che si sommano in parallelo.",
    )
    M(
        "Un ramo si chiude a Δp fissata",
        "Due rami indipendenti in parallelo sono fra nodi mantenuti a differenza di pressione costante. Chiudendone uno, che cosa accade alla portata del ramo rimasto aperto, se la sua resistenza resta costante?",
        "Resta uguale",
        "Raddoppia sempre|Diventa zero|Si dimezza sempre",
        "Il ramo aperto vede ancora la stessa differenza fra i suoi estremi.",
        r"$Q_{\rm aperto}=\Delta p/R_{\rm aperto}~Né il numeratore né il denominatore cambiano. Diminuisce invece la portata totale erogata ai due rami.",
        "modello|Identifica se è fissata la portata totale o la differenza di pressione.",
    )
    N(
        "Il caso a portata imposta",
        "Due rami identici in parallelo trasportano complessivamente 8 mL/s. Si chiude un ramo e la pompa mantiene la portata totale di 8 mL/s. Di quale fattore cambia il salto di pressione?",
        2,
        "",
        0.005,
        8 / (8 / 2),
        "Prima della chiusura ciascun ramo portava metà della totale.",
        r"$Q_{b,i}=8/2=4\,\mathrm{mL/s},\quad Q_{b,f}=8\,\mathrm{mL/s}~$\Delta p_f/\Delta p_i=RQ_{b,f}/(RQ_{b,i})=8/4=2~Lo stesso ramo deve ora sopportare il doppio del flusso.",
        "modello|La pompa impone Q totale anche dopo la chiusura.",
    )
    N(
        "Una rete mista",
        "Un tratto da 2 kPa·s/mL è in serie con due rami paralleli ciascuno da 6 kPa·s/mL. Con 20 kPa fra gli estremi, quale portata attraversa il tratto iniziale?",
        4,
        "mL/s",
        0.01,
        20 / (2 + 1 / (1 / 6 + 1 / 6)),
        "Riduci prima la coppia di rami fra gli stessi due nodi.",
        r"$R_{\rm par}=6/2=3,\quad R_{\rm tot}=2+3=5\,\mathrm{kPa\,s/mL}~$Q=20/5=4\,\mathrm{mL/s}~Prima della biforcazione passa tutta la portata, poi 2 mL/s in ciascun ramo uguale.",
        "modello|La parte comune è in serie con il blocco parallelo.",
        3,
    )
    M(
        "Diagrammi con la stessa coppia di nodi",
        "Due condotti appaiono consecutivi nel disegno ma ciascuno parte dal nodo A e arriva al nodo B. Come sono collegati?",
        "In parallelo",
        "In serie|In serie solo se hanno uguale raggio|Sono necessariamente separati",
        "Segna la coppia di pressioni terminali di ciascun tratto.",
        "Entrambi i condotti vedono p_A − p_B e offrono percorsi alternativi. La topologia dei collegamenti determina il parallelo anche se la forma grafica è ingannevole.",
        "testo|Identifica i nodi reali, non la disposizione sulla pagina.",
    )
    N(
        "Il ramo incognito",
        "Due rami paralleli hanno resistenza equivalente 3 kPa·s/mL. Il primo ha resistenza 4 kPa·s/mL. Trova quella del secondo.",
        12,
        "kPa·s/mL",
        0.02,
        1 / (1 / 3 - 1 / 4),
        "Sottrai le conduttanze, poi torna alla resistenza.",
        r"$1/R_2=1/3-1/4=(4-3)/12=1/12\quad\Rightarrow\quad R_2=12\,\mathrm{kPa\,s/mL}~Il risultato supera la resistenza equivalente, come deve fare un ramo passivo del parallelo.",
        "algebra|Dopo aver sottratto i reciproci, inverti il risultato.",
        3,
    )
    T(
        "Il reciproco della resistenza",
        "Quale nome ha la grandezza idraulica G = Q/Δp, additiva per rami in parallelo?",
        "conduttanza",
        "conduttanza idraulica",
        "Una via più facile per il flusso ha un valore di G maggiore.",
        "La conduttanza misura la portata per salto di pressione. Nel parallelo le portate si sommano con Δp comune, quindi anche le conduttanze si sommano.",
        "concetto|Distingui la facilità di flusso dall’opposizione al flusso.",
    )
    M(
        "Due tratti diversi in serie",
        "In due segmenti in serie uno ha il doppio della resistenza dell’altro. In stato stazionario, quale ha maggiore caduta di pressione?",
        "Il più resistente, con caduta doppia",
        "Il meno resistente, con caduta doppia|Entrambi hanno caduta uguale|Il tratto a valle qualunque sia la resistenza",
        "In serie è comune la portata.",
        r"$\Delta p_i=R_iQ~Con Q uguale, il rapporto delle cadute è quello delle resistenze. Raddoppiare R raddoppia la frazione di pressione persa sul tratto.",
        "modello|La stessa differenza di pressione caratterizza il parallelo.",
    )
    N(
        "Due rami di raggio diverso",
        "Due rami circolari di uguale lunghezza e viscosità sono in parallelo. I raggi sono r e 2r e si applica Poiseuille. Quale frazione della portata totale transita nel ramo stretto?",
        0.05882,
        "",
        0.0005,
        1 / (1 + 2**4),
        "La stessa Δp dà portate proporzionali alla quarta potenza dei raggi.",
        r"$Q_{\rm largo}=2^4Q_{\rm stretto}=16Q_{\rm stretto}~$Q_{\rm stretto}/Q_{\rm tot}=1/(1+16)=1/17\simeq0{,}0588~Quasi il 6% della portata transita sul ramo stretto.",
        "algebra|Il denominatore comprende le portate di entrambi i rami.",
        3,
    )
    L(
        "Una superficie che costa energia",
        "Interfacce e capillarità",
        "Tensione superficiale|Piccole quantità di liquido|Bagnabilità e capillarità|Interfacce piane e curve|Legge di Laplace e pressione di curvatura",
        r"""Piccole gocce libere tendono alla forma sferica. Creare superficie richiede energia: in condizioni assegnate la tensione superficiale γ è l’energia richiesta per unità di nuova area. Si può anche misurare come forza tangente all’interfaccia per unità di lunghezza lungo un bordo. Le unità J/m² e N/m coincidono. A volume fissato la sfera ha la superficie più piccola; per gocce grandi gravità e appoggi possono modificare sensibilmente la forma.
$\Delta E=\gamma\Delta A,\qquad F=\gamma\ell\quad\text{per una sola superficie}
Un film di sapone teso su un telaio possiede due interfacce aria–liquido. Se entrambe tirano lo stesso bordo, il contributo si raddoppia. Conta le superfici fisiche e misura la lunghezza effettiva del contatto.
@C2-capillare|Nel capillare bagnante il liquido sale. Il dislivello verticale si misura rispetto alla superficie esterna, trascurando le piccole correzioni per il menisco.
All’orlo di un capillare la componente verticale della forza di tensione superficiale bilancia il peso della colonna sollevata. L’angolo di contatto θ si misura attraverso il liquido fra interfaccia e parete. Per un tubo circolare sottile, atmosfera uguale sui due lati e densità del gas trascurabile, la risalita di equilibrio è inversamente proporzionale al raggio.
$2\pi r\gamma\cos\theta=\rho g\pi r^2 h\quad\Rightarrow\quad h=\frac{2\gamma\cos\theta}{\rho gr}
Con θ inferiore a 90° il coseno è positivo e il livello sale; con θ superiore a 90° si ha depressione. La legge di Laplace collega la curvatura di un’interfaccia a una differenza di pressione. Per una goccia sferica di raggio R, con un’interfaccia, p interna − p esterna = 2γ/R. Un’interfaccia piana ha curvatura nulla; a parità di γ una goccia più piccola richiede sovrapressione maggiore. Per una bolla di sapone a film sottile in aria ci sono due interfacce e la sovrapressione è circa 4γ/R. Queste forme quantitative illustrano il significato qualitativo richiesto dal syllabus.""",
        (1, 2, 4),
    )
    E(
        "Risale davvero di qualche centimetro?",
        2,
        "Un tubo capillare di raggio 0,50 mm contiene acqua con γ = 0,072 N/m e ρ = 1000 kg/m³. Assumi bagnamento completo (θ = 0°), g = 10 m/s². Qual è la risalita?",
        r"""@C2-capillare|La forza capillare agisce sul bordo circolare interno del tubo. Il peso da sostenere è quello della colonna al di sopra del livello esterno.
Il perimetro che tira vale 2πr. Il volume della colonna è πr²h. Eguaglia le forze verticali con cos 0° = 1.
$2\pi r\gamma=\rho g\pi r^2h\quad\Rightarrow\quad h=2\gamma/(\rho g r)
$r=5{,}0\times10^{-4}\,\mathrm m,\quad h=0{,}144/[1000\cdot10\cdot(5{,}0\times10^{-4})]=0{,}0288\,\mathrm m
La risalita vale circa 2,9 cm. Se il tubo fosse due volte più largo, il bilancio darebbe una risalita dimezzata.""",
    )
    E(
        "Una goccia e un film sferico",
        2,
        "Una goccia liquida e una bolla di sapone in aria hanno entrambe raggio 2,0 mm. Assumi in ciascun caso γ = 0,030 N/m e film della bolla molto sottile. Confronta le sovrapressioni.",
        r"""Per la goccia c’è una sola interfaccia curva fra interno ed esterno. Per la bolla di sapone ci sono due interfacce di raggio pressoché uguale. In entrambi i casi la pressione è maggiore all’interno.
$R=2{,}0\times10^{-3}\,\mathrm m,\qquad\Delta p_{\rm goccia}=2\gamma/R=0{,}060/0{,}0020=30\,\mathrm{Pa}
$\Delta p_{\rm film}\simeq4\gamma/R=0{,}120/0{,}0020=60\,\mathrm{Pa}
La bolla a film sottile necessita del doppio della sovrapressione per sostenere due interfacce. Una bolla di gas dentro un liquido ha invece una sola interfaccia e si usa il fattore 2.""",
    )
    M(
        "Forma di una piccola goccia libera",
        "Perché una piccola goccia libera tende a essere sferica quando la gravità incide poco?",
        "A volume fissato la sfera minimizza l’area",
        "La sfera ha il volume più piccolo a massa fissata|La gravità agisce solo sul bordo|La densità della sfera è nulla",
        "Creare area costa energia.",
        "A parità di volume la sfera ha l’area minore. Una tensione superficiale positiva favorisce quindi quella configurazione quando forze esterne e vincoli hanno effetto trascurabile.",
        "concetto|Confronta forme a parità di volume.",
    )
    N(
        "Energia per creare superficie",
        "A temperatura fissata si crea lentamente 3,0 cm² di nuova singola interfaccia di tensione 0,050 N/m. Quanta energia superficiale occorre in microjoule?",
        15,
        "µJ",
        0.05,
        0.05 * 3e-4 * 1e6,
        "Converti l’area in m² e il risultato da J a µJ.",
        r"$\Delta A=3{,}0\times10^{-4}\,\mathrm{m^2},\qquad \Delta E=0{,}050(3{,}0\times10^{-4})=1{,}5\times10^{-5}\,\mathrm J=15\,\mu\mathrm J~Il dato di area descrive già l’unica interfaccia creata.",
        "unità|Un microjoule è 10⁻⁶ joule.",
    )
    N(
        "Un bordo mobile sul telaio",
        "Un film di sapone ha due facce, entrambe di tensione superficiale 0,025 N/m. Le due facce tirano perpendicolarmente un bordo lungo 4 cm. Con quale forza totale?",
        0.002,
        "N",
        0.00002,
        2 * 0.025 * 0.04,
        "Calcola la forza di una faccia e conta le interfacce.",
        r"$F=2\gamma\ell=2(0{,}025)(0{,}040)=2{,}0\times10^{-3}\,\mathrm N~Le due superfici tirano il bordo nello stesso verso, quindi i contributi si sommano.",
        "modello|Un film sospeso presenta una superficie per lato.",
    )
    M(
        "Menisco non bagnante",
        "Un liquido in un capillare verticale ha angolo di contatto 120° misurato attraverso il liquido. Come si dispone il livello interno rispetto a quello esterno?",
        "Più in basso",
        "Più in alto|Sempre alla stessa quota|Oscilla indefinitamente",
        "Valuta il segno del coseno dell’angolo.",
        r"$h=2\gamma\cos\theta/(\rho gr),\qquad\cos120^\circ=-1/2~Con h misurata verso l’alto si ottiene h negativa. Si forma una depressione capillare.",
        "concetto|Collega il segno della quota alla direzione della componente verticale della tensione.",
    )
    N(
        "Due raggi e due gocce",
        "Due gocce della stessa sostanza sono sferiche e hanno raggi 1 mm e 4 mm. Se la goccia grande presenta sovrapressione 30 Pa, quanto vale quella piccola?",
        120,
        "Pa",
        0.1,
        30 * 4 / 1,
        "Con una sola interfaccia la sovrapressione varia come 1/R.",
        r"$\Delta p_{\rm piccola}/\Delta p_{\rm grande}=R_{\rm grande}/R_{\rm piccola}=4/1~$\Delta p_{\rm piccola}=4\cdot30=120\,\mathrm{Pa}~La curvatura maggiore richiede una differenza di pressione maggiore.",
        "algebra|Nei rapporti di pressione si inverte il rapporto dei raggi.",
    )
    M(
        "Capillari di materiali diversi",
        "Due tubi di ugual raggio contengono lo stesso liquido. Uno ha θ = 0°, l’altro θ = 60°. Come si confrontano le risalite positive?",
        "Nel secondo la risalita è metà di quella nel primo",
        "Sono uguali perché i raggi coincidono|Nel secondo è doppia|Nel secondo il livello è depresso",
        "Confronta le componenti verticali della tensione.",
        r"$h_2/h_1=\cos60^\circ/\cos0^\circ=1/2~La bagnabilità cambia la componente verticale della forza sul bordo anche se r, ρ e γ sono gli stessi.",
        "modello|La geometria del tubo non fissa l’angolo di contatto.",
    )
    T(
        "Una superficie senza curvatura",
        "Nella legge di Laplace un’interfaccia ideale piana, in assenza di altre sollecitazioni interfaciali, ha differenza di pressione di curvatura …",
        "nulla",
        "zero|pari a zero|0",
        "Pensa al limite di un raggio di curvatura molto grande.",
        "Su una superficie piana entrambe le curvature sono nulle. La tensione superficiale può essere non nulla, ma il suo contributo al salto di pressione per curvatura si annulla.",
        "concetto|Il valore di γ e il valore della curvatura sono informazioni distinte.",
    )
    N(
        "Risalita dopo cambio di liquido",
        "In un capillare a bagnamento completo un liquido sale di 20 mm. Un secondo liquido, con stessa densità e angolo ma tensione superficiale pari al 70% della prima, quanto sale?",
        14,
        "mm",
        0.05,
        20 * 0.70,
        "Esplicita le grandezze che rimangono uguali nei due esperimenti.",
        r"$h_2/h_1=\gamma_2/\gamma_1=0{,}70\quad\Rightarrow\quad h_2=0{,}70\cdot20=14\,\mathrm{mm}~Una più piccola forza sul bordo sostiene una colonna meno alta.",
        "modello|A raggio, densità e angolo fissati, la risalita è proporzionale a γ.",
    )
    N(
        "Coalescenza di otto gocce",
        "Otto gocce sferiche identiche di raggio r si fondono senza perdita di liquido in una sola goccia sferica. Quanto vale il rapporto fra area finale e area iniziale complessiva?",
        0.50,
        "",
        0.002,
        (8 ** (1 / 3)) ** 2 / 8,
        "Ricava il nuovo raggio dalla conservazione del volume.",
        r"$R^3=8r^3\;\Rightarrow\;R=2r~$A_f/A_i=4\pi(2r)^2/[8(4\pi r^2)]=4/8=1/2~La superficie totale si dimezza; a γ fissata diminuisce l’energia superficiale.",
        "modello|Conserva il volume prima di confrontare le aree.",
        3,
    )
    M(
        "Una bolla di gas nel liquido",
        "Una bolla sferica di gas si trova all’interno di un liquido. Quale ragionamento individua il fattore nella formula per la sovrapressione capillare?",
        "C’è una sola interfaccia gas–liquido, quindi 2γ/R",
        "Ci sono per forza due interfacce, quindi 4γ/R|Non esiste curvatura intorno a un gas|Il fattore cambia con l’atmosfera esterna",
        "Conta gli attraversamenti di superficie dal centro al liquido circostante.",
        "Dal gas interno si passa direttamente al liquido attraversando una sola superficie. Il fattore 4 richiederebbe un film con due interfacce, come in una bolla di sapone in aria.",
        "concetto|Fai un piccolo disegno delle fasi incontrate attraversando il bordo.",
    )
