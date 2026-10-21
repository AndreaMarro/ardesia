"""Loopback-only synthetic Study API; all state belongs to the runner's tempdir."""
import argparse
import json
import os
from pathlib import Path
import socket
import uvicorn

from lessonos.study.store import StudyStore
from study_api.app import create_app


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', type=Path, required=True)
    parser.add_argument('--runtime-json', type=Path, required=True)
    parser.add_argument('--port', type=int, default=0)
    args = parser.parse_args()
    path = args.directory / 'study.sqlite'
    store = StudyStore(path)
    try:
        tutor = store.create_principal('probe-tutor', 'teacher')
        student = store.create_principal('probe-student', 'student')
        store.create_edition(tutor, 'probe-edition')
        store.add_test_member(tutor, 'probe-edition', student.id)
        token = store.issue_session(student)
    finally:
        store.close()
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(('127.0.0.1', args.port))
        port = sock.getsockname()[1]
        payload = json.dumps({'baseUrl': f'http://127.0.0.1:{port}', 'cookie': 'study_session=' + token})
        descriptor = os.open(args.runtime_json, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, 'w') as target:
            target.write(payload)
        config = uvicorn.Config(create_app(path, demo=True), host='127.0.0.1', port=port, log_level='warning')
        uvicorn.Server(config).run(sockets=[sock])


if __name__ == '__main__':
    main()
