"""Additive lesson editions after independent sign and endpoint-precision findings."""
import base64
from copy import deepcopy
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps,formula


def assemble(repo,source_ref):
    source_rows={r['id']:r for r in json.loads(git_bytes(repo,source_ref,'officina-di-fisica/content/C1.json'))}
    source2=source_rows['C1-L002'];source3=source_rows['C1-L003']
    name='lesson-vector-sign-limits.svg';raw=(Path(__file__).resolve().parents[2]/'editorial/assets'/name).read_bytes();key=sha(raw)
    row2=deepcopy(source2);row2.update(version=source2['version']+1,baseVersion=source2['version'])
    row2['blocks']=[
      deepcopy(source2['blocks'][0]),deepcopy(source2['blocks'][1]),
      formula(r'A_x=A\cos\theta'),formula(r'A_y=A\sin\theta'),formula(r'A=\sqrt{A_x^2+A_y^2}'),
      text('Per un vettore non nullo il modulo A è positivo e le due componenti possono avere segno diverso. Nel triangolo rettangolo il coseno è cateto adiacente su ipotenusa e il seno è cateto opposto su ipotenusa. Se A_x non è zero, tan θ=A_y/A_x, ma il rapporto da solo non distingue quadranti opposti: servono anche i segni delle componenti. Quando A_x=0 la direzione è verticale e si usa il segno di A_y; non si divide per zero.'),
      text('Per esempio, in un caso numerico distinto dal disegno, A_x=3 m e A_y=4 m danno A=5 m: 3²+4²=9+16=25 e la radice è 5. Si possono lasciare cos θ=3/5 e sin θ=4/5, con θ nel primo quadrante. Non è necessario ricavare un angolo decimale con l’inversa trigonometrica: componenti e rapporti esatti ne individuano già la direzione.'),
      *law_steps(r'A=\sqrt{(3\,\mathrm m)^2+(4\,\mathrm m)^2}\qquad A=5\,\mathrm m\qquad \cos\theta=3/5\qquad \sin\theta=4/5'),
      deepcopy(source2['blocks'][4]),formula(r'\vec R=\vec A+\vec B'),formula(r'R_x=A_x+B_x'),formula(r'R_y=A_y+B_y'),
      text('Il prodotto scalare combina il modulo di un vettore con la proiezione con segno dell’altro: misura l’allineamento e, per esempio, compare nel lavoro di una forza. Il prodotto vettoriale ha modulo pari all’area del parallelogramma costruito sui vettori. Se i vettori non sono paralleli, è perpendicolare al loro piano e il suo verso segue la mano destra; se sono paralleli, il prodotto vettoriale è nullo e non ha una direzione propria.'),
      formula(r'\vec A\cdot\vec B=AB\cos\alpha'),formula(r'|\vec A\times\vec B|=AB\sin\alpha'),
      text('Per due vettori non nulli, α è l’angolo compreso fra 0 e π quando le code coincidono; non va confuso con l’angolo orientato θ di un singolo vettore rispetto agli assi. A moduli A e B fissati, due vettori paralleli concordi hanno α=0: il prodotto scalare è+AB, massimo. Se sono paralleli discordi, α=π: il prodotto scalare è−AB, minimo. In entrambi i casi il modulo della proiezione è massimo, ma il suo segno è opposto, e l’area del parallelogramma è zero.'),
      {'type':'figure','src':'/asset/'+key,'text':'Tre confronti con vettori geometrici adimensionali di modulo1 alla stessa scala120px per unità: concordi, ortogonali, discordi. Nei tre pannelli A punta sempre verso destra; B punta rispettivamente a destra, in alto, a sinistra. Per i concordi le due frecce coincidono. Il caso ortogonale mostra un quadrato di area1; per i paralleli l’area è nulla. Proiezione con segno e suo modulo sono distinti.'},
      text('Riassumiamo i tre casi a moduli fissati. Per α=0 il valore è AB; per α=π è −AB; per α=π/2 è zero. Le componenti dell’esempio permettono di verificarlo senza trigonometria numerica.'),
      text('Il controllo non richiede una calcolatrice. Con componenti adimensionali A=(1,0), B=(1,0) il prodotto scalare è1·1+0·0=1. Sostituendo B con(−1,0) diventa1·(−1)+0·0=−1, non+1; con B=(0,1) vale zero. L’ortogonalità annulla il prodotto scalare, mentre massimizza il modulo del prodotto vettoriale a moduli fissati. Se uno dei due vettori è nullo, entrambi i prodotti sono nulli, ma l’angolo con quel vettore non è definito.'),
    ]
    row3=deepcopy(source3);row3.update(version=source3['version']+1,baseVersion=source3['version'])
    row3['blocks']=[]
    for index,block in enumerate(source3['blocks']):
        if index==2:
            row3['blocks']+=law_steps(block['text'])
        elif index==5:
            row3['blocks'].append({**block,'text':'Questo è un secondo esempio, distinto dal grafico x–t precedente. La velocità è zero a 0 s e 6 s, positiva per0<t<6s: è dunque non negativa nell’intero intervallo. La posizione aumenta durante il tratto, anche nella seconda metà in cui la velocità diminuisce.'})
        else:row3['blocks'].append(deepcopy(block))
    row3['blocks'] += [
      text('Leggiamo separatamente i due esempi. Nel grafico x–t la posizione va da0m a6m nei primi2s, rimane a6m tra2s e4s, poi scende a2m a6s. Le tre pendenze sono+3m/s,0 e−2m/s. Lo spostamento totale è2m, mentre la distanza percorsa è6m+4m=10m: la parte di ritorno contribuisce con segno opposto allo spostamento, ma sempre positivamente alla distanza.'),
      *law_steps(r'\bar v=\frac{2-0}{6-0}\,\mathrm{m/s}\qquad \bar v=\frac13\,\mathrm{m/s}\qquad \text{rapidità media}=\frac{10}{6}\,\mathrm{m/s}\qquad \text{rapidità media}=\frac53\,\mathrm{m/s}'),
      text('Nel secondo grafico, v–t, la velocità forma invece un triangolo di base6s e altezza6m/s. Lo spostamento è l’area con segno: metà del rettangolo corrispondente dà18m. Non è una traiettoria disegnata nello spazio, e non è lo stesso moto del primo grafico. La velocità nulla ai due estremi non sottrae area al triangolo.'),
      *law_steps(r'\Delta x=\frac12(6\,\mathrm s)(6\,\mathrm{m/s})\qquad \Delta x=18\,\mathrm m\qquad \bar v=\frac{18\,\mathrm m}{6\,\mathrm s}=3\,\mathrm{m/s}'),
      text('La pendenza del tratto iniziale del grafico v–t è+2m/s²; quella finale è−2m/s². L’accelerazione negativa nella seconda metà riduce una velocità ancora positiva, quindi non provoca ancora un ritorno. Nel modello a tratti l’accelerazione cambia bruscamente a3s e la derivata non è definita proprio nel vertice. Sull’intero intervallo l’accelerazione media è zero perché v iniziale e finale coincidono: questo non implica che il corpo sia rimasto fermo.'),
    ]
    records=[row2,row3];bindings=[]
    assets_by_name={name:{'id':key,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}}
    for row in records:
        for block in row['blocks']:
            if block['type']=='figure' and block['src'].startswith('/figures/'):
                historical=block['src'].rsplit('/',1)[-1]
                original=git_bytes(repo,source_ref,'officina-di-fisica/static/figures/'+historical)
                checksum=sha(original)
                assets_by_name[historical]={'id':checksum,'name':historical,'mime':'image/svg+xml','data':base64.b64encode(original).decode()}
                block['src']='/asset/'+checksum
    for row in records:
        row['review']='DRAFT; additive lesson revision after separate precision finding; independent review NOT_RUN; human approval NOT_RUN; original retained'
        figure_ids={b['src'].rsplit('/',1)[-1] for b in row['blocks'] if b['type']=='figure'}
        assets={a['name']:a['id'] for a in assets_by_name.values() if a['id'] in figure_ids}
        bindings.append({'id':row['id'],'sourceId':row['id'],'sourceRef':source_ref,'sourceSha256':digest(source_rows[row['id']]),'candidateSha256':digest(row),'assetChecksums':assets})
    return {'schema':'astra/1','records':records,'assets':list(assets_by_name.values())},bindings

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('--repo',type=Path,required=True);parser.add_argument('--source-ref',required=True);parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();package,bindings=assemble(args.repo,args.source_ref);args.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [('lessons-foundations-revisions-054',package),('lessons-foundations-revisions-054-bindings',bindings)]:
        (args.destination/(name+'.json')).write_text(canonical(value)+'\n')
