"""Personal memory uses the same authenticated store scope as every Study view."""
from fastapi import Depends, Query, Request
from lessonos.study import learning_memory as memory


def install_learning_memory_routes(app, store_dependency, authenticate):
    @app.get('/study/memory')
    def projection(request: Request, query: str = Query('', max_length=200), store=Depends(store_dependency)):
        return memory.get_memory(store, authenticate(request, store), query)

    @app.get('/study/memory/export')
    def export(request: Request, store=Depends(store_dependency)):
        return memory.export_memory(store, authenticate(request, store))

    @app.get('/study/memory/view')
    def view(request: Request, store=Depends(store_dependency)):
        return memory.get_view(store, authenticate(request, store))

    @app.post('/study/memory/view')
    def save_view(body: dict, request: Request, store=Depends(store_dependency)):
        return memory.save_view(store, authenticate(request, store), body,
            request.headers.get('Idempotency-Key', ''))

    @app.post('/study/memory/import')
    def import_archive(body: dict, request: Request, store=Depends(store_dependency)):
        return memory.import_memory(store, authenticate(request, store), body.get('archive'),
            request.headers.get('Idempotency-Key', ''))

    @app.post('/study/memory/notes')
    def create(body: dict, request: Request, store=Depends(store_dependency)):
        return memory.save_note(store, authenticate(request, store), body, request.headers.get('Idempotency-Key', ''))

    @app.get('/study/memory/notes/{note_id}')
    def note(note_id: str, request: Request, store=Depends(store_dependency)):
        return memory.get_note(store, authenticate(request, store), note_id)

    @app.get('/study/memory/notes/{note_id}/history')
    def history(note_id: str, request: Request, store=Depends(store_dependency)):
        return {'revisions': memory.get_history(store, authenticate(request, store), note_id)}

    @app.post('/study/memory/notes/{note_id}')
    def revise(note_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        return memory.save_note(store, authenticate(request, store), body.get('note'),
            request.headers.get('Idempotency-Key', ''), note_id=note_id, expected_version=body.get('expectedVersion'))

    @app.post('/study/memory/notes/{note_id}/delete')
    def delete(note_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        return memory.delete_note(store, authenticate(request, store), note_id, body.get('expectedVersion'),
            request.headers.get('Idempotency-Key', ''))
