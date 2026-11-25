"""Selectable formulas retain the case of physically distinct variables."""
import json
from pathlib import Path
import unittest
from server.domain.assessment import matches

APP = Path(__file__).resolve().parents[2]

class ScientificChoiceCase(unittest.TestCase):
    def test_existing_choice_editions_preserve_selected_option_grading(self):
        checked=0
        for file in (APP/'content').glob('*.json'):
            rows=json.loads(file.read_text())
            if not isinstance(rows,list):
                continue
            for row in rows:
                answer=row.get('answer',{})
                if row.get('kind')!='question' or answer.get('type')!='choice':
                    continue
                checked+=1
                for option in answer['options']:
                    with self.subTest(key=row['id'],option=option):
                        self.assertEqual(matches(answer,option),option==answer['value'])
        self.assertGreater(checked,0)

    def test_each_real_formula_option_is_graded_by_its_identity(self):
        for batch, key in [('inelastic-rest-057','AR-u2-inelastic-rest-09'),
                           ('recoil-059','AR-u2-recoil-03')]:
            rows=json.loads((APP/'editorial/batches'/f'{batch}.json').read_text())['records']
            answer=next(row['answer'] for row in rows if row['id']==key)
            for option in answer['options']:
                with self.subTest(key=key,option=option):
                    self.assertEqual(matches(answer,option),option==answer['value'])

    def test_ambiguous_normalized_formula_is_not_guessed(self):
        answer={'type':'choice','value':'U=mv/M','options':['U=mv/M','U=Mv/m']}
        self.assertFalse(matches(answer,'u=mv/m'))

    def test_unambiguous_text_and_explicit_alias_remain_compatible(self):
        answer={'type':'choice','value':'È costante','options':['È costante','Diminuisce'],
                'aliases':['Rimane costante']}
        for value in ['  È COSTANTE  ','E\u0300 costante','rimane costante']:
            self.assertTrue(matches(answer,value))
        self.assertFalse(matches(answer,'DIMINUISCE'))

    def test_numeric_and_free_text_paths_remain_compatible(self):
        self.assertTrue(matches({'type':'numeric','value':'-0.1'},'−0,10'))
        self.assertFalse(matches({'type':'numeric','value':'-0.1'},'NaN'))
        self.assertTrue(matches({'type':'text','value':'L’energia'},"l'ENERGIA"))
