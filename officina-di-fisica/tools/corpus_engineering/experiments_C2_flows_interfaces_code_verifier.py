"""Independent source-first disclosed C2 models for four bounded code-only groups.

No authoring imports, no UI approval. Computation by a reviewer is kept distinct
from the hand calculations actually assigned to the learner.
"""
from fractions import Fraction as F
from functools import lru_cache
from types import SimpleNamespace
from pathlib import Path
import json,math
import sympy as sp
from . import experiments_C2_code_partial_review as boundary

PRIMARY_PATH='editorial/reviews/experiments-C2-flow-capillarity-prompt-primary-20261125.json'
PRIMARY_SHA256='d501eeb1dfc34ce8d75a4abf0d0ab2d629616d6c01893e06e0e5243232710a42'
PROOFS={
 'bernoulli':'fdb28b39fa32e029e1df5a80be29bc933f258ec390eeb6ec5dff07d59642679f',
 'viscosity-poiseuille':'6853835e01eaba1c69179d3c8f3210ef9f77239302d4d60612c36f840f033892',
 'networks':'a52f569301bebf6001be0b26889d023834388683e25fe95e59955c25e2603874',
 'capillarity':'cf5899fcbe7843d547458b5d16e580587dd144d9e8876c2995021950f0dcd6ad'}
SPECS={
 'SIM-C2-L006-01':(1,4,.25,1,3,2.5,'kPa',0),'SIM-C2-L006-02':(0,5,.25,2,4,2.5,'kPa',2),
 'SIM-C2-L006-03':(.5,2,.25,.5,2,1.25,'m/s',0),'SIM-C2-L006-04':(0,8,.5,0,6,4,'kPa',0),
 'SIM-C2-L007-01':(0,.6,.05,.1,.4,.3,'1',2),'SIM-C2-L007-02':(0,4,.25,1,3,2,'cm/s',1),
 'SIM-C2-L007-03':(.1,2,.1,.5,1.5,1.1,'Pa',2),'SIM-C2-L007-04':(1,8,1,2,4,6,'s⁻¹',0),
 'SIM-C2-L007-05':(0,1,.05,0,.5,.55,'cm/s',0),'SIM-C2-L008-01':(.5,2,.25,1,2,1.25,'1',2),
 'SIM-C2-L008-02':(1,4,1,1,4,3,'1',0),'SIM-C2-L008-03':(0,8,.5,2,5,4,'kPa',2),
 'SIM-C2-L008-04':(-20,20,5,-20,20,0,'1',2),
 'SIM-C2-L009-01':(1,8,1,2,6,5,'kPa·s/mL',2),'SIM-C2-L009-02':(1,8,1,2,6,5,'mL/s',0),
 'SIM-C2-L009-03':(1,8,1,2,6,5,'kPa',2),
 'SIM-C2-L010-01':(.5,5,.5,1,4,3,'mN',2),'SIM-C2-L010-02':(.5,4,.5,1,3,2.5,'mm⁻¹',0),
 'SIM-C2-L010-03':(0,180,5,0,120,90,'mm',0),'SIM-C2-L010-04':(0,2,.25,0,1,1.25,'Pa',2),
 'SIM-C2-L010-05':(1,8,1,2,5,6,'Pa',0)}
TASK_FORMAT=dict(zip(SPECS,[('3 m/s','2,5 m/s'),('4 m/s','2,5 m/s'),('2','1,25'),('6 kPa','4 kPa'),
 ('0,4 m/s','0,3 m/s'),('3 s','2 s'),('1,5 Pa·s','1,1 Pa·s'),('4 mm','6 mm'),('0,5','0,55'),
 ('2','1,25'),('Pressione doppia','Viscosità doppia'),('5 mL/s','4 mL/s'),('20 %','0 %'),
 ('6 kPa·s/mL','5 kPa·s/mL'),('6 kPa·s/mL','5 kPa·s/mL'),('6 kPa·s/mL','5 kPa·s/mL'),
 ('4 cm','3 cm'),('3 mm','2,5 mm'),('120 °','90 °'),('1 mm⁻¹','1,25 mm⁻¹'),('5 mm','6 mm')]))
CHOICES={'SIM-C2-L008-02':['Raggio doppio','Lunghezza doppia','Viscosità doppia','Pressione doppia']}
CLOCKS={
 'SIM-C2-L007-02':{'clockUnit':'s','duration':4,'input':True,'signal':False},
 'SIM-C2-L007-05':{'clockUnit':'s','duration':5,'unit':'cm','label':'Cammino alla sonda','signal':True}}

def number(value):
    if not isinstance(value,(int,float,F,sp.Expr)):raise ValueError('Exact finite real number required')
    value=sp.Rational(str(value)) if isinstance(value,(float,F)) else sp.sympify(value)
    if value.is_real is not True or value.is_finite is not True or value.is_number is not True:raise ValueError('Exact finite real number required')
    return value

@lru_cache(maxsize=10000)
def exact_value(key,x):
    if key not in SPECS:raise ValueError('Unknown source ID')
    x=number(x);lesson,n=key.split('-')[-2:];n=int(n)
    if lesson=='L006':
        if n==1:return sp.Rational(41,2)-x*x/2
        if n==2:return x*x/2
        if n==3:
            if x<=0:raise ValueError('Positive area ratio required')
            return 2/x
        return 15-x
    if lesson=='L007':
        if n==1:return 10000*x
        if n==2:return sp.Integer(6)
        if n==3:return 4*x
        if n==4:
            if x<=0:raise ValueError('Positive plate gap required')
            return 40/x
        if not 0<=x<=1:raise ValueError('Radial probe outside pipe')
        return 12*(1-x*x)
    if lesson=='L008':
        if n==1:
            if x<=0:raise ValueError('Positive radius required')
            return x**4
        if n==2:
            if x not in (1,2,3,4):raise ValueError('Unknown physical choice')
            return (sp.Integer(16),sp.Rational(1,2),sp.Rational(1,2),sp.Integer(2))[int(x)-1]
        if n==3:return 3*x
        if x<=-100:raise ValueError('Positive new radius required')
        return (1+x/100)**4
    if lesson=='L009':
        if x<=0:raise ValueError('Positive resistance required')
        return (2*x/(2+x),12/x,10*x/(2+x))[n-1]
    if n==1:return x
    if n==2:
        if x<=0:raise ValueError('Positive drop radius required')
        return 3/x
    if n==3:return 10*sp.cos(sp.pi*x/180)
    if n==4:return 100*x
    if x<=0:raise ValueError('Positive bubble radius required')
    return 200/x

def inverse_inputs(key,y):
    if key not in SPECS:raise ValueError('Unknown source ID')
    y=number(y);lesson,n=key.split('-')[-2:];n=int(n)
    if lesson=='L006':
        if n==1:values=[sp.sqrt(41-2*y)]
        elif n==2:values=[sp.sqrt(2*y)]
        elif n==3:
            if y==0:raise ValueError('Zero velocity incompatible with fixed flow')
            values=[2/y]
        else:values=[15-y]
    elif lesson=='L007':
        if n==1:values=[y/10000]
        elif n==2:raise ValueError('Stationary local velocity does not identify observation time')
        elif n==3:values=[y/4]
        elif n==4:
            if y==0:raise ValueError('Finite gap cannot produce zero prescribed gradient')
            values=[40/y]
        else:values=[sp.sqrt(1-y/12)]
    elif lesson=='L008':
        if n==1:values=[y**sp.Rational(1,4)]
        elif n==2:values=[sp.Integer(i) for i in range(1,5) if exact_value(key,i)==y]
        elif n==3:values=[y/3]
        else:values=[100*(y**sp.Rational(1,4)-1)]
    elif lesson=='L009':
        if n==1:
            if y==2:raise ValueError('Finite inverse resistance excludes asymptote')
            values=[2*y/(2-y)]
        elif n==2:
            if y==0:raise ValueError('Finite resistance with positive pressure cannot have zero flow')
            values=[12/y]
        else:
            if y==10:raise ValueError('Finite downstream resistance excludes inlet-pressure limit')
            values=[2*y/(10-y)]
    elif n==1:values=[y]
    elif n==2:
        if y==0:raise ValueError('Finite sphere radius excludes zero area per volume')
        values=[3/y]
    elif n==3:values=[180*sp.acos(y/10)/sp.pi]
    elif n==4:values=[y/100]
    else:
        if y==0:raise ValueError('Finite bubble excludes zero excess pressure')
        values=[200/y]
    lo,hi=SPECS[key][:2];valid=[]
    for x in values:
        x=sp.simplify(x)
        if x.is_real is True and x.is_finite is True and number(lo)<=x<=number(hi):valid.append(x)
    if not valid:raise ValueError('Inverse outside physical control domain')
    return tuple(valid)

def clock_value(key,x,t):
    if key!='SIM-C2-L007-05':raise ValueError('No independent clock signal')
    return 12*(1-number(x)**2)*number(t)

def secondary_value(key,x):
    x=number(x)
    return {
      'SIM-C2-L006-03':lambda:('Pressione locale meno iniziale',2*(1-1/x**2),'kPa'),
      'SIM-C2-L007-01':lambda:('Dominio','Profilo non previsto' if 10000*x>=2300 else 'Compatibile con il laminare',''),
      'SIM-C2-L007-05':lambda:('Velocità media di sezione',6,'cm/s'),
      'SIM-C2-L009-01':lambda:('Equivalente in serie',2+x,'kPa·s/mL'),
      'SIM-C2-L009-02':lambda:('Portata totale',12/x+4,'mL/s'),
      'SIM-C2-L010-05':lambda:('Una sola interfaccia',100/x,'Pa')}.get(key,lambda:None)()

@lru_cache(maxsize=1)
def all_exact_checks():
    import pint
    si=pint.UnitRegistry(non_int_type=F);Q=si.Quantity;out={k:[] for k in SPECS}
    def check(key,claim,left,right,unit=''):
        if isinstance(left,si.Quantity):left=left.to(unit).magnitude
        l,w=sp.sympify(left),sp.sympify(right);res=sp.simplify(l-w)
        out[key].append({'claim':claim,'independentExact':str(l),'expected':str(w),'residual':str(res),'unit':unit,'dimension':{str(k):str(v) for k,v in si.Unit(unit).dimensionality.items()},'ok':res==0})
    values=[(20,16,sp.Rational(139,8)),(2,8,sp.Rational(25,8)),(4,1,sp.Rational(8,5)),(15,9,11),
      (1000,4000,3000),(6,6,6),(2,6,sp.Rational(22,5)),(20,10,sp.Rational(20,3)),(12,9,sp.Rational(837,100)),
      (1,16,sp.Rational(625,256)),(16,2,sp.Rational(1,2)),(6,15,12),(sp.Rational(256,625),sp.Rational(1296,625),1),
      (1,sp.Rational(3,2),sp.Rational(10,7)),(6,2,sp.Rational(12,5)),(5,sp.Rational(15,2),sp.Rational(50,7)),
      (1,4,3),(3,1,sp.Rational(6,5)),(10,-5,0),(0,100,125),(100,40,sp.Rational(100,3))]
    unit_alias={'s⁻¹':'1/s','mm⁻¹':'1/mm','kPa·s/mL':'kPa*s/mL'}
    for (key,s),triple in zip(SPECS.items(),values):
        unit=unit_alias.get(s[6],s[6])
        for label,x,want in zip(('reference','comparison_actual','transfer_actual'),s[3:6],triple):
            check(key,label,exact_value(key,x),want,unit)
            if key!='SIM-C2-L007-02':
                possible=inverse_inputs(key,want);check(key,'physical inverse includes actual input'+str(x),int(any(sp.simplify(v-number(x))==0 for v in possible)),1)
    check('SIM-C2-L006-01','horizontal Bernoulli physical units',Q(20,'kPa')+Q(1000,'kg/m^3')/2*(Q(1,'m/s')**2-Q(F(5,2),'m/s')**2),sp.Rational(139,8),'kPa')
    check('SIM-C2-L006-02','Pitot stagnation excess units',Q(1000,'kg/m^3')*Q(F(5,2),'m/s')**2/2,sp.Rational(25,8),'kPa')
    check('SIM-C2-L006-03','continuity at area5over4',Q(2,'m/s')/F(5,4),sp.Rational(8,5),'m/s')
    check('SIM-C2-L006-04','dissipation pressure units',Q(15,'kPa')-Q(4,'kJ/m^3'),11,'kPa')
    check('SIM-C2-L007-01','Reynolds exact SI',Q(1000,'kg/m^3')*Q(F(3,10),'m/s')*Q(1,'cm')/Q(F(1,1000),'Pa*s'),3000,'1')
    check('SIM-C2-L007-02','stationary does not mean uniform',8*(1-sp.Rational(1,2)**2),6,'cm/s')
    check('SIM-C2-L007-03','Newtonian shear units',Q(F(11,10),'Pa*s')*Q(4,'1/s'),sp.Rational(22,5),'Pa')
    check('SIM-C2-L007-04','same millimetres cancel',Q(40,'mm/s')/Q(6,'mm'),sp.Rational(20,3),'1/s')
    rr,rad,peak=sp.symbols('rr rad peak',positive=True)
    check('SIM-C2-L007-05','annular area average',sp.simplify(2/rad**2*sp.integrate(peak*(1-rr**2/rad**2)*rr,(rr,0,rad))),peak/2,'cm/s')
    check('SIM-C2-L007-05','actual local clock distance',Q(F(837,100),'cm/s')*Q(5,'s'),sp.Rational(837,20),'cm')
    check('SIM-C2-L008-01','Poiseuille transfer fourth power',sp.Rational(5,4)**4,sp.Rational(625,256))
    check('SIM-C2-L008-02','radius-double vs viscosity-double mean speed ratio',4/sp.Rational(1,2),8)
    check('SIM-C2-L008-03','linear hydraulic resistance units',Q(3,'kPa*s/mL')*Q(4,'mL/s'),12,'kPa')
    check('SIM-C2-L008-04','asymmetric sensitivities exact',sp.Rational(6,5)**4-sp.Rational(4,5)**4,sp.Rational(1040,625))
    check('SIM-C2-L009-01','parallel reciprocal sum',1/(sp.Rational(1,2)+sp.Rational(1,5)),sp.Rational(10,7),'kPa*s/mL')
    check('SIM-C2-L009-02','upper branch flow units',Q(12,'kPa')/Q(5,'kPa*s/mL'),sp.Rational(12,5),'mL/s')
    check('SIM-C2-L009-03','downstream voltage-divider analogue',Q(10,'kPa')/Q(7,'kPa*s/mL')*Q(5,'kPa*s/mL'),sp.Rational(50,7),'kPa')
    check('SIM-C2-L010-01','two surface tension forces',2*Q(F(1,20),'N/m')*Q(3,'cm'),3,'mN')
    radius=sp.symbols('radius',positive=True)
    check('SIM-C2-L010-02','sphere surface to volume with pi cancellation',sp.cancel(4*sp.pi*radius**2/(4*sp.pi*radius**3/3)),3/radius,'1/mm')
    check('SIM-C2-L010-03','Jurin prefactor in millimetres',2*Q(F(1,20),'N/m')/(Q(1000,'kg/m^3')*Q(10,'m/s^2')*Q(1,'mm')),10,'mm')
    check('SIM-C2-L010-04','single spherical interface curvature conversion',2*Q(F(1,20),'N/m')*Q(F(5,4),'1/mm'),125,'Pa')
    check('SIM-C2-L010-05','soap bubble two interfaces',4*Q(F(1,20),'N/m')/Q(6,'mm'),sp.Rational(100,3),'Pa')
    for key,approx,exact,want in [('SIM-C2-L007-04',sp.Rational(667,100),sp.Rational(20,3),sp.Rational(1,2000)),
      ('SIM-C2-L008-01',sp.Rational(61,25),sp.Rational(625,256),sp.Rational(9,15625)),
      ('SIM-C2-L009-01',sp.Rational(143,100),sp.Rational(10,7),sp.Rational(1,1000)),
      ('SIM-C2-L009-03',sp.Rational(357,50),sp.Rational(50,7),sp.Rational(1,2500)),
      ('SIM-C2-L010-05',sp.Rational(3333,100),sp.Rational(100,3),sp.Rational(1,10000))]:
        check(key,'manual decimal relative-error bound (not a submitted UI answer)',abs(approx-exact)/abs(exact),want)
    return out

def geometry_errors(key,x,elements,t=None):
    errors=[];near=boundary.near;x=number(x);arrows=[e for e in elements if e.get('kind')=='arrow']
    if key=='SIM-C2-L006-02':
        glass=[e for e in elements if e.get('kind')=='rod' and near(e.get('r'),.09) and near(e['a'][0],1.4)]
        fill=[e for e in elements if e.get('kind')=='rod' and near(e.get('r'),.062) and near(e['a'][0],1.4)]
        if len(glass)!=1 or len(fill)!=1:errors.append('Pitot containing tube or liquid column missing')
        elif fill[0]['b'][1]>glass[0]['b'][1]+1e-10:errors.append('PITOT_COLUMN_CONTAINMENT_FAIL: liquid column extends above containing tube')
    if key in ('SIM-C2-L007-03','SIM-C2-L007-04'):
        plates=[e for e in elements if e.get('kind')=='box' and e.get('c')==0xd49332 and e.get('alpha')==1]
        upper=[e for e in arrows if e.get('c')==0x147979]
        if len(plates)!=1 or not upper:errors.append('Upper Couette plate or layer velocity missing')
        else:
            plate=plates[0];tip=max(upper,key=lambda e:e['a'][1])['b']
            if all(abs(tip[i]-plate['p'][i])<plate['size'][i]/2 for i in range(3)):errors.append('COUETTE_AXIS_TIP_INSIDE_OPAQUE_PLATE: full cone containment not asserted')
    if key=='SIM-C2-L007-01':
        violet=[e for e in arrows if e.get('c')==0x7350b0]
        warning=[e for e in elements if e.get('kind')=='label' and e.get('text')=='Profilo laminare fuori validità']
        if 10000*x>=2300 and (violet or not warning):errors.append('Laminar profile not withdrawn outside declared domain')
        if 0<x<sp.Rational(23,100) and not violet:errors.append('Valid positive laminar profile missing')
    if key in ('SIM-C2-L007-01','SIM-C2-L007-02','SIM-C2-L007-05'):
        violet=[e for e in arrows if e.get('c')==0x7350b0]
        if violet:
            centre=[e for e in violet if near(e['a'][1],sp.Rational(6,5))]
            halfway=[e for e in violet if near(e['a'][1],sp.Rational(161,100))]
            if len(centre)!=1 or len(halfway)!=1 or not near(math.dist(halfway[0]['a'],halfway[0]['b'])/math.dist(centre[0]['a'],centre[0]['b']),sp.Rational(3,4)):errors.append('Parabolic half-radius to centre velocity ratio differs')
    if key=='SIM-C2-L007-02':
        tracer=[e for e in elements if e.get('kind')=='ball' and e.get('c')==0xb94f48]
        want=-2+4*((F(4,25)+F(3,10)*F(str(x)))%1)
        if len(tracer)!=1 or not near(tracer[0]['p'][1],sp.Rational(161,100)):errors.append('Stationary half-radius probe missing')
        elif min(abs(tracer[0]['p'][0]-float(want)),abs(abs(tracer[0]['p'][0]-float(want))-4))>1e-9:errors.append('Stationary tracer not advected at6cm_per_s')
    if key=='SIM-C2-L007-05' and t is not None:
        tracer=[e for e in elements if e.get('kind')=='ball' and e.get('c')==0xb94f48]
        want=-2+4*((F(4,25)+F(3,5)*(1-F(str(x))**2)*F(str(t)))%1)
        if len(tracer)!=1 or not near(tracer[0]['p'][1],sp.Rational(6,5)+sp.Rational(41,50)*x):errors.append('Radial probe height differs')
        elif min(abs(tracer[0]['p'][0]-float(want)),abs(abs(tracer[0]['p'][0]-float(want))-4))>1e-9:errors.append('Tracer is not advected at local parabolic speed')
    if key.startswith('SIM-C2-L009'):
        purple=[e for e in arrows if e.get('c')==0x7350b0];green=[e for e in arrows if e.get('c')==0x147979]
        if key.endswith('01'):
            purple=[e for e in purple if e['a'][0]>0];green=[e for e in green if e['a'][0]>0]
            if len(purple)!=1 or len(green)!=1 or not near(math.dist(green[0]['a'],green[0]['b'])/math.dist(purple[0]['a'],purple[0]['b']),2/x):errors.append('Parallel branch resistance/flow ratio differs')
        elif key.endswith('02'):
            if len(purple)!=1 or len(green)!=1 or not near(math.dist(purple[0]['a'],purple[0]['b'])/math.dist(green[0]['a'],green[0]['b']),3/x):errors.append('Prescribed-pressure branch ratio differs')
    if key=='SIM-C2-L010-01':
        force=[e for e in arrows if e.get('c')==0x7350b0]
        if len(force)!=2 or any(e['b'][1]>=e['a'][1] for e in force) or not near(math.dist(force[0]['a'],force[0]['b']),math.dist(force[1]['a'],force[1]['b'])):errors.append('Two equal same-direction film forces missing')
    if key in ('SIM-C2-L010-02','SIM-C2-L010-05'):
        balls=[e for e in elements if e.get('kind')=='ball'];radial=[e for e in arrows if e.get('c')==0xd49332]
        if len(balls)!=1 or len(radial)!=1 or not near(math.dist(radial[0]['a'],radial[0]['b']),balls[0]['r']) or not all(near(a,b) for a,b in zip(radial[0]['a'],balls[0]['p'])):errors.append('Drawn radius is not from sphere centre to surface')
    if key=='SIM-C2-L010-03':
        height=exact_value(key,x);expected=sp.Rational(39,500)*height;violet=[e for e in arrows if e.get('c')==0x7350b0]
        if height==0:
            if violet:errors.append('Zero capillary height retains a nonzero arrow')
        elif len(violet)!=1 or not near(violet[0]['a'][1],sp.Rational(31,25)) or not near(violet[0]['b'][1]-violet[0]['a'][1],expected):errors.append('Capillary displacement sign/reference differs')
    if key=='SIM-C2-L010-04':
        profiles=[e for e in elements if e.get('kind')=='line' and len(e.get('points',[]))==25]
        if len(profiles)!=5:errors.append('Five spherical-interface profile lines missing')
        else:
            for line in profiles:
                for px,py,pz in line['points']:
                    if x==0:good=near(py,sp.Rational(23,20))
                    else:
                        radius=sp.Rational(18,5)/x;cy=sp.Rational(23,20)-radius
                        good=near(px*px+pz*pz+(py-float(cy))**2,radius**2)
                    if not good:errors.append('Interface is not declared planar limit or spherical curvature');break
    return errors

def cross_case_geometry_errors(key,row):
    if key!='SIM-C2-L008-02':return []
    cases={int(c['x']):c for c in row['cases']};lengths={}
    for choice in (1,3):
        found=[e for e in cases[choice]['elements'] if e.get('kind')=='arrow' and e.get('c')==0x147979]
        if len(found)!=1:return ['Poiseuille comparison velocity glyph missing']
        lengths[choice]=math.dist(found[0]['a'],found[0]['b'])
    if not boundary.near(lengths[1]/lengths[3],8):return ['POISEUILLE_COMPARISON_SCALE_FAIL: radius-double/viscosity-double speed ratio is6 instead of8; area-times-speed ratio24 instead of32']
    return []

_primary={r['id']:r for r in json.loads((boundary.APP/PRIMARY_PATH).read_text())['records']}
MANUAL={k:_primary[k]['independentDerivation']+'. '+_primary[k]['assumptionsAndManualProcedure'] for k in SPECS}
MANUAL['SIM-C2-L007-04']+=' Actual transfer gap6mm gives20/3s^-1; manual6.67 has relative error1/2000, within actual0.5% numeric rule; no form submitted.'
MANUAL['SIM-C2-L008-01']+=' Actual5/4 fourth gives625/256. Manual2.44 has error9/15625, within0.5%; decimal approximation is qualified by consumer.'
MANUAL['SIM-C2-L009-01']+=' ActualReq10/7; hand1.43 relative error1/1000, within0.5%; fractions not entered as Number syntax.'
MANUAL['SIM-C2-L009-03']+=' Actualnode50/7; hand7.14 relative error1/2500, within0.5%.'
MANUAL['SIM-C2-L010-03']+=' Actual transfer is90degrees, exact zero, not a nonnotable angle inferred from5degree grid.'
MANUAL['SIM-C2-L010-05']+=' Actual200/6=100/3Pa; hand33.33 relative error1/10000, within0.5%.'
ASSUMPTIONS={k:_primary[k]['assumptionsAndManualProcedure'] for k in SPECS}
ASSUMPTIONS['SIM-C2-L006-01']+=' Full-source audit adopts conventional model water density1000kg/m³ (explicit in00602); not a universally exact real-water density.'
ASSUMPTIONS['SIM-C2-L007-01']+=' Full-source model likewise uses conventional water density1000kg/m³.2300 is a conservative instructional regime cutoff, not a universal transition theorem.'
ASSUMPTIONS['SIM-C2-L007-02']+=' The full source formula supplies the parabolic half-radius profile; stationarity alone would not identify6cm/s. Its time inverse is deliberately unidentifiable.'
ASSUMPTIONS['SIM-C2-L007-04']+=' Full source explicitly states the plate profile is linear, resolving the conditional prompt-only gradient.'
PEDAGOGY={k:_primary[k]['adversarialInterpretation']+' Actual assigned inputs are checked literally against generated questions; reviewer symbolic/numerical grid calculations are not extra learner tasks. Native/fallback UI not run.' for k in SPECS}
PEDAGOGY['SIM-C2-L010-04']+=' Generic goccia legend talks about a radius, whereas this branch draws a spherical-cap curvature/pressure illustration; interpretation needs actual UI reading, not an invented radius measurement.'

def for_group(group):
    prefixes={'bernoulli':('L006',),'viscosity-poiseuille':('L007','L008'),'networks':('L009',),'capillarity':('L010',)}
    if group not in prefixes:raise ValueError('Unreviewed bounded group')
    specs={k:v for k,v in SPECS.items() if k.split('-')[-2] in prefixes[group]}
    return SimpleNamespace(__file__=__file__,GROUP=group,PROOF='editorial/reviews/C2-'+group+'-installed-code-1a35-20261125.json',PROOF_SHA256=PROOFS[group],
      PRIMARY_PATH=PRIMARY_PATH,PRIMARY_SHA256=PRIMARY_SHA256,SPECS=specs,TASK_FORMAT=TASK_FORMAT,CHOICES=CHOICES,CLOCKS=CLOCKS,
      exact_value=exact_value,clock_value=clock_value,secondary_value=secondary_value,geometry_errors=geometry_errors,cross_case_geometry_errors=cross_case_geometry_errors,
      exact_checks=lambda:{k:all_exact_checks()[k] for k in specs},MANUAL=MANUAL,ASSUMPTIONS=ASSUMPTIONS,PEDAGOGY=PEDAGOGY)

def report(group):return boundary.report(for_group(group))
