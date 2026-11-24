"""Author parallel-spring editions; independent review remains open."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Due molle ideali lineari, di costanti positive k₁ e k₂, collegano un supporto fisso a una traversa rigida guidata senza rotazione. Partendo da entrambe indeformate, la traversa impone lo stesso allungamento ℓ>0 alle due molle. Si trascurano le masse di molle e traversa; si considerano equilibri quasistatici nel riferimento inerziale del laboratorio e nessun’altra forza lungo il moto. Tutte le deformazioni sono nel regime lineare. F è il modulo della trazione totale e K è definita da F=Kℓ. '
TASKS=[
('Due richiami che si sommano',SCENE+'Con k₁=k₂=2 N/m, quanto vale K in N/m?',4,
 'Ogni molla sviluppa un richiamo kᵢℓ contro lo stesso allungamento. La trazione deve equilibrare la somma dei due richiami, non una loro media. Raccogliendo la deformazione comune si legge il coefficiente della forza totale: K=k₁+k₂.',
 r'F_1=k_1\ell\qquad F_2=k_2\ell\qquad F=F_1+F_2\qquad F=(k_1+k_2)\ell\qquad K=4\,\mathrm{N/m}',
 'Quattro newton al metro è una rigidezza, non la forza che serve per qualunque allungamento. Per esempio a ℓ=1 m ogni molla darebbe 2 N e la trazione totale sarebbe 4 N. Il gruppo parallelo è più rigido di ciascuna molla positiva.', 'Somma le forze associate alla stessa deformazione.'),
('L’unità della rigidezza equivalente','Due molle ideali in parallelo subiscono lo stesso allungamento ℓ. Si definisce K tramite il modulo totale F=Kℓ. Quale unità SI esprime K?',['N','m','N/m','J','1'],
 'K è forza divisa per deformazione. Un newton per metro indica di quanti newton cambia il richiamo quando l’allungamento cambia di un metro nel regime lineare. Sommare due rigidezze non cambia la loro dimensione.',
 r'K=F/\ell\qquad [K]=M/T^2\qquad [K]=\mathrm{N/m}',
 'N è l’unità della forza, m della deformazione e J di un’energia. Un numero puro non può convertire metri in newton. N/m è anche kg/s², ma non è un’accelerazione, perché manca il metro al numeratore.', 'Dividi l’unità della forza per quella della deformazione.'),
('La condizione di parallelo decide la legge',SCENE+'Quale formula dà K?',['K=k₁+k₂','K=k₁k₂/(k₁+k₂)','K=(k₁+k₂)/2','K=k₁−k₂','K=k₁k₂'],
 'Il vincolo comune è l’allungamento, non la forza su ogni molla. Le due forze possono essere diverse, ma hanno lo stesso verso di richiamo e si sommano. Dividiamo il bilancio totale per ℓ>0 e confrontiamo con la definizione di K.',
 r'K\ell=k_1\ell+k_2\ell\qquad K=k_1+k_2',
 'Il prodotto su somma appartiene alla serie, dove è comune la forza. La media dimezza la rigidezza senza una ragione nel bilancio. La differenza potrebbe dare zero per due molle uguali, pur entrambe resistendo all’allungamento. Il prodotto semplice ha unità (N/m)², diverse da K.', 'Individua prima quale grandezza è imposta uguale alle due molle.'),
('Sostituire soltanto la prima molla',SCENE+'Due prove hanno k₂=2 N/m e rispettivamente k₁,A=2 N/m e k₁,B=4 N/m. Come cambia K?',['Da 4 a 6 N/m','Resta 4 N/m','Da 4 a 8 N/m','Da 4 a 2 N/m','Diventa zero'],
 'La prima rigidezza raddoppia, ma la seconda rimane due. Nella prima somma troviamo quattro, nella seconda sei newton al metro. È quindi sbagliato raddoppiare automaticamente l’intero gruppo: solo uno dei due addendi è cambiato fra prove.',
 r'K_A=(2+2)\,\mathrm{N/m}\qquad K_A=4\,\mathrm{N/m}\qquad K_B=(4+2)\,\mathrm{N/m}\qquad K_B=6\,\mathrm{N/m}',
 'Otto N/m richiederebbe anche k₂=4 N/m. Due N/m diminuirebbe il gruppo quando invece un addendo cresce; zero e invarianza ignorano il richiamo aggiuntivo. Il nuovo valore è ancora maggiore di ciascuna costante.', 'Ricalcola la somma conservando k₂ invariato.'),
('Togliere il contributo noto',SCENE+'Si misura K=4 N/m e si conosce k₂=2 N/m. Quanto vale k₁ in N/m?',2,
 'Nella somma K=k₁+k₂ l’incognita è un addendo. Sottraiamo k₂ da entrambi i membri; le quantità hanno la stessa unità. La soluzione positiva esiste soltanto se K>k₂, condizione soddisfatta dai dati.',
 r'K-k_2=k_1\qquad k_1=K-k_2\qquad k_1=(4-2)\,\mathrm{N/m}\qquad k_1=2\,\mathrm{N/m}',
 'Il controllo 2+2=4 N/m riproduce la rigidezza. Sommare ancora k₂ darebbe 6 N/m per la prima molla e K=8 N/m per il gruppo. Se K fosse uguale o inferiore a k₂, non esisterebbe qui una prima molla con rigidezza strettamente positiva.', 'La costante equivalente contiene già il contributo della seconda molla.'),
('La forza non si divide sempre a metà',SCENE+'Ora k₁=1 N/m,k₂=2 N/m e una trazione totale F=6 N mantiene l’equilibrio. Quanto vale il modulo F₁ della forza esercitata dalla prima molla?',['1 N','2 N','3 N','4 N','6 N'],
 'Prima calcoliamo K=3 N/m. L’allungamento comune è F/K=2 m. La prima molla, più cedevole, esercita allora 1·2=2 N; la seconda 2·2=4 N. La somma è proprio la trazione totale da sei newton.',
 r'K=3\,\mathrm{N/m}\qquad \ell=F/K\qquad \ell=2\,\mathrm m\qquad F_1=k_1\ell\qquad F_1=2\,\mathrm N\qquad F_2=4\,\mathrm N',
 'Tre N dividerebbe il carico a metà, possibile solo per rigidezze uguali. Quattro N è la forza della seconda molla; sei N è quella totale. Uno N confonde il numero della costante con una forza. È uguale la deformazione, non l’intensità dei due richiami.', 'Trova l’allungamento comune prima della forza della singola molla.'),
('Un rapporto fra due somme',SCENE+'Nelle prove A e B k₁=2 N/m; k₂ passa da 2 a 4 N/m. Quanto vale K_B/K_A?',['3/2','2/3','2','1/2','1'],
 'La rigidezza equivalente passa da quattro a sei newton al metro. Dividendo sei per quattro semplifichiamo il fattore due e otteniamo tre mezzi. Il rapporto è puro: non porta l’unità delle due rigidezze che si cancellano.',
 r'K_A=4\,\mathrm{N/m}\qquad K_B=6\,\mathrm{N/m}\qquad K_B/K_A=\frac64\qquad K_B/K_A=\frac32',
 'Due considera solo il raddoppio di k₂. Due terzi inverte il confronto; un mezzo inverte anche l’effetto del cambiamento; uno ignora la nuova molla. La presenza dell’addendo fisso k₁ attenua il fattore di crescita del gruppo.', 'Confronta le rigidezze totali, non solo k₂.'),
('Una proposta doppia della somma corretta',SCENE+'Con k₁=k₂=2 N/m si propone K_proposto=8 N/m. Quanto vale proposto meno corretto?',['+4 N/m','−4 N/m','+8 N/m','0 N/m','+2 N/m'],
 'Il parallelo dà K=2+2=4 N/m. La proposta otto supera di quattro il valore corretto. Manteniamo l’ordine richiesto della sottrazione, che dà uno scarto positivo di rigidezza.',
 r'K=4\,\mathrm{N/m}\qquad e=(8-4)\,\mathrm{N/m}\qquad e=+4\,\mathrm{N/m}',
 '−4 inverte l’ordine, otto ripete la proposta, zero la accetta senza controllo e due dimezza ancora lo scarto. Lo scarto non è una forza: anche dopo la sottrazione conserva l’unità N/m.', 'Calcola prima K dalla somma delle due costanti.'),
('Un’inversa con una condizione di esistenza',SCENE+'Si conoscono K e k₂>0. Quale formula isola k₁, con K>k₂?',['k₁=K−k₂','k₁=K+k₂','k₁=K/k₂','k₁=k₂−K','k₁=K−2k₂'],
 'Sottraiamo k₂ dalla somma K=k₁+k₂. Il dato K>k₂ garantisce k₁ positivo. Questa condizione descrive una proprietà del parallelo, che deve essere più rigido di ogni sua molla positiva.',
 r'K=k_1+k_2\qquad K-k_2=k_1\qquad k_1=K-k_2>0',
 'Il quoziente K/k₂ è puro e non può dare una rigidezza. La somma aggiunge invece di isolare; k₂−K cambia segno. Togliere due volte k₂ perderebbe un contributo che nella legge compare una volta sola.', 'Rimuovi una sola volta il termine noto dalla somma.'),
('Scalare separatamente i due rami',SCENE+'Fra due prove k₁,B=κ₁k₁ e k₂,B=κ₂k₂, con κ₁,κ₂>0. k₁,k₂ indicano A. Quale rapporto K_B/K_A segue?',['(κ₁ k₁ + κ₂ k₂) / (k₁ + k₂)','κ₁ κ₂','κ₁ / κ₂','(κ₁ k₁ + κ₂ k₂) / (2 k₁ + 2 k₂)','(k₁ + k₂) / (κ₁ k₁ + κ₂ k₂)'],
 'Formiamo la nuova somma, applicando ciascun fattore al proprio ramo. La dividiamo per la vecchia somma positiva. I fattori non si possono estrarre entrambi come un prodotto, perché moltiplicano addendi diversi.',
 r'K_A=k_1+k_2\qquad K_B=\kappa_1k_1+\kappa_2k_2\qquad \frac{K_B}{K_A}=\frac{\kappa_1k_1+\kappa_2k_2}{k_1+k_2}',
 'Il prodotto e il quoziente dei soli κ perdono il peso relativo dei due rami. Il denominatore doppio dimezza arbitrariamente; l’ultima opzione inverte il rapporto. Se κ₁=κ₂=κ, il fattore comune si raccoglie e il rapporto diventa κ, non κ².', 'Confronta due somme complete; solo un fattore uguale nei due rami si può raccogliere.'),
('Due molle entrambe due volte più rigide',SCENE+'A ha k₁=k₂=2 N/m; B ha k₁=k₂=4 N/m. Quanto vale K_B/K_A?',2,
 'Entrambi gli addendi raddoppiano. La somma passa da quattro a otto newton al metro: il rapporto è due. Un prodotto di due fattori due sarebbe corretto per una legge moltiplicativa, mentre qui la legge è una somma.',
 r'K_A=4\,\mathrm{N/m}\qquad K_B=8\,\mathrm{N/m}\qquad K_B/K_A=2',
 'Quattro conterebbe il raddoppio due volte come prodotto; otto è il numero della nuova rigidezza, non il rapporto. Un mezzo sarebbe A su B. La proporzionalità comune preserva la forma del gruppo.', 'Raccogli il fattore due fuori dalla nuova somma.'),
('Media delle rigidezze di due gruppi',SCENE+'A usa k₁=k₂=2 N/m e B usa k₁=k₂=4 N/m. Qual è la media aritmetica di K_A,K_B con uguale peso?',['6 N/m','12 N/m','3 N/m','4 N/m','8 N/m'],
 'I due gruppi danno K_A=4 e K_B=8 N/m. La media è (4+8)/2=6 N/m. Qui la legge è lineare nei due ingressi: anche le loro medie k₁=k₂=3 N/m darebbero sei. È una coincidenza strutturale della somma, da giustificare e non da estendere a ogni modello.',
 r'K_A=4\,\mathrm{N/m}\qquad K_B=8\,\mathrm{N/m}\qquad \overline K=\frac{4+8}{2}\,\mathrm{N/m}\qquad \overline K=6\,\mathrm{N/m}',
 'Dodici è la somma, tre dimezza ancora e quattro o otto ripetono una singola prova. La media sei deve stare tra quattro e otto. In questo caso il risultato sulle medie degli ingressi coincide esattamente, perché la media distribuisce sulla somma.', 'Media prima i due risultati; poi puoi spiegare perché qui funziona anche la somma dei dati medi.'),
('Progettare il secondo ramo',SCENE+'A ha k₁,A=k₂,A=2 N/m. Si impone k₁,B=4 N/m e si vuole K_B=2K_A. Quanto vale k₂,B/k₂,A?',2,
 'Il gruppo iniziale vale quattro N/m, quindi l’obiettivo è otto. La prima molla nuova fornisce quattro N/m: restano quattro N/m alla seconda. Rapportando questi quattro ai due iniziali otteniamo due.',
 r'K_B=8\,\mathrm{N/m}\qquad k_{2,B}=K_B-k_{1,B}\qquad k_{2,B}=4\,\mathrm{N/m}\qquad k_{2,B}/k_{2,A}=2',
 'Quattro N/m è la nuova costante, non il rapporto quattro. Lasciare la seconda a due N/m darebbe K_B=6, insufficiente. L’obiettivo supera k₁,B, perciò la seconda molla richiesta è positiva.', 'Sottrai dall’obiettivo il ramo nuovo già fissato.'),
('Convertire il display in una rigidezza',SCENE+'Un display continuo adimensionale legge S=qK, con q>0 costante e offset nullo. Il riferimento k₁=k₂=2 N/m dà S=12. Una prova dà S=24 e k₂=4 N/m. Quanto vale k₁ in N/m?',4,
 'Il riferimento ha K=4 N/m: il guadagno vale 12/(4 N/m)=3 m/N. La lettura 24 rappresenta K=8 N/m. Solo dopo questa conversione sottraiamo i quattro N/m del ramo noto e troviamo la prima costante.',
 r'q=3\,\mathrm{m/N}\qquad K=24/q\qquad K=8\,\mathrm{N/m}\qquad k_1=K-k_2\qquad k_1=4\,\mathrm{N/m}',
 'Il controllo 4+4=8 N/m e S=3·8=24 ricostruisce la lettura. Sottrarre direttamente quattro dal numero 24 sommerebbe una lettura pura e una rigidezza. Anche K>k₂ è verificato.', 'Decodifica la grandezza totale prima di togliere il ramo noto.'),
('Taratura affine e somma dei rami',SCENE+'Un display continuo adimensionale legge S=qK+b, con q>0,b costanti. A: k₁=k₂=2 N/m,S=9. B: k₁=k₂=4 N/m,S=17. C: k₂=2 N/m,S=13. Quanto vale k₁,C?',['2 N/m','3 N/m','4 N/m','5 N/m','8 N/m'],
 'Le rigidezze di riferimento sono quattro e otto N/m. La differenza delle letture è otto su una differenza fisica di quattro N/m: q=2 m/N. Dal primo riferimento b=9−2·4=1. La lettura tredici corrisponde a K_C=6 N/m; sottraendo k₂=2 otteniamo quattro.',
 r'q=2\,\mathrm{m/N}\qquad b=1\qquad K_C=(13-1)/q\qquad K_C=6\,\mathrm{N/m}\qquad k_{1,C}=4\,\mathrm{N/m}',
 'Le alternative k₁=2,3,5,8 N/m con k₂=2 darebbero S=9,11,15,21. Solo quattro riproduce tredici. La taratura richiede prima la sottrazione dell’offset, poi la divisione per il guadagno.', 'Usa entrambi i riferimenti per separare q e b.'),
('Un vincolo che resta lineare',SCENE+'Si selezionano gruppi con k₁=k₂ e si misura K=4 N/m. Quanto vale k₂ in N/m?',2,
 'Il vincolo rende uguali i due addendi. Nella legge del parallelo K=k₁+k₂ diventa K=2k₂, quindi basta dividere quattro per due. Non compare una potenza né una radice: il rapporto imposto è puro e non trasforma una somma in un prodotto.',
 r'K=k_2+k_2\qquad K=2k_2\qquad k_2=K/2\qquad k_2=2\,\mathrm{N/m}',
 'La prima costante è anch’essa due N/m; la ricostruzione dà quattro. Esiste un’unica coppia positiva compatibile con questa misura e con k₁=k₂. Un numero arbitrario di coppie esisterebbe senza il vincolo di uguaglianza, ma non con esso.', 'Sostituisci k₁=k₂ prima di risolvere l’equazione.')]
CHOICES={2:2,3:0,4:0,6:1,7:0,8:0,9:0,10:0,12:0,15:2}
UNITS={1:'N/m',5:'N/m',11:'1',13:'1',14:'N/m',16:'N/m'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/parallel-springs-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-parallel-springs-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':4420+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'parallel-springs','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'In parallelo è uguale la deformazione, mentre le forze dei due rami si sommano.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Molle in parallelo','Deformazione comune e ripartizione delle forze'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (3,6):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio k₁=1 N/m,k₂=2 N/m,F=6 N: le molle hanno allungamento comune 2 m e richiami 2 e 4 N. Lunghezze a 50 px/m con L₀ illustrativa 2 m per entrambe; traversa guidata senza rotazione. Frecce di forza in pannello distinto a 20 px/N: 40,80,120 px. Zigzag simbolici; scale dimensionali non confrontabili.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.parallel_springs_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'parallel-springs-044.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'parallel-springs-044-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
