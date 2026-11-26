"""Authoring two new experiment editions; no scientific or human approval."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps
SOURCE_PATH='officina-di-fisica/content/esperienze-C1.json'
SPECS=(('experiment-projection-revision-118','SIM-C1-L001-06','velocity-projection-exact.svg'),('experiment-products-revision-119','SIM-C1-L002-04','vector-products-exact.svg'))

def assemble(repo,source_ref):
    sources={r['id']:r for r in json.loads(git_bytes(repo,source_ref,SOURCE_PATH))}
    home=Path(__file__).resolve().parents[2]/'editorial/assets'
    output={}
    for batch,key,name in SPECS:
        original=sources[key];raw=(home/name).read_bytes();asset=sha(raw)
        row={**original,'version':original['version']+1,'baseVersion':original['version'],
             'assessmentSelection':{'schemaVersion':'1.0.0','points':[90,180]},
             'prerequisites':['C1-L001'],
             'review':'Candidata DRAFT; revisione scientifica distinta NOT_RUN; approvazione umana NOT_RUN.'}
        if key.endswith('L001-06'):
            row['prerequisites']=[]
            row['blocks']=[
              text('Prima di ruotare la freccia, scegli il verso positivo dell’asse orizzontale. Il carrello mantiene rapidità 4 m/s: ciò che può cambiare è la velocità letta da un sensore che registra soltanto il moto lungo quell’asse. Una lettura negativa indica moto in verso opposto; non una rapidità negativa.'),
              text('La componente orizzontale è la proiezione ortogonale del vettore velocità sull’asse. Come l’ombra di un segmento su una retta, può accorciarsi fino a scomparire mentre il segmento conserva lunghezza. Qui l’analogia riguarda soltanto una proiezione geometrica: la freccia rappresenta metri al secondo, non una lunghezza percorsa.'),
              *law_steps(r'v_x=v\cos\theta\qquad v=4\,\mathrm{m/s}'),
              {'type':'figure','src':'/asset/'+asset,'text':'Tre orientamenti della stessa velocità, alla stessa scala: 0°, 90°, 180°. L’asse positivo è verso destra; i valori sotto i pannelli sono componenti con segno, mentre il modulo resta 4 m/s.'},
              text('Parti dal riferimento 0°: tutta la velocità è parallela e concorde con l’asse, perciò cos0°=1 e vₓ=4 m/s. Ruota fino a 90°. La freccia è perpendicolare all’asse: non ha avanzamento orizzontale e la sua proiezione è nulla. Non occorre stimare il coseno di un angolo vicino a 90°: l’ortogonalità fornisce esattamente zero.'),
              *law_steps(r'v_x(90^\circ)=4\cdot0\,\mathrm{m/s}=0\,\mathrm{m/s}'),
              text('Per la nuova situazione, il carrello si muove a 180° rispetto al verso positivo della guida. La velocità è interamente lungo la guida ma nel verso contrario. Il coseno vale −1: moltiplica 4 per −1, conservando l’unità m/s. Il sensore deve quindi leggere −4, non +4 e non zero.'),
              *law_steps(r'v_x(180^\circ)=4\cdot(-1)\,\mathrm{m/s}=-4\,\mathrm{m/s}'),
              text('Un controllo indipendente è il limite geometrico |vₓ|≤v: le componenti ottenute 0 e −4 rispettano il modulo 4. Scambiare modulo e componente produrrebbe sempre +4; usare il seno darebbe invece una componente verticale e scambierebbe i casi parallelo e perpendicolare. Nella scena esplora anche le posizioni intermedie come osservazioni: le due risposte numeriche richieste sono i casi esatti a 90° e 180°.'),
              *law_steps(r'\cos\theta=\frac{v_x}{v}\quad(v\ne0)\qquad v=\frac{v_x}{\cos\theta}\quad(\cos\theta\ne0)'),
              text('Le formule inverse hanno condizioni diverse. Con vₓ=−4 m/s e v=4 m/s ottieni cosθ=−4/4=−1; nel dominio 0°≤θ≤180° ciò identifica θ=180° senza valutare un’inversa trigonometrica. A 90° il rapporto vₓ/cosθ è 0/0 e non permette di ricavare il modulo: una proiezione nulla, da sola, non dice quanto sia rapida una velocità perpendicolare.')]
        else:
            row['blocks']=[
              text('Fissa due segmenti orientati a e b, lunghi rispettivamente 3 m e 2 m. Il prodotto scalare confronta il secondo con la direzione del primo: proietta b sull’asse orientato da a e moltiplica la proiezione con segno per il modulo di a. Il risultato è uno scalare in m², perché moltiplichi metri per metri.'),
              *law_steps(r'S=\mathbf a\cdot\mathbf b=ab\cos\theta\qquad ab=3\cdot2\,\mathrm{m^2}=6\,\mathrm{m^2}'),
              {'type':'figure','src':'/asset/'+asset,'text':'a resta rivolto a destra e lungo 3 m; b, lungo 2 m, ruota da concorde a perpendicolare e poi opposto. Le frecce sono vettori in metri: il prodotto scalare, riportato sotto ciascun pannello, è in metri quadrati.'},
              text('Quando θ=0°, la proiezione di b è +2 m e S=(3 m)(2 m)=6 m². A 90° la proiezione è zero: S=0 m² anche se nessuno dei vettori è nullo. La verifica numerica iniziale richiede proprio 90°, un angolo notevole risolto dalla perpendicolarità, senza tavole o calcolatrice.'),
              *law_steps(r'S(90^\circ)=6\cdot0\,\mathrm{m^2}=0\,\mathrm{m^2}'),
              text('Nel trasferimento, due segmenti orientati formano 180°. Sono paralleli ma opposti, quindi la proiezione del secondo sul primo è negativa. I moduli possono essere elencati in ordine inverso: il prodotto scalare è commutativo e 2·3=3·2. Calcola prima il prodotto intero 6, poi applica il segno del coseno.'),
              *law_steps(r'S(180^\circ)=2\cdot3\cdot(-1)\,\mathrm{m^2}=-6\,\mathrm{m^2}'),
              text('Il valore −6 m² non è un’area geometrica negativa: è il segno della proiezione orientata. Il limite |S|≤ab è rispettato con uguaglianza nel caso parallelo. Un risultato +6 a 180° perderebbe il verso; zero a 180° confonderebbe parallelismo e perpendicolarità. L’unità m² esclude una lettura come velocità o angolo.'),
              text('Il prodotto vettoriale risponde a una domanda diversa. Il suo modulo descrive l’area del parallelogramma: ab sinθ. Con a lungo +x e b ruotato nel piano xy verso +y, la regola della mano destra dà la normale +z. A 90° questa normale ha componente +6 m², mentre il prodotto scalare è zero; a 180° il parallelogramma si schiaccia e il prodotto vettoriale è esattamente nullo, mentre S=−6 m².'),
              *law_steps(r'(\mathbf a\times\mathbf b)_z=6\sin\theta\,\mathrm{m^2}\qquad (\mathbf a\times\mathbf b)_z(180^\circ)=0\,\mathrm{m^2}'),
              text('Scambiare a e b lascia invariato S ma inverte il prodotto vettoriale: questa è la ragione per esplicitare l’ordine nella mano destra. Esplorare altri angoli permette di osservare il passaggio fra contributo parallelo e normale; i due conti assegnati restano esattamente 90° e 180°.'),
              *law_steps(r'\cos\theta=\frac{S}{ab}\quad(a,b\ne0)\qquad b=\frac{S}{a\cos\theta}\quad(a\cos\theta\ne0)'),
              text('Per controllare l’inversa a 180°, dividi −6 m² per (3 m)(−1): il risultato è b=2 m. I segni si cancellano e m²/m=m. Invece a 90° la formula inversa per b non si usa: S=0 per ogni b perpendicolare ad a, quindi il dato scalare non determina il modulo.')]
        binding={'id':key,'sourceId':key,'sourceSha256':digest(original),'sourceRef':source_ref,'candidateSha256':digest(row),'assetChecksums':{name:asset}}
        output[batch]=({'schema':'astra/1','records':[row],'assets':[{'id':asset,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}]},[binding])
    return output

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument('--repo',type=Path,required=True);p.add_argument('--source-ref',required=True);p.add_argument('--destination',type=Path,required=True)
    a=p.parse_args();a.destination.mkdir(parents=True,exist_ok=True)
    for batch,(package,bindings) in assemble(a.repo,a.source_ref).items():
        (a.destination/(batch+'.json')).write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
        (a.destination/(batch+'-bindings.json')).write_text(canonical(bindings)+'\n')
