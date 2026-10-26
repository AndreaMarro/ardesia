#!/usr/bin/env python3
"""Serve the combined, unpublished landing and experience on loopback only."""
import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from teaching_policy import CSP, HEADERS, PRIVATE_HEADERS



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


class IntegratedCandidateHandler(CandidateHandler):
    """Loopback client-only view of the exact protected export contract."""
    def backend_unavailable(self):
        path=unquote(urlsplit(self.path).path)
        if path=='/study' or path.startswith('/study/'):
            body=b'{"error":"backend_not_configured","remoteReady":false}\n'
            self.send_response(503)
            self.send_header('Content-Type','application/json')
            self.send_header('Content-Length',str(len(body)))
            self.end_headers()
            if self.command!='HEAD':self.wfile.write(body)
            return True
        return False

    def do_GET(self):
        if not self.backend_unavailable():super().do_GET()

    def do_HEAD(self):
        if not self.backend_unavailable():super().do_HEAD()

    def do_POST(self):
        if not self.backend_unavailable():super().do_POST()

    do_PUT=do_POST
    do_PATCH=do_POST
    do_DELETE=do_POST
    do_OPTIONS=do_POST

    def end_headers(self):
        for name,value in PRIVATE_HEADERS.items():self.send_header(name,value)
        SimpleHTTPRequestHandler.end_headers(self)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', type=Path, required=True, help='candidate/public directory')
    parser.add_argument('--port', type=int, default=5414)
    parser.add_argument('--private-integrated',action='store_true',help='Serve prepared private Web+Studio clients; no backend or remote certification')
    args = parser.parse_args()
    if args.private_integrated:
        marker=args.directory/'release-manifest.json'
        if (not marker.is_file() or json.loads(marker.read_text()).get('scope')!='PRIVATE_INTEGRATED_PREVIEW'
                or not (args.directory/'studio/index.html').is_file()):parser.error('private_integrated_artifact_required')
    elif not (args.directory / 'index.html').is_file() or not (args.directory / 'esperienza/index.html').is_file():
        parser.error('both_public_surfaces_required')
    handler = partial(IntegratedCandidateHandler if args.private_integrated else CandidateHandler,directory=str(args.directory.resolve()))
    ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
