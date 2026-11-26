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
FAMILY='droplet-fragmentation'
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

    gamma,R,r,N,E,k,l=sp.symbols('gamma R r N E k l',positive=True)
    child=sp.solve(sp.Eq(N*r**3,R**3),r)[0]
    law=sp.simplify(gamma*4*sp.pi*N*child**2)
    inv=sp.solve(sp.Eq(E,law),R)[0]
    ratio=sp.simplify(law.subs({R:k*R,N:l*N})/law)
    unique([4*sp.pi*gamma*R**2*N**sp.Rational(1,3),4*sp.pi*gamma*R**2*N,4*sp.pi*gamma*R**2/N**sp.Rational(1,3),4*sp.pi*gamma*child**2,4*sp.pi*gamma*R**2*(N**sp.Rational(1,3)-1)],law)
    unique([sp.sqrt(E/(4*sp.pi*gamma*N**sp.Rational(1,3))),E/(4*sp.pi*gamma*N**sp.Rational(1,3)),sp.sqrt(4*sp.pi*gamma*N**sp.Rational(1,3)/E),sp.sqrt(E*N**sp.Rational(1,3)/(4*sp.pi*gamma)),(E/(4*sp.pi*gamma*N))**sp.Rational(1,3)],inv)
    unique([k*k*l**sp.Rational(1,3),k*l**sp.Rational(1,3),k*k*l,k*k/l**sp.Rational(1,3),k**3*l],ratio)
    f=lambda a,b:sp.simplify(law.subs({gamma:sp.Rational(1,100),R:sp.Rational(a)/1000,N:b})*10**6)
    A,B=f(1,8),f(2,27)
    gain,offset=calibrate(A,B,1+4*sp.pi/25,1+24*sp.pi/25);assert(gain,offset)==(2,1)
    C=(1+16*sp.pi/25-offset)/gain
    assert sp.simplify(C/A)==4
    # N=1: finite final energy, zero increase, no fictional continuous count.
    assert law.subs(N,1)==4*sp.pi*gamma*R**2
    assert sp.Rational(8+27,2).is_Integer is False
    x=sp.Symbol('x',positive=True)
    constrained=law.subs({R:sp.Rational(1,8000)*x**3,N:x**3,gamma:sp.Rational(1,100)})*10**6
    assert sp.simplify(constrained-sp.pi*x**7/1600)==0
    assert sp.simplify(constrained.subs(x,2)-A)==0 and sp.diff(constrained,x).is_positive
    q=SI.Quantity
    assert (q(1,'N/m')*q(1,'mm')**2).to('microjoule').magnitude==1
    assert q(1,'microjoule').to('J').magnitude==Fraction(1,10**6)
    rad_from=lambda energy,count:sp.simplify(inv.subs({E:energy/10**6,N:count,gamma:sp.Rational(1,100)})*1000)
    count_from=lambda energy,rad:sp.simplify((energy/f(rad,1))**3)
    constrained_root=sp.solve(sp.Eq(x**7,128),x)[0]
    return [A,'µJ','E_f = 4 π γ R² ∛N','Da 2π/25 a 8π/25 µJ',rad_from(A,8),count_from(A,1),f(1,27)/A,4*sp.pi/25-A,'R = √[E_f / (4 π γ ∛N)]','κ₁² ∛κ₂',B/A,(A+B)/2,count_from(B,2)/8,rad_from((36*sp.pi/25)/(6*sp.pi/25/A),27),rad_from(C,8),constrained_root**3]

MANUAL=['Nr³=R³ con N=8 dà r=R/2=1/2 mm. A_f=8·4π(R/2)²=8πR²; γ=1/100 N/m,R²=10⁻⁶ m² danno E_f=8π·10⁻⁸ J=2π/25 µJ. E_i=π/25 µJ.', '(N/m)m²=N·m=J e 1 µJ=10⁻⁶ J. Nessun calcolo numerico autonomo richiesto; la dimensione energetica è provata.', 'r=R/∛N, A_f=4πNr²=4πR²∛N, E_f=γA_f. Incremento invece E_i(∛N−1); a N=1 E_f=E_i>0 ma ΔE=0.', 'R doppio a N=8 fisso: area quadrupla, E_f da 2π/25 a 8π/25 µJ. Il volume cresce invece di otto.', 'Con N=8, R²=E_f/(8πγ)=10⁻⁶ m². Radice fisica R=10⁻³ m=1 mm, distinta da r=1/2 mm.', 'E_f/E_i=2=∛N; elevare al cubo dà N=8 intero positivo. Un dato che producesse cubo non intero sarebbe incompatibile, non da arrotondare.', 'A R fisso, ∛27/∛8=3/2: rapporto E_f,B/E_f,A=3/2.', 'Proposta 4π/25 meno finale corretto 2π/25 dà +2π/25 µJ. L’incremento fisico rispetto a E_i sarebbe invece π/25.', 'R²=E_f/(4πγ∛N) è un’area. R=√[E_f/(4πγ∛N)] è l’unica radice positiva; nessuna radice cubica di R nell’energia.', 'R_B=κ₁R_A,N_B=κ₂N_A producono rapporto κ₁²∛κ₂. κ₂N_A dev’essere intero positivo: il fattore può essere razionale, non il conteggio.', 'B R=2,N=27 dà E_f=12π/25 µJ. Rapporto con 2π/25: 6=4·3/2.', 'Media (2π/25+12π/25)/2=7π/25 µJ. N medio 35/2 non è intero e non descrive una prova ammessa; non occorre valutare alcun radicale non notevole.', 'Target rapporto 6 e R doppio: ∛(N_B/N_A)=6/4=3/2. Cubo 27/8, N_B=(27/8)·8=27 intero.', 'A E=2π/25,S=6π/25: q=3 µJ⁻¹. B S=36π/25 dà E=12π/25; N=27 porta R²=4 mm²,R=2 mm.', 'A/B E=2π/25,12π/25 e display 1+4π/25,1+24π/25 danno q=2 µJ⁻¹,z=1. C E=8π/25 con N=8 implica R²=4 mm²,R=2 mm.', 'R=cN,c=1/8 mm. Porre x=∛N>0: E_f=4πγc²x⁷=(π/1600 µJ)x⁷. Dato 2π/25 implica x⁷=128=2⁷; monotonia positiva dà x=2,N=8,R=1 mm.']
DISTRACTORS=['π/25 è iniziale e anche incremento per N=8, non finale;8π/25 conserva raggio eccessivo;π/50/16π/25 non rispettano area finale e volume.', 'N/m tensione,Pa pressione,mm² area,N forza. µJ misura energia senza alterare dimensioni.', 'N diretto conserva troppo raggio;1/∛N diminuisce area;4πγr² conta una figlia;∛N−1 dà incremento. Per N=1 alcune alternative coincidono numericamente, ma non sono leggi generali.', '4π/25 segue lunghezza,16π/25 segue volume;costante e dimezzato non rispettano R².', 'Negativo non è raggio;1/2 mm è raggio figlio, non iniziale. π si cancella esattamente.', '2 radice cubica,4 quadrato di quella radice, non numero di figlie; non arrotondare un conteggio incompatibile.', '27/8 rapporto conteggi,9/4 quadrato del rapporto corretto,2/3 reciproco,1 confonde conservazione di volume e area.', 'Segno negativo inverte ordine;4π/25 proposta,6π/25 somma,zero accetta. Incremento è quantità ancora diversa.', 'Senza radice resta area;reciproco lunghezza inversa;∛N al numeratore inverte il conteggio;radice cubica finale confonde conservazione volumetrica e energia.', 'κ₁ segue lunghezza,κ₁³ volume;κ₂ diretto ignora riduzione delle figlie e divisione per radice inverte la tendenza.', '3/2 solo N,4 solo R,27/2 usa conteggio diretto,1/6 reciproco.', '14π/25 somma,5π/25 semidifferenza,12π/25 sola B,π/25 iniziale A. La media statistica non richiede un conteggio medio fisico.', '3/2 è la radice cubica del rapporto,9/4 suo quadrato,8/27 reciproco,6 ignora R.', 'Sei è il rapporto di letture; eliminare fattore 3/2 della frammentazione lascia R² relativo quattro, poi radice due.', '4 confonde rapporto energie e raggi;1 riproduce A;1/2 dà quarto di energia;√2 dà doppio invece del quadruplo.', 'c ha dimensione lunghezza per conteggio; fermarsi a quadrato/cubo perde il fattore N^(1/3). La settima potenza è crescente su x>0 e la soluzione soddisfa N intero.']
ASSUMPTIONS=['Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.', 'Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.']
UNITS={1: 'microjoule', 2: 'microjoule', 3: 'microjoule', 4: 'microjoule', 5: 'mm', 6: '', 7: '', 8: 'microjoule', 9: 'mm', 10: '', 11: '', 12: 'microjoule', 13: '', 14: 'mm', 15: 'mm', 16: ''}
NUMERIC_UNITS={5: 'mm', 6: '1', 14: 'mm', 16: '1'}
SUFFIX={1: ' µJ', 8: ' µJ', 12: ' µJ', 15: ' mm'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Un cerchio raggio 50 px e otto figlie raggio 25 px a 50 px/mm: sfere viste in sezione centrale, non dischi conservanti area. Volumi 8·(1/2)³=1, aree 8·(1/2)²=2. Barre d’area 100/200 px a 100 px/A₀; barre energetiche 100/200/100 px per E_i/E_f/ΔE alla scala 100 px per π/25 µJ. Lavoro minimo associato soltanto all’incremento e con ipotesi reversibili esplicite.'

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


CANDIDATE_REF='9c323c14289df414068355b30f729ef760cc2508'
SOURCE_READING='All80 original B125–129 U3-05 prompts individually read and independent derivations saved before opening candidate packages. Author handoffs supplied only commits, files and general model assumptions, no numeric results or answer keys. All16 final records including every option, block, hint, feedback, metadata and figure caption read in full, plus complete SVG XML and native rendering. Never imports authoring. C2-L001/L002/L004/L010 are existing course lessons; primary skill C2-L010 addresses surface forces and energy.'
REVIEWED_PACKAGE_SHA256='bbdad31f77cc50c7f015dbbb4efbe183d7881c5a13e08b899a62b62becc8a643'
REVIEWED_BINDINGS_SHA256='1014e5fcf4df2b2eb434031faf2d49ab0d30fc725dceb7798b5f6786a9d73b2a'
REVIEWED_CANDIDATES={'AR-u3-droplet-fragmentation-01': '17604896edefdef70ede25a652ec8c105b23e8503d6e97f187269ca1c811566b', 'AR-u3-droplet-fragmentation-02': '2e2b01a25acee1ae79af5d43b4d414ab96b8201e5c6a81e322e34f11a2fad964', 'AR-u3-droplet-fragmentation-03': '4ac88ee6efcb7b7a09d1e13f80ae55bfd16022004b32e115c24ea52e1cd675af', 'AR-u3-droplet-fragmentation-04': 'be6bee0fd2368758200714321a23f7b2016e93c338a64e07b150d54bab3d3782', 'AR-u3-droplet-fragmentation-05': '07cf149c033677a2139f8b8bdfed97d2616c2a35958342157f88b2b268ab1079', 'AR-u3-droplet-fragmentation-06': 'e98c8cb963712a0aa38a9ce9b281a767850e3ac742f7a4eaa9a4df00eb459710', 'AR-u3-droplet-fragmentation-07': 'c367694c87d640e2508cb48557c6ca6148b1334a5e93fab0267566b655093cf8', 'AR-u3-droplet-fragmentation-08': 'df1be2a90e88457d9346b8e3dcc4a2c06821e9f7a955aac419136f2fa26b9c33', 'AR-u3-droplet-fragmentation-09': '91fcbb9312b60bf9e7ed8c81c21eb387afd86e3b42ba4c27a2d6f958e1d9d9d7', 'AR-u3-droplet-fragmentation-10': '8133fe8628cc1d27e392e199aa0d4811b1119aab630c3e1d2bce23ea17baf479', 'AR-u3-droplet-fragmentation-11': '87b2cf7e78956140896e7ab835d418119b3337f7be7a52bfff7e9b6c04200dfb', 'AR-u3-droplet-fragmentation-12': 'b20ec50f640844a4329ec9b46c3c060b7618554075681afb78457fd3110ac0d5', 'AR-u3-droplet-fragmentation-13': 'ad8ae18cb3a91b71456a9e69d941e652dc39ac689839d5b74f29dcb4eac960b4', 'AR-u3-droplet-fragmentation-14': 'b9138f4f3cfad66415455f66d0aedf80d0c330bd7f24eeef033b99d342471e0d', 'AR-u3-droplet-fragmentation-15': 'd466198873881ede92ab5ff91abb7086d7c500c339fe3d80a224695b481af14c', 'AR-u3-droplet-fragmentation-16': '85f47a8892ec87a6b3eb8d1d89cdec13030200409d1abc294411c2ba438b0580'}
READ_SOURCE_SHA256={'u3-droplet-fragmentation-01': '6535a485cd2951223db548edd1b974a1f7ba13a7a1cf08b373438c650aba60eb', 'u3-droplet-fragmentation-02': '71232183b00fdda664d2cc6e9e96ffcae8640aaed80d7198ed3d19eee01c7bad', 'u3-droplet-fragmentation-03': 'e272669564c6c55f4eb471e17ea1d40a26a3ae1e87f80e4484db1da9f13c96a7', 'u3-droplet-fragmentation-04': 'ce02621d653b0011fee4ea4d554bd60c78a35665e773558424ff7df203f3a8e2', 'u3-droplet-fragmentation-05': '7a5d719d44b3c0600f4a8ac75b197a0d81f84d1e27f4f3b7185c966a95a9ff6f', 'u3-droplet-fragmentation-06': '1bd39ea53fd27a4dbd1af50498f150fe3b75fa9470d773cc414b8c0e02c9a9e0', 'u3-droplet-fragmentation-07': 'ef94884279e8fce0bbf16896d6f4d55befaed1fe90f766eb484a133cc99c526b', 'u3-droplet-fragmentation-08': '866edd62db99627e296ee35f793f5f81067ef520140c40bc89e480f8b7be1655', 'u3-droplet-fragmentation-09': 'c9d40f546662accae05bcc0f68815304b881cf2635469d9990de158ba6a761ff', 'u3-droplet-fragmentation-10': 'bc4b52c180bfe7c569c45807e6de9e154d3f9babbd6535dca3a3da7245b42ada', 'u3-droplet-fragmentation-11': '8d491439809196506e446594cb08ab2157c8ebd000867ce967d99474ff3a9cdf', 'u3-droplet-fragmentation-12': '30d49d0f6f44591e89e29a51a5a484943da97a7ec5b9f2ba5c05c9e84ac8b5db', 'u3-droplet-fragmentation-13': 'e1450bf5c748131329f0c4f54d77cdf496a0e8be17302d022dc4c171bbe46338', 'u3-droplet-fragmentation-14': '61df1ec8789dfbc6ef75f4b501a6f2e38563be6113ab7fc41b448fa77e687c0e', 'u3-droplet-fragmentation-15': '042189a18bbc11dc2463e92d36811904e865bd184116927365e8a712fb5634cd', 'u3-droplet-fragmentation-16': 'f994291fc59722986975544d7eda0f80e6b61f358fa05ef65ab3d9a2d4bf5103'}
