"""Independent inertial-frame Newton solution; no authoring imports."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha,exact
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
EXPECTED_IDS={f'AR-u2-elevator-apparent-weight-{i:02}' for i in range(1,17)}
REVIEWED_CANDIDATES={
 "AR-u2-elevator-apparent-weight-01": "0fabd590f1b5e6459f61fc26a6c2293b915353cadd1573181daa4311d72263b6",
 "AR-u2-elevator-apparent-weight-02": "5b6d293e3f2b4bc1a1ce27c346adc1d01a17631cc2af2bc8925ea37269071ec7",
 "AR-u2-elevator-apparent-weight-03": "4eece4fee89dbde6fa96fb5344129ca8537294e185c2a9e3ee57d10740c6521b",
 "AR-u2-elevator-apparent-weight-04": "4f446dbe36182132e239be780c5054b4856b08aeb76885cd450ce12e80cbc25e",
 "AR-u2-elevator-apparent-weight-05": "66704a3408b91f367a382d8bd2d870f1437486d15132c4d85516c5ae56dfb19f",
 "AR-u2-elevator-apparent-weight-06": "21f3c8ad541652a7a873964a37121407a1045ad8262c74c9783080be7ed7ba32",
 "AR-u2-elevator-apparent-weight-07": "29d4c87433f84a78840cf675f68e2ec0989d2dc5576953823c20a24222ce756d",
 "AR-u2-elevator-apparent-weight-08": "783194d65b749e931e54ea5fa531814651d9da68ee36d2d19283c1baaf99645c",
 "AR-u2-elevator-apparent-weight-09": "50bca1157799bc9f4a600dcf2f83a67c998cd9442c2995ff001e63e9da4b32a4",
 "AR-u2-elevator-apparent-weight-10": "d1740432703e170f30d6bb5f4f543773a1be6c3a51ebdc5b6bd42ec5a68ed50f",
 "AR-u2-elevator-apparent-weight-11": "cef57740c666ad53dfa352e3d9d1e57ec9904cead42a682b0aef46d45e1299a2",
 "AR-u2-elevator-apparent-weight-12": "5add1548294b7f6ff71007d2e9794469665293273d9c22c8b75f5860f0584084",
 "AR-u2-elevator-apparent-weight-13": "e1b2da7ed9c5a75bf7c3ac9aaaee834947a8d20440eec528d398d2b0e5269c03",
 "AR-u2-elevator-apparent-weight-14": "1cd7fa7dd7dea1460c6677b8742734a886113cc793bec559ff0b67a1c119d5f2",
 "AR-u2-elevator-apparent-weight-15": "40a515dc8cb7b58f9aca2a54d628d0f55a0d007e37b91386aa3afe777e8618ca",
 "AR-u2-elevator-apparent-weight-16": "0ae1a754a721c1751ec25a3ce89203ffe61c7c431f3fcdc804078346371c18fc"
}


def model():
    m,a,g=sp.symbols('m a g',positive=True);N=sp.Symbol('N',real=True)
    law=sp.solve(sp.Eq(N-m*g,m*a),N)[0]
    assert sp.simplify(law-m*g-m*a)==0
    return m,a,g,law


def oracle():
    m,a,g,law=model();N=sp.Symbol('N',positive=True)
    base=law.subs({m:40,a:2,g:10});second=law.subs({m:60,a:4,g:10})
    inverse_m=sp.solve(sp.Eq(N,law),m)[0]
    inverse_a=sp.solve(sp.Eq(N,law),a)[0]
    k1,k2=sp.symbols('k1 k2',positive=True)
    ratio=sp.simplify(law.subs({m:k1*m,a:k2*a},simultaneous=True)/law)
    assert sp.simplify(ratio-k1*(g+k2*a)/(g+a))==0
    gain,offset=sp.symbols('gain offset',real=True)
    calibration=sp.solve([sp.Eq(961,gain*base+offset),sp.Eq(1681,gain*second+offset)],(gain,offset))
    assert calibration=={gain:2,offset:1}
    x=sp.Symbol('x',real=True)
    roots=sp.solve(sp.Eq(20*x*(10+x),480),x)
    assert roots==[-12,2]
    assert [r for r in roots if r>0]==[2]
    assert (SI.Quantity(40,'kg')*SI.Quantity(12,'m/s**2')).to('N').magnitude==480
    assert (SI.Quantity(2,'1/N')*SI.Quantity(480,'N')).to('').magnitude==960
    return [base,'N','N=m(g+a)','Da 480 a 720 N',
      inverse_m.subs({N:480,g:10,a:2}),inverse_a.subs({N:480,g:10,m:40}),
      law.subs({m:40,a:4,g:10})/base,960-base,'m=N/(g+a)',
      'κ₁(g+κ₂a)/(g+a)',second/base,(base+second)/2,
      (sp.Rational(7,4)*base/60-10)/2,
      (sp.Rational(2520)/(1440/base))/(10+4),
      ((1441-calibration[offset])/calibration[gain])/(10+2),roots[1]]


UNITS={1:'N',2:'N',3:'N',4:'N',5:'kg',6:'m/s²',7:'1',8:'N',9:'kg',10:'1',11:'1',12:'N',13:'1',14:'kg',15:'kg',16:'m/s²'}
MANUAL=['40·(10+2)=40·12=480N','forzaN=kg·m/s²',
 'N−mg=ma ⇒N=m(g+a), senza forza fittizia nel riferimento inerziale',
 '40·12=480N;60·12=720N','480/(10+2)=480/12=40kg','480/40−10=12−10=2m/s²',
 '(40·14)/(40·12)=14/12=7/6','960−480=+480N','dividere per tutta la somma g+a>0',
 'N₂/N₁=κ₁m(g+κ₂a)/[m(g+a)]=κ₁(g+κ₂a)/(g+a)',
 '840/480=(840/120)/(480/120)=7/4','480/2+840/2=240+420=660N',
 'N₂=(480/4)7=840N;a₂=840/60−10=4;a₂/a₁=4/2=2',
 'q=1440/480=3N⁻¹;N=2520/3=840N;m=840/14=60kg',
 'q=720/360=2N⁻¹;c=961−2·480=1;N=(1441−1)/2=720N;m=720/12=60kg',
 'x=a/(1m/s²):x²+10x−24=(x−2)(x+12)=0;alternative x2 e−12;positivo2⇒a2m/s²,m40kg']


def literal(value,unit):
    if isinstance(value,(int,float)):return exact(value)
    text=str(value).strip().replace('−','-')
    if unit!='1':
        if not text.endswith(' '+unit):raise ValueError('Result unit missing')
        text=text[:-len(' '+unit)]
    return exact(text)


def verify(package,bindings,asset_root=None):
    root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets';expected=oracle();out=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,root):
        n=int(row['id'][-2:]);want=expected[n-1];unit=UNITS[n]
        try:ok=row['answer']['value']==want if isinstance(want,str) else sp.simplify(literal(row['answer']['value'],unit)-want)==0
        except (TypeError,ValueError,ZeroDivisionError):ok=False
        if not ok:errors.append('Independent inertial normal-force solution mismatch')
        if row['answer']['type']=='numeric' and row['answer']['unit']!=unit:errors.append('Independent result unit mismatch')
        out.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),
          'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,
          'expectedExact':str(want),'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':'External inertial frame, up positive; person shares upward cabin acceleration; only positive normal and downward weight; m,a positive and g=10m/s² fixed; contact maintained; mass varies only between separate trials; continuous dimensionless second display.',
          'methods':['inertial_force_balance_normal_minus_weight','exact_inverse_scaling_calibration_and_quadratic_roots',
                     'individual_reading_of_source_final_candidate_options_and_scaled_SVG'],
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return out


def report(package,bindings):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings),
      'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
      'reviewer':'integrator_not_candidate_author','humanApproval':'NOT_RUN',
      'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__}}
