"""Independent corrected-consumer force/work corrected experiments048: complete source and actual consumer.
No authoring imports, human approval, publication, or approval from cached arithmetic.
"""
from fractions import Fraction
from pathlib import Path
import json,math,subprocess
import pint
import sympy as sp
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/esperienze-C1.json'
SOURCE_FILE_SHA256='84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3'
BATCH='experiments-force-work-corrected-048'
READ_SOURCE_SHA256={'SIM-C1-L006-01': '444a3d9fe8c31446e477dd3d72c9af784c84b1060678c31679f8ac3f1227c263', 'SIM-C1-L006-02': '3dd3ca74965f5e0fa3ce70272105418d5c1db2642f893da0ec77c1edd4632582', 'SIM-C1-L006-03': 'e44f957cf45b4effcd3f36f85850c95a04ffd10871075e7c2f6fe54a7b94ac43', 'SIM-C1-L007-01': 'f85003b40a9ad21a9aebb9d5568a2bbc15664d957dddf4dd47473d4e9182ad5c', 'SIM-C1-L007-02': 'fca8abba8445694bc3af22eef6156a0c96916efe31b4c2a752aab49043bdbe09', 'SIM-C1-L007-03': '6729a0318bbef2a6dabc6febcddd78b6cb95c3a086105947cea3744c43c77cc9'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'cc435e51b62d5b9961b32f5d9b349171f7432e3bf6a6911cd80daaa1f419767b', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/assessment-selection.js': '2f5435b6c9e8b76667d0a95f35860f835117cf8230a635c4c3a54c479fbc54b3', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/confronti.js': '83f1ab0d443dc93eb72c0318e32856179486643257c5bbf136e686464fdc6c39', 'static/js/banchi/voci/legende.js': 'eb303ca6a6013377462b51c92b541a650ee2686257cd7e4ee39fea5221a521f7', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/modelli/C1.js': 'e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34', 'static/js/banchi/voci/apparati/meccanica.js': '9be7ce68847af3d901374e98c7511921d6177d939c547e9b03f2c07a0ebd857d', 'static/js/banchi/banco.js': '8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9', 'static/js/banchi/misure.js': '46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27'}
READ_RUNTIME_PROFILE_SHA256='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
READ_BROWSER_PROOF_SHA256='ab2ed3d9724483b28964887af3c384be10f41c594bf1cecca0fe4a11f9c0181a'
READ_BROWSER_PROTOCOL_SHA256='14af18cad4cd866c6bce87ac0e1f08aeae772783e8d372dd9e04e561a72d8416'
CONSUMER_ISSUES={}
SPECS={
'SIM-C1-L006-01':(0,12,1,4,10,6,'N'),
'SIM-C1-L006-02':(-4,6,.5,-2,4,1,'N'),
'SIM-C1-L006-03':(1,4,.25,1,2,2.75,''),
'SIM-C1-L007-01':(0,180,5,0,120,90,'J'),
'SIM-C1-L007-02':(0,4,.25,1,3,2,'W'),
'SIM-C1-L007-03':(0,16,1,4,9,8,'m/s')}
SI=pint.UnitRegistry(non_int_type=Fraction)


def exact_value(key,x):
    x=sp.Rational(str(x))
    return {'SIM-C1-L006-01':lambda:x if x<=6 else sp.Integer(3),
      'SIM-C1-L006-02':lambda:-x/2,'SIM-C1-L006-03':lambda:1/x**2,
      'SIM-C1-L007-01':lambda:12*sp.cos(x*sp.pi/180),
      'SIM-C1-L007-02':lambda:6*x,'SIM-C1-L007-03':lambda:sp.sqrt(x)}[key]()


def check(claim,actual,expected,unit='',scope='actual_assigned_manual_calculation'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
      'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},'residual':str(residual),'relation':'exact','scope':scope,'ok':residual==0}


def independent_checks():
    R=sp.Rational;Q=SI.Quantity;t,x,k,r,r0,G,m1,m2=sp.symbols('t x k r r0 G m1 m2',positive=True)
    literal=[(4,3,6),(1,-2,-R(1,2)),(1,R(1,4),R(16,121)),(12,-6,0),(6,18,12),(2,3,2*sp.sqrt(2))]
    out={}
    for (key,spec),values in zip(SPECS.items(),literal):
        out[key]=[check(label,exact_value(key,value),want,spec[-1]) for label,value,want in zip(('first reference','first actual assigned task','actual generated transfer'),spec[3:6],values)]
    out['SIM-C1-L006-01'] += [check('static equality at maximum6N',exact_value('SIM-C1-L006-01',6),6,'N'),check('next reachable start7N drops to3N',exact_value('SIM-C1-L006-01',7),3,'N'),check('dynamic resultant after7N is positive4N',7-3,4,'N'),check('zero force admits zero static friction',exact_value('SIM-C1-L006-01',0),0,'N')]
    out['SIM-C1-L006-02'] += [check('force from negative elastic-energy derivative',-sp.diff(k*x*x/2,x),-k*x,'N','independent_symbolic_model'),check('50Nm times compressionminus4cm yieldsplus2N',-Q(50,'N/m')*Q(-4,'cm'),2,'N'),check('positive6cm yieldsminus3N',-Q(50,'N/m')*Q(6,'cm'),-3,'N'),check('one centimetre givesminus halfnewton',-Q(50,'N/m')*Q(1,'cm'),-R(1,2),'N')]
    out['SIM-C1-L006-03'] += [check('normalized Newton force cancels masses andG',sp.cancel((G*m1*m2/r**2)/(G*m1*m2/r0**2)),r0**2/r**2),check('doubling separation quarters force',1/sp.Integer(2)**2,R(1,4)),check('actual11over4 separation gives16over121',1/R(11,4)**2,R(16,121)),check('manual0.1322 relative error19over80000',sp.cancel((R(16,121)-R(1322,10000))/R(16,121)),R(19,80000),'','reviewer_manual_bound_not_supplied_step'),check('manual long division remainder38',160000-1322*121,38,'','reviewer_manual_bound_not_supplied_step')]
    out['SIM-C1-L007-01'] += [check('work from force dot displacement',sp.Matrix([4*sp.cos(x),4*sp.sin(x)]).dot(sp.Matrix([3,0])),12*sp.cos(x),'J','independent_symbolic_model'),check('Nmetre is joule',Q(4,'N')*Q(3,'m'),12,'J'),check('opposite direction gives negative12J',12*sp.cos(sp.pi),-12,'J'),check('orthogonal zero not speedzero',12*sp.cos(sp.pi/2),0,'J')]
    a=sp.cancel(3/R(3,2));position=a*t*t/2;velocity=sp.diff(position,t);work=3*position
    out['SIM-C1-L007-02'] += [check('Newton acceleration2',Q(3,'N')/Q(Fraction(3,2),'kg'),2,'m/s^2'),check('position from rest t squared',position,t*t,'m','independent_symbolic_model'),check('instantaneous power derivative',sp.diff(work,t),6*t,'W','independent_symbolic_model'),check('positive-duration average3t',sp.cancel(work/t),3*t,'W','domain_t_strictly_positive'),check('right limit of positive-duration average0',sp.limit(work/t,t,0,dir='+'),0,'W','limit_not_average_over_zero_duration'),check('force velocity power units',Q(3,'N')*Q(4,'m/s'),12,'W')]
    out['SIM-C1-L007-03'] += [check('energy equation solves speed square',sp.solve(sp.Eq(2*x*x/2,r),x)[0]**2,r,'m^2/s^2','independent_symbolic_model'),check('onejoule at mass2 gives1m/s',sp.sqrt(2*1/ sp.Integer(2)),1,'m/s'),check('fourfold nonzero work doubles speed',sp.simplify(sp.sqrt(4*r)/sp.sqrt(r)),2),check('work equals force times distance with1N',Q(1,'N')*Q(8,'m'),8,'J'),check('manual lower root bound squared',R(282,100)**2,R(19881,2500),'m^2/s^2','reviewer_manual_bound'),check('manual upper root bound squared',R(283,100)**2,R(80089,10000),'m^2/s^2','reviewer_manual_bound'),check('root bracket relative bound less halfpercent',sp.Integer(int(bool(R(1,100)/R(282,100)<R(1,200)))),1,'','reviewer_manual_bound')]
    return out


def runtime_values(sources):
    code="import{esperienza}from'./static/js/banchi/voci/esperimento.js';import{n}from'./static/js/banchi/misure.js';const sources="+canonical([sources[k] for k in SPECS])+";\n"+r"""
const out={};for(const source of sources){const a=await esperienza(source),c=source.control,cases=[];const count=Math.round((c.max-c.min)/c.step)+1;
 for(let i=0;i<count;i++){const x=c.min+i*c.step,p={x},s=a.model.solve(p),clock=a.clock;const timeSamples=[];if(clock){const end=clock.duration(x,s.y);for(const time of[0,end/4,end/2,end]){const input=clock.input?time:x,q={x:input},z=a.model.solve(q);timeSamples.push({time,input,output:z,elements:a.elements(x,2,time),readings:a.model.readings(q,z,time)});}}
 cases.push({x,output:s,readings:a.model.readings(p,s,0),elements:a.elements(x,2),graphs:a.model.graphs(p,s),calculation:a.measurement(x).calculation,timeSamples});}
 const c0=source.references[0][0];out[source.id]={cases,params:a.model.params,prediction:a.record.prediction,assessment:a.record.assessment,clock:a.clock?{input:!!a.clock.input,unit:a.clock.clockUnit,pace:a.clock.pace,duration:a.clock.duration(c0,0)}:null,formatRoundtrip:a.record.assessment.map(v=>({display:n(v.value),parsed:Number(n(v.value).replace(',','.'))}))};}
 console.log(JSON.stringify(out,(_k,v)=>Number.isNaN(v)?'NaN':v));
"""
    run=subprocess.run(['node','--input-type=module','-'],cwd=APP,input=code,text=True,capture_output=True,timeout=30)
    if run.returncode:raise ValueError('Actual force/work consumer failed:'+run.stderr[:500])
    return json.loads(run.stdout)


def near(actual,want):return type(actual) in (int,float) and math.isfinite(actual) and math.isclose(actual,float(want),rel_tol=1e-10,abs_tol=1e-11)


def geometry(key,x,elements):
    x=sp.Rational(str(x));G=0x147979;R=0xb94f48;P=0x7350b0;O=0xd49332
    def arrow(color,delta):
        rows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==color]
        if sum(float(z*z) for z in delta)<.015**2:return not rows
        return len(rows)==1 and all(near(rows[0]['b'][j]-rows[0]['a'][j],z) for j,z in enumerate(delta))
    if key=='SIM-C1-L006-01':return force_pair_front_clear(elements) and arrow(G,[sp.Rational(57,350)*x,0,0]) and arrow(R,[-sp.Rational(57,350)*exact_value(key,x),0,0])
    if key=='SIM-C1-L006-02':
        balls=[e for e in elements if e.get('kind')=='ball' and e.get('c')==O];return len(balls)==1 and near(balls[0]['p'][0],-sp.Rational(3,5)+sp.Rational(21,100)*x) and arrow(G,[-x/5,0,0]) and spring_exposure(x,elements)
    if key=='SIM-C1-L006-03':
        balls=[e for e in elements if e.get('kind')=='ball'];arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==G]
        return len(balls)==2 and all(near(balls[i]['p'][0],sign*sp.Rational(3,5)*x) and near(balls[i]['r'],sp.Rational(27,100)) for i,sign in enumerate((-1,1))) and len(arrows)==2 and all(near(e['b'][0]-e['a'][0],sign*sp.Rational(17,20)/x**2) for e,sign in zip(arrows,(1,-1)))
    if key=='SIM-C1-L007-01':return all(e.get('text') in ('x','y') for e in elements if e.get('kind')=='label') and arrow(G,[sp.Rational(8,5),0,0]) and arrow(O,[sp.Rational(3,2)*sp.cos(x*sp.pi/180),0,-sp.Rational(3,2)*sp.sin(x*sp.pi/180)])
    boxes=[e for e in elements if e.get('kind')=='box' and e.get('c')==G];position=x*x if key.endswith('02') else x
    delta=sp.Rational(13,60)*(x if key.endswith('02') else sp.sqrt(x))
    return len(boxes)==1 and near(boxes[0]['p'][0],-sp.Rational(119,50)+sp.Rational(119,400)*position) and arrow(P,[delta,0,0])


def compare_runtime(actual):
    out={}
    for key,(lo,hi,step,x0,x1,transfer,unit) in SPECS.items():
        item=actual.get(key,{});cases=item.get('cases',[]);errors=[];count=round((hi-lo)/step)+1;clock=item.get('clock');timed=key=='SIM-C1-L007-02';observations=0
        if len(cases)!=count:errors.append('Incomplete actual control grid')
        params=item.get('params',[])
        if len(params)!=1 or any(params[0].get(f)!=v for f,v in (('key','x'),('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual control/default differs')
        if clock!=({'input':True,'unit':'s','pace':1,'duration':4} if timed else None):errors.append('Unexpected clock metadata')
        for i,c in enumerate(cases):
            x=sp.Rational(str(lo))+i*sp.Rational(str(step))
            if not near(c.get('x'),x) or not near(c.get('output',{}).get('y'),exact_value(key,x)):errors.append('Actual scalar law differs')
            if not geometry(key,x,c.get('elements',[])):errors.append('Apparatus geometry/direction/scale differs')
            readings=c.get('readings',[])
            if key=='SIM-C1-L006-01' and (len(readings)!=3 or readings[2][1]!=('Quiete' if x<=6 else 'Scivolamento')):errors.append('Rest/start state differs')
            if timed and not mean_reading_ok(readings,x):errors.append('Mean power domain/readout differs')
            graphs=c.get('graphs',[])
            if len(graphs)!=1:errors.append('Actual graph missing')
            else:
                points=graphs[0]['series'][0]['points']
                if key=='SIM-C1-L006-01':
                    if points!=[[0,0],[6,6],[6,'NaN'],[6,3],[12,3]] or not near(graphs[0].get('point'),exact_value(key,x)):errors.append('Static/dynamic discontinuity graph/gap differs')
                elif len(points)!=101 or any(not near(y,exact_value(key,z)) for z,y in points):errors.append('Control graph differs')
            samples=c.get('timeSamples',[])
            if len(samples)!=(4 if timed else 0):errors.append('Clock-frame count differs')
            for sample,time in zip(samples,(0,1,2,4)):
                observations+=1
                if timed and not mean_reading_ok(sample.get('readings',[]),sp.Rational(str(time))):errors.append('Elapsed mean power domain/readout differs')
                if not near(sample['time'],time) or not near(sample['input'],time) or not near(sample['output']['y'],6*time) or not geometry(key,time,sample['elements']):errors.append('Elapsed motion synchronization differs')
        assigned=item.get('assessment',[])
        if len(assigned)!=2 or any(not near(a.get('value'),exact_value(key,x)) or a.get('unit')!=(unit or 'numero puro') for a,x in zip(assigned,(x1,transfer))):errors.append('Actual generated tasks differ from independent solutions')
        if item.get('prediction',{}).get('correct')!=(2 if key in ('SIM-C1-L007-02','SIM-C1-L007-03') else 0):errors.append('Prediction differs from physical comparison')
        out[key]={'ok':not errors,'caseCount':len(cases),'plannedCaseCount':count,'clockSampleCount':observations,'errors':errors,'firstAssessmentInput':x1,'transferInput':transfer,'formatRoundtrip':item.get('formatRoundtrip',[])}
    return out

MANUAL={
'SIM-C1-L006-01':'Each trial restarts from rest. Static magnitude equals applied F through6N, then assigned kinetic3N beyond6. Actual tasks10N=>3N and threshold6N=>6N. At7N net right force4N, not a negative friction. All finite integer arithmetic; no source mass or unassigned acceleration inferred.',
'SIM-C1-L006-02':'50N/m times x_cm/100 yields -x_cm/2N. References-2cm=>+1N and4cm=>-2N; actual transfer+1cm=>-1/2N. Boundaries-4=>+2N,0=>0,6=>-3N. Restoring sign follows negative derivative of kx²/2, within the assigned ideal elastic interval.',
'SIM-C1-L006-03':'Divide Gm1m2/r² by its value at fixed nonzero r0: ratio1/x², with x=r/r0. References1=>1 and2=>1/4; actual transfer x11/4 gives16/121. Finite long division160000=121*1322+38 yields0.1322; relative error19/80000<0.005, so the Number-only grader has a feasible manual input. This reviewer procedure is not claimed as text supplied by the source. No numeric G or astronomical masses needed.',
'SIM-C1-L007-01':'W=F dot displacement, constant4N over straight3m:12cos(theta)J. First assessed120deg uses cos=-1/2=>-6J. Actual transfer is90deg=>0J, not95deg. Opposite180deg=>-12J; aligned0=>12J. Negative work is energy transferred out through this force, not a negative displacement length or necessarily total net work.',
'SIM-C1-L007-02':'F3N/mass3/2kg gives a2m/s²; from rest v2t and s=t². Work3t² and instantaneous derivative6t W. Actual tasks3s=>18W and2s=>12W are manual and correct. Mean from start is3t W only for t>0. At0 the instantaneous power is0, but the average over a zero-duration interval is undefined0/0. Its right-limit0 exists; the historical5405 consumer displayed0W without that qualification; corrected current consumer must explicitly mark the zero-duration mean undefined while preserving instantaneous0W.',
'SIM-C1-L007-03':'Net work DeltaK, from rest and m2kg gives speed sqrt(W) in SI. References4J=>2m/s,9J=>3m/s. Actual transfer8J=>2sqrt2m/s. Manual2.82²=7.9524<8<8.0089=2.83² bounds the root; .01/2.82<.005, so numeric2.83 is safely accepted. Source explicitly derives the perfect-square9 case; this extra bracket is a reviewer feasibility proof, not a supplied source instruction. Positive1N resultant gives distanceW/(1N), matching rail coordinate. Fourfold work doubles speed, not twofold work.'}
ASSUMPTIONS={
'SIM-C1-L006-01':'Independent starts from rest, one oriented horizontal force, constant normal/contact and assigned Coulomb maximum6N versus kinetic3N. Domain0..12N; equality can remain static. The slider compares independent trials, not deceleration hysteresis of one already moving block. Diagram is a force snapshot, not a time trajectory.',
'SIM-C1-L006-02':'Ideal linear spring, fixed positive k50N/m, signed displacement from a fixed rest position, actual interval-4..6cm declared elastic. No preload, gravity component or extra force included. Diagram length remains positive throughout; cm input is converted to m before Hooke law.',
'SIM-C1-L006-03':'Fixed positive masses and Newtonian inverse-square law, finite nonzero reference distance. Spherical symmetric bodies do not overlap: displayed radii0.27 each versus minimum centre separation1.2 scene units. Centre distance, not surface gap, scales with x1..4. Force ratio dimensionless; equal/opposite forces act on distinct bodies. Static configuration comparison, no unassigned orbital or falling dynamics.',
'SIM-C1-L007-01':'Force constant in magnitude and direction within each straight3m trial;4N and angle0..180deg from rightward displacement. Scalar work of this force, not necessarily net work. Variable control rotates between separate trials. Metre displacement and newton force vectors have separate display scales; work is not represented as a vector.',
'SIM-C1-L007-02':'Constant resultant/tractive3N on inertial mass1.5kg, from rest, straight horizontal positive motion with no opposing work. Time0..4s is actual elapsed input. Instantaneous power valid also at0; average work/time requires t>0. No average-over-empty-interval convention is specified. The historical consumer failure remains in045; the current consumer must enforce this distinction.',
'SIM-C1-L007-03':'Net work0..16J on a2kg cart initially at rest, positive1N resultant along straight guide. Speed is nonnegative square root; no real negative-work-from-rest branch in the domain. Work control determines independent final states; there is no clock in this experiment. Velocity arrow is speed, not force or a vector representation of energy.'}
VISUAL_REVIEW={
'SIM-C1-L006-01':'One block, green right applied force and red left friction use common gain57/350 scene units perN; origins slightly separated on same body for clarity. Equal arrows through6N; kinetic friction drops to3N at7N. Graph has a NaN break, not an interpolated slope through the jump. Exact threshold active point/readout remains6N, and lower branch represents the right-hand kinetic limit.',
'SIM-C1-L006-02':'Fixed spring support x-2.1, rest tip-0.6, actual tip-0.6+0.21*x_cm. Length1.5+0.21*x remains0.66..2.76, always positive. Green force delta-0.2*x_cm points toward rest on either side and vanishes at0. Spring coil geometry is illustrative, not a real material strain calibration.',
'SIM-C1-L006-03':'Centres at plus/minus0.6*x, constant radii0.27; centre line and equal inward force arrows. Each force length0.85/x²: doubling distance quarters both arrows. Minimum spheres do not overlap. Arrow origins lifted above centre line for visibility, not a claimed off-centre torque.',
'SIM-C1-L007-01':'Green horizontal displacement delta1.6 represents3m; orange rotating force length1.5 represents4N, logical+y is negative scene z. The dashed projection closes onto the displacement axis. Different physical units are not compared as equal screen lengths; displayed work remains scalar and may be negative.',
'SIM-C1-L007-02':'Cart position is t²m mapped to rail-2.38+(119/400)t², speed arrow delta13t/60. Elapsed clock0..4s updates scalar P6t, geometry and readings from the same instant; default selected1s is not a separate initial condition. Positive-duration average3t matches its physical definition; at0 the corrected mean must be explicitly undefined, while instantaneous0W remains valid.',
'SIM-C1-L007-03':'Cart coordinateW/(1N) mapped linearly to rail-2.38+(119/400)W. Speed arrow delta13sqrt(W)/60, omitted at0. Work and speed use their correct distinct units; concave square-root graph, not a linear speed/work relation. No artificial motion clock or negative-energy speed shown.'}
PEDAGOGY={key:'Full original record and actual generated prediction/options/explanation, both numeric assessments, worked substitution, phases, readings, graph, apparatus and any clock reviewed. Assigned manual tasks distinguished from arbitrary instrument output; exact fractions/radicals may be rendered with qualified decimal approximations. Separate reviewer probes are not empirical student calibration or source-authored instructions. No credit from source review flags or cached arithmetic.' for key in SPECS}


def runtime_hashes():return {name:sha((APP/name).read_bytes()) if (APP/name).is_file() else 'MISSING' for name in READ_RUNTIME}


def consumer_evidence():
    file=APP/('editorial/reviews/'+BATCH+'-browser.json');tool=APP/('tests/corpus/browser-'+BATCH+'.mjs')
    if not file.is_file() or not tool.is_file():return {'ok':False,'error':'Current corrected-consumer proof missing'}
    raw=file.read_bytes();data=json.loads(raw);protocol=sha(tool.read_bytes());rows=data.get('cases',[])
    ok=(sha(raw)==READ_BROWSER_PROOF_SHA256 and protocol==READ_BROWSER_PROTOCOL_SHA256 and data.get('protocolSha256')==protocol and data.get('terminalStatus')=='PASS' and not data.get('errors') and data.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256 and data.get('scientificApproval') is False and data.get('humanApproval')=='NOT_RUN' and data.get('publicationAction')=='NONE' and len(rows)==EXPECTED_BROWSER_CASES)
    for key in SPECS:
        defaults=[r for r in rows if r.get('id')==key and 'noWebGL' in r]
        ok=ok and len(defaults)==2 and {r['noWebGL'] for r in defaults}=={False,True}
        boundary=[r for r in rows if r.get('id')==key and 'boundary' in r]
        for x in REQUIRED_BOUNDARIES.get(key,[]):
            states=[r for r in boundary if r.get('input')==x]
            ok=ok and len(states)==2 and any('3D interattivo' in r.get('noWebGLBoundary','') for r in states) and any('Tavola di misura' in r.get('noWebGLBoundary','') for r in states)
    narrow=[r for r in rows if r.get('kind')=='narrow_critical']
    expected=NARROW_EXPECTED
    ok=ok and len(narrow)==len(expected)*2 and {(r.get('id'),r.get('input'),r.get('forcedFallback')) for r in narrow}=={(key,x,mode) for key,x in expected for mode in (False,True)}
    if BATCH.endswith('049'):
        ok=ok and all(r.get('legendEvidence',{}).get('openedByKeyboard') is True and all(word in r['legendEvidence']['visibleText'].lower() for word in ('perno viola','fulcro','gomito')) for r in narrow)
    folder=APP/'editorial/reviews/evidence/c1-corrected-048-049-1a35-20261125';manifest=folder/'manifest.json'
    if not manifest.is_file():ok=False
    else:
        ok=ok and sha(manifest.read_bytes())==READ_EVIDENCE_MANIFEST_SHA256
        m=json.loads(manifest.read_text());ok=ok and m.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256
        for row in m.get('files',[]):
            name=row.get('name','');file=folder/name
            ok=ok and Path(name).name==name and file.is_file() and sha(file.read_bytes())==row.get('sha256')
    layout=current_layout_evidence();ok=ok and layout['ok']
    return {'layoutEvidence':layout,'ok':bool(ok),'proofSha256':sha(raw),'protocolSha256':protocol,'observedCaseCount':len(rows),'runtimeProfileSha256':data.get('runtimeProfileSha256'),'meaning':'Genuine current runtime observation, no historical retag. Technical PASS alone is not independent scientific approval; whole runtime and fresh exact-engine comparisons required per report.'}


def verify(sources):
    if not set(SPECS).issubset(sources):raise ValueError('Missing complete independently read six experiments')
    sourcevalid=all(sources[k].get('kind')=='experiment' and digest(sources[k])==pin for k,pin in READ_SOURCE_SHA256.items())
    physics=independent_checks();hashes=runtime_hashes();consumer=consumer_evidence();actual=None;comparison={};runtime_errors=[]
    try:profile=runtime_fingerprint(APP)['sha256']
    except (ValueError,OSError) as exc:profile='UNAVAILABLE: '+str(exc)
    if not sourcevalid:runtime_errors.append('Unreviewed source; no actual engine executed')
    elif hashes!=READ_RUNTIME or profile!=READ_RUNTIME_PROFILE_SHA256:runtime_errors.append('Actual runtime changed; no cached approval')
    else:
        try:
            actual=runtime_values(sources);comparison=compare_runtime(actual)
            if runtime_hashes()!=hashes or runtime_fingerprint(APP)['sha256']!=profile:runtime_errors.append('Runtime changed during fresh execution; discard evidence')
        except (ValueError,OSError,subprocess.TimeoutExpired,KeyError,TypeError) as exc:runtime_errors.append('Actual consumer check failed: '+str(exc))
    records=[]
    for key in SPECS:
        row=sources[key];errors=list(runtime_errors);checks=list(physics[key]);sourceissues=[];consumerissues=[]
        if row.get('kind')!='experiment' or digest(row)!=READ_SOURCE_SHA256[key]:errors.append('Original source differs from independent full reading')
        if not checks or not all(c['ok'] for c in checks):sourceissues.append('Independent exact mathematics missing or failed');errors.extend(sourceissues)
        if not consumer['ok']:errors.append('Observed current consumer evidence missing, altered or stale')
        summary=comparison.get(key)
        if summary:
            checks.append({'claim':'fresh actual adapter/law/graph/apparatus/clock/generated-task comparison','ok':summary['ok'],'dimension':{},'caseCount':summary['caseCount'],'clockSampleCount':summary['clockSampleCount'],'errors':summary['errors']})
            if not summary['ok']:errors.extend(summary['errors'])
            for i,(echo,x) in enumerate(zip(summary['formatRoundtrip'],SPECS[key][4:6])):
                expected=float(exact_value(key,x));got=echo.get('parsed');ok=type(got) in (int,float) and math.isfinite(got) and abs(got-expected)<=max(.000001,abs(expected)*.005)
                checks.append({'claim':'actual numeric display/input roundtrip'+str(i),'ok':ok,'dimension':{},'actual':echo,'independentExact':str(exact_value(key,x))})
                if not ok:errors.append('New numeric format/grader roundtrip defect')
        elif not runtime_errors:errors.append('Missing fresh actual consumer comparison')
        extra=corrected_scene_checks(actual).get(key,[])
        checks.extend(extra)
        if not extra and key in CORRECTED_TARGETS:errors.append('Missing corrected consumer checks')
        if any(not c['ok'] for c in extra):consumerissues.append('Corrected scene/domain oracle failed');errors.extend(consumerissues)
        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
          'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c.get('dimension',{}) for c in checks},'calculationScope':'EXACT_MANUAL_CALCULATION',
          'sourceScientificReview':{'ok':sourcevalid and not sourceissues,'errors':sourceissues},'consumerReview':{'ok':consumer['ok'] and not runtime_errors and not consumerissues and bool(summary and summary['ok']),'errors':consumerissues},
          'manualArithmetic':MANUAL[key],'manualFeasibility':'PASS_AI_EXACT_ASSIGNED_TASKS' if digest(row)==READ_SOURCE_SHA256[key] and not sourceissues and summary and summary['ok'] and not runtime_errors else 'FAIL_UNVERIFIED_ASSIGNED_TASKS','physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],
          'assetChecksums':{},'figureReview':VISUAL_REVIEW[key],'runtimeSha256':hashes,'reviewedRuntimeSha256':READ_RUNTIME,'runtimeProfileSha256':profile,'reviewedRuntimeProfileSha256':READ_RUNTIME_PROFILE_SHA256,
          'runtimeComparison':summary,'consumerEvidence':consumer,'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':key in CONSUMER_ISSUES,
          'previousConsumerReview':{'runtimeProfileSha256':HISTORICAL_RUNTIME_PROFILE_SHA256,'ok':key not in HISTORICAL_FAILED_IDS,'sourcePhysicsAndAssignedManualTasks':'PASS_AI','reportSha256':HISTORICAL_REPORT_SHA256,'meaning':'Immutable historical consumer judgment, not retagged as current'},'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return records


def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
      'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),
      'historicalFailedConsumerIds':HISTORICAL_FAILED_IDS,'historicalRuntimeProfileSha256':HISTORICAL_RUNTIME_PROFILE_SHA256,'historicalReportSha256':HISTORICAL_REPORT_SHA256,'draftReviewedCount':0,'failedPublishedEditionIds':sorted(CONSUMER_ISSUES),'sourceManualityIssueIds':[],'consumerInterfaceIssueIds':sorted(CONSUMER_ISSUES),
      'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_original_author','originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}



def spring_exposure(x,elements):
    x=sp.Rational(str(x));balls=[e for e in elements if e.get('kind')=='ball' and e.get('c')==0xd49332];arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==0x147979]
    if any(e.get('kind')=='label' for e in elements):return False
    if x==0:return not arrows
    if len(balls)!=1 or len(arrows)!=1:return False
    p=balls[0]['p'];a=arrows[0];direction=-sp.sign(x)
    return all(near(a['a'][i],p[i]+(sp.Rational(3,10)*direction if i==0 else 0)) for i in range(3)) and near(a['b'][0]-a['a'][0],-x/5) and near(a['b'][1],p[1]) and near(a['b'][2],p[2])

def corrected_scene_checks(actual):
    out={k:[] for k in SPECS}
    for case in (actual or {}).get('SIM-C1-L006-02',{}).get('cases',[]):
        x=case['x'];out['SIM-C1-L006-02'].append({'claim':'actual reachable spring full signed vector clears opaque endpoint x_cm='+str(x),'ok':spring_exposure(x,case['elements']),'scope':'independent line-action/clearance oracle; native/fallback image gate separate','dimension':{}})
    case=next((c for c in (actual or {}).get('SIM-C1-L007-02',{}).get('cases',[]) if c['x']==0),None)
    mean=case.get('readings',[None,None,None])[2] if case else None
    out['SIM-C1-L007-02'].append({'claim':'mean over zero duration explicitly undefined and not0W','ok':bool(mean and mean[1]=='Non definita (intervallo nullo)' and mean[2]==''),'actual':mean,'dimension':{},'independentExact':'W(0)/0 undefined; positive-domain right limit0 does not define mean'})
    return out

CORRECTED_TARGETS=['SIM-C1-L006-02', 'SIM-C1-L007-02']
EXPECTED_BROWSER_CASES=68
REQUIRED_BOUNDARIES={'SIM-C1-L006-02': [-4, 0, 1, 6], 'SIM-C1-L007-02': [0, 2, 4]}

HISTORICAL_RUNTIME_PROFILE_SHA256='54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d'
HISTORICAL_FAILED_IDS=['SIM-C1-L006-02', 'SIM-C1-L007-02']
HISTORICAL_REPORT_SHA256='83ab66037510f99a28d6d49c3716d1ac9e439c11f993759ea51da88c70b1bccf'


def mean_reading_ok(readings,t):
    if len(readings)!=3:return False
    label,value,unit=readings[2]
    if label!='Potenza media dall’avvio':return False
    return value=='Non definita (intervallo nullo)' and unit=='' if t==0 else near(value,3*t) and unit=='W'

VISUAL_REVIEW['SIM-C1-L006-02'] += ' Current force glyph is shifted.3sceneunits along the restoring line, retaining delta-.2*x_cm and zero omission. Entire nonzero arrow clears opaque massr.25; actual +/-small extensions and assigned+1cm visible in native/fallback, wide/narrow final pictures. No force magnitude or spring law changed.'

READ_EVIDENCE_MANIFEST_SHA256='13a3c9052508d25164c89db4ebff34295d506208eb6b525d116c358e5db73e92'
NARROW_EXPECTED=[('SIM-C1-L006-02', -0.5), ('SIM-C1-L006-02', 1), ('SIM-C1-L007-02', 0)]


def force_pair_front_clear(elements):
    R=sp.Rational
    rows=[e for e in elements if e.get('kind')=='arrow' and e.get('c') in (0x147979,0xb94f48)]
    # Both forces use one front display line, preserving the translational
    # force comparison and the common gain; head radius .0812 clears face .45.
    return all(all(near(v,w) for v,w in zip(e['a'],[0,R(11,20),R(14,25)])) and near(e['b'][1],R(11,20)) and near(e['b'][2],R(14,25)) for e in rows)

READ_LAYOUT_MANIFEST_SHA256='7004239d984ca479d4cfe36872fa1c922c2d213e982134c1a3d3dfd71f40a9d8'
def current_layout_evidence():
    folder=APP/'editorial/reviews/c1-grouped-visibility-independent-1a35-20261125';file=folder/'manifest.json'
    if not file.is_file():return {'ok':False,'errors':['Current bounded layout review missing']}
    try:
        raw=file.read_bytes();m=json.loads(raw);review=json.loads((folder/'review.json').read_text());projection=json.loads((folder/'label-projection.json').read_text());view=json.loads((folder/'viewport.json').read_text());errors=[]
        if sha(raw)!=READ_LAYOUT_MANIFEST_SHA256 or m.get('runtimeProfileSha256')!=READ_RUNTIME_PROFILE_SHA256:errors.append('Layout epoch differs from independently read evidence')
        for name,pin in m.get('files',{}).items():
            p=(folder/name).resolve()
            if not p.is_relative_to(folder.resolve()) or not p.is_file() or sha(p.read_bytes())!=pin:errors.append('Layout proof asset differs:'+name)
        if (review.get('terminalReview')!='PASS_AI_BOUNDED_LAYOUT' or review.get('runtimeProfileSha256')!=READ_RUNTIME_PROFILE_SHA256 or review.get('browser',{}).get('realCases')!=352 or projection.get('actualNativeCases')!=176 or projection.get('candidates')!=[] or view.get('allCompleteGlyphMeshesInsideViewport') is not True or review.get('scientificApproval') is not False or review.get('humanApproval')!='NOT_RUN' or review.get('publicationAction')!='NONE'):errors.append('Incomplete bounded layout review')
        return {'ok':not errors,'errors':errors,'manifestSha256':sha(raw),'runtimeProfileSha256':READ_RUNTIME_PROFILE_SHA256,'scope':'26 consumers;352 real frames;1245 grid/clock/contact states; default-camera full-glyph and actual label projection; no arbitrary-camera guarantee'}
    except (OSError,ValueError,TypeError) as exc:return {'ok':False,'errors':[str(exc)]}
