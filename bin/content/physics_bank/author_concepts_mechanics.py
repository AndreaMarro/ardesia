#!/usr/bin/env python3
"""Individually written conceptual tasks; no external generation at build time."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'packs/semestre-filtro-2026-27/data/concepts_methods_mechanics.json'

C = {}


def add(model, prompt, choices, explanation, objective):
    C[model] = dict(prompt=prompt, options=choices, correctIndex=0,
                    explanation=explanation, objective=objective,
                    context='', assumptions=['Valgono le condizioni specificate nella domanda.'],
                    derivation=[], law='', traps=[], scope='syllabus_core')


add('U1-volume-conversion',
    'Due porzioni dello stesso liquido omogeneo hanno masse m e 2m e si trovano alla stessa temperatura e pressione. Si uniscono senza perdita di materiale. Quali grandezze diventano tre volte quelle della prima porzione?',
    ['Massa e volume; la densità resta uguale', 'Massa e densità; il volume resta uguale', 'Volume e densità; la massa resta uguale', 'Massa, volume e densità', 'Soltanto la densità'],
    'Una grandezza estensiva dipende dalla quantità di materia considerata: nel caso descritto, le masse delle porzioni si sommano. La massa complessiva è m+2m=3m. Poiché il liquido è lo stesso e le condizioni termiche e meccaniche coincidono, la densità è uguale nelle due porzioni. Se la prima occupa V=m/ρ, la seconda occupa 2V. Il volume finale è quindi V+2V=3V, assumendo il liquido omogeneo nelle condizioni indicate. La densità del sistema unito è il rapporto fra massa totale e volume totale: ρ_finale=3m/(3V)=m/V. Il fattore tre si cancella e la densità rimane invariata. La densità è dunque intensiva: non aumenta soltanto perché si prende più sostanza. Questo ragionamento non autorizza a sommare indiscriminatamente i volumi di sostanze diverse, che potrebbero mescolarsi con contrazione. Le condizioni dichiarate servono precisamente a mantenere costante il rapporto massa/volume.',
    'Distinguere grandezze intensive ed estensive mediante un’unione di sistemi')

add('U1-scientific-scale',
    'Due tempi sono 4×10⁻³ s e 2×10⁻⁴ s. Senza usare una calcolatrice, quale valore ha il rapporto fra il primo e il secondo?',
    ['20', '2', '1/20', '200', '1/2'],
    'La notazione scientifica separa un coefficiente dalla potenza di dieci che ne determina la scala. Nel rapporto fra due misure della stessa grandezza le unità si cancellano: rimane un numero puro. Separiamo allora i due contributi: (4×10⁻³)/(2×10⁻⁴)=(4/2)×(10⁻³/10⁻⁴). Il rapporto dei coefficienti è due. Per dividere potenze con la stessa base si sottraggono gli esponenti, conservandone i segni: −3−(−4)=1. Il rapporto delle potenze è quindi 10¹=10. Il prodotto finale vale 2×10=20. Possiamo controllare scrivendo i tempi come 0,004 s e 0,0002 s: venti intervalli piccoli formano quello più grande. Un rapporto pari a 1/20 descriverebbe invece l’ordine inverso, secondo tempo diviso primo. L’errore 2 nasce dall’ignorare completamente la differenza fra gli esponenti; l’errore 200 aggiunge un fattore dieci non presente nei dati.',
    'Dividere misure in notazione scientifica con esponenti negativi')

add('U1-vector-projection',
    'Un vettore di modulo 10 forma un angolo di 120° con il verso positivo dell’asse x. Sapendo che cos120°=−1/2, quale valore ha la componente orientata lungo x?',
    ['−5', '5', '−10', '10', '0'],
    'Il modulo di un vettore è una grandezza non negativa, ma una sua componente lungo un asse orientato può essere negativa. La componente indica infatti quanto il vettore si proietta nel verso positivo o nel verso negativo dell’asse. Per un angolo misurato dal semiasse positivo si usa A_x=A cosθ. Inseriamo i dati già forniti, senza calcolare funzioni trigonometriche: A_x=10×(−1/2)=−5. Il fattore un mezzo dimezza il modulo e il segno meno indica che la proiezione è rivolta verso il semiasse negativo. L’angolo di 120° è ottuso, quindi proprio questo segno è atteso geometricamente. Il valore +5 avrebbe lo stesso modulo ma il verso sbagliato. I valori ±10 richiederebbero un vettore parallelo all’asse, mentre una componente nulla richiederebbe un angolo retto. La risposta negativa non significa che il vettore abbia una lunghezza negativa: distingue correttamente componente orientata e modulo.',
    'Distinguere il modulo dalla componente orientata di un vettore')

add('U2-uniform-displacement',
    'In un sistema di riferimento inerziale, un carrello procede su una retta con velocità costante non nulla. Quale affermazione sulla forza risultante è necessariamente corretta?',
    ['La risultante è nulla', 'La risultante è costante e concorde con la velocità', 'La risultante è costante e opposta alla velocità', 'La risultante è uguale alla quantità di moto', 'La risultante aumenta con il tempo'],
    'Il secondo principio lega la forza risultante alla variazione della velocità, non alla velocità già posseduta. Un moto rettilineo con velocità costante ha accelerazione zero, perché il vettore velocità non cambia né modulo né direzione. Per una massa costante e positiva, F_risultante=ma dà quindi F_risultante=0. Non segue che ogni singola forza sia assente. Su un piano orizzontale, per esempio, peso e reazione normale possono compensarsi; anche una trazione potrebbe compensare una resistenza. Occorre sommare vettorialmente tutte le forze che agiscono sul carrello. Se invece la risultante fosse concorde con la velocità, la rapidità aumenterebbe; se fosse opposta, diminuirebbe. In entrambi i casi il moto non soddisfarebbe più il testo. Il riferimento inerziale è essenziale per applicare questa forma del principio senza introdurre forze apparenti. La quantità di moto può essere diversa da zero anche quando la sua variazione e la forza risultante sono nulle.',
    'Collegare inerzia, velocità costante e risultante delle forze')

add('U2-uniform-position',
    'Un grafico posizione-tempo è una retta che passa per i punti (0 s, 3 m) e (2 s, 7 m). Quale coppia descrive posizione iniziale e velocità?',
    ['3 m e 2 m/s', '0 m e 7/2 m/s', '3 m e 7/2 m/s', '7 m e 2 m/s', '2 m e 3 m/s'],
    'Nel grafico posizione-tempo la coordinata verticale del punto con tempo zero è la posizione iniziale. Il primo dato fornisce quindi direttamente x₀=3 m: non si può porre l’origine delle posizioni dove si trova il corpo senza cambiare il grafico assegnato. La velocità è la pendenza della retta, cioè il rapporto fra variazione della posizione e variazione del tempo. Fra i due punti lo spostamento è 7−3=4 m, mentre il tempo trascorso è 2−0=2 s. Il rapporto vale 4/2=2 m/s. La legge oraria diventa x(t)=3 m+(2 m/s)t e restituisce entrambi i punti. Dividere semplicemente 7 m per 2 s confonde la coordinata finale con lo spostamento: dà 3,5 m/s, che non è la pendenza del grafico. La retta ha pendenza costante, quindi la velocità istantanea coincide in ogni punto con quella media su qualsiasi intervallo.',
    'Leggere intercetta e pendenza in un grafico posizione-tempo')

add('U2-rest-accelerated-distance',
    'Un corpo parte da fermo e mantiene accelerazione costante positiva. Nel primo secondo percorre 1 m. Quanto percorre durante il solo secondo successivo, tra t=1 s e t=2 s?',
    ['3 m', '1 m', '2 m', '4 m', '8 m'],
    'La distanza dalla posizione iniziale nel moto uniformemente accelerato da fermo segue s(t)=at²/2. Il dato sul primo secondo stabilisce a/2=1 m/s², quindi a=2 m/s². Dopo due secondi la distanza complessiva dall’inizio è s(2)=2×2²/2=4 m. La domanda riguarda però soltanto l’intervallo fra uno e due secondi: sottraiamo la distanza già percorsa nel primo secondo, ottenendo 4−1=3 m. Il valore 4 m è corretto per il percorso totale fino a due secondi, ma non risponde all’intervallo richiesto. Possiamo controllare con la velocità: essa passa da 2 m/s a 4 m/s durante il secondo intervallo. Essendo l’accelerazione costante, la velocità media in quell’intervallo è (2+4)/2=3 m/s; moltiplicata per un secondo restituisce 3 m. La distanza cresce più rapidamente del tempo perché il corpo sta acquistando velocità.',
    'Distinguere distanza totale e distanza in un intervallo accelerato')

add('U2-opposed-force-acceleration',
    'Una persona spinge un carrello. Il carrello esercita sulla persona una forza uguale e opposta. Perché queste due forze non si annullano nel calcolo dell’accelerazione del solo carrello?',
    ['Agiscono su due corpi diversi', 'La forza della persona è sempre maggiore', 'La reazione compare soltanto dopo il movimento', 'La reazione è una forza senza effetti meccanici', 'La forza sul carrello non obbedisce al secondo principio'],
    'Il terzo principio descrive una coppia di interazione: la forza esercitata dalla persona sul carrello e quella esercitata dal carrello sulla persona hanno uguale modulo e verso opposto. Il punto decisivo è che agiscono su corpi differenti. Per scrivere l’equazione del moto del carrello bisogna disegnare soltanto le forze applicate al carrello: la spinta della persona, il peso, i contatti con il pavimento e le eventuali resistenze. La forza di reazione applicata alla persona appartiene invece al bilancio della persona. Non può essere inserita nel bilancio del carrello per cancellarne la spinta. Se scegliessimo come sistema persona più carrello, le due forze sarebbero interne e si cancellerebbero nella somma sul sistema completo; resterebbero comunque le forze esterne, fra cui il contatto della persona col suolo. Cambiare il sistema considerato cambia dunque quali forze compaiono nel bilancio, senza cambiare le leggi della dinamica.',
    'Distinguere una coppia azione-reazione dalle forze sullo stesso corpo')

add('U2-atwood',
    'Due masse positive diverse sono collegate da una fune ideale su una carrucola ideale. La massa maggiore scende accelerando. Quale confronto è corretto fra la tensione T e il peso P della massa maggiore?',
    ['T<P', 'T=P', 'T>P', 'T=0 necessariamente', 'T è il doppio di P'],
    'Consideriamo soltanto la massa maggiore e scegliamo come verso positivo quello verso il basso, uguale alla sua accelerazione. Su di essa agiscono il peso P verso il basso e la tensione T verso l’alto. La risultante orientata è P−T. Il secondo principio impone P−T=ma, con m>0 e a>0: la differenza P−T deve essere positiva. Ne segue T<P. Se tensione e peso fossero uguali, la risultante sarebbe zero e la massa non accelererebbe; potrebbe restare ferma o muoversi con velocità costante, condizioni diverse da quelle assegnate. Il fatto che la fune sia ideale rende uguale la tensione ai due lati della carrucola ideale, ma non la rende automaticamente uguale al peso di ciascuna massa. La massa più piccola sale e per essa la tensione supera il proprio peso. I due bilanci sono compatibili proprio perché i pesi sono diversi e la tensione ha lo stesso modulo.',
    'Usare il verso dell’accelerazione per confrontare tensione e peso')

add('U2-static-threshold',
    'Un blocco fermo su un piano orizzontale può sostenere un attrito statico massimo di 10 N. Una spinta orizzontale di 4 N non lo mette in moto e non ci sono altre forze orizzontali. Quanto vale il modulo dell’attrito effettivo?',
    ['4 N', '10 N', '6 N', '0 N', '14 N'],
    'L’attrito statico non ha sempre il suo valore massimo. Finché i corpi non scivolano, il suo modulo si adatta al valore necessario per mantenere l’equilibrio, entro il limite consentito dal contatto. Il blocco resta fermo, quindi l’accelerazione orizzontale è nulla e la somma delle forze orizzontali deve essere zero. La spinta di 4 N deve essere compensata da un attrito di 4 N diretto nel verso opposto. Questo valore è ammissibile perché è inferiore al massimo di 10 N. Scrivere direttamente 10 N introdurrebbe una risultante di 6 N opposta alla spinta e contraddirebbe la quiete descritta. La relazione corretta è |F_attrito_statico|≤μ_s N, non l’uguaglianza in tutte le situazioni. L’uguaglianza si raggiunge alla soglia dello scorrimento. Una volta iniziato lo scorrimento, il modello usa invece l’attrito dinamico e un diverso coefficiente, se previsto.',
    'Distinguere attrito statico effettivo e massimo attrito disponibile')

add('U2-kinetic-work-difference',
    'La somma dei lavori di tutte le forze su un corpo è −6 J. All’inizio il corpo possiede 10 J di energia cinetica. Quale energia cinetica ha alla fine?',
    ['4 J', '16 J', '6 J', '−6 J', '−4 J'],
    'Il teorema dell’energia cinetica afferma che il lavoro totale delle forze è uguale alla variazione dell’energia cinetica: W_tot=K_f−K_i. Il lavoro totale può essere negativo, mentre l’energia cinetica di una massa positiva non può esserlo. Isoliamo K_f aggiungendo K_i a entrambi i membri: K_f=K_i+W_tot. Con i dati assegnati otteniamo 10 J+(−6 J)=4 J. Il segno meno del lavoro indica che, nel complesso, le forze hanno sottratto energia cinetica al corpo. Non implica necessariamente che ogni forza abbia svolto un lavoro negativo: alcuni contributi possono essere positivi e altri negativi, purché la somma sia −6 J. La risposta 16 J eliminerebbe il segno del lavoro e descriverebbe un aumento di energia. Le risposte negative sarebbero incompatibili con la definizione K=mv²/2. I 4 J rimasti possono essere usati per ricavare la rapidità solo se si conosce anche la massa.',
    'Applicare il teorema dell’energia cinetica conservando il segno del lavoro')

add('U2-mechanical-power',
    'Una forza di trazione costante di 5 N è parallela alla velocità di un carrello. Il carrello percorre 4 m in 2 s con velocità costante. Qual è la potenza della trazione?',
    ['10 W', '20 W', '5/2 W', '40 W', '0 W'],
    'La potenza misura la rapidità con cui una forza trasferisce energia mediante lavoro. Poiché forza e spostamento sono paralleli e concordi, il lavoro della trazione è W=F s=5 N×4 m=20 J. Distribuito su due secondi, questo lavoro corrisponde alla potenza P=W/Δt=20 J/2 s=10 W. Il risultato si controlla anche mediante P=Fv: la velocità costante è v=4 m/2 s=2 m/s, quindi P=5 N×2 m/s=10 W. La velocità costante non rende nullo il lavoro di ciascuna forza. Essa rende nulla la variazione complessiva dell’energia cinetica: altre forze resistenti possono svolgere un lavoro negativo uguale a quello positivo della trazione. È quindi possibile che la trazione fornisca potenza mentre la rapidità resta costante. Bisogna distinguere la potenza di una specifica forza dalla somma delle potenze di tutte le forze sul corpo.',
    'Distinguere potenza della trazione e variazione dell’energia cinetica')

add('U2-impulse',
    'Una forza costante di 6 N agisce per 2 s lungo un asse. Quale forza costante, nello stesso verso, produce lo stesso impulso agendo per 3 s?',
    ['4 N', '9 N', '6 N', '12 N', '2 N'],
    'Per una forza costante l’impulso è il prodotto della forza per la durata dell’azione: J=FΔt. Il primo intervento produce J=6 N×2 s=12 N·s. Per ottenere la stessa variazione della quantità di moto nello stesso verso, la seconda forza deve fornire lo stesso impulso di 12 N·s. Indicando con F₂ il suo modulo, scriviamo F₂×3 s=12 N·s. Dividendo per 3 s otteniamo F₂=4 N. Il tempo maggiore permette quindi di usare una forza minore. Non si conserva la forza fra i due interventi: si conserva il prodotto forza-tempo richiesto dalla domanda. Un ragionamento alternativo confronta le durate: la seconda è 3/2 della prima, perciò la forza deve diventare 2/3 di 6 N. Questo esempio è utile per comprendere come prolungare un tempo di arresto riduca la forza media necessaria, a parità di variazione della quantità di moto.',
    'Conservare l’impulso quando cambia la durata della forza')

add('U2-inelastic-rest',
    'Due corpi restano attaccati dopo un urto. Durante l’urto l’impulso delle forze esterne è trascurabile. Quale grandezza del sistema è necessariamente conservata?',
    ['La quantità di moto totale', 'L’energia cinetica totale', 'La velocità di ciascun corpo', 'La quantità di moto di ciascun corpo separatamente', 'La somma dei moduli delle due velocità'],
    'La conservazione della quantità di moto totale deriva dall’assenza di un impulso esterno significativo durante l’intervallo considerato. Le forze che i due corpi si esercitano sono interne al sistema: i loro impulsi sono uguali e opposti e si compensano nella somma. Ciascun corpo può cambiare quantità di moto, ma il cambiamento totale è nullo. Il fatto che dopo l’urto i corpi restino attaccati identifica un urto completamente anelastico. In generale l’energia cinetica diminuisce, trasformandosi in energia interna, deformazioni e altre forme. Non si viola per questo la conservazione dell’energia totale. Non si conservano necessariamente le velocità individuali: esse devono diventare uguali se i corpi proseguono uniti. Anche la somma dei loro moduli non è una grandezza protetta da una legge di conservazione. La scelta corretta dipende dunque dall’isolamento impulsivo del sistema e non dall’elasticità dell’urto.',
    'Selezionare la conservazione valida in un urto completamente anelastico')

add('U2-center-mass-weighted',
    'Due corpi interagiscono attraverso una molla e possono muoversi senza attrito su un piano orizzontale. La risultante esterna orizzontale sul sistema è nulla. Come si muove orizzontalmente il centro di massa?',
    ['Con velocità costante, eventualmente nulla', 'Sempre fermo, qualunque fosse la velocità iniziale', 'Con accelerazione uguale a quella del corpo più leggero', 'Oscilla necessariamente come la molla', 'Accelera nella direzione del corpo più pesante'],
    'Il moto del centro di massa è governato dalla risultante delle forze esterne sul sistema: M a_CM=F_esterna. La forza elastica della molla è un’interazione interna e può modificare il moto relativo dei due corpi; i suoi contributi si compensano nella somma su tutto il sistema. La risultante esterna orizzontale è dichiarata nulla, quindi l’accelerazione orizzontale del centro di massa è zero. Ne segue una velocità costante. Se il centro di massa era inizialmente fermo, rimane fermo; se aveva una velocità iniziale diversa da zero, continua a traslare con quella velocità. È quindi troppo forte affermare che sia sempre fermo. I due corpi possono oscillare l’uno rispetto all’altro mentre il loro centro di massa avanza uniformemente. Questa distinzione separa il moto complessivo del sistema dal moto interno e spiega perché la sola presenza di forze intense fra i corpi non imponga un’accelerazione del centro di massa.',
    'Distinguere moto del centro di massa e movimenti interni al sistema')

add('U2-torque-perpendicular',
    'Una forza di modulo 8 N è applicata a un corpo rigido. La sua retta d’azione passa esattamente per il fulcro scelto. Qual è il momento della forza rispetto a quel fulcro?',
    ['0 N·m', '8 N·m', '4 N·m', '−8 N·m necessariamente', 'Non può essere nullo perché la forza è non nulla'],
    'Il momento di una forza rispetto a un fulcro non dipende soltanto dal modulo della forza. Conta anche il braccio, definito come la distanza perpendicolare fra il fulcro e la retta d’azione della forza. Se la retta d’azione passa per il fulcro, questa distanza è zero, anche se il punto di applicazione non coincide con il fulcro. Il modulo del momento vale quindi τ=F b=8 N×0 m=0 N·m. La forza può ancora avere effetti traslazionali o produrre reazioni nei vincoli, ma non ha tendenza a ruotare il corpo attorno al fulcro scelto. Non bisogna usare come braccio qualsiasi distanza fra punto di applicazione e fulcro: deve essere la distanza perpendicolare dalla retta d’azione. In termini vettoriali, posizione relativa e forza sono parallele, quindi il loro prodotto vettoriale è nullo. Questa condizione spiega perché una forza grande può risultare inefficace nel far ruotare una leva.',
    'Riconoscere un momento nullo da una retta d’azione passante per il fulcro')

add('U2-force-couple',
    'Due forze parallele di 5 N, uguali e opposte, agiscono su rette distinte separate da 2 m. Quale coppia di valori descrive il modulo della risultante e il modulo del momento della coppia?',
    ['0 N e 10 N·m', '10 N e 0 N·m', '0 N e 0 N·m', '5 N e 10 N·m', '10 N e 20 N·m'],
    'Le due forze hanno uguale modulo e verso opposto, quindi la loro somma vettoriale è zero. Questo basta a cancellare la risultante, ma non necessariamente il momento. Le rette d’azione sono infatti separate: le due forze tendono a far ruotare il corpo nello stesso senso. Una coppia di forze produce un momento di modulo τ=F d, dove d è la distanza perpendicolare fra le rette. Inserendo i dati troviamo τ=5 N×2 m=10 N·m. Per controllare il fattore numerico possiamo scegliere come polo un punto sulla retta della prima forza: il suo braccio è zero, mentre l’altra ha braccio 2 m e fornisce da sola il momento totale di 10 N·m. Usare 2Fd conterebbe due volte la separazione completa. Il sistema può quindi avere risultante nulla e momento non nullo: l’equilibrio traslazionale da solo non garantisce l’equilibrio rotazionale di un corpo rigido.',
    'Distinguere equilibrio traslazionale e rotazionale per una coppia di forze')

add('U2-freefall-time',
    'Due corpi di masse m e 3m sono lasciati contemporaneamente da fermi dalla stessa altezza, nello stesso campo gravitazionale uniforme e senza resistenza dell’aria. Qual è il rapporto fra il tempo di caduta del corpo più massiccio e quello dell’altro?',
    ['1', '3', '1/3', '√3', '1/√3'],
    'La forza peso sul corpo di massa m è mg, mentre su quello di massa 3m è 3mg. La forza maggiore non implica in questo caso un’accelerazione maggiore, perché aumenta nella stessa proporzione anche la massa che deve essere accelerata. Applicando il secondo principio otteniamo a=F/m=mg/m=g per il primo corpo e a=3mg/(3m)=g per il secondo. Entrambi partono da fermi e percorrono lo stesso dislivello h con la stessa accelerazione. La legge h=gt²/2 porta a t=√(2h/g) e non contiene la massa. I due tempi sono dunque uguali e il rapporto richiesto è uno. L’assenza di resistenza dell’aria è decisiva: in un fluido la forma, la superficie e la resistenza potrebbero modificare il confronto. Anche le condizioni iniziali devono coincidere; un corpo lanciato inizialmente verso il basso avrebbe un tempo diverso pur conservando la stessa accelerazione gravitazionale.',
    'Spiegare perché la caduta ideale non dipende dalla massa')


add('U1-vector-angle-ratio',
    'In un triangolo rettangolo, l’ipotenusa misura 5 cm e il cateto opposto all’angolo acuto θ misura 3 cm. Quale coppia fornisce sinθ e cosθ?',
    ['3/5 e 4/5', '4/5 e 3/5', '3/4 e 4/3', '3 e 4', '5/3 e 5/4'],
    'Seno e coseno di un angolo acuto in un triangolo rettangolo sono rapporti di lunghezze, quindi sono adimensionali. Il seno è il rapporto fra cateto opposto e ipotenusa: sinθ=3/5. Per ricavare il coseno serve invece il cateto adiacente. Usiamo il teorema di Pitagora: il quadrato del cateto mancante è 5²−3²=25−9=16. Essendo una lunghezza positiva, il cateto vale √16=4 cm. Il coseno è dunque cosθ=4/5. Scambiare seno e coseno scambierebbe il ruolo del cateto opposto con quello adiacente. Il rapporto 3/4 corrisponde invece alla tangente dell’angolo, che usa due cateti e non l’ipotenusa. Possiamo controllare con l’identità sin²θ+cos²θ=1: 9/25+16/25=25/25=1. I rapporti seno e coseno devono inoltre trovarsi fra zero e uno per un angolo acuto, perché nessun cateto supera l’ipotenusa.',
    'Ricavare seno e coseno da un triangolo rettangolo con dati semplici')

add('U2-mean-velocity',
    'Una persona cammina per 6 m verso est e torna al punto di partenza percorrendo 6 m verso ovest. L’intero percorso dura 4 s. Quali sono il modulo della velocità media vettoriale e la rapidità media?',
    ['0 m/s e 3 m/s', '3 m/s e 0 m/s', '3 m/s e 3 m/s', '0 m/s e 0 m/s', '6 m/s e 3 m/s'],
    'La velocità media vettoriale usa lo spostamento complessivo, cioè la differenza fra posizione finale e iniziale. Dopo l’andata e il ritorno le due posizioni coincidono: lo spostamento è zero e la velocità media è 0/4=0 m/s. La rapidità media usa invece la lunghezza totale del percorso. Il tratto di andata e quello di ritorno contribuiscono entrambi positivamente alla distanza: 6+6=12 m. Dividendo per i 4 s complessivi troviamo 12/4=3 m/s. I due risultati non sono in contraddizione: rispondono a definizioni diverse. La velocità media nulla non afferma che la persona sia rimasta ferma o che la sua velocità istantanea sia stata sempre nulla. Significa soltanto che gli spostamenti orientati si sono compensati nell’intervallo. Conservare questa distinzione è essenziale quando un moto cambia verso: sommare le distanze prima di calcolare la velocità media vettoriale darebbe una risposta diversa dalla grandezza richiesta.',
    'Distinguere spostamento, percorso, velocità media e rapidità media')

add('U2-gravitational-energy',
    'Un corpo descrive un percorso chiuso, tornando alla quota iniziale, in un campo gravitazionale uniforme. Qual è il lavoro totale della sola forza peso lungo l’intero percorso?',
    ['Zero', 'Positivo per qualunque percorso', 'Negativo per qualunque percorso', 'Uguale al peso moltiplicato per tutta la lunghezza percorsa', 'Dipende dal tempo impiegato anche a percorso fissato'],
    'La forza peso in un campo uniforme è conservativa: il suo lavoro dipende dalle quote iniziale e finale, non dalla forma della traiettoria seguita fra quei punti. Con l’asse verticale positivo verso l’alto, l’energia potenziale è U=mgh e il lavoro del peso è W_peso=−ΔU=mg(h_iniziale−h_finale). Nel percorso chiuso la quota finale coincide con quella iniziale, quindi la differenza è zero e il lavoro complessivo del peso è nullo. Durante una discesa il peso può compiere lavoro positivo; durante una salita compie lavoro negativo. Nel giro completo i contributi si compensano. Non bisogna moltiplicare semplicemente mg per la lunghezza totale della traiettoria, perché il lavoro usa la componente della forza lungo ciascuno spostamento e conserva il segno. Altre forze, per esempio l’attrito, potrebbero compiere un lavoro totale non nullo sullo stesso percorso: la domanda riguarda specificamente il peso, non la somma dei lavori.',
    'Riconoscere il carattere conservativo del peso su un percorso chiuso')

add('U2-lever-equilibrium',
    'Un oggetto è modellato come corpo perfettamente rigido. Durante una rotazione, quale proprietà rimane costante per qualunque coppia di suoi punti materiali?',
    ['La distanza reciproca fra i due punti', 'La posizione di entrambi rispetto al laboratorio', 'La direzione del segmento che li collega rispetto al laboratorio', 'La velocità di ciascun punto', 'La quota di ciascun punto'],
    'Il modello di corpo rigido trascura le deformazioni: le distanze fra tutte le coppie di punti materiali rimangono costanti nel tempo. Questa è una proprietà della configurazione interna del corpo, non una dichiarazione sulla sua posizione nel laboratorio. Il corpo può traslare e ruotare. Durante una rotazione, il segmento che collega due suoi punti mantiene la stessa lunghezza, ma in generale cambia direzione rispetto agli assi fissi. Le coordinate dei punti, le loro quote e i vettori velocità possono cambiare. Per esempio, i due estremi di un’asta rigida restano separati dalla lunghezza dell’asta anche mentre questa gira attorno a un fulcro. Rigidità non significa dunque immobilità, equilibrio o assenza di forze. Serve invece a descrivere il sistema mediante traslazioni e rotazioni senza dover seguire una deformazione interna. Negli esercizi su leve e momenti, questa idealizzazione permette di considerare costanti i bracci geometrici previsti dalla configurazione assegnata.',
    'Definire il corpo rigido distinguendolo dall’equilibrio statico')


CONCEPT_TOPICS = {
    'U1-volume-conversion': ('Grandezze fisiche', 'Grandezze intensive ed estensive'),
    'U1-scientific-scale': ('Notazione scientifica', 'Rapporto fra potenze di dieci'),
    'U1-vector-projection': ('Vettori e trigonometria', 'Segno di una componente vettoriale'),
    'U1-vector-angle-ratio': ('Trigonometria elementare', 'Seno e coseno nel triangolo rettangolo'),
    'U2-uniform-displacement': ('Principi della dinamica', 'Inerzia e risultante nulla'),
    'U2-uniform-position': ('Cinematica e grafici', 'Intercetta e pendenza del grafico posizione-tempo'),
    'U2-mean-velocity': ('Cinematica', 'Velocità media vettoriale e rapidità media'),
    'U2-rest-accelerated-distance': ('Cinematica', 'Distanza percorsa in intervalli successivi'),
    'U2-freefall-time': ('Caduta libera', 'Indipendenza dell’accelerazione dalla massa'),
    'U2-opposed-force-acceleration': ('Principi della dinamica', 'Forze di azione e reazione'),
    'U2-atwood': ('Funi ideali e dinamica', 'Tensione e peso durante un’accelerazione'),
    'U2-static-threshold': ('Attrito', 'Attrito statico effettivo e soglia'),
    'U2-gravitational-energy': ('Forze conservative', 'Lavoro del peso su un percorso chiuso'),
    'U2-kinetic-work-difference': ('Lavoro ed energia', 'Segno del lavoro totale e variazione di energia cinetica'),
    'U2-mechanical-power': ('Potenza', 'Potenza di una forza e bilancio delle potenze'),
    'U2-impulse': ('Quantità di moto e impulso', 'Compensazione fra forza e durata'),
    'U2-inelastic-rest': ('Urti e conservazione', 'Quantità di moto in un urto anelastico'),
    'U2-center-mass-weighted': ('Centro di massa', 'Moto del centro di massa e forze esterne'),
    'U2-torque-perpendicular': ('Momenti delle forze', 'Braccio nullo e momento nullo'),
    'U2-lever-equilibrium': ('Corpo rigido', 'Invarianza delle distanze interne'),
    'U2-force-couple': ('Equilibrio del corpo rigido', 'Coppia di forze e momento risultante'),
}
for model_id, (microarea, topic) in CONCEPT_TOPICS.items():
    C[model_id].update(microarea=microarea, topic=topic, title=topic,
                       syllabusSubtopics=[topic])


if __name__ == '__main__':
    OUT.write_text(json.dumps(C, ensure_ascii=False, indent=2) + '\n')
    print(len(C), 'additional conceptual tasks')
