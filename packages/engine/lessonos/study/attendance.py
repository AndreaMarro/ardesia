"""Manual attendance declarations; no inferred attendance, enrollment or learning event."""
import json
from .admin_ledger import AttendanceAccess, command, member, revision, reason_text, record_id, page, cursor, MAX_REVISION, read_snapshot, student_identifier
from .calendar_time import normalize_sessions, display_sessions, instant
from .models import StudyError
from .store import canonical, identifier


def _dto(row):
    return {'recordId':row['id'],'editionId':row['edition_id'],'sessionId':row['session_id'],
        'studentId':row['student_id'],'revision':row['revision'],'supersedesRecordId':row['supersedes_record_id'],
        'status':row['status'],'recordedBy':row['recorded_by'],'recordedAt':row['recorded_at'],'reason':row['reason'],
        'managementRevision':row['management_revision'],'sessionSnapshot':read_snapshot(row['session_snapshot'],('sessionId','ordinal','startUtc','endUtc','timezone')),
        'receiptId':row['receipt_id'],'mode':'test'}


def _sessions(edition):
    return normalize_sessions(edition['id'],json.loads(edition['sessions']),edition['timezone'])


def register(store,principal,edition_id):
    c=store.connection
    edition=AttendanceAccess.require_owner(store,principal,edition_id,c)
    sessions=_sessions(edition) if json.loads(edition['sessions']) else []
    roster=c.execute('SELECT student_id FROM study_members WHERE edition_id=? ORDER BY student_id LIMIT 11',(edition_id,)).fetchall()
    if len(roster)>10:raise StudyError('roster_over_capacity',409)
    # One SQL batch selects only current heads for current roster. Never decode
    # another edition's rows or issue one query for each of the forty cells.
    rows=c.execute('''SELECT a.* FROM study_attendance_records a
        JOIN study_members m ON m.edition_id=a.edition_id AND m.student_id=a.student_id
        WHERE a.edition_id=? AND NOT EXISTS (SELECT 1 FROM study_attendance_records n
          WHERE n.edition_id=a.edition_id AND n.session_id=a.session_id AND n.student_id=a.student_id AND n.revision>a.revision)
        LIMIT 41''',(edition_id,)).fetchall()
    if len(rows)>40:raise StudyError('attendance_integrity_failure',503)
    heads={(row['session_id'],row['student_id']):_dto(row) for row in rows}
    if {key[0] for key in heads}-{session['sessionId'] for session in sessions}:
        raise StudyError('attendance_integrity_failure',503)
    now=store.clock();cells=[]
    for session in sessions:
        for person in roster:
            record=heads.get((session['sessionId'],person['student_id']))
            conflict=record is not None and record['sessionSnapshot']!={**session,'timezone':edition['timezone']}
            cells.append({'sessionId':session['sessionId'],'studentId':person['student_id'],
                'status':record['status'] if record and not conflict else 'UNRECORDED',
                'revision':record['revision'] if record else 0,'recordId':record['recordId'] if record else None,
                'canRecord':not conflict and now>=instant(session['startUtc']).timestamp(),
                'canCorrect':record is not None,'calendarConflict':conflict,'record':record})
    counts=c.execute("""SELECT
        (SELECT count(*) FROM study_interests WHERE edition_id=?) AS interests,
        (SELECT count(*) FROM study_holds WHERE edition_id=? AND state='hold' AND expires_at>?) AS holds,
        (SELECT count(*) FROM study_waitlist WHERE edition_id=?) AS waitlisted""",(edition_id,edition_id,now,edition_id)).fetchone()
    admission={'interestCount':counts['interests'],'activeHoldCount':counts['holds'],
               'confirmedCount':len(roster),'waitlistedCount':counts['waitlisted']}
    return {'calendarReady':len(sessions)==4,'admission':admission,'editionId':edition_id,'managementRevision':edition['management_revision'],'serverTime':now,
        'timezone':edition['timezone'],'mode':'test','roster':[{'studentId':r['student_id']} for r in roster],
        'sessions':display_sessions(sessions,edition['timezone']),'cells':cells}


def record(store,principal,edition_id,key,*,session_id,student_id,status,expected_revision,
           expected_management_revision,target_record_id=None,reason=''):
    revision(expected_revision);revision(expected_management_revision);record_id(session_id);student_identifier(student_id)
    if status not in ('PRESENT','ABSENT','UNRECORDED'):raise StudyError('invalid_attendance')
    reason_text(reason,required=expected_revision>0)
    if expected_revision==0 and target_record_id is not None:raise StudyError('invalid_record')
    if expected_revision>0:record_id(target_record_id)
    def apply(c):
        edition=AttendanceAccess.require_owner(store,principal,edition_id,c)
        previous=c.execute('SELECT * FROM study_attendance_records WHERE edition_id=? AND session_id=? AND student_id=? ORDER BY revision DESC LIMIT 1',
                           (edition_id,session_id,student_id)).fetchone()
        if (previous['revision'] if previous else 0)!=expected_revision or (previous and previous['id']!=target_record_id):
            raise StudyError('stale_admin_record',409)
        if expected_revision>=MAX_REVISION:raise StudyError('record_revision_exhausted',409)
        if previous:
            if previous['management_revision']!=expected_management_revision:raise StudyError('stale_edition',409)
            snapshot=previous['session_snapshot'];management=previous['management_revision']
        else:
            member(c,edition_id,student_id)
            if edition['management_revision']!=expected_management_revision:raise StudyError('stale_edition',409)
            session=next((s for s in _sessions(edition) if s['sessionId']==session_id),None)
            if session is None:raise StudyError('invalid_session')
            if store.clock()<instant(session['startUtc']).timestamp():raise StudyError('session_not_started',409)
            snapshot=canonical({**session,'timezone':edition['timezone']});management=edition['management_revision']
        rid=identifier();receipt=identifier()
        c.execute('''INSERT INTO study_attendance_records(id,edition_id,session_id,student_id,revision,supersedes_record_id,
            previous_revision,status,recorded_by,recorded_at,reason,management_revision,session_snapshot,receipt_id)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (rid,edition_id,session_id,student_id,expected_revision+1,target_record_id,expected_revision,status,
             principal.id,store.clock(),reason,management,snapshot,receipt))
        return {'receiptId':receipt,'recordId':rid,'editionId':edition_id,'revision':expected_revision+1,'status':status,'mode':'test'}
    return command(store,principal,edition_id,'admin.attendance.recorded',key,
        {'editionId':edition_id,'sessionId':session_id,'studentId':student_id,'status':status,
         'expectedRevision':expected_revision,'expectedManagementRevision':expected_management_revision,
         'targetRecordId':target_record_id,'reason':reason},apply,AttendanceAccess)


def history(store,principal,edition_id,*,session_id,student_id,limit=20,after=None):
    AttendanceAccess.require_owner(store,principal,edition_id,store.connection)
    record_id(session_id)
    student_identifier(student_id)
    scope=[edition_id,session_id,student_id];position=page(limit,after,'attendance',scope)
    rows=store.connection.execute('''SELECT * FROM study_attendance_records WHERE edition_id=? AND session_id=? AND student_id=?
        AND revision<? ORDER BY revision DESC LIMIT ?''',(edition_id,session_id,student_id,position or MAX_REVISION+1,limit+1)).fetchall()
    items=[_dto(row) for row in rows[:limit]]
    return {'items':items,'nextCursor':cursor('attendance',scope,items[-1]['revision']) if len(rows)>limit else None}
