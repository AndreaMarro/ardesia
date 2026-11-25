import tempfile
import unittest
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from tools.export_discipline import CP, QTI, export
from multidiscipline.pack import load_pack


class Export(unittest.TestCase):
    def test_qti_bank_links_keys_and_feedback_match_canonical_records(self):
        p=Path(__file__).resolve().parents[1]/"examples/discipline/catalog.json"
        _,units=load_pack(p)
        activities={a["id"]:a for u in units.values() for a in u["activities"]}
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp)/"bank.zip"
            self.assertEqual(export(p,target),len(activities))
            first=target.read_bytes()
            export(p,target)
            self.assertEqual(target.read_bytes(),first)
            with ZipFile(target) as z:
                manifest=ET.fromstring(z.read("imsmanifest.xml"))
                files=[r.attrib["href"] for r in manifest.findall(f".//{{{CP}}}resource")]
                self.assertEqual(set(z.namelist()),set(files) | {"imsmanifest.xml"})
                for file in files:
                    a=activities[Path(file).stem]
                    node=ET.fromstring(z.read(file))
                    ns={"q":QTI}
                    self.assertEqual(node.find(".//q:qti-correct-response/q:qti-value",ns).text, "o_"+a["correctOptionId"])
                    for option in a["options"]:
                        identifier="o_"+option["id"]
                        self.assertEqual(node.find(f".//q:qti-simple-choice[@identifier='{identifier}']",ns).text,option["text"])
                        feedback=node.find(f".//q:qti-modal-feedback[@identifier='{identifier}']",ns)
                        text=" ".join(feedback.itertext())
                        self.assertIn(a["feedback"][option["id"]],text)
                        self.assertIn(a["solution"][-1]["body"],text)
                        self.assertIn(a["transfer"]["answer"],text)
