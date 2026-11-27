"""Prompt-only C6-Q013..043 mathematics, before any C6 B candidate/key.

Stimulus Q032 is allowed as part of the source prompt. No source answer,
option, solution or authoring-module imports. Prior C1–C5 theory is disclosed.
"""
from fractions import Fraction
import sympy as s
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C6.json'
IDS=tuple(f'C6-Q{i:03}'for i in range(13,44))
R=s.Rational

def exact(*xs):
    out=[]
    for x in xs:
        if isinstance(x,bool)or not isinstance(x,(int,Fraction,s.Basic)):raise ValueError('Exact numeric object required before casts')
        x=s.Rational(x.numerator,x.denominator)if isinstance(x,Fraction)else s.Integer(x)if isinstance(x,int)else x
        if x.atoms(s.Float)or x.free_symbols or x.is_finite is not True or x.is_real is not True:raise ValueError('Finite real exact numerical value required')
        out.append(x)
    return tuple(out)

def positive(*xs):
    xs=exact(*xs)
    if any(x.is_positive is not True for x in xs):raise ValueError('Positive parameter required')
    return xs

def average_velocity(right,left,t_right,t_left):
    right,left,t_right,t_left=positive(right,left,t_right,t_left);return s.factor((right-left)/(t_right+t_left))

def internal_change(heat,work_on):
    heat,work_on=exact(heat,work_on);return heat+work_on

def perpendicular_force(a,b):
    a,b=positive(a,b);return s.sqrt(a*a+b*b)

def tether_upward_force(buoyancy,weight):
    buoyancy,weight=positive(buoyancy,weight);return weight-buoyancy

def parallel_series(standalone,first,second):
    standalone,first,second=positive(standalone,first,second);return s.factor(standalone*(first+second)/(standalone+first+second))

def half_life(initial,final,elapsed):
    initial,final,elapsed=positive(initial,final,elapsed)
    if initial<=final:raise ValueError('Decay observation requires smaller positive final activity')
    return s.simplify(elapsed*s.log(2)/s.log(initial/final))

def arrival_speed(gravity,height):
    gravity,height=positive(gravity,height);return s.sqrt(2*gravity*height)

def tendon_tension(weight,weight_arm,tendon_arm):
    weight,weight_arm,tendon_arm=positive(weight,weight_arm,tendon_arm);return weight*weight_arm/tendon_arm

def carnot(hot,cold):
    hot,cold=positive(hot,cold)
    if hot<cold:raise ValueError('Hot reservoir cannot be colder')
    return 1-cold/hot

def triangle_impulse(peak,duration):
    peak,duration=positive(peak,duration);return peak*duration/2

def mixing_temperature(first_capacity,second_capacity,first_temperature,second_temperature):
    first_capacity,second_capacity=positive(first_capacity,second_capacity);first_temperature,second_temperature=exact(first_temperature,second_temperature)
    return s.factor((first_capacity*first_temperature+second_capacity*second_temperature)/(first_capacity+second_capacity))

def quantitative():
    return {13:(average_velocity(12,4,3,1),'m/s'),15:(internal_change(60,25),'J'),18:(perpendicular_force(5,12),'N'),19:(tether_upward_force(9,6),'N_upward'),20:(parallel_series(6,3,3),'ohm'),22:(half_life(960,120,15),'hour'),23:(arrival_speed(10,R(9,5)),'m/s'),27:(tendon_tension(18,R(3,10),R(3,100)),'N'),28:(100*carnot(500,300),'percent'),32:(triangle_impulse(12,R(1,2)),'N*s'),33:(mixing_temperature(1,1,15,45),'degC')}

CONCEPTUAL={14:'Equal bottom pressures for same liquid, same depth and common atmospheric boundary; container shape changes wall forces, not rho*g*h.',16:'Potential changes +3eV and -3eV, equal magnitudes and opposite signs; field work has opposite sign.',17:'Destructive path differences 0.30m+n*0.60m, integer n>=0; no unique option guessed before seeing alternatives.',21:'Temperature stays at melting equilibrium while phase fractions change, at prescribed constant pressure.',24:'Total flow doubles for identical parallel capillaries at fixed pressure drop and unchanged linear laminar resistance.',25:'Frequency unchanged across stationary linear interface; speed, wavelength and intensity need not be unchanged.',26:'Total induced loop emf zero; uniform rigid translation leaves flux constant, without claiming every local force is zero.',29:'Static pressure falls as speed rises on the same streamline, horizontal ideal steady incompressible flow without work or loss.',30:'Isolated nonzero-charge capacitor field energy halves when C doubles; mechanical work can receive energy even without dissipation.',31:'Double photon energy in vacuum means half wavelength and double frequency, unchanged c.',34:'Extensive: disjoint material volumes add; not a claim of additive volumes in arbitrary mixtures.',35:'Relative/gauge/manometric pressure = absolute minus atmospheric, signed relative value may be negative.',36:'Ampere = coulomb per second.',37:'Angular frequency/pulsation in rad/s, omega=2pi*f.',38:'Isochoric/isovolumic, volume constant; only pV work vanishes.',39:'Young-Laplace for single-interface static liquid drop, pressure jump2gamma/r; not a two-interface soap bubble.',40:'Reaction: equal/opposite force acts on the other body, not a cancelling force on the first body.',41:'Dimensionless exponent mu*x, mu inverse length.',42:'Electric field vector=force divided by nonzero positive weak test charge, in N/C=V/m.',43:'Entropy, state function in J/K; reversible reference integral, not arbitrary actual Q/T.'}

def symbolic_checks():
    rho,g,h,patm=s.symbols('rho g h patm',positive=True);q,dv,C,V,Rh,dp=s.symbols('q dv C V Rh dp',positive=True);x,y,a,b=s.symbols('x y a b',real=True)
    n=s.symbols('n',integer=True,nonnegative=True);theta=2*s.pi*(n+s.Rational(1,2));vx,vy,vz,bx,by,bz=s.symbols('vx vy vz bx by bz',real=True)
    # Constant v cross B has zero line integral around any closed polygon.
    vec=s.Matrix([vx,vy,vz]).cross(s.Matrix([bx,by,bz]));closed=s.Matrix([1,0,0])+s.Matrix([0,2,0])+s.Matrix([-1,0,0])+s.Matrix([0,-2,0])
    return {'same_depth_pressure':s.simplify((patm+rho*g*h)-(patm+rho*g*h))==0,'opposite_charge_potential_changes':s.simplify(q*dv+(-q)*dv)==0,'destructive_path_family':s.simplify(s.cos(theta)+1)==0,'parallel_capillary_total_double':s.simplify((dp/Rh+dp/Rh)/(dp/Rh)-2)==0,'uniform_translation_closed_loop':s.simplify(vec.dot(closed))==0,'isolated_energy_half':s.simplify(q*q/(2*(2*C))/(q*q/(2*C))-s.Rational(1,2))==0,'photon_wavelength_half':s.simplify((1/(2*q))/(1/q)-s.Rational(1,2))==0,'equal_capacity_affine_average':s.simplify((C*x+C*y)/(2*C)-(x+y)/2)==0}

def pint_checks():
    import pint
    u=pint.UnitRegistry(non_int_type=Fraction);Q=lambda n,unit:u.Quantity(Fraction(str(n)),unit)
    cases={13:((Q(12,'m')-Q(4,'m'))/(Q(3,'s')+Q(1,'s')),'m/s',Fraction(2)),15:(Q(60,'J')+Q(25,'J'),'J',Fraction(85)),18:(Q(5,'N')**2+Q(12,'N')**2,'N**2',Fraction(169)),19:(Q(6,'N')-Q(9,'N'),'N',Fraction(-3)),20:(Q(6,'ohm')*(Q(3,'ohm')+Q(3,'ohm'))/(Q(6,'ohm')+Q(3,'ohm')+Q(3,'ohm')),'ohm',Fraction(3)),23:(2*Q(10,'m/s**2')*Q('1.8','m'),'m**2/s**2',Fraction(36)),27:(Q(18,'N')*Q(30,'cm')/Q(3,'cm'),'N',Fraction(180)),32:(Q(12,'N')*Q('0.50','s')/2,'kg*m/s',Fraction(3))}
    out=[]
    for n,(quantity,unit,want)in cases.items():
        value=quantity.to(unit).magnitude;assert isinstance(value,Fraction)and value==want;(out.append({'id':f'C6-Q{n:03}','exactMagnitude':str(value),'unit':unit,'ok':True}))
    assert u.Unit('coulomb/second').dimensionality==u.Unit('ampere').dimensionality
    assert u.Unit('N/C').dimensionality==u.Unit('V/m').dimensionality
    return out

def run_checks():
    rows=quantitative();expected={13:2,15:85,18:13,19:-3,20:3,22:5,23:6,27:180,28:40,32:3,33:30}
    for n,(v,unit)in rows.items():exact(v);assert s.simplify(v-expected[n])==0
    identities=symbolic_checks();assert all(identities.values());assert set(rows)|set(CONCEPTUAL)==set(range(13,44));bad_rejected=0
    for value in[s.oo,-s.oo,s.nan,s.I,s.Float('0.1'),0.1,True,'2']:
        try:exact(value)
        except ValueError:bad_rejected+=1
        else:raise AssertionError('Invalid source-only parameter accepted')
    return {'scope':'SOURCE_ONLY_MODELS_NOT_CANDIDATE_APPROVAL','promptCount':31,'numericResults':{f'C6-Q{k:03}':{'exact':str(v),'unit':unit}for k,(v,unit)in rows.items()},'conceptualDerivations':len(CONCEPTUAL),'symbolicChecks':identities,'pintChecks':pint_checks(),'extraUnitIdentities':2,'invalidExactBoundaryRejected':bad_rejected,'candidateExposure':'NONE','humanApproval':'NOT_RUN','scientificQuestionCredit':0,'publicationAction':'NONE'}
