# Prove REA — 24 ottobre 2026

Questa cartella conserva il run reale sul marketing originale di Ardesia, base `339ab08f4139da0b37e78bbde81e9fe4e83afea0`. **Analisi statica e otto azioni browser completate; dodici asserzioni indipendenti passano.** La prova verifica continuità del corso e separazione tra suggerimento, soluzione e spiegazione dell’errore. Non prova audio, valutazione delle risposte, persistenza dello studente o deployment pubblico.

## Contenuto e identità

| Reperto | Scopo |
|---|---|
| `rea-original-evidence.zip` | 40 file originali sotto `original/`, conservati senza modificarne i byte |
| `archive-manifest.json` | SHA256 dell’archivio, dimensione e SHA256 di ogni voce |
| `original-research-manifest.json` | Manifest originale della sessione, copiato senza modifica; i suoi percorsi si riferiscono alla radice storica `original/` dello ZIP |
| `marketing-experiment-verification.json` | Risultato originale: 12/12 verifiche |
| `marketing-static-run.json`, `marketing-runtime-run.json` | Durate e risultati originali delle invocazioni |
| `marketing-course-return-mobile.png` | Screenshot originale estratto dalla cattura, 390×844 |
| `direct-ast-comparison*.json` | Misure originali ristrette; non sono un confronto a parità di lavoro con REA |
| `setup-provenance.json` | Annotazioni esplicite su setup, fallback e limiti dei log conservati |
| `runner-provenance.json` | Identità distinta degli script originali e delle nuove versioni portabili |
| `packaged-verification.json` | Nuova verifica offline del pacchetto; non un nuovo run browser |

L’archivio è di **356.124 byte**, SHA256:

```text
caab0e46b8e62600cfbe423ba356b425d500aceef7b60c7a4ccd42483993ff56
```

Include evidenze statiche/runtime, scenari, stderr, metadati npm/release, prove dei tentativi falliti, script originali e il piccolo JS emesso da Ardesia necessario al confronto col sorgente. Non include `node_modules`, browser, installer, corpus o sorgenti/documentazione completi di terzi. Date ZIP normalizzate al giorno del packaging; contenuti invariati. I percorsi temporanei nei risultati originali sono **provenienza storica**, non dipendenze dei nuovi runner.

## Verificare la copia senza browser né rete

Eseguire dalla radice del repository, con Python 3.10+ e Git:

```sh
python3 docs/deliveries/2026-10-24-convergence/evidence/rea/verify_marketing_evidence.py
```

Il verificatore controlla archivio e tutte le 40 voci, rilegge le prove originali e ricalcola le dodici asserzioni. Il confronto con il sorgente usa `git show 339ab08f4139da0b37e78bbde81e9fe4e83afea0:apps/marketing-01/assets/site.js`, così successive modifiche del working tree non invalidano la provenienza. Se quel commit non è disponibile, il comando fallisce; non lo scarica automaticamente. `--source-file /percorso/site.js` è un’alternativa esplicita, registrata come tale nell’output.

`--output /percorso/nuovo-risultato.json` conserva un nuovo esito e rifiuta di sovrascrivere file esistenti. Il file originale `marketing-experiment-verification.json` resta immutato.

## Acquisire una nuova prova

Prerequisiti: checkout funzionante, Python, Node supportato da REA 6.7.0 e Chromium disponibile. Il run storico usava Node 24.22.1, REA 6.7.0, Playwright core 1.58.2 e Chromium 153.0.8010.0. Un browser differente produce una nuova prova e non cambia l’identità del vecchio run.

Preparazione isolata della CLI, se necessaria:

```sh
REA_TOOLS_DIR="$(mktemp -d)"
npm install --prefix "$REA_TOOLS_DIR" --ignore-scripts --no-audit --no-fund --save-exact rea-agents@6.7.0
export REA_CLI="$REA_TOOLS_DIR/node_modules/rea-agents/scripts/rea.mjs"
export CHROMIUM_EXECUTABLE_PATH="/percorso/assoluto/chromium"
REA_OUTPUT_DIR="$(mktemp -d)"
```

Acquisizione e verifica, dalla radice del repo:

```sh
python3 docs/deliveries/2026-10-24-convergence/evidence/rea/run_marketing_experiment.py --output "$REA_OUTPUT_DIR"
python3 docs/deliveries/2026-10-24-convergence/evidence/rea/verify_marketing_evidence.py --raw-dir "$REA_OUTPUT_DIR" --source-file apps/marketing-01/assets/site.js --output "$REA_OUTPUT_DIR/marketing-experiment-verification.json"
```

Il runner individua la radice del repo dai propri antenati; `--repo` permette una scelta esplicita. `--rea-cli`, `--node` e `--browser` sostituiscono i valori d’ambiente. Richiede versione REA esatta 6.7.0, costruisce la preview in un output vuoto, esegue l’analisi statica, apre un server loopback effimero, cattura le otto azioni e chiude il server. Registra identità del working tree, script emesso, comandi, risultati e durate. Non registra MCP né aggiorna dipendenze del prodotto.

Un HEAD Git non identifica eventuali modifiche non committate: il nuovo contesto include anche SHA256 del JS. `--source-file` nel comando sopra confronta esplicitamente il working tree utilizzato; per una prova sul commit usare un checkout pulito e omettere tale opzione.

### Query AST ristretta

```sh
export BABEL_PARSER_MODULE="$REA_TOOLS_DIR/node_modules/@babel/parser"
node docs/deliveries/2026-10-24-convergence/evidence/rea/compare_direct_ast.cjs "$REA_OUTPUT_DIR"/marketing-artifact/assets/site.*.js
```

La query misura parsing e visita del singolo JS, escludendo avvio, dipendenze, lettura e hash. L’analisi REA comprende inventario, hash e grafi: **le durate non producono un fattore di velocità comparabile né un risparmio economico**.

## Fallback e limiti delle prove

Il primo tentativo statico è fallito per l’indisponibilità di `ps` nel sandbox; il nuovo tentativo con permessi di processo approvati ha funzionato. Il download standard Playwright ha restituito una pagina HTML `Site Unavailable`; il fallback documentato è il pacchetto pubblico `@sparticuz/chromium@153.0.0`, i cui metadati e integrità sono nello ZIP.

L’estrattore iniziale del fallback ha lasciato un eseguibile vuoto. `original/browser-runtime.json` è **l’output preliminare di quel helper**: contiene un percorso invalido e flag suggeriti che non sono stati usati nella cattura riuscita. La configurazione effettiva è `original/marketing-runtime-scenario.json`. I log originali disponibili sono conservati; per CDN ed estrattore non esiste un log grezzo salvato, e `setup-provenance.json` li identifica correttamente come osservazioni della sessione.

Gli script nello ZIP documentano l’esecuzione storica. Per nuove esecuzioni usare quelli portabili in questa cartella. Il packaging ha rieseguito soltanto il verificatore offline e controllato la sintassi dei nuovi runner; non attribuisce al codice portabile una nuova esecuzione browser.
