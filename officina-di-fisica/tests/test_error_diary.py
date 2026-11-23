import json
import unittest
from pathlib import Path

from server.domain.error_diary import CATEGORIES, choose_retest, follow_up, recommendation

ROOT = Path(__file__).resolve().parents[1]


class DiaryEvidence(unittest.TestCase):
    def test_transfer_and_due_need_independent_observations(self):
        def event(seq, stamp, family, correct=True, aided=False):
            return dict(seq=seq, stamp=stamp, family=family, correct=correct, aided=aided)
        day = 24 * 60 * 60
        source = event(1, 30, "A", False)
        rows = [source, event(2, 30, "A"), event(3, 32, "B", aided=True)]
        first = follow_up(source, rows)
        self.assertEqual((first["transferAt"],first["delayedAt"],first["assistedAfter"],first["due"]), (None,None,1,30+day))
        rows += [event(4,34,"B"), event(5,34+3*day-1,"C")]
        before = follow_up(source, rows)
        self.assertEqual((before["transferAt"],before["delayedAt"],before["due"]),(34,None,34+3*day))
        self.assertEqual(recommendation(before,1,False,15,before["due"]-1)["step"],"review")
        self.assertEqual(recommendation(before,1,False,15,before["due"])["step"],"retry")
        rows.append(event(6,34+3*day,"B",aided=True))
        familiar = follow_up(source,rows)
        self.assertEqual((familiar["reviewedAt"],familiar["delayedAt"]),(34+3*day,None))
        self.assertEqual(recommendation(familiar,1,False,5,34+3*day)["step"],"representation")
        rows += [event(7,34+3*day,"D"),event(8,35+3*day,"E",aided=True)]
        after = follow_up(source, rows)
        self.assertEqual((after["delayedAt"],after["assistedAfter"]),(34+3*day,3))
        self.assertIsNone(follow_up(source,[event(9,12,"Z")])["transferAt"])
        self.assertEqual(recommendation(first,1,True,5,40)["step"],"prerequisite")
        self.assertEqual(recommendation(first,2,False,15,40)["step"],"representation")
        self.assertNotEqual(recommendation(first,1,False,5,40),recommendation(first,1,False,15,40))
        fresh = follow_up(source,[source])
        self.assertEqual(recommendation(fresh,1,False,5,30+day)["step"],"retry")
        self.assertNotEqual(recommendation(fresh,1,False,15,40),recommendation(fresh,1,False,15,40,assisted=True))

    def test_every_distributed_study_question_has_a_distinct_family_and_actual_resources(self):
        rows = [r for file in (ROOT/"content").glob("*.json") if file.name!="catalog.json" for r in json.loads(file.read_text())]
        lessons = {r["id"] for r in rows if r["kind"]=="lesson"}
        drawings = {r["skill"] for r in rows if r["kind"]=="experiment"}
        questions = [r for r in rows if r["kind"]=="question" and not r.get("exam")]
        self.assertEqual((len(questions),len(lessons)),(513,56))
        categories = set()
        for q in questions:
            skill = q["skill"]
            choices = [r for r in rows if r["kind"]=="question" and r["skill"]==skill]
            selected = choose_retest(q, choices, {q["id"]}, {q["family"]})
            alternatives = {r["id"] for r in choices if not r.get("exam") and r["id"]!=q["id"] and r["family"]!=q["family"]}
            self.assertIn(selected["id"],alternatives,q["id"])
            self.assertIn(skill,drawings & lessons,q["id"])
            self.assertTrue(q["error"]["message"])
            categories.add(q["error"]["category"])
        self.assertEqual(categories,set(CATEGORIES))
        q=questions[0]
        self.assertIsNone(choose_retest(q,[q,dict(q,id="XYZ"),dict(q,id="Q",family="nuova",exam=1)],set(),set()))
