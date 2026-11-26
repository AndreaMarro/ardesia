"""Ten distinct original Cric wave questions; author edition, no own approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C5.json"
SOURCE_IDS=['C5-Q011', 'C5-Q012', 'C5-Q013', 'C5-Q014', 'C5-Q015', 'C5-Q016', 'C5-Q017', 'C5-Q018', 'C5-Q019', 'C5-Q020']
TASKS=[('Da una cresta alla valle vicina',
  'Una fotografia di un’onda sinusoidale su una corda mostra 18 cm, lungo la corda, fra una cresta e la valle '
  'immediatamente successiva. Qual è la lunghezza d’onda in centimetri?',
  36,
  'Una cresta e la valle subito successiva sono separate da mezzo ciclo spaziale. Un altro tratto uguale porta '
  'alla cresta seguente, che completa la lunghezza d’onda. Raddoppio quindi 18 cm e ottengo 36 cm. La misura è '
  'lungo la corda, non la distanza verticale fra cresta e valle.',
  '\\frac{\\lambda}{2}=18\\,\\mathrm{cm}\\qquad \\lambda=36\\,\\mathrm{cm}',
  '18 cm misura soltanto mezza lunghezza d’onda. 9 cm dimezzerebbe ancora quella misura. 72 cm conterebbe due '
  'cicli completi; l’ampiezza verticale non entra in questa distanza fra posizioni.',
  'Conta quale frazione di ciclo spaziale separa un massimo dal minimo adiacente.'),
 ('Un sensore fermo legge un tempo',
  'Un sensore resta in un punto fisso. Il suo grafico ha tempo t in millisecondi sull’asse orizzontale e '
  'pressione in pascal sul verticale. Che cosa misura l’intervallo fra due massimi consecutivi?',
  ['La distanza percorsa da una molecola',
   'Il periodo',
   'La lunghezza d’onda',
   'L’ampiezza di pressione',
   'La velocità di propagazione'],
  'Il sensore registra due eventi successivi nello stesso punto. L’intervallo sull’asse dei tempi è il periodo '
  'della pressione oscillante. La lunghezza d’onda richiede invece una distanza fra punti diversi osservati allo '
  'stesso istante. I millisecondi dell’ascissa permettono di riconoscere quale delle due misure si sta leggendo.',
  'T=t_{\\max,2}-t_{\\max,1}',
  'L’ampiezza si legge in verticale e ha qui unità pascal. La velocità richiederebbe anche una distanza e non '
  'coincide con un tempo. Un grafico della pressione non disegna la traiettoria di una singola molecola.',
  'Leggi l’unità dell’asse prima di dare un nome alla separazione dei massimi.'),
 ('Seguire il materiale e seguire la forma',
  'Un singolo impulso trasversale passa su una corda ideale lineare e poi si allontana, senza lasciare '
  'deformazione residua. Che cosa accade a una macchia d’inchiostro fissata a una porzione della corda?',
  ['Si divide in due macchie che seguono i due versi',
   'Acquista necessariamente uno spostamento longitudinale pari alla lunghezza dell’impulso',
   'Torna alla posizione di equilibrio iniziale',
   'Viaggia lungo la corda insieme all’impulso fino all’estremità',
   'Resta per sempre alla massima altezza'],
  'La macchia individua materia della corda. Al passaggio dell’impulso quella porzione si muove trasversalmente e '
  'poi torna all’equilibrio, nelle ipotesi dichiarate. La forma dell’impulso può continuare a propagarsi lontano '
  'mentre la materia marcata rimane nella sua regione. Trasporto della perturbazione e moto del mezzo sono '
  'descrizioni distinte.',
  'y(x_0,t)\\longrightarrow0',
  'Il movimento della forma non trascina ogni porzione di corda fino all’estremità. La permanenza al massimo '
  'contraddice il ritorno all’equilibrio dichiarato. Un singolo segno materiale non si divide per il principio di '
  'sovrapposizione.',
  'Confronta il moto di una porzione marcata con quello del massimo della forma.'),
 ('Un quarto di lunghezza d’onda',
  'Due punti lungo un’onda sinusoidale progressiva sono separati da 0,12 m. La lunghezza d’onda è 0,48 m. Qual è '
  'il modulo della differenza di fase spaziale nello stesso istante?',
  ['π rad', '2π rad', '1/4 rad', 'π/2 rad', 'π/4 rad'],
  'La distanza assegnata è un quarto della lunghezza d’onda, perché 0,12/0,48=1/4. Un intero ciclo spaziale '
  'contiene 2π radianti. Moltiplicando il quarto per 2π trovo π/2 radianti. La fase si confronta simultaneamente '
  'nei due punti; non serve un ritardo temporale misurato dal sensore.',
  '\\frac{\\Delta x}{\\lambda}=\\frac14\\qquad |\\Delta\\varphi|=2\\pi\\frac{\\Delta x}{\\lambda}\\qquad '
  '|\\Delta\\varphi|=\\frac\\pi2',
  '1/4 rad copia la frazione di ciclo senza convertirla in radianti. π rad descriverebbe mezza lunghezza d’onda e '
  '2π rad una intera. π/4 rad corrisponderebbe a un ottavo di ciclo.',
  'Trasforma la frazione di lunghezza d’onda nella stessa frazione di un giro di fase.'),
 ('Sottrarre due eventi della stessa cresta',
  'Il massimo di un impulso passa per x=0,40 m a t=0,16 s e per x=1,60 m a t=0,24 s. Qual è la sua velocità media '
  'orientata, in metri al secondo?',
  15,
  'Lo spostamento della stessa cresta è 1,60−0,40=1,20 m, positivo. Il tempo trascorso è 0,24−0,16=0,08 s. Divido '
  '1,20 per 0,08: moltiplicando entrambi per cento ottengo 120/8=15 m/s. Il risultato descrive la propagazione '
  'del massimo, non la velocità trasversale delle porzioni di corda.',
  '\\Delta x=1{,}20\\,\\mathrm m\\qquad \\Delta t=0{,}08\\,\\mathrm s\\qquad \\overline v=15\\,\\mathrm{m/s}',
  '20 m/s dividerebbe la posizione finale per il solo intervallo 0,08 s. Usare 1,60/0,24 riferirebbe erroneamente '
  'il moto all’origine. Il verso negativo contraddice lo spostamento positivo della cresta fra i due eventi.',
  'Sottrai entrambe le coppie di coordinate prima di costruire il rapporto.'),
 ('Frequenza tripla sulla stessa corda',
  'Nel regime non dispersivo sulla stessa corda la velocità di propagazione resta positiva e costante. La '
  'sorgente triplica la frequenza. Come cambia la distanza fra creste adiacenti?',
  ['Diventa un terzo', 'Triplica', 'Diventa un nono', 'Resta uguale', 'Diventa tre volte la velocità'],
  'La distanza fra creste è la lunghezza d’onda. Durante un periodo la forma avanza di λ e vale v=λf. A velocità '
  'fissata la nuova frequenza 3f richiede λ_f=v/(3f)=λ_i/3. Una stessa lunghezza di corda contiene quindi tre '
  'volte più cicli spaziali.',
  'v=\\lambda f\\qquad \\frac{\\lambda_f}{\\lambda_i}=\\frac13',
  'Triplicare λ aumenterebbe il prodotto λf di un fattore nove e violerebbe v costante. Il fattore 1/9 '
  'richiederebbe una frequenza nove volte maggiore. Frequenza e lunghezza d’onda hanno dimensioni diverse.',
  'Isola λ nella relazione fra velocità, frequenza e lunghezza d’onda.'),
 ('Una fase spaziale per metro',
  'Un’onda è descritta da y=A cos(kx−ωt), con x in metri e t in secondi. La lunghezza d’onda è 2,5 m. Qual è il '
  'numero d’onda angolare k, esatto in radianti al metro?',
  ['5/(4π) rad/m', '4π/5 rad/m', '2/5 rad/m', '5π rad/m', '4π rad/m'],
  'La fase cresce di 2π radianti quando x cresce di una lunghezza d’onda. Perciò k=2π/λ. Scrivo 2,5 m come 5/2 m '
  'e divido: 2π/(5/2)=4π/5 rad/m. L’unità rad/m rende kx una fase in radianti. Non occorre approssimare π.',
  'k\\lambda=2\\pi\\qquad k=\\frac{2\\pi}{\\lambda}\\qquad k=\\frac{4\\pi}{5}\\,\\mathrm{rad/m}',
  '2/5 rad/m copia il numero di cicli per metro senza moltiplicarlo per 2π. 5π rad/m moltiplica 2π per la '
  'lunghezza invece di dividerlo. Il valore 5/(4π) inverte il coefficiente numerico del k richiesto.',
  'Un intero periodo spaziale deve produrre una fase di 2π radianti.'),
 ('Lungo la propagazione',
  'In un’onda sonora piana in aria le particelle del mezzo oscillano parallelamente alla direzione di '
  'propagazione. Come si chiama questo tipo di onda?',
  ['Stazionaria necessariamente',
   'Priva di compressioni',
   'Longitudinale',
   'Trasversale',
   'Elettromagnetica nel vuoto'],
  'La distinzione riguarda la direzione del moto locale del mezzo. Le particelle si spostano avanti e indietro '
  'lungo la direzione in cui la perturbazione avanza: l’onda è longitudinale. Compressioni e rarefazioni possono '
  'così propagarsi senza che la stessa particella viaggi insieme a un fronte per tutto il percorso.',
  '\\mathbf v_{\\rm particella}\\parallel\\mathbf k',
  'Trasversale descriverebbe spostamenti perpendicolari alla propagazione. La geometria longitudinale non impone '
  'onde stazionarie e non elimina le compressioni. Un grafico sinusoidale della pressione non è una traiettoria '
  'trasversale dell’aria.',
  'Confronta il moto delle particelle con la direzione della perturbazione.'),
 ('Seguire una cresta a fase costante',
  'Un’onda progressiva ha fase (6 rad/m)x−(12 rad/s)t. Quale spostamento orientato compie una stessa cresta in '
  '0,30 s?',
  ['+0,15 m', '+3,6 m', '+2,0 m', '+0,60 m', '−0,60 m'],
  'Sulla stessa cresta la fase resta costante: 6Δx−12Δt=0 con le unità della consegna. Isolo Δx=(12/6)Δt. La '
  'velocità di fase è +2 m/s e in 0,30 s la cresta avanza di +0,60 m. Il segno meno davanti al termine temporale '
  'richiede x crescente per compensare t crescente.',
  '6\\,\\frac{\\mathrm{rad}}{\\mathrm m}\\Delta x=12\\,\\frac{\\mathrm{rad}}{\\mathrm s}\\Delta t\\qquad '
  'v=2\\,\\mathrm{m/s}\\qquad \\Delta x=+0{,}60\\,\\mathrm m',
  '−0,60 m sceglie il verso opposto. +0,15 m inverte il rapporto 12/6 prima di moltiplicare per il tempo. +3,6 '
  'copia 12·0,30 senza dividere per 6; +2,0 copia il coefficiente numerico della velocità senza usare la durata.',
  'Imponi variazione nulla della fase per seguire lo stesso massimo.'),
 ('Una fotografia misura uno spazio',
  'Hai una sola fotografia calibrata in spazio di un profilo sinusoidale sulla corda, senza tempi né dati '
  'dinamici del mezzo. Quale grandezza fra queste puoi ricavare direttamente?',
  ['La frequenza',
   'Il periodo',
   'La velocità di fase',
   'La velocità trasversale istantanea delle particelle',
   'La lunghezza d’onda'],
  'Fra due creste adiacenti sulla fotografia si misura una lunghezza d’onda. La fotografia riunisce punti diversi '
  'allo stesso istante e non indica quanto tempo impieghi la forma a spostarsi. Onde con la stessa lunghezza '
  'd’onda possono avere frequenze e velocità diverse, se non sono assegnate altre condizioni.',
  '\\lambda=x_{\\rm cresta,2}-x_{\\rm cresta,1}',
  'Frequenza e periodo richiedono informazione temporale. Anche le velocità richiedono una variazione nel tempo e '
  'non si leggono dalla sola pendenza spaziale della fotografia. L’ampiezza sarebbe un’altra misura spaziale '
  'possibile, ma non è proposta fra queste alternative.',
  'Cerca una distanza tra due punti nella stessa immagine.')]
CHOICES={2: 1, 3: 2, 4: 3, 6: 0, 7: 1, 8: 2, 9: 3, 10: 4}
UNITS={1: 'cm', 5: 'm/s'}
FIGURES={1: 'Il primo pannello è un’istantanea: la valle è a 18 cm dalla prima cresta, mentre la cresta successiva è a 36 cm. Gli assi spaziale e trasversale sono distinti; la scala verticale è schematica.', 4: 'Il cerchio centrale rappresenta soltanto una fase, non l’orbita di una particella della corda. Un quarto di giro corrisponde alla separazione spaziale λ/4 e alla fase π/2.', 5: 'L’ultimo pannello rappresenta le differenze rispetto al primo evento: Δx=0 e Δt=0 sono x=0,40 m e t=0,16 s. La retta arriva a Δx=1,20 m dopo Δt=0,08 s; la pendenza è 15 m/s.'}
def assemble(repo,source_ref):
 categories={1: 'concetto', 2: 'concetto', 3: 'concetto', 4: 'algebra', 5: 'calcolo', 6: 'modello', 7: 'unità', 8: 'concetto', 9: 'algebra', 10: 'concetto'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C5-L02"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c5-l02",TASKS,CHOICES,UNITS,"cric-c5-l02-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C5",skill="C5-L02",section="Onde e oscillazioni",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c5-l02")
