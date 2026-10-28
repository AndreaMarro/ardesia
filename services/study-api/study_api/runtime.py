"""Supabase infrastructure boundary for the shared Study application.

This first runtime is intentionally restricted to isolated loopback G0 tests.
Auth verifies JWTs remotely; PostgreSQL also checks the actual auth.sessions row.
No service key or trusted identity is accepted from a browser request.
"""
import base64
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
import uuid

from lessonos.study.models import Principal, StudyError
from lessonos.study.postgres import PostgresStudyStore


class SupabaseRuntime:
    def __init__(self, configuration, data_directory):
        self.api_url = configuration['API_URL'].rstrip('/')
        parsed = urllib.parse.urlsplit(self.api_url)
        if parsed.scheme != 'http' or parsed.hostname != '127.0.0.1' or parsed.username or parsed.password:
            raise ValueError('G0 Supabase runtime requires isolated loopback API')
        self.database_url = configuration['DB_URL']
        database = urllib.parse.urlsplit(self.database_url)
        if database.hostname != '127.0.0.1':
            raise ValueError('G0 Supabase runtime requires isolated loopback PostgreSQL')
        self.public_key = configuration['ANON_KEY']
        self._service_key = configuration['SERVICE_ROLE_KEY']
        self.data_directory = Path(data_directory)

    def request(self, method, path, *, token=None, body=None, raw=None, mime=None, cleanup=False):
        key = self._service_key if cleanup else self.public_key
        headers = {'apikey': key}
        if token or cleanup:
            headers['Authorization'] = 'Bearer ' + (key if cleanup else token)
        data = raw
        if body is not None:
            data = json.dumps(body).encode()
            headers['Content-Type'] = 'application/json'
        elif raw is not None:
            headers['Content-Type'] = mime or 'application/octet-stream'
        request = urllib.request.Request(self.api_url + path, data=data, headers=headers, method=method)
        try:
            with self._urlopen(request, timeout=15) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if path.startswith('/auth/') and error.code in (400, 401, 403, 404):
                raise StudyError('unauthenticated', 401) from None
            raise StudyError('provider_unavailable', 503) from None
        except (OSError, ValueError):
            raise StudyError('provider_unavailable', 503) from None

    def _urlopen(self, request, *, timeout):
        return urllib.request.urlopen(request, timeout=timeout)

    def verified_claims(self, token):
        if not isinstance(token, str) or not 1 <= len(token) <= 8192:
            raise StudyError('unauthenticated', 401)
        raw_user = self.request('GET', '/auth/v1/user', token=token)
        try:
            user = json.loads(raw_user)
            claims = json.loads(base64.urlsafe_b64decode(token.split('.')[1] + '=='))
            if str(uuid.UUID(claims['sub'])) != user['id']:
                raise ValueError()
            uuid.UUID(claims['session_id'])
            if claims.get('role') != 'authenticated':
                raise ValueError()
        except (ValueError, KeyError, TypeError, IndexError, UnicodeError):
            raise StudyError('unauthenticated', 401) from None
        return claims

    def open(self, token=''):
        claims = self.verified_claims(token) if token else {}
        store = PostgresStudyStore(self.database_url, self.data_directory,
            auth_user_id=claims.get('sub'), auth_session_id=claims.get('session_id'))
        store.blobs = SupabaseBlobs(self, token)
        return store

    def principal(self, store):
        row = store.connection.execute('SELECT ardesia_private.actor_id() AS id').fetchone()
        if not row or not row['id']:
            raise StudyError('unauthenticated', 401)
        actor = store.connection.execute('SELECT id,role FROM study_principals WHERE id=?', (row['id'],)).fetchone()
        if not actor:
            raise StudyError('unauthenticated', 401)
        return Principal(actor['id'], actor['role'])

    def exchange(self, token):
        store = self.open(token)
        try:
            return self.principal(store)
        finally:
            store.close()

    def sign_out(self, token, *, all_sessions=False, store=None):
        if store is None:self.exchange(token)
        else:self.principal(store)
        scope = 'global' if all_sessions else 'local'
        self.request('POST', '/auth/v1/logout?scope=' + scope, token=token)

    def catalog(self, store, edition_id):
        row = store.connection.execute('SELECT ardesia_private.catalog(?) AS course', (edition_id,)).fetchone()
        if not row or row['course'] is None:
            raise StudyError('not_found', 404)
        return row['course']


class SupabaseBlobs:
    is_local = False
    bucket = 'ardesia-originals'

    def __init__(self, runtime, token):
        self.runtime = runtime
        self.token = token

    def put(self, blob_id, data, mime):
        self.runtime.request('POST', '/storage/v1/object/' + self.bucket + '/' + blob_id,
            token=self.token, raw=data, mime=mime)

    def get(self, blob_id):
        return self.runtime.request('GET', '/storage/v1/object/authenticated/' + self.bucket + '/' + blob_id,
            token=self.token)

    def remove(self, blob_id):
        # Used only to compensate this backend's just-failed upload transaction.
        # Browser users have no delete or overwrite policy for immutable originals.
        self.runtime.request('DELETE', '/storage/v1/object/' + self.bucket,
            body={'prefixes': [blob_id]}, cleanup=True)
