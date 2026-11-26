"""Physical annotation contracts against every installed legal fluid control.

These tests exercise actual elements consumed by both renderers. Mesh clearance
is a separate scope from camera, text-label and browser visibility acceptance.
"""
from fractions import Fraction
import json
from pathlib import Path
import subprocess
from unittest import TestCase
from tests.corpus.consumer_glyph_contract import arrow_geometry

APP = Path(__file__).resolve().parents[1]
NODE = """
import {esperienza} from './static/js/banchi/voci/esperimento.js';
import {readFileSync} from 'node:fs';
const ids=JSON.parse(readFileSync(0,'utf8'));
const sources=JSON.parse(readFileSync('content/esperienze-C2.json'));
const rows=[];
for (const id of ids) {
 const r=sources.find(r=>r.id===id), activity=await esperienza(r);
 const count=Math.round((r.control.max-r.control.min)/r.control.step);
 for(let i=0;i<=count;i++) {
  const x=r.control.min+i*r.control.step;
  rows.push({id,x,y:activity.model.solve({x}).y,elements:activity.elements(x,3)});
 }
}
console.log(JSON.stringify(rows));
"""


def length(e):
    return sum((e['b'][i]-e['a'][i])**2 for i in range(3))**.5


class FluidAnnotationContracts(TestCase):
    @classmethod
    def setUpClass(cls):
        ids=['SIM-C2-L001-02','SIM-C2-L007-03','SIM-C2-L007-04',
             'SIM-C2-L005-05','SIM-C2-L006-02','SIM-C2-L008-02']
        result=subprocess.run(['node','--input-type=module','-e',NODE],cwd=APP,
                              input=json.dumps(ids),capture_output=True,text=True,
                              check=True,timeout=30)
        cls.rows=json.loads(result.stdout)

    def test_full_couette_velocity_glyphs_clear_both_opaque_plates(self):
        for row in self.rows:
            if row['id'] not in {'SIM-C2-L001-02','SIM-C2-L007-03','SIM-C2-L007-04'}:
                continue
            with self.subTest(id=row['id'],x=row['x']):
                plates=[e for e in row['elements'] if e['kind']=='box' and e['alpha']==1]
                self.assertEqual(len(plates),2)
                front=max(e['p'][2]+e['size'][2]/2 for e in plates)
                arrows=[e for e in row['elements'] if e['kind']=='arrow' and e['c']==0x147979]
                if not arrows:
                    self.assertEqual(row['x'],0)
                    continue
                self.assertEqual(len(arrows),5)
                for e in arrows:
                    g=arrow_geometry(e)
                    vertices=[g['tail'],g['tip'],*g['tailCapRim'],*g['shaftJointRim'],*g['coneBaseRim']]
                    self.assertGreater(min(p[2] for p in vertices),front+.001)
                for i,e in enumerate(arrows,1):
                    self.assertAlmostEqual(length(e)/length(arrows[-1]),i/5,places=12)

    def test_pitot_full_columns_fit_their_tubes_without_saturation(self):
        gain=None
        for row in self.rows:
            if row['id']!='SIM-C2-L006-02':
                continue
            with self.subTest(speed=row['x']):
                rods=[e for e in row['elements'] if e['kind']=='rod']
                heads=[]
                for x in [-1.4,1.4]:
                    glass=next(e for e in rods if e['r']==.09 and e['a'][0]==x)
                    liquid=next(e for e in rods if e['r']==.062 and e['a'][0]==x)
                    self.assertGreaterEqual(liquid['a'][1],glass['a'][1])
                    self.assertLess(liquid['b'][1],glass['b'][1])
                    self.assertLess(liquid['r'],glass['r'])
                    heads.append(liquid['b'][1])
                self.assertAlmostEqual(row['y'],.5*row['x']**2,places=12)
                if row['x']==0:
                    self.assertAlmostEqual(heads[1],heads[0],places=12)
                else:
                    current=(heads[1]-heads[0])/row['x']**2
                    if gain is None:gain=current
                    self.assertGreater(current,0)
                    self.assertAlmostEqual(current,gain,places=12)

    def test_poiseuille_velocity_length_tracks_flow_divided_by_area(self):
        rows=[r for r in self.rows if r['id']=='SIM-C2-L008-02']
        reference=next(r for r in rows if r['x']==2)
        def annotation(row):
            arrow=next(e for e in row['elements'] if e['kind']=='arrow' and e['c']==0x147979)
            tube=next(e for e in row['elements'] if e['kind']=='rod' and e['alpha']==.22)
            return length(arrow),tube['r']
        baseline,r0=annotation(reference)
        for row in rows:
            with self.subTest(choice=row['x']):
                distance,radius=annotation(row)
                physical=(Fraction(str(row['y']))/Fraction(str(reference['y']))
                          *(Fraction(str(r0))/Fraction(str(radius)))**2)
                self.assertAlmostEqual(distance/baseline,float(physical),places=12)

    def test_bifurcation_incoming_and_branch_arrows_obey_conservation(self):
        for row in self.rows:
            if row['id']!='SIM-C2-L005-05':
                continue
            with self.subTest(branch_flow=row['x']):
                arrows=[e for e in row['elements'] if e['kind']=='arrow']
                incoming=[e for e in arrows if e['a'][2]==e['b'][2]==0]
                branches=[e for e in arrows if abs(e['a'][2])==.9]
                self.assertEqual(len(incoming),1)
                self.assertTrue(branches)
                self.assertAlmostEqual(length(incoming[0]),sum(map(length,branches)),places=12)
                self.assertTrue(all(e['b'][0]>e['a'][0] for e in arrows))
