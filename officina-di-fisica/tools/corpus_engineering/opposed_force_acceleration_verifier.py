"""Separate Newton-equation solution for sixteen individually read force tasks."""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest,sha,exact
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS={f'AR-u2-opposed-force-acceleration-{i:02}' for i in range(1,17)}
REVIEWED_CANDIDATES={
 "AR-u2-opposed-force-acceleration-01": "1be5079afa47a53e76d1f4b4f82c84db3c9c913edbbc9aed0e8966cc364203fa",
 "AR-u2-opposed-force-acceleration-02": "0686cf9fdafd380a6b10a5d93af6918a4681e6553b4c0cbdf2e2626dea654ccb",
 "AR-u2-opposed-force-acceleration-03": "47321cc75d071002c842861a4632e265199d417b5e4d7a03f04b7f57f895d0eb",
 "AR-u2-opposed-force-acceleration-04": "ba6a73fc15f33e45b716b95d710c1dbd7be7ee5766358d7ecbe5e9c14b75976c",
 "AR-u2-opposed-force-acceleration-05": "e56b2c6535aa2434f874a6eef9e5f2519e8a655798903f9099021e6a78a23b76",
 "AR-u2-opposed-force-acceleration-06": "63b28de767a6ff9c3feec4c91f59f876f012d7288327b339280bcee88f7892b1",
 "AR-u2-opposed-force-acceleration-07": "4938f5237d0eee6da25726ab9e8f18bf223042978b3bf02ff92fd9b68e74c436",
 "AR-u2-opposed-force-acceleration-08": "459e6205f5bd00ae471e14f07e26caa51551bd75255bf95acf6a77ad61c9c5d9",
 "AR-u2-opposed-force-acceleration-09": "f2dd9a9c13b96ebe24557f94ef34a4698838de2e12e31ab008a9e49410151de6",
 "AR-u2-opposed-force-acceleration-10": "edca9a54fface9a3842f67bb55a5974f1fbc750e9247f7361eeff64bb0d57216",
 "AR-u2-opposed-force-acceleration-11": "29dc4148496542febce79601b925994a43fb12067ccdc217d3e667a0119ef9c7",
 "AR-u2-opposed-force-acceleration-12": "b08ecf26816932a473a8eb11c9e3e52a3ce00d0c20d7788bc47ecefb4d7b49e9",
 "AR-u2-opposed-force-acceleration-13": "4710cbf56338fbdb2146a3defd74d0daa770d7dd732ff902f40486b137e17c57",
 "AR-u2-opposed-force-acceleration-14": "960cb3f11feef489379db86e108141f4a31955331439fb2c949fae996ae3eaa0",
 "AR-u2-opposed-force-acceleration-15": "8a920654681ae8fa41fce80b120bd2ee162ba627889540c0a360d064bcb44c35",
 "AR-u2-opposed-force-acceleration-16": "51915fd1df8030d62fff348079d78b33cde0a957fb9852b9bc1d64fc70775193"
}


def dynamics():
    F,R,M=sp.symbols('F R M',positive=True);A=sp.Symbol('A',real=True)
    # Sum vectors on ONE body: vertical normal and weight cancel; opposing
    # horizontal applied forces are not an action/reaction pair on two bodies.
    normal,weight=sp.symbols('normal weight',positive=True)
    resultant=sp.Matrix([F,normal])+sp.Matrix([-R,-weight])
    assert resultant.subs(normal,weight)==sp.Matrix([F-R,0])
    acceleration=sp.solve(sp.Eq(M*A,resultant[0]),A)[0]
    assert sp.solve(sp.Eq(M*A,F-R),F)==[A*M+R]
    assert sp.solve(sp.Eq(M*A,F-R),R)==[-A*M+F]
    return F,R,M,acceleration


def oracle():
    F,R,M,law=dynamics()
    base=law.subs({F:6,R:2,M:2});second=law.subs({F:10,R:4,M:2})
    inverseF=sp.solve(sp.Eq(law,base),F)[0]
    inverseR=sp.solve(sp.Eq(law,base),R)[0]
    target=sp.solve(sp.Eq(law.subs({M:2,F:10}),sp.Rational(3,2)*base),R)[0]
    q,c=sp.symbols('q c',real=True)
    cal=sp.solve([sp.Eq(5,q*base+c),sp.Eq(7,q*second+c)],(q,c))
    assert cal=={q:2,c:1}
    constrained=sp.solve(sp.Eq(law.subs({M:2,F:3*R}),2),R)
    assert constrained==[2]
    assert (SI.Quantity(2,'kg')*SI.Quantity(2,'m/s**2')).to('N').magnitude==4
    assert (SI.Quantity(3,'s**2/m')*SI.Quantity(2,'m/s**2')).to('').magnitude==6
    return [base,'m/s²','Agiscono su due corpi diversi','Da 2 a 4 m/s²',
      inverseF.subs({M:2,R:2}),inverseR.subs({M:2,F:6}),
      law.subs({F:6,R:4,M:2})/base,4-base,'F=MA+R',
      '(κ₁F−κ₂R)/(F−R)',second/base,(base+second)/2,target/2,
      2*(sp.Rational(9)/(6/base))+4,2*((9-cal[c])/cal[q])+2,constrained[0]]


UNITS={1:'m/s²',2:'m/s²',3:'1',4:'m/s²',5:'N',6:'N',7:'1',8:'m/s²',
 9:'N',10:'1',11:'1',12:'m/s²',13:'1',14:'N',15:'N',16:'N'}
MANUAL=['(6−2)/2=2m/s²','N/kg=(kg·m/s²)/kg=m/s²',
 'coppia di terza legge su destinatari diversi; sommare solo le forze sul carrello',
 '(6−2)/2=2;(10−2)/2=4m/s²','F=MA+R=2·2+2=6N','R=F−MA=6−2·2=2N',
 '[(6−4)/2]/[(6−2)/2]=1/2','4−(6−2)/2=+2m/s²','MA=F−R ⇒ F=MA+R',
 'cancellare M: (κ₁F−κ₂R)/(F−R), dominioκ₁F>κ₂R',
 '[(10−4)/2]/[(6−2)/2]=3/2','[(6−2)/2+(10−4)/2]/2=5/2m/s²',
 'A₂=(3/2)·2=3;R₂=10−2·3=4;R₂/R₁=4/2=2',
 'q=6/2=3s²/m;A=9/3=3m/s²;F=2·3+4=10N',
 'q=(7−5)/(3−2)=2s²/m;c=5−2·2=1;A=(9−1)/2=4;F=2·4+2=10N',
 'MA=3R−R=2R ⇒R=(2kg·2m/s²)/2=2N;F=6N']


def literal(value,unit):
    if isinstance(value,(int,float)):return exact(value)
    text=str(value).strip().replace('−','-')
    if unit!='1':
        suffix=' '+unit
        if not text.endswith(suffix):raise ValueError('Result unit missing')
        text=text[:-len(suffix)]
    return exact(text)


def verify(package,bindings,asset_root=None):
    root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();records=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,root):
        n=int(row['id'][-2:]);want=expected[n-1];unit=UNITS[n]
        try:ok=row['answer']['value']==want if isinstance(want,str) else sp.simplify(literal(row['answer']['value'],unit)-want)==0
        except (TypeError,ValueError,ZeroDivisionError):ok=False
        if not ok:errors.append('Independent one-body Newton solution mismatch')
        if row['answer']['type']=='numeric' and row['answer']['unit']!=unit:errors.append('Independent result unit mismatch')
        records.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),
          'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,
          'expectedExact':str(want),'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':'Inertial frame; constant positive mass2kg; only F right and R left on one block, F>R>0; balanced vertical forces; second trials must retain positive resultant; continuous dimensionless instrument readings.',
          'methods':['independent_vector_sum_on_selected_body','solve_newton_equation_and_inverse_constraints',
                     'individual_reading_of_original_candidate_distractors_algebra_and_scaled_SVG'],
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return records


def report(package,bindings):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings),
      'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
      'reviewer':'integrator_not_candidate_author','humanApproval':'NOT_RUN',
      'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__}}
