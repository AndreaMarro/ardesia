"""Calendar is a teacher-confirmed projection; external state cannot edit Core."""
from copy import deepcopy
import json
import pytest
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from lessonos.study.groups import configure_sessions
from lessonos.study.calendar_mock import MockCalendar
from lessonos.study.calendar import preview_schedule,confirm_schedule,get_ics,reconcile_calendar,mock_channel,receive_mock_push
from test_calendar_time import dates


@pytest.fixture
def calendar(tmp_path):
    now=[1790000000.]
    store=StudyStore(tmp_path/'calendar.sqlite',clock=lambda:now[0])
    tutor=store.create_principal('tutor-calendar','teacher')
    other=store.create_principal('tutor-other','teacher')
    student=store.create_principal('student-calendar','student')
    peer=store.create_principal('student-peer','student')
    store.create_edition(tutor,'calendar-edition');configure_sessions(store,tutor,'calendar-edition',dates())
    store.add_test_member(tutor,'calendar-edition',student.id)
    provider=MockCalendar()
    yield store,tutor,other,student,peer,provider,now
    store.close()


def preview(calendar,target='mock',key='preview'):
    store,tutor,*_=calendar
    return preview_schedule(store,tutor,'calendar-edition',target,key)


def confirm(calendar,intent,key='publish',confirmed=True):
    store,tutor,_,_,_,provider,_=calendar
    return confirm_schedule(store,tutor,'calendar-edition',intent['previewId'],intent['previewHash'],intent['sourceVersion'],confirmed,key,provider)


def canonical_facts(store):
    result={table:[dict(row) for row in store.connection.execute('SELECT * FROM '+table)] for table in ('study_editions','study_members','enrollments','study_holds','study_resources','study_revisions','study_submissions','study_feedback','study_reviews','study_observations')}
    result['nonCalendarReceipts']=[dict(row) for row in store.connection.execute("SELECT * FROM study_receipts WHERE operation NOT LIKE 'calendar.%'")]
    result['nonCalendarEvents']=[dict(row) for row in store.connection.execute("SELECT * FROM study_events WHERE kind NOT LIKE 'calendar.%'")]
    return result


def test_retry_and_lost_ack_produce_exactly_four_stable_mappings_and_provider_events(calendar):
    store,tutor,_,_,_,provider,_=calendar
    intent=preview(calendar);before=canonical_facts(store)
    provider.lose_next_ack=True
    with pytest.raises(StudyError,match='calendar_provider_unavailable'):confirm(calendar,intent)
    assert store.connection.execute('SELECT COUNT(*) FROM study_calendar_mappings').fetchone()[0]==4
    assert sum(map(len,provider.events.values()))==1
    result=confirm(calendar,intent)
    assert confirm(calendar,intent)==result and result['state']=='published' and result['provider']=='mock'
    assert sum(map(len,provider.events.values()))==4 and canonical_facts(store)==before
    reopened=StudyStore(store.path)
    assert reopened.connection.execute('SELECT COUNT(*) FROM study_calendar_mappings').fetchone()[0]==4
    reopened.close()


def test_expiry_stale_version_cross_actor_and_explicit_confirmation(calendar):
    store,tutor,other,student,peer,provider,now=calendar
    intent=preview(calendar)
    for actor in (other,student,peer):
        with pytest.raises(StudyError):preview_schedule(store,actor,'calendar-edition','mock','forbidden')
        with pytest.raises(StudyError):confirm_schedule(store,actor,'calendar-edition',intent['previewId'],intent['previewHash'],intent['sourceVersion'],True,'foreign',provider)
    with pytest.raises(StudyError,match='calendar_confirmation_required'):confirm(calendar,intent,confirmed=False)
    with pytest.raises(StudyError,match='calendar_preview_mismatch'):
        confirm_schedule(store,tutor,'calendar-edition',intent['previewId'],'0'*64,intent['sourceVersion'],True,'tamper',provider)
    now[0]+=301
    with pytest.raises(StudyError,match='calendar_preview_expired'):confirm(calendar,intent)
    current=preview(calendar,key='new')
    with store.transaction() as c:c.execute("UPDATE study_editions SET state='offered' WHERE id='calendar-edition'")
    with pytest.raises(StudyError,match='calendar_preview_stale'):confirm(calendar,current,key='new-confirm')
    assert not provider.events


def test_mock_push_duplicate_out_of_order_lost_and_410_preserve_core_and_mappings(calendar):
    from lessonos.study.submissions import submit
    from lessonos.study.feedback import propose_feedback,review_feedback
    from lessonos.study.groups import reserve_seat,confirm_test_enrollment
    store,tutor,*_,provider,now=calendar
    student,peer=calendar[3:5]
    source=store.create_resource(student,'calendar-edition','notes','Fonte canonica consegnata.')
    receipt=submit(store,student,'calendar-edition','poiseuille-v1',[],'Ragionamento canonico.','preserved',source_refs=[{'resourceId':source['id'],'revisionId':source['revisionId']}])
    draft=propose_feedback(store,tutor,receipt['submissionId'])
    review_feedback(store,tutor,draft['id'],1,'Osservazione sintetica restituita.','preserved-review')
    hold=reserve_seat(store,peer,'calendar-edition','preserved-hold',now[0],ttl=1)
    confirm_test_enrollment(store,peer,hold['id'],'late-confirm',now[0]+2)
    intent=preview(calendar);confirm(calendar,intent)
    before=canonical_facts(store)
    target=intent['plan']['targetId'];scope=intent['plan']['providerScope']
    channel=mock_channel(store,tutor,'calendar-edition',target)
    first=receive_mock_push(store,tutor,'calendar-edition',target,{**channel,'deliveryId':'99'},provider)
    assert first['duplicate'] is False
    assert first['fullResync'] is True
    reads=provider.reads
    assert receive_mock_push(store,tutor,'calendar-edition',target,{**channel,'deliveryId':'99'},provider)['duplicate'] is True
    assert provider.reads==reads
    event_id=next(iter(provider.events[scope]))
    provider.external_change(scope,event_id,startUtc='2026-10-20T15:00:00Z',privateTitle='NEVER STORE THIS')
    changed=receive_mock_push(store,tutor,'calendar-edition',target,{**channel,'deliveryId':'7'},provider)
    assert changed['conflicts'] and 'NEVER STORE THIS' not in json.dumps(changed)
    # A lost notification is repaired by an explicit reconciliation, not by
    # treating push metadata as the changed event itself.
    provider.external_change(scope,event_id,status='cancelled')
    state=reconcile_calendar(store,tutor,'calendar-edition',target,provider)
    provider.expire_cursor(scope,state['syncCursor'])
    reset=reconcile_calendar(store,tutor,'calendar-edition',target,provider)
    assert reset['fullResync'] is True and reset['conflicts']
    assert store.connection.execute('SELECT COUNT(*) FROM study_calendar_mappings').fetchone()[0]==4
    assert canonical_facts(store)==before
    assert 'NEVER STORE THIS' not in str([dict(row) for row in store.connection.execute('SELECT * FROM study_calendar_cache')])
    with pytest.raises(StudyError,match='calendar_channel_invalid'):
        receive_mock_push(store,tutor,'calendar-edition',target,{**channel,'resourceId':'wrong','deliveryId':'100'},provider)


def test_ics_teacher_preview_and_published_member_download_are_frozen_and_scoped(calendar):
    store,tutor,other,student,peer,provider,now=calendar
    intent=preview(calendar,'ics')
    one=get_ics(store,tutor,'calendar-edition',intent['previewId'])
    assert b'STATUS:TENTATIVE' in one
    with pytest.raises(StudyError):get_ics(store,student,'calendar-edition',intent['previewId'])
    result=confirm(calendar,intent)
    now[0]+=1000
    assert get_ics(store,tutor,'calendar-edition',intent['previewId'])==one
    assert get_ics(store,student,'calendar-edition',intent['previewId'])==one
    for actor in (other,peer):
        with pytest.raises(StudyError):get_ics(store,actor,'calendar-edition',intent['previewId'])
    assert not provider.events and result['provider']=='ics'


def test_pending_publication_cannot_be_replaced_by_another_intent_or_key(calendar):
    store,tutor,other,student,peer,provider,now=calendar
    first=preview(calendar);provider.lose_next_ack=True
    with pytest.raises(StudyError,match='calendar_provider_unavailable'):confirm(calendar,first)
    with pytest.raises(StudyError,match='calendar_intent_consumed'):confirm(calendar,first,key='different')
    second=preview(calendar,key='other-preview')
    with pytest.raises(StudyError,match='calendar_publication_in_progress'):confirm(calendar,second,key='other-confirm')
    result=confirm(calendar,first)
    assert result['state']=='published' and sum(map(len,provider.events.values()))==4


def test_expired_or_malformed_mock_channel_and_google_target_do_not_gain_authority(calendar):
    store,tutor,other,student,peer,provider,now=calendar
    with pytest.raises(StudyError,match='calendar_not_configured'):preview(calendar,'google')
    assert store.connection.execute('SELECT COUNT(*) FROM study_calendar_targets').fetchone()[0]==0
    intent=preview(calendar);target=intent['plan']['targetId'];channel=mock_channel(store,tutor,'calendar-edition',target)
    for change in ({'channelToken':'é'},{'channelId':'foreign'},{'deliveryId':True},{'unexpected':'payload'}):
        with pytest.raises(StudyError,match='calendar_channel_invalid'):
            receive_mock_push(store,tutor,'calendar-edition',target,{**channel,'deliveryId':'5',**change},provider)
    now[0]+=3601
    with pytest.raises(StudyError,match='calendar_channel_invalid'):receive_mock_push(store,tutor,'calendar-edition',target,{**channel,'deliveryId':'5'},provider)
    renewed=mock_channel(store,tutor,'calendar-edition',target,renew=True)
    assert renewed['channelId']!=channel['channelId']
    assert receive_mock_push(store,tutor,'calendar-edition',target,{**renewed,'deliveryId':'3'},provider)['duplicate'] is False


def test_concurrent_same_actor_key_has_one_receipt_and_four_events(calendar):
    from concurrent.futures import ThreadPoolExecutor
    store,tutor,other,student,peer,provider,now=calendar
    intent=preview(calendar)
    def publish():
        connection=StudyStore(store.path,clock=lambda:now[0])
        try:return confirm_schedule(connection,tutor,'calendar-edition',intent['previewId'],intent['previewHash'],intent['sourceVersion'],True,'concurrent',provider)
        finally:connection.close()
    with ThreadPoolExecutor(2) as pool:results=list(pool.map(lambda _:publish(),range(2)))
    assert results[0]==results[1] and sum(map(len,provider.events.values()))==4
    assert store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='calendar.confirm'").fetchone()[0]==1


def test_late_snapshot_cannot_overwrite_a_newer_committed_projection(calendar):
    from concurrent.futures import ThreadPoolExecutor
    import threading
    store,tutor,other,student,peer,original,now=calendar
    intent=preview(calendar);confirm(calendar,intent);target=intent['plan']['targetId']
    class HeldSnapshot(MockCalendar):
        def __init__(self):
            super().__init__();self.events=deepcopy(original.events);self.revisions=deepcopy(original.revisions)
            self.entered=threading.Event();self.release=threading.Event();self.hold=True
        def snapshot(self,*args):
            result=super().snapshot(*args)
            if self.hold:
                self.hold=False;self.entered.set();assert self.release.wait(4)
            return result
    provider=HeldSnapshot()
    def slow():
        connection=StudyStore(store.path,clock=lambda:now[0])
        try:return reconcile_calendar(connection,tutor,'calendar-edition',target,provider)
        finally:connection.close()
    with ThreadPoolExecutor(1) as pool:
        pending=pool.submit(slow)
        try:
            assert provider.entered.wait(2)
            event_id=next(iter(provider.events[intent['plan']['providerScope']]))
            provider.external_change(intent['plan']['providerScope'],event_id,startUtc='2026-10-20T15:00:00Z')
            assert reconcile_calendar(store,tutor,'calendar-edition',target,provider)['conflicts']
        finally:provider.release.set()
        with pytest.raises(StudyError,match='calendar_sync_conflict'):pending.result()
    assert store.connection.execute('SELECT start_utc FROM study_calendar_cache WHERE event_id=?',(event_id,)).fetchone()[0]=='2026-10-20T15:00:00Z'


def test_failed_full_sync_after_410_keeps_mappings_and_core_but_clears_only_cache(calendar,monkeypatch):
    store,tutor,other,student,peer,provider,now=calendar
    intent=preview(calendar);confirm(calendar,intent);target=intent['plan']['targetId']
    state=reconcile_calendar(store,tutor,'calendar-edition',target,provider);before=canonical_facts(store)
    provider.expire_cursor(intent['plan']['providerScope'],state['syncCursor']);original=provider.snapshot
    def failure(scope,cursor=None):
        if cursor is None:raise TimeoutError('synthetic full sync unavailable')
        return original(scope,cursor)
    monkeypatch.setattr(provider,'snapshot',failure)
    with pytest.raises(StudyError,match='calendar_provider_unavailable'):reconcile_calendar(store,tutor,'calendar-edition',target,provider)
    assert store.connection.execute('SELECT sync_cursor FROM study_calendar_targets WHERE id=?',(target,)).fetchone()[0] is None
    assert store.connection.execute('SELECT COUNT(*) FROM study_calendar_cache').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM study_calendar_mappings').fetchone()[0]==4
    assert canonical_facts(store)==before
    monkeypatch.setattr(provider,'snapshot',original)
    reconcile_calendar(store,tutor,'calendar-edition',target,provider)
    assert store.connection.execute('SELECT COUNT(*) FROM study_calendar_cache').fetchone()[0]==4


def test_explicit_core_date_reorder_needs_new_preview_but_preserves_ordinal_event_ids(calendar):
    store,tutor,other,student,peer,provider,now=calendar
    store.create_edition(other,'editable')
    configure_sessions(store,other,'editable',dates())
    first=preview_schedule(store,other,'editable','mock','original')
    confirm_schedule(store,other,'editable',first['previewId'],first['previewHash'],first['sourceVersion'],True,'original-confirm',provider)
    target=first['plan']['targetId'];scope=first['plan']['providerScope'];ids=set(provider.events[scope])
    reversed_dates=list(reversed(dates()))
    configure_sessions(store,other,'editable',reversed_dates)
    with pytest.raises(StudyError,match='calendar_preview_stale'):
        confirm_schedule(store,other,'editable',first['previewId'],first['previewHash'],first['sourceVersion'],True,'stale-new-key',provider)
    second=preview_schedule(store,other,'editable','mock','reordered')
    assert second['sourceVersion']!=first['sourceVersion'] and second['plan']['sequence']==1
    assert [item['sessionId'] for item in second['plan']['sessions']]==[item['sessionId'] for item in first['plan']['sessions']]
    confirm_schedule(store,other,'editable',second['previewId'],second['previewHash'],second['sourceVersion'],True,'reorder-confirm',provider)
    assert set(provider.events[scope])==ids
    assert store.get_edition('editable')['sessions']==reversed_dates


def test_core_depends_on_small_calendar_port_not_a_concrete_mock_class(calendar):
    store,tutor,other,student,peer,delegate,now=calendar
    class WrappedPort:
        provider_id='mock'
        def upsert(self,*args):return delegate.upsert(*args)
        def snapshot(self,*args):return delegate.snapshot(*args)
    port=WrappedPort();intent=preview(calendar)
    result=confirm_schedule(store,tutor,'calendar-edition',intent['previewId'],intent['previewHash'],intent['sourceVersion'],True,'wrapped',port)
    assert len(result['mappings'])==4
    assert reconcile_calendar(store,tutor,'calendar-edition',intent['plan']['targetId'],port)['provider']=='mock'


def test_two_editions_share_provider_account_calendar_scope_without_event_identity_collision(calendar):
    store,tutor,other,student,peer,provider,now=calendar
    first=preview(calendar);confirm(calendar,first)
    store.create_edition(tutor,'december')
    december=[{'start':f'2026-12-{day:02}T18:00:00+01:00','end':f'2026-12-{day:02}T19:30:00+01:00'} for day in (1,3,8,10)]
    configure_sessions(store,tutor,'december',december)
    second=preview_schedule(store,tutor,'december','mock','december-preview')
    confirm_schedule(store,tutor,'december',second['previewId'],second['previewHash'],second['sourceVersion'],True,'december-confirm',provider)
    assert first['plan']['providerScope']==second['plan']['providerScope']
    assert first['plan']['targetId']!=second['plan']['targetId']
    assert len(provider.events[first['plan']['providerScope']])==8
    assert len(provider.events)==1 and store.connection.execute('SELECT COUNT(*) FROM study_calendar_mappings').fetchone()[0]==8
    assert not reconcile_calendar(store,tutor,'calendar-edition',first['plan']['targetId'],provider)['conflicts']


def test_late_duplicate_publish_ack_cannot_regress_a_newer_confirmed_mapping(calendar):
    from concurrent.futures import ThreadPoolExecutor
    import threading
    store,_,tutor,*_,now=calendar
    edition_id='late-ack-edition'
    store.create_edition(tutor,edition_id)
    configure_sessions(store,tutor,edition_id,dates())
    first=preview_schedule(store,tutor,edition_id,'mock','first-preview')

    class HeldAcknowledgement(MockCalendar):
        def __init__(self):
            super().__init__();self.entered=threading.Event();self.release=threading.Event();self.hold=True
        def upsert(self,*args):
            result=super().upsert(*args)
            if self.hold:
                self.hold=False;self.entered.set();assert self.release.wait(4)
            return result

    provider=HeldAcknowledgement()
    def publish(connection,intent,key):
        return confirm_schedule(connection,tutor,edition_id,intent['previewId'],intent['previewHash'],
            intent['sourceVersion'],True,key,provider)
    def late_duplicate():
        connection=StudyStore(store.path,clock=lambda:now[0])
        try:return publish(connection,first,'first-confirm')
        finally:connection.close()

    with ThreadPoolExecutor(1) as pool:
        pending=pool.submit(late_duplicate)
        try:
            assert provider.entered.wait(2)
            # The same intent/key may finish through another request while its
            # first provider acknowledgement is still in flight.
            assert publish(store,first,'first-confirm')['state']=='published'
            december=[{'start':f'2026-12-{day:02}T18:00:00+01:00',
                'end':f'2026-12-{day:02}T19:30:00+01:00'} for day in (1,3,8,10)]
            # This edition has no members; canonical administrative rescheduling
            # is authorized and a new explicit preview/confirm is required.
            configure_sessions(store,tutor,edition_id,december)
            latest=preview_schedule(store,tutor,edition_id,'mock','latest-preview')
            latest_receipt=publish(store,latest,'latest-confirm')
            mappings=[dict(row) for row in store.connection.execute(
                'SELECT * FROM study_calendar_mappings WHERE target_id=? ORDER BY session_id',
                (latest['plan']['targetId'],))]
            external=deepcopy(provider.events)
        finally:provider.release.set()
        with pytest.raises(StudyError,match='calendar_preview_stale'):pending.result()

    assert [dict(row) for row in store.connection.execute(
        'SELECT * FROM study_calendar_mappings WHERE target_id=? ORDER BY session_id',
        (latest['plan']['targetId'],))]==mappings
    assert all(row['source_version']==latest['sourceVersion'] for row in mappings)
    assert provider.events==external and sum(map(len,provider.events.values()))==4
    assert publish(store,latest,'latest-confirm')==latest_receipt
    assert not reconcile_calendar(store,tutor,edition_id,latest['plan']['targetId'],provider)['conflicts']
    assert store.get_edition(edition_id)['sessions']==december
