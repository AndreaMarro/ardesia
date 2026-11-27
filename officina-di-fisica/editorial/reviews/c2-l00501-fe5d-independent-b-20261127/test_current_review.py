from pathlib import Path
import unittest,json,hashlib,copy,re,collections
from decimal import Decimal
from fractions import Fraction as F
from continuity_readout_verifier import verify_case,verify_dataset,projected_tracer_tests,fallback_head,load,H
D=Path(__file__).resolve().parent
class Review(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.i=load(D/'verified-raw-index.json');cls.config=load(D/'verifier-input.json');cls.cs={r['caseKey']:load(D/r['caseFile'])for r in cls.i['cases']};old=load(D/'historical-53bd/index.json');cls.old={r['caseKey']:load(D/r['caseFile'])for r in old['cases']};cls.plan=load(D/'verification-plan-before-current-raw.json')
 def test_01_frozen_plan_and_primary_before_current_raw(self):
  self.assertEqual(H((D/'verification-plan-before-current-raw.json').read_bytes()),self.config['planSha256']);self.assertEqual(H((D/'historical/primary-continuity-prompt-only.md').read_bytes()),'fa50a2ceeb39798796e28345c82631c669b8aad88f9f7a8dddfcddc8441b2907');self.assertEqual(H((D/'frozen_readout_form.py').read_bytes()),'78f00383f6de706742c28a9ef49e76c240da37e5477a41d67b829f1c986fe1a1')
 def test_02_six_final_parts_exact_160_coverage(self):
  self.assertEqual(len(self.i['groups']),6);self.assertEqual(sorted(g['cases']for g in self.i['groups']),[10,10,30,30,40,40]);self.assertEqual(len(self.cs),160)
  for g in self.i['groups']:self.assertEqual(g['terminal']['observedExitCode'],0);self.assertFalse(g['terminal']['timeoutTriggered'])
  self.assertEqual({g['sourceCommit']for g in self.i['groups']},{self.config['sourceCommit']})
 def test_03_all_current_and_historical_case_hashes(self):
  for row in self.i['cases']:self.assertEqual(H((D/row['caseFile']).read_bytes()),row['caseSha256'])
  for row in load(D/'historical-53bd/index.json')['cases']:self.assertEqual(H((D/row['caseFile']).read_bytes()),row['caseSha256'])
 def test_04_all_raw_PNG_hashes_and_66_images(self):
  seen=set()
  for r in self.i['cases']:
   for s in self.cs[r['caseKey']]['screenshots']:self.assertEqual(H((D/'raw'/r['group']/'actual'/s['file']).read_bytes()),s['sha256']);seen.add(s['sha256'])
  self.assertEqual(len(seen),66)
 def test_05_all_unchanged_scalar_controls_questions_fields(self):
  allowed={'sourceCommit','runtimeSha256','requestSha256','legend','screenshots','elements','nativeGlyphs','svg'}
  self.assertEqual(set(self.cs),set(self.old))
  for k,c in self.cs.items():
   self.assertEqual(set(c),set(self.old[k]))
   for f in set(c)-allowed:self.assertEqual(c[f],self.old[k][f],(k,f))
 def test_06_scene_delta_only_arrow_depth_detail(self):
  changed=0
  for k,c in self.cs.items():
   if'elements'not in c:continue
   a=self.old[k]['elements'];self.assertEqual(len(a),len(c['elements']))
   for before,after in zip(a,c['elements']):
    if before==after:continue
    self.assertEqual(before['kind'],'arrow');wanted=copy.deepcopy(before);wanted['dettaglio']=True;wanted['a'][2]=Decimal('0.4');wanted['b'][2]=Decimal('0.4');self.assertEqual(after,wanted);changed+=1
  self.assertEqual(changed,224)
 def test_07_same_current_editions_geometry_values_distinct_rasters_kept(self):
  diffs=[]
  for key,c in self.cs.items():
   if c['variant']!='draft':continue
   p=self.cs[key.replace('|draft|','|published|')]
   for field in['svg','elements','model','actualDOMControls','sourceReplayedX','sourceReplayedClockTime','readings','clockReadout','legend']:self.assertEqual(c.get(field),p.get(field))
   if c['screenshots']!=p['screenshots']:diffs.append('|'.join(key.split('|')[2:]))
  self.assertEqual(sorted(diffs),['1280|fixed_projection|clock|3','1280|fixed_projection|grid|3'])
 def test_08_eight_fallback_small_heads_now_protrude(self):
  keys=self.plan['frozenCriticalCases']['F01']['caseKeys'];self.assertEqual(len(keys),8)
  for key in keys:
   for color in['#147979','#7350b0']:
    f=fallback_head(self.cs[key]['svg'],color);self.assertEqual(F(f['headTransverseWidth']),9);self.assertEqual(F(f['shaftStroke']),F(27,10))
    with self.assertRaises(ValueError):fallback_head(self.old[key]['svg'],color)
 def test_09_sixteen_native_old_tip_occlusions_now_absent(self):
  keys=self.plan['frozenCriticalCases']['F02']['caseKeys'];self.assertEqual(len(keys),16)
  for key in keys:
   new=projected_tracer_tests(self.cs[key]);self.assertFalse(any(r['rayOcclusion']for r in new))
   old=projected_tracer_tests(self.old[key]);self.assertTrue(any(r['rayOcclusion']for r in old))
 def test_10_all144_readout_interactions_and_32_manual_replies(self):
  r=load(D/'independent-current-raw-arithmetic-geometry.json');self.assertEqual(r['strictArithmeticInteractions'],144);self.assertEqual(r['manualReplies'],32);self.assertEqual(r['caseCount'],160)
 def test_11_zero_flow_no_arrow_at_both_times(self):
  rows=[c for c in self.cs.values()if c.get('requestedX')==0];self.assertEqual(len(rows),32)
  for c in rows:self.assertEqual(c['model']['y'],0);self.assertFalse(any(e['kind']=='arrow'for e in c['elements']));self.assertIn('Distanza alla velocità media0 cm',c['readings'])
 def test_12_wrong_values_and_clock_drift_rejected(self):
  source=next(c for c in self.cs.values()if c.get('requestedX')==7 and c.get('requestedTime')==3)
  for mutation in['flow','time','distance','runtime','source','candidate']:
   c=copy.deepcopy(source)
   if mutation=='flow':c['model']['y']+=1
   elif mutation=='time':c['sourceReplayedClockTime']+=1
   elif mutation=='distance':c['readings']=c['readings'].replace('21 cm','22 cm')
   elif mutation=='runtime':c['runtimeSha256']='0'*64
   elif mutation=='source':c['sourceSha256']='0'*64
   else:c['candidateSha256']='0'*64
   with self.assertRaises(ValueError):verify_case(c,self.config)
 def test_13_typed_metadata_and_nonfinite_inputs_rejected(self):
  source=next(c for c in self.cs.values()if c.get('requestedX')==1 and c['variant']=='draft')
  for v in[True,False,1.0,float('inf'),float('nan'),Decimal('NaN'),Decimal('Infinity'),'1',None]:
   c=copy.deepcopy(source);c['requestedX']=v
   with self.assertRaises(ValueError):verify_case(c,self.config)
  c=copy.deepcopy(source);c['profile']['width']=True
  with self.assertRaises(ValueError):verify_case(c,self.config)
 def test_14_backslide_head_at_same_actual_endpoint_rejected(self):
  c=copy.deepcopy(self.cs[self.plan['frozenCriticalCases']['F01']['caseKeys'][0]]);svg=c['svg'];pat=r'<polygon points="([^\"]+)" fill="#147979"';h=re.search(pat,svg);pts=[tuple(map(Decimal,s.split(',')))for s in h[1].split()];tip=pts[0];bad=[tip,(pts[1][0],tip[1]+Decimal('.752')),(pts[2][0],tip[1]-Decimal('.752'))];replacement=' '.join(str(x)+','+str(y)for x,y in bad);c['svg']=svg.replace(h[1],replacement)
  with self.assertRaises(ValueError):verify_case(c,self.config)
 def test_15_reversed_or_on_axis_arrow_rejected(self):
  source=next(c for c in self.cs.values()if c.get('requestedX')==6)
  for kind in['reverse','axis']:
   c=copy.deepcopy(source);a=next(e for e in c['elements']if e['kind']=='arrow')
   if kind=='reverse':a['a'],a['b']=a['b'],a['a']
   else:a['a'][2]=0;a['b'][2]=0
   with self.assertRaises(ValueError):verify_case(c,self.config)
 def test_16_archive_members_and_git_snapshot_inputs(self):
  for e in load(D/'git-inputs.json')['inputs']:self.assertEqual(H((D/e['snapshot']).read_bytes()),e['sha256'])
  for a in load(D/'archive-authority-verification.json')['archives']:
   manifest=load(D/'archive-authority'/Path(a['manifestPath']).name)
   for path,sha in manifest['files'].items():self.assertEqual(H((D/'raw'/path).read_bytes()),sha)
 def test_17_full_sheets_cover_every_unique_png(self):
  seen=[]
  for s in self.i['sheets']:self.assertTrue(s['completeImages']);self.assertFalse(s['resized']);self.assertEqual(H((D/s['file']).read_bytes()),s['sha256']);seen.extend(s['sourcePngs'])
  self.assertEqual(len(self.i['sheets']),10);self.assertEqual(set(seen),set(self.i['uniqueScreenshots']));self.assertEqual(len(seen),66)
 def test_18_critical_read_receipt_exact24_and12(self):
  r=load(D/'critical-read-list.json');self.assertEqual(r['phase'],'COMPLETE_RASTER_READ');self.assertEqual(len(r['caseOccurrences']),24);self.assertEqual(r['directUniquePngsOpened'],12);self.assertEqual(len({r['sha256']for r in r['caseOccurrences']}),12)
 def test_19_native_glyph_tail_tip_match_scene(self):
  count=0
  for c in self.cs.values():
   for g in c.get('nativeGlyphs',[]):
    e=c['elements'][g['elementIndex']];self.assertEqual(e['kind'],'arrow');self.assertEqual(g['tail'],e['a']);self.assertEqual(g['tip'],e['b']);count+=1
  self.assertEqual(count,168)
 def test_20_all_stale53bd_backslides_refused_under_current_config(self):
  for key in self.plan['frozenCriticalCases']['F01']['caseKeys']+self.plan['frozenCriticalCases']['F02']['caseKeys']:
   with self.assertRaises(ValueError):verify_case(self.old[key],self.config)
 def test_21_all_current_fingerprints_and_changed_source_bytes(self):
  reports=[load(D/g['rawReportFile'])for g in self.i['groups']];fp=reports[0]['runtimeFingerprint']
  for r in reports:self.assertEqual(r['runtimeFingerprint'],fp)
  oldfp=load(D/'historical-53bd/raw-report-320-draft.json')['runtimeFingerprint'];self.assertEqual(set(fp['files']),set(oldfp['files']))
  changes={p for p in fp['files']if fp['files'][p]!=oldfp['files'][p]};self.assertEqual(changes,{'static/js/banchi/voci/apparati/fluidi.js','static/js/banchi/voci/legende.js','static/js/banchi/voci/modelli/C2.js'})
  for f in changes:
   snap='8de7bd77-'+f.split('static/js/banchi/')[1].replace('/','-');self.assertEqual(H((D/snap).read_bytes()),fp['files'][f])
if __name__=='__main__':unittest.main()
