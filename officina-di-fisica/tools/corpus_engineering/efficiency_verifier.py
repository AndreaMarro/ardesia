"""Separate reviewer: 16 efficiency source prompts solved before candidate keys.

Independent useful/total energy model, no authoring import or dynamic freeze.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest,sha
from .review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
SOURCE_FILE_SHA256='78b540e0bf35105eb6a849b3fa85937b84071c8080425e7b7ddf8f2e2d5eb980'
EXPECTED_IDS={f'AR-u2-efficiency-{n:02}' for n in range(1,17)}
READ_SOURCE_SHA256 = {'AR-u2-efficiency-01': '418744d69d7eb003a61f3699260ee397ac50507db6e74ba3bdee6b7649398583',
 'AR-u2-efficiency-02': '871b811cf681bbbe583998d60fd29ded5d32466572376c05db86e121e106f9e4',
 'AR-u2-efficiency-03': 'f469c7e16ad2da66110e86b73d80375c797573598fc1db0352a17ad46d9f7a28',
 'AR-u2-efficiency-04': '6afa292f5003ce83f288c8e69d32321ab3f9bc9f14d62626350b3e3cca522370',
 'AR-u2-efficiency-05': '1748c996c09c64fc1fa5dd343dd5ebc289f8d2ce494cf8c0972356a625aacfb5',
 'AR-u2-efficiency-06': '37717dc561bc2fc99c238383256971f6c3c5645031ea1e31928daa5757a4208e',
 'AR-u2-efficiency-07': '214187993d96e919a94bcfecc2fc3d9c5322f994c87403896eb863440bb3712a',
 'AR-u2-efficiency-08': '75edce1d5c86420f2b00ebca4d0e57f730cdf5b54218031266418ec6985b0d63',
 'AR-u2-efficiency-09': 'b4e2ea21a6b312cebe50d95df70f79960f47aaeca43382cc63455e9b02135328',
 'AR-u2-efficiency-10': '70c7a52a5778f0786e3912d594c25d3934b9e3364227e7bbb65dff57f1e1b2cd',
 'AR-u2-efficiency-11': 'd598c740144b6378dada66483877195413195257451e1a5a19a5ada62d94ae88',
 'AR-u2-efficiency-12': 'b52e8130a77702bada6bab3409403ea5aa0f3e7e920a0f4dcd65a6e6515934ab',
 'AR-u2-efficiency-13': '936ab75c37b6ee009917f8692bdb34fb40d32d81734b6aa8a02d02ae01205110',
 'AR-u2-efficiency-14': '1223582661ca6e2b29e4cbf05049ada90e97eec456c833fd6402464b369809a8',
 'AR-u2-efficiency-15': '91622c89cb6688af999ddde4af96ff408d28bee084f652a53b1b78337dd35185',
 'AR-u2-efficiency-16': '1ad0d8edc298530d53019beac85fdc8928e47923fe0f2c7872993994c901d49a'}
REVIEWED_CANDIDATES = {'AR-u2-efficiency-01': 'dbc67dd49eb94bc6758fc25f89bbc1bc18f015b756afc7f587081b9203f25c8b',
 'AR-u2-efficiency-02': 'f0728103a809138e337ad32d4718828c286836e697ede6f0dba129867a6f2736',
 'AR-u2-efficiency-03': '76522abcdc1f6400fd8c45a96460390c047ad064532419fb72328eefb1a40008',
 'AR-u2-efficiency-04': '0934572a05e8c926c43664a8f062b5c8ebbc8bc4bb907423b844265bef63a389',
 'AR-u2-efficiency-05': 'c4b02d566144693165d2854c280e6ac765746eb548b3bf4b6d80a3a1b1143b57',
 'AR-u2-efficiency-06': '744b58ff5968aa07f552be1f7f7c6d7a4d3bdd7cca28b9d21157f8b8ff80d69a',
 'AR-u2-efficiency-07': '375a2ee89cf8ff53f5dc3fb25e254ea43d52f94666750dc7a2a30f1c8c76d9c2',
 'AR-u2-efficiency-08': '7b1126439a63468c67a29745503c096fa32e6083788eeea4efb233ebf6400d90',
 'AR-u2-efficiency-09': 'caf0fbcfbab87d316d48f0ed0f2ffa8e935c247c30c62f879b286becc9098e94',
 'AR-u2-efficiency-10': '85addc0bd498f5290ed28790acb246e954811929d148a6d3c5d9e3d90b2371a6',
 'AR-u2-efficiency-11': 'bf75649b9165d7e89644bafde529d76d2b3ca5fbb45f775df9713262e968458b',
 'AR-u2-efficiency-12': 'da97336f16b701901fc4f9333bd0ef7ecb465f98cd731a50e31798df18732e73',
 'AR-u2-efficiency-13': '8d08fdeede6eb3106daafd6c96cfb588fc5afa62565a973a7166d3cfc284c94c',
 'AR-u2-efficiency-14': '2d49fd6f852cafdc78d7b9a0e1eb7203e9a0effc9598707fd44068ddd07bf817',
 'AR-u2-efficiency-15': '996a8f798eedd145ea22c76d680531fae7db81e6bf2065e90832a8f4989789c7',
 'AR-u2-efficiency-16': '5f66dd64b49f69a1fbbbd243cd0d1c7e9e749fc93ff618ae8e1494685d2a7920'}
SI=pint.UnitRegistry(non_int_type=Fraction)


def efficiency_model():
    useful,total,eta=sp.symbols('E_u E_in eta',positive=True)
    # Useful output is a specified fraction of total input, remainder still exits.
    fraction=sp.solve(sp.Eq(useful,eta*total),eta)[0]
    return useful,total,eta,fraction


def oracle():
    Eu,Ei,eta,E=efficiency_model()
    R=sp.Rational;k1,k2=sp.symbols('k1 k2',positive=True)
    inverse_useful=sp.solve(sp.Eq(E,eta),Eu)[0]
    inverse_total=sp.solve(sp.Eq(E,eta),Ei)[0]
    first,second=E.subs({Eu:2,Ei:4}),E.subs({Eu:4,Ei:16})
    half_useful=E.subs({Eu:1,Ei:4})/first
    scaling=sp.simplify(E.subs({Eu:k1*Eu,Ei:k2*Ei},simultaneous=True)/E)
    mean=(first+second)/2;aggregate=R(2+4,4+16)
    if (first!=R(1,2) or second!=R(1,4) or half_useful!=R(1,2) or mean!=R(3,8)
            or aggregate!=R(3,10) or mean==aggregate or sp.simplify(scaling-k1/k2)!=0):
        raise ValueError('Independent energy fraction/scaling/weighting failed')
    Q=SI.Quantity
    if (Q(2,'J')/Q(4,'J')).to('').magnitude!=Fraction(1,2):raise ValueError('Pint energy cancellation failed')
    gain=Q(Fraction(3,2),'')/Q(Fraction(first),'')
    calibrated_eta=(Q(Fraction(3,4),'')/gain).to('')
    calibrated_useful=(calibrated_eta*Q(16,'J')).to('J').magnitude
    a,b=sp.symbols('a b',real=True)
    calibration=sp.solve([sp.Eq(a*first+b,2),sp.Eq(a*second+b,R(3,2))],(a,b))
    corrected_eta=(R(5,3)-calibration[b])/calibration[a]
    affine_useful=inverse_useful.subs({eta:corrected_eta,Ei:3})
    if calibration!={a:2,b:1} or corrected_eta!=R(1,3) or affine_useful!=1:
        raise ValueError('Independent affine efficiency calibration failed')
    lam=sp.Symbol('lam',positive=True)
    rank=sp.Matrix([Eu-Ei/2,R(1,2)-Eu/Ei]).jacobian([Eu,Ei]).subs(Eu,Ei/2).rank()
    if E.subs({Eu:lam/2,Ei:lam})!=R(1,2) or rank!=1:
        raise ValueError('Redundant ratio and positive continuum test failed')
    # Explicit strict-domain counterexample: positive scaling alone is insufficient.
    if E.subs({Eu:6,Ei:4})!=R(3,2) or not 0<corrected_eta<1:
        raise ValueError('Strict efficiency domain test failed')
    if sp.Rational(320,80)!=4 or sp.Rational(160,80)!=2 or 160+160!=320:
        raise ValueError('Scientific energy-bar scale or conservation failed')
    return [first,'1 (numero puro)','E_u / E_in','Si dimezza',inverse_useful.subs({eta:R(1,2),Ei:4}),
        inverse_total.subs({eta:R(1,2),Eu:2}),E.subs({Eu:2,Ei:8})/first,1-first,'E_u=η E_in','κ₁ / κ₂',
        second/first,mean,inverse_total.subs({Eu:4,eta:first/2})/4,R(calibrated_useful),affine_useful,'Infinite']


MANUAL=[
    'Eu/Ein=2/4=1/2=50%;richiesto numero puro1/2,non50. Altre usciteEin−Eu=2J,nessuna energia distrutta.',
    'J/J=1. EnergiaJ,potenzaW,forzaN,temperaturaK sono dimensioni distinte. Revisionato il duplicato W=J/s sostituendolo conN prima del freeze.',
    'Eu=eta*Ein⇒eta=Eu/Ein. Eu<Ein epositive⇒0<eta<1. Inverso>1,prodottoJ²,somma/differenzaJ.',
    'EtaA2/4=1/2,etaB1/4;B/A=(1/4)/(1/2)=1/2. Nonutile2→3J;totale4J conservaenergia.',
    'Eu=etaEin=(1/2)*4=2J. Dividere pereta darebbe8J da4J,fuoridominio.',
    'Ein=Eu/eta=2/(1/2)=4J. Ingresso>utile2J;eta0 vietata.',
    'EtaA2/4=1/2,etaB2/8=1/4;B/A1/2. Ingresso doppio conutilefisso peggiora la frazione.',
    'Proposta1−corretto1/2=+1/2.50punti percentuali sono differenza,100% sarebbe errore relativo rispetto al corretto.',
    'Moltiplicare eta=Eu/Ein perEin positivo dàEu=etaEin. UnitaJ;Ein/eta è inversa per altra incognita,non perEu.',
    'EtaB/etaA=k1/k2. Occorre anchek1Eu<k2Ein;esetaA3/4,k1=2,k2=1 darebbe3/2 non ammesso. I due fattori uguali mantengonoeta.',
    'EtaA1/2,etaB4/16=1/4;B/A1/2. Uscita utile più grande non implica efficienza maggiore.',
    '(1/2+1/4)/2=(3/4)/2=3/8. Energiaaggregata6/20=3/10 è media pesata perEin,non uguale pesoai cicli.',
    'TargetetaB=(1/2)/2=1/4;EinB4/(1/4)=16J;rapporto16/4=4. Raddoppioutile2 diviso fattoreingresso4 dàtarget1/2.',
    'Display puro:gain(3/2)/(1/2)=3;etaB(3/4)/3=1/4;EuB16/4=4J. S>1 non viola eta<1;S non èeta.',
    'Gain[2−3/2]/[1/2−1/4]=(1/2)/(1/4)=2,b=2−2*(1/2)=1;etaC(5/3−1)/2=1/3,EuC3/3=1J. Altrealternative ricostruisconoS4/3,2,7/3,3;ultimoeta1 vietato.',
    'PerogniEin=lambdaJ>0,Eu=lambda/2J:eta1/2,Eu<Ein sempre. Vincoloenergia e rendimento duplicati,Jacobianorank1;infinitecoppie continuepositive,non soltanto intere.',
]
UNITS={n:('J' if n in (5,6,9,14,15) else '1') for n in range(1,17)}
NUMERIC_UNITS={5:'J',6:'J',13:'1',14:'J'}


def verify(package,bindings,asset_root=None):
    root=Path(asset_root) if asset_root is not None else APP/'editorial/assets';answers=oracle();results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,root):
        n=int(row['id'].rsplit('-',1)[1]);wanted=answers[n-1];answer=row['answer'];value=answer['value']
        if row.get('kind')!='question' or row.get('version')!=1 or row.get('baseVersion')!=0:
            errors.append('Expected new question draft version1/base0')
        if isinstance(wanted,str):
            if value!=wanted:errors.append('Independent efficiency conceptual relation mismatch')
        else:
            try:
                raw=str(value).replace('−','-')
                if n==15:
                    if not raw.endswith(' J'):raise ValueError('Missing energy unit')
                    raw=raw.removesuffix(' J')
                if sp.Rational(raw)!=sp.Rational(wanted):errors.append('Independent useful/total energy result mismatch')
            except (ValueError,TypeError):errors.append('Invalid exact numeric/unit answer')
        expected_type='numeric' if n in NUMERIC_UNITS else 'choice'
        if answer.get('type')!=expected_type:errors.append('Answer type differs from reviewed task')
        if expected_type=='numeric' and (answer.get('unit')!=NUMERIC_UNITS[n] or answer.get('tolerance')!=0):
            errors.append('Exact numeric answer unit/tolerance mismatch')
        if n==2:
            units=['' if option=='1 (numero puro)' else option for option in answer['options']]
            identities=[(SI.Quantity(1,unit).to_base_units().magnitude,tuple(sorted((str(k),str(v)) for k,v in SI.Unit(unit).dimensionality.items()))) for unit in units]
            if len(set(identities))!=5:errors.append('Equivalent unit distractors require editorial review')
        if (binding['sourceRef']!=SOURCE_REF or binding['sourceId']!=f'u2-efficiency-{n:02}'
                or binding['sourceSha256']!=READ_SOURCE_SHA256[row['id']]):errors.append('Pinned source identity/hash mismatch')
        provenance=binding.get('provenance',{})
        if (digest(provenance)!=binding.get('provenanceSha256') or provenance.get('sourceId')!=binding['sourceId']
                or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourcePath')!=SOURCE_PATH
                or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT'):
            errors.append('Author provenance envelope inconsistent or claims approval')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
            'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(wanted),
            'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},'manualArithmetic':MANUAL[n-1],
            'verificationMode':'AI_CONCEPTUAL' if isinstance(wanted,str) else 'EXACT_ORACLE',
            'methods':['blind_source_prompt_solution_before_candidate_keys','independent_useful_total_energy_fraction',
                'SymPy_exact_inverse_affine_weighting_and_rank','Pint_exact_units_and_equivalent_unit_distractors','separate_AI_options_and_scaled_asset_reading'],
            'physicalAssumptions':'Single cyclic device,no net energy storage,one complete counted energy input,positive useful output strictly below input. Remaining output is nonuseful,not destroyed. '
                +('Both scaled trials must satisfy strict0<Eu<Ein;positive factors alone insufficient. ' if n==10 else '')
                +('Equal statistical weights of ratios,not energy-input-weighted aggregate. ' if n==12 else '')
                +('Continuous dimensionless display,gain/offset dimensionless;S need not lie between0and1. ' if n in (14,15) else '')
                +('Eu=Ein/2 repeats eta1/2 and leaves arbitrary positive energy scale. ' if n==16 else ''),
            'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),
        'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN',
        'source':{'title':'Blind prompt solution; independent useful and complete input energy ratios','reference':SOURCE_REF+':'+SOURCE_PATH,
            'sourceFileSha256':SOURCE_FILE_SHA256,'limitations':'AI scientific review only; no human approval or publication'}}
