# pypdf API: patch circoscritta — 25 ottobre 2026

Modificati solo `services/study-api/pyproject.toml` (floor `pypdf>=6.21.2,<7`) e `services/study-api/uv.lock` (nodo pypdf 6.21.1→6.21.2 più requires-dist del progetto). Tutte le altre entry del lock sono identiche; nessun file Engine, Pillow o certifi toccato. Nessun commit o azione remota.

La [release ufficiale 6.21.2 del 21 ottobre](https://github.com/py-pdf/pypdf/releases/tag/6.21.2) comprende i fix security #4240 e #4239. La [scheda PyPI della versione](https://pypi.org/pypi/pypdf/6.21.2/json) è non-yanked, dichiara Python>=3.9 (compatibile con API>=3.12) e al momento della verifica non elenca advisory per tale versione. L'[advisory primario](https://github.com/py-pdf/pypdf/security/advisories/GHSA-6c7f-9265-g8fw) indica la patch 6.21.2 per riferimenti ripetuti a oggetti mancanti.

Verifica: `uv lock --project services/study-api --upgrade-package pypdf==6.21.2`; `uv sync --project services/study-api --frozen --python 3.13` PASS. Ambiente risultante Python3.13.14/pypdf6.21.2. Gli stessi 38 test asset HTTP/scientific notebook/portable budget/Core notebook passano prima e dopo; rimane un warning preesistente Starlette TestClient/httpx. `git diff --check` PASS.

I test esistenti verificano compatibilità del consumer; non vengono descritti come exploit RED/GREEN dell'advisory. La patch non introduce un budget CPU generale per file ostili. Engine conserva il proprio lock pypdf precedente; la sua revisione è fuori da questa ownership.

Prove: `/private/tmp/ardesia-pypdf-{before,after,lock,sync}.log`, `/private/tmp/ardesia-pypdf-patch-receipt.json`. La suite completa e la review sull'artefatto composto restano all'integratore.
