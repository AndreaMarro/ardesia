# EPIC 1 A3 — Volume 1 book-faithfulness verdict

**Method note.** For each of the 38 `v1-*` experiments I read its `alignment-records.json` entry (repo claim, Tea claim, repo `volumeRef`, evidence flags) and then searched the ground-truth physical text `CONTENUTI/volumi-pdf/vol1.txt` myself with grep + offset reads, locating each chapter header and `ESPERIMENTO N` block. Key correction to the prior run: the build script's `evidence.teaBookTextInVolume.found=false` results for Vol 1 are almost all **false negatives** caused by apostrophe/space normalization (`l'intensità`, curly quotes). When read against the real text, every Tea `bookText` for Vol 1 except one is verbatim or near-verbatim. The volume itself prints **no per-experiment titles** (experiments are labelled only "ESPERIMENTO N"), so "book-faithful title" means *which editorial title correctly describes what that experiment in the volume actually does* — not a literal string match. On that test the repo titles are faithful descriptions throughout; Tea's experiment titles are faithful where they agree with the repo and **fabricated/topic-wrong** where they diverge (they name relays, transistors, debouncing, kit-Omaric etc. that do not appear in Vol 1 at all).

## Summary table

| id | book-faithful title | source | page | tea_bookText_verbatim | confidence |
|---|---|---|---|---|---|
| v1-cap6-esp1 | Accendi il tuo primo LED | repo (=tea) | 29 | yes | high |
| v1-cap6-esp2 | LED senza resistore (cosa NON fare!) | repo (=tea) | 31–32 | yes | high |
| v1-cap6-esp3 | Cambia luminosità con resistenze diverse | repo (=tea) | 32–33 | yes | high |
| v1-cap7-esp1 | Accendi il rosso del RGB | repo (=tea) | 36 | yes | high |
| v1-cap7-esp2 | Accendi il verde del RGB | repo (=tea) | 38 | yes | high |
| v1-cap7-esp3 | Accendi il blu del RGB | repo (=tea) | 38 | yes | high |
| v1-cap7-esp4 | Mescola 2 colori: il viola! | repo (=tea) | 38–39 | yes | high |
| v1-cap7-esp5 | Tutti e 3: bianco! | repo (=tea) | 40–41 | yes | high |
| v1-cap7-esp6 | Crea il tuo colore! | repo (=tea) | 41 | yes | high |
| v1-cap8-esp1 | Il pulsante accende il LED | repo (=tea) | 44 | yes | high |
| v1-cap8-esp2 | Cambia colore e luminosità con il pulsante | repo (=tea) | 46 | yes | high |
| v1-cap8-esp3 | RGB + pulsante = viola | repo | 46–47 | yes | high |
| v1-cap8-esp4 | 3 pulsanti → 3 colori RGB | repo | 51 | yes | high |
| v1-cap8-esp5 | Mix avanzato con resistori diversi | repo | 56 | yes | high |
| v1-cap9-esp1 | Dimmer LED con potenziometro | repo | 58 | yes | high |
| v1-cap9-esp2 | Inverti la rotazione | repo | 62 | partial | high |
| v1-cap9-esp3 | LED di colore diverso con pot | repo | 62 | yes | high |
| v1-cap9-esp4 | Dimmer RGB | repo | 63 | yes (no period in book) | high |
| v1-cap9-esp5 | Pot miscelatore blu↔rosso | repo | 67 | yes | high |
| v1-cap9-esp6 | Lampada RGB con 3 potenziometri | repo (=tea) | 71 | yes | high |
| v1-cap9-esp7 | Sfida: aggiungi pulsanti alla lampada | repo (=tea) | 78 | yes | high |
| v1-cap9-esp8 | Sfida: combina esperimenti 6 e 5 | repo | 78 | yes | high |
| v1-cap9-esp9 | Sfida: aggiungi pulsante all'esp 8 | repo | 79 | yes | high |
| v1-cap10-esp1 | La fotoresistenza sente la luce | repo (=tea) | 81–82 | yes | high |
| v1-cap10-esp2 | LED di colore diverso con LDR | repo | 84 | yes | high |
| v1-cap10-esp3 | 3 LDR controllano un LED RGB | repo | 85 | yes | high |
| v1-cap10-esp4 | LED bianco illumina LDR → LED blu | repo | 87–90 | yes | high |
| v1-cap10-esp5 | Aggiungi pot per controllare il LED bianco | repo | 91 | yes | high |
| v1-cap10-esp6 | Aggiungi pulsante al circuito LDR | repo | 92 | yes | high |
| v1-cap11-esp1 | Il cicalino suona (collegato alla batteria) | repo | 93–94 | yes | high |
| v1-cap11-esp2 | Campanello: cicalino con pulsante | repo | 95 | yes | high |
| v1-cap12-esp1 | LED con interruttore magnetico (reed) | repo | 97–99 | yes | high |
| v1-cap12-esp2 | Cambia luminosità — sperimenta con le resistenze | repo | 100 | yes | high |
| v1-cap12-esp3 | RGB con interruttore magnetico | repo | 101 | yes | high |
| v1-cap12-esp4 | Pot + RGB + interruttore magnetico | repo | 101 | yes | high |
| v1-cap13-esp1 | LED nell'elettropongo | repo (=tea) | 104 | yes | high |
| v1-cap13-esp2 | Circuiti artistici con l'elettropongo | repo (=tea) | 105 | partial (book typo "circuiti") | high |
| v1-cap14-esp1 | Costruiamo il nostro primo robot | repo (=tea topic) | 107–109+ | no (synthesized sentence) | high |

Counts of `source`: repo-faithful in all 38 rows. Where `repo (=tea)` is shown, repo and Tea titles agree *and* match the book. Where `repo` alone is shown, Tea's title diverges and is **not** book-faithful.

## Chapter-titles table

The TOC of `vol1.txt` (lines 25–41) prints the official chapter titles verbatim; chapter-header pages confirm them.

| chapter | tea-inferred title (narrative_map) | volume-text verdict |
|---|---|---|
| cap6 | Il diodo LED | confirmed (book: "Cos'è il diodo LED?") |
| cap7 | Il LED RGB | confirmed (book: "Cos'è il LED RGB?") |
| cap8 | Il pulsante e il controllo del LED | confirmed (book: "Cos'è un pulsante?") |
| cap9 | Sensori, transistor e relay | **corrected → "Cos'è un potenziometro?"** — Vol 1 cap 9 is entirely about the potentiometer; no transistor or relay content exists in Vol 1 |
| cap10 | La fotoresistenza | confirmed (book: "Cos'è un fotoresistore?") |
| cap11 | Porte logiche con relè (AND, OR) | **corrected → "Cos'è un cicalino?"** — Vol 1 cap 11 is the buzzer/cicalino; there are no relays or logic gates in Vol 1 |
| cap12 | Il pulsante: comportamento reale e debouncing | **corrected → "L'interruttore magnetico"** (running header also "L'interruttore ad inclinazione") — Vol 1 cap 12 is the reed/magnetic switch; no debouncing content |
| cap13 | L'elettropongo conduttivo | confirmed (book: "Cos'è l'elettropongo?") |
| cap14 | Capstone: sensore di luce intelligente | **corrected → "Costruiamo il nostro primo robot"** — Vol 1 cap 14 builds an RGB-lamp "robot" with 3 potentiometers + 2 green LEDs; it is not a light sensor |

## Divergences requiring Andrea decision

In Volume 1 there are **no genuine three-way ambiguities** — for every experiment the volume text clearly settles the question, and in every case it sides with the **repo**. The "divergences" below are all cases where repo and Tea disagree, but `vol1.txt` is *not* ambiguous — it decisively backs the repo. They are listed because Tea's canon is wrong and must be reconciled, not because Andrea must arbitrate:

- **cap9 / cap11 / cap12 chapter titles and ~9 experiment titles** — Tea's `narrative_map` invented chapter themes ("relay", "transistor", "debouncing", "porte logiche") and matching experiment titles ("Relay elettromagnetico" v1-cap9-esp5, "Amplificazione con transistor" v1-cap9-esp4, "Crea una porta AND/OR con i relè" v1-cap11-esp1/2, "Il bottone che accende il LED" v1-cap12-esp1, "Rimbalzi e contatti sporchi" v1-cap12-esp3) that describe topics **absent from Volume 1**. The volume text unambiguously contradicts Tea. Decision needed only on *process*: Tea's Vol 1 canon experiment titles should be regenerated from the volume, not merged.
- **`nextId` chain breaks in Tea's canon** — Tea routes v1-cap6-esp1→...fine, but several Tea `nextId`s jump out of Volume 1 or skip chapters: v1-cap8-esp5→`v1-cap11-esp1` (skips cap9, cap10), v1-cap9-esp1→`v2-cap9-esp2` (jumps to Volume 2), v1-cap9-esp9→`v1-cap13-esp1` (skips cap10–12), v1-cap10-esp6→`v1-cap12-esp1` (skips cap11), v1-cap11-esp2→`v1-cap14-esp1` (skips cap12–13). The repo chain is sequential and matches the book's chapter order (cap6→7→8→9→10→11→12→13→14). The volume's printed chapter/page order backs the repo; Tea's ordering is unreliable. Recommend adopting the repo `nextId` chain for Volume 1.
- **No experiment requires "neither"** — every repo title is a faithful description of the corresponding volume experiment. No corrected/invented title is needed for Volume 1.

## High-confidence proof quotes (exact `vol1.txt` lines)

Every verdict above is `high` confidence. Representative proof lines from `vol1.txt`:

- **Chapter titles** (TOC, lines 25–41):
  `Capitolo 6 - Cos'è il diodo LED?` · `Capitolo 7 - Cos'è il LED RGB?` · `Capitolo 8 - Cos'è un pulsante?` · `Capitolo 9 - Cos'è un potenziometro?` · `Capitolo 10 - Cos'è un fotoresistore` · `Capitolo 11 - Cos'è un cicalino?` · `Capitolo 12 - L'interruttore magnetico` · `Capitolo 13 - Cos'è l'elettropongo?` · `Capitolo 14 - Costruiamo il nostro primo robot`
- **v1-cap6-esp1** (p.29): `per accendere il led e fare il nostro primo esperimento abbiamo bisogno di: • un led... • un resistore da 470 ohm`
- **v1-cap6-esp3** (p.32–33): `ESPERIMENTO 3 / per rendere il led più luminoso ci basta partire dal circuito che abbiamo realizzato. basta cambiare il resistore da 470 ohm con uno da 220 ohm.`
- **v1-cap8-esp2** (p.46): `ESPERIMENTO 2 / Partendo dall'esperimento appena finito, cambia colore del LED o valore del resistore per rendere il LED più o meno luminoso.` (build script's "not found" was an apostrophe false-negative)
- **v1-cap8-esp5** (p.56): `ESPERIMENTO 5 / Giocando con l'esperimento 4 prova a cambiare i valori di resistenza dei vari colori così da ottenere colori diversi quando premi più pulsanti contemporaneamente!`
- **v1-cap9-esp2** (p.62): `ESPERIMENTO 2 / Nell'esperimento 1 l'intensità luminosa diminuisce ruotando verso destra, come facciamo invece a farla aumentare? Facile! Basta [____]. In questo modo la resistenza parte alta e diminuisce man mano che giri verso destra quindi il LED diventa più luminoso` — the words "invertire i pin" in Tea's bookText sit in an image gap in the extracted text → **partial**.
- **v1-cap9-esp4** (p.63): `ESPERIMENTO 4 / Modifichiamo l'intensità luminosa di un LED RGB utilizzando un potenziometro` (book has no closing period; Tea added one) → counted **yes**.
- **v1-cap9-esp8 / esp9** (p.78–79): `ESPERIMENTO 8 / Prova a fare insieme l'esperimento 6 e l'esperimento 5` ... `ESPERIMENTO 9 / Aggiungi un pulsante per accendere e spegnere il LED all'esperimento 8!`
- **v1-cap10-esp5** (p.91): `ESPERIMENTO 5 / Partendo dall'esperimento 4 aggiungiamo un potenziometro per cambiare l'intensità luminosa del LED bianco.`
- **v1-cap10-esp6** (p.92): `ESPERIMENTO 6 / Partendo dall'esperimento 4 aggiungiamo un pulsante per cambiare l'intensità luminosa del LED blu solo quando premiamo il pulsante.`
- **v1-cap11** (p.93): `COS'È UN CICALINO? Un cicalino è un componente elettronico polarizzato... che se collegato ad una tensione suona.` — confirms chapter is the buzzer, not relays/logic gates.
- **v1-cap12** (p.97): `CAPITOLO 12` header `COME FUNZIONA?... Quando invece avviciniamo il magnetino all'interruttore, le due lamelline si toccano e quindi si chiude il circuito` — confirms chapter is the magnetic/reed switch, not debouncing.
- **v1-cap13-esp2** (p.105): `ESPERIMENTO 2 / Dai sfogo alla tua fantasia e prova a creare un circuiti artistico utilizzando l'elettropongo e i LED!` — book prints the typo "un circuiti"; Tea normalized to "un circuito" → **partial**.
- **v1-cap14-esp1** (p.107): `COSTRUIAMO IL NOSTRO PRIMO ROBOT / 1° PASSO: Prendiamo la nostra breadboard e inseriamo tre potenziometri... e colleghiamo i pin dei potenziometri con tre resistenze da 220 Ohm... COLLEGHIAMO DUE LED: Prendiamo due LED verdi` — the volume describes this step-by-step but never as the single sentence Tea quotes ("Costruiamo il nostro primo robot utilizzando la breadboard, tre potenziometri, resistenze da 220 Ohm e due LED verdi."). Tea's bookText is a faithful **synthesis**, not verbatim → **no**.

## Counts

Of 38 `v1-*` experiments: **38 repo-faithful titles**, **0 tea-faithful-only**, **0 neither/corrected** (no repo title needed correcting; 11–12 of Tea's experiment titles diverge and are not book-faithful, but the repo title is correct in every such case), **0 low-confidence** (all 38 verdicts are `high`). Tea `bookText` verbatim status: **34 yes**, **2 partial** (v1-cap9-esp2, v1-cap13-esp2), **1 no** (v1-cap14-esp1), and v1-cap9-esp4 counted yes (book lacks only a final period). Separately, **4 of 9 Volume 1 chapter titles in Tea's `narrative_map` are wrong** and corrected above (cap9, cap11, cap12, cap14).
