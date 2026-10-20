#!/usr/bin/env python3
"""Serve the built public candidate locally, with its real stateless Core API."""
import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]
from study_api.public_app import create_public_app
import uvicorn

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5392)
    args = parser.parse_args()
    frontend = ROOT / 'apps/web/dist-public'
    if not (frontend / 'index.html').is_file():
        parser.error('Build first: npm run build:web:public')
    print(f'Ardesia — anteprima locale: http://127.0.0.1:{args.port}/', flush=True)
    uvicorn.run(create_public_app(frontend=frontend), host='127.0.0.1',
                port=args.port, access_log=False, log_level='warning')
