"""Shared edition policy. Canonical dates and offers live in the existing Core."""
import json
import re

from .calendar_time import normalize_sessions, instant
from .models import StudyError
from .store import canonical, identifier
from .transactions import transact


def owned_edition(store, principal, edition_id, connection):
    """Verify ownership in SQL before decoding a calendar or pack descriptor."""
    if not isinstance(edition_id,str) or not 1<=len(edition_id)<=8192:
        raise StudyError('invalid_edition')
    store._principal(principal)
    if principal.role != 'teacher':
        raise StudyError('forbidden', 403)
    if not connection.execute('SELECT id FROM study_editions WHERE id=? AND teacher_id=?',
                              (edition_id, principal.id)).fetchone():
        raise StudyError('forbidden', 403)
    return store.get_edition(edition_id)


def lock_owned_edition(store, principal, edition_id, connection):
    store._principal(principal)
    if principal.role != 'teacher':
        raise StudyError('forbidden', 403)
    # Every tutor/calendar mutation takes these locks in this order. Seat
    # commands take only the edition lock, and cannot form a reverse cycle.
    store.lock_teacher(connection, principal.id)
    store.lock_edition(connection, edition_id)
    return owned_edition(store, principal, edition_id, connection)


def checked_sessions(store, connection, principal, edition, sessions):
    normalized = normalize_sessions(edition['id'], sessions, edition['timezone'])
    intervals = [(instant(item['startUtc']), instant(item['endUtc'])) for item in normalized]
    siblings = connection.execute(
        'SELECT id,sessions,timezone FROM study_editions WHERE teacher_id=? AND id!=?',
        (principal.id, edition['id']))
    for row in siblings:
        previous = json.loads(row['sessions'])
        if not previous:
            continue
        for old in normalize_sessions(row['id'], previous, row['timezone']):
            old_start, old_end = instant(old['startUtc']), instant(old['endUtc'])
            if any(start < old_end and end > old_start for start, end in intervals):
                raise StudyError('calendar_conflict', 409)
    return normalized


def require_unoccupied(store, connection, edition_id):
    if connection.execute('SELECT 1 FROM study_members WHERE edition_id=? LIMIT 1',
                          (edition_id,)).fetchone() or connection.execute(
        "SELECT 1 FROM study_holds WHERE edition_id=? AND state='hold' AND expires_at>? LIMIT 1",
        (edition_id, store.clock())).fetchone():
        raise StudyError('reconfirmation_required', 409)


def _change_terms(store, connection, principal, edition, capacity, price_minor, sessions):
    edition_id=edition['id']
    normalized=normalize_sessions(edition_id,sessions,edition['timezone'])
    same_dates=edition['sessions']==sessions
    if not same_dates and len(edition['sessions'])==4:
        same_dates=normalize_sessions(edition_id,edition['sessions'],edition['timezone'])==normalized
    if same_dates and capacity==edition['capacity'] and price_minor==edition['priceMinor']:
        return edition
    checked_sessions(store,connection,principal,edition,sessions)
    require_unoccupied(store,connection,edition_id)
    if edition['state'] not in ('collecting','draft','offered'):
        raise StudyError('edition_not_editable',409)
    revision=connection.execute('SELECT management_revision FROM study_editions WHERE id=?',(edition_id,)).fetchone()[0]
    if revision>=MAX_REVISION:raise StudyError('edition_revision_exhausted',409)
    next_state='draft' if edition['state']=='offered' else edition['state']
    connection.execute('UPDATE study_editions SET capacity=?,price_minor=?,sessions=?,state=?,management_revision=management_revision+1 WHERE id=?',
        (capacity,price_minor,canonical(sessions),next_state,edition_id))
    store._event(connection,principal,'edition.calendar',None,{'editionId':edition_id,'sessions':sessions,'managementRevision':revision+1})
    return store.get_edition(edition_id)


def configure_sessions_in_transaction(store,connection,principal,edition_id,sessions):
    edition=lock_owned_edition(store,principal,edition_id,connection)
    return _change_terms(store,connection,principal,edition,edition['capacity'],edition['priceMinor'],sessions)


def offer_edition(store,principal,edition_id,key,*,confirmed,preview_id=None,preview_hash=None,revision=None):
    require_teacher(store,principal)
    owned_edition(store,principal,edition_id,store.connection)
    if confirmed is not True:raise StudyError('explicit_confirmation_required')
    if preview_id is None or preview_hash is None or revision is None:
        raise StudyError('offer_preview_required',409)
    expected_revision(revision)
    if not isinstance(preview_id,str) or len(preview_id)!=32 or not isinstance(preview_hash,str) or len(preview_hash)!=64:
        raise StudyError('invalid_offer_preview')
    def apply(connection):
        edition=lock_owned_edition(store,principal,edition_id,connection)
        _revision_matches(admin_edition(store,principal,edition_id),revision)
        if edition['state'] not in ('draft','collecting'):
            raise StudyError('edition_not_editable',409)
        row=connection.execute("SELECT body FROM study_receipts WHERE id=? AND actor_id=? AND operation='edition.offer.preview'",
                               (preview_id,principal.id)).fetchone()
        if row is None:raise StudyError('invalid_offer_preview')
        preview=json.loads(row['body'])
        if preview.get('editionId')!=edition_id or preview.get('expectedRevision')!=revision or preview.get('previewHash')!=preview_hash:
            raise StudyError('invalid_offer_preview')
        if store.clock()>=preview['expiresAt']:raise StudyError('offer_preview_expired',409)
        from .store import digest
        if digest(canonical(preview['offer']))!=preview_hash:
            raise StudyError('invalid_offer_preview')
        checked_sessions(store,connection,principal,edition,edition['sessions'])
        if revision>=MAX_REVISION:raise StudyError('edition_revision_exhausted',409)
        connection.execute("UPDATE study_holds SET state='payment_requires_review' WHERE edition_id=? AND state='hold'",(edition_id,))
        connection.execute("UPDATE study_editions SET state='offered',management_revision=management_revision+1 WHERE id=?",(edition_id,))
        return {'edition':admin_edition(store,principal,edition_id),'receiptId':identifier(),
                'previewId':preview_id,'paymentMode':'test','scientificApproval':'NOT_ATTESTED'}
    return transact(store,principal,'edition.offered',key,
        {'editionId':edition_id,'previewId':preview_id,'previewHash':preview_hash,'expectedRevision':revision,'confirmed':True},apply)


MAX_REVISION = 2**53 - 1


def require_teacher(store, principal):
    store._principal(principal)
    if principal.role != 'teacher':
        raise StudyError('forbidden',403)


def expected_revision(value):
    if type(value) is not int or not 0 <= value <= MAX_REVISION:
        raise StudyError('invalid_edition_revision')
    return value


def admin_edition(store, principal, edition_id):
    edition = owned_edition(store,principal,edition_id,store.connection)
    revision = store.connection.execute('SELECT management_revision FROM study_editions WHERE id=? AND teacher_id=?',
                                        (edition_id,principal.id)).fetchone()[0]
    return {**edition, 'starts':local_starts(edition), 'managementRevision':revision,
            'legacyUnversionedOffer':edition['state']=='offered' and revision==0,
            'paymentMode':'test','scientificApproval':'NOT_ATTESTED'}


def registry(store, principal, *, include_inventory=False):
    require_teacher(store,principal)
    from .catalog import list_pack_descriptors
    result = {'items':list_pack_descriptors(),'paymentMode':'test'}
    if include_inventory:
        from .curriculum_inventory import build_inventory
        result['inventory'] = build_inventory(result['items'])
    return result


def _indicative_terms(capacity, price_minor):
    if type(capacity) is not int or not 1 <= capacity <= 10:
        raise StudyError('invalid_edition')
    if type(price_minor) is not int or price_minor not in (3900,4900):
        raise StudyError('invalid_indicative_price')


def create_draft(store,principal,pack_id,pack_version,capacity,price_minor,key):
    require_teacher(store,principal)
    _indicative_terms(capacity,price_minor)
    from .catalog import describe_pack
    binding=describe_pack(pack_id,pack_version)
    def apply(connection):
        edition_id=identifier()
        store._insert_edition(connection,principal,edition_id,capacity,price_minor,
            course_id=binding['courseId'],pack_id=pack_id,pack_version=pack_version,initial_state='draft')
        return {'edition':admin_edition(store,principal,edition_id),'receiptId':identifier()}
    return transact(store,principal,'edition.created',key,
        {'packId':pack_id,'packVersion':pack_version,'capacity':capacity,'priceMinor':price_minor},apply)


def resolve_starts(starts, timezone_name='Europe/Rome'):
    """Resolve wall inputs once in Core; ambiguity requires an explicit choice."""
    from datetime import datetime,timedelta
    from .calendar_time import zone
    iana=zone(timezone_name)
    if not isinstance(starts,list) or len(starts)!=4:
        raise StudyError('four_sessions_required')
    result=[]
    for item in starts:
        if not isinstance(item,dict) or set(item)-{'localStart','occurrence'}:
            raise StudyError('invalid_calendar')
        value=item.get('localStart');choice=item.get('occurrence')
        try:
            if not isinstance(value,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}',value) or choice not in (None,'earlier','later'):
                raise ValueError()
            wall=datetime.fromisoformat(value)
            if wall.tzinfo is not None or wall.second or wall.microsecond:
                raise ValueError()
            candidates={}
            for fold in (0,1):
                candidate=wall.replace(tzinfo=iana,fold=fold)
                try:
                    utc_start=instant(candidate.isoformat(timespec='seconds'),iana)
                    candidates[utc_start]=candidate
                except StudyError:
                    continue
            if not candidates:
                raise ValueError()
            instants=sorted(candidates)
            if len(instants)>1 and choice is None:
                raise StudyError('ambiguous_calendar_time')
            start=instants[-1] if choice=='later' else instants[0]
            end=start+timedelta(minutes=90)
            result.append({'start':start.astimezone(iana).isoformat(timespec='seconds'),
                           'end':end.astimezone(iana).isoformat(timespec='seconds')})
        except StudyError:
            raise
        except (ValueError,OverflowError):
            raise StudyError('invalid_calendar') from None
    return result


def _revision_matches(edition, revision):
    expected_revision(revision)
    if edition['managementRevision']!=revision:
        raise StudyError('stale_edition',409)


def edit_draft(store,principal,edition_id,key,*,revision,capacity,price_minor,starts):
    require_teacher(store,principal)
    _indicative_terms(capacity,price_minor)
    expected_revision(revision)
    # Ownership precedes canonical JSON decode, including before receipt replay.
    owned_edition(store,principal,edition_id,store.connection)
    def apply(connection):
        edition=lock_owned_edition(store,principal,edition_id,connection)
        current=admin_edition(store,principal,edition_id)
        _revision_matches(current,revision)
        sessions=resolve_starts(starts,edition['timezone'])
        _change_terms(store,connection,principal,edition,capacity,price_minor,sessions)
        return {'edition':admin_edition(store,principal,edition_id),'receiptId':identifier()}
    return transact(store,principal,'edition.edited',key,
        {'editionId':edition_id,'expectedRevision':revision,'capacity':capacity,'priceMinor':price_minor,'starts':starts},apply)


def preview_offer(store,principal,edition_id,key,*,revision,ttl=300):
    require_teacher(store,principal)
    expected_revision(revision)
    if type(ttl) is not int or not 1<=ttl<=900:
        raise StudyError('invalid_expiry')
    owned_edition(store,principal,edition_id,store.connection)
    def apply(connection):
        edition=lock_owned_edition(store,principal,edition_id,connection)
        current=admin_edition(store,principal,edition_id)
        _revision_matches(current,revision)
        if edition['state'] not in ('draft','collecting'):
            raise StudyError('edition_not_editable',409)
        _indicative_terms(edition['capacity'],edition['priceMinor'])
        normalized=checked_sessions(store,connection,principal,edition,edition['sessions'])
        from .catalog import load_pack
        pack=load_pack(edition['packId'],edition['packVersion'])
        snapshot={**current,'currency':'EUR','sessionMinutes':90,'sessionCount':4,
                  'normalizedSessions':normalized,'editorialStatus':pack['status'],'scope':pack['scope']}
        preview_id=identifier();now=store.clock()
        from .store import digest
        return {'previewId':preview_id,'receiptId':preview_id,'editionId':edition_id,
                'expectedRevision':revision,'previewHash':digest(canonical(snapshot)),
                'createdAt':now,'expiresAt':now+ttl,'offer':snapshot}
    return transact(store,principal,'edition.offer.preview',key,
        {'editionId':edition_id,'expectedRevision':revision,'ttl':ttl},apply)


def public_edition(store,edition_id,principal=None,*,allow_unavailable=False):
    """Draft metadata is read only by its owner or an existing member."""
    teacher_id=student_id=None
    if principal is not None:
        store._principal(principal)
        if principal.role=='teacher':teacher_id=principal.id
        else:student_id=principal.id
    row=store.connection.execute(
        "SELECT e.id FROM study_editions e WHERE e.id=? AND (e.state!='draft' OR e.teacher_id=? OR EXISTS (SELECT 1 FROM study_members m WHERE m.edition_id=e.id AND m.student_id=?))",
        (edition_id,teacher_id,student_id)).fetchone()
    if not row:raise StudyError('not_found',404)
    return store.get_edition(edition_id,allow_unavailable=allow_unavailable)


def local_starts(edition):
    from datetime import datetime
    from .calendar_time import zone
    iana=zone(edition['timezone'])
    result=[]
    for session in edition['sessions']:
        local=datetime.fromisoformat(session['start']).astimezone(iana)
        wall=local.replace(tzinfo=None)
        offsets={wall.replace(tzinfo=iana,fold=fold).utcoffset() for fold in (0,1)}
        result.append({'localStart':local.isoformat(timespec='minutes')[:16],
                       **({'occurrence':'later' if local.fold else 'earlier'} if len(offsets)>1 else {})})
    return result
