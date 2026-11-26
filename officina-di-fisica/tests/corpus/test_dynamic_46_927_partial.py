"""Integrity of actual source/Node-only evidence; never activity approval."""
from pathlib import Path
import hashlib,json,subprocess,unittest
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-dynamics-46-927-partial-20261126'
def digest(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def load(p):return json.loads(p.read_bytes())

class DynamicPartial(unittest.TestCase):
    def test_exact_remaining_46_sources_are_original_and_no_ui_acceptance_is_claimed(self):
        summary=load(BASE/'summary.json');groups=[load(p)for p in BASE.glob('*-math-engine-partial.json')]
        records=[r for group in groups for r in group['selectedRecords']]
        self.assertEqual(len(groups),9);self.assertEqual(len(records),46)
        self.assertEqual(sorted(r['id']for r in records),summary['uniqueIds']);self.assertEqual(len(set(summary['uniqueIds'])),46)
        originals={}
        for record in records:
            name=record['sourcePath']
            if name not in originals:
                raw=subprocess.check_output(['git','show',record['sourceRef']+':'+name],cwd=APP)
                self.assertEqual(hashlib.sha256(raw).hexdigest(),record['sourceFileSha256'])
                originals[name]={r['id']:r for r in json.loads(raw)}
            self.assertEqual(digest(originals[name][record['id']]),record['sourceSha256'])
            self.assertFalse(record['ok']);self.assertEqual(record['overallAcceptance'],'NOT_GRANTED')
            self.assertEqual(record['consumerUI'],'NOT_RUN_ON_FINAL_EPOCH');self.assertEqual(record['activityCredit'],0)
            self.assertTrue(record['sourceMathAndNodeChecksOk']);self.assertTrue(record['checks']);self.assertTrue(record['runtimeComparison']['ok'])

    def test_per_record_dependencies_and_executed_source_scope_are_complete(self):
        excluded={'SIM-C1-L001-06','SIM-C1-L002-01','SIM-C1-L002-02','SIM-C1-L002-03','SIM-C1-L002-04','SIM-C1-L007-01'}
        for file in BASE.glob('*-math-engine-partial.json'):
            group=load(file);deps=group['dependencies'];pin=digest(deps)
            for name,want in deps.items():self.assertEqual(hashlib.sha256((APP/name).read_bytes()).hexdigest(),want,name)
            for row in group['selectedRecords']:
                self.assertNotIn(row['id'],excluded);self.assertEqual(row['reviewDependencySha256'],pin)
            raw=group['rawFreshInstalledNode']
            if isinstance(raw,dict):self.assertFalse(excluded&set(raw))
        summary=load(BASE/'summary.json');self.assertEqual(summary['failures'],[])
        self.assertEqual(summary['runtimeFingerprintBeforeAndAfter']['sha256'],'9279713a1f2cbb27fbb2014ae68d15b70f71ea3249c4ec33d7430a54a3fdcd0d')

if __name__=='__main__':unittest.main()
