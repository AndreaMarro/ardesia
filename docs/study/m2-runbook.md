# Preparazione M2 — runbook locale

Usare il checkout `ardesia-semestre-m1-20261019` su branch isolato. Tutte le prove restano sintetiche, bind 127.0.0.1. Il servizio rifiuta `demo=False`. Nessun deploy o pagamento reale è autorizzato. Le prove finali e i percorsi esatti dei dati sono in `artifacts/study-m2/final-receipt.json`; la ricevuta M1 è storica e non va sovrascritta.

## Avvio e accessi

Da root, con la venv già preparata del servizio:

```sh
services/study-api/.venv/bin/python bin/study-demo/serve.py --data-dir .study-demo/m2-local --port 5209
```

Lo script crea soltanto utenti sintetici e scrive gli accessi nella directory privata, senza stamparli. `.study-demo/` è ignorata da Git. Usare `http://127.0.0.1:5209/?vista=fisica`. L’accesso demo riutilizzabile esiste per riprodurre M1; **non è un ingresso di produzione**. Il tutor trova Accessi → studente → Crea invito monouso. Il codice è privato, dura 15 minuti e può essere scambiato una sola volta per una sessione di un’ora. Il browser dello studente seleziona “Usa invito monouso”. “Revoca tutti i miei accessi” elimina sessioni e inviti pendenti dell’attore.

Il cookie può essere provato Secure con `create_app(...,demo=True,secure_cookies=True)` in un test HTTPS. In loopback HTTP il cookie Secure non funziona: questa opzione non dimostra un terminatore TLS reale. Nessuna fiducia in `X-Forwarded-For`; limiti persistenti per indirizzo locale/session-exchange e richieste d’interesse. Il proxy, la vera identità del tutor, i reset, l’onboarding, l’enrollment reale e l’antiabuso distribuito vanno progettati sul deployment scelto. L’API rimane volutamente bloccata alla modalità sintetica.

## Backup e ripristino

```sh
services/study-api/.venv/bin/python bin/study-demo/operate.py health .study-demo/m2-local
services/study-api/.venv/bin/python bin/study-demo/backup.py .study-demo/m2-local .study-demo/m2-backup-UNICO
services/study-api/.venv/bin/python bin/study-demo/operate.py restore .study-demo/m2-backup-UNICO .study-demo/m2-restored-NUOVO --current-erasure-ledger .study-demo/m2-local/erasure-ledger.json
```

Backup v2: DB SQLite e soli blob referenziati, hash per ogni file, controllo integrità e foreign key; nessun accesso grezzo, sessione o invito recuperabile. Il lock cooperativo copre scritture applicative, upload e snapshot sullo stesso host. Non protegge writer legacy esterni che ignorano il lock: fermarli prima. Il restore non sovrascrive una directory; verifica una copia temporanea, applica il **registro corrente** delle cancellazioni, revoca accessi e rende disponibile la directory soltanto al termine. Conservare il registro corrente in una copia privata separata con la stessa disciplina di backup: passare un registro vecchio non può rivelare cancellazioni avvenute dopo quel registro.

Fermare il servizio prima di cancellare o adottare un restore. Non avviare `serve.py` sul restore per la verifica: il seed demo ripopolerebbe la coorte; avviare `create_app` direttamente come nel collaudo M2, con accessi riemessi soltanto agli attori rimasti. Verificare health, conteggi, fonte, originale e memoria prima di adottare una nuova directory. I backup M1 precedenti sono evidenza storica, formato v1 non adottabile dal nuovo restore. Nessun test dimostra guasto fisico del disco o disaster recovery su un’altra macchina.

## Cancellazione e conservazione

```sh
services/study-api/.venv/bin/python bin/study-demo/operate.py erase .study-demo/m2-local student-01
services/study-api/.venv/bin/python bin/study-demo/operate.py erase .study-demo/m2-local student-01 --apply --confirm-actor student-01
services/study-api/.venv/bin/python bin/study-demo/operate.py resume-erasures .study-demo/m2-local
```

Il primo comando è dry-run. Il secondo è distruttivo sullo studente identificato: usare solo fixture nel mandato attuale. La procedura registra prima l’intento durevole, poi elimina fonti e revisioni, tentativi, review, receipt/eventi collegati, layout collegati, proiezioni LessonOS, blob, membership e accessi. Il tombstone pseudonimo impedisce ricreazione dello stesso identificatore e permette replay su vecchi backup. L’avvio HTTP e il backup riprendono gli intenti interrotti. Studenti con enrollment legacy estranei e tutor sono rifiutati: serve analisi del perimetro prima di una procedura più ampia.

Il comando riguarda i record applicativi Study e le sue proiezioni, non le copie esportate, video/screenshot di collaudo, contatti d’interesse non collegati all’identità, log esterni, sincronizzazioni, backup non riaperti, snapshot del filesystem o la mappa esterna persona↔pseudonimo. Il titolare deve censire e gestire separatamente tali copie e contatti; il file ledger conserva un identificatore minimo e richiede una propria policy di conservazione/accesso. `secure_delete`, checkpoint e VACUUM riducono residui SQLite; non attestano cancellazione forense su SSD. Nessuna conformità GDPR viene certificata dal test.

Durate per elaborati, allegati, interessi, accessi, ledger, log e backup: **DA APPROVARE**, insieme a basi giuridiche, eccezioni e responsabili. Nessuna scadenza viene inventata o applicata a dati reali. Il modello per le decisioni è `m2-human-kit.md`; il [Garante descrive accesso, cancellazione, limitazione e portabilità](https://www.garanteprivacy.it/regolamentoue/diritti-degli-interessati). La procedura tecnica è un elemento da verificare nel trattamento concreto.

## Monitoraggio e incidente

`GET /study/health` è solo liveness e identifica la directory con un hash, non la salute del contenuto. `operate.py health` e `/study/ops/health` (solo tutor) controllano DB/foreign key/hash blob senza restituire contenuti o identità. Il CLI esce 1 se il controllo fallisce. In produzione scegliere frequenza, owner, canale di allarme e prova di ricezione; nessun monitor esterno è stato attivato o messaggio inviato. In caso di errore integrità: sospendere scritture, preservare la copia per diagnosi in area privata, verificare backup+ledger, provare restore in directory nuova e documentare owner/esito. Non mostrare una risposta “ricevuta” prima del commit.

## Contenuti e decisione di lancio

```sh
services/study-api/.venv/bin/python bin/study-demo/review-content.py artifacts/study-m2/review-UNICO
services/study-api/.venv/bin/python bin/study-demo/check-readiness.py
```

Il primo esporta 24 esercizi originali, quattro modelli e sei nuovi quesiti in due prove di trasferimento, con proposte numeriche e hash. È sempre DRAFT; non scrive una firma docente. Il secondo è read-only e termina con **exit 2 atteso** perché il lancio è vietato e mancano prove umane. `assess_readiness` controlla la presenza strutturale dei record forniti dall’operatore, non autentica una firma o un’identità umana. Non concedere approvazioni modificando una flag. La produzione resta rifiutata anche con un report compilato.
