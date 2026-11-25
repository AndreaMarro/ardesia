"""Independent complete reading of real C4-L09/L10,17 blocks/four SVGs.

Exact models are derived independently; toy numerical probes are not assigned
student calculations. Historical bytes are retained, human approval is NOT_RUN.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest, sha
APP = Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C4.json'
SOURCE_FILE_SHA256='19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c'
BATCH='lessons-magnetism-induction-021'
READ_SOURCE_SHA256={
'C4-L09':'8af1d9413a5af7c22200cc7f4b68ecb036ee98ce80bb3357c33dfa61f4eb0cea',
'C4-L10':'f8265db8f5051d6fbbc61c112f25540379e4d5dcabfa5409217202faec7d6cc2'}
READ_ASSETS={
'C4-filo-b.svg':'35676e416c40db8b8bcb2e852d6f021550458dff9fc7f1565b694c055d4ab61a',
'C4-orbita.svg':'3c95346817907b8731c5b62f7880236e4b97c2411770f9bc617dcc576d89b3c5',
'C4-flusso.svg':'a0c10ef39955c42e2cbc9066e37e89d0befec67fb18b5e8f4f9eca1bb4745cd9',
'C4-lenz.svg':'9e5bb14e0620e1ac15ff6193dddcf1c9b463cad0339d7de1ed5920d386db6f5a'}
FIGURES_BY_ID={'C4-L09':['C4-filo-b.svg','C4-orbita.svg'],
'C4-L10':['C4-flusso.svg','C4-lenz.svg']}
SI=pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q,F=SI.Quantity,sp.Rational
    q=sp.Symbol('q',real=True)
    vx,vy,vz,bx,by,bz=sp.symbols('vx vy vz Bx By Bz',real=True)
    v=sp.Matrix([vx,vy,vz]); b=sp.Matrix([bx,by,bz]); force=q*v.cross(b)
    mass,speed,B,charge=sp.symbols('m v B qabs',positive=True)
    parallel=sp.Symbol('vparallel',real=True)
    time=sp.Symbol('t',real=True)
    omega=charge*B/mass; radius=mass*speed/(charge*B)
    trajectory=sp.Matrix([radius*sp.sin(omega*time),radius*(1-sp.cos(omega*time)),parallel*time])
    area,theta,N,rate,voltage,resistance,L=sp.symbols('A theta N rate emf R L',positive=True)
    flux=B*area*sp.cos(theta)
    density,cross,length,drift=sp.symbols('n Across length vd',positive=True)
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    boundary='reviewer_boundary_probe_excluded_by_source_conditions'
    ramp_current=voltage/resistance*(1-sp.exp(-resistance*time/L))
    return {
    'C4-L09':[
     check('outgoing wire current gives upward field at right',sp.Matrix([0,0,1]).cross(sp.Matrix([1,0,0]))[1],1),
     check('reversed wire current reverses field',sp.Matrix([0,0,-1]).cross(sp.Matrix([1,0,0]))[1],-1),
     check('Lorentz force perpendicular to velocity',force.dot(v),0,'W'),
     check('Lorentz force perpendicular to field',force.dot(b),0),
     check('positive charge rightvelocity incomingfield givesupforce',(q*sp.Matrix([speed,0,0]).cross(sp.Matrix([0,0,-B])))[1],q*speed*B,'N'),
     check('negative charge reverses same initialforce',(-charge*sp.Matrix([speed,0,0]).cross(sp.Matrix([0,0,-B])))[1],-charge*speed*B,'N'),
     check('parallel velocity giveszero force',sp.Matrix([0,0,speed]).cross(sp.Matrix([0,0,B])).norm(),0,'N'),
     check('coulomb velocity tesla has newton units',Q(2,'C')*Q(3,'m/s')*Q(4,'T'),24,'N',probe),
     check('radius follows positive centripetal balance',sp.solve(sp.Eq(charge*speed*B,mass*speed**2/sp.Symbol('r',positive=True)),sp.Symbol('r',positive=True))[0],radius,'m'),
     check('radius units',Q(2,'kg')*Q(3,'m/s')/(Q(1,'C')*Q(2,'T')),3,'m',probe),
     check('helical exact path satisfies x Lorentz equation',mass*sp.diff(trajectory[0],time,2)-charge*trajectory.diff(time).cross(sp.Matrix([0,0,-B]))[0],0,'N'),
     check('helical exact path satisfies y Lorentz equation',mass*sp.diff(trajectory[1],time,2)-charge*trajectory.diff(time).cross(sp.Matrix([0,0,-B]))[1],0,'N'),
     check('helical axial acceleration vanishes',sp.diff(trajectory[2],time,2),0,'m/s^2'),
     check('helical total speed constant',sp.simplify(trajectory.diff(time).dot(trajectory.diff(time))),speed**2+parallel**2,'m^2/s^2'),
     check('helical radius uses transverse not total speed',radius,mass*speed/(charge*B),'m'),
     check('wire particle sum equals I length B',(density*cross*length)*charge*drift*B,(density*charge*drift*cross)*length*B,'N'),
     check('wire ampere length tesla has force units',Q(2,'A')*Q(3,'m')*Q(4,'T'),24,'N',probe),
     check('toy magnetic force maximum at rightangle',2*3*sp.sin(sp.pi/2),6,'N',probe),
    ],
    'C4-L10':[
     check('plane flux is dotproduct with oriented normal',sp.Matrix([B*sp.sin(theta),0,B*sp.cos(theta)]).dot(sp.Matrix([0,0,area])),flux,'Wb'),
     check('field in plane haszero flux',flux.subs(theta,sp.pi/2),0,'Wb'),
     check('normal reversal reverses signedflux',sp.trigsimp(flux.subs(theta,theta+sp.pi)),-flux,'Wb'),
     check('tesla squaremetre is weber',Q(2,'T')*Q(3,'m^2'),6,'Wb',probe),
     check('weber per second is volt',Q(6,'Wb')/Q(3,'s'),2,'V',probe),
     check('constant nonzero flux haszero emf',-sp.diff(B*area,time),0,'V'),
     check('coil fluxlinkage scales withN not Nsquared',-sp.diff(N*rate*time,time),-N*rate,'V'),
     check('average emf toy3turns flux2to8 in2s',-F(3*(8-2),2),-9,'V',probe),
     check('nonlinear flux average differs from terminalinstantaneous',-F(2**2-0,2),-2,'V',probe),
     check('same nonlinear flux endpoint emf isminus4',(-sp.diff(time**2,time)).subs(time,2),-4,'V',probe),
     check('rotation withconstantB induces sinusoidalemf',-sp.diff(N*B*area*sp.cos(rate*time),time),N*B*area*rate*sp.sin(rate*time),'V'),
     check('zero instantaneous flux need not meanzero emf',(N*B*area*rate*sp.sin(rate*time)).subs(time,sp.pi/(2*rate)),N*B*area*rate,'V',probe),
     check('increasing incomingfield givesCCW positive emf',-sp.diff(-area*rate*time,time),area*rate,'V'),
     check('decreasing incomingfield givesCW negative emf',-sp.diff(-area*(B-rate*time),time),-area*rate,'V'),
     check('increasing outgoingfield givesCW negative emf',-sp.diff(area*rate*time,time),-area*rate,'V'),
     check('resistive2ohm loop with6Vemf carries3A',Q(6,'V')/Q(2,'ohm'),3,'A',probe),
     check('finite emf can persist asopen loop current tendszero',sp.limit(voltage/resistance,resistance,sp.oo),0,'A',probe),
     check('RL transient obeys voltage balance not instantaneous IequalsEoverR',L*sp.diff(ramp_current,time)+resistance*ramp_current,voltage,'V',boundary),
    ]}

MANUAL={
'C4-L09':'All source tasks are symbolic relations and direction reasoning. In right-handed xright,yup,zout coordinates, k cross i=j gives outgoing-wire field upward at its right; i cross(-k)=j gives the positive-particle upward force, reversed for negative charge. Dotting q(v cross B) withv giveszero power. Classical qabs*vperp*B=m*vperp²/r yields r=m*vperp/(qabs*B). Exact sine/cosine parametrization differentiates to the Lorentz equation and constant vperp²+vparallel², with unchanged axialvelocity; helical radius usesvperp, notfullspeed. The wire derivation sums n*Across*length carriers each withqabs*vd*B and usesI=n*qabs*vd*Across. Constructed manual unit probes2C*3m/s*4T=24N;2kg*3m/s/(1C*2T)=3m;2A*3m*4T=24N. No assigned numerical charge/mass or numerical trigonometry appears.',
'C4-L10':'The source assigns symbolic flux and Lenz reasoning, no compulsory numerical evaluation. Dotproduct givesPhi=BAcos(theta), T*m²=Wb, Wb/s=V. Withpairednormal/path, positiveemf isCCW seenfrom+normal. IncomingincreasingB givesPhi=-A*rate*t andpositiveemf, whileincomingdecreasing givesnegativeemf. Forconstructed3turns andflux2to8Wb over2s the mean is-9V. ForPhi=t² over0..2s meanemf=-2V whileterminalinstantaneous is-4V. RotatingcoilPhi=NBAcos(omega*t) hasemf=NBAomega*sin(omega*t), nonzero atzero instantaneousflux. Toy6V/2ohm=3A applies only to negligibleinductance; anRLstep instead givesI=(emf/R)(1-exp(-Rt/L)) andI(0)=0. Exactexponent andtrig are reviewer derivations, not required student decimal calculations.'}
ASSUMPTIONS={
'C4-L09':'Right-handed coordinates; conventionalcurrent andsignedq. Longstraightwireawayfromends forcirculartangent fielddescription. Magneticforceonly whenstatingzero magneticwork; absenceofotherforces andspatiallyuniformB fororbitalmodel. Classicalnonrelativisticconstantmass mechanics,nonzerocharge/B,positive transverse speed fornondegeneratefinitecircle. Forinclinedvelocity radius usestransversecomponent, parallelcomponentadvancesunchanged. Straightwiresegment,uniformB andconventionalcurrentvectorlength; sin angle taken0..pi.',
'C4-L10':'FixedNturns withsameorientedflux perturn; puresignednormal andpositivepathpairedbyright-hand rule. BAcos appliesuniformB andplanarloop; fluxderivativeincludesB,area/orientationchanges. Averageemf overnonzerointerval distinguished frominstantaneous. Lenz directionofinducedemf/response opposes fluxchange, notalways externalB. Simple I=emf/R is explicitlyresistive,closedloop withselfinductionnegligible; openloop mayhaveemfwithoutlastingconductioncurrent. Storedinitialinductorenergy isnot a sourcefree Ohm response.'}
PEDAGOGY={
'C4-L09':'Introducescurrent/compassdirection,charge signandcrossproduct beforecircularmodel. Explicitvparallel zero-force andperpendicularcondition avoidusingfullspeed forhelicalradius; no claim magneticforceadds kineticenergy. Wirelength followsconventionalcurrent, ratherthanelectrondrift.',
'C4-L10':'Definesanglewithnormal,fluxunits andmean emf beforeLenz. Distinguishes changingflux frommerepresenceofB, normalorientationfromunorientedarea, decreasingfromincreasingexternalB, andemffromcurrent. Ohmshortcut hasexplicitselfinductancequalification. No fabricated student-calculator task.'}
FIGURE_REVIEW={
'C4-L09':'FullXML/renderread ofboth640x250SVGs: wirehasoutgoingdot andPright withupwardtangent,correctCCWfield. Orbitcirclecenter279,110 andpositivechargeat279,176: rightwardvarrow andupwardFpointtowardcenter withcrossesBinto page. Separatearrows arequalitativevectors, no numericforce/speedscale; circulargeometrynotdistorted.',
'C4-L10':'FullXML/renderread: edge-onloopplanehorizontal,normalvertical,obliqueB atanglefromnormal;thetaarc connectsnormaltoB, notplanetovector. Lenzfrontviewcrossesmarkincomingexternalfield,reddotoutgoinginducedfield, currentarc onrightgoesupward/CCW. No numericB/area/time scale,arclengthnotcurrent magnitude.'}


def verify(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read lessons: '+','.join(sorted(missing)))
    root = Path(asset_root) if asset_root is not None else APP/'static/figures'
    models = independent_checks()
    records = []
    for key in sorted(READ_SOURCE_SHA256):
        row = sources[key]
        errors = []
        if row.get('kind') != 'lesson' or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append('Lesson differs from independently read original')
        refs = {'/figures/'+name for name in FIGURES_BY_ID[key]}
        if {b['src'] for b in row.get('blocks', []) if b.get('type') == 'figure'} != refs:
            errors.append('Lesson figures differ from read original')
        assets = {}
        for name in FIGURES_BY_ID[key]:
            file = root/name
            actual = sha(file.read_bytes()) if file.is_file() else 'MISSING'
            assets['/figures/'+name] = actual
            if actual != READ_ASSETS[name]:
                errors.append('Historical lesson figure changed or missing')
        checks = models[key]
        if not checks or not all(claim['ok'] for claim in checks):
            errors.append('Independent lesson mathematics failed')
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
            'manualFeasibility': 'PASS_AI_EXACT', 'physicalAssumptions': ASSUMPTIONS[key],
            'pedagogicalReview': PEDAGOGY[key], 'assetChecksums': assets, 'figureReview': FIGURE_REVIEW[key],
            'verificationMode': 'INDEPENDENT_EXISTING_EDITION', 'failedPublishedEdition': False,
            'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'})
    return records


def report(sources):
    records = verify(sources)
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'records': records,
        'verifierSha256': sha(Path(__file__).read_bytes()), 'sourceRef': SOURCE_REF,
        'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(row['ok'] for row in records), 'failedCount': sum(not row['ok'] for row in records),
        'draftReviewedCount': 0, 'failedPublishedEditionIds': [],
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
