# S00 — integrazione V2, batch iniziale (26 ottobre 2026)

Base osservata: `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`, PR306 già MERGED.
Branch: `codex/swarm-v2-s00-integration-20261026`. Il registro `streams.json`
contiene osservazioni, non dichiara avviati tutti i dodici writer.

## Consumer e confine del batch

La pipeline esistente costruiva Web e Studio ma l'export Vercel eliminava entrambi.
Il nuovo export esplicito conserva Aula `/` e Studio `/studio/` sullo stesso host;
`/ops/release/` consente all'operatore di aprirli e controllare le tre SHA distinte.
Non cambia la produzione pubblica, le cinque dimostrazioni o il gate editoriale.
L'editoriale DRAFT resta una distribuzione separata. Non installa un backend:
ogni `/study` risponde503 `backend_not_configured`, anche per metodi di scrittura.
Questo è un incremento del canale di integrazione, non una beta autenticata remota
né un'accettazione completa del percorso «Studia da solo».

La CSP ammette solo script locali. La review ha identificato che Formula dipendeva
ancora da un CDN: il browser bundle completo **MathJax3.2.1** viene ora emesso dalla
dipendenza già nel lock, senza importare il suo entry CJS. Licenza Apache-2.0
distribuita con l'asset; nessun package/lock nuovo. Font ed altre licenze esistenti
restano invariati. La dimensione extra lazy è misurata nella prova di build.

## Riproduzione

Usare Node26.5.1/root lock e il runtime Studio previsto dal suo lock/CI.

```sh
python3 -m unittest discover -s bin/tests -p 'test_teaching*.py'
npm --prefix apps/studio run typecheck
npm --prefix apps/studio exec -- vitest run src/__tests__/latexToImage.test.ts src/__tests__/localMathJax.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
python3 bin/build_teaching_candidate.py --include-private --output /tmp/ardesia-s00-candidate-FRESH
python3 bin/web/prepare_vercel_preview.py --candidate /tmp/ardesia-s00-candidate-FRESH --private-integrated --output /tmp/ardesia-s00-prepared-FRESH
python3 bin/web/prepare_vercel_upload.py --prepared /tmp/ardesia-s00-prepared-FRESH --protected-integrated-preview --output /tmp/ardesia-s00-upload-FRESH.json
```

Le directory devono essere nuove; il file upload contiene solo asset del prodotto,
mai credenziali. Il preparatore non esegue deploy e il payload non imposta
`target=production`. S00 verifica il progetto `prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8`
e SSO preview attivo usando la connessione autorizzata. Nessuna modifica DNS,
registrazione globale REA, secret o autorizzazione applicativa viene implicata.

Prova browser ripetibile della directory preparata:

```sh
python3 bin/web/serve_teaching_candidate.py --private-integrated --directory /tmp/ardesia-s00-prepared-FRESH/.vercel/output/static --port 5416
node handoffs/swarm-v2/S00/verify-preview.mjs --prepared /tmp/ardesia-s00-prepared-FRESH --origin http://127.0.0.1:5416 --output /tmp/ardesia-s00-proof-FRESH
```

Per Vercel usare l'origine immutabile e `--access-file` con un grant operatore
temporaneo0600, mai committato o scritto nei report. Il runner verifica prima
quattro URL senza grant, poi hash di tutti gli asset, API503,404 editoriali,
UI360/390/820/1440, tastiera, movimento ridotto e inserimento SVG reale con
MathJax locale. Non crea un account né simula risposte Core; il grant SSO è
distinto dall'identità applicativa. Revocare il grant al termine.

## Stato delle prove

- Pipeline26 test PASS nell'ultima esecuzione prima dell'ultimo affinamento del
  controesempio upload; ripetizione finale richiesta prima di dichiarare verde.
- RED reale Formula: expected stessa origine, received jsDelivr. Nuovo loader e
  plugin implementati, GREEN/browser/build ancora da eseguire nello slot S00.
- Review tecnica separata: corretti aggiunta/link durante copia e doppia lettura
  hash/payload. La review non è approvazione umana o scientifica.
- REA CLI6.7.0 verificata; nessun tool MCP REA esposto. Nessuna nuova Evidence di
  analisi build dichiarata finché non eseguita sul candidato reale.
- Main, CI, PR, integrazione e deployment sono registrati al checkpoint finale;
  questo rapporto iniziale non li anticipa. I quattro corsi restano INCOMPLETE,
 200 obiettivi proposti e zero accettazioni complete.

## Prossimi batch

1. Ricevere READY S02/S09, verificare merge-tree e integrare senza cambiare protection.
2. Collegare gli installer Core e «Studia da solo» con S10/S06 e prove di identità,
   fonti, tentativi/feedback e ripresa; nessuna seconda autorità.
3. Distribuire la candidata privata integrata e collegare l'attestazione provider
   a main osservata/head/sorgente/hash degli asset. Backend mancante resta esplicito.


## Checkpoint finale locale successivo

Fonte2c522f96; main992d1a0b. Dieci mirati Studio e27pipelinePASS; build4pulita e791check browser localePASS. Notice234font/9famiglie e codiceMIT emessi, copyright separati; Liberation1.05legacy/source non verificato impedisce una dichiarazione di pubblicazioneStudio. Review tecnica separata senza finding comprovati,7requiredSUCCESS sulla fonte.307/308 integrate e CI post-merge verdi;314 ancora da terminare con provaVercel. Upload dal checkpoint persistente, primo create400missing_files, nessuna pubblicazione anticipata. RAW/test/screenshot nel pacchetto locale output2026-10-26-s00-integration; finalizzare receipt provider e rapporto dopo esecuzione. Il vecchio checkpoint26test e GREEN non eseguito è storico, non cancellato. Decisione di riuso completa in REA-REUSE.md.
