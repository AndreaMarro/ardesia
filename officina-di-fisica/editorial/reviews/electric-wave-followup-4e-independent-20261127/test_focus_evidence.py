from pathlib import Path
import hashlib,json,math,re,unittest,xml.etree.ElementTree as ET
OUT=Path(__file__).resolve().parent
def load(path):return json.loads(path.read_bytes())
def cases():
    report=load(OUT/'actual-browser/report.json')
    return [load(OUT/'actual-browser'/c['file'])for c in report['cases']]
def heads(svg,color):
    result=[]
    for parent in ET.fromstring(svg).iter():
        children=list(parent)
        for i,node in enumerate(children[:-1]):
            if node.tag.rsplit('}',1)[-1]!='path'or node.get('stroke')!=color or node.get('stroke-width')!='2.7':continue
            polygon=children[i+1]
            if polygon.tag.rsplit('}',1)[-1]!='polygon':continue
            a,b,c,d=map(float,re.findall(r'-?\d+(?:\.\d+)?',node.get('d')))
            length=math.hypot(c-a,d-b);ux,uy=(c-a)/length,(d-b)/length
            vertices=[tuple(map(float,p.split(',')))for p in polygon.get('points').split()]
            halfwidth=max(abs((x-c)*uy-(y-d)*ux)for x,y in vertices)
            result.append({'axis':length,'headHalfwidth':halfwidth,'shaftHalfwidth':1.35,'headEscapesShaft':halfwidth>1.35})
    return result

class FocusEvidence(unittest.TestCase):
    def test_current_identity_54_and_read_images(self):
        r=load(OUT/'actual-browser/report.json');t=load(OUT/'actual-browser-terminal.json');read=load(OUT/'raster-read-log.json')
        self.assertEqual(t['observedExit'],0);self.assertIsNone(t['signal']);self.assertEqual(len(r['cases']),54)
        self.assertEqual(r['runtimeFingerprint']['sha256'],'4e753b9dbfa1f0062cdcc10d7a6f6f9ec83c4bd69bda9e4f276c3757e8dbba3b')
        self.assertEqual(hashlib.sha256((OUT/'actual-browser/report.json').read_bytes()).hexdigest(),t['reportSha256'])
        self.assertFalse(read['pending']);seen={c['imageSha256']for c in read['actuallyOpened']};self.assertEqual(len(seen),54)
        for c in r['cases']:
            raw=(OUT/'actual-browser'/c['file']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),c['sha256']);row=json.loads(raw)
            self.assertIn(row['imageSha256'],seen);self.assertEqual(hashlib.sha256((OUT/'actual-browser'/(row['imageSha256']+'.png')).read_bytes()).hexdigest(),row['imageSha256'])

    def test_doppler_remaining_label_mask_resolved(self):
        rows=[c for c in cases()if c['id']=='SIM-C5-L05-03'];self.assertEqual(len(rows),6)
        for c in rows:
            self.assertFalse(any(e['kind']=='label'and e['text']in ('Sorgente','Ricevitore')for e in c['observed']['elements']))
            self.assertFalse(any(g['tipInsideOpaqueLabel']for g in c['observed'].get('nativeGlyphs',[])))

    def test_electron_zero_threshold_and_declared_factor_four(self):
        for c in [c for c in cases()if c['id']=='SIM-C5-L07-03']:
            energy=c['input'];arrows=[e for e in c['observed']['elements']if e['kind']=='arrow'];green=[e for e in arrows if e['c']==0x147979];ochre=[e for e in arrows if e['c']==0xd49332]
            self.assertEqual(len(green),0 if energy==14 else 1);self.assertEqual(len(ochre),1 if energy in (15,16)else 0)
            for e in green+ochre:self.assertGreater(e['b'][0],e['a'][0])
            for e in ochre:
                self.assertIs(e['dettaglio'],True);self.assertEqual(e['b'][0],e['a'][0]+4*(.75*((energy-14)/11)))
            self.assertIn('quattro volte',c['legendText'])

    def test_coulomb_nonzero_fallback_has_directional_head_or_declared_detail(self):
        for c in [c for c in cases()if c['id']=='SIM-C4-L01-02'and c['profile']['fallback']]:
            with self.subTest(key=c['key']):
                primary=heads(c['observed']['svg'],'#7350b0');self.assertEqual(len(primary),2)
                detail=heads(c['observed']['svg'],'#d49332')
                primary_readable=all(p['headEscapesShaft']for p in primary)
                declared_detail=bool(detail)and all(p['headEscapesShaft']for p in detail)and'dettaglio'in c['legendText'].lower()
                self.assertTrue(primary_readable or declared_detail,{'input':c['input'],'width':c['width'],'primaryHeads':primary,'detailHeads':detail})

if __name__=='__main__':unittest.main(verbosity=2)
