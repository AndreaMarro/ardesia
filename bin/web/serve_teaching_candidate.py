#!/usr/bin/env python3
"""Serve the combined, unpublished landing and experience on loopback only."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from teaching_policy import CSP, HEADERS



class CandidateHandler(SimpleHTTPRequestHandler):
    def valid_path(self):
        path = unquote(urlsplit(self.path).path)
        if any(part in ('.', '..') for part in path.split('/')) or '\\' in path:
            return False
        target = (Path(self.directory) / path.lstrip('/')).resolve()
        root = Path(self.directory).resolve()
        return target.is_relative_to(root) and (target.is_file() or (target / 'index.html').is_file())

    def do_GET(self):
        if not self.valid_path():
            self.send_error(404, 'No route in this static candidate')
            return
        super().do_GET()

    def do_HEAD(self):
        if not self.valid_path():
            self.send_error(404, 'No route in this static candidate')
            return
        super().do_HEAD()

    def do_POST(self):
        self.send_error(404, 'No API in this static candidate')

    def end_headers(self):
        for name, value in HEADERS.items():
            self.send_header(name, value)
        super().end_headers()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', type=Path, required=True, help='candidate/public directory')
    parser.add_argument('--port', type=int, default=5414)
    args = parser.parse_args()
    if not (args.directory / 'index.html').is_file() or not (args.directory / 'esperienza/index.html').is_file():
        parser.error('both_public_surfaces_required')
    handler = partial(CandidateHandler, directory=str(args.directory.resolve()))
    ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
