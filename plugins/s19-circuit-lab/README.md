# S19 — laboratorio DC di Ardesia

Capacità specialistica montabile, senza login, database, memoria della persona o solver propri. Kirchhoff è installato da Git a commit verificato; la rete editabile usa React Flow. Il modello Core preesistente `dc-resistance-v1` resta distinto.

## Preparazione riproducibile

Dalla root del monorepo, con Python3.13, uv, Node e npm disponibili:

```sh
uv venv --python 3.13 work/s19-env
uv pip install --python work/s19-env/bin/python --require-hashes -r plugins/s19-circuit-lab/requirements-dev.lock
python3 plugins/s19-circuit-lab/scripts/install_engine.py --cache work/kirchhoff-s19 --python "$PWD/work/s19-env/bin/python"
uv pip install --python work/s19-env/bin/python --no-deps -e plugins/s19-circuit-lab
npm --prefix plugins/s19-circuit-lab/web ci --ignore-scripts --workspaces=false
npm --prefix plugins/s19-circuit-lab/web run build
```

`engine.lock.json` fissa il donor; lo script non resetta un checkout sporco o differente. La forma editable è intenzionale: il build hook della wheel upstream richiede la MCP App compilata, non necessaria a questa capacità.

## Consumer e integrazione

`CircuitLab({editionId, request, resourceId?, onResource?})` è il consumer React. `request` riceve percorsi relativi a `/study`, corpo e idempotency key. L'host mantiene il ciclo di sessione e deve smontare/remontare il consumer al cambio di identità; i401 cancellano comunque i dati privati anche dopo un edit concorrente. Il punto d'ingresso diretto riusa `apps/studio/src/study/apiClient` e `sessionBoundary`, con controllo dell'identità al ritorno in primo piano.

`install(app,store_dependency,authenticate)` riceve le autorità dell'host. Il mount sorgente è `/s19/circuit-lab/`, prima del catch-all statico; `/study/s19/circuits` espone solve/save/reopen/submit/export. Nessuna route di autenticazione aggiuntiva.

Le patch sotto `handoffs/swarm-v2/S19` sono da applicare esclusivamente da S00 nella stessa PR: catalogo/installer, idempotenza opzionale di `context.revise_resource`, link dalla pagina Corsi. Gli originali condivisi non sono modificati da questo stream. Il comando idempotente usa soltanto `execute_command` e le ricevute Core esistenti, mantenendo il percorso storico senza key e la CAS.

Risorsa privata `kind=s19-circuit`, documento `s19-circuit.v1`: R/V/I con valori SI esatti, domanda corrente/tensione, previsione, StudentTrace, note e layout. Nessuna risposta salvata come autorità. Modifiche fisiche invalidano i risultati; la riapertura ricalcola, oppure conserva input/note e dichiara UNAVAILABLE se il motore fissato non è disponibile. La consegna ricalcola da resourceId/revisionId e crea una ricevuta Core. La review segue il percorso LessonOS già esistente.

L'attività `s19-kirchhoff-dc-v1` è di procedimento; il pack DRAFT ha `entryActivityId=null`, così il dispatcher numerico legacy non assume una capacità che non possiede. Non è un nuovo grader comune. L'apertura del laboratorio usa il link specialistico del consumer.

## Verifica

```sh
work/s19-env/bin/python -m pytest plugins/s19-circuit-lab/tests
npm --prefix plugins/s19-circuit-lab/web run build -- --mode test
# Una sola finestra browser per il mini8GiB; richiede porta5198 libera.
S19_PYTHON="$PWD/work/s19-env/bin/python" plugins/s19-circuit-lab/scripts/run_browser.sh
python3 plugins/s19-circuit-lab/scripts/audit_dependencies.py --check
```

La build `--mode test` aggiunge un host fixture per verificare il componente controllato senza eventi del punto d'ingresso. La build normale esclude tale fixture. Il runner usa DB e sessioni sintetici temporanei, termina solo il proprio server e non cambia soglie o servizi remoti.

SPICE DC e CircuitikZ delegano agli exporter upstream e mantengono i relativi rifiuti, incluse frazioni periodiche non esportabili esattamente in SPICE. JSON importa solo input validati. AC/Laplace, ToolHost firmato, rilascio pubblico e revisione scientifica umana sono fuori da questa tranche. Provenienza e limiti: `handoffs/swarm-v2/S19/ACQUISITION_PACKET.md`.

Il codice Python del motore viene caricato dai byte verificati contro i Gitblob della revisione e congelati in memoria, senza usare le cache `.pyc`. Un import precedente fuori da questo confine richiede riavvio; SourceSnapshot da solo non garantiva questo legame. La controprova sul package installato è in test_loaded_source.py e ACQUISITION_PACKET.
