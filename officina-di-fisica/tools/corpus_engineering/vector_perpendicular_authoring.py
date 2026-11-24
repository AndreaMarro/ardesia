"""Author candidates for orthogonal displacement components; approval remains open."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


TASKS = [
 ("La diagonale di un percorso ad angolo retto", "Uno spostamento ha componenti a=3 m verso est e b=4 m verso nord su assi ortogonali. Quanto vale il suo modulo R, in metri?", 5,
  "Le componenti sono i cateti di un triangolo rettangolo e lo spostamento risultante è l’ipotenusa. Il teorema di Pitagora somma i quadrati dei cateti, non i cateti stessi. Solo dopo la somma estraiamo la radice positiva perché R è un modulo.",
  r"R^2=a^2+b^2\qquad R^2=(3\,\mathrm m)^2+(4\,\mathrm m)^2\qquad R^2=(9+16)\,\mathrm{m^2}=25\,\mathrm{m^2}\qquad R=\sqrt{25}\,\mathrm m=5\,\mathrm m",
  "La radice si riconosce a mano: 5·5=25. Cinque metri sono più di ciascuna componente e meno di 3+4=7 m, il cammino a due tratti. Dodici avrebbe unità m² come prodotto dei cateti, non sarebbe un modulo in metri.", "Disegna prima i due cateti, poi collega partenza e arrivo."),
 ("Dopo la radice tornano i metri", "Le componenti ortogonali di uno spostamento sono misurate in metri. Quale unità è compatibile con il modulo R=√(a²+b²)?", ["m²", "m", "s", "kg", "1"],
  "Ogni quadrato ha dimensione di area, quindi i due termini si possono sommare. La radice quadrata riporta la dimensione a una lunghezza. Non si prende la radice dei soli numeri dimenticando le unità.",
  r"[a^2+b^2]=L^2\qquad [R]=\sqrt{L^2}=L",
  "m è l’unità corretta. m² si fermerebbe prima della radice; s e kg appartengono a tempo e massa. 1 indicherebbe un numero puro, mentre il modulo cambia valore numerico quando cambiamo l’unità di lunghezza.", "Applica la radice anche alla dimensione fisica."),
 ("La condizione per usare Pitagora", "Uno spostamento ha componenti positive a verso est e b verso nord. Gli assi sono ortogonali. Quale relazione esprime il modulo R?", ["R=a+b", "R=|a−b|", "R=√(a²+b²)", "R=a²+b²", "R=√(a+b)"],
  "Le proiezioni sui due assi costruiscono un triangolo rettangolo. Pitagora dà R²=a²+b²; poiché R è positivo scegliamo la radice positiva. La formula dipende dall’ortogonalità: per un angolo diverso comparirebbe anche il termine con il coseno.",
  r"R^2=a^2+b^2\qquad R=\sqrt{a^2+b^2}>0",
  "a+b è il cammino lungo i due lati; |a−b| vale per componenti sulla stessa retta in versi opposti. a²+b² è il quadrato del modulo e ha dimensione L². √(a+b) ha dimensione √L e non può essere uno spostamento.", "Il modulo è l’ipotenusa, non la somma dei lati percorsi."),
 ("Una componente aumenta, l’altra resta fissa", "Gli assi est e nord sono ortogonali. Si passa da a₁=3 m,b₁=4 m ad a₂=16/3 m,b₂=4 m. Quale confronto fra i moduli è corretto?", ["R passa da 5 m a 20/3 m", "R resta 5 m", "R passa da 5 m a 4 m", "R raddoppia a 10 m", "R diventa nullo"],
  "a è positivo e aumenta; a² aumenta e b² rimane sedici metri quadrati. La radice è crescente, quindi il modulo aumenta. Per ricavare il valore esatto trasformiamo 16 in 144/9 prima di sommarlo a 256/9.",
  r"R_1=\sqrt{9+16}\,\mathrm m=5\,\mathrm m\qquad R_2=\sqrt{\frac{256}{9}+\frac{144}{9}}\,\mathrm m\qquad R_2=\sqrt{\frac{400}{9}}\,\mathrm m=\frac{20}{3}\,\mathrm m",
  "La frazione 20/3 supera 5=15/3, senza bisogno di decimali. L’altra componente impedisce di dedurre il fattore di variazione del modulo dal solo fattore di a. Le risposte invariata, diminuita o nulla contraddicono l’aumento del quadrato; il raddoppio richiederebbe R₂²=100 m².", "Porta i due quadrati al denominatore nove."),
 ("Ricostruire un cateto", "Uno spostamento ha componenti positive a verso est e b=4 m verso nord su assi ortogonali. Il modulo è R=5 m. Quanto vale a, in metri?", 3,
  "Eleviamo al quadrato la relazione del modulo, sottraiamo il quadrato della componente nota e prendiamo la radice positiva. L’operazione è possibile perché R>b>0: resta un quadrato positivo. Sottrarre direttamente 5−4 tratterebbe il triangolo come una retta.",
  r"R^2=a^2+b^2\qquad a^2=R^2-b^2\qquad a^2=(25-16)\,\mathrm{m^2}=9\,\mathrm{m^2}\qquad a=\sqrt9\,\mathrm m=3\,\mathrm m",
  "La radice negativa risolverebbe l’equazione quadratica per una componente con segno, ma il testo impone a>0 verso est. Il controllo 3²+4²=25 ricostruisce R=5 m.", "Togli il quadrato di b dal quadrato di R prima della radice."),
 ("Cammino e diagonale", "Una persona percorre 3 m verso est e poi 4 m verso nord, lungo due tratti rettilinei perpendicolari. Di quanto la distanza percorsa supera il modulo dello spostamento?", ["2 m", "7 m", "5 m", "1 m", "12 m"],
  "La distanza percorsa segue entrambi i tratti e si somma: tre più quattro. Lo spostamento collega direttamente partenza e arrivo e ha modulo pari alla diagonale del triangolo rettangolo. Si confrontano quindi due lunghezze diverse, entrambe in metri.",
  r"d=(3+4)\,\mathrm m=7\,\mathrm m\qquad R=\sqrt{3^2+4^2}\,\mathrm m=5\,\mathrm m\qquad d-R=(7-5)\,\mathrm m=2\,\mathrm m",
  "7 m e 5 m sono i due valori prima del confronto; la domanda chiede la loro differenza. 1 m sottrae soltanto le componenti e 12 m deriva dal loro prodotto numerico. L’eccesso di due metri dipende dal percorso ad angolo: non è un errore nella misura del modulo.", "Calcola separatamente lunghezza della spezzata e diagonale."),
 ("Confrontare due triangoli", "Le componenti ortogonali iniziali sono a₁=3 m,b₁=4 m. Nella seconda prova a₂=3 m,b₂=9/4 m. Quanto vale R₂/R₁?", ["3/4", "4/3", "9/16", "3/8", "−1/4"],
  "Il primo triangolo ha modulo cinque metri. Nel secondo, 3²=9=144/16 e (9/4)²=81/16; la somma è 225/16. La sua radice è 15/4 perché 15²=225 e 4²=16. Dividiamo infine per cinque.",
  r"R_1=5\,\mathrm m\qquad R_2=\sqrt{\frac{144+81}{16}}\,\mathrm m=\frac{15}{4}\,\mathrm m\qquad \frac{R_2}{R_1}=\frac{15}{4}\times\frac15=\frac34",
  "Il rapporto è inferiore a uno: la componente nord è diminuita. 4/3 inverte il rapporto; 9/16 confronta soltanto le componenti nord. 3/8 dimezza una seconda volta e −1/4 non può essere rapporto fra moduli positivi.", "Sotto la seconda radice usa il denominatore sedici."),
 ("Lo scarto del modulo proposto", "Uno spostamento ha componenti ortogonali 3 m verso est e 4 m verso nord. Una soluzione propone R_proposto=10 m. Quanto vale lo scarto «proposto meno corretto»?", ["+5 m", "−5 m", "+10 m", "+3 m", "0 m"],
  "Il modulo corretto è cinque metri, ottenuto da √(9+16). Il dieci proposto è il doppio del valore corretto, ma lo scarto richiesto è una differenza in metri, non il rapporto due.",
  r"R=\sqrt{3^2+4^2}\,\mathrm m=5\,\mathrm m\qquad e=(10-5)\,\mathrm m=+5\,\mathrm m",
  "+5 m misura la sovrastima. −5 m cambierebbe l’ordine del confronto; +10 m ometterebbe il valore corretto. +3 m sottrarrebbe il cammino di 7 m e zero tratterebbe come esatta la proposta sbagliata.", "Prima trova l’ipotenusa; poi sottraila da dieci metri."),
 ("L’inversa richiede un dominio", "Su assi ortogonali, a>0 e b>0 sono componenti di uno spostamento con modulo R=√(a²+b²). Sapendo che R>b, quale formula ricava a?", ["a=√(R²−b²)", "a=R−b", "a=√(R²+b²)", "a=−√(R²−b²)", "a=R²−b²"],
  "R e a sono positivi, quindi possiamo elevare al quadrato senza scegliere un ramo ambiguo. Sottraiamo b² per isolare a². Il vincolo R>b garantisce radicando strettamente positivo; a>0 seleziona la radice positiva.",
  r"R^2=a^2+b^2\qquad R^2-b^2=a^2\qquad a=\sqrt{R^2-b^2}",
  "R−b ignora i quadrati; la somma sotto radice ingrandirebbe R invece di recuperare un cateto. La radice negativa contraddice a>0 e l’espressione senza radice ha dimensione di area. Se R=b si avrebbe a=0, caso escluso; R<b sarebbe incompatibile con i dati.", "Isola a², poi applica il vincolo sul segno di a."),
 ("Due fattori sotto la radice", "Le componenti ortogonali positive a,b diventano κ₁a,κ₂b in una nuova prova, con κ₁,κ₂>0. Quale rapporto R₂/R₁ segue dal modello?", ["√(κ₁²a²+κ₂²b²)/√(a²+b²)", "κ₁κ₂", "(κ₁a+κ₂b)/(a+b)", "√(κ₁a²+κ₂b²)/√(a²+b²)", "(κ₁²a²+κ₂²b²)/(a²+b²)"],
  "Ogni nuova componente va elevata interamente al quadrato. Per questo anche κ₁ e κ₂ sono al quadrato sotto la radice. Il modulo iniziale è positivo, dunque la divisione per esso è lecita. Il rapporto resta adimensionale.",
  r"R_1=\sqrt{a^2+b^2}\qquad R_2=\sqrt{(\kappa_1a)^2+(\kappa_2b)^2}\qquad \frac{R_2}{R_1}=\frac{\sqrt{\kappa_1^2a^2+\kappa_2^2b^2}}{\sqrt{a^2+b^2}}",
  "κ₁κ₂ presuppone una legge a prodotto, e il rapporto di somme presuppone tratti concordi sulla stessa retta. L’opzione con fattori non quadrati perde parte della potenza; l’ultima calcola il rapporto dei quadrati dei moduli. Se κ₁=κ₂=κ>0 la formula corretta si riduce a κ, offrendo un controllo immediato.", "Sostituisci κ₁a al posto di a anche dentro il quadrato."),
 ("Stessa forma, orientamento diverso", "Uno spostamento ha prima componenti ortogonali a₁=3 m,b₁=4 m e poi a₂=8 m,b₂=6 m, sempre verso est e nord. Quanto vale R₂/R₁?", 2,
  "Il primo triangolo è il 3–4–5. Il secondo ha cateti sei e otto, cioè il doppio di quattro e tre scambiati: scambiare i cateti non cambia la somma dei loro quadrati. Possiamo riconoscere il triangolo 6–8–10 oppure calcolarlo direttamente.",
  r"R_1=\sqrt{9+16}\,\mathrm m=5\,\mathrm m\qquad R_2=\sqrt{64+36}\,\mathrm m=10\,\mathrm m\qquad \frac{R_2}{R_1}=\frac{10}{5}=2",
  "Il modulo raddoppia, pur non raddoppiando ciascuna componente associata allo stesso asse. Il rapporto 8/3 o 6/4 descrive una singola proiezione; la direzione cambia, ma il modulo dipende dalla somma dei quadrati.", "Osserva che sei e otto sono il doppio dei cateti quattro e tre."),
 ("Mediare due moduli", "Due prove su assi ortogonali hanno componenti (3 m,4 m) e (8 m,6 m). Con uguale peso statistico, qual è la media aritmetica dei moduli?", ["15/2 m", "15 m", "15/4 m", "13/2 m", "17/2 m"],
  "Ricaviamo prima i moduli cinque e dieci metri. La media assegna metà peso a ciascuno, quindi è la semisomma. Manteniamo la frazione esatta: non occorre approssimare alcuna radice.",
  r"R_1=5\,\mathrm m\qquad R_2=10\,\mathrm m\qquad \overline R=\frac{5+10}{2}\,\mathrm m=\frac{15}{2}\,\mathrm m",
  "15 m manca della divisione per due e 15/4 m la applica due volte. 13/2 m e 17/2 m non sono la semisomma di cinque e dieci. Mediare prima le componenti darebbe invece √221/2 m, perché le componenti medie sono 11/2 m e 5 m: il modulo non è lineare nelle due componenti.", "Usa le due ipotenuse, non le medie dei cateti."),
 ("Scegliere la nuova componente nord", "Le componenti ortogonali iniziali sono a₁=3 m,b₁=4 m, entrambe positive. Poi a₂=8 m e si richiede R₂=2R₁, con b₂>0 verso nord. Quale rapporto b₂/b₁ serve?", ["3/2", "2", "8/3", "3/4", "−3/2"],
  "Il modulo iniziale vale cinque metri, perciò il nuovo deve essere dieci. Il quadrato della componente nord deve completare a cento il quadrato di otto. Sottraiamo sessantaquattro e prendiamo la radice positiva di trentasei; poi confrontiamo con i quattro metri iniziali.",
  r"R_1=5\,\mathrm m\qquad R_2=10\,\mathrm m\qquad b_2^2=R_2^2-a_2^2=(100-64)\,\mathrm{m^2}=36\,\mathrm{m^2}\qquad b_2=6\,\mathrm m\qquad \frac{b_2}{b_1}=\frac64=\frac32",
  "R₂>a₂ rende possibile una componente positiva. Il rapporto 2 imporrebbe lo stesso raddoppio ai cateti nonostante a₂ sia già assegnato; 8/3 riguarda a. 3/4 dimezza il rapporto corretto e il segno negativo viola il verso nord richiesto. Verificando, √(8²+6²)=10.", "Dopo aver fissato R₂, isola b₂² nella relazione di Pitagora."),
 ("Tarare prima di ricostruire il cateto", "Gli spostamenti hanno componenti positive verso est e nord su assi ortogonali. R indica il modulo dello spostamento. Un display conta tacche T=gR, con g>0 costante e offset nullo. Il riferimento (a=3 m,b=4 m) dà T=15. Nella nuova prova T=30,b=6 m. Quanto vale a, in metri?", 8,
  "Il riferimento ha R=5 m; quindici tacche corrispondono quindi a un guadagno di tre per metro. La lettura trenta rappresenta dieci metri. Soltanto dopo averla convertita in un modulo possiamo usare l’inversa di Pitagora con il cateto noto di sei metri.",
  r"R_{\rm rif}=5\,\mathrm m\qquad g=\frac{15}{5\,\mathrm m}=3\,\mathrm{m^{-1}}\qquad R=\frac{30}{3\,\mathrm{m^{-1}}}=10\,\mathrm m\qquad a^2=R^2-b^2=(100-36)\,\mathrm{m^2}=64\,\mathrm{m^2}\qquad a=8\,\mathrm m",
  "La soluzione positiva è unica perché a>0; R=10 m supera b=6 m. Il controllo ricompone √(8²+6²)=10 e T=3 m⁻¹·10 m=30. Usare trenta come lunghezza salterebbe la taratura e produrrebbe un triangolo diverso.", "Quante tacche corrispondono a un metro nel riferimento?"),
 ("Taratura affine con una frazione", "I componenti a,b sono positivi, verso est e nord su assi ortogonali. R indica il modulo dello spostamento. Un display conta tacche T=gR+c, con g>0,c costanti. I riferimenti sono (a=3 m,b=4 m,T=11) e (a=8 m,b=6 m,T=21). La prova ignota ha b=4 m,T=43/3. Quanto vale a?", ["16/3 m", "8/3 m", "32/3 m", "13/3 m", "19/3 m"],
  "I moduli dei riferimenti sono cinque e dieci metri. La differenza fra letture dà g=10/5=2 m⁻¹; dal primo riferimento segue c=1. Nella nuova lettura togliamo una tacca scrivendo 1=3/3; poi dividiamo per due. Infine sottraiamo i quadrati con denominatore nove.",
  r"g=\frac{21-11}{(10-5)\,\mathrm m}=2\,\mathrm{m^{-1}}\qquad c=11-2\times5=1\qquad R=\frac{43/3-3/3}{2\,\mathrm{m^{-1}}}=\frac{20}{3}\,\mathrm m\qquad a^2=R^2-b^2=\left(\frac{400}{9}-\frac{144}{9}\right)\,\mathrm{m^2}=\frac{256}{9}\,\mathrm{m^2}\qquad a=\frac{16}{3}\,\mathrm m",
  "16²=256 e 3²=9 danno la radice esatta; R>b>0 garantisce il ramo richiesto. 8/3 e 32/3 dimezzano o raddoppiano il risultato senza ragione; 13/3 e 19/3 lo spostano di un metro, confondendo un offset in tacche con una correzione del cateto. Il display ricostruito vale 2·20/3+1=43/3.", "Elimina l’offset con le differenze, poi usa frazioni esatte."),
 ("Un triangolo di forma assegnata", "Uno spostamento ha componenti positive a verso est e b verso nord su assi ortogonali. Il vincolo è a=(3/4)b e il modulo è R=5 m. Quanto vale b?", ["4 m", "3 m", "5 m", "2 m", "8 m"],
  "Il vincolo impone il rapporto fra i cateti. Sostituiamo a nella relazione quadratica: nove sedicesimi di b² più b² fanno venticinque sedicesimi di b². Essendo b positivo, la radice del quadrato è b e la radice di 25/16 è 5/4.",
  r"R^2=\left(\frac34b\right)^2+b^2=\frac{25}{16}b^2\qquad R=\frac54b\qquad b=\frac45R=\frac45\times5\,\mathrm m=4\,\mathrm m\qquad a=3\,\mathrm m",
  "La coppia (3 m,4 m) soddisfa entrambi i dati. 3 m scambia il cateto richiesto; 5 m confonde cateto e ipotenusa. 2 m e 8 m darebbero moduli 5/2 m e 10 m. Senza il rapporto a/b, conoscere il solo modulo lascerebbe molte coppie di componenti positive.", "Sostituisci il vincolo prima di prendere la radice.")
]
CHOICES = {2:1,3:2,4:0,6:0,7:0,8:0,9:0,10:0,12:0,13:0,15:0,16:0}


def assemble(repo, source_ref):
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,'packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json'))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/vector-perpendicular-triangle.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u1-vector-perpendicular-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':'1' if n==11 else 'm','tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Vettori e componenti','order':2120+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L002','prerequisites':['C1-L001','C1-L002'],'reuse':['C6'],
            'family':'path-versus-displacement' if n==6 else 'orthogonal-displacement-components','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Verifica il triangolo con i quadrati e distingui cateti, cammino e modulo.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',6:'concetto',7:'calcolo',8:'calcolo',10:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L002'},
            'coverage':['Vettori','Componenti cartesiane'],'review':'Candidato autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
        assets={}
        if n in (1,3,6):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe alla stessa scala: componenti di 3 m a est e 4 m a nord; diagonale fra gli estremi; confronto tra cammino di 7 m e modulo di 5 m. L’angolo retto giustifica Pitagora.'})
            assets[file.name]=asset['id']
        records.append(row)
        bindings.append({'id':row['id'],'sourceId':source_id,'sourceSha256':digest(sources[source_id]),'candidateSha256':digest(row),'assetChecksums':assets,'sourceRef':source_ref})
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
    (args.destination/'vectors-perpendicular-005.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'vectors-perpendicular-005-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
