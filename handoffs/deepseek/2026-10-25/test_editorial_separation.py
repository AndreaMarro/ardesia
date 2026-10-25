"""Regression for diagnostic leakage into final and previously shown problems."""
import copy
import json
import re
import unicodedata
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parent

def normalized(text):
    return re.sub(r'\W+','',unicodedata.normalize('NFKC',text).casefold())

def check_separation(courses):
    diagnostics=[];finals=[];shown=[]
    for c in courses:
        if len(c['diagnostic'])!=3:raise ValueError('three_diagnostics_per_course')
        diagnostics.extend(c['diagnostic']);finals.extend(c['atomicFinalAssessment'])
        for l in c['lessons']:
            shown.extend([l['workedExample']['prompt'],l['practice']['prompt'],l['transfer']['prompt']])
    if len(diagnostics)!=12:raise ValueError('twelve_diagnostics_required')
    ids=[d['id'] for d in diagnostics]
    if len(set(ids))!=12 or not all(i.startswith('diag-') for i in ids):raise ValueError('new_diagnostic_ids_required')
    if set(ids)&{f['id'] for f in finals}:raise ValueError('diagnostic_final_id_collision')
    prompts=[normalized(d['prompt']) for d in diagnostics]
    if len(set(prompts))!=12:raise ValueError('diagnostic_prompt_collision')
    forbidden={normalized(f['prompt']) for f in finals}|{normalized(s) for s in shown}
    if set(prompts)&forbidden:raise ValueError('diagnostic_leaks_final_or_shown_case')
    # A model case must give its data directly, not point to a closed example.
    for d in diagnostics:
        if re.search(r'\b(esempio precedente|come sopra|come prima|stessa lente|stessi resistori|stessi condensatori|stesso modulo)\b',d['prompt'].casefold()):raise ValueError('diagnostic_needs_hidden_context')
    return True

class SeparationTest(unittest.TestCase):
    def setUp(self):
        self.courses=json.loads((ROOT/'content/coursepack-handoff.json').read_text())['courses']
    def test_current_diagnostics_are_new_cases(self):
        self.assertTrue(check_separation(self.courses))
    def test_reused_final_is_rejected_even_with_a_fresh_id(self):
        c=copy.deepcopy(self.courses)
        c[0]['diagnostic'][0]={'id':'diag-control','prompt':c[0]['atomicFinalAssessment'][0]['prompt']}
        with self.assertRaisesRegex(ValueError,'diagnostic_leaks_final_or_shown_case'):check_separation(c)
    def test_punctuation_only_disguise_is_rejected(self):
        c=copy.deepcopy(self.courses)
        c[0]['diagnostic'][0]={'id':'diag-control','prompt':'  '+c[0]['lessons'][0]['practice']['prompt'].upper()+' !!!'}
        with self.assertRaisesRegex(ValueError,'diagnostic_leaks_final_or_shown_case'):check_separation(c)
    def test_duplicate_diagnostic_is_rejected(self):
        c=copy.deepcopy(self.courses);c[0]['diagnostic'][1]=copy.deepcopy(c[0]['diagnostic'][0])
        with self.assertRaises(ValueError):check_separation(c)
    def test_same_reference_frame_is_not_hidden_context(self):
        c=copy.deepcopy(self.courses)
        c[0]['diagnostic'][0]['prompt']='Due forze nello stesso riferimento sono(2,0)N e(0,3)N. Calcola la risultante.'
        self.assertTrue(check_separation(c))

if __name__=='__main__':unittest.main()
