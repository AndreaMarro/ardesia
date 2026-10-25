"""Portable UI projection must keep the exact source/pack binding."""
import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('course_export',ROOT/'bin/web/export_course_learning.py')
export=importlib.util.module_from_spec(spec);spec.loader.exec_module(export)

class ProjectionTest(unittest.TestCase):
 def test_transport_precision_is_explicit_and_rejects_nonfinite(self):
  self.assertEqual(export.transport_numbers(1.234567890123456),1.23456789012)
  self.assertEqual(export.transport_numbers(-1e-17),0.0)
  self.assertEqual(export.transport_numbers({'text':'1.234567890123456','value':1.234567890123456}),{'text':'1.234567890123456','value':1.23456789012})
  for value in (float('nan'),float('inf')):
   with self.assertRaises(ValueError):export.transport_numbers(value)
 def test_public_and_private_projections_share_exact_pack_and_source_refs(self):
  public=export.projection();private=export.projection(True)
  self.assertEqual(public['coreSourcesSha256'],private['coreSourcesSha256'])
  self.assertEqual(len(public['coreSourcesSha256']),9)
  for a,b in zip(public['courses'],private['courses']):
   self.assertEqual(a['packRef'],b['packRef'])
   self.assertIsNone(a['editorialMaterials'])
   self.assertTrue(b['editorialMaterials']['atomicFinalAssessment'])
   self.assertLess(len(a['lessons']),len(b['lessons']))
