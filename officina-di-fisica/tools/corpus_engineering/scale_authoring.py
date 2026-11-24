"""Sixteen individually authored revisions: powers of ten, SI prefixes and calibration."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, formula, law_steps


# Tuple fields: title, statement, answer/options, explanation, exact steps, interpretation, first hint.
TASKS = [
 ("Leggere una potenza di dieci", "Un rapporto senza unità è scritto R=a·10ⁿ. Sono dati a=2 e n=1. Qual è il valore di R?", 20,
  "L’esponente uno indica un solo fattore dieci: 10¹=10. Il coefficiente due moltiplica questo fattore. Non bisogna sommare il coefficiente all’esponente né elevare due alla prima per ignorare la base dieci.",
  r"10^1=10\qquad R=2\times10=20",
  "Il risultato è un numero puro perché anche R lo è. Il controllo inverso 20/10=2 restituisce il coefficiente assegnato. In un rapporto fra misure omogenee le unità si cancellano, ma il rapporto può essere maggiore di uno.",
  "Scrivi 10¹ come un solo fattore dieci."),
 ("Le unità si cancellano nel rapporto", "Un rapporto R confronta due durate: R=t₁/t₂, con t₂>0 e le due durate espresse in secondi. Quale unità è dimensionalmente compatibile con R?", ["s", "s²", "1", "m/s", "Hz"],
  "Un rapporto conserva una dimensione soltanto se le grandezze confrontate hanno dimensioni diverse. Qui al numeratore e al denominatore troviamo due tempi, entrambi in secondi. La divisione cancella le unità, lasciando un numero di volte.",
  r"[R]=\frac{[t_1]}{[t_2]}=\frac{T}{T}=1",
  "La risposta è 1, simbolo dell’unità uno. Secondi descriverebbero una durata, hertz l’inverso di una durata. Nessuna delle due grandezze coincide con il rapporto richiesto.",
  "Scrivi prima le unità della frazione t₁/t₂."),
 ("Confrontare due tempi molto piccoli", "Due durate valgono t₁=4×10⁻³ s e t₂=2×10⁻⁴ s. Quanto vale t₁/t₂? Puoi lasciare le potenze di dieci senza trasformarle in numeri decimali.", ["1/2", "2", "20", "1/20", "200"],
  "Conviene dividere separatamente i coefficienti e le potenze della stessa base. Quattro diviso due dà due; per le potenze si sottrae l’esponente del denominatore. La sottrazione di un numero negativo è un’addizione: −3−(−4)=1.",
  r"\frac{t_1}{t_2}=\frac42\,10^{-3-(-4)}\qquad\frac42\,10^1=2\times10=20",
  "Il primo tempo è venti volte il secondo. Per controllare senza esponenti, riscriviamo 4×10⁻³ s come 40×10⁻⁴ s: i due tempi sono quaranta e due volte la stessa unità di tempo. Il rapporto 40/2 conferma venti.",
  "Porta i due tempi alla stessa potenza di dieci, oppure sottrai gli esponenti."),
 ("Cambiare soltanto il coefficiente", "Un rapporto è scritto R=a·10ⁿ. n resta uguale a 1 e a passa da 2 a 4. Come cambia R?", ["Raddoppia", "Aumenta di dieci volte", "Si dimezza", "Resta invariato", "Quadruplica"],
  "La potenza di dieci è identica nelle due scritture, quindi non produce alcun fattore di cambiamento. Il coefficiente passa invece da due a quattro: raddoppia. Possiamo verificare sia confrontando i due valori sia semplificando il fattore comune.",
  r"R_1=2\times10=20\qquad R_2=4\times10=40\qquad\frac{R_2}{R_1}=\frac{40}{20}=2",
  "R raddoppia. Il fattore dieci della notazione era già presente anche prima: moltiplicarlo ancora significherebbe cambiare l’esponente, contrariamente al testo.",
  "Elimina il fattore 10¹, comune ai due valori."),
 ("Ricavare il coefficiente", "La scrittura R=a·10ⁿ ha valore R=20 e n=1. Quanto vale il coefficiente a?", 2,
  "L’incognita è moltiplicata per una potenza già conosciuta. Dividiamo entrambi i membri per 10¹=10. Questa operazione è sempre lecita perché una potenza di dieci è positiva e non può essere zero.",
  r"20=a\times10\qquad\frac{20}{10}=a\qquad a=2",
  "Rimettendo il coefficiente nella scrittura iniziale troviamo 2·10=20. Il valore 2 appartiene anche all’intervallo 1≤a<10 della notazione scientifica normalizzata. Durante passaggi intermedi si possono usare altri coefficienti, purché se ne conservi il valore complessivo.",
  "Per isolare a, dividi per la potenza di dieci assegnata."),
 ("Riconoscere l’esponente senza logaritmi", "Un rapporto vale R=20 ed è scritto R=2·10ⁿ, con n intero. Quanto vale n?", 1,
  "Prima isoliamo la potenza: dividere venti per due dà dieci. La domanda è ora quale esponente della base dieci produce esattamente dieci. Basta riconoscere la potenza, senza calcolare logaritmi.",
  r"\frac{20}{2}=10^n\qquad10=10^n\qquad n=1",
  "La funzione 10ⁿ cresce al crescere di n, quindi questa soluzione è unica. n è un esponente adimensionale, non un tempo o una lunghezza. La sostituzione 2·10¹=20 ricostruisce il dato.",
  "Trova prima 20/2; poi confronta il risultato con 10⁰, 10¹ e 10²."),
 ("Dai pascal ai nanopascal", "Una differenza di pressione è 4×10⁻⁸ Pa. Si fornisce 1 nPa=10⁻⁹ Pa. Qual è la stessa differenza di pressione in nanopascal?", ["4", "0,4", "40", "400", "4×10⁻¹⁷"],
  "Un nanopascal è un’unità più piccola del pascal: ne occorrono molte per descrivere la stessa pressione. Per trovare quante unità nPa sono contenute nel valore dato, dividiamo per il valore in pascal di un solo nanopascal. I pascal si cancellano nel conteggio.",
  r"N=\frac{4\times10^{-8}\,\mathrm{Pa}}{10^{-9}\,\mathrm{Pa}}\qquad N=4\times10^{-8-(-9)}=4\times10=40",
  "La pressione vale 40 nPa. Riconvertendo, 40·10⁻⁹ Pa=4·10⁻⁸ Pa. Moltiplicare invece per 10⁻⁹ ridurrebbe ancora il numero, usando la conversione nel verso sbagliato.",
  "Dividi la pressione per il valore, in pascal, di un solo nanopascal."),
 ("Ordine di grandezza con soglia dichiarata", "Una lunghezza vale 3×10⁵ m. In questo quesito l’ordine di grandezza è la potenza di dieci più vicina sulla scala logaritmica: la soglia fra 10⁵ m e 10⁶ m è √10×10⁵ m. Qual è l’ordine di grandezza? Confronta 3 e √10 senza approssimazioni decimali.", ["10³ m", "10⁴ m", "10⁵ m", "10⁶ m", "10⁷ m"],
  "La convenzione è parte della domanda: non basta leggere l’esponente scritto. Dobbiamo decidere se il coefficiente tre precede o supera la soglia √10. Entrambi sono positivi, perciò possiamo confrontarne i quadrati senza invertire l’ordine. Poiché 3²=9<10, tre è minore di √10.",
  r"3^2=9<10=(\sqrt{10})^2\qquad3<\sqrt{10}\qquad L_{\rm ordine}=10^5\,\mathrm m",
  "La lunghezza si trova sotto la soglia e si associa a 10⁵ m. Con questa stessa convenzione un coefficiente quattro darebbe invece 10⁶ m, perché 4²=16>10. Il criterio evita qualsiasi valore decimale di √10 o dei logaritmi.",
  "Per due numeri positivi, il confronto fra i quadrati conserva l’ordine."),
 ("L’inversa della scrittura scientifica", "È data R=a·10ⁿ, con R>0 e n intero noto. Quale formula isola il coefficiente a?", ["a=R·10ⁿ", "a=R/10ⁿ", "a=10ⁿ/R", "a=R−10ⁿ", "a=R/n"],
  "a moltiplica l’intero fattore 10ⁿ. Per lasciarlo solo dividiamo entrambi i membri per lo stesso fattore. La potenza di dieci non può annullarsi, anche se n fosse zero o negativo.",
  r"\frac{R}{10^n}=\frac{a\,10^n}{10^n}=a",
  "L’inversa è a=R/10ⁿ. La verifica simbolica consiste nel sostituirla nella relazione iniziale: (R/10ⁿ)10ⁿ=R. Dividere per n scambierebbe il valore dell’esponente con quello dell’intera potenza.",
  "L’operazione da invertire è la moltiplicazione per 10ⁿ, non per n."),
 ("Cambiare coefficiente ed esponente", "Si usa R=a·10ⁿ, con a>0 e n intero positivo; durante i passaggi a non deve essere normalizzato. Nel secondo stato a₂=κ₁a₁ e n₂=κ₂n₁, con κ₁,κ₂>0 e n₂ ancora intero. Qual è R₂/R₁?", ["κ₁κ₂", "κ₁·10^(κ₂−1)", "κ₁·10^[n₁(κ₂−1)]", "κ₁·10^(κ₂n₁)", "10^[n₁(κ₂−1)]/κ₁"],
  "La variazione dell’esponente agisce dentro la potenza. Scriviamo l’uscita di ciascuno stato, poi dividiamo. Il coefficiente a₁ si semplifica; nel quoziente di potenze della stessa base sottraiamo l’esponente iniziale a quello finale. Non è lecito sostituire questo quoziente con κ₂.",
  r"\frac{R_2}{R_1}=\frac{\kappa_1a_1\,10^{\kappa_2n_1}}{a_1\,10^{n_1}}\qquad\frac{R_2}{R_1}=\kappa_1\,10^{\kappa_2n_1-n_1}\qquad\frac{R_2}{R_1}=\kappa_1\,10^{n_1(\kappa_2-1)}",
  "Se κ₂=1 l’esponente non cambia e il rapporto si riduce a κ₁. Se κ₁=1,n₁=1,κ₂=2 il rapporto è dieci: portare l’esponente da uno a due moltiplica il valore per dieci, non per due.",
  "Scrivi due potenze e usa 10ᵘ/10ᵛ=10^(u−v)."),
 ("Due cambiamenti con pesi diversi", "R=a·10ⁿ. Si passa da a₁=2,n₁=1 ad a₂=4,n₂=2. Quanto vale R₂/R₁?", 20,
  "Il coefficiente raddoppia e fornisce un fattore due. L’esponente aumenta di un’unità, quindi la potenza di dieci fornisce un fattore dieci. I due contributi si moltiplicano. Non stiamo raddoppiando due fattori entrambi lineari.",
  r"\frac{R_2}{R_1}=\frac42\,10^{2-1}\qquad\frac{R_2}{R_1}=2\times10=20",
  "La verifica diretta usa R₁=20 e R₂=400: 400/20=20. In questo caso raddoppiare l’esponente da uno a due comporta un aumento di dieci volte della potenza; con altri esponenti iniziali il fattore sarebbe diverso.",
  "Tratta separatamente il rapporto 4/2 e il rapporto 10²/10¹."),
 ("Mediare dopo avere letto i numeri", "Due rapporti adimensionali, con uguale peso statistico, sono R₁=2×10¹ e R₂=4×10². Qual è la loro media aritmetica?", ["105", "210", "420", "30", "300"],
  "Prima riconosciamo i valori completi: venti e quattrocento. Per la media sommiamo questi valori e dividiamo per due. È comodo dividere ogni addendo per due, così la somma finale resta piccola.",
  r"\overline R=\frac{20+400}{2}\qquad\overline R=\frac{20}{2}+\frac{400}{2}=10+200=210",
  "La media è compresa fra venti e quattrocento. Mediare coefficienti ed esponenti separatamente non è un procedimento equivalente: l’esponente entra in una legge non lineare. La media aritmetica richiesta riguarda R, non la sua rappresentazione.",
  "Trova prima i due valori R₁ e R₂; non mediare gli esponenti."),
 ("Quanto deve cambiare l’esponente?", "All’inizio R₁=2·10¹. Poi il coefficiente diventa 4 e si vuole R₂=20R₁, mantenendo R₂=4·10^(n₂) e n₂ intero positivo. Quale rapporto n₂/n₁ serve? Qui n₁=1 e il pedice 2 identifica il secondo esponente.", 2,
  "Il fattore venti richiesto si divide in un fattore due, già fornito dal raddoppio del coefficiente, e un fattore dieci, che deve arrivare dalla potenza. Per moltiplicare una potenza di dieci per dieci si aggiunge uno all’esponente. n₂ deve quindi passare da uno a due.",
  r"20=\frac42\,10^{n_2-1}\qquad10=10^{n_2-1}\qquad n_2-1=1\qquad n_2=2\qquad\frac{n_2}{n_1}=2",
  "Il rapporto richiesto è due. È però l’aumento additivo dell’esponente, da uno a due, a produrre il fattore dieci: non esiste una proporzionalità diretta generale fra R ed n. Il controllo è 4·10²=400=20·20.",
  "Dopo aver tolto il raddoppio del coefficiente, resta un fattore dieci."),
 ("Taratura senza offset", "Un display indica S=gR, con g>0 costante e offset nullo. R è scritto a·10ⁿ. Il riferimento a=2,n=1 dà S=60. Nella nuova prova il display indica 1200 e n=2. Quanto vale a? Le letture S usano la stessa unità strumentale.", 4,
  "Nel riferimento R vale venti; per ottenere sessanta il display lo moltiplica per tre. Nella prova ignota dividiamo la lettura per tre e otteniamo quattrocento. Poiché n=2, il coefficiente si ricava dividendo per cento.",
  r"g=\frac{60}{20}=3\qquad R=\frac{1200}{3}=400\qquad a=\frac{400}{10^2}=4",
  "Per il controllo ricostruiamo tutta la catena: a=4 e n=2 danno R=400; il display indica 3·400=1200. L’assenza di offset è essenziale per ricavare il guadagno dal solo rapporto fra indicazione e riferimento.",
  "Calcola il valore del riferimento prima di confrontarlo con la lettura del display."),
 ("Taratura con due riferimenti", "Il display segue S=gR+b e R=a·10ⁿ. Due riferimenti danno (a=2,n=1,S=41) e (a=4,n=2,S=801). Nella prova ignota n=1 e S=81. g e b sono costanti. Quanto vale a?", ["2", "3", "4", "8", "5"],
  "I riferimenti valgono R₁=20 e R₂=400. Sottraendo le due letture si elimina b: 801−41=760 e 400−20=380. Il rapporto 760/380 è due, quindi g=2. Dal primo riferimento 41=2·20+b ricaviamo b=1. Per la lettura ignota togliamo l’offset prima di dividere per il guadagno.",
  r"g=\frac{760}{380}=2\qquad b=41-2\times20=1\qquad R=\frac{81-1}{2}=40\qquad a=\frac{40}{10}=4",
  "La catena inversa restituisce S=2·(4·10)+1=81. Il semplice rapporto 81/41 non darebbe il rapporto fra i valori veri, perché l’offset additivo è presente in entrambe le letture.",
  "Sottrai i due riferimenti per eliminare b."),
 ("Un esponente sotto un quadrato", "Un rapporto senza unità è R=(4·10ⁿ)²/[2·10^(n+3)], con n intero positivo. Se R=8·10⁴, quanto vale n? Il quadrato riguarda tutto il prodotto al numeratore; al denominatore l’esponente è n+3.", ["1", "4", "5", "7", "11"],
  "Il quadrato agisce sia sul coefficiente sia sulla potenza: 4²=16 e (10ⁿ)²=10^(2n). Dividiamo i coefficienti, ottenendo otto, e sottraiamo l’intero esponente del denominatore. Le parentesi servono a distribuire correttamente il segno meno: 2n−(n+3)=n−3.",
  r"R=\frac{16\,10^{2n}}{2\,10^{n+3}}\qquad R=8\,10^{2n-(n+3)}\qquad R=8\,10^{n-3}\qquad10^{n-3}=10^4\qquad n-3=4\qquad n=7",
  "Le potenze della stessa base positiva, diversa da uno, sono uguali soltanto con esponenti uguali. Per controllare n=7, il numeratore vale 16·10¹⁴ e il denominatore 2·10¹⁰: il loro rapporto è proprio 8·10⁴. Non serve scrivere i numeri completi.",
  "Applica il quadrato a entrambi i fattori del numeratore e conserva le parentesi n+3.")
]
CHOICES = {2:2, 3:2, 4:0, 7:2, 8:2, 9:1, 10:2, 12:1, 15:2, 16:3}


def assemble(repo, source_ref):
    source_path = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json"
    sources = {r["id"]: r for r in json.loads(git_bytes(repo, source_ref, source_path))}
    file = Path(__file__).resolve().parents[2]/"editorial/assets/scale-time-ratio.svg"
    raw = file.read_bytes()
    asset = {"id":sha(raw),"name":file.name,"mime":"image/svg+xml","data":base64.b64encode(raw).decode()}
    records, bindings = [], []
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f"u1-scientific-scale-{n:02}"
        a={"type":"choice","options":answer,"value":answer[CHOICES[n]]} if isinstance(answer,list) else {"type":"numeric","value":answer,"unit":"1","tolerance":0}
        family={3:"ratio-of-times",7:"pressure-nano-prefix",8:"logarithmic-order-of-magnitude",16:"nested-powers-exponent"}.get(n,"scientific-scale")
        row={"id":"AR-"+source_id,"kind":"question","course":"C1","section":"Misura e rappresentazione",
             "order":2040+n,"title":title,"version":1,"baseVersion":0,"skill":"C1-L001","prerequisites":["C1-L001"],
             "reuse":["C6"],"family":family,"difficulty":1 if n<=4 else 2 if n<=12 else 3,
             "prompt":prompt,"answer":a,"blocks":[text(before),*law_steps(law),text(after)],
             "hints":[hint,"Verifica il risultato ricomponendo il dato iniziale."],
             "error":{"category":{2:"unità",4:"concetto",7:"unità",8:"concetto"}.get(n,"algebra"),"message":after,"target":"C1-L001"},
             "coverage":["Notazione scientifica","Potenze e rapporti"],
             "review":"Revisione AI con evidenze individuali; approvazione umana NOT_RUN; DRAFT"}
        assets={}
        if n==3:
            row["blocks"].insert(1,{"type":"figure","src":"/asset/"+asset["id"],
                "text":"Leggi dall’alto verso il basso: esprimi i due tempi nella stessa unità 10⁻⁴ s, poi conta 40 unità e 2 unità. Ogni cella grande del confronto finale vale il tempo più breve: ne servono 20 per il più lungo."})
            assets[file.name]=asset["id"]
        records.append(row)
        bindings.append({"id":row["id"],"sourceId":source_id,"sourceSha256":digest(sources[source_id]),
                         "candidateSha256":digest(row),"assetChecksums":assets,"sourceRef":source_ref})
    return {"schema":"astra/1","records":records,"assets":[asset]},bindings


if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument("--repo",type=Path,required=True);p.add_argument("--source-ref",required=True);p.add_argument("--destination",type=Path,required=True)
    args=p.parse_args();pkg,bindings=assemble(args.repo,args.source_ref);args.destination.mkdir(parents=True,exist_ok=True)
    (args.destination/"scale-002.json").write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+"\n")
    (args.destination/"scale-002-bindings.json").write_text(canonical(bindings)+"\n")
    print(canonical({"questions":len(pkg["records"]),"status":"DRAFT"}))
