"""New manual normal-force edition, using the same experiment model and importer."""
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes
from .units_authoring import text,law_steps
BATCH='experiment-normal-revision-140'
KEY='SIM-C1-L005-05'
SOURCE_PATH='officina-di-fisica/content/esperienze-C1.json'

def assemble(repo,source_ref):
    sources={r['id']:r for r in json.loads(git_bytes(repo,source_ref,SOURCE_PATH))}
    old=sources[KEY]
    row={**old,'version':old['version']+1,'baseVersion':old['version'],
      'assessmentSelection':{'schemaVersion':'1.0.0','points':[60,0]},
      'prerequisites':['C1-L001','C1-L002'],
      'review':'Candidata DRAFT; verifica scientifica distinta NOT_RUN; approvazione umana NOT_RUN.',
      'blocks':[
       text('Il modello usa una massa m=2 kg e un’accelerazione di gravità g=10 m/s²: il peso ha modulo mg=20 N e resta verticale al variare dell’inclinazione. La normale è la forza di contatto perpendicolare alla guida. Le frecce del banco usano una scala comune per le forze: puoi confrontarne i moduli mantenendo distinta la loro direzione.'),
       text('Scegli un asse perpendicolare al piano. Il corpo resta a contatto con la guida rettilinea e non accelera lungo questo asse. Il secondo principio dà quindi una risultante perpendicolare nulla: la normale bilancia soltanto la componente perpendicolare del peso. Lungo il piano la risultante può invece essere diversa da zero. Non stiamo assumendo equilibrio in tutte le direzioni.'),
       *law_steps(r'N-mg\cos\theta=ma_\perp\qquad a_\perp=0\qquad N=mg\cos\theta'),
       text('Il piano e l’orizzontale formano θ; la normale al piano e la verticale formano lo stesso angolo. Proietta perciò il peso sull’asse perpendicolare usando il coseno. Usare il seno sceglierebbe la componente lungo il piano e farebbe prevedere una normale nulla per un piano orizzontale: un controllo limite che permette di scartare subito la formula sbagliata.'),
       text('Nel primo conto richiesto porta l’inclinazione a 60°. L’angolo è notevole: cos60°=1/2. Moltiplica 20 N per un mezzo, cioè dimezza 20; non serve approssimare il coseno in un decimale. La normale deve risultare più piccola del peso.'),
       *law_steps(r'N(60^\circ)=20\cdot\frac12\,\mathrm N=10\,\mathrm N'),
       text('Per il trasferimento considera la guida orizzontale, θ=0°. Ora il peso è interamente perpendicolare alla superficie. Cos0°=1 e la normale vale 20 N. Le due forze hanno moduli uguali e versi opposti: a questa inclinazione anche le frecce della scena devono avere la stessa lunghezza. Il peso non è la reazione alla normale: entrambe le forze qui agiscono sullo stesso corpo e provengono da interazioni diverse.'),
       *law_steps(r'N(0^\circ)=20\cdot1\,\mathrm N=20\,\mathrm N'),
       text('Controlla le dimensioni: kg·m/s² è il newton; il coseno e il rapporto N/(mg) non hanno unità. Nel dominio installato 0°≤θ≤75° vale 0<N≤20 N. Una normale negativa indicherebbe una lettura fisicamente incompatibile con questo semplice contatto appoggiato. Puoi osservare altre inclinazioni e leggere lo strumento: le verifiche numeriche assegnate sono soltanto 60° e 0°, entrambe esatte.'),
       *law_steps(r'\cos\theta=\frac{N}{mg}\qquad m=\frac{N}{g\cos\theta}\quad(g\cos\theta\ne0)'),
       text('Per ricavare la massa dal primo caso, dividi 10 N per (10 m/s²)(1/2). Il denominatore è 5 m/s² e 10/5=2: ottieni 2 kg. Viceversa N/(mg)=10/20=1/2 identifica θ=60° nel dominio assegnato, senza calcolare una funzione trigonometrica inversa. L’uguaglianza N=mg vale qui solo a 0°: applicarla automaticamente a un piano inclinato confonde peso e sua componente.') ]}
    binding={'id':KEY,'sourceId':KEY,'sourceSha256':digest(old),'sourceRef':source_ref,'candidateSha256':digest(row),'assetChecksums':{}}
    return {'schema':'astra/1','records':[row],'assets':[]},[binding]

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument('--repo',type=Path,required=True);p.add_argument('--source-ref',required=True);p.add_argument('--destination',type=Path,required=True)
    a=p.parse_args();a.destination.mkdir(parents=True,exist_ok=True);package,bindings=assemble(a.repo,a.source_ref)
    (a.destination/(BATCH+'.json')).write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
    (a.destination/(BATCH+'-bindings.json')).write_text(canonical(bindings)+'\n')
