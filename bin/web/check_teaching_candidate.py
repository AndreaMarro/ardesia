#!/usr/bin/env python3
"""Verify the exact local artifact and prepare a human release-review sheet.

Read-only on the candidate. A technical PASS does not record human approval,
authorize hosting, or make the private beta ready. Reports go outside the artifact.
"""
import argparse
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path, PurePosixPath
import re
import sys
from urllib.parse import unquote, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))
from teaching_policy import exported_headers

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('candidate_secret_tripwire', ROOT / 'bin/ci/secret_scan.py')
secret_scan = importlib.util.module_from_spec(spec)
spec.loader.exec_module(secret_scan)


def sha(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def safe_name(name: str) -> bool:
    parts = unquote(name).split('/')
    return bool(name) and not name.startswith('/') and '\\' not in name and ':' not in name and all(p not in ('', '.', '..') for p in parts)


class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in ('script', 'img', 'audio', 'source', 'iframe') and values.get('src'):
            self.references.append(values['src'])
        if tag == 'link' and values.get('rel') in ('stylesheet', 'icon', 'modulepreload', 'preload') and values.get('href'):
            self.references.append(values['href'])


def check(candidate: Path) -> dict:
    candidate = candidate.resolve()
    errors = []
    for name in ('candidate-manifest.json', 'source-manifest.json'):
        if (candidate / name).is_symlink():
            raise ValueError('linked_metadata')
    manifest_bytes = (candidate / 'candidate-manifest.json').read_bytes()
    manifest = json.loads(manifest_bytes)
    source_bytes = (candidate / 'source-manifest.json').read_bytes()
    source = json.loads(source_bytes)
    if not isinstance(manifest, dict) or not isinstance(source, dict):
        raise ValueError('invalid_manifest')
    assets = manifest['assetsSha256']
    if not isinstance(assets, dict) or not isinstance(source.get('files'), dict) or not isinstance(manifest.get('source'), dict):
        raise ValueError('invalid_inventory')
    for inventory in (assets, source['files']):
        if any(not isinstance(name, str) or not isinstance(digest, str) or not re.fullmatch('[0-9a-f]{64}', digest) for name, digest in inventory.items()):
            raise ValueError('invalid_inventory_record')
    for key in ('public/index.html', 'public/esperienza/index.html', 'public/_headers', 'public/robots.txt', 'public/source-manifest.json'):
        if key not in assets:
            errors.append(f'missing_public_entry:{key}')
    actual = set()
    verified_metadata = {}
    for path in candidate.rglob('*'):
        name = path.relative_to(candidate).as_posix()
        if path.is_symlink():
            errors.append(f'linked_asset:{name}')
        elif path.is_file() and name not in ('candidate-manifest.json', 'source-manifest.json'):
            actual.add(name)
    if actual != set(assets):
        errors.append('asset_inventory_mismatch')
    for name, digest in assets.items():
        if not safe_name(name) or not name.startswith(('public/', 'beta/web/', 'beta/studio/')):
            errors.append('unsafe_asset_path')
            continue
        path = candidate / name
        if not path.resolve().is_relative_to(candidate) or any(parent.is_symlink() for parent in (path, *path.parents) if parent != candidate and parent.is_relative_to(candidate)):
            errors.append(f'linked_asset:{name}')
            continue
        if not path.is_file() or sha(path.read_bytes()) != digest:
            errors.append(f'asset_digest_mismatch:{name}')
            continue
        if name.startswith(('public/studio/', 'public/beta/', 'public/study/')):
            errors.append(f'private_route_in_public:{name}')
        if any(part.startswith('.') or part == 'demo-access.json' for part in PurePosixPath(name).parts) or path.suffix.lower() in ('.db', '.sqlite', '.sqlite3', '.db3', '.pem', '.key', '.lesson'):
            errors.append(f'private_file:{name}')
        data = path.read_bytes()
        if data.startswith(b'SQLite format 3\x00'):
            errors.append(f'database_bytes:{name}')
        if path.suffix.lower() in secret_scan.TEXT_EXTENSIONS:
            # Reuse the repository's high-confidence tripwire; never print values.
            for label, pattern in secret_scan.PATTERNS:
                if pattern.search(data):
                    errors.append(f'credential_pattern:{name}:{label}')
        if name in ('public/_headers', 'public/robots.txt', 'public/source-manifest.json') and not any(pattern.search(data) for _, pattern in secret_scan.PATTERNS):
            verified_metadata[name] = data
        if name.startswith('public/') and path.suffix == '.html':
            parser = Resources()
            parser.feed(data.decode('utf-8'))
            for ref in parser.references:
                parsed = urlsplit(ref)
                if parsed.scheme == 'data' and ref.startswith('data:image/'):
                    continue
                if parsed.scheme or parsed.netloc:
                    errors.append(f'external_resource:{name}')
                    continue
                relative = unquote(parsed.path)
                target = (candidate / 'public' / relative.lstrip('/')) if relative.startswith('/') else path.parent / relative
                resolved = target.resolve()
                if not resolved.is_relative_to(candidate / 'public') or not resolved.is_file():
                    errors.append(f'missing_resource:{name}:{relative}')
    scoped_source = manifest.get('source', {})
    combined = ''.join(f'{name}\0{digest}\n' for name, digest in sorted(source['files'].items())).encode()
    if sha(combined) != source['sha256'] or source['sha256'] != scoped_source.get('sourceTreeSha256') or len(source['files']) != scoped_source.get('sourceFileCount'):
        errors.append('source_inventory_mismatch')
    if not re.fullmatch(r'[0-9a-f]{40}', scoped_source.get('commit', '')):
        errors.append('source_commit_required')
    if scoped_source.get('trackedDiffSha256') != sha(b''):
        errors.append('committed_product_required')
    private = any(name.startswith('beta/') for name in assets)
    if private != (manifest.get('privateBeta') is True) or manifest.get('privateDataIncluded') is not False:
        errors.append('private_manifest_mismatch')
    if private and not all(name in assets for name in ('beta/web/index.html', 'beta/studio/index.html')):
        errors.append('private_surfaces_must_be_paired')
    drafts = []
    # Never reopen an asset already rejected above, including metadata through
    # symlinks. Never echo arbitrary content (such as privateNote) in reports.
    if 'public/_headers' in verified_metadata and verified_metadata['public/_headers'].decode() != exported_headers():
        errors.append('composed_host_policy_mismatch')
    if 'public/robots.txt' in verified_metadata and 'Disallow: /' not in verified_metadata['public/robots.txt'].decode():
        errors.append('preview_must_remain_noindex')
    if 'public/source-manifest.json' in verified_metadata:
        marketing = json.loads(verified_metadata['public/source-manifest.json'])
        if not isinstance(marketing, dict) or not isinstance(marketing.get('examples'), list):
            raise ValueError('invalid_editorial_metadata')
        for entry in marketing['examples']:
            if not isinstance(entry, dict) or entry.get('editorialStatus') not in ('DRAFT', 'APPROVED'):
                raise ValueError('invalid_editorial_metadata')
            if entry['editorialStatus'] == 'DRAFT':
                identity, digest = entry.get('id'), entry.get('contentSHA256')
                if (not isinstance(identity, str) or not re.fullmatch('[a-zA-Z0-9_-]{1,80}', identity)
                        or any(pattern.search(identity.encode()) for _, pattern in secret_scan.PATTERNS)
                        or not isinstance(digest, str) or not re.fullmatch('[0-9a-f]{64}', digest)):
                    raise ValueError('invalid_editorial_identity')
                drafts.append({'id': identity, 'contentSHA256': digest})
    return {
        'schemaVersion': 1, 'technicalStatus': 'FAIL' if errors else 'PASS',
        'releaseStatus': 'BLOCKED', 'errors': sorted(set(errors)),
        'binding': {'candidateManifestSha256': sha(manifest_bytes), 'sourceManifestSha256': sha(source_bytes),
                    'sourceCommit': scoped_source.get('commit') if re.fullmatch('[0-9a-f]{40}', str(scoped_source.get('commit'))) else None,
                    'sourceTreeSha256': source['sha256'] if re.fullmatch('[0-9a-f]{64}', str(source['sha256'])) else None,
                    'assetCount': len(assets)},
        'humanReview': {'status': 'PENDING', 'scientificReviewer': None, 'editorialAuthorizer': None,
                       'decisionReference': None, 'approvedAt': None,
                       'draftExamples': drafts,
                       'existingApprovalRegistry': 'apps/marketing-01/examples/approvals.json'},
        'releaseGates': ['exact_scientific_and_editorial_human_review',
                         'draft_examples_exact_digest_approval_or_exclusion',
                         'explicit_target_and_publication_authorization',
                         'verify_real_https_headers_bytes_routes_cta_and_rollback_after_authorized_deploy'],
        'privateBeta': 'NOT_CERTIFIED_REMOTE',
        'limits': ['Local hashes establish consistency, not authorship or approval.',
                   'High-confidence credential patterns do not prove the absence of every possible secret or personal datum.',
                   'Exported host rules are configuration, not evidence that a hosting provider applied them.'],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    if args.report.resolve().is_relative_to(args.candidate.resolve()):
        parser.error('report_must_be_outside_candidate')
    try:
        result = check(args.candidate)
    except (ValueError, KeyError, OSError) as error:
        # Omit raw data, paths supplied by content, and credentials from diagnostics.
        result = {'schemaVersion': 1, 'technicalStatus': 'FAIL', 'releaseStatus': 'BLOCKED',
                  'errors': ['invalid_candidate:' + type(error).__name__]}
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f"Technical {result['technicalStatus']}; release BLOCKED; report: {args.report}")
    return 0 if result['technicalStatus'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(main())
