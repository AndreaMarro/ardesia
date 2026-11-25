"""Author exact gravitational-force ratio exercises; no independent self approval."""
import base64,json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='Si confrontano attrazioni gravitazionali newtoniane della stessa massa di prova m>0. Il riferimento ha massa attrattiva M₀>0 e distanza fra i centri r₀>0, con forza di modulo F₀. Un’altra configurazione ha massa αM₀ e distanza βr₀, con α,β>0 e forza di modulo F. I corpi sono puntiformi; per corpi estesi la stessa legge vale soltanto con simmetria sferica e corpi esterni l’uno all’altro in entrambe le configurazioni. R=F/F₀ è un rapporto positivo. '
TASKS=[
('La distanza raddoppia insieme alla massa',SCENE+'Con α=2 e β=2, quanto vale R?',['1/2','2','1','1/4','4'],
 'Scriviamo la legge F=GMm/r² in entrambe le configurazioni. La massa attrattiva doppia moltiplica la forza per due, mentre la distanza doppia la divide per quattro. Nel rapporto si cancellano G, m, M₀ e r₀²: resta due quarti, cioè un mezzo.',
 r'F_0=GM_0m/r_0^2\qquad F=G(\alpha M_0)m/(\beta r_0)^2\qquad R=\alpha/\beta^2\qquad R=2/4\qquad R=1/2',
 'Due considera solo la massa, un quarto solo la distanza e uno usa erroneamente una distanza alla prima potenza. Quattro rovescia l’effetto della distanza. Il risultato è puro: la forza è metà di F₀, non mezzo newton senza conoscere F₀.', 'Moltiplica per il fattore della massa e dividi per il quadrato di quello della distanza.'),
('Un rapporto di forze resta puro','Due moduli gravitazionali positivi F,F₀ sono espressi nella stessa unità e R=F/F₀. Quale unità proposta esprime R?',['N','kg','1','m','N/m'],
 'I newton al numeratore e al denominatore si cancellano. R non è una forza, anche se descrive quanto una forza sia grande rispetto a un riferimento. L’unità indicata con 1 esprime l’adimensionalità; nella scrittura ordinaria spesso si omette.',
 r'[R]=[F]/[F_0]\qquad [R]=1',
 'N sarebbe il modulo di una singola forza, kg una massa, m una distanza e N/m una rigidezza. Cambiare l’unità comune delle due forze non cambia il loro rapporto. L’assenza di unità non elimina il vincolo F₀>0 che rende possibile la divisione.', 'Cancella le stesse unità nei due moduli.'),
('La legge del confronto gravitazionale',SCENE+'Quale espressione fornisce R?',['R=α/β²','R=α/β','R=αβ²','R=β²/α','R=α²/β²'],
 'Il cambiamento della massa entra una sola volta al numeratore della legge di Newton. Il cambiamento della distanza entra due volte al denominatore. Formando F/F₀ si eliminano la massa di prova e tutti i parametri iniziali comuni: R=α/β².',
 r'F=\frac{\alpha}{\beta^2}F_0\qquad R=F/F_0\qquad R=\alpha/\beta^2',
 'α/β dimentica il quadrato della distanza; αβ² assegna alla distanza un effetto crescente; β²/α inverte il rapporto. α² conta due masse variabili, mentre la massa di prova resta la stessa. Non usare questa legge con tutta la massa di un pianeta se la prova si trova al suo interno.', 'Identifica quale sola massa cambia e quale distanza va al quadrato.'),
('Più massa alla stessa distanza relativa',SCENE+'Fra due confronti A,B si passa da α_A=2 a α_B=4 mantenendo β=2 e lo stesso riferimento F₀. Come cambia R?',['Da 1/2 a 1','Resta 1/2','Da 1/2 a 2','Da 1/2 a 1/4','Diventa zero'],
 'Il denominatore resta quattro. R_A=2/4=1/2 e R_B=4/4=1: la forza della configurazione B uguaglia quella di riferimento. Raddoppiare α raddoppia R, pur senza cambiare la massa di prova.',
 r'R_A=2/2^2\qquad R_A=1/2\qquad R_B=4/2^2\qquad R_B=1',
 'Due raddoppierebbe l’uscita una volta di troppo; un quarto invertirebbe l’effetto della massa. Zero è escluso per masse positive e distanze finite. Il confronto mantiene i corpi nel modello puntiforme o esterno sferico, anche quando cambia la massa attrattiva.', 'Con β fisso confronta i numeratori.'),
('Ricostruire il fattore della massa',SCENE+'Si misura R=1/2 e si conosce β=2. Quanto vale α?',2,
 'Da R=α/β² moltiplichiamo per β². Il quadrato di due è quattro; un mezzo di quattro è due. Questo α è il rapporto tra la nuova massa attrattiva e M₀, non una massa di due chilogrammi.',
 r'\alpha=R\beta^2\qquad \alpha=\frac12\cdot4\qquad \alpha=2',
 'Dividere ancora per quattro darebbe 1/8 e non ricostruirebbe R. Usare β alla prima potenza darebbe uno. La sostituzione α/β²=2/4=1/2 controlla il dato senza conoscere G o il valore della massa di prova.', 'Moltiplica R per il quadrato del rapporto delle distanze.'),
('Ricostruire il fattore della distanza',SCENE+'Si misura R=1/2 e si conosce α=2. Quanto vale β?',2,
 'Isoliamo prima β²=α/R. Due diviso un mezzo è quattro. Il rapporto di distanze β è positivo, quindi la radice ammessa è due: la distanza nuova è il doppio di r₀, non due metri senza conoscere r₀.',
 r'\beta^2=\alpha/R\qquad \beta^2=4\qquad \beta_+=2\qquad \beta_-=-2',
 'Il ramo negativo non è un rapporto di distanze positive. Quattro confonde β² con β e un mezzo inverte il confronto. La prova esterna sferica richiederebbe anche che la distanza ricostruita non entrasse nei corpi; il modello puntiforme dichiarato non impone un raggio materiale aggiuntivo.', 'Isola il quadrato e poi prendi la radice positiva.'),
('Raddoppiare ancora la distanza relativa',SCENE+'A usa α=2,β=2; B usa α=2,β=4. Quanto vale R_B/R_A?',['1/4','1/2','2','4','1'],
 'Le due forze sono già rapportate allo stesso F₀. A ha R_A=1/2 e B ha R_B=2/16=1/8. Dividere un ottavo per un mezzo dà un quarto. La nuova distanza doppia riduce quindi ancora la forza di quattro volte.',
 r'R_A=1/2\qquad R_B=1/8\qquad R_B/R_A=\frac{1/8}{1/2}\qquad R_B/R_A=1/4',
 'Un mezzo dimentica il quadrato; due e quattro farebbero aumentare la forza allontanando i centri; uno ignora la distanza. R_B=1/8 non è il rapporto richiesto R_B/R_A=1/4: il riferimento del secondo confronto è A.', 'Confronta due rapporti completi o usa il quadrato del nuovo fattore due.'),
('Lo scarto della proposta unitaria',SCENE+'Con α=2,β=2 si propone R_proposto=1. Quanto vale proposto meno corretto?',['+1/2','−1/2','+1','0','+1/4'],
 'Il corretto è un mezzo. La proposta uno lo supera di un mezzo: lo scarto con segno è +1/2, puro come i due valori confrontati. Non si tratta di una forza in newton.',
 r'R=2/2^2\qquad R=1/2\qquad e=1-1/2\qquad e=+1/2',
 '−1/2 inverte la sottrazione, uno ripete la proposta, zero la accetta e un quarto dimezza ancora l’errore. La proposta uno deriverebbe dal rapporto α/β anziché da α/β²: il controllo individua la dipendenza sbagliata dalla distanza.', 'Calcola il denominatore quadratico prima della sottrazione.'),
('L’inversa per la massa relativa',SCENE+'Quale formula isola α da R=α/β²?',['α=Rβ²','α=R/β²','α=β²/R','α=Rβ','α=2 Rβ²'],
 'Moltiplichiamo entrambi i membri per β², positivo. Otteniamo α=Rβ² senza alcuna radice: l’incognita α compare alla prima potenza. Tutti i fattori sono rapporti puri.',
 r'R\beta^2=\alpha\qquad \alpha=R\beta^2',
 'R/β² divide nel verso sbagliato; β²/R inverte R; Rβ omette un fattore β. Il due aggiuntivo non proviene dalla legge. Per β=1 l’inversa corretta deve dare α=R, perché le distanze sono uguali.', 'Elimina il denominatore, non elevare α al quadrato.'),
('Scalare due rapporti fra prove',SCENE+'A ha fattori α,β; B ha α_B=κ₁α e β_B=κ₂β, con κ₁,κ₂>0. Entrambe sono nel dominio del modello e condividono F₀. Quanto vale R_B/R_A?',['κ₁ / κ₂²','κ₁ / κ₂','κ₁ κ₂²','κ₂² / κ₁','κ₁² / κ₂²'],
 'Il fattore della massa entra direttamente, quello della distanza al quadrato e inversamente. Nel rapporto tra le due uscite si cancellano α e β², lasciando κ₁/κ₂². Questo è un confronto fra configurazioni, non una massa o una distanza che varia durante una misura.',
 r'R_A=\alpha/\beta^2\qquad R_B=\kappa_1\alpha/(\kappa_2\beta)^2\qquad R_B/R_A=\kappa_1/\kappa_2^2',
 'Il quoziente con κ₂ alla prima potenza dimentica il quadrato; il prodotto assegna un effetto crescente alla distanza. Il reciproco cambia l’ordine e κ₁² cambia anche la massa di prova che invece è invariata. Se κ₁=κ₂², la forza rimane uguale.', 'Scala il quadrato dell’intero β_B.'),
('Due raddoppi non si compensano',SCENE+'A usa α=2,β=2; B usa α=4,β=4. Quanto vale R_B/R_A?',['1/2','2','1','1/4','4'],
 'A dà un mezzo e B dà quattro sedicesimi, cioè un quarto. Il rapporto è (1/4)/(1/2)=1/2. Il doppio della massa compensa solo uno dei due fattori due presenti nel quadrato della distanza.',
 r'R_A=1/2\qquad R_B=1/4\qquad R_B/R_A=1/2',
 'Uno usa una legge inversa della distanza alla prima potenza; due segue soltanto la massa e un quarto soltanto l’effetto della distanza. Quattro ha entrambi gli effetti nel verso sbagliato. La forza B è un quarto di F₀, ma metà della forza A.', 'Distingui il confronto con F₀ dal confronto con A.'),
('Media di rapporti gravitazionali',SCENE+'A usa α=2,β=2 e B usa α=4,β=4. Qual è la media aritmetica di R_A,R_B con uguale peso?',['3/8','3/4','3/16','1/3','1/4'],
 'Le due uscite sono 1/2 e 1/4. Riscriviamo un mezzo come due quarti, sommiamo tre quarti e dividiamo per due: la media è 3/8. Il risultato è compreso fra un quarto e un mezzo.',
 r'\overline R=\frac{1/2+1/4}{2}\qquad \overline R=3/8',
 '3/4 è la somma e 3/16 divide ancora. Gli ingressi medi α=3,β=3 darebbero 1/3, non 3/8: i prodotti incrociati nove e otto distinguono le due frazioni, con differenza esatta 1/24. Un quarto ripete B. Non si mediano qui le distanze dei corpi di una singola configurazione.', 'Trova le due forze relative prima di mediarle.'),
('Scegliere la distanza per dimezzare la forza',SCENE+'A ha α_A=2,β_A=2. In B si impone α_B=4 e si vuole R_B=(1/2)R_A. Quanto vale β_B/β_A?',2,
 'R_A vale un mezzo, perciò il bersaglio è R_B=1/4. L’inversa β_B²=α_B/R_B dà 4/(1/4)=16. La radice positiva è β_B=4 e il rapporto al precedente β_A=2 è due.',
 r'R_B=1/4\qquad \beta_B^2=4/(1/4)\qquad \beta_B^2=16\qquad \beta_B=4\qquad \beta_B/\beta_A=2',
 'Lasciare β uguale darebbe R_B=1, non 1/4. Quadruplicare β rispetto ad A ridurrebbe la forza troppo: il nuovo fattore β è quattro, ma il rapporto richiesto tra fattori è due. Il ramo negativo è escluso per distanze positive.', 'Ricostruisci prima β_B dal rapporto obiettivo.'),
('Tarare un rapporto puro',SCENE+'Un display continuo adimensionale segue S=qR, con q>0 costante e offset nullo. Il riferimento α=2,β=2 dà S=3/2. Una prova con β=4 dà S=3/4. Quanto vale α nella prova?',4,
 'Il riferimento ha R=1/2. Il guadagno è (3/2)/(1/2)=3, puro perché S e R sono adimensionali. La lettura 3/4 dà R=(3/4)/3=1/4. Infine α=Rβ²=(1/4)·16=4.',
 r'q=3\qquad R=(3/4)/q\qquad R=1/4\qquad \alpha=R\beta^2\qquad \alpha=4',
 'Usare S=3/4 direttamente come R darebbe α=12 e includerebbe il guadagno tre. Un display di rapporti non deve per questo avere guadagno unitario. Il controllo α/β²=4/16 e qR=3/4 ricostruisce entrambe le relazioni.', 'Pur senza unità, lettura e rapporto fisico restano grandezze diverse.'),
('Una taratura con letture decrescenti',SCENE+'Un display continuo adimensionale segue S=qR+b, con q>0,b costanti. A: α=2,β=2,S=2. B: α=4,β=4,S=3/2. C: β=2,S=3. Quanto vale α_C?',['2','3','4','5','8'],
 'I riferimenti hanno R_A=1/2 e R_B=1/4. Sia la lettura sia il rapporto diminuiscono: q=[(3/2)−2]/[(1/4)−(1/2)]=(−1/2)/(−1/4)=2, positivo. L’offset è uno. C ha R=(3−1)/2=1 e quindi α=1·2²=4.',
 r'q=\frac{-1/2}{-1/4}\qquad q=2\qquad b=1\qquad R_C=(3-1)/q\qquad R_C=1\qquad \alpha_C=4',
 'Le alternative α=2,3,5,8 con β=2 darebbero letture 2,5/2,7/2,5, diverse da tre. I due segni negativi nella taratura si cancellano: una differenza di letture negativa non implica guadagno negativo. Il rapporto delle letture grezze conserva l’offset.', 'Mantieni lo stesso ordine in entrambe le differenze.'),
('Un vincolo elimina il quadrato apparente',SCENE+'Fra configurazioni si impone α=β. Se R=1/2, quanto vale β nel dominio positivo?',2,
 'Sostituendo α=β otteniamo R=β/β²=1/β, perché β>0. L’inversa dà β=1/R=2 e poi α=2. Il quadrato iniziale non produce due soluzioni fisiche: un fattore β si è cancellato in un dominio che esclude zero.',
 r'R=\beta/\beta^2\qquad R=1/\beta\qquad \beta=1/R\qquad \beta=2\qquad \alpha=2',
 'β=0 non è ammissibile e non si può introdurre come radice moltiplicando impropriamente denominatori. Il ramo −2 non dà il rapporto positivo richiesto e renderebbe negativa α nel vincolo. Uno o quattro danno R=1 o 1/4, non 1/2.', 'Semplifica usando β>0 prima di cercare radici.')]
CHOICES={1:0,2:2,3:0,4:0,7:0,8:0,9:0,10:0,11:0,12:0,15:2}
UNITS={5:'1',6:'1',13:'1',14:'1',16:'1'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/gravity-ratio-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-gravity-ratio-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Gravitazione e rapporti','order':6620+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L006','prerequisites':['C1-L001','C1-L002','C1-L005','C1-L006'],'reuse':['C6'],
            'family':'gravity-ratio','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'La forza gravitazionale varia direttamente con la massa attrattiva e inversamente con il quadrato della distanza fra i centri.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L006'},
            'coverage':['Rapporti di forze gravitazionali','Distanze fra i centri e dipendenza inversa quadratica'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Modello puntiforme, massa di prova comune, riferimento r₀=1 m e forza di riferimento F₀. Tre configurazioni con identica scala 100 px/m: riferimento M₀ a r₀; α2,β2 dà R1/2; α2,β4 dà R1/8. Nei pannelli inferiori le frecce dei moduli sono disegnate alla scala 160 px per F₀: 160,80,20 px. Simboli delle masse schematici, non una scala delle loro aree; frecce delle forze e distanze hanno scale diverse.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.gravity_ratio_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'gravity-ratio-066.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'gravity-ratio-066-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
