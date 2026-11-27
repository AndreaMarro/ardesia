"""Independent Cric mechanics review only; no authoring, ETL or publication."""
import ast
import re
from pathlib import Path
from fractions import Fraction
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from . import cric_c1_051_100_review_models as model
from . import cric_c1_mechanics_review_evidence as evidence
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C1.json'
UNITS={51:'1',52:'m/s²',53:'N',54:'1',55:'m/s²',56:'cm',57:'N/m',58:'1',59:'N',60:'N',61:'J',62:'J',63:'J',64:'J',65:'J',66:'J',67:'W',68:'J',69:'1',70:'m',71:'J',72:'m',73:'J',74:'J',75:'J',76:'m/s',77:'m/s',78:'J',79:'J',80:'N',81:'N·s',82:'1',83:'m/s',84:'m/s',85:'J',86:'J',87:'kg·m/s',88:'kg·m/s',89:'N',90:'N',91:'m',92:'m',93:'N·m',94:'N·m',95:'N',96:'m/s²',97:'m',98:'N·m',99:'N',100:'N·m'}
SI_NAMES={'1':'dimensionless','m/s²':'meter/second**2','N':'newton','cm':'centimeter','N/m':'newton/meter','J':'joule','W':'watt','m':'meter','m/s':'meter/second','N·s':'newton*second','kg·m/s':'kg*meter/second','N·m':'newton*meter'}
NUMERIC={51,52,55,56,59,61,63,64,66,67,69,70,72,73,75,77,79,81,83,84,87,89,91,93,95,96,99}
NO_CALC={53,58,62,68,71,76,78,86,88,90,94,97,98,100}
CONCEPTUAL={53:'Verso destra, ed è attrito statico',54:'Resta uguale',57:'La costante elastica k, in N/m',58:'Attrito dinamico, o cinetico',62:'La tensione è perpendicolare allo spostamento istantaneo',65:'Di 3 K_i; il valore finale è 4 K_i',68:'joule',71:'È nullo',74:'Non cambia',76:'Il modulo della velocità al fondo',78:'Non conservativo: compie lavoro negativo su entrambi i tratti',80:'Ricavare v²=2gh con l’energia, poi usare T−mg=mv²/ℓ',82:'Si dimezza',85:'Quello di massa minore',86:'Elastico',88:'Il sistema formato da entrambe le biglie',90:'La componente x della risultante, costante e positiva',92:'Il braccio b=r sinα, distanza del perno dalla retta d’azione',94:'Risultante nulla e momento non nullo: una coppia di forze',97:'Corpo rigido',98:'Il momento totale resta nullo',100:'Negativo, perché tende a ruotare in senso orario'}
# Exact whitelisted quantity scales; arbitrary candidate unit expressions are never evaluated.
QUANTITY_UNITS={'kg·m/s':('momentum',sp.Integer(1)),'N·s':('momentum',sp.Integer(1)),'m/s²':('acceleration',sp.Integer(1)),'N·m':('energy',sp.Integer(1)),'N/m':('stiffness',sp.Integer(1)),'m/s':('velocity',sp.Integer(1)),'cm':('length',sp.Rational(1,100)),'m':('length',sp.Integer(1)),'N':('force',sp.Integer(1)),'J':('energy',sp.Integer(1)),'W':('power',sp.Integer(1)),'1':('pure',sp.Integer(1)),'':('pure',sp.Integer(1))}

def quantity(raw):
    raw=codec.numeric_lexeme(raw).strip().replace('−','-').replace(',','.')
    unit=''
    for key in sorted((x for x in QUANTITY_UNITS if x and x!='1'),key=len,reverse=True):
        if raw.endswith(key):unit=key;raw=raw[:-len(key)].strip();break
    value=codec.exact_literal(raw)
    dimension,scale=QUANTITY_UNITS[unit]
    return sp.simplify(value*scale),dimension

def symbolic_spring(raw):
    if not isinstance(raw,str)or len(raw)>50:raise ValueError('Bounded spring expression required')
    raw=raw.replace('²','**2').replace('−','-').strip()
    raw=re.sub(r'(?<=[0-9kx)])\s+(?=[kx(])','*',raw)
    if not re.fullmatch(r'[0-9kx+*/(). \-]+',raw):raise ValueError('Unsupported spring expression')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>50:raise ValueError('Spring expression too complex')
    names={n:sp.Symbol(n,positive=True)for n in['k','x']}
    def visit(node):
        if isinstance(node,ast.Constant)and type(node.value)in[int,float]:
            lex=ast.get_source_segment(raw,node)
            if not re.fullmatch(r'\d+(?:\.\d+)?',lex):raise ValueError('Exact decimal lexeme required')
            return sp.Rational(lex)
        if isinstance(node,ast.Name)and node.id in names:return names[node.id]
        if isinstance(node,ast.UnaryOp)and isinstance(node.op,(ast.UAdd,ast.USub)):
            v=visit(node.operand);return v if isinstance(node.op,ast.UAdd)else-v
        if isinstance(node,ast.BinOp):
            a,b=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return a+b
            if isinstance(node.op,ast.Sub):return a-b
            if isinstance(node.op,ast.Mult):return a*b
            if isinstance(node.op,ast.Div)and b!=0:return a/b
            if isinstance(node.op,ast.Pow)and b in[0,1,2]:return a**b
        raise ValueError('Unsupported spring AST')
    result=visit(tree.body)
    if result.has(sp.Float)or result.has(sp.zoo,sp.oo,sp.nan)or result.is_real is not True:raise ValueError('Non-real spring expression')
    return result

def physical_oracle():
    data,_=model.primary_only_derivations()
    data[75]=model.internal_gain(20,7,0)
    k,x,m,g,h,L,p=sp.symbols('k x m g h L p',positive=True)
    assert sp.diff(k*x,x)==k
    assert model.constant_force_work(5,3,90)==0
    assert model.gravity_ratio(4,2)==1
    assert model.kinetic_energy(2,6)/model.kinetic_energy(2,3)==4
    assert model.constant_force_work(2,1,180)*2==-4
    assert sp.simplify(model.bottom_tension(sp.Integer(2),sp.Integer(10),sp.Integer(1),sp.Integer(2))-40)==0
    assert sp.simplify((m*g*(1+2*h/L)-m*g)-m*(2*g*h)/L)==0
    assert model.kinetic_energy(1,2)>model.kinetic_energy(2,1)
    shift,zi,zf=sp.symbols('shift zi zf');assert sp.expand((zf+shift)-(zi+shift))==zf-zi
    rx,fy,ax,ay,fx,tau=sp.symbols('rx fy ax ay fx tau')
    tau_prime=tau-ax*fy+ay*fx;assert tau_prime.subs({tau:0,fx:0,fy:0})==0
    R=sp.Matrix([[0,-1],[1,0]]);v=sp.Matrix([3,4]);assert (R*v).dot(R*v)==v.dot(v)
    assert sp.diff(sp.Symbol('c',positive=True)*sp.Symbol('t'),sp.Symbol('t'))==sp.Symbol('c',positive=True)
    assert SI.Quantity(Fraction(3,10),'newton*second').to('kg*meter/second').magnitude==Fraction(3,10)
    return data

def inverse_support_position(reaction,load,length):
    reaction,load,length=model.positive(reaction,load,length)
    if reaction>=load:raise ValueError('Two strictly positive reactions required')
    return reaction*length/load

def inverse_capture_mass(moving_mass,moving_v,common_v):
    moving_mass,=model.positive(moving_mass);moving_v,common_v=model.exact(moving_v,common_v)
    if common_v==0 or moving_v/common_v<=1:raise ValueError('Positive captured mass and matching velocity branch required')
    return moving_mass*(moving_v/common_v-1)

def inverse_recoil_mass(m1,v1,v2):
    m1,=model.positive(m1);v1,v2=model.exact(v1,v2)
    if v1==0 or v2==0 or v1*v2>=0:raise ValueError('Opposite nonzero recoil velocities required')
    return -m1*v1/v2

def inverse_external_radius(g0,g):
    g0,g=model.positive(g0,g)
    if g>g0:raise ValueError('Exterior branch requires g<=g_surface')
    return sp.sqrt(g0/g)

def verify(package,bindings,config,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1')
    root=Path(asset_root)if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    shared=[]
    if not evidence.READING_COMPLETE:shared.append("Independent final candidate rereading is not complete")
    for module in[codec,model,evidence]:
        if sha(Path(module.__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(module.__file__).name):shared.append('Independent reviewer dependency changed')
    if sha(Path(__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(__file__).name):shared.append('Independent mechanics reviewer changed')
    if digest(package)!=config['REVIEWED_PACKAGE_SHA256']:shared.append('Reviewed package edition changed')
    if digest(bindings)!=config['REVIEWED_BINDINGS_SHA256']:shared.append('Reviewed bindings edition changed')
    try:expected=physical_oracle()
    except (AssertionError,ValueError,TypeError,ZeroDivisionError):expected={};shared.append('Independent physical oracle constitutive check failed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,config['REVIEWED_CANDIDATES'],config['EXPECTED_IDS'],root):
        errors.extend(shared);identifier=row['id'];n=int(identifier[-3:]);metadata=config['SOURCE_METADATA'][identifier]
        if binding.get('sourceId')!=identifier or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=config['READ_SOURCE_SHA256'][identifier]:errors.append('Independent original Cric source mismatch')
        for key in['id','kind','course','skill','family','difficulty','order','exam','prerequisites']:
            if row.get(key)!=metadata.get(key):errors.append('Original Cric identity/taxonomy changed: '+key)
        if row.get('version')!=metadata['version']+1 or row.get('baseVersion')!=metadata['version']:errors.append('Original Cric revision chain changed')
        if row.get('error',{}).get('target')!=metadata['skill'] or row.get('error',{}).get('category')!=config['REVIEWED_ERROR_CATEGORIES'][identifier]:errors.append('Reviewed pedagogical feedback mapping changed')
        provenance=binding.get('provenance',{})
        if provenance.get('sourceOrigin')!='cric' or provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceVersion')!=metadata['version'] or binding.get('provenanceSha256')!=digest(provenance):errors.append('Independent original Cric provenance changed')
        if row.get('reuse')!=['C6'] or row.get('review')!='DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN':errors.append('Independent DRAFT or existing reuse boundary changed')
        value=row['answer']['value'];want=expected.get(n,sp.nan)
        try:
            if n in NUMERIC:
                dim,scale=QUANTITY_UNITS[UNITS[n]]
                if row['answer']['type']=='numeric':
                    got=codec.exact_literal(codec.numeric_lexeme(value));actualdim=QUANTITY_UNITS.get(row['answer'].get('unit'),('UNKNOWN',0))[0]
                    if actualdim!=dim or row['answer'].get('unit')!=UNITS[n]or row['answer'].get('tolerance')!=0:errors.append('Independent physical numeric unit or tolerance mismatch')
                    if sp.simplify(got-want)!=0:errors.append('Independent physical exact result mismatch')
                elif row['answer']['type']=='choice':
                    got,actualdim=quantity(value)
                    if actualdim!=dim or sp.simplify(got-want*scale)!=0:errors.append('Independent physical exact result or dimension mismatch')
                    matches=[]
                    for option in row['answer']['options']:
                        v,d=quantity(option)
                        if d==dim and sp.simplify(v-want*scale)==0:matches.append(option)
                    if matches!=[value]:errors.append('Independent exact alternatives not unique')
                else:errors.append('Independent numeric task format changed')
            elif n==60:
                want=expected.get(60,sp.nan);got=symbolic_spring(value)
                if sp.simplify(got-want)!=0:errors.append('Independent physical parallel-spring law mismatch')
                matches=[o for o in row['answer']['options']if sp.simplify(symbolic_spring(o)-want)==0]
                if matches!=[value]:errors.append('Independent symbolic alternatives not unique')
                if sp.simplify(got.subs(sp.Symbol('x',positive=True),0))!=0:errors.append('Independent zero-deformation boundary violated')
            else:
                want=CONCEPTUAL[n]
                if value!=want:errors.append('Independent specific physics conceptual key mismatch')
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError,RecursionError,KeyError):errors.append('Independent exact decoding or dimensional check failed')
        results.append({'id':identifier,'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':{str(k):str(v)for k,v in SI.Unit(SI_NAMES[UNITS[n]]).dimensionality.items()},'manualArithmetic':evidence.PRIMARY_MANUAL[n],'physicalAssumptions':evidence.ASSUMPTIONS[n],'distractors':evidence.DISTRACTORS[n],'pedagogicalReview':'Lettura individuale di consegna, opzioni, svolgimento, hint e feedback dopo la primaria indipendente. '+evidence.PRIMARY_MANUAL[n],'scientificAssetReview':config['SCIENTIFIC_ASSET_REVIEW']if assets else 'Nessuna figura collegata; testo e formule letti integralmente.','calculationScope':'NO_STUDENT_CALCULATION'if n in NO_CALC else'EXACT_MANUAL_CALCULATION','verificationMode':'EXACT_ORACLE'if n in NUMERIC or n==60 else'AI_CONCEPTUAL','reviewDependencySha256':config['DEPENDENCY_SHA256'].copy(),'methods':['Independent_prompt_first_Fraction_SymPy_constitutive_models','Pint_exact_SI_dimensions','Individual_manual_options_domain_and_feedback_reading','Independent_full_XML_and_native_SVG_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results

def report(package,bindings,config,verifier_path,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,config,asset_root),'verifierSha256':sha(Path(verifier_path).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE','reviewedCandidateCommit':config['CANDIDATE_REF'],'packageSha256':digest(package),'bindingsSha256':digest(bindings),'sourceFirstPrimarySha256':model.PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Tutti50 prompt derivati nella primaria227d4a08 e modelli0a430e35 prima di qualsiasi candidato Cric B. Successivamente tutti50 originali completi, candidati e figure letti; nessun modulo autore o primaria B aperti. Nessuna esposizione pre-key nota. Prodotto UI e human NOT_RUN.'}}
