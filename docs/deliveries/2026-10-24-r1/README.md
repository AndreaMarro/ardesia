# Ardesia R1: candidato pubblico verificabile e continuità del tutor

24 ottobre 2026. Base draft [#299](https://github.com/AndreaMarro/ardesia/pull/299), `6f19b1956cedbebf36a5cf097af66e47ed8acecd`; ramo isolato `codex/ardesia-r1-marketing-beta-20261024`. La base è ancora aperta/draft, dipendente da #298; #298/#297/#290 e main sono stati verificati, senza successore concorrente. La ricognizione storica e le tre missioni precedenti restano nella [consegna #299](../2026-10-24-rea-deep-build/README.md): R1 corregge il candidato, senza rifare l’archeologia o creare un altro Core.

Codice prodotto finale `91219486ddf270582bef1c2e0bda2a66796e6e78`; primo commit di questo incremento `c762e30af0dbfb709a68468a71df16449e96c1b5`. Inventario **1596 sorgenti**, sourceTreeSha256 `8211844a37af1894dc104955f7389473e7556544f3980469d55be3c24f5a2d4b`. Successivo commit soltanto prove/memoria: CI da leggere sulla head esatta della nuova draft, non ereditata dalla base. [Binding verificato](evidence/root/final-build-binding.json).

## Risultato da provare

**Pubblico:** landing → Fluidi → esperienza → previsione → raggio e vincolo → esito del Core → errore/recupero audio → problema diverso → contatto dello stesso microcorso. Con raggio doppio e pressione fissata Q/Q₀=16; mantenendo Q la pressione è 1/16. La nuova prova cambia materiale e geometria: raggio invariato, viscosità e lunghezza doppie, Q fissata → pressione quattro volte maggiore, Q e velocità media invariate. Il tubo è lungo il doppio; il grafico del caso ordinario resta nascosto per evitare una falsa proiezione. Reset e riprova riportano il focus alla previsione; una modifica manuale abbandona l’istruzione del compito precedente.

**Privato locale:** docente → episodio → Studio → selezione reale e cattura esplicita → proposta ad Aula → spiegazione e conferma → fonte Core con versione/digest. Studente → variante A o B → previsione → recupero del passaggio esatto → correzione assistita → prova diversa → consegna. Docente → **Aggiorna consegne** → originale/ricevuta → feedback → diario → attività successiva → verifica umana esplicita. La variante B cambia viscosità e lunghezza con compensazione a pressione fissata, non solo il numero del raggio. I v1 e le loro ricevute restano risolvibili; un risultato già visto sullo stesso problema rimane assistenza anche passando da v1 a v2.

Il replay privato su archivio nuovo richiede ancora import del bundle: la fonte autorizzata non trasporta da sola i byte. Nessuna distribuzione cloud o comprensione semantica automatica è dichiarata. Il consenso salvato non avvia il microfono. La demo pubblica non registra iscrizioni o valutazioni: il contatto è manifestazione d’interesse, distinto da account, invito, accesso, pagamento e beta privata.

## Riproduzione dai lock

Web/build Node26.5.1; Studio usa il lock esistente e CI Node22. Python3.13.14 con lock API/Engine; gli script statici usano stdlib. Dipendenze installate dai lock; nessuna chiave provider.

```sh
python3 bin/build_teaching_candidate.py --output /absolute/fresh/marketing
python3 bin/web/check_teaching_candidate.py --candidate /absolute/fresh/marketing --report /absolute/report.json
python3 bin/web/serve_teaching_candidate.py --directory /absolute/fresh/marketing/public --port 5416
```

Aprire `http://127.0.0.1:5416/`; il pacchetto marketing ha **20 asset pubblici**, senza Aula/Studio/database/access file. Technical PASS attesta integrità e confini, mentre **release BLOCKED** attende revisione e autorizzazione umane. Per preparare Vercel, senza collegare progetti o distribuire:

```sh
python3 bin/web/prepare_vercel_preview.py --candidate /absolute/fresh/marketing --output /absolute/fresh/vercel
```

Output Build Output API v3: sole pagine statiche, policy condivisa, percorsi espliciti e vero404 configurato. Il provider non è stato eseguito. Vercel è una possibilità concreta per il frontend; il team accessibile al connettore rifiuta attualmente i dettagli con403 e la CLI non è autenticata. Nessun progetto creato o modificato. [Checklist e rollback](release-checklist.md).

Per il privato sintetico locale:

```sh
python3 bin/build_teaching_candidate.py --include-private --output /absolute/fresh/local-qa
services/study-api/.venv/bin/python bin/study-demo/seed_course_capabilities.py --data-dir /absolute/private/qa
services/study-api/.venv/bin/python bin/study-demo/serve.py --data-dir /absolute/private/qa --no-seed --frontend-dir /absolute/fresh/local-qa/beta/web --studio-dir /absolute/fresh/local-qa/beta/studio --port 5417
```

Le identità sintetiche sono nel file locale privato generato: non committarlo, copiarlo nei pacchetti o pubblicarlo. Il pacchetto completo è destinato al QA locale e resta **Technical FAIL**: un identificatore client Firebase upstream nel vendor Studio coincide con il tripwire di credenziali. R1 non aggiunge allowlist né lo tratta come segreto accertato; restrizioni e autorizzazioni remote non verificate. La proiezione marketing ne è priva. Correzione datata del claim troppo ampio della #299 «nessuna credenziale»: il vecchio inventario non era una scansione del bundle vendor. [Classificazione indipendente](evidence/review/independent-review.md).

## Prove e limiti

[Validazione](validation.md), [review indipendente](evidence/review/independent-review.md), [scheda scientifica umana da compilare](human-scientific-review-pending.md), [REA](evidence/ux/R1-transfer-ticket.json), [beta: inventario e blocchi](evidence/beta/README.md). Nessun merge, deploy, DNS, produzione, pagamento, nuovo database remoto, dato reale o attività programmata.

Il probe remoto legge soltanto tre endpoint anonimi di un target esplicitamente autorizzato e fissato a uno SHA. Non usa token e non certifica login, due utenti, inviti, storage, backup o revoca. G0 resta loopback/sintetico e gli inviti Supabase non configurati restano501. Quattro letture MCP preservate; writer RFC#293 e reader2 Engine rimangono task dipendenti. Efficacia didattica, microfono/FSA e dispositivi fisici, Auth/RLS/Storage remoti e costo complessivo REA restano NOT_RUN/UNKNOWN.
