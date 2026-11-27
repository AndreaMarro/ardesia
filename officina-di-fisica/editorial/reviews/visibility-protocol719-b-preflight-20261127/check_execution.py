"""Read-only prelaunch checks for an existing bounded collector input. Never launches Chrome."""
from pathlib import Path
from fractions import Fraction as F
import hashlib,importlib.util,json,sys
D=Path(__file__).resolve().parent
PIN='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
J=lambda p:json.loads(Path(p).read_bytes());H=lambda b:hashlib.sha256(b).hexdigest()
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def check(info_path):
 info=J(info_path);prepared_path=Path(info['prepared']);p=J(prepared_path)
 assert H(prepared_path.read_bytes())==info['preparedSha256']
 collector=Path(info['collectorPath']);assert collector==D/'experiment_visibility_ui.mjs'and H(collector.read_bytes())==PIN==info['collectorSha256']
 assert not p.get('numericalReference'),'This bounded proof does not provision a global139 baseline bundle'
 app=Path(info['candidateApp']);assert module('fp_check719',app/'tools/corpus_engineering/runtime_fingerprint.py').runtime_fingerprint(app)==p['runtimeFingerprint']
 assert p['sourceCommit']=='b9994b9116e87478905191d85cca8037d17ae4bd'
 request=prepared_path.with_name('bounded-request.json');assert H(request.read_bytes())==p['requestSha256'];assert J(request)['collectorSha256']==PIN
 paths={Path(x)for x in p['inputFiles']};packages=[Path(x)for x in p['packageFiles']]
 expected={q for f in packages for q in [f,f.with_name(f.stem+'-bindings.json')]};assert paths==expected
 assert len(packages)==1 and set(packages[0].parent.iterdir())==expected
 for file,pin in p['inputFiles'].items():assert not Path(file).is_symlink()and H(Path(file).read_bytes())==pin
 raw=J(packages[0]);drafts={r['id']:r for r in raw['records']};assert len(drafts)==len(raw['records'])
 assert {r['id']:r for r in p['draftRecords']}==drafts
 original={r['id']:r for r in J(app/('content/esperienze-'+p['course']+'.json'))}
 bindings={r['id']:r for r in J(packages[0].with_name(packages[0].stem+'-bindings.json'))}
 validator=module('request_check719',D/'experiment_visibility_request.py')
 for r in p['records']:
  assert r['variant']in ['published','draft'];candidate=drafts[r['id']]if r['variant']=='draft'else original[r['id']];assert r['record']==candidate
  assert r['sourceSha256']==validator.digest(original[r['id']])==bindings[r['id']]['sourceSha256']
  if r['variant']=='draft':
   assert type(candidate['baseVersion'])is int and type(candidate['version'])is int and candidate['version']==candidate['baseVersion']+1
   assert r['candidateSha256']==validator.digest(candidate)==bindings[r['id']]['candidateSha256']
  else:assert r['candidateSha256']is None
  c=candidate['control'];lo=F(str(c['min']));step=F(str(c['step']));hi=F(str(c['max']));assert step>0
  for x in r['grid']:
   v=F(str(x));assert lo<=v<=hi and((v-lo)/step).denominator==1
  assert type(r['clockInput'])is bool and type(r['hasClock'])is bool
  if p['course']=='C3':assert not r['hasClock']and not r['clockCases']
 assert len(validator.planned_interactions(p))==len(set(p['expectedCaseKeys']))
 return {'input':str(info_path),'course':p['course'],'cases':len(p['expectedCaseKeys']),'collectorSha256':PIN,'guard':'PASS_METADATA_ONLY','Chrome':'NOT_RUN'}
if __name__=='__main__':print(json.dumps(check(sys.argv[1])))
