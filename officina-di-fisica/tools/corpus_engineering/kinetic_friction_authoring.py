"""Author kinetic-friction drafts, awaiting independent scientific review."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Nel riferimento inerziale del laboratorio un corpo scorre già rispetto a una superficie fissa, con velocità relativa non nulla. Il contatto è mantenuto. Nel modello di Coulomb l’attrito dinamico ha modulo F=μ_d N, con coefficiente puro μ_d>0 e modulo della normale N>0 dato. μ_d e N sono costanti dentro ogni prova. La forza di attrito è tangente e opposta alla velocità relativa: F non indica la risultante di tutte le forze. Non si assume N=mg. '
TASKS=[
('Il modulo dell’attrito durante lo scorrimento',SCENE+'Con μ_d=1/2 e N=4 N, quanto vale F in newton?',2,
 'Il contatto è già in scorrimento: applichiamo il modello dinamico, non una soglia di attrito statico. Il coefficiente un mezzo prende metà del carico normale da quattro newton. Il prodotto dà due newton di forza tangenziale opposta alla velocità relativa.',
 r'F=\mu_dN\qquad F=\frac12\times4\,\mathrm N\qquad F=2\,\mathrm N',
 'Questo è il modulo positivo: la componente con segno dipenderebbe dall’asse scelto. Se il corpo scorre verso destra, l’attrito su di esso è verso sinistra. Il dato N non deve essere sostituito automaticamente con il peso; eventuali altre forze possono modificare la normale.', 'Prendi la metà della normale già data.'),
('Un coefficiente puro moltiplica una forza','Nel modello dinamico F=μ_d N, F e N sono moduli di forze e μ_d è un coefficiente adimensionale. Quale unità SI misura F?',['kg','m/s²','N','m','s'],
 'Il coefficiente rappresenta un rapporto tra moduli di forza e non porta unità. Perciò moltiplicarlo per la normale conserva l’unità newton. Non stiamo calcolando l’accelerazione: per quella occorrerebbero la risultante e la massa.',
 r'[\mu_d]=1\qquad [F]=[N]=ML/T^2',
 'kg è massa; m/s² è accelerazione; m e s misurano lunghezza e tempo. La lettera N usata come simbolo del modulo normale non va confusa con l’unità newton scritta dopo un valore numerico. Entrambe le forze si misurano in newton.', 'Moltiplicare per un numero puro non cambia l’unità.'),
('Una legge per il regime dinamico',SCENE+'Quale relazione dà il modulo dell’attrito dinamico?',['F=N/μ_d','F=μ_d N','F=N','F=0','F=μ_d² N'],
 'Lo scorrimento relativo non nullo seleziona il regime dinamico. Nel modello assunto il modulo tangenziale è proporzionale alla normale, con coefficiente μ_d. Il verso va assegnato separatamente, contro la velocità relativa. Non si può dedurre l’accelerazione dal solo modulo F.',
 r'F=\mu_dN\qquad F>0',
 'N/μ_d inverte il coefficiente; N sarebbe vero soltanto nel caso particolare μ_d=1. Zero contraddice μ_d,N positivi; μ_d² N applica due volte il coefficiente. A contatto fermo l’attrito statico si adatta fino a una soglia: non è sempre μ_sN e non segue automaticamente questa legge dinamica.', 'Controlla prima che ci sia scorrimento relativo.'),
('Confrontare due coppie di superfici',SCENE+'Due prove con N=4 N usano coppie di materiali diverse, con μ_d₁=1/2 e μ_d₂=1/4. Come cambia F?',['Da 2 a 1 N','Resta 2 N','Da 2 a 4 N','Da 2 a 1/2 N','Diventa zero'],
 'Il carico normale è identico; cambia il coefficiente perché si cambia la coppia di materiali fra prove. Il secondo coefficiente è metà del primo, quindi l’attrito dimezza. Dentro ciascuna prova il suo coefficiente rimane costante.',
 r'F_1=\frac12\times4\,\mathrm N\qquad F_1=2\,\mathrm N\qquad F_2=\frac14\times4\,\mathrm N\qquad F_2=1\,\mathrm N',
 'Quattro newton inverte l’effetto del coefficiente minore; mezzo newton dimezza ancora. Invariabilità e zero ignorano rispettivamente il cambiamento e la positività di μ_d₂. Non si sta imponendo che il coefficiente di uno stesso contatto cambi durante lo scorrimento.', 'Con N fissato, F segue lo stesso fattore del coefficiente.'),
('Un coefficiente come rapporto fra forze',SCENE+'Si misurano F=2 N e N=4 N. Quanto vale μ_d?',['1/4','−1/2','1/2','2','1'],
 'Dividiamo la legge F=μ_dN per N>0. Il rapporto due newton su quattro newton è 1/2 e le unità si cancellano. Il coefficiente cercato è quindi puro, non una forza da riportare in newton.',
 r'\mu_d=\frac FN\qquad \mu_d=\frac{2\,\mathrm N}{4\,\mathrm N}\qquad \mu_d=\frac12',
 'Due inverte il rapporto; un quarto lo dimezza ancora; uno implicherebbe F=N=4 N. Il valore negativo è escluso dal modello dei moduli. Non serve né la massa né il campo gravitazionale, perché la normale è stata misurata.', 'Dividi il modulo tangenziale per il modulo normale.'),
('Ricavare la normale dalla forza tangenziale',SCENE+'Si misurano F=2 N e μ_d=1/2. Quanto vale N in newton?',4,
 'Per isolare N dividiamo F per il coefficiente positivo. Dividere per un mezzo equivale a moltiplicare per due: N=4 N. La normale ricostruita è una forza perpendicolare, mentre F è tangenziale; il rapporto di moduli non le rende forze opposte.',
 r'N=\frac F{\mu_d}\qquad N=2\times2\,\mathrm N\qquad N=4\,\mathrm N',
 'Il controllo (1/2)·4=2 N restituisce l’attrito. Moltiplicare ancora F per μ_d darebbe 1 N, ma a quella normale corrisponderebbe un attrito di 1/2 N. Non deduciamo una massa da N senza altre ipotesi sulle forze normali.', 'Il coefficiente moltiplica N: nell’inversa deve dividere F.'),
('Aumentare il carico sullo stesso contatto',SCENE+'Due prove della stessa coppia di materiali hanno μ_d=1/2 e normali N₁=4 N,N₂=8 N. Quanto vale F₂/F₁?',['2','1/2','4','1','−2'],
 'Il coefficiente resta identico nel regime di Coulomb assunto. Il carico raddoppia e con esso il modulo dell’attrito: da due a quattro newton. Nel rapporto la stessa metà si cancella, lasciando 8/4=2.',
 r'F_1=2\,\mathrm N\qquad F_2=4\,\mathrm N\qquad F_2/F_1=2',
 'Un mezzo inverte il confronto; quattro ripete F₂ come numero senza dividerlo per F₁; uno ignora il carico raddoppiato. Il rapporto negativo è incompatibile con moduli positivi. Il verso dell’attrito continua a dipendere dal verso dello scorrimento, non da questo rapporto.', 'Con μ_d uguale, confronta le due normali.'),
('Una proposta uguale alla normale',SCENE+'Con μ_d=1/2,N=4 N si propone F_proposto=4 N. Quanto vale proposto meno corretto?',['+2 N','+4 N','−2 N','0 N','+1 N'],
 'L’attrito corretto è metà della normale, cioè due newton. La proposta quattro dimentica il coefficiente. Sottraiamo nell’ordine richiesto: quattro meno due dà uno scarto positivo di due newton.',
 r'F=2\,\mathrm N\qquad e=(4-2)\,\mathrm N\qquad e=+2\,\mathrm N',
 '−2 N inverte la sottrazione; 4 N ripete la proposta; zero la accetta senza verifica e 1 N dimezza ancora lo scarto. Il segno dello scarto indica una sovrastima del modulo, non il verso dell’attrito sul corpo.', 'Calcola prima il prodotto μ_dN.'),
('L’inversa conserva un rapporto puro',SCENE+'Quale formula isola μ_d dalla relazione F=μ_dN?',['μ_d=F/N','μ_d=FN','μ_d=N/F','μ_d=2F/N','μ_d=F/(2N)'],
 'La normale positiva moltiplica il coefficiente. Dividendo entrambi i membri per N otteniamo un rapporto fra forze, dunque un numero puro. F/N è valido perché F è proprio il modulo dell’attrito dinamico e non una forza applicata arbitraria.',
 r'F/N=\mu_d\qquad \mu_d=F/N\qquad [F/N]=1',
 'FN ha dimensione forza al quadrato; N/F è puro ma inverte la relazione fisica. Il fattore due o il mezzo aggiuntivi non sono giustificati. Non si sostituisce N con mg senza conoscere il bilancio perpendicolare del caso.', 'Dividi la forza di attrito per la normale, non viceversa.'),
('Due cambiamenti fra prove',SCENE+'Nella seconda prova μ_d₂=κ₁μ_d e N₂=κ₂N, con κ₁,κ₂>0; μ_d,N indicano la prima prova. Si possono scegliere coppie di materiali e carichi diversi. Quale rapporto F₂/F₁ segue?',['κ₁/κ₂','κ₂/κ₁','κ₁κ₂','κ₁+κ₂','κ₁κ₂²'],
 'Ogni prova ha il proprio coefficiente e carico costanti. Sostituendo i nuovi dati nel prodotto μ_dN compare un fattore κ₁ dal coefficiente e un fattore κ₂ dalla normale. Dividendo per F₁ i dati iniziali si cancellano.',
 r'F_1=\mu_dN\qquad F_2=\kappa_1\kappa_2\mu_dN\qquad F_2/F_1=\kappa_1\kappa_2',
 'I quozienti invertono uno degli effetti; la somma non è la legge di un prodotto. κ₁κ₂² conterebbe due volte il cambiamento di carico. Il modello non impone μ_d<1: un coefficiente uguale o superiore a uno non è escluso dalla sola definizione di rapporto fra forze.', 'Moltiplica i due fattori di cambiamento una volta ciascuno.'),
('Un coefficiente maggiore con carico minore',SCENE+'Le prove hanno (μ_d₁=1/2,N₁=4 N) e (μ_d₂=1,N₂=1 N). Quanto vale F₂/F₁?',['1/2','2','1/4','1','−1/2'],
 'La prima forza è 2 N. Nella seconda il coefficiente raddoppia, ma il carico diventa un quarto: F₂=1·1 N=1 N. Il rapporto finale su iniziale è 1/2, prodotto dei fattori 2 e 1/4.',
 r'F_1=2\,\mathrm N\qquad F_2=1\,\mathrm N\qquad F_2/F_1=\frac12',
 'Due considera solo il coefficiente; un quarto solo la normale. Uno ignora che i due fattori non si compensano; il rapporto negativo viola la positività dei moduli. μ_d₂=1 significa che i due moduli tangenziale e normale sono uguali, non che abbiano la stessa direzione.', 'Calcola entrambe le forze prima del rapporto.'),
('Media delle forze di due contatti',SCENE+'Due prove hanno (μ_d=1/2,N=4 N) e (μ_d=1,N=1 N). Qual è la media aritmetica dei due attriti con uguale peso statistico?',['3/2 N','3 N','3/4 N','15/8 N','1 N'],
 'Le uscite sono 2 e 1 N. La loro media è (2+1)/2=3/2 N e può restare una frazione esatta. Il coefficiente medio e il carico medio non descrivono invece la media dei prodotti: sarebbero 3/4 e 5/2 N.',
 r'F_1=2\,\mathrm N\qquad F_2=1\,\mathrm N\qquad \overline F=\frac{2+1}{2}\,\mathrm N\qquad \overline F=\frac32\,\mathrm N',
 'Tre newton è la somma, 3/4 N dimezza ancora e 1 N è la differenza fra i moduli. Il prodotto degli ingressi medi vale (3/4)(5/2)=15/8 N, non la media richiesta. 3/2 N è correttamente compreso fra 1 e 2 N.', 'Media i due moduli dopo avere applicato la legge a ogni prova.'),
('Scegliere il nuovo carico normale',SCENE+'La prima prova ha μ_d₁=1/2,N₁=4 N. Si sceglie μ_d₂=1 e si vuole F₂=(1/2)F₁. Quanto vale N₂/N₁?',['1/4','4','1/2','2','1'],
 'L’attrito iniziale è 2 N, dunque l’obiettivo è 1 N. Con coefficiente nuovo uguale a uno la normale richiesta vale 1 N. Confrontandola con i 4 N iniziali otteniamo il rapporto 1/4.',
 r'F_1=2\,\mathrm N\qquad F_2=1\,\mathrm N\qquad N_2=F_2/\mu_{d2}\qquad N_2=1\,\mathrm N\qquad N_2/N_1=\frac14',
 'Un mezzo copia il rapporto delle forze e dimentica il coefficiente doppio. Due copia il cambiamento del coefficiente, quattro inverte il rapporto richiesto, uno mantiene il carico iniziale e produrrebbe F₂=4 N. Il nuovo carico è positivo e mantiene valido il contatto assunto.', 'Prima ricava N₂, poi dividilo per N₁.'),
('La taratura distingue lettura e forza',SCENE+'Un display ideale legge S=qF, continuo e adimensionale, con q>0 costante e offset nullo. Il riferimento μ_d=1/2,N=4 N dà S=6. La nuova prova dà S=3 e N=1 N. Quanto vale μ_d?',1,
 'La forza di riferimento è 2 N: q=6/(2 N)=3 N⁻¹. La nuova lettura 3 corrisponde a F=1 N. Dividendo per la normale assegnata da 1 N otteniamo il coefficiente puro uno.',
 r'q=3\,\mathrm{N^{-1}}\qquad F=\frac3q\qquad F=1\,\mathrm N\qquad \mu_d=F/N\qquad \mu_d=1',
 'Il controllo μ_dN=1 N e qF=3 ricostruisce i due passaggi. Il numero uno non è un limite universale per i coefficienti: qui è il rapporto misurato fra due moduli uguali. La lettura del display non è già una forza SI.', 'Converti S in newton prima di dividere per la normale.'),
('Taratura affine e coefficiente ignoto',SCENE+'Un display ideale legge S=qF+b, continuo e adimensionale, con q>0,b costanti. I riferimenti (μ_d=1/2,N=4 N) e (μ_d=1,N=1 N) danno S=5 e 3. La prova ignota ha N=3 N,S=7. Quanto vale μ_d?',['0','−1','1','2','1/2'],
 'Le forze dei riferimenti sono 2 e 1 N. La differenza delle letture è −2, quella delle forze è −1 N: il rapporto dà q=2 N⁻¹, positivo. Poi b=5−2·2=1. La lettura 7 dà F=(7−1)/2=3 N; divisa per N=3 N produce μ_d=1.',
 r'q=\frac{3-5}{(1-2)\,\mathrm N}\qquad q=2\,\mathrm{N^{-1}}\qquad b=1\qquad F=\frac{7-1}{q}\qquad F=3\,\mathrm N\qquad \mu_d=1',
 'I valori 0 e −1 violano il coefficiente positivo del modello. μ_d=2 darebbe F=6 N e S=13; μ_d=1/2 darebbe F=3/2 N e S=4. Nessuno ricostruisce S=7. Qui le differenze negative dei riferimenti si dividono tra loro: non rendono negativo il guadagno.', 'Usa lo stesso ordine per sottrarre letture e forze.'),
('Un vincolo fra contatti distinti',SCENE+'Si selezionano coppie di materiali e carichi diversi con μ_d=kN, dove k=(1/8) N⁻¹ è fisso. Il vincolo vale fra prove: non cambia il coefficiente dello stesso contatto durante una prova. Si misura F=2 N. Quanto vale N?',['8 N','2 N','5 N','3 N','4 N'],
 'Il coefficiente è puro perché k ha unità inversa di forza. Sostituiamo μ_d=kN nella legge e otteniamo F=kN². Dividendo per k: N²=(2 N)·(8 N)=16 N². La radice positiva è 4 N, l’unica ammessa per il modulo normale. Il coefficiente ricostruito è 4/8=1/2.',
 r'F=kN^2\qquad N^2=F/k\qquad N^2=16\,\mathrm{N^2}\qquad N=4\,\mathrm N\qquad \mu_d=\frac12',
 'La radice negativa è esclusa da N>0. I carichi 8,2,5,3 N darebbero rispettivamente F=8,1/2,25/8,9/8 N: nessuno è 2 N. Non si è introdotta una dipendenza dalla normale per un materiale fisso: sono state selezionate coppie diverse con coefficienti diversi, ciascuno costante nella propria prova.', 'Il vincolo introduce un quadrato con radice esatta; controlla le unità di k.')]
CHOICES={2:2,3:1,4:0,5:2,7:0,8:0,9:0,10:2,11:0,12:0,13:0,15:2,16:4}
UNITS={1:'N',6:'N',14:'1'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/kinetic-friction-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-kinetic-friction-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':3820+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'kinetic-friction','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Verifica lo scorrimento relativo; usa la normale data, senza sostituirla automaticamente con mg.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Attrito dinamico di Coulomb','Forze tangenziali e carico normale'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe per il solo esempio μ_d=1/2,N=4 N: scorrimento verso destra, calcolo del modulo F=2 N, proiezione tangenziale con F_x=−2 N sull’asse positivo verso destra. La normale è un dato; le altre forze non sono rappresentate. Freccia velocità a 80 px per m/s e forza a 40 px/N in pannelli distinti: lunghezze di dimensione diversa non confrontabili.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.kinetic_friction_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
        records.append(row)
        bindings.append({'id':row['id'],'sourceId':source_id,'sourceRef':source_ref,'sourceSha256':digest(sources[source_id]),'candidateSha256':digest(row),
            'assetChecksums':checksums,'provenance':provenance,'provenanceSha256':digest(provenance)})
    return {'schema':'astra/1','records':records,'assets':[asset]},bindings


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__)
    p.add_argument('--repo',type=Path,required=True)
    p.add_argument('--source-ref',required=True)
    p.add_argument('--destination',type=Path,required=True)
    args=p.parse_args()
    package,bindings=assemble(args.repo,args.source_ref)
    args.destination.mkdir(parents=True,exist_ok=True)
    (args.destination/'kinetic-friction-038.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'kinetic-friction-038-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
