"""Independent effective experiment review on the final reviewed runtime (see shared integrity boundary); original unsupported-angle probes remain historical boundaries, not new student tasks. No authoring imports or human approval."""
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
BATCH='experiments-forces-revision-140'
READ_SOURCE_SHA256={'SIM-C1-L005-01':'b9dfdc98daf4d56e9998cb667dfcb3f21fad96e3d20ec44091c9c984c1f488ec','SIM-C1-L005-02':'a242feda39348f6bc774adb2643e992ad03e74f3045597084093ac1320458ff5','SIM-C1-L005-03':'dff8e8986cde6a2d31a15c48e55ebf8f781ada93df3ac5b059e0a10159060a2f','SIM-C1-L005-04':'0a8955d3271923573c49aa0c711719d7924ae3913d604de7b1b34d0879221900','SIM-C1-L005-05':'9117caf0752244e252695fd63abff0dc6fbcdacb500edb960cf430807f4f5ea7','SIM-C1-L005-06':'bf9444ff3003230c2f8ca274a523d15b737e49a806dd3ef75ccfb710d48f135b'}
SOURCE_ISSUES={'SIM-C1-L005-05':'P2 actual generated transfer40degrees requires numerical20cos40, exact20cos(2pi/9) rejected by Number-only input; no supplied nonnotable-angle manual approximation method. Scalarphysics correct.'}
SI=pint.UnitRegistry(non_int_type=Fraction)
# Original control, two reference inputs and actual algorithm-selected transfer.
SPECS={
'SIM-C1-L005-01':(0,5,.25,1,4,2.5,'m'),
'SIM-C1-L005-02':(0,10,1,6,9,4,'N'),
'SIM-C1-L005-03':(-8,8,1,-4,6,0,'m/s²'),
'SIM-C1-L005-04':(0,12,1,3,8,6,'N'),
'SIM-C1-L005-05':(0,75,5,0,60,0,'N'),
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
    result['SIM-C1-L005-05'][2]=check('new actual transfer0 degrees',exact_value('SIM-C1-L005-05',0),20,'N')
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
    from .experiments_force_work_corrected_048_verifier import force_pair_front_clear
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
        if i==2:return force_pair_front_clear(elements) and arrow(elements,G,[sp.Rational(19,100)*x,0,0]) and arrow(elements,R,[-sp.Rational(57,50),0,0]) and arrow(elements,P,[0,0,0])
        if i==3:return force_pair_front_clear(elements) and arrow(elements,G,[sp.Rational(57,250)*x,0,0]) and arrow(elements,P,[x/6,0,0]) and arrow(elements,R,[0,0,0])
        if i==4:
            arrows=[e for e in elements if e.get('kind')=='arrow'];bodies=[e for e in elements if e.get('kind')=='box']
            if len(bodies)!=2:return False
            if x==0:return not arrows
            return arrow(elements,P,[-x/9,0,0]) and arrow(elements,G,[x/9,0,0]) and all(near(e['a'][0],-sp.Rational(17,50) if e['c']==P else sp.Rational(17,50)) for e in arrows)
        if i==5:
            th=x*sp.pi/180;n=sp.cos(th)
            return arrow(elements,R,[0,-sp.Rational(3,4),0]) and arrow(elements,G,[-sp.Rational(3,4)*n*sp.sin(th),sp.Rational(3,4)*n*sp.cos(th),0]) and all(c['ok'] for c in incline_force_visibility_checks(x,elements))
        red=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==R];balls=[e for e in elements if e.get('kind')=='ball']
        weight_clear=len(red)==1 and len(balls)==1 and all(near(v,w+q) for v,w,q in zip(red[0]['a'],balls[0]['p'],[0,sp.Rational(16,25),sp.Rational(1,4)])) and not any(e.get('kind')=='label' for e in elements)
        return weight_clear and arrow(elements,R,[0,-sp.Rational(21,50),0]) and arrow(elements,G,[0,sp.Rational(21,500)*(10+x),0])
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


def incline_force_visibility_checks(angle,elements):
    """Independent geometric bounds for the complete canonical incline glyphs.
    Force magnitudes alone do not prove visibility. The implicit native base has
    top y=0; shaft/head radii .028/.0812 and head lengthmin(.24,.32L) are read from
    the unchanged Three renderer, not from a candidate's asserted coordinates.
    Default-camera occlusion is additionally bound to A's actual complete review.
    """
    def fail(message):return [{'claim':'complete incline glyph geometry available','ok':False,'error':message,'dimension':{}}]
    def vector(v):return isinstance(v,(list,tuple)) and len(v)==3 and all(type(x) in (int,float) and math.isfinite(x) for x in v)
    def dot(a,b):return sum(x*y for x,y in zip(a,b))
    def sub(a,b):return [x-y for x,y in zip(a,b)]
    def cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
    def length(v):return math.sqrt(dot(v,v))
    def projected_bounds(a,j,b,u,direction):
        radial=math.sqrt(max(0,1-dot(u,direction)**2))
        lo=min(dot(a,direction)-.028*radial,dot(j,direction)-.0812*radial,dot(b,direction))
        hi=max(dot(a,direction)+.028*radial,dot(j,direction)+.0812*radial,dot(b,direction))
        return lo,hi
    if not isinstance(elements,list):return fail('Element list missing')
    balls=[e for e in elements if e.get('kind')=='ball' and e.get('c')==0xd49332];arrows=[e for e in elements if e.get('kind')=='arrow'];rods=[e for e in elements if e.get('kind')=='rod']
    if len(balls)!=1 or len(arrows)!=2 or len(rods)!=8 or len(elements)!=11:return fail('Unexpected/missing opaque body, supports, glyphs or overlay')
    body=balls[0];point=body.get('p');radius=body.get('r');theta=float(angle)*math.pi/180
    tangent=[math.cos(theta),math.sin(theta),0];normal=[-math.sin(theta),math.cos(theta),0]
    if not vector(point) or type(radius) not in (int,float) or not math.isfinite(radius) or radius<=0:return fail('Opaque sphere geometry invalid')
    if body.get('alpha')!=1:return fail('Reviewed opaque body changed')
    rails=[e for e in rods if vector(e.get('a')) and vector(e.get('b')) and abs(e['a'][2]-e['b'][2])<1e-10 and length(sub(e['b'],e['a']))>2]
    if len(rails)!=2:return fail('Fixed straight plane supports missing')
    rail=rails[0];axis=sub(rail['b'],rail['a']);axis=[v/length(axis) for v in axis]
    checks=[{'claim':'drawn plane tangent matches independently specified angle','ok':length(sub(axis,tangent))<1e-10,'dimension':{}}]
    if any(type(e.get('r')) not in (int,float) or not math.isfinite(e['r']) or e['r']<=0 for e in rods):return fail('Plane support radius invalid')
    support_radius=max(e['r'] for e in rods);plane_origin=rail['a'];bounds={}
    for glyph in arrows:
        color=glyph.get('c');a=glyph.get('a');b=glyph.get('b')
        if color not in (0xb94f48,0x147979) or color in bounds or not vector(a) or not vector(b):return fail('Signed force glyph invalid/duplicated')
        d=sub(b,a);L=length(d)
        if L<=.015:return fail('Required nonzero force omitted')
        u=[v/L for v in d];joint=[b[i]-min(.24,.32*L)*u[i] for i in range(3)]
        name='normal' if color==0x147979 else 'weight';start=dot(sub(a,point),u);end=dot(sub(b,point),u)
        same_line=length(cross(sub(a,point),u))<1e-10
        # Every shaft/cone cross-section is perpendicular to u. For a collinear
        # force whose two ends lie beyond the same sphere cap, all its vertices
        # have |axial distance|>r, regardless of cone radial thickness.
        sphere_clear=same_line and start*end>0 and min(abs(start),abs(end))>radius+1e-10
        low,high=projected_bounds(a,joint,b,u,[0,1,0]);plane_low,_=projected_bounds(a,joint,b,u,normal);plane_low-=dot(plane_origin,normal)
        bounds[color]=(low,high)
        checks += [
            {'claim':name+' unchanged physical line of action','ok':same_line,'dimension':{}},
            {'claim':name+' entire shaft and head clear opaque body','ok':sphere_clear,'axialDistancesFromBody':[start,end],'sphereRadius':radius,'dimension':{}},
            {'claim':name+' entire glyph above native opaque tabletop','ok':low>0,'minimumMeshY':low,'dimension':{}},
            {'claim':name+' entire glyph clear plane supports','ok':plane_low>support_radius,'minimumPlaneClearance':plane_low,'supportRadius':support_radius,'dimension':{}}]
    if set(bounds)!={0xb94f48,0x147979}:return fail('Two distinct force colors missing')
    checks.append({'claim':'opposed force glyphs remain separate for same-unit comparison','ok':bounds[0xb94f48][0]>bounds[0x147979][1],'weightMinimumY':bounds[0xb94f48][0],'normalMaximumY':bounds[0x147979][1],'dimension':{}})
    return checks

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
    for row in (actual or {}).get('SIM-C1-L005-05',{}).get('cases',[]):
        result['SIM-C1-L005-05'].extend({**c,'controlAngle':row['x']} for c in incline_force_visibility_checks(row['x'],row['elements']))
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


# Frozen after independent full reading of final candidate and rendered asset.
PACKAGE_NAME='experiment-normal-revision-140'
REVISION_ID='SIM-C1-L005-05'
REVIEWED_REVISIONS={'SIM-C1-L005-05':'2d189fdf9d39e9364eab663c2a08fecf58e7ef1f34d2ee1bc8784776b379b221'}
MANUAL[REVISION_ID]='NEW DRAFT: mg20N, m2kg and g10m/s² are consistent. With contact and zero acceleration perpendicular to a fixed straight plane, N-mg cos(theta)=0. At60deg N20/2=10N; at0deg N20N. Parallel support forces do not alter this perpendicular balance. Domain0..75 has0<N<=20; inverse m=10/(10*1/2)=2kg and cos(theta)=1/2 gives60deg uniquely there. Normal and weight act on the same body and are not an action-reaction pair. Actual consumer selects60/0, not unsupported40.'
VISUAL_REVIEW[REVISION_ID]='Actual force renderer read with every builtin caller. Normal/weight use common0.75 scene units per20N, giving green/red1 at0 and1/2 at60deg. Tension/weight now use common0.42 per20N: ratios1 at a0 and7/10 at a-3. Independent actual SVG toggle measurements confirm these same-unit ratios; separate-unit acceleration/velocity arrows retain independent scales. Native authored reading is reachable in Comprendi.'
VISUAL_REVIEW['SIM-C1-L005-06']='Common force scale now0.42 per20N; T20 equalsweight20 and T14 is0.7 ofweight20. Fixed body pose represents force comparison, not trajectory. All other caduta callers read: free fall and kinetic-energy cases have no filo, so do not inherit the20N tension legend.'

def verify(sources, package=None, bindings=None):
    from .experiments_revision_review import verify_family
    import sys
    return verify_family(sys.modules[__name__],sources,package,bindings)


def report(sources, package=None, bindings=None):
    from .experiments_revision_review import family_report
    import sys
    return family_report(sys.modules[__name__],sources,package,bindings)


READ_NORMAL_VISIBILITY_MANIFEST_SHA256='fc8efd368725d02bcfbcd034f10eb7144d19e38726446227d6ccf5c2bc4f3bf1'
def normal_visibility_evidence():
    from .experiments_revision_review import REVIEWED_RUNTIME
    folder=APP/'editorial/reviews/normal-visibility-independent-1a35-20261125';file=folder/'manifest.json'
    if not file.is_file():return {'ok':False,'errors':['Normal full-glyph evidence missing']}
    try:
        raw=file.read_bytes();m=json.loads(raw);proof=json.loads((folder/'diagnostic.json').read_text());geometry=json.loads((folder/'complete-glyph-geometry.json').read_text());errors=[]
        if sha(raw)!=READ_NORMAL_VISIBILITY_MANIFEST_SHA256 or m.get('runtimeProfileSha256')!=REVIEWED_RUNTIME:errors.append('Normal visual epoch differs')
        for name,pin in m.get('files',{}).items():
            f=(folder/name).resolve()
            if not f.is_relative_to(folder.resolve()) or not f.is_file() or sha(f.read_bytes())!=pin:errors.append('Normal proof/PNG differs:'+name)
        expected={(edition,width,fallback,angle) for edition in ('source-v1','draft-140-v2') for width in (320,1280) for fallback in (False,True) for angle in range(0,76,5)}
        actual=[(r.get('edition'),r.get('width'),r.get('fallback'),r.get('angle')) for r in proof.get('cases',[])]
        if len(actual)!=128 or set(actual)!=expected or proof.get('diagnosticStatus')!='COMPLETED' or proof.get('errors') or proof.get('runtimeFingerprint',{}).get('sha256')!=REVIEWED_RUNTIME or proof.get('scientificApproval') is not False or proof.get('humanApproval')!='NOT_RUN' or proof.get('publicationAction')!='NONE':errors.append('Incomplete real normal visibility matrix')
        summary=geometry.get('summary',{})
        if any(summary.get(k) is not True for k in ('allTipsUnoccluded','allHeadVerticesUnoccluded','allCenterlinesUnoccluded','allEntireGlyphMeshesInsideViewport')) or summary.get('shaftRimOcclusions')!=[] or summary.get('nativeConfigurations')!=32 or summary.get('forceGlyphs')!=64:errors.append('Full force glyph visibility not established')
        for name,ref in m.get('historicalIndependentAReferences',{}).items():
            f=APP/'editorial/reviews'/name/'manifest.json'
            if not f.is_file() or sha(f.read_bytes())!=ref.get('manifestSha256'):errors.append('Independent A reference differs')
        return {'ok':not errors,'errors':errors,'manifestSha256':sha(raw),'runtimeProfileSha256':REVIEWED_RUNTIME,'observedCaseCount':len(actual),'scope':'New current128 actual cases/64 complete native glyphs; historicalA negative and positive corroboration preserved without retag; originalv1manualFAIL unchanged'}
    except (OSError,ValueError,TypeError) as exc:return {'ok':False,'errors':[str(exc)]}
