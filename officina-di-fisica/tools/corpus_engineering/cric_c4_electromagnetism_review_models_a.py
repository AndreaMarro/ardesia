"""Reviewer A exact numerical boundary, frozen before opening C4 B candidates.

Uses Root's immutable prompt-only model with its Q091 exposure disclosed;
A's separate prompt-only Q091 compensation and fifty-prompt reread predate it.
No authoring import, key lookup, string sympify, eval or binary-float repair.
"""
from fractions import Fraction
import sympy as s
from . import cric_c4_051_100_root_review_models as source

def exact(*values):
    out=[]
    for value in values:
        if isinstance(value,bool)or not isinstance(value,(int,Fraction,s.Basic)):raise ValueError('Exact numeric object required before conversion')
        value=s.Rational(value.numerator,value.denominator)if isinstance(value,Fraction)else s.Integer(value)if isinstance(value,int)else value
        if value.atoms(s.Float)or value.is_real is not True or value.is_finite is not True or value.free_symbols:raise ValueError('Finite real exact numerical value required')
        out.append(value)
    return tuple(out)

def positive(*values):
    values=exact(*values)
    if any(v.is_positive is not True for v in values):raise ValueError('Positive finite exact parameter required')
    return values

def parallel_resistance(a,b):
    a,b=positive(a,b);return source.parallel_resistance(a,b)

def parallel_unknown(e,k):
    e,k=positive(e,k);return source.parallel_unknown(e,k)

def capacitor_series(a,b):
    a,b=positive(a,b);return source.capacitor_series(a,b)

def series_capacitor_unknown(e,k):
    e,k=positive(e,k);return source.series_capacitor_unknown(e,k)

def capacitor_energy(c,v):
    c,=positive(c);v,=exact(v);return source.capacitor_energy(c,v)

def sharing_voltage(cs,vs):
    cs=positive(*cs);vs=exact(*vs);return source.sharing_voltage(cs,vs)

def capacitance_ratio(a,b):
    a,b=positive(a,b);return source.capacitance_ratio(a,b)

def flux(b,a,theta):
    b,theta=exact(b,theta);a,=positive(a);return source.flux(b,a,theta)

def mean_emf(n,initial,final,t):
    n,t=positive(n,t);initial,final=exact(initial,final)
    if n.is_integer is not True:raise ValueError('Positive integer turn count required')
    return source.mean_emf(n,initial,final,t)

def lorentz_force(q,v,b):
    q,=exact(q);v=exact(*v);b=exact(*b)
    if len(v)!=3 or len(b)!=3:raise ValueError('Three components required')
    return source.lorentz_force(q,v,b)

def physical_oracle():
    rows=source.quantitative()
    for row in rows.values():exact(row['value'])
    return {int(k[-3:]):v['value']for k,v in rows.items()}

def run_checks():
    result=source.run_checks()
    bad=[s.oo,-s.oo,s.nan,s.I,s.Float('0.1'),0.1,True,'1',s.Symbol('x',positive=True)]
    rejected=0
    for value in bad:
        for function,args in[(exact,(value,)),(positive,(value,)),(parallel_resistance,(value,2)),(parallel_unknown,(1,value)),(capacitor_energy,(2,value)),(sharing_voltage,([2],[value])),(flux,(value,2,0)),(mean_emf,(1,0,value,2)),(lorentz_force,(value,[1,0,0],[0,0,1]))]:
            try:function(*args)
            except ValueError:rejected+=1
            else:raise AssertionError((function.__name__,repr(value)))
    assert capacitor_energy(2,-3)==9 and sharing_voltage([2,2],[3,-3])==0
    assert mean_emf(2,3,1,4)==1 and flux(-2,3,0)==-6
    assert lorentz_force(-1,[1,0,0],[0,0,-1])==s.Matrix([0,-1,0])
    assert len(physical_oracle())==25
    result.update(reviewerCandidateExposure='NONE_BEFORE_THIS_EXECUTION',finiteExactRejections=rejected,signedPhysicalCases=5,rootQ091ExposureRetained=True,AQ091CompensationCommit='db4f4c7e',candidateApproval=False)
    return result
