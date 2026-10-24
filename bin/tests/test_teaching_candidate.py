import importlib.util
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from http.server import ThreadingHTTPServer
from functools import partial

ROOT = Path(__file__).resolve().parents[2]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


build = module('candidate_builder', 'bin/build_teaching_candidate.py')
serve = module('candidate_server', 'bin/web/serve_teaching_candidate.py')


class CandidateTest(unittest.TestCase):
    def test_build_and_isolation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ('marketing', 'experience', 'web', 'studio'):
                (root / name).mkdir()
                (root / name / 'index.html').write_text(name)
            output = root / 'out'
            manifest = build.assemble(output, root / 'marketing', root / 'experience', web=root / 'web', studio=root / 'studio')
            self.assertEqual((output / 'public/index.html').read_text(), 'marketing')
            self.assertEqual((output / 'public/esperienza/index.html').read_text(), 'experience')
            self.assertEqual((output / 'beta/studio/index.html').read_text(), 'studio')
            self.assertFalse(manifest['privateDataIncluded'])
            with self.assertRaisesRegex(ValueError, 'fresh_output'):
                build.assemble(output, root / 'marketing', root / 'experience')
            (root / 'experience/.env').write_text('synthetic forbidden configuration')
            with self.assertRaisesRegex(ValueError, 'private_or_linked'):
                build.assemble(root / 'bad', root / 'marketing', root / 'experience')
            self.assertFalse((root / 'bad').exists())

    def test_real_routes_no_api_no_directory_listing_or_traversal(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'index.html').write_text('landing')
            (root / 'esperienza').mkdir()
            (root / 'esperienza/index.html').write_text('experience')
            (root / 'assets').mkdir()
            server = ThreadingHTTPServer(('127.0.0.1', 0), partial(serve.CandidateHandler, directory=directory))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            origin = f'http://127.0.0.1:{server.server_port}'
            try:
                for path, text in [('/', 'landing'), ('/esperienza/?percorso=fluidi-termodinamica', 'experience')]:
                    with urlopen(origin + path) as response:
                        self.assertEqual(response.read().decode(), text)
                        self.assertIn("connect-src 'none'", response.headers['Content-Security-Policy'])
                        self.assertIn('microphone=()', response.headers['Permissions-Policy'])
                for path in ['/study/me', '/assets/', '/%2e%2e/secret', '/esperienza/unknown']:
                    with self.assertRaises(HTTPError) as caught:
                        urlopen(origin + path)
                    self.assertEqual(caught.exception.code, 404)
                with self.assertRaises(HTTPError) as caught:
                    urlopen(Request(origin + '/study/login', data=b'{}'))
                self.assertEqual(caught.exception.code, 404)
            finally:
                server.shutdown()
                server.server_close()
                thread.join()
