# S01 — scienza e plugin, mandato V2

Stato: IMPLEMENTATO/TESTATO parziale, non INTEGRATO/DISTRIBUITO/APPROVATO.
Base37e0fe828e47b7c81784c2eb48a1b9776dd859ed; ramo
codex/s01-science-library-20261026, worktree separato in/private/tmp.
START6404868980 e CONTRACT6404963012 nella PR306 già integrata.
Il vecchio contributo B è preservato in main e nei suoi handoff.

## Eseguito

- Nuovi modelli urto1D, continuità/Bernoulli, campo/potenziale puntiforme,
  lente sottile nei file S01. SI, segni, domini, singolarità, output analitici
  e dataset per rappresentazioni. RED34 per modulo assente→GREEN34.
- Configurazione come risorsa privata Core, note, hash implementazione,
  CAS+idempotency sulle revisioni e riapertura esatta senza eseguire il modello
  o rivelare risultati. Altri5 test: REDmodulo→GREEN; combinati39 PASS18.15s.
  Nessuna tabella o modifica all’autorità sessioni. Session revocation viaHTTP
  e factory condivisa non sono ancora provate: hookS10 in attesa.
- JSXGraph1.14.0, commitd0fd56a473651ce8eba51c2b7821ab3cfb357ac3,
  metadata npm e integrità SHA512 del tarball verificati. MIT selezionabile
  nel dual licensing; dipendenze npm runtime dichiarate zero, closure
  vendorizzata ancora da completare. Non aggiunto ai manifest del prodotto.
  Browser reale isolato:7 PASS,21mount/unmount, drag/input/curve/cleanup/fallback.
  PrimoFAIL conservato: bottone close collideva con window.close nel mioharness;
  corretto il selettore esplicito, non il donor. Server eChromium chiusi.
  UMD993978byte/gzip258797; npm19MB/unpacked74MB fuori dalrepo.

Fonti: https://github.com/jsxgraph/jsxgraph/tree/v1.14.0 ,
https://raw.githubusercontent.com/jsxgraph/jsxgraph/v1.14.0/LICENSE.MIT eCOPYRIGHT.
Pacchetto isolato in/private/tmp/ardesia-s01-evidence-20261026/jsxgraph-spike.
Il codice scientifico è originale; JSXGraph disegna dati, non è un solver.

## In corso e gap

1. Catalogo parametrico+UI comune con previsione/manipolazione/spiegazione/transfer,
   grafici/tabelle, errore/offline e reopen reale. HookS00/S10 e fonte riusabileS03
   richiesti; non inventare ActivityEvidence lessonRef/fase nella freezeattuale.
2. Ciclo scientifico install/update/rollback/revoke/uninstall nel ToolHost esistente,
   snapshot leggibile senza codice revocato. Al momento BUNDLED_FIRST_PARTY,
   non INSTALLABLE. Nessun marketplace generale nuovo.
3. Adapter Kirchhoff alpin verificato b35a8b5da0616f00a7764397bda0e6b95aca3c95:
   ricognizione iniziata, nessun port/adoption scientifica eseguiti.
   Licenza repo non rilevata nei metadata; dipendenze/diritti da riconciliare.

Tre batch successivi: dinamica/energia/vettori completi; fluidi e trasformazioni
con più scenari per famiglia; campi/condensatori/interferenza/lenti eKirchhoffDC,
poi riuso Analisi1. Il primo batch non conclude il mandato o i4corsi.
Tutte le nuove lezioni/capacità restanoDRAFT senza firma umana e in privato.
RootApp/dispatcher/schemi/auth/lockfile/RUNLOG/NEXT non modificati daS01.

Mac: snapshot iniziale4.3GiB liberi; ridotto il proprio checkout sparse quando
la contesa ha portato il disco a~1GiB; nessunfile/PID altrui terminato.
Checkout inizialmente vuoto con --no-checkout: popolato con read-tree nelsolo
nuovo worktree, attesa conclusione prima delle prove. Gli errori iniziali di
lettura file assenti non sono difetti del prodotto né RED funzionali.
