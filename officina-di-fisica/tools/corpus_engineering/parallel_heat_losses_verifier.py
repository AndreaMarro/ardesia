"""Independent source-first U5-04 thermal and entropy review; no candidate authoring imports."""
from fractions import Fraction
import ast,re
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json'
FAMILY='parallel-heat-losses'
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L05' for n in range(1,17)}
def exact_literal(raw):
    """Bounded arithmetic AST for rational, pi and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=raw.replace('π','p')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\(|p)', '*',raw)
    if not re.fullmatch(r'[0-9rp()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
        if isinstance(node,ast.Name) and node.id=='p':return sp.pi
        if isinstance(node,ast.Constant) and type(node.value) is int and abs(node.value)<=10**9:return sp.Integer(node.value)
        if isinstance(node,ast.Constant) and type(node.value) is float and len(str(node.value))<=16:
            return sp.Rational(str(node.value))
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            value=visit(node.operand);return value if isinstance(node.op,ast.UAdd) else -value
        if isinstance(node,ast.BinOp):
            left,right=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return left+right
            if isinstance(node.op,ast.Sub):return left-right
            if isinstance(node.op,ast.Mult):return left*right
            if isinstance(node.op,ast.Div) and right!=0:return left/right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='r' and len(node.args)==1 and not node.keywords:
            value=visit(node.args[0])
            if value.is_Integer and 0<=value<=10**4:return sp.sqrt(value)
        raise ValueError('unsupported arithmetic node')
    value=visit(tree.body)
    if value.is_real is not True or value.is_finite is not True:raise ValueError('nonreal numeric result')
    return value


def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]



def loss(interval,coefficient):
    interval,coefficient=map(sp.sympify,(interval,coefficient))
    if interval<=0 or coefficient<=0:raise ValueError('Positive temperature interval and convection coefficient required')
    return (5+coefficient)*interval

def interval_inverse(power,coefficient):
    power,coefficient=map(sp.sympify,(power,coefficient))
    if power<=0 or coefficient<=0:raise ValueError('Positive power and coefficient required')
    return sp.cancel(power/(5+coefficient))

def convection_inverse(power,interval):
    power,interval=map(sp.sympify,(power,interval))
    if interval<=0 or power<=5*interval:raise ValueError('Power above fixed conduction contribution required')
    return sp.cancel(power/interval-5)

@lru_cache(maxsize=1)
def oracle():
    G,h,A,d,P,k1,k2=sp.symbols('G h A d P k1 k2',positive=True)
    law=G*d+h*A*d;assert sp.expand(law-(G+h*A)*d)==0
    unique([(G+h*A)*d,(G+h)*d,G*h*A*d,d/(G+h*A),(G+h*A)/d],law)
    unique([P/(G+h*A),P/G,P/(h*A),(G+h*A)/P,P/(G*h*A)],sp.solve(sp.Eq(P,law),d)[0])
    ratio=sp.cancel(law.subs({d:k1*d,h:k2*h})/law)
    unique([k1*(G+k2*h*A)/(G+h*A),k1*k2,k1/k2,(G+k2*h*A)/(G+h*A),k1*(G+h*A)/(G+k2*h*A)],ratio)
    aa,bb=loss(10,5),loss(20,10);assert (aa,bb)==(100,300)
    gain,offset=calibrate(aa,bb,201,601);assert (gain,offset)==(2,1)
    assert loss(15,sp.Rational(15,2))==sp.Rational(375,2)
    z=sp.symbols('z',real=True);roots=sp.solve(sp.Eq(2*z*(5+z),100),z);assert roots==[-10,5]
    Q=SI.Quantity;assert ((Q(5,'W/K')+Q(5,'W/m^2/K')*Q(1,'m^2'))*Q(10,'K')).to('W').magnitude==100
    assert interval_inverse(100,5)==10 and convection_inverse(100,10)==5
    return [aa,'W','P = (G + h A) ΔT','Da 100 a 200 W',interval_inverse(aa,5),convection_inverse(aa,10),loss(10,10)/aa,200-aa,'ΔT = P / (G + h A)','κ₁ (G + κ₂ h A)/(G + h A)',bb/aa,(aa+bb)/2,convection_inverse(3*aa,20)/5,interval_inverse(sp.Rational(900,3),10),interval_inverse((401-offset)/gain,5),next(v for v in roots if v>0)]

MANUAL=['Due percorsi distinti e diretti fra le stesse temperature hanno conduttanze in parallelo: G_tot=5 W/K+h·1 m². Con h=5 W/(m² K) e ΔT=10 K: P=(5+5)·10=100 W, 50 W per percorso.', 'P è potenza W. Una conduttanza è W/K e il coefficiente superficiale h è W/(m² K): occorre l’area prima di sommare con 5 W/K. Le alternative candidate sono state poi lette integralmente: unica unità compatibile W.', 'Formula fisica P=[G_s+hA]ΔT, G_s=5 W/K e A=1 m². Nei valori numerici dichiarati P[W]=(5+h[W/(m² K)])ΔT[K]. Non si sommano resistenze in serie perché i percorsi sono distinti.', 'h=5 fisso: G_tot=10 W/K; ΔT da 10 a 20 K porta P da 100 a 200 W. La relazione è lineare a conduttanze costanti.', 'ΔT=P/(G_s+hA)=100/(5+5)=10 K. Il denominatore positivo è una conduttanza, non una resistenza.', 'h=(P/ΔT−G_s)/A=(100/10−5)/1=5 W/(m² K). Per il ramo h>0 occorre P>G_sΔT.', 'A: P=100 W; B a ΔT=10 K e h=10 dà P=150 W. Rapporto 3/2, non 2, perché il sostegno mantiene 5 W/K.', 'Proposta 200 W−corretto 100 W=+100 W. Non si cambia il segno della dispersione fisica positiva.', 'Raccogliere ΔT dà ΔT=P/(5 W/K+h·1 m²). Le due conduttanze sono positive e il risultato è in K.', 'P_B/P_A=κ₁(G_s+κ₂hA)/(G_s+hA). Nei numeri assegnati κ₁(5+κ₂h)/(5+h). Il sostegno non si scala con κ₂.', 'A=100 W; B con ΔT=20 K e h=10 dà (5+10)20=300 W. Rapporto 3.', 'Media (100+300)/2=200 W. Ingressi medi 15 K e 15/2 W/(m² K) darebbero (25/2)15=375/2 W; differenza 25/2 W.', 'Bersaglio 300 W a ΔT=20 K richiede G_tot=15 W/K; h_BA=10 W/K, h_B=10 e rapporto con h_A=5 pari a 2.', 'A=100 W, S=300 implica a=3 W⁻¹. Nuova lettura 900 dà 300 W. Con h=10 la conduttanza totale è 15 W/K, ΔT=20 K.', 'a=(601−201)/(300−100)=400/200=2 W⁻¹, b=1. S_C=401 dà 200 W; a h=5 la conduttanza totale 10 W/K dà ΔT_C=20 K.', 'Vincolo numerico ΔT=2h fra preparazioni, coefficiente con unità m²K²/W. P=2h(5+h)=100 implica h²+5h−50=0=(h−5)(h+10). Radici 5 e −10; soltanto h=5 W/(m² K) è positivo e dà ΔT=10 K.']

DISTRACTORS=['50 W omette un percorso;25 W pone in serie due resistenze1/5 K/W;2500 avrebbeW².', 'G haW/K e hW/(m² K); solo dopo hA e ΔT si ottieneW.', 'G+h non è somma omogenea;GhAΔT haW²/K;ΔT/(G+hA) haK²/W;divisione perΔT haW/K².', '50 rende inverso il salto;400 usa quadrato;150 raddoppia un solo ramo.', '20 K ignora convezione;100 copia il numero deiW senza conduttanza.', '10 attribuisce a h anche il sostegno;15 somma G invece di sottrarre; h≤0 viola il ramo.', '2 segue solo convezione;2/3 inverte il totale;1 ignora il cambiamento.', '−100 inverte ordine;200 copia proposta;0 la accetta;2 è rapporto puro.', 'P/G oP/(hA) omettono un percorso;reciproco dàK⁻¹;P/(GhA) dàK²/W.', 'G non viene scalato:κ₁κ₂ lo cambierebbe;omissioneκ₁ perde il salto;ultimo inverte conduttanze.', '4 presume due raddoppi su tutto;2 segue salto;3/2 segue conduttanza;1/3 è reciproco.', '375/2 W usa dati medi;400 non dimezza;100 e300 ignorano una prova.', '3 copia potenza e3/2 conduttanza;1/2 inverte coefficiente; nessuno soddisfa300 W.', '900/15=60 K trascura guadagno3;300/10=30 K trascura nuova h.', '401/20 omette offset e predice402;40 non divide perq;200 copiaW.', '−10 rende h e salto negativi;10 produce300 W;50 produce5500 W; radici fisiche una sola.']

ASSUMPTIONS=['Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due percorsi distinti diretti fra corpo mantenuto e medesimo ambiente: sostegno G=5 W/K, superficie A=1 m² con h>0 costante entro la prova. Salto ΔT>0 comune, solo questi percorsi, nessun accumulo nei collegamenti. Potenze additive, non resistenze in serie. Variabili normalizzate x,u,p pure. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.']

UNITS={1: 'W', 2: 'W', 3: 'W', 4: 'W', 5: 'K', 6: 'W/m^2/K', 7: '', 8: 'W', 9: 'K', 10: '', 11: '', 12: 'W', 13: '', 14: 'K', 15: 'K', 16: 'W/m^2/K'}

NUMERIC_UNITS={1: 'W', 5: 'K', 6: 'W/(m² K)', 11: '1', 14: 'K'}

SUFFIX={8: ' W', 12: ' W', 15: ' K', 16: ' W/(m² K)'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='XML e PNG nativo integrale letti. Due percorsi diretti fra stesso corpo e ambiente con frecce separate; schema non geometria delle resistenze. Barre50+50=100W larghezze175+175=350; confronto100/300/200W larghezze120/360/240. Ogni pannello ha scala propria dichiarata tramite valori fisici, zeri staccati dagli assi e nessuna misura di pixel effettivi.'

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infiniti valori positivi'}}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u5-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C3' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(exact_literal(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='9f0907273410a8cf981acf1e1a441a046bc84b18'

SOURCE_READING='Primaria indipendente80 prompt-only U5-04 prima di candidati, opzioni o chiavi: SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Shard intero SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Poi lettura individuale completa dei16 candidati, ogni opzione/blocco/formula/hint/feedback/metadato/didascalia, confronto con derivazioni e dati finali; cinque SVG XML e rendering QuickLook integrali realmente letti sotto mutex e guardia2GiB. ROOT byte-identico al pin B finale. Lezioni reali C3-L01/L05/L06/L09/L10 rilette; nessun autore importato, nessuna approvazione da chiavi.'

REVIEWED_PACKAGE_SHA256='fb8df8032a68bc7f995229103b8423f89e4527d60538c100f7ddb36befd3ac86'

REVIEWED_BINDINGS_SHA256='c3514e94d659bb657f35d6846d39d4c9c4f1d2438f08bdb46e52ff7b6fef049c'

REVIEWED_CANDIDATES={'AR-u5-parallel-heat-losses-01': '80651779cc99104428770e668ea9fb82c87c7cac089613d609cfdf5256efaf81', 'AR-u5-parallel-heat-losses-02': 'd5ed9dd9f2e51818c5789936be33d9c9aafa3fe39ba45477f653cc534c69fbe7', 'AR-u5-parallel-heat-losses-03': '6bc313bc888d0d690ac85cf9a5b54ea8ca8df0f2d0c30eae479d24331fd58ead', 'AR-u5-parallel-heat-losses-04': '7ac11516246120c8bf547c41359bbebc2de1860e8600a8a9f605777b41a6c34e', 'AR-u5-parallel-heat-losses-05': 'f65184003bc2f1ecf9f0f6c4edd0777ed10d43ab86cd16667a1e660987574cf4', 'AR-u5-parallel-heat-losses-06': 'ac4d2ab6e02de5192abaf68f3c2895e79475ef1521bc9f4e1496687a8b857f76', 'AR-u5-parallel-heat-losses-07': '4a615965dc0ab0b288738222853d24987a2e5e2ed2c09858ea63aa5e8885cc07', 'AR-u5-parallel-heat-losses-08': 'b9cf84e775b04e1b32450bea60efb857c6412e2bc67750ee1f9bcb6a11626ce7', 'AR-u5-parallel-heat-losses-09': '6e21ec169c332b04ddcab97bd5dee1d6cb766f915a9c7c0ccb5cd0bbcb8d2c44', 'AR-u5-parallel-heat-losses-10': 'ae1c3dbd37c5516777fb2afbd9b23995a844fa3dabc130097026086514248295', 'AR-u5-parallel-heat-losses-11': 'f8bdc462174bd24d8a8bed149875f6ee5152d0532c535395e7f71767c2c24c1f', 'AR-u5-parallel-heat-losses-12': 'b3401743ce049fc07633b1ccea087034f8850a387716e4be856300627c75c82a', 'AR-u5-parallel-heat-losses-13': '9b0853cff2c51c094ecacaf9255a444f294c3ab619efc99fdcf6b15f33ed2d68', 'AR-u5-parallel-heat-losses-14': '8ad181d00a38cc17eb321c81e4d18d6c04cd8406761f7f1a9946b59edff32075', 'AR-u5-parallel-heat-losses-15': '6ac5932fb9c635944b18f90547a5530b50d0e22bc68962a0bb8b901ec90ab69e', 'AR-u5-parallel-heat-losses-16': 'af716c40a022eb22b209a7b5533b77ddd98c737475b302ff4b7503be6f380ded'}

READ_SOURCE_SHA256={'u5-parallel-heat-losses-01': 'd5e8e0e0fc4cc942efc61f9722b2547fd817528c65ad83c4e0b864339415ce07', 'u5-parallel-heat-losses-02': '8d51184691b7b09354b793b8dc4754a774bdff6a5c1bb64b16ff8ac68a64103c', 'u5-parallel-heat-losses-03': 'f10d6157f53da81a20dae14942b558a0c15ca6c8f2cc91e2d2463d7ef70b710a', 'u5-parallel-heat-losses-04': '91bc8facd51d3ee70633bcf912851547656fcae82b900f542bd47d948c567150', 'u5-parallel-heat-losses-05': '722ccdd70055150467146cb4ba2dd1b3b700abee48c96453a42b0840cf37fefc', 'u5-parallel-heat-losses-06': '10c1f0ca93293cc5a067e75e744ada865b6a5ed21af101a5020b3cf449ec0c56', 'u5-parallel-heat-losses-07': '7f8f8d4d8154a464ce446f570d2f37dd14db9e0881f9f4c2b69cda37239c41e1', 'u5-parallel-heat-losses-08': '644903432f1f4ffc8f4b152c8334f82cc956b5b63eb862200bb294d80e43874a', 'u5-parallel-heat-losses-09': '365566d90b71560c328716b4771ef4d915880033359b4cf43010ac80ae229e51', 'u5-parallel-heat-losses-10': 'c2065f1a627acb1436f4db478d2130ad21f0cf342a80bc9aacb4b67cc400bd0e', 'u5-parallel-heat-losses-11': '123cf3fd15fd3af138078cbe982fc3fe47f9a7903421a1c66b88d0517f41f55d', 'u5-parallel-heat-losses-12': '44081c89e0b00899cbcccf18e869a408d596a1a1838b64fe5ffba3fe2128625f', 'u5-parallel-heat-losses-13': '8f0ae0b1b7556f550e902986cef41bbad0fa319b57f4789d13eefc694a91a9da', 'u5-parallel-heat-losses-14': '91d66ec7c87e6897ecad29877b18026309d54aaf2a1e377ae0b3a1c668a607c7', 'u5-parallel-heat-losses-15': '5840f26fcd9e8b751f38cdd5851185f8228ae50ad65ead9e0b85eccc87f10c4f', 'u5-parallel-heat-losses-16': 'dbb6d50612ebd7bc10132d33880b35e6755200acd05f36498a253d10e3d3183e'}
