"""Independent four accelerated-motion originals, including circle clock frames.
No authoring imports, source-key oracle, human approval or publication.
Runtime revalidation of the same IDs, reusing the independently recovered physics
oracles unchanged; immutable f897 provenance is retained in editorial/reviews.
"""
from fractions import Fraction
from pathlib import Path
import json
import math
import subprocess
import pint
import sympy as sp
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/esperienze-C1.json'
SOURCE_FILE_SHA256='84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3'
BATCH='experiments-accelerated-040'
READ_SOURCE_SHA256={'SIM-C1-L004-01':'c2c99b924db08b43187c7eb88d9b81e504fa6995799cad7f98e756061d131f80','SIM-C1-L004-02':'3bb5899e3fa9bc10a78bad83060a8e03f1477134499276f7e4629f11e369735b','SIM-C1-L004-03':'f97b094eef0ba9eca0051d8d2b4f0114cd1f6d545028782dcd51dee131775d28','SIM-C1-L004-04':'3d6bac09cc4251efa1ec64b24cb51fff6be12c593b28e8dc1011a09f45b9204b'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'cc435e51b62d5b9961b32f5d9b349171f7432e3bf6a6911cd80daaa1f419767b', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/confronti.js': '83f1ab0d443dc93eb72c0318e32856179486643257c5bbf136e686464fdc6c39', 'static/js/banchi/voci/legende.js': '89730336965cc57c02580f7f10b185b35575c3dfc8b9bae37ddca8ec20831a93', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/modelli/C1.js': 'e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34', 'static/js/banchi/voci/apparati/meccanica.js': 'c87e54ddc90b8cf3b75f2db350274b55cc5d9b0c74e44151190fa37d4ece3f70', 'static/js/banchi/banco.js': '8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9', 'static/js/banchi/misure.js': '46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27', 'static/js/banchi/voci/assessment-selection.js': '2f5435b6c9e8b76667d0a95f35860f835117cf8230a635c4c3a54c479fbc54b3', 'server/domain/experiment_assessment.py': 'c51189c0daed89da19c943900736daa2646bd9862b68edc4c793fc882e4f06f6', 'server/domain/authoring.py': 'bc42796627ca84424576ba189058dd6f37ddbc694d929a6e900fafb0e26dfa94', 'server/adapters/contracts.py': '53e1ea6c8fc912b749e5074eac7384f66ecbcfe89723e51642d3b26475bc07bc', 'contracts/experiment-assessment-v1.schema.json': '937df48ca60e874797cf9428a00732eaf6974d1ae7abdc162743f03ceef4ddf5', 'contracts/engine.d.ts': 'de1760b0df0b5902d4b57aa2bb1a347c87a4520f00e4fe2d0d543bf9e972b0e6'}
READ_RUNTIME_PROFILE_SHA256='b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f'
READ_BROWSER_PROOF_SHA256='feae6ee9e9185b90eef3ab6a3a7cab6e85f44e5967e22cb19d7e58be9fccf3db'
READ_BROWSER_PROTOCOL_SHA256='d77905e3f8bbfa8deae9d476977c3b255d81ec19ad4aa3942a06d3725cc3c422'
SOURCE_ISSUES={}
CONSUMER_ISSUES={}
SI=pint.UnitRegistry(non_int_type=Fraction)
# Original control, two reference inputs and actual algorithm-selected transfer.
SPECS={
'SIM-C1-L004-01':(0,4,.25,1,3,2,'m'),
'SIM-C1-L004-02':(0,2,.1,1,2,.9,'m'),
'SIM-C1-L004-03':(1,6,.5,2,5,3.5,'m'),
'SIM-C1-L004-04':(1,6,.5,2,4,3.5,'m/s²')}


def exact_value(key,x):
    x=sp.Rational(str(x));i=int(key[-2:])
    if i==1:return x*x
    if i==2:return 20-5*x*x
    if i==3:return 2*x
    return x*x/2


def check(claim,actual,expected,unit='',scope='actual_assigned_exact_or_manual_relation'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    actual=sp.sympify(actual);expected=sp.sympify(expected)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
            'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    R=sp.Rational;t,v=sp.symbols('t v',real=True);result={k:[] for k in SPECS}
    solved=[(1,9,4),(15,0,R(319,20)),(4,10,7),(2,8,R(49,8))]
    for key,(_,_,_,x0,x1,transfer,unit) in SPECS.items():
        for label,x,want in zip(('first reference','comparison assignment','actual generated transfer'),(x0,x1,transfer),solved[int(key[-2:])-1]):
            result[key].append(check(label,exact_value(key,x),want,unit))
    result['SIM-C1-L004-01'] += [check('velocity from position derivative',sp.diff(t*t,t),2*t,'m/s','independent_model_derivation'),check('constant acceleration secondderivative',sp.diff(t*t,t,2),2,'m/s^2','independent_model_derivation'),check('first second displacement',sp.Integer(1)**2-0,1,'m'),check('second second displacement',sp.Integer(2)**2-1,3,'m'),check('doublingtime quadruplesdistance',sp.cancel((2*t)**2/t**2),4),check('halfaccelerationtimes time squared units',SI.Quantity(2,'m/s^2')*SI.Quantity(2,'s')**2/2,4,'m')]
    y=20-5*t*t
    result['SIM-C1-L004-02'] += [check('signed velocity derivative',sp.diff(y,t),-10*t,'m/s','independent_model_derivation'),check('signed acceleration derivative',sp.diff(y,t,2),-10,'m/s^2','independent_model_derivation'),check('positive landingtime',sp.solve(y,t)[1],2,'s'),check('first second drop',20-y.subs(t,1),5,'m'),check('second second drop',y.subs(t,1)-y.subs(t,2),15,'m'),check('actual point9 manual height',20-5*R(9,10)**2,R(319,20),'m')]
    result['SIM-C1-L004-03'] += [check('flighttime2verticalspeedoverg',SI.Quantity(10,'m/s')*2/SI.Quantity(10,'m/s^2'),2,'s'),check('apex time independent horizontal velocity',sp.solve(sp.diff(10*t-5*t*t,t),t)[0],1,'s'),check('apexheight5',10-5,5,'m'),check('range twice horizontalvelocity',sp.simplify(v*2),2*v,'m','independent_model_derivation'),check('doubling horizontalspeed doublesrange',sp.cancel(2*(2*v)/(2*v)),2),check('actual transfer units',SI.Quantity(R(7,2),'m/s')*SI.Quantity(2,'s'),7,'m')]
    r=sp.Integer(2);omega=v/r;position=sp.Matrix([r*sp.cos(omega*t),r*sp.sin(omega*t)])
    acceleration=sp.diff(position,t,2);velocity=sp.diff(position,t)
    result['SIM-C1-L004-04'] += [check('squared speed remains v squared',sp.trigsimp(velocity.dot(velocity)),v*v,'m^2/s^2','independent_circular_derivation'),check('acceleration inward parallelminusposition',sp.trigsimp(acceleration.dot(position)),-v*v,'m^2/s^2','independent_circular_derivation'),check('tangent and acceleration orthogonal',sp.trigsimp(velocity.dot(acceleration)),0,'m^2/s^3','independent_circular_derivation'),check('squared acceleration v4overr2',sp.trigsimp(acceleration.dot(acceleration)),v**4/4,'m^2/s^4','independent_circular_derivation'),check('doubling speed quadruples centripetalaccel',sp.cancel(((2*v)**2/2)/(v*v/2)),4),check('actual transfer centripetal SI units',SI.Quantity(R(7,2),'m/s')**2/SI.Quantity(2,'m'),R(49,8),'m/s^2'),check('period times angularspeed exact2pi',(4*sp.pi/v)*(v/2),2*sp.pi,'','instrument_model_not_extra_assigned_period_calculation')]
    return result


def runtime_values(sources):
    code="import {esperienza} from './static/js/banchi/voci/esperimento.js';import {n} from './static/js/banchi/misure.js';const sources="+canonical([sources[k] for k in sorted(SPECS)])+";\n"+r"""
const out={};
for(const source of sources){
 const a=await esperienza(source),c=source.control,count=Math.round((c.max-c.min)/c.step)+1,cases=[];
 for(let i=0;i<count;i++){
  const x=c.min+i*c.step,p={x},s=a.model.solve(p),clock=a.clock;
  const duration=clock?.duration(x,s.y),timeSamples=[];
  if(clock)for(const time of [0,duration/4,duration/2,duration]){
   const input=clock.input?time:x,q={x:input},z=a.model.solve(q);
   timeSamples.push({time,input,output:z,signal:clock.signal?clock.signal(x,time,s.y):null,elements:a.elements(x,2,time),readings:a.model.readings(q,z,time)});
  }
  cases.push({x,output:s,elements:a.elements(x,2),readings:a.model.readings(p,s,0),graphs:a.model.graphs(p,s),duration,timeSamples});
 }
 const x0=source.references[0][0],y0=a.model.solve({x:x0}).y;
 out[source.id]={cases,params:a.model.params,prediction:a.record.prediction,assessment:a.record.assessment,
 clock:a.clock?{input:!!a.clock.input,secant:a.clock.secant??null,clockUnit:a.clock.clockUnit,pace:a.clock.pace,duration:a.clock.duration(x0,y0)}:null,
 formatRoundtrip:a.record.assessment.map(v=>({display:n(v.value),parsed:Number(n(v.value).replace(',','.'))}))};
}
console.log(JSON.stringify(out,(_k,v)=>Number.isNaN(v)?'NaN':v));
"""
    run=subprocess.run(['node','--input-type=module','-'],cwd=APP,input=code,text=True,capture_output=True,timeout=30)
    if run.returncode:raise ValueError('Actual clock/experiment consumer failed: '+run.stderr[:500])
    return json.loads(run.stdout)


def near(actual,expected):
    return type(actual) in (int,float) and math.isfinite(actual) and math.isclose(actual,float(expected),rel_tol=1e-10,abs_tol=1e-11)


def compare_runtime(actual):
    def geometry(key,x,elements,time=None):
        i=int(key[-2:]);x=sp.Rational(str(x));t=x if time is None else sp.Rational(str(time));G=0x147979;P=0x7350b0
        if i==1:
            boxes=[e for e in elements if e.get('kind')=='box' and e.get('c')==G];position=-sp.Rational(119,50)+sp.Rational(119,400)*t*t
            arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==P];offset=sp.Rational(13,60)*t
            return len(boxes)==1 and near(boxes[0]['p'][0],position) and near(boxes[0]['p'][1],sp.Rational(13,25)) and near(boxes[0]['p'][2],0) and ((not arrows) if t==0 else len(arrows)==1 and near(arrows[0]['b'][0]-arrows[0]['a'][0],offset) and all(near(arrows[0]['b'][j]-arrows[0]['a'][j],0) for j in (1,2)))
        if i==2:
            balls=[e for e in elements if e.get('kind')=='ball' and e.get('r')==.19]
            arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==0xb94f48]
            return len(balls)==1 and near(balls[0]['p'][0],0) and near(balls[0]['p'][2],0) and near(balls[0]['p'][1],sp.Rational(3,10)+sp.Rational(41,400)*(20-5*t*t)) and len(arrows)==1 and near(arrows[0]['b'][1]-arrows[0]['a'][1],-sp.Rational(21,50)) and all(near(arrows[0]['b'][j]-arrows[0]['a'][j],0) for j in (0,2))
        if i==3:
            t=sp.Integer(1) if time is None else t;balls=[e for e in elements if e.get('kind')=='ball' and e.get('r')==.12]
            expected=[-sp.Rational(11,5)+sp.Rational(8,25)*x*t,sp.Rational(17,100)+sp.Rational(8,25)*(10*t-5*t*t),0]
            arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==P]
            return len(balls)==1 and all(near(balls[0]['p'][j],z) for j,z in enumerate(expected)) and len(arrows)==1 and near(arrows[0]['b'][0]-arrows[0]['a'][0],sp.Rational(16,25)*x)
        phase=0 if time is None else x*t/2;C=sp.cos(phase);S=sp.sin(phase)
        balls=[e for e in elements if e.get('kind')=='ball' and e.get('r')==.14]
        if len(balls)!=1 or not near(balls[0]['p'][0],sp.Rational(7,5)*C) or not near(balls[0]['p'][2],-sp.Rational(7,5)*S) or not near(balls[0]['p'][1],sp.Rational(8,25)):return False
        for color,dx,dz in ((G,-x*S/5,-x*C/5),(P,-x*x*C/26,x*x*S/26)):
            arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==color]
            if len(arrows)!=1 or not near(arrows[0]['b'][0]-arrows[0]['a'][0],dx) or not near(arrows[0]['b'][2]-arrows[0]['a'][2],dz) or not near(arrows[0]['b'][1]-arrows[0]['a'][1],0):return False
        return True
    summaries={}
    for key,(lo,hi,step,x0,x1,transfer,unit) in SPECS.items():
        item=actual.get(key,{});cases=item.get('cases',[]);errors=[];count=round((hi-lo)/step)+1;clock=item.get('clock');i=int(key[-2:]);observations=0
        if len(cases)!=count:errors.append('Actual controlgrid incomplete')
        params=item.get('params',[])
        if len(params)!=1 or any(params[0].get(f)!=z for f,z in (('key','x'),('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual domain/default differs')
        duration=hi if i<3 else 2 if i==3 else 4*sp.pi/sp.Rational(str(x0))
        if not clock or any(clock.get(f)!=z for f,z in (('input',i<3),('secant',None),('clockUnit','s'),('pace',1))) or not near(clock.get('duration'),duration):errors.append('Clockmetadata differs')
        for index,c in enumerate(cases):
            x=sp.Rational(str(lo))+index*sp.Rational(str(step))
            if not near(c.get('x'),x) or not near(c.get('output',{}).get('y'),exact_value(key,x)):errors.append('Law/control differs')
            if not geometry(key,x,c.get('elements',[])):errors.append('Apparatus parametergeometry differs')
            graphs=c.get('graphs',[])
            if len(graphs)!=(1 if i<3 else 2):errors.append('Missing expected control/timegraph')
            else:
                points=graphs[0].get('series',[{}])[0].get('points',[])
                if len(points)!=101 or any(not near(y,exact_value(key,z)) for z,y in points):errors.append('Actual controlgraph differs')
                if i>=3:
                    if graphs[1].get('x')!='Tempo (s)' or graphs[1].get('y')!=('Quota in volo (m)' if i==3 else 'Posizione lungo x (m)'):errors.append('Timegraph labels/units differ')
                    points=graphs[1].get('series',[{}])[0].get('points',[])
                    if len(points)!=161:errors.append('Incomplete timesignal graph')
                    for z,y in points:
                        t=sp.Rational(str(z));expected=10*t-5*t*t if i==3 else 2*sp.cos(x*t/2)
                        if not near(y,expected):errors.append('Actual timegraph differs');break
            duration=sp.Rational(str(hi)) if i<3 else sp.Integer(2) if i==3 else 4*sp.pi/x
            if not near(c.get('duration'),duration):errors.append('Clockduration differs')
            samples=c.get('timeSamples',[])
            if len(samples)!=4:errors.append('Incomplete clock observations')
            for sample,fraction in zip(samples,(0,sp.Rational(1,4),sp.Rational(1,2),1)):
                observations+=1;time=duration*fraction;input_value=time if i<3 else x
                if not near(sample.get('time'),time) or not near(sample.get('input'),input_value) or not near(sample.get('output',{}).get('y'),exact_value(key,input_value)):errors.append('Clock scalar synchronization differs')
                # Use the actual sampled time for binary64 geometric conformance.
                if not geometry(key,x,sample.get('elements',[]),sample.get('time')):errors.append('Clock movinggeometry differs')
                readings=sample.get('readings',[])
                if i<3:
                    expected=2*time if i==1 else -10*time
                    if len(readings)!=3 or readings[2][2]!='m/s' or not near(readings[2][1],expected):errors.append('Instantaneous velocity comparison differs')
                else:
                    expected=10*time-5*time*time if i==3 else 2*sp.cos(x*time/2)
                    if not near(sample.get('signal'),expected) or len(readings)!=4 or readings[3][2]!='m' or not near(readings[3][1],expected):errors.append('Actual clock signal/reading differs')
        assignments=item.get('assessment',[])
        if len(assignments)!=2:errors.append('Generated assignment completeness differs')
        else:
            for a,x in zip(assignments,(x1,transfer)):
                if not near(a.get('value'),exact_value(key,x)) or a.get('unit')!=unit:errors.append('Generated answer/units differs')
        if item.get('prediction',{}).get('correct')!=(0 if i==2 else 2):errors.append('Prediction differs')
        summaries[key]={'ok':not errors,'numericPhysicsMatches':not errors,'caseCount':len(cases),'plannedCaseCount':count,'clockSampleCount':observations,'errors':errors,'firstAssessmentInput':x1,'transferInput':transfer,'manualityIssue':False,'formatRoundtrip':item.get('formatRoundtrip',[])}
    return summaries

MANUAL={
'SIM-C1-L004-01':'s=at²/2=t²m witha2m/s², reststart. References1=>1/3=>9, actualtransfer2=>4. Firstsecond1m,nextsecond3m, notconstantspacing; v2t. Integer/quarter squaring finite, no calculator.',
'SIM-C1-L004-02':'Releaseat20m,rest,g10m/s²,airignored: h20-5t². References1=>15/2=>0; actualtransfer.9=>20-405/100=319/20=15.95m. Firstsecond5m,next15m, vy-10t. LandingT2 positive root of4, not an unsupported arbitrary root; modelstopsatlanding2.',
'SIM-C1-L004-03':'Sameheightflight,verticalspeed10m/s,g10 =>T2s independentofvx,range2vx. Referencesvx2=>4m/5=>10m; actualtransfer7/2=>7m. Apex1sheight5, horizontalvxunchanged. Clockheightandtime areinstrumentoutputs, distinctfromselectedfinalrange.',
'SIM-C1-L004-04':'Prescribedradius2m andpositivespeedv1..6m/s givea=v²/2. References2=>2/4=>8; actualv7/2=>49/8=6.125m/s². Doublingspeed quadruplesacceleration. Independentpositionderivatives proveinward/tangentorthogonality. Clockperiod4pi/v andcontinuoussin/cosreadingsareoptionalinstrumentmodel, not additional numericperiod/trig questions assignedtostudent.'}
ASSUMPTIONS={key:'Ideal prescribed motion with the source working coefficients and units, positive finite domains. Rest/release and sameheight ballistic return as stated; airignored, no bounce/postlanding continuation. Circleuniformspeed atfixedradius, no changingforce/mass claim or realstudent calibration.' for key in SPECS}
PEDAGOGY={key:'Full original and actual assignments/steps/readings/graphs/clocks inspected. Finite manual arithmetic for actual tasks; reviewer symbolic differentiation/period/trajectory checks are distinguished from tasks assigned to student. No sourcekey-only or metadata approval.' for key in SPECS}
VISUAL_REVIEW={
'SIM-C1-L004-01':'Rail0..16m mapslinearly, bodyt² andpositivevelocityarrowproportionalto2t, omittedatrest0. Clockmainparameter actualelapsedtime, not durationheldfixed.',
'SIM-C1-L004-02':'Dropheightmapped.3+(2.05/20)h, fixed20mverticalreference; gravityarrowdown. Clockbodyandheight/readoutuseelapsedtime0..2s, no undergroundcontinuation.',
'SIM-C1-L004-03':'Samecommon.32horizontal/verticalgain,ballx=-2.2+.32vx*t,y=.17+.32(10t-5t²),endrange2vx. Clockholdsselectedvxwhiletimechanges0..2; mainrangeiswholeflightresult, extraheightiscurrentstate. Sidebysidefixedthumbnail atapex isnot claimed as landing.',
'SIM-C1-L004-04':'Sceneorbitradius1.4represents2m common.7lengthgain; phasevt/2; velocitytangentandaccelerationradialinward atalltimes. Velocity/acceleration arrowlengths have separate units/scales. Signalx2cos(vt/2), clockperiod4pi/v, ypositive logical mappingto-z.'}


def runtime_hashes():
    return {name:sha((APP/name).read_bytes()) if (APP/name).is_file() else 'MISSING' for name in READ_RUNTIME}



def consumer_evidence():
    file=APP/'editorial/reviews/experiments-accelerated-040-browser.json'
    protocol=APP/'tests/corpus/browser-experiments-accelerated.mjs'
    if not file.is_file() or not protocol.is_file():return {'ok':False,'error':'Observed diagnostic consumer evidence missing'}
    actual=sha(file.read_bytes());tool=sha(protocol.read_bytes())
    if actual!=READ_BROWSER_PROOF_SHA256 or tool!=READ_BROWSER_PROTOCOL_SHA256:return {'ok':False,'error':'Observed diagnostic evidence/protocol changed'}
    proof=json.loads(file.read_text())
    ok=(proof.get('terminalStatus')=='PASS' and not proof.get('errors') and proof.get('scientificApproval') is False
        and len(proof.get('cases',[]))==52 and proof.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256
        and proof.get('protocolSha256')==tool and proof.get('expectedSourceIssueIds')==sorted(SOURCE_ISSUES)
        and proof.get('expectedConsumerIssueIds')==sorted(CONSUMER_ISSUES))
    for key in SPECS:
        rows=[r for r in proof.get('cases',[]) if r.get('id')==key and r.get('kind') is None]
        ok=ok and sum(r.get('noWebGL') is False for r in rows)==1 and sum(r.get('noWebGL') is True for r in rows)==1
    return {'ok':bool(ok),'proofSha256':actual,'protocolSha256':tool,'runtimeProfileSha256':proof.get('runtimeProfileSha256'),
            'observedCaseCount':len(proof.get('cases',[])),'scientificApproval':False,
            'meaning':'Observed original defects and working states, not automatic scientific approval; exact runtime identity required, fresh engine oracle replay per report.'}

def verify(sources):
    missing=set(READ_SOURCE_SHA256)-set(sources)
    if missing:raise ValueError('Missing actually read experiments: '+','.join(sorted(missing)))
    physics=independent_checks();hashes=runtime_hashes();consumer=consumer_evidence();profile=runtime_fingerprint(APP)['sha256'];actual=None;summaries={};runtime_error=None
    sourcevalid=all(sources[k].get('kind')=='experiment' and digest(sources[k])==pin for k,pin in READ_SOURCE_SHA256.items())
    if not sourcevalid:runtime_error='Unreviewed source supplied; no engine execution'
    elif hashes!=READ_RUNTIME or profile!=READ_RUNTIME_PROFILE_SHA256:runtime_error='Actual consumer/runtime differs from read snapshot; no cached approval'
    else:
        try:
            actual=runtime_values(sources);summaries=compare_runtime(actual)
            if runtime_hashes()!=hashes or runtime_fingerprint(APP)['sha256']!=profile:runtime_error='Runtime changed during check; discard evidence'
        except (ValueError,OSError,subprocess.TimeoutExpired,KeyError,TypeError) as exc:runtime_error=str(exc)
    records=[]
    for key in sorted(SPECS):
        row=sources[key];errors=[]
        if not consumer['ok']:errors.append('Observed actual consumer evidence missing, altered or stale')
        checks=list(physics.get(key,[]));sourceissues=[];consumerissues=[]
        if row.get('kind')!='experiment' or digest(row)!=READ_SOURCE_SHA256[key]:errors.append('Experiment source differs from independent full reading')
        if not checks or not all(c['ok'] for c in checks):errors.append('Independent experiment physics missing or failed')
        if key in SOURCE_ISSUES:sourceissues.append(SOURCE_ISSUES[key]);errors.extend(sourceissues)
        if key in CONSUMER_ISSUES:consumerissues.append(CONSUMER_ISSUES[key]);errors.extend(consumerissues)
        if runtime_error:errors.append(runtime_error)
        comparison=summaries.get(key)
        if comparison:
            checks.append({'claim':'fresh actual adapter/law/apparatus/graph/generated-assessment comparison','ok':comparison['ok'],'mode':'INDEPENDENT_ORACLE_VS_CONSUMER','dimension':{},'caseCount':comparison['caseCount'],'errors':comparison['errors']})
            if not comparison['ok']:errors.append('Independent oracle vs actual experiment consumer failed')
            for i,(echo,x) in enumerate(zip(comparison['formatRoundtrip'],SPECS[key][4:6])):
                want=float(exact_value(key,x));got=echo.get('parsed')
                ok=type(got) in (int,float) and abs(got-want)<=max(.000001,abs(want)*.005)
                checks.append({'claim':'displayed numeric literal roundtrip'+str(i),'ok':ok,'actual':echo,'independentExact':str(exact_value(key,x)),'dimension':{},'mode':'OBSERVED_INPUT_FORMAT_CONFORMANCE'})
                if not ok:errors.append('New unreviewed formatted-answer roundtrip failure')
        elif not runtime_error:errors.append('Fresh actual consumer comparison missing')

        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),
            'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
            'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c.get('dimension',{}) for c in checks},
            'sourceScientificReview':{'ok':digest(row)==READ_SOURCE_SHA256[key] and row.get('kind')=='experiment' and not sourceissues and bool(physics.get(key)) and all(c['ok'] for c in physics.get(key,[])),'errors':sourceissues},
            'consumerReview':{'ok':consumer['ok'] and not consumerissues and not runtime_error and bool(comparison and comparison['ok']),'errors':consumerissues},
            'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':MANUAL[key],
            'manualFeasibility':'FAIL_GENERATED_MANUAL_TASK' if key in SOURCE_ISSUES else 'SOURCE_MANUAL_PASS_CONSUMER_FAIL' if key in CONSUMER_ISSUES else 'PASS_AI_EXACT',
            'physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],'assetChecksums':{},'figureReview':VISUAL_REVIEW[key],
            'runtimeSha256':hashes,'reviewedRuntimeSha256':READ_RUNTIME,'runtimeProfileSha256':profile,'reviewedRuntimeProfileSha256':READ_RUNTIME_PROFILE_SHA256,
            'runtimeComparison':comparison,'consumerEvidence':consumer,'verificationMode':'INDEPENDENT_EXISTING_EDITION',
            'failedPublishedEdition':key in SOURCE_ISSUES or key in CONSUMER_ISSUES,'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return records


def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,
        'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),'draftReviewedCount':0,
        'failedPublishedEditionIds':sorted(set(SOURCE_ISSUES)|set(CONSUMER_ISSUES)),
        'sourceManualityIssueIds':sorted(SOURCE_ISSUES),'consumerInterfaceIssueIds':sorted(CONSUMER_ISSUES),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_or_revision_author','originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
