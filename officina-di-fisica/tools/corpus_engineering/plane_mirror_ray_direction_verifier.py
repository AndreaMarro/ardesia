"""Distinct independent reviewer; no authoring import or human approval."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import reflection_image_height_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent symbolic alternatives not unique')
def decode_numeric(raw):
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-03.json'
FAMILY='plane-mirror-ray-direction'
EXPECTED_IDS={'AR-u7-plane-mirror-ray-direction-15', 'AR-u7-plane-mirror-ray-direction-11', 'AR-u7-plane-mirror-ray-direction-06', 'AR-u7-plane-mirror-ray-direction-13', 'AR-u7-plane-mirror-ray-direction-16', 'AR-u7-plane-mirror-ray-direction-12', 'AR-u7-plane-mirror-ray-direction-04', 'AR-u7-plane-mirror-ray-direction-05', 'AR-u7-plane-mirror-ray-direction-08', 'AR-u7-plane-mirror-ray-direction-07', 'AR-u7-plane-mirror-ray-direction-02', 'AR-u7-plane-mirror-ray-direction-09', 'AR-u7-plane-mirror-ray-direction-14', 'AR-u7-plane-mirror-ray-direction-01', 'AR-u7-plane-mirror-ray-direction-10', 'AR-u7-plane-mirror-ray-direction-03'}
REVIEWED_SKILLS={1: 'C5-L09', 2: 'C5-L09', 3: 'C5-L09', 4: 'C5-L09', 5: 'C5-L09', 6: 'C5-L09', 7: 'C5-L09', 8: 'C5-L09', 9: 'C5-L09', 10: 'C5-L09', 11: 'C5-L09', 12: 'C5-L09', 13: 'C5-L09', 14: 'C5-L09', 15: 'C5-L09', 16: 'C5-L09'}

@lru_cache(maxsize=1)
def oracle():
    a,b,p,k1,k2=sp.symbols('a b p k1 k2',positive=True)
    unique([(b+a)/2,(b-a)/2,b+a,2*b-a,a/b],(b+a)/2)
    unique([(2*k1*p-k2*a)/(2*p-a),k1/k2,k1*k2,(2*k1*p+k2*a)/(2*p+a),k1+k2],(2*k1*p-k2*a)/(2*p-a))
    d=model.primary_only_derivations()[261]
    out=[d[n]for n in range(1,17)]
    out[1]='gradi'
    out[2]='θ_r = θ_i'
    out[3]='Da 60° a 90°'
    out[8]='φ = (β + α) / 2'
    out[9]='(2κ₁φ − κ₂α) / (2φ − α)'
    return out

MANUAL=['Le direzioni α e β sono quelle dei vettori di propagazione rispetto allo stesso asse, non gli angoli dalla normale. Riflettere il vettore (cosα,sinα) rispetto alla retta di direzione φ dà (cos(2φ−α),sin(2φ−α)); con φ45° e α30° risulta β90°−30°=60°. I raggi fisici incidente e riflesso rimangono dallo stesso lato dello specchio: il segmento incidente prima del punto ha verso opposto al suo vettore di propagazione. L’angolo d’incidenza dalla normale è75°, non15°.', 'β è un angolo direzionale: si può esprimere in gradi, o in radianti con conversione coerente. È distinto da un seno, che è puro. Nessuna alternativa è stata aperta in questa primaria; il confronto con le cinque opzioni sarà successivo. Dopo la freeze tutte le cinque opzioni sono state effettivamente lette; la prima derivazione rimane immutata.', 'Gli angoli di incidenza e riflessione sono uguali se entrambi misurati dalla stessa normale al piano nel punto di contatto. Il raggio incidente va verso il piano e quello riflesso se ne allontana. Uguaglianza degli angoli dalla normale non equivale a uguaglianza delle direzioni orientate rispetto a un asse esterno.', 'A:2·45°−30°=60°. B:2·60°−30°=90°. Ruotare la retta dello specchio di15° a α fisso ruota il raggio riflesso di30°; non si moltiplica automaticamente β per il rapporto60/45.', 'β+α=2φ, dunque φ=(60°+30°)/2=45°. Controllo0<30°<45°<90° e2·45°−30°=60°.', 'α=2φ−β=2·45°−60°=30°. Il risultato rispetta0<α<φ; invertire l’ordine delle sottrazioni produrrebbe il ramo errato.', 'A:β60°. B:β2·45°−15°=75°. Rapporto75/60=5/4, puro. Dimezzare α non dimezza β perché2φ resta un contributo additivo.', 'β corretto60°, proposta120°: proposta meno corretto+60°. Il rapporto2 non risponde alla domanda sullo scarto angolare.', 'β=2φ−α→β+α=2φ→φ=(β+α)/2. Inversa fisica:0<α<(β+α)/2<90°, equivalente nel ramo a β>α e β+α<180°. La positività da sola non basta.', 'β_A=2φ−α e β_B=2κ₁φ−κ₂α. Rapporto(2κ₁φ−κ₂α)/(2φ−α), denominatore positivo. Occorre ancora0<κ₂α<κ₁φ<90°; una trasformazione dei dati non cambia φ durante una singola prova.', 'A:β60°. B:β120°−15°=105°. Rapporto105/60=7/4. Non è né il rapporto degli specchi60/45 né quello delle incidenze15/30.', 'Media delle letture(60°+105°)/2=165°/2. Qui coincide con la risposta agli ingressi mediφ105°/2,α45°/2:2·105°/2−45°/2=165°/2. La coincidenza dipende dall’affinità della legge nelle direzioni srotolate. Non si applica senza convenzioni a una media circolare che attraversi360°.', 'Targetβ_B=(7/4)60°=105°. Fissatoφ_B60°, α_B120°−105°=15°. Rapportoα_B/α_A15/30=1/2; α_B resta tra zero eφ_B.', 'Riferimentoβ60° e display180 danno guadagno3 per grado. Nuovo display315→β105°; conα15° ottengoφ=(105°+15°)/2=60°. La taratura va tolta prima dell’inversa ottica.', 'Riferimentiβ_A60°,β_B105°: g=(211−121)/(105−60)=90/45=2 per grado; b121−2·60=1. C:β=(181−1)/2=90°;φ=(90°+30°)/2=60°. I due riferimenti hanno uscite distinte, il guadagno è positivo.', 'Vincoloφ=(3/2)α tra angoli nella stessa unità, fattore puro. β=3α−α=2α=60°→α30° eφ45°. Questa coppia è unica nel ramo0<α<φ<90°; non esiste libertà di scala dopo il dato assolutoβ.']

DISTRACTORS=['60°=90°−30°.30 confonde azimut e angolo normale,15 èφ−α,75 angolo normale,120 falsa simmetria.', 'Gradi è scala angolare; cm lunghezza,s tempo,J energia,Bq attività. Radiani sarebbero compatibili ma non offerti come alternativa.', 'θ_r=θ_i dalla stessa normale. Raddoppio e metà non leggi generali; somma90° solo se entrambi45°; superficie non normale richiesta.', '60→90°.75 aggiunge solo15°,120 ometteα,60 ignora rotazione,45 verso opposto.', 'φ(60+30)/2=45°.15 semidifferenza,90 somma non dimezzata/bordo escluso,30 copialettura radente.', 'α90−60=30°.150 somma,−30 ordine,15 dimezzamento extra,210 vettore di propagazione invertito.', '75/60=5/4.4/5 reciproco,1/2 soloα,2 inverso fattore diα,1 ignora.', '120−60=60°.−60 ordine,120 proposta,2 rapporto puro,0 simmetria non controllata.', '(β+α)/2 conβ>α eβ+α<180°. Differenza non inversa,somma non dimezzata,2β−α altra legge,α/β puro.', '(2κ₁φ−κ₂α)/(2φ−α). Rapporti/prodotti soli fattori perdono pesi; segni più cambiano legge,somma fattori2 per prove identiche.', '105/60=7/4.4/7 reciproco,4/3 soloφ,1/2 soloα,2 non dà105°.', '165/2°;165 somma,45/2 semidifferenza,60 e105 singole letture. Affinità spiega coincidenza con medie degli ingressi.', 'Target105°,α_B120−105=15°,rapporto1/2.2 reciproco,7/4 e4/7 uscite,1 darebbeβ90°.', 'g3grado⁻¹,D315→β105°,φ60°.165° usa display comeβ e viola settore,45 vecchia retta,105 solaβ.', 'g2grado⁻¹,b1,D181→β90°,φ60°.241/4° omette b;105° omette g dopo b e violaφ<90°;90 copiaβ.', 'φ3α/2→β2α60°→α30°.60 dàφ90° escluso,15 dàβ30°,infinite non compatibili con dato assoluto.']

ASSUMPTIONS=['Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.', 'Specchio piano statico nel piano del disegno; direzioni di propagazione antiorarie dal medesimo asse, non angoli dalla normale. Settore0<α<φ<90° e0<β<180° srotolato, nessun modulo360. La riflessione conserva la componente tangenziale e inverte la normale; i due segmenti fisici dei raggi stanno nello stesso semipiano rispetto allo specchio. Preparazioni statiche distinte, riferimenti angolari comuni e guadagno positivo.']

UNITS={1: 'degree', 2: 'degree', 3: 'degree', 4: 'degree', 5: 'degree', 6: 'degree', 7: '', 8: 'degree', 9: 'degree', 10: '', 11: '', 12: 'degree', 13: '', 14: 'degree', 15: 'degree', 16: 'degree'}

NUMERIC_UNITS={1: 'gradi', 5: 'gradi', 6: 'gradi', 14: 'gradi', 15: 'gradi', 16: 'gradi'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='XML letto integralmente e nuovo native completo640×1740 effettivamente letto dopo child0. Incidente delta(90√3,−90) e riflesso(90,−90√3) in coordinate schermo,lunghezze180:direzioni30° e60° da+x. Specchio slope−1 schermo/45° cartesiano,normale ortogonale slope+1; i raggi fisici stanno nello stesso semipiano,incidenza/riflessione75°. Label finale beta60 letta interamente,non assunta dal frammento argv. Barre180/315/247.5 per60°,105°,165/2° alla scala3 comune. Grafico soloα30°:x150+4φ,y1530−2β; punti(45,60),(60,90),bordi(30,30),(90,150) aperti. Non attribuisce105° diα15° alla curva diα30°.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='8415ce2e7e69ade7c4c239ded564c24fdca40897'

PRIMARY_SHA256='d5f076f221127f55926b8db14609e5903199f8f03b8d2bfb2e752b8df003583d'

REVIEWED_MODEL_SHA256='4094cbd8c203f98ee7efa3e0ba4599f741ce7aa7cd351133a9d2125b81a2624e'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='89dd2b49972de3b70076d7604ee985d3f5fb56db3d9afb1877f38d5bb10421d6'

REVIEWED_BINDINGS_SHA256='35ccd8dfc717588fb8fc436dbf8be33d6e7e64cbf2a953cfe59cb199bb34654f'

REVIEWED_CANDIDATES={'AR-u7-plane-mirror-ray-direction-01': '5feb502f4f2c72f20e4f4bf6ed961532c7f8e467a7b1e625c54a086d14845463', 'AR-u7-plane-mirror-ray-direction-02': '22c701769fbcc7664cf0f5d35e1ab631d2c282032db1571b184f4da3f622e555', 'AR-u7-plane-mirror-ray-direction-03': '7b31465fde338104262c9efb2f12e0c9014b486a26893fe972b9636f2f489e69', 'AR-u7-plane-mirror-ray-direction-04': '1cba9c0fb07d96d6d69e023120bc67c9460b45b73e40987ac404fc384ad1e30a', 'AR-u7-plane-mirror-ray-direction-05': '251100486d9deaa0e41180246b195d390f23298eb6fd9da668cd2f7e569f97e8', 'AR-u7-plane-mirror-ray-direction-06': '9292589f6d2bfe31913dc1c7811eda2b80148b1351eb18d70e68bd054b98ba62', 'AR-u7-plane-mirror-ray-direction-07': '0c4328112873258df4cd11228f1f01441a77a5b8ced88edab50624fb2b9568eb', 'AR-u7-plane-mirror-ray-direction-08': 'c64998c260d7f869baa582b035286cef147f1a65803be43db2820f2791a16dd0', 'AR-u7-plane-mirror-ray-direction-09': '11c70694d6e41f7fef6a12965a9a89f9e5eb23648b81838d9f704897ac6f3cfb', 'AR-u7-plane-mirror-ray-direction-10': 'edad3ce22a492260f84b4ecffb76a4b42fda16541683dab497495297b0c3cd18', 'AR-u7-plane-mirror-ray-direction-11': 'f60ac9effc1da7e8da544e4e198c2dee7151ee0f22ccfafa6215aa1e867f8292', 'AR-u7-plane-mirror-ray-direction-12': '78a7d3fcb736481fb803effda82da643e6dd5167b11414657862b1cea505e37c', 'AR-u7-plane-mirror-ray-direction-13': '6d318f1c1c861022b75141e8bde02694134eb68b1e30158fe1f148bc4d89c0e5', 'AR-u7-plane-mirror-ray-direction-14': 'a8e4e882fdaba9ee7fa1ffb39b5a6005e8ba0f0f2c2b7dab00dd3ce292015035', 'AR-u7-plane-mirror-ray-direction-15': '18cc2f0364d4f07f911b714ca35559459cc4d0273e4324a99399dda6380a5cef', 'AR-u7-plane-mirror-ray-direction-16': '328da9e69391b8f9c608dd34bae30a3be5eae8864ad181b1353712d79e1feba1'}

READ_SOURCE_SHA256={'u7-plane-mirror-ray-direction-01': 'afc116ba11f31aff4874a8fe2933d023e050ec88e494cad1d3d2a754d3879044', 'u7-plane-mirror-ray-direction-02': '981cbc35e7c01981939e09888e68e9529ddb06274b1aae03f541d58a79065389', 'u7-plane-mirror-ray-direction-03': '26e64a89d399d341b2f519cf017b93ad848c0b5bf1a630c427c3b328efdfe7a0', 'u7-plane-mirror-ray-direction-04': 'df52fbe7e1e2027de3e1fe029913e976e32feb9a86401de39c6db11272c387a2', 'u7-plane-mirror-ray-direction-05': '2cbf37283cf9ab31d86b827a0d4f2ad74f9f76a18e817aac6e8987bf44788623', 'u7-plane-mirror-ray-direction-06': 'a43ed37d24fe3bec417561328dc317764ee7dc203358b0c92704d7918d22fe18', 'u7-plane-mirror-ray-direction-07': 'aa9fe0045a2ae29b21fabc0382924da2d4a4cbe954686092a0954477d11c1591', 'u7-plane-mirror-ray-direction-08': 'eab573621acd94a1b398ebb9e44bc05e6524511838dd76cdc0861426413a5bdc', 'u7-plane-mirror-ray-direction-09': 'ced5af2e6df38c04c75bca945df914e5517fb942d3080116f1845623a6a7aec2', 'u7-plane-mirror-ray-direction-10': 'c9efe7980912d90e116cefefab8d06174cd1b15b74ab7a46a2cda62a7ab84a88', 'u7-plane-mirror-ray-direction-11': 'decba823b3e464cd62a838b0a959712f91d89318756bd1bf63477a2608aec3e9', 'u7-plane-mirror-ray-direction-12': 'c48b97775454954ba617897446582e250ba7acb21706daf0b4cc2c52e721c9c2', 'u7-plane-mirror-ray-direction-13': '2073eb74b864da637144a405ab7db79f75f7a575c9e50b252fa4240e01f845a5', 'u7-plane-mirror-ray-direction-14': '4edf87ec458dd2a92f7f07320f23eba44f96b9e2ca59e570f1de3730cc949f94', 'u7-plane-mirror-ray-direction-15': '784757988a954f9048253370f1ea3c9271f4799677a94f2996bf837f0b75f796', 'u7-plane-mirror-ray-direction-16': 'ef2d92e8eb548e9188ff310ceeab3ad2358822f41a6b6a18fae22e01936e87b6'}

SOURCE_READING='Tutti32 originali derivati nella primaria prompt-onlyd5f076f2 congelata46b0e987 prima di candidati. Modelli scritti prima dell’esposizione incidentale di una label beta60 via ps argv,ma eseguiti/congelati bbda8bd4 dopo:disclosure completa nella ricevuta,nessuna falsa dichiarazione NONE. Il60° era già nella primaria. Poi tutti32 campi,opzioni,blocchi,hint,feedback e due XML/native completi letti;262 riparametrizzazione fisica in mm e vincolo p/40 ricalcolati separatamente senza mutare la fonte. Nessun modulo autore o primariaB aperti. ROOT integrazione PENDING,UI prodotto e human NOT_RUN.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u7-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=numeric_lexeme(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=decode_numeric(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_numeric(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and (row['answer'].get('unit')!=NUMERIC_UNITS.get(n) or row['answer'].get('tolerance')!=0):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_reflection_matrix_conjugates_and_height_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
