"""Sixteen authored tasks on collinear displacements, coordinates and linear measurements."""
import base64
import json
from pathlib import Path

from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps


TASKS=[
 ("Due passi nello stesso verso", "Una persona compie due spostamenti consecutivi lungo la stessa retta: 2 m verso est e altri 2 m verso est. Quanto vale il modulo D dello spostamento totale, in metri?",4,
  "Lo spostamento totale collega il punto di partenza a quello di arrivo. Prendiamo positivo il verso est: entrambe le componenti sono positive e si sommano. Non compare una durata, quindi la domanda non riguarda una velocità.",
  r"\Delta x=+2\,\mathrm m+2\,\mathrm m=+4\,\mathrm m\qquad D=|\Delta x|=4\,\mathrm m",
  "La persona termina quattro metri a est del punto iniziale. In questo percorso senza inversioni anche la distanza percorsa vale quattro metri; con un ritorno indietro distanza e modulo dello spostamento potrebbero invece differire.","Disegna due frecce consecutive, entrambe verso est."),
 ("L’unità di uno spostamento", "Due spostamenti concordi producono uno spostamento totale. Quale fra queste unità è dimensionalmente compatibile con il suo modulo?",["m","m/s","m²","N","s"],
  "Uno spostamento confronta due posizioni nello spazio e possiede dimensione di lunghezza. Sommare componenti della stessa dimensione conserva quella dimensione. Il fatto che lo spostamento sia un vettore non introduce un’unità speciale: le sue componenti e il suo modulo si misurano con unità di lunghezza.",
  r"[\Delta x]=L\qquad[D]=L\qquad[D]_{\rm SI}=\mathrm m",
  "Il metro è adatto. Metri al secondo descriverebbero una velocità, metri quadrati un’area e newton una forza. La scelta si può fare prima di conoscere i valori numerici.","Chiediti quale grandezza si confronta sottraendo due posizioni."),
 ("Quando si possono sommare i moduli", "Due spostamenti consecutivi hanno moduli a>0 e b>0 e sono entrambi diretti verso est lungo la stessa retta. Quale formula dà il modulo totale D?",["D=a+b","D=|a−b|","D=√(a²+b²)","D=ab","D=(a+b)/2"],
  "La legge generale somma i vettori, non sempre i loro moduli. Qui le due componenti sull’asse est sono +a e +b. La componente risultante è positiva e il suo modulo coincide quindi con la somma a+b. Le ipotesi di stessa retta e stesso verso sono essenziali.",
  r"\Delta x=a+b>0\qquad D=|a+b|=a+b",
  "La differenza dei moduli servirebbe per versi opposti; la radice di a²+b² per componenti perpendicolari. Il prodotto ab avrebbe dimensione di area, mentre la media dimezzerebbe il cammino senza una ragione fisica.","Proietta le due frecce sull’asse orientato verso est."),
 ("Raddoppiare solo uno dei due tratti", "In entrambe le prove i due tratti restano sulla stessa retta e verso est. Nella prima a=2 m e b=2 m; nella seconda a diventa 4 m e b resta 2 m. Come cambia il modulo totale?",["Passa da 4 m a 6 m","Raddoppia da 4 m a 8 m","Si dimezza da 4 m a 2 m","Resta 4 m","Diventa 3 m, mediando i nuovi tratti"],
  "È cambiato soltanto il primo addendo. Il tratto b continua a contribuire con due metri in entrambe le prove. Scrivere i due totali evita di attribuire all’intera somma il raddoppio di una sola parte.",
  r"D_1=2\,\mathrm m+2\,\mathrm m=4\,\mathrm m\qquad D_2=4\,\mathrm m+2\,\mathrm m=6\,\mathrm m",
  "Il totale aumenta di due metri e passa da quattro a sei. Il rapporto è 6/4=3/2: l’aumento relativo è del 50%, non del 100%. Raddoppierebbe anche il totale se raddoppiassero entrambi i tratti.","Conserva il secondo tratto di 2 m quando cambi il primo."),
 ("Ricostruire il primo tratto", "Due spostamenti consecutivi verso est hanno modulo totale D=4 m. Il secondo misura b=2 m. Quanto misura il primo, in metri?",2,
  "La relazione D=a+b permette di ricavare il tratto mancante. Sottraiamo b da entrambi i membri dell’uguaglianza: il secondo addendo si elimina e rimane a. Tutte le quantità sottratte devono essere espresse nella stessa unità.",
  r"D-b=a+b-b=a\qquad a=4\,\mathrm m-2\,\mathrm m=2\,\mathrm m",
  "Il primo tratto misura due metri verso est. La somma di controllo 2 m+2 m restituisce 4 m. Un risultato negativo contraddirebbe l’ipotesi che a sia il modulo di un tratto concorde con il secondo.","Sottrai dal totale il tratto che conosci già."),
 ("Una coordinata può essere negativa", "Un asse ha origine fissa e verso positivo a est. La persona parte da x₀=−2 m, si sposta di 3 m verso est e poi di altri 4 m verso est. Qual è la coordinata finale, in metri?",["7","9","1","−5","5"],
  "La coordinata iniziale indica dove si trova la persona rispetto all’origine; gli spostamenti indicano quanto cambia quella coordinata. Partire a −2 m non significa muoversi verso ovest. Il primo spostamento di +3 m porta da −2 m a +1 m; il secondo aggiunge altri quattro metri.",
  r"x_1=-2\,\mathrm m+3\,\mathrm m=1\,\mathrm m\qquad x_f=1\,\mathrm m+4\,\mathrm m=5\,\mathrm m",
  "La coordinata finale è +5 m. Lo spostamento totale vale invece x_f−x₀=5−(−2)=7 m verso est. Il numero sette risponde a una domanda diversa: quanto è cambiata la posizione, non quale sia la sua coordinata finale.","Segna −2 m sull’asse prima di aggiungere le frecce."),
 ("Un rapporto fra due risultanti", "Due prove iniziano dallo stesso punto e hanno tratti entrambi verso est. Nella prima a=2 m,b=2 m; nella seconda a=2 m,b=4 m. Qual è il rapporto D₂/D₁ fra i moduli totali?",["2","3/2","1/2","3/4","3"],
  "Calcoliamo prima ciascuno spostamento totale. Il primo vale quattro metri, il secondo sei metri. Nel rapporto si cancellano i metri: confrontiamo due grandezze omogenee. Semplifichiamo la frazione dividendo numeratore e denominatore per due.",
  r"D_1=4\,\mathrm m\qquad D_2=6\,\mathrm m\qquad\frac{D_2}{D_1}=\frac64=\frac32",
  "Tre mezzi significa una volta e mezza. Il valore è maggiore di uno perché il secondo spostamento totale è maggiore. Il rapporto inverso varrebbe invece 2/3, non 3/2.","Forma il rapporto fra i due totali, non fra i soli secondi tratti."),
 ("Lo scarto conserva il segno", "Due tratti di 2 m verso est danno un modulo totale D. Una soluzione propone D_proposto=8 m. Quanto vale lo scarto con segno D_proposto−D?",["+4 m","−4 m","+8 m","0 m","+2 m"],
  "Prima troviamo il valore corretto: due metri più due metri fanno quattro metri. Poi applichiamo l’ordine della sottrazione dichiarato nel testo. Lo scarto non è un nuovo spostamento della persona: misura l’errore della proposta rispetto al risultato.",
  r"D=2\,\mathrm m+2\,\mathrm m=4\,\mathrm m\qquad e=8\,\mathrm m-4\,\mathrm m=+4\,\mathrm m",
  "Il segno positivo indica una sovrastima di quattro metri. Se la definizione fosse valore corretto meno valore proposto, lo stesso confronto avrebbe segno negativo. Il segno dipende dall’ordine richiesto, non dal fatto che le distanze siano positive.","Scrivi le parole «proposto meno corretto» sopra la sottrazione."),
 ("L’inversa della somma", "Per due tratti concordi vale D=a+b. Si conoscono D e b, con D>b>0. Quale formula isola a?",["a=D−b","a=D+b","a=b−D","a=D/b","a=Db"],
  "a è sommato a b. L’operazione inversa è sottrarre b da entrambi i membri: non dividere, perché a e b non sono moltiplicati. La condizione D>b assicura che il modulo ricavato sia positivo.",
  r"D-b=a+b-b\qquad a=D-b",
  "Sostituendo nella relazione originaria otteniamo (D−b)+b=D. La differenza mantiene dimensione di lunghezza; D/b sarebbe un numero puro e Db avrebbe dimensione di area.","Elimina l’addendo b facendo la stessa sottrazione sui due membri."),
 ("Variazioni di una legge additiva", "In entrambe le prove i due tratti restano sulla stessa retta e verso est. I moduli iniziali sono a,b>0; nella seconda prova diventano κ₁a e κ₂b, con κ₁,κ₂>0. Quale formula dà il rapporto fra il nuovo e il vecchio modulo totale?",["κ₁κ₂","κ₁+κ₂","(κ₁a+κ₂b)/(a+b)","(κ₁a−κ₂b)/(a+b)","(κ₁+κ₂)/2, sempre"],
  "La legge di partenza è una somma. Inseriamo i due nuovi tratti nella stessa somma e dividiamo per il totale iniziale. Non si possono moltiplicare direttamente i fattori κ₁ e κ₂, perché agiscono su addendi diversi.",
  r"D_1=a+b\qquad D_2=\kappa_1a+\kappa_2b\qquad\frac{D_2}{D_1}=\frac{\kappa_1a+\kappa_2b}{a+b}",
  "Il rapporto è una media pesata di κ₁ e κ₂, con pesi a/(a+b) e b/(a+b): rimane fra i due fattori. Se i tratti hanno uguale modulo diventa (κ₁+κ₂)/2; con tratti diversi questa media semplice non vale in generale.","Sostituisci i due tratti nella somma prima di fare il rapporto."),
 ("Raddoppiare entrambi i tratti", "In entrambe le prove i due tratti restano sulla stessa retta e verso est. Nella prima misurano 2 m ciascuno; nella seconda 4 m ciascuno. Quanto vale il rapporto D₂/D₁?",2,
  "Il primo totale è quattro metri, il secondo otto metri. Quando tutti gli addendi sono moltiplicati per lo stesso fattore, quel fattore si può raccogliere davanti alla somma: anche il totale raddoppia.",
  r"D_2=2a+2b=2(a+b)=2D_1\qquad\frac{D_2}{D_1}=\frac84=2",
  "Il rapporto è due, senza unità. Il fattore quattro deriverebbe dal moltiplicare due raddoppi come se la legge fosse un prodotto. Qui i tratti si sommano.","Raccogli il fattore due comune ai due nuovi tratti."),
 ("La media di due spostamenti", "Due prove hanno tratti concordi verso est, misurati in metri. Nella prima i tratti sono 2 m e 2 m, nella seconda 4 m e 4 m. Con uguale peso statistico, quanto vale la media dei due moduli totali?",["3 m","4 m","6 m","8 m","12 m"],
  "I totali delle due prove sono quattro e otto metri. Per la media aritmetica sommiamo i risultati e dividiamo per il numero delle prove, che è due. La direzione comune e l’unità comune rendono il confronto omogeneo.",
  r"\overline D=\frac{4\,\mathrm m+8\,\mathrm m}{2}=6\,\mathrm m",
  "In questo caso si ottiene lo stesso risultato anche mediando prima i tratti: 3 m+3 m=6 m. È una conseguenza della linearità della somma, non una proprietà universale: per leggi con quadrati o potenze la media degli ingressi può dare un’altra uscita.","Fai la media dei totali 4 m e 8 m."),
 ("Trovare il tratto necessario", "In tutte le prove i due tratti restano sulla stessa retta e verso est. All’inizio a₁=b₁=2 m. Nella seconda prova si impone a₂=4 m e si vuole D₂=2D₁. Quale rapporto b₂/b₁ è necessario?",2,
  "Il totale iniziale è quattro metri e il totale desiderato è otto metri. Il nuovo primo tratto ne occupa già quattro. Al secondo tratto devono quindi rimanere gli altri quattro metri. Solo dopo averlo ricavato confrontiamo b₂ con b₁.",
  r"D_1=4\,\mathrm m\qquad D_2=8\,\mathrm m\qquad b_2=D_2-a_2=4\,\mathrm m\qquad\frac{b_2}{b_1}=\frac42=2",
  "Il secondo tratto deve raddoppiare. La verifica 4 m+4 m=8 m soddisfa il totale richiesto. Nei problemi additivi si ricostruisce il contributo mancante mediante una sottrazione, prima di calcolare il suo fattore di variazione.","Togli dal nuovo totale il tratto a₂ già assegnato."),
 ("Un display con guadagno costante", "In tutte le prove i due tratti restano sulla stessa retta e verso est. Un display indica un numero S=gD, con guadagno g>0 costante e offset nullo. Due tratti di 2 m ciascuno danno S=12. In una nuova prova S=24 e il secondo tratto misura 4 m. Quanto misura il primo tratto, in metri? Le letture S sono numeri di tacche del display.",4,
  "Il riferimento ha spostamento totale quattro metri. Dodici tacche per quattro metri significano tre tacche per metro. La lettura di ventiquattro tacche rappresenta quindi otto metri. Da questo totale sottraiamo il secondo tratto di quattro metri.",
  r"g=\frac{12}{4\,\mathrm m}=3\,\mathrm{m^{-1}}\qquad D=\frac{24}{3\,\mathrm{m^{-1}}}=8\,\mathrm m\qquad a=8\,\mathrm m-4\,\mathrm m=4\,\mathrm m",
  "Il guadagno ha dimensione di lunghezza inversa perché S è un conteggio. Ricostruendo il display si trova 3 m⁻¹·(4 m+4 m)=24. Confondere tacche e metri porterebbe a sottrarre grandezze diverse.","Converti le tacche in metri usando il riferimento."),
 ("Rimuovere anche l’offset", "In tutte le prove i due tratti restano sulla stessa retta e verso est. Un display segue S=gD+c, dove S è un conteggio e g,c sono costanti. Per due tratti di 2 m ciascuno indica 9; per due tratti di 4 m ciascuno indica 17. Nella prova ignota indica 13 e il secondo tratto misura 2 m. Quanto misura il primo, in metri?",["2","3","4","5","8"],
  "I due riferimenti danno D₁=4 m e D₂=8 m. Sottraendo le letture eliminiamo l’offset c: l’aumento di otto tacche corrisponde a quattro metri, quindi g=2 m⁻¹. Il primo riferimento lascia c=9−2·4=1. Dalla lettura ignota togliamo una tacca e dividiamo per il guadagno.",
  r"g=\frac{17-9}{8\,\mathrm m-4\,\mathrm m}=2\,\mathrm{m^{-1}}\qquad c=1\qquad D=\frac{13-1}{2\,\mathrm{m^{-1}}}=6\,\mathrm m\qquad a=6\,\mathrm m-2\,\mathrm m=4\,\mathrm m",
  "Il controllo è S=2 m⁻¹·(4 m+2 m)+1=13. La lettera c indica qui l’offset del display e non uno spostamento: sottrarla direttamente a una distanza sarebbe dimensionalmente scorretto.","Usa la differenza fra i due riferimenti per eliminare l’offset."),
 ("Il vincolo di uguaglianza", "Due tratti concordi verso est hanno uguale modulo: a=b>0. Il modulo totale è D=4 m. Quanto misura b, in metri?",["1","2","3","4","−2"],
  "L’uguaglianza fra i tratti fornisce l’informazione che mancava: possiamo sostituire a con b nella somma. Il totale diventa b+b=2b. Dividendo entrambi i membri per due ricaviamo ciascun tratto.",
  r"4\,\mathrm m=a+b=b+b=2b\qquad b=\frac{4\,\mathrm m}{2}=2\,\mathrm m",
  "La soluzione è positiva e unica. Senza il vincolo a=b, lo stesso totale ammetterebbe molte coppie, come 1 m e 3 m: conoscere il totale da solo non significa poterlo dividere a metà.","Sostituisci a con b prima di isolare il tratto richiesto.")
]
CHOICES={2:0,3:0,4:0,6:4,7:1,8:0,9:0,10:2,12:2,15:2,16:1}


def assemble(repo,source_ref):
    sources={r["id"]:r for r in json.loads(git_bytes(repo,source_ref,"packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json"))}
    file=Path(__file__).resolve().parents[2]/"editorial/assets/vector-sum-coordinates.svg";raw=file.read_bytes()
    asset={"id":sha(raw),"name":file.name,"mime":"image/svg+xml","data":base64.b64encode(raw).decode()}
    records=[];bindings=[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f"u1-vector-sum-{n:02}"
        a={"type":"choice","options":answer,"value":answer[CHOICES[n]]} if isinstance(answer,list) else {"type":"numeric","value":answer,"unit":"1" if n in (11,13) else "m","tolerance":0}
        row={"id":"AR-"+source_id,"kind":"question","course":"C1","section":"Vettori e componenti",
            "order":2080+n,"title":title,"version":1,"baseVersion":0,"skill":"C1-L002","prerequisites":["C1-L001","C1-L002"],"reuse":["C6"],
            "family":"coordinate-versus-displacement" if n==6 else "collinear-concordant-displacements",
            "difficulty":1 if n<=4 else 2 if n<=12 else 3,"prompt":prompt,"answer":a,
            "blocks":[text(before),*law_steps(law),text(after)],"hints":[hint,"Ricomponi i tratti e controlla origine, verso e unità."],
            "error":{"category":{2:"unità",3:"modello",4:"concetto",6:"concetto",8:"calcolo",10:"modello"}.get(n,"algebra"),"message":after,"target":"C1-L002"},
            "coverage":["Vettori","Spostamento e posizione"],"review":"Revisione AI con evidenze individuali; approvazione umana NOT_RUN; DRAFT"}
        assets={}
        if n==6:
            row["blocks"].insert(1,{"type":"figure","src":"/asset/"+asset["id"],"text":"Tre tappe con origine e scala fisse: partenza a −2 m; arrivo a +1 m dopo tre metri verso est; arrivo a +5 m dopo altri quattro. La coordinata finale è 5 m e lo spostamento totale è 7 m."})
            assets[file.name]=asset["id"]
        records.append(row)
        bindings.append({"id":row["id"],"sourceId":source_id,"sourceSha256":digest(sources[source_id]),"candidateSha256":digest(row),"assetChecksums":assets,"sourceRef":source_ref})
    return {"schema":"astra/1","records":records,"assets":[asset]},bindings


if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument("--repo",type=Path,required=True);p.add_argument("--source-ref",required=True);p.add_argument("--destination",type=Path,required=True)
    args=p.parse_args();pkg,bindings=assemble(args.repo,args.source_ref);args.destination.mkdir(parents=True,exist_ok=True)
    (args.destination/"vectors-003.json").write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+"\n")
    (args.destination/"vectors-003-bindings.json").write_text(canonical(bindings)+"\n")
    print(canonical({"questions":len(pkg["records"]),"status":"DRAFT"}))
