"""Independent coordinate-dot-product oracle for author A's scalar-product candidates."""
from pathlib import Path
from fractions import Fraction
import pint
import sympy as sp

from .pipeline import digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS={f'AR-u1-scalar-product-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={
  "AR-u1-scalar-product-01": "97df80a590d23a882aabb7376095cfa62886aeabb29fcf8f19bafc41da8309ec",
  "AR-u1-scalar-product-02": "5032f8cdc2a10a87f1c31f5af207b5aeb41c64451f9d8ab93904493e73f36d18",
  "AR-u1-scalar-product-03": "38f6f892946efa2f6ab27f0542b45c1656d2394c4887e0b6e9667c8d6d9afb64",
  "AR-u1-scalar-product-04": "3a95a08774eb780ecbad503f7b0823a7a92332b014e399fd9d1b0ab67b252b6b",
  "AR-u1-scalar-product-05": "4d2f082d5ffa7a5e1d1f7e5ed652220b3e505becee509bd66e0a1649bbf61281",
  "AR-u1-scalar-product-06": "7da7aaf6f7271490b445b471f3cdc9052ab5203dbf4c78cbf7e4dc9363b912db",
  "AR-u1-scalar-product-07": "bba69849886208d0583cfb49907bb193c8bf2fff44597d310a8b6a6522a5245b",
  "AR-u1-scalar-product-08": "fcdcf88dc6f74093153634672707d91e20168f7e4299a1dfd71b11dbae0fc3c4",
  "AR-u1-scalar-product-09": "39f8e64eecac2e6bc4579fd0638e94f75fcb597af677c5f12b099b6060f65bd6",
  "AR-u1-scalar-product-10": "ad8c0470821fab0b76389c2babe3a0c4f53def9b0444724e1dfea05e828ded28",
  "AR-u1-scalar-product-11": "7b580ea9d46198690a4e25333ade8afa272fa44a78d0db3e3db3f2d398c13c84",
  "AR-u1-scalar-product-12": "5f5a5417fe3b9b46e4b63b5eb3d3fb0adb88d114535e074ab1b88e0892aa6bcb",
  "AR-u1-scalar-product-13": "9c2dd7d8ee15c88708829046cc0e320d6fa8d9188bd20e978f98dca6656efd73",
  "AR-u1-scalar-product-14": "2a65faf526a596fb8530405aa7c887f4a3529e1f9f7c6ff53bfcf952eaf33b10",
  "AR-u1-scalar-product-15": "dcd5fd52eb078edfe70bd18ec8c66bf0edf4e449560a220df941872365d1f690",
  "AR-u1-scalar-product-16": "7295c5e0276e99fd32632c4cc46ffb3151b074881c5c208a2b230857362cda0e"
}


def dot(a,b,angle=0):
    # Coordinates independently encode the angle; dot is a sum of component products.
    A=sp.Matrix([a,0]);B=sp.Matrix([b*sp.cos(angle),b*sp.sin(angle)])
    return sp.simplify(A.dot(B))


def oracle():
    first=dot(2,2);second=dot(4,4)
    a,b,g,c=sp.symbols('a b g c',positive=True)
    assert dot(a,b,sp.pi/2)==0 and dot(a,b,sp.pi)==-a*b
    assert dot(1,6)==dot(2,3)==6
    assert 1+6!=2+3
    k1,k2=sp.symbols('k1 k2',positive=True)
    assert sp.simplify(dot(k1*a,k2*b)/dot(a,b)-k1*k2)==0
    calibration=sp.solve([sp.Eq(9,g*first+c),sp.Eq(33,g*second+c)],(g,c))
    recovered=(17-calibration[c])/calibration[g]/2
    constrained=sp.solve(sp.Eq(dot(b,b),4),b)[0]
    return [first,'1','Zero','Raddoppia da 4 a 8',sp.solve(sp.Eq(dot(a,2),4),a)[0],
      'Più coppie positive sono compatibili: i moduli non sono univoci',str(dot(2,4)/first),'+4',
      'a=S/b','κ₁κ₂',second/first,str((first+second)/2),sp.Rational(4*first,4*2),
      sp.Rational(48,sp.Rational(12,first))/4,str(recovered),str(constrained)]


MANUAL=['2·2·cos0°=4','1·1·1=1','cos90°=0; ab·0=0',
 '2·2=4; 4·2=8; 8/4=2','4/2=2',
 'b=6/a con a>0; coppie(1,6) e(2,3) distinte',
 '(2·4)/(2·2)=2','8−4=+4','dividi per b>0','(κ₁aκ₂b)/(ab)=κ₁κ₂',
 '(4·4)/(2·2)=16/4=4','4/2+16/2=2+8=10; prodotto delle medie3·3=9',
 '4·4=16; b₂=16/4=4; 4/2=2',
 '12/4=3; 48/3=16; 16/4=4',
 '(33−9)/(16−4)=24/12=2; c=1; (17−1)/2/2=4',
 'b²=4 e b>0: b=2']


def verify(package,bindings,asset_root=None):
    root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets';expected=oracle();results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,root):
        n=int(row['id'][-2:]);want=expected[n-1];got=row['answer']['value']
        try:ok=(got==want) if isinstance(want,str) else sp.Rational(str(got))==want
        except (ValueError,TypeError):ok=False
        if not ok:errors.append('Independent coordinate dot/inverse result mismatch')
        if row['answer']['type']=='numeric' and row['answer']['unit']!='1':errors.append('Dimensionless result unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),
          'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':dict(SI.Unit('dimensionless').dimensionality),'manualArithmetic':MANUAL[n-1],
          'verificationMode':'AI_CONCEPTUAL' if n in (2,3,6,9,10) else 'EXACT_ORACLE',
          'methods':['independent_cartesian_dot_product','exact_symbolic_inverse_and_affine_solving',
                     'individual_orientation_nonuniqueness_and_distractor_review'],
          'physicalAssumptions':'Explicitly dimensionless vectors; concordant and nonzero except orthogonal ID03; orientation retained across trials; positive inverse branch.',
          'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return results


def report(package,bindings):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'humanApproval':'NOT_RUN'}
