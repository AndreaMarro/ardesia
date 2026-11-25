"""Independent exact solutions of C4-E009..016,33 blocks/four SVGs.

All eight worked examples require real manual numerical work. No authoring or
source answer key is imported; immutable reading pins bind all prompts/solutions.
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
BATCH='examples-circuits-capacitors-028'
READ_SOURCE_SHA256={
'C4-E009':'38048d0731bd875013d0ca4b57357e965ca302ee93d2661053d2d5918c62f459',
'C4-E010':'fe7197c37ec760826a8f63c622833459b35ec271be81443cfb4366b278e991f0',
'C4-E011':'f54ab1d09657f4396dd583ce8d693c85605a316d9c6df55cfbb3ccf1a9396322',
'C4-E012':'846a915fab11243e2627a5029013f13b70d13183ad386aef784ef3391ffd4e6f',
'C4-E013':'954eb02a3eb99f61ea3245a8df55ad70fc1ae3f2159ad225307bc06c8c615cf9',
'C4-E014':'ae74281221bcdff584079f47785cfdcd3c564a7e3e4733ab6c9c9c6a9c91bb94',
'C4-E015':'f04149a0f972073a3c9559d9f0aff0fc673e8ba43e45659530d2032b7b82cd14',
'C4-E016':'2b4bff3d20ea82cf239b779385020327ef557f34483d748c8d4cf733438e8b4b'}
READ_ASSETS={
'C4-ohm.svg':'e9aba90c0cdb89af126e62d397fb00952c59d5b527d5108c64ae34af5180874b',
'C4-reti.svg':'07ebbd01de644aef59e43dd7fd9bda2389f55fd148901332d65e108644272333',
'C4-condensatore.svg':'20cde9e81acdea30d4f7134a03b4634ecaa613c4dd13d2f55278e7027f8f6ce9',
'C4-reti-c.svg':'25ad5b7d73608cd8da31f1eaf583372363a27b0cd411ae5d0dffe7408821afbb'}
FIGURES_BY_ID={'C4-E009':['C4-ohm.svg'],'C4-E010':[],
'C4-E011':['C4-reti.svg'],'C4-E012':['C4-reti.svg'],'C4-E013':['C4-condensatore.svg'],
'C4-E014':[],'C4-E015':['C4-reti-c.svg'],'C4-E016':[]}
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
    current=F(9,100+200)
    rho,length,resistance=F(17,10**9),sp.Integer(2),F(68,1000)
    area=rho*length/resistance
    c1,c2=sp.Integer(3),sp.Integer(6)
    ceq=c1*c2/(c1+c2)
    charge=ceq*12
    source='actual_source_example_manual_calculation'
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    return {
    'C4-E009':[
      check('actual20mA isonefiftiethA',Q(20,'mA'),F(1,50),'A',source),
      check('VversusI slope is200ohm',Q(4,'V')/Q(20,'mA'),200,'ohm',source),
      check('actual6V prediction30mA',Q(6,'V')/Q(200,'ohm'),30,'mA',source),
      check('actual currentratio threehalves',F(30,20),F(3,2),'',source),
      check('actual voltageratio threehalves',F(6,4),F(3,2),'',source),
      check('swappedaxes slope isconductance notresistance',Q(20,'mA')/Q(4,'V'),F(1,200),'S',probe),
    ],
    'C4-E010':[
      check('actual inversearea formula yields5eMinus7squaremetres',area,F(5,10**7),'m^2',source),
      check('actualarea halfsquaremillimetre',Q(area,'m^2'),F(1,2),'mm^2',source),
      check('squaredlength conversion millionfactor',Q(1,'mm^2'),F(1,10**6),'m^2',source),
      check('area reinsertion recovers0point068ohm',rho*length/area,F(68,1000),'ohm',source),
      check('resistivitylengthoverresistance units squaremetre',Q(rho,'ohm*m')*Q(length,'m')/Q(resistance,'ohm'),F(5,10**7),'m^2',source),
      check('doubling area halvesresistance',rho*length/(2*area),resistance/2,'ohm',probe),
    ],
    'C4-E011':[
      check('actual seriesresistance300ohm',sp.Integer(100+200),300,'ohm',source),
      check('actual seriescurrentthreehundredths',current,F(3,100),'A',source),
      check('actual firstdrop3V',current*100,3,'V',source),
      check('actual seconddrop6V',current*200,6,'V',source),
      check('dropssumsource9V',current*100+current*200,9,'V',source),
      check('actual totalpower0point270W',9*current,F(27,100),'W',source),
      check('actual individualpowerfirst0point090W',current**2*100,F(9,100),'W',source),
      check('actual individualpowersecond0point180W',current**2*200,F(18,100),'W',source),
      check('powerbalance sumbranchespower',current**2*100+current**2*200,9*current,'W'),
    ],
    'C4-E012':[
      check('actual60ohmbranchcurrentonefifth',F(12,60),F(1,5),'A',source),
      check('actual120ohmbranchcurrentonetenth',F(12,120),F(1,10),'A',source),
      check('actual totalcurrentthreetenths',F(12,60)+F(12,120),F(3,10),'A',source),
      check('actual equivalentresistance40ohm',F(12,1)/(F(12,60)+F(12,120)),40,'ohm',source),
      check('reciprocaladdition independentlygives40ohm',1/(F(1,60)+F(1,120)),40,'ohm'),
      check('halved resistance atcommonvoltage doublescurrent',F(12,60)/F(12,120),2),
      check('parallelpowerbalance sourceandbranchpowers',F(12**2,60)+F(12**2,120),12*F(3,10),'W'),
    ],
    'C4-E013':[
      check('actual platecharge20microcoulomb',Q(4,'uF')*Q(5,'V'),20,'uC',source),
      check('actual fieldenergy50microjoule',Q(4,'uF')*Q(5,'V')**2/2,50,'uJ',source),
      check('oppositeplate charges totalzero',sp.Integer(20-20),0,'uC'),
      check('independent Qsquaredover2C gives50microJ',F(20**2,2*4),50,'uJ'),
      check('independent halfQV gives50microJ',F(20*5,2),50,'uJ'),
      check('charging integral voltagegrows fromzerogivesonehalf',sp.integrate(sp.Symbol('q')/4,(sp.Symbol('q'),0,20)),50,'uJ'),
    ],
    'C4-E014':[
      check('actual initialfreecharge24microC',sp.Integer(2*12),24,'uC',source),
      check('actual filledcapacitance6microF',sp.Integer(2*3),6,'uF',source),
      check('actual finalvoltage4V',F(24,6),4,'V',source),
      check('actual initialenergy144microJ',F(2*12**2,2),144,'uJ',source),
      check('actual finalenergy48microJ',F(6*4**2,2),48,'uJ',source),
      check('fixedQ energy fallsbyfactor3',F(48,144),F(1,3),'',source),
      check('releasedfieldenergy96microJ',sp.Integer(144-48),96,'uJ'),
      check('connectedfixedV wouldinsteadgive432microJ',F(6*12**2,2),432,'uJ',probe),
    ],
    'C4-E015':[
      check('actual seriescapacitance2microF',ceq,2,'uF',source),
      check('actual equalchargemagnitudes24microC',charge,24,'uC',source),
      check('actual firstvoltage8V',charge/c1,8,'V',source),
      check('actual secondvoltage4V',charge/c2,4,'V',source),
      check('voltagedropssum12V',charge/c1+charge/c2,12,'V'),
      check('smaller capacitance biggerdrop ratio2',(charge/c1)/(charge/c2),2),
      check('individualenergy sum agreeswithequivalent',c1*(charge/c1)**2/2+c2*(charge/c2)**2/2,ceq*12**2/2,'uJ'),
    ],
    'C4-E016':[
      check('actual isolatedpositivenode18microC',sp.Integer(2*9+4*0),18,'uC',source),
      check('actual settledcommonvoltage3V',F(2*9+4*0,2+4),3,'V',source),
      check('actual finalnodechargeconserved',sp.Integer(2*3+4*3),18,'uC'),
      check('actual initialenergy81microJ',F(2*9**2,2),81,'uJ',source),
      check('actual finalenergy27microJ',F((2+4)*3**2,2),27,'uJ',source),
      check('actual removedfieldenergy54microJ',F(2*9**2,2)-F((2+4)*3**2,2),54,'uJ',source),
      check('independent joiningloss formula recovers54',F(2*4,2*(2+4))*(9-0)**2,54,'uJ'),
      check('final individualplatecharges6and12 microCsum18',sp.Integer(6+12),18,'uC'),
    ]}

MANUAL={
'C4-E009':'Actual20mA=20/1000=1/50A. V(I)originline R=4/(1/50)=200ohm; at6V current6/200=3/100A=30mA. Ratios30/20=6/4=3/2. Swappingaxes yields1/200S,not200ohm. Sameohmicregimemustpersist; the sourcecaptionexplicitly saysdrawinghasnonumericscale, so its pixels do not determineR.',
'C4-E010':'Actual A=rho*length/R=(17/10^9)*2/(68/1000)=34/68*10^-6=5e-7m². Since1mm²=1e-6m²,thearea is1/2mm². Substitutionrho*2/Areturns68/1000ohm. Thisisarea,notradius;nosquarerootisrequested. Givenresistivityappliesatfixedtemperature;no unspecifiedtemperaturevalueisneededtoinverttherelation.',
'C4-E011':'Actual100+200=300ohm, I9/300=3/100A. DropsI*100=3V,I*200=6V sum9V. Sourcepower9*(3/100)=27/100W;resistorpowersI²*100=9/100W andI²*200=18/100W sum27/100W. Exactfractionmultiplicationchecksallworkednumbers. Seriesleftpathisexplicit,notparallelrightpath.',
'C4-E012':'Actualcommon12V gives12/60=1/5A,12/120=1/10A,total3/10A. Equivalent12/(3/10)=40ohm;reciprocal1/(1/60+1/120)=40independently.40<60andcurrentratio2matchtext. Branchpowers12²/60+12²/120=18/5W equal12*3/10;thisisareviewercrosscheck,notanextraassignedquantity. RightdiagramusesbothsameA/Bnodes.',
'C4-E013':'Actual4microF*5V=20microC ononeplate and-20ontheother,totalzero. Energyhalf*4microF*25V²=50microJ. IndependentlyQ²/(2C)=400/8=50microJ andQV/2=20*5/2=50microJ;chargingintegral q/C from0toQexplainsonehalf. Netchargezero isnotzerofieldenergy. Noadditionalarea/gapnumbersaredemandedfromthequalitativediagram.',
'C4-E014':'ActualinitialQ2microF*12V=24microC. DisconnectbothleadsbeforefillingsoQfixed;capacitancetriples6microF,finalV24/6=4V. Ui=(1/2)*2*144=144microJ;Uf=(1/2)*6*16=48microJ,one-third.96microJleavefieldandmayexchangeasmechanicalenergy/dissipation. Aconnected12Vsourcewouldinsteadgive432microJ;thisexcludedboundaryconfirmsthedisconnectionconditionmatters.',
'C4-E015':'ActualCseries=(3*6)/(3+6)=2microF,Q2*12=24microC. Initiallyneutralfloatingmiddleenforcesequalchargemagnitudes. V1=24/3=8V,V2=24/6=4V sum12;equivalent2<3microF. Independentenergieshalf*3*64=96microJ andhalf*6*16=48microJ sum144microJ equalhalf*2*144. No calculator.',
'C4-E016':'Actualisolatedpositiveplategroupcharge2*9+4*0=18microC;finalCsum6microF givesV18/6=3V. Finalcharges6and12microC sum18. Ui=half*2*81=81microJ,Uf=half*6*9=27microJ,loss54microJ. Independentloss C1*C2*(V1-V2)²/[2(C1+C2)]=8*81/12=54microJ. Textusesrealsettlingcircuitandnamesheatpossibility;itdoesnotassumeanundampedidealLCloopinstantlysettlesorconserveelectricfieldenergyalone.'}
ASSUMPTIONS={
'C4-E009':'Linearohmicresistoratthesameconditions, Vvertical/Ihorizontal,sameoriginline.20mAand4Varepromptdata,notinferredfromschematicpixels.',
'C4-E010':'Uniformhomogeneouswire,length2m,crosssectionnormaltocurrent,assignedresistivityandtargetRatthecorrespondingfixedtemperature. Squaredlengthunitconversion;thinwirelumpedmodel.',
'C4-E011':'Ideal9Vsource,linearpositive100/200ohmseriesresistors,idealwires,steadystate,passivevoltagedrops. Samecurrentthroughboth,bothpotentialdropsnotindividually9V.',
'C4-E012':'Ideal12Vsourceandpositive60/120ohmresistorssharingthesametwonodes,linearsteadystate/idealwires. Branchcurrentsaddundernochargestorage.',
'C4-E013':'Linearideal4microFcapacitor,5Vpotentialmagnitude,oppositefreeplatecharges. Uformulaexcludessource/mechanicallossesnotasked;netglobalchargemayzeroatpositiveenergy.',
'C4-E014':'Lineardielectricfullyfillsgapandtriplescapacitance;bothleadsdisconnectedbeforeinsertion,noleakage,freeplateQfixed. Mechanicalenergymaychange;fixedV/batteryconnectionisadifferentproblem.',
'C4-E015':'Linear3/6microFcapacitorsinserieswithfloatinginitiallyneutralmiddlenode,12Vtotal. Chargeequalitywouldnotfollowforaninitiallychargedmiddlenode.',
'C4-E016':'First2microFcapacitor9Vanddisconnected,second4microFinitiallyuncharged,correspondingplatesconnectedwithoutsource. Eachisolatedconductor-groupalgebraicchargeconserved. RealtransientsettlesatcommonV;energycanleaveelectricfieldasheat/radiation,notclaimedconservedtherealone.'}
PEDAGOGY={
'C4-E009':'ConvertsmAbeforeV/Islopeandretainsaxismeaning;explicitcaptionremovesnumericpixelscaleandpredictionconditionalonohmicregime.',
'C4-E010':'Invertsresistivitylawbeforeinsertingnumbers,checksmm²conversionandinverseR;doesnotconfuseareaanddiameter.',
'C4-E011':'Identifiesseriespath,checksdropandpowerbalances;allprovidedworkednumbersarechecked.',
'C4-E012':'Sharednodesprecedebranchcurrents,thenpositiveequivalentboundandfactor2comparison.',
'C4-E013':'Qisoneplatemagnitude,notbothabsolutechargessummed;fieldenergycanbepositivewithnetzerocharge.',
'C4-E014':'DisconnectconditionprecedeschoiceoffixedQ;energychangeallowsmechanicalexchangeinsteadfalselydeclaringenergyconservationonlyincapacitor.',
'C4-E015':'Neutralmiddlenodeconditionisexplicitintheprompt,notanunstatedserieschargeassumption. Dropsandboundprovideindependentchecks.',
'C4-E016':'Conserveschargeoftheconnectedplategroup,notfieldenergy;distinguishesinitial/settledstatesandrealtransient.'}
FIGURE_REVIEW={
'C4-E009':'C4-ohmcompleteXML/renderalreadyreadin020,re-viewedandGit-bytecheckedhere. Vvertical,Ihorizontal,positiveoriginline,slopeconstruction;sourceexplicitlynumericallyuncalibrated. Doesnotdepictprompt20mA/4Vtoapixelscale.',
'C4-E010':'No figureinallfourblocks.',
'C4-E011':'C4-reticompleteXML/renderandGitbyteschecked;leftR1/R2onlyunbranchedA-Bpathmatchesstatedseriescase. No numericalresistanceencodedincomponentlengths.',
'C4-E012':'SameimmutableC4-retifigure;righttwobranchesconnectsameA/Bbuseswithnoshortingwire,asworkedcaseuses.',
'C4-E013':'C4-condensatorecompleteXML/render/Gitbyteschecked;+Qupper/-Qlowerandfivefieldarrowsdown. Area/gapqualitative,notextraassignednumericdata.',
'C4-E014':'No figureinallfourblocks;fullfill/tripleC/disconnectareexplicitpromptconditions.',
'C4-E015':'C4-reti-ccompleteXML/render/Gitbyteschecked;lefttwocapacitorsinserieswithfloatingmiddlewireandunshortedplate gaps. Sourcepromptstatesinitialneutrality.',
'C4-E016':'No figureinallfourblocks;polaritycorrespondenceandinitialunchargedsecondcapacitorexplicit.'}


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
