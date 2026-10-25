# Review da contesto fresco — esito e correzioni

Review read-only del candidato `b097a4982a1abeb022aa87f785e15ec176201e2c` contro base `b124eee04acc8062c27284f23c5d9108e3767c27`, eseguita da un reviewer separato come richiesto dalle skill executing-plans e requesting-code-review. Nessuna modifica del checkout da parte del reviewer.

| Rilievo | Gravità | Prova e correzione nel passaggio finale |
|---|---|---|
| Risposta persa + remount cambia chiave e fonti | P1 | `SubmissionPanel.test.tsx` osservato RED e poi GREEN. La richiesta completa e la chiave sono persistite prima dell'invio e restano identiche al retry. Il browser finale include anche il reload dopo il commit perso. |
| Consegna senza fonte produce contesto irrecuperabile | P1 | `test_plain_text_submission_without_selected_source_has_recoverable_context` RED→GREEN. La consegna crea atomicamente una fonte privata e un contesto stabile; review e originale risolvono allo stesso store. |
| Lettore notebook non mostra metadati/review/allegati | P2, materiale per il requisito di portabilità | Il lettore mostra origine, visibilità, risorsa, revisione, contesto, ricevuta, parent del tentativo, review e download dei byte inclusi. La prova cold verifica il contenuto della sezione riaperta. |
| Cambio vincolo con rete assente mostra vecchio valore | P2, materiale per il contratto fisico | `PhysicsActivity.test.tsx` RED→GREEN. Il risultato precedente viene invalidato alla variazione degli input; un errore non presenta un'altra grandezza come risultato corrente. |

Nessuna P0 trovata. Le due P1 sono riprodotte e corrette; la chiusura finale dipende dai gate sullo SHA congelato, non dalla sola review. Le correzioni hanno regressioni specifiche e self-review; non vengono presentate come una seconda review indipendente.

Non verificato dal reviewer: suite complete, run del candidato finale, crash fisico o disco realmente pieno. L'errore di storage viene iniettato nel confine di transazione per provarne il rollback, senza dichiararlo test di guasto hardware.

Esclusi dalla review M1: auth e deploy produzione, cloud, modelli/ASR live, pagamenti reali, pilot umano e validazione scientifica M2. Rimangono NOT_RUN/NOT_AUTHORIZED, senza claim di prontezza commerciale.
