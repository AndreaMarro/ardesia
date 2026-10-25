"""Offline oracle for the retained REA run, or a fresh raw evidence directory.

The default verifies the ZIP and every entry against archive-manifest.json,
then reads original evidence without rewriting it. Source identity is obtained
from the pinned Git object, unless --source-file explicitly supplies a source.
"""
import argparse
import hashlib
import json
import pathlib
import subprocess
import zipfile
from html.parser import HTMLParser
from urllib.parse import parse_qs, urlsplit

HERE = pathlib.Path(__file__).resolve().parent


def find_repo():
    for candidate in HERE.parents:
        if (candidate / 'apps/marketing-01/build.py').is_file():
            return candidate
    raise RuntimeError('Repository not found; provide --repo')


class DocumentFacts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.open_details = set()
        self.media = []
        self.answer_controls = []

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag == 'details' and 'open' in attributes:
            self.open_details.update(attributes.get('class', '').split())
        if tag in ('audio', 'video'):
            self.media.append(tag)
        if tag in ('input', 'textarea', 'select', 'button'):
            self.answer_controls.append(tag)


def facts(step):
    document = DocumentFacts()
    document.feed(step['artifacts']['dom']['value']['text'])
    return document


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=pathlib.Path)
    parser.add_argument('--archive', type=pathlib.Path, default=HERE / 'rea-original-evidence.zip')
    parser.add_argument('--archive-manifest', type=pathlib.Path, default=HERE / 'archive-manifest.json')
    parser.add_argument('--raw-dir', type=pathlib.Path, help='Fresh runner output; skips archived-run identity checks')
    parser.add_argument('--source-file', type=pathlib.Path, help='Explicit source bytes instead of the pinned Git object')
    parser.add_argument('--target-commit', help='Override target identity for a fresh run only')
    parser.add_argument('--output', type=pathlib.Path, help='Write a NEW verification result; default prints JSON')
    args = parser.parse_args()
    repo = args.repo.resolve() if args.repo else find_repo()
    integrity = None
    archive = None
    if args.raw_dir:
        def read(name):
            return (args.raw_dir / name).read_bytes()
        context = json.loads(read('marketing-experiment-context.json'))
        target_commit = args.target_commit or context['target_commit']
        artifact_relative = context['artifact_js_relative']
    else:
        manifest = json.loads(args.archive_manifest.read_text())
        archive_bytes = args.archive.read_bytes()
        actual_hash = hashlib.sha256(archive_bytes).hexdigest()
        if actual_hash != manifest['sha256'] or len(archive_bytes) != manifest['bytes']:
            raise ValueError('Raw archive hash or size mismatch')
        archive = zipfile.ZipFile(args.archive)
        expected_names = {entry['path'] for entry in manifest['entries']}
        if set(archive.namelist()) != expected_names:
            raise ValueError('Raw archive entry set mismatch')
        for entry in manifest['entries']:
            data = archive.read(entry['path'])
            if len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
                raise ValueError('Archived entry identity mismatch: ' + entry['path'])
        def read(name):
            return archive.read('original/' + name)
        original_result = json.loads(read('marketing-experiment-verification.json'))
        target_commit = original_result['target_commit']
        if args.target_commit and args.target_commit != target_commit:
            raise ValueError('Cannot change the target identity of retained original evidence')
        candidates = [name.removeprefix('original/') for name in archive.namelist()
                      if name.startswith('original/marketing-artifact/assets/site.') and name.endswith('.js')]
        if len(candidates) != 1:
            raise ValueError('Expected exactly one archived emitted script')
        artifact_relative = candidates[0]
        integrity = {'archive_sha256': actual_hash, 'entries_verified': len(expected_names)}

    try:
        evidence = json.loads(read('marketing-runtime-evidence.json'))
        static = json.loads(read('marketing-static-evidence.json'))
        result = evidence['normalized_result']
        by_id = {step['step_id']: step for step in result['steps']}
        assertions = []

        def check(label, condition):
            assertions.append({'criterion': label, 'pass': bool(condition)})
            if not condition:
                raise AssertionError(label)

        check('all eight declared actions completed', all(s['status'] == 'completed' for s in result['steps']) and len(result['steps']) == 9)
        check('complete capture in its declared scope', result['completeness']['status'] == 'complete')
        check('owned browser terminated', result['browser']['cleanup'] == 'terminated-owned-process')
        check('hint does not open the worked solution', facts(by_id['open-hint']).open_details == {'example-hint'})
        check('worked solution remains distinct from the error check', facts(by_id['open-reasoning']).open_details == {'example-hint', 'example-reasoning'})
        check('error explanation becomes visible on request', 'example-check' in facts(by_id['open-error-explanation']).open_details)
        destination = urlsplit(by_id['return-to-course']['after_url']['url'])
        check('return retains the canonical course id in URL and anchor', parse_qs(destination.query).get('percorso') == ['fluidi-termodinamica'] and destination.fragment == 'fluidi-termodinamica')
        check('course selection is actually restored in the DOM', by_id['selected-course-ready']['status'] == 'completed')
        requests = [event for event in result['events']['items'] if event['kind'] == 'request']
        expected_origin = by_id['ready']['after_url']['origin']
        check('all captured requests stayed on the local origin', all(event['url']['origin'] == expected_origin for event in requests))
        check('no captured page error', not any(event['kind'] == 'page-error' for event in result['events']['items']))
        check('preview is visibly an editorial draft', 'DRAFT' in by_id['open-original-example']['artifacts']['accessibility']['value']['text'])

        if args.source_file:
            source_bytes = args.source_file.read_bytes()
            source_identity = {'kind': 'explicit-source-file', 'path': str(args.source_file)}
        else:
            git_object = target_commit + ':apps/marketing-01/assets/site.js'
            source_bytes = subprocess.run(['git', '-C', str(repo), 'show', git_object], check=True, stdout=subprocess.PIPE).stdout
            source_identity = {'kind': 'pinned-git-object', 'object': git_object}
        check('emitted script equals the canonical source byte-for-byte', read(artifact_relative) == source_bytes)
        example_facts = facts(by_id['open-original-example'])
        conclusion = {
            'schema': 'ardesia.research.marketing-context-observation.portable-verification.v1',
            'target_commit': target_commit,
            'runtime_evidence_id': evidence['evidence_id'],
            'static_evidence_id': static['evidence_id'],
            'artifact_sha256': static['normalized_result']['root_artifact_sha256'],
            'source_js_sha256': hashlib.sha256(source_bytes).hexdigest(),
            'source_identity': source_identity,
            'archive_integrity': integrity,
            'assertions': assertions,
            'observed_scope_limits': {
                'audio_or_video_elements_in_example': example_facts.media,
                'answer_submission_controls_in_example': example_facts.answer_controls,
                'storage_at_end': by_id['selected-course-ready']['artifacts']['storage']['value'],
                'captured_request_methods': sorted({event['method'] for event in requests}),
                'graded_attempts_or_student_trace_verified': False,
                'lesson_audio_alignment_verified': False,
                'production_access_verified': False,
            },
            'interpretation': 'Offline re-verification of retained evidence; not a new browser run.',
        }
        if not args.raw_dir:
            for key in ['target_commit', 'runtime_evidence_id', 'static_evidence_id', 'artifact_sha256', 'source_js_sha256', 'assertions', 'observed_scope_limits']:
                if conclusion[key] != original_result[key]:
                    raise ValueError('Portable verifier disagrees with original result: ' + key)
        encoded = json.dumps(conclusion, ensure_ascii=False, indent=2) + '\n'
        if args.output:
            if args.output.exists():
                raise FileExistsError('Refusing to overwrite existing evidence: ' + str(args.output))
            args.output.write_text(encoded)
        print(json.dumps({'passed': len(assertions), 'runtime_evidence_id': evidence['evidence_id'], 'archive_integrity': integrity, 'output': str(args.output) if args.output else None}))
        if not args.output:
            print(encoded)
    finally:
        if archive:
            archive.close()


if __name__ == '__main__':
    main()
