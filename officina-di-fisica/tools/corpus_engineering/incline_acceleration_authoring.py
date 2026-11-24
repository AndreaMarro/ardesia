'Author exact incline-acceleration drafts; independent review is still open.'
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Nel riferimento inerziale del laboratorio un corpo di massa costante m>0 scivola su un piano fisso liscio, restando in contatto. Agiscono solo peso e normale. Il campo g>0 è uniforme e l’inclinazione θ è costante nella prova, con 0<θ<π/2. È dato il rapporto s=sinθ, quindi 0<s<1: non occorre ricavare θ. L’asse parallelo è positivo verso il basso e A è il modulo dell’accelerazione in quel verso. '
TASKS=[
('La componente che fa accelerare lungo il piano',SCENE+'Con g=10 m/s² e s=1/2, quanto vale A in m/s²?',5,
 'Il peso non è tutto parallelo al piano. La sua componente lungo la discesa è mgs, mentre la normale è perpendicolare e non entra in questa equazione. Newton dà mA=mgs. La massa positiva si cancella: a parità di campo e inclinazione il modulo A non dipende da quanto pesa il corpo.',
 r'P_{\parallel}=mgs\qquad mA=mgs\qquad A=gs\qquad A=10\times\frac12\,\mathrm{m/s^2}\qquad A=5\,\mathrm{m/s^2}',
 'A è minore di g, perché il rapporto s è fra zero e uno. Non è una caduta libera verticale: il vincolo elimina l’accelerazione perpendicolare. Il verso dell’accelerazione è in discesa anche se il corpo fosse momentaneamente in moto verso l’alto; il verso della velocità non è stato assegnato.', 'Proietta il peso lungo il piano prima di dividere per la massa.'),
('Il seno non introduce un’unità di misura','Nel modello di un piano liscio l’accelerazione lungo il piano vale A=gs, dove g è un’accelerazione e s=sinθ è un rapporto puro. Quale unità SI è adatta ad A?',['m','N','m/s²','kg','s'],
 'Il seno è il rapporto fra due lunghezze in un triangolo e non porta una dimensione fisica. Moltiplicare g per s cambia il valore, ma lascia invariata l’unità di accelerazione. Non compare qui un angolo da convertire in radianti o da valutare con una calcolatrice.',
 r'[s]=1\qquad [A]=[g][s]=L/T^2',
 'm/s² è corretto. N misura la componente di forza prima della divisione per massa; kg una massa, m una lunghezza e s una durata. L’unità secondo, scritta s dopo un numero, è distinta dal simbolo s che qui indica il seno.', 'Tratta il seno come un numero puro che moltiplica g.'),
('Due proiezioni, una sola accelerazione tangenziale',SCENE+'Quale relazione dà A?',['A=g/s','A=gs','A=g','A=0','A=gs²'],
 'Scegliamo due assi: uno parallelo al piano e uno normale. La reazione di contatto equilibra soltanto la componente normale del peso. Lungo il piano resta invece mgs: non c’è attrito che la compensi. Dividendo Newton per m>0 otteniamo l’accelerazione richiesta.',
 r'P_{\parallel}=mgs\qquad mA=P_{\parallel}\qquad A=gs',
 'g/s sarebbe maggiore di g nel dominio assegnato; g ignorerebbe l’inclinazione e varrebbe solo per la direzione verticale libera. Zero confonde l’equilibrio perpendicolare con quello lungo il piano. gs² proietta due volte la stessa componente. La normale non è una forza opposta all’intero peso: ha una direzione diversa.', 'La normale non ha una componente lungo un piano liscio.'),
('Stessa pendenza in due campi',SCENE+'Due prove separate mantengono s=1/2 e usano g₁=10 m/s²,g₂=20 m/s². Come cambia A?',['Da 5 a 10 m/s²','Resta 5 m/s²','Da 5 a 20 m/s²','Da 5 a 5/2 m/s²','Diventa zero'],
 'La frazione del campo proiettata lungo il piano resta un mezzo. Se il campo raddoppia fra prove, anche questa componente raddoppia. Ogni prova mantiene il proprio g costante: il confronto non descrive una gravità che cambia nel tempo durante la discesa.',
 r'A_1=10\times\frac12\,\mathrm{m/s^2}\qquad A_1=5\,\mathrm{m/s^2}\qquad A_2=20\times\frac12\,\mathrm{m/s^2}\qquad A_2=10\,\mathrm{m/s^2}',
 '20 m/s² usa il nuovo g senza proiezione;5/2 inverte l’effetto del campo. Invariabilità o zero non seguono dalla componente del peso aumentata. La massa non deve essere raddoppiata per ottenere questo risultato: si cancella in entrambe le equazioni.', 'Il rapporto s è identico, quindi segue lo stesso fattore di g.'),
('Dal moto al modulo del campo',SCENE+'Si misurano A=5 m/s² e s=1/2. Quanto vale g in m/s²?',10,
 'Dalla relazione A=gs dividiamo entrambi i membri per s, che è positivo. Dividere per un mezzo significa moltiplicare per due. L’operazione non cambia l’unità di accelerazione, perché s è un rapporto puro.',
 r'g=\frac As\qquad g=5\times2\,\mathrm{m/s^2}\qquad g=10\,\mathrm{m/s^2}',
 'Il controllo 10·(1/2)=5 restituisce A. Moltiplicare invece per s darebbe 5/2 m/s², minore dell’accelerazione sul piano e incompatibile con 0<s<1. Non abbiamo ricavato un angolo: il rapporto necessario alla proiezione era già fornito.', 'Per s=1/2, dividere per s equivale a raddoppiare A.'),
('Ricavare il rapporto geometrico, non l’angolo',SCENE+'Si misurano A=5 m/s² e g=10 m/s². Quanto vale s?',['1/4','−1/2','1/2','2','1'],
 'Isoliamo il rapporto s dividendo A=gs per g>0. Le unità uguali si cancellano:5/10=1/2. La richiesta si ferma al seno dell’inclinazione; non occorre calcolare una funzione trigonometrica inversa o esprimere θ in gradi.',
 r's=\frac Ag\qquad s=\frac{5\,\mathrm{m/s^2}}{10\,\mathrm{m/s^2}}\qquad s=\frac12',
 'Due è il rapporto inverso e supera il limite superiore del seno;−1/2 viola il dominio positivo. Uno richiederebbe un piano verticale, escluso, e darebbe A=g.1/4 dimezza ancora il risultato senza motivo. Il valore 1/2 soddisfa 0<s<1 e ricostruisce A5 m/s².', 'Confronta A con g e conserva il risultato come frazione pura.'),
('Una pendenza espressa da un rapporto maggiore',SCENE+'Due prove hanno g=10 m/s² e rapporti s₁=1/2,s₂=3/5. Quanto vale A₂/A₁?',['3/5','5/6','6/5','12/5','1/5'],
 'La prima accelerazione vale cinque, la seconda sei metri al secondo quadrato. Il rapporto cercato è sei su cinque. Possiamo anche cancellare il campo comune e dividere(3/5) per(1/2): il reciproco del mezzo introduce il fattore due.',
 r'A_1=5\,\mathrm{m/s^2}\qquad A_2=6\,\mathrm{m/s^2}\qquad \frac{A_2}{A_1}=\frac{3/5}{1/2}\qquad \frac{A_2}{A_1}=\frac65',
 '3/5 ripete il secondo seno;5/6 inverte il confronto;12/5 raddoppia ancora il rapporto.1/5 è l’aumento relativo(6−5)/5, non il rapporto finale su iniziale. Non si confrontano direttamente i due angoli: la legge usa i loro seni già dati.', 'La seconda accelerazione è 6 m/s², da confrontare con 5 m/s².'),
('Una proposta uguale a g',SCENE+'Con g=10 m/s²,s=1/2, viene proposto A_proposto=10 m/s². Quanto vale lo scarto proposto meno corretto?',['+5 m/s²','+10 m/s²','−5 m/s²','0 m/s²','+5/2 m/s²'],
 'La componente corretta è metà di g, cioè 5 m/s². La proposta tratta il vincolo come se il corpo fosse in caduta libera verticale. Nell’ordine richiesto sottraiamo 5 da 10 e otteniamo uno scarto positivo di 5 m/s².',
 r'A=5\,\mathrm{m/s^2}\qquad e=(10-5)\,\mathrm{m/s^2}\qquad e=+5\,\mathrm{m/s^2}',
 '−5 inverte l’ordine,10 ripete la proposta,zero la dichiara corretta e 5/2 dimezza ancora lo scarto. Il segno positivo indica sovrastima del modulo; la scelta del verso dell’asse lungo il piano è già stata fissata.', 'Prima proietta g, poi sottrai il risultato dalla proposta.'),
('Un’inversa senza trigonometria inversa',SCENE+'Quale formula isola g dalla relazione A=gs?',['g=A/s','g=As','g=s/A','g=2 A/s','g=A/(2 s)'],
 's moltiplica g ed è diverso da zero. Dividiamo l’uguaglianza per s, mantenendo visibile che si tratta del seno e non dell’unità secondo. Poiché 0<s<1, il campo ricostruito deve risultare maggiore di A.',
 r'\frac As=g\qquad g=\frac As\qquad 0<A<g',
 'As moltiplica invece di dividere e produrrebbe un valore minore di A. s/A ha dimensione inversa di accelerazione. Il due aggiunto o tolto non appartiene alla proiezione del peso. La formula isola g senza cercare θ: il dato geometrico utile era s.', 'Dividi per il rapporto puro s, non per una durata.'),
('Cambiare campo e rapporto di pendenza',SCENE+'Nella seconda prova g₂=κ₁g e s₂=κ₂s, con κ₁,κ₂>0 e 0<κ₂s<1. g,s sono i dati della prima. Quale rapporto A₂/A₁ segue?',['κ₁/κ₂','κ₂/κ₁','κ₁κ₂','κ₁+κ₂','κ₁κ₂²'],
 'La legge contiene il prodotto di due ingressi. Inserendo i due nuovi fattori troviamo A₂=(κ₁g)(κ₂s). Nel rapporto con A₁=gs si cancellano i dati iniziali positivi, lasciando il prodotto dei fattori. Il limite sul nuovo seno è un vincolo geometrico e non si può dimenticare dopo l’algebra.',
 r'A_1=gs\qquad A_2=\kappa_1\kappa_2gs\qquad A_2/A_1=\kappa_1\kappa_2',
 'I due rapporti trasformano uno degli aumenti in una diminuzione; il quadrato suκ₂ proietta due volte. La somma dà 2 quando entrambi i fattori valgono 1, mentre la prova identica deve dare rapporto 1. Per esempio con s 1/2 non è ammessoκ₂=3, perché produrrebbe un seno 3/2.', 'Moltiplica i fattori, ma verifica anche il dominio del nuovo seno.'),
('Due fattori favorevoli alla discesa',SCENE+'Le prove hanno(g₁=10 m/s²,s₁=1/2) e(g₂=20 m/s²,s₂=3/5). Quanto vale A₂/A₁?',['12/5','5/12','2','6/5','24/5'],
 'La prima proiezione è 5 m/s²; nella seconda 20·(3/5)=4·3=12 m/s². Il rapporto è 12/5. Il campo raddoppia e il seno cresce di 6/5: i due effetti si moltiplicano, non si sommano.',
 r'A_1=5\,\mathrm{m/s^2}\qquad A_2=12\,\mathrm{m/s^2}\qquad A_2/A_1=\frac{12}{5}',
 '5/12 inverte il confronto;2 considera soltanto il campo e 6/5 soltanto il seno.24/5 raddoppia di nuovo la risposta. Le due accelerazioni restano inferiori ai rispettivi campi,5<10 e 12<20, coerentemente con i due seni minori di uno.', 'Semplifica 20 diviso 5 prima di moltiplicare per 3.'),
('Media di due proiezioni del campo',SCENE+'Due prove hanno(g=10 m/s²,s=1/2) e(g=20 m/s²,s=3/5). Qual è la media aritmetica delle accelerazioni con uguale peso statistico?',['17/2 m/s²','17 m/s²','17/4 m/s²','33/4 m/s²','7 m/s²'],
 'Calcoliamo prima le accelerazioni 5 e 12 m/s². La semisomma è 17/2 m/s². Usare prima i due ingressi medi darebbe un’altra operazione: g_medio 15 m/s² e s_medio 11/20 produrrebbero 33/4 m/s², perché la legge contiene un prodotto fra ingressi entrambi variabili.',
 r'A_1=5\,\mathrm{m/s^2}\qquad A_2=12\,\mathrm{m/s^2}\qquad \overline A=\frac{5+12}{2}\,\mathrm{m/s^2}\qquad \overline A=\frac{17}{2}\,\mathrm{m/s^2}',
 '17 è la somma,17/4 divide ancora per due e 7 è la differenza fra le accelerazioni.33/4 è il risultato sui dati medi, non la media richiesta.17/2 sta fra 5 e 12 e rimane una frazione esatta, senza bisogno di decimalizzare.', 'Media le due uscite dopo averle calcolate.'),
('Scegliere la nuova pendenza come rapporto',SCENE+'La prima prova ha g₁=10 m/s²,s₁=1/2. Si impone poi g₂=20 m/s² e si vuole A₂=(12/5)A₁. Quale rapporto s₂/s₁ occorre?',['6/5','5/6','12/5','3/5','2'],
 'L’accelerazione iniziale è 5 m/s², quindi l’obiettivo è 12 m/s². Per il nuovo campo 20 m/s² serve s₂=A₂/g₂=12/20=3/5. Solo adesso dividiamo per il seno iniziale 1/2, ottenendo 6/5. Il problema richiede un rapporto di seni e non una misura in gradi.',
 r'A_2=12\,\mathrm{m/s^2}\qquad s_2=\frac{A_2}{g_2}\qquad s_2=\frac35\qquad s_2/s_1=\frac65',
 '3/5 è il seno nuovo da solo;5/6 inverte il confronto.12/5 copia il rapporto delle accelerazioni ignorando il campo raddoppiato. Due darebbe s₂=1, limite verticale escluso e accelerazione 20 m/s² anziché 12. Il valore 3/5 è nel dominio geometrico richiesto.', 'Distingui s₂ dal rapporto s₂/s₁.'),
('Convertire il display prima di trovare g',SCENE+'Un display ideale fornisce una lettura continua adimensionale S=qA, con q>0 costante e offset nullo. Il riferimento g=10 m/s²,s=1/2 dà S=15. La nuova prova dà S=36 e s=3/5. Quanto vale g in m/s²?',20,
 'Il riferimento ha A=5 m/s², dunque q=15/5=3 s²/m. La lettura 36 diventa A=12 m/s². Per il seno 3/5 la divisione g=A/s equivale a moltiplicare 12 per 5/3: si semplifica 12/3=4 e rimane 20.',
 r'q=3\,\mathrm{s^2/m}\qquad A=\frac{36}{q}\qquad A=12\,\mathrm{m/s^2}\qquad g=\frac As\qquad g=20\,\mathrm{m/s^2}',
 'Il controllo 20·(3/5)=12 m/s² e S=3·12=36 ricostruisce le due tappe. La lettura non è il campo g né una pendenza. g>A soddisfa il vincolo 0<s<1; non è stata richiesta alcuna valutazione di funzioni trigonometriche.', 'Trova A dal riferimento strumentale, poi dividi per s.'),
('Taratura con offset e pendenza nota',SCENE+'Un display ideale legge S=qA+b, continuo e adimensionale, con q>0,b costanti. I riferimenti(g=10 m/s²,s=1/2) e(g=20 m/s²,s=3/5) danno S=11 e 25. La prova ignota ha s=1/2,S=21. Quanto vale g?',['21 m/s²','19 m/s²','20 m/s²','40 m/s²','10 m/s²'],
 'I riferimenti hanno accelerazioni 5 e 12 m/s². La differenza delle letture è 14, quella delle accelerazioni 7 m/s², quindi q=2 s²/m. Dal primo riferimento segue b=11−2·5=1. Togliendo l’offset da 21 e dividendo per due ricostruiamo A=10 m/s²; per s 1/2 il campo è doppio.',
 r'q=\frac{25-11}{(12-5)\,\mathrm{m/s^2}}\qquad q=2\,\mathrm{s^2/m}\qquad b=1\qquad A=\frac{21-1}{q}\qquad A=10\,\mathrm{m/s^2}\qquad g=20\,\mathrm{m/s^2}',
 '21 m/s² deriva dal saltare l’offset prima della divisione per q;19 m/s² darebbe S20 anziché 21.40 raddoppia ancora il campo corretto,10 si ferma al valore dell’accelerazione sul piano. Per g 20,s 1/2 si ritrova S=2·10+1=21.', 'Elimina l’offset prima di usare l’inversa g=A/s.'),
('Un vincolo quadratico fra prove',SCENE+'Si selezionano prove con g=ks, dove k=20 m/s² è fisso. Campo e inclinazione restano costanti dentro ciascuna prova: il vincolo collega prove diverse. Si misura A=5 m/s². Quanto vale s?',['3/2','−1/2','1/2','1','1/4'],
 'Inserendo g=ks nella proiezione A=gs otteniamo A=ks². Dividiamo per k positivo: s²=5/20=1/4, numero puro. La radice positiva di 1/4 è 1/2; la negativa è incompatibile con il seno di un’inclinazione acuta. Ricostruiamo poi g=ks.',
 r'A=ks^2\qquad s^2=\frac Ak\qquad s^2=\frac14\qquad s=\frac12\qquad g=ks\qquad g=10\,\mathrm{m/s^2}',
 '3/2 supera il limite del seno,−1/2 viola la positività e 1 è il piano verticale escluso. Con s 1/4 il vincolo darebbe A20/16=5/4 m/s², non 5. La soluzione 1/2 è unica nel dominio 0<s<1 e rende A10·1/2=5 m/s². Non si sta introducendo una gravità variabile mentre il corpo scivola.', 'La radice è esatta e il ramo va scelto con 0<s<1.')]
CHOICES={2:2,3:1,4:0,6:2,7:2,8:0,9:0,10:2,11:0,12:0,13:0,15:2,16:2}
UNITS={1:'m/s²',5:'m/s²',14:'m/s²'}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/incline-acceleration-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-incline-acceleration-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':3620+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'incline-acceleration','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Usa il rapporto s già dato; distingui la componente parallela da quella normale.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Piano inclinato liscio','Componenti del peso e seconda legge di Newton'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (3,7):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio di proiezione per la prova con g=10 m/s²,s=3/5 e cosθ=4/5: nel solo disegno si sceglie m=1 kg per mostrare forze di 10, 6 e 8 N. L’accelerazione è 6 m/s² per ogni massa positiva. Geometria 3-4-5, forze a 10 px/N; A a 10 px per m/s² in pannello distinto, con unità diversa.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.incline_acceleration_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'incline-acceleration-036.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'incline-acceleration-036-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
