"""Sixteen authored projections: orientation, exact cosines and measurement inversion."""
from .vector_geometry_authoring import assemble_family, write_family

TASKS = [
("L’ombra sull’asse", "Uno spostamento ha modulo R=4 m e forma un angolo θ=60° con il verso positivo dell’asse x. Usa cos60°=1/2. Quanto vale la componente orientata P lungo x, in metri?", 2,
 "La componente è la proiezione ortogonale del vettore sull’asse. Nel triangolo rettangolo il modulo R è l’ipotenusa e P è il cateto adiacente all’angolo con +x. Per definizione del coseno, P/R=cosθ. Il coseno positivo garantisce che la componente punti verso +x.",
 r"P=R\cos\theta\qquad P=4\,\mathrm m\times\frac12=2\,\mathrm m",
 "Basta prendere metà di quattro: due metri. La componente è minore del modulo, come deve essere per un angolo acuto. Usare il seno sceglierebbe il cateto perpendicolare all’asse, mentre usare direttamente R ignorerebbe l’inclinazione del vettore.", "Individua l’ipotenusa e il cateto adiacente all’angolo."),
("Le unità della componente", "Un vettore spostamento è misurato in metri. Quale unità è compatibile con la sua componente lungo un asse cartesiano?", ["m", "m²", "1", "m/s", "N"],
 "Proiettare un vettore cambia il suo valore lungo una direzione ma non la natura della grandezza fisica. Il fattore cosθ è un numero puro. Perciò P=R cosθ conserva la dimensione di lunghezza di R: anche le componenti dello spostamento si misurano in metri.",
 r"[P]=[R][\cos\theta]=L\times1=L",
 "Il metro è la scelta adatta. m² sarebbe un’area e m/s una velocità; nessuna delle due nasce dalla proiezione. 1 è l’unità del coseno, non dello spostamento proiettato. N misurerebbe una forza: componenti di forze avrebbero newton, componenti di spostamenti hanno metri.", "Il coseno modifica il numero, senza introdurre una nuova unità."),
("La componente oltre novanta gradi", "Uno spostamento di modulo 10 m forma un angolo di 120° con +x. Usa cos120°=−1/2. Qual è la componente orientata P lungo x?", ["+5 m", "−5 m", "+10 m", "−10 m", "0 m"],
 "L’angolo è misurato dal verso positivo dell’asse. A 120° la freccia cade nella metà del piano con x negativo. La proiezione conserva questo segno: P=R cosθ, non il valore assoluto di quel prodotto. Il modulo R resta invece sempre non negativo.",
 r"P=10\,\mathrm m\times\left(-\frac12\right)=-5\,\mathrm m",
 "La risposta è −5 m: cinque metri nel verso −x. +5 m sarebbe il modulo della componente e perderebbe l’orientazione. ±10 m richiederebbero un vettore parallelo all’asse; zero richiederebbe un angolo di 90°, non 120°. Il segno negativo non rende negativo il modulo dello spostamento.", "Localizza prima il vettore rispetto al verso +x."),
("Stessa direzione, modulo doppio", "Due spostamenti hanno lo stesso angolo acuto θ con +x, con cosθ=1/2. Il modulo passa da R₁=4 m a R₂=8 m. Come cambia la componente P?", ["Raddoppia da 2 m a 4 m", "Quadruplica da 2 m a 8 m", "Resta 2 m", "Si dimezza", "Diventa nulla"],
 "A direzione fissata il coseno resta uguale. La relazione P=Rc è lineare rispetto a R: moltiplicare R per due moltiplica P per due. Si allunga la freccia senza ruotarla, e anche la sua ombra sull’asse raddoppia.",
 r"P_1=4\,\mathrm m\times\frac12=2\,\mathrm m\qquad P_2=8\,\mathrm m\times\frac12=4\,\mathrm m",
 "La componente aumenta di due metri e il rapporto P₂/P₁ vale due. Il quadruplicamento introdurrebbe un secondo raddoppio assente nei dati. Restare uguale richiederebbe un coseno dimezzato, cioè una rotazione; diventare nulla richiederebbe un vettore perpendicolare all’asse.", "Mantieni c=1/2 anche nella seconda prova."),
("Dalla proiezione al modulo", "Uno spostamento forma un angolo acuto con +x, con c=cosθ=1/2. La componente P lungo x è 2 m. Quanto vale il modulo R, in metri?", 4,
 "Con P=Rc l’incognita R è moltiplicata per il coseno. Dividiamo entrambi i membri per c, che è non nullo. Dividere per un mezzo equivale a moltiplicare per due: il modulo deve superare la componente perché il vettore non è parallelo all’asse.",
 r"\frac Pc=\frac{Rc}{c}=R\qquad R=\frac{2\,\mathrm m}{1/2}=4\,\mathrm m",
 "Il controllo dà 4 m·1/2=2 m. Moltiplicare invece 2 m per 1/2 darebbe 1 m, un modulo più piccolo della propria componente: questo contraddice |P|≤R. Il controllo geometrico affianca quello algebrico.", "Dividere per un mezzo significa chiedersi quante metà contiene il valore dato."),
("Ricostruire il coseno", "Uno spostamento di modulo R=4 m ha componente positiva P=2 m lungo x e forma un angolo acuto con +x. Qual è c=cosθ?", ["1/4", "1/2", "2", "−1/2", "2 m"],
 "Dividiamo P=Rc per R, positivo. Il rapporto fra due lunghezze espresse nella stessa unità è adimensionale. Due metri sono metà di quattro metri, quindi c=1/2. Si può riconoscere θ=60°, ma per rispondere non serve calcolare un angolo.",
 r"c=\frac PR=\frac{2\,\mathrm m}{4\,\mathrm m}=\frac12",
 "Un coseno acuto deve stare fra zero e uno. Due è impossibile per un coseno; −1/2 darebbe una componente negativa e un angolo ottuso. 2 m confonde la componente con il rapporto richiesto; 1/4 introdurrebbe una seconda divisione per due che la formula non contiene.", "Dividi la componente per l’ipotenusa, cancellando i metri."),
("Ruotare a modulo fissato", "Uno spostamento mantiene modulo R=4 m. In due prove acute il coseno passa da c₁=1/2 a c₂=3/4. Quanto vale il rapporto P₂/P₁ delle componenti lungo x? Non occorre ricavare gli angoli.", ["1/2", "2/3", "3/2", "2", "3"],
 "Le componenti sono P₁=4·1/2=2 m e P₂=4·3/4=3 m. Il coseno maggiore corrisponde a una direzione più vicina a +x, dunque la proiezione cresce. Nel rapporto il modulo comune si semplifica e basta confrontare i due coseni.",
 r"\frac{P_2}{P_1}=\frac{Rc_2}{Rc_1}=\frac{3/4}{1/2}=\frac34\times2=\frac32",
 "La seconda componente è una volta e mezza la prima. 2/3 sarebbe il rapporto inverso; tre è il valore numerico di P₂ in metri, non il confronto. Entrambi i coseni sono fra zero e uno e le componenti rimangono inferiori a quattro metri.", "Confronta due frazioni dividendo per la prima, non sottraendola."),
("Scarto fra modulo e proiezione", "Uno spostamento ha R=4 m e c=cosθ=1/2. Una proposta assegna P_proposto=4 m. Quanto vale lo scarto con segno P_proposto−P, in metri?", 2,
 "La proposta coincide con l’intero modulo, come se il vettore fosse allineato all’asse. Ma il coseno assegnato riduce la componente alla metà. Prima calcoliamo questa componente corretta, poi facciamo la sottrazione nell’ordine richiesto.",
 r"P=4\,\mathrm m\times\frac12=2\,\mathrm m\qquad e=4\,\mathrm m-2\,\mathrm m=+2\,\mathrm m",
 "Il segno positivo indica una sovrastima di due metri. P non è una lunghezza da sottrarre al modulo prima della proiezione: è il risultato di una moltiplicazione per il coseno. Invertire l’ordine del confronto darebbe −2 m, che risponde a una definizione diversa di scarto.", "Trova la proiezione prima di confrontarla con la proposta."),
("Isolare il modulo simbolicamente", "Per una proiezione positiva vale P=Rc, dove R>0 e 0<c=cosθ<1. Si conoscono P e c. Quale formula esprime R?", ["R=Pc", "R=P/c", "R=c/P", "R=P−c", "R=√(P/c)"],
 "L’operazione inversa della moltiplicazione per c è la divisione per c. La applichiamo a entrambi i membri dell’uguaglianza. La condizione c>0 garantisce che la divisione sia lecita e restituisca un modulo positivo.",
 r"\frac Pc=\frac{Rc}{c}\qquad R=\frac Pc",
 "Sostituendo l’inversa si ritrova (P/c)c=P. P/c conserva l’unità di P perché c è adimensionale. P−c sottrarrebbe una lunghezza e un numero puro; c/P avrebbe dimensione inversa di lunghezza. La radice non compare perché R non è al quadrato.", "Elimina l’intero fattore c con una divisione."),
("Variazioni compatibili con un coseno", "Nella prima prova P₁=Rc con R>0 e 0<c<1. Nella seconda R₂=κ₁R e c₂=κ₂c, con κ₁,κ₂>0 e 0<κ₂c<1. Quale relazione dà P₂/P₁?", ["κ₁κ₂", "κ₁/κ₂", "κ₂/κ₁", "κ₁+κ₂", "κ₁κ₂²"],
 "Entrambe le prove rispettano P=Rc. Sostituire le due variazioni dà P₂=(κ₁R)(κ₂c). Nel rapporto si eliminano R e c: restano due fattori alla prima potenza. La condizione sul nuovo coseno è fisica: non ogni fattore positivo produce un coseno ammissibile.",
 r"\frac{P_2}{P_1}=\frac{(\kappa_1R)(\kappa_2c)}{Rc}=\kappa_1\kappa_2",
 "Moltiplicare i fattori descrive i due cambiamenti. Dividerli tratterebbe il coseno come un denominatore; elevarlo al quadrato cambierebbe la legge. Sommarli fallisce già per κ₁=κ₂=1, quando non cambia nulla ma darebbe due. Non si possono raddoppiare coseni già maggiori di un mezzo mantenendo un angolo acuto.", "Controlla anche che il nuovo coseno resti minore di uno."),
("Allungare e ruotare insieme", "In una prima prova R₁=4 m,c₁=1/2; nella seconda R₂=8 m,c₂=3/4. In entrambi i casi c è il coseno dell’angolo acuto con +x. Quanto vale P₂/P₁?", 3,
 "Il modulo raddoppia e il coseno cresce di un fattore (3/4)/(1/2)=3/2. Poiché la componente è il prodotto Rc, il rapporto complessivo è 2·3/2. Possiamo semplificare il due prima di moltiplicare.",
 r"P_1=4\,\mathrm m\times\frac12=2\,\mathrm m\qquad P_2=8\,\mathrm m\times\frac34=6\,\mathrm m\qquad \frac{P_2}{P_1}=\frac62=3",
 "Il rapporto tre è adimensionale. Per ottenere sei metri mentalmente, un quarto di otto è due e tre quarti sono sei. Un rapporto due conterebbe soltanto il cambiamento del modulo; 3/2 conterebbe soltanto la rotazione.", "Moltiplica il rapporto dei moduli per quello dei coseni."),
("Media di due proiezioni", "Due prove di uguale peso hanno (R,c)=(4 m,1/2) e (8 m,3/4), dove c è il coseno dell’angolo con +x. Quanto vale la media aritmetica delle due componenti P=Rc?", ["3 m", "15/4 m", "4 m", "6 m", "8 m"],
 "Calcoliamo le due componenti nella medesima unità: due metri e sei metri. La media richiesta è la somma delle componenti divisa per due. Non stiamo chiedendo la proiezione ottenuta inserendo nella legge il modulo medio e il coseno medio.",
 r"\overline P=\frac{2\,\mathrm m+6\,\mathrm m}{2}=4\,\mathrm m",
 "Quattro metri è il punto medio fra due e sei. Le medie degli ingressi sarebbero R=6 m e c=5/8, con prodotto 15/4 m: un’operazione diversa. Otto metri è la somma prima di dividere per due; sei metri ripete soltanto la seconda componente.", "Applica la proiezione a ciascuna prova, poi media i risultati."),
("Quanto deve cambiare il coseno?", "All’inizio R₁=4 m,c₁=1/2 e P₁=R₁c₁. Si impone R₂=8 m e si vuole P₂=3P₁, conservando un angolo acuto. Quale rapporto c₂/c₁ serve?", ["1/2", "2/3", "3/2", "2", "3"],
 "Il raddoppio del modulo produce già un fattore due nella componente. Per arrivare al fattore tre richiesto, il coseno deve fornire il fattore residuo 3/2. Ricostruiamo poi il nuovo coseno per verificare che sia ammissibile.",
 r"3=2\frac{c_2}{c_1}\qquad \frac{c_2}{c_1}=\frac32\qquad c_2=\frac32\times\frac12=\frac34",
 "Il coseno 3/4 è positivo e minore di uno, quindi il nuovo angolo acuto esiste. Il controllo dà P₂=8 m·3/4=6 m, tre volte due metri. Un rapporto due porterebbe c₂ a uno, sull’asse e fuori dal dominio strettamente acuto; tre produrrebbe un coseno impossibile di 3/2.", "Togli dal fattore totale il contributo già dato da R."),
("Dalle tacche allo spostamento", "Uno strumento mostra S=gP con guadagno costante g>0 e offset nullo; S conta tacche e P=Rc è una componente di spostamento. Il riferimento R=4 m,c=1/2 dà S=6. Una nuova prova dà S=18 con c=3/4. Quanto vale R, in metri?", 8,
 "Nel riferimento P=2 m. Sei tacche per due metri danno un guadagno di tre tacche per metro. Diciotto tacche corrispondono allora a P=6 m. Per ottenere R dividiamo la componente per c=3/4, cioè moltiplichiamo per 4/3.",
 r"g=\frac{6}{2\,\mathrm m}=3\,\mathrm{m^{-1}}\qquad P=\frac{18}{3\,\mathrm{m^{-1}}}=6\,\mathrm m\qquad R=6\,\mathrm m\times\frac43=8\,\mathrm m",
 "Semplifichiamo sei con tre prima di moltiplicare per quattro. Il controllo completo restituisce 3 m⁻¹·(8 m·3/4)=18. Il guadagno ha dimensione inversa di lunghezza perché converte metri in un conteggio: tacche e metri non possono essere scambiati direttamente.", "Rimuovi prima il guadagno e poi il fattore geometrico."),
("Due riferimenti per il display", "Il display segue S=gP+d, con S conteggio e g,d costanti; P=Rc. I riferimenti (R,c,S) sono (4 m,1/2,5) e (8 m,3/4,13). Nella prova ignota c=1/2 e S=9. Quanto vale R?", ["2 m", "4 m", "6 m", "8 m", "16 m"],
 "Le componenti dei riferimenti sono 2 m e 6 m. La differenza di otto tacche per quattro metri elimina d e dà g=2 m⁻¹. Dalla prima lettura si ricava d=5−2·2=1 tacca. La lettura ignota, corretta di una tacca, corrisponde a quattro metri di componente.",
 r"g=\frac{13-5}{6\,\mathrm m-2\,\mathrm m}=2\,\mathrm{m^{-1}}\qquad d=1\qquad P=\frac{9-1}{2\,\mathrm{m^{-1}}}=4\,\mathrm m\qquad R=\frac{4\,\mathrm m}{1/2}=8\,\mathrm m",
 "Il controllo dà S=2 m⁻¹·(8 m·1/2)+1=9. Quattro metri è la componente intermedia, non il modulo richiesto. Usare direttamente il rapporto 9/5 non elimina l’offset e attribuisce alla geometria una parte della lettura strumentale.", "Trova il guadagno con le differenze, poi correggi la lettura ignota."),
("Un vincolo con unità esplicite", "Uno spostamento ha P=Rc, con c=cosθ e 0<c<1. Un vincolo assegna R=(8 m)c e si misura P=2 m. Quale valore di c soddisfa entrambi i dati?", ["−1/2", "1/4", "1/2", "2", "4"],
 "Il coefficiente otto metri rende il vincolo dimensionalmente corretto: R è una lunghezza, c un numero puro. Sostituendo R nella proiezione si ottiene P=(8 m)c². Dividiamo per otto metri e scegliamo la radice positiva perché il coseno è quello di un angolo acuto.",
 r"2\,\mathrm m=(8\,\mathrm m)c^2\qquad c^2=\frac14\qquad c=\frac12\;(0<c<1)",
 "Il controllo ricostruisce R=8 m·1/2=4 m e P=4 m·1/2=2 m. −1/2 è l’altra radice algebrica, esclusa dal dominio; 1/4 è il quadrato del coseno. Due e quattro violano il limite |cosθ|≤1. Sul dominio positivo il quadrato è crescente, quindi la soluzione è unica.", "Sostituisci il vincolo prima di risolvere per il coseno.")
]
CHOICES={2:0,3:1,4:0,6:1,7:2,9:1,10:0,12:2,13:2,15:3,16:2}
UNITS={1:"m",5:"m",8:"m",14:"m"}
FIGURES={1:"Tre tappe: un vettore di quattro metri a 60°; la perpendicolare all’asse delimita il cateto adiacente; la proiezione vale due metri. L’ultimo confronto mostra il segno negativo a 120°.",3:"Leggi il confronto finale: a 60° la proiezione è positiva, a 120° è negativa. L’esempio finale usa R=10 m e dà P=−5 m; il vettore conserva modulo positivo."}

def assemble(repo,source_ref):
    return assemble_family(repo,source_ref,"vector-projection",TASKS,CHOICES,UNITS,"vector-projection-progressive.svg",FIGURES,2160)

if __name__ == "__main__":
    write_family(assemble,"vector-projection-008")
