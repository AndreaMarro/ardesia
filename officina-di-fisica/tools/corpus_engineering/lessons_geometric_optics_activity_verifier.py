"""Independent complete reading of C5-L09/L10:14 blocks/three SVGs.

Angles in degrees in the schematic are distinguished from exact Snell results.
No answer, source review flag or arithmetic cache is used as an oracle.
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
BATCH='lessons-geometric-optics-024'
READ_SOURCE_SHA256={
'C5-L09':'3f0ba3e5f6a738af6412b2c1f0d5aa084c3911ef009b4c4a56f523bb619d04b2',
'C5-L10':'8e567bbf648e9e46dd73cf8f47fbe5ee82b40cdd2356599caa4fbbdaea7c51db'}
READ_ASSETS={
'C5-rifrazione.svg':'12fbefd55feb65146632a6cf1295e143c2014048c7ad44b5cb09b71df277a26e',
'C5-lente-reale.svg':'fc2ef2fc62d53691378c1258e2eb72017bbe6cbb7e66ab664720cce13c45f7f4',
'C5-lente-virtuale.svg':'774c01eee8661d1802b9f7cccca4a8f893c99673ded0e538ffc7ee3a2eff05f5'}
FIGURES_BY_ID={'C5-L09':['C5-rifrazione.svg'],'C5-L10':['C5-lente-reale.svg','C5-lente-virtuale.svg']}
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
    c,v,n1,n2,f,p,h=sp.symbols('c v n1 n2 f p h',positive=True)
    q=sp.Symbol('q',real=True)
    theta1,theta2=sp.symbols('theta1 theta2',real=True)
    image=sp.solve(sp.Eq(h-h*q/f,-h*q/p),q)[0]
    magnification=-image/p
    # Manual nearest-degree annotation bound, using3.14<pi<22/7 and
    # alternating sine series for0<x<1. Neither numeric inverse-sine nor a
    # false exact identitytheta2=28degrees is introduced.
    lo=F(11,72)*F(22,7)  # upperradianbound for27.5degrees
    hi=F(19,120)*F(157,50)  # lowerradianbound for28.5degrees
    sinlo_upper=lo-lo**3/6+lo**5/120
    sinhi_lower=hi-hi**3/6
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    actual='actual_source_example_or_figure_manual_calculation'
    boundary='reviewer_boundary_probe_excluded_by_source_conditions'
    return {
    'C5-L09':[
      check('index c over v isdimensionless',Q(6,'m/s')/Q(4,'m/s'),F(3,2),'',probe),
      check('tangential phasecontinuity is Snell',n1*sp.sin(theta1)-n2*sp.sin(theta2),n1*sp.sin(theta1)-n2*sp.sin(theta2)),
      check('source n1one n2threehalves incidence45 exact transmittedsine',sp.sin(sp.pi/4)/F(3,2),sp.sqrt(2)/3,'',actual),
      check('normal incidence staysnormal',sp.asin(F(1,1)/F(3,2)*sp.sin(0)),0,'rad'),
      check('criticalangle sine is indexratio', (n2/n1)*n1,n2),
      check('higherindex atobliquity reducesthe sine',F(1,1)/F(3,2),F(2,3),'',actual),
      check('toy higherindex3over2 toone incidence45 exceedscritical',F(3,2)*sp.sin(sp.pi/4),3*sp.sqrt(2)/4,'',probe),
      check('toy totalinternalreflectionsquaredsine exceedsone',(F(3,2)*sp.sin(sp.pi/4))**2-1,F(1,8),'',probe),
      check('surface angle30 meansnormalangle60',sp.pi/2-sp.pi/6,sp.pi/3,'rad',probe),
      check('reversing exact refractedpath recoversincident45',F(3,2)*(sp.sqrt(2)/3),sp.sqrt(2)/2),
      check('normal incidence speedchangeswhileanglezero', (c/F(3,2))/c,F(2,3),'',probe),
      check('wholedegree28 annotation upperbound at27point5 is belowexactsine',sp.Integer(int(bool(sinlo_upper**2<F(2,9)))),1,'',actual),
      check('wholedegree28 annotation lowerbound at28point5 is aboveexactsine',sp.Integer(int(bool(sinhi_lower**2>F(2,9)))),1,'',actual),
      check('refraction pixelrounding squaredsine residual',F(54**2,54**2+101**2)-F(2,9),F(10,118053),'',actual),
      check('incident reflectedray equal45 slope magnitudes',F(97,97),1,'',actual),
      check('no finite refracted geometricalray ifsine greaterthanone',sp.Integer(int(bool(F(9,8)>1))),1,'',boundary),
    ],
    'C5-L10':[
      check('independent principalrayintersection derives image distance',image,f*p/(p-f),'m'),
      check('image distance satisfies thinlens equation',sp.simplify(1/p+1/image),1/f,'1/m'),
      check('magnification fromcentralray similartriangles',magnification,-f/(p-f)),
      check('actual p3f givesimage3fOver2',image.subs(p,3*f),3*f/2,'m',actual),
      check('actual p3f givesmagnificationminusonehalf',magnification.subs(p,3*f),-F(1,2),'',actual),
      check('actual pfOver2 givesvirtualimageMinusf',image.subs(p,f/2),-f,'m',actual),
      check('actual pfOver2 givesuprightdoubleimage',magnification.subs(p,f/2),2,'',actual),
      check('atp2f image2f andunitinvertedmagnification',image.subs(p,2*f),2*f,'m',probe),
      check('objectatfocus divergesimageposition fromright',sp.Integer(int(sp.limit(image,p,f,dir='+')==sp.oo)),1),
      check('objectinsidefocus divergesimageposition fromleft',sp.Integer(int(sp.limit(image,p,f,dir='-')==-sp.oo)),1),
      check('distantobject imagetendsfocus',sp.limit(image,p,sp.oo),f,'m'),
      check('virtual magnification exceedsonesince0plessthanf',magnification-1,p/(f-p)),
      check('commonlength units p30cm f10cm givesq15cm',Q(10,'cm')*Q(30,'cm')/(Q(30,'cm')-Q(10,'cm')),15,'cm',probe),
      check('same q inmetres isthreeover20',Q(15,'cm'),F(3,20),'m',probe),
      check('real image diagram axialratio109point5Over73',F('109.5')/73,F(3,2),'',actual),
      check('real image diagram height ratio19Over38',-F(19,38),-F(1,2),'',actual),
      check('virtual image diagram axialratioMinus73Over36point5',-F(73,1)/F('36.5'),-2,'',actual),
      check('virtual image diagram height60Over30',F(60,30),2,'',actual),
    ]}

MANUAL={
'C5-L09':'Actual diagram n1=1,n2=3/2,incidence45deg gives sin(theta2)=sqrt(2)/3, so exacttheta2=asin(sqrt(2)/3). The isolated28degree graphicalannotation is nearestwholedegree, notanequationstating exacttheta2=28 andnot a studentrequestfor decimalinverse-trig. Itsrounding is independently bounded manually:3.14<pi<22/7 andalternating sinseries bound sin27.5 below sqrt(2)/3 andsin28.5 above it. Source raypixelvector54,101 gives squaredsine2916/13117, differingfromexact2/9 by10/118053, consistentroundedcoordinates. Snell comesfromtangentialphasecontinuity atfixedfrequency. Normalincidence stayszeroanglebutchanges speed. Reversepath givesback45degrees. Reviewer3/2to1at45 gives sin²theta2=9/8>1, so no geometric transmittedray;theta_c=asin(2/3) stayssymbolic. Surface30degreeexample converts to60degree normalangle; notassignedsource numbers.',
'C5-L10':'Independent rays forobjectheight h at-p: afterlens parallelray y=h-h*x/f;centralray y=-h*x/p. Intersection givesq=fp/(p-f), imageheight=-hq/p. Actualp3f yieldsq3f/2 andm-1/2, betweenthefarfocus and2f, invertedhalfheight. Actualpf/2 yieldsq=-f andm2, same-objectside uprightvirtualimage, no directscreenposition. Atp=f outgoingraysparallel, nofiniteimage; limits frombothsides anddistantobject giveexpected sign/infinity/focus. Constructedf10cm,p30cm givesq15cm=3/20m; all sourcefractions aremanual. SVGaxial/height ratios matchtheseexactexamples; exaggerated transverseheight is schematicandnot anassignedphysicalangle or calibratedisotropicx/y metric.'}
ASSUMPTIONS={
'C5-L09':'Ordinarypositive real refractiveindices atgivenfrequency, planarstationary interface andgeometricaloptics, samefrequency acrossinterface. Incidence/reflection/refraction anglesmeasuredfromnormalwithin0..pi/2 forstandardraymagnitudes. Totalinternalreflection fromhigherindex toloweronlyabovecritical, twoidealtransparentmedia; doesnotdeny anevanescentfield orclaimfrustratedTIRwithanotherinterface. Diagramintegerdegreeannotationrounded, notstrictcalculatedidentity.',
'C5-L10':'Thinconverginglens,paraxialrays,samemediumbothsides,f>0,realobjectp>0. qpositiveonexitrealintersection, qnegativeforbackwardextensions; signedheightmagnification. Formulaq excludesp=f finitecasehandledseparately asparallelrays/infinity. Diagrams schematic withrelative axialandtransverse ratios, notnumericphysicalraysangles; physicalheightmaybesmallcomparedwithf. Directscreenonlyrealimage,additionalopticsnotassumed.'}
PEDAGOGY={
'C5-L09':'Definesnormalbeforeangles, distinguishesnormalincidencefromspeedchange,andqualifiesTIRgeometricdomain. Warnsagainstusinganglesfromsurfaceorignoring sin>1. Exactinverse-triganswercanremainsymbolic; roundedangleinadiagramisnot falselyrewritten asanexactequality.',
'C5-L10':'Statesparaxial/samemediumandsignconventionsbeforeequations. Actualrealandvirtualfractionexamples matchbothprincipalraysandmagnification; p=f degeneracyisexplicit. Laboratoryasks topredictsignanddecidescreenlocation,includingno directscreenforvirtualimage ratherthanassumingallimagesprojectable.'}
FIGURE_REVIEW={
'C5-L09':'CompleteXML/render:surfacehorizontal,normalvertical,incident(220,32)to(317,129),reflectedto(414,32) both45deg;glassrayto(371,230) closer tonormal. Labels n_air1.00,n_glass1.50,28deg whole-degree roundedannotation. ExactSnellsine andmanualnearestdegreeboundchecked; no exacttheta=28formula orcompulsory decimal arctrigappears.',
'C5-L10':'BothcompleteXML/render: lensx320,axisy139,focalpositions247/393 give73pxf. Realobjectx101=>p219=3f,height38;image429.5=>q109.5=1.5f,height-19=-half. GreenraypassesFprime,redcentralrayundevlected;bothcrossatimage. Virtualobject283.5=>p36.5=f/2,height30;backwardextensionsmeet247,79=>q=-f,height60=double. Actualraysdiverge, dashedextensionsareclearlydistinguished. Minorrounding ofredterminalcoordinate45.62 causes3/730pxverticalresidual,under0.01px. No physicalheightunit orisotropicanglemetricassigned.'}


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
