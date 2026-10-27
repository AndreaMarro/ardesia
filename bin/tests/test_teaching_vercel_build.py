"""The root Vercel command composes the verified clients without deploying."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'bin/web'))


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


wrapper = module('vercel_integrated_build', 'bin/web/build_vercel_integrated.py')
candidate_builder = module('vercel_candidate_build', 'bin/build_teaching_candidate.py')
from prepare_vercel_preview import prepare
from teaching_policy import integrated_routes


class VercelIntegratedBuildTest(unittest.TestCase):
    def fixture(self, candidate):
        root = candidate.parent
        for name in ('marketing', 'experience', 'web', 'studio'):
            surface = root / name
            surface.mkdir()
            (surface / 'index.html').write_text('<!doctype html><title>' + name + '</title>')
        (root / 'marketing/404.html').write_text('<h1>Not found</h1>')
        (root / 'marketing/robots.txt').write_text('User-agent: *\nDisallow: /\n')
        (root / 'marketing/source-manifest.json').write_text('{"examples":[]}')
        empty = hashlib.sha256(b'').hexdigest()
        candidate_builder.assemble(
            candidate, root / 'marketing', root / 'experience',
            web=root / 'web', studio=root / 'studio',
            source={'commit': 'b' * 40, 'trackedDiffSha256': empty,
                    'sourceTreeSha256': empty, 'sourceFileCount': 0,
                    'buildFlags': {'learningJourney': True}},
            course_manifest={'releaseScope': 'PUBLIC_DEMONSTRATION'})
        (candidate / 'source-manifest.json').write_text(json.dumps({'sha256': empty, 'files': {}}))

    def run_build_commands(self, command, **kwargs):
        self.assertTrue(kwargs['check'])
        self.assertEqual(kwargs['cwd'], wrapper.ROOT)
        if command[1].endswith('build_teaching_candidate.py'):
            self.assertIn('--include-private', command)
            self.assertIn('--learning-journey', command)
            self.assertNotIn('--editorial-review', command)
            self.assertNotIn('--review-examples', command)
            self.fixture(Path(command[command.index('--output') + 1]))
        else:
            self.assertTrue(command[1].endswith('prepare_vercel_preview.py'))
            self.assertIn('--private-integrated', command)
            prepare(Path(command[command.index('--candidate') + 1]),
                    Path(command[command.index('--output') + 1]), private_integrated=True,
                    main_sha=command[command.index('--main-sha') + 1],
                    head_sha=command[command.index('--head-sha') + 1])

    def test_root_config_selects_build_output_api_and_disables_git_deploy(self):
        config = json.loads((ROOT / 'vercel.json').read_text())
        self.assertIsNone(config['framework'])
        self.assertEqual(config['buildCommand'], 'python3 bin/web/build_vercel_integrated.py')
        self.assertEqual(config['installCommand'], 'npm ci && npm --prefix apps/studio ci')
        self.assertEqual(config['outputDirectory'], '.vercel/output')
        self.assertIs(config['git']['deploymentEnabled'], False)
        self.assertNotIn('rewrites', config)
        self.assertNotIn('routes', config)

    def test_fresh_canonical_output_has_both_clients_503_and_no_public_sidecar(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '.vercel/output').mkdir(parents=True)
            (root / '.vercel/output/stale.html').write_text('stale previous build')
            project = root / '.vercel/project.json'
            project.write_text('{"projectId":"synthetic-existing-project"}')
            with patch.object(wrapper, 'ROOT', root), \
                    patch.object(wrapper, 'git_sha', return_value='b' * 40), \
                    patch.object(wrapper.subprocess, 'run', side_effect=self.run_build_commands), \
                    patch.dict(wrapper.os.environ, {'VERCEL_PROJECT_ID': wrapper.PRIVATE_PROJECT_ID}, clear=True):
                receipt = wrapper.build(main_sha='a' * 40)
            output = root / '.vercel/output'
            self.assertEqual(json.loads((output / 'config.json').read_text())['routes'], integrated_routes())
            self.assertIn('web', (output / 'static/index.html').read_text())
            self.assertIn('studio', (output / 'static/studio/index.html').read_text())
            self.assertFalse((output / 'stale.html').exists())
            for excluded in ('esperienza', 'courses-manifest.json', 'candidate-manifest.json'):
                self.assertFalse((output / 'static' / excluded).exists())
            release = json.loads((output / 'static/release-manifest.json').read_text())
            self.assertEqual(release['mainObserved'], 'a' * 40)
            self.assertEqual(release['integrationHead'], 'b' * 40)
            self.assertEqual(release['buildFlags'], {'learningJourney': True})
            self.assertIs(release['publicReleaseAllowed'], False)
            self.assertEqual(release['backend'], 'NOT_CONFIGURED')
            self.assertIs(receipt['requiresProtectedPreview'], True)
            self.assertEqual(json.loads((root / '.vercel/ardesia-preview-manifest.json').read_text()), receipt)
            self.assertEqual(project.read_text(), '{"projectId":"synthetic-existing-project"}')
            self.assertEqual(sorted(p.name for p in (root / '.vercel').iterdir()),
                             ['ardesia-preview-manifest.json', 'output', 'project.json'])

    def test_failed_build_removes_stale_output_and_preserves_project_link(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '.vercel/output').mkdir(parents=True)
            (root / '.vercel/output/stale.html').write_text('stale')
            (root / '.vercel/project.json').write_text('{}')
            (root / '.vercel/ardesia-preview-manifest.json').write_text('{}')
            with patch.object(wrapper, 'ROOT', root), \
                    patch.object(wrapper, 'git_sha', return_value='b' * 40), \
                    patch.object(wrapper.subprocess, 'run', side_effect=subprocess.CalledProcessError(1, ['build'])), \
                    patch.dict(wrapper.os.environ, {}, clear=True):
                with self.assertRaises(subprocess.CalledProcessError):
                    wrapper.build(main_sha='a' * 40)
            self.assertEqual([p.name for p in (root / '.vercel').iterdir()], ['project.json'])

    def test_editorial_alias_and_inexact_main_never_start_a_build(self):
        with patch.object(wrapper, 'git_sha', return_value='b' * 40), \
                patch.object(wrapper.subprocess, 'run') as run:
            with patch.dict(wrapper.os.environ, {'ARDESIA_COURSE_REVIEW_DATA': '/private/draft.ts'}):
                with self.assertRaisesRegex(ValueError, 'editorial_sidecar_not_allowed'):
                    wrapper.build(main_sha='a' * 40)
            with patch.dict(wrapper.os.environ, {}, clear=True):
                with self.assertRaisesRegex(ValueError, 'exact_release_refs_required'):
                    wrapper.build(main_sha='main')
            run.assert_not_called()

    def test_other_vercel_projects_cannot_build_the_private_clients(self):
        for project in ('prj_public-demo', ''):
            with self.subTest(project=project), \
                    patch.dict(wrapper.os.environ, {'VERCEL_PROJECT_ID': project}, clear=True), \
                    patch.object(wrapper.subprocess, 'run') as run:
                with self.assertRaisesRegex(ValueError, 'private_vercel_project_required'):
                    wrapper.build(main_sha='a' * 40)
                run.assert_not_called()

    def test_symlinked_output_is_rejected_without_touching_its_target(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            outside = root / 'unrelated'
            outside.mkdir()
            (outside / 'keep.txt').write_text('keep')
            (root / '.vercel').mkdir()
            (root / '.vercel/output').symlink_to(outside, target_is_directory=True)
            with patch.object(wrapper, 'ROOT', root), \
                    patch.object(wrapper, 'git_sha', return_value='b' * 40), \
                    patch.dict(wrapper.os.environ, {}, clear=True):
                with self.assertRaisesRegex(ValueError, 'linked_build_output_not_allowed'):
                    wrapper.build(main_sha='a' * 40)
            self.assertEqual((outside / 'keep.txt').read_text(), 'keep')


if __name__ == '__main__':
    unittest.main()
