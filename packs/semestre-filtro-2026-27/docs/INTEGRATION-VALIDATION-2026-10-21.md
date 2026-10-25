# Verifica dell’integrazione della banca di Fisica

Data della verifica: 21 ottobre 2026. Questa verifica riguarda codice, controlli di accesso, caricamento, correzione deterministica e lettore web. **Non costituisce revisione scientifica umana dei 4000 quesiti.**

## Esiti dei gate eseguiti

| Controllo | Esito osservato | Dettaglio |
|---|---|---|
| Suite completa Python engine e study-api | PASS | 2738 passati, 27 saltati, zero falliti, zero errori; 98,06 s |
| Suite completa web | PASS | 32 file, 243 test passati |
| Typecheck web | PASS | `tsc -b --noEmit`, uscita 0 |
| Build web | PASS | `tsc -b && vite build`, uscita 0 |
| Test specifici del caricatore, cache e sampler | PASS | 29 test, inclusi nella suite completa |
| Test HTTP della banca | PASS | 3 test, inclusi nella suite completa |
| Test del lettore web della banca | PASS | 4 test, inclusi nella suite completa |
| Corpus definitivo attraverso il runtime | PASS | 4000 chiavi canoniche, 4000 proiezioni, 40 pagine e 100 prove di allenamento verificate |
| Wheel finale engine | PASS | Manifest, schema e tutti i 27 shard presenti; checksum verificati e import runtime eseguito dal wheel estratto |
| Wrapper storico `eval/gate.sh` | NOT_RUN | Contiene un `cd` hardcoded verso un altro checkout; la suite completa è stata eseguita direttamente nel checkout corrente |
| Review tramite CLI Claude del wrapper `bin/review.sh` | NOT_RUN | I CLI `claude`, `codex` e `gemini` non sono disponibili; non sono state create credenziali né eseguiti fallback con provider |
| Deploy, merge o verifica in produzione | NOT_RUN | Non fanno parte di questa verifica locale |
| Approvazione scientifica umana | NOT_RUN | Tutti i record mantengono `DRAFT` e `reviewer: null` |

### Comando Python riproducibile

Eseguire dalla directory `packages/engine`, con le dipendenze dichiarate in `pyproject.toml` e le dipendenze study-api installate nell’ambiente di verifica:

```bash
PYTHONPATH="$PWD:$PWD/../../services/study-api" python -m pytest -q \
  tests ../../services/study-api/tests
```

La verifica registrata ha usato Python 3.12 in un ambiente virtuale temporaneo. Le librerie scientifiche del generatore non sono aggiunte alle dipendenze runtime della banca. Il corpus espanso è letto come JSON; la correzione utilizza frazioni esatte e alias approvati senza valutazione di espressioni libere, chiamate LLM o rete.

I 27 test saltati sono espliciti e non vengono conteggiati come passati:

| Motivo | Numero |
|---|---:|
| Contratti live Supabase senza ambiente locale fornito | 18 |
| Valutazioni live DeepSeek/Kimi senza chiavi | 4 |
| Checkout canonico separato LessonOS assente | 2 |
| Filesystem sensibile a maiuscole/minuscole | 1 |
| Filesystem sensibile alla normalizzazione Unicode | 1 |
| Corpus reale delle dispense presente soltanto sul Mini | 1 |

Le tre segnalazioni pytest riguardano fixture di classe già esistenti e una deprecazione prevista per pytest 10. Il build web segnala chunk PDF/MathLive superiori alla soglia di avviso; questo non interrompe il build.

La prima passata, avviata dalla root del monorepo, aveva 16 fallimenti ambientali: 14 fixture relative al cwd e due import della dipendenza dichiarata `faster-whisper` non ancora installata nel venv temporaneo. Correggendo il cwd e completando quell’ambiente, la suite completa è risultata verde. Non sono stati modificati test o criteri di accettazione per ottenere l’esito.

## Invarianti verificate dai test della nuova integrazione

Le richieste ricontrollano autenticazione e appartenenza all’edizione prima di accedere alla cache di contenuti. Sono verificati rifiuto degli accessi a edizioni non autorizzate, revoca dell’appartenenza anche dopo il primo caricamento, segregazione fra Fisica e altri corsi, risposta priva di chiavi e soluzioni prima del tentativo, rifiuto di campi di autorità aggiuntivi nel body e assenza di modifiche ai binding SHA dei CoursePack preesistenti.

La cache conserva al massimo uno snapshot immutabile per processo. Il controllo del manifest e di ogni shard include percorso risolto, dimensione, timestamp di modifica e cambiamento e identità del file. Un cambiamento invalida lo snapshot e richiede nuovamente tutti i checksum SHA-256. I test coprono anche una modifica di shard della stessa lunghezza con `mtime` ripristinato, modifiche del manifest, mancata corrispondenza del pin e copie pubbliche modificabili senza alterare il contenuto condiviso.

Il profilo 2026 seleziona 21 quesiti a scelta multipla e 10 completamenti, rispetta il vincolo di una sola `lawFamily` per simulazione ed esclude gli approfondimenti `provided_law_extension`. La copertura delle sette unità è una strategia editoriale dichiarata; i metadati indicano ciò che la selezione ha effettivamente coperto e non inventano quote ministeriali. Il profilo storico conserva 15 scelte multiple e 16 completamenti in 45 minuti.

La correzione accetta numeri decimali, virgola decimale, frazioni equivalenti e notazione scientifica entro limiti espliciti. Le espressioni arbitrarie non vengono eseguite. Le risposte simboliche sono confrontate solo con alias approvati e mantengono distinta la maiuscola dalla minuscola. Le prove UI coprono apertura, ricerca, risposta e svolgimento completo, incluse le modalità scelta multipla e completamento.

## Corpus definitivo e distribuzione

Il corpus verificato ha SHA-256 del manifest `15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`. I risultati macchina sono in `RUNTIME-CORPUS-VALIDATION-2026-10-21.json` e `PACKAGING-VALIDATION-2026-10-21.json`, accanto a questo documento.

Sono stati caricati tutti i **4000 record**, esattamente **1000 per livello**. I 27 shard occupano 53.236.609 byte; il più grande misura 2.347.465 byte, entro il limite runtime di 32 MiB per shard. La banca contiene 2537 scelte multiple, 1463 completamenti e 212 famiglie di legge. Il perimetro è dichiarato: 3821 quesiti `syllabus_core` e 179 approfondimenti `provided_law_extension`.

Per ogni record sono stati verificati la proiezione studente e il riconoscimento della risposta canonica da parte del correttore effettivo. Tutte le 4000 risposte canoniche ottengono esito corretto e punteggio +1; i 4000 svolgimenti restituiti corrispondono integralmente a quelli del corpus. La proiezione non contiene campi di chiave, soluzione o verifica. La navigazione in 40 pagine da 100 recupera ogni ID una sola volta e nell’ordine previsto.

Sono state generate **100 prove**: due profili, cinque selezioni di difficoltà (le quattro singole e la miscela) e dieci seed per combinazione. Ogni prova contiene 31 quesiti, la ripartizione di formati del proprio profilo e 31 famiglie di legge distinte. Tutte le 50 prove 2026 contengono esclusivamente quesiti core e almeno un quesito per ciascuna delle sette unità. Il profilo storico conserva 15 scelte multiple, 16 completamenti e 2700 secondi; il profilo 2026 conserva 21 scelte multiple, 10 completamenti e 3000 secondi. Dieci prove sono state rigenerate con identico seed e confrontate integralmente per verificare il determinismo.

| Misura locale | Risultato |
|---|---:|
| Primo caricamento con validazione completa | 0,853 s |
| Richiamo della snapshot in cache, media di 100 chiamate | 1,468 ms |
| Richiamo della snapshot in cache, massimo osservato | 5,599 ms |
| Correzione delle 4000 chiavi e verifica delle proiezioni | 0,256 s |
| Navigazione completa in 40 pagine | 2,571 s |
| 100 prove più 10 rigenerazioni per determinismo | 3,442 s |
| Picco RSS del processo di verifica | 165120 KiB, circa 161 MiB |

Questi tempi descrivono una misurazione locale e non sono una garanzia di latenza in produzione. Il confronto delle chiavi con il correttore verifica la coerenza del formato e dell’integrazione; non dimostra, da solo, ogni premessa fisica dei quesiti.

Il wheel finale `lessonos-0.1.0-py3-none-any.whl` misura 3.746.907 byte. Il contenuto è stato ispezionato direttamente: manifest, schema e tutti i 27 shard sono presenti, ogni shard coincide con il checksum del manifest e i conteggi sommano a 4000. Successivamente il wheel è stato estratto in un percorso separato e il modulo importato da quel percorso: ha caricato 4000 quesiti e generato una prova da 31 con famiglie distinte. La configurazione Hatchling esistente include già i dati annidati, quindi non è stato necessario modificare il packaging. Il wheel non è stato pubblicato né distribuito in produzione.

## Pubblicazione GitHub e struttura degli strumenti editoriali

La consegna è pubblicata nella [pull request in bozza #270](https://github.com/AndreaMarro/ardesia/pull/270), sul ramo `codex/physics-bank-4000-20261021`, con base nel ramo minicorsi `codex/ardesia-public-rea-20261020`. La prima esecuzione GitHub Actions, [run 39559502608](https://github.com/AndreaMarro/ardesia/actions/runs/39559502608), ha superato tutti i sei job funzionali: engine, study-api, study-mcp, web, studio e golden path e2e advisory.

Il job hygiene si è fermato al controllo del confine ELAB: i percorsi `authoring` ricadevano nella regola esistente relativa ad `auth` sotto `packs/`. La struttura è stata riallineata al confine dichiarato dal progetto: i sei strumenti Python e le dipendenze editoriali sono in `bin/content/physics_bank/`; i quindici JSON di modelli, concetti e sostituzioni sono in `packs/semestre-filtro-2026-27/data/`; i due audit si chiamano `sources/model-audit-*.json`. I diciassette JSON spostati conservano esattamente i byte originali. Il gate e la sua baseline non sono stati modificati. Il controllo, ripetuto sull’index risultante, passa con gli stessi dodici elementi preesistenti nella baseline e nessun nuovo elemento.

Il controllo dell’intera differenza rispetto alla base ha inoltre individuato i terminatori CRLF del catalogo CSV. Sono stati uniformati a LF, configurando nello stesso modo il writer dell’assembler. Il confronto tramite parser CSV conferma le stesse 4.000 righe di dati e dodici colonne; la dimensione passa da 812.204 a 808.203 byte. Il controllo whitespace dell’intera consegna passa.

L’assembler eseguito dal nuovo percorso mantiene invariata la SHA-256 del manifest `15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`. Il validatore eseguito dal nuovo percorso supera nuovamente schema, proiezione e correzione di tutti i 4.000 record, le quote dei quattro livelli, i riferimenti ai 147 argomenti e ai 62 obiettivi storici e i campioni dei due profili d’esame. I gate workflow, doc claims e project state, con i relativi test e la verifica offline dell’HEAD reale, passano. Queste verifiche di struttura non modificano i quesiti, il runtime o gli esiti scientifici dichiarati sopra.

È stata infine eseguita una rigenerazione completa separata, con le versioni dichiarate di SymPy e jsonschema e quattro processi: `build_bank.py --expected 4000 --jobs 4 --output /tmp/ardesia-physics-relocation-build`. Risultato: zero errori, 4.000 quesiti e tutti i 27 shard identici byte per byte ai file già pubblicati, per complessivi 53.236.609 byte; anche l’elenco dei conteggi e degli hash coincide con il manifest. Le scansioni NUL e segreti e i tre test della scansione segreti passano sull’index completo. Non sono state aggiunte dipendenze al runtime.
