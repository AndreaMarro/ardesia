"""Author rest-start displacement candidates with quadratic-time domains explicit."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


TASKS = [
 ("Lo spostamento di una partenza da fermo", "In un riferimento inerziale un carrello parte da fermo da x₀=0 lungo un asse orientato. Mantiene accelerazione costante a=+2 m/s² per t=2 s. Quanto vale lo spostamento D=x(t)−x₀, in metri?", 4,
  "La velocità iniziale è nulla e cresce linearmente fino ad at=4 m/s. Nel grafico v–t lo spostamento è l’area del triangolo di base due secondi e altezza quattro m/s: metà del rettangolo corrispondente. È la stessa relazione D=at²/2 della legge oraria.",
  r"D=v_0t+\frac12at^2\qquad v_0=0\qquad D=\frac12(2\,\mathrm{m/s^2})(2\,\mathrm s)^2\qquad D=\frac{2\times4}{2}\,\mathrm m=4\,\mathrm m",
  "Il quadrato riguarda la durata completa, comprese le unità s². La velocità non diventa negativa, quindi qui anche la distanza percorsa vale 4 m. Otto metri sarebbe l’area del rettangolo costruito con la velocità finale, come se fosse stata mantenuta fin dall’inizio.", "Nel grafico v–t usa il triangolo, perché il carrello parte da fermo."),
 ("Le unità del tempo al quadrato", "Un carrello parte da fermo e mantiene accelerazione costante a lungo una retta per una durata t. La legge dello spostamento è D=at²/2. Quale unità SI è adatta a D?", ["m/s", "m/s²", "s", "m", "m²"],
  "Il fattore 1/2 è adimensionale. L’accelerazione porta m/s² e la durata al quadrato porta s²: i secondi si cancellano completamente e resta una lunghezza. Elevare al quadrato il tempo significa elevare al quadrato anche la sua unità.",
  r"[D]=(L/T^2)T^2=L\qquad (\mathrm{m/s^2})\mathrm{s^2}=\mathrm m",
  "m è corretto. m/s resta se si dimentica un fattore tempo; m/s² è l’unità dell’accelerazione prima del prodotto. s è una durata e m² sarebbe un’area. La divisione per due cambia il numero, non la dimensione.", "Scrivi s² come unità di t² prima delle semplificazioni."),
 ("Il secondo secondo è un intervallo nuovo", "In un riferimento inerziale un corpo parte da fermo all’istante t=0 e mantiene accelerazione costante positiva lungo una retta. Nel primo secondo percorre 1 m. Quanti metri percorre nel solo intervallo da t=1 s a t=2 s?", ["8 m", "3 m", "1 m", "2 m", "4 m"],
  "Da fermo con accelerazione costante lo spostamento dall’inizio cresce come t². Se a un secondo vale un metro, a due secondi vale quattro metri perché il rapporto dei tempi è due e il suo quadrato è quattro. Il secondo intervallo comprende solo ciò che si aggiunge dopo il primo metro.",
  r"D(t)=\frac12at^2\qquad \frac{D(2\,\mathrm s)}{D(1\,\mathrm s)}=\left(\frac21\right)^2=4\qquad D(2\,\mathrm s)=4\,\mathrm m\qquad \Delta D_{1\to2}=(4-1)\,\mathrm m=3\,\mathrm m",
  "Quattro metri sono il totale nei primi due secondi, non il solo secondo secondo. Un metro imporrebbe percorrenze uguali nonostante la velocità cresca; due moltiplicherebbe per il tempo senza quadrato. Otto non segue dalla legge e supera persino il totale di quattro. Con a>0 e partenza da fermo non vi sono ritorni: qui differenza degli spostamenti e distanza dell’intervallo coincidono.", "Calcola il totale a due secondi e togli il metro già percorso."),
 ("Cambiare solo l’accelerazione", "In due prove rettilinee nello stesso riferimento inerziale un carrello parte da fermo e accelera costantemente nel verso positivo per t=2 s. L’accelerazione passa da a₁=2 m/s² ad a₂=4 m/s². Come cambia lo spostamento D dal punto di partenza?", ["Resta 4 m", "Si dimezza a 2 m", "Raddoppia da 4 m a 8 m", "Quadruplica da 4 m a 16 m", "Diventa zero"],
  "La durata e il suo quadrato sono uguali nelle due prove. Nella relazione D=at²/2 l’accelerazione compare alla prima potenza: raddoppiarla raddoppia lo spostamento. Il quadrato del tempo non deve essere attribuito anche ad a.",
  r"D_1=\frac{2\times2^2}{2}\,\mathrm m=4\,\mathrm m\qquad D_2=\frac{4\times2^2}{2}\,\mathrm m=8\,\mathrm m\qquad \frac{D_2}{D_1}=2",
  "Il fattore quattro si avrebbe raddoppiando soltanto la durata, non soltanto l’accelerazione. Le risposte invariata, dimezzata o nulla contraddicono la proporzionalità diretta con a positiva. Entrambe le velocità restano non negative e D è anche la distanza percorsa.", "Tieni fisso t²/2 e confronta i due valori di a."),
 ("Ricavare l’accelerazione dallo spostamento", "In un riferimento inerziale un carrello parte da fermo e mantiene accelerazione costante a>0 lungo il verso positivo di un asse. In t=2 s lo spostamento dal punto iniziale è D=4 m. Quanto vale a, in m/s²?", 2,
  "L’incognita a moltiplica t²/2. Moltiplichiamo D=at²/2 per due e dividiamo per t², che non è nullo perché t=2 s. L’inversa non richiede radici: il quadrato è sulla durata nota, non sull’accelerazione cercata.",
  r"2D=at^2\qquad a=\frac{2D}{t^2}\qquad a=\frac{2(4\,\mathrm m)}{(2\,\mathrm s)^2}=\frac84\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}",
  "La sostituzione (1/2)(2 m/s²)(2 s)²=4 m restituisce lo spostamento. Dividere D per t darebbe 2 m/s, una velocità media, e non l’accelerazione. Le unità distinguono questi risultati anche quando il numero è lo stesso.", "Isola a moltiplicando per due e dividendo per il quadrato della durata."),
 ("La radice sceglie una durata futura", "In un riferimento inerziale un carrello parte da fermo e mantiene accelerazione costante a=+2 m/s² lungo un asse. Raggiunge lo spostamento D=4 m dal punto iniziale dopo una durata t≥0. Quanto vale t, in secondi?", 2,
  "Questa volta l’incognita è il tempo al quadrato. Moltiplichiamo per due, dividiamo per a e prendiamo la radice non negativa. Il rapporto 2D/a ha unità s² e vale quattro s², il cui valore positivo ha radice due secondi.",
  r"D=\frac12at^2\qquad t^2=\frac{2D}{a}\qquad t^2=\frac{2(4\,\mathrm m)}{2\,\mathrm{m/s^2}}=4\,\mathrm{s^2}\qquad t=\sqrt4\,\mathrm s=2\,\mathrm s",
  "L’altra radice algebrica, −2 s, è esclusa per una durata dopo la partenza. Poiché a>0, D cresce strettamente per t>0 e il risultato è unico. Con D=0 si avrebbe t=0; uno spostamento negativo sarebbe incompatibile con questa partenza e accelerazione.", "Semplifica prima 2D/a; poi fai la radice della durata al quadrato."),
 ("Raddoppiare il tempo da fermo", "Due prove rettilinee nello stesso riferimento inerziale partono da fermo e mantengono a=+2 m/s² costante. La prima dura t₁=2 s, la seconda t₂=4 s. D₁,D₂ sono gli spostamenti dal rispettivo punto di partenza. Quanto vale D₂/D₁?", ["2", "5", "3", "4", "8"],
  "Il coefficiente a/2 resta invariato. Nel rapporto si cancella e rimane il quadrato del rapporto fra durate. Quattro secondi sono il doppio di due: lo spostamento diventa quattro volte maggiore. Un controllo diretto produce quattro e sedici metri.",
  r"D_1=\frac{2\times2^2}{2}\,\mathrm m=4\,\mathrm m\qquad D_2=\frac{2\times4^2}{2}\,\mathrm m=16\,\mathrm m\qquad \frac{D_2}{D_1}=\frac{16}{4}=4",
  "Due descrive il rapporto dei tempi o delle velocità finali, non degli spostamenti. Otto richiederebbe anche il raddoppio dell’accelerazione. Tre è l’aumento relativo (16−4)/4; cinque non deriva dal confronto richiesto. Il rapporto è puro.", "Il fattore di tempo entra due volte nella legge dello spostamento."),
 ("La curva della posizione", "In un riferimento inerziale un punto parte da x₀=0 con v₀=0 all’istante t=0. Mantiene accelerazione costante a=+4 m/s² lungo l’asse x. Quale forma ha il grafico di x in funzione del tempo t≥0, con t orizzontale e x verticale?", ["Retta crescente con pendenza costante", "Retta orizzontale in x=0", "Parabola con concavità verso l’alto e tangente orizzontale all’origine", "Parabola con concavità verso il basso", "Iperbole decrescente"],
  "La legge oraria contiene t² con coefficiente positivo. La posizione parte da zero e la pendenza iniziale, che è la velocità, è nulla. Poi la pendenza cresce: a un secondo la posizione è due metri, a due secondi otto. Il corpo percorre quindi due metri nel primo secondo e sei nel successivo.",
  r"x(t)=\frac12at^2=(2\,\mathrm{m/s^2})t^2\qquad v(t)=at\qquad v(0)=0\qquad x(1\,\mathrm s)=2\,\mathrm m\qquad x(2\,\mathrm s)=8\,\mathrm m",
  "La retta crescente descriverebbe velocità costante e la retta orizzontale una sosta. La concavità verso il basso richiederebbe accelerazione negativa; l’iperbole non rispetta né la legge né il punto iniziale. Il grafico curvo rappresenta la posizione nel tempo: il moto fisico resta su una retta.", "Leggi cosa rappresentano gli assi prima di scegliere la forma della linea."),
 ("L’inversa senza una radice superflua", "In un riferimento inerziale un carrello parte da fermo lungo un asse, mantiene accelerazione costante a>0 e dopo una durata t>0 ha spostamento D>0. Quale formula ricava a dalla legge D=at²/2?", ["a=D/t²", "a=2D/t²", "a=2D/t", "a=√(2D/t²)", "a=Dt²/2"],
  "a è alla prima potenza: moltiplicando entrambi i membri per due e dividendo per t² rimane isolata. t>0 garantisce che il denominatore sia diverso da zero. La positività di D rende positivo il risultato, coerente con il verso scelto.",
  r"D=\frac{at^2}{2}\qquad 2D=at^2\qquad \frac{2D}{t^2}=a",
  "D/t² perde il fattore due; 2D/t ha dimensione di velocità. La radice cambierebbe sia il numero sia la dimensione e non inverte una potenza di a, che non c’è. Dt²/2 moltiplica il fattore che dovrebbe rimuovere. Sostituire a=2D/t² nella legge restituisce D.", "Il tempo è al quadrato, l’incognita a no."),
 ("Un fattore semplice e uno quadratico", "Due prove rettilinee nello stesso riferimento inerziale partono da fermo. Nella prima l’accelerazione costante è a>0 e la durata t>0; nella seconda sono κ₁a e κ₂t con κ₁,κ₂>0, sempre costanti e positive. D₁,D₂ sono gli spostamenti dal punto iniziale. Quale rapporto D₂/D₁ segue?", ["κ₁κ₂", "κ₁²κ₂", "κ₁κ₂²", "κ₁/κ₂²", "2κ₁κ₂²"],
  "Inseriamo nella legge sia la nuova accelerazione sia la nuova durata. Il fattore sulla durata viene elevato al quadrato insieme a t; quello sull’accelerazione compare una volta. Nel rapporto si cancellano a, t² e il comune fattore un mezzo.",
  r"D_1=\frac12at^2\qquad D_2=\frac12(\kappa_1a)(\kappa_2t)^2\qquad D_2=\kappa_1\kappa_2^2D_1\qquad \frac{D_2}{D_1}=\kappa_1\kappa_2^2",
  "κ₁κ₂ dimentica il quadrato del tempo; κ₁²κ₂ lo sposta sull’ingresso sbagliato. Il rapporto inverso sul tempo descriverebbe una legge diversa, e il fattore due aggiunto non si cancella correttamente. Senza cambiamenti κ₁=κ₂=1 la formula deve dare uno.", "Applica il quadrato anche al fattore κ₂ dentro la parentesi."),
 ("Cambiano accelerazione e durata", "Due prove rettilinee nello stesso riferimento inerziale partono da fermo nel verso positivo dell’asse. La prima ha accelerazione costante a₁=2 m/s² e durata t₁=2 s; la seconda a₂=4 m/s² e t₂=4 s. D₁,D₂ sono gli spostamenti dal rispettivo punto iniziale. Quanto vale D₂/D₁?", 8,
  "L’accelerazione raddoppia e fornisce un fattore due. La durata raddoppia e il suo quadrato fornisce un fattore quattro. I contributi si moltiplicano: due per quattro è otto. Possiamo controllare calcolando entrambi gli spostamenti.",
  r"D_1=\frac{2\times2^2}{2}\,\mathrm m=4\,\mathrm m\qquad D_2=\frac{4\times4^2}{2}\,\mathrm m=32\,\mathrm m\qquad \frac{D_2}{D_1}=\frac{32}{4}=8",
  "Il risultato quattro tratterebbe il tempo alla prima potenza, due terrebbe conto soltanto dell’accelerazione. Trentadue è lo spostamento della seconda prova in metri, non il rapporto richiesto. Entrambe le prove hanno velocità non negative e non richiedono correzioni per inversioni.", "Combina il fattore due dell’accelerazione con il quattro del tempo al quadrato."),
 ("La media delle percorrenze", "Due prove rettilinee nello stesso riferimento inerziale partono da fermo con accelerazioni costanti positive. La prima ha a=2 m/s²,t=2 s; la seconda a=4 m/s²,t=4 s. Qual è la media aritmetica, con uguale peso, degli spostamenti D dal punto di partenza?", ["17 m", "18 m", "36 m", "9 m", "19 m"],
  "La prima prova dà D₁=4 m, la seconda D₂=32 m. Diamo metà peso a ciascuna: si può fare il conto mentale dimezzando prima i due contributi, due metri più sedici metri. Non inseriamo nella legge le medie degli ingressi.",
  r"D_1=4\,\mathrm m\qquad D_2=32\,\mathrm m\qquad \overline D=\frac{4+32}{2}\,\mathrm m=(2+16)\,\mathrm m=18\,\mathrm m",
  "Trentasei è la somma senza divisione e nove dimezza due volte. Diciassette e diciannove sono scarti di un metro senza giustificazione. Usando invece a medio 3 m/s² e tempo medio 3 s si otterrebbe 27/2 m: il quadrato del tempo impedisce di scambiare in generale media e legge.", "Fai la media dei due spostamenti già calcolati."),
 ("Progettare la durata con una radice", "Due prove rettilinee nello stesso riferimento inerziale partono da fermo nel verso positivo dell’asse. La prima ha accelerazione costante a₁=2 m/s²,durata t₁=2 s. Nella seconda a₂=4 m/s² è costante e si vuole D₂=8D₁, dove D è lo spostamento dal punto iniziale. Si richiede t₂≥0. Quanto vale t₂/t₁?", 2,
  "Il primo spostamento è quattro metri: l’obiettivo è trentadue. Dalla legge quadratica isoliamo t₂²=2D₂/a₂. Il rapporto numerico è 64/4=16 e l’unità è s². La radice non negativa è quattro secondi; rispetto ai due secondi iniziali il rapporto è due.",
  r"D_1=4\,\mathrm m\qquad D_2=32\,\mathrm m\qquad t_2^2=\frac{2D_2}{a_2}\qquad t_2^2=\frac{2(32\,\mathrm m)}{4\,\mathrm{m/s^2}}=16\,\mathrm{s^2}\qquad t_2=4\,\mathrm s\qquad \frac{t_2}{t_1}=2",
  "La radice −4 s è esclusa dal dominio di una durata futura. Verificando, (1/2)(4 m/s²)(4 s)²=32 m. Il fattore otto dell’uscita contiene già il raddoppio di a: il solo tempo deve dare un fattore quattro nello spostamento e quindi due nella durata.", "Calcola prima t₂², poi scegli la radice ammessa."),
 ("Tarare una misura di spostamento", "Nel medesimo riferimento inerziale ogni prova rettilinea parte da fermo e mantiene accelerazione costante a>0 nel verso positivo. D è lo spostamento dal punto iniziale. Un display conta tacche T=gD con g>0 costante e offset nullo. Per a=2 m/s²,t=2 s indica T=12. La prova ignota dura t=4 s e indica T=96. Quanto vale a, in m/s²?", 4,
  "Il riferimento percorre quattro metri, quindi il guadagno è tre per metro. La lettura novantasei corrisponde a trentadue metri. Solo dopo aver ricostruito lo spostamento usiamo l’inversa a=2D/t²: sessantaquattro diviso sedici vale quattro.",
  r"D_{\rm rif}=4\,\mathrm m\qquad g=\frac{12}{4\,\mathrm m}=3\,\mathrm{m^{-1}}\qquad D=\frac{96}{3\,\mathrm{m^{-1}}}=32\,\mathrm m\qquad a=\frac{2D}{t^2}=\frac{2(32\,\mathrm m)}{(4\,\mathrm s)^2}=4\,\mathrm{m/s^2}",
  "La ricostruzione del display è T=3 m⁻¹·[(1/2)(4 m/s²)(4 s)²]=96. Confondere tacche e metri darebbe un’accelerazione tre volte maggiore. La nuova accelerazione è positiva e costante per tutta la prova, come richiesto dal modello.", "Converti le tacche in metri prima di dividere per t²."),
 ("Due riferimenti per la legge quadratica", "Nel medesimo riferimento inerziale ogni prova rettilinea parte da fermo e mantiene accelerazione costante a>0 nel verso positivo. D è lo spostamento dal punto iniziale. Un display conta tacche T=gD+c, con g>0,c costanti. I riferimenti (a=2 m/s²,t=2 s) e (a=4 m/s²,t=4 s) danno T=9 e 65. La prova ignota ha t=2 s,T=17. Quanto vale a?", ["8 m/s²", "2 m/s²", "5 m/s²", "3 m/s²", "4 m/s²"],
  "Gli spostamenti dei riferimenti sono quattro e trentadue metri. Sottraendo le letture eliminiamo c: cinquantasei tacche per ventotto metri danno g=2 m⁻¹. Il primo riferimento lascia c=1. La nuova lettura, corretta per offset e guadagno, dà otto metri: da qui ricaviamo l’accelerazione.",
  r"g=\frac{65-9}{(32-4)\,\mathrm m}=2\,\mathrm{m^{-1}}\qquad c=9-2\times4=1\qquad D=\frac{17-1}{2\,\mathrm{m^{-1}}}=8\,\mathrm m\qquad a=\frac{2D}{t^2}=\frac{2(8\,\mathrm m)}{(2\,\mathrm s)^2}=4\,\mathrm{m/s^2}",
  "Otto confonde il numero dello spostamento con l’accelerazione; due riusa il primo riferimento. Tre e cinque non ricostruiscono la lettura. Con a=4 m/s² e t=2 s si trova D=8 m e T=2·8+1=17. Un rapporto fra letture lascerebbe l’offset dentro la taratura.", "Ricava prima gli spostamenti dei riferimenti, poi il guadagno."),
 ("Un vincolo fra prove porta al cubo", "Si sceglie una prova rettilinea in un riferimento inerziale. Il corpo parte da fermo, la durata totale è t>0 e l’accelerazione scelta è a=(1 m/s³)t, mantenuta costante per tutta la prova nel verso positivo. Il vincolo lega i due dati prima della partenza; non descrive un’accelerazione variabile durante il moto. Lo spostamento finale D è 4 m. Quanto vale t?", ["1 s", "3 s", "−2 s", "2 s", "4 s"],
  "Chiamiamo k=1 m/s³ il coefficiente del vincolo. Sostituendo a=kt nella legge con accelerazione costante otteniamo D=kt³/2. Il cubo nasce dalla scelta di prove con a proporzionale alla loro durata totale. Isoliamo t³: 2D/k ha unità s³ e vale otto s³.",
  r"k=1\,\mathrm{m/s^3}\qquad D=\frac12at^2=\frac12kt^3\qquad t^3=\frac{2D}{k}=\frac{2(4\,\mathrm m)}{1\,\mathrm{m/s^3}}=8\,\mathrm{s^3}\qquad t=\sqrt[3]8\,\mathrm s=2\,\mathrm s\qquad a=2\,\mathrm{m/s^2}",
  "Il controllo usa una accelerazione costante di 2 m/s² per due secondi e restituisce quattro metri. Uno, tre e quattro secondi darebbero rispettivamente 1/2 m,27/2 m,32 m. −2 s viola t>0 e darebbe D negativo nell’equazione cubica. La relazione è crescente per t>0, quindi la soluzione ammessa è unica.", "Sostituisci il vincolo con il suo coefficiente in m/s³, poi isola t³.")
]
CHOICES = {2:3,3:1,4:2,7:3,8:2,9:1,10:2,12:1,15:4,16:3}


def assemble(repo, source_ref):
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,'packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json'))}
    assets={}
    for name in ('rest-accelerated-area.svg','rest-accelerated-parabola.svg'):
        file=Path(__file__).resolve().parents[2]/'editorial/assets'/name
        raw=file.read_bytes()
        assets[name]={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-rest-accelerated-distance-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':'1' if n in (11,13) else 's' if n==6 else 'm/s²' if n in (5,14) else 'm','tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Cinematica rettilinea','order':2320+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L004','prerequisites':['C1-L001','C1-L002','C1-L003','C1-L004'],'reuse':['C6'],
            'family':{3:'equal-time-accelerated-increments',8:'quadratic-position-time-graph'}.get(n,'rest-constant-acceleration-displacement'),
            'difficulty':1 if n<=4 else 2 if n<=12 else 3,'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Controlla partenza da fermo, accelerazione costante e dominio del tempo.'],
            'error':{'category':{2:'unità',3:'concetto',4:'concetto',7:'calcolo',8:'modello',10:'modello',12:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L004'},
            'coverage':['Moto uniformemente accelerato','Grafici cinematici'],'review':'Candidato autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
        checksums={}
        if n in (1,3,8):
            asset=assets['rest-accelerated-parabola.svg' if n==8 else 'rest-accelerated-area.svg']
            caption='Tre grafici x–t alla stessa scala per a=4 m/s²: origine e tangente iniziale orizzontale; punti (1 s,2 m) e (2 s,8 m); incrementi di 2 m e 6 m in intervalli uguali. La linea curva nel grafico non è una traiettoria curva.' if n==8 else 'Esempio da fermo con a=2 m/s². Tre tappe alla stessa scala nel grafico v–t: costruisci v=at; leggi il triangolo totale di area 4 m nei primi 2 s; confronta le aree di 1 m nel primo secondo e 3 m nel secondo.'
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':caption})
            checksums[asset['name']]=asset['id']
        records.append(row)
        bindings.append({'id':row['id'],'sourceId':source_id,'sourceSha256':digest(sources[source_id]),'candidateSha256':digest(row),'assetChecksums':checksums,'sourceRef':source_ref})
    return {'schema':'astra/1','records':records,'assets':list(assets.values())},bindings


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__)
    p.add_argument('--repo',type=Path,required=True)
    p.add_argument('--source-ref',required=True)
    p.add_argument('--destination',type=Path,required=True)
    args=p.parse_args()
    package,bindings=assemble(args.repo,args.source_ref)
    args.destination.mkdir(parents=True,exist_ok=True)
    (args.destination/'rest-accelerated-distance-015.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'rest-accelerated-distance-015-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
