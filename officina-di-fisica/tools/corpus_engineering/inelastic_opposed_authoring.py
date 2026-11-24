"""Author equal-mass opposed inelastic collisions; separate review remains open."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='Nel riferimento inerziale del laboratorio due corpi classici di uguale massa m>0 si muovono lungo la stessa retta uno verso l’altro. L’asse +x è verso destra: il primo ha velocità +u, il secondo −w, con rapidità u>w>0. Restano uniti dopo l’urto. Il sistema comprende entrambi, con impulso esterno totale e lavoro esterno trascurati durante il contatto; le masse restano costanti. V indica la componente della velocità finale comune, positiva nel dominio assegnato. '
TASKS=[
('Somma orientata delle quantità di moto',SCENE+'Con u=4 m/s,w=1 m/s, quanto vale V?',['3/2 m/s','5/2 m/s','3 m/s','−3/2 m/s','0 m/s'],
 'Le quantità di moto iniziali hanno segno opposto: p_i=mu−mw. Dopo l’urto la massa unita è 2m e si muove con un’unica V. Dividendo m(u−w)=2mV per la massa positiva rimane V=(u−w)/2. Quattro meno uno dà tre, diviso due.',
 r'mu-mw=2mV\qquad V=(u-w)/2\qquad V=\frac32\,\mathrm{m/s}',
 'Il segno è verso destra, perché u>w a masse uguali. Sommare le rapidità darebbe 5/2 m/s e perderebbe il verso del secondo corpo; tre dimentica la massa finale doppia. L’energia cinetica diminuisce: la perdita è m(u+w)²/4>0 nel modello senza lavoro esterno, anche se p totale resta conservata.', 'Assegna −w alla velocità del corpo che arriva da destra.'),
('La massa si cancella, la velocità no','In un urto completamente anelastico fra due masse uguali, con velocità iniziali +u e −w, si ottiene V=(u−w)/2. Quale unità SI esprime V?',['kg·m/s','m/s','N','J','1'],
 'u e w sono rapidità espresse nella stessa unità e la loro differenza, con i versi già incorporati, è ancora una velocità. Il divisore due è puro: non cambia la dimensione. La cancellazione delle masse non rende V adimensionale.',
 r'[u-w]=L/T\qquad [V]=L/T',
 'kg·m/s è quantità di moto prima della divisione per massa finale; N forza e J energia. Uno puro non è una velocità. È necessario sommare quantità di moto orientate prima di passare alla velocità comune.', 'Il due è un numero puro che divide una differenza di velocità.'),
('La differenza nasce dal verso opposto',SCENE+'Quale formula dà V?',['V=(u−w)/2','V=(u+w)/2','V=u−w','V=(w−u)/2','V=(u−w)/4'],
 'Il primo corpo contribuisce con +mu, il secondo con −mw. Con impulso esterno nullo la somma resta uguale alla quantità di moto finale (2m)V. Le due masse uguali si raccolgono dopo l’urto e producono il divisore due.',
 r'p_i=m(u-w)\qquad p_f=2mV\qquad m(u-w)=2mV\qquad V=(u-w)/2',
 'Il più tratta i due moti come concordi; u−w dimentica che dopo si muove massa doppia. Il reciproco d’ordine w−u dà il verso sbagliato nel dominio u>w; il quattro dimezza ancora V. Le rapidità non si conservano: si conserva la quantità di moto totale con segno.', 'Somma prima i vettori quantità di moto, poi dividi per 2m.'),
('Aumentare la rapidità verso destra',SCENE+'w=1 m/s resta uguale e u passa da 4 a 6 m/s. Come cambia V?',['Da 3/2 a 5/2 m/s','Resta 3/2 m/s','Da 3/2 a 9/4 m/s','Da 3/2 a 3 m/s','Diventa zero'],
 'La prima differenza u−w è tre metri al secondo, la seconda cinque. Dividendo entrambe per due troviamo 3/2 e 5/2 m/s. V non è direttamente proporzionale al solo u quando w resta un termine sottratto non nullo.',
 r'V_A=\frac{4-1}{2}\,\mathrm{m/s}\qquad V_A=\frac32\,\mathrm{m/s}\qquad V_B=\frac{6-1}{2}\,\mathrm{m/s}\qquad V_B=\frac52\,\mathrm{m/s}',
 '9/4 scalerebbe V_A col rapporto lineare 6/4, ignorando il termine w fisso. Tre m/s ometterebbe w nella seconda prova; invarianza e zero ignorano lo squilibrio maggiore verso destra. Entrambi gli urti mantengono u>w.', 'Ricalcola la differenza prima di dividerla per due.'),
('Ricavare la rapidità verso destra',SCENE+'Si misura V=3/2 m/s e si conosce w=1 m/s. Quanto vale u in m/s?',4,
 'Moltiplichiamo V=(u−w)/2 per due e aggiungiamo w. Il doppio di 3/2 m/s è tre metri al secondo; aggiungendo il metro al secondo assegnato otteniamo u=4 m/s. La soluzione è maggiore di w, come richiede V positivo.',
 r'2V=u-w\qquad u=2V+w\qquad u=(3+1)\,\mathrm{m/s}\qquad u=4\,\mathrm{m/s}',
 'Usare 2V−w darebbe due m/s e produrrebbe V=1/2 m/s, non 3/2. La rapidità w positiva rappresenta una velocità negativa nell’asse: aggiungerla nell’inversa recupera la sottrazione presente nel bilancio diretto.', 'Rimuovi il mezzo e poi riporta w dall’altro lato.'),
('Ricavare la rapidità del corpo verso sinistra',SCENE+'Si misura V=3/2 m/s e si conosce u=4 m/s. Quanto vale w in m/s?',1,
 'Dalla differenza u−w=2V isoliamo w=u−2V. Il doppio dell’uscita è tre metri al secondo, quindi quattro meno tre dà un metro al secondo. Questo è il modulo della velocità iniziale verso sinistra, non la sua componente negativa.',
 r'w=u-2V\qquad w=(4-3)\,\mathrm{m/s}\qquad w=1\,\mathrm{m/s}',
 'La componente iniziale del secondo corpo è −1 m/s, mentre w è positivo. L’inversa richiede 0<V<u/2 per mantenere w>0; qui 3/2<2. A V=u/2 il secondo corpo sarebbe fermo, escluso dal dominio w>0.', 'Sottrai 2V da u e controlla che il modulo trovato sia positivo.'),
('Un contributo maggiore verso sinistra',SCENE+'u=4 m/s resta uguale e w passa da 1 a 2 m/s. Quanto vale V_B/V_A?',['2/3','3/2','2','1/2','1/3'],
 'La quantità di moto del corpo verso sinistra cresce in modulo e riduce quella totale verso destra. Le uscite sono V_A=3/2 m/s e V_B=1 m/s. Dividere uno per tre mezzi equivale a moltiplicare per due terzi.',
 r'V_A=\frac32\,\mathrm{m/s}\qquad V_B=1\,\mathrm{m/s}\qquad V_B/V_A=\frac1{3/2}\qquad V_B/V_A=\frac23',
 'Tre mezzi inverte il confronto; due segue w come fosse un fattore di tutta V. Un mezzo presume una semplice dipendenza inversa; un terzo è la diminuzione relativa (3/2−1)/(3/2), non il rapporto finale su iniziale. Il secondo urto ha ancora 4>2, perciò V resta verso destra.', 'Confronta 1 con 3/2, non le sole rapidità w.'),
('Scarto da una proposta senza il divisore due',SCENE+'Con u=4 m/s,w=1 m/s si propone V_proposto=3 m/s. Quanto vale proposto meno corretto?',['+3/2 m/s','−3/2 m/s','+3 m/s','0 m/s','+3/4 m/s'],
 'Il risultato corretto è (4−1)/2=3/2 m/s. Scrivendo la proposta tre come sei mezzi, lo scarto è (6−3)/2=+3/2 m/s. La proposta ha usato u−w senza dividere per la massa finale doppia.',
 r'V=\frac32\,\mathrm{m/s}\qquad e=\left(3-\frac32\right)\,\mathrm{m/s}\qquad e=+\frac32\,\mathrm{m/s}',
 '−3/2 cambia l’ordine; tre ripete la proposta; zero la accetta; 3/4 divide ancora lo scarto. La risposta è una differenza di velocità orientate già verso destra nel dominio, non la rapidità iniziale di uno dei corpi.', 'Porta tre a sei mezzi prima della sottrazione.'),
('Un’inversa lineare con segni espliciti',SCENE+'Quale formula isola u dalla relazione V=(u−w)/2?',['u=2V+w','u=2V−w','u=V/2+w','u=2(V+w)','u=w−2V'],
 'Moltiplicare per due elimina il denominatore e dà 2V=u−w. Aggiungendo w a entrambi i membri si ottiene u=2V+w. La positività di V e w rende automaticamente u>w.',
 r'2V=u-w\qquad 2V+w=u\qquad u=2V+w',
 'Il meno davanti a w non elimina la sottrazione; V/2 dimezza invece di raddoppiare. 2(V+w) raddoppia anche w, che non era diviso per due nell’inversa già sviluppata; w−2V inverte il verso della differenza. Tutti i termini devono conservare unità di velocità.', 'Aggiungi w soltanto dopo aver tolto il divisore due.'),
('Cambiare separatamente i due moti iniziali',SCENE+'B usa u_B=κ₁u,w_B=κ₂w, con κ₁,κ₂>0 e κ₁u>κ₂w; u,w sono riferiti ad A. Quanto vale V_B/V_A?',['(κ₁ u − κ₂ w) / (u − w)','κ₁ κ₂','κ₁ / κ₂','(u − w) / (κ₁ u − κ₂ w)','2 (κ₁ u − κ₂ w) / (u − w)'],
 'La seconda differenza contiene i fattori sui rispettivi termini. Il mezzo comune alle due velocità si cancella nel rapporto. Resta una differenza divisa per l’altra, con denominatore e numeratore positivi per i due domini dichiarati.',
 r'V_A=(u-w)/2\qquad V_B=(\kappa_1u-\kappa_2w)/2\qquad \frac{V_B}{V_A}=\frac{\kappa_1u-\kappa_2w}{u-w}',
 'Prodotto e quoziente dei soli fattori non descrivono una sottrazione. L’inverso scambia A e B; il due aggiuntivo non si cancella correttamente. Se κ₁=κ₂=κ, la differenza comune scala di κ e il rapporto torna κ. Se si violasse κ₁u>κ₂w si cambierebbe il verso finale, uscendo dal dominio scelto.', 'Tieni insieme ogni differenza di velocità prima di fare il rapporto.'),
('Due nuovi valori opposti',SCENE+'A usa u=4 m/s,w=1 m/s; B usa u=6 m/s,w=2 m/s. Quanto vale V_B/V_A?',['4/3','3/4','3/2','2','8/3'],
 'A dà V_A=3/2 m/s. In B la differenza sei meno due vale quattro metri al secondo e la massa finale doppia porta V_B=2 m/s. Il rapporto due diviso tre mezzi vale quattro terzi.',
 r'V_A=\frac32\,\mathrm{m/s}\qquad V_B=2\,\mathrm{m/s}\qquad V_B/V_A=\frac2{3/2}\qquad V_B/V_A=\frac43',
 'Tre quarti è il reciproco; tre mezzi segue solo u e due solo w, che entra con segno sottratto. Otto terzi raddoppia il rapporto corretto. Le masse uguali si sono cancellate e non occorre assegnarne un valore per trovare V.', 'Usa il reciproco di 3/2 nella divisione.'),
('Media di due differenze lineari',SCENE+'A ha u=4 m/s,w=1 m/s; B ha u=6 m/s,w=2 m/s. Qual è la media aritmetica di V_A,V_B con uguale peso?',['7/4 m/s','7/2 m/s','7/8 m/s','1/2 m/s','2 m/s'],
 'Le uscite sono 3/2 e 2 m/s. Scriviamo due come quattro mezzi: la somma è sette mezzi e la divisione per due dà sette quarti. Qui la legge è lineare nella differenza: anche i dati medi u=5 m/s,w=3/2 m/s danno (5−3/2)/2=7/4 m/s.',
 r'V_A=\frac32\,\mathrm{m/s}\qquad V_B=2\,\mathrm{m/s}\qquad \overline V=\frac{3/2+2}{2}\,\mathrm{m/s}\qquad \overline V=\frac74\,\mathrm{m/s}',
 'Sette mezzi è la somma, sette ottavi dimezza ancora, un mezzo è la differenza e due ripete solo B. La coincidenza con la risposta agli ingressi medi è giustificata dalla linearità della sottrazione e del fattore 1/2; non va negata per abitudine a modelli non lineari.', 'Porta entrambe le uscite a mezzi e poi fai la semisomma.'),
('Scegliere la nuova rapidità verso sinistra',SCENE+'A ha u_A=4 m/s,w_A=1 m/s. Si impone u_B=6 m/s e si vuole V_B=(4/3)V_A. Quanto vale w_B/w_A?',2,
 'L’uscita iniziale è tre mezzi e l’obiettivo è (4/3)(3/2)=2 m/s. Nell’inversa w_B=u_B−2V_B troviamo sei meno quattro, cioè due metri al secondo. Dividendo per w_A=1 m/s il rapporto è due.',
 r'V_B=2\,\mathrm{m/s}\qquad w_B=u_B-2V_B\qquad w_B=2\,\mathrm{m/s}\qquad w_B/w_A=2',
 'Lasciare w a un metro al secondo darebbe V_B=5/2 m/s, non due. Quattro terzi è il rapporto delle uscite, non quello di w. Il valore trovato soddisfa 0<w_B<u_B e mantiene il moto finale verso destra.', 'Ricava w_B dalla differenza dopo aver calcolato l’obiettivo V_B.'),
('Una taratura con riferimento frazionario',SCENE+'Un display continuo adimensionale legge S=qV, con q>0 costante e offset nullo. Il riferimento u=4 m/s,w=1 m/s dà S=9/2. Una prova con w=2 m/s dà S=6. Quanto vale u in m/s?',6,
 'Il riferimento ha V=3/2 m/s. Il rapporto (9/2)/(3/2) vale tre e dà q=3 s/m. La lettura sei significa V=2 m/s. Recuperiamo u=2V+w=4+2=6 m/s, con una frazione esatta nella sola taratura.',
 r'q=3\,\mathrm{s/m}\qquad V=6/q\qquad V=2\,\mathrm{m/s}\qquad u=2V+w\qquad u=6\,\mathrm{m/s}',
 'Usare S=6 come velocità SI darebbe u=14 m/s, includendo indebitamente il guadagno. Con u=6,w=2 si trova V=2 e S=3·2=6. Il display è continuo: 9/2 non è un numero obbligatoriamente intero di tacche.', 'Dividi le due metà del riferimento prima di usare l’inversa u=2V+w.'),
('Guadagno e offset per una velocità orientata',SCENE+'Un display continuo adimensionale legge S=qV+b, con q>0,b costanti. A: u=4 m/s,w=1 m/s,S=4. B: u=6 m/s,w=2 m/s,S=5. C: w=1 m/s,S=6. Quanto vale u_C?',['4 m/s','5 m/s','6 m/s','7 m/s','12 m/s'],
 'Le uscite note sono 3/2 e 2 m/s, differenti di un mezzo. La differenza delle letture è uno: q=2 s/m. Dal primo riferimento b=4−2·3/2=1. La lettura sei corrisponde a V_C=5/2 m/s; poi u_C=2·5/2+1=6 m/s.',
 r'q=2\,\mathrm{s/m}\qquad b=1\qquad V_C=(6-1)/q\qquad V_C=\frac52\,\mathrm{m/s}\qquad u_C=6\,\mathrm{m/s}',
 'Con w_C=1 m/s le alternative u=4,5,7,12 m/s darebbero S=4,5,7,12: soltanto sei restituisce la lettura assegnata. L’uguaglianza numerica tra u_C e S_C in questo caso non è una conversione universale: deriva proprio da questa taratura e da w_C.', 'Sottrai l’offset prima di dividere per q e poi recupera u_C.'),
('Un vincolo che lascia una sola potenza',SCENE+'Fra prove si impone u=4w. Si misura V=3/2 m/s. Quanto vale w in m/s?',1,
 'Inseriamo il vincolo nella differenza, non in un’energia cinetica: V=(4w−w)/2=3w/2. Moltiplicando V per due terzi otteniamo w=(2/3)(3/2)=1 m/s. La rapidità verso destra risulta u=4 m/s.',
 r'V=(4w-w)/2\qquad V=3w/2\qquad w=2V/3\qquad w=1\,\mathrm{m/s}\qquad u=4\,\mathrm{m/s}',
 'La soluzione positiva è unica: la legge è lineare in w e non richiede radici. Con w=2 m/s si avrebbe V=3 m/s; w=0 darebbe V=0 ed è escluso. Il vincolo u=4w garantisce u>w per ogni w positivo.', 'Semplifica 4w−w prima di isolare la rapidità positiva.')]
CHOICES={1:0,2:1,3:0,4:0,7:0,8:0,9:0,10:0,11:0,12:0,15:2}
UNITS={5:'m/s',6:'m/s',13:'1',14:'m/s',16:'m/s'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/inelastic-opposed-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-inelastic-opposed-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Impulso e quantità di moto','order':5820+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L009','prerequisites':['C1-L001','C1-L002','C1-L005','C1-L007','C1-L008','C1-L009'],'reuse':['C6'],
            'family':'inelastic-opposed','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Includi entrambi i corpi nel sistema: si conserva la quantità di moto, non l’energia cinetica.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L009'},
            'coverage':['Urto frontale fra masse uguali','Velocità orientate e quantità di moto'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio u4m/s,w1m/s e masse uguali illustrative4kg: velocità iniziali+4 e−1, finale+3/2m/s, frecce160,40,60px alla stessa scala40px per m/s. Quantità di moto totale+12kg·m/s prima e dopo. Senza lavoro esterno: Ki34J170px,Kf9J45px alla scala distinta5px/J;25J diventano energia interna. Masseuguali si cancellano nella formula generale di V; corpi senza scala spaziale.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.inelastic_opposed_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'inelastic-opposed-058.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'inelastic-opposed-058-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
