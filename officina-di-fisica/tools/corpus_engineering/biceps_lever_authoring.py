"""Author-only biomechanical idealization: elbow moments with explicit force arms."""
from .vector_geometry_authoring import assemble_family, write_family
TASKS=[('Un braccio muscolare corto richiede molta forza',
  'Un avambraccio è modellato come asta rigida orizzontale senza peso, ferma nel riferimento inerziale. Il '
  'gomito è una cerniera ideale che esercita una reazione ma nessuna coppia. Il carico esercita W=10 N verso '
  'il basso a distanza L=30 cm dal gomito. Una forza muscolare verticale verso l’alto ha braccio '
  'perpendicolare b=5 cm, con 0<b<L. Quanto vale il suo modulo F, in N?',
  60,
  'Calcoliamo i momenti rispetto al gomito: la reazione non contribuisce perché la sua retta passa per il '
  'fulcro. Il momento muscolare deve opporsi a quello del carico, quindi Fb=WL. I due bracci vanno espressi '
  'nella stessa unità: 30/5=6, rapporto che richiede una forza sei volte il carico.',
  'L=30\\,\\mathrm{cm}=\\frac3{10}\\,\\mathrm m\\qquad b=5\\,\\mathrm{cm}=\\frac1{20}\\,\\mathrm m\\qquad '
  'Fb=WL\\qquad F=W\\frac Lb\\qquad L/b=6\\qquad F=60\\,\\mathrm N',
  'Sessanta newton è maggiore di 10 N perché il braccio muscolare è più corto di quello del carico. '
  'ImporreF=W equilibra soltanto due moduli di forze, non i loro momenti. La reazione del gomito completa il '
  'bilancio delle forze e non può correggere un momento sbagliato; qui vale 50 N verso il basso nel modello '
  'verticale scelto.',
  'Confronta i momenti sul gomito e converti entrambi i bracci in unità coerenti.'),
 ('La forza del muscolo non è una massa',
  'Nel modello statico ideale dell’avambraccio la forza muscolare F equilibra il momento di un caricoW. Si '
  'ha F=WL/b, conL, b bracci perpendicolari in metri eW forza in newton. Quale unità SI haF?',
  ['kg', 'N·m', 'N', 'm', '1'],
  'Il rapporto fra i due bracci è puro. La forza del carico moltiplicata per questo rapporto resta una '
  'forza, espressa in newton. La letteraW in questo problema indica il modulo del carico, non watt o lavoro.',
  '[L/b]=1\\qquad [F]=[W]=ML/T^2\\qquad F\\text{ in }\\mathrm N',
  'kg misura massa; N·m misura un momento prima di dividere perb; m una lunghezza. Il risultato non è puro: '
  'il rapporto delle distanze scala una forza, non la cancella.',
  'Cancella i metri fraL e b e conserva i newton del carico.'),
 ('La legge viene dai momenti opposti',
  'Un avambraccio ideale rigido orizzontale senza peso è fermo su cerniera al gomito senza coppia. Il '
  'caricoW>0 agisce verso il basso con braccio L=3/10 m. La forza muscolare verticale verso l’alto ha '
  'moduloF e braccio perpendicolare 0<b<L. Quale relazione dàF?',
  ['F=Wb/L', 'F=WL/b', 'F=W', 'F=2 WL/b', 'F=WL/(2 b)'],
  'Con momenti antiorari positivi, il muscolo produce+Fb e il carico−WL. Imporre somma zero e dividere '
  'perb>0 dàF=WL/b. Il braccio più piccolo rendeF maggiore diW: è uno svantaggio di forza della leva '
  'idealizzata, non un errore di somma delle forze.',
  '\\sum M_O=Fb-WL=0\\qquad Fb=WL\\qquad F=\\frac{WL}{b}\\qquad 0<b<L\\quad\\Rightarrow\\quad F>W',
  'Wb/L inverte il rapporto e darebbeF<W, incompatibile coi momenti assegnati. F=W varrebbe solo per bracci '
  'uguali, esclusi. I fattori due extra non provengono dal modello. L’avambraccio reale può avere altre '
  'forze e geometrie: qui il modello e i suoi bracci sono dichiarati.',
  'La cerniera non dà momento e il muscolo deve compensare l’intero momento del carico.'),
 ('Carico doppio, stesso braccio muscolare',
  'Nel modello ideale statico dell’avambraccio orizzontale senza peso, L=3/10 m e b=1/20 m restano fissi. '
  'Muscolo verticale e carico producono momenti opposti, la cerniera del gomito non esercita coppia. Il '
  'caricoW passa da 10 a 20 N. Come cambiaF?',
  ['Da 60 a 120 N', 'Resta 60 N', 'Da 60 a 240 N', 'Da 60 a 30 N', 'Diventa zero'],
  'Il rapportoL/b resta sei e moltiplica entrambe le forze del carico. RaddoppiareW raddoppia il momento '
  'resistente e richiede una forza muscolare doppia: 60 diventa 120 N. Non si sta cambiando il braccio o '
  'descrivendo un moto accelerato.',
  'L/b=6\\qquad F_A=6\\cdot10\\,\\mathrm N=60\\,\\mathrm N\\qquad F_B=6\\cdot20\\,\\mathrm N=120\\,\\mathrm '
  'N',
  '240 N introdurrebbe anche un braccio muscolare dimezzato; 30 N invertirebbe la dipendenza daW. La '
  'reazione della cerniera può cambiare, ma non sostituisce il momento muscolare richiesto perché agisce nel '
  'fulcro.',
  'Mantieni uguale il rapporto dei bracci e segui il carico.'),
 ('Il carico dalla forza muscolare',
  'Un avambraccio ideale orizzontale senza peso è fermo su cerniera al gomito priva di coppia. La forza '
  'muscolare verticale èF=60 N con braccio b=1/20 m; il caricoW verso il basso ha braccio L=3/10 m e momento '
  'opposto. Quanto valeW, in N?',
  10,
  'Dal bilancioFb=WL isoliamo il carico dividendo perL. Il momento muscolare è 60 N per 1/20 m, cioè 3 N·m. '
  'Dividere per 3/10 m dà 10 N: la forza esterna può essere molto minore della forza muscolare quando il suo '
  'braccio è maggiore.',
  'Fb=3\\,\\mathrm{N\\,m}\\qquad W=\\frac{Fb}{L}\\qquad W=\\frac{3\\,\\mathrm{N\\,m}}{(3/10)\\,\\mathrm '
  'm}=10\\,\\mathrm N',
  'Sessanta newton ripeterebbeF e perderebbe il rapporto dei bracci. Moltiplicare perL/b anziché perb/L '
  'darebbe 360 N e fallirebbe i momenti. Il datoW è già una forza: non si divide per g a meno di voler '
  'ricostruire un’ulteriore massa non richiesta.',
  'Ricostruisci il momento muscolare e dividilo per il braccio del carico.'),
 ('Ricostruire il piccolo braccio',
  'Nel modello ideale di avambraccio orizzontale fermo e senza peso, la cerniera del gomito non dà coppia. '
  'Un caricoW=10 N ha braccio L=3/10 m; la forza muscolare verticaleF=60 N dà il momento opposto. Quanto '
  'vale il suo braccio perpendicolare b, con 0<b<L?',
  ['1/20 m', '1/10 m', '3/10 m', '1/40 m', '3/20 m'],
  'Il momento del carico è 3 N·m. Per produrlo con 60 N basta un braccio 3/60 m=1/20 m. È 5 cm, strettamente '
  'minore diL=30 cm, come richiede il dominio geometrico dichiarato.',
  'WL=3\\,\\mathrm{N\\,m}\\qquad b=\\frac{WL}{F}\\qquad b=\\frac3{60}\\,\\mathrm m=\\frac1{20}\\,\\mathrm '
  'm\\qquad b=5\\,\\mathrm{cm}',
  '1/10 e 3/20 m darebbero momenti 6 e 9 N·m; 1/40 m darebbe 3/2 N·m.3/10 m renderebbe i bracci uguali e '
  'richiederebbeF=W, non 60 N contro 10 N. La soluzione non è la lunghezza totale dell’avambraccio.',
  'Dividi il momento resistente perF e controlla il limite b<L.'),
 ('Un braccio più favorevole riduceF',
  'Due equilibri del modello ideale di avambraccio orizzontale senza peso hanno L=3/10 m e caricoW=10 N. La '
  'cerniera non dà coppia; la forza muscolare produce il momento opposto. Il braccio muscolare passa da '
  'b_A=1/20 m a b_B=1/10 m. Quanto valeF_B/F_A?',
  ['1/2', '2', '1/4', '1', '−1/2'],
  'Il momento resistente resta 3 N·m. Il braccio muscolare raddoppia, quindi per lo stesso momento la forza '
  'si dimezza: da 60 a 30 N. Entrambi i bracci sono minori di 3/10 m e continuano a dare una forza muscolare '
  'maggiore del carico.',
  'F_A=60\\,\\mathrm N\\qquad F_B=\\frac{3\\,\\mathrm{N\\,m}}{(1/10)\\,\\mathrm m}=30\\,\\mathrm N\\qquad '
  'F_B/F_A=\\frac12',
  'Due seguirebbe il braccio direttamente anziché al denominatore; un quarto introdurrebbe un quadrato; uno '
  'ignora il cambiamento. Il rapporto negativo è escluso per moduli positivi e non descrive una scelta '
  'opposta della convenzione dei momenti.',
  'Mantieni fissoWL e confronta due divisioni perb.'),
 ('La reazione non salva una proposta di momento errata',
  'Nel modello ideale statico dell’avambraccio orizzontale senza peso, W=10 N ha braccio L=3/10 m. Il '
  'muscolo verticale ha braccio b=1/20 m e momento opposto; la cerniera non esercita coppia. Si proponeF=120 '
  'N. Quanto vale proposto meno corretto, in N?',
  60,
  'Il carico dà 3 N·m; il muscolo deve dare altrettanto e quindiF=3/(1/20)=60 N. La proposta 120 N darebbe '
  'invece 6 N·m. La sua sovrastima nell’ordine assegnato è 120−60=+60 N.',
  'F=WL/b=60\\,\\mathrm N\\qquad e=120\\,\\mathrm N-60\\,\\mathrm N=60\\,\\mathrm N',
  '−60 N invertirebbe la sottrazione; 120 N ripete la proposta; 30 N dimezza lo scarto. Una reazione nel '
  'gomito non può annullare i 3 N·m residui della proposta, perché ha braccio nullo.61 e 59 non sono errori '
  'di arrotondamento ammessi: il calcolo è esatto.',
  'Controlla primaFb=WL e poi forma l’errore della forza proposta.'),
 ('IsolareW mantenendoL come lunghezza',
  'Il modello ideale statico dell’avambraccio ha caricoW>0 con braccio L=3/10 m e forza muscolareF>0 con '
  'braccio perpendicolare 0<b<L. I momenti sono opposti e la cerniera non dà coppia. Quale formula isolaW '
  'daFb=WL?',
  ['W=Fb/L', 'W=FL/b', 'W=F/(Lb)', 'W=2 Fb/L', 'W=Fb/(2 L)'],
  'Dividiamo perL, lunghezza positiva. Il rapporto b/L è puro, quindiF moltiplicata per quel rapporto dà una '
  'forza. Il valore numerico 3/10 non va separato dalla sua unità come seL fosse un numero puro.',
  'Fb=WL\\qquad W=\\frac{Fb}{L}\\qquad 0<b<L\\quad\\Rightarrow\\quad 0<W<F',
  'FL/b inverte il vantaggio dei bracci; F/(Lb) ha dimensioni errate. Il doppio e la metà non soddisfano lo '
  'stesso bilancio. L’inversa corretta conservaW<F nel dominio, un controllo fisico oltre a quello algebrico.',
  'Dividi per il braccio del carico, non per quello del muscolo.'),
 ('Scalare il carico e il braccio muscolare',
  'Fra due equilibri dell’avambraccio ideale senza peso si hanno W_B=κ₁W_A e b_B=κ₂b_A, con fattori '
  'positivi. L=3/10 m resta fisso e 0<b_A, b_B<L. I momenti sono opposti e la cerniera non dà coppia. Quanto '
  'valeF_B/F_A?',
  ['κ₁ / κ₂', 'κ₁ κ₂', 'κ₂ / κ₁', 'κ₁² / κ₂', 'κ₁ + κ₂'],
  'La forza muscolare èWL/b. La scalatura del carico entra al numeratore e quella del braccio al '
  'denominatore; L si cancella nel rapporto. La geometria deve restare nel dominio: κ₂ non può '
  'portareb_BoltreLsenza cambiare le ipotesi.',
  'F_A=W_AL/b_A\\qquad F_B=\\frac{\\kappa_1W_AL}{\\kappa_2b_A}\\qquad F_B/F_A=\\frac{\\kappa_1}{\\kappa_2}',
  'Il prodotto attribuisce al braccio muscolare l’effetto sbagliato; il reciproco inverte il confronto; il '
  'quadrato conta il carico due volte. La somma non vale uno quando i due fattori sono entrambi uno. Fattori '
  'uguali mantengonoF, ma cambiano separatamente carico e reazione.',
  'SegueW direttamente e b inversamente, sempre entro 0<b<L.'),
 ('Tre volte il carico e due volte il braccio',
  'Nel modello ideale statico dell’avambraccio, L=3/10 m, asta senza peso e cerniera senza coppia. A: W=10 '
  'N, b=1/20 m. B: W=30 N, b=1/10 m. Le forze muscolari producono momenti opposti al carico. Quanto '
  'valeF_B/F_A?',
  ['3/2', '2/3', '3', '2', '6'],
  'A richiede 60 N. B ha momento resistente 9 N·m e braccio muscolare 1/10 m, quindiF_B=90 N. Il rapporto '
  '90/60 si semplifica a 3/2: il triplo del carico è in parte compensato dal doppio del braccio.',
  'F_A=60\\,\\mathrm N\\qquad F_B=90\\,\\mathrm N\\qquad F_B/F_A=\\frac{90}{60}=\\frac32',
  'Tre considera soltantoW; due soltanto il braccio nel verso sbagliato; sei moltiplica invece di dividere i '
  'fattori; 2/3 è il reciproco. Entrambe le forze restano maggiori del rispettivo carico perché entrambi i '
  'bracci muscolari sono minori diL.',
  'Calcola il momento resistente diB e poi dividi per il nuovo braccio.'),
 ('La media di due forze muscolari',
  'Due equilibri del modello ideale di avambraccio senza peso hannoL=3/10 m e cerniera senza coppia. A: W=10 '
  'N, b=1/20 m. B: W=30 N, b=1/10 m. Le forze hanno momenti opposti. Qual è la media aritmetica diF_A, F_B '
  'con uguale peso, in N?',
  75,
  'Le forze muscolari sono 60 e 90 N. La loro semisomma è 75 N. Si mediano due uscite di prove distinte, non '
  'si costruisce un avambraccio con gli ingressi medi prima della divisione perb.',
  'F_A=60\\,\\mathrm N\\qquad F_B=90\\,\\mathrm N\\qquad \\overline F=\\frac{60+90}{2}\\,\\mathrm '
  'N=75\\,\\mathrm N',
  '150 N è la somma; 75/2 N divide due volte; 30 N è la differenza. Gli ingressi mediW=20 N, b=3/40 m '
  'darebbero 80 N, non 75 N. I valori 74 e 76 non sono arrotondamenti necessari: la semisomma è esatta.',
  'Trova ciascuna forza con il suo braccio e poi fai la semisomma.'),
 ('Il braccio per una forza obiettivo',
  'L’avambraccio ideale statico haL=3/10 m, nessun peso proprio e cerniera senza coppia. A: W_A=10 N, '
  'b_A=1/20 m. InB si sceglieW_B=30 N e si vuoleF_B=(3/2)F_A, con momenti opposti e 0<b_B<L. Quanto '
  'valeb_B/b_A?',
  2,
  'F_A è 60 N e l’obiettivo è 90 N. Il nuovo momento resistente è 30 N per 3/10 m, cioè 9 N·m. Da '
  'b_B=W_BL/F_B si ottiene 9/90 m=1/10 m. Confrontarlo con 1/20 m dà un fattore due.',
  'F_B=90\\,\\mathrm N\\qquad W_BL=9\\,\\mathrm{N\\,m}\\qquad b_B=\\frac9{90}\\,\\mathrm '
  'm=\\frac1{10}\\,\\mathrm m\\qquad b_B/b_A=2',
  'Lasciare b invariato richiederebbe 180 N, non 90 N. Triplicarlo manterrebbeF_A=60 N. Il valore 1/10 m '
  'rispetta il limite 3/10 m e va distinto dal rapporto puro due.',
  'Trova il braccio dal momento nuovo e dalla forza muscolare desiderata.'),
 ('Un display sulla forza muscolare',
  'Un display continuo adimensionale segueS=cF, c>0, senza offset. Il modello statico ideale '
  'dell’avambraccio haL=3/10 m, peso proprio trascurato, cerniera senza coppia e momenti opposti. Il '
  'riferimentoW=10 N, b=1/20 m dàS=180. Una prova conb=1/10 m dàS=270. Quanto valeW, in N?',
  30,
  'Il riferimento haF=60 N, quindi c=3 N⁻¹. La lettura 270 rappresentaF=90 N. Il carico della prova si '
  'ricostruisce conW=Fb/L: 90 Nper 1/10 m diviso 3/10 m dà 30 N.',
  'c=\\frac{180}{60\\,\\mathrm N}=3\\,\\mathrm{N^{-1}}\\qquad F_B=270/c=90\\,\\mathrm N\\qquad '
  'W_B=F_Bb_B/L\\qquad W_B=30\\,\\mathrm N',
  '270 non è già una forza e 90 N èF_B, nonW_B. La verifica 30 N·3/10 m=90 N·1/10 m eS=3·90=270 restituisce '
  'entrambi i dati. Usare il rapporto inverso dei bracci produrrebbe un carico maggiore della forza '
  'muscolare, incompatibile col dominio.',
  'DecodificaF e poi usa il rapporto b/L per risalire al carico.'),
 ('Offset e carico esterno',
  'Un display continuo adimensionale segueS=cF+a, c>0, a costanti. Il modello statico ideale '
  'dell’avambraccio haL=3/10 m, nessun peso proprio, cerniera senza coppia e momenti opposti. A: W=10 N, '
  'b=1/20 m, S=121. B: W=30 N, b=1/10 m, S=181. C: b=1/20 m, S=241. Quanto valeW_C?',
  ['10 N', '19 N', '20 N', '21 N', '40 N'],
  'Le forze muscolari note sono 60 e 90 N. La differenza 60 delle letture su 30 N dà c=2 N⁻¹; l’offset dal '
  'primo riferimento è 1. C contieneF_C=120 N. Con b_C/L=(1/20)/(3/10)=1/6, il carico vale 120/6=20 N.',
  'c=2\\,\\mathrm{N^{-1}}\\qquad a=1\\qquad F_C=(241-1)/c=120\\,\\mathrm N\\qquad W_C=F_Cb_C/L=20\\,\\mathrm '
  'N',
  'Con lo stesso braccioC, le alternativeW=10, 19, 21, 40 N darebbero letture 121, 229, 253, 481. Solo 20 '
  'Nrestituisce 241. L’offset non si elimina con un semplice rapporto delle letture: va sottratto prima di '
  'dividere per il guadagno.',
  'Calibra sulle due forze muscolari e applica solo dopo l’inversa del carico.'),
 ('Una misura che non sceglie un braccio unico',
  'Fra equilibri diversi del modello ideale di avambraccio senza peso si imponeW=(200 N/m)b, con 0<b<L=3/10 '
  'm. La forza muscolare dà momento opposto al carico e la cerniera non dà coppia. Si misuraF=60 N. Quante '
  'coppie positive(W, b) soddisfano tutti i dati?',
  ['Nessuna', 'Una', 'Due', 'Tre', 'Infinite'],
  'Sostituiamo il vincolo nella leggeF=WL/b. Il braccio positivo si cancella e rimaneF=(200 N/m)L=60 N, '
  'indipendente dal valore dib entro l’intervallo consentito. La misura è coerente, ma non aggiunge una '
  'seconda informazione indipendente capace di fissare il braccio.',
  'c=200\\,\\mathrm{N/m}\\qquad W=cb\\qquad F=cbL/b\\qquad F=cL=60\\,\\mathrm N\\qquad '
  '0<b<\\frac3{10}\\,\\mathrm m',
  'Per esempio b=1/20 m, W=10 N e b=1/10 m, W=20 N sono due coppie, ma ogni altro b nell’intervallo aperto '
  'dà una nuova soluzione. Sono quindi infinite. Il valoreb=0 è escluso e non si deve annullare ancheW; il '
  'bordo b=L non appartiene al dominio. In tutte le coppie ammesseW<60 N=F, come richiede il braccio corto.',
  'Sostituisci il vincolo e verifica se la misura fissa davvero una scala indipendente.')]
CHOICES={2:2,3:1,4:0,6:0,7:0,9:0,10:0,11:0,15:2,16:4}
UNITS={1:"N",5:"N",8:"N",12:"N",14:"N"}
FIGURES={1: 'Modello biomeccanico ideale, non disegno anatomico: avambraccio rigido orizzontale senza peso, forza '
    'muscolare verticale su braccio 5 cm e carico 10 N su 30 cm. Geometria 1000 px/m: 50 e 300 px; forze 2 '
    'px/N: muscolo 60 N lungo 120 px e carico 10 N lungo 20 px. Reazione del gomito mostrata in proiezioni '
    'separate, 50 N verso il basso lunga 100 px alla stessa scala. I due momenti valgono±3 N·m; la cerniera '
    'non esercita coppia.'}

def assemble(repo,source_ref):
 return assemble_family(repo,source_ref,"biceps-lever",TASKS,CHOICES,UNITS,"biceps-lever-progressive.svg",FIGURES,6400,unit="u2",source_path="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json",skill="C1-L010",prerequisites=["C1-L001","C1-L002","C1-L005","C1-L010"],section="Centro di massa e leve",coverage=["Modello ideale dell’avambraccio","Momenti e bracci muscolari","Inverse e identificabilità"])
if __name__=="__main__":write_family(assemble,"biceps-lever-064")
