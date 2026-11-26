from pathlib import Path
import sys,time,json
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');sys.path.insert(0,str(A));from tools.corpus_engineering import cric_c5_radiation_optics_review_models_a as m
from hypothesis import given,settings,strategies as st
start=time.monotonic();result=m.run_prekey_checks();counts={'lens_inverse':0,'attenuation_product':0,'decay_detector':0}
@settings(max_examples=40,database=None,derandomize=True,deadline=None)
@given(st.integers(1,50),st.integers(1,50))
def lens(f,extra):p=f+extra;q=m.image_distance(f,p);assert m.focal_length(p,q)==f;assert m.s.simplify(m.object_for_real_magnification(f,-q/p)-p)==0;counts['lens_inverse']+=1
@settings(max_examples=40,database=None,derandomize=True,deadline=None)
@given(st.integers(0,100),st.integers(0,100))
def layers(a,b):x=m.transmission_product(m.R(a,100),m.R(b,100));assert x==m.transmission_product(m.R(b,100),m.R(a,100))and 0<=x<=min(m.R(a,100),m.R(b,100));counts['attenuation_product']+=1
@settings(max_examples=40,database=None,derandomize=True,deadline=None)
@given(st.integers(1,100),st.integers(1,100))
def detector(rate,e):eff=m.R(e,100);a=m.detector_activity(rate,eff);assert a*eff==rate and a>=rate;counts['decay_detector']+=1
lens();layers();detector();result['actualHypothesisConfigurations']=counts;result['wallSeconds']=time.monotonic()-start;D=A/'editorial/reviews/cric-c5-051-100-reviewer-a-prekey-20261127';(D/'actual-prekey-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));print('ACTUAL_PREKEY_MODEL_EXIT0')
