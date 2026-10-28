"""Private Web bundle served by the same admitted Study ASGI application."""
from pathlib import Path

from starlette.datastructures import Headers
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse
from starlette.staticfiles import StaticFiles


class StudySPAStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        path = path.lstrip('/')
        if path == 'study' or path.startswith('study/'):
            # A missing API route must never become an apparently successful
            # HTML navigation, even when the caller asks for text/html.
            return JSONResponse({'error': 'not_found'}, status_code=404)
        try:
            return await super().get_response(path, scope)
        except HTTPException as error:
            if (error.status_code == 404 and scope['method'] in ('GET', 'HEAD')
                    and 'text/html' in Headers(scope=scope).get('accept', '')
                    and not Path(path).suffix):
                return await super().get_response('index.html', scope)
            raise
