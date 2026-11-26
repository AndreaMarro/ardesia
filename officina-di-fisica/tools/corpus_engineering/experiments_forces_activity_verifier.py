"""Independent six Newtonian-force originals: manual tasks and force diagrams.
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
BATCH='experiments-forces-041'
READ_SOURCE_SHA256={'SIM-C1-L005-01':'b9dfdc98daf4d56e9998cb667dfcb3f21fad96e3d20ec44091c9c984c1f488ec','SIM-C1-L005-02':'a242feda39348f6bc774adb2643e992ad03e74f3045597084093ac1320458ff5','SIM-C1-L005-03':'dff8e8986cde6a2d31a15c48e55ebf8f781ada93df3ac5b059e0a10159060a2f','SIM-C1-L005-04':'0a8955d3271923573c49aa0c711719d7924ae3913d604de7b1b34d0879221900','SIM-C1-L005-05':'9117caf0752244e252695fd63abff0dc6fbcdacb500edb960cf430807f4f5ea7','SIM-C1-L005-06':'bf9444ff3003230c2f8ca274a523d15b737e49a806dd3ef75ccfb710d48f135b'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'fce66f301918483fe79d0f8dbf84c280268e48e615e9c016f2bbd32f699f5075', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/confronti.js': '4ee391c0841fed7e1888d2c57cfb2494f8e0be0581a6211d50d410bd172602b9', 'static/js/banchi/voci/legende.js': '2de769cc9358c907eb30ac6b18c6bc3e06e18a1ece514a7d368ecd40bec33d1b', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/modelli/C1.js': 'e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34', 'static/js/banchi/voci/apparati/meccanica.js': 'dc005819f8f12ec48722d32b1d236328ecab75e0734c9ecd0a147751c6bb8fd7', 'static/js/banchi/banco.js': '682ba25fcf97b67821b8c9bb6c73a571c87559f94bbda3f64cfad65fab63cdb8', 'static/js/banchi/misure.js': '8d631c65b0266ece6447da07aff7a43ee61b66d0767ddc24ace3f59b31fac186', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27'}
READ_RUNTIME_PROFILE_SHA256='f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5'
READ_BROWSER_PROOF_SHA256='df8a4bf987676b1a73ca588d84e6a882a1ae389e990e9242a9c11f6a5a8dca6b'
READ_BROWSER_PROTOCOL_SHA256='9311582a0e4ced9aeba3674eccc68248025916de303e461e38bccde7e76ec05b'
SOURCE_ISSUES={'SIM-C1-L005-05':'P2 actual generated transfer40degrees requires numerical20cos40, exact20cos(2pi/9) rejected by Number-only input; no supplied nonnotable-angle manual approximation method. Scalarphysics correct.'}
CONSUMER_ISSUES={
'SIM-C1-L005-05':'P3 undeclared different same-unit force-arrow scales in requested normal/weight comparison: at0degrees N=weight20N but green length1 versus red.75. Correct directions/scalars; diagram needs common force scale or an explicit qualitative-only qualification before comparison.',
'SIM-C1-L005-06':'P3 requested comparison of tension versus weight uses undeclared different force-arrow scales. At a0,T=mg20N yet green19/30 versus red21/50; at reachablea-3,T14<mg20N yet green133/300>red21/50, reversing the visual force inequality. ScalarNewton relation remains correct.'}
SI=pint.UnitRegistry(non_int_type=Fraction)
# Original control, two reference inputs and actual algorithm-selected transfer.
SPECS={
'SIM-C1-L005-01':(0,5,.25,1,4,2.5,'m'),
'SIM-C1-L005-02':(0,10,1,6,9,4,'N'),
'SIM-C1-L005-03':(-8,8,1,-4,6,0,'m/s²'),
'SIM-C1-L005-04':(0,12,1,3,8,6,'N'),
'SIM-C1-L005-05':(0,75,5,0,60,40,'N'),
'SIM-C1-L005-06':(-5,5,1,0,3,-1,'N')}


def exact_value(key,x):
    x=sp.Rational(str(x));i=int(key[-2:])
    if i==1:return sp.Rational(3,2)*x
    if i==2:return x-6
    if i==3:return x/2
    if i==4:return -x
    if i==5:return 20*sp.cos(x*sp.pi/180)
    return 2*(10+x)


def check(claim,actual,expected,unit='',scope='actual_assigned_exact_or_manual_relation'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    actual=sp.sympify(actual);expected=sp.sympify(expected)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
            'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    R=sp.Rational;t,F,a,theta=sp.symbols('t F a theta',real=True);result={k:[] for k in SPECS}
    solved=[(R(3,2),6,R(15,4)),(0,3,-2),(-2,3,0),(-3,-8,-6),(20,10,20*sp.cos(2*sp.pi/9)),(20,26,18)]
    for key,(_,_,_,x0,x1,transfer,unit) in SPECS.items():
        for label,x,want in zip(('first reference','comparison assignment','actual generated transfer'),(x0,x1,transfer),solved[int(key[-2:])-1]):
            result[key].append(check(label,exact_value(key,x),want,unit))
    result['SIM-C1-L005-01'] += [check('velocity retainedafterforceceases',sp.diff(R(3,2)*t,t),R(3,2),'m/s'),check('zeroacceleration ininertialframe',sp.diff(R(3,2)*t,t,2),0,'m/s^2'),check('one secondincrement',sp.expand(R(3,2)*(t+1)-R(3,2)*t),R(3,2),'m'),check('actualtransferunits',SI.Quantity(R(3,2),'m/s')*SI.Quantity(R(5,2),'s'),R(15,4),'m')]
    result['SIM-C1-L005-02'] += [check('samebodyforcebalance6minus6',6-6,0,'N'),check('no rightforce leavesleftminus6',0-6,-6,'N'),check('largest rightforce net4',10-6,4,'N')]
    result['SIM-C1-L005-03'] += [check('6newtons divided2kilograms',SI.Quantity(6,'N')/SI.Quantity(2,'kg'),3,'m/s^2'),check('negativeforce negativeaccel',-8/sp.Integer(2),-4,'m/s^2'),check('zeroforce zeroacceleration',0/sp.Integer(2),0,'m/s^2'),check('Newton relation reconstructed',2*(F/2),F,'N')]
    result['SIM-C1-L005-04'] += [check('actionreaction sum internalforces',F+(-F),0,'N'),check('reversingbodylabels reversesforce',-(-F),F,'N'),check('zero interaction bothzero',-sp.Integer(0),0,'N')]
    tangent=sp.Matrix([sp.cos(theta),sp.sin(theta)]);normal=sp.Matrix([-sp.sin(theta),sp.cos(theta)]);weight=sp.Matrix([0,-20])
    result['SIM-C1-L005-05'] += [check('normal perpendicular tangent',sp.trigsimp(tangent.dot(normal)),0),check('weightnormalcomponent negative20cos',weight.dot(normal),-20*sp.cos(theta),'N'),check('positive normal balances perpendicularweight',sp.simplify(weight.dot(normal)+20*sp.cos(theta)),0,'N'),check('parallel holdingforce balances downslopeweight',sp.simplify(weight.dot(tangent)+20*sp.sin(theta)),0,'N'),check('normalat75 exactoptionalinstrumentvalue',20*sp.cos(5*sp.pi/12),5*(sp.sqrt(6)-sp.sqrt(2)),'N','reviewer_optional_instrument_model_not_assigned_numeric_task')]
    result['SIM-C1-L005-06'] += [check('Newtonverticalbalance reconstructed',2*(10+a)-20,2*a,'N'),check('inertialmass SIrelation',SI.Quantity(2,'kg')*(SI.Quantity(10,'m/s^2')+SI.Quantity(-1,'m/s^2')),18,'N'),check('constantvelocity T20',2*(10+0),20,'N'),check('minimumacceleration tensionpositive10',2*(10-5),10,'N'),check('maximumacceleration tension30',2*(10+5),30,'N'),check('negative3 downwardnetforce6',2*(10-3)-20,-6,'N')]
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
    G=0x147979;R=0xb94f48;P=0x7350b0;O=0xd49332
    def arrow(elements,color,delta):
        arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==color]
        if sum(float(x*x) for x in delta)<.015**2:return not arrows
        return len(arrows)==1 and all(near(arrows[0]['b'][j]-arrows[0]['a'][j],x) for j,x in enumerate(delta))
    def geometry(key,x,elements):
        x=sp.Rational(str(x));i=int(key[-2:])
        if i==1:
            boxes=[e for e in elements if e.get('kind')=='box' and e.get('c')==G]
            position=-sp.Rational(119,50)+sp.Rational(119,125)*x
            return len(boxes)==1 and near(boxes[0]['p'][0],position) and arrow(elements,P,[sp.Rational(117,200),0,0])
        if i==2:return arrow(elements,G,[sp.Rational(19,100)*x,0,0]) and arrow(elements,R,[-sp.Rational(57,50),0,0]) and arrow(elements,P,[0,0,0])
        if i==3:return arrow(elements,G,[sp.Rational(57,250)*x,0,0]) and arrow(elements,P,[x/6,0,0]) and arrow(elements,R,[0,0,0])
        if i==4:
            arrows=[e for e in elements if e.get('kind')=='arrow'];bodies=[e for e in elements if e.get('kind')=='box']
            if len(bodies)!=2:return False
            if x==0:return not arrows
            return arrow(elements,P,[-x/9,0,0]) and arrow(elements,G,[x/9,0,0]) and all(near(e['a'][0],-sp.Rational(17,50) if e['c']==P else sp.Rational(17,50)) for e in arrows)
        if i==5:
            th=x*sp.pi/180;n=sp.cos(th)
            return arrow(elements,R,[0,-sp.Rational(3,4),0]) and arrow(elements,G,[-n*sp.sin(th),n*sp.cos(th),0])
        return arrow(elements,R,[0,-sp.Rational(21,50),0]) and arrow(elements,G,[0,sp.Rational(19,300)*(10+x),0])
    summaries={}
    for key,(lo,hi,step,x0,x1,transfer,unit) in SPECS.items():
        item=actual.get(key,{});cases=item.get('cases',[]);errors=[];count=round((hi-lo)/step)+1;i=int(key[-2:]);observations=0;clock=item.get('clock')
        if len(cases)!=count:errors.append('Actual controlgrid incomplete')
        params=item.get('params',[])
        if len(params)!=1 or any(params[0].get(f)!=z for f,z in (('key','x'),('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual domain/default differs')
        if i==1:
            if not clock or any(clock.get(f)!=z for f,z in (('input',True),('secant',None),('clockUnit','s'),('pace',1),('duration',5))):errors.append('Clockmetadata differs')
        elif clock is not None:errors.append('Unexpected motionclock for forcecomparison')
        for index,c in enumerate(cases):
            x=sp.Rational(str(lo))+index*sp.Rational(str(step))
            if not near(c.get('x'),x) or not near(c.get('output',{}).get('y'),exact_value(key,x)):errors.append('Scalar law/control differs')
            if not geometry(key,x,c.get('elements',[])):errors.append('Observed arrow/body implementation differs')
            graphs=c.get('graphs',[])
            if len(graphs)!=1:errors.append('Expected one controlgraph')
            else:
                points=graphs[0].get('series',[{}])[0].get('points',[])
                if len(points)!=101 or any(not near(y,exact_value(key,z)) for z,y in points):errors.append('Controlgraph differs')
            if i==4:
                readings=c.get('readings',[])
                if len(readings)!=3 or not near(readings[2][1],0) or readings[2][2]!='N':errors.append('Two-body total-force comparison differs')
            samples=c.get('timeSamples',[])
            if i!=1:
                if samples:errors.append('Unexpected clockframes')
                continue
            if not near(c.get('duration'),5) or len(samples)!=4:errors.append('Incomplete timeline observations')
            for sample,time in zip(samples,(0,sp.Rational(5,4),sp.Rational(5,2),5)):
                observations+=1
                if not near(sample.get('time'),time) or not near(sample.get('input'),time) or not near(sample.get('output',{}).get('y'),sp.Rational(3,2)*time) or not geometry(key,time,sample.get('elements',[])):errors.append('Timeline synchronization differs')
        assignments=item.get('assessment',[])
        if len(assignments)!=2:errors.append('Generated questions incomplete')
        else:
            for a,x in zip(assignments,(x1,transfer)):
                if not near(a.get('value'),exact_value(key,x)) or a.get('unit')!=unit:errors.append('Assigned value/units differs')
        if item.get('prediction',{}).get('correct')!=(0 if i in (4,5) else 2):errors.append('Prediction differs')
        summaries[key]={'ok':not errors,'numericPhysicsMatches':not errors,'caseCount':len(cases),'plannedCaseCount':count,'clockSampleCount':observations,'errors':errors,'firstAssessmentInput':x1,'transferInput':transfer,'manualityIssue':key in SOURCE_ISSUES,'formatRoundtrip':item.get('formatRoundtrip',[])}
    return summaries

def force_diagram_checks(actual):
    result={'SIM-C1-L005-05':[],'SIM-C1-L005-06':[]}
    for key,x,physical_green in [('SIM-C1-L005-05',0,20),('SIM-C1-L005-06',0,20),('SIM-C1-L005-06',-3,14)]:
        case=next((c for c in actual.get(key,{}).get('cases',[]) if c.get('x')==x),None)
        arrows=case.get('elements',[]) if case else []
        lengths={}
        for name,color in [('green',0x147979),('red',0xb94f48)]:
            found=[e for e in arrows if e.get('kind')=='arrow' and e.get('c')==color]
            if len(found)==1:lengths[name]=math.sqrt(sum((b-a)**2 for a,b in zip(found[0]['a'],found[0]['b'])))
        complete=set(lengths)=={'green','red'}
        ok=complete and (math.isclose(lengths['green'],lengths['red'],rel_tol=1e-10) if x==0 else lengths['green']<lengths['red'])
        result[key].append({'claim':'same-unit force comparison at control'+str(x),'ok':bool(ok),'actualSceneLengths':lengths,
            'independentForceValuesN':{'green':physical_green,'red':20},'dimension':{'[mass]':'1','[length]':'1','[time]':'-2'},
            'scope':'requested same-unit comparison with no declared independent/qualitative scales; scalar Newton physics remains correct',
            'mode':'AI_CONSUMER_FORCE_DIAGRAM_CONFORMANCE'})
    return result


MANUAL={
'SIM-C1-L005-01':'Inertialframe,zeronetforce preservesgiveninitial1.5m/s, x=1.5t. References1=>1.5/4=>6, actual2.5=>15/4=3.75m. Zeroresultantdoesnotforcezerovelocity. Finitequarterproducts.',
'SIM-C1-L005-02':'Bothforcesonsamebody, +F and-6N: totalF-6. Ref6=>0/9=>3, actual4=>-2N. InitiallyrestbodyremainsrestonlyatbalanceF6; weight/normalverticalbalanceasstated, notan actionreactionpaironsamebody.',
'SIM-C1-L005-03':'Fixedmass2kg,inertialhorizontalfrictionlessguide, a=F/2. Ref-4=>-2/6=>3,actual0=>0m/s². Oppositeforcesignchangesaccelerationsign, notmass. N/kg=m/s², forceandaccelerationnotcommensuratelengthunits.',
'SIM-C1-L005-04':'AonB +F, BonA -F ondistinctbodies. Ref3=>-3/8=>-8, actual6=>-6N. Internalforcescancelonlyinthecombinedsystem, not singlecartforcebalance. Directionlabels/appliedbodiesmatter; nopredictedvelocityfromforcealone.',
'SIM-C1-L005-05':'Weight20N, blockheldalongplane, zero normalacceleration yieldsN20cosθ; supportparallelplanedoesnotchangeperpcomponent. Ref0=>20/60=>10N. Actuallegacytransfer40deg requires20cos(2pi/9), numeric15.320888862, exactsymbolicinputrejected andno suppliednonnotablemanualapproximation. Scalarlawcorrect. Separate undeclared same-unit force-arrow scale concern isconsumer presentation,notwrongNformula.',
'SIM-C1-L005-06':'Upwardpositive: T-mg=ma,m2kg,g10 ->T20+2a. Ref0=>20/3=>26, actual-1=>18N. Domaina-5..5givesT10..30positive, no slack/negativeTbranch. a-3 givesT14N andnet-6N downward; constantvelocitya0givesTmg20. ScalarNewtonrelation/manualarithmeticcorrect, separatevisualforce-scaleconcern retained.'}
ASSUMPTIONS={key:'Full source physical setup and units retained; force results are in an inertialframe on the stated domain. Actual tasks distinguished from idealized force-only drawings and optional instrument outputs; no measuredstudentcalibration or motion inferredfromforcealone.' for key in SPECS}
PEDAGOGY={key:'Read all source and actual generated tasks, phases/readings/graphs/apparatus. Independent literal arithmetic and physicalforcebalance, not sourceapproval. Same-body force balance distinctfrom actionreactionacrossbodies; same-unit force-arrow comparison concerns separatedfromcorrect scalarphysics.' for key in SPECS}
VISUAL_REVIEW={
'SIM-C1-L005-01':'Rail0..7.5m, body1.5t; fixedpositivevelocityarrow, actualelapsedclock0..5s. Zeroforce isnotcodedaszerovelocity.',
'SIM-C1-L005-02':'Forcesfromsameblock rightFandleft6 sharecommon1.14/6gain andopposeddirections, equalarrowsatF6. No motiontrajectoryclaimed bystaticFBD.',
'SIM-C1-L005-03':'Signedforcegreen andaccelerationpurple sharecorrectdirection butdifferentphysicalunits/scales explicitlydistinguished. Weight/normalnotdrawnin horizontal-onlyview.',
'SIM-C1-L005-04':'Two carts Aleft/Bright, forcearrowsappliedtoeachbody atseparateorigins withsamegain1/9 andequalopposeddeltas; zerointeractionomitsbotharrows.',
'SIM-C1-L005-05':'Weightredvertical andnormalgreen perpendicularplanesameorigin, directionscorrect. At0 bothforces20N butlengths.75and1 withnocommonforcegain/declaredqualitativeexception. Requestedcomparisonthereforehasmisleadingsame-unitmagnitudes, sourceformulaunchanged.',
'SIM-C1-L005-06':'String/massfixedposeisforcecomparisonnottrajectory. Redweightlength21/50, greentensiongain19/600scene/N. AtT20 length19/30 not21/50; a-3 T14 yetgreen133/300>red126/300 althoughphysicalT<mg. Actualcaptionaskscomparethetwoforces, no stated independent scales.'}


def runtime_hashes():
    return {name:sha((APP/name).read_bytes()) if (APP/name).is_file() else 'MISSING' for name in READ_RUNTIME}



def consumer_evidence():
    file=APP/'editorial/reviews/experiments-forces-041-browser-originals.json'
    protocol=APP/'tests/corpus/browser-experiments-forces.mjs'
    if not file.is_file() or not protocol.is_file():return {'ok':False,'error':'Observed diagnostic consumer evidence missing'}
    actual=sha(file.read_bytes());tool=sha(protocol.read_bytes())
    if actual!=READ_BROWSER_PROOF_SHA256 or tool!=READ_BROWSER_PROTOCOL_SHA256:return {'ok':False,'error':'Observed diagnostic evidence/protocol changed'}
    proof=json.loads(file.read_text())
    ok=(proof.get('terminalStatus')=='PASS' and not proof.get('errors') and proof.get('scientificApproval') is False
        and len(proof.get('cases',[]))==60 and proof.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256
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

        if actual:checks.extend(force_diagram_checks(actual).get(key,[]))

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
        'sourceManualityIssueIds':sorted(SOURCE_ISSUES),'consumerInterfaceIssueIds':sorted(CONSUMER_ISSUES),'consumerRepresentationIssueIds':sorted(CONSUMER_ISSUES),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_or_revision_author','originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
