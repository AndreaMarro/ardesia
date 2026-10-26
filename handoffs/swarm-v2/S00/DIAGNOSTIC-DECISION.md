# S00 — decisione circoscritta dopo due gate falliti

Stato temporaneo della314: **BLOCKED_HUMAN_DECISION**. Non è task completato, PR abbandonata o approvazione di merge con gate rosso.

## Risultato già dimostrato

Fonte15825e70, base992d1a0b.795 check locali e800HTTPS sulla preview privata [registro operatore](https://ardesia-fisica-preview-bjr7xic5r-andreas-projects-6d4e9791.vercel.app/ops/release/). FormulaSVG/font locali, asset esatti, UI Aula360/390/820/1440, API503/DRAFT404, banner ora fuori dal contenuto. Review visuale indipendente conferma P2 corretto a390/1440; P3 contrasto hint Studio resta. Studio fotografata soltanto1440. Grant revocato,302SSO da clientfresco e linkvecchio, fileprivato eliminato; produzione invariata. Sette requiredCI40294401864/contract40294401858 SUCCESS sulla fonte.

## Blocco verificato

AGENTS Studio §5 dice: «2 tentativi falliti sulla stessa task → scrivi una voce in ~/lessonos/COORDINATION.md § NEEDS-CLAUDE e fermati. NON grindare.» Quel file personale non esiste qui; il blocco e la proposta sono registrati in questo handoff autorevole e nel RUNLOG.

Gate congelato immutato, Node26.5.1, primo2311/2FAIL, secondo2312/1FAIL. Primo errore EventEnvelope riprodotto tramite SHA compilata vecchia: S00 aveva committato durante il gate; nessuna ulteriore mutazioneHEAD durante secondo gate, quell'errore assente. Secondo errore localMathJax.test.ts a31.118ms. Review indipendente del runner dimostra che STACK_TRACE_ERROR maschera qui il timeout nel reporter. Default gate forks/15s, CI threads/30s: differenza reale, nessuna incompatibilità Node/forks dimostrata.

Il test usa toEqual su Buffer2.275.113byte. Il matcher installato enumera byte e costruisce circa4,55milioni di coppie Object.entries. Questo costo è provato staticamente; i log non separano build, chiusuraRolldown e confronto, quindi l'attribuzione temporale non è definitiva. Il mirato52PASS non risolve la lacuna.

## Proposta concreta, non applicata

[Patch di una riga](evidence/native-buffer-proposal.patch): Buffer.equals seguito da toBe(true), mantenendo build reale, asset, tipo, licenza e uguaglianza di tutti i byte. Nessuna soglia, pool, script congelato o asserzione scientifica modificata. Non richiede una nuova PR.

Decisione richiesta: autorizzare un nuovo ciclo diagnostico circoscritto nella STESSA314. Primo passo misurare separatamente build e confronto; controprova con byte iniziale/finale alterato che deve fallire; applicare la patch solo dopo verifica; eseguire mirato e gate congelato conHEADimmutabile, poi CI esatta, merge ordinario e CI post-merge. Nessun terzo rerun identico o bypass richiesto.

## Limiti indipendenti

Core remoto non configurato,503 non è beta autenticata; SSO è gate operatore. Liberation1.05legacy/source esatto non verificato: Studio solo preview interna.0/52,0/57,0/33,0/58 obiettivi con accettazione completa. Nessun rollback eseguito o approvazione editoriale inventata.317 congelata2e9cea03 attende raccordo S00 dopo314; nessun nuovo ramo dipendente.
