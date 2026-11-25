"""Author-only ideal lever equilibrium with perpendicular moment arms."""
from .vector_geometry_authoring import assemble_family, write_family
TASKS=[('L’equilibrio confronta due momenti',
  'Una leva rigida orizzontale senza peso è ferma su una cerniera ideale fissa O, nel riferimento inerziale. '
  'Due forze verticali verso il basso agiscono su lati opposti: la motrice F a sinistra con braccio a=2 m, '
  'la resistente R=2 N a destra con braccio b=2 m. La cerniera esercita una reazione, ma nessuna coppia. '
  'Quanto vale F, in N?',
  2,
  'Prendiamo positivi i momenti antiorari. La forza a sinistra produce+aF, quella a destra−bR; la reazione '
  'passa perO e ha momento nullo. L’equilibrio richiede aF=bR, perciò i due bracci uguali impongono qui '
  'moduli uguali. Non si può imporre F=R senza controllare prima i bracci.',
  '\\sum M_O=aF-bR=0\\qquad aF=bR\\qquad F=\\frac{Rb}{a}\\qquad F=\\frac{(2\\,\\mathrm N)(2\\,\\mathrm '
  'm)}{2\\,\\mathrm m}=2\\,\\mathrm N',
  'Il peso nullo dell’asta evita un terzo momento. L’equilibrio delle forze richiede anche una reazione '
  'verticale verso l’alto R_O=F+R=4 N: essa non entra nel momento rispetto aO, ma non è assente dalla '
  'fisica. Questa soluzione vale per una cerniera priva di coppia resistente.',
  'ScegliO per i momenti, così la reazione incognita non contribuisce al bilancio rotazionale.'),
 ('Dal momento alla forza equilibrante',
  'Una leva in equilibrio soddisfa aF=Rb, con a, b bracci perpendicolari in metri e R in newton. Quale unità '
  'SI ha F=Rb/a?',
  ['N', 'N·m', 'kg', 'm', '1'],
  'Il rapporto b/a è fra due lunghezze e quindi è puro. Moltiplicandolo per una forza rimane una forza. Il '
  'prodotto Rb sarebbe invece un momento, prima della divisione per il braccio motore.',
  '[Rb]=ML^2/T^2\\qquad [Rb/a]=ML/T^2\\qquad F\\text{ in }\\mathrm N',
  'N·m esprime il momento non ancora diviso per a; kg massa e m lunghezza.1 non può essere la forza '
  'richiesta. Il valore 2 m del braccio motore deve conservare la propria dimensione anche quando il numero '
  'due sembra un semplice coefficiente.',
  'Cancella i metri del rapporto fra i due bracci.'),
 ('Che cosa significa corpo rigido?',
  'Un oggetto è modellato come corpo perfettamente rigido e può ruotare nel laboratorio. Quale proprietà '
  'rimane costante per qualunque coppia dei suoi punti materiali?',
  ['La distanza fra i due punti',
   'Le loro posizioni nel laboratorio',
   'La direzione del segmento nel laboratorio',
   'Le loro velocità in ogni moto',
   'Le loro quote in ogni moto'],
  'Rigidità significa assenza di deformazione: ogni distanza interna è invariata. Una rotazione cambia in '
  'generale la direzione del segmento che unisce due punti e le loro coordinate, ma non la sua lunghezza. '
  'Non occorre che i punti restino fermi nello spazio.',
  'd_{PQ}=|\\vec r_Q-\\vec r_P|\\qquad d_{PQ}=\\mathrm{costante}',
  'Quote e velocità dipendono dal moto e non sono costanti in tutte le rotazioni. Alcuni punti sull’asse '
  'potrebbero restare fermi, ma la domanda chiede una proprietà di qualunque coppia. La distanza interna è '
  'la caratteristica che definisce il modello rigido, anche per una leva.',
  'Distingui una proprietà interna del corpo dalle coordinate viste dal laboratorio.'),
 ('Raddoppia la resistenza allo stesso braccio',
  'Una leva rigida senza peso è ferma su una cerniera ideale fissa che non esercita coppia. F e R hanno '
  'momenti opposti e bracci perpendicolari a=2 m e b=2 m. Fra due prove R passa da 2 a 4 N. Come cambia la '
  'forza motrice F?',
  ['Da 2 a 4 N', 'Resta 2 N', 'Da 2 a 8 N', 'Da 2 a 1 N', 'Diventa zero'],
  'A parità di bracci, il momento resistente raddoppia e deve raddoppiare anche quello motore. F=Rb/a segue '
  'quindi la resistenza: passa da 2 a 4 N. La reazione della cerniera si adatta per equilibrare anche le '
  'forze, senza introdurre un momento suO.',
  'F_A=\\frac{(2\\,\\mathrm N)(2\\,\\mathrm m)}{2\\,\\mathrm m}=2\\,\\mathrm N\\qquad F_B=4\\,\\mathrm '
  'N\\qquad F_B/F_A=2',
  'Otto newton raddoppierebbe anche b; uno invertirebbe l’effetto diR. Invarianza o zero non potrebbero '
  'compensare il nuovo momento resistente. Le due prove sono equilibri distinti, non una descrizione del '
  'moto durante una variazione istantanea del carico.',
  'Mantieni i bracci fissi e confronta i momenti resistenti.'),
 ('La resistenza dalla forza motrice',
  'Una leva rigida senza peso è ferma su cerniera ideale fissa senza coppia. F=2 N ha braccio a=2 m e '
  'momento opposto aR, il cui braccio è b=2 m. Quanto vale R>0, in N?',
  2,
  'Il momento motore vale 4 N·m. Il momento resistente deve avere uguale modulo e segno opposto, quindi '
  'R=Fa/b. I bracci uguali fanno cancellare il loro rapporto e restituiscono 2 N.',
  'Fa=4\\,\\mathrm{N\\,m}\\qquad R=\\frac{Fa}{b}\\qquad R=\\frac{4\\,\\mathrm{N\\,m}}{2\\,\\mathrm '
  'm}=2\\,\\mathrm N',
  'Il risultato non è il momento 4 N·m, che va ancora diviso perb. La reazione non ha momento rispetto alla '
  'cerniera e non altera questa inversa; se agisse una coppia al fulcro, servirebbe includerla e la '
  'relazione cambierebbe.',
  'Ricostruisci il momento noto e dividilo per il braccio resistente.'),
 ('Quanto deve essere lungo il braccio resistente?',
  'Una leva rigida senza peso è in equilibrio su una cerniera ideale fissa senza coppia. F=2 N agisce con '
  'braccio perpendicolare a=2 m; R=2 N produce il momento opposto. Quanto vale il braccio perpendicolare b, '
  'in m?',
  2,
  'Dal bilancio Fa=Rb isoliamo b=Fa/R. Il momento 4 N·m diviso per 2 N dà 2 m. b è la distanza '
  'perpendicolare alla retta d’azione della forza R, non una lunghezza totale della leva assegnata '
  'automaticamente.',
  'b=\\frac{Fa}{R}\\qquad b=\\frac{(2\\,\\mathrm N)(2\\,\\mathrm m)}{2\\,\\mathrm N}=2\\,\\mathrm m',
  'Un metro invertirebbe o dimezzerebbe un rapporto non richiesto. Con forze uguali i bracci devono essere '
  'uguali per dare momenti opposti dello stesso modulo. L’inversa richiedeR>0, come dichiarato.',
  'Dividi il momento motore per la forza resistente positiva.'),
 ('Più braccio resistente richiede più forza motrice',
  'Due leve ideali rigide senza peso sono in equilibrio, con momenti opposti diF e R e cerniera senza '
  'coppia. Il braccio motore è a=2 m e R=2 N in entrambe. Il braccio resistente passa da b_A=2 m a b_B=4 m. '
  'Quanto vale F_B/F_A?',
  ['2', '1/2', '4', '1', '−2'],
  'R e a restano fissi, quindi F è proporzionale ab. Il momento resistente passa da 4 a 8 N·m: per '
  'compensarlo sul braccio motore 2 m servono 2 e 4 N. Il rapporto è due.',
  'F_A=2\\,\\mathrm N\\qquad F_B=\\frac{(2\\,\\mathrm N)(4\\,\\mathrm m)}{2\\,\\mathrm m}=4\\,\\mathrm '
  'N\\qquad F_B/F_A=2',
  'Un mezzo attribuirebbe al braccio resistente l’effetto del braccio motore, che qui è fisso. Quattro '
  'introdurrebbe un quadrato; uno ignora il cambiamento; −2 non è rapporto fra moduli positivi di forze che '
  'devono mantenere gli stessi versi dei momenti.',
  'La resistenza più lontana aumenta il momento da compensare, non il vantaggio del braccio motore.'),
 ('Una proposta doppia sulla forza equilibrante',
  'Una leva rigida senza peso è in equilibrio su cerniera ideale senza coppia. Il braccio motore è a=2 m; '
  'R=2 N ha braccio b=2 m e momento opposto aF. Si proponeF=4 N. Quanto vale proposto meno corretto, in N?',
  2,
  'Il momento resistente è 4 N·m. Dividendo per a=2 m si trovaF=2 N. La proposta di 4 N produrrebbe un '
  'momento motore 8 N·m e non soddisferebbe l’equilibrio rotazionale. Lo scarto richiesto è 4−2=+2 N.',
  'F=Rb/a=2\\,\\mathrm N\\qquad e=4\\,\\mathrm N-2\\,\\mathrm N=2\\,\\mathrm N',
  '−2 N inverte l’ordine; 4 N ripete la proposta; 1 N dimezza ancora; 3 N non è la differenza. Il numero 4 '
  'del momento resistente non va copiato come 4 N: dividere per il braccio è necessario sia fisicamente sia '
  'dimensionalmente.',
  'Non confondere il momento inN·m con la forza inN.'),
 ('L’inversa con il braccio motore dimensionale',
  'Per una leva rigida senza peso in equilibrio su cerniera ideale senza coppia, F e R hanno momenti opposti '
  'e bracci positivi a=2 m, b. Quale formula isolaR daFa=Rb?',
  ['R=Fa/b', 'R=Fb/a', 'R=F/(ab)', 'R=2 Fa/b', 'R=Fa/(2 b)'],
  'Dividiamo il momento motoreFa perb>0. Il rapporto a/b è puro e converte un modulo di forza nell’altro. '
  'Conservare a come lunghezza esplicita evita di trattare il valore numerico 2 del braccio come se fosse '
  'senza unità.',
  'Fa=Rb\\qquad Fa/b=R\\qquad R=\\frac{Fa}{b}',
  'Fb/a scambia i bracci e risponde a un’altra leva; F/(ab) ha unità forza su lunghezza al quadrato. I '
  'fattori due extra non si ricavano dal bilancio e falliscono la sostituzione. Se a=b, l’inversa corretta '
  'ridàR=F.',
  'Dividi il momento noto per il braccio della forza da trovare.'),
 ('Due cambiamenti sul momento resistente',
  'Fra due equilibri di una leva ideale senza peso si passa daR, b>0 aR_B=κ₁R e b_B=κ₂b, con fattori '
  'positivi. Il braccio motore a=2 m resta fisso; la cerniera non esercita coppia e i momenti sono opposti. '
  'Quanto vale F_B/F_A?',
  ['κ₁ κ₂', 'κ₁ / κ₂', 'κ₂ / κ₁', 'κ₁ + κ₂', 'κ₁ κ₂²'],
  'La forza motrice è Rb/a. Il braccio motore costante si cancella nel rapporto e i due fattori del momento '
  'resistente si moltiplicano. Non compare una dipendenza inversa dab: quella sarebbe l’effetto di cambiare '
  'a, che qui non avviene.',
  'F_A=Rb/a\\qquad F_B=\\kappa_1\\kappa_2Rb/a\\qquad F_B/F_A=\\kappa_1\\kappa_2',
  'I quozienti attribuiscono a uno degli ingressi un effetto inverso; la somma non supera il controllo di '
  'identità; il quadrato di κ₂ introdurrebbe una legge quadratica del braccio non presente nei momenti di '
  'forza.',
  'Confronta i momenti resistenti e cancella lo stesso braccio motore.'),
 ('Resistenza doppia e braccio doppio',
  'In due equilibri di una leva ideale senza peso il braccio motore è a=2 m, la cerniera non esercita coppia '
  'e i momenti diF eR sono opposti. A: R=2 N, b=2 m. B: R=4 N, b=4 m. Quanto vale F_B/F_A?',
  4,
  'Il primo momento resistente è 4 N·m, il secondo 16 N·m. Sullo stesso braccio motore le forze sono 2 e 8 '
  'N. Il rapporto è quattro, prodotto del raddoppio del carico e di quello del braccio resistente.',
  'F_A=2\\,\\mathrm N\\qquad F_B=8\\,\\mathrm N\\qquad F_B/F_A=4',
  'Due considera uno solo dei cambiamenti; otto è la forzaB in newton e non il rapporto puro. Sedici è il '
  'momentoB, non una forza. L’inverso 1/4 scambierebbe le due prove.',
  'Valuta Rb in ciascuna prova prima di dividere per a.'),
 ('Media di due forze equilibranti',
  'Due equilibri di leve ideali senza peso hanno lo stesso braccio motore a=2 m e cerniera senza coppia. I '
  'momenti sono opposti. A: R=2 N, b=2 m. B: R=4 N, b=4 m. Qual è la media aritmetica delle forze motrici '
  'con uguale peso, in N?',
  5,
  'Le forze sono 2 e 8 N. La loro semisomma è 5 N, compresa fra i due valori. Ogni forza va calcolata con la '
  'propria coppiaR, b prima di fare la media: il prodotto di ingressi medi descriverebbe una terza leva.',
  'F_A=2\\,\\mathrm N\\qquad F_B=8\\,\\mathrm N\\qquad \\overline F=\\frac{2+8}{2}\\,\\mathrm N=5\\,\\mathrm '
  'N',
  '10 N è la somma; 5/2 N divide due volte. Gli ingressi mediR=3 N, b=3 m darebbero 9/2 N, diverso da 5 N; 4 '
  'o 6 non sono la semisomma. Questa è una media statistica di equilibri, non una risultante di forze agenti '
  'insieme.',
  'Calcola entrambe le forze e poi assegna loro lo stesso peso.'),
 ('Progettare il braccio per una forza quadrupla',
  'La leva ideale senza peso ha braccio motore a=2 m e cerniera senza coppia. A: R_A=2 N, b_A=2 m. InB si '
  'imponeR_B=4 N e si vuoleF_B=4 F_A, in equilibrio con momenti opposti. Quanto vale b_B/b_A?',
  2,
  'F_A è 2 N, quindi l’obiettivoF_B è 8 N. Il suo momento motore vale 16 N·m. Con resistenza 4 N serve un '
  'braccio 4 m: il rapporto con 2 m è due. La resistenza doppia fornisce già un fattore due nell’obiettivo.',
  'F_B=8\\,\\mathrm N\\qquad b_B=F_Ba/R_B\\qquad b_B=4\\,\\mathrm m\\qquad b_B/b_A=2',
  'Lasciare b a 2 m darebbe soltantoF_B=4 N; quadruplicare b darebbe 16 N, otto volteF_A. Quattro metri è il '
  'valore del nuovo braccio e non il rapporto. L’ipotesi di versi opposti va mantenuta oltre al confronto '
  'dei moduli.',
  'Ricostruisci il braccio dal momento motore obiettivo e dalla resistenza nuova.'),
 ('Uno strumento sulla forza motrice',
  'Un display continuo adimensionale segueS=cF, c>0, senza offset. Una leva ideale senza peso ha braccio '
  'motore a=2 m e cerniera senza coppia; F eR producono momenti opposti in equilibrio. Il riferimentoR=2 N, '
  'b=2 m dàS=6. Una prova con b=4 m dàS=24. Quanto valeR, in N?',
  4,
  'Il riferimento haF=2 N e fornisce c=3 N⁻¹. La lettura 24 rappresentaF=8 N. Per risalire alla resistenza '
  'usiamoR=Fa/b: il momento 16 N·m diviso 4 m dà 4 N.',
  'F_A=2\\,\\mathrm N\\qquad c=3\\,\\mathrm{N^{-1}}\\qquad F_B=24/c=8\\,\\mathrm N\\qquad '
  'R_B=F_Ba/b_B=4\\,\\mathrm N',
  'La lettura 24 non è già una forza innewton; usarla così darebbeR=12 N. Il controllo 4 N·4 m=8 N·2 m '
  'eS=3·8=24 ricostruisce equilibrio e strumento. Un guadagno strumentale non modifica i bracci meccanici.',
  'Decodifica F, poi confronta i due momenti per ricostruire R.'),
 ('Offset prima dell’equilibrio',
  'Un display continuo adimensionale segueS=cF+d, c>0, d costanti. Una leva ideale senza peso ha braccio '
  'motore a=2 m, cerniera senza coppia e momenti opposti diF, R in equilibrio. A: R=2 N, b=2 m, S=5. B: R=4 '
  'N, b=4 m, S=17. C: b=2 m, S=9. Quanto valeR_C?',
  ['2 N', '3 N', '4 N', '5 N', '8 N'],
  'Le forze di riferimento sono 2 e 8 N. La differenza di lettura 12 su 6 N dà c=2 N⁻¹ e l’offset è 1. C '
  'rappresentaF=4 N; con i bracci uguali 2 m, anche la resistenzaC deve valere 4 N.',
  'c=2\\,\\mathrm{N^{-1}}\\qquad d=1\\qquad F_C=(9-1)/c=4\\,\\mathrm N\\qquad R_C=F_Ca/b_C=4\\,\\mathrm N',
  'Le alternativeR=2, 3, 5, 8 N conb_C=2 m darebbero letture 5, 7, 11, 17. Solo 4 Nrestituisce 9. Non si '
  'devono confrontare le letture grezze come se fossero forze prima di togliere l’offset e il guadagno.',
  'Calibra su due forze motrici note, poi usa l’inversa del momento resistente.'),
 ('Un carico scelto proporzionale al braccio',
  'Fra equilibri diversi di una leva ideale senza peso si selezionaR=(1 N/m)b, b>0. Il braccio motore resta '
  'a=2 m; la cerniera non esercita coppia e i momenti diF, R sono opposti. Si misuraF=2 N. Quanto valeb, in '
  'm?',
  2,
  'Introduciamo il coefficiente c=1 N/m, cosìR=cb è dimensionalmente una forza. Nel bilancioFa=Rb '
  'compareFa=cb². Il rapportoFa/c vale 4 m²; la radice positiva è 2 m e il carico corrispondente 2 N.',
  'c=1\\,\\mathrm{N/m}\\qquad R=cb\\qquad Fa=cb^2\\qquad b^2=Fa/c=4\\,\\mathrm{m^2}\\qquad b_+=2\\,\\mathrm '
  'm\\qquad b_-=-2\\,\\mathrm m',
  'Il ramo negativo non è un braccio positivo e renderebbe negativo anche il moduloR nel vincolo.4 confonde '
  'b²con b; uno e tre non danno il momento 4 N·m richiesto. Il vincolo seleziona prove, non impone una forza '
  'che varia lungo uno spostamento della stessa leva.',
  'Sostituisci R nel bilancio dei momenti con le unità esplicite e poi scegli la radice.')]
CHOICES={2:0,3:0,4:0,7:0,9:0,10:0,15:2}
UNITS={1:"N",5:"N",6:"m",8:"N",12:"N",14:"N",16:"m"}
FIGURES={1:"Leva orizzontale ideale senza peso,bracci a=b=2m con scala80px/m;F=R=2N entrambe verso il basso su lati opposti. Scala comune delle forze30px/N:due frecce60px e reazione4N verso l’alto lunga120px nel terzo pannello di proiezioni separate. Il secondo pannello orienta i momenti antiorari positivi:+4e−4N·m. La reazione del fulcro ha braccio nullo e non entra nei momenti,ma è necessaria per l’equilibrio delle forze."}
def assemble(repo,source_ref):
 return assemble_family(repo,source_ref,"lever-equilibrium",TASKS,CHOICES,UNITS,"lever-equilibrium-progressive.svg",FIGURES,6300,unit="u2",source_path="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json",skill="C1-L010",prerequisites=["C1-L001","C1-L002","C1-L005","C1-L010"],section="Centro di massa e leve",coverage=["Equilibrio di momenti e forze","Bracci perpendicolari","Rigidità e inverse"])
if __name__=="__main__":write_family(assemble,"lever-equilibrium-063")
