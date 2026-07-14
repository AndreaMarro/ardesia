---
id: ardesia-agentmemory-maintenance
status: proposed-not-authorized
freshness: 2026-07-14T23:18:04+02:00
authority: runbook
---

# AgentMemory — piano di rientro controllato

## Obiettivo

Portare il servizio da `DEGRADED / NO-WRITE` a `READY_POINTER_ONLY` senza
perdita di dati, segreti nei log o dipendenza operativa di Ardesia. Questo
documento prepara le condizioni; non autorizza modifiche al servizio.

## Regola di esecuzione

Una sola mutazione per finestra. Prima di ogni mutazione servono:

1. backup owner-only con checksum e restore command verificato;
2. baseline di liveness, heap, RSS, error rate, porte e versioni;
3. azione nominata, rollback limitato e stop condition;
4. conferma umana esplicita;
5. osservazione per almeno 15 minuti prima della decisione successiva.

Non combinare upgrade, restart, auth, index rebuild, log rotation o client
pinning nella stessa finestra.

## Sequenza obbligatoria

### M1 — Preservare e spiegare

- verificare il backup esistente e crearne uno nuovo solo con gate;
- identificare il processo remoto dietro il tunnel e la persistenza effettiva;
- correlare i 931 fallimenti di `mem::summarize` con versione e configurazione;
- campionare heap e RSS senza broad recall o compaction;
- documentare la causa o lasciare `UNKNOWN`, senza “riparazione per tentativi”.

Uscita: evidenza sufficiente a scegliere una sola remediation.

### M2 — Autenticare la superficie

- scegliere un segreto dedicato e ruotabile nel secret store locale/remoto;
- far rifiutare senza credenziale search, remember, export, delete e admin;
- mantenere liveness minimale e priva di dettagli sensibili;
- verificare failure closed e redazione di header/query nei log;
- conservare il tunnel loopback come difesa aggiuntiva, non come auth.

Uscita: test negativi senza header, header errato e scope errato tutti verdi.

### M3 — Convergere le versioni

- allineare servizio e worker e approvare una matrice compatibile per MCP;
- sostituire `npx -y` con pacchetto e digest/versione pin;
- provare compatibilità su copia o canary prima del servizio corrente;
- vietare migrazioni irreversibili prive di restore provato.

Uscita: release set compatibile, deliberato e riproducibile.

### M4 — Neutralizzare ingestion e injection

- mantenere injection, auto-import, graph, consolidation e auto-compress off;
- correggere anche env, plist/wrapper e ogni sorgente letta al restart;
- provare un config-negative gate prima e dopo un restart autorizzato;
- disattivare job che importano chat, transcript, sessioni o file.

Uscita: configurazione effettiva e sorgenti di avvio concordano su `false`.

### M5 — Recuperare headroom

- correggere la causa misurata di heap o summarizer, non solo il sintomo;
- richiedere heap `<85%` per 15 minuti e nessuna crescita monotona;
- circuit breaker chiuso, KV stabile e zero nuovi burst critici;
- non usare restart periodici per mascherare una perdita.

Uscita: finestra osservata con metriche e receipt.

### M6 — Implementare adapter e isolamento

- creare dietro `MemoryIndexPort` un adapter per il wire contract installato;
- serializzare il record logico in `content` con vettori byte-for-byte;
- usare il wrapper server `type=fact` e validare il discriminatore pointer V1
  nel contenuto canonico e il concept esatto `ardesia-pointer-v1`;
- validare schema chiuso, path, SHA e receipt prima della rete;
- usare una istanza/namespace pulita: il solo `project` non isola observation;
- scansionare l'intero corpus e fallire su qualsiasi record non pointer V1.

Uscita: adapter con round-trip/malformed test e corpus pointer-only.

### M7 — Qualificare il retrieval

- versionare e indicizzare dieci puntatori fixture privi di contenuto sensibile;
- eseguire golden recall top-3, cross-project e supersession test;
- richiedere almeno 9/10, zero legacy/leak/malformed e zero stale correnti;
- cancellare le fixture e provare che non riappaiano.

Uscita: qualità minima misurata, non impressione soggettiva.

### M8 — Canary Ardesia

- con gate separato, scrivere un solo record pointer-only;
- leggerlo, validarne SHA/path/receipt e marcarlo superseded;
- esportarlo e cancellarlo con ricevute;
- tornare immediatamente `NO-WRITE` a ogni mismatch o timeout.

Uscita: `READY_POINTER_ONLY`; non autorizza ingestion di lesson content.

## Stop condition

Interrompere e fare rollback della sola mutazione se liveness fallisce, heap
supera il baseline e continua a salire, compare un accesso non autenticato, le
versioni divergono, il restore non è ripetibile o un record cross-project viene
recuperato. Fermarsi anche se una sorgente di restart abilita injection/import,
se l'adapter perde un campo o se il corpus contiene un record non pointer V1.

## Fallback permanente

Ardesia deve poter funzionare indefinitamente senza AgentMemory. Il resume usa
Git+Markdown+receipt; l'assenza della cache può ridurre comodità, mai
correttezza, continuità o possibilità di release.
