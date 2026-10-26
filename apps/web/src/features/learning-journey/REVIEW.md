# Review S20 e correzioni

## Integrazione S00 — review distinta del 26 ottobre 2026

Agente reviewer `/root/github_recon`, distinto dall’implementatore, ha letto il delta applicativo e confermato la SHA prodotto immutabile `7c610177d77e2796a34d0e49bb5f732bc72d93df`. Esito: **nessun finding bloccante identificato nel delta**. È una review tecnica di agente AI; non è review umana né approvazione scientifica.

Verificati nella lettura: chiavi di mount con attore/ruolo/edizione/pack-versione/hash; `parentId` conserva l’editor esistente; flag spento di default; adapter S20 rilegge il workspace Core autorizzato; risorse interne filtrate prima della cache generica; riferimento checkpoint esplicito mancante senza fallback silenzioso; Escape controllato interno con conteggio una sola volta e guardia del modal esterno. Nessun nuovo ledger o autorità parallela.

Il reviewer ha letto i JSON correnti: percorso **23 PASS**, recovery **8 PASS**, Escape immediato **10 PASS**, Chromium **148.0.7778.96**, nessun errore JavaScript inatteso. Ha letto anche il RED Escape e il primo percorso fallito, conservati in `evidence/integration-20261026/`. La verifica browser è stata eseguita dall’implementatore contro App compilata ordinaria e Core locale originale; il reviewer non dichiara una sua seconda esecuzione del browser.

Restano distinti i limiti: default flag OFF, dati sintetici locali, backend remoto/PG/RLS e merge tree finale da verificare da S00, contesto canonico Poiseuille qui e `lessonRef`/fase generici in incremento S00 separato. La possibile invalidazione generazionale del caricamento ereditato tramite ref `active` non è dichiarata corretta, non essendo stata dimostrata una nuova regressione del delta.

## Review owner storica della PR #323 — preservata

Review read-only distinta dall'implementatore, sul namespace S20. Verifiche del reviewer: lettura, harness TypeScript isolati e git apply --check; non prova browser/Core né firma scientifica. Ultimo esito: nessun blocker residuo identificato, incluso limite dell'envelope prima/dopo UUID.

Finding corretti con prove nel runner recovery e nei test modello:

1. Cache riconciliato alla head fresca poteva sovrascrivere modifiche dell'altra scheda. Cache solo dirty, baseline originale conservata, conflitto e scelta espliciti anche attraverso remount ripetuti; ensureDraftActor prima dell'uso del cache condiviso.
2. Risposta persa alla creazione lasciava chiave legata a testo vecchio. Comando create congelato, recupero server oppure retry identico, poi eventuale revise.
3. Fonte eliminata e CAS nella preparazione dell'invio lasciavano pending non recuperabile. Rifiuto POST definitivo distinto da esito ignoto; conflitti gestiti nel persist comune.
4. Cambio fonte dopo aiuto poteva attribuire il passaggio alla fonte sbagliata. helpSource separata e inclusa nei riferimenti Core.
5. Ricevuta verificata solo per step poteva essere abbinata a testo/fonte di un altro tentativo. Binding a submission del workspace autorizzato, edizione, previsione, testo e fonte; nessun fallback del testo locale come originale ricevuto.
6. Aiuti durante I/O e risultato esplorato nel passo precedente potevano essere omessi. Trigger disabilitati durante freeze, callback tardiva preservata; model-result conservato attraverso il transfer.
7. Il materiale creato dalla vera UI usa kind material, inizialmente escluso. Consumer e fixture ora lo riusano.
8. Checkpoint visibile come JSON editabile nei Materiali. Filtro centrale nella patch S00 e nel build composto, senza edit dei condivisi.
9. Envelope con 8000 virgolette e 2000 backslash superava 20k. Capacità misurata sul JSON normalizzato con riserva identica prima/dopo UUID; test ai bordi. Il primo fix 19800 era insufficiente e resta nello storico dei log/review.

Difetti incontrati nella prova: Escape annidato chiudeva la concentrazione; corretto con ownership dell'evento nel pannello interno e guardia del modal esterno. La sola stopPropagation non bastava stabilmente: primo PASS mirato e successivo FAIL completo conservati, poi cinque ripetizioni e percorso completo PASS. Il runner ha inoltre avuto selettori di nomi sbagliati, mancate attese degli aggiornamenti asincroni e ambiguità dopo accumulo di fixture; corretti senza alzare timeout o indebolire uguaglianze. FAIL storici e prove finali sono separati.
