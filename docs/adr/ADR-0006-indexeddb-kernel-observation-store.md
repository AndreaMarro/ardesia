# ADR-0006 — Store IndexedDB atomico e idempotente per le observation

- **Stato**: ACCEPTED LOCAL / PUBLICATION PENDING
- **Data**: 2026-07-15
- **Dipende da**: ADR-0004 e ADR-0005

## Contesto

ADR-0005 congela `ObservationEnvelopeV1`, ma differisce `partitionSeq`,
persistenza e retry a K2. Il log LessonOS legacy usa un database globale,
`lastSeq + writeQueue`, fallback RAM e test IndexedDB simulati: resta intatto e
non è autorità per il nuovo kernel.

## Decisione

Il port provider-neutral vive in `core/kernel/observationStore.ts`; l'unico
adapter K2 vive in `adapters/indexeddb/indexedDbObservationStore.ts`.

Ogni handle appartiene a una partizione `(workspaceId, audienceSpaceId)` e
rifiuta un envelope fuori partizione prima della transazione. Il nome fisico è
`ardesia.kernel.observations:` più SHA-256 lowercase del JSON canonico della
tupla fissa. È pseudonimizzazione stabile, non segretezza; scope raw non entra
nel nome e la namespace non cambia con la versione schema.

Lo schema IndexedDB v1 usa lo store stabile `observations`, key path
`partitionSeq`, `autoIncrement: true` e due indici unici sulle key path annidate
`envelope.eventId` e `envelope.sourceIdempotencyKey`. Il record conserva
l'envelope K1 parsato intero; non duplica identità e non inventa un digest
dell'envelope. Prima di restituire un handle, l'open richiede esattamente il solo
object store `observations` e i soli indici `by_event_id` e
`by_source_idempotency`, quindi valida fail-closed keyPath, autoIncrement,
`unique` e `multiEntry`: un database v1 pre-creato o malformato non è accettato
per nome soltanto.

Un append esegue una sola transazione `readwrite`. Gli handler concatenano
senza `await` lookup event ID, lookup source key e `add`. Un retry dello stesso
event ID converge soltanto se ogni valore dell'envelope parsato è uguale con
ordine oggetto irrilevante e ordine array preservato. Un cambio produce
`event-conflict`; una source key già assegnata a un altro evento produce
`source-conflict`. Primo commit e retry restituiscono la stessa receipt, senza
flag path-dependent.

La chiave generata viene acquisita da `add.onsuccess`, ma la Promise pubblica si
risolve soltanto in `transaction.oncomplete`; la prova browser intercetta la
transazione nativa e impone l'ordine `complete` prima della receipt. Abort e indici unici sono
autorità di concorrenza; non esistono queue o contatori di processo. La tassonomia
redatta distingue quota, security, unknown, abort, data-clone, blocked e timeout.
Un watchdog di esito commit ignoto degrada e chiude l'handle; il recupero ammesso
è un nuovo handle e lo stesso envelope/event ID esatto.

`versionchange` marca stale e chiude; una chiusura inattesa degrada. Open e
blocked hanno timeout bounded e un successo tardivo viene chiuso. Nessuna
operazione riapre silenziosamente. Valori timeout `undefined` usano i default con
`??`; zero, negativi, NaN e infiniti sono rifiutati prima di toccare lo storage.

## Prove locali e fonti

I test puri coprono parse K1, scope, equality, naming e tassonomia senza fake
IndexedDB. Playwright usa Chromium reale e due pagine/connessioni per 100 append
concorrenti, retry, conflitti senza mutazione, abort con rollback del generatore,
partizioni indipendenti, ordine native-complete/receipt e rifiuto di schema v1
malformato, incluso uno store o indice extra. Il cleanup chiude un eventuale
handle accettato e tratta una cancellazione bloccata come errore esplicito. Il
contesto blocca service worker, HTTP e WebSocket non-loopback e asserisce zero
tentativi osservati.

La decisione segue IndexedDB 3.0 per scheduling, commit e rollback del key
generator e i test WPT `transaction-abort-generator-revert.any.js` e
`transaction-scheduling-across-connections.any.js`. WebKit bug 202705 mantiene
il rischio di sospensione Safari; la storage policy WebKit mantiene quota ed
eviction come errori espliciti.

## Non-claim

K2 non cabla il runtime e non migra/corregge il LessonOS legacy. Non prova K3,
access denial cross-scope, replay/projection hash, recovery da eviction,
lifecycle anomalo non inducibile, Safari/iPad reale, CI remota, pubblicazione,
consenso dei soci o `KERNEL_PROVEN`.
