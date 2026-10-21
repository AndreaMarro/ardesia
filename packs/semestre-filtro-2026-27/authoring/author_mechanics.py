"""Original model specifications: methods and mechanics. Build-time only."""
import json
from pathlib import Path

OUT=Path(__file__).with_name('models_methods_mechanics.json')
MODELS=[]


def v(name,symbol,unit,dimension):
    return dict(name=name,symbol=symbol,unit=unit,dimension=dimension)


def add(id,unit,micro,topic,context,x,z,y,formula,law,idea,derivation,traps,
        samples=None,domain='x > 0 and z > 0',family=None,concept=None,scope='syllabus_core'):
    explanation=(idea+' '+derivation+' '+
        f"Nel testo sono distinte {x['name']} e {z['name']}: sono i due dati variabili del modello, "
        f"mentre {y['name']} è la risposta fisica che vogliamo collegare a essi. "
        'Prima di sostituire numeri conviene dire a parole che cosa rappresenta ogni quantità. '
        'In questo modo si riconosce se la domanda chiede un valore, una variazione, un rapporto oppure un’incognita da ricostruire. '
        'La relazione va applicata alle condizioni dichiarate, mantenendo fissi gli altri parametri. '
        'Una formula corretta usata con un vincolo diverso può dare un numero ordinato ma descrivere un altro esperimento.')
    MODELS.append({'id':id,'unitId':unit,'macroarea':'Introduzione ai metodi della fisica' if unit=='U1' else 'Meccanica',
        'microarea':micro,'topic':topic,'title':topic,'context':context,
        'x':x,'z':z,'y':y,'formula':formula,'law':law,'modelKind':'expression',
        'domain':domain,'samples':samples or [[2,2],[2,4],[4,2],[4,4],[6,2],[6,4]],
        'assumptions':['Si usano le unità dichiarate e valori esatti; non è necessaria una calcolatrice.',
                       'Le grandezze definite come moduli sono positive. '+('I vettori e le direzioni sono quelli dichiarati nel testo.' if unit=='U1' else 'Il riferimento è inerziale, salvo la lettura di strumenti solidali al sistema esplicitamente descritta.')],
        'explanation':explanation,'derivation':[derivation],
        'traps':traps,'prerequisites':['Operazioni con frazioni','Significato delle unità','Lettura di una formula'],
        'lawFamily':family or id,'syllabusSubtopics':[f'{unit}: {micro}'],
        'scope':scope,'sourceRefs':[{'sourceId':'MUR-SYLLABUS-2026','locator':unit+' — '+micro},
                                 {'sourceId':'UNIBO-SYLLABUS-2026','locator':topic}],
        **({'conceptual':concept} if concept else {})})


def conceptual(prompt,options,correct,explanation,objective):
    return dict(prompt=prompt,options=options,correctIndex=correct,explanation=explanation,objective=objective,
                context='',assumptions=['Valgono le condizioni specificate nella domanda.'],
                derivation=[],law='',traps=[],scope='syllabus_core')


# U1 — ten genuinely different measurement or vector operations.
add('U1-area-conversion','U1','Unità e conversioni','Conversione di un’area',
    'Un’area ha valore numerico A nella vecchia unità di superficie. Una vecchia unità di lunghezza contiene c nuove unità di lunghezza. Si vuole il valore B dell’area nella nuova unità di superficie. A e B sono valori numerici, non lunghezze.',
    v('valore numerico dell’area iniziale','A','1','1'),v('fattore lineare di conversione','c','1','1'),v('valore numerico dell’area convertita','B','1','1'),
    'x*z**2','B = A c²',
    'Un quadrato cambia unità lungo due direzioni indipendenti. Se ogni lato contiene c volte più unità, le caselle che ricoprono la stessa superficie diventano c per c. L’oggetto fisico non si ingrandisce: cambia soltanto il numero usato per descriverlo. Questa distinzione evita di applicare a un’area il fattore lineare previsto per una lunghezza.',
    'Scrivendo area = lato × lato, ognuno dei due lati riceve il fattore c: B = A·c·c = A c².',
    ['Moltiplicare soltanto per c tratta la superficie come una lunghezza: per un’area serve c².', 'Un valore numerico maggiore può indicare una nuova unità più piccola, senza alcuna crescita dell’area fisica.'],family='unit-conversion-powers')

add('U1-volume-conversion','U1','Unità e conversioni','Conversione di un volume',
    'Un volume ha valore numerico V nella vecchia unità cubica. Una vecchia unità di lunghezza contiene c nuove unità di lunghezza. W è il valore numerico del medesimo volume nella nuova unità cubica.',
    v('valore numerico del volume iniziale','V','1','1'),v('fattore lineare di conversione','c','1','1'),v('valore numerico del volume convertito','W','1','1'),
    'x*z**3','W = V c³',
    'Un parallelepipedo occupa spazio in tre direzioni. Quando si cambia unità, ciascuna lunghezza riceve lo stesso fattore di conversione; il numero dei cubetti cambia dunque con il cubo di quel fattore. La capacità di un recipiente rimane la stessa anche se il numero espresso in centimetri cubi è molto più grande di quello in metri cubi.',
    'Partiamo da volume = lunghezza × larghezza × altezza. Sostituire ogni unità lineare introduce tre fattori c, quindi W = V c³.',
    ['Il fattore quadratico vale per una superficie, non per un volume: qui le direzioni sono tre.', 'Non confondere il simbolo dell’unità cubica con un semplice prefisso da applicare una sola volta.'],family='unit-conversion-powers')

add('U1-scientific-scale','U1','Notazione scientifica','Valore di una notazione scientifica',
    'Un rapporto adimensionale è scritto come R = a·10ⁿ, con mantissa positiva a ed esponente n. La mantissa non viene necessariamente normalizzata fra 1 e 10 durante i passaggi intermedi. Per le valutazioni numeriche si usano esponenti interi.',
    v('mantissa','a','1','1'),v('esponente','n','1','1'),v('rapporto rappresentato','R','1','1'),
    'x*10**z','R = a·10ⁿ',
    'La potenza di dieci indica quante volte la mantissa viene ingrandita o ridotta rispetto all’unità. L’esponente è una quantità senza dimensioni; non si somma alla mantissa. Nelle equivalenze di notazione si può spostare una cifra decimale dalla mantissa alla potenza di dieci, purché il prodotto complessivo rimanga uguale.',
    'Per n intero positivo, 10ⁿ è il prodotto di n fattori 10. La mantissa moltiplica tale scala: non entra nell’esponente.',
    ['a·10ⁿ non significa (10a)ⁿ: cambierebbe l’operazione e il valore.', 'Normalizzare la mantissa richiede una variazione opposta dell’esponente, così il rapporto resta invariato.'],samples=[[2,1],[2,2],[4,1],[4,2]],family='scientific-notation')

add('U1-vector-sum','U1','Vettori','Somma di spostamenti concordi',
    'Due spostamenti rettilinei consecutivi di moduli a e b sono diretti entrambi verso est. D indica il modulo dello spostamento totale, non il tempo impiegato.',
    v('primo spostamento','a','m','L'),v('secondo spostamento','b','m','L'),v('spostamento totale','D','m','L'),
    'x+z','D = a + b',
    'I vettori si sommano rispettando direzione e verso. In questo caso particolare i due versi coincidono, quindi la somma vettoriale può essere eseguita sommando i moduli. Il risultato punta ancora verso est. Questa scorciatoia dipende dalla configurazione: se un tratto fosse verso ovest, i moduli non si sommerebbero nello stesso modo.',
    'Scegliendo l’asse positivo verso est, le componenti sono +a e +b. La componente totale è a+b ed è positiva, perciò coincide con il modulo.',
    ['La somma dei moduli coincide con il modulo della somma soltanto perché i due vettori sono concordi.', 'Uno spostamento si misura in metri, non in metri al secondo: il tempo non compare in questa domanda.'],family='vector-addition')

add('U1-vector-difference','U1','Vettori','Spostamenti in versi opposti',
    'Un percorso comprende uno spostamento a verso est e uno spostamento b verso ovest, con a>b>0. D è il modulo dello spostamento dal punto iniziale a quello finale.',
    v('spostamento verso est','a','m','L'),v('spostamento verso ovest','b','m','L'),v('modulo dello spostamento risultante','D','m','L'),
    'x-z','D = a − b',
    'Distanza percorsa e spostamento non sono la stessa cosa. La distanza somma tutti i tratti positivi; lo spostamento confronta soltanto posizione finale e iniziale e può compensare tratti in versi opposti. Il vincolo a>b assicura che il risultato punti a est e permette di togliere il valore assoluto senza perdere informazioni.',
    'Con l’est positivo, il secondo vettore ha componente −b. La risultante è a−b; il suo modulo è a−b perché a>b.',
    ['a+b rappresenta la lunghezza complessiva del percorso, non il modulo dello spostamento risultante.', 'Senza l’ipotesi a>b il modulo sarebbe |a−b| e il verso andrebbe discusso.'],domain='x > z and z > 0',samples=[[4,1],[4,2],[6,1],[6,2]],family='vector-addition')

add('U1-vector-perpendicular','U1','Vettori','Risultante di componenti perpendicolari',
    'Un vettore spostamento ha componente a verso est e componente b verso nord, entrambe positive. R è il suo modulo; gli assi sono ortogonali.',
    v('componente verso est','a','m','L'),v('componente verso nord','b','m','L'),v('modulo della risultante','R','m','L'),
    'sqrt(x**2+z**2)','R = √(a²+b²)',
    'Le componenti ortogonali sono i cateti di un triangolo rettangolo, mentre il vettore risultante è l’ipotenusa. Per questo i quadrati si sommano prima di estrarre la radice. Il modulo è maggiore di ciascuna componente positiva ma minore della loro somma: il confronto offre un controllo rapido del risultato senza ripetere tutti i calcoli.',
    'Il teorema di Pitagora dà R²=a²+b². Essendo R un modulo, scegliamo R=√(a²+b²), con radice non negativa.',
    ['Sommare direttamente a e b corrisponderebbe a vettori paralleli concordi, non ortogonali.', 'La radice va applicata alla somma dei quadrati: √a²+√b² descriverebbe un’altra operazione.'],samples=[[3,4],[3,'9/4'],[8,6],[5,12],[8,15],[20,15]],family='pythagorean-vector')

add('U1-scalar-product','U1','Vettori','Prodotto scalare di vettori paralleli',
    'Due vettori adimensionali A e B sono paralleli e concordi, con moduli a e b. S indica il loro prodotto scalare. La configurazione dei versi è parte dei dati.',
    v('modulo del primo vettore','a','1','1'),v('modulo del secondo vettore','b','1','1'),v('prodotto scalare','S','1','1'),
    'x*z','S = a b cos0° = a b',
    'Il prodotto scalare misura quanto due vettori sono allineati. Il fattore coseno tiene conto dell’angolo: per vettori concordi vale uno, per vettori ortogonali vale zero, per vettori opposti vale meno uno. Il risultato è uno scalare e non ha una direzione propria, anche se nasce da grandezze vettoriali.',
    'La definizione è A·B=|A||B|cosθ. Qui θ=0° e cos0°=1, quindi rimane il prodotto dei moduli.',
    ['Un prodotto scalare non è un vettore: non gli si attribuisce la direzione perpendicolare al piano.', 'Il prodotto scalare sarebbe negativo per un angolo con coseno negativo; il prodotto dei moduli resta non negativo. Qui i versi sono concordi.'],family='scalar-product',concept=conceptual(
        'Due vettori sono perpendicolari e hanno entrambi modulo non nullo. Quanto vale il loro prodotto scalare?',
        ['Zero','Il prodotto positivo dei moduli','La somma dei moduli','Il rapporto dei moduli','Un vettore perpendicolare a entrambi'],0,
        'Il prodotto scalare è A·B=|A||B|cosθ. Per due vettori perpendicolari l’angolo è 90° e il coseno è zero. Di conseguenza il prodotto scalare è nullo anche quando entrambi i moduli sono diversi da zero. Non significa che uno dei vettori sia assente: significa che la proiezione dell’uno sulla direzione dell’altro è nulla. È lo stesso motivo per cui una forza perpendicolare allo spostamento non compie lavoro su quello spostamento. La risposta «vettore perpendicolare» riguarda invece il prodotto vettoriale, che è un’operazione diversa. Per distinguere le due operazioni conviene chiedersi subito quale tipo di oggetto deve risultare: uno scalare per il prodotto scalare, un vettore per il prodotto vettoriale.',
        'Distinguere ortogonalità, prodotto scalare e prodotto vettoriale'))

add('U1-vector-product','U1','Vettori','Modulo di un prodotto vettoriale',
    'Due vettori adimensionali A e B sono perpendicolari, con moduli a e b. C è il modulo del prodotto vettoriale A×B; il suo verso è determinato separatamente dalla regola della mano destra.',
    v('modulo del primo vettore','a','1','1'),v('modulo del secondo vettore','b','1','1'),v('modulo del prodotto vettoriale','C','1','1'),
    'x*z','C = a b sin90° = a b',
    'Il modulo di un prodotto vettoriale misura l’area del parallelogramma costruito sui due vettori. Nel caso perpendicolare il parallelogramma è un rettangolo e la sua area è il prodotto dei lati. La direzione del risultato è perpendicolare al piano dei due vettori; scambiare l’ordine del prodotto cambia il verso, ma non il modulo.',
    'La definizione del modulo è |A×B|=|A||B|sinθ. Con θ=90° il seno vale uno e resta ab.',
    ['Nel modulo del prodotto vettoriale compare il seno dell’angolo, non il coseno.', 'Scambiare A×B con B×A cambia il verso del vettore, non il valore positivo del suo modulo.'],family='vector-product')

add('U1-vector-projection','U1','Vettori e trigonometria','Proiezione di un vettore',
    'Un vettore ha modulo R e forma un angolo acuto θ con l’asse positivo. È assegnato c=cosθ, con 0<c<1. P è la sua componente lungo quell’asse.',
    v('modulo del vettore','R','m','L'),v('coseno dell’angolo','c','1','1'),v('componente sull’asse','P','m','L'),
    'x*z','P = R cosθ = R c',
    'Una componente è la proiezione del vettore su una direzione scelta. Non è una nuova lunghezza indipendente dal vettore: il rapporto fra componente e modulo è il coseno dell’angolo. Nel primo quadrante la componente è positiva e minore del modulo. Dare direttamente il coseno evita qualsiasi necessità di calcolare funzioni trigonometriche con una calcolatrice.',
    'Nel triangolo rettangolo, cosθ=cateto adiacente/ipotenusa=P/R. Moltiplicando per R si ottiene P=R cosθ.',
    ['Il seno darebbe l’altra componente soltanto se l’angolo è misurato rispetto all’asse indicato.', 'Una componente non può superare il modulo quando |cosθ|≤1: questo è un controllo fisico immediato.'],samples=[[4,'1/2'],[4,'3/4'],[8,'1/2'],[8,'3/4']],domain='x > 0 and z > 0 and z < 1',family='vector-components')

add('U1-vector-angle-ratio','U1','Vettori e trigonometria','Pendenza e direzione di un vettore',
    'Un vettore nel primo quadrante ha componente orizzontale a e componente verticale b. T è la tangente dell’angolo θ misurato dall’asse orizzontale positivo. Non è richiesto l’angolo in gradi.',
    v('componente orizzontale','a','m','L'),v('componente verticale','b','m','L'),v('tangente dell’angolo','T','1','1'),
    'z/x','T = tanθ = b/a',
    'La tangente confronta il cateto opposto all’angolo con quello adiacente. Indica quindi la pendenza del vettore rispetto all’asse scelto. Il rapporto è senza dimensioni perché le componenti sono entrambe lunghezze. Un rapporto maggiore non significa un vettore necessariamente più lungo: può indicare una direzione più inclinata.',
    'Per l’angolo misurato dall’orizzontale, il cateto opposto è b e quello adiacente è a. Quindi tanθ=b/a.',
    ['Il rapporto a/b sarebbe la cotangente dell’angolo indicato, o la tangente dell’angolo misurato dall’altro asse.', 'Non serve ricavare θ con un’arcotangente: la quantità richiesta è direttamente il rapporto.'],family='vector-components')


# U2 — cinemática, dinamica, energia, quantità di moto e statica.
add('U2-uniform-displacement','U2','Cinematica','Spostamento nel moto uniforme',
    'Un carrello percorre una guida rettilinea con velocità costante positiva v per un intervallo t. D è lo spostamento lungo la guida.',
    v('velocità costante','v','m/s','L/T'),v('intervallo di tempo','t','s','T'),v('spostamento','D','m','L'),
    'x*z','D = v t',
    'Velocità costante significa che in intervalli di tempo uguali il carrello percorre spostamenti uguali. Il valore della velocità dice quanti metri vengono aggiunti per ogni secondo. Non serve conoscere la posizione iniziale per calcolare lo spostamento: essa servirebbe invece per conoscere la posizione finale assoluta.',
    'Dalla definizione v=D/t per un intervallo positivo, moltiplichiamo entrambi i membri per t e otteniamo D=vt.',
    ['Spostamento e posizione finale non coincidono se la posizione iniziale non è zero.', 'La legge D=vt richiede velocità costante, oppure v interpretata come velocità media sul medesimo intervallo.'],family='uniform-motion')

add('U2-uniform-position','U2','Cinematica','Posizione con origine non nulla',
    'Un punto si trova inizialmente alla coordinata s₀>0 e si muove nel verso positivo con velocità costante 2 m/s. Dopo t secondi la coordinata è s.',
    v('posizione iniziale','s₀','m','L'),v('tempo trascorso','t','s','T'),v('posizione finale','s','m','L'),
    'x+2*z','s = s₀ + (2 m/s)t',
    'La posizione è una coordinata misurata rispetto a un’origine; lo spostamento è la differenza fra due coordinate. Il termine iniziale deve essere conservato quando si chiede dove si trova il punto dopo un certo tempo. Il grafico posizione-tempo è una retta con intercetta s₀ e pendenza pari alla velocità.',
    'Il moto aggiunge lo spostamento 2t alla coordinata iniziale. Si sommano quindi due lunghezze: s=s₀+2t.',
    ['Scrivere s=2t dimentica l’intercetta iniziale e cambia l’origine delle coordinate.', 'La pendenza del grafico s(t) è la velocità, mentre l’intercetta ha unità di lunghezza.'],family='uniform-motion')

add('U2-mean-velocity','U2','Cinematica','Velocità media da due misure',
    'Fra due rilevazioni la coordinata di un oggetto aumenta di Δs>0 in un intervallo Δt>0. La velocità può variare durante il percorso. V è la velocità media orientata nell’intervallo.',
    v('spostamento totale','Δs','m','L'),v('intervallo di tempo','Δt','s','T'),v('velocità media','V','m/s','L/T'),
    'x/z','V = Δs/Δt',
    'La velocità media dipende soltanto dalle posizioni agli estremi dell’intervallo e dal tempo trascorso. Non afferma che il corpo abbia avuto quel valore in ogni istante. Se ci fossero andate e ritorni, lo spostamento usato qui potrebbe essere molto più piccolo della distanza complessivamente percorsa.',
    'La definizione di velocità media orientata è variazione di posizione divisa per durata dell’intervallo: V=Δs/Δt.',
    ['La distanza totale al numeratore darebbe la rapidità media, che è diversa quando il moto cambia verso.', 'Una velocità media non determina da sola l’accelerazione o la legge oraria istantanea.'],family='average-motion')

add('U2-roundtrip-average','U2','Cinematica','Andata e ritorno su uguali distanze',
    'Un percorso di andata e ritorno comprende due tratti di uguale lunghezza d. Le rapidità costanti sono v₁ all’andata e v₂ al ritorno. V è la rapidità media sull’intero percorso, non la velocità media vettoriale.',
    v('rapidità nel primo tratto','v₁','m/s','L/T'),v('rapidità nel secondo tratto','v₂','m/s','L/T'),v('rapidità media','V','m/s','L/T'),
    '2*x*z/(x+z)','V = 2v₁v₂/(v₁+v₂)',
    'I tratti hanno la stessa distanza ma possono richiedere tempi diversi. Il tratto più lento pesa maggiormente sul tempo totale. Per questo non si usa in generale la media aritmetica delle due rapidità. La velocità media vettoriale di un vero ritorno al punto iniziale sarebbe invece zero: qui si chiede espressamente la rapidità media.',
    'Il cammino totale è 2d e il tempo totale è d/v₁+d/v₂. Dividendo e semplificando d otteniamo V=2/(1/v₁+1/v₂)=2v₁v₂/(v₁+v₂).',
    ['La media aritmetica delle rapidità vale per tempi uguali, non per distanze uguali.', 'Lo zero della velocità media su un percorso chiuso non implica una rapidità media nulla.'],family='average-motion')

add('U2-equal-time-average','U2','Cinematica','Media su intervalli di uguale durata',
    'Un oggetto si muove nel verso positivo per due intervalli di uguale durata τ. Le velocità costanti nei due intervalli sono v₁ e v₂. V è la velocità media dei due intervalli complessivi.',
    v('prima velocità','v₁','m/s','L/T'),v('seconda velocità','v₂','m/s','L/T'),v('velocità media','V','m/s','L/T'),
    '(x+z)/2','V = (v₁+v₂)/2',
    'La media delle velocità deve pesare ciascun valore con il tempo per cui esso è mantenuto. Qui le durate sono uguali, quindi i pesi sono uguali e compare la media aritmetica. I due spostamenti possono essere differenti: è il tempo, non la distanza, a essere stato fissato uguale.',
    'Lo spostamento totale è v₁τ+v₂τ e il tempo totale è 2τ. Il fattore τ si semplifica e rimane (v₁+v₂)/2.',
    ['La media armonica corrisponde a distanze uguali; usarla qui introdurrebbe un vincolo diverso.', 'La somma v₁+v₂ va divisa per due perché il tempo totale comprende due intervalli.'],family='average-motion')

add('U2-mean-acceleration','U2','Cinematica','Accelerazione media con velocità iniziale',
    'In 2 s una velocità rettilinea passa dal valore positivo vᵢ al valore maggiore v_f. A è l’accelerazione media orientata. Gli istanti sono separati esattamente da 2 s.',
    v('velocità finale','v_f','m/s','L/T'),v('velocità iniziale','vᵢ','m/s','L/T'),v('accelerazione media','A','m/s²','L/T**2'),
    '(x-z)/2','A = (v_f−vᵢ)/(2 s)',
    'L’accelerazione media descrive di quanto cambia la velocità per unità di tempo. Il numeratore è una variazione, non la sola velocità finale. Anche un corpo già veloce può avere accelerazione nulla se mantiene la stessa velocità. Il segno positivo deriva qui dalla scelta del verso e dall’aumento del valore della velocità.',
    'Per definizione A=Δv/Δt. Con Δv=v_f−vᵢ e Δt=2 s si ottiene A=(v_f−vᵢ)/2.',
    ['Dividere v_f per 2 è corretto soltanto se vᵢ=0, condizione non presente qui.', 'Una velocità non nulla non implica un’accelerazione non nulla: conta la variazione.'],domain='x > z and z > 0',samples=[[6,2],[6,4],[10,2],[10,4]],family='uniform-acceleration')

add('U2-rest-accelerated-distance','U2','Cinematica','Spazio da fermo con accelerazione costante',
    'Un carrello parte da fermo e si muove lungo una retta con accelerazione costante a>0 per un tempo t>0. D è lo spostamento dal punto di partenza.',
    v('accelerazione','a','m/s²','L/T**2'),v('tempo','t','s','T'),v('spostamento','D','m','L'),
    'x*z**2/2','D = a t²/2',
    'Partendo da fermo, il carrello non mantiene per tutto il tempo la velocità finale at. La velocità aumenta linearmente da zero a quel valore e la sua media è metà della finale. Lo spazio è dunque proporzionale al quadrato del tempo: raddoppiare il tempo quadruplica lo spostamento quando l’accelerazione resta la stessa.',
    'La velocità finale è at e la velocità media è at/2. Moltiplicando la media per t otteniamo D=at²/2.',
    ['Scrivere at² omette il fattore 1/2 e usa la velocità finale come se fosse stata costante.', 'La relazione richiede partenza da fermo; con velocità iniziale non nulla va aggiunto v₀t.'],family='uniform-acceleration')

add('U2-accelerated-final-speed','U2','Cinematica','Velocità finale con accelerazione assegnata',
    'Un corpo ha velocità iniziale v₀>0 lungo una retta e subisce accelerazione costante 2 m/s² nello stesso verso per t secondi. V è la velocità finale.',
    v('velocità iniziale','v₀','m/s','L/T'),v('durata dell’accelerazione','t','s','T'),v('velocità finale','V','m/s','L/T'),
    'x+2*z','V = v₀+(2 m/s²)t',
    'Un’accelerazione costante aggiunge la medesima variazione di velocità in ogni secondo. Il valore iniziale non scompare: la variazione si somma a esso. Questo è il significato fisico del termine v₀ nella legge della velocità. La somma ha senso dimensionalmente perché accelerazione per tempo è ancora una velocità.',
    'Dalla definizione costante a=(V−v₀)/t segue V−v₀=at, quindi V=v₀+at. Qui a=2 m/s².',
    ['Il prodotto at è una variazione di velocità, non sempre la velocità finale.', 'Accelerazione e velocità hanno unità differenti: per sommarle serve moltiplicare l’accelerazione per un tempo.'],family='uniform-acceleration')

add('U2-stopping-distance','U2','Cinematica','Distanza di arresto con decelerazione costante',
    'Un corpo procede inizialmente con rapidità v e rallenta con accelerazione costante opposta al moto, di modulo a>0, fino a fermarsi. D è la distanza di arresto; il tempo di reazione non è incluso.',
    v('rapidità iniziale','v','m/s','L/T'),v('modulo della decelerazione','a','m/s²','L/T**2'),v('distanza di arresto','D','m','L'),
    'x**2/(2*z)','D = v²/(2a)',
    'Il modulo della decelerazione viene indicato positivo, mentre l’accelerazione orientata è negativa nel verso del moto. La distanza di arresto cresce con il quadrato della rapidità iniziale: raddoppiarla richiede quattro volte lo spazio a parità di decelerazione. Una decelerazione maggiore riduce invece la distanza.',
    'La relazione senza tempo è v_f²=v²−2aD. Ponendo v_f=0 si ricava 2aD=v² e quindi D=v²/(2a).',
    ['Il segno meno appartiene all’accelerazione orientata; la distanza finale deve essere positiva.', 'La distanza di reazione richiederebbe un tempo aggiuntivo e non è compresa nei dati.'],family='braking')

add('U2-stopping-time','U2','Cinematica','Tempo di arresto',
    'Una particella ha rapidità iniziale v>0 e rallenta uniformemente con decelerazione di modulo a>0. T è il tempo necessario per annullare la velocità.',
    v('rapidità iniziale','v','m/s','L/T'),v('modulo della decelerazione','a','m/s²','L/T**2'),v('tempo di arresto','T','s','T'),
    'x/z','T = v/a',
    'La decelerazione indica quanta rapidità viene persa ogni secondo. Il tempo necessario è quindi la rapidità da eliminare divisa per la perdita per secondo. A differenza della distanza di arresto, il tempo dipende linearmente dalla velocità iniziale: le due domande non sono intercambiabili.',
    'Scriviamo la legge orientata v_f=v−aT. All’arresto v_f=0; da aT=v segue T=v/a.',
    ['La formula con v²/(2a) dà una distanza, non un tempo: le unità permettono di distinguerle.', 'Si usa il modulo positivo a; inserire un altro segno meno produrrebbe un tempo negativo non fisico.'],family='braking')

add('U2-freefall-time','U2','Cinematica','Tempo di caduta libera',
    'Un oggetto viene lasciato da fermo da un’altezza h in un campo gravitazionale uniforme di modulo g. Si trascura l’aria. T è il tempo prima di raggiungere il livello di arrivo.',
    v('altezza di caduta','h','m','L'),v('accelerazione gravitazionale','g','m/s²','L/T**2'),v('tempo di caduta','T','s','T'),
    'sqrt(2*x/z)','T = √(2h/g)',
    'La caduta da fermo è un moto uniformemente accelerato. L’oggetto percorre poco spazio nei primi istanti e di più quando è già veloce; il tempo non è quindi proporzionale direttamente all’altezza. La massa dell’oggetto non compare nel modello ideale, perché l’accelerazione gravitazionale è la stessa per tutti i corpi in quel campo.',
    'Dalla legge h=gT²/2 ricaviamo T²=2h/g. Il tempo fisico è la radice positiva di questo rapporto.',
    ['Raddoppiare l’altezza moltiplica il tempo per √2, non per due.', 'L’indipendenza dalla massa richiede di trascurare resistenza dell’aria e altri vincoli.'],samples=[[2,1],[2,4],[8,1],[8,4]],family='free-fall')

add('U2-freefall-speed','U2','Cinematica ed energia','Rapidità acquistata in caduta',
    'Un corpo cade da fermo per un dislivello h in un campo uniforme g, senza resistenza dell’aria. V è il modulo della velocità al termine del dislivello.',
    v('accelerazione gravitazionale','g','m/s²','L/T**2'),v('dislivello percorso','h','m','L'),v('rapidità finale','V','m/s','L/T'),
    'sqrt(2*x*z)','V = √(2gh)',
    'La perdita di energia potenziale gravitazionale si trasforma in energia cinetica. La massa compare in entrambe le energie e si semplifica: questo spiega perché, nel modello ideale, non determina la rapidità raggiunta dopo una stessa caduta. Il risultato cresce come la radice del dislivello, non linearmente.',
    'Poniamo mgh=mV²/2. Dividendo per la massa positiva otteniamo V²=2gh e prendiamo la radice positiva per il modulo.',
    ['Il dislivello è una differenza di quota positiva durante la caduta, non la coordinata assoluta del corpo.', 'La velocità vettoriale ha verso verso il basso; qui si chiede soltanto il suo modulo positivo.'],samples=[[2,1],[2,4],[8,1],[8,4]],family='free-fall')

add('U2-vertical-maximum','U2','Cinematica ed energia','Altezza massima di un lancio verticale',
    'Un corpo viene lanciato verso l’alto con rapidità iniziale v₀ in un campo g uniforme. Si trascura l’aria. H è l’aumento di quota rispetto al punto di lancio, fino all’istante in cui la velocità si annulla.',
    v('rapidità di lancio','v₀','m/s','L/T'),v('accelerazione gravitazionale','g','m/s²','L/T**2'),v('aumento massimo di quota','H','m','L'),
    'x**2/(2*z)','H = v₀²/(2g)',
    'Durante la salita l’energia cinetica iniziale si converte in energia potenziale. Al punto più alto la velocità istantanea è nulla, ma l’accelerazione gravitazionale continua ad agire verso il basso. L’altezza richiesta è misurata dal punto di lancio: un’eventuale quota iniziale rispetto al suolo andrebbe aggiunta soltanto se richiesta.',
    'La conservazione dell’energia dà mv₀²/2=mgH. Semplificando m e dividendo per g si ottiene H=v₀²/(2g).',
    ['Velocità zero al culmine non significa accelerazione zero: g continua ad agire.', 'La formula fornisce l’aumento di quota dal lancio, non automaticamente l’altezza rispetto al terreno.'],family='vertical-launch')

add('U2-vertical-flight','U2','Cinematica','Tempo di ritorno alla quota di lancio',
    'Un corpo è lanciato verticalmente verso l’alto con rapidità v₀ e torna alla stessa quota in un campo uniforme g. Si trascura l’aria. T è il tempo totale fra lancio e ritorno, escluso l’istante iniziale.',
    v('rapidità iniziale','v₀','m/s','L/T'),v('accelerazione gravitazionale','g','m/s²','L/T**2'),v('tempo totale di volo','T','s','T'),
    '2*x/z','T = 2v₀/g',
    'La salita e la discesa fra le stesse quote sono simmetriche nel modello senza attrito. Il tempo fino al culmine è v₀/g; il ritorno richiede un tempo uguale. La simmetria non autorizza a usare la stessa formula quando l’arrivo si trova a una quota diversa o quando l’aria dissipa energia.',
    'Imponiamo lo spostamento verticale zero: v₀T−gT²/2=0. Le radici sono T=0 e T=2v₀/g; la seconda è il ritorno richiesto.',
    ['v₀/g è soltanto il tempo di salita, non il tempo complessivo di andata e ritorno.', 'La radice T=0 indica il momento del lancio e va distinta dal successivo ritorno.'],family='vertical-launch')

add('U2-projectile-range','U2','Cinematica bidimensionale','Gittata da componenti iniziali',
    'Un proiettile parte e arriva alla stessa quota. Le componenti iniziali sono u orizzontale e w verticale verso l’alto, entrambe positive. Si trascura l’aria e si assume g=10 m/s². R è la gittata orizzontale.',
    v('componente orizzontale iniziale','u','m/s','L/T'),v('componente verticale iniziale','w','m/s','L/T'),v('gittata','R','m','L'),
    'x*z/5','R = u·(2w/g) = u w/(5 m/s²)',
    'Le due componenti del moto condividono il tempo ma hanno evoluzioni diverse. Orizzontalmente non c’è accelerazione e la velocità resta u; verticalmente la gravità determina il tempo di volo. Questa separazione permette di calcolare la gittata senza ricorrere a un angolo o a valori trigonometrici approssimati.',
    'Il ritorno alla quota iniziale richiede T=2w/g. Lo spostamento orizzontale è R=uT, quindi con g=10 risulta R=uw/5.',
    ['La componente orizzontale non determina il tempo di ritorno alla quota iniziale: lo determina il moto verticale.', 'La relazione presuppone arrivo alla stessa quota; non vale invariata per un lancio da un bordo sopraelevato.'],family='projectile')

add('U2-projectile-one-second','U2','Cinematica bidimensionale','Quota dopo un secondo',
    'La componente verticale iniziale di un lancio è w>0. L’accelerazione gravitazionale ha modulo g>0 e punta verso il basso. Dopo esattamente 1 s si misura l’aumento di quota H, ancora positivo; dunque w > g·(1 s)/2. Nelle relazioni numeriche si usano w in m/s, g in m/s² e H in m.',
    v('accelerazione gravitazionale','g','m/s²','L/T**2'),v('velocità verticale iniziale','w','m/s','L/T'),v('aumento di quota a 1 s','H','m','L'),
    'z-x/2','H = w·(1 s) − g·(1 s)²/2',
    'Il contributo iniziale alla quota è quello che si avrebbe continuando con la velocità di lancio. La gravità sottrae invece una quantità proporzionale al quadrato del tempo. I due contributi vanno sommati con segno: non si possono usare contemporaneamente due formule valide entrambe soltanto per partenza da fermo.',
    'La legge verticale è H=wt−gt²/2. Sostituendo il tempo fissato t=1 s si ottiene numericamente H=w−g/2.',
    ['La presenza del termine wt è necessaria perché la componente verticale iniziale non è zero.', 'L’aumento di quota positivo non implica che il corpo stia ancora salendo: conta separatamente il segno della velocità.'],samples=[[2,4],[2,6],[4,4],[4,6]],domain='x > 0 and z > x/2',family='projectile')

add('U2-centripetal-acceleration','U2','Moto circolare','Accelerazione centripeta',
    'Un punto percorre una circonferenza di raggio r con rapidità costante v. A è il modulo dell’accelerazione centripeta; l’accelerazione tangenziale è nulla.',
    v('rapidità tangenziale','v','m/s','L/T'),v('raggio della traiettoria','r','m','L'),v('accelerazione centripeta','A','m/s²','L/T**2'),
    'x**2/z','A = v²/r',
    'La rapidità può restare costante mentre la velocità vettoriale cambia continuamente direzione. Tale cambiamento richiede un’accelerazione rivolta al centro. A parità di rapidità una traiettoria più stretta impone un cambiamento di direzione più rapido, perciò l’accelerazione cresce quando il raggio diminuisce.',
    'Nel moto circolare uniforme il limite della variazione vettoriale della velocità dà A=v²/r. Il verso è radiale verso il centro.',
    ['Rapidità costante non significa accelerazione nulla: la direzione della velocità sta cambiando.', 'La forza centripeta non è una forza aggiuntiva: è il nome della risultante radiale delle forze reali.'],family='circular-motion',concept=conceptual(
        'Quale affermazione descrive il moto circolare uniforme?',
        ['La rapidità è costante ma la velocità vettoriale cambia direzione','La velocità vettoriale è costante','L’accelerazione è sempre nulla','La risultante delle forze è tangente alla traiettoria','Il raggio aumenta necessariamente'],0,
        'La parola uniforme si riferisce al modulo della velocità, cioè alla rapidità. Il vettore velocità è invece tangente alla circonferenza e la sua direzione cambia da punto a punto. L’accelerazione misura ogni cambiamento del vettore velocità, non soltanto un aumento del suo modulo; perciò è presente anche in questo caso. Essa è diretta verso il centro e vale v²/r. Una risultante puramente tangenziale modificherebbe la rapidità e non corrisponderebbe al moto uniforme descritto. Non serve immaginare una nuova forza chiamata centripeta: tensione di un filo, attrito o gravitazione possono fornire la risultante radiale in situazioni diverse. Il raggio resta fissato dalla traiettoria circolare.',
        'Distinguere rapidità, velocità vettoriale e accelerazione'))

add('U2-circular-speed','U2','Moto circolare','Rapidità da raggio e periodo',
    'Un punto compie un giro completo su una circonferenza di raggio r in un periodo T. Il moto è uniforme. V è la rapidità tangenziale; π va mantenuto esatto.',
    v('raggio','r','m','L'),v('periodo','T','s','T'),v('rapidità tangenziale','V','m/s','L/T'),
    '2*pi*x/z','V = 2πr/T',
    'Il percorso di un giro è la circonferenza 2πr, non il diametro. Il periodo indica quanto tempo occorre per percorrerla una volta. La rapidità tangenziale è quindi la distanza lungo il cerchio divisa per il periodo; la velocità media vettoriale su un giro completo sarebbe invece nulla.',
    'Usiamo rapidità = spazio percorso/tempo. Per un giro, spazio=2πr e tempo=T, da cui V=2πr/T.',
    ['Il diametro 2r non è la lunghezza del giro: manca il fattore π.', 'La rapidità tangenziale non coincide con la velocità angolare, che si misura in rad/s.'],samples=[[1,'pi'],[1,'2*pi'],[2,'pi'],[2,'2*pi']],family='circular-motion')

add('U2-frequency-count','U2','Moto periodico','Frequenza da numero di giri',
    'Un moto periodico completa N cicli in un intervallo t. f indica la frequenza media di ripetizione. N è un conteggio adimensionale e t è espresso in secondi.',
    v('numero di cicli','N','1','1'),v('durata dell’osservazione','t','s','T'),v('frequenza','f','Hz','1/T'),
    'x/z','f = N/t',
    'La frequenza conta quante ripetizioni avvengono per unità di tempo. Non deve essere confusa con il periodo, che misura il tempo di una singola ripetizione. Una frequenza più grande significa più cicli nello stesso tempo e quindi un periodo più piccolo.',
    'Dividendo il conteggio N per il tempo totale t otteniamo i cicli per secondo: f=N/t. Per un moto periodico regolare T=1/f.',
    ['t/N è il periodo medio, non la frequenza.', 'Il conteggio dei cicli non aggiunge una dimensione meccanica: Hz corrisponde a s⁻¹.'],family='periodic-motion')

add('U2-circular-force','U2','Dinamica','Risultante radiale a raggio fissato',
    'Un corpo di massa m percorre una circonferenza di raggio 2 m con rapidità v. F è il modulo della risultante radiale diretta al centro. Non si chiedono le singole forze che la realizzano.',
    v('massa','m','kg','M'),v('rapidità tangenziale','v','m/s','L/T'),v('risultante centripeta','F','N','M*L/T**2'),
    'x*z**2/2','F = m v²/(2 m)',
    'Per mantenere la traiettoria curva serve un’accelerazione centripeta v²/r. Il secondo principio collega tale accelerazione alla risultante delle forze. La dipendenza quadratica dalla rapidità rende particolarmente importante non confondere una velocità doppia con una richiesta di forza soltanto doppia.',
    'Applichiamo prima A=v²/r, poi F=mA. Sostituendo il raggio fisso r=2 m otteniamo numericamente F=mv²/2.',
    ['La risultante centripeta non si somma alle altre forze: deriva dalla loro somma radiale.', 'Il denominatore 2 rappresenta qui un raggio in metri, non il fattore dell’energia cinetica.'],family='circular-motion')

add('U2-force-sum','U2','Dinamica','Risultante di due trazioni concordi',
    'Due funi ideali tirano lo stesso punto materiale verso destra con tensioni T₁ e T₂. Non agiscono altre forze orizzontali. F è la risultante orizzontale.',
    v('prima tensione','T₁','N','M*L/T**2'),v('seconda tensione','T₂','N','M*L/T**2'),v('risultante','F','N','M*L/T**2'),
    'x+z','F = T₁+T₂',
    'Il secondo principio usa la somma vettoriale delle forze che agiscono sul medesimo corpo. Qui le due trazioni sono concordi, quindi le componenti si sommano. Non sono una coppia di azione e reazione: quelle agiscono su corpi diversi e non si cancellano nel bilancio di forze di un solo corpo.',
    'Scegliendo la destra positiva, entrambe le tensioni hanno componente positiva. La risultante è F=T₁+T₂.',
    ['Due forze sullo stesso corpo non costituiscono una coppia del terzo principio fra due corpi.', 'Sottrarre le tensioni sarebbe corretto per versi opposti, che non sono quelli indicati.'],family='force-balance')

add('U2-opposed-force-acceleration','U2','Dinamica','Accelerazione da forze opposte',
    'Su un blocco di massa 2 kg agiscono orizzontalmente una forza F verso destra e una forza R verso sinistra, con F>R>0. Il piano è orizzontale e le forze verticali si equilibrano. A è l’accelerazione verso destra.',
    v('forza verso destra','F','N','M*L/T**2'),v('forza resistente','R','N','M*L/T**2'),v('accelerazione','A','m/s²','L/T**2'),
    '(x-z)/2','A = (F−R)/(2 kg)',
    'L’accelerazione dipende dalla risultante e non dalla sola forza motrice. Le componenti opposte vanno sottratte prima di dividere per la massa. Il peso e la reazione normale non compaiono nel bilancio orizzontale perché sono verticali e, nelle ipotesi, si compensano fra loro.',
    'La risultante orizzontale è F−R. Da F_ris=mA, con m=2 kg, segue A=(F−R)/2.',
    ['Dividere la sola F per la massa trascura la forza resistente.', 'Il peso non deve essere sommato a una forza orizzontale come se avesse lo stesso verso.'],samples=[[6,2],[6,4],[10,2],[10,4]],domain='x > z and z > 0',family='force-balance')

add('U2-elevator-apparent-weight','U2','Dinamica','Lettura di una bilancia in ascensore',
    'Una persona di massa m è ferma rispetto al pavimento di un ascensore che accelera verso l’alto con modulo a. Si assume g=10 m/s². N è la forza normale letta da una bilancia dinamometrica, in newton.',
    v('massa della persona','m','kg','M'),v('accelerazione verso l’alto','a','m/s²','L/T**2'),v('reazione normale','N','N','M*L/T**2'),
    'x*(10+z)','N = m(g+a)',
    'La bilancia misura la forza di contatto e non direttamente la forza gravitazionale. Per accelerare la persona verso l’alto, la reazione normale deve superare il peso. La massa non aumenta: cambia la forza necessaria a produrre l’accelerazione insieme alla gravità. Velocità verso l’alto e accelerazione verso l’alto sono informazioni differenti.',
    'Con verso positivo verso l’alto, N−mg=ma. Portando mg all’altro membro otteniamo N=m(g+a).',
    ['La lettura cresce perché aumenta la reazione normale, non perché cambia la massa.', 'Un ascensore che sale a velocità costante ha accelerazione zero e lettura mg.'],family='vertical-force-balance')

add('U2-lowering-cable','U2','Dinamica','Tensione durante una discesa accelerata',
    'Un carico di massa m è sostenuto da una fune verticale e accelera verso il basso con modulo a, dove 0<a<10 m/s². Si assume g=10 m/s². T è la tensione positiva della fune.',
    v('massa del carico','m','kg','M'),v('accelerazione verso il basso','a','m/s²','L/T**2'),v('tensione','T','N','M*L/T**2'),
    'x*(10-z)','T = m(g−a)',
    'La tensione tira verso l’alto mentre il peso tira verso il basso. Se il carico accelera verso il basso, il peso supera la tensione. Il limite a=g corrisponderebbe alla caduta libera con tensione nulla: il vincolo a<g mantiene invece la fune effettivamente tesa nel modello.',
    'Prendendo positivo verso il basso, mg−T=ma. Isolando T si trova T=m(g−a).',
    ['Usare g+a darebbe la tensione necessaria per accelerare verso l’alto, non la situazione descritta.', 'Una tensione negativa non è fisica per una fune ideale: essa può tirare ma non spingere.'],samples=[[2,2],[2,4],[4,2],[4,4]],domain='x > 0 and z > 0 and z < 10',family='vertical-force-balance')

add('U2-two-blocks-system','U2','Dinamica','Due blocchi accelerati insieme',
    'Due blocchi su piano orizzontale liscio sono collegati da una fune ideale. Il primo ha massa fissa 2 kg, il secondo massa m. Una forza esterna orizzontale F accelera il sistema. A è l’accelerazione comune.',
    v('forza esterna','F','N','M*L/T**2'),v('massa del secondo blocco','m','kg','M'),v('accelerazione comune','A','m/s²','L/T**2'),
    'x/(2+z)','A = F/(2 kg+m)',
    'Considerando i due blocchi come un unico sistema, le tensioni interne si compensano nel bilancio complessivo. La forza esterna deve accelerare entrambe le masse, quindi al denominatore compare la massa totale. Il piano liscio esclude una forza d’attrito nascosta.',
    'La seconda legge sul sistema è F=(2 kg+m)A. Dividiamo per la massa totale positiva e ricaviamo A.',
    ['Dividere soltanto per m ignora l’inerzia del primo blocco.', 'La tensione interna non si aggiunge alla forza esterna quando si considera l’intero sistema.'],family='connected-bodies')

add('U2-subsystem-tension','U2','Dinamica','Tensione che accelera un blocco trainato',
    'Un blocco di massa m scivola su un piano liscio ed è trainato da una fune orizzontale ideale. La sua accelerazione misurata è a>0. Non agiscono altre forze orizzontali. T è la tensione sulla fune.',
    v('massa trainata','m','kg','M'),v('accelerazione','a','m/s²','L/T**2'),v('tensione','T','N','M*L/T**2'),
    'x*z','T = m a',
    'Quando si studia soltanto il blocco trainato, la tensione è una forza esterna a quel sottosistema. La sua intensità si ricava usando la massa di quel blocco, non automaticamente la massa di tutto il convoglio. Cambiare il sistema osservato cambia quali forze sono interne ed esterne, ma non cambia il secondo principio.',
    'Il peso e la normale si equilibrano verticalmente. Orizzontalmente rimane soltanto T, quindi T=ma.',
    ['Per il sottosistema trainato va usata la sua massa; la massa totale appartiene al bilancio dell’intero convoglio.', 'Una fune ideale trasmette tensione, ma la tensione non è sempre uguale alla forza esterna applicata all’altro capo di un sistema complesso.'],family='connected-bodies')

add('U2-atwood','U2','Dinamica','Macchina di Atwood ideale',
    'Due masse M>m>0 sono collegate da una fune ideale su una carrucola senza massa e senza attrito. Si assume g=10 m/s². A è il modulo dell’accelerazione: M scende e m sale.',
    v('massa maggiore','M','kg','M'),v('massa minore','m','kg','M'),v('accelerazione','A','m/s²','L/T**2'),
    '10*(x-z)/(x+z)','A = g(M−m)/(M+m)',
    'La differenza dei pesi fornisce la forza motrice, ma devono essere accelerate entrambe le masse. Per questo la differenza compare al numeratore e la somma al denominatore. Se le masse fossero uguali, la forza motrice sarebbe nulla; se la massa leggera diventasse trascurabile, l’accelerazione si avvicinerebbe a g.',
    'Le due equazioni sono Mg−T=MA e T−mg=mA. Sommandole si elimina T: (M−m)g=(M+m)A.',
    ['La differenza delle masse determina la forza motrice, non la massa inerziale totale.', 'L’accelerazione deve essere minore di g quando entrambe le masse sono positive.'],samples=[[4,1],[4,2],[6,1],[6,2]],domain='x > z and z > 0',family='connected-bodies')

add('U2-incline-acceleration','U2','Dinamica su piano inclinato','Discesa su piano liscio',
    'Un corpo scivola su un piano inclinato privo di attrito. Si conoscono g e s=sinθ, con 0<s<1. A è il modulo dell’accelerazione lungo il piano, verso il basso.',
    v('accelerazione gravitazionale','g','m/s²','L/T**2'),v('seno dell’inclinazione','s','1','1'),v('accelerazione lungo il piano','A','m/s²','L/T**2'),
    'x*z','A = g sinθ = g s',
    'La forza peso può essere scomposta lungo il piano e perpendicolarmente a esso. La reazione normale compensa soltanto la componente perpendicolare. La componente parallela mg sinθ rimane responsabile del moto; dividendo per la massa si vede che l’accelerazione non dipende dalla massa del corpo.',
    'Lungo il piano, mA=mg sinθ. Semplificando la massa positiva si ottiene A=g sinθ.',
    ['Il coseno compare nella componente perpendicolare al piano, non in quella che causa la discesa.', 'L’indipendenza dalla massa vale con il modello e i vincoli dichiarati, non quando si introducono altri effetti.'],samples=[[10,'1/2'],[10,'3/5'],[20,'1/2'],[20,'3/5']],domain='x > 0 and z > 0 and z < 1',family='inclined-plane')

add('U2-incline-normal','U2','Dinamica su piano inclinato','Reazione normale di un piano',
    'Un corpo di massa m è su un piano inclinato, senza accelerazione perpendicolare al piano e senza altre forze con componente normale. Si assume g=10 m/s² e si conosce c=cosθ, con 0<c<1. N è la reazione normale.',
    v('massa del corpo','m','kg','M'),v('coseno dell’inclinazione','c','1','1'),v('reazione normale','N','N','M*L/T**2'),
    '10*x*z','N = mg cosθ',
    'La reazione normale è perpendicolare alla superficie di contatto e bilancia la componente del peso in quella direzione. Sul piano inclinato non vale in generale N=mg, perché una parte del peso agisce parallelamente al piano. La normale non è la forza di attrito e non deve essere orientata lungo il piano.',
    'La componente perpendicolare del peso vale mg cosθ. Dall’equilibrio in tale direzione segue N=mg cosθ.',
    ['Porre N=mg è corretto sul piano orizzontale senza altre componenti verticali, non su un piano inclinato generico.', 'Attrito e normale sono distinti: il primo è tangenziale, la seconda perpendicolare alla superficie.'],samples=[[2,'1/2'],[2,'4/5'],[4,'1/2'],[4,'4/5']],domain='x > 0 and z > 0 and z < 1',family='inclined-plane')

add('U2-kinetic-friction','U2','Attrito','Modulo dell’attrito dinamico',
    'Un corpo scivola su una superficie nel modello di attrito dinamico di Coulomb. Sono assegnati il coefficiente μ_d>0 e il modulo della reazione normale N. F è il modulo dell’attrito, diretto contro lo scorrimento relativo.',
    v('coefficiente di attrito dinamico','μ_d','1','1'),v('reazione normale','N','N','M*L/T**2'),v('attrito dinamico','F','N','M*L/T**2'),
    'x*z','F = μ_d N',
    'Nel modello utilizzato l’attrito dinamico ha intensità proporzionale alla normale e verso opposto allo scorrimento. Il coefficiente è adimensionale e dipende dalla coppia di superfici. La formula non determina da sola la normale: quest’ultima va ricavata dal bilancio delle forze perpendicolari o deve essere assegnata, come avviene qui.',
    'Il modello costitutivo dell’attrito dinamico è F=μ_dN. Per il modulo si usano quantità positive; il verso si assegna nel bilancio vettoriale.',
    ['La normale non è sempre uguale al peso: sostituirla con mg richiede condizioni aggiuntive.', 'L’attrito statico non vale sempre μ_sN: quello è soltanto il suo valore massimo.'],samples=[['1/2',4],['1/2',8],['1/4',4],['1/4',8]],family='coulomb-friction')

add('U2-static-threshold','U2','Attrito','Soglia di scorrimento su piano orizzontale',
    'Un blocco di massa m è fermo su un piano orizzontale. Una trazione orizzontale aumenta lentamente fino alla soglia di scorrimento. Il coefficiente statico è μ_s e g=10 m/s². F_max è la massima forza statica sostenibile.',
    v('coefficiente di attrito statico','μ_s','1','1'),v('massa del blocco','m','kg','M'),v('soglia della trazione','F_max','N','M*L/T**2'),
    '10*x*z','F_max = μ_s m g',
    'Prima dello scorrimento, l’attrito statico si adatta alla trazione richiesta fino a un massimo. La formula μ_sN dà quel massimo, non l’attrito in ogni istante. Sul piano orizzontale con una trazione soltanto orizzontale, la normale uguaglia il peso. Questo collega il limite d’attrito alla massa.',
    'L’equilibrio verticale dà N=mg. La soglia di attrito statico è μ_sN, perciò F_max=μ_smg.',
    ['Sotto la soglia l’attrito statico uguaglia la trazione applicata, non necessariamente il proprio massimo.', 'Se la trazione avesse una componente verticale, la normale andrebbe ricalcolata.'],samples=[['1/2',2],['1/2',4],['1/4',2],['1/4',4]],family='coulomb-friction')

add('U2-incline-friction','U2','Dinamica su piano inclinato','Discesa con attrito',
    'Un corpo sta scivolando verso il basso su un piano con sinθ=3/5 e cosθ=4/5. Si conoscono g e il coefficiente dinamico μ, con 0<μ<3/4. A è l’accelerazione verso il basso lungo il piano.',
    v('accelerazione gravitazionale','g','m/s²','L/T**2'),v('coefficiente dinamico','μ','1','1'),v('accelerazione lungo il piano','A','m/s²','L/T**2'),
    'x*(3-4*z)/5','A = g(sinθ−μcosθ) = g(3−4μ)/5',
    'La componente del peso favorisce la discesa e l’attrito dinamico la contrasta. Prima si calcola la normale mg cosθ, poi la forza d’attrito μmg cosθ e infine la risultante lungo il piano. Il vincolo sul coefficiente garantisce una risultante verso il basso, evitando di confondere un corpo che rallenta con uno che accelera in discesa.',
    'mA=mg sinθ−μmg cosθ. Semplificando m e sostituendo i valori del seno e del coseno si ottiene A=g(3−4μ)/5.',
    ['L’attrito dipende dalla normale mg cosθ, non dalla componente mg sinθ.', 'Il verso dell’attrito segue lo scorrimento relativo, non sempre il verso dell’accelerazione.'],samples=[[10,'1/4'],[10,'1/2'],[20,'1/4'],[20,'1/2']],domain='x > 0 and z > 0 and z < 3/4',family='inclined-plane')

add('U2-hooke-force','U2','Forze elastiche','Modulo della forza di una molla',
    'Una molla ideale lineare ha costante k ed è deformata di un modulo ℓ rispetto alla lunghezza naturale. F è il modulo della forza elastica; il verso è opposto alla deformazione.',
    v('costante elastica','k','N/m','M/T**2'),v('deformazione','ℓ','m','L'),v('forza elastica','F','N','M*L/T**2'),
    'x*z','F = kℓ',
    'La legge di Hooke collega la deformazione alla forza di richiamo nel regime lineare. La deformazione è la differenza dalla lunghezza naturale, non l’intera lunghezza della molla. Il segno meno della formulazione vettoriale indica il richiamo verso l’equilibrio; quando si chiedono soltanto i moduli la relazione è positiva.',
    'La componente elastica è F_x=−k x_deformazione. Passando ai moduli otteniamo F=kℓ.',
    ['Inserire la lunghezza totale al posto della deformazione produce una forza anche alla lunghezza naturale.', 'La costante k si misura in N/m: non è una forza e non si misura in newton.'],family='elastic-springs')

add('U2-parallel-springs','U2','Forze elastiche','Molle in parallelo',
    'Due molle ideali con costanti k₁ e k₂ sono montate in parallelo e subiscono la medesima deformazione. K è la costante elastica equivalente del gruppo.',
    v('prima costante elastica','k₁','N/m','M/T**2'),v('seconda costante elastica','k₂','N/m','M/T**2'),v('costante equivalente','K','N/m','M/T**2'),
    'x+z','K = k₁+k₂',
    'In parallelo la deformazione è comune e le forze delle molle si sommano. Il sistema resiste di più alla stessa deformazione rispetto a ciascuna molla isolata. La parola parallelo descrive il vincolo meccanico di uguale deformazione, non soltanto il disegno di due molle affiancate.',
    'F_tot=k₁ℓ+k₂ℓ=(k₁+k₂)ℓ. Confrontando con F_tot=Kℓ si ottiene K=k₁+k₂.',
    ['La formula reciproca vale per molle in serie, dove sono le forze a essere uguali.', 'La costante equivalente in parallelo deve superare ciascuna costante positiva.'],family='spring-networks')

add('U2-series-springs','U2','Forze elastiche','Molle in serie',
    'Due molle ideali di costanti k₁ e k₂ sono collegate in serie. Nell’equilibrio quasistatico trasmettono la stessa forza e le deformazioni si sommano. K è la costante equivalente.',
    v('prima costante','k₁','N/m','M/T**2'),v('seconda costante','k₂','N/m','M/T**2'),v('costante equivalente','K','N/m','M/T**2'),
    'x*z/(x+z)','K = k₁k₂/(k₁+k₂)',
    'In serie ogni molla si deforma sotto la stessa forza. Il gruppo si allunga più di ciascuna molla isolata sotto quella forza e quindi è più cedevole. È la cedevolezza 1/k a sommarsi, non la rigidità k. La costante equivalente deve essere minore della più piccola fra le due costanti.',
    'ℓ_tot=F/k₁+F/k₂=F(1/k₁+1/k₂). Poiché ℓ_tot=F/K, segue 1/K=1/k₁+1/k₂ e poi K=k₁k₂/(k₁+k₂).',
    ['Sommare k₁+k₂ descriverebbe un collegamento in parallelo, con deformazione comune.', 'Una costante equivalente maggiore di entrambe contraddirebbe la maggiore deformabilità del gruppo in serie.'],family='spring-networks')

add('U2-static-spring-extension','U2','Equilibrio e molle','Allungamento statico di una molla verticale',
    'Una massa m è appesa lentamente a una molla verticale ideale di costante k e raggiunge l’equilibrio. Si assume g=10 m/s². ℓ è l’allungamento rispetto alla lunghezza naturale.',
    v('massa appesa','m','kg','M'),v('costante della molla','k','N/m','M/T**2'),v('allungamento di equilibrio','ℓ','m','L'),
    '10*x/z','ℓ = mg/k',
    'L’equilibrio richiede risultante nulla, non assenza delle forze. La forza elastica verso l’alto e il peso verso il basso devono avere la stessa intensità. Appendere lentamente la massa distingue questo problema dall’abbandonarla bruscamente su una molla inizialmente scarica, che può produrre un’oscillazione e un allungamento massimo diverso.',
    'All’equilibrio kℓ=mg. Dividendo per k positivo otteniamo ℓ=mg/k.',
    ['L’allungamento statico non coincide automaticamente con il massimo allungamento durante un moto oscillante.', 'La lunghezza finale della molla richiederebbe di aggiungere la sua lunghezza naturale.'],family='elastic-springs')

add('U2-spring-energy','U2','Lavoro ed energia','Energia potenziale elastica',
    'Una molla ideale lineare ha costante k e deformazione di modulo ℓ. Si prende energia elastica nulla alla lunghezza naturale. U è l’energia immagazzinata.',
    v('costante elastica','k','N/m','M/T**2'),v('deformazione','ℓ','m','L'),v('energia elastica','U','J','M*L**2/T**2'),
    'x*z**2/2','U = kℓ²/2',
    'La forza elastica non è costante durante la deformazione: cresce da zero a kℓ. Il lavoro necessario per deformare lentamente la molla è l’area del triangolo sotto il grafico forza-deformazione. Questo spiega sia il quadrato della deformazione sia il fattore un mezzo, che non va confuso con la sola forza finale.',
    'L’area sotto F=kx da 0 a ℓ è un triangolo di base ℓ e altezza kℓ: U=ℓ(kℓ)/2=kℓ²/2.',
    ['kℓ è una forza, mentre kℓ²/2 è un’energia: il controllo delle unità distingue le due formule.', 'Compressione e allungamento di uguale modulo hanno la stessa energia elastica, perché la deformazione è al quadrato.'],family='elastic-energy')

add('U2-gravitational-energy','U2','Lavoro ed energia','Variazione di energia gravitazionale',
    'Una massa m viene portata a una quota maggiore di h in un campo uniforme g=10 m/s². U è l’aumento di energia potenziale gravitazionale rispetto alla quota iniziale.',
    v('massa','m','kg','M'),v('aumento di quota','h','m','L'),v('incremento di energia potenziale','U','J','M*L**2/T**2'),
    '10*x*z','U = mgh',
    'L’energia potenziale è associata alla posizione in un campo conservativo. Solo le differenze hanno significato fisico indipendente dalla scelta dello zero. Sollevare il corpo aumenta la sua energia potenziale, mentre il lavoro compiuto dalla gravità durante lo stesso sollevamento è negativo e vale l’opposto di quell’aumento.',
    'Il peso ha modulo costante mg e il sollevamento è h contro il suo verso. La variazione di energia potenziale è U=mgh.',
    ['Il lavoro della gravità durante la salita è −mgh, mentre l’aumento di energia potenziale è +mgh.', 'La quota assoluta non conta se la domanda assegna direttamente il dislivello h.'],family='gravitational-energy')

add('U2-oblique-work','U2','Lavoro ed energia','Lavoro di una forza obliqua',
    'Una forza costante di modulo F forma un angolo di 60° con uno spostamento rettilineo di modulo s. W è il lavoro della forza; cos60°=1/2.',
    v('modulo della forza','F','N','M*L/T**2'),v('modulo dello spostamento','s','m','L'),v('lavoro','W','J','M*L**2/T**2'),
    'x*z/2','W = Fs cos60° = Fs/2',
    'Il lavoro tiene conto soltanto della componente della forza parallela allo spostamento. La componente perpendicolare può cambiare altre condizioni del moto, ma non trasferisce energia attraverso quello spostamento. L’angolo acuto rende il lavoro positivo: la forza ha una componente concorde al moto.',
    'Il lavoro di una forza costante è il prodotto scalare F·s. Sostituendo cos60°=1/2 si ottiene W=Fs/2.',
    ['Usare il seno proietterebbe la forza sulla direzione perpendicolare, che qui non compie lavoro.', 'Il lavoro è scalare con segno; non è il modulo di un nuovo vettore.'],family='work-dot-product')

add('U2-kinetic-work-difference','U2','Lavoro ed energia','Lavoro risultante da due velocità',
    'Una massa di 2 kg passa da rapidità vᵢ a rapidità maggiore v_f. W è il lavoro complessivo di tutte le forze fra i due istanti. Si considerano velocità non relativistiche.',
    v('rapidità finale','v_f','m/s','L/T'),v('rapidità iniziale','vᵢ','m/s','L/T'),v('lavoro risultante','W','J','M*L**2/T**2'),
    'x**2-z**2','W = (2 kg)(v_f²−vᵢ²)/2',
    'Il teorema dell’energia cinetica collega il lavoro della risultante alla variazione dell’energia cinetica, anche quando non si conoscono i dettagli del percorso. Il lavoro di una sola forza può essere diverso: la parola complessivo è essenziale. La differenza è fra i quadrati delle velocità, non il quadrato della differenza.',
    'W=ΔK=mv_f²/2−mvᵢ²/2. Con m=2 kg il fattore m/2 vale numericamente uno, quindi W=v_f²−vᵢ².',
    ['v_f²−vᵢ² non coincide con (v_f−vᵢ)²: manca altrimenti il termine incrociato.', 'Il teorema riguarda il lavoro totale, non automaticamente il lavoro di una singola forza.'],samples=[[4,1],[4,2],[6,1],[6,2]],domain='x > z and z > 0',family='work-energy-theorem')

add('U2-mechanical-power','U2','Potenza','Potenza di una forza parallela al moto',
    'Una forza di modulo F agisce nello stesso verso della velocità istantanea di modulo v. P è la potenza meccanica istantanea trasferita dalla forza al corpo.',
    v('forza','F','N','M*L/T**2'),v('rapidità istantanea','v','m/s','L/T'),v('potenza','P','W','M*L**2/T**3'),
    'x*z','P = Fv',
    'La potenza descrive quanto rapidamente viene trasferita energia. Una forza può essere grande ma trasferire poca energia per secondo se lo spostamento è lento. Nel caso parallelo concorde il prodotto scalare forza-velocità si riduce al prodotto dei moduli; per una forza opposta la potenza sarebbe negativa.',
    'Da lavoro elementare dW=F ds e velocità v=ds/dt segue P=dW/dt=Fv per la forza parallela al moto.',
    ['Il prodotto forza per spostamento è energia; per ottenere potenza serve la velocità.', 'La relazione dei moduli vale perché forza e velocità sono concordi; in generale compare il prodotto scalare.'],family='mechanical-power')

add('U2-lift-time','U2','Potenza','Tempo di sollevamento a potenza utile fissata',
    'Una macchina solleva lentamente una massa m per 2 m contro la gravità g=10 m/s². La potenza meccanica utile costante è P e non varia l’energia cinetica. T è la durata del sollevamento.',
    v('massa sollevata','m','kg','M'),v('potenza utile','P','W','M*L**2/T**3'),v('tempo di sollevamento','T','s','T'),
    '20*x/z','T = mg(2 m)/P',
    'Il sollevamento richiede un’energia utile pari all’aumento di energia potenziale. La potenza utile dice quanta parte di questa energia viene fornita ogni secondo. Specificare utile evita di confondere tale potenza con quella assorbita dalla macchina: un rendimento non unitario richiederebbe un dato aggiuntivo.',
    'L’energia necessaria è mgh=20m joule. Da P=W/T si ricava T=W/P=20m/P.',
    ['La potenza utile è già quella trasferita al carico: non va moltiplicata per un rendimento non assegnato.', 'Una potenza più grande riduce il tempo a parità di energia richiesta.'],family='mechanical-power')

add('U2-efficiency','U2','Lavoro ed energia','Rendimento energetico',
    'Un dispositivo riceve energia E_in e fornisce energia utile E_u nello stesso ciclo, con 0<E_u<E_in. η è il rendimento energetico, espresso come numero fra zero e uno, non come percentuale.',
    v('energia utile','E_u','J','M*L**2/T**2'),v('energia ricevuta','E_in','J','M*L**2/T**2'),v('rendimento','η','1','1'),
    'x/z','η = E_u/E_in',
    'Il rendimento confronta la parte di energia che realizza lo scopo del dispositivo con l’energia totale ricevuta. L’energia non utile non è scomparsa: viene trasferita in forme diverse, per esempio calore. Il rapporto è adimensionale e, con la definizione data, non può superare uno.',
    'Per definizione η=energia utile/energia in ingresso. La percentuale si otterrebbe moltiplicando questo numero per cento.',
    ['Invertire il rapporto porta a un valore maggiore di uno che non è il rendimento definito.', 'Un rendimento di 1/2 è il 50%, non lo 0,5%.'],samples=[[2,4],[2,8],[4,8],[4,16],[1,4]],domain='z > x and x > 0',family='efficiency')

add('U2-impulse','U2','Quantità di moto','Impulso di una forza costante',
    'Una forza risultante costante F, sempre nello stesso verso, agisce per un intervallo Δt. J è il modulo dell’impulso della risultante.',
    v('forza risultante','F','N','M*L/T**2'),v('durata','Δt','s','T'),v('impulso','J','N·s','M*L/T'),
    'x*z','J = F Δt',
    'L’impulso accumula l’effetto della forza nel tempo e uguaglia la variazione di quantità di moto. Una forza minore mantenuta più a lungo può produrre lo stesso impulso di una forza maggiore e breve. Questa grandezza non è il lavoro: il lavoro coinvolge lo spostamento, mentre l’impulso coinvolge la durata.',
    'Per forza costante l’area sotto il grafico forza-tempo è un rettangolo di base Δt e altezza F: J=FΔt.',
    ['N·s è equivalente a kg·m/s e non a joule.', 'Forza per tempo dà impulso; forza per spostamento dà lavoro.'],family='impulse-momentum')

add('U2-momentum','U2','Quantità di moto','Quantità di moto di una particella',
    'Una particella non relativistica di massa m si muove con velocità di modulo v lungo una direzione fissata. p è il modulo della sua quantità di moto.',
    v('massa','m','kg','M'),v('rapidità','v','m/s','L/T'),v('quantità di moto','p','kg·m/s','M*L/T'),
    'x*z','p = mv',
    'La quantità di moto combina massa e velocità ed è una grandezza vettoriale diretta come la velocità. Il suo modulo cresce linearmente con la rapidità, a differenza dell’energia cinetica che dipende dal quadrato. Nel modello non relativistico la massa non varia con la velocità.',
    'La definizione vettoriale è p=m v. Passando ai moduli, con massa positiva, si ottiene p=mv.',
    ['La quantità di moto è vettoriale: in un sistema di più corpi i versi contano prima di sommare.', 'p=mv non è l’energia cinetica; manca il quadrato della velocità e le unità sono differenti.'],family='impulse-momentum')

add('U2-inelastic-rest','U2','Urti','Urto completamente anelastico con bersaglio fermo',
    'Un corpo di massa m e velocità v urta un bersaglio fermo di massa 2 kg. I due corpi restano uniti. Durante l’urto l’impulso esterno è trascurabile. V è la velocità comune finale nello stesso verso iniziale.',
    v('massa del corpo incidente','m','kg','M'),v('velocità incidente','v','m/s','L/T'),v('velocità finale comune','V','m/s','L/T'),
    'x*z/(x+2)','V = mv/(m+2 kg)',
    'Restare uniti caratterizza l’urto completamente anelastico. Si conserva la quantità di moto quando l’impulso esterno è trascurabile, ma l’energia cinetica non si conserva in generale. Parte dell’energia cinetica iniziale diventa deformazione, calore o altre forme interne senza violare la conservazione dell’energia totale.',
    'La quantità di moto iniziale è mv+2·0. Quella finale è (m+2)V. Uguagliandole ricaviamo V=mv/(m+2).',
    ['Conservare anche l’energia cinetica imporrebbe un urto elastico incompatibile con il fatto che i corpi restano uniti.', 'La massa finale è la somma delle due masse, non soltanto quella del corpo incidente.'],family='inelastic-collisions')

add('U2-inelastic-opposed','U2','Urti','Urto frontale fra masse uguali',
    'Due corpi di uguale massa si muovono uno verso l’altro: il primo verso destra con rapidità u, il secondo verso sinistra con rapidità w, con u>w>0. Restano uniti nell’urto; l’impulso esterno è trascurabile. V è la velocità finale verso destra.',
    v('rapidità verso destra','u','m/s','L/T'),v('rapidità verso sinistra','w','m/s','L/T'),v('velocità comune finale','V','m/s','L/T'),
    '(x-z)/2','V = (u−w)/2',
    'La quantità di moto va sommata con i segni. Le masse uguali si semplificano dal bilancio ma il corpo finale ha massa doppia rispetto a ciascun corpo iniziale. Il vincolo u>w individua il verso finale senza dover introdurre un valore assoluto. L’urto può dissipare energia cinetica anche quando resta una velocità finale non nulla.',
    'Con la destra positiva, p_i=mu−mw. Dopo l’urto p_f=2mV. Da mu−mw=2mV segue V=(u−w)/2.',
    ['Sommare u+w ignora che le velocità iniziali hanno versi opposti.', 'La conservazione della quantità di moto non significa conservazione della somma dei suoi moduli.'],samples=[[4,1],[4,2],[6,1],[6,2]],domain='x > z and z > 0',family='inelastic-collisions')

add('U2-recoil','U2','Quantità di moto','Rinculo di un sistema inizialmente fermo',
    'Un dispositivo inizialmente fermo emette un corpo di massa m con rapidità v rispetto al laboratorio. Dopo l’emissione il dispositivo ha massa 2 kg. L’impulso esterno è trascurabile. U è il modulo della velocità di rinculo, opposta a quella del corpo emesso.',
    v('massa emessa','m','kg','M'),v('rapidità emessa nel laboratorio','v','m/s','L/T'),v('rapidità di rinculo','U','m/s','L/T'),
    'x*z/2','U = mv/(2 kg)',
    'La quantità di moto totale iniziale è zero. Dopo l’emissione i due contributi devono essere uguali e opposti. Specificare che v è misurata nel laboratorio è necessario: una velocità relativa al dispositivo in rinculo richiederebbe un’altra relazione e cambierebbe il risultato.',
    'Nel verso dell’emissione, 0=mv−2U. Dunque 2U=mv e U=mv/2 per il modulo del rinculo.',
    ['Il rinculo ha verso opposto: il segno meno riguarda il vettore, non il suo modulo positivo.', 'La velocità relativa al dispositivo non è automaticamente uguale alla velocità rispetto al laboratorio.'],family='momentum-conservation')

add('U2-center-mass-weighted','U2','Centro di massa','Centro di massa con origine su un corpo',
    'Due masse puntiformi sono lungo un asse: una massa fissa 2 kg si trova in x=0 e una massa m si trova in x=d>0. X è la coordinata del centro di massa.',
    v('massa nella posizione d','m','kg','M'),v('distanza fra le masse','d','m','L'),v('coordinata del centro di massa','X','m','L'),
    'x*z/(2+x)','X = md/(2 kg+m)',
    'Il centro di massa è una media delle posizioni pesata con le masse. Una massa maggiore contribuisce di più e sposta il centro verso la propria posizione. Essendo entrambe le masse positive, il centro deve trovarsi fra i due punti: qui fra zero e d, mai oltre il corpo più lontano.',
    'La definizione dà X=(2·0+md)/(2+m). Il primo termine è nullo perché la prima massa si trova all’origine.',
    ['La media geometrica d/2 vale soltanto per masse uguali.', 'Il denominatore è la massa totale e garantisce che la coordinata abbia unità di lunghezza.'],family='center-of-mass')

add('U2-center-mass-equal','U2','Centro di massa','Centro di massa di due masse uguali',
    'Due masse puntiformi uguali sono poste alle coordinate positive x₁ e x₂ dello stesso asse. X è la coordinata del centro di massa; non si suppone che una massa sia nell’origine.',
    v('prima coordinata','x₁','m','L'),v('seconda coordinata','x₂','m','L'),v('coordinata del centro di massa','X','m','L'),
    '(x+z)/2','X = (x₁+x₂)/2',
    'Masse uguali attribuiscono lo stesso peso alle due posizioni. Il centro di massa è quindi il punto medio delle coordinate. Spostare l’origine cambia entrambe le coordinate e quella del centro della stessa quantità, senza cambiare la distanza reciproca o la posizione fisica del centro rispetto ai corpi.',
    'X=(mx₁+mx₂)/(2m). La massa comune positiva si semplifica e rimane la media aritmetica delle coordinate.',
    ['La semidistanza |x₂−x₁|/2 non è la coordinata del centro quando l’origine non coincide con una delle masse.', 'Il punto medio è valido grazie all’uguaglianza delle masse, non soltanto perché ci sono due corpi.'],family='center-of-mass')

add('U2-torque-perpendicular','U2','Momenti ed equilibrio','Momento di una forza perpendicolare',
    'Una forza di modulo F agisce perpendicolarmente a un’asta a distanza r dal fulcro. M è il modulo del momento della forza rispetto al fulcro.',
    v('forza applicata','F','N','M*L/T**2'),v('distanza dal fulcro','r','m','L'),v('momento della forza','M','N·m','M*L**2/T**2'),
    'x*z','M = Fr',
    'L’efficacia nel produrre rotazione dipende dalla forza e dal braccio perpendicolare rispetto al fulcro. Nel caso assegnato la distanza r coincide con il braccio perché la forza è perpendicolare all’asta. La stessa forza applicata più vicino al fulcro produce un momento minore.',
    'Il modulo del momento è |r×F|=rFsinθ. Con θ=90° si ottiene M=Fr.',
    ['La distanza dal fulcro è il braccio soltanto quando è perpendicolare alla retta d’azione della forza.', 'N·m e J hanno la stessa dimensione, ma il momento e il lavoro descrivono grandezze fisiche diverse.'],family='torque')

add('U2-lever-equilibrium','U2','Leve','Forza equilibrante su una leva',
    'Una leva rigida senza peso è incernierata in un fulcro. Una forza resistente R ha braccio b; una forza motrice F ha braccio fisso 2 m e produce momento opposto. La leva è in equilibrio.',
    v('forza resistente','R','N','M*L/T**2'),v('braccio resistente','b','m','L'),v('forza motrice','F','N','M*L/T**2'),
    'x*z/2','F·(2 m) = Rb',
    'L’equilibrio rotazionale richiede somma dei momenti nulla rispetto al fulcro. Una forza applicata con braccio più lungo può equilibrare una forza maggiore applicata con braccio più corto. Il fulcro può fornire una reazione, ma il suo momento rispetto a se stesso è nullo.',
    'I momenti opposti si uguagliano: F·2=Rb. Dividendo per il braccio motore di 2 m otteniamo F=Rb/2.',
    ['La condizione non è semplicemente F=R: devono uguagliarsi i momenti, cioè forza per braccio.', 'Il peso dell’asta è trascurato esplicitamente; se non lo fosse aggiungerebbe un momento.'],family='levers')

add('U2-biceps-lever','U2','Leve nel corpo umano','Leva ideale dell’avambraccio',
    'Un modello ideale di avambraccio orizzontale è in equilibrio. Un carico esercita forza W verso il basso a 0,30 m dal gomito. La forza muscolare F ha braccio perpendicolare b rispetto al gomito, con 0<b<0,30 m. Si trascura il peso dell’avambraccio.',
    v('forza del carico','W','N','M*L/T**2'),v('braccio muscolare','b','m','L'),v('forza muscolare','F','N','M*L/T**2'),
    '3*x/(10*z)','F = W(0,30 m)/b',
    'Un braccio muscolare piccolo richiede una forza grande per produrre il momento necessario a sostenere un carico più lontano. Questo spiega il funzionamento di una leva scheletrica senza dedurre limiti o indicazioni cliniche. Il braccio è la distanza perpendicolare dalla retta d’azione del tendine al fulcro, non necessariamente la distanza dal punto d’inserzione.',
    'Poniamo a zero il momento totale sul gomito: Fb−W·0,30=0. Ne segue F=0,30W/b.',
    ['Usare la lunghezza dell’avambraccio al posto del braccio del tendine elimina il vantaggio o svantaggio meccanico reale del modello.', 'La forza richiesta può superare il peso sostenuto senza violare l’equilibrio: i bracci sono diversi.'],samples=[[10,'1/20'],[10,'1/10'],[20,'1/20'],[20,'1/10'],[30,'1/10']],domain='x > 0 and z > 0 and z < 3/10',family='levers')

add('U2-force-couple','U2','Momenti ed equilibrio','Coppia di forze',
    'Due forze parallele hanno uguale modulo F e versi opposti. Le loro rette d’azione distano perpendicolarmente d. M è il modulo del momento della coppia; la risultante delle forze è nulla.',
    v('modulo di ciascuna forza','F','N','M*L/T**2'),v('distanza fra le rette d’azione','d','m','L'),v('momento della coppia','M','N·m','M*L**2/T**2'),
    'x*z','M = Fd',
    'Una risultante nulla non garantisce equilibrio rotazionale. Due forze opposte applicate su rette diverse possono generare un momento netto che tende a ruotare il corpo. Il momento della coppia non dipende dal polo scelto: spostare il polo aggiunge contributi che si cancellano perché la risultante è zero.',
    'Scegliendo il polo su una retta d’azione, quella forza ha momento nullo. L’altra ha braccio d e momento Fd.',
    ['F+(-F)=0 annulla la risultante, ma non necessariamente la somma dei momenti.', 'Il braccio d è la separazione fra le rette d’azione: usare due volte d raddoppierebbe erroneamente il momento.'],family='torque')

add('U2-gravity-ratio','U2','Gravitazione','Confronto di attrazioni gravitazionali',
    'Una massa di prova resta la stessa. Rispetto a un riferimento, la massa attrattiva diventa α volte quella iniziale e la distanza fra i centri diventa β volte quella iniziale. I corpi si trattano come puntiformi o sferici esternamente. R=F/F₀ è il rapporto fra i moduli delle forze gravitazionali.',
    v('rapporto fra masse attrattive','α','1','1'),v('rapporto fra distanze','β','1','1'),v('rapporto delle forze','R','1','1'),
    'x/z**2','R = α/β²',
    'La gravitazione universale è proporzionale al prodotto delle masse e inversamente proporzionale al quadrato della distanza fra i centri. Confrontare due situazioni permette di eliminare la costante G e la massa di prova, che rimangono uguali. La distanza non è quella fra le superfici se i corpi hanno dimensioni finite.',
    'Dividiamo F=GMm/r² per F₀=GM₀m/r₀². Rimane F/F₀=(M/M₀)/(r/r₀)²=α/β².',
    ['Raddoppiare la distanza divide l’attrazione per quattro, non per due.', 'La legge usa la distanza fra i centri nel modello sferico, non lo spazio libero fra le superfici.'],family='newton-gravitation')

add('U2-circular-orbit','U2','Gravitazione e moto circolare','Rapidità orbitale ideale',
    'Una piccola massa percorre un’orbita circolare attorno a un corpo centrale. È noto il parametro gravitazionale μ=GM del corpo centrale e il raggio orbitale r. Si trascura ogni altra forza. V è la rapidità orbitale.',
    v('parametro gravitazionale','μ','m³/s²','L**3/T**2'),v('raggio orbitale','r','m','L'),v('rapidità orbitale','V','m/s','L/T'),
    'sqrt(x/z)','V = √(μ/r)',
    'La gravità fornisce la risultante centripeta necessaria alla traiettoria circolare. La massa del satellite si semplifica perché appare sia nella forza gravitazionale sia nell’inerzia. Il parametro μ raccoglie G e la massa centrale; i suoi valori qui sono idealizzati per rendere il ragionamento aritmetico esatto.',
    'Uguagliamo μm/r²= mV²/r. Semplificando m e un fattore r troviamo V²=μ/r e quindi la radice positiva.',
    ['La velocità di un’orbita circolare non è quella di fuga: per quest’ultima comparirebbe un fattore √2.', 'Il raggio si misura dal centro attrattivo, non dalla sua superficie.'],samples=[[4,1],[4,4],[16,1],[16,4]],family='newton-gravitation')

add('U2-descent-with-loss','U2','Conservazione dell’energia','Discesa con lavoro d’attrito',
    'Un corpo parte da fermo e perde quota h lungo una pista rettilinea in discesa di lunghezza L, con L≥h. Una forza resistente costante per unità di massa pari a 1 N/kg agisce lungo tutto il percorso in verso opposto al moto. Si assume g=10 m/s² e 10h>L, così la risultante lungo la pista permette la discesa da fermo. V è la rapidità finale.',
    v('dislivello','h','m','L'),v('lunghezza su cui agisce la resistenza','L','m','L'),v('rapidità finale','V','m/s','L/T'),
    'sqrt(20*x-2*z)','V = √(2gh−2(1 N/kg)L)',
    'La diminuzione di energia potenziale non diventa interamente energia cinetica quando agisce una forza dissipativa. La perdita gravitazionale dipende dal dislivello, mentre il lavoro della resistenza dipende dalla lunghezza effettiva su cui agisce. Tenerle separate permette di confrontare piste con uguale quota finale ma percorsi differenti.',
    'Il bilancio è mV²/2=mgh−m·(1 N/kg)L. Dividiamo per m e moltiplichiamo per due: V²=20h−2L.',
    ['Dislivello e lunghezza della pista sono quantità diverse: il peso usa h, il lavoro resistente usa L.', 'Se il radicando fosse negativo, i dati non consentirebbero l’arrivo da fermo nelle ipotesi adottate.'],samples=[[1,2],[1,8],[2,2],[2,12],[4,8]],domain='x > 0 and z > 0 and z >= x and 10*x > z',family='energy-with-dissipation')

add('U2-spring-launch','U2','Conservazione dell’energia','Lancio orizzontale con una molla',
    'Una molla ideale di costante 2 N/m, inizialmente compressa di ℓ, spinge un blocco di massa m su un piano orizzontale liscio. Il blocco parte da fermo. V è la rapidità quando la molla raggiunge la lunghezza naturale.',
    v('massa del blocco','m','kg','M'),v('compressione iniziale','ℓ','m','L'),v('rapidità al distacco','V','m/s','L/T'),
    'z*sqrt(2/x)','V = ℓ√((2 N/m)/m)',
    'Sul piano orizzontale il peso non cambia energia potenziale e, senza attrito, l’energia elastica iniziale diventa energia cinetica. La molla smette di spingere quando raggiunge la lunghezza naturale se non è fissata al blocco. La rapidità dipende linearmente dalla compressione e inversamente dalla radice della massa.',
    'Scriviamo kℓ²/2=mV²/2. I fattori un mezzo si cancellano: V²=kℓ²/m. Con k=2 e ℓ>0 si ricava V=ℓ√(2/m).',
    ['La forza iniziale della molla non è costante durante il lancio: usare F_iniziale per tutto il percorso sovrastima il lavoro.', 'La formula presume assenza di attrito e nessuna variazione di quota durante il tratto considerato.'],samples=[[2,1],[2,2],[8,1],[8,2]],family='elastic-energy')

# Independent scenarios completing the mechanics allocation.
add('U2-elastic-target-speed','U2','Urti','Bersaglio dopo un urto elastico unidimensionale',
    'Un corpo di massa m viaggia con velocità u e urta elasticamente un bersaglio inizialmente fermo di massa 2 kg lungo una retta. L’impulso esterno è trascurabile. V è la velocità finale del bersaglio nel verso iniziale.',
    v('massa incidente','m','kg','M'),v('velocità incidente','u','m/s','L/T'),v('velocità finale del bersaglio','V','m/s','L/T'),
    '2*x*z/(x+2)','V = 2mu/(m+2 kg)',
    'Nell’urto elastico si conservano sia la quantità di moto sia l’energia cinetica. Queste due informazioni determinano le due velocità finali. La velocità del bersaglio può superare quella iniziale dell’incidente quando il primo corpo è molto più massiccio; ciò non implica che il bersaglio abbia acquistato più energia di quella inizialmente disponibile.',
    'Per un urto elastico unidimensionale, la velocità relativa si inverte: V−v_finale_incidente=u. Inserendo v_finale_incidente=V−u nel bilancio mu=m v_finale_incidente+2V si ottiene V=2mu/(m+2).',
    ['La relazione mv/(m+2) vale per corpi che restano uniti, non per l’urto elastico.', 'Una velocità elevata di una massa piccola non va confusa con un’energia totale maggiore.'],family='elastic-collisions')

add('U2-collision-energy-loss','U2','Urti','Energia persa in un urto con massa uguale ferma',
    'Un corpo di massa m e rapidità u urta un secondo corpo fermo di uguale massa. I due restano uniti e l’impulso esterno è trascurabile. E è la diminuzione positiva dell’energia cinetica totale.',
    v('massa di ciascun corpo','m','kg','M'),v('rapidità iniziale incidente','u','m/s','L/T'),v('energia cinetica dissipata','E','J','M*L**2/T**2'),
    'x*z**2/4','E = mu²/4',
    'La quantità di moto determina una velocità comune finale pari a u/2. Per sapere quanta energia cinetica viene trasformata bisogna poi calcolare separatamente energia iniziale e finale. La presenza di una perdita di energia cinetica non indica una perdita di energia totale: cambia la forma dell’energia.',
    'K_i=mu²/2. Dopo l’urto K_f=(2m)(u/2)²/2=mu²/4. La diminuzione è E=K_i−K_f=mu²/4.',
    ['La massa finale è 2m e la velocità finale è u/2: entrambi i cambiamenti contano nel calcolo di K_f.', 'Si conserva la quantità di moto, mentre l’energia cinetica diminuisce nell’urto completamente anelastico.'],family='inelastic-collisions')

add('U2-horizontal-braking-friction','U2','Dinamica ed energia','Arresto per attrito su piano orizzontale',
    'Un corpo scivola su un piano orizzontale con rapidità iniziale v e coefficiente dinamico μ. Dopo il lancio non viene più spinto. Si assume g=10 m/s² e si trascura ogni altra resistenza. D è la distanza prima dell’arresto.',
    v('rapidità iniziale','v','m/s','L/T'),v('coefficiente dinamico','μ','1','1'),v('distanza di arresto','D','m','L'),
    'x**2/(20*z)','D = v²/(2μg)',
    'L’attrito trasforma tutta l’energia cinetica iniziale in energia interna. Sul piano orizzontale la normale vale mg e l’attrito ha modulo μmg. La massa si semplifica nel bilancio, perciò corpi di massa diversa ma stessa rapidità e stesso coefficiente si arrestano alla stessa distanza in questo modello.',
    'Imponiamo μmgD=mv²/2. Semplifichiamo la massa e isoliamo D=v²/(2μg), con g=10.',
    ['L’assenza della massa dipende dalla proporzionalità fra attrito e peso, non è una proprietà di ogni resistenza.', 'Raddoppiare la rapidità quadruplica la distanza se μ resta costante.'],samples=[[2,'1/5'],[2,'2/5'],[4,'1/5'],[4,'2/5']],family='braking')

add('U2-two-force-equilibrium','U2','Equilibrio traslazionale','Forza necessaria contro attrito e carico',
    'Un carrello si muove a velocità costante su un piano orizzontale. Una forza resistente assegnata R e una seconda forza resistente T agiscono entrambe all’indietro. F è la trazione orizzontale necessaria a mantenere il moto uniforme.',
    v('prima forza resistente','R','N','M*L/T**2'),v('seconda forza resistente','T','N','M*L/T**2'),v('trazione necessaria','F','N','M*L/T**2'),
    'x+z','F = R+T',
    'Velocità costante significa accelerazione nulla e quindi risultante nulla, non assenza di forze. La trazione deve compensare entrambe le resistenze. Questo esempio distingue l’idea errata che una forza sia sempre necessaria per mantenere una velocità dall’affermazione corretta che, in presenza di resistenze, serve una forza equilibrante.',
    'Il bilancio orientato è F−R−T=ma=0. Isolando la trazione si ottiene F=R+T.',
    ['La trazione non serve a produrre accelerazione in questa situazione: compensa forze resistenti già presenti.', 'Se le resistenze fossero nulle, per il moto uniforme non servirebbe una risultante motrice.'],family='force-balance')

if __name__=='__main__':
    # These four neighbouring settings add too little beyond the retained tasks.
    excluded={'U2-two-force-equilibrium','U2-subsystem-tension','U2-lowering-cable','U2-force-sum'}
    MODELS[:]=[m for m in MODELS if m['id'] not in excluded]
    concepts=json.loads(OUT.with_name('concepts_methods_mechanics.json').read_text())
    for model in MODELS:
        if model['id'] in concepts:
            model['conceptual']=concepts[model['id']]
        if model['id']=='U1-scientific-scale':
            model['integerVariables']=['z']
        if model['id']=='U2-frequency-count':
            model['integerVariables']=['x']
        if model['id']=='U1-vector-perpendicular':
            model['samples']=[[3,4],[3,'9/4'],['16/3',4],[8,6],[5,12]]
        if model['id']=='U2-elevator-apparent-weight':
            model['samples']=[[40,2],[40,4],[60,2],[60,4]]
    counts={u:sum(m['unitId']==u for m in MODELS) for u in ('U1','U2')}
    print(len(MODELS),counts)
    OUT.write_text(json.dumps(MODELS,ensure_ascii=False,indent=2)+'\n')
