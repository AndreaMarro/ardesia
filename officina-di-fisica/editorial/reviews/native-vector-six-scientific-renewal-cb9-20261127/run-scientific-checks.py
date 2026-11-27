"""Explicit owned target; pass an actual frozen cb9 app, not a cached approval."""
from pathlib import Path
import sys,os,json,copy,tempfile,types,unittest,hashlib,subprocess,time
from unittest import mock
A=Path(__file__).resolve().parents[3];sys.path.insert(0,str(A));APP=Path(sys.argv[1]).resolve();sys.argv=sys.argv[:1];os.environ['ASTRA_EXTENSIONS']=str(APP/'extensions')
from tools.corpus_engineering import c1_six_vector_renewal_cb9_verifier as v
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows
BASE=Path(__file__).resolve().parent
SOURCES={r['id']:r for r in json.loads((APP/'content/esperienze-C1.json').read_bytes())}
class SixIndependentRenewal(unittest.TestCase):
    counts={'numericRuntimeFaultsRejected':0,'constitutiveFaultsRejected':0,'retokenizedDraftMathFaultsRejected':0,'nonfiniteReadingsRejected':0}
    @classmethod
    def setUpClass(cls):cls.fresh=v.report(SOURCES,app=APP)
    def test01_fresh_saved_complete_current_records(self):
        saved=json.loads((BASE/'current-six-scientific-report.json').read_bytes());self.assertEqual(self.fresh,saved);self.assertEqual({r['id']for r in saved['records']},v.IDS);self.assertEqual(saved['acceptedEffectiveIndividualCount'],6);self.assertTrue(all(r['ok']for r in saved['records']));self.assertTrue(all(r['runtimeProfileSha256']==v.RUNTIME for r in saved['records']))
    def test02_actual_original_versions_and_separate_manuality_failures(self):
        for row in self.fresh['records']:
            self.assertEqual(row['sourceSha256'],digest(SOURCES[row['id']]));self.assertEqual(row['sourceVersion'],SOURCES[row['id']]['version'])
            if row['id']in v.DRAFTS:
                p=row['publishedEditionReview'];self.assertFalse(p['ok']);self.assertTrue(p['freshNumericRuntimeComparison']['ok']);self.assertEqual(p['originalGeneratedTransfer'],95);self.assertEqual(row['candidateVersion'],2);self.assertEqual(row['baseVersion'],1)
        self.assertEqual(next(r for r in self.fresh['records']if r['id']=='SIM-C1-L002-03')['sourceVersion'],2)
    def test03_wrong_epoch_cannot_be_retagged(self):
        real=v.legacy
        def replaced(name):return types.SimpleNamespace(runtime_fingerprint=lambda app:{'sha256':'1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'})if name=='runtime_fingerprint.py'else real(name)
        with mock.patch.object(v,'legacy',replaced),self.assertRaisesRegex(ValueError,'Actualcb9'):v.report(SOURCES,app=APP)
    def test04_changed_source_identity_rejected(self):
        sources=copy.deepcopy(SOURCES);sources['SIM-C1-L007-01']['references'][0][1]=13
        with self.assertRaisesRegex(ValueError,'source identity'):v.report(sources,app=APP)
    def test05_numeric_runtime_mutants_reach_physics_comparison(self):
        for name,ids in v.FAMILIES.items():
            m=v.legacy(name);raw=self.fresh['rawFreshEngineResults'][name]['actual'];specs={k:m.SPECS[k]for k in ids}
            for key in ids:
                wrong=copy.deepcopy(raw);wrong[key]['cases'][0]['output']['y']+=1
                result=v.bind(m.compare_runtime,APP,specs)(wrong);self.assertFalse(result[key]['ok']);self.assertTrue(any('law differs'in e for e in result[key]['errors']));self.counts['numericRuntimeFaultsRejected']+=1
    def test06_constitutive_functions_are_not_approved_by_hash_alone(self):
        for name in v.FAMILIES:
            m=v.legacy(name);old=m.exact_value;m.exact_value=lambda key,x,old=old:old(key,x)+1
            checks=m.independent_checks();self.assertTrue(any(not c['ok']for k in v.FAMILIES[name]for c in checks[k]));self.counts['constitutiveFaultsRejected']+=1
    def test07_rebound_candidate_and_binding_still_need_physics(self):
        for name,ids in v.FAMILIES.items():
            for key in ids:
                if key not in v.DRAFTS:continue
                m=v.legacy(name);batch=v.DRAFTS[key];p=copy.deepcopy(v.load(BASE/'fixtures'/(batch+'.json')));b=copy.deepcopy(v.load(BASE/'fixtures'/(batch+'-bindings.json')));r=p['records'][0];r['assessmentSelection']['points']=[90,95];b[0]['candidateSha256']=digest(r);assets=b[0]['assetChecksums'];token=digest({'record':r,'assets':assets,'source':{'id':b[0]['sourceId'],'ref':b[0]['sourceRef'],'sha256':b[0]['sourceSha256']}})
                rows=reviewed_rows(p,b,{key:token},{key},BASE/'fixtures/assets');self.assertFalse(rows[0][-1]);specs={key:m.SPECS[key]};actual=v.bind(m.runtime_values,APP,specs)({key:r});comp=v.bind(m.compare_runtime,APP,specs)(actual)[key];self.assertFalse(comp['ok']);self.assertTrue(any('assigned'in e for e in comp['errors']));self.counts['retokenizedDraftMathFaultsRejected']+=1
    def test08_exit_one_rejected_even_with_rebound_handoff_pin(self):
        original=v.load(v.VISUAL/'handoff.json');original['actualFinalExit']=1
        with tempfile.TemporaryDirectory(prefix='cric-six-negative-exit-')as tmp:
            root=Path(tmp);p=root/'handoff.json';p.write_text(json.dumps(original));pin=hashlib.sha256(p.read_bytes()).hexdigest()
            with mock.patch.object(v,'VISUAL',root),mock.patch.object(v,'VISUAL_HANDOFF',pin),self.assertRaisesRegex(ValueError,'Incomplete independent'):v.evidence()
    def test09_legacy_globals_and_sources_unchanged(self):
        for name in v.FAMILIES:
            m=v.legacy(name);before=copy.deepcopy(m.SPECS);oldpins=copy.deepcopy(getattr(m,'READ_RUNTIME',{}));key=v.FAMILIES[name][0];fn=v.bind(m.runtime_values,APP,{key:m.SPECS[key]});self.assertEqual(m.SPECS,before);self.assertEqual(getattr(m,'READ_RUNTIME',{}),oldpins);self.assertIsNot(fn,m.runtime_values);self.assertEqual(set(fn.__globals__['SPECS']),{key});self.assertEqual(hashlib.sha256((BASE/'legacy'/name).read_bytes()).hexdigest(),v.LEGACY[name])
        for item in v.load(BASE/'legacy/git-inputs.json')['inputs']:
            raw=subprocess.check_output(['git','show',item['commit']+':'+item['path']],cwd=A);self.assertEqual(raw,(BASE/'legacy'/item['snapshot']).read_bytes());self.assertEqual(hashlib.sha256(raw).hexdigest(),item['sha256'])
    def test10_nonfinite_or_non_numeric_actual_readings_rejected(self):
        for name in v.FAMILIES:
            m=v.legacy(name)
            for value in [float('inf'),float('-inf'),float('nan'),True,'1',complex(1,1)]:self.assertFalse(m.near(value,1));self.counts['nonfiniteReadingsRejected']+=1
start=time.perf_counter();result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(SixIndependentRenewal));receipt={'schemaVersion':'1.0.0','actualExit':0 if result.wasSuccessful()else 1,'testsRun':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),'elapsedSeconds':time.perf_counter()-start,'statistics':SixIndependentRenewal.counts,'actualApp':str(APP),'runtime':v.RUNTIME,'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0};(BASE/'actual-scientific-target-result.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));raise SystemExit(receipt['actualExit'])
