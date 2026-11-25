"""Independent original review046: energy, impulse, CM and lever experiments.
No authoring imports, human approval, publication or cached scientific approval.
"""
from fractions import Fraction
from functools import lru_cache
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
BATCH='experiments-energy-momentum-046'
READ_SOURCE_SHA256={'SIM-C1-L008-01': '2b8d6d010928997afc9f7fd8d8c11280c378b19a5d62ba6a00697c899b1c9d12', 'SIM-C1-L008-02': '9c45efcc810be79778c82fbbc3c64b2d0a4a189091f4f544f7c2618b2f2650e6', 'SIM-C1-L008-03': 'd22fc2f2c71f9e014f8416f7093cf82d2e4ef54e2a9cd75451dba35383eb280f', 'SIM-C1-L009-01': 'eccdf47fee4ba0e66fa1b39662cc1fb43a15668928e9afdef5e08533cc54f91e', 'SIM-C1-L009-02': '30b511ec4f02a6306a50fdcf8154e765d0427287ed06d1213ba321fe11d2afb6', 'SIM-C1-L010-01': 'f6b55612be3759babf84f15ac73ec255231ebfaab03289b66c4d86eb4a4edd2f', 'SIM-C1-L010-02': '3cd2f92e596fc283f3701196e6a1dfa830fbedaa3be927f5529d2d1d5ded7a63', 'SIM-C1-L010-03': '87d69e9d1164d74700948dce8e744e4e8613d0fcb28e3667f268ab5847d83634', 'SIM-C1-L010-04': '89d0958e0230b3d1213481b542974af688857d4825eae01cb66e50094ec2fb96', 'SIM-C1-L010-05': 'e8e0c72bb68751a27756cf288ae133a61450c3d7f832271d6aa6870419d9201a'}
READ_RUNTIME={'static/js/banchi/voci/esperimento.js': 'cc435e51b62d5b9961b32f5d9b349171f7432e3bf6a6911cd80daaa1f419767b', 'static/js/banchi/voci/engines.js': '09a6447a971d0e90c49cfea0307e82ea75f4441a7174c017768d6d62ad514dab', 'static/js/banchi/voci/assessment-selection.js': '2f5435b6c9e8b76667d0a95f35860f835117cf8230a635c4c3a54c479fbc54b3', 'static/js/banchi/voci/geometria.js': '986bdbfad0cf6e6e057002ee2efdeff0a08df31bfb45f9c046063fcba5840f08', 'static/js/banchi/voci/tavola.js': 'cc3f7fa8da541109fdda9f8bacca23eea43d1031b2145688b2d80513f47d5283', 'static/js/banchi/voci/confronti.js': 'f853be6383d2b9d45ea80c4dbfce108fc566e1b11b0c44ea6ce0e229686ff86c', 'static/js/banchi/voci/legende.js': '2de769cc9358c907eb30ac6b18c6bc3e06e18a1ece514a7d368ecd40bec33d1b', 'static/js/banchi/voci/orologi.js': '30dd8ab535a31b514c0db13d97d2b046a1add160a7ca7d374deea0d991be73a6', 'static/js/banchi/voci/modelli/C1.js': 'e5818f20fd19d00fc73434fcacef752d06331efc41d198ffe8c185063e97fa34', 'static/js/banchi/voci/apparati/meccanica.js': '7ab903b26e32977736ac011ee88842fcaddb3b6efe0dc11012b3d3470667b9f5', 'static/js/banchi/banco.js': '8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9', 'static/js/banchi/misure.js': '46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27'}
READ_RUNTIME_PROFILE_SHA256='54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d'
READ_BROWSER_PROOF_SHA256='52f889654d1b6afb8497855d7684d1630c0217495c6849ced22734c9cc2b4478'
READ_BROWSER_PROTOCOL_SHA256='dedd53a2a8a593f75c8a8ed8c1cd18c01ae9f74b847307968748b10a3bc21f64'
SPECS={'SIM-C1-L008-01': (1, 5, 0.5, 1, 4, 3, 'J'), 'SIM-C1-L008-02': (0, 10, 1, 2, 10, 5, 'mJ'), 'SIM-C1-L008-03': (0, 5, 0.25, 5, 2, 2.5, 'J'), 'SIM-C1-L009-01': (0, 3, 0.25, 1, 2, 1.5, 'N*s'), 'SIM-C1-L009-02': (-3, 3, 0.5, -2, 3, 0, 'm/s'), 'SIM-C1-L010-01': (0, 3, 0.25, 0, 2, 1.5, 'm'), 'SIM-C1-L010-02': (0, 90, 5, 30, 90, 45, 'cm'), 'SIM-C1-L010-03': (0, 40, 2, 10, 30, 20, 'N*m'), 'SIM-C1-L010-04': (10, 40, 2, 10, 30, 26, 'N'), 'SIM-C1-L010-05': (2, 6, 0.5, 3, 6, 4, 'N')}
SI=pint.UnitRegistry(non_int_type=Fraction)


@lru_cache(maxsize=4096)
def exact_value(key,x):
    x=sp.Rational(str(x))
    return {'SIM-C1-L008-01':lambda:-2*x,'SIM-C1-L008-02':lambda:10*x+x*x/2,'SIM-C1-L008-03':lambda:50-10*x,
      'SIM-C1-L009-01':lambda:4*x,'SIM-C1-L009-02':lambda:x/2,'SIM-C1-L010-01':lambda:1+x,
      'SIM-C1-L010-02':lambda:20*sp.sin(x*sp.pi/180),'SIM-C1-L010-03':lambda:x/10,'SIM-C1-L010-04':lambda:120/x,'SIM-C1-L010-05':lambda:300/x}[key]()


def check(claim,actual,expected,unit='',scope='actual_assigned_manual_calculation'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},'residual':str(residual),'relation':'exact','scope':scope,'ok':residual==0}


def near(actual,want):return type(actual) in (int,float) and math.isfinite(actual) and math.isclose(actual,float(want),rel_tol=1e-10,abs_tol=1e-11)


def runtime_hashes():return {name:sha((APP/name).read_bytes()) if (APP/name).is_file() else 'MISSING' for name in READ_RUNTIME}


def runtime_values(sources):
    code="import{esperienza}from'./static/js/banchi/voci/esperimento.js';import{n}from'./static/js/banchi/misure.js';const sources="+canonical([sources[k] for k in SPECS])+";\n"+r"""
const out={};for(const source of sources){const a=await esperienza(source),c=source.control,cases=[],count=Math.round((c.max-c.min)/c.step)+1;
 for(let i=0;i<count;i++){const x=c.min+i*c.step,p={x},s=a.model.solve(p),clock=a.clock,timeSamples=[];let duration=null;
  if(clock){duration=clock.duration(x,s.y);const times=source.id==='SIM-C1-L009-02'?(x?[0,.25,.49,.5,.75,1.2]:[0]):[0,duration/4,duration/2,duration];
   for(const time of times){const input=clock.input?time:x,q={x:input},z=a.model.solve(q);timeSamples.push({time,input,output:z,signal:clock.signal?clock.signal(x,time,s.y):null,elements:a.elements(x,2,time),readings:a.model.readings(q,z,time)});}}
  cases.push({x,output:s,readings:a.model.readings(p,s,0),elements:a.elements(x,2),graphs:a.model.graphs(p,s),calculation:a.measurement(x).calculation,duration,timeSamples});}
 const x0=source.references[0][0];out[source.id]={cases,params:a.model.params,prediction:a.record.prediction,assessment:a.record.assessment,clock:a.clock?{input:!!a.clock.input,unit:a.clock.clockUnit,pace:a.clock.pace,finalReading:!!a.clock.finalReading,duration:a.clock.duration(x0,a.model.solve({x:x0}).y)}:null,formatRoundtrip:a.record.assessment.map(v=>({display:n(v.value),parsed:Number(n(v.value).replace(',','.'))}))};}
console.log(JSON.stringify(out,(_k,v)=>Number.isNaN(v)?'NaN':v));
"""
    run=subprocess.run(['node','--input-type=module','-'],cwd=APP,input=code,text=True,capture_output=True,timeout=30)
    if run.returncode:raise ValueError('Actual energy/momentum consumer failed:'+run.stderr[:500])
    return json.loads(run.stdout)


def independent_checks():
    R=sp.Rational;Q=SI.Quantity;t,h,L,F,k,m,u,b=sp.symbols('t h L F k m u b',positive=True);theta=sp.Symbol('theta',real=True)
    solved=[(-2,-8,-6),(22,150,R(125,2)),(0,30,25),(4,8,6),(-1,R(3,2),0),(1,3,R(5,2)),(10,20,10*sp.sqrt(2)),(1,3,2),(12,4,R(60,13)),(100,50,75)]
    out={}
    for (key,spec),values in zip(SPECS.items(),solved):out[key]=[check(label,exact_value(key,x),want,spec[-1]) for label,x,want in zip(('first reference','first assigned task','actual generated transfer'),spec[3:6],values)]
    out['SIM-C1-L008-01'] += [check('opposing friction integral',sp.integrate(-2,(L,0,L)),-2*L,'J','independent_path_integral'),check('same-height gravity work zero',Q(10,'N')*Q(0,'m'),0,'J'),check('actual3m friction minus6J',-Q(2,'N')*Q(3,'m'),-6,'J'),check('two-to-one path length doubles dissipated energy',(-2*(2*L))/(-2*L),2),check('zigzag total arc length matches1.55timesinput',4*sp.sqrt((R(155,400))**2+(R(155,400)*sp.sqrt(L**2-1))**2),R(155,100)*L,'m','renderer_metric_probe_L_at_least1')]
    out['SIM-C1-L008-02'] += [check('5cm gravitational50mJ',Q(1,'N')*Q(5,'cm'),50,'mJ'),check('5cm elastic12.5mJ',Q(10,'N/m')*Q(5,'cm')**2/2,R(25,2),'mJ'),check('10cm total150mJ',Q(1,'N')*Q(10,'cm')+Q(10,'N/m')*Q(10,'cm')**2/2,150,'mJ'),check('initial unstrained zero potential reference',((F*h+k*h*h/2).subs(h,0)),0,'J'),check('external quasistatic lift force from potential derivative',sp.diff(F*h+k*h*h/2,h),F+k*h,'N','reviewer_probe_not_assigned_work')]
    out['SIM-C1-L008-03'] += [check('KplusU conserved50',50-10*h+10*h,50,'J'),check('5m initial50J gravitational',Q(1,'kg')*Q(10,'m/s^2')*Q(5,'m'),50,'J'),check('at2.5m descending25J',Q(10,'N')*(Q(5,'m')-Q(R(5,2),'m')),25,'J'),check('zeroheight has50J kinetic',exact_value('SIM-C1-L008-03',0),50,'J')]
    v=sp.Rational(1,2)*t;displacement=t*t/4
    out['SIM-C1-L009-01'] += [check('impulse from force integral',sp.integrate(4,(t,0,t)),4*t,'N*s'),check('Ns equalskgmetrepersecond',Q(1,'N*s'),1,'kg*m/s'),check('8kg timesvelocity equals impulse',8*v,4*t,'kg*m/s'),check('4N acrossdisplacement equals kinetic gain',4*displacement,8*v*v/2,'J','independent_consistency_probe'),check('constantforce Newton accelerationhalf',Q(4,'N')/Q(8,'kg'),R(1,2),'m/s^2')]
    u=sp.Symbol('u',real=True);vf=sp.Symbol('vf',real=True);common=sp.solve(sp.Eq(m*u,2*m*vf),vf)[0]
    out['SIM-C1-L009-02'] += [check('isolated momentum independently solves commonvelocity',common,u/2,'m/s'),check('inelastic kinetic ratio for nonzeroinitialvelocity',sp.cancel((2*m*common**2/2)/(m*u*u/2)),R(1,2),'','domain_initial_velocity_nonzero'),check('dissipated kinetic fractionhalf',sp.cancel((m*u*u/2-2*m*common**2/2)/(m*u*u/2)),R(1,2),'','domain_initial_velocity_nonzero'),check('zero initial means both kineticenergieszero',(m*u*u/2).subs(u,0),0,'J'),check('negative initialminus3 givesminus1.5',-sp.Integer(3)/2,-R(3,2),'m/s')]
    xa=-2+t;xb=2+t;centre=sp.cancel((xa+3*xb)/4)
    out['SIM-C1-L010-01'] += [check('mass weighted centre from actualpositions',centre,1+t,'m'),check('centre velocity1',sp.diff(centre,t),1,'m/s'),check('centre acceleration0',sp.diff(centre,t,2),0,'m/s^2'),check('distance tolightcart3',centre-xa,3,'m'),check('distance toheavycart1',xb-centre,1,'m'),check('total momentum4kgmpersecond',Q(1,'kg')*Q(1,'m/s')+Q(3,'kg')*Q(1,'m/s'),4,'kg*m/s')]
    out['SIM-C1-L010-02'] += [check('rotated rigid separation squarednorm400',sp.trigsimp((20*sp.cos(theta))**2+(20*sp.sin(theta))**2),400,'cm^2'),check('actual45degree exactly10sqrt2',20*sp.sin(sp.pi/4),10*sp.sqrt(2),'cm'),check('manual14.14 squared199.9396',R(1414,100)**2,R(1999396,10000),'cm^2','reviewer_manual_bound'),check('manual14.15 squared200.2225',R(1415,100)**2,R(2002225,10000),'cm^2','reviewer_manual_bound'),check('manual bracket below halfpercent',sp.Integer(int(bool(R(1,100)/R(1414,100)<R(1,200)))),1,'','reviewer_manual_bound')]
    out['SIM-C1-L010-03'] += [check('30cm torque3Nm',Q(10,'N')*Q(30,'cm'),3,'N*m'),check('20cm torque2Nm',Q(10,'N')*Q(20,'cm'),2,'N*m'),check('rightdown signedcross is clockwise',sp.Matrix([b,0,0]).cross(sp.Matrix([0,-10,0]))[2],-10*b,'N*m','source_measures_modulus_not_signed_z'),check('zero arm withnonzero force zero torque',10*sp.Integer(0),0,'N*m')]
    out['SIM-C1-L010-04'] += [check('opposite moments independently solve balance',sp.solve(sp.Eq(F*b,6*20),F)[0],120/b,'N'),check('actual26cm gives60over13',sp.Rational(120,26),R(60,13),'N'),check('load moment is1.2Nm',Q(6,'N')*Q(20,'cm'),R(6,5),'N*m'),check('manual4.615 relativeerror1over12000',sp.cancel((R(60,13)-R(4615,1000))/R(60,13)),R(1,12000),'','reviewer_manual_bound'),check('longdivision remainder5',60000-13*4615,5,'','reviewer_manual_bound')]
    out['SIM-C1-L010-05'] += [check('same side opposing force moments',sp.solve(sp.Eq(F*b,10*30),F)[0],300/b,'N'),check('30cm load moment3Nm',Q(10,'N')*Q(30,'cm'),3,'N*m'),check('actual4cm muscle75N',Q(10,'N')*Q(30,'cm')/Q(4,'cm'),75,'N'),check('2cm smallestarm150N',sp.Rational(300,2),150,'N'),check('joint reaction not ignored in full forcebalance',sp.simplify(F-10-(F-10)),0,'N','reviewer_probe_joint_force_opposes_net_muscle_load')]
    return out


def geometry(key,x,elements,time=None):
    R=sp.Rational;x=R(str(x));P=0x7350b0;G=0x147979;O=0xd49332;M=0x726d81;red=0xb94f48
    def arrow(color,delta,start=None):
        rows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==color]
        if sum(float(z*z) for z in delta)<.015**2:return not rows
        return len(rows)==1 and all(near(rows[0]['b'][j]-rows[0]['a'][j],z) for j,z in enumerate(delta)) and (start is None or all(near(rows[0]['a'][j],z) for j,z in enumerate(start)))
    if key=='SIM-C1-L008-01':
        purple=[e for e in elements if e.get('kind')=='line' and e.get('c')==P];green=[e for e in elements if e.get('kind')=='line' and e.get('c')==G]
        if len(purple)!=1 or len(green)!=1:return False
        points=purple[0]['points'];direct=green[0]['points'];amp=R(155,400)*sp.sqrt(x*x-1)
        expected=[[-R(155,200)+R(155,400)*i,R(28,100),(1 if i%2 else 0)*amp-amp/2] for i in range(5)]
        return len(points)==5 and all(all(near(a,b) for a,b in zip(p,q)) for p,q in zip(points,expected)) and direct==[points[0],points[-1]] and near(sum(math.dist(p,q) for p,q in zip(points,points[1:])),R(155,100)*x)
    if key=='SIM-C1-L008-02':
        balls=[e for e in elements if e.get('kind')=='ball' and e.get('c')==O]
        return len(balls)==1 and near(balls[0]['p'][1],R(8,5)+R(21,200)*x) and not any(e.get('kind')=='arrow' for e in elements)
    if key=='SIM-C1-L008-03':
        balls=[e for e in elements if e.get('kind')=='ball' and e.get('c')==O];y=R(3,10)+R(41,100)*x
        return len(balls)==1 and all(near(a,b) for a,b in zip(balls[0]['p'],[0,y,0])) and arrow(red,[0,-R(21,50),0],[0,y,R(1,4)])
    if key in ('SIM-C1-L009-01','SIM-C1-L009-02','SIM-C1-L010-01'):
        boxes={color:[e for e in elements if e.get('kind')=='box' and e.get('c')==color] for color in (P,G)}
        if key=='SIM-C1-L009-01':return len(boxes[P])==1 and not boxes[G] and near(boxes[P][0]['p'][0],-R(9,5)+x*x/4) and arrow(P,[x/2,0,0])
        if key=='SIM-C1-L010-01':
            balls=[e for e in elements if e.get('kind')=='ball' and e.get('c')==O]
            return len(boxes[P])==len(boxes[G])==len(balls)==1 and near(boxes[P][0]['p'][0],-R(9,10)+R(13,20)*(-2+x)) and near(boxes[G][0]['p'][0],-R(9,10)+R(13,20)*(2+x)) and near(balls[0]['p'][0],-R(9,10)+R(13,20)*(1+x))
        if time is None:a,b,va,vb=-R(3,10),R(3,10),x/4,x/4
        else:
            t=R(str(time));sign=1 if x>=0 else-1;after=sp.Max(0,t-R(1,2));centre=x*after/2;a=R(4,5)*(centre-sign*R(7,10)+x*sp.Min(t-R(1,2),0));b=R(4,5)*centre
            va=R(8,25)*(x if t<R(1,2) else x/2);vb=0 if t<R(1,2) else R(8,25)*x/2
        return len(boxes[P])==len(boxes[G])==1 and near(boxes[P][0]['p'][0],a) and near(boxes[G][0]['p'][0],b) and arrow(P,[va,0,0]) and arrow(G,[vb,0,0])
    rods=[e for e in elements if e.get('kind')=='rod' and e.get('c')==O];dots=[e for e in elements if e.get('kind')=='ball' and e.get('c')==G]
    if len(rods)!=1 or len(dots)!=2:return False
    if key=='SIM-C1-L010-02':
        theta=x*sp.pi/180;left=[-R(2,5)-sp.cos(theta),R(5,4)-sp.sin(theta),0];right=[-R(2,5)+sp.cos(theta),R(5,4)+sp.sin(theta),0]
        return all(near(a,b) for p,q in zip([rods[0]['a'],rods[0]['b']],[left,right]) for a,b in zip(p,q)) and near(math.dist(rods[0]['a'],rods[0]['b']),2) and not any(e.get('kind')=='arrow' for e in elements)
    if key=='SIM-C1-L010-03':left=[-R(2,5)-R(85,100),R(5,4),0];right=[-R(2,5)+x/24,R(5,4),0];forces=[(right,-R(4,5),red)]
    elif key=='SIM-C1-L010-04':left=[-R(2,5)-x/22,R(5,4),0];right=[-R(2,5)+R(10,11),R(5,4),0];forces=[(left,-12/x,red),(right,-R(3,5),red)]
    else:left=[-R(2,5)+R(19,300)*x,R(5,4),0];right=[-R(2,5)+R(19,10),R(5,4),0];forces=[(left,R(10,3)/x,G),(right,-R(1,9),red)]
    if not all(all(near(a,b) for a,b in zip(dot['p'],position)) for dot,position in zip(dots,[left,right])):return False
    all_arrows=[e for e in elements if e.get('kind')=='arrow']
    if len(all_arrows)!=len(forces):return False
    return all(e.get('c')==color and all(near(a,b) for a,b in zip(e['a'],origin)) and all(near(e['b'][j]-e['a'][j],delta if j==1 else 0) for j in range(3)) for e,(origin,delta,color) in zip(all_arrows,forces))


def compare_runtime(actual):
    out={};units={'N*s':'N·s','N*m':'N·m'}
    for key,(lo,hi,step,x0,x1,transfer,unit) in SPECS.items():
        item=actual.get(key,{});cases=item.get('cases',[]);errors=[];count=round((hi-lo)/step)+1;clock=item.get('clock');observations=0
        elapsed=key in ('SIM-C1-L009-01','SIM-C1-L010-01');collision=key=='SIM-C1-L009-02'
        wantedclock={'input':elapsed,'unit':'s','pace':1,'finalReading':collision,'duration':1.2 if collision else 3} if elapsed or collision else None
        if clock!=wantedclock:errors.append('Actual clock/final-reading semantics differ')
        if len(cases)!=count:errors.append('Incomplete reachable control grid')
        params=item.get('params',[])
        if len(params)!=1 or any(params[0].get(f)!=v for f,v in (('key','x'),('min',lo),('max',hi),('step',step),('value',x0))):errors.append('Actual control/default differs')
        for i,c in enumerate(cases):
            x=sp.Rational(str(lo))+i*sp.Rational(str(step))
            if not near(c.get('x'),x) or not near(c.get('output',{}).get('y'),exact_value(key,x)):errors.append('Scalar model differs from independent law')
            if not geometry(key,x,c.get('elements',[])):errors.append('Actual apparatus differs from independent geometry')
            readings=c.get('readings',[])
            if key=='SIM-C1-L008-01' and (len(readings)!=3 or readings[2][1]!=0 or readings[2][2]!='J'):errors.append('Same-height gravity work readout differs')
            if key=='SIM-C1-L008-02' and (len(readings)!=3 or not near(readings[2][1],x*x/2) or readings[2][2]!='mJ'):errors.append('Separate elastic contribution differs')
            if key=='SIM-C1-L008-03' and (len(readings)!=3 or not near(readings[2][1],10*x) or not near(readings[1][1]+readings[2][1],50)):errors.append('Conserved-energy readout differs')
            if collision and (len(readings)!=4 or readings[2][1]!=('Entrambe nulle' if x==0 else .5) or '(a fine prova)' not in readings[1][0]):errors.append('Collision final-velocity/zero-KE-ratio qualification differs')
            graphs=c.get('graphs',[]);ngraphs=2 if collision and x!=0 else 1
            if len(graphs)!=ngraphs:errors.append('Graph/time-signal completeness differs')
            else:
                points=graphs[0]['series'][0]['points']
                if len(points)!=101 or any(not near(y,exact_value(key,z)) for z,y in points):errors.append('Control graph differs')
                if ngraphs==2:
                    points=graphs[1]['series'][0]['points'];sign=1 if x>=0 else-1
                    if len(points)!=161:errors.append('Collision position-time graph incomplete')
                    for t,y in points:
                        t=sp.Rational(str(t));want=x*sp.Max(0,t-sp.Rational(1,2))/2-sign*sp.Rational(7,10)+x*sp.Min(t-sp.Rational(1,2),0)
                        if not near(y,want):errors.append('Collision current-A-position graph differs');break
            samples=c.get('timeSamples',[]);times=([0,.25,.49,.5,.75,1.2] if x else[0]) if collision else[0,.75,1.5,3] if elapsed else[]
            if len(samples)!=len(times):errors.append('Complete planned timeline missing')
            for sample,time in zip(samples,times):
                observations+=1;control=time if elapsed else x
                if not near(sample['time'],time) or not near(sample['input'],control) or not near(sample['output']['y'],exact_value(key,control)) or not geometry(key,control,sample['elements'],time=time if collision else None):errors.append('Actual elapsed/collision frame synchronization differs')
                if collision:
                    sign=1 if x>=0 else-1;t=sp.Rational(str(time));want=x*sp.Max(0,t-sp.Rational(1,2))/2-sign*sp.Rational(7,10)+x*sp.Min(t-sp.Rational(1,2),0)
                    if not near(sample.get('signal'),want) or not near(sample['readings'][3][1],want):errors.append('Current-A-position instrument differs')
        tasks=item.get('assessment',[])
        if len(tasks)!=2 or any(not near(a.get('value'),exact_value(key,x)) or a.get('unit')!=units.get(unit,unit) for a,x in zip(tasks,(x1,transfer))):errors.append('Actual generated assignment/value/unit differs')
        prediction=0 if key in ('SIM-C1-L008-01','SIM-C1-L010-04','SIM-C1-L010-05') else 2
        if item.get('prediction',{}).get('correct')!=prediction:errors.append('Prediction differs from independently solved reference comparison')
        out[key]={'ok':not errors,'caseCount':len(cases),'plannedCaseCount':count,'clockSampleCount':observations,'errors':errors,'firstAssessmentInput':x1,'transferInput':transfer,'formatRoundtrip':item.get('formatRoundtrip',[])}
    return out

CONSUMER_ISSUES={
'SIM-C1-L010-02':'P3 native3D at actually assessed90deg: lower marked endpoint at y0.25 and the lower half of the rod are hidden inside the opaque support. Endpoint sphere r0.11 is contained by support r0.13 on y0.08..1.25. Only upper half/one marked end is visible while the task asks full20cm vertical separation. Scalar rigid-body relation and manual tasks correct; fallback overpaints the lower marker.',
'SIM-C1-L010-03':'P3 native3D at reachable zero arm: constant10N force remains nonzero but its whole downward force arrow is inside the opaque pivot support. Arrow length0.8 lies on support axis y1.25..0.45, inside support y0.08..1.25/r0.13; shaft/head radii0.028/0.0812 fit. Moment0 is correctly caused by zero lever arm, not vanishing force; the visual loses that distinction.',
'SIM-C1-L010-05':'P3 native3D load10N direction is not recognizably visible in the default and both actually assigned4/6cm views. Red arrow length1/9 starts at centre of opaque hand marker r0.11, with shaft-minus-nominal-radius only1/900; actual polygonal mesh/projection determines the exposed cap and nearly all is masked. This is observed default-projection visibility, NOT a claim of total3D containment. Muscle arrow is visible. Fallback overpaints the red glyph. Scalar torque balance/manual answers correct.'}


def consumer_scene_checks(actual):
    result={key:[] for key in CONSUMER_ISSUES}
    def case(key,x):return next((r for r in (actual or {}).get(key,{}).get('cases',[]) if near(r.get('x'),x)),None)
    def support(elements):return next((e for e in elements if e.get('kind')=='rod' and near(e.get('r'),sp.Rational(13,100)) and e.get('c')==0x726d81),None)
    c=case('SIM-C1-L010-02',90);elements=c.get('elements',[]) if c else[];post=support(elements);dots=[e for e in elements if e.get('kind')=='ball' and e.get('c')==0x147979];contained=False;details={}
    if post and len(dots)==2:
        ball=min(dots,key=lambda r:r['p'][1]);radial=math.hypot(ball['p'][0]-post['a'][0],ball['p'][2]-post['a'][2]);ys=sorted((post['a'][1],post['b'][1]));contained=(radial+ball['r']<post['r'] and ys[0]<ball['p'][1]-ball['r'] and ball['p'][1]+ball['r']<ys[1] and post.get('alpha')==ball.get('alpha')==1)
        details={'support':post,'hiddenEndpoint':ball,'radialOffset':radial}
    result['SIM-C1-L010-02'].append({'claim':'both rigid-rod marked ends visible at assessed90deg','ok':False,'observedEndpointFullyInsideOpaquePost':bool(contained),'actualGeometry':details,'dimension':{},'scope':'analytic containment plus actual native screenshot; not a failure of the20sin(theta) law'})
    c=case('SIM-C1-L010-03',0);elements=c.get('elements',[]) if c else[];post=support(elements);arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==0xb94f48];contained=False;details={}
    if post and len(arrows)==1:
        arrow=arrows[0];ys=sorted((post['a'][1],post['b'][1]));axis=all(near(arrow[p][j],post['a'][j]) for p in ('a','b') for j in (0,2));contained=(axis and min(arrow['a'][1],arrow['b'][1])>=ys[0] and max(arrow['a'][1],arrow['b'][1])<=ys[1] and post['r']>.0812 and post.get('alpha')==1)
        details={'support':post,'hiddenNonzeroForceArrow':arrow,'maximumArrowRadius':.0812}
    result['SIM-C1-L010-03'].append({'claim':'constant10N force remains visible at zero moment arm','ok':False,'observedArrowFullyInsideOpaquePost':bool(contained),'actualGeometry':details,'dimension':{},'scope':'nonzero force must be distinguished from zero torque; analytic containment and native screenshot'})
    for x in (3,4,6):
        c=case('SIM-C1-L010-05',x);elements=c.get('elements',[]) if c else[];arrows=[e for e in elements if e.get('kind')=='arrow' and e.get('c')==0xb94f48];details={}
        if len(arrows)==1:
            a=arrows[0];ball=next((e for e in elements if e.get('kind')=='ball' and all(near(z,w) for z,w in zip(e['p'],a['a']))),None)
            details={'arrow':a,'marker':ball,'shaftLength':math.dist(a['a'],a['b']),'shaftMinusNominalSphereRadius':'1/9-11/100=1/900 scene unit; not a bound on exposed polygonal mesh, and not total containment'}
        result['SIM-C1-L010-05'].append({'claim':'load10N direction recognizable in native3D at musclearm_cm='+str(x),'ok':False,'observationMode':'independent AI reading of native default/assigned screenshots, corroborated by near-marker-sized geometry; no pixel classifier or all-camera containment claim','actualGeometry':details,'dimension':{},'scope':'view-dependent consumer failure, scalar moment balance remains correct'})
    return result

MANUAL={'SIM-C1-L008-01': 'Horizontal-path line integral of constant opposing2N friction is-2*length J; gravity work only depends on equal endpoint height and is0. Piecewise planar zigzag has true physical length when segment sqrt(dx²+dz²) is summed, to be compared with controller, not assumed schematic. Generated tasks4m=>-8J and3m=>-6J.', 'SIM-C1-L008-02': 'Assigned weight1N and springk10N/m; h=x_cm/100m. Gravitational increase .01xJ=10x mJ; spring increase .5*10*(x/100)²J=.5x²mJ. Total10x+.5x²;10cm150mJ and generated5cm125/2mJ. External lifting agent implied, not free equilibrium of the unloaded vertical spring.', 'SIM-C1-L008-03': 'Conserved mechanical energy from rest at h0=5m,m1kg,g10 is50J. U10h and K50-10h on0<=h<=5. Tasks2m=>30J, generated2.5m=>25J. Static height comparison, not a prescribed-time trajectory.', 'SIM-C1-L009-01': 'Impulse4N*t changes momentum from0. Mass8kg has a1/2 m/s², v=t/2, displacementt²/4. Tasks2s8Ns, generated1.5s6Ns. Ns=kgm/s. Actual elapsed clock must synchronize scalar, speed arrow and position.', 'SIM-C1-L009-02': 'Equal masses, isolated perfectly inelastic collinear collision: m*u+0=2m*v=>v=u/2. Kf/Ki1/2 only u!=0; u0 both K0 and no collision, source explicitly distinguishes. Generated transfer0 gives unchanged0 velocities; source first tasku3=>1.5m/s. Before/after event at0.5s must be checked with signed approach side, current velocities and final-labeled instrument; no ratio0/0.', 'SIM-C1-L010-01': 'mA1kg,mB3kg,xA=-2+t,xB=2+t; xCM=(xA+3xB)/4=1+t, velocity1, zero acceleration. Centre is3m fromA/1m fromB. Tasks2s=>3m, generated1.5s=>2.5m. Renderer off=-.9 andscale.65 keep both carts on rail through3s; do not falsely infer raw position exceeds rail before applying actual mapping.', 'SIM-C1-L010-02': 'Rigid endpoint separation20cm decomposes20cos(theta),20sin(theta), squared norm400cm². First task90=>20cm; algorithm transfer45, not50, yields10sqrt2cm. Manual14.14²199.9396<200<200.2225=14.15² gives sub0.5percent numeric14.14. Arbitrary slider angles are observations, not all assigned inverse-trig work.', 'SIM-C1-L010-03': 'Moment magnitude10N*(b_cm/100)=b/10 Nm; signed CCW-positive torque would be negative for right-down force, but source explicitly measures modulus. Tasks30cm3Nm, generated20cm2Nm. Pivot reaction haszero moment and actual perpendicular distance, not total rod length, is used.', 'SIM-C1-L010-04': 'Equilibrium about pivot:6N*20cm=F*b_cm; F120/b N. Positive arm10..40cm. Source30cm4N, generated26cm60/13N. Long division60000=13*4615+5 gives4.615N; relative error1/12000<0.005. Opposite sides/downward forces have opposite moments; fulcrum reaction provides translation balance and is not another pivot torque.', 'SIM-C1-L010-05': 'Same-side muscle-up andhand-weight-down have opposite moments: T*b=10N*30cm, soT300/b_cm. Arms2..6cm imply T150..50N. First task6cm50N, generated4cm75N. Uses perpendicular musclearm; neglects forearm weight explicitly. Joint reaction notzero and no physiological calibration/patient recommendation inferred. Manual torque balance remains correct; load visibility is a separate observed consumer failure.'}
ASSUMPTIONS={'SIM-C1-L008-01': 'Horizontal planar piecewise-smooth paths, same endpoints within each comparison and equal height. Constant kinetic friction2N always opposes tangential motion; no other dissipative work inferred. Path control1..5m, direct path1m. Gravity conservative with zero height change; corners are ideal geometric constraints, not an assigned acceleration history.', 'SIM-C1-L008-02': 'Assigned weight1N, ideal springk10N/m initially unstrained below body, common positive vertical rise/extension0..10cm. Potential reference at that initial quota/unstrained spring. Externally imposed lifting, not spontaneous equilibrium of an unsupported weight at the unloaded position. No mass/g value or actual material yield calibration invented.', 'SIM-C1-L008-03': 'Mass1kg,g10m/s², from rest at5m, no friction; mechanical energy50J. Quota0..5m, potential reference at zero quota, not an asserted physical tabletop height. Static comparison of energies at selected positions, no clock or post-impact rebound model.', 'SIM-C1-L009-01': 'Mass8kg from rest under constant net4N along one straight axis; duration0..3s, a0.5m/s². Impulse equals signed momentum change; zero duration0impulse. This is an elapsed-time experiment, not independent repeated-parameter animation.', 'SIM-C1-L009-02': 'Equal masses, initially B at rest, perfectly inelastic collinear contact at0.5s with negligible external impulse. Initial u-3..3m/s sets approach side; scalar readout is explicitly final, while position signal/arrows are current. At u0 both energieszero, no collision and no numerical kinetic ratio0/0. Sourceversion2 explicitly describes this degenerate branch.', 'SIM-C1-L010-01': 'Point centres for masses1/3kg, both +1m/s from positions-2/+2m, zero net external horizontal force, elapsedtime0..3s. Centre weighted by mass, not visual cart volume or arithmetic midpoint. Actual off=-0.9/scale0.65 keep cart centres/wheels on the rail over the whole domain.', 'SIM-C1-L010-02': 'Ideal rigid20cm endpoint separation, angle0..90deg in a fixed vertical plane, static configuration comparison with no angular-speed claim. Measurement is endpoint vertical difference, not half-rod from fulcrum. Native occlusion of the lower marker at90deg is separate from correct geometry and manualsin45.', 'SIM-C1-L010-03': 'Constant downward10N at a perpendicular right-side arm0..40cm. Source explicitly reports torque magnitude; signedz with CCW-positive would be negative. A pivot reaction has zero moment about pivot. At zero arm force remains nonzero though torquezero; native support hides that force arrow.', 'SIM-C1-L010-04': 'Ideal weightless lever, opposed-side downward forces6N at20cm versus positive balancing force at10..40cm. Pivot supplies translational reaction; no reaction torque. Equation is rotational balance, not a claim that the two downward forces cancel vectorially. Positive nonzero arm makes inverse identifiable.', 'SIM-C1-L010-05': 'Ideal static forearm lever; muscle and10N hand load on same side with opposite vertical forces. Perpendicular musclearm2..6cm, loadarm30cm; forearm weight neglected explicitly. Joint reaction generally nonzero. This is a toy mechanics calculation, not a patient/muscle calibration or biological force safety estimate.'}
VISUAL_REVIEW={'SIM-C1-L008-01': 'Four zigzag segments have dx1.55/4, alternating dz=(1.55/4)sqrt(L²-1), so sum of lengths1.55L with common1.55scene/m scale; direct endpoints span1.55. At L1 paths coincide correctly. Their common vertical level ensures zero weight work. Endpoint z translation between separate trials is not falsely called a change of relative endpoints.', 'SIM-C1-L008-02': 'Vertical spring length1.5+0.105*x_cm, mass centre1.6+0.105*x. Height increase and spring extension have common metric, no force arrow falsely showing free equilibrium. Energy contributions independently checked in mJ, and zero reference is assigned, not inferred from desktop pixels.', 'SIM-C1-L008-03': 'Quota maps linearly to sphere centre0.3+0.41h, red weight constant, no inappropriate20N label from the different tension caller. K and U readings sum50. Figure is an energy-at-height comparison; no elapsed-motion trajectory or quantitative force-arrow scale inferred.', 'SIM-C1-L009-01': 'One purple cart centre-1.8+t²/4, velocity-arrowdelta t/2, elapsedinput0..3s. Geometry, scalar4t impulse, clock and readings share the actual elapsed instant. Cart shape is illustrative, not an inferred8kg-from-volume calibration.', 'SIM-C1-L009-02': 'Native/fallback before/after contact in both signs read. Motion uses physical A=centreB-sign0.7+u*min(t-0.5,0), B=centreB=u*max(t-0.5,0)/2; scene positions gain0.8. At contact separation0.56 matches two cart half-widths0.28, rather than an unexplained gap/overlap. Velocity arrows correctly change from u/0 to u/2,u/2; time plot/current-A readout agree. Base no-time pose is separately checked and is not mistaken for the animated frame.', 'SIM-C1-L010-01': 'World x=-0.9+0.65*physicalx; centre marker uses the same mapping. At t3 heavycart centre2.35 with outerbody2.63<rail2.65, and lightcart start-2.2 also fits. Centre stays between carts and three times closer to heavy in physical distance. Body height styling is not a claimed density/volume measurement.', 'SIM-C1-L010-02': 'Rod endpoints pivot+/-unit direction have invariant2sceneunits representing20cm; actual90deg difference2scene. In native3D the lower endpoint r0.11 at y0.25 is fully inside support r0.13 on0.08..1.25, so lower half is lost visually at the assessed90deg. Fallback paints the marker over the support; this is a consumer FAIL, not wrong20sin(theta).', 'SIM-C1-L010-03': 'Right force arm worldx=b_cm/24, force delta-0.8 for10N; left reference extension is not the arm. At b0 the entire red force arrow lies inside the post, although the actual10N remains. Source explicitly distinguishes torque modulus and clockwise sense. Native zero-arm visibility remains FAIL.', 'SIM-C1-L010-04': 'Left arm b_cm/22/right20/22, downward arrows F/10 and6/10 use common scale. Their moments match; net downward forces are balanced by pivot reaction, not by one another. Both native and fallback show two forces and separate application sides.', 'SIM-C1-L010-05': 'Rod same-side handarm1.9 represents30cm, musclearm1.9*b/30. Muscle up T/90 and load down10/90 have common scale and correct moments. Default and assigned4/6cm native photos do not reveal the red load direction recognizably; nominal shaft-minus-marker radius1/900 is only a size comparison, not total containment or an exposed-mesh bound. Fallback overpaints a red glyph. Consumer visibility FAIL is separate from correct torque balance.'}
PEDAGOGY={key:"All source fields and actual generated predictions, two assessments, worked substitutions, stage guides, readouts, graphs, apparatus and clocks read. Explicit actual transfer values/manual procedures, domain/zero/sign cases and physical hypotheses reviewed; independent numeric/unit/renderer probes are not source-authored instructions, student calibration or human approval." for key in SPECS}


def verify(sources):
    if not set(SPECS).issubset(sources):raise ValueError('Missing complete independently read ten experiments')
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
        if key in CONSUMER_ISSUES:
            consumerissues.append(CONSUMER_ISSUES[key]);errors.extend(consumerissues)
            checks.extend(consumer_scene_checks(actual).get(key,[]))
        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
          'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c.get('dimension',{}) for c in checks},'calculationScope':'EXACT_MANUAL_CALCULATION',
          'sourceScientificReview':{'ok':sourcevalid and not sourceissues,'errors':sourceissues},'consumerReview':{'ok':consumer['ok'] and not runtime_errors and not consumerissues and bool(summary and summary['ok']),'errors':consumerissues},
          'manualArithmetic':MANUAL[key],'manualFeasibility':'PASS_AI_EXACT_ASSIGNED_TASKS' if digest(row)==READ_SOURCE_SHA256[key] and not sourceissues and summary and summary['ok'] and not runtime_errors else 'FAIL_UNVERIFIED_ASSIGNED_TASKS','physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],
          'assetChecksums':{},'figureReview':VISUAL_REVIEW[key],'runtimeSha256':hashes,'reviewedRuntimeSha256':READ_RUNTIME,'runtimeProfileSha256':profile,'reviewedRuntimeProfileSha256':READ_RUNTIME_PROFILE_SHA256,
          'runtimeComparison':summary,'consumerEvidence':consumer,'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':key in CONSUMER_ISSUES,
          'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return records


def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
      'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),
      'draftReviewedCount':0,'failedPublishedEditionIds':sorted(CONSUMER_ISSUES),'sourceManualityIssueIds':[],'consumerInterfaceIssueIds':sorted(CONSUMER_ISSUES),
      'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_original_author','originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}

READ_EVIDENCE_MANIFEST_SHA256='ba5ccfbe0e140c7f1e5e96b291da7d8c20db086db6a1c715bfa82ba0f7e68500'


def consumer_evidence():
    proof=APP/'editorial/reviews/experiments-energy-momentum-046-browser-originals.json';tool=APP/'tests/corpus/browser-experiments-energy-momentum-046.mjs'
    folder=APP/'editorial/reviews/evidence/energy-momentum-046-negative-20261125';manifest=folder/'manifest.json'
    if not all(p.is_file() for p in (proof,tool,manifest)):return {'ok':False,'error':'Current observation proof/protocol/critical evidence missing'}
    raw=proof.read_bytes();protocol=sha(tool.read_bytes());data=json.loads(raw);observations=data.get('cases',[])
    ok=(sha(raw)==READ_BROWSER_PROOF_SHA256 and protocol==READ_BROWSER_PROTOCOL_SHA256 and data.get('protocolSha256')==protocol
        and data.get('terminalStatus')=='PASS' and not data.get('errors') and data.get('scientificApproval') is False
        and data.get('reviewScope')=='ORIGINAL_046_OBSERVATION_ONLY_NO_SCIENTIFIC_APPROVAL'
        and data.get('humanApproval')=='NOT_RUN' and data.get('publicationAction')=='NONE'
        and data.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256 and len(observations)==57)
    for key in SPECS:
        rows=[r for r in observations if r.get('id')==key and 'noWebGL' in r]
        ok=ok and len(rows)==2 and {r['noWebGL'] for r in rows}=={False,True}
        ok=ok and all('Tavola di misura' in r.get('display','') if r['noWebGL'] else '3D interattivo' in r.get('display','') for r in rows)
    frames=[r for r in observations if r.get('kind')=='collision_clock'];expected={(u,t) for u in (-3,3) for t in (0,.49,.5,1.2)}
    ok=ok and len(frames)==8 and {(r.get('initialVelocity'),r.get('time')) for r in frames}==expected
    required={('SIM-C1-L010-02',90),('SIM-C1-L010-03',0),('SIM-C1-L010-05',4),('SIM-C1-L010-05',6)}
    ok=ok and required.issubset({(r.get('id'),r.get('input')) for r in observations})
    m=json.loads(manifest.read_text());ok=ok and sha(manifest.read_bytes())==READ_EVIDENCE_MANIFEST_SHA256 and m.get('proof',{}).get('sha256')==READ_BROWSER_PROOF_SHA256
    for entry in m.get('files',[]):
        name=entry.get('name','');file=folder/name
        ok=ok and Path(name).name==name and file.is_file() and sha(file.read_bytes())==entry.get('sha256')
    return {'ok':bool(ok),'proofSha256':sha(raw),'protocolSha256':protocol,'criticalEvidenceManifestSha256':sha(manifest.read_bytes()),'observedCaseCount':len(observations),'runtimeProfileSha256':data.get('runtimeProfileSha256'),
      'meaning':'Observation instrument PASS is not scientific approval: numeric/controller/clock states completed, while independent native-image reading and geometric counterexamples retain three consumer FAILs. Original source physics/manual tasks separately valid. Reproducible script plus current full profile, fresh engine oracle per report, critical actual PNGs preserved with exact input limitations.'}
