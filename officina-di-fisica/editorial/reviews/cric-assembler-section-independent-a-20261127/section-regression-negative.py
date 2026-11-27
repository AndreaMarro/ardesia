from pathlib import Path
import sys,importlib.util,json,unittest
A=Path(__file__).resolve().parents[3];sys.path.insert(0,str(A))
p=A/'tests/corpus/test_independent_cric_assembler_boundary_a.py'
s=importlib.util.spec_from_file_location('old_independent_boundary',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class SourceSectionRegression(unittest.TestCase):
 def test_original_section_preserved(self):
  row=m.source(1);row['section']='Original individual section'
  package,_=m.build([row],section='Wrong cohort section')
  self.assertEqual(package['records'][0]['section'],row['section'])
 def test_section_override_rejected(self):
  row=m.source(1);row['section']='Original individual section'
  with self.assertRaises(ValueError):m.build([row],overrides={1:{'section':'Wrong override'}})
if __name__=='__main__':unittest.main(verbosity=2)
