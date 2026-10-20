"""Recognized canonical schema features, shared by SQLite and PostgreSQL."""
from .models import StudyError

CURRENT_SCHEMA = 4
CALENDAR_TABLES = frozenset({'study_calendar_targets','study_calendar_intents',
    'study_calendar_mappings','study_calendar_cache','study_calendar_deliveries'})
# The V3 snapshot is explicit: future additive features are versioned here,
# rather than making every adapter/module predict a future schema.
TABLES_V3 = CALENDAR_TABLES | frozenset(('study_schema study_principals study_sessions '
    'study_invitations study_rate_limits study_erased_actors study_editions study_members '
    'study_resources study_revisions study_events study_receipts study_interests study_holds '
    'study_waitlist study_assets study_submissions study_feedback study_reviews study_observations '
    'study_layouts study_upload_intents study_upload_requests study_edition_packs').split())


def validate_schema(version,tables,edition_columns,hold_columns=(),*,allow_upgrade=False):
    if type(version) is not int:
        raise StudyError('database_schema_not_ready',503)
    if version>CURRENT_SCHEMA:
        raise StudyError('newer_schema',503)
    if version not in (1,2,3,4):
        raise StudyError('database_schema_not_ready',503)
    if version>=3 and not TABLES_V3.issubset(tables):
        raise StudyError('database_integrity_failure',503)
    if version>=4 and ('management_revision' not in edition_columns or 'offer_revision' not in hold_columns):
        raise StudyError('database_integrity_failure',503)
    if version<CURRENT_SCHEMA and not allow_upgrade:
        raise StudyError('database_schema_not_ready',503)
