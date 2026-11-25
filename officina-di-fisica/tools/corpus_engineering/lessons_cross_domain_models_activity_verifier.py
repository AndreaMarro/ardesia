"""Independent full reading of C6-L01..04:21 blocks/one historical SVG.

No questions/exam answer keys are emitted. Model probes are separate from
student-assigned work and no technical fixture measures student mastery.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C6.json'
SOURCE_FILE_SHA256='3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c'
BATCH='lessons-cross-domain-models-025'
READ_SOURCE_SHA256={
'C6-L01':'e8f61f3b0613375b73b01a0ab51df59a2b49eb73372e9001164aac778091d9d8',
'C6-L02':'f8dfb64dd6850447e8505d07e31a803764515d6c6275f1e36437b647e42866ff',
'C6-L03':'551e9a398078936449cc75a1ab6ddf94e8089bda48ba287a6522dba440c6881e',
'C6-L04':'be2f16bc4fb3748414f30a8e93dd7d36b2a82937a0bff96213453140addb3820'}
READ_ASSETS={'C6-pendenza.svg':'adbf3c8b52ee4e4104d7ac77f4502f118fd40d0c8b928fbf1fe819ee5a807aff'}
FIGURES_BY_ID={'C6-L01':[],'C6-L02':[],'C6-L03':['C6-pendenza.svg'],'C6-L04':[]}
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
    v,t,d,tau,area,rho,P,V,current,mass,heatcap,eta,radius,pressure,viscosity,length,x,y,mu,lam,N0,I0=sp.symbols('v t d tau S rho P V i m c eta r dp viscosity length x y mu lambda_d N0 I0',positive=True)
    step=sp.Symbol('n',integer=True,nonnegative=True)
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    actual='actual_source_example_or_figure_manual_calculation'
    boundary='reviewer_boundary_probe_excluded_by_source_conditions'
    poiseuille=sp.pi*pressure*radius**4/(8*viscosity*length)
    linear=80-20*step
    alternate_linear=linear+step*(step-1)*(step-2)
    exponential=80*F(1,2)**step
    alternate_exponential=80-50*step+10*step**2
    return {
    'C6-L01':[
     check('uniform directpath speed timesduration',Q(4,'m/s')*Q(3,'s'),12,'m',probe),
     check('same echo duration giveshalf directdistance',Q(4,'m/s')*Q(3,'s')/2,6,'m',probe),
     check('sum outward andreturn times solves echodistance',sp.solve(sp.Eq(t,d/v+d/v),d)[0],v*t/2,'m'),
     check('two opposite sensors directpath has nohalf factor',sp.solve(sp.Eq(t,d/v),d)[0],v*t,'m'),
     check('sensor response delay mustberemoved beforeechodistance',sp.solve(sp.Eq(t,2*d/v+tau),d)[0],v*(t-tau)/2,'m',boundary),
     check('toy3s observed with1s delay at4mpersec gives4m',F(4*(3-1),2),4,'m',probe),
     check('time minute conversion isnotidentity',Q(1,'minute'),60,'s',probe),
     check('variable speed path needsintegral unlessvmeansaverage',sp.integrate(2*t,(t,0,3)),9,'m',boundary),
    ],
    'C6-L02':[
     check('volume overduration has flowunits',Q(6,'m^3')/Q(3,'s'),2,'m^3/s',probe),
     check('charge overduration has currentunits',Q(6,'C')/Q(3,'s'),2,'A',probe),
     check('energy overduration has powerunits',Q(6,'J')/Q(3,'s'),2,'W',probe),
     check('area times mean normalspeed is volumeflow',Q(2,'m^2')*Q(3,'m/s'),6,'m^3/s',probe),
     check('uniform normal beam intensity timesarea ispower',Q(3,'W/m^2')*Q(2,'m^2'),6,'W',probe),
     check('balance mass divided density recovers volume',Q(6,'kg')/Q(3,'kg/m^3'),2,'m^3',probe),
     check('same density steady massbalance gives equal volumeflow',rho*area*v/rho,area*v,'m^3/s'),
     check('toy incoming3 outgoing2 requires tankaccumulation1',sp.Integer(3-2),1,'m^3/s',boundary),
     check('toy incoming3A outgoing2A leaves chargingcurrent1A',sp.Integer(3-2),1,'A',boundary),
     check('chargingboundary storescharge linearly',sp.diff(2*t,t),2,'A',boundary),
     check('no accumulation implies signed currents sumzero',sp.Integer(3-2-1),0,'A',probe),
     check('constantmassflow withchanged densityneednotconstantvolumeflow', (Q(6,'kg/s')/Q(3,'kg/m^3'))/(Q(6,'kg/s')/Q(2,'kg/m^3')),F(2,3),'',boundary),
    ],
    'C6-L03':[
     check('electrical voltage current duration has energyunits',Q(6,'V')*Q(2,'A')*Q(2,'s'),24,'J',probe),
     check('thermal masscapacitytemperature has energyunits',Q(2,'kg')*Q(3,'J/(kg*K)')*Q(4,'K'),24,'J',probe),
     check('useful thermal increase solves energybalance',sp.solve(sp.Eq(mass*heatcap*sp.Symbol('DeltaT'),eta*V*current*t),sp.Symbol('DeltaT'))[0],eta*V*current*t/(mass*heatcap),'K'),
     check('toy quarterof24J heats2JperK systemby3K',F(1,4)*24/2,3,'K',probe),
     check('usinginverseefficiency wronglycreates96J',F(24,1)/F(1,4),96,'J',boundary),
     check('discardedenergy isinputminususeful',V*current*t-eta*V*current*t,(1-eta)*V*current*t,'J'),
     check('lifting usefulmass requires potentialenergy',Q(2,'kg')*Q(3,'m/s^2')*Q(4,'m'),24,'J',probe),
     check('Celsiustemperature increment equalskelvinincrement',Q(3,'delta_degC'),3,'K',probe),
     check('minute duration cancreatefactor60 error',Q(2,'minute')/Q(2,'s'),60,'',probe),
     check('linear increasingenergy hasconstantpower',sp.diff(P*t+3,t),P,'W'),
     check('constantenergy haszeronetpower',sp.diff(sp.Symbol('Efixed'),t),0,'W'),
     check('flatenergy permitsnonzeroequal inputandoutput',sp.Integer(5-5),0,'W',probe),
     check('time varyingelectricalpower needsintegral',sp.integrate(2*t,(t,0,3)),9,'J',boundary),
    ],
    'C6-L04':[
     check('halving radius atfixed Poiseuilleparameters givessixteenth',poiseuille.subs(radius,radius/2)/poiseuille,F(1,16),'',actual),
     check('halving isotropic distance atfixedpower givesquadruple',(P/(4*sp.pi*(d/2)**2))/(P/(4*sp.pi*d**2)),4,'',actual),
     check('Poiseuille units cubicmetrepersecond',Q(1,'Pa')*Q(1,'m')**4/(Q(1,'Pa*s')*Q(1,'m')),1,'m^3/s',probe),
     check('equal layers multiplytransmissions',sp.exp(-mu*x)*sp.exp(-mu*y),sp.exp(-mu*(x+y))),
     check('successive timeintervals multiplysurvivalfractions',sp.exp(-lam*t)*sp.exp(-lam*tau),sp.exp(-lam*(t+tau))),
     check('attenuation startsatinitialintensity',(I0*sp.exp(-mu*x)).subs(x,0),I0),
     check('population startsatinitialnumber',(N0*sp.exp(-lam*t)).subs(t,0),N0),
     check('source80to60 firstdifference',sp.Integer(60-80),-20,'',actual),
     check('source60to40 seconddifference',sp.Integer(40-60),-20,'',actual),
     check('source80to40 firstratio',F(40,80),F(1,2),'',actual),
     check('source40to20 secondratio',F(20,40),F(1,2),'',actual),
     check('equal differences alone cannotidentifymechanism',sum((alternate_linear-linear).subs(step,j)**2 for j in (0,1,2)),0,'',boundary),
     check('same three linearreadings allowdifferentnextvalue',(alternate_linear-linear).subs(step,3),6,'',boundary),
     check('equal ratios alone cannotidentifymechanism',sum((alternate_exponential-exponential).subs(step,j)**2 for j in (0,1,2)),0,'',boundary),
     check('same three ratioreadings allowdifferentnextvalue',(alternate_exponential-exponential).subs(step,3),10,'',boundary),
    ]}

MANUAL={
'C6-L01':'Source asks model selection from the physical event, not a numerical exercise. Sum echo travel times d/v+d/v to obtain d=v*duration/2; direct opposite-sensor path gives d=v*duration. Reviewer4m/s,3s yields12m direct and6m echo. If observation includes1s sensor delay, the echo distance is4m instead; the source explicitly distinguishes sensor response. One minute is60s. A variable instantaneous speed needs an integral or a specified average, not an unqualified product. These are constructed reviewer cases, not evidence of student diagnosis or mastery.',
'C6-L02':'Volume, charge and energy per second yield m³/s,A,W respectively despite sharing a time denominator. Integrating a normal velocity profile over the section gives Qv=S*vbar, where vbar is the area mean normal velocity; uniform normal intensity gives receivedP=I*S. Mass collection converts tovolume only through density. Reviewer6units/3s gives2 in each appropriate dimension; area2m²*3m/s gives6m³/s, while2m²*3W/m² gives6W. Conservation is incoming-minus-outgoing equals accumulation. Tank3in/2out stores1m³/s; a chosen charge-storing boundary3Ain/2Aout stores1C/s. Include capacitor branch current to retain Kirchhoff balance rather than declaring KCL invalid. Different densities can preserve massflow without equal volumeflow, outside the incompressible premise.',
'C6-L03':'Source actual relations are symbolic. Constant electricalP=V*i overduration gives Ein=V*i*duration, and useful fractioneta gives DeltaT=eta*Ein/(mass*c) when phase/capacity changes and other storage are absent. Reviewer6V*2A*2s gives24J; quarter useful gives6J, heating capacity2J/K by3K. Dividing byquarter instead gives96J and exposes an invalid energy gain. Celsius increments andkelvin increments agree; minutes need60 conversion. Liftingmgh is energy and inputminususeful islost/storedoutsideusefulsystem. E(t)=Einitial+P*t has slopeP; a plateau haszero netP, compatible with nonzeroequal5Win/5Wout. The qualitativeSVG has no calibrated numbers and supports these signs, not a numerical heating rate. Variablepower requiresintegration, not the constant shortcut.',
'C6-L04':'Actual qualitative halving comparisons: Q proportional r⁴ gives1/16; I proportional1/d² gives4 when distancehalves, with other parameters fixed. Source80,60,40 differencesare-20,-20;80,40,20 ratiosare1/2,1/2. Equal-layer transmissions and equal-time survivals multiply, with dimensionless mu*x orlambda_d*t and initialfractionone. The text says three points suggest models and must be checked against mechanism; exact counterexamples confirm nonuniqueness: addingn(n-1)(n-2) to80-20n matches firstthree points but differsby6 atn3; quadratic80-50n+10n² matches80,40,20 but gives20 ratherthan10next. No arbitrary exponential/log decimal evaluation is assigned.'}
ASSUMPTIONS={
'C6-L01':'Identified system/event and matching units; uniform speed for the stated product, fixed reflector/coincident stationary sender/receiver for simple echo. Response delay not automatically propagation. No inference of student difficulty from one wrong answer, as source explicitly warns.',
'C6-L02':'Incompressible liquid and cross-sectional area-mean normal velocity for Qv=S*vbar. Uniform normal beam and small receiving area forP=I*S. Volume/mass distinctions requiredensity. Steady boundary with no relevant accumulation for equal incoming/outgoing sums; include all branches or storage terms in a transient. Source is a sufficient steady model, not a claim KCL stops applying to a complete circuit with capacitors.',
'C6-L03':'Positive input electricalpower by chosen energy-arrow convention, constant productV*i overinterval. Usefulfraction0<=eta<=1 without additional unmodelled energy sources. Constant mass/specificheat, no phasechange or materialtemperature dependence inmcDeltaT model. System boundary specifies container/loss/storage; thermal isolation isnot a denial of electrical work input. Energyplateau meansnet balancezero, not absenceoftransfer.',
'C6-L04':'Named Poiseuille model: rigid circular tube, steady fullydeveloped laminar Newtonian incompressible flow, constantviscosity/no-slip and fixed pressure drop/length. Isotropic point-source lossless propagation at fixedpower forinverse-square. Constant attenuationcoefficient anddecayhazard for exponentials, nonnegative interval. Three measurements alone do not identify a unique physical model or license unlimited extrapolation.'}
PEDAGOGY={
'C6-L01':'Connects measurement unit, physical system and event before equation choice; repeated varied cases are suggested ratherthan diagnosing from one failure. Reviewer fixtures do not certify student calibration.',
'C6-L02':'Shared area/time structure is contrasted with distinct transported quantities anddimensions. Chosen arrows support signed balance and explicit storage checks; doesnotidentifycharge/currentwithenergy/power.',
'C6-L03':'Boundary and energy arrows precede equations, efficiency is usefulfraction, timeunits/energyupperbound are sanitychecks. Slope isnet power andsource caption explicitlypermitszero netbalance, avoiding the claim a plateau mustbe isolated.',
'C6-L04':'Identifies held variables before scaling and distinguishes constantdifferences from constantratios. Explicitly requires physicalmechanism and initialcondition, so finite-data nonuniqueness is not concealed.'}
FIGURE_REVIEW={
'C6-L01':'No figure in the complete original; learner is asked to construct a system-boundary sketch, not to read unprovided numeric scales.',
'C6-L02':'No figure in the complete original; drawing signed transport arrows is a suggested reasoning procedure. No missing external numerical simulation is invoked.',
'C6-L03':'CompleteXML/render ofC6-pendenza.svg: energyvertical,timehorizontal. Risingline(105,160)to(260,78), thenhorizontalto(427,78);positive physicalslope thenzero. Labels heating/constantenergy agree. No numericaxisunit calibration; captionnetbalance andfooterpowerinwatts aredimensionallyconsistent.',
'C6-L04':'No figure in the complete original; three-reading arithmetic and multiplicative patterns are explicit textdata, not inferred from a drawing.'}


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
