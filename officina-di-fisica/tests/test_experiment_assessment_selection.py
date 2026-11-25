"""Versioned pedagogical sampling preserves installed physical models and old editions."""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
from unittest import TestCase
from server import editor,store
from server.adapters.contracts import validate,schema

ROOT=Path(__file__).resolve().parents[1]


def browser_record(row):
    code="import {esperienza} from './static/js/banchi/voci/esperimento.js';import{readFileSync}from'node:fs';const r=JSON.parse(readFileSync(0,'utf8'));const x=await esperienza(r);console.log(JSON.stringify({assessment:x.record.assessment,prediction:x.record.prediction,references:x.record.references,steps:x.model.steps({x:r.control.min},x.model.solve({x:r.control.min}))}));"
    p=subprocess.run(['node','--input-type=module','-e',code],cwd=ROOT,input=json.dumps(row),text=True,capture_output=True)
    if p.returncode:raise ValueError(p.stderr)
    return json.loads(p.stdout)


class ExperimentAssessmentSelection(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows={r['id']:r for r in store.catalog_seed()}
        cls.source=cls.rows['SIM-C1-L001-06']

    def candidate(self,selection):
        return dict(deepcopy(self.source),version=2,baseVersion=1,assessmentSelection=selection)

    def test_existing_default_and_immutable_physics_are_retained(self):
        original=browser_record(self.source)
        self.assertEqual(original['assessment'][0]['value'],0)
        self.assertAlmostEqual(original['assessment'][1]['value'],-.34862297099063294)
        row=self.candidate({'schemaVersion':'1.0.0','points':[90,180]})
        self.assertTrue(editor.validate(None,row,self.rows))
        for field in ['skill','topic','apparatus','control','measure','references','substitution','discrete']:
            self.assertEqual(row.get(field),self.source.get(field))
        changed=deepcopy(row);changed['references']=[[0,4],[180,-4]]
        with self.assertRaises(store.Problem):editor.validate(None,changed,self.rows)

    def test_selected_notable_angles_drive_actual_consumer_and_never_claim_y(self):
        row=self.candidate({'schemaVersion':'1.0.0','points':[90,180]})
        old=browser_record(self.source);new=browser_record(row)
        self.assertEqual([r['value'] for r in new['assessment']],[0,-4])
        self.assertEqual(new['prediction'],old['prediction'])
        self.assertEqual(new['references'],old['references'])
        self.assertIn('180',new['assessment'][1]['prompt'])

    def test_fourth_teaching_step_uses_the_same_transfer_as_the_generated_problem(self):
        row=self.candidate({'schemaVersion':'1.0.0','points':[90,180]})
        selected=browser_record(row)
        self.assertIn('180',' '.join(selected['steps'][3]))
        self.assertNotIn('95',' '.join(selected['steps'][3]))

    def test_shipped_schema_rejects_duplicates_and_matches_json_value_equality(self):
        rule=schema('experiment-assessment-v1')
        validate({'schemaVersion':'1.0.0','points':[90,180]},rule)
        with self.assertRaises(store.Problem):validate({'schemaVersion':'1.0.0','points':[90,90]},rule)
        generic={'type':'array','uniqueItems':True,'items':{}}
        validate([True,1],generic)
        validate([{'x':[True]},{'x':[1]}],generic)
        for value in [[1,1.0],[{'x':[1]},{'x':[1.0]}]]:
            with self.assertRaises(store.Problem):validate(value,generic)

    def test_exact_antiparallel_comparison_is_zero_without_zeroing_small_physics(self):
        code="import{confronti}from'./static/js/banchi/voci/confronti.js';console.log(JSON.stringify([0,90,180,1e-12].map(x=>confronti['SIM-C1-L002-04'](x,6*Math.cos(x*Math.PI/180))[1])));"
        result=subprocess.run(['node','--input-type=module','-e',code],cwd=ROOT,text=True,capture_output=True,check=True)
        values=json.loads(result.stdout)
        self.assertEqual(values[:3],[0,6,0]);self.assertGreater(values[3],0)

    def test_perpendicular_horizontal_projection_is_exactly_zero(self):
        code="import{confronti}from'./static/js/banchi/voci/confronti.js';console.log(JSON.stringify([0,90,90-1e-8].map(x=>confronti['SIM-C1-L002-01'](x,0)[1])));"
        result=subprocess.run(['node','--input-type=module','-e',code],cwd=ROOT,text=True,capture_output=True,check=True)
        values=json.loads(result.stdout)
        self.assertEqual(values[:2],[10,0]);self.assertGreater(values[2],0)

    def test_malformed_selection_is_rejected_by_backend_and_actual_client(self):
        invalid=[None,[],{}, {'schemaVersion':'2.0.0','points':[90,180]},
                 {'schemaVersion':'1.0.0','points':[90]}, {'schemaVersion':'1.0.0','points':[90,180,0]},
                 {'schemaVersion':'1.0.0','points':[90,90]}, {'schemaVersion':'1.0.0','points':[-5,180]},
                 {'schemaVersion':'1.0.0','points':[90,181]}, {'schemaVersion':'1.0.0','points':[91,180]},
                 {'schemaVersion':'1.0.0','points':[True,180]}, {'schemaVersion':'1.0.0','points':['90',180]},
                 {'schemaVersion':'1.0.0','points':[90,180],'answers':[0,999]}]
        for selection in invalid:
            with self.subTest(selection=selection):
                row=self.candidate(selection)
                with self.assertRaises(store.Problem):editor.validate(None,row,self.rows)
                with self.assertRaises(ValueError):browser_record(row)

    def test_selector_is_not_silently_accepted_on_questions(self):
        question=deepcopy(next(r for r in self.rows.values() if r['kind']=='question'))
        question['assessmentSelection']={'schemaVersion':'1.0.0','points':[90,180]}
        with self.assertRaises(store.Problem):editor.validate(None,question,self.rows)

    def test_readout_numbers_roundtrip_through_the_existing_numeric_input(self):
        code="import{n}from'./static/js/banchi/misure.js';console.log(JSON.stringify([2000,8000,-2000,1234.5,.00012345].map(x=>({x,text:n(x),parsed:Number(n(x).replace(',','.'))}))));"
        result=subprocess.run(['node','--input-type=module','-e',code],cwd=ROOT,text=True,capture_output=True,check=True)
        rows=json.loads(result.stdout)
        for row in rows:
            with self.subTest(value=row['x']):
                self.assertAlmostEqual(row['parsed']/row['x'],1,delta=.0005)
        self.assertEqual(rows[0]['text'],'2000');self.assertEqual(rows[1]['text'],'8000')
