"""Adversarial checks independent of the author's parameter generator."""
import json
from pathlib import Path
import unittest
from unittest.mock import patch

from hypothesis import given, settings, strategies as st
import sympy as sp

from tools.corpus_engineering import circular_speed_verifier as verifier
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]


class CircularSpeedEvidence(unittest.TestCase):
    def load(self):
        home=APP/'editorial/batches'
        return json.loads((home/'circular-speed-024.json').read_text()),json.loads((home/'circular-speed-024-bindings.json').read_text())

    def test_all_individually_reviewed_editions_pass(self):
        package,bindings=self.load()
        rows=verifier.verify(package,bindings)
        self.assertEqual(len(rows),16)
        self.assertTrue(all(row['ok'] and row['manualArithmetic'] for row in rows))

    def test_wrong_answer_fails_even_after_rebinding_and_retokening(self):
        for index in range(16):
            with self.subTest(id=index+1):
                package,bindings=self.load();row=package['records'][index]
                row['answer']['value']=99 if row['answer']['type']=='numeric' else '99 '+verifier.UNITS[index+1]
                bindings[index]['candidateSha256']=digest(row)
                signature=next(s for r,b,s,a,e in reviewed_rows(package,bindings,{},verifier.EXPECTED_IDS,APP/'editorial/assets') if r['id']==row['id'])
                with patch.dict(verifier.REVIEWED_CANDIDATES,{row['id']:signature}):
                    result=next(r for r in verifier.verify(package,bindings) if r['id']==row['id'])
                    self.assertFalse(result['ok'])
                    self.assertTrue(any('Independent circular-position' in error for error in result['errors']))

    @settings(max_examples=50,deadline=None)
    @given(st.integers(1,1000),st.integers(1,1000),st.integers(1,100))
    def test_positive_radius_and_period_scaling_preserves_speed_and_turn_length(self,radius,period,scale):
        speed=2*sp.pi*radius/period
        self.assertEqual(sp.simplify(2*sp.pi*(scale*radius)/(scale*period)-speed),0)
        self.assertEqual(sp.simplify(speed*period-2*sp.pi*radius),0)
        self.assertEqual(sp.simplify(speed*period/(2*sp.pi)-radius),0)
