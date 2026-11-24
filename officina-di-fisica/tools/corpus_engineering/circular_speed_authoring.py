"""Author circular-speed candidates with exact pi; independent review remains open."""
import base64
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


TASKS = [
 ("Un giro senza approssimare π", "In un riferimento inerziale un punto percorre una circonferenza fissa di raggio r=1 m con moto uniforme. Un giro dura T=π s. Quanto vale la rapidità tangenziale V, cioè il modulo della velocità, in m/s? Mantieni π esatto.", 2,
  "La distanza percorsa in un giro è la lunghezza della circonferenza, 2πr. Dividiamo questa lunghezza per il periodo. Poiché il moto è uniforme, il rapporto coincide con la rapidità in ogni istante. Il fattore π compare sia nella distanza sia nella durata e si può semplificare prima di fare qualsiasi conto decimale.",
  r"C=2\pi r=2\pi\,\mathrm m\qquad V=\frac CT=\frac{2\pi\,\mathrm m}{\pi\,\mathrm s}=2\,\mathrm{m/s}",
  "Il modulo è due metri al secondo; la velocità vettoriale è tangente alla circonferenza e cambia direzione. Su un giro completo lo spostamento netto è zero, quindi la velocità media vettoriale sarebbe zero: quel valore non risponde alla domanda sulla rapidità.", "Semplifica π nel rapporto fra circonferenza e periodo."),
 ("L’unità della rapidità lungo la circonferenza", "La rapidità tangenziale V in un moto circolare uniforme è la lunghezza di un giro divisa per il suo periodo positivo. Quale unità SI è compatibile con V?", ["m", "m/s²", "m/s", "s", "1"],
  "Il raggio e la circonferenza hanno dimensione di lunghezza. Il fattore 2π è puro e non cambia la dimensione. Il periodo è una durata: il rapporto conserva dunque lunghezza su tempo, anche se la traiettoria è curva.",
  r"[2\pi r]=L\qquad [T]=T\qquad [V]=L/T",
  "m/s è corretto. m è l’unità della lunghezza prima della divisione; s quella del periodo. m/s² descrive un’accelerazione, mentre 1 un numero puro. La parola «tangenziale» indica la direzione locale della velocità, non introduce un’unità diversa.", "Conta una lunghezza al numeratore e una durata al denominatore."),
 ("Quale distanza entra in un giro?", "In un riferimento inerziale un punto compie un moto circolare uniforme di raggio fisso r>0 e periodo T>0. V è la rapidità tangenziale. Quale relazione ricava V?", ["V=πr/T", "V=2πr/T", "V=2r/T", "V=2πrT", "V=0"],
  "In un periodo il punto percorre la circonferenza intera, non il diametro e non soltanto un semicerchio. La rapidità uniforme è la distanza percorsa divisa per il tempo necessario. Il periodo positivo garantisce che il denominatore non sia nullo.",
  r"C=2\pi r\qquad V=\frac CT\qquad V=\frac{2\pi r}{T}",
  "πr/T usa mezzo giro; 2r/T usa il diametro invece dell’arco percorso. Il prodotto 2πrT avrebbe dimensione lunghezza per tempo. Zero è la velocità media vettoriale sul giro chiuso, perché confronta i punti iniziale e finale: la rapidità è invece positiva.", "Il punto segue l’arco della circonferenza per tutto il giro."),
 ("Raggio doppio nello stesso periodo", "Due prove, ciascuna di moto circolare uniforme in un riferimento inerziale, hanno lo stesso periodo T=π s. Il raggio fisso passa da r₁=1 m a r₂=2 m fra le prove. V₁ e V₂ sono le rapidità tangenziali. Come cambiano?", ["V passa da 2 a 4 m/s", "V resta 2 m/s", "V passa da 2 a 8 m/s", "V passa da 2 a 1 m/s", "V diventa zero"],
  "Nella seconda prova la circonferenza è doppia, ma il tempo per percorrerla è lo stesso. Occorre quindi una rapidità doppia. Stiamo confrontando due circonferenze diverse: durante ciascuna prova il raggio rimane costante e il punto non descrive una spirale.",
  r"V_1=\frac{2\pi(1\,\mathrm m)}{\pi\,\mathrm s}=2\,\mathrm{m/s}\qquad V_2=\frac{2\pi(2\,\mathrm m)}{\pi\,\mathrm s}=4\,\mathrm{m/s}\qquad \frac{V_2}{V_1}=2",
  "Il fattore quattro confonderebbe questa legge con una dipendenza quadratica dal raggio. L’invariabilità o il dimezzamento contraddicono il percorso doppio nello stesso tempo; zero non può descrivere un giro compiuto in un periodo finito. La direzione della velocità continua a cambiare anche se il modulo resta costante in ogni prova.", "Confronta le due circonferenze mantenendo lo stesso periodo."),
 ("Dal giro al raggio", "In un riferimento inerziale un punto compie un moto circolare uniforme con rapidità tangenziale V=2 m/s e periodo T=π s. Quanto vale il raggio fisso r, in metri? Usa π esatto.", 1,
  "Dalla legge V=2πr/T moltiplichiamo entrambi i membri per T. Otteniamo la lunghezza della circonferenza; poi dividiamo per 2π per isolare il raggio. V e T sono positivi e il prodotto ha unità di lunghezza.",
  r"VT=2\pi r\qquad r=\frac{VT}{2\pi}\qquad r=\frac{(2\,\mathrm{m/s})(\pi\,\mathrm s)}{2\pi}=1\,\mathrm m",
  "Il controllo 2π·1 m/(π s)=2 m/s restituisce la rapidità data. Fermarsi a VT darebbe la circonferenza, non il raggio. Semplificare il fattore 2π mantiene il risultato esatto e non richiede di sostituire 3,14 a π.", "Ricostruisci prima la circonferenza VT, poi dividila per 2π."),
 ("Un periodo espresso con π", "In un riferimento inerziale un punto percorre uniformemente una circonferenza fissa di raggio r=1 m con rapidità tangenziale V=2 m/s. Quanto vale il periodo T? Mantieni π esatto.", ["π s", "2π s", "(π/2) s", "(1/π) s", "1 s"],
  "Il periodo è il tempo necessario a percorrere 2π metri. Isoliamolo senza invertire grandezze a caso: moltiplichiamo V=2πr/T per T, poi dividiamo per la rapidità positiva V. Si cancellano i fattori due e i metri, lasciando secondi.",
  r"VT=2\pi r\qquad T=\frac{2\pi r}{V}\qquad T=\frac{2\pi\,\mathrm m}{2\,\mathrm{m/s}}=\pi\,\mathrm s",
  "2π s ometterebbe la divisione per due; π/2 s la applicherebbe una seconda volta. (1/π) s inverte il valore numerico del periodo e 1 s cancella anche il π che deve restare. Non serve un valore decimale: π s è la risposta esatta.", "Dividi la lunghezza dell’intero giro per la rapidità."),
 ("Più tempo per lo stesso giro", "Due prove di moto circolare uniforme hanno raggio fisso r=1 m nello stesso riferimento inerziale. Il periodo passa da T₁=π s a T₂=2π s. V₁,V₂ sono le rapidità tangenziali. Quanto vale V₂/V₁?", ["2", "1/4", "1/2", "1", "−1/2"],
  "Il percorso di un giro non cambia. Nella seconda prova si impiega il doppio del tempo per percorrerlo, quindi la rapidità si dimezza. Calcolando i due valori con π esatto otteniamo due e un metro al secondo.",
  r"V_1=\frac{2\pi\,\mathrm m}{\pi\,\mathrm s}=2\,\mathrm{m/s}\qquad V_2=\frac{2\pi\,\mathrm m}{2\pi\,\mathrm s}=1\,\mathrm{m/s}\qquad \frac{V_2}{V_1}=\frac12",
  "Due inverte la dipendenza dal periodo; un quarto la applica due volte. Uno ignora il tempo cambiato. Il valore negativo non è un rapporto fra moduli positivi: il senso di rotazione non è rappresentato dal segno di questa rapidità.", "Il periodo compare al denominatore, mentre il percorso rimane fisso."),
 ("Lo scarto della rapidità proposta", "Un moto circolare uniforme, osservato in un riferimento inerziale, ha raggio fisso r=1 m e periodo T=π s. Una proposta assegna V_proposto=4 m/s al modulo della velocità. Quanto vale lo scarto proposto meno corretto?", ["−2 m/s", "+2 m/s", "+4 m/s", "0 m/s", "+1 m/s"],
  "Calcoliamo prima la rapidità corretta dalla circonferenza e dal periodo. Il fattore π si semplifica e lascia due metri al secondo. La sottrazione successiva segue l’ordine dichiarato: proposta meno quel valore corretto.",
  r"V=\frac{2\pi\,\mathrm m}{\pi\,\mathrm s}=2\,\mathrm{m/s}\qquad e=(4-2)\,\mathrm{m/s}=+2\,\mathrm{m/s}",
  "Lo scarto positivo segnala una sovrastima. −2 m/s inverte il confronto; +4 m/s ripete la proposta o la confronta con la velocità media vettoriale nulla, che è un’altra grandezza. Zero ignora l’errore e +1 m/s non segue dalla differenza richiesta.", "Non usare lo spostamento nullo del giro per trovare la rapidità corretta."),
 ("L’inversa del raggio", "Un punto compie un moto circolare uniforme in un riferimento inerziale. Raggio r, periodo T e rapidità tangenziale V sono positivi e soddisfano V=2πr/T. Quale formula isola r?", ["r=VT/π", "r=V/(2πT)", "r=VT/(2π)", "r=2πV/T", "r=T/(2πV)"],
  "Il raggio moltiplica 2π ed è diviso per T. Moltiplichiamo l’uguaglianza per T e poi dividiamo per 2π. Il prodotto VT è una lunghezza; dividere per un numero puro non ne cambia l’unità.",
  r"VT=2\pi r\qquad \frac{VT}{2\pi}=r\qquad r=\frac{VT}{2\pi}",
  "VT/π sarebbe il doppio del raggio. Le alternative che dividono V per T hanno dimensione di accelerazione, mentre T/V ha dimensione tempo quadrato su lunghezza. Il controllo diretto 2π·[VT/(2π)]/T=V ricostruisce la legge, con T>0.", "Elimina prima il denominatore T e poi il fattore 2π."),
 ("Due fattori fra due circonferenze", "In due prove distinte di moto circolare uniforme, ciascuna con raggio e periodo costanti, i dati r,T>0 della prima diventano κ₁r,κ₂T nella seconda, con κ₁,κ₂>0. V₁,V₂ sono i moduli delle velocità nello stesso riferimento inerziale. Quale rapporto V₂/V₁ segue?", ["κ₁κ₂", "κ₂/κ₁", "κ₁/κ₂", "κ₁²/κ₂", "κ₁+κ₂"],
  "Il fattore sul raggio moltiplica la circonferenza, mentre il fattore sul periodo divide la rapidità. Scriviamo la legge in entrambe le prove e cancelliamo il fattore 2π e i dati iniziali non nulli nel rapporto. Nessun parametro cambia durante un singolo giro.",
  r"V_1=\frac{2\pi r}{T}\qquad V_2=\frac{2\pi\kappa_1r}{\kappa_2T}\qquad \frac{V_2}{V_1}=\frac{\kappa_1}{\kappa_2}",
  "Il prodotto κ₁κ₂ farebbe aumentare V anche quando aumenta soltanto il periodo; il rapporto inverso scambia i ruoli degli ingressi. Il quadrato su κ₁ è assente dalla circonferenza. La somma fallisce senza cambiamenti, dando due anziché uno. Se entrambi i fattori sono uguali, V resta uguale.", "Conserva il fattore del periodo al denominatore."),
 ("Un rapporto che contiene π", "Due prove di moto circolare uniforme hanno dati (r₁=1 m,T₁=π s) e (r₂=2 m,T₂=1 s), costanti nella singola prova e osservati nello stesso riferimento inerziale. V₁,V₂ sono le rapidità tangenziali. Quanto vale V₂/V₁? Mantieni π esatto.", ["π", "2π", "4π", "π/2", "1/(2π)"],
  "La prima circonferenza viene percorsa a due metri al secondo perché π si cancella. La seconda ha lunghezza 4π metri ed è percorsa in un secondo, quindi V₂=4π m/s. Dividiamo questa nuova rapidità per quella iniziale: resta 2π, senza unità.",
  r"V_1=2\,\mathrm{m/s}\qquad V_2=4\pi\,\mathrm{m/s}\qquad \frac{V_2}{V_1}=\frac{4\pi}{2}=2\pi",
  "π trascura il raddoppio del raggio; 4π ripete la seconda rapidità senza dividerla per la prima. π/2 divide ancora per quattro rispetto al risultato corretto e 1/(2π) inverte il rapporto. π rimane qui perché il secondo periodo è 1 s, non π s.", "Calcola entrambi i moduli prima di cancellare le unità nel rapporto."),
 ("Media di due letture esatte", "Due prove uniformi su circonferenze fisse, nello stesso riferimento inerziale, hanno (r=1 m,T=π s) e (r=2 m,T=1 s). Con V=2πr/T si ottengono due rapidità tangenziali. Qual è la loro media aritmetica con uguale peso statistico? Mantieni π esatto.", ["(2+4π) m/s", "(1/2+π) m/s", "2π m/s", "(1+2π) m/s", "(2+2π) m/s"],
  "Le due rapidità sono 2 m/s e 4π m/s. Mediamo le uscite già calcolate, assegnando metà peso a ciascuna. Dividendo separatamente i due addendi per due otteniamo uno e due π. La somma resta un’espressione esatta.",
  r"V_1=2\,\mathrm{m/s}\qquad V_2=4\pi\,\mathrm{m/s}\qquad \overline V=\frac{2+4\pi}{2}\,\mathrm{m/s}\qquad \overline V=(1+2\pi)\,\mathrm{m/s}",
  "2+4π manca della divisione per due; 1/2+π dimezza una seconda volta. 2π omette il contributo della prima prova e 2+2π non dimezza il suo due. Non sostituiamo nella legge r e T medi: il periodo sta al denominatore, quindi quella sarebbe un’altra operazione.", "Dimezza separatamente 2 e 4π, poi somma."),
 ("Scegliere il nuovo periodo", "La prima prova di moto circolare uniforme ha r₁=1 m,T₁=π s e rapidità tangenziale V₁. Nella seconda si sceglie r₂=2 m e si vuole V₂=2πV₁. Ogni prova mantiene raggio e periodo positivi costanti in un riferimento inerziale. Quanto deve valere T₂/T₁? Usa π esatto.", ["1/π", "2/π", "1/(2π)", "π", "2π"],
  "La prima rapidità è due metri al secondo, quindi il nuovo obiettivo è 4π m/s. Il nuovo giro misura 4π metri. Dividendo giro per rapidità troviamo un secondo: soltanto dopo confrontiamo questo periodo con il precedente π secondi.",
  r"V_1=2\,\mathrm{m/s}\qquad V_2=4\pi\,\mathrm{m/s}\qquad T_2=\frac{2\pi r_2}{V_2}=\frac{4\pi\,\mathrm m}{4\pi\,\mathrm{m/s}}=1\,\mathrm s\qquad \frac{T_2}{T_1}=\frac1\pi",
  "2/π non imporrebbe l’aumento voluto perché lascerebbe T₂=2 s; 1/(2π) darebbe T₂=1/2 s e una rapidità doppia dell’obiettivo. π e 2π allungherebbero il periodo nella direzione sbagliata. Il risultato è positivo e lascia entrambe le prove uniformi, senza cambiare raggio nel tempo.", "Ricava T₂ come un tempo, poi dividilo per T₁."),
 ("Tarare prima di trovare il raggio", "Ogni prova è un moto circolare uniforme con raggio r e periodo T positivi costanti, in un riferimento inerziale; V è la rapidità tangenziale. Un display ideale fornisce una lettura continua adimensionale S=gV con g>0 costante e offset nullo. Il riferimento r=1 m,T=π s dà S=6. La nuova prova dà S=12π e T=1 s. Quanto vale r, in metri? Usa π esatto.", 2,
  "Il riferimento ha V=2 m/s, quindi il guadagno è tre secondi per metro. La nuova lettura rappresenta V=4π m/s. Ricostruiamo poi il raggio con r=VT/(2π): il π rimane esatto e si semplifica, insieme al fattore due.",
  r"g=\frac6{2\,\mathrm{m/s}}=3\,\mathrm{s/m}\qquad V=\frac{12\pi}{3\,\mathrm{s/m}}=4\pi\,\mathrm{m/s}\qquad r=\frac{VT}{2\pi}=\frac{(4\pi\,\mathrm{m/s})(1\,\mathrm s)}{2\pi}=2\,\mathrm m",
  "La ricostruzione completa restituisce V=4π m/s e S=(3 s/m)(4π m/s)=12π. La lettura è un numero puro su una scala continua; non si può trattare direttamente come metri al secondo o come un raggio. Tutti i dati della nuova prova sono positivi.", "Usa il riferimento per convertire la lettura in rapidità."),
 ("Un offset con π nei riferimenti", "Ogni prova è un moto circolare uniforme in un riferimento inerziale, con r,T>0 costanti e rapidità tangenziale V. Il display ideale fornisce una lettura continua adimensionale S=gV+c con g>0,c costanti. I riferimenti (r=1 m,T=π s) e (r=2 m,T=1 s) danno S=5 e S=1+8π. La prova ignota ha T=π s,S=9. Quanto vale r? Mantieni π esatto.", ["1 m", "2 m", "4 m", "−2 m", "3 m"],
  "Le rapidità di riferimento sono 2 e 4π m/s. Chiamiamo h=4π−2 il numero positivo della loro differenza in m/s. La differenza delle letture è 8π−4=2h: dividendo per h m/s si trova g=2 s/m senza approssimare π. Dal primo riferimento segue c=1. Correggiamo la lettura nuova prima di invertire la legge del moto.",
  r"h=4\pi-2>0\qquad \Delta V=h\,\mathrm{m/s}\qquad \Delta S=2h\qquad g=\frac{2h}{h\,\mathrm{m/s}}=2\,\mathrm{s/m}\qquad c=5-2\times2=1\qquad V=\frac{9-1}{2\,\mathrm{s/m}}=4\,\mathrm{m/s}\qquad r=\frac{(4\,\mathrm{m/s})(\pi\,\mathrm s)}{2\pi}=2\,\mathrm m",
  "Con r=2 m e T=π s si ottiene V=4 m/s e S=2·4+1=9. Un metro ripete il primo riferimento; quattro e tre metri darebbero letture 17 e 13. −2 m viola il raggio positivo. Il rapporto fra letture grezze non eliminerebbe l’offset: serve prima la differenza.", "Fattorizza la differenza 8π−4 come 2(4π−2)."),
 ("Una misura che ripete il vincolo", "Si scelgono prove di moto circolare uniforme in un riferimento inerziale. Durante ciascuna prova il raggio r>0 e il periodo T>0 restano costanti. I dati scelti rispettano r=kT, con k=(1/π) m/s. Si misura anche la rapidità tangenziale V=2 m/s. Quante coppie positive (r,T) sono compatibili? Il vincolo lega prove diverse, non descrive un raggio variabile durante il moto.", ["Nessuna coppia", "Una sola coppia", "Due coppie", "Infinite coppie positive", "Solo la coppia r=T=0"],
  "Il coefficiente k ha unità di velocità: moltiplicato per il periodo dà un raggio. Sostituiamo r=kT nella legge V=2πr/T. T si cancella perché è positivo e la rapidità è già fissata dal solo coefficiente k. La misura ripete quindi l’informazione del vincolo.",
  r"V=\frac{2\pi kT}{T}=2\pi k\qquad V=2\pi\left(\frac1\pi\,\mathrm{m/s}\right)=2\,\mathrm{m/s}\qquad T>0\qquad r=kT",
  "T=π s con r=1 m e T=2π s con r=2 m sono due esempi; ogni altro T positivo fornisce un altro r positivo compatibile. Non sono soltanto due possibilità. La coppia nulla è esclusa e non servirebbe a definire V=2πr/T. Il vincolo non individua una scala unica del moto.", "Sostituisci il vincolo prima di tentare di risolvere per un’incognita.")
]
CHOICES={2:2,3:1,4:0,6:0,7:2,8:1,9:2,10:2,11:1,12:3,13:0,15:1,16:3}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/circular-speed-tangents.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-circular-speed-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':'m/s' if n==1 else 'm','tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Moto circolare','order':2420+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L004','prerequisites':['C1-L001','C1-L002','C1-L003','C1-L004'],'reuse':['C6'],
            'family':'uniform-circular-speed','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Conserva π esatto e distingui rapidità, percorso e spostamento.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L004'},
            'coverage':['Moto circolare uniforme e accelerazione centripeta'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe per r=1 m,T=π s: misura del giro 2π m; velocità tangenti in due istanti con uguale modulo 2 m/s; divisione del giro per il periodo. Scala spaziale 100 px/m; frecce di velocità 40 px per m/s. Lunghezze geometriche e frecce di velocità hanno unità diverse.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.circular_speed_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'circular-speed-024.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'circular-speed-024-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
