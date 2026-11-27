"""Independent C2 original-source/installed-code audit, deliberately NOT registrable.

No UI evidence or human approval is inferred from numerical or scene-graph checks.
No authoring imports. Exact primary derivations were saved before source solutions.
"""
from pathlib import Path
from fractions import Fraction
import hashlib,json,math,subprocess

APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/esperienze-C2.json'
SOURCE_FILE_SHA256='33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
PROOF='editorial/reviews/experiments-C2-hydraulics-buoyancy-installed-code-1a35-20261125.json'
PROOF_SHA256='fc17b5b6d321905c8945ebb72c2379b2c83fd0c9e853d5c563047bd30063d80e'
PROTOCOL='tests/corpus/collect-C2-hydraulics-buoyancy-code-only.mjs'
# lo,hi,step,first reference,comparison task,actual transfer,output unit
SPECS={
 'SIM-C2-L003-02':(0,8,.5,2,6,4,'cm'),
 'SIM-C2-L003-03':(0,12,1,0,8,6,'kPa'),
 'SIM-C2-L004-01':(0,4,.25,1,3,2,'N'),
 'SIM-C2-L004-02':(600,1200,50,800,1000,900,'N'),
 'SIM-C2-L004-03':(200,1000,50,250,800,600,'%')}

def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False)
def exact_value(key,x):
    x=Fraction(str(x))
    if key=='SIM-C2-L003-02':return x/4
    if key=='SIM-C2-L003-03':return 20+x
    if key=='SIM-C2-L004-01':return 10*x
    if key=='SIM-C2-L004-02':return x/50
    if key=='SIM-C2-L004-03':return x/10
    raise ValueError('Unreviewed ID')

def near(value,want):
    return type(value) in (int,float) and math.isfinite(value) and math.isclose(value,float(want),rel_tol=1e-12,abs_tol=1e-12)

def exact_checks():
    import sympy as sp
    import pint
    si=pint.UnitRegistry(non_int_type=Fraction);Q=si.Quantity
    A,s1,s2,rho,g,V=sp.symbols('A s1 s2 rho g V',positive=True)
    out={key:[] for key in SPECS}
    def check(key,claim,left,right,unit=''):
        if isinstance(left,si.Quantity):left=left.to(unit).magnitude
        l,r=sp.sympify(left),sp.sympify(right)
        residual=sp.simplify(l-r)
        out[key].append({'claim':claim,'independentExact':str(l),'expected':str(r),'residual':str(residual),'unit':unit,
                         'dimension':{str(k):str(v) for k,v in si.Unit(unit).dimensionality.items()},'ok':residual==0})
    for key,spec in SPECS.items():
        for label,x,y in zip(('first_reference','comparison_task','actual_transfer'),spec[3:6],
                            {'SIM-C2-L003-02':(Fraction(1,2),Fraction(3,2),1),
                             'SIM-C2-L003-03':(20,28,26),'SIM-C2-L004-01':(10,30,20),
                             'SIM-C2-L004-02':(16,20,18),'SIM-C2-L004-03':(25,80,60)}[key]):
            check(key,label,exact_value(key,x),y,spec[6])
    k='SIM-C2-L003-02'
    check(k,'solve incompressible volume balance',sp.solve(sp.Eq(A*s1,4*A*s2),s2)[0],s1/4,'cm')
    check(k,'inverse force gain at equal pressure',4*A/A,4)
    check(k,'work gain is unity',4*sp.Rational(1,4),1)
    k='SIM-C2-L003-03'
    check(k,'hydrostatic gradient integrates to density*g*depth',sp.integrate(rho*g,(s1,0,s2)),rho*g*s2,'Pa')
    check(k,'added surface pressure unchanged at fixed depth',sp.diff(20+s1,s1),1)
    check(k,'assigned20kPa baseline plus6kPa',Q(20,'kPa')+Q(6,'kPa'),26,'kPa')
    k='SIM-C2-L004-01'
    check(k,'one litre water assignedg10 weighs10N',Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(1,'L'),10,'N')
    check(k,'actual transfer two litres weighs20N',Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(2,'L'),20,'N')
    k='SIM-C2-L004-02'
    check(k,'two litres is1over500m3',Q(2,'L'),sp.Rational(1,500),'m^3')
    check(k,'actual900kg_per_m3 gives18N',Q(900,'kg/m^3')*Q(10,'m/s^2')*Q(2,'L'),18,'N')
    check(k,'doubling density doubles buoyancy',sp.cancel((2*rho*g*V)/(rho*g*V)),2)
    k='SIM-C2-L004-03'
    immersed=sp.solve(sp.Eq(1000*g*V,rho*g*s1),V)[0]
    check(k,'float balance cancelsg and totalvolume',sp.cancel(immersed/s1),rho/1000)
    check(k,'percentage at600kg_per_m3',100*sp.Rational(600,1000),60,'%')
    check(k,'neutraldensity allvolume submerged',sp.Rational(1000,1000),1)
    return out

def compare_installed(proof):
    rows=proof.get('records',[]);ids=[r.get('id') for r in rows]
    if len(ids)!=5 or set(ids)!=set(SPECS):raise ValueError('Incomplete/duplicate consumer collection')
    out={}
    for row in rows:
        key=row['id'];lo,hi,step,x0,x1,transfer,unit=SPECS[key];errors=[]
        params=row.get('params',[])
        if len(params)!=1 or any(not near(params[0].get(k),v) for k,v in [('min',lo),('max',hi),('step',step),('value',x0)]):errors.append('Actual control/default differs')
        if row.get('clock') is not None:errors.append('Unexpected time evolution for equilibrium comparison')
        if row.get('prediction',{}).get('correct')!=2 or row['prediction'].get('options')!=['Diminuisce','Resta uguale','Aumenta']:errors.append('Prediction/distractors differ')
        cases=row.get('cases',[]);count=round((hi-lo)/step)+1
        if len(cases)!=count:errors.append('Control grid incomplete')
        for index,c in enumerate(cases):
            x=Fraction(str(lo))+index*Fraction(str(step));expected=exact_value(key,x)
            if not near(c.get('x'),x) or not near(c.get('solve',{}).get('y'),expected):errors.append('Installed scalar differs')
            readings=c.get('readings',[])
            if len(readings)!=3 or not near(readings[1][1],expected) or readings[1][2]!=unit:errors.append('Instrument value/unit differs')
            if key=='SIM-C2-L003-02' and readings[2][1:]!=[4,'']:errors.append('Ideal force gain not4')
            graphs=c.get('graphs',[])
            if len(graphs)!=1:errors.append('Control graph count differs')
            else:
                points=graphs[0].get('series',[{}])[0].get('points',[])
                if len(points)!=101 or any(not near(y,exact_value(key,z)) for z,y in points):errors.append('Graph differs from independent law')
            if len(c.get('steps',[]))!=4:errors.append('Four reasoning stages missing')
            e=c.get('elements',[])
            if key=='SIM-C2-L003-02':
                pistons=[v for v in e if v.get('kind')=='rod' and v.get('c')==0x726d81 and near(v.get('r'),.29 if v.get('a',[0])[0]<0 else .58)]
                if len(pistons)!=2:errors.append('Two piston faces missing')
                else:
                    left,right=sorted(pistons,key=lambda p:p['a'][0])
                    if not near(left['a'][1],Fraction(177,100)-x/10) or not near(right['a'][1],Fraction(27,20)+x/40) or not near(right['r']**2/left['r']**2,4):errors.append('Piston volume/stroke/area semantics differ')
            elif key=='SIM-C2-L003-03':
                probes=[v for v in e if v.get('kind')=='ball' and v.get('c')==0x7350b0]
                if len(probes)!=2 or any(not near(v['p'][1],Fraction(13,50)) for v in probes):errors.append('Deep equal-height probes differ')
            else:
                blocks=[v for v in e if v.get('kind')=='box' and v.get('c')==0xd49332]
                fraction=x/4 if key.endswith('01') else (Fraction(1) if key.endswith('02') else x/1000)
                if len(blocks)!=1 or not near(blocks[0]['p'][1],Fraction(39,25)+Fraction(97,100)*(Fraction(1,2)-fraction)):errors.append('Immersed fraction differs')
        tasks=row.get('assessment',[]);taskChecks=[]
        if len(tasks)!=2:errors.append('Actual tasks missing')
        for index,task in enumerate(tasks[:2]):
            x=(x1,transfer)[index];want=exact_value(key,x);ok=near(task.get('value'),want) and task.get('unit')==unit
            if not ok:errors.append('Actual task key/unit differs')
            taskChecks.append({'actualPrompt':task.get('prompt'),'input':x,'independentExact':str(want),'actualAnswer':task.get('value'),'actualWorked':task.get('worked'),'unit':unit,'ok':ok})
        out[key]={'ok':not errors,'errors':errors,'caseCount':len(cases),'clockExpected':None,'actualAssignedTasks':taskChecks}
    return out

def report():
    from .runtime_fingerprint import runtime_fingerprint
    if runtime_fingerprint(APP)['sha256']!=RUNTIME:raise ValueError('Unreviewed current runtime')
    raw=subprocess.check_output(['git','show',SOURCE_REF+':'+SOURCE_PATH],cwd=APP)
    if sha(raw)!=SOURCE_FILE_SHA256:raise ValueError('Source bytes differ')
    proofraw=(APP/PROOF).read_bytes()
    if sha(proofraw)!=PROOF_SHA256:raise ValueError('Collected consumer bytes differ')
    proof=json.loads(proofraw)
    if proof.get('protocolSha256')!=sha((APP/PROTOCOL).read_bytes()) or any(proof.get(k)!=RUNTIME for k in ['runtimeProfileBefore','runtimeProfileAfter']):raise ValueError('Protocol/epoch differs')
    exact=exact_checks();actual=compare_installed(proof)
    return {'phase':'SOURCE_AND_INSTALLED_CODE_PARTIAL_NOT_REGISTRABLE','runtimeSha256':RUNTIME,'sourceFileSha256':sha(raw),'proofSha256':sha(proofraw),
            'exactCheckCount':sum(map(len,exact.values())),'installedGridCount':sum(r['caseCount'] for r in actual.values()),
            'records':[{'id':key,'exactChecks':exact[key],'installedCode':actual[key],
                        'mathAndCodeOk':all(c['ok'] for c in exact[key]) and actual[key]['ok'],
                        'UI':'NOT_RUN','visualReview':'NOT_RUN','ok':False,'overallComplete':False,'activityCredit':0,
                        'humanApproval':'NOT_RUN','publicationAction':'NONE'} for key in SPECS],
            'acceptedCount':0,'activityCredit':0,'overallComplete':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
