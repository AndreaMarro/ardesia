# Audit tecnico di convergenza — 25 ottobre 2026

Base immutabile: `1898b633e26f99710535c94e25fa28241f0f45b3` (#304). L'integratore ha poi verificato il tree di merge main `b124eee0` + #304: `87357259b006fdbc0777915b8dd6c8d9acf48b66`, identico al tree #304. Le misure descrivono quel pin, prima delle correzioni audio e DOMPurify. Nessuna autorità, database, solver o registro nuovo è necessario per il consolidamento.

## Esito e priorità

| Priorità | Evidenza | Azione |
|---|---|---|
| P1, corretto nella slice assegnata | Studio forza DOMPurify 3.4.11 tramite override, Web usa già 3.4.17. La dipendenza vecchia conserva marker template e handler in due scenari dell'advisory. | Solo override/lock a 3.4.17 e tre test comportamentali; nessun aggiornamento generale. |
| P1, da valutare dopo audio | Study API blocca pypdf 6.21.1; tre advisory pubblicati richiedono 6.21.2. `validate_asset` e scientific notebook leggono PDF dell'utente. I limiti di byte/pagine non limitano il lavoro necessario per scoprirle. | Valutazione patch circoscritta con test PDF avversariali; nessun file Python modificato qui. |
| P2, debito misurato | Nessun ciclo eager Python o runtime TS/JS; restano accoppiamenti differiti/type-only, 33 import Web→Studio e helper duplicati piccoli. | Conservare confini e registrare il baseline, evitare estrazioni di package astratte durante la chiusura PR. |
| P2, candidato da verificare | `mathjax-full` è dichiarato in Studio ma non importato dai sorgenti; la conversione usa il CDN MathJax, esplicitato anche in AGENTS. | Verificare build/distribuzione e rimuovere in una slice successiva se confermato; assenza di import non è prova universale di inutilizzo. |
| P2, processo | Nessun template PR/gate root equivalente per owner/criterio/verifiche/dipendenze/rischio. I gate applicativi e di sicurezza già esistono. | Piccolo gate metadati come precondizione della review; non attestare test eseguiti o merge da un testo. |

Il P0 audio è gestito dall'altro agente e dall'integratore; questo audit non ne anticipa il verdetto. La severità di un pacchetto non è una prova di exploit nel prodotto.

## Misure riproducibili

Parser: TypeScript 6.0.2; Node 26.5.1 nel run finale. Python AST stdlib 3.14.6. Nessun parser nuovo installato. Tarjan sugli import risolti, distinguendo type-only TS e TYPE_CHECKING/local import Python.

Perimetro TS/JS: `apps/studio/{src,plugins,sim}`, `apps/web/src`, `plugins/elab-tutor/src`, `packs/*`, esclusi test/fixture e copie vendored `apps/studio/sim/solver/{engine,components}`. Le alias Vite `@elab-tutor-plugin` e `@elab-pack` sono risolte. Include il legacy ELAB: non significa che ogni suo file venga caricato dalla route prodotto.

| Misura | Risultato sul pin |
|---|---:|
| File TS/JS analizzati complessivi / perimetro prodotto+specialist | 1.821 / 677 |
| Import TS/JS risolti nel perimetro, runtime / type-only | 1.399 / 269 |
| SCC TS/JS runtime / includendo type-only | 0 / 5 |
| File Python analizzati complessivi / dominio/API/MCP/entitlement | 560 / 148 |
| Import Python nel perimetro eager / locali differiti / TYPE_CHECKING | 401 / 104 / 1 |
| SCC Python eager / includendo locali differiti | 0 / 2 |
| Errori di parsing TS/JS e Python | 0 / 0 |
| Gruppi di corpi funzione TS/JS identici, almeno 100 token | 15 |
| Gruppi TS/JS con identificatori normalizzati, almeno 100 token | 21, comprendono i 15 esatti |
| Corpi Python duplicati esatti, almeno 40 nodi AST | 0 |
| File sorgente prodotto identici esatti | 1 coppia, pannelli Galileo/Unlim legacy |
| Fixture testuali tracciate in directory fixture/fixtures / duplicati di file esatti | 47 / 0 |

I cinque SCC TS diventano cicli solo aggiungendo import di tipi: gruppo audio/journal/store/bundle; contracts↔postit; eventEnvelope↔eventlog; manualConfig↔manualRegistry; ToolCanvasEmbeddable↔elabSceneBridge. Non sono cinque cicli di inizializzazione runtime.

I due SCC Python compaiono aggiungendo import locali a funzione: otto moduli Study (`assets`, `context`, `feedback`, `schema_contract`, `scientific_notebook`, `store`, `transactions`, `uploads`) e `exam`↔`exam_bank`. Sono accoppiamenti di dominio differiti, non un ciclo eager al caricamento; non provano da soli un difetto funzionale.

I duplicati esatti TS prevalgono nel legacy Galileo/Unlim. Nel consumer corrente emergono `deepFreeze` in continuityRuntime/indexedDbEventLog (136 token) e una callback del wire editor/placement adapter (105 token). Il confronto normalizzato individua sei gruppi ulteriori come proxy, ad esempio boundsFromPoints/unionBounds: la somiglianza non prova equivalenza, bug o opportunità di unificare. I 47 file fixture non includono literal in test TS/Python o asset binari.

## Autorità e contratti già presenti

| Ambito | Autorità/consumer da riusare |
|---|---|
| Comandi, auth, edizioni, ricevute e review | `lessonos/study/store.py`, `models.py`, `transactions.py`, `submissions.py`, `feedback.py`; HTTP Study API; MCP come adapter |
| Esercizi e calcolo deterministico | `activities.py`, `quantity.py`, `taylor.py`, `exam.py`, `question_bank.py`; `coursepack.py` e `learning_experiences.py` versionano dati e composizione |
| Persistenza e provider | SQLite e `postgres.py` sul medesimo dominio; `schema_contract.py`; BlobRepository con adapter, nessuna scrittura DB indipendente nei plugin |
| Identità locale/media/replay | WorkspaceStore, room/session paths, session contracts, JournalRecorder e lessonBundle; EventEnvelopeV2 con decoder esplicito |
| Errori | Core `StudyError(code,status)` → handler HTTP → client condiviso `StudyApiError`; non creare un secondo catalogo di policy negli adapter |
| Formati pubblici e MCP | Study contracts TS, scientific notebook snapshot/portable decoder; MCP StrictInput/CoreDTO/Envelope `ardesia.mcp.read/1` |
| Plugin/Pack | ToolHost protocol/manifest/capabilities/version parser già presenti; dati Pack separati e consumer reali |

Ci sono DTO e validazioni in più linguaggi perché attraversano un confine di fiducia: la presenza non prova una duplicazione di autorità. La possibile deriva wire va falsificata con contratti negativi su versione/campi ignoti e con i consumer; non richiede un nuovo Core.

## Dipendenze effettive

Sono stati letti i lock Git, non stimate dipendenze dal solo manifest. `npm audit --json --package-lock-only --ignore-scripts`, anche con `--omit=dev`, è stato eseguito su copie isolate di tutti i sette lock npm; hash dei lock invariati dopo l'audit.

| Lock | Tutte / produzione | Critical produzione prima della patch |
|---|---:|---:|
| root, workspace Web | 3 / 0 | 0 |
| Studio | 21 / 12 | 1 |
| ops/tools | 0 / 0 | 0 |
| ELAB legacy | 27 / 10 | 1 |
| galileo-mcp legacy | 11 / 11 | 1 |
| cloud-compile legacy | 4 / 4 | 1 |
| server-data legacy | 3 / 3 | 1 |

I conteggi npm sono pacchetti segnalati, non advisory indipendenti né exploit; non sommarli tra lock come vulnerabilità uniche. Studio ha 30 nomi con più versioni transitive, Web 2: sono installazioni separate intenzionali, non automaticamente duplicati da fondere.

Sono state interrogate 28 schede registry per 41 dichiarazioni dirette Web/Studio: 33 lock differiscono da latest. Questo misura distanza dal registry, non obsolescenza incompatibile né ragione per aggiornare major. `npm outdated` su copie senza node_modules non mostrava `current`: quel risultato è stato scartato come misura insufficiente.

Per Python sono state interrogate 90 coppie nome/versione effettive dei tre uv.lock e requirements.lock MCP: 90 risposte riuscite. Il report conserva solo ID/alias/fix/link degli advisory. I record PYSEC e GHSA con gli stessi alias vanno deduplicati. MCP non riceve segnalazioni; Engine/entitlement contengono anche dipendenze legacy non tutte caricate dall'API. Nessun lock Python è stato aggiornato.

Pillow 12.3.0 ha advisory pubblicati con patch 13.0.0, fuori dal vincolo corrente `<13`: serve triage per formato/decoder prima di una migrazione major. Il critical FlashPix richiede la dipendenza opzionale `olefile`, assente nei lock ispezionati. Il controllo MIME avviene dopo Image.open; non è una prova di exploit riuscito. Certifi Study API 2026.10.18 cade nel range dichiarato da uno scanner, ma il testo primario spiega che tale release aveva già rimosso le root compromesse: non trasformare il solo range in un claim di compromissione.

Fonti primarie: [DOMPurify shadow root](https://github.com/advisories/GHSA-cg2g-xh64-v4q7), [DOMPurify hook](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr), [pypdf](https://github.com/py-pdf/pypdf/security/advisories/GHSA-6c7f-9265-g8fw), [Pillow FPX](https://github.com/python-pillow/Pillow/security/advisories/GHSA-5x8w-8jj5-q52h), [certifi](https://github.com/advisories/GHSA-6q48-6c7w-9gw2).

## Delta DOMPurify consegnato

Ownership assegnata e limitata a tre file: `apps/studio/package.json`, `apps/studio/package-lock.json`, `apps/studio/src/__tests__/DOMPurifySecurity.test.ts`. Solo override 3.4.11→3.4.17 e relativo nodo lock (version/resolved/integrity); install senza script, nessun audit fix, nessun altro package aggiornato.

Il percorso reale individuato è Room→Excalidraw→paste Mermaid→parser/sanitizer di Mermaid. Il percorso passa stringhe e SVG, non la combinazione shadow root/SAFE_FOR_TEMPLATES/DOM-return/downstream template evaluator richiesta dal critical. La patch corregge il contratto della dipendenza; non viene rivendicato un exploit attraverso l'interfaccia Ardesia.

Prove: RED 2 assertion failure attese (marker template e onerror conservati) + 1 compatibilità Mermaid PASS; GREEN 3/3; typecheck Studio PASS; diff whitespace PASS. Prima typecheck ha trovato l'API Mermaid `DiagramDB.getVertices` non tipata: introdotta verifica runtime della capability nel test e ripetuto typecheck/test. Il test non esegue marker, handler, eval o richieste di risorse.

Audit produzione Studio dopo patch: 11 segnalazioni (0 critical, 8 high, 2 moderate, 1 low), DOMPurify non elencato. La suite estesa e la review del delta sono responsabilità dell'integratore sul candidato composto; non sono state lanciate in parallelo qui.

## DoD: proposta al root, non implementata qui

Confermati i gate esistenti: web typecheck/test/build e browser pubblico/API reale; Study API/Core, MCP SDK/HTTP, Studio/Engine; NUL/segreti/boundary/workflow trigger/doc claims/project state/whitespace; local_checks e floor. Nessun equivalente root al piccolo controllo metadati proposto.

Tre file più wiring nel workflow esistente: template PR, parser stdlib `bin/ci/pr_contract_gate.py`, test del parser. Un blocco JSON con `owner`, `acceptance`, `verification` (command/evidence), `depends_on` (PR/reason oppure array vuoto), `risk`. Rifiutare assenza/malformed/chiavi duplicate/tipi errati/placeholder/self-dependency. Leggere solo GITHUB_EVENT_PATH; niente esecuzione di command, nessuna API o scrittura, nessuno stato MERGED/PASS inferito dal testo. Il controllo garantisce metadati reviewable, non il completamento sostanziale. Gli eventi pull_request devono includere edited e ready_for_review; push main ha uno skip metadati esplicito e mantiene tutti i gate applicativi. Test con eventi temporanei validi/invalidi e comando volutamente inerte/non eseguito.

Branch protection, review indipendente e approvazione dell'ultimo push restano autorità GitHub. Nessun bypass o indebolimento è stato eseguito.

## Riproduzione

Script e raw audit sono nella directory `architecture`: `export_pinned.py`, `audit_js.mjs`, `audit_python.py`, `audit_dependencies.py`, `audit_registry.py`. Output dei primi quattro: snapshot sorgenti, dettagli graph/fingerprint, audit lock JSON. L'ultimo legge Git direttamente e interroga i registry. Eseguire in una directory output sotto `/private/tmp`, per evitare i timeout FileProvider riscontrati ripetutamente leggendo gli artifact grandi in Documents.

```sh
python3 export_pinned.py /private/tmp/ardesia-r2-20261024 1898b633e26f99710535c94e25fa28241f0f45b3 /private/tmp/ardesia-audit-repro
node audit_js.mjs /private/tmp/ardesia-audit-repro/sources.json /private/tmp/ardesia-audit-repro/js-analysis.json /private/tmp/ardesia-r2-20261024/node_modules/typescript
python3 audit_python.py /private/tmp/ardesia-audit-repro/sources.json /private/tmp/ardesia-audit-repro/python-analysis.json
python3 audit_dependencies.py /private/tmp/ardesia-audit-repro
python3 audit_registry.py /private/tmp/ardesia-audit-repro /private/tmp/ardesia-r2-20261024 1898b633e26f99710535c94e25fa28241f0f45b3
```

Limiti: import calcolati dinamicamente non risolti, grafo statico non equivalente a reachability del bundle, alias esplicite e sole estensioni supportate, soglie duplicazione dichiarate, freshness advisory legata al giorno di esecuzione. Proxy normalizzato e conteggi di throw/version literal non costituiscono duplicazioni funzionali certificate. Nessun carico, dispositivo, accesso multiutente remoto, inferenza didattica o release è certificato da questo audit.
