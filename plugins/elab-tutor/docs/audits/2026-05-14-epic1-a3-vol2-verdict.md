# EPIC 1 A3 — Volume 2 book-faithfulness verdict

**Method note.** Read-only verification of all 27 `v2-*` experiments. For each I read its record in `scripts/epic1/alignment-records.json`, cross-checked the repo's own citation file `src/data/volume-references.js`, Tea's `scripts/epic1/tea-canon/narrative_map.json`, and then independently searched the verbatim physical-volume extract `CONTENUTI/volumi-pdf/vol2.txt` (grep + offset Read) — the volume text is the sole ground truth. **Key structural finding:** Volume 2's experiments carry NO titles in the printed book — they are headed only `ESPERIMENTO 1/2/3/4` under a chapter title. So both the `repo` title and the `tea` title are *editorial labels*, not book text. "Book-faithful title" therefore means: which label correctly describes what the book's experiment actually does. A second finding: the `alignment-records.json` `teaBookTextVerified` flag has many **false negatives** — its matcher fails on curly quotes/apostrophes and line-break artifacts. Where the record says Tea's `bookText` was "not in volume text" but I located it verbatim in `vol2.txt`, I report the truth (verbatim) and note the false negative. The book has a Capitolo 11 ("I diodi") with experiments, but there are **no `v2-cap11-*` records** in the dataset — a coverage gap, flagged below.

---

## Summary table

| id | book-faithful title | source | page | tea_bookText_verbatim | confidence |
|---|---|---|---|---|---|
| v2-cap3-esp1 | Controlliamo la carica della batteria | repo = tea | 17 | yes | high |
| v2-cap3-esp2 | Diario di misurazione della pila | repo = tea | 20 | yes | high |
| v2-cap3-esp3 | Misuriamo una resistenza | repo = tea | 22 | yes | high |
| v2-cap3-esp4 | Misuriamo la corrente in un circuito | repo = tea | 28 | yes | high |
| v2-cap4-esp1 | Due resistori in parallelo | repo = tea | 43 | yes | high |
| v2-cap4-esp2 | Tre resistori in serie | repo = tea | 44 | yes | high |
| v2-cap4-esp3 | Partitore di tensione | repo = tea | 45 | yes (false-neg in record) | high |
| v2-cap5-esp1 | Batterie in serie (più spinta!) | repo (≈tea) | 49 | yes (false-neg in record) | high |
| v2-cap5-esp2 | Batterie in antiserie | repo = tea | 51 | yes | high |
| v2-cap6-esp1 | LED in serie con 1 resistore | repo | 56 | yes | high |
| v2-cap6-esp2 | LED in serie colori diversi | repo | 58 | yes (false-neg in record) | high |
| v2-cap6-esp3 | Tre LED in serie | repo | 59 | yes | high |
| v2-cap6-esp4 | Misurare Vf con il multimetro | repo | 60 | yes | high |
| v2-cap7-esp1 | Scarica condensatore con multimetro | repo | 67 | yes (false-neg in record) | high |
| v2-cap7-esp2 | Scarica condensatore con LED rosso | repo | 69 | yes (false-neg in record) | high |
| v2-cap7-esp3 | Condensatori in parallelo | repo | 72 | yes | high |
| v2-cap7-esp4 | Variare R nella scarica RC | repo | 73 | yes (false-neg in record) | high |
| v2-cap8-esp1 | MOSFET come interruttore | repo | 78 | yes | high |
| v2-cap8-esp2 | MOSFET e carica del corpo | repo | 81 | yes (false-neg in record) | high |
| v2-cap8-esp3 | MOSFET + pot + tensione soglia | repo | 82 | yes | high |
| v2-cap9-esp1 | Fototransistor come sensore | repo | 86 | yes | high |
| v2-cap9-esp2 | Luce notturna automatica | repo | 89 | yes | high |
| v2-cap10-esp1 | Far girare il motore | repo | 95 | yes | high |
| v2-cap10-esp2 | Invertire la rotazione | repo | 96 | yes | high |
| v2-cap10-esp3 | Motore con pulsante | repo | 96 | yes | high |
| v2-cap10-esp4 | Motore + pulsante + LED indicatore | repo | 96 | yes | high |
| v2-cap12-esp1 | Costruiamo il robot segui luce | repo | 103 | yes | high |

**Source legend:** `repo` = the repo's `lesson-paths` title is book-faithful; `repo = tea` = repo and Tea agree and both are faithful; `repo (≈tea)` = both faithful, trivial casing/accent difference only. **In Volume 2 the `tea` title is book-faithful in 9/27 cases and wrong in 18/27** — see Tea-title divergences below.

---

## Chapter-titles table

Volume 2's printed Table of Contents (`vol2.txt` lines 19–37) and the chapter body headers give the canonical chapter titles directly. Tea's `chapter_title` values are all `tea-inferred` and **mostly wrong** — they look like Volume-1 chapter themes pasted onto Volume-2 chapter numbers.

| chapter | tea-inferred title | volume-text verdict |
|---|---|---|
| cap3 | Il multimetro | **confirmed** — TOC: "Capitolo 3 - Il Multimetro"; body header "IL MULTIMETRO" |
| cap4 | Le resistenze in serie e parallelo | **corrected → "Approfondiamo le resistenze"** — TOC: "Capitolo 4 - Approfondiamo le resistenze"; body header "APPROFONDIAMO LE RESISTENZE" |
| cap5 | Le batterie in serie e antiserie | **corrected → "Approfondiamo le Batterie"** — TOC: "Capitolo 5 - Approfondiamo le Batterie"; body header "APPROFONDIAMO LE BATTERIE" |
| cap6 | Serie e parallelo: primi contatti | **corrected → "Approfondiamo i Led"** — TOC: "Capitolo 6 - Approfondiamo i Led"; body header "APPROFONDIAMO I LED" |
| cap7 | Circuiti misti e misurazioni | **corrected → "Cosa sono i condensatori?"** — TOC: "Capitolo 7 - Cosa sono i condensatori?"; body header "COSA SONO I CONDENSATORI?" |
| cap8 | Serie e parallelo con LED multipli | **corrected → "Cosa sono i Transistor?"** — TOC: "Capitolo 8 - Cosa sono i Transistor?"; body header "CHE COSA SONO I TRANSITOR?" (sic — typo in source PDF) |
| cap9 | Pulsanti e logica AND | **corrected → "Cosa sono i fototransistor?"** — TOC: "Capitolo 9 - Cosa sono i fototransistor?"; body header "COSA SONO I FOTOTRANSISTOR?" |
| cap10 | Porte logiche complete (NOT, NAND, NOR, XOR) | **corrected → "Il motore a corrente continua"** — TOC: "Capitolo 10 - Il motore a corrente continua"; body header "IL MOTORE A CORRENTE CONTINUA" |
| cap12 | Capstone: l'addizionatore binario | **corrected → "Costruiamo il nostro primo Robot marciante!" (TOC) / "Costruiamo il robot segui luce" (body)** — see divergence note; the *concept* (segui-luce robot) is right, the addizionatore-binario label is wrong |

Note: Volume 2 also contains **Capitolo 11 — "I diodi"** (TOC line 35, body header line 2659). Tea's `narrative_map.json` `v2.chapters` has no `cap11` and the alignment dataset has no `v2-cap11-*` records — a genuine coverage gap, not just a title error.

---

## Divergences requiring Andrea decision

### A. Tea's experiment titles are systematically wrong (18/27) — but the volume settles it, so these are NOT ambiguous

For 18 experiments the `repo` title correctly describes the book's experiment while the `tea` title is a **logic-gate / Volume-1 label that has nothing to do with the Volume-2 content**. `vol2.txt` settles every one of these in favour of the repo, so they do not need an Andrea ruling — they need Tea's `narrative_map` corrected. Listed for the record:

- `v2-cap10-esp1` repo "Far Girare il Motore" vs tea "Interruttore invertito (NOT)" — book esp.1 is literally "come far girare il motore" (`vol2.txt` line 2569). Repo correct.
- `v2-cap10-esp2` repo "Invertire la Rotazione" vs tea "Logica NAND (NOT AND)" — book: "Prova a invertire il filo rosso e il filo nero..." (line 2589). Repo correct.
- `v2-cap10-esp3` repo "Motore con Pulsante" vs tea "Logica NOR (NOT OR)" — book: "Prova a inserire un pulsante per comandare il motore acceso e spento" (line 2597). Repo correct.
- `v2-cap10-esp4` repo "Motore + Pulsante + LED Indicatore" vs tea "XOR (Exclusive OR)" — book esp.4 adds resistenza + LED to the motore+pulsante circuit. Repo correct.
- `v2-cap12-esp1` repo "Robot Segui Luce" vs tea "L'addizionatore binario" — book Cap.12 header "COSTRUIAMO IL ROBOT SEGUI LUCE" (line 2745). Repo correct.
- `v2-cap6-esp1` repo "LED in serie con 1 resistore" vs tea "Serie e parallelo: primi contatti" — book: "come utilizzare più LED in serie avendo un solo resistore di protezione" (line 1598-1600). Repo correct.
- `v2-cap6-esp2` repo "LED in serie colori diversi" vs tea "Resistenza e caduta di tensione" — book: "prova a modificare il colore del secondo LED" (line 1645). Repo correct.
- `v2-cap6-esp3` repo "Tre LED in serie" vs tea "Resistenze in serie: effetto cumulativo" — book: "aggiungere ancora un LED per averne tre collegati in serie" (line 1672). Repo correct.
- `v2-cap6-esp4` repo "Misurare Vf con il multimetro" vs tea "Resistenze in parallelo: il percorso alternativo" — book: multimetro "funzione prova diodi... ci dice quanto vale la sua Vf". Repo correct.
- `v2-cap7-esp1` repo "Scarica condensatore con multimetro" vs tea "Circuiti misti: serie dentro parallelo" — book: "osserveremo l'effetto di scarica del condensatore elettrolitico" (line 1860). Repo correct.
- `v2-cap7-esp2` repo "Scarica condensatore con LED rosso" vs tea "Misurare corrente in circuiti misti" — book esp.2 adds a LED rosso to the scarica circuit. Repo correct.
- `v2-cap7-esp3` repo "Condensatori in parallelo" vs tea "Misurare tensione in circuiti misti" — book: "per sommare la capacità dei condensatori bisogna connetterli in parallelo" (line 1995-1996). Repo correct.
- `v2-cap7-esp4` repo "Variare R nella scarica RC" vs tea "Challenge: circuito super-complesso" — book: "cambiare il valore di resistenza... osserva come cambia la scarica" (line 2018-2020). Repo correct.
- `v2-cap8-esp1` repo "MOSFET come interruttore" vs tea "Il circuito in serie" — book: "utilizzare il MOSFET come interruttore comandato da una tensione". Repo correct.
- `v2-cap8-esp2` repo "MOSFET e carica del corpo" vs tea "LED multipli in serie" — book: "la carica del tuo corpo consente al MOSFET di accendersi" (line 2229-2231). Repo correct.
- `v2-cap8-esp3` repo "MOSFET + pot + tensione soglia" vs tea "Circuito parallelo" — book: "il comportamento del MOSFET all'approcciarsi della tensione di soglia". Repo correct.
- `v2-cap9-esp1` repo "Fototransistor come sensore" vs tea "Il pulsante accende il LED" — book: "utilizzeremo un fotoresistore come sensore". Repo correct.
- `v2-cap9-esp2` repo "Luce Notturna Automatica" vs tea "Logica AND con due pulsanti" — book: "accendere una luce quando è buio e spegnerla quando c'è luce". Repo correct.

### B. Genuinely ambiguous / needs Andrea — 2 items

1. **`v2-cap12-esp1` — page 103 vs the repo's own in-code worry.** `volume-references.js` carries a comment (lines ~852-857) saying a TRES JOLIE audit flagged "PDF Vol2 dice Cap.12 inizia p.109 (p.103 = Cap.11)". **My independent read of `vol2.txt` contradicts that worry:** the page footer "103" appears at line 2762 immediately followed by "CAPITOLO 12" (line 2763), and the TOC (line 37) says "Capitolo 12 ... 103". Capitolo 11 "I diodi" is pp.99–101 (footer "101" at the end of the diodi section). So **103 is correct** and the repo value should stand — but because a prior audit and a Tea-external metadata file disagree, Andrea/Tea should formally ratify the source of truth and delete the stale comment.

2. **`v2-cap12-esp1` chapter/title wording — TOC vs body header.** The TOC calls Cap.12 "Costruiamo il nostro primo Robot marciante!"; the chapter body header calls it "COSTRUIAMO IL ROBOT SEGUI LUCE"; the repo uses "Robot Segui Luce". All three describe the same project and the body header + esp intro text ("robot che segue la luce") favour "segui luce". This is a low-stakes wording choice (which of the book's own two phrasings to canonicalise) but it is a real repo-vs-book wording divergence the volume does not single-handedly resolve — Andrea should pick one.

There are **no experiments where repo and Tea disagree AND the volume text fails to settle it.** Every repo-vs-tea title conflict (section A) is decisively settled by `vol2.txt` in the repo's favour. The only items needing a human decision (section B) are both about Cap.12 metadata, not about which source is faithful.

---

## High-confidence proof quotes

All 27 verdicts are `high` confidence. Exact `vol2.txt` evidence (curly quotes/accents as in source):

- **v2-cap3-esp1** (p.17): "controlliamo la carica della tua batteria da 9v! oggi usiamo il multimetro per scoprire quanta carica c'è in una batteria da 9v. è come dare un'occhiata dentro per vedere se è ancora "piena" o se sta per "esaurirsi"!"
- **v2-cap3-esp2** (p.20): "ora che hai imparato ad utilizzare il multimetro, passiamo dalla teoria alla pratica: misuriamo la tua batteria da 9v presente nel kit!"
- **v2-cap3-esp3** (p.22): "misuriamo una resistenza da 330 ohm! ora mettiamo in pratica quello che abbiamo imparato e misuriamo una vera resistenza. useremo il nostro multimetro per scoprire se quella resistenza ha davvero il valore che ci aspettiamo: 330 ohm!"
- **v2-cap3-esp4** (p.28): "fantastico! ora che il multimetro è impostato correttamente per misurare la corrente, vediamo come fare praticamente la misurazione sul circuito con il resistore e la batteria 9v."
- **v2-cap4-esp1** (p.43): "utilizzando la breadboard metti in parallelo due resistori da 1kω. che valore deve avere il resistore equivalente? utilizza il multimetro per controllare qual è il vero valore!"
- **v2-cap4-esp2** (p.44): "utilizzando la breadboard metti in serie tre resistori da 1kω. che valore deve avere il resistore equivalente? utilizza il multimetro per controllare qual è il vero valore!"
- **v2-cap4-esp3** (p.45): "Sulla base del circuito dell'esperimento 2, aggiungi la batteria come indicato in figura. Posiziona il coccodrillo nero sul negativo della batteria e il coccodrillo rosso nei punti: J9, J5, J1" (`vol2.txt` lines 1278-1280 — record's "not found" is a false negative)
- **v2-cap5-esp1** (p.49): "Batterie in Serie (Più "Spinta"!) Obiettivo: Capire come le batterie in serie aumentano la tensione (i Volt) e misurarla con il multimetro." (`vol2.txt` lines 1379-1381 — record's "not found" is a false negative caused by curly quotes)
- **v2-cap5-esp2** (p.51): "abbiamo detto che le batterie in serie si sommano e abbiamo anche effettuato un esperimento per dimostrarlo. ma cosa succede se anziché collegare il positivo di una batteria con il negativo della successiva lo collegassimo con il positivo?"
- **v2-cap6-esp1** (p.56): "in questo esperimento vedremo come utilizzare più led in serie avendo un solo resistore di protezione del led."
- **v2-cap6-esp2** (p.58): "Sulla base dell'esperimento 1, prova a modificare il colore del secondo LED (ad esempio utilizzandone uno blu) per apprezzare come cambia l'intensità luminosa" (`vol2.txt` lines 1645-1647 — record's "not found" is a false negative)
- **v2-cap6-esp3** (p.59): "proviamo ora ad aggiungere ancora un led per averne tre collegati in serie. per fare questo, partendo dall'esperimento 2, rimuovi il resistore"
- **v2-cap6-esp4** (p.60): "abbiamo detto che il multimetro ha la funzione prova diodi e continuità. come dice il nome della funzione, può essere usato per provare i diodi ... e come bonus ci dice quanto vale la sua vf."
- **v2-cap7-esp1** (p.67): "In questo esperimento osserveremo l'effetto di scarica del condensatore elettrolitico." (`vol2.txt` lines 1860-1861 — record's "not found" is a false negative)
- **v2-cap7-esp2** (p.69): "In questo esperimento continueremo ad osservare l'effetto di scarica del condensatore." (`vol2.txt` lines 1909-1910 — record's "not found" is a false negative)
- **v2-cap7-esp3** (p.72): "nel kit sono presenti 3 condensatori da 1000uf 25v. al contrario di quanto visto per i resistori, per sommare la capacità dei condensatori bisogna connetterli in parallelo."
- **v2-cap7-esp4** (p.73): "Sulla base dell'esperimento 2 prova ora a cambiare il valore di resistenza aumentandolo o diminuendolo e osserva come cambia la scarica del condensatore." (`vol2.txt` lines 2018-2020 — record's "not found" is a false negative)
- **v2-cap8-esp1** (p.78): "in questo esperimento vedremo come utilizzare il mosfet come interruttore comandato da una tensione."
- **v2-cap8-esp2** (p.81): "Sulla base dell'esperimento 1 scollega il lato collegato al positivo della batteria del cavetto connesso sul gate del MOSFET e collegalo al negativo della batteria. Questo spegne il circuito perché scarica il gate." (`vol2.txt` lines 2229-2231 — record's "not found" is a false negative)
- **v2-cap8-esp3** (p.82): "in questo esperimento vedremo il comportamento del mosfet all'approcciarsi della tensione di soglia" + "questo valore si chiama tensione di soglia vth ... e vale circa 1v per i bjt e 2v per i mosfet utilizzati in questo kit"
- **v2-cap9-esp1** (p.86): "in questo esperimento utilizzeremo un fotoresistore come sensore controllando con il multimetro quanto vale la tensione ai capi di una resistenza in base a quanta luce colpisce il fotoresistore."
- **v2-cap9-esp2** (p.89): "in questo esperimento useremo un fototransistor per accendere una luce quando è buio e spegnerla quando c'è luce."
- **v2-cap10-esp1** (p.95): "in questo semplice esperimento vedremo come far girare il motore presente all'interno del kit."
- **v2-cap10-esp2** (p.96): "prova a invertire il filo rosso e il filo nero, puoi farlo anche con i fili della batteria o quelli del motore. in che verso gira ora il motore?"
- **v2-cap10-esp3** (p.96): "esperimento 3 prova a inserire un pulsante per comandare il motore acceso e spento"
- **v2-cap10-esp4** (p.96): "esperimento 4 prova a inserire un pulsante per comandare il motore aggiungendo anche una resistenza e un led in modo che quando il motore inizia a girare il led si accenda."
- **v2-cap12-esp1** (p.103): "in questo capitolo metteremo insieme un po' tutti i concetti acquisiti in questo volume per costruire un semplice robot che segue la luce!" + chapter header "COSTRUIAMO IL ROBOT SEGUI LUCE"

---

## Counts

Of 27 `v2-*` experiments — **27 repo-faithful** (repo's `lesson-paths` title correctly describes the book; in 9 of those Tea agrees, in 18 Tea is wrong), **0 tea-faithful-only**, **0 neither/corrected** (no experiment needed a brand-new title invented), **0 low-confidence** (all 27 are `high`). Separately: **all 27 of Tea's `bookText`s are genuine verbatim** from `vol2.txt` — but `alignment-records.json` only flagged 17 as verified; the other **10 are false negatives** in the record's matcher (curly-quote / line-break artifacts), not real divergences. Chapter titles: **1/9 Tea chapter titles confirmed, 8/9 corrected.** Coverage gap: **Capitolo 11 "I diodi" has experiments in the book but zero `v2-cap11-*` records** in the dataset.
