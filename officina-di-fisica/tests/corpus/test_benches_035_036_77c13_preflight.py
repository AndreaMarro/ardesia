from pathlib import Path
import gzip,hashlib,json,unittest
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-bench-mechanics-fluids-035-77c13-20261127'
OTHER=APP/'editorial/reviews/renewal-bench-fields-optics-036-77c13-20261127'
INDEX='0cfd134542fe1790a4c98b331ec7752c2fd4557dfa1aef9ccc7f089ac0dcea3a'
RUNTIME='77c13a37088c8b19e7e56558a85ff8ad644acf8488abb9b5d0a5214991c696d4'
def load(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
class BenchPreparationDistinctEpoch(unittest.TestCase):
 def test_frozen_preparation_and_actual_cpu_bytes(self):
  self.assertEqual(sha(BASE/'preparation-proof-index.json'),INDEX)
  for name,pin in load(BASE/'preparation-proof-index.json')['files'].items():
   p=APP/name;self.assertTrue(p.resolve().is_relative_to(APP));self.assertFalse(p.is_symlink());self.assertEqual(sha(p),pin,name)
 def test_actual_cpu_has_complete_independent_models_but_no_activity_credit(self):
  terminal=load(BASE/'actual-preflight-terminal.json');self.assertEqual(terminal['actualExitCode'],0);self.assertFalse(terminal['browserStarted']);self.assertEqual(terminal['sourceMathInstalledCases'],1423);self.assertEqual(terminal['runtimeBefore'],terminal['runtimeAfter']);self.assertEqual(terminal['runtimeBefore']['sha256'],RUNTIME);self.assertEqual(terminal['protocolSha256'],sha(BASE/'preflight-cpu.py'))
  for base,count,start in[(BASE,378,1),(OTHER,1045,6)]:
   d=load(base/'actual-preflight.json');self.assertTrue(d['preflightOk']);self.assertEqual(d['runtimeSha256'],RUNTIME);self.assertEqual(d['installedNodeCases'],count);self.assertEqual({r['id']for r in d['records']},{'LAB3D-'+str(n).zfill(2)for n in range(start,start+5)});self.assertIs(d['ok'],False);self.assertEqual(d['activityCredit'],0)
   for r in d['records']:
    self.assertTrue(r['sourceMathOk']);self.assertTrue(r['installedNodeOk']);self.assertIs(r['ok'],False);self.assertEqual(r['consumerUI'],'NOT_RUN_CURRENT_WHOLE_COHORT');self.assertEqual(r['calculationScope'],'EXACT_MANUAL_CALCULATION');self.assertTrue(r['manualArithmetic']);self.assertTrue(r['physicalAssumptions']);self.assertEqual(r['activityCredit'],0)
 def test_lossless_actual_installed_outputs_complete_and_bound(self):
  for base,count in[(BASE,378),(OTHER,1045)]:
   receipt=load(base/'actual-preflight.json');p=base/'actual-installed-node-values.json.gz';raw=gzip.decompress(p.read_bytes());self.assertEqual(sha(p),receipt['rawCompressedSha256']);self.assertEqual(hashlib.sha256(raw).hexdigest(),receipt['rawDecodedSha256']);self.assertEqual(len(raw),receipt['rawDecodedBytes']);data=json.loads(raw)
   self.assertEqual(len(data)if isinstance(data,list)else sum(len(v)for k,v in data.items()if k.startswith('LAB3D-')),count)
 def test_full_ui_plans_have_exact_unique_profiles_boundaries_and_distinct_clock(self):
  for base,cases,clocks in[(BASE,120,64),(OTHER,148,56)]:
   plan=load(base/'executable-plan.json');matrix=load(base/'expected-case-matrix.json');self.assertEqual(plan['chromeState'],'NOT_QUEUED_WAITING_PARENT_ORDER');self.assertEqual(plan['runtimeSha256'],RUNTIME);self.assertIs(plan['ok'],False);self.assertEqual(len(matrix['cases']),cases);self.assertEqual(len(matrix['clockObservations']),clocks);self.assertEqual(sum(r['type']=='base'for r in matrix['cases']),40)
   keys=[(r['id'],r['width'],r['entryView'],r['view'],r['type'],r.get('boundary'))for r in matrix['cases']];self.assertEqual(len(set(keys)),cases)
   for key in plan['ids']:
    actual={(r['width'],r['view'])for r in matrix['cases']if r['id']==key and r['type']=='base'};self.assertEqual(actual,{(w,v)for w in[320,1280]for v in['orbit','side','top','diagram']})
if __name__=='__main__':unittest.main()
