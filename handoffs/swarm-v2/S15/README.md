# S15 — due contratti di acquisizione, 26 ottobre 2026

**Stato: AUDIT_COMPLETE / RECOMMENDATIONS_NOT_ADOPTED.** Questo handoff propone due
incrementi agli owner attivi S06/S09. Non implementa un secondo scheduler o
calendario, non blocca i loro branch e non certifica le nuove acquisizioni.
Costi, tempo risparmiato, prestazioni e beneficio didattico: **UNKNOWN**.

## Perimetro e fonti attuali

Base letta: `8e0737b114f147735ef4daf062285e1dbe4064e3`, checkout
`codex/rea-acquisition-s14-s16`. PR S06 [#309](https://github.com/AndreaMarro/ardesia/pull/309)
head `ff38400012594ab2fad16d4721305e50532ae31a`; PR S09
[#307](https://github.com/AndreaMarro/ardesia/pull/307) head
`595fbb79650b7b3a6699f7117f542c79226638d9`. Osservazioni, SHA256 dei file letti e
pin delle fonti sono in [sources.json](./sources.json); decisioni/contratti in
[reuse-decisions.json](./reuse-decisions.json).

Le head contengono il primo batch. Il rendezvous più recente modifica il prossimo
incremento: [S06 alle00:37UTC](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6405629157)
sta valutando autovalutazione esplicita e card/review-log versionati;
[S09 alle00:36UTC](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6405615343)
sta confrontando calendari completi. Questi messaggi attestano intenzione/ownership,
non codice adottato. Una DEFER dello scheduler basata solo sull'assenza di rating
nella vecchia head sarebbe ormai una conclusione incompleta.

Tre donor pertinenti verificati su release immutabile:

| Donor | Pin / licenza verificati | Decisione |
| --- | --- | --- |
| [py-fsrs](https://github.com/open-spaced-repetition/py-fsrs/tree/9446cb06605c597a063aeee49f7d188d42e34dc2) |6.3.2, `9446cb06`, MIT; Python>=3.10 | **ADAPT condizionale**, raccomandazione1 |
| [icalendar](https://github.com/collective/icalendar/tree/138c8453db34fbb584bbcbc592fd7bd4b972e8ef) |7.3.0, `138c8453`, BSD-2-Clause; Python>=3.10 | **REUSE test-only**, raccomandazione2 |
| [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs/releases/tag/v5.4.2) |5.4.2, tag risolto in sources.json, MIT; Node>=20 | **DEFER** sul consumer Python S06; alternativa legittima, non incompatibile per licenza |

Licenze upstream lette nei rispettivi pin, insieme a manifest e API pertinenti.
MIT richiede conservazione degli avvisi; BSD-2-Clause richiede anche condizioni e
disclaimer nella forma appropriata alla redistribuzione. La chiusura transitiva
esatta resta da verificare prima di installare: nessun via libera indiscriminato
ad asset, documentazione o dipendenze. [RFC5545](https://www.rfc-editor.org/rfc/rfc5545)
è la quarta fonte primaria, per folding/TEXT/VEVENT/UID/SEQUENCE e termini IETF.
Non sono stati copiati componenti di codice dall'RFC.

Correzione di provenienza utile a S06: il README del ramo principale può parlare
di una prossima major. Il [pacchetto pubblicato ts-fsrs5.4.2](https://registry.npmjs.org/ts-fsrs/5.4.2)
e il suo `packages/fsrs/package.json` dichiarano Node>=20.0.0. Non respingere questa
release con il requisito Node24 della v6 menzionata nel precedente REUSE S06.
La scelta Python si motiva con la collocazione dell'autorità Core, non con quel
requisito attribuito alla release sbagliata.

## 1. S06: adattare il modulo completo py-fsrs nel Core

**Consumer preciso:** `packages/engine/lessonos/study/independent_study/__init__.py`,
azione `finish`/nuova azione di autovalutazione; vista `IndependentStudy.tsx`.
La head osservata suggerisce1/3giorni da correttezza numerica e aiuti
(righe215–225); non contiene rating/card/log FSRS. Riusare il modulo completo
evita di sviluppare un secondo algoritmo di intervalli; non è ancora un risparmio
misurato. Il nuovo mandato S06 rende concreta l'adozione dopo autovalutazione.

**Contratto proposto, a S06 senza nuova dipendenza tra PR:**

1. Ricevere soltanto una scelta esplicita dello studente fra i quattro rating
   con significato di richiamo dichiarato. Correttezza, video, hint e tempo non
   vengono convertiti automaticamente in rating o competenza. La scelta può
   restare facoltativa e il piano storico resta leggibile.
2. Il backend invoca `Scheduler.review_card(card, rating, review_datetime=UTC)`;
   il tempo proviene dall'orologio Core, `enable_fuzzing=False` e configurazione
   completa/versionata. Assegnare `card_id` esplicito, stabile e circoscritto al
   piano: il default upstream usa millisecondi correnti. Non affidarsi a default
   temporali o al solo nome della versione per ricostruire un risultato.
3. Conservare identità del piano/lezione/pack, versione wrapper, versione donor,
   configurazione, snapshot della card, rating dichiarato, orario, collegamento
   al ReviewLog emesso e ricevuta nello stesso confine Core. CAS/idempotenza
   esistenti garantiscono una sola transizione; nessuna tabella, authority client
   o coda nuova. Separare `suggestedDue` da override manuale e relativa ragione.
4. La serializzazione upstream non è validazione dell'input non fidato. Validare
   wrapper/versione/configurazione e accessi prima di ricostruire card/scheduler.
   Versioni sconosciute non devono resettare la card; fallimento atomico e percorso
   storico leggibile. Il requisito `_write` di20.000caratteri esiste già: mantenere
   uno snapshot corrente limitato e storico nei receipt/revision canonici, evitando
   un array ReviewLog che cresce senza limite nel piano.
5. Rendere visibile l'istante effettivo. I default upstream hanno step di1/10minuti;
   `IndependentStudy.tsx:11` oggi rende solo la data. La configurazione pedagogica
   degli step è decisione dell'owner: non nascondere intervalli subgiornalieri o
   assegnare ai parametri default un'efficacia non verificata. Nessun optimizer
   richiesto: il package base ha `typing-extensions`; gli extra torch/pandas/numpy
   non sono necessari al consumer proposto.

**Prova di adozione richiesta:** commit/lock esatti e avvisi; test upstream
pertinenti del pin più fixture del wrapper a clock fissato per tutti i rating,
card nuova/review/relearning, stesso giorno e riapertura; due replay identici con
fuzz disabilitato; retry non duplica ReviewLog, CAS concorrente ne accetta uno;
altro studente/lezione/revoca rifiutati; piano storico e override conservati;
molti ripassi non superano il limite di stato; UI reale sceglie rating, mostra
quando ripassare e rilegge lo stesso snapshot dopo cold reopen.

Rollback: lasciare disponibili piano e receipt storici; disabilitare le sole
nuove transizioni FSRS con versione esplicita. Nessuna cancellazione dello stato
o conversione silenziosa verso l'euristica. Stato attuale **NOT_ADOPTED** da S15;
nessuna prova runtime o efficacia eseguita in questo audit.

## 2. S09/Core: riusare icalendar come parser indipendente dei file ICS

**Consumer preciso:** byte di `render_ics(plan)` in
`packages/engine/lessonos/study/calendar_time.py:72`, serviti da `get_ics` e
scaricati da `CalendarExport.tsx`. Il nuovo calendario mese/settimana resta
competenza S09; questo contratto non sceglie un renderer al suo posto.

L'attuale `_text` sfugge i delimitatori e `_fold` conta gli ottetti UTF-8:
non è stato trovato qui un difetto che giustifichi sostituzione. Il punto utile
del donor è un parser mantenuto indipendentemente dal serializer e dai suoi test.
L'adozione iniziale proposta è **solo in test**, `icalendar==7.3.0`, usando
`Calendar.from_ical(bytes)` e lettura delle proprietà decodificate; niente
installazione client, nuova rotta o serializzatore runtime.

**Contratto e prova richiesta:**

- Un test del consumer scarica il medesimo file confermato, lo passa al parser e
  verifica esattamente4VEVENT, UID canonici distinti/stabili, DTSTART/DTEND UTC,
  DTSTAMP, STATUS, SEQUENCE e durata contro il piano autorevole.
- Fixture con accenti/emoji, titolo lungo ai confini74/75/76ottetti, virgola,
  punto e virgola, backslash e newline recupera lo stesso TEXT decodificato.
  Verificare CRLF e limite fisico delle linee anche senza affidarsi alla
  tolleranza del parser.
- Le due02:30 di Roma al cambio autunnale restano due istanti UTC distinti.
  Riapertura/retry della stessa conferma conserva UID/SEQUENCE/byte/hash;
  nuova revisione segue l'autorità di versione del Core. Niente ATTENDEE,
  ORGANIZER, VALARM o METHOD introdotti da fixture/adattamento.
- Il test attraversa anche stale preview, altro tutor/studente e revoca sul
  consumer esistente. Un parser permissivo non prova ACL o autorizzazione.
- Registrare ambiente, versione/lock/chiusura BSD e SHA consumer del test. Un
  import reale in un client terzo è prova aggiuntiva distinta, ancora **NOT_RUN**;
  il solo parser non soddisfa l'intera accettazione TARGET-123.

Non usare `to_ical()` al posto del renderer corrente in questo incremento:
`calendar.py:159` memorizza `icsSha256`, mentre `get_ics` rigenera i byte.
Un cambio di ordine/folding può cambiare quel digest anche a semantica uguale.
Un eventuale futuro switch del serializer richiede formato versionato e replay
dei vecchi intent/receipt. Rollback del parser test-only: rimuovere dipendenza e
test aggiunti, nessuna migrazione. Stato **NOT_ADOPTED**; nessun bug o beneficio
quantitativo rivendicato.

## Limiti, ownership e prossimi passi

Analisi read-only di sorgenti completi con gh/API e fonti primarie; nessun package
installato, donor eseguito, build/suite/browser avviato o messaggio GitHub scritto.
La [skill REA42](https://github.com/morluto/rea) letta indirizza questo caso agli
strumenti sorgente ordinari: nessun doctor/provider/capture o Evidence REA fittizia.
Registry/TARGETS.json letto ma non modificato: TARGET-123 è esistente; gli ID per
FSRS e delta di registry restano dell'owner/integrazione centrale.

Correzione operativa: all'ingresso S15 ha invocato per errore il generatore stato
prima di notare l'eccezione read-only; il parent aveva già generato gli stessi
artefatti e ha richiesto di lasciarli. Nessun file prodotto modificato da S15.
I file da includere per questa traccia sono soltanto questa directory.

1. **S06 ora:** confrontare questi vincoli con l'adapter in sviluppo, fissare
   configurazione/identità e matrice dei rating; accettazione sui receipt e sulla
   riapertura, non sul semplice import del donor.
2. **S09/Core dopo ownership:** aggiungere l'oracle ICS indipendente nel proprio
   batch senza cambiare serializer o forzare attesa del calendario completo.
3. **S00 alla composizione:** rileggere le nuove head degli owner, applicare solo
   delta dipendenze assegnati e registrare adozione o rigetto con prove sulla SHA
   finale; mantenere status NOT_ADOPTED fino a quel momento.


## Risposta owner riletta dal parent — 26 ottobre 2026

S09 ha risposto [DEFER motivato](https://github.com/AndreaMarro/ardesia/pull/307#issuecomment-6405917529): batch renderer FullCalendar, ICS e receipt immutati; oracolo da adottare nel successivo batch interoperabilità, con le prove richieste. Nessuna adozione o beneficio misurato. #307 è ora MERGED, ma non include questa raccomandazione. Per S06 la risposta alla raccomandazione non è ancora osservata nei commenti della309; il suo lavoro indipendente continua. Il dossier originario rimane fotografia datata.
