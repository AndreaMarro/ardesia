# Changelog

## 0.1.0

- Add `course.list_mine`, `lesson.get_context`, and `receipt.get` over authorized Study HTTP GETs.
- Require the exact context/resource/revision triple; preserve historical source pins and actual receipt versions.
- Use official Python SDK 2.3.0 constructor handlers and stdio, tested with its official Client in protocol `2026-07-28` mode.
- Add strict input schemas, explicit response allowlists, safe error envelopes, bounded HTTP reads, and no interactive UI claim.
- Isolate SDK/httpx2 dependencies from the Study API's httpx 0.28 environment.
- Test actual subprocess stdio against disposable real Study HTTP/SQLite; Supabase/host acceptance requires separate replay.
