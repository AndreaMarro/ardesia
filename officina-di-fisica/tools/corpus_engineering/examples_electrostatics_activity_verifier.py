"""Independent reading and solution of C4-E001..008:34 blocks/five SVGs.

Six actual numerical examples are solved exactly. The two qualitative examples
have no assigned numerical calculation but still have independent physical models.
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
BATCH='examples-electrostatics-027'
READ_SOURCE_SHA256={
'C4-E001':'82da182f9e9d1e168bd78c7e701131c547bd1500087fdc18816b8a42b3701d76',
'C4-E002':'ee49cd09c215b4b26056f00dadde9604a3f3e7469337a2c88bf640a954acd9d8',
'C4-E003':'028c493f17ba8a02b755b3f5136874e09324c13203dc5fa37789de8ba1156197',
'C4-E004':'51824140960d423cda985a3d2849e6e2e331db68d3c7141b986dbe2f8fb8ffec',
'C4-E005':'49e95aa57281fb136a308b7e8aa6cc1f5201b139af8554b7c3a0dce1be89aa0d',
'C4-E006':'4c6a566f21a959961a11f3476c5494fe184244ac73a3715c207e591962972e7e',
'C4-E007':'380b5c4186346136772352482b3e3c4dd5d98e5ae18d22dcf9f4c66aed2afac4',
'C4-E008':'1b89beaca4764c62c5cd057b9c83db2474d9f3d26c583033d43449248c9d5453'}
READ_ASSETS={
'C4-coulomb.svg':'e3478c630a080624cafaa8361d262ab0ce201ff83a2e86ea9922b9e900d95611',
'C4-dipolo.svg':'6a73d914ea2c4c15badb8b44f48dc1ba440da27283d610b2d7db212921a4fe49',
'C4-materiali.svg':'9a2737ac65cad7f65f6570bac50e031c3ec7008f301286036fc58d55631e65ba',
'C4-induzione-terra.svg':'20696a28c54e925e57b31c167bcecb1efdf28330cff10870d2d29a368917dc9d',
'C4-dipolo-indotto.svg':'fdd00e7ed9fe6b2155948bca6bdc0a8a322c0f5f169a20511d804c3541778c4c'}
FIGURES_BY_ID={'C4-E001':['C4-coulomb.svg'],'C4-E002':[],
'C4-E003':['C4-dipolo.svg'],'C4-E004':[],'C4-E005':[],'C4-E006':[],
'C4-E007':['C4-materiali.svg','C4-induzione-terra.svg'],'C4-E008':['C4-dipolo-indotto.svg']}
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
    k=sp.Integer(9)*10**9
    q1,q2=F(2,10**9),F(-3,10**9)
    r=F(3,100)
    q,dist,C,external,alpha,rodK,a=sp.symbols('q d C Vexternal alpha K a',positive=True)
    x,t,common=sp.symbols('x t common',real=True)
    # Whole point-charge force, not a lookup of the source result.
    force_on_left=-k*q1*q2/r**2
    fieldpoint=lambda source,location,where:k*source*(where-location)/abs(where-location)**3
    qparticle,mass,E,time=F(4,10**8),F(2,10**6),500,F(1,5)
    ay=qparticle*E/mass
    dy=ay*time**2/2
    vy=ay*time
    work=qparticle*E*dy
    unit_pair=k*F(1,10**9)**2/F(1,10)
    near=-q*rodK/(dist-a)**2;far=q*rodK/(dist+a)**2
    induced_energy=-sp.integrate(alpha*x,(x,0,rodK/dist**2))
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    actual='actual_source_example_manual_calculation'
    conceptual='independent_physical_derivation_no_assigned_numeric_calculation'
    return {
    'C4-E001':[
     check('actual3cm converted to3over100m',Q(3,'cm'),r,'m',actual),
     check('actual chargeproduct magnitude',abs(q1*q2),F(6,10**18),'C^2',actual),
     check('left positivecharge attractedright',force_on_left,F(6,10**5),'N',actual),
     check('right negativecharge attractedleft',k*q1*q2/r**2,-F(6,10**5),'N',actual),
     check('forces equalandopposite ondistinctbodies',force_on_left+k*q1*q2/r**2,0,'N'),
     check('Coulomb force units and centimetre conversion',abs(Q(k,'N*m^2/C^2')*Q(2,'nC')*Q(-3,'nC')/Q(3,'cm')**2),F(6,10**5),'N',actual),
    ],
    'C4-E002':[
     check('actual algebraic totalcharge6nC',sp.Integer(8-2),6,'nC',actual),
     check('equalcharge symmetry solves conservedtotal',sp.solve(sp.Eq(2*x,6),x)[0],3,'nC',actual),
     check('first sphere receivesnegativecharge5nC',sp.Integer(3-8),-5,'nC',actual),
     check('second sphere losesnegativecharge5nC',sp.Integer(3-(-2)),5,'nC',actual),
     check('transfer conservestotalcharge',sp.Integer((3-8)+(3+2)),0,'nC'),
     check('different capacitances wouldnot permit equalcharge',sp.solve(sp.Eq(x+2*x,6),x)[0],2,'nC',probe),
    ],
    'C4-E003':[
     check('actual halfway20cm separation gives10cm',Q(20,'cm')/2,F(1,10),'m',actual),
     check('positiveleftsource midpointfieldright',fieldpoint(F(1,10**9),-F(1,10),0),900,'N/C',actual),
     check('negativerightsource midpointfieldright',fieldpoint(-F(1,10**9),F(1,10),0),900,'N/C',actual),
     check('actual sourcefieldsum is1800right',fieldpoint(F(1,10**9),-F(1,10),0)+fieldpoint(-F(1,10**9),F(1,10),0),1800,'N/C',actual),
     check('oppositecharge totalzero doesnot implyfieldzero',F(1,10**9)-F(1,10**9),0,'C'),
     check('midpointpotential zero iscompatiblewithnonzerofield',k*F(1,10**9)/F(1,10)-k*F(1,10**9)/F(1,10),0,'V',probe),
    ],
    'C4-E004':[
     check('actual electricforce qE',qparticle*E,F(2,10**5),'N',actual),
     check('actual upwardacceleration10',ay,10,'m/s^2',actual),
     check('actual verticaldisplacementonefifth',dy,F(1,5),'m',actual),
     check('actual horizontaldisplacementthreefifths',3*time,F(3,5),'m',actual),
     check('actual finalverticalvelocity2',vy,2,'m/s',actual),
     check('independent integratedacceleration givesdisplacement',sp.integrate(sp.integrate(ay,(t,0,x)),(x,0,time)),dy,'m'),
     check('fieldwork equalskineticincrease',work,mass*((3**2+vy**2)-3**2)/2,'J'),
     check('forceunit fromchargeandfield',Q(qparticle,'C')*Q(E,'N/C')/Q(mass,'kg'),10,'m/s^2',actual),
    ],
    'C4-E005':[
     check('actual finalminusinitialpotential30V',sp.Integer(40-10),30,'V',actual),
     check('actual negativecharge potentialenergychange',Q(-2,'uC')*Q(30,'V'),-60,'uJ',actual),
     check('actual fieldwork oppositepotentialenergychange',-(-F(2,10**6))*30,F(60,10**6),'J',actual),
     check('common potentialzero doesnot changeDeltaU',sp.expand(-F(2,10**6)*((40+common)-(10+common))),-F(60,10**6),'J'),
     check('fieldonly kineticgain ispositive60uJ',F(60,10**6),F(3,50000),'J',actual),
    ],
    'C4-E006':[
     check('actual oneunorderedpair energy',unit_pair,F(9,10**8),'J',actual),
     check('actual threeunorderedpairs energy',3*unit_pair,F(27,10**8),'J',actual),
     check('halfqiVi sum excludes doublecounting',3*F(1,10**9)*(2*k*F(1,10**9)/F(1,10))/2,3*unit_pair,'J'),
     check('sequentialassembly addsonepair then twopairs',unit_pair+2*unit_pair,3*unit_pair,'J'),
     check('orderedpair doublecount hasfactor2',6*unit_pair/(3*unit_pair),2),
     check('potentialenergy units',Q(k,'N*m^2/C^2')*Q(1,'nC')**2/Q(10,'cm'),F(9,10**8),'J',actual),
    ],
    'C4-E007':[
     check('groundingpositiveexternalpotential makes spherechargenegative',sp.solve(sp.Eq(x/C+external,0),x)[0],-C*external,'C',conceptual),
     check('groundplussphere chargebalance remainszero',(-C*external)+(C*external),0,'C',conceptual),
     check('isolating freezesnegativecharge afterrodremoval',(-C*external)/C,-external,'V',conceptual),
     check('removerodwhilegrounded returnsneutral instead',sp.solve(sp.Eq(x/C,0),x)[0],0,'C',conceptual),
     check('isolatedinitialpolarization retainszeronetcharge',-q+q,0,'C',conceptual),
    ],
    'C4-E008':[
     check('neutraldipole haszeronetcharge',-q+q,0,'C',conceptual),
     check('nearnegativecharge attraction outweighsfarrepulsion',sp.factor(near+far),-4*q*rodK*dist*a/(dist**2-a**2)**2,'N',conceptual),
     check('uniformfield oppositecharges sumzero force',-q*E+q*E,0,'N',conceptual),
     check('uniformfield canretain torque',sp.Matrix([q*dist,0,0]).cross(sp.Matrix([0,E,0]))[2],q*dist*E,'N*m',conceptual),
     check('linearinduced energy hashalfpolarizabilityfactor',induced_energy,-alpha*rodK**2/(2*dist**4),'J',conceptual),
     check('induced force followsstrongerfield gradient',-sp.diff(induced_energy,dist),-2*alpha*rodK**2/dist**5,'N',conceptual),
    ]}

MANUAL={
'C4-E001':'Actual k9e9 is explicitly assigned working data, not a claim exactSI Coulombconstant. Convert3cm=3/100m, square gives9/10000m²;2nC*3nC=6e-18C². Numerator54e-9 divided9e-4 gives6e-5N. Positiveleftsource isattractedright,negative rightsourceleft; same magnitudeon differentbodies. Powers often manuallycancel9 and10exponents; no calculator.',
'C4-E002':'Actual total8+(-2)=6nC. Identicalspheres andexplicitlysymmetric arrangement plusnegligiblewire giveequalfinalcharge, soeach3nC. Firstchange3-8=-5nC meansreceivingelectrons; second3-(-2)=+5nC meanslosingelectrons. Changescancel. The source doesnotrequestelectroncounts orrequirecontinuous nC data to beexact integer electronmultiples. Unequalcapacitance reviewerprobe wouldgive2nC/4nC, explainingwhytheidentical/symmetryconditionmatters.',
'C4-E003':'Actual separation20cm meansmidpointr10cm=1/10m. Eachfield9e9*1e-9/(1/10)²=9*100=900N/C. Signedvector contributionsbothpointfromleftpositive torightnegative, giving1800N/Cright. Net sourcechargezero doesnotcancel spatiallydistinctfields. Midpointpotentialzero is anadditionalindependentcrosscheck, nottheanswerforfield.',
'C4-E004':'ActualqE=4e-8*500=2e-5N. Divideby2e-6kg toobtainupward10m/s². Withvyinitial0,t1/5s,dy=(1/2)*10*(1/5)²=1/5m;dx=3*(1/5)=3/5m,vy=2m/s. Integratingconstantaccelerationagrees. FieldworkqEdy=4e-6J equalskineticincreasefromvx3,vy0 tovx3,vy2. No square-rootdecimal forfinalspeed isrequested. Uniformfieldmustcovertrajectoryduration;otherforcesexplicitlyneglected.',
'C4-E005':'ActualDeltaV40-10=+30V. q=-2microC givesDeltaU=-60microJ andfieldwork+60microJ. Ifonlyfieldacts,kineticenergygains60microJ. BothpotentialsshiftedbyacommonconstantleaveDeltaUunchanged. Negativechargereversespotential-versus-energytrend; no differentzero convention orabsolutepotentialenergy isinferred.',
'C4-E006':'Actualequilateraltrianglehasthreeunorderedpairs. Each9e9*(1e-9)²/(1/10)=9e-8J;threegive27e-8=2.7e-7J. Independentlyhalf-sumqi*potentialfromothercharges givessamevalue;sequentialassemblycontributeszero,onepair,twopairs. CountingBAafterABwoulddoublecount. Zeroenergyatreferenceseparationinfiniteisexplicit; no trig ordecimalradicalcalculationisrequired.',
'C4-E007':'No studentnumericcalculation isassigned. Physicalreviewisnotwaived: capacitanceboundarymodelVsphere=Qsphere/C+Vexternal,withpositiveeffectiveexternalpotentialandgroundVsphere0, givesQsphere=-C*Vexternal<0. Earthsupplieselectrons. Removinggroundfirstfreezesthisnegativecharge;removingrodthenchangespotential/distributionbutnotnetcharge. ReversedorderwhilegroundedgivesQ0beforeisolation. Initialisolatedpolarizationhasoppositesurfacechargeswithsumzero. Theseareindependentconceptual/symbolicchecks,notquantitativecapacitancedatafromthefigure.',
'C4-E008':'No studentnumericcalculation isassigned. Independentlymodelnearnegativeandfarpositivechargesatd-a,d+a frompositivesource, withd>a>0. Force sum=-4*K*q*d*a/(d²-a²)²<0points towardsourcealthoughnetchargezero. UniformEforcescancel,whiletorquepcrossEmayremain. Forordinarypositivepolarizabilityp=alphaE,inducedU=-alphaE²/2 andF=alpha*grad(E²)/2 pointtowardstrongerfield. Factoronehalfcomesfromintegratinginducedresponse,notassumingpermanentp. The sourcequalitativequestiondoesnotasktheseunprovidedconstants orderivatives;theyverifythemechanism.'}
ASSUMPTIONS={
'C4-E001':'Small spheresrelative tocenterseparation, electrostaticvacuum pair, specifiedworkingk9e9 andpointchargeapproximation. Forcesactondistinctbodies;netpairforcezero doesnotmakeindividualforceszero.',
'C4-E002':'Identicalconductingspheres,symmetricenvironmentandconfiguration, isolatedtwo-spheresystem, negligiblewire/otherconductors, electrostaticequilibriumthen separationwithoutchargeexchange. Equalpotentialsalone wouldnotgiveequalchargesforunequal/asymmetriccapacitances.',
'C4-E003':'Pointlikefixedsources+/-1nC atdistinctpositions;midpointhasfiniteequalr10cm, vacuumworkingk9e9. Electricfieldindependentofsignofhypotheticaltestcharge;scalarpotentialandvectorfieldnotinterchanged.',
'C4-E004':'UniformEupwardoverentire0.20s region,positiveassignedcharge,constantclassicalmass,initialhorizontalvelocity3m/sandvy0. Otherforcesincludinggravityexplicitlyneglected;notanunspecifiedexit-lengthproblem.',
'C4-E005':'Electrostaticconservativefield, signedDeltaV=Vfinal-Vinitial, fixednegativecharge. Fieldwork=-DeltaU;kineticgainonlyifnootherforcework,explicitinsolution.',
'C4-E006':'Threeequalpositivepointcharges,allpairdistances0.10m,electrostaticvacuumworkingk9e9. Excludeinfinitepoint-selfenergies;relativeinteractionenergyzerowhenchargesmutuallyinfinitelyseparated. Positiveexternalassemblyworkcomparisonisquasistatic.',
'C4-E007':'Neutralisolatedconductingsphereinitially,positiveexternalrodwithoutcontact, ordinarygroundreservoir, disconnectgroundwhilepositive rodremains,thenremoverod. Electrostaticequilibrium;chargeglyphsqualitative,notnumber-calibratedelectrons.',
'C4-E008':'Smallordinarydielectricwithpositiveeffectivepolarizabilityinassignednonuniformexternalfield;givenattractioncase,notuniversalallmaterials/media. Chargeboundandnetzero;near/farforceillustrationd>a,small-dipoleinducedmodelwherefieldgradientvarieslittleoversize. Uniformfieldtranslationzero cancoexistwithtorque.'}
PEDAGOGY={
'C4-E001':'Usescenter-distanceSIconversion,chargeproductandattractiondirection;distinguishesequaloppositeforcesfrombothactingononesphere. Assignedroundedkisworkingdata.',
'C4-E002':'Algebraicchargeconservationprecedessymmetryandfinaldivision;electrontransferdirectionfollowschangeinsignedcharge ratherthansayingpositivechargesmovedthroughwire.',
'C4-E003':'Addsfieldcomponentsatthesamepointwithcorrectsignbeforemagnitude;zero-totalchargeismadeexplicitlyinsufficientforzerofield.',
'C4-E004':'Setsverticalsignandinitialcondition,thenconstantaccelerationandseparatedhorizontalmotion. Curvedtrajectorydoesnotrequirechangingfielddirection.',
'C4-E005':'Distinguishespotentialincreasefromenergyincreasefornegativecharge;fieldworkandconditionalkineticgainareconsistent.',
'C4-E006':'Explicitunorderedpairlistpreventsdoublecountingandstatesenergyreference. Allarithmeticissimplepowers/fractions.',
'C4-E007':'Explainsinitialpolarization,earthchargebalanceandoperationorder,withoutclaimingneutralisolatedconductorimmediatelygainsnetchargefromrod.',
'C4-E008':'Explainsneutralityversusnetforceinaninhomogeneousfieldandseparatestranslationfromtorqueintheuniformlimit. Numericalmanualityscopezero doesnotmeanphysicsunchecked.'}
FIGURE_REVIEW={
'C4-E001':'CompleteXML/render:separatepositiveleft/negativerightcircles, equal106pxforcearrowsinward,labelledforceoneachcharge;distancequotebetweencenters. No numericdistanceorforceratioderivedfrompixels.',
'C4-E002':'No figureinallfiveblocks;explicitgeometricalsymmetryisintheprompt.',
'C4-E003':'CompleteXML/render:sourcecenters112/528andP320giveexactequal208pxdistances;twoequal77pxfieldarrowsbothright, verticallyoffsetexplicitlyforlegibilityratherthanseparateapplicationpoints.',
'C4-E004':'No figureinallfourblocks;sourcegivesallnumericinitialconditionsandfielddirection.',
'C4-E005':'No figureinallfourblocks;signconventionandnumericpotentialsareexplicit.',
'C4-E006':'No figureinallfourblocks;equilateralgeometrygiveninprompt,onlythreeequaldistancesneeded.',
'C4-E007':'BothXML/fullrendersread: genericmaterialdiagramhasnegativeleft/positiverightinrightwardexternalfield,conductorinteriorE0andbounddielectricdipoles;notanassignedsphericalcapacitancescale. Groundingdiagrampositive rodleft,electronarrowupfromearthtowardsphere,finalisolatednegativechargesredistributedafterrodremoval. Chargeglyphcountsarequalitative;leftstageallowsongoingsupply,notanassertionthatdisconnectioncreatescharge.',
'C4-E008':'CompleteXML/render:positive rodleft,nearnegative/farpositivepolarizationwithinneutralbody;96pxleftattractionarrowlargerthan53pxrightrepulsion. Comparisonisqualitative,notpoint-sourceinverse-squarescaleormetricbodydimension;netleftdirectioncorrect.'}


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
            'calculationScope': 'NO_STUDENT_CALCULATION' if key in ('C4-E007','C4-E008') else 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
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
