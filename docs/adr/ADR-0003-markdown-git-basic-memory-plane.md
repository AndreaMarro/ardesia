# ADR-0003 — Markdown/Git/Obsidian canonico, Basic Memory indice ricostruibile

- **Stato**: PROPOSED / NO CUTOVER
- **Data**: 2026-07-17; evidenza canary aggiornata 2026-07-18
- **Decisione canonica**: Andrea
- **Relazione**: se approvato e completato il cutover, sostituirà ADR-0002; oggi non lo ha ancora sostituito

## Contesto

ARDESIA richiede una memoria leggibile dagli umani, portabile tra MacBook e Mac Mini, verificabile con
hash e Git e utilizzabile anche quando un indice semantico o un servizio MCP non risponde. AgentMemory
è escluso dai workflow attivi e dal fallback; il servizio storico non è stato disabilitato e non deve
ricevere nuove dipendenze.

I vault legacy non sono una base sicura da promuovere automaticamente. La sorgente curata
`/Users/andreamarro/VOLUME 3/ardesia-vault-local` contiene 105 note Markdown e ha una replica sul Mini in
`/Users/progettibelli/ELABTUTOR/ardesia-vault-local`; entrambe restano input di migrazione. Il vault
sporco `/Users/andreamarro/ARDESIA-VAULT` non deve essere indicizzato o promosso in blocco.

Una scansione ha inoltre segnalato un valore simile a un token in
`/Users/andreamarro/VOLUME 3/ardesia-vault-local/90-Archive/Legacy-2026-06/PROMPT-NEXT-v10.md:110`.
Questo ADR registra soltanto il path: il valore non
deve essere letto, copiato o stampato. Redazione e rotazione richiedono un gate umano separato prima
della migrazione del corpus storico.

## Decisione proposta

La memoria operativa adotta una gerarchia file-first:

1. **Autorità tecnica** — evidenza prodotto, test e Git legata allo SHA esatto.
2. **Conoscenza umana canonica** — Markdown in un repository Git privato e pulito, aperto in Obsidian.
3. **Indice locale** — Basic Memory su SQLite e FastEmbed, ricostruibile dal repository e mai writer
   autorevole.
4. **Degradazione** — accesso diretto al filesystem e ricerca con `rg`.

I due clone proposti della stessa fonte canonica sono:

- MacBook: `/Users/andreamarro/ARDESIA-KNOWLEDGE`;
- Mac Mini: `/Users/progettibelli/ARDESIA-KNOWLEDGE`.

Per il canary corrente `canary/basic-memory-20260717` è la branch verificata. Il MacBook detiene l'unico
writer lease; il Mini riceve soltanto fast-forward verificati e non ospita editing umano. Un cambio writer
richiede receipt con host, base SHA, scadenza e rilascio. Divergenza o writer concorrente è STOP: nessun
merge/force implicito, entrambe le varianti vengono copiate in `_conflicts/<data>/` e riconciliate.

Il clone Mini usato per il sync resta separato dallo snapshot/worktree read-only indicizzato da Basic
Memory. Ogni promozione copia da uno SHA pulito verificato, registra manifest e digest e non modifica la
fonte durante l'indicizzazione.

Ogni nota operativa contiene almeno `id`, `type`, `status`, `freshness`, `source_sha`, `created_at`, tag
e collegamenti `[[wikilink]]`. Prima di ogni slice si leggono indice, decisione corrente e ultimo
evidence receipt. Ogni slice aggiunge un receipt append-only con SHA base/candidato, file, test, score,
rischi, RED residuo e prossima slice.

Un guasto dell'indice non blocca una correzione locale: si usa Markdown/filesystem/`rg` e si accoda il
receipt. La riconciliazione Obsidian è obbligatoria prima della release.

## Confine di Basic Memory

Basic Memory è un derivato eliminabile e ricostruibile:

- il progetto è locale, con database SQLite e embedding FastEmbed locali;
- nessun contenuto o embedding viene inviato al cloud;
- lo stato isolato vive in `/Users/progettibelli/.basic-memory-ardesia`, fuori dal vault canonico;
- l'eventuale endpoint MCP ascolta soltanto su `127.0.0.1:8000/mcp`;
- il MacBook può accedervi solo attraverso un tunnel SSH esplicitamente approvato;
- i client usano una allowlist default-deny che ammette soltanto lettura, ricerca e contesto ed esclude
  write, move e delete;
- lo snapshot indicizzato sul Mini è separato dal clone Git di sync e reso operativamente read-only;
- aggiornamenti automatici, telemetria, promozioni cloud, permalink automatici e formattazione on-save
  restano disattivati.

Basic Memory non decide, non orchestra, non conserva l'unica copia e non modifica il Markdown
canonico. Il suo database, gli embedding e i log sono dati derivati; la loro creazione o modifica
richiede comunque il gate infrastrutturale previsto dal runbook.

## Evidenza canary disponibile

Il receipt canonico è
`30-Evidence-Receipts/2026-07-18-FOUNDER-BETA-FB3A-REVIEWED.md` nel vault Obsidian. Il runbook §2 è
l'unico riepilogo normativo dei fatti datati del canary; questa decisione ne conserva soltanto l'esito:

- fattibilità locale/offline e ricostruibilità dell'indice verificate;
- hash del Markdown invariato e ricerca canonica top-1 verificate;
- listener fermato e nessun LaunchAgent, tunnel o client Basic Memory persistente;
- `bm doctor --local` ha manifestato un bug di cleanup dopo operazioni riuscite. Il database coinvolto è
  stato spostato senza cancellazione e il canary granulare ha superato i controlli: `doctor` non è un
  gate di accettazione sufficiente.

## Transizione di AgentMemory

**Oggi AgentMemory resta escluso dai workflow attivi e dal fallback, mentre il servizio storico rimane
intatto.** Questo ADR non autorizza stop, unload, disinstallazione, modifica dei client o cancellazione.

Solo dopo il superamento del canary, la migrazione delle note, la verifica del fallback filesystem e
le approvazioni umane esplicite del runbook:

1. si spostano i client uno alla volta verso il piano file-first con A6/A7;
2. si verifica dopo ogni client lettura, ricerca, degradazione filesystem e zero nuove scritture;
3. con A8a si congela il servizio e si crea uno snapshot hashato dei dati storici AgentMemory;
4. con A8b si può scaricare/disabilitare il servizio senza cancellarlo;
5. AgentMemory diventa soltanto una sorgente di migrazione congelata.

AgentMemory non viene riattivato come fallback ordinario. Il rollback operativo resta
Markdown/Git/Obsidian più filesystem/`rg`; nessun rollback cancella dati.

## Alternative considerate

1. **AgentMemory come memoria corrente o fallback** — rifiutata: introduce una dipendenza attiva e un
   single point of failure non necessario.
2. **Basic Memory come fonte di verità e writer** — rifiutata: l'indice deve poter essere ricostruito e
   non deve mutare il corpus canonico.
3. **Vault legacy indicizzato in massa** — rifiutata: conflitti, freschezza e segreti non sono ancora
   riconciliati.
4. **Servizio o embedding cloud** — rifiutata per local-first, riservatezza e portabilità.
5. **Markdown/Git/Obsidian con indice locale sostituibile** — proposta: auditabile, umano-leggibile e
   degradabile senza bloccare il lavoro.

## Conseguenze

- La conoscenza resta ispezionabile e versionata senza dipendere da un database proprietario.
- Basic Memory migliora il recall ma può essere ricostruito completamente.
- I conflitti vengono copiati in `_conflicts/<data>/`; non si sovrascrivono o cancellano note.
- Ogni importazione richiede manifest di path, SHA-256 e frontmatter.
- Un'indisponibilità MCP diventa un evento REPAIR/DEFER, non uno STOP di prodotto.
- La sincronizzazione dei receipt e la pulizia dei segreti restano gate di release/cutover.
- Prompt B e loop overnight restano disattivati.

## Gate di ratifica e cutover

Le approvazioni per segreti, permessi/remote privato, mutazioni del corpus, installazione,
configurazione/indice/log, listener, tunnel, client, driver/scheduler, quiesce/snapshot, unload
AgentMemory e cancellazione sono separate e non si implicano a vicenda. Il runbook
`docs/ops/BASIC-MEMORY-CANARY-AND-CUTOVER.md` definisce ordine, CoV e rollback.

Finché Andrea non ratifica l'ADR e ogni gate applicabile, lo stato resta **PROPOSED / NO CUTOVER**.

## Non-goal

Questo ADR non installa software, non avvia listener, non crea tunnel, non cambia client o scheduler,
non migra le 105 note, non legge segreti, non ferma AgentMemory e non abilita Prompt B o loop overnight.
