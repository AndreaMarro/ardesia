#!/usr/bin/env python3
"""Build a local, unpublished public demo and optional private beta UI.

No hosting, credentials, database seeding, enrollment or publication occurs here.
Run with the lockfile runtime and already installed dependencies.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent / 'web'))
from teaching_policy import exported_headers
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'packages/engine'))

ROOT = Path(__file__).resolve().parents[1]
BLOCKED = {'.env', 'demo-access.json', 'study.sqlite'}


def copy_surface(source: Path, destination: Path) -> None:
    if not (source / 'index.html').is_file():
        raise ValueError(f'missing_built_index:{source}')
    for item in source.rglob('*'):
        if item.is_symlink() or item.name in BLOCKED or item.suffix in {'.sqlite', '.db', '.pem', '.key'} or item.name.startswith('.env'):
            raise ValueError(f'private_or_linked_asset:{item.name}')
    shutil.copytree(source, destination)


def assemble(destination: Path, marketing: Path, experience: Path, *, web: Path | None = None,
             studio: Path | None = None, source: dict | None = None, course_manifest: dict | None = None) -> dict:
    if destination.exists():
        raise ValueError('fresh_output_directory_required')
    if (web is None) != (studio is None):
        raise ValueError('private_surfaces_must_be_paired')
    destination.mkdir(parents=True)
    try:
        copy_surface(marketing, destination / 'public')
        copy_surface(experience, destination / 'public/esperienza')
        # Four stable course paths reuse the same public app; private routes keep404.
        # Only valid course IDs receive an entry, with no catch-all SPA fallback.
        for route in ('corsi', 'corsi/strumenti-meccanica', 'corsi/fluidi-termodinamica',
                      'corsi/elettricita-magnetismo', 'corsi/onde-ottica-radiazioni'):
            folder=destination/'public'/route
            folder.mkdir(parents=True)
            shutil.copy2(experience/'index.html',folder/'index.html')
        if course_manifest is not None:
            (destination/'public/courses-manifest.json').write_text(json.dumps(course_manifest,indent=2)+'\n')
        # Marketing alone has no audio. Export the policy actually used by the
        # composed lesson, instead of silently inheriting media-src default none.
        (destination / 'public/_headers').write_text(exported_headers())
        if web is not None:
            copy_surface(web, destination / 'beta/web')
            copy_surface(studio, destination / 'beta/studio')
        assets = {str(p.relative_to(destination)): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in sorted(destination.rglob('*')) if p.is_file()}
        manifest = {'schemaVersion': 1, 'releaseState': 'local-unpublished',
                    'publicEntry': '/', 'experienceEntry': '/esperienza/?percorso=fluidi-termodinamica',
                    'commercialAction': 'manifestazione di interesse; nessuna iscrizione, account o pagamento',
                    'privateBeta': web is not None, 'privateDataIncluded': False,
                    'requiresProtectedPreview':web is not None or bool(course_manifest and course_manifest.get('releaseScope')=='PRIVATE_EDITORIAL_REVIEW'),
                    'source': source or {}, 'assetsSha256': assets}
        (destination / 'candidate-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        return manifest
    except Exception:
        shutil.rmtree(destination)
        raise


def run(command: list[str], **kwargs) -> None:
    subprocess.run(command, cwd=ROOT, check=True, **kwargs)


def source_inventory() -> dict:
    paths = subprocess.check_output(['git', 'ls-files', '-co', '--exclude-standard', '-z'], cwd=ROOT).decode().split('\0')
    prefixes = ('apps/web/', 'apps/studio/', 'apps/marketing-01/', 'bin/',
                'packages/engine/lessonos/', 'services/study-api/', '.github/workflows/',
                'plugins/elab-tutor/src/', 'packs/elab-tutor/')
    selected = {}
    for name in sorted(set(paths)):
        target = ROOT / name
        if (name.startswith(prefixes) or name in ('package.json', 'package-lock.json')) and '/graphify-out/' not in name and target.is_file() and not target.is_symlink():
            selected[name] = hashlib.sha256(target.read_bytes()).hexdigest()
    combined = ''.join(f'{name}\0{digest}\n' for name, digest in selected.items()).encode()
    return {'sha256': hashlib.sha256(combined).hexdigest(), 'files': selected}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--include-private', action='store_true')
    parser.add_argument('--learning-journey', action='store_true',
                        help='Enable the verified private student journey and record the build flag')
    parser.add_argument('--editorial-review', action='store_true',help='Full original DRAFT material; PROTECTED PREVIEW ONLY, never public release')
    parser.add_argument('--review-examples', action='store_true',
                        help='Opt in to private editorial preview examples; excluded from the public demo by default')
    args = parser.parse_args()
    if args.learning_journey and not args.include_private:
        parser.error('learning_journey_requires_private_clients')
    output = args.output.resolve()
    if output.exists():
        parser.error('fresh_output_directory_required')
    # Each intermediate tree is fresh; outputs never contain a demo access file.
    import tempfile
    with tempfile.TemporaryDirectory(prefix='ardesia-candidate-') as scratch:
        marketing = Path(scratch) / 'marketing'
        marketing_command = ['python3', 'apps/marketing-01/build.py', '--interactive-preview', '--output', str(marketing)]
        if args.review_examples:
            marketing_command.append('--review-examples')
        run(marketing_command)
        review_env=dict(os.environ)
        if args.editorial_review:
            review_file=Path(scratch)/'course-review-data.ts'
            run(['python3','bin/web/export_course_learning.py','--review','--output',str(review_file)])
            review_env['ARDESIA_COURSE_REVIEW_DATA']=str(review_file)
        run(['npm', 'run', 'build:web:public'],env=review_env)
        from lessonos.study.four_courses import course_projection
        course_data=course_projection(review=args.editorial_review)
        course_manifest={'schemaVersion':1,'releaseScope':course_data['releaseScope'],
                         'requiredObjectives':course_data['baseline']['requiredObjectives'],
                         'courses':[{'pathId':c['pathId'],'completedObjectives':c['completedObjectives'],'requiredObjectives':c['requiredObjectives'],
                                     'packRef':c['packRef'],'lessons':[l['lessonRef'] for l in c['lessons']]} for c in course_data['courses']]}
        if args.include_private:
            run(['npm', 'run', 'build:web'], env={**os.environ,
                'VITE_S20_LEARNING_JOURNEY': '1' if args.learning_journey else '0'})
            run(['npm', '--prefix', 'apps/studio', 'run', 'build'], env={**os.environ, 'ARDESIA_STUDIO_BASE': '/studio/'})
        head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
        diff = subprocess.check_output(['git', 'diff', '--binary', 'HEAD', '--', '.github/workflows', 'apps/web', 'apps/studio', 'apps/marketing-01', 'bin', 'packages/engine/lessonos', 'services/study-api'], cwd=ROOT)
        inventory = source_inventory()
        manifest = assemble(output, marketing, ROOT / 'apps/web/dist-public',
                            web=ROOT / 'apps/web/dist' if args.include_private else None,
                            studio=ROOT / 'apps/studio/dist' if args.include_private else None,
                            course_manifest=course_manifest,
                            source={'commit': head, 'trackedDiffSha256': hashlib.sha256(diff).hexdigest(),
                                    'buildFlags': {'learningJourney': args.learning_journey},
                                    'sourceTreeSha256': inventory['sha256'], 'sourceFileCount': len(inventory['files']),
                                    'note': 'source tree and asset hashes identify the exact build, including uncommitted sources'})
    (output / 'source-manifest.json').write_text(json.dumps(inventory, indent=2) + '\n')
    print(f"Local unpublished candidate: {output}; {len(manifest['assetsSha256'])} assets")


if __name__ == '__main__':
    main()
