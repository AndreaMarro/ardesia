"""Independent algebraic properties for the pre-candidate passive models."""
import json,time
from pathlib import Path
import sympy as s
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import cric_c4_051_100_root_review_models as m
counts={'passive_networks':0,'charge_and_energy':0}
positive=st.integers(1,100)
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(positive,positive,positive,positive)
def networks(an,ad,bn,bd):
 a,b=s.Rational(an,ad),s.Rational(bn,bd);r=m.parallel_resistance(a,b);c=m.capacitor_series(a,b)
 assert s.simplify(1/r-1/a-1/b)==0 and 0<r<min(a,b)
 assert s.simplify(1/c-1/a-1/b)==0 and 0<c<min(a,b)
 assert m.parallel_unknown(r,a)==b and m.series_capacitor_unknown(c,a)==b
 counts['passive_networks']+=1
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(positive,positive,positive,positive,st.integers(-100,100),st.integers(-100,100))
def sharing(an,ad,bn,bd,x,y):
 a,b=s.Rational(an,ad),s.Rational(bn,bd);v=m.sharing_voltage([a,b],[x,y])
 assert s.simplify((a+b)*v-a*x-b*y)==0 and min(x,y)<=v<=max(x,y)
 loss=s.factor(m.capacitor_energy(a,x)+m.capacitor_energy(b,y)-m.capacitor_energy(a+b,v))
 assert loss>=0 and s.simplify(loss-a*b*(x-y)**2/(2*(a+b)))==0
 assert m.sharing_voltage([a,a],[x,-x])==0
 counts['charge_and_energy']+=1
started=time.monotonic();networks();sharing();assert counts=={'passive_networks':40,'charge_and_energy':40}
result={'scope':'Source-only parameter properties, no candidate review or credit','actualExitCode':0,'actualExamples':counts,'elapsedSeconds':time.monotonic()-started,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
Path(__file__).with_name('actual-hypothesis-properties.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
