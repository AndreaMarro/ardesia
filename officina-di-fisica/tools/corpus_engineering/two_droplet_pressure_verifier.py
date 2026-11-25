"""Independent U3-05 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-05.json'
FAMILY='two-droplet-pressure'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C2-L010'

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

@lru_cache(maxsize=1)
def oracle():

    gamma,r,s,D,k,l=sp.symbols('gamma r s D k l',positive=True)
    law=2*gamma/r-2*gamma/s
    inv=sp.solve(sp.Eq(D,law),r)[0];inv2=sp.solve(sp.Eq(D,law),s)[0]
    ratio=sp.simplify(law.subs({r:k*r,s:l*s})/law)
    unique([2*gamma*(1/r-1/s),2*gamma*(1/s-1/r),2*gamma/(s-r),2*gamma*(s-r),4*gamma*(1/r-1/s)],law)
    unique([1/(D/(2*gamma)+1/s),1/(D/(2*gamma)-1/s),D/(2*gamma)+1/s,2*gamma/D,s-D/(2*gamma)],inv)
    unique([(1/(k*r)-1/(l*s))/(1/r-1/s),k/l,l/k,1/(k*l),k*l],ratio)
    f=lambda a,b:law.subs({gamma:10,r:a,s:b})
    A,B=f(1,4),f(2,5)
    gain,offset=calibrate(A,B,31,13);assert(gain,offset)==(2,1)
    C=(11-offset)/gain
    assert (A+B)/2-f(sp.Rational(3,2),sp.Rational(9,2))==sp.Rational(29,18)
    assert sp.solve(sp.Eq(law.subs(r,s/4),15),s)==[2*gamma/5]
    q=SI.Quantity
    assert (2*q(10,'mN/m')/q(1,'mm')).to('Pa').magnitude==20
    assert (q(1,'Pa')/q(1,'N/m')).to('1/m').magnitude==1
    return [A,'Pa','D = 2 γ (1/r₁ − 1/r₂)','Da 15 a 5 Pa',inv.subs({D:15,gamma:10,s:4}),inv2.subs({D:15,gamma:10,r:1}),f(1,2)/A,30-A,'r₁ = 1 / [D/(2 γ) + 1/r₂]','[1/(κ₁ r₁) − 1/(κ₂ r₂)] / (1/r₁ − 1/r₂)',B/A,(A+B)/2,inv2.subs({D:6,gamma:10,r:2})/4,inv.subs({D:18/(45/A),gamma:10,s:5}),inv.subs({D:C,gamma:10,s:4}),4]

MANUAL=['D=2γ(1/r₁−1/r₂). Con γ=10 mN/m e raggi in mm, D=20(1−1/4)=15 Pa; il comune esterno si cancella.', 'Pressione: [γ/r]=N/m²=Pa. Anche la differenza di due pressioni è in Pa; nessun calcolo numerico autonomo richiesto.', 'p₁=p_e+2γ/r₁ e p₂=p_e+2γ/r₂; sottrarre elimina p_e e conserva la differenza dei reciproci, D=2γ(1/r₁−1/r₂).', 'r₁ da 1 a 2 mm, r₂=4: D passa da 15 a 20(1/2−1/4)=5 Pa. Resta positivo perché 2<4.', '1/r₁=D/(2γ)+1/r₂. Nelle unità Pa/mm, 15/20+1/4=1 mm⁻¹; invertire dà r₁=1 mm.', '1/r₂=1/r₁−D/(2γ)=1−3/4=1/4 mm⁻¹, quindi r₂=4 mm. Occorre 0<D<2γ/r₁ per r₂ finito positivo e ordinato.', 'r₂=2 mm a r₁=1 dà D=20(1−1/2)=10 Pa. Rapporto 10/15=2/3.', 'Proposta 30 meno D=15 dà +15 Pa. I salti singoli 20 e 5 Pa si sottraggono, non si sommano.', 'Riordinare D/(2γ)=1/r₁−1/r₂: r₁=1/[D/(2γ)+1/r₂]=2γr₂/(D r₂+2γ). Denominatore positivo.', 'Il rapporto è [1/(κ₁r₁)−1/(κ₂r₂)]/(1/r₁−1/r₂). Equivalentemente (κ₂r₂−κ₁r₁)/[κ₁κ₂(r₂−r₁)]; richiede κ₁r₁<κ₂r₂.', 'B con raggi 2 e 5 dà D=20(1/2−1/5)=6 Pa; rapporto 6/15=2/5.', 'Media (15+6)/2=21/2 Pa. Raggi medi 3/2 e 9/2 danno 80/9 Pa; differenza 21/2−80/9=29/18 Pa.', 'Target D=6, r₁,B=2: 1/r₂,B=1/2−6/20=1/5 mm⁻¹. r₂,B=5 mm, rapporto rispetto a 4 pari a 5/4.', 'Riferimento D=15,S=45 dà q=3 Pa⁻¹. S_B=18 dà D_B=6; r₂,B=5 implica 1/r₁=3/10+1/5=1/2 e r₁=2 mm.', 'A D=15,S=31 e B D=6,S=13: q=2 Pa⁻¹,z=1. S_C=11 dà D=5; r₂=4 implica 1/r₁=1/4+1/4=1/2, r₁=2 mm.', 'r₁=r₂/4: D=2γ(4/r₂−1/r₂)=6γ/r₂. A D=15 Pa, r₂=60/15=4 mm e r₁=1 mm. Unica soluzione positiva ordinata.']
DISTRACTORS=['20 è il salto della piccola, 5 quello della grande. Differenza 15, non somma 25 né doppio 30.', 'N/m è tensione, N forza, mm lunghezza; N/m² è pressione. Il comune esterno non è un’unità addizionale.', 'Ordine contrario cambia segno; reciproco della differenza non è differenza dei reciproci; moltiplicare per raggi cambia dimensione; quattro introduce una seconda interfaccia assente.', '30 raddoppia erroneamente, 10 non sottrae il secondo salto corretto, 15 ignora r₁ nuovo; zero richiederebbe raggi uguali.', 'Usare solo 2γ/D ignora la curvatura della seconda sfera. L’inversa deve ricostruire D con r₁<r₂.', 'Cambiare il segno nel denominatore non ricostruisce D; il denominatore deve restare positivo. Zero o valore negativo non è un raggio fisico.', '3/2 reciproco; 1/2 segue solo r₂ senza la differenza; 2 inverte la tendenza; 1 ignora la modifica.', '−15 ordine inverso, 30 proposta, zero accetta, 45 somma proposta e corretto.', 'Meno al denominatore non isola r₁; parentesi non invertita è curvatura; 2γ/D trascura r₂; ultima sottrae dimensioni diverse.', 'κ₁/κ₂, κ₂/κ₁ e 1/(κ₁κ₂) perdono la differenza pesata; κ₁κ₂ ha tendenza errata. Per κ₁=κ₂=k, rapporto vero 1/k.', '5/2 reciproco; 1/2 e 4/5 seguono un solo raggio; 6 è valore di D in Pa e non rapporto.', '21 somma, 9/2 semidifferenza, 80/9 modello ai raggi medi, 6 sola B.', '4/5 reciproco; 2/5 copia il rapporto pressorio; 2/1 copiano raggio piccolo o nessuna variazione, non il target.', '18 è display; prima dividere per q=3 e solo dopo invertire la curvatura. r₁=2 riproduce 6 Pa.', 'r₁=1,4,5/2,1/2 danno D=15,0,3,35 Pa; solo 2 dà D=5 e S=11. Il caso 4 è anche il limite di raggi uguali.', 'La proporzione r₁=r₂/4 non lascia scala libera quando D è noto: 6γ/r₂ è strettamente decrescente e determina un unico r₂.']
ASSUMPTIONS=['Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.', 'Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.']
UNITS={1: 'Pa', 2: 'Pa', 3: 'Pa', 4: 'Pa', 5: 'mm', 6: 'mm', 7: '', 8: 'Pa', 9: 'mm', 10: '', 11: '', 12: 'Pa', 13: '', 14: 'mm', 15: 'mm', 16: 'mm'}
NUMERIC_UNITS={1: 'Pa', 5: 'mm', 6: 'mm', 14: 'mm', 16: 'mm'}
SUFFIX={8: ' Pa', 12: ' Pa', 15: ' mm'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Raggi 25/100 px a 25 px/mm per 1/4 mm. Barre a 10 px/Pa: 200,50,150 px per 20,5,15 Pa. B raggi 2/5 mm produce 10/4 Pa e D=6: barre 100/40/60 px alla stessa scala e origine. Si rappresentano salti rispetto allo stesso esterno, non pressioni assolute.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u3-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C2' or row.get('skill')!=REVIEWED_SKILL:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
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


CANDIDATE_REF='501175a83f87be32d34db32c9d68e5992e343982'
SOURCE_READING='All80 original B125–129 U3-05 prompts individually read and independent derivations saved before opening candidate packages. Author handoffs supplied only commits, files and general model assumptions, no numeric results or answer keys. All16 final records including every option, block, hint, feedback, metadata and figure caption read in full, plus complete SVG XML and native rendering. Never imports authoring. C2-L001/L002/L004/L010 are existing course lessons; primary skill C2-L010 addresses surface forces and energy.'
REVIEWED_PACKAGE_SHA256='f9d53c5c807a4527c1bb268a5c0cfd068f89cb8e4394c80799e728972fee349c'
REVIEWED_BINDINGS_SHA256='f2c4beea9bb8d4096b21754452c11799a230a7a9923c12a8455f75d508486002'
REVIEWED_CANDIDATES={'AR-u3-two-droplet-pressure-01': '87af765714144e566c25891eb41396f9ff69c87ff77ec4d69e8dec49d890da99', 'AR-u3-two-droplet-pressure-02': '9058a2a94094ea31fe95cc954ea9bf219c7bb653d1401239b386031ea477eeaf', 'AR-u3-two-droplet-pressure-03': 'f9cc42a83c2fcf8b125c591d2cc11d72cadf84e279af76afd5c9432bb1b82519', 'AR-u3-two-droplet-pressure-04': '15bd64fbd27e1593c9d333baaabe3cb496ce4c7108df3a40e7034f5901686969', 'AR-u3-two-droplet-pressure-05': '49201be26a35cec71dcd4d47b01d00c465c3a2ba725c1c79b57d0b1e63952366', 'AR-u3-two-droplet-pressure-06': '7850a257cc9ffb1b232c6d74d8a72b7cc7edd1b6e7882fad725d787778dd2914', 'AR-u3-two-droplet-pressure-07': 'dc299a19cfe0b9867d37793b21e14daa50b700cec68b62d39bfee6bb00e30e3f', 'AR-u3-two-droplet-pressure-08': 'ac7df61b8e477bc2df8774316f24c7833647c6596812aeaae2cfdf187fa88708', 'AR-u3-two-droplet-pressure-09': '0a9735cf5aefaff8072d9212b8e3b0b7f99a4de56a5eec7ffbaaf01bf493bf9f', 'AR-u3-two-droplet-pressure-10': '7eaeae45a182a052a873d5809dfed78da0507723f53493cd7add308aa6e58e4a', 'AR-u3-two-droplet-pressure-11': '44764f1397723ced24ebd1c61d7a12585703ad6d9041dcc0ad0ecaa3459264d9', 'AR-u3-two-droplet-pressure-12': 'c4c73edacbaf5b482922644300bbd9eb671cc60c50bc618ad26e0169e030bbdf', 'AR-u3-two-droplet-pressure-13': '198d267c27c0dad4a022017621110ee16ac59f4a49d2389a7416c5af92632f64', 'AR-u3-two-droplet-pressure-14': 'e47ae7751c5ed2ae9ba9700e1bca7e3d3575c79cbdc9c487569ecbc7860e3aa6', 'AR-u3-two-droplet-pressure-15': '56ac410ff172054bed57dba171ae3ec4da501b1a4f8d759233e585ee0aa1d230', 'AR-u3-two-droplet-pressure-16': '8632bf5c3362b4e8ee24dc6203f7b8146cf4a37c4d5da6b84aab509fdd173b15'}
READ_SOURCE_SHA256={'u3-two-droplet-pressure-01': 'ca9b1e5fc0f6debe8d3e8868f1f488315cb1550ccc51841f369d648618004088', 'u3-two-droplet-pressure-02': '1408520e3e646d5ee2a137c7d1ba3f7f6faeb4eca091eb9d6729d659384a5134', 'u3-two-droplet-pressure-03': '4160c00b29bdf573ce37354fb011c94358851ba8d654100c71a7cf918bba1fe7', 'u3-two-droplet-pressure-04': 'e49c253648b7936e009899204f31940ac1ae12fff0226dff26056570b0d110fb', 'u3-two-droplet-pressure-05': 'db54ce15cb5942af1f5b6759f2faaaede6b4519eb8bfa05f1c6be715b7fc7fd7', 'u3-two-droplet-pressure-06': '8b748acf44aea40e0f49eb15dfcbc4b7b80a5256c09def42eca342534d59cb34', 'u3-two-droplet-pressure-07': '8f62a54f66260419190f90f046a2aa81e29c5b264e9b2fa4121b73dae70ff1e7', 'u3-two-droplet-pressure-08': '30e455aa1c273bbed3102dd403c24f77ab476e86ba832e24fb79eafbedcdeb08', 'u3-two-droplet-pressure-09': '33909ca11e5ae57fd10beb3cc1d468fa17051abb0add2cda54d8319c0291b53e', 'u3-two-droplet-pressure-10': 'd0cb951e1c00d26b9e78599b7364b18f72e8b705c18adfb2a39f8099d9c7f333', 'u3-two-droplet-pressure-11': '6a0df18fac94436b62ef55c461ac58c45328d05e0a31e433d5ef45046b7b638a', 'u3-two-droplet-pressure-12': '17336714b8273075b94694e6e9f9b00e0101447b9fd23600f2c0526967045550', 'u3-two-droplet-pressure-13': '00a698d3452656b0ac1eaef8c7b6ae7b71d38723935d51d672868d01cfc03d4a', 'u3-two-droplet-pressure-14': '1a0ce462de034b3c4cc2ff25fdca6145b9e3d79ed2297136fc725a0583b7ff5d', 'u3-two-droplet-pressure-15': '693da694685f0bc10e49222c0d03f97cb8ace6164b55f052b06f6101b7538717', 'u3-two-droplet-pressure-16': '978bc471e34d3955734764f2fae67e8a35a310802a5874f007b8afec791dcf20'}
