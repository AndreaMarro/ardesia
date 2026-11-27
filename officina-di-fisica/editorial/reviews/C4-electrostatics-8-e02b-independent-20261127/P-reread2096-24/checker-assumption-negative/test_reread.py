from pathlib import Path
from fractions import Fraction
import hashlib,json,re,math,unittest,os,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parent
DATA=Path(os.environ.get('MIDPOINT_CASE_ROOT',str(D/'actual-browser')))
load=lambda p:json.loads(p.read_bytes())
sha=lambda b:hashlib.sha256(b).hexdigest()
def cases():
    return [(e,load(DATA/e['file']))for e in load(DATA/'report.json')['cases']]
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
        self.assertEqual(r['runtimeFingerprint']['sha256'],'2096493ae86311ec459e012032cd1f8fe41293326cc5769d86376aa5a0b59635');self.assertEqual(sha((D/'actual-browser/report.json').read_bytes()),t['reportSha256']);self.assertFalse(read['pending'])
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
    def test_charge_labels_are_off_geometry_and_accessible(self):
        checked=0
        for entry,c in cases():
            if 'model' not in c:continue
            with self.subTest(case=entry['caseKey']):
                labels=[e['text']for e in c['elements']if e['kind']=='label']
                self.assertEqual(labels,['P'])
                self.assertIn('sinistra è fissa a +1 nC',c['legend'])
                self.assertIn('destra mostra il valore con segno',c['legend'])
                self.assertIn('Carica di destra',c['readings'])
                x=Fraction(str(c['sourceReplayedX']))
                control=next(a for a in c['actualDOMControls']if a['name']=='x')
                self.assertEqual(Fraction(control['value']),x)
            checked+=1
        self.assertEqual(checked,18)
    def test_primitives_models_inputs_unchanged_except_labels(self):
        old=D.parent/'P-reread77c24/actual-browser'
        rows={e['caseKey']:load(old/e['file'])for e in load(old/'report.json')['cases']}
        for entry,c in cases():
            a=rows[entry['caseKey']]
            if 'model'not in c:
                self.assertEqual(a['questions'],c['questions']);self.assertEqual(a['phases'],c['phases']);continue
            self.assertEqual(c['model'],a['model']);self.assertEqual(c['actualDOMControls'],a['actualDOMControls'])
            self.assertEqual([e for e in c['elements']if e['kind']!='label'],[e for e in a['elements']if e['kind']!='label'])
if __name__=='__main__':unittest.main(verbosity=2)
