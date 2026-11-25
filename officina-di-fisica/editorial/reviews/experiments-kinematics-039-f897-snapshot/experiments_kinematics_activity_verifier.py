"""Independent six original kinematics experiments, including clocks and secants.
No authoring imports, source-key oracle, human approval or publication.
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
BATCH='experiments-kinematics-039'
READ_SOURCE_SHA256={'SIM-C1-L003-01':'5e2e0856674e2faeab10fb23ec0770bd42268aa694d6e4e8fb43b08c8c9b6b10','SIM-C1-L003-02':'573673a59d997610dad354b2ea255409cbb57936fc7f9bb1ee887f04962dcc2d','SIM-C1-L003-03':'3cff2c0ef18a1f98cd66167f3e25abd99c6aae7b67b244deb1070b9e6d6fb4a7','SIM-C1-L003-04':'f475c471a8cf4bb33890a1642ae16f49988d8180d5ade06b1753017e4d1ea4a6','SIM-C1-L003-05':'7ace68920b58c5ec04db0caea277cda7b95574de483c5a072b6976242f9655b6','SIM-C1-L003-06':'6787e3a853e7d23107c36e07be2de2a2b948e4b4abb6701cca121e4a644cfa93'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'fce66f301918483fe79d0f8dbf84c280268e48e615e9c016f2bbd32f699f5075', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/confronti.js': '4ee391c0841fed7e1888d2c57cfb2494f8e0be0581a6211d50d410bd172602b9', 'static/js/banchi/voci/legende.js': '2de769cc9358c907eb30ac6b18c6bc3e06e18a1ece514a7d368ecd40bec33d1b', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/modelli/C1.js': 'e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34', 'static/js/banchi/voci/apparati/meccanica.js': 'dc005819f8f12ec48722d32b1d236328ecab75e0734c9ecd0a147751c6bb8fd7', 'static/js/banchi/banco.js': '682ba25fcf97b67821b8c9bb6c73a571c87559f94bbda3f64cfad65fab63cdb8', 'static/js/banchi/misure.js': '8d631c65b0266ece6447da07aff7a43ee61b66d0767ddc24ace3f59b31fac186', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27'}
READ_RUNTIME_PROFILE_SHA256='f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5'
READ_BROWSER_PROOF_SHA256='9178d2e7b16f3517b4f331d786ebffb60922ed819c22235e2cdec139125e5752'
READ_BROWSER_PROTOCOL_SHA256='125d86bf4d24de42ab9f72e24706cc873009780728b312420f304f2bd633a0ec'
SOURCE_ISSUES={}
CONSUMER_ISSUES={}
SI=pint.UnitRegistry(non_int_type=Fraction)
# Original control, two reference inputs and actual algorithm-selected transfer.
SPECS={
'SIM-C1-L003-01':(-2,6,.5,0,5,2,'m'),
'SIM-C1-L003-02':(0,2,.1,0,1,1.1,'m'),
'SIM-C1-L003-03':(.25,3,.25,1,2,1.75,'m/s'),
'SIM-C1-L003-04':(.25,3,.25,1,2,1.75,'m/s²'),
'SIM-C1-L003-05':(0,5,.25,1,3,2.5,'m'),
'SIM-C1-L003-06':(0,4,.25,1,3,2,'m')}


def exact_value(key,x):
    x=sp.Rational(str(x));i=int(key[-2:])
    if i==1:return x-2
    if i==2:return 10*x-5*x*x
    if i in (3,4):return 2+x
    if i==5:return -1+2*x
    return 2*x if x<=2 else 8-2*x


def check(claim,actual,expected,unit='',scope='actual_assigned_exact_or_manual_relation'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    actual=sp.sympify(actual);expected=sp.sympify(expected)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
            'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    R=sp.Rational;t,d,h=sp.symbols('t d h',real=True)
    result={k:[] for k in SPECS}
    solved=[(-2,3,0),(0,5,R(99,20)),(3,4,R(15,4)),(3,4,R(15,4)),(1,5,4),(2,2,4)]
    for key,(_,_,_,x0,x1,transfer,unit) in SPECS.items():
        for label,x,want in zip(('first reference','comparison assignment','generated transfer'),(x0,x1,transfer),solved[int(key[-2:])-1]):
            result[key].append(check(label,exact_value(key,x),want,unit))
    k='SIM-C1-L003-01'
    result[k]+=[check('negative finalposition minus positive start',-2-2,-4,'m'),check('positiveposition belowstart givesnegative displacement',1-2,-1,'m'),check('sameposition zero displacement',2-2,0,'m'),check('fullrail signedendpointdifference',6-(-2),8,'m')]
    k='SIM-C1-L003-02';y=10*t-5*t*t
    result[k]+=[check('verticalvelocity from derivative',sp.diff(y,t),10-10*t,'m/s','independent_model_derivation'),check('verticalacceleration derivative',sp.diff(y,t,2),-10,'m/s^2','independent_model_derivation'),check('apex one secondheight5',y.subs(t,1),5,'m'),check('returntime positive root2',sp.solve(y,t)[1],2,'s'),check('horizontalrange atlanding',3*2,6,'m'),check('1.1second manualheight',10*R(11,10)-5*R(11,10)**2,R(99,20),'m'),check('gravitationalterm haslengthunits',SI.Quantity(10,'m/s^2')*SI.Quantity(2,'s')**2/2,20,'m')]
    for key,unit in [('SIM-C1-L003-03','m/s'),('SIM-C1-L003-04','m/s^2')]:
        result[key]+=[check('secant quotient reduced exactly',sp.cancel(((1+d)**2-1)/d),2+d,unit,'independent_symbolic_secant'),check('positiveinterval limit atzero',sp.limit(2+d,d,0,dir='+'),2,unit),check('instantaneous slope atabsolute1',sp.diff(t*t,t).subs(t,1),2,unit),check('1.75interval exact mean',2+R(7,4),R(15,4),unit),check('largestinterval endpointsquaredsignal16',(1+3)**2,16,'m' if key.endswith('03') else 'm/s','independent_model_consistency_not_extra_student_assignment')]
    result['SIM-C1-L003-03'].append(check('position coefficient units',SI.Quantity(1,'m/s^2')*SI.Quantity(2,'s')**2,4,'m'))
    result['SIM-C1-L003-04'] += [check('velocity coefficient units',SI.Quantity(1,'m/s^3')*SI.Quantity(2,'s')**2,4,'m/s'),check('animatedposition derivative isvelocity',sp.diff(t**3/3,t),t*t,'m/s','independent_model_consistency_not_extra_student_assignment'),check('animatedposition integrated units',SI.Quantity(1,'m/s^3')*SI.Quantity(3,'s')**3/3,9,'m','independent_model_consistency_not_extra_student_assignment')]
    x=-1+2*t
    result['SIM-C1-L003-05'] += [check('constantvelocity byderivative',sp.diff(x,t),2,'m/s'),check('zeroacceleration bysecondderivative',sp.diff(x,t,2),0,'m/s^2'),check('equalone secondincrements',sp.expand(x.subs(t,t+1)-x),2,'m'),check('initialnegativeposition',x.subs(t,0),-1,'m'),check('2.5seconds givesposition4',x.subs(t,R(5,2)),4,'m')]
    left=sp.limit((2*(2+h)-4)/h,h,0,dir='-');right=sp.limit((8-2*(2+h)-4)/h,h,0,dir='+')
    result['SIM-C1-L003-06'] += [check('piececontinuity attwo',2*2,8-2*2,'m'),check('returnafter4',8-2*4,0,'m'),check('sameposition at1and3',2*1,8-2*3,'m'),check('wholetrip meanvelocity0',(0-0)/sp.Integer(4),0,'m/s'),check('pathlength8',abs(sp.Integer(4))+abs(sp.Integer(-4)),8,'m'),check('meanspeed2',sp.Rational(8,4),2,'m/s'),check('leftvelocityatinversion',left,2,'m/s'),check('rightvelocityatinversion',right,-2,'m/s'),check('no unique instantaneousvelocityatcorner',sp.Integer(int(left!=right)),1,'','independent_model_limit')]
    return result


def runtime_values(sources):
    code="import {esperienza} from './static/js/banchi/voci/esperimento.js';import {n} from './static/js/banchi/misure.js';const sources="+canonical([sources[k] for k in sorted(SPECS)])+";\n"+r"""
const out={};
for(const source of sources){
 const a=await esperienza(source),c=source.control,count=Math.round((c.max-c.min)/c.step)+1,cases=[];
 for(let i=0;i<count;i++){
  const x=c.min+i*c.step,p={x},s=a.model.solve(p),clock=a.clock;
  const duration=clock?.duration(x,s.y),timeSamples=[];
  if(clock)for(const time of [0,duration/2,duration]){
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
    summaries={}
    def body_geometry(key,x,elements,time=None):
        i=int(key[-2:]);x=sp.Rational(str(x));t=x if time is None else sp.Rational(str(time))
        if i==2:
            balls=[e for e in elements if e.get('kind')=='ball' and e.get('r')==.12]
            expected=[-sp.Rational(11,5)+sp.Rational(24,25)*t,sp.Rational(17,100)+sp.Rational(8,25)*(10*t-5*t*t),0]
            arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==0x7350b0]
            return len(balls)==1 and all(near(balls[0]['p'][j],v) for j,v in enumerate(expected)) and len(arrows)==1 and near(arrows[0]['b'][0]-arrows[0]['a'][0],sp.Rational(48,25))
        if i==1:pos=x;lo=-2;hi=6
        elif i==3:pos=(1+(x if time is None else t))**2;lo=0;hi=16
        elif i==4:pos=(1+(x if time is None else t))**3/3;lo=0;hi=22
        elif i==5:pos=-1+2*t;lo=-1;hi=9
        else:pos=exact_value(key,t);lo=0;hi=4
        expected=-sp.Rational(119,50)+sp.Rational(119,25)*(pos-lo)/(hi-lo)
        boxes=[e for e in elements if e.get('kind')=='box' and e.get('c')==0x147979]
        arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==0x7350b0]
        offset=sp.Rational(13,240)*(1+(x if time is None else t))**2 if i==4 else sp.Rational(13,25) if i==5 else (sp.Rational(13,25) if t<2 else -sp.Rational(13,25) if t>2 else 0) if i==6 else 0
        arrow_ok=(not arrows) if offset==0 else (len(arrows)==1 and near(arrows[0]['a'][0],expected) and near(arrows[0]['b'][0]-arrows[0]['a'][0],offset) and all(near(arrows[0]['b'][j]-arrows[0]['a'][j],0) for j in (1,2)))
        return len(boxes)==1 and near(boxes[0]['p'][0],expected) and arrow_ok
    for key,(lo,hi,step,x0,x1,transfer,unit) in SPECS.items():
        item=actual.get(key,{});cases=item.get('cases',[]);errors=[];count=round((hi-lo)/step)+1;clock=item.get('clock');i=int(key[-2:]);clock_count=0
        if len(cases)!=count:errors.append('Actual controlgrid incomplete')
        params=item.get('params',[])
        if len(params)!=1 or any(params[0].get(f)!=v for f,v in (('key','x'),('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual domain/default differs')
        if i==1:
            if clock is not None:errors.append('Unexpected clock for fixedposition comparison')
        else:
            expected_input=i in (2,5,6);duration=hi if expected_input else x0
            secant='velocità media' if i==3 else 'accelerazione media' if i==4 else None
            if not clock or any(clock.get(f)!=v for f,v in (('input',expected_input),('secant',secant),('clockUnit','s'),('pace',1),('duration',duration))):errors.append('Clock metadata differs')
        for index,c in enumerate(cases):
            x=sp.Rational(str(lo))+index*sp.Rational(str(step))
            if not near(c.get('x'),x) or not near(c.get('output',{}).get('y'),exact_value(key,x)):errors.append('Actual law/control differs')
            if not body_geometry(key,x,c.get('elements',[])):errors.append('Apparatus endpoint differs')
            graphs=c.get('graphs',[])
            if len(graphs)!=(2 if i in (3,4) else 1):errors.append('Missing expected control/secant graph')
            elif len(graphs[0].get('series',[{}])[0].get('points',[]))!=101:errors.append('Controlgraph sample count differs')
            else:
                if any(not near(y,exact_value(key,z)) for z,y in graphs[0]['series'][0]['points']):errors.append('Controlgraph differs')
                if i in (3,4):
                    signal=graphs[1];series=signal.get('series',[])
                    if len(series)!=2 or len(series[0].get('points',[]))!=161:errors.append('Secant/signal graph incomplete')
                    else:
                        if any(not near(y,(1+sp.Rational(str(z)))**2) for z,y in series[0]['points']):errors.append('Clock signal graph differs')
                        if series[1].get('points')!=[[0,1],[float(x),float((1+x)**2)]] or series[1].get('dash') is not True:errors.append('Secant endpoints/style differ')
                        if signal.get('x')!='Tempo dalla prima lettura (s)' or signal.get('y')!=('Posizione durante la misura (m)' if i==3 else 'Velocità durante la misura (m/s)'):errors.append('Secant graph origin/units differ')
            samples=c.get('timeSamples',[])
            if i==1:
                if samples:errors.append('Unexpected time samples')
                continue
            duration=sp.Rational(str(hi)) if i in (2,5,6) else x
            if not near(c.get('duration'),duration) or len(samples)!=3:errors.append('Incomplete clock duration/samples')
            for sample,time in zip(samples,(0,duration/2,duration)):
                clock_count+=1;input_value=time if i in (2,5,6) else x
                if not near(sample.get('time'),time) or not near(sample.get('input'),input_value) or not near(sample.get('output',{}).get('y'),exact_value(key,input_value)):errors.append('Clock scalar synchronization differs')
                if not body_geometry(key,x,sample.get('elements',[]),time):errors.append('Clock apparatus trajectory differs')
                if i in (3,4):
                    if not near(sample.get('signal'),(1+time)**2):errors.append('Clock signal differs')
                    readings=sample.get('readings',[])
                    if len(readings)!=4 or not near(readings[3][1],(1+time)**2):errors.append('Actual changing clock reading differs')
                elif sample.get('signal') is not None:errors.append('Unexpected separate signal')
            if i==6:
                reading=c.get('readings',[])
                want='Inversione' if x==2 else 2 if x<2 else -2
                if len(reading)!=3 or reading[2][1]!=want:errors.append('Corner/velocity comparison reading differs')
        assignments=item.get('assessment',[])
        if len(assignments)!=2:errors.append('Generated assignments incomplete')
        else:
            for a,x in zip(assignments,(x1,transfer)):
                if not near(a.get('value'),exact_value(key,x)) or a.get('unit')!=unit:errors.append('Actual assigned value/units differs')
        if item.get('prediction',{}).get('correct')!=(1 if i==6 else 2):errors.append('Prediction differs')
        summaries[key]={'ok':not errors,'numericPhysicsMatches':not errors,'caseCount':len(cases),'plannedCaseCount':count,'clockSampleCount':clock_count,'errors':errors,'firstAssessmentInput':x1,'transferInput':transfer,'manualityIssue':False,'formatRoundtrip':item.get('formatRoundtrip',[])}
    return summaries

MANUAL={
'SIM-C1-L003-01':'Fixedstart2m: final0 gives displacement-2, comparison5 gives+3, actualtransfer2 gives0. Final-2 gives-4 despiteposition-2; final1gives-1 despitepositiveposition. Signed halfintegergridonly, finite subtraction.',
'SIM-C1-L003-02':'From y0=0,vy0=10m/s,g10m/s², y=10t-5t² and x=3t. References0=>0/1=>5; actual transfer1.1s gives11-5*121/100=99/20=4.95m. Apex1sheight5, flight2srange6, no air resistance. Finite tenths and squared integers, no numericroot or inverse trig required.',
'SIM-C1-L003-03':'s=k t²,k1m/s², absolute t0=1s. WindowD>0: ((1+D)²-1)/D=2+D m/s. References D1=>3/D2=>4; actualtransferD7/4=>15/4=3.75. LimitD→0+ gives2m/s; minimumUI D1/4 gives2.25, not an assertion of numerically reaching2. Clocktime is elapsed fromfirstreading, signalposition(1+t)²; secant endpoints1 and(1+D)².',
'SIM-C1-L003-04':'v=k t²,k1m/s³, absolute t0=1s. Meanacceleration ((1+D)²-1)/D=2+D m/s²; references3/4 and actualD7/4=>15/4=3.75. Instantaneousa at1 is2m/s². Positionforanimation integratesv to t³/3 with arbitraryfixedorigin; this model consistency check is not an extra assigned student integration question. Clockreadout(1+elapsed)² isvelocity, not acceleration.',
'SIM-C1-L003-05':'x=-1+2t metres, vconstant+2m/s,a0. Source1=>1/3=>5, actualtransfer2.5=>4. Everyone secondadds2m, positioncanbenegativewithoutnegativevelocity. Full0..5s belongssameuniformmotion.',
'SIM-C1-L003-06':'x=2t for0..2; then8-2t for2..4. References1/3 both2m, actualtransfer2gives4m; return4gives0. Totalpath8m/4smeanspeed2m/s, averagevelocity0. Leftvelocityat2 is+2,right-2: derivativeundefinedatcorner, not0; actualcomparison saysInversione and omitsvelocityarrowatinstant, explicitlyidealizedturnaround. Finite quarters andinteger products.'}
ASSUMPTIONS={key:'Ideal prescribed kinematics on the stated coordinate/time domain; source units and working coefficients explicit. No force reconstruction, real measured timing uncertainty or empirical student calibration inferred. Actual clock state and endpoint results are distinguished.' for key in SPECS}
PEDAGOGY={key:'Read full original and actual generated tasks/prediction/worked strings, phases, apparatus and clock/graphs. Exact manual arithmetic derived independently; reviewer differential/integral consistency checks are not extra student assignments. No source approval flag or human approval.' for key in SPECS}
VISUAL_REVIEW={
'SIM-C1-L003-01':'Rail mapping -2..6m to -2.38..2.38sceneunits, fixedVia at2m. Bodycoordinate usesfinalposition, not displacement; displacementreadingcomputedagainstfixed2. Genericrailillustrative tickmarks are not falselyassignedone metre intervals.',
'SIM-C1-L003-02':'True parabolic trajectory xscene=-2.2+.32*3t, yscene=.17+.32*(10t-5t²), flight0..2s. Clockinput, body and mainreading use samecurrenttime. Commonhorizontal/vertical lengthgain.32, projection andlandingrange consistent.',
'SIM-C1-L003-03':'Rail0..16m withfixedstartposition1m; endpoint(1+D)², movingclockbody(1+t)². Secantgraphelapsedt0..D showspositions1..(1+D)² withcorrectunits andorigin. Meanvelocityreadingfixedforselectedwindow, movingfourthreadingisposition.',
'SIM-C1-L003-04':'Rail0..22m; chosenendpoint(1+D)³/3, dynamicposition(1+t)³/3 withvelocityarrowproportionalto(1+t)². Secantgraphisvelocityversuselapsedtime, notposition. Constantmeanaccelerationresultforselectedwindowdistinctfromchangingvelocityreadout.',
'SIM-C1-L003-05':'Rail-1..9m, sameuniformcoordinate law throughoutactualclock0..5s; arrowfixedpositivevelocity. Initialpositionis-1m, notinitialdisplacement-1m.',
'SIM-C1-L003-06':'Rail0..4m, outward/returnbodytrackscontinuouspiecewiseposition. At2s omittedzero-sizedvelocityarrowisnotclaimofphysicalzero derivative: visiblecomparisonexplicitlyInversione. Positiongraphcontinuouscorner, notsmoothturnwithfalseaccelerationclaim.'}


def runtime_hashes():
    return {name:sha((APP/name).read_bytes()) if (APP/name).is_file() else 'MISSING' for name in READ_RUNTIME}



def consumer_evidence():
    file=APP/'editorial/reviews/experiments-kinematics-039-browser.json'
    protocol=APP/'tests/corpus/browser-experiments-kinematics.mjs'
    if not file.is_file() or not protocol.is_file():return {'ok':False,'error':'Observed diagnostic consumer evidence missing'}
    actual=sha(file.read_bytes());tool=sha(protocol.read_bytes())
    if actual!=READ_BROWSER_PROOF_SHA256 or tool!=READ_BROWSER_PROTOCOL_SHA256:return {'ok':False,'error':'Observed diagnostic evidence/protocol changed'}
    proof=json.loads(file.read_text())
    ok=(proof.get('terminalStatus')=='PASS' and not proof.get('errors') and proof.get('scientificApproval') is False
        and len(proof.get('cases',[]))==66 and proof.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256
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
