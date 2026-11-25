"""Independent original C5-E017..020:23 blocks/three SVGs.

E017 false exact inverse-sine input and E018 premature-rounding lastdigit are
preserved separately, with exact rational Taylor bounds (no float oracle).
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
BATCH='examples-optics-032'
READ_SOURCE_SHA256={
'C5-E017':'55b6070a7bd23e2ef92297bc9e2064adc519c63e3a8e98ceaa2b211d741bb30b',
'C5-E018':'c811d98f55d2ef93ffb7fbe7d651eac76db3ff9e0b7fb6575993f85573b8dda4',
'C5-E019':'062c14487b0a86e0d31a9e275302ca5f239dfecd87e709f29ddf18c935387c69',
'C5-E020':'09d0eea7fa7fead98e1b80a327f51ec9ed9676ab942030bf6e3ca804b5590af5'}
READ_ASSETS={
'C5-rifrazione.svg':'12fbefd55feb65146632a6cf1295e143c2014048c7ad44b5cb09b71df277a26e',
'C5-lente-reale.svg':'fc2ef2fc62d53691378c1258e2eb72017bbe6cbb7e66ab664720cce13c45f7f4',
'C5-lente-virtuale.svg':'774c01eee8661d1802b9f7cccca4a8f893c99673ded0e538ffc7ee3a2eff05f5'}
FIGURES_BY_ID={'C5-E017':['C5-rifrazione.svg'],'C5-E018':[],
'C5-E019':['C5-lente-reale.svg'],'C5-E020':['C5-lente-virtuale.svg']}
SOURCE_ISSUES={
'C5-E017':'P2 false exact chain/manual procedure: exact sin(theta2)=sqrt(2)/3 is rounded to0.471, then source states theta2=arcsin(0.471). These are not equal; exact squared-sine gap3431/9000000. Exact symbolic inverse must be retained; numerical degree evaluation needs an optional qualified/manual procedure.',
'C5-E018':'P3 optional approximation precision: source shows transmittedangle58.8degrees afterrounding sine to0.855. Nominal exact n1.33 at40deg gives58.74951959...deg, so directnearest0.1deg is58.7. Exact rational bounds placeit58.65..58.75. Criticalangle48.8 andrefraction/TIR classification remaincorrect; this isnot a direction/model failure.'}
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
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    pi_lo,pi_hi=F(314159,100000),F(355,113)
    flag=lambda condition:sp.Integer(int(bool(condition)))
    sin_lower=lambda u:sum((-1)**j*u**(2*j+1)/sp.factorial(2*j+1) for j in range(6))
    sin_upper=lambda u:sum((-1)**j*u**(2*j+1)/sp.factorial(2*j+1) for j in range(7))
    n=F(133,100)
    sin40lo,sin40hi=sin_lower(2*pi_lo/9),sin_upper(2*pi_hi/9)
    theta40_sinlo,theta40_sinhi=n*sin40lo,n*sin40hi
    # All degrees convertedexactly before rational sine seriesbounds.
    upper58point65=sin_upper(F(391,1200)*pi_hi)
    lower58point75=sin_lower(F(47,144)*pi_lo)
    criticalsin=F(100,133)
    return {
    'C5-E017':[
     check('actual surface45 complementedtonormal45',90-45,45,'degree',source),
     check('actual reflectionangle45',sp.pi/4,sp.pi/4,'rad',source),
     check('actual exacttransmittedsine sqrt2over3',sp.sin(sp.pi/4)/F(3,2),sp.sqrt(2)/3,'',source),
     check('actual exacttransmittedangle symbolic',sp.asin(sp.sqrt(2)/3),sp.asin(sp.sqrt(2)/3),'rad'),
     check('source exactthetaequalsasinrounded471 wouldrequirezerosquaredsinegap',F(2,9)-F(471,1000)**2,0,'',source),
     check('independent nonzero squaredsinegap quantifiesbadexactchain',F(2,9)-F(471,1000)**2,F(3431,9000000)),
     check('actual final28point1 isvalidrounded separately',flag(sin_upper(F(187,1200)*pi_hi)**2<F(2,9) and F(2,9)<sin_lower(F(563,3600)*pi_lo)**2),1),
    ],
    'C5-E018':[
     check('exact criticalangle asin100over133',sp.asin(criticalsin),sp.asin(F(100,133)),'rad',source),
     check('40degree Snell upperbound belowone',sp.Integer(int(bool(theta40_sinhi<1))),1),
     check('55degree Snell lowerbound aboveone',sp.Integer(int(bool(n*sin_lower(F(11,36)*pi_lo)>1))),1),
     check('critical48point8 nearesttenth valid',flag(sin_upper(F(13,48)*pi_hi)<criticalsin and criticalsin<sin_lower(F(977,3600)*pi_lo)),1),
     check('actual40deg transmittedangle above58point65',sp.Integer(int(bool(upper58point65<theta40_sinlo))),1),
     check('actual40deg transmittedangle below58point75',sp.Integer(int(bool(theta40_sinhi<lower58point75))),1),
     check('source58point8 nearesttenth wouldrequireangleatleast58point75',sp.Integer(int(bool(theta40_sinlo>=lower58point75))),1,'',source),
     check('independent directround58point7 interval holds',sp.Integer(int(bool(upper58point65<theta40_sinlo and theta40_sinhi<lower58point75))),1),
     check('1point33 times sin55 rounds1point09',flag(F('1.085')<n*sin_lower(F(11,36)*pi_lo) and n*sin_upper(F(11,36)*pi_hi)<F('1.095')),1),
    ],
    'C5-E019':[
     check('actual inverseimage distanceoneover15percm',F(1,10)-F(1,30),F(1,15),'1/cm',source),
     check('actual realimage distance15cm',1/(F(1,10)-F(1,30)),15,'cm',source),
     check('actual magnificationnegativeonehalf',-F(15,30),-F(1,2),'',source),
     check('actual imageheightnegative1point5cm',-F(1,2)*3,-F(3,2),'cm',source),
     check('realimage betweenfarfocustenanddoubletwenty',sp.Integer(int(10<15<20)),1),
     check('commoncentimetreunits convertcorrectimage distance',Q(10,'cm')*Q(30,'cm')/(Q(30,'cm')-Q(10,'cm')),15,'cm',source),
     check('independent principalrays intersectat15cm',sp.solve(sp.Eq(3-3*sp.Symbol('x')/10,-3*sp.Symbol('x')/30),sp.Symbol('x'))[0],15,'cm'),
    ],
    'C5-E020':[
     check('actual inversevirtualimage distance minusoneover12',F(1,12)-F(1,6),-F(1,12),'1/cm',source),
     check('actual virtualimage distance minus12cm',1/(F(1,12)-F(1,6)),-12,'cm',source),
     check('actual uprightmagnificationplus2',-F(-12,6),2,'',source),
     check('independent principalrayextensions intersectatminus12',sp.solve(sp.Eq(1-sp.Symbol('x')/12,-sp.Symbol('x')/6),sp.Symbol('x'))[0],-12,'cm'),
     check('virtualpoint onobjectside physicalemergingraysdiverge',sp.Integer(int(-12<0)),1),
     check('same half-focalobject genericmagnification2',sp.simplify(-(sp.Symbol('f')*(sp.Symbol('f')/2)/(sp.Symbol('f')/2-sp.Symbol('f')))/(sp.Symbol('f')/2)),2),
    ]}

MANUAL={
'C5-E017':'Actualsurfaceangle45givesnormalangle90-45=45andreflection45deg. Snell exactsin(theta2)=sqrt2/3;exacttheta2=asin(sqrt2/3). Sourcefirstroundssineto0.471thenstatesexacttheta2=asin(0.471);squaringwouldrequire2/9=(471/1000)², falseby3431/9000000. Trueangle28.1255057degandrounded-inputangle28.0992283degbothround28.1butarenotidentical. Highprecisionwasanadditionalreviewcrosscheck,notamanualstudentmethod. ExactrationalTaylorboundscancheckoptional28.1nearesttenth;thepublishedliteralexactchainandunexplainednumericalinverseprocedureareFAIL. Figure28wholedegreeannotationremainsvalidandisnotthesourceofthisfinding.',
'C5-E018':'Exactcriticalangleasin100/133;40degcaseexactsin(theta2)=(133/100)*sin(2pi/9)<1,soarealtransmittedray.55degcasegivesproduct>1,soTIRingeometricmodel. RationalTaylorseriesboundswith3.14159<pi<355/113confirmbothandcriticalrounded48.8. Theyalsoprove58.65deg<theta2(40)<58.75deg,so58.7isnearesttenthatthegivennominalindices. Source58.8comesfromfirstroundingthesine0.85490752...to0.855andinvertingthat;optionalapproxprecisionP3ratherthanwrongrefraction/TIRphysics. Directreviewhighprecision58.74951959degvsthe rounded-input58.75973478isnotclaimedstudentmanualwork. No needtoforceanumericalinversetriganswerwhereexactexpression/classificationwouldsuffice.',
'C5-E019':'Actual1/q=1/10-1/30=(3-1)/30=1/15percm,soq+15cm. m=-15/30=-1/2;hprime=(-1/2)*3=-3/2cm. Realimageisscreenable15cmonexit,betweenf10and2f20. Independentlyraysy=3-3x/10andy=-3x/30intersectx15,y-1.5. Sharedunits/negativeheightareexplicit;nosquare-rootortrignumerics.',
'C5-E020':'Actual1/q=1/12-1/6=-1/12percm,soq-12cm,m=-(-12)/6=2. Principalraybackwardextensionsy=1-x/12andy=-x/6meetx-12,y2forunitobjectheight,whilephysicaloutgoingraysdiverge. Imageliesonobjectside,upright/doubletransverseheight. Eyeonexitsidecanfocusdivergingrayswithappropriateposition/accommodation;nofiniteexit-sidescreenformsvirtualimage. Transversem2isnotaclaimangularmagnification2forallobserverpositions.'}
ASSUMPTIONS={
'C5-E017':'Ordinarypositiveair/glassindices1and1.5,stationaryinterface,geometricrayanglesfromnormal. ExactworkinginputsandtrueinverseofexactSnellsine mustnotbeidentifiedwithroundedinputinverse. Approximatewhole-degreepictureisqualitative,notfalseexactformula.',
'C5-E018':'Givenworkingindices1.33to1.00,geometricalopticsofidealtransparentmediaandangles40/55fromnormal. SourceTIRclassificationcorrect,evanescentfieldnotdenied. P3concernsdisplayednearest-tenthprecisionafterprematurerounding,notmacroscopicmeasurementuncertaintyortheunderlyinglaw.',
'C5-E019':'Thinconvergingparaxiallens,samemediumbothsidespercoursemodel,f10cm,p30cmrealobject,height3cm. qpositiveexitrealimage,signedtransverseheight. Schematicsnotisotropicallycalibratedphysicalangleplots.',
'C5-E020':'Thinconvergingparaxiallens,f12cm,p6cmrealobjectandcommondistanceunits,samemediumpercourse. qnegativebackwardintersection/virtualimage,mtransverse. Viewingrequiresappropriateeyefocus/position,nouniversalangularmagnificationorhumanvisionmeasurementclaim.'}
PEDAGOGY={
'C5-E017':'FAILP2: preservesgoodnormal-angleconversionbutintroducesfalseexactinverseusingroundedsineandnumericaldegreeswithoutmanualprocedure. ExactsymbolicSnellanswerorqualifiedoptionalapproximationmustreplaceitinanewedition.',
'C5-E018':'FAILP3precisiononly:correctcritical-anglephysicsandclassifications,minorlastdigitfromdoublerounding;separatefromE017exactnotationfailure. Exactexpressionsandsupplied/manualboundscouldavoidunsupportednumericalinversework.',
'C5-E019':'Common-denominatorinversealgebraprecedessubstitution,signandheightinterpretationmatchrayconstruction.',
'C5-E020':'Explainsactualraysversusbackwardextensions,virtualsign,uprightheightandwhyanexit-sidescreendoesnotcapturethevirtualimage.'}
FIGURE_REVIEW={
'C5-E017':'C5-rifrazionecompleteXML/renderreadin024andbytechecked/re-viewedhere;normalvertical,incident/reflected45,Snell geometry consistent with the integer-rounded28degree label. Thatroundeddiagramlabelhasnoexactequalityanddoesnotjustifythefalseexactarcsin(0.471)block.',
'C5-E018':'No figureinallfiveblocks;allindices/anglesaretextual.',
'C5-E019':'C5-lente-realefullXML/render/Gitbyteschecked;axialp3f,q1.5fandheightminusonehalfmatchthisprompt. Existingtransverse/axialdrawingunitsschematic,notstatedisotropiccm-per-pixel;relativeheightsandfocalcrossingscorrect.',
'C5-E020':'C5-lente-virtualefullXML/render/Gitbyteschecked;p=f/2andq=-f,backwarddashedintersectionuprightdoubleheight. Actualrayssolid/divergent,extensionsdashed;sourcef12/p6sharesratioswithoutnumericpixelcalibration.'}


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
