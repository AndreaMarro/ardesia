# Retrospettiva — la catena percorsa e la cartella vuota

modo: headless · data: 2026-08-22 · epica: nessuna epica di sprint —
**stories mode** sulla spec folder `_bmad-output/specs/spec-durabilita-marcatura-246/`.

Oggetto dichiarato dall'invocazione: **un difetto di processo**, non il giro
tecnico (chiuso e misurato altrove, receipt
`30-Evidence-Receipts/2026-08-22-R-LA-UI-CHE-DICHIARAVA-PRIMA-DELLA-MEMORIA.md`).

## Fase 1 — Cosa c'era da leggere, e cosa mancava

| evidenza | stato |
|---|---|
| `SPEC.md` + `.memlog.md` della fetta | presenti, prodotti oggi |
| `stories.yaml` | **assente** — Story Breakdown è interactive-only e questo giro è headless. `pending_stories` è quindi vuoto per assenza di storie, non per completamento: la verifica di completezza **non è girata**, ed è dichiarato qui invece che assunto |
| diff dell'epica | `/tmp/246-diff.patch`, 5 file, +222/−7 |
| `sprint-status.yaml` | assente (progetto in stories mode): nessuna chiamata a `sprint_status.py`, nessun file di sprint creato |
| retrospettiva precedente | **nessuna**: `_bmad-output/` era vuota fino a oggi. Non c'è follow-through da verificare, ed è esattamente il difetto in esame |
| log di sessione dei singoli story | assenti (nessuna storia) |

## Fase 2 — Finding, ognuno con la sua fonte

**F1 — Il cancello del metodo non può vedere un artefatto, per costruzione.**
Fonte: `ops/loop/metodo-bmad.py`. Il file apre **due** path in tutta la sua
esecuzione: `CONTRATTO = .../iterazione.md` (riga 78) e il giornale
(`percorso = Path(argv[0])`, riga 219, con il fallback `.gz` a riga 222).
`_bmad-output` non compare nel sorgente. Il cancello conta **eventi di
invocazione** — `tool_use` con `name: "Skill"` e `input.skill` che comincia per
`bmad` — e nient'altro. Quindi un giro che invoca l'intera catena e non scrive
un byte su disco esce **verde**. Non è un bug: è il referente scelto. Ma il
referente scelto misura *che la catena è stata chiamata*, e chi legge quel verde
capisce *che la catena ha prodotto qualcosa*. Sono due affermazioni diverse.

**F2 — Il difetto ha già cambiato forma due volte sotto lo stesso cancello.**
Fonte: `ops/loop/iterazione.md` §0.9 e la docstring di `metodo-bmad.py`.
Versione 1 del cancello: «almeno una skill bmad» → tre giri di fila con
`bmad-build` e nient'altro. Versione 2: «la catena intera» → la catena intera,
e `_bmad-output/` ancora vuota. **Una soglia restituisce la soglia** è già
scritto nel file; quello che il file non dice è che vale anche per la sua
seconda versione. Alzare il criterio ha spostato il comportamento, non lo ha
reso produttivo.

**F3 — La prova che l'oggetto costa poco.**
Fonte: questo giro. Percorrere la catena *lasciando* gli oggetti è costato
`memlog.py init` + 16 `memlog.py append` + una derivazione di `SPEC.md`: nessun
lavoro nuovo, solo il lavoro già fatto scritto dove qualcuno lo ritrova. Il che
rende F1 più grave, non meno: il costo dell'artefatto non era la ragione della
sua assenza.

**F4 — Una open question del contratto è rimasta aperta e va portata avanti.**
Fonte: `SPEC.md` §Open Questions. Con il rimedio, fra il click e
l'acknowledgement la vista **non dice nulla**. Il difetto vecchio era «dice una
cosa falsa»; il nuovo rischio è «non dice niente mentre lavora». Non è stato
risolto in questo giro per convergenza (nessuna superficie nuova), ed è
registrato come voce d'azione, non come dettaglio chiuso.

## Fase 3 — Discussione di squadra

Saltata: headless, come da contratto della skill.

## Fase 4 — Voci d'azione e verdetto

| # | azione | fonte | proposta a |
|---|---|---|---|
| A1 | Dare a `metodo-bmad.py` un secondo referente: **almeno un artefatto nuovo o modificato sotto `output_folder`** nel giro, oltre agli eventi di invocazione. Il cancello passerebbe da «la catena è stata chiamata» a «la catena ha lasciato qualcosa» | F1 | Andrea — tocca un oracolo del loop |
| A2 | Non alzare di nuovo la soglia degli eventi. Le due versioni precedenti hanno restituito la soglia; la terza farebbe lo stesso | F2 | il loop |
| A3 | Decidere se serve uno stato «in registrazione» visibile fra click e ack | F4 | Andrea — è una scelta di prodotto, non un difetto |

**Verdetto di accettazione: accepted-with-open-items.**
I criteri che la fetta si era data (CAP-1, CAP-2, CAP-3 in `SPEC.md`) sono tutti
soddisfatti e misurati. Le voci aperte sono A1 (un cancello del loop, fuori
dalla fetta), A3 (una domanda di prodotto dichiarata nello SPEC stesso) e la
verifica di completezza che **non è girata** per assenza di `stories.yaml`.
Nessuna decisione umana è stata inventata.

## Assunzioni prese senza l'utente (giro headless)

1. L'epica retrospettata è la spec folder `spec-durabilita-marcatura-246`, presa
   dall'invocazione: nessuna auto-detection.
2. `pending_stories` è vuoto perché **non esistono storie**, non perché siano
   `done`. Il gate di completezza è dichiarato non eseguito.
3. Il verdetto macchina è `accepted-with-open-items` sulla sola evidenza; nessun
   override umano è stato simulato.
4. Le tre voci d'azione sono **proposte**, non applicate. A1 tocca un oggetto del
   loop e resta di Andrea.
