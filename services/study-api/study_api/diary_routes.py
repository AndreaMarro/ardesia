"""Authenticated views and commands for the single LessonOS error diary."""
from fastapi import Depends, Request
from lessonos.study import diary


def install_diary_routes(app, store_dependency, authenticate):
    def command(request, store):
        return authenticate(request, store), request.headers.get('Idempotency-Key', '')

    @app.get('/study/diary')
    async def my_diary(request: Request, editionId: str | None = None, store=Depends(store_dependency)):
        return diary.get_diary(store, authenticate(request, store), editionId)

    @app.get('/study/diary/threads/{thread_id}')
    async def thread(thread_id: str, request: Request, store=Depends(store_dependency)):
        return diary.get_thread(store, authenticate(request, store), thread_id)

    @app.post('/study/diary/observations')
    async def propose(body: dict, request: Request, store=Depends(store_dependency)):
        actor, key = command(request, store)
        return diary.propose_error(store, actor, body.get('submissionId'), body.get('conceptId'),
            body.get('category'), body.get('anchor'), key)

    @app.post('/study/diary/threads/{thread_id}/confirm')
    async def confirm(thread_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        actor, key = command(request, store)
        return diary.confirm_error(store, actor, thread_id, body.get('rubric'), body.get('explanation'),
            body.get('nextStep'), key, source_checked=body.get('sourceChecked', False),
            transfer_exercise=body.get('transferExercise'))

    @app.post('/study/diary/threads/{thread_id}/contest')
    async def contest(thread_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        actor, key = command(request, store)
        return diary.contest_error(store, actor, thread_id, body.get('reason'), key)

    @app.post('/study/diary/threads/{thread_id}/dismiss')
    async def dismiss(thread_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        actor, key = command(request, store)
        return diary.dismiss_error(store, actor, thread_id, body.get('reason'), key)

    @app.post('/study/diary/threads/{thread_id}/practice')
    async def practice(thread_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        actor, key = command(request, store)
        return diary.record_practice(store, actor, thread_id, body.get('submissionId'),
            body.get('exerciseId'), body.get('parameters'), key)

    @app.post('/study/diary/threads/{thread_id}/verify')
    async def verify(thread_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        actor, key = command(request, store)
        return diary.verify_transfer(store, actor, thread_id, body.get('attemptId'), body.get('rubricEvidence'), key)

    @app.post('/study/diary/threads/{thread_id}/recur')
    async def recur(thread_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        actor, key = command(request, store)
        return diary.record_recurrence(store, actor, thread_id, body.get('submissionId'),
            body.get('anchor'), body.get('explanation'), key)
