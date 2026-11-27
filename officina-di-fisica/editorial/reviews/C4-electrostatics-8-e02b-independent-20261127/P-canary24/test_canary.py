from pathlib import Path
from fractions import Fraction
import json,hashlib,re,math,unittest,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_bytes())
sha=lambda b:hashlib.sha256(b).hexdigest()
def cases():
    return [(e,load(D/'actual-browser'/e['file']))for e in load(D/'actual-browser/report.json')['cases']]
class MidpointCanary(unittest.TestCase):
    def test_actual24_identity_and_all_images_read(self):
        report=load(D/'actual-browser/report.json');terminal=load(D/'terminal-receipt.json');read=load(D/'raster-read-log.json')
        self.assertEqual(terminal['observedExitCode'],0);self.assertIsNone(terminal['observedSignal']);self.assertEqual(len(report['cases']),24)
        self.assertEqual(report['runtimeFingerprint']['sha256'],'980518b78d0767d90f16322539852e7e79360e20f05078ceb6e9b0425e805301')
        self.assertEqual(sha((D/'actual-browser/report.json').read_bytes()),terminal['reportSha256']);self.assertFalse(read['pending'])
        opened={x['imageSha256']for x in read['actuallyOpened']};expected=set()
        for entry,c in cases():
            self.assertEqual(sha((D/'actual-browser'/entry['file']).read_bytes()),entry['sha256']);self.assertTrue(c['technicalOk'])
            for image in c['screenshots']:
                self.assertEqual(sha((D/'actual-browser'/image['file']).read_bytes()),image['sha256']);expected.add(image['sha256'])
        self.assertEqual(opened,expected)
    def test_exact_signed_field_cancellation_and_two_actual_tasks(self):
        n=0;setups=0
        for entry,c in cases():
            if 'model'not in c:
                self.assertEqual(len(c['questions']),2)
                for question in c['questions']:self.assertTrue(question['status'].startswith('Corretto. '))
                setups+=1;continue
            x=Fraction(str(c['sourceReplayedX']));expected=Fraction(45,2)*(1-x)
            self.assertEqual(Fraction(str(c['model']['y'])),expected)
            green=[e for e in c['elements']if e['kind']=='arrow'and e['c']==0x147979]
            self.assertEqual(len(green),0 if expected==0 else 1)
            for arrow in green:self.assertEqual(math.copysign(1,arrow['b'][0]-arrow['a'][0]),math.copysign(1,expected))
            n+=1
        self.assertEqual((n,setups),(18,6))
    def test_nonzero_fallback_head_adds_shape_outside_shaft(self):
        for entry,c in cases():
            if 'model'not in c or not c['profile']['fallback']or c['model']['y']==0:continue
            children=list(ET.fromstring(c['svg']));count=0
            for i,path in enumerate(children[:-1]):
                if path.tag.rsplit('}',1)[-1]!='path'or path.get('stroke')!='#147979':continue
                poly=children[i+1]
                if poly.tag.rsplit('}',1)[-1]!='polygon':continue
                a,b,x,y=map(float,re.findall(r'-?\d+(?:\.\d+)?',path.get('d')));length=math.hypot(x-a,y-b)
                points=[tuple(map(float,p.split(',')))for p in poly.get('points').split()]
                halfwidth=max(abs((px-x)*(y-b)-(py-y)*(x-a))/length for px,py in points);stroke=float(path.get('stroke-width'))/2
                with self.subTest(caseKey=entry['caseKey']):self.assertGreater(halfwidth,stroke,{'axis':length,'headHalfWidth':halfwidth,'strokeHalfWidth':stroke})
                count+=1
            self.assertEqual(count,1)
    def test_legend_does_not_assign_wrong_colours_to_midpoint_roles(self):
        # These are guards against the two specific source/legend false claims,
        # not a sufficient future acceptance test for arbitrary rewritten prose.
        for entry,c in cases():
            if 'model'not in c:continue
            self.assertEqual([e['c']for e in c['elements']if e['kind']=='ball'and e.get('r')==.09],[0xd49332])
            legend=c['legend']
            with self.subTest(caseKey=entry['caseKey']):
                self.assertNotIn('il piccolo punto verde indica la posizione P',legend)
                self.assertNotIn('La freccia viola più vicina alla sonda rappresenta E',legend)
if __name__=='__main__':unittest.main(verbosity=2)
