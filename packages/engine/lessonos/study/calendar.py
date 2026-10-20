"""Bounded calendar projection. Canonical dates/rosters are never imported."""
from datetime import datetime, timezone
import hmac
import json
from .models import StudyError
from .store import canonical,digest,identifier
from .transactions import transact,lookup_receipt,record_receipt
from .calendar_time import normalize_sessions,render_ics,instant,utc
from .calendar_port import CalendarPort,SyncGone


def capabilities(store=None):
    ready=store.connection.execute('SELECT version FROM study_schema').fetchone()[0]==3 if store is not None else None
    return {'google':'NOT_CONFIGURED','mock':'IN_PROCESS_TEST_DOUBLE','ics':'AVAILABLE',
        'schemaStatus':'NOT_CHECKED' if ready is None else 'READY' if ready else 'REQUIRES_MIGRATION_10',
        'pushTransport':'IN_PROCESS_MOCK_ONLY','channelRenewal':'MANUAL_MOCK_ONLY',
        'reconciliation':'EXPLICIT_CALL_ONLY','canonicalStorage':'EXPLICIT_OFFSET_JSON',
        'timeProjection':'UTC_ADAPTER_PROJECTION','sessionIdentity':'EDITION_ORDINAL_V1'}


def _edition(store,actor,edition_id,teacher=False):
    store._principal(actor)
    if not isinstance(edition_id,str) or not 1<=len(edition_id)<=8192:raise StudyError('invalid_edition')
    if actor.role=='teacher':
        row=store.connection.execute('SELECT id FROM study_editions WHERE id=? AND teacher_id=?',(edition_id,actor.id)).fetchone()
    elif not teacher:
        row=store.connection.execute('SELECT e.id FROM study_editions e JOIN study_members m ON m.edition_id=e.id WHERE e.id=? AND m.student_id=?',(edition_id,actor.id)).fetchone()
    else:row=None
    if not row:raise StudyError('forbidden',403)
    if store.connection.execute('SELECT version FROM study_schema').fetchone()[0]!=3:raise StudyError('calendar_schema_not_ready',503)
    return store.get_edition(edition_id)


def source_version(edition):
    return digest(canonical({key:edition[key] for key in ('id','sessions','timezone','state')}))


def _scope(target):
    return digest(canonical([target['provider'],target['account_id'],target['calendar_id']]))[:32]


def _target(store,actor,edition_id,target_id):
    _edition(store,actor,edition_id,teacher=True)
    if not _hex(target_id,32):raise StudyError('invalid_calendar_target')
    row=store.connection.execute('SELECT * FROM study_calendar_targets WHERE id=? AND edition_id=? AND actor_id=?',(target_id,edition_id,actor.id)).fetchone()
    if not row:raise StudyError('not_found',404)
    return row


def _hex(value,length):
    return isinstance(value,str) and len(value)==length and all(item in '0123456789abcdef' for item in value)


def preview_schedule(store,actor,edition_id,provider,key,ttl=300):
    _edition(store,actor,edition_id,teacher=True)
    if provider=='google':raise StudyError('calendar_not_configured',501)
    if provider not in ('mock','ics'):raise StudyError('invalid_calendar_target')
    if type(ttl) is not int or not 1<=ttl<=3600:raise StudyError('invalid_expiry')
    def apply(c):
        store.lock_edition(c,edition_id)
        edition=_edition(store,actor,edition_id,teacher=True)
        sessions=normalize_sessions(edition_id,edition['sessions'],edition['timezone'])
        version=source_version(edition);now=store.clock()
        target=digest(canonical([edition_id,actor.id,provider,actor.id,'primary']))[:32]
        scope=digest(canonical([provider,actor.id,'primary']))[:32]
        c.execute('INSERT OR IGNORE INTO study_calendar_targets(id,edition_id,actor_id,provider,account_id,calendar_id,channel_id,channel_token,channel_resource,channel_expires) VALUES(?,?,?,?,?,?,?,?,?,?)',
            (target,edition_id,actor.id,provider,actor.id,'primary',identifier() if provider=='mock' else None,identifier() if provider=='mock' else None,digest(scope) if provider=='mock' else None,now+3600 if provider=='mock' else None))
        row=c.execute('SELECT source_version,sequence FROM study_calendar_targets WHERE id=?',(target,)).fetchone()
        sequence=row['sequence']+(1 if row['source_version'] and row['source_version']!=version else 0)
        c.execute('UPDATE study_calendar_targets SET source_version=?,sequence=? WHERE id=?',(version,sequence,target))
        preview_id=identifier()
        plan={'previewId':preview_id,'editionId':edition_id,'targetId':target,'provider':provider,
            'accountId':actor.id,'calendarId':'primary','sourceVersion':version,'sessions':sessions,
            'providerScope':scope,
            'timezone':edition['timezone'],'title':edition['title'],'status':'CONFIRMED' if edition['state']=='offered' else 'TENTATIVE',
            'stampUtc':utc(datetime.fromtimestamp(now,timezone.utc)),'sequence':sequence,'expiresAt':now+ttl,
            'invitations':'NONE','reminders':'NONE','sessionIdentity':'EDITION_ORDINAL_V1','timeProjection':'UTC_ADAPTER_PROJECTION'}
        hashed=digest(canonical(plan))
        c.execute('INSERT INTO study_calendar_intents(id,target_id,actor_id,edition_id,source_version,preview_hash,body,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?)',
            (preview_id,target,actor.id,edition_id,version,hashed,canonical(plan),now,now+ttl))
        return {'previewId':preview_id,'previewHash':hashed,'sourceVersion':version,'expiresAt':now+ttl,'plan':plan,'confirmationRequired':True,'capability':provider.upper()}
    return transact(store,actor,'calendar.preview',key,{'editionId':edition_id,'provider':provider,'ttl':ttl},apply)


def _owned_intent(c,actor,edition_id,preview_id):
    row=c.execute('SELECT * FROM study_calendar_intents WHERE id=? AND actor_id=? AND edition_id=?',(preview_id,actor.id,edition_id)).fetchone()
    if not row:raise StudyError('not_found',404)
    return row


def confirm_schedule(store,actor,edition_id,preview_id,preview_hash,expected_version,confirmed,key,provider):
    _edition(store,actor,edition_id,teacher=True)
    if confirmed is not True:raise StudyError('calendar_confirmation_required')
    if not _hex(preview_id,32) or not _hex(preview_hash,64) or not _hex(expected_version,64):raise StudyError('invalid_calendar_intent')
    if not isinstance(key,str) or not 1<=len(key)<=256:raise StudyError('idempotency_key_required')
    payload={'editionId':edition_id,'previewId':preview_id,'previewHash':preview_hash,'sourceVersion':expected_version,'confirmed':True}
    hashed=digest(canonical(payload))
    with store.transaction() as c:
        store.lock_command(c,actor.id,'calendar.confirm',key)
        store.lock_edition(c,edition_id)
        previous=lookup_receipt(c,actor.id,'calendar.confirm',key,hashed)
        if previous is not None:return previous
        row=_owned_intent(c,actor,edition_id,preview_id);plan=json.loads(row['body'])
        if row['preview_hash']!=preview_hash or digest(canonical(plan))!=preview_hash:raise StudyError('calendar_preview_mismatch',409)
        if row['source_version']!=expected_version or source_version(_edition(store,actor,edition_id,True))!=expected_version:raise StudyError('calendar_preview_stale',409)
        if row['state']=='preview' and row['expires_at']<=store.clock():raise StudyError('calendar_preview_expired',409)
        if row['confirm_key'] not in (None,key):raise StudyError('calendar_intent_consumed',409)
        taken=c.execute('SELECT id FROM study_calendar_intents WHERE actor_id=? AND confirm_key=?',(actor.id,key)).fetchone()
        if taken and taken['id']!=preview_id:raise StudyError('idempotency_conflict',409)
        active=c.execute("SELECT id FROM study_calendar_intents WHERE target_id=? AND state='publishing' AND id!=?",(row['target_id'],preview_id)).fetchone()
        if active:raise StudyError('calendar_publication_in_progress',409)
        c.execute("UPDATE study_calendar_intents SET state='publishing',confirm_key=? WHERE id=?",(key,preview_id))
        if plan['provider']=='mock':
            if not isinstance(provider,CalendarPort) or provider.provider_id!='mock':raise StudyError('calendar_not_configured',501)
            for item in plan['sessions']:
                c.execute('INSERT OR IGNORE INTO study_calendar_mappings(target_id,session_id,event_id) VALUES(?,?,?)',
                    (plan['targetId'],item['sessionId'],digest(canonical([plan['targetId'],item['sessionId']]))[:32]))
    # Durable preparation precedes the provider call. The DB transaction is
    # deliberately not held across I/O; stable event IDs recover lost ACKs.
    if plan['provider']=='mock':
        for item in plan['sessions']:
            if source_version(_edition(store,actor,edition_id,True))!=expected_version:raise StudyError('calendar_preview_stale',409)
            mapping=store.connection.execute('SELECT * FROM study_calendar_mappings WHERE target_id=? AND session_id=?',(plan['targetId'],item['sessionId'])).fetchone()
            body={**item,'title':plan['title'],'status':plan['status'].lower()}
            try:applied=provider.upsert(plan['providerScope'],mapping['event_id'],body,mapping['etag'])
            except (TimeoutError,OSError):raise StudyError('calendar_provider_unavailable',503) from None
            with store.transaction() as c:
                store.lock_edition(c,edition_id)
                # The provider ACK may arrive after a duplicate request has
                # completed this intent and a newer confirmed plan. Validate
                # authority again under the same lock as Calendar publication.
                current=_owned_intent(c,actor,edition_id,preview_id)
                if current['source_version']!=expected_version or source_version(_edition(store,actor,edition_id,True))!=expected_version:
                    raise StudyError('calendar_preview_stale',409)
                previous=lookup_receipt(c,actor.id,'calendar.confirm',key,hashed)
                if previous is not None:return previous
                if current['state']!='publishing' or current['confirm_key']!=key or current['preview_hash']!=preview_hash:
                    raise StudyError('calendar_intent_consumed',409)
                c.execute('UPDATE study_calendar_mappings SET source_version=?,etag=?,applied_body=? WHERE target_id=? AND session_id=?',
                    (expected_version,applied['etag'],canonical(body),plan['targetId'],item['sessionId']))
    with store.transaction() as c:
        store.lock_command(c,actor.id,'calendar.confirm',key)
        store.lock_edition(c,edition_id)
        previous=lookup_receipt(c,actor.id,'calendar.confirm',key,hashed)
        if previous is not None:return previous
        if source_version(_edition(store,actor,edition_id,True))!=expected_version:raise StudyError('calendar_preview_stale',409)
        c.execute("UPDATE study_calendar_intents SET state='published',consumed_at=? WHERE id=?",(store.clock(),preview_id))
        mappings=[dict(item) for item in c.execute('SELECT session_id,event_id,etag FROM study_calendar_mappings WHERE target_id=? ORDER BY session_id',(plan['targetId'],))] if plan['provider']=='mock' else []
        result={'receiptId':identifier(),'previewId':preview_id,'state':'published','provider':plan['provider'],
            'sourceVersion':expected_version,'mappings':mappings,'icsSha256':digest(render_ics(plan)),
            'canonicalDatesChanged':False,'invitations':'NONE','capability':plan['provider'].upper()}
        record_receipt(c,actor.id,'calendar.confirm',key,hashed,result)
        return result


def get_ics(store,actor,edition_id,preview_id):
    edition=_edition(store,actor,edition_id)
    if not _hex(preview_id,32):raise StudyError('invalid_calendar_intent')
    if actor.role=='teacher':
        row=store.connection.execute('SELECT * FROM study_calendar_intents WHERE id=? AND edition_id=? AND actor_id=?',(preview_id,edition_id,actor.id)).fetchone()
    else:
        row=store.connection.execute("SELECT i.* FROM study_calendar_intents i JOIN study_calendar_targets t ON t.id=i.target_id WHERE i.id=? AND i.edition_id=? AND i.state='published' AND t.provider='ics'",(preview_id,edition_id)).fetchone()
    if not row:raise StudyError('not_found',404)
    if row['source_version']!=source_version(edition):raise StudyError('calendar_preview_stale',409)
    if row['state']=='preview' and row['expires_at']<=store.clock():raise StudyError('calendar_preview_expired',409)
    plan=json.loads(row['body'])
    if digest(canonical(plan))!=row['preview_hash']:raise StudyError('calendar_preview_mismatch',409)
    return render_ics(plan)


def _conflicts(store,target):
    result=[]
    for mapping in store.connection.execute('SELECT * FROM study_calendar_mappings WHERE target_id=?',(target,)):
        if not mapping['applied_body']:continue
        expected=json.loads(mapping['applied_body'])
        cached=store.connection.execute('SELECT * FROM study_calendar_cache WHERE target_id=? AND event_id=?',(target,mapping['event_id'])).fetchone()
        reason='external_missing' if not cached else 'external_cancelled' if cached['status']=='cancelled' else 'external_changed' if (cached['start_utc'],cached['end_utc'],cached['status'])!=(expected['startUtc'],expected['endUtc'],expected['status']) else None
        if reason:result.append({'sessionId':mapping['session_id'],'reason':reason,'action':'TEACHER_REVIEW_REQUIRED'})
    return result


def _snapshot(provider,target,cursor):
    try:return provider.snapshot(target,cursor)
    except (TimeoutError,OSError):raise StudyError('calendar_provider_unavailable',503) from None


def reconcile_calendar(store,actor,edition_id,target_id,provider):
    target=_target(store,actor,edition_id,target_id)
    if target['provider']!='mock' or not isinstance(provider,CalendarPort) or provider.provider_id!='mock':raise StudyError('calendar_not_configured',501)
    version=target['sync_version'];full=target['sync_cursor'] is None
    scope=_scope(target)
    try:items,cursor=_snapshot(provider,scope,target['sync_cursor'])
    except SyncGone:
        with store.transaction() as c:
            store.lock_aggregate(c,'calendar.sync',target_id)
            changed=c.execute('UPDATE study_calendar_targets SET sync_cursor=NULL,sync_version=sync_version+1 WHERE id=? AND sync_version=?',(target_id,version))
            if changed.rowcount!=1:raise StudyError('calendar_sync_conflict',409)
            c.execute('DELETE FROM study_calendar_cache WHERE target_id=?',(target_id,))
        version+=1;full=True
        try:items,cursor=_snapshot(provider,scope,None)
        except SyncGone:raise StudyError('calendar_provider_unavailable',503) from None
    if not isinstance(items,list) or len(items)>100 or not isinstance(cursor,str) or len(cursor)>256:raise StudyError('calendar_sync_budget')
    minimal=[];seen=set()
    for item in items:
        try:
            event_id=item['id'];etag=item['etag'];body=item['body'];status=body['status']
            if not isinstance(event_id,str) or not 1<=len(event_id)<=128 or event_id in seen or not isinstance(etag,str) or not 1<=len(etag)<=128 or status not in ('confirmed','tentative','cancelled'):raise ValueError()
            seen.add(event_id)
            start=utc(instant(body['startUtc']));end=utc(instant(body['endUtc']))
            if instant(start)>=instant(end):raise ValueError()
            minimal.append((target_id,event_id,start,end,etag,status))
        except (KeyError,TypeError,ValueError):raise StudyError('invalid_calendar_provider_data') from None
    with store.transaction() as c:
        store.lock_aggregate(c,'calendar.sync',target_id)
        changed=c.execute('UPDATE study_calendar_targets SET sync_cursor=?,sync_version=sync_version+1 WHERE id=? AND sync_version=?',(cursor,target_id,version))
        if changed.rowcount!=1:raise StudyError('calendar_sync_conflict',409)
        c.execute('DELETE FROM study_calendar_cache WHERE target_id=?',(target_id,))
        for item in minimal:c.execute('INSERT INTO study_calendar_cache VALUES(?,?,?,?,?,?)',item)
    return {'provider':'mock','targetId':target_id,'syncCursor':cursor,'fullResync':full,'conflicts':_conflicts(store,target_id),'canonicalDatesChanged':False}


def mock_channel(store,actor,edition_id,target_id,*,renew=False):
    target=_target(store,actor,edition_id,target_id)
    if target['provider']!='mock':raise StudyError('calendar_not_configured',501)
    if renew:
        with store.transaction() as c:
            store.lock_aggregate(c,'calendar.sync',target_id)
            c.execute('UPDATE study_calendar_targets SET channel_id=?,channel_token=?,channel_expires=? WHERE id=?',(identifier(),identifier(),store.clock()+3600,target_id))
            c.execute('DELETE FROM study_calendar_deliveries WHERE target_id=?',(target_id,))
        target=_target(store,actor,edition_id,target_id)
    return {'channelId':target['channel_id'],'channelToken':target['channel_token'],'resourceId':target['channel_resource']}


def receive_mock_push(store,actor,edition_id,target_id,notification,provider):
    target=_target(store,actor,edition_id,target_id)
    if not isinstance(notification,dict) or set(notification)!={'channelId','channelToken','resourceId','deliveryId'}:raise StudyError('calendar_channel_invalid',403)
    delivery=notification['deliveryId']
    valid_scope=target['provider']=='mock' and target['channel_expires']>store.clock()
    for key,column in [('channelId','channel_id'),('channelToken','channel_token'),('resourceId','channel_resource')]:
        value=notification[key]
        if not isinstance(value,str) or len(value)>128 or not value.isascii() or not hmac.compare_digest(value,target[column] or ''):
            valid_scope=False
    if not valid_scope or not isinstance(delivery,str) or not 1<=len(delivery)<=64:raise StudyError('calendar_channel_invalid',403)
    parameters=(target_id,target['channel_id'],delivery)
    if store.connection.execute('SELECT 1 FROM study_calendar_deliveries WHERE target_id=? AND channel_id=? AND delivery_id=?',parameters).fetchone():return {'duplicate':True,'provider':'mock'}
    result=reconcile_calendar(store,actor,edition_id,target_id,provider)
    with store.transaction() as c:
        c.execute('INSERT OR IGNORE INTO study_calendar_deliveries VALUES(?,?,?,?)',(*parameters,store.clock()))
    return {**result,'duplicate':False}
