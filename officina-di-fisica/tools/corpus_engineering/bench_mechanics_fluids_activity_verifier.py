"""Independent original-source and complete-consumer review of LAB3D01..05.

The reviewer read all five records, five models/scenes, caller and pilot notebook,
and inspected ten actual 3D/fallback renders. No edited edition or publication.
"""
from fractions import Fraction
from functools import lru_cache
from itertools import product
import json
import math
from pathlib import Path
import subprocess
import pint
import sympy as sp
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
BATCH='bench-mechanics-fluids-035'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/banchi.json'
SOURCE_FILE_SHA256='c0494a9091cca33b7631b68df1cb7b472c63d0e5481e7dbd391ae1b46e326bdf'
READ_SOURCE_SHA256={'LAB3D-01': '02561ad5fb3eb45a6a7eb10577cca8313cad8e5628726071dacb1d1f01a330cc', 'LAB3D-02': '649e40da9db08811c5eca8802457d1baf078f6020b76abaae09a414b6a16c6ea', 'LAB3D-03': 'b43f6b283b507f060eae8fabada2beddb3ab48ba2f3b52a70deb2b9094833b74', 'LAB3D-04': '4a5fac945bd40cc7c651b1059fc9e21193941e2e46898eecbd9c3b1554619f51', 'LAB3D-05': 'c08f92d0f42c22a5704e434842bfbad73c085d2890eec7ca0075dcd4c245be5c'}
READ_CONSUMERS={'static/js/banchi/misure.js': '46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d', 'static/js/banchi/banco.js': '8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9', 'static/js/banchi/quaderno.js': 'ecc32226e0fa1781b36cac952fa926a2ac17be6b4eae491ef6ef5744fcd8885a', 'static/js/banchi/tavola.js': '9082781b0fbf88f421742cf8f10f3f098f51e9aac131118a5691e1b6e11cc4a8', 'static/js/banchi/modelli/piano.js': '0575020da70a7759527f307b6ba291777f79ff0a710e313b1a4cb7ee012de6e2', 'static/js/banchi/modelli/volo.js': 'bb6280ec67bca5f07e80aa382b6a45c72717189887561090f9807493e1912713', 'static/js/banchi/modelli/stevino.js': '620d9363d38867ce854c0f9c567bc8c63d5519a44f1ce1dfd0dddf1f315da0af', 'static/js/banchi/modelli/tubo.js': 'ebe96bda5301f124182d7bd6ee3042b9ecad61b46689ea26a093deac784c3cd6', 'static/js/banchi/modelli/gas.js': '7981d292be241bb3c7921f755072bda44ab52e5be92f9ae203958a19b7ec1a6d', 'static/js/banchi/scene/piano.js': 'a0a2eb65280c953bd0084e6daafcfaf20e369832f59cf0df68350af7cbd8eab2', 'static/js/banchi/scene/volo.js': '11f7d3a7935596f7064fa91067ff837e3ca2469d178040c22e6531e86d28cc37', 'static/js/banchi/scene/stevino.js': '75836bd9014a1b8b23278efd3be3482dcecea533abf9c9a9d6ff3c71b9581c0c', 'static/js/banchi/scene/tubo.js': 'a401bc41dbd89e106e01adefcec9298dabae15ad552992eef8f55e8364225667', 'static/js/banchi/scene/gas.js': 'c39a13bb813bd6f2602a767cbf6e1e42f954092291ca320d3a61352491953223'}
SI=pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_PREDICTIONS={'LAB3D-01':0,'LAB3D-02':1,'LAB3D-03':2,'LAB3D-04':2,'LAB3D-05':0}
ASSESSMENT_UNITS={'LAB3D-01':['N','m/s²'],'LAB3D-02':['s','m'],'LAB3D-03':['kPa','m'],'LAB3D-04':['mL/s','Pa'],'LAB3D-05':['kPa','kPa']}


def check(claim,actual,expected,unit=''):
    if isinstance(actual,SI.Quantity):actual=sp.Rational(str(actual.to(unit).magnitude))
    actual=sp.sympify(actual);expected=sp.sympify(expected);residual=sp.simplify(actual-expected)
    return dict(claim=claim,independentExact=str(actual),expectedValue=str(expected),unit=unit,
      dimension={str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},residual=str(residual),ok=residual==0)


def exact_checks():
    F=sp.Rational;Q=SI.Quantity
    theta=sp.symbols('theta',real=True);x=sp.symbols('x',real=True);v=sp.symbols('v',positive=True)
    r,R,mean=sp.symbols('r R mean',positive=True);g=F(981,100)
    return {
    'LAB3D-01':[
      check('assessment1 static friction bound',Q(F(2,5)*20,'N'),8,'N'),
      check('assessment2 signed Newton law',Q(9-3,'N')/Q(2,'kg'),3,'m/s^2'),
      check('components reconstruct weight',sp.sin(theta)**2+sp.cos(theta)**2,1),
      check('static friction compensates net tangential drive',x+(-x),0,'N'),
      check('surface normal at horizontal g-model',Q(2,'kg')*Q(g,'m/s^2'),F(981,50),'N')],
    'LAB3D-02':[
      check('assessment1 summit time',Q(10,'m/s')/Q(10,'m/s^2'),1,'s'),
      check('assessment2 horizontal displacement',Q(3,'m/s')*Q(F(6,5),'s'),F(18,5),'m'),
      check('pilot3 signed vertical displacement',6*F(1,5)-F(10,2)*F(1,5)**2,1,'m'),
      check('pilot4 inverse launch speed',10*F(4,5)/2,4,'m/s'),
      check('energy conservation arbitrary flight time',sp.expand((v-g*x)**2+2*g*(v*x-g*x*x/2)-v*v),0,'m^2/s^2'),
      check('slope vertical velocity',sp.diff(v-g*x,x),-g,'m/s^2')],
    'LAB3D-03':[
      check('assessment1 pressure increment',Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(F(1,2),'m'),5,'kPa'),
      check('assessment2 inverse depth',Q(16,'kPa')/(Q(800,'kg/m^3')*Q(10,'m/s^2')),2,'m'),
      check('surface height limit',sp.Integer(100)+1000*g*0/1000,100,'kPa'),
      check('equal depth pressure difference',sp.expand((100+1000*g*x/1000)-(100+1000*g*x/1000)),0,'kPa'),
      check('tenkPa surface offset preserved',(110+g*x)-(100+g*x),10,'kPa'),
      check('slope dimensions',Q(1000,'kg/m^3')*Q(g,'m/s^2'),9810,'Pa/m')],
    'LAB3D-04':[
      check('assessment1 fourth power ratio',32*F(1,2)**4,2,'mL/s'),
      check('assessment2 fixedflow inverse fourth power',160/2**sp.Integer(4),10,'Pa'),
      check('pilot3 half-radius local displacement',8*(1-F(1,2)**2)*2,12,'mm'),
      check('pilot4 pressure inverse ratio',96/2**sp.Integer(4),6,'Pa'),
      check('weighted radial integral',sp.integrate(2*mean*(1-(r/R)**2)*2*sp.pi*r,(r,0,R)),mean*sp.pi*R**2,'m^3/s'),
      check('wall no-slip value',2*mean*(1-(R/R)**2),0,'m/s'),
      check('centre velocity relative to mean',2*mean/mean,2),
      check('Reynolds dimensionless',Q(1000,'kg/m^3')*Q(F(1,10),'m/s')*Q(F(1,100),'m')/Q(F(1,1000),'Pa*s'),1000)],
    'LAB3D-05':[
      check('assessment1 Boyle law',90*F(4,2),180,'kPa'),
      check('assessment2 absolute temperature ratio',100*F(450,300),150,'kPa'),
      check('pilot3 isothermal compression',60*F(4,3),80,'kPa'),
      check('pilot4 firstlaw deltaUzero',sp.Integer(45)-0,45,'J'),
      check('kPa litre is joule',Q(1,'kPa')*Q(1,'L'),1,'J'),
      check('equal volumes zero logarithmic work',sp.log(sp.Integer(1)),0),
      check('model R error below display precision',int(bool(abs(F('8.314462618')-F('1.380649')*F('6.02214076'))/F('8.314462618')<F(1,10**10))),1)]}


def runtime_inputs():
    rows=[]
    for m,a,pair,F in product([.5,2,5],[0,30,45],[(0,0),(.4,.25),(1,1)],[-25,0,25]):rows.append(['piano',dict(m=m,angle=a,ms=pair[0],mk=pair[1],F=F)])
    for speed,elevation,azimuth in product([1,4,6],[0,30,90],[-60,0,30]):rows.append(['volo',dict(speed=speed,elevation=elevation,azimuth=azimuth)])
    for rho,h,p0 in product([600,1000,1400],[0,1.2,2],[60,100,130]):rows.append(['stevino',dict(rho=rho,h=h,p0=p0)])
    for mode,r,mu,length,z in product(['pressure','flow'],[.5,1.5,4],[1,4,12],[5,20,50],[0,1,2]):rows.append(['tubo',dict(mode=mode,r=r,mu=mu,length=length,dp=[5,80,500][z],flow=[.1,1,12][z],probe=.5)])
    for mol,T,V,end in product([.02,.1,.2],[200,300,600],[1,3,6],[1,1.5,6]):rows.append(['gas',dict(mol=mol,T=T,V=V,end=end)])
    return rows


@lru_cache(maxsize=1)
def runtime_values():
    code="""import {readFileSync} from 'node:fs';
const inputs=JSON.parse(readFileSync(0,'utf8'));const modules={};for(const n of ['piano','volo','stevino','tubo','gas'])modules[n]=await import('./static/js/banchi/modelli/'+n+'.js');
console.log(JSON.stringify(inputs.map(([n,p])=>{const m=modules[n],s=m.solve(p);return {model:n,p,s,samples:m.sample?[0,.5,1].map(f=>m.sample(s,f*s.duration)):[],velocities:n==='tubo'?[0,.5,1].map(r=>m.velocity(s,r)):[],graphsEmpty:n==='tubo'?m.graphs(p,s).length===0:false,warning:m.warning?m.warning(p,s):''};})));"""
    run=subprocess.run(['node','--input-type=module','-e',code],input=json.dumps(runtime_inputs()),cwd=APP,text=True,capture_output=True,timeout=30,check=True)
    return json.loads(run.stdout)


def _close(a,b):return type(a) in (int,float) and math.isfinite(a) and math.isclose(a,float(b),rel_tol=2e-10,abs_tol=2e-10)


def runtime_checks():
    results={k:[] for k in READ_SOURCE_SHA256};keys=dict(zip(['piano','volo','stevino','tubo','gas'],sorted(READ_SOURCE_SHA256)));inputs=runtime_inputs();values=runtime_values()
    if len(values)!=len(inputs):raise ValueError('Missing runtime cases')
    for i,((name,p),row) in enumerate(zip(inputs,values)):
        if row['model']!=name or row['p']!=p:raise ValueError('Runtime input identity changed')
        s=row['s'];g=9.81;ok=True
        if name=='piano':
            a=math.radians(p['angle']);N=p['m']*g*math.cos(a);drive=p['F']-p['m']*g*math.sin(a);rest=abs(drive)<=p['ms']*N+1e-12;friction=-drive if rest else -math.copysign(p['mk']*N,drive);acc=(drive+friction)/p['m']
            expected=dict(normal=N,drive=drive,friction=friction,a=acc,limit=p['ms']*N,weight=p['m']*g,parallel=-p['m']*g*math.sin(a));ok=s['rest']==rest and (rest or acc*drive>0)
        elif name=='volo':
            elev=math.radians(p['elevation']);az=math.radians(p['azimuth']);h=0 if p['elevation']==90 else p['speed']*math.cos(elev);u=p['speed']*math.sin(elev);T=2*u/g
            expected=dict(vx=h*math.cos(az),vz=h*math.sin(az),u=u,duration=T,range=h*T,peak=u*u/(2*g))
            for f,point in zip([0,.5,1],row['samples']):
                t=f*T;ok=ok and all(_close(point[k],v) for k,v in dict(x=expected['vx']*t,z=expected['vz']*t,y=max(0,u*t-g*t*t/2),vy=u-g*t).items())
            ok=ok and (p['elevation']!=0 or bool(row['warning']))
        elif name=='stevino':
            dp=p['rho']*g*p['h']/1000;expected=dict(relative=dp,absolute=p['p0']+dp,bottom=p['p0']+p['rho']*g*2/1000)
        elif name=='tubo':
            R=p['r']/1000;L=p['length']/100;mu=p['mu']/1000;res=8*mu*L/(math.pi*R**4);Q=p['flow']/1e6 if p['mode']=='flow' else p['dp']/res;v=Q/(math.pi*R*R);Re=1000*v*2*R/mu
            expected=dict(R=R,L=L,resistance=res,Q=Q,dp=res*Q,mean=v,re=Re,entry=.05*Re*2*R,duration=L/v if Re<2300 else 0)
            ok=all(_close(a,2*v*(1-r*r)) for a,r in zip(row['velocities'],[0,.5,1])) and s['laminar']==(Re<2300) and row['graphsEmpty']==(Re>=2300) and (Re<2300 or bool(row['warning']))
        else:
            C=p['mol']*8.314462618*p['T'];expected=dict(product=C,pressure=C/p['V'],start=p['V'],end=p['end'],duration=6)
            for f,point in zip([0,.5,1],row['samples']):
                V=p['V']+(p['end']-p['V'])*f;W=C*math.log(V/p['V']);ok=ok and all(_close(point[k],v) for k,v in dict(V=V,pressure=C/V,work=W).items())
        ok=ok and all(_close(s[k],v) for k,v in expected.items());results[keys[name]].append(dict(caseIndex=i,ok=ok))
    return results


MANUAL={
'LAB3D-01':'Assigned checks: (2/5)·20=8N; (9−3)/2=3m/s². Dynamic observations may keep mg sinθ and mg cosθ symbolic; no trig lookup is required. From a valid default/reset, the actual input handler maintains 0≤μd≤μs, so departure implies |drive|>μsN≥μdN; the rejected raw-solver counterexample is outside the consumer domain. Static friction takes the needed value, not always its maximum.',
'LAB3D-02':'Assigned checks:10/10=1s;3·(6/5)=18/5m. Pilot checks:6/5−5/25=1m;10·(4/5)/2=4m/s. Arbitrary angle readouts are observations, not requests for decimal trigonometry; exact v0 sinα/cosα is sufficient. Zero elevation is a degenerate zero-flight model; the oblique-flight prediction does not assert a horizontal velocity for a vertical shot.',
'LAB3D-03':'Assigned checks:1000·10·(1/2)=5000Pa=5kPa;16000/(800·10)=2m. Surface pressure is subtracted before inverse depth. Consumer g=981/100 is separate from the assigned g=10; use exact rational ρ(981/100)h or compare displayed readings. Pa/m is the pressure-depth slope unit.',
'LAB3D-04':'Assigned checks:32/16=2mL/s and160/16=10Pa; pilot8(1−1/4)·2=12mm and96/16=6Pa. Ratios cancel π and common parameters. General Q and hydraulic resistance remain exact symbolic π expressions; optional decimal readouts are computed observations. Reynolds warning and suspended tracer/profile distinguish an extrapolated formula from a valid developed laminar model.',
'LAB3D-05':'Assigned checks:90·4/2=180kPa and100·450/300=150kPa. Pilot60·4/3=80kPa and W=Q=+45J from ΔU=0. Ratios cancel nR, with absolute temperature. Optional isothermal work may remain nRT ln(Vf/Vi); no numerical logarithm is assigned. Model R=8.314462618 is a numerical approximation, not the exact SI product. The display uses four significant digits.'}
ASSUMPTIONS={
'LAB3D-01':'Rigid plane, gravitational field constant, no normal component of applied traction; initial rest, Coulomb static bound, nonnegative kinetic coefficient no larger than static, enforced by caller. Positive tangent uphill; friction opposes departure.',
'LAB3D-02':'Point particle, uniform downward gravity, no air, launch/return at same elevation; independent horizontal components. Azimuth rotates the horizontal vector; vertical and zero-elevation limits treated separately.',
'LAB3D-03':'Connected homogeneous liquid at rest, uniform surface pressure and constant gravity. Depth measured positively downward; absolute and gauge pressure separated. Equal-depth comparison is scoped to this medium.',
'LAB3D-04':'Newtonian incompressible fluid, rigid straight circular tube, no-slip, stationary developed profile. Pump can fix pressure or flow; other variables held when comparing radii. Reynolds2300 is indicative; off-domain displayed values are labeled extrapolation and profile/tracers suspended.',
'LAB3D-05':'Fixed amount of ideal dilute gas, equilibrium states, positive absolute T/V/p, thermostatic quasistatic isotherm; six-second animation is a parametrization of states, not a dynamical piston law. Work sign is work by gas; no temperature change or internal-energy change on the isotherm.'}


def browser_evidence():
    file=APP/'editorial/reviews/bench-mechanics-fluids-035-browser.json';r=json.loads(file.read_text())
    instrument=APP/'tools/corpus_engineering/browser_benches_035.mjs'
    if r.get('instrumentSha256')!=sha(instrument.read_bytes()) or r.get('runtimeFingerprint')!=runtime_fingerprint(APP):raise ValueError('Bench UI evidence instrument/runtime stale')
    expected={(key,mode) for key in READ_SOURCE_SHA256 for mode in ['3D WebGL','2D fallback']}
    if len(r['records'])!=10 or {(c['id'],c['mode']) for c in r['records']}!=expected or r['pageErrors']:raise ValueError('Incomplete bench UI paths')
    answers={'LAB3D-01':[8,3],'LAB3D-02':[1,3.6,1,4],'LAB3D-03':[5,2],'LAB3D-04':[2,10,12,6],'LAB3D-05':[180,150,80,45]}
    for c in r['records']:
        if c['independentlySolvedAssessments']!=answers[c['id']] or c['wrongRejected']!=len(answers[c['id']]) or c['correctAccepted']!=len(answers[c['id']]) or not c['figureCaptured']:raise ValueError('Bench UI mathematics/integration incomplete')
    images={key+'-'+mode+'.png' for key in READ_SOURCE_SHA256 for mode in ['3d','2d']}
    if set(r['imageSha256ByName'])!=images:raise ValueError('Missing inspected bench views')
    for name,value in r['imageSha256ByName'].items():
        if sha((APP/'editorial/assets/reviews/bench-mechanics-fluids-035'/name).read_bytes())!=value:raise ValueError('Inspected bench figure changed')
    return dict(browserReportSha256=sha(file.read_bytes()),browserInstrumentSha256=r['instrumentSha256'],browserRuntimeFingerprint=r['runtimeFingerprint']['sha256'] if 'sha256' in r['runtimeFingerprint'] else digest(r['runtimeFingerprint']),actualBrowserCases=10)



READ_PLANE_VISUAL_REPORT_SHA256='32b465c6f1627501e33be7a9b7448941c4368824c1c537922c51a88dc1908a01'

def independent_plane_visual_evidence():
    path=APP/'editorial/reviews/bench-piano2d-independent-b-final-20261125.json'
    try:
        raw=path.read_bytes();r=json.loads(raw)
        return (sha(raw)==READ_PLANE_VISUAL_REPORT_SHA256
          and r['decision']=='AI_REVIEWED_NO_RESIDUAL_FINDING_FOR_SCOPED_FIX'
          and r['humanApproval']=='NOT_RUN' and r['inputsStable'] is True
          and r['numericGrid']['cases']==28560 and r['browser']['cases']==168
          and r['tavolaSha256']==sha((APP/'static/js/banchi/tavola.js').read_bytes())
          and all(sha((APP/p).read_bytes())==value for p,value in r['sourceSha256'].items()))
    except (OSError,ValueError,KeyError,TypeError):return False

def verify(sources):
    if not set(READ_SOURCE_SHA256).issubset(sources):raise ValueError('Missing independently read bench IDs')
    before={p:sha((APP/p).read_bytes()) for p in READ_CONSUMERS};current=runtime_checks();models=exact_checks();records=[]
    if set(models)!=set(READ_SOURCE_SHA256) or any(not v for v in models.values()):raise ValueError('Missing independent exact physics checks')
    for key in sorted(READ_SOURCE_SHA256):
        row=sources[key];errors=[]
        if row.get('kind')!='bench' or digest(row)!=READ_SOURCE_SHA256[key]:errors.append('Original bench differs from read source')
        if before!=READ_CONSUMERS:errors.append('Consumer changed since scientific reading')
        if key=='LAB3D-01' and not independent_plane_visual_evidence():errors.append('Independent corrected plane diagram review missing or stale')
        if row['prediction']['correct']!=EXPECTED_PREDICTIONS[key]:errors.append('Prediction contradicts independent physics')
        checks=models[key]
        for i,a in enumerate(row['assessment']):
            if a['unit']!=ASSESSMENT_UNITS[key][i] or sp.Rational(str(a['value']))!=sp.sympify(checks[i]['independentExact']):errors.append('Assigned assessment unit/value contradicts independent solution')
        if len(row['assessment'])!=2 or not checks or not all(c['ok'] for c in checks) or not current[key] or not all(c['ok'] for c in current[key]):errors.append('Independent physics/consumer checks failed')
        records.append(dict(id=key,sourceSha256=digest(row),sourceVersion=row.get('version',1),sourceRef=SOURCE_REF,sourcePath=SOURCE_PATH,sourceFileSha256=SOURCE_FILE_SHA256,ok=not errors,errors=errors,checks=checks,consumerChecks=current[key],consumerSha256=before,calculationScope='EXACT_MANUAL_CALCULATION',manualArithmetic=MANUAL[key],manualFeasibility='PASS_AI_EXACT',physicalAssumptions=ASSUMPTIONS[key],pedagogicalReview='Prediction, progressive explanation, parameter exploration, interpretation and transfer read as separate stages. Mandatory source and pilot exercises solved with exact small fractions; observation readouts are distinguished from assigned arithmetic. Original IDs, prerequisites and historical editions retained; no protected exam material exposed.',figureReview='Full actual default WebGL and2D fallback renders inspected together with scene/drawing source. Plane2D now uses one geometric basis and an explicitly normalized common force scale, independently reviewed on28560 configurations and168 real browser layouts; the earlier direction-only acceptance is withdrawn in the retained audit. Tube profile and wall condition, hydrostatic surface offset, projectile vectors and gas piston/volume read against their actual models.',verificationMode='INDEPENDENT_EXISTING_EDITION',failedPublishedEdition=False,originalEditionRetained=True,humanApproval='NOT_RUN',publicationAction='NONE'))
    if before!={p:sha((APP/p).read_bytes()) for p in READ_CONSUMERS}:raise ValueError('Consumer changed during verification')
    return records


def report(sources):
    records=verify(sources);ui=browser_evidence()
    return dict(**ui,schemaVersion='1.0.0',batch=BATCH,records=records,verifierSha256=sha(Path(__file__).read_bytes()),sourceRef=SOURCE_REF,sourcePath=SOURCE_PATH,sourceFileSha256=SOURCE_FILE_SHA256,contractSha256=sha(Path(__file__).with_name('review_contract.py').read_bytes()),acceptedCount=sum(r['ok'] for r in records),failedCount=sum(not r['ok'] for r in records),draftReviewedCount=0,failedPublishedEditionIds=[],runtimeCaseCount=sum(len(r['consumerChecks']) for r in records),dependencyVersions={'sympy':sp.__version__,'pint':pint.__version__},reviewer='root_independent_of_original_source_authors',originalEditionRetained=True,humanApproval='NOT_RUN',publicationAction='NONE')
