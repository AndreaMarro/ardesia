# LessonOS Core Engine

Engine headless Python del monorepo Ardesia: ingest, capsule, archivi SQLite e proiezioni didattiche. I contratti esistenti restano l'autorità; non viene introdotto un secondo solver o un nuovo formato universale.

## Esecuzione dei test

Dalla radice del monorepo:

```sh
(cd packages/engine && env -u OPENAI_API_KEY -u KIMI_API_KEY -u DEEPSEEK_API_KEY uv run pytest -q -rs)
```

La directory conta: i test leggono fixture relative al package. Le chiavi assenti lasciano i test provider live negli skip previsti, con ragione stampata. Il gate storico `packages/engine/eval/gate.sh` punta ancora a `~/lessonos`; non è stato modificato né usato per dichiarare verificato un altro checkout.

## Consegna del 16 ottobre 2026

Il [registro operativo](../../docs/ops/CONSEGNA-2026-10-16.md) documenta il reader limitato b9bff962 e il re-ingest atomico 6536991c. Sono pubblicati in rami di archivio e non integrati nel main. Il reader valida budget/inventario prima degli effetti; il re-ingest prepara fuori dallo store e pubblica segmenti/capsula con transazione breve e revisione CAS. I limiti sui getter separati, sulle proiezioni derivate e sulla durata fisica restano dichiarati.

Le verifiche del candidato atomic sono 2151 PASS/7 SKIP offline e 42 prove mirate. Un precedente run partito con chiavi ereditate ha eseguito richieste provider involontarie: numero e costo non sono disponibili. Il run offline successivo non cancella quell'incidente. La collisione tra percorsi narrativi LLM esistenti e policy ZERO-LLM resta una decisione del proprietario, non risolta da questa documentazione.
