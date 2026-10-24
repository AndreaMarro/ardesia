"""Unauthenticated, read-only remote preflight; never a launch authorization.

This client does not change the local API's synthetic/loopback boundary. The
operator must separately approve the exact HTTPS origin and retain the actual
authenticated journey receipts listed in OPERATOR_CHECKS.
"""
from dataclasses import dataclass
import http.client
import ipaddress
import json
import re
import socket
import ssl
from typing import Protocol, Sequence
from urllib.parse import urlsplit


MAX_BODY_BYTES = 65536
PATHS = ('/study/health', '/study/me', '/study/ops/health')
_SHA = re.compile(r'[0-9a-f]{40}', re.ASCII)
_LABEL = re.compile(r'[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?', re.ASCII)

# These are evidence requirements, not commands this read-only client executes.
OPERATOR_CHECKS = (
    ('human_release_gates', 'Record scientific, editorial, consent and release approvals for the exact artifact.'),
    ('two_user_login', 'Use two authorized test accounts in separate browsers; verify login, logout and fresh login.'),
    ('invitation_and_edition', 'Create and accept an authorized invitation; verify the intended edition and capacity persist.'),
    ('cross_user_isolation', 'Prove anonymous, peer and other-edition denial for private Core records and assets.'),
    ('private_media', 'Upload and replay authorized test media; compare original bytes and enforce private Storage access.'),
    ('session_revocation', 'Verify local and global logout, stale JWT and in-flight private media after revocation.'),
    ('studio_roundtrip', 'Record, annotate, share and replay on a fresh device; verify session, digest, object version and revoked pins.'),
    ('core_learning_journey', 'Retain canonical activity, submission, feedback and diary receipts for the same edition.'),
    ('persistence_and_restore', 'Verify restart, independent-device persistence and an isolated backup/restore drill.'),
    ('privacy_and_retention', 'Record authorized consent, retention, erasure and access ownership decisions without putting PII in evidence.'),
    ('independent_review', 'Review the exact source SHA, deployed artifact, Auth, Storage and RLS receipts independently.'),
)


class ProbeFailure(Exception):
    """Only constant, non-sensitive reason codes cross this boundary."""


def _public_unicast(address: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    # is_global alone includes multicast and some reserved IPv6 ranges.
    return (address.is_global and not address.is_multicast and not address.is_reserved
            and not address.is_unspecified and not address.is_loopback and not address.is_link_local)


@dataclass(frozen=True)
class ProbeTarget:
    origin: str
    host: str
    expected_commit: str

    @classmethod
    def parse(cls, value: object, allowed_origins: Sequence[str]) -> 'ProbeTarget':
        if not isinstance(value, dict) or set(value) != {'schema', 'origin', 'expectedCommit'}:
            raise ProbeFailure('target_manifest_invalid')
        if value['schema'] != 'ardesia.beta-readiness-target.v1':
            raise ProbeFailure('target_manifest_invalid')
        origin, commit = value['origin'], value['expectedCommit']
        if not isinstance(origin, str) or not isinstance(commit, str) or not _SHA.fullmatch(commit):
            raise ProbeFailure('target_manifest_invalid')
        try:
            parsed = urlsplit(origin)
            host = parsed.hostname or ''
            if (parsed.scheme != 'https' or parsed.username is not None or parsed.password is not None
                    or parsed.path or parsed.query or parsed.fragment or parsed.port not in (None, 443)):
                raise ValueError
            try:
                address = ipaddress.ip_address(host)
            except ValueError:
                if (len(host) > 253 or '.' not in host or host.endswith(('.localhost', '.local', '.internal'))
                        or not all(_LABEL.fullmatch(label) for label in host.split('.'))):
                    raise ValueError from None
                canonical_origin = 'https://' + host
            else:
                if not _public_unicast(address):
                    raise ValueError
                canonical_origin = 'https://' + (f'[{address.compressed}]' if address.version == 6 else str(address))
            if origin != canonical_origin:
                raise ValueError
        except (ValueError, UnicodeError):
            raise ProbeFailure('target_origin_invalid') from None
        if origin not in allowed_origins:
            raise ProbeFailure('target_origin_not_approved')
        return cls(origin, host, commit)


@dataclass(frozen=True)
class ProbeResponse:
    status: int
    content_type: str
    body: bytes


class Reader(Protocol):
    def get(self, path: str) -> ProbeResponse: ...


def public_addresses(host: str) -> tuple[str, ...]:
    """Reject the whole answer if even one DNS destination is non-public."""
    try:
        answers = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    except OSError:
        raise ProbeFailure('dns_unavailable') from None
    addresses = []
    for family, _, _, _, destination in answers:
        if family not in (socket.AF_INET, socket.AF_INET6):
            raise ProbeFailure('non_public_address')
        try:
            address = ipaddress.ip_address(destination[0])
        except ValueError:
            raise ProbeFailure('non_public_address') from None
        if not _public_unicast(address):
            raise ProbeFailure('non_public_address')
        if str(address) not in addresses:
            addresses.append(str(address))
    if not addresses:
        raise ProbeFailure('dns_unavailable')
    return tuple(addresses)


class _PinnedConnection(http.client.HTTPSConnection):
    def __init__(self, host: str, address: str, timeout: float):
        super().__init__(host, port=443, timeout=timeout, context=ssl.create_default_context())
        self._approved_address = address

    def connect(self):
        # Connect to the checked numeric address; preserve the original TLS SNI
        # and certificate hostname. No second hostname lookup or proxy applies.
        raw = socket.create_connection((self._approved_address, 443), self.timeout)
        try:
            self.sock = self._context.wrap_socket(raw, server_hostname=self.host)
        except BaseException:
            raw.close()
            raise


class PinnedHttpsReader:
    def __init__(self, target: ProbeTarget, *, timeout: float = 5.0):
        self._host = target.host
        self._address = public_addresses(target.host)[0]
        self._timeout = timeout

    def get(self, path: str) -> ProbeResponse:
        if path not in PATHS:
            raise ProbeFailure('path_not_allowed')
        connection = _PinnedConnection(self._host, self._address, self._timeout)
        try:
            connection.request('GET', path, headers={
                'Accept': 'application/json', 'User-Agent': 'ardesia-readonly-beta-probe/1',
            })
            response = connection.getresponse()
            # Redirects are a failure, never another destination to follow.
            if 300 <= response.status < 400:
                raise ProbeFailure('redirect_rejected')
            body = response.read(MAX_BODY_BYTES + 1)
            if len(body) > MAX_BODY_BYTES:
                raise ProbeFailure('response_too_large')
            return ProbeResponse(response.status, response.getheader('Content-Type', ''), body)
        except ProbeFailure:
            raise
        except (OSError, http.client.HTTPException):
            raise ProbeFailure('https_unavailable') from None
        finally:
            connection.close()


def _json_object(response: ProbeResponse) -> dict:
    if len(response.body) > MAX_BODY_BYTES:
        raise ProbeFailure('response_too_large')
    if response.content_type.partition(';')[0].strip().lower() != 'application/json':
        raise ProbeFailure('response_not_json')

    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError
            result[key] = value
        return result

    def invalid_constant(_):
        raise ValueError

    try:
        value = json.loads(response.body.decode('utf-8'), object_pairs_hook=pairs,
                           parse_constant=invalid_constant)
        if not isinstance(value, dict):
            raise ValueError
        return value
    except (ValueError, UnicodeError, RecursionError):
        raise ProbeFailure('response_json_invalid') from None


def _check(name: str, status: str, reason: str, *, stage: str = 'preflight') -> dict:
    return {'id': name, 'stage': stage, 'status': status, 'reason': reason}


def run_probe(manifest: object, allowed_origins: Sequence[str], *, reader: Reader | None = None) -> dict:
    """Return sanitized evidence. A passing preflight still cannot authorize launch."""
    checks = []
    target = None
    try:
        target = ProbeTarget.parse(manifest, allowed_origins)
    except ProbeFailure as error:
        checks.append(_check('approved_target', 'FAIL', str(error)))
    else:
        checks.append(_check('approved_target', 'PASS', 'exact_https_origin_approved'))
    pending = ('real_runtime', 'deployed_commit', 'anonymous_identity_denied', 'anonymous_operations_denied')
    if target is None:
        checks.extend(_check(name, 'NOT_RUN', 'approved_target_required') for name in pending)
    else:
        try:
            active_reader = reader if reader is not None else PinnedHttpsReader(target)
        except ProbeFailure as error:
            checks.extend(_check(name, 'FAIL', str(error)) for name in pending)
        else:
            try:
                response = active_reader.get('/study/health')
                health = _json_object(response)
                real = (response.status == 200 and health.get('ok') is True and health.get('synthetic') is False
                        and health.get('authentication') == 'supabase' and health.get('persistence') == 'postgres')
                checks.append(_check('real_runtime', 'PASS' if real else 'FAIL',
                                     'real_runtime_attested' if real else 'synthetic_or_unsupported_runtime'))
                commit = health.get('buildCommitSha')
                matched = isinstance(commit, str) and _SHA.fullmatch(commit) and commit == target.expected_commit
                checks.append(_check('deployed_commit', 'PASS' if matched else 'FAIL',
                                     'expected_commit_attested' if matched else 'deployed_commit_missing_or_mismatch'))
            except (ProbeFailure, OSError, ValueError, TypeError):
                # Never copy remote JSON, exception strings or headers to evidence.
                checks.extend(_check(name, 'FAIL', 'health_unavailable_or_invalid') for name in pending[:2])
            for path, name in zip(PATHS[1:], pending[2:]):
                try:
                    response = active_reader.get(path)
                    payload = _json_object(response)
                    denied = response.status in (401, 403) and isinstance(payload.get('error'), str)
                    checks.append(_check(name, 'PASS' if denied else 'FAIL',
                                         'anonymous_request_denied' if denied else 'anonymous_denial_not_proven'))
                except (ProbeFailure, OSError, ValueError, TypeError):
                    checks.append(_check(name, 'FAIL', 'anonymous_denial_not_proven'))
    preflight_passed = all(item['status'] == 'PASS' for item in checks)
    checks.extend(_check(name, 'NOT_RUN', requirement, stage='operator') for name, requirement in OPERATOR_CHECKS)
    return {
        'schema': 'ardesia.beta-readiness-probe.v1', 'status': 'BLOCKED',
        'target': {'origin': target.origin, 'expectedCommit': target.expected_commit} if target else None,
        'readOnlyPreflightPassed': preflight_passed, 'betaReady': False, 'launchAllowed': False,
        'scope': 'Unauthenticated GET only; no login, data writes, media transfer or release approval.',
        'checks': checks,
    }
