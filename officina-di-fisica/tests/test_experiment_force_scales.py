"""Compare forces in the actual shared 3D/fallback geometry, using Newton's laws."""
import json
from pathlib import Path
import subprocess
from unittest import TestCase
ROOT=Path(__file__).resolve().parents[1]


def scenes(key,inputs):
    code="""import{esperienza}from'./static/js/banchi/voci/esperimento.js';import{colore}from'./static/js/banchi/voci/geometria.js';import{readFileSync}from'node:fs';const{key,inputs}=JSON.parse(readFileSync(0,'utf8'));const r=JSON.parse(readFileSync('content/esperienze-C1.json')).find(r=>r.id===key);const a=await esperienza(r);console.log(JSON.stringify(inputs.map(x=>{const es=a.elements(x,3);return {x,y:a.model.solve({x}).y,arrows:es.filter(e=>e.kind==='arrow').map(e=>({color:e.c,length:Math.hypot(...e.b.map((v,i)=>v-e.a[i])),dy:e.b[1]-e.a[1]})),labels:es.filter(e=>e.kind==='label').map(e=>e.text),colors:colore}})));"""
    result=subprocess.run(['node','--input-type=module','-e',code],cwd=ROOT,input=json.dumps({'key':key,'inputs':inputs}),text=True,capture_output=True,check=True)
    return json.loads(result.stdout)


class ActualForceGeometry(TestCase):
    def test_normal_and_weight_share_a_scale_at_every_installed_angle(self):
        for row in scenes('SIM-C1-L005-05',list(range(0,76,5))):
            with self.subTest(angle=row['x']):
                red=next(a for a in row['arrows'] if a['color']==row['colors']['rosso'])
                green=next(a for a in row['arrows'] if a['color']==row['colors']['verde'])
                self.assertAlmostEqual(green['length']/red['length'],row['y']/20,places=12)
                self.assertLessEqual(green['length'],red['length']+1e-12)
                self.assertIn('Peso (20 N)',row['labels'])

    def test_tension_and_weight_show_newtons_second_law_with_common_scale(self):
        for row in scenes('SIM-C1-L005-06',list(range(-5,6))):
            with self.subTest(acceleration=row['x']):
                red=next(a for a in row['arrows'] if a['color']==row['colors']['rosso'])
                green=next(a for a in row['arrows'] if a['color']==row['colors']['verde'])
                self.assertAlmostEqual(green['length']/red['length'],(10+row['x'])/10,places=12)
                self.assertGreater(green['dy'],0);self.assertLess(red['dy'],0)
                self.assertIn('Peso (20 N)',row['labels'])
                self.assertIn('Tensione',row['labels'])
