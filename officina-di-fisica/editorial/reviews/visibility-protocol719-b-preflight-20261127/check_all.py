from pathlib import Path
import importlib.util,json,time
D=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('checks719',D/'check_execution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
start=time.monotonic();results=[]
for course in ['c2','c3']:
 for p in sorted((D.parent/(course+'-draft-browser719-preflight-b-20261127')/'blocks').glob('*/collector-input.json')):results.append(m.check(p))
assert len(results)==22 and sum(r['cases']for r in results)==1232
(D/'execution-guards.json').write_text(json.dumps({'phase':'READ_ONLY_PRELAUNCH_CHECKS','blocks':results,'elapsedSeconds':time.monotonic()-start,'Chrome':'NOT_RUN','activityCredit':0},indent=2)+'\n');print('22 metadata guards PASS;1232 planned cases; no browser')
