from authoring import L,Q,LESSONS,write_lessons
from build_content import dump

L('U2-02',
 'La prima legge dice che risultante nulla implica velocità costante, anche diversa da zero. La seconda usa la somma vettoriale delle forze sul medesimo corpo: ΣF=ma in un riferimento inerziale. Le forze di azione e reazione agiscono su corpi diversi e non si cancellano nel diagramma di un solo corpo. Vicino alla Terra il peso è mg; in generale l’attrazione fra masse segue GmM/r². La normale è perpendicolare al contatto e non è sempre uguale al peso. La tensione segue il filo ideale. L’attrito statico si adatta fino a μsN; quello dinamico ha modulo approssimato μdN e si oppone allo scorrimento relativo. Una molla ideale esercita forza di richiamo −kx: in equilibrio sotto una forza esterna F il modulo dell’allungamento è F/k, purché si resti nel regime elastico. Un equilibrio statico impone accelerazione nulla, non assenza di forze.',
 'Una molla ideale di costante 20 N/m è tirata staticamente con forza 4 N. Qual è l’allungamento?',
 ['Disegna la forza esterna e quella elastica sul corpo.', 'In equilibrio i moduli si uguagliano: kx=F.', 'x=4/20=0,2 m, pari a 20 cm.'],
 'x=0,2 m.',
 Q('Una massa di 2 kg su piano orizzontale ha μs=0,4; g=10 m/s². Una forza orizzontale di 3 N la mette in moto?', 'No; attrito statico 3 N, limite 8 N.', 'N=20 N. La forza richiesta per l’equilibrio è sotto μsN: l’attrito non vale automaticamente 8 N.'),
 Q('Una molla con k=80 N/m è sottoposta a 6 N; poi un corpo di 2 kg subisce risultante 6 N. Trova x e a, distinguendo i modelli.', 'x=0,075 m; a=3 m/s².', 'Hooke descrive l’equilibrio elastico; Newton descrive la variazione di velocità quando la risultante non è nulla.'),
 ['Applicare μsN come forza sempre presente','Cancellare azione e reazione sullo stesso corpo','Porre sempre N=mg'],
 ['Scegli il corpo del diagramma','Distingui risultante e singola forza','Controlla equilibrio e regime elastico'],
 ['Un diagramma delle forze corretto precede l’equazione del moto.','N/m diviso al denominatore restituisce metri per F/k.','F=0 implica x=0 per molla non precaricata; raddoppiare k dimezza x a F fissata.'])

L('U5-01',
 'Un sistema è la porzione che analizziamo; l’ambiente è ciò con cui scambia energia o materia. Lo stato di un gas in equilibrio è descritto da pressione, volume, temperatura e quantità di sostanza. Pressione e temperatura sono intensive; volume e numero di moli sono estensivi. Una funzione di stato dipende dagli estremi, non dal percorso. La temperatura termodinamica si misura in kelvin: T(K)=t(°C)+273,15; gli intervalli hanno la stessa ampiezza ma gli zeri differiscono. Nel modello di gas ideale pV=nRT, con p assoluta in Pa, V in m³, n in mol e T in K. La pressione manometrica non può essere inserita senza aggiungere quella ambiente. A n e T costanti raddoppiare p dimezza V. Il modello non descrive condensazione o interazioni fra molecole di gas reali e richiede uno stato uniforme di equilibrio.',
 'Un campione ideale di 1 mol è a 300 K e pressione assoluta 100000 Pa. Usa R=8,31446261815324 J/(mol K) e trova V.',
 ['Isola il volume: V=nRT/p.', 'Il numeratore vale 1·8,31446261815324·300=2494,338785445972 J.', 'V=2494,338785445972/100000=0,02494338785445972 m³, circa 24,9434 L.'],
 'V=0,02494338785445972 m³.',
 Q('Con n=1 mol e p=100000 Pa la temperatura passa da 300 K a 600 K. Quanto vale il nuovo volume? R=8,31446261815324.', '0,04988677570891944 m³', 'A pressione e moli costanti il volume è proporzionale alla temperatura assoluta, quindi raddoppia.'),
 Q('Un campione di 0,5 mol è a 400 K e 200000 Pa. Trova V con R=8,31446261815324.', '0,00831446261815324 m³', 'nT=200 mol K e nRT=1662,892523630648 J. La divisione per 200000 Pa dà circa 8,31446 L.'),
 ['Usare °C in pV=nRT','Inserire pressione manometrica come assoluta','Confondere m³ e L'],
 ['Riconosci il sistema e lo stato di equilibrio','Converti a kelvin e pressione assoluta','Isola la variabile e verifica la proporzionalità'],
 ['pV=nRT richiede unità coerenti e temperatura assoluta.','J/Pa=m³; a 300 K il campione indicato occupa circa 25 L.','Dimezzare n e raddoppiare T lascia nT costante; raddoppiare p dimezza V.'])

L('U4-01',
 'Un’onda meccanica propaga una perturbazione e trasporta energia attraverso un mezzo; non implica trasporto netto del mezzo lungo l’intero percorso. Un oscillatore armonico locale ripete il moto con periodo T; frequenza f=1/T e pulsazione ω=2πf. La distanza fra punti consecutivi in fase è λ; la velocità di propagazione in un mezzo uniforme non dispersivo è v=λf. La funzione y=A sin(2πx/λ−2πft+φ) descrive un’onda che avanza verso +x: i punti di fase costante si spostano di +λ in un periodo. Il segno opposto davanti al termine temporale invertirebbe la direzione. L’ampiezza A è lo spostamento massimo del mezzo e non la lunghezza d’onda. Su una corda lo spostamento può essere trasversale, perpendicolare alla propagazione; un’onda sonora nel fluido è longitudinale, con compressioni e rarefazioni. Il grafico a tempo fissato e quello di un singolo punto nel tempo rispondono a domande diverse.',
 'In un mezzo uniforme v=4 m/s e f=2 Hz. Trova λ e T. Con A=0,1 m e φ=0 trova y a x=λ/4,t=0 e a x=0,t=T/4.',
 ['λ=v/f=2 m e T=1/f=0,5 s.', 'A un quarto di lunghezza d’onda la fase è π/2 e y=+0,1 m.', 'Alla sonda x=0 dopo un quarto di periodo la fase è −π/2 e y=−0,1 m.'],
 'λ=2 m; T=0,5 s; +0,1 m e −0,1 m nei due punti richiesti.',
 Q('Un’onda ha v=4 m/s e f=2 Hz. Quanto vale λ?', '2 m', 'Dividi velocità per frequenza: (m/s)/(1/s)=m. La frequenza non è la velocità del mezzo.'),
 Q('Una perturbazione in un altro mezzo viaggia a 6 m/s con f=4 Hz. Trova λ e T; poi descrivi una perturbazione longitudinale.', 'λ=1,5 m; T=0,25 s; oscillazione parallela alla propagazione.', 'Il rapporto v/f determina λ. Longitudinale riguarda la direzione del moto locale, non il segno del grafico sinusoidale.'),
 ['Confondere ampiezza e lunghezza d’onda','Usare λ=f/v','Dire che le particelle viaggiano con la cresta'],
 ['Specifica se guardi spazio o tempo','Scrivi v=λf con unità','Segui un punto a fase costante per stabilire la direzione'],
 ['Frequenza e periodo descrivono il ritmo locale; λ e v descrivono la propagazione.','m/s diviso Hz restituisce m; fT=1.','A=0 annulla tutti gli spostamenti; una traslazione (x+λ,t+T) conserva la fase.'])

def consumer_four():
    specs=[('U2-02','strumenti-meccanica','Molla, forze ed equilibrio',4,20,0.2,6,80,0.075,'m'),('U5-01','fluidi-termodinamica','Stato termodinamico e gas ideale',None,None,0.02494338785445972,None,None,0.00831446261815324,'m³'),('U6-04','elettricita-magnetismo','Corrente e potenza in una rete',None,None,1,None,None,4.5,'A'),('U4-01','onde-ottica-radiazioni','Frequenza e lunghezza d’onda',None,None,2,None,None,1.5,'m')]
    result=[]
    for ident,course,title,_,__,answer,___,____,other,unit in specs:
        lesson=LESSONS[ident]
        if ident=='U2-02':
            p='Molla ideale: forza statica 4 N e k=20 N/m. Qual è l’allungamento in metri?'; t='Un’altra molla ha k=80 N/m e forza statica 6 N. Trova l’allungamento in metri.'
        elif ident=='U5-01':
            p='Gas ideale in equilibrio: n=1 mol, T=300 K, p assoluta=100000 Pa, R=8,31446261815324 J/(mol K). Trova V in m³.'; t='Gas ideale: n=0,5 mol, T=400 K, p assoluta=200000 Pa, R=8,31446261815324 J/(mol K). Trova V in m³.'
        elif ident=='U6-04':
            p='Generatore ideale 12 V, resistori 4 Ω e 8 Ω in serie. Trova la corrente totale in A.'; t='Generatore ideale 12 V, resistori 4 Ω e 8 Ω in parallelo. Trova la corrente totale in A.'
        else:
            p='Onda nel mezzo uniforme: v=4 m/s e f=2 Hz. Trova λ in m.'; t='Onda in un altro mezzo: v=6 m/s e f=4 Hz. Trova λ in m.'
        result.append({'id':'original-demo-'+ident.lower(),'courseId':course,'objectiveIds':lesson['subtargetIds'],'title':title,'explanation':[lesson['explanation']],
          'workedExample':{'prompt':lesson['workedExample']['prompt'],'steps':lesson['workedExample']['steps'],'answerDisplay':lesson['workedExample']['result']},
          'practice':{'prompt':p,'answer':{'value':answer,'unit':unit},'feedback':[f'Valore atteso {answer} {unit}.',lesson['scientificCounterchecks'][1]]},
          'transfer':{'prompt':t,'answer':{'value':other,'unit':unit},'feedback':[f'Valore atteso {other} {unit}.',lesson['scientificCounterchecks'][2]]},
          'recap':[lesson['recap']],'transcript':lesson['transcript'],'scientificEvidence':lesson['scientificCounterchecks'],
          'editorialStatus':'DRAFT','humanApproval':False,'provenance':lesson['provenance'],'coverageWarning':'Demo covers selected operations only; objectiveIds identify associated family and MUST NOT mean all subtargets certified.'})
    dump('content/consumer-four.json',result)

if __name__=='__main__':
    write_lessons()
    consumer_four()
