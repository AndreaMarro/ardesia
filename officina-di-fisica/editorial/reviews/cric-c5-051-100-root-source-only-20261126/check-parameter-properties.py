"""Source-first family invariants, not candidate approval."""
from hypothesis import given,settings,strategies as st
import sympy as s
import json
from tools.corpus_engineering import cric_c5_051_100_root_review_models as m
counts={'lens':0,'passive_filters':0,'equal_activity':0}
@settings(max_examples=40,derandomize=True,deadline=None)
@given(f=st.integers(1,100),gap=st.integers(1,200))
def lens(f,gap):
 f=s.Integer(f);p=f+gap;q=m.lens_image(f,p)
 assert q>0 and s.cancel(1/f-1/p-1/q)==0
 assert s.cancel(m.lens_focal(p,q)-f)==0
 counts['lens']+=1
@settings(max_examples=40,derandomize=True,deadline=None)
@given(a=st.integers(0,100),b=st.integers(0,100))
def filters(a,b):
 a=s.Rational(a,100);b=s.Rational(b,100);t=m.transmission(a,b)
 assert 0<=t<=1
 assert s.cancel((1-a)+a*(1-b)+t-1)==0
 counts['passive_filters']+=1
@settings(max_examples=40,derandomize=True,deadline=None)
@given(rate=st.integers(1,1000),population=st.integers(1,10000),factor=st.integers(2,10))
def same_activity(rate,population,factor):
 rate=s.Integer(rate);population=s.Integer(population);factor=s.Integer(factor)
 assert m.activity(rate*factor,population/factor)==m.activity(rate,population)
 counts['equal_activity']+=1
if __name__=='__main__':
 lens();filters();same_activity();assert sum(counts.values())==120
 print(json.dumps({'actualHypothesisCases':counts,'scope':'source-only independent model preparation','scientificCredit':0}))
