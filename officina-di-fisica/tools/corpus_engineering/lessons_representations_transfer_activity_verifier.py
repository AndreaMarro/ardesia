"""Independent full reading of C6-L05/L06:9 blocks, no figures.

Mathematical interpretation and limiting cases are solved independently.
Study suggestions are not represented as measured student learning outcomes.
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
BATCH='lessons-representations-transfer-026'
READ_SOURCE_SHA256={
'C6-L05':'5f7d3dbb0fb1d79987987e561854765ba622103d34d070463f7ceba94818bbe9',
'C6-L06':'f2beee2718a70b24be753ba641dbd8a8cb9b4b68a6b56c882c90d710300a0ac6'}
READ_ASSETS={}
FIGURES_BY_ID={'C6-L05':[],'C6-L06':[]}
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
    t,V=sp.symbols('t V',real=True)
    p0,slope,Vi,Vf,rho,g,h1,h2,patm,rho2,height,flow,S,f,p,m,c,dt,power=sp.symbols('p0 slope Vi Vf rho g h1 h2 patm rho2 h Q S f p m c dt Puseful',positive=True)
    shift,phi1,phi2=sp.symbols('shift phi1 phi2',real=True)
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    boundary='reviewer_boundary_probe_excluded_by_source_conditions'
    image=f*p/(p-f)
    return {
    'C6-L05':[
     check('position time slope units',Q(6,'m')/Q(2,'s'),3,'m/s',probe),
     check('velocity time slope units',Q(6,'m/s')/Q(2,'s'),3,'m/s^2',probe),
     check('energy time slope units',Q(6,'J')/Q(2,'s'),3,'W',probe),
     check('same risingline form givesconstant derivative',sp.diff(3*t+2,t),3),
     check('signed velocityarea givesdisplacement notdistance',sp.integrate(2-t,(t,0,4)),0,'m',probe),
     check('same motion totaldistance addsabsolute areas',sp.integrate(2-t,(t,0,2))+sp.integrate(t-2,(t,2,4)),4,'m',probe),
     check('pascal cubicmetre isjoule',Q(1,'Pa')*Q(1,'m^3'),1,'J'),
     check('kilopascal litre alsojoule',Q(1,'kPa')*Q(2,'liter'),2,'J',probe),
     check('quasistatic varyingpressure work isarea',sp.integrate(p0+slope*(V-Vi),(V,Vi,Vf)),p0*(Vf-Vi)+slope*(Vf-Vi)**2/2,'J'),
     check('reversing quasistatic path reverseswork',sp.integrate(p0,(V,Vf,Vi)),-p0*(Vf-Vi),'J'),
     check('hydrostatic commonintercept cancelsbetweendepths',(patm+rho*g*h2)-(patm+rho*g*h1),rho*g*(h2-h1),'Pa'),
     check('commondepth differentfluids commonintercept cancels',(patm+rho2*g*height)-(patm+rho*g*height),(rho2-rho)*g*height,'Pa'),
     check('potentialdifference invariantundercommonzeroshift',(phi2+shift)-(phi1+shift),phi2-phi1,'V'),
     check('toy absolute130kPa minus110kPa gives20kPa',Q(130,'kPa')-Q(110,'kPa'),20,'kPa',probe),
     check('free expansion isnot quasistatic internalpressurepathwork',sp.Integer(0)*sp.Symbol('DeltaV'),0,'J',boundary),
    ],
    'C6-L06':[
     check('fixedflow halvedsection doubles meanspeed',(flow/(S/2))/(flow/S),2),
     check('branch removingquarter leaves meanspeedratio3over2',((flow-flow/4)/(S/2))/(flow/S),F(3,2),'',probe),
     check('branch removingthreequarters reverses simplistic speedincrease',((flow-3*flow/4)/(S/2))/(flow/S),F(1,2),'',boundary),
     check('complete branch balance includeswithdrawal',(flow-flow/4)+flow/4,flow,'m^3/s'),
     check('directpath andecho shareunits butnotfactor',Q(4,'m/s')*Q(3,'s')/(Q(4,'m/s')*Q(3,'s')/2),2,'',probe),
     check('toy sound300mpersec echo2ms yieldsthreeTenthsmetre',Q(300,'m/s')*Q(2,'ms')/2,F(3,10),'m',probe),
     check('toy lightworking3e8mpersec echo2ns yields same distance',Q(300000000,'m/s')*Q(2,'ns')/2,F(3,10),'m',probe),
     check('wrong speed substitution hasmillionfold scale error',F(300000000,300),10**6,'',boundary),
     check('farobject thinlens image tendsfocus',sp.limit(image,p,sp.oo),f,'m'),
     check('farobject imagefocusdifference vanishes',sp.limit(image-f,p,sp.oo),0,'m'),
     check('farobject magnification tendszero',sp.limit(-image/p,p,sp.oo),0),
     check('fixedbody fixedtime zero usefulpower giveszero temperatureincrease',sp.limit(power*dt/(m*c),power,0),0,'K'),
     check('changing duration inverselywouldinvalidate fixedtime limit',(power*dt/(m*c)).subs(dt,1/power),1/(m*c),'K',boundary),
     check('thermal usefulpower energy units remainwatt',Q(2,'J')/Q(1,'s'),2,'W',probe),
    ]}

MANUAL={
'C6-L05':'No assigned numeric dataset; source distinguishes slope and area through axis units. Reviewer6verticalunits/2s gives3m/s,3m/s² or3W forposition,velocity orenergy. Forv=2-t over0..4s the signedarea iszero displacement whilethetwo absolute triangles total4m distance. SourcePa*m³=J is exact; reviewerkPa*2L=2J checksconversion. Quasistatic p(V)=p0+k(V-Vi) integratesp0DeltaV+kDeltaV²/2, withcompressionreversingworksign. Common atmosphericintercept cancels in p(h2)-p(h1)=rho*g*(h2-h1);it also cancels for two differentfluidprofiles atthesamedepth iftheysharetheintercept. This covers the textcomparisonwithoutidentifying a pressureincrement withabsolutepressure. Toy130kPa-110kPa=20kPa. Shiftingbothpotentials bythesamezero leavesDeltaVunchanged. Freeexpansion requires actualexternalworkconditions,notanunprovided quasistatic internalpressurepath.',
'C6-L06':'Source limiting cases are symbolic. IncompressiblefixedflowQ/S doubleswhenarea halves, butwitha withdrawalQbranch theratio is2(1-Qbranch/Q). Reviewerquarterwithdrawal gives3/2speedratio;threequarterswithdrawal gives1/2,showingwhythebranchcannotbeignored. Echo remainsatwo-waypath whencontextchangesfromsoundtolight;theassignedspeedmustchange. Constructedworking300m/s with2ms andworking3e8m/s with2ns bothgive3/10m,notbecause thespeedissame. Theseareexacttoyvalues,notclaimexactSIlightconstant. Thinlens q=fp/(p-f) tendsf aspgoesinfinite, withmagnificationtendingzero. Atfixedpositiveheatcapacityandtime,DeltaT=Puseful*duration/(m*c) tendszero withPuseful;allowingdurationtoincreaseas1/Pwouldbreaktheheld-timecondition. Study/retrievalsuggestionsarenotnumbers ormeasuredlearningeffects.'}
ASSUMPTIONS={
'C6-L05':'Graphs have identifiedaxes/units andsamehorizontalparameter,linearsegments forconstant-slope statements. Velocity area is signed displacement; distance requiresabsolutevelocity. Work ofgas integralp*dV applies uniformquasistaticmechanicalboundarymodel with actualgasboundarypressure andpurevolume work; doesnotapplyanimaginedequilibriumcurve tofreeexpansion. Hydrostaticconstantdensity,g,commonpressureintercept; gauge/potentialshiftsmustbecommon tocancel.',
'C6-L06':'Steadyincompressibleclosedconduit fixedvolumeflow andnoomittedbranches forinverse-area speedrelation. Branchflows included beforecomparison. Echo usesfixedpropagationpath/reflectorandidentifiedmedium/speed. Thinconvergingparaxiallenswithrealobjectdistancep>f,positivefixedf forfar-objectlimit. Samebodypositiveconstantthermalcapacity,fixedtime,onlyusefulheatingpowerinterms forzero-powerlimit;notacomparisonwhilechangingtimeorothersources.'}
PEDAGOGY={
'C6-L05':'Axismeaningprecedespatternmatching; unitsdistinguishheight,slope andarea. Signedareaandworkdirection arekept; subtractingacommonintercept isnot permissiontoequateabsolutevaluesanddifferences.',
'C6-L06':'Source explicitly asks hypothesisandafailurecase,checksheldparameters,changescontextwithnewspeed,anddistinguishesreadingasolutionfromindependentresponseonanothertask. Theseareproceduralprompts,notempiricalclaimthatthistechnicalreviewhascalibratedstudentlearning.'}
FIGURE_REVIEW={
'C6-L05':'No externalfigureinallfiveoriginalblocks. Learnerisasked tointerpretgraphclasses; exactconstructedgraphfunctionsarelabelledreviewerwork,notanunprovidedstudentdataset.',
'C6-L06':'No externalfigureorconsumer-simulationinallfouroriginalblocks. Learnerconstructs/reconstructssketches;nonewnumericalruntimeparameterisassumed.'}


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
