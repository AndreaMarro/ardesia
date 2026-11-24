"""Author classical particle-momentum drafts; separate review NOT_RUN."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='In un riferimento inerziale una particella classica non relativistica ha massa m>0, costante nella singola prova, e rapidità v>0 nell’istante considerato. Scegliamo l’asse positivo nel verso del moto: la componente v_x=+v e la quantità di moto orientata p_x=mv_x è positiva. p=|p_x| è il modulo della quantità di moto. Non si assume che il sistema sia isolato: qui si calcola p in un istante, senza affermarne la conservazione. '
TASKS=[
('La massa moltiplica il vettore velocità',SCENE+'Con m=2 kg e v=2 m/s, quanto vale p in kg·m/s?',4,
 'La quantità di moto vettoriale è massa per velocità. Con l’asse scelto la componente è positiva e coincide numericamente con il modulo. Due chilogrammi per due metri al secondo danno quattro kg·m/s. La massa resta un fattore: la quantità di moto non è la sola rapidità.',
 r'p_x=mv_x\qquad p_x=(2\,\mathrm{kg})(2\,\mathrm{m/s})\qquad p_x=+4\,\mathrm{kg\,m/s}\qquad p=4\,\mathrm{kg\,m/s}',
 'Una particella più pesante alla stessa rapidità avrebbe maggiore quantità di moto. L’energia cinetica usa invece mv²/2 e ha un’altra dimensione: l’eventuale uguaglianza dei numeri in un caso non rende uguali le grandezze. La quantità di moto può cambiare se agisce un impulso esterno.', 'Moltiplica la massa per la velocità, conservando direzione e unità.'),
('Una sola velocità, non il suo quadrato','Per una particella classica la quantità di moto ha modulo p=mv, con m in kg e rapidità v in m/s. Quale unità proposta è adatta a p?',['kg·m/s','kg·m/s²','kg·m²/s²','m/s','kg'],
 'Il prodotto contiene una massa e una velocità, quindi kg·m/s. Non compare il quadrato di v. Questa unità è equivalente a N·s, perché l’impulso della risultante misura una variazione di quantità di moto, ma tra le alternative si sceglie una sola espressione dimensionalmente corretta.',
 r'[p]=ML/T\qquad \mathrm{kg\,m/s}=\mathrm{N\,s}',
 'kg·m/s² è un newton e misura forza; kg·m²/s² è un joule e misura energia. m/s è la rapidità senza il fattore massa, mentre kg è la sola massa. Non basta che un risultato sia positivo per identificare la grandezza.', 'Cerca massa per una sola potenza della velocità.'),
('Dal vettore al modulo',SCENE+'Quale relazione dà p?',['p=mv','p=mv²/2','p=m/v','p=v/m','p=−mv'],
 'La massa è uno scalare positivo e il vettore quantità di moto è parallelo e concorde alla velocità. Prendendo il modulo rimane m volte il modulo della velocità: p=mv. Il segno di una componente cambia se si cambia verso del moto o dell’asse, ma il modulo richiesto resta positivo.',
 r'\vec p=m\vec v\qquad p=|\vec p|\qquad p=m|\vec v|\qquad p=mv',
 'mv²/2 è energia cinetica, non quantità di moto. I due quozienti hanno dimensioni diverse da ML/T. −mv sarebbe negativo e non rappresenterebbe il modulo: potrebbe comparire una componente negativa solo con una diversa scelta di verso, non in questa definizione.', 'Separa il modulo dalla componente con segno.'),
('Massa doppia alla stessa rapidità',SCENE+'Fra due prove v=2 m/s resta uguale e m passa da 2 a 4 kg. Come cambia p?',['Da 4 a 8 kg·m/s','Resta 4 kg·m/s','Da 4 a 16 kg·m/s','Da 4 a 2 kg·m/s','Diventa zero'],
 'Si confrontano particelle o configurazioni con masse diverse, ciascuna costante nella propria prova. La rapidità comune moltiplica due e quattro chilogrammi: i moduli passano da quattro a otto kg·m/s. Non si sta descrivendo una massa che aumenta durante il moto.',
 r'p_A=4\,\mathrm{kg\,m/s}\qquad p_B=(4\,\mathrm{kg})(2\,\mathrm{m/s})\qquad p_B=8\,\mathrm{kg\,m/s}',
 'Sedici raddoppierebbe anche v oppure eleverebbe m al quadrato. Due applica una dipendenza inversa; zero e invarianza ignorano il fattore massa cambiato. Il verso della quantità di moto rimane quello della velocità assegnata.', 'Con la stessa v, p segue linearmente la massa.'),
('Ricostruire la massa',SCENE+'Si misura p=4 kg·m/s e si conosce v=2 m/s. Quanto vale m in kg?',2,
 'La rapidità positiva moltiplica m nella legge del modulo. Dividiamo p per v: le unità di velocità si cancellano e resta una massa. Il rapporto quattro su due dà due chilogrammi.',
 r'm=p/v\qquad m=\frac{4\,\mathrm{kg\,m/s}}{2\,\mathrm{m/s}}\qquad m=2\,\mathrm{kg}',
 'Il controllo 2 kg·2 m/s=4 kg·m/s riproduce la misura. La divisione non sarebbe lecita per v=0, qui esclusa; una quantità di moto nulla da sola non identificherebbe la massa di un corpo fermo. Non si usa la massa come una forza in newton.', 'Dividi il modulo di quantità di moto per la rapidità non nulla.'),
('Ricostruire la rapidità',SCENE+'Si misura p=4 kg·m/s e si conosce m=2 kg. Quanto vale v in m/s?',2,
 'Dividiamo p=mv per la massa positiva. Il chilogrammo si cancella e rimane una rapidità: quattro su due dà due metri al secondo. La domanda non ricostruisce da sola una direzione nello spazio, ma il modulo della velocità.',
 r'v=p/m\qquad v=\frac{4\,\mathrm{kg\,m/s}}{2\,\mathrm{kg}}\qquad v=2\,\mathrm{m/s}',
 'Il numero quattro sarebbe quello della quantità di moto, non della rapidità. Un mezzo invertirebbe la divisione e avrebbe unità inverse di velocità. Il verso è stato fissato separatamente dall’asse nel modello della prova.', 'Cancella la massa nel rapporto p/m.'),
('Rapidità doppia a massa uguale',SCENE+'m=2 kg in entrambe le prove; v passa da 2 a 4 m/s. Quanto vale p_B/p_A?',['2','1/2','4','1','−2'],
 'La massa comune si cancella nel rapporto dei prodotti. Il modulo p passa da quattro a otto kg·m/s e il rapporto è due. Non entra il quadrato della velocità che compare invece nell’energia cinetica.',
 r'p_A=4\,\mathrm{kg\,m/s}\qquad p_B=8\,\mathrm{kg\,m/s}\qquad p_B/p_A=2',
 'Quattro confonde il rapporto delle quantità di moto con quello delle energie cinetiche alla stessa massa. Un mezzo inverte il confronto; uno ignora la nuova rapidità; −2 non confronta due moduli positivi. Il rapporto è puro.', 'Con m uguale confronta una sola potenza di v.'),
('Scarto di una proposta doppia',SCENE+'Con m=2 kg,v=2 m/s si propone p_proposto=8 kg·m/s. Quanto vale proposto meno corretto?',['+4 kg·m/s','−4 kg·m/s','+8 kg·m/s','0 kg·m/s','+2 kg·m/s'],
 'Il modulo corretto è 2·2=4 kg·m/s. La proposta otto lo supera di quattro kg·m/s. Manteniamo l’ordine della sottrazione richiesto, distinto dal segno che potrebbe avere una componente vettoriale.',
 r'p=4\,\mathrm{kg\,m/s}\qquad e=(8-4)\,\mathrm{kg\,m/s}\qquad e=+4\,\mathrm{kg\,m/s}',
 '−4 scambia l’ordine, otto ripete la proposta, zero la accetta e due dimezza ancora lo scarto. Il risultato conserva la dimensione di quantità di moto, non di rapidità o energia.', 'Calcola prima mv e soltanto dopo sottrailo dalla proposta.'),
('L’inversa del modulo p=mv',SCENE+'Quale formula isola m, con v>0?',['m=p/v','m=pv','m=v/p','m=2p/v','m=p/(2v)'],
 'La rapidità moltiplica la massa. Dividiamo entrambi i membri per v>0 e otteniamo una quantità di moto su una velocità, cioè chilogrammi. Il modulo positivo p rende positiva anche la massa ricostruita.',
 r'p/v=m\qquad m=p/v',
 'pv moltiplica ancora la velocità e ha dimensioni diverse da massa. v/p è un inverso di massa. I fattori due non appartengono alla definizione di p: il mezzo della formula cinetica non va importato in questa inversa.', 'Dividi per l’unico fattore che accompagna m.'),
('Due cambiamenti in un prodotto',SCENE+'La prova B usa m_B=κ₁m e v_B=κ₂v, con κ₁,κ₂>0; m,v indicano A. Quanto vale p_B/p_A?',['κ₁ κ₂','κ₁ / κ₂','κ₂ / κ₁','κ₁ + κ₂','κ₁ κ₂²'],
 'Inserendo i dati della seconda prova compaiono un fattore κ₁ dalla massa e un fattore κ₂ dalla rapidità. Dividendo per p_A=mv si cancellano i dati iniziali e resta κ₁κ₂. Ogni prova conserva massa costante al proprio interno.',
 r'p_A=mv\qquad p_B=\kappa_1\kappa_2mv\qquad p_B/p_A=\kappa_1\kappa_2',
 'I quozienti invertono uno degli effetti; la somma non è il prodotto e darebbe due per prove identiche. κ₁κ₂² sarebbe il rapporto delle energie cinetiche, non dei moduli di quantità di moto. Il confronto riguarda moduli e non una somma vettoriale dei due corpi.', 'Applica una volta ciascun fattore di scala.'),
('Massa e rapidità entrambe doppie',SCENE+'A usa m=2 kg,v=2 m/s; B usa m=4 kg,v=4 m/s. Quanto vale p_B/p_A?',4,
 'I moduli sono quattro e sedici kg·m/s. Il rapporto è quattro, prodotto dei due raddoppi. Sedici è il valore di p_B e non la risposta adimensionale richiesta.',
 r'p_A=4\,\mathrm{kg\,m/s}\qquad p_B=16\,\mathrm{kg\,m/s}\qquad p_B/p_A=4',
 'Due considera un solo cambiamento; otto attribuirebbe alla rapidità il quadrato dell’energia cinetica. Un quarto è il rapporto inverso. Non c’è un trasferimento di quantità di moto fra A e B: sono due prove distinte.', 'Confronta 16 con 4 oppure moltiplica due per due.'),
('Media dei moduli in prove distinte',SCENE+'A ha m=2 kg,v=2 m/s; B ha m=4 kg,v=4 m/s. Qual è la media aritmetica di p_A,p_B con uguale peso?',['10 kg·m/s','20 kg·m/s','5 kg·m/s','9 kg·m/s','12 kg·m/s'],
 'I moduli di quantità di moto sono quattro e sedici kg·m/s. La semisomma è dieci kg·m/s. Non si chiede la quantità di moto totale di due particelle presenti insieme, né una media di vettori con direzioni non dichiarate.',
 r'p_A=4\,\mathrm{kg\,m/s}\qquad p_B=16\,\mathrm{kg\,m/s}\qquad \overline p=\frac{4+16}{2}\,\mathrm{kg\,m/s}\qquad \overline p=10\,\mathrm{kg\,m/s}',
 'Venti somma e cinque divide ancora; dodici non deriva dalla semisomma. Il prodotto degli ingressi medi m=3 kg,v=3 m/s sarebbe 9 kg·m/s, diverso da dieci. Non occorrono decimali per distinguerli.', 'Media le due uscite, non i fattori prima di moltiplicarli.'),
('Scegliere la nuova rapidità',SCENE+'A ha m_A=2 kg,v_A=2 m/s. Si impone m_B=4 kg e si vuole p_B=4p_A. Quanto vale v_B/v_A?',2,
 'La prima quantità di moto vale quattro kg·m/s e l’obiettivo sedici. Con massa quattro chilogrammi servono quattro metri al secondo. Dividendo la nuova rapidità per i due metri al secondo iniziali troviamo due.',
 r'p_B=16\,\mathrm{kg\,m/s}\qquad v_B=p_B/m_B\qquad v_B=4\,\mathrm{m/s}\qquad v_B/v_A=2',
 'Lasciare v uguale darebbe solo il doppio di p_A; quadruplicarla con massa doppia darebbe otto volte. Quattro m/s è il nuovo valore, da distinguere dal rapporto due. La rapidità resta nel regime non relativistico assunto.', 'La massa doppia fornisce già un fattore due dell’obiettivo quattro.'),
('Taratura di un display di quantità di moto',SCENE+'Un display continuo adimensionale legge S=qp, con q>0 costante e offset nullo. Il riferimento m=2 kg,v=2 m/s dà S=12. Una prova con v=4 m/s dà S=48. Quanto vale m in kg?',4,
 'Il riferimento ha p=4 kg·m/s e quindi q=3 s/(kg·m). La nuova lettura 48 rappresenta p=16 kg·m/s. Dividendo per la rapidità nuova di quattro metri al secondo troviamo quattro chilogrammi.',
 r'q=3\,\mathrm{s/(kg\,m)}\qquad p=48/q\qquad p=16\,\mathrm{kg\,m/s}\qquad m=p/v\qquad m=4\,\mathrm{kg}',
 'S non è una quantità di moto SI: usarne il numero 48 direttamente darebbe dodici chilogrammi, con il guadagno spurio tre. Il controllo 4·4=16 kg·m/s e S=3·16=48 ricostruisce entrambe le tappe.', 'Decodifica p prima di dividerlo per v.'),
('Display affine prima dell’inversa',SCENE+'Un display continuo adimensionale legge S=qp+b, con q>0,b costanti. A: m=2 kg,v=2 m/s,S=9. B: m=4 kg,v=4 m/s,S=33. C: v=2 m/s,S=17. Quanto vale m_C?',['2 kg','3 kg','4 kg','5 kg','8 kg'],
 'Le quantità di moto note sono quattro e sedici kg·m/s. La differenza delle letture 24 divisa per la differenza fisica 12 dà q=2 s/(kg·m). Dal primo riferimento b=1. La lettura diciassette dà p_C=8 kg·m/s e, a due metri al secondo, m_C=4 kg.',
 r'q=2\,\mathrm{s/(kg\,m)}\qquad b=1\qquad p_C=(17-1)/q\qquad p_C=8\,\mathrm{kg\,m/s}\qquad m_C=4\,\mathrm{kg}',
 'A rapidità due, le masse 2,3,5,8 kg darebbero letture 9,13,21,33; solo quattro restituisce diciassette. La taratura affine non si elimina facendo soltanto un rapporto fra letture grezze.', 'Trova q dalla differenza di p, recupera b e sottrailo alla lettura.'),
('Un legame fra massa e rapidità di prove diverse',SCENE+'Si selezionano prove con m=cv, dove c=1 kg·s/m è fisso. Il vincolo non fa cambiare la massa durante la singola prova. Se p=4 kg·m/s, quanto vale v in m/s?',2,
 'Sostituendo m=cv nel modulo p=mv otteniamo p=cv². L’unità di c permette che il prodotto sia una quantità di moto. Il rapporto p/c vale quattro metri quadrati al secondo quadrato; la radice positiva è due metri al secondo e dà massa due chilogrammi.',
 r'p=cv^2\qquad v^2=p/c\qquad v^2=4\,\mathrm{m^2/s^2}\qquad v=2\,\mathrm{m/s}\qquad m=2\,\mathrm{kg}',
 'Il ramo negativo non è una rapidità e renderebbe negativa anche la massa nel vincolo. Con v=1 m/s si avrebbe p=1 kg·m/s; con tre si avrebbe nove. Il coefficiente c ha unità kg·s/m: massa e rapidità restano quantità diverse anche quando hanno lo stesso valore numerico.', 'Sostituisci il vincolo fra prove e scegli il ramo dei due moduli positivi.')]
CHOICES={2:0,3:0,4:0,7:0,8:0,9:0,10:0,12:0,15:2}
UNITS={1:'kg·m/s',5:'kg',6:'m/s',11:'1',13:'1',14:'kg',16:'m/s'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/momentum-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-momentum-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Impulso e quantità di moto','order':5620+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L009','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005','C1-L009'],'reuse':['C6'],
            'family':'momentum','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'La quantità di moto è massa per velocità; il modulo è positivo, la componente dipende dal verso.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L009'},
            'coverage':['Quantità di moto di una particella','Modulo e componente orientata'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3,4):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Esempio v_x=+2 m/s: con m=2 kg si ha p_x=+4 kg·m/s, con m=4 kg si ha p_x=+8 kg·m/s. Velocità a40px per m/s; quantità di moto a30px per kg·m/s in pannello distinto (120 e240px). Ultimo pannello autonomo: m2kg,v_x−2m/s dà p_x−4kg·m/s ma modulo p4kg·m/s. Asse spaziale fissato verso destra anche quando il moto si inverte.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.momentum_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'momentum-056.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'momentum-056-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
