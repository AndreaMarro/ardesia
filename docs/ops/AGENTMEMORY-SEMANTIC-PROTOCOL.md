---
id: ardesia-agentmemory-pointer-protocol
status: design-only-no-adapter
freshness: 2026-07-14T23:18:04+02:00
authority: operational-policy
---

# AgentMemory — protocollo pointer-only

## Ruolo

AgentMemory è un indice derivato e ricostruibile. Non conserva la verità di
prodotto e non riassume liberamente le lezioni. La knowledge autorevole resta
nei commit, nelle ADR, negli schemi, nei test, nella CI all'esatto SHA e nelle
ricevute runtime.

Lo stato corrente è `NO-WRITE`; questo protocollo diventa eseguibile solo dopo
tutti i gate di [AGENTMEMORY-HEALTH-STATUS](AGENTMEMORY-HEALTH-STATUS.md).

## Record logico ammesso

Un record contiene soltanto:

```json
{
  "schema": "ardesia-pointer-v1",
  "project": "ardesia",
  "commit_sha": "<40 lowercase hex>",
  "decision_id": "<optional stable id>",
  "receipt_hash": "<64 lowercase hex>",
  "relative_path": "<repo-relative path>",
  "status": "verified|superseded|withdrawn"
}
```

Invarianti:

- `commit_sha` deve esistere nel repository autorizzato;
- `schema` è obbligatorio ed è esattamente `ardesia-pointer-v1`;
- `relative_path` deve risolversi dentro quel tree, senza symlink escape;
- `receipt_hash` deve corrispondere alla ricevuta redatta indicata;
- `decision_id`, se presente, deve essere dichiarato nel documento risolto;
- `project` è esattamente `ardesia`;
- nessun campo addizionale o testo libero.

## Compatibilità con l'API installata

Il record logico **non è oggi scrivibile direttamente**. L'endpoint installato
`/agentmemory/remember` richiede `content` e inoltra soltanto `content`, `type`,
`concepts`, `files`, `ttlDays`, `sourceObservationIds` e `project`; gli altri
campi top-level vengono persi. Nel repository non esiste ancora un adapter.

Il target wire, da implementare e testare dietro `MemoryIndexPort`, è:

- `content`: JSON canonico del record logico, senza whitespace né campi extra;
- `type`: `fact`, uno dei tipi accettati dal server installato;
- `concepts`: esattamente `["ardesia-pointer-v1"]`;
- `files`: il solo `relative_path` già validato;
- `project`: `ardesia-pointer-v1` come etichetta aggiuntiva, non come confine.

Il discriminatore `ardesia-pointer-v1` vive nel JSON canonico e nei `concepts`;
non nel wrapper `type`, che altrimenti verrebbe coercito a `fact`. L'adapter deve
possedere serializzazione, parsing e validazione byte-for-byte.
Non si usano chiamate `curl` costruite a mano. Poiché lo smart search corrente
non applica `project` ai risultati observation, il target richiede una istanza
o namespace fisicamente pulita e un negative scan dell'intero corpus.

## Dati vietati

Audio, trascrizioni, nomi, email, identificatori reali di room o studente,
prompt, diff, token, segreti, URL firmati, contenuto didattico e riassunti di
chat non entrano mai in AgentMemory. Un hash non rende lecito un payload che
contiene o permette di ricostruire questi dati.

## Resume deterministico

1. leggere `docs/00-INDEX.md`, canone, ADR e ultima ricevuta;
2. verificare branch, SHA, status e CI live;
3. controllare lo stato AgentMemory;
4. soltanto se `READY_POINTER_ONLY`, eseguire una ricerca stretta;
5. risolvere ogni risultato contro Git e receipt; scartare mismatch o stale;
6. continuare da fonti primarie anche quando il recall è vuoto.

La memoria non può scegliere il branch, ampliare scope o sostituire una
verifica live.

## Scrittura e supersessione

Una singola decisione terminale potrà produrre al massimo un puntatore. La
scrittura avviene dopo commit e receipt finale, mai durante una slice. Una
correzione crea il nuovo puntatore e l'adapter ritira l'ID precedente con
ricevuta; una tombstone `superseded` o `withdrawn` preserva il lineage senza
rendere selezionabile il record vecchio.

Ogni write richiede:

- servizio `READY_POINTER_ONLY`;
- API autenticata e client pinning verificato;
- adapter versionato e istanza/namespace pulita;
- schema chiuso validato prima dell'invio;
- ricevuta di write con ID e hash, fuori dal repository se operativa;
- lettura di ritorno e risoluzione all'esatto SHA;
- delete/export provabili per il canary.

## Automazioni

Auto-capture di chat, sessioni, transcript, file o diff resta disattivato sia
nella configurazione effettiva sia in ogni sorgente usata al restart.
AgentMemory non viene aggiornato “a ogni checkpoint”: si aggiorna soltanto per
stati terminali verificati. Se non è pronto, non esiste una coda occulta; Git e
la ricevuta costituiscono già l'handoff sufficiente.

## Misura di qualità

Il golden set non esiste ancora e deve diventare una fixture versionata prima
della readiness. Conterrà dieci query stabili associate a puntatori correnti.
Il gate richiede almeno 9/10 target nei top-3, zero record legacy/cross-project
e zero record malformed, superseded o withdrawn presentati come correnti. La
qualità viene rivalutata dopo ogni cambio di versione, indice o configurazione.
