"""Independent SI oracle: no calls to another Ardesia numerical function."""
import sys, json, math, hashlib, subprocess, types
from pathlib import Path
from decimal import Decimal, localcontext
ROOT=Path.cwd();OUT=Path(__file__).resolve().parent;sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.models import StudyError
PIN='c762e30af0dbfb709a68468a71df16449e96c1b5'
source=(ROOT/'packages/engine/lessonos/study/activities.py').read_bytes()
m=types.ModuleType('lessonos.study._independent_si_activities');m.__package__='lessonos.study';exec(compile(source,'baseline-activities.py','exec'),m.__dict__)
D=lambda x:Decimal(str(x));PI=Decimal('3.141592653589793238462643383279502884197169399375105820974944592307816406286')
checks=[];rows=[]
def check(name,ok,**detail):checks.append(dict(name=name,pass_=bool(ok),**detail))
def q_si(r,dp,eta,length):return PI*r*r*r*r*dp/(D(8)*eta*length)
def p_si(r,q,eta,length):return D(8)*eta*length*q/(PI*r*r*r*r)
with localcontext() as ctx:
 ctx.prec=70
 r0=D(1)*D('0.001');L0=D(200)*D('0.001');eta0=D(1)*D('0.001');dp0=D(10);rho=D(1000)
 q0=q_si(r0,dp0,eta0,L0);v0=q0/(PI*r0*r0);re0=rho*v0*(D(2)*r0)/eta0
 initial={'radius_m':str(r0),'length_m':str(L0),'dynamicViscosity_Pa_s':str(eta0),'pressureDrop_Pa':str(dp0),'flow_m3_s':str(q0),'flow_uL_s':str(q0*D('1e9')),'meanSpeed_m_s':str(v0),'density_kg_m3':str(rho),'Reynolds':str(re0),'scope':'hypothetical Newtonian test fluid; input conversions are mm→m and mPa·s→Pa·s, not measured blood/water properties'}
 for radius in ['0.5','0.75','1','1.2','1.25','2']:
  for eta in ['0.5','1','2','4']:
   for length in ['0.5','1','2']:
    for boundary in ['pressure','flow']:
     r=r0*D(radius);e=eta0*D(eta);l=L0*D(length)
     expected=q_si(r,dp0,e,l)/q0 if boundary=='pressure' else p_si(r,q0,e,l)/dp0
     parameters={'radiusRatio':float(radius),'viscosity':float(eta),'length':float(length),'boundary':boundary}
     result=m.evaluate_activity('poiseuille-v1',parameters)
     row={'parameters':parameters,'expected_SI_ratio':str(expected),'actual':result['ratio'],'pass_':math.isclose(result['ratio'],float(expected),rel_tol=2e-14,abs_tol=1e-15)};rows.append(row)
 check('independent SI grid (144 cases)',all(x['pass_'] for x in rows),cases=len(rows))
 mandatory=[]
 for radius,boundary,eta,length,expected in [('2','pressure','1','1','16'),('2','flow','1','1','.0625'),('.5','flow','1','1','16'),('1','pressure','2','1','.5'),('1','pressure','1','2','.5'),('1','flow','2','3','6')]:
  actual=m.evaluate_activity('poiseuille-v1',{'radiusRatio':float(radius),'boundary':boundary,'viscosity':float(eta),'length':float(length)})['ratio'];mandatory.append({'radiusRatio':radius,'boundary':boundary,'etaRatio':eta,'lengthRatio':length,'expected':expected,'actual':actual,'pass_':math.isclose(actual,float(expected),rel_tol=1e-14)})
 check('six explicit mandatory radius/eta/length oracles',all(x['pass_'] for x in mandatory))
 # Integrating u(s)=Δp(r²-s²)/(4ηL) against the annular area: Simpson exact on cubic integrand.
 n=1024;h=float(r0)/n;f=lambda s:2*math.pi*s*float(dp0)*(float(r0)**2-s*s)/(4*float(eta0)*float(L0))
 integral=(h/3)*(f(0)+f(float(r0))+sum((4 if k%2 else 2)*f(k*h) for k in range(1,n)))
 check('SI reference also matches independent cross-section quadrature',math.isclose(integral,float(q0),rel_tol=2e-14),quadrature_m3_s=integral)
 # Unit exponents M,L,T: r⁴Δp/(ηL) -> L³/T.
 add=lambda a,b:tuple(x+y for x,y in zip(a,b));sub=lambda a,b:tuple(x-y for x,y in zip(a,b));dimensions=sub(add((0,4,0),(1,-1,-2)),add((1,-1,-1),(0,1,0)))
 check('dimensional Q exponent is (M0,L3,T-1)',dimensions==(0,3,-1),exponents=dimensions)
 bad=[]
 for key in ['radiusRatio','viscosity','length']:
  for val in [0,-1,True,None,'1',math.inf,-math.inf,math.nan,101]:
   try:m.evaluate_activity('poiseuille-v1',{key:val});bad.append({'key':key,'value':repr(val),'rejected':False})
   except StudyError as e:bad.append({'key':key,'value':repr(val),'rejected':True,'error':e.code})
 check('27 invalid numerical domain values rejected',all(x['rejected'] for x in bad))
 pack=json.loads((ROOT/'packages/engine/lessonos/study/content/relazioni-fluidi-v1.json').read_text());items={x['id']:x for x in pack['exercises']+[x for g in pack['transferTests'] for x in g['items']]}
 manifests=json.loads((ROOT/'packages/engine/lessonos/study/content/learning-experiences-v1.json').read_text());editorial=[]
 for variant in manifests['experiences']:
  for step in variant['steps']:
   s=items[step['exerciseRef']] if 'exerciseRef'in step else step;p=s['parameters'];r=r0*D(p['radiusRatio']);expected=q_si(r,dp0,eta0,L0)/q0 if p['boundary']=='pressure' else p_si(r,q0,eta0,L0)/dp0;actual=m.evaluate_activity(s['activityId'],p)['ratio'];answer=s.get('answer',{}).get('value');editorial.append({'variant':variant['id'],'step':step['id'],'exerciseRef':step.get('exerciseRef'),'parameters':p,'expected_SI_ratio':str(expected),'actual':actual,'coursePackAnswer':answer,'pass_':math.isclose(actual,float(expected),rel_tol=2e-14) and (answer is None or math.isclose(answer,float(expected),rel_tol=2e-14))})
 check('both editorial variants resolve real CoursePack refs and SI answers',len(editorial)==6 and all(x['pass_'] for x in editorial))
 output={'base':PIN,'runtime':sys.version,'activitySourceSha256':hashlib.sha256(source).hexdigest(),'checks':checks,'initial_SI_reference':initial,'mandatoryOracles':mandatory,'SIgrid':rows,'invalidInputs':bad,'editorialVariants':editorial,'humanApproval':'NOT_GRANTED_BY_THIS_AUTOMATED_REVIEW','limits':'steady fully developed laminar Newtonian incompressible fluid in uniform rigid circular horizontal tube; no slip and negligible entrance/gravity axial effects. Absolute starting values chosen independently; Ardesia returns dimensionless ratios and cannot certify Reynolds from ratios alone.'}
 (OUT/'scientific-final-oracle.json').write_text(json.dumps(output,ensure_ascii=False,indent=2,allow_nan=False)+'\n')
 print(json.dumps({'checks':checks,'initial':initial,'mandatory':mandatory,'editorial':editorial},ensure_ascii=False,indent=2,allow_nan=False))
 if any(not c['pass_'] for c in checks):sys.exit(1)
