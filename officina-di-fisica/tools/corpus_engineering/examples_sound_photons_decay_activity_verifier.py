"""Independent original C5-E009..016,40 blocks/two SVGs.

Exact symbolic logs and manual approximation bounds. Echo prompt geometry
ambiguity is retained as a source FAIL, separate from correct intended arithmetic.
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
BATCH='examples-sound-photons-decay-031'
READ_SOURCE_SHA256={
'C5-E009':'facb9df9b6c67e39a867084c73694196d5bf70376bdfaeff0a87707c68f1f4a4',
'C5-E010':'2448c57d90608c744a49197a3a2c11f34f27cf5cf1716c37e0c63ff0e14c29ea',
'C5-E011':'55086ac08dfa0e3780a1841596549cfc9f599b622d224ba551009cf809a38b13',
'C5-E012':'fcf0c9d7cf56bfeb36f92ff152649d13be948cac7f562df1f4b92ae1c06ded9d',
'C5-E013':'0a8856362fc099d720e8fb4f29da275724ba259ad1417c6280e7fce0972c734f',
'C5-E014':'62e72f74785e509db44f8b50888bcdce1de5720f31ce31bfaff8526a5982ca0a',
'C5-E015':'59b30f37817e36c207dcdccfc87794140adfcc0c3398dd9b3632b696a3c75c7b',
'C5-E016':'a2d1c9e60a7aa9a5121bceb25ac647a23fb1b7786e7c5c462bc9fb7b6d626db4'}
READ_ASSETS={'C5-campi.svg':'76eecac175a09dc3230ea84a31ba22df7f6e9376f053542355c0a67aaa6db120',
'C5-attenuazione.svg':'be137de5807896ee23ffe8b0ee181c48a4faea98ab6831eb294bfd734f2cc233'}
FIGURES_BY_ID={'C5-E009':[],'C5-E010':[],'C5-E011':[],'C5-E012':['C5-campi.svg'],
'C5-E013':[],'C5-E014':['C5-attenuazione.svg'],'C5-E015':[],'C5-E016':[]}
SOURCE_ISSUES={'C5-E009':'P3 prompt geometry ambiguity: two perpendicular surfaces can mean perpendicular to each other. The intended monostatic same-axis direct echoes require explicitly normal-to-beam interfaces and direct single paths; the worked solution adds the direct-path condition only at the end. Intended 2.1cm arithmetic is correct.'}
SI=pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.sympify(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q,F=SI.Quantity,sp.Rational
    source='actual_source_example_manual_calculation'
    approx='actual_source_explicit_optional_approximation_checked_manually'
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    cwork=sp.Integer(300000000);Iref=F(1,10**12)
    I1,I2=Iref*10**6,Iref*10**7
    total=I1+I2
    x,t,k,c,Eamp=sp.symbols('x t k c Eamp',positive=True)
    ia,ib=sp.symbols('ia ib',positive=True)
    lowlog=F(1,10)-F(1,10)**2/2
    # Rational exponent-series bounds prove9/4<ln10<5/2.
    a,b=F(9,4),F(5,2)
    expa_upper=sum(a**j/sp.factorial(j) for j in range(9))+a**9/sp.factorial(9)/(1-a/10)
    expb_lower=sum(b**j/sp.factorial(j) for j in range(6))
    z=F(1,3)
    ln2lo=2*sum(z**(2*j+1)/(2*j+1) for j in range(4))
    ln2hi=ln2lo+2*z**9/(9*(1-z*z))
    photon=F('6.63')*sp.Integer(10)**(-34)*(5*10**14)
    emitted=F(2,1000)*F(3,1000)
    count=emitted/photon
    mu_exact=sp.log(4)/3
    Ewave=Eamp*sp.cos(k*x-c*k*t);Bwave=Ewave/c
    return {
    'C5-E009':[
      check('intended echo timedifference28microseconds',Q(68-40,'us'),F(28,10**6),'s',source),
      check('intended doubledpath reduction21millimetres',1500*F(28,10**6)/2,F(21,1000),'m',source),
      check('intended nearestreflectordepth30millimetres',1500*F(40,10**6)/2,F(3,100),'m',source),
      check('intended fartherreflectordepth51millimetres',1500*F(68,10**6)/2,F(51,1000),'m',source),
      check('separatedepth differenceagrees',F(51,1000)-F(3,100),F(21,1000),'m'),
      check('intended distancecentimetres2point1',Q(F(21,1000),'m'),F(21,10),'cm',source),
    ],
    'C5-E010':[
      check('actual60dB intensity1eMinus6',I1,F(1,10**6),'W/m^2',source),
      check('actual70dB intensity1eMinus5',I2,F(1,10**5),'W/m^2',source),
      check('actual incoherentsum11eMinus6',total,F(11,10**6),'W/m^2',source),
      check('actual exactlevel70plus10log1point1',sp.expand_log(10*sp.log(total/Iref)/sp.log(10),force=True),70+10*sp.log(F(11,10))/sp.log(10),'',source),
      check('uncorrelatedfrequencies crossaveragezero',sp.integrate(sp.cos(x)*sp.cos(2*x),(x,0,2*sp.pi)),0),
      check('exponentialupperbound9quarterpower below10',sp.Integer(int(bool(expa_upper<10))),1,'',approx),
      check('exponentiallowerbound5halfpower above10',sp.Integer(int(bool(expb_lower>10))),1,'',approx),
      check('optional70point4 roundedbound withloginequalities',sp.Integer(int(bool(F('0.35')<10*lowlog/F(5,2) and 10*F(1,10)/F(9,4)<F('0.45')))),1,'',approx),
    ],
    'C5-E011':[
      check('actual600nm vacuumwavelength6eMinus7m',Q(600,'nm'),F(6,10**7),'m',source),
      check('working vacuumfrequency5e14Hz',cwork/F(6,10**7),5*10**14,'Hz',source),
      check('working phasevelocity2e8mpersec',cwork/F(3,2),2*10**8,'m/s',source),
      check('actual mediumwavelength400nm',Q(F(6,10**7)/F(3,2),'m'),400,'nm',source),
      check('frequencyunchanged crossingstationaryboundary',(cwork/F(3,2))/(F(4,10**7)),cwork/F(6,10**7),'Hz'),
      check('vacuumtomaterialwavelengthratio equalsindex',F(600,400),F(3,2)),
      check('usingexactSIc givesrounded5point00e14too',sp.Integer(int(bool(F(4995,1000)*10**14<sp.Integer(299792458)/F(6,10**7)<F(5005,1000)*10**14))),1,'',approx),
    ],
    'C5-E012':[
      check('actual companionmagneticamplitude1eMinus7T',Q(30,'V/m')/Q(cwork,'m/s'),F(1,10**7),'T',source),
      check('upwardE outgoingB yieldsrightPoynting',sp.Matrix([0,1,0]).cross(sp.Matrix([0,0,1]))[0],1),
      check('bothfieldsignsflip retainsenergytransportdirection',sp.Matrix([0,-1,0]).cross(sp.Matrix([0,0,-1]))[0],1),
      check('vacuumFaraday derivative signsagree',sp.diff(Bwave,t)+sp.diff(Ewave,x),0),
      check('Bamplitude units fromEoverc',Q(1,'V/m')/Q(1,'m/s'),1,'T'),
    ],
    'C5-E013':[
      check('actual2mW times3ms equals6microJ',Q(2,'mW')*Q(3,'ms'),6,'uJ',source),
      check('actual onephotonenergy3point315eMinus19J',photon,F('3.315')*sp.Integer(10)**(-19),'J',source),
      check('actual exactnominal photoncount400over221 times1e13',count,F(400,221)*10**13,'',source),
      check('actual estimate1point8e13 hasvalidroundingbound',sp.Integer(int(bool(F('1.75')*10**13<count<F('1.85')*10**13))),1,'',source),
      check('photonnumber dimension energyoverenergy',Q(emitted,'J')/Q(photon,'J'),count),
      check('increasingpower changescountnotperphotonenergy',(2*emitted)/photon,2*count,'',probe),
    ],
    'C5-E014':[
      check('actual attenuationcoefficient exactln4over3',-sp.log(F(1,4))/3,mu_exact,'1/cm',source),
      check('halfthickness exactlogcancellation',sp.log(2)/mu_exact,F(3,2),'cm',source),
      check('quartertransmission equals twohalftransmissions',F(1,2)**2,F(1,4),'',source),
      check('muinversecentimetre convertedtoinversemetre',Q(mu_exact,'1/cm'),100*mu_exact,'1/m'),
      check('ln2 optional0point693 hasmanualseriesbound',sp.Integer(int(bool(F('0.6925')<ln2lo and ln2hi<F('0.6935')))),1,'',approx),
      check('muoptional0point462 hasmanualseriesbound',sp.Integer(int(bool(F('0.4615')<2*ln2lo/3 and 2*ln2hi/3<F('0.4625')))),1,'',approx),
      check('printedapproxdecimalquotient coincideswithexactratio',F('0.693')/F('0.462'),F(3,2),'cm',source),
      check('halfthickness metres',Q(F(3,2),'cm'),F(3,200),'m'),
    ],
    'C5-E015':[
      check('actual initialbackgroundsubtraction800perminute',sp.Integer(820-20),800,'1/min',source),
      check('actual finalbackgroundsubtraction100perminute',sp.Integer(120-20),100,'1/min',source),
      check('actual netrate ratiooneeighth',F(100,800),F(1,8),'',source),
      check('oneeighth isthreehalvesofsurvival',F(1,2)**3,F(1,8)),
      check('actual9hoursdivided3 gives3hourhalflife',Q(9,'hour')/3,3,'hour',source),
      check('reconstructnetrate100plusbackground20 returns120',sp.Integer(800)*F(1,2)**3+20,120,'1/min'),
      check('rawratio6over41 isnotoneeighth',F(120,820),F(6,41),'',probe),
      check('halflife3hours inseconds10800',Q(3,'hour'),10800,'s'),
    ],
    'C5-E016':[
      check('actual initialneutrons24minus11 equals13',sp.Integer(24-11),13,'',source),
      check('actual betaminus daughterZ12',sp.Integer(11+1),12,'',source),
      check('actual daughterneutrons12',sp.Integer(24-12),12,'',source),
      check('nucleons conserved24',sp.Integer(12+12),24),
      check('total electriccharge daughterpluselectron equalsinitial11',sp.Integer(12-1+0),11),
      check('electron plusantineutrino leptonnumberzero',sp.Integer(1-1),0),
      check('gamma zerocharge keepsdaughterZ12',sp.Integer(12-0),12,'',source),
      check('gamma zerobaryonnumber keepsmassnumber24',sp.Integer(24-0),24,'',source),
    ]}

MANUAL={
'C5-E009':'Intendeddirectsame-axis model:Deltaeco68-40=28microseconds. d1500*28e-6/2=21e-3m=2.1cm;separate depths1500*40e-6/2=3cm and1500*68e-6/2=5.1cm agree. Howeverpromptnames twoperpendicularsurfaces withoutsayingperpendiculartobeam;thesurfacescaninsteadbereadmutuallyperpendicular. Theworkedsolutionadds directpaths onlyattheend. OriginalFAILisgeometric/pedagogical,nottheintended arithmetic. No clinicaldiagnosisorinferencefromtheseassignedtoyvalues.',
'C5-E010':'Actualreference1e-12W/m² givesI1=1e-6for60dB,I2=1e-5for70dB,total11e-6. Exactanswer70+10*log10(11/10)dB isshowninthesource,sooptional70.4doesnotforceunsupportednumericlogwork. Foranindependentmanualroundingproof,alternatingln(1+x)gives0.095<ln1.1<0.1;positiveexponentialseriesboundsexp(9/4)<10<exp(5/2),hence9/4<ln10<5/2. AdditionaldBshiftisbetween0.38and4/9,containedinnearesttenth0.4interval0.35..0.45. Incoherenttimeaveragezeroscross-term;dBvaluesarenotadded.',
'C5-E011':'Actual600nm=6e-7m. Courseworkingcapproximately3e8m/s givesf5e14Hz,v=c/(3/2)=2e8m/s,lambda=(6e-7)/(3/2)=4e-7m=400nm.600/400=1.5. Stationaryinterfacekeepsf,phasevelocity/wavelengthchange. ExactSIc299792458wouldstillroundf to5.00e14;sourceworkingc isnotassertedexactSIconstant. Manualpowersandfractions,notcalculatorwork.',
'C5-E012':'ActualB0=30/(3e8)=1e-7T. E upcrossB outgivesenergyright;bothfieldvectorsflipafterhalfperiodbuttheircrossproductstayright. MaxwellFaradayderivativesofthecorrespondingplanewaveverifythephase/directionchoiceindependently. GivenE0isamplitude;instantaneoussigninformationdoesnotassertarbitraryinstantEequalsE0. No numerictrigneeded.',
'C5-E013':'Actualpower2mW=2e-3W,time3ms=3e-3s,total6microJ. Givenworkingh6.63e-34times5e14 gives3.315e-19J/photon. NominalN=(400/221)*1e13;manualcrossproducts bound7/4<400/221<37/20,soestimate1.8e13isvalidtotwosignificantfigures. Itisastimacount/meanfromnominalpower,notanassertionnonintegerexactphotons. J/Jdimensionless;photonenergysetbyfrequency,notpower.',
'C5-E014':'Actual25percenttransmissionover3cm givesmu=ln4/(3cm)exact,half-thicknessln2/mu=3ln2/ln4=3/2cm. Two1/2layerscompose1/4withoutnumericlogs. Optionalmu0.462/cm isqualifiedapproximate. Fourterms ofln2=2*(z+z³/3+z⁵/5+z⁷/7+...),z1/3,withpositivegeometricremainderbound,justifyln2round0.693andmu0.462. Printedquotient0.693/0.462=3/2coincidesexactlywiththelogcancelledratio;itdoesnotseparatelystatefalseidentityln2=0.693. cm^-1 convertsby100tom^-1. No requiredgeneralnumericlogevaluation.',
'C5-E015':'Actualsubtractbackground20fromboth820and120toobtain800and100/min. Ratio1/8=(1/2)³ implies3halflivesin9h,soT_half3h=10800s. Reconstruct800,400,200,100netandrestorebackground120final. Raw120/820=6/41wouldbewrongratio;efficiency/geometryfixed,singlespeciesandstatedmeasurementprecisionmakethenominalestimatevalid. No logarithmsrequired.',
'C5-E016':'ActualinitialA24,Z11has13neutrons. Beta-minuschangesone n to p+electron+antineutrino,soZ12,N12,A24. Nuclear+onechargeisbalancedbyemittedelectron-minusone;leptonpairnumberscancel. GammaemissionlowersnuclearexcitationwithoutchangingA,Z,N,sofinal24/12/12. Massnumberisnucleoncount,nottheunchangedrestenergy;no nuclearlevel/half-life dataisassumed.'}
ASSUMPTIONS={
'C5-E009':'Intendedhomogeneousconstantv1500m/s,coincidentfixedtransducer,twodirectsingleechoesalongthesameaxis,interfacesnormaltobeam/no multipath. Thesegeometricalwordsaremissing/ambiguousinthepromptandonlydirectpathassumptionappearsatworkedend;sourceFAILretained.',
'C5-E010':'Independentincoherentacousticsources,linearunchangedmedium/geometry,responsewithsufficienttimeaveraging,cross-correlationzero. Intensitylevelreferencepositive1e-12W/m²,notperceivedloudnessorunqualifiedpressurelevel.',
'C5-E011':'Monochromaticlight,stationarytransparentinterface,n1.50phaseindexatgivenfrequency,courseworkingc3.00e8rounded;vacuumlambda600nmexplicit. Nogroupvelocitysubstitution.',
'C5-E012':'Planeprogressivevacuumwave,in-phaseorthogonalE/B,amplitudeE030V/m. Right-handedright/up/outaxesandEcrossBtransport;noindependentstaticfieldsorcircularpolarizationmixing.',
'C5-E013':'Monochromaticfrequency5e14Hz,constant2mWover3ms,givenworkingh6.63e-34J*s. Numberestimatedfromnominalenergyandphotonenergy;notadetailedphotoncountstatisticsclaim.',
'C5-E014':'Homogeneousconstant-muLambertBeerforselectedmonochromaticdirectbeam,positivecoefficient,transmission1/4over3cm. Identicalhalflayers,consistentcm versusinversecm;optionaldecimalcoefficientsnotexactfundamentalconstants.',
'C5-E015':'Singleisolatedparentpopulationwithconstantdecayrate,noaddedproduction/otherdecaycounts,constantdetectorgeometry/efficiency/background20/min,andnominalratespreciseenoughasexplicitlystated. No automaticidentificationcounts/minwithBq.',
'C5-E016':'Givenenergeticallyallowedbetaminusnucleartransitionthenphotonemission,notclaimingallnuclidesdecaythisway. Acountsprotons/neutrons,Znuclearprotons;electron/antineutrinocarrycharge/leptonnumberbutno nucleonnumber. Gamma lowersenergybutneednotbeclaimedtolanddirectlyingroundstate.'}
PEDAGOGY={
'C5-E009':'FAIL: intendedecho subtraction iscorrectbutstandalonepromptdoesnotunambiguouslysayinterfacesnormaltothesamebeam/directsinglepaths. Readingthesolutionisnotamethodtodiscoveramissinggeometrycondition.',
'C5-E010':'Linearintensitiesareaddedbeforelogarithm;weakersourceadds10percentnot60dB. Exactloganswerisshown,andoptionaldecimalcanbeboundedmanually.',
'C5-E011':'Vacuumwavelengthandfixedfrequencyareidentifiedbeforechangingmedium;600nm/400nmratioisamodelcheck.',
'C5-E012':'Separatesamplitudecalculationfrominstantaneousdirection,definesoutgoingdotsymbolandcheckscommonfieldinversion.',
'C5-E013':'Separatesfrequency,photonenergy,powerandduration;prefixesconvertedandfinalresultisexplicitestimate,nothiddenfull-precisiondivisionrequirement.',
'C5-E014':'Exactcoefficientandsymboliclogratioavailable;lastblockgivesindependenthalflayercompositionwithoutlogs. Roundedintermediatesarecheckablewithoutforcingcalculatoruse.',
'C5-E015':'Backgroundremovedfrombothmeasurementsbeforepower-of-twohalving;detectorconditionsandrateprecisionareexplicit.',
'C5-E016':'Explicitproton/neutronandchargecountingdistinguishesnuclearidentityfromexcitationenergy,andemittedelectronconservesoverallcharge.'}
FIGURE_REVIEW={
'C5-E009':'No figureinallfiveblocks;no geometrydiagramresolvesthepromptambiguity.',
'C5-E010':'No figureinallfiveblocks.',
'C5-E011':'No figureinallfiveblocks;vacuum/materialwavelengthsaretextdata.',
'C5-E012':'C5-campiXML/fullrenderreadin023andGit-bytechecked/re-viewedhere:Eup,Boutgoingdot,propagationright. Onepoint/instantlabeldoesnotimplyin-planeB.',
'C5-E013':'No figureinallfiveblocks.',
'C5-E014':'C5-attenuazioneXML/fullrender/Gitbyteschecked;1,1/2,1/4,1/8at0,d,2d,3d withuniform113pxstepsand148pxverticalunit. Quarterpointat2d supports3cm=2d,so1.5cmdirectly.',
'C5-E015':'No figureinallfiveblocks;actualnetcountsequenceisexplicittext,notborrowedfromstatisticaldotillustration.',
'C5-E016':'No figureinallfiveblocks;sourceasksintegernuclearcompositionsonly.'}


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
