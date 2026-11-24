"""Author ideal Atwood drafts with explicit branches, mass domain and tension."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Nel riferimento inerziale del laboratorio due masse costanti M>m>0 pendono da una fune ideale tesa, inestensibile e di massa nulla, su una carrucola fissa senza massa e senza attrito. Agiscono solo peso e tensione sulle masse; g=10 m/s² è uniforme. Rilasciate da ferme, prima di qualunque fine corsa M accelera in basso e m in alto, con uguale modulo A. La tensione T ha lo stesso modulo nei due rami. '
TASKS=[
('Due equazioni, una tensione interna',SCENE+'Con M=4 kg e m=1 kg, quanto vale A in m/s²?',6,
 'Per M scegliamo positivo il basso, per m positivo l’alto. Le rispettive risultanti sono Mg−T e T−mg. Entrambe sono massa per lo stesso modulo A imposto dalla fune. Sommiamo le due equazioni: la tensione si elimina e la differenza dei pesi accelera la somma delle masse.',
 r'Mg-T=MA\qquad T-mg=mA\qquad (M-m)g=(M+m)A\qquad A=g\frac{M-m}{M+m}=10\frac{4-1}{4+1}\,\mathrm{m/s^2}=6\,\mathrm{m/s^2}',
 'A è minore di g, come deve accadere con entrambe le masse positive. La tensione non è nulla: dal lato leggero T=m(g+A)=16N e dal lato pesante T=M(g−A)=16N. Le risultanti sono invece24N e6N, diverse fra loro perché accelerano masse diverse con lo stesso A.', 'Somma le equazioni dei due corpi per eliminare T.'),
('Un rapporto di masse moltiplica g','In una macchina di Atwood ideale con masse M>m>0 e campo uniforme g, il modulo dell’accelerazione è A=g(M−m)/(M+m). Quale unità SI esprime A?',['m','N','m/s²','kg','s'],
 'Numeratore e denominatore del rapporto hanno entrambi dimensione di massa. Il loro quoziente è puro e non cambia la dimensione di g. L’accelerazione del sistema resta quindi una lunghezza divisa per tempo al quadrato.',
 r'\left[\frac{M-m}{M+m}\right]=1\qquad [A]=[g]=L/T^2',
 'm/s² è corretto. kg misura una massa, N una forza, m una lunghezza e s una durata. Il fatto che il moto sia causato dai pesi non trasforma l’accelerazione in una forza: per ottenerne una occorrerebbe ancora moltiplicare per la massa del corpo scelto.', 'Controlla prima che il rapporto delle masse sia adimensionale.'),
('Tensione e peso sul lato pesante',SCENE+'P=Mg è il peso della massa maggiore. Quale confronto fra T e P è corretto?',['T=2P','T<P','T=P','T>P','T=0 necessariamente'],
 'La massa maggiore accelera verso il basso, quindi il peso deve superare la tensione che tira verso l’alto. Scrivendo Newton con basso positivo, P−T=MA>0. Inoltre il lato leggero richiede T=m(g+A)>0: la fune non è priva di tensione.',
 r'P-T=MA>0\qquad T=P-MA<P\qquad T=m(g+A)>0',
 'T=P darebbe risultante nulla sul corpo maggiore e nessuna sua accelerazione. T>P o T=2P darebbero accelerazione verso l’alto, contraria al caso dichiarato. T=0 non potrebbe accelerare verso l’alto una massa m positiva contro il suo peso. L’ideale riguarda le masse di fune e carrucola, non l’annullamento della tensione.', 'Guarda il segno della risultante P−T sul corpo che accelera in basso.'),
('Aumentare la massa maggiore',SCENE+'Due prove separate mantengono m=1 kg e usano M₁=4 kg,M₂=6 kg. Come cambia A?',['Aumenta da 6 a 50/7 m/s²','Resta 6 m/s²','Diminuisce da 6 a 30/7 m/s²','Diventa 10 m/s²','Diventa −50/7 m/s²'],
 'Nella prima prova il rapporto differenza/somma è3/5 e dà6m/s². Nella seconda è5/7, perciò A₂=50/7m/s². Il confronto è esatto:50/7>6 perché50>42. Non serve una divisione decimale.',
 r'A_1=10\frac{4-1}{4+1}\,\mathrm{m/s^2}=6\,\mathrm{m/s^2}\qquad A_2=10\frac{6-1}{6+1}\,\mathrm{m/s^2}=\frac{50}{7}\,\mathrm{m/s^2}\qquad 50>6\times7',
 '30/7 cambierebbe solo il denominatore mantenendo il vecchio numeratore3. L’invariabilità ignora il maggiore squilibrio di pesi. Il valore10 richiederebbe il limite di massa leggera nulla, escluso da m>0; il valore negativo non è un modulo. Aumentare M aumenta A, ma non la rende proporzionale a M.', 'Ricalcola sia la differenza sia la somma delle masse.'),
('Dall’accelerazione alla massa maggiore',SCENE+'Si misurano A=6 m/s² e m=1 kg. Quanto vale M in kg?',4,
 'Partiamo da A(M+m)=g(M−m). Portiamo i termini con M dalla stessa parte e quelli con m dall’altra. Si ottiene (g−A)M=(g+A)m. La differenza g−A è positiva; la misura6è fra0e10m/s² e permette una massa finita positiva maggiore di m.',
 r'AM+Am=gM-gm\qquad (g-A)M=(g+A)m\qquad M=m\frac{g+A}{g-A}\qquad M=(1\,\mathrm{kg})\frac{16\,\mathrm{m/s^2}}{4\,\mathrm{m/s^2}}=4\,\mathrm{kg}',
 'Il rapporto delle accelerazioni al numeratore e denominatore è puro. Il risultato rispetta4>1>0 e ricostruisce A=10·3/5=6m/s². A=g annullerebbe il denominatore e non sarebbe una misura compatibile con due masse finite strettamente positive.', 'Raccogli M con il coefficiente positivo g−A.'),
('La tensione dal lato che sale',SCENE+'In questa prova M=3 kg,m=1 kg e si misura A=5 m/s². Quanto vale T?',['30 N','20 N','15 N','10 N','5 N'],
 'Isoliamo il blocco leggero e scegliamo alto positivo: T−mg=mA. La tensione deve bilanciare i dieci newton del peso e lasciare cinque newton di risultante verso l’alto. Sommando i due contributi troviamo15N.',
 r'T-mg=mA\qquad T=m(g+A)\qquad T=(1\,\mathrm{kg})(15\,\mathrm{m/s^2})=15\,\mathrm N\qquad Mg-T=30\,\mathrm N-15\,\mathrm N=15\,\mathrm N=MA',
 '5N è la risultante del corpo leggero,10N il suo peso e30N il peso del corpo maggiore.20N sarebbe la media dei due pesi, che non è la tensione ricavata da Newton. L’altro lato conferma lo stesso T e la stessa accelerazione senza confondere tensione con risultante.', 'La tensione supera il peso del blocco che accelera verso l’alto.'),
('Aumentare il contrappeso leggero',SCENE+'Due prove hanno M=4 kg e rispettivamente m₁=1 kg,m₂=2 kg. Quanto vale A₂/A₁?',['5/9','9/5','1/2','2/3','−5/9'],
 'La prima accelerazione è6m/s². Nella seconda il peso motore dipende dalla differenza4−2 e la massa totale dalla somma4+2: A₂=10·2/6=10/3m/s². Dividendo per6 si ottiene10/18=5/9.',
 r'A_1=6\,\mathrm{m/s^2}\qquad A_2=10\frac{4-2}{4+2}\,\mathrm{m/s^2}=\frac{10}{3}\,\mathrm{m/s^2}\qquad A_2/A_1=\frac{10}{3}\frac16=\frac59',
 '9/5 inverte il rapporto;1/2 usa direttamente il raddoppio di m come se A fosse inversamente proporzionale a m.2/3 considera soltanto la differenza dei pesi2/3, omettendo il nuovo totale. Il segno negativo viola il modulo e M>m mantenuti nelle due prove.', 'Il contrappeso modifica contemporaneamente differenza e somma.'),
('Una proposta superiore a g',SCENE+'Con M=4 kg,m=1 kg si propone A_proposto=12 m/s². Quanto vale proposto meno corretto?',['+6 m/s²','+12 m/s²','−6 m/s²','0 m/s²','+3 m/s²'],
 'L’accelerazione corretta è10·(4−1)/(4+1)=6m/s². La proposta12supera anche g, già incompatibile con il rapporto positivo (M−m)/(M+m)<1. Lo scarto richiesto si calcola comunque nell’ordine assegnato:12−6=+6m/s².',
 r'A=10\frac35\,\mathrm{m/s^2}=6\,\mathrm{m/s^2}\qquad 0<A<g\qquad e=(12-6)\,\mathrm{m/s^2}=+6\,\mathrm{m/s^2}',
 '−6 inverte la sottrazione,12 ripete la proposta,zero la accetta e3dimezza lo scarto. Il controllo A<g segue da entrambe le masse strettamente positive e non richiede conoscere la tensione numericamente.', 'Verifica il valore e il limite fisico A<g.'),
('L’inversa ammette solo 0<A<g',SCENE+'Una misura nota A nel dominio0<A<g e la massa m. Quale formula isola M da A=g(M−m)/(M+m)?',['M=m(g−A)/(g+A)','M=2m(g+A)/(g−A)','M=mA/g','M=m(g+A)/(g−A)','M=m(g+A)/[2(g−A)]'],
 'Moltiplichiamo per M+m, distribuiamo A e raccogliamo i termini con M. Il coefficiente g−A è positivo nel dominio dichiarato. La divisione produce una massa positiva; inoltre il rapporto(g+A)/(g−A)>1 garantisce M>m.',
 r'A(M+m)=g(M-m)\qquad AM+Am=gM-gm\qquad (g-A)M=(g+A)m\qquad M=m\frac{g+A}{g-A}',
 'Il rapporto invertito darebbe M<m. Il fattore due o un mezzo aggiunti cambierebbero la massa senza soddisfare l’equazione generale. mA/g sarebbe minore di m e ometterebbe i termini di somma. Le unità di accelerazione si cancellano nel rapporto: non si sommano numeri puri a masse.', 'Dopo aver eliminato il denominatore, raccogli i termini con M.'),
('Confrontare differenze e somme',SCENE+'Nella seconda prova M₂=κ₁M,m₂=κ₂m, con κ₁,κ₂>0 e κ₁M>κ₂m. Definiamo D=M−m,S=M+m,D₂=κ₁M−κ₂m,S₂=κ₁M+κ₂m. A₁ e A₂ sono i moduli delle accelerazioni nelle due prove. Quale rapporto A₂/A₁ segue?',['κ₁ / κ₂','D₂ S / (S₂ D)','D₂ / D','S₂ / S','2 D₂ S / (S₂ D)'],
 'L’accelerazione è g per differenza su somma. Quindi A₁=gD/S e A₂=gD₂/S₂. Nel rapporto g si cancella e il divisore D/S si capovolge. D e D₂ sono positivi per i vincoli sulle masse: non ci sono zeri al denominatore.',
 r'A_1=g\frac DS\qquad A_2=g\frac{D_2}{S_2}\qquad \frac{A_2}{A_1}=\frac{D_2}{S_2}\frac SD=\frac{D_2S}{S_2D}',
 'κ₁/κ₂ non descrive il rapporto di differenza e somma. D₂/D trascura il cambiamento dell’inerzia totale; S₂/S considera solo quella e nel verso sbagliato. Il fattore due supplementare non deriva dalla presenza di due masse. Se κ₁=κ₂, differenza e somma scalano ugualmente e A₂/A₁=1: l’accelerazione non fissa la scala assoluta delle masse.', 'Dividi le due frazioni gD/S e gD₂/S₂.'),
('Un sistema più pesante può accelerare meno',SCENE+'Le due prove hanno (M₁=4 kg,m₁=1 kg) e (M₂=6 kg,m₂=2 kg). Quanto vale A₂/A₁?',['5/6','6/5','4/3','8/5','1'],
 'La prima differenza è3kg su totale5kg, quindi A₁=6m/s². La seconda differenza è4kg su totale8kg, quindi A₂=5m/s². Sebbene lo squilibrio dei pesi aumenti, cresce ancora di più la massa totale da accelerare.',
 r'A_1=10\frac35\,\mathrm{m/s^2}=6\,\mathrm{m/s^2}\qquad A_2=10\frac48\,\mathrm{m/s^2}=5\,\mathrm{m/s^2}\qquad A_2/A_1=5/6',
 '6/5 inverte il confronto;4/3 confronta soltanto le differenze e8/5 soltanto i totali. Uno presume una scala uniforme di entrambe le masse, mentre M cresce di3/2e m di2. Il rapporto corretto è minore di1, coerentemente con5<6.', 'Calcola il rapporto differenza/somma in ogni prova.'),
('Media delle accelerazioni di due apparati',SCENE+'Due prove hanno (M=4 kg,m=1 kg) e (M=6 kg,m=2 kg). Qual è la media aritmetica delle accelerazioni con uguale peso statistico?',['70/13 m/s²','11 m/s²','11/4 m/s²','11/2 m/s²','1 m/s²'],
 'Le due accelerazioni sono6e5m/s². La somma vale11e la media esatta è11/2m/s². È una media fra due uscite, non il risultato di una macchina costruita usando separatamente le due masse medie.',
 r'A_1=6\,\mathrm{m/s^2}\qquad A_2=5\,\mathrm{m/s^2}\qquad \overline A=\frac{6+5}{2}\,\mathrm{m/s^2}=\frac{11}{2}\,\mathrm{m/s^2}',
 '11è la somma,11/4dimezza ancora e1è la differenza. Le masse medie M=5kg,m=3/2kg darebbero10·(7/2)/(13/2)=70/13m/s², non la media richiesta. La risposta11/2sta fra5e6e rimane inferiore a g.', 'Somma i due valori6e5e assegna metà peso a ciascuno.'),
('Scegliere la nuova massa minore',SCENE+'La prima prova ha M₁=4 kg,m₁=1 kg. Nella seconda si impone M₂=6 kg e si vuole A₂=(5/6)A₁. Quanto deve valere m₂/m₁?',2,
 'La prima accelerazione6m/s² moltiplicata per5/6dà5m/s². Per isolare questa volta m₂, moltiplichiamo la legge per M₂+m₂ e raccogliamo: (g+A₂)m₂=(g−A₂)M₂. Il nuovo contrappeso vale6·5/15=2kg.',
 r'A_2=5\,\mathrm{m/s^2}\qquad A_2(M_2+m_2)=g(M_2-m_2)\qquad (g+A_2)m_2=(g-A_2)M_2\qquad m_2=M_2\frac{g-A_2}{g+A_2}=6\frac5{15}\,\mathrm{kg}=2\,\mathrm{kg}\qquad m_2/m_1=2',
 'La condizione6>2>0 è rispettata e10·(6−2)/(6+2)=5m/s² verifica l’obiettivo. Il denominatore g+A₂ è positivo; il numeratore g−A₂ positivo garantisce il contrappeso fisico. Non basta moltiplicare m₁per5/6, perché cambiano sia differenza sia somma.', 'Usa l’inversa della massa minore, non quella di M.'),
('Convertire la lettura prima dell’inversa',SCENE+'Un display ideale legge S=qA, continuo e adimensionale, con q>0 costante e offset nullo. Il riferimento M=4 kg,m=1 kg dà S=18. La nuova prova dà S=15 e m=2 kg. Quanto vale M nella nuova prova in kg?',6,
 'Il riferimento ha A=6m/s²: q=18/6=3s²/m. La lettura15equivale ad A=5m/s², che appartiene al dominio0<A<g. Ricostruiamo M con m(g+A)/(g−A); il rapporto15/5è3, da moltiplicare per i2kg del contrappeso.',
 r'q=\frac{18}{6\,\mathrm{m/s^2}}=3\,\mathrm{s^2/m}\qquad A=\frac{15}{q}=5\,\mathrm{m/s^2}\qquad M=m\frac{g+A}{g-A}=(2\,\mathrm{kg})\frac{15}{5}=6\,\mathrm{kg}',
 'I dati ricostruiti6kg e2kg producono A=5m/s² e S=3·5=15. Non si usa la lettura15come accelerazione SI: supererebbe g e renderebbe impossibile il dominio dichiarato, segnalando proprio la conversione mancante.', 'Trova q dal riferimento e controlla0<A<g prima dell’inversa.'),
('Un offset con lettura frazionaria',SCENE+'Un display ideale legge S=qA+c, continuo e adimensionale, con q>0,c costanti. I riferimenti (M=4 kg,m=1 kg) e (M=6 kg,m=2 kg) danno S=13 e11. La prova ignota ha m=1 kg,S=107/7. Quanto vale M?',['12 kg','3 kg','7 kg','5 kg','6 kg'],
 'Le accelerazioni di riferimento6e5m/s² diminuiscono insieme alle letture13e11. Il rapporto delle differenze negative è positivo: q=(11−13)/(5−6)=2s²/m. Dal primo riferimento c=1. Correggendo la nuova lettura,107/7−1=100/7; dividere per2dà A=50/7m/s². L’inversa si semplifica senza decimalizzare.',
 r'q=2\,\mathrm{s^2/m}\qquad c=13-2\times6=1\qquad A=\frac{107/7-1}{q}=\frac{50}{7}\,\mathrm{m/s^2}\qquad g+A=\frac{120}{7}\,\mathrm{m/s^2}\qquad g-A=\frac{20}{7}\,\mathrm{m/s^2}\qquad M=(1\,\mathrm{kg})\frac{120/7}{20/7}=6\,\mathrm{kg}',
 'Il rapporto delle due frazioni è120/20=6e A<g perché50<70.12e3kg raddoppiano o dimezzano la massa corretta;7kg darebbe S=16, mentre5kg darebbe S=43/3, entrambe diverse da107/7. Il controllo per M6,m1restituisce A=50/7e S=2·50/7+1=107/7.', 'Sottrai1come7/7e semplifica il rapporto delle frazioni con denominatore7.'),
('Un’accelerazione non determina la scala delle masse',SCENE+'Le prove selezionate rispettano M=4m, con4fattore puro, e si misura A=6 m/s². Quante coppie positive (M,m) sono compatibili? Il vincolo confronta prove diverse, con masse costanti in ciascuna.',['Esattamente due coppie','Solo la coppia M=m=0','Infinite coppie positive','Una sola coppia positiva','Nessuna coppia positiva'],
 'Sostituendo M=4m nella legge, il fattore m si cancella perché è positivo. L’accelerazione dipende solo dal rapporto fissato delle masse e coincide già con la misura. Il valore assoluto di m non è determinato da un’informazione che ripete lo stesso vincolo.',
 r'A=g\frac{4m-m}{4m+m}=g\frac{3m}{5m}=\frac35g=6\,\mathrm{m/s^2}\qquad m>0\qquad M=4m',
 'M4kg,m1kg e M8kg,m2kg sono due esempi, non le sole coppie. Ogni altro m positivo genera una nuova coppia con M>m. La coppia nulla è esclusa e annullerebbe il denominatore della legge. La lettura A compatibile conferma il rapporto ma non introduce una seconda equazione indipendente sulla scala delle masse.', 'Sostituisci M=4m prima di tentare una ricostruzione numerica.')]
CHOICES={2:2,3:1,4:0,6:2,7:0,8:0,9:3,10:1,11:0,12:3,15:4,16:2}
UNITS={1:'m/s²',5:'kg',13:'1',14:'kg'}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/atwood-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-atwood-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':3420+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'atwood','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Distingui tensione e risultante; con M>m>0 il modulo soddisfa0<A<g.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Macchina di Atwood ideale','Seconda legge di Newton e tensione'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,9):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe per M=4 kg,m=1 kg,g=10 m/s²: fune tesa su carrucola fissa ideale; diagrammi con pesi40 N e10 N e tensione comune16 N; equazioni con A=6 m/s². Forze a3 px/N: pesi120 e30 px, tensioni48 px. Schema geometrico senza scala spaziale; risultanti e tensioni distinte.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.atwood_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'atwood-034.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'atwood-034-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
