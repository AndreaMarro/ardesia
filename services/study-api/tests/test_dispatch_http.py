"""A blocked synchronous dependency must leave the ASGI event loop usable."""
import asyncio
import concurrent.futures
from io import BytesIO
import threading

import httpx
from PIL import Image
import pytest

from lessonos.study import assets, diary
from lessonos.study.store import StudyStore
from study_api.app import create_app
from test_identity import setup_store


@pytest.mark.parametrize('boundary', ['open', 'close', 'resource', 'diary', 'upload', 'rate_limit'])
def test_health_progresses_while_request_waits_for_sync_work(tmp_path, monkeypatch, boundary):
    store, _, student, *_ = setup_store(tmp_path)
    token = store.issue_session(student)
    resource = store.create_resource(student, 'fluidi', 'notes', 'Fonte sintetica')
    path = store.path
    store.close()
    app = create_app(path, demo=True)
    entered, release = threading.Event(), threading.Event()
    watchdog_expired = threading.Event()

    target, name = {
        'open': (StudyStore, '__init__'),
        'close': (StudyStore, 'close'),
        'resource': (StudyStore, 'get_resource'),
        'diary': (diary, 'get_diary'),
        'upload': (assets, 'upload_asset'),
        'rate_limit': (StudyStore, 'allow_request'),
    }[boundary]
    original = getattr(target, name)

    def blocked(*args, **kwargs):
        entered.set()
        assert release.wait(5), 'watchdog failed to release the synthetic slow boundary'
        return original(*args, **kwargs)

    monkeypatch.setattr(target, name, blocked)

    # The watchdog bounds the regression too: on the old async handlers a
    # blocked Python call prevents even asyncio timeouts/health from running.
    def watchdog():
        if not release.wait(3):
            watchdog_expired.set()
            release.set()

    guard = threading.Thread(target=watchdog)
    guard.start()

    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://testserver',
                                     cookies={'study_session': token}) as client:
            if boundary == 'rate_limit':
                pending = asyncio.create_task(client.post('/study/session', json={'token': 'invalid'}))
            elif boundary == 'diary':
                pending = asyncio.create_task(client.get('/study/diary?editionId=fluidi'))
            elif boundary == 'upload':
                image = BytesIO()
                Image.new('RGB', (2, 2), 'white').save(image, format='PNG')
                pending = asyncio.create_task(client.post('/study/assets?editionId=fluidi', content=image.getvalue(),
                    headers={'Content-Type': 'image/png', 'Idempotency-Key': 'dispatch-upload'}))
            else:
                url = '/study/resources/' + resource['id'] if boundary == 'resource' else '/study/me'
                pending = asyncio.create_task(client.get(url))
            try:
                assert await asyncio.to_thread(entered.wait, 4), 'request did not reach the selected boundary'
                health = await client.get('/study/health')
                assert health.status_code == 200
                assert not release.is_set(), 'health was held behind synchronous request work'
                assert not pending.done(), 'synthetic slow work unexpectedly completed before release'
            finally:
                release.set()
                response = await pending
            assert response.status_code == (401 if boundary == 'rate_limit' else 200), response.text

    try:
        asyncio.run(exercise())
    finally:
        release.set()
        guard.join(5)
    assert not watchdog_expired.is_set(), 'health required the watchdog to release blocked work'


@pytest.mark.parametrize('boundary', ['open', 'resource', 'upload'])
def test_cancelled_request_closes_in_worker_without_blocking_health(tmp_path, monkeypatch, boundary):
    store, _, student, *_ = setup_store(tmp_path)
    token = store.issue_session(student)
    resource = store.create_resource(student, 'fluidi', 'notes', 'Fonte sintetica per cancellazione')
    path = store.path
    store.close()
    app = create_app(path, demo=True)
    entered, release, work_done, closing, close_release = [threading.Event() for _ in range(5)]
    loop_thread = threading.get_ident()
    observations = {}
    target, name = {'open': (StudyStore, '__init__'), 'resource': (StudyStore, 'get_resource'),
                    'upload': (assets, 'upload_asset')}[boundary]
    original, close = getattr(target, name), StudyStore.close

    def blocked(*args, **kwargs):
        entered.set()
        assert release.wait(5)
        try:
            return original(*args, **kwargs)
        finally:
            work_done.set()

    def slow_close(self):
        observations['closeOnLoop'] = threading.get_ident() == loop_thread
        observations['workCompletedBeforeClose'] = work_done.is_set()
        closing.set()
        assert close_release.wait(5)
        close(self)
        observations['closed'] = observations.get('closed', 0) + 1

    monkeypatch.setattr(target, name, blocked)
    monkeypatch.setattr(StudyStore, 'close', slow_close)

    async def exercise():
        loop = asyncio.get_running_loop()
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://testserver',
                                     cookies={'study_session': token}) as client:
            def guard():
                try:
                    if not closing.wait(3):
                        return
                    future = asyncio.run_coroutine_threadsafe(client.get('/study/health'), loop)
                    try:
                        response = future.result(2)
                        observations['healthWhileCloseHeld'] = response.status_code == 200 and not close_release.is_set()
                    except concurrent.futures.TimeoutError:
                        observations['healthWhileCloseHeld'] = False
                finally:
                    release.set()
                    close_release.set()

            watcher = threading.Thread(target=guard)
            watcher.start()
            if boundary == 'upload':
                image = BytesIO()
                Image.new('RGB', (2, 2), 'white').save(image, format='PNG')
                pending = asyncio.create_task(client.post('/study/assets?editionId=fluidi', content=image.getvalue(),
                    headers={'Content-Type': 'image/png', 'Idempotency-Key': 'cancel-dispatch-upload'}))
            else:
                pending = asyncio.create_task(client.get('/study/resources/' + resource['id']))
            try:
                assert await asyncio.to_thread(entered.wait, 3)
                pending.cancel()
                # Let cancellation reach the ASGI middleware task group before
                # allowing the synchronous operation to finish.
                await asyncio.sleep(0.03)
                release.set()
                with pytest.raises(asyncio.CancelledError):
                    await pending
            finally:
                release.set()
                close_release.set()
                await asyncio.to_thread(watcher.join, 5)

    asyncio.run(exercise())
    assert observations == {'closeOnLoop': False, 'workCompletedBeforeClose': True,
                            'healthWhileCloseHeld': True, 'closed': 1}
