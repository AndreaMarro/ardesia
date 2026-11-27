"""Independent third protected C6 exam: existing identity boundary plus source-first physics."""
from pathlib import Path
from fractions import Fraction
import xml.etree.ElementTree as ET
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from . import cric_c6_exam03_prompt_only_models_a as model
from . import cric_c6_exam03_review_evidence_a as evidence
SOURCE_REF=model.SOURCE_REF
SOURCE_PATH=model.SOURCE_PATH
SI=pint.UnitRegistry(non_int_type=Fraction)
R=sp.Rational
NUMERIC={76,77,78,79,80,82,83,85,86,88,89,90,91,93,95}
UNITS={76: 'm³', 77: '1', 78: 'Pa', 79: '°', 80: 'cm', 82: 'μC', 83: '%', 85: 'N', 86: 'J', 88: '1', 89: '%', 90: 'N', 91: 'V', 93: 'J', 95: 'A'}
UNIT_TABLE={'':('pure',sp.Integer(1),sp.Integer(0)),'m':('length',sp.Integer(1),sp.Integer(0)),'cm':('length',R(1,100),sp.Integer(0)),'m/s':('speed',sp.Integer(1),sp.Integer(0)),'cm/s':('speed',R(1,100),sp.Integer(0)),'N':('force',sp.Integer(1),sp.Integer(0)),'J':('energy',sp.Integer(1),sp.Integer(0)),'kJ':('energy',sp.Integer(1000),sp.Integer(0)),'Ω':('resistance',sp.Integer(1),sp.Integer(0)),'kΩ':('resistance',sp.Integer(1000),sp.Integer(0)),'h':('time',sp.Integer(3600),sp.Integer(0)),'s':('time',sp.Integer(1),sp.Integer(0)),'V':('voltage',sp.Integer(1),sp.Integer(0)),'mV':('voltage',R(1,1000),sp.Integer(0)),'%':('pure',R(1,100),sp.Integer(0)),'N·s':('momentum',sp.Integer(1),sp.Integer(0)),'kg·m/s':('momentum',sp.Integer(1),sp.Integer(0)),'°C':('temperature',sp.Integer(1),R(27315,100)),'K':('temperature',sp.Integer(1),sp.Integer(0))}
UNIT_TABLE.update({'1':('pure',sp.Integer(1),sp.Integer(0)),'m³':('volume',sp.Integer(1),sp.Integer(0)),'cm³':('volume',R(1,10**6),sp.Integer(0)),'mL':('volume',R(1,10**6),sp.Integer(0)),'Pa':('pressure',sp.Integer(1),sp.Integer(0)),'kPa':('pressure',sp.Integer(1000),sp.Integer(0)),'°':('angle',sp.pi/180,sp.Integer(0)),'rad':('angle',sp.Integer(1),sp.Integer(0)),'C':('charge',sp.Integer(1),sp.Integer(0)),'μC':('charge',R(1,10**6),sp.Integer(0)),'mC':('charge',R(1,1000),sp.Integer(0)),'A':('current',sp.Integer(1),sp.Integer(0)),'mA':('current',R(1,1000),sp.Integer(0))})
SI_NAMES={'m³': 'meter**3', '1': 'dimensionless', 'Pa': 'pascal', '°': 'degree', 'cm': 'centimeter', 'μC': 'microcoulomb', '%': 'dimensionless', 'N': 'newton', 'J': 'joule', 'V': 'volt', 'A': 'ampere'}
DIMENSIONS={n:{str(k):str(v)for k,v in SI.Unit(SI_NAMES[UNITS[n]]).dimensionality.items()}for n in NUMERIC}
DOMAINS={75: ('area di faccia positiva', 'conducibilità positiva e costante', 'differenza positiva', 'stazionaria'), 77: ('positive', 'effetti di bordo'), 78: ('verticale', 'più basso'), 79: ('perpendicolari', 'piano della sezione'), 80: ('massa trascurabile',), 81: ('quantità fissata', 'positiva costante', 'unico lavoro', 'positivo se svolto dal gas'), 82: ('inizialmente scarichi', 'neutro e isolato'), 83: ('equilibrio', 'solo peso e spinta'), 84: ('partono insieme', 'stesso cammino nel vuoto'), 85: ('senza ruotare', 'fermi rispetto alla cabina'), 86: ('condensa interamente', 'temperatura di transizione', 'modulo'), 87: ('massa positiva', 'carica positiva', 'da ferma', 'non nullo', 'non relativistico'), 88: ('positiva', 'singola interfaccia'), 89: ('positiva', 'riflessioni multiple'), 90: ('resta fermo', 'unica spinta'), 91: ('ciascuna', 'media'), 92: ('abbastanza lungo', 'minore di 90°', 'equilibrio'), 94: ('si assume', 'consentiti'), 95: ('rami identici', 'regime stazionario'), 101: ('k>0', 'zero di energia'), 104: ('carica positiva su un’armatura', 'potenziale positiva')}
def normalized(text):return ''.join(text.lower().replace('’',"'").split())
def quantity(raw):
    text=codec.numeric_lexeme(raw).strip().replace('−','-').replace(',','.');unit=''
    for key in sorted((u for u in UNIT_TABLE if u and u!='1'),key=len,reverse=True):
        if text.endswith(key):unit=key;text=text[:-len(key)].strip();break
    value=codec.exact_literal(text);value,=model.exact(value);dim,scale,offset=UNIT_TABLE[unit]
    return sp.simplify(value*scale+offset),dim

def physical_oracle():
    computed=model.quantitative();frozen={76:R(1,4000),77:R(3,2),78:400,79:180,80:R(3,10),82:24,83:25,85:72,86:8000,88:3,89:49,90:3,91:R(3,5),93:-10,95:0}
    assert set(computed)==set(frozen)
    for n,value in frozen.items():assert sp.simplify(computed[n][0]-value)==0,('Source-first model changed',n)
    assert all(model.symbolic_checks().values())
    assert model.conduction_ratio(1,1,2,1,2)==R(1,2)
    direction=model.double_reflected_direction(3,-4);assert direction==sp.Matrix([-3,4])
    values={n:computed[n][0]for n in NUMERIC};values[80]=100*values[80]
    return values

def accessible_svg(root,names):
    for name in names:
        try:
            svg=ET.fromstring((root/name).read_bytes());nodes={e.attrib.get('id'):e for e in svg.iter()if e.attrib.get('id')};linked=[nodes[x]for x in svg.attrib.get('aria-labelledby','').split()if x in nodes]
            if svg.attrib.get('role')!='img':return False
            for tag in ['title','desc']:
                selected=[e for e in linked if e.tag.rsplit('}',1)[-1]==tag]
                if len(selected)!=1 or not ''.join(selected[0].itertext()).strip():return False
        except (OSError,ET.ParseError):return False
    return True

def verify(package,bindings,config,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1')
    root=Path(asset_root)if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets';shared=[]
    if not evidence.READING_COMPLETE:shared.append('Independent final reading incomplete')
    for module in [codec,model,evidence]:
        if sha(Path(module.__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(module.__file__).name):shared.append('Independent reviewer dependency changed')
    if sha(Path(__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(__file__).name):shared.append('Independent reviewer common changed')
    if digest(package)!=config['REVIEWED_PACKAGE_SHA256']or digest(bindings)!=config['REVIEWED_BINDINGS_SHA256']:shared.append('Reviewed package or binding edition changed')
    try:expected=physical_oracle()
    except (ValueError,AssertionError,TypeError,ZeroDivisionError):expected={};shared.append('Independent physical constitutive oracle failed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,config['REVIEWED_CANDIDATES'],config['EXPECTED_IDS'],root):
        errors.extend(shared);identifier=row['id'];n=int(identifier[-3:]);metadata=config['SOURCE_METADATA'][identifier]
        if assets and not accessible_svg(root,assets):errors.append('Independent accessible SVG association/title/description failed')
        if binding.get('sourceId')!=identifier or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=config['READ_SOURCE_SHA256'][identifier]:errors.append('Independent original source mismatch')
        for key in ['id','kind','course','skill','family','difficulty','order','exam','prerequisites','section']:
            if digest(row.get(key))!=digest(metadata.get(key)):errors.append('Independent original identity/taxonomy changed: '+key)
        if type(row.get('version'))is not int or type(row.get('baseVersion'))is not int or row.get('version')!=metadata['version']+1 or row.get('baseVersion')!=metadata['version']:errors.append('Independent original version chain changed')
        if row.get('error',{}).get('target')!=metadata['skill']or row.get('error',{}).get('category')!=config['REVIEWED_ERROR_CATEGORIES'][identifier]:errors.append('Independent feedback mapping changed')
        prov=binding.get('provenance',{})
        if prov.get('sourceOrigin')!='cric'or prov.get('sourcePath')!=SOURCE_PATH or prov.get('sourceVersion')!=metadata['version']or binding.get('provenanceSha256')!=digest(prov):errors.append('Independent source provenance changed')
        if row.get('reuse')!=['C6']or row.get('review')!='DRAFT; soluzione d’autore; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN':errors.append('Independent DRAFT/reuse boundary changed')
        if any(normalized(t)not in normalized(row['prompt'])for t in DOMAINS.get(n,())):errors.append('Independent physical domain not explicit')
        value=row['answer']['value'];want=expected.get(n,'')
        try:
            if n in NUMERIC:
                unit=UNITS[n];dim,scale,offset=UNIT_TABLE[unit];target=sp.simplify(want*scale+offset)
                if row['answer']['type']=='numeric':
                    got=codec.exact_literal(codec.numeric_lexeme(value));model.exact(got)
                    if row['answer'].get('unit')!=unit or row['answer'].get('tolerance')!=0:errors.append('Independent physical unit or tolerance mismatch')
                    if sp.simplify(got*scale+offset-target)!=0:errors.append('Independent physical exact result mismatch')
                elif row['answer']['type']=='choice':
                    matches=[o for o in row['answer']['options']if quantity(o)==(target,dim)]
                    if matches!=[value]:errors.append('Independent exact quantity alternatives not unique or wrong key')
                else:errors.append('Independent physical numeric format changed')
            else:
                want=evidence.CONCEPTUAL[n]
                if value!=want or row['answer']['type']!='choice'or row['answer']['options'].count(want)!=1:errors.append('Independent specific physics conceptual key mismatch')
                if n==75 and model.conduction_ratio(1,1,2,1,2)!=R(1,2):errors.append('Independent physical thermal ratio failed')
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError,RecursionError,KeyError):errors.append('Independent exact decoding or dimension failed')
        results.append({'id':identifier,'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':DIMENSIONS.get(n,{}),'manualArithmetic':evidence.PRIMARY_MANUAL[n],'physicalAssumptions':evidence.ASSUMPTIONS[n],'distractors':evidence.DISTRACTORS[n],'pedagogicalReview':'All original and final candidate fields/options/hints/error individually read against frozen manual derivation. '+evidence.PRIMARY_MANUAL[n],'scientificAssetReview':config['SCIENTIFIC_ASSET_REVIEW']if assets else'No linked candidate figure; complete prose and formulas read.','calculationScope':'EXACT_MANUAL_CALCULATION'if n in NUMERIC|{75,94}else'NO_STUDENT_CALCULATION','verificationMode':'EXACT_ORACLE'if n in NUMERIC else'AI_CONCEPTUAL','reviewDependencySha256':config['DEPENDENCY_SHA256'].copy(),'methods':['Immutable_prekey_individual_prompt_models','SymPy_exact_signed_constitutive_checks','Pint_Fraction_dimensions','Individual_domain_options_feedback_review','Independent_whole_native_and_XML_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results

def report(package,bindings,config,path,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,config,asset_root),'verifierSha256':sha(Path(path).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE','reviewedCandidateCommit':config['CANDIDATE_REF'],'packageSha256':digest(package),'bindingsSha256':digest(bindings),'sourceFirstPrimarySha256':'d6a42d030f8e6d264bfa6f6373e3fa43cdbf74afc0f3291d3846fba504a0ea54','source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Independent prompt-only primary and exact/Pint/Hypothesis model frozen before all B candidates; later every original/final record and new whole independent SVG PNG read. Q089 percent unit and prose spacing author corrections reread before final freeze. No product UI or human approval.'}}
