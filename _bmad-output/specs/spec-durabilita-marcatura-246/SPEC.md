---
id: SPEC-durabilita-marcatura-246
companions: []
sources: []
---

> **Contratto canonico.** Questo SPEC è il contratto completo, validato per preservazione, di cosa costruire, testare e validare per la fetta #246.

# Durabilità della marcatura errore in ELAB Lab

## Why

**Un dolore da risolvere, e un dolore che mente.** Quando il docente segna un errore osservato durante la lezione, `ElabLab.tsx:191-203` emette `error.observed` sul bus e incrementa il contatore nella stessa funzione sincrona. Il binding host (`busEventLogBinding.ts`) fa `void log.append(event).catch(onRecordError)`: fire-and-forget. La UI scrive «errori segnati: 1» mentre l'append su IndexedDB è ancora in volo — prima di `crypto.subtle.digest`, prima della transazione. Se il docente in quel momento ricarica o naviga, l'evento non esiste e la vista aveva già dichiarato il contrario. Chi ha visto «segnato» ha una ragione per non ricontrollare: è la classe di difetto peggiore, perché la perdita è silenziosa proprio verso chi potrebbe rimediare. L'e2e che esiste non naviga mai — resta nella vista montata — quindi è cieco per costruzione, e nemmeno gira: il gate CI carica 1 spec su 23.

## Capabilities

- **CAP-1**
  - **intent:** il docente vede il contatore degli errori segnati incrementare solo quando l'evento è realmente nella memoria della lezione.
  - **success:** con la scrittura resa lenta, `[data-marked-count]` resta a `errori segnati: 0` finché l'append non è acknowledged, e passa a `1` solo dopo.

- **CAP-2**
  - **intent:** esiste un oracolo che naviga mentre la scrittura è in volo e pretende che l'evento sopravviva alla navigazione.
  - **success:** un e2e Playwright che, dopo aver visto la conferma della UI, ricarica la pagina e trova `error.observed` nell'export della memoria — rosso contro `main` di oggi, verde dopo il rimedio, rosso di nuovo se si toglie la barriera.

- **CAP-3**
  - **intent:** quel journey è un cancello, non un rapporto.
  - **success:** gira in un job di `.github/workflows/ci.yml` senza `continue-on-error`, quindi un suo rosso blocca.

## Constraints

- La UI non dichiara «segnato» prima del write acknowledgement dell'event-log.
- **Write acknowledgement, mai un delay**: un ritardo sposta la finestra di perdita, non la chiude.
- Canon ELAB-AS-PLUGIN §6: il plugin non tocca la memoria. Il rimedio resta nell'host (`busEventLogBinding` + vista), mai nel plugin.
- Convergenza: nessuna superficie nuova. Il rimedio **estende** `BusEventLogBindingOptions`, contratto già esistente.
- Fail-visible intatto: `onRecordError` continua a ricevere gli append rifiutati. L'ack non può assorbire un errore.
- L'oracolo legge la durabilità attraverso l'export già esistente («Esporta memoria (JSON)»): nessuna API di test nuova nel prodotto.

## Non-goals

- Le altre 22 spec Playwright che il gate non carica: entrano una alla volta, ognuna vista fallire prima. Non in questa fetta.
- La branch protection (`required_approving_review_count = 0`, lista dei contesti required): è un'impostazione di repo, non un file, e richiede credenziali.
- Nessun merge, nessun push su `main`, nessuna PR.

## Success signal

Un docente che ricarica la lavagna un istante dopo aver segnato un errore ritrova quell'errore nella memoria della lezione. E se domani qualcuno rimette il contatore prima dell'ack, un job CI che blocca diventa rosso prima che il codice arrivi su `main`.

## Assumptions

- Il contesto Playwright è fresco per test: IndexedDB parte vuoto e l'unico `error.observed` nell'export è quello marcato dal test.
- Rallentare `crypto.subtle.digest` è un modello fedele di storage/crypto lento: sta sul percorso reale dell'append (`deterministicUuidV8`, chiamato perché `ElabLab` usa `createEventLogStore()` senza `trustedContext`), non è uno stub di IndexedDB.

## Open Questions

- Con il rimedio, fra il click e l'ack la vista non dice nulla per la durata della scrittura. Serve uno stato «in registrazione» visibile, o il silenzio è accettabile finché la scrittura è sotto la soglia percettiva?
