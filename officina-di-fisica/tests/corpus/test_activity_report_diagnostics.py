"""Mismatch diagnostics must remain bounded and must never accept evidence."""
import unittest
from tools.corpus_engineering.batches import report_differences


class ActivityReportDiagnostics(unittest.TestCase):
    def test_nested_float_observation_is_exposed_without_rounding(self):
        a={'records':[{'checks':[{'length':0.75}]}]}
        b={'records':[{'checks':[{'length':0.7500000000000001}]}]}
        differences=report_differences(a,b)
        self.assertEqual(differences,[{'path':'$.records[0].checks[0].length','saved':'0.75','fresh':'0.7500000000000001'}])
        self.assertNotEqual(a,b)

    def test_diagnostic_count_and_scalar_text_are_bounded(self):
        left={str(i):'x'*10000 for i in range(100)}
        right={str(i):'y'*10000 for i in range(100)}
        result=report_differences(left,right,limit=3)
        self.assertEqual(len(result),3)
        self.assertTrue(all(len(item['saved'])<=240 and len(item['fresh'])<=240 for item in result))

    def test_literal_missing_string_is_not_confused_with_absent_field(self):
        differences=report_differences({'value':'<missing>'},{})
        self.assertEqual(len(differences),1)
        self.assertNotEqual(differences[0]['saved'],differences[0]['fresh'])

    def test_missing_field_and_different_list_length_are_visible(self):
        self.assertEqual(report_differences({'items':[1]},{'items':[1,2]})[0]['path'],'$.items')
        self.assertEqual(report_differences({'ok':True},{})[0]['path'],'$.ok')
        self.assertEqual(report_differences({'value':2},{'value':2}),[])
