"""Author sixteen test-body circular-orbit editions; independent review NOT_RUN."""
import base64,json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='Nel modello newtoniano una massa di prova m>0 percorre un’orbita circolare di raggio r>0 intorno a un corpo centrale puntiforme con parametro μ=GM>0. Il moto del corpo centrale è trascurato nell’approssimazione di massa di prova: si usa un riferimento inerziale con il centro fisso nel modello. Agisce soltanto l’attrazione gravitazionale. V>0 è la rapidità orbitale costante, mentre il vettore velocità cambia direzione ed è tangente. Per un corpo centrale sferico esteso si richiederebbe inoltre un’orbita esterna in ogni prova. '
TASKS=[
('La gravità fornisce l’accelerazione centripeta',SCENE+'Con μ=4 m³/s² e r=1 m, quanto vale V in m/s?',2,
 'La forza gravitazionale ha modulo mμ/r² e punta al centro. Il moto circolare uniforme richiede una risultante centripeta mV²/r, non una seconda forza da aggiungere alla gravità. Uguagliamo i due moduli e semplifichiamo m e un fattore r: V²=μ/r=4 m²/s². La rapidità è la radice positiva, due metri al secondo.',
 r'mV^2/r=m\mu/r^2\qquad V^2=\mu/r\qquad V^2=4\,\mathrm{m^2/s^2}\qquad V=2\,\mathrm{m/s}',
 'Quattro è il numero di V², non quello di V. Non compare il fattore due della rapidità di fuga: qui l’orbita è circolare. Il valore −2 potrebbe indicare una componente secondo una convenzione, ma non la rapidità positiva richiesta; il verso di percorrenza non è fissato dalla sua intensità.', 'Confronta gravità e risultante centripeta e poi prendi la radice positiva.'),
('L’unità viene dalla radice','Nel modello orbitale circolare V=√(μ/r), con μ in m³/s² e r in m. Quale unità proposta esprime la rapidità V?',['m','m/s','m²/s²','N','1'],
 'Dividere μ per una lunghezza lascia m²/s². La radice quadrata agisce sia sul numero sia sull’unità: rimane m/s. μ non è una massa in chilogrammi, ma il prodotto della costante gravitazionale per la massa centrale.',
 r'[\mu/r]=L^2/T^2\qquad [V]=L/T',
 'm è una distanza, m²/s² l’unità prima della radice e N una forza. Il risultato non è puro. Non occorre conoscere separatamente G e M quando il loro prodotto μ è già assegnato.', 'Semplifica μ/r prima di prendere la radice dell’unità.'),
('La relazione della rapidità circolare',SCENE+'Quale formula dà V?',['V=√(μ/r)','V=μ/r','V=√(2μ/r)','V=√(μr)','V=√(r/μ)'],
 'Nel bilancio radiale la gravità è già la risultante: mV²/r=mμ/r². Dopo la semplificazione V²=μ/r e la scelta V>0 danno V=√(μ/r). La massa orbitante si cancella nell’approssimazione di prova, non perché la forza gravitazionale sia indipendente da essa.',
 r'mV^2/r=m\mu/r^2\qquad V^2=\mu/r\qquad V=\sqrt{\mu/r}',
 'μ/r salta la radice; √(2μ/r) è la rapidità di fuga nel modello, non quella circolare. √(μr) e √(r/μ) hanno anche unità errate. In un’orbita non circolare la rapidità dipenderebbe pure dall’energia e dalla posizione lungo il percorso: la circolarità è essenziale.', 'La gravità deve produrre proprio V²/r.'),
('Quattro volte μ, due volte V',SCENE+'Tra prove r=1 m resta fisso e μ passa da 4 a 16 m³/s². Come cambia V?',['Da 2 a 4 m/s','Da 2 a 8 m/s','Resta 2 m/s','Da 2 a 1 m/s','Diventa zero'],
 'Il rapporto μ/r quadruplica e quindi V² quadruplica. La radice quadrata di quattro è due: la rapidità passa da due a quattro metri al secondo. Si confrontano due orbite circolari già stabilite, non una variazione istantanea della massa centrale con lo stesso moto iniziale.',
 r'V_A^2=4\,\mathrm{m^2/s^2}\qquad V_A=2\,\mathrm{m/s}\qquad V_B^2=16\,\mathrm{m^2/s^2}\qquad V_B=4\,\mathrm{m/s}',
 'Otto renderebbe V direttamente proporzionale a μ anziché alla sua radice; uno ne invertirebbe l’effetto. Zero è incompatibile con μ>0 e r finito. Ogni prova mantiene l’ipotesi di campo centrale puntiforme o orbita sferica esterna.', 'Confronta i quadrati e poi le loro radici.'),
('Ricostruire il parametro gravitazionale',SCENE+'Si misura V=2 m/s e si conosce r=1 m. Quanto vale μ in m³/s²?',4,
 'Prima eleviamo al quadrato la rapidità e poi moltiplichiamo per il raggio: μ=V²r. Due al quadrato dà quattro m²/s²; per un metro si ottengono quattro m³/s². Il risultato è il parametro gravitazionale, non la massa centrale in kg.',
 r'V^2=\mu/r\qquad \mu=V^2r\qquad \mu=(4\,\mathrm{m^2/s^2})(1\,\mathrm m)\qquad \mu=4\,\mathrm{m^3/s^2}',
 'Usare Vr dimentica il quadrato e ha unità diverse; dividere per r non isola μ. Per ricavare M servirebbe anche G, non assegnata perché non è richiesta. Reinserendo μ/r si ritrova V²=4 e quindi V=2.', 'Elimina prima la radice e poi il denominatore.'),
('Ricostruire il raggio orbitale',SCENE+'Si misura V=2 m/s e si conosce μ=4 m³/s². Quanto vale r in m?',1,
 'Da V²=μ/r moltiplichiamo per r e dividiamo per V²>0. Il raggio è μ/V²: quattro m³/s² divisi per quattro m²/s² danno un metro. Non è una quota rispetto alla superficie, ma la distanza dal centro.',
 r'rV^2=\mu\qquad r=\mu/V^2\qquad r=\frac{4\,\mathrm{m^3/s^2}}{4\,\mathrm{m^2/s^2}}\qquad r=1\,\mathrm m',
 'Due dividerebbe soltanto per V e avrebbe unità errate. Un raggio materiale non è assegnato nel modello puntiforme; se fosse un pianeta sferico esteso, bisognerebbe controllare che il raggio ricostruito sia esterno prima di applicare la stessa legge.', 'Il denominatore è il quadrato della rapidità.'),
('Raggio quadruplo nello stesso campo',SCENE+'A usa μ=4 m³/s²,r_A=1 m; B usa lo stesso μ e r_B=4 m. Quanto vale V_B/V_A?',['1/2','2','1/4','4','1'],
 'La prima rapidità è due metri al secondo. Nel raggio quattro metri il rapporto μ/r vale uno m²/s² e V_B vale un metro al secondo. Il rapporto è un mezzo: il raggio entra al denominatore dentro una radice.',
 r'V_A=2\,\mathrm{m/s}\qquad V_B^2=1\,\mathrm{m^2/s^2}\qquad V_B=1\,\mathrm{m/s}\qquad V_B/V_A=1/2',
 'Un quarto dimentica la radice; due e quattro fanno aumentare la rapidità col raggio; uno ignora il cambiamento. Non si dice che un satellite possa passare spontaneamente fra queste orbite senza scambio energetico: si confrontano configurazioni circolari distinte.', 'Calcola le due rapidità o usa l’inversa della radice di quattro.'),
('Lo scarto di una rapidità doppia',SCENE+'Con μ=4 m³/s²,r=1 m si propone V_proposto=4 m/s. Quanto vale proposto meno corretto, in m/s?',2,
 'Il rapporto μ/r è quattro m²/s², quindi la rapidità corretta è due metri al secondo. La proposta quattro ha saltato la radice e la supera di due metri al secondo. Lo scarto nell’ordine richiesto è positivo.',
 r'V=\sqrt{4}\,\mathrm{m/s}\qquad V=2\,\mathrm{m/s}\qquad e=(4-2)\,\mathrm{m/s}\qquad e=+2\,\mathrm{m/s}',
 '−2 inverte la sottrazione, quattro ripete la proposta e uno dimezza ancora la differenza. Se V fosse davvero quattro a r=1 m, servirebbe μ=16 m³/s² per una circonferenza: la proposta non è compatibile con il campo assegnato.', 'Controlla V²=μ/r prima di sottrarre.'),
('L’inversa mantiene il quadrato',SCENE+'Quale formula isola μ da V=√(μ/r)?',['μ=V²r','μ=Vr','μ=V²/r','μ=r/V²','μ=2 V²r'],
 'V è positivo e la radice è definita per μ,r positivi. Eleviamo al quadrato e moltiplichiamo per r: μ=V²r. Le unità si combinano in m³/s², quelle del parametro centrale.',
 r'V^2=\mu/r\qquad rV^2=\mu\qquad \mu=V^2r',
 'Vr dimentica il quadrato; V²/r ha unità di accelerazione; r/V² dà un rapporto inverso. Il due aggiuntivo appartiene a un altro problema energetico e non all’equilibrio radiale circolare. La sostituzione nella legge positiva restituisce V.', 'Togli la radice prima di isolare μ.'),
('Due fattori dentro una radice',SCENE+'B ha μ_B=κ₁μ_A e r_B=κ₂r_A, con fattori positivi ed entrambe le orbite nel dominio. Quanto vale V_B/V_A?',['√(κ₁/κ₂)','κ₁/κ₂','√(κ₁κ₂)','√(κ₂/κ₁)','κ₁/√κ₂'],
 'Il rapporto μ/r riceve κ₁ al numeratore e κ₂ al denominatore. Per la rapidità occorre ancora la radice: V_B/V_A=√(κ₁/κ₂). I fattori non sono leggi variabili nel tempo durante un’orbita, ma confronti tra sistemi circolari.',
 r'V_B^2/V_A^2=\kappa_1/\kappa_2\qquad V_B/V_A=\sqrt{\kappa_1/\kappa_2}',
 'κ₁/κ₂ salta la radice, il prodotto inverte l’effetto del raggio e il reciproco scambia le prove. κ₁/√κ₂ lascia μ fuori dalla radice. Con fattori uguali la rapidità rimane uguale, mentre raggio e accelerazione possono cambiare.', 'Confronta prima V² nelle due prove.'),
('Una rapidità esatta con radice non intera',SCENE+'A ha μ_A=4 m³/s²,r_A=1 m; B ha μ_B=1 m³/s²,r_B=2 m. Quanto vale V_B/V_A?',['√2/4','√2/2','1/4','2√2','1/2'],
 'A ha V_A=2 m/s. Per B, V_B=√(1/2) m/s=√2/2 m/s; questa identità si ottiene moltiplicando numeratore e denominatore di 1/√2 per √2. Dividere ancora per due dà √2/4, esatto senza stimare la radice.',
 r'V_A=2\,\mathrm{m/s}\qquad V_B=\frac{\sqrt2}{2}\,\mathrm{m/s}\qquad V_B/V_A=\frac{\sqrt2}{4}',
 '√2/2 ripete V_B come numero senza dividere per V_A; un quarto tratta μ direttamente e non sotto radice; 2√2 inverte il confronto e un mezzo conserva soltanto una delle variazioni. Il simbolo √2 è la risposta esatta, non una richiesta di decimalizzazione.', 'Lascia √2 esatto e distingui V_B dal rapporto.'),
('Media di rapidità orbitali',SCENE+'A ha μ=4 m³/s²,r=1 m; B ha μ=1 m³/s²,r=2 m. Qual è la media aritmetica di V_A,V_B con uguale peso?',['(4+√2)/4 m/s','(4+√2)/2 m/s','(4+√2)/8 m/s','√(5/3) m/s','√2/4 m/s'],
 'Le rapidità sono 2 e √2/2 m/s. Diamo loro denominatore due, sommiamo (4+√2)/2 m/s e dividiamo per due. La media è (4+√2)/4 m/s. Non serve una valutazione numerica della radice.',
 r'V_A=2\,\mathrm{m/s}\qquad V_B=\frac{\sqrt2}{2}\,\mathrm{m/s}\qquad \overline V=\frac{4+\sqrt2}{4}\,\mathrm{m/s}',
 'Il denominatore due dà la somma, otto divide ancora. Gli ingressi medi μ=5/2 m³/s²,r=3/2 m darebbero √(5/3) m/s, una terza orbita, non la media delle uscite. √2/4 è il rapporto fra le due rapidità, non la loro media con unità m/s.', 'Somma 2 e √2/2 come espressioni esatte e poi dimezza.'),
('Scegliere il raggio con un obiettivo simbolico',SCENE+'A ha μ_A=4 m³/s²,r_A=1 m. In B si impone μ_B=1 m³/s² e si vuole V_B=(√2/4)V_A. Quanto vale r_B/r_A?',2,
 'La rapidità iniziale due dà un bersaglio V_B=√2/2 m/s. Il suo quadrato è 1/2 m²/s². Dall’inversa r_B=μ_B/V_B² otteniamo due metri; il rapporto al raggio iniziale un metro è due.',
 r'V_B=\frac{\sqrt2}{2}\,\mathrm{m/s}\qquad V_B^2=\frac12\,\mathrm{m^2/s^2}\qquad r_B=\mu_B/V_B^2\qquad r_B=2\,\mathrm m\qquad r_B/r_A=2',
 'Non si divide per √2/2 senza elevarlo al quadrato. La semplificazione (√2)²=2 rende il procedimento manuale esatto. Tenere r a un metro con μ=1 darebbe V=1 m/s, diverso dall’obiettivo.', 'Quadra il bersaglio simbolico prima dell’inversa.'),
('Tarare una lettura con √2',SCENE+'Un display continuo adimensionale segue S=qV, q>0 costante e offset nullo. Il riferimento μ=4 m³/s²,r=1 m dà S=6. Una prova con r=2 m dà S=3√2/2. Quanto vale μ in m³/s²?',1,
 'Il riferimento ha V=2 m/s e quindi q=3 s/m. Dividendo la nuova lettura per tre troviamo V=√2/2 m/s. Il quadrato è un mezzo m²/s²; moltiplicato per r=2 m restituisce μ=1 m³/s².',
 r'q=3\,\mathrm{s/m}\qquad V=\frac{\sqrt2}{2}\,\mathrm{m/s}\qquad V^2=\frac12\,\mathrm{m^2/s^2}\qquad \mu=V^2r\qquad \mu=1\,\mathrm{m^3/s^2}',
 'Usare la lettura come rapidità SI introdurrebbe il quadrato del guadagno tre e darebbe μ=9 m³/s². La radice resta simbolica e scompare esattamente nel quadrato. Il display è continuo e può mostrare un’espressione non intera nel modello ideale.', 'Elimina q prima di elevare al quadrato.'),
('Separare un offset con radici esatte',SCENE+'Un display continuo adimensionale segue S=qV+b, q>0,b costanti. A: μ=4 m³/s²,r=1 m,S=5. B: μ=1 m³/s²,r=2 m,S=1+√2. C: r=1 m,S=9. Quanto vale μ_C?',['4 m³/s²','8 m³/s²','16 m³/s²','32 m³/s²','64 m³/s²'],
 'I riferimenti hanno rapidità 2 e √2/2 m/s. Nella differenza, ΔS=√2−4 e ΔV=(√2−4)/2 m/s: si cancella lo stesso fattore non nullo e q=2 s/m. Da A segue b=1. La lettura nove dà V_C=4 m/s e μ_C=4²·1=16 m³/s².',
 r'\Delta S=\sqrt2-4\qquad \Delta V=\frac{\sqrt2-4}{2}\,\mathrm{m/s}\qquad q=2\,\mathrm{s/m}\qquad b=1\qquad V_C=4\,\mathrm{m/s}\qquad \mu_C=16\,\mathrm{m^3/s^2}',
 'Il fattore comune è non nullo perché √2 non è quattro: confrontando i quadrati si hanno 2 e16. Le alternative μ=4,8,32,64 a r=1 darebbero letture 5,1+4√2,1+8√2,17, diverse da nove. Nessuna approssimazione decimale è necessaria.', 'Fattorizza la differenza delle rapidità prima di fare il rapporto di taratura.'),
('Una misura coerente ma ridondante',SCENE+'Tra orbite si impone μ=cr, con c=4 m²/s² fisso. Si misura V=2 m/s. Quante coppie positive (μ,r) soddisfano tutti i dati nel modello centrale puntiforme?',['Nessuna','Una','Due','Tre','Infinite'],
 'Sostituiamo il vincolo nella legge: V²=cr/r=c, perché r>0. Ogni raggio positivo con μ=cr dà quindi V=2 m/s. La misura è coerente ma non fornisce una seconda informazione indipendente per identificare una sola coppia.',
 r'\mu=cr\qquad V^2=cr/r\qquad V^2=c\qquad V=2\,\mathrm{m/s}',
 'Per esempio r=1 m,μ=4 m³/s² e r=2 m,μ=8 m³/s² sono coppie diverse con la stessa rapidità. L’intero intervallo r>0 ne offre infinite. r=0 resta escluso dalla legge gravitazionale; non occorre annullare μ. Per un corpo esteso servirebbe anche il dominio esterno, non adottato qui come vincolo ulteriore.', 'Controlla se il vincolo fa scomparire davvero il raggio dall’uscita.')]
CHOICES={2:1,3:0,4:0,7:0,9:0,10:0,11:0,12:0,15:2,16:4}
UNITS={1:'m/s',5:'m³/s²',6:'m',8:'m/s',13:'1',14:'m³/s²'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/circular-orbit-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-circular-orbit-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Orbite circolari ideali','order':6720+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L006','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005','C1-L006'],'reuse':['C6'],
            'family':'circular-orbit','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'La gravità è la risultante centripeta; V è una rapidità positiva, r una distanza dal centro.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L006'},
            'coverage':['Orbita circolare newtoniana di una massa di prova','Rapidità tangente e risultante centripeta'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Modello centrale puntiforme. Primo pannello μ4 m³/s²,r1 m: raggio100px a100px/m, rapidità tangente2m/s con freccia100px a50px per m/s, accelerazione centripeta4m/s² con freccia80px a20px per m/s². Secondo pannello deriva la cancellazione della massa di prova. Confronto finale a μ4: orbite r1 e4m, raggi40 e160px a40px/m, con V2 e1m/s. Nelle proiezioni separate delle rapidità, frecce100 e50px alla stessa scala50px per m/s. Le scale geometriche del confronto e del primo esempio sono diverse e dichiarate.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.circular_orbit_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'circular-orbit-067.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'circular-orbit-067-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
