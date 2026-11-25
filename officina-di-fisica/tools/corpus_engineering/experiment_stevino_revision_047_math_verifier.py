"""Separate AI text/math review only; no consumer/UI/publication acceptance."""
from pathlib import Path
from fractions import Fraction
import json
import sympy as sp
import pint
from .pipeline import digest,sha
from .review_contract import reviewed_rows
APP=Path(__file__).resolve().parents[2]
KEY='SIM-C2-L002-01'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_SHA256='39b198952767ed38a2e5fa8dd81fd439fa8a7c0334ae1aaf08054629bb8f4abb'
PACKAGE_SHA256='93db02e08192e5774987059ee3cfb07c7baccf975b85d6bb188d12c1bd66b60d'
BINDINGS_SHA256='9ba5f05bca0e911b48cf52899f9e1897a98bc6dd6eccc18786af3ef7c8b1dbe7'
ORIGINAL_REVIEW_SHA256='32ef90d2393511097a0caa5497090e2abf78094117b2e3cc80d6604ac13f8859'
REVIEWED_CANDIDATE_SIGNATURE='9f57c2e0b5180e7c3cce84d78abe4fc2ad051b5cf77594ecaaa9ee78bad1a0a3'
U=pint.UnitRegistry(non_int_type=Fraction)


def independent_checks():
    R=sp.Rational;Q=U.Quantity;rho,g,A,h,p=sp.symbols('rho g A h p',positive=True);out=[]
    def check(name,actual,expected,unit=''):
        if isinstance(actual,U.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
        residual=sp.simplify(actual-expected)
        out.append({'claim':name,'independentlyDerived':str(actual),'expected':str(expected),'unit':unit,'dimension':{str(k):str(v) for k,v in U.Unit(unit).dimensionality.items()},'residual':str(residual),'ok':residual==0})
    check('column pressure force balances weight',sp.cancel(rho*A*h*g/A),rho*g*h,'Pa')
    check('inverse law for positive density and gravity',sp.solve(sp.Eq(p,rho*g*h),h)[0],p/(rho*g),'m')
    check('assigned gravity fraction is decimal9.81',R(981,100),R('9.81'),'m/s^2')
    check('density times gravity has pressure-gradient units',Q(1000,'kg/m^3')*Q(Fraction(981,100),'m/s^2'),9810,'Pa/m')
    check('one metre gives9.81kPa',Q(1000,'kg/m^3')*Q(Fraction(981,100),'m/s^2')*Q(1,'m'),R(981,100),'kPa')
    check('assigned first task2m pressure',Q(1000,'kg/m^3')*Q(Fraction(981,100),'m/s^2')*Q(2,'m'),R(981,50),'kPa')
    check('first hand multiplication981times2',981*2,1962)
    check('first exact decimal',R(1962,100),R('19.62'),'kPa')
    check('transfer1.5m equals3over2m',R('1.5'),R(3,2),'m')
    check('assigned transfer pressure from SI',Q(1000,'kg/m^3')*Q(Fraction(981,100),'m/s^2')*Q(Fraction(3,2),'m'),R(2943,200),'kPa')
    check('manual repeated addition981',981+981+981,2943)
    check('manual fraction denominator',100*2,200)
    check('decimal conversion by multiplying numerator and denominator5',R(2943*5,200*5),R(14715,1000),'kPa')
    check('transfer exact decimal',R(2943,200),R('14.715'),'kPa')
    check('alternative half-metre contribution',R(981,100)/2,R('4.905'),'kPa')
    check('alternative mental addition',R('9.81')+R('4.905'),R('14.715'),'kPa')
    check('inverse first pressure converted to Pa',Q(Fraction(981,50),'kPa'),19620,'Pa')
    check('inverse first depth',Q(19620,'Pa')/(Q(1000,'kg/m^3')*Q(Fraction(981,100),'m/s^2')),2,'m')
    check('surface relative pressure zero',(rho*g*h).subs(h,0),0,'Pa')
    check('doubling depth doubles pressure',sp.cancel((rho*g*2*h)/(rho*g*h)),2)
    check('equal height has equal pressure in connected static liquid',rho*g*h-rho*g*h,0,'Pa')
    check('differentg10 first result20kPa',Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(2,'m'),20,'kPa')
    check('differentg10 transfer result15kPa',Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(Fraction(3,2),'m'),15,'kPa')
    return out


def report(source,package,bindings):
    # This sidecar deliberately does not run an engine, a browser or a DB.
    row,binding,signature,assets,errors=reviewed_rows(package,bindings,{KEY:REVIEWED_CANDIDATE_SIGNATURE},{KEY},APP/'editorial/assets')[0]
    errors=list(errors)
    if source.get('id')!=KEY or source.get('version')!=1 or digest(source)!=SOURCE_SHA256:errors.append('Original source differs from independent full reading')
    if binding.get('sourceId')!=KEY or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=SOURCE_SHA256:errors.append('Provenance rebound')
    if row.get('version')!=2 or row.get('baseVersion')!=1:errors.append('Expected additive version2/base1')
    allowed={'formula','transferPrompt','blocks','prerequisites','review','version','baseVersion','assessmentSelection'}
    if {k:v for k,v in source.items() if k not in allowed}!={k:v for k,v in row.items() if k not in allowed}:errors.append('Original model/control/reference fields changed')
    if row.get('assessmentSelection')!={'schemaVersion':'1.0.0','points':[2,1.5]}:errors.append('Independently reviewed manual task inputs changed')
    if len(row.get('blocks',[]))!=17 or assets or package.get('assets')!=[]:errors.append('Reviewed17 text/formula blocks with no uploaded assets changed')
    frozen=APP/'editorial/reviews/experiments-pressure-hydrostatics-047-originals.json'
    if not frozen.is_file() or sha(frozen.read_bytes())!=ORIGINAL_REVIEW_SHA256:errors.append('Original failed-edition review not retained')
    previous=next((r for r in json.loads(frozen.read_text())['records'] if r['id']==KEY),None) if frozen.is_file() else None
    checks=independent_checks() if not errors else[]
    science=bool(checks and all(c['ok'] for c in checks))
    consumer='Native320 left probe remains hidden by opaque Sonda label on runtime1a35. No new DRAFT UI/rendering or numeric-input test was run in this text/math-only review; no completed activity credit.'
    return {'schemaVersion':'1.0.0','phase':'TEXT_MATH_ONLY_NOT_REGISTRABLE','id':KEY,'sourceRef':SOURCE_REF,'sourceSha256':SOURCE_SHA256,'sourceVersion':1,'candidateVersion':2,'baseVersion':1,'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'scientificTextMathReview':{'ok':science,'errors':errors,'checks':checks,'manualArithmetic':'981*2/100=19.62kPa; (981/100)*(3/2)=2943/200=14715/1000=14.715kPa; inverse19620/9810=2m. All operations are integer arithmetic, fractions, doubling and halving.'},'consumerReview':{'ok':False,'errors':[consumer],'newDraftUI':'NOT_RUN'},'publishedEditionReview':previous,'failedPublishedEdition':True,'overallComplete':False,'acceptedCount':0,'scientificTextMathAcceptedCount':int(science),'activityCredit':0,'originalEditionRetained':True,'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_not_draft_author','humanApproval':'NOT_RUN','publicationAction':'NONE'}
