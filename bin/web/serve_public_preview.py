#!/usr/bin/env python3
"""Serve the built public artifact with its Vercel headers and real 404s."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / 'apps/web'


class PublicHandler(SimpleHTTPRequestHandler):
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
