"""Author-only temporal interference and two separately stated Doppler tasks."""
from .vector_geometry_authoring import assemble_family,write_family
from .pipeline import digest
P='In un punto fisso di un mezzo lineare si sommano due spostamenti longitudinali armonici stabili di uguale ampiezza, stessa polarizzazione e frequenze costanti f₁>f₂>0. Nel modello del grafico i massimi coincidono a t=0. Le loro fasi relative evolvono nel tempo; non si assume una differenza di fase costante fra frequenze diverse. Per frequenze vicine l’inviluppo varia lentamente rispetto alle oscillazioni rapide. Si assegna f_b=|f₁−f₂|=f₁−f₂: conta i massimi consecutivi del modulo dell’inviluppo, non i cicli del fattore con segno. I valori qui assegnati sono una nuova parametrizzazione con portanti vicine in centinaia di Hz; nessuna stima percettiva è richiesta. '
TASKS=[
('Due portanti vicine, una variazione lenta',P+'Con f₁=302 Hz e f₂=300 Hz, quanto vale f_b in Hz?',2,
 'Sottraiamo le frequenze, non le ampiezze: 302−300=2 Hz. Il segnale totale compie oscillazioni rapide attorno alla frequenza media 301 Hz, ma il suo modulo si rinforza due volte ogni secondo. La formula di somma di due coseni separa un fattore rapido e uno lento. Poniamo u=t/(1 s), tempo espresso come numero puro: con le fasi iniziali assegnate s=2A cos(2πu)cos(602πu). Il modulo dell’inviluppo lento è 2A|cos(2πu)|, con massimi separati da mezzo secondo. Non bisogna confondere questa cadenza con la frequenza media o con la metà della differenza che appare nel coseno con segno.',
 r'f_b=f_1-f_2\qquad u=\frac{t}{1\,\mathrm s}\qquad E=2A|\cos(2\pi u)|\qquad f_b=2\,\mathrm{Hz}\qquad f_{\rm media}=301\,\mathrm{Hz}\qquad T_b=\frac12\,\mathrm s',
 '602 Hz è la somma e 301 Hz la portante media. Uno Hz è la frequenza del fattore lento con segno: il suo modulo ha due massimi per ciclo. Il valore due nasce dalla differenza, non dall’intensità sommata.','Conta i massimi del modulo, non il cambio di segno dell’inviluppo.'),
('L’unità di una cadenza','f_b indica quanti massimi consecutivi del modulo dell’inviluppo si osservano per secondo. Quale unità è adatta?',['Hz','s','m','W/m²','rad'],
 'Una frequenza di battimento ha dimensione di tempo inverso, come ciascuna frequenza sottratta. Un hertz significa una ripetizione al secondo; il periodo fra massimi è invece il suo reciproco in secondi.',
 r'[f_b]=\mathrm{s^{-1}}\qquad [T_b]=\mathrm s\qquad T_b=1/f_b',
 'Secondi misurano il periodo, metri uno spostamento, W/m² un’intensità e radianti una fase. Nessuna di queste unità esprime una frequenza.','Distingui il numero di ripetizioni dal tempo fra due ripetizioni.'),
('Un caso Doppler distinto dai battimenti','Una sorgente sonora e un ascoltatore si avvicinano lungo la retta che li unisce, in aria ferma. I moti sono subsonici, la velocità del suono nel mezzo è c>0 e la frequenza emessa è costante. Quale affermazione descrive l’effetto Doppler?',['La frequenza ricevuta è maggiore di quella emessa','La frequenza ricevuta è minore di quella emessa','La frequenza ricevuta non cambia mai','La velocità del suono raddoppia','Il suono deve annullarsi per interferenza'],
 'Indichiamo con f₀ la frequenza emessa, con v_s il modulo della velocità della sorgente verso il ricevitore e con v_o quello del ricevitore verso la sorgente, entrambi rispetto all’aria; sono non negativi e almeno uno è positivo. La sorgente che avanza accorcia la distanza fra i fronti emessi davanti a sé. L’ascoltatore che le va incontro incontra anche più fronti per secondo. I due effetti aumentano la frequenza ricevuta rispetto a quella emessa. Questo quesito riguarda un singolo segnale e moti relativi al mezzo: non si applica la differenza fra due portanti ferme.',
 r'f_{\rm ric}=f_0\frac{c+v_o}{c-v_s}\qquad 0\le v_o<c\qquad 0\le v_s<c\qquad f_{\rm ric}>f_0',
 'Una diminuzione corrisponderebbe all’allontanamento. La velocità nel mezzo non raddoppia per il moto della sorgente; non serve una seconda onda per l’effetto Doppler e non segue una cancellazione. Almeno uno dei due moduli è non nullo perché la distanza diminuisce.','Considera quanti fronti raggiungono l’ascoltatore in un secondo.'),
('Avvicinare ulteriormente le frequenze',P+'f₁ passa da 302 a 301 Hz, mentre f₂ resta 300 Hz. Come cambia f_b?',['Da 2 a 1 Hz','Da 2 a 4 Hz','Resta 2 Hz','Da 2 a 1/2 Hz','Da 2 a 301 Hz'],
 'La separazione scende da due a uno Hz. La cadenza dei massimi si dimezza e il tempo fra due massimi raddoppia da mezzo secondo a un secondo. Il rapporto fra le grandi frequenze delle portanti non è il fattore da applicare al piccolo scarto.',
 r'f_{b,A}=2\,\mathrm{Hz}\qquad f_{b,B}=1\,\mathrm{Hz}\qquad T_{b,B}=1\,\mathrm s',
 'Quattro inverte l’effetto della minore separazione, mezzo dimezza ancora il risultato, 301 copia la portante e due ignora la nuova frequenza.','Confronta le differenze, non i rapporti fra portanti.'),
('Ricostruire la portante superiore',P+'Si misura f_b=2 Hz e si conosce f₂=300 Hz. Quanto vale f₁ in Hz?',302,
 'Il ramo f₁>f₂ stabilisce da quale lato aggiungere lo scarto. La portante superiore è 300+2=302 Hz. La soluzione 298 Hz sarebbe inferiore a f₂ e richiederebbe scambiare le etichette del ramo.',
 r'f_1=f_2+f_b\qquad f_1=302\,\mathrm{Hz}',
 'Due è solo la differenza, 300 l’altra portante e 298 appartiene al ramo inverso. Non si sommano né sottraggono quadrati per ricostruire una frequenza da una differenza.','Il segno del ramo è già fissato dall’ordine f₁>f₂.'),
('Ricostruire la portante inferiore',P+'Si misura f_b=2 Hz con f₁=302 Hz. Quanto vale f₂ in Hz?',300,
 'La frequenza minore si ricava sottraendo il battimento dalla maggiore: 302−2=300 Hz. È positiva e resta vicina alla maggiore, come richiede il modello dell’inviluppo lento.',
 r'f_2=f_1-f_b\qquad f_2=300\,\mathrm{Hz}\qquad 0<f_b<f_1',
 '304 aggiunge lo scarto e produrrebbe una seconda frequenza maggiore della prima. Se il battimento fosse almeno f₁, questa inversa darebbe zero o un numero negativo e il ramo non sarebbe ammissibile.','Controlla anche la positività della portante ricostruita.'),
('Una seconda frequenza più vicina',P+'A: f₁=302 Hz,f₂=300 Hz. B mantiene f₁ e usa f₂=301 Hz. Quanto vale f_b,B/f_b,A?',['1/2','2','1','301/300','1/4'],
 'Le differenze sono due e uno Hz, quindi il rapporto è un mezzo. L’incremento di un solo Hz sulla frequenza inferiore riduce molto il piccolo scarto, pur cambiando poco il rapporto fra le portanti.',
 r'f_{b,A}=2\,\mathrm{Hz}\qquad f_{b,B}=1\,\mathrm{Hz}\qquad f_{b,B}/f_{b,A}=\frac12',
 'Due è il reciproco, uno ignora il cambiamento, 301/300 segue il solo ingresso e un quarto quadra il rapporto. La frequenza di battimento dipende dalla differenza.','Calcola i due piccoli scarti prima di dividerli.'),
('Lo scarto di una frequenza proposta',P+'Con f₁=302 Hz,f₂=300 Hz si propone f_b=4 Hz. Quanto vale proposta meno corretta?',['2 Hz','−2 Hz','4 Hz','0 Hz','6 Hz'],
 'La frequenza di battimento corretta è due Hz. La proposta quattro la supera di due Hz. Il segno dello scarto dipende dall’ordine della sottrazione, anche se tutte le frequenze fisiche sono positive.',
 r'f_b=2\,\mathrm{Hz}\qquad e=(4-2)\,\mathrm{Hz}\qquad e=2\,\mathrm{Hz}',
 'Meno due scambia l’ordine, quattro copia la proposta, sei somma e zero la accetta. Non si sottrae la portante media alla proposta di battimento.','Confronta due valori della stessa grandezza.'),
('L’inversa nel ramo assegnato',P+'Quale relazione isola f₁?',['f₁ = f_b + f₂','f₁ = f₂ − f_b','f₁ = f_b f₂','f₁ = f_b / f₂','f₁ = f_b² + f₂²'],
 'Nel ramo f₁>f₂ il modulo diventa f_b=f₁−f₂. Aggiungendo f₂ si ricava f₁=f_b+f₂, automaticamente superiore a f₂ per f_b>0. Senza l’ordine delle etichette il solo modulo ammetterebbe anche un altro ramo.',
 r'f_b=f_1-f_2\qquad f_1=f_b+f_2',
 'f₂−f_b scende sotto f₂. Il prodotto e la somma dei quadrati hanno dimensione Hz², il quoziente è puro. L’inversa richiesta deve conservare sia le unità sia il ramo.','Rimuovi il modulo soltanto dopo aver usato l’ordine delle frequenze.'),
('Fattori diversi sulle portanti',P+'B usa f₁,B=κ₁f₁ e f₂,B=κ₂f₂, con fattori positivi. Entrambe le prove restano nel regime di frequenze vicine e κ₁f₁>κ₂f₂. Quale rapporto dà f_b,B/f_b,A?',['(κ₁ f₁ − κ₂ f₂) / (f₁ − f₂)','κ₁ − κ₂','κ₁ / κ₂','κ₁ κ₂','(κ₁ f₁ + κ₂ f₂) / (f₁ + f₂)'],
 'I fattori agiscono sui due ingressi prima della sottrazione. Il rapporto dei battimenti è la nuova differenza divisa per quella iniziale. Con un fattore comune κ le differenze scalano di κ; con fattori diversi occorre invece conservare le frequenze nel risultato.',
 r'f_{b,B}=\kappa_1f_1-\kappa_2f_2\qquad \frac{f_{b,B}}{f_{b,A}}=\frac{\kappa_1f_1-\kappa_2f_2}{f_1-f_2}',
 'La differenza dei fattori darebbe zero per prove identiche. Prodotto e quoziente perdono gli scarti; l’ultima espressione confronta somme, non battimenti. Le condizioni aggiunte impediscono il cambio di ramo e preservano il regime lento.','Sostituisci nelle due differenze complete.'),
('Cambiare portanti conservando uno scarto piccolo',P+'A: f₁=302 Hz,f₂=300 Hz. B: f₁=401 Hz,f₂=400 Hz. Quanto vale f_b,B/f_b,A?',['1/2','2','401/302','4/3','1'],
 'La prova A ha differenza due Hz; B ha differenza uno Hz. Il rapporto dei battimenti è un mezzo, benché entrambe le portanti siano aumentate. Conta la loro separazione, non la loro quota assoluta.',
 r'f_{b,A}=2\,\mathrm{Hz}\qquad f_{b,B}=1\,\mathrm{Hz}\qquad f_{b,B}/f_{b,A}=\frac12',
 'Due inverte il rapporto. 401/302 segue solo f₁ e quattro terzi solo f₂; uno ignora il nuovo scarto. Entrambe le coppie hanno differenza molto minore della loro frequenza media.','Sottrai all’interno di ogni prova.'),
('Una media fra cadenze',P+'A usa 302 e 300 Hz; B usa 401 e 400 Hz. Qual è la media aritmetica dei due f_b, con uguale peso statistico?',['3/2 Hz','3 Hz','1/2 Hz','2 Hz','1 Hz'],
 'Prima ricaviamo due e uno Hz, poi la semisomma tre mezzi Hz. In questo ramo lineare la stessa risposta si ottiene dalle portanti medie 703/2 e 350 Hz: la loro differenza è tre mezzi. La coincidenza dipende dal mantenimento dell’ordine delle frequenze, non autorizza una regola universale per tutti i moduli.',
 r'\overline f_b=\frac{2+1}{2}\,\mathrm{Hz}\qquad \overline f_b=\frac32\,\mathrm{Hz}',
 'Tre è la somma, mezzo la semidifferenza e due o uno conservano una sola prova. Il periodo medio non è il reciproco di questa media: si stanno mediando frequenze, non tempi fra massimi.','Distingui la media statistica dalla cadenza di un singolo segnale.'),
('Un target vicino alla nuova portante',P+'A ha f₁=302 Hz,f₂=300 Hz. B impone f₁=401 Hz e f_b,B=f_b,A/2. Quanto vale f₂,B/f₂,A?',['4/3','3/4','1/2','401/302','400'],
 'Il battimento target è uno Hz. La frequenza inferiore deve essere 401−1=400 Hz. Il rapporto con i 300 Hz iniziali è quattro terzi. La coppia risultante mantiene f₁>f₂ e uno scarto piccolo rispetto alle portanti.',
 r'f_{b,B}=1\,\mathrm{Hz}\qquad f_{2,B}=400\,\mathrm{Hz}\qquad f_{2,B}/f_{2,A}=\frac43',
 'Tre quarti capovolge gli stati, mezzo copia il target, 401/302 considera solo la frequenza maggiore e 400 è il numero di Hz finale, non il rapporto puro.','Trova prima lo scarto target, poi la nuova frequenza inferiore.'),
('Una taratura sulla differenza',P+'Il display continuo adimensionale segue S=qf_b, con q>0 e nessun offset. A: f₁=302 Hz,f₂=300 Hz,S=6. B: f₂=400 Hz,S=3. Quanto vale f₁,B in Hz?',401,
 'La differenza di riferimento due Hz dà q=3 s. La lettura tre rappresenta f_b=1 Hz. Aggiungendo questo scarto ai 400 Hz inferiori si ricava la frequenza maggiore 401 Hz, senza trattare la lettura del display come una portante.',
 r'q=3\,\mathrm s\qquad f_{b,B}=1\,\mathrm{Hz}\qquad f_{1,B}=401\,\mathrm{Hz}',
 'Tre è la lettura grezza e uno lo scarto, non la portante. Usare tre Hz al posto dello scarto decodificato darebbe 403 Hz e ricostruirebbe una lettura nove.','Decodifica f_b prima di aggiungere f₂.'),
('Un offset sul segnale lento',P+'S=qf_b+b è continuo e adimensionale. A: f₁=302 Hz,f₂=300 Hz,S=5. B: f₁=401 Hz,f₂=400 Hz,S=3. C: f₂=500 Hz,S=7. Quanto vale f₁,C?',['503 Hz','507 Hz','500 Hz','501 Hz','505 Hz'],
 'I battimenti due e uno Hz fissano q=2 s e b=1. La lettura sette rappresenta (7−1)/2=3 Hz. Per mantenere il ramo superiore sommiamo tre ai 500 Hz assegnati: la risposta è 503 Hz.',
 r'q=2\,\mathrm s\qquad b=1\qquad f_{b,C}=3\,\mathrm{Hz}\qquad f_{1,C}=503\,\mathrm{Hz}',
 '507 usa il display come scarto; 500 annulla il battimento. 501 e 505 darebbero letture tre e undici, non sette. La nuova separazione tre Hz resta piccola rispetto alle portanti intorno a 500 Hz.','Togli l’offset e il guadagno prima di ricostruire la portante.'),
('Il Doppler in due versi, un’altra legge','Un osservatore è fermo in un mezzo omogeneo fermo con velocità del suono c>0. La stessa sorgente emette frequenza propria costante f₀; in due prove rettilinee si avvicina e si allontana con uguale modulo v, con 0<v<c. I modelli assegnati sono f_avv=f₀c/(c−v) e f_all=f₀c/(c+v). Si misurano f_avv=600 Hz e f_all=400 Hz. Quanto vale f₀ in Hz?',480,
 'Consideriamo i reciproci delle due frequenze per separare l’incognita di moto. Sommandoli si cancellano i termini opposti v/c: 1/f_avv+1/f_all=2/f₀. La frequenza emessa è quindi la media armonica delle due ricevute, non la loro semisomma. Due per 600 per 400 diviso mille dà 480 Hz. Il rapporto dei dati implica v/c=1/5, quindi il ramo subsonico è ammissibile.',
 r'\frac1{f_{\rm avv}}+\frac1{f_{\rm all}}=\frac2{f_0}\qquad f_0=\frac{2f_{\rm avv}f_{\rm all}}{f_{\rm avv}+f_{\rm all}}\qquad f_0=480\,\mathrm{Hz}\qquad \frac vc=\frac{600-400}{600+400}=\frac15',
 '500 Hz è la media aritmetica e non risolve entrambe le equazioni. 200 Hz è la differenza dei dati, non la frequenza emessa; la legge dei battimenti non sostituisce il Doppler. La frequenza emessa deve stare fra 400 e 600 Hz, ma questo controllo da solo non determina il valore.','Somma i reciproci per eliminare v senza conoscere c numericamente.'),
]
CHOICES={n:0 for n in [2,3,4,7,8,9,10,11,12,13,15]}
UNITS={1:'Hz',5:'Hz',6:'Hz',14:'Hz',16:'Hz'}
FIGURES={1:'Due portanti stabili 302 e 300 Hz producono un inviluppo di modulo 2A|cos[2πt/(1 s)]|. Il grafico mostra solo l’inviluppo lento, non le oscillazioni rapide a 301 Hz: 400 px/s e 60 px per ampiezza A. I massimi a t=0,1/2,1 s distano mezzo secondo, quindi f_b=2 Hz.',16:'Schema dei fronti nel solo caso Doppler: a pari periodo emesso, le distanze davanti e dietro la sorgente sono (c−v)/f₀ e (c+v)/f₀. Le linee sono schematiche, non una scala di lunghezze o tempi; il mezzo è fermo e 0<v<c. Il confronto dei reciproci serve alla frequenza emessa.'}
def assemble(repo,source_ref):
 package,bindings=assemble_family(repo,source_ref,'beats-envelope',TASKS,CHOICES,UNITS,'beats-envelope-progressive.svg',FIGURES,14600,unit='u4',course='C5',source_path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-02.json',skill='C5-L03',prerequisites=['C1-L001','C5-L01','C5-L02','C5-L03','C5-L05'],section='Inviluppo temporale e due casi Doppler distinti',coverage=['Battimenti e modulo dell’inviluppo','Differenza di frequenze e ramo positivo','Doppler qualitativo e inversa nei due versi'])
 for n in (3,16):
  row=package['records'][n-1]
  row['skill']='C5-L05';row['error']['target']='C5-L05'
  row['prerequisites']=['C1-L001','C5-L01','C5-L02','C5-L05']
  bindings[n-1]['candidateSha256']=digest(row)
 return package,bindings
if __name__=='__main__':write_family(assemble,'beats-envelope-146')
