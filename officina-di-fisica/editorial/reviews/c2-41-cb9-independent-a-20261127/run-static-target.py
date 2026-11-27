from pathlib import Path
import sys,time,unittest,json
A=Path(__file__).resolve().parents[3];sys.path.insert(0,str(A));from tests.corpus.test_c2_41_static_cb9_a import C2FortyOneStatic
start=time.perf_counter();result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(C2FortyOneStatic));receipt={'schemaVersion':'1.0.0','actualExit':0 if result.wasSuccessful()else 1,'testsRun':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),'elapsedSeconds':time.perf_counter()-start,'UI':'NOT_RUN','acceptedActivityCount':0,'humanApproval':'NOT_RUN'};Path(__file__).with_name('actual-static-target-result.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));raise SystemExit(receipt['actualExit'])
