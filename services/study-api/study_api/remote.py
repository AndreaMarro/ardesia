"""Explicit, synthetic acceptance deployment of the existing Study Core.

This is not a production-consent profile. Configuration is server-only; requests
cannot choose the project, database, actor or release identity.
"""
import json
import ipaddress
import os
from pathlib import Path
import re
import urllib.parse
import urllib.request

from starlette.datastructures import Headers

from lessonos.study.models import StudyError
from .runtime import SupabaseRuntime

PROJECT_REF = 'gavfmrynhsdxdqbmdkxq'
MODE = 'SYNTHETIC_ACCEPTANCE'


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        # Auth, apikey and passwords must never follow a provider redirect.
        return None


def _origins(value):
    if not isinstance(value, str) or not value:
        raise ValueError('remote_origins_required')
    result = []
    for origin in value.split(','):
        parsed = urllib.parse.urlsplit(origin)
        if (parsed.scheme != 'https' or not parsed.hostname or parsed.username
                or parsed.password or parsed.path or parsed.query or parsed.fragment
                or parsed.port not in (None, 443)
                or not re.fullmatch(r'[a-z0-9]+(?:[.-][a-z0-9]+)+', parsed.hostname)
                or origin != 'https://' + parsed.netloc.lower()
                or parsed.hostname in ('localhost', 'testserver')
                or parsed.hostname.endswith('.localhost')):
            raise ValueError('remote_https_origins_required')
        try:
            ipaddress.ip_address(parsed.hostname)
        except ValueError:
            pass
        else:
            raise ValueError('remote_https_origins_required')
        result.append(origin)
    return frozenset(result)


def _database_url(value):
    try:
        database = urllib.parse.urlsplit(value)
        query = urllib.parse.parse_qs(database.query, strict_parsing=True)
        direct = database.hostname == f'db.{PROJECT_REF}.supabase.co'
        username = urllib.parse.unquote(database.username or '')
        pooler = (database.hostname == 'aws-1-eu-central-1.pooler.supabase.com'
                  and username == 'ardesia_runtime.' + PROJECT_REF)
        direct = direct and username == 'ardesia_runtime'
        if (database.scheme not in ('postgresql', 'postgres') or not (direct or pooler)
                or not database.username or not database.password or not database.path.strip('/')
                or database.fragment or database.port not in (None, 5432)
                or query.get('sslmode') not in (['require'], ['verify-ca'], ['verify-full'])
                or not set(query) <= {'sslmode', 'sslrootcert', 'connect_timeout'}):
            raise ValueError()
    except (ValueError, TypeError, AttributeError):
        raise ValueError('remote_tls_postgresql_required') from None
    # This adapter sets request identity and role on the connection. It needs
    # direct/session pooling (5432), never transaction pooling (6543).
    if 'connect_timeout' not in query:
        value += '&connect_timeout=10'
    return value


class RemoteSupabaseRuntime(SupabaseRuntime):
    controlled_remote = True
    mode = MODE

    def __init__(self, configuration, data_directory):
        if configuration.get('MODE') != MODE:
            raise ValueError('remote_synthetic_acceptance_required')
        if configuration.get('API_URL') != f'https://{PROJECT_REF}.supabase.co':
            raise ValueError('remote_pinned_project_required')
        release_sha = configuration.get('RELEASE_SHA', '')
        if not isinstance(release_sha, str) or not re.fullmatch('[0-9a-f]{40}', release_sha):
            raise ValueError('remote_release_sha_required')
        self.api_url = configuration['API_URL']
        self.database_url = _database_url(configuration.get('DB_URL'))
        self.origins = _origins(configuration.get('APP_ORIGINS'))
        self.hosts = frozenset(urllib.parse.urlsplit(origin).netloc for origin in self.origins)
        self.release_sha = release_sha
        self.public_key = configuration.get('ANON_KEY', '')
        if not isinstance(self.public_key, str) or not self.public_key.strip():
            raise ValueError('remote_public_key_required')
        self._service_key = configuration.get('SERVICE_ROLE_KEY') or None
        self.data_directory = Path(data_directory)
        self._opener = urllib.request.build_opener(_NoRedirect())

    def open(self, token=''):
        store = super().open(token)
        # Trusted server configuration only: browser bodies/claims cannot opt
        # an ordinary runtime into synthetic draft lesson acceptance.
        store.synthetic_acceptance = self.mode == MODE
        return store

    def boundary_error(self, scope):
        headers = Headers(scope=scope)
        hosts = headers.getlist('host')
        if scope.get('scheme') != 'https' or len(hosts) != 1 or hosts[0] not in self.hosts:
            return 'remote_host_denied'
        origins = headers.getlist('origin')
        if len(origins) > 1 or (origins and origins[0] not in self.origins):
            return 'origin_denied'
        if scope['method'] not in ('GET', 'HEAD', 'OPTIONS') and not origins:
            return 'origin_denied'
        return None

    def _urlopen(self, request, *, timeout):
        return self._opener.open(request, timeout=timeout)

    def request(self, method, path, **kwargs):
        if kwargs.get('cleanup') and not self._service_key:
            raise StudyError('media_compensation_unavailable', 503)
        return super().request(method, path, **kwargs)

    def password_token(self, email, password):
        raw = self.request('POST', '/auth/v1/token?grant_type=password',
                           body={'email': email, 'password': password})
        try:
            token = json.loads(raw)['access_token']
            if not isinstance(token, str) or not 1 <= len(token) <= 8192:
                raise ValueError()
        except (ValueError, KeyError, TypeError, UnicodeError):
            raise StudyError('provider_unavailable', 503) from None
        # The caller opens this token through the shared Auth GET user and
        # auth.sessions/RLS chain; a password response alone is not identity.
        return token


def create_remote_app(configuration, data_directory, **options):
    """Reuse create_app, its admission and every existing Core route/store."""
    from .app import create_app
    runtime = RemoteSupabaseRuntime(configuration, data_directory)
    options.setdefault('frontend_spa', True)
    return create_app(Path(data_directory) / 'postgres.lock', demo=True,
                      secure_cookies=True, runtime=runtime, **options)


def app_from_env():
    """Uvicorn --factory entry; keep secrets in the service environment only."""
    configuration = {key: os.environ.get('ARDESIA_' + key, '') for key in (
        'MODE', 'API_URL', 'DB_URL', 'ANON_KEY', 'SERVICE_ROLE_KEY',
        'APP_ORIGINS', 'RELEASE_SHA')}
    data_directory = os.environ.get('ARDESIA_DATA_DIR')
    if not data_directory:
        raise ValueError('remote_data_directory_required')
    os.umask(0o077)
    frontend = Path(__file__).resolve().parents[1] / '_frontend'
    if frontend.exists() and not (frontend / 'index.html').is_file():
        raise ValueError('remote_frontend_index_required')
    studio = Path(__file__).resolve().parents[1] / '_studio'
    if studio.exists() and not (studio / 'index.html').is_file():
        raise ValueError('remote_studio_index_required')
    return create_remote_app(configuration, data_directory,
                             frontend=frontend if frontend.exists() else None,
                             studio_frontend=studio if studio.exists() else None)
