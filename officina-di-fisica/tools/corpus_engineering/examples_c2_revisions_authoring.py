"""New edition with an explicitly assigned hydrostatic approximation; no self-review."""
import base64
import json
from pathlib import Path

from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps


def assemble(repo,source_ref):
    source=next(r for r in json.loads(git_bytes(repo,source_ref,'officina-di-fisica/content/C2.json')) if r['id']=='C2-E005')
    home=Path(__file__).resolve().parents[2]/'editorial/assets'
    name='example-piston-model.svg';raw=(home/name).read_bytes();key=sha(raw)
    row={**source,'version':source['version']+1,'baseVersion':source['version'],
      'title':'Una pressa nel modello a variazione idrostatica trascurabile',
      'prompt':'Due pistoni verticali di una pressa ideale partono alla stessa quota e sono collegati da un liquido incomprimibile. Il modello assegnato trascura attrito, inerzia dei pistoni e variazioni della pressione idrostatica dovute al loro spostamento: si usa quindi la stessa pressione aggiuntiva durante tutta la corsa. Le facce esterne vedono la stessa atmosfera. Il pistone piccolo ha area 5 cm² e riceve una forza costante 40 N; il grande ha area 60 cm². Calcola forza di uscita e corsa del grande quando il piccolo scende 12 cm; controlla i lavori nel modello dichiarato.',
      'blocks':[
        text('La pressa trasmette un incremento di pressione. Nel modello qui assegnato lo consideriamo uguale sui due pistoni durante la corsa; la forza più grande deriva dalla superficie più ampia, senza moltiplicare la pressione. L’atmosfera esterna comune si elimina nel bilancio delle forze. Prima confrontiamo le aree, poi imponiamo che il volume spostato dal primo pistone riempia lo spazio aperto dal secondo.'),
        {'type':'figure','src':'/asset/'+key,'text':'Tre tappe schematiche senza scala geometrica: aree di 5 e 60 cm², rapporto di forze 12 e rapporto inverso delle corse. La pressione aggiuntiva è trattata costante trascurando esplicitamente la variazione idrostatica. I disegni non affermano che i pistoni restino alla stessa quota.'},
        *law_steps(r'\Delta p=F_1/A_1\qquad F_2=\Delta p A_2=F_1\frac{A_2}{A_1}\qquad \frac{A_2}{A_1}=\frac{60\,\mathrm{cm^2}}{5\,\mathrm{cm^2}}=12\qquad F_2=(40\,\mathrm N)12=480\,\mathrm N'),
        text('Le due aree sono nella stessa unità, quindi cm² si cancella nel rapporto. Non serve trasformarle in metri quadrati per questo passaggio. Quattrocentottanta newton è la forza sostenibile nel modello dichiarato: la forza entrante è moltiplicata per dodici perché agisce su un’area dodici volte minore.'),
        *law_steps(r'A_1s_1=A_2s_2\qquad s_2=\frac{A_1}{A_2}s_1\qquad s_2=\frac5{60}(12\,\mathrm{cm})=1\,\mathrm{cm}'),
        text('Il volume non si crea e il liquido non si comprime: diminuendo di 5×12=60 cm³ lo spazio sotto il piccolo, aumenta dello stesso volume quello sotto il grande, 60×1=60 cm³. Le corse sono moduli positivi in versi opposti: il piccolo scende e il grande sale. Una forza dodici volte maggiore è accompagnata da una corsa dodici volte minore.'),
        *law_steps(r's_1=12\,\mathrm{cm}=\frac{12}{100}\,\mathrm m\qquad s_2=1\,\mathrm{cm}=\frac1{100}\,\mathrm m\qquad W_{in}=40\frac{12}{100}\,\mathrm J=\frac{24}5\,\mathrm J\qquad W_{out}=480\frac1{100}\,\mathrm J=\frac{24}5\,\mathrm J'),
        text('Il conto manuale cancella un fattore dieci nei prodotti e lascia 24/5 J, cioè 4,8 J esatti. Nel modello assegnato non si accumula energia nella variazione di quota del liquido e non ci sono dissipazioni: i lavori coincidono. La pressa modifica forza e spostamento, senza creare lavoro.'),
        text('Questa uguaglianza dei lavori non è esatta per una corsa verticale finita quando si conserva il peso del liquido: il piccolo scende e il grande sale, cambiando il dislivello. In quel modello più completo bisogna includere la variazione idrostatica e l’energia gravitazionale del fluido. Qui tale contributo è escluso esplicitamente; le risposte 480 N, 1 cm e 24/5 J si riferiscono soltanto all’approssimazione dichiarata.'),
        text('Scambiare il rapporto delle aree darebbe una forza 40/12 N e una corsa 144 cm, incompatibili con una superficie di uscita più grande. Moltiplicare sia forza sia corsa per dodici farebbe crescere il lavoro di 144 volte e violerebbe il bilancio del modello. Per ricostruire l’ingresso dalle uscite si usano F₁=F₂A₁/A₂ e s₁=s₂A₂/A₁.'),
      ],'review':'DRAFT; nuova edizione d’autore; independent scientific review NOT_RUN; human approval NOT_RUN; source original retained'}
    binding={'id':row['id'],'sourceId':source['id'],'sourceRef':source_ref,'sourceSha256':digest(source),
      'candidateSha256':digest(row),'assetChecksums':{name:key}}
    return {'schema':'astra/1','records':[row],'assets':[{'id':key,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}]},[binding]


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('--repo',type=Path,required=True)
    parser.add_argument('--source-ref',required=True);parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();package,bindings=assemble(args.repo,args.source_ref)
    args.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [('examples-c2-revisions-035',package),('examples-c2-revisions-035-bindings',bindings)]:
        (args.destination/(name+'.json')).write_text(canonical(value)+'\n')
