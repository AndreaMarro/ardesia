# Review indipendente P0 audio — 25/10/2026

Sola lettura dei tre runtime assegnati, test cross-view e prova nativa B; nessun edit audio o commit. Binding verificato rispetto ad audio-source-binding.json:

- SessionAudioRecorder.ts `c05e2ef205f1514579db00c728e84e3c48df7c6de1fb681a5e0a6a648f7fafa4`
- lessonMutationLock.ts `bbeb231f1a7cba757a8b798557951e8a1c3e771bf22de73df83f03572515541f`
- WorkspaceStore.ts `619538faf4a97f179785f5cff030f772e42e02d472f3c269a7e21991f24d4c1e`

Il primo delta aveva una corsa OFF→nuovo ON: un nuovo take poteva acquisire lifetime prima della barriera, bloccare la vecchia revoca o sovrapporsi al purge. Segnalato all'autore durante review; il binding finale usa una transition lease esclusiva da prima OFF fino al termine purge, shared solo per ON e native start/CAS, mai durante getUserMedia. La capture lifetime rimane distinta dai lock di mutazione. Riletta anche la ricontrollo del backend dopo acquire: una migrazione FSA intercalata non può riusare lo scope localStorage per aprire il microfono.

## Esito del binding finale

Nessun P0/P1 residuo riprodotto nel perimetro esaminato. Il percorso stop→tail drain→persist/discard→release non mantiene mutation lease durante l'attesa del lifetime. Le revoche localStorage richiedono Web Locks+BroadcastChannel per avviare capture, le FSA falliscono chiuse, i driver memory sono distinti per identità, i notice non concedono consenso. Pending permission e dispose rilasciano il lifetime senza attendere il prompt; gli stream tardivi sono arrestati prima del native recorder.

Ho eseguito due probe aggiuntivi in Chromium: dispositivo sintetico, MediaRecorder/BroadcastChannel/Web Locks reali, due tab sullo stesso origin. Le interruzioni avvengono su porte reali Store con latch controllati; nessuna autorità finta o chiave viene sostituita.

1. **Purge già iniziato→nuovo ON:** OFF è canonico e il purge viene sospeso in store.delete. Il nuovo click resta requesting, zero recorder/track; terminato purge, revoca completa, capture nuova recording, ON canonico. Stop della nuova capture salva un file valido e termina il track. Prova in `/private/tmp/ardesia-audio-independent-purge-review/off-new-on.json`, script `/private/tmp/ardesia-audio-independent-purge-review.mjs`.
2. **OFF persistito ma notice non ancora inviato→nuovo intento:** il gate protegge la privacy, però resta il P2 sotto. Prova in `/private/tmp/ardesia-audio-independent-review/off-new-on.json`, script `/private/tmp/ardesia-audio-independent-review.mjs`.

## P2 riproducibile: nuovo click durante OFF→notice perso silenziosamente

In un'altra tab sospendere il ritorno di updateSessionAudioCAS(false) dopo la scrittura canonica OFF, prima del broadcast. Riaprire il recorder in tab A (initialize legge OFF), premere start: resta in attesa della transition lease esclusiva. Lasciare proseguire B: invalidate legge OFF e incrementa generation/chiama stop anche per l'intento nuovo in coda. La Promise start risolve senza errore, ma A resta idle, nativeCreates=0; serve un altro click. Nessuna cattura non autorizzata avviene. Non blocca la chiusura del P0 privacy, ma il comportamento non soddisfa in tutti gli interleaving la promessa di "nuovo ON attende e riparte": renderlo esplicito all'utente o conservare l'intento solo quando successivo alla revoca con un criterio ordinabile.

Non certificati: hardware, browser fisici, FSA live capture, contesti cross-origin o processo remoto. Il primo tentativo di probe effettuava stop immediato prima di ricevere byte: errore atteso "Nessun dato audio ricevuto", corretto aspettando una breve acquisizione sintetica; non è stato trattato come finding del delta. I sei test run B e le otto prove native B restano evidenze dell'autore; i due probe sopra sono indipendenti e sul binding finale.

## Addendum: guard P2 successivo riapre P0 — stato corrente BLOCKED

Il binding successivo di SessionAudioRecorder `12b0337a968036615b053897ac5f1bc6d4f6bbae5d948539aedbb6e1b2803297` aggiungeva un ritorno anticipato su cached OFF + requesting + nessuna capture lease. I due casi di nuovo ON dopo OFF/purge passano, ma il ritorno non prova che l'intento sia successivo a OFF.

Repro nativo indipendente: canonical iniziale OFF H0; A preme ON prima della revoca e resta sospesa al ritorno di initialize, prima di lease o getUserMedia; B completa una revoca OFF idempotente H0. Anche dopo 100ms per il notice, A rimane requesting perché il nuovo guard ignora OFF. Quando initialize riprende, A apre MediaRecorder e un track live, portando il consenso a ON dopo la revoca già completata, da un intento precedente. È un P0 di privacy riproducibile.

Controllo differenziale: stesso sorgente, solo la riga del guard rimossa da un transform Vite in memoria del probe (repository invariato), produce idle/zero recorder/OFF. Prova `/private/tmp/ardesia-audio-stale-intent-review/result.json`, controllo `/private/tmp/ardesia-audio-stale-intent-review-control/result.json`; script `/private/tmp/ardesia-audio-stale-intent-review.mjs` (flag controllo ARDESIA_PROBE_OMIT_P2=1). Root e autore avvisati. Il giudizio positivo precedente vale esclusivamente sul binding c05e2...; il binding 12b0337 resta bloccato finché questa regressione è rimossa o falsificata.

## Chiusura sul binding finale dopo rollback e messaggio di retry

Il guard che ignorava OFF è stato rimosso. Un intento requesting senza lifetime viene comunque cancellato e riceve un messaggio esplicito per confermare con un nuovo gesto. La regressione P0 precedente non è più riproducibile sul binding finale:

- apps/studio/src/store/SessionAudioRecorder.ts: `b4698d1532208c2755514555f199eef149dae045379c17e9b5de95b6737e07b1`
- apps/studio/src/store/lessonMutationLock.ts: `bbeb231f1a7cba757a8b798557951e8a1c3e771bf22de73df83f03572515541f`
- apps/studio/src/store/WorkspaceStore.ts: `619538faf4a97f179785f5cff030f772e42e02d472f3c269a7e21991f24d4c1e`

Tre probe indipendenti Chromium eseguiti sullo stesso binding, tutti con exit0:

| Interleaving | Osservazione finale |
|---|---|
| Intenzione ON precedente a OFF idempotente, initialize ritardata | Error esplicito, zero native recorder/track, consenso OFF anche dopo la continuazione tardiva; privacyPreserved=true |
| Nuova intenzione durante OFF prima del notice | Error esplicito e zero capture; un nuovo gesto dopo il completamento avvia recording, salva un file e termina il track |
| Nuova intenzione a purge già avviato | Zero capture durante il latch del purge; dopo completa OFF avvia ON, salva un file, termina il track |

Le tre ricevute JSON risultano bindingMatches=true rispetto al file di B. Nessun P0/P1 residuo riprodotto nel perimetro di review. Rimane il limite dichiarato hardware/FSA; non sono stati modificati i file audio dal revisore. Le suite complete e il binding del candidato committato rimangono all integratore.
