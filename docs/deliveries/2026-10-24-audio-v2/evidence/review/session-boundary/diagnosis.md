# Gate Web locale: prerequisito lazy prima della prova 401

24 ottobre 2026. Node 26.5.1/npm 11.17.0, lock root installato con npm ci.
Indagine sul candidato base `ae25b93b` + diff locale. Modifica approvata
dall'integratore: una sola riga di setup in `openDelivery()`:

```ts
render(<App />);
await import("../features/Work");
fireEvent.click(await screen.findByRole("button", { name: "Consegne e feedback" }));
```

Si attende la dipendenza reale prima di avviare il clock dell'asserzione
funzionale. Nessun mock del prodotto, timeout o asserzione è stato cambiato.
Nessuna correzione dell'autorità di autenticazione viene rivendicata.

## Localizzazione del fallimento

`evidence/validation/web-test.log`: 298 PASS / 1 FAIL, durata 149.73 s,
runner `npm exec --workspace @ardesia/web -- vitest run --maxWorkers=1 --no-file-parallelism`.
Il test verificato json401(cookie) fallisce in `openDelivery():53`, prima di
cliccare il tab “Consegne e feedback”. Il DOM contiene già shell privata,
edizione selezionata e fallback Suspense “Sto aprendo questa parte del tuo
spazio…”. Il test non è arrivato all'apertura dei dettagli che monta
SourceViewer e richiede la fonte da cui deve arrivare il 401.

Quindi questo risultato non dimostra un mancato rifiuto della sessione: il
prerequisito della prova non era pronto entro la query standard. Il fallback
del singolo log, senza telemetria, non distingue con certezza un modulo ancora
pendente dal retry/commit React successivo alla risoluzione del modulo.

Spec originale, App, sessionBoundary e apiClient sono invariati rispetto alla
base all'ingresso dell'indagine. Work ha l'aggiunta del renderer opzionale
PredictionEvidence del verticale; la fixture del test non contiene tale dato.
Il baseline originale completo aveva già fallimenti allo stesso primo passo
nel caso json(cookie) e binary(cookie). Non viene attribuita una regressione
di autenticazione alla nuova esperienza da questa sola osservazione.

## Riproduzioni e controprove

Le prove hanno atteso la fine della suite Studio per evitare sovrapposizione
di carico. I log precedenti restano conservati: i 9 FAIL del primo full Web
originale, gli altri risultati del wrapper npm che consumava opzioni e questo
298/1 non vengono riscritti né classificati come flaky.

| Esecuzione | Risultato e portata |
| --- | --- |
| `original-focused.log` | Spec originale intatta, 9 PASS, 2.69 s. Non prova risoluzione del full fallito. |
| `pending-import.log` | Un gate tiene pendente solo l'import reale Work. La query originale scade col timeout standard; workspace è caricato, nessuna richiesta resources è stata emessa. Dopo release + flush React lo stesso percorso richiede la fonte, riceve il 401 verificato, apre dialog e rimuove UI privata/edizione. 1 PASS diagnostico. |
| `preloaded-original.log` | Solo preload reale beforeAll, 9 PASS. Primo caso 917 ms contro 918 ms del focused originale: non viene presentato come miglioramento prestazionale né garanzia del commit React. |
| `async-act-original.log` | Variante con render + import dentro async act, 9 PASS. Non scelta: non necessaria alla separazione del prerequisito import dal clock della query. |
| `await-import-control.log` | Stesso gate sul modulo reale: una query testimone identica all'originale scade mentre il helper candidato attende la dipendenza. Dopo release il candidato esegue le query originali e chiude correttamente l'accesso sul 401. 1 PASS diagnostico. Nessun ritardo numerico o timeout maggiore. |
| `await-import-original.log` | Tutte le nove prove originali con la sola await import nel helper, fuori da src: 9 PASS, 3.00 s. |
| `after-focused.log` | Controllo dopo l'applicazione di quella sola riga al test reale; esito nel log. |

Il gate di modulo usa un wrapper di `vi.mock` che inoltra a `importOriginal()`:
non sostituisce Work con un componente finto, non modifica React, il client
HTTP o la sessione. Il caricamento viene trattenuto per costruire un confine
deterministico. I dettagli restano chiusi fino al gesto originale; le
asserzioni di presenza/assenza e la risposta 401 sono quelle del percorso
reale. Il controllo positivo attende l'import prima della query, anziché
concedere più tempo all'asserzione.

Questa controprova dimostra il difetto di composizione del setup: il vecchio
clock dell'oracolo 401 comprendeva anche cold import/transform della pagina.
Non identifica retroattivamente quale sottopasso abbia consumato il tempo
nel singolo full fallito e non misura una soglia prestazionale dell'app.
Il findByRole già presente continua ad attendere il commit dopo il modulo;
non si dichiara che await import da sola garantisca il completamento di React.

## Ripetibilità

Il test reale usa il normale runner del package:

```sh
PATH=/opt/homebrew/bin:$PATH npm run test --workspace @ardesia/web -- src/__tests__/session-boundary.test.tsx --maxWorkers=1 --no-file-parallelism --reporter=verbose
```

I probe in questa directory usano configurazioni dedicate fuori da `src` e un
filtro esplicito per evitare di scoprire la suite completa. Esempio, dalla
cartella `apps/web` del checkout registrato nelle configurazioni:

```sh
PATH=/opt/homebrew/bin:$PATH npm exec -- vitest run --config ../../docs/deliveries/2026-10-24-audio-v2/evidence/review/session-boundary/probe.config.ts pending-import.test.tsx --maxWorkers=1 --no-file-parallelism --reporter=verbose
PATH=/opt/homebrew/bin:$PATH npm exec -- vitest run --config ../../docs/deliveries/2026-10-24-audio-v2/evidence/review/session-boundary/await-import.config.ts await-import-control.test.tsx --maxWorkers=1 --no-file-parallelism --reporter=verbose
```

Le configurazioni registrano path assoluti del checkout per includere i probe
fuori sorgenti: in un checkout differente vanno aggiornati tali path. Non
fanno parte della discovery CI del prodotto. `original-session-boundary.test.tsx`
conserva il test prima della riga di setup. Gli hash sono in `status.json`.

La suite Web completa deve essere rieseguita dall'integratore sul nuovo setup,
senza carichi paralleli. I focused PASS non sostituiscono quel gate. Nessun
file audio, Poiseuille, App, API o autorità sessione è stato modificato in
questa indagine.
