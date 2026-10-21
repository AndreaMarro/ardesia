"""Recognized canonical schema features, shared by SQLite and PostgreSQL."""
from .models import StudyError

CURRENT_SCHEMA = 8
CALENDAR_TABLES = frozenset({'study_calendar_targets','study_calendar_intents',
    'study_calendar_mappings','study_calendar_cache','study_calendar_deliveries'})
# The V3 snapshot is explicit: future additive features are versioned here,
# rather than making every adapter/module predict a future schema.
TABLES_V3 = CALENDAR_TABLES | frozenset(('study_schema study_principals study_sessions '
    'study_invitations study_rate_limits study_erased_actors study_editions study_members '
    'study_resources study_revisions study_events study_receipts study_interests study_holds '
    'study_waitlist study_assets study_submissions study_feedback study_reviews study_observations '
    'study_layouts study_upload_intents study_upload_requests study_edition_packs').split())


ADMIN_COLUMNS={
 'study_attendance_records':frozenset('id edition_id session_id student_id revision supersedes_record_id previous_revision status recorded_by recorded_at reason management_revision session_snapshot receipt_id'.split()),
 'study_manual_payment_records':frozenset('id entry_id edition_id student_id revision supersedes_record_id previous_revision status amount_minor currency external_reference external_reference_key recorded_by recorded_at reason offer_snapshot receipt_id'.split()),
}

# Schema7: the approval decision and its append-only transition trail. Adding a
# column is a new schema version; a v7 database must already carry every field.
APPROVAL_COLUMNS={
 'study_question_bank_approvals':frozenset('id edition_id bank_id question_id question_version '
    'content_sha256 bank_sha256 scientific_status editorial_status actor_id created_at motivation '
    'revoked_at revoked_by revocation_reason supersedes_id'.split()),
 'study_question_bank_approval_events':frozenset('id approval_id edition_id bank_id question_id '
    'question_version content_sha256 event actor_id created_at motivation payload'.split()),
}

# Schema8: persistent exam attempts. The canonical sequence is v6 -> v7
# (approvals) -> v8 (exams). A pre-convergence v7 database that carries only the
# exam tables is recognized as an upgradeable legacy shape, never as canonical.
EXAM_COLUMNS={
 'study_exam_attempts':frozenset('id edition_id student_id pack_id pack_version pack_sha256 '
    'question_order answers status started_at deadline_at submitted_at score_tenths receipt_id '
    'result pack_snapshot'.split()),
}


def _complete(columns, required, tables):
    return set(required).issubset(tables) and all(
        fields.issubset((columns or {}).get(table,set())) for table,fields in required.items())


def validate_schema(version,tables,edition_columns,hold_columns=(),*,allow_upgrade=False,admin_columns=None,
                    notebook_columns=None,approval_columns=None,exam_columns=None):
    if type(version) is not int:
        raise StudyError('database_schema_not_ready',503)
    if version>CURRENT_SCHEMA:
        raise StudyError('newer_schema',503)
    if version not in (1,2,3,4,5,6,7,8):
        raise StudyError('database_schema_not_ready',503)
    if version>=3 and not TABLES_V3.issubset(tables):
        raise StudyError('database_integrity_failure',503)
    if version>=4 and ('management_revision' not in edition_columns or 'offer_revision' not in hold_columns):
        raise StudyError('database_integrity_failure',503)
    if (version>=5 or set(ADMIN_COLUMNS).intersection(tables)) and not _complete(
        admin_columns,ADMIN_COLUMNS,tables):
        raise StudyError('database_integrity_failure',503)
    from .scientific_notebook import NOTEBOOK_COLUMNS
    if (version>=6 or set(NOTEBOOK_COLUMNS).intersection(tables)) and not _complete(
        notebook_columns,NOTEBOOK_COLUMNS,tables):
        raise StudyError('database_integrity_failure',503)
    approvals = _complete(approval_columns,APPROVAL_COLUMNS,tables)
    exams = _complete(exam_columns,EXAM_COLUMNS,tables)
    if set(APPROVAL_COLUMNS).intersection(tables) and not approvals:
        raise StudyError('database_integrity_failure',503)
    if set(EXAM_COLUMNS).intersection(tables) and not exams:
        raise StudyError('database_integrity_failure',503)
    if version>=7 and not approvals:
        # Only the known pre-convergence v7 exam lineage may upgrade in place.
        # It is never accepted as a canonical open, and the upgrade is additive
        # (approval tables are created empty, so default deny still holds).
        if not (allow_upgrade and version==7 and exams):
            raise StudyError('database_integrity_failure',503)
    if version>=8 and not exams:
        raise StudyError('database_integrity_failure',503)
    if version<CURRENT_SCHEMA and not allow_upgrade:
        raise StudyError('database_schema_not_ready',503)
