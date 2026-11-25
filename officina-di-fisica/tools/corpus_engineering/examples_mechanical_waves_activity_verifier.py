"""Independent originals C5-E001..008,51 blocks/four historical SVGs.

E008 arithmetic is correct only after adding fixed tension from the solution;
the original prompt leaves a physically variable wavespeed. Original FAIL kept.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C5.json'
SOURCE_FILE_SHA256='dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422'
BATCH='examples-mechanical-waves-030'
READ_SOURCE_SHA256={
'C5-E001':'7e5730359aa29055e3299704538fc8fef8af2021971296292aa8cf6536f19194',
'C5-E002':'5c3e35ef7130687876f0d478a63c1024fbc51aca8d33da76b760b5d3394625bf',
'C5-E003':'ebab125ffe37c985fb40dbe2c13021f12ce757d832db2e9200896ec7626c7b21',
'C5-E004':'88bd992b66e617e756773f635a06c38b8592a4e51ca435a1c701b102779521ca',
'C5-E005':'12fee297a127a4e159d31f17471d3f2dab3090a1c92b53de4d23727a8368152a',
'C5-E006':'7d5b7e57a6bcc3e0978e65acbc625f8027ba8a2616e72a667a21296ac426d5e7',
'C5-E007':'13e321997c9e68b3a7d2e2378f7ed5d15cb8a7aca67c4c9a74b7483c9e489c01',
'C5-E008':'0dd6349bc0ad11d8b998d2350d5d168b53d2befb497f963fb03a5e7bc47fa76f'}
READ_ASSETS={
'C5-orologio.svg':'88d0ae6a4be838086f101e1e53c8648e8d6ac258e7e2610ecc3ada42726e6e6b',
'C5-istantanea.svg':'d43a90344af8b498b583d626992faf25ef227ba03a0e23b3c6fff7e9d87ff0ff',
'C5-somma.svg':'a8f1e00e24ed8ad239163fcf84ff0eb5848c920d2748b29393769dbe0f55c069',
'C5-sfere.svg':'acdc645c86411fc4b259a623a655074d88e843c4a2bd19cd2af9d2f3922f4f9b'}
FIGURES_BY_ID={'C5-E001':['C5-orologio.svg'],'C5-E002':[],
'C5-E003':['C5-istantanea.svg'],'C5-E004':[],'C5-E005':['C5-somma.svg'],
'C5-E006':[],'C5-E007':['C5-sfere.svg'],'C5-E008':[]}
SOURCE_ISSUES={'C5-E008':'P2 pedagogical prompt ambiguity: fixed tension/wavespeed is added only in worked solution. Same cord can remain taut with T2=4T1 and same mu, then v2/v1=2 and power ratio9/8 rather than9/16. Explicit fixed tension is needed in the prompt.'}
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
    t,x,phase=sp.symbols('t x phase',real=True)
    mu,c,A,w,stension=sp.symbols('mu c A omega tension',positive=True)
    source='actual_source_example_manual_calculation'
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    approximate='actual_source_explicit_optional_or_working_approximation'
    wave=F(3,1000)*sp.cos(4*sp.pi*x+20*sp.pi*t)
    stringP=mu*c*w**2*A**2/2
    pi_work=F(157,50)
    intensity_exact=1/(40*sp.pi)
    intensity_work=1/(40*pi_work)
    sensor_area=F(3,10**4)
    sensor_power=intensity_work*sensor_area
    energy=sensor_power*5
    ratio=F(3,2)**2*F(40,80)**2
    return {
    'C5-E001':[
     check('actual graph amplitude2cm',Q(2,'cm'),F(1,50),'m',source),
     check('actual graph halfsecond period gives2Hz',1/F(1,2),2,'Hz',source),
     check('actual omega exact4pi',2*sp.pi*2,4*sp.pi,'rad/s',source),
     check('optional12point6 isvalidroundedillustration frompibounds',sp.Integer(int(bool(F('12.55')<4*F('3.14') and 4*F(22,7)<F('12.65')))),1,'',approximate),
     check('consecutivecenter crossings onlyhalfperiod',F(1,2)/2,F(1,4),'s'),
    ],
    'C5-E002':[
     check('actual12mm convertedto0point012m',Q(12,'mm'),F(3,250),'m',source),
     check('actual harmonic accelerationminus0point30',-(5**2)*F(3,250),-F(3,10),'m/s^2',source),
     check('initialpositivevelocity andnegativeacceleration lower speedSquared',2*sp.Symbol('v',positive=True)*(-F(3,10)),-F(3,5)*sp.Symbol('v',positive=True),'m^2/s^3'),
     check('negativevelocity withsameacceleration increases speedSquared',2*(-sp.Symbol('v',positive=True))*(-F(3,10)),F(3,5)*sp.Symbol('v',positive=True),'m^2/s^3'),
     check('pulsationSquared position hasaccelerationunits',Q(5,'rad/s')**2*Q(12,'mm'),F(3,10),'m/s^2',source),
    ],
    'C5-E003':[
     check('actual fourcycles infourTenthssecond gives10Hz',F(4,1)/F(4,10),10,'Hz',source),
     check('actual wavelengthfourfifths timesfrequency10 gives8mpersec',F(4,5)*10,8,'m/s',source),
     check('actual crestadvance inquartersecond is2metres',8*F(1,4),2,'m',source),
     check('actual quartersecond isfivehalvesperiods',F(1,4)/(F(1,10)),F(5,2),'',source),
     check('fivehalveswavelengths independentlygives2metres',F(5,2)*F(4,5),2,'m'),
     check('wavelengthfrequencyduration dimensionalproduct',Q(F(4,5),'m')*Q(10,'Hz')*Q(F(1,4),'s'),2,'m',source),
    ],
    'C5-E004':[
     check('actual lambdaonehalf metre',2*sp.pi/(4*sp.pi),F(1,2),'m',source),
     check('actual frequency10hertz',20*sp.pi/(2*sp.pi),10,'Hz',source),
     check('constant phase givesnegative5mpersec',sp.solve(sp.Eq(4*sp.pi*sp.Symbol('v')+20*sp.pi,0),sp.Symbol('v'))[0],-5,'m/s',source),
     check('actual speedmodulus lambdaftimes is5',F(1,2)*10,5,'m/s',source),
     check('material transversevelocity differsfromcrestspeed',sp.diff(wave,t),-F(3,50)*sp.pi*sp.sin(4*sp.pi*x+20*sp.pi*t),'m/s'),
     check('wavephase translatesleft withoutchangingprofile',sp.trigsimp(wave.subs({x:x-5*sp.Symbol('dt'),t:t+sp.Symbol('dt')},simultaneous=True)-wave),0,'m'),
    ],
    'C5-E005':[
     check('actual peak2minus1 gives1cm',Q(2,'cm')+Q(-1,'cm'),1,'cm',source),
     check('actual commonhalfside1minusonehalf givesonehalfcm',Q(1,'cm')+Q(-F(1,2),'cm'),F(1,2),'cm',source),
     check('lineartriangles pointwisesum preserveshalfheight',2*x-x,x,'cm'),
     check('commonverticalscale18pxpercm matchesallthreepeaks',F(52-16,2),18,'1/cm',source),
    ],
    'C5-E006':[
     check('actual pathdifference threefifthsm',F('2.70')-F('2.10'),F(3,5),'m',source),
     check('actual pathdifference overlambda isthreehalves',F(3,5)/F(2,5),F(3,2),'',source),
     check('actual phase3pi ispi modulo2pi',3*sp.pi-2*sp.pi,sp.pi,'rad',source),
     check('equal scalaramplitudes cancel for3pi phase',sp.trigsimp(A*sp.cos(phase)+A*sp.cos(phase+3*sp.pi)),0,'m'),
     check('unequal amplitudes leave residual',sp.trigsimp(2*A*sp.cos(phase)+A*sp.cos(phase+3*sp.pi)),A*sp.cos(phase),'m',probe),
    ],
    'C5-E007':[
     check('actual spherearea16pi squaremetre',4*sp.pi*2**2,16*sp.pi,'m^2',source),
     check('actual exactintensity1over40pi',F(2,5)/(16*sp.pi),intensity_exact,'W/m^2',source),
     check('given pi3point14 workingintensity5over628',intensity_work,F(5,628),'W/m^2',approximate),
     check('workingintensity rounds7point96eMinus3',sp.Integer(int(bool(F('0.007955')<intensity_work<F('0.007965')))),1,'',approximate),
     check('actual sensorarea3eMinus4squaremetres',Q(3,'cm^2'),sensor_area,'m^2',source),
     check('working sensorpower3over1256000 watts',sensor_power,F(3,1256000),'W',approximate),
     check('working sensorpower rounds2point39microW',sp.Integer(int(bool(F('0.000002385')<sensor_power<F('0.000002395')))),1,'',approximate),
     check('exact collectedenergy3over80000pi',intensity_exact*sensor_area*5,3/(80000*sp.pi),'J',source),
     check('workingenergy rounds1point2eMinus5',sp.Integer(int(bool(F('0.0000115')<energy<F('0.0000125')))),1,'',approximate),
     check('actual total emittedenergy2J',F(2,5)*5,2,'J',source),
     check('working sensorfraction aboutsixmillionths',sp.Integer(int(bool(F('0.0000055')<sensor_area/(16*pi_work)<F('0.0000065')))),1,'',approximate),
     check('detectedenergy never exceeds totalemission',sp.Integer(int(bool(energy<2))),1,'',probe),
    ],
    'C5-E008':[
     check('actual fixedwavespeed amplituderatioSquared9over4',F(3,2)**2,F(9,4),'',source),
     check('actual frequencyratioSquaredonequarter',F(40,80)**2,F(1,4),'',source),
     check('worked fixedtensionpowerratio9over16',ratio,F(9,16),'',source),
     check('worked ratiofinite decimal0point5625',ratio,F('0.5625'),'',source),
     check('general samecord ratio retainswavespeedfactor',sp.simplify(stringP.subs({c:2*c,A:F(3,2)*A,w:w/2})/stringP),F(9,8),'',probe),
     check('samecord quadrupletension doubleswavespeed',sp.sqrt(4*stension/mu)/sp.sqrt(stension/mu),2,'',probe),
     check('halvedfrequency withdoubledspeed quadrupleswavelength',((2*c)/(w/2))/(c/w),4,'',probe),
    ]}

MANUAL={
'C5-E001':'ActualSVG A2cm,T1/2s givef2Hz andomega4pi rad/s exactly. The optional12.6 is explicitlyapproximate besideexact4pi;notamandatoryunprovideddecimaltrigstep. Manual3.14<pi<22/7 gives12.56<4pi<12.57143,withinthenearesttenth12.6interval12.55..12.65. Crest-to-crestfullcycleisnotcenter-to-centerhalfcycle;figuretimeanddisplacementunitsagree.',
'C5-E002':'Actual12mm=3/250m. Negativeomega²*x=-25*(3/250)=-3/10m/s². Givenrightwardv>0,2v*a<0mean speeddecreases;afterturnv<0withsamea<0makes2v*a>0andspeedincreases. Pulsationrad/s hasdimension1/s, soomega²*xism/s². No unspecifiedvelocitymagnitudeisneededtofindaorqualitativespeedchange.',
'C5-E003':'Actualfourcyclesin0.40s gives10Hz;pairedspatialfigurelambda0.80mexplicitlybelongstothiswave. Speed(4/5)*10=8m/s,quartersecondadvance2m. IndependentT1/10s givesquartersecond5/2periods and(5/2)*(4/5)=2m. Crestpropagationisnotmaterialpointmotion. Thispromptbindsitsownfrequency10Hz,not2Hzfromtheotheroscillatorfigure.',
'C5-E004':'Actualk4pi rad/m,omega20pi rad/s give lambda2pi/(4pi)=1/2m,f20pi/(2pi)=10Hz. Constantphase4piDeltaX+20piDeltaT=0 yieldsvelocity-5m/s,leftward. Moduluslambda*f=5m/s. Amplitude0.003m istransverse,withparticlevelocitya derivative ratherthanphasevelocity; no decimaltrigcalculationrequired.',
'C5-E005':'Actualpeak2cm+(-1cm)=1cm. Atsharedhalfside1cm+(-1/2cm)=1/2cm. Trianglecoordinatesalignandthethreebaselinesareindependent;18px/cmcommonverticalscaleverifiesallsegments. Smallamplitudelinearityandnondispersiveidealpulsesallowthemtopassafteroverlap.',
'C5-E006':'Actualpathdifference2.70-2.10=3/5m. Dividebylambda2/5m gives3/2cycles,phase3pi equals pi modulo2pi. Coherentinitiallyin-phaseequalarrivingamplitudesofthesamescalarfieldcomponentthereforecancelinP inalinearmedium. Unequalamplitudesleavearesidual. ThisisnotanassertionthatorthogonallypolarizedEMwavescancelmerelyfromequalloudness/intensity.',
'C5-E007':'Actualisotropic0.40W at2m spreadsacross16pi m², intensityexact1/(40pi)W/m². Sourceexplicitlyassignsworkingpiapproximately3.14=157/50, soIwork5/628. Manualcrossmultiplicationbounds0.007955<Iwork<0.007965 justify7.96e-3. Area3cm²=3e-4m²;workingpower3/1256000W lies2.385e-6..2.395e-6 androunds2.39e-6. Exactenergy3/(80000pi)J;workingenergy3/251200J lies1.15e-5..1.25e-5 androunds1.2e-5. Totalemission0.4*5=2J;area fractionabout6millionths. Allapproximationsarelabelledinthesource,andrationalcrossproductsprovideamanualprocedurewithoutunsupporteddivisionprecision.',
'C5-E008':'Originalworked9/16=0.5625iscorrectifmuandwavespeedarefixed. However,thepromptonlysaysthesamecordtaut;fixedtensionisintroducedintheworkedsolution. SamecordmuwithT2=4T1remains taut, givesv2/v1=2andP2/P1=2*(3/2)²*(40/80)²=9/8. Thusoriginalpromptdoesnotuniquelydeterminetheworkedratio. Thisisapedagogical/model-assignmentFAIL,notarithmeticerrorornumericalcalculatorrequirement. No correctededitionisauthoredorapprovedhere.'}
ASSUMPTIONS={
'C5-E001':'Sinusoidalfixedsensordisplacementrelativetoequilibrium;positiveamplitude,crestsmeasurefullperiod. Exact4piaccepted;secondarydecimalexplicitlyapproximate.',
'C5-E002':'Harmonicoscillatoromega5rad/s,positionpositive12mm,instantvelocitypositivebutnonzero. Linearrestoringmodel;accelerationdepends onposition,notmotiondirection.',
'C5-E003':'Sameassignedwaveconnectssnapshotlambdaandlocal10Hzmeasurement,progressiveprofilewithoutdeformation,constantphasevelocityoveraskedinterval. Cresttravelnotmaterialtransport.',
'C5-E004':'x,yinmetres,tinseconds;positivek/omega coefficientswithplussign giveleftmovingprogressiveharmonicprofile. Ratioomega/kisphasevelocitymagnitude,nottransverseparticlespeed.',
'C5-E005':'Alignedtriangularsmall-amplitudepulsesatsamepoints/sametimeinlinearidealmedium;superposephysicaldisplacements,notenergies/intensities. Sameverticalscaleperprompt/figure.',
'C5-E006':'Coherentinitiallyin-phasesources,samewavelengthincommonmedium,equalarrivingscalaramplitudes/samefieldcomponent,linearresponse. CommonpolarizationwouldberequiredforvectorEMgeneralization;notderivedfromequalintensitiesalone.',
'C5-E007':'Idealhomogeneouslosslessisotropicpointsource,positive2mdistance,smallnormalreceivingareauniformlyilluminated,fixedsourcepowerover5s;noextraangularfactor. Sourceworkingpi3.14approximationexplicit. Intermediateandfinalroundingsnotexactidentities.',
'C5-E008':'Arithmeticmodelneedssamemuandwavespeed/tension,smallslopesandprogressiveharmonicwaves. Sametauthysicalcordalonefixesmunottension;solutionaddsfixedtensionabsentfromprompt. OriginalFAILretaineduntilseparatelyauthored/reviewednewdraft.'}
PEDAGOGY={
'C5-E001':'Distinguishespeak-to-peakfromamplitudeandsamephasesuccessivemaxima;exactomegaandoptionalapproximationarebothvisible.',
'C5-E002':'Statespositionsignandvelocitysignbeforeacceleration;separatesnegativeaccelerationfromautomaticdecelerationforallvelocities.',
'C5-E003':'Explicitlycombinesspatialandtemporalmeasurementsforthissamewave,andcrosschecksthroughperiodcountwithoutconfusingmaterialmotion.',
'C5-E004':'Phaseconstancyderivespropagationdirectionratherthanreadingpositiveomegacoefficientasrightwardmotion. Amplitudeisnotwavespeed.',
'C5-E005':'Figurezerosandcommonverticalscaleexplicit;bothpeakandflankcalculationverifypointwiseaddition.',
'C5-E006':'Pathsubtractionandmodulo2pi precedecancellation;coherenceandarrivingamplitudeequalityareexplicit,andunequalamplitudecaseisqualified.',
'C5-E007':'Historicalversion2separatesspherearea,intensity,effectivearea,powerandenergy;explicitpiworkingapproxandapproxsymbolsplusoverallenergyboundallowmanualverification.',
'C5-E008':'FAIL: beforeopeningthesolution,thestudentcannotknowfrompromptalonewhethertensionisheldfixed;theworkedsolutionaddsaconditionthatsetswavespeed. Newdraftmustmakeheldparameterexplicit;reviewermustnotrepairoriginalinplace.'}
FIGURE_REVIEW={
'C5-E001':'C5-orologiofullXML/renderreadin022andbytechecked/re-viewedhere:2cmcrestdistancefrombaseline,T0.50sbetweenmaxima,0.25sbetweenoppositeslopecentercrossings.',
'C5-E002':'No figureinallthreeblocks.',
'C5-E003':'C5-istantaneafullXML/renderandGitbyteschecked;crestspacing176pxmatch0.80mgrid. Newpromptfrequency10Hzistheassignedtimeinput,notthefrequencyfromanotherfigure.',
'C5-E004':'No figureinallfiveblocks;wholefunctionandSIvariablesareexplicit.',
'C5-E005':'C5-sommafullXML/render/Gitbyteschecked;zeros52/119/199withpeakdisplacements36/-18/18px,andhalfsidegeometrypreservespointwisesum.',
'C5-E006':'No figureinallfiveblocks;pathsandwavelengthprovidedtextually.',
'C5-E007':'C5-sferefullXML/render/Gitbyteschecked;circleradii49/98,spherearea4pi*r²labelsexplicitly3Dsurfacesdespite2Dsection. Sourcenumericdataarepromptvalues,notpixelreadings.',
'C5-E008':'No figureinallfiveblocks;thereisnopromptdiagramthatcouldindependentlyspecifyunchangedtension.'}


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
        if key in SOURCE_ISSUES:
            errors.append(SOURCE_ISSUES[key])
        checks = models[key]
        if not checks or not all(claim['ok'] for claim in checks):
            errors.append('Independent example mathematics failed')
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
            'manualFeasibility': 'FAIL_ORIGINAL_EDITION' if key in SOURCE_ISSUES else 'PASS_AI_EXACT', 'physicalAssumptions': ASSUMPTIONS[key],
            'pedagogicalReview': PEDAGOGY[key], 'assetChecksums': assets, 'figureReview': FIGURE_REVIEW[key],
            'verificationMode': 'INDEPENDENT_EXISTING_EDITION', 'failedPublishedEdition': key in SOURCE_ISSUES,
            'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'})
    return records


def report(sources):
    records = verify(sources)
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'records': records,
        'verifierSha256': sha(Path(__file__).read_bytes()), 'sourceRef': SOURCE_REF,
        'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(row['ok'] for row in records), 'failedCount': sum(not row['ok'] for row in records),
        'draftReviewedCount': 0, 'failedPublishedEditionIds': [row['id'] for row in records if row['failedPublishedEdition']],
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
