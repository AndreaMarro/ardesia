from pathlib import Path
from fastapi.testclient import TestClient
from study_api.app import create_app
from lessonos.study.store import StudyStore


def test_same_origin_candidate_preserves_studio_route_and_core_auth(tmp_path):
    web = tmp_path / 'web'
    studio = tmp_path / 'studio'
    web.mkdir(); studio.mkdir()
    (web / 'index.html').write_text('<h1>Synthetic course shell</h1>')
    (studio / 'index.html').write_text('<h1>Synthetic teaching board</h1>')
    (studio / 'assets').mkdir()
    (studio / 'assets' / 'board.js').write_text('/* synthetic workspace asset */')
    StudyStore(tmp_path / 'study.sqlite').close()
    with TestClient(create_app(tmp_path / 'study.sqlite', demo=True, frontend=web, studio_frontend=studio)) as client:
        assert 'Synthetic course shell' in client.get('/').text
        assert 'Synthetic teaching board' in client.get('/studio/').text
        assert 'workspace asset' in client.get('/studio/assets/board.js').text
        assert client.get('/studio/missing-asset.js').status_code == 404
        assert client.get('/studio/%2e%2e/data/study.sqlite').status_code == 404
        assert client.get('/study/me').status_code == 401
        assert client.post('/study/session', json={'token':'invalid-synthetic-token'}).status_code == 401
