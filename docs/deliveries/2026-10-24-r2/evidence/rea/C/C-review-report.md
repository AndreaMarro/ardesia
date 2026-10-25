R2 C — implementazione congelata e osservazione REA, 25 ottobre2026 00:10CEST circa.

Il contratto minimo è implementato e i focused34PASS post-review/typecheck Web sono verdi. L’autore di questi6file non costituisce revisore indipendente degli stessi: il root ha affidato il controllo indipendente all’agente D. Nessuna approvazione umana, scientifica, pubblicazione o prontezza beta viene dedotta dai test.

Il nuovo endpoint è `GET /study/learning-experiences?editionId=fluidi&format=composable`, schemaVersion2. Il default rimane schemaVersion1 con i4episodi Poiseuille v1/v2 storici. Un solo manifest nuovo Hydrostatic usa l’evaluator già presente: relativa a2m19620Pa, assoluta allo stesso punto120945Pa, assoluta a3,5m con superficie80000Pa114335Pa. Schema2 congela previsione value/unit e risultato numerico, conservando anche zero/unità errata come errori dello studente; il client non può attestare result/check/assistenza. L’unità non viene convertita da un secondo solver. I pin vengono controllati prima di scrivere originale/ricevuta.

Le prove discriminatorie includono rifiuto di versione/SHA falsificati o superati, parametri rilabelled e pack obsoleto; autenticazione, fonte esatta e appartenenza all’edizione; retry identico, collisione409 e originali; assistenza precedente attraverso revisioni editoriali e due writer concorrenti; isolamento di attori, edizioni e riferimento gauge/absolute. I controlli numerici non valutano la qualità del testo. Le fasi sono dati editoriali validati, non uno stato di avanzamento persistito a parte.

Comandi eseguiti nel checkout `/private/tmp/ardesia-r2-20261024` (Python3.13.14 dal venv del lock; Node26.5.1):

```sh
PYTHONPATH=packages/engine:services/study-api services/study-api/.venv/bin/python -m pytest packages/engine/tests/study/test_learning_experiences.py services/study-api/tests/test_learning_composition_http.py services/study-api/tests/test_learning_experience_http.py services/study-api/tests/test_learning_experience_r1.py -q
PATH=/opt/homebrew/bin:$PATH npm run typecheck:web
```

Risultato iniziale33PASS in4,07s; finale post-review34PASS in3,49s, una deprecation Starlette/httpx preesistente; typecheck exit0. `C-composition-red.log`, `C-composition-preview-red.log`, `C-composition-focused-green.log`, `C-composition-typecheck.log` conservano i run. Nessuna suite pesante parallela o modifica a dependency/lock. Il file `C-ownership-ledger.json` contiene i6percorsi/digest della nostra porzione congelata sul checkout head cc6223c6a156b5868013184e91231206d8708cc0; i cambi degli altri autori non vengono attribuiti a questo agente.

Limite preesistente distinto: la serializzazione canonica del comando precede freeze_activity_evidence; payload JSON non finiti possono fallire prima del validatore di evidenza. Non viene rivendicata copertura HTTP universale dei payload non finiti. Nessun nuovo endpoint di authoring arbitrario o esecuzione di formule è esposto.

Il ticket13campi `C-transfer-ticket.md` e `C-sanitized-evidence.json` separano osservato, fonte documentale e ignoto. H5PQuestionSet1.20.31 è stato percorso realmente da input errato a finale0/6, poi con controprova5/6 e retry; contenuto riusabile e licenze sono stati ispezionati nei dialoghi. L’editor autenticato e Numbas non sono stati verificati. I raw DOM/PNG/Evidence H5P contengono media e configurazione donor: restano soltanto in work locale. Per archiviare scegliere ticket, report, indici/digest, ledger e log test; non includere raw H5P o screenshot donor nel prodotto.

Stato consegna: IMPLEMENTATO_FOCUSED_VERDE, REVIEW_INDIPENDENTE_3PASS_P2_FIX_VERIFICATO_ORACOLO_ESTRENO, HUMAN_SCIENTIFIC_APPROVAL_NOT_ATTESTED. La UI Scalar è responsabilità del root e non è inclusa in questa attestazione. Nessun commit/push/deploy eseguito.

Review indipendente D: tre probe positivi verificano variazione contenuto senza bump di versione, fence di assistenza condivisa schema1/schema2 ratio, unità errata/retry/peer. Un P2 reale nel nuovo ramo scalar accettava un intero JSON1KB nella serializzazione ma `math.isfinite(10**1000)` sollevava OverflowError. La variante ratio aveva lo stesso difetto preesistente. La guardia ora intercetta OverflowError su entrambi i formati senza limitare valori finiti rappresentabili. Probe immutato D RED1→GREEN1; regressione HTTP permanente RED1/2PASS→GREEN34 insieme ai focused, con422 e zero scritture. Log: C-huge-integer-independent-red.log, C-huge-integer-independent-green.log, C-huge-integer-http-red.log, C-composition-final-focused-green.log. Un precedente tentativo di import del probe aveva il PYTHONPATH incompleto: C-huge-integer-independent-collection-error.log conserva questo errore di setup, distinto dalla prova RED.
