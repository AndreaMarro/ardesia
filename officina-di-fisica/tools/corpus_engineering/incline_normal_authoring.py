"""Author incline-normal drafts; no independent scientific judgement."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

SCENE='Nel riferimento inerziale del laboratorio un corpo di massa costante m>0 resta in contatto con un piano fisso liscio. Agiscono solo il peso e la normale N, qui N indica il suo modulo. Il campo g=10 m/s² è uniforme. L’inclinazione acuta θ resta costante nella prova ed è dato c=cosθ, con 0<c<1. L’asse normale è positivo verso l’esterno: l’accelerazione perpendicolare al piano è nulla, mentre quella parallela può essere diversa da zero. '
TASKS=[
('Equilibrio perpendicolare durante il moto',SCENE+'Con m=2 kg e c=1/2, quanto vale N in newton?',10,
 'Il corpo può accelerare lungo il piano senza staccarsene. Lungo l’asse normale l’accelerazione è nulla: la reazione verso l’esterno bilancia la componente mgc del peso verso il piano. Il peso totale vale 20 N, ma la sua proiezione normale è soltanto la metà.',
 r'N-mgc=0\qquad N=mgc\qquad N=2\times10\times\frac12\,\mathrm N\qquad N=10\,\mathrm N',
 'La normale è positiva e minore del peso, come richiede 0<c<1. Usare direttamente mg darebbe 20 N e confonderebbe il piano inclinato con quello orizzontale. Non abbiamo posto uguale a zero l’accelerazione lungo il piano.', 'Applica Newton nella direzione perpendicolare al piano.'),
('L’unità della reazione di contatto','La reazione normale ha modulo N=mgc, dove m è una massa, g un’accelerazione e c=cosθ un rapporto puro. Quale unità SI misura N?',['kg','m/s²','N','m','s'],
 'Massa per accelerazione è una forza. Il coseno non introduce dimensioni: in un triangolo è un rapporto di due lunghezze. La lettera N del modulo e il simbolo N dell’unità newton sono qui distinti per il loro ruolo nella frase.',
 r'[c]=1\qquad [mgc]=ML/T^2\qquad 1\,\mathrm N=1\,\mathrm{kg\,m/s^2}',
 'kg indica la massa prima della moltiplicazione per g; m/s² indica g, non la forza. Metri e secondi da soli misurano lunghezza e tempo. L’inclinazione modifica il valore della forza, non la sua unità.', 'Il prodotto massa per accelerazione dà newton.'),
('La normale equilibra una componente',SCENE+'Quale formula esprime il modulo della normale?',['N=mg/c','N=mgc','N=mg','N=0','N=mgc²'],
 'La componente del peso diretta dentro il piano è mgc. La normale ha verso opposto e l’accelerazione perpendicolare è zero, perché il piano è fisso e il contatto è mantenuto. La proiezione normale di Newton dà dunque N−mgc=0. L’equilibrio riguarda questa direzione, non l’intero moto.',
 r'P_{\perp}=mgc\qquad N-P_{\perp}=0\qquad N=mgc',
 'mg/c supererebbe il peso nel dominio acuto; mg omette la proiezione. Zero significherebbe assenza di reazione, incompatibile con mgc>0 e con questo contatto. mgc² proietta due volte. La normale non è in generale verticale e non cancella tutto il vettore peso.', 'Scegli la componente del peso perpendicolare, non quella parallela.'),
('Raddoppiare la massa mantenendo il piano',SCENE+'Due prove con c=1/2 usano m₁=2 kg e m₂=4 kg. Come cambia N?',['Da 10 a 20 N','Resta 10 N','Da 10 a 40 N','Da 10 a 5 N','Diventa zero'],
 'La frazione normale del peso resta un mezzo. Il campo è identico e la massa raddoppia, perciò raddoppia anche mgc. Le due masse sono costanti nelle rispettive prove: non si aggiunge materia durante il moto.',
 r'N_1=2\times10\times\frac12\,\mathrm N\qquad N_1=10\,\mathrm N\qquad N_2=4\times10\times\frac12\,\mathrm N\qquad N_2=20\,\mathrm N',
 '40 N è il nuovo peso totale e ignora c. Cinque newton inverte l’effetto della massa; invariabilità e zero ignorano il nuovo carico normale. Anche nella seconda prova N è metà del peso.', 'Con g e c fissati, la normale è proporzionale alla massa.'),
('Ricavare la massa da una forza normale',SCENE+'Si misurano N=10 N e c=1/2. Quanto vale m in kg?',2,
 'Dividiamo N=mgc per il prodotto positivo gc. Il prodotto del campo 10 con un mezzo vale 5 m/s². Dieci newton divisi per cinque metri al secondo quadrato danno due chilogrammi. Il coseno è già noto: non serve ricavare θ.',
 r'm=\frac N{gc}\qquad gc=5\,\mathrm{m/s^2}\qquad m=\frac{10\,\mathrm N}{5\,\mathrm{m/s^2}}\qquad m=2\,\mathrm{kg}',
 'Il controllo 2·10·(1/2)=10 N restituisce la misura. N/g darebbe 1 kg: sarebbe corretto per un piano orizzontale, non per c=1/2. Moltiplicare N per gc avrebbe invece dimensioni diverse da una massa.', 'Calcola prima il prodotto gc al denominatore.'),
('Ricostruire il coseno senza ricostruire l’angolo',SCENE+'Si misurano N=10 N e m=2 kg. Quanto vale c?',['1/4','−1/2','1/2','2','1'],
 'Il peso è mg=20 N. Il rapporto tra normale e peso dà il coseno: 10/20=1/2. Le unità di forza si cancellano. Il risultato richiesto è un rapporto geometrico, non un angolo in gradi.',
 r'mg=20\,\mathrm N\qquad c=\frac N{mg}\qquad c=\frac{10\,\mathrm N}{20\,\mathrm N}\qquad c=\frac12',
 'Due è il rapporto inverso e non può essere il coseno di questo angolo. Il valore negativo viola il dominio acuto; uno descriverebbe il limite orizzontale escluso. Un quarto dimezza ancora il rapporto corretto. La normale resta inferiore al peso.', 'Dividi la normale per il peso totale.'),
('Una componente normale maggiore',SCENE+'Due prove con m=2 kg hanno c₁=1/2 e c₂=4/5. Quanto vale N₂/N₁?',['4/5','5/8','8/5','16/5','3/5'],
 'Il peso è 20 N in entrambe le prove. La prima normale è 10 N, la seconda 16 N. Il rapporto 16/10 si riduce dividendo per due a 8/5. In alternativa il peso comune si cancella e resta (4/5)/(1/2).',
 r'N_1=10\,\mathrm N\qquad N_2=16\,\mathrm N\qquad \frac{N_2}{N_1}=\frac{4/5}{1/2}\qquad \frac{N_2}{N_1}=\frac85',
 '4/5 è il nuovo coseno da solo; 5/8 inverte il confronto; 16/5 raddoppia ancora. 3/5 è l’incremento relativo (16−10)/10. Il maggiore coseno significa una componente normale maggiore, pur restando N₂<mg.', 'Confronta 16 N con 10 N, non con il peso.'),
('Una proposta che usa tutto il peso',SCENE+'Con m=2 kg,c=1/2, viene proposto N_proposto=20 N. Quanto vale proposto meno corretto?',['+10 N','+20 N','−10 N','0 N','+5 N'],
 'La normale corretta è 2·10·(1/2)=10 N. La proposta 20 N è il peso completo e trascura l’inclinazione. Nell’ordine richiesto sottraiamo 10 da 20, ottenendo una sovrastima di 10 N.',
 r'N=10\,\mathrm N\qquad e=(20-10)\,\mathrm N\qquad e=+10\,\mathrm N',
 '−10 N inverte l’ordine; 20 N ripete la proposta. Zero la dichiarerebbe corretta e 5 N dimezza lo scarto. Lo scarto è una differenza di moduli già definiti, non una componente vettoriale della risultante.', 'Calcola mgc prima di sottrarlo dal valore proposto.'),
('Un’inversa con il campo ancora visibile',SCENE+'Quale formula isola m dalla relazione N=mgc?',['m=N/(gc)','m=Ngc','m=gc/N','m=2N/(gc)','m=N/(2gc)'],
 'Il prodotto gc moltiplica la massa. Essendo positivo, può essere portato al denominatore dividendo entrambi i membri. Conserviamo g come quantità con unità m/s²: non sostituiamo il solo numero 10 in una formula dimensionale generale.',
 r'\frac N{gc}=m\qquad m=\frac N{gc}\qquad [N/(gc)]=M',
 'Ngc moltiplica invece di dividere e ha dimensioni errate; gc/N ha dimensione inversa di massa. Il due aggiunto o tolto non deriva dalla proiezione. N/g ometterebbe c e darebbe una massa inferiore a quella ricostruita per c<1.', 'Dividi per entrambi i fattori g e c.'),
('Scalamenti che rispettano un coseno acuto',SCENE+'Fra due prove m₂=κ₁m e c₂=κ₂c, con κ₁,κ₂>0 e 0<κ₂c<1. m,c indicano la prima prova. Quale rapporto N₂/N₁ segue?',['κ₁/κ₂','κ₂/κ₁','κ₁κ₂','κ₁+κ₂','κ₁κ₂²'],
 'Scriviamo N₁=mgc e N₂=(κ₁m)g(κ₂c). Nel rapporto si cancellano m,g,c, tutti non nulli. Resta un fattore per la massa e uno per il coseno. Il vincolo sul secondo coseno è essenziale per mantenere il piano acuto.',
 r'N_1=mgc\qquad N_2=\kappa_1\kappa_2mgc\qquad N_2/N_1=\kappa_1\kappa_2',
 'I quozienti invertirebbero uno degli effetti; la somma non nasce da un prodotto. κ₁κ₂² proietta due volte il cambiamento di c. Non basta che κ₂ sia positivo: per esempio c=1/2 e κ₂=3 darebbero c₂=3/2, fuori dal modello.', 'Scala una sola volta la massa e una sola volta il coseno.'),
('Più massa e più componente normale',SCENE+'Le prove hanno (m₁=2 kg,c₁=1/2) e (m₂=4 kg,c₂=4/5). Quanto vale N₂/N₁?',['16/5','5/16','2','8/5','32/5'],
 'La prima normale è 10 N. La seconda usa peso 40 N e coseno 4/5: dividiamo 40 per cinque e moltiplichiamo per quattro, ottenendo 32 N. Il rapporto è 32/10=16/5, puro.',
 r'N_1=10\,\mathrm N\qquad N_2=40\times\frac45\,\mathrm N\qquad N_2=32\,\mathrm N\qquad N_2/N_1=\frac{16}5',
 'Due considera solo la massa; 8/5 solo il coseno. 5/16 inverte il confronto e 32/5 raddoppia ancora. Il prodotto dei fattori 2·(8/5)=16/5 conferma il rapporto delle forze calcolate separatamente.', 'Calcola 40·4/5 semplificando 40/5 prima del prodotto.'),
('Mediare le forze dopo le proiezioni',SCENE+'Due prove hanno (m=2 kg,c=1/2) e (m=4 kg,c=4/5). Qual è la media aritmetica delle due normali con uguale peso statistico?',['21 N','42 N','21/2 N','39/2 N','22 N'],
 'Le due uscite sono 10 e 32 N. Sommiamo e poi dividiamo per due: 42/2=21 N. Mediare prima massa e coseno è un’altra operazione, perché nella legge compaiono moltiplicati: le loro medie sono 3 kg e 13/20.',
 r'N_1=10\,\mathrm N\qquad N_2=32\,\mathrm N\qquad \overline N=\frac{10+32}{2}\,\mathrm N\qquad \overline N=21\,\mathrm N',
 '42 N è la somma, 21/2 N dimezza ancora e 22 N è la differenza. Gli ingressi medi darebbero 3·10·13/20=39/2 N, non la media richiesta. Ventuno è correttamente compreso fra 10 e 32.', 'Usa come dati della media le due forze, non i due coseni.'),
('Scegliere il nuovo coseno',SCENE+'La prima prova ha m₁=2 kg,c₁=1/2. Si impone m₂=4 kg e si vuole N₂=(16/5)N₁. Quanto vale c₂/c₁?',['8/5','5/8','16/5','4/5','2'],
 'La forza iniziale è 10 N, quindi l’obiettivo è 32 N. Il nuovo peso vale 40 N: c₂=N₂/(m₂g)=32/40=4/5. Dividendo per il coseno iniziale 1/2 troviamo 8/5. Il nuovo coseno è nel dominio acuto.',
 r'N_2=32\,\mathrm N\qquad m_2g=40\,\mathrm N\qquad c_2=\frac45\qquad c_2/c_1=\frac85',
 '4/5 è solo c₂; 5/8 è il rapporto inverso. 16/5 copia il rapporto delle forze e dimentica la massa doppia. Due darebbe c₂=1, limite orizzontale escluso, con N₂=40 N. Non occorre calcolare θ₂.', 'Ricava prima c₂ dividendo la forza obiettivo per il nuovo peso.'),
('Un display da convertire in newton',SCENE+'Un display ideale legge S=qN, continuo e adimensionale, con q>0 costante e offset nullo. Il riferimento m=2 kg,c=1/2 dà S=30. La nuova prova dà S=96 e c=4/5. Quanto vale m in kg?',4,
 'Il riferimento ha N=10 N e quindi q=30/(10 N)=3 N⁻¹. La lettura 96 corrisponde a 32 N. Il prodotto gc è 10·4/5=8 m/s²: la massa cercata è 32/8=4 kg.',
 r'q=3\,\mathrm{N^{-1}}\qquad N=\frac{96}{q}\qquad N=32\,\mathrm N\qquad gc=8\,\mathrm{m/s^2}\qquad m=4\,\mathrm{kg}',
 'Il controllo 4·10·4/5=32 N e 3·32=96 ricostruisce entrambe le tappe. Interpretare S come chilogrammi o newton senza q salterebbe la taratura. La lettura continua non è un numero obbligatoriamente intero di tacche.', 'Converti S in normale, poi dividi per gc.'),
('Una taratura affine prima della massa',SCENE+'Un display ideale legge S=qN+b, continuo e adimensionale, con q>0,b costanti. I riferimenti (m=2 kg,c=1/2) e (m=4 kg,c=4/5) danno S=21 e 65. La prova ignota ha c=1/2,S=41. Quanto vale m?',['5 kg','3 kg','4 kg','8 kg','2 kg'],
 'Le normali di riferimento sono 10 e 32 N: la loro differenza è 22 N, quella delle letture è 44. Perciò q=2 N⁻¹. Dal primo riferimento b=21−2·10=1. La lettura 41, corretta per l’offset, dà N=20 N; divisa per gc=5 m/s² dà m=4 kg.',
 r'q=\frac{65-21}{(32-10)\,\mathrm N}\qquad q=2\,\mathrm{N^{-1}}\qquad b=1\qquad N=\frac{41-1}{q}\qquad N=20\,\mathrm N\qquad m=4\,\mathrm{kg}',
 'Ogni chilogrammo produce qui 5 N e quindi 10 unità di lettura oltre all’offset. Le masse 5,3,8,2 kg darebbero rispettivamente S=51,31,81,21, tutte diverse da 41. Non basta riconoscere un riferimento: si deve applicare l’inversa tarata.', 'Sottrai uno alla lettura prima di dividere per due.'),
('Un carico legato al coseno fra prove',SCENE+'Si selezionano prove con m=kc, dove k=4 kg è fisso. Il vincolo lega prove diverse, con massa e inclinazione costanti in ciascuna. Si misura N=10 N. Quanto vale c?',['1/4','3/2','−1/2','1/2','1'],
 'Sostituendo m=kc in N=mgc otteniamo N=kgc². Il prodotto kg vale 40 N: c²=10/40=1/4. La radice positiva è 1/2; la negativa è esclusa dal coseno acuto. La massa ricostruita è k/2=2 kg.',
 r'N=kgc^2\qquad kg=40\,\mathrm N\qquad c^2=\frac14\qquad c=\frac12\qquad m=2\,\mathrm{kg}',
 'c=1/4 produrrebbe N=40/16=5/2 N. Il valore 3/2 supera il limite del coseno, −1/2 è negativo e 1 è il limite orizzontale escluso. Esistenza e unicità nel dominio acuto richiedono 0<N<kg, qui 0<10<40 N. Non varia la massa durante un singolo moto.', 'La relazione tra prove introduce un quadrato; scegli il ramo 0<c<1.')]
CHOICES={2:2,3:1,4:0,6:2,7:2,8:0,9:0,10:2,11:0,12:0,13:0,15:2,16:3}
UNITS={1:'N',5:'kg',14:'kg'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/incline-normal-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-incline-normal-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Dinamica delle forze','order':3720+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L005','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005'],'reuse':['C6'],
            'family':'incline-normal','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Usa c già dato e poni a zero soltanto l’accelerazione perpendicolare.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L005'},
            'coverage':['Reazione normale sul piano inclinato','Equilibrio nella direzione normale'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (3,7):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio con m=2 kg,g=10 m/s²,c=4/5 e sinθ=3/5 già dati: normale 16 N, peso 20 N e componente normale del peso 16 N. Geometria 3–4–5; forze a 5 px/N, uguale scala per le due forze normali opposte. Il bilancio nullo riguarda soltanto la direzione perpendicolare.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.incline_normal_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'incline-normal-037.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'incline-normal-037-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
