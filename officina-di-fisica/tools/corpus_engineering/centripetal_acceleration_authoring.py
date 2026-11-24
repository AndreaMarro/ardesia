"""Author centripetal acceleration drafts; no independent scientific approval."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

TASKS=[
("Accelerare cambiando direzione", "In un riferimento inerziale un punto percorre uniformemente una circonferenza fissa di raggio r=2 m con rapidità v=2 m/s. A è il modulo dell’accelerazione centripeta; la componente tangenziale è nulla. Quanto vale A, in m/s²?", 2,
 "L’accelerazione descrive il cambiamento della velocità vettoriale, che qui ruota anche se il suo modulo resta uguale. Per una circonferenza fissa e un moto uniforme il modulo radiale è A=v²/r. Eleviamo al quadrato sia il due sia l’unità della rapidità, poi dividiamo per due metri.",
 r"A=\frac{v^2}{r}\qquad v^2=(2\,\mathrm{m/s})^2=4\,\mathrm{m^2/s^2}\qquad A=\frac{4\,\mathrm{m^2/s^2}}{2\,\mathrm m}=2\,\mathrm{m/s^2}",
 "L’accelerazione è diretta verso il centro, perpendicolarmente alla velocità tangente. Il risultato non è zero: è nulla soltanto la componente che cambierebbe il modulo della velocità. Il due finale ha unità di accelerazione, diverse dai due metri al secondo della rapidità assegnata.", "Il quadrato si applica anche all’unità m/s."),
("L’unità di una variazione di direzione", "Nel moto circolare uniforme A=v²/r è il modulo dell’accelerazione centripeta, con v rapidità e r raggio positivo. Quale unità SI esprime A?", ["s","m","m/s","m/s²","kg"],
 "Prima di usare i valori numerici controlliamo le dimensioni della relazione. Il quadrato della rapidità produce metri quadrati su secondi quadrati. La divisione per il raggio elimina un solo fattore metro: rimane un metro su secondi quadrati.",
 r"[v^2]=L^2/T^2\qquad [r]=L\qquad [A]=\frac{L^2/T^2}{L}=L/T^2",
 "m/s² è quindi compatibile. m/s resta una rapidità e manca una divisione per tempo; m è solo una lunghezza; s una durata; kg una massa. La direzione radiale non cambia la dimensione fisica dell’accelerazione.", "Riduci (m/s)² diviso m."),
("Uniforme nel modulo, non nel vettore", "In un riferimento inerziale un punto si muove su una circonferenza fissa di raggio r>0 con rapidità costante v>0. Quale affermazione descrive questo moto circolare uniforme?", ["L’accelerazione è nulla", "La risultante delle forze è tangente alla traiettoria", "Il raggio deve aumentare", "La rapidità è costante ma la velocità vettoriale cambia direzione", "La velocità vettoriale è costante"],
 "La velocità è sempre tangente alla circonferenza. Due tangenti in punti diversi non hanno la stessa direzione, anche quando le frecce hanno uguale lunghezza. La parola uniforme riguarda il modulo v. Il cambiamento di direzione produce un’accelerazione radiale non nulla perché v e r sono positivi.",
 r"v=\mathrm{costante}>0\qquad a_t=\frac{dv}{dt}=0\qquad A=\frac{v^2}{r}>0",
 "Per un corpo di massa positiva la risultante è diretta al centro, non lungo la tangente. Una risultante tangenziale netta cambierebbe la rapidità. Il raggio resta fisso per ipotesi. Affermare che l’intero vettore velocità sia costante eliminerebbe la curvatura della traiettoria; affermare accelerazione nulla confonde il vettore con il suo modulo.", "Confronta le tangenti in due punti distinti del giro."),
("Doppia rapidità sulla stessa circonferenza", "Due prove distinte di moto circolare uniforme, nello stesso riferimento inerziale, usano il raggio fisso r=2 m. La rapidità passa da v₁=2 m/s a v₂=4 m/s fra le prove. A₁ e A₂ sono i moduli delle accelerazioni centripete. Come cambiano?", ["Da 2 a 8 m/s²", "Da 2 a 4 m/s²", "Restano entrambe 2 m/s²", "Da 2 a 1 m/s²", "Diventano entrambe zero"],
 "La rapidità compare due volte nel prodotto v·v. Raddoppiarla moltiplica il numeratore per quattro; il raggio rimane lo stesso. Calcoliamo i due moduli per vedere il fattore e le unità, senza interpretare il confronto come un’accelerazione tangenziale durante una singola prova.",
 r"A_1=\frac{2^2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad A_2=\frac{4^2}{2}\,\mathrm{m/s^2}=8\,\mathrm{m/s^2}\qquad A_2/A_1=4",
 "Il passaggio a quattro usa una dipendenza lineare dalla rapidità; quello a uno ne inverte l’effetto. Lasciare A invariata ignora il dato cambiato. Lo zero confonde rapidità costante in ogni prova con velocità vettoriale costante: la direzione ruota in entrambe.", "Il raddoppio entra nel quadrato."),
("Ricostruire il modulo della velocità", "Un punto compie un moto circolare uniforme su una circonferenza fissa in un riferimento inerziale. Si misurano A=2 m/s², modulo dell’accelerazione centripeta, e r=2 m. Quanto vale la rapidità v>0 in m/s?", 2,
 "Moltiplichiamo A=v²/r per r per isolare il quadrato della rapidità. Il prodotto Ar vale quattro metri quadrati su secondi quadrati. La sua radice positiva è esattamente due metri al secondo: il segno negativo non appartiene al dominio di una rapidità.",
 r"Ar=v^2\qquad v=\sqrt{Ar}\qquad Ar=(2\,\mathrm{m/s^2})(2\,\mathrm m)=4\,\mathrm{m^2/s^2}\qquad v=\sqrt4\,\mathrm{m/s}=2\,\mathrm{m/s}",
 "Reinserendo il valore si trova (2 m/s)²/(2 m)=2 m/s². Non occorre calcolare separatamente due radici irrazionali: prendiamo la radice del prodotto quattro, che è un quadrato perfetto. Il verso di rotazione non è determinato da questo modulo positivo.", "Prima moltiplica A per r, poi estrai una sola radice."),
("Dal piegamento della velocità al raggio", "In un riferimento inerziale un punto ha moto circolare uniforme con rapidità v=2 m/s e modulo dell’accelerazione centripeta A=2 m/s². Quanto vale il raggio fisso r>0, in metri?", 2,
 "Il raggio divide il quadrato della rapidità. Per isolarlo moltiplichiamo per r e poi dividiamo per A, che qui è positivo. Il quadrato di due metri al secondo è quattro metri quadrati su secondi quadrati; dividerlo per due metri su secondi quadrati lascia due metri.",
 r"Ar=v^2\qquad r=\frac{v^2}{A}\qquad r=\frac{4\,\mathrm{m^2/s^2}}{2\,\mathrm{m/s^2}}=2\,\mathrm m",
 "Il controllo v²/r restituisce l’accelerazione assegnata. Il rapporto v/A avrebbe unità di tempo, non di lunghezza: il quadrato nella legge non può essere omesso. Il valore positivo è coerente con una circonferenza non degenere.", "Sposta r al numeratore prima di dividere per A."),
("Una curva più larga a pari rapidità", "Due prove di moto circolare uniforme, osservate nello stesso riferimento inerziale, hanno rapidità v=2 m/s. I raggi fissi delle due prove sono r₁=2 m e r₂=4 m. A₁ e A₂ sono i moduli delle accelerazioni centripete. Quanto vale A₂/A₁?", ["2","−1/2","1/2","1","1/4"],
 "Il quadrato della rapidità è quattro in entrambe le prove. Il denominatore raddoppia, perciò il modulo radiale si dimezza. Dividiamo poi i due risultati nello stesso ordine dei pedici: secondo su primo.",
 r"A_1=\frac42\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad A_2=\frac44\,\mathrm{m/s^2}=1\,\mathrm{m/s^2}\qquad A_2/A_1=1/2",
 "Due inverte il rapporto, uno ignora il cambiamento del raggio e un quarto applica un quadrato al raggio che non c’è. −1/2 non può essere un rapporto fra moduli positivi: un’accelerazione diretta verso il centro ha modulo positivo, qualunque sia il senso di rotazione.", "Il raggio compare alla prima potenza al denominatore."),
("Sottrarre dopo aver ricavato A", "Un moto circolare uniforme, visto in un riferimento inerziale, ha rapidità v=2 m/s e raggio fisso r=2 m. Si propone A_proposto=4 m/s² per il modulo dell’accelerazione centripeta. Quanto vale lo scarto con segno proposto meno corretto?", ["+2 m/s²","+4 m/s²","+1 m/s²","0 m/s²","−2 m/s²"],
 "Quattro è il quadrato del valore numerico della rapidità, ma occorre ancora dividerlo per il raggio due. Solo dopo aver ottenuto A=2 m/s² eseguiamo la sottrazione nell’ordine richiesto.",
 r"A=\frac{2^2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad e=(4-2)\,\mathrm{m/s^2}=+2\,\mathrm{m/s^2}",
 "+4 ripete la proposta; +1 non è la differenza fra i due dati; zero la dichiarerebbe corretta; −2 calcola corretto meno proposto. Il segno positivo dello scarto indica sovrastima, senza introdurre una convenzione di verso per il modulo A.", "La proposta ha omesso la divisione per r."),
("Una radice con il ramo fisico", "In un riferimento inerziale un moto circolare uniforme ha raggio fisso r>0, rapidità v>0 e modulo dell’accelerazione centripeta A=v²/r. Quale formula isola v nel dominio dichiarato?", ["v=Ar","v=√(Ar)","v=−√(Ar)","v=√(A/r)","v=√(r/A)"],
 "Moltiplicando per r otteniamo v²=Ar. Ar è positivo, quindi l’equazione algebrica ammette due segni, ma la rapidità è per definizione il modulo positivo del vettore. Conserviamo il solo ramo positivo. La radice di Ar ha dimensione di velocità.",
 r"Ar=v^2\qquad v=\pm\sqrt{Ar}\qquad v>0\qquad v=\sqrt{Ar}\qquad [\sqrt{Ar}]=\sqrt{L^2/T^2}=L/T",
 "Ar è una rapidità al quadrato, non una rapidità. Il ramo negativo è escluso dal dominio; non indica qui il senso di rotazione. √(A/r) avrebbe unità 1/s e √(r/A) avrebbe unità s. Per A,r positivi la formula corretta soddisfa esattamente v²/r=A.", "Controlla insieme il segno e la dimensione della radice."),
("Due fattori con un quadrato", "In due prove distinte di moto circolare uniforme, nello stesso riferimento inerziale, la prima ha rapidità v>0 e raggio r>0. Nella seconda sono κ₁v e κ₂r, con κ₁,κ₂>0. Raggio e rapidità restano costanti in ogni prova. A₁,A₂ sono i moduli delle accelerazioni centripete. Quale rapporto A₂/A₁ segue?", ["κ₁/κ₂","κ₂/κ₁²","κ₁²/κ₂","κ₁²κ₂","κ₁²/κ₂²"],
 "Il fattore κ₁ moltiplica una grandezza elevata al quadrato e deve quindi essere elevato anch’esso al quadrato. Il fattore κ₂ moltiplica il denominatore. Dividiamo la legge della seconda prova per quella della prima; v² e r si cancellano perché sono non nulli.",
 r"A_1=\frac{v^2}{r}\qquad A_2=\frac{(\kappa_1v)^2}{\kappa_2r}\qquad A_2=\frac{\kappa_1^2}{\kappa_2}A_1\qquad A_2/A_1=\kappa_1^2/\kappa_2",
 "κ₁/κ₂ dimentica il quadrato della rapidità; κ₂/κ₁² inverte il rapporto; κ₁²κ₂ trasforma l’effetto del raggio in una moltiplicazione. κ₁²/κ₂² introduce un quadrato assente sul raggio. Con κ₁=κ₂=2 si ottiene due, non uno: due ingressi raddoppiati non si compensano completamente.", "Eleva al quadrato l’intero prodotto κ₁v."),
("Due raddoppi che si compensano solo in parte", "Due prove di moto circolare uniforme nello stesso riferimento inerziale hanno dati costanti (v₁=2 m/s,r₁=2 m) e (v₂=4 m/s,r₂=4 m). A₁ e A₂ sono i moduli delle accelerazioni centripete. Quanto vale A₂/A₁?", 2,
 "La seconda rapidità al quadrato è sedici, mentre il secondo raggio è quattro: l’accelerazione vale quattro metri al secondo quadrato. La prima vale due. Il raddoppio del raggio compensa metà del fattore quattro prodotto dal raddoppio della rapidità.",
 r"A_1=\frac{2^2}{2}\,\mathrm{m/s^2}=2\,\mathrm{m/s^2}\qquad A_2=\frac{4^2}{4}\,\mathrm{m/s^2}=4\,\mathrm{m/s^2}\qquad A_2/A_1=4/2=2",
 "Il rapporto è un numero puro. La cancellazione completa dei due raddoppi sarebbe corretta per una legge v/r, non per v²/r. Qui le condizioni fra prove cambiano, ma l’accelerazione tangenziale rimane nulla dentro ciascuna prova uniforme.", "Confronta il fattore quattro al numeratore con il fattore due al denominatore."),
("Media delle accelerazioni di due prove", "In un riferimento inerziale due prove uniformi su circonferenze fisse hanno (v=2 m/s,r=2 m) e (v=4 m/s,r=4 m). A=v²/r è il modulo dell’accelerazione centripeta. Qual è la media aritmetica delle due letture A, con uguale peso statistico?", ["6 m/s²","3/2 m/s²","4 m/s²","2 m/s²","3 m/s²"],
 "Calcoliamo separatamente le due uscite: quattro diviso due dà due, sedici diviso quattro dà quattro. La media divide la loro somma sei per due. Per questi particolari dati proporzionali, anche gli ingressi medi v=3 m/s,r=3 m darebbero tre; questa coincidenza non è una regola generale della legge.",
 r"A_1=2\,\mathrm{m/s^2}\qquad A_2=4\,\mathrm{m/s^2}\qquad \overline A=\frac{2+4}{2}\,\mathrm{m/s^2}=3\,\mathrm{m/s^2}",
 "Sei è la somma, 3/2 dimezza ancora la media, quattro e due selezionano una sola prova. Per vedere il limite della coincidenza, a r=2 m con v=2 e 4 m/s le uscite sarebbero 2 e 8, media 5 m/s²; usare v medio 3 m/s darebbe invece 9/2 m/s². Tutti questi conti sono esatti.", "Media le due accelerazioni, non i dati prima di aver applicato la legge."),
("Aumentare A meno del quadrato della rapidità", "In un riferimento inerziale la prima prova circolare uniforme ha v₁=2 m/s,r₁=2 m e accelerazione centripeta di modulo A₁. Nella seconda prova si impone v₂=4 m/s e si vuole A₂=2A₁. I raggi rimangono costanti in ciascuna prova. Quale rapporto r₂/r₁ occorre?", 2,
 "L’obiettivo è quattro metri al secondo quadrato, perché l’accelerazione iniziale vale due. Isoliamo il raggio della seconda prova nella legge A₂=v₂²/r₂. Il numeratore sedici deve essere diviso per quattro: il nuovo raggio è quattro metri.",
 r"A_1=2\,\mathrm{m/s^2}\qquad A_2=4\,\mathrm{m/s^2}\qquad A_2r_2=v_2^2\qquad r_2=\frac{v_2^2}{A_2}=\frac{16\,\mathrm{m^2/s^2}}{4\,\mathrm{m/s^2}}=4\,\mathrm m\qquad r_2/r_1=4/2=2",
 "Con il raggio originario l’accelerazione diventerebbe otto e supererebbe l’obiettivo. Raddoppiare il raggio riduce quel valore a quattro. Verifichiamo 4²/4=4: il risultato soddisfa contemporaneamente la rapidità imposta e l’accelerazione voluta.", "Trova prima l’obiettivo A₂ e poi ricava r₂."),
("Convertire tacche prima della radice", "Ogni prova è un moto circolare uniforme in un riferimento inerziale, con raggio r>0 e rapidità v>0 costanti; A=v²/r è il modulo dell’accelerazione centripeta. Il display conta tacche S=gA, con g>0 costante e offset nullo. Il riferimento v=2 m/s,r=2 m dà S=6. La nuova prova dà S=12 e r=4 m. Quanto vale v nella nuova prova, in m/s?", 4,
 "Il riferimento ha A=2 m/s², perciò il guadagno è sei diviso due, cioè 3 s²/m. Dodici tacche corrispondono allora a 4 m/s². Moltiplichiamo questa accelerazione per il nuovo raggio di quattro metri: sotto la radice compare sedici, un quadrato perfetto.",
 r"A_{ref}=2\,\mathrm{m/s^2}\qquad g=\frac6{2\,\mathrm{m/s^2}}=3\,\mathrm{s^2/m}\qquad A=\frac{12}{g}=4\,\mathrm{m/s^2}\qquad v^2=Ar=16\,\mathrm{m^2/s^2}\qquad v=4\,\mathrm{m/s}",
 "Il controllo restituisce A=4²/4=4 m/s² e S=3·4=12. Le tacche sono un conteggio puro, non l’accelerazione in SI: il passaggio per la taratura precede la radice. Prendiamo il ramo positivo perché v è una rapidità.", "Dal riferimento ricava g, poi A e infine v=√(Ar)."),
("Due riferimenti eliminano l’offset", "Ogni prova è un moto circolare uniforme in un riferimento inerziale, con v>0,r>0 costanti e A=v²/r. Il display conta S=gA+c, con g>0,c costanti. I riferimenti (v=2 m/s,r=2 m) e (v=4 m/s,r=4 m) danno S=5 e S=9. La prova ignota ha r=2 m e S=17. Quanto vale la sua rapidità v?", ["4 m/s","8 m/s","2 m/s","5 m/s","3 m/s"],
 "Le accelerazioni dei riferimenti sono due e quattro metri al secondo quadrato. Sottraendo le equazioni del display eliminiamo c e dividiamo la differenza delle tacche, quattro, per la differenza delle accelerazioni, due. Otteniamo g=2 s²/m e poi c=1. Diciassette tacche corrispondono a otto metri al secondo quadrato, dopo aver sottratto l’offset.",
 r"g=\frac{9-5}{(4-2)\,\mathrm{m/s^2}}=2\,\mathrm{s^2/m}\qquad c=5-2\times2=1\qquad A=\frac{17-1}{g}=8\,\mathrm{m/s^2}\qquad v^2=Ar=16\,\mathrm{m^2/s^2}\qquad v=4\,\mathrm{m/s}",
 "Otto è il valore numerico dell’accelerazione ricostruita, non della rapidità. Due ripete la prima rapidità. Cinque e tre non hanno quadrato sedici; ai dati r=2 m corrisponderebbero a letture 26 e 10, diverse da 17. Il controllo corretto dà S=2·(4²/2)+1=17.", "Sottrai le due equazioni di taratura prima di trovare l’offset."),
("Un vincolo di velocità angolare fra prove", "Si scelgono prove di moto circolare uniforme in un riferimento inerziale. In ciascuna prova raggio r>0 e rapidità v>0 sono costanti; A=v²/r è il modulo dell’accelerazione centripeta. I dati delle prove soddisfano v=kr, con k=1 s⁻¹ fisso. Si misura A=2 m/s². Quale raggio r è compatibile? Il vincolo collega prove diverse e non descrive un raggio che cresce nel tempo.", ["1 m","3 m","−2 m","2 m","4 m"],
 "Il coefficiente k ha unità di inverso del tempo e rappresenta il medesimo modulo della velocità angolare nelle prove selezionate. Sostituendo kr al posto di v il quadrato produce k²r². Dividendo per r>0 rimane A=k²r: ora il raggio si isola con una divisione, senza radici multiple.",
 r"A=\frac{(kr)^2}{r}=k^2r\qquad r=\frac{A}{k^2}\qquad r=\frac{2\,\mathrm{m/s^2}}{1\,\mathrm{s^{-2}}}=2\,\mathrm m\qquad v=kr=2\,\mathrm{m/s}",
 "Il controllo dà v²/r=4/2=2 m/s² e v/r=1 s⁻¹. Un metro, tre e quattro metri darebbero rispettivamente accelerazioni di 1,3 e 4 m/s² sotto questo vincolo; −2 m viola il dominio del raggio e produrrebbe anche una rapidità negativa. La relazione lineare A=k²r con k>0 determina una sola coppia positiva.", "Sostituisci il vincolo prima di risolvere per il raggio.")
]
CHOICES={2:3,3:3,4:0,7:2,8:0,9:1,10:2,12:4,15:0,16:3}


def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/centripetal-acceleration-direction.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-centripetal-acceleration-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':{1:'m/s²',5:'m/s',6:'m',11:'1',13:'1',14:'m/s'}[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Moto circolare','order':2520+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L004','prerequisites':['C1-L001','C1-L002','C1-L003','C1-L004'],'reuse':['C6'],
            'family':'uniform-centripetal-acceleration','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Distingui il modulo costante della velocità dal cambiamento della sua direzione.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L004'},
            'coverage':['Moto circolare uniforme e accelerazione centripeta'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Tre tappe per v=2 m/s e r=2 m: velocità tangente in P; in Q velocità tangente e accelerazione diretta al centro; calcolo di A=2 m/s². Scala geometrica 50 px/m, velocità 30 px per m/s e accelerazione 30 px per m/s². Le tre scale misurano grandezze di dimensioni diverse.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.centripetal_acceleration_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'centripetal-acceleration-025.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'centripetal-acceleration-025-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
