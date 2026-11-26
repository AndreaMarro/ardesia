"""Source-stimulus-only exact derivations, frozen before C5 B candidates.

Preparation is not editorial approval. Q062 returns the threshold boundary,
not a multiple-choice answer. Numerical constants are the assigned data.
"""
from fractions import Fraction as F
import json
import sympy as s
import pint
R=s.Rational

def wavelength(c,frequency):return s.cancel(c/frequency)
def reflected_distance(c,elapsed):return s.cancel(c*elapsed/2)
def index_from_wavelengths(vacuum,material):return s.cancel(vacuum/material)
def transmission(a,b):return s.cancel(a*b)
def absorption_slope(x0,y0,x1,y1):return s.cancel(-(y1-y0)/(x1-x0))
def photon_power(rate,energy):return s.cancel(rate*energy)
def activity(decay_constant,nuclei):return s.cancel(decay_constant*nuclei)
def lens_image(f,p):return s.cancel(f*p/(p-f))
def lens_focal(p,q):return s.cancel(p*q/(p+q))
def object_from_magnification(f,m):return s.cancel(f*(1-1/m))
def alpha_daughter(A,Z):return {'A':A-4,'Z':Z-2,'N':A-Z-2}
def beta_plus_daughter(Z,N):return {'A':Z+N,'Z':Z-1,'N':N+1}

def numeric_outputs():
 return {
  'C5-Q052':wavelength(s.Integer(3)*10**8,s.Integer(150)*10**6),
  'C5-Q056':s.Integer(3)**2,
  'C5-Q057':reflected_distance(s.Integer(3)*10**8,R(12,10**9)),
  'C5-Q059':index_from_wavelengths(s.Integer(660),s.Integer(440)),
  'C5-Q062':R(1240)/8,
  'C5-Q064':100*transmission(R(80,100),R(25,100)),
  'C5-Q065':absorption_slope(s.Integer(0),s.Integer(0),s.Integer(3),-R(21,10)),
  'C5-Q066':100*(1-R(35,100)),
  'C5-Q067':s.Integer(2)*R(3,10),
  'C5-Q068':1000*photon_power(s.Integer(3)*10**15,R(4,10**19)),
  'C5-Q072':s.Integer(alpha_daughter(210,84)['N']),
  'C5-Q073':s.Integer(beta_plus_daughter(7,6)['Z']),
  'C5-Q075':R(693,1000)/R(231,1000),
  'C5-Q076':activity(R(2,10**5),s.Integer(5)*10**7)/1000,
  'C5-Q077':100*(1-R(1,2)**4),
  'C5-Q079':s.Integer(180)/R(1,4),
  'C5-Q080':R(1,2),
  'C5-Q081':s.Integer(90)-25,
  'C5-Q084':s.sin(s.pi/4)/s.sin(s.pi/6),
  'C5-Q085':s.Integer(3)/R(1875,1000),
  'C5-Q087':s.Integer(50),
  'C5-Q089':2*s.Integer(30),
  'C5-Q090':2*s.Integer(4),
  'C5-Q091':lens_image(s.Integer(8),s.Integer(16)),
  'C5-Q094':lens_focal(s.Integer(24),s.Integer(40)),
  'C5-Q095':-R(30,12),
  'C5-Q098':object_from_magnification(s.Integer(10),s.Integer(-2)),
 }

def exact_checks():
 got=numeric_outputs();expected=[2,9,R(9,5),R(3,2),155,20,R(7,10),65,R(3,5),R(6,5),124,6,3,1,R(375,4),720,R(1,2),65,s.sqrt(2),R(8,5),50,60,8,16,15,-R(5,2),15]
 assert len(got)==len(expected)==27
 for (key,value),wanted in zip(got.items(),expected):
  assert not value.atoms(s.Float),key
  assert s.simplify(value-wanted)==0,(key,value,wanted)
 f,p,q,m,c,nu,k,E,T1,T2,lam,N=s.symbols('f p q m c nu k E T1 T2 lam N',positive=True)
 identities={
  'wavelength_inverse':wavelength(c,nu)*nu-c,
  'roundtrip_inverse':2*reflected_distance(c,T1)/c-T1,
  'index_speed_inverse':(c/(c/k))-k,
  'intensity_triple':(k*(3*E)**2)/(k*E**2)-9,
  'equal_power_double_frequency':((T1/(s.Integer(2)*nu))/(T1/nu))-R(1,2),
  'filter_product_order':transmission(T1,T2)-transmission(T2,T1),
  'equal_activity_population':activity(2*lam,N/2)-activity(lam,N),
  'lens_identity':1/f-1/p-1/lens_image(f,p),
  'lens_inverse_focal':lens_focal(p,lens_image(f,p))-f,
  'magnification_inverse':-lens_image(f,object_from_magnification(f,-m))/object_from_magnification(f,-m)+m,
  'mixture_log_slope_derivative':s.diff(-s.log(T1*s.exp(-lam*p)+T2*s.exp(-N*p)),p)-(lam*T1*s.exp(-lam*p)+N*T2*s.exp(-N*p))/(T1*s.exp(-lam*p)+T2*s.exp(-N*p)),
 }
 for key,value in identities.items():assert s.simplify(value)==0,key
 assert alpha_daughter(210,84)=={'A':206,'Z':82,'N':124}
 assert beta_plus_daughter(7,6)=={'A':13,'Z':6,'N':7}
 return {'derivedNumericalQuantities':{k:str(v)for k,v in got.items()},'symbolicInvariants':len(identities),'q062Meaning':'155nm is a threshold boundary; strict exceedance lambda<155nm, not an answer choice','allOperationsExact':True}

def si_checks():
 u=pint.UnitRegistry(non_int_type=F);Q=u.Quantity
 checks={
  '052_lambda_m':((Q(3*10**8,'m/s')/Q(150*10**6,'1/s')).to('m'),F(2)),
  '057_distance_m':((Q(3*10**8,'m/s')*Q(F(12,10**9),'s')/2).to('m'),F(9,5)),
  '059_index':((Q(660,'nm')/Q(440,'nm')).to(''),F(3,2)),
  '062_threshold_nm':((Q(1240,'eV*nm')/Q(8,'eV')).to('nm'),F(155)),
  '065_mu_per_m':(Q(F(7,10),'1/cm').to('1/m'),F(70)),
  '067_mu_x':((Q(2,'1/cm')*Q(3,'mm')).to(''),F(3,5)),
  '068_power_mw':((Q(3*10**15,'1/s')*Q(F(4,10**19),'J')).to('mW'),F(6,5)),
  '075_half_life_h':((Q(F(693,1000),'')/Q(F(231,1000),'1/h')).to('h'),F(3)),
  '076_activity_kbq':((Q(F(2,10**5),'1/s')*Q(5*10**7,'')).to('kBq'),F(1)),
  '079_activity_bq':((Q(180,'1/s')/Q(F(1,4),'')).to('Bq'),F(720)),
  '085_index':((Q(3*10**8,'m/s')/Q(1875*10**5,'m/s')).to(''),F(8,5)),
  '091_image_cm':((Q(8,'cm')*Q(16,'cm')/(Q(16,'cm')-Q(8,'cm'))).to('cm'),F(16)),
  '094_f_cm':((Q(24,'cm')*Q(40,'cm')/(Q(24,'cm')+Q(40,'cm'))).to('cm'),F(15)),
  '095_magnification':((-Q(30,'mm')/Q(12,'mm')).to(''),-F(5,2)),
  '098_object_cm':((Q(10,'cm')*(1-F(1,-2))).to('cm'),F(15)),
 }
 for key,(actual,wanted)in checks.items():
  assert isinstance(actual.magnitude,(int,F))and actual.magnitude==wanted,(key,actual,wanted)
 return {key:{'magnitude':str(actual.magnitude),'unit':str(actual.units)}for key,(actual,_)in checks.items()}

if __name__=='__main__':
 print(json.dumps({'scope':'source-only mathematical preparation, no candidate approval','exact':exact_checks(),'si':si_checks(),'scientificCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2))
