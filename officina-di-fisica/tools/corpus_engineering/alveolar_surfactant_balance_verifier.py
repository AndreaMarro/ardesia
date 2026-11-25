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
FAMILY='alveolar-surfactant-balance'
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

    g,u,x,p,R,k,l=sp.symbols('g u x p R k l',positive=True)
    # Hemisphere pressure force versus rim tension, then equal internal pressures.
    jump=sp.solve(sp.Eq(p*sp.pi*R**2,g*2*sp.pi*R),p)[0]
    law=sp.solve(sp.Eq(jump.subs({g:x,R:u*R}),jump),x)[0]
    inv=sp.solve(sp.Eq(x,law),g)[0]; ratio=sp.simplify(law.subs({g:k*g,u:l*u})/law)
    unique([g*u,g/u,2*g*u,g*u*u,g],law)
    unique([x/u,x*u,u/x,x/u**2,x-u],inv)
    unique([k*l,k/l,l/k,k*l*l,k+l],ratio)
    f=lambda a,b:law.subs({g:a,u:sp.Rational(b)})
    A,B=f(40,sp.Rational(1,2)),f(30,sp.Rational(1,3))
    gain,offset=calibrate(A,B,41,21)
    assert (gain,offset)==(2,1)
    C=(31-offset)/gain
    assert sp.simplify((A+B)/2-f(35,sp.Rational(5,12)))==sp.Rational(5,12)
    assert sp.solve(sp.Eq(law.subs(g,80*u),20),u)==[sp.Rational(1,2)]
    q=SI.Quantity
    assert (q(1,'J')/q(1,'m**2')).to('N/m').magnitude==1
    assert q(20,'mN/m').to('N/m').magnitude==Fraction(1,50)
    return [A,'mN/m','γ_p = γ_g u','Da 20 a 15 mN/m',inv.subs({x:20,u:sp.Rational(1,2)}),sp.Rational(20,40),f(40,sp.Rational(1,3))/A,40-A,'γ_g = γ_p / u','κ₁ κ₂',B/A,(A+B)/2,(B/30)/sp.Rational(1,2),inv.subs({x:30/(60/A),u:sp.Rational(1,3)}),inv.subs({x:C,u:sp.Rational(1,2)}),sp.Rational(1,2)]

MANUAL=['I salti uguali danno 2γ_p/R_p=2γ_g/R_g. Cancellare due e moltiplicare per R_p: γ_p=γ_g u=40·1/2=20 mN/m.', '[γ]=F/L; J=N·m, dunque J/m²=N/m. mN/m è una tensione, non pressione. Nessun calcolo numerico autonomo richiesto; la giustificazione dimensionale resta necessaria.', 'Con esterno comune, p_p=p_g equivale a γ_p/R_p=γ_g/R_g. Moltiplicare per R_p produce γ_p=γ_g u, non una previsione di stabilità.', 'A u=1/2, γ_g passa da 40 a 30: γ_p passa da 20 a 15 mN/m, fattore 3/4.', 'Dividere γ_p=γ_g u per u>0: γ_g=20/(1/2)=40 mN/m. Ricomposizione 40·1/2=20.', 'u=γ_p/γ_g=20/40=1/2, positivo e minore di uno come richiesto dai raggi ordinati.', 'A γ_g=40, u_B=1/3 dà γ_p,B=40/3. Rapporto (40/3)/20=2/3, senza decimalizzare.', 'Proposta meno corretta: 40−20=+20 mN/m. Il segno positivo indica una sovrastima, non il verso di una forza.', 'Da γ_p=γ_g u, isolare γ_g=γ_p/u. Dimensione N/m perché u è puro; prodotto γ_p u non inverte la legge.', 'Sostituzione fra prove: γ_p,B=κ₁γ_g,A κ₂u_A. Diviso γ_p,A dà κ₁κ₂; occorre κ₂u_A<1.', 'B: 30·1/3=10 mN/m. Rapporto 10/20=1/2, uguale al prodotto (3/4)(2/3).', 'Media (20+10)/2=15 mN/m. Ingressi medi 35 e 5/12 danno 175/12; differenza 15−175/12=5/12 mN/m.', 'Target γ_p,B=10 a γ_g,B=30: u_B=1/3. Rapporto con u_A=1/2: (1/3)/(1/2)=2/3.', 'Riferimento γ_p=20 e S=60: q=3 m/mN. S_B=30 dà γ_p,B=10; dividere per u_B=1/3 restituisce γ_g,B=30 mN/m.', 'Riferimenti γ_p=20,10 e S=41,21: q=2 m/mN, z=1. S_C=31 dà γ_p,C=15; u_C=1/2 porta γ_g,C=30 mN/m.', 'γ_g=c u, c=80 mN/m: γ_p=c u². Dato 20, u²=1/4; u=1/2 è l’unica radice in (0,1), mentre −1/2 viola il dominio. γ_g=40 mN/m.']
DISTRACTORS=['40 copia γ_g; 10 dimezza ancora e zero annulla una tensione necessaria a curvatura finita. La relazione deve conservare il salto uguale.', 'Pa è F/L², mN forza, m lunghezza, J energia. Il finding originale J=N/m è corretto dall’autore in J=N·m e riletto separatamente.', 'Dividere per u capovolge l’effetto dei raggi; fattore due superfluo, u² altera la legge, γ_g da sola ignora i raggi diversi.', '30 copia la tensione grande; 40/20 non applicano la variazione; 10 dimezza senza il fattore 3/4 corretto.', '20 copia γ_p senza dividere per il rapporto; un valore sotto γ_p è incompatibile con u<1.', '2 inverte il rapporto e viola u<1; 1/4 quadra inutilmente; 1 uguaglia i raggi; 20 copia una tensione come rapporto.', '3/2 reciproco, 1/3 copia u_B, 1/2 ignora il confronto fra u, 1 ignora la variazione.', '−20 inverte la sottrazione, 40 è la proposta, zero la accetta e 10 dimezza lo scarto.', 'γ_p u moltiplica anziché dividere; u/γ_p è tensione inversa; u² introduce una potenza indebita; γ_p−u sottrae dimensioni diverse.', 'I quozienti invertono un fattore diretto, il quadrato extra non deriva da Laplace, la somma dà due per prove identiche.', '2 è il reciproco; 3/4 segue solo γ_g e 2/3 solo u; 1/4 aggiunge un dimezzamento inesistente.', '30 è somma; 175/12 è il modello agli ingressi medi; 10/20 copiano una sola uscita. La discrepanza è 5/12, non arrotondamento.', '3/2 reciproco, 1/2 copia il rapporto fra le tensioni piccole, 3/4 solo γ_g; 1/3 è u_B e non il rapporto richiesto.', 'Il display 30 è adimensionale; qui coincide numericamente con la risposta solo dopo due operazioni diverse. Prima calibrare, poi imporre il rapporto.', '15 è γ_p,C; 20/40 sono parametri della prova A; 31 è S_C. Soltanto 30 con u=1/2 ricostruisce S=31.', '−1/2 fuori dominio; 1/4 è u²; 2 e 1 non sono rapporti di raggi ammessi. Unicità dalla monotonia di u² su u>0.']
ASSUMPTIONS=['Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.', 'Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.']
UNITS={1: 'mN/m', 2: 'mN/m', 3: 'mN/m', 4: 'mN/m', 5: 'mN/m', 6: '', 7: '', 8: 'mN/m', 9: 'mN/m', 10: '', 11: '', 12: 'mN/m', 13: '', 14: 'mN/m', 15: 'mN/m', 16: ''}
NUMERIC_UNITS={1: 'mN/m', 5: 'mN/m', 14: 'mN/m'}
SUFFIX={8: ' mN/m', 12: ' mN/m', 15: ' mN/m'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Raggi 40/80 px a 40 px/mm per 1/2 mm; tensioni 20/40 mN/m danno Δp=40 Pa in entrambe. Semisfera e forze sono dichiarate schematiche. Grafico origine (100,1340), endpoint (500,1140), scale 400 px per u e 5 px/(mN/m): γ_p=40u. Punto (300,1240) dà u=1/2,γ_p=20; estremi aperti. Nessuna inferenza clinica o di stabilità.'

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


CANDIDATE_REF='15fd7152b040ad03b626784fa1d3ad6d31264633'
SOURCE_READING='All80 original B125–129 U3-05 prompts individually read and independent derivations saved before opening candidate packages. Author handoffs supplied only commits, files and general model assumptions, no numeric results or answer keys. All16 final records including every option, block, hint, feedback, metadata and figure caption read in full, plus complete SVG XML and native rendering. Never imports authoring. C2-L001/L002/L004/L010 are existing course lessons; primary skill C2-L010 addresses surface forces and energy. Original125-02 incorrectly said J=N/m in prose; author correction15fd7152 reread in ROOT and compared: only initial text block02 and derived binding changed; other15 records, all answers/formulas/assets byte-identical. Final text J=N·m is correct.'
REVIEWED_PACKAGE_SHA256='9388e316261f4a1f872956930a978e8105c2a45456fc92f14aa484e6f56c2e29'
REVIEWED_BINDINGS_SHA256='9c4a47dc149c7d32647ed9f05c07444bb36dfabfe2e20426c49028ed3a48380e'
REVIEWED_CANDIDATES={'AR-u3-alveolar-surfactant-balance-01': 'b467d02aae09600df39a21cfa8e81645dadffc70e5bf4be892e1bec8ab8e19c8', 'AR-u3-alveolar-surfactant-balance-02': '09d19aaf8556405feba21d18bdeba207dab8d88348b847496944c2616ac60bc5', 'AR-u3-alveolar-surfactant-balance-03': '4e5b3ba455318575aa1f972406642205918f71aec031e1f5e34828ecbfd75e4e', 'AR-u3-alveolar-surfactant-balance-04': 'c4e50ddf176dc5444b108cbf366e651a1ae2859772b588d4129fb78cf6bb9f49', 'AR-u3-alveolar-surfactant-balance-05': '658b94506a1bb765f2111525ca5b9fcf917dc04efbf8c3c7913408dcc9bf0caa', 'AR-u3-alveolar-surfactant-balance-06': 'cf5e11da7261819ead580873462208fe93fd8f87f3459c7c7eb23e2819122342', 'AR-u3-alveolar-surfactant-balance-07': '9d26cece1a19c582d554a53d368c37307bf74c35c86f97105b5040a10081587d', 'AR-u3-alveolar-surfactant-balance-08': '433b8276d9a47802e2bd9f964d7f51174c90575971875c6ae9a57102e69a06ef', 'AR-u3-alveolar-surfactant-balance-09': '7146237ae8f78143438b318af48c0d163935e5b9b5c117376e732bf38c412273', 'AR-u3-alveolar-surfactant-balance-10': '5f7fa42aa6c53b1b93260f5cd1d7ef344d696da86c51fa37cdd8cc0ed916ddd5', 'AR-u3-alveolar-surfactant-balance-11': '192b2d75dc2e29e42e53bf091af29072609197e0654f7ccfe5e0079c3d98cd40', 'AR-u3-alveolar-surfactant-balance-12': '51d7a2645d14c8ce83b0461306f5a0f66b8839b58b5a4ad5492d710cd65458b0', 'AR-u3-alveolar-surfactant-balance-13': '0a9959bbc7c1c1f3a214ea5910cbfba8eb521ac9c159a73f37f839ff505678fd', 'AR-u3-alveolar-surfactant-balance-14': 'b6f49e3dd267915f2caf1afcdd67982832f2fce1f2ec7e45e4e614ecc8460cd0', 'AR-u3-alveolar-surfactant-balance-15': '1bca60d8ba68185e66e4dfd251790c0ea78a106c1b66b5b7a2f4c9e44098f8b4', 'AR-u3-alveolar-surfactant-balance-16': 'b0cf429b14ac8656f7b3a240780432cf015714b8d41d9943f9035ede0cc9196f'}
READ_SOURCE_SHA256={'u3-alveolar-surfactant-balance-01': '8a6d5f4aab695d116e2459076f910a107be1f855bfc3fa744060e01575c58a9c', 'u3-alveolar-surfactant-balance-02': '3c5e632a4e34903b5cbd21b2e1731874934c7318c9b410ca6787c00754ab58c9', 'u3-alveolar-surfactant-balance-03': 'c72d13dacbe15609e77d9a955f0db676c361e5f5b90a1805d58bea9f969725a3', 'u3-alveolar-surfactant-balance-04': 'e71d683fa6cd1bf40ac5f33a209df6bcfa3a0dd34bac42a28656a186737ed06d', 'u3-alveolar-surfactant-balance-05': 'ea3a163b1c7f18148db9b1659bade609478199853639295f63bac7015bd51615', 'u3-alveolar-surfactant-balance-06': '8c33c7212b9449e99578ee966f41d446e5461546e4b1ade59a513ff71659a0c4', 'u3-alveolar-surfactant-balance-07': '9c680d27caa9253978fbd94f47b4307ea9bf07e142cf2171bb45c6b5a13fa3db', 'u3-alveolar-surfactant-balance-08': 'c90860296d9710f787e626791c9298b9d062ab76f2c86e5790e865017ef3299e', 'u3-alveolar-surfactant-balance-09': '9e3ec12c9ef7bbdb03f1e005c534d6d7f913038f2bac5330388260418a5a144d', 'u3-alveolar-surfactant-balance-10': 'd66afe1d38d3fbc4d338bdc869989afdfbf0bc858d74d3bc4439eb6939c3af8d', 'u3-alveolar-surfactant-balance-11': 'd3fa4a0b77833fccafed4c1fd24b5314cd053fd384de655eb2defbf980463d96', 'u3-alveolar-surfactant-balance-12': 'e8644642f2909a623006738cf48ada3615e68a03bf4c1a6bdf7552749820e14c', 'u3-alveolar-surfactant-balance-13': 'dc83fd48d03101b17668a4935592b85d0469868bd5f0911d52e528ddbb9d326e', 'u3-alveolar-surfactant-balance-14': '98a81225bfc8721654f1b9c11e3ee97d8e30cbc7076ef3040c4aba582465cff8', 'u3-alveolar-surfactant-balance-15': '35dea95b446e7af3d298d0eef8f40415a72c9fb4f11ff2384bf1ad45bcd5108f', 'u3-alveolar-surfactant-balance-16': '3b09a5c156299b49f717c63cf93c4b7c5ca8c0a5f16a857729277b76e912a63b'}
