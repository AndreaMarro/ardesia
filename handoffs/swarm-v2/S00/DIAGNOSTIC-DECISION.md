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


## 26 ottobre2026 — autorizzazione e misure successive

Il proprietario risponde direttamente «Autorizzo il ciclo mirato, senza indebolire i gate». Il blocco umano di questo checkpoint è superato per quel ciclo, non per un merge con test rosso. Storia precedente preservata.

Script riproducibile measure-mathjax.mjs: Node26.5.1, buildVite reale, sorgenti bloccate identiche e confronto equivalente al matcher installato. Due processi separati, uno per modalità. Build36,08ms/deep e83,57ms/native; confronto bundle2.275.113byte:9085,48ms/deep e0,132ms/native. Heapdeep da19,50MB a717,32MB; piccoRSS692064KiB contro133936KiB. Un solo campione isolato, non benchmark prodotto o moltiplicatoreREA. Dimostra costo del confronto, senza attribuire ogni millisecondo dei31s storici.

Entrambi i comparatori rifiutano primo e ultimo byte alterati su bundle e licenza: quattro controprove per modalità. SHA256 degli asset concordi fra build. Applicata la patch byte-equivalente di una riga; nessuna modifica a pool, timeout, gate, byte richiesti o licenza. Mirato/gate sulla nuovaHEAD ancora da eseguire. Primo lancio diagnostico aveva un ../ in eccesso nel pathRoot: MODULE_NOT_FOUND prima della misura, log conservato, corretto; non è RED prodotto o fallimento del nuovo gate.


## 26 ottobre2026 — esito successivo verificato

La decisione umana è stata fornita e il ciclo concluso: gate congelato2314PASS/0FAIL incluso replay, HEAD573/script invariati; raw e receipt in evidence/approved-gate.314 MERGED ordinariamente su a00f2f40091aecf69e58ebaba42cf70d748e4066, treeab509d3 identico al merge-tree, CIpostmerge40319487576SUCCESS. Vecchi/tmp assenti al resume: precedente processo interrotto senza esito, recuperata stessaHEAD da remoto in percorso persistente e verifica rieseguita, nessun PASS inventato. Produzione invariata e previewfonte158/800HTTPS distinta;0/200 e limiti remoti/licenze rimangono. La nota BLOCKED_HUMAN_DECISION precedente è snapshot storico, non stato attuale. Prossimo raccordo317 in worktreescience, ancoraNON_IMPLEMENTATO nellaUI.
