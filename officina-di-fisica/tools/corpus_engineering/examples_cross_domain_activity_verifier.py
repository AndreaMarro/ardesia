"""Independent full reading of six original C6 worked examples,31blocks/oneSVG.

Preserves E003 false exact equality and E004 missing prompt detector geometry.
No authored revisions or human approval, and no exam-question content is emitted.
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
BATCH='examples-cross-domain-033'
READ_SOURCE_SHA256={'C6-E001': '945fcbcedac7d400ac3a7221f1af0705c4e51334310690b85a45022d4031d88b', 'C6-E002': 'e094a7529838f2fd0be0c4b8589e47fdd56051b290f684cf794c756201c445f3', 'C6-E003': 'c839404e2c7c05da0f138de109b89e64ac31bb5db5f6fc4fd2e145c85b709981', 'C6-E004': 'f20471c6da49103370bd40f3c18667a6069fefb9a1596738574fa2d024fa3635', 'C6-E005': '80b98e1fdab6d03c1364c22c6cbbab31fde9f30274b2e75444972838b8f7964e', 'C6-E006': '05ffb1cd6319009d63ef48e191f1cfbfb97f9accf9757a6263be18c3f8b009d9'}
READ_ASSETS={'C6-pompa.svg':'24c5a9679e704c11392cbdedde8f62513d448fd978238ff044257da9bb84e274'}
FIGURES_BY_ID={key:(['C6-pompa.svg'] if key=='C6-E002' else []) for key in READ_SOURCE_SHA256}
SOURCE_ISSUES={
'C6-E003':'P3 exact-equality/rounding defect: the printed180/(0.050*4200)K=0.86K is false, with no rounding declaration in prompt or blocks. Exact6/7K differs from0.86 by1/350K;0.86 is a correct nearest-hundredth approximation only.',
'C6-E004':'P2 standalone prompt underdetermines detector signal: fixed detector area/orientation first appears in solution. A linear planar detector initially normal and then60degrees from radial incidence yields3/40 ratherthan3/20 after inverse-square and0.60transmission. State unchanged detector orientation/response in prompt or ask for incident irradiance explicitly.'}
SI=pint.UnitRegistry(non_int_type=Fraction)


def check(claim,actual,expected,unit='',scope='symbolic_source_claim'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),
            'unit':unit,'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    F=sp.Rational;Q=SI.Quantity
    actual='actual_source_example_manual_calculation'
    approx='actual_source_rounding_checked_not_exact_identity'
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    length=F(3,5);time=F(3,10**9);speed=length/time
    flow=Q(F(6,5),'liter/minute');mass=Q(1000,'kg/m^3')*flow*Q(1,'minute')
    inputpower=Q(6,'V')*Q(F(1,5),'A')
    heatpower=Q(F(1,2),'A')**2*Q(8,'ohm');inputheat=heatpower*Q(120,'s')
    received=inputheat*F(3,4);capacity=Q(50,'g')*Q(4200,'J/(kg*K)')
    delta=(received/capacity).to('K').magnitude
    intensityratio=F(3,5)*(F(1,2))**2
    work=Q(120,'kPa')*(Q(F(5,2),'liter')-Q(2,'liter'))
    incident=Q(200,'W/m^2')*Q(10,'cm^2');energy=incident*Q(20,'s');absorbed=energy/2
    p,V=sp.symbols('p V',positive=True)
    return {
    'C6-E001':[
        check('actual3nanoseconds conversion',Q(3,'ns'),F(3,10**9),'s',actual),
        check('actual one-way signal speed2e8',speed,2*10**8,'m/s',actual),
        check('working c3e8 timing index3over2',sp.Integer(300000000)/speed,F(3,2),'',actual),
        check('actual doublepath echo6nanoseconds',Q(2*length/speed,'s'),6,'ns',actual),
        check('oneway dimensions length over time',Q(F(3,5),'m')/Q(3,'ns'),2*10**8,'m/s'),
        check('exact SI c would roundindex to1point5',sp.Integer(int(bool(F('1.45')<sp.Integer(299792458)/speed<F('1.55')))),1,'',probe),
    ],
    'C6-E002':[
        check('actual1point2litres conversion',Q(F(6,5),'liter'),F(3,2500),'m^3',actual),
        check('actual water mass6over5kg',mass,F(6,5),'kg',actual),
        check('actual usefulpotential energy24joules',mass*Q(10,'m/s^2')*Q(2,'m'),24,'J',actual),
        check('actual electrical inputpower6over5watt',inputpower,F(6,5),'W',actual),
        check('actual inputenergy72joules',inputpower*Q(60,'s'),72,'J',actual),
        check('actual dimensionless efficiency one third',Q(24,'J')/Q(72,'J'),F(1,3),'',actual),
        check('actual usefulpower2over5watt',Q(24,'J')/Q(60,'s'),F(2,5),'W',actual),
        check('otheroutputs48joules balance',sp.Integer(72-24),48,'J'),
        check('qualified33percent correctly rounded',sp.Integer(int(bool(F('32.5')<100*F(1,3)<F('33.5')))),1,'',approx),
    ],
    'C6-E003':[
        check('actual Joule power2watt',heatpower,2,'W',actual),
        check('actual inputheat240joules',inputheat,240,'J',actual),
        check('actual water received180joules',received,180,'J',actual),
        check('actual50grams conversion',Q(50,'g'),F(1,20),'kg',actual),
        check('actual total heatcapacity210joulesperkelvin',capacity,210,'J/K',actual),
        check('independent temperatureincrease6over7kelvin',delta,F(6,7),'K',actual),
        check('SOURCE FALSE exact equality to0point86kelvin',delta,F('0.86'),'K','actual_source_false_exact_equality'),
        check('0point86 is valid only as hundredth approximation',sp.Integer(int(bool(F('.855')<delta<F('.865')))),1,'',approx),
        check('false identity residual minus1over350kelvin',delta-F('.86'),-F(1,350),'K'),
        check('under one kelvin heatbudget180less210',sp.Integer(int(bool(received.to('J').magnitude<capacity.to('J/K').magnitude))),1),
    ],
    'C6-E004':[
        check('intended inverse square factor onequarter',F(1,2)**2,F(1,4),'',actual),
        check('intended combined ratio3over20',intensityratio,F(3,20),'',actual),
        check('intended15percent nominalsignal',100*intensityratio,15,'',actual),
        check('independent planar detector60degree counterexample',intensityratio*sp.cos(sp.pi/3),F(3,40),'',probe),
        check('edge-on planar detector counterexample zero',intensityratio*sp.cos(sp.pi/2),0,'',probe),
        check('identical two attenuation factors multiply not add',F(3,5)*F(1,4),F(3,20)),
        check('inverse square irradiance dimensions',Q(1,'W')/Q(1,'m')**2,1,'W/m^2'),
    ],
    'C6-E005':[
        check('actual volume increase onehalf litre',Q(F(5,2),'liter')-Q(2,'liter'),F(1,2000),'m^3',actual),
        check('actual120kilopascal conversion',Q(120,'kPa'),120000,'Pa',actual),
        check('actual positive gaswork60joules',work,60,'J',actual),
        check('actual firstlaw gain25joules',Q(85,'J')-work,25,'J',actual),
        check('isobaric integral independently givespDeltaV',sp.integrate(p,(V,sp.Symbol('V1'),sp.Symbol('V2'))),p*(sp.Symbol('V2')-sp.Symbol('V1')),'J'),
        check('energy closes85equals25plus60',sp.Integer(25+60),85,'J'),
        check('work done on gas has opposite sign',-work,-60,'J',probe),
    ],
    'C6-E006':[
        check('actual10squarecentimetres conversion',Q(10,'cm^2'),F(1,1000),'m^2',actual),
        check('actual incidentpower onefifthwatt',incident,F(1,5),'W',actual),
        check('actual incidentenergy4joules',energy,4,'J',actual),
        check('actual absorbedenergy2joules',absorbed,2,'J',actual),
        check('actual temperatureincrease onehalfkelvin',absorbed/Q(4,'J/K'),F(1,2),'K',actual),
        check('doubletime under explicit fixedC losslessmodel doublesgain',absorbed*2/Q(4,'J/K'),1,'K',actual),
        check('heatcapacity notspecificheat dimension',Q(2,'J')/Q(4,'J/K'),F(1,2),'K'),
    ]}

MANUAL={
'C6-E001':'Actual0.60m/3.0ns=0.60/(3e-9)=2e8m/s. Courseworkingc3e8 gives timingindex3/2. Same material/path reverse has1.20m path so6ns. Signalspeed/effective timingindex is the scope; general dispersive phase/group indices are not equated. ExactSIc also rounds1.5 at shownprecision. Prefix/powers and division manual, no extra factor2 in distinct emitter/receiver measurement.',
'C6-E002':'Actual1.2L=1.2e-3m³ at1000kg/m³ gives1.2kg/min. Usefulmgh1.2*10*2=24J/min=0.4W. Electricalinput6*.2=1.2W for60s gives72J. Ratio24/72=1/3 and explicitapprox33percent is manually bounded32.5<100/3<33.5. Otheroutputs48J/min, not assumed all thermal or hydrodynamically apportioned. Same interval and relative usefulpotential output specified.',
'C6-E003':'ActualI²R=(1/2)²*8=2W, times120s=240J. Water gets3/4=>180J.50g=1/20kg,mc=210J/K. ExactDeltaT=180/210=6/7K. Originalprints=0.86K without any approximation/precision declaration in allfiveblocks orprompt, hence FAIL.6/7-.86=-1/350K. Integer crossproducts prove.855<6/7<.865, so0.86 would be a valid hundredth approximation with approxnotation. No calculator needed for exactfraction or rounding. Heat180J<210J perK confirmsunder1K.',
'C6-E004':'Intended fixed detector geometry/linear signal: distance doubles, inverse-square gives1/4, filter3/5 multiplies to3/20=15percent. But fixed area/orientation is only firststatedin workedsolution, not prompt. A planar linear sensor initially normal then60degrees rotated yields3/20*cos60=3/40=7.5percent with same source, distances and filter; edge-onidealresponse0. OriginalFAIL is standalone prompt/model issue, not wrong intended3/20 arithmetic. Ratios dimensionless, irradianceW/m² distinct totalpower.',
'C6-E005':'ActualDeltaV=2.5-2.0=.5L=5e-4m³,120kPa=120000Pa. Constant pressure quasi-static boundary work=120000*5e-4=60J positiveout. Q=+85J and DeltaU=Q-W=25J.85=25+60 closure. Manual5*12 powers; no calculator. Assumes assignedpressure absolute/effectiveexternalquasistatic boundarypressure and onlypVwork. No idealgas internalenergy formula is needed.',
'C6-E006':'Actual10cm²=10*(1e-2m)²=1e-3m². PerpendicularuniformI200W/m² gives.2W, over20s=4J incident. Absorbedhalf2J. TotalheatcapacityC4J/K givesDeltaT1/2K; not specificheat and no mass multiplication. Doubletime at same conditions yields1K. Sourceexplicitly bounds extrapolation by negligiblelosses/fixedC; manual finite decimal/fraction products.'}
ASSUMPTIONS={
'C6-E001':'Assigned delay is material one-way propagation time over0.60m with distinct fixed emitter/receiver, no instrument/interface contribution; effective constant signal speed and same returnpath. Indexc/v is timing/effective material index in course nondispersive model, not arbitrary equality of group and phase indices. Workingc3e8 is roundedcourseconstant.',
'C6-E002':'Steadygivenvolumetricflow/density and2m elevation, electrical6V/0.20A during sameinterval, nonnegativeotheroutputs; usefuloutput deliberately restricted to gravitationalpotential. No claim alloutputuseful or pumpfluidenergyfullydescribed.',
'C6-E003':'Constantgivenohmic8ohm/current.5A over120s, assigned75percent deliveryto50gwater, constantc4200 in smallsinglephaseinterval and no other energychange assigned. SourceFAIL is equality/precision, not Joulelaw or heatbudget.',
'C6-E004':'Pointisotropicconstantsource, inverse-square losslessair, assignedfiltertransmission.60 for relevant incidence. Intended detectorconstantarea/orientation/linearresponse onlysolution-level; promptdoesnotexcludeprojectedarearesponsechanges when moved. SourceFAILpreserved.',
'C6-E005':'Closedgassystem, quasistaticpiston, constant120kPa relevantboundarypressure, onlyexpansionpVwork, Q85J intogas. Workpositivebygas andDeltaUQ-W explicitlydefined; no imposedidealtemperature law.',
'C6-E006':'Uniformperpendicularbeam covers10cm²absorber, constantI200,50percentabsorption,20s exposure,C4J/Kwholeobjectconstant, negligiblelosses/nootherstorage. Onlyunderexplicitfixedregime doesdoubletime doublegain.'}
PEDAGOGY={
'C6-E001':'Distinguishesonewaytransmissionfromecho; dimensionalpowers and courseworkingc. No falseexactSIconstant or numericinversefunction assigned.',
'C6-E002':'Sameintervalenergycomparison, litres-to-mass, VIpower and usefulpotential definition beforepercent; approximate33percent correctlymarked.',
'C6-E003':'FAILminorprecision: correctphysicalmodel/exactfraction, but unqualifiedequalityto.86false. Do not silentlyread=asapprox. Separately authoredneweditionneeded; originalretained.',
'C6-E004':'FAIL: promptasksdetectorsignalwhileconstantdetectorgeometryappearsfirstinsolution. Explicitunchangednormal/orientation/linearresponse or askingirradiancewouldmake15percentunique; no autoedit.',
'C6-E005':'Grapharea is a verbal pVrepresentation, no missingfigure. Signconvention and energyclosurearevisible; genericbilancedoesnotrequire idealgas.',
'C6-E006':'Correctsarea-squareprefix and distinguishesobjectheatcapacityfromspecificheat; absorbedversusincidentenergy, boundedlinear-timeextension.'}
FIGURE_REVIEW={key:('C6-pompa.svg fullXML and complete640x235Chromiumrender independentlyread, actualGit/staticbytesidentical. Left electricalarrowenterspump; right liftedwaterarrowanddownothertransfersleave;6V*.20A and1.2L/min*2m match inputs. Arrowlengths schematic, no quantitativeenergywidthscaleassigned; do not infer allremainingoutputs thermal.' if key=='C6-E002' else 'All originalblocksread: no figure reference, no hidden numericgraphic required.') for key in READ_SOURCE_SHA256}
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
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,
        'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,
        'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount':sum(row['ok'] for row in records),'failedCount':sum(not row['ok'] for row in records),
        'draftReviewedCount':0,'failedPublishedEditionIds':sorted(SOURCE_ISSUES),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
