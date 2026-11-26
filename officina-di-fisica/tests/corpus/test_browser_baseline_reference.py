"""Immutable numerical transport guards; these tests never approve an activity."""
import copy,json,subprocess,tempfile,unittest
from pathlib import Path
from tools.corpus_engineering import experiment_visibility_request as v

APP=Path(__file__).resolve().parents[2]
KIND='IMMUTABLE_BASELINE_SAME_BROWSER_SAME_INPUT_V1'

class BrowserBaselineReference(unittest.TestCase):
 def reference(self):
  files=v.baseline_manifest()
  return {'kind':KIND,'baselineRuntimeRef':v.BASELINE,'files':files,'manifestSha256':v.digest(files),
   'typescriptSha256':v.sha((APP/'node_modules/typescript/lib/typescript.js').read_bytes()),
   'scientificAuthority':'NONE_TECHNICAL_REGRESSION_PARITY_ONLY'}

 def test_complete_immutable_baseline_is_reconstructed_outside_candidate_and_checked(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=Path(tmp).resolve();(root/'candidate-app').mkdir();ref=self.reference()
   bundle=v.prepare_baseline_bundle({'numericalReference':ref},root)
   plan={'numericalReference':ref,'baselineBundleRoot':str(bundle),'records':[]}
   result=v.verify_baseline_bundle({'candidateApp':str(root/'candidate-app')},plan,{'numericalReference':ref})
   self.assertEqual(result['manifestSha256'],ref['manifestSha256']);self.assertEqual(len(result['files']),80)
   first=next(iter(ref['files']));file=bundle/first.removeprefix('officina-di-fisica/static/')
   file.write_bytes(file.read_bytes()+b'\n')
   with self.assertRaisesRegex(ValueError,'Baseline bytes'):v.verify_baseline_bundle({'candidateApp':str(root/'candidate-app')},plan,{'numericalReference':ref})

 def test_rebound_manifest_even_with_fresh_digest_cannot_replace_immutable_git_source(self):
  with tempfile.TemporaryDirectory()as tmp:
   ref=self.reference();ref['files'][next(iter(ref['files']))]='0'*64;ref['manifestSha256']=v.digest(ref['files'])
   with self.assertRaisesRegex(ValueError,'Immutable baseline'):v.prepare_baseline_bundle({'numericalReference':ref},Path(tmp))

 def test_external_engine_record_rejected_before_browser_construction(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=Path(tmp).resolve();(root/'candidate-app').mkdir();ref=self.reference();bundle=v.prepare_baseline_bundle({'numericalReference':ref},root)
   plan={'numericalReference':ref,'baselineBundleRoot':str(bundle),'records':[{'record':{'engine':{'id':'external'}}}]}
   with self.assertRaisesRegex(ValueError,'External engine'):v.verify_baseline_bundle({'candidateApp':str(root/'candidate-app')},plan,{'numericalReference':ref})

 def test_node_strict_parity_rejects_one_ulp_nonfinite_cache_reuse_and_different_input(self):
  code=r"""
  import assert from 'node:assert/strict';
  import {assertStrictBaselineParity as check,REFERENCE_KIND} from './tools/corpus_engineering/baseline_browser_reference.mjs';
  const controls=[{name:'x',value:'55'}];
  const good={sourceReplayedX:55,actualDOMControls:controls,model:{x:55,y:5.735764363510461},
   baselineReference:{kind:REFERENCE_KIND,distinctModuleIdentity:true,distinctSolveIdentity:true,observedX:55,actualDOMControls:controls,model:{x:55,y:5.735764363510461}}};
  check(good);const b=new ArrayBuffer(8),d=new DataView(b);d.setFloat64(0,good.model.y);d.setBigUint64(0,d.getBigUint64(0)+1n);const up=d.getFloat64(0);
  for(const y of [up,good.model.y+1,NaN,Infinity])assert.throws(()=>check({...good,model:{x:55,y}}));
  for(const change of [{observedX:50},{distinctModuleIdentity:false},{distinctSolveIdentity:false},{actualDOMControls:[{name:'x',value:'50'}]},{model:{x:55,y:NaN}}])assert.throws(()=>check({...good,baselineReference:{...good.baselineReference,...change}}));
  assert.throws(()=>check({...good,model:{...good.model,extra:Infinity},baselineReference:{...good.baselineReference,model:{...good.model,extra:Infinity}}}));
  """
  r=subprocess.run(['node','--input-type=module','-e',code],cwd=APP,capture_output=True,text=True);self.assertEqual(r.returncode,0,r.stderr)

 def test_actual_esm_closure_serves_only_pinned_namespace_and_detects_nested_drift(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=Path(tmp).resolve();ref=self.reference();bundle=v.prepare_baseline_bundle({'numericalReference':ref},root)
   request=root/'request.json';request.write_text(json.dumps({'numericalReference':ref}));plan={'numericalReference':ref,'baselineBundleRoot':str(bundle),'requestFile':str(request),'requestSha256':v.sha(request.read_bytes()),'records':[]};p=root/'plan.json';p.write_text(json.dumps(plan))
   code=r"""
   import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
   import {loadBaselineReference} from './tools/corpus_engineering/baseline_browser_reference.mjs';
   const plan=JSON.parse(await fs.readFile(process.argv[1])),b=await loadBaselineReference(plan);let response,aborted=false;
   const rel='js/banchi/voci/modelli/C2.js';
   const route=url=>({request:()=>({url:()=>url}),fulfill:async r=>response=r,abort:async()=>{aborted=true;}});
   await b.route(route('http://localhost'+b.namespace+rel));assert.equal(response.status,200);assert.match(response.body.toString(),/export const experiments/);
   const evidence=await b.evidence();assert.ok(evidence.dependencyClosure[rel]);assert.equal(evidence.servedFiles[rel],plan.numericalReference.files['officina-di-fisica/static/'+rel]);
   await b.route(route('http://localhost'+b.namespace+'not-in-closure.js'));assert.equal(aborted,true);await assert.rejects(b.evidence(),/Unpinned baseline request/);
   const clean=await loadBaselineReference(plan),file=path.join(plan.baselineBundleRoot,rel);await fs.appendFile(file,'\n');
   await assert.rejects(clean.route(route('http://localhost'+clean.namespace+rel)),/Baseline module changed/);await assert.rejects(clean.evidence(),/Baseline drift/);
   """
   r=subprocess.run(['node','--input-type=module','-e',code,str(p)],cwd=APP,capture_output=True,text=True);self.assertEqual(r.returncode,0,r.stderr)

 def test_new_contract_may_not_be_omitted_or_rebound_from_prepared_inputs(self):
  with self.assertRaisesRegex(ValueError,'Undeclared baseline'):v.verify_baseline_bundle({}, {'numericalReference':{}}, {})
  ref=self.reference()
  with self.assertRaisesRegex(ValueError,'rebound'):v.verify_baseline_bundle({}, {'numericalReference':{**ref,'manifestSha256':'0'*64}}, {'numericalReference':ref})

if __name__=='__main__':unittest.main()
