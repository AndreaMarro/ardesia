"""Independent C2 flow/continuity source and installed-code partial; no author imports."""
from fractions import Fraction as F
import sys,math
from . import experiments_C2_code_partial_review as boundary
GROUP='flow-continuity'
PROOF='editorial/reviews/C2-flow-continuity-installed-code-1a35-20261125.json'
PROOF_SHA256='a8713980edaf67d64ab06b6182ad569c2b719bc9c50d5946a4d5014067b751f0'
PRIMARY_PATH='editorial/reviews/experiments-C2-hydraulics-continuity-prompt-primary-20261125.json'
PRIMARY_SHA256='426d81e72ab795564c34f71a906cb863ada6f59e25a57cc3f8878e4335743068'
SPECS={
 'SIM-C2-L005-01':(0,12,1,2,6,7,'mL/s',2),
 'SIM-C2-L005-02':(0,5,.25,1,3,2.5,'kg/s',2),
 'SIM-C2-L005-03':(1,8,1,2,6,5,'cm/s',0),
 'SIM-C2-L005-04':(0,12,1,4,10,6,'cm/s',2),
 'SIM-C2-L005-05':(0,12,1,2,8,6,'mL/s',0)}
TASK_FORMAT={
 'SIM-C2-L005-01':('6 cm/s','7 cm/s'),'SIM-C2-L005-02':('3 L/s','2,5 L/s'),
 'SIM-C2-L005-03':('6 cm²','5 cm²'),'SIM-C2-L005-04':('10 cm/s','6 cm/s'),
 'SIM-C2-L005-05':('8 mL/s','6 mL/s')}
CLOCKS={
 'SIM-C2-L005-01':{'clockUnit':'s','unit':'cm','label':'Distanza alla velocità media','duration':6,'signal':True},
 'SIM-C2-L005-04':{'clockUnit':'s','unit':'cm','label':'Cammino a metà raggio','duration':5,'signal':True}}

def exact_value(key,x):
    if key not in SPECS:raise ValueError('Unknown ID')
    x=F(str(x));n=int(key[-2:])
    if n==1:return 4*x
    if n==2:return F(4,5)*x
    if n==3:
        if x<=0:raise ValueError('Positive section required')
        return 24/x
    if n==4:return x/2
    if n==5:return 12-x
    raise ValueError('Unknown ID')

def inverse_input(key,y):
    if key not in SPECS:raise ValueError('Unknown ID')
    y=F(str(y));n=int(key[-2:])
    if n==1:x=y/4
    elif n==2:x=F(5,4)*y
    elif n==3:
        if y<=0:raise ValueError('Fixed positive volume flow needs positive velocity')
        x=24/y
    elif n==4:x=2*y
    else:x=12-y
    lo,hi=SPECS[key][:2]
    if not F(str(lo))<=x<=F(str(hi)):raise ValueError('Inverse outside assigned control domain')
    return x

def clock_value(key,x,t):
    x,t=F(str(x)),F(str(t))
    if key.endswith('01'):return x*t
    if key.endswith('04'):return F(3,4)*x*t
    raise ValueError('No clock signal')

def secondary_value(key,x):
    return ('Portata in ingresso',12,'mL/s') if key=='SIM-C2-L005-05' else None

def exact_checks():
    import sympy as sp
    import pint
    si=pint.UnitRegistry(non_int_type=F);Q=si.Quantity
    v,A,r,R,peak,rho,flow=sp.symbols('v A r R peak rho flow',positive=True)
    out={k:[] for k in SPECS}
    def check(key,claim,left,right,unit=''):
        if isinstance(left,si.Quantity):left=left.to(unit).magnitude
        l,w=sp.sympify(left),sp.sympify(right);residual=sp.simplify(l-w)
        out[key].append({'claim':claim,'independentExact':str(l),'expected':str(w),'residual':str(residual),'unit':unit,'dimension':{str(k):str(v) for k,v in si.Unit(unit).dimensionality.items()},'ok':residual==0})
    triples=[(8,24,28),(F(4,5),F(12,5),2),(12,4,F(24,5)),(2,5,3),(10,4,6)]
    for (key,s),values in zip(SPECS.items(),triples):
        for label,x,w in zip(('reference','comparison_actual','transfer_actual'),s[3:6],values):check(key,label,exact_value(key,x),w,s[6])
        for x in s[3:6]:check(key,'independent inverse reconstructs control'+str(x),inverse_input(key,exact_value(key,x)),sp.Rational(str(x)))
    k='SIM-C2-L005-01'
    check(k,'swept volume rate',sp.diff(A*v*sp.Symbol('t'),sp.Symbol('t')),A*v,'m^3/s')
    check(k,'four square centimetres times7cm_per_s',Q(4,'cm^2')*Q(7,'cm/s'),28,'mL/s')
    check(k,'clock distance after6seconds at7',Q(7,'cm/s')*Q(6,'s'),42,'cm')
    k='SIM-C2-L005-02'
    check(k,'density0.8kg_per_L inSI',Q(F(4,5),'kg/L'),800,'kg/m^3')
    check(k,'mass out equals input under no accumulation',Q(F(4,5),'kg/L')*Q(F(5,2),'L/s'),2,'kg/s')
    k='SIM-C2-L005-03'
    check(k,'inverse continuity velocity',sp.solve(sp.Eq(A*v,24),v)[0],24/A,'cm/s')
    check(k,'actual area5cm2 with fixed24cm3_per_s',Q(24,'cm^3/s')/Q(5,'cm^2'),F(24,5),'cm/s')
    k='SIM-C2-L005-04'
    mean=sp.simplify(2/R**2*sp.integrate(peak*(1-r**2/R**2)*r,(r,0,R)))
    check(k,'area weighted parabolic mean',mean,peak/2,'cm/s')
    check(k,'local half-radius speed differs from mean',peak*(1-sp.Rational(1,2)**2),3*peak/4,'cm/s')
    check(k,'actual probe distance peak6 after5s',Q(F(3,4)*6,'cm/s')*Q(5,'s'),F(45,2),'cm')
    k='SIM-C2-L005-05'
    check(k,'node conservation sum',flow+(12-flow),12,'mL/s')
    check(k,'actual transfer split6plus6',Q(6,'mL/s')+Q(6,'mL/s'),12,'mL/s')
    return out

def geometry_errors(key,x,elements,t=None):
    errors=[];arrows=[e for e in elements if e.get('kind')=='arrow'];n=int(key[-2:]);x=F(str(x));near=boundary.near
    def periodic(actual,want,period):return -period/2-1e-10<=actual<=period/2+1e-10 and min(abs(actual-float(want)),abs(abs(actual-float(want))-period))<1e-9
    if n in (1,2,3):
        for arrow in arrows:
            if arrow['b'][0]<=arrow['a'][0] or any(not near(arrow['a'][i],arrow['b'][i]) for i in (1,2)):errors.append('Flow vector direction differs')
        if n==3:
            rings=[e for e in elements if e.get('kind')=='line' and len(e.get('points',[]))==57]
            if len(rings)!=6:errors.append('Section rings incomplete')
            else:
                radii=[max(p[1] for p in ring['points'])-min(p[1] for p in ring['points']) for ring in (rings[0],rings[-1])]
                if not near(radii[1]**2/radii[0]**2,x/4):errors.append('Area ratio does not match selected section')
                selected=[e for e in arrows if e.get('c') in (0x147979,0x7350b0)]
                if len(selected)!=2 or not near((selected[1]['b'][0]-selected[1]['a'][0])/(selected[0]['b'][0]-selected[0]['a'][0]),4/x):errors.append('Continuity velocity ratio differs')
        if n==1 and t is not None:
            tracers=[e for e in elements if e.get('kind')=='ball' and e.get('r')==.065]
            if len(tracers)!=6:errors.append('Six flow tracers missing')
            else:
                for i,ball in enumerate(tracers):
                    want=-F(47,20)+F(47,10)*((F(i,6)+x*F(str(t))/12)%1)
                    if not periodic(ball['p'][0],want,4.7):errors.append('Tracer does not follow assigned mean speed over12cm with wrapping')
    elif n==4:
        violet=[e for e in arrows if e.get('c')==0x7350b0]
        if x==0 and violet:errors.append('Zero profile has nonzero velocity arrows')
        if t is not None:
            marker=[e for e in elements if e.get('kind')=='ball' and e.get('c')==0xb94f48]
            want=-2+4*((F(4,25)+F(3,4)*x*F(str(t))/20)%1)
            if len(marker)!=1 or not near(marker[0]['p'][1],F(161,100)) or not periodic(marker[0]['p'][0],want,4):errors.append('Half-radius tracer does not follow local parabolic speed')
    elif n==5:
        branch=[e for e in arrows if near(abs(e['a'][2]),.9)]
        if not near(sum(e['b'][0]-e['a'][0] for e in branch),F(11,10)):errors.append('Branch output vectors do not sum to prescribed12flow scale')
        incoming=[e for e in arrows if e['a'][0]<-1.62 and e['b'][0]<=-1.62 and near(e['a'][2],0) and near(e['b'][2],0)]
        if not incoming:errors.append('SOURCE_ASSIGNED_COMPARISON_FAIL: incoming arrow requested by source is absent')
        elif len(incoming)!=1 or not near(incoming[0]['b'][0]-incoming[0]['a'][0],F(11,10)):errors.append('Incoming and summed branch flow vectors do not share the prescribed comparison scale')
    return errors

MANUAL={
 'SIM-C2-L005-01':'Q=4v in cm3/s=mL/s. Actual6→24 and7→28; divide by4 to invert. Clock x*t gives42cm at7cm/s after6s, not collected volume. Markers wrap every12cm.',
 'SIM-C2-L005-02':'Steady no storage/loss: mdot=rhoQ=(4/5)Q kg/s.3→12/5=2.4; actual2.5→2. Multiply4 then divide5. Local velocity changes do not alter mass balance.',
 'SIM-C2-L005-03':'Q24cm3/s, meanv=24/A. Actual6→4,5→24/5=4.8cm/s. Area1..8 excludes singular zero; inverseA=24/v requiresv3..24. Input area4,v6 give same24flow.',
 'SIM-C2-L005-04':'Full source explicitly assigns a parabolic circular profile. Annular area averaging givespeak/2; actual10→5 and6→3cm/s. Probe atR/2 instead moves3peak/4, giving22.5cm after5s atpeak6; mean and local speed are distinct.',
 'SIM-C2-L005-05':'Steady node12=Qupper+Qlower. Actual8→4,6→6mL/s. Range0..12 keeps both branches nonnegative. Scalar law/readout correct; source asks comparison with an incoming arrow absent in installed elements.'}
ASSUMPTIONS={k:'Steady incompressible fixed-density liquid, prescribed section means/flow rates and no accumulation or leakage unless the source explicitly describes local parabolic tracers. Control and clock domains are checked separately; diagram coordinates are not automatically calibrated physical lengths.' for k in SPECS}
PEDAGOGY={k:'All source fields and actual generated questions read against the frozen prompt-only primary (prior shared implementation exposure disclosed). Finite fraction/decimal arithmetic; no calculator required for assigned transfers. UI/rendering/grader submission not run. '+MANUAL[k] for k in SPECS}
def report():return boundary.report(sys.modules[__name__])
