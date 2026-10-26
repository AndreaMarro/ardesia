# Review indipendente e correzioni

Reviewer fresco GPT-6 Astra, sola lettura. Non è una revisione scientifica umana o un'approvazione di pubblicazione.

| Rilievo | Riproduzione conservata | Correzione |
|---|---|---|
| Espansione esponenziale illimitata in claimed_value | review-red.log, sentinel sicuro prima di Fraction | Input del passaggio limitato a 32 cifre senza esponenti; solver invariato |
| Risposta save ignorata dopo edit | browser-review-red.log | Identità del documento distinta dalla generazione della bozza; nuova revisione conservata, bozza ancora dirty |
| Layout cambiato durante save | browser-review-first-fix.log | Ogni modifica di posizione avanza la generazione; test richiede movimento osservato, non solo focus |
| Passaggio non salvato/ripristinato | browser-review-red.log | Input del procedimento incluso nel salvataggio e idratato alla riapertura; fino a 32 passi |
| Retry revisione non idempotente | review-red.log | Patch opzionale al comando canonico revise_resource: execute_command e ricevute già esistenti, CAS invariata |
| 401 scartato dopo edit | Host fixture con Transport reale senza eventi Entry | La revoca viene gestita indipendentemente dalla generazione numerica; Entry riusa client/sessionBoundary Ardesia |
| Intero enorme nel layout produce OverflowError | review-red.log | Verifica dei limiti prima di isfinite; HTTP422 e servizio ancora disponibile |

Ulteriore controprova dall'audit contratti: la KCL topologica upstream può risultare valid_so_far senza soluzione elettrica. Il test refused-kcl-red.log lo dimostra; S19 subordina ora la diagnosi a create_lesson solved sulla stessa netlist. Non modifica il significato upstream di valid_so_far e non promuove Product Verified.

Il transfer deve creare una nuova risorsa: browser-transfer-actual-red.log conserva il vecchio riferimento erroneamente riusato; ora azzera l'identità e il riferimento canonico. La precedente browser-transfer-red.log è invece un errore di fixture (sessione sintetica già revocata), non una prova del prodotto. Il runner ora crea DB/sessioni nuove per ogni esecuzione.

Il primo test del movimento pending ometteva Enter e quindi non muoveva davvero il nodo: non è una seconda regressione del prodotto. Ora richiede il cambiamento della bounding box prima di sbloccare la risposta. Nessuna soglia o gate alzato.

Stato finale dei test: vedere validation.md; i log RED, gli errori d'ambiente e i timeout restano distinti dai PASS.

Nuovo finding ASTRA successivo al primo verdeCI: SourceSnapshot da solo non esclude bytecode timestamp stale. Blocco di provenienza riconosciuto e corretto nel solo namespace S19, loader sui byte Git verificati e congelati, rifiuto degli import preesistenti. Controprova effettiva sul package installato, inclusi kernel8V e controllo-B:2PASS isolati; non una modifica upstream né una ridefinizione di Verified. Vedere ACQUISITION_PACKET e test_loaded_source.py. Il verde finale sulla nuova head resta il requisito per rivendicare chiusura.
