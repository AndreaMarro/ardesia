"""Separate reviewer: 16 source prompts solved blind before candidate reading.

Only pinned reviewed literals follow the independent PT=mgh derivation below.
No authoring/key imports, publication, human approval or dynamic signature freeze.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha
from .review_contract import reviewed_rows

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH = 'packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
SOURCE_FILE_SHA256 = '78b540e0bf35105eb6a849b3fa85937b84071c8080425e7b7ddf8f2e2d5eb980'
EXPECTED_IDS = {f'AR-u2-lift-time-{n:02}' for n in range(1, 17)}
READ_SOURCE_SHA256 = {'AR-u2-lift-time-01': '3cfcabdb7e981882d3fe9a40bff5ec3bd43b6d9b194eeee37e25c0e51db87a37',
 'AR-u2-lift-time-02': '4cb473927fad3bfe32bbcd370b73e460baba94cf9af21dc5468c66392e4eb02e',
 'AR-u2-lift-time-03': '2549bbe9165e6684a8b9bdb280e4923d36f3891dab29b4bb47ddac416d80382b',
 'AR-u2-lift-time-04': '0f7bcf554d1a58620045e3685f13603a46ae6ae25a309f0a62185572f6abbd73',
 'AR-u2-lift-time-05': '401b0b3c4c774fbedc703429da14196c667952b046bc3c69cffa9142315e4691',
 'AR-u2-lift-time-06': '8fe7553f9a3333b8ab7d7df17750ac755b59b3ea5a6c766ffe69b3d9943c7a31',
 'AR-u2-lift-time-07': '2ea583ff6b7e401a11f3fd76dafc82d5859d260291dfba3dd2ea57c394e9fc18',
 'AR-u2-lift-time-08': '2ab1a35774fe45ce11f7510ea195038610c89fc619193ce47ba8fe2e0ea6bc08',
 'AR-u2-lift-time-09': 'c23cf732f787db41e7c0dce66671a03d375c5939cc4555e5e3ef0b0915e33e71',
 'AR-u2-lift-time-10': '1e358706efba4f9570edd5ba0cb14255b328889d516d6567c6fbb271a5427ee2',
 'AR-u2-lift-time-11': '39cc1bb72323aa850bd7dd707a958fb763074c51aa3a6057626b6bd66d35548e',
 'AR-u2-lift-time-12': '7a72570592c911a9a9704761c55ef0aa3beba8585bb85e08c1641e591e6a3aa8',
 'AR-u2-lift-time-13': '960ec90270d19b7d36053ed9bcf418b4b8468528bbbcd17dfce27697dea9236b',
 'AR-u2-lift-time-14': '2e655208a4fb40fd42998f16e01370c6d436ebdd969c6571699b0be6cec321ae',
 'AR-u2-lift-time-15': '6d05cdc1679c76080fda3e267b23aa5169d504218c1ec4bd508d39b2ba390bf3',
 'AR-u2-lift-time-16': 'a011dcdcaf74f94bd7433c1b6b57bf6c0edeb6130c296249eab4015da9464b36'}
REVIEWED_CANDIDATES = {'AR-u2-lift-time-01': '9c40cb1c2c5f997e46f2897502ff24f002affc316e6c7c87b03fc5eea8d93586',
 'AR-u2-lift-time-02': '86874a64e68158d460e1cef4c399c8b7673a03c11af14ecbfeb7cdafee9fd4c7',
 'AR-u2-lift-time-03': '12d7cfba17f8fa202c3f71e5c44961f6230970c5a47a95fecdab367f0d76c90e',
 'AR-u2-lift-time-04': '1c32a3759ec159e8c07deccdc63f95250edef8709b1d263b6d103e99925b733a',
 'AR-u2-lift-time-05': '0516aea82ab0644ba250ac5c9a69887a7c7fbfce47c5f23c6f564b19b0116efe',
 'AR-u2-lift-time-06': '77c21e0a5cfbb9fd2ecc368e07b6f5eb63836a6ca8e8110a164fa9d1c5109517',
 'AR-u2-lift-time-07': '0ec2d2cc5b1b1ff40c3b61ea17ed4a6237d3569c0cbf320b170f6bcf9c443a05',
 'AR-u2-lift-time-08': 'af56ef2f635672dff89f5b6f7888aa86046b35480cf46343626e46c5f9226239',
 'AR-u2-lift-time-09': 'f666beee7b6c87922e9aad13cbd20b8e2be3f35d8ac19043b541910abbb6b998',
 'AR-u2-lift-time-10': 'c8ac4ae8fcbc3ab0ee623c503df1823e1c19f04950c51fda7e3f2ace24698501',
 'AR-u2-lift-time-11': 'ae3a3e83fa231e89b9802c32e8b59241991a09c754da1158377b730f68393379',
 'AR-u2-lift-time-12': '8a7a679841c0218358accd0873718e4c5c25023a24434464a8408baa7a609749',
 'AR-u2-lift-time-13': 'd37b2eaa7e9ef55f21dd354bf5be84d09db2237e1ec5c671984ef7e35043cfd6',
 'AR-u2-lift-time-14': '679a5814e6605ef78de8f955d98daa7cd562d32df262a0b1b07d852a901f931e',
 'AR-u2-lift-time-15': '1cad4e921f0f8d08d8274051d275a58052e4d885979f3144eccd96ee7f7a221e',
 'AR-u2-lift-time-16': '4173714cdeb7ed53688c922ae4fe92059ca0d13039ec6e0de6f73251f57fc4d3'}
SI = pint.UnitRegistry(non_int_type=Fraction)


def lift_model():
    mass, power, gravity, height, duration = sp.symbols('m P g h T', positive=True)
    # Work integral of the balancing lift force, not net work of all forces.
    z = sp.Symbol('z', real=True)
    useful_work = sp.integrate(mass*gravity, (z, 0, height))
    T = sp.solve(sp.Eq(power*duration, useful_work), duration)[0]
    if sp.simplify(T-mass*gravity*height/power) != 0:
        raise ValueError('Independent useful-work balance failed')
    return mass, power, gravity, height, duration, T


def oracle():
    m, P, g, h, duration, T = lift_model()
    k1, k2 = sp.symbols('k1 k2', positive=True)
    inverse_mass = sp.solve(sp.Eq(T, duration), m)[0]
    inverse_power = sp.solve(sp.Eq(T, duration), P)[0]
    fixed = T.subs({g: 10, h: 2})
    first, second = fixed.subs({m: 2, P: 2}), fixed.subs({m: 6, P: 4})
    doubled = fixed.subs({m: 4, P: 2})/first
    scaling = sp.simplify(T.subs({m:k1*m, P:k2*P}, simultaneous=True)/T)
    mean = (first+second)/2
    if (first != 20 or second != 30 or doubled != 2 or mean != 25
            or fixed.subs({m:4, P:3}) != sp.Rational(80, 3)
            or sp.simplify(scaling-k1/k2) != 0):
        raise ValueError('Independent scaling/mean-duration checks failed')
    Q = SI.Quantity
    useful = Q(2,'kg')*Q(10,'m/s**2')*Q(2,'m')
    if useful.to('J').magnitude != 40 or (useful/Q(2,'W')).to('s').magnitude != first:
        raise ValueError('Pint exact energy/time dimensions failed')
    gain = Q(60,'')/Q(Fraction(first),'s')
    new_time = (Q(90,'')/gain).to('s')
    calibrated_mass = (Q(4,'W')*new_time/(Q(10,'m/s**2')*Q(2,'m'))).to('kg').magnitude
    a, b = sp.symbols('a b', real=True)
    calibration = sp.solve([sp.Eq(a*first+b,41), sp.Eq(a*second+b,61)],(a,b))
    corrected_time = (81-calibration[b])/calibration[a]
    affine_mass = inverse_mass.subs({g:10,h:2,P:2,duration:corrected_time})
    if calibration != {a:2,b:1} or corrected_time != 40 or affine_mass != 4:
        raise ValueError('Affine calibration or positive gain failed')
    # c=1kg/W is a dimensional across-trial constraint, not m=P physically.
    coefficient_time = (Q(1,'kg/W')*Q(10,'m/s**2')*Q(2,'m')).to('s').magnitude
    lam = sp.Symbol('lam', positive=True)
    rank = sp.Matrix([m-P,20-20*m/P]).jacobian([m,P]).subs(m,P).rank()
    if fixed.subs({m:lam,P:lam}) != 20 or rank != 1 or coefficient_time != 20:
        raise ValueError('Positive continuum and redundant-data test failed')
    # Figure: centers120px apart at60px/m; four10J portions, four5s intervals.
    if (sp.Rational(275-155,60) != 2 or 4*10 != 40
            or sp.Rational(10,2) != 5 or sp.Rational(540-40,125)*5 != 20):
        raise ValueError('Independent figure scales failed')
    return [first,'s','mg h / P','Raddoppia',
        inverse_mass.subs({P:2,duration:20,g:10,h:2}), inverse_power.subs({m:2,duration:20,g:10,h:2}),
        fixed.subs({m:2,P:4})/first,40-first,'m=PT/(gh)','κ₁ / κ₂',second/first,mean,
        inverse_power.subs({m:6,g:10,h:2,duration:sp.Rational(3,2)*first})/2,
        sp.Rational(calibrated_mass),affine_mass,'Infinite']


MANUAL = [
    'Peso2*10=20N;energia utile20*2=40J;tempo40/2=20s. Lavoro gravita−40J,utile+40J,netto0=DeltaK.',
    'mgh ha unitaJ e P haJ/s;J/(J/s)=s. Metro,massa,energia,potenza non sono durate.',
    'Integra forza di sollevamento mg lungo quota0..h:Wu=mgh. Potenza utile costante PT=Wu;T=mgh/P. gh=20J/kg conserva le unita.',
    'Energia40→80J con potenza2W:tempo20→40s,raddoppia. VelocitaP/(mg) dimezza;g,h immutati.',
    'PT=2*20=40J egh=10*2=20J/kg;m=40/20=2kg.',
    'mgh=40J;P=40/20=2W. v=2/20=1/10m/s;mg*v=20/10=2W. Si tratta di energia utile totale del tratto.',
    'TA20s,TB40/4=10s;B/A10/20=1/2,non rapporto potenze2.',
    'Corretto20s,proposto40s:scarto proposto−corretto=+20s. La proposta trasferirebbe80J,non40.',
    'PT=mgh⇒m=PT/(gh),J/(J/kg)=kg. Tutti i divisori sono positivi.',
    'TB/TA=[k1*mgh/(k2*P)]/[mgh/P]=k1/k2;fattori positivi,altezza e campo comuni.',
    'TA40/2=20s;TB120/4=30s;rapporto30/20=3/2. Triplo lavoro compensato da potenza doppia.',
    'Media uscite(20+30)/2=25s. Ingressi medi4kg/3W darebbero80/3s,non25;non si richiede somma50s.',
    'TargetTB=(3/2)*20=30s;PB120/30=4W;PB/PA4/2=2. Massa tripla divisa per rapporto tempi3/2.',
    'Display adimensionale:gain60/(20s)=3s^-1. S90⇒T30s;4W*30s=120J e120/20=6kg. Gain,non il numeroS,porta unita1/s.',
    'Gain(61−41)/(30−20)=2s^-1,b41−2*20=1 adimensionale. T_C(81−1)/2=40s;m_C2*40/20=4kg. Alternative2/3/5/8kg ricostruisconoS41/61/101/161.',
    'm=(1kg/W)P rendeT=cgh=20s per ogniP>0;esempiP=lambdaW,m=lambdakg,lambda>0. Rank1 fra due vincoli,non due equazioni indipendenti. Continue infinite coppie,anche non intere.',
]
UNITS = {1:'s',2:'s',3:'s',4:'1',5:'kg',6:'W',7:'1',8:'s',9:'kg',10:'1',11:'1',12:'s',13:'1',14:'kg',15:'kg',16:'1'}
NUMERIC_UNITS = {1:'s',5:'kg',6:'W',8:'s',12:'s',13:'1',14:'kg'}


def verify(package, bindings, asset_root=None):
    root = Path(asset_root) if asset_root is not None else APP/'editorial/assets'
    answers, results = oracle(), []
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,root):
        n=int(row['id'].rsplit('-',1)[1]);wanted=answers[n-1];answer=row['answer'];value=answer['value']
        if row.get('kind')!='question' or row.get('version')!=1 or row.get('baseVersion')!=0:
            errors.append('Expected new question draft version1/base0')
        if isinstance(wanted,str):
            if value!=wanted:errors.append('Independent lift-time conceptual relation mismatch')
        else:
            try:
                raw=str(value).replace('−','-')
                if n==15:
                    if not raw.endswith(' kg'):raise ValueError('Missing mass unit')
                    raw=raw.removesuffix(' kg')
                if sp.Rational(raw)!=sp.Rational(wanted):errors.append('Independent useful-work/time result mismatch')
            except (ValueError,TypeError):errors.append('Invalid exact numeric/unit answer')
        expected_type='numeric' if n in NUMERIC_UNITS else 'choice'
        if answer.get('type')!=expected_type:errors.append('Answer type differs from reviewed task')
        if expected_type=='numeric' and (answer.get('unit')!=NUMERIC_UNITS[n] or answer.get('tolerance')!=0):
            errors.append('Exact numeric answer unit/tolerance mismatch')
        if n==2:
            identities=[(SI.Quantity(1,option).to_base_units().magnitude,tuple(sorted((str(k),str(v)) for k,v in SI.Unit(option).dimensionality.items()))) for option in answer['options']]
            if len(set(identities))!=5:errors.append('Equivalent unit distractors require editorial review')
        if (binding['sourceRef']!=SOURCE_REF or binding['sourceId']!=f'u2-lift-time-{n:02}'
                or binding['sourceSha256']!=READ_SOURCE_SHA256[row['id']]):errors.append('Pinned source identity/hash mismatch')
        provenance=binding.get('provenance',{})
        if (digest(provenance)!=binding.get('provenanceSha256') or provenance.get('sourceId')!=binding['sourceId']
                or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourcePath')!=SOURCE_PATH
                or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT'):
            errors.append('Author provenance envelope inconsistent or claims approval')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),
            'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(wanted),
            'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},'manualArithmetic':MANUAL[n-1],
            'verificationMode':'AI_CONCEPTUAL' if isinstance(wanted,str) else 'EXACT_ORACLE',
            'methods':['blind_source_prompt_solution_before_candidate_keys','independent_integrated_useful_work_PT_balance',
                       'SymPy_exact_inverses_scaling_affine_and_rank','Pint_exact_units_gain_and_coefficient','separate_AI_options_and_scaled_asset_reading'],
            'physicalAssumptions':'Positive constant mass,uniform g10m/s²,h2m,upward uniform observed segment;startup/shutdown excluded. P is USEFUL mechanical power to load,not input power or net work of all forces. '
                +('Equal statistical weights of output durations,not response at input means. ' if n==12 else '')
                +('Continuous dimensionless display,gain1/s;offset dimensionless only15. ' if n in (14,15) else '')
                +('m=cP,c1kg/W is across trials;T20s repeats the constraint and leaves positive scale free. ' if n==16 else ''),
            'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),
        'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN',
        'source':{'title':'Blind prompt solution; independent useful-work/time energy balance','reference':SOURCE_REF+':'+SOURCE_PATH,
            'sourceFileSha256':SOURCE_FILE_SHA256,'limitations':'AI scientific review only; no human approval or publication'}}
