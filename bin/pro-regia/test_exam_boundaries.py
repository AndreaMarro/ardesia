"""Independent synthetic probes against PR #269; no production state touched."""
import tempfile
import unittest
from pathlib import Path

from lessonos.study import exam
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore


class ExamBoundaryProbes(unittest.TestCase):
    def status(self, question_id, answer):
        result = exam.grade_answers(exam.load_exam_pack(), {question_id: answer})
        return next(q['status'] for q in result['questions'] if q['questionId'] == question_id)

    def test_velocity_rejects_acceleration_unit(self):
        self.assertEqual(self.status('fis-comp-22', '10 m/s^2'), 'wrong')

    def test_velocity_rejects_unrecognized_unit_suffix(self):
        self.assertEqual(self.status('fis-comp-22', '10 m/s banana'), 'wrong')

    def test_pressure_does_not_ignore_kilo_prefix(self):
        self.assertEqual(self.status('fis-comp-29', '20000 kPa'), 'wrong')

    def test_pressure_accepts_equivalent_decimal_kpa(self):
        self.assertEqual(self.status('fis-comp-29', '20.0 kPa'), 'correct')

    def test_pressure_accepts_spaced_scientific_notation(self):
        self.assertEqual(self.status('fis-comp-29', '2 × 10^4 Pa'), 'correct')

    def test_correct_basic_answers_are_not_rejected(self):
        for question_id, answer in [('fis-comp-22', '10 m/s'), ('fis-comp-29', '20000 Pa'), ('fis-comp-29', '20 kPa')]:
            with self.subTest(answer=answer):
                self.assertEqual(self.status(question_id, answer), 'correct')

    def test_mur_2026_multiple_choice_has_five_options(self):
        # Allegato 2 DM 941/2026, point 4. This is a separate acceptance
        # criterion; a JSON/schema pass under the existing engine is weaker.
        pack = exam.load_exam_pack()
        self.assertEqual(len(pack['questions']), 31)
        mcq = [q for q in pack['questions'] if q['type'] == 'mcq']
        self.assertEqual(len(mcq), 21)
        self.assertEqual(sum(q['type'] == 'completion' for q in pack['questions']), 10)
        wrong_counts = {q['id']: len(q['options']) for q in mcq if len(q['options']) != 5}
        self.assertEqual(wrong_counts, {}, 'DM 941/2026 requires five alternatives per MCQ')

    def test_sqlite_privacy_receipt_retry_and_content_snapshot(self):
        with tempfile.TemporaryDirectory(prefix='ardesia-exam-probe-') as tmp:
            store = StudyStore(Path(tmp) / 'study.sqlite')
            try:
                tutor = store.create_principal('synthetic-review-tutor', 'teacher')
                student = store.create_principal('synthetic-review-student', 'student')
                peer = store.create_principal('synthetic-review-peer', 'student')
                store.create_edition(tutor, 'review-fixture')
                for actor in (student, peer):
                    store.add_test_member(tutor, 'review-fixture', actor.id)
                attempt = exam.start_attempt(store, student, 'review-fixture')
                self.assertIsNone(attempt['result'])
                self.assertTrue(all(not ({'answer', 'accepted', 'explanation'} & set(q)) for q in attempt['questions']))
                with self.assertRaises(StudyError):
                    exam.get_attempt(store, peer, attempt['id'])
                exam.save_answers(store, student, attempt['id'], {'fis-comp-22': '10 m/s'})
                first = exam.submit_attempt(store, student, attempt['id'])
                second = exam.submit_attempt(store, student, attempt['id'], {'fis-comp-22': 'nonsense'})
                self.assertEqual(first['result'], second['result'])
                self.assertEqual(first['submittedAt'], second['submittedAt'])
                count = store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='exam.submitted'").fetchone()[0]
                self.assertEqual(count, 1)
                # Replacing the live source path cannot change a stored attempt.
                previous = exam.CONTENT
                try:
                    exam.CONTENT = Path(tmp) / 'absent-new-pack.json'
                    self.assertEqual(exam.get_attempt(store, student, attempt['id'])['result'], first['result'])
                finally:
                    exam.CONTENT = previous
            finally:
                store.close()


if __name__ == '__main__':
    unittest.main(verbosity=2)
