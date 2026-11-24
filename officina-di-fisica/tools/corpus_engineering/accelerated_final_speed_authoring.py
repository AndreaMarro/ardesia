"""Author constant-acceleration final-velocity candidates with dimensional inverses."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


TASKS = [
 ("Una velocità iniziale da conservare", "In un riferimento inerziale un carrello si muove lungo un asse con velocità iniziale v₀=+2 m/s. Per t=2 s mantiene accelerazione costante a=+2 m/s². Quanto vale la componente finale V, in m/s?", 6,
  "L’accelerazione costante aggiunge la stessa variazione di velocità in ogni secondo. In due secondi l’incremento è a·t=4 m/s. Il carrello aveva già +2 m/s all’inizio: questo valore va aggiunto all’incremento, non sostituito da esso.",
  r"V=v_0+at\qquad at=(2\,\mathrm{m/s^2})(2\,\mathrm s)=4\,\mathrm{m/s}\qquad V=(2+4)\,\mathrm{m/s}=+6\,\mathrm{m/s}",
  "La velocità resta positiva per tutto l’intervallo, quindi in questo caso anche il suo modulo finale è 6 m/s. Quattro m/s è soltanto la variazione. Non stiamo calcolando uno spostamento: nel grafico v–t leggiamo l’altezza finale, non l’area.", "Aggiungi alla velocità iniziale l’incremento accumulato nei due secondi."),
 ("Il prodotto accelerazione per tempo", "Una velocità finale si ricava sommando alla componente iniziale il prodotto di accelerazione costante e durata. Quale unità SI è adatta alla velocità finale?", ["m", "m/s²", "kg", "m/s", "s"],
  "Accelerazione per tempo ha dimensione (L/T²)T=L/T. Questo contributo può essere sommato alla velocità iniziale perché ha la stessa dimensione. Un’accelerazione da sola non è una velocità, anche se il suo numero compare nel calcolo.",
  r"[at]=(L/T^2)T=L/T\qquad [V]=[v_0]=L/T",
  "m/s è corretto. m misura uno spostamento e m/s² l’accelerazione prima di moltiplicarla per il tempo. kg è una massa, s una durata: nessuna delle due può essere sommata a una velocità.", "Moltiplica anche le unità di a e t."),
 ("L’accelerazione è un coefficiente con unità", "In un riferimento inerziale un corpo parte con componente di velocità v₀>0 lungo un asse e mantiene accelerazione a=+2 m/s² per una durata t≥0. V indica la componente finale. Quale relazione descrive il moto?", ["V=v₀+a/t", "V=v₀+at", "V=at", "V=(v₀+at)/2", "V=v₀−at"],
  "Per accelerazione costante la variazione di velocità è a·t. Sommandola alla componente iniziale otteniamo il valore finale. Il simbolo a rappresenta +2 m/s² con le sue unità, non il solo numero due. La relazione vale anche all’inizio: con t=0 deve restituire v₀.",
  r"\Delta v=at\qquad V=v_0+at\qquad V=v_0+(2\,\mathrm{m/s^2})t",
  "a/t avrebbe unità m/s³ e non si può sommare a v₀. at omette la velocità iniziale. La semisomma non è la velocità finale, mentre il segno meno descriverebbe un’accelerazione opposta a quella assegnata. Qui V>0 per ogni t≥0, perciò velocità componente e modulo hanno lo stesso valore numerico.", "A t=0 la formula deve riprodurre la velocità iniziale."),
 ("Una partenza più veloce", "Due prove rettilinee nello stesso riferimento inerziale mantengono entrambe a=+2 m/s² per t=2 s. La prima parte con v₀₁=+2 m/s, la seconda con v₀₂=+4 m/s. Come cambia la componente finale V?", ["Raddoppia da 6 a 12 m/s", "Resta 6 m/s", "Aumenta da 6 a 8 m/s", "Scende a 4 m/s", "Diventa zero"],
  "Il contributo dell’accelerazione è lo stesso in entrambe le prove: +4 m/s. Aumenta soltanto la velocità iniziale, di due metri al secondo. Conserviamo quindi lo stesso incremento e calcoliamo separatamente i due valori finali.",
  r"at=4\,\mathrm{m/s}\qquad V_1=(2+4)\,\mathrm{m/s}=6\,\mathrm{m/s}\qquad V_2=(4+4)\,\mathrm{m/s}=8\,\mathrm{m/s}",
  "Il rapporto fra i valori finali è 8/6=4/3: raddoppiare una parte della somma non raddoppia tutta la somma. Invariata, diminuita e nulla ignorano il cambiamento positivo di v₀. Un raddoppio finale richiederebbe di raddoppiare anche l’incremento a·t.", "Tieni fisso il contributo di quattro metri al secondo."),
 ("Togliere l’incremento già accumulato", "In un riferimento inerziale un corpo si muove lungo un asse con v₀>0. Dopo t=2 s di accelerazione costante a=+2 m/s² termina con componente V=+6 m/s. Quanto vale v₀, in m/s?", 2,
  "La velocità finale è la somma di quella iniziale e dell’incremento. Per isolare v₀ sottraiamo a·t da entrambi i membri. L’incremento vale quattro metri al secondo; sottraendolo dai sei finali ricaviamo la partenza.",
  r"V=v_0+at\qquad V-at=v_0\qquad v_0=6\,\mathrm{m/s}-(2\,\mathrm{m/s^2})(2\,\mathrm s)\qquad v_0=(6-4)\,\mathrm{m/s}=+2\,\mathrm{m/s}",
  "Due m/s è positivo come richiede il testo. Il controllo 2 m/s+4 m/s=6 m/s ricostruisce la misura. Aggiungere l’incremento una seconda volta darebbe 10 m/s, che con accelerazione positiva porterebbero a 14 m/s, non a sei.", "Sottrai dalla velocità finale il prodotto a·t."),
 ("Quanto dura l’accelerazione?", "In un riferimento inerziale, lungo un asse orientato, v₀=+2 m/s e a=+2 m/s² è costante. Si raggiunge la componente V=+6 m/s dopo una durata t≥0. Quanto vale t, in secondi?", 2,
  "Serve un incremento di quattro metri al secondo. Con due metri al secondo di incremento per ogni secondo occorrono due secondi. Algebricamente sottraiamo v₀, poi dividiamo per a, che è positivo e diverso da zero.",
  r"V-v_0=at\qquad t=\frac{V-v_0}{a}\qquad t=\frac{(6-2)\,\mathrm{m/s}}{2\,\mathrm{m/s^2}}=2\,\mathrm s",
  "La divisione delle unità restituisce secondi. Il risultato è non negativo perché V≥v₀; se si imponesse V<v₀ con la stessa a>0 non esisterebbe una durata futura nel modello. Dividere soltanto V per a ignorerebbe i due m/s già presenti all’inizio.", "Dividi l’aumento di velocità, non la velocità finale, per l’accelerazione."),
 ("Il tempo raddoppia, la velocità finale no", "Due prove rettilinee nello stesso riferimento inerziale iniziano con v₀=+2 m/s e mantengono a=+2 m/s² costante. La prima dura t₁=2 s, la seconda t₂=4 s. V₁ e V₂ sono le componenti finali. Quanto vale V₂/V₁?", ["2", "3/5", "5/6", "5/3", "10/3"],
  "Gli incrementi sono quattro e otto m/s, ma a ciascuno va aggiunta la stessa partenza di due m/s. Le velocità finali sono quindi sei e dieci, non quattro e otto. Il rapporto dieci sesti si semplifica dividendo per due.",
  r"V_1=(2+2\times2)\,\mathrm{m/s}=6\,\mathrm{m/s}\qquad V_2=(2+2\times4)\,\mathrm{m/s}=10\,\mathrm{m/s}\qquad \frac{V_2}{V_1}=\frac{10}{6}=\frac53",
  "Due è il rapporto fra durate o incrementi, non fra velocità finali. 3/5 inverte il rapporto; 5/6 dimezza il corretto, mentre 10/3 lo raddoppia. Il risultato è fra uno e due perché soltanto una parte della somma finale è raddoppiata.", "Aggiungi i due metri al secondo iniziali in entrambe le prove."),
 ("Valutare uno scarto in velocità", "In un riferimento inerziale un carrello parte con v₀=+2 m/s e mantiene accelerazione a=+2 m/s² per t=2 s lungo lo stesso asse. Una soluzione propone V_proposto=12 m/s per la componente finale. Quanto vale «proposto meno corretto»?", ["+7 m/s", "+5 m/s", "+6 m/s", "−6 m/s", "+12 m/s"],
  "La velocità corretta contiene la partenza e l’incremento: 2+2·2=6 m/s. Lo scarto richiesto è la differenza fra dodici e sei, nell’ordine indicato. Non è un’accelerazione e non si divide nuovamente per la durata.",
  r"V=(2+2\times2)\,\mathrm{m/s}=6\,\mathrm{m/s}\qquad e=(12-6)\,\mathrm{m/s}=+6\,\mathrm{m/s}",
  "Il segno positivo indica sovrastima; −6 m/s invertirebbe il confronto. Sette e cinque non derivano dalla differenza richiesta; dodici omette il valore corretto. Il rapporto proposta/corretto sarebbe due, un numero puro, e risponderebbe a un altro compito.", "Trova prima V, poi sottraila da dodici metri al secondo."),
 ("La formula inversa conserva il segno", "In un riferimento inerziale un moto rettilineo ha accelerazione costante a=+2 m/s² e durata t≥0. La componente finale V e t sono note; si richiede v₀>0. Quale formula isola la componente iniziale v₀?", ["v₀=V+at", "v₀=V−at", "v₀=V/(at)", "v₀=(V−at)/2", "v₀=at−V"],
  "Nella relazione V=v₀+at il termine at è sommato a v₀. Sottraendolo su entrambi i membri rimane v₀=V−at. Per rispettare v₀>0 i dati devono soddisfare V>at: un valore algebrico negativo non sarebbe ammissibile per questo quesito.",
  r"V-at=v_0+at-at\qquad v_0=V-at\qquad V>at\quad(v_0>0)",
  "La somma applica ancora l’incremento invece di rimuoverlo. V/(at) è adimensionale e non è una velocità. La divisione per due non è richiesta dall’equazione; at−V è il negativo dell’inversa corretta. Sostituendo (V−at)+at ritroviamo V.", "Elimina l’addendo at con una sottrazione uguale sui due membri."),
 ("Fattori su partenza e durata", "In due prove rettilinee nello stesso riferimento inerziale l’accelerazione è sempre la costante a=+2 m/s². Nella prima v₀>0 e la durata è t>0; nella seconda sono κ₁v₀ e κ₂t, con κ₁,κ₂>0. V₁,V₂ indicano le componenti finali. Quale formula dà V₂/V₁?", ["κ₁κ₂", "κ₁+κ₂", "(κ₁v₀−aκ₂t)/(v₀+at)", "(κ₁v₀+aκ₂t)/(v₀+at)", "(κ₁v₀+aκ₂t)/(2(v₀+at))"],
  "La legge somma la partenza al contributo dell’accelerazione. Inseriamo i nuovi dati in ciascun addendo, lasciando a invariata, e dividiamo per la somma iniziale. V₁ è positivo, quindi il rapporto è definito.",
  r"V_1=v_0+at\qquad V_2=\kappa_1v_0+a\kappa_2t\qquad \frac{V_2}{V_1}=\frac{\kappa_1v_0+a\kappa_2t}{v_0+at}",
  "κ₁κ₂ tratta una somma come un prodotto; κ₁+κ₂ dà due senza cambiamenti invece di uno. Il segno meno cambierebbe accelerazione nella seconda prova, e il denominatore doppio dimezzerebbe il rapporto. Se κ₁=κ₂=κ, la formula corretta raccoglie κ e restituisce κ.", "Trasforma separatamente v₀ e il contributo at prima del rapporto."),
 ("Due contributi che raddoppiano insieme", "Due prove rettilinee nello stesso riferimento inerziale mantengono a=+2 m/s² costante. La prima ha v₀₁=+2 m/s,t₁=2 s; la seconda v₀₂=+4 m/s,t₂=4 s. V₁,V₂ sono le componenti finali. Quanto vale V₂/V₁?", 2,
  "Nella seconda prova raddoppiano sia la partenza sia il contributo dell’accelerazione, perché raddoppia la durata a parità di a. Tutta la somma finale è quindi due volte quella iniziale. Calcoliamo sei e dodici m/s per verificare il ragionamento.",
  r"V_1=(2+2\times2)\,\mathrm{m/s}=6\,\mathrm{m/s}\qquad V_2=(4+2\times4)\,\mathrm{m/s}=12\,\mathrm{m/s}\qquad \frac{V_2}{V_1}=\frac{12}{6}=2",
  "Quattro moltiplicherebbe fra loro i due raddoppi; qui i contributi sono addendi. Il rapporto non porta unità, mentre ogni velocità ne conserva una. Entrambe le prove mantengono componenti positive e nessuna inversione del moto.", "Raccogli due dalla somma dei nuovi contributi."),
 ("Media delle velocità finali", "In due prove rettilinee nello stesso riferimento inerziale a=+2 m/s² è costante. La prima ha v₀=+2 m/s,t=2 s; la seconda v₀=+4 m/s,t=4 s. Con uguale peso, qual è la media aritmetica delle due componenti finali?", ["10 m/s", "8 m/s", "9 m/s", "18 m/s", "9/2 m/s"],
  "Le velocità finali sono sei e dodici m/s. La media fra prove assegna metà peso a ciascun valore e vale nove m/s. Non si chiede la velocità media durante una delle accelerazioni: quella richiederebbe un confronto diverso fra tempi e spostamenti.",
  r"V_1=6\,\mathrm{m/s}\qquad V_2=12\,\mathrm{m/s}\qquad \overline V=\frac{6+12}{2}\,\mathrm{m/s}=9\,\mathrm{m/s}",
  "Diciotto manca della divisione per due e nove mezzi la applica due volte; otto e dieci non sono la semisomma. Essendo a comune, anche gli ingressi medi v₀=3 m/s e t=3 s danno 3+2·3=9 m/s: la legge è lineare nei due ingressi in questo confronto.", "Fai la media di sei e dodici, due uscite di prove diverse."),
 ("Progettare la nuova durata", "Nello stesso riferimento inerziale due prove rettilinee mantengono a=+2 m/s² costante. La prima ha v₀₁=+2 m/s,t₁=2 s. Nella seconda si impone v₀₂=+4 m/s e si vuole V₂=2V₁, dove V è la componente finale. La nuova durata t₂ deve essere non negativa. Quanto vale t₂/t₁?", 2,
  "La prima prova termina a sei m/s, quindi l’obiettivo è dodici. Partendo da quattro occorre guadagnare otto m/s. Dividiamo questa variazione per l’accelerazione due m/s² per ricavare quattro secondi, poi confrontiamo con i due iniziali.",
  r"V_1=6\,\mathrm{m/s}\qquad V_2=12\,\mathrm{m/s}\qquad t_2=\frac{V_2-v_{02}}a\qquad t_2=\frac{(12-4)\,\mathrm{m/s}}{2\,\mathrm{m/s^2}}=4\,\mathrm s\qquad \frac{t_2}{t_1}=\frac42=2",
  "La durata positiva soddisfa il vincolo e il controllo 4+2·4=12 m/s ricostruisce la velocità voluta. Il fatto che il rapporto sia due deriva dai dati scelti: se cambiasse soltanto la durata, il rapporto delle velocità finali non sarebbe in generale lo stesso.", "Togli dall’obiettivo la nuova velocità iniziale, poi dividi per a."),
 ("Separare guadagno e incremento fisico", "In ogni prova rettilinea, osservata nello stesso riferimento inerziale, v₀>0 e a=+2 m/s² è costante. V è la componente finale. Un display conta tacche T=gV con g>0 costante e offset nullo. Il riferimento v₀=2 m/s,t=2 s dà T=18. La prova ignota ha T=36,t=4 s. Quanto vale v₀, in m/s?", 4,
  "Il riferimento termina con V=6 m/s: diciotto tacche indicano un guadagno g=3 s/m. La lettura trentasei rappresenta quindi 12 m/s. Nella nuova prova il contributo fisico at è 8 m/s: lo sottraiamo dalla velocità ricostruita.",
  r"V_{\rm rif}=6\,\mathrm{m/s}\qquad g=\frac{18}{6\,\mathrm{m/s}}=3\,\mathrm{s/m}\qquad V=\frac{36}{3\,\mathrm{s/m}}=12\,\mathrm{m/s}\qquad v_0=V-at=(12-2\times4)\,\mathrm{m/s}=4\,\mathrm{m/s}",
  "Le tacche sono un conteggio puro; g converte fra quel conteggio e una velocità. Il controllo completo è T=3 s/m·[4 m/s+(2 m/s²)(4 s)]=36. Il valore v₀=4 m/s è positivo: la taratura e il vincolo fisico sono entrambi rispettati.", "Rimuovi la taratura prima di togliere l’incremento at."),
 ("Due riferimenti per una velocità", "In ogni prova rettilinea nello stesso riferimento inerziale v₀>0 e a=+2 m/s² è costante. V è la componente finale. Un display conta tacche T=gV+c con g>0,c costanti. I riferimenti (v₀=2 m/s,t=2 s) e (v₀=4 m/s,t=4 s) danno T=13 e 25. La prova ignota ha T=17,t=2 s. Quanto vale v₀?", ["2 m/s", "5 m/s", "3 m/s", "4 m/s", "8 m/s"],
  "I riferimenti terminano a sei e dodici m/s. Dodici tacche di differenza per sei m/s danno g=2 s/m; il primo riferimento lascia c=1. Togliamo l’offset dalla lettura diciassette e dividiamo per g: otteniamo V=8 m/s. Da questa velocità togliamo il contributo fisico di quattro m/s.",
  r"g=\frac{25-13}{(12-6)\,\mathrm{m/s}}=2\,\mathrm{s/m}\qquad c=13-2\times6=1\qquad V=\frac{17-1}{2\,\mathrm{s/m}}=8\,\mathrm{m/s}\qquad v_0=V-at=(8-2\times2)\,\mathrm{m/s}=4\,\mathrm{m/s}",
  "Otto m/s si ferma alla velocità finale, non alla partenza. Due riusa il primo riferimento; tre e cinque non restituiscono T=17. Il controllo con v₀=4 m/s dà V=8 m/s e T=2·8+1=17, con componenti sempre positive.", "L’offset si elimina sottraendo le due letture di riferimento."),
 ("Un vincolo che ha unità di accelerazione", "Si sceglie una prova rettilinea in un riferimento inerziale: la durata totale è t>0 e la componente iniziale è v₀=(1 m/s²)t. Questo vincolo collega i dati scelti per la prova. Durante il moto l’accelerazione è costante a=+2 m/s². La componente finale è V=+6 m/s. Quanto dura la prova?", ["2 s", "4 s", "1 s", "3 s", "−2 s"],
  "Il coefficiente del vincolo è una accelerazione, così il prodotto con t è una velocità. Sostituiamo v₀ nella legge finale e sommiamo i due coefficienti con la stessa unità: uno più due dà tre m/s². Dividendo V per questo coefficiente ricaviamo una durata.",
  r"V=v_0+at\qquad V=(1\,\mathrm{m/s^2})t+(2\,\mathrm{m/s^2})t\qquad V=(3\,\mathrm{m/s^2})t\qquad t=\frac{6\,\mathrm{m/s}}{3\,\mathrm{m/s^2}}=2\,\mathrm s\qquad v_0=2\,\mathrm{m/s}",
  "Due secondi rispettano t>0 e ricostruiscono 2+2·2=6 m/s. Quattro, uno e tre secondi darebbero finali 12,3,9 m/s. −2 s è una durata esclusa. Il vincolo non dice che la velocità iniziale cambi mentre la prova si svolge: seleziona una coppia di dati prima di iniziare.", "Sostituisci il vincolo conservando l’unità del coefficiente uno.")
]
CHOICES = {2:3,3:1,4:2,7:3,8:2,9:1,10:3,12:2,15:3,16:0}


def assemble(repo, source_ref):
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,'packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json'))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/accelerated-final-velocity.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-accelerated-final-speed-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':'1' if n in (11,13) else 's' if n==6 else 'm/s','tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Cinematica rettilinea','order':2300+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L004','prerequisites':['C1-L001','C1-L002','C1-L003','C1-L004'],'reuse':['C6'],
            'family':'constant-acceleration-final-velocity','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Controlla componente iniziale, incremento a·t e durata non negativa.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L004'},
            'coverage':['Moto uniformemente accelerato','Grafici cinematici'],'review':'Candidato autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
        assets={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio numerico in tre tappe e a scala fissa: v₀=2 m/s; incremento di 2 m/s in ciascun secondo con a costante; lettura finale V=6 m/s a t=2 s. Il grafico v–t è una retta perché qui l’accelerazione è costante.'})
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
    (args.destination/'accelerated-final-speed-014.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'accelerated-final-speed-014-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
