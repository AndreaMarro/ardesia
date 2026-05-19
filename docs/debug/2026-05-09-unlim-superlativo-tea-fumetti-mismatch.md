# Debug Note - Tea, Fumetti, Repo, Nanobot

Data: 2026-05-09

## Fonti controllate

- Tea package: `/Users/andreamarro/VOLUME 3/elab-fumetti-consegna-v2`
- Repo attivo: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
- Nanobot: `/tmp/elab-galileo-nanobot`
- Audit JSON: `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/tea-fumetti-audit.json`
- Mismatch JSON: `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/debug-mismatch-tea-repo.json`

## Esito Tea vs repo

- `narrative_map.json`: 94 esperimenti.
- Repo `experiments-vol*.js`: 94 esperimenti.
- `volume-references.js`: 94 riferimenti.
- Missing ID Tea -> repo: 0.
- Missing ID repo -> Tea: 0.
- Missing volume references: 0.
- Page mismatch narrative/metadata vs `volume-references.js`: 0.
- Capitoli: 23.
- Story arcs: 21.
- Capstone `next_id=null`: 9.
- `chapter_title_origin = tea-inferred`: 23/23. Questo e' coerente col file Tea, ma va trattato come titolo dedotto, non fonte canonica del volume.

## Esito fumetti v2

- PDF: 94.
- Payload JSON: 94.
- Copertura ID canonici: 94/94.
- PDF non canonici come naming regex `fumetto_v*-capN-espN.pdf`: 7.

File non canonici ma allineati a ID repo/Tea:

- `fumetto_v3-cap6-morse.pdf`
- `fumetto_v3-cap6-semaforo.pdf`
- `fumetto_v3-cap7-mini.pdf`
- `fumetto_v3-cap8-serial.pdf`
- `fumetto_v3-extra-lcd-hello.pdf`
- `fumetto_v3-extra-servo-sweep.pdf`
- `fumetto_v3-extra-simon.pdf`

## Nanobot

Nanobot e' stato letto come repository di policy operative:

- `brain.py`: router JSON con `intent`, `entities`, `actions`, `needs_llm`, `response`, `llm_hint`.
- `prompts/*.yml`: specialisti circuit/code/scratch/tutor/vision con regole action-first.
- `server.py`: racing provider e routing specialistico.

Mismatch non ignorabile:

- `nanobot.yml` contiene ancora catalogo "69 esperimenti".
- Cita ID legacy come `v1-cap6-primo-circuito` e `v3-cap6-led-blink`.
- Quindi Nanobot non e' sorgente affidabile per ID/curriculum Tea 94. Va usato per pattern di policy/router, non come catalogo.

## Stato UNLIM

UNLIM e' migliorato con shared state store e `AgentDecision` JSON seed, ma resta ancora orchestratore ibrido. Non e' ancora un agente tool-native pienamente parallelo con verifier hard dopo ogni azione.

