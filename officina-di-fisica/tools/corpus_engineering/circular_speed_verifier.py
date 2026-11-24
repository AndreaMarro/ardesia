"""Independent derivative-of-position oracle for author A's sixteen circular-speed tasks."""
from fractions import Fraction
from pathlib import Path
import re

import pint
import sympy as sp

from .pipeline import digest,sha,exact
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS={f'AR-u2-circular-speed-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={
  "AR-u2-circular-speed-01": "ff34ce637a22865f726d8c69e32c1ddf4a6413da24da448cb2111f23e4810a36",
  "AR-u2-circular-speed-02": "7de04596e27e88b6876f26d7efcb59eed0746ace7c0ce41034cdd61b3290baef",
  "AR-u2-circular-speed-03": "e6dcd44fdb7149d5ada87a699612dc1a55acadbc6148bdebae9d24cb3e876cf7",
  "AR-u2-circular-speed-04": "f8f48778c8744242cc48c65b110d09713977d7bfbb7d5570b05adfeec090b80f",
  "AR-u2-circular-speed-05": "e43a35569cdf6951a4f9267b29c39066e66a6de63cacbb75b6e02a8081aecef2",
  "AR-u2-circular-speed-06": "8acb785f18c3dded31d7b1b861a3eb16b90b6ddff95579a6648f3812cab84d7d",
  "AR-u2-circular-speed-07": "8f5f47d95f7f5e34d6291925ff329c0518631e93286d774111a5fd93030ce405",
  "AR-u2-circular-speed-08": "e6e0eb9d4159d7017a0a890339cafcf2b412f338c4594e03af57e2b4281d03d8",
  "AR-u2-circular-speed-09": "0678f9005b46516b3cc29b548e82edb5ea7285c2f3aae43c813a8304386ccf5f",
  "AR-u2-circular-speed-10": "fddf418532c8fea408272f268f8a4a63a7ed7c19f27f0643c85f4ea643aa9fd6",
  "AR-u2-circular-speed-11": "433b1f6834469ef48e50023cb59394e0d2c44f3c1540b3851970c7960cd7e897",
  "AR-u2-circular-speed-12": "a19012003a1ccfa79748b6d340981515115daaa513d69e2118783111bdabd064",
  "AR-u2-circular-speed-13": "68bbb74ee6c10fdf36fbe943acaf5559f7d0ded391e6f5c15bd935d8c164ae41",
  "AR-u2-circular-speed-14": "719e12cfb729495ca259f3f523fd75640dd80f7c7ad97ba2b483233115daf193",
  "AR-u2-circular-speed-15": "05986b9726a6775ac99ef86efa628f796e10b715933c10576e203d48b914c879",
  "AR-u2-circular-speed-16": "d787d2580db5ab85264a717eb64e9c73fdc6eef348971784bfd14fa5d669fb1c"
}


def geometry():
    r,T=sp.symbols('r T',positive=True);tau=sp.Symbol('tau',real=True)
    position=sp.Matrix([r*sp.cos(2*sp.pi*tau/T),r*sp.sin(2*sp.pi*tau/T)])
    velocity=position.diff(tau)
    speed_squared=sp.trigsimp(velocity.dot(velocity))
    speed=sp.sqrt(speed_squared)
    assert sp.simplify(speed-2*sp.pi*r/T)==0
    assert position.subs(tau,T)==position.subs(tau,0)
    assert sp.integrate(speed,(tau,0,T))==2*sp.pi*r
    k1,k2=sp.symbols('k1 k2',positive=True)
    assert sp.simplify(speed.subs({r:k1*r,T:k2*T},simultaneous=True)/speed-k1/k2)==0
    jac=sp.Matrix([r-T/sp.pi,speed-2]).jacobian([r,T]).subs(r,T/sp.pi)
    assert jac.rank()==1
    return r,T,speed


def oracle():
    r,T,law=geometry()
    first=sp.simplify(law.subs({r:1,T:sp.pi}));second=sp.simplify(law.subs({r:2,T:1}))
    g,c=sp.symbols('g c',real=True)
    calibration=sp.solve([sp.Eq(5,g*first+c),sp.Eq(1+8*sp.pi,g*second+c)],(g,c))
    assert calibration=={g:2,c:1}
    corrected=(9-calibration[c])/calibration[g]
    radius=sp.solve(sp.Eq(corrected,law.subs(T,sp.pi)),r)[0]
    V=sp.Symbol('V',positive=True)
    assert sp.solve(sp.Eq(V,law),r)==[T*V/(2*sp.pi)]
    # Gain has inverse-velocity dimension; the scale reading is dimensionless.
    assert (SI.Quantity(3,'s/m')*SI.Quantity(2,'m/s')).to('').magnitude==6
    return [first,'m/s','V=2πr/T','V passa da 2 a 4 m/s',
      sp.solve(sp.Eq(2,law.subs(T,sp.pi)),r)[0],
      sp.solve(sp.Eq(2,law.subs(r,1)),T)[0],
      sp.simplify(law.subs({r:1,T:2*sp.pi})/first),4-first,'r=VT/(2π)','κ₁/κ₂',
      second/first,(first+second)/2,sp.Rational(1)/sp.pi,
      sp.simplify((12*sp.pi/(6/first))*1/(2*sp.pi)),radius,'Infinite coppie positive']


UNITS={1:'m/s',2:'m/s',3:'m/s',4:'m/s',5:'m',6:'s',7:'1',8:'m/s',9:'m',10:'1',11:'1',12:'m/s',13:'1',14:'m',15:'m',16:'1'}
MANUAL=['(2π m)/(π s)=2 m/s','L/T: m/s','un giro misura2πr, poi dividere perT',
 '(2π·1)/π=2; (2π·2)/π=4','r=(2·π)/(2π)=1 m','T=2π/2=π s',
 '1/2: stesso giro nel doppio tempo','4−2=+2 m/s','moltiplicare perT e dividere per2π',
 'cancellare2πr/T nel rapporto:κ₁/κ₂','(4π)/2=2π','(2+4π)/2=1+2π',
 'T₂=(4π)/(4π)=1 s; T₂/T₁=1/π','g=6/2=3 s/m; V=12π/3=4π m/s; r=4π/(2π)=2 m',
 '(8π−4)/(4π−2)=2 s/m; c=1; V=(9−1)/2=4 m/s; r=(4π)/(2π)=2 m',
 'r=T/π ⇒ V=2π(T/π)/T=2 m/s per ogniT>0']


def literal_value(value,unit):
    if isinstance(value,(int,float)):return exact(value)
    text=str(value).strip().replace('−','-')
    if unit!='1':
        suffix=' '+unit
        if not text.endswith(suffix):raise ValueError('Requested result unit missing')
        text=text[:-len(suffix)]
    text=text.replace('π','pi')
    text=re.sub(r'(?<=\d)pi','*pi',text)
    return exact(text)


def verify(package,bindings,asset_root=None):
    root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets';expected=oracle();records=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,root):
        n=int(row['id'][-2:]);want=expected[n-1];unit=UNITS[n]
        try:
            ok=row['answer']['value']==want if isinstance(want,str) else sp.simplify(literal_value(row['answer']['value'],unit)-want)==0
        except (ValueError,TypeError,ZeroDivisionError):ok=False
        if not ok:errors.append('Independent circular-position derivative or inverse result mismatch')
        if row['answer']['type']=='numeric' and row['answer']['unit']!=unit:errors.append('Independent result unit mismatch')
        records.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),
          'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},'manualArithmetic':MANUAL[n-1],
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'physicalAssumptions':'Inertial frame, fixed positive radius and period within each uniform trial; exact pi; continuous dimensionless instrument scale; ID16 compares different constant-data trials.',
          'methods':['differentiate_cartesian_circular_position_and_take_norm','exact_sympy_inverse_affine_and_rank_checks',
                     'independent_reading_of_all_statements_distractors_units_and_figure_scales'],
          'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return records


def report(package,bindings):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings),'verifierSha256':sha(Path(__file__).read_bytes()),
            'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'humanApproval':'NOT_RUN',
            'reviewer':'integrator_not_candidate_author','dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__}}
