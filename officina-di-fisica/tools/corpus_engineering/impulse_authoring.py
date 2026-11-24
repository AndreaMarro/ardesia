"""Author constant-force impulse drafts; no independent self approval."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='In un riferimento inerziale la forza risultante su un corpo ha modulo F>0 e direzione costante durante un intervallo di durata Δt>0. Scegliamo l’asse positivo nel verso della forza: F_x=+F. J è il modulo dell’impulso della risultante, mentre J_x è la sua componente con segno. Per questo intervallo J_x=FΔt>0 e J=J_x. '
TASKS=[
('L’area di una forza costante nel tempo',SCENE+'Con F=2 N e Δt=2 s, quanto vale J in N·s?',4,
 'Nel grafico forza–tempo l’impulso è l’area con segno sotto F_x. La forza assegnata è costante e positiva: l’area è un rettangolo, di altezza due newton e base due secondi. Il prodotto è quattro N·s: il secondo moltiplica il newton e non lo divide.',
 r'J_x=F\Delta t\qquad J_x=(2\,\mathrm N)(2\,\mathrm s)\qquad J_x=4\,\mathrm{N\,s}\qquad J=4\,\mathrm{N\,s}',
 'L’impulso della risultante è anche Δp_x=+4 kg·m/s. Non è la quantità di moto finale se quella iniziale non era nulla: sappiamo quanto cambia, non il valore iniziale. Il simbolo J qui indica l’impulso, mentre il simbolo dell’unità joule in altri contesti indica energia.', 'Calcola l’area rettangolare forza per durata, mantenendo separate le unità.'),
('L’impulso non si misura in joule','Per una risultante costante J=FΔt è il modulo dell’impulso. F è in newton e Δt in secondi. Quale unità proposta è adatta a J?',['N','N·s','J','W','N/s'],
 'Il tempo moltiplica la forza. Poiché un newton equivale a kg·m/s², un fattore secondo cancella uno dei secondi al denominatore. Rimane kg·m/s, la stessa dimensione della variazione di quantità di moto.',
 r'[J]=ML/T\qquad \mathrm{N\,s}=\mathrm{kg\,m/s}',
 'N sarebbe la sola forza; N/s sarebbe forza divisa per durata. J come unità è joule e misura energia, W è watt e misura potenza. Il simbolo della grandezza impulso J non ne decide l’unità: occorre leggere la relazione fisica.', 'Espandi N e moltiplica per s, anziché dividere.'),
('Lo stesso impulso con una forza più debole','Nel riferimento inerziale una forza costante di 6 N agisce verso destra per 2 s. Quale modulo di forza costante, ancora verso destra, produce lo stesso impulso in 3 s?',['2 N','3 N','4 N','6 N','9 N'],
 'Il primo impulso orientato è +12 N·s. Per mantenerlo mentre la durata passa da due a tre secondi occorre distribuire la stessa area su una base maggiore. Dividiamo dodici newton-secondo per tre secondi e troviamo quattro newton.',
 r'J_1=(6\,\mathrm N)(2\,\mathrm s)\qquad J_1=12\,\mathrm{N\,s}\qquad F_2=J_1/(3\,\mathrm s)\qquad F_2=4\,\mathrm N',
 'Sei N in tre secondi darebbero 18 N·s; nove N invertirebbero l’effetto del tempo maggiore e darebbero 27 N·s. Due e tre N produrrebbero rispettivamente 6 e 9 N·s. La stessa area non richiede la stessa forza massima: entrambe le pulsazioni qui sono rettangolari e concordi.', 'Mantieni il prodotto FΔt uguale a 12 N·s.'),
('Più forza nello stesso intervallo',SCENE+'Fra due prove Δt=2 s resta uguale e F passa da 2 a 4 N. Come cambia J?',['Da 4 a 8 N·s','Resta 4 N·s','Da 4 a 16 N·s','Da 4 a 2 N·s','Diventa zero'],
 'La base del rettangolo resta due secondi e raddoppia l’altezza. Anche l’area raddoppia: quattro N·s nella prima prova e otto nella seconda. Si confrontano due risultanti costanti, non una forza che cresce nel tempo dentro lo stesso intervallo.',
 r'J_A=4\,\mathrm{N\,s}\qquad J_B=(4\,\mathrm N)(2\,\mathrm s)\qquad J_B=8\,\mathrm{N\,s}',
 'Sedici raddoppierebbe anche la durata; due inverte l’effetto di F. Invariabilità e zero ignorano la nuova area positiva. La direzione dell’impulso resta quella della risultante, ma la velocità del corpo potrebbe avere inizialmente un altro verso.', 'Nell’area cambia solo l’altezza del rettangolo.'),
('Dall’impulso alla risultante',SCENE+'Si misura J=4 N·s e si conosce Δt=2 s. Quanto vale F in newton?',2,
 'La forza moltiplica la durata positiva. Per isolarla dividiamo l’impulso per Δt. Quattro newton-secondo divisi per due secondi danno due newton: il fattore tempo scompare anche nelle unità.',
 r'F=J/\Delta t\qquad F=\frac{4\,\mathrm{N\,s}}{2\,\mathrm s}\qquad F=2\,\mathrm N',
 'Il controllo 2 N·2 s=4 N·s ricostruisce il dato. Moltiplicare ancora per due secondi darebbe un’unità diversa da forza. Poiché è dichiarata costante, questa è la risultante in ogni istante dell’intervallo, non soltanto una media di un andamento ignoto.', 'Dividi per il tempo che moltiplicava F.'),
('La durata di una forza costante',SCENE+'Si misura J=4 N·s e si conosce F=2 N. Quanto vale Δt in secondi?',2,
 'Dalla relazione J=FΔt dividiamo per F>0. L’impulso contiene forza per tempo: togliendo la forza rimangono secondi. La durata positiva ricostruita è due secondi.',
 r'\Delta t=J/F\qquad \Delta t=\frac{4\,\mathrm{N\,s}}{2\,\mathrm N}\qquad \Delta t=2\,\mathrm s',
 'Quattro ripeterebbe il numero dell’impulso senza svolgere l’inversa. Un mezzo invertirebbe il quoziente e avrebbe unità inverse di tempo. Non occorre conoscere la massa del corpo: la domanda ricostruisce l’intervallo dalla forza e dal suo impulso.', 'Cancella N nel rapporto impulso/forza.'),
('Durata doppia, impulso doppio',SCENE+'F=2 N in entrambe le prove; Δt_A=2 s e Δt_B=4 s. Quanto vale J_B/J_A?',['2','1/2','4','1','−2'],
 'La stessa risultante agisce due volte più a lungo. Le aree sono quattro e otto N·s, quindi il rapporto finale su iniziale è due. Le unità si cancellano, perché si confrontano due impulsi nella stessa scala.',
 r'J_A=4\,\mathrm{N\,s}\qquad J_B=8\,\mathrm{N\,s}\qquad J_B/J_A=2',
 'Un mezzo inverte il confronto; quattro introduce un quadrato della durata assente. Uno ignora il nuovo intervallo e −2 non può essere il rapporto di moduli positivi. La variazione di quantità di moto lungo l’asse raddoppia anch’essa, senza assegnare la quantità di moto iniziale.', 'Con F fissa si confrontano soltanto le durate.'),
('Scarto fra due impulsi',SCENE+'Con F=2 N,Δt=2 s si propone J_proposto=8 N·s. Quanto vale proposto meno corretto?',['+4 N·s','−4 N·s','+8 N·s','0 N·s','+2 N·s'],
 'Il prodotto corretto è quattro N·s. Sottraendolo dalla proposta otto otteniamo quattro N·s positivi. La proposta doppia non discende dalla costanza della forza: non compare alcun fattore due aggiuntivo nell’area del rettangolo.',
 r'J=4\,\mathrm{N\,s}\qquad e=(8-4)\,\mathrm{N\,s}\qquad e=+4\,\mathrm{N\,s}',
 '−4 inverte l’ordine, otto ripete la proposta, zero la accetta e due dimezza ancora lo scarto. Non si chiede un’energia o una forza: anche la differenza conserva l’unità dell’impulso.', 'Forma lo scarto solo dopo aver calcolato FΔt.'),
('Un’inversa del prodotto forza–tempo',SCENE+'Quale formula isola F dalla relazione J=FΔt?',['F=J/Δt','F=JΔt','F=Δt/J','F=2J/Δt','F=J/(2Δt)'],
 'Dividiamo entrambi i membri per la durata non nulla. L’impulso diviso per tempo ha unità N. Non va inserito il mezzo di un’area triangolare: la forza qui è costante e il suo grafico è rettangolare.',
 r'J/\Delta t=F\qquad F=J/\Delta t',
 'JΔt moltiplica ancora il tempo e non isola; Δt/J ha unità inversa di forza. Il due aggiunto o tolto cambierebbe l’impulso ricostruito. Una forza variabile richiederebbe la sua area o una media, ma questo non altera l’inversa della forza costante assegnata.', 'La durata che moltiplica l’incognita passa al denominatore.'),
('Cambiare forza e durata fra prove',SCENE+'B usa F_B=κ₁F e Δt_B=κ₂Δt, con κ₁,κ₂>0; F,Δt indicano A. Quanto vale J_B/J_A?',['κ₁ κ₂','κ₁ / κ₂','κ₂ / κ₁','κ₁ + κ₂','κ₁ κ₂²'],
 'Nel prodotto della seconda prova entrano entrambi i fattori: uno dalla forza e uno dalla durata. Nel rapporto si cancellano F e Δt, positivi. Resta κ₁κ₂, senza dipendenza quadratica dal tempo.',
 r'J_A=F\Delta t\qquad J_B=\kappa_1\kappa_2F\Delta t\qquad J_B/J_A=\kappa_1\kappa_2',
 'I quozienti invertirebbero un effetto; il quadrato conterebbe due volte il cambiamento della durata. La somma darebbe due per κ₁=κ₂=1, mentre la prova identica deve dare rapporto uno. Forza e durata sono costanti dentro ciascuna prova, anche quando differiscono fra prove.', 'Scala una sola volta ciascun lato del rettangolo.'),
('Due raddoppi del rettangolo',SCENE+'A usa F=2 N,Δt=2 s e B usa F=4 N,Δt=4 s. Quanto vale J_B/J_A?',4,
 'La prima area vale quattro N·s, la seconda sedici. La forza doppia e la durata doppia moltiplicano l’area per quattro, non per due. Il numero sedici è l’impulso B, da dividere per i quattro iniziali.',
 r'J_A=4\,\mathrm{N\,s}\qquad J_B=16\,\mathrm{N\,s}\qquad J_B/J_A=4',
 'Due considera solo un raddoppio; otto attribuirebbe un quadrato a un ingresso. Un quarto è il rapporto inverso. Si chiede un rapporto puro, non sedici newton-secondo.', 'Moltiplica i due fattori due e verifica con 16/4.'),
('Media di impulsi di prove diverse',SCENE+'A ha F=2 N,Δt=2 s; B ha F=4 N,Δt=4 s. Qual è la media aritmetica di J_A,J_B con uguale peso?',['10 N·s','20 N·s','5 N·s','9 N·s','12 N·s'],
 'Le due aree sono quattro e sedici N·s. La semisomma è dieci N·s. La media riguarda queste due variazioni di quantità di moto osservate in prove diverse, non un impulso totale di due pulsazioni consecutive.',
 r'J_A=4\,\mathrm{N\,s}\qquad J_B=16\,\mathrm{N\,s}\qquad \overline J=\frac{4+16}{2}\,\mathrm{N\,s}\qquad \overline J=10\,\mathrm{N\,s}',
 'Venti somma, cinque divide ancora, dodici non è la semisomma. Usare gli ingressi medi F=3 N e Δt=3 s darebbe 9 N·s, non dieci: la media del prodotto non è qui il prodotto delle medie. Dieci sta correttamente tra quattro e sedici.', 'Media i due prodotti completi.'),
('Scegliere il tempo necessario',SCENE+'A ha F_A=2 N,Δt_A=2 s. Si impone F_B=4 N e si vuole J_B=4J_A. Quanto vale Δt_B/Δt_A?',2,
 'L’impulso iniziale è quattro N·s e quello obiettivo sedici. La forza nuova quattro N richiede una durata di quattro secondi. Rapportata ai due secondi iniziali dà due: il raddoppio della forza fornisce già un fattore due dell’obiettivo.',
 r'J_B=16\,\mathrm{N\,s}\qquad \Delta t_B=J_B/F_B\qquad \Delta t_B=4\,\mathrm s\qquad \Delta t_B/\Delta t_A=2',
 'Durata uguale darebbe impulso doppio, non quadruplo. Durata quadrupla con forza doppia darebbe otto volte l’iniziale. Quattro secondi è la nuova durata e non il rapporto quattro.', 'Dividi l’impulso obiettivo per la forza nuova.'),
('Taratura dell’impulso prima della forza',SCENE+'Un display continuo adimensionale legge S=qJ, con q>0 costante e offset nullo. Il riferimento F=2 N,Δt=2 s dà S=12. Una prova con Δt=4 s dà S=48. Quanto vale F in N?',4,
 'Il riferimento vale J=4 N·s e quindi q=3 (N·s)⁻¹. La lettura 48 corrisponde a 16 N·s. Dividendo questo impulso per quattro secondi troviamo quattro newton, dopo la conversione strumentale.',
 r'q=3\,\mathrm{(N\,s)^{-1}}\qquad J=48/q\qquad J=16\,\mathrm{N\,s}\qquad F=J/\Delta t\qquad F=4\,\mathrm N',
 'Usare S=48 come impulso SI darebbe dodici newton, con il guadagno tre non rimosso. Il controllo 4 N·4 s=16 N·s e S=3·16=48 ricostruisce i due passaggi.', 'Decodifica J e poi dividi per la durata.'),
('Una taratura con offset',SCENE+'Un display continuo adimensionale legge S=qJ+b, con q>0,b costanti. A: F=2 N,Δt=2 s,S=9. B: F=4 N,Δt=4 s,S=33. C: Δt=2 s,S=17. Quanto vale F_C?',['2 N','3 N','4 N','5 N','8 N'],
 'Gli impulsi noti sono quattro e sedici N·s. La differenza delle letture è 24 e quella degli impulsi 12 N·s: q=2 (N·s)⁻¹. Dal primo riferimento b=1. La lettura diciassette dà J_C=8 N·s e, in due secondi, F_C=4 N.',
 r'q=2\,\mathrm{(N\,s)^{-1}}\qquad b=1\qquad J_C=(17-1)/q\qquad J_C=8\,\mathrm{N\,s}\qquad F_C=4\,\mathrm N',
 'Le forze 2,3,5,8 N in due secondi darebbero letture 9,13,21,33. Solo quattro restituisce diciassette. Il rapporto delle letture grezze non elimina l’offset; occorre sottrarlo prima di dividere per il guadagno.', 'Trova prima guadagno e offset usando i due impulsi di riferimento.'),
('Un vincolo fra forza e durata di prove diverse',SCENE+'Si selezionano prove con F=cΔt, dove c=1 N/s è fisso. F rimane costante dentro ogni intervallo: il vincolo collega prove diverse, non una rampa temporale della forza. Se J=4 N·s, quanto vale Δt in s?',2,
 'Sostituendo il valore costante F=cΔt nel prodotto J=FΔt otteniamo J=c(Δt)². Il rapporto J/c ha unità s² e vale quattro secondi quadrati. La radice positiva è due secondi, da cui F=2 N.',
 r'J=c(\Delta t)^2\qquad (\Delta t)^2=J/c\qquad (\Delta t)^2=4\,\mathrm{s^2}\qquad \Delta t=2\,\mathrm s\qquad F=2\,\mathrm N',
 'Il ramo negativo non è una durata e renderebbe negativo anche il modulo F nel vincolo. Una durata uno o tre darebbe rispettivamente 1 e 9 N·s. Non compare un mezzo di area triangolare: durante ciascuna prova la forza è già fissata e costante.', 'Sostituisci il vincolo fra prove senza trasformarlo in F(t) dentro una prova.')]
CHOICES={2:1,3:2,4:0,7:0,8:0,9:0,10:0,12:0,15:2}
UNITS={1:'N·s',5:'N',6:'s',11:'1',13:'1',14:'N',16:'s'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/impulse-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-impulse-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Impulso e quantità di moto','order':5520+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L009','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005','C1-L009'],'reuse':['C6'],
            'family':'impulse','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'L’impulso della risultante dà Δp; una forza costante produce area rettangolare.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L009'},
            'coverage':['Impulso della risultante','Area forza-tempo e variazione della quantità di moto'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Risultante costante2N per2s: rettangolo impulso4N·s, scale80px/s e40px/N. Confronto separato delle pulsazioni6N per2s e4N per3s: entrambe12N·s; stessa scala60px/s e20px/N nel confronto. La variazione orientata di quantità di moto coincide con l’impulso della risultante. Assi e scale distinti espliciti.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.impulse_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'impulse-055.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'impulse-055-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
