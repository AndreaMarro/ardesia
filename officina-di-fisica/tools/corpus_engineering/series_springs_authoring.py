"""Author series-spring editions, awaiting separate scientific review."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Due molle ideali lineari di costanti k₁,k₂>0 sono collegate in serie fra un supporto fisso e un estremo tirato lungo il loro asse. Molle e raccordo hanno massa trascurabile; il raccordo non riceve altre forze. Nel riferimento inerziale del laboratorio si confrontano equilibri quasistatici. Ogni molla trasmette la stessa forza di modulo F>0; gli allungamenti positivi ℓ₁,ℓ₂ dalla rispettiva lunghezza naturale si sommano in ℓ. Le deformazioni restano nel regime lineare. K è definita da F=Kℓ. '
TASKS=[
('Due deformazioni sotto la stessa forza',SCENE+'Con k₁=k₂=2 N/m, quanto vale K in N/m?',1,
 'Ogni molla si allunga di F/kᵢ. A forza comune gli allungamenti si sommano: ℓ=F(1/k₁+1/k₂). Confrontiamo con ℓ=F/K e dividiamo per F>0. Nel caso di due rigidezze uguali si sommano due metà di metro per newton, ottenendo un metro per newton; il reciproco è 1 N/m.',
 r'\ell=F/k_1+F/k_2\qquad 1/K=1/k_1+1/k_2\qquad 1/K=1\,\mathrm{m/N}\qquad K=1\,\mathrm{N/m}',
 'Il gruppo è più cedevole di ogni molla: K deve essere minore di 2 N/m. La somma 4 N/m apparterrebbe al parallelo e violerebbe questo controllo. A F=2 N le due molle si allungherebbero di un metro ciascuna: due metri totali confermano K=2 N/2 m.', 'Somma gli allungamenti, non le rigidezze.'),
('Rigidezza e cedevolezza hanno unità reciproche','Due molle ideali in serie hanno forza comune F e allungamento totale ℓ. La costante equivalente K soddisfa F=Kℓ. Quale unità SI esprime K?',['N','m/N','N/m','m','1'],
 'Anche per un collegamento in serie la rigidezza è forza su lunghezza. Sono invece le cedevolezze 1/kᵢ a sommarsi e ad avere unità m/N. Dopo la somma occorre prendere il reciproco per tornare a K.',
 r'[K]=\mathrm{N/m}\qquad [1/K]=\mathrm{m/N}\qquad [K]=M/T^2',
 'm/N misura la cedevolezza, non la rigidezza. N è una forza, m un allungamento e 1 è puro. L’unità non cambia perché le molle sono state collegate in modo diverso; cambia la relazione fra le costanti.', 'La somma delle cedevolezze va invertita per ottenere la rigidezza.'),
('Ricavare la legge dal raccordo ideale',SCENE+'Quale formula dà K?',['K=k₁+k₂','K=k₁k₂/(k₁+k₂)','K=(k₁+k₂)/2','K=k₁−k₂','K=1/k₁+1/k₂'],
 'L’equilibrio del raccordo di massa trascurabile impone uguale modulo di forza nelle molle. Le deformazioni non sono necessariamente uguali: valgono F/k₁ e F/k₂. Portiamo la somma dei reciproci a denominatore comune e poi invertiamo.',
 r'1/K=1/k_1+1/k_2\qquad 1/K=\frac{k_1+k_2}{k_1k_2}\qquad K=\frac{k_1k_2}{k_1+k_2}',
 'La somma è il parallelo, la media non nasce dal bilancio e la differenza potrebbe dare zero per molle identiche. L’ultima opzione è 1/K ed ha unità m/N. Il prodotto su somma è positivo ed è minore di ciascun kᵢ positivo.', 'Il raccordo equilibra le forze; l’estremo complessivo accumula entrambe le deformazioni.'),
('Rendere più rigida una sola molla',SCENE+'k₂ resta 2 N/m; k₁ passa da 2 a 4 N/m fra due prove. Come cambia K?',['Da 1 a 4/3 N/m','Resta 1 N/m','Da 1 a 2 N/m','Da 1 a 6 N/m','Da 1 a 3/4 N/m'],
 'Il primo gruppo ha K=1 N/m. Il secondo ha prodotto 4·2=8 e somma 4+2=6: il quoziente è 8/6=4/3 N/m. Il gruppo diventa più rigido, ma rimane più cedevole della molla da 2 N/m rimasta in serie.',
 r'K_A=1\,\mathrm{N/m}\qquad K_B=\frac{4\times2}{4+2}\,\mathrm{N/m}\qquad K_B=\frac43\,\mathrm{N/m}',
 'Due N/m sarebbe il limite raggiunto solo rendendo la prima molla infinitamente rigida, non con k₁=4 N/m. Sei somma le costanti come nel parallelo. Tre quarti inverte il quoziente; invarianza ignorerebbe la riduzione della prima cedevolezza.', 'Semplifica 8/6 e controlla che il risultato sia sotto 2 N/m.'),
('Invertire senza perdere il dominio',SCENE+'Si misura K=1 N/m e si conosce k₂=2 N/m. Quanto vale k₁ in N/m?',2,
 'Moltiplichiamo K=k₁k₂/(k₁+k₂) per la somma positiva. Raccogliendo k₁ otteniamo Kk₂=k₁(k₂−K). Il denominatore k₂−K è positivo perché una serie di molle positive ha K<k₂. Inserendo i dati il prodotto al numeratore e la differenza al denominatore danno due N/m.',
 r'K(k_1+k_2)=k_1k_2\qquad Kk_2=k_1(k_2-K)\qquad k_1=\frac{Kk_2}{k_2-K}\qquad k_1=2\,\mathrm{N/m}',
 'Il controllo 2·2/(2+2)=1 N/m restituisce K. K=k₂ annullerebbe il denominatore: non esiste una prima rigidezza finita positiva in quel caso. K>k₂ produrrebbe una costante negativa, fuori dal modello.', 'Raccogli i termini con k₁ prima di dividere per k₂−K.'),
('La molla più cedevole si allunga di più',SCENE+'Con k₁=2 N/m,k₂=4 N/m entrambe trasmettono F=4 N. Quanto vale ℓ₁/ℓ₂?',['1/2','1','2','4','−2'],
 'Dividiamo la forza comune per ciascuna rigidezza. La prima molla si allunga di due metri, la seconda di un metro. Il rapporto degli allungamenti è due, inverso del rapporto delle rigidezze. L’uguaglianza della forza non impone l’uguaglianza della deformazione.',
 r'\ell_1=F/k_1\qquad \ell_1=2\,\mathrm m\qquad \ell_2=F/k_2\qquad \ell_2=1\,\mathrm m\qquad \ell_1/\ell_2=2',
 'Un mezzo segue direttamente k₁/k₂ invece del reciproco. Uno confonde serie e parallelo; quattro ripete il numero della forza e −2 viola allungamenti positivi. Il totale è 3 m e F/ℓ=4/3 N/m, coerente con la rigidezza equivalente.', 'La stessa forza divisa per una rigidezza minore dà un allungamento maggiore.'),
('Confrontare due rigidezze equivalenti',SCENE+'A ha k₁=k₂=2 N/m; B ha k₁=2 N/m,k₂=4 N/m. Quanto vale K_B/K_A?',['4/3','3/4','2','1/2','1'],
 'La prima equivalente è 1 N/m; la seconda è 8/6=4/3 N/m. Dividere per la prima non modifica il numero, ma cancella le unità e dà un rapporto puro. Solo una delle due molle è stata resa doppia.',
 r'K_A=1\,\mathrm{N/m}\qquad K_B=\frac43\,\mathrm{N/m}\qquad K_B/K_A=\frac43',
 'Due trattava come raddoppiata l’intera serie; tre quarti inverte il confronto; un mezzo e uno non descrivono la maggiore rigidezza. Il rapporto è tra uno e due, coerentemente con un ramo modificato e l’altro fisso.', 'Calcola prima ciascun prodotto su somma.'),
('Scarto da una proposta pari al singolo ramo',SCENE+'Con k₁=k₂=2 N/m si propone K_proposto=2 N/m. Quanto vale proposto meno corretto?',['+1 N/m','−1 N/m','+2 N/m','0 N/m','+1/2 N/m'],
 'La serie corretta vale 1 N/m. La proposta ha mantenuto la rigidezza di una sola molla e dimenticato l’allungamento della seconda. Sottraiamo 1 da 2 e otteniamo una sovrastima positiva di 1 N/m.',
 r'K=1\,\mathrm{N/m}\qquad e=(2-1)\,\mathrm{N/m}\qquad e=+1\,\mathrm{N/m}',
 '−1 inverte l’ordine, due ripete la proposta, zero la accetta e un mezzo dimezza ancora lo scarto. La differenza mantiene unità di rigidezza, non di forza o cedevolezza.', 'Due molle identiche in serie hanno metà rigidezza della singola.'),
('L’inversa della serie',SCENE+'Si conoscono k₂ e K, con 0<K<k₂. Quale formula isola k₁?',['k₁=Kk₂/(k₂−K)','k₁=K−k₂','k₁=Kk₂/(k₂+K)','k₁=Kk₂/(K−k₂)','k₁=K/k₂'],
 'Eliminiamo il denominatore k₁+k₂, poi spostiamo Kk₁ dallo stesso lato di k₁k₂. Il coefficiente che resta è k₂−K. Il dominio dichiarato permette la divisione e assicura una rigidezza positiva.',
 r'Kk_1+Kk_2=k_1k_2\qquad Kk_2=k_1(k_2-K)\qquad k_1=\frac{Kk_2}{k_2-K}',
 'K−k₂ è l’inversa sbagliata del parallelo e sarebbe negativa qui. Il più al denominatore non isola la stessa equazione; il denominatore opposto cambia segno. K/k₂ è puro e non può essere una rigidezza. Il limite K→k₂ dal basso richiede k₁ sempre maggiore.', 'Il termine Kk₁ va raccolto con l’altro termine contenente k₁.'),
('Due fattori dentro prodotto e somma',SCENE+'Fra due prove k₁,B=κ₁k₁ e k₂,B=κ₂k₂, con κ₁,κ₂>0 e k₁,k₂ riferiti ad A. Definiamo S=k₁+k₂. Definiamo inoltre S_B=κ₁k₁+κ₂k₂. Quale rapporto K_B/K_A segue?',['κ₁ κ₂ S / S_B','κ₁ κ₂ S_B / S','κ₁ / κ₂','(κ₁ + κ₂) S / S_B','κ₁ κ₂ S / (2 S_B)'],
 'Il nuovo prodotto riceve entrambi i fattori κ, mentre la nuova somma è S_B. Dividendo K_B per K_A si moltiplica per il reciproco del primo prodotto su somma. Il prodotto k₁k₂ si cancella e la somma iniziale S passa al numeratore.',
 r'K_A=k_1k_2/S\qquad K_B=\kappa_1\kappa_2k_1k_2/S_B\qquad K_B/K_A=\kappa_1\kappa_2S/S_B',
 'Scambiare S e S_B inverte l’effetto della somma. Il solo κ₁/κ₂ non tiene conto di entrambi i rami. Sommare κ al numeratore o aggiungere un due al denominatore non segue dalla legge. Se κ₁=κ₂=κ, S_B=κS e il rapporto si riduce a κ, non κ².', 'Scrivi entrambi i prodotti su somma prima di cancellare i fattori comuni.'),
('La serie conserva un fattore comune',SCENE+'A ha k₁=k₂=2 N/m; B ha k₁=k₂=4 N/m. Quanto vale K_B/K_A?',2,
 'Per le due molle uguali la rigidezza di gruppo è metà della singola. A dà uno N/m e B dà due N/m. Raddoppiare entrambe le costanti raddoppia il prodotto due volte, ma raddoppia anche il denominatore: nel quoziente resta un solo due.',
 r'K_A=1\,\mathrm{N/m}\qquad K_B=\frac{4\times4}{4+4}\,\mathrm{N/m}\qquad K_B=2\,\mathrm{N/m}\qquad K_B/K_A=2',
 'Quattro conserverebbe il doppio fattore del prodotto dimenticando la somma raddoppiata. Un mezzo è il rapporto inverso; uno ignorerebbe il cambiamento. La nuova equivalente rimane inferiore a ogni ramo da quattro N/m.', 'Considera il raddoppio sia del prodotto sia della somma.'),
('Una media che qui coincide con gli ingressi medi',SCENE+'A usa k₁=k₂=2 N/m e B usa k₁=k₂=4 N/m. Qual è la media aritmetica di K_A,K_B con uguale peso?',['3/2 N/m','3 N/m','3/4 N/m','1 N/m','2 N/m'],
 'Le equivalenti sono uno e due N/m. La semisomma è 3/2 N/m. Qui le coppie di ingressi sono proporzionali e le loro medie, entrambe 3 N/m, darebbero ancora 3/2 N/m. Questa coincidenza non rende lineare in generale la legge della serie.',
 r'K_A=1\,\mathrm{N/m}\qquad K_B=2\,\mathrm{N/m}\qquad \overline K=\frac{1+2}{2}\,\mathrm{N/m}\qquad \overline K=\frac32\,\mathrm{N/m}',
 'Tre è la somma, tre quarti dimezza ancora, uno o due ripetono una prova. Per vedere che la coincidenza non è universale, le coppie (1,3) e (3,1) N/m danno entrambe K=3/4 N/m, mentre i loro ingressi medi (2,2) danno K=1 N/m. Non confondere il caso proporzionale assegnato con ogni possibile media.', 'Media le due equivalenti già calcolate, senza arrotondarle.'),
('Progettare il secondo ramo della serie',SCENE+'A ha k₁,A=k₂,A=2 N/m. Si impone k₁,B=4 N/m e si vuole K_B=2K_A. Quanto vale k₂,B/k₂,A?',2,
 'L’equivalente iniziale è uno N/m e l’obiettivo è due. Usando l’inversa per il secondo ramo otteniamo k₂,B=K_Bk₁,B/(k₁,B−K_B). Il prodotto numerico è otto e la differenza due: k₂,B=4 N/m. Il rapporto ai due iniziali è due.',
 r'K_B=2\,\mathrm{N/m}\qquad k_{2,B}=\frac{K_Bk_{1,B}}{k_{1,B}-K_B}\qquad k_{2,B}=4\,\mathrm{N/m}\qquad k_{2,B}/k_{2,A}=2',
 'Lasciare il secondo ramo a due N/m darebbe soltanto 4/3 N/m. Quattro N/m è la nuova costante, non il rapporto. L’obiettivo è minore del primo ramo da quattro, perciò la soluzione finita positiva esiste.', 'Il ramo incognito si ricava con il denominatore k₁,B−K_B positivo.'),
('Tarare prima dell’inversa della serie',SCENE+'Un display continuo adimensionale legge S=qK, con q>0 costante e offset nullo. Il riferimento k₁=k₂=2 N/m dà S=3. Una nuova prova dà S=6 e k₂=4 N/m. Quanto vale k₁ in N/m?',4,
 'La prima equivalente è uno N/m: q=3 m/N. La nuova lettura sei significa K=2 N/m. Con k₂=4 N/m l’inversa dà k₁=(2·4)/(4−2)=4 N/m, con unità di rigidezza dopo la divisione.',
 r'q=3\,\mathrm{m/N}\qquad K=6/q\qquad K=2\,\mathrm{N/m}\qquad k_1=\frac{Kk_2}{k_2-K}\qquad k_1=4\,\mathrm{N/m}',
 'Il controllo 4·4/(4+4)=2 N/m e S=3·2=6 ricostruisce il dato. Usare S=6 come rigidezza porterebbe K>k₂ e quindi a un’inversa negativa: sarebbe un errore di decodifica, non una molla fisica negativa.', 'Ricostruisci K e controlla K<k₂ prima di usare la formula inversa.'),
('Una lettura frazionaria continua',SCENE+'Un display continuo adimensionale legge S=qK+b, con q>0,b costanti. A: k₁=k₂=2 N/m,S=3. B: k₁=k₂=4 N/m,S=5. C: k₂=2 N/m,S=11/3. Quanto vale k₁,C?',['2 N/m','3 N/m','4 N/m','6 N/m','8 N/m'],
 'Le equivalenti dei riferimenti sono uno e due N/m: q=(5−3)/(2−1)=2 m/N e b=1. Togliamo uno da 11/3, cioè tre terzi: resta 8/3. La divisione per due dà K_C=4/3 N/m. Nell’inversa il denominatore è 2−4/3=2/3 N/m; dividere 8/3 per 2/3 dà quattro N/m.',
 r'q=2\,\mathrm{m/N}\qquad b=1\qquad K_C=\frac43\,\mathrm{N/m}\qquad k_{1,C}=\frac{K_Ck_2}{k_2-K_C}\qquad k_{1,C}=4\,\mathrm{N/m}',
 'Le alternative k₁=2,3,6,8 N/m danno rispettivamente K=1,6/5,3/2,8/5 N/m e letture 3,17/5,4,21/5. Nessuna è 11/3; per esempio 17·3=51 contro 11·5=55. La lettura continua può essere una frazione: non occorre arrotondare.', 'Lavora con terzi esatti dopo aver tolto l’offset.'),
('Due rami uguali nella serie',SCENE+'Si selezionano coppie con k₁=k₂ e si misura K=1 N/m. Quanto vale k₂ in N/m?',2,
 'Sostituiamo l’uguaglianza delle costanti nella legge di serie. Il prodotto diventa k₂² e la somma 2k₂; il fattore k₂ positivo si cancella, lasciando K=k₂/2. La costante del singolo ramo è dunque doppia dell’equivalente.',
 r'K=\frac{k_2^2}{2k_2}\qquad K=k_2/2\qquad k_2=2K\qquad k_2=2\,\mathrm{N/m}',
 'La soluzione unica positiva è k₁=k₂=2 N/m. Dividere ancora K per due applicherebbe l’effetto della serie nel verso sbagliato. Il quadrato apparso al numeratore non richiede una radice, perché un fattore si semplifica con il denominatore non nullo.', 'Semplifica k₂ prima di isolare la costante.')]
CHOICES={2:2,3:1,4:0,6:2,7:0,8:0,9:0,10:0,12:0,15:2}
UNITS={1:'N/m',5:'N/m',11:'1',13:'1',14:'N/m',16:'N/m'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/series-springs-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-series-springs-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':4520+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'series-springs','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'In serie è comune la forza; si sommano gli allungamenti e le cedevolezze.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Molle in serie','Forza comune e somma delle cedevolezze'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (3,6):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio k₁=2 N/m,k₂=4 N/m,F=4 N: allungamenti 2 m e 1 m, totale 3 m,K=4/3 N/m. Lunghezze naturali illustrative 1 m ciascuna: figura naturale 60+60 px e deformata 180+120 px, scala 60 px/m; zigzag simbolici. Raccordo ideale con richiami opposti 4 N, frecce 80 px alla scala distinta 20 px/N.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.series_springs_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'series-springs-045.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'series-springs-045-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
