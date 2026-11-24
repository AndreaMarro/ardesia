"""Independent Cartesian-vector oracle, authored by the reviewer rather than author A."""
from fractions import Fraction
from pathlib import Path
import json
import pint
import sympy as sp

from .pipeline import canonical,digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS={f'AR-u1-vector-perpendicular-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={
  "AR-u1-vector-perpendicular-01": "de1dd99ab45f1e6610f826ea4f0df4ab42ae1b79c07ae0a1099c334598a88c4c",
  "AR-u1-vector-perpendicular-02": "9920d22edeabd89de903ef8aa721fb1e380f6370d70f45d25d7596ddb37ccc95",
  "AR-u1-vector-perpendicular-03": "fe45b6b42cc019bc7b0562634408d08b6720f1b48496a65e6bd62d514a0c6d7e",
  "AR-u1-vector-perpendicular-04": "790d508f500f7ba88ee31b7ef225595e2c8cb47f06e79557b880bfa435cbfef3",
  "AR-u1-vector-perpendicular-05": "dcbd5e03e073d2cf185b4b512ee1f49a1fff554a6d99deded8e44183c9b4b3f7",
  "AR-u1-vector-perpendicular-06": "1f9de58052c228f12d7cc754807e56a76219a94271191c1432f6bddf3dec05d0",
  "AR-u1-vector-perpendicular-07": "f8ffb481d27079b40e4a787f7074e04a414e82aaad43980ed878f44dd697c974",
  "AR-u1-vector-perpendicular-08": "1f231e8f7a6138bef47939fae0bfdae682c74f103744e2e5cbd51fd18f73152e",
  "AR-u1-vector-perpendicular-09": "0c1ff1dd427b4eac0472eaa512432fd8d5a7eeb5de85e197fbf5797a0259eeff",
  "AR-u1-vector-perpendicular-10": "40f65c6e6bfff30c30f7975927f799a6175913ee1d290cad4dcb002caceb3df7",
  "AR-u1-vector-perpendicular-11": "5af938394ac9ce0284ae0d30c3e21d86140054d9088b12d84cec9a9e6bf08d22",
  "AR-u1-vector-perpendicular-12": "801f65185b9c01c68bba843021cfa46645f6e266ac749c00b71f6ce60cd12ba1",
  "AR-u1-vector-perpendicular-13": "1b1f709228870ffe2151d51e4c8f283acc8b20316686b237c8406cd29ee81ae1",
  "AR-u1-vector-perpendicular-14": "e894066485af24c34e1d05ebe1cbc01c11bf2cb9c8ca286e2337d28f76957ae9",
  "AR-u1-vector-perpendicular-15": "87cc4957d6bf26731e992b2724a5b89d4727b85a410f149a04ff29581a55a172",
  "AR-u1-vector-perpendicular-16": "d8580973a194a75e9ebb8e5cf7d6d6d43c66e474fe2069ea117da62b19589ec0"
}


def norm(a,b):
    vector=sp.Matrix([sp.Rational(a),sp.Rational(b)])
    return sp.sqrt(vector.dot(vector))


def oracle():
    first=norm(3,4);second=norm(8,6)
    a,b,R,g,c=sp.symbols('a b R g c',positive=True)
    east=sp.solve(sp.Eq(5**2,a**2+4**2),a)[0]
    north=sp.solve(sp.Eq((2*first)**2,8**2+b**2),b)[0]
    calibration=sp.solve([sp.Eq(11,g*first+c),sp.Eq(21,g*second+c)],(g,c))
    recovered_R=(sp.Rational(43,3)-calibration[c])/calibration[g]
    recovered_east=sp.solve(sp.Eq(recovered_R**2,a**2+4**2),a)[0]
    constrained=sp.solve(sp.Eq(25,(sp.Rational(3,4)*b)**2+b**2),b)[0]
    length=SI.Quantity(3,'m')**2+SI.Quantity(4,'m')**2
    assert length.to('m**2').magnitude==25
    # Non-linearity counterexample: averaged vector has a different norm.
    assert norm(sp.Rational(11,2),5)==sp.sqrt(221)/2
    assert sp.sqrt(221)/2!=(first+second)/2
    return [first,'m','R=√(a²+b²)',f'R passa da 5 m a {norm(sp.Rational(16,3),4)} m',east,
      str(3+4-first)+' m',str(norm(3,sp.Rational(9,4))/first),'+5 m','a=√(R²−b²)',
      '√(κ₁²a²+κ₂²b²)/√(a²+b²)',second/first,str((first+second)/2)+' m',str(north/4),
      sp.sqrt((sp.Rational(30,sp.Rational(15,first)))**2-6**2),str(recovered_east)+' m',str(constrained)+' m']


MANUAL=['3²+4²=9+16=25; √25=5','√(m²)=m','Pitagora e radice positiva',
 '256/9+144/9=400/9; √(400/9)=20/3',
 '25−16=9; √9=3','3+4=7; 7−5=2',
 '144/16+81/16=225/16; (15/4)/5=3/4','10−5=+5',
 'sottrai b² e prendi la radice positiva, R>b>0',
 'eleva al quadrato l’intera componente; dividi i due moduli',
 '64+36=100; 10/5=2','(5+10)/2=15/2; √221/2 resta esatto e diverso da15/2',
 '2·5=10; √(100−64)=6; 6/4=3/2',
 '15/5=3; 30/3=10; √(100−36)=8',
 '10/5=2; c=1; (43/3−3/3)/2=20/3; √[(400−144)/9]=16/3',
 '9b²/16+b²=25b²/16; R=5b/4; b=4R/5=4']


def verify(package,bindings,asset_root=None):
    root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets';expected=oracle();results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,root):
        n=int(row['id'][-2:]);want=expected[n-1];got=row['answer']['value']
        try:ok=(got==want) if isinstance(want,str) else sp.Rational(str(got))==want
        except (ValueError,TypeError):ok=False
        if not ok:errors.append('Independent Cartesian norm/inverse result mismatch')
        unit='1' if n in (7,10,11,13) else 'm'
        if row['answer']['type']=='numeric' and row['answer']['unit']!=unit:errors.append('Independent result unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),
          'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},'manualArithmetic':MANUAL[n-1],
          'verificationMode':'AI_CONCEPTUAL' if n in (2,3,9,10) else 'EXACT_ORACLE',
          'methods':['independent_cartesian_vector_norm','exact_positive_branch_and_affine_solving',
                     'individual_statement_distractor_and_manual_review'],
          'physicalAssumptions':'Orthogonal axes; positive components and gain; requested positive roots; dimensionless count and offset; averages taken after each norm.',
          'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return results


def report(package,bindings):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'humanApproval':'NOT_RUN'}
