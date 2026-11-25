"""Independent originals C5-E001..008,51 blocks/four historical SVGs.

E008 arithmetic is correct only after adding fixed tension from the solution;
the original prompt leaves a physically variable wavespeed. Original FAIL kept.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
import re
import xml.etree.ElementTree as ET
from .pipeline import digest,sha
from .review_contract import reviewed_rows
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
REVISION_IDS={'C5-E008'}
# Frozen only after independent full reading of29blocks and the complete native
# Chromium SVG render, not supplied by or copied from the authoring assembler.
REVIEWED_REVISIONS={'C5-E008':'615c16f5f7e39a7e33cb8e01e2140781dd2eca8da866246d000da338a69e9b2d'}
REVISION_ASSETS={'string-power-factors.svg':'194b261af76ab3c33d85a95bdfd9699770fb7ee60f2c8b46228723076f5723b9'}
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


def verify_originals(sources, asset_root=None):
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


def _bounded_latex_fraction(text):
    """Only the finite positive integer fractions actually present in this draft."""
    match=re.fullmatch(r'\\frac(?:\{(\d{1,3})\}|(\d))(?:\{(\d{1,3})\}|(\d))',text)
    if not match:return None
    numerator,denominator=int(match[1] or match[2]),int(match[3] or match[4])
    return sp.Rational(numerator,denominator) if denominator else None


def revised_checks(row,asset_root):
    checks=[dict(claim) for claim in independent_checks()['C5-E008']]
    for claim in checks:
        claim['scope']=('boundary_case_excluded_by_new_explicit_fixed_tension'
                        if claim['scope'].startswith('reviewer_') else 'new_draft_actual_worked_calculation')
    F=sp.Rational
    mu,c,omega,A,u=sp.symbols('mu c omega A phase',positive=True)
    ratio=F(3,2)**2*F(1,2)**2
    fixed='new_draft_actual_worked_calculation'
    prompt=' '.join(row.get('prompt','').split()).casefold()
    clauses=('densità lineare μ costante','tensione t è mantenuta allo stesso valore positivo',
             'progressive sinusoidali','pendenze piccole','senza riflessioni o perdite apprezzabili')
    inputs=('a₁=2 mm','a₂=3 mm','f₁=80 hz','f₂=40 hz')
    checks.extend([
      check('new prompt explicitly fixes physical model and parameters',sp.Integer(int(all(clause in prompt for clause in clauses))),1),
      check('new prompt keeps independently solved input values',sp.Integer(int(all(value in prompt for value in inputs))),1),
      check('period average independently gives onehalf',sp.integrate(mu*c*omega**2*A**2*sp.sin(u)**2,(u,0,2*sp.pi))/(2*sp.pi),mu*c*omega**2*A**2/2,'W'),
      check('new SI power identity kgmSquaredpersecondCubed is watt',SI.Quantity(1,'kg*m^2/s^3'),1,'W',fixed),
      check('new mm ratio cancels common prefix',SI.Quantity(3,'mm')/SI.Quantity(2,'mm'),F(3,2),'',fixed),
      check('new angularfrequency ratio cancels2pi',(2*sp.pi*40)/(2*sp.pi*80),F(1,2),'',fixed),
      check('new intermediate amplitude-only ratio9over4',F(3,2)**2,F(9,4),'',fixed),
      check('new final ratio9over16',ratio,F(9,16),'',fixed),
      check('new transversevelocity ratio3over4',F(3,2)*F(1,2),F(3,4),'',fixed),
      check('new ratio exceeds onehalf byonesixteenth',ratio-F(1,2),F(1,16),'',fixed),
      check('new inverse positiveamplitude recovers3over2',sp.sqrt(ratio)/F(1,2),F(3,2),'',fixed),
    ])
    power_values=[];inverse_values=[]
    for block in row.get('blocks',[]):
        if block.get('type')!='formula':continue
        text=block.get('text','')
        if text.startswith(r'\frac{P_2}{P_1}='):
            value=_bounded_latex_fraction(text.split('=',1)[1])
            if value is not None:power_values.append(value)
        if text.startswith('a='):
            value=_bounded_latex_fraction(text.rsplit('=',1)[-1])
            if value is not None:inverse_values.append(value)
    checks.append(check('new draft exposes one exact numerical power result',sp.Integer(len(power_values)),1))
    if len(power_values)==1:checks.append(check('printed power result equals independent ratio',power_values[0],ratio,'',fixed))
    checks.append(check('new draft exposes one exact numerical inverse result',sp.Integer(len(inverse_values)),1))
    if len(inverse_values)==1:checks.append(check('printed inverse result equals independent amplitude ratio',inverse_values[0],sp.sqrt(ratio)/F(1,2),'',fixed))
    try:
        svg=ET.fromstring((Path(asset_root)/'string-power-factors.svg').read_bytes())
        bars=[el.attrib for el in svg.iter() if el.tag.endswith('rect')
              and el.attrib.get('x')=='60' and el.attrib.get('height')=='40']
        checks.append(check('new diagram has three common-baseline same-height bars',sp.Integer(len(bars)),3))
        if len(bars)==3:
            widths=[F(el['width']) for el in bars]
            checks.extend([
                check('new diagram scale128pixels per relativeunit',widths[0],128),
                check('new diagram intermediate relativewidth9over4',widths[1]/widths[0],F(9,4)),
                check('new diagram final relativewidth9over16',widths[2]/widths[0],ratio)])
    except (OSError,ET.ParseError,ValueError,ZeroDivisionError):
        checks.append(check('new diagram must be locally readable with valid bar geometry',sp.Integer(0),1))
    return checks


def verify(sources,package=None,bindings=None,asset_root=None,original_asset_root=None):
    historical_root=original_asset_root if original_asset_root is not None else asset_root if package is None else None
    originals=verify_originals(sources,historical_root)
    if package is None:
        if bindings is not None:raise ValueError('Bindings require a revision package')
        return originals
    if bindings is None:raise ValueError('Revision package requires complete source bindings')
    root=Path(asset_root) if asset_root is not None else APP/'editorial/assets'
    byid={record['id']:record for record in originals}
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_REVISIONS,REVISION_IDS,root):
        key=row['id'];original=byid[key]
        if (binding['sourceRef']!=SOURCE_REF or binding['sourceId']!=key
                or binding['sourceSha256']!=original['sourceSha256']
                or original['sourceSha256']!=READ_SOURCE_SHA256[key]):
            errors.append('Revision not bound to independently read original source')
        if (row.get('kind')!='example' or 'answer' in row
                or type(row.get('version')) is not int or type(row.get('baseVersion')) is not int
                or row['version']!=original['sourceVersion']+1 or row['baseVersion']!=original['sourceVersion']):
            errors.append('Expected additive next example edition with correct base and no answer key')
        if binding.get('assetChecksums')!=REVISION_ASSETS:
            errors.append('Revision figure differs from independently read protected asset')
        checks=revised_checks(row,root)
        if not checks or not all(claim['ok'] for claim in checks):
            errors.append('Independent new draft mathematics or physical domain failed')
        revised=dict(original)
        revised.update(ok=not errors,errors=errors,checks=checks,
            dimension={claim['claim']:claim['dimension'] for claim in checks},
            manualFeasibility='PASS_AI_EXACT' if not errors else 'FAIL_NEW_DRAFT',
            manualArithmetic='NEW DRAFT: same positive tension and linear density now explicitly fix v=sqrt(T/mu). Mean travelling-wave flux averages sin² to1/2, so Pmean=mu*v*omega²*A²/2. Given2to3mm and80to40Hz, amplitude ratio3/2 and frequency ratio1/2 square/multiply to9/16 exactly; common prefixes and2pi cancel. The intermediate amplitude-only comparison is9/4, not a temporal transient. Maximum transversevelocity ratio3/4 squares to9/16;9/16 isone16th abovehalf. Positive inversea=sqrt(r)/b=(3/4)/(1/2)=3/2. No numericalpi, decimalinverse or calculator required. Original variable-tension counterexample remains an explicitly excluded boundary case.',
            physicalAssumptions='NEW DRAFT actually read: ideal flexible uniform cord, constant positive linear density, same positive tension in both trials, progressive sinusoidal transverse waves at established regime, small slopes in both regimes, no appreciable reflection/losses. Wave propagation speed fixed and distinguished from transverse element speed. Ratiosr,a,b positive; the inverse uses the positive root. The source prompt did not fix tension; its historical FAIL remains nested.',
            pedagogicalReview='NEW DRAFT29blocks fully read independently. Explicit held parameters repair model selection before the solution. Formula choice, SI units, mm-to-m cancellation,2pi cancellation, exact fraction arithmetic, interpretation and positive inverse are all present.9/4,1/4 and3/4 error routes are explained through missing factors or transversevelocity. No student calibration is inferred from these proofs.',
            figureReview='New string-power-factors.svg completeXML and native480x840 Chromium render independently read. All three horizontal bars startx60,height40,widths128/288/72; common128pxunit gives1,9/4,9/16. Labels/caption distinguish the intermediate amplitude-only comparison from actual time evolution. All text including bottomlegend visible; QuickLook tallthumbnail was not used as full-figure evidence. Local bytes and packagedBase64 match SHA194b261a...; figure is a protected uploaded /asset/hash reference, original edition had no figure.',
            assetChecksums=assets,candidateSha256=digest(row),reviewedSignature=signature,
            candidateVersion=row.get('version'),baseVersion=row.get('baseVersion'),
            failedPublishedEdition=True,publishedEditionReview=original,reviewedEdition='NEW_DRAFT',
            verificationMode='EXACT_ORACLE',publicationAction='DRAFT')
        byid[key]=revised
    return [byid[key] for key in sorted(byid)]


def report(sources,package=None,bindings=None):
    records=verify(sources,package,bindings)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,
        'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,
        'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount':sum(row['ok'] for row in records),'failedCount':sum(not row['ok'] for row in records),
        'draftReviewedCount':sum(row['publicationAction']=='DRAFT' for row in records),
        'failedPublishedEditionIds':sorted(SOURCE_ISSUES),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
