"""Bounded GET-only port. No database, service key, redirect or caller URL."""
import asyncio
import json
from urllib.parse import quote

import httpx2

from .config import Settings
from .contracts import ContextInput, CourseInput


class ReadFailure(Exception):
    def __init__(self, code: str):
        self.code = code
        super().__init__(code)


class CoreGateway:
    def __init__(self, settings: Settings, *, transport=None, max_bytes=512*1024,
                 total_seconds=8.0, queue_seconds=.25, concurrency=4):
        self.settings = settings
        self.max_bytes = max_bytes
        self.total_seconds = total_seconds
        self.queue_seconds = queue_seconds
        self.slots = asyncio.Semaphore(concurrency)
        self.client = httpx2.AsyncClient(base_url=settings.origin, trust_env=False,
            follow_redirects=False, transport=transport, timeout=httpx2.Timeout(5.0),
            limits=httpx2.Limits(max_connections=concurrency, max_keepalive_connections=concurrency),
            headers={'Accept':'application/json', 'Accept-Encoding':'identity',
                     'Cookie':f'study_session={settings.session}'})

    async def __aenter__(self):
        await self.client.__aenter__()
        return self

    async def __aexit__(self, *args):
        await self.client.__aexit__(*args)

    async def _read(self, path, params=None):
        try:
            await asyncio.wait_for(self.slots.acquire(), self.queue_seconds)
        except TimeoutError:
            raise ReadFailure('BUSY') from None
        try:
            async with asyncio.timeout(self.total_seconds):
                async with self.client.stream('GET', path, params=params) as response:
                    # Do not read or reflect any private error body. Redirects
                    # are failures even when their Location is another loopback.
                    if response.status_code == 401:
                        raise ReadFailure('AUTH_REQUIRED')
                    if response.status_code in (403, 404):
                        raise ReadFailure('NOT_AVAILABLE')
                    if response.status_code != 200:
                        raise ReadFailure('CORE_UNAVAILABLE')
                    if response.headers.get('content-type', '').split(';')[0].strip() != 'application/json':
                        raise ReadFailure('CORE_UNAVAILABLE')
                    length = response.headers.get('content-length')
                    if length and length.isdecimal() and int(length) > self.max_bytes:
                        raise ReadFailure('RESULT_TOO_LARGE')
                    body = bytearray()
                    async for chunk in response.aiter_bytes():
                        if len(body) + len(chunk) > self.max_bytes:
                            raise ReadFailure('RESULT_TOO_LARGE')
                        body.extend(chunk)
                    value = json.loads(body, parse_constant=lambda _: (_ for _ in ()).throw(ValueError()))
                    if not isinstance(value, dict):
                        raise ReadFailure('CORE_UNAVAILABLE')
                    return value
        except (httpx2.HTTPError, TimeoutError, ValueError, RecursionError):
            raise ReadFailure('CORE_UNAVAILABLE') from None
        finally:
            self.slots.release()

    async def editions(self, args: CourseInput):
        params = {'limit':args.limit}
        if args.cursor is not None:
            params['after'] = args.cursor
        return await self._read('/study/editions', params)

    async def context(self, args: ContextInput):
        return await self._read('/study/context/' + quote(args.contextId, safe=''),
                               {'resourceId':args.resourceId, 'revisionId':args.revisionId, 'query':args.query})

    async def receipt(self, receipt_id: str):
        return await self._read('/study/receipts/' + quote(receipt_id, safe=''))
