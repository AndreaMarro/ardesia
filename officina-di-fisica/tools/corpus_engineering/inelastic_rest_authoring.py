"""Author fully inelastic rest-target collisions; no self scientific approval."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='Nel riferimento inerziale del laboratorio un corpo di massa m>0 si muove su una retta orizzontale verso destra con velocità +v, v>0. Urta un bersaglio fermo di massa M=2 kg; i due corpi restano uniti. Il sistema comprende entrambi: durante il breve urto l’impulso esterno totale e il lavoro esterno sono trascurati nel modello. Le masse restano costanti e il moto è classico. L’asse +x è verso destra; V è la velocità comune finale, qui positiva. '
TASKS=[
('Scegliere il sistema prima del bilancio',SCENE+'Con m=2 kg e v=2 m/s, quanto vale V in m/s?',1,
 'Il bersaglio iniziale contribuisce con quantità di moto nulla, ma dopo l’urto fa parte della massa che si muove. L’impulso esterno nullo conserva la quantità di moto dei due corpi insieme: mv=(m+M)V. Quattro kg·m/s si distribuiscono su quattro chilogrammi e danno un metro al secondo.',
 r'mv+M\cdot0=(m+M)V\qquad mv=4\,\mathrm{kg\,m/s}\qquad m+M=4\,\mathrm{kg}\qquad V=1\,\mathrm{m/s}',
 'La velocità è minore di quella incidente. L’energia cinetica iniziale è 4 J, quella finale (1/2)·4·1²=2 J: due joule passano a energia interna nel modello senza lavoro esterno. Non si conserva l’energia cinetica in questo urto completamente anelastico, pur conservandosi la quantità di moto totale.', 'Includi il bersaglio sia nel sistema sia nella massa finale.'),
('La dimensione della velocità comune','Un corpo urta un bersaglio fermo e vi resta attaccato. Con impulso esterno trascurabile, V=mv/(m+M), dove m,M sono masse e v è una velocità. Quale unità SI esprime V?',['kg·m/s','m/s','N','J','kg'],
 'Il numeratore è quantità di moto, il denominatore massa. Le masse si cancellano dimensionalmente e resta una velocità. La somma m+M ha la stessa unità dei singoli termini, non una massa al quadrato.',
 r'[mv]=ML/T\qquad [m+M]=M\qquad [V]=L/T',
 'kg·m/s sarebbe la quantità di moto prima della divisione. N è forza, J energia e kg massa. Non si ottiene la rapidità confrontando soltanto i valori numerici: il bilancio conserva mv, non v.', 'Dividi l’unità della quantità di moto per quella della massa finale.'),
('Che cosa resta uguale quando i corpi si attaccano','Due corpi classici restano uniti dopo un urto. Il sistema comprende entrambi e l’impulso esterno totale è nullo durante il contatto. Quale grandezza del sistema è necessariamente conservata?',['La quantità di moto totale vettoriale','L’energia cinetica totale','La rapidità di ciascun corpo','La quantità di moto del solo primo corpo','La somma delle rapidità'],
 'Per il sistema dei due corpi, l’impulso esterno è la variazione della quantità di moto totale. Se è nullo, tale vettore non cambia. Gli impulsi interni sono opposti e si cancellano nella somma, anche se cambiano molto la quantità di moto di ciascun corpo separatamente.',
 r'\Delta\vec p_{\mathrm{tot}}=\vec J_{\mathrm{ext}}\qquad \vec J_{\mathrm{ext}}=0\qquad \vec p_{\mathrm{tot},f}=\vec p_{\mathrm{tot},i}',
 'Restare attaccati impone velocità finale uguale, non energie cinetiche uguali prima e dopo. Le rapidità iniziali possono cambiare e la loro somma non è il vettore quantità di moto. Il primo corpo da solo riceve un impulso dall’altro, esterno al suo sottosistema: non se ne può imporre la conservazione separata.', 'Applica il teorema dell’impulso al sistema completo, non a un solo corpo.'),
('Più massa incidente con lo stesso bersaglio',SCENE+'v=2 m/s resta uguale; m passa da 2 a 4 kg fra prove distinte. Come cambia V?',['Da 1 a 4/3 m/s','Resta 1 m/s','Da 1 a 2 m/s','Da 1 a 1/2 m/s','Da 1 a 8/3 m/s'],
 'Il primo urto ha V=1 m/s. Nel secondo la quantità di moto incidente è 8 kg·m/s, ma la massa unita non resta quattro: è 4+2=6 kg. Dividendo otto per sei otteniamo 4/3 m/s, ancora minore dei due metri al secondo incidenti.',
 r'V_A=1\,\mathrm{m/s}\qquad p_{i,B}=8\,\mathrm{kg\,m/s}\qquad m_B+M=6\,\mathrm{kg}\qquad V_B=\frac43\,\mathrm{m/s}',
 'Due m/s ignorerebbe il bersaglio fermo; 8/3 userebbe una velocità incidente doppia di quella assegnata. Un mezzo inverte l’effetto e invarianza ignora la diversa frazione m/(m+M). Non basta seguire il solo numeratore: cambia anche la massa finale.', 'Ricalcola sia la quantità di moto iniziale sia la massa totale.'),
('La massa incidente dall’uscita comune',SCENE+'Si misura V=1 m/s e si conosce v=2 m/s. Quanto vale m in kg?',2,
 'Moltiplichiamo V=mv/(m+M) per m+M e raccogliamo i termini con m: MV=m(v−V). Per una massa positiva finita serve 0<V<v. Qui la differenza delle velocità è un metro al secondo, quindi m=(2 kg)·1/1=2 kg.',
 r'V(m+M)=mv\qquad MV=m(v-V)\qquad m=MV/(v-V)\qquad m=2\,\mathrm{kg}',
 'Il controllo 2·2/(2+2)=1 m/s riproduce il dato. V=v richiederebbe un incidente infinitamente massivo rispetto al bersaglio oppure M nullo, esclusi qui; V>v darebbe una massa negativa. La condizione dell’inversa ha quindi significato fisico.', 'Raccogli m e controlla il segno di v−V prima di dividere.'),
('Ricavare la velocità prima dell’urto',SCENE+'Si misura V=1 m/s e si conosce m=2 kg. Quanto vale v in m/s?',2,
 'Dal bilancio mv=(m+M)V dividiamo per m>0. La massa totale è quattro chilogrammi e la quantità di moto finale quattro kg·m/s: la massa incidente due chilogrammi deve avere inizialmente due metri al secondo.',
 r'v=(m+M)V/m\qquad m+M=4\,\mathrm{kg}\qquad v=2\,\mathrm{m/s}',
 'V=1 m/s è l’uscita, non la velocità incidente. Il bersaglio aggiunge massa in moto dopo l’urto e rende necessaria v>V. Nessuna radice da energia cinetica va usata per invertire un urto in cui quella energia non è conservata.', 'Ricostruisci la quantità di moto finale e dividila per la sola massa incidente.'),
('Velocità incidente doppia',SCENE+'m=2 kg resta uguale e v passa da 2 a 4 m/s. Quanto vale V_B/V_A?',['2','1/2','4','1','−2'],
 'La frazione m/(m+M) resta un mezzo. Le due uscite sono uno e due metri al secondo, quindi il rapporto è due. Cambia soltanto la quantità di moto iniziale, non la massa finale unita.',
 r'V_A=1\,\mathrm{m/s}\qquad V_B=2\,\mathrm{m/s}\qquad V_B/V_A=2',
 'Quattro importerebbe il quadrato dell’energia cinetica; un mezzo inverte l’ordine. Uno ignora il nuovo v e il valore negativo contraddice le due velocità finali verso destra. Il confronto non afferma che l’energia cinetica sia conservata in nessuno dei due urti.', 'Con le masse uguali fra prove, V è proporzionale a v.'),
('Una proposta che dimentica il bersaglio',SCENE+'Con m=2 kg,v=2 m/s si propone V_proposto=2 m/s. Quanto vale proposto meno corretto?',['+1 m/s','−1 m/s','+2 m/s','0 m/s','+1/2 m/s'],
 'Il bilancio corretto divide la quantità di moto quattro per la massa totale quattro e dà V=1 m/s. La proposta lascia al gruppo la velocità incidente. La differenza richiesta è due meno uno, cioè +1 m/s.',
 r'V=1\,\mathrm{m/s}\qquad e=(2-1)\,\mathrm{m/s}\qquad e=+1\,\mathrm{m/s}',
 '−1 inverte la sottrazione, due ripete la proposta, zero la accetta e un mezzo dimezza ancora lo scarto. La proposta farebbe crescere la quantità di moto totale da 4 a 8 kg·m/s senza impulso esterno, incompatibile con il sistema assegnato.', 'Confronta le quantità di moto, non soltanto le velocità.'),
('L’inversa richiede V minore di v',SCENE+'Si conoscono v e V con 0<V<v. Quale formula isola m, mantenendo M=2 kg come quantità dimensionale?',['m=MV/(v−V)','m=MV/(v+V)','m=M(v−V)/V','m=MV/(V−v)','m=V/(v−V)'],
 'Espandiamo V(m+M)=mv e spostiamo Vm a destra. Resta MV=m(v−V). Dividiamo per la differenza positiva v−V; il rapporto di due velocità è puro e il fattore M dà i chilogrammi.',
 r'Vm+VM=mv\qquad VM=m(v-V)\qquad m=\frac{MV}{v-V}',
 'Il più al denominatore non isola la stessa equazione; il reciproco M(v−V)/V è diverso e vale solo accidentalmente in un caso speciale. V−v renderebbe m negativa. L’ultima formula manca del fattore massa M e sarebbe adimensionale. Il bersaglio non è il numero puro due.', 'Mantieni M con la sua unità e raccogli m prima dell’inversa.'),
('Scalamenti con bersaglio fisso',SCENE+'Fra prove m_B=κ₁m e v_B=κ₂v, con κ₁,κ₂>0 e m,v riferiti ad A. M resta 2 kg. Definiamo S=m+M e S_B=κ₁m+M. Quanto vale V_B/V_A?',['κ₁ κ₂ S / S_B','κ₁ κ₂ S_B / S','κ₁ κ₂','κ₂ / κ₁','κ₂ S / S_B'],
 'Il nuovo numeratore riceve entrambi i fattori, mentre nel denominatore cambia solo la massa incidente: il bersaglio resta M. Dividendo le due leggi si cancella mv e la somma iniziale S passa al numeratore del rapporto.',
 r'V_A=mv/S\qquad V_B=\kappa_1\kappa_2mv/S_B\qquad V_B/V_A=\kappa_1\kappa_2S/S_B',
 'κ₁κ₂ da solo ignora che cresce anche la massa unita; il rapporto con S e S_B scambiati inverte tale effetto. κ₂/κ₁ tratta male il denominatore fisso M; l’ultima opzione perde κ₁ dal numeratore. Se κ₁=1 il rapporto torna κ₂, come deve per masse invariate.', 'Scala soltanto m nella somma finale, lasciando M fisso.'),
('Due cambiamenti della prova incidente',SCENE+'A usa m=2 kg,v=2 m/s; B usa m=4 kg,v=4 m/s. Quanto vale V_B/V_A?',['8/3','3/8','4','2','4/3'],
 'A dà un metro al secondo. In B la quantità di moto incidente è sedici kg·m/s e la massa finale sei chilogrammi: V_B=16/6=8/3 m/s. Il rapporto a V_A=1 m/s vale 8/3, senza unità.',
 r'V_A=1\,\mathrm{m/s}\qquad V_B=\frac{16}{6}\,\mathrm{m/s}\qquad V_B=\frac83\,\mathrm{m/s}\qquad V_B/V_A=\frac83',
 'Quattro segue soltanto il prodotto mv e dimentica la massa finale maggiore. Due segue soltanto v; 4/3 segue soltanto m. Tre ottavi è il rapporto inverso. Anche V_B<4 m/s controlla la presenza del bersaglio inizialmente fermo.', 'Dividi sedici per sei prima di confrontare le uscite.'),
('Media di velocità comuni dopo urti diversi',SCENE+'A ha m=2 kg,v=2 m/s; B ha m=4 kg,v=4 m/s. Qual è la media aritmetica di V_A,V_B con uguale peso?',['11/6 m/s','11/3 m/s','11/12 m/s','9/5 m/s','5/3 m/s'],
 'Le uscite sono 1 e 8/3 m/s. Scriviamo uno come tre terzi: la somma è 11/3 e la divisione per due dà 11/6 m/s. Gli ingressi medi m=3 kg,v=3 m/s darebbero invece 9/5 m/s, un altro calcolo perché m compare anche al denominatore.',
 r'V_A=1\,\mathrm{m/s}\qquad V_B=\frac83\,\mathrm{m/s}\qquad \overline V=\frac{1+8/3}{2}\,\mathrm{m/s}\qquad \overline V=\frac{11}{6}\,\mathrm{m/s}',
 '11/3 è la somma, 11/12 dimezza ancora e 5/3 è la differenza. 11/6 e 9/5 sono diversi: i prodotti incrociati sono 55 e 54, quindi la differenza è 1/30 m/s. La risposta resta esatta senza decimali.', 'Porta le due uscite a terzi prima della semisomma.'),
('Scegliere la nuova velocità incidente',SCENE+'A ha m_A=2 kg,v_A=2 m/s. Si impone m_B=4 kg e si vuole V_B=(8/3)V_A. Quanto vale v_B/v_A?',2,
 'L’uscita A è un metro al secondo e l’obiettivo B è 8/3 m/s. La massa finale B è sei chilogrammi: la quantità di moto richiesta è (8/3)·6=16 kg·m/s. Divisa per i quattro chilogrammi incidenti dà v_B=4 m/s e rapporto due.',
 r'V_B=\frac83\,\mathrm{m/s}\qquad (m_B+M)V_B=16\,\mathrm{kg\,m/s}\qquad v_B=4\,\mathrm{m/s}\qquad v_B/v_A=2',
 '8/3 è il rapporto delle uscite, non delle velocità incidenti, perché è cambiata anche m/(m+M). Quattro m/s è la nuova velocità e non il rapporto quattro. L’uscita richiesta è minore di v_B, come impone il bersaglio fermo positivo.', 'Ricostruisci la quantità di moto del gruppo e dividila per m_B.'),
('Tarare prima di ricostruire una massa',SCENE+'Un display continuo adimensionale legge S=qV, con q>0 costante e offset nullo. Il riferimento m=2 kg,v=2 m/s dà S=3. Una prova con v=4 m/s dà S=8. Quanto vale m in kg?',4,
 'Il riferimento ha V=1 m/s e quindi q=3 s/m. La lettura otto corrisponde a V=8/3 m/s. Nella formula inversa m=MV/(v−V) la differenza è 4−8/3=4/3 m/s. Dividendo (2 kg)·(8/3 m/s) per 4/3 m/s otteniamo quattro chilogrammi.',
 r'q=3\,\mathrm{s/m}\qquad V=8/q\qquad V=\frac83\,\mathrm{m/s}\qquad v-V=\frac43\,\mathrm{m/s}\qquad m=4\,\mathrm{kg}',
 'Il controllo 4·4/(4+2)=8/3 m/s e S=3·8/3=8 ricostruisce la lettura. Usare otto come velocità SI darebbe V>v e una massa negativa: la contraddizione rivelerebbe la mancata taratura, non un nuovo ramo fisico.', 'Decodifica V e verifica 0<V<v prima dell’inversa.'),
('Una lettura frazionaria con offset',SCENE+'Un display continuo adimensionale legge S=qV+b, con q>0,b costanti. A: m=2 kg,v=2 m/s,S=3. B: m=4 kg,v=4 m/s,S=19/3. C: v=2 m/s,S=11/3. Quanto vale m_C?',['2 kg','3 kg','4 kg','6 kg','8 kg'],
 'Le uscite note sono 1 e 8/3 m/s. Le differenze delle letture e delle velocità sono 10/3 e 5/3 m/s: q=2 s/m e b=1. Per C, 11/3−1=8/3; dividendo per due otteniamo V_C=4/3 m/s. L’inversa dà m_C=(2 kg)(4/3)/(2−4/3)=4 kg.',
 r'q=2\,\mathrm{s/m}\qquad b=1\qquad V_C=\frac43\,\mathrm{m/s}\qquad v-V_C=\frac23\,\mathrm{m/s}\qquad m_C=4\,\mathrm{kg}',
 'Le masse alternative 2,3,6,8 kg a v=2 m/s danno letture 3,17/5,4,21/5, tutte diverse da 11/3. Per confrontare 17/5 con 11/3 basta 51≠55 nei prodotti incrociati. Le letture sono continue e le frazioni non vanno arrotondate.', 'Usa i terzi per sottrarre l’offset e per la differenza v−V_C.'),
('Un vincolo quadratico dopo il bilancio dell’urto',SCENE+'Si selezionano prove con m=cv, dove c=1 kg·s/m è fisso. La massa resta costante durante ogni urto. Si misura V=1 m/s. Quanto vale v in m/s?',2,
 'Sostituendo m=cv si ottiene V=cv²/(cv+M). Per un calcolo breve poniamo v₀=1 m/s e u=v/v₀>0: il vincolo dà m=(1 kg)u. Con M=2 kg e V=1 m/s, dopo aver diviso per le unità comuni rimane 1=u²/(u+2). Eliminiamo il denominatore positivo e fattorizziamo u²−u−2.',
 r'1=u^2/(u+2)\qquad u^2-u-2=0\qquad (u-2)(u+1)=0\qquad u_1=2\qquad u_2=-1\qquad v=2\,\mathrm{m/s}',
 'Le radici alternative sono due e meno uno; solo u=2 è nel dominio e dà m=2 kg. u=−1 non è una rapidità positiva e renderebbe negativa la massa. Ricostruendo V=2·2/(2+2)=1 m/s si verificano vincolo e urto. Il bersaglio M non è stato sommato a una quantità senza unità.', 'Sostituisci il vincolo e usa la velocità di riferimento per lavorare con il numero puro u.')]
CHOICES={2:1,3:0,4:0,7:0,8:0,9:0,10:0,11:0,12:0,15:2}
UNITS={1:'m/s',5:'kg',6:'m/s',13:'1',14:'kg',16:'m/s'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/inelastic-rest-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-inelastic-rest-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Impulso e quantità di moto','order':5720+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L009','prerequisites':['C1-L001','C1-L002','C1-L005','C1-L007','C1-L008','C1-L009'],'reuse':['C6'],
            'family':'inelastic-rest','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Includi entrambi i corpi nel sistema: si conserva la quantità di moto, non l’energia cinetica.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L009'},
            'coverage':['Urto completamente anelastico','Conservazione della quantità di moto totale'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio m=M=2 kg, v=+2 m/s e bersaglio fermo: i corpi si attaccano, V=+1 m/s e quantità di moto totale4kg·m/s prima e dopo. Frecce velocità100 e50px alla stessa scala50px per m/s; disegno corpi senza scala spaziale. Barre energia4J e2J a40px/J:160 e80px;2J diventano energia interna nel modello senza lavoro esterno. Scale dimensionali distinte.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.inelastic_rest_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'inelastic-rest-057.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'inelastic-rest-057-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
