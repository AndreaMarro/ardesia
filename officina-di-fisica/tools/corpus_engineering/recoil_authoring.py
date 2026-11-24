"""Author isolated discrete recoil editions; no scientific self approval."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='Nel riferimento inerziale del laboratorio un dispositivo con il corpo da emettere è inizialmente fermo. Il sistema comprende entrambi. Dopo una singola emissione il corpo ha massa m>0 e velocità +v verso destra nel laboratorio, v>0; il dispositivo residuo ha massa fissa M=2 kg e velocità −U, con U>0 modulo del rinculo. Impulso e lavoro esterni durante l’emissione sono trascurati; le velocità sono nel regime classico e l’energia interna disponibile può alimentare l’emissione. La massa iniziale complessiva è M+m. '
TASKS=[
('Somma finale nulla, velocità opposte',SCENE+'Con m=2 kg e v=2 m/s, quanto vale U in m/s?',2,
 'La quantità di moto totale iniziale è zero. Dopo l’emissione il corpo porta +mv e il dispositivo −MU: la loro somma deve restare nulla. Isolando il modulo del rinculo otteniamo U=mv/M. Quattro kg·m/s del corpo emesso richiedono −4 kg·m/s del residuo, quindi U=2 m/s.',
 r'mv-MU=0\qquad MU=mv\qquad U=mv/M\qquad U=2\,\mathrm{m/s}',
 'La velocità orientata del dispositivo è −2 m/s, mentre il suo modulo U è positivo. Le energie cinetiche finali sono 4 J per il corpo e 4 J per il residuo: gli 8 J complessivi provengono dall’energia interna nel modello senza lavoro esterno, non da una quantità di moto iniziale nascosta. La sola energia cinetica non si conserva.', 'Imponi quantità di moto totale zero usando +v e −U.'),
('La dimensione del modulo di rinculo','In un sistema inizialmente fermo e con impulso esterno nullo, dopo l’emissione U=mv/M. m e M sono masse e v è la rapidità del corpo emesso nel laboratorio. Quale unità SI esprime U?',['kg·m/s','m/s','N','J','kg'],
 'La quantità di moto mv è divisa per la massa residua M. Si cancellano i chilogrammi e rimangono metri al secondo. Il rapporto m/M è puro e cambia il valore della velocità, non la sua dimensione.',
 r'[mv]=ML/T\qquad [M]=M\qquad [U]=L/T',
 'kg·m/s sarebbe la quantità di moto da equilibrare; N è forza, J energia e kg massa. Il segno negativo della componente del rinculo non ne cambia l’unità. U è una rapidità, non la quantità di moto totale che qui resta zero.', 'Dividi una quantità di moto per la massa del residuo.'),
('Il modulo non porta il meno della componente',SCENE+'Quale formula dà U?',['U=mv/M','U=−mv/M','U=mv/(M+m)','U=Mv/m','U=mv'],
 'Il bilancio orientato è mv+M(−U)=0. Il termine negativo indica il verso del residuo; portandolo dall’altro lato MU=mv e dividendo per M>0 troviamo un modulo positivo. La massa al denominatore è quella residua dopo l’emissione, già data come M.',
 r'mv+M(-U)=0\qquad MU=mv\qquad U=mv/M',
 '−mv/M sarebbe la componente del dispositivo, non il modulo U. M+m al denominatore non descrive questo dato v: la rapidità emessa è nel laboratorio, non relativa al dispositivo. Mv/m scambia le masse; mv da solo ha dimensione quantità di moto. La massa iniziale M+m non è la massa che rincula dopo.', 'Usa la massa residua e tieni distinto il verso dal modulo.'),
('Più massa emessa con residuo uguale',SCENE+'Fra prove distinte M resta 2 kg,v=2 m/s e m passa da 2 a 4 kg. Come cambia U?',['Da 2 a 4 m/s','Resta 2 m/s','Da 2 a 8 m/s','Da 2 a 1 m/s','Diventa zero'],
 'La quantità di moto emessa raddoppia da quattro a otto kg·m/s. Per equilibrare il nuovo valore con la stessa massa residua due chilogrammi, il modulo del rinculo raddoppia. La massa iniziale complessiva è diversa fra prove, ma M è già la stessa massa finale assegnata.',
 r'U_A=2\,\mathrm{m/s}\qquad p_{e,B}=8\,\mathrm{kg\,m/s}\qquad U_B=4\,\mathrm{m/s}',
 'Otto confonderebbe quantità di moto e rapidità; uno inverte l’effetto di m. Non si deve ridurre M sottraendo ancora m: M è dichiarata residua. Con m>M è ammissibile U>v, come qui 4>2 m/s; non è l’urto contro un bersaglio fermo che impone un’uscita inferiore alla velocità incidente.', 'Mantieni M=2 kg al denominatore e cambia soltanto m.'),
('Ricostruire la massa emessa',SCENE+'Si misura U=2 m/s e si conosce v=2 m/s nel laboratorio. Quanto vale m in kg?',2,
 'Da MU=mv dividiamo per v>0. Il rapporto delle rapidità è puro e moltiplica la massa residua: m=M U/v. Qui U=v, perciò le due masse finali devono essere uguali e m=2 kg.',
 r'm=MU/v\qquad m=(2\,\mathrm{kg})\frac{2\,\mathrm{m/s}}{2\,\mathrm{m/s}}\qquad m=2\,\mathrm{kg}',
 'Il controllo m v=4 kg·m/s e M(−U)=−4 kg·m/s dà totale zero. Non serve una legge di conservazione dell’energia cinetica: l’energia interna alimenta l’emissione e non è stata assegnata come vincolo numerico aggiuntivo.', 'Dividi la quantità di moto del residuo per la rapidità emessa nel laboratorio.'),
('Ricostruire la rapidità nel laboratorio',SCENE+'Si misura U=2 m/s e si conosce m=2 kg. Quanto vale v in m/s?',2,
 'L’uguaglianza dei moduli delle quantità di moto è mv=MU. Dividendo per m positivo otteniamo v=MU/m. Con le due masse entrambe due chilogrammi il rapporto vale uno e la rapidità emessa nel laboratorio è due metri al secondo.',
 r'v=MU/m\qquad v=2\,\mathrm{m/s}',
 'La rapidità relativa del corpo rispetto al dispositivo sarebbe v+U=4 m/s, perché i versi sono opposti. È una grandezza diversa da quella richiesta, riferita al laboratorio. Usare quattro come v cambierebbe la quantità di moto emessa e non restituirebbe il rinculo assegnato.', 'Mantieni v riferita al laboratorio, non al dispositivo che si muove.'),
('Rapidità emessa doppia',SCENE+'Con m=M=2 kg, v passa da 2 a 4 m/s fra prove. Quanto vale U_B/U_A?',['2','1/2','4','1','−2'],
 'Il rapporto m/M resta uno, quindi U segue linearmente la rapidità emessa nel laboratorio. Le due rapidità di rinculo sono due e quattro metri al secondo. Il loro rapporto è due, mentre le componenti orientate del dispositivo sono entrambe negative.',
 r'U_A=2\,\mathrm{m/s}\qquad U_B=4\,\mathrm{m/s}\qquad U_B/U_A=2',
 'Un mezzo inverte il rapporto; quattro importa il quadrato dell’energia cinetica; uno ignora la nuova v. Il rapporto −2 non confronta due moduli positivi. La direzione del rinculo resta opposta al corpo emesso.', 'Con le masse fisse confronta i due valori di v.'),
('Scarto di una proposta doppia',SCENE+'Con m=2 kg,v=2 m/s si propone U_proposto=4 m/s. Quanto vale proposto meno corretto?',['+2 m/s','−2 m/s','+4 m/s','0 m/s','+1 m/s'],
 'La quantità di moto emessa è quattro kg·m/s, da dividere per i due chilogrammi residui: U=2 m/s. La proposta quattro supera il corretto di due metri al secondo. Lo scarto è positivo anche se la componente del rinculo lungo x è negativa.',
 r'U=2\,\mathrm{m/s}\qquad e=(4-2)\,\mathrm{m/s}\qquad e=+2\,\mathrm{m/s}',
 '−2 cambia l’ordine della sottrazione; quattro ripete la proposta, zero la accetta e uno dimezza ancora lo scarto. Un rinculo di modulo quattro darebbe −8 kg·m/s al residuo contro +4 kg·m/s emessi: non conserverebbe la quantità di moto totale iniziale zero.', 'Dividi mv per M e poi confronta i due moduli.'),
('L’inversa conserva una massa dimensionale',SCENE+'Quale formula isola m dalla relazione U=mv/M?',['m=MU/v','m=Uv/M','m=Mv/U','m=−MU/v','m=U/v'],
 'Moltiplichiamo per M per ricostruire la quantità di moto del residuo e dividiamo per la rapidità positiva v. L’unità di velocità si cancella nel rapporto U/v, mentre M porta la dimensione di massa.',
 r'MU=mv\qquad MU/v=m\qquad m=MU/v',
 'Uv/M ha dimensioni diverse da massa; Mv/U scambia il rapporto dei moduli. Il meno non appartiene a un’inversa tra grandezze positive. U/v da solo sarebbe puro, perché il fattore M=2 kg non è il semplice numero due.', 'Mantieni M con l’unità kg e dividi per v.'),
('Due cambiamenti con la massa residua fissa',SCENE+'B usa m_B=κ₁m e v_B=κ₂v, con κ₁,κ₂>0 e m,v riferiti ad A; M resta 2 kg e entrambe le prove sono classiche. Quanto vale U_B/U_A?',['κ₁ κ₂','κ₁ / κ₂','κ₂ / κ₁','κ₁ + κ₂','κ₁ κ₂²'],
 'La legge contiene il prodotto m v diviso per una massa residua che non cambia. Nel rapporto delle due uscite si cancellano M e i dati della prima prova; resta il prodotto dei due fattori di scala. Non viene scalata la massa iniziale M+m al posto di quella residua.',
 r'U_A=mv/M\qquad U_B=\kappa_1\kappa_2mv/M\qquad U_B/U_A=\kappa_1\kappa_2',
 'I quozienti attribuiscono a un ingresso un effetto inverso; il quadrato su κ₂ non appartiene al bilancio della quantità di moto. La somma darebbe due per prove identiche. Se anche M cambiasse, servirebbe un ulteriore fattore al denominatore, qui non richiesto.', 'Scala il numeratore mv e lascia M invariata.'),
('Due raddoppi nell’emissione',SCENE+'A ha m=2 kg,v=2 m/s; B ha m=4 kg,v=4 m/s. Quanto vale U_B/U_A?',4,
 'A produce U_A=2 m/s. In B la quantità di moto emessa è 16 kg·m/s; divisa per M=2 kg dà U_B=8 m/s. Il rapporto è quattro, prodotto dei due raddoppi di massa emessa e rapidità.',
 r'U_A=2\,\mathrm{m/s}\qquad U_B=8\,\mathrm{m/s}\qquad U_B/U_A=4',
 'Due considera soltanto un raddoppio; otto è il numero della rapidità B, non il rapporto. Non va imposto U_B<v_B: il residuo è più leggero della massa emessa e può avere rapidità maggiore restando nel regime classico assegnato.', 'Dividi 16 kg·m/s per la massa residua prima di fare il rapporto.'),
('Media dei moduli di rinculo',SCENE+'A usa m=2 kg,v=2 m/s; B usa m=4 kg,v=4 m/s. Qual è la media aritmetica di U_A,U_B con uguale peso?',['5 m/s','10 m/s','5/2 m/s','9/2 m/s','6 m/s'],
 'I due moduli sono due e otto metri al secondo. La semisomma è cinque metri al secondo. La domanda non somma le componenti di rinculo di due dispositivi presenti insieme: media due intensità di prove distinte.',
 r'U_A=2\,\mathrm{m/s}\qquad U_B=8\,\mathrm{m/s}\qquad \overline U=\frac{2+8}{2}\,\mathrm{m/s}\qquad \overline U=5\,\mathrm{m/s}',
 'Dieci è la somma, 5/2 dimezza ancora e sei è la differenza. Gli ingressi medi m=3 kg,v=3 m/s darebbero U=9/2 m/s, diverso da cinque. La differenza è esattamente un mezzo, senza ricorrere a decimali.', 'Media le rapidità già ottenute dal rispettivo bilancio.'),
('Scegliere la rapidità dell’emissione',SCENE+'A ha m_A=2 kg,v_A=2 m/s. Si sceglie m_B=4 kg e si vuole U_B=4U_A. Quanto vale v_B/v_A?',2,
 'Il rinculo iniziale è due metri al secondo e l’obiettivo otto. La quantità di moto del residuo ha modulo M U_B=16 kg·m/s. Divisa per i quattro chilogrammi emessi dà v_B=4 m/s nel laboratorio; il rapporto ai due iniziali è due.',
 r'U_B=8\,\mathrm{m/s}\qquad v_B=MU_B/m_B\qquad v_B=4\,\mathrm{m/s}\qquad v_B/v_A=2',
 'Lasciare v a due darebbe U_B=4 m/s, soltanto il doppio di A. Quadruplicarla con massa emessa doppia darebbe otto volte il rinculo iniziale. Quattro m/s è una rapidità, non il rapporto quattro.', 'Ricostruisci la quantità di moto opposta del corpo emesso e dividila per m_B.'),
('Taratura prima della massa emessa',SCENE+'Un display continuo adimensionale legge S=qU, con q>0 costante e offset nullo. Il riferimento m=2 kg,v=2 m/s dà S=6. Una prova con v=4 m/s dà S=24. Quanto vale m in kg?',4,
 'Il riferimento ha U=2 m/s e quindi q=3 s/m. La lettura 24 corrisponde a U=8 m/s. La massa emessa è m=M U/v=(2 kg)·8/4=4 kg. L’inversa usa sempre la rapidità emessa nel laboratorio.',
 r'q=3\,\mathrm{s/m}\qquad U=24/q\qquad U=8\,\mathrm{m/s}\qquad m=MU/v\qquad m=4\,\mathrm{kg}',
 'Usare 24 come metri al secondo darebbe dodici chilogrammi, lasciando il guadagno spurio tre. Con m=4,v=4,M=2 si trova U=8 e S=24. La taratura non misura direttamente la massa.', 'Decodifica U e poi applica la massa residua nell’inversa.'),
('Display affine del rinculo',SCENE+'Un display continuo adimensionale legge S=qU+b, con q>0,b costanti. A: m=2 kg,v=2 m/s,S=5. B: m=4 kg,v=4 m/s,S=17. C: v=2 m/s,S=9. Quanto vale m_C?',['2 kg','3 kg','4 kg','5 kg','8 kg'],
 'I riferimenti hanno U=2 e 8 m/s. La differenza delle letture dodici divisa per sei metri al secondo dà q=2 s/m; poi b=1. La lettura nove dà U_C=(9−1)/2=4 m/s. Con v_C=2 m/s l’inversa ricostruisce m_C=4 kg.',
 r'q=2\,\mathrm{s/m}\qquad b=1\qquad U_C=(9-1)/q\qquad U_C=4\,\mathrm{m/s}\qquad m_C=4\,\mathrm{kg}',
 'Le masse 2,3,5,8 kg con v=2 m/s darebbero letture 5,7,11,17: nessuna è nove. Il rapporto delle letture grezze non elimina b; la lettura va prima corretta e poi divisa per q.', 'Usa i due riferimenti per eliminare l’offset prima dell’inversa fisica.'),
('Un vincolo fra massa emessa e rapidità',SCENE+'Si selezionano prove con m=cv, dove c=1 kg·s/m è fisso. m resta costante durante ogni emissione; il vincolo collega prove distinte. Se U=2 m/s, quanto vale v in m/s?',2,
 'Sostituendo m=cv nel rinculo si ottiene U=cv²/M. Isoliamo il quadrato v²=M U/c: le unità danno m²/s² e il valore è quattro. La radice positiva è due metri al secondo; segue m=cv=2 kg.',
 r'U=cv^2/M\qquad v^2=MU/c\qquad v^2=4\,\mathrm{m^2/s^2}\qquad v=2\,\mathrm{m/s}\qquad m=2\,\mathrm{kg}',
 'Il ramo negativo non è la rapidità v positiva e renderebbe negativa m nel vincolo; non rappresenta il rinculo, già descritto dalla componente −U del residuo. Con v=1 m/s si avrebbe U=1/2 m/s, con tre U=9/2 m/s. La coppia v=2,m=2 riproduce U=2 e il totale delle quantità di moto zero.', 'Sostituisci il vincolo conservando M e c con le loro unità prima della radice.')]
CHOICES={2:1,3:0,4:0,7:0,8:0,9:0,10:0,12:0,15:2}
UNITS={1:'m/s',5:'kg',6:'m/s',11:'1',13:'1',14:'kg',16:'m/s'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/recoil-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-recoil-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Impulso e quantità di moto','order':5920+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L009','prerequisites':['C1-L001','C1-L002','C1-L005','C1-L007','C1-L008','C1-L009'],'reuse':['C6'],
            'family':'recoil','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Somma mv e −MU nel laboratorio; M è la massa residua già assegnata.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L009'},
            'coverage':['Rinculo di un sistema inizialmente fermo','Massa residua e velocità nel laboratorio'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio m=M=2kg: prima sistema4kg fermo, poi corpo emesso+2m/s e residuo−2m/s nel laboratorio. Velocità con frecce100px a50px per m/s. Quantità di moto+4 e−4kg·m/s, frecce120px a30px per kg·m/s in pannello distinto, totale0. K finale8J da energia interna nel modello senza lavoro esterno. Geometria dei corpi schematica, nessuna scala delle masse.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.recoil_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'recoil-059.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'recoil-059-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
