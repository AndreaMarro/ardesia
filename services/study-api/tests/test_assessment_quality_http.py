import pytest


@pytest.fixture(autouse=True)
def install_real_quality_adapter(monkeypatch):
    # S10 owns app.py. Compose the actual adapter with the factory's actual
    # dependencies in this isolated integration test; no fake auth or responses.
    import study_api.question_bank_routes as routes
    from lessonos.study.assessment_quality.routes import install_assessment_quality_routes
    original=routes.install_question_bank_routes
    def install(app,store_dependency,authenticate):
        original(app,store_dependency,authenticate)
        install_assessment_quality_routes(app,store_dependency,authenticate)
    monkeypatch.setattr(routes,'install_question_bank_routes',install)


from test_question_bank_approval_http import world, login, base  # noqa: F401


def test_quality_endpoint_is_teacher_only_and_read_only(world):
    client = world['client']; url = base()+'/review/quality'
    assert client.get(url).status_code == 401
    login(world,'member'); assert client.get(url).status_code == 403
    login(world,'outsider'); assert client.get(url).status_code == 403
    login(world,'owner'); response = client.get(url)
    assert response.status_code == 200
    report = response.json()
    assert report['summary']['records'] == 2
    assert report['publishedRecords'] == 0
    assert report['editorialBaseline']['total'] == 200
    assert not {'answer','solution','verification'} & report['items'][0].keys()
    for table in ['study_question_bank_reviews','study_question_bank_approvals']:
        assert world['store'].connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0] == 0


def test_quality_checks_authority_before_loading_bank(world,monkeypatch):
    import lessonos.study.assessment_quality.routes as routes
    def forbidden(*args,**kwargs): raise AssertionError('unauthorized bank load')
    monkeypatch.setattr(routes,'bank_access_for_edition',forbidden)
    login(world,'member')
    assert world['client'].get(base()+'/review/quality').status_code == 403


def test_quality_pagination_preserves_totals_and_rejects_stale_cursor(world):
    login(world,'owner');client=world['client'];url=base()+'/review/quality?scope=all&limit=1'
    first=client.get(url).json()
    assert first['total']==2 and len(first['items'])==1
    second=client.get(url+'&after='+first['nextCursor']).json()
    assert second['total']==2 and len(second['items'])==1 and second['nextCursor'] is None
    assert first['items'][0]['id']!=second['items'][0]['id']
    assert client.get(url+'&after=missing').status_code==422
    assert client.get(base()+'/review/quality?scope=unknown').status_code==422


def test_quality_does_not_retain_access_after_session_revocation(world):
    login(world,'owner');client=world['client'];url=base()+'/review/quality'
    assert client.get(url).status_code==200
    world['store'].revoke_all_sessions(world['actors']['owner'])
    assert client.get(url).status_code==401
