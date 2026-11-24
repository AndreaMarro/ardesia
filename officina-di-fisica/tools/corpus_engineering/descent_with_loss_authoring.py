"""Author sixteen straight-descent energy balances with a prescribed resistive force."""
import base64,json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SCENE='Un punto materiale di massa m>0 parte da fermo lungo una guida rettilinea fissa in discesa, di lunghezza L e dislivello verticale h, con 0<h≤L. Il campo è uniforme, g=10 m/s². Una resistenza tangenziale prescritta ha modulo mc, con c=1 N/kg=1 m/s² costante, opposta alla discesa; non è una legge μN e non ha una soglia statica aggiuntiva. La reazione normale ideale non compie lavoro; non ci sono altre forze che compiano lavoro. Nel riferimento inerziale del laboratorio, gh>cL rende positiva la risultante lungo la guida e consente l’avvio nel modello. V>0 è la rapidità finale. '
TASKS=[
('Dove va l’energia della discesa',SCENE+'Con h=1 m e L=2 m, quanto vale V in m/s?',4,
 'Il peso compie lavoro +mgh e la resistenza −mcL. La variazione di energia cinetica parte da zero, quindi mV²/2=mgh−mcL. Dividendo per la massa restano 10−2=8 J/kg; raddoppiare dà V²=16 m²/s² e la radice positiva è quattro metri al secondo.',
 r'\frac12mV^2=mgh-mcL\qquad V^2=2gh-2cL\qquad V^2=16\,\mathrm{m^2/s^2}\qquad V=4\,\mathrm{m/s}',
 'La perdita meccanica mcL è positiva e minore di mgh: per unità di massa vale 2 J/kg contro 10 J/kg. L’energia meccanica non si conserva, mentre la perdita può alimentare energia interna dell’ambiente resistente. La massa si cancella perché il modello assegna una forza resistente proporzionale a m. La rapidità non dà da sola una componente cartesiana senza specificare la direzione della guida.', 'Somma i lavori con segno e usa ΔK, non la conservazione dell’energia meccanica.'),
('L’unità della rapidità dopo le perdite','Nel bilancio di una discesa V=√(2gh−2cL), g e c hanno unità m/s², mentre h e L sono lunghezze. Quale unità proposta esprime V?',['m','m/s','m²/s²','J','1'],
 'Entrambi i termini gh e cL sono accelerazione per lunghezza, dunque m²/s². Possono essere sottratti perché hanno la stessa dimensione. La radice lascia m/s, l’unità di una rapidità.',
 r'[gh]=[cL]\qquad [gh]=L^2/T^2\qquad [V]=L/T',
 'm²/s² è l’unità del radicando, non di V. J richiederebbe anche una massa per esprimere energia; m è solo una lunghezza e uno un rapporto puro. c=1 N/kg è un’accelerazione dimensionalmente, anche se descrive una forza per unità di massa.', 'Controlla la dimensione di ciascun termine prima della radice.'),
('Il segno del lavoro resistente',SCENE+'Quale formula dà V?',['V=√(2gh−2cL)','V=√(2gh+2cL)','V=√(gh−cL)','V=2gh−2cL','V=√(2gh)'],
 'Il peso trasferisce energia alla parte cinetica, la resistenza la sottrae. Il bilancio mV²/2=mgh−mcL porta a V=√(2gh−2cL), selezionando la radice positiva. La condizione gh>cL mantiene positiva l’energia cinetica finale e, sulla guida rettilinea con forza prescritta, anche l’accelerazione lungo tutta la discesa.',
 r'W_g=+mgh\qquad W_r=-mcL\qquad \Delta K=W_g+W_r\qquad V=\sqrt{2gh-2cL}',
 'Il più farebbe compiere lavoro positivo alla resistenza; togliere il fattore due dimentica il mezzo della cinetica. Il radicando senza radice ha unità di rapidità al quadrato. √(2gh) ignora la perdita: vale soltanto nel distinto limite di resistenza nulla. Qui 0<mcL<mgh.', 'Il lavoro resistente è negativo, mentre la perdita mcL è un modulo positivo.'),
('Dislivello maggiore sulla stessa lunghezza',SCENE+'A ha h=1 m,L=2 m; B ha h=2 m,L=2 m. Come cambia V?',['Da 4 a 6 m/s','Da 4 a 8 m/s','Resta 4 m/s','Da 4 a 2 m/s','Diventa zero'],
 'La perdita per unità di massa resta cL=2 J/kg, ma il lavoro del peso passa da 10 a 20 J/kg. Le rapidità quadrate sono 2(10−2)=16 e 2(20−2)=36 m²/s². Le radici positive sono quattro e sei metri al secondo.',
 r'V_A^2=16\,\mathrm{m^2/s^2}\qquad V_A=4\,\mathrm{m/s}\qquad V_B^2=36\,\mathrm{m^2/s^2}\qquad V_B=6\,\mathrm{m/s}',
 'Otto renderebbe V direttamente proporzionale ad h; invarianza ignora il lavoro gravitazionale maggiore. B ha h=L e quindi guida verticale: è consentita, perché la resistenza è prescritta e non proporzionale alla normale. Non stiamo usando una forza d’attrito secco che si annullerebbe necessariamente con N.', 'Mantieni la stessa perdita e ricostruisci il nuovo radicando.'),
('Ricostruire il dislivello',SCENE+'Si misura V=4 m/s e si conosce L=2 m. Quanto vale h, in m?',1,
 'Eliminiamo la radice, riportiamo la perdita dall’altro lato e dividiamo per 2g. L’altezza vale (V²+2cL)/(2g). Il numeratore è 16+4=20 m²/s²; diviso per 20 m/s² dà un metro.',
 r'V^2+2cL=2gh\qquad h=\frac{V^2+2cL}{2g}\qquad h=\frac{20\,\mathrm{m^2/s^2}}{20\,\mathrm{m/s^2}}\qquad h=1\,\mathrm m',
 'Il più nell’inversa è necessario: il dislivello deve fornire sia la cinetica sia la perdita. La soluzione rispetta h≤L e gh=10>cL=2 m²/s². Ignorare la resistenza darebbe h=4/5 m, una pista che non riproduce i dati assegnati con c=1.', 'Ricostruisci tutta l’energia richiesta prima di dividere per g.'),
('La lunghezza dissipativa',SCENE+'Si misura V=4 m/s e si conosce h=1 m. Quanto vale L, in m?',2,
 'Da V²=2gh−2cL isoliamo 2cL=2gh−V². Il numeratore vale 20−16=4 m²/s²; dividendo per 2c=2 m/s² si trovano due metri. È la lunghezza percorsa dalla resistenza, non il solo dislivello verticale.',
 r'2cL=2gh-V^2\qquad L=\frac{2gh-V^2}{2c}\qquad L=\frac{4\,\mathrm{m^2/s^2}}{2\,\mathrm{m/s^2}}\qquad L=2\,\mathrm m',
 'La ricostruzione va controllata geometricamente: L=2≥h=1 e gh>cL. Una misura arbitraria di V potrebbe dare L negativo o minore di h, segnalando incompatibilità col modello. Non basta isolare un numero positivo per garantirne la validità fisica.', 'Sottrai la cinetica per unità di massa al contributo gravitazionale.'),
('Più percorso con lo stesso dislivello',SCENE+'A ha h=1 m,L=2 m; B ha h=1 m,L=8 m. Quanto vale V_B/V_A?',['1/2','2','1/4','4','1'],
 'Il lavoro del peso per unità di massa resta dieci J/kg. Le perdite aumentano da due a otto J/kg, quindi la cinetica finale per unità di massa passa da otto a due J/kg. V_A=4 m/s e V_B=2 m/s: il rapporto è un mezzo.',
 r'V_A^2=16\,\mathrm{m^2/s^2}\qquad V_B^2=4\,\mathrm{m^2/s^2}\qquad V_A=4\,\mathrm{m/s}\qquad V_B=2\,\mathrm{m/s}\qquad V_B/V_A=1/2',
 'Uno seguirebbe soltanto la quota; due e quattro farebbero aumentare l’uscita con le perdite; un quarto confonde il rapporto dei quadrati con quello delle rapidità. B è ancora ammissibile: L8≥h1 e 10>8. L’accelerazione lungo la guida è gh/L−c=1/4 m/s², positiva.', 'Calcola prima quanto lavoro netto resta nelle due guide.'),
('Una proposta senza il controllo dell’energia',SCENE+'Con h=1 m,L=2 m si propone V_proposto=8 m/s. Quanto vale proposto meno corretto, in m/s?',4,
 'Il bilancio dà V²=16 m²/s² e V=4 m/s. La proposta otto supera il corretto di quattro metri al secondo. Avrebbe una cinetica specifica 8²/2=32 J/kg, maggiore persino del lavoro gravitazionale disponibile dieci J/kg.',
 r'V=4\,\mathrm{m/s}\qquad e=(8-4)\,\mathrm{m/s}\qquad e=+4\,\mathrm{m/s}',
 '−4 cambia l’ordine della sottrazione, otto ripete la proposta e due dimezza lo scarto. Non si può attribuire alla resistenza l’energia mancante: il suo lavoro è negativo. Il controllo energetico scarta la proposta anche prima del confronto numerico finale.', 'Confronta la proposta con il bilancio, poi rispetta l’ordine dello scarto.'),
('L’inversa riaggiunge la perdita',SCENE+'Quale formula isola h dalla relazione V=√(2gh−2cL)?',['h = (V² + 2 c L) / (2 g)','h = (V² − 2 c L) / (2 g)','h = V² / (2 g)','h = (V + 2 c L) / (2 g)','h = (V² + 2 c L) / g'],
 'La rapidità positiva consente di elevare al quadrato senza introdurre un segno ambiguo. Portiamo −2cL nell’altro membro e dividiamo per 2g>0. h=(V²+2cL)/(2g); le due quantità al numeratore hanno la stessa unità m²/s².',
 r'V^2=2gh-2cL\qquad V^2+2cL=2gh\qquad h=\frac{V^2+2cL}{2g}',
 'Il meno lascia la perdita dal lato sbagliato; V²/(2g) la ignora. V senza quadrato non può essere sommata a 2cL per dimensioni diverse. L’ultima formula dimentica il fattore due e raddoppia h. Anche l’inversa corretta richiede poi il controllo h≤L e gh>cL.', 'Quadra V e riporta il termine dissipativo con il segno opposto.'),
('Confrontare i lavori specifici residui',SCENE+'A ha dati h,L. B ha h_B=κ₁h e L_B=κ₂L, con fattori positivi, κ₁h≤κ₂L e gκ₁h>cκ₂L. Definiamo e_A=gh−cL, lavoro netto per unità di massa di A. In B, e_B=gκ₁h−cκ₂L. Quanto vale V_B/V_A?',['√(e_B/e_A)','e_B/e_A','√(e_A/e_B)','κ₁/κ₂','√κ₁'],
 'Il teorema dell’energia cinetica per unità di massa dà V_A²=2e_A e V_B²=2e_B. Il rapporto dei quadrati è e_B/e_A e quello delle rapidità positive la sua radice. Entrambi i lavori specifici sono positivi per le condizioni assegnate.',
 r'V_A^2=2e_A\qquad V_B^2=2e_B\qquad V_B^2/V_A^2=e_B/e_A\qquad V_B/V_A=\sqrt{e_B/e_A}',
 'e_B/e_A dimentica la radice; il reciproco scambia A e B. Un rapporto dei soli fattori non descrive in generale una differenza tra contributo gravitazionale e perdita. √κ₁ sarebbe valido solo per cambiamenti aggiuntivi che rendessero anche la perdita proporzionale nello stesso modo, qui non imposti.', 'Confronta i lavori netti completi prima delle radici.'),
('Una guida ingrandita con la stessa inclinazione',SCENE+'A ha h=1 m,L=2 m; B ha h=4 m,L=8 m. Quanto vale V_B/V_A?',2,
 'Entrambi i contributi gh e cL quadruplicano: il lavoro netto per unità di massa passa da otto a trentadue J/kg. V² passa da16 a64 m²/s², quindi le rapidità sono quattro e otto metri al secondo. Il rapporto è due.',
 r'V_A=4\,\mathrm{m/s}\qquad V_B^2=64\,\mathrm{m^2/s^2}\qquad V_B=8\,\mathrm{m/s}\qquad V_B/V_A=2',
 'Quattro segue il lavoro netto senza prendere la radice; un mezzo inverte il rapporto. Il rapporto h/L resta 1/2, perciò anche l’accelerazione tangenziale gh/L−c resta 4 m/s². La pista più lunga dà più tempo e più lavoro netto, non una forza resistente minore.', 'Conserva entrambi i termini e osserva il fattore comune quattro.'),
('Media delle rapidità di due discese',SCENE+'A ha h=1 m,L=2 m; B ha h=4 m,L=8 m. Qual è la media aritmetica di V_A,V_B con uguale peso, in m/s?',6,
 'Le rapidità delle due prove sono quattro e otto metri al secondo. La loro semisomma è sei metri al secondo. Le perdite sono già state sottratte in ciascun bilancio prima della media.',
 r'V_A=4\,\mathrm{m/s}\qquad V_B=8\,\mathrm{m/s}\qquad \overline V=\frac{4+8}{2}\,\mathrm{m/s}\qquad \overline V=6\,\mathrm{m/s}',
 'Dodici è la somma e tre divide ancora per due. Gli ingressi medi h=5/2 m,L=5 m darebbero V=√40=2√10 m/s, non sei: i quadrati 40 e36 sono diversi, senza dover approssimare √10. La media statistica non è la rapidità media durante una sola discesa.', 'Media le due uscite, non i dislivelli prima del calcolo.'),
('Scegliere quanto percorso dissipa',SCENE+'A ha h_A=1 m,L_A=2 m. In B si impone h_B=4 m e si vuole V_B=2V_A. Quanto vale L_B/L_A?',4,
 'V_A=4 m/s e l’obiettivo è V_B=8 m/s. Il contributo 2gh_B vale80 m²/s² e V_B² vale64. La differenza16 è 2cL_B; con 2c=2 m/s² segue L_B=8 m. Il rapporto a due metri è quattro.',
 r'V_B=8\,\mathrm{m/s}\qquad 2cL_B=(80-64)\,\mathrm{m^2/s^2}\qquad 2cL_B=16\,\mathrm{m^2/s^2}\qquad L_B=8\,\mathrm m\qquad L_B/L_A=4',
 'Due seguirebbe solo l’aumento della rapidità; otto è la lunghezza nuova e non il rapporto. Il controllo L_B8≥h_B4 e gh_B40>cL_B8 verifica geometria e avvio. La lunghezza non è libera di assumere qualunque valore pur di restare positiva.', 'Isola la perdita necessaria dopo avere quadrato la rapidità obiettivo.'),
('Tarare la rapidità e poi la quota',SCENE+'Un display continuo adimensionale segue S=qV, con q>0 costante e offset nullo. Il riferimento h=1 m,L=2 m dà S=12. Una prova con L=8 m dà S=24. Quanto vale h, in m?',4,
 'Il riferimento vale V=4 m/s, quindi q=3 s/m. La lettura24 dà V=8 m/s. Nell’inversa dell’altezza sommiamo V²=64 e 2cL=16 m²/s², poi dividiamo per 2g=20 m/s²: h=4 m.',
 r'q=3\,\mathrm{s/m}\qquad V=24/q\qquad V=8\,\mathrm{m/s}\qquad h=\frac{V^2+2cL}{2g}\qquad h=4\,\mathrm m',
 'Usare24come metri al secondo darebbe h=148/5 m, maggiore di L=8m e incompatibile con la geometria: la mancata taratura può violare anche il dominio. Il risultato quattro ricostruisce V8,S24 e il lavoro netto positivo.', 'Togli q prima di fare il quadrato della rapidità.'),
('Offset e verifica geometrica',SCENE+'Un display continuo adimensionale segue S=qV+b, con q>0,b costanti. A: h=1 m,L=2 m,S=9. B: h=4 m,L=8 m,S=17. C: L=2 m,S=13. Quanto vale h_C?',['1 m','3/2 m','2 m','3 m','4 m'],
 'Le rapidità note sono quattro e otto m/s. Il guadagno è (17−9)/(8−4)=2 s/m e l’offset uno. C ha V=(13−1)/2=6 m/s. L’altezza vale (36+4)/20=2 m: è proprio il caso di guida verticale ammesso dal modello di resistenza prescritta.',
 r'q=2\,\mathrm{s/m}\qquad b=1\qquad V_C=(13-1)/q\qquad V_C=6\,\mathrm{m/s}\qquad h_C=2\,\mathrm m',
 'Tre e quattro metri superano L_C=2 m e sono geometricamente esclusi. Un metro dà S=9; tre mezzi danno V²=26 m²/s² e lettura1+2√26, diversa da13 perché √26 non è6. Solo due metri ricostruiscono taratura e bilancio. Il rapporto grezzo delle letture non elimina b.', 'Calibra il display, ricava h e controlla h≤L anche per i distrattori.'),
('Un’inclinazione fissata dal vincolo',SCENE+'Fra guide si impone h=L/2. Se V=4 m/s, quanto vale L in m?',2,
 'Sostituendo h=L/2 nel bilancio troviamo V²=gL−2cL=(g−2c)L. Il coefficiente g−2c=8 m/s² è positivo. Quindi L=16/8=2 m e h=1 m. Dopo avere eliminato la radice, il vincolo lascia un’equazione lineare in L.',
 r'V^2=(g-2c)L\qquad g-2c=8\,\mathrm{m/s^2}\qquad L=V^2/(g-2c)\qquad L=2\,\mathrm m\qquad h=1\,\mathrm m',
 'Non si cerca una radice quadrata di L: la radice apparteneva alla rapidità e si è già eliminata. Quattro confonde una rapidità numerica con una lunghezza; uno e tre metri danno V²=8e24 m²/s², non16. Il vincolo rispetta h≤L e gh>cL per ogni L positivo, e la misura ne seleziona uno.', 'Sostituisci il rapporto geometrico prima di isolare L.')]
CHOICES={2:1,3:0,4:0,7:0,9:0,10:0,15:2}
UNITS={1:'m/s',5:'m',6:'m',8:'m/s',11:'1',12:'m/s',13:'1',14:'m',16:'m'}

def assemble(repo,source_ref):
    path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json'
    sources={q['id']:q for q in json.loads(git_bytes(repo,source_ref,path))}
    file=Path(__file__).resolve().parents[2]/'editorial/assets/descent-with-loss-steps.svg'
    raw=file.read_bytes()
    asset={'id':sha(raw),'name':file.name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}
    records,bindings=[],[]
    for n,(title,prompt,answer,before,law,after,hint) in enumerate(TASKS,1):
        source_id=f'u2-descent-with-loss-{n:02}'
        target={'type':'choice','options':answer,'value':answer[CHOICES[n]]} if isinstance(answer,list) else {'type':'numeric','value':answer,'unit':UNITS[n],'tolerance':0}
        row={'id':'AR-'+source_id,'kind':'question','course':'C1','section':'Bilanci energetici con resistenza','order':6820+n,
            'title':title,'version':1,'baseVersion':0,'skill':'C1-L008','prerequisites':['C1-L001','C1-L002','C1-L004','C1-L005','C1-L006','C1-L007','C1-L008'],'reuse':['C6'],
            'family':'descent-with-loss','difficulty':1 if n<=4 else 2 if n<=12 else 3,
            'prompt':prompt,'answer':target,'blocks':[text(before),*law_steps(law),text(after)],
            'hints':[hint,'Sottrai mcL dal lavoro mgh; controlla h≤L e gh>cL prima di prendere la radice positiva.'],
            'error':{'category':{2:'unità',3:'modello',4:'concetto',7:'calcolo',8:'calcolo',10:'modello',12:'modello',16:'modello'}.get(n,'algebra'),'message':after,'target':'C1-L008'},
            'coverage':['Lavoro resistente e variazione di energia cinetica','Dominio geometrico e lavoro netto positivo'],'review':'DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN'}
        checksums={}
        if n in (1,3):
            row['blocks'].insert(1,{'type':'figure','src':'/asset/'+asset['id'],'text':'Primo esempio h1m,L2m: guida rettilinea disegnata alla scala 120px/m, dislivello120px e lunghezza240px. Il lavoro del peso per unità di massa è10J/kg, perdita2J/kg e cinetica finale8J/kg: barre300,60,240px alla scala30px per J/kg. Confronto separato a h1m,L8m: perdita8J/kg,cinetica2J/kg,barre240 e60px alla stessa scala. Rapidità4 e2m/s; i dati della pista lunga non sono rappresentati con una falsa geometria uguale a quella iniziale. Resistenza prescritta,non legge μN.'})
            checksums[file.name]=asset['id']
        provenance={'sourceId':source_id,'sourceRef':source_ref,'sourcePath':path,'sourceProvenance':sources[source_id].get('provenance',{}),
            'sourceReasoningTask':sources[source_id].get('descriptors',{}).get('reasoningTask'),'authoringModule':'tools.corpus_engineering.descent_with_loss_authoring','status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
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
    (args.destination/'descent-with-loss-068.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (args.destination/'descent-with-loss-068-bindings.json').write_text(canonical(bindings)+'\n')
    print(canonical({'questions':len(package['records']),'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}))
