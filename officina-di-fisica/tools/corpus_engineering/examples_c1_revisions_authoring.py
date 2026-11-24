"""Two new example editions correcting independently identified manual-calculation defects."""
import base64
import json
from pathlib import Path

from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps


def assemble(repo,source_ref):
    sources={r['id']:r for r in json.loads(git_bytes(repo,source_ref,'officina-di-fisica/content/C1.json'))}
    home=Path(__file__).resolve().parents[2]/'editorial/assets'
    assets=[];checksums={}
    for name in ('example-corsie-exact.svg','example-circular-exact.svg'):
        raw=(home/name).read_bytes();key=sha(raw);checksums[name]=key
        assets.append({'id':key,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()})
    first={**sources['C1-E003'],'version':sources['C1-E003']['version']+1,'baseVersion':sources['C1-E003']['version'],
      'prompt':'Una persona cammina per 30 m a est e poi per 40 m a nord. Trova il modulo dello spostamento e descrivine la direzione con rapporti trigonometrici esatti, senza approssimare l’angolo in gradi.',
      'blocks':[
        text('Lo spostamento collega direttamente partenza e arrivo; il cammino segue invece entrambe le corsie. Scegliamo est positivo sull’asse x e nord positivo sull’asse y. Le due componenti sono quindi positive e perpendicolari: questa geometria giustifica Pitagora.'),
        {'type':'figure','src':'/asset/'+checksums['example-corsie-exact.svg'],'text':'Tre tappe alla stessa scala: componenti di 30 m a est e 40 m a nord, diagonale di 50 m e angolo θ misurato a nord dell’est. Seno e coseno ne specificano la direzione senza ricavare decimali.'},
        *law_steps(r'R_x=30\,\mathrm m\qquad R_y=40\,\mathrm m\qquad R^2=R_x^2+R_y^2\qquad R^2=(900+1600)\,\mathrm{m^2}\qquad R=\sqrt{2500}\,\mathrm m=50\,\mathrm m'),
        text('Per il conto a mano si riconosce il triangolo 3–4–5 ingrandito di dieci: 3²+4²=5² e dunque la diagonale misura 10·5 m. La radice positiva è richiesta perché R è un modulo. La direzione non si ottiene sommando i metri: si confrontano le componenti con la diagonale.'),
        *law_steps(r'\cos\theta=\frac{R_x}{R}=\frac{30}{50}=\frac35\qquad \sin\theta=\frac{R_y}{R}=\frac{40}{50}=\frac45\qquad \tan\theta=\frac{R_y}{R_x}=\frac43'),
        text('Entrambe le componenti positive collocano il vettore nel primo quadrante, quindi 0°<θ<90°. I rapporti esatti cosθ=3/5 e sinθ=4/5 identificano un’unica direzione a nord dell’est. Volendo nominare l’angolo con una funzione inversa, θ=arctan(4/3): questa è già una risposta esatta e non richiede di valutare un’inversa trigonometrica a mano.'),
        text('Il cateto nord supera quello est, perciò θ è maggiore di 45°. Il modulo di 50 m è minore del cammino di 30+40=70 m. La differenza di 20 m descrive la deviazione del percorso rispetto al collegamento diretto; non è una componente mancante. Sommare 30+40 per trovare il modulo confonderebbe queste due grandezze.')],
      'review':'Nuova edizione candidata dopo finding indipendente; revisione della candidata NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
    second={**sources['C1-E008'],'version':sources['C1-E008']['version']+1,'baseVersion':sources['C1-E008']['version'],
      'prompt':'Un segno a r=1/5 m dal centro di un disco compie un giro in T=2 s, a ritmo uniforme. Trova i moduli della velocità e dell’accelerazione lasciando π nei risultati.',
      'blocks':[
        text('Il periodo T è la durata di un giro. Poiché il moto è uniforme, il punto percorre archi uguali in tempi uguali: il modulo della velocità si ricava dividendo la circonferenza per T. Scrivere il raggio come 1/5 m rende immediata la semplificazione senza convertire π in un decimale.'),
        {'type':'figure','src':'/asset/'+checksums['example-circular-exact.svg'],'text':'Prima il raggio e il periodo; poi la velocità tangente; infine l’accelerazione centripeta. Il cerchio mantiene la stessa scala. Le frecce di velocità e accelerazione indicano direzioni di grandezze con unità diverse, senza confrontarne graficamente i moduli.'},
        *law_steps(r'C=2\pi r=\frac{2\pi}{5}\,\mathrm m\qquad v=\frac CT\qquad v=\frac{2\pi/5}{2}\,\mathrm{m/s}\qquad v=\frac\pi5\,\mathrm{m/s}'),
        text('Il due si cancella prima di qualsiasi moltiplicazione. La velocità vettoriale è tangente alla circonferenza e cambia direzione anche se il suo modulo resta costante. Occorre quindi un’accelerazione: nel moto circolare uniforme è rivolta verso il centro e ha modulo v²/r. La legge si applica qui perché r e v sono costanti.'),
        *law_steps(r'a_c=\frac{v^2}{r}\qquad v^2=\frac{\pi^2}{25}\,\mathrm{m^2/s^2}\qquad a_c=\frac{\pi^2/25}{1/5}\,\mathrm{m/s^2}\qquad a_c=\frac{5\pi^2}{25}\,\mathrm{m/s^2}\qquad a_c=\frac{\pi^2}{5}\,\mathrm{m/s^2}'),
        text('Dividere per 1/5 significa moltiplicare per cinque. L’unità si controlla separatamente: (m²/s²)/m=m/s². Un controllo usa la velocità angolare ω=2π/T=π s⁻¹: v=ωr e a_c=ω²r restituiscono gli stessi risultati esatti.'),
        text('Le risposte sono dunque v=π/5 m/s e a_c=π²/5 m/s². Nessun arrotondamento entra nella seconda formula. Se il periodo raddoppia a raggio fisso, v si dimezza e l’accelerazione diventa un quarto, perché contiene il quadrato della velocità. Accelerazione nulla e rapidità costante non sono equivalenti: qui cambia continuamente la direzione del vettore velocità.')],
      'review':'Nuova edizione candidata dopo finding indipendente; revisione della candidata NOT_RUN; approvazione umana NOT_RUN; DRAFT'}
    bindings=[]
    for row,name in ((first,'example-corsie-exact.svg'),(second,'example-circular-exact.svg')):
        bindings.append({'id':row['id'],'sourceId':row['id'],'sourceSha256':digest(sources[row['id']]),'sourceRef':source_ref,
                         'candidateSha256':digest(row),'assetChecksums':{name:checksums[name]}})
    return {'schema':'astra/1','records':[first,second],'assets':assets},bindings


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument('--repo',type=Path,required=True);p.add_argument('--source-ref',required=True);p.add_argument('--destination',type=Path,required=True)
    a=p.parse_args();pkg,bindings=assemble(a.repo,a.source_ref);a.destination.mkdir(parents=True,exist_ok=True)
    (a.destination/'examples-c1-revisions-016.json').write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
    (a.destination/'examples-c1-revisions-016-bindings.json').write_text(canonical(bindings)+'\n')
