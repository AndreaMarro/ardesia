#!/usr/bin/env python3
"""Serve the built public artifact with its Vercel headers and real 404s."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / 'apps/web'


class PublicHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if path == '/':
            self.send_response(307)
            self.send_header('Location', '/esperienza/')
            self.end_headers()
            return
        # Serve only real artifact files under the public mount. Never apply a
        # SPA fallback, expose adjacent directories, or turn API paths into HTML.
        if not path.startswith('/esperienza/') or any(part in ('.', '..') for part in path.split('/')):
            self.send_error(404, 'No route in this static preview')
            return
        self.path = path.removeprefix('/esperienza')
        super().do_GET()

    def do_HEAD(self):
        path = unquote(urlsplit(self.path).path)
        if not path.startswith('/esperienza/') or any(part in ('.', '..') for part in path.split('/')):
            self.send_error(404, 'No route in this static preview')
            return
        self.path = path.removeprefix('/esperienza')
        super().do_HEAD()

    def end_headers(self):
        for rule in json.loads((WEB / 'vercel.json').read_text())['headers']:
            if rule['source'] == '/(.*)':
                for header in rule['headers']:
                    self.send_header(header['key'], header['value'])
        super().end_headers()

    def do_POST(self):
        self.send_error(404, 'No API in this static preview')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=5324)
    args = parser.parse_args()
    if not (WEB / 'dist-public/index.html').exists():
        parser.error('Run npm run build:web:public first')
    handler = partial(PublicHandler, directory=str(WEB / 'dist-public'))
    ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
