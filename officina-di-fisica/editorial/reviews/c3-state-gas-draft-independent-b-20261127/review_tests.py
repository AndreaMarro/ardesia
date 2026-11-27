from pathlib import Path
from fractions import Fraction as F
import json,unittest,hashlib
D=Path(__file__).resolve().parent;pack=json.loads((D/'candidate-package.json').read_text());bindings=json.loads((D/'candidate-bindings.json').read_text());old=json.loads((D/'original-C3.json').read_text());actual=json.loads((D/'installed.json').read_text())['results']
H=lambda x:hashlib.sha256(x).hexdigest();C=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
class Review(unittest.TestCase):
 def tasks(self,i,values,unit):
  row=actual[i];self.assertEqual(len(row['assessment']),2)
  for t,v,g in zip(row['assessment'],values,row['grades'],strict=True):self.assertEqual(t['value'],float(v));self.assertEqual(t['unit'],unit);self.assertTrue(g['ok'])
  for g in row['negativeGrades']:self.assertFalse(g['ok'])
 def test_01_piston(self):self.tasks(0,[F(20)+10*6,F(20)+10*4],'cm³')
 def test_02_pressure(self):self.tasks(1,[F(2,5)*400,F(2,5)*350],'kPa')
 def test_03_state(self):self.tasks(2,[F(120,4),F(120,3)],'kPa')
 def test_04_scales(self):self.tasks(3,[F(50)+F(27315,100),F(25)+F(27315,100)],'K')
 def test_05_isothermal(self):
  self.tasks(4,[F(240,6),F(240)/F(9,2)],'kPa');self.assertEqual((F(160,3)-F(5333,100))/F(160,3),F(1,16000))
 def test_06_temperature(self):self.tasks(5,[F(5,2)*160,F(5,2)*130],'K')
 def test_07_binding_identity(self):
  self.assertEqual(H((D/'candidate-package.json').read_bytes()),'f9367981287aaacfcdd2f09398aec15fcb22523769c5426ec0c7f2aa0fecccc9')
  self.assertEqual(H((D/'candidate-bindings.json').read_bytes()),'eeaa9f8bec0c85dbfa6ded8967b14a43a41cbfa4be8e4fa97fb07a36f3d649b1')
  for r,b in zip(pack['records'],bindings,strict=True):
   s=next(s for s in old if s['id']==r['id']);self.assertEqual(H(C(r)),b['candidateSha256']);self.assertEqual(H(C(s)),b['sourceSha256'])
   self.assertEqual((r['baseVersion'],r['version']),(s['version'],s['version']+1))
   for k in ['id','course','skill','apparatus','section','control','measure','formula','references','transferPrompt','substitution']:self.assertEqual(r[k],s[k],(r['id'],k))
 def test_08_manual_identity(self):self.assertEqual(H((D/'manual-read.md').read_bytes()),'2a642c0b77a1a348393956c26249b833c2b4041c78fd29dd2ace6f170ea8a71a')
if __name__=='__main__':unittest.main()
