"""Whole-glyph physical contracts; browser and camera acceptance are separate."""
import json
import math
from pathlib import Path
import subprocess
from unittest import TestCase
from tests.corpus.consumer_glyph_contract import arrow_geometry

APP = Path(__file__).resolve().parents[1]
NODE = """
import {esperienza} from './static/js/banchi/voci/esperimento.js';
import {readFileSync} from 'node:fs';
const ids=JSON.parse(readFileSync(0,'utf8')), rows=[];
const sources=['C3','C4','C5','C6'].flatMap(c=>JSON.parse(readFileSync('content/esperienze-'+c+'.json')));
for(const id of ids){
 const r=sources.find(r=>r.id===id),a=await esperienza(r);
 const count=Math.round((r.control.max-r.control.min)/r.control.step);
 for(let i=0;i<=count;i++){
  const x=r.control.min+i*r.control.step,y=a.model.solve({x}).y;
  const duration=a.clock?.duration(x,y);
  const times=duration>0?[0,duration/4,duration/2,3*duration/4,duration]:[0];
  for(const time of times)rows.push({id,x,time,y,elements:a.elements(x,3,time)});
 }
}
console.log(JSON.stringify(rows));
"""
IDS=['SIM-C3-L01-04','SIM-C3-L09-01','SIM-C3-L09-02','SIM-C3-L09-03',
     'SIM-C4-L02-01','SIM-C4-L09-02','SIM-C5-L05-03',
     'SIM-C5-L09-01','SIM-C5-L09-02','SIM-C6-L01-01']


def collect():
    p=subprocess.run(['node','--input-type=module','-e',NODE],cwd=APP,
                     input=json.dumps(IDS),capture_output=True,text=True,
                     check=True,timeout=45)
    return json.loads(p.stdout)


def vertices(arrow):
    g=arrow_geometry(arrow)
    return [g['tail'],g['tip'],*g['tailCapRim'],*g['shaftJointRim'],*g['coneBaseRim']]


def arrows(row,color):
    return [e for e in row['elements'] if e['kind']=='arrow' and e['c']==color]


class FieldHeatWaveAnnotationContracts(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=collect()

    def test_thermometer_column_cap_is_above_the_opaque_bulb(self):
        for row in self.rows:
            if row['id']!='SIM-C3-L01-04':continue
            with self.subTest(temperature=row['x']):
                bulb=next(e for e in row['elements'] if e['kind']=='ball' and e['c']==0xb94f48)
                column=next(e for e in row['elements'] if e['kind']=='rod' and e['c']==0xb94f48)
                self.assertGreater(column['b'][1],bulb['p'][1]+bulb['r'])
                self.assertAlmostEqual(column['b'][1],.55+1.72*(row['x']+50)/150,places=12)

    def test_engine_heat_and_work_glyphs_clear_reservoirs_and_engine(self):
        for row in self.rows:
            if not row['id'].startswith('SIM-C3-L09-0'):continue
            with self.subTest(id=row['id'],control=row['x'],time=row['time']):
                opaque=[e for e in row['elements'] if e['kind']=='box' and e['alpha']==1]
                self.assertEqual(len(opaque),2)
                front=max(e['p'][2]+e['size'][2]/2 for e in opaque)
                for arrow in [e for e in row['elements'] if e['kind']=='arrow']:
                    self.assertGreater(min(v[2] for v in vertices(arrow)),front)

    def test_probe_field_retains_inverse_square_and_clears_the_probe(self):
        for row in self.rows:
            if row['id']!='SIM-C4-L02-01':continue
            with self.subTest(distance=row['x']):
                probe=next(e for e in row['elements'] if e['kind']=='ball' and e['c']==0x147979)
                field=next(e for e in arrows(row,0x7350b0) if abs(e['a'][1]-probe['p'][1])<1e-12)
                self.assertGreater(min(v[2] for v in vertices(field)),probe['r'])
                self.assertAlmostEqual(arrow_geometry(field)['length'],90/(65*row['x']**2),places=12)

    def test_lorentz_vectors_clear_charge_and_preserve_cross_product(self):
        for row in self.rows:
            if row['id']!='SIM-C4-L09-02':continue
            with self.subTest(angle=row['x']):
                ball=next(e for e in row['elements'] if e['kind']=='ball' and e['c']==0xb94f48)
                velocity=arrows(row,0x147979)[0]
                self.assertGreater(min(v[1] for v in vertices(velocity)),ball['p'][1]+ball['r'])
                force=arrows(row,0x7350b0)
                if row['x'] in (0,180):self.assertEqual(force,[])
                else:
                    self.assertEqual(len(force),1)
                    self.assertGreater(min(v[2] for v in vertices(force[0])),ball['r'])
                    f=arrow_geometry(force[0]);v=arrow_geometry(velocity)
                    self.assertAlmostEqual(f['length'],.95*math.sin(math.radians(row['x'])),places=12)
                    self.assertAlmostEqual(sum(a*b for a,b in zip(f['delta'],v['delta'])),0,places=12)
                    self.assertLess(f['delta'][1],0)

    def test_doppler_pressure_arrow_clears_receiver_at_every_sampled_clock(self):
        seen=0
        for row in self.rows:
            if row['id']!='SIM-C5-L05-03':continue
            with self.subTest(speed=row['x'],time=row['time']):
                receiver=next(e for e in row['elements'] if e['kind']=='ball' and e['c']==0x7350b0)
                for arrow in arrows(row,0x7350b0):
                    seen+=1
                    self.assertGreater(min(v[2] for v in vertices(arrow)),receiver['r'])
        self.assertGreater(seen,0)

    def test_optical_ray_segments_clear_the_solid_base_and_preserve_angles(self):
        for row in self.rows:
            if row['id'] not in ('SIM-C5-L09-01','SIM-C5-L09-02'):continue
            with self.subTest(id=row['id'],angle=row['x']):
                ray=arrows(row,0x147979)[0]
                self.assertGreater(min(v[1] for v in vertices(ray)),0)
                delta=arrow_geometry(ray)['delta'];norm=math.sqrt(sum(d*d for d in delta))
                sine=math.sin(math.radians(row['x']))
                expected=sine if row['id'].endswith('-01') else sine/1.5
                self.assertAlmostEqual(delta[0]/norm,expected,places=12)

    def test_echo_return_glyph_clears_the_microphone_and_preserves_distance(self):
        for row in self.rows:
            if row['id']!='SIM-C6-L01-01':continue
            with self.subTest(delay=row['x'],time=row['time']):
                source=next(e for e in row['elements'] if e['kind']=='ball' and e['c']==0xd49332)
                back=arrows(row,0x7350b0)[0]
                self.assertLess(max(v[1] for v in vertices(back)),source['p'][1]-source['r'])
                self.assertGreater(min(v[1] for v in vertices(back)),0)
                self.assertAlmostEqual(arrow_geometry(back)['length'],3.95*row['x']/20,places=12)
                self.assertLess(back['b'][0],back['a'][0])
