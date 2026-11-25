from pathlib import Path
import importlib.util,unittest,time,json,hashlib
A=Path.cwd();path=A/'tests/corpus/test_cross_review_dielectric_lorentz_225_229.py';spec=importlib.util.spec_from_file_location('cric_independent_225229',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
start=time.monotonic();result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(m));D=A/'editorial/reviews/u6-independent-225-229-test-evidence-20261125';D.mkdir(exist_ok=True)
for key,value in m.AUDIT_RESULTS.items():(D/(key.rsplit('.',1)[-1]+'-mutations.json')).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
report={'schemaVersion':'1.0.0','tests':result.testsRun,'success':result.wasSuccessful(),'failures':len(result.failures),'errors':len(result.errors),'elapsedSeconds':time.monotonic()-start,'testFileSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'packageMutations':sum(v['passed']for v in m.AUDIT_RESULTS.values()),'constitutiveFaults':5,'inverseFaults':5,'hypothesisConfigurations':240,'scope':'Actual independent local targeted tests and exact finally read fixtures; not productUI or ROOT integration','humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'test-run.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report),flush=True);raise SystemExit(0 if result.wasSuccessful()else 1)
