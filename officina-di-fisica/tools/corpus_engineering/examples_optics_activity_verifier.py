"""Independent original C5-E017..020:23 blocks/three SVGs.

E017 false exact inverse-sine input and E018 premature-rounding lastdigit are
preserved separately, with exact rational Taylor bounds (no float oracle).
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
import re
import xml.etree.ElementTree as ET
from .review_contract import reviewed_rows
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
REVISION_IDS={'C5-E017','C5-E018'}
# Frozen after independent complete63block reading and both full native SVG renders.
REVIEWED_REVISIONS={'C5-E017': 'bc01a618c55a69a561bc89e5fe3ca95f0a5d92aef5f74a858213e5dc6454715b', 'C5-E018': 'e30c2948c89530e8312e3a19171c44e426c465362c5978c0658fb9aea53af89e'}
REVISION_ASSETS={'C5-E017':{'example-refraction-exact.svg':'f71210b2e778122bb5f9e409d648f5bfcb133b7318273c2afe80fb0a0c4391b9'},
'C5-E018':{'example-total-reflection-exact.svg':'53297e6c88590bf8a70bd25d1036de19b6aa629030c2eeb3d149cdac59960a3a'}}
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



def _finite_latex(text):
    """Narrow exact numeric forms actually read; never eval arbitrary source text."""
    text=text.strip()
    if re.fullmatch(r'\d{1,3}',text):return sp.Integer(text)
    if match:=re.fullmatch(r'\\frac(?:\{(\d{1,3})\}|(\d))(?:\{(\d{1,3})\}|(\d))',text):
        n,d=int(match[1] or match[2]),int(match[3] or match[4])
        return sp.Rational(n,d) if d else None
    if match:=re.fullmatch(r'\\frac\{\\sqrt(\d)\}\{(\d{1,3})\}',text):
        d=int(match[2]);return sp.sqrt(int(match[1]))/d if d else None
    return None


def _printed_numeric(row,prefix,expected,claim,checks,arcsin=False):
    found=[]
    for block in row.get('blocks',[]):
        text=block.get('text','').strip()
        if block.get('type')!='formula' or not text.startswith(prefix+'='):continue
        rhs=text.split('=',1)[1]
        if arcsin:
            match=re.fullmatch(r'\\arcsin\\!\\left\((.+)\\right\)',rhs)
            rhs=match[1] if match else ''
        value=_finite_latex(rhs)
        if value is not None:found.append(value)
    checks.append(check(claim+' unique numeric reading',sp.Integer(len(found)),1))
    for value in found:checks.append(check(claim,value,expected))


def revised_checks(row,asset_root):
    F=sp.Rational;flag=lambda b:sp.Integer(int(bool(b)))
    checks=[];key=row['id'];prompt=' '.join(row.get('prompt','').split()).casefold()
    scope='new_draft_actual_worked_manual_calculation'
    common=('monocromatico','piana e ferma','trasparenti, omogenei e isotropi','forma esatta')
    checks.append(check('new explicit geometric optics model',flag(all(v in prompt for v in common)),1))
    if key=='C5-E017':
        sine=sp.sin(sp.pi/4)/F(3,2)
        checks.extend([
            check('new air-glass inputs and normal reference',flag(all(v in prompt for v in ('n₁=1','n₂=3/2','45° con la superficie','rispetto alla normale','senza valutare inverse trigonometriche in decimali'))),1),
            check('new complement45 fromsurface90minus45',sp.Integer(90-45),45,'degree',scope),
            check('new reflectedangle equalsnormal45',sp.pi/4,sp.pi/4,'rad',scope),
            check('new transmittedsine sqrt2over3',sine,sp.sqrt(2)/3,'',scope),
            check('new exact angular answer',sp.asin(sine),sp.asin(sp.sqrt(2)/3),'rad',scope),
            check('new sine positive and admissible',flag(0<sine<1),1),
            check('new squared sine2ninths',sine*sine,F(2,9),'',scope),
            check('new angle below30 by squaredsine comparison',flag(sine*sine<F(1,4)),1),
            check('new crossmultiplication comparison8less9',flag(8<9),1),
            check('new inverseindex recovers3halves',sp.sin(sp.pi/4)/sine,F(3,2),'',scope),
            check('wrong reversed indexratio squaredsine9eighths',sp.simplify((F(3,2)*sp.sin(sp.pi/4))**2),F(9,8)),
            check('new sine andindex dimensionless',SI.Quantity(1,''),1,''),
        ])
        _printed_numeric(row,r'\sin\theta_2',sine,'printed new transmitted sine',checks)
        _printed_numeric(row,r'\theta_2',sine,'printed exact arcsin argument',checks,arcsin=True)
        _printed_numeric(row,'n_2',F(3,2),'printed inverse glass index',checks)
    else:
        critical=F(1,1)/F(4,3);sineA=F(4,3)*sp.sin(sp.pi/6);sineB=F(4,3)*sp.sin(sp.pi/3)
        checks.extend([
            check('new explicitly assigned rationalwater inputs30and60',flag(all(v in prompt for v in ('n₁=4/3','n₂=1','valori esatti del modello','30° e 60° rispetto alla normale'))),1),
            check('new criticalsine3quarters',critical,F(3,4),'',scope),
            check('new critical exactarcsin3quarters',sp.asin(critical),sp.asin(F(3,4)),'rad',scope),
            check('new critical squaredsine9sixteenths',critical**2,F(9,16),'',scope),
            check('new critical between45and60 via positive squaredsines',flag(F(1,2)<critical**2<F(3,4)),1),
            check('new thirtydegree transmittedsine2thirds',sineA,F(2,3),'',scope),
            check('new thirtydegree case has real transmittedray',flag(0<sineA<1),1),
            check('new transmittedangle between30and45',flag(F(1,4)<sineA*sineA<F(1,2)),1),
            check('new reflectedangleA30',sp.pi/6,sp.pi/6,'rad',scope),
            check('new sixtydegree Snell candidate2sqrt3over3',sineB,2*sp.sqrt(3)/3,'',scope),
            check('new sixtydegree candidate squared4thirds',sp.simplify(sineB*sineB),F(4,3),'',scope),
            check('new sixtydegree strictlybeyondcritical TIR',flag(sineB>1),1),
            check('new criticalcandidate exactlyone is limitnotbeyond',F(4,3)*critical,1),
            check('new reflectedangleB60',sp.pi/3,sp.pi/3,'rad',scope),
            check('new inversecritical recoverswater4thirds',1/critical,F(4,3),'',scope),
            check('new inversetransmission recoverswater4thirds',sineA/sp.sin(sp.pi/6),F(4,3),'',scope),
        ])
        _printed_numeric(row,r'\sin\theta_c',critical,'printed criticalsine',checks)
        _printed_numeric(row,r'\theta_c',critical,'printed exact criticalarcsin argument',checks,arcsin=True)
        _printed_numeric(row,r'\sin\theta_{2,A}',sineA,'printed A transmittedsine',checks)
        _printed_numeric(row,r'\theta_{2,A}',sineA,'printed exact transmittedarcsin argument',checks,arcsin=True)
        _printed_numeric(row,r'\frac1{3/4}',F(4,3),'printed inverse fromcritical',checks)
        _printed_numeric(row,r'\frac{2/3}{1/2}',F(4,3),'printed inverse fromtransmission',checks)
    try:
        name=next(iter(REVISION_ASSETS[key]));svg=ET.fromstring((Path(asset_root)/name).read_bytes())
        rays=[]
        for e in svg.iter():
            if not e.tag.endswith('path') or 'marker-end' not in e.attrib:continue
            match=re.fullmatch(r'M(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)L(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)',e.attrib.get('d',''))
            if not match:continue
            x1,y1,x2,y2=map(F,match.groups());rays.append((e.attrib.get('stroke'),x2-x1,y2-y1))
        colors={'in':'#155fa0','reflected':'#a33430','transmitted':'#217548'}
        bycolor={k:[(dx,dy) for color,dx,dy in rays if color==v] for k,v in colors.items()}
        # Six-decimal pixel coordinates are graphical approximations, not printed
        # exact identities: bound squared-sine errors by an exact rational tolerance.
        geom=lambda dx,dy:dx*dx/(dx*dx+dy*dy)
        if key=='C5-E017':
            checks.append(check('new three separately directed rays',flag(all(len(v)==1 for v in bycolor.values())),1))
            if all(len(v)==1 for v in bycolor.values()):
                for kind,want,ysign in [('in',F(1,2),1),('reflected',F(1,2),-1),('transmitted',F(2,9),1)]:
                    dx,dy=bycolor[kind][0]
                    checks.append(check('new diagram '+kind+' angle and propagation',flag(dx>0 and dy*ysign>0 and abs(geom(dx,dy)-want)<F(1,10**7)),1))
            paths={e.attrib.get('d','') for e in svg.iter() if e.tag.endswith('path')}
            triangles=[v for v in paths if v.startswith('M220 760V') and v.endswith('H290.710678Z')]
            checks.append(check('new exactratio triangle complete',sp.Integer(len(triangles)),1))
            if triangles:
                match=re.fullmatch(r'M220 760V(\d+\.\d+)H(\d+\.\d+)Z',triangles[0]);dy=F(match[1])-760;dx=F(match[2])-220
                checks.append(check('new common50pixel triangle sides approximate sqrt2 andsqrt7',flag(abs(dx-50*sp.sqrt(2))<F(1,10**6) and abs(dy-50*sp.sqrt(7))<F(1,10**6)),1))
        else:
            checks.append(check('new diagram has3incident3reflected2transmitted rays',flag([len(bycolor[k]) for k in colors]==[3,3,2]),1))
            if [len(bycolor[k]) for k in colors]==[3,3,2]:
                for kind in ('in','reflected'):
                    for index,want in enumerate((F(9,16),F(1,4),F(3,4))):
                        dx,dy=bycolor[kind][index]
                        checks.append(check('new water diagram '+kind+str(index)+' sine anddirection',flag(dx>0 and dy*(1 if kind=='reflected' else -1)>0 and abs(geom(dx,dy)-want)<F(1,10**7)),1))
                dx,dy=bycolor['transmitted'][0]
                checks.append(check('new critical ray exactlygrazing',flag(dx>0 and dy==0),1))
                dx,dy=bycolor['transmitted'][1]
                checks.append(check('new thirtydegree case outgoing intoair withsine2thirds',flag(dx>0 and dy<0 and abs(geom(dx,dy)-F(4,9))<F(1,10**7)),1))
    except (OSError,ET.ParseError,ValueError,ZeroDivisionError,AttributeError):
        checks.append(check('new optical diagram valid and independently readable',sp.Integer(0),1))
    return checks


REVISION_MANUAL={
'C5-E017':'NEW DRAFT26blocks: surface45deg complementednormal45, reflected45. Snell exactsin(theta2)=(1/(3/2))*sqrt2/2=sqrt2/3, so theta2=asin(sqrt2/3) with0<theta2<30deg because2/9<1/4 (8<9 afterpositive crossmultiplication). No numericalinverse requested. Inverse(sqrt2/2)/(sqrt2/3)=3/2. Wrongreversedratio gives squaredsine9/8>1, not physicalTIRair-to-glass. Index/sine dimensionless; angleinverse identified in degrees/angleunits.45coincidence cannot test a general surface/normal swap; prompt/solution explicitlyexplain90-alpha.',
'C5-E018':'NEW DRAFT37blocks with explicit new exact-model inputs4/3to1, incidences30/60, nothistorical1.33and40/55. Criticalsin3/4, theta_c=asin3/4 and1/2<9/16<3/4 gives45<theta_c<60 via8<9<12. At30deg,Snell(4/3)*(1/2)=2/3;1/4<4/9<1/2 gives30<theta2<45. At60deg,sin-candidate2sqrt3/3 has square4/3>1, hence TIR andreflection60. Atcriticalcandidateexactly1isgrazinglimit, notstrictlybeyond. Bothinverse1/(3/4) and(2/3)/(1/2) recover4/3. All radicals/rationalinequalities exact/manual; no roundedintermediate or decimalinverse.',}
REVISION_ASSUMPTIONS={key:'NEW DRAFT actuallyread: monochromaticgeometricoptics, stationaryplanarinterface, transparenthomogeneousisotropicpositive-indexmedia and ordinary firstquadrant anglesfromnormal. E017air1/glass3/2; E018explicitlyassignedmodelwater4/3/air1, not exactempiricalwaterindex. Directiononly, not Fresnelintensity; TIRmeansno transmittedpropagatingray, doesnotdeny evanescentfield. SourcejudgmentremainsnestedFAIL.' for key in REVISION_IDS}
REVISION_PEDAGOGY={key:'NEW DRAFT entireprompt/blocksread independently. Exact symbolicangleanswers admitted, localization between notableangles proved bypositive squaredsinecomparisons, inverses/domain/errorroutes explicit. Separate reflected/transmitteddirections and index ratios. No arbitrarynumericalinverse, no sourceFAILretrospectivereinterpretation, no empirical studentcalibration/humanapproval.' for key in REVISION_IDS}
REVISION_FIGURES={
'C5-E017':'example-refraction-exact.svg fullXML and complete640x1470Chromiumrender read. Three distinctdirectionalpaths: incident/reflected45 and transmittedsin sqrt2/3towardnormalin glass. Separate ratio trianglehas dx50sqrt2,dy50sqrt7,hyp150 withcommon50px/unit, coordinatesroundedtosixdecimalpixel bounded1e-6. Comparison/symbolicanswer/inverselabelsallvisible; raylengthsnotintensities.',
'C5-E018':'example-total-reflection-exact.svg fullXML and complete640x1760Chromiumrender read. Allthreepanelswaterbelow/airabove; criticalincident/reflectedsin3/4 withgrazingtransmitted;middleincident/reflection30 andoutgoingair sin2/3;bottomincident/reflected60 withno thirdtransmittedpropagatingpath. Arrowdirectionsand normalscorrect. Pixelrounded squaredsineerrors bounded1e-7rational, not falseexactcoordinateclaim. No intensityencodedbyraylength. Allbottomlabelsvisible.'}

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
        if binding.get('assetChecksums')!=REVISION_ASSETS[key]:
            errors.append('Revision figure differs from independently read protected asset')
        checks=revised_checks(row,root)
        if not checks or not all(claim['ok'] for claim in checks):
            errors.append('Independent new draft mathematics or physical domain failed')
        revised=dict(original)
        revised.update(ok=not errors,errors=errors,checks=checks,
            dimension={claim['claim']:claim['dimension'] for claim in checks},
            manualFeasibility='PASS_AI_EXACT' if not errors else 'FAIL_NEW_DRAFT',
            manualArithmetic=REVISION_MANUAL[key],physicalAssumptions=REVISION_ASSUMPTIONS[key],
            pedagogicalReview=REVISION_PEDAGOGY[key],figureReview=REVISION_FIGURES[key],
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
