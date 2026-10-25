#!/usr/bin/env python3
"""Dependency-free static build: canonical composition + versioned editorial data."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
from examples import load_examples, render_example, example_link
from urllib.parse import quote, urlsplit

from components import (choice, course_card, external_link, faq, icon, path_link,
                        review, template, text)

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def secure_url(value):
    parsed = urlsplit(value)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError('explicit_https_reference_required')
    return value


def load_catalog(path=HERE / 'catalog.json'):
    data = json.loads(Path(path).read_text())
    ref = (ROOT / data['composition']).resolve()
    if not ref.is_relative_to(ROOT):
        raise ValueError('composition_outside_repository')
    composition = json.loads(ref.read_text())
    canonical = json.dumps(composition, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)
    reference = data['reference']
    secure_url(reference['url'])
    if not reference['label'].strip():
        raise ValueError('explicit_programme_reference_required')
    paths = composition['paths']
    ids = [p['id'] for p in paths]
    if not ids or len(ids) != len(set(ids)) or set(ids) != set(data['courses']):
        raise ValueError('editorial_copy_must_match_canonical_paths')
    if not re.fullmatch(r'[1-9][0-9]{6,14}', data['contact']['whatsapp']):
        raise ValueError('invalid_contact')
    courses = []
    for path in paths:
        if not re.fullmatch(r'[a-z][a-z0-9-]*', path['id']) or not path['title'].strip() or not path['unitIds']:
            raise ValueError('invalid_course_reference')
        editorial = data['courses'][path['id']]
        for field in ['intro', 'fit', 'topics', 'outcomes']:
            if not editorial.get(field):
                raise ValueError(f'missing_course_{field}')
        courses.append({**editorial, **path})
    return data, courses, {'id': composition['id'], 'version': composition['version'],
                         'sha256': hashlib.sha256(canonical.encode()).hexdigest(), 'bankRef': composition['bankRef']}


def contact_url(data, course):
    message = (f"Ciao Andrea, vorrei conoscere la disponibilità del microcorso Ardesia di {data['subject']} "
               f"«{course['title']}» per {data['examLabel']} {data['academicYear']}. "
               "Mi puoi dare informazioni sui gruppi e sulle modalità? È una richiesta non vincolante.")
    return f"https://wa.me/{data['contact']['whatsapp']}?text={quote(message, safe='')}"


def render(data, courses, identity, site_url=None, preview_url=None, examples=(), interactive_preview=False):
    page = json.loads((HERE / 'page.json').read_text())
    teacher = page['teachers'][data['teacherId']]
    organization = page['organization']
    count_word = {1: 'Un', 2: 'Due', 3: 'Tre', 4: 'Quattro'}.get(len(courses), str(len(courses)))
    context = {**data, 'countWord': count_word, 'count': len(courses)}
    for link in teacher['links'] + teacher['reviews']:
        secure_url(link['url'])
    for key in ['privacy', 'legal', 'reviews']:
        secure_url(organization[key])
    description = f"{count_word} microcorsi di {data['subject']} per {data['examLabel']} {data['academicYear']}. Teoria, esercizi spiegati e nuovi gruppi in formazione. Chiedi disponibilità."
    metadata = '<meta name="robots" content="noindex, nofollow">'
    og_image = ''
    if site_url:
        metadata = f'<link rel="canonical" href="{text(site_url)}"><meta property="og:url" content="{text(site_url)}">'
    if data.get('social'):
        social = data['social']
        og_image = f'<meta property="og:image" content="{text(site_url or preview_url or "./")}assets/{text(social["image"])}">'
        og_image += f'<meta property="og:image:alt" content="Ardesia — Microcorsi di {text(data["subject"])}"><meta property="og:image:width" content="{int(social["width"])}"><meta property="og:image:height" content="{int(social["height"])}">'
    contacts = [(course, contact_url(data, course)) for course in courses]
    security = json.loads((HERE / 'security.json').read_text())
    return template('page.html', subject=text(data['subject']), academic_year=text(data['academicYear']),
                    description=text(description), metadata=metadata, og_image=og_image,
                    meta_csp=text(security['Content-Security-Policy'].replace("; frame-ancestors 'none'", '')),
                    experience_preview=template('experience.html', arrow=icon('arrow')) if interactive_preview else '',
                    interactive_action='<a class="experience-hero-link" href="#dentro-la-lezione">Entra in una lezione '+icon('arrow')+'</a>' if interactive_preview else '',
                    hero_title=text(page['hero']['title'].format_map(context)),
                    hero_lead=text(page['hero']['lead'].format_map(context)), availability=text(data['availability']),
                    teacher_name=text(teacher['name']), teacher_first=text(teacher['name'].split()[0]),
                    teacher_image=text(teacher['image']), teacher_role=text(teacher['role']), teacher_bio=text(teacher['bio']),
                    teacher_links=''.join(external_link(link) for link in teacher['links']),
                    reviews=''.join(review(value) for value in teacher['reviews']), reviews_url=text(organization['reviews']),
                    path_index=''.join(path_link(course, i) for i, course in enumerate(courses, 1)),
                    course_cards=''.join(course_card(course, i, url, example_link(course, site_url or '/') if any(e['pathId'] == course['id'] for e in examples) else None, '/esperienza/?percorso=' + course['id'] if interactive_preview and course['id'] in ('fluidi-termodinamica', 'strumenti-meccanica') else None) for i, (course, url) in enumerate(contacts, 1)),
                    audience=text(data['audience']), count_word=count_word, reference_url=text(data['reference']['url']),
                    reference_label=text(data['reference']['label']),
                    method_title=text(page['method']['title']), method_intro=text(page['method']['intro']),
                    method_steps=''.join(f'<li><span class="step-number">{i:02}</span><div><h3>{text(step["title"])}</h3><p>{text(step["body"])}</p></div></li>' for i, step in enumerate(page['method']['steps'], 1)),
                    faq=''.join(faq(value, context, organization['privacy']) for value in page['faq']),
                    choices=''.join(choice(course, i, url) for i, (course, url) in enumerate(contacts, 1)),
                    fallback_contacts=''.join(f'<li>{external_link({"url": url, "label": course["title"]})}</li>' for course, url in contacts),
                    initial_contact=text(contacts[0][1]), initial_title=text(courses[0]['title']),
                    email=text(data['contact']['email']), whatsapp=text(data['contact']['whatsapp']), phone_display=text(data['contact']['display']),
                    organization_name=text(organization['name']), vat=text(organization['vat']), copyright_year=text(organization['copyrightYear']),
                    privacy_url=text(organization['privacy']), legal_url=text(organization['legal']),
                    arrow=icon('arrow'), external=icon('external'))


def build(output=HERE / 'dist', site_url=None, catalog=HERE / 'catalog.json', preview_url=None, review_examples=False, interactive_preview=False):
    if interactive_preview and (site_url or Path(catalog).resolve() != (HERE / 'catalog.json').resolve()):
        raise ValueError('interactive_demo_preview_only')
    if site_url:
        parsed = urlsplit(site_url)
        if parsed.scheme != 'https' or not parsed.netloc or parsed.query or parsed.fragment or parsed.username or parsed.password:
            raise ValueError('site_url_must_be_final_https_address')
        site_url = site_url.rstrip('/') + '/'
    if preview_url:
        secure_url(preview_url)
        parsed_preview = urlsplit(preview_url)
        if site_url or parsed_preview.query or parsed_preview.fragment:
            raise ValueError('preview_and_production_addresses_must_be_distinct')
        preview_url = preview_url.rstrip('/') + '/'
    data, courses, identity = load_catalog(catalog)
    # A second subject has no implicit physics examples.
    examples = load_examples(courses, review_examples, bool(site_url), data['subject']) if Path(catalog).resolve() == (HERE / 'catalog.json').resolve() else []
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    assets = output / 'assets'
    assets.mkdir(exist_ok=True)
    # Only generated assets from the previous build are removed, never source files.
    for old in assets.iterdir():
        if old.is_file():
            old.unlink()
    asset_map = {}
    for source in sorted((HERE / 'assets').iterdir()):
        if source.is_file():
            payload = source.read_bytes()
            digest = hashlib.sha256(payload).hexdigest()[:12]
            filename = f'{source.stem}.{digest}{source.suffix}'
            (assets / filename).write_bytes(payload)
            asset_map[source.name] = filename
    html = render(data, courses, identity, site_url, preview_url, examples, interactive_preview)
    for source, hashed in asset_map.items():
        html = html.replace('assets/' + source, 'assets/' + hashed)
    (output / 'index.html').write_text(html)
    lesson_root = output / 'esempi'
    if lesson_root.exists():
        shutil.rmtree(lesson_root)  # Only the generated example directory.
    policy = json.loads((HERE / 'security.json').read_text())
    for entry in examples:
        course = next(c for c in courses if c['id'] == entry['pathId'])
        folder = lesson_root / course['id']
        folder.mkdir(parents=True)
        lesson = render_example(entry, course, data, site_url or '/', {'production': bool(site_url), 'meta': policy['Content-Security-Policy'].replace("; frame-ancestors 'none'", '')})
        for source, hashed in asset_map.items():
            lesson = lesson.replace('assets/' + source, 'assets/' + hashed)
        (folder / 'index.html').write_text(lesson)
    (output / '404.html').write_text(template('404.html', subject=text(data['subject']), home=text(site_url or '/'), stylesheet=(site_url or '/') + 'assets/' + asset_map['site.css'], tokens=(site_url or '/') + 'assets/' + asset_map['tokens.css']))
    (output / 'robots.txt').write_text('User-agent: *\nDisallow: /\n' if not site_url else 'User-agent: *\nAllow: /\nSitemap: ' + site_url + 'sitemap.xml\n')
    sitemap = output / 'sitemap.xml'
    if site_url:
        sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + text(site_url) + '</loc></url>' + ''.join('<url><loc>' + text(example_link(next(c for c in courses if c['id'] == e['pathId']), site_url)) + '</loc></url>' for e in examples) + '</urlset>')
    elif sitemap.exists():
        sitemap.unlink()
    security = json.loads((HERE / 'security.json').read_text())
    headers = '/*\n' + ''.join(f'  {key}: {value}\n' for key, value in security.items())
    if not site_url:
        headers += '  X-Robots-Tag: noindex, nofollow\n'
    for path in ['/', '/index.html', '/404.html', '/source-manifest.json', '/robots.txt', '/esempi/*']:
        headers += path + '\n  Cache-Control: public, max-age=0, must-revalidate\n'
    headers += '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n'
    (output / '_headers').write_text(headers)
    (output / 'source-manifest.json').write_text(json.dumps({'composition': identity, 'mode': 'production-ready' if site_url else 'preview', 'courseIds': [course['id'] for course in courses], 'assets': asset_map, 'interactiveExperience': '/esperienza/' if interactive_preview else None, 'publicBase': site_url or preview_url, 'examples': [{'id': e['id'], 'pathId': e['pathId'], 'contentSHA256': e['contentSHA256'], 'editorialStatus': 'APPROVED' if e['approved'] else 'DRAFT', 'url': 'esempi/' + e['pathId'] + '/'} for e in examples]}, indent=2) + '\n')
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=HERE / 'dist')
    parser.add_argument('--site-url')
    parser.add_argument('--preview-url', default=os.environ.get('RENDER_EXTERNAL_URL'))
    parser.add_argument('--review-examples', action='store_true', help='Include DRAFT examples only in an editorial preview')
    parser.add_argument('--interactive-preview', action='store_true', help='Link the separately assembled public lesson demo; preview only')
    parser.add_argument('--catalog', type=Path, default=HERE / 'catalog.json')
    args = parser.parse_args()
    print(build(args.output, args.site_url, args.catalog, args.preview_url if not args.site_url else None, args.review_examples, args.interactive_preview))
