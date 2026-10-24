# Validazione e attribuzione delle prove

Base `ae25b93bec826539940e0226da1f0cd8cebff0b1` più diff identificato nei manifest. macOS arm64; Web Node26.5.1/npm11.17.0 come CI, Studio Node22.14.0/npm10.9.2 con lock esistente; Python3.13 tramite uv e lock API/Engine. Nessuna credenziale provider ereditata nei test Python; test live richiedono opt-in e non sono stati autorizzati.

| Prova | Risultato osservato | Fonte / confine |
| --- | --- | --- |
| Catalogo originale | 4 PASS; CI storico non riprodotto identicamente | `evidence/catalog/original-focused.log` |
| Controprova listener e fix | RED→5 PASS, `getByRole` conservato | `evidence/catalog/diagnosis.md` |
| Studio completo deterministico | 2.232 PASS, 5 SKIP storici; 202 file PASS/1 SKIP | `evidence/validation/studio-test.log`, 400,26s |
| Gate Studio congelato | 2.233 PASS, 0 FAIL, exit0; include kill-test replay browser | `studio-frozen-gate.log`, `studio-frozen-replay.log`; script invariato, PATH Homebrew Node26.5.1 |
| Studio typecheck/build | PASS; warning chunk>500kB conservato | `studio-typecheck.log`, `studio-build.log` |
| Web completo finale | 299 PASS, 43 file, 65,94s; typecheck/build PASS | `web-test.log`, `web-typecheck.log`, `web-build.log`; Node26.5.1, un worker |
| Engine completo finale | 2.628 PASS, 27 SKIP, 129,87s | `engine-test.log`; ambiente provider vuoto, opt-in live assente |
| MCP quattro letture | 23 PASS, SDK ufficiale stdio→HTTP/Core/SQLite | `study-mcp.log`, 37,68s; niente writer nuovo |
| Review audio indipendente | 14 PASS dopo i RED conservati | `evidence/review/independent-review.md` |
| Core/API completo locale | 851 PASS, 30 SKIP espliciti, 1 warning | `core-api.log`; successivo fix budget/porta verificato con 8 test mirati, non riscritto come un secondo full run |
| Browser Studio finale | 20/20 PASS | `evidence/browser/final/result.json`; source-before=after |
| Browser Poiseuille finale | 20/20 PASS | `evidence/poiseuille/browser-final/result.json`; source-before=after su586file |
| REA e oracolo | Due Evidence reali, 18/18 asserzioni offline | `evidence/rea/README.md`; costi totali non misurati integralmente |

Il profilo Studio è quello di AGENTS: `--pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000`. I cinque skip dipendono dal corpus screenshot storico assente; nessuno è stato aggiunto per questo incremento. Gli skip Core/API indicano contratti PostgreSQL/Supabase live non configurati: non attestano quel backend. I 27 skip Engine comprendono inoltre provider live senza opt-in/chiavi, corpus reale e checkout legacy assenti; il dettaglio `-rs` è conservato.

## Risultati negativi preservati

Il full Web originale prima degli edit ha 285 PASS/9 FAIL, catalogo PASS. La prima invocazione root del full candidato perde le opzioni attraverso lo script npm annidato e parte con il profilo default: 296 PASS/3 FAIL. Il successivo comando corretto `npm exec --workspace @ardesia/web -- vitest run --maxWorkers=1 --no-file-parallelism` ha 298 PASS/1 FAIL in `session-boundary.test.tsx`, al caricamento iniziale della vista prima del401. Questi run non sono cancellati da un focused successivo: la diagnosi mirata è conservata in `evidence/review/session-boundary/`.

La review conserva i RED su errori del recorder, import/revoca concorrenti, revisione falsificata, avvio/CAS e limite delle fonti. Una fixture prodotta durante lo sviluppo prima del bump reader2 è stata correttamente rifiutata dal consumer finale: il run episodio5 è fallito per contratto del bundle, non per lentezza. I fallimenti intermedi dei runner browser per locator troppo stretti e ArrayBuffer trasferito dal decoder sono distinti da difetti di prodotto; vedi `evidence/poiseuille/README.md`.

L'ispezione del primo screenshot Studio390px ha rilevato testo tagliato dalle metriche del font fallback. La nuova annotazione attende il caricamento dei font tramite l'exporter pubblico prima della misura; il nuovo screenshot mostra il testo completo. I font provengono dalla dipendenza bloccata dal lock e sono serviti localmente da Vite/build, senza CDN. La cartella `before-font-fix` conserva la controprova visiva.

Le tracce originali Playwright restano nel workspace di lavoro: possono contenere header di sessioni sintetiche. Nel repository sono conservati screenshot, risultati, manifest e copie sanificate ove presenti; nessun cookie reale, dato studente o corpus privato è pubblicato. Le copie sanificate dichiarano la trasformazione e non si spacciano per gli originali.

Il wrapper storico `apps/studio/bin/review.sh` punta a `~/lessonos/bin/review.sh`, assente su questo host. La review corrente è quella dell'agente indipendente sul checkout reale, con test avversariali e hash; non è attribuita al wrapper mai eseguito.

## Attribuzione al candidato e comandi

[Manifest sorgenti finale](evidence/validation/source-manifest.json): 678 file, aggregato SHA-256 `426d2e5b9c4d06c426c3c2cf6459b1de18754d9cb4109a04fa83ecf24a7d95eb`. Il confronto con i379file del browser Studio non trova differenze. Nei586file del browser Poiseuille cambia soltanto il setup del test `session-boundary.test.tsx`; tutti i file runtime confrontati sono identici. Le prove browser non vengono presentate come nuove esecuzioni dopo quell'edit.

La controprova di readiness Web mantiene import reale e tutte le asserzioni originali di privacy: la query falliva prima di esercitare401 quando Work era ancora in caricamento. Il setup ora attende quel modulo; timeout, mock e comportamento auth non cambiano. I risultati precedenti restano nel paragrafo negativo e nei log.

Comandi eseguiti dalla root (le suite Python sono state avviate con `env -i` e allowlist PATH/HOME/TMPDIR e soli path di test):

```sh
PATH=/opt/homebrew/bin:$PATH npm exec --workspace @ardesia/web -- vitest run --maxWorkers=1 --no-file-parallelism
npm run typecheck:web
npm run build:web
npm --prefix apps/studio run typecheck
npm --prefix apps/studio run build
(cd apps/studio && npx vitest run --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000)
(cd apps/studio && bash eval/gate.sh)
(cd packages/engine && .venv/bin/python -m pytest -q -rs)
PYTHONPATH=packages/engine:services/study-api services/study-api/.venv/bin/python -m pytest packages/engine/tests/study services/study-api/tests -q -rs
PYTHONPATH=services/study-mcp ARDESIA_MCP_TEST_API_PYTHON=$PWD/services/study-api/.venv/bin/python ../study-mcp-check/bin/python -m unittest discover -s services/study-mcp/tests -v
python3 docs/deliveries/2026-10-24-audio-v2/evidence/rea/verify_rea.py
```

L'ambiente MCP separato è stato creato con Python3.13 e `services/study-mcp/requirements.lock`, come CI. I log leggibili normalizzano solo whitespace finale: gli originali interessati sono conservati compressi con hash in [log-normalization.json](evidence/validation/log-normalization.json). Nessun risultato negativo viene rimosso. [Verifica privacy indipendente](evidence/validation/trace-privacy-verification.json): sette ZIP e14valori di token sintetici confrontati, zero corrispondenze residue.

La CI remota deve essere riletta sulla head effettiva della draft; i suoi URL e lo SHA sono riportati nella PR e nella consegna finale. Le CI verdi di #297 non attestano questo incremento. Nessun merge o deployment viene eseguito.
