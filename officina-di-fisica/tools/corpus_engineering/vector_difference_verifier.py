"""Independent signed-coordinate solution of sixteen author-A candidates.

Read independently by the integrator, who did not author these candidates. No
authoring imports; source, candidate and geometric assets are frozen together.
"""
from fractions import Fraction
from pathlib import Path
import json

import pint
import sympy as sp

from .pipeline import canonical,digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS={f'AR-u1-vector-difference-{n:02}' for n in range(1,17)}
REVIEWED_CANDIDATES={
  "AR-u1-vector-difference-01": "ecdaa150967d749e71813fc91784e31afbecd929185d7b2ddfe5dd4ab8a85f8f",
  "AR-u1-vector-difference-02": "73328a7f6598eed775f91457e52cb4c21caf2d5f093e09c4f781eed67da3fbe0",
  "AR-u1-vector-difference-03": "726cfaad053bf72812c6a142a1c47d3585e40bced583738a7ce83223216ff631",
  "AR-u1-vector-difference-04": "fbc951ea2023d3762a9dba45581c35aa9389411a1dc01cb3be1703298d938a26",
  "AR-u1-vector-difference-05": "dc45280cd2d1e0a75efaf674b915d54d6af5345ae57ad4442867149e14d9daeb",
  "AR-u1-vector-difference-06": "fd8e1d4db241b3a2862f4f6df27d7ec9cfa9d5dd036edc6033e989638fd2fe0f",
  "AR-u1-vector-difference-07": "5f18021f7fe59852991c3957f345976a6e53e5dfc09d197030adde312d2481e9",
  "AR-u1-vector-difference-08": "422d46cd9ada13cb565bd8f841682477f2bd2ebf263b5526216c387b4e289cff",
  "AR-u1-vector-difference-09": "923a88430606cea82e0ebac2cb810a1752591ff0f56ee855ba64c688c98a06d9",
  "AR-u1-vector-difference-10": "4f8c8a18ff5efb24e26fab8e3b3b575f4cf18cd5f30e38c4a63062d47b4a4e2d",
  "AR-u1-vector-difference-11": "95aeec2ec4defec81697e946f05c4abbde72c2fc38b4aa0b49fe5efbe9eb5511",
  "AR-u1-vector-difference-12": "04772b2b90050a2119d89f8c2eb185710753d7fe3e435f9ebdce4a46eee3f9b1",
  "AR-u1-vector-difference-13": "b472695ca18b987a1d0d31aed19e303e6fa406e530197855237a8c0a884f1ed4",
  "AR-u1-vector-difference-14": "447d5016e6cac085e17dedea44a5b9e0a3d4534ee9852f87e83a8f2cd61fd5d2",
  "AR-u1-vector-difference-15": "56e2abed7c22fb75c2e08cbac5a52ab57c678760ad51b3c75833712f4b4c1836",
  "AR-u1-vector-difference-16": "99d1704d74d41fe2245d55a36d2098c0921343489470b3ad2be35fb370bb7c62"
}


def endpoint(*steps):
    position=Fraction(0)
    for step in steps:position+=Fraction(step)
    return abs(position)


def oracle():
    first=endpoint(4,-1);second=endpoint(6,-2)
    # Solve both gain and offset independently, not by trusting the stored answer.
    g,c,a=sp.symbols('g c a',real=True)
    calibration=sp.solve([sp.Eq(7,g*first+c),sp.Eq(9,g*second+c)],(g,c))
    recovered=sp.solve(sp.Eq(11,calibration[g]*(a-1)+calibration[c]),a)[0]
    b,d,k1,k2=sp.symbols('b d k1 k2',positive=True)
    # a=b+d proves the positive branch; vector norm reduces to d exactly.
    east=sp.Matrix([b+d,0]);west=sp.Matrix([-b,0])
    assert sp.simplify((east+west).norm()-d)==0
    D,A,B=sp.symbols('D A B',positive=True)
    assert sp.solve(sp.Eq(D,A-B),A)==[B+D]
    gap=sp.Symbol('gap',positive=True)
    new_vector=sp.Matrix([k2*b+gap,0])+sp.Matrix([-k2*b,0])
    physical_ratio=new_vector.norm()/(east+west).norm()
    proposed_ratio=(k1*(b+d)-k2*b)/d
    # Parametrize the entire positive new branch via its positive remaining gap.
    assert sp.simplify(proposed_ratio.subs(k1,(k2*b+gap)/(b+d))-physical_ratio)==0
    constrained=sp.solve(sp.Eq(3,4*b-b),b)[0]
    return [first,'m','D=a−b','Aumenta da 3 m a 5 m',first+1,4-first,
        str(Fraction(endpoint(4,-2),first)),'+3 m','a=D+b','(κ₁a−κ₂b)/(a−b)',
        str(Fraction(second,first)),str(Fraction(first+second,2))+' m',
        Fraction(6-Fraction(4,3)*first,1),Fraction(12, Fraction(9,first))+2,
        str(recovered)+' m',str(constrained)+' m']


MANUAL=['4−1=3; |3|=3','L−L=L e |L|=L: metro',
 'a−b>0 ⇒ |a−b|=a−b','4−1=3; 6−1=5',
 'a=3+1=4','b=4−3=1','(4−2)/(4−1)=2/3',
 '6−(4−1)=+3','D+b=a−b+b=a',
 'sostituisci separatamente κ₁a e κ₂b; dividi per a−b>0',
 '(6−2)/(4−1)=4/3','(3+4)/2=7/2',
 '(4/3)·3=4; 6−4=2; 2/1=2',
 '9/(4−1)=3; 12/3=4; a=4+2=6',
 '(9−7)/(4−3)=2; c=7−2·3=1; (11−1)/2+1=6',
 '4b−b=3b=3 m; b=1 m']


def verify(package,bindings,asset_root=None):
    asset_root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        n=int(row['id'][-2:]);want=expected[n-1];got=row['answer']['value']
        if isinstance(want,str):
            if got!=want:errors.append('Independent coordinate/concept key mismatch')
        else:
            try:
                if sp.Rational(str(got))!=sp.Rational(want):errors.append('Independent coordinate/calibration result mismatch')
            except (ValueError,TypeError):errors.append('Non-numeric exact result')
        dimensionless=n in (7,10,11,13)
        unit=SI.Unit('dimensionless' if dimensionless else 'm')
        if row['answer']['type']=='numeric' and row['answer']['unit']!=('1' if dimensionless else 'm'):
            errors.append('Requested result unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),
          'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in unit.dimensionality.items()},'manualArithmetic':MANUAL[n-1],
          'verificationMode':'AI_CONCEPTUAL' if n in (2,3,9,10) else 'EXACT_ORACLE',
          'methods':['independent_signed_coordinate_accumulation','exact_sympy_affine_and_constrained_solving',
                     'individual_statement_distractor_and_manual_path_reading'],
          'physicalAssumptions':'Collinear opposite directions; a>b>0 in both trials; gain in inverse metres and dimensionless count/offset; signed error order explicit.',
          'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return results


def report(package,bindings):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings),'verifierSha256':sha(Path(__file__).read_bytes()),
            'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'humanApproval':'NOT_RUN'}


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(__doc__);p.add_argument('--directory',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    args=p.parse_args();result=report(json.loads((args.directory/'vectors-difference-004.json').read_text()),json.loads((args.directory/'vectors-difference-004-bindings.json').read_text()))
    args.output.write_text(canonical(result)+'\n')
    print(canonical({'count':len(result['records']),'passed':sum(r['ok'] for r in result['records'])}))
    raise SystemExit(0 if all(r['ok'] for r in result['records']) else 1)
