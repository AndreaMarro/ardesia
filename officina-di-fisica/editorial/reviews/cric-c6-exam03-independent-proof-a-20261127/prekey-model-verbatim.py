"""Independent C6-Q075..105 source-only models; no options/keys/candidates.

Only mathematical parameters and the two permitted question-stimulus SVGs
inform these models. Earlier general C1-C5 physical knowledge is disclosed.
"""
from fractions import Fraction
import sympy as s
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C6.json'
IDS=tuple(f'C6-Q{i:03}'for i in range(75,106))
R=s.Rational

def exact(*xs):
    out=[]
    for x in xs:
        if isinstance(x,bool)or not isinstance(x,(int,Fraction,s.Basic)):raise ValueError('Exact numeric objects only, before casts')
        x=R(x.numerator,x.denominator)if isinstance(x,Fraction)else s.Integer(x)if isinstance(x,int)else x
        if x.atoms(s.Float)or x.free_symbols or x.is_finite is not True or x.is_real is not True:raise ValueError('Finite real exact numerical parameter required')
        out.append(x)
    return tuple(out)

def positive(*xs):
    xs=exact(*xs)
    if any(x.is_positive is not True for x in xs):raise ValueError('Positive parameter required')
    return xs

def conduction(k,area,delta_temperature,thickness):
    k,area,thickness=positive(k,area,thickness);delta_temperature,=exact(delta_temperature);return k*area*delta_temperature/thickness

def conduction_ratio(k,area,delta_temperature,thickness,stretch):
    stretch,=positive(stretch);old=conduction(k,area,delta_temperature,thickness)
    if old==0:raise ValueError('Zero heat flow does not define a ratio')
    return s.factor(conduction(k,area,delta_temperature,thickness*stretch)/old)

def millilitres_to_cubic_metres(volume):
    volume,=positive(volume);return volume/R(10)**6

def capacitance_geometry_ratio(area_factor,separation_factor):
    area_factor,separation_factor=positive(area_factor,separation_factor);return area_factor/separation_factor

def manometer_gas_excess(density,gravity,gas_depression):
    density,gravity,gas_depression=positive(density,gravity,gas_depression);return density*gravity*gas_depression

def double_reflected_direction(x,y):
    x,y=exact(x,y)
    if x*x+y*y==0:raise ValueError('Nonzero ray direction required')
    return s.Matrix([-x,-y])

def centre_of_mass(first_mass,second_mass,first_position,second_position):
    first_mass,second_mass=positive(first_mass,second_mass);first_position,second_position=exact(first_position,second_position)
    return s.factor((first_mass*first_position+second_mass*second_position)/(first_mass+second_mass))

def series_capacitor_charge(c1,c2,voltage):
    c1,c2,voltage=positive(c1,c2,voltage);return c1*c2*voltage/(c1+c2)

def emerged_percent(body_density,liquid_density):
    body_density,liquid_density=positive(body_density,liquid_density)
    if body_density>=liquid_density:raise ValueError('Partial floating branch required')
    return 100*(1-body_density/liquid_density)

def second_apparent_weight(first_mass,first_support,second_mass):
    first_mass,first_support,second_mass=positive(first_mass,first_support,second_mass);return second_mass*first_support/first_mass

def condensation_energy(mass,latent_heat):
    mass,latent_heat=positive(mass,latent_heat);return mass*latent_heat

def droplet_jump_ratio(first_radius,second_radius):
    first_radius,second_radius=positive(first_radius,second_radius);return first_radius/second_radius

def double_transmitted_percent(transmission):
    transmission,=positive(transmission)
    if transmission>1:raise ValueError('Passive transmission fraction exceeds one')
    return 100*transmission**2

def actual_static_friction(push,limit):
    push,limit=positive(push,limit)
    if push>limit:raise ValueError('Assigned rest requires sufficient available static friction')
    return push

def average_emf(turns,per_turn_flux_change,duration):
    turns,duration=positive(turns,duration);per_turn_flux_change,=exact(per_turn_flux_change)
    if turns.is_integer is not True:raise ValueError('Turn count integer required')
    return turns*abs(per_turn_flux_change)/duration

def work(force,distance,cosine):
    force,distance=positive(force,distance);cosine,=exact(cosine)
    if abs(cosine)>1:raise ValueError('Cosine outside its physical domain')
    return force*distance*cosine

def balanced_bridge(supply,outer_resistance,bridge_resistance):
    supply,=exact(supply);outer_resistance,bridge_resistance=positive(outer_resistance,bridge_resistance)
    m,n=s.symbols('m n',real=True)
    result=s.solve([(m-supply)/outer_resistance+m/outer_resistance+(m-n)/bridge_resistance,(n-supply)/outer_resistance+n/outer_resistance+(n-m)/bridge_resistance],(m,n))
    return s.factor((result[m]-result[n])/bridge_resistance),result

def quantitative():
    current,_=balanced_bridge(8,4,2)
    return {76:(millilitres_to_cubic_metres(250),'m^3'),77:(capacitance_geometry_ratio(3,2),'dimensionless'),78:(manometer_gas_excess(800,10,R(5,100)),'Pa'),79:(s.Integer(180),'degree'),80:(centre_of_mass(1,3,0,R(40,100)),'m'),82:(series_capacitor_charge(3,6,12),'microcoulomb'),83:(emerged_percent(750,1000),'percent'),85:(second_apparent_weight(4,48,6),'N'),86:(condensation_energy(R(4,1000),2*10**6),'J'),88:(droplet_jump_ratio(3,1),'dimensionless'),89:(double_transmitted_percent(R(7,10)),'percent'),90:(actual_static_friction(3,7),'N'),91:(average_emf(20,R(3,1000),R(1,10)),'V'),93:(work(10,2,-R(1,2)),'J'),95:(current,'A')}

CONCEPTUAL={75:'At fixed nonzero thermal gradient, double thickness halves Fourier power; if both face temperatures coincide, both powers are zero and ratio undefined.',81:'Ideal fixed amount isothermal: deltaU=0 and Q=W with W positive by gas, Q positive into gas.',84:'Same vacuum path and simultaneous emission: same arrival time, equal c, despite different photon frequencies.',87:'Positive charge initially at rest: straight uniformly accelerated classical motion along constant E, only within uniform nonrelativistic domain.',92:'Wetting capillary rise above reservoir, positive finite h=2gamma*cos(theta)/(rho*g*r), concave meniscus in usual wetting case.',94:'Alpha then beta-minus: total (deltaA,deltaZ)=(-4,-1); bookkeeping does not claim every isotope can energetically undergo sequence.',96:'Acceleration, derivative of the corresponding velocity component.',97:'Torricelli; upper residual pressure neglected only in ideal barometer model.',98:'Convection: thermal transport involving macroscopic fluid motion.',99:'Oersted or Orsted transliteration of Ørsted; magnetic effect of current.',100:'Ultraviolet, next higher frequency region beyond visible violet.',101:'Elastic potential energy, k*x^2/2 with reference zero at unstrained position.',102:'Laminar, not equivalent to inviscid or spatially uniform speed.',103:'Kelvin, K, absolute temperature unit.',104:'Capacitance, Q on one plate divided by positive potential difference, F=C/V.',105:'Doppler, changed received frequency due to radial relative motion; propagation model matters.'}

def symbolic_checks():
    k,A,d,stretch,T,n,Rg,V1,V2,gamma,r,rho,g=s.symbols('k A d stretch T n Rg V1 V2 gamma r rho g',positive=True);dt=s.symbols('dt',real=True,nonzero=True);x,y=s.symbols('x y',real=True);theta=s.symbols('theta',real=True);N=s.symbols('N',integer=True,positive=True);flux=s.symbols('flux',real=True)
    incoming=s.Matrix([x,y]);Rx=s.diag(-1,1);Ry=s.diag(1,-1);C1,C2,V=s.symbols('C1 C2 V',positive=True);q=C1*C2*V/(C1+C2)
    actual,bridge=balanced_bridge(8,4,2)
    return {'fourier_thickness':s.simplify((k*A*dt/(2*d))/(k*A*dt/d)-R(1,2))==0,'two_reflections_reverse_all_in_plane':Ry*Rx*incoming==-incoming,'isothermal_internal_energy':s.simplify(R(3,2)*n*Rg*T-R(3,2)*n*Rg*T)==0,'series_voltage_check':s.simplify(q/C1+q/C2-V)==0,'capillary_vertical_force':s.simplify(2*s.pi*r*gamma*s.cos(theta)-rho*g*s.pi*r*r*(2*gamma*s.cos(theta)/(rho*g*r)))==0,'bridge_current':actual==0 and set(bridge.values())=={s.Integer(4)},'alpha_beta_bookkeeping':s.Matrix([-4,-2])+s.Matrix([0,1])==s.Matrix([-4,-1]),'opposite_work_sign':s.simplify(10*2*(-R(1,2))+10)==0,'two_layers':s.simplify(R(7,10)*R(7,10)-R(49,100))==0,'faraday_sign_magnitude':average_emf(20,-R(3,1000),R(1,10))==R(3,5)}

def pint_checks():
    import pint
    u=pint.UnitRegistry(non_int_type=Fraction);Q=lambda n,unit:u.Quantity(Fraction(str(n)),unit)
    cases={76:(Q(250,'milliliter'),'m^3',Fraction(1,4000)),78:(Q(800,'kg/m^3')*Q(10,'m/s^2')*Q(5,'centimeter'),'pascal',Fraction(400)),80:((Q(1,'kg')*Q(0,'m')+Q(3,'kg')*Q(40,'centimeter'))/Q(4,'kg'),'m',Fraction(3,10)),82:(Q(3,'microfarad')*Q(6,'microfarad')/(Q(3,'microfarad')+Q(6,'microfarad'))*Q(12,'V'),'microcoulomb',Fraction(24)),85:(Q(6,'kg')*Q(48,'N')/Q(4,'kg'),'N',Fraction(72)),86:(Q(4,'g')*Q(2000000,'J/kg'),'J',Fraction(8000)),91:(20*Q(3,'milliweber')/Q('0.10','s'),'V',Fraction(3,5)),93:(Q(10,'N')*Q(2,'m')*Fraction(-1,2),'J',Fraction(-10)),95:(Q(0,'V')/Q(2,'ohm'),'A',Fraction(0))}
    out=[]
    for number,(value,unit,want)in cases.items():
        actual=value.to(unit).magnitude;assert isinstance(actual,Fraction)and actual==want;out.append({'id':f'C6-Q{number:03}','exactMagnitude':str(actual),'unit':unit,'ok':True})
    assert u.Unit('farad').dimensionality==u.Unit('coulomb/volt').dimensionality
    assert u.Unit('N/m') .dimensionality==u.Unit('J/m^2').dimensionality
    return out

def run_checks():
    rows=quantitative();expected={76:R(1,4000),77:R(3,2),78:400,79:180,80:R(3,10),82:24,83:25,85:72,86:8000,88:3,89:49,90:3,91:R(3,5),93:-10,95:0}
    for number,(value,unit)in rows.items():exact(value);assert s.simplify(value-expected[number])==0
    assert set(rows)|set(CONCEPTUAL)==set(range(75,106));identities=symbolic_checks();assert all(identities.values());rejected=0
    for invalid in [s.I,s.oo,-s.oo,s.nan,s.Float('0.1'),0.1,True,'1']:
        try:exact(invalid)
        except ValueError:rejected+=1
        else:raise AssertionError('Invalid numeric boundary accepted')
    domain_rejected=0
    for call in [lambda:conduction_ratio(1,1,0,1,2),lambda:emerged_percent(1000,1000),lambda:emerged_percent(1100,1000),lambda:double_transmitted_percent(2),lambda:actual_static_friction(8,7),lambda:average_emf(R(3,2),1,1),lambda:double_reflected_direction(0,0),lambda:work(1,1,2)]:
        try:call()
        except ValueError:domain_rejected+=1
        else:raise AssertionError('Invalid physical domain accepted')
    return {'scope':'SOURCE_ONLY_MODELS_NOT_CANDIDATE_APPROVAL','promptCount':31,'numericResults':{f'C6-Q{number:03}':{'exact':str(value),'unit':unit}for number,(value,unit)in rows.items()},'conceptualDerivations':len(CONCEPTUAL),'symbolicChecks':identities,'pintChecks':pint_checks(),'extraUnitIdentities':2,'invalidExactBoundaryRejected':rejected,'invalidPhysicalDomainRejected':domain_rejected,'candidateExposure':'NONE','humanApproval':'NOT_RUN','scientificQuestionCredit':0,'publicationAction':'NONE'}
