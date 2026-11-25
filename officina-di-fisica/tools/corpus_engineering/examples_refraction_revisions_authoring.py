"""Two exact refraction example editions, assembled through the existing Astra importer.
Authoring only: scientific review and human approval remain NOT_RUN.
"""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps

BATCH='examples-refraction-revisions-106'
SOURCE_PATH='officina-di-fisica/content/C5.json'


def assemble(repo,source_ref):
    sources={r['id']:r for r in json.loads(git_bytes(repo,source_ref,SOURCE_PATH))}
    home=Path(__file__).resolve().parents[2]/'editorial/assets'
    assets=[];checksums={}
    for name in ('example-refraction-exact.svg','example-total-reflection-exact.svg'):
        raw=(home/name).read_bytes();key=sha(raw);checksums[name]=key
        assets.append({'id':key,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()})
    first={**sources['C5-E017'],'version':2,'baseVersion':1,
      'prompt':'Un raggio monocromatico passa dall’aria, con indice assegnato n₁=1, a un vetro, con indice assegnato n₂=3/2. La superficie di separazione è piana e ferma; i mezzi sono trasparenti, omogenei e isotropi nel modello dell’ottica geometrica. Il raggio incidente forma 45° con la superficie. Determina gli angoli riflesso e rifratto rispetto alla normale: lascia l’angolo non notevole in forma esatta e localizzalo fra angoli notevoli, senza valutare inverse trigonometriche in decimali. Ricava anche l’indice del vetro invertendo la legge.',
      'blocks':[
        text('Tracciamo la normale nel punto d’incidenza: è perpendicolare alla superficie e costituisce il riferimento di tutte le leggi angolari. Il dato di 45° è invece riferito alla superficie. I due angoli sono complementari; in questo caso hanno casualmente lo stesso valore. La riflessione resta nell’aria e ha angolo uguale a quello d’incidenza.'),
        {'type':'figure','src':'/asset/'+checksums['example-refraction-exact.svg'],'text':'Prima i raggi con la normale e la superficie: incidenza e riflessione sono a 45°, mentre la trasmissione nel vetro è più vicina alla normale. Poi un triangolo dei rapporti con lati √2, √7, 3 alla scala comune 50 px/unità mostra sin θ₂=√2/3. Infine si confrontano i seni al quadrato con quello di 30°. Le lunghezze dei raggi non rappresentano intensità.'},
        *law_steps(r'\theta_1=90^\circ-45^\circ\qquad \theta_1=45^\circ\qquad \theta_r=\theta_1\qquad \theta_r=45^\circ'),
        text('La legge di Snell usa gli indici dei mezzi nell’ordine di propagazione. Isoliamo prima il seno dell’angolo trasmesso, senza ricavare un numero decimale. L’indice maggiore del vetro riduce il seno e quindi, nel primo quadrante, riduce l’angolo.'),
        *law_steps(r'n_1\sin\theta_1=n_2\sin\theta_2\qquad \sin\theta_2=\frac{n_1}{n_2}\sin\theta_1\qquad \sin45^\circ=\frac{\sqrt2}{2}\qquad \sin\theta_2=\frac23\frac{\sqrt2}{2}\qquad \sin\theta_2=\frac{\sqrt2}{3}'),
        text('Il due si cancella nel prodotto prima di qualsiasi valutazione. Il seno è positivo e minore di uno, quindi esiste una direzione trasmessa nel primo quadrante. La risposta esatta è l’angolo il cui seno vale √2/3: scriverlo con arcsin lo identifica senza richiedere un’approssimazione numerica.'),
        *law_steps(r'\theta_2=\arcsin\!\left(\frac{\sqrt2}{3}\right)\qquad 0^\circ<\theta_2<90^\circ'),
        text('Per ottenere un intervallo utile basta confrontare con 30°, il cui seno è 1/2. I due seni sono positivi: possiamo confrontarne i quadrati senza cambiare il verso. Due noni è minore di un quarto perché, moltiplicando per il denominatore positivo 36, otto è minore di nove. Il seno cresce fra 0° e 90°, dunque l’angolo trasmesso è minore di 30°.'),
        *law_steps(r'\left(\frac{\sqrt2}{3}\right)^2=\frac29\qquad \left(\frac12\right)^2=\frac14\qquad \frac29<\frac14\qquad 8<9\qquad 0^\circ<\theta_2<30^\circ'),
        text('Il controllo inverso recupera il materiale del modello. Dividiamo per sin θ₂, diverso da zero: i fattori √2 si cancellano e resta 3/2. Gli indici e i seni sono adimensionali; gli angoli qui sono espressi in gradi. La funzione inversa restituisce un angolo, non un indice.'),
        *law_steps(r'n_2=\frac{n_1\sin\theta_1}{\sin\theta_2}\qquad n_2=\frac{\sqrt2/2}{\sqrt2/3}\qquad n_2=\frac32'),
        text('Usare il rapporto inverso degli indici darebbe sin θ₂=3√2/4: il suo quadrato è 9/8, maggiore di uno. Non sarebbe una riflessione totale nel passaggio aria–vetro assegnato, ma un errore nel verso del rapporto. Uguagliare i due angoli a 45° ignora il cambio di indice. Dare 60° perché il raggio “si piega” non soddisfa Snell e contraddice il confronto θ₂<30°. Scrivere un seno arrotondato dentro arcsin cambierebbe la risposta esatta. Inoltre proprio il dato di 45° non permette da solo di riconoscere lo scambio superficie–normale: per un generico angolo α dalla superficie occorre sempre θ₁=90°−α.')],
      'review':'DRAFT; nuova edizione d’autore v2/base1; independent scientific review NOT_RUN; human approval NOT_RUN; original edition retained'}
    second={**sources['C5-E018'],'version':2,'baseVersion':1,
      'prompt':'Nel modello assegnato, un raggio monocromatico passa dall’acqua di indice n₁=4/3 all’aria di indice n₂=1. Questi sono valori esatti del modello, non una misura esatta dell’indice dell’acqua reale. L’interfaccia è piana e ferma; i mezzi sono trasparenti, omogenei e isotropi nell’ottica geometrica. Confronta incidenze di 30° e 60° rispetto alla normale. Trova l’angolo critico in forma esatta e delimitane il valore fra angoli notevoli; individua il raggio riflesso e l’eventuale raggio trasmesso propagante nei due casi. Controlla l’indice dell’acqua con una relazione inversa.',
      'blocks':[
        text('Qui si viaggia dal mezzo con indice maggiore a quello con indice minore. Quando esiste una direzione trasmessa, essa si allontana dalla normale. Aumentando l’incidenza si raggiunge un limite: il raggio trasmesso è radente all’interfaccia, cioè forma 90° con la normale. L’angolo incidente corrispondente è θc; la riflessione totale richiede un’incidenza strettamente maggiore, non semplicemente uguale al limite.'),
        {'type':'figure','src':'/asset/'+checksums['example-total-reflection-exact.svg'],'text':'Tre casi nel modello n_acqua=4/3, n_aria=1. In alto il raggio critico ha sin θc=3/4 e trasmissione radente. Al centro l’incidente a 30° genera un trasmesso con sin θ₂=2/3 e un riflesso a 30°. In basso l’incidente a 60° genera un riflesso a 60° e nessun raggio trasmesso propagante nell’aria. Tutti gli angoli sono riferiti alla normale; le lunghezze dei raggi non rappresentano intensità.'},
        *law_steps(r'n_1\sin\theta_c=n_2\sin90^\circ\qquad \sin\theta_c=\frac{n_2}{n_1}\qquad \sin\theta_c=\frac34\qquad \theta_c=\arcsin\!\left(\frac34\right)'),
        text('Confrontiamo i quadrati dei seni positivi di 45°, θc e 60°. Le frazioni si portano al denominatore sedici: otto, nove e dodici sono ordinati. Poiché il seno cresce nel primo quadrante, θc sta strettamente fra 45° e 60°. Questo basta già a collocare 30° sotto il limite e 60° sopra, senza calcolare θc in gradi decimali.'),
        *law_steps(r'\sin^2 45^\circ=\frac12=\frac8{16}\qquad \sin^2\theta_c=\frac9{16}\qquad \sin^2 60^\circ=\frac34=\frac{12}{16}\qquad 8<9<12\qquad 45^\circ<\theta_c<60^\circ'),
        text('Per l’incidenza di 30° applichiamo Snell: quattro terzi per un mezzo è due terzi. Il risultato appartiene all’intervallo dei seni ammessi, quindi il raggio trasmesso esiste. Il suo angolo esatto è arcsin(2/3). È maggiore di 30°, perché 2/3>1/2, e minore di 45°, perché 4/9<1/2. Il riflesso resta nell’acqua a 30° rispetto alla normale.'),
        *law_steps(r'\theta_{1,A}=30^\circ\qquad \sin\theta_{2,A}=\frac43\sin30^\circ\qquad \sin\theta_{2,A}=\frac23\qquad \theta_{2,A}=\arcsin\!\left(\frac23\right)\qquad \frac49<\frac12\qquad 8<9\qquad 30^\circ<\theta_{2,A}<45^\circ\qquad \theta_{r,A}=30^\circ'),
        text('Per l’incidenza di 60° il prodotto richiesto da Snell supera uno. Lo verifichiamo senza decimali elevando al quadrato: quattro terzi è maggiore di uno, e il prodotto iniziale è positivo. Nessun angolo reale del primo quadrante può avere quel seno. Nel modello si ha quindi riflessione totale interna: il raggio riflesso resta nell’acqua a 60° e non esiste un raggio trasmesso propagante nell’aria.'),
        *law_steps(r'\theta_{1,B}=60^\circ\qquad \frac43\sin60^\circ=\frac{2\sqrt3}{3}\qquad \left(\frac{2\sqrt3}{3}\right)^2=\frac43\qquad \frac43>1\qquad \theta_{r,B}=60^\circ'),
        text('La formula inversa offre due controlli dello stesso indice: dal limite si divide l’indice dell’aria per sin θc; dal caso trasmesso si divide sin θ₂ per sin 30°. In entrambi i casi si ritrova quattro terzi. Gli indici sono rapporti adimensionali, mentre θc e gli altri angoli sono espressi in gradi.'),
        *law_steps(r'n_1=\frac{n_2}{\sin\theta_c}\qquad n_1=\frac1{3/4}=\frac43\qquad n_1=\frac{n_2\sin\theta_{2,A}}{\sin30^\circ}\qquad n_1=\frac{2/3}{1/2}=\frac43'),
        text('Invertire n₂/n₁ nella legge del limite darebbe un seno 4/3 impossibile: la condizione è n₁>n₂. Confondere il raggio critico con l’incidenza darebbe θc=90°, ma 90° è l’angolo trasmesso al limite. Far restare il trasmesso a 30° ignora gli indici; farlo avvicinare alla normale scambia il verso acqua–aria. Nel caso a 60° non si può “troncare” il seno a uno e disegnare un raggio radente: quello descrive soltanto il limite θc, già minore di 60°. Non si ricavano percentuali di intensità dalle lunghezze dei raggi: qui si confrontano le direzioni nell’ottica geometrica.')],
      'review':'DRAFT; nuova parametrizzazione d’autore v2/base1; independent scientific review NOT_RUN; human approval NOT_RUN; historical n=1.33 and 40/55 degree edition retained'}
    bindings=[]
    for row,name in [(first,'example-refraction-exact.svg'),(second,'example-total-reflection-exact.svg')]:
        source=sources[row['id']]
        assert source['version']==1 and all(row[k]==source[k] for k in ['course','skill','prerequisites','family','kind','order'])
        provenance={'sourcePath':SOURCE_PATH,'sourceRef':source_ref,'sourceId':row['id'],'sourceVersion':1,'candidateVersion':2,'status':'DRAFT','independentReview':'NOT_RUN','humanApproval':'NOT_RUN'}
        bindings.append({'id':row['id'],'sourceId':row['id'],'sourceRef':source_ref,'sourceSha256':digest(source),'candidateSha256':digest(row),'assetChecksums':{name:checksums[name]},'provenance':provenance,'provenanceSha256':digest(provenance)})
    return {'schema':'astra/1','records':[first,second],'assets':assets},bindings


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument('--repo',type=Path,required=True);p.add_argument('--source-ref',required=True);p.add_argument('--destination',type=Path,required=True)
    a=p.parse_args();package,bindings=assemble(a.repo,a.source_ref);a.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [(BATCH,package),(BATCH+'-bindings',bindings)]:
        (a.destination/(name+'.json')).write_text(canonical(value)+'\n')
