"""Small, pinned editorial projections; no mathematical parser or quiz engine."""
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from components import icon, template, text

HERE = Path(__file__).parent


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def load_examples(courses, review=False, production=False, subject=None):
    if review and production:
        raise ValueError('draft_examples_are_preview_only')
    selection = json.loads((HERE / 'examples/selection.json').read_text())
    approvals = json.loads((HERE / 'examples/approvals.json').read_text())['approved']
    paths = {course['id']: course for course in courses}
    result = []
    seen = set()
    seen_paths = set()
    for entry in selection['examples']:
        record = entry['record']
        if (subject is not None and entry['subject'] != subject) or entry['id'] in seen or entry['pathId'] in seen_paths or entry['pathId'] not in paths or entry['unitIds'] != paths[entry['pathId']]['unitIds']:
            raise ValueError('example_identity_mismatch')
        seen.add(entry['id'])
        seen_paths.add(entry['pathId'])
        if entry['id'] != record['id'] or entry['source']['recordSHA256'] != digest(record) or record['provenance'] != 'original':
            raise ValueError('example_source_mismatch')
        if entry['status'] != record['status'] or entry['status'] not in ['DRAFT', 'APPROVED']:
            raise ValueError('example_editorial_status_mismatch')
        # Approval binds the exact source AND the teaching presentation, not just its ID.
        approved = any(a.get('id') == entry['id'] and a.get('contentSHA256') == digest(entry)
                       and a.get('scientificReviewer', '').strip() and a.get('editorialAuthorizer', '').strip()
                       and a.get('authorizationReference', '').strip() for a in approvals)
        if approved or review:
            result.append({**entry, 'approved': bool(approved), 'contentSHA256': digest(entry)})
    return result


def example_link(course, home='/'):
    return home + 'esempi/' + course['id'] + '/'


def render_example(entry, course, data, base, security):
    p = entry['presentation']
    back = base + '?percorso=' + quote(course['id']) + '#' + course['id']
    from build import contact_url
    page = json.loads((HERE / 'page.json').read_text())
    # Only this one source transcription uses mathematical typography; original JSON stays exact.
    prompt = p.get('promptText', entry['record']['prompt'])
    options = ''.join('<li>' + text(o.strip('$')) + '</li>' for o in entry['record']['options'])
    status = '' if entry['approved'] else '<p class="editorial-note">Anteprima editoriale · esempio DRAFT in revisione</p>'
    canonical = ('<link rel="canonical" href="' + text(example_link(course, base)) + '">') if entry['approved'] and security['production'] else '<meta name="robots" content="noindex, nofollow">'
    return template('example.html', teacher_name=text(page['teachers'][data['teacherId']]['name']), privacy_url=text(page['organization']['privacy']), legal_url=text(page['organization']['legal']), organization_name=text(page['organization']['name']), vat=text(page['organization']['vat']), email=text(data['contact']['email']), title=text(p['title']), course_title=text(course['title']), subject=text(data['subject']),
                    metadata=canonical, csp=text(security['meta']), base=text(base), back=text(back), status=status,
                    objective=text(p['objective']), prerequisites=text(p['prerequisites']), prompt=text(prompt), options=options,
                    hint=text(p['hint']), steps=''.join('<li>' + text(s) + '</li>' for s in p['steps']),
                    result=text(p['result']), check=text(p['check']), error=text(p['error']),
                    contact=text(contact_url(data, course)), external=icon('external'), chevron=icon('chevron'))
