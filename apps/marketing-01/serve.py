#!/usr/bin/env python3
"""Local preview of a static artifact; genuine 404, no SPA fallback or data endpoint."""
import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        for key, value in json.loads((Path(__file__).parent/'security.json').read_text()).items():
            self.send_header(key, value)
        self.send_header('Cache-Control', 'public, max-age=31536000, immutable' if '/assets/' in self.path and not getattr(self, '_not_found', False) else 'public, max-age=0, must-revalidate')
        super().end_headers()
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self._not_found = True
            body=(Path(self.directory)/'404.html').read_bytes()
            self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers()
            if self.command!='HEAD':self.wfile.write(body)
        else:super().send_error(code,message,explain)
    def log_message(self,*args):pass
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--directory',type=Path,default=Path(__file__).parent/'dist');parser.add_argument('--port',type=int,default=5390);args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(args.directory)))
    print(f'Preview: http://127.0.0.1:{server.server_port}',flush=True)
    server.serve_forever()
