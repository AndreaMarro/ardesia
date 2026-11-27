"""Independent first protected C6 exam: existing identity boundary plus source-first physics."""
from pathlib import Path
from fractions import Fraction
import xml.etree.ElementTree as ET
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from . import cric_c6_exam01_prompt_only_models_a as model
from . import cric_c6_exam01_review_evidence_a as evidence
SOURCE_REF=model.SOURCE_REF
SOURCE_PATH=model.SOURCE_PATH
SI=pint.UnitRegistry(non_int_type=Fraction)
R=sp.Rational
NUMERIC={13,15,18,20,22,23,26,27,28,32,33}
UNITS={13:'m/s',15:'J',18:'N',20:'Ω',22:'h',23:'m/s',26:'V',27:'N',28:'%',32:'N·s',33:'°C'}
UNIT_TABLE={'':('pure',sp.Integer(1),sp.Integer(0)),'m':('length',sp.Integer(1),sp.Integer(0)),'cm':('length',R(1,100),sp.Integer(0)),'m/s':('speed',sp.Integer(1),sp.Integer(0)),'cm/s':('speed',R(1,100),sp.Integer(0)),'N':('force',sp.Integer(1),sp.Integer(0)),'J':('energy',sp.Integer(1),sp.Integer(0)),'kJ':('energy',sp.Integer(1000),sp.Integer(0)),'Ω':('resistance',sp.Integer(1),sp.Integer(0)),'kΩ':('resistance',sp.Integer(1000),sp.Integer(0)),'h':('time',sp.Integer(3600),sp.Integer(0)),'s':('time',sp.Integer(1),sp.Integer(0)),'V':('voltage',sp.Integer(1),sp.Integer(0)),'mV':('voltage',R(1,1000),sp.Integer(0)),'%':('pure',R(1,100),sp.Integer(0)),'N·s':('momentum',sp.Integer(1),sp.Integer(0)),'kg·m/s':('momentum',sp.Integer(1),sp.Integer(0)),'°C':('temperature',sp.Integer(1),R(27315,100)),'K':('temperature',sp.Integer(1),sp.Integer(0))}
SI_NAMES={'m/s':'meter/second','J':'joule','N':'newton','Ω':'ohm','h':'hour','V':'volt','%':'dimensionless','N·s':'newton*second','°C':'kelvin'}
DIMENSIONS={n:{str(k):str(v)for k,v in SI.Unit(SI_NAMES[UNITS[n]]).dimensionality.items()}for n in NUMERIC}
DOMAINS={14:('ferma','stessa atmosfera'),16:('ΔV=+3 V','elettrostatico'),17:('uguali ampiezze non nulle','stessa polarizzazione'),19:('fissato sotto','fermo'),21:('pura','equilibrio','pressione costante','coesistono'),22:('singola specie','senza produzione'),24:('positiva e costante','in parallelo'),25:('fissa e lineare','trasmessa'),26:('interamente','uniforme e costante','orientazione restano fisse'),27:('statico','perpendicolare'),28:('reversibile','500 K','300 K'),29:('stazionario','incomprimibile','orizzontale','senza perdite','lavoro d’albero'),30:('carica non nulla','isolato','raddoppia'),33:('stessa capacità termica totale positiva e costante','isolati','senza cambiamenti di fase'),34:('disgiunti','senza trasformazioni'),39:('sola interfaccia','equilibrio'),42:('positiva non perturbante',)}
def normalized(text):return ''.join(text.lower().replace('’',"'").split())
def quantity(raw):
    text=codec.numeric_lexeme(raw).strip().replace('−','-').replace(',','.');unit=''
    for key in sorted((u for u in UNIT_TABLE if u),key=len,reverse=True):
        if text.endswith(key):unit=key;text=text[:-len(key)].strip();break
    value=codec.exact_literal(text);value,=model.exact(value);dim,scale,offset=UNIT_TABLE[unit]
    return sp.simplify(value*scale+offset),dim

def physical_oracle():
    computed=model.quantitative();frozen={13:2,15:85,18:13,19:-3,20:3,22:5,23:6,27:180,28:40,32:3,33:30}
    assert set(computed)==set(frozen)
    for n,value in frozen.items():assert sp.simplify(computed[n][0]-value)==0,('Source-first model changed',n)
    assert all(model.symbolic_checks().values())
    # Uniform static B and rigid translation: integral(v cross B)·dl=0 on closed loop.
    a,b,c=sp.symbols('a b c',real=True);constant=sp.Matrix([a,b,c]);closed=sp.Matrix([1,0,0])+sp.Matrix([0,2,0])+sp.Matrix([-1,0,0])+sp.Matrix([0,-2,0]);assert constant.dot(closed)==0
    return {n:computed[n][0]for n in NUMERIC if n!=26}|{26:sp.Integer(0)}

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
            elif n==17:
                def minimum(option):
                    distance,dim=quantity(option)
                    if dim!='length'or distance<0:raise ValueError('Nonnegative distance required')
                    phase=sp.simplify(2*sp.pi*distance/R(3,5));return sp.simplify(sp.cos(phase)+1)==0
                matches=[o for o in row['answer']['options']if minimum(o)]
                if row['answer']['type']!='choice'or matches!=[value]:errors.append('Independent destructive phase alternatives not unique or wrong key')
                want='Delta s=(n+1/2)*3/5 m; all five exact alternatives evaluated'
            else:
                want=evidence.CONCEPTUAL[n]
                if value!=want or row['answer']['type']!='choice'or row['answer']['options'].count(want)!=1:errors.append('Independent specific physics conceptual key mismatch')
                if n==19 and model.tether_upward_force(9,6)!=-3:errors.append('Independent signed tether balance failed')
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError,RecursionError,KeyError):errors.append('Independent exact decoding or dimension failed')
        results.append({'id':identifier,'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':DIMENSIONS.get(n,{}),'manualArithmetic':evidence.PRIMARY_MANUAL[n],'physicalAssumptions':evidence.ASSUMPTIONS[n],'distractors':evidence.DISTRACTORS[n],'pedagogicalReview':'All original and final candidate fields/options/hints/error individually read against frozen manual derivation. '+evidence.PRIMARY_MANUAL[n],'scientificAssetReview':config['SCIENTIFIC_ASSET_REVIEW']if assets else'No linked candidate figure; complete prose and formulas read.','calculationScope':'EXACT_MANUAL_CALCULATION'if n in NUMERIC|{17,19}else'NO_STUDENT_CALCULATION','verificationMode':'EXACT_ORACLE'if n in NUMERIC|{17}else'AI_CONCEPTUAL','reviewDependencySha256':config['DEPENDENCY_SHA256'].copy(),'methods':['Immutable_prekey_individual_prompt_models','SymPy_exact_signed_constitutive_checks','Pint_Fraction_dimensions','Individual_domain_options_feedback_review','Independent_whole_native_and_XML_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results

def report(package,bindings,config,path,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,config,asset_root),'verifierSha256':sha(Path(path).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE','reviewedCandidateCommit':config['CANDIDATE_REF'],'packageSha256':digest(package),'bindingsSha256':digest(bindings),'sourceFirstPrimarySha256':'f9c70c0892ad1f2eef426c7eb6476561ff1763398f0c9939aa0e36baf1bfdba8','source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Independent prompt-only primary and exact/Pint/Hypothesis model frozen before all B candidates; later every original/final record and new whole independent SVG PNG read. Q029 explicit no shaft-work author correction reread before final freeze. No product UI or human approval.'}}
