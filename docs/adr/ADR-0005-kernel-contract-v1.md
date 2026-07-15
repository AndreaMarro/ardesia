# ADR-0005 — Kernel Contract V1

- **Stato**: ACCEPTED
- **Data**: 2026-07-15
- **Ratifica**: Andrea Marro
- **Dipende da**: ADR-0004, immutabile al digest ratificato

## Contesto

ADR-0004 separa esperienza AI-native, verità fondata sulle evidenze e autorità
deterministica. K1 congela il minimo contratto runtime che rende verificabile
quel confine senza dichiarare persistenza atomica, isolamento fisico o
`KERNEL_PROVEN`.

## Decisione

I contratti additivi vivono in `apps/studio/src/core/contracts/kernel.ts`; i
contratti legacy `LessonOsEvent` ed `EvidenceRef` non cambiano.

### Scope, evidenze e manifest

`TeachingScopeV1` identifica workspace, audience, lezione e board, più path e
meeting opzionali. `samePartition` confronta workspace e audience;
`sameFullScope` confronta tutti i campi. Un manifest può attraversare lezioni e
board soltanto nella stessa partizione.

Ogni `evidence-id` selector deve essere membro della lista `evidence` del
manifest. Ogni evidence ref usa un locator tipizzato, scope completo, classe
privacy e SHA-256 lowercase. K1 prova forma, membership e scope; non prova che
il locator esista o che i byte recuperati abbiano davvero quel digest.

### Proposte e decisioni

Ogni proposal item è una sola unità tipizzata e identificata. Un factual claim
è una tripla atomica `subject/predicate/object`; un'action ha un solo
`actionKind` e un payload parametri. Entrambi richiedono almeno una evidence,
senza duplicati e appartenente al manifest. La usage content-free registra
token, latenza e `costUsdMicros`; non usa microunità senza valuta.

`DecisionSourceV1` seleziona `itemIds` ed `evidenceIds` non vuoti e unici. Prima
della persistenza, l'host deve validare `TeacherDecisionProposalBindingV1` con
l'esatta proposal: full scope e proposal ID devono coincidere, item ed evidenze
devono esistere, e la decisione conserva le evidenze richieste da ogni item
selezionato. Validare il solo `TeacherDecisionV1` non sostituisce questo binding
cross-object. Token e costo USD micros sono safe integer non negativi.

`accept`, `edit`, `reject`, `attest`, `publish` e `apply` restano rami distinti;
solo `attest` produce `teacher-attested`. Una command receipt registra l'esito e
l'undo, ma non autorizza il comando.

### Observation e intake ostile

Il producer propone soltanto tempo di occorrenza, kind, payload, candidati di
evidenza e hint idempotenti non autorevoli. L'host assegna event ID, producer,
scope, privacy, authority, `recordedAt`, consenso, hash e chiave idempotente.
`partitionSeq` resta differito alla transazione K2.

L'intake observation costruisce un solo snapshot da data descriptor. Per gli
array valida il descriptor `length` prima di enumerare; per ogni object/array
chiama `Reflect.ownKeys` una volta, applica i limiti prima di materializzare i
descriptor e richiede esplicitamente un campo `value`. Accessor anche con
getter/setter `undefined`, symbol, chiavi pericolose, cicli, numeri non finiti e
budget superati falliscono a `null`, senza throw. Un Proxy trasparente non è
rilevabile in generale: la garanzia riguarda lo snapshot ottenuto, non
l'identità dell'input.

## Non-claim e gate successivi

K1 non prova resolver e byte/hash, allocazione atomica di `partitionSeq`, retry
idempotente, storage, recovery, isolamento fisico o replay deterministico. K2 e
K3 restano slice separate. Test e typecheck del candidato sono la prova locale;
CI remota all'exact SHA resta obbligatoria prima della pubblicazione.
