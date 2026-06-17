"""CRM-primitives: anonymised teacher/class/student relation (zero-PII).

Two invariants under test:
  1. The entities are *structurally* PII-free — opaque pseudonyms only, no
     ``name``/``email``/``dob`` field, and the guard rejects the obvious PII
     shapes (whitespace, ``@``).
  2. The SQLite CRUD round-trips faithfully, scopes/orders correctly, and the
     ``students``/``teachers`` tables hold no personal column to leak.

All identifiers in this file are synthetic opaque tokens — ZERO real PII.
"""

from __future__ import annotations

from dataclasses import fields
from pathlib import Path as FsPath

import pytest

from lessonos.models.crm import (
    Enrollment,
    SchoolClass,
    Student,
    Teacher,
    assert_pseudonymous,
)
from lessonos.store import SQLiteStore
from lessonos.store.sqlite import SCHEMA_VERSION


# --- Entities: anonymisation guard --------------------------------------------

class TestPseudonymGuard:
    def test_round_trip_equality(self) -> None:
        assert Teacher("t_001") == Teacher("t_001")
        assert SchoolClass("cls_3a", "t_001", "fisica") == SchoolClass(
            "cls_3a", "t_001", "fisica"
        )
        assert Student("stu_a1b2") == Student("stu_a1b2")
        assert Enrollment("enr_1", "cls_3a", "stu_a1b2") == Enrollment(
            "enr_1", "cls_3a", "stu_a1b2"
        )

    @pytest.mark.parametrize("name_like", ["Mario Rossi", "Anna  Bianchi", "a b"])
    def test_rejects_full_name_shape_whitespace(self, name_like: str) -> None:
        with pytest.raises(ValueError):
            Student(name_like)
        with pytest.raises(ValueError):
            Teacher(name_like)

    @pytest.mark.parametrize(
        "email_like", ["mario@example.com", "a@b", "stu@school.it"]
    )
    def test_rejects_email_shape_at_sign(self, email_like: str) -> None:
        with pytest.raises(ValueError):
            Student(email_like)

    def test_rejects_empty_id(self) -> None:
        with pytest.raises(ValueError):
            Teacher("")
        with pytest.raises(ValueError):
            Student("")

    def test_guard_propagates_through_every_id_field(self) -> None:
        # Each *_id field is guarded independently — a clean enrollment_id must
        # not mask a PII-shaped class_id or student_id.
        with pytest.raises(ValueError):
            SchoolClass("cls_3a", "Prof Rossi", "fisica")  # teacher_id is a name
        with pytest.raises(ValueError):
            Enrollment("enr_1", "cls_3a", "stu name")  # student_id is a name
        with pytest.raises(ValueError):
            Enrollment("enr 1", "cls_3a", "stu_a1b2")  # enrollment_id has space

    def test_assert_pseudonymous_accepts_opaque_token(self) -> None:
        # No raise — these are the legitimate shapes (uuid-ish, hex, hyphen).
        for ok in ("stu_a1b2c3", "t-0001", "9f8e7d6c", "cls_3A.fisica"):
            assert_pseudonymous(ok, "id")

    def test_subject_is_not_pseudonym_guarded(self) -> None:
        # subject is a discipline label, not an identifier: spaces are fine.
        c = SchoolClass("cls_3a", "t_001", "fisica applicata")
        assert c.subject == "fisica applicata"


# --- Entities: structural zero-PII (no field to leak into) --------------------

class TestStructuralZeroPII:
    def test_student_has_only_the_pseudonym_field(self) -> None:
        # The strongest guarantee: there is nowhere to put a name.
        assert [f.name for f in fields(Student)] == ["student_id"]

    def test_teacher_has_only_the_pseudonym_field(self) -> None:
        assert [f.name for f in fields(Teacher)] == ["teacher_id"]

    def test_no_pii_field_names_anywhere(self) -> None:
        pii_field_names = {"name", "email", "first_name", "last_name", "dob",
                           "phone", "address", "fiscal_code", "surname"}
        for entity in (Teacher, SchoolClass, Student, Enrollment):
            names = {f.name for f in fields(entity)}
            assert names & pii_field_names == set(), f"{entity.__name__} leaks PII"


# --- Store CRUD ---------------------------------------------------------------

@pytest.fixture()
def store() -> SQLiteStore:
    s = SQLiteStore()
    yield s
    s.close()


class TestTeacherCRUD:
    def test_save_get_round_trip(self, store: SQLiteStore) -> None:
        store.save_teacher(Teacher("t_001"))
        assert store.get_teacher("t_001") == Teacher("t_001")

    def test_get_missing_returns_none(self, store: SQLiteStore) -> None:
        assert store.get_teacher("nope") is None

    def test_delete_is_idempotent(self, store: SQLiteStore) -> None:
        store.save_teacher(Teacher("t_001"))
        assert store.delete_teacher("t_001") is True
        assert store.get_teacher("t_001") is None
        assert store.delete_teacher("t_001") is False

    def test_all_teachers_ordered(self, store: SQLiteStore) -> None:
        for tid in ("t_003", "t_001", "t_002"):
            store.save_teacher(Teacher(tid))
        assert [t.teacher_id for t in store.all_teachers()] == [
            "t_001", "t_002", "t_003"
        ]


class TestClassCRUD:
    def test_save_get_round_trip_with_subject(self, store: SQLiteStore) -> None:
        c = SchoolClass("cls_3a", "t_001", "fisica")
        store.save_class(c)
        assert store.get_class("cls_3a") == c

    def test_subject_optional(self, store: SQLiteStore) -> None:
        c = SchoolClass("cls_3a", "t_001")
        store.save_class(c)
        assert store.get_class("cls_3a") == SchoolClass("cls_3a", "t_001", None)

    def test_classes_for_teacher_scoped_and_ordered(
        self, store: SQLiteStore
    ) -> None:
        store.save_class(SchoolClass("cls_z", "t_001"))
        store.save_class(SchoolClass("cls_a", "t_001"))
        store.save_class(SchoolClass("cls_other", "t_999"))  # different teacher
        result = store.classes_for_teacher("t_001")
        assert [c.class_id for c in result] == ["cls_a", "cls_z"]

    def test_upsert_replaces_subject(self, store: SQLiteStore) -> None:
        store.save_class(SchoolClass("cls_3a", "t_001", "fisica"))
        store.save_class(SchoolClass("cls_3a", "t_001", "matematica"))
        assert store.get_class("cls_3a").subject == "matematica"

    def test_delete(self, store: SQLiteStore) -> None:
        store.save_class(SchoolClass("cls_3a", "t_001"))
        assert store.delete_class("cls_3a") is True
        assert store.get_class("cls_3a") is None
        assert store.delete_class("cls_3a") is False


class TestStudentCRUD:
    def test_save_get_delete(self, store: SQLiteStore) -> None:
        store.save_student(Student("stu_a1"))
        assert store.get_student("stu_a1") == Student("stu_a1")
        assert store.delete_student("stu_a1") is True
        assert store.get_student("stu_a1") is None
        assert store.delete_student("stu_a1") is False


class TestEnrollmentRelation:
    def test_students_for_class_via_join(self, store: SQLiteStore) -> None:
        store.save_student(Student("stu_b"))
        store.save_student(Student("stu_a"))
        store.save_student(Student("stu_other"))
        store.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_b"))
        store.save_enrollment(Enrollment("enr_2", "cls_3a", "stu_a"))
        store.save_enrollment(Enrollment("enr_3", "cls_4b", "stu_other"))
        result = store.students_for_class("cls_3a")
        assert [s.student_id for s in result] == ["stu_a", "stu_b"]

    def test_students_for_class_dedups_multi_enrollment(
        self, store: SQLiteStore
    ) -> None:
        # Same student, two enrollment rows in the same class (no UNIQUE
        # constraint): the join must NOT fan-out to a duplicate pseudonym.
        store.save_student(Student("stu_a"))
        store.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_a"))
        store.save_enrollment(Enrollment("enr_2", "cls_3a", "stu_a"))
        assert [s.student_id for s in store.students_for_class("cls_3a")] == [
            "stu_a"
        ]

    def test_classes_for_student_reverse(self, store: SQLiteStore) -> None:
        store.save_class(SchoolClass("cls_3a", "t_001", "fisica"))
        store.save_class(SchoolClass("cls_4b", "t_002", "chimica"))
        store.save_class(SchoolClass("cls_other", "t_003"))
        store.save_enrollment(Enrollment("enr_1", "cls_4b", "stu_a"))
        store.save_enrollment(Enrollment("enr_2", "cls_3a", "stu_a"))
        store.save_enrollment(Enrollment("enr_3", "cls_other", "stu_z"))
        result = store.classes_for_student("stu_a")
        assert [c.class_id for c in result] == ["cls_3a", "cls_4b"]

    def test_classes_for_student_dedups_multi_enrollment(
        self, store: SQLiteStore
    ) -> None:
        # Same student, two enrollment rows in the same class (no UNIQUE
        # constraint): the join must NOT fan-out to a duplicate class.
        store.save_class(SchoolClass("cls_3a", "t_001", "fisica"))
        store.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_a"))
        store.save_enrollment(Enrollment("enr_2", "cls_3a", "stu_a"))
        assert [c.class_id for c in store.classes_for_student("stu_a")] == [
            "cls_3a"
        ]

    def test_enrollments_for_class_scoped(self, store: SQLiteStore) -> None:
        store.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_a"))
        store.save_enrollment(Enrollment("enr_2", "cls_4b", "stu_b"))
        result = store.enrollments_for_class("cls_3a")
        assert [e.enrollment_id for e in result] == ["enr_1"]

    def test_get_and_delete_enrollment(self, store: SQLiteStore) -> None:
        store.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_a"))
        assert store.get_enrollment("enr_1") == Enrollment(
            "enr_1", "cls_3a", "stu_a"
        )
        assert store.delete_enrollment("enr_1") is True
        assert store.get_enrollment("enr_1") is None
        assert store.delete_enrollment("enr_1") is False


class TestPurgeStudentErasure:
    def test_purges_student_and_their_enrollments(
        self, store: SQLiteStore
    ) -> None:
        store.save_student(Student("stu_a"))
        store.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_a"))
        store.save_enrollment(Enrollment("enr_2", "cls_4b", "stu_a"))
        removed = store.purge_student("stu_a")
        assert removed == 3  # 2 enrollments + 1 student row
        assert store.get_student("stu_a") is None
        assert store.enrollments_for_class("cls_3a") == ()
        assert store.enrollments_for_class("cls_4b") == ()

    def test_purge_is_idempotent(self, store: SQLiteStore) -> None:
        store.save_student(Student("stu_a"))
        store.purge_student("stu_a")
        assert store.purge_student("stu_a") == 0

    def test_purge_leaves_other_students_untouched(
        self, store: SQLiteStore
    ) -> None:
        store.save_student(Student("stu_a"))
        store.save_student(Student("stu_keep"))
        store.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_a"))
        store.save_enrollment(Enrollment("enr_keep", "cls_3a", "stu_keep"))
        store.purge_student("stu_a")
        assert store.get_student("stu_keep") == Student("stu_keep")
        kept = store.enrollments_for_class("cls_3a")
        assert [e.enrollment_id for e in kept] == ["enr_keep"]


# --- Persistence & migration --------------------------------------------------

def test_crm_persists_to_disk_across_reconnect(tmp_path: FsPath) -> None:
    db = str(tmp_path / "crm.db")
    s1 = SQLiteStore(db)
    s1.save_teacher(Teacher("t_001"))
    s1.save_class(SchoolClass("cls_3a", "t_001", "fisica"))
    s1.save_student(Student("stu_a"))
    s1.save_enrollment(Enrollment("enr_1", "cls_3a", "stu_a"))
    s1.close()
    s2 = SQLiteStore(db)
    assert s2.get_class("cls_3a") == SchoolClass("cls_3a", "t_001", "fisica")
    assert [s.student_id for s in s2.students_for_class("cls_3a")] == ["stu_a"]
    s2.close()


def _table_columns(store: SQLiteStore, table: str) -> list[str]:
    rows = store._conn.execute(f"PRAGMA table_info({table})").fetchall()
    return [r["name"] for r in rows]


def test_students_table_has_no_personal_column() -> None:
    # Schema-level zero-PII: the students table is one opaque PK column.
    store = SQLiteStore()
    assert _table_columns(store, "students") == ["student_id"]
    assert _table_columns(store, "teachers") == ["teacher_id"]
    store.close()


def test_migration_v8_to_v9_creates_crm_tables(tmp_path: FsPath) -> None:
    """A v8 DB (no CRM tables) gains them + bumps user_version on reopen."""
    db = str(tmp_path / "v8.db")
    s1 = SQLiteStore(db)
    # Simulate a v8 database: drop the CRM tables, downgrade user_version.
    for t in ("enrollments", "students", "classes", "teachers"):
        s1._conn.execute(f"DROP TABLE {t}")
    s1._conn.execute("PRAGMA user_version = 8")
    s1._conn.commit()
    s1.close()

    s2 = SQLiteStore(db)  # migration must recreate the CRM tables
    assert s2._conn.execute("PRAGMA user_version").fetchone()[0] == SCHEMA_VERSION
    s2.save_student(Student("stu_a"))  # table exists again
    assert s2.get_student("stu_a") == Student("stu_a")
    s2.close()
