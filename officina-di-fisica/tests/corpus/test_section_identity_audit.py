"""Pure metadata guard; no package, registry, report or published writes."""
import base64,hashlib,json,unittest
from copy import deepcopy
from tools.corpus_engineering.section_identity_audit import assert_section_only,plan_section_corrections
REF='a'*40
# Independent fixture encoding, not a helper imported from the implementation.
def encoded(value):return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def checksum(value):return hashlib.sha256(encoded(value)).hexdigest()
def fixture(key='C1-FIX-001',batch='cric-fixture-one'):
 svg=b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>Fixture</title></svg>';asset=hashlib.sha256(svg).hexdigest();course=key.split('-')[0]
 old={'id':key,'kind':'question','course':course,'section':'Original navigation group','order':1,'title':'Fixture only','skill':course+'-L001','prerequisites':[],'version':1,'prompt':'Fixture only: calculate two newton','family':'fixture-force','difficulty':1,'blocks':[{'type':'formula','text':'F=2 N'}],'answer':{'type':'numeric','value':2,'unit':'N','tolerance':0},'hints':['Fixture hint'],'error':{'category':'calcolo','message':'Fixture feedback','target':course+'-L001'}}
 row={**deepcopy(old),'section':'Cohort title','version':2,'baseVersion':1,'reuse':['C6'],'coverage':['Fixture'],'review':'DRAFT'};row['blocks'].append({'type':'figure','src':'/asset/'+asset,'text':'Fixture figure'})
 provenance={'sourceRef':REF,'sourcePath':'officina-di-fisica/content/'+course+'.json','sourceId':key,'sourceOrigin':'cric','sourceVersion':1,'humanApproval':'NOT_RUN','status':'DRAFT','independentReview':'NOT_RUN'}
 binding={'id':key,'sourceId':key,'sourceSha256':checksum(old),'candidateSha256':checksum(row),'assetChecksums':{'fixture.svg':asset},'sourceRef':REF,'provenance':provenance,'provenanceSha256':checksum(provenance)}
 p={'schema':'astra/1','records':[row],'assets':[{'id':asset,'name':'fixture.svg','mime':'image/svg+xml','data':base64.b64encode(svg).decode()}]};b=[binding];new=deepcopy(p);new['records'][0]['section']=old['section'];nb=deepcopy(b);nb[0]['candidateSha256']=checksum(new['records'][0]);return p,b,new,nb,{key:old}
class SectionOnlyIdentityTests(unittest.TestCase):
 def setUp(self):self.p,self.b,self.new,self.nb,self.originals=fixture()
 def check(self):return assert_section_only(self.p,self.b,self.new,self.nb,self.originals,source_ref=REF)
 def renew(self):self.nb[0]['candidateSha256']=checksum(self.new['records'][0])
 def test_accepts_only_the_original_section_and_preserves_caller_inputs(self):
  before=encoded([self.p,self.b,self.new,self.nb,self.originals]);out=self.check();self.assertIsInstance(out,dict);self.assertEqual(out['changedIds'],['C1-FIX-001']);self.assertEqual(out['checkedIds'],['C1-FIX-001']);self.assertEqual(out['scientificApproval'],'NOT_RUN');self.assertEqual(encoded([self.p,self.b,self.new,self.nb,self.originals]),before)
 def test_rejects_wrong_answer_even_with_candidate_binding_renewed(self):
  self.new['records'][0]['answer']['value']=3;self.renew()
  with self.assertRaises(ValueError):self.check()
 def test_rejects_every_non_section_field_even_with_binding_renewed(self):
  changes={'kind':'lesson','course':'C2','order':2,'title':'Changed','version':3,'baseVersion':0,'skill':'C1-L002','prerequisites':['changed'],'family':'changed','difficulty':2,'prompt':'Different data','hints':['Changed'],'coverage':['Changed'],'reuse':[],'review':'PASS','exam':1,'unreadField':'added'}
  for field,value in changes.items():
   with self.subTest(field=field):
    self.new=deepcopy(fixture()[2]);self.nb=deepcopy(self.b);self.new['records'][0][field]=value;self.renew()
    with self.assertRaises(ValueError):self.check()
 def test_rejects_formula_unit_hint_or_feedback_drift(self):
  for kind in('formula','unit','feedback','figure'):
   self.new=deepcopy(fixture()[2]);self.nb=deepcopy(self.b);r=self.new['records'][0]
   if kind=='formula':r['blocks'][0]['text']='F=3 N'
   elif kind=='unit':r['answer']['unit']='kg'
   elif kind=='feedback':r['error']['message']='Changed attribution'
   else:r['blocks'][1]['text']='Changed caption'
   self.renew()
   with self.subTest(kind=kind),self.assertRaises(ValueError):self.check()
 def test_rejects_integer_boolean_or_float_equivalence(self):
  for field,value in [('baseVersion',True),('version',2.0)]:
   self.new=deepcopy(fixture()[2]);self.nb=deepcopy(self.b);self.new['records'][0][field]=value;self.renew()
   with self.assertRaises(ValueError):self.check()
  self.new=deepcopy(fixture()[2]);self.nb=deepcopy(self.b);self.new['records'][0]['answer']['value']=2.0;self.renew()
  with self.assertRaises(ValueError):self.check()
 def test_rejects_removed_field(self):
  del self.new['records'][0]['hints'];self.renew()
  with self.assertRaises(ValueError):self.check()
 def test_rejects_wrong_new_section(self):
  self.new['records'][0]['section']='Another heading';self.renew()
  with self.assertRaises(ValueError):self.check()
 def test_rejects_fake_original_with_matching_section(self):
  self.originals['C1-FIX-001']['section']='Forged source';self.new['records'][0]['section']='Forged source';self.renew()
  with self.assertRaises(ValueError):self.check()
 def test_rejects_invalid_old_or_new_candidate_binding(self):
  for target in('old','new'):
   self.b,self.nb=deepcopy(fixture()[1]),deepcopy(fixture()[3]);(self.b if target=='old'else self.nb)[0]['candidateSha256']='0'*64
   with self.assertRaises(ValueError):self.check()
 def test_rejects_source_or_provenance_rebinding(self):
  for field,value in [('sourceSha256','0'*64),('sourceRef','b'*40),('assetChecksums',{}),('extraBindingField','added')]:
   self.nb=deepcopy(fixture()[3]);self.nb[0][field]=value
   with self.subTest(field=field),self.assertRaises(ValueError):self.check()
  self.nb=deepcopy(fixture()[3]);self.nb[0]['provenance']['status']='PASS';self.nb[0]['provenanceSha256']=checksum(self.nb[0]['provenance'])
  with self.assertRaises(ValueError):self.check()
 def test_rejects_asset_or_package_envelope_change(self):
  self.new['assets'][0]['data']='changed'
  with self.assertRaises(ValueError):self.check()
  self.new=deepcopy(fixture()[2]);self.new['newEnvelope']='unreviewed'
  with self.assertRaises(ValueError):self.check()
 def test_rejects_missing_duplicate_or_reordered_ids(self):
  self.new['records']=[]
  with self.assertRaises(ValueError):self.check()
  self.new=deepcopy(fixture()[2]);self.new['records'].append(deepcopy(self.new['records'][0]))
  with self.assertRaises(ValueError):self.check()
  p2,b2,n2,nb2,o2=fixture('C1-FIX-002');self.p['records']+=p2['records'];self.b+=b2;self.new=deepcopy(fixture()[2]);self.new['records']=n2['records']+self.new['records'];self.nb=nb2+deepcopy(fixture()[3]);self.originals.update(o2)
  with self.assertRaises(ValueError):self.check()
 def test_rejects_wrong_source_pin_and_nonfinite_json(self):
  with self.assertRaises(ValueError):assert_section_only(self.p,self.b,self.new,self.nb,self.originals,source_ref='b'*40)
  self.new['records'][0]['answer']['value']=float('nan')
  with self.assertRaises(ValueError):self.check()
class SectionPlanTests(unittest.TestCase):
 def setUp(self):
  self.packages={};self.bindings={};self.originals={};rows=[]
  for key,batch in [('C1-FIX-001','cric-fixture-one'),('C2-FIX-001','cric-fixture-two')]:
   p,b,n,nb,orig=fixture(key,batch);raw=encoded(p);self.packages[batch]=raw;self.bindings[batch]=encoded(b);self.originals.update(orig);rows.append({'id':key,'batch':batch,'registered':True,'sourceSection':'Original navigation group','draftSection':'Cohort title','packageFileSha256':hashlib.sha256(raw).hexdigest()})
  self.audit={'sourceRef':REF,'rows':rows}
 def plan(self):return plan_section_corrections(self.audit,self.packages,self.bindings,self.originals)
 def test_groups_existing_packages_without_repartitioning_or_writes(self):
  before=encoded([self.audit,self.originals]);out=self.plan();self.assertIsInstance(out,dict);self.assertEqual(out['questionCount'],2);self.assertEqual(out['packageCount'],2);self.assertEqual([r['batch']for r in out['packages']],['cric-fixture-one','cric-fixture-two']);self.assertEqual(out['packages'][0]['packagePath'],'editorial/batches/cric-fixture-one.json');self.assertEqual(encoded([self.audit,self.originals]),before)
 def test_rejects_missing_package(self):
  del self.packages['cric-fixture-two']
  with self.assertRaises(ValueError):self.plan()
 def test_rejects_stale_package_checksum(self):
  self.audit['rows'][0]['packageFileSha256']='0'*64
  with self.assertRaises(ValueError):self.plan()
 def test_rejects_duplicate_audit_ids(self):
  self.audit['rows'].append(deepcopy(self.audit['rows'][0]))
  with self.assertRaises(ValueError):self.plan()
 def test_rejects_wrong_source_or_draft_sections(self):
  for field in('sourceSection','draftSection'):
   old=self.audit['rows'][0][field];self.audit['rows'][0][field]='Wrong'
   with self.assertRaises(ValueError):self.plan()
   self.audit['rows'][0][field]=old
 def test_rejects_unsafe_batch_names(self):
  self.audit['rows'][0]['batch']='../../outside'
  with self.assertRaises(ValueError):self.plan()
 def test_ignores_unregistered_c6_without_inventing_inputs(self):
  self.audit['rows'].append({'id':'C6-FIX-001','batch':'cric-c6-fixture','registered':False});out=self.plan();self.assertIsInstance(out,dict);self.assertEqual(out['questionCount'],2);self.assertEqual(out['excludedRows'],1)
 def test_rejects_incomplete_audit_coverage_within_a_selected_package(self):
  p=json.loads(self.packages['cric-fixture-one']);b=json.loads(self.bindings['cric-fixture-one']);p2,b2,n2,nb2,o2=fixture('C1-FIX-002');p['records']+=p2['records'];b+=b2;self.packages['cric-fixture-one']=encoded(p);self.bindings['cric-fixture-one']=encoded(b);self.originals.update(o2);self.audit['rows'][0]['packageFileSha256']=hashlib.sha256(encoded(p)).hexdigest()
  with self.assertRaises(ValueError):self.plan()
if __name__=='__main__':unittest.main()
