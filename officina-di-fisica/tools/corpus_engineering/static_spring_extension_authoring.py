"""Author static vertical-spring extensions; no self scientific approval."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Nel riferimento inerziale del laboratorio una massa m>0 è appesa a una molla verticale ideale di costante k>0 e massa trascurabile, con estremo superiore fissato. Si osserva la massa ferma all’equilibrio finale, senza altre forze oltre peso e richiamo elastico. Il campo uniforme vale g=10 m/s². ℓ>0 è l’allungamento dalla lunghezza naturale, non la lunghezza totale; tutte le configurazioni considerate sono ammesse nel regime elastico lineare ideale. '
TASKS=[
('L’allungamento si trova dal bilancio delle forze',SCENE+'Con m=2 kg e k=2 N/m, quanto vale ℓ in metri?',10,
 'L’accelerazione della massa ferma è nulla. Sull’asse verticale positivo verso il basso, il peso è positivo e il richiamo della molla negativo: mg−kℓ=0. Il peso vale venti newton; dividendo per due newton al metro troviamo dieci metri di allungamento.',
 r'mg-k\ell=0\qquad k\ell=mg\qquad mg=20\,\mathrm N\qquad \ell=mg/k\qquad \ell=10\,\mathrm m',
 'Dieci metri è un dato del modello ideale molto cedevole, esplicitamente assunto lineare anche a questo allungamento. Non è una previsione su una molla reale fuori dal suo regime elastico. Non abbiamo lasciato cadere da ferma la massa da ℓ=0: quel problema dinamico avrebbe condizioni diverse.', 'Imponi risultante nulla sull’equilibrio osservato.'),
('La lunghezza che resta dopo la divisione','Per una massa ferma appesa a una molla verticale ideale si ha ℓ=mg/k. m è massa, g accelerazione e k costante elastica in N/m. Quale unità SI esprime l’allungamento ℓ?',['N','kg','m','N/m','1'],
 'Il prodotto mg ha unità di forza. Dividere newton per newton al metro lascia un metro. L’equilibrio collega una forza e una deformazione attraverso la rigidezza, ma non rende uguali le loro dimensioni.',
 r'[mg]=\mathrm N\qquad [k]=\mathrm{N/m}\qquad [mg/k]=L',
 'N misura il peso, kg la massa e N/m la rigidezza. Un rapporto puro non può descrivere una variazione di lunghezza. La lunghezza naturale non serve per determinare ℓ, ma servirebbe per ottenere la lunghezza totale.', 'Espandi il divisore N/m: dividere per esso lascia metri.'),
('La forza di richiamo equilibra il peso',SCENE+'Quale relazione dà ℓ?',['ℓ=mg/k','ℓ=mk/g','ℓ=k/(mg)','ℓ=mgk','ℓ=2mg/k'],
 'Scegliamo verso positivo in discesa. Il peso mg e il richiamo kℓ hanno versi opposti e devono avere uguale modulo alla quiete. Dividere per k>0 isola l’allungamento. Il segno meno appartiene alla componente del richiamo, non al valore positivo di ℓ.',
 r'mg-k\ell=0\qquad mg=k\ell\qquad \ell=mg/k',
 'mk/g e mgk hanno dimensioni diverse da una lunghezza; k/(mg) ha dimensione inversa. Il fattore due non nasce dall’equilibrio: può comparire in un diverso problema di caduta da molla indeformata, ma qui non si studia un punto di inversione del moto. È dichiarata una quiete finale.', 'Usa l’equilibrio, non una formula di massima elongazione durante una caduta.'),
('Più massa con la stessa rigidezza',SCENE+'Fra due prove k=2 N/m resta uguale e m passa da 2 a 4 kg. Come cambia ℓ?',['Da 10 a 20 m','Resta 10 m','Da 10 a 5 m','Da 10 a 40 m','Diventa zero'],
 'Il peso raddoppia da venti a quaranta newton. Per lo stesso k occorre un richiamo doppio e, nel regime lineare, un allungamento doppio. Le due masse sono costanti dentro ciascuna prova: il confronto non aggiunge materia durante un’oscillazione.',
 r'\ell_A=20\,\mathrm N/(2\,\mathrm{N/m})\qquad \ell_A=10\,\mathrm m\qquad \ell_B=40\,\mathrm N/(2\,\mathrm{N/m})\qquad \ell_B=20\,\mathrm m',
 'Cinque metri inverte l’effetto del peso, quaranta usa il nuovo peso come se fosse già una lunghezza. Invariabilità e zero ignorano il carico maggiore. Entrambi gli equilibri sono nel regime lineare assunto.', 'Con k e g fissi, l’allungamento segue la massa.'),
('Dall’allungamento alla massa',SCENE+'Si misurano ℓ=10 m e k=2 N/m. Quanto vale m in kg?',2,
 'Moltiplichiamo l’allungamento per k per ricostruire il richiamo: due newton al metro per dieci metri danno venti newton. Alla quiete questo è il peso. Dividiamo per g=10 m/s² e troviamo due chilogrammi.',
 r'k\ell=20\,\mathrm N\qquad m=k\ell/g\qquad m=\frac{20\,\mathrm N}{10\,\mathrm{m/s^2}}\qquad m=2\,\mathrm{kg}',
 'Il controllo mg/k=2·10/2=10 m restituisce l’allungamento. Venti newton non sono venti chilogrammi. La massa è positiva come richiesto; non abbiamo usato la lunghezza totale della molla.', 'Ricava prima il peso dalla forza elastica, poi dividi per g.'),
('Dalla quiete alla rigidezza',SCENE+'Si misurano ℓ=10 m e m=2 kg. Quanto vale k in N/m?',2,
 'Il peso è venti newton e viene equilibrato dal richiamo. Dividendo mg=kℓ per ℓ>0 otteniamo k=mg/ℓ. Venti newton su dieci metri danno due newton al metro.',
 r'mg=20\,\mathrm N\qquad k=mg/\ell\qquad k=\frac{20\,\mathrm N}{10\,\mathrm m}\qquad k=2\,\mathrm{N/m}',
 'Il controllo (2 N/m)(10 m)=20 N conferma l’equilibrio. Il quoziente inverso ℓ/(mg)=1/2 m/N sarebbe la cedevolezza, non la rigidezza. L’allungamento positivo permette la divisione e seleziona k positivo.', 'Dividi il peso per l’allungamento, non viceversa.'),
('Una molla più rigida si allunga meno',SCENE+'Con m=2 kg fisso, k passa da 2 a 4 N/m. Quanto vale ℓ_B/ℓ_A?',['1/2','2','1','4','−1/2'],
 'Il peso resta venti newton. La prima molla richiede dieci metri per svilupparlo, la seconda soltanto cinque. Il rapporto finale su iniziale è 5/10=1/2: la maggiore rigidezza riduce l’allungamento necessario.',
 r'\ell_A=10\,\mathrm m\qquad \ell_B=5\,\mathrm m\qquad \ell_B/\ell_A=\frac12',
 'Due seguirebbe k invece del suo reciproco, quattro introdurrebbe un quadrato e uno ignorerebbe la molla diversa. Il segno negativo è escluso per due allungamenti positivi. Le forze elastiche in equilibrio sono invece uguali, entrambe venti newton.', 'Mantieni il peso uguale e confronta due divisioni per k.'),
('Scarto di una proposta doppia',SCENE+'Con m=2 kg,k=2 N/m si propone ℓ_proposto=20 m. Quanto vale proposto meno corretto?',['+10 m','−10 m','+20 m','0 m','+5 m'],
 'L’equilibrio dà ℓ=20 N/(2 N/m)=10 m. La proposta è doppia e lo scarto richiesto è venti meno dieci, cioè dieci metri positivi. Il segno dello scarto è distinto dal verso del richiamo.',
 r'\ell=10\,\mathrm m\qquad e=(20-10)\,\mathrm m\qquad e=+10\,\mathrm m',
 '−10 inverte la sottrazione, venti ripete la proposta, zero la accetta e cinque dimezza ancora lo scarto. Una configurazione istantanea con allungamento venti metri non sarebbe l’equilibrio di questa massa e di questa molla senza altre forze.', 'Controlla la proposta nel bilancio kℓ=mg.'),
('Un’inversa che dà una massa',SCENE+'Quale formula isola m dalla relazione ℓ=mg/k?',['m=kℓ/g','m=gℓ/k','m=k/(gℓ)','m=mg/k','m=2kℓ/g'],
 'Moltiplichiamo per k per eliminare il denominatore e dividiamo per g>0. Il prodotto kℓ è una forza; dividerlo per un’accelerazione dà una massa. Non resta il simbolo m a destra: l’incognita deve essere isolata.',
 r'k\ell=mg\qquad k\ell/g=m\qquad m=k\ell/g',
 'gℓ/k ha dimensioni errate per una massa; k/(gℓ) ha una lunghezza al denominatore invece che al numeratore. La quarta opzione mantiene m nel secondo membro e il fattore due dell’ultima non appartiene al bilancio statico. Le unità aiutano a distinguere anche formule con numeri plausibili.', 'Ricostruisci mg dal prodotto kℓ prima di dividere per g.'),
('Massa e rigidezza scalate fra prove',SCENE+'La prova B usa m_B=κ₁m e k_B=κ₂k, con κ₁,κ₂>0; m,k sono i dati di A. Quanto vale ℓ_B/ℓ_A?',['κ₁ / κ₂','κ₁ κ₂','κ₂ / κ₁','κ₁² / κ₂','κ₁ + κ₂'],
 'Il peso riceve il fattore κ₁ e la rigidezza al denominatore riceve κ₂. Nel rapporto con la prima prova si cancellano m,g,k. Resta κ₁/κ₂: più massa aumenta la deformazione, più rigidezza la riduce.',
 r'\ell_A=mg/k\qquad \ell_B=\kappa_1mg/(\kappa_2k)\qquad \ell_B/\ell_A=\kappa_1/\kappa_2',
 'Il prodotto assegna alla rigidezza l’effetto sbagliato; il reciproco inverte il confronto; il quadrato conta la massa due volte. La somma darebbe due all’identità κ₁=κ₂=1. Se i due fattori sono uguali, l’allungamento resta invariato pur cambiando il peso.', 'Ricorda che k compare al denominatore.'),
('Tre volte la massa e due volte la rigidezza',SCENE+'A ha m=2 kg,k=2 N/m; B ha m=6 kg,k=4 N/m. Quanto vale ℓ_B/ℓ_A?',['3/2','2/3','3','2','6'],
 'La prima prova dà dieci metri. Nella seconda il peso è sessanta newton e si divide per quattro N/m, ottenendo quindici metri. Il rapporto 15/10 si riduce a 3/2. È anche il rapporto fra i fattori tre sulla massa e due su k.',
 r'\ell_A=10\,\mathrm m\qquad \ell_B=15\,\mathrm m\qquad \ell_B/\ell_A=\frac{15}{10}\qquad \ell_B/\ell_A=\frac32',
 'Tre considera solo la massa, due solo la rigidezza nel verso sbagliato, sei moltiplica entrambi i fattori e due terzi inverte il confronto. Quindici metri è il nuovo allungamento, mentre tre mezzi è il rapporto puro richiesto.', 'Calcola 60/4 prima di confrontarlo con dieci.'),
('Media delle due posizioni di equilibrio',SCENE+'A ha m=2 kg,k=2 N/m; B ha m=6 kg,k=4 N/m. Qual è la media aritmetica di ℓ_A,ℓ_B con uguale peso?',['25/2 m','25 m','25/4 m','40/3 m','5 m'],
 'Gli allungamenti sono dieci e quindici metri. La loro media è 25/2 m, fra i due valori, e si conserva come frazione esatta. Usare invece gli ingressi medi m=4 kg,k=3 N/m darebbe 40/3 m, perché il quoziente non distribuisce sulla media di k.',
 r'\ell_A=10\,\mathrm m\qquad \ell_B=15\,\mathrm m\qquad \overline\ell=\frac{10+15}{2}\,\mathrm m\qquad \overline\ell=\frac{25}{2}\,\mathrm m',
 'Venticinque è la somma, 25/4 dimezza ancora e cinque è la differenza. 40/3 non coincide con 25/2: i prodotti incrociati sono 80 e 75. Non servono espansioni decimali per scegliere la media corretta.', 'Media i due allungamenti già ricavati dal rispettivo equilibrio.'),
('Progettare la nuova rigidezza',SCENE+'A ha m_A=2 kg,k_A=2 N/m. Si impone m_B=6 kg e si vuole ℓ_B=(3/2)ℓ_A. Quanto vale k_B/k_A?',2,
 'L’obiettivo è (3/2)·10=15 m. Per equilibrare il peso nuovo da sessanta newton con quell’allungamento serve k_B=60/15=4 N/m. Dividendo per i due N/m iniziali troviamo il rapporto due.',
 r'\ell_B=15\,\mathrm m\qquad m_Bg=60\,\mathrm N\qquad k_B=m_Bg/\ell_B\qquad k_B=4\,\mathrm{N/m}\qquad k_B/k_A=2',
 'Lasciare k invariato darebbe trenta metri, cioè il triplo dell’iniziale. Triplicare anche k manterrebbe invece dieci metri. Il nuovo k positivo e l’allungamento previsto sono compatibili con il regime lineare esplicitamente assunto.', 'Trova la rigidezza dal peso nuovo e dall’allungamento obiettivo.'),
('Un display tarato sull’allungamento',SCENE+'Un display continuo adimensionale legge S=qℓ, con q>0 costante e offset nullo. Il riferimento m=2 kg,k=2 N/m dà S=30. Una prova con k=4 N/m dà S=45. Quanto vale m in kg?',6,
 'Il riferimento ha ℓ=10 m e quindi q=3 m⁻¹. La lettura quarantacinque significa quindici metri di allungamento. La molla da quattro N/m sviluppa sessanta newton: dividendo per g ricostruiamo sei chilogrammi.',
 r'q=3\,\mathrm{m^{-1}}\qquad \ell=45/q\qquad \ell=15\,\mathrm m\qquad k\ell=60\,\mathrm N\qquad m=6\,\mathrm{kg}',
 'Il controllo 6·10/4=15 m e S=3·15=45 ricostruisce entrambe le tappe. Interpretare 45 come metri salterebbe il guadagno e produrrebbe diciotto chilogrammi. La lettura è continua, non una forza o una massa SI.', 'Decodifica ℓ prima di applicare m=kℓ/g.'),
('Taratura con offset prima dell’equilibrio',SCENE+'Un display continuo adimensionale legge S=qℓ+b, con q>0,b costanti. A: m=2 kg,k=2 N/m,S=21. B: m=6 kg,k=4 N/m,S=31. C: k=2 N/m,S=41. Quanto vale m_C?',['2 kg','3 kg','4 kg','6 kg','8 kg'],
 'I riferimenti hanno ℓ=10 e 15 m. La differenza delle letture è dieci su cinque metri: q=2 m⁻¹. Poi b=21−2·10=1. La lettura quarantuno, privata dell’offset e divisa per due, dà venti metri. Il richiamo vale quaranta newton e la massa quattro chilogrammi.',
 r'q=2\,\mathrm{m^{-1}}\qquad b=1\qquad \ell_C=(41-1)/q\qquad \ell_C=20\,\mathrm m\qquad m_C=k\ell_C/g\qquad m_C=4\,\mathrm{kg}',
 'Con k_C=2 N/m ogni chilogrammo dà cinque metri e dieci unità di lettura oltre l’offset. Le masse 2,3,6,8 kg darebbero S=21,31,61,81. Solo quattro ricostruisce quarantuno; l’offset va eliminato prima di usare il bilancio fisico.', 'Trova q dalle differenze, poi b e infine l’allungamento di C.'),
('Un allungamento che non fissa la scala dei parametri',SCENE+'Si selezionano prove con m=ck, dove c=1 kg·m/N è fisso. Il vincolo lega prove diverse; m e k restano costanti dentro ciascuna prova. Si misura ℓ=10 m. Quante coppie positive (m,k) sono ammesse?',['Nessuna','Una','Due','Tre','Infinite'],
 'Inseriamo m=ck nell’allungamento di equilibrio. Il fattore k positivo si cancella e rimane ℓ=cg. Le unità (kg·m/N)(m/s²) danno metri e il valore è dieci. La misura è dunque coerente ma ripete il vincolo senza determinare la scala di m e k.',
 r'\ell=ckg/k\qquad \ell=cg\qquad \ell=10\,\mathrm m\qquad m=ck\qquad k>0',
 'Per esempio k=1 N/m,m=1 kg e k=2 N/m,m=2 kg danno entrambi ℓ=10 m; ogni altro k positivo genera una nuova coppia. Non sono soltanto due o tre: è una famiglia continua infinita. La coppia nulla è esclusa, perché k=0 non consentirebbe l’inversa né l’equilibrio dichiarato.', 'Sostituisci il vincolo prima di tentare di ricavare due incognite da una sola misura indipendente.')]
CHOICES={2:2,3:0,4:0,7:0,8:0,9:0,10:0,11:0,12:0,15:2,16:4}
UNITS={1:'m',5:'kg',6:'N/m',13:'1',14:'kg'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/static-spring-extension-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-static-spring-extension-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':4620+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'static-spring-extension','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Alla quiete il richiamo equilibra il peso; ℓ è un allungamento, non la lunghezza totale.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Equilibrio della molla verticale','Allungamento dalla lunghezza naturale'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio m=2 kg,k=2 N/m,g=10 m/s²: peso e richiamo 20 N, allungamento 10 m. Lunghezza naturale illustrativa 2 m, lunghezza finale 12 m; scala 20 px/m, allungamento 200 px. Forze in pannello distinto a 5 px/N, frecce opposte di 100 px. Zigzag simbolico, equilibrio finale nel regime lineare ideale, senza altre forze.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.static_spring_extension_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'static-spring-extension-046.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'static-spring-extension-046-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
