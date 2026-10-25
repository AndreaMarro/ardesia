#!/usr/bin/env python3
"""Provision synthetic identities without email delivery or paid services.

Run only against the isolated loopback Supabase runtime. Session credentials
stay in a mode-600 local file; no tokens, passwords or contacts are printed.
"""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import secrets
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]
spec = importlib.util.spec_from_file_location('supabase_server', Path(__file__).with_name('serve-supabase.py'))
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


def seed(environment, directory):
    from lessonos.study.postgres import PostgresStudyStore, migrate
    from lessonos.study.groups import configure_sessions
    from study_api.runtime import SupabaseRuntime
    os.umask(0o077)
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    credentials = directory / 'supabase-access.json'
    previous = json.loads(credentials.read_text()) if credentials.exists() else {'accounts': {}}
    runtime = SupabaseRuntime(environment, directory)
    migrate(environment['DB_URL'])
    store = PostgresStudyStore(environment['DB_URL'], directory, administrative=True)
    actors = [('tutor-synthetic', 'teacher'), ('tutor-other', 'teacher')]
    actors += [(f'student-{index:02}', 'student') for index in range(1, 13)]
    accounts = {}
    try:
        for actor_id, role in actors:
            actor = store.create_principal(actor_id, role)
            saved = previous['accounts'].get(actor_id)
            if saved:
                email, password, user_id = saved['email'], saved['password'], saved['userId']
            else:
                email = actor_id + '-' + secrets.token_hex(8) + '@ardesia-g0.invalid'
                password = secrets.token_urlsafe(32) + 'X!7'
                user = json.loads(runtime.request('POST', '/auth/v1/admin/users', cleanup=True,
                    body={'email': email, 'password': password, 'email_confirm': True}))
                user_id = user['id']
            store.connection.execute('INSERT INTO ardesia_private.identities VALUES(?,?) ON CONFLICT(actor_id) DO UPDATE SET auth_user_id=excluded.auth_user_id', (user_id, actor_id))
            session = json.loads(runtime.request('POST', '/auth/v1/token?grant_type=password',
                body={'email': email, 'password': password}))
            accounts[actor_id] = {'role': role, 'userId': user_id, 'email': email,
                'password': password, 'token': session['access_token'], 'expiresAt': session['expires_at']}
        tutor = store.create_principal('tutor-synthetic', 'teacher')
        if not store.connection.execute("SELECT 1 FROM study_editions WHERE id='fluidi'").fetchone():
            store.create_edition(tutor, 'fluidi')
            sessions = [{'start': f'2026-11-{day:02}T18:00:00+01:00',
                         'end': f'2026-11-{day:02}T19:30:00+01:00'} for day in (3, 5, 10, 12)]
            configure_sessions(store, tutor, 'fluidi', sessions)
        payload = {'synthetic': True, 'authentication': 'real_local_supabase',
            'emailDelivery': False, 'accounts': accounts,
            'tokens': {actor_id: account['token'] for actor_id, account in accounts.items()}}
        credentials.write_text(json.dumps(payload, indent=2))
        credentials.chmod(0o600)
        return credentials
    finally:
        store.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--env-file', required=True, type=Path)
    parser.add_argument('--data-dir', required=True, type=Path)
    args = parser.parse_args()
    seed(server.configuration(args.env_file), args.data_dir)
    print('Synthetic Supabase identities provisioned; credentials retained privately.')
