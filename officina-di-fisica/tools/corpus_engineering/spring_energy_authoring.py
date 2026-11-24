"""Author exact elastic-energy editions; separate review NOT_RUN."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Una molla ideale lineare ha costante k>0, costante dentro ciascuna prova. ℓ=|x|>0 è il modulo della deformazione rispetto alla lunghezza naturale, con x coordinata orientata. Tutte le configurazioni considerate rientrano nel regime elastico lineare dichiarato. U è l’energia potenziale elastica immagazzinata e si pone U=0 alla lunghezza naturale. Si considera la sola energia della molla, senza includere eventuali energie gravitazionali o cinetiche di altri corpi. '
TASKS=[
('L’energia è l’area sotto una forza crescente',SCENE+'Con k=2 N/m e ℓ=2 m, quanto vale U in joule?',4,
 'La forza elastica cresce in modulo da zero al valore finale kℓ=4 N. Per deformare lentamente la molla dal riferimento naturale, il lavoro esterno immagazzinato è l’area sotto la retta forza–deformazione: un triangolo di base due metri e altezza quattro newton. La metà del prodotto base per altezza è quattro joule.',
 r'F_{\mathrm{finale}}=k\ell\qquad F_{\mathrm{finale}}=4\,\mathrm N\qquad U=\frac12\ell F_{\mathrm{finale}}\qquad U=4\,\mathrm J',
 'Moltiplicare la forza finale per tutta la deformazione darebbe 8 J, come se la forza fosse stata costante fin dall’inizio. L’area triangolare incorpora invece la crescita lineare. Il lavoro della forza elastica durante l’allungamento è −4 J; l’energia immagazzinata è +4 J rispetto allo zero scelto.', 'Trova la forza finale e prendi metà del rettangolo F_finale·ℓ.'),
('Il quadrato della lunghezza cambia la dimensione','Una molla ideale lineare ha energia elastica U=kℓ²/2, con k in N/m e ℓ deformazione in metri. Quale unità SI esprime U?',['N','N/m','J','m','1'],
 'La lunghezza è al quadrato: moltiplicando N/m per m² rimane N·m, cioè joule. Il coefficiente un mezzo è puro e non cambia la dimensione. La formula della forza kℓ avrebbe invece un solo metro e darebbe newton.',
 r'[k\ell^2]=\mathrm{N\,m}\qquad [U]=ML^2/T^2\qquad 1\,\mathrm J=1\,\mathrm{N\,m}',
 'N è una forza, N/m una rigidezza e m una lunghezza; 1 è puro. Nessuna di queste unità sostituisce J per un’energia. Il quadrato si applica anche all’unità della deformazione, non soltanto al suo numero.', 'Semplifica (N/m)·m² prima di scegliere l’unità.'),
('Dal triangolo alla legge dell’energia',SCENE+'Quale relazione dà U?',['U=kℓ²/2','U=kℓ²','U=kℓ','U=−kℓ²/2','U=k/(2ℓ²)'],
 'Nel grafico del modulo del richiamo contro il modulo della deformazione la retta parte da zero e ha pendenza k. L’energia rispetto alla configurazione naturale è l’area triangolare fino a ℓ. Base ℓ per altezza kℓ, diviso due, dà kℓ²/2. La stessa energia si ottiene per deformazioni orientate opposte di uguale modulo.',
 r'F_{\mathrm{finale}}=k\ell\qquad U=\frac12\ell(k\ell)\qquad U=k\ell^2/2',
 'kℓ² senza mezzo è l’area del rettangolo, doppia di quella necessaria. kℓ è la forza e ha unità errata. Il segno negativo appartiene al lavoro di richiamo quando ci si allontana da x=0, non all’energia positiva rispetto al minimo. Il quoziente per ℓ² ha dimensione diversa da energia.', 'Usa la forza crescente, non il suo solo valore finale per tutta la corsa.'),
('Due molle diverse alla stessa deformazione',SCENE+'Con ℓ=2 m uguale nelle due prove, k passa da 2 a 4 N/m. Come cambia U?',['Da 4 a 8 J','Resta 4 J','Da 4 a 16 J','Da 4 a 2 J','Diventa negativa'],
 'Il quadrato della deformazione resta quattro metri quadrati. L’energia è lineare in k, quindi il raddoppio della rigidezza raddoppia U. Si confrontano molle con costanti diverse fra prove; ciascuna conserva la propria costante durante la deformazione.',
 r'U_A=\frac12(2)(2^2)\,\mathrm J\qquad U_A=4\,\mathrm J\qquad U_B=\frac12(4)(2^2)\,\mathrm J\qquad U_B=8\,\mathrm J',
 'Sedici introdurrebbe un quadrato del cambiamento di k che la legge non contiene. Due J inverte l’effetto della rigidezza e il valore negativo è incompatibile con k>0 e lo zero al minimo naturale. L’invarianza ignorerebbe il lavoro maggiore necessario alla molla più rigida.', 'Raddoppia k una volta sola; ℓ non cambia.'),
('Ricavare k dall’energia',SCENE+'Si misurano U=4 J e ℓ=2 m. Quanto vale k in N/m?',2,
 'Moltiplichiamo per due e dividiamo per il quadrato positivo della deformazione. Due volte quattro joule fanno otto; due metri al quadrato fanno quattro metri quadrati. Il rapporto otto su quattro dà due J/m², equivalenti a due N/m.',
 r'2U=k\ell^2\qquad k=2U/\ell^2\qquad 2U=8\,\mathrm J\qquad \ell^2=4\,\mathrm{m^2}\qquad k=2\,\mathrm{N/m}',
 'Il controllo (1/2)(2 N/m)(2 m)²=4 J restituisce l’energia. Omettere il fattore due nell’inversa darebbe k=1 N/m e soltanto 2 J. Dividere per ℓ invece che per ℓ² produrrebbe una forza, non la rigidezza.', 'Raddoppia l’energia prima di dividerla per il quadrato della deformazione.'),
('Una radice quadrata con unità di lunghezza',SCENE+'Si misurano U=4 J e k=2 N/m. Quanto vale ℓ in metri?',2,
 'Dalla legge isoliamo ℓ²=2U/k. Il rapporto otto joule su due newton al metro vale quattro metri quadrati. La radice positiva è due metri, perché ℓ è un modulo. Le coordinate orientate x=+2 m e x=−2 m hanno entrambe quel modulo e la stessa energia.',
 r'\ell^2=2U/k\qquad \ell^2=4\,\mathrm{m^2}\qquad \ell=\sqrt{2U/k}\qquad \ell=2\,\mathrm m',
 'Quattro m scambierebbe il numero del quadrato con quello della lunghezza e darebbe energia 16 J. Il ramo negativo −2 m non è un modulo; per una compressione si mantiene ℓ=2 m pur usando x<0. Non si contano due valori distinti di ℓ per quei due versi.', 'Prendi la radice anche dell’unità m² e scegli il modulo positivo.'),
('Raddoppiare la deformazione quadruplica l’energia',SCENE+'La stessa molla ha k=2 N/m; ℓ passa da 2 a 4 m. Quanto vale U_B/U_A?',['4','2','1/4','1/2','8'],
 'La forza finale raddoppia, ma nel grafico raddoppia anche la base del triangolo. L’area quadruplica. Calcolando i due valori troviamo U_A=4 J e U_B=16 J; il rapporto è quattro.',
 r'U_A=4\,\mathrm J\qquad U_B=16\,\mathrm J\qquad U_B/U_A=(4/2)^2\qquad U_B/U_A=4',
 'Due è il rapporto delle forze finali, non delle energie. Un quarto e un mezzo invertono confronti; otto aggiunge un fattore due che richiederebbe anche k doppia. La potenza due riguarda la deformazione, non ogni ingresso della legge.', 'Con k fisso usa il quadrato del rapporto delle deformazioni.'),
('Scarto da un’area rettangolare',SCENE+'Con k=2 N/m,ℓ=2 m si propone U_proposto=8 J. Quanto vale proposto meno corretto?',['+4 J','−4 J','+8 J','0 J','+2 J'],
 'L’energia corretta è (1/2)·2·2²=4 J. La proposta otto coincide con il prodotto forza finale per deformazione, che è l’area del rettangolo e dimentica il mezzo. Sottraiamo quattro da otto e otteniamo una sovrastima di quattro joule.',
 r'U=4\,\mathrm J\qquad e=(8-4)\,\mathrm J\qquad e=+4\,\mathrm J',
 '−4 inverte l’ordine, otto ripete la proposta, zero la accetta e due dimezza ancora lo scarto. Il segno del lavoro della forza elastica non cambia l’ordine della sottrazione fra energie assegnata nella domanda.', 'Controlla se è stato dimenticato il fattore 1/2 dell’area.'),
('L’inversa conserva il quadrato',SCENE+'Quale formula isola k dalla relazione U=kℓ²/2?',['k=2U/ℓ²','k=U/(2ℓ²)','k=2U/ℓ','k=ℓ²/(2U)','k=−2U/ℓ²'],
 'Moltiplicando per due eliminiamo il mezzo e dividendo per ℓ²>0 isoliamo k. Le unità sono energia su lunghezza al quadrato, equivalenti a rigidezza. La positività dei due dati dà k positivo.',
 r'2U=k\ell^2\qquad 2U/\ell^2=k\qquad k=2U/\ell^2',
 'U/(2ℓ²) è quattro volte più piccolo della formula corretta, perché divide per due anziché moltiplicare. Il divisore ℓ semplice dà una forza; il reciproco ha dimensione di cedevolezza. Il meno renderebbe k negativo per due moduli positivi, fuori dal regime assunto.', 'Il mezzo si elimina moltiplicando entrambi i membri per due.'),
('Scalare rigidezza e deformazione',SCENE+'Fra due prove k_B=κ₁k e ℓ_B=κ₂ℓ, con κ₁,κ₂>0 e k,ℓ riferiti ad A. Quanto vale U_B/U_A?',['κ₁ κ₂²','κ₁ κ₂','κ₁² κ₂','κ₁ / κ₂²','κ₁ + κ₂²'],
 'Sostituiamo i dati nuovi mantenendo il quadrato sull’intero allungamento κ₂ℓ. Il mezzo, k e ℓ² si cancellano nel rapporto con U_A. Rimane κ₁κ₂²: un fattore dalla rigidezza e due dalla deformazione.',
 r'U_A=k\ell^2/2\qquad U_B=\kappa_1k(\kappa_2\ell)^2/2\qquad U_B/U_A=\kappa_1\kappa_2^2',
 'κ₁κ₂ è il rapporto delle forze finali, non delle energie. κ₁²κ₂ mette il quadrato sull’ingresso sbagliato; il quoziente inverte l’effetto di ℓ. La somma darebbe due quando κ₁=κ₂=1, mentre l’energia dovrebbe restare identica.', 'Eleva al quadrato anche il fattore che moltiplica ℓ.'),
('Entrambi gli ingressi raddoppiano',SCENE+'A ha k=2 N/m,ℓ=2 m; B ha k=4 N/m,ℓ=4 m. Quanto vale U_B/U_A?',8,
 'La rigidezza doppia fornisce un fattore due, la deformazione doppia un fattore quattro. Il loro prodotto è otto. Le energie sono quattro e trentadue joule: il numero trentadue va ancora diviso per quattro per ottenere il rapporto.',
 r'U_A=4\,\mathrm J\qquad U_B=32\,\mathrm J\qquad U_B/U_A=2\times2^2\qquad U_B/U_A=8',
 'Quattro seguirebbe il rapporto delle forze oppure solo il quadrato della deformazione; due considererebbe soltanto k. Trentadue J è l’energia della seconda prova, non la risposta pura. Non occorrono decimali per eseguire 32/4.', 'Moltiplica due per il quadrato di due.'),
('Media delle energie, non degli ingressi',SCENE+'A usa k=2 N/m,ℓ=2 m e B usa k=4 N/m,ℓ=4 m. Qual è la media aritmetica di U_A,U_B con uguale peso?',['18 J','36 J','9 J','27/2 J','28 J'],
 'Le energie sono quattro e trentadue joule. La somma trentasei divisa per due dà diciotto joule. Se si mediassero prima gli ingressi, k=3 N/m e ℓ=3 m darebbero (1/2)·3·9=27/2 J: l’energia non è lineare congiuntamente in quei dati.',
 r'U_A=4\,\mathrm J\qquad U_B=32\,\mathrm J\qquad \overline U=\frac{4+32}{2}\,\mathrm J\qquad \overline U=18\,\mathrm J',
 'Trentasei è la somma, nove dimezza ancora e ventotto è la differenza. 27/2 J è il risultato sugli ingressi medi, diverso da 18 J=36/2 J. La media richiesta deve essere compresa fra quattro e trentadue.', 'Usa nella semisomma le due energie complete.'),
('Un obiettivo energetico fissa una radice',SCENE+'A ha k_A=2 N/m,ℓ_A=2 m. Si sceglie k_B=4 N/m e si vuole U_B=8U_A. Quanto vale ℓ_B/ℓ_A?',2,
 'La prima energia è quattro joule, quindi l’obiettivo è trentadue. L’inversa dà ℓ_B²=2U_B/k_B=64/4=16 m²; la radice positiva è quattro metri. Rapportando ai due iniziali otteniamo due. L’energia desiderata non richiede una deformazione otto volte maggiore.',
 r'U_B=32\,\mathrm J\qquad \ell_B^2=2U_B/k_B\qquad \ell_B^2=16\,\mathrm{m^2}\qquad \ell_B=4\,\mathrm m\qquad \ell_B/\ell_A=2',
 'Il rapporto quattro confonderebbe il fattore residuo sull’energia con la sua radice: con k doppia e ℓ quadrupla si avrebbe un fattore trentadue su U. Il ramo negativo non è un modulo e non aggiunge una seconda soluzione per ℓ_B.', 'Dopo aver tolto il fattore due di k, prendi la radice del fattore quattro rimasto.'),
('Tarare l’energia prima della rigidezza',SCENE+'Un display continuo adimensionale legge S=qU, con q>0 costante e offset nullo. Il riferimento k=2 N/m,ℓ=2 m dà S=12. Una prova con ℓ=4 m dà S=96. Quanto vale k in N/m?',4,
 'Il riferimento ha U=4 J: q=3 J⁻¹. La nuova lettura novantasei significa U=32 J. Nell’inversa k=2U/ℓ² il numeratore vale 64 J e il denominatore 16 m²: il quoziente dà quattro N/m.',
 r'q=3\,\mathrm{J^{-1}}\qquad U=96/q\qquad U=32\,\mathrm J\qquad k=2U/\ell^2\qquad k=4\,\mathrm{N/m}',
 'Il controllo (1/2)·4·4²=32 J e S=3·32=96 ricostruisce lettura ed energia. Scambiare S con joule darebbe k=12 N/m, con un guadagno spurio tre. La conversione strumentale precede l’inversa fisica.', 'Decodifica U e ricorda il quadrato della deformazione nuova.'),
('Taratura affine dell’energia',SCENE+'Un display continuo adimensionale legge S=qU+b, con q>0,b costanti. A: k=2 N/m,ℓ=2 m,S=9. B: k=4 N/m,ℓ=4 m,S=65. C: ℓ=2 m,S=17. Quanto vale k_C?',['2 N/m','3 N/m','4 N/m','5 N/m','8 N/m'],
 'I riferimenti hanno energie quattro e trentadue joule. La differenza 65−9=56 su 32−4=28 J dà q=2 J⁻¹. Dal primo riferimento b=1. La lettura diciassette dà U_C=(17−1)/2=8 J. Ora k_C=2·8/2²=4 N/m.',
 r'q=2\,\mathrm{J^{-1}}\qquad b=1\qquad U_C=(17-1)/q\qquad U_C=8\,\mathrm J\qquad k_C=2U_C/\ell_C^2\qquad k_C=4\,\mathrm{N/m}',
 'Per la deformazione di C le alternative k=2,3,5,8 N/m danno energie 4,6,10,16 J e letture 9,13,21,33. Solo quattro restituisce diciassette. Le letture grezze non possono essere rapportate come energie senza togliere l’offset.', 'Ricava q dalle differenze e b da uno dei riferimenti.'),
('Un vincolo che introduce il cubo della deformazione',SCENE+'Fra prove diverse si seleziona k=cℓ, con c=1 N/m² fisso. Il vincolo non cambia la rigidezza durante la singola deformazione. Si misura U=4 J. Quanto vale ℓ in metri?',2,
 'Sostituendo k=cℓ nell’energia otteniamo U=cℓ³/2. Il rapporto 2U/c vale otto metri cubi. La radice cubica esatta è due metri, perché 2·2·2=8; ricostruiamo k=cℓ=2 N/m. Non si usa la radice quadrata dell’inversa a k indipendente, perché qui anche k è legata a ℓ.',
 r'U=c\ell^3/2\qquad \ell^3=2U/c\qquad \ell^3=8\,\mathrm{m^3}\qquad \ell=2\,\mathrm m\qquad k=2\,\mathrm{N/m}',
 'La funzione cubica è strettamente crescente per ℓ>0, quindi questa soluzione positiva è unica. Un modulo negativo non è ammesso e, nel vincolo, produrrebbe anche k negativo. Il controllo (1/2)(2 N/m)(2 m)²=4 J verifica entrambe le condizioni dimensionali e numeriche.', 'Sostituisci il vincolo prima di scegliere quale radice prendere.')]
CHOICES={2:2,3:0,4:0,7:0,8:0,9:0,10:0,12:0,15:2}
UNITS={1:'J',5:'N/m',6:'m',11:'1',13:'1',14:'N/m',16:'m'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/spring-energy-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-spring-energy-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':4720+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L007','prerequisites':['C1-L001','C1-L002','C1-L005','C1-L006','C1-L007'],'reuse':['C6'],
            'family':'spring-energy','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'U è un’energia rispetto allo zero naturale: conserva il mezzo e il quadrato della deformazione.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L007'},
            'coverage':['Energia potenziale elastica','Lavoro e area forza-deformazione'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3,7):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio k=2 N/m: forza finale 4 N a ℓ=2 m; area triangolare 4 J. Primo grafico: 120 px/m e 60 px/N, triangolo di base240px e altezza240px. Secondo grafico: 80 px/m e 10 px/J, parabola esatta U=kℓ²/2 con punti(2m,4J) e(4m,16J). Gli assi e le scale sono distinti, non lunghezze fisiche della molla; zero di U alla configurazione naturale.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.spring_energy_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'spring-energy-047.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'spring-energy-047-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
