"""Distinct C5 reviewer: source-first wave, nuclear, ray and lens models with exact SI."""
import xml.etree.ElementTree as ET
from pathlib import Path
from fractions import Fraction
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from . import cric_c5_radiation_optics_review_models_a as model
from . import cric_c5_radiation_optics_review_evidence_a as evidence
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C5.json'
NUMERIC=set(model.physical_oracle())-{62,80}
NO_CALC=set(range(51,101))-NUMERIC-{62}
WANT_UNITS={n:'1'for n in range(51,101)}
WANT_UNITS.update({52:'m',57:'m',64:'%',65:'cm⁻¹',66:'%',68:'mW',72:'neutroni',73:'protoni',75:'h',76:'kBq',77:'%',79:'Bq',81:'°',87:'°',89:'°',90:'°',91:'cm',94:'cm',98:'cm',62:'nm'})
RESPONSE_UNITS=WANT_UNITS.copy()
R=sp.Rational
QUANTITY_UNITS={'':('pure',sp.Integer(1)),'1':('pure',sp.Integer(1)),'m':('length',sp.Integer(1)),'cm':('length',R(1,100)),'mm':('length',R(1,1000)),'nm':('length',R(1,10**9)),'%':('pure',R(1,100)),'cm⁻¹':('inverse_length',sp.Integer(100)),'m⁻¹':('inverse_length',sp.Integer(1)),'W':('power',sp.Integer(1)),'mW':('power',R(1,1000)),'μW':('power',R(1,10**6)),'neutroni':('count',sp.Integer(1)),'protoni':('count',sp.Integer(1)),'h':('time',sp.Integer(3600)),'s':('time',sp.Integer(1)),'Bq':('activity',sp.Integer(1)),'kBq':('activity',sp.Integer(1000)),'°':('angle',sp.pi/180),'rad':('angle',sp.Integer(1))}
SI_NAMES={'1':'dimensionless','m':'meter','cm':'centimeter','nm':'nanometer','%':'percent','cm⁻¹':'1/centimeter','mW':'milliwatt','neutroni':'dimensionless','protoni':'dimensionless','h':'hour','kBq':'kilobecquerel','Bq':'becquerel','°':'degree'}
CONCEPTUAL={51:'Un impulso luminoso',53:'Inverte anch’esso il verso, mantenendo la relazione di fase',54:'Infrarosso',55:'Microonde, visibile, raggi X',58:'Perpendicolari',60:'La lunghezza d’onda nel vuoto',61:'Si dimezza',63:'Planck',69:'Le due componenti si attenuano in proporzioni diverse e cambia il loro peso relativo',70:'L’energia di un singolo fotone',71:'Uguale numero di protoni e diverso numero di neutroni',74:'Gamma',78:'L’esito è compatibile con una probabilità di sopravvivenza pari a un mezzo',80:'Il primo contiene metà dei nuclei del secondo',82:'Normale',83:'Direzione invariata e velocità di fase minore',86:'Parallelo all’incidente, in generale spostato lateralmente',88:'Dal vetro n=1,50 all’acqua n=1,33',92:'Paralleli fra loro, senza un’intersezione immagine a distanza finita',93:'Negativa',96:'Lungo la stessa retta',97:'L’intera freccia meno luminosa',99:'Deve aumentare progressivamente',100:'Convergente'}

def quantity(raw):
    raw=codec.numeric_lexeme(raw).strip().replace('−','-').replace(',','.');unit=''
    for key in sorted((u for u in QUANTITY_UNITS if u and u!='1'),key=len,reverse=True):
        if raw.endswith(key):unit=key;raw=raw[:-len(key)].strip();break
    value=codec.exact_literal(raw);value,=model.exact(value);dimension,scale=QUANTITY_UNITS[unit]
    return sp.simplify(value*scale),dimension

def physical_oracle():
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
    if sha(Path(__file__).read_bytes())!=config['DEPENDENCY_SHA256'].get(Path(__file__).name):shared.append('Independent radiation_optics reviewer changed')
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
        domains={53:('non nulli',),56:('E₀>0',),60:('inizialmente positiva','stessa area positiva'),61:('stessa potenza positiva','anch’essa positiva'),62:('strettamente maggiore',),65:('I₀>0',),69:('intensità iniziali positive','positivi ma diversi'),80:('stessa attività positiva','costante di decadimento positiva'),83:('interfaccia ferma','porzione trasmessa'),86:('facce parallele','direttamente trasmesso'),87:('reciproci','interfaccia ferma'),89:('vanno rispettivamente alla sorgente e al ricevitore',),91:('parassiale','stesso mezzo'),92:('singolo punto','parassiale'),96:('parassiale','stesso mezzo'),97:('ogni punto','parte rimasta libera'),98:('immagine reale','m=−2'),99:('p>f',)}
        domains={k:tuple(''.join(t.lower().split())for t in v)for k,v in domains.items()}
        if any(term not in normalized_prompt.lower() for term in domains.get(n,())):errors.append('Independent optical domain is not explicit')
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
            elif n==62:
                import re
                threshold=want
                def qualifies(option):
                    match=re.fullmatch(r'λ₀=([0-9]+(?:[,.][0-9]+)?) nm',option)
                    if not match:raise ValueError('Exact wavelength alternative required')
                    wavelength=codec.exact_literal(match.group(1).replace(',','.'));model.positive(wavelength)
                    return wavelength<threshold
                qualifying=[o for o in row['answer']['options']if qualifies(o)]
                if row['answer']['type']!='choice' or qualifying!=[value]:errors.append('Independent physical strict-threshold alternatives not unique or key mismatch')
                want='lambda<'+str(threshold)+' nm; unique choice evaluated from all exact alternatives'
            else:
                want=CONCEPTUAL[n]
                if value!=want:errors.append('Independent specific physics conceptual key mismatch')
                if row['answer']['type']!='choice' or row['answer']['options'].count(want)!=1:errors.append('Independent specific conceptual alternative not unique')
                if n==61 and model.photon_rate_ratio(2)!=sp.Rational(1,2):errors.append('Independent specific physics photon-rate ratio failed')
                if n==80 and model.equal_activity_population_ratio(2,1)!=sp.Rational(1,2):errors.append('Independent specific physics equal-activity ratio failed')
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError,RecursionError,KeyError):errors.append('Independent exact decoding or dimensional check failed')
        results.append({'id':identifier,'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':{str(k):str(v)for k,v in SI.Unit(SI_NAMES[WANT_UNITS[n]]).dimensionality.items()},'manualArithmetic':evidence.PRIMARY_MANUAL[n],'physicalAssumptions':evidence.ASSUMPTIONS[n],'distractors':evidence.DISTRACTORS[n],'pedagogicalReview':'Lettura individuale di consegna, opzioni, svolgimento, hint e feedback dopo la primaria indipendente. '+evidence.PRIMARY_MANUAL[n],'scientificAssetReview':config['SCIENTIFIC_ASSET_REVIEW']if assets else 'Nessuna figura collegata; testo e formule letti integralmente.','calculationScope':'NO_STUDENT_CALCULATION'if n in NO_CALC else'EXACT_MANUAL_CALCULATION','verificationMode':'EXACT_ORACLE'if n in NUMERIC|{62} else'AI_CONCEPTUAL','reviewDependencySha256':config['DEPENDENCY_SHA256'].copy(),'methods':['Independent_prompt_first_Fraction_SymPy_constitutive_models','Pint_exact_SI_dimensions','Individual_manual_options_domain_and_feedback_reading','Independent_full_XML_and_native_SVG_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results

def report(package,bindings,config,verifier_path,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,config,asset_root),'verifierSha256':sha(Path(verifier_path).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE','reviewedCandidateCommit':config['CANDIDATE_REF'],'packageSha256':digest(package),'bindingsSha256':digest(bindings),'sourceFirstPrimarySha256':'4271f78cf4be74ac64013158d017529b63d8953e38ab27e2f6deff7e0f80efa4','source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Root primary/model d664c30a source-only before B candidates. A reread all50 source prompts, derived independent finite/exact models and actually ran120Hyp in2f393a63 before first B candidate opening. Then all50 originals/candidates and lessonsL06–L10 read in full;8sourceSVG wholeXML plus5new independent full nativePNG read. Only Q094 isolated reciprocal-unit formula corrected by author6cd8bd28, reread with strictdiff; no candidate edited by reviewer. UI product and human NOT_RUN.'}}
