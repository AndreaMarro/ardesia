"""Root source-only C4 mathematics, frozen before B's C4 candidate exposure.

No original answer fields/options/solutions were read for this extraction.
A prior legacy-test exposure of Q091 is explicitly disclosed and separately
compensated by A; no claim of Root blindness for that ID. No candidate
authoring, importer or publication. Provided constants are model data.
"""
from fractions import Fraction
import sympy as s

SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C4.json'
IDS=tuple(f'C4-Q{i:03d}'for i in range(51,101))
R=s.Rational

def positive(x):
    x=s.factor(s.sympify(x))
    if x.is_positive is not True:raise ValueError('Positive finite physical parameter required')
    return x

def parallel_resistance(a,b):
    a,b=positive(a),positive(b)
    return s.factor(a*b/(a+b))

def parallel_unknown(equivalent,known):
    e,k=positive(equivalent),positive(known)
    if s.factor(k-e).is_positive is not True:raise ValueError('Passive parallel equivalent must be smaller than known resistance')
    return s.factor(e*k/(k-e))

def capacitor_series(a,b):
    a,b=positive(a),positive(b)
    return s.factor(a*b/(a+b))

def series_capacitor_unknown(equivalent,known):
    e,k=positive(equivalent),positive(known)
    if s.factor(k-e).is_positive is not True:raise ValueError('Series equivalent must be smaller than known capacitance')
    return s.factor(e*k/(k-e))

def capacitor_energy(capacitance,voltage):
    return s.factor(positive(capacitance)*s.sympify(voltage)**2/2)

def sharing_voltage(capacitances,voltages):
    if len(capacitances)!=len(voltages)or not capacitances:raise ValueError('Matched nonempty capacitor nodes required')
    cs=tuple(map(positive,capacitances));vs=tuple(map(s.sympify,voltages))
    return s.factor(sum(c*v for c,v in zip(cs,vs))/sum(cs))

def capacitance_ratio(a,b):
    a,b=positive(a),positive(b)
    return s.factor((a+b)/capacitor_series(a,b))

def flux(field,area,theta):return s.factor(s.sympify(field)*positive(area)*s.cos(theta))

def mean_emf(turns,phi_initial,phi_final,elapsed):
    return s.factor(-positive(turns)*(s.sympify(phi_final)-s.sympify(phi_initial))/positive(elapsed))

def lorentz_force(charge,velocity,field):
    return s.sympify(charge)*s.Matrix(velocity).cross(s.Matrix(field))

def quantitative():
    """Twenty-five explicitly requested numerical results, in requested units."""
    values={
      51:(9/(parallel_resistance(30,60)+10),'A'),
      54:(R(20,1000)**2*100*30,'J'),
      55:(parallel_unknown(4,12),'ohm'),
      58:((12-4)/(R(4,80)),'ohm'),
      60:(s.Integer(8)/4,'W'),
      61:(s.Integer(18)/(5-2),'microfarad'),
      64:(R('88.5')*R(1,1000)/R('8.85')*10000,'centimeter**2'),
      66:(capacitor_energy(5,4)-capacitor_energy(5,2),'microjoule'),
      68:(2*s.Integer(16),'microjoule'),
      70:(s.sqrt(2*s.Integer(100)/8),'V'),
      71:((2+3+5)*s.Integer(4),'microcoulomb'),
      74:(series_capacitor_unknown(3,9),'microfarad'),
      76:(capacitor_series(3+6,9),'microfarad'),
      78:(sharing_voltage([2,6],[8,4]),'V'),
      80:(capacitance_ratio(4,12),'dimensionless'),
      82:(R(2,10**6)/(400*R('0.50'))*10**9,'nanocoulomb'),
      84:(4*R('0.30')*R('0.20')*s.sin(s.pi/6),'N'),
      86:(1/(4*R('0.40')/1000),'Hz'),
      88:(s.Integer(0),'J'),
      90:(s.Integer(1200)/R('0.040'),'m/s'),
      91:(flux(R('0.30'),R('0.020'),s.pi/3)*1000,'milliweber'),
      94:(R('1.6')/80,'weber/second'),
      96:(abs(mean_emf(1,flux(R('0.50'),R('0.010'),0),flux(R('0.50'),R('0.010'),s.pi),R('0.10'))),'V'),
      98:(R('0.030')/5*1000,'millicoulomb'),
      100:(abs(mean_emf(1,0,R(8,1000),R(8,1000))),'V'),
    }
    return {f'C4-Q{k:03d}':{'value':s.simplify(value),'unit':unit}for k,(value,unit)in values.items()}

CONCEPTUAL={
 52:'At fixed nonzero voltage the smaller positive resistance dissipates more; at zero voltage both dissipate zero.',
 53:'nodo: connected ideal-wire endpoints form one equipotential conductor node.',
 56:'Remaining-branch current stays V/R; ideal terminal voltage and that resistance are unchanged.',
 57:'Joule: electrical energy becomes internal energy in the resistor.',
 59:'The two terminals of both resistors must connect to the same two nodes; drawing position is insufficient.',
 62:'At fixed nonzero charge, increasing plate distance lowers capacitance and increases voltage magnitude; at zero charge voltage stays zero.',
 63:'farad = coulomb/volt.',
 65:'Energy work integral uses V(q) with q horizontal: integral V dq. For constant C, the dual Q(V) triangle has the same numerical area; it is not automatically a false distractor.',
 67:'Potential difference remains fixed by the connected ideal voltage generator.',
 69:'Use the magnitude on one plate,7microcoulomb, not net capacitor charge0 or sum of magnitudes14.',
 72:'For nonzero common series charge, smaller capacitance supports larger voltage magnitude.',
 73:'Total algebraic electric charge of the isolated central node, initially zero, is conserved.',
 75:'Opposite equal initial node charges cancel; after the real dissipative transient the common voltage magnitude is zero.',
 77:'parallelo: same two nodes and hence the same voltage.',
 79:'Total stored energy halves; redistribution conserves node charge, not capacitor field energy alone.',
 81:'The wire contribution reverses direction when current reverses; equal magnitude follows if the current magnitude is held equal.',
 83:'antiparallela: cross product vanishes for parallel or opposite nonzero vectors.',
 85:'verso il basso for negative charge, using right/up/out-of-sheet axes.',
 87:'elica, with constant parallel speed and rotating perpendicular velocity in a uniform field.',
 89:'The +2e particle has half the radius, because r=p/(abs(q)*B) at equal momentum.',
 92:'zero induced emf for fixed flux; nonzero static flux is insufficient.',
 93:'Lenz: the induced response opposes the flux variation.',
 95:'oraria when viewed from the opposite side; the physical current itself is unchanged.',
 97:'Continuous conduction current around the whole open loop is absent; induced emf and transient/displacement phenomena are not thereby ruled out.',
 99:'antioraria from the stated front view: increasing into-sheet flux requires an induced out-of-sheet field.',
}

def symbolic_invariants():
    c,v,q=s.symbols('c v q',positive=True)
    a,b,x,y=s.symbols('a b x y',positive=True)
    energy_work=s.integrate(q/c,(q,0,c*v))
    energy_dual=s.integrate(c*v,(v,0,v))
    delta=s.factor(capacitor_energy(a,x)+capacitor_energy(b,y)-capacitor_energy(a+b,sharing_voltage([a,b],[x,y])))
    vx,vy,vz,bx,by,bz,charge=s.symbols('vx vy vz bx by bz charge',real=True)
    velocity=s.Matrix([vx,vy,vz]);field=s.Matrix([bx,by,bz])
    return {
      'capacitor_work_integral':s.simplify(energy_work-c*v**2/2)==0,
      'linear_dual_graph_same_area':s.simplify(energy_dual-c*v**2/2)==0,
      'node_sharing_energy_loss':s.simplify(delta-a*b*(x-y)**2/(2*(a+b)))==0,
      'opposite_identical_node_charges':sharing_voltage([c,c],[v,-v])==0,
      'magnetic_force_does_no_work':s.simplify(lorentz_force(charge,velocity,field).dot(velocity))==0,
      'negative_charge_right_velocity_into_field':lorentz_force(-1,[1,0,0],[0,0,-1])==s.Matrix([0,-1,0]),
      'parallel_resistor_inverse':s.simplify(parallel_unknown(parallel_resistance(a,b),a)-b)==0,
      'series_capacitor_inverse':s.simplify(series_capacitor_unknown(capacitor_series(a,b),a)-b)==0,
      'shared_voltage078_between_initials':s.Integer(4)<sharing_voltage([2,6],[8,4])<s.Integer(8),
      'charge_redistribution078_balances':2*(8-5)==6*(5-4),
      'field_energy079_ratio':s.simplify(capacitor_energy(2*c,v/2)/capacitor_energy(c,v))==R(1,2),
      'piecewise_emf100_full_interval':(s.Integer(2)*4+s.Integer(0)*4)/8==1,
    }

def pint_checks():
    """Fifteen independent SI unit/conversion paths, all Fraction magnitudes."""
    import pint
    u=pint.UnitRegistry(non_int_type=Fraction)
    def Q(n,unit):return u.Quantity(Fraction(str(n)),unit)
    half=Fraction(1,2);one=Q(1,'dimensionless')
    samples={
     51:(Q(9,'V')/(Q(30,'ohm')*Q(60,'ohm')/(Q(30,'ohm')+Q(60,'ohm'))+Q(10,'ohm')),'A'),
     54:(Q(20,'milliampere')**2*Q(100,'ohm')*Q(30,'second'),'J'),
     61:(Q(18,'microcoulomb')/Q(3,'V'),'microfarad'),
     64:(Q('88.5','picofarad')*Q(1,'millimeter')/Q('8.85','picofarad/meter'),'centimeter**2'),
     66:(half*Q(5,'microfarad')*(Q(4,'V')**2-Q(2,'V')**2),'microjoule'),
     70:(2*Q(100,'microjoule')/Q(8,'microfarad'),'V**2'),
     82:(Q(2,'micronewton')/(Q(400,'m/second')*Q('0.50','tesla')),'nanocoulomb'),
     84:(Q(4,'ampere')*Q('0.30','meter')*Q('0.20','tesla')*half,'N'),
     86:(one/(4*Q('0.40','millisecond')),'Hz'),
     90:(Q(1200,'V/meter')/Q('0.040','tesla'),'m/second'),
     91:(Q('0.30','tesla')*Q('0.020','meter**2')*half,'milliweber'),
     94:(Q('1.6','V')/80,'weber/second'),
     96:(2*Q('0.50','tesla')*Q('0.010','meter**2')/Q('0.10','second'),'V'),
     98:(Q('0.030','weber')/Q(5,'ohm'),'millicoulomb'),
     100:(Q(8,'milliweber')/Q(8,'millisecond'),'V'),
    }
    values=quantitative();out=[]
    for n,(quantity,unit)in samples.items():
        magnitude=quantity.to(unit).magnitude
        if not isinstance(magnitude,Fraction):raise TypeError('Unit arithmetic lost exact Fraction magnitude')
        expected=values[f'C4-Q{n:03d}']['value']**(2 if n==70 else 1)
        target=Fraction(int(s.numer(expected)),int(s.denom(expected)))
        assert magnitude==target,(n,magnitude,target)
        out.append({'id':f'C4-Q{n:03d}','unit':unit,'exactMagnitude':str(magnitude),'ok':True})
    return out

def run_checks():
    values=quantitative();assert len(values)==25 and len(CONCEPTUAL)==25
    assert set(values)|{f'C4-Q{k:03d}'for k in CONCEPTUAL}==set(IDS)
    assert all(not r['value'].atoms(s.Float)and r['value'].is_finite for r in values.values())
    invariants={k:bool(v)for k,v in symbolic_invariants().items()};assert all(invariants.values()),invariants
    units=pint_checks();assert len(units)==15
    return {'scope':'SOURCE_ONLY_MATHEMATICAL_PREPARATION_NOT_CANDIDATE_APPROVAL','individualSourcePrompts':50,'quantitativeResults':{k:{'exact':str(v['value']),'unit':v['unit']}for k,v in values.items()},'conceptualDerivations':len(CONCEPTUAL),'symbolicInvariants':invariants,'pintChecks':units,'candidateExposure':'NONE','originalKeyExposureExceptions':[{'id':'C4-Q091','context':'Earlier legacy editions-preservation test showed value3 before this assignment; all calculations here derived from prompt, independent A source-only compensation requested'}],'scientificQuestionCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
