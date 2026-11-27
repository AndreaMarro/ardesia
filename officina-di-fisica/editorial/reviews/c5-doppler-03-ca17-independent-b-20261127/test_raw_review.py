from pathlib import Path
import json,hashlib,unittest,re,copy
from decimal import Decimal
D=Path(__file__).resolve().parent
J=lambda p:json.loads(p.read_text());H=lambda b:hashlib.sha256(b).hexdigest()
def cases(root):return {(c:=J(root/e['file']))['caseKey']:c for e in J(root/'report.json')['cases']}
def glyph(svg,color):
 p=re.search(r'<path d="M([^\"]+)" fill="none" stroke="'+color+r'" stroke-width="([\d.]+)"',svg)
 h=re.search(r'<polygon points="([^\"]+)" fill="'+color+r'"',svg)
 if not p or not h:return None
 pts=[tuple(map(Decimal,s.split(',')))for s in h[1].split()]
 return {'headWidth':max(y for x,y in pts)-min(y for x,y in pts),'headAcrossX':max(x for x,y in pts)-min(x for x,y in pts),'shaft':Decimal(p[2]),'points':pts}
class RawReview(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.r=J(D/'raw/report.json');cls.c=cases(D/'raw');cls.old=cases(D/'historical-53bd')
 def test_01_actual_terminal_scope(self):
  self.assertEqual(J(D/'terminal.json')['observedExitCode'],0);self.assertFalse(J(D/'terminal.json')['timeoutTriggered']);self.assertEqual(len(self.c),64);self.assertEqual(self.r['errors'],[])
  self.assertEqual(self.r['sourceCommit'],'f1fdd0dae20e03fba233a9ee6e0425f1f3197bae');self.assertEqual(self.r['runtimeFingerprint']['sha256'],'ca17f5b64aadd1923922854e22281f83e4dce1dbcdbbb4bbacf514a33b6d4ea3')
 def test_02_all_case_png_hashes(self):
  for e in self.r['cases']:
   self.assertEqual(H((D/'raw'/e['file']).read_bytes()),e['sha256'])
   for s in self.c[next(k for k in self.c if self.c[k]==J(D/'raw'/e['file']))]['screenshots']:self.assertEqual(H((D/'raw'/s['file']).read_bytes()),s['sha256'])
 def test_03_historical_snapshots_remain_exact(self):
  self.assertEqual(H((D/'historical-53bd/report.json').read_bytes()),'4e9dd5f310172998dce548f11f41bb138320bc779d0b9957c1996d9a8c80ffd1')
  for e in J(D/'historical-53bd/report.json')['cases']:self.assertEqual(H((D/'historical-53bd'/e['file']).read_bytes()),e['sha256'])
 def test_04_plan_eight_profiles_and_clocks(self):
  self.assertEqual(set(self.c),set(J(D/'prepared.json')['expectedCaseKeys']));profiles={(c['profile']['width'],c['profile']['view'])for c in self.c.values()};self.assertEqual(len(profiles),8)
  for w,v in profiles:self.assertEqual({(c['requestedX'],c['requestedTime'])for c in self.c.values()if c['profile']['width']==w and c['profile']['view']==v and c.get('interaction',{}).get('kind')=='clock'},{(-20,5),(-20,15),(40,20)})
 def test_05_only_draft03_and_same_candidate(self):
  for c in self.c.values():self.assertEqual((c['id'],c['variant'],c['candidateSha256']),('SIM-C5-L05-03','draft','503579de6ebd86390e7cc0e45a7d3b22e44efdd9582f29af331b5e4dcc5f6379'))
 def test_06_all_unmodified_case_fields(self):
  allowed={'sourceCommit','requestSha256','runtimeSha256','legend','elements','screenshots','svg'}
  self.assertEqual(set(self.old),set(self.c))
  for k,c in self.c.items():
   self.assertEqual(set(c),set(self.old[k]))
   for f in set(c)-allowed:self.assertEqual(c[f],self.old[k][f],(k,f))
 def test_07_scene_delta_only_red_detail_flag(self):
  changed=0
  for k,c in self.c.items():
   a=self.old[k].get('elements');b=c.get('elements')
   if a is None:self.assertIsNone(b);continue
   self.assertEqual(len(a),len(b))
   for ae,be in zip(a,b):
    if ae!=be:
     self.assertEqual(ae['kind'],'arrow');self.assertEqual(ae['c'],12144456);self.assertEqual(be,{**ae,'dettaglio':True});changed+=1
  self.assertEqual(changed,48)
 def test_08_red_negative_direction_head_now_exposed(self):
  cs=[c for c in self.c.values()if c['profile']['fallback']and c.get('requestedX')==-20];self.assertEqual(len(cs),6)
  for c in cs:
   g=glyph(c['svg'],'#b94f48');self.assertEqual(g['headWidth'],Decimal(9));self.assertGreater(g['headWidth'],g['shaft']);self.assertLess(g['points'][0][0],g['points'][1][0])
   old=glyph(self.old[c['caseKey']]['svg'],'#b94f48');self.assertEqual(old['headWidth'],Decimal('2.4064'));self.assertLess(old['headWidth'],old['shaft'])
 def test_09_legend_observed_pressure_and_top(self):
  cs=[c for c in self.c.values()if 'legend'in c];self.assertEqual(len(cs),56)
  for c in cs:
   self.assertIn('pressione relativa',c['legend']);self.assertIn('scala propria',c['legend']);self.assertIn('Il ricevitore resta fermo',c['legend'])
   self.assertEqual('Dall’alto'in c['legend'],c['profile']['view']=='top')
 def test_10_manual16_actual_replies_unchanged(self):
  cs=[c for c in self.c.values()if c['caseKey'].endswith('setup')];self.assertEqual(sum(len(c['questions'])for c in cs),16)
  for c in cs:
   self.assertEqual(c['questions'],self.old[c['caseKey']]['questions'])
   for q in c['questions']:self.assertEqual(q['actualPrompt'],q['prompt']);self.assertTrue(q['status'].startswith('Corretto.'))
 def test_11_red_zero_has_no_arrow(self):
  for c in self.c.values():
   if c.get('requestedX')==0:
    self.assertFalse(any(e.get('kind')=='arrow'and e.get('c')==12144456 for e in c['elements']))
 def test_12_pressure_small_fallback_residual_not_hidden(self):
  cs=[c for c in self.c.values()if c['profile']['fallback']and c.get('requestedX')==-20 and c['interaction']['kind']=='grid'];self.assertEqual(len(cs),2)
  for c in cs:
   g=glyph(c['svg'],'#7350b0');self.assertLess(g['headAcrossX'],g['shaft']);self.assertEqual(g['points'],glyph(self.old[c['caseKey']]['svg'],'#7350b0')['points'])
 def test_13_runtime_file_map_delta_scoped(self):
  a=J(D/'historical-53bd/report.json')['runtimeFingerprint']['files'];b=self.r['runtimeFingerprint']['files'];self.assertEqual(set(a),set(b));self.assertEqual({p for p in a if a[p]!=b[p]},{'static/js/banchi/voci/apparati/onde.js','static/js/banchi/voci/legende.js'})
 def test_14_sheet_mapping_all64_and_hashes(self):
  i=J(D/'verified-raw-index.json');keys=[]
  for s in i['sheets']:
   self.assertFalse(s['resized']);self.assertTrue(s['rawImagesIncludedComplete']);self.assertEqual(H((D/s['file']).read_bytes()),s['sha256']);keys.extend(s['caseKeys'])
  self.assertEqual(len(keys),64);self.assertEqual(set(keys),set(self.c))
 def test_15_independent_math56_strict(self):
  m=J(D/'independent-clock-frequency.json');self.assertEqual(m['applicationImports'],[]);self.assertEqual(m['strictFrequencyMatches'],56);self.assertEqual({x['caseKey']for x in m['rows']},{k for k,c in self.c.items()if c.get('interaction')})
 def test_16_svg_delta_only_red_head(self):
  changed=0
  for k,c in self.c.items():
   if 'svg'not in c:continue
   a=self.old[k]['svg'];b=c['svg']
   if a!=b:
    pat=r'<polygon points="[^\"]+" fill="#b94f48">'
    old=re.search(pat,a);new=re.search(pat,b);self.assertIsNotNone(old);self.assertIsNotNone(new)
    self.assertEqual(b.replace(new[0],old[0]),a);changed+=1
  self.assertEqual(changed,12)
 def test_17_source_snapshots_hashes(self):
  es=J(D/'git-inputs.json')['inputs'];self.assertEqual(len(es),4)
  for e in es:self.assertEqual(H((D/e['snapshot']).read_bytes()),e['sha256'])
if __name__=='__main__':unittest.main()
