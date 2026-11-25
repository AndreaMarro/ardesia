"""Independent review of C4-E017..020:23 blocks/two historical SVGs.

Historical E017/E019 are already version2 at pinned Cric, not drafts authored
here. Exact arithmetic and explicitly qualified significant-figure rounding.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C4.json'
SOURCE_FILE_SHA256='19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c'
BATCH='examples-magnetic-induction-029'
READ_SOURCE_SHA256={
'C4-E017':'2e551e3b43a9ae5fc7cf9cd8b5badf9f3aa5d66aafb9c8015f6c4114da24b96f',
'C4-E018':'ea514e4d4670843fb70e9d70ebee7277657f6b685ed6ce5bfbb665700c23a623',
'C4-E019':'495cf48ec2b2d9e9e8f77740d527f77a70dd51c4a372dd69d1b1f05233ee1585',
'C4-E020':'6ae64210d1fa577c152f00e883ca7bc1966ccb29c1eaec306401a03ac5e800ba'}
READ_ASSETS={'C4-orbita.svg':'3c95346817907b8731c5b62f7880236e4b97c2411770f9bc617dcc576d89b3c5',
'C4-lenz-decrescente.svg':'c48efc27347a24e10ace757e58d61ed6942e987512d7e6b8623bbc4141914071'}
FIGURES_BY_ID={'C4-E017':['C4-orbita.svg'],'C4-E018':[],'C4-E019':[],'C4-E020':['C4-lenz-decrescente.svg']}
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
    mass,charge,speed,B=F('1.67')*sp.Integer(10)**(-27),F('1.60')*sp.Integer(10)**(-19),sp.Integer(2)*10**5,F(1,10)
    momentum=mass*speed;qb=charge*B;radius=momentum/qb
    N,area,duration=40,F(5,10**4),F(20,1000)
    deltaB=F(30-10,100);dflux=area*deltaB
    t,A,rate,Binitial,R,L,Eabs=sp.symbols('t A rate Binitial R L Eabs',positive=True)
    flux=-A*(Binitial-rate*t)
    emf=-sp.diff(flux,t)
    induced=-Eabs/R*(1-sp.exp(-R*t/L))
    actual='actual_source_example_manual_calculation'
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    conceptual='independent_physical_derivation_no_assigned_numeric_calculation'
    return {
    'C4-E017':[
     check('actual momentum334eMinus24',momentum,F('3.34')*sp.Integer(10)**(-22),'kg*m/s',actual),
     check('actual chargefieldproduct160eMinus22',qb,F('1.60')*sp.Integer(10)**(-20),'kg/s',actual),
     check('actual charge times tesla units kgpersecond',Q(charge,'C')*Q(B,'T'),qb,'kg/s',actual),
     check('actual exact radius167Over8000m',radius,F(167,8000),'m',actual),
     check('actual exact centimetres167Over80',Q(radius,'m'),F(167,80),'cm',actual),
     check('source2point1cm roundingwithinhalfunitlastdecimal',sp.Integer(int(bool(F(205,100)<radius*100<F(215,100)))),1,'',actual),
     check('independent centripetal equation agrees',charge*speed*B,mass*speed**2/radius,'N'),
     check('charge signflip doesnot changeradius',mass*speed/abs(-charge*B),radius,'m'),
    ],
    'C4-E018':[
     check('actual8cm convertedto0point080m',Q(8,'cm'),F(8,100),'m',actual),
     check('actual wireforcemagnitude0point040N',Q(2,'A')*Q(8,'cm')*Q(F(1,4),'T'),F(4,100),'N',actual),
     check('rightcurrent cross upwardfield pointsout',sp.Matrix([1,0,0]).cross(sp.Matrix([0,1,0]))[2],1),
     check('reversedcurrent alone pointsin',sp.Matrix([-1,0,0]).cross(sp.Matrix([0,1,0]))[2],-1),
     check('perpendicular angle sine isone',sp.sin(sp.pi/2),1),
     check('parallelfield wireforcezero',sp.Matrix([1,0,0]).cross(sp.Matrix([1,0,0])).dot(sp.Matrix([1,1,1])),0,'N',probe),
    ],
    'C4-E019':[
     check('actual5squarecm means5eMinus4squaremetres',Q(5,'cm^2'),area,'m^2',actual),
     check('actual20ms isonefiftiethsecond',Q(20,'ms'),duration,'s',actual),
     check('actual fieldchangeonefifthtesla',deltaB,F(1,5),'T',actual),
     check('actual singleturn fluxchange1eMinus4weber',dflux,F(1,10**4),'Wb',actual),
     check('actual40turn fluxlinkchange0point004weber',N*dflux,F(4,1000),'Wb',actual),
     check('actual meanemfmagnitudeonefifthvolt',N*dflux/duration,F(1,5),'V',actual),
     check('fluxchange persecond voltageunits',Q(N*dflux,'Wb')/Q(duration,'s'),F(1,5),'V',actual),
     check('doublingduration halvesmeanemf',N*dflux/(2*duration),F(1,10),'V'),
     check('signedemf negativeforincreasingpositiveflux',-N*dflux/duration,-F(1,5),'V'),
    ],
    'C4-E020':[
     check('outwardnormal incomingdecreasingflux givesnegativeemf',emf,-A*rate,'V',conceptual),
     check('negativepositiveCCW orientation means clockwise',emf/(A*rate),-1,'',conceptual),
     check('passiveresistive inducedresponse hasnegativecurrent',emf/R,-A*rate/R,'A',conceptual),
     check('zero initial RLresponse followsnegativeemf',L*sp.diff(induced,t)+R*induced,-Eabs,'V',conceptual),
     check('stoppedexternalfieldchange haszeroforcingemf',(-sp.diff(-A*Binitial,t)),0,'V',conceptual),
     check('storedinductive current neednotvanishwhen forcingends',L*sp.diff(-sp.exp(-R*t/L),t)+R*(-sp.exp(-R*t/L)),0,'V',conceptual),
    ]}

MANUAL={
'C4-E017':'Actual mv=(1.67e-27)*(2e5)=3.34e-22kg*m/s;absq*B=(1.60e-19)*0.10=1.60e-20kg/s. Divide334/160 times10^-2m=167/8000m=0.020875m=167/80cm=2.0875cm. A transparent manualdivision is167/80=2+7/80=2+0.0875. SpeedandB have2significantfigures;the source explicitlyrequestsfinal2.1cm,notanexactidentityequatingthatroundingwith2.0875.2.0875liesbetween2.05and2.15. Independently qvB=mv²/r. Charge signchangescurvature,notradius. Classicalspeednonrelativisticandassignedworkingmass/charge;actualnumericdataaresufficientwithoutcalculator.',
'C4-E018':'Actuallength8cm=8/100m.2*(8/100)*(1/4)=4/100N=0.040N becauseperpendicularsinangleone. Right-handed xright,yup,zout givesx crossy=z,outofthepage. Reversingonlycurrentgivesminusz; parallelfieldwouldgivezeroforce. Exactintegerfractionsandcrossproductdirections, no decimaltrigneeded.',
'C4-E019':'Actualarea5cm²=5e-4m²,20ms=1/50s. Fieldchange0.30-0.10=1/5T;one-turnfluxchange(5e-4)/5=1e-4Wb.40turnsgive4e-3Wbfluxlinkage;divideby0.02s gives0.20Vmodulus. Fieldparalleltonormalso cosineone. Signedemfnegativeforchosenpositivenormalalongincreasingfield,butonlymodulusisasked. Doublingdurationgivestenthvolt. Uniformrampmakesinstantaneousforcingconstantoverinterval;noinductanceorloadcurrentissolved.',
'C4-E020':'No numericalstudentcalculationassigned;directionismagneticinduction/Lenzresponse. ChooseoutwardnormalandpositiveCCWpath. IncomingdecreasingfieldhasPhi=-A*(Binitial-rate*t),derivative+Arate,so inducedemf=-Arate andresponseclockwise,producingincomingfield. A passivezeroinitialRLresponsehasI=-Eabs/R*(1-exp(-Rt/L)),sameinduceddirection. Thisdoesnotinferanypossiblepreexistingtotalcurrentfroma fluxderivativealone. Onstoppingthefieldvariationitsforcingemfvanishes;aninductorcurrentcanpersistanddecay,whichthesourcecorrectlydoesnotdeny. Figureisphysicallychecked,notwaivedforlackofnumbers.'}
ASSUMPTIONS={
'C4-E017':'Protonwithgivenroundedworkingmass/charge,uniformBperpendiculartovelocity,magneticforcealone,classicalnonrelativisticconstantmassmotion. Positiveq,nonzerov/B. Exactintermediatevaluesrelativetoprovideddata,roundedfinal2significantfiguresexplicit. Diagramonlyonepossibleentryorientation,numericradiusnotfrompixels.',
'C4-E018':'Straight8cmsegmentuniformlyimmersedinassigneduniformB,conventionalcurrentright,fieldliteralupinthepage;right-handedcoordinateframe. Wire/fieldperpendicularandmagneticforceisolatedfromothermechanicalforces.',
'C4-E019':'40fixedturnseachsame5cm²area,planesperpendiculartoBso normalsparallel;uniformfieldchangeineachturnandspecifiedtimeinterval. f.e.m.meanmodulusfromgivenflux,ratherthanloadcurrentortwopointconservativepotentialdrop. Area/temporalprefixesconvertedbeforenumericwork.',
'C4-E020':'Directionoftheinducedresponseofthepassivelooptothegivenfieldchange;nottotalcurrentunderanunprovidedindependentinitialcurrent/energysource. Positiveorientationpairedwithoutwardnormal. No assertioninstantaneousinductorcurrentequalsforcingemf/R forallhistories;sourceonlystatesforcingemfvanisheswhenexternalvariationstops.'}
PEDAGOGY={
'C4-E017':'Historicalversion2separatesmomentumandchargefieldproduct,convertscentimetresandexplicitlyqualifiessignificantfigures. Finitedecimaldivisionismanuallyreproducible. Signaffectscurvatureside,notradiusmodulus.',
'C4-E018':'Convertscentimetresandstatesvectorlengthconventionalcurrentdirection,thengiveshandedness. Doesnotconfuseelectronvelocitywithconventionalcurrent.',
'C4-E019':'Historicalversion2separatesone-turnfluxfromN-turnlinkageandduration;asksmeanemfnotcurrentorimpulse. Squarecentimetre/msconversionandunitWb/s=Varedocumented.',
'C4-E020':'Explicitlydecreasingincomingfieldrequiresinducedincomingfield;notalwaysoppositeexternalB. Endswithvanishingforcingemf,ratherthanfalselyclaiminginstantaneouszeroinductivecurrent.'}
FIGURE_REVIEW={
'C4-E017':'C4-orbitaXML/fullrenderreadpreviouslyandbyte-revalidated/re-viewedhere:positivechargeatbottom,circularcenterabove,velocityrightandcentripetalforceupinBcrosses. Sourcecaptionexplicitlypossibleentryorientation;nopromptBpageorientationornumericrscaleisinferred.',
'C4-E018':'No figureinallthreeblocks;right/up/outframeexplicittext.',
'C4-E019':'No figureinall eightblocks;area,turncount,field/timeandnormalrelationshipareexplicitprompt/text.',
'C4-E020':'CompleteXML/newfullrenderofC4-lenz-decrescente.svg:externalcrossesincoming;redinducedcrosscenterincoming;redright-sidearcfrom367,83to369,150withSVGsweep1goesdown/rightside,clockwisefrontview. Notmistakenwiththeearlierincreasing-fieldCCWfigure. Qualitativedirections,numericfieldsnotassigned.'}


def verify(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read examples: '+','.join(sorted(missing)))
    root = Path(asset_root) if asset_root is not None else APP/'static/figures'
    models = independent_checks()
    records = []
    for key in sorted(READ_SOURCE_SHA256):
        row = sources[key]
        errors = []
        if row.get('kind') != 'example' or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append('Example differs from independently read original')
        refs = {'/figures/'+name for name in FIGURES_BY_ID[key]}
        if {b['src'] for b in row.get('blocks', []) if b.get('type') == 'figure'} != refs:
            errors.append('Example figures differ from read original')
        assets = {}
        for name in FIGURES_BY_ID[key]:
            file = root/name
            actual = sha(file.read_bytes()) if file.is_file() else 'MISSING'
            assets['/figures/'+name] = actual
            if actual != READ_ASSETS[name]:
                errors.append('Historical example figure changed or missing')
        checks = models[key]
        if not checks or not all(claim['ok'] for claim in checks):
            errors.append('Independent example mathematics failed')
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'NO_STUDENT_CALCULATION' if key=='C4-E020' else 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
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
