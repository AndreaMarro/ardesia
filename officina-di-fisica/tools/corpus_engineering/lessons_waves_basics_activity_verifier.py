"""Independent full review of40 original C5-L01..04 blocks and five SVGs.

Source examples remain distinct from reviewer-created exact probes. Original
version2 ofL04 is the pinned historical edition, not a revision authored here.
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
BATCH='lessons-waves-basics-022'
READ_SOURCE_SHA256={
'C5-L01':'f13741b37b439c6bc7b90dd7e57d49858f5dd81cf91a4db57a67c7e2e759a96f',
'C5-L02':'4d99b0757c171d2bdc1afffa5f961b415b0e8966ba32e4924c3ca5e35b088e57',
'C5-L03':'417c1eb3e759a1ff037934d738ed59ea9549ba4fe370d0f193d08afdb93aeea6',
'C5-L04':'b9e9282f1cf77070efbb56d249067db327c7dbdd2edaec955d0482daac40cc20'}
READ_ASSETS={
'C5-orologio.svg':'88d0ae6a4be838086f101e1e53c8648e8d6ac258e7e2610ecc3ada42726e6e6b',
'C5-istantanea.svg':'d43a90344af8b498b583d626992faf25ef227ba03a0e23b3c6fff7e9d87ff0ff',
'C5-suono.svg':'ca709649408be8fa8f52ce9afbecde2b3eddaac7490c95d514291e022e9f12d8',
'C5-somma.svg':'a8f1e00e24ed8ad239163fcf84ff0eb5848c920d2748b29393769dbe0f55c069',
'C5-sfere.svg':'acdc645c86411fc4b259a623a655074d88e843c4a2bd19cd2af9d2f3922f4f9b'}
FIGURES_BY_ID={'C5-L01':['C5-orologio.svg'],
'C5-L02':['C5-istantanea.svg','C5-suono.svg'],
'C5-L03':['C5-somma.svg'],'C5-L04':['C5-sfere.svg']}
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
    A,omega,k,mass,spring,mu,c,tension,wavelength,period,power,r,S,intensity=sp.symbols('A omega k m K mu c tension lambda T P r S I',positive=True)
    t,x,phase,delta,angle=sp.symbols('t x phi delta theta',real=True)
    oscillator=A*sp.cos(omega*t+phase)
    wave=A*sp.cos(k*x-omega*t+phase)
    periodw=2*sp.pi/omega
    uK=mu*sp.diff(wave,t)**2/2
    uE=tension*sp.diff(wave,x)**2/2
    pstring=-tension*sp.diff(wave,x)*sp.diff(wave,t)
    average=lambda expr:sp.simplify(sp.integrate(expr.subs({phase:0,x:0}),(t,0,periodw))/periodw)
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    source_example='actual_source_example_or_figure_manual_calculation'
    boundary='reviewer_boundary_probe_excluded_by_source_conditions'
    return {
    'C5-L01':[
     check('peaktopeak4cm means amplitude2cm',Q(4,'cm')/2,2,'cm',source_example),
     check('sourcegraph periodonehalfsecond gives2Hz',1/F(1,2),2,'Hz',source_example),
     check('sourcegraph frequency2 givesomega4pi',2*sp.pi*2,4*sp.pi,'rad/s',source_example),
     check('harmonic secondderivative equals negativeomegaSquared position',sp.diff(oscillator,t,2),-omega**2*oscillator,'m/s^2'),
     check('successive samephase afterfullperiod',sp.trigsimp(oscillator.subs(t,t+periodw)-oscillator),0,'m'),
     check('halfperiod changes sign rather thanrepeating generalstate',sp.trigsimp(oscillator.subs(t,t+periodw/2)+oscillator),0,'m'),
     check('at equilibrium toyphasepiOver2 speedmagnitudeAomega',sp.diff(oscillator,t).subs(omega*t+phase,sp.pi/2),-A*omega,'m/s'),
     check('at maximum toyphasezero velocityzero',sp.diff(oscillator,t).subs(omega*t+phase,0),0,'m/s'),
     check('at maximum acceleration directedinward',sp.diff(oscillator,t,2).subs(omega*t+phase,0),-A*omega**2,'m/s^2'),
     check('spring Newton equation givesomegaSquaredKoverm',(-spring*oscillator/mass).subs(spring,mass*omega**2),sp.diff(oscillator,t,2),'m/s^2'),
     check('harmonic kineticpluspotential energy constant',sp.trigsimp(mass*sp.diff(oscillator,t)**2/2+mass*omega**2*oscillator**2/2),mass*omega**2*A**2/2,'J'),
     check('frequency units reciprocal seconds',Q(4,'')/Q(2,'s'),2,'Hz',probe),
     check('toyfourcyclesintwoseconds periodonehalf',F(2,4),F(1,2),'s',probe),
     check('negativeinitialvelocityatcenter differs frompositive despiteequalposition',sp.diff(oscillator,t).subs({t:0,phase:sp.pi/2}),-A*omega,'m/s',probe),
    ],
    'C5-L02':[
     check('travellingwave phaseconstant givespositivevelocity',sp.solve(sp.Eq(k*sp.Symbol('v')-omega,0),sp.Symbol('v'))[0],omega/k,'m/s'),
     check('wavelengthandfrequency yieldomegakratio',(wavelength/period).subs({wavelength:2*sp.pi/k,period:2*sp.pi/omega}),omega/k,'m/s'),
     check('field repeats inposition bywavelength',sp.trigsimp(wave.subs(x,x+2*sp.pi/k)-wave),0,'m'),
     check('fixedsensor repeats intime byperiod',sp.trigsimp(wave.subs(t,t+2*sp.pi/omega)-wave),0,'m'),
     check('waveequation transverse spacetime derivatives',sp.diff(wave,t,2)-(omega/k)**2*sp.diff(wave,x,2),0,'m/s^2'),
     check('particle transversespeed differs fromwave phasespeed',sp.diff(wave,t),A*omega*sp.sin(k*x-omega*t+phase),'m/s'),
     check('spacegraphic wavelengthfourfifthsmeter giveskfivepiOver2',2*sp.pi/F(4,5),5*sp.pi/2,'rad/m',source_example),
     check('spatial graphic scale176px forfourfifthsm',F(176,1)/F(4,5),220,'1/m',source_example),
     check('wavelength timesfrequency has speedunits',Q(F(4,5),'m')*Q(2,'Hz'),F(8,5),'m/s',probe),
     check('hypotheticalpoint speedneednotphasevelocity',(A*omega).subs({A:F(1,50),omega:4*sp.pi}),2*sp.pi/25,'m/s',probe),
     check('linear longitudinal compression is negative strain',-sp.diff(A*sp.cos(k*x-omega*t),x),A*k*sp.sin(k*x-omega*t)),
     check('pressureperturbation isbulkmodulustimescompression',-sp.Symbol('Kbulk',positive=True)*sp.diff(A*sp.cos(k*x-omega*t),x),sp.Symbol('Kbulk',positive=True)*A*k*sp.sin(k*x-omega*t),'Pa'),
     check('standingwave isnot single progressiveprofile',sp.expand_trig(sp.cos(k*x-omega*t)+sp.cos(k*x+omega*t)),2*sp.cos(k*x)*sp.cos(omega*t),'',boundary),
     check('changing phase sign changespropagationdirection',sp.solve(sp.Eq(k*sp.Symbol('v')+omega,0),sp.Symbol('v'))[0],-omega/k,'m/s',probe),
    ],
    'C5-L03':[
     check('sourcepulse2cm plusnegative1cm equals1cm',Q(2,'cm')+Q(-1,'cm'),1,'cm',source_example),
     check('equal inphase oscillations double displacement',A*sp.cos(phase)+A*sp.cos(phase),2*A*sp.cos(phase),'m'),
     check('equal oppositephase waves cancel displacement',sp.trigsimp(A*sp.cos(phase)+A*sp.cos(phase+sp.pi)),0,'m'),
     check('unequal oppositephase leaves difference',sp.trigsimp(2*A*sp.cos(phase)+A*sp.cos(phase+sp.pi)),A*sp.cos(phase),'m'),
     check('two equal coherent sinusoids combinehalfphaseamplitude',sp.trigsimp(A*sp.cos(phase)+A*sp.cos(phase+delta)-2*A*sp.cos(delta/2)*sp.cos(phase+delta/2)),0,'m'),
     check('full wavelength pathdifference is2pi phase',2*sp.pi*wavelength/wavelength,2*sp.pi,'rad'),
     check('halfwavelength pathdifference ispi phase',2*sp.pi*(wavelength/2)/wavelength,sp.pi,'rad'),
     check('initialphase offset must beadded to pathphase',sp.pi+2*sp.pi*0/wavelength,sp.pi,'rad',probe),
     check('equal intensitiesalone do not specifyinterference',4*sp.cos(delta/2)**2,2+2*sp.cos(delta)),
     check('samecoherentphase producesintensityfactor4', (2*A)**2/A**2,4),
     check('quadrature givesintensityfactor2 notcancel', (2+2*sp.cos(delta)).subs(delta,sp.pi/2),2),
     check('standingwave momentaryzero displacementneednotzero velocity',sp.diff(2*A*sp.cos(k*x)*sp.cos(omega*t),t).subs(t,sp.pi/(2*omega)),-2*A*omega*sp.cos(k*x),'m/s',probe),
     check('linearwave operator preserves sum',sp.diff(wave+wave.subs(phase,phase+delta),t,2)-(omega/k)**2*sp.diff(wave+wave.subs(phase,phase+delta),x,2),0,'m/s^2'),
     check('sourcepulseverticalscale18pxpercm',F(52-16,2),18,'1/cm',source_example),
    ],
    'C5-L04':[
     check('source6Jin3s gives2W',Q(6,'J')/Q(3,'s'),2,'W',source_example),
     check('intensity units wattpersquaremetre',Q(6,'W')/Q(3,'m^2'),2,'W/m^2',probe),
     check('sphereintegratedoutgoingpowerconserved',power/(4*sp.pi*r**2)*(4*sp.pi*r**2),power,'W'),
     check('doubledradius givesquarterintensity',(power/(4*sp.pi*(2*r)**2))/(power/(4*sp.pi*r**2)),F(1,4)),
     check('sphere areas growbyfour nottwo',(4*sp.pi*(2*r)**2)/(4*sp.pi*r**2),4),
     check('string average kineticdensity',average(uK),mu*omega**2*A**2/4,'J/m'),
     check('string average elasticdensity tensionmucSquared',average(uE).subs({tension:mu*c**2,k:omega/c}),mu*omega**2*A**2/4,'J/m'),
     check('string meanpower fromnegative tension slope timesvelocity',average(pstring).subs({tension:mu*c**2,k:omega/c}),mu*c*omega**2*A**2/2,'W'),
     check('string powerformula units',Q(2,'kg/m')*Q(3,'m/s')*Q(4,'1/s')**2*Q(1,'m')**2/2,48,'W',probe),
     check('doubling amplitude atfixedfrequency quadruplespower',(mu*c*omega**2*(2*A)**2/2)/(mu*c*omega**2*A**2/2),4),
     check('faceon sensor capturesfullprojectedarea',(S*sp.cos(angle)).subs(angle,0),S,'m^2'),
     check('edgeon sensor captureszeroarea',(S*sp.cos(angle)).subs(angle,sp.pi/2),0,'m^2'),
     check('toy60degree sensorgiveshalfarea',(S*sp.cos(angle)).subs(angle,sp.pi/3),S/2,'m^2',probe),
     check('intensity area duration has energyunits',Q(2,'W/m^2')*Q(3,'m^2')*Q(4,'s'),24,'J',probe),
     check('collimated constantcrosssection needsnotinverseSquare',power/S,power/S,'W/m^2'),
     check('varying intensity needsactualtimeintegral',sp.integrate(2*t*S,(t,0,3)),9*S,'J',boundary),
    ]}

MANUAL={
'C5-L01':'Actualsource:4cm peaktopeak means2cm amplitude. TemporalSVG hasperiod0.50s, sof2Hz andomega4pi rad/s; successivecenter crossingsare0.25sapart withoppositeslopes. Theplottedphase startsatzerowithpositiveslope, consistentwithcos initialphase-minuspi/2; usingmax-to-max doesnotrequirea maximumattimezero. Derivea=-omega²x bytwoderivatives, v=0atpeaks andspeedAomegaatcenter. SpringF=-Kx givesomega²=K/m underlinearspring,nodamping. Exactenergysumconstant. Additionalfourcyclesin2s isreviewerprobe,notnewassigneddata; symbolicpi neednotbeapproximated.',
'C5-L02':'Source spatialSVG measureslambda0.80m, its176px wavelengthand176pxbetween0and0.80areconsistent; k=2pi/lambda=5pi/2 rad/m stayssymbolic. Holdingphasekx-omegat+phi fixedgivesdx/dt=omega/k, andsubstitutinglambda=2pi/k,T=2pi/omega giveslambda/T. Positionortime translationsbyfullcycle returnfield; spacetime derivatives satisfywaveequation. Materialtransversevelocity isAomega*sin(phase), notomega/k. Forlongitudinalfluid displacementxi, compression=-dxi/dx andpressureperturbation=bulkmodulus*compression; sinusoidalpressuredoesnotdrawmoleculepath. Hypotheticallycombininglambda4/5m withfrequency2Hz gives8/5m/s,butthetwodifferentlessonfiguresareNOTassertedtorepresentonesamewave. Thosepairsandstandingwavecounterexamplesarelabelledreviewerprobes.',
'C5-L03':'ActualsourceSVG:2cm+(-1cm)=1cm withthreeindependentzeros andcommon18px/cm scale. Generaladditionispointwise,signed andsimultaneous inalinearmedium. Equalfrequency sumidentitiesgive2Acos(delta/2)*cos(phase+delta/2); oppositephaseequalA cancels,unequalA leavesdifference. Camminolambda adds2pi andlambda/2 addspi onlyforin-phasesourcesinsamemedium; initialphaseoffsetmustalsobeincluded. Intensitiesproportionaltosquaredamplitudehavecross-terms;equallystrongdoesnotimplycancelled. Constructedstandingwave hasinstantaneouslyzerodisplacementbutnonzerovelocity,soenergyisnotinferredfromdisplacementalone. Noextra numericaltrigcalculationsareassigned.',
'C5-L04':'Actualsource6J/3s=2W. Sphereareais4pi*r², so doubledradiusgivesfourtimesareaandonequarterintensity,notonehalf. Deriveidealstringpowerfromflux-tension*yx*yt; periodaveragegiveshalf*mu*c*omega²*A², withmean kineticandelasticdensitieseachquarter*mu*omega²*A². Allpi termsstaysymbolic/cancel. Projected collectingareaS*cos(theta) usesnormalfacingincidentrayandacuteincidence0..pi/2; itisnotanunsignedcollectedenergyformulaforanarbitrarilyreversednormal. Sensorintensityuniformandconstanttimeisexplicit;thenE=I*S_eff*duration. Reviewertoy2W/m²*3m²*4s=24J andcos60=1/2 requireonlyinteger/fractionwork;varying2t intensityover3s insteadintegrates9S. Collimatedconstantsectionpowerisnotdividedbyanexpandingsphere.'}
ASSUMPTIONS={
'C5-L01':'Periodiccompletecycles withsamepositionanddirection; A>0,T>0,omega>0. Coordinatesrelativetoequilibrium. Harmonicsinusoid correspondslinearrestoringforce,noappreciabledamping/forcingchange; idealspringhorizontalwithinHookeregime. Momentarilystationaryatendpointsdoesnotmeanzeroacceleration.',
'C5-L02':'Singleharmonicprogressiveprofile,positivek/omega,withoutshapechangeinassignedhomogeneousmedium; phasespeednotmaterialparticlevelocity,norgenerallyapulsegroupvelocityindispersivemedia. Stringtransverse/fluidlongitudinaldisplacementsremainnearindividualequilibria. Linearfluidstrainrelationissmall-amplitudereviewerprobe. Noassertionthatseparatetemporal/spatialfiguresareonesharedexperiment.',
'C5-L03':'Linearregimeand smallperturbations; addsamephysicalfieldcomponentatsamepoint/time,notenergies/intensitiesdirectly. Phaseformulaforpathdifferenceusesinitiallyin-phasesources,samemedium/wavelengthandconsistentorientation. Stableinterferencerequiresstablephasedifference. Equalstrengthwithoutphaseinformationisinsufficient.',
'C5-L04':'Pointlikeisotropicsource,homogeneouslosslessmediumandoutwardpropagationforinverse-square; r>0outsidepointsourceidealization. Meanintensityfromnormalpowerflux; smallplanarsensorwithnearuniformincidentintensity,collectingnormalchosentowardrayso0<=theta<=pi/2. Constantintensityduringexposureforproductenergy. Stringmodelideal,linear/smallslopes,uniformmu/tensionandprogressiveharmonicmotion; amplitudecomparisonskeepmedium,wavespeedandfrequencyfixed. Collimatedbeamhasconstantsectionandnegligiblelosses.'}
PEDAGOGY={
'C5-L01':'Explicitlydistinguishessameheightfromsamestate,halffromfullcycle,andpeaktopeakfromamplitude. Actualmanual4/2ischecked,notwaivedduetolessonkind. Sinusoidalphaseallowsinitialpositionandvelocitysign.',
'C5-L02':'Contrastsafixedsensor temporalrecordwithsimultaneousspatialprofile,thenlinksphaseandwavespeed. Distinguishesmaterialoscillationfromenergypropagationandpressuregraphfrommoleculetrajectory. Doesnotinvitearbitrarycombinationofunrelatedgraphnumbers.',
'C5-L03':'Threegraphzeroesareexplicit,signedadditionandcoherencequalifiersprecedephaseformula. Separatessuperposedfieldfromenergy/intensityandwarnsthatloudnessalonecannotfixcancellation.',
'C5-L04':'Beginswithactualintegerdivision,distinguishessourcepowerfromwindowpower,intensityandcapturedenergy. Spherecrosssectionisexplicitlynotdiskarea; inverse-squareconditions, stringfixed-frequencyquadraticscalingandnormalangleconventionaredistinct. Uniformity/timeconstancyqualifycollectionproducts; finalcollimatedcasepreventsapplyinginverse-squareuniversally.'}
FIGURE_REVIEW={
'C5-L01':'CompleteXML/render:verticalx(cm),horizontal t(s);zeroy134,cresty81means2cm,temporal0.25sper95px;peakspacing190pxgives0.50s. Max-to-maxbracketmatchescrestsat131.5/321.5,notzero-crossings. Plottedamplitudeandinitialpositiveslopeagreewithtitleandprose.',
'C5-L02':'BothSVGsfullyread/rendered:spatialaxisx(m),verticaly(cm),lambda0.80mover176px;0/0.80/1.60ticksat75/251/427,crests119/295/471;rightarrowpropagationandfixedtimesnapshotarelabelled. Fluidlayersclusterat70/322.45/574.90,withrarefactionsbetweenthem;arrow70to322.45spansonecompressionperiod. No transverse moleculepathisdrawn.',
'C5-L03':'CompleteXML/render:zeros52/119/199;peaks16/137/181so36pxup,18pxdown,18pxup,consistent18px/cmfor+2,-1,+1. Sharedpulseabscissae236/302/368andlinearsegmentsmakepointwiseadditioncorrectthroughout,notjustatthepeak.',
'C5-L04':'CompleteXML/render:concentriccirclesr49/98pxsamecenter169,126,labelledsectionthroughsource. AccompanyingS1=4pi*r²,S2=4pi*(2r)²=4S1preventconfusingdrawn2Dcircleareawithspherearea. NoabsoluteP/rnumbersareassigned;offsetradiusannotationisschematic.'}


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
