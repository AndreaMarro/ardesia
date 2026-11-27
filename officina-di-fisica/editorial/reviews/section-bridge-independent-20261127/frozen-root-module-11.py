"""Independent reviewer of fifty distinct Cric fluid problems; no authoring import."""
import ast
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from fractions import Fraction
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from . import cric_c2_051_100_review_models as model
from . import cric_c2_fluids_review_evidence as evidence
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C2.json'
WANT_UNITS={51: '1',
 52: 'Pa',
 53: 'Pa',
 54: 'm/s',
 55: '1',
 56: '1',
 57: '1',
 58: '1',
 59: 'm/s',
 60: 'Pa',
 61: '1',
 62: 'm/s',
 63: 's⁻¹',
 64: 'Pa·s',
 65: '1',
 66: '1',
 67: '1',
 68: '1',
 69: '1',
 70: '1',
 71: '1',
 72: 'mL/s',
 73: 'Pa·s/m³',
 74: '1',
 75: '1',
 76: 'kPa',
 77: 'Pa·s',
 78: '1',
 79: 'W',
 80: 'm³/s',
 81: 'kPa',
 82: 'kPa·s/mL',
 83: '1',
 84: '1',
 85: 'mL/s',
 86: '1',
 87: 'kPa·s/mL',
 88: 'm³/(Pa·s)',
 89: '1',
 90: '1',
 91: '1',
 92: 'µJ',
 93: 'N',
 94: 'm',
 95: 'Pa',
 96: '1',
 97: 'Pa',
 98: 'mm',
 99: '1',
 100: 'Pa'}
RESPONSE_UNITS={51: '1',
 52: 'Pa',
 53: 'Pa',
 54: 'm/s',
 55: '1',
 56: '1',
 57: '1',
 58: '1',
 59: 'm/s',
 60: 'Pa',
 61: '1',
 62: 'm/s',
 63: 's⁻¹',
 64: 'Pa·s',
 65: '1',
 66: '1',
 67: '1',
 68: '1',
 69: '1',
 70: '1',
 71: '1',
 72: 'mL/s',
 73: 'Pa·s/m³',
 74: '1',
 75: '1',
 76: 'kPa',
 77: 'Pa·s',
 78: '1',
 79: 'mW',
 80: 'm³/s',
 81: 'kPa',
 82: 'kPa·s/mL',
 83: '1',
 84: '1',
 85: 'mL/s',
 86: '1',
 87: 'kPa·s/mL',
 88: 'm³/(Pa·s)',
 89: '1',
 90: '1',
 91: '1',
 92: 'µJ',
 93: 'mN',
 94: 'm',
 95: 'Pa',
 96: '1',
 97: 'Pa',
 98: 'mm',
 99: '1',
 100: 'Pa'}
SI_NAMES={'1': 'dimensionless',
 'N': 'newton',
 'Pa': 'pascal',
 'Pa·s': 'pascal*second',
 'Pa·s/m³': 'pascal*second/meter**3',
 'W': 'watt',
 'kPa': 'kilopascal',
 'kPa·s/mL': 'kilopascal*second/milliliter',
 'm': 'meter',
 'm/s': 'meter/second',
 'mL/s': 'milliliter/second',
 'mN': 'millinewton',
 'mW': 'milliwatt',
 'mm': 'millimeter',
 'm³/(Pa·s)': 'meter**3/(pascal*second)',
 'm³/s': 'meter**3/second',
 's⁻¹': '1/second',
 'µJ': 'microjoule'}
NUMERIC={64, 68, 70, 71, 72, 74, 76, 79, 81, 82, 85, 87, 90, 92, 93, 95, 98, 99, 52, 53, 54, 56, 59, 62, 63}
NO_CALC={65, 66, 67, 69, 73, 75, 77, 78, 80, 83, 84, 86, 88, 89, 91, 94, 96, 97, 100, 51, 55, 57, 58, 61}
CONCEPTUAL={51: 'La velocità aumenta e la pressione statica diminuisce',
 55: 'Dissipazione viscosa di energia meccanica',
 57: 'Punto di ristagno',
 58: 'Una parte dell’energia meccanica si dissipa nei moti reali',
 61: 'Laminare',
 65: 'Zero',
 66: 'Nulla',
 67: 'Alla parete, r=R',
 69: 'Viscosità newtoniana costante nel campo di prova',
 73: 'La resistenza idraulica R_h=Δp/Q',
 75: 'Viene sovrastimata di un fattore 16',
 77: 'La viscosità dinamica η',
 78: 'Che il profilo sia pienamente sviluppato nel tratto di misura',
 80: 'Q=0',
 83: 'Resta invariata',
 84: 'Raddoppia',
 86: 'In parallelo',
 88: 'Conduttanza idraulica',
 89: 'Il secondo, con caduta doppia',
 91: 'La sfera minimizza l’area e quindi l’energia superficiale a volume fissato',
 94: 'Più basso: si ha depressione capillare',
 96: 'La seconda è metà della prima',
 97: 'Nulla',
 100: 'Una sola interfaccia curva dà Δp=2γ/R'}
QUANTITY_UNITS={'Pa':('pressure',sp.Integer(1)),'kPa':('pressure',sp.Integer(1000)),'m/s':('velocity',sp.Integer(1)),'s⁻¹':('rate',sp.Integer(1)),'Pa·s':('viscosity',sp.Integer(1)),'mL/s':('flow',sp.Rational(1,10**6)),'Pa·s/m³':('hydraulic_resistance',sp.Integer(1)),'kPa·s/mL':('hydraulic_resistance',sp.Integer(10**9)),'m³/(Pa·s)':('conductance',sp.Integer(1)),'W':('power',sp.Integer(1)),'mW':('power',sp.Rational(1,1000)),'m³/s':('flow',sp.Integer(1)),'µJ':('energy',sp.Rational(1,10**6)),'N':('force',sp.Integer(1)),'mN':('force',sp.Rational(1,1000)),'m':('length',sp.Integer(1)),'mm':('length',sp.Rational(1,1000)),'1':('pure',sp.Integer(1)),'':('pure',sp.Integer(1))}
def fourth_root_literal(raw):
    # The only added notation is a bounded positive fourth root, optionally reciprocal.
    match=re.fullmatch(r'(1/)?⁴√([1-9][0-9]{0,3})',raw)
    if not match:return codec.exact_literal(raw)
    value=sp.Integer(match[2])**sp.Rational(1,4)
    return 1/value if match[1] else value

def quantity(raw):
    raw=codec.numeric_lexeme(raw).strip().replace('−','-').replace(',','.').replace('μJ','µJ')
    unit=''
    for key in sorted((x for x in QUANTITY_UNITS if x and x!='1'),key=len,reverse=True):
        if raw.endswith(key):unit=key;raw=raw[:-len(key)].strip();break
    value=fourth_root_literal(raw);dimension,scale=QUANTITY_UNITS[unit]
    return sp.simplify(value*scale),dimension

def bernoulli_expression(raw):
    if not isinstance(raw,str)or len(raw)>100:raise ValueError('Bounded Bernoulli expression required')
    if not raw.startswith('p₁−p₂='):raise ValueError('Pressure difference orientation required')
    raw=raw.split('=',1)[1].replace('ρ','rho').replace('v₁','vi').replace('v₂','vf').replace('²','**2').replace('−','-').replace('rho(','rho*(')
    if not re.fullmatch(r'[0-9rhovi f+*/(). \-]+',raw):raise ValueError('Unsupported Bernoulli literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>50:raise ValueError('Bernoulli expression too complex')
    names={n:sp.Symbol(n,positive=True)for n in['rho','vi','vf']}
    def visit(node):
        if isinstance(node,ast.Constant)and type(node.value)is int and 0<=node.value<=10:return sp.Integer(node.value)
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
        raise ValueError('Unsupported Bernoulli AST')
    result=visit(tree.body)
    if result.has(sp.Float,sp.zoo,sp.oo,sp.nan)or result.is_real is not True:raise ValueError('Non-real Bernoulli result')
    return result

def physical_oracle():
    data,_=model.primary_only_derivations()
    assert model.bernoulli_pressure_change(1000,2,1)==1500
    assert model.bernoulli_pressure_change(800,2,2,10,sp.Rational(3,4))==-6000
    assert model.stagnation_speed(60,sp.Rational(6,5))==10
    assert model.area_ratio(1,model.speed_from_pressure_drop(1,1000,1500))==2
    assert model.dynamic_viscosity(sp.Rational(13,10),2)/model.dynamic_viscosity(1,1)==sp.Rational(13,20)
    assert model.radial_gradient_magnitude(1,0,1)==0
    assert model.radial_gradient_magnitude(1,1,1)==2
    assert model.poiseuille_profile(1,sp.Rational(4,5),1)==sp.Rational(9,25)
    assert model.hydraulic_resistance(1,1,2)/model.hydraulic_resistance(1,1,3)==sp.Rational(81,16)
    assert model.parallel_resistance(20,20,20,20)==5
    assert model.series_resistance(2,model.parallel_resistance(6,6))==5
    assert model.unknown_parallel_resistance(3,4)==12
    assert model.film_force(sp.Rational(1,40),sp.Rational(1,25),2)==sp.Rational(1,500)
    assert model.surface_work(sp.Rational(1,20),sp.Rational(3,10**4))==sp.Rational(15,10**6)
    assert model.laplace_spherical_pressure(1,1,2)==2*model.laplace_spherical_pressure(1,1,1)
    assert model.capillary_height(1,1,1,1,-sp.Rational(1,2))<0
    assert model.merge_area_ratio(8)==sp.Rational(1,2)
    assert SI.Quantity(1,'kPa*ml/second').to('milliwatt').magnitude==1
    return data

def inverse_initial_speed(final_speed,rho,drop):
    final_speed,=model.nonnegative(final_speed);rho,=model.positive(rho);drop,=model.exact(drop)
    square=final_speed**2-2*drop/rho
    if square<0:raise ValueError('No nonnegative initial-speed branch')
    return sp.sqrt(square)
def inverse_tube_radius(flow,drop,eta,length):
    flow,drop,eta,length=model.positive(flow,drop,eta,length)
    return (8*eta*length*flow/(sp.pi*drop))**sp.Rational(1,4)
def inverse_surface_tension(work,area):
    work,area=model.positive(work,area);return work/area

def force_ratio(eta,area,speed,gap_a,gap_b):
    eta,area,speed,gap_a,gap_b=model.positive(eta,area,speed,gap_a,gap_b)
    return model.couette_force(eta,area,speed,gap_b)/model.couette_force(eta,area,speed,gap_a)

def accessible_svg(root,names):
    for name in names:
        try:
            svg=ET.fromstring((root/name).read_bytes())
            references=svg.attrib.get('aria-labelledby','').split()
            nodes={element.attrib.get('id'):element for element in svg.iter()if element.attrib.get('id')}
            linked=[nodes[key]for key in references if key in nodes]
            title=[n for n in linked if n.tag.rsplit('}',1)[-1]=='title']
            description=[n for n in linked if n.tag.rsplit('}',1)[-1]=='desc']
            if svg.attrib.get('role')!='img' or len(title)!=1 or len(description)!=1 or not ''.join(title[0].itertext()).strip() or not ''.join(description[0].itertext()).strip():return False
        except (OSError,ET.ParseError):return False
    return True

def verify(package,bindings,config,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1')
    root=Path(asset_root)if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    shared=[]
    if not evidence.READING_COMPLETE:shared.append("Independent final candidate rereading is not complete")
    for module in[codec,model,evidence]:
        if sha(Path(module.__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(module.__file__).name):shared.append('Independent reviewer dependency changed')
    if sha(Path(__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(__file__).name):shared.append('Independent fluids reviewer changed')
    if digest(package)!=config['REVIEWED_PACKAGE_SHA256']:shared.append('Reviewed package edition changed')
    if digest(bindings)!=config['REVIEWED_BINDINGS_SHA256']:shared.append('Reviewed bindings edition changed')
    try:expected=physical_oracle()
    except (AssertionError,ValueError,TypeError,ZeroDivisionError):expected={};shared.append('Independent physical oracle constitutive check failed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,config['REVIEWED_CANDIDATES'],config['EXPECTED_IDS'],root):
        errors.extend(shared);identifier=row['id'];n=int(identifier[-3:]);metadata=config['SOURCE_METADATA'][identifier]
        if assets and not accessible_svg(root,assets):errors.append('Independent accessible SVG title/description or association changed')
        if binding.get('sourceId')!=identifier or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=config['READ_SOURCE_SHA256'][identifier]:errors.append('Independent original Cric source mismatch')
        for key in['id','kind','course','skill','family','difficulty','order','exam','prerequisites']:
            if row.get(key)!=metadata.get(key):errors.append('Original Cric identity/taxonomy changed: '+key)
        if row.get('version')!=metadata['version']+1 or row.get('baseVersion')!=metadata['version']:errors.append('Original Cric revision chain changed')
        if row.get('error',{}).get('target')!=metadata['skill'] or row.get('error',{}).get('category')!=config['REVIEWED_ERROR_CATEGORIES'][identifier]:errors.append('Reviewed pedagogical feedback mapping changed')
        provenance=binding.get('provenance',{})
        if provenance.get('sourceOrigin')!='cric' or provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceVersion')!=metadata['version'] or binding.get('provenanceSha256')!=digest(provenance):errors.append('Independent original Cric provenance changed')
        if row.get('reuse')!=['C6'] or row.get('review')!='DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN':errors.append('Independent DRAFT or existing reuse boundary changed')
        normalized_prompt=''.join(row.get('prompt','').split())
        domains={68:('v_max>0',),70:('A>0','U>0'),75:('Δp>0',)}
        if any(term not in normalized_prompt for term in domains.get(n,())):errors.append('Independent physical zero-denominator domain is not excluded')
        value=row['answer']['value'];want=expected.get(n,sp.nan)
        try:
            if n in NUMERIC:
                dim,scale=QUANTITY_UNITS[WANT_UNITS[n]]
                target=sp.simplify(want*scale)
                if row['answer']['type']=='numeric':
                    got=codec.exact_literal(codec.numeric_lexeme(value));actualunit=row['answer'].get('unit')
                    actualdim,actualscale=QUANTITY_UNITS.get(actualunit,('UNKNOWN',0))
                    if actualunit!=RESPONSE_UNITS[n] or actualdim!=dim or row['answer'].get('tolerance')!=0:errors.append('Independent physical numeric unit or tolerance mismatch')
                    if sp.simplify(got*actualscale-target)!=0:errors.append('Independent physical exact result mismatch')
                elif row['answer']['type']=='choice':
                    got,actualdim=quantity(value)
                    if actualdim!=dim or sp.simplify(got-target)!=0:errors.append('Independent physical exact result or dimension mismatch')
                    matches=[]
                    for option in row['answer']['options']:
                        v,d=quantity(option)
                        if d==dim and sp.simplify(v-target)==0:matches.append(option)
                    if matches!=[value]:errors.append('Independent exact alternatives not unique')
                else:errors.append('Independent numeric task format changed')
            elif n==60:
                want=expected[60];got=bernoulli_expression(value)
                if sp.simplify(got-want)!=0:errors.append('Independent physical Bernoulli energy-difference law mismatch')
                matches=[o for o in row['answer']['options']if sp.simplify(bernoulli_expression(o)-want)==0]
                if matches!=[value]:errors.append('Independent exact alternatives not unique')
            else:
                want=CONCEPTUAL[n]
                if value!=want:errors.append('Independent specific physics conceptual key mismatch')
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError,RecursionError,KeyError):errors.append('Independent exact decoding or dimensional check failed')
        results.append({'id':identifier,'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':{str(k):str(v)for k,v in SI.Unit(SI_NAMES[WANT_UNITS[n]]).dimensionality.items()},'manualArithmetic':evidence.PRIMARY_MANUAL[n],'physicalAssumptions':evidence.ASSUMPTIONS[n],'distractors':evidence.DISTRACTORS[n],'pedagogicalReview':'Lettura individuale di consegna, opzioni, svolgimento, hint e feedback dopo la primaria indipendente. '+evidence.PRIMARY_MANUAL[n],'scientificAssetReview':config['SCIENTIFIC_ASSET_REVIEW']if assets else 'Nessuna figura collegata; testo e formule letti integralmente.','calculationScope':'NO_STUDENT_CALCULATION'if n in NO_CALC else'EXACT_MANUAL_CALCULATION','verificationMode':'EXACT_ORACLE'if n in NUMERIC or n==60 else'AI_CONCEPTUAL','reviewDependencySha256':config['DEPENDENCY_SHA256'].copy(),'methods':['Independent_prompt_first_Fraction_SymPy_constitutive_models','Pint_exact_SI_dimensions','Individual_manual_options_domain_and_feedback_reading','Independent_full_XML_and_native_SVG_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results

def report(package,bindings,config,verifier_path,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,config,asset_root),'verifierSha256':sha(Path(verifier_path).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE','reviewedCandidateCommit':config['CANDIDATE_REF'],'packageSha256':digest(package),'bindingsSha256':digest(bindings),'sourceFirstPrimarySha256':model.PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Tutti i 50 enunciati derivati nella primaria 02612746 e modelli 95659bb4/b6e15c32 prima di qualsiasi candidata C2B. Successivamente tutti i 50 originali completi, candidate e cinque figure XML/native letti. Tre domini trovati e finali riletti prima del freeze. Nessun modulo autore B o primaria B aperti. Nessuna esposizione pre-key nota. UI prodotto e human NOT_RUN.'}}
