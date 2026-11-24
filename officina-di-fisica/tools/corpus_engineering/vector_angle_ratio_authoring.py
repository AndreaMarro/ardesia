"""Sixteen authored tasks on slope, exact right triangles and identifiability."""
from .vector_geometry_authoring import assemble_family, write_family

TASKS = [
("Una direzione a quarantacinque gradi", "Uno spostamento nel primo quadrante ha componente orizzontale a=2 m e verticale b=2 m. θ è misurato da +x. Quanto vale T=tanθ? Si chiede il rapporto, non l’angolo in gradi.", 1,
 "Le due componenti formano i cateti di un triangolo rettangolo: rispetto a θ, b è il cateto opposto e a quello adiacente. La tangente è il rapporto opposto/adiacente. Componenti uguali danno un triangolo rettangolo isoscele e un angolo di 45°, ma per T basta una divisione.",
 r"T=\frac ba\qquad T=\frac{2\,\mathrm m}{2\,\mathrm m}=1",
 "I metri si cancellano e la tangente è un numero puro. Sommare le componenti darebbe quattro metri, che non descrivono una direzione; applicare Pitagora darebbe invece il modulo dello spostamento. Raddoppiare entrambe le componenti lascia il rapporto uguale a uno.", "Individua il cateto opposto e quello adiacente all’angolo dato."),
("La pendenza non è una lunghezza", "Un vettore nel primo quadrante ha componenti a e b espresse entrambe in metri. Quale unità è compatibile con T=b/a=tanθ?", ["m", "m²", "1", "m/s", "grado"],
 "La tangente confronta due componenti della stessa grandezza. Prima di dividere le esprimiamo nella stessa unità; poi l’unità al numeratore si semplifica con quella al denominatore. Il rapporto determina una direzione e non dipende dalla scala scelta per disegnare il vettore.",
 r"[T]=\frac{L}{L}=1",
 "La risposta è 1. Metri e metri quadrati attribuirebbero una dimensione a un rapporto fra lunghezze; m/s richiederebbe un tempo al denominatore. Il grado esprime l’angolo θ, mentre qui si chiede la sua tangente: θ e tanθ sono oggetti differenti.", "Cancella l’unità comune delle due componenti."),
("Il triangolo tre, quattro, cinque", "In un triangolo rettangolo l’ipotenusa misura 5 cm e il cateto opposto a un angolo acuto θ misura 3 cm. Quale coppia dà, nell’ordine, sinθ e cosθ?", ["4/5 e 3/5", "3/4 e 4/3", "3/5 e 4/5", "9/25 e 16/25", "3 e 4"],
 "Il seno è il cateto opposto diviso per l’ipotenusa. Per il coseno manca il cateto adiacente: Pitagora dà il suo quadrato come 5²−3²=25−9=16, quindi quel cateto misura quattro centimetri. Scegliamo la radice positiva perché è una lunghezza.",
 r"a^2=(5\,\mathrm{cm})^2-(3\,\mathrm{cm})^2=16\,\mathrm{cm^2}\qquad a=4\,\mathrm{cm}\qquad \sin\theta=\frac35\qquad \cos\theta=\frac45",
 "I rapporti sono adimensionali e positivi. La coppia 4/5,3/5 scambia opposto e adiacente; 3/4,4/3 divide i cateti tra loro invece di usare l’ipotenusa. 9/25 e 16/25 sono i quadrati dei rapporti. Tre e quattro sono lunghezze numeriche, troppo grandi per seni o coseni. Il controllo è (3/5)²+(4/5)²=1.", "Trova prima il cateto mancante con 25−9=16."),
("Allungare la componente orizzontale", "Uno spostamento resta nel primo quadrante. La componente orizzontale passa da a₁=2 m ad a₂=4 m, mentre la verticale resta b=2 m. Come cambia T=b/a?", ["Raddoppia da 1 a 2", "Si dimezza da 1 a 1/2", "Resta 1", "Quadruplica", "Diventa negativa"],
 "L’aumento riguarda il denominatore del rapporto, mentre il numeratore resta fisso. La freccia diventa meno ripida: a pari altezza, la base è doppia. La tangente deve quindi diminuire, e la divisione dei due casi quantifica quanto.",
 r"T_1=\frac22=1\qquad T_2=\frac24=\frac12\qquad \frac{T_2}{T_1}=\frac12",
 "La tangente si dimezza. Il rapporto cresce se cresce b a parità di a, non se cresce soltanto a. La positività delle due componenti impedisce una tangente negativa. Il modulo dello spostamento aumenta, ma la sua pendenza diminuisce: modulo e direzione rispondono a domande diverse.", "Guarda quale componente compare al denominatore."),
("Ricostruire la base", "Uno spostamento nel primo quadrante ha T=tanθ=1 e componente verticale b=2 m. Quanto vale la componente orizzontale a, in metri?", 2,
 "Dalla definizione T=b/a moltiplichiamo entrambi i membri per a, positivo, e otteniamo Ta=b. Poi dividiamo per T, anch’esso non nullo. Una tangente uguale a uno indica che i due cateti devono avere la stessa lunghezza.",
 r"T=\frac ba\qquad Ta=b\qquad a=\frac bT\qquad a=\frac{2\,\mathrm m}{1}=2\,\mathrm m",
 "Rimettendo a nel rapporto si ottiene 2 m/2 m=1. Il dato T determina il rapporto fra componenti; il dato b fissa anche la scala del triangolo. Senza b non si potrebbe ricavare una lunghezza soltanto da un angolo.", "Moltiplica per a prima di dividere per T."),
("Ricostruire l’altezza", "Uno spostamento nel primo quadrante ha componente orizzontale a=2 m e T=tanθ=1. Quanto vale la componente verticale b, in metri?", 2,
 "Per isolare il numeratore b nella relazione T=b/a basta moltiplicare entrambi i membri per a. La tangente è adimensionale: il prodotto Ta ha la stessa unità della componente orizzontale, cioè metri, come deve avere anche b.",
 r"Ta=\frac ba\,a=b\qquad b=1\times2\,\mathrm m=2\,\mathrm m",
 "Il controllo dà b/a=2 m/2 m=1. Qui dividere a per T darebbe lo stesso numero soltanto perché T vale uno; la formula corretta resta b=Ta. Per esempio, con T=2 e a=2 m servirebbe b=4 m, non un metro.", "Elimina il denominatore moltiplicando per a."),
("Aumentare la salita", "Due spostamenti nel primo quadrante hanno a₁=a₂=2 m. Le componenti verticali sono b₁=2 m e b₂=4 m. Quanto vale T₂/T₁, con T=b/a?", ["1/2", "1", "2", "4", "8"],
 "La base del triangolo non cambia e l’altezza raddoppia. La tangente, cioè altezza divisa per base, passa da uno a due. Nel confronto fra le due tangenti possiamo anche semplificare la componente orizzontale comune.",
 r"T_1=\frac22=1\qquad T_2=\frac42=2\qquad \frac{T_2}{T_1}=2",
 "Il rapporto è due. Quattro è la componente verticale finale in metri, non la sua pendenza; un mezzo è il rapporto nel verso inverso. Una tangente può superare uno: questo significa un angolo acuto maggiore di 45°, mentre il limite di valore uno riguarda seno e coseno.", "A base costante la pendenza segue direttamente l’altezza."),
("L’errore su una tangente", "Uno spostamento nel primo quadrante ha a=b=2 m. Una soluzione propone T_proposto=2. Quanto vale lo scarto con segno T_proposto−b/a?", ["−1", "0", "+1", "+2", "+4"],
 "Il valore corretto è il rapporto fra due componenti uguali, quindi uno. La proposta due sembra confondere una componente numerica con il rapporto fra componenti. Lo scarto richiesto confronta due numeri puri e segue l’ordine proposto meno corretto.",
 r"T=\frac{2\,\mathrm m}{2\,\mathrm m}=1\qquad e=2-1=+1",
 "La proposta sovrastima di uno. −1 invertirebbe l’ordine della sottrazione; zero ignorerebbe la differenza fra la componente e la tangente; +2 ripeterebbe la proposta invece di calcolarne l’errore. Lo scarto non va espresso in metri perché anche T è adimensionale.", "Calcola il rapporto prima della sottrazione."),
("L’inversa della pendenza", "Uno spostamento nel primo quadrante soddisfa T=b/a, con a,b,T>0. Si conoscono T e b. Quale formula ricava la componente orizzontale a?", ["a=bT", "a=T/b", "a=b/T", "a=T−b", "a=√(b/T)"],
 "L’incognita è inizialmente al denominatore. Moltiplichiamo l’uguaglianza per a e poi dividiamo per T. Entrambe le operazioni sono lecite nel dominio positivo. È utile scrivere la tappa Ta=b: evita di invertire a memoria il rapporto sbagliato.",
 r"T=\frac ba\qquad Ta=b\qquad a=\frac bT",
 "Sostituendo l’inversa, b/(b/T)=T. Il rapporto b/T conserva i metri di b; T/b avrebbe dimensione di lunghezza inversa. T−b sottrarrebbe un numero puro e una lunghezza. Non serve una radice perché a compare alla prima potenza dopo aver eliminato il denominatore.", "Porta l’incognita fuori dal denominatore con la stessa moltiplicazione sui due membri."),
("La pendenza confronta due fattori", "In una prima prova T₁=b/a, con a,b>0. Nella seconda a₂=κ₁a e b₂=κ₂b, con κ₁,κ₂>0. Quale espressione dà T₂/T₁?", ["κ₁κ₂", "κ₁/κ₂", "κ₂/κ₁", "κ₁+κ₂", "κ₂−κ₁"],
 "Sostituiamo le nuove componenti nello stesso rapporto verticale/orizzontale. κ₂ moltiplica il numeratore e κ₁ il denominatore. Il rapporto fra le tangenti elimina poi b/a e lascia il rapporto dei fattori, nell’ordine verticale su orizzontale.",
 r"T_2=\frac{\kappa_2b}{\kappa_1a}=\frac{\kappa_2}{\kappa_1}T_1\qquad \frac{T_2}{T_1}=\frac{\kappa_2}{\kappa_1}",
 "Se entrambi i fattori sono uguali la pendenza resta invariata: il vettore cambia modulo conservando la direzione. Il prodotto dei fattori non rispetterebbe questo controllo; il rapporto inverso scambierebbe orizzontale e verticale. Somma e differenza falliscono già con κ₁=κ₂=1, quando il rapporto corretto è uno.", "Mantieni l’ordine verticale su orizzontale anche per i fattori."),
("Più lungo, ma meno ripido", "Nella prima prova uno spostamento ha a₁=b₁=2 m; nella seconda a₂=6 m e b₂=4 m. Entrambi sono nel primo quadrante. Quanto vale T₂/T₁?", ["2/3", "3/2", "2", "3", "6"],
 "La componente orizzontale triplica e quella verticale raddoppia. La pendenza riceve quindi un fattore due al numeratore e tre al denominatore. La nuova freccia ha componenti entrambe maggiori ma è meno inclinata rispetto a +x.",
 r"T_1=\frac22=1\qquad T_2=\frac46=\frac23\qquad \frac{T_2}{T_1}=\frac23",
 "Il risultato esatto è due terzi: basta semplificare quattro sesti dividendo per due. Tre mezzi sarebbe il rapporto inverso. Due e tre isolerebbero un solo cambiamento; sei moltiplicherebbe i fattori come se T fosse un prodotto, mentre è un quoziente.", "Dividi il fattore verticale due per il fattore orizzontale tre."),
("Media delle pendenze", "Due spostamenti nel primo quadrante hanno componenti (a,b)=(2 m,2 m) e (6 m,4 m). Le due prove hanno lo stesso peso. Qual è la media aritmetica delle due tangenti T=b/a?", ["2/3", "3/4", "5/6", "1", "5/3"],
 "Prima calcoliamo le due tangenti: uno e due terzi. Per sommarle esprimiamo uno come tre terzi, ottenendo cinque terzi; la divisione per due dà cinque sesti. Tutto il conto usa frazioni esatte e non richiede angoli né decimali.",
 r"\overline T=\frac{1+2/3}{2}=\frac{3/3+2/3}{2}=\frac56",
 "Cinque sesti è compreso fra due terzi e uno, come deve essere una media con pesi positivi. Il rapporto delle componenti medie darebbe 3 m/4 m=3/4: è un altro procedimento. Cinque terzi è la somma delle tangenti prima di dividere per due.", "Porta uno e due terzi allo stesso denominatore."),
("Compensare una base tripla", "Uno spostamento ha inizialmente a₁=b₁=2 m. Si impone a₂=6 m e si vuole T₂=(2/3)T₁, sempre nel primo quadrante. Quale rapporto b₂/b₁ occorre?", 2,
 "La componente orizzontale triplica e da sola dividerebbe la tangente per tre. Per ottenere due terzi della tangente iniziale, l’altezza deve fornire il fattore due che manca. Ricaviamo il rapporto incognito dalla legge dei fattori senza cercare l’angolo.",
 r"\frac{T_2}{T_1}=\frac{b_2/b_1}{a_2/a_1}\qquad \frac23=\frac{b_2/b_1}{3}\qquad \frac{b_2}{b_1}=2",
 "La nuova componente verticale vale quattro metri. Il controllo dà T₂=4/6=2/3, mentre T₁=1. Moltiplicare il rapporto richiesto per tre annulla la divisione dovuta alla base; dividerlo ancora per tre conterebbe due volte lo stesso effetto.", "Moltiplica per tre per compensare il nuovo denominatore."),
("Tarare una misura di pendenza", "Un display mostra S=gT con g>0 costante e nessun offset; S conta tacche e T=b/a. Il riferimento a=b=2 m dà S=3. Una prova nuova dà S=2 e b=4 m. Quanto vale a, in metri?", 6,
 "Il riferimento ha T=1, quindi il guadagno è tre. La lettura due corrisponde alla tangente T=2/3. Per ricavare la base dalla relazione T=b/a usiamo a=b/T: dividere per due terzi equivale a moltiplicare per tre mezzi.",
 r"g=\frac31=3\qquad T=\frac23\qquad a=\frac{4\,\mathrm m}{2/3}=4\,\mathrm m\times\frac32=6\,\mathrm m",
 "Possiamo semplificare quattro con due prima di moltiplicare per tre. Il controllo completo è S=3·(4 m/6 m)=2. T e S sono adimensionali ma hanno ruoli differenti: il fattore di taratura deve essere rimosso prima di interpretare la lettura come pendenza.", "Correggi il display, poi inverti il rapporto geometrico."),
("Una taratura con offset", "Un display segue S=gT+d, con g,d costanti, S conteggio e T=b/a. I riferimenti (a,b,S) sono (2 m,2 m,3) e (6 m,4 m,7/3). Una prova dà S=2 e b=2 m. Quanto vale a?", ["1 m", "2 m", "3 m", "4 m", "6 m"],
 "I riferimenti hanno tangenti uno e due terzi. La differenza di lettura è 7/3−3=−2/3; la differenza di tangente è 2/3−1=−1/3. Dividendo due numeri negativi otteniamo il guadagno positivo due. Dal primo riferimento d=3−2·1=1. Ora correggiamo la lettura ignota.",
 r"g=\frac{-2/3}{-1/3}=2\qquad d=1\qquad T=\frac{2-1}{2}=\frac12\qquad a=\frac{2\,\mathrm m}{1/2}=4\,\mathrm m",
 "Il controllo è S=2·(2 m/4 m)+1=2. Due metri ripeterebbe il cateto verticale senza ricostruire quello orizzontale; tre e sei potrebbero emergere mescolando la taratura con il rapporto geometrico. Un rapporto di sole letture non elimina l’offset: serve prima la differenza dei riferimenti.", "Usa le differenze, anche quando entrambe sono negative."),
("Una direzione non fissa la scala", "Uno spostamento nel primo quadrante ha componenti positive con vincolo a=b. Si misura anche T=b/a=1. Quante coppie (a,b) soddisfano questi dati? Non è assegnato il modulo dello spostamento.", ["Nessuna coppia", "Una sola: (1 m,1 m)", "Due coppie", "Infinite coppie positive con a=b", "Una sola: (2 m,2 m)"],
 "Il vincolo a=b rende T=b/b=1 per qualsiasi b positivo. La misura della tangente ripete quindi la stessa informazione del vincolo: non aggiunge un dato indipendente sulla scala. Possiamo scegliere liberamente una lunghezza positiva λ e porre a=b=λ.",
 r"a=b=\lambda>0\qquad T=\frac{\lambda}{\lambda}=1",
 "Esistono infinite coppie: per esempio (1 m,1 m), (2 m,2 m) e ogni loro moltiplo positivo. Tutte hanno direzione a 45° ma moduli diversi. Le alternative che fissano una o due coppie aggiungono una lunghezza assente nel testo; nessuna coppia ignorerebbe gli esempi espliciti. Un modulo noto aggiungerebbe invece un vincolo indipendente.", "Prova due scale diverse che conservino lo stesso rapporto.")
]
CHOICES={2:2,3:2,4:1,7:2,8:2,9:2,10:2,11:0,12:2,15:3,16:3}
UNITS={5:"m",6:"m",14:"m"}
FIGURES={3:"Tre tappe dall’alto: individua ipotenusa cinque e cateto opposto tre; ricava il cateto adiacente quattro con Pitagora; dividi entrambi i cateti per la stessa ipotenusa. La figura usa una scala comune sui due assi, 40 pixel per centimetro."}

def assemble(repo,source_ref):
    return assemble_family(repo,source_ref,"vector-angle-ratio",TASKS,CHOICES,UNITS,"vector-angle-ratio-progressive.svg",FIGURES,2180)

if __name__ == "__main__":
    write_family(assemble,"vector-angle-ratio-009")
