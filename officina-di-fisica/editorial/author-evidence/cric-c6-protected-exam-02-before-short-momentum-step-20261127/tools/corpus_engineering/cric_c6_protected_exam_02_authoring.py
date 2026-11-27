"""Thirty-one distinct original protected exam questions; author DRAFT, no own SCI."""
from .vector_geometry_authoring import assemble_family,write_family
TASKS=[('Che cosa identifica una densità',
  'Un campione da 12 g occupa 8,0 cm³ e un secondo campione omogeneo da 18 g occupa 12 cm³. '
  'Confrontando soltanto questi dati, quale conclusione è giustificata?',
  ['Le densità medie coincidono',
   'I due campioni sono necessariamente della stessa sostanza',
   'Il secondo galleggia sicuramente in acqua',
   'La densità del primo è 2/3 g/cm³',
   'Le densità sono nel rapporto 2:3'],
  'La densità media è il rapporto fra massa e volume. Il primo rapporto è 12/8=3/2 g/cm³ e il secondo '
  '18/12=3/2 g/cm³. Coincidono, pur essendo diverse entrambe le masse e i volumi. Questa sola proprietà '
  'non identifica in modo univoco la sostanza; per il primo campione il rapporto è una densità media '
  'anche senza assumere omogeneità interna.',
  '\\rho_1=\\frac32\\,\\mathrm{g/cm^3}\\qquad \\rho_2=\\frac32\\,\\mathrm{g/cm^3}',
  '2/3 inverte volume e massa e non ha il valore della densità richiesta. Il rapporto 2:3 confronta le '
  'masse ignorando i volumi, che cambiano nella stessa proporzione. Densità uguale non significa '
  'materiale necessariamente identico.',
  'Forma separatamente massa divisa per volume, prima di confrontare i campioni.'),
 ('Lunghezza quadrupla e resistenza uguale',
  'Due fili uniformi a sezione circolare sono preparati separatamente con lo stesso materiale, '
  'resistività positiva e stessa temperatura. Le resistenze sono uguali; il secondo filo è quattro '
  'volte più lungo. Qual è il rapporto fra il suo diametro e quello del primo?',
  ['1/4', '2', '4', '1', '1/2'],
  'La legge R=ρ_eL/A impone lo stesso rapporto L/A, perché resistività e resistenza coincidono. Per '
  'compensare la lunghezza quadrupla l’area deve quadruplicare. L’area circolare è proporzionale al '
  'quadrato del diametro: il rapporto dei diametri è la radice positiva di quattro, quindi due. Non si '
  'tratta di stirare lo stesso filo conservandone il volume.',
  '\\frac{A_2}{A_1}=4\\qquad A=\\frac{\\pi d^2}{4}\\qquad \\frac{d_2}{d_1}=2',
  'Quattro è il rapporto delle aree, non dei diametri; un diametro quadruplo darebbe area sedici volte '
  'maggiore. Un diametro invariato lascerebbe una resistenza quadrupla. Il rapporto 1/2 produrrebbe '
  'area un quarto e resistenza sedici volte maggiore.',
  'Compensa prima la lunghezza con l’area, poi ricava il diametro.'),
 ('Due camere rigide, una quantità di gas',
  'Due contenitori rigidi da 1,0 L ciascuno comunicano tramite un rubinetto di volume trascurabile. Il '
  'primo contiene un gas ideale a 180 kPa assoluti e il secondo è vuoto. Non esce materia. Dopo '
  'l’apertura lo stato finale torna alla temperatura iniziale positiva. Qual è la pressione finale '
  'assoluta?',
  ['45 kPa', '0 kPa', '90 kPa', '180 kPa', '360 kPa'],
  'Per gli equilibri iniziale e finale valgono pV=nRT, con uguale n e uguale T. Il volume accessibile '
  'passa da 1 L a 2 L: la pressione si dimezza e diventa 90 kPa assoluti. Si confrontano i due stati, '
  'senza attribuire al transitorio una pressione uniforme o un’espansione reversibile. La rigidità '
  'dell’involucro totale non significa che il gas resti confinato nel primo litro.',
  'p_iV_i=p_fV_f\\qquad V_f=2V_i\\qquad p_f=90\\,\\mathrm{kPa}',
  '360 kPa usa una proporzionalità diretta col volume. 180 kPa mantiene il volume accessibile iniziale; '
  '45 kPa lo quadruplica invece di raddoppiarlo. Il gas resta presente e a temperatura positiva, quindi '
  'la pressione finale non è zero.',
  'Conserva la quantità di gas e usa solo i due equilibri alla stessa temperatura.'),
 ('Scendere con velocità già presente',
  'Un corpo parte con velocità verticale di 2,0 m/s verso il basso. Agisce solo la gravità uniforme, '
  'con g=10 m/s². Quanto spazio percorre nel primo secondo?',
  ['2 m', '12 m', '14 m', '7 m', '5 m'],
  'Scelgo il basso come verso positivo. Nel primo secondo il termine dovuto alla velocità iniziale è (2 '
  'm/s)(1 s)=2 m e quello dovuto all’accelerazione è (1/2)(10 m/s²)(1 s)²=5 m. La somma dà 7 m. La '
  'velocità resta verso il basso e cresce, perciò lo spazio percorso coincide con lo spostamento '
  'positivo in questo intervallo.',
  's=v_0t+\\frac12gt^2\\qquad s=7\\,\\mathrm m',
  '5 m vale per partenza da fermo e omette il primo termine. 2 m ignora la gravità. 12 m omette il '
  'fattore un mezzo nel termine accelerato; 14 m raddoppia un risultato già completo.',
  'Attribuisci lo stesso segno alla velocità iniziale e alla gravità.'),
 ('Una frequenza sonora raddoppiata',
  'Una sorgente sonora passa da 440 Hz a 880 Hz nella stessa aria. Nel modello la velocità di '
  'propagazione resta invariata. Come cambiano periodo e lunghezza d’onda?',
  ['Entrambi raddoppiano',
   'Entrambi restano uguali',
   'Il periodo raddoppia e la lunghezza d’onda si dimezza',
   'Il periodo resta uguale e la lunghezza d’onda raddoppia',
   'Entrambi si dimezzano'],
  'La frequenza raddoppia perché 880/440=2. Il periodo è l’inverso della frequenza, quindi si dimezza. '
  'Anche la lunghezza d’onda è v/f e si dimezza a v costante. Questa informazione sul ritmo non '
  'stabilisce da sola l’intensità sonora: non è assegnato un cambiamento dell’ampiezza.',
  'T=\\frac1f\\qquad \\lambda=\\frac vf\\qquad \\frac{T_2}{T_1}=\\frac12\\qquad '
  '\\frac{\\lambda_2}{\\lambda_1}=\\frac12',
  'Raddoppiare entrambe userebbe una proporzionalità diretta alla frequenza. Un periodo invariato è '
  'incompatibile con f doppia. Non si deve cambiare la velocità del suono soltanto perché cambia la '
  'frequenza della sorgente nel modello dato.',
  'Scrivi due relazioni separate con la stessa frequenza al denominatore.'),
 ('Incrementi di forza su due pistoni',
  'Una pressa idraulica ideale contiene liquido incomprimibile in quiete nei due stati confrontati. Le '
  'facce dei pistoni rimangono alla stessa quota e le aree sono 4 cm² e 100 cm². Un incremento di forza '
  'normale di 8 N agisce sul piccolo. Quale incremento della forza di pressione si ottiene sul grande?',
  ['200 N', '25 N', '0,32 N', '32 N', '800 N'],
  'L’incremento di pressione trasmesso è lo stesso ai due pistoni alla stessa quota. Divido la forza '
  'iniziale per l’area piccola e moltiplico per quella grande. Le aree usano la stessa unità, quindi '
  'basta il rapporto 100/4=25. L’incremento della forza è 8×25=200 N. Il risultato riguarda una forza, '
  'non un guadagno di energia o un lavoro senza corsa.',
  '\\Delta p=\\frac{\\Delta F_1}{A_1}\\qquad \\frac{\\Delta F_2}{\\Delta F_1}=\\frac{A_2}{A_1}\\qquad '
  '\\Delta F_2=200\\,\\mathrm N',
  '25 è il rapporto numerico delle aree, non il risultato in newton: manca il fattore 8 N. 0,32 N '
  'inverte il rapporto delle aree. 800 N usa 100 senza dividerlo per 4. La pressione incrementale, non '
  'la forza, è comune.',
  'Identifica quale grandezza resta uguale quando cambiano le aree.'),
 ('Risultante nulla senza potenziale nullo',
  'Due cariche puntiformi identiche positive Q>0 sono tenute fisse a distanza 2d, con d>0. Una piccola '
  'carica negativa è posta nel punto medio; considera solo le forze elettriche delle due sorgenti. '
  'Quale affermazione è corretta in quell’istante?',
  ['Le due attrazioni hanno lo stesso verso',
   'La forza totale sulla carica centrale è nulla',
   'Ogni singola forza attrattiva è nulla',
   'La risultante punta verso una delle due sorgenti',
   'Il potenziale delle due sorgenti al centro è nullo con zero all’infinito'],
  'Le due distanze sono uguali e le sorgenti hanno uguale carica. Le forze attrattive hanno quindi '
  'moduli uguali ma versi opposti, perciò la somma vettoriale è zero. Il potenziale delle sole '
  'sorgenti, con zero all’infinito, è invece la somma di due contributi positivi: V=2kQ/d. La '
  'risultante nulla in quel punto non basta a dichiarare stabile l’equilibrio per ogni spostamento.',
  '\\mathbf F_1+\\mathbf F_2=\\mathbf0\\qquad V=\\frac{2kQ}{d}>0',
  'Le singole attrazioni non sono nulle: si annullano solo nella somma vettoriale. Il potenziale è '
  'scalare e non sottrae contributi per il solo fatto che le sorgenti sono su lati opposti. Nessun lato '
  'è privilegiato dalla configurazione simmetrica.',
  'Disegna due forze sullo stesso corpo e tieni distinto il potenziale scalare.'),
 ('Stesso sollevamento in un quarto del tempo',
  'Lo stesso carico di massa positiva viene sollevato dello stesso dislivello positivo, prima in 8 s e '
  'poi in 2 s. Considera il solo tratto a velocità costante, senza perdite o cambi di energia cinetica. '
  'Quali sono i rapporti secondo/primo per lavoro del sollevatore e potenza media?',
  ['4 e 4', '1/4 e 1/4', '1 e 4', '1 e 1/4', '4 e 1'],
  'In entrambi i tratti il lavoro del sollevatore è mgh. Uguali massa e dislivello danno quindi '
  'rapporto dei lavori uno. La potenza media divide quel lavoro positivo per la durata: passando da 8 a '
  '2 s diventa quattro volte maggiore. Non si confrontano il transitorio di avvio o quello di arresto, '
  'esclusi dal testo.',
  'W_1=W_2=mgh\\qquad \\frac{W_2}{W_1}=1\\qquad \\frac{\\overline P_2}{\\overline '
  'P_1}=\\frac{8}{2}\\qquad \\frac{\\overline P_2}{\\overline P_1}=4',
  '1 e 1/4 inverte il rapporto delle potenze. Quattro volte il lavoro richiederebbe un cambiamento di '
  'massa o quota, non soltanto della durata. Le ipotesi positive evitano rapporti fra lavori nulli.',
  'Confronta prima i lavori e soltanto dopo dividi ciascuno per il proprio tempo.'),
 ('Scambiare calore attraverso il vuoto',
  'Due superfici a temperature diverse sono separate da un’intercapedine vuota, senza supporti '
  'materiali che le colleghino. Quale meccanismo può trasferire energia termica attraverso quel tratto?',
  ['Conduzione in un liquido assente',
   'Diffusione molecolare dell’aria assente',
   'Attrito viscoso di un fluido assente',
   'Irraggiamento',
   'Convezione del gas assente'],
  'Una superficie può emettere radiazione elettromagnetica che attraversa il vuoto e viene assorbita '
  'dall’altra. Questo trasferimento è l’irraggiamento. Conduzione e convezione attraverso '
  'l’intercapedine richiederebbero invece materia. La domanda identifica un meccanismo possibile; il '
  'valore del flusso effettivo dipende anche dalle proprietà radiative delle superfici. Per una '
  'superficie, la potenza netta ricevuta è quella assorbita meno quella emessa.',
  'P_{\\rm netto}=P_{\\rm assorbita}-P_{\\rm emessa}',
  'Un gas o un liquido non possono sostenere i meccanismi proposti se sono dichiarati assenti. Anche un '
  'supporto solido potrebbe condurre, ma qui è escluso. Il vuoto non impedisce la propagazione '
  'elettromagnetica.',
  'Chiediti se il meccanismo richiede materia nel tratto attraversato.'),
 ('Un’immagine reale grande quanto l’oggetto',
  'Una lente sottile convergente è fra un oggetto reale e uno schermo distanti 64 cm. Nel modello '
  'parassiale, con lo stesso mezzo sui due lati e altezza dell’oggetto non nulla, l’immagine sullo '
  'schermo è nitida e ha lo stesso modulo di altezza. Quanto vale la focale?',
  ['32 cm', '64 cm', '8 cm', '48 cm', '16 cm'],
  'L’immagine reale è capovolta e ha ingrandimento m=−q/p. L’uguaglianza dei moduli impone q=p. Poiché '
  'p+q=64 cm, ciascuna distanza è 32 cm. Sommare i reciproci dà 1/f=(1/32+1/32) cm⁻¹=1/16 cm⁻¹, dunque '
  'f=16 cm. Oggetto e immagine si trovano entrambi a due focali.',
  'p=q\\qquad p+q=64\\,\\mathrm{cm}\\qquad p=32\\,\\mathrm{cm}\\qquad f=\\frac p2\\qquad '
  'f=16\\,\\mathrm{cm}',
  '32 cm è la distanza oggetto–lente o lente–schermo, non la focale. 64 cm è la distanza complessiva; 8 '
  'cm dimezza ancora una volta la focale. L’uguaglianza delle altezze in modulo non significa che '
  'l’immagine reale sia diritta.',
  'Usa prima l’ingrandimento per dividere la distanza totale in due tratti uguali.'),
 ('Curvare senza cambiare rapidità',
  'Un corpo percorre una semicirconferenza di raggio R>0 con rapidità costante v>0. Quali direzioni '
  'hanno velocità e accelerazione istantanee durante il moto?',
  ['Velocità tangente e accelerazione verso il centro',
   'Entrambe tangenti alla traiettoria',
   'Velocità verso il centro e accelerazione tangente',
   'Entrambe nulle',
   'Accelerazione nulla perché la rapidità è costante'],
  'La velocità istantanea segue la tangente alla circonferenza. Anche se il suo modulo non cambia, la '
  'direzione ruota continuamente: questa variazione produce accelerazione centripeta, perpendicolare '
  'alla velocità e rivolta al centro. Il modulo v²/R è positivo nei dati dichiarati. In mezza '
  'circonferenza la direzione finale della velocità è opposta a quella iniziale.',
  '|\\mathbf a|=\\frac{v^2}{R}\\qquad \\mathbf a\\perp\\mathbf v',
  'Rapidità costante non significa vettore velocità costante. Una accelerazione tangente cambierebbe il '
  'modulo della velocità, mentre qui è assegnato costante. La direzione verso il centro appartiene '
  'all’accelerazione, non alla velocità tangente.',
  'Confronta due tangenti vicine: un vettore può cambiare direzione senza cambiare modulo.'),
 ('Dove il profilo viscoso è massimo',
  'In un tubo circolare rigido e lungo scorre con portata positiva un fluido newtoniano. Il moto è '
  'laminare stazionario completamente sviluppato, con aderenza alle pareti ferme. Dove si trova il '
  'massimo modulo della velocità assiale?',
  ['Fuori dal tubo',
   'Sull’asse del tubo',
   'Sulla parete',
   'Uniformemente in tutta la sezione',
   'Solo a metà raggio'],
  'Il profilo di Poiseuille è proporzionale a R²−r². Fra asse r=0 e parete r=R questo termine '
  'diminuisce: sull’asse è massimo e alla parete si annulla per aderenza. La portata positiva esclude '
  'il caso in cui tutte le velocità siano zero. Non si tratta del profilo uniforme di un modello privo '
  'della condizione viscosa alla parete.',
  'v(r)=v_{\\max}\\left(1-\\frac{r^2}{R^2}\\right)\\qquad v(R)=0\\qquad v(0)=v_{\\max}',
  'La parete ferma impone velocità nulla al fluido aderente, non massima. A metà raggio il valore è tre '
  'quarti del massimo, quindi non è il vertice. La viscosità non impone che tutta la sezione abbia la '
  'stessa velocità.',
  'Parti dalla condizione alla parete e osserva il termine r² del profilo.'),
 ('Una velocità parallela al campo magnetico',
  'Una particella di carica non nulla entra con velocità non nulla esattamente parallela a un campo '
  'magnetico uniforme statico. Agisce soltanto la forza magnetica. Nel modello classico, quale moto '
  'segue finché resta in quella regione?',
  ['Parabolico con accelerazione costante trasversale',
   'Rettilineo con progressivo arresto',
   'Rettilineo a velocità costante',
   'Circolare nel piano perpendicolare al campo',
   'Elicoidale con raggio non nullo'],
  'Il prodotto vettoriale fra velocità e campo è zero quando i due vettori sono paralleli. La forza '
  'magnetica è dunque nulla e, in assenza di altre forze, la velocità resta costante come vettore. La '
  'traiettoria è una retta parallela al campo. La neutralità non è necessaria per avere forza magnetica '
  'nulla in questa configurazione.',
  '\\mathbf F=q\\,\\mathbf v\\times\\mathbf B\\qquad \\mathbf F=\\mathbf0\\qquad \\mathbf '
  'v=\\text{costante}',
  'Cerchio o elica di raggio non nullo richiederebbero una componente iniziale perpendicolare al campo, '
  'qui esclusa. Una parabola o un rallentamento richiederebbero una forza diversa da quella nulla '
  'calcolata.',
  'Controlla il prodotto vettoriale prima di scegliere una traiettoria curva.'),
 ('Un bilancio termico su un ciclo antiorario',
  'Un gas chiuso percorre tre tratti quasi statici formando un ciclo antiorario nel piano p–V. L’unico '
  'lavoro è quello p dV, positivo se svolto dal gas; l’area racchiusa è 12 kPa·L. Nei primi due tratti '
  'il gas riceve 40 J e poi cede 15 J di calore. Quanto vale il calore algebrico ricevuto nel terzo '
  'tratto?',
  ['+37 J', '−13 J', '−67 J', '−37 J', '+13 J'],
  'Un kilopascal per litro vale un joule. Il percorso antiorario dà lavoro netto del gas −12 J. Sul '
  'ciclo lo stato interno ritorna identico, quindi ΔU=0 e il calore netto è uguale al lavoro netto. I '
  'primi due contributi sommano +25 J; per arrivare a −12 J il terzo deve essere −37 J. Il segno meno '
  'significa che nel terzo tratto il gas cede calore.',
  'W_{\\rm gas}=-12\\,\\mathrm J\\qquad \\Delta U_{\\rm ciclo}=0\\qquad Q_1+Q_2+Q_3=W_{\\rm gas}\\qquad '
  'Q_3=-37\\,\\mathrm J',
  '+13 J userebbe lavoro positivo invece del verso antiorario. +37 J perderebbe il segno del calore '
  'ceduto. Sottrarre tutti i moduli senza distinguere ingresso e uscita non ricostruisce il bilancio '
  'orientato.',
  'Determina prima il segno del lavoro, poi somma i calori con il loro segno.'),
 ('Più area ma più distanza',
  'Una sorgente isotropa di potenza positiva costante emette senza perdite. Un piccolo rivelatore di '
  'area A>0, normale ai raggi, è a distanza r>0. Lo sostituisci con un rivelatore di area 4A a distanza '
  '2r, ancora piccolo rispetto alla distanza e normale ai raggi. Nel modello geometrico, come cambia la '
  'potenza intercettata?',
  ['Diventa quattro volte minore',
   'Diventa sedici volte minore',
   'Raddoppia',
   'Quadruplica',
   'Resta la stessa'],
  'L’intensità alla distanza 2r è un quarto di quella a r. La potenza intercettata è intensità per area '
  'normale. La nuova area è quattro volte maggiore, quindi il prodotto dei due fattori è (1/4)×4=1: la '
  'potenza raccolta resta uguale. L’intensità locale è invece diminuita, pur con potenza intercettata '
  'invariata.',
  'I(r)=\\frac{P_{\\rm sorgente}}{4\\pi r^2}\\qquad P_{\\rm ricevuta}=I A\\qquad '
  '\\frac{P_2}{P_1}=\\frac14\\cdot4\\qquad \\frac{P_2}{P_1}=1',
  'Un quarto considererebbe soltanto la distanza, mentre quattro considererebbe soltanto l’area. Un '
  'sedicesimo farebbe diminuire anche l’area anziché aumentarla. Uguale potenza intercettata non '
  'significa uguale intensità nel punto.',
  'Combina il rapporto delle intensità con quello delle aree, che sono grandezze diverse.'),
 ('La velocità dopo il bilancio dei tre rami',
  'Un liquido incomprimibile arriva con portata 12 mL/s a tre rami. In regime stazionario, senza '
  'accumulo o perdite, due rami portano 2 e 7 mL/s. Il terzo ha area di sezione 0,50 cm². Qual è la sua '
  'velocità media?',
  ['6 cm/s', '3 cm/s', '1,5 cm/s', '18 cm/s', '24 cm/s'],
  'Prima uso la continuità: al terzo ramo spettano 12−2−7=3 mL/s. Un millilitro è un centimetro cubo, '
  'quindi la portata è 3 cm³/s. Divido per 1/2 cm² e ottengo 6 cm/s. Non occorre conoscere la '
  'distribuzione puntuale della velocità: il rapporto portata/area definisce la media sulla sezione.',
  'Q_3=3\\,\\mathrm{cm^3/s}\\qquad \\overline v_3=\\frac{Q_3}{A_3}\\qquad \\overline '
  'v_3=6\\,\\mathrm{cm/s}',
  '24 cm/s userebbe tutta la portata iniziale nel solo terzo ramo. 1,5 cm/s moltiplicherebbe per l’area '
  'invece di dividerla. 3 cm/s copierebbe il numero della portata senza il rapporto con la sezione.',
  'Trova prima il volume che attraversa quel ramo ogni secondo, poi dividilo per l’area.'),
 ('Una durata dall’energia dissipata',
  'Un resistore ohmico mantiene resistenza 4 Ω ed è alimentato con tensione continua costante 8 V. '
  'Quale durata serve perché trasformi 80 J di energia elettrica in energia interna?',
  ['10 s', '5 s', '2,5 s', '80 s', '20 s'],
  'Calcolo prima la potenza P=V²/R. Il quadrato riguarda la tensione: (8 V)²/(4 Ω)=16 W, cioè 16 J ogni '
  'secondo. Per trasformare 80 J occorrono quindi 80/16=5 s. Il controllo finale moltiplica 16 W per 5 '
  's e restituisce proprio 80 J.',
  'P=\\frac{V^2}{R}\\qquad P=16\\,\\mathrm W\\qquad t=\\frac EP\\qquad t=5\\,\\mathrm s',
  '80 s copierebbe il numero dell’energia come se fosse una durata. 20 s corrisponderebbe a una potenza '
  'di 4 W; 10 s a 8 W. Nessuna delle due coincide con la potenza del resistore ai dati assegnati.',
  'Non dividere per la sola resistenza: ricava prima la potenza in joule al secondo.'),
 ('Quantità di moto opposte dopo la spinta',
  'Due pattinatori inizialmente fermi si respingono lungo una stessa linea su ghiaccio senza attrito. '
  'Durante la spinta l’impulso esterno orizzontale è trascurabile. Quello di 60 kg raggiunge +2,0 m/s. '
  'Qual è la velocità di quello di 40 kg, nello stesso riferimento?',
  ['−4/3 m/s', '+4/3 m/s', '−3 m/s', '+3 m/s', '−2 m/s'],
  'La quantità di moto totale iniziale è zero e resta zero. Il primo pattinatore ha +120 kg·m/s, perciò '
  'il secondo deve averne −120 kg·m/s. Dividendo per la sua massa di 40 kg ottengo −3 m/s. Il '
  'pattinatore più leggero ha rapidità maggiore, ma non quantità di moto maggiore in modulo.',
  '60\\,\\mathrm{kg}\\cdot2\\,\\mathrm{m/s}+40\\,\\mathrm{kg}\\cdot v_2=0\\qquad v_2=-3\\,\\mathrm{m/s}',
  '+3 m/s renderebbe entrambe le quantità di moto positive, senza impulso esterno che le fornisca. −2 '
  'm/s assegnerebbe uguali rapidità a masse diverse; −4/3 m/s invertirebbe il rapporto delle masse.',
  'Imponi la somma algebrica delle quantità di moto uguale al valore iniziale.'),
 ('L’entropia del sistema nel ritorno',
  'Un sistema chiuso va da A a B reversibilmente, ricevendo 60 J a temperatura costante 300 K e 120 J a '
  '400 K; gli altri tratti sono adiabatici reversibili. Poi torna da B ad A lungo un cammino '
  'irreversibile. Qual è la variazione di entropia del solo sistema nel ritorno?',
  ['0 J/K',
   '−1/10 J/K',
   'Non determinabile senza conoscere il calore del ritorno',
   '−1/2 J/K',
   '+1/2 J/K'],
  'Uso il cammino reversibile noto per ricavare la differenza di entropia fra gli stati: 60/300=1/5 J/K '
  'e 120/400=3/10 J/K. La somma è +1/2 J/K. L’entropia è una funzione di stato: nel ritorno si '
  'scambiano gli estremi e la differenza diventa −1/2 J/K, anche se il percorso è irreversibile. '
  'L’entropia del solo sistema può diminuire: non si sta calcolando quella totale di sistema e '
  'ambiente.',
  '\\Delta S_{A\\to B}=\\frac15\\,\\mathrm{J/K}+\\frac3{10}\\,\\mathrm{J/K}\\qquad \\Delta S_{A\\to '
  'B}=\\frac12\\,\\mathrm{J/K}\\qquad \\Delta S_{B\\to A}=-\\frac12\\,\\mathrm{J/K}',
  '+1/2 J/K descrive l’andata, non il ritorno. Zero sarebbe la variazione sull’intero ciclo A→B→A. '
  'L’irreversibilità non rende indeterminata una differenza di stato già nota e non consente di '
  'sostituirla automaticamente con il calore reale diviso per una temperatura.',
  'Calcola la differenza di stato dal percorso reversibile e poi inverti gli estremi.'),
 ('Più potenza infrarossa alla stessa frequenza',
  'Una sorgente infrarossa monocromatica passa a una potenza emessa maggiore, mantenendo la stessa '
  'frequenza positiva. Nel modello a singolo fotone, che cosa segue necessariamente?',
  ['Ogni fotone acquista energia maggiore',
   'Ogni fotone si propaga più velocemente nel vuoto',
   'La sorgente diventa automaticamente ionizzante per qualunque atomo',
   'Ogni fotone raddoppia la propria carica elettrica',
   'Aumenta il numero medio di fotoni emessi al secondo'],
  'La frequenza invariata mantiene l’energia del singolo fotone hf. La potenza è il prodotto di '
  'quell’energia per il numero medio emesso ogni secondo: se il prodotto aumenta mentre hf resta fisso, '
  'aumenta il tasso di fotoni. Non segue un cambiamento di banda o il superamento di una soglia di '
  'ionizzazione per singolo fotone.',
  'P=\\dot N h f\\qquad \\dot N=\\frac P{hf}',
  'Un’energia unitaria maggiore richiederebbe una frequenza maggiore. Nel vuoto la velocità non cresce '
  'con la potenza. Il fotone non possiede la carica elettrica che l’ultima alternativa propone di '
  'raddoppiare. La potenza totale non sostituisce una soglia per evento singolo.',
  'Separa l’energia di un pacchetto dal numero di pacchetti emessi per secondo.'),
 ('Il verso della forza di attrito sulla cassa',
  'Una cassa scivola già verso destra rispetto a un piano orizzontale fermo. Quale verso ha la forza di '
  'attrito dinamico che il piano esercita sulla cassa?',
  ['Verso sinistra',
   'Verso destra',
   'Verticalmente verso il basso',
   'Verticalmente verso l’alto',
   'Non ha verso perché è scalare'],
  'L’attrito dinamico tangenziale contrasta lo scorrimento relativo delle due superfici. Il contatto '
  'della cassa scivola verso destra rispetto al piano, quindi il piano esercita sulla cassa una forza '
  'verso sinistra. La forza normale è invece perpendicolare al piano e non va confusa con questo '
  'contributo tangenziale.',
  '\\mathbf F_{\\rm attr}\\cdot\\mathbf v_{\\rm relativa}<0',
  'Verso destra sarebbe concorde con lo scorrimento indicato. Alto e basso descrivono direzioni normali '
  'alla superficie, non la forza di attrito dinamico. L’attrito è una forza vettoriale e possiede un '
  'verso.',
  'Individua quale superficie scivola rispetto all’altra e su quale corpo agisce la forza richiesta.'),
 ('Il nome del prodotto con il coseno',
  'Il prodotto fra due vettori, definito come il prodotto dei loro moduli per il coseno dell’angolo '
  'compreso, si chiama prodotto…',
  ['Sempre nullo',
   'Scalare',
   'Vettoriale',
   'Delle sole norme senza angolo',
   'Incrociato con modulo ab sinθ'],
  'Il nome è prodotto scalare, perché il risultato non è un vettore. La formula a·b=ab cosθ tiene conto '
  'della proiezione di un vettore nella direzione dell’altro. Può essere positivo, negativo o zero a '
  'seconda dell’angolo. Il lavoro di una forza costante ne è un esempio applicato a forza e '
  'spostamento.',
  '\\mathbf a\\cdot\\mathbf b=ab\\cos\\theta',
  'Il prodotto vettoriale usa un seno nel modulo e una direzione perpendicolare al piano dei fattori. '
  'Il solo prodotto delle norme omette l’angolo. Il prodotto scalare si annulla per vettori ortogonali, '
  'non per ogni coppia.',
  'Confronta la formula con coseno e la natura del risultato.'),
 ('Il principio della spinta idrostatica',
  'Nel modello idrostatico, quale nome porta il principio che assegna a un corpo immerso una spinta di '
  'modulo uguale al peso del fluido spostato?',
  ['Coulomb', 'Planck', 'Archimede', 'Pascal', 'Ohm'],
  'È il principio di Archimede. La risultante delle pressioni idrostatiche ha modulo ρ_f gV_imm ed è '
  'rivolta verso l’alto in un campo gravitazionale uniforme. Per un corpo parzialmente immerso va usato '
  'soltanto il volume immerso. Il peso del corpo e il peso del fluido spostato non sono la stessa '
  'grandezza in ogni situazione.',
  'F_A=\\rho_f gV_{\\rm imm}',
  'Pascal riguarda la trasmissione di un incremento di pressione; Ohm i resistori; Coulomb le forze '
  'elettriche e Planck l’energia dei fotoni. Nessuno di quei nomi sostituisce il principio della spinta '
  'richiesto.',
  'Riconosci la risultante di pressione attraverso il volume di fluido spostato.'),
 ('Capacità termica divisa per massa',
  'Per un corpo di massa positiva, la capacità termica riferita a uno stesso processo e divisa per la '
  'massa definisce il calore…',
  ['Scambiato nell’intero ciclo',
   'Uguale alla temperatura assoluta',
   'Espresso soltanto in joule',
   'Specifico',
   'Latente totale del corpo'],
  'Si chiama calore specifico c. La capacità termica C riguarda l’intero corpo e ha unità J/K; c=C/m ha '
  'unità J/(kg K). Il processo va specificato, per esempio a pressione o volume costante. Se c resta '
  'costante e non ci sono transizioni di fase, Q=mcΔT applica questa definizione a un intervallo '
  'finito.',
  'c=\\frac Cm\\qquad [c]=\\mathrm{J/(kg\\,K)}',
  'Il calore latente specifico è energia per massa per una transizione di fase e ha un’altra unità. Una '
  'temperatura non è una capacità termica; un’energia in joule non include la divisione per massa e '
  'variazione termica.',
  'Tieni distinte la proprietà dell’intero corpo e quella riferita a un chilogrammo.'),
 ('Cariche legate in un isolante',
  'Un campo elettrico esterno provoca piccoli spostamenti delle cariche legate o un parziale '
  'orientamento dei dipoli in un isolante, nel regime dielettrico. Qual è il nome del fenomeno?',
  ['Conduzione libera continua come in un metallo',
   'Scomparsa di ogni carica dal materiale',
   'Emissione alfa del nucleo',
   'Trasformazione necessaria in un magnete permanente',
   'Polarizzazione elettrica'],
  'Il fenomeno è la polarizzazione elettrica. Le cariche legate possono separarsi leggermente '
  'all’interno di atomi o molecole, oppure dipoli già presenti possono orientarsi parzialmente. Si crea '
  'una distribuzione di dipoli senza richiedere che tutte le cariche attraversino il campione come in '
  'una corrente di conduzione metallica.',
  '\\mathbf p=q\\,\\mathbf d',
  'La conduzione libera descrive un meccanismo diverso. La polarizzazione non annulla la conservazione '
  'della carica e non comporta una trasformazione del nucleo. Il momento di dipolo p rappresenta due '
  'cariche opposte separate: d va dalla negativa alla positiva.',
  'Segui le cariche legate all’interno del materiale, non un trasferimento di carica all’esterno.'),
 ('La ripetizione nello spazio di un suono',
  'A uno stesso istante, la distanza lungo la propagazione fra due compressioni consecutive di un’onda '
  'sonora armonica progressiva è la…',
  ['Lunghezza d’onda', 'Durata del periodo', 'Frequenza', 'Rapidità della sorgente', 'Potenza sonora'],
  'Due compressioni consecutive corrispondono alla stessa fase dopo un giro spaziale completo. La loro '
  'distanza è la lunghezza d’onda λ. È una lunghezza, mentre il periodo T misura l’intervallo temporale '
  'fra due compressioni che passano per lo stesso punto. Con velocità di propagazione v, le due '
  'ripetizioni sono legate da λ=vT.',
  '\\lambda=vT',
  'Periodo e frequenza non hanno dimensione di lunghezza. Il dato non misura il moto della sorgente o '
  'la potenza emessa. Occorre fissare lo stesso istante quando si confrontano due punti del profilo '
  'nello spazio.',
  'Chiediti se la ripetizione viene misurata fra due punti o fra due istanti.'),
 ('Un lavoro distribuito nel tempo',
  'Quale grandezza fisica esprime il lavoro compiuto per unità di tempo, come rapporto medio su un '
  'intervallo non nullo?',
  ['Carica elettrica', 'Potenza media', 'Energia potenziale', 'Forza', 'Quantità di moto'],
  'La grandezza è la potenza media. Se un lavoro W viene compiuto in una durata Δt positiva, la media è '
  'W/Δt. Il joule diviso per secondo è il watt. Per descrivere il valore istantaneo si usa invece la '
  'derivata del lavoro rispetto al tempo, quando esiste.',
  '\\overline P=\\frac W{\\Delta t}\\qquad 1\\,\\mathrm W=1\\,\\mathrm{J/s}',
  'Un’energia non include la divisione per il tempo. La forza ha unità newton e la quantità di moto '
  'kg·m/s, non watt. Un tempo minore a parità di lavoro positivo richiede potenza media maggiore.',
  'Controlla che il rapporto delle unità sia joule al secondo.'),
 ('Il coefficiente del gradiente nel taglio viscoso',
  'Nel taglio semplice di un fluido newtoniano, quale proprietà moltiplica il gradiente trasversale '
  'della velocità nella legge dello sforzo tangenziale?',
  ['Pressione assoluta',
   'Tensione superficiale',
   'Viscosità dinamica',
   'Densità del fluido',
   'Viscosità cinematica senza fattore densità'],
  'Il coefficiente è la viscosità dinamica η. Nella relazione τ=η dv_x/dy, il gradiente ha unità s⁻¹ e '
  'lo sforzo pascal, quindi η ha unità Pa·s. La viscosità cinematica è invece ν=η/ρ e ha unità m²/s: '
  'non può sostituire η senza il fattore densità.',
  '\\tau=\\eta\\frac{dv_x}{dy}\\qquad [\\eta]=\\mathrm{Pa\\,s}',
  'La densità da sola non dà lo sforzo con questo gradiente. Pressione e tensione superficiale hanno '
  'dimensioni diverse dal coefficiente richiesto. Un fluido newtoniano può avere gradienti di velocità '
  'non nulli pur in moto laminare.',
  'Dividi l’unità dello sforzo per quella del gradiente di velocità.'),
 ('Calore nullo non significa temperatura fissa',
  'Una trasformazione durante la quale non attraversa il confine del sistema alcun trasferimento di '
  'calore è detta…',
  ['Isobara per definizione',
   'Isocora per definizione',
   'Necessariamente priva di lavoro',
   'Adiabatica',
   'Isoterma per definizione'],
  'Il nome è adiabatica. La condizione riguarda il calore: Q=0. Con W positivo se svolto dal sistema e '
  'senza altri contributi, il primo principio diventa ΔU=−W. Un lavoro può quindi modificare l’energia '
  'interna e anche la temperatura; non serve che volume o pressione siano costanti.',
  'Q=0\\qquad \\Delta U=-W',
  'Isoterma significa temperatura costante, una condizione diversa. Isobara e isocora fissano pressione '
  'e volume. L’assenza di calore non vieta uno scambio di lavoro e non rende necessariamente nullo ΔU.',
  'Individua quale tipo di trasferimento è escluso, senza aggiungere vincoli non dichiarati.'),
 ('Il verso che contrasta un flusso uscente crescente',
  'Una spira ferma e chiusa giace sul foglio. Il campo magnetico esterno uniforme è diretto verso il '
  'lettore e il suo modulo cresce. La spira è puramente resistiva, senza altri generatori e con '
  'autoinduzione trascurabile. Visto dal lettore, quale verso ha la corrente indotta?',
  ['Antiorario',
   'Necessariamente nullo perché la spira è ferma',
   'Alterna necessariamente ogni mezzo secondo',
   'Non ha verso perché il flusso è scalare',
   'Orario'],
  'Con normale positiva uscente, il flusso esterno aumenta. La legge di Lenz richiede un campo indotto '
  'entrante per contrastarne la variazione. La regola della mano destra dà corrente oraria vista dal '
  'lettore quando il pollice punta dentro il foglio. Non si contrasta sempre il campo esterno: qui si '
  'contrasta proprio il suo aumento.',
  '\\mathcal E=-\\frac{d\\Phi}{dt}',
  'Una corrente antioraria produrrebbe campo uscente e rinforzerebbe la crescita assegnata. La spira '
  'può essere ferma e avere comunque fem indotta se cambia il campo. Un campo che cresce non implica '
  'un’alternanza temporale della corrente.',
  'Determina prima il verso del campo indotto e poi applica la mano destra alla corrente.'),
 ('Il nome dell’unità di attività',
  'Quale unità SI di attività radioattiva corrisponde a un decadimento medio al secondo?',
  ['Becquerel',
   'Hertz, nome dell’unità di frequenza periodica',
   'Coulomb',
   'Joule',
   'Gray, unità di dose assorbita'],
  'L’unità è il becquerel, simbolo Bq. Un’attività di 1 Bq indica un tasso medio di un decadimento al '
  'secondo, non un appuntamento deterministico ogni secondo. La lettura del rivelatore può differire da '
  'tale attività se non conta tutti gli eventi o se è presente un fondo.',
  '1\\,\\mathrm{Bq}=1\\,\\mathrm{s^{-1}}',
  'Hertz e becquerel condividono la dimensione di tempo inverso ma si usano per grandezze fisiche '
  'diverse: qui si chiede l’attività di decadimento. Coulomb misura carica, joule energia e gray '
  'energia assorbita per massa.',
  'Distingui il nome dell’unità della radioattività da quello della frequenza periodica.')]
CHOICES={1: 0,
 2: 1,
 3: 2,
 4: 3,
 5: 4,
 6: 0,
 7: 1,
 8: 2,
 9: 3,
 10: 4,
 11: 0,
 12: 1,
 13: 2,
 14: 3,
 15: 4,
 16: 0,
 17: 1,
 18: 2,
 19: 3,
 20: 4,
 21: 0,
 22: 1,
 23: 2,
 24: 3,
 25: 4,
 26: 0,
 27: 1,
 28: 2,
 29: 3,
 30: 4,
 31: 0}
CATEGORIES={1: 'concetto',
 2: 'algebra',
 3: 'modello',
 4: 'modello',
 5: 'algebra',
 6: 'algebra',
 7: 'concetto',
 8: 'modello',
 9: 'concetto',
 10: 'algebra',
 11: 'concetto',
 12: 'modello',
 13: 'modello',
 14: 'modello',
 15: 'algebra',
 16: 'unità',
 17: 'algebra',
 18: 'concetto',
 19: 'modello',
 20: 'concetto',
 21: 'concetto',
 22: 'concetto',
 23: 'concetto',
 24: 'concetto',
 25: 'concetto',
 26: 'concetto',
 27: 'concetto',
 28: 'unità',
 29: 'concetto',
 30: 'concetto',
 31: 'unità'}
FIGURES={6: 'Nel primo pannello si confrontano separatamente aree e incrementi di forza: le aree sono 4 e 100 '
    'cm², gli incrementi 8 e 200 N. Ogni coppia di barre usa una scala comune, ma le scale delle due '
    'grandezze sono distinte.',
 10: 'Nel secondo pannello la lente è fra oggetto e schermo, a 32 cm da entrambi. I fuochi sono a metà '
     'di quelle distanze, cioè 16 cm dalla lente. L’immagine reale è capovolta e ha la stessa altezza '
     'in modulo; le altezze sono schematiche.',
 14: 'Il terzo pannello indica soltanto il verso antiorario e i tre tratti, senza una scala numerica '
     'degli assi p e V. L’area assegnata di 12 kPa·L corrisponde a 12 J; il lavoro del gas ha segno '
     'negativo. I primi due calori sono +40 e −15 J.',
 30: 'Nell’ultimo pannello i punti rappresentano il campo esterno uscente dal foglio, crescente. La '
     'corrente oraria produce invece un campo indotto entrante, indicato dalla croce centrale. La vista '
     'è quella del lettore.'}

BATCH='cric-c6-protected-exam-02'
SOURCE_IDS=[f'C6-Q{i:03}'for i in range(44,75)]
def assemble(repo,source_ref):
    overrides={n:{'error':{'category':CATEGORIES[n],'message':t[5],'target':'C6-L01'},'coverage':[t[0]]}for n,t in enumerate(TASKS,1)}
    return assemble_family(repo,source_ref,BATCH,TASKS,CHOICES,{},BATCH+'-progressive.svg',FIGURES,0,source_path='officina-di-fisica/content/C6.json',source_origin='cric',source_ids=SOURCE_IDS,course='C6',section='Simulazione 2',coverage=['Trentuno problemi distinti'],overrides=overrides)
if __name__=='__main__':write_family(assemble,BATCH)
