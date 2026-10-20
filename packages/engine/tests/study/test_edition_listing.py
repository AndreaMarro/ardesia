"""Mine-only edition discovery uses Core ownership/membership before decoding."""
import pytest
from lessonos.study.models import Principal, StudyError
from lessonos.study.store import StudyStore


@pytest.fixture
def catalog(tmp_path):
    store=StudyStore(tmp_path/'catalog.sqlite')
    teacher=store.create_principal('tutor-list','teacher')
    other=store.create_principal('tutor-other','teacher')
    student=store.create_principal('student-list','student')
    peer=store.create_principal('student-peer','student')
    empty=store.create_principal('student-empty','student')
    for edition in ('z-last','e-wait','a-physics'):
        store.create_edition(teacher,edition)
    store.create_edition(teacher,'c-analysis',course_id='analisi-1',pack_id='taylor-exp-v1')
    for edition in ('d-peer','b-other'):store.create_edition(other,edition)
    for owner,edition in ((teacher,'a-physics'),(teacher,'c-analysis'),(other,'b-other')):
        store.add_test_member(owner,edition,student.id)
    store.add_test_member(other,'d-peer',peer.id)
    with store.transaction() as c:
        c.execute('INSERT INTO study_waitlist VALUES(?,?)',('e-wait',student.id))
        c.execute('INSERT INTO study_holds(id,edition_id,student_id,expires_at,state) VALUES(?,?,?,?,?)',('hold-only','z-last',student.id,store.clock()+100,'hold'))
        c.execute('INSERT INTO enrollments VALUES(?,?,?)',('legacy-only','e-wait',empty.id))
    yield store,teacher,other,student,peer,empty
    store.close()


def ids(page):return [item['id'] for item in page['items']]


def test_teacher_lists_only_owned_editions_and_descriptor(catalog):
    store,teacher,other,*_=catalog
    page=store.list_editions(teacher)
    assert ids(page)==['a-physics','c-analysis','e-wait','z-last']
    assert page['nextCursor'] is None
    assert all(item==store.get_edition(item['id']) for item in page['items'])
    analysis=page['items'][1]
    assert analysis['courseId']=='analisi-1' and analysis['packId']=='taylor-exp-v1'
    assert analysis['packVersion']==1 and len(analysis['packSha256'])==64
    assert 'activities' not in analysis and 'members' not in analysis
    assert ids(store.list_editions(other))==['b-other','d-peer']


def test_student_lists_own_memberships_only_across_teachers_not_waitlist_holds_or_legacy_projection(catalog):
    store,teacher,other,student,peer,empty=catalog
    assert ids(store.list_editions(student))==['a-physics','b-other','c-analysis']
    assert ids(store.list_editions(peer))==['d-peer']
    assert store.list_editions(empty)=={'items':[],'nextCursor':None}


@pytest.mark.parametrize('role,expected',[('teacher',['a-physics','c-analysis','e-wait','z-last']),('student',['a-physics','b-other','c-analysis'])])
def test_cursor_is_exclusive_stable_and_has_no_duplicates(catalog,role,expected):
    store,teacher,_,student,*_=catalog
    actor=teacher if role=='teacher' else student
    found=[];after=None
    while True:
        page=store.list_editions(actor,limit=2,after=after)
        found.extend(ids(page))
        if page['nextCursor'] is None:break
        assert page['nextCursor']==page['items'][-1]['id']
        after=page['nextCursor']
    assert found==expected
    assert store.list_editions(actor,after='zzzz')=={'items':[],'nextCursor':None}
    assert ids(store.list_editions(actor,after='b-between'))==[item for item in expected if item>'b-between']


def test_scope_and_limit_apply_before_json_decode_or_descriptor_resolution(catalog,monkeypatch):
    store,teacher,*_=catalog
    with store.transaction() as c:
        c.execute("UPDATE study_editions SET sessions='not json' WHERE id IN ('b-other','d-peer','e-wait','z-last')")
        c.execute("DELETE FROM study_edition_packs WHERE edition_id='b-other'")
    resolved=[];original=store.get_edition
    def observe(edition):
        resolved.append(edition)
        return original(edition)
    monkeypatch.setattr(store,'get_edition',observe)
    statements=[];store.connection.set_trace_callback(statements.append)
    page=store.list_editions(teacher,limit=2)
    assert ids(page)==['a-physics','c-analysis'] and page['nextCursor']=='c-analysis'
    assert resolved==['a-physics','c-analysis']
    query=next(sql for sql in statements if sql.startswith('SELECT e.id'))
    assert 'teacher_id=' in query and "'tutor-list'" in query and 'ORDER BY e.id' in query and 'LIMIT 3' in query


@pytest.mark.parametrize('limit',[0,-1,101,True,1.5,'2',10**1000])
def test_invalid_core_limits_fail_as_domain_errors_before_listing(catalog,limit):
    store,teacher,*_=catalog
    with pytest.raises(StudyError,match='invalid_edition_pagination') as error:store.list_editions(teacher,limit=limit)
    assert error.value.status==422


@pytest.mark.parametrize('after',['','x'*8193,1,True,[],{}])
def test_invalid_core_cursors_fail_as_domain_errors(catalog,after):
    store,teacher,*_=catalog
    with pytest.raises(StudyError,match='invalid_edition_pagination'):store.list_editions(teacher,after=after)


def test_valid_cursor_bounds_are_parameterized_and_never_expand_scope(catalog):
    store,teacher,*_=catalog
    for cursor in ('x'*128,'x'*8192,"' OR 1=1 --"):
        page=store.list_editions(teacher,after=cursor)
        assert all(item['teacherId']==teacher.id and item['id']>cursor for item in page['items'])


@pytest.mark.parametrize('principal',[Principal('missing','teacher'),Principal('tutor-list','student')])
def test_persisted_principal_is_verified_before_discovery(catalog,principal):
    store,*_=catalog
    with pytest.raises(StudyError,match='unauthenticated') as error:store.list_editions(principal)
    assert error.value.status==401


def test_default_page_is_bounded_to_fifty_and_does_not_decode_the_lookahead(tmp_path):
    store=StudyStore(tmp_path/'many.sqlite')
    teacher=store.create_principal('tutor-many','teacher')
    for index in range(51):store.create_edition(teacher,f'edition-{index:03}')
    first=store.list_editions(teacher)
    assert len(first['items'])==50 and first['nextCursor']=='edition-049'
    assert ids(store.list_editions(teacher,after=first['nextCursor']))==['edition-050']
    assert len(store.list_editions(teacher,limit=100)['items'])==51
    store.close()


def legacy_edition(store,teacher,edition):
    """Seed a pre-guard identifier without invoking new-edition validation."""
    with store.transaction() as c:
        c.execute('INSERT INTO classes VALUES(?,?,?)',(edition,teacher.id,'Legacy synthetic'))
        c.execute('INSERT INTO study_editions(id,teacher_id,capacity,price_minor) VALUES(?,?,10,4900)',(edition,teacher.id))
        c.execute("INSERT INTO study_edition_packs SELECT ?,course_id,pack_id,pack_version,pack_sha256 FROM study_edition_packs WHERE edition_id='a-physics'",(edition,))


@pytest.mark.parametrize('length',[129,8192])
def test_legacy_identifier_is_a_reusable_cursor_across_two_complete_pages(catalog,length):
    store,teacher,*_=catalog
    legacy='b'*length
    legacy_edition(store,teacher,legacy)
    first=store.list_editions(teacher,limit=2)
    assert ids(first)==['a-physics',legacy] and first['nextCursor']==legacy
    second=store.list_editions(teacher,limit=100,after=first['nextCursor'])
    assert ids(second)==['c-analysis','e-wait','z-last'] and second['nextCursor'] is None
    assert store.get_edition(legacy)['id']==legacy


@pytest.mark.parametrize('edition',['','new-'+'x'*125,None,True])
def test_new_edition_identifier_budget_rejects_invalid_ids_without_new_rows(catalog,edition):
    store,teacher,*_=catalog
    tables=('classes','study_editions','study_edition_packs')
    before=[store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0] for table in tables]
    with pytest.raises(StudyError,match='invalid_edition'):store.create_edition(teacher,edition)
    assert [store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0] for table in tables]==before


def test_new_identifiers_at_one_and_128_are_accepted(catalog):
    store,teacher,*_=catalog
    for edition in ('x','x'*128):assert store.create_edition(teacher,edition)['id']==edition


def test_unusable_legacy_cursor_fails_explicitly_without_truncating_or_skipping(catalog):
    store,teacher,*_=catalog
    legacy_edition(store,teacher,'b'*8193)
    with pytest.raises(StudyError,match='legacy_edition_identifier_requires_migration') as error:
        store.list_editions(teacher,limit=2)
    assert error.value.status==409
