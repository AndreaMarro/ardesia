# Retrospettiva — spec-cancello-e2e-copertura

**Modo:** headless (sessione autonoma, Andrea non presente).
**Ambito:** gli otto giri del cancello e2e, da `ad854936` a `d1852453`, piu' la
correzione `e33d51a3`/`b273c96b`.
**Verdetto macchina:** **accepted-with-open-items**.

---

## Assunzioni prese senza l'utente (traccia d'audit)

1. **Quale epic.** Nessun `sprint-status.yaml` esiste in questo repository
   (`_bmad-output/implementation-artifacts` assente): modo **stories**, cartella scelta
   `_bmad-output/specs/spec-cancello-e2e-copertura/`. Non c'e' `stories.yaml`:
   la lista dei "giri" e' stata derivata dai commit `ci:` che la `SPEC.md` e
   `journey-ammessi.md` nominano, ed e' **una narrowing dichiarata**, non la
   lista canonica.
2. **Il cancello di completezza non ha girato.** Senza `sprint-status.yaml` non
   esiste `pending_stories`. Registrato, e la retro procede lo stesso.
3. **Nessuna discussione di squadra** (Fase 3): non gira mai headless.
4. **Nessun elemento d'azione e' stato eseguito.** Sono proposte.

## Sommario dell'epic

Otto giri per costruire un cancello e2e che seleziona journey per **potere
discriminante**, non per colore. Sette journey ammessi, uno spostato in
advisory, due respinti — l'ultimo per una ragione che ha cambiato il criterio.

| # | commit | esito |
|---|---|---|
| 1 | `ad854936` | `elab-lab-marcatura-durabile` ammessa |
| 2 | `4f54cc3e` | `product-flow-shell` ammessa · una verde respinta con la sua ragione |
| 3 | — | `lessonos-eventlog-multitab` ammessa · `toolhost-srcdoc-bypass` → advisory |
| 4 | `0c394c48` | `saved-lessons` ammessa |
| 5 | `7b91c81f` | `sim-esp2-senza-resistore` ammessa |
| 6 | `22489d7d` | `ripasso-live` ammessa, con il costo scritto accanto |
| 7 | `f54cf2b9` | `studentpack-artifact` ammessa |
| 8 | `d1852453` | `plugin-postit-room-reload` **respinta**: coperta da un required |

---

## Reperti, ognuno con la sua fonte

### R-1 — Due misure "indipendenti" che condividevano la causa · **fix-now, gia' fatto**

**Fonte:** `30-Evidence-Receipts/2026-08-22-R-L-OTTAVA-SPEC-E-IL-ROSSO-CHE-CONTA.md` §4,
corretta in `b273c96b` e nel vault.

Il giro 8 ha misurato la suite unitaria **due volte** — sul tip del ramo e in un
worktree staccato su `main` — e ha concluso «rosso su `main`, non e' colpa del
ramo». Le due misure sembravano indipendenti: **due alberi diversi, due commit
diversi**. Non lo erano: giravano **sullo stesso `node` di sistema**, e la causa
stava li'.

Il metodo diceva «due referenti battono uno», ed e' vero solo se i due referenti
**differiscono per la variabile sospetta**. Qui variava l'albero e la variabile
vera era l'ambiente: due misure dello stesso esperimento presentate come una
conferma incrociata. Misurato dopo: `node v22.14.0` → `5 passed, 112 passed`,
exit **0** (`e33d51a3`).

**Lezione, e ha una forma verificabile:** un record che afferma un fatto sulla CI
deve portare il **referente d'ambiente** (versione del runtime), non solo lo
`sha`. Uno `sha` identifica il codice, non il programma che lo esegue.

### R-2 — Il repository non dichiara quale Node vuole · **fix-now, NON fatto**

**Fonte, misurata:** nessun `.nvmrc` alla radice ne' in `apps/studio/`;
`grep -c engines package.json` → **0** in entrambi. `ci.yml` fissa
`node-version: 22` in tre job (righe 28, 113, 189). Questa macchina ha
`node 26.5.1` in `/opt/homebrew/bin` e `22.14.0` in `/usr/local/bin`.

E' la deriva che ha reso il difetto invisibile: due sviluppatori sullo stesso
commit ottengono due verdetti, e niente nel repository lo dice. Non riparata in
`e33d51a3` per disciplina — **una modifica alla volta** — ed e' l'elemento
d'azione piu' economico che resta.

> **Chiuso il 2026-08-22 (`1022e35a`), e la chiusura ha trovato altro.** Alla
> prima esecuzione utile il gate nuovo ha stampato una divergenza che nessuna
> receipt aveva mai nominata: `studio-preview-readiness.yml:55` chiedeva
> `"22.12.0"` mentre `ci.yml` chiedeva `22` in tre job. **Due workflow, due
> Node**, e zero righe nell'albero che lo dicessero. Allineato a `22`, che e'
> la versione sotto cui la suite e' stata davvero eseguita.

### R-3 — Il cancello e2e misurava solo la propria corsia · **lezione di processo**

**Fonte:** le sette receipt dei giri 1-7 nel vault; nessuna esegue
`npx vitest run`. Il difetto e' stato trovato al giro 8, e solo perche' la
mutazione dell'ottava spec ha richiesto un braccio di controllo sulla suite
unitaria.

Sette giri hanno promosso journey in un job **non required** senza mai guardare
il job **required** accanto. Il cancello selezionava bene *dentro* la propria
corsia ed era cieco al fatto che la corsia non fosse quella che conta.

### R-4 — Il criterio d'ingresso era incompleto · **gia' riparato, giro 8**

**Fonte:** `journey-ammessi.md`, sezione «Una spec RESPINTA perche' un cancello
che c'e' gia' la copre».

«Cosa si rompe se il prodotto peggiora» mancava di «**al netto di cio' che e'
gia' obbligatorio**». Con la mezza frase mancante, la ottava spec sarebbe
entrata: e' verde, discriminante rispetto ai sette dentro (`7 passed` sotto la
mutazione A) e avrebbe aggiunto zero protezione.

### R-5 — Un difetto che nessun cancello vede · **aperto**

**Fonte:** `journey-ammessi.md`, mutazione C. Un post-it disegnato al **40%** del
suo riquadro passa la suite unitaria (jsdom non ha geometria: `5 file / 22 test`,
identico al partenza) **e** passa la candidata (`width > 120` su riquadri molto
piu' grandi). Nessuno dei due lo vede.

---

## Elementi d'azione, proposti e non eseguiti

| # | azione | fonte | stato |
|---|---|---|---|
| A-1 | dichiarare la versione di Node nel repository, e farla rispettare | R-2 | **FATTO** (`1022e35a`) — `.nvmrc` = 22 + `bin/ci/node_version_gate.py` in hygiene. ⚠️ Alla prima esecuzione utile ha trovato una divergenza che nessuno sapeva: `studio-preview-readiness.yml:55` chiedeva `"22.12.0"` mentre `ci.yml` chiedeva `22` |
| A-2 | ogni receipt che afferma un fatto sulla CI porta il referente d'ambiente, non solo lo `sha` | R-1 | **proposto** |
| A-3 | il giro che promuove un journey esegue anche i check **required** e ne scrive l'exit | R-3 | **FATTO** (giro 9, `0d55564e`) — undici exit nel registro, compreso il rosso di `engine` con il suo referente d'ambiente |
| A-4 | decidere se la mutazione C valga una spec, o se la soglia della candidata vada legata al riquadro | R-5 | **FATTO** (giro 9, `0d55564e`) — soglia legata al riquadro (`fillRatio > 0.9`), e la spec e' entrata proprio per quello |
| A-5 | `e2e journey (blocca)` fra i required su `main` | receipt `R-IL-CANCELLO-CHE-SI-CHIAMA-BLOCCA` | **gate-Andrea, aperto** |

---

## Verdetto d'accettazione

**accepted-with-open-items.**

Cio' che i criteri dell'epic chiedevano e' stato fatto: sette journey ammessi,
ognuno con una mutazione discriminante misurata e il costo scritto accanto; due
respinte con la loro ragione nel registro; il criterio d'ingresso corretto
quando si e' scoperto incompleto.

Cio' che resta aperto e' piu' grande di cio' che e' chiuso: il cancello
**riporta e non ferma** (non e' fra i required), e per otto giri nessuno ha
guardato il cancello che ferma davvero. Cinque elementi d'azione, nessuno
eseguito qui.

**Non e' un'accettazione silenziosa:** gli elementi aperti sono nella tabella
sopra, con la fonte di ognuno.
