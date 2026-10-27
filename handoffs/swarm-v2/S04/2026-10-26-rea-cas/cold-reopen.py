"""Run after the private server exits; fresh production factory and real cookie auth."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
sys.path[:0] = [str(ROOT / path) for path in ('packages/engine', 'services/study-api')]
from fastapi.testclient import TestClient
from study_api.app import create_app

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--browser-evidence', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    access = json.loads((args.data_dir / 'demo-access.json').read_text())
    browser = json.loads(args.browser_evidence.read_text())
    with TestClient(create_app(args.data_dir / 'study.sqlite', demo=True)) as client:
        assert client.post('/study/session', json={'token': access['tokens']['tutor-synthetic']}).status_code == 200
        url = '/study/resources/' + browser['resourceId']
        response = client.get(url)
        assert response.status_code == 200
        current = response.json()
        exact = client.get(url + '/revisions/' + browser['initialRevision'])
        assert exact.status_code == 200
        assert exact.json()['revisionId'] == browser['initialRevision']
        assert current['revisionId'] == browser['currentRevision']
        worksheet = json.loads(current['text'])
        assert worksheet['notes'] == browser['note']
        assert current['sha256'] == hashlib.sha256(current['text'].encode()).hexdigest()
        source = worksheet['source']
        question = client.get('/study/editions/fluidi/question-banks/' + source['bankId'] + '/review/questions/' + source['questionId'])
        assert question.status_code == 200
        assert question.json()['questionVersion'] == source['questionVersion']
        assert question.json()['contentSha256'] == source['contentSha256']
        assert question.json()['state']['servable'] is False
        assert current['visibility'] == 'private'
        result = {'freshProcess': True, 'factory': 'production create_app without quality hook',
                  'resourceId': current['id'], 'currentRevision': current['revisionId'],
                  'exactHistoricalRevision': exact.json()['revisionId'], 'textSha256': current['sha256'],
                  'noteMatch': True, 'sourceMatch': True, 'published': False,
                  'visibility': current['visibility']}
        args.output.write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(result))
