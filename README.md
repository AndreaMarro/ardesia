# Ardesia

Lavagna locale e memoria della lezione, con Studio web, motore didattico e strumenti di sviluppo nello stesso monorepo. La visione di prodotto e le funzionalità effettivamente integrate sono documentate separatamente.

## Stato al 16 ottobre 2026

Il main di riferimento è `b124eee04acc8062c27284f23c5d9108e3767c27`. I sei candidati recuperati durante il lavoro del 16 ottobre sono pubblicati nei rami `archive/goal-closeout-20261016/*` e archiviati senza integrazione in main. La PR262 è chiusa senza merge: i check erano verdi, ma mancava la review umana richiesta. Non è stato eseguito un deploy.

La [consegna del 16 ottobre](docs/ops/CONSEGNA-2026-10-16.md) contiene SHA, capacità, verifiche, esempi sintetici, limiti e decisioni di chiusura. Il [manifest di consegna](docs/evidence/2026-10-16/closeout.json) inventaria le prove. Questa è una consegna di codice conservato e documentazione; non una release del prodotto completo.

Lo stato corrente si rigenera con:

```sh
python3 bin/state/project_state.py
```

Il comando produce `docs/ops/CURRENT.md` e `artifacts/state/project.json`, entrambi derivati. Le copie datate nella consegna sono ricevute storiche; non sostituiscono una nuova misura.

## Struttura

| Percorso | Ruolo |
|---|---|
| `apps/studio/` | Lavagna React/TypeScript/Vite con Excalidraw, journal, ToolHost e consumer della memoria. |
| `packages/engine/` | Engine Python: ingest, archivi, proiezioni didattiche, retrieval e servizi headless. |
| `plugins/` e `packs/` | Strumenti e contenuti specialistici già presenti; non equivalgono a plugin interamente disaccoppiati o certificati. |
| `ops/` e `bin/` | Fabbrica, verifiche e strumenti operativi. |
| `docs/` | Contratti, governance e ricevute datate. |

L'orientamento storico è nella [mappa](docs/vault/ARDESIA-MAP.md). Il [canon index](docs/CANON-INDEX.md) conserva i contratti: le fotografie del 2026 vanno lette con la propria data, non come misure attuali.

## Avvio e verifiche dal checkout

Studio:

```sh
cd apps/studio
npm ci
npm run dev
```

Verifiche Studio, dalla sua directory:

```sh
npm run typecheck
npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm run build
```

Engine, dalla radice del monorepo, con test live esclusi tramite le chiavi assenti:

```sh
(cd packages/engine && env -u OPENAI_API_KEY -u KIMI_API_KEY -u DEEPSEEK_API_KEY uv run pytest -q -rs)
```

Il gate Studio originale comprende il replay browser. Il gate Engine storico punta a `~/lessonos`: per un checkout del monorepo si usa il comando pytest sopra nella directory corretta. I gate originali non sono stati modificati. Gli skip live e le dipendenze opzionali mancanti sono dichiarati nei receipt, non trasformati in PASS.

## Persistenza, materiale e limiti

Un archivio vuoto, un errore di lettura e dati danneggiati sono esiti diversi. Il candidato storage ne preserva la distinzione; il reader limitato e la pubblicazione atomica del re-ingest sono candidati separati. Le loro prove non attestano una composizione già integrata.

Il candidato del materiale chiuso usa una sola cattura di appunti, eventi canonici e bundle: anteprima, HTML e download si riferiscono a quella cattura. Il percorso reale docente–destinatario e il PDF sono provati sul commit dichiarato nella consegna. Le figure restano omesse esplicitamente dall'HTML e conservate nel file lezione; la fixture finale non esercita formule. Il verticale completo con Kirchhoff e il pilot umano restano non attestati.

Un hash prova l'integrità dei byte, non identità dell'autore, consenso o correttezza scientifica. Le parti dell'Engine con provider LLM esistenti e il vincolo storico ZERO-LLM richiedono ancora una decisione del proprietario: questa consegna non dichiara l'intera pipeline ZERO-LLM. È conservato anche l'incidente del run atomic con richieste provider involontarie e costo non disponibile.

## Visione e invarianti

Marketplace, AI metodologica e modello SaaS/70-30 appartengono alla visione ratificata; la loro presenza nei documenti non certifica una consegna completa o un servizio commerciale attivo. Fabbrica e prodotto restano distinti. Dati reali di studenti, audio, corpus e segreti restano fuori da repository e CI; gli esempi di questa consegna sono sintetici. Privacy, consenso, soglie, definizione di Verified e protezioni di main restano invariati.
