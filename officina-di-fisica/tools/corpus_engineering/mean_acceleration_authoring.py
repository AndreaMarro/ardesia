"""Author mean-acceleration candidates; endpoint data do not imply constant acceleration."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


TASKS = [
 ("Il cambiamento di velocità in due secondi", "In un riferimento inerziale un carrello si muove lungo un asse orientato. La componente della velocità passa da vᵢ=+2 m/s a v_f=+6 m/s in Δt=2 s. Quanto vale l’accelerazione media orientata A, in m/s²?", 2,
  "A misura il cambiamento di velocità diviso per il tempo impiegato a realizzarlo. Sottraiamo la velocità iniziale da quella finale: il cambiamento è +4 m/s. Dividiamo poi per i due secondi. Non conosciamo le velocità intermedie: questa è una media, non una prova di accelerazione costante.",
  r"\Delta v=v_f-v_i=(6-2)\,\mathrm{m/s}=4\,\mathrm{m/s}\qquad A=\frac{\Delta v}{\Delta t}=\frac{4\,\mathrm{m/s}}{2\,\mathrm s}=+2\,\mathrm{m/s^2}",
  "Il segno positivo indica che la componente finale è maggiore di quella iniziale. In questo caso entrambe sono positive e anche il modulo della velocità aumenta. Dividere soltanto 6 m/s per 2 s darebbe 3 m/s² e ignorerebbe che il carrello era già in movimento.", "Trova prima di quanto è cambiata la velocità, poi dividi per la durata."),
 ("Un secondo compare due volte", "L’accelerazione media orientata è la variazione di una componente di velocità divisa per una durata positiva. Quale unità SI è adatta?", ["m/s", "m", "s", "m/s²", "1"],
  "La variazione di velocità mantiene l’unità m/s. Dividerla per un intervallo in secondi introduce un secondo fattore s al denominatore. La durata non cancella il secondo che era già presente nella velocità.",
  r"[A]=\frac{L/T}{T}=L/T^2\qquad \frac{\mathrm{m/s}}{\mathrm s}=\mathrm{m/s^2}",
  "m/s² è l’unità corretta. m/s è ancora una velocità, m è uno spostamento e s una durata. 1 sarebbe un rapporto fra grandezze omogenee; qui numeratore e denominatore hanno dimensioni diverse.", "Scrivi m/s diviso per s usando una sola frazione."),
 ("Una differenza prima del rapporto", "In un riferimento inerziale la componente della velocità lungo un asse passa da vᵢ>0 a v_f>vᵢ in un intervallo Δt=2 s. Quale formula dà l’accelerazione media orientata A?", ["A=(v_f+vᵢ)/(2 s)", "A=(v_f−vᵢ)/(2 s)", "A=v_f/(2 s)", "A=(vᵢ−v_f)/(2 s)", "A=(v_f−vᵢ)(2 s)"],
  "La definizione usa la variazione finale meno iniziale, non la somma delle velocità. Dividiamo questa differenza per la durata completa dell’intervallo. La positività di v_f−vᵢ rende A positivo; non occorre assumere che l’accelerazione istantanea sia uguale in ogni istante.",
  r"\Delta v=v_f-v_i\qquad A=\frac{v_f-v_i}{\Delta t}\qquad A=\frac{v_f-v_i}{2\,\mathrm s}",
  "La somma al numeratore non misura un cambiamento. v_f da solo trascura la velocità iniziale; invertire la sottrazione dà il segno opposto. Moltiplicare per 2 s avrebbe unità di lunghezza, non di accelerazione. Il fattore 2 s è una durata con unità, non un semplice numero due.", "Individua gli estremi dell’intervallo e rispetta l’ordine finale meno iniziale."),
 ("Stessa durata, maggiore velocità finale", "Due prove rettilinee sono osservate nello stesso riferimento inerziale e con lo stesso verso positivo. Entrambe durano 2 s e iniziano con vᵢ=+2 m/s. La velocità finale passa da +6 m/s nella prima a +10 m/s nella seconda. Come cambia l’accelerazione media A?", ["Resta +2 m/s²", "Aumenta a +3 m/s²", "Raddoppia da +2 a +4 m/s²", "Diventa nulla", "Diventa negativa"],
  "A parità di durata e velocità iniziale, confrontiamo i due cambiamenti di velocità. Nel primo caso il carrello guadagna quattro metri al secondo; nel secondo otto. Poiché anche la durata è identica, il raddoppio della variazione raddoppia la media.",
  r"A_1=\frac{(6-2)\,\mathrm{m/s}}{2\,\mathrm s}=2\,\mathrm{m/s^2}\qquad A_2=\frac{(10-2)\,\mathrm{m/s}}{2\,\mathrm s}=4\,\mathrm{m/s^2}",
  "Tre m/s² corrisponderebbero a una variazione di 6 m/s, che non è quella della seconda prova. Invariata, nulla e negativa contraddicono gli estremi misurati. Il raddoppio riguarda qui l’accelerazione media; non consente di ricostruire la sua storia istantanea.", "Confronta 6−2 e 10−2 prima di dividere per due secondi."),
 ("Risalire alla velocità finale", "In un riferimento inerziale, lungo un asse, vᵢ=+2 m/s. In Δt=2 s l’accelerazione media orientata è A=+2 m/s². Quanto vale la componente finale v_f, in m/s?", 6,
  "Dalla definizione A=(v_f−vᵢ)/Δt moltiplichiamo entrambi i membri per Δt. Otteniamo la variazione di velocità e poi aggiungiamo la velocità iniziale. Questa inversione della media è valida anche se l’accelerazione non è costante durante l’intervallo.",
  r"A\Delta t=v_f-v_i\qquad v_f=v_i+A\Delta t\qquad A\Delta t=(2\,\mathrm{m/s^2})(2\,\mathrm s)=4\,\mathrm{m/s}\qquad v_f=(2+4)\,\mathrm{m/s}=+6\,\mathrm{m/s}",
  "La velocità finale supera quella iniziale come richiesto da A>0. Il controllo (6−2)/2=2 riproduce la media in m/s². Quattro metri al secondo sarebbe soltanto l’incremento, mentre sommare direttamente 2 m/s e 2 m/s² sarebbe dimensionalmente scorretto.", "Moltiplica la media per la durata prima di sommarla alla velocità iniziale."),
 ("Recuperare la velocità iniziale", "In un riferimento inerziale, lungo un asse orientato, una prova dura Δt=2 s e termina con v_f=+6 m/s. L’accelerazione media è A=+2 m/s². Quanto vale la componente iniziale vᵢ, in m/s?", 2,
  "Il cambiamento complessivo di velocità è AΔt=+4 m/s. La velocità finale contiene già questo incremento: lo sottraiamo per ritrovare il valore iniziale. Non cambiamo il segno di A, perché il segno appartiene ai dati dell’intervallo.",
  r"A\Delta t=v_f-v_i\qquad v_i=v_f-A\Delta t\qquad v_i=6\,\mathrm{m/s}-(2\,\mathrm{m/s^2})(2\,\mathrm s)\qquad v_i=(6-4)\,\mathrm{m/s}=+2\,\mathrm{m/s}",
  "Il risultato è positivo e minore di 6 m/s. Ricostruendo la variazione, 6−2=4 m/s e dividendo per 2 s torna +2 m/s². Aggiungere l’incremento darebbe 10 m/s: la prova da 10 a 6 avrebbe invece accelerazione media negativa.", "Togli dalla velocità finale l’incremento totale AΔt."),
 ("Una partenza già più veloce", "Due prove rettilinee nello stesso riferimento inerziale durano 2 s e terminano entrambe con v_f=+6 m/s. La prima inizia con vᵢ₁=+2 m/s, la seconda con vᵢ₂=+4 m/s. A₁ e A₂ sono le rispettive accelerazioni medie orientate. Quanto vale A₂/A₁?", ["2", "1", "−1/2", "1/4", "1/2"],
  "La seconda prova deve colmare una differenza di velocità più piccola. La prima guadagna quattro metri al secondo, la seconda due, nello stesso tempo. Calcoliamo quindi le medie +2 e +1 m/s² e formiamo il rapporto secondo su primo.",
  r"A_1=\frac{(6-2)\,\mathrm{m/s}}{2\,\mathrm s}=2\,\mathrm{m/s^2}\qquad A_2=\frac{(6-4)\,\mathrm{m/s}}{2\,\mathrm s}=1\,\mathrm{m/s^2}\qquad \frac{A_2}{A_1}=\frac12",
  "Due è il rapporto fra le velocità iniziali, non fra le accelerazioni medie. Uno ignora il diverso incremento; un quarto dimezza due volte. Il rapporto negativo è incompatibile con due variazioni positive. Il valore richiesto è puro: le unità si cancellano.", "Una velocità iniziale maggiore lascia un incremento minore fino allo stesso arrivo."),
 ("Convertire solo la lunghezza", "L’accelerazione lungo il verso positivo di un asse vale +250 cm/s². Usa 1 m=100 cm e mantieni il secondo come unità di tempo. Qual è lo stesso valore in m/s²?", ["+25000", "+25", "+5/2", "+250", "+1/40"],
  "Il centimetro compare alla prima potenza al numeratore. Il quadrato riguarda il secondo al denominatore, che qui non cambia. Sostituiamo quindi ogni centimetro con 1/100 di metro e riduciamo la frazione dividendo entrambi i termini per cinquanta.",
  r"250\,\mathrm{cm/s^2}=250\times\frac1{100}\,\mathrm{m/s^2}\qquad \frac{250}{100}=\frac52\qquad A=+\frac52\,\mathrm{m/s^2}",
  "Il segno resta positivo. 25000 moltiplica nella direzione sbagliata; 25 usa dieci invece di cento; 250 non converte. 1/40 scambia numeratore e denominatore del fattore complessivo. Non si divide per 100²: non stiamo convertendo centimetri quadrati.", "Cambia cm in m; il fattore s² rimane identico."),
 ("L’inversa con le unità visibili", "In un riferimento inerziale una componente di velocità passa da vᵢ>0 a v_f>vᵢ in Δt=2 s. L’accelerazione media orientata è A>0. Quale formula isola v_f?", ["v_f=vᵢ+A(2 s)", "v_f=vᵢ−A(2 s)", "v_f=(vᵢ+A(2 s))/2", "v_f=A(2 s)", "v_f=vᵢ+A/(2 s)"],
  "Partiamo dalla definizione della media, moltiplichiamo per la durata e aggiungiamo vᵢ. Il termine A(2 s) ha dimensione di velocità e si può sommare a vᵢ. Tenere il secondo nella formula evita di scambiare il tempo con un coefficiente puro.",
  r"A=\frac{v_f-v_i}{2\,\mathrm s}\qquad A(2\,\mathrm s)=v_f-v_i\qquad v_f=v_i+A(2\,\mathrm s)",
  "La sottrazione darebbe una diminuzione invece dell’incremento positivo. Dividere tutta la somma per due non segue da alcuna operazione sull’equazione; omettere vᵢ confonde velocità finale e variazione. A/(2 s) avrebbe unità m/s³ e non si può sommare a una velocità.", "Elimina prima il denominatore 2 s e poi la sottrazione di vᵢ."),
 ("Fattori sulle due velocità", "In due prove rettilinee nello stesso riferimento inerziale la durata è sempre Δt=2 s. Nella prima le componenti sono 0<vᵢ<v_f; nella seconda diventano κ₂vᵢ e κ₁v_f, con κ₁,κ₂>0 e κ₁v_f>κ₂vᵢ. A₁,A₂ sono le accelerazioni medie. Quale rapporto A₂/A₁ è corretto?", ["κ₁κ₂", "κ₁−κ₂", "(κ₁v_f+κ₂vᵢ)/(v_f−vᵢ)", "(κ₁v_f−κ₂vᵢ)/(v_f−vᵢ)", "(κ₁v_f−κ₂vᵢ)/(v_f+vᵢ)"],
  "La durata comune si cancella nel rapporto, ma ciascuna media contiene ancora la propria differenza finale meno iniziale. Entrambe le differenze sono positive per i vincoli dichiarati e il denominatore non è nullo. I fattori agiscono su termini sottratti, non su due fattori di un prodotto.",
  r"A_1=\frac{v_f-v_i}{\Delta t}\qquad A_2=\frac{\kappa_1v_f-\kappa_2v_i}{\Delta t}\qquad \frac{A_2}{A_1}=\frac{\kappa_1v_f-\kappa_2v_i}{v_f-v_i}",
  "κ₁−κ₂ darebbe zero senza cambiamenti, invece di uno. κ₁κ₂ darebbe quattro quando entrambe le velocità raddoppiano, mentre la differenza raddoppia. Le alternative con una somma sostituiscono alla variazione una grandezza diversa. Non si usa qui il rapporto dei moduli di accelerazioni con segni arbitrari: entrambi i segni sono positivi per i dati.", "Cancella la durata comune dopo aver scritto entrambe le differenze."),
 ("Confrontare due incrementi completi", "Due prove rettilinee nello stesso riferimento inerziale durano ciascuna 2 s. La prima passa da vᵢ₁=+2 a v_f₁=+6 m/s; la seconda da vᵢ₂=+4 a v_f₂=+10 m/s. A₁ e A₂ sono le accelerazioni medie orientate. Quanto vale A₂/A₁?", ["3/2", "2/3", "5/3", "2", "1/2"],
  "Le variazioni sono +4 m/s e +6 m/s. Dividendole per la stessa durata otteniamo medie +2 e +3 m/s². Nel rapporto si può anche cancellare subito la durata comune, lasciando sei quarti, che si riduce dividendo per due.",
  r"\Delta v_1=(6-2)\,\mathrm{m/s}=4\,\mathrm{m/s}\qquad \Delta v_2=(10-4)\,\mathrm{m/s}=6\,\mathrm{m/s}\qquad \frac{A_2}{A_1}=\frac64=\frac32",
  "2/3 inverte il rapporto; 5/3 confronta soltanto le velocità finali e 2 quelle iniziali. 1/2 è la crescita relativa (A₂−A₁)/A₁, non il rapporto A₂/A₁. Il risultato maggiore di uno è coerente con l’incremento più grande nella seconda prova.", "Confronta i cambiamenti di velocità, non i soli valori finali."),
 ("Media di due accelerazioni medie", "Due prove rettilinee nello stesso riferimento inerziale durano 2 s ciascuna. La prima passa da +2 a +6 m/s e la seconda da +4 a +10 m/s. Qual è la media aritmetica, con uguale peso, delle due accelerazioni medie orientate?", ["5 m/s²", "5/2 m/s²", "5/4 m/s²", "7/2 m/s²", "3/2 m/s²"],
  "Ricaviamo prima la media di ogni prova: (6−2)/2=2 e (10−4)/2=3, in m/s². Le due prove hanno uguale peso, quindi facciamo la semisomma di due e tre. Non mescoliamo la media fra prove con una misura istantanea.",
  r"A_1=2\,\mathrm{m/s^2}\qquad A_2=3\,\mathrm{m/s^2}\qquad \overline A=\frac{2+3}{2}\,\mathrm{m/s^2}=\frac52\,\mathrm{m/s^2}",
  "Cinque manca della divisione per due e cinque quarti la applica due volte. Sette mezzi e tre mezzi non sono compresi fra due e tre. In questo caso la durata comune rende la legge lineare nelle due velocità: anche le loro medie darebbero (8−3)/2=5/2 m/s². Non è una regola per medie con durate diverse.", "La media richiesta deve stare fra due e tre m/s²."),
 ("Scegliere la velocità iniziale della nuova prova", "Due prove rettilinee nello stesso riferimento inerziale durano 2 s ciascuna. La prima passa da vᵢ₁=+2 a v_f₁=+6 m/s. Nella seconda si impone v_f₂=+10 m/s e A₂=(3/2)A₁, dove A è l’accelerazione media orientata. Si richiede 0<vᵢ₂<v_f₂. Quanto vale vᵢ₂/vᵢ₁?", 2,
  "La prima media è +2 m/s², quindi la nuova deve valere +3 m/s². In due secondi serve una variazione di +6 m/s. Dall’arrivo a +10 m/s sottraiamo questa variazione per ottenere la partenza; poi confrontiamo le due velocità iniziali.",
  r"A_1=\frac{(6-2)\,\mathrm{m/s}}{2\,\mathrm s}=2\,\mathrm{m/s^2}\qquad A_2=3\,\mathrm{m/s^2}\qquad v_{i2}=v_{f2}-A_2\Delta t\qquad v_{i2}=(10-3\times2)\,\mathrm{m/s}=4\,\mathrm{m/s}\qquad \frac{v_{i2}}{v_{i1}}=\frac42=2",
  "La nuova velocità iniziale è positiva e minore di 10 m/s. Il controllo (10−4)/2=3 m/s² riproduce l’obiettivo. Moltiplicare vᵢ₁ per 3/2 darebbe 3 m/s e una media 7/2 m/s²: il fattore assegnato riguarda la media, non automaticamente l’ingresso.", "Trasforma prima la nuova media nell’incremento di velocità su due secondi."),
 ("Tarare la lettura di una media", "Nel riferimento inerziale e lungo lo stesso asse, ogni prova dura Δt=2 s e ha 0<vᵢ<v_f. A è l’accelerazione media orientata. Un display conta tacche T=gA, con g>0 costante e offset nullo. Il riferimento vᵢ=2 m/s,v_f=6 m/s dà T=6. Nella prova ignota T=9 e vᵢ=4 m/s. Quanto vale v_f, in m/s?", 10,
  "Il riferimento ha A=2 m/s²: sei tacche corrispondono a un guadagno tre s²/m, perché T è puro. Nove tacche rappresentano quindi +3 m/s². La media per due secondi fornisce un incremento di +6 m/s, da aggiungere alla nuova velocità iniziale.",
  r"A_{\rm rif}=2\,\mathrm{m/s^2}\qquad g=\frac6{2\,\mathrm{m/s^2}}=3\,\mathrm{s^2/m}\qquad A=\frac9{3\,\mathrm{s^2/m}}=3\,\mathrm{m/s^2}\qquad v_f=v_i+A\Delta t=(4+3\times2)\,\mathrm{m/s}=10\,\mathrm{m/s}",
  "La verifica restituisce T=3 s²/m·[(10−4) m/s /(2 s)]=9. Le tacche non sono m/s²: occorre rimuovere la taratura prima di ricostruire v_f. Anche la nuova prova soddisfa v_f>vᵢ>0.", "Usa il riferimento per convertire le nove tacche in accelerazione media."),
 ("Eliminare un offset prima dell’inversa", "Nel medesimo riferimento inerziale ogni prova rettilinea dura 2 s e ha 0<vᵢ<v_f. A è l’accelerazione media orientata. Un display conta tacche T=gA+c, con g>0,c costanti. I riferimenti (vᵢ=2,v_f=6 m/s) e (vᵢ=4,v_f=10 m/s) danno T=5 e T=7. La prova ignota ha vᵢ=2 m/s,T=9. Quanto vale v_f?", ["9 m/s", "5 m/s", "10 m/s", "11 m/s", "20 m/s"],
  "I riferimenti hanno medie +2 e +3 m/s². La differenza fra letture elimina c e dà g=2 s²/m; il primo riferimento lascia c=1. Dalla lettura nove togliamo l’offset e dividiamo per il guadagno: A=4 m/s². Ricaviamo poi la velocità finale dalla definizione della media.",
  r"g=\frac{7-5}{(3-2)\,\mathrm{m/s^2}}=2\,\mathrm{s^2/m}\qquad c=5-2\times2=1\qquad A=\frac{9-1}{2\,\mathrm{s^2/m}}=4\,\mathrm{m/s^2}\qquad v_f=v_i+A\Delta t=(2+4\times2)\,\mathrm{m/s}=10\,\mathrm{m/s}",
  "Nove confonde tacche e velocità; cinque, undici e venti non ricostruiscono la lettura dopo la taratura. Con dieci m/s si ottiene A=(10−2)/2=4 m/s² e T=2·4+1=9. La sottrazione dell’offset precede la divisione: un rapporto fra letture non lo elimina.", "Calcola le accelerazioni dei due riferimenti prima del guadagno."),
 ("Un rapporto fra le velocità", "In un riferimento inerziale una prova rettilinea dura Δt=2 s. Le componenti delle velocità iniziale e finale soddisfano v_f=3vᵢ con vᵢ>0. L’accelerazione media orientata è A=+2 m/s². Quanto vale vᵢ?", ["1 m/s", "3 m/s", "−2 m/s", "4 m/s", "2 m/s"],
  "Il vincolo rende la variazione uguale a 3vᵢ−vᵢ=2vᵢ. La definizione della media dà AΔt=2vᵢ. Prima moltiplichiamo accelerazione e durata per ottenere una velocità, poi dividiamo per il coefficiente puro due: così le unità restano corrette.",
  r"A\Delta t=v_f-v_i=3v_i-v_i=2v_i\qquad v_i=\frac{A\Delta t}{2}\qquad v_i=\frac{(2\,\mathrm{m/s^2})(2\,\mathrm s)}2=2\,\mathrm{m/s}\qquad v_f=6\,\mathrm{m/s}",
  "La coppia (2,6) m/s soddisfa vincolo e media. Uno, tre e quattro m/s darebbero rispettivamente medie uno, tre e quattro m/s² su due secondi; il valore negativo viola vᵢ>0. La durata di due secondi non può essere cancellata come se fosse priva di unità.", "Sostituisci v_f=3vᵢ prima di invertire la definizione.")
]
CHOICES = {2:3,3:1,4:2,7:4,8:2,9:0,10:3,11:0,12:1,15:2,16:4}


def assemble(repo, source_ref):
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,'packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json'))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/mean-acceleration-secant.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-mean-acceleration-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':'1' if n==13 else 'm/s²' if n==1 else 'm/s','tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Cinematica rettilinea','order':2280+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L003','prerequisites':['C1-L001','C1-L002','C1-L003'],'reuse':['C6'],
            'family':'acceleration-length-unit-conversion' if n==8 else 'mean-acceleration-endpoints','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Ricostruisci finale meno iniziale e controlla la durata con le sue unità.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'unità',10:'modello',12:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L003'},
            'coverage':['Accelerazione media e istantanea','Grafici cinematici'],'review':'Candidato autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
        assets={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio con punti (0 s,2 m/s) e (2 s,6 m/s). Tre tappe alla stessa scala: leggi gli estremi; costruisci Δv=4 m/s e Δt=2 s; ricava la pendenza media +2 m/s². Il segmento tratteggiato è la secante, non la legge delle velocità intermedie.'})
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
    (args.destination/'mean-acceleration-013.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'mean-acceleration-013-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
