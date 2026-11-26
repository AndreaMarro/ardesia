"""Individual prompt-only Cric mechanics models; no authoring or candidate imports."""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
PRIMARY_SHA256='1abe1f80465386a32abc613e31dc2d6c8fc41d4a8f24a2e77aea025e2773b3d1'
SOURCE_SHA256='0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf'
def exact(*values):
    if any(type(v)is bool or not isinstance(v,(int,Fraction,sp.Expr))for v in values):raise ValueError('Exact numeric data required before cast')
    result=tuple(map(sp.sympify,values))
    if any(v.is_number is not True or v.is_real is not True or v.is_finite is not True or v.has(sp.Float)for v in result):raise ValueError('Finite real exact data required')
    return result

def positive(*values):
    result=exact(*values)
    if any(v<=0 for v in result):raise ValueError('Positive finite data required')
    return result

def threshold_mu(force,normal):
    force,normal=positive(force,normal);return force/normal

def kinetic_deceleration(mu,g):
    mu,g=positive(mu,g);return mu*g

def gravity_ratio(mass_factor,distance_factor):
    mass_factor,distance_factor=positive(mass_factor,distance_factor);return mass_factor/distance_factor**2

def external_gravity(g0,radius_factor):
    g0,radius_factor=positive(g0,radius_factor)
    if radius_factor<1:raise ValueError('Outside sphere only')
    return g0/radius_factor**2

def spring_rest_length(total,force,k):
    total,force,k=positive(total,force,k);rest=total-force/k
    if rest<=0:raise ValueError('Positive rest length required')
    return rest

def hooke_component(k,x):
    k,=positive(k);x,=exact(x);return -k*x

def constant_force_work(force,distance,angle_degrees):
    force,distance=positive(force,distance);angle_degrees,=exact(angle_degrees)
    if not 0<=angle_degrees<=180:raise ValueError('Unsigned angle in0..180degrees required')
    return sp.simplify(force*distance*sp.cos(angle_degrees*sp.pi/180))

def linear_force_work(f0,f1,distance):
    f0,f1,distance=positive(f0,f1,distance);return (f0+f1)*distance/2

def kinetic_energy(mass,speed):
    mass,speed=positive(mass,speed);return mass*speed**2/2

def kinetic_final(initial,work1,work2):
    initial,=positive(initial);work1,work2=exact(work1,work2);result=initial+work1+work2
    if result<0:raise ValueError('Kinetic energy cannot be negative')
    return result

def instantaneous_power(force,speed):
    force,speed=positive(force,speed);return force*speed

def stopping_distance(mass,speed,resistance):
    mass,speed,resistance=positive(mass,speed,resistance);return kinetic_energy(mass,speed)/resistance

def potential_height(energy,mass,g):
    energy,mass,g=positive(energy,mass,g);return energy/(mass*g)

def spring_energy_rescale(old_energy,old_x,new_x):
    old_energy,old_x,new_x=positive(old_energy,old_x,new_x);return old_energy*(new_x/old_x)**2

def internal_gain(initial_block_k,final_block_k,delta_other_mechanical=0):
    initial_block_k,final_block_k=positive(initial_block_k,final_block_k);delta_other_mechanical,=exact(delta_other_mechanical)
    out=initial_block_k-final_block_k-delta_other_mechanical
    if out<0:raise ValueError('No negative internal gain in dissipative isolated model')
    return out

def ascent_speed(initial_speed,g,height):
    initial_speed,g,height=positive(initial_speed,g,height);square=initial_speed**2-2*g*height
    if square<0:raise ValueError('Unreachable height from this kinetic energy')
    return sp.sqrt(square)

def motor_work(mass,g,height,friction_work):
    mass,g,height=positive(mass,g,height);friction_work,=exact(friction_work)
    if friction_work>0:raise ValueError('Resistive friction work required')
    return mass*g*height-friction_work

def bottom_tension(mass,g,height,length):
    mass,g,length=positive(mass,g,length);height,=exact(height)
    if not 0<=height<=length:raise ValueError('Rest release with taut simple string requires0<=h<=L')
    return mass*g*(1+2*height/length)

def impulse_component(mass,initial_v,final_v):
    mass,=positive(mass);initial_v,final_v=exact(initial_v,final_v);return mass*(final_v-initial_v)

def recoil_velocity(m1,v1,m2):
    m1,m2=positive(m1,m2);v1,=exact(v1);return -m1*v1/m2

def captured_horizontal_velocity(m1,v1,m2):
    m1,m2=positive(m1,m2);v1,=exact(v1);return m1*v1/(m1+m2)

def final_momentum(initial,force,dt):
    initial,force=exact(initial,force);dt,=positive(dt);return initial+force*dt

def mean_force_vector(mass,initial,final,dt):
    mass,dt=positive(mass,dt)
    if len(initial)!=2 or len(final)!=2:raise ValueError('Two Cartesian components required')
    a=sp.Matrix(exact(*initial));b=sp.Matrix(exact(*final));return mass*(b-a)/dt

def center_of_mass(m1,x1,m2,x2):
    m1,m2=positive(m1,m2);x1,x2=exact(x1,x2);return (m1*x1+m2*x2)/(m1+m2)

def torque_magnitude(radius,force,angle):
    radius,force=positive(radius,force);angle,=exact(angle)
    if not 0<=angle<=180:raise ValueError('Unsigned angle in0..180degrees required')
    return sp.simplify(radius*force*sp.sin(angle*sp.pi/180))

def right_reaction(load,position,length):
    load,position,length=positive(load,position,length)
    if position>=length:raise ValueError('Load strictly between supports required')
    return load*position/length

def cm_acceleration(force,total_mass):
    force,=exact(force);total_mass,=positive(total_mass);return force/total_mass

def muscle_force_drop(moment,old_arm,new_arm):
    moment,old_arm,new_arm=positive(moment,old_arm,new_arm)
    if new_arm<=old_arm:raise ValueError('Increasing perpendicular arm required')
    return moment/old_arm-moment/new_arm

def primary_only_derivations():
    R=sp.Rational;k,x,Ki,m,g,h,L,p,b,F=sp.symbols('k x Ki m g h L p b F',positive=True)
    out={
51:threshold_mu(18,60),52:kinetic_deceleration(R(1,5),R(49,5)),53:'Static friction points right; it provides the only horizontal force for belt acceleration',54:gravity_ratio(4,2),55:external_gravity(8,2),56:100*spring_rest_length(R(14,100),6,200),57:k,58:'Kinetic/dynamic sliding friction',59:hooke_component(80,-R(25,1000)),60:2*k*x,
61:constant_force_work(16,5,60),62:'Tension radial and displacement tangent: instantaneous dot product0,work0',63:constant_force_work(8,6,180),64:linear_force_work(2,10,R(2,5)),65:4*Ki-Ki,66:kinetic_final(5,18,-6),67:instantaneous_power(25,R(4,5)),68:'Joule,J=N·m',69:sp.Integer(3),70:stopping_distance(4,3,6),
71:'Conservative closed-path work0; potential change0,force need not vanish',72:potential_height(3,R(1,5),10),73:spring_energy_rescale(R(4,5),2,5),74:'DeltaU unchanged under common zero shift; both U endpoints shift by same constant',75:{'if_other_mechanical_unchanged':internal_gain(20,7),'general':13-sp.Symbol('delta_other_mechanical'),'if_plane_gains3J':internal_gain(20,7,3)},76:'Same final speed for same drop from rest,not necessarily same time/direction',77:ascent_speed(5,10,R(4,5)),78:'Kinetic friction nonconservative; round-trip work negative for sliding on fixed plane',79:motor_work(3,10,2,-5),80:m*g*(1+2*h/L),
81:impulse_component(R(1,10),4,-3),82:R(1,2),83:recoil_velocity(4,3,6),84:captured_horizontal_velocity(R(3,2),2,R(1,2)),85:'For same nonzero momentum,K=p²/(2m),lighter body has greaterK',86:'Elastic collision',87:final_momentum(R(5,2),-3,R(3,5)),88:'Both balls form sufficient minimal system with conserved horizontal total momentum; individual not generally conserved; isolated supersets may also work',89:sp.sqrt(mean_force_vector(R(1,2),(2,0),(0,2),R(1,2)).dot(mean_force_vector(R(1,2),(2,0),(0,2),R(1,2)))),90:'Slope dp_x/dt is resultant external force component,positive constant in this closed-system model',
91:center_of_mass(1,0,3,R(4,5)),92:'Perpendicular distance to force line,b=r|sinθ|,moment modulusFb',93:torque_magnitude(R(2,5),15,30),94:'Force couple: netforce0,nonzero origin-independent moment; noCM acceleration,not necessarily noCM velocity',95:right_reaction(30,R(1,2),2),96:cm_acceleration(18,12),97:'Rigid body: all mutual distances constant; translation and rotation allowed',98:'Moment zero about every fixed pole because total force0 and moment0 about one',99:muscle_force_drop(6,R(3,100),R(4,100)),100:'Negative clockwise torque with positive counterclockwise'}
    expected={51:R(3,10),52:R(49,25),54:1,55:2,56:11,59:2,61:40,63:-48,64:R(12,5),66:17,67:20,69:3,70:3,72:R(3,2),73:5,77:3,79:65,81:-R(7,10),82:R(1,2),83:-2,84:R(3,2),87:R(7,10),89:2*sp.sqrt(2),91:R(3,5),93:3,95:R(15,2),96:R(3,2),99:50}
    assert len(out)==50 and set(out)==set(range(51,101))
    for number,want in expected.items():assert sp.simplify(out[number]-want)==0,number
    assert out[65]==3*Ki
    assert out[75]['if_other_mechanical_unchanged']==13 and out[75]['if_plane_gains3J']==10
    assert mean_force_vector(R(1,2),(2,0),(0,2),R(1,2))==sp.Matrix([-2,2])
    tau0,ax,ay,fx,fy=sp.symbols('tau0 ax ay fx fy');tauprime=tau0-(ax*fy-ay*fx);assert tauprime.subs({tau0:0,fx:0,fy:0})==0
    # Independent work integral and pendulum energy/radial combination.
    z=sp.Symbol('z');assert sp.integrate(2+8*z/R(2,5),(z,0,R(2,5)))==out[64]
    assert sp.solve(sp.Eq(sp.Symbol('T')-m*g,m*(2*g*h)/L),sp.Symbol('T'))[0].expand()==sp.expand(out[80])
    Q=SI.Quantity
    unitchecks=[(Q(18,'newton')/Q(60,'newton')).to('').magnitude==R(3,10),(Q(6,'newton')/Q(200,'newton/meter')).to('centimeter').magnitude==3,(Q(16,'newton')*Q(5,'meter')/2).to('joule').magnitude==40,(Q(25,'newton')*Q(Fraction(4,5),'meter/second')).to('watt').magnitude==20,(Q(3,'joule')/(Q(Fraction(1,5),'kg')*Q(10,'meter/second**2'))).to('meter').magnitude==Fraction(3,2),(Q(Fraction(-7,10),'kg*meter/second')).to('newton*second').magnitude==Fraction(-7,10),(Q(6,'newton*meter')/Q(3,'centimeter')).to('newton').magnitude==200,(Q(1,'kg*meter/second')/Q(1,'second')).to('newton').magnitude==1]
    assert all(unitchecks)
    return out,{'individualPromptCases':len(out),'numericExpectedCases':len(expected),'exactUnitChecks':len(unitchecks),'conditionalCase075Explicit':True,'noCandidateExposure':'NONE'}
