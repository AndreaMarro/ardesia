"""Independent C3 first-law, cycle and entropy review; no authoring imports."""
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from fractions import Fraction
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from . import cric_c3_051_100_review_models as model
from . import cric_c3_thermodynamics_review_evidence as evidence
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C3.json'
NUMERIC={51,54,55,58,60,62,65,67,69,71,74,75,76,78,80,81,83,86,88,90,91,94,96,98,100}
NO_CALC=set(range(51,101))-NUMERIC
WANT_UNITS={n:'1'for n in range(51,101)}
WANT_UNITS.update({51:'J',54:'J',55:'J',58:'J',60:'J',62:'K',65:'K',67:'J',71:'J',74:'W',75:'J',76:'kJ',78:'L',80:'J',81:'%',83:'K',86:'W',88:'J',91:'J/K',93:'J/K',94:'J/K',98:'J/K',100:'J/K'})
RESPONSE_UNITS=WANT_UNITS.copy()
QUANTITY_UNITS={'':('pure',sp.Integer(1)),'1':('pure',sp.Integer(1)),'%':('pure',sp.Rational(1,100)),'J':('energy',sp.Integer(1)),'kJ':('energy',sp.Integer(1000)),'mJ':('energy',sp.Rational(1,1000)),'K':('temperature',sp.Integer(1)),'W':('power',sp.Integer(1)),'kW':('power',sp.Integer(1000)),'L':('volume',sp.Rational(1,1000)),'m³':('volume',sp.Integer(1)),'J/K':('entropy',sp.Integer(1)),'kJ/K':('entropy',sp.Integer(1000))}
SI_NAMES={'1':'dimensionless','%':'percent','J':'joule','kJ':'kilojoule','K':'kelvin','W':'watt','L':'liter','J/K':'joule/kelvin'}
CONCEPTUAL={52:'Aumenta per il lavoro ricevuto dall’agitatore',53:'Negativo',56:'No: servono il percorso p–V e gli estremi di volume',57:'Energia interna',59:'L’energia cinetica macroscopica, non l’energia interna dello stesso stato',61:'Aumentano temperatura ed energia interna',63:'Isobara',64:'Può essere quasi statico, ma resta irreversibile per l’attrito',66:'Nulla',68:'L’isoterma',70:'Deve permettere ingresso di calore che compensi il lavoro',72:'Cambia segno e mantiene il modulo',73:'Ciclo termodinamico',77:'Orario',79:'ΔU=0 e ΔS=0',82:'Prelevare calore da una sola sorgente e convertirlo integralmente in lavoro',84:'Adiabatiche',85:'Riceve lavoro dall’esterno: il trasferimento freddo-caldo non è l’unico effetto',87:'B ha rendimento minore di A, che raggiunge il limite di Carnot',89:'Lavoro',92:'ΔS del fluido è zero, mentre l’entropia dell’insieme aumenta',95:'Integrare δQ_rev/T lungo un cammino reversibile immaginario fra gli stessi stati',97:'Microstato',99:'È incompatibile con il secondo principio macroscopico: vanno riesaminati modello o calcolo'}

def log_literal(raw):
    if not isinstance(raw,str) or len(raw)>100:raise ValueError('Bounded exact expression required')
    raw=raw.strip().replace('−','-').replace(',','.')
    # Closed grammar: optional exact coefficient, ln, positive rational argument. No eval or sympify on strings.
    match=re.fullmatch(r'([+-]?(?:[0-9]+(?:[.,][0-9]+)?(?:/[0-9]+)?)?)\s*ln\s*(?:\(([+-]?[0-9]+(?:/[0-9]+)?)\)|([+-]?[0-9]+(?:/[0-9]+)?))',raw)
    if not match:return codec.exact_literal(raw)
    coefficient=match[1]
    coefficient=sp.Integer(-1)if coefficient=='-' else sp.Integer(1)if coefficient in['','+'] else codec.exact_literal(coefficient)
    argument=codec.exact_literal(match[2]or match[3]);argument,=model.positive(argument)
    return coefficient*sp.log(argument)

def quantity(raw):
    raw=codec.numeric_lexeme(raw).strip().replace('−','-').replace(',','.');unit=''
    for key in sorted((u for u in QUANTITY_UNITS if u and u!='1'),key=len,reverse=True):
        if raw.endswith(key):unit=key;raw=raw[:-len(key)].strip();break
    value=log_literal(raw);value,=model.exact(value);dimension,scale=QUANTITY_UNITS[unit]
    return sp.simplify(value*scale),dimension

_ENTROPY_UNITS={'J/K':'joule/kelvin','J K^-1':'joule/kelvin','J K⁻¹':'joule/kelvin','J·K⁻¹':'joule/kelvin','K/J':'kelvin/joule','J':'joule','W/K':'watt/kelvin','N/K':'newton/kelvin'}
def entropy_unit(raw):
    if not isinstance(raw,str)or raw not in _ENTROPY_UNITS:raise ValueError('Reviewed bounded SI unit literal required')
    return SI.Unit(_ENTROPY_UNITS[raw]).dimensionality

def physical_oracle():
    original,_=model.primary_only_derivations()
    # New author preparation is independently recomputed; original Celsius result remains a separate witness.
    assert sp.simplify(original[81]-sp.Rational(100000,3001))==0
    out=dict(original)
    out[81]=100*model.carnot_efficiency(model.celsius_kelvin(sp.Rational(3537,20)),model.celsius_kelvin(sp.Rational(537,20)))
    assert sp.simplify(out[81]-sp.Rational(100,3))==0
    for n in NUMERIC:model.exact(out[n])
    return out

def inverse_pressure(work,initial_volume,final_volume):
    work,=model.exact(work);initial_volume,final_volume=model.positive(initial_volume,final_volume)
    if initial_volume==final_volume:raise ValueError('Nonzero volume interval required')
    pressure=work/(final_volume-initial_volume);model.nonnegative(pressure);return pressure

def inverse_capacity(delta_internal,delta_temperature):
    delta_internal,delta_temperature=model.exact(delta_internal,delta_temperature)
    if delta_temperature==0:raise ValueError('Nonzero temperature change required')
    result=delta_internal/delta_temperature;model.positive(result);return result

def inverse_hot_heat(work,efficiency):
    work,efficiency=model.positive(work,efficiency)
    if efficiency>=1:raise ValueError('Positive-reservoir engine efficiency must be less than1')
    return work/efficiency

def inverse_entropy_heat(entropy_change,temperature):
    entropy_change,=model.exact(entropy_change);temperature,=model.positive(temperature);return entropy_change*temperature

def inverse_entropy_capacity(entropy_change,initial_temperature,final_temperature):
    entropy_change,=model.exact(entropy_change);initial_temperature,final_temperature=model.positive(initial_temperature,final_temperature)
    if initial_temperature==final_temperature:raise ValueError('Different temperatures required for capacity identification')
    capacity=entropy_change/sp.log(final_temperature/initial_temperature);model.positive(capacity);return capacity

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
    if sha(Path(__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(__file__).name):shared.append('Independent thermodynamics reviewer changed')
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
        domains={70:('gasperfettochiuso',),88:('macchinaciclica','soltanto'),99:('interosistemaisolato','macroscopica')}
        if any(term not in normalized_prompt.lower() for term in domains.get(n,())):errors.append('Independent thermodynamic domain is not explicit')
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
            elif n==93:
                want='J/K'
                if row['answer']['type']!='choice' or entropy_unit(value)!=entropy_unit(want):errors.append('Independent entropy SI unit mismatch')
                matches=[o for o in row['answer']['options']if entropy_unit(o)==entropy_unit(want)]
                if matches!=[value]:errors.append('Independent exact alternatives not unique')
            else:
                want=CONCEPTUAL[n]
                if value!=want:errors.append('Independent specific physics conceptual key mismatch')
                if row['answer']['type']!='choice' or row['answer']['options'].count(want)!=1:errors.append('Independent specific conceptual alternative not unique')
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError,RecursionError,KeyError):errors.append('Independent exact decoding or dimensional check failed')
        results.append({'id':identifier,'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':{str(k):str(v)for k,v in SI.Unit(SI_NAMES[WANT_UNITS[n]]).dimensionality.items()},'manualArithmetic':evidence.PRIMARY_MANUAL[n],'physicalAssumptions':evidence.ASSUMPTIONS[n],'distractors':evidence.DISTRACTORS[n],'pedagogicalReview':'Lettura individuale di consegna, opzioni, svolgimento, hint e feedback dopo la primaria indipendente. '+evidence.PRIMARY_MANUAL[n],'scientificAssetReview':config['SCIENTIFIC_ASSET_REVIEW']if assets else 'Nessuna figura collegata; testo e formule letti integralmente.','calculationScope':'NO_STUDENT_CALCULATION'if n in NO_CALC else'EXACT_MANUAL_CALCULATION','verificationMode':'EXACT_ORACLE'if n in NUMERIC or n==93 else'AI_CONCEPTUAL','reviewDependencySha256':config['DEPENDENCY_SHA256'].copy(),'methods':['Independent_prompt_first_Fraction_SymPy_constitutive_models','Pint_exact_SI_dimensions','Individual_manual_options_domain_and_feedback_reading','Independent_full_XML_and_native_SVG_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results

def report(package,bindings,config,verifier_path,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,config,asset_root),'verifierSha256':sha(Path(verifier_path).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE','reviewedCandidateCommit':config['CANDIDATE_REF'],'packageSha256':digest(package),'bindingsSha256':digest(bindings),'sourceFirstPrimarySha256':model.PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Tutti50 enunciati derivati nella primaria93ea8d3c e modello92090ea0/b374cab4 prima delle candidate C3B. Dopo la primaria: tutti50 originali completi, tutti50 candidati e5SVG XML/native interi letti.9SVG fonte letti integralmente XML. Q081 riparametrizzato ricalcolato con lo stesso modello Carnot, preservando il risultato originale. Fix59/64/74 riletti integralmente prima delle firme. Nessun modulo autore B o primaria B aperti; nessuna esposizione pre-key nota. UI prodotto e human NOT_RUN.'}}
