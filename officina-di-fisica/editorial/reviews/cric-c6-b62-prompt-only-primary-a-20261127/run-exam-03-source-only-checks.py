from pathlib import Path
import json,time,sys
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');sys.path.insert(0,str(A));from tools.corpus_engineering import cric_c6_exam03_prompt_only_models_a as m
from hypothesis import given,settings,strategies as st
start=time.monotonic();result=m.run_checks();counts={'heat_thickness':0,'mirror_directions':0,'balanced_bridge':0}
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(st.integers(1,100),st.integers(1,100),st.integers(1,100),st.integers(1,100))
def heat(k,a,t,d):assert m.conduction_ratio(k,a,t,d,2)==m.R(1,2);counts['heat_thickness']+=1
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(st.integers(-100,100).filter(lambda x:x!=0),st.integers(-100,100))
def mirrors(x,y):v=m.s.Matrix([x,y]);out=m.double_reflected_direction(x,y);assert out==-v and out.dot(v)==-v.dot(v);counts['mirror_directions']+=1
@settings(max_examples=40,derandomize=True,database=None,deadline=None)
@given(st.integers(-100,100),st.integers(1,100),st.integers(1,100))
def bridge(v,r,b):current,solutions=m.balanced_bridge(v,r,b);assert current==0 and set(solutions.values())=={m.R(v,2)};counts['balanced_bridge']+=1
heat();mirrors();bridge();result['hypothesisActualConfigurations']=counts;result['wallSeconds']=time.monotonic()-start;D=A/'editorial/reviews/cric-c6-b62-prompt-only-primary-a-20261127';(D/'exam-03-actual-model-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));print('ACTUAL_SOURCE_ONLY_CHECKS_COMPLETE')
