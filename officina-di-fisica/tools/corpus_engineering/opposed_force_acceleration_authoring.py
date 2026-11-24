"""Author force-opposition drafts; independent scientific review remains open."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='In un riferimento inerziale un blocco di massa costante M=2 kg è su un piano orizzontale. Le forze verticali si equilibrano. Le sole forze orizzontali sul blocco sono F verso destra e R verso sinistra, costanti nella prova, con F>R>0. Destra è positiva e A è l’accelerazione orientata del blocco. '
TASKS=[
('Sommare le forze sul solo blocco',SCENE+'Con F=6 N e R=2 N, quanto vale A in m/s²?',2,
 'Le due forze agiscono sul medesimo blocco, quindi entrano nella stessa somma algebrica. F contribuisce positivamente e R negativamente. Prima ricaviamo la risultante, poi la dividiamo per la massa; la forza maggiore determina il verso dell’accelerazione, non necessariamente il verso della velocità iniziale.',
 r'F_x=F-R=(6-2)\,\mathrm N=4\,\mathrm N\qquad MA=F_x\qquad A=\frac{4\,\mathrm N}{2\,\mathrm{kg}}=+2\,\mathrm{m/s^2}',
 'L’accelerazione è verso destra. Se il blocco si stesse muovendo a sinistra, questa stessa accelerazione ne ridurrebbe inizialmente la rapidità: il testo non assegna la velocità. Sommare i moduli 6+2 darebbe una risultante sbagliata, perché ignora i versi.', 'Sottrai i moduli delle forze opposte prima di dividere per M.'),
('L’unità di risultante divisa per massa','La seconda legge di Newton scritta lungo un asse inerziale dà A=(F−R)/M, dove F,R sono forze e M è una massa positiva. Quale unità SI è adatta all’accelerazione A?',['s','m','kg','m/s²','N'],
 'La differenza fra due forze ha ancora unità di forza. Un newton equivale a un chilogrammo per metro al secondo quadrato. Dividendo per la massa si cancella il chilogrammo e rimane l’unità di accelerazione.',
 r'[F-R]=ML/T^2\qquad [A]=\frac{ML/T^2}{M}=L/T^2\qquad \mathrm{N/kg}=\mathrm{m/s^2}',
 'm/s² è corretto. N misura la risultante prima della divisione, kg il denominatore, m una lunghezza e s una durata. Il segno dell’accelerazione dipende dall’asse, ma non ne cambia l’unità.', 'Espandi N come kg·m/s² e cancella kg.'),
('Una coppia di interazione attraversa il confine','Una persona spinge un carrello. Il carrello esercita contemporaneamente sulla persona una forza uguale e opposta. Perché queste due forze non si annullano nel calcolo dell’accelerazione del solo carrello, osservato in un riferimento inerziale?',['Il carrello non obbedisce alla seconda legge','Agiscono su due corpi diversi','La forza della persona è sempre maggiore','La reazione nasce solo quando il carrello si muove','La reazione non ha effetti meccanici'],
 'Scegliamo come sistema soltanto il carrello. Nella sua equazione compaiono le forze esercitate su di lui, fra cui la spinta della persona. La forza opposta ha invece come destinataria la persona. È una forza reale e simultanea, ma appartiene al diagramma di un altro corpo.',
 r'\vec F_{persona\to carrello}=-\vec F_{carrello\to persona}\qquad m_c\vec a_c=\sum\vec F_{sul\ carrello}',
 'La terza legge non sostituisce la seconda: l’uguaglianza delle forze dell’interazione vale sempre, senza aspettare il movimento. Se il sistema comprendesse persona e carrello, la coppia sarebbe interna e si cancellerebbe nella somma totale; l’accelerazione del sistema dipenderebbe dalle altre forze esterne, per esempio quelle del suolo.', 'Per ogni freccia domanda: su quale corpo agisce?'),
('Più spinta con la stessa opposizione',SCENE+'Due prove separate hanno R=2 N e rispettivamente F₁=6 N,F₂=10 N. Come cambia l’accelerazione?',['Da 2 a 4 m/s²','Da 2 a 5 m/s²','Resta 2 m/s²','Da 2 a 1 m/s²','Diventa zero'],
 'Nella prima prova la risultante è quattro newton; nella seconda è otto. La massa resta due chilogrammi, quindi anche l’accelerazione raddoppia. Usiamo entrambe le forze prima della divisione: il rapporto fra le spinte 10/6 da solo non è il rapporto fra accelerazioni.',
 r'A_1=\frac{6-2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad A_2=\frac{10-2}{2}\,\mathrm{m/s^2}=4\,\mathrm{m/s^2}',
 'Cinque m/s² userebbe solo la nuova spinta senza R; invariabilità o diminuzione ignorerebbero il maggiore squilibrio verso destra. Lo zero richiederebbe F=R, escluso in entrambe le prove. La nuova risultante è doppia pur non essendo doppia F.', 'Confronta 6−2 e 10−2, non soltanto 6 e10.'),
('Ricostruire la spinta',SCENE+'Si misurano A=2 m/s² e R=2 N. Quanto vale F in newton?',6,
 'Dalla risultante MA=F−R aggiungiamo R a entrambi i membri. Il prodotto massa per accelerazione vale quattro newton: la spinta deve fornire questi quattro newton di squilibrio più i due necessari a compensare R.',
 r'MA=F-R\qquad F=MA+R\qquad F=(2\,\mathrm{kg})(2\,\mathrm{m/s^2})+2\,\mathrm N=6\,\mathrm N',
 'Il controllo (6−2)/2=2 restituisce l’accelerazione. Quattro newton è la risultante, non la forza F presa singolarmente. Il valore trovato soddisfa F>R>0, quindi mantiene il dominio dichiarato.', 'La spinta supera R della quantità MA.'),
('Quanto vale la forza opposta?',SCENE+'Si misurano A=2 m/s² e F=6 N. Quanto vale R in newton?',2,
 'Il prodotto MA è la parte della spinta che resta dopo la sottrazione di R. Dall’equazione MA=F−R aggiungiamo R e sottraiamo MA: rimane R=F−MA. Tutti i termini della sottrazione sono forze.',
 r'MA=F-R\qquad R+MA=F\qquad R=F-MA\qquad R=6\,\mathrm N-4\,\mathrm N=2\,\mathrm N',
 'La forza opposta è minore della spinta e positiva. La condizione per questa inversa è F>MA>0, verificata da6>4>0. Se si ottenesse R negativo, il verso assegnato a R non descriverebbe più il modello richiesto.', 'Togli dalla spinta la risultante MA.'),
('Aumentare soltanto la forza opposta',SCENE+'Fra due prove separate F resta6 N e R passa da R₁=2 N a R₂=4 N. Quanto vale A₂/A₁?',['1','1/4','2','−1/2','1/2'],
 'La risultante passa da quattro a due newton. Dividendo per la stessa massa otteniamo accelerazioni due e un metro al secondo quadrato. Il rapporto secondo su primo è la frazione un mezzo, positiva perché F rimane maggiore di R.',
 r'A_1=\frac{6-2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad A_2=\frac{6-4}{2}\,\mathrm{m/s^2}=1\,\mathrm{m/s^2}\qquad A_2/A_1=1/2',
 'Uno ignora il cambiamento, due inverte il rapporto, un quarto dimezza due volte. Il segno negativo sarebbe incompatibile con F>R in entrambe le prove. R è raddoppiata, ma entra in una differenza: non si può sostituire il rapporto R₂/R₁ a quello delle accelerazioni.', 'Trova prima le due risultanti orientate.'),
('Lo scarto dopo la divisione per la massa',SCENE+'Con F=6 N,R=2 N si propone A_proposto=4 m/s². Quanto vale lo scarto proposto meno corretto?',['+1 m/s²','0 m/s²','−2 m/s²','+2 m/s²','+4 m/s²'],
 'Quattro newton è la risultante orizzontale, non ancora l’accelerazione. Divisa per due chilogrammi dà due metri al secondo quadrato. La proposta vale quattro, quindi la sottrazione richiesta è quattro meno due.',
 r'A=\frac{6-2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad e=(4-2)\,\mathrm{m/s^2}=+2\,\mathrm{m/s^2}',
 '−2 inverte l’ordine dello scarto; +4 ripete la proposta; zero la accetterebbe; +1 dimezza ancora la differenza. Il segno dello scarto esprime sovrastima e non è una nuova scelta del verso dell’asse.', 'La risultante4 N deve ancora essere divisa per2 kg.'),
('L’inversa conserva la massa come grandezza',SCENE+'Quale formula isola F dalla relazione A=(F−R)/M?',['F=2MA+R','F=MA−R','F=MA+R','F=A/M+R','F=M(A+R)'],
 'Moltiplichiamo per M, che è la massa positiva due chilogrammi, poi aggiungiamo R. Manteniamo il simbolo M con la sua dimensione: scrivere soltanto2A senza l’unità della massa nasconderebbe il controllo dimensionale.',
 r'MA=F-R\qquad MA+R=F\qquad F=MA+R\qquad [MA]=ML/T^2=[R]',
 '2MA+R raddoppia indebitamente la risultante richiesta. MA−R sottrae la forza che andava compensata. A/M non ha unità di forza, mentre A+R somma accelerazione e forza senza una conversione fisica. La formula corretta dà F>R quando A>0.', 'Elimina il denominatore M e poi il termine−R.'),
('Scalare forze che si sottraggono',SCENE+'Una seconda prova usa F₂=κ₁F,R₂=κ₂R, con κ₁,κ₂>0 e κ₁F>κ₂R. Nella prima prova A₁=(F−R)/M e nella seconda A₂. Quale rapporto A₂/A₁ segue?',['κ₁/κ₂','(κ₁F+κ₂R)/(F−R)','(κ₁F−κ₂R)/(κ₁F+κ₂R)','2(κ₁F−κ₂R)/(F−R)','(κ₁F−κ₂R)/(F−R)'],
 'Scriviamo le due risultanti, ciascuna con il proprio segno. La massa è uguale e si cancella nel rapporto; le forze iniziali invece rimangono, perché una differenza non si fattorizza in un rapporto dei due fattori indipendenti. Il vincolo sulla seconda prova garantisce accelerazione positiva.',
 r'A_1=\frac{F-R}{M}\qquad A_2=\frac{\kappa_1F-\kappa_2R}{M}\qquad \frac{A_2}{A_1}=\frac{\kappa_1F-\kappa_2R}{F-R}',
 'κ₁/κ₂ sarebbe adatto a un quoziente di ingressi, non alla loro differenza. Il segno più somma forze opposte; il denominatore κ₁F+κ₂R cambia il confronto richiesto. Il fattore due supplementare non deriva da nessuna massa nuova. Se κ₁=κ₂=κ, il rapporto èκ: questo controllo conferma la struttura della formula.', 'Cancella la massa comune, mantenendo le due differenze.'),
('Due cambiamenti, due risultanti',SCENE+'Le due prove hanno (F₁=6 N,R₁=2 N) e (F₂=10 N,R₂=4 N). Quanto vale A₂/A₁?',['3/2','2/3','5/3','2','1'],
 'Le risultanti sono quattro e sei newton. Le accelerazioni sono dunque due e tre metri al secondo quadrato. Dividendo tre per due rimane una frazione esatta, senza bisogno di convertirla in decimale.',
 r'A_1=\frac{6-2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad A_2=\frac{10-4}{2}\,\mathrm{m/s^2}=3\,\mathrm{m/s^2}\qquad A_2/A_1=3/2',
 '2/3 inverte il rapporto,5/3 confronta soltanto le spinte10/6, due confronta soltanto le forze opposte4/2 e uno ignora che la risultante cresce. Le unità si cancellano nel rapporto di accelerazioni.', 'Il confronto riguarda6 N e4 N di risultante.'),
('La media di due accelerazioni',SCENE+'Due prove hanno (F=6 N,R=2 N) e (F=10 N,R=4 N). Qual è la media aritmetica delle due accelerazioni, con uguale peso statistico?',['3/2 m/s²','5/2 m/s²','5 m/s²','5/4 m/s²','7/2 m/s²'],
 'Calcoliamo le uscite due e tre metri al secondo quadrato. La loro somma è cinque, e ciascuna ha metà peso nella media. Qui la legge è lineare nelle due forze a massa fissata: anche usare le forze medie F=8 N,R=3 N darebbe lo stesso risultato, non una scorciatoia vietata in generale.',
 r'A_1=2\,\mathrm{m/s^2}\qquad A_2=3\,\mathrm{m/s^2}\qquad \overline A=\frac{2+3}{2}\,\mathrm{m/s^2}=\frac52\,\mathrm{m/s^2}',
 'Cinque è la somma;5/4 dimezza ancora la media;3/2 è il rapporto delle accelerazioni;7/2 non è la media delle due uscite e cade sopra entrambe: una media dovrebbe invece trovarsi fra2e3. I pesi sono statistici e non tempi di una traiettoria composta.', 'Una media con uguali pesi sta fra2e3.'),
('Scegliere la nuova forza opposta',SCENE+'La prima prova ha F₁=6 N,R₁=2 N. Nella seconda si impone F₂=10 N e si vuole A₂=(3/2)A₁. Quanto deve valere R₂/R₁?',2,
 'La prima accelerazione vale due, quindi l’obiettivo è tre metri al secondo quadrato. La risultante richiesta è M A₂=6 N. Dalla spinta nuova dieci togliamo questa risultante per ricavare i quattro newton della forza opposta; solo alla fine confrontiamo con i due iniziali.',
 r'A_1=2\,\mathrm{m/s^2}\qquad A_2=3\,\mathrm{m/s^2}\qquad R_2=F_2-MA_2=(10-6)\,\mathrm N=4\,\mathrm N\qquad R_2/R_1=4/2=2',
 'I nuovi dati rispettano10>4>0. Il controllo (10−4)/2=3 verifica l’obiettivo, mentre moltiplicare R₁ direttamente per3/2 non funzionerebbe: l’accelerazione dipende dalla differenza F−R, non da R da sola.', 'Ricava la nuova risultante prima di cercare R₂.'),
('Tarare una lettura di accelerazione',SCENE+'Un display ideale fornisce S=qA, lettura continua adimensionale, con q>0 costante e offset nullo. Il riferimento F=6 N,R=2 N dà S=6. La nuova prova dà S=9 e R=4 N. Quanto vale F nella nuova prova in newton?',10,
 'Il riferimento ha accelerazione due metri al secondo quadrato. Il guadagno è dunque6/2=3 s²/m. La lettura nuova nove equivale ad accelerazione tre. Trasformiamo questa in risultante con M=2 kg, poi aggiungiamo i quattro newton di R.',
 r'q=\frac6{2\,\mathrm{m/s^2}}=3\,\mathrm{s^2/m}\qquad A=\frac9q=3\,\mathrm{m/s^2}\qquad F=MA+R=(2\times3+4)\,\mathrm N=10\,\mathrm N',
 'Il controllo completo dà A=(10−4)/2=3m/s² e S=3·3=9. S non è direttamente una forza o un’accelerazione in SI: il guadagno ne definisce la conversione. Il nuovo F resta maggiore di R.', 'Usa il riferimento per ricavare q prima dell’inversa F=MA+R.'),
('Due riferimenti trovano anche l’offset',SCENE+'Un display ideale legge S=qA+c, continuo e adimensionale, con q>0,c costanti. I riferimenti (F=6 N,R=2 N) e (F=10 N,R=4 N) danno S=5 e7. La prova ignota ha R=2 N,S=9. Quanto vale F?',['9 N','10 N','20 N','5 N','11 N'],
 'I riferimenti producono accelerazioni due e tre. Sottrarre le letture elimina l’offset: il guadagno è due per una differenza di1m/s², cioè2s²/m. Poi c=5−2·2=1. La nuova lettura corretta per l’offset è otto, quindi A=4m/s².',
 r'q=\frac{7-5}{(3-2)\,\mathrm{m/s^2}}=2\,\mathrm{s^2/m}\qquad c=5-2\times2=1\qquad A=\frac{9-1}{q}=4\,\mathrm{m/s^2}\qquad F=MA+R=(2\times4+2)\,\mathrm N=10\,\mathrm N',
 'Undici newton deriverebbe dal dividere9 per2 senza sottrarre l’offset. Cinque dimezza la forza corretta e venti la raddoppia. Nove confonde la lettura strumentale con una forza in newton. La coppia F10,R2 restituisce S=2·[(10−2)/2]+1=9.', 'Una differenza trova q, un riferimento trova c, poi ricostruisci A.'),
('Un vincolo di proporzione fra le due forze',SCENE+'Le prove selezionate soddisfano inoltre F=3R, con3 fattore puro. Si misura A=2 m/s². Quanto vale R?',['3 N','−2 N','2 N','4 N','1 N'],
 'Sostituiamo la proporzione nella risultante prima di risolvere:3R−R=2R. La seconda legge diventa MA=2R. Dividiamo per il numero puro due, mantenendo la massa M con la propria unità. Dato A positivo, troviamo R positivo e poi F triplo.',
 r'MA=3R-R=2R\qquad R=\frac{MA}{2}=\frac{(2\,\mathrm{kg})(2\,\mathrm{m/s^2})}{2}=2\,\mathrm N\qquad F=3R=6\,\mathrm N',
 'La coppia è unica e soddisfa F>R>0. R=1,3,4N darebbe rispettivamente A=1,3,4m/s² sotto il vincolo. −2N viola il modulo positivo assegnato a R e produrrebbe anche F negativo. Il confronto fra prove non implica una massa variabile.', 'Sostituisci F=3R nella differenza, non nel solo numeratore F.')]
CHOICES={2:3,3:1,4:0,7:4,8:3,9:2,10:4,11:0,12:1,15:1,16:2}
UNITS={1:'m/s²',5:'N',6:'N',13:'1',14:'N'}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/opposed-force-acceleration-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-opposed-force-acceleration-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':3120+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'opposed-force-acceleration','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Isola il corpo e somma le forze orientate prima di applicare Newton.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Seconda e terza legge di Newton','Forze opposte sullo stesso corpo'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,9):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe orizzontali: F=6 N e R=2 N sul medesimo blocco; risultante4 N verso destra; accelerazione2 m/s² per M=2 kg. Forze a20 px/N e accelerazione a40 px per m/s²: le due scale hanno dimensioni diverse. Forze verticali equilibrate, omesse dalla proiezione orizzontale.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.opposed_force_acceleration_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'opposed-force-acceleration-031.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'opposed-force-acceleration-031-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
