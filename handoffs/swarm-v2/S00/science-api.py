"""Disposable synthetic fixture served by the actual Study API factory.

No proposed patch, replacement authentication or alternate store is injected.
The reused S01 seed creates only synthetic principals and canonical Core data.
"""
import argparse
from pathlib import Path
import runpy
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path[:0] = [str(ROOT/'packages/engine'), str(ROOT/'services/study-api')]
from study_api.app import create_app


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', type=Path, required=True)
    parser.add_argument('--frontend', type=Path, required=True)
    args = parser.parse_args()
    seed = runpy.run_path(str(ROOT/'handoffs/swarm-v2/S01/local-api.py'))['seed']
    db = seed(args.directory)  # Refuses to replace an existing fixture database.
    app = create_app(db, demo=True, frontend=args.frontend)
    sys.path.insert(0, str(ROOT/'bin/web'))
    from teaching_policy import PRIVATE_HEADERS

    @app.middleware('http')
    async def preview_headers(request, call_next):
        response = await call_next(request)
        for key, value in PRIVATE_HEADERS.items():
            response.headers[key] = value
        return response

    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=55511, access_log=False)
