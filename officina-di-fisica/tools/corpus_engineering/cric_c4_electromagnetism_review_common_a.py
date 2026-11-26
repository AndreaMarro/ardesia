"""Distinct C4 reviewer: immutable prompt-first models, exact SI and node topology."""
import xml.etree.ElementTree as ET
from pathlib import Path
from fractions import Fraction
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from . import cric_c4_electromagnetism_review_models_a as model
from . import cric_c4_electromagnetism_review_evidence_a as evidence
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C4.json'
NUMERIC=set(model.physical_oracle())
NO_CALC=set(range(51,101))-NUMERIC
WANT_UNITS={n:'1'for n in range(51,101)}
WANT_UNITS.update({51:'A',54:'J',55:'Ω',58:'Ω',60:'W',61:'μF',64:'cm²',66:'μJ',68:'μJ',70:'V',71:'μC',74:'μF',76:'μF',78:'V',82:'nC',84:'N',86:'Hz',88:'J',90:'m/s',91:'mWb',94:'Wb/s',96:'V',98:'mC',100:'V'})
WANT_UNITS.update({63:'F',69:'μC',75:'V'})
RESPONSE_UNITS=WANT_UNITS.copy()
R=sp.Rational
QUANTITY_UNITS={'':('pure',sp.Integer(1)),'1':('pure',sp.Integer(1)),'A':('current',sp.Integer(1)),'mA':('current',R(1,1000)),'J':('energy',sp.Integer(1)),'μJ':('energy',R(1,10**6)),'W':('power',sp.Integer(1)),'Ω':('resistance',sp.Integer(1)),'F':('capacitance',sp.Integer(1)),'μF':('capacitance',R(1,10**6)),'pF':('capacitance',R(1,10**12)),'cm²':('area',R(1,10000)),'m²':('area',sp.Integer(1)),'V':('voltage',sp.Integer(1)),'C':('charge',sp.Integer(1)),'μC':('charge',R(1,10**6)),'mC':('charge',R(1,1000)),'nC':('charge',R(1,10**9)),'N':('force',sp.Integer(1)),'Hz':('frequency',sp.Integer(1)),'m/s':('speed',sp.Integer(1)),'Wb':('flux',sp.Integer(1)),'mWb':('flux',R(1,1000)),'Wb/s':('voltage',sp.Integer(1))}
SI_NAMES={'F':'farad','1':'dimensionless','A':'ampere','J':'joule','Ω':'ohm','W':'watt','μF':'microfarad','cm²':'centimeter**2','μJ':'microjoule','V':'volt','μC':'microcoulomb','nC':'nanocoulomb','N':'newton','Hz':'hertz','m/s':'meter/second','mWb':'milliweber','Wb/s':'weber/second','mC':'millicoulomb'}
CONCEPTUAL={52:'Il resistore di valore minore',53:'Nodo',56:'Resta uguale',57:'Effetto Joule',59:'Entrambi i terminali corrispondenti appartengono agli stessi due nodi',62:'Aumenta',63:'Farad',65:'Tensione V sull’asse verticale e carica q sull’asse orizzontale',67:'La differenza di potenziale',69:'7 μC',72:'Quello di capacità minore',73:'La carica elettrica totale',75:'Zero',77:'Parallelo',79:'Si dimezza',81:'Inverte il verso mantenendo il modulo',83:'Antiparallela al campo',85:'Verso il basso nel foglio',87:'Un’elica cilindrica',89:'Quella con carica +2e',92:'Nulla',93:'Lenz',95:'Orario',97:'La corrente di conduzione lungo l’intero anello',99:'Antiorario'}

def quantity(raw):
    raw=codec.numeric_lexeme(raw).strip().replace('−','-').replace(',','.');unit=''
    for key in sorted((u for u in QUANTITY_UNITS if u and u!='1'),key=len,reverse=True):
        if raw.endswith(key):unit=key;raw=raw[:-len(key)].strip();break
    value=codec.exact_literal(raw);value,=model.exact(value);dimension,scale=QUANTITY_UNITS[unit]
    return sp.simplify(value*scale),dimension

def physical_oracle():
    # Constitutive calibrations are recomputed on every call; a function mutation cannot
    # pass by leaving only the packet and dependency bytes unchanged.
    checks=[(model.parallel_resistance(30,60),20),(model.parallel_unknown(4,12),6),(model.capacitor_series(9,R(9,2)),3),(model.series_capacitor_unknown(3,9),R(9,2)),(model.capacitor_energy(5,4)-model.capacitor_energy(5,2),30),(model.sharing_voltage([2,6],[8,4]),5),(model.capacitance_ratio(4,12),R(16,3)),(model.flux(R(3,10),R(1,50),sp.pi/3),R(3,1000)),(model.mean_emf(1,0,R(8,1000),R(8,1000)),-1)]
    assert all(sp.simplify(got-want)==0 for got,want in checks)
    assert model.lorentz_force(-1,[1,0,0],[0,0,-1])==sp.Matrix([0,-1,0])
    assert all(model.source.symbolic_invariants().values())
    return model.physical_oracle()

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
    for module in[codec,model,model.source,evidence]:
        if sha(Path(module.__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(module.__file__).name):shared.append('Independent reviewer dependency changed')
    if sha(Path(__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(__file__).name):shared.append('Independent electromagnetism reviewer changed')
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
        domains={52:('tensionenonnulla',),62:('q>0',),68:('restacollegatoperl’interoprocesso',),71:('inizialmentescarichi',),72:('q>0','isolato','neutro'),75:('resistenzapositiva',),78:('transitoriosiesaurisce','resistivi'),79:('c>0','v>0','resistenzapositiva'),87:('entrambe non nulle'.replace(' ',''),'senzaaltreforze'),90:('nonrelativistica','opposte'),98:('monotonamente','autoinduzionetrascurabile')}
        if any(term not in normalized_prompt.lower() for term in domains.get(n,())):errors.append('Independent electromagnetic domain is not explicit')
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
            else:
                want=CONCEPTUAL[n]
                if value!=want:errors.append('Independent specific physics conceptual key mismatch')
                if row['answer']['type']!='choice' or row['answer']['options'].count(want)!=1:errors.append('Independent specific conceptual alternative not unique')
                if n==63 and sum(o.strip().lower()in['farad','f','c/v','coulomb per volt']for o in row['answer']['options'])!=1:errors.append('Independent exact alternatives not unique')
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError,RecursionError,KeyError):errors.append('Independent exact decoding or dimensional check failed')
        results.append({'id':identifier,'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':{str(k):str(v)for k,v in SI.Unit(SI_NAMES[WANT_UNITS[n]]).dimensionality.items()},'manualArithmetic':evidence.PRIMARY_MANUAL[n],'physicalAssumptions':evidence.ASSUMPTIONS[n],'distractors':evidence.DISTRACTORS[n],'pedagogicalReview':'Lettura individuale di consegna, opzioni, svolgimento, hint e feedback dopo la primaria indipendente. '+evidence.PRIMARY_MANUAL[n],'scientificAssetReview':config['SCIENTIFIC_ASSET_REVIEW']if assets else 'Nessuna figura collegata; testo e formule letti integralmente.','calculationScope':'NO_STUDENT_CALCULATION'if n in NO_CALC else'EXACT_MANUAL_CALCULATION','verificationMode':'EXACT_ORACLE'if n in NUMERIC else'AI_CONCEPTUAL','reviewDependencySha256':config['DEPENDENCY_SHA256'].copy(),'methods':['Independent_prompt_first_Fraction_SymPy_constitutive_models','Pint_exact_SI_dimensions','Individual_manual_options_domain_and_feedback_reading','Independent_full_XML_and_native_SVG_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results

def report(package,bindings,config,verifier_path,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,config,asset_root),'verifierSha256':sha(Path(verifier_path).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE','reviewedCandidateCommit':config['CANDIDATE_REF'],'packageSha256':digest(package),'bindingsSha256':digest(bindings),'sourceFirstPrimarySha256':'e1c568e8028077a8be767b8d73cb00583dbd9d93e66240fe6d428d7184339653','source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Primaria e modello Root487d68fc precedenti alle candidate B; exposure RootQ091 mantenuta e compensazione source-only distinta A db4f4c7e. A ha riletto/risolto tutti50 prompt in83337ef8 prima di aprire il modello Root e le candidate. Boundary esatto e modello eseguiti realmente in2bd7ec24 prima della prima lettura delle candidate. Successivamente tutti50 originali completi, tutti50 candidati e cinque XML/native indipendenti interi letti;18SVG fonte e lezioni reali L06–L10 letti integralmente. UI prodotto e human NOT_RUN.'}}
