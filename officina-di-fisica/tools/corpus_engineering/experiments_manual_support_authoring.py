"""Eight additive experiment editions, authored separately from their review.

Uses the existing astra/1 importer and assessmentSelection contract. Original
records, installed laws, rendering and numeric acceptance remain unchanged.
No scientific acceptance, publication or registry writes are performed here.
"""
import base64
import json
from pathlib import Path
from .pipeline import canonical, digest, git_bytes, sha

BATCH = 'experiments-manual-support-revision-263'
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'

def T(value): return {'type': 'text', 'text': value}
def F(value): return {'type': 'formula', 'text': value}

# The values select two questions, not their answers. The installed model still
# supplies every numeric expected value through the existing experiment engine.
SPECS = {
 'SIM-C3-L07-05': {
  'points': [2.25, 4], 'asset': 'adiabatic-manual-paths.svg',
  'caption': 'Tre stati dello stesso gas ideale: il volume cresce, la pressione e la temperatura diminuiscono. La larghezza rappresenta V/V₀ alla stessa scala; la pressione è indicata numericamente, non dalla dimensione delle molecole.',
  'transfer': 'Espandi reversibilmente un gas ideale isolato fino a V/V₀ = {x}, con γ = 3/2 e p₀ = 100 kPa. Quale pressione finale trovi? Usa la radice quadrata prima del cubo; inserisci il valore in kPa.',
  'blocks': [
   T('Qui confrontiamo trasformazioni di un gas ideale con capacità termiche costanti e γ=3/2. Le pareti sono isolate: non entra calore. L’espansione è reversibile, così il gas attraversa stati di equilibrio e possiamo usare pV^γ costante. Non applicheremmo questa relazione a una libera espansione irreversibile solo perché il recipiente è isolato.'),
   T('Il gas compie lavoro sull’esterno. Senza calore in ingresso, l’energia necessaria viene dalla sua energia interna: la temperatura scende. In un’isoterma la temperatura resterebbe invece costante grazie a un diverso scambio energetico. Per questo, partendo dallo stesso stato, la pressione adiabatica scende più di quella isoterma.'),
   F(r'pV^{3/2}=p_0V_0^{3/2}'), F(r'r=V/V_0'), F(r'p=\frac{100}{r^{3/2}}\,\mathrm{kPa}'),
   T('Il rapporto r è un numero puro: elevandolo a una potenza non introduciamo nuove unità. Nel primo controllo r=2,25=9/4. L’esponente 3/2 dice di prendere la radice quadrata e poi il cubo. La radice di 9/4 è 3/2; il suo cubo è 27/8. Dividere per questa frazione equivale a moltiplicare per 8/27.'),
   F(r'\left(\frac94\right)^{3/2}=\left(\frac32\right)^3=\frac{27}{8}'),
   F(r'p=100\cdot\frac8{27}\,\mathrm{kPa}=\frac{800}{27}\,\mathrm{kPa}'),
   T('La frazione 800/27 kPa è il risultato esatto. Per il riquadro numerico bastano due decimali, ottenuti per divisione scritta: 27·29=783, resto 17; 170 diviso 27 dà 6, resto 8; 80 diviso 27 dà 2, resto 26; la cifra seguente è 9. Arrotonda quindi 29,629… a 29,63 e inserisci 29.63. Non devi valutare una potenza decimale con una calcolatrice.'),
   T('Nel trasferimento il volume è quattro volte quello iniziale. La radice di 4 è 2, il cubo di 2 è 8 e 100/8=25/2=12,5 kPa. Puoi controllare il risultato dimezzando 100 tre volte: 50, 25, 12,5.'),
   F(r'p(4)=\frac{100}{(\sqrt4)^3}\,\mathrm{kPa}'), F(r'p(4)=\frac{100}{8}\,\mathrm{kPa}=12{,}5\,\mathrm{kPa}'),
   T('Anche l’inversa si risolve esattamente in questo stato: da p/p₀=1/8 ricavi r^(3/2)=8; prendi la radice cubica e poi il quadrato, ottenendo r=4. Per il gas ideale T/T₀=(p/p₀)r=4/8=1/2. La pressione finale di 25 kPa apparterrebbe invece all’isoterma a r=4: non è la risposta di questa adiabatica.'),
   F(r'r=\left(\frac{p_0}{p}\right)^{2/3},\qquad p>0'),
   T('Gli altri valori del cursore servono a osservare la curva. I due conti richiesti sono r=9/4 e r=4, con il procedimento manuale appena descritto. Controlla sempre che nell’espansione r>1 la pressione sia positiva e minore di 100 kPa.')],
 },
 'SIM-C4-L09-02': {
  'points': [30, 90], 'asset': 'lorentz-manual-angles.svg',
  'caption': 'La stessa velocità e lo stesso campo formano prima 0°, poi 30° e 90°. Le frecce v e B hanno unità e scale proprie. Per q positiva, il simbolo cerchio con punto indica la forza uscente dal piano; il suo modulo è riportato sotto ogni costruzione.',
  'transfer': 'Una carica positiva di 2 µC si muove a 3 m/s in un campo uniforme di 1 T. L’angolo fra velocità e campo è {x}. Qual è il modulo della forza in µN? Usa i valori esatti degli angoli notevoli.',
  'blocks': [
   T('La forza magnetica dipende dalla parte della velocità perpendicolare al campo. Se la particella procede lungo il campo, questa parte è nulla; se procede perpendicolarmente, coincide con tutta la velocità. Il seno dell’angolo esprime proprio questa proiezione. La carica assegnata è positiva e il campo è uniforme.'),
   F(r'\mathbf F=q\,\mathbf v\times\mathbf B'), F(r'F=|q|vB\sin\theta'),
   T('Convertiamo la carica prima di fissare la scala: 2 µC significa 2·10⁻⁶ C. Il prodotto dei tre moduli è (2·10⁻⁶)·3·1=6·10⁻⁶ N, cioè 6 µN. Il tesla ha unità N·s/(C·m), così C·(m/s)·T si riduce a N. Rimane soltanto il fattore geometrico, che è un numero puro.'),
   F(r'|q|vB=2\cdot3\cdot1\cdot10^{-6}\,\mathrm N'), F(r'|q|vB=6\cdot10^{-6}\,\mathrm N=6\,\mu\mathrm N'),
   T('Per il primo controllo θ=30°. Il seno vale esattamente 1/2: basta dimezzare 6. Nel trasferimento θ=90°, il seno vale 1 e la forza raggiunge 6 µN. Entrambi i risultati sono già nell’unità del riquadro; non inserire 3·10⁻⁶ quando il riquadro chiede micronewton.'),
   F(r'F(30^\circ)=6\cdot\frac12\,\mu\mathrm N'), F(r'F(30^\circ)=3\,\mu\mathrm N'),
   F(r'F(90^\circ)=6\cdot1\,\mu\mathrm N'), F(r'F(90^\circ)=6\,\mu\mathrm N'),
   T('Il verso richiede un controllo distinto dal modulo. Nel disegno v punta a destra e B ha una componente verso l’alto: la mano destra dà una forza uscente dal foglio. Cambiando il segno della carica, il verso si inverte, ma il modulo resta positivo. Non attribuiamo un modulo negativo alla forza.'),
   T('La forza magnetica resta perpendicolare alla velocità: può curvare la traiettoria senza aumentare l’energia cinetica. Infatti F·v=0. Non bisogna confondere questo risultato con l’assenza di accelerazione: può cambiare la direzione del moto anche quando la rapidità resta costante.'),
   F(r'B=\frac{F}{|q|v\sin\theta}'),
   T('Usando il primo risultato nell’inversa, 3·10⁻⁶ N diviso [(2·10⁻⁶ C)(3 m/s)(1/2)] restituisce 1 T: i fattori micro si semplificano. A 0° o 180° il denominatore si annulla e la forza nulla non permette di determinare B. Tutti i moduli devono rispettare 0≤F≤6 µN. Gli angoli intermedi del cursore sono osservazioni; le due verifiche numeriche richiedono 30° e 90°.')],
 },
 'SIM-C5-L01-01': {
  'points': [0.5, 1], 'asset': 'oscillator-manual-quarter-period.svg',
  'caption': 'La stessa massa è mostrata all’estremo positivo, dopo un quarto di periodo all’equilibrio e dopo mezzo periodo all’estremo negativo. L’asse della posizione mantiene origine, verso e scala in centimetri nei tre pannelli.',
  'transfer': 'La massa parte ferma dall’estremo +4 cm e ha periodo 2 s. Quale posizione con segno occupa dopo {x}? Individua prima la frazione di periodo, senza calcolare un coseno generico.',
  'blocks': [
   T('La massa parte dall’estremo positivo, a +4 cm, e torna nello stesso stato dopo 2 s. L’ampiezza è sempre 4 cm; la posizione può invece essere positiva, nulla o negativa. Il modello assume una molla ideale, senza dissipazione. La fase iniziale è fissata dalla partenza dall’estremo, quindi scegliamo il coseno.'),
   F(r'x(t)=A\cos(2\pi t/T)'), F(r'A=4\,\mathrm{cm},\qquad T=2\,\mathrm s'),
   T('Prima di sostituire π, conta le frazioni di un giro: t/T è il numero di periodi trascorsi. Dopo 0,5 s hai percorso (1/2)/2=1/4 di periodo. La fase è 2π·1/4=π/2: la proiezione sull’asse della posizione è nulla. È una proprietà del quarto di giro, non una stima decimale del coseno.'),
   F(r'\frac{t}{T}=\frac{1/2}{2}=\frac14'), F(r'x(0{,}5\,\mathrm s)=4\cos(\pi/2)\,\mathrm{cm}'), F(r'x(0{,}5\,\mathrm s)=0\,\mathrm{cm}'),
   T('Nel trasferimento è trascorso 1 s, cioè mezzo periodo. La fase è π e il coseno vale −1: la massa è all’estremo opposto, x=−4 cm. Nel riquadro inserisci −4; +4 descriverebbe la posizione iniziale o il ritorno dopo un periodo intero.'),
   F(r'x(1\,\mathrm s)=4\cos\pi\,\mathrm{cm}=-4\,\mathrm{cm}'),
   T('Il coseno può essere costruito come proiezione di una rotazione. La massa reale del banco oscilla lungo l’asse, non compie quel giro. All’equilibrio la posizione è zero ma la velocità ha modulo massimo; agli estremi accade il contrario. Una posizione nulla non significa quindi che il moto si sia fermato.'),
   T('Puoi ricavare il periodo dal tempo del primo arrivo all’estremo opposto: quel tempo vale T/2, quindi T=2t. Con t=1 s ritrovi 2 s. La precisazione “primo arrivo” conta: una sola posizione può ripetersi in molti istanti e non determina da sola il periodo.'),
   F(r'T=2t_{\rm primo\ estremo\ opposto}'), F(r'|x|\le A'),
   T('Come controllo delle unità, t/T è puro e il coseno non ha unità; x conserva i centimetri di A. Il quarto e il mezzo periodo bastano per le due domande assegnate. Le altre posizioni del cursore permettono di seguire il moto senza richiedere valutazioni numeriche di coseni.')],
 },
 'SIM-C5-L02-03': {
  'points': [0.25, 0.75], 'asset': 'travelling-wave-manual-probe.svg',
  'caption': 'Tre istanti della stessa onda che avanza verso destra. La sonda resta nella posizione spaziale x=0: registra prima zero, poi +3 cm e poi −3 cm. Le coordinate orizzontali sono in metri, gli spostamenti verticali in centimetri.',
  'transfer': 'La sonda è fissa in x = 0 per l’onda y = 3 sin(2πt − πx) cm, con t in secondi e x in metri. Quale spostamento con segno misura al tempo {x}? Usa la frazione di periodo.',
  'blocks': [
   T('Qui x indica dove si trova la sonda lungo la corda, mentre y indica lo spostamento trasversale della corda. Tenere la sonda in x=0 non impone y=0: la corda in quel punto continua a oscillare. L’onda è armonica e si propaga verso +x nel mezzo ideale del modello.'),
   F(r'y(x,t)=A\sin(\omega t-kx)'), F(r'A=3\,\mathrm{cm}'), F(r'\omega=2\pi\,\mathrm{rad/s}'), F(r'k=\pi\,\mathrm{rad/m}'),
   T('Il prodotto ωt e il prodotto kx sono fasi: le unità di tempo e lunghezza si semplificano nei rispettivi rapporti. Alla sonda x=0 il termine spaziale si annulla. Poiché ω=2π rad/s, un giro completo richiede T=1 s. Per le domande basta riconoscere un quarto e tre quarti di questo periodo.'),
   F(r'y(0,t)=3\sin(2\pi t)\,\mathrm{cm}'), F(r'T=\frac{2\pi}{\omega}=1\,\mathrm s'),
   T('A t=0,25 s=1/4 s la fase è π/2. Il seno vale 1 e la sonda registra +3 cm. A t=0,75 s=3/4 s la fase è 3π/2: il seno vale −1 e la lettura è −3 cm. Il meno indica il lato opposto rispetto all’equilibrio; non un’ampiezza negativa.'),
   F(r'y(0,1/4)=3\sin(\pi/2)\,\mathrm{cm}'), F(r'y(0,1/4)=+3\,\mathrm{cm}'),
   F(r'y(0,3/4)=3\sin(3\pi/2)\,\mathrm{cm}'), F(r'y(0,3/4)=-3\,\mathrm{cm}'),
   T('La cresta avanza lungo la corda, ma il punto osservato sale e scende. Per una fase costante, ωt−kx rimane costante: ricavando x trovi una velocità di propagazione ω/k=2 m/s. È la velocità della forma d’onda; non è la velocità trasversale della particella della corda.'),
   F(r'\lambda=\frac{2\pi}{k}=2\,\mathrm m'), F(r'u=\frac{\omega}{k}=2\,\mathrm{m/s}'),
   T('Nell’inversa, dal tempo del primo massimo dopo il passaggio crescente per l’equilibrio ricavi T=4t: 4·0,25 s=1 s. Specificare il primo massimo elimina l’ambiguità delle ripetizioni periodiche. Le letture devono rimanere fra −3 e +3 cm. Sommare il termine spaziale anche in x=0 oppure ignorare il segno a tre quarti di periodo produrrebbe un altro stato della corda.')],
 },
 'SIM-C5-L03-02': {
  'points': [0.5, 1], 'asset': 'interference-manual-half-full-path.svg',
  'caption': 'Confronto nello stesso tipo di istante, quando il primo contributo vale +2 cm: a differenza di cammino nulla o intera onda il secondo vale +2 cm; a mezza onda vale −2 cm. Le barre sono spostamenti istantanei con segno; il valore A sotto i pannelli è invece l’ampiezza non negativa della somma.',
  'transfer': 'Due sorgenti coerenti partono in fase e arrivano alla sonda ciascuna con ampiezza 2 cm. I cammini differiscono di {x} lunghezze d’onda. Quale ampiezza risultante ottieni? Confronta il mezzo ciclo con il ciclo intero.',
  'blocks': [
   T('Le sorgenti hanno la stessa frequenza, mantengono una differenza di fase stabile e partono in fase. Alla sonda le due onde hanno entrambe ampiezza 2 cm. La differenza di cammino cambia la fase relativa: mezza lunghezza d’onda corrisponde a mezzo ciclo, una lunghezza d’onda a un ciclo completo.'),
   F(r'r=\Delta s/\lambda'), F(r'\Delta\phi=2\pi r'),
   T('La somma di due sinusoidi di uguale ampiezza ha un fattore 2A cos(Δφ/2). L’ampiezza è il modulo di quel fattore: un coseno negativo cambia la fase della sinusoide, non rende negativa la sua ampiezza. Con A=2 cm otteniamo 4|cos(πr)| cm.'),
   F(r'A_{\rm risultante}=2A|\cos(\Delta\phi/2)|'), F(r'A_{\rm risultante}=4|\cos(\pi r)|\,\mathrm{cm}'),
   T('Il primo controllo usa r=0,5=1/2. Le onde arrivano in opposizione di fase: quando una contribuisce +2 cm, l’altra contribuisce −2 cm. La loro somma resta nulla in ogni istante, quindi l’ampiezza risultante è zero.'),
   F(r'A_{\rm risultante}(1/2)=4|\cos(\pi/2)|\,\mathrm{cm}=0\,\mathrm{cm}'),
   T('Nel trasferimento r=1. Il ritardo è un ciclo intero: una cresta arriva insieme a una cresta. Il coseno di π vale −1, il suo valore assoluto vale 1 e l’ampiezza risultante torna a 4 cm. Non basta osservare che i cammini sono diversi per concludere che vi sia cancellazione.'),
   F(r'A_{\rm risultante}(1)=4|\cos\pi|\,\mathrm{cm}=4\,\mathrm{cm}'),
   T('In questo modello 0≤A risultante≤4 cm. Il minimo locale della sonda non significa che l’energia sia scomparsa ovunque: l’interferenza ridistribuisce la risposta nello spazio e il bilancio energetico va fatto sull’intero sistema. L’ipotesi di uguale ampiezza è essenziale per ottenere cancellazione completa.'),
   T('Per invertire il caso di cancellazione nel dominio 0≤r≤1, poniamo cos(πr)=0: πr=π/2 e r=1/2. Il valore massimo 4 cm è invece compatibile sia con r=0 sia con r=1: una sola misura di ampiezza non identifica sempre un unico cammino. Gli altri scarti del cursore restano osservazioni; i conti assegnati riguardano mezza onda e un’onda intera.')],
 },
 'SIM-C5-L07-02': {
  'points': [2, 3], 'asset': 'beer-manual-successive-halves.svg',
  'caption': 'Intensità iniziale e intensità dopo due e tre strati emivalenti. L’altezza delle barre rappresenta l’intensità relativa alla stessa scala, non l’ampiezza del campo elettrico. Ogni strato dimezza ciò che riceve dal precedente.',
  'transfer': 'Un fascio monocromatico attraversa {x} strati emivalenti uguali. Ciascuno trasmette metà dell’intensità che riceve. Quale percentuale dell’intensità iniziale esce dall’ultimo strato? Procedi per dimezzamenti.',
  'blocks': [
   T('Un fascio monocromatico attraversa un assorbitore omogeneo. Nel modello il coefficiente di attenuazione resta costante e il rivelatore non raccoglie luce diffusa che rientri nel fascio. Uno strato emivalente è lo spessore che lascia passare metà dell’intensità in ingresso. Il secondo strato riceve già meno intensità del primo.'),
   F(r'\frac{I}{I_0}=e^{-\mu d}=2^{-n}'), F(r'n=d/d_{1/2}'),
   T('Non dobbiamo calcolare un esponenziale generico. Il numero assegnato di strati è intero: ogni strato introduce un fattore 1/2. Partendo dal 100%, dopo il primo rimane il 50% e dopo il secondo il 25%. Nel primo controllo inserisci 25, perché il riquadro usa percentuali, non la frazione 1/4.'),
   F(r'\frac{I(2)}{I_0}=\frac12\cdot\frac12=\frac14'), F(r'100\%\cdot\frac14=25\%'),
   T('Per tre strati dimezza ancora 25: metà di 20 è 10 e metà di 5 è 2,5, quindi ottieni 12,5%. In frazione, 1/4 diviso 2 è 1/8. Per ricavare il valore numerico della percentuale calcola 100/8: semplificando per 4 trovi 25/2=12,5, dunque 12,5%.'),
   F(r'\frac{I(3)}{I_0}=\frac18'), F(r'100\%\cdot\frac18=\frac{25}{2}\%=12{,}5\%'),
   T('Gli strati uguali non assorbono la stessa quantità assoluta. Il primo sottrae 50 punti percentuali dell’intensità iniziale, il secondo 25 e il terzo 12,5. La frazione trasmessa di ciò che entra in ciascuno è invece sempre 1/2. È questa distinzione a rendere moltiplicativa, e non lineare, la legge.'),
   T('Anche l’inversa può evitare logaritmi: se misuri un quarto dell’intensità iniziale, riconosci 1/4=(1/2)² e ricavi due strati emivalenti. In generale n è un rapporto di lunghezze, mentre μ ha unità inversa di lunghezza, così μd è puro. Senza assorbitore n=0 e I=I₀; aumentando n l’intensità deve restare positiva e diminuire. Le verifiche assegnate usano n=2 e n=3; gli spessori frazionari servono a osservare la curva.')],
 },
 'SIM-C5-L08-02': {
  'points': [2, 4], 'asset': 'decay-manual-expected-population.svg',
  'caption': 'Rappresentazione del numero medio previsto: 64 nuclei all’inizio, 16 dopo due emivite, 4 dopo quattro. I simboli colorati raffigurano questi valori medi; non identificano quali nuclei decadono né garantiscono quel conteggio in ogni campione reale.',
  'transfer': 'Un insieme parte con 64 nuclei instabili indipendenti, tutti dello stesso isotopo. Dopo {x} emivite, quale numero medio di nuclei non decaduti prevede il modello? Dimezza il valore medio una volta per ogni emivita.',
  'blocks': [
   T('Il decadimento del singolo nucleo è casuale. La legge esponenziale descrive il numero medio di nuclei rimasti in molti campioni preparati nello stesso modo. Assumiamo nuclei indipendenti e una costante di decadimento invariata. “Dopo un’emivita ne resta metà” è una previsione media, non la promessa che un piccolo campione si divida sempre esattamente a metà.'),
   F(r'\overline N(t)=N_0\,2^{-t/T_{1/2}}'), F(r'N_0=64'),
   T('Il cursore misura già il tempo in emivite: n=t/T₁/₂ è un numero puro. Nel primo controllo n=2: 64 diviso 2 è 32, poi 32 diviso 2 è 16. Inserisci 16 come numero medio previsto. Non sottrarre due nuclei: il tempo conta i dimezzamenti della popolazione media, non i singoli decadimenti.'),
   F(r'\overline N(2T_{1/2})=64\cdot\frac14=16'),
   T('Nel trasferimento n=4. Prosegui la stessa catena: 64, 32, 16, 8, 4. Dopo quattro emivite resta in media 1/16 della popolazione iniziale, perciò la risposta è 4. Non è necessario calcolare una potenza con esponente decimale.'),
   F(r'\overline N(4T_{1/2})=64\cdot\frac1{16}=4'),
   T('Per invertire questa situazione, osservare un valore medio 4 a partire da 64 significa riconoscere 64/4=16=2⁴: sono trascorse quattro emivite. Se conoscessi anche il tempo fisico t, otterresti T₁/₂=t/4. La sola popolazione di un singolo piccolo campione non consente la stessa conclusione esatta, perché fluttua attorno alla media.'),
   F(r'\overline{\mathcal A}=\lambda\overline N'), F(r'\lambda=\frac{\ln2}{T_{1/2}}'),
   T('L’attività media è il numero medio di decadimenti per unità di tempo, non il numero di nuclei. Se T₁/₂ è espresso in secondi, λ ha unità s⁻¹ e l’attività si misura in becquerel. A λ fissata, anche l’attività media scende a un quarto e a un sedicesimo dei valori iniziali nei due istanti assegnati: non serve approssimare ln2 per confrontare questi rapporti. Il numero medio deve restare fra 0 e 64 e diminuire nel tempo.')],
 },
 'SIM-C5-L09-02': {
  'points': [30, 45], 'asset': 'snell-manual-bounded-angles.svg',
  'caption': 'Raggi dall’aria al vetro: incidenza normale, 30° e 45°, sempre misurati dalla normale tratteggiata. Nel vetro l’angolo è minore. Le etichette circa 19,5° e 28,1° sono stime; le costruzioni corrispondono alla legge di Snell.',
  'transfer': 'Il raggio passa dall’aria (n₁=1) al vetro (n₂=3/2), con incidenza {x} dalla normale. Trova prima il seno dell’angolo rifratto; poi usa gli intervalli forniti nella spiegazione e inserisci una stima in gradi con errore inferiore a 0,05°.',
  'blocks': [
   T('Consideriamo una superficie piana fra due mezzi trasparenti, omogenei e isotropi. Gli angoli si misurano dalla normale, non dalla superficie. Il fascio passa dall’aria, n₁=1, al vetro del modello, n₂=1,5=3/2. La legge di Snell confronta i seni degli angoli e nasce dalla continuità della fase lungo la superficie.'),
   F(r'n_1\sin\theta_1=n_2\sin\theta_2'), F(r'\sin\theta_2=\frac23\sin\theta_1'),
   T('Il primo controllo usa θ₁=30°, con seno esatto 1/2. Il seno rifratto è (2/3)(1/2)=1/3. Il risultato simbolico è θ₂=arcsin(1/3). Il riquadro del banco richiede però un numero in gradi: per ottenerlo a mano usiamo limiti trigonometrici forniti, senza valutare un’arcoseno con una calcolatrice.'),
   F(r'\sin\theta_2=\frac13'), F(r'\theta_2=\arcsin(1/3)'),
   T('Dati per il confronto: sin19,45°<3331/10000 e sin19,5°>3338/10000. Confrontali con 1/3 moltiplicando per 3: 9993<10000<10014. Poiché il seno cresce fra 0° e 90°, segue 19,45°<θ₂<19,5°. Scegliendo 19,5° commetti un errore inferiore a 0,05°; nel riquadro inserisci 19.5.'),
   F(r'\frac{3331}{10000}<\frac13<\frac{3338}{10000}'), F(r'19{,}45^\circ<\theta_2<19{,}5^\circ'),
   T('Nel trasferimento θ₁=45°, con sin45°=√2/2. Il fattore 2 si semplifica e rimane sinθ₂=√2/3. Per il confronto sono forniti anche 1,4142<√2<1,4143, sin28,1°<4711/10000 e sin28,15°>4715/10000. Sono dati di appoggio: non devi ricostruire una tavola trigonometrica.'),
   F(r'\sin\theta_2=\frac23\cdot\frac{\sqrt2}{2}=\frac{\sqrt2}{3}'),
   T('Porta tutte le frazioni al denominatore 30000. I due limiti del seno dell’angolo cercato hanno numeratori 14142 e 14143; i due limiti forniti per i seni di confronto hanno numeratori 14133 e 14145. L’ordine 14133<14142<14143<14145 dimostra 28,1°<θ₂<28,15°. Puoi quindi inserire 28.1: anche qui l’errore è inferiore a 0,05°. I conti sono moltiplicazioni per 3 e confronti fra interi.'),
   F(r'\frac{14133}{30000}<\frac{14142}{30000}<\frac{\sqrt2}{3}'), F(r'\frac{\sqrt2}{3}<\frac{14143}{30000}<\frac{14145}{30000}'),
   T('Entrambe le risposte sono minori dell’incidenza: il raggio si avvicina alla normale entrando nel mezzo con indice maggiore. La frequenza resta invariata; diminuiscono velocità e lunghezza d’onda. L’inversa per l’indice è n₂=n₁ sinθ₁/sinθ₂, quando sinθ₂≠0: usando il primo seno esatto ritrovi (1/2)/(1/3)=3/2. All’incidenza normale gli angoli nulli non permettono di ricavare l’indice da questa divisione.'),
   T('I limiti forniti valgono per le due incidenze assegnate, 30° e 45°. Gli altri angoli del cursore servono a osservare la rifrazione. Non sostituire l’angolo al suo seno e non considerare 19,5° o 28,1° risultati esatti: le forme simboliche restano arcsin(1/3) e arcsin(√2/3).')],
 },
}

def assemble(repo, source_ref=SOURCE_REF):
    originals={}
    for course in ('C3','C4','C5'):
        path=f'officina-di-fisica/content/esperienze-{course}.json'
        originals.update({row['id']:row for row in json.loads(git_bytes(repo,source_ref,path))})
    home=Path(__file__).resolve().parents[2]/'editorial/assets'
    records=[];bindings=[];assets=[]
    for key,spec in SPECS.items():
        old=originals[key];raw=(home/spec['asset']).read_bytes();asset=sha(raw)
        blocks=list(spec['blocks'])
        blocks.insert(2,{'type':'figure','src':'/asset/'+asset,'text':spec['caption']})
        row={**old,'version':old['version']+1,'baseVersion':old['version'],
             'assessmentSelection':{'schemaVersion':'1.0.0','points':spec['points']},
             'prerequisites':[old['skill']],'blocks':blocks,'transferPrompt':spec['transfer'],
             'review':'Candidata DRAFT. Autore distinto dal verificatore; verifica scientifica, UI e approvazione umana da documentare separatamente.'}
        records.append(row)
        bindings.append({'id':key,'sourceId':key,'sourceRef':source_ref,'sourceSha256':digest(old),
                         'candidateSha256':digest(row),'assetChecksums':{spec['asset']:asset}})
        assets.append({'id':asset,'name':spec['asset'],'mime':'image/svg+xml','data':base64.b64encode(raw).decode()})
    return {'schema':'astra/1','records':records,'assets':assets},bindings

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__)
    parser.add_argument('--repo',type=Path,required=True)
    parser.add_argument('--source-ref',default=SOURCE_REF)
    parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();args.destination.mkdir(parents=True,exist_ok=True)
    package,bindings=assemble(args.repo,args.source_ref)
    (args.destination/(BATCH+'.json')).write_text(canonical(package)+'\n')
    (args.destination/(BATCH+'-bindings.json')).write_text(canonical(bindings)+'\n')
