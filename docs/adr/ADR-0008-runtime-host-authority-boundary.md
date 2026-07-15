# ADR-0008 — Confine di autorità dell'intake observation host

- **Stato**: ACCEPTED LOCAL / RUNTIME WIRING PENDING
- **Data**: 2026-07-15
- **Dipende da**: ADR-0004, ADR-0005, ADR-0006 e ADR-0007

## Contesto

K1 separa l'input non fidato del producer dall'envelope observation autorevole;
K2 valida e persiste l'envelope e K3 lo rilegge e riproduce. Prima di questa
decisione mancava il seam applicativo che impedisse a un producer di passare
direttamente a K2 campi di identità, scope, privacy, consenso, hash e
idempotenza. I test K1 costruivano envelope completi a mano, ma non provavano
chi assegnasse quei campi prima di `ObservationStore.append`.

`ProposalEnvelopeV1` non appartiene a questo percorso. Una proposal conserva
producer modello, contesto, citazioni e provenance di esecuzione ed ha autorità
letterale `model-proposal`; trasformarla in una observation `observed`
riclassificherebbe l'autorità e perderebbe provenance.

## Decisione

`core/application/hostObservationIntake.ts` espone un solo ingresso
`record(unknown)`. Il composition root fornisce una
`HostObservationAuthorityPort`, una partizione `(workspaceId,
audienceSpaceId)` già autorizzata e il port K2 `ObservationStore`.

L'intake applica questa sequenza chiusa:

1. crea una sola snapshot con `parseProducerObservationInputV1`; input ostile o
   campi autorevoli aggiunti dal producer falliscono prima di invocare l'host;
2. congela ricorsivamente la snapshot prima di consegnarla alla porta di
   autorità;
3. la porta host, chiusa sul contesto autenticato dal futuro composition root,
   restituisce un'assegnazione o nega con `null`;
4. l'intake costruisce l'envelope campo per campo, senza spread o rilettura del
   raw: `occurredAt`, `kind` e `payload` provengono dalla snapshot; event ID,
   producer identity, scope, privacy, `recordedAt`, evidence risolta, consenso,
   content hash e source key provengono soltanto dall'assegnazione host;
5. `schemaVersion: 1` e `authority: observed` sono letterali; l'envelope passa
   da `parseObservationForAppend`;
6. workspace e audience devono coincidere con la partizione chiusa prima di
   chiamare K2;
7. soltanto allora viene eseguito `ObservationStore.append`, e al chiamante
   torna esclusivamente la receipt K2.

Una promise chain serializza `authorize → validate → append` per istanza e
continua dopo un rifiuto. È disciplina del writer in-process, non autorità di
concorrenza persistente: sequenza, unicità e commit restano K2.

Gli errori del seam sono tipizzati e redatti. Gli errori K2 propagano senza
essere riclassificati, così il chiamante non confonde un diniego host con un
esito di storage incerto.

## Confini di autorità

Questa API accetta soltanto `ProducerObservationInputV1`. Non accetta
`ProposalEnvelopeV1`, decisioni o command receipt e non espone operazioni di
accept, edit, reject, attest, publish o apply. Parole omonime nel payload
restano dati di una observation; la sola conseguenza possibile del servizio è
un append `observed` e la sua receipt.

I candidati di evidenza restano visibili, immutati, alla porta host; l'envelope
conserva le `EvidenceRefV2` assegnate dall'host. K1 non contiene però una
mappatura persistita candidato→evidence, quindi questa slice non dichiara che i
candidate ref raw siano archiviati né che ogni candidato sia risolto.

## Prove locali

Il test causale dedicato verifica:

- rifiuto pre-host e pre-K2 di scope, privacy, consenso, ID, hash, source key,
  producer, authority e `partitionSeq` forgiati dal producer;
- rifiuto redatto di input ostili e proposal-shaped;
- rifiuto pre-K2 di assegnazioni host malformate, evidence fuori full scope,
  raw audio senza consenso, producer modello e partizione workspace/audience
  diversa;
- preservazione esatta di payload, ordine array, `-0`, tempo, kind, candidati e
  evidence host nel percorso valido;
- source key host distinta dall'hint producer, serializzazione delle operazioni,
  avanzamento della coda dopo un diniego e identità stabile su retry
  in-process.

## Non-claim e gate successivi

La porta host è un confine di dipendenza, non un'implementazione di policy. La
slice non prova ancora un composition root autenticato, una allowlist kind per
producer, risoluzione completa dei candidati, verifica o revoca del consenso,
una gerarchia fra classi privacy, né il binding fra payload bytes e
`contentHash`. K1 verifica soltanto la forma lowercase del digest.

La stabilità di event ID, `recordedAt`, evidence e source key è responsabilità
host; il test prova retry nella stessa istanza con assegnazione stabile, non una
reservation durabile crash-safe. Il confronto della partizione impedisce un
append locale cross-workspace/audience, ma non costituisce autenticazione o
sandbox contro codice origin-trusted.

`Room` e ToolHost non vengono cablati finché workspace e audience autorevoli
non sono identificati. Restano aperti runtime lifecycle/composition,
autenticazione, export/recovery/migrazioni, Safari/iPad, CI remota e
pubblicazione. `KERNEL_PROVEN` non è dichiarato.

## Rollback

Prima del wiring, il rollback elimina il nuovo seam e il suo test; K1, K2, K3,
LessonOS legacy e gli adapter IndexedDB non vengono modificati.
