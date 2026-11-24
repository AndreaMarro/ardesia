"""Author two-block taut-rope dynamics; no independent approval by the author."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='In un riferimento inerziale due blocchi distinti scorrono su un piano orizzontale liscio, senza contatto reciproco. Una fune orizzontale ideale, tesa, inestensibile e di massa nulla li collega. Il blocco anteriore ha massa fissa M=2 kg; quello posteriore massa costante m>0. La sola forza orizzontale esterna al sistema è F>0 applicata al blocco anteriore verso destra. Le forze verticali si equilibrano. A>0 è l’accelerazione comune verso destra. '
TASKS=[
('Un sistema di due masse',SCENE+'Con F=2 N e m=2 kg, quanto vale A?',['1/2 m/s²','1 m/s²','2 m/s²','1/4 m/s²','0 m/s²'],
 'Scegliamo come sistema entrambi i blocchi e la fune di massa nulla. Le tensioni sui blocchi hanno versi opposti e si cancellano nella somma del sistema. La forza F deve quindi accelerare quattro chilogrammi complessivi, non soltanto il blocco sul quale è applicata.',
 r'(M+m)A=F\qquad M+m=4\,\mathrm{kg}\qquad A=\frac{2\,\mathrm N}{4\,\mathrm{kg}}=\frac12\,\mathrm{m/s^2}',
 '1 m/s² userebbe soltanto una massa da2kg; 2 m/s² ripeterebbe il numero della forza senza la divisione per massa.1/4 dimezza ancora l’accelerazione e zero considera soltanto le tensioni interne ignorando F. Sul blocco posteriore la tensione vale mA=1N: è positiva, quindi la fune può restare tesa.', 'Per il sistema intero usa la massa totale, non quella del solo blocco trainato.'),
('L’unità dell’accelerazione comune','Due blocchi collegati da una fune tesa hanno accelerazione comune A=F/(M+m) su un piano liscio, in un riferimento inerziale. F è una forza esterna e M,m sono masse positive. Quale unità SI esprime A?',['kg','s','m','N','m/s²'],
 'La somma M+m è una massa. La forza divisa per massa ha dimensione di accelerazione, indipendentemente dal numero di corpi scelti nel sistema. La fune trasmette l’interazione, ma non cambia questa dimensione fisica.',
 r'[M+m]=M\qquad [A]=\frac{ML/T^2}{M}=L/T^2\qquad \mathrm{N/kg}=\mathrm{m/s^2}',
 'm/s² è corretto; N è la forza prima della divisione, kg il denominatore, s una durata e m una lunghezza. La parola comune significa che i due blocchi hanno la stessa accelerazione, non che si debba sommare due volte l’unità.', 'Espandi il newton e cancella il chilogrammo.'),
('La fune è interna al sistema',SCENE+'Quale relazione dà A?',['A=F/(M+m)','A=F/M','A=F/m','A=2F/(M+m)','A=F/(2M+2m)'],
 'Sul blocco anteriore la tensione T è verso sinistra, su quello posteriore è verso destra. Per fune ideale il suo modulo è lo stesso. Scriviamo la seconda legge per ciascun blocco e sommiamo: T scompare, mentre le masse si sommano perché l’accelerazione è comune.',
 r'F-T=MA\qquad T=mA\qquad F=(M+m)A\qquad A=\frac{F}{M+m}',
 'F/M e F/m ignorano la massa di un blocco.2F/(M+m) tratta F come se fosse applicata due volte, mentre la forza esterna è unica. Il denominatore2M+2m raddoppia indebitamente entrambe le masse. T non è zero: sul blocco posteriore T=mA>0, pur cancellandosi nell’equazione del sistema.', 'Somma le due equazioni e osserva dove si cancella T.'),
('Raddoppiare la forza a masse uguali',SCENE+'Due prove separate hanno m=2 kg e rispettivamente F₁=2 N,F₂=4 N. Come cambia A?',['Da 1/2 a 1 m/s²','Resta 1/2 m/s²','Da 1/2 a 2 m/s²','Da 1/2 a 1/4 m/s²','Diventa zero'],
 'La massa totale è quattro chilogrammi in entrambe le prove. La forza raddoppia, quindi il quoziente forza/massa raddoppia. La tensione si adegua al nuovo moto: non è una forza esterna aggiuntiva da inserire nella somma del sistema.',
 r'A_1=\frac24\,\mathrm{m/s^2}=\frac12\,\mathrm{m/s^2}\qquad A_2=\frac44\,\mathrm{m/s^2}=1\,\mathrm{m/s^2}\qquad A_2/A_1=2',
 '2 m/s² userebbe solo i2kg anteriori nella seconda prova.1/4 inverte l’effetto della forza; invariabilità o zero ignorano la nuova risultante esterna. In entrambe le prove T=mA è positiva, quindi il modello di traino a fune tesa è coerente.', 'Il denominatore M+m rimane4kg.'),
('Ricavare la forza esterna',SCENE+'Si misurano A=(1/2) m/s² e m=2 kg. Quanto vale F in newton?',2,
 'Moltiplichiamo A=F/(M+m) per la massa totale. La somma due più due dà quattro chilogrammi; moltiplicata per mezzo metro al secondo quadrato produce due newton. La forza ricavata è quella esterna, non la tensione interna.',
 r'(M+m)A=F\qquad F=(M+m)A\qquad F=(4\,\mathrm{kg})\left(\frac12\,\mathrm{m/s^2}\right)=2\,\mathrm N',
 'La tensione sul blocco posteriore vale soltanto mA=1N. Sul blocco anteriore rimane F−T=1N, uguale aMA. Il controllo sui singoli corpi mostra perché la forza esterna non coincide con T e non va dimezzata.', 'Moltiplica per la massa di entrambi i blocchi.'),
('Separare la massa fissa da quella ignota',SCENE+'Si misurano F=2 N e A=(1/2) m/s². Quanto vale m in kg?',2,
 'Il quoziente F/A fornisce prima la massa totale: dividere per un mezzo equivale a moltiplicare per due, quindi otteniamo quattro chilogrammi. Sottraiamo poi i due chilogrammi noti del blocco anteriore per isolare m.',
 r'M+m=\frac FA\qquad m=\frac FA-M\qquad \frac FA=4\,\mathrm{kg}\qquad m=4\,\mathrm{kg}-2\,\mathrm{kg}\qquad m=2\,\mathrm{kg}',
 'La condizione di massa positiva è F/A>M, qui4kg>2kg. Fermarsi aF/A darebbe4kg, la massa di tutto il sistema. Il risultato ricostruito dà A=2/(2+2)=1/2m/s² e tensione positiva.', 'La massa totale va ancora diminuita della massa fissa M.'),
('Più massa posteriore con la stessa forza',SCENE+'Fra due prove separate F resta2 N e m passa da2kg a4kg. Quanto vale A₂/A₁?',['2/3','4/3','1/2','3/2','−2/3'],
 'La massa totale passa da quattro a sei chilogrammi. Le accelerazioni sono1/2e1/3m/s². Per il rapporto dividiamo un terzo per un mezzo: moltiplichiamo un terzo per due e otteniamo2/3.',
 r'A_1=\frac{2}{2+2}\,\mathrm{m/s^2}=\frac12\,\mathrm{m/s^2}\qquad A_2=\frac{2}{2+4}\,\mathrm{m/s^2}=\frac13\,\mathrm{m/s^2}\qquad A_2/A_1=\frac{1/3}{1/2}=\frac23',
 '1/2 tratterebbe come doppia la massa totale, ma raddoppia solo m.3/2 inverte il rapporto;4/3 lo raddoppia; il segno negativo contraddice F>0 e masse positive. Il maggiore carico riduce A, pur lasciandola verso destra.', 'Confronta le masse totali4e6kg, non soltanto2e4kg.'),
('Lo scarto di una risposta doppia',SCENE+'Con F=2 N e m=2 kg si propone A_proposto=1 m/s². Quanto vale proposto meno corretto?',['+1/4 m/s²','+3/2 m/s²','−1/2 m/s²','+1/2 m/s²','+1 m/s²'],
 'La risposta corretta usa quattro chilogrammi totali: A=2/4=1/2m/s². La proposta uno è il doppio. Sottraiamo mantenendo frazioni esatte:1−1/2=1/2.',
 r'A=\frac{2\,\mathrm N}{4\,\mathrm{kg}}=\frac12\,\mathrm{m/s^2}\qquad e=\left(1-\frac12\right)\,\mathrm{m/s^2}=+\frac12\,\mathrm{m/s^2}',
 '−1/2 inverte la sottrazione;3/2 somma proposta e corretto.1 ripete la proposta e1/4 dimezza ancora lo scarto. La causa possibile della proposta è aver accelerato solo una delle due masse da2kg con F, dimenticando l’altra.', 'Scrivi 1 come 2/2 prima della sottrazione.'),
('Isolare F senza perdere una massa',SCENE+'Quale formula isola F da A=F/(M+m)?',['F=A(M+m)/2','F=AM','F=A(M+m)','F=A/(M+m)','F=Am'],
 'Il denominatore è l’intera massa totale. Moltiplichiamo entrambi i membri per M+m, positivo. L’accelerazione per la massa dà una forza e conserva entrambi i contributi di inerzia.',
 r'A(M+m)=F\qquad F=A(M+m)\qquad [A(M+m)]=(L/T^2)M=ML/T^2',
 'AM eAm assegnerebbero alla sola forza esterna la risultante di un solo blocco; il mezzo aggiuntivo dimezza F. A/(M+m) ha dimensione accelerazione su massa, diversa dalla forza. La tensione non va aggiunta al risultato: era già interna al sistema usato per ricavarlo.', 'Elimina tutto il denominatore, non un solo termine.'),
('La massa fissa non viene scalata',SCENE+'Una seconda prova usa F₂=κ₁F e m₂=κ₂m, con κ₁,κ₂>0. F,m indicano la prima prova, mentre M=2kg resta identica. Quale rapporto A₂/A₁ segue?',['κ₁(M+m)/(M+κ₂m)','κ₁/κ₂','κ₁(M+κ₂m)/(M+m)','2κ₁(M+m)/(M+κ₂m)','κ₁m/(κ₂M)'],
 'Scriviamo i due quozienti forza/massa totale. Nel secondo denominatore cambia solo m: il blocco anteriore resta M. Dividere per A₁ equivale a moltiplicare per (M+m)/F, e F si semplifica.',
 r'A_1=\frac{F}{M+m}\qquad A_2=\frac{\kappa_1F}{M+\kappa_2m}\qquad A_2/A_1=\frac{\kappa_1(M+m)}{M+\kappa_2m}',
 'κ₁/κ₂ scalerebbe entrambe le masse, contro il dato M fisso. Scambiare i due denominatori inverte l’effetto del carico; il fattore due supplementare non è richiesto. κ₁m/(κ₂M) ignora la somma delle masse e non dà1quando tutti gli ingressi restano invariati se m≠M.', 'Conserva M invariato nella seconda massa totale.'),
('Due cambiamenti del traino',SCENE+'Le due prove hanno (F₁=2 N,m₁=2 kg) e (F₂=4 N,m₂=4 kg). Quanto vale A₂/A₁?',['4/3','3/4','2','1','2/3'],
 'La forza raddoppia, ma la massa totale cresce da4a6kg. La prima accelerazione è1/2, la seconda4/6=2/3m/s². Nel rapporto (2/3)/(1/2) il mezzo al denominatore diventa un fattore due.',
 r'A_1=\frac12\,\mathrm{m/s^2}\qquad A_2=\frac23\,\mathrm{m/s^2}\qquad A_2/A_1=\frac23\times2=\frac43',
 '3/4 inverte il rapporto;2 considera solo il raddoppio della forza;1 presume che raddoppi anche la massa totale;2/3 ripete il valore numerico di A₂ senza dividerlo per A₁. Il rapporto è puro e maggiore di1.', 'Semplifica4/6prima di dividere per1/2.'),
('Media delle accelerazioni con denominatori diversi',SCENE+'Due prove hanno (F=2 N,m=2 kg) e (F=4 N,m=4 kg). Qual è la media aritmetica delle due accelerazioni con uguale peso statistico?',['7/12 m/s²','7/6 m/s²','7/24 m/s²','3/5 m/s²','1/6 m/s²'],
 'Le uscite sono1/2e2/3m/s². Portiamole al denominatore comune sei:3/6+4/6=7/6. La media divide poi per due e produce7/12. La frazione si conserva esatta; non serve una sua espansione decimale.',
 r'A_1=\frac12\,\mathrm{m/s^2}\qquad A_2=\frac23\,\mathrm{m/s^2}\qquad \overline A=\frac{1/2+2/3}{2}\,\mathrm{m/s^2}=\frac{3+4}{12}\,\mathrm{m/s^2}=\frac7{12}\,\mathrm{m/s^2}',
 '7/6 è la somma,7/24 dimezza ancora la media,1/6 è la differenza fra le uscite.3/5 deriva dagli ingressi medi F=3N,m=3kg:3/(2+3)=3/5, diversa operazione perché m compare al denominatore. La media richiesta è fra1/2e2/3.', 'Usa il denominatore comune6e dividi soltanto dopo per2.'),
('Scegliere il nuovo carico',SCENE+'La prima prova ha F₁=2 N,m₁=2 kg. Nella seconda F₂=4 N e si vuole A₂=(4/3)A₁. Quanto vale m₂/m₁?',2,
 'L’obiettivo è(4/3)(1/2)=2/3m/s². La massa totale richiesta èF₂/A₂=4/(2/3)=6kg. Togliamo i2kg anteriori: m₂=4kg. Confrontando con i2kg iniziali otteniamo rapporto due.',
 r'A_2=\frac23\,\mathrm{m/s^2}\qquad M+m_2=\frac{F_2}{A_2}=4\times\frac32\,\mathrm{kg}=6\,\mathrm{kg}\qquad m_2=6\,\mathrm{kg}-2\,\mathrm{kg}=4\,\mathrm{kg}\qquad m_2/m_1=2',
 'La massa positiva e F₂>0 mantengono tensione positiva. Il controllo4/(2+4)=2/3m/s² soddisfa l’obiettivo. Sei chilogrammi sarebbe il totale, non il solo carico posteriore: confondere questi due oggetti darebbe un rapporto errato.', 'Prima ricava la massa totale, poi sottrai M.'),
('Una lettura frazionaria ma continua',SCENE+'Un display ideale fornisce una lettura continua adimensionale S=qA, con q>0 costante e offset nullo. Il riferimento F=2 N,m=2 kg dà S=3/2. La nuova prova dà S=2 e m=4 kg. Quanto vale F nella nuova prova in newton?',4,
 'Il riferimento ha A=1/2m/s². Il rapporto (3/2)/(1/2) è3, perciò q=3s²/m. La nuova lettura due corrisponde ad accelerazione2/3m/s²; moltiplicata per la massa totale6kg dà4N. Il display ha scala continua:3/2 non rappresenta un numero obbligatoriamente intero di tacche.',
 r'q=\frac{3/2}{(1/2)\,\mathrm{m/s^2}}=3\,\mathrm{s^2/m}\qquad A=\frac2q=\frac23\,\mathrm{m/s^2}\qquad F=A(M+m)=\frac23\times6\,\mathrm N=4\,\mathrm N',
 'La verifica completa4/(2+4)=2/3e S=3·(2/3)=2 ricostruisce entrambe le letture. Interpretare2come newton o come accelerazione SI salterebbe la conversione tramite q.', 'Dividere per1/2equivale a moltiplicare per2.'),
('Taratura affine con due frazioni',SCENE+'Un display ideale legge S=qA+c, continuo e adimensionale, con q>0,c costanti. I riferimenti (F=2 N,m=2 kg) e (F=4 N,m=4 kg) danno S=2 e S=7/3. La prova ignota ha m=2 kg,S=3. Quanto vale F?',['2 N','6 N','3 N','4 N','8 N'],
 'Le accelerazioni di riferimento sono1/2e2/3; la loro differenza è1/6m/s². La differenza delle letture7/3−2 è1/3: dividendo(1/3)/(1/6) otteniamo q=2s²/m. Poi c=2−2·(1/2)=1. La lettura nuova tre, corretta per l’offset, dà A=1m/s².',
 r'\Delta A=\frac16\,\mathrm{m/s^2}\qquad \Delta S=\frac13\qquad q=2\,\mathrm{s^2/m}\qquad c=1\qquad A=\frac{3-1}{q}=1\,\mathrm{m/s^2}\qquad F=A(M+m)=1\times4\,\mathrm N=4\,\mathrm N',
 '6N risulterebbe da dividere3per2senza togliere l’offset, ottenendoA3/2.2N ripete il primo riferimento;3N scambia S con forza e8N raddoppia la forza corretta. Il controllo restituisce S=2·[4/(2+2)]+1=3.', 'Calcola entrambe le differenze come frazioni esatte.'),
('Un vincolo di forza proporzionale al carico',SCENE+'Si selezionano prove con F=km, dove k=1 m/s² è fisso. Il vincolo lega prove diverse, non una massa variabile durante il moto. Si misura A=(1/2) m/s². Quanto vale m?',['3 kg','−2 kg','2 kg','4 kg','1 kg'],
 'Sostituiamo F=km nella legge del sistema. Dopo aver moltiplicato per M+m raccogliamo i termini contenenti m dalla stessa parte: AM=(k−A)m. Per una massa positiva occorre0<A<k. I dati lo soddisfano e consentono una divisione per la differenza positiva1−1/2.',
 r'A(M+m)=km\qquad AM=(k-A)m\qquad m=\frac{AM}{k-A}\qquad m=\frac{[(1/2)\,\mathrm{m/s^2}](2\,\mathrm{kg})}{(1/2)\,\mathrm{m/s^2}}=2\,\mathrm{kg}\qquad F=km=2\,\mathrm N',
 'm=1,3,4kg darebbe rispettivamente A=1/3,3/5,2/3m/s².−2kg viola il dominio e annullerebbe anche M+m. La coppia m2kg,F2N è unica; se A raggiungesse k non esisterebbe una massa finita positiva con M>0. La condizione di esistenza rende esplicito il ruolo della massa anteriore fissa.', 'Raccogli m dopo aver eliminato il denominatore M+m.')]
CHOICES={1:0,2:4,3:0,4:0,7:0,8:3,9:2,10:0,11:0,12:0,15:3,16:2}
UNITS={5:'N',6:'kg',13:'1',14:'N'}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/two-blocks-system-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-two-blocks-system-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':3320+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'two-blocks-system','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Sul sistema intero usa M+m; la tensione interna si cancella, non è nulla.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Seconda legge di Newton per un sistema','Tensione interna in fune ideale'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,9):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe per M=m=2 kg,F=2 N: due blocchi separati collegati da fune tesa, forza applicata al blocco anteriore; diagrammi dei due corpi con tensioni interne uguali e opposte T=1 N; sistema intero di massa4 kg con risultante esterna2 N e A=1/2 m/s². Forze a40 px/N; disegno dei blocchi schematico senza scala spaziale.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.two_blocks_system_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'two-blocks-system-033.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'two-blocks-system-033-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
