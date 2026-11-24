"""Author scalar-product candidates with explicit orientation and identifiability."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


TASKS = [
 ("Il prodotto di due vettori concordi", "Due vettori adimensionali A e B sono paralleli e concordi. I loro moduli sono a=2 e b=2. Quanto vale il prodotto scalare S=A·B?", 4,
  "Il prodotto scalare è definito dal prodotto dei moduli moltiplicato per il coseno dell’angolo fra i vettori. Per versi concordi l’angolo è zero e il coseno vale uno. Il risultato è uno scalare: non occorre assegnargli un verso.",
  r"S=ab\cos\theta\qquad \theta=0^\circ\qquad S=2\times2\times\cos0^\circ\qquad S=2\times2\times1=4",
  "Quattro è un numero puro perché entrambi i vettori sono adimensionali. In questo esempio anche la somma 2+2 vale quattro: è una coincidenza numerica, non la legge del prodotto scalare. Con moduli due e tre il prodotto sarebbe sei e la somma cinque.", "Stabilisci l’angolo fra le direzioni prima di moltiplicare."),
 ("Uno scalare può avere dimensioni", "A e B sono esplicitamente vettori adimensionali. Quale unità è dimensionalmente compatibile con S=A·B?", ["m", "K", "1", "kg", "s"],
  "La dimensione di un prodotto scalare è il prodotto delle dimensioni dei vettori: il coseno è adimensionale. Qui entrambe sono uno. Il risultato è perciò adimensionale, ma questo dipende dai dati e non dal solo fatto che il risultato sia uno scalare.",
  r"[S]=[A][B][\cos\theta]\qquad [S]=1\times1\times1=1",
  "1 indica un numero puro; nella scrittura usuale spesso si omette. m, K, kg e s introdurrebbero rispettivamente lunghezza, temperatura, massa e tempo assenti nei dati. Per confronto, il prodotto scalare fra due spostamenti avrebbe dimensione L²: «scalare» non significa sempre «senza unità».", "Moltiplica le dimensioni dei due vettori, non i loro nomi."),
 ("Vettori non nulli, prodotto nullo", "Due vettori adimensionali A e B sono perpendicolari e hanno moduli a>0,b>0. Quanto vale A·B?", ["Zero", "Il prodotto positivo ab", "La somma a+b", "Il rapporto a/b", "Un vettore perpendicolare a entrambi"],
  "L’angolo retto rende nulla la proiezione di un vettore sulla direzione dell’altro. Nella definizione del prodotto scalare compare cos90°=0: questo fattore annulla il risultato anche se i moduli non sono nulli.",
  r"S=ab\cos90^\circ\qquad \cos90^\circ=0\qquad S=ab\times0=0",
  "ab omette il fattore angolare e varrebbe per vettori concordi; a+b e a/b descrivono altre operazioni. Il risultato non è un vettore perpendicolare: quella descrizione riguarda il prodotto vettoriale in tre dimensioni. Prodotto scalare nullo non impone qui un vettore nullo.", "Quanto vale il coseno di un angolo retto?"),
 ("Raddoppiare un solo modulo", "Due vettori adimensionali restano paralleli e concordi in entrambe le prove. b resta 2, mentre a passa da 2 a 4. Come cambia il loro prodotto scalare S?", ["Raddoppia da 4 a 8", "Quadruplica da 4 a 16", "Resta 4", "Si dimezza a 2", "Diventa zero"],
  "L’angolo rimane zero, quindi il coseno resta uno. Il fattore b è costante: S=ab è direttamente proporzionale ad a quando b e l’orientamento non cambiano. Raddoppiare uno solo dei due moduli dà un solo fattore due.",
  r"S_1=2\times2=4\qquad S_2=4\times2=8\qquad \frac{S_2}{S_1}=\frac84=2",
  "Il fattore quattro richiederebbe due raddoppi, uno per ciascun modulo. Le risposte invariato o dimezzato contraddicono il prodotto con b positivo costante. Zero richiederebbe un modulo nullo o un angolo retto, esclusi dalle ipotesi.", "Conserva b=2 e cosθ=1 quando cambi a."),
 ("Ritrovare il primo modulo", "Due vettori adimensionali sono paralleli e concordi, con moduli a,b>0. Il loro prodotto scalare è S=4 e b=2. Quanto vale a?", 2,
  "L’orientamento assegnato riduce S=ab cosθ a S=ab. a moltiplica b: per isolarlo dividiamo entrambi i membri per b. Il vincolo b>0 garantisce che questa divisione sia possibile; non occorre estrarre una radice, perché a non è al quadrato.",
  r"S=ab\qquad \frac Sb=\frac{ab}{b}=a\qquad a=\frac42=2",
  "Il controllo 2·2·cos0°=4 ricostruisce la misura. Sottrarre b da S darebbe qui ancora due per coincidenza: con S=6,b=2 la sottrazione darebbe quattro mentre la divisione corretta darebbe tre.", "Quale operazione annulla una moltiplicazione per b?"),
 ("Una sola misura non determina due moduli", "Due vettori adimensionali A e B sono paralleli e concordi con moduli a,b>0. L’unico dato numerico è A·B=6. Quale conclusione è giustificata?", ["Devono valere a=2 e b=3", "La somma deve essere 6", "Uno dei moduli deve essere zero", "Più coppie positive sono compatibili: i moduli non sono univoci", "Entrambi devono valere 6"],
  "La misura impone un’equazione, ab=6, per due incognite. Per provare che i moduli non sono univoci basta esibire due coppie diverse che rispettino positività e orientamento. Le coppie (2,3) e (1,6) danno entrambe prodotto sei.",
  r"ab=6\qquad b=\frac6a\quad(a>0)\qquad 2\times3=6\qquad 1\times6=6",
  "(2,3) è possibile ma non obbligatoria. Le due coppie hanno somme cinque e sette, quindi la somma non è fissata. Un modulo nullo darebbe prodotto zero; (6,6) darebbe trentasei. Occorrerebbe un altro dato indipendente, per esempio un modulo o un rapporto fra i moduli, per ottenere una coppia unica.", "Cerca due coppie diverse di numeri positivi con prodotto sei."),
 ("Il rapporto quando cambia b", "Due vettori adimensionali restano paralleli e concordi. La prima prova ha a₁=2,b₁=2; la seconda a₂=2,b₂=4. Indicando con S il prodotto scalare, quanto vale S₂/S₁?", ["2", "4", "1", "3", "−2"],
  "Il modulo a e il coseno restano uguali nelle due prove. Calcoliamo i prodotti quattro e otto e formiamo il rapporto secondo su primo. Si può anche semplificare il fattore comune a=2 prima delle moltiplicazioni.",
  r"S_1=2\times2=4\qquad S_2=2\times4=8\qquad \frac{S_2}{S_1}=\frac{2\times4}{2\times2}=\frac42=2",
  "Quattro richiederebbe di raddoppiare anche a. Uno ignorerebbe il cambiamento; tre somma i due fattori di variazione uno e due. −2 contraddice il prodotto scalare positivo di vettori concordi e non nulli.", "Cancella il modulo a, comune al numeratore e al denominatore."),
 ("Scarto fra proposta e prodotto", "Due vettori adimensionali paralleli e concordi hanno moduli a=b=2. Una soluzione propone S_proposto=8 per il prodotto scalare. Quanto vale lo scarto «proposto meno corretto»?", ["+8", "+2", "+4", "−4", "0"],
  "Il valore corretto si ottiene da 2·2·cos0° e vale quattro. La proposta è otto. Lo scarto con segno è la differenza tra questi risultati nell’ordine richiesto; non è il rapporto fra essi.",
  r"S=2\times2\times1=4\qquad e=8-4=+4",
  "+4 indica la sovrastima; −4 corrisponderebbe all’ordine opposto. +2 è il rapporto 8/4, non lo scarto. +8 omette il risultato corretto e zero presuppone erroneamente l’uguaglianza fra proposta e misura. Lo scarto è adimensionale come S.", "Calcola il prodotto con il coseno prima della sottrazione."),
 ("La divisione è l’inversa del prodotto", "Due vettori adimensionali restano paralleli e concordi e hanno moduli a,b>0. Si conoscono il prodotto scalare S=ab e b. Quale formula ricava a?", ["a=S−b", "a=Sb", "a=b/S", "a=S/b", "a=√(S/b)"],
  "Dividiamo S=ab per b su entrambi i lati. Il fattore b si cancella al secondo membro; il suo valore positivo esclude il denominatore nullo. Non prendiamo una radice: il prodotto contiene a una sola volta, anche se nasce da due vettori.",
  r"\frac Sb=\frac{ab}{b}\qquad a=\frac Sb",
  "S−b invertirebbe una somma, mentre Sb applica di nuovo il fattore da eliminare. b/S è il reciproco del risultato corretto. La radice introdurrebbe senza motivo una seconda potenza. La sostituzione (S/b)b=S verifica l’inversa per ogni b>0.", "Mantieni il denominatore b quando annulli il fattore b."),
 ("Due cambiamenti in una legge a prodotto", "In entrambe le prove due vettori adimensionali sono paralleli e concordi. I moduli iniziali a,b>0 diventano κ₁a,κ₂b, con κ₁,κ₂>0. Indicando con S il prodotto scalare, quanto vale S₂/S₁?", ["κ₁+κ₂", "κ₁κ₂", "κ₁/κ₂", "κ₁²κ₂²", "(κ₁+κ₂)/2"],
  "L’angolo rimane zero in entrambe le prove. Sostituiamo i nuovi moduli nel prodotto e raccogliamo κ₁κ₂. Il prodotto iniziale ab è positivo e si può semplificare nel rapporto. Qui i fattori si moltiplicano perché la legge moltiplica i due moduli.",
  r"S_1=ab\qquad S_2=(\kappa_1a)(\kappa_2b)=\kappa_1\kappa_2ab\qquad \frac{S_2}{S_1}=\kappa_1\kappa_2",
  "κ₁+κ₂ fallisce già senza cambiamenti: darebbe due anziché uno. κ₁/κ₂ renderebbe invariato il prodotto quando entrambi i moduli raddoppiano. I quadrati inseriscono potenze assenti; la media dei fattori descriverebbe un’altra legge. Per κ₁=κ₂=2 il controllo dà quattro.", "Sostituisci i due nuovi moduli nel prodotto prima di semplificare."),
 ("Due raddoppi producono quattro volte il risultato", "Due vettori adimensionali sono paralleli e concordi in ogni prova. I moduli passano da (a₁=2,b₁=2) a (a₂=4,b₂=4). Indicando con S il prodotto scalare, quanto vale S₂/S₁?", 4,
  "Il prodotto iniziale è quattro e il nuovo è sedici. Ciascun modulo porta un fattore due: nel prodotto i fattori si moltiplicano e danno quattro. L’angolo invariato non contribuisce a cambiare il rapporto.",
  r"S_1=2\times2=4\qquad S_2=4\times4=16\qquad \frac{S_2}{S_1}=\frac{16}{4}=4",
  "La risposta due considererebbe un solo raddoppio. La differenza sedici meno quattro vale dodici e risponde a una domanda diversa; qui serve un rapporto. Tutte le quantità sono numeri puri e il prodotto rimane positivo.", "Conta un fattore due per ognuno dei due moduli."),
 ("Media dei prodotti, prodotto delle medie", "Due prove hanno vettori adimensionali paralleli e concordi. I moduli sono (2,2) nella prima e (4,4) nella seconda. Con uguale peso statistico, qual è la media aritmetica dei due prodotti scalari?", ["9", "10", "20", "5", "11"],
  "Calcoliamo prima i prodotti quattro e sedici, poi la loro semisomma. Per il calcolo manuale si possono dimezzare separatamente i due risultati: metà di quattro è due e metà di sedici è otto.",
  r"S_1=4\qquad S_2=16\qquad \overline S=\frac{4+16}{2}=\frac42+\frac{16}{2}=2+8=10",
  "Nove è il prodotto dei moduli medi (3·3): non è la media dei prodotti. Venti manca della divisione per due e cinque dimezza una seconda volta. Undici non è la semisomma. La differenza fra nove e dieci mostra che il prodotto non è lineare quando i due ingressi cambiano insieme.", "Media i risultati quattro e sedici, non i moduli due e quattro."),
 ("Imporre l’aumento del prodotto", "I vettori restano adimensionali, paralleli e concordi in ogni prova, con moduli positivi. All’inizio a₁=b₁=2. Si impone a₂=4 e si vuole S₂=4S₁, dove S è il prodotto scalare. Quanto deve valere b₂/b₁?", 2,
  "Il prodotto iniziale vale quattro, quindi il nuovo obiettivo è sedici. Dividiamo l’obiettivo per il nuovo modulo a₂=4 per ricavare b₂=4. Solo a questo punto confrontiamo il nuovo b con il vecchio b=2.",
  r"S_1=2\times2=4\qquad S_2=4S_1=16\qquad b_2=\frac{S_2}{a_2}=\frac{16}{4}=4\qquad \frac{b_2}{b_1}=\frac42=2",
  "La nuova coppia (4,4) dà prodotto sedici e mantiene entrambi i moduli positivi. Anche la regola dei fattori conferma 4=2·(b₂/b₁). Far crescere b di quattro volte darebbe un prodotto otto volte maggiore, perché a è già raddoppiato.", "Il raddoppio di a fornisce già una parte del fattore quattro."),
 ("Taratura di un prodotto scalare", "In tutte le prove i vettori sono adimensionali, paralleli e concordi, con moduli positivi. S indica il prodotto scalare. Un display conta tacche T=gS, con g>0 costante e offset nullo. Il riferimento a=b=2 dà T=12. La nuova prova ha T=48 e b=4. Quanto vale a?", 4,
  "Nel riferimento S=2·2=4: dodici tacche significano un guadagno tre. Anche g è adimensionale perché T e S sono numeri puri. Dividiamo quarantotto per tre per ottenere il prodotto reale sedici, poi dividiamo per il modulo b=4.",
  r"S_{\rm rif}=2\times2=4\qquad g=\frac{12}{4}=3\qquad S=\frac{48}{3}=16\qquad a=\frac Sb=\frac{16}{4}=4",
  "Il controllo completo dà T=3·(4·4)=48. Usare direttamente 48 come S porterebbe ad a=12, ancora positivo ma incompatibile con la taratura. La positività da sola non basta: bisogna ricostruire tutti i dati del problema.", "Rimuovi il guadagno del display prima di dividere per b."),
 ("Un offset altera i rapporti delle letture", "In tutte le prove i vettori adimensionali sono paralleli e concordi, con moduli positivi. S indica il prodotto scalare. Un display conta tacche T=gS+c, con g>0,c costanti. I riferimenti sono (a=2,b=2,T=9) e (a=4,b=4,T=33). La prova ignota ha b=2,T=17. Quanto vale a?", ["3", "4", "8", "2", "5"],
  "I riferimenti corrispondono a prodotti quattro e sedici. La differenza fra le letture elimina c: ventiquattro tacche per dodici unità di prodotto danno g=2. Il primo riferimento impone c=1. Decodifichiamo diciassette togliendo uno e dividendo per due; poi dividiamo il prodotto ottenuto per b.",
  r"g=\frac{33-9}{16-4}=\frac{24}{12}=2\qquad c=9-2\times4=1\qquad S=\frac{17-1}{2}=8\qquad a=\frac82=4",
  "La risposta otto si ferma al prodotto S senza isolare a. Due riusa il primo riferimento; tre e cinque si discostano di un’unità senza riprodurre la lettura. Con a=4,b=2 il controllo è T=2·(4·2)+1=17. I rapporti delle letture non eliminano un offset additivo.", "Sottrai i due riferimenti per trovare il guadagno senza l’offset."),
 ("Il vincolo seleziona una sola coppia", "Due vettori adimensionali sono paralleli e concordi, con moduli uguali a=b>0. Il loro prodotto scalare è S=4. Quanto vale b?", ["−2", "2", "4", "1", "3"],
  "L’uguaglianza dei moduli permette di sostituire a con b. Il prodotto diventa b²=4. L’equazione quadratica ha radici due e meno due; il dominio b>0 elimina quella negativa e lascia un unico modulo possibile.",
  r"S=ab=b^2\qquad b^2=4\qquad b=\sqrt4=2\quad(b>0)\qquad a=b=2",
  "Meno due non è un modulo positivo; quattro darebbe prodotto sedici, uno darebbe uno e tre darebbe nove. La coppia (2,2) ricostruisce S=4. Senza il vincolo a=b resterebbero molte coppie positive, per esempio (1,4).", "Usa l’uguaglianza a=b prima di cercare la radice.")
]
CHOICES = {2:2,3:0,4:0,6:3,7:0,8:2,9:3,10:1,12:1,15:1,16:1}


def assemble(repo, source_ref):
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,'packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json'))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/scalar-product-projection.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u1-scalar-product-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':'1','tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Vettori e componenti','order':2140+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L002','prerequisites':['C1-L001','C1-L002'],'reuse':['C6'],
            'family':{3:'orthogonal-scalar-product',6:'scalar-product-identifiability'}.get(n,'concordant-scalar-product'),
            'difficulty':1 if n<=4 else 2 if n<=12 else 3,'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Controlla orientamento, positività e dati sufficienti prima delle operazioni.'],
            'error':{'category':{2:'unità',3:'concetto',4:'concetto',6:'modello',7:'calcolo',8:'calcolo',10:'modello',12:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L002'},
            'coverage':['Vettori','Prodotto scalare'],'review':'Candidato autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
        assets={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Leggi le tre tappe: identifica l’angolo; proietta B sulla direzione di A ottenendo b cosθ; moltiplica la proiezione con a. A 0° il risultato è ab, a 90° è zero, a 180° è −ab. Il disegno obliquo è uno schema, non il dato angolare del quesito.'})
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
    (args.destination/'scalar-product-006.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'scalar-product-006-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
