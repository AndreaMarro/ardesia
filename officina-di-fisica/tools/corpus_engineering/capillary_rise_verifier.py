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
FAMILY='capillary-rise'
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

    gamma,r,rho,g,h,k,l,c=sp.symbols('gamma r rho g h k l c',positive=True)
    law=sp.solve(sp.Eq(2*sp.pi*r*gamma,rho*g*sp.pi*r*r*h),h)[0]
    inv=sp.solve(sp.Eq(h,law),gamma)[0];inv2=sp.solve(sp.Eq(h,law),r)[0]
    ratio=sp.simplify(law.subs({gamma:k*gamma,r:l*r})/law)
    unique([2*gamma/(rho*g*r),2*gamma*r/(rho*g),gamma/(rho*g*r),2*gamma/(rho*g*r*r),rho*g*r/(2*gamma)],law)
    unique([rho*g*r*h/2,2*h/(rho*g*r),rho*g*h/(2*r),2*rho*g*r*h,rho*g*r/(2*h)],inv)
    unique([k/l,k*l,l/k,k/l**2,k+l],ratio)
    # Numerical millimetres after exact SI prefix conversion.
    f=lambda a,b:sp.simplify(law.subs({gamma:sp.Rational(a)/1000,r:sp.Rational(b)/1000,rho:1000,g:10})*1000)
    A,B=f(50,1),f(40,2)
    gain,offset=calibrate(A,B,21,9);assert(gain,offset)==(2,1)
    C=(17-offset)/gain
    assert (A+B)/2-f(45,sp.Rational(3,2))==1
    assert sp.diff(law.subs(gamma,c*r),r)==0
    assert law.subs(gamma,c*r).subs({rho:1000,g:10,c:50})==sp.Rational(1,100)
    q=SI.Quantity
    assert (2*q(50,'mN/m')/(q(1000,'kg/m**3')*q(10,'m/s**2')*q(1,'mm'))).to('mm').magnitude==10
    assert (q(1000,'kg/m**3')*q(10,'m/s**2')*q(1,'mm')*q(10,'mm')/2).to('mN/m').magnitude==50
    tension_from=lambda level,rad:sp.simplify(inv.subs({h:sp.Rational(level)/1000,r:sp.Rational(rad)/1000,rho:1000,g:10})*1000)
    radius_from=lambda level,tension:sp.simplify(inv2.subs({h:sp.Rational(level)/1000,gamma:sp.Rational(tension)/1000,rho:1000,g:10})*1000)
    return [A,'mm','h = 2 γ / (ρ g r)','Da 10 a 8 mm',tension_from(A,1),radius_from(A,50),f(50,2)/A,20-A,'γ = ρ g r h / 2','κ₁ / κ₂',B/A,(A+B)/2,radius_from(B,40),tension_from(12/(30/A),2),tension_from(C,1),'Infinite coppie']

MANUAL=['Equilibrio 2πrγ=ρgπr²h: h=2γ/(ρgr). γ=1/20 N/m, r=1/1000 m, denominatore 10 N/m²: h=1/100 m=10 mm.', '[ρgr]=N/m² e [γ]=N/m; il quoziente è m, dunque mm è corretto. Nessun calcolo numerico autonomo richiesto.', 'Con forza verticale 2πrγ cosθ, cancellare πr e porre θ=0 dà h=2γ/(ρgr). Il perimetro cresce come r, il peso per altezza come r².', 'A r=1 mm, γ da 50 a 40 dà h da 10 a 8 mm: fattore 40/50=4/5.', 'γ=ρgrh/2. r=10⁻³ m e h=10⁻² m danno γ=1/20 N/m=50 mN/m, verifica h=10 mm.', 'r=2γ/(ρgh): numeratore 1/10 N/m, denominatore 100 N/m², r=10⁻³ m=1 mm, non diametro.', 'Raggio doppio: perimetro doppio, area quadrupla; h_B=5 mm, rapporto 1/2.', 'Proposta meno corretta 20−10=+10 mm. Quota positiva non coincide col verso di una forza risultante.', 'γ=ρgrh/2 dopo moltiplicazione e divisione per due. [ρgrh]=kg/s²=N/m; lunghezze entrambe in SI.', 'Da γ_B=κ₁γ_A e r_B=κ₂r_A, cancellare 2/(ρg): h_B/h_A=κ₁/κ₂. Per fattori uguali h invariata.', 'B: γ=40,r=2 dà h=40/(5·2)=4 mm. Rapporto con 10: 2/5.', 'Media (10+4)/2=7 mm. Ingressi medi γ=45,r=3/2 danno 45/(15/2)=6 mm, scarto esatto 1 mm.', 'Target h_B=4 mm a γ=40 richiede r=40/(5·4)=2 mm. Rapporto r_B/r_A=2.', 'A h=10,S=30: q=3 mm⁻¹. S_B=12 dà h=4 mm; γ_num=5r_mm h_mm=5·2·4=40 mN/m.', 'Da h=10,4 e S=21,9: q=12/6=2 mm⁻¹,z=1. S_C=17 dà h=8, r=1 implica γ=40 mN/m.', 'γ=cr con c=50 Pa produce h=2c/(ρg)=100/10000 m=10 mm indipendente da r>0. Infinite coppie, anche in un intervallo positivo di piccoli raggi.']
DISTRACTORS=['Usare diametro come raggio dimezza h; seconda interfaccia assente. h è quota sopra il serbatoio, non lunghezza totale bagnata.', 'mm² area, Pa pressione, N/m tensione, µL volume. Occorre area del tubo per passare da h a volume.', 'r al numeratore inverte la dipendenza; omettere due dimezza; r² non cancella il raggio del perimetro; reciproco ha dimensione inversa.', '5/20 usano dimezzamento o raddoppio non dati; 40 copia γ, 10 ignora la modifica.', 'Senza mezzo 100 mN/m; usare 10 m anziché 10 mm moltiplica γ per mille.', 'Il diametro sarebbe 2 mm; γ/h da solo omette ρ,g e due. La risposta richiesta è il raggio.', '1/4 segue solo area, 2 reciproco, 4 segue area direttamente, 1 ignora r nuovo.', '−10 sottrazione inversa; 20 proposta, 30 somma, zero accetta errore.', 'Prodotto inverso o r al denominatore cambiano unità; due al numeratore quadruplica rispetto all’inversa corretta.', 'Prodotto rende r diretto, reciproco scambia fattori, quadrato perde la cancellazione; somma dà due per prove identiche.', '4/5 solo γ, 1/2 solo r, 5/2 reciproco, 4 valore finale non rapporto.', '14 somma, 3 semidifferenza, 4 sola B; 6 è il modello agli ingressi medi.', '1/2 reciproco, 4/5 solo γ, 2/5 solo h; r=4 darebbe h=2 mm.', '12 è lettura, 4 altezza, nessuna è tensione. Cambiare r impedisce di identificare direttamente rapporto fra h e γ.', 'γ=50,20,80 danno S=21,9,33; 17 è lettura. Solo 40 dà S=17 dopo offset.', 'La coppia (1 mm,50 mN/m) è un esempio. Una/due/nessuna confondono il numero di esempi con l’infinita scala libera.']
ASSUMPTIONS=['Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.', 'Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.']
UNITS={1: 'mm', 2: 'mm', 3: 'mm', 4: 'mm', 5: 'mN/m', 6: 'mm', 7: '', 8: 'mm', 9: 'mN/m', 10: '', 11: '', 12: 'mm', 13: '', 14: 'mN/m', 15: 'mN/m', 16: ''}
NUMERIC_UNITS={1: 'mm', 5: 'mN/m', 6: 'mm', 14: 'mN/m'}
SUFFIX={8: ' mm', 12: ' mm', 15: ' mN/m'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Tutte le lunghezze sono a 20 px/mm: primo tubo larghezza 40 px (diametro 2 mm), altezza 200 px (10 mm), raggio 20 px. Piano esterno zero a y400. Confronto finale da y1310: altezze 200/100 px per 10/5 mm e larghezze 40/80 px per raggi 1/2 mm. Forze opposte schematiche, volume del menisco esplicitamente trascurato.'

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


CANDIDATE_REF='0f42bac191aa29677b99f80de50a0f0df18791bd'
SOURCE_READING='All80 original B125–129 U3-05 prompts individually read and independent derivations saved before opening candidate packages. Author handoffs supplied only commits, files and general model assumptions, no numeric results or answer keys. All16 final records including every option, block, hint, feedback, metadata and figure caption read in full, plus complete SVG XML and native rendering. Never imports authoring. C2-L001/L002/L004/L010 are existing course lessons; primary skill C2-L010 addresses surface forces and energy.'
REVIEWED_PACKAGE_SHA256='d18b5dd4a1ad3ebbed7e41f467dcf0a2fe0d90270dc09682471c4c0a3565cc7b'
REVIEWED_BINDINGS_SHA256='1b9dfb8b528d1aa02e2797b7ea04766c764ceed6cfdc70e09501f0c3120894f2'
REVIEWED_CANDIDATES={'AR-u3-capillary-rise-01': 'c30a0b4b32fadd2ac57c13090d6b293d703542647aadd2e9fb6a12184a6ae646', 'AR-u3-capillary-rise-02': '65aed517717c65317734f4c2fcbfe4bd60ce7c4492c8ed4a957045bdea9c03b4', 'AR-u3-capillary-rise-03': '4219386c9270169ab561224786b86c7b189af2392ead2d13cadb69d2a56df059', 'AR-u3-capillary-rise-04': 'cab1cb65d53d8cee22cc60d1f1790b0e5fe93c54e3cb3b2a1ad67ef66469b2e7', 'AR-u3-capillary-rise-05': '598c77ed8d471a4746a27861e62855b5ef71d1891e61abb0ffe33a097bf4ef3c', 'AR-u3-capillary-rise-06': '9212777024d6c021ed3033c23561299cb0425f7a2a20cb8e339564b16b74a601', 'AR-u3-capillary-rise-07': '098f385a559c049c68e7b96c28791f05e8e93ebc670872d609bfe5ff8e8b2d82', 'AR-u3-capillary-rise-08': 'f40319bbe04e69e25b1dc92c4c64aca1e355a03074ffb992a0e90e9c32d93e80', 'AR-u3-capillary-rise-09': '3055d24c55b0bc44911863db3a9ffa7132da23aeace698a7fbe93e1631d94f8d', 'AR-u3-capillary-rise-10': '0aa1cfad738ddcc32bfb79fabff13e0f465a2721454cc71307780d2d1cba8947', 'AR-u3-capillary-rise-11': '021b389fe34685726a8ad8732dd70b07c5357cc321798949dc36d277288b3de6', 'AR-u3-capillary-rise-12': '252e129931ee8329aec40871b1ec0c4cfcb4e725ac694515e68cb064a742fcff', 'AR-u3-capillary-rise-13': '469525d8148aae69b370e7dce162e4a7131f16da452dee0db7eb1a3ab4279939', 'AR-u3-capillary-rise-14': 'd4e44bf6fe6562249f811c264e3b27564668cb802892f21aff1f0c9a93366cc4', 'AR-u3-capillary-rise-15': '31e2df03101f8404f96d22b34874fd167a0d2744842ea9545bab2c04ce6385c1', 'AR-u3-capillary-rise-16': '597d85da7d22f3cb89e7175d1f71f2dd925c0e144bd260ba798a59aaaa3868e3'}
READ_SOURCE_SHA256={'u3-capillary-rise-01': 'acc80015a6491156aff32c00b8d163dd05740cd895a0418636b0b2bd92c234f1', 'u3-capillary-rise-02': '4c439ecc9088e2737bbc59f6af3dccaf65f64113db5faabc40d0b091e7bae2ee', 'u3-capillary-rise-03': 'fc7bdac8d95160ece7c74fbdeb2f58b1cf7ed8aebc44b2270c9f07ccebc406eb', 'u3-capillary-rise-04': '7c57a656979be4b2c0da59f27e40a26a2be4b7c030376319a51e396113d9c261', 'u3-capillary-rise-05': '88404c09187d8c059295f349eba03ffc97cac7d05a39aba3f28d281e196c746e', 'u3-capillary-rise-06': 'a79ca4f0d6a0ca66cac2dafe71128c8b6c51e8ba406a9acbcc2bc71f9e353c97', 'u3-capillary-rise-07': '75603a516881b2623847cb95b00c832048d668f76a43956b3b4d7881c85287ed', 'u3-capillary-rise-08': 'af26f6715c64ba8a44667e3fc9807e625f319a3117ce246a51f476a41b9229fb', 'u3-capillary-rise-09': 'e5559bbc3ebe481888844a58c67badace1d70dc82005d147fff0ef6702044352', 'u3-capillary-rise-10': '424b1581f42c91446182605aa8e9325d6983a26260018c9220436254038e0914', 'u3-capillary-rise-11': '034019889fb53067bf06382d604939e4aa2b492eb70703e6ed613492b893c957', 'u3-capillary-rise-12': 'ab4390f6fe8fcd100e8e0c20bb6e7ad9d805b174f892418f566da48c8c3f75d3', 'u3-capillary-rise-13': '7e7f02e7291739f6501c3b4906b77693ca8942ce4673371430aede697fef59cb', 'u3-capillary-rise-14': 'f62ad679148f643037b065f17d8d89467277ba6338757f6a2978bb7ba85d1a06', 'u3-capillary-rise-15': 'd86c866929e483914b25280157a56903141404eecd113aada13410194400996a', 'u3-capillary-rise-16': 'fcfe66afdd151ef45bc6171063929cd8ef4b4bbe9479c0a504161c69374ee87a'}
