"""Author-only torque modulus and oriented rotation, with perpendicular arms."""
from .vector_geometry_authoring import assemble_family, write_family
TASKS=[('Il braccio moltiplica la forza',
  'Nel piano un’asta rigida ha un punto di applicazione a distanza r=2 m dal fulcro O. Una forza di modulo '
  'F=2 N è perpendicolare all’asta. Quanto vale il modulo M del momento di questa forza rispetto aO, in N·m?',
  4,
  'Il modulo del prodotto vettoriale è rF sinθ. Con forza perpendicolare, r è anche la distanza '
  'perpendicolare fra il fulcro e la retta d’azione e sin 90°=1. Il prodotto 2 m per 2 N dà 4 N·m. Il verso '
  'di rotazione richiederebbe anche indicare da quale parte punta la forza: qui si domanda soltanto il '
  'modulo.',
  'M=rF\\sin90^\\circ\\qquad M=Fr\\qquad M=(2\\,\\mathrm N)(2\\,\\mathrm m)=4\\,\\mathrm{N\\,m}',
  'Un momento non è il modulo della forza: la distanza conta.4 N·m ha le stesse dimensioni di un’energia, ma '
  'descrive una tendenza alla rotazione, non un lavoro già compiuto. Per conoscere l’accelerazione angolare '
  'servirebbero il momento totale e il momento d’inerzia.',
  'La distanza assegnata è un braccio perché la forza è perpendicolare.'),
 ('La convenzione d’unità del momento',
  'Una forza perpendicolare di modulo F agisce con braccio r. Il modulo del suo momento è M=Fr. Quale unità '
  'SI fra quelle proposte esprime M?',
  ['N', 'N/m', 'N·m', 'kg', 'm'],
  'Moltiplichiamo newton per metri. Il momento ha dimensioni ML²/T², uguali dimensionalmente a quelle del '
  'lavoro, ma normalmente si scrive N·m per conservare visibile il significato meccanico diverso. Non si '
  'deve affermare che abbia dimensioni differenti dall’energia.',
  '[M]=[F][r]\\qquad [M]=ML^2/T^2\\qquad M\\text{ in }\\mathrm{N\\,m}',
  'N è solo forza, N/m una rigidezza, kg massa, m lunghezza. In questa lista non c’è un’altra unità '
  'dimensionalmente equivalente aN·m. Un braccio non è un divisore della forza: entra come fattore.',
  'Moltiplica l’unità della forza per quella del braccio, poi distingui grandezza e dimensione.'),
 ('La retta d’azione attraversa il fulcro',
  'Una forza di modulo 8 N è applicata a un corpo rigido. La sua retta d’azione passa per il fulcro O '
  'scelto, anche se il punto di applicazione può essere diverso daO. Quanto vale il modulo del momento di '
  'questa forza rispetto aO?',
  ['0 N·m', '2 N·m', '4 N·m', '8 N·m', '16 N·m'],
  'Conta la distanza perpendicolare b fraO e la retta d’azione. Se la retta contiene il fulcro, questa '
  'distanza è zero. Di conseguenza il momento è nullo anche quando la forza è intensa e il punto in cui è '
  'applicata non coincide conO.',
  'M=Fb\\qquad b=0\\qquad M=(8\\,\\mathrm N)\\cdot0=0\\,\\mathrm{N\\,m}',
  'Le altre opzioni attribuiscono un braccio non nullo che qui non esiste. Copiare il numero 8 della forza '
  'come 8 N·m aggiungerebbe una lunghezza arbitraria. Momento nullo rispetto aO non significa forza nulla né '
  'risultante totale nulla: si sta controllando un effetto rotazionale rispetto a un punto.',
  'Misura il braccio fino alla retta d’azione, non soltanto fino al punto di applicazione.'),
 ('Forza doppia allo stesso braccio',
  'Due configurazioni di un’asta rigida hanno lo stesso braccio r=2 m e una forza perpendicolare. Il suo '
  'modulo passa daF_A=2 N aF_B=4 N. Come cambia il modulo M del momento rispetto al medesimo fulcro?',
  ['Da 4 a 8 N·m', 'Resta 4 N·m', 'Da 4 a 16 N·m', 'Da 4 a 2 N·m', 'Diventa zero'],
  'La geometria non cambia e il braccio resta due metri. Il modulo del momento è direttamente proporzionale '
  'alla forza: si passa da 4 a 8 N·m. Non occorre conoscere la rotazione effettivamente prodotta per '
  'calcolare questi momenti della forza assegnata.',
  'M_A=4\\,\\mathrm{N\\,m}\\qquad M_B=(4\\,\\mathrm N)(2\\,\\mathrm m)=8\\,\\mathrm{N\\,m}\\qquad M_B/M_A=2',
  '16 N·m raddoppierebbe anche il braccio; 2 N·m invertirebbe la dipendenza daF; zero ignorerebbe il braccio '
  'positivo perpendicolare. Il modulo resta positivo indipendentemente dalla convenzione sul verso di '
  'rotazione.',
  'Tieni fisso r e segui soltanto la forza.'),
 ('La forza da un momento noto',
  'Una forza perpendicolare all’asta produce un momento di modulo M=4 N·m rispetto al fulcro. Il braccio è '
  'r=2 m. Quanto vale F>0, in N?',
  2,
  'La relazione dei moduli è M=Fr. Dividiamo per il braccio positivo, due metri. I metri si semplificano e '
  'restano newton: 4 N·m su 2 m dà 2 N.',
  'F=\\frac Mr\\qquad F=\\frac{4\\,\\mathrm{N\\,m}}{2\\,\\mathrm m}=2\\,\\mathrm N',
  'Moltiplicare ancora perr non isolaF e aggiunge un metro invece di eliminarlo.4 è il numero del momento, '
  'non quello della forza senza conversione. Il controllo 2 N·2 m=4 N·m ricostruisce il dato.',
  'Dividi il momento per la distanza perpendicolare non nulla.'),
 ('Quale distanza dal fulcro?',
  'Una forza di modulo F=2 N, perpendicolare a un’asta rigida, ha momento di modulo M=4 N·m rispetto al '
  'fulcro. Quanto vale la distanza r del punto di applicazione dal fulcro, in m?',
  2,
  'Per la perpendicolarità dichiarata, la distanza r coincide con il braccio. Isoliamo r=M/F e dividiamo 4 '
  'N·m per 2 N. Il risultato 2 m è una lunghezza, non un angolo o una forza.',
  'r=\\frac MF\\qquad r=\\frac{4\\,\\mathrm{N\\,m}}{2\\,\\mathrm N}=2\\,\\mathrm m',
  'L’inversa richiedeF>0. Se la forza fosse obliqua e non si conoscesse l’angolo, il rapportoM/F darebbe il '
  'braccio perpendicolare, non necessariamente la distanza al punto di applicazione. Qui le due lunghezze '
  'coincidono per ipotesi.',
  'Usa la geometria per sapere quale lunghezza stai ricostruendo.'),
 ('Una forza più lontana dal fulcro',
  'La stessa forza di modulo 2 N agisce perpendicolarmente a un’asta. A ha braccio r_A=2 m, B ha r_B=4 m '
  'rispetto allo stesso fulcro. Quanto vale M_B/M_A per i moduli dei momenti?',
  ['2', '1/2', '4', '1', '−2'],
  'Con forza uguale, il rapporto dei momenti è quello dei bracci. I moduli passano da 4 a 8 N·m e il '
  'rapporto è due. La distanza maggiore aumenta il momento della stessa forza, senza implicare da sola un '
  'equilibrio o una rotazione determinata.',
  'M_A=4\\,\\mathrm{N\\,m}\\qquad M_B=8\\,\\mathrm{N\\,m}\\qquad M_B/M_A=2',
  'Un mezzo inverte l’ordine; quattro introdurrebbe un quadrato di r; uno ignora la geometria nuova.−2 non '
  'può essere il rapporto di due moduli positivi; un segno di momento orientato richiederebbe una '
  'convenzione ulteriore.',
  'Semplifica la forza comune e confronta i bracci.'),
 ('Una proposta doppia sul momento',
  'Una forza perpendicolare F=2 N agisce con braccio r=2 m rispetto al fulcro. Si propone M_proposto=8 N·m '
  'per il modulo del momento. Quanto vale proposto meno corretto, in N·m?',
  4,
  'Il momento corretto è 2·2=4 N·m. La proposta è doppia e lo scarto nell’ordine assegnato è 8−4=+4 N·m. Il '
  'segno positivo è quello dell’errore, non un’indicazione di rotazione antioraria della forza.',
  'M=Fr=4\\,\\mathrm{N\\,m}\\qquad e=8\\,\\mathrm{N\\,m}-4\\,\\mathrm{N\\,m}\\qquad e=4\\,\\mathrm{N\\,m}',
  '−4 invertirebbe la sottrazione; 8 ripete la proposta; 2 dimezza ancora; 5 o 3 non derivano dal prodotto '
  'esatto. Non si deve chiamare questo 4 J di lavoro: non è stato assegnato alcuno spostamento angolare.',
  'Calcola Fr, poi rispetta l’ordine proposto meno corretto.'),
 ('L’inversa del modulo di momento',
  'Per una forza perpendicolare al segmento che unisce il fulcro al punto di applicazione vale M=Fr, con M, '
  'F, r>0. Quale formula isola F?',
  ['F=Mr', 'F=r/M', 'F=M/r', 'F=2 M/r', 'F=M/(2 r)'],
  'Dividiamo entrambi i membri per r. Il risultato ha unità N·m/m=N e resta positivo. La perpendicolarità '
  'evita un ulteriore fattore seno; non compare nessun mezzo geometrico.',
  'M=Fr\\qquad M/r=F\\qquad F=M/r',
  'Mr ha un metro di troppo; r/M è un inverso di forza. Il doppio e la metà non restituisconoM quando si '
  'reinseriscono inFr. Il denominatore non nullo è parte delle ipotesi, non una formalità.',
  'Elimina il fattore r dividendo per il braccio positivo.'),
 ('Scalare forza e braccio',
  'Fra due configurazioni di un’asta rigida si passa daF, r>0 aF_B=κ₁F e r_B=κ₂r, con fattori positivi. Le '
  'forze sono perpendicolari alle rispettive aste eM indica il modulo del momento rispetto al rispettivo '
  'fulcro. Quanto vale M_B/M_A?',
  ['κ₁ κ₂', 'κ₁ / κ₂', 'κ₂ / κ₁', 'κ₁ + κ₂', 'κ₁ κ₂²'],
  'Nel prodottoFr entrano entrambi i fattori di scala. Dividendo per il prodotto iniziale si cancellanoF e '
  'r. Se cambiassero anche gli angoli, servirebbe il rapporto dei seni; qui entrambi valgono uno.',
  'M_A=Fr\\qquad M_B=(\\kappa_1F)(\\kappa_2r)\\qquad M_B/M_A=\\kappa_1\\kappa_2',
  'I quozienti invertono una dipendenza; la somma darebbe due all’identità; κ₁κ₂² farebbe dipendere il '
  'momento dal quadrato del braccio. Non vanno importate qui formule del momento d’inerzia, che è una '
  'grandezza diversa.',
  'Confronta i prodotti completi e ricorda che tutti gli angoli restano retti.'),
 ('Due raddoppi nel momento',
  'A usa forza perpendicolare F_A=2 N e braccio r_A=2 m. B usa F_B=4 N e r_B=4 m. Quanto vale il rapporto '
  'M_B/M_A fra i moduli dei momenti delle forze?',
  4,
  'Il primo momento vale 4 N·m, il secondo 16 N·m. Il raddoppio della forza e quello del braccio producono '
  'un rapporto quattro. Il numero sedici è il momentoB e va ancora diviso per 4 per rispondere con un numero '
  'puro.',
  'M_A=4\\,\\mathrm{N\\,m}\\qquad M_B=16\\,\\mathrm{N\\,m}\\qquad M_B/M_A=4',
  'Due tiene conto di un solo cambiamento; un quarto è l’inverso; otto attribuisce un quadrato al braccio in '
  'più. Le unitàN·m si cancellano fra i due moduli.',
  'Moltiplica i due fattori due o calcola separatamente i momenti.'),
 ('Media di moduli di momento',
  'Due configurazioni hanno A: F=2 N, r=2 m eB: F=4 N, r=4 m, sempre con forza perpendicolare. Qual è la '
  'media aritmetica dei moduli M_A, M_B, con uguale peso, in N·m?',
  10,
  'I moduli sono 4 e 16 N·m: la loro semisomma è 10 N·m. Si fa una media di intensità in prove distinte, non '
  'una somma orientata di momenti agenti insieme su un corpo. I segni di rotazione non sono richiesti per '
  'questi moduli.',
  'M_A=4\\,\\mathrm{N\\,m}\\qquad M_B=16\\,\\mathrm{N\\,m}\\qquad \\overline '
  'M=\\frac{4+16}{2}\\,\\mathrm{N\\,m}\\qquad \\overline M=10\\,\\mathrm{N\\,m}',
  '20 è la somma; 5 divide ancora per due. Gli ingressi medi 3 N e 3 m darebbero 9 N·m, non 10; 11 non è la '
  'semisomma. Questa media non determina il momento risultante di un esperimento che non è stato descritto.',
  'Trova i due moduli con le loro coppie di dati e poi assegna uguale peso.'),
 ('Il braccio per un obiettivo quadruplo',
  'A ha forza perpendicolare F_A=2 N e braccio r_A=2 m. InB si sceglieF_B=4 N e si vuoleM_B=4 M_A, sempre '
  'perpendicolare. Quanto vale r_B/r_A?',
  2,
  'Il primo momento è 4 N·m e l’obiettivo 16 N·m. Dividendo per la forza nuova 4 N si ottiene r_B=4 m. Il '
  'rapporto con 2 m è due: la forza doppia ha già fornito un fattore due dell’obiettivo quattro.',
  'M_B=16\\,\\mathrm{N\\,m}\\qquad r_B=M_B/F_B=4\\,\\mathrm m\\qquad r_B/r_A=2',
  'Quadruplicare anche il braccio produrrebbe un momento otto volte maggiore; lasciarlo invariato darebbe '
  'soltanto il doppio. Quattro metri è il nuovo braccio e non il rapporto richiesto.',
  'Dividi il momento obiettivo per la forza nuova, poi confronta i bracci.'),
 ('La taratura precede la divisione per r',
  'Un display continuo adimensionale segueS=cM, con c>0, offset nullo. Ogni forza è perpendicolare al '
  'proprio braccio. Il riferimento F=2 N, r=2 m dàS=12. Una prova con r=4 m dàS=48. Quanto valeF in N?',
  4,
  'Il riferimento ha momento 4 N·m, dunque c=3(N·m)⁻¹. La lettura 48 corrisponde a 16 N·m. Per ricostruire '
  'la forza della prova dividiamo questo momento per 4 m, ottenendo 4 N.',
  'M_A=4\\,\\mathrm{N\\,m}\\qquad c=3\\,\\mathrm{(N\\,m)^{-1}}\\qquad M_B=48/c=16\\,\\mathrm{N\\,m}\\qquad '
  'F_B=M_B/r_B=4\\,\\mathrm N',
  '48 non è già un momento inN·m: usarlo così darebbe 12 N, includendo il guadagno spurio tre. Il controllo '
  '4 N·4 m=16 N·m e cM=48 ricostruisce il dato del display.',
  'Togli il guadagno e solo dopo usa l’inversa rispetto alla forza.'),
 ('Due riferimenti con un offset',
  'Un display continuo adimensionale segueS=cM+a, con c>0, a costanti. Le forze sono perpendicolari ai '
  'bracci. A: F=2 N, r=2 m, S=9. B: F=4 N, r=4 m, S=33. C: r=2 m, S=17. Quanto valeF_C?',
  ['2 N', '3 N', '4 N', '5 N', '8 N'],
  'I momenti di riferimento sono 4 e 16 N·m. La differenza 24 di lettura su 12 N·m dà guadagno 2(N·m)⁻¹; '
  'l’offset è uno. C rappresenta 8 N·m e richiede una forza 4 N sul braccio 2 m.',
  'c=2\\,\\mathrm{(N\\,m)^{-1}}\\qquad a=1\\qquad M_C=(17-1)/c=8\\,\\mathrm{N\\,m}\\qquad '
  'F_C=M_C/r_C=4\\,\\mathrm N',
  'Le forze 2, 3, 5, 8 Nsu 2 m produrrebbero letture 9, 13, 21, 33. Solo 4 Nrestituisce 17. Un rapporto di '
  'letture con offset non è il rapporto dei momenti: si deve sottrarre a prima di dividere perc.',
  'Ricava i due momenti noti, calibra il display e infine isola F_C.'),
 ('Una forza selezionata dal braccio',
  'Fra configurazioni diverse si seleziona una forza perpendicolare con F=(1 N/m)r, r>0. Il modulo del '
  'momento èM=4 N·m. Quanto vale r, in m? Il vincolo collega le configurazioni scelte e non richiede alcun '
  'lavoro o spostamento durante una prova.',
  2,
  'Il coefficiente a=1 N/m converte il braccio in una forza. SostituendoF=ar nella relazioneM=Fr '
  'compareM=ar². Il rapportoM/a è 4 m² e la radice positiva dà 2 m.',
  'a=1\\,\\mathrm{N/m}\\qquad F=ar\\qquad M=ar^2\\qquad r^2=M/a=4\\,\\mathrm{m^2}\\qquad r_+=2\\,\\mathrm '
  'm\\qquad r_-=-2\\,\\mathrm m',
  'La soluzione fisica 2 m dàF=2 N eM=4 N·m. Il ramo negativo non è un braccio positivo e renderebbe '
  'negativo anche il modulo della forza nel vincolo. Quattro confonde r² conr; uno e tre non riproducono il '
  'momento.',
  'Inserisci il coefficiente dimensionale e scegli la radice dei moduli positivi.')]
CHOICES={2:2,3:0,4:0,7:0,9:2,10:0,15:2}
UNITS={1:"N·m",5:"N",6:"m",8:"N·m",12:"N·m",14:"N",16:"m"}
FIGURES={1:"Nel primo pannello r2m è200px a100px/m eF2N è40px a20px/N,perpendicolare al braccio. Forza verso l’alto a destra diO:il momento orientato è+4N·m con antiorario positivo;il modulo è4N·m. Nel caso separato finale,F8N è160px alla stessa scala20px/N ma la retta d’azione passa perO:braccio perpendicolare zero e momento zero anche con punto di applicazione diverso daO. Le lunghezze fisiche e le forze hanno scale dimensionali distinte.",3:"Il terzo pannello isola il caso della retta d’azione che attraversaO:forza8N,braccio perpendicolare0 e momento0. Il primo pannello è un esempio differente con forza2N perpendicolare a r2m. Scala comune delle forze20px/N,scala delle distanze100px/m;nessuna area energetica è rappresentata."}
def assemble(repo,source_ref):
 return assemble_family(repo,source_ref,"torque-perpendicular",TASKS,CHOICES,UNITS,"torque-perpendicular-progressive.svg",FIGURES,6200,unit="u2",source_path="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json",skill="C1-L010",prerequisites=["C1-L001","C1-L002","C1-L005","C1-L010"],section="Centro di massa e leve",coverage=["Momento e braccio perpendicolare","Modulo e verso di rotazione","Dimensioni e inverse"])
if __name__=="__main__":write_family(assemble,"torque-perpendicular-062")
