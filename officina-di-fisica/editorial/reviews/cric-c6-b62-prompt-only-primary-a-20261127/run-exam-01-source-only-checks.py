from pathlib import Path
import json,time,sys
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');sys.path.insert(0,str(A));from tools.corpus_engineering import cric_c6_exam01_prompt_only_models_a as m
from hypothesis import given,settings,strategies as st
start=time.monotonic();result=m.run_checks();counts={'energy':0,'passive_network':0,'affine_temperature':0}
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(st.integers(-100,100),st.integers(-100,100))
def energy(q,w):assert m.internal_change(q,w)-w==q;counts['energy']+=1
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(st.integers(1,100),st.integers(1,100),st.integers(1,100))
def network(a,b,c):e=m.parallel_series(a,b,c);assert 0<e<min(a,b+c);assert m.s.simplify(1/e-1/m.s.Integer(a)-1/m.s.Integer(b+c))==0;counts['passive_network']+=1
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(st.integers(1,50),st.integers(1,50),st.integers(0,100),st.integers(0,100))
def temperature(a,b,x,y):t=m.mixing_temperature(a,b,x,y);assert min(x,y)<=t<=max(x,y);assert m.mixing_temperature(a,b,x+273,y+273)==t+273;counts['affine_temperature']+=1
energy();network();temperature();result['hypothesisActualConfigurations']=counts;result['wallSeconds']=time.monotonic()-start;D=A/'editorial/reviews/cric-c6-b62-prompt-only-primary-a-20261127';(D/'exam-01-actual-model-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));print('ACTUAL_SOURCE_ONLY_CHECKS_COMPLETE')
