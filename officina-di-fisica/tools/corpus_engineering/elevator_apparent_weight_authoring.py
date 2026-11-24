"""Author elevator normal-force drafts in an inertial frame with maintained contact."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Una persona di massa costante m>0 resta ferma rispetto alla bilancia sul pavimento di un ascensore. Il contatto è mantenuto. Nel riferimento inerziale esterno, alto positivo, entrambi accelerano verso l’alto con a>0. Il campo gravitazionale ha g=10 m/s². Le sole forze verticali sulla persona sono il peso mg in basso e la normale N in alto, letta in newton. '
TASKS=[
('La bilancia misura una forza di contatto',SCENE+'Con m=40 kg,a=2 m/s², quanto vale N in newton?',480,
 'Essere fermi rispetto alla cabina non significa avere accelerazione nulla rispetto al suolo. La persona condivide l’accelerazione dell’ascensore. La risultante verticale è N−mg, perciò la normale deve superare il peso della quantità m·a necessaria ad accelerare la persona verso l’alto.',
 r'N-mg=ma\qquad N=m(g+a)\qquad N=(40\,\mathrm{kg})(12\,\mathrm{m/s^2})=480\,\mathrm N',
 'Il peso vale400N e la risultante80N; la bilancia legge480N, non uno di questi altri due valori. N>0 conferma che il contatto richiesto è possibile. Il risultato dipende dall’accelerazione, non dal fatto che la cabina stia istantaneamente salendo o scendendo.', 'La bilancia deve fornire sia il sostegno del peso sia la risultante m·a.'),
('Forza letta oppure massa?','Una bilancia dinamometrica sotto i piedi di una persona legge direttamente il modulo N della forza normale esercitata dal suo piatto. Quale unità SI è adatta a N?',['kg','s','m','m/s²','N'],
 'La grandezza misurata è una forza di contatto. Dalla seconda legge di Newton una forza ha la dimensione di massa per accelerazione. Il suo nome di unità SI è newton, anche quando nel linguaggio quotidiano la lettura viene chiamata peso apparente.',
 r'[N]=ML/T^2\qquad 1\,\mathrm N=1\,\mathrm{kg\,m/s^2}',
 'kg è una massa: richiederebbe una diversa taratura per convertire la forza in una massa indicata. m/s² misura l’accelerazione; m e s non sono forze. Qui il prompt dichiara una bilancia dinamometrica e non una scala graduata in chilogrammi.', 'Il piatto esercita una forza, non una massa.'),
('Scrivere l’equazione nel riferimento esterno',SCENE+'Quale relazione ricava N usando i simboli definiti?',['N=m(g−a)','N=ma','N=m(g+a)','N=mg','N=2m(g+a)'],
 'Sommiamo soltanto le forze che agiscono sulla persona. La normale ha segno positivo, il peso negativo. Nel riferimento inerziale esterno non si aggiunge una forza fittizia: il prodotto m·a è il secondo membro della legge di Newton. Isolando N si deve compensare il peso e lasciare una risultante positiva.',
 r'\sum F_y=N-mg\qquad N-mg=ma\qquad N=mg+ma=m(g+a)',
 'm(g−a) descriverebbe un’accelerazione orientata in basso di modulo a, soltanto per a≤g se si vuole mantenere N≥0: oltre g non si ammette una normale negativa, ma si perde il contatto. Il prodotto m·a è la risultante e non la normale. mg varrebbe per accelerazione nulla. Il fattore due nell’ultima alternativa non deriva dalle due forze: il peso è già incluso nella somma g+a.', 'Alto positivo: N e mg entrano con segni opposti.'),
('Due persone alla stessa accelerazione',SCENE+'Due prove separate hanno a=2 m/s² e masse m₁=40 kg,m₂=60 kg. Come cambia la lettura N?',['Da 480 a 720 N','Da 480 a 960 N','Resta 480 N','Da 480 a 320 N','Diventa zero'],
 'L’accelerazione efficace g+a vale12m/s² in entrambe le prove. La massa aumenta del fattore60/40=3/2, perciò anche N aumenta dello stesso fattore. Il corpo della seconda prova ha massa costante: non descriviamo una persona che cambia massa durante il moto.',
 r'N_1=40(10+2)\,\mathrm N=480\,\mathrm N\qquad N_2=60(10+2)\,\mathrm N=720\,\mathrm N\qquad N_2/N_1=3/2',
 '960N raddoppierebbe la massa anziché moltiplicarla per3/2.320N inverte il rapporto, invariabilità ignora m e zero contraddice il contatto con accelerazione verso l’alto. Entrambe le normali sono maggiori dei rispettivi pesi.', 'Moltiplica lo stesso12m/s² per ciascuna massa.'),
('Dalla lettura alla massa',SCENE+'Si misurano N=480 N e a=2 m/s². Quanto vale m in kg?',40,
 'Isoliamo la massa da N=m(g+a) dividendo per la somma di accelerazioni, positiva. Dodici metri al secondo quadrato al denominatore convertono la forza in una massa. Il conto480/12 si può fare riconoscendo12·4=48 e aggiungendo uno zero.',
 r'm=\frac{N}{g+a}\qquad m=\frac{480\,\mathrm N}{12\,\mathrm{m/s^2}}=40\,\mathrm{kg}',
 'Usare N/g darebbe48kg, assumendo erroneamente accelerazione nulla. La ricostruzione40·12=480N verifica i dati. Non occorre conoscere la velocità della cabina, che non compare nella seconda legge per questa domanda.', 'Al denominatore compare g+a, non soltanto g.'),
('Dalla lettura all’accelerazione',SCENE+'Si misurano N=480 N e m=40 kg. Quanto vale a in m/s²?',2,
 'Dividiamo prima N=m(g+a) per la massa. Il quoziente 480/40 dà dodici metri al secondo quadrato: è g+a, non ancora a. Sottraiamo poi la gravità di dieci. Il valore positivo deve corrispondere al verso alto assegnato.',
 r'\frac Nm=g+a\qquad a=\frac Nm-g\qquad \frac Nm=12\,\mathrm{m/s^2}\qquad a=(12-10)\,\mathrm{m/s^2}\qquad a=2\,\mathrm{m/s^2}',
 'La lettura supera il peso400N e fornisce quindi una risultante80N verso l’alto. Questo verifica sia a=80/40=2m/s² sia il contatto N>0. Il quoziente N/m da solo avrebbe sovrastimato l’accelerazione di g.', 'Dopo la divisione per m manca ancora la sottrazione di g.'),
('Raddoppiare a non raddoppia N',SCENE+'Due prove con m=40 kg hanno a₁=2 m/s²,a₂=4 m/s². Quanto vale N₂/N₁?',['7/12','2','1/6','7/6','6/7'],
 'Il peso della stessa persona non cambia. Le somme g+a passano da12a14m/s², dunque il rapporto è14/12=7/6. Le due letture sono480e560N; solo il termine m·a raddoppia, non l’intera normale.',
 r'N_1=40\times12\,\mathrm N=480\,\mathrm N\qquad N_2=40\times14\,\mathrm N=560\,\mathrm N\qquad N_2/N_1=560/480=7/6',
 'Due usa il rapporto delle accelerazioni ignorando il peso;6/7 inverte le prove;7/12 dimezza il rapporto corretto.1/6 è l’aumento relativo (560−480)/480, non il rapporto finale/iniziale. Le forze rimangono positive in entrambe le prove.', 'Confronta g+a₂ con g+a₁.'),
('Valutare uno scarto in newton',SCENE+'Con m=40 kg,a=2 m/s², si propone N_proposto=960 N. Quanto vale proposto meno corretto?',['+960 N','+240 N','−480 N','0 N','+480 N'],
 'La normale corretta è quaranta per dodici, cioè480N. La proposta è il doppio. Per lo scarto con segno sottraiamo il valore corretto dalla proposta:960−480=480N.',
 r'N=m(g+a)=40\times12\,\mathrm N=480\,\mathrm N\qquad e=(960-480)\,\mathrm N=+480\,\mathrm N',
 '−480N invertirebbe l’ordine, zero accetterebbe la proposta,960N la ripeterebbe e240N dimezzerebbe ancora lo scarto. Il segno positivo è una sovrastima della lettura, non una normale diretta in un verso diverso da quello dichiarato.', 'Ricava prima la normale e poi confrontala con960N.'),
('L’inversa con un denominatore positivo',SCENE+'Quale formula isola m da N=m(g+a)?',['m=N/[2(g+a)]','m=N/g','m=N/a','m=N/(g+a)','m=2N/(g+a)'],
 'La massa moltiplica la somma g+a. Dividiamo entrambi i membri per quella somma, che è strettamente positiva per le ipotesi g>0,a>0. Un newton diviso un metro al secondo quadrato produce un chilogrammo.',
 r'\frac{N}{g+a}=m\qquad m=\frac{N}{g+a}\qquad [m]=\frac{ML/T^2}{L/T^2}=M',
 'I fattori due aggiunti o tolti dimezzano o raddoppiano la massa senza motivo. N/g assumerebbe assente la risultante m·a; N/a confonderebbe N con la risultante. Nel dominio dichiarato ogni lettura N positiva fornisce una massa positiva e una normale compatibile con il contatto.', 'Dividi per tutta la parentesi g+a.'),
('Scalare m e a mantenendo la gravità',SCENE+'Fra due prove separate m₂=κ₁m e a₂=κ₂a, con κ₁,κ₂>0; m,a indicano i dati della prima. N₁,N₂ sono le normali. Quale rapporto N₂/N₁ segue?',['κ₁κ₂','κ₁(g+κ₂a)/[2(g+a)]','κ₁(g+κ₂a)/(g+a)','κ₁(g+a)/(g+κ₂a)','κ₁(g+κ₂a)/a'],
 'Il fattore della massa moltiplica tutta la lettura. Il fattore dell’accelerazione, invece, moltiplica soltanto a e non il campo gravitazionale, che rimane lo stesso. Scriviamo entrambe le normali e cancelliamo la massa iniziale nel rapporto.',
 r'N_1=m(g+a)\qquad N_2=\kappa_1m(g+\kappa_2a)\qquad N_2/N_1=\frac{\kappa_1(g+\kappa_2a)}{g+a}',
 'κ₁κ₂ scalerebbe anche il termine mg. Il mezzo supplementare non deriva da alcuna forza; invertire le parentesi scambia l’effetto del cambiamento di a. L’ultimo denominatore a trascura il contributo g della prima lettura. Con κ₂=1 rimane soltanto κ₁, come richiede una variazione della sola massa.', 'Il parametro g non viene moltiplicato perκ₂.'),
('Massa e accelerazione entrambe diverse',SCENE+'Le due prove hanno (m₁=40 kg,a₁=2 m/s²) e (m₂=60 kg,a₂=4 m/s²). Quanto vale N₂/N₁?',['7/4','4/7','3/2','2','7/2'],
 'La prima lettura è40·12=480N; la seconda60·14=840N. Riduciamo la frazione840/480: cancellando120 otteniamo7/4. Il risultato combina un fattore3/2 di massa con un fattore7/6 di g+a.',
 r'N_1=480\,\mathrm N\qquad N_2=840\,\mathrm N\qquad N_2/N_1=840/480=7/4',
 '4/7 inverte il rapporto,3/2 considera soltanto la massa e due soltanto a.7/2 raddoppia il rapporto corretto. La frazione7/4 è esatta e adimensionale, senza bisogno di una lettura decimale.', 'Puoi semplificare840/480 dividendo numeratore e denominatore per120.'),
('La media delle forze lette',SCENE+'Due prove separate hanno (m=40 kg,a=2 m/s²) e (m=60 kg,a=4 m/s²). Qual è la media aritmetica delle due normali con uguale peso statistico?',['650 N','480 N','660 N','1320 N','330 N'],
 'Calcoliamo prima480N e840N. Per la media possiamo dimezzare separatamente le letture:240+420=660N. Non stiamo leggendo la bilancia con massa e accelerazione medie: quei dati50kg e3m/s² darebbero650N, perché il prodotto m·a lega i due ingressi.',
 r'N_1=480\,\mathrm N\qquad N_2=840\,\mathrm N\qquad \overline N=\frac{480+840}{2}\,\mathrm N=(240+420)\,\mathrm N=660\,\mathrm N',
 '650N appartiene al modello applicato agli ingressi medi;480N usa una sola prova;1320N è la somma e330N dimezza ancora la media. La media corretta cade fra le due letture e mantiene l’unità di forza.', 'Media le uscite già calcolate, ciascuna con peso1/2.'),
('Scegliere l’accelerazione per una nuova persona',SCENE+'La prima prova ha m₁=40 kg,a₁=2 m/s². Nella seconda si impone m₂=60 kg e si vuole N₂=(7/4)N₁. Quanto vale a₂/a₁?',2,
 'La normale iniziale480N, moltiplicata per7/4, dà840N: prima480/4=120, poi120·7=840. Per la massa nuova60kg la somma g+a₂ deve valere14m/s². Sottraendo g troviamo a₂=4m/s² e poi il rapporto con i due iniziali.',
 r'N_2=\frac74(480\,\mathrm N)=840\,\mathrm N\qquad g+a_2=N_2/m_2=14\,\mathrm{m/s^2}\qquad a_2=(14-10)\,\mathrm{m/s^2}=4\,\mathrm{m/s^2}\qquad a_2/a_1=2',
 'a₂ è positiva e N₂ supera il nuovo peso600N, quindi il contatto è coerente. Moltiplicare a₁ direttamente per7/4 ignorerebbe il cambio della massa e il termine g: l’obiettivo riguarda N, non a da sola.', 'Ricava a₂=N₂/m₂−g dopo aver trovato la forza obiettivo.'),
('Una taratura proporzionale della forza',SCENE+'Un secondo display ideale legge S=qN, continuo e adimensionale, con q>0 costante e offset nullo. Il riferimento m=40 kg,a=2 m/s² dà S=1440. La nuova prova dà S=2520 e a=4 m/s². Quanto vale m nella nuova prova in kg?',60,
 'Il riferimento corrisponde a N=480N, perciò q=1440/480=3N⁻¹. La nuova lettura equivale a2520/3=840N. Dividiamo poi questa forza per g+a=14m/s²:840/14=60kg.',
 r'q=\frac{1440}{480\,\mathrm N}=3\,\mathrm{N^{-1}}\qquad N=\frac{2520}{q}=840\,\mathrm N\qquad m=\frac{N}{g+a}=\frac{840\,\mathrm N}{14\,\mathrm{m/s^2}}=60\,\mathrm{kg}',
 'La lettura S non è direttamente una massa né una forza in SI. Il controllo completo è60·14=840N e3·840=2520. La normale positiva è maggiore del peso600N, come richiesto da accelerazione verso l’alto e contatto mantenuto.', 'Taratura prima: converti2520 in newton.'),
('Riconoscere l’offset di una seconda lettura',SCENE+'Un secondo display ideale dà S=qN+c, continuo e adimensionale, con q>0,c costanti. I riferimenti (m=40 kg,a=2 m/s²) e (m=60 kg,a=4 m/s²) danno S=961 e1681. La prova ignota ha a=2 m/s²,S=1441. Quanto vale m?',['59 kg','60 kg','120 kg','30 kg','61 kg'],
 'I riferimenti fisici sono480e840N. Le differenze sono720nelle letture e360N nelle forze: q=2N⁻¹. Dal primo riferimento c=961−2·480=1. Tolto l’offset,1440diviso2 dà720N; dividendo per12m/s² si trova60kg.',
 r'q=\frac{1681-961}{(840-480)\,\mathrm N}=\frac{720}{360}\,\mathrm{N^{-1}}=2\,\mathrm{N^{-1}}\qquad c=961-2\times480=1\qquad N=\frac{1441-1}{q}=720\,\mathrm N\qquad m=\frac{720}{12}\,\mathrm{kg}=60\,\mathrm{kg}',
 '120e30kg raddoppiano o dimezzano la massa corretta.59e61kg, a questa accelerazione, darebbero letture1417e1465, distanti 24 unità strumentali da 1441. La massa60kg restituisce S=2·[60·(10+2)]+1=1441. Usare rapporti delle letture grezze non eliminerebbe c.', 'Sottrai le letture di riferimento prima di cercare q e c.'),
('Un vincolo quadratico fra prove',SCENE+'Si selezionano prove con m=ka, dove k=20 kg·s²/m è fisso. Il vincolo collega persone e prove diverse; ciascuna mantiene massa costante. Si misura N=480 N. Quanto vale a>0?',['1 m/s²','3 m/s²','−2 m/s²','2 m/s²','4 m/s²'],
 'Sostituiamo m=ka nella normale: N=ka(g+a). Per svolgere il conto senza mescolare unità, poniamo u=1m/s² e x=a/u, numero puro. Si ha g=10u e k=20kg/u; l’equazione diventa480=20x(x+10), cioè x²+10x−24=0. Per fattorizzare scegliamo 12 e −2, che hanno prodotto −24 e somma 10. Questo evita qualsiasi approssimazione della formula quadratica. Le due radici sono alternative, non valori simultanei della stessa x.',
 r'u=1\,\mathrm{m/s^2}\qquad x=a/u\qquad N=ka(g+a)\qquad x(x+10)=24\qquad x^2+10x-24=0\qquad (x-2)(x+12)=0\qquad x=2\qquad x=-12\qquad a=2u=2\,\mathrm{m/s^2}\qquad m=ka=40\,\mathrm{kg}',
 'Il ramo−12 viola a>0 e renderebbe negativa la massa, quindi resta una sola soluzione. L’alternativa−2 viola anch’essa il dominio, ma non è neppure una radice. Le alternative1,3,4m/s² darebbero sotto il vincolo rispettivamente N220,780,1120N. La soluzione dà480N>mg400N, compatibile con il contatto.', 'Riduci a una quadratica nel numero puro x=a/(1m/s²).')]
CHOICES={2:4,3:2,4:0,7:3,8:4,9:3,10:2,11:0,12:2,15:1,16:3}
UNITS={1:'N',5:'kg',6:'m/s²',13:'1',14:'kg'}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/elevator-apparent-weight-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-elevator-apparent-weight-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':3220+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'elevator-apparent-weight','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Usa il riferimento esterno inerziale: N−mg=ma, con contatto mantenuto.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Seconda legge di Newton','Peso apparente e contatto in ascensore'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,9):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe per m=40 kg,a=2 m/s²,g=10 m/s²: peso400 N e normale480 N sulla persona; risultante80 N verso alto; accelerazione2 m/s². Forze a0,25 px/N; accelerazione a40 px per m/s², scala di dimensione diversa. Risultante e accelerazione in pannelli separati dalle forze reali.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.elevator_apparent_weight_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'elevator-apparent-weight-032.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'elevator-apparent-weight-032-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
