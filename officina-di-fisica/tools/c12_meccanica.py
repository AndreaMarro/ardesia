"""Unità ministeriali 1 e 2. Testi e famiglie di esercizi C1."""

from math import sqrt, pi, cos, radians


def build(c):
    L, E, N, M, T = c.lesson, c.example, c.num, c.choice, c.word
    L(
        "Dare una misura alle cose",
        "Misura e rappresentazione",
        "Notazione scientifica|Grandezze fisiche, dimensioni e SI|Conversioni tra unità|Stima di ordine di grandezza|Grandezze intensive ed estensive|Scalari e vettori",
        r"""
In laboratorio due persone descrivono lo stesso spessore come 0,003 m e 3 mm. Il numero cambia perché cambia il campione scelto come unità. La grandezza resta una lunghezza. Prima di sommare due misure, chiediti quale proprietà stanno misurando e riportale alla stessa unità.
Nel Sistema Internazionale lunghezza, massa e tempo si misurano in metri, chilogrammi e secondi. Si aggiungono ampere, kelvin, mole e candela. Una grandezza derivata combina grandezze di base. La densità di un campione è la massa distribuita per unità di volume.
$\rho=\frac{m}{V},\qquad [\rho]=M L^{-3},\qquad 1\,\mathrm{kg/m^3}=1\,\mathrm{kg}\,\mathrm{m}^{-3}
La dimensione descrive il tipo di grandezza e resta la stessa passando da g/cm³ a kg/m³. Scrivi ogni conversione come un rapporto che vale uno. Per un’area il rapporto delle lunghezze entra due volte, per un volume tre.
@C1-scala|Conta le celle lungo i due lati. Ogni cella rossa o bianca ha area 1 mm².
$1\,\mathrm{cm}^3=(10^{-2}\,\mathrm m)^3=10^{-6}\,\mathrm m^3
La notazione scientifica separa le cifre significative dalla scala: scrivi un coefficiente tra 1 incluso e 10 escluso, seguito da una potenza di dieci. Per stimare basta spesso confrontare gli esponenti. Se si richiede la potenza di dieci più vicina in scala logaritmica, si arrotonda all’esponente successivo a partire dal coefficiente √10. Dichiara la convenzione quando conta.
Dividi in due parti uguali un liquido uniforme senza modificarne lo stato. Massa e volume si dimezzano e sono grandezze estensive. La densità resta uguale ed è intensiva. Uno scalare è definito da valore e unità. Per lo spostamento servono anche direzione e verso. Per recuperare una conversione dubbia, disegna il cubo di lato 1 cm e riscrivi separatamente i tre fattori.
""",
    )
    E(
        "Quanta massa entra nel campione?",
        1,
        "Una provetta contiene 8,0 mL di liquido uniforme con densità 1,05 g/cm³. Determina la massa in kg.",
        r"""Cerchiamo la massa del contenuto. Un millilitro occupa un centimetro cubo, così possiamo usare i dati nelle unità iniziali e convertire una sola volta alla fine.
$V=8{,}0\,\mathrm{cm}^3,\qquad \rho=\frac{m}{V}\;\Rightarrow\;m=\rho V
Moltiplicando entrambi i membri per V, l’unità di volume passa al numeratore e si semplifica.
$m=(1{,}05\,\mathrm{g/cm}^3)(8{,}0\,\mathrm{cm}^3)=8{,}4\,\mathrm g
$m=8{,}4\,\mathrm g\,\frac{1\,\mathrm{kg}}{1000\,\mathrm g}=8{,}4\times10^{-3}\,\mathrm{kg}
La densità è poco superiore a quella dell’acqua. Una massa poco superiore a 8 g per 8 mL è coerente.""",
    )
    E(
        "Dalla griglia al foglio di misura",
        2,
        "Una griglia rettangolare è lunga 25 mm e larga 12 mm. Ricava l’area in m² e stimane la scala.",
        r"""L’area del rettangolo è il prodotto di due lunghezze perpendicolari. Entrambe devono concorrere alla conversione.
@C1-scala|Nel quadrato di riferimento ogni fila contiene dieci millimetri quadrati. Lo stesso principio vale per passare dai millimetri ai metri.
$A=ab=(25)(12)\,\mathrm{mm}^2=300\,\mathrm{mm}^2
$1\,\mathrm{mm}^2=(10^{-3}\,\mathrm m)^2=10^{-6}\,\mathrm m^2
$A=300\times10^{-6}\,\mathrm m^2=3{,}0\times10^{-4}\,\mathrm m^2
Un quadrato di lato 2 cm avrebbe area 4 cm². Il risultato, pari a 3 cm², ha una scala plausibile.""",
    )
    N(
        "Un volume sulla scala SI",
        "Una micropipetta contiene 250 µL. Quale volume occupa in mm³?",
        250,
        "mm³",
        0.1,
        250 * 1e-6 * 1e6,
        "Passa prima dai litri ai centimetri cubi.",
        r"Un litro contiene 1000 cm³ e ogni cm³ contiene 1000 mm³.~$1\,\mu\mathrm L=10^{-6}\,\mathrm L=10^{-6}\times10^6\,\mathrm{mm}^3=1\,\mathrm{mm}^3~Pertanto 250 µL occupano 250 mm³.",
        "unità|Ricostruisci il fattore complessivo a partire dal litro.",
    )
    M(
        "Due quantità sommabili",
        "Quale coppia può comparire in una somma di energie?",
        "Lavoro e prodotto forza × lunghezza",
        "Forza e lavoro|Massa e velocità|Potenza e accelerazione",
        "Scomponi il joule nelle sue unità di base.",
        r"Il lavoro è una forza moltiplicata per uno spostamento lungo la forza. Entrambi i termini della prima coppia hanno unità N·m, cioè J. Una somma fisica richiede grandezze omogenee.",
        "unità|Per ogni addendo scrivi le dimensioni prima di sommare.",
    )
    T(
        "Il campione si divide",
        "Dividendo a metà un campione omogeneo, la massa si dimezza. Come si chiama una grandezza additiva di questo tipo?",
        "estensiva",
        "grandezza estensiva",
        "Considera che cosa accade riunendo le due metà.",
        "Le masse delle parti sommate ricostruiscono la massa totale. Questa dipendenza dalla quantità di materia caratterizza una grandezza estensiva.",
        "concetto|Confronta la massa delle due metà e quella del campione intero.",
    )
    N(
        "Due misure, un rapporto",
        "Un tratto lungo 4,0 cm viene osservato insieme a una tacca lunga 80 µm. Quante tacche coprono il tratto?",
        500,
        "",
        0.1,
        0.04 / (80e-6),
        "Esprimi entrambe le lunghezze in micrometri.",
        r"$4{,}0\,\mathrm{cm}=4{,}0\times10^4\,\mu\mathrm m~Il numero di tacche è lunghezza totale divisa per lunghezza di una tacca.~$n=40000/80=500~Le unità si cancellano perché si stanno contando intervalli.",
        "unità|Un centimetro comprende diecimila micrometri.",
    )
    M(
        "Una stima in scala logaritmica",
        "Si definisce ordine di grandezza la potenza di dieci più vicina in scala logaritmica. Qual è quella di 7,0 × 10⁻⁵ m?",
        "10⁻⁴ m",
        "10⁻⁵ m|10⁻⁶ m|10⁵ m",
        "La soglia fra potenze adiacenti è il loro punto medio geometrico.",
        r"Il coefficiente 7 supera √10. La distanza moltiplicativa da 10⁻⁴ è 10/7, mentre da 10⁻⁵ è 7. Vince la potenza di esponente −4.",
        "calcolo|Confronta i fattori moltiplicativi dalle due potenze adiacenti.",
    )
    T(
        "Il dato direzionale",
        "Una scheda riporta uno spostamento di 4 m verso nord. Quale parola classifica questa grandezza rispetto a uno scalare?",
        "vettoriale",
        "vettore|grandezza vettoriale",
        "Invertire nord e sud cambierebbe il dato?",
        "Con la stessa lunghezza si possono raggiungere punti diversi a seconda della direzione e del verso. Lo spostamento richiede un vettore.",
        "concetto|Immagina due spostamenti uguali orientati in versi opposti.",
    )
    N(
        "La bilancia con la tara",
        "Una fiala piena pesa sulla bilancia 54,6 g. La fiala vuota segna 0,0420 kg. Calcola la massa del contenuto in g.",
        12.6,
        "g",
        0.02,
        54.6 - 0.042 * 1e3,
        "La tara va sottratta usando la stessa unità.",
        r"$m_{\mathrm{tara}}=0{,}0420\times1000\,\mathrm g=42{,}0\,\mathrm g~$m_{\mathrm{liquido}}=54{,}6-42{,}0=12{,}6\,\mathrm g~Il contenuto contribuisce positivamente alla lettura della fiala piena.",
        "testo|Distingui la lettura totale dal solo contenuto.",
    )
    M(
        "Dimensione del coefficiente",
        "Nel modello x = k t², x misura una lunghezza e t un tempo. Quale unità SI deve avere k?",
        "m/s²",
        "m·s²|s²/m|m/s",
        "Isola k dividendo per il fattore che lo moltiplica.",
        r"$k=x/t^2\quad\Rightarrow\quad [k]=L/T^2~Inserendo metri e secondi, k si misura in m/s². Il controllo dimensionale è indipendente dal valore di k.",
        "algebra|Isola il coefficiente prima di trattarne le unità.",
    )
    N(
        "Velocità annotata in reparto",
        "Un carrello di servizio percorre il corridoio a 1,25 m/s. Esprimi il valore in km/h.",
        4.5,
        "km/h",
        0.01,
        1.25 * 3600 / 1000,
        "In un’ora trascorrono 3600 secondi.",
        r"$1{,}25\,\frac{\mathrm m}{\mathrm s}\,\frac{1\,\mathrm{km}}{1000\,\mathrm m}\,\frac{3600\,\mathrm s}{1\,\mathrm h}=4{,}50\,\mathrm{km/h}~In un’ora si coprono 4500 m; il risultato in chilometri è coerente.",
        "unità|Tratta indipendentemente il numeratore e il denominatore.",
    )
    M(
        "Controllare una pesata media",
        "Due porzioni dello stesso liquido hanno massa diversa e la stessa temperatura. Quale previsione vale per la densità, alla stessa pressione?",
        "È la stessa nelle due porzioni",
        "Nella porzione più grande è doppia|È proporzionale alla massa|Si annulla dimezzando il volume",
        "Considera il rapporto fra massa e volume del materiale uniforme.",
        "Massa e volume crescono insieme. Il loro rapporto resta uguale nelle due porzioni della stessa sostanza uniforme, allo stesso stato. La densità è intensiva.",
        "concetto|Ricostruisci il rapporto m/V dopo aver unito due porzioni.",
        1,
    )
    L(
        "Costruire e proiettare un vettore",
        "Misura e rappresentazione",
        "Funzioni trigonometriche elementari|Definizione, componenti e modulo dei vettori|Somma e differenza|Prodotto scalare e vettoriale",
        r"""
Un tragitto obliquo può essere descritto dando due spostamenti lungo assi perpendicolari. Fissa il verso positivo di ciascun asse. L’angolo θ va misurato dall’asse x positivo verso y positivo. Le proiezioni di un vettore sul prolungamento negativo di un asse hanno segno meno.
@C1-vettore|Le linee tratteggiate conducono la punta del vettore ai due assi. L’arco mostra da quale asse misurare l’angolo.
$A_x=A\cos\theta,\qquad A_y=A\sin\theta,\qquad A=\sqrt{A_x^2+A_y^2}
Nel triangolo rettangolo il coseno è cateto adiacente su ipotenusa, il seno è cateto opposto su ipotenusa e la tangente è il rapporto tra i cateti. Per ricostruire un angolo dal rapporto, usa anche i segni delle componenti: quadranti opposti hanno la stessa tangente.
Per sommare due vettori porta l’origine della seconda freccia sulla punta della prima, mantenendone orientamento e lunghezza. Il risultato va dall’origine iniziale alla punta finale. In coordinate questo equivale a sommare separatamente le componenti. La differenza si costruisce sommando il vettore opposto.
$\vec R=\vec A+\vec B,\qquad R_x=A_x+B_x,\quad R_y=A_y+B_y
Il prodotto scalare misura quanto un vettore è allineato all’altro. Entra nel lavoro di una forza. Il prodotto vettoriale ha modulo pari all’area del parallelogramma costruito sui due vettori e punta perpendicolarmente al loro piano, nel verso dato dalla mano destra. Entra nel momento di una forza.
$\vec A\cdot\vec B=AB\cos\alpha,\qquad |\vec A\times\vec B|=AB\sin\alpha
Qui α è l’angolo fra i vettori con le code coincidenti. Se confondi seno e coseno, verifica il caso dei due vettori paralleli: la loro proiezione è massima e il parallelogramma ha area nulla.
""",
        (1,),
    )
    E(
        "Un tragitto attraverso due corsie",
        1,
        "Una persona cammina per 30 m a est e poi per 40 m a nord. Calcola modulo e direzione dello spostamento.",
        r"""Prendi est come asse x e nord come asse y. Le due percorrenze sono le componenti ortogonali del vettore che collega partenza e arrivo.
@C1-vettore|Il triangolo indica la costruzione delle componenti. L’angolo richiesto si misura da est verso nord; il disegno è schematico.
$R_x=30\,\mathrm m,\quad R_y=40\,\mathrm m,\quad R=\sqrt{30^2+40^2}\,\mathrm m=50\,\mathrm m
$\tan\theta=R_y/R_x=40/30,\quad \theta=\arctan(4/3)\simeq53{,}1^\circ
Le componenti sono positive, quindi la direzione è 53,1° a nord dell’est. La distanza camminata è 70 m; il segmento fra gli estremi è più corto.""",
    )
    E(
        "Tirare in diagonale",
        2,
        "Un dinamometro indica 20 N lungo una fune inclinata di 30° sopra l’orizzontale. Ricava le componenti della trazione su un oggetto tirato verso destra.",
        r"""Fissa x verso destra e y verso l’alto. Entrambe le componenti devono essere positive. Il dato di 30° si riferisce alla direzione orizzontale.
@C1-vettore|La componente adiacente all’angolo è orizzontale. Le linee guida non rappresentano altre forze.
$F_x=F\cos30^\circ=20(\sqrt3/2)\,\mathrm N\simeq17{,}3\,\mathrm N
$F_y=F\sin30^\circ=20(1/2)\,\mathrm N=10\,\mathrm N
Il vettore è più vicino all’orizzontale che alla verticale e la componente orizzontale risulta maggiore. Ricomponendole, √(300 + 100) N restituisce 20 N.""",
    )
    N(
        "La proiezione all’indietro",
        "Una forza di 12 N forma 120° con x positivo. Quanto vale la componente x con il suo segno?",
        -6,
        "N",
        0.01,
        12 * cos(radians(120)),
        "Il vettore cade nel secondo quadrante.",
        r"$F_x=F\cos120^\circ=12(-1/2)=-6\,\mathrm N~La punta si proietta sul semiasse negativo; il modulo dell’intera forza resta 12 N.",
        "concetto|Disegna la punta del vettore rispetto all’origine.",
    )
    M(
        "Risultante di versi opposti",
        "Due spostamenti di 7 m a ovest e 11 m a est avvengono sulla stessa retta. Qual è la risultante?",
        "4 m a est",
        "18 m a est|4 m a ovest|18 m a ovest",
        "Usa est positivo e assegna un segno ai due addendi.",
        r"$R_x=(-7+11)\,\mathrm m=+4\,\mathrm m~Il segno positivo individua l’est; solo 4 m della seconda percorrenza restano dopo il ritorno al punto di partenza.",
        "algebra|Inserisci il segno prima di sommare i due numeri.",
    )
    N(
        "Differenza fra due letture",
        "A e B hanno componenti A = (2, −3) m e B = (5, 1) m. Quanto vale il modulo di B − A?",
        5,
        "m",
        0.01,
        sqrt((5 - 2) ** 2 + (1 + 3) ** 2),
        "Sottrai prima ogni coppia di coordinate omologhe.",
        r"$B_x-A_x=5-2=3\,\mathrm m,\quad B_y-A_y=1-(-3)=4\,\mathrm m~$|\vec B-\vec A|=\sqrt{3^2+4^2}\,\mathrm m=5\,\mathrm m~La doppia negazione nella componente verticale spiega perché entrambe le componenti risultano positive.",
        "algebra|La differenza dei moduli non dà in generale il modulo della differenza.",
    )
    T(
        "Vettori ortogonali",
        "Due vettori non nulli hanno prodotto scalare zero. Come si chiama la relazione fra le loro direzioni?",
        "perpendicolari",
        "ortogonali|perpendicolarità|ortogonalità",
        "Quale angolo ha coseno nullo fra 0° e 180°?",
        r"$\vec A\cdot\vec B=AB\cos\alpha=0~Poiché A e B sono diversi da zero, deve essere nullo il coseno. L’angolo fra le direzioni è 90°.",
        "concetto|Controlla se si usa seno o coseno nel prodotto scalare.",
    )
    M(
        "Il verso della normale",
        "In una terna cartesiana destrorsa, un vettore A è diretto lungo +x e B lungo +y. Dove punta A × B?",
        "Lungo +z",
        "Lungo −z|Lungo +x|Lungo la bisettrice fra x e y",
        "Piega le dita della mano destra da A verso B.",
        "Il prodotto vettoriale è perpendicolare al piano xy. La rotazione da x verso y orienta il pollice lungo +z. Invertendo i fattori cambierebbe il verso.",
        "concetto|Rifletti su quale dei due vettori si incontra per primo.",
    )
    N(
        "Un angolo misurato dalla verticale",
        "Una fune lunga 2,4 m ha un’inclinazione di 30° rispetto alla verticale. Quale distanza orizzontale separa i due estremi?",
        1.2,
        "m",
        0.01,
        2.4 * 0.5,
        "Il cateto orizzontale è opposto all’angolo indicato.",
        r"$x=\ell\sin30^\circ=2{,}4\times0{,}5=1{,}2\,\mathrm m~Per inclinazione nulla la fune sarebbe verticale e x sarebbe zero, come prevede il seno.",
        "testo|Evidenzia l’asse a cui si riferisce l’angolo.",
    )
    M(
        "Somma di moduli massima",
        "Per due vettori con moduli fissati, quando è massimo il modulo della somma?",
        "Quando direzione e verso coincidono",
        "Quando sono perpendicolari|Quando sono opposti|Quando il loro prodotto scalare è nullo",
        "Disegna le due frecce una di seguito all’altra.",
        "La distanza massima fra partenza e arrivo si ottiene se tutto il secondo tragitto prolunga il primo. La risultante ha allora modulo A + B.",
        "concetto|Costruisci la somma con il metodo punta-coda.",
        1,
    )
    N(
        "Quanto vale la pendenza?",
        "Una rampa sale di 0,45 m ogni 3,0 m orizzontali. Qual è la tangente dell’angolo con il pavimento?",
        0.15,
        "",
        0.001,
        0.45 / 3,
        "Individua cateto opposto e cateto adiacente.",
        r"$\tan\theta=\Delta y/\Delta x=0{,}45/3{,}0=0{,}15~Le due lunghezze hanno la stessa unità e il risultato è adimensionale.",
        "modello|Usa la distanza orizzontale al denominatore, non la lunghezza della rampa.",
    )
    N(
        "Prodotto con componenti note",
        "Una forza F = (3, 4) N agisce durante uno spostamento s = (2, −1) m. Calcola F·s.",
        2,
        "J",
        0.01,
        3 * 2 + 4 * (-1),
        "Le componenti parallele si moltiplicano a coppie.",
        r"$\vec F\cdot\vec s=F_xs_x+F_ys_y=3\cdot2+4(-1)=2\,\mathrm J~La componente verticale della forza si oppone allo spostamento verticale e sottrae 4 J ai 6 J della componente orizzontale.",
        "algebra|Mantieni il segno di ogni componente nel prodotto.",
    )
    M(
        "Due direzioni con la stessa tangente",
        "Una forza ha entrambe le componenti negative e uguali. Qual è il suo angolo antiorario con +x tra 0° e 360°?",
        "225°",
        "45°|135°|315°",
        "Localizza la punta prima di usare la calcolatrice.",
        "L’angolo di riferimento è 45° perché i due cateti hanno moduli uguali. Entrambe le componenti negative collocano il vettore nel terzo quadrante: 180° + 45° = 225°.",
        "concetto|La tangente da sola lascia indeterminato il quadrante.",
        3,
    )
    L(
        "Leggere il movimento nel tempo",
        "Moto e forze",
        "Posizione e spostamento|Traiettoria e legge oraria|Velocità media e istantanea|Accelerazione media e istantanea|Moto rettilineo uniforme|Grafici cinematici",
        r"""Sul pavimento segna un’origine e scegli il verso positivo. Il numero x(t) dice dove si trova un punto all’istante t. I punti attraversati tracciano la traiettoria; la legge oraria abbina a ciascun tempo la posizione. In un grafico x–t l’asse orizzontale è il tempo: la linea disegnata racconta il moto anche se la corsia reale è perfettamente diritta.
@C1-posizione|Leggi per prima la quota verticale di ciascun punto. Il tratto orizzontale indica una sosta a 6 m dall’origine.
$\Delta x=x_f-x_i,\qquad \bar v=\frac{\Delta x}{t_f-t_i}
Tra due istanti la velocità media è la pendenza della retta che collega i punti. Stringendo l’intervallo attorno a un istante si ottiene la velocità istantanea, cioè la pendenza della tangente. Per un moto rettilineo uniforme la pendenza è costante, quindi x = x₀ + vt con v in m/s. Se il grafico scende, il corpo procede verso valori minori di x.
Anche la velocità può essere misurata istante per istante. In un grafico v–t la pendenza racconta come cambia v, quindi misura l’accelerazione. L’area con segno fra la linea e l’asse del tempo misura lo spostamento, dato che velocità per tempo ha unità di lunghezza.
@C1-velocita|La velocità sale e poi scende, ma resta positiva. La posizione continua quindi ad aumentare fino all’ultimo istante mostrato.
$\bar a=\frac{v_f-v_i}{\Delta t},\qquad [a]=\mathrm{m/s^2}
Per ottenere l’accelerazione istantanea si riduce l’intervallo intorno all’istante osservato. Se confondi una linea che scende con un corpo che torna indietro, leggi l’etichetta dell’asse verticale: nel grafico v–t il ritorno verso x minori richiede v negativa.""",
        (1, 2),
    )
    E(
        "Una sosta e un ritorno",
        1,
        "Nel grafico posizione–tempo il punto passa per (0 s, 0 m), (2 s, 6 m), (4 s, 6 m), (6 s, 2 m). Trova distanza percorsa e velocità media.",
        r"""@C1-posizione|Le coordinate mostrano due tratti di movimento separati da una sosta.
Le tre variazioni di posizione sono +6 m, 0 m e −4 m. Per sommare i metri effettivamente camminati prendi i moduli.
$d=|6|+|0|+|-4|=10\,\mathrm m
Per la velocità media collega invece direttamente gli estremi.
$\Delta x=2-0=2\,\mathrm m,\qquad \bar v=\frac{2}{6}\,\mathrm{m/s}=0{,}33\,\mathrm{m/s}
La piccola velocità media positiva riflette il ritorno parziale. La rapidità media, che usa la distanza percorsa, sarebbe 10/6 m/s.""",
    )
    E(
        "Lo spazio sotto il triangolo",
        2,
        "Un carrello parte da fermo. La velocità sale linearmente a 6 m/s in 3 s e poi scende linearmente a zero in altri 3 s. Trova lo spostamento e l’accelerazione di ciascuna fase.",
        r"""@C1-velocita|L’altezza è una velocità. Per ottenere metri, moltiplicala per un intervallo di tempo.
La pendenza di ciascun lato è costante. Prendi la velocità finale meno quella iniziale nell’ordine temporale.
$a_1=(6-0)/3=2\,\mathrm{m/s^2},\qquad a_2=(0-6)/3=-2\,\mathrm{m/s^2}
Lo spostamento coincide con l’area del triangolo di base 6 s, perché la velocità non diventa negativa.
$\Delta x=\tfrac12(6\,\mathrm s)(6\,\mathrm{m/s})=18\,\mathrm m
In media il carrello avanza a 3 m/s. Il valore sta fra gli estremi 0 e 6 m/s.""",
    )
    N(
        "Partenza lontano dall’origine",
        "Un punto parte da x₀ = −12 m con velocità costante +2,5 m/s. Dove si trova dopo 8,0 s?",
        8,
        "m",
        0.02,
        -12 + 2.5 * 8,
        "Somma lo spostamento alla posizione iniziale.",
        r"$x=x_0+vt=-12\,\mathrm m+(2{,}5\,\mathrm{m/s})(8{,}0\,\mathrm s)=8\,\mathrm m~Lo spostamento è +20 m: il punto ha oltrepassato l’origine.",
        "concetto|Ricorda da dove parte il corpo.",
    )
    N(
        "Due tratti di pari lunghezza",
        "Un carrello percorre 12 m a 2 m/s e i successivi 12 m a 3 m/s, sempre nello stesso verso. Calcola la velocità media.",
        2.4,
        "m/s",
        0.01,
        24 / (12 / 2 + 12 / 3),
        "Calcola separatamente i due tempi.",
        r"$t_1=12/2=6\,\mathrm s,\quad t_2=12/3=4\,\mathrm s~$\bar v=(12+12)/(6+4)=2{,}4\,\mathrm{m/s}~Il tratto lento pesa di più sulla media perché occupa più tempo.",
        "modello|Una media semplice delle velocità richiederebbe intervalli di tempo uguali.",
    )
    M(
        "Un grafico sotto lo zero",
        "Nel grafico v–t la curva è sotto zero e sale verso l’asse orizzontale. Come si muove il punto?",
        "Procede verso x minori e rallenta",
        "Procede verso x maggiori e rallenta|È fermo|Procede verso x minori aumentando la rapidità",
        "Separa il segno di v dal segno della pendenza.",
        "La velocità è negativa e il suo modulo diminuisce. L’accelerazione è positiva perché v aumenta verso zero; l’oggetto sta rallentando mentre procede nel verso negativo.",
        "concetto|Per il verso del moto leggi il valore di v, per la sua variazione osserva la pendenza.",
    )
    T(
        "Una lettura all’istante",
        "Nel grafico x–t quale retta locale serve per ricavare la velocità istantanea dalla sua pendenza?",
        "tangente",
        "la tangente|retta tangente",
        "Immagina che i due punti della secante si avvicinino.",
        "Stringendo l’intervallo, la secante tende alla tangente nel punto quando il grafico è derivabile. La sua pendenza misura la velocità in quell’istante.",
        "concetto|Una corda su un intervallo finito dà una velocità media.",
    )
    M(
        "Traslare l’origine spaziale",
        "Sposto l’origine di 5 m verso destra mantenendo verso e unità dell’asse. Quale quantità di uno stesso moto cambia?",
        "La posizione a ogni istante",
        "Lo spostamento fra due istanti|La velocità media|La durata del moto",
        "Scrivi x′ = x − 5 m per entrambe le estremità.",
        "Le coordinate diventano tutte inferiori di 5 m. Nella differenza fra due posizioni lo scarto costante si cancella e così resta uguale anche la velocità media.",
        "modello|Confronta una coordinata assoluta con una differenza di coordinate.",
    )
    N(
        "Intersezione di due leggi orarie",
        "Sul medesimo asse x in metri, A segue x = 2t e B segue x = 15 − t, con t in secondi. Quando si incontrano?",
        5,
        "s",
        0.01,
        15 / (2 + 1),
        "Un incontro richiede la stessa posizione allo stesso istante.",
        r"$2t=15-t\quad\Rightarrow\quad 3t=15\quad\Rightarrow\quad t=5\,\mathrm s~Entrambi si trovano a x = 10 m, verifica ottenuta sostituendo il tempo nelle due leggi.",
        "algebra|Porta i termini con t dallo stesso lato.",
        3,
    )
    N(
        "Aree di segno opposto",
        "Un sensore registra +3 m/s per 4 s e poi −2 m/s per 5 s, con inversione idealizzata istantanea. Calcola lo spostamento complessivo.",
        2,
        "m",
        0.01,
        3 * 4 - 2 * 5,
        "Somma le aree con segno dei due rettangoli.",
        r"$\Delta x=v_1t_1+v_2t_2=3\cdot4+(-2)\cdot5=12-10=2\,\mathrm m~Il punto torna indietro di 10 m, terminando 2 m oltre la posizione di partenza.",
        "concetto|Per lo spostamento conserva il segno delle velocità.",
    )
    M(
        "Tratto orizzontale in due grafici",
        "Quale interpretazione è corretta per una linea orizzontale sopra lo zero?",
        "Nel grafico x–t il punto è fermo, nel grafico v–t avanza a velocità costante",
        "Il punto è sempre fermo|La velocità cresce in entrambi|L’accelerazione è positiva in entrambi",
        "Leggi il nome della grandezza mantenuta costante.",
        "Nel primo caso rimane costante la posizione. Nel secondo rimane costante una velocità positiva, quindi la posizione continua ad aumentare.",
        "testo|Associa la linea orizzontale alla grandezza indicata sull’asse verticale.",
    )
    N(
        "Una variazione durante la retromarcia",
        "In 2,0 s la velocità di un punto cambia da −3 m/s a +1 m/s. Calcola l’accelerazione media.",
        2,
        "m/s²",
        0.01,
        (1 + 3) / 2,
        "Sottrai la velocità iniziale completa di segno.",
        r"$\bar a=[1-(-3)]/2=4/2=2\,\mathrm{m/s^2}~La velocità cresce algebricamente di 4 m/s. I soli moduli nasconderebbero l’inversione del moto.",
        "algebra|Meno una velocità negativa equivale ad aggiungerne il modulo.",
    )
    T(
        "La curva nello spazio reale",
        "Quale nome ha l’insieme delle posizioni attraversate dal punto nello spazio?",
        "traiettoria",
        "la traiettoria",
        "Pensa al segno lasciato da una punta sulla carta.",
        "La traiettoria descrive la forma del percorso. Per sapere anche quando il punto passa da ogni posizione occorre la legge oraria.",
        "concetto|Distingui percorso nello spazio e dipendenza dal tempo.",
    )
    L(
        "Accelerare in linea retta e in curva",
        "Moto e forze",
        "Moto uniformemente accelerato|Caduta libera|Moto parabolico|Moto circolare uniforme e accelerazione centripeta",
        r"""Se la velocità cambia della stessa quantità in ogni secondo, l’accelerazione è costante. L’area sotto il grafico v–t è un rettangolo più un triangolo. Il primo registra lo spazio che si percorrerebbe con la velocità iniziale, il secondo il contributo della variazione di velocità.
$v=v_0+at,\qquad x-x_0=v_0t+\tfrac12at^2
Vicino alla superficie terrestre e per distanze piccole rispetto al raggio terrestre, un oggetto in caduta libera ha accelerazione quasi uniforme verso il basso. Trascuriamo l’aria. Con y positivo in alto si pone aᵧ = −g e g ≈ 9,81 m/s². La scelta del segno vale anche durante la salita.
@C1-parabola|Al culmine la velocità ha ancora una componente orizzontale. La gravità continua ad accelerare il punto verso il basso.
$x=x_0+v_{0x}t,\qquad y=y_0+v_{0y}t-\tfrac12gt^2
Per un lancio obliquo si usa lo stesso tempo nelle due equazioni. Il moto orizzontale uniforme e quello verticale accelerato si combinano in una parabola. Individua un evento, per esempio il ritorno a una quota, e imponi quell’altezza all’equazione verticale.
Una velocità può variare anche se il modulo resta costante: accade quando gira la direzione. Durante un giro uniforme di raggio r in tempo T il punto percorre 2πr, quindi il modulo della velocità è 2πr/T. La variazione della direzione richiede un’accelerazione verso il centro.
@C1-circolo|Nel punto di destra v è tangente. La freccia rivolta verso il centro rappresenta l’accelerazione.
$a_c=\frac{v^2}{r}=\left(\frac{2\pi}{T}\right)^2r
Il nome centripeta descrive la direzione dell’accelerazione. Per individuare la forza responsabile, cerca l’interazione reale che ha una componente radiale, per esempio la tensione di un filo.""",
        (2, 3),
    )
    E(
        "Una biglia lascia il bordo",
        2,
        "Una biglia lascia orizzontalmente un piano alto 1,25 m con velocità 2,0 m/s. Ignora l’aria e usa g = 10 m/s². A che distanza orizzontale dal bordo arriva?",
        r"""Scegli l’origine sul pavimento sotto il bordo. All’inizio y₀ = 1,25 m, v₀ᵧ = 0. L’istante cercato è quello in cui y diventa zero. Il moto verticale determina il tempo a disposizione.
$0=h-\tfrac12gt^2\quad\Rightarrow\quad t^2=2h/g=2(1{,}25)/10\,\mathrm s^2=0{,}25\,\mathrm s^2
La radice positiva corrisponde al futuro dell’istante di partenza: t = 0,50 s. In orizzontale la velocità resta costante.
$\Delta x=v_xt=(2{,}0)(0{,}50)\,\mathrm m=1{,}0\,\mathrm m
La distanza raddoppierebbe raddoppiando la velocità orizzontale alla stessa altezza; il tempo di caduta resterebbe 0,50 s.""",
    )
    E(
        "Seguire un punto del disco",
        2,
        "Un segno a 0,20 m dal centro di un disco compie un giro in 2,0 s, a ritmo uniforme. Quanto valgono velocità e accelerazione in modulo?",
        r"""@C1-circolo|Le due frecce sono perpendicolari per tutto il giro. Il diagramma mostra un singolo istante.
Un periodo è la durata di un giro. La distanza percorsa durante il periodo è la circonferenza.
$v=\frac{2\pi r}{T}=\frac{2\pi(0{,}20)}{2{,}0}\,\mathrm{m/s}=0{,}628\,\mathrm{m/s}
$a_c=\frac{v^2}{r}=\frac{(0{,}628)^2}{0{,}20}\,\mathrm{m/s^2}=1{,}97\,\mathrm{m/s^2}
La velocità cambia orientamento e l’accelerazione punta verso l’asse del disco. Se il periodo raddoppiasse, a parità di raggio, l’accelerazione diventerebbe un quarto.""",
    )
    N(
        "Arresto a decelerazione costante",
        "Un carrello procede a 4 m/s e rallenta con accelerazione costante −2 m/s² fino a fermarsi. Quanti metri percorre?",
        4,
        "m",
        0.01,
        4**2 / (2 * 2),
        "Trova il tempo di arresto e usa la velocità media della frenata.",
        r"$0=4-2t\;\Rightarrow\;t=2\,\mathrm s~Con accelerazione costante v varia linearmente; la media è (4 + 0)/2 = 2 m/s.~$d=\bar vt=2\cdot2=4\,\mathrm m",
        "modello|Moltiplicare la velocità iniziale per il tempo trascurerebbe il rallentamento.",
    )
    M(
        "La cima della traiettoria",
        "Al punto più alto di un lancio obliquo senza aria, quale affermazione è corretta?",
        "La componente verticale della velocità è nulla e l’accelerazione è verso il basso",
        "Velocità e accelerazione sono entrambe nulle|L’accelerazione è orizzontale|La componente orizzontale è nulla",
        "Separa la velocità istantanea dal suo cambiamento.",
        "La gravità agisce durante l’intero volo. Nell’istante in cui cambia verso il moto verticale, vᵧ passa per zero; vₓ mantiene il valore iniziale.",
        "concetto|Ritorna al disegno del culmine e identifica le due frecce.",
    )
    N(
        "Ritorno alla quota di partenza",
        "Una pallina viene lanciata verticalmente verso l’alto a 6 m/s. Con g = 10 m/s², dopo quanti secondi torna alla quota iniziale?",
        1.2,
        "s",
        0.01,
        2 * 6 / 10,
        "Poni la variazione di quota uguale a zero e scarta l’istante iniziale.",
        r"$0=6t-5t^2=t(6-5t)~Le soluzioni sono t = 0 e t = 6/5 s. Il ritorno avviene dopo 1,2 s, il doppio del tempo necessario a raggiungere il culmine.",
        "algebra|L’equazione ammette anche la partenza: scegli la radice coerente con il testo.",
    )
    N(
        "Caduta durante il secondo secondo",
        "Un corpo cade da fermo nel vuoto. Quanto spazio percorre tra t = 1 s e t = 2 s? Usa g = 10 m/s².",
        15,
        "m",
        0.01,
        0.5 * 10 * (2**2 - 1**2),
        "Sottrai le due distanze accumulate dalla partenza.",
        r"$s(2)=\tfrac12(10)(2)^2=20\,\mathrm m,\qquad s(1)=5\,\mathrm m~$s(2)-s(1)=15\,\mathrm m~Nel secondo intervallo di un secondo il corpo è già in moto e percorre più spazio che nel primo.",
        "testo|Il tempo trascorso dall’inizio e la durata dell’intervallo hanno ruoli diversi.",
        3,
    )
    M(
        "Una coppia di lanci",
        "Dalla stessa altezza una sfera viene lasciata cadere e una seconda parte orizzontalmente. Trascurando l’aria, quale arriva prima al suolo?",
        "Arrivano insieme",
        "Quella lasciata cadere|Quella lanciata orizzontalmente|Dipende dal modulo della velocità orizzontale",
        "Confronta solo le condizioni iniziali verticali.",
        "Le due sfere hanno la medesima quota, la stessa velocità verticale iniziale nulla e la stessa accelerazione −g. Le loro quote coincidono a ogni istante.",
        "concetto|L’equazione verticale non contiene vₓ.",
    )
    N(
        "Lettura dei giri al minuto",
        "Una piccola piattaforma ruota uniformemente a 30 giri/min. Quanto dura un giro?",
        2,
        "s",
        0.01,
        60 / 30,
        "Calcola quanti secondi corrispondono ai 30 giri.",
        r"$T=\frac{60\,\mathrm s}{30}=2\,\mathrm s~La frequenza è 0,5 giri al secondo e il suo reciproco restituisce 2 s per giro.",
        "unità|Per ricavare il periodo dividi il tempo totale per il numero di giri.",
    )
    N(
        "Raggio dalla curvatura nota",
        "Un punto si muove con velocità di modulo 3,0 m/s su un cerchio e ha accelerazione centripeta 4,5 m/s². Ricava il raggio.",
        2,
        "m",
        0.01,
        3**2 / 4.5,
        "Isola r nella relazione centripeta.",
        r"$a_cr=v^2\quad\Rightarrow\quad r=v^2/a_c=9/4{,}5=2{,}0\,\mathrm m~Il rapporto fra m²/s² e m/s² ha dimensione di lunghezza.",
        "algebra|Nel numeratore entra la velocità al quadrato.",
    )
    M(
        "Due punti sullo stesso disco",
        "Due punti solidali con un disco uniforme in rotazione regolare si trovano a r e 2r. Come cambia l’accelerazione dal primo al secondo?",
        "Raddoppia",
        "Si dimezza|Quadruplica|Resta uguale",
        "È comune il tempo per completare il giro.",
        r"$a_c=\omega^2r,\qquad \omega=2\pi/T~La velocità angolare è la stessa per i due punti. L’accelerazione cresce linearmente con il raggio. La velocità tangenziale varia e non può essere tenuta fissa nel confronto.",
        "modello|Individua la grandezza comune prima di scegliere la forma della formula.",
    )
    T(
        "Verso dell’accelerazione normale",
        "Nel moto circolare uniforme, verso quale punto della circonferenza o del cerchio è diretta l’accelerazione?",
        "centro",
        "il centro|centro del cerchio|centro della circonferenza",
        "Segui la rotazione della tangente per un breve tratto.",
        "Il vettore velocità ruota verso l’interno della traiettoria. La sua variazione istantanea è radiale e diretta al centro.",
        "concetto|Distingui la direzione della velocità da quella della sua variazione.",
    )
    N(
        "Trovare la velocità del fotogramma",
        "Una traccia segue x(t) = 1 m + (2 m/s)t + (3 m/s²)t². Qual è la velocità a t = 2 s?",
        14,
        "m/s",
        0.01,
        2 + 2 * 3 * 2,
        "Confronta il coefficiente di t² con a/2.",
        r"$x=x_0+v_0t+\tfrac12at^2\quad\Rightarrow\quad v_0=2\,\mathrm{m/s},\quad a=6\,\mathrm{m/s^2}~$v(2)=v_0+a(2)=2+12=14\,\mathrm{m/s}~La tangente in quell’istante è più ripida della secante fra 0 s e 2 s.",
        "modello|Il coefficiente quadratico è metà dell’accelerazione.",
        3,
    )
    L(
        "Isolare un corpo e disegnare le forze",
        "Moto e forze",
        "Sistemi inerziali e primo principio|Equilibrio traslazionale e statico|Secondo principio della dinamica|Azione e reazione|Forza peso e normale|Tensione in un filo",
        r"""Un carrello può muoversi mentre le forze si compensano. Per prevedere che cosa cambia, isola il corpo che vuoi descrivere. Elenca chi interagisce con esso: la Terra esercita il peso, il piano preme con la reazione normale, un filo teso tira lungo la propria direzione. Ogni freccia rappresenta una forza esercitata sul corpo scelto.
@C1-forze|Sul blocco tirato orizzontalmente, peso e normale si compensano. Le due frecce orizzontali hanno lunghezze diverse e la risultante è verso destra.
In un sistema inerziale un corpo con risultante nulla mantiene la propria velocità. È il primo principio. Se era inizialmente fermo, resta fermo. Per un corpo esteso l’equilibrio statico richiederà anche una condizione sui momenti. Con massa costante, il secondo principio traduce la somma vettoriale delle forze in accelerazione.
$\sum\vec F=m\vec a,\quad \sum F_x=ma_x,\quad\sum F_y=ma_y,\qquad 1\,\mathrm N=1\,\mathrm{kg\,m/s^2}
Scegli gli assi per ridurre i conti e proietta le forze con segno. Vicino alla superficie della Terra il peso ha modulo mg, con massa in kg e g in m/s². La normale è perpendicolare al piano; il suo modulo si ricava dall’equazione perpendicolare. In presenza di altre forze verticali o accelerazione verticale può differire da mg.
Il terzo principio riguarda due corpi distinti. Se la mano spinge il carrello, il carrello spinge la mano con forza opposta di uguale modulo. Solo la prima forza appartiene al diagramma del carrello. Per recuperare un disegno confuso, scrivi accanto a ogni freccia «chi agisce su chi» e cancella le frecce che hanno un destinatario diverso dal corpo studiato.""",
        (2, 4),
    )
    E(
        "Una spinta e una resistenza",
        1,
        "Un blocco di 4,0 kg scivola a destra su un piano orizzontale. Una fune lo tira a destra con 10 N e l’attrito vale 6 N. Determina l’accelerazione.",
        r"""@C1-forze|Isola il blocco. Nel modello il filo è orizzontale e l’attrito si oppone allo scorrimento; le frecce mostrano direzioni e versi.
Con x a destra e y in alto, l’accelerazione verticale è nulla. Il vincolo del piano fornisce la normale necessaria.
$N-mg=0,\qquad T-f=ma_x
$a_x=(T-f)/m=(10-6)/4{,}0=1{,}0\,\mathrm{m/s^2}
Il blocco sta andando a destra e l’accelerazione è positiva, quindi acquista velocità. Usare soltanto la trazione darebbe un risultato eccessivo.""",
    )
    E(
        "La bilancia durante l’avvio",
        2,
        "Una cassa di 6 kg è appoggiata a una bilancia in un ascensore che accelera verso l’alto a 1,5 m/s². Usa g = 9,8 m/s². Quanto vale la forza normale?",
        r"""La cassa è il sistema scelto. Le uniche forze su di essa sono il peso verso il basso e la normale della bilancia verso l’alto. Scegli positivo verso l’alto; alla partenza la cassa condivide l’accelerazione del pavimento.
$N-mg=ma_y\quad\Rightarrow\quad N=m(g+a_y)
$N=6(9{,}8+1{,}5)\,\mathrm N=67{,}8\,\mathrm N
La lettura in forza supera il peso 58,8 N della cassa: servono 9 N di risultante verso l’alto. La massa della cassa resta 6 kg.""",
    )
    M(
        "Muoversi senza risultante",
        "Un pattino già in moto su una guida orizzontale ha risultante nulla. Come evolve in un riferimento inerziale?",
        "Mantiene velocità e direzione",
        "Si ferma immediatamente|Rallenta uniformemente|Aumenta la propria velocità",
        "Chiediti se le forze cambiano la velocità o la sostengono.",
        "Dal secondo principio a = 0. Una velocità iniziale diversa da zero persiste invariata finché la risultante rimane nulla.",
        "concetto|Una risultante nulla impone accelerazione nulla, qualunque sia la velocità iniziale.",
        1,
    )
    N(
        "Trazione verticale a velocità costante",
        "Un secchio di massa totale 3,2 kg sale con velocità costante appeso a un filo verticale ideale. Qual è la tensione? Usa g = 10 m/s².",
        32,
        "N",
        0.1,
        3.2 * 10,
        "Con velocità costante l’accelerazione è nulla.",
        r"$T-mg=0\quad\Rightarrow\quad T=mg=3{,}2\cdot10=32\,\mathrm N~Il filo fornisce esattamente la forza che bilancia il peso durante la salita.",
        "modello|Il verso del moto da solo non fissa quello della risultante.",
    )
    M(
        "La coppia del terzo principio",
        "Un libro è fermo su un tavolo. Quale forza è la reazione alla forza gravitazionale della Terra sul libro?",
        "L’attrazione del libro sulla Terra",
        "La normale del tavolo sul libro|La pressione dell’aria sul tavolo|La spinta del libro sul tavolo",
        "Scambia agente e destinatario della stessa interazione.",
        "La coppia gravitazionale collega Terra e libro. La normale appartiene a un’altra interazione e agisce anch’essa sul libro; compensa il peso senza esserne la reazione del terzo principio.",
        "concetto|Nelle coppie di azione e reazione i destinatari sono due corpi differenti.",
    )
    N(
        "Una trazione solleva in parte il peso",
        "Un blocco di 5 kg resta a contatto con un piano orizzontale. Una fune esercita 12 N verso l’alto oltre alla sua componente orizzontale. Con g = 10 m/s², quanto vale la normale?",
        38,
        "N",
        0.01,
        5 * 10 - 12,
        "Per la normale serve solo l’equilibrio verticale.",
        r"$N+T_y-mg=0\quad\Rightarrow\quad N=mg-T_y=50-12=38\,\mathrm N~Il valore positivo è compatibile con il contatto. La componente orizzontale della fune non entra in questa equazione.",
        "modello|Includi la componente verticale di tutte le forze.",
    )
    T(
        "Il riferimento adatto",
        "Come si chiama un riferimento in cui, per un corpo isolato, la velocità resta costante?",
        "inerziale",
        "sistema inerziale|riferimento inerziale|sistema di riferimento inerziale",
        "Richiama la definizione associata al primo principio.",
        "Il principio di inerzia identifica la classe dei riferimenti inerziali. In questi riferimenti la risultante delle forze reali basta per determinare l’accelerazione.",
        "concetto|Richiama il moto di un corpo isolato.",
    )
    N(
        "Due forze perpendicolari sul carrello",
        "Due spinte orizzontali ortogonali di 6 N e 8 N agiscono su una piattaforma di 5 kg senza resistenze. Quanto vale il modulo dell’accelerazione?",
        2,
        "m/s²",
        0.01,
        sqrt(6**2 + 8**2) / 5,
        "Trova il modulo della risultante con il triangolo rettangolo.",
        r"$F_R=\sqrt{6^2+8^2}=10\,\mathrm N~$a=F_R/m=10/5=2\,\mathrm{m/s^2}~Sommare direttamente i moduli darebbe 14 N, valore raggiungibile con spinte concordi.",
        "modello|Le due forze sono perpendicolari e devono essere sommate vettorialmente.",
    )
    M(
        "Due corpi spinti insieme",
        "Una mano spinge due blocchi a contatto, su piano liscio. Studiando i due blocchi come sistema unico, quale forza orizzontale è esterna?",
        "La spinta della mano",
        "La forza del primo blocco sul secondo|La forza del secondo blocco sul primo|La somma dei moduli delle due forze di contatto",
        "Traccia un contorno che comprenda entrambi i blocchi.",
        "Le forze reciproche fra i blocchi sono interne e si compensano nella somma sull’intero sistema. La mano esterna al contorno fornisce la risultante.",
        "testo|Definisci il confine del sistema prima di classificare una forza.",
    )
    N(
        "Massa su un altro pianeta",
        "Un corpo di peso 24 N sulla Terra, con g = 10 m/s², viene portato dove g vale 4,0 m/s². Quale sarà il peso?",
        9.6,
        "N",
        0.02,
        24 / 10 * 4,
        "Ricava la massa dal primo peso e mantienila nel trasferimento.",
        r"$m=P_1/g_1=24/10=2{,}4\,\mathrm{kg},\qquad P_2=mg_2=2{,}4\cdot4=9{,}6\,\mathrm N~La minore intensità del campo gravitazionale riduce il peso.",
        "concetto|Un valore espresso in newton è una forza.",
    )
    M(
        "Dove disegnare la tensione",
        "Un piccolo peso è sospeso a un filo teso inclinato. Qual è la direzione della forza del filo sul peso?",
        "Lungo il filo, dal peso verso il sostegno",
        "Verticale in ogni situazione|Lungo il filo, verso il prolungamento sotto il peso|Perpendicolare al filo",
        "Un filo flessibile teso può tirare il suo estremo.",
        "La tensione agisce lungo la tangente del filo nel punto di attacco e tira il peso verso il tratto di filo. L’inclinazione della forza segue quella del filo.",
        "concetto|Identifica il punto in cui il filo tocca il corpo.",
    )
    N(
        "Reazione di un supporto inclinato",
        "Una scatola di 2 kg è su una rampa inclinata di 60° e resta a contatto. Nessun’altra forza ha componente normale oltre a peso e reazione. Con g = 10 m/s², trova N.",
        10,
        "N",
        0.02,
        2 * 10 * cos(radians(60)),
        "Proietta il peso perpendicolarmente alla rampa.",
        r"$P_\perp=mg\cos\theta=2\cdot10\cdot0{,}5=10\,\mathrm N~L’accelerazione perpendicolare al piano è nulla, perciò N bilancia questa componente. Avvicinando il piano all’orizzontale ritroveremmo N = mg.",
        "modello|L’angolo della rampa con il pavimento coincide con quello fra peso e normale entrante.",
        3,
    )
    L(
        "Contatto, elasticità e gravitazione",
        "Moto e forze",
        "Attrito statico e dinamico|Forza elastica e legge di Hooke|Forza gravitazionale",
        r"""Trascina lentamente una scatola con un dinamometro. Prima dello scorrimento, l’attrito statico si adatta alla forza richiesta dall’equilibrio lungo il piano; esiste un limite. Superata la soglia, nel modello di attrito secco la forza dinamica ha modulo approssimativamente proporzionale alla normale e verso opposto allo scorrimento relativo.
$0\le |f_s|\le\mu_s N,\qquad |f_d|=\mu_dN
I coefficienti μ sono adimensionali. Trova prima N dal bilancio perpendicolare. Verifica se l’attrito necessario a impedire lo scorrimento rientra nel limite statico; soltanto allora puoi accettare l’ipotesi di quiete. Il laboratorio permette di confrontare l’attrito necessario con il suo limite.
Una molla ideale esercita una forza di richiamo. Misura la deformazione x dalla lunghezza a riposo: x positivo se l’estremo viene tirato verso l’asse positivo. Il segno meno riporta la forza verso la posizione di riposo. Il modello vale nel campo elastico lineare.
@C1-molla|La molla in basso è allungata. Il richiamo è verso sinistra e il segmento verde misura la deformazione rispetto al riferimento in alto.
$F_{\rm el}=-kx,\qquad [k]=\mathrm{N/m}
La gravitazione fra due masse puntiformi o sfericamente simmetriche è attrattiva e agisce sulla retta dei centri. R indica la distanza tra i centri. La costante G permette di passare da masse e distanza a una forza in newton.
$F=G\frac{Mm}{R^2},\qquad g=G\frac{M}{R^2}
La consueta forza peso mg è la forma locale dell’attrazione di un pianeta. A piccole variazioni di quota g è quasi costante. Se l’altezza diventa confrontabile con il raggio del pianeta, usa la distanza dal centro in entrambi gli stati.""",
        (5,),
    )
    E(
        "Partirà davvero la scatola?",
        2,
        "Una scatola di 8 kg è inizialmente ferma. La si tira orizzontalmente con 20 N. I coefficienti statico e dinamico sono 0,40 e 0,30. Con g = 10 m/s², determina forza di attrito e accelerazione.",
        r"""Il tirante è orizzontale e la scatola non accelera verticalmente. N vale mg. La prima ipotesi da provare è che la scatola resti ferma.
$N=8\cdot10=80\,\mathrm N,\qquad f_{s,\max}=0{,}40\cdot80=32\,\mathrm N
Per la quiete orizzontale serve una forza di attrito di 20 N contraria alla trazione. Poiché 20 N è sotto la soglia di 32 N, il contatto può fornirla.
$f_s=-20\,\mathrm N\quad(x\ \text{verso la trazione}),\qquad a=0
Usare 32 N come forza effettiva predirebbe una partenza all’indietro in risposta al tiro, in contrasto con il ruolo dell’attrito statico.""",
    )
    E(
        "Misurare la rigidità in verticale",
        2,
        "Una molla si allunga di 3,0 cm quando si appende una massa di 150 g e si attende che si fermi. Usa g = 9,8 m/s². Qual è la costante elastica?",
        r"""Peso e richiamo si bilanciano. La deformazione è la differenza fra lunghezza finale e lunghezza a riposo. Converti la massa e l’allungamento.
$m=0{,}150\,\mathrm{kg},\quad x=0{,}030\,\mathrm m,\quad kx=mg
$k=mg/x=\frac{(0{,}150)(9{,}8)}{0{,}030}\,\mathrm{N/m}=49\,\mathrm{N/m}
La costante esprime l’incremento di forza per metro nel tratto lineare. Uno spostamento di 1 cm produrrebbe un richiamo di 0,49 N nel medesimo intervallo elastico.""",
    )
    N(
        "Soglia di scorrimento",
        "Un dinamometro registra 18 N appena prima che una scatola inizi a scivolare. La normale è 60 N. Qual è il coefficiente statico?",
        0.30,
        "",
        0.002,
        18 / 60,
        "Alla soglia l’attrito raggiunge il massimo.",
        r"$f_{s,\max}=\mu_sN\quad\Rightarrow\quad\mu_s=18/60=0{,}30~Il rapporto tra due forze è adimensionale. La misura riguarda l’istante precedente allo scorrimento.",
        "modello|Il limite statico si ricava dal valore al distacco.",
    )
    N(
        "Frenata per attrito radente",
        "Un pattino sta già scivolando su un piano orizzontale, senza tiro. Il coefficiente dinamico è 0,20. Con g = 9,8 m/s², trova il modulo della decelerazione.",
        1.96,
        "m/s²",
        0.01,
        0.2 * 9.8,
        "La normale vale mg; proietta la forza d’attrito lungo il moto.",
        r"$ma_x=-\mu_dmg\quad\Rightarrow\quad a_x=-\mu_dg=-1{,}96\,\mathrm{m/s^2}~Si chiede il modulo, quindi 1,96 m/s². La massa si è semplificata.",
        "testo|Distingui il segno della componente dal modulo richiesto.",
    )
    M(
        "Un nastro trascina un pacco",
        "Un nastro orizzontale accelera verso destra. Il pacco inizialmente solidale non slitta, e il nastro è la sua unica interazione orizzontale. In quale verso agisce l’attrito sul pacco?",
        "A destra",
        "A sinistra|Verso il basso|È necessariamente nullo",
        "Quale accelerazione deve avere il pacco per seguire il nastro?",
        "L’attrito statico deve accelerare il pacco verso destra. Contrasta la tendenza del pacco a scivolare indietro rispetto al nastro.",
        "concetto|Osserva lo scorrimento relativo che nascerebbe togliendo l’attrito.",
        3,
    )
    M(
        "Confronto fra masse gravitazionali",
        "La distanza fra due masse puntiformi raddoppia e una delle due masse quadruplica. Che cosa succede al modulo della forza gravitazionale?",
        "Resta uguale",
        "Raddoppia|Si riduce a un quarto|Diventa sedici volte maggiore",
        "Tratta separatamente il numeratore e il quadrato della distanza.",
        r"$F_2/F_1=4/(2^2)=1~La crescita di una massa compensa esattamente l’indebolimento dovuto alla distanza.",
        "algebra|La distanza entra due volte al denominatore.",
    )
    N(
        "Altezza pari al raggio planetario",
        "Sulla superficie di un pianeta sferico g = 8,0 m/s². Quanto vale g a un’altezza sopra la superficie pari al raggio del pianeta?",
        2,
        "m/s²",
        0.01,
        8 / (1 + 1) ** 2,
        "La distanza da usare si misura dal centro.",
        r"$r_2=R+R=2R,\qquad g_2=g_1(R/2R)^2=8/4=2\,\mathrm{m/s^2}~Il campo diminuisce perché il centro attrattore è due volte più distante.",
        "testo|Somma l’altezza al raggio della superficie.",
    )
    N(
        "Lunghezza di riposo ignota",
        "Una molla ideale di costante 200 N/m, tirata assialmente con 6,0 N e in equilibrio, è lunga 14 cm. Trova la lunghezza a riposo.",
        11,
        "cm",
        0.02,
        14 - 6 / 200 * 100,
        "La lunghezza osservata è lunghezza a riposo più allungamento.",
        r"$x=F/k=6/200=0{,}030\,\mathrm m=3{,}0\,\mathrm{cm}~$\ell_0=\ell-x=14-3=11\,\mathrm{cm}~Senza trazione la molla accorcia dei 3 cm guadagnati.",
        "concetto|Nella legge di Hooke usa la deformazione, non la lunghezza totale.",
    )
    M(
        "Pendenza di una prova elastica",
        "Un grafico del modulo della forza di richiamo in funzione dell’allungamento è rettilineo e passa per l’origine. Che cosa misura la pendenza?",
        "La costante elastica",
        "L’energia elastica|La massa della molla|La lunghezza a riposo",
        "Scrivi l’unità forza divisa per allungamento.",
        r"$\Delta |F|/\Delta x=k~Il rapporto è espresso in N/m ed è costante nell’intervallo lineare. Una molla più rigida produce una retta più ripida.",
        "concetto|Associa gli assi del grafico ai due membri della legge di Hooke.",
    )
    T(
        "L’attrito durante lo slittamento",
        "Dopo che due superfici solide hanno iniziato a scivolare una sull’altra, come si chiama il regime di attrito radente?",
        "dinamico",
        "cinetico|attrito dinamico|attrito cinetico",
        "Osserva il moto relativo fra le superfici di contatto.",
        "Lo scorrimento relativo identifica l’attrito dinamico o cinetico. Il coefficiente pertinente si misura mentre le superfici slittano.",
        "concetto|Controlla se c’è movimento relativo nel punto di contatto.",
    )
    N(
        "Una molla comprimibile",
        "L’asse x cresce verso destra. Una molla di costante 80 N/m ha estremo spostato di −0,025 m dalla posizione di riposo. Calcola la componente della forza elastica sull’estremo.",
        2,
        "N",
        0.01,
        -80 * (-0.025),
        "La forza di richiamo cambia segno rispetto allo spostamento.",
        r"$F_x=-kx=-80(-0{,}025)=+2{,}0\,\mathrm N~La freccia punta a destra e tende a riportare l’estremo verso x = 0.",
        "algebra|Mantieni separati il segno della legge di richiamo e quello della deformazione.",
    )
    M(
        "Due molle uguali affiancate",
        "Due molle identiche di costante k sono affiancate e subiscono lo stesso allungamento x. Qual è il modulo della loro forza complessiva sulla traversa comune?",
        "2kx",
        "kx/2|kx|2k/x",
        "Le forze sono parallele e concordi.",
        "Ogni molla fornisce kx alla traversa. Sommando i contributi concordi si ottiene 2kx. La rigidezza equivalente raddoppia.",
        "modello|Verifica se le due molle condividono la forza o la deformazione.",
        3,
    )
    L(
        "Trasferire energia con una forza",
        "Energia, impulso ed equilibrio",
        "Lavoro di una forza|Potenza media e istantanea|Teorema dell’energia cinetica",
        r"""Se una persona spinge una cassa mentre questa si sposta, la forza può trasferire energia. Conta la componente parallela allo spostamento del punto di applicazione. Per una forza costante, l’angolo α fra forza e spostamento determina il segno e l’entità del lavoro L.
$L=\vec F\cdot\Delta\vec r=F\,d\cos\alpha,\qquad 1\,\mathrm J=1\,\mathrm{N\,m}
Una forza diretta nel verso del moto compie lavoro positivo. Una forza ortogonale compie lavoro nullo; se è opposta compie lavoro negativo. Per una forza variabile lungo una retta, l’area con segno sotto il grafico Fₓ–x somma i contributi dei singoli spostamenti. Questa costruzione serve, per esempio, per una molla.
Sommando i lavori di tutte le forze su un punto materiale di massa costante si trova la variazione di energia cinetica K. Il teorema risolve un problema fra due posizioni anche quando il tempo impiegato è sconosciuto.
$K=\tfrac12mv^2,\qquad L_{\rm tot}=K_f-K_i
La potenza media misura quanto rapidamente viene trasferita energia: dividi il lavoro per la durata. In un istante la potenza di una forza vale il suo prodotto scalare con la velocità del punto di applicazione. Includi sempre il punto di vista: la potenza fornita da un motore può essere positiva mentre la potenza della forza resistente è negativa.
$\bar P=L/\Delta t,\qquad P=\vec F\cdot\vec v,\qquad 1\,\mathrm W=1\,\mathrm{J/s}
Se la velocità è costante e un motore lavora, cerca la seconda forza che assorbe energia: il lavoro totale può essere zero anche quando i lavori individuali sono consistenti.""",
        (2, 5),
    )
    E(
        "Sollevare alla stessa velocità",
        1,
        "Un piccolo argano alza verticalmente una massa di 12 kg di 1,5 m in 3,0 s, a velocità costante. Usa g = 10 m/s². Qual è la sua potenza meccanica sul carico?",
        r"""Lo spostamento è verticale verso l’alto come la tensione. Il carico ha velocità costante e la tensione T bilancia il peso.
$T=mg=120\,\mathrm N,\qquad L_T=T h\cos0^\circ=(120)(1{,}5)=180\,\mathrm J
$\bar P=L_T/\Delta t=180/3{,}0=60\,\mathrm W
Il peso compie −180 J e la velocità resta costante. L’argano trasferisce 60 J ogni secondo, immagazzinando energia nella configurazione gravitazionale carico–Terra.""",
    )
    E(
        "Dal lavoro alla velocità finale",
        2,
        "Un carrello di 2,0 kg entra a 1,0 m/s in una zona lunga 3,0 m. La risultante costante parallela al moto è 4,0 N. Calcola la velocità all’uscita.",
        r"""Il testo fornisce una distanza e la risultante. Il teorema dell’energia cinetica collega direttamente ingresso e uscita senza richiedere il tempo di attraversamento.
$L_{\rm tot}=Fd=4{,}0\cdot3{,}0=12\,\mathrm J,\quad K_i=\tfrac12(2{,}0)(1{,}0)^2=1\,\mathrm J
$K_f=K_i+L=13\,\mathrm J,\qquad v_f^2=2K_f/m=13\,\mathrm{m^2/s^2}
$v_f=\sqrt{13}\,\mathrm{m/s}\simeq3{,}61\,\mathrm{m/s}
Il lavoro positivo fa aumentare la rapidità. La radice positiva dà il modulo; il verso resta quello del moto iniziale.""",
    )
    N(
        "Forza obliqua e lavoro",
        "Durante uno spostamento orizzontale di 5,0 m una forza di 16 N forma 60° con lo spostamento. Quanto lavoro compie?",
        40,
        "J",
        0.02,
        16 * 5 * cos(radians(60)),
        "Calcola la componente della forza lungo il tragitto.",
        r"$L=Fd\cos60^\circ=16\cdot5{,}0\cdot0{,}5=40\,\mathrm J~La componente trasversale alla traiettoria ha lavoro nullo.",
        "modello|Verifica rispetto a quale direzione è dato l’angolo.",
    )
    M(
        "Traiettoria circolare e lavoro",
        "Una pallina percorre un cerchio a velocità di modulo costante, trattenuta da un filo con centro fisso. Perché il lavoro della tensione è nullo?",
        "La tensione è perpendicolare allo spostamento istantaneo",
        "La tensione ha modulo zero|La velocità è zero|La pallina ha massa trascurabile",
        "Confronta il raggio con la tangente.",
        r"$\mathrm dL=\vec T\cdot\mathrm d\vec r=0~Il filo tira radialmente e il punto si sposta lungo la tangente. La tensione cambia la direzione della velocità lasciandone invariato il modulo.",
        "concetto|Una forza può cambiare la direzione del moto senza trasferire energia.",
    )
    N(
        "Un freno sottrae energia",
        "Una ruota su banco riceve dal freno una forza tangenziale resistente di modulo 8 N. Il punto di contatto sul bordo percorre complessivamente 6 m nel verso opposto alla forza. Qual è il lavoro della forza sulla ruota?",
        -48,
        "J",
        0.05,
        -8 * 6,
        "Il coseno dell’angolo fra forza e spostamento vale −1.",
        r"$L=-Fd=-8\cdot6=-48\,\mathrm J~Il segno meno rappresenta un trasferimento di energia meccanica fuori dalla ruota.",
        "concetto|Il lavoro è una grandezza algebrica.",
    )
    N(
        "Area sotto una forza variabile",
        "In uno spostamento di 0,40 m una forza parallela concorde cresce linearmente da 2 N a 10 N. Quanto lavoro compie?",
        2.4,
        "J",
        0.01,
        (2 + 10) / 2 * 0.4,
        "La figura sotto la retta F–x è un trapezio.",
        r"$F_{\rm media}=(2+10)/2=6\,\mathrm N,\qquad L=F_{\rm media}\Delta x=6\cdot0{,}40=2{,}4\,\mathrm J~La media dei valori estremi è lecita qui perché la forza cresce linearmente con la posizione.",
        "modello|Per una forza variabile considera l’intera area F–x.",
    )
    M(
        "Doppia velocità e stessa massa",
        "Se la rapidità di un corpo raddoppia, di quanto deve essere aumentata la sua energia cinetica rispetto a quella iniziale Kᵢ?",
        "Di 3Kᵢ",
        "Di Kᵢ|Di 2Kᵢ|Di 4Kᵢ",
        "Distingui il valore finale dalla sua variazione.",
        r"$K_f=\tfrac12m(2v)^2=4K_i,\quad \Delta K=4K_i-K_i=3K_i~L’energia finale quadruplica, ma il lavoro richiesto è la differenza fra i due stati.",
        "testo|Il testo chiede un incremento.",
    )
    N(
        "Due trazioni in competizione",
        "Due forze orizzontali compiono sullo stesso corpo lavori +18 J e −6 J. Le altre forze hanno lavoro nullo. Se K iniziale è 5 J, quanto vale K finale?",
        17,
        "J",
        0.01,
        5 + 18 - 6,
        "Somma i lavori con segno e aggiungi il risultato all’energia iniziale.",
        r"$L_{\rm tot}=18-6=12\,\mathrm J,\qquad K_f=5+12=17\,\mathrm J~L’effetto netto è un aumento di energia, inferiore a quello prodotto dalla sola forza motrice.",
        "algebra|La variazione di K si somma al valore iniziale.",
    )
    N(
        "Potenza istantanea dalla trazione",
        "Una cinghia tira con 25 N paralleli alla sua velocità di 0,80 m/s. Qual è la potenza meccanica fornita in quell’istante?",
        20,
        "W",
        0.02,
        25 * 0.8,
        "Inserisci la velocità del punto di applicazione.",
        r"$P=Fv\cos0^\circ=25\cdot0{,}80=20\,\mathrm W~Poiché N·m/s è J/s, l’unità ottenuta è il watt.",
        "unità|Una forza moltiplicata per velocità fornisce potenza.",
    )
    T(
        "Unità del trasferimento energetico",
        "Come si chiama l’unità SI del lavoro, equivalente al prodotto di un newton per un metro (N·m)?",
        "joule",
        "J",
        "Pensa all’unità usata anche per l’energia cinetica.",
        "Forza per spostamento ha unità kg·m²/s². Il nome SI di questa unità di energia e lavoro è joule, simbolo J.",
        "unità|Leggi il punto centrale in N·m come moltiplicazione.",
    )
    M(
        "Stesso lavoro, tempi differenti",
        "Due dispositivi trasferiscono la stessa energia meccanica. A impiega un terzo del tempo di B. Qual è il rapporto fra le potenze medie P_A/P_B?",
        "3",
        "1/3|1|9",
        "La durata è al denominatore della potenza.",
        r"$P_A/P_B=(L/t_A)/(L/t_B)=t_B/t_A=3~A deve trasferire tre volte più energia in ciascun secondo per consegnare lo stesso lavoro totale.",
        "algebra|Quando il numeratore è comune si inverte il rapporto dei tempi.",
    )
    N(
        "Distanza minima per arrestarsi",
        "Un carrello da 4 kg procede a 3 m/s. Una forza resistente costante di 6 N è l’unica a compiere lavoro. Dopo quale distanza si ferma?",
        3,
        "m",
        0.01,
        (4 * 3**2 / 2) / 6,
        "Il lavoro negativo deve assorbire tutta l’energia iniziale.",
        r"$K_i=\tfrac12\cdot4\cdot3^2=18\,\mathrm J,\quad -6d=K_f-K_i=-18\,\mathrm J~$d=18/6=3\,\mathrm m~La distanza risulta positiva perché lavoro e variazione di energia hanno entrambi segno negativo.",
        "algebra|Assegna i segni prima di isolare la distanza.",
        3,
    )
    L(
        "Bilanci fra configurazioni",
        "Energia, impulso ed equilibrio",
        "Forze conservative e non conservative|Energia potenziale gravitazionale ed elastica|Energia meccanica e conservazione",
        r"""Seguire tutti gli istanti di una discesa è spesso superfluo. Per alcune forze il lavoro tra A e B dipende solo dalla configurazione iniziale e finale. Queste forze sono conservative e permettono di definire un’energia potenziale U. Il lavoro della forza è uguale alla diminuzione di U. Il livello zero si può scegliere liberamente purché sia comune all’intero calcolo.
@C1-energia|Scegli il livello di B come riferimento. L’altezza verticale h rimane la stessa anche cambiando la forma della discesa.
$L_{\rm cons}=U_i-U_f,\qquad U_g=mgz,\qquad U_{\rm el}=\tfrac12kx^2
La prima espressione di U vale per gravità uniforme e z verso l’alto. Per la molla ideale x è la deformazione dalla lunghezza a riposo; il fattore un mezzo deriva dall’area triangolare sotto il grafico della forza necessaria ad allungarla gradualmente. Sia in trazione sia in compressione la molla immagazzina energia.
Scrivi l’energia meccanica come K + U. Se il lavoro totale delle altre forze è nullo, questa somma si conserva. Se l’attrito di scorrimento compie lavoro, includilo esplicitamente nel bilancio meccanico.
$(K_f+U_f)-(K_i+U_i)=L_{\rm non\,cons}
Un calo dell’energia meccanica durante uno scorrimento corrisponde a un aumento di energia interna dei corpi a contatto, nelle opportune condizioni di isolamento. Per scegliere il metodo, chiediti se servono forze di contatto o tempi, oppure soltanto il confronto fra due stati. Un bilancio energetico determina spesso la rapidità ma lascia aperta la direzione della velocità.""",
        (6, 7),
    )
    E(
        "Discesa con perdita nota",
        2,
        "Un blocco di 2 kg parte da fermo e scende di 1,8 m in verticale lungo una pista. L’attrito compie −11 J. Con g = 10 m/s², trova la rapidità in fondo.",
        r"""@C1-energia|La quota utile è la differenza verticale fra A e B. Il lavoro d’attrito è già indicato per l’intera pista.
Scegli B come zero di U. La normale non compie lavoro. In A c’è soltanto energia potenziale gravitazionale.
$U_A=mgh=2\cdot10\cdot1{,}8=36\,\mathrm J,\quad K_B=U_A+L_{\rm attr}=36-11=25\,\mathrm J
$v_B=\sqrt{2K_B/m}=\sqrt{50/2}\,\mathrm{m/s}=5{,}0\,\mathrm{m/s}
Senza attrito il blocco arriverebbe a 6 m/s. La perdita indicata riduce la rapidità finale, come richiesto dal bilancio.""",
    )
    E(
        "La molla lancia il cursore",
        2,
        "Una molla di costante 250 N/m è compressa di 4,0 cm contro un cursore di massa 0,10 kg su una guida orizzontale liscia. Il cursore parte da fermo. Trova la rapidità alla lunghezza di riposo.",
        r"""Il sistema comprende la molla ideale e il cursore. Il peso e la normale compiono lavoro nullo lungo la guida. Inizialmente l’energia è nella molla, alla lunghezza di riposo è tutta cinetica.
$x_i=-0{,}040\,\mathrm m,\qquad \tfrac12kx_i^2=\tfrac12mv_f^2
$v_f^2=(k/m)x_i^2=(250/0{,}10)(0{,}040)^2=4{,}0\,\mathrm{m^2/s^2}
$v_f=2{,}0\,\mathrm{m/s}
Il quadrato elimina il segno iniziale della compressione. La direzione del moto si deduce dalla posizione del cursore e dal verso del richiamo.""",
    )
    M(
        "Un giro chiuso",
        "Qual è una proprietà del lavoro di una forza conservativa lungo un percorso chiuso?",
        "È nullo",
        "È sempre positivo|È proporzionale alla durata|Vale il doppio dell’energia potenziale",
        "Confronta stato iniziale e finale.",
        "In un giro chiuso la configurazione torna quella iniziale. La variazione di energia potenziale è zero e il lavoro conservativo, pari a −ΔU, è zero.",
        "concetto|Il lavoro conservativo dipende dalle configurazioni agli estremi.",
    )
    N(
        "Quota di una piccola sfera",
        "Una sfera di 0,20 kg cresce di energia potenziale gravitazionale di 3 J. Con g = 10 m/s², di quanto è salita?",
        1.5,
        "m",
        0.01,
        3 / (0.2 * 10),
        "Isola la variazione di quota nella variazione di energia.",
        r"$\Delta U=mg\Delta z\quad\Rightarrow\quad\Delta z=3/(0{,}20\cdot10)=1{,}5\,\mathrm m~Il segno positivo indica una salita nell’asse orientato verso l’alto.",
        "algebra|Dividi per l’intero prodotto mg.",
    )
    N(
        "Confronto fra due deformazioni",
        "Una molla immagazzina 0,8 J con deformazione di modulo 2 cm. Quanta energia immagazzina a 5 cm nel medesimo tratto lineare?",
        5,
        "J",
        0.02,
        0.8 * (5 / 2) ** 2,
        "La dipendenza dell’energia elastica dalla deformazione è quadratica.",
        r"$U_2/U_1=(x_2/x_1)^2=(5/2)^2=6{,}25~$U_2=0{,}8\cdot6{,}25=5{,}0\,\mathrm J~Il rapporto lunghezze è adimensionale perché entrambe sono in centimetri.",
        "modello|La forza cresce linearmente, ma l’energia è l’area sotto quella retta.",
    )
    M(
        "Spostare il livello zero",
        "Il riferimento z = 0 viene abbassato di 2 m. Per la stessa discesa in gravità uniforme, che cosa accade a ΔU gravitazionale?",
        "Resta invariata",
        "Aumenta di 2mg|Diminuisce di 2mg|Cambia segno",
        "Entrambi i valori di U usano il nuovo riferimento.",
        "Le due quote aumentano entrambe di 2 m. I due valori di U aumentano della stessa costante e questa si cancella nella differenza.",
        "concetto|Trasforma insieme la quota iniziale e quella finale.",
    )
    N(
        "Quanta energia diventa interna?",
        "Un blocco rallenta su un piano orizzontale da 20 J a 7 J di energia cinetica. Per il sistema blocco–piano isolato l’attrito è l’unica dissipazione. Quanto aumenta l’energia interna totale?",
        13,
        "J",
        0.01,
        20 - 7,
        "Confronta l’energia meccanica all’inizio e alla fine.",
        r"$\Delta E_{\rm mecc}=7-20=-13\,\mathrm J,\quad\Delta U_{\rm int}=-\Delta E_{\rm mecc}=13\,\mathrm J~La quota resta costante e la diminuzione di K ricompare nelle energie interne delle superfici.",
        "testo|Per il sistema isolato conta anche l’energia interna dei due corpi.",
    )
    M(
        "Due piste senza attrito",
        "Due piste lisce di forme diverse collegano gli stessi punti a quote diverse. Un punto parte da fermo in cima e raggiunge il fondo in entrambi i casi. Che cosa è uguale?",
        "La rapidità finale",
        "La durata della discesa|La forza normale in ogni punto|La lunghezza percorsa",
        "Quale quantità dipende soltanto dal dislivello?",
        r"$\tfrac12mv_f^2=mg(z_i-z_f)~Le due piste hanno lo stesso dislivello e quindi la stessa rapidità finale. Forma, accelerazione lungo la pista e tempi possono differire.",
        "modello|Il bilancio energetico confronta gli estremi della traiettoria.",
    )
    N(
        "Un oggetto ancora in salita",
        "Una pallina sale da una quota dove viaggia a 5 m/s a una quota più alta di 0,8 m. Senza aria e con g = 10 m/s², quale rapidità ha lì?",
        3,
        "m/s",
        0.01,
        sqrt(5**2 - 2 * 10 * 0.8),
        "La crescita di U è pagata da una diminuzione di K.",
        r"$\tfrac12mv_f^2=\tfrac12mv_i^2-mg\Delta z\quad\Rightarrow\quad v_f^2=25-2\cdot10\cdot0{,}8=9~$v_f=3\,\mathrm{m/s}~Il valore è minore della velocità iniziale e positivo: la quota è raggiungibile.",
        "algebra|Sottrai la parte di energia spesa per salire.",
    )
    T(
        "Una forza che dipende dal cammino",
        "L’attrito radente consuma energia meccanica in quantità legata alla lunghezza percorsa. Come si classifica rispetto alla conservatività?",
        "non conservativa",
        "dissipativa|forza non conservativa|non conservativo",
        "Un viaggio di andata e ritorno produce lavoro totale nullo o negativo?",
        "Su entrambe le tratte l’attrito dinamico si oppone allo scorrimento. Il lavoro resta negativo anche tornando allo stato iniziale di posizione, quindi l’attrito è non conservativo.",
        "concetto|Ragiona sul lavoro nell’intero percorso chiuso.",
    )
    N(
        "Energia necessaria a una risalita",
        "Una massa di 3 kg sale di 2 m mantenendo la stessa rapidità. Durante la salita l’attrito compie −5 J. Con g = 10 m/s², calcola il lavoro motore richiesto.",
        65,
        "J",
        0.05,
        3 * 10 * 2 + 5,
        "Il lavoro motore copre guadagno di quota e perdite.",
        r"$\Delta K=0,\quad\Delta U_g=3\cdot10\cdot2=60\,\mathrm J~$L_{\rm mot}+L_{\rm attr}=\Delta(K+U)\;\Rightarrow\;L_{\rm mot}=60-(-5)=65\,\mathrm J~Il lavoro motore supera l’aumento di energia potenziale di 5 J.",
        "modello|Includi il lavoro di entrambe le forze non conservative.",
        3,
    )
    M(
        "Trovare la tensione del filo",
        "Una massa appesa a un filo oscilla. Conosci altezza iniziale e lunghezza del filo e vuoi la tensione nel punto più basso. Quale procedimento è sufficiente se parte ferma e trascuri l’aria?",
        "Energia per la rapidità, poi secondo principio radiale",
        "Solo energia, che fornisce direttamente la tensione|Solo conservazione della quantità di moto|Imporre sempre T = mg",
        "Una forza perpendicolare al moto può avere lavoro nullo e modulo incognito.",
        r"L’energia dà la rapidità dal dislivello. Nel punto più basso l’accelerazione radiale è diretta verso il sostegno; da T − mg = mv²/r si trova la tensione.",
        "modello|Abbina una relazione fra due stati a un’equazione delle forze in un punto.",
        3,
    )
    L(
        "Impulso, urti e quantità di moto",
        "Energia, impulso ed equilibrio",
        "Quantità di moto e impulso|Conservazione della quantità di moto nei sistemi isolati",
        r"""Un urto modifica in poco tempo la velocità di due corpi. Spesso la forza cambia rapidamente e il suo massimo è difficile da osservare. La quantità di moto di un corpo è il prodotto della massa per il vettore velocità. L’impulso della risultante, cioè l’area con segno sotto la curva forza–tempo, misura il cambiamento di questa quantità.
$\vec p=m\vec v,\qquad \vec J=\Delta\vec p,\qquad \vec J=\vec F_{\rm media}\Delta t
@C1-impulso|L’area verde della pulsazione triangolare ha unità N·s, equivalenti a kg·m/s. Il picco è più alto della forza media.
Se allarghi il sistema includendo entrambi i corpi che si urtano, le forze impulsive interne si compensano a coppie. Quando l’impulso esterno totale è nullo o trascurabile durante il contatto, la quantità di moto totale resta costante. Può conservarsi una sola componente quando soltanto l’impulso esterno lungo quell’asse è trascurabile.
$m_1v_{1i}+m_2v_{2i}=m_1v_{1f}+m_2v_{2f}\quad\text{(lungo un asse)}
Assegna il segno a ogni velocità. Se dopo l’urto i due corpi restano attaccati condividono la stessa velocità, quindi a destra puoi raccogliere la somma delle masse. In un urto elastico si conserva anche l’energia cinetica totale; in un urto anelastico una parte può trasformarsi in energia interna. Comincia sempre dal sistema e dalle condizioni di isolamento, prima di cercare una formula per l’urto.""",
        (5, 7),
    )
    E(
        "Leggere una pulsazione di forza",
        2,
        "Una forza orizzontale cresce da zero a 40 N in 0,10 s, poi cala linearmente a zero in altri 0,10 s. Un carrello di 2,0 kg inizialmente fermo riceve questa forza netta. Trova la velocità finale.",
        r"""@C1-impulso|I due lati rettilinei delimitano un triangolo di base totale 0,20 s. La forza è positiva durante tutto l’intervallo.
$J=\tfrac12(0{,}20\,\mathrm s)(40\,\mathrm N)=4{,}0\,\mathrm{N\,s}
La quantità di moto iniziale è zero. La componente dell’impulso è positiva, quindi è positivo anche il cambiamento della velocità.
$J=mv_f-mv_i\quad\Rightarrow\quad v_f=J/m=4{,}0/2{,}0=2{,}0\,\mathrm{m/s}
La forza media è 20 N; usarla per 0,20 s riproduce lo stesso impulso. Usare il picco per l’intero intervallo lo raddoppierebbe.""",
    )
    E(
        "Due carrelli si agganciano",
        2,
        "Su una guida orizzontale un carrello di 2 kg viaggia a +3 m/s e incontra uno di 1 kg a −1 m/s. Si agganciano. Trascurando l’impulso esterno orizzontale, trova velocità finale e perdita di energia cinetica.",
        r"""Il sistema comprende entrambi i carrelli. La quantità di moto totale iniziale è algebrica. Dopo l’aggancio le masse hanno un’unica velocità.
$p_i=(2)(3)+(1)(-1)=5\,\mathrm{kg\,m/s},\qquad v_f=5/(2+1)=5/3\,\mathrm{m/s}
Il segno positivo indica che prevale la quantità di moto del primo carrello. Per trovare l’energia scomparsa dal moto ordinato, calcola le energie dai due lati.
$K_i=\tfrac12(2)(3)^2+\tfrac12(1)(-1)^2=9{,}5\,\mathrm J
$K_f=\tfrac12(3)(5/3)^2=25/6\,\mathrm J,\qquad K_i-K_f=16/3\,\mathrm J\simeq5{,}33\,\mathrm J
Il sistema ha conservato la quantità di moto orizzontale, mentre l’aggancio ha trasformato parte dell’energia cinetica in altre forme.""",
    )
    N(
        "Un rimbalzo lungo un asse",
        "Una pallina di 0,10 kg urta un cuscino con vᵢ = +4 m/s e rimbalza con v_f = −3 m/s. Qual è l’impulso orizzontale sulla pallina?",
        -0.7,
        "N·s",
        0.005,
        0.1 * (-3 - 4),
        "Sottrai i due vettori velocità con i loro segni.",
        r"$J_x=m(v_f-v_i)=0{,}10(-3-4)=-0{,}70\,\mathrm{N\,s}~La diminuzione di quantità di moto include l’arresto e il moto nel verso opposto.",
        "algebra|Una variazione vettoriale tiene conto del rimbalzo.",
    )
    M(
        "Stessa variazione, contatto più lungo",
        "Un carrello arriva con la stessa velocità contro due tamponi diversi e si ferma in entrambi i casi. Il secondo raddoppia il tempo di arresto. Come cambia il modulo della forza media netta?",
        "Si dimezza",
        "Raddoppia|Resta uguale|Si annulla",
        "La variazione di quantità di moto è la stessa.",
        r"$|\bar F|=|\Delta p|/\Delta t~Il numeratore è invariato, il denominatore raddoppia. La conclusione riguarda la forza media; il profilo istantaneo dipende dal tampone.",
        "modello|Distingui media temporale e picco di forza.",
    )
    N(
        "Spinta reciproca su una guida",
        "Due pattini di massa 4 kg e 6 kg, inizialmente fermi su una guida liscia, si separano per una molla interna. Il pattino da 4 kg va a +3 m/s. Trova la velocità dell’altro.",
        -2,
        "m/s",
        0.01,
        -4 * 3 / 6,
        "La quantità di moto totale iniziale è zero.",
        r"$0=4\cdot3+6v_2\quad\Rightarrow\quad 6v_2=-12\quad\Rightarrow\quad v_2=-2\,\mathrm{m/s}~I due contributi finali hanno moduli uguali e versi opposti.",
        "concetto|La quantità di moto totale nulla permette quantità individuali non nulle.",
    )
    N(
        "Catturare un piccolo peso",
        "Un vassoio di 1,5 kg viaggia a 2 m/s su una guida liscia. Da sopra cade verticalmente un peso di 0,5 kg e vi resta appoggiato. Qual è la velocità orizzontale comune?",
        1.5,
        "m/s",
        0.01,
        1.5 * 2 / (1.5 + 0.5),
        "Considera l’impulso esterno solo lungo la guida.",
        r"$m_1v_i=(m_1+m_2)v_f\quad\Rightarrow\quad v_f=(1{,}5\cdot2)/(1{,}5+0{,}5)=1{,}5\,\mathrm{m/s}~Il peso entrante ha quantità di moto orizzontale nulla. La guida può invece esercitare un impulso verticale.",
        "modello|È sufficiente l’isolamento nella direzione che stai studiando.",
        3,
    )
    M(
        "Energia di due quantità di moto uguali",
        "Due corpi hanno quantità di moto dello stesso modulo. Quale ha maggiore energia cinetica?",
        "Il corpo di massa minore",
        "Il corpo di massa maggiore|Hanno energie uguali per definizione|Dipende solo dal verso delle velocità",
        "Esprimi K usando p e m.",
        r"$K=\tfrac12m(p/m)^2=p^2/(2m)~A p fissato il corpo più leggero deve muoversi più velocemente e ha maggiore energia cinetica.",
        "algebra|Prima del confronto fissa esplicitamente quale grandezza è comune.",
    )
    T(
        "Urto con energia cinetica conservata",
        "Come si chiama un urto nel quale l’energia cinetica totale del sistema isolato ha lo stesso valore prima e dopo?",
        "elastico",
        "urto elastico",
        "La quantità di moto si conserva anche in altri urti isolati.",
        "La conservazione dell’energia cinetica totale definisce l’urto elastico. Le energie dei singoli corpi possono cambiare per scambio fra di essi.",
        "concetto|Considera la somma delle energie dei corpi.",
    )
    N(
        "Una forza media negativa",
        "Una risultante media di −3 N agisce per 0,60 s su un corpo che possiede inizialmente quantità di moto +2,5 kg·m/s. Trova la componente finale.",
        0.7,
        "kg·m/s",
        0.005,
        2.5 - 3 * 0.6,
        "Aggiungi l’impulso alla quantità di moto iniziale.",
        r"$J=(-3)(0{,}60)=-1{,}8\,\mathrm{N\,s},\qquad p_f=p_i+J=2{,}5-1{,}8=0{,}7\,\mathrm{kg\,m/s}~Il corpo rallenta e continua nel verso positivo.",
        "algebra|L’impulso è una variazione, non il valore finale.",
    )
    M(
        "Scegliere il sistema nell’urto",
        "Due biglie collidono su un tavolo liscio. Durante il contatto quale sistema ha quantità di moto orizzontale conservata?",
        "Le due biglie prese insieme",
        "Ogni biglia separatamente in ogni momento|Soltanto la biglia più leggera|Soltanto la biglia che si muoveva inizialmente",
        "Le forze reciproche diventano interne scegliendo un contorno adeguato.",
        "Ciascuna biglia subisce l’impulso dell’altra. I due impulsi si cancellano nella somma riferita al sistema delle due biglie, se l’impulso esterno orizzontale è trascurabile.",
        "testo|Controlla se l’altra biglia sta dentro o fuori dal sistema.",
    )
    N(
        "Forza media da un cambio di direzione",
        "Un carrellino di massa 0,5 kg cambia velocità da (2, 0) m/s a (0, 2) m/s durante 0,5 s. Trova il modulo della risultante media.",
        2.828,
        "N",
        0.01,
        0.5 * sqrt(2**2 + 2**2) / 0.5,
        "Trova separatamente le componenti della variazione.",
        r"$\Delta\vec v=(-2,2)\,\mathrm{m/s},\quad |\Delta\vec v|=\sqrt8\,\mathrm{m/s}~$|\bar F|=m|\Delta\vec v|/\Delta t=(0{,}5/0{,}5)\sqrt8\,\mathrm N\simeq2{,}83\,\mathrm N~Il modulo di v resta 2 m/s, ma il vettore cambia direzione.",
        "concetto|Sottrai i vettori prima di calcolare il modulo.",
        3,
    )
    M(
        "Trovare la forza in un grafico p–t",
        "La componente pₓ cresce linearmente da 0 a un valore positivo. Quale informazione fornisce la pendenza della retta pₓ–t?",
        "La componente della forza risultante",
        "L’energia cinetica|La massa|Il lavoro totale",
        "Confronta Δp con Δt.",
        r"$\bar F_x=\Delta p_x/\Delta t~Una pendenza costante rappresenta una risultante costante. Le unità (kg·m/s)/s si riducono a newton.",
        "unità|Controlla le unità della pendenza.",
    )
    L(
        "Il centro di massa e le leve",
        "Energia, impulso ed equilibrio",
        "Centro di massa e suo moto|Corpo rigido|Momento torcente|Equilibrio rotazionale|Leve nel corpo umano",
        r"""Un insieme di corpi può ruotare o deformarsi al suo interno mentre il suo centro di massa avanza. In una dimensione la posizione di questo punto è la media delle coordinate pesata con le masse. In più dimensioni usa la stessa costruzione su ciascun asse. In un sistema a massa totale costante l’accelerazione del centro di massa dipende dalla risultante delle forze esterne.
$x_{\rm CM}=\frac{\sum_i m_ix_i}{\sum_i m_i},\qquad M\vec a_{\rm CM}=\sum\vec F_{\rm est}
In un corpo rigido ideale le distanze reciproche fra i punti restano costanti. Per tenerlo fermo devi impedire sia la traslazione sia la rotazione. Una forza che agisce lontano dall’asse può far ruotare il corpo. Il braccio b è la distanza perpendicolare fra asse e retta d’azione della forza.
@C1-leva|Nell’avambraccio idealizzato O è il gomito. In questo schema le forze sono verticali e i bracci coincidono con le distanze orizzontali da O.
$\vec\tau=\vec r\times\vec F,\quad |\tau|=rF\sin\alpha=Fb,\qquad [\tau]=\mathrm{N\,m}
Scegli una convenzione, per esempio momento antiorario positivo. Per l’equilibrio di un corpo rigido nel piano, imponi entrambe le componenti della somma delle forze nulle e la somma algebrica dei momenti nulla. Scegliere come polo una cerniera elimina il momento della sua reazione, perché la retta d’azione passa per il polo.
$\sum F_x=0,\qquad \sum F_y=0,\qquad \sum\tau_O=0
Nelle leve del corpo umano i bracci muscolari possono essere brevi rispetto al braccio del carico. In un modello statico questo richiede una forza muscolare grande. Geometria, direzione del tendine e peso proprio degli arti determinano l’applicabilità quantitativa a un caso reale.""",
        (2, 5, 9),
    )
    E(
        "Un avambraccio in equilibrio",
        2,
        "Un avambraccio orizzontale ideale, di peso trascurabile, sostiene un carico di 18 N a 0,30 m dal gomito. Il muscolo tira verticalmente a 0,045 m dal gomito. Calcola forza muscolare e reazione verticale al gomito.",
        r"""@C1-leva|Usa il gomito O come polo. Il carico tende a ruotare in senso orario, la forza muscolare in senso antiorario. I bracci sono schematici.
Scegli l’antiorario positivo. La reazione al gomito passa per O e in questa equazione non compare.
$F_m(0{,}045)-18(0{,}30)=0\;\Rightarrow\;F_m=5{,}4/0{,}045=120\,\mathrm N
Per le forze scegli l’alto positivo. Il carico è verso il basso e la forza muscolare verso l’alto.
$R_y+120-18=0\quad\Rightarrow\quad R_y=-102\,\mathrm N
Nel modello il gomito spinge verso il basso. La grande forza del muscolo compensa il suo breve braccio; i momenti opposti valgono entrambi 5,4 N·m.""",
    )
    E(
        "Dov’è il punto di equilibrio?",
        2,
        "Due masse puntiformi, 3 kg in x = −0,20 m e 1 kg in x = +0,60 m, sono fissate su un’asta leggera. Trova il centro di massa e spiega dove porre un sostegno puntiforme per bilanciarla orizzontalmente.",
        r"""Misura le coordinate dalla stessa origine e considera trascurabile la massa dell’asta. In gravità uniforme il peso totale si può applicare al centro di massa per valutare il momento gravitazionale.
$x_{\rm CM}=\frac{3(-0{,}20)+1(+0{,}60)}{3+1}\,\mathrm m=0\,\mathrm m
Il sostegno va posto nell’origine. A sinistra la massa è tre volte maggiore ma il suo braccio è un terzo. Verifica i momenti prendendo g = 10 m/s².
$|\tau_{\rm sin}|=(30)(0{,}20)=6\,\mathrm{N\,m},\qquad |\tau_{\rm des}|=(10)(0{,}60)=6\,\mathrm{N\,m}
I versi sono opposti e il momento totale è nullo. Il sostegno deve anche fornire la forza verticale che sostiene il peso complessivo.""",
    )
    N(
        "Spostare il centro di massa",
        "Due masse puntiformi di 1 kg e 3 kg si trovano rispettivamente in x = 0 e x = 0,80 m. Calcola la coordinata del centro di massa.",
        0.60,
        "m",
        0.002,
        (1 * 0 + 3 * 0.8) / 4,
        "Pesa ogni posizione con la massa che si trova lì.",
        r"$x_{\rm CM}=(1\cdot0+3\cdot0{,}80)/(1+3)=2{,}4/4=0{,}60\,\mathrm m~Il risultato si trova fra le masse e più vicino a quella maggiore.",
        "modello|La media aritmetica delle posizioni vale per masse uguali.",
    )
    M(
        "Distanza corretta per il momento",
        "Una forza inclinata agisce a distanza r dal perno. Quale lunghezza va moltiplicata per il modulo F per ottenere il modulo del momento?",
        "La distanza perpendicolare dal perno alla retta d’azione",
        "Sempre la distanza r|La lunghezza della forza disegnata|La distanza percorsa dal perno",
        "Prolunga la retta lungo la quale agisce la forza.",
        r"$|\tau|=F r\sin\alpha=Fb~La perpendicolare alla retta d’azione individua il braccio efficace. Si ha b = r soltanto se forza e raggio sono perpendicolari.",
        "concetto|Traccia prima la retta d’azione, poi la perpendicolare dal polo.",
    )
    N(
        "Forza inclinata sulla maniglia",
        "Si spinge una maniglia a 0,40 m dalla cerniera con 15 N. L’angolo fra raggio e forza è 30°. Ricava il modulo del momento.",
        3,
        "N·m",
        0.01,
        0.4 * 15 * 0.5,
        "Serve la componente della forza perpendicolare al raggio.",
        r"$|\tau|=rF\sin30^\circ=0{,}40\cdot15\cdot0{,}5=3{,}0\,\mathrm{N\,m}~La componente diretta lungo il raggio ha retta d’azione passante per la cerniera e momento nullo.",
        "modello|Il prodotto vettoriale usa il seno dell’angolo.",
    )
    M(
        "Una coppia di forze",
        "Due forze parallele e opposte di uguale modulo agiscono su rette distinte nel piano di un corpo rigido. Quale comportamento producono da sole?",
        "Risultante nulla e momento totale non nullo",
        "Risultante e momento entrambi nulli|Traslazione senza rotazione|Risultante doppia di una forza",
        "Scegli il polo sulla retta della prima forza.",
        "Le forze si elidono nella somma vettoriale. Rispetto al polo scelto la prima ha momento nullo, la seconda ha braccio pari alla distanza tra le rette. Rimane una tendenza a ruotare.",
        "concetto|L’annullamento delle forze non garantisce l’annullamento dei momenti.",
    )
    N(
        "Reazione alla seconda estremità",
        "Una trave orizzontale leggera lunga 2,0 m è poggiata ai due estremi. Un peso di 30 N è a 0,50 m dall’appoggio sinistro. Calcola la reazione verticale dell’appoggio destro.",
        7.5,
        "N",
        0.01,
        30 * 0.50 / 2,
        "Prendi i momenti rispetto all’appoggio sinistro.",
        r"$R_D(2{,}0)-30(0{,}50)=0\quad\Rightarrow\quad R_D=15/2{,}0=7{,}5\,\mathrm N~L’appoggio sinistro sostiene i restanti 22,5 N perché il peso è più vicino a sinistra.",
        "modello|Ferma il disegno e misura entrambi i bracci dallo stesso polo.",
    )
    N(
        "Il moto del sistema intero",
        "Un sistema di tre carrelli di massa totale 12 kg subisce una risultante esterna orizzontale di 18 N. Qual è l’accelerazione del centro di massa?",
        1.5,
        "m/s²",
        0.01,
        18 / 12,
        "Considera la massa totale dentro il contorno.",
        r"$Ma_{\rm CM}=F_{\rm est}\quad\Rightarrow\quad a_{\rm CM}=18/12=1{,}5\,\mathrm{m/s^2}~Le forze interne possono accelerare diversamente i carrelli e si compensano nella somma totale.",
        "modello|Usa la massa complessiva se cerchi il moto del centro di massa.",
    )
    T(
        "Il modello indeformabile",
        "Come si chiama il modello di un corpo nel quale la distanza fra ogni coppia di punti materiali resta costante?",
        "corpo rigido",
        "rigido|solido rigido",
        "Il corpo può traslare o ruotare preservando la sua forma.",
        "Un corpo rigido conserva le distanze interne durante il moto. Questa idealizzazione permette di descrivere insieme equilibrio traslazionale e rotazionale.",
        "concetto|Una forma rigida può cambiare orientamento nello spazio.",
    )
    M(
        "Equilibrio con fulcro diverso",
        "Un corpo è fermo e in equilibrio con risultante esterna nulla e momento totale nullo rispetto al punto O. Che cosa vale rispetto a un altro punto fisso del piano?",
        "Il momento totale è ancora nullo",
        "Il momento totale raddoppia|Il momento si annulla solo presso il centro di massa|Il momento dipende dalla massa del polo",
        "Traslare il polo modifica il momento complessivo di un termine legato alla risultante.",
        "Spostando il polo, tutti i bracci vettoriali cambiano dello stesso vettore. La correzione al momento totale è il prodotto vettoriale di tale vettore con la somma delle forze, che qui è zero.",
        "concetto|Usa entrambe le condizioni dichiarate nel testo.",
        3,
    )
    N(
        "Che cosa succede piegando il gomito?",
        "In un modello di leva il momento resistente sul gomito resta 6,0 N·m. Il braccio perpendicolare della forza muscolare passa da 3 cm a 4 cm. Di quanti newton diminuisce la forza richiesta in equilibrio?",
        50,
        "N",
        0.1,
        6 / 0.03 - 6 / 0.04,
        "Calcola la forza richiesta per ciascun braccio e poi la differenza.",
        r"$F_1=6{,}0/0{,}030=200\,\mathrm N,\quad F_2=6{,}0/0{,}040=150\,\mathrm N~$F_1-F_2=50\,\mathrm N~Il braccio più lungo rende sufficiente una forza minore per lo stesso momento.",
        "unità|Converti i bracci in metri prima di usare il momento in N·m.",
    )
    M(
        "Il segno di una rotazione",
        "Una trave con fulcro all’estremità sinistra si estende verso destra. Una forza verticale verso il basso è applicata all’estremità destra. Se antiorario è positivo, che segno ha il momento?",
        "Negativo",
        "Positivo|Nullo per ogni forza verticale|Dipende dalla massa della trave",
        "Immagina l’estremità destra libera di abbassarsi.",
        "L’estremità destra tenderebbe a scendere ruotando in senso orario. Il momento ha segno negativo nella convenzione assegnata.",
        "testo|Scegli il segno guardando il verso di rotazione attorno al polo.",
        1,
    )
