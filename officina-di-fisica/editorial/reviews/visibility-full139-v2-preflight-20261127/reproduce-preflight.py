import json,sys,subprocess,os
from pathlib import Path
from tools.corpus_engineering import experiment_visibility_request as v
root=v.REPO;app=v.APP
candidate='5bd3d016842e4ebcf4dba965c25b5252bd2cc36c'
fp='34d3de9ee5f452bf469b007c8e6f9686ebcc103af647bfe1ac4873d975e0cb67'
prior=v.load(app/'editorial/reviews/isolated-baseline-root-20261127/actual-opt-in11/executed-request.json')
assert prior['numericalReference']['kind']==v.REFERENCE_KIND
updated_models={path:v.sha(v.git_bytes(candidate,path))for path in prior['modelFiles']}
assert {p for p in updated_models if updated_models[p]!=prior['modelFiles'][p]}=={'officina-di-fisica/static/js/banchi/voci/esperimento.js'}
prior.update(candidateRef=candidate,runtimeSha256=fp,modelFiles=updated_models)
prior['protocolFiles']={p:v.sha((root/p).read_bytes())for p in v.PROTOCOLS|{v.BASELINE_HELPER}}
print('Candidate changes one prior pinned model file (esperimento.js); full runtime reconstructed below',flush=True)
out=(app/'editorial/reviews/visibility-full139-v2-preflight-20261127').resolve();out.mkdir(exist_ok=True)
request=out/'candidate-request.json';request.write_bytes(v.canonical(prior)+b'\n');obj,pin=v.validate(request)
casecounts={};prepared_sha={};path=Path('/private/tmp/cric-v2-final-runtime-preflight-20261127')
for course in v.COURSES:
 info=v.prepare(request,course,path/course)
 planned=v.load(info['prepared']);assert planned['sourceCommit']==candidate and planned['runtimeFingerprint']['sha256']==fp
 cases=v.planned_interactions(planned);casecounts[course]=len(cases);prepared_sha[course]=v.sha(Path(info['prepared']).read_bytes())
 print(course,len(cases),flush=True)
assert sum(casecounts.values())==45576
(out/'preflight-receipt.json').write_bytes(v.canonical({'status':'READY_IF_FINAL_RUNTIME_CONFIRMED','plannedCases':casecounts,'preparedSha256Local':prepared_sha,'requestSha256':pin,'candidateRef':candidate,'runtimeSha256':fp,'campaignRun':'NOT_STARTED','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})+b'\n')
