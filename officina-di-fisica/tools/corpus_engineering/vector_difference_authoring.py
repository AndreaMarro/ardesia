"""Author candidates for opposite collinear displacements; no scientific approval."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


# title, task, exact answer/options, reasoning, equations, interpretation, first hint
TASKS = [
 ("Quattro metri avanti, uno indietro", "Una persona parte dall’origine, percorre 4 m verso est e poi 1 m verso ovest sulla stessa retta. Quanto vale, in metri, il modulo D dello spostamento complessivo?", 3,
  "Orientiamo l’asse verso est. Il primo spostamento ha componente +4 m; il ritorno ha componente −1 m. La somma delle componenti collega partenza e arrivo. Il suo valore è positivo, perciò il modulo coincide con la componente risultante.",
  r"\Delta x=4\,\mathrm m-1\,\mathrm m=3\,\mathrm m\qquad D=|\Delta x|=3\,\mathrm m",
  "L’arrivo è tre metri a est della partenza. I cinque metri ottenuti sommando 4+1 misurano invece il cammino percorso. Uno sarebbe soltanto il ritorno e quattro soltanto l’andata: nessuno dei due rappresenta il cambiamento complessivo di posizione.", "Segna il punto a 4 m, poi torna indietro di una tacca."),
 ("L’unità sopravvive alla sottrazione", "D è il modulo dello spostamento risultante di due tratti sulla stessa retta in versi opposti. Quale unità è dimensionalmente adatta a D?", ["K", "A", "m", "kg", "s"],
  "La posizione iniziale e quella finale sono lunghezze. La loro differenza è ancora una lunghezza: il valore assoluto ne toglie il segno senza cambiarne la dimensione. La direzione di un vettore non costituisce un’unità aggiuntiva.",
  r"[\Delta x]=L\qquad [D]=[|\Delta x|]=L",
  "Il metro è compatibile. Kelvin, ampere, chilogrammo e secondo misurano rispettivamente temperatura, corrente, massa e tempo; non diventano unità di spostamento quando i due tratti si compensano.", "Riconosci la dimensione della differenza fra due posizioni."),
 ("Quando il modulo diventa una differenza", "Due spostamenti consecutivi hanno moduli a verso est e b verso ovest, sulla stessa retta. Si sa che a>b>0. Quale relazione dà il modulo totale D?", ["D=a−b", "D=a+b", "D=b−a", "D=√(a²+b²)", "D=ab"],
  "Con l’est positivo, le componenti sono +a e −b. La regola è sempre la somma vettoriale: in una dimensione diventa a−b. La condizione a>b dice che questa componente è positiva e consente di togliere il valore assoluto.",
  r"\Delta x=a+(-b)=a-b\qquad D=|a-b|=a-b\quad(a>b)",
  "a+b è il cammino; b−a è negativo e non può essere un modulo. Pitagora richiederebbe tratti perpendicolari, mentre ab avrebbe dimensione di area. Se venisse tolta l’ipotesi a>b occorrerebbe conservare |a−b| e stabilire il verso separatamente.", "Assegna il segno a ogni componente prima di calcolare il modulo."),
 ("Allungare soltanto l’andata", "In due prove i tratti restano sulla stessa retta: a verso est e b verso ovest. Inizialmente a=4 m,b=1 m; poi a=6 m,b=1 m. Come cambia D?", ["Aumenta da 3 m a 5 m", "Raddoppia da 3 m a 6 m", "Resta 3 m", "Diminuisce a 1 m", "Diventa nullo"],
  "Il ritorno resta di un metro. Nella seconda prova si sottrae quindi lo stesso contributo da un’andata maggiore. Entrambe le prove rispettano a>b>0: la risultante resta verso est e il modulo è la differenza.",
  r"D_1=4\,\mathrm m-1\,\mathrm m=3\,\mathrm m\qquad D_2=6\,\mathrm m-1\,\mathrm m=5\,\mathrm m",
  "L’aumento è di due metri, uguale all’aumento dell’andata. Non c’è un raddoppio: 5/3 è il rapporto fra i risultati. Un modulo nullo richiederebbe a=b; la diminuzione richiederebbe un ritorno maggiore a parità di andata.", "Mantieni il ritorno di un metro in entrambi i conti."),
 ("Ricostruire l’andata", "Un percorso rettilineo comprende a metri verso est e b=1 m verso ovest. Il modulo finale è D=3 m e l’arrivo è a est della partenza, con a>b>0. Quanto vale a, in metri?", 4,
  "Il ritorno ha tolto un metro all’andata. Per ricostruire l’andata dobbiamo restituire quel metro al risultato. Partiamo da D=a−b e aggiungiamo b a entrambi i membri: l’operazione conserva l’uguaglianza.",
  r"D+b=a-b+b=a\qquad a=D+b\qquad a=3\,\mathrm m+1\,\mathrm m=4\,\mathrm m",
  "Il controllo 4−1=3 restituisce il modulo dato e 4>1 soddisfa il vincolo. Sottrarre ancora b darebbe due metri: dopo il ritorno ne resterebbe uno, quindi non ricostruirebbe la misura.", "Per annullare il termine −b aggiungi b su entrambi i lati."),
 ("Quanto si è tornati indietro?", "Si percorrono a=4 m verso est e poi b metri verso ovest sulla stessa retta. Si resta a est della partenza e il modulo finale è D=3 m, con 0<b<a. Quanto vale b, in metri?", 1,
  "La differenza fra il tratto di andata e la posizione raggiunta misura quanto si è tornati indietro. Nell’equazione D=a−b possiamo aggiungere b e sottrarre D da entrambi i membri: rimane b=a−D.",
  r"D+b=a\qquad b=a-D\qquad b=4\,\mathrm m-3\,\mathrm m=1\,\mathrm m",
  "Un metro di ritorno porta da +4 m a +3 m. La quantità b è il modulo positivo del ritorno; la sua componente sull’asse est sarebbe −1 m. Confondere b con tale componente produrrebbe un segno sbagliato nell’equazione.", "Confronta i quattro metri di andata con i tre metri rimasti."),
 ("Un ritorno maggiore riduce il modulo", "In due prove rettilinee l’andata è sempre a=4 m verso est. Il ritorno verso ovest passa da b₁=1 m a b₂=2 m. Quanto vale D₂/D₁?", ["2/3", "3/2", "2", "1/3", "−2/3"],
  "Prima ricostruiamo i due risultati: restano tre metri nella prima prova e due nella seconda. Il rapporto richiesto ha il secondo risultato al numeratore. I metri si semplificano e la frazione due terzi è già ridotta.",
  r"D_1=(4-1)\,\mathrm m=3\,\mathrm m\qquad D_2=(4-2)\,\mathrm m=2\,\mathrm m\qquad \frac{D_2}{D_1}=\frac{2\,\mathrm m}{3\,\mathrm m}=\frac23",
  "Il rapporto deve stare fra zero e uno. 3/2 inverte il confronto; 2 confronta i ritorni invece dei risultati; 1/3 è la diminuzione relativa (3−2)/3. Il valore negativo non può essere un rapporto fra questi moduli positivi.", "Calcola le due differenze prima di formare la frazione."),
 ("Il segno della sovrastima", "Una persona percorre 4 m a est e 1 m a ovest sulla stessa retta. Una soluzione propone D_proposto=6 m per il modulo finale. Quanto vale lo scarto definito come «proposto meno corretto»?", ["+3 m", "−3 m", "+6 m", "+2 m", "0 m"],
  "La risposta corretta è |4−1|=3 m. Lo scarto confronta la proposta con quel risultato e va calcolato nell’ordine indicato, senza sostituire al valore corretto la lunghezza del cammino.",
  r"D=|4-1|\,\mathrm m=3\,\mathrm m\qquad e=6\,\mathrm m-3\,\mathrm m=+3\,\mathrm m",
  "Il segno positivo segnala una sovrastima. −3 m sarebbe lo scarto con ordine opposto; +6 m trascura il valore corretto. +2 m usa l’andata come confronto e zero presuppone che la proposta sia già corretta.", "Scrivi 6 m meno il modulo ottenuto sommando le componenti."),
 ("Invertire una differenza", "Due tratti rettilinei sono a verso est e b verso ovest, con a>b>0. Si conoscono D=a−b>0 e b. Quale relazione ricava a?", ["a=D+b", "a=D−b", "a=b−D", "a=D/b", "a=Db"],
  "Per isolare a dobbiamo eliminare la sottrazione di b. Aggiungiamo la stessa lunghezza b a entrambi i membri. D e b possono essere sommati perché hanno la stessa dimensione e devono essere espressi nella stessa unità.",
  r"D+b=a-b+b\qquad a=D+b",
  "L’inversa ricostruisce a−b=(D+b)−b=D e assicura a>b perché D>0. D−b sottrae due volte il ritorno; b−D può persino risultare negativo. D/b è adimensionale e Db è un’area, quindi non possono esprimere a.", "Quale operazione annulla −b?"),
 ("Fattori dentro una differenza", "Nella prima prova a>b>0 sono i moduli dei tratti verso est e ovest. Nella seconda diventano κ₁a e κ₂b, con κ₁,κ₂>0 e κ₁a>κ₂b. Quale formula dà D₂/D₁?", ["(κ₁a−κ₂b)/(a−b)", "κ₁κ₂", "κ₁−κ₂", "(κ₁a+κ₂b)/(a−b)", "(κ₁a−κ₂b)/(a+b)"],
  "Le ipotesi impongono una risultante verso est in entrambe le prove. Sostituiamo i due tratti nella differenza e dividiamo per la differenza iniziale, diversa da zero. I fattori moltiplicano addendi distinti: non si combinano in un prodotto indipendente da a e b.",
  r"D_1=a-b>0\qquad D_2=\kappa_1a-\kappa_2b>0\qquad \frac{D_2}{D_1}=\frac{\kappa_1a-\kappa_2b}{a-b}",
  "Con κ₁=κ₂=1 il rapporto deve essere uno: κ₁−κ₂ fallisce già questo controllo. κ₁κ₂ fallisce quando entrambi i tratti raddoppiano, perché darebbe quattro anziché due. Le alternative con una somma confondono cammino e spostamento in una delle due prove.", "Scrivi il nuovo modulo prima di confrontarlo con quello iniziale."),
 ("Cambiano entrambi i tratti", "Due percorsi sulla stessa retta hanno un tratto a verso est e uno b verso ovest. La prima prova ha a₁=4 m,b₁=1 m; la seconda a₂=6 m,b₂=2 m. Quanto vale D₂/D₁?", ["4/3", "3/4", "3", "2", "1/3"],
  "Non basta confrontare le andate o i ritorni: cambiano entrambi. Nella prima prova il ritorno cancella un metro dei quattro; nella seconda ne cancella due dei sei. Entrambe terminano a est e possiamo usare le differenze positive.",
  r"D_1=4\,\mathrm m-1\,\mathrm m=3\,\mathrm m\qquad D_2=6\,\mathrm m-2\,\mathrm m=4\,\mathrm m\qquad \frac{D_2}{D_1}=\frac43",
  "Il rapporto 4/3 è maggiore di uno ma minore del rapporto 6/4 fra le andate. 3/4 inverte le prove; 3 moltiplica i fattori 6/4 e 2/1 come se D fosse un prodotto. 2 confronta soltanto i ritorni e 1/3 è l’aumento relativo del modulo.", "Trova prima i tre metri e i quattro metri rimasti."),
 ("Media di due risultati", "Due prove rettilinee hanno tratti a verso est e b verso ovest. La prima usa a=4 m,b=1 m; la seconda a=6 m,b=2 m. Con uguale peso statistico, qual è la media dei due moduli D?", ["7/2 m", "7 m", "7/4 m", "9/2 m", "5/2 m"],
  "I moduli sono 3 m e 4 m. Per dare uguale peso alle due prove sommiamo i risultati e dividiamo per due, senza arrotondare. Sette mezzi è una misura esatta e sta fra tre e quattro metri.",
  r"D_1=(4-1)\,\mathrm m=3\,\mathrm m\qquad D_2=(6-2)\,\mathrm m=4\,\mathrm m\qquad \overline D=\frac{3+4}{2}\,\mathrm m=\frac72\,\mathrm m",
  "7 m è la somma senza la divisione; 7/4 m divide due volte. 9/2 m e 5/2 m non sono neppure fra i due risultati. In questo dominio anche la differenza delle medie dà 5−3/2=7/2 m; la linearità vale qui perché nessuna delle risultanti cambia verso.", "La media di tre e quattro deve trovarsi fra quei due numeri."),
 ("Progettare il ritorno", "I tratti sono sempre rettilinei, a verso est e b verso ovest, con a>b>0 in ogni prova. Inizialmente a₁=4 m,b₁=1 m. Poi si impone a₂=6 m e si vuole D₂=(4/3)D₁. Quanto deve valere b₂/b₁?", 2,
  "Il modulo iniziale è tre metri. Il nuovo obiettivo è quattro terzi di tre, cioè quattro metri: il tre si semplifica senza decimali. Dal tratto di andata di sei metri dobbiamo sottrarre un ritorno che lasci esattamente quattro metri.",
  r"D_1=(4-1)\,\mathrm m=3\,\mathrm m\qquad D_2=\frac43\times3\,\mathrm m=4\,\mathrm m\qquad b_2=a_2-D_2=(6-4)\,\mathrm m=2\,\mathrm m\qquad \frac{b_2}{b_1}=2",
  "Il nuovo ritorno è positivo e inferiore a 6 m, quindi conserva il ramo previsto. La sostituzione 6−2=4 controlla l’obiettivo. Moltiplicare semplicemente b per 4/3 ignorerebbe che è cambiata anche l’andata.", "Ricava il nuovo D, poi usa b=a−D."),
 ("Una taratura senza offset", "I tratti rettilinei sono a verso est e b verso ovest, con a>b>0 in tutte le prove. Un display dà il conteggio T=gD, con g>0 costante e offset nullo. Per a=4 m,b=1 m indica T=9. Nella prova ignota indica T=12 e b=2 m. Quanto vale a, in metri?", 6,
  "Nel riferimento D=3 m: nove tacche corrispondono a tre metri, quindi il guadagno è tre tacche per metro. T è un numero puro e g ha unità m⁻¹. Correggiamo la lettura nuova dividendo per g; poi invertiamo D=a−b aggiungendo b.",
  r"D_{\rm rif}=(4-1)\,\mathrm m=3\,\mathrm m\qquad g=\frac{9}{3\,\mathrm m}=3\,\mathrm{m^{-1}}\qquad D=\frac{12}{3\,\mathrm{m^{-1}}}=4\,\mathrm m\qquad a=D+b=(4+2)\,\mathrm m=6\,\mathrm m",
  "La ricostruzione dà T=3 m⁻¹·(6 m−2 m)=12. Il vincolo 6>2>0 è rispettato. Sottrarre due metri da dodici tacche mescolerebbe grandezze diverse; la correzione strumentale precede il calcolo del tratto.", "Trasforma prima dodici tacche in metri."),
 ("Due riferimenti separano guadagno e offset", "In tutte le prove a>b>0 sono tratti sulla stessa retta, a verso est e b verso ovest. Il display conta tacche T=gD+c con g>0,c costanti. I riferimenti sono (a=4 m,b=1 m,T=7) e (a=6 m,b=2 m,T=9). La prova ignota ha T=11,b=1 m. Quanto vale a?", ["6 m", "5 m", "7 m", "3 m", "12 m"],
  "I riferimenti danno D₁=3 m e D₂=4 m. Sottraendo le letture l’offset scompare: due tacche per un metro danno g=2 m⁻¹. Il primo riferimento lascia c=7−2·3=1. Dalla nuova lettura sottraiamo l’offset e dividiamo per il guadagno prima di ricostruire l’andata.",
  r"g=\frac{9-7}{(4-3)\,\mathrm m}=2\,\mathrm{m^{-1}}\qquad c=7-2\times3=1\qquad D=\frac{11-1}{2\,\mathrm{m^{-1}}}=5\,\mathrm m\qquad a=D+b=(5+1)\,\mathrm m=6\,\mathrm m",
  "Il controllo completo è 2 m⁻¹·(6 m−1 m)+1=11. 5 m è il modulo D prima di restituire il ritorno; 7 m non riproduce la lettura. 3 m riusa il primo riferimento e 12 m tratta le tacche come metri. a=6 m soddisfa anche a>b>0.", "Trova il guadagno usando la differenza fra i due riferimenti."),
 ("Un rapporto fra i tratti rende unica la risposta", "Un percorso rettilineo comprende a verso est e b verso ovest. Si sa che a=4b, con b>0, e che il modulo finale D è 3 m. Quanto vale b?", ["1 m", "1/2 m", "0 m", "−1 m", "2 m"],
  "Il vincolo a=4b assicura a>b e permette di sostituire l’andata nella differenza. Quattro copie di b meno una copia di b lasciano tre copie: il modulo misurato è dunque 3b. Dividiamo entrambi i membri per tre.",
  r"D=a-b=4b-b=3b\qquad b=\frac D3=\frac{3\,\mathrm m}{3}=1\,\mathrm m\qquad a=4b=4\,\mathrm m",
  "La coppia (4 m,1 m) riproduce sia il vincolo sia D=3 m. Mezzo metro darebbe D=3/2 m e due metri darebbero D=6 m. Zero e −1 m violano b>0. Senza a=4b la sola differenza ammetterebbe molte coppie positive.", "Sostituisci a con 4b prima di fare operazioni numeriche.")
]
CHOICES = {2:2,3:0,4:0,7:0,8:0,9:0,10:0,11:0,12:0,15:0,16:0}


def assemble(repo, source_ref):
    sources = {q['id']:q for q in json.loads(git_bytes(repo, source_ref, 'packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json'))}
    file = Path(__file__).resolve().parents[2]/'editorial/assets/vector-difference-return.svg'
    raw = file.read_bytes()
    asset = {'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records, bindings = [], []
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id = f'u1-vector-difference-{n:02}'
        target = {'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':'1' if n==13 else 'm','tolerance':0}
        row = {'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Vettori e componenti','order':2100+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L002','prerequisites':['C1-L001','C1-L002'],'reuse':['C6'],
            'family':'collinear-opposite-displacements','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Controlla il verso finale e ricostruisci la differenza con unità omogenee.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L002'},
            'coverage':['Vettori','Spostamento e posizione'],'review':'Candidato autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
        assets = {}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe, origine e scala fisse: andata da 0 a 4 m; ritorno da 4 a 3 m; freccia risultante da 0 a 3 m. Il cammino misura 5 m e il modulo dello spostamento 3 m.'})
            assets[file.name] = asset['id']
        records.append(row)
        bindings.append({'id':row['id'],'sourceId':source_id,'sourceSha256':digest(sources[source_id]),'candidateSha256':digest(row),'assetChecksums':assets,'sourceRef':source_ref})
    return {'schema':'astra/1','records':records,'assets':[asset]}, bindings


if __name__ == '__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__)
    p.add_argument('--repo',type=Path,required=True)
    p.add_argument('--source-ref',required=True)
    p.add_argument('--destination',type=Path,required=True)
    args=p.parse_args()
    package,bindings=assemble(args.repo,args.source_ref)
    args.destination.mkdir(parents=True,exist_ok=True)
    (args.destination/'vectors-difference-004.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'vectors-difference-004-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
