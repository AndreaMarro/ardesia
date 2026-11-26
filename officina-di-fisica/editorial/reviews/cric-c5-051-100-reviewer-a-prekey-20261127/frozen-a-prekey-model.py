"""Distinct C5 B reviewer: exact source-prompt derivations before candidate keys.

Root's separately frozen source-only model is an immutable cross-check; the
physical functions below impose finite, real and exact domains before casts.
"""
from fractions import Fraction
import sympy as s
from . import cric_c5_051_100_root_review_models as source
R=s.Rational

def exact(*values):
    result=[]
    for value in values:
        if isinstance(value,bool)or not isinstance(value,(int,Fraction,s.Basic)):raise ValueError('Exact numerical object required before cast')
        value=R(value.numerator,value.denominator)if isinstance(value,Fraction)else s.Integer(value)if isinstance(value,int)else value
        if value.atoms(s.Float)or value.free_symbols or value.is_real is not True or value.is_finite is not True:raise ValueError('Finite real exact number required')
        result.append(value)
    return tuple(result)

def positive(*values):
    values=exact(*values)
    if any(v.is_positive is not True for v in values):raise ValueError('Positive physical parameter required')
    return values

def wave_length(speed,frequency):
    speed,frequency=positive(speed,frequency);return s.factor(speed/frequency)

def reflected_range(speed,roundtrip_time):
    speed,roundtrip_time=positive(speed,roundtrip_time);return speed*roundtrip_time/2

def field_intensity_ratio(field_factor):
    field_factor,=positive(field_factor);return field_factor**2

def photon_rate_ratio(frequency_factor):
    frequency_factor,=positive(frequency_factor);return 1/frequency_factor

def wavelength_index(vacuum_wavelength,medium_wavelength):
    vacuum_wavelength,medium_wavelength=positive(vacuum_wavelength,medium_wavelength);return vacuum_wavelength/medium_wavelength

def threshold_wavelength(energy_wavelength_constant,threshold):
    energy_wavelength_constant,threshold=positive(energy_wavelength_constant,threshold);return energy_wavelength_constant/threshold

def transmission_product(first,second):
    first,second=exact(first,second)
    if not(0<=first<=1 and 0<=second<=1):raise ValueError('Passive transmission fractions in [0,1] required')
    return first*second

def attenuation_slope(x0,y0,x1,y1):
    x0,y0,x1,y1=exact(x0,y0,x1,y1)
    if not(0<=x0<x1):raise ValueError('Increasing nonnegative thickness required')
    if not(y0<=0 and y1<=y0):raise ValueError('Nonincreasing logarithm of passive intensity fraction required')
    return -(y1-y0)/(x1-x0)

def optical_depth(coefficient,distance):
    coefficient,distance=exact(coefficient,distance)
    if coefficient<0 or distance<0:raise ValueError('Passive coefficient and distance nonnegative')
    return coefficient*distance

def photon_power(rate,photon_energy):
    rate,photon_energy=positive(rate,photon_energy);return rate*photon_energy

def alpha_daughter(mass,protons):
    mass,protons=positive(mass,protons)
    if mass.is_integer is not True or protons.is_integer is not True or protons<2 or mass-protons<2:raise ValueError('Integer nuclear bookkeeping with sufficient neutrons and protons')
    return {'A':mass-4,'Z':protons-2,'N':mass-protons-2}

def beta_plus_protons(protons,neutrons):
    protons,neutrons=exact(protons,neutrons)
    if protons.is_integer is not True or neutrons.is_integer is not True or protons<1 or neutrons<0:raise ValueError('Integer nuclear composition required')
    return protons-1

def half_life_from_assigned_log(assigned_log_two,decay_constant):
    assigned_log_two,decay_constant=positive(assigned_log_two,decay_constant);return assigned_log_two/decay_constant

def activity(decay_constant,population):
    decay_constant,population=positive(decay_constant,population);return decay_constant*population

def decayed_fraction(half_lives):
    half_lives,=exact(half_lives)
    if half_lives<0:raise ValueError('Elapsed half-life count nonnegative')
    return 1-2**(-half_lives)

def detector_activity(net_rate,efficiency):
    net_rate,efficiency=positive(net_rate,efficiency)
    if efficiency>1:raise ValueError('Detection efficiency at most one')
    return net_rate/efficiency

def equal_activity_population_ratio(first_decay,second_decay):
    first_decay,second_decay=positive(first_decay,second_decay);return second_decay/first_decay

def reflection_from_surface_angle(surface_angle):
    surface_angle,=exact(surface_angle)
    if not(0<=surface_angle<=90):raise ValueError('Physical surface angle')
    return 90-surface_angle

def refracted_index(first_index,incidence,radian_refraction):
    first_index,=positive(first_index);incidence,radian_refraction=exact(incidence,radian_refraction)
    if not(0<incidence<s.pi/2 and 0<radian_refraction<s.pi/2):raise ValueError('Nonzero interior ray angles required')
    return s.simplify(first_index*s.sin(incidence)/s.sin(radian_refraction))

def speed_index(vacuum_speed,medium_speed):
    vacuum_speed,medium_speed=positive(vacuum_speed,medium_speed);return vacuum_speed/medium_speed

def ray_segment_angle(incidence_degrees):
    incidence_degrees,=exact(incidence_degrees)
    if not(0<=incidence_degrees<=90):raise ValueError('Physical incidence angle')
    return 2*incidence_degrees

def reflected_rotation(mirror_rotation):
    mirror_rotation,=exact(mirror_rotation);return 2*abs(mirror_rotation)

def image_distance(focal,object_distance):
    focal,object_distance=positive(focal,object_distance)
    if object_distance==focal:raise ValueError('No finite image at focal plane')
    return focal*object_distance/(object_distance-focal)

def focal_length(object_distance,real_image_distance):
    object_distance,real_image_distance=positive(object_distance,real_image_distance);return object_distance*real_image_distance/(object_distance+real_image_distance)

def magnification(image_height,object_height):
    object_height,=positive(object_height);image_height,=exact(image_height);return image_height/object_height

def object_for_real_magnification(focal,m):
    focal,=positive(focal);m,=exact(m)
    if m>=0:raise ValueError('Real inverted image magnification must be negative')
    return focal*(1-1/m)

def physical_oracle():
    # Recomputed, not a keyed answer table. Values carry requested display units.
    result={52:wave_length(3*10**8,150*10**6),56:field_intensity_ratio(3),57:reflected_range(3*10**8,R(12,10**9)),59:wavelength_index(660,440),62:threshold_wavelength(1240,8),64:100*transmission_product(R(4,5),R(1,4)),65:attenuation_slope(0,0,3,-R(21,10)),66:100*(1-R(35,100)),67:optical_depth(2,R(3,10)),68:1000*photon_power(3*10**15,R(4,10**19)),72:alpha_daughter(210,84)['N'],73:beta_plus_protons(7,6),75:half_life_from_assigned_log(R(693,1000),R(231,1000)),76:activity(R(2,10**5),5*10**7)/1000,77:100*decayed_fraction(4),79:detector_activity(180,R(1,4)),80:equal_activity_population_ratio(2,1),81:reflection_from_surface_angle(25),84:refracted_index(1,s.pi/4,s.pi/6),85:speed_index(3*10**8,1875*10**5),87:s.Integer(50),89:ray_segment_angle(30),90:reflected_rotation(4),91:image_distance(8,16),94:focal_length(24,40),95:magnification(-30,12),98:object_for_real_magnification(10,-2)}
    other=source.numeric_outputs();assert len(result)==27
    for n,value in result.items():exact(value);assert s.simplify(value-other[f'C5-Q{n:03}'])==0
    # Countermodel calibrations independent of the frozen problem numbers.
    checks=[(wave_length(320,80),4),(reflected_range(330,R(2,5)),66),(attenuation_slope(1,-2,4,-5),1),(image_distance(6,18),9),(image_distance(6,3),-6),(focal_length(12,24),8),(object_for_real_magnification(4,-3),R(16,3)),(magnification(-14,4),-R(7,2)),(photon_rate_ratio(3),R(1,3))]
    assert all(s.simplify(got-want)==0 for got,want in checks)
    return result

def run_prekey_checks():
    outputs=physical_oracle();root=source.exact_checks();units=source.si_checks();rejected=0
    for invalid in [True,0.1,'1',s.Float('0.1'),s.I,s.oo,-s.oo,s.nan,s.Symbol('x')]:
        for call in [lambda:wave_length(invalid,1),lambda:image_distance(1,invalid),lambda:detector_activity(1,invalid),lambda:magnification(invalid,1)]:
            try:call()
            except ValueError:rejected+=1
            else:raise AssertionError('Exact/finite physical boundary did not reject')
    return {'scope':'REVIEWER_PREKEY_MODELS_NOT_CANDIDATE_APPROVAL','quantitativeResults':{str(n):str(v)for n,v in outputs.items()},'rootFrozenSymbolicIdentities':root['symbolicInvariants'],'pintPaths':len(units),'exactBoundaryRejections':rejected,'candidateExposure':'NONE','questionScientificCredit':0,'humanApproval':'NOT_RUN'}
