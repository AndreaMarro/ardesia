"""Author sixteen force-couple editions; separate review is NOT_RUN."""
import base64,json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='Su un corpo rigido agiscono due forze parallele di uguale modulo F>0 e versi opposti. Le loro rette d’azione hanno distanza perpendicolare d>0; M è il modulo del momento della coppia. La risultante di queste due forze è nulla. Si osserva il corpo in un riferimento inerziale e non si assegnano altre forze o coppie. '
TASKS=[
('Due forze che si cancellano soltanto nella somma',SCENE+'Con F=2 N e d=2 m, quanto vale M in N·m?',4,
 'Scegliamo come polo un punto sulla retta della prima forza: essa ha braccio nullo. La seconda ha braccio d e produce momento di modulo Fd. Il prodotto dà quattro N·m. Non va moltiplicato di nuovo per due: scegliendo un polo intermedio ciascuna forza avrebbe soltanto una parte della distanza totale come braccio.',
 r'M=Fd\qquad M=(2\,\mathrm N)(2\,\mathrm m)\qquad M=4\,\mathrm{N\,m}',
 'La risultante nulla non annulla il momento. Traslando il polo, la variazione del momento totale è il prodotto vettoriale dello spostamento cambiato di segno per la risultante: qui vale zero. Il momento di una coppia è dunque indipendente dal polo; una coppia può cambiare il moto rotazionale senza accelerare il centro di massa.', 'Metti il polo sulla retta di una forza e usa d come braccio dell’altra.'),
('L’unità del momento di una coppia','Due forze uguali e opposte hanno rette distanti d e momento di coppia di modulo M=Fd. F è in newton e d in metri. Quale unità proposta esprime M?',['N','N/m','N·m','kg','m'],
 'Il modulo del momento è una forza moltiplicata per una distanza. L’unità è newton per metro moltiplicato, N·m, non newton diviso metro. La dimensione è ML²/T², la stessa dell’energia: grandezze fisiche diverse possono condividere la dimensione.',
 r'[M]=[F][d]\qquad [M]=ML^2/T^2',
 'N è una forza, N/m una rigidezza, kg una massa e m una lunghezza. Nessun’altra alternativa ha la dimensione del momento. Scrivere N·m conserva il significato rotazionale; non è stato assegnato uno spostamento angolare da cui calcolare un lavoro.', 'Moltiplica N per m e confronta le cinque unità.'),
('Risultante nulla e momento non nullo','Due forze parallele di 5 N, uguali e opposte, agiscono su un corpo rigido lungo rette distinte distanti perpendicolarmente 2 m. Quali sono il modulo della risultante e il modulo del momento della coppia?',['0 N; 10 N·m','0 N; 0 N·m','10 N; 10 N·m','5 N; 10 N·m','0 N; 20 N·m'],
 'La somma vettoriale delle forze è zero perché i moduli sono uguali e i versi opposti. Per i momenti scegliamo il polo sulla prima retta: resta il momento della seconda, cinque newton per due metri. Otteniamo risultante zero e momento dieci N·m, indipendente dal polo.',
 r'\vec F_1+\vec F_2=\vec0\qquad M=Fd\qquad M=(5\,\mathrm N)(2\,\mathrm m)\qquad M=10\,\mathrm{N\,m}',
 'La coppia non è un’interazione fra due corpi con forze interne che si eliminano da un sistema: qui entrambe le forze agiscono sullo stesso corpo. Zero momento confonde somma delle forze con somma dei momenti; dieci newton somma i moduli, cinque ne ignora uno e venti N·m conta due volte tutta la distanza.', 'Calcola separatamente la somma vettoriale e il momento.'),
('Raddoppiare entrambi i moduli concordemente',SCENE+'Fra prove d=2 m resta uguale e il modulo di ciascuna forza passa da 2 a 4 N. Come cambia M?',['Da 4 a 8 N·m','Resta 4 N·m','Da 4 a 16 N·m','Da 4 a 2 N·m','Diventa zero'],
 'Ogni prova rimane una coppia: aumentano insieme i due moduli, conservando versi opposti. Il momento è proporzionale al modulo di una delle due forze, F, e non alla somma dei loro moduli. Con la separazione fissa due metri, quattro N·m diventano otto.',
 r'M_A=4\,\mathrm{N\,m}\qquad M_B=(4\,\mathrm N)(2\,\mathrm m)\qquad M_B=8\,\mathrm{N\,m}',
 'Sedici raddoppierebbe anche la distanza; due invertirebbe l’effetto della forza. Invarianza o zero non descrivono la nuova coppia. Non si sta lasciando una forza a due N e cambiando soltanto l’altra: in quel caso la risultante non sarebbe più nulla e il modello sarebbe diverso.', 'Mantieni uguali i due moduli dentro ciascuna prova e cambia F una volta.'),
('Ricostruire ciascuna forza',SCENE+'Si misura M=4 N·m e si conosce d=2 m. Quanto vale F, modulo di ciascuna forza, in N?',2,
 'Dividiamo il momento per la distanza perpendicolare positiva. Il rapporto quattro N·m su due metri dà due newton. Questo è il modulo di ciascuna forza; la loro somma vettoriale resta zero e non è il dato che si sta ricostruendo.',
 r'F=M/d\qquad F=\frac{4\,\mathrm{N\,m}}{2\,\mathrm m}\qquad F=2\,\mathrm N',
 'Dividere ancora per due darebbe forze di un N e momento due N·m, insufficiente. Il controllo 2 N·2 m=4 N·m ricostruisce la coppia senza introdurre una forza risultante non nulla. Il prodotto Md avrebbe unità N·m², non forza.', 'La distanza fra le rette è già il braccio totale della coppia.'),
('La separazione perpendicolare',SCENE+'Si misura M=4 N·m; ciascuna forza ha modulo F=2 N. Quanto vale d, in m?',2,
 'Nella relazione M=Fd dividiamo per il modulo F positivo. I newton si cancellano e rimane una lunghezza: due metri. d si misura tra le rette d’azione lungo una perpendicolare, non sommando le distanze dei punti di applicazione da un’origine arbitraria.',
 r'd=M/F\qquad d=\frac{4\,\mathrm{N\,m}}{2\,\mathrm N}\qquad d=2\,\mathrm m',
 'Quattro copia il numero del momento; uno divide indebitamente per la somma dei moduli. Se le rette coincidessero, d sarebbe zero e il momento nullo, incompatibile con i quattro N·m assegnati. Il polo non entra in questa distanza geometrica.', 'Dividi M per il modulo di una forza e conserva l’unità m.'),
('Rette due volte più distanti',SCENE+'Ciascuna forza ha modulo 2 N in entrambe le prove; d_A=2 m e d_B=4 m. Quanto vale M_B/M_A?',['2','1/2','4','1','−2'],
 'La risultante è zero in entrambe le configurazioni, ma il braccio della coppia raddoppia. I moduli dei momenti sono quattro e otto N·m; il rapporto è due. Conta la separazione delle rette, non la posizione del polo scelto per fare il calcolo.',
 r'M_A=4\,\mathrm{N\,m}\qquad M_B=8\,\mathrm{N\,m}\qquad M_B/M_A=2',
 'Un mezzo inverte il rapporto, quattro introduce un quadrato assente e uno confonde risultante invariata con momento invariato. Il rapporto negativo non confronta moduli positivi. Una traslazione del solo polo lascerebbe invece d e M invariati.', 'Confronta le due distanze perpendicolari.'),
('Una proposta che conta due volte',SCENE+'Con F=2 N,d=2 m si propone M_proposto=8 N·m. Quanto vale proposto meno corretto, in N·m?',4,
 'Il corretto è quattro N·m. La proposta otto attribuisce a entrambe le forze il braccio intero d, pur usando un’unica configurazione. Sottraiamo quattro da otto e otteniamo uno scarto positivo quattro N·m.',
 r'M=Fd\qquad M=4\,\mathrm{N\,m}\qquad e=(8-4)\,\mathrm{N\,m}\qquad e=+4\,\mathrm{N\,m}',
 'Se il polo fosse a metà, i due momenti avrebbero ciascuno modulo Fd/2 e lo stesso verso: sommandoli si ritroverebbe Fd, non 2Fd. −4 inverte la sottrazione, otto ripete la proposta e due dimezza ancora lo scarto. Il segno dell’errore non è il verso di rotazione.', 'Calcola Fd prima di formare lo scarto.'),
('L’inversa senza raddoppio',SCENE+'Quale formula isola F da M=Fd?',['F=M/d','F=Md','F=d/M','F=2 M/d','F=M/(2 d)'],
 'La distanza positiva è un fattore che moltiplica F: dividiamo entrambi i membri per d. Otteniamo M/d, con unità N·m/m=N. La presenza di due forze non introduce un ulteriore fattore due, perché d è già la distanza fra le due rette.',
 r'M/d=F\qquad F=M/d',
 'Md ha dimensioni N·m² invece di N; d/M è un inverso di forza. Il doppio e la metà falliscono il controllo Fd=M. L’unità e la sostituzione nella legge sono due controlli distinti e concordi.', 'Dividi per l’intera distanza fra le rette.'),
('Scalare la coppia fra configurazioni',SCENE+'B usa F_B=κ₁F e d_B=κ₂d, con κ₁,κ₂>0; F,d indicano A. I due moduli restano uguali e opposti in ogni configurazione. Quanto vale M_B/M_A?',['κ₁ κ₂','κ₁ / κ₂','κ₂ / κ₁','κ₁ + κ₂','κ₁ κ₂²'],
 'Nel secondo prodotto entrano il fattore della forza e quello della separazione. Dividendo per Fd si cancellano i dati iniziali e resta κ₁κ₂. La risultante nulla si conserva, perché entrambe le forze vengono scalate nello stesso modo dentro B.',
 r'M_A=Fd\qquad M_B=(\kappa_1F)(\kappa_2d)\qquad M_B/M_A=\kappa_1\kappa_2',
 'I quozienti invertono una dipendenza; la somma darebbe due per configurazioni identiche. Il quadrato di κ₂ confonde una lunghezza con una potenza che non compare nel momento. Spostare soltanto il polo non equivale a scalare d.', 'Scala un solo fattore F e un solo fattore d.'),
('Due raddoppi, un rapporto quattro',SCENE+'A ha F=2 N,d=2 m; B ha F=4 N,d=4 m. Quanto vale M_B/M_A?',4,
 'A produce quattro N·m e B sedici. Dividendo sedici per quattro troviamo quattro, prodotto del raddoppio di ciascuna forza e di quello della separazione. Non si moltiplica nuovamente per il numero delle forze.',
 r'M_A=4\,\mathrm{N\,m}\qquad M_B=16\,\mathrm{N\,m}\qquad M_B/M_A=4',
 'Due considera soltanto un cambiamento; otto conta un fattore superfluo; sedici è il momento B e non il rapporto puro. Un quarto invertirebbe il confronto. L’assenza di risultante non impedisce questa variazione del momento.', 'Valuta Fd in ciascuna configurazione prima del rapporto.'),
('Media di due intensità di coppia',SCENE+'A usa F=2 N,d=2 m e B usa F=4 N,d=4 m. Qual è la media aritmetica di M_A,M_B con uguale peso, in N·m?',10,
 'Le intensità sono quattro e sedici N·m. La loro semisomma è dieci N·m, fra i due valori. Non si chiede la risultante di due coppie agenti insieme, per la quale occorrerebbero anche i versi dei momenti: qui le prove sono distinte.',
 r'M_A=4\,\mathrm{N\,m}\qquad M_B=16\,\mathrm{N\,m}\qquad \overline M=\frac{4+16}{2}\,\mathrm{N\,m}\qquad \overline M=10\,\mathrm{N\,m}',
 'Venti è la somma, cinque divide ancora e nove è il prodotto degli ingressi medi tre N e tre m. Quest’ultimo descrive una terza configurazione e non la media richiesta. Undici non deriva dalla semisomma esatta.', 'Media le due uscite complete, non i fattori.'),
('Scegliere la separazione desiderata',SCENE+'A ha F_A=2 N,d_A=2 m. In B si sceglie F_B=4 N e si vuole M_B=4M_A. Quanto vale d_B/d_A?',2,
 'Il momento iniziale è quattro N·m e l’obiettivo sedici. Con ogni forza di quattro N serve una separazione d_B=16/4=4 m. Il rapporto ai due metri iniziali è due: il raddoppio dei moduli fornisce già metà del fattore quattro richiesto.',
 r'M_B=16\,\mathrm{N\,m}\qquad d_B=M_B/F_B\qquad d_B=4\,\mathrm m\qquad d_B/d_A=2',
 'Lasciare la separazione invariata darebbe momento doppio; quadruplicarla con le forze doppie darebbe otto volte l’iniziale. Quattro metri è la nuova separazione, non il rapporto quattro. Entrambe le forze B devono mantenere lo stesso modulo quattro N.', 'Dividi il momento obiettivo per il modulo nuovo di una forza.'),
('Tarare il momento prima delle forze',SCENE+'Un display continuo adimensionale segue S=qM, con q>0 costante e offset nullo. Il riferimento F=2 N,d=2 m dà S=12. Una prova con d=4 m dà S=48. Quanto vale F in N?',4,
 'Il riferimento ha momento quattro N·m, perciò q=3(N·m)⁻¹. La lettura 48 rappresenta sedici N·m. Dividendo per la separazione quattro metri otteniamo quattro N per ciascuna forza, dopo avere rimosso il guadagno strumentale.',
 r'q=3\,\mathrm{(N\,m)^{-1}}\qquad M=48/q\qquad M=16\,\mathrm{N\,m}\qquad F=M/d\qquad F=4\,\mathrm N',
 'Usare 48 come momento SI darebbe dodici N e lascerebbe un fattore tre spurio. Il controllo 4 N·4 m=16 N·m e S=3·16=48 ricostruisce i due passaggi. Il display misura il momento, non la risultante che resta zero.', 'Decodifica M e solo dopo isola F.'),
('Il display ha anche un offset',SCENE+'Un display continuo adimensionale segue S=qM+b, con q>0,b costanti. A: F=2 N,d=2 m,S=9. B: F=4 N,d=4 m,S=33. C: d=2 m,S=17. Quanto vale F_C?',['2 N','3 N','4 N','5 N','8 N'],
 'I momenti noti sono quattro e sedici N·m. La differenza delle letture 24 divisa per la differenza dei momenti dodici dà q=2(N·m)⁻¹. Il primo riferimento lascia b=1. C corrisponde a otto N·m e richiede F_C=8/2=4 N.',
 r'q=2\,\mathrm{(N\,m)^{-1}}\qquad b=1\qquad M_C=(17-1)/q\qquad M_C=8\,\mathrm{N\,m}\qquad F_C=4\,\mathrm N',
 'Con d_C=2 m, forze 2,3,5,8 N darebbero letture 9,13,21,33: soltanto quattro N dà 17. Un rapporto di letture non elimina b. La taratura di una coppia non trasforma il momento in una forza prima della divisione per d.', 'Usa i due riferimenti per separare guadagno e offset.'),
('Un vincolo seleziona la separazione',SCENE+'Si scelgono configurazioni con F=cd, dove c=1 N/m è fisso. Le forze restano uguali e opposte in ciascuna. Se M=4 N·m, quanto vale d in m? Il vincolo collega configurazioni e non descrive il lavoro durante una rotazione.',2,
 'Inseriamo il vincolo nella relazione del momento: M=cd². Il rapporto M/c vale quattro metri quadrati. Le due radici algebriche sono +2 e −2 m; la distanza perpendicolare positiva seleziona +2 m, che dà F=2 N.',
 r'M=cd^2\qquad d^2=M/c\qquad d^2=4\,\mathrm{m^2}\qquad d_+=2\,\mathrm m\qquad d_-=-2\,\mathrm m',
 'Il ramo negativo non è una distanza fra rette e renderebbe negativo il modulo F nel vincolo. Uno o tre metri darebbero momenti uno o nove N·m. Quattro confonde d² con d; non va introdotto il mezzo dell’energia elastica, perché qui si calcola un momento istantaneo.', 'Sostituisci F=cd e controlla il dominio dopo la radice.')]
CHOICES={2:2,3:0,4:0,7:0,9:0,10:0,15:2}
UNITS={1:'N·m',5:'N',6:'m',8:'N·m',11:'1',12:'N·m',13:'1',14:'N',16:'m'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/force-couple-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-force-couple-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Momenti e coppie di forze','order':6520+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L010','prerequisites':['C1-L001','C1-L002','C1-L005','C1-L010'],'reuse':['C6'],
            'family':'force-couple','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Risultante e momento sono bilanci distinti; d è la distanza perpendicolare fra le rette.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L010'},
            'coverage':['Momento di una coppia','Risultante nulla e indipendenza dal polo'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Primo esempio: forze opposte da 2 N, frecce 60 px alla scala 30 px/N, rette distanti 200 px cioè 2 m alla scala 100 px/m. Momento +4 N·m antiorario. Traslare il polo di 1 m cambia i bracci singoli ma non il momento totale. Ultimo esempio separato: forze da 5 N, frecce 150 px alla stessa scala, distanza 2 m: risultante zero, momento 10 N·m. Scale delle lunghezze e delle forze distinte.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.force_couple_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'force-couple-065.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'force-couple-065-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
