# ADR-0007 — Isolamento fisico e replay deterministico delle observation

- **Stato**: ACCEPTED LOCAL / PUBLICATION PENDING
- **Data**: 2026-07-15
- **Dipende da**: ADR-0004, ADR-0005 e ADR-0006

## Contesto

K2 assegna `partitionSeq` e persiste atomicamente un envelope completo in un
database fisico derivato da workspace e audience. Non espone però una lettura
pubblica scope-required né definisce una proiezione ricostruibile e hashabile.
K3 chiude soltanto questi due confini, senza cablare il runtime legacy.

## Decisione

`ObservationPartitionReader` è una porta provider-neutral separata dallo store
di append. Ogni lettura richiede esplicitamente un `TeachingScopeV1`; un handle
respinge una partizione diversa prima di aprire una transazione. L'adapter
IndexedDB implementa l'intersezione delle due porte e non espone listing globale
o override pubblico del nome database.

La transazione readonly acquisisce tutte le righe, ma il risultato pubblico si
risolve soltanto da `transaction.oncomplete`. Il watchdog bounded degrada e
chiude l'handle anziché restituire righe non confermate. La garanzia riguarda
uno snapshot quiescente: ogni append K2 è già committuto e il writer viene chiuso
prima della lettura.

Ogni riga viene parsata come envelope K1 completo. La lettura fallisce per
contaminazione cross-partition; il replay fallisce per sequenze non safe, non
iniziate a 1, gap o duplicati e per `eventId` o `sourceIdempotencyKey` duplicati.
Non esiste filtraggio parziale. L'unico ordinamento ammesso è `partitionSeq`.

La proiezione conserva ogni envelope validato. Il suo SHA-256 usa i byte del
dominio `ardesia/observation-projection/v1\0`, incluso il terminatore NUL finale,
seguiti da un encoder strutturale tagged:

- tag distinti per null, boolean, number, string, array e object;
- token distinto per `-0`, numeri finiti soltanto;
- stringhe e chiavi JSON-escaped con lunghezza UTF-8 esplicita;
- chiavi object ordinate per code unit e ordine array preservato;
- rifiuto fail-closed di accessor, symbol, valori unsupported, buchi, cicli e
  prototipi non JSON.

JSON ordinario e RFC JCS non sono il formato della proiezione: JavaScript
`JSON.stringify` rende `-0` indistinguibile da `0`, mentre l'uguaglianza K2 usa
`Object.is`. L'escape JSON delle sole stringhe mantiene inoltre distinto un lone
surrogate dal carattere di sostituzione prima della codifica UTF-8.

## Prove locali

Vitest con fixture sintetici copre permutazione input, riordino chiavi, `-0`,
lone surrogate, mutazioni di ogni campo, gap/duplicati/unsafe sequence e valori
unsupported. Vitest e Chromium condividono un hash golden calcolato da un
oracolo indipendente.

Chromium reale usa due pagine e connessioni riaperte sullo stesso snapshot,
verifica `transaction.oncomplete`, tre database distinti al cambio di workspace
o audience, accesso cross-scope negato prima del DB e rifiuto integrale di una
contaminazione raw. Il fixture blocca service worker e traffico non-loopback,
chiude handle e pagine e cancella con timeout ogni database registrato.

## Non-claim

K3 non prova autenticazione, autorizzazione remota, Safari/iPad, migrazione,
eviction, export/recovery, runtime wiring, continuità pedagogica, CI remota o
pubblicazione. L'isolamento fisico è un confine locale per workspace+audience,
non una sandbox di sicurezza contro codice origin-trusted. `KERNEL_PROVEN` resta
non dichiarato finché i gate dispositivo, runtime e publication non sono chiusi.
