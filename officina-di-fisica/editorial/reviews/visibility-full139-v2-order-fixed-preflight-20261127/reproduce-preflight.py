import json,sys,subprocess,os
from pathlib import Path
from tools.corpus_engineering import experiment_visibility_request as v
root=v.REPO;app=v.APP
candidate='cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc'
fp='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
prior=v.load(app/'editorial/reviews/isolated-baseline-root-20261127/actual-opt-in11/executed-request.json')
assert prior['numericalReference']['kind']==v.REFERENCE_KIND
updated_models={path:v.sha(v.git_bytes(candidate,path))for path in prior['modelFiles']}
assert {p for p in updated_models if updated_models[p]!=prior['modelFiles'][p]}=={'officina-di-fisica/static/js/banchi/voci/esperimento.js','officina-di-fisica/static/js/banchi/voci/legende.js','officina-di-fisica/static/js/banchi/banco.js'}
prior.update(candidateRef=candidate,runtimeSha256=fp,modelFiles=updated_models)
prior['protocolFiles']={p:v.sha((root/p).read_bytes())for p in v.PROTOCOLS|{v.BASELINE_HELPER}}
print('Updated runtime pins for bench display and legend paths; full candidate runtime reconstructed below',flush=True)
out=(app/'editorial/reviews/visibility-full139-v2-order-fixed-preflight-20261127').resolve();out.mkdir(exist_ok=True)
request=out/'candidate-request.json';request.write_bytes(v.canonical(prior)+b'\n');obj,pin=v.validate(request)
casecounts={};prepared_sha={};path=Path('/private/tmp/cric-v2-repaired-order-preflight-20261127')
for course in v.COURSES:
 info=v.prepare(request,course,path/course)
 planned=v.load(info['prepared']);assert planned['sourceCommit']==candidate and planned['runtimeFingerprint']['sha256']==fp
 checked=v.verify_prepared_inputs(info,planned)
 assert len(checked['normalizedOwnerRecords'])==9 and len(checked['files'])==4
 assert [Path(name).stem for name in planned['packageFiles']]==list(v.PACKAGES)
 cases=v.planned_interactions(planned);casecounts[course]=len(cases);prepared_sha[course]=v.sha(Path(info['prepared']).read_bytes())
 print(course,len(cases),flush=True)
assert sum(casecounts.values())==45576
(out/'preflight-receipt.json').write_bytes(v.canonical({'status':'ALL_FIVE_PREPARED_AND_VERIFIED_BEFORE_IMPORT','normalizedOwnerRecordsPerCourse':9,'canonicalPackageOrder':list(v.PACKAGES),'plannedCases':casecounts,'preparedSha256Local':prepared_sha,'requestSha256':pin,'candidateRef':candidate,'runtimeSha256':fp,'campaignRun':'NOT_STARTED','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})+b'\n')
