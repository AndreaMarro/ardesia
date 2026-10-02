"""Test: Teacher-review stub (P1) — corso revisionato dal docente.

COORDINATION.md roadmap: CourseFolder -> Atoms -> Blueprint -> Exporters ->
Docling-adapter -> LLM-planner -> Teacher-review.

Deterministico, zero-LLM, frozen/ValueError pattern. Nessuna deps nuova.
"""

import pytest

from lessonos.course.teacher_review import (
    ReviewAction,
    ReviewScope,
    TeacherReviewNote,
    TeacherReviewSet,
    is_course_approved,
    material_revision_sha256,
    make_empty_review_set,
    make_review_note,
)


# =============================================================================
# ReviewAction enum
# =============================================================================

class TestReviewAction:
    def test_all_actions_defined(self):
        """4 azioni: approve, revise, reject, flag."""
        assert len(ReviewAction) == 4

    def test_approve_value(self):
        assert ReviewAction.APPROVE.value == "approve"

    def test_revise_value(self):
        assert ReviewAction.REVISE.value == "revise"

    def test_reject_value(self):
        assert ReviewAction.REJECT.value == "reject"

    def test_flag_value(self):
        assert ReviewAction.FLAG.value == "flag"


# =============================================================================
# ReviewScope enum
# =============================================================================

class TestReviewScope:
    def test_all_scopes_defined(self):
        """4 scopes: course, module, lesson, atom."""
        assert len(ReviewScope) == 4

    def test_course_value(self):
        assert ReviewScope.COURSE.value == "course"

    def test_module_value(self):
        assert ReviewScope.MODULE.value == "module"

    def test_lesson_value(self):
        assert ReviewScope.LESSON.value == "lesson"

    def test_atom_value(self):
        assert ReviewScope.ATOM.value == "atom"


# =============================================================================
# TeacherReviewNote validation
# =============================================================================

class TestTeacherReviewNoteValidation:
    def test_valid_note(self):
        """Minimo: note_id, action, scope, target_id validi."""
        note = TeacherReviewNote(
            note_id="rev-001",
            action=ReviewAction.APPROVE,
            scope=ReviewScope.COURSE,
            target_id="calcolo-2",
        )
        assert note.note_id == "rev-001"
        assert note.action == ReviewAction.APPROVE
        assert note.scope == ReviewScope.COURSE
        assert note.target_id == "calcolo-2"
        assert note.comment == ""
        assert note.reviewer == ""

    def test_empty_note_id_raises(self):
        with pytest.raises(ValueError, match="note_id"):
            TeacherReviewNote(
                note_id="",
                action=ReviewAction.APPROVE,
                scope=ReviewScope.COURSE,
                target_id="calcolo-2",
            )

    def test_empty_target_id_raises(self):
        with pytest.raises(ValueError, match="target_id"):
            TeacherReviewNote(
                note_id="rev-001",
                action=ReviewAction.APPROVE,
                scope=ReviewScope.COURSE,
                target_id="",
            )

    def test_invalid_action_type_raises(self):
        with pytest.raises(ValueError, match="action.*ReviewAction"):
            TeacherReviewNote(
                note_id="rev-001",
                action="not_an_action",  # type: ignore
                scope=ReviewScope.COURSE,
                target_id="calcolo-2",
            )

    def test_invalid_scope_type_raises(self):
        with pytest.raises(ValueError, match="scope.*ReviewScope"):
            TeacherReviewNote(
                note_id="rev-001",
                action=ReviewAction.APPROVE,
                scope="not_a_scope",  # type: ignore
                target_id="calcolo-2",
            )

    def test_full_note(self):
        """Tutti i campi compilati."""
        note = TeacherReviewNote(
            note_id="rev-002",
            action=ReviewAction.REVISE,
            scope=ReviewScope.MODULE,
            target_id="derivate",
            comment="Aggiungere esempio pratico",
            reviewer="Prof. Rossi",
        )
        assert note.comment == "Aggiungere esempio pratico"
        assert note.reviewer == "Prof. Rossi"

    def test_note_is_frozen(self):
        """Non si puo modificare dopo creazione."""
        note = TeacherReviewNote(
            note_id="rev-001",
            action=ReviewAction.APPROVE,
            scope=ReviewScope.COURSE,
            target_id="calcolo-2",
        )
        with pytest.raises(AttributeError):
            note.comment = "nuovo"  # type: ignore


# =============================================================================
# make_review_note (stub factory)
# =============================================================================

class TestMakeReviewNote:
    def test_with_string_action(self):
        """Action come stringa viene convertita in enum."""
        note = make_review_note(
            note_id="rev-001",
            action="approve",
            scope="course",
            target_id="calcolo-2",
        )
        assert note.action == ReviewAction.APPROVE
        assert note.scope == ReviewScope.COURSE

    def test_with_enum_action(self):
        """Action come enum funziona direttamente."""
        note = make_review_note(
            note_id="rev-002",
            action=ReviewAction.REVISE,
            scope=ReviewScope.MODULE,
            target_id="derivate",
        )
        assert note.action == ReviewAction.REVISE

    def test_with_comment_and_reviewer(self):
        """Commento e reviewer pass-through."""
        note = make_review_note(
            note_id="rev-003",
            action="flag",
            scope="lesson",
            target_id="l1_derivatives",
            comment="Verificare esercizi",
            reviewer="Prof. Bianchi",
        )
        assert note.comment == "Verificare esercizi"
        assert note.reviewer == "Prof. Bianchi"

    def test_invalid_action_string_raises(self):
        with pytest.raises(ValueError, match="action.*approve"):
            make_review_note(
                note_id="rev-001",
                action="invalid_action",
                scope="course",
                target_id="calcolo-2",
            )

    def test_invalid_scope_string_raises(self):
        with pytest.raises(ValueError, match="scope.*course"):
            make_review_note(
                note_id="rev-001",
                action="approve",
                scope="invalid_scope",
                target_id="calcolo-2",
            )

    def test_invalid_action_type_raises(self):
        with pytest.raises(ValueError, match="action must be str or ReviewAction"):
            make_review_note(
                note_id="rev-001",
                action=123,  # type: ignore
                scope="course",
                target_id="calcolo-2",
            )

    def test_invalid_scope_type_raises(self):
        with pytest.raises(ValueError, match="scope must be str or ReviewScope"):
            make_review_note(
                note_id="rev-001",
                action="approve",
                scope=456,  # type: ignore
                target_id="calcolo-2",
            )

    def test_empty_note_id_raises(self):
        with pytest.raises(ValueError, match="note_id"):
            make_review_note(
                note_id="",
                action="approve",
                scope="course",
                target_id="calcolo-2",
            )

    def test_empty_target_id_raises(self):
        with pytest.raises(ValueError, match="target_id"):
            make_review_note(
                note_id="rev-001",
                action="approve",
                scope="course",
                target_id="",
            )


# =============================================================================
# TeacherReviewSet
# =============================================================================

class TestTeacherReviewSetValidation:
    def test_empty_set(self):
        """Set vuoto con course_id."""
        review = TeacherReviewSet(course_id="calcolo-2")
        assert review.course_id == "calcolo-2"
        assert len(review) == 0
        assert review.notes == ()

    def test_empty_course_id_raises(self):
        with pytest.raises(ValueError, match="course_id"):
            TeacherReviewSet(course_id="")

    def test_with_notes(self):
        """Set con note pre-caricate."""
        note1 = make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2")
        note2 = make_review_note("rev-002", action="flag", scope="module", target_id="derivate", comment="OK")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note1, note2))
        assert len(review) == 2
        assert review.notes[0] == note1
        assert review.notes[1] == note2


class TestTeacherReviewSetProperties:
    def test_has_approve_true(self):
        note = make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note,))
        assert review.has_approve is True

    def test_has_approve_false(self):
        note = make_review_note("rev-001", action="flag", scope="course", target_id="calcolo-2")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note,))
        assert review.has_approve is False

    def test_has_approve_empty(self):
        review = TeacherReviewSet(course_id="calcolo-2")
        assert review.has_approve is False

    def test_has_blockers_true_revise(self):
        note = make_review_note("rev-001", action="revise", scope="module", target_id="derivate")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note,))
        assert review.has_blockers is True

    def test_has_blockers_true_reject(self):
        note = make_review_note("rev-001", action="reject", scope="course", target_id="calcolo-2")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note,))
        assert review.has_blockers is True

    def test_has_blockers_false(self):
        note = make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note,))
        assert review.has_blockers is False

    def test_has_flags_true(self):
        note = make_review_note("rev-001", action="flag", scope="lesson", target_id="l1_derivatives")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note,))
        assert review.has_flags is True

    def test_has_flags_false(self):
        note = make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2")
        review = TeacherReviewSet(course_id="calcolo-2", notes=(note,))
        assert review.has_flags is False


class TestTeacherReviewSetFilter:
    def test_notes_for_scope(self):
        notes = (
            make_review_note("rev-001", action="approve", scope="course", target_id="corso"),
            make_review_note("rev-002", action="flag", scope="module", target_id="modulo-a"),
            make_review_note("rev-003", action="approve", scope="module", target_id="modulo-b"),
        )
        review = TeacherReviewSet(course_id="calcolo-2", notes=notes)
        modules = review.notes_for_scope(ReviewScope.MODULE)
        assert len(modules) == 2
        assert all(n.scope == ReviewScope.MODULE for n in modules)

    def test_notes_for_target(self):
        notes = (
            make_review_note("rev-001", action="approve", scope="course", target_id="corso"),
            make_review_note("rev-002", action="revise", scope="module", target_id="derivate"),
            make_review_note("rev-003", action="flag", scope="module", target_id="derivate"),
        )
        review = TeacherReviewSet(course_id="calcolo-2", notes=notes)
        derivate_notes = review.notes_for_target("derivate")
        assert len(derivate_notes) == 2
        assert all(n.target_id == "derivate" for n in derivate_notes)


class TestTeacherReviewSetAddNote:
    def test_add_note_immutable(self):
        """add_note non modifica l'originale ma restituisce un nuovo set."""
        original = make_empty_review_set("calcolo-2")
        note = make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2")
        new_set = original.add_note(note)
        assert len(original) == 0
        assert len(new_set) == 1
        assert new_set.notes[0] == note

    def test_add_note_invalid_type_raises(self):
        review = make_empty_review_set("calcolo-2")
        with pytest.raises(ValueError, match="note must be a TeacherReviewNote"):
            review.add_note("not_a_note")  # type: ignore

    def test_duplicate_note_id_raises(self):
        review = TeacherReviewSet(
            course_id="calcolo-2",
            notes=(make_review_note("rev-001", action="approve", scope="course", target_id="corso"),),
        )
        with pytest.raises(ValueError, match="rev-001"):
            review.add_note(
                make_review_note("rev-001", action="flag", scope="module", target_id="derivate")
            )


# =============================================================================
# Stub functions
# =============================================================================

class TestMakeEmptyReviewSet:
    def test_empty_review_set(self):
        review = make_empty_review_set("calcolo-2")
        assert review.course_id == "calcolo-2"
        assert len(review) == 0

    def test_empty_course_id_raises(self):
        with pytest.raises(ValueError, match="course_id"):
            make_empty_review_set("")


# =============================================================================
# is_course_approved
# =============================================================================

class TestIsCourseApproved:
    def test_revision_hash_tracks_actual_bytes_and_names(self):
        first = material_revision_sha256({"a.html": b"<p>R=10</p>", "b.svg": b"<svg/>"})
        assert first == material_revision_sha256({"b.svg": b"<svg/>", "a.html": b"<p>R=10</p>"})
        assert first != material_revision_sha256({"a.html": b"<p>R=11</p>", "b.svg": b"<svg/>"})
        assert first != material_revision_sha256({"a.html": b"<p>R=10</p>", "c.svg": b"<svg/>"})
        with pytest.raises(ValueError, match="at least one file"):
            material_revision_sha256({})

    def test_approval_binds_the_exact_material_revision(self):
        first = "a" * 64
        changed = "b" * 64
        review = TeacherReviewSet(
            course_id="circuiti",
            notes=(make_review_note(
                "rev-001", action="approve", scope="course", target_id="circuiti",
                reviewer="docente-test", revision_sha256=first,
            ),),
        )
        assert is_course_approved(review, first) is True
        assert is_course_approved(review, changed) is False
        assert is_course_approved(review) is False

    def test_legacy_or_anonymous_approval_cannot_authorize_material(self):
        revision = "a" * 64
        legacy = TeacherReviewSet(course_id="circuiti", notes=(make_review_note(
            "old", action="approve", scope="course", target_id="circuiti",
        ),))
        anonymous = TeacherReviewSet(course_id="circuiti", notes=(make_review_note(
            "anon", action="approve", scope="course", target_id="circuiti",
            revision_sha256=revision,
        ),))
        assert is_course_approved(legacy, revision) is False
        assert is_course_approved(anonymous, revision) is False

    def test_approved_with_approve_course(self):
        """APPROVE a livello COURSE = approvato."""
        revision = "a" * 64
        review = TeacherReviewSet(
            course_id="calcolo-2",
            notes=(make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2",
                                    reviewer="docente-test", revision_sha256=revision),),
        )
        assert is_course_approved(review, revision) is True

    def test_not_approved_empty_set(self):
        """Set vuoto = non approvato."""
        review = make_empty_review_set("calcolo-2")
        assert is_course_approved(review) is False

    def test_not_approved_with_blocker_revise(self):
        """REVISE blocca l'approvazione anche con approve COURSE."""
        revision = "a" * 64
        review = TeacherReviewSet(
            course_id="calcolo-2",
            notes=(
                make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2",
                                 reviewer="docente-test", revision_sha256=revision),
                make_review_note("rev-002", action="revise", scope="module", target_id="derivate",
                                 revision_sha256=revision),
            ),
        )
        assert is_course_approved(review, revision) is False

    def test_not_approved_with_blocker_reject(self):
        """REJECT blocca l'approvazione."""
        revision = "a" * 64
        review = TeacherReviewSet(
            course_id="calcolo-2",
            notes=(
                make_review_note("rev-001", action="reject", scope="course", target_id="calcolo-2",
                                 revision_sha256=revision),
            ),
        )
        assert is_course_approved(review, revision) is False

    def test_not_approved_with_flags_only(self):
        """Solo FLAG = non approvato (serve APPROVE esplicito)."""
        revision = "a" * 64
        review = TeacherReviewSet(
            course_id="calcolo-2",
            notes=(make_review_note("rev-001", action="flag", scope="lesson", target_id="l1_derivatives",
                                    revision_sha256=revision),),
        )
        assert is_course_approved(review, revision) is False

    def test_approve_with_flags_is_approved(self):
        """APPROVE COURSE + FLAG su moduli = approvato (flag non blocca)."""
        revision = "a" * 64
        review = TeacherReviewSet(
            course_id="calcolo-2",
            notes=(
                make_review_note("rev-001", action="approve", scope="course", target_id="calcolo-2",
                                 reviewer="docente-test", revision_sha256=revision),
                make_review_note("rev-002", action="flag", scope="module", target_id="derivate",
                                 comment="Verificare esercizi opzionali", revision_sha256=revision),
            ),
        )
        assert is_course_approved(review, revision) is True
