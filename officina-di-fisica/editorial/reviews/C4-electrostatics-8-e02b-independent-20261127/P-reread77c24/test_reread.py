from pathlib import Path
from fractions import Fraction
import hashlib,json,re,math,unittest,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_bytes())
sha=lambda b:hashlib.sha256(b).hexdigest()
def cases():
    return [(e,load(D/'actual-browser'/e['file']))for e in load(D/'actual-browser/report.json')['cases']]
def svg_heads(svg,colour):
    children=list(ET.fromstring(svg));result=[]
    for i,p in enumerate(children[:-1]):
        if p.tag.rsplit('}',1)[-1]!='path'or p.get('stroke')!=colour:continue
        poly=children[i+1]
        if poly.tag.rsplit('}',1)[-1]!='polygon':continue
        a,b,x,y=map(float,re.findall(r'-?\d+(?:\.\d+)?',p.get('d')));length=math.hypot(x-a,y-b)
        points=[tuple(map(float,q.split(',')))for q in poly.get('points').split()]
        half=max(abs((px-x)*(y-b)-(py-y)*(x-a))/length for px,py in points)
        result.append({'axis':length,'headHalfWidth':half,'shaftHalfWidth':float(p.get('stroke-width'))/2})
    return result
class MidpointReread(unittest.TestCase):
    def test_actual24_identity_and_all_images_read(self):
        r=load(D/'actual-browser/report.json');t=load(D/'terminal-receipt.json');read=load(D/'raster-read-log.json')
        self.assertEqual(t['observedExitCode'],0);self.assertIsNone(t['observedSignal']);self.assertEqual(len(r['cases']),24)
        self.assertEqual(r['runtimeFingerprint']['sha256'],'77c13a37088c8b19e7e56558a85ff8ad644acf8488abb9b5d0a5214991c696d4');self.assertEqual(sha((D/'actual-browser/report.json').read_bytes()),t['reportSha256']);self.assertFalse(read['pending'])
        seen=set()
        for e,c in cases():
            self.assertEqual(sha((D/'actual-browser'/e['file']).read_bytes()),e['sha256']);self.assertTrue(c['technicalOk'])
            for s in c['screenshots']:
                self.assertEqual(sha((D/'actual-browser'/s['file']).read_bytes()),s['sha256']);seen.add(s['sha256'])
        self.assertEqual(seen,{x['imageSha256']for x in read['actuallyOpened']})
    def test_exact_field_tasks_zero_and_tenfold_operator(self):
        states=0;setups=0
        for entry,c in cases():
            if 'model'not in c:
                self.assertEqual(len(c['questions']),2)
                for q in c['questions']:self.assertTrue(q['status'].startswith('Corretto. '))
                setups+=1;continue
            x=Fraction(str(c['sourceReplayedX']));expected=Fraction(45,2)*(1-x);self.assertEqual(Fraction(str(c['model']['y'])),expected)
            primary=[e for e in c['elements']if e['kind']=='arrow'and e['c']==0x7350b0]
            detail=[e for e in c['elements']if e['kind']=='arrow'and e['c']==0x995a14]
            self.assertEqual((len(primary),len(detail)),(0,0)if expected==0 else(1,1))
            if primary:
                length=.78*(float(expected)/65)
                self.assertEqual(primary[0]['a'],[0,.96,.3]);self.assertEqual(primary[0]['b'],[length,.96,.3])
                self.assertEqual(detail[0]['a'],[0,1.57,.95]);self.assertEqual(detail[0]['b'],[10*length,1.57,.95])
                self.assertEqual(math.copysign(1,detail[0]['b'][0]),math.copysign(1,expected))
            states+=1
        self.assertEqual((states,setups),(18,6))
    def test_fallback_has_exposed_separate_head_and_declared_gain(self):
        checked=0
        for entry,c in cases():
            if 'model'not in c or not c['profile']['fallback']or c['model']['y']==0:continue
            heads=svg_heads(c['svg'],'#995a14');self.assertEqual(len(heads),1)
            self.assertGreater(heads[0]['headHalfWidth'],heads[0]['shaftHalfWidth']);self.assertIn('dieci volte',c['legend']);checked+=1
        self.assertEqual(checked,4)
    def test_legend_matches_changed_probe_and_arrow_colours(self):
        for entry,c in cases():
            if 'model'not in c:continue
            self.assertEqual([e['c']for e in c['elements']if e['kind']=='ball'and e.get('r')==.09],[0x147979])
            self.assertIn('Il punto verde P',c['legend']);self.assertIn('La freccia viola',c['legend']);self.assertIn('dettaglio ocra scuro',c['legend'])
            self.assertNotIn('il piccolo punto verde indica la posizione P della sonda. La freccia viola più vicina alla sonda',c['legend'])
if __name__=='__main__':unittest.main(verbosity=2)
