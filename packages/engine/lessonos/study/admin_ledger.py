"""Internal owner-scoped register primitives; never an additional authority/store."""
import base64
import json
from .models import StudyError
from .store import canonical, digest
from .transactions import execute_command

MAX_REVISION=2**53-1
OPERATIONS=frozenset({'admin.attendance.recorded','admin.manual-payment.recorded','admin.manual-payment.revised'})


def bounded_text(value,minimum,maximum):
    """JSON may carry lone surrogates; accepted text must be Unicode scalars."""
    return (isinstance(value,str) and minimum<=len(value)<=maximum and '\x00' not in value
            and not any(0xd800<=ord(character)<=0xdfff for character in value))


def student_identifier(value):
    if not bounded_text(value,1,128):raise StudyError('invalid_student')
    return value


def _owner(store,principal,edition_id,connection):
    store._principal(principal)
    if not bounded_text(edition_id,1,8192):raise StudyError('invalid_edition')
    if principal.role!='teacher':raise StudyError('forbidden',403)
    row=connection.execute('SELECT id,teacher_id,sessions,timezone,management_revision,price_minor,state FROM study_editions WHERE id=? AND teacher_id=?',
                           (edition_id,principal.id)).fetchone()
    if row is None:raise StudyError('forbidden',403)
    return row


class AttendanceAccess:
    require_owner=staticmethod(_owner)


class CommercialAccess:
    require_owner=staticmethod(_owner)


def command(store,principal,edition_id,operation,key,payload,apply,access):
    if operation not in OPERATIONS:raise RuntimeError('unrecognized register command')
    access.require_owner(store,principal,edition_id,store.connection)
    def authorize(connection):
        store.lock_edition(connection,edition_id)
        access.require_owner(store,principal,edition_id,connection)
    return execute_command(store,principal,operation,key,payload,apply,before_lookup=authorize)


def member(connection,edition_id,student_id):
    student_identifier(student_id)
    if not connection.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',(edition_id,student_id)).fetchone():
        raise StudyError('member_required',409)


def revision(value):
    if type(value) is not int or not 0<=value<=MAX_REVISION:raise StudyError('invalid_revision')
    return value


def record_id(value):
    if not isinstance(value,str) or len(value)!=32 or any(c not in '0123456789abcdef' for c in value):
        raise StudyError('invalid_record')
    return value


def reason_text(value,*,required=False):
    if not bounded_text(value,0,1000) or (required and not value.strip()):raise StudyError('correction_reason_required' if required else 'invalid_reason')
    return value


def page(limit,after,kind,scope):
    if type(limit) is not int or not 1<=limit<=50:raise StudyError('invalid_page')
    if after is None:return None
    try:
        if not isinstance(after,str) or not 1<=len(after)<=512:raise ValueError()
        decoded=json.loads(base64.b64decode(after+'='*(-len(after)%4),altchars=b'-_',validate=True))
        if set(decoded)!={'kind','scope','position'} or decoded['kind']!=kind or decoded['scope']!=digest(canonical(scope)):raise ValueError()
        position=decoded['position']
        if kind=='payments':record_id(position)
        elif type(position) is not int or not 1<=position<=MAX_REVISION:raise ValueError()
        return position
    except (ValueError,TypeError,KeyError,UnicodeError):raise StudyError('invalid_cursor') from None


def cursor(kind,scope,position):
    return base64.urlsafe_b64encode(canonical({'kind':kind,'scope':digest(canonical(scope)),'position':position}).encode()).decode().rstrip('=')


def read_snapshot(value,required):
    try:
        decoded=json.loads(value)
        if not isinstance(decoded,dict) or not set(required).issubset(decoded):raise ValueError()
        return decoded
    except (ValueError,TypeError):raise StudyError('database_integrity_failure',503) from None
