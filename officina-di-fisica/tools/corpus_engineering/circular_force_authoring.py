"""Author circular resultant force drafts, retaining dimensional radius explicitly."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

TASKS=[
("La risultante necessaria per curvare", "In un riferimento inerziale un corpo di massa costante m=2 kg compie un moto circolare uniforme con rapidità v=2 m/s e raggio fisso r₀=2 m. F è il modulo della risultante delle forze reali, diretta al centro. Quanto vale F in newton? Non si chiedono le singole forze che la realizzano.", 4,
 "La traiettoria e la rapidità richiedono un’accelerazione centripeta v²/r₀. Prima calcoliamo questa accelerazione, poi applichiamo la seconda legge di Newton alla risultante. Il simbolo m indica la massa; la lettera m scritta dopo il valore del raggio è invece l’unità metro.",
 r"A=\frac{v^2}{r_0}=\frac{(2\,\mathrm{m/s})^2}{2\,\mathrm m}=2\,\mathrm{m/s^2}\qquad F=mA=(2\,\mathrm{kg})(2\,\mathrm{m/s^2})=4\,\mathrm N",
 "Quattro newton è il modulo della somma vettoriale delle forze reali, che nel moto uniforme è radiale verso il centro. Non si aggiunge un’altra forza chiamata centripeta a questa somma. La risultante tangenziale è nulla perché il modulo della velocità non cambia.", "Trova prima l’accelerazione richiesta, poi moltiplicala per la massa."),
("L’unità della risultante radiale", "La risultante radiale F mantiene un corpo di massa costante in moto circolare uniforme, osservato da un riferimento inerziale. Quale unità SI è adatta al suo modulo?", ["m","m/s²","N","kg","s"],
 "La seconda legge di Newton lega la risultante alla massa per l’accelerazione. Il verso radiale specifica la direzione del vettore, ma l’unità rimane quella di qualunque forza. Un newton equivale a un chilogrammo per metro al secondo quadrato.",
 r"F=mA\qquad [F]=ML/T^2\qquad 1\,\mathrm N=1\,\mathrm{kg\,m/s^2}",
 "N è corretto. m/s² esprime l’accelerazione prima di moltiplicare per la massa, kg la sola massa, m una lunghezza e s una durata. Nessuna di queste ultime unità è dimensionalmente una forza.", "La massa moltiplica l’accelerazione."),
("Il raggio è una lunghezza, non un due puro", "In un riferimento inerziale un corpo di massa costante m>0 ha moto circolare uniforme di rapidità v>0 su una circonferenza fissa di raggio r₀=2 m. F è il modulo della risultante diretta al centro. Quale relazione fra grandezze fisiche fornisce F?", ["F=mv²/r₀","F=mv²","F=mv²/(2r₀)","F=mv/r₀","F=mv²r₀"],
 "Per il moto uniforme il modulo dell’accelerazione radiale è v²/r₀ e la massa la moltiplica nella legge di Newton. Manteniamo il raggio r₀ anche se il suo valore è già noto: due metri ha una dimensione e non si può sostituire con un numero due privo di unità in un’equazione fra grandezze.",
 r"A=\frac{v^2}{r_0}\qquad F=mA\qquad F=\frac{mv^2}{r_0}\qquad [F]=\frac{M(L/T)^2}{L}=ML/T^2",
 "mv² senza divisione per r₀ ha dimensione di energia; mv²/(2r₀) produce metà della forza richiesta perché introduce un fattore due in più al denominatore. mv/r₀ ha dimensione massa su tempo; mv²r₀ ha dimensione massa per lunghezza cubica su tempo quadrato. Qui F è la risultante, non un’interazione aggiuntiva.", "Combina A=v²/r₀ con la seconda legge di Newton."),
("Più massa sulla stessa curva", "Due corpi sono studiati in prove separate di moto circolare uniforme nello stesso riferimento inerziale. Entrambi hanno rapidità v=2 m/s e raggio fisso r₀=2 m; la massa, costante in ciascuna prova, vale prima m₁=2 kg e poi m₂=4 kg. Come cambia il modulo F della risultante radiale necessaria?", ["Da 4 a 8 N","Da 4 a 16 N","Resta 4 N","Da 4 a 2 N","Diventa zero"],
 "La cinematica è la stessa: l’accelerazione necessaria è due metri al secondo quadrato per entrambi i corpi. Raddoppiando soltanto la massa, la seconda legge di Newton richiede il doppio della risultante. Non stiamo imponendo una stessa forza disponibile ai due corpi.",
 r"A=\frac{2^2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad F_1=(2\,\mathrm{kg})A=4\,\mathrm N\qquad F_2=(4\,\mathrm{kg})A=8\,\mathrm N\qquad F_2/F_1=2",
 "Sedici newton applicherebbe erroneamente un quadrato alla massa. Quattro ignorerebbe la massa cambiata; due invertirebbe la proporzionalità; zero confonderebbe la rapidità uniforme con un’accelerazione nulla. Il confronto vale per le risultanti necessarie a realizzare le due prove dichiarate.", "L’accelerazione è uguale nelle due prove; cambia soltanto la massa."),
("Dalla forza richiesta alla massa", "In un riferimento inerziale un corpo di massa costante m>0 percorre uniformemente una circonferenza fissa di raggio r₀=2 m con rapidità v=2 m/s. La risultante delle forze reali è diretta al centro e ha modulo F=4 N. Quanto vale m, in kg?", 2,
 "Scriviamo F=mv²/r₀ e moltiplichiamo per r₀. Dividiamo poi per v², che è positivo. Il prodotto forza per raggio ha unità kg·m²/s²; la divisione per una rapidità al quadrato lascia kg. I due fattori due al numeratore possono essere semplificati con il quattro al denominatore.",
 r"Fr_0=mv^2\qquad m=\frac{Fr_0}{v^2}\qquad m=\frac{(4\,\mathrm N)(2\,\mathrm m)}{4\,\mathrm{m^2/s^2}}=2\,\mathrm{kg}",
 "La ricostruzione verifica F=(2 kg)(2 m/s)²/(2 m)=4 N. F/v² senza il raggio non ha dimensione di massa: il due del raggio rappresenta due metri, non un coefficiente puro da trascurare.", "Isola m prima di inserire il raggio in metri."),
("Una rapidità dalla risultante", "In un riferimento inerziale un corpo di massa costante m=2 kg compie un moto circolare uniforme su una circonferenza fissa di raggio r₀=2 m. Il modulo della risultante diretta al centro è F=4 N. Quanto vale la rapidità v>0 in m/s?", 2,
 "Moltiplichiamo per r₀ e dividiamo per la massa per ottenere v². Il prodotto quattro newton per due metri, diviso due chilogrammi, vale quattro metri quadrati su secondi quadrati. La radice positiva di quattro è due: il modulo della velocità non porta un segno che indichi il senso di rotazione.",
 r"Fr_0=mv^2\qquad v^2=\frac{Fr_0}{m}\qquad v^2=\frac{(4\,\mathrm N)(2\,\mathrm m)}{2\,\mathrm{kg}}=4\,\mathrm{m^2/s^2}\qquad v=\sqrt4\,\mathrm{m/s}=2\,\mathrm{m/s}",
 "Entrambi i sensi di rotazione sono compatibili con questa rapidità, mentre la radice negativa non è una rapidità ammessa. Non serve un’approssimazione decimale: il radicando è un quadrato perfetto. Il controllo nella legge della forza restituisce quattro newton.", "La radice viene dopo la moltiplicazione per r₀ e la divisione per m."),
("Raddoppiare la rapidità a massa fissata", "Due prove distinte di moto circolare uniforme, nello stesso riferimento inerziale, hanno massa costante m=2 kg e raggio fisso r₀=2 m. La rapidità è v₁=2 m/s nella prima e v₂=4 m/s nella seconda. F₁,F₂ sono i moduli delle risultanti radiali richieste. Quanto vale F₂/F₁?", ["8","2","1/4","1","4"],
 "La massa e il raggio si cancellano nel rapporto. Rimane il quadrato del rapporto fra rapidità: quattro diviso due è due e il suo quadrato è quattro. Possiamo anche calcolare le forze per distinguere il rapporto, puro, dalla forza finale in newton.",
 r"F_1=\frac{2\times2^2}{2}\,\mathrm N=4\,\mathrm N\qquad F_2=\frac{2\times4^2}{2}\,\mathrm N=16\,\mathrm N\qquad F_2/F_1=16/4=4",
 "Otto includerebbe anche un raddoppio della massa che non è previsto; due usa una legge lineare nella rapidità; 1/4 inverte il rapporto e uno ignora il cambiamento. Ciascuna prova è uniforme: non stiamo descrivendo la fase di passaggio fra le due rapidità.", "La rapidità entra al quadrato e gli altri fattori sono uguali."),
("Lo scarto di una forza proposta", "Un corpo di massa costante m=2 kg ha moto circolare uniforme con v=2 m/s e raggio fisso r₀=2 m in un riferimento inerziale. Si propone F_proposto=8 N per il modulo della risultante radiale diretta al centro. Quanto vale lo scarto proposto meno corretto?", ["+8 N","−4 N","0 N","+2 N","+4 N"],
 "Calcoliamo la risultante corretta con il raggio al denominatore: due per quattro diviso due dà quattro newton. La proposta otto newton è il risultato che si otterrebbe omettendo la divisione per il valore numerico del raggio nelle unità SI. Sottraiamo ora corretto da proposto.",
 r"F=\frac{(2\,\mathrm{kg})(2\,\mathrm{m/s})^2}{2\,\mathrm m}=4\,\mathrm N\qquad e=(8-4)\,\mathrm N=+4\,\mathrm N",
 "+8 ripete la proposta, −4 inverte l’ordine, zero accetta la proposta e +2 è metà dello scarto corretto. Un errore con segno non è il verso della forza: F è già definito come modulo e la direzione radiale è specificata separatamente.", "Confronta otto con la forza corretta, non con l’accelerazione."),
("L’inversa della massa conserva una lunghezza", "Un corpo di massa costante m>0 ha moto circolare uniforme con rapidità v>0 e raggio fisso r₀=2 m, osservato in un riferimento inerziale. Il modulo della risultante radiale è F=mv²/r₀. Quale formula isola la massa m?", ["m=F/v²","m=2Fr₀/v²","m=Fr₀/v²","m=Fr₀/v","m=v²/(Fr₀)"],
 "Il denominatore r₀ va eliminato moltiplicando entrambi i membri per r₀. Il fattore v² resta a moltiplicare la massa, quindi dividiamo entrambi i membri per v². Questo passaggio è lecito perché la rapidità è positiva e non nulla.",
 r"Fr_0=mv^2\qquad \frac{Fr_0}{v^2}=m\qquad m=\frac{Fr_0}{v^2}\qquad [m]=\frac{(ML/T^2)L}{L^2/T^2}=M",
 "F/v² avrebbe dimensione massa su lunghezza. 2Fr₀/v² conterebbe due volte il fattore del raggio e darebbe una massa doppia. Fr₀/v ha dimensione quantità di moto, mentre v²/(Fr₀) ha dimensione inversa della massa. Il raggio è già r₀=2 m: non occorre aggiungere un altro due.", "Elimina prima il denominatore r₀ e poi il fattore v²."),
("Due fattori, una sola rapidità al quadrato", "Due prove distinte di moto circolare uniforme nello stesso riferimento inerziale usano il raggio fisso r₀=2 m. La prima ha massa costante m>0 e rapidità v>0; la seconda ha massa costante κ₁m e rapidità κ₂v, con κ₁,κ₂>0. F₁,F₂ sono i moduli delle risultanti radiali. Quale rapporto F₂/F₁ segue?", ["κ₁κ₂²","κ₁κ₂","κ₁²κ₂","1/(κ₁κ₂²)","κ₁+κ₂²"],
 "Il fattore della massa entra una volta, mentre quello della rapidità entra due volte. Scriviamo la legge della seconda prova mantenendo il quadrato sull’intero prodotto κ₂v. Nel rapporto si cancellano massa iniziale, rapidità iniziale al quadrato e raggio comune.",
 r"F_1=\frac{mv^2}{r_0}\qquad F_2=\frac{(\kappa_1m)(\kappa_2v)^2}{r_0}\qquad F_2=\kappa_1\kappa_2^2F_1\qquad F_2/F_1=\kappa_1\kappa_2^2",
 "κ₁κ₂ dimentica il quadrato della rapidità; κ₁²κ₂ lo applica alla grandezza sbagliata. Il reciproco inverte le prove e la somma darebbe due senza alcun cambiamento, dove il rapporto deve essere uno. I fattori collegano prove diverse, non una massa che varia durante il moto.", "Eleva al quadrato κ₂ insieme a v, non κ₁ insieme a m."),
("Massa e rapidità entrambe doppie", "Due prove di moto circolare uniforme nello stesso riferimento inerziale hanno raggio fisso r₀=2 m e dati costanti (m₁=2 kg,v₁=2 m/s) e (m₂=4 kg,v₂=4 m/s). F₁,F₂ sono i moduli delle risultanti dirette al centro. Quanto vale F₂/F₁?", 8,
 "Nella prima prova il prodotto massa per rapidità al quadrato è otto nelle unità SI; diviso due metri dà quattro newton. Nella seconda il prodotto è quattro per sedici, cioè sessantaquattro, e la divisione per due dà trentadue newton. Il rapporto vale otto.",
 r"F_1=\frac{2\times4}{2}\,\mathrm N=4\,\mathrm N\qquad F_2=\frac{4\times16}{2}\,\mathrm N=32\,\mathrm N\qquad F_2/F_1=32/4=8",
 "Il raddoppio della massa moltiplica la forza per due; il raddoppio della rapidità aggiunge il fattore quattro. Il prodotto 2·4=8 concorda con il calcolo diretto. Il rapporto non ha unità, perché le due forze sono espresse nella stessa unità.", "Tieni separati il fattore due della massa e il fattore quattro della rapidità."),
("Media delle risultanti, non degli ingressi", "In un riferimento inerziale due prove di moto circolare uniforme, a raggio fisso r₀=2 m, hanno masse e rapidità costanti (2 kg,2 m/s) e (4 kg,4 m/s). F=mv²/r₀ è il modulo della risultante radiale. Qual è la media aritmetica delle due forze, con uguale peso statistico?", ["18 N","36 N","9 N","27/2 N","16 N"],
 "La prima risultante vale quattro newton e la seconda trentadue. La media delle due uscite è la metà di ciascuna, sommata: due più sedici dà diciotto newton. Qui usare massa e rapidità medie prima di applicare la legge cambierebbe l’operazione, perché la legge contiene un quadrato e un prodotto fra gli ingressi.",
 r"F_1=4\,\mathrm N\qquad F_2=32\,\mathrm N\qquad \overline F=\frac{4+32}{2}\,\mathrm N=(2+16)\,\mathrm N=18\,\mathrm N",
 "36 N è la somma; 9 N dimezza ancora la media. 27/2 N si ottiene dagli ingressi medi m=3 kg,v=3 m/s, dando 3·9/2, e non è la media richiesta. 16 N mescola la massa della prima prova con la rapidità della seconda. I pesi dichiarati sono statistici, non tempi di percorrenza di archi.", "Calcola prima quattro e trentadue, poi assegna metà peso a ciascuno."),
("Ottenere una forza otto volte maggiore", "La prima prova di moto circolare uniforme ha massa costante m₁=2 kg e rapidità v₁=2 m/s. Nella seconda si impone massa costante m₂=4 kg e si vuole F₂=8F₁, dove F è il modulo della risultante radiale. Entrambe le prove hanno raggio fisso r₀=2 m e sono osservate nello stesso riferimento inerziale. Quanto vale v₂/v₁, con v₂>0?", 2,
 "La prima risultante è quattro newton, quindi il nuovo obiettivo è trentadue. Moltiplichiamo la legge della seconda prova per r₀ e dividiamo per m₂ per isolare v₂². Il radicando è sedici metri quadrati su secondi quadrati: scegliamo la radice positiva quattro metri al secondo e confrontiamola con i due iniziali.",
 r"F_1=4\,\mathrm N\qquad F_2=32\,\mathrm N\qquad F_2r_0=m_2v_2^2\qquad v_2^2=\frac{F_2r_0}{m_2}=\frac{32\times2}{4}\,\mathrm{m^2/s^2}=16\,\mathrm{m^2/s^2}\qquad v_2=4\,\mathrm{m/s}\qquad v_2/v_1=4/2=2",
 "Il raddoppio della massa fornisce già un fattore due; resta un fattore quattro da ottenere tramite v². Una rapidità otto volte maggiore eccederebbe l’obiettivo. Il risultato dà direttamente F₂=4·4²/2=32 N, con modulo positivo.", "Dopo aver raddoppiato la massa, la rapidità deve produrre il fattore quattro residuo."),
("Tarare un conteggio di forza", "Ogni prova è un moto circolare uniforme in un riferimento inerziale, con massa m>0 costante, rapidità v>0 costante e raggio fisso r₀=2 m. F=mv²/r₀ è il modulo della risultante radiale. Un display conta tacche S=gF, con g>0 costante e offset nullo. Il riferimento m=2 kg,v=2 m/s dà S=12. La nuova prova dà S=96 e v=4 m/s. Quanto vale la nuova massa in kg?", 4,
 "Il riferimento richiede quattro newton, quindi dodici tacche fissano un guadagno di tre per newton. La nuova lettura divisa per questo guadagno dà trentadue newton. Isoliamo allora la massa moltiplicando la forza per il raggio e dividendo per il quadrato della nuova rapidità.",
 r"F_{ref}=4\,\mathrm N\qquad g=\frac{12}{4\,\mathrm N}=3\,\mathrm{N^{-1}}\qquad F=\frac{96}{g}=32\,\mathrm N\qquad Fr_0=mv^2\qquad m=\frac{Fr_0}{v^2}=\frac{32\times2}{16}\,\mathrm{kg}=4\,\mathrm{kg}",
 "Il controllo fisico dà F=4·16/2=32 N e quello strumentale S=3·32=96. Le tacche sono numeri puri: né dodici né novantasei si possono interpretare direttamente come una forza in newton senza conoscere il guadagno.", "Il riferimento converte le tacche in newton prima dell’inversa per la massa."),
("Togliere l’offset prima di ricostruire m", "Ogni prova è un moto circolare uniforme in un riferimento inerziale, con massa m>0 e rapidità v>0 costanti, raggio fisso r₀=2 m e risultante radiale di modulo F=mv²/r₀. Il display conta S=gF+c, con g>0,c costanti. I riferimenti (m=2 kg,v=2 m/s) e (m=4 kg,v=4 m/s) danno S=9 e S=65. La prova ignota ha v=2 m/s e S=17. Quanto vale m?", ["4 kg","8 kg","2 kg","5 kg","3 kg"],
 "Le forze dei riferimenti sono quattro e trentadue newton. Sottraiamo le equazioni del display: la differenza delle letture è cinquantasei, quella delle forze ventotto, perciò g=2 N⁻¹. Dal primo riferimento segue c=1. Dalla lettura diciassette sottraiamo uno prima di dividere per due: la forza ignota vale otto newton.",
 r"g=\frac{65-9}{(32-4)\,\mathrm N}=\frac{56}{28}\,\mathrm{N^{-1}}=2\,\mathrm{N^{-1}}\qquad c=9-2\times4=1\qquad F=\frac{17-1}{g}=8\,\mathrm N\qquad m=\frac{Fr_0}{v^2}=\frac{8\times2}{4}\,\mathrm{kg}=4\,\mathrm{kg}",
 "Otto confonde il valore numerico della forza con quello della massa. Due ripete il primo corpo e darebbe S=9. Cinque e tre chilogrammi darebbero F=10 e 6 N, quindi S=21 e 13. La massa corretta restituisce S=2·(4·2²/2)+1=17; il rapporto fra letture grezze non avrebbe eliminato c.", "Una differenza trova g; un riferimento trova c; solo dopo si inverte la forza."),
("Un vincolo fra massa e rapidità di prove diverse", "Si selezionano prove di moto circolare uniforme in un riferimento inerziale, tutte a raggio fisso r₀=2 m. In ogni prova massa m>0 e rapidità v>0 restano costanti. I dati selezionati soddisfano m=cv, con c=1 kg·s/m fisso, e la risultante radiale ha modulo F=4 N. Quanto vale v? Il vincolo collega corpi e prove diversi; non descrive una massa che cambia durante un giro.", ["4 m/s","1 m/s","3 m/s","−2 m/s","2 m/s"],
 "Il coefficiente c trasforma una rapidità in una massa e ne conserva le dimensioni. Sostituendo m=cv in F=mv²/r₀ otteniamo un cubo della rapidità. Moltiplichiamo per r₀ e dividiamo per c: il risultato è otto metri cubi su secondi cubi. La radice cubica esatta è due metri al secondo.",
 r"F=\frac{(cv)v^2}{r_0}=\frac{cv^3}{r_0}\qquad Fr_0=cv^3\qquad v^3=\frac{Fr_0}{c}=\frac{(4\,\mathrm N)(2\,\mathrm m)}{1\,\mathrm{kg\,s/m}}=8\,\mathrm{m^3/s^3}\qquad v=2\,\mathrm{m/s}\qquad m=cv=2\,\mathrm{kg}",
 "Il cubo cresce strettamente per v>0, quindi c e r₀ positivi ammettono una sola soluzione positiva. v=1,3,4 m/s darebbero rispettivamente F=1/2,27/2,32 N sotto il vincolo. −2 m/s viola il dominio della rapidità e renderebbe negativa anche la massa m=cv. La coppia ricostruita dà F=2·2²/2=4 N.", "Il vincolo introduce un fattore v in più, quindi compare v³.")
]
CHOICES={2:2,3:0,4:0,7:4,8:4,9:2,10:0,12:0,15:0,16:4}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/circular-force-resultant.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-circular-force-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':{1:'N',5:'kg',6:'m/s',11:'1',13:'1',14:'kg'}[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Moto circolare','order':2620+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L003','C1-L004'],'reuse':['C6'],
            'family':'uniform-circular-force','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'La risultante centripeta è la somma delle forze reali, non una forza da aggiungere.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Moto circolare uniforme e risultante radiale','Seconda legge di Newton'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe per massa 2 kg, raggio 2 m e rapidità 2 m/s: velocità tangente; risultante delle forze reali diretta al centro; calcolo F=mA=4 N. Scala geometrica 50 px/m, frecce di velocità 30 px per m/s e risultante 20 px/N. Le scale hanno dimensioni diverse e le lunghezze delle frecce non si confrontano come grandezze omogenee.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.circular_force_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'circular-force-026.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'circular-force-026-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
