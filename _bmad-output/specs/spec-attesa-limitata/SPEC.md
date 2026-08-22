---
id: SPEC-attesa-limitata
companions: []
sources: []
---

> **Contratto canonico.** `.memlog.md` accanto e' la memoria append-only da cui
> questo file e' derivato: si aggiorna quello, poi si ri-deriva questo. Una
> modifica a mano qui viene sovrascritta al prossimo giro.

# Nessuna attesa senza limite negli strumenti che il loop esegue da solo

## Why

L'orologio gira senza nessuno davanti. Ogni strumento che esegue e' un processo
figlio, e un processo figlio che non torna piu' non produce un rosso: produce
**niente**, per sempre. Un rosso lo si legge; un'attesa infinita si scopre ore
dopo, contando le riprove in un log.

La premessa e' misurata dal cancello stesso, sul referente `sync/current` a
`d7bb55c`, prima che questo giro toccasse una riga (`--radice` su un worktree
pristine; record «censimento PRIMA» in
`30-Evidence-Receipts/_measurements/2026-08-22-R-L-OTTANTASEIESIMA-NON-ENTRA.json`):

```text
albero a sync/current d7bb55c — PRIMA
  bin/          84 attese    74 senza limite
  ops/loop/     22 attese    20 senza limite
  TOTALE       106 attese    94 senza limite

albero di lavoro — DOPO (record «censimento DOPO», exit 0)
  bin/          84 attese    74 senza limite
  ops/loop/     23 attese    11 senza limite
  TOTALE       107 attese    85 senza limite
```

Novantaquattro siti non si riparano in un giro: si indovinerebbe novantaquattro
volte quanto e' lungo «troppo». Cio' che si puo' fare oggi, e vale piu' di una
riparazione parziale, e' impedire alla prossima di entrare. Riparate le nove di
`ops/loop/sonde/`, la baseline ne porta **ottantacinque**, e l'ottantaseiesima
esce rossa.

⚠️ **Questo giro RIFA' un lavoro REFUTATO.** Il ramo `loop/iter-20260821T233737Z`
(tip `7c2ad80`) e' stato respinto su **sei** punti. Nessuno tocca il cancello, i
suoi test o la sonda: tutti e sei sono disciplina della prova — un record
descritto per cio' che non era, un episodio raccontato e mai registrato, un
numero tenuto a mano accanto alla misura che lo smentiva, due numeri diversi per
la stessa idea, un verde misurato su un albero precedente, e un attributo
inferito da `git log` presentato come esito osservato. La sostanza si porta; la
prosa si riscrive, e ogni numero rinasce da un comando su questo referente.

## Capabilities

- **CAP-1 — il difetto si chiama attesa, non chiamata.**
  - **intent:** un cancello distingue chi **attende** da chi **genera**.
    `subprocess.Popen(...)` apre un processo e prosegue: limitarlo sarebbe un
    falso positivo. Attendono `subprocess.run/call/check_call/check_output`,
    `os.system`, e `.wait(...)` / `.communicate(...)`.
  - **success:** un file che chiama `Popen` senza `timeout=` e poi
    `.communicate(timeout=30)` esce verde; lo stesso file con `.communicate()`
    nudo esce rosso.

- **CAP-2 — il conteggio nasce da un albero sintattico, non da un grep.**
  - **intent:** le attese si contano con un walk AST dentro il cancello
    versionato, mai con una ricerca testuale che conta righe.
  - **success:** un file con due `subprocess.run` sulla stessa riga conta **due**
    attese; una riga che nomina `subprocess` in un'annotazione di tipo ne conta
    **zero**.

- **CAP-3 — l'ambito si deriva, non si elenca.**
  - **intent:** il cancello guarda ogni `*.py` sotto `bin/` e `ops/loop/`, per
    discesa ricorsiva, cosi' che una cartella creata domani sia guardata senza
    che nessuno aggiorni un elenco.
  - **success:** un file piazzato in una sottocartella nuova e mai nominata da
    nessuno viene visto.

- **CAP-4 — il ratchet fallisce nei due versi.**
  - **intent:** una baseline versionata elenca le attese illimitate note, una
    riga per attesa, ordinata. Il cancello esce rosso se compare un'attesa che la
    baseline non porta (**regressione**) e anche se la baseline porta un'attesa
    che non esiste piu' (**baseline marcia**).
  - **success:** aggiungere un'attesa nuda -> rosso; una riga di baseline che non
    corrisponde a nessuna attesa -> rosso dall'altro verso; ogni rosso ha il suo
    ripristino verde accanto, stesso giudice.

- **CAP-5 — il ratchet non si allarga da solo.**
  - **intent:** `--aggiorna` riscrive la baseline **solo** se l'osservato e' un
    sottoinsieme di essa. Ammettere una nuova attesa illimitata richiede una mano
    umana sul file, visibile nel diff.
  - **success:** `--aggiorna` con un'attesa nuova esce non-zero **e** il digest
    sha256 della baseline e' identico prima e dopo — non «non risulta toccata»,
    identico. Il verso opposto ha il suo braccio: con l'osservato sottoinsieme
    della baseline, `--aggiorna` esce **0**, restringe, e il digest torna quello
    del sigillo. Senza quel braccio il giudice avrebbe solo rossi.

- **CAP-6 — le prove di questo giro reggono a un refutatore.**
  - **intent:** cinque criteri, derivati dalle refutazioni ricevute, vincolano
    ogni numero che questo giro scrive.
  - **success:** ogni riga della tabella dei gate rimanda a un record di
    `bin/measure.sh` il cui comando gira sul referente che la prosa nomina.
    I cinque criteri: (1) ogni numero esce da un comando registrato, sul
    referente **esatto** nominato; (2) nessuno strumento di misura in `/tmp`:
    chi produce un numero e' versionato e ha un test; (3) ogni mutazione porta
    **entrambi** i bracci nel record, sullo **stesso** giudice; (4) nessun numero
    ottenuto per sottrazione ne' letto dopo una pipe; (5) il verde si misura
    sull'albero che contiene il lavoro consegnato.

- **CAP-7 — la cartella delle sonde scende a zero.**
  - **intent:** le attese illimitate di `ops/loop/sonde/` sono riparate in questo
    giro, non messe in baseline.
  - **success:** il cancello, eseguito con `--radice` su un albero campione che
    contiene **soltanto** `ops/loop/sonde/`, stampa **9 attese / 9 senza limite**
    ed esce **1** sul contenuto di `d7bb55c`, e **10 attese / 0 senza limite**
    ed esce **0** sul contenuto consegnato. Due numeri stampati, non una
    differenza: la decima e' la sonda di controllo scritta qui, ed e' limitata.
    La baseline non contiene nessuna riga di quella cartella, e a tenerla fuori
    e' il test `test_le_sonde_sono_a_zero`, non un commento — che pero' guarda
    **la baseline**, non il censimento: e' per questo che la success sta nei due
    bracci del cancello e non nel test.

- **CAP-8 — le quattro scritture con cui un'attesa si traveste.**
  - **intent:** un `timeout=` che vale `None` non e' un limite; `import
    subprocess as sp` non e' meno pericoloso perche' rinominato; `getoutput`,
    `getstatusoutput` e `os.popen` attendono quanto gli altri.
  - **success:** ognuna delle quattro esce **1**, e `timeout=LIMITE_S` — una
    costante, non un letterale — resta **0**.

- **CAP-10 — il ratchet non perde la propria provenienza.**
  - **intent:** `--aggiorna` conserva l'intestazione della baseline: le righe di
    commento che dicono cos'e' quel file, che `--aggiorna` restringe soltanto, e
    da quale receipt vengono i numeri.
  - **success:** dopo un `--aggiorna` che restringe, il file porta ancora le sue
    righe d'intestazione (il comando ne stampa il numero) e il digest sha256
    torna quello del sigillo. Il difetto opposto e' stato **visto**: prima del
    rimedio `--aggiorna` riscriveva il file con le sole voci e buttava via
    quindici righe di provenienza.

- **CAP-9 — il numero dei bracci e l'albero del verde non si tengono a mano.**
  - **intent:** ogni conteggio che compare in prosa e' stampato da un comando
    (`len(BRACCI) + 1`, le righe della baseline, l'exit del cancello), e il verde
    del vault si misura sull'albero che contiene il lavoro consegnato; i commit
    che seguono il record si **enumerano**, invece di lasciare la regressione
    infinita implicita.
  - **success:** la riga del README delle sonde e la tabella della receipt
    citano l'etichetta del record che ha prodotto il numero; la receipt nomina
    lo sha su cui gira l'ultimo verde e stampa `git show --stat` dei commit
    successivi.

## Constraints

- **Il cancello e' esso stesso uno strumento che il loop esegue**: le sue attese
  devono essere limitate, o il primo oggetto a violare la regola e' quello che la
  scrive. Lo tiene `test_il_cancello_non_ha_attese_illimitate`.
- **Il limite in secondi si dichiara una volta**, in una costante del modulo che
  lo usa, sopra la durata **osservata** del comando piu' lento di quella
  cartella. Un limite indovinato produce rossi falsi su una macchina lenta, ed e'
  il modo piu' rapido di rendere odioso un cancello giusto.
- **Nessuna riga di PROSA viene dal ramo respinto.** Il codice del cancello, dei
  test e della sonda si porta — non e' mai stato contestato; il testo si
  riscrive, perche' e' il testo a essere stato bocciato.
- **Contratto d'uscita 0/1/2** come gli altri cancelli di `bin/ci/`: 0 concorde,
  1 divergente, 2 non ho potuto guardare. Uno stdout vuoto e' un errore.
- **Una correzione di una propria affermazione falsa si scrive, non si cancella.**
  Il `.memlog.md` e' append-only: la voce sbagliata resta, e la voce che la
  smentisce le sta sotto.

## Non-goals

- **Non ripara le altre ottantacinque attese illimitate.** Entrano in baseline e
  scendono nei giri successivi; fingere di sapere il limite giusto per ognuna
  sarebbe indovinare **ottantacinque** volte. Ottantacinque e' il numero di righe
  non-commento della baseline e il numero che il cancello stampa, non una
  sottrazione.
- **Non tocca `ops/loop/ardesia-loop.sh` ne' `ops/loop/cov.sh` ne'
  `bin/pre-commit-gate.py`**: sono OWNER-LOCKED. Il rimedio a monte — un limite
  sull'iterazione intera — resta di Andrea.
- **Non pretende di aver causato le otto ore a vuoto del 2026-08-21.** Quelle
  hanno una causa gia' misurata e diversa. Questo cancello guarda un pericolo che
  **non e' ancora scattato**.
- **Non ripara il rosso di `tests.test_obsidian_scrive`.** E' preesistente
  **misurato** — esce 1 anche su un worktree pristine a `d7bb55c` che non
  contiene una riga di questo giro — e riparare la superficie viva di Obsidian e'
  un altro loop.

## Success signal

`python3 bin/ci/attesa_illimitata.py` esce **0** sull'albero consegnato; una
mutazione che aggiunge un'attesa nuda lo fa uscire **1**; una riga di baseline
che non corrisponde a nessuna attesa lo fa uscire **1** dall'altro verso;
`ops/loop/sonde/` riporta **0** dove ne portava 9; e la sonda che giudica il
cancello, resa ambigua la sua ancora, esce **2** invece di mutare a vuoto.

## Dove il cancello e' cablato, e dove NON e'

`bin/pre-commit-gate.py` e `ops/loop/cov.sh` sono **OWNER-LOCKED**: cablarlo li'
esce 1 con «un'iterazione non puo' cambiare il proprio standard di verita'». La
modifica e' stata **ritirata**, non aggirata.

L'arco automatico esiste comunque e non passa da nessun file bloccato:
`.github/workflows/knowledge-integrity.yml` esegue
`python3 -m unittest discover -s tests -v`, e
`tests/test_attesa_illimitata.py::test_e_verde_sul_vault_vero` esegue il cancello
sul vault vero.

⚠️ Cosa NON significa. Quel workflow ha `on: pull_request` e
`push: branches: [main, sync/current]`. Cablato nel test e non nel dispatcher, il
cancello **non ferma un commit locale**: e' un `gate-Andrea`, scritto nel
giornale, non un dettaglio da tacere.

## Assumptions

- I limiti delle sonde **non sono uno solo**: cinque portano `LIMITE_S = 60` e
  `ops/loop/sonde/mutazioni-deferimento.py` porta `LIMITE_SUITE_S = 600`, perche'
  quella sonda esegue una suite. Nessun record di questo giro **cronometra** un
  comando: «scelto sopra la durata osservata» e' un'assunzione portata dal giro
  precedente, non una misura presa qui, e va letta come tale.

## Open Questions

- **APERTA** — se le ottantacinque attese che restano in baseline debbano
  scendere a ritmo imposto (una quota per giro) o a occasione. Un ratchet senza
  ritmo scende solo finche' qualcuno se ne ricorda.
- **APERTA** — il `persistent_fact` di `bmad-spec` punta a
  `{project-root}/project-context.md`, che nel prodotto **non esiste**: la catena
  e' stata percorsa senza quel contesto.
