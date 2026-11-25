"""Independent source+actual consumer review LAB3D06..10, not the classic labs.

Full source/parameter/model/scene/guide/assessment paths read. Every fresh report
reexecutes canonical JS against independent exact/analytic oracles and rejects
changed runtime bytes. No authoring imports, source-key oracle or human approval.
"""
from fractions import Fraction
from pathlib import Path
import itertools
import json
import math
import subprocess
import pint
import sympy as sp
from .pipeline import digest,sha,canonical
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/banchi.json'
SOURCE_FILE_SHA256='c0494a9091cca33b7631b68df1cb7b472c63d0e5481e7dbd391ae1b46e326bdf'
BATCH='bench-fields-optics-036'
READ_SOURCE_SHA256={'LAB3D-06': 'f547e3cd9935fc4a5c41e24b211dd5348e89208e90402af8e37564b382623b32', 'LAB3D-07': '78c9bf6522ed8b0b7ea6cd801e0c2311db0d3297a764bd2a3cb5ecaeb73e30fc', 'LAB3D-08': 'b161439ca8573937e25bdbf37d1dc8eac00fba1643dd49c6448d8c5900299ec2', 'LAB3D-09': 'b9cc100c57cd49cafef91871663cc424a64e0c9d290e0eecc47be6a0d37d204e', 'LAB3D-10': '04b00398505e2ffac6cca0c83dff5ef45286e1a518578dbc3ad7a488102330c0'}
READ_RUNTIME={'static/js/banchi/modelli/calore.js': '83c89a3140ba5a3386eff0cff54a1aa2575c26ea1e973779b19303026c13bc23', 'static/js/banchi/modelli/campo.js': '3750efefa281d28712a973bea921544fb83dc5ad9eb2da7e0c09fe6fac6d50c3', 'static/js/banchi/modelli/circuito.js': '107b9e8defed3aaa6d04883442951ed20b7b2cdfdefb658f3ef746c24185a757', 'static/js/banchi/modelli/lente.js': '5488291f98987538c4fc8483a61e2c058e45605c66391a7ccbdd2b9fb8787566', 'static/js/banchi/modelli/onde.js': '3fb789376d62279c115c5facf666c10c39160068210585a5755ee86daa2dbb7c', 'static/js/banchi/scene/calore.js': '80272a42fbf7edd5a130df801c3819482aaca55471ed992e5fb411085f897f4e', 'static/js/banchi/scene/campo.js': 'cd1728f04b9bb954c15bd555eec5c0958d96bf166f498d68d2fcb1ee051f18c4', 'static/js/banchi/scene/circuito.js': '049ed16c1cc2bd6d2c2662c4de38399d3b1bb00a5adabeb17bed06780df49701', 'static/js/banchi/scene/lente.js': '8a238ff78b82cdd796b796691e147128c00a5a0f9d089d2398896c92a4c104b5', 'static/js/banchi/scene/onde.js': '082076476beef18b03506417958bbec7f5d1e75c9278f8824cfde68cdf0ed139', 'static/js/banchi/misure.js': '46c769f22651529e439b1396e59a017d2c429310b7ae59e2a9717b2ced93c66d', 'static/js/banchi/banco.js': '8200aa5adf026372699790c21f60e0cf3f5fffcb705ef5ee36f609ac3c1e3ed9', 'static/js/banchi/quaderno.js': 'ecc32226e0fa1781b36cac952fa926a2ac17be6b4eae491ef6ef5744fcd8885a', 'static/js/banchi/tavola.js': '9082781b0fbf88f421742cf8f10f3f098f51e9aac131118a5691e1b6e11cc4a8', 'static/js/banchi/grafici.js': 'e5567e88ee6df5c604f8e62228da5e70841556ad0b55fb212fd4d091fdeee3fd', 'static/js/banchi/scena.js': '4d94c92a834573062a2af541df113bad06bd11ca538b31bddddc5ec8621a5095', 'static/js/banchi/etichette.js': '455ae33c790be4e207e5b5667918c44ea16c95f49e1fea0b13cc92f08aa003f3', 'static/js/banchi/aula.js': '44c74446d0d60b20e9dad05b32321f1000f026acdec386ca5aa2f74c20421967', 'static/js/models.js': '525733758bad90ae00913d497d0916ff683168370fc9a1e320dd16e0c7a9faa6', 'static/lab-models.json': '2e4397ef2dc7e63ad2a75eae804228221ca74506d43f1cc73ef2de78ed1b6b27'}
READ_RUNTIME_PROFILE_SHA256='54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d'
READ_BROWSER_PROOF_SHA256='76fa6a50cb5e2861820ebe7b68f06fa52018f5e924fb1ed08905eb7747f40009'
READ_BROWSER_PROTOCOL_SHA256='7c8bcc7e741cb7870cc1e604be786d3d738197d599edc6baca01ba4984ff0f08'
MODEL_BY_ID={'LAB3D-06':'calore','LAB3D-07':'campo','LAB3D-08':'circuito','LAB3D-09':'lente','LAB3D-10':'onde'}
SI=pint.UnitRegistry(non_int_type=Fraction)
DEFAULTS={
'calore':{'left':80,'right':20,'L':10,'A':16,'k':2},
'campo':{'q1':2,'q2':2,'sx':0,'sy':0,'sz':0,'ax':-1,'ay':0,'az':0,'bx':1,'by':0,'bz':0},
'circuito':{'mode':'Parallelo','U':6,'R1':6,'R2':3},
'lente':{'p':30,'f':12,'screen':20},
'onde':{'f':1,'d':.8,'phase':0,'x':.25,'z':.5}}
EXPECTED_PREDICTIONS={'LAB3D-06':1,'LAB3D-07':1,'LAB3D-08':2,'LAB3D-09':1,'LAB3D-10':2}
ASSESSMENT_ORACLES={'LAB3D-06':[(40,'W'),(sp.Rational(1,2),'m')],
'LAB3D-07':[(9,'N/C'),(18,'N/C')], 'LAB3D-08':[(2,'A'),(3,'A')],
'LAB3D-09':[(15,'cm'),(-10,'cm')], 'LAB3D-10':[(4,'mm'),(0,'mm')]}


def check(claim,actual,expected,unit='',scope='independent_analytic_model'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    residual=sp.Integer(0) if actual==expected else sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
            'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    F=sp.Rational;Q=SI.Quantity
    actual='actual_source_assigned_manual_calculation'
    x,L,k,A,Ta,Tb=sp.symbols('x L k A Ta Tb',positive=True)
    c0,c1=sp.symbols('c0 c1');sol=sp.solve([sp.Eq(c0,Ta),sp.Eq(c0+c1*L,Tb)],(c0,c1))
    temp=(c0+c1*x).subs(sol);heatflow=-k*A*sp.diff(temp,x)
    vx,vy,vz=sp.symbols('x y z',real=True);charge,constant=sp.symbols('q K',real=True)
    radius=sp.sqrt(vx**2+vy**2+vz**2);potential=constant*charge/radius
    current,V1,V2=sp.symbols('I V1 V2');serie=sp.solve([sp.Eq(V1,2*current),sp.Eq(V2,4*current),sp.Eq(V1+V2,12)],(current,V1,V2))
    f,p,q=sp.symbols('f p q',positive=True);image=sp.solve(sp.Eq(1/f,1/p+1/q),q)[0]
    t,a,b,w=sp.symbols('t a b w',real=True);amp=F(1,500)
    C=sp.cos(a)+sp.cos(b);S=sp.sin(a)+sp.sin(b)
    return {
'LAB3D-06':[
 check('stationary sourcefree Fourier temperaturelinear',sp.diff(temp,x,2),0,'K/m^2'),
 check('boundaryleft correct',temp.subs(x,0),Ta,'K'),check('boundaryright correct',temp.subs(x,L),Tb,'K'),
 check('Fourier signed rightward power',sp.simplify(heatflow),k*A*(Ta-Tb)/L,'W'),
 check('doublelength halves nonzeroflow',sp.simplify(heatflow.subs(L,2*L)/heatflow),F(1,2)),
 check('actualassessment1 power40watt',Q(2,'W/(m*K)')*Q(1,'m^2')*Q(10,'K')/Q(F(1,2),'m'),40,'W',actual),
 check('actualassessment2 inversehalfmetre',Q(F(1,2),'W/(m*K)')*Q(2,'m^2')*Q(10,'K')/Q(20,'W'),F(1,2),'m',actual),
 check('default centimetre squared conversion',Q(16,'cm^2'),F(1,625),'m^2'),
 check('default gradient minus600Kpermetre',Q(-60,'K')/Q(10,'cm'),-600,'K/m'),
 check('default rightward power48over25watt',Q(2,'W/(m*K)')*Q(60,'K')*Q(16,'cm^2')/Q(10,'cm'),F(48,25),'W'),
 check('zero temperaturedifference giveszero foranyL',heatflow.subs(Tb,Ta),0,'W'),
],
'LAB3D-07':[
 *[check('Coulomb component'+str(i)+' independently minuspotentialgradient',-sp.diff(potential,v),constant*charge*v/radius**3,'N/C') for i,v in enumerate((vx,vy,vz))],
 check('nC andCoulombconstant factor9',Q(9*10**9,'N*m^2/C^2')*Q(1,'nC')/Q(1,'m')**2,9,'N/C',actual),
 check('actualassessment1 nineNperC',(-sp.diff(potential,vx)).subs({vx:1,vy:0,vz:0,constant:9,charge:1}),9,'N/C',actual),
 check('actualassessment2 equaloppositechargesmidpoint18',sp.Integer(9+9),18,'N/C',actual),
 check('positiveequalchargesmidpoint vectorzero',sp.Matrix([18,0,0])[0]+sp.Matrix([-18,0,0])[0],0,'N/C'),
 check('positiveequalcharges midpointpotential36notzero',sp.Integer(18+18),36,'V'),
 check('singlecharge doubleddistance fieldquarter',F(1,2)**2,F(1,4)),
 check('singlecharge doubleddistance potentialhalf',F(1,2),F(1,2)),
 check('testcharge forceunit',Q(1,'C')*Q(1,'N/C'),1,'N'),
],
'LAB3D-08':[
 check('actualassessment1 seriescurrent2ampere',serie[current],2,'A',actual),
 check('actualassessment1 voltageclosure12volt',serie[V1]+serie[V2],12,'V',actual),
 check('actualassessment2 parallelbranch1ampere',Q(6,'V')/Q(6,'ohm'),1,'A',actual),
 check('actualassessment2 parallelbranch2ampere',Q(6,'V')/Q(3,'ohm'),2,'A',actual),
 check('actualassessment2 KCLtotal3ampere',F(6,6)+F(6,3),3,'A',actual),
 check('default parallelpower18watts',Q(6,'V')*Q(3,'A'),18,'W'),
 check('default branchpowers6plus12 equals18',sp.Integer(6+12),18,'W'),
 check('default seriescurrent2thirds',F(6,6+3),F(2,3),'A'),
 check('series totalpower sumI2R',F(2,3)**2*(6+3),4,'W'),
 check('zero source giveszero current withpositiveR',sp.Integer(0)/sp.Symbol('R',positive=True),0,'A'),
],
'LAB3D-09':[
 check('lens equation independently solved',image,f*p/(p-f),'cm'),
 check('actualassessment1 image15centimetres',image.subs({f:10,p:30}),15,'cm',actual),
 check('actualassessment2 image minus10centimetres',image.subs({f:10,p:5}),-10,'cm',actual),
 check('virtual magnificationplus2',(-image/p).subs({f:10,p:5}),2),
 check('default30object12focal gives20image',image.subs({f:12,p:30}),20,'cm'),
 check('default magnificationminus2thirds',(-image/p).subs({f:12,p:30}),-F(2,3)),
 check('two rayintersection agrees',sp.simplify(1-image/f+image/p),0),
 check('focus exactlyparallel slopes',(-1/f+1/p).subs(p,f),0,'1/cm'),
 check('focusright limit positiveinfinity',sp.limit(image,p,f,dir='+'),sp.oo,'cm'),
 check('scene verticalexaggeration23over3 matchesrounded7point7',F(46,100)/F(6,100),F(23,3)),
],
'LAB3D-10':[
 check('two phases sum exactclosedform',sp.trigsimp(amp*(sp.cos(a-w*t)+sp.cos(b-w*t)) -amp*(C*sp.cos(w*t)+S*sp.sin(w*t))),0,'m'),
 check('phasor magnitude identity',sp.trigsimp(C*C+S*S),2+2*sp.cos(a-b)),
 check('actualassessment1 inphase2mmplus2mm',Q(2,'mm')+Q(2,'mm'),4,'mm',actual),
 check('actualassessment2 equalpaths180alltimeszero',sp.trigsimp(amp*(sp.cos(a-w*t)+sp.cos(a+sp.pi-w*t))),0,'m',actual),
 check('consumeraddedassessment3 signedinstantaneoussum',Q(F(3,2),'mm')+Q(-F(1,2),'mm'),1,'mm',actual),
 check('consumeraddedassessment4 pathdifferencehalfLambda',F(9,10)-F(6,10),F(3,10),'m',actual),
 check('consumeraddedassessment4 relativephasepi',2*sp.pi*F(3,10)/F(6,10),sp.pi,'rad',actual),
 check('consumeraddedassessment4 cancellation',sp.trigsimp(amp*(sp.cos(a)+sp.cos(a+sp.pi))),0,'m',actual),
 check('default lambda threefifthsmetre',Q(F(3,5),'m/s')/Q(1,'Hz'),F(3,5),'m'),
 check('quarterphase envelope2sqrt2millimetres',2*2*sp.cos(sp.pi/4),2*sp.sqrt(2),'mm'),
 check('maximum two equalamplitudes4millimetres',2*amp*1000,4,'mm'),
 check('linearphase speed c6tenths',Q(F(3,5),'m/s'),F(3,5),'m/s'),
]}


def runtime_inputs():
    thermal=[{}]+[dict(zip(('left','right','L','A','k'),v)) for v in itertools.product((0,100),(0,100),(2,20),(4,40),(.5,10))]
    field=[{}, {'q1':1,'q2':-1},{'q1':1,'q2':0},{'q1':-1,'q2':0}, {'q1':0,'q2':0,'sx':-1}, {'sx':-1},
           {'q1':1,'q2':-1,'ax':0,'az':-1,'bx':0,'bz':1}, {'sx':2}, {'sx':.25,'sy':.5,'sz':.75},
           {'q1':4,'q2':-4,'ax':0,'bx':0,'sx':1}, {'q1':1,'q2':1,'ax':0,'bx':0,'sx':1}]
    circuit=[{}]+[dict(zip(('mode','U','R1','R2'),v)) for v in itertools.product(('Serie','Parallelo'),(0,12),(1,20),(1,20))]+[{'mode':'Serie','U':12,'R1':2,'R2':4}]
    lens=[{'p':p,'f':f} for p in range(5,51) for f in range(5,26)]+[{'p':30,'f':10,'screen':15}, {'p':5,'f':10,'screen':10}]
    waves=[{}]+[{'x':0,'phase':v,'f':f} for v in (-180,-90,0,90,180) for f in (.5,2)]+[{'f':f,'d':d,'x':x,'z':z,'phase':phase} for f,d,x,z,phase in ((.5,.2,-1.2,-.8,-180),(2,1.6,1.2,.8,180),(2,.2,0,0,0),(1,1.6,.8,0,90))]
    return {'LAB3D-06':thermal,'LAB3D-07':field,'LAB3D-08':circuit,'LAB3D-09':lens,'LAB3D-10':waves}


def runtime_values(app_root=None):
    code="const inputs="+canonical(runtime_inputs())+"; const names="+canonical(MODEL_BY_ID)+";\n"+r"""
import {defaults,inRange} from './static/js/banchi/misure.js';
const out={};
for(const [id,name] of Object.entries(names)){
 const model=await import('./static/js/banchi/modelli/'+name+'.js');
 out[id]=inputs[id].map((override,index)=>{
  const input={...defaults(model.params),...override}; const s=model.solve(input);
  const result={input,inRange:inRange(model.params,input),output:s,warning:model.warning?.(input,s)||''};
  if(index<2)result.graphs=model.graphs(input,s,0,2);
  if(name==='onde')result.samples=[0,.125,.25,.5,.75,1].map(r=>({t:r/input.f,...model.sample(s,r/input.f)}));
  return result;
 });
}
const {problemi}=await import('./static/js/banchi/quaderno.js');out._addedWaveAssessments=problemi.onde;
console.log(JSON.stringify(out,(_k,v)=>v===Infinity?'Infinity':v===-Infinity?'-Infinity':Number.isNaN(v)?'NaN':v));
"""
    run=subprocess.run(['node','--input-type=module','-'],cwd=Path(app_root) if app_root is not None else APP,input=code,text=True,capture_output=True,timeout=30)
    if run.returncode:raise ValueError('Read canonical bench runtime failed: '+run.stderr[:500])
    return json.loads(run.stdout)


def exact_runtime_expected(name,inputs):
    R=lambda x:sp.Rational(str(x));p={k:(R(v) if isinstance(v,(int,float)) else v) for k,v in inputs.items()}
    if name=='calore':
        # Derived from sourcefree T''=0 with fixed boundary temperatures.
        length=p['L']/100;area=p['A']/10000;gradient=(p['right']-p['left'])/length
        return {'length':length,'area':area,'gradient':gradient,'flux':-p['k']*gradient,'power':p['k']*area*(p['left']-p['right'])/length}
    if name=='campo':
        sources=[(sp.Matrix([p[a+'x'],p[a+'y'],p[a+'z']]),p[q]) for a,q in [('a','q1'),('b','q2')]]
        probe=sp.Matrix([p['sx'],p['sy'],p['sz']]);E=sp.zeros(3,1);V=0;parts=[]
        for origin,q in sources:
            displacement=probe-origin;r2=displacement.dot(displacement)
            if q and r2==0:return {'reading':None}
            part=9*q*displacement/(r2**sp.Rational(3,2)) if q else sp.zeros(3,1)
            parts.append(list(part));E+=part
            if q:V+=9*q/sp.sqrt(r2)
        return {'reading':{'E':list(E),'V':V,'magnitude':sp.sqrt(E.dot(E)),'contributions':parts}}
    if name=='circuito':
        # Independent KCL/KVL equations and passive powerbalance.
        U,R1,R2=p['U'],p['R1'],p['R2']
        if p['mode']=='Serie':I=U/(R1+R2);I1=I2=I;V1=I*R1;V2=I*R2
        else:V1=V2=U;I1=U/R1;I2=U/R2;I=I1+I2
        resistance=R1+R2 if p['mode']=='Serie' else 1/(1/R1+1/R2)
        return {'I':I,'I1':I1,'I2':I2,'V1':V1,'V2':V2,'R':resistance,'P':U*I,'P1':I1*V1,'P2':I2*V2}
    if name=='lente':
        if p['p']==p['f']:return {'q':'Infinity','m':None,'type':'all’infinito','sharp':False}
        q=1/(1/p['f']-1/p['p']);m=-q/p['p']
        return {'q':q,'m':m,'type':'reale, capovolta' if q>0 else 'virtuale, diritta','sharp':bool(abs(q-p['screen'])<sp.Rational(1,20))}
    f,d,phase=p['f'],p['d'],p['phase'];r1=sp.sqrt((p['x']+d/2)**2+p['z']**2);r2=sp.sqrt((p['x']-d/2)**2+p['z']**2)
    lam=sp.Rational(3,5)/f;wavek=2*sp.pi/lam;omega=2*sp.pi*f;phi=phase*sp.pi/180;delta=wavek*(r2-r1)+phi
    envelope=sp.Abs(2*sp.Rational(1,500)*sp.cos(delta/2))
    return {'d':d,'lambda':lam,'k':wavek,'omega':omega,'phi':phi,'duration':2/f,'envelope':envelope,'probe':{'r1':r1,'r2':r2,'delta':delta}}


def compare_value(actual,expected):
    if isinstance(expected,dict):return isinstance(actual,dict) and all(k in actual and compare_value(actual[k],v) for k,v in expected.items())
    if isinstance(expected,list):return isinstance(actual,list) and len(actual)==len(expected) and all(compare_value(a,e) for a,e in zip(actual,expected))
    if isinstance(expected,(str,bool)) or expected is None:return type(actual) is type(expected) and actual==expected
    return type(actual) in (int,float) and math.isfinite(actual) and math.isclose(actual,float(expected),rel_tol=1e-10,abs_tol=1e-11)


def compare_runtime(actual):
    specs=runtime_inputs();summary={}
    for key,overrides in specs.items():
        name=MODEL_BY_ID[key];cases=actual.get(key,[]);failures=[];compared=0
        if len(cases)!=len(overrides):failures.append({'error':'complete runtime case count differs'})
        for index,(got,override) in enumerate(zip(cases,overrides)):
            inputs={**DEFAULTS[name],**override};expected=exact_runtime_expected(name,inputs)
            compared+=1
            if got.get('input')!=inputs or not got.get('inRange') or not compare_value(got.get('output'),expected):
                failures.append({'case':index,'input':inputs,'actual':got.get('output'),'expected':{k:str(v) for k,v in expected.items()}})
            if name=='campo' and ((expected['reading'] is None) != bool(got.get('warning'))):failures.append({'case':index,'error':'singularity warning differs'})
            if name=='onde':
                samples=got.get('samples',[])
                if len(samples)!=6:failures.append({'case':index,'error':'wave sample count differs'})
                for sample in samples:
                    t=sample['t'];r1=float(expected['probe']['r1']);r2=float(expected['probe']['r2']);k=float(expected['k']);w=float(expected['omega']);phi=float(expected['phi'])
                    first=.002*math.cos(k*r1-w*t);second=.002*math.cos(k*r2+phi-w*t)
                    if not compare_value([sample['first'],sample['second'],sample['y']],[first,second,first+second]):failures.append({'case':index,'error':'direct signed wave sum/sample differs'})
            # Inspect actual graph data on both defaults/first boundary, not only solve outputs.
            if index<2:
                graphs=got.get('graphs',[])
                if len(graphs)!=1:failures.append({'case':index,'error':'graph missing'});continue
                g=graphs[0]
                if name=='calore':
                    for point in g['series'][0]['points']:
                        x,y=point;want=inputs['left']+(inputs['right']-inputs['left'])*x/inputs['L']
                        if not compare_value(y,want):failures.append({'case':index,'error':'linear temperature graph differs'});break
                elif name=='campo':
                    for x,value in g['series'][0]['points']:
                        probe={**inputs,'sx':x};want=exact_runtime_expected(name,probe)['reading']
                        valuewant='NaN' if want is None else want['V']
                        if not compare_value(value,valuewant):failures.append({'case':index,'error':'potential graph/singularity gap differs'});break
                elif name=='circuito':
                    for series,field in zip(g['series'],('I','I1','I2')):
                        for voltage,value in series['points']:
                            want=exact_runtime_expected(name,{**inputs,'U':voltage})[field]
                            if not compare_value(value,want):failures.append({'case':index,'error':'Ohmic graph differs'});break
                elif name=='lente':
                    obj=inputs['p'];focal=inputs['f']
                    want=[[[ -obj,1],[0,0],[65,-65/obj]],[[-obj,1],[0,1],[65,1-65/focal]]]
                    for series,points in zip(g['series'],want):
                        if not compare_value(series['points'],points):failures.append({'case':index,'error':'principal ray graph differs'})
                else:
                    for si,series in enumerate(g['series']):
                        for t,value in series['points']:
                            r1=float(expected['probe']['r1']);r2=float(expected['probe']['r2']);k=float(expected['k']);w=float(expected['omega']);phi=float(expected['phi'])
                            values=[2*math.cos(k*r1-w*t)+2*math.cos(k*r2+phi-w*t),2*math.cos(k*r1-w*t),2*math.cos(k*r2+phi-w*t)]
                            if not compare_value(value,values[si]):failures.append({'case':index,'error':'signed waves graph differs'});break
        summary[key]={'caseCount':compared,'plannedCaseCount':len(overrides),'mismatchCount':len(failures),'failures':failures[:10],
                      'comparison':'independent exact symbolic oracle vs canonical JS binary64; bounded roundoff, not student calculatorwork','ok':compared==len(overrides) and not failures}
    return summary

MANUAL={
'LAB3D-06':'SOURCE actualassessments:2*1*10/(1/2)=40W; inverseL=(1/2)*2*10/20=1/2m. Predictiondoublethicknesshalvespower forfixednonzeroDeltaT/A/k. Defaults10cm=.1m,16cm²=.0016m²,DeltaT=-60K givegradient-600K/m,flux+1200W/m²,rightwardpower48/25=1.92W. Reverseboundaries reversesign, equaltemperatureszeroanduninferableL. Studentneedsonlyfinitefractionarithmetic; instrumenthandlesarbitraryslideroutputs, notrequiredhandcomputedcontinuousPDE.',
'LAB3D-07':'SOURCE actualassessments:9e9*(1e-9)/1²=9N/C, doublingdistance2m gives9/4=2.25N/C; midpointof+1/-1nCseparated2mgives9+9=18N/Cfrompositive tonegative. Predictionequalpositivechargesmidpointfieldsoppose/cancel;default+2/+2gives0Ebut36V. nCprefactorreducesktonumeric9; vectorCoulombderivedasminusgradientofscalarpotential. Arbitrary3Dprobecomputationsareinstrumentreadings, notstudent-requirednumericradicals. Atnonzero pointsourcecoincidencemodelwarnsundefined; q0removesourceandallowszeroatitsformerpoint.',
'LAB3D-08':'SOURCE actualassessments:12V/(2+4)ohm=2Acommontobothseries. Parallel6Vacross6ohm/3ohmgives1+2=3A. DefaultsparallelU6/R6,R3 givesI1=1/I2=2/I3A,branchP6/12W,sum18W=UI. Seriesdefaults6/(6+3)=2/3A, drops4/2V, power4W. U0allzeroandresistancecannotbeinferredfrom0/0; UIexplanationstatesit. Allassignedfinitefractions/manual, otherpositivecontrolsverifiedthroughKirchhoffbalances,notclaimedstudentcomputedallcases.',
'LAB3D-09':'SOURCE actualassessments:1/q=1/10-1/30=1/15percm,q15cmreal; p5/f10gives1/q=-1/10,q-10cmvirtualupright,m2. Defaults30/12 givesq20,m-2/3,screen20sharp. Positivep/fthinparaxiallensmodel. Atp=fparalleloutgoingrays,qInfinity,mnotfinite,nofinitescreen. Formulaalso independently followsintersectiony=-x/p andy=1-x/f. Instrumentarbitrarynumericreadingsnotstudent-requiredradicalevaluation. SeparateverticalscaleH.46per1cmobject/axial.06gives23/3≈7.7exaggerationexplicit.',
'LAB3D-10':'SOURCE actualassessments:equalinphase2mm+2mmgives4mm;equalpathsplus180degreesgivescosphaseanditsnegativealltimes,0mm. CONSUMER adds2actualtasks:instant+1.5-.5=+1mm; distances.6/.9difference.3m=halfLambda.6givesrelativephasepiand0mmforequalamplitudes. Exactphasorquadraturesprove2A|cos(DeltaPhi/2)|; instantaneoussumisnotamplitude. Instrumentdefaultc.6,f1 giveslambda.6m, nothandcalculationofeverycosvalue. Nodex0/phase180verifiedatmultipleactualclockinstants. Coherentprogressivescalartransversewavesconstant2mmcontributioninobservedzoneareexplicitassignedidealization,notgeometricspreadingorfullwaterhydrodynamics.'}
ASSUMPTIONS={
'LAB3D-06':'Homogeneousbar/sourcelessstationary1DFourierconduction,k>0constant, lateralinsulation,fixedfaceCelsiustemperatures. Temperaturedifferences1C=1K. L2..20cmpositive,A4..40cm²positive,k.5..10W/(mK),Tfaces0..100C. Zeroandreversedgradientallowed. Staticsteadyprofile/colorsarestate,notfinitepropagationtransient.',
'LAB3D-07':'Staticpointchargesvacuum,roundedworkingk9e9SI, qin-nC−4..4andcoordinates−2..2m. VectorlinearCoulombfieldsandscalarpotentialsreference0atinfinity. Probeonsupportofanynonzero sourceexcluded/warned; q0absentsource. Finitegridisopotentialandtracedfieldlinesapproximatecontours, notexactmeshgeometryorquantitativefieldline-density. Twochargescanbe coincidentawayfromprobe; sourcepointitselfwarned.',
'LAB3D-08':'IdealDCfixedvoltage0..12V, positiveohmicR1/R2in1..20ohm,idealwires/nodes/nointernalbatteryresistance. Seriescommoncurrent,parallelsamevoltage,KCLandpowerbalance. ZeroUvalidbut0/0inverseunidentifiable. No heating-dependentRorrealbatterycapacityclaim.',
'LAB3D-09':'Thinconvergingparaxiallens,realobjectp5..50cm,f5..25cmpositive,screen5..65cmpositive. Singularityp=fexplicit. Signedqnegativeobjectsidevirtual,noexit-sidescreen. Screenfocuscriterionabs(q-screen)<.05cmisnumericalreadouttolerance, notphysicaldepthoffieldmodel. Offviewintersectionsreadnumerically;3Dverticalscaleexplicitlyexaggerated.',
'LAB3D-10':'Coherentsteadysinusoidalscalarwaves,equal2mm amplitudes/c.6m/sconstantinobservedzone,linearpointwisesuperposition. f.5..2Hz,d.2..1.6m,relativephase−180..180degrees,probe x−1.2..1.2/z−.8...8m; noenergyattenuationclaim. Crestsnotcausalturnonfronts, phaseconventionkr−omegat+phi. Graphs/displayfloatingpoint; near-exactnodesnumericallyzeroedat16epsilon, nothandcomputednewprecision.'}
PEDAGOGY={
'LAB3D-06':'Prediction/computation/inverse distinguishthermalfluxdensityandtotalpower,negativegradient/positiveflowandzero-inputdegeneracy. Bothactualassessmentsindependentlysolved; L/Aunitsconvertedbeforeusingk.',
'LAB3D-07':'Predictionfield0doesnotmeanpotential0. Signedvectorcontributionsandoutward/inwarddirection, one-charge inverse-square distance check, potentialsurface/fielddirectiondistinctionandpoint-sourcewarningactuallyread. SourcesourceqversustestchargeqandnCconversionclear.',
'LAB3D-08':'Topologyidentifiedbeforeformulas, currentversusvoltagedistinguished, circuit/graphicsreadpluspowerbalance. GeneratorzeroexplainedratherthanpresentingR=0/0. Formalanswerssourceindependentlychecked, actualconsumerpositiveresistorsprecludenonphysicalzeroR.',
'LAB3D-09':'Real/virtual/infinitebranchesallreachableandread, referenceobjectheight/scalemismatchdeclared, dashedbackprojectionsnotphysicalbackwardrays. Assessednegativeqexplainedratherthanlostabsolutevalue; actualscreencannotfocusvirtualimage.',
'LAB3D-10':'Actualpilotguida/ragionamento/fourmathdrawingsandtwoaddedassessmenttasksread,notjustsourceJSON. Separatesinstantaneoussignedsum/envelope, propagationphase/sourcephaseandnodealltimes. Allrequestednumeric tasksaremanualfinitearithmetic; consumersimtrigreadingsnotextraassignedcalculatorwork.'}
VISUAL_REVIEW={
'LAB3D-06':'Read3Dsceneand2Ddrawing, actualdefaultChromiumscreenshotseach. Thermostatfacecolorsmonotonic,left80/right20withlinearprofile,positiverightwardflowarrow;reversal/zeroalsoactualUIchecked. 3DlengthandcrosssectionproportionalL/sqrtAbutillustrativeaxis-scalesnotclaimedidentical;2DbarwidthfixedschematicLlabelupdates.',
'LAB3D-07':'Readscene/marching-tetrahedra/lineintegrationandfallbackprojection. 3DdefaultopposingE1/E2withsharedscaleandE0noarrow, V36positive;2DpositionsprojectionxyexplicitwithEzreadseparately. FieldlinearrowstangentphysicalEevenwhennegative-sourcepathsareintegratedoppositeforconstruction. IsopotentialgridN12limits±2.1declaredapproximate. Nullsourceguardanddegeneratecoincidentoppositechargesmeshomissionpreventfakeplanes;nofieldlinecountintensityinference.',
'LAB3D-08':'Read3Dphysicalwiringand2Dnodes: batteryseparatetwo posts,noaccidentalparallelshort;branchresistorsshareA/Bonlyinparallel,onecurrentpathinseries. Actualdefault3Dand2Dread;arrowsconventionalcurrentfrom+throughpassiveelements,notrealmetal-electrondrift.',
'LAB3D-09':'Read3Drayclippingand2Dgraphconstruction; actual3D/2Ddefaultsseen. CentralraystraightandparallelrayrefractstofarF, q20screenposition. Backextensionsdashedforvirtual, nofalsefiniteimageatfocus;clipped/offviewpathsnotinterpretedasnewrays. Sidecameraorthographic,1cmobjectheightvertical.46/axial.06≈7.7declared, fallbackschematicnotisotropicanglecalibration.',
'LAB3D-10':'Read3Dsheetspatialquadratures,ring/probeyoffset,plancrestradiiand2Dtop/section/probe/twophasor/timetraces. Crestconditionkr−wt+phi=2pim givesradius=(ft-phi/2pi+m)lambda, matchingboth3D/2Dtimeupdates. Sheetphysicalheightgain82explicitdisplayexaggeration,notamplitudeunitsconfusion. Probeandringalignedafteractualdisplacement, notringheightbug. Actualdefault3D/2DseenandnodeUIclockcaseschecked.'}


def runtime_hashes(root=None):
    root=Path(root) if root is not None else APP
    return {name:sha((root/name).read_bytes()) if (root/name).is_file() else 'MISSING' for name in READ_RUNTIME}



def consumer_evidence():
    proof=APP/'editorial/reviews/bench-fields-optics-036-browser.json'
    protocol=APP/'tests/corpus/browser-bench-fields-optics.mjs'
    if not proof.is_file() or not protocol.is_file():return {'ok':False,'error':'Observed consumer evidence/protocol missing'}
    actual_sha=sha(proof.read_bytes());protocol_sha=sha(protocol.read_bytes())
    if actual_sha!=READ_BROWSER_PROOF_SHA256 or protocol_sha!=READ_BROWSER_PROTOCOL_SHA256:
        return {'ok':False,'error':'Observed consumer evidence/protocol differs from independent reading'}
    data=json.loads(proof.read_text())
    ok=(data.get('terminalStatus')=='PASS' and not data.get('errors') and len(data.get('cases',[]))==22
        and data.get('runtimeProfileSha256')==READ_RUNTIME_PROFILE_SHA256 and data.get('protocolSha256')==protocol_sha)
    for key in READ_SOURCE_SHA256:
        cases=[r for r in data.get('cases',[]) if r.get('id')==key]
        ok=ok and sum(r.get('noWebGL') is False for r in cases)==1 and sum(r.get('noWebGL') is True for r in cases)==1
        for case in cases:
            if 'noWebGL' in case:ok=ok and ('Tavola di misura' in case.get('display','') if case['noWebGL'] else '3D interattivo' in case.get('display',''))
    return {'ok':bool(ok),'proofSha256':actual_sha,'protocolSha256':protocol_sha,
            'runtimeProfileSha256':data.get('runtimeProfileSha256'),'observedCaseCount':len(data.get('cases',[])),
            'freshness':'Observed AI consumer snapshot; exact runtime profile required and fresh JS/oracle replay per report. Browser not rerendered per report.'}

def verify(sources,runtime_root=None):
    missing=set(READ_SOURCE_SHA256)-set(sources)
    if missing:raise ValueError('Missing individually read bench sources: '+','.join(sorted(missing)))
    models=independent_checks();hashes=runtime_hashes(runtime_root);consumer=consumer_evidence()
    runtime_app=Path(runtime_root) if runtime_root is not None else APP
    try:profile=runtime_fingerprint(runtime_app)['sha256']
    except (ValueError,OSError) as exc:profile='UNAVAILABLE: '+str(exc)
    runtime_ok=hashes==READ_RUNTIME and profile==READ_RUNTIME_PROFILE_SHA256
    actual=None;runtime_error=None;summary={}
    if runtime_ok:
        try:
            actual=runtime_values(runtime_app);summary=compare_runtime(actual)
            if runtime_hashes(runtime_app)!=hashes or runtime_fingerprint(runtime_app)['sha256']!=profile:
                runtime_error='Runtime changed during independent check; discard in-flight evidence'
        except (ValueError,OSError,subprocess.TimeoutExpired,KeyError,TypeError) as exc:runtime_error=str(exc)
    else:runtime_error='Actual consumer/runtime bytes differ from independent reading; no cached runtime approval'
    records=[]
    for key in sorted(READ_SOURCE_SHA256):
        row=sources[key];errors=[]
        if not consumer['ok']:errors.append('Independent observed consumer evidence missing, altered or stale')
        physics=models.get(key,[]);checks=list(physics)
        if row.get('kind')!='bench' or digest(row)!=READ_SOURCE_SHA256[key]:errors.append('Bench source differs from independently read original')
        if not physics or not all(c['ok'] for c in physics):errors.append('Independent bench physics missing or failed')
        if runtime_error:errors.append(runtime_error)
        comparison=summary.get(key)
        if comparison:
            checks.append({'claim':'fresh canonical JS vs independent symbolic/analytic oracle across complete planned cases','ok':comparison['ok'],
                           'mode':'INDEPENDENT_EXACT_ORACLE_VS_CURRENT_RUNTIME','dimension':{},'caseCount':comparison['caseCount'],'failures':comparison['failures']})
            if not comparison['ok']:errors.append('Independent oracle vs actual bench runtime failed')
        elif not runtime_error:errors.append('Missing fresh runtime comparison')
        assessments=row.get('assessment',[]);wanted=ASSESSMENT_ORACLES[key]
        if len(assessments)!=len(wanted):errors.append('Actual assigned assessment identity incomplete')
        for index,(assessment,(value,unit)) in enumerate(zip(assessments,wanted)):
            ok=(type(assessment.get('value')) in (int,float) and sp.Rational(str(assessment['value']))==value and assessment.get('unit')==unit)
            checks.append({'claim':'source assigned assessment'+str(index)+' independently derived answer/units','ok':bool(ok),'independentExact':str(value),'unit':unit,'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()}})
            if not ok:errors.append('Source assigned assessment disagrees with independent solution')
        if row.get('prediction',{}).get('correct')!=EXPECTED_PREDICTIONS[key]:errors.append('Prediction differs from independently solved physical comparison')
        if key=='LAB3D-10' and actual is not None:
            added=actual.get('_addedWaveAssessments',[])
            ok=len(added)==2 and all(type(r.get('value')) in (int,float) and r['value']==want and r.get('unit')=='mm' for r,want in zip(added,(1,0)))
            checks.append({'claim':'both actually appended pilotwave assessment tasks independently solved','ok':ok,'mode':'ACTUAL_CONSUMER_ADDED_ASSIGNMENTS','dimension':{}})
            if not ok:errors.append('Consumer-added wave assessments differ from independent solutions')
        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),
            'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
            'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c.get('dimension',{}) for c in checks},
            'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':MANUAL[key],
            'manualFeasibility':'PASS_AI_EXACT' if not errors else 'FAIL_BENCH_REVIEW',
            'physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],
            'assetChecksums':{},'figureReview':VISUAL_REVIEW[key],
            'runtimeSha256':hashes,'reviewedRuntimeSha256':READ_RUNTIME,
            'runtimeProfileSha256':profile,'reviewedRuntimeProfileSha256':READ_RUNTIME_PROFILE_SHA256,'runtimeComparison':comparison,'consumerEvidence':consumer,
            'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':False,
            'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE',
            'limits':'Only source LAB3D06..10 and read live consumer paths. Fresh JS/oracle replay on each report; AI full reading and observed 3D/fallback UI are frozen to exact runtime bytes, not rerendered per report. No certification of LAB3D01..05/classic labs/181 lesson experiments, human approval/publication, experiment efficacy or student calibration.'})
    return records


def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,
        'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,
        'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),
        'draftReviewedCount':0,'failedPublishedEditionIds':[],
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_author','originalEditionRetained':True,
        'humanApproval':'NOT_RUN','publicationAction':'NONE'}
