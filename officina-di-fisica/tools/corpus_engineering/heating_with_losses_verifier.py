"""Independent source-first review of heating with constant thermal loss.

No authoring import. Edition pins are frozen only after the final text and full
figure reading; the conservation oracle was saved before candidate keys.
"""
import ast
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

import pint
import sympy as sp

from . import heating_with_losses_oracle as physics
from .pipeline import digest, git_bytes, sha
from .review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
FAMILY='heating-with-losses'
BATCH=FAMILY+'-168'
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-03.json'
SOURCE_FILE_SHA256='417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b'
PRIMARY_PATH='editorial/reviews/heating-with-losses-168-primary-source-only-20261125.md'
PRIMARY_SHA256='3d20a03b3a949bc28bc89abd1a0ff0b239708de59d71b403880d75160776b4e4'
ASSET_NAME='heating-with-losses-progressive.svg'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
SI=pint.UnitRegistry(non_int_type=Fraction)

# Final independent reading after textual fixes13/14, physical labels and
# nine origin-label corrections; the ETL and importer never refresh these pins.
REVIEWED_PACKAGE_SHA256='278e5fdea6ba690f22eee6cf8e81d9b472466c37e462d8219cd3da04bad4df27'
REVIEWED_BINDINGS_SHA256='cb8394b8d98ffa2166230aff1af8223d950ec5411d1c7e4bff448dbb83071395'
REVIEWED_ASSET_SHA256='bc48cf2f33f683ea7b55b2964b809fae2653ae7ffea9ddd0474045b7ddd4330e'
REVIEWED_CANDIDATES={'AR-u5-heating-with-losses-01': '19adf8bddb15955b8100c4c87f018e6cfe2b1e7338c955be146020f4c453edfc', 'AR-u5-heating-with-losses-02': '1ceacdcd82656986f3b1632e241e371475117f664a65602dfbb4870b20c3e781', 'AR-u5-heating-with-losses-03': 'f897fd8631ebe56488fa9ed710860cbc46bf388f3dee7da38709287248657285', 'AR-u5-heating-with-losses-04': '701282b115e7dcc0a0c125d0c6094ed9fee947d99f955e0527ee3c24e128d763', 'AR-u5-heating-with-losses-05': '662c5d28591aa21c44104a99023e3d921fdd963bb77848186ca299bf5e1e85da', 'AR-u5-heating-with-losses-06': '7bbb85e0aa1bd927a7814bbac758e0efa90e63112fc700c3b7a8df98a634efb6', 'AR-u5-heating-with-losses-07': '854c6e68d70a82f53056aaf5fd5416d17814d4b940d79bc5951d47bd06344be3', 'AR-u5-heating-with-losses-08': '00508cb8f87d1286b62c4296ac23920f5e92254b40bf244cf22d03ee3b10f738', 'AR-u5-heating-with-losses-09': '3b7ffc12ea274e2e4e319ee2316e2bfd2abc38af4fb3ecb4200c680306ef16db', 'AR-u5-heating-with-losses-10': '4d5fa9e9912514bf9b6cb1e7d8ceeb094aea16b31add8c8359c51feb46b7d853', 'AR-u5-heating-with-losses-11': '88fa4603c8bb17bfbd0ca8800e95613fb9d56038014495fea2b1806d8634aa08', 'AR-u5-heating-with-losses-12': 'fa900b3acbc7dad15f0b2905dc370607daf954fff241b66ef52481316327fc53', 'AR-u5-heating-with-losses-13': '11e6ec6f2b54888133c4bd385ef88af21f31dfc2fe569f051e61f267e7c1eed2', 'AR-u5-heating-with-losses-14': 'd3e9f6a4dc9d8a13c11fd32ac62684e496ae77093b9443437571d866a4f990a5', 'AR-u5-heating-with-losses-15': 'd8f0323c16d13cc22431e5fc05ec8abb7a231af456613d32593233f005070c47', 'AR-u5-heating-with-losses-16': '746c0ac06960f308600f92968a09172329d2f43106948a7e2533c52a682f149e'}
CANDIDATE_REF='955436596da3ed30259421fc62e7f4073a4783f6'

MANUAL=[
 '20−5=15 J ogni secondo;120/15=8s.160J entranti−40J usciti=120J netti.',
 'J/(J/s)=s. Le altre quattro unità rappresentano potenza, energia, capacità termica o tasso inverso.',
 'E=Pt−P_dt=(P−P_d)t; con P>P_d e E>0, t=E/(P−P_d)>0.',
 'A:120/15=8s; B:120/25=24/5s. Il rapporto è3/5, non20/30.',
 'P=P_d+E/t=5+120/8=20W; il controllo restituisce15·8=120J.',
 'P_d=P−E/t=20−15=5W, positivo e minore dell’ingresso.',
 'A8s e B120/10=12s; il rapporto12/8=3/2 è puro.',
 'La durata corretta è8s; proposta meno corretta=16−8=+8s.',
 'Dividere E=(P−P_d)t per t>0 e aggiungere P_d dà P=P_d+E/t.',
 'A:E/D; B:E/D_B; dividere cancella E e dà D/D_B, con D,D_B>0.',
 'A8s, B120/20=6s;6/8=3/4.',
 'Media=(8+6)/2=7s. Agli ingressi medi il modello dà48/7s: la differenza è1/7s.',
 'Bersaglio6s; netto120/6=20W; perdita30−20=10W; rapporto10/5=2.',
 'q=24/(8s)=3s⁻¹; t_B=18/q=6s; P_B=10+120/6=30W.',
 'q=(17−13)/(8−6)=2s⁻¹,b=1; t_C=(53/5−1)/2=24/5s; P_C=5+25=30W.',
 'P=4P_d implica E=3P_dt; P_d=120/(3·8)=5W e P=20W.'
]
DISTRACTORS=[
 '6s omette la dispersione;24s usa solo la perdita;24/5s somma ingresso e uscita.',
 'W,J,J/K e s⁻¹ non hanno la dimensione di una durata.',
 'La somma inverte il ruolo dell’uscita; il reciproco è un tasso; E/P ed E/P_d omettono un trasferimento.',
 '16/3s usa solo il fattore dell’ingresso;12s segue direttamente P;8s e4s non soddisfano25W netti.',
 '10W sottrae di nuovo la perdita;15W è solo il netto e5W solo la dispersione.',
 '35W somma;15W copia il netto;−5W cambia il verso dichiarato della potenza uscente.',
 '2/3 inverte il rapporto;2 e1/2 seguono soltanto la perdita;1 ignora il cambiamento del netto.',
 '−8s inverte lo scarto;16s copia la proposta;0s la accetta;2 è un rapporto senza dimensioni.',
 'Le differenze sbagliano il bilancio; Et non è potenza e t+P_d somma grandezze incompatibili.',
 'D_B/D è il reciproco; i soli fattori non conservano i pesi della differenza; κ₁κ₂ dà κ² invece di1/κ.',
 '4/3 è il reciproco;3/2 e2 copiano i singoli fattori,1 richiederebbe netti uguali.',
 '48/7s valuta la funzione agli ingressi medi;14s è la somma;6s e8s copiano una sola prova.',
 '1/2 inverte;3/4 e3/2 copiano altri fattori.10 copia il numero di watt della perdita senza dividere per5W.',
 '20W dimentica l’uscita;18 non è la durata in secondi;40W implicherebbe S=12, non18.',
 '25W dimentica la perdita;1465/53W omette l’offset;15W e35W non ricostruiscono la lettura53/5.',
 '15W e20W copiano altre potenze;15/4W omette la perdita nel bilancio;−5W viola entrambi i moduli positivi.'
]


@lru_cache(maxsize=1)
def source_records():
    raw=git_bytes(APP.parent,SOURCE_REF,SOURCE_PATH)
    if sha(raw)!=SOURCE_FILE_SHA256:raise ValueError('Unreviewed source shard')
    return {r['id']:r for r in json.loads(raw) if r['id'].startswith('u5-'+FAMILY+'-')}


def literal(text):
    """Bounded literal rational grammar; no eval or floating approximation."""
    if not isinstance(text,str) or len(text)>80:raise ValueError('Unsupported arithmetic input')
    tree=ast.parse(text.replace('−','-'),mode='eval')
    if len(list(ast.walk(tree)))>25:raise ValueError('Arithmetic expression too large')
    def visit(node):
        if isinstance(node,ast.Constant) and type(node.value) is int:return sp.Integer(node.value)
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            v=visit(node.operand);return v if isinstance(node.op,ast.UAdd) else -v
        if isinstance(node,ast.BinOp):
            a,b=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return a+b
            if isinstance(node.op,ast.Sub):return a-b
            if isinstance(node.op,ast.Mult):return a*b
            if isinstance(node.op,ast.Div) and b!=0:return a/b
        raise ValueError('Unsupported rational expression')
    return visit(tree.body)


@lru_cache(maxsize=1)
def symbolic():
    E,P,Pd,t,k1,k2=sp.symbols('E P Pd t k1 k2',positive=True)
    law=sp.solve(sp.Eq(E,(P-Pd)*t),t)[0]
    inverse=sp.solve(sp.Eq(E,(P-Pd)*t),P)[0]
    ratio=sp.cancel(law.subs({P:k1*P,Pd:k2*Pd})/law)
    return E,P,Pd,t,k1,k2,law,inverse,ratio


def option_value(number,option):
    if not isinstance(option,str):raise ValueError('Choice must be text')
    E,P,Pd,t,k1,k2,law,inverse,ratio=symbolic()
    if number==2:
        unit=SI.Unit(option.replace('s⁻¹','1/s'))
        return unit.dimensionality==SI.second.dimensionality
    if number in (3,9,10):
        maps={3:{'t = E / (P − P_d)':law,'t = E / (P + P_d)':E/(P+Pd),
                   't = (P − P_d) / E':(P-Pd)/E,'t = E / P':E/P,'t = E / P_d':E/Pd},
              9:{'P = P_d + E / t':inverse,'P = P_d − E / t':Pd-E/t,
                   'P = E / t − P_d':E/t-Pd,'P = E t + P_d':E*t+Pd,'P = E / (t + P_d)':E/(t+Pd)},
              10:{'D / D_B':ratio,'D_B / D':1/ratio,'κ₁ / κ₂':k1/k2,'κ₁ κ₂':k1*k2,'κ₂ / κ₁':k2/k1}}
        if option not in maps[number]:raise ValueError('Unreviewed symbolic alternative')
        wanted={3:law,9:inverse,10:ratio}[number]
        return sp.simplify(maps[number][option]-wanted)==0
    if number==4:
        match=re.fullmatch(r'Da ([0-9/]+) a ([0-9/]+) s',option)
        if match:return literal(match[1])==8 and literal(match[2])==sp.Rational(24,5)
        unchanged=re.fullmatch(r'Resta ([0-9/]+) s',option)
        if unchanged:return literal(unchanged[1])==8 and literal(unchanged[1])==sp.Rational(24,5)
        raise ValueError('Unreviewed two-duration alternative')
    match=re.fullmatch(r'([−+-]?\d+(?:/\d+)?)\s*(s|W)?',option)
    if not match:raise ValueError('Unreviewed literal alternative')
    unit=match[2] or '1'
    wanted_unit={8:'s',12:'s',15:'W',16:'W'}.get(number,'1')
    return literal(match[1])==sp.Rational(physics.numeric_primary()[number]) and unit==wanted_unit


def answer_errors(number,answer):
    try:
        if answer['type']=='numeric':
            unit={1:'s',5:'W',6:'W',14:'W'}[number]
            valid=(sp.Rational(str(answer['value']))==sp.Rational(physics.numeric_primary()[number])
                   and answer.get('unit')==unit and answer.get('tolerance')==0)
        elif answer['type']=='choice':
            accepted=[value for value in answer['options'] if option_value(number,value)]
            valid=len(accepted)==1 and accepted[0]==answer['value']
        else:valid=False
    except (ValueError,TypeError,KeyError,SyntaxError,pint.errors.PintError):valid=False
    return [] if valid else ['Independent energy-balance answer or unit mismatch']


def asset_geometry(asset_root):
    file=asset_root/ASSET_NAME
    if not file.is_file():return False
    raw=file.read_bytes()
    if sha(raw)!=REVIEWED_ASSET_SHA256:return False
    svg=ET.fromstring(raw);items=list(svg.iter())
    bars=[e for e in items if e.tag.endswith('rect') and e.get('height')=='40']
    if [int(e.get('width')) for e in bars]!=[400,100,300,320,240,280]:return False
    if any(e.get('x')!='100' for e in bars):return False
    if [e.get('d') for e in items if e.tag.endswith('path')]!=['M100 590H420V910','M100 910L420 590']:return False
    visible=' '.join(e.text or '' for e in items if e.tag.endswith('text'))
    if 'px/' in visible or not all(v in visible for v in ('120 J','8 s','6 s','7 s')):return False
    # Labels must be clear of the zero axes; the read final edition supplies the
    # exact SHA, while these physical checks survive deliberate token replacement.
    for e in items:
        if e.tag.endswith('text') and (e.text or '').strip()=='0':
            if abs(float(e.get('x'))-100)<15:return False
    return True


def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected canonical astra/1 package')
    asset_root=asset_root or APP/'editorial/assets'
    if sha((APP/PRIMARY_PATH).read_bytes())!=PRIMARY_SHA256:raise ValueError('Source-only primary changed')
    originals=source_records();geometry=asset_geometry(asset_root);rows=[]
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Independent package reading is missing or stale')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Independent binding reading is missing or stale')
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);sid=f'u5-{FAMILY}-{n:02}';source=originals[sid]
        provenance=binding.get('provenance',{})
        if (binding.get('sourceId')!=sid or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=digest(source)
            or provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=sid
            or provenance.get('sourceReasoningTask')!=source['descriptors']['reasoningTask'] or provenance.get('sourceProvenance')!=source.get('provenance')
            or binding.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN'
            or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
            errors.append('Independent pinned Git source or provenance mismatch')
        if (row.get('course')!='C3' or row.get('skill')!='C3-L03' or row.get('prerequisites')!=['C3-L01','C3-L03','C3-L06']
            or row.get('reuse')!=['C6'] or row.get('error',{}).get('target')!='C3-L03' or row.get('family')!=FAMILY):
            errors.append('Independent reviewed competency mapping mismatch')
        errors.extend(answer_errors(n,row['answer']))
        if assets and not geometry:errors.append('Independent physical figure scale or readable origin check failed')
        rows.append({'id':row['id'],'ok':not errors,'errors':errors,'candidateSha256':digest(row),
          'sourceSha256':binding['sourceSha256'],'reviewedSignature':signature,'assetChecksums':assets,
          'oracleSha256':sha(Path(physics.__file__).read_bytes()),
          'manualArithmetic':MANUAL[n-1],'distractors':DISTRACTORS[n-1],
          'physicalAssumptions':'Closed sample; fixed positive120J net target, negligible mechanical work and no phase change. Positive constant powers within each trial, P>P_d; dispersion constancy is a stated local model. Separate trials may change powers, not target energy.',
          'dimensionalAnalysis':'E/(P−P_d) has dimensiontime; inverse returns power. Ratios are pure. Continuous dimensionless instrumentS has gainq in s^-1 and dimensionless offset.',
          'pedagogicalReview':'Final complete record independently read against the earlier source-prompt primary: law selection, signs, inverses, physical branch, exact hand calculation and each actual alternative. Figures use physical labels; engineering coordinates remain outside learner text.',
          'assetReview':'Full SVG XML and independent complete render read; proportional bars,120J at8s and mean7s validated' if assets else 'No figure attached to this individual record',
          'verificationMode':'AI_CONCEPTUAL' if n in (2,3,9,10) else 'EXACT_ORACLE',
          'methods':['independent_source_prompt_primary_before_candidate_keys','exact_Fraction_SymPy_conservation_inverse_calibration_and_nonlinear_mean',
                     'Pint_dimensional_analysis','individual_distractor_physical_domain_manual_and_pedagogical_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return rows


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),
      'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
      'oracleSha256':sha(Path(physics.__file__).read_bytes()),'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'reviewedCandidateCommit':CANDIDATE_REF,'reviewer':'root_distinct_from_candidate_author_A',
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'fileSha256':SOURCE_FILE_SHA256},
      'primaryBeforeCandidateKeys':{'path':PRIMARY_PATH,'sha256':PRIMARY_SHA256},
      'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'}
