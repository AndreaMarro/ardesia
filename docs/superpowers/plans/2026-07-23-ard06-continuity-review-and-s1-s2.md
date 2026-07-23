# ARD-06 Continuità — re-review integrale del design + slice S1/S2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare il design ARD-06 da verdetto PARZIALE a verdetto pieno — correggendo prima la premessa diventata falsa — e, solo se il verdetto è APPROVED, implementare le slice ARD-06-A (schema + projector puro) e ARD-06-B (loader session-scoped + indice query) in TDD.

**Architecture:** Il piano ha due fasi separate da un gate umano-verificabile. La Fase 0 non tocca il prodotto: corregge in append-only la parte stale del design nel vault, poi ne esegue la re-review avversariale sezione per sezione e produce un verdetto scritto. La Fase 1 e la Fase 2 implementano le due prime slice del design — una read model NUOVA (`continuityProjection.ts` + `continuityLoader.ts`), additiva e read-only, che non tocca `TeacherDashboardProjection` né cancella il cruscotto storico.

**Tech Stack:** TypeScript 5 strict · React 19 · Vitest (jsdom) · fake-indexeddb per i test IndexedDB · Playwright (Chromium) · git/gh CLI.

## Global Constraints

Valgono per OGNI task. I requisiti di ogni task li includono implicitamente.

- **Worktree di lavoro:** `/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717`.
- **Vault:** `/Users/andreamarro/ARDESIA-KNOWLEDGE`. **MAI `git add -A`** (Syncthing): commit con path espliciti. Gate di chiusura: `python3 bin/vault-graph-kpi.py 0.95` exit 0.
- **Design normativo:** `~/ARDESIA-KNOWLEDGE/50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS/03-ARD-06-CONTINUITY-DESIGN.md`. Chiamato «il design» in tutto il piano. Non si implementa contro un design non approvato.
- **Base:** `origin/main` = `fddda617217b1fb0c3f27bb88b323fcd20c1c745` (merge di PR #198, tag `founder-beta-0.1-rc1`).
- **Branch:** un solo branch nuovo per fase implementativa, creato da `origin/main`: `codex/ard06-a-projection-20260723` (Fase 1) e `codex/ard06-b-loader-20260723` (Fase 2). Mai da un worktree candidato.
- **Vincolo di slice del design (§13):** massimo **5 file tracked** per slice, di cui al massimo 3 funzionali/test. `apps/studio/STATUS.md` e `apps/studio/log.jsonl` sono sempre 2 dei 5. I task dentro una fase accumulano commit sulla **stessa** slice: non aggiungere file oltre quelli elencati nella sezione File Structure della fase.
- **Vitest — profilo deterministico obbligatorio** (§14 del design), sempre tutti i flag:
  ```bash
  npm --prefix apps/studio run test -- <file> \
    --pool=threads --maxWorkers=1 --no-file-parallelism \
    --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
  ```
- **`tsc` non è opzionale:** vitest/esbuild NON typecheckano. Ogni task che tocca `.ts`/`.tsx` finisce con `npm --prefix apps/studio run typecheck` verde prima del commit.
- **Divieti assoluti nel path Founder** (§15 «Stop immediato» del design). Se il codice che stai scrivendo contiene uno di questi, fermati: `readAll()`, `readAllEnvelopes()`, `readEnvelopesByLesson()`, `PATHS.JOURNAL`, `PATHS.SESSION`, `raw/events.jsonl`, `raw/session.yaml`, `deserializeEvents`, `roomFromHash() || "current"`, qualunque default `current`/ultimo-globale/hash-vuoto.
- **Mai import di `TeacherDashboardView` o `projectTeacherDashboard`** dai file nuovi. Il cruscotto storico resta intatto sulla route storica.
- **Nessun `Date.now()`, clock, DOM, storage, rete o AgentMemory** dentro il projector puro: lo stesso snapshot deve produrre byte JSON identici.
- **Stile commit:** convenzioni del repo (`feat(scope):`, `fix(scope):`, `test(scope):`, `docs(scope):`). Ogni commit termina con `Co-Authored-By:` dell'agente.
- **Etichette epistemiche** in ogni receipt: OBSERVED / REPRODUCED / INFERRED / NOT_RUN / BLOCKED. Un test non eseguito resta NOT_RUN.
- **Non claimare mai** «fencing due-tab», «FB-06 chiusa», «beta pronta». FB-06 resta rossa finché ARD-07/ARD-08 non rendono risolvibili risultato/plugin/build evidence (§15.10 del design).

---

## File Structure

### Fase 0 — correzione design + re-review (nessun file di prodotto)

| File | Responsabilità |
|---|---|
| `~/ARDESIA-KNOWLEDGE/50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS/03-ARD-06-CONTINUITY-DESIGN.md` | **Modify** — appendice v3 append-only che corregge le tre occorrenze della premessa stale. I byte esistenti non si toccano. |
| `~/ARDESIA-KNOWLEDGE/20-Decisions/2026-07-23-D-ARD06-REVIEW.md` | **Modify** — il verdetto PARZIALE esistente viene sostituito dal verdetto pieno. |
| `~/ARDESIA-KNOWLEDGE/30-Evidence-Receipts/2026-07-24-ARD06-ENTRY-GATE.md` | **Create** — receipt della verifica G0/G1/G2/G3. |

### Fase 1 — slice ARD-06-A (5 file tracked, §13 del design)

| File | Responsabilità |
|---|---|
| `apps/studio/src/lessonos/continuityProjection.ts` | **Create** — tutti i tipi `Continuity*V1` e la funzione pura `projectContinuityV1`. Nessun I/O, nessun import di React o di storage. |
| `apps/studio/src/__tests__/ContinuityProjection.test.ts` | **Create** — RED-06-04/05/06 + exhaustiveness + permutation oracle. |
| `apps/studio/src/__tests__/ContinuityProjectionImpossibleStates.test-d.ts` | **Create** — fixture `@ts-expect-error` che congelano al typecheck le combinazioni impossibili della union Simulation (RED-06-06). |
| `apps/studio/STATUS.md` | **Modify** — una voce append-only, fatti e numeri. |
| `apps/studio/log.jsonl` | **Modify** — un record append-only in coda. **Mai riordinare le righe storiche.** |

> Sono 5 file tracked: 3 funzionali/test + i 2 ledger. Il file `.test-d.ts` conta come test.

### Fase 2 — DUE slice, non una

> **Correzione al §13 del design, trovata scrivendo questo piano.** Il design elenca per ARD-06-B cinque file: `continuityLoader.ts`, `indexedDbEventLog.ts`, il test, STATUS e log. Quel taglio **non sta in piedi**, per due ragioni verificate sul codice di `origin/main@fddda617`:
>
> 1. `decodeJournalJsonl` restituisce `envelopes: readonly JournalEnvelopeV2[]` **senza numero di riga** — il `line` esiste solo dentro `issues` (`ReplayEngine.ts:198-202`). Ma `ScopedContinuitySnapshotV1.journalEvents` richiede `{ line, envelope }` con l'ordine fisico. L'indice dell'array `envelopes` **non è** il numero di riga: le righe legacy vengono adattate a envelope e le righe invalide saltate, quindi gli indici scorrono. Servirebbe quindi toccare anche `ReplayEngine.ts` → sesto file.
> 2. `readEnvelopesBySession` non è una funzione di modulo ma un **metodo** di `IndexedDbEventLog` che fa `(await this.readAllEnvelopes()).filter(...)` (`indexedDbEventLog.ts:588-592`), e `dbName` è per-istanza. La migration dell'indice tocca `open()` e `DB_VERSION`, cioè il cuore della classe, con i suoi test esistenti.
>
> Le due cose non appartengono alla stessa unità di review. Si separano:

**Slice ARD-06-B0 — indice composto (4 file tracked)**

| File | Responsabilità |
|---|---|
| `apps/studio/src/lessonos/indexedDbEventLog.ts` | **Modify** — `DB_VERSION` 1→2, migration additiva dell'indice `by_lesson_session_seq`, `readEnvelopesBySession` riscritto su key-range. |
| `apps/studio/src/__tests__/IndexedDbEventLog.test.ts` | **Modify** — test dell'indice e monkey-patch anti scan-then-filter. |
| `apps/studio/STATUS.md` | **Modify** |
| `apps/studio/log.jsonl` | **Modify** |

**Slice ARD-06-B — loader session-scoped (5 file tracked)**

| File | Responsabilità |
|---|---|
| `apps/studio/src/lessonos/continuityLoader.ts` | **Create** — porte `ContinuityEventReaderV1`/`ContinuityWorkspaceReaderV1`, validazione scope, letture esatte, gate unicità eventId e `payload.room`, costruzione di `ScopedContinuitySnapshotV1`. |
| `apps/studio/src/store/ReplayEngine.ts` | **Modify** — `JournalDecodeResult.envelopes` porta il proprio `line` fisico. Cambio additivo e retrocompatibile. |
| `apps/studio/src/__tests__/ContinuityLoader.test.ts` | **Create** — RED-06-01/02/03 + call ledger esatto. |
| `apps/studio/STATUS.md` | **Modify** |
| `apps/studio/log.jsonl` | **Modify** |

---

# FASE 0 — Correzione del design e verdetto (GATE)

> **Nessuna riga di codice di prodotto in questa fase.** Se il Task 2 non produce `APPROVED_FOR_IMPLEMENTATION`, il piano si ferma qui e i Task 3+ non vengono eseguiti.

## Task 1: Correzione append-only della premessa stale del design

Il design fonda parte del verdetto su un fatto che il commit `a24c3e66` ha reso falso. Tre occorrenze:

| Riga | Testo attuale | Stato |
|---|---|---|
| §1, riga 67 | «questa vista chiama `readAll()` sul log LessonOS e legge il journal flat globale `raw/events.jsonl`» | la seconda metà è **falsa**; `readAll()` è ancora vero |
| §3.2, riga 157 | «`loadJournalEventsFromStore()` legge `PATHS.JOURNAL`, cioè il journal flat legacy» | **falsa** |
| §3.4, riga 187 | «non usa `deserializeEvents`, `PATHS.JOURNAL`, `journalRoom` o adattamenti V1» | resta valida **come prescrizione**, ma va distinta dalla descrizione dello stato attuale |

**Files:**
- Modify: `~/ARDESIA-KNOWLEDGE/50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS/03-ARD-06-CONTINUITY-DESIGN.md` (append in coda)

**Interfaces:**
- Consumes: niente
- Produces: la sezione `## 17. Addendum v3` che il Task 2 deve leggere prima di emettere il verdetto

- [ ] **Step 1: Verificare firsthand che la premessa sia davvero stale**

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717"
git fetch origin --prune
git show origin/main:apps/studio/src/design/TeacherDashboardView.tsx | grep -n "PATHS.JOURNAL\|roomPaths(room).journal\|deserializeEvents"
```

Atteso: **zero** occorrenze di `PATHS.JOURNAL`; una riga con `roomPaths(room).journal`; una riga `deserializeEvents(await blob.text(), journalPath)`.

Se invece `PATHS.JOURNAL` compare, la premessa NON è stale: fermati, non scrivere l'addendum, e riporta la discrepanza.

- [ ] **Step 2: Verificare che `readAll()` sia ancora vero (la parte di §1 che NON va corretta)**

```bash
git show origin/main:apps/studio/src/design/TeacherDashboardView.tsx | grep -n "readAll()"
```

Atteso: almeno 2 occorrenze (`realEventLog.readAll()` e `loadEventsFromStore`). Servono a scrivere un addendum che corregge solo ciò che è cambiato.

- [ ] **Step 3: Calcolare il SHA-256 corrente del design, prima di modificarlo**

```bash
cd ~/ARDESIA-KNOWLEDGE/50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS
shasum -a 256 03-ARD-06-CONTINUITY-DESIGN.md
```

Annota il valore: va citato nell'addendum come «byte v2 su cui l'addendum si innesta».

- [ ] **Step 4: Appendere la sezione 17 in coda al design**

Appendi ESATTAMENTE questo, sostituendo `<SHA_V2>` con il valore dello Step 3 e `<DATA>` con la data odierna. Non modificare nessun byte esistente del file.

```markdown

---

## 17. Addendum v3 — correzione append-only di una premessa diventata falsa

Data: <DATA> (Europe/Rome). Innestato sui byte v2 con SHA-256 `<SHA_V2>`.

Questo addendum **non riapre il verdetto §1**: lo corregge su un punto di fatto e ne
lascia intatta la conclusione. I byte v2 sopra non sono stati modificati; le tre
occorrenze citate restano leggibili nella loro forma originale come storia.

### 17.1 Che cosa è cambiato nel codice

Il commit `a24c3e66` (integrato in `origin/main@fddda617`, tag `founder-beta-0.1-rc1`)
ha modificato `apps/studio/src/design/TeacherDashboardView.tsx`:

- `loadJournalEventsFromStore(room)` legge ora `roomPaths(room).journal`, non più
  `PATHS.JOURNAL`;
- il source path viene passato a `deserializeEvents(text, journalPath)`, quindi
  `decodeJournalJsonl` deriva la lessonId attesa dal path e rifiuta gli envelope che ne
  dichiarano un'altra.

Motivo del cambio: leggendo il path flat, la vista mostrava **zero** contributo journal
(nessun writer scrive più flat da FB-4C2) e, corretto il solo path, il decoder riceveva
il proprio `source` di default — il journal flat, dove gli envelope v2 sono vietati —
mandando la refresh in errore e lasciando la zona statistiche vuota **senza alcun
messaggio**. Riprodotto in Chromium: 5 card → 0 card dopo un solo `recordMathInsert`,
zero errori in console.

### 17.2 Le tre righe da leggere con questa correzione

| Riga v2 | Come va letta ora |
|---|---|
| §1 (riga 67) | «chiama `readAll()` sul log LessonOS» resta **VERO**. «legge il journal flat globale `raw/events.jsonl`» è **SUPERATO**: legge `raw/<lessonId>/events.jsonl`. |
| §3.2 (riga 157) | **SUPERATO**. Il resto di §3.2 — `readAll()` globale, projection multi-room, `journalRoom` che attribuisce un array a una room, ToolHost ripasso con `readAll()` proprio — resta **VERO**. |
| §3.4 (riga 187) | Resta **VERO come prescrizione** per la Continuità nuova: non deve usare `deserializeEvents`, `journalRoom` o adattamenti V1. Non descrive più il cruscotto storico, che ora usa entrambi. |

### 17.3 Che cosa NON cambia

Il verdetto §1 regge integralmente. Il fix `a24c3e66` è **contenimento, non la read
model**:

- `TeacherDashboardProjection` è intatta — il vincolo §13 «nessuna slice tocca
  `TeacherDashboardProjection`» è rispettato e resta in vigore;
- `loadEventsFromStore()` chiama ancora `readAll()`: il boundary di §5.2 non esiste;
- la route resta l'alias `?vista=cruscotto`, senza `lessonId`/`sessionId`;
- nessun contratto `lessonId + roomId + sessionId` è provato;
- nessuna sentinella B è testata nella UI di A.

Il cruscotto storico **non** diventa quindi una Continuità accettabile e **non** può
essere usato come fallback. Le slice §13 restano tutte da fare.

### 17.4 Effetto sugli oracoli

Nessun oracolo RED di §12 cambia. RED-06-02 vieta `PATHS.JOURNAL` nel path Founder:
resta RED perché il path Founder non esiste ancora. Il fatto che il cruscotto storico
non usi più quel path non soddisfa alcun oracolo ARD-06.
```

- [ ] **Step 5: Verificare che i byte v2 siano intatti**

```bash
cd ~/ARDESIA-KNOWLEDGE/50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS
head -c $(git show HEAD:50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS/03-ARD-06-CONTINUITY-DESIGN.md 2>/dev/null | wc -c) 03-ARD-06-CONTINUITY-DESIGN.md | shasum -a 256
```

Atteso: lo stesso `<SHA_V2>` dello Step 3. Se differisce, hai modificato byte esistenti: fai `git checkout -- ` sul file e ricomincia dallo Step 4.

- [ ] **Step 6: Gate del vault**

```bash
cd ~/ARDESIA-KNOWLEDGE && python3 bin/vault-graph-kpi.py 0.95 >/dev/null; echo "EXIT=$?"
```

Atteso: `EXIT=0`.

- [ ] **Step 7: Commit del vault con path espliciti**

```bash
cd ~/ARDESIA-KNOWLEDGE
git add 50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS/03-ARD-06-CONTINUITY-DESIGN.md
git commit -m "docs(ard-06): addendum v3 append-only sulla premessa del journal flat

a24c3e66 ha reso falsa la riga di §1 e §3.2 sul journal flat globale: la vista
legge ora raw/<lessonId>/events.jsonl e passa il source path al decoder.
L'addendum corregge il fatto e lascia intatti i byte v2 e la conclusione del
verdetto: il fix e' contenimento, non la read model, e readAll() resta.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Re-review avversariale integrale del design → verdetto pieno

Questa è la re-review che `D-ARD06-REVIEW` ha dichiarato NOT_RUN. Non è una rilettura di cortesia: la review indipendente `04-...` ha già dato APPROVED, quindi il valore di questo passaggio è **cercare attivamente ciò che quella review ha mancato**.

**Files:**
- Read: `03-ARD-06-CONTINUITY-DESIGN.md` (1416 righe + addendum v3), `04-ARD-06-INDEPENDENT-REVIEW.md`
- Modify: `~/ARDESIA-KNOWLEDGE/20-Decisions/2026-07-23-D-ARD06-REVIEW.md`

**Interfaces:**
- Consumes: `## 17. Addendum v3` dal Task 1
- Produces: nel file di decisione, una riga `verdict: APPROVED_FOR_IMPLEMENTATION` oppure `verdict: CHANGES_REQUIRED`. I Task 3+ leggono quella riga.

- [ ] **Step 1: Verificare la chiusura sostanziale dei 5 Important v1**

Per ciascuno, leggi la sezione indicata e rispondi con SÌ/NO **citando la riga che lo prova**. La tabella §0 mappa i finding, ma la mappatura non è la chiusura.

```bash
cd ~/ARDESIA-KNOWLEDGE/50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS
sed -n '455,468p'  03-ARD-06-CONTINUITY-DESIGN.md   # I2 unicità eventId nell'unione
sed -n '469,492p'  03-ARD-06-CONTINUITY-DESIGN.md   # I1 payload.room sui tre kind
sed -n '620,660p'  03-ARD-06-CONTINUITY-DESIGN.md   # I3 union Simulation
sed -n '918,1050p' 03-ARD-06-CONTINUITY-DESIGN.md   # I4 required set + ordine P0
sed -n '100,142p'  03-ARD-06-CONTINUITY-DESIGN.md   # I5 fonti rilette e congelate
```

Criterio: la chiusura è sostanziale se il design **specifica il comportamento in modo falsificabile** (una condizione, un output, un oracolo), non se lo nomina.

- [ ] **Step 2: Cercare attivamente nuovi difetti — checklist di attacco**

Non cercare conferme. Per ciascuno, cerca il controesempio; se non lo trovi, dichiara che non l'hai trovato.

1. **Totalità del comparator §9.2.** Due candidati source con `severity`, `SOURCE_ORDER`, `SOURCE_CODE_ORDER`, `path`, `sha256` e `bytes` tutti uguali sono distinguibili? Se no, l'ordine non è totale e il permutation oracle di RED-06-05 fallirà in modo intermittente. Verifica anche il caso `preserved: null` su entrambi.
2. **Totalità del comparator evidence.** `ownerSeq` è definito per un owner che proviene dal **journal** e non da LessonOS? §9.2 dice «`ownerSeq` è il `seq` dell'envelope LessonOS proprietario» — ma un `material` può nascere da una riga journal, che ha `line`, non `seq`. Se è un buco, è un difetto reale.
3. **`requiredSourceSet` e phase `empty`.** §9.1 dice che scene/plugin-artifact/build diventano obbligatori «se esiste un embed Simulation nella scena» — ma la scena è essa stessa una sorgente che può essere `missing`. Il calcolo è ben fondato o circolare?
4. **Precedenza phase vs `sourceHealth`.** §6 dice che `sourceHealth` considera solo corrupt/degraded, e che con phase `corrupt` la Simulation è `unavailable/source-corrupt`. Ma la union `unavailable` richiede un `reason`: `source-corrupt` è nella lista? (Verifica alle righe 645-660.)
5. **`lastUncorrectedError = openLoops[0] ?? null`.** §6 lo impone. §9.3 P2 sceglie `openLoops[0]`. Se l'ordinamento di `openLoops` non è specificato in modo totale in §7.3, allora due campi della projection dipendono da un ordine non congelato.
6. **Addendum v3.** Introduce contraddizioni con §12 o §15? (Attesa: no — verificalo.)
7. **Slice §13 vs vincolo 5 file.** ~~Da verificare.~~ **Già verificato scrivendo questo piano: il taglio di ARD-06-B è sbagliato.** Vedi il riquadro in File Structure → Fase 2. Due difetti indipendenti, entrambi confermati sul codice di `origin/main@fddda617`: `decodeJournalJsonl` non espone il `line` con gli envelope (serve toccare `ReplayEngine.ts`, sesto file), e `readEnvelopesBySession` è un metodo di classe con `dbName` per-istanza, non una funzione di modulo (la migration tocca `open()`/`DB_VERSION` e i test esistenti della classe). Il piano taglia B in **B0 + B**. **Compito del reviewer:** confermare o rifiutare questo ri-taglio e registrarlo nel verdetto — se lo rifiuti, devi proporre un taglio alternativo che rispetti il vincolo, non tornare a quello del design.

- [ ] **Step 3: Verificare gli entry-gate §4 con comandi, non per assunzione**

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717"
git fetch origin --prune
echo "main: $(git rev-parse origin/main)"

# G0.1 — FSA case-stable integrato in main
git log origin/main --oneline --grep="FSA" --grep="case" -i | head -5
git show origin/main:apps/studio/src/store/drivers/fsa.ts | grep -c "toLowerCase\|caseFold\|collision"

# G0.3 — la base è main, non un worktree candidato
git merge-base --is-ancestor 62883e21 origin/main && echo "G0.3 candidato integrato: OK"

# G1 — contratto ARD-05 presente su main
git show origin/main:apps/studio/src/store/sessionState.ts | grep -n "export function sessionPaths\|SessionYamlV2"
git show origin/main:apps/studio/src/store/roomPaths.ts | grep -n "journal:"
```

Atteso: `sessionPaths` e `SessionYamlV2` esistono su main; `roomPaths().journal` esiste; il candidato è antenato di main.

**G2 (ARD-07) e G3 (ARD-08) NON sono soddisfatti** e non devono esserlo: il design lo prevede. Conseguenza vincolante per le Fasi 1-2: `simulation.status` non può mai essere `ready` o `error-open`, e `plugin-artifact:`/`build:` non risolvono. Registralo, non aggirarlo.

- [ ] **Step 4: Scrivere il verdetto**

Riscrivi `~/ARDESIA-KNOWLEDGE/20-Decisions/2026-07-23-D-ARD06-REVIEW.md` mantenendo il frontmatter e cambiando `status` in `CLOSED`. Il corpo deve contenere, in quest'ordine:

1. una riga `verdict: APPROVED_FOR_IMPLEMENTATION` **oppure** `verdict: CHANGES_REQUIRED`;
2. i 5 Important con SÌ/NO e la riga citata (Step 1);
3. i 7 punti di attacco con l'esito (Step 2), inclusi quelli dove non hai trovato nulla;
4. l'esito dei gate §4 con l'output dei comandi (Step 3);
5. se `CHANGES_REQUIRED`: l'elenco esatto delle correzioni, ciascuna con la sezione da modificare.

- [ ] **Step 5: Gate del vault e commit**

```bash
cd ~/ARDESIA-KNOWLEDGE && python3 bin/vault-graph-kpi.py 0.95 >/dev/null; echo "EXIT=$?"
git add 20-Decisions/2026-07-23-D-ARD06-REVIEW.md
git commit -m "docs(ard-06): verdetto pieno della re-review integrale del design

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 6: GATE — decidere se proseguire**

Leggi la riga `verdict:` che hai appena scritto.

- `CHANGES_REQUIRED` → **fermati qui.** Correggi il design in append-only (v4) e riesegui il Task 2. I Task 3+ non partono.
- `APPROVED_FOR_IMPLEMENTATION` → prosegui al Task 3.

---

# FASE 1 — Slice ARD-06-A: schema + projector puro

> Precondizione: Task 2 ha prodotto `APPROVED_FOR_IMPLEMENTATION`. Nessun I/O in tutta la fase.

## Task 3: Branch e scheletro dei tipi

**Files:**
- Create: `apps/studio/src/lessonos/continuityProjection.ts`

**Interfaces:**
- Consumes: `AppendedEventEnvelopeV2` da `../lessonos/eventlog`; `JournalEnvelopeV2` da `../store/JournalRecorder`; `SessionYamlV2` da `../store/sessionState`; `JsonObject` da `../core/contracts/eventEnvelope`; `validateRoomId` da `../store/roomPaths`
- Produces: tutti i tipi `Continuity*V1` e `ScopedContinuitySnapshotV1`, consumati dai Task 4-8 e da tutta la Fase 2

- [ ] **Step 1: Creare il branch dalla main integrata**

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717"
git fetch origin --prune
git checkout -b codex/ard06-a-projection-20260723 origin/main
git rev-parse --short=8 HEAD
```

Atteso: `fddda617`.

- [ ] **Step 2: Estrarre i blocchi di tipi normativi dal design**

I tipi sono già scritti nel design, congelati e hashati. Estraili invece di riscriverli a mano: una trascrizione manuale di 240 righe è una fonte di errori silenziosi.

```bash
D=~/ARDESIA-KNOWLEDGE/50-Research/2026-07-20-FOUNDER-BETA-IMPLEMENTATION-DESIGNS/03-ARD-06-CONTINUITY-DESIGN.md
{
  sed -n '332,336p' "$D"   # §5.1 ContinuityScopeV1
  echo
  sed -n '420,467p' "$D"   # §5.4 SourceName / SourceIssue / ScopedContinuitySnapshotV1
  echo
  sed -n '496,735p' "$D"   # §6 tutti i tipi della projection
} > /tmp/ard06-types.ts
wc -l /tmp/ard06-types.ts
```

Atteso: circa 296 righe. Verifica a occhio che il file inizi con `export type ContinuityScopeV1` e finisca con la chiusura di `ContinuityProjectionV1`.

- [ ] **Step 3: Scrivere il file con header, import e tipi**

Crea `apps/studio/src/lessonos/continuityProjection.ts` con questo header, poi incolla sotto il contenuto di `/tmp/ard06-types.ts`:

```ts
// ARDESIA Studio — ARD-06 Continuità: read model NUOVA e stretta.
//
// Questo modulo è puro: nessun I/O, nessun clock, nessun DOM, nessuna rete.
// Lo stesso snapshot deve produrre byte JSON identici (design §6).
//
// NON importa TeacherDashboardView né projectTeacherDashboard: la Continuità
// Founder non è il cruscotto storico filtrato, è una projection separata
// (design §1, §13).

import type { JsonObject } from "../core/contracts/eventEnvelope"
import type { AppendedEventEnvelopeV2 } from "./eventlog"
import type { JournalEnvelopeV2 } from "../store/JournalRecorder"
import type { SessionYamlV2 } from "../store/sessionState"
import { validateRoomId } from "../store/roomPaths"

// --- Tipi normativi: design §5.1, §5.4, §6 ---
```

- [ ] **Step 4: Aggiungere la validazione dello scope (design §5.1)**

In coda al file:

```ts
const CANONICAL_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type ContinuityScopeErrorCode =
  | "invalid-lesson-id"
  | "invalid-room-id"
  | "room-lesson-mismatch"
  | "invalid-session-id"

export class ContinuityScopeError extends Error {
  readonly code: ContinuityScopeErrorCode
  constructor(code: ContinuityScopeErrorCode) {
    super(`Continuity scope: ${code}`)
    this.code = code
  }
}

/**
 * Valida la tripla PRIMA di qualunque I/O (design §5.1). Nessun default:
 * "current", ultimo globale, prima room o hash vuoto non esistono qui.
 */
export function validateContinuityScopeV1(input: {
  lessonId: unknown
  roomId: unknown
  sessionId: unknown
}): ContinuityScopeV1 {
  if (typeof input.lessonId !== "string") throw new ContinuityScopeError("invalid-lesson-id")
  if (typeof input.roomId !== "string") throw new ContinuityScopeError("invalid-room-id")
  if (typeof input.sessionId !== "string") throw new ContinuityScopeError("invalid-session-id")

  let lessonId: string
  try {
    lessonId = validateRoomId(input.lessonId)
  } catch {
    throw new ContinuityScopeError("invalid-lesson-id")
  }
  let roomId: string
  try {
    roomId = validateRoomId(input.roomId)
  } catch {
    throw new ContinuityScopeError("invalid-room-id")
  }
  // La room è alias di routing, non una terza identità (design §5.1 invariante 2).
  if (roomId !== lessonId) throw new ContinuityScopeError("room-lesson-mismatch")
  if (!CANONICAL_UUID_RE.test(input.sessionId)) {
    throw new ContinuityScopeError("invalid-session-id")
  }
  return Object.freeze({ lessonId, roomId, sessionId: input.sessionId })
}
```

- [ ] **Step 5: Typecheck**

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717"
npm --prefix apps/studio run typecheck
```

Atteso: exit 0, nessun output di errore. Se `tsc` segnala tipi non definiti dentro i blocchi estratti (es. `ContinuityEvidenceV1` usato prima di essere dichiarato), NON è un problema: TypeScript non ha ordine di dichiarazione per i type alias. Se invece segnala un tipo davvero mancante (es. `JsonObject` non importato), aggiungi l'import.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/src/lessonos/continuityProjection.ts
git commit -m "feat(continuity): add the ARD-06 projection schema and scope validation

Types are extracted verbatim from the frozen design sections 5.1, 5.4 and 6
rather than retyped, so the module cannot drift from the normative bytes.
Scope validation runs before any I/O and has no defaults: no current, no last
global room, no empty hash.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Congelare al typecheck gli stati Simulation impossibili (RED-06-06, parte statica)

**Files:**
- Create: `apps/studio/src/__tests__/ContinuityProjectionImpossibleStates.test-d.ts`

**Interfaces:**
- Consumes: `ContinuitySimulationStateV1` dal Task 3
- Produces: niente per i task successivi; è un gate di typecheck

- [ ] **Step 1: Scrivere le fixture negative**

```ts
// Le combinazioni impossibili della union Simulation devono fallire al TYPECHECK,
// non a runtime (design §12 RED-06-06). Ogni @ts-expect-error qui è un oracolo:
// se un giorno la union si allarga e uno di questi diventa assegnabile, tsc
// fallisce sull'expect-error inutilizzato e il gate cattura la regressione.
import type { ContinuitySimulationStateV1 } from "../lessonos/continuityProjection"

const instance = {
  pluginId: "io.ardesia.simulation",
  pluginVersion: "1.0.0",
  instanceId: "embed-1",
  mountedAt: "2026-07-23T00:00:00.000Z",
  sceneDigest: "a".repeat(64),
  lastActivityAt: "2026-07-23T00:00:01.000Z",
} as const

// ready non può portare un errore aperto
// @ts-expect-error ready richiede openError null
const readyWithError: ContinuitySimulationStateV1 = {
  status: "ready",
  instance,
  openError: {
    eventId: "e1", occurredAt: "2026-07-23T00:00:02.000Z", errorId: "err-1",
    conceptId: "c1", label: { it: "x" }, instanceId: "embed-1",
    sceneDigest: "a".repeat(64), evidence: [],
  },
  evidenceBlock: null,
}

// error-open non può avere errore nullo
// @ts-expect-error error-open richiede openError non nullo
const errorOpenWithoutError: ContinuitySimulationStateV1 = {
  status: "error-open", instance, openError: null, evidenceBlock: null,
}

// not-mounted non può portare un'istanza
// @ts-expect-error not-mounted richiede instance null
const notMountedWithInstance: ContinuitySimulationStateV1 = {
  status: "not-mounted", instance, openError: null, evidenceBlock: null,
}

// unavailable richiede un reason
// @ts-expect-error unavailable richiede reason
const unavailableWithoutReason: ContinuitySimulationStateV1 = {
  status: "unavailable", instance: null, openError: null, evidenceBlock: null,
}

// missing-evidence non può avere evidenceBlock nullo
// @ts-expect-error missing-evidence richiede un evidenceBlock non nullo
const missingEvidenceWithoutBlock: ContinuitySimulationStateV1 = {
  status: "missing-evidence", instance, openError: null, evidenceBlock: null,
}

void readyWithError
void errorOpenWithoutError
void notMountedWithInstance
void unavailableWithoutReason
void missingEvidenceWithoutBlock
```

- [ ] **Step 2: Verificare che il typecheck PASSI (gli expect-error sono attesi e usati)**

```bash
npm --prefix apps/studio run typecheck
```

Atteso: exit 0. Un `@ts-expect-error` su una riga che NON produce errore fa fallire `tsc` con «Unused '@ts-expect-error' directive» — quello è il segnale che la union è troppo permissiva.

- [ ] **Step 3: Provare che gli oracoli mordono davvero**

Rendi temporaneamente permissiva la union: in `continuityProjection.ts`, aggiungi `| Readonly<{ status: string; instance: unknown; openError: unknown; evidenceBlock: unknown }>` a `ContinuitySimulationStateV1`, poi:

```bash
npm --prefix apps/studio run typecheck
```

Atteso: **FAIL** con «Unused '@ts-expect-error' directive» ×5. Poi rimuovi la variante permissiva e riverifica exit 0. Se il typecheck passa anche con la variante permissiva, le fixture non sono oracoli: riscrivile.

- [ ] **Step 4: Commit**

```bash
git add apps/studio/src/__tests__/ContinuityProjectionImpossibleStates.test-d.ts
git commit -m "test(continuity): freeze the impossible Simulation states at typecheck

Each @ts-expect-error is an oracle: widening the union makes tsc fail on the
now-unused directive. Verified by temporarily widening it — five directives go
unused and the typecheck fails.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: `projectContinuityV1` — precedenza della phase e normalizzazione corrupt

**Files:**
- Modify: `apps/studio/src/lessonos/continuityProjection.ts`
- Create: `apps/studio/src/__tests__/ContinuityProjection.test.ts`

**Interfaces:**
- Consumes: i tipi del Task 3
- Produces: `projectContinuityV1(snapshot: ScopedContinuitySnapshotV1): ContinuityProjectionV1` e l'helper di test `emptySnapshot`, usati dai Task 6-8

- [ ] **Step 1: Scrivere i test RED**

```ts
// @vitest-environment jsdom
// ARD-06 §6 — precedenza della phase e normalizzazione corrupt.
// La regola che conta: una sorgente corrotta NON autorizza una projection
// parziale dalle altre sorgenti.
import { describe, it, expect } from "vitest"
import {
  projectContinuityV1,
  validateContinuityScopeV1,
  type ContinuitySourceIssueV1,
  type ScopedContinuitySnapshotV1,
} from "../lessonos/continuityProjection"

const SCOPE = validateContinuityScopeV1({
  lessonId: "lezione-a",
  roomId: "lezione-a",
  sessionId: "11111111-1111-4111-8111-111111111111",
})

export function emptySnapshot(
  overrides: Partial<ScopedContinuitySnapshotV1> = {},
): ScopedContinuitySnapshotV1 {
  return {
    scope: SCOPE,
    session: null,
    lessonEvents: [],
    journalEvents: [],
    scene: null,
    buildCommitSha: null,
    evidenceByOccurrence: new Map(),
    issues: [],
    ...overrides,
  }
}

const CORRUPT_ISSUE: ContinuitySourceIssueV1 = {
  source: "journal",
  severity: "corrupt",
  code: "invalid-schema",
  preserved: { path: "raw/lezione-a/events.jsonl", sha256: "b".repeat(64), bytes: 12 },
}

const DEGRADED_ISSUE: ContinuitySourceIssueV1 = {
  source: "lesson-event-log",
  severity: "degraded",
  code: "unavailable",
  preserved: null,
}

describe("projectContinuityV1 — precedenza della phase", () => {
  it("senza fatti e senza issue la phase è empty e l'azione è reopen-lesson", () => {
    const projection = projectContinuityV1(emptySnapshot())
    expect(projection.phase).toBe("empty")
    expect(projection.sourceHealth.status).toBe("verified")
    expect(projection.nextAction.kind).toBe("reopen-lesson")
    expect(projection.nextAction.priority).toBe(4)
  })

  it("una issue degraded rende la phase degraded, non empty", () => {
    const projection = projectContinuityV1(emptySnapshot({ issues: [DEGRADED_ISSUE] }))
    expect(projection.phase).toBe("degraded")
    expect(projection.sourceHealth.status).toBe("degraded")
  })

  it("una issue corrupt vince su una degraded", () => {
    const projection = projectContinuityV1(
      emptySnapshot({ issues: [DEGRADED_ISSUE, CORRUPT_ISSUE] }),
    )
    expect(projection.phase).toBe("corrupt")
    expect(projection.sourceHealth.status).toBe("corrupt")
  })

  it("con phase corrupt nessun fatto di contenuto viene esposto", () => {
    const projection = projectContinuityV1(
      emptySnapshot({
        issues: [CORRUPT_ISSUE],
        session: { document: { v: 2, lessonId: "lezione-a", sessionId: SCOPE.sessionId, created: 1, revision: 3, audioConsent: false, audioStartEpoch: null }, sha256: "c".repeat(64) },
      }),
    )
    expect(projection.session).toBeNull()
    expect(projection.lastVerifiedResult).toBeNull()
    expect(projection.openLoops).toEqual([])
    expect(projection.recentMaterials).toEqual([])
    expect(projection.missingEvidence).toEqual([])
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.nextAction.kind).toBe("recover-continuity")
    expect(projection.nextAction.priority).toBe(0)
  })

  it("la projection è deterministica byte per byte sullo stesso snapshot", () => {
    const snapshot = emptySnapshot({ issues: [DEGRADED_ISSUE] })
    expect(JSON.stringify(projectContinuityV1(snapshot)))
      .toBe(JSON.stringify(projectContinuityV1(snapshot)))
  })

  it("espone sempre esattamente una nextAction, mai un array o null", () => {
    const projection = projectContinuityV1(emptySnapshot())
    expect(Array.isArray(projection.nextAction)).toBe(false)
    expect(projection.nextAction).not.toBeNull()
  })
})
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: FAIL con `projectContinuityV1 is not a function` (o errore di import).

- [ ] **Step 3: Implementare la funzione minima**

In coda a `continuityProjection.ts`:

```ts
const EMPTY_PROJECTION_LISTS = Object.freeze({
  openLoops: Object.freeze([]) as readonly ContinuityOpenLoopV1[],
  recentMaterials: Object.freeze([]) as readonly ContinuityMaterialV1[],
  missingEvidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
})

function sourceHealthStatus(
  issues: readonly ContinuitySourceIssueV1[],
): "verified" | "degraded" | "corrupt" {
  if (issues.some((issue) => issue.severity === "corrupt")) return "corrupt"
  if (issues.length > 0) return "degraded"
  return "verified"
}

/**
 * Projection pura della Continuità (design §6, §7, §9).
 * Nessun I/O, nessun clock: lo stesso snapshot produce gli stessi byte.
 */
export function projectContinuityV1(
  snapshot: ScopedContinuitySnapshotV1,
): ContinuityProjectionV1 {
  const identity = validateContinuityScopeV1(snapshot.scope)
  const issues = [...snapshot.issues]
  const health = sourceHealthStatus(issues)

  if (health === "corrupt") {
    // Design §6: una source corruption non autorizza una projection parziale
    // dalle altre sorgenti. Restano identità, issue bounded e recover.
    const reason = issues.find((issue) => issue.severity === "corrupt")!
    return Object.freeze({
      v: 1 as const,
      identity,
      phase: "corrupt" as const,
      sourceHealth: Object.freeze({ status: health, issues: Object.freeze(issues) }),
      session: null,
      lastVerifiedResult: null,
      ...EMPTY_PROJECTION_LISTS,
      lastUncorrectedError: null,
      simulation: Object.freeze({
        status: "unavailable" as const,
        instance: null,
        openError: null,
        evidenceBlock: null,
        reason: "source-corrupt" as const,
      }),
      nextAction: Object.freeze({
        kind: "recover-continuity" as const,
        priority: 0 as const,
        reason: Object.freeze({
          kind: "source" as const,
          source: reason.source,
          severity: reason.severity,
          code: reason.code,
          preserved: reason.preserved,
        }),
        href: continuityRecoveryHref(identity),
        evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
      }),
    })
  }

  const phase = health === "degraded" ? ("degraded" as const) : ("empty" as const)
  return Object.freeze({
    v: 1 as const,
    identity,
    phase,
    sourceHealth: Object.freeze({ status: health, issues: Object.freeze(issues) }),
    session: null,
    lastVerifiedResult: null,
    ...EMPTY_PROJECTION_LISTS,
    lastUncorrectedError: null,
    simulation: Object.freeze({
      status: "not-mounted" as const,
      instance: null,
      openError: null,
      evidenceBlock: null,
    }),
    nextAction: Object.freeze({
      kind: "reopen-lesson" as const,
      priority: 4 as const,
      href: continuityLessonHref(identity),
      evidence: Object.freeze([]) as readonly [],
    }),
  })
}

/** Href interno alla lezione, mai un link esterno (design §8.3). */
function continuityLessonHref(scope: ContinuityScopeV1): string {
  return `/#${scope.roomId}`
}

function continuityRecoveryHref(scope: ContinuityScopeV1): string {
  return `/?vista=continuita&lessonId=${encodeURIComponent(scope.lessonId)}` +
    `&sessionId=${scope.sessionId}#${scope.roomId}`
}
```

> Nota: la phase `degraded` con una issue degraded **richiesta** dovrà produrre `recover-continuity` (§9.1). Quel comportamento arriva nel Task 8, insieme al `requiredSourceSet`. Qui il test asserisce solo la phase, non l'azione, così il Task 8 non deve riscrivere questi test.

- [ ] **Step 4: Eseguire i test e verificare che passino**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: PASS, 6 test.

- [ ] **Step 5: Typecheck**

```bash
npm --prefix apps/studio run typecheck
```

Atteso: exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/src/lessonos/continuityProjection.ts apps/studio/src/__tests__/ContinuityProjection.test.ts
git commit -m "feat(continuity): derive the projection phase and the corrupt normalisation

A corrupt source does not authorise a partial projection from the surviving
ones: content facts are emptied, Simulation reports unavailable/source-corrupt
and the single next action is recover-continuity.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Open loop — apertura, chiusura, riapertura (RED-06-04)

**Files:**
- Modify: `apps/studio/src/lessonos/continuityProjection.ts`
- Modify: `apps/studio/src/__tests__/ContinuityProjection.test.ts`

**Interfaces:**
- Consumes: `projectContinuityV1`, `emptySnapshot` dal Task 5
- Produces: l'helper di test `lessonEvent(...)` usato dal Task 7 e dal Task 8

- [ ] **Step 1: Scrivere i test RED**

Aggiungi in coda a `ContinuityProjection.test.ts`:

```ts
// --- RED-06-04: open loop ---

let nextSeq = 1
export function lessonEvent(
  kind: string,
  payload: Record<string, unknown>,
  occurredAt: string,
): AppendedEventEnvelopeV2 {
  const seq = nextSeq++
  return {
    schemaVersion: 2,
    eventId: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    lessonId: SCOPE.lessonId,
    sessionId: SCOPE.sessionId,
    kind,
    occurredAt,
    actor: { type: "teacher", id: "docente" },
    producer: {
      id: "com.github.andreamarro.ardesia.studio",
      version: "0.0.0",
      commitSha: "a".repeat(40),
    },
    causationId: null,
    idempotencyKey: null,
    evidence: [],
    payload,
    seq,
  } as unknown as AppendedEventEnvelopeV2
}

describe("projectContinuityV1 — open loop (RED-06-04)", () => {
  beforeEach(() => { nextSeq = 1 })

  it("un error.observed apre un loop", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [lessonEvent("error.observed", {
        room: SCOPE.roomId, errorId: "err-X", conceptId: "c-1", label: { it: "Corto" },
      }, "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-X"])
    expect(projection.openLoops[0]!.observedCount).toBe(1)
  })

  it("un exercise.completed che corregge X chiude X", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-X", conceptId: "c-1", label: { it: "Corto" } }, "2026-07-23T00:00:01.000Z"),
        lessonEvent("exercise.completed", { room: SCOPE.roomId, correctsErrorId: "err-X" }, "2026-07-23T00:00:02.000Z"),
      ],
    }))
    expect(projection.openLoops).toEqual([])
  })

  it("una ri-osservazione dopo la correzione riapre il loop con count 2", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-X", conceptId: "c-1", label: { it: "Corto" } }, "2026-07-23T00:00:01.000Z"),
        lessonEvent("exercise.completed", { room: SCOPE.roomId, correctsErrorId: "err-X" }, "2026-07-23T00:00:02.000Z"),
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-X", conceptId: "c-1", label: { it: "Corto" } }, "2026-07-23T00:00:03.000Z"),
      ],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-X"])
    expect(projection.openLoops[0]!.observedCount).toBe(2)
  })

  it("una correzione di un errorId ignoto non chiude X", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-X", conceptId: "c-1", label: { it: "Corto" } }, "2026-07-23T00:00:01.000Z"),
        lessonEvent("exercise.completed", { room: SCOPE.roomId, correctsErrorId: "err-IGNOTO" }, "2026-07-23T00:00:02.000Z"),
      ],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-X"])
  })

  it("lastUncorrectedError è lo stesso oggetto logico di openLoops[0]", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-1", conceptId: "c-1", label: { it: "A" } }, "2026-07-23T00:00:01.000Z"),
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-2", conceptId: "c-2", label: { it: "B" } }, "2026-07-23T00:00:02.000Z"),
      ],
    }))
    expect(projection.lastUncorrectedError).toBe(projection.openLoops[0])
  })

  it("con un open loop la nextAction è resume-open-loop a priorità 2", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-X", conceptId: "c-1", label: { it: "Corto" } }, "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.nextAction.kind).toBe("resume-open-loop")
    expect(projection.nextAction.priority).toBe(2)
  })

  it("gli open loop sono ordinati per seq DESC, quindi errorId ASC", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-a", conceptId: "c", label: { it: "A" } }, "2026-07-23T00:00:01.000Z"),
        lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-b", conceptId: "c", label: { it: "B" } }, "2026-07-23T00:00:02.000Z"),
      ],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-b", "err-a"])
  })
})
```

Aggiungi in cima al file gli import mancanti:

```ts
import { beforeEach } from "vitest"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"
```

- [ ] **Step 2: Eseguire e verificare il FAIL**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: FAIL sui 7 test nuovi (`openLoops` sempre `[]`). I 6 del Task 5 restano PASS.

- [ ] **Step 3: Implementare la derivazione degli open loop**

In `continuityProjection.ts`, aggiungi prima di `projectContinuityV1`:

```ts
type OpenLoopAccumulator = {
  errorId: string
  conceptId: string
  label: Readonly<Record<string, string>>
  openedAt: string
  lastObservedAt: string
  observedCount: number
  lastSeq: number
}

function readString(payload: JsonObject, key: string): string | null {
  const value = payload[key]
  return typeof value === "string" && value.length > 0 ? value : null
}

function readLabel(payload: JsonObject): Readonly<Record<string, string>> {
  const raw = payload.label
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return Object.freeze({})
  const out: Record<string, string> = {}
  for (const [locale, text] of Object.entries(raw)) {
    if (typeof text === "string") out[locale] = text
  }
  return Object.freeze(out)
}

/**
 * Open loop Founder v1 (design §3.6): un error.observed non chiuso da un
 * successivo exercise.completed.correctsErrorId nella STESSA sessione.
 * Una ri-osservazione dopo la correzione lo riapre. L'ordine è il seq
 * append-only: occurredAt è display, non autorità (design §7.1.5).
 */
function deriveOpenLoops(
  lessonEvents: readonly AppendedEventEnvelopeV2[],
): readonly ContinuityOpenLoopV1[] {
  const open = new Map<string, OpenLoopAccumulator>()
  const observedTotal = new Map<string, number>()

  for (const event of [...lessonEvents].sort((left, right) => left.seq - right.seq)) {
    const payload = event.payload as JsonObject
    if (event.kind === "error.observed") {
      const errorId = readString(payload, "errorId")
      const conceptId = readString(payload, "conceptId")
      if (errorId === null || conceptId === null) continue
      const count = (observedTotal.get(errorId) ?? 0) + 1
      observedTotal.set(errorId, count)
      const previous = open.get(errorId)
      open.set(errorId, {
        errorId,
        conceptId,
        label: readLabel(payload),
        openedAt: previous?.openedAt ?? event.occurredAt,
        lastObservedAt: event.occurredAt,
        observedCount: count,
        lastSeq: event.seq,
      })
      continue
    }
    if (event.kind === "exercise.completed") {
      const corrects = readString(payload, "correctsErrorId")
      // Una correzione di un ID mai osservato non chiude nulla.
      if (corrects !== null) open.delete(corrects)
    }
  }

  return Object.freeze([...open.values()]
    .sort((left, right) => (
      right.lastSeq - left.lastSeq ||
      compareCodePoints(left.errorId, right.errorId)
    ))
    .map((loop) => Object.freeze({
      errorId: loop.errorId,
      conceptId: loop.conceptId,
      label: loop.label,
      openedAt: loop.openedAt,
      lastObservedAt: loop.lastObservedAt,
      observedCount: loop.observedCount,
      evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
    })))
}

/** Confronto per code point, mai locale-dependent (design §9.2). */
function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}
```

Poi, nel ramo non-corrupt di `projectContinuityV1`, sostituisci `...EMPTY_PROJECTION_LISTS` e `nextAction` con:

```ts
  const openLoops = deriveOpenLoops(snapshot.lessonEvents)
  const lastUncorrectedError = openLoops[0] ?? null
  const hasFacts = openLoops.length > 0
  const phase = health === "degraded"
    ? ("degraded" as const)
    : hasFacts ? ("ready" as const) : ("empty" as const)

  return Object.freeze({
    v: 1 as const,
    identity,
    phase,
    sourceHealth: Object.freeze({ status: health, issues: Object.freeze(issues) }),
    session: null,
    lastVerifiedResult: null,
    openLoops,
    lastUncorrectedError,
    recentMaterials: Object.freeze([]) as readonly ContinuityMaterialV1[],
    missingEvidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
    simulation: Object.freeze({
      status: "not-mounted" as const,
      instance: null,
      openError: null,
      evidenceBlock: null,
    }),
    nextAction: openLoops.length > 0
      ? Object.freeze({
          kind: "resume-open-loop" as const,
          priority: 2 as const,
          errorId: openLoops[0]!.errorId,
          href: continuityLessonHref(identity),
          evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
        })
      : Object.freeze({
          kind: "reopen-lesson" as const,
          priority: 4 as const,
          href: continuityLessonHref(identity),
          evidence: Object.freeze([]) as readonly [],
        }),
  })
```

- [ ] **Step 4: Eseguire e verificare il PASS**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: PASS, 13 test.

- [ ] **Step 5: Typecheck e commit**

```bash
npm --prefix apps/studio run typecheck
git add apps/studio/src/lessonos/continuityProjection.ts apps/studio/src/__tests__/ContinuityProjection.test.ts
git commit -m "feat(continuity): derive open loops from the append-only seq order

An error.observed is open until an exercise.completed corrects that exact
errorId in the same session; a later re-observation reopens it with the
cumulative count. Ordering is seq DESC then errorId by code point, never
occurredAt, which is display only.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Simulation fail-closed (RED-06-06, parte runtime)

Vincolo dal Task 2 Step 3: **G2 non è soddisfatto**, quindi `ready` e `error-open` non sono raggiungibili in questa slice. Gli eventi Simulation correnti sono legacy e producono `unavailable`.

**Files:**
- Modify: `apps/studio/src/lessonos/continuityProjection.ts`
- Modify: `apps/studio/src/__tests__/ContinuityProjection.test.ts`

**Interfaces:**
- Consumes: `lessonEvent` dal Task 6
- Produces: `deriveSimulationState`, consumato dal Task 8 per la priorità 1

- [ ] **Step 1: Scrivere i test RED**

```ts
// --- RED-06-06: Simulation fail-closed ---

const SCENE_DIGEST = "d".repeat(64)

function sceneWithEmbeds(
  embeds: readonly { instanceId: string; pluginId: string; sceneDigest: string | null }[],
) {
  return {
    sha256: "e".repeat(64),
    elements: [] as readonly JsonObject[],
    simulationEmbeds: embeds,
  }
}

describe("projectContinuityV1 — Simulation fail-closed (RED-06-06)", () => {
  beforeEach(() => { nextSeq = 1 })

  it("zero mount e zero embed -> not-mounted", () => {
    const projection = projectContinuityV1(emptySnapshot())
    expect(projection.simulation.status).toBe("not-mounted")
    expect(projection.simulation.instance).toBeNull()
  })

  it("embed nella scena senza plugin.mounted -> unavailable/mount-receipt-missing", () => {
    const projection = projectContinuityV1(emptySnapshot({
      scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]),
    }))
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.simulation).toMatchObject({ reason: "mount-receipt-missing" })
  })

  it("due embed -> unavailable/multiple-instances", () => {
    const projection = projectContinuityV1(emptySnapshot({
      scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
        { instanceId: "embed-2", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]),
    }))
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.simulation).toMatchObject({ reason: "multiple-instances" })
  })

  it("un plugin.mounted senza payload.room non crea istanza (ARD-07 non accepted)", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [lessonEvent("plugin.mounted", { instanceId: "embed-1" }, "2026-07-23T00:00:01.000Z")],
      scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]),
    }))
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.simulation).toMatchObject({ reason: "event-contract-legacy" })
    expect(projection.lastVerifiedResult).toBeNull()
  })

  it("un evento simulation legacy senza instanceId non produce mai lastVerifiedResult", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [lessonEvent("simulation.solved", { room: SCOPE.roomId, currentMa: 15.3 }, "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.lastVerifiedResult).toBeNull()
    expect(projection.simulation.status).not.toBe("ready")
  })
})
```

- [ ] **Step 2: Eseguire e verificare il FAIL**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: FAIL sui test con embed (status sempre `not-mounted`).

- [ ] **Step 3: Implementare**

```ts
/**
 * Stato Simulation fail-closed (design §6, §7.5, G2).
 * Finché ARD-07 non è accepted, gli eventi correnti sono legacy: nessuno
 * stato ready o error-open è raggiungibile, e nessun solve viene associato a
 * un embed per euristica "tanto ce n'è uno solo".
 */
function deriveSimulationState(
  lessonEvents: readonly AppendedEventEnvelopeV2[],
  scene: ScopedContinuitySnapshotV1["scene"],
  roomId: string,
): ContinuitySimulationStateV1 {
  const embeds = scene?.simulationEmbeds ?? []
  const mounts = lessonEvents.filter((event) => event.kind === "plugin.mounted")

  if (embeds.length === 0 && mounts.length === 0) {
    return Object.freeze({
      status: "not-mounted" as const, instance: null, openError: null, evidenceBlock: null,
    })
  }
  if (embeds.length > 1) {
    return unavailableSimulation("multiple-instances")
  }
  const strictMounts = mounts.filter((event) => (
    readString(event.payload as JsonObject, "room") === roomId
  ))
  if (mounts.length > 0 && strictMounts.length === 0) {
    // plugin.mounted storico privo di room: escluso come contratto non
    // supportato, non promosso a istanza (design §5.4, §12 RED-06-02).
    return unavailableSimulation("event-contract-legacy")
  }
  if (strictMounts.length === 0) {
    return unavailableSimulation("mount-receipt-missing")
  }
  // ARD-07 non accepted: un mount strict esiste ma il contratto simulation.*
  // canonico (pluginVersion, sceneDigest, producer full SHA) non è disponibile.
  return unavailableSimulation("event-contract-legacy")
}

function unavailableSimulation(
  reason: Extract<ContinuitySimulationStateV1, { status: "unavailable" }>["reason"],
): ContinuitySimulationStateV1 {
  return Object.freeze({
    status: "unavailable" as const,
    instance: null,
    openError: null,
    evidenceBlock: null,
    reason,
  })
}
```

Nel ramo non-corrupt, sostituisci il `simulation:` letterale con:

```ts
    simulation: deriveSimulationState(snapshot.lessonEvents, snapshot.scene, identity.roomId),
```

- [ ] **Step 4: Eseguire, typecheck, commit**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run typecheck
git add apps/studio/src/lessonos/continuityProjection.ts apps/studio/src/__tests__/ContinuityProjection.test.ts
git commit -m "feat(continuity): derive the Simulation state fail-closed

ARD-07 is not accepted, so ready and error-open are unreachable by
construction: a mount without a canonical room stays event-contract-legacy, an
embed without a mount receipt stays mount-receipt-missing, and two embeds are
multiple-instances. No solve is attached to an embed by heuristic.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Atteso: 18 test PASS, typecheck exit 0.

---

## Task 8: `nextAction` — required set, ordine P0 totale e permutation oracle (RED-06-05)

È il task più delicato: qui l'ordine deve essere **totale**, cioè due candidati distinti non devono mai comparare uguali. Se il Task 2 Step 2 punto 1 ha trovato un buco di totalità, chiudilo qui secondo il verdetto.

**Files:**
- Modify: `apps/studio/src/lessonos/continuityProjection.ts`
- Modify: `apps/studio/src/__tests__/ContinuityProjection.test.ts`

**Interfaces:**
- Consumes: tutto ciò che precede
- Produces: la projection completa per la Fase 2

- [ ] **Step 1: Scrivere i test RED, incluso il permutation oracle**

```ts
// --- RED-06-05: required set, ordine P0 totale, permutation oracle ---

function issue(
  source: ContinuitySourceIssueV1["source"],
  severity: ContinuitySourceIssueV1["severity"],
  code: ContinuitySourceIssueV1["code"],
  preserved: ContinuitySourceIssueV1["preserved"] = null,
): ContinuitySourceIssueV1 {
  return { source, severity, code, preserved }
}

/** Shuffle deterministico: nessun Math.random nei test. */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items]
  let state = seed
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += 1) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of permutations(rest)) out.push([items[i]!, ...tail])
  }
  return out
}

describe("projectContinuityV1 — nextAction P0 (RED-06-05)", () => {
  beforeEach(() => { nextSeq = 1 })

  it("una issue corrupt su sorgente opzionale è comunque P0", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [issue("plugin-artifact", "corrupt", "digest-mismatch")],
    }))
    expect(projection.nextAction.kind).toBe("recover-continuity")
  })

  it("una issue degraded su sorgente RICHIESTA è P0", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [issue("session", "degraded", "unavailable")],
    }))
    expect(projection.nextAction.kind).toBe("recover-continuity")
    expect(projection.nextAction).toMatchObject({
      reason: { kind: "source", source: "session" },
    })
  })

  it("una issue degraded su sorgente OPZIONALE non forza P0", () => {
    const projection = projectContinuityV1(emptySnapshot({
      // plugin-artifact non è richiesto: nessun evento, nessun embed.
      issues: [issue("plugin-artifact", "degraded", "missing")],
      lessonEvents: [lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "err-X", conceptId: "c", label: { it: "A" } }, "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.phase).toBe("degraded")
    expect(projection.nextAction.kind).toBe("resume-open-loop")
  })

  it("corrupt precede degraded richiesta", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("session", "degraded", "unavailable"),
        issue("journal", "corrupt", "invalid-schema"),
      ],
    }))
    expect(projection.nextAction).toMatchObject({ reason: { source: "journal", severity: "corrupt" } })
  })

  it("a parità di severity vince SOURCE_ORDER", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("journal", "corrupt", "invalid-schema"),
        issue("session", "corrupt", "invalid-schema"),
      ],
    }))
    expect(projection.nextAction).toMatchObject({ reason: { source: "session" } })
  })

  it("a parità di source vince SOURCE_CODE_ORDER", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("journal", "corrupt", "invalid-schema"),
        issue("journal", "corrupt", "duplicate-event-id"),
      ],
    }))
    expect(projection.nextAction).toMatchObject({ reason: { code: "duplicate-event-id" } })
  })

  it("a parità di source e code, path/sha256/bytes rendono l'ordine totale", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("journal", "corrupt", "invalid-schema", { path: "b.jsonl", sha256: "0".repeat(64), bytes: 2 }),
        issue("journal", "corrupt", "invalid-schema", { path: "a.jsonl", sha256: "0".repeat(64), bytes: 1 }),
      ],
    }))
    expect(projection.nextAction).toMatchObject({
      reason: { preserved: { path: "a.jsonl" } },
    })
  })

  it("permutation oracle: 3! ordini + 100 shuffle seeded danno byte identici", () => {
    const issues = [
      issue("journal", "corrupt", "invalid-schema", { path: "a.jsonl", sha256: "1".repeat(64), bytes: 10 }),
      issue("session", "degraded", "unavailable"),
      issue("scene", "corrupt", "digest-mismatch", { path: "s.excalidraw", sha256: "2".repeat(64), bytes: 20 }),
    ]
    const baseline = JSON.stringify(projectContinuityV1(emptySnapshot({ issues })))

    for (const permutation of permutations(issues)) {
      expect(JSON.stringify(projectContinuityV1(emptySnapshot({ issues: permutation }))))
        .toBe(baseline)
    }
    for (let seed = 1; seed <= 100; seed += 1) {
      expect(JSON.stringify(projectContinuityV1(emptySnapshot({ issues: seededShuffle(issues, seed) }))))
        .toBe(baseline)
    }
  })

  it("esiste sempre esattamente una nextAction in ogni fixture di questo file", () => {
    for (const snapshot of [
      emptySnapshot(),
      emptySnapshot({ issues: [issue("session", "degraded", "unavailable")] }),
      emptySnapshot({ issues: [issue("journal", "corrupt", "invalid-schema")] }),
      emptySnapshot({ lessonEvents: [lessonEvent("error.observed", { room: SCOPE.roomId, errorId: "e", conceptId: "c", label: {} }, "2026-07-23T00:00:01.000Z")] }),
    ]) {
      const projection = projectContinuityV1(snapshot)
      expect(typeof projection.nextAction.kind).toBe("string")
      expect(Array.isArray(projection.nextAction)).toBe(false)
    }
  })
})
```

- [ ] **Step 2: Eseguire e verificare il FAIL**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: FAIL su required set e ordine (oggi qualunque issue corrupt sceglie la prima trovata).

- [ ] **Step 3: Implementare required set e comparator totale**

```ts
const SOURCE_ORDER = [
  "session", "lesson-event-log", "journal", "event-union",
  "scene", "plugin-artifact", "build",
] as const

const SOURCE_CODE_ORDER = [
  "duplicate-event-id", "scope-violation", "invalid-schema", "digest-mismatch",
  "data-loss", "unavailable", "missing", "multiple-simulation-instances",
  "unsupported-event-contract", "legacy-recovery-required",
] as const

/**
 * Design §9.1. "Richiesta" distingue disponibilità della sorgente da presenza
 * del documento: una sorgente richiesta ma assente produce una issue missing,
 * non trasforma la sessione in empty.
 */
function requiredSourceSet(
  snapshot: ScopedContinuitySnapshotV1,
): ReadonlySet<ContinuitySourceNameV1> {
  const required = new Set<ContinuitySourceNameV1>([
    "session", "lesson-event-log", "journal", "scene",
  ])
  const hasEvents = snapshot.lessonEvents.length > 0 || snapshot.journalEvents.length > 0
  if (hasEvents) {
    required.add("event-union")
    required.add("build")
  }
  const hasSimulation =
    (snapshot.scene?.simulationEmbeds.length ?? 0) > 0 ||
    snapshot.lessonEvents.some((event) => (
      event.kind === "plugin.mounted" || event.kind.startsWith("simulation.")
    ))
  if (hasSimulation) {
    required.add("plugin-artifact")
    required.add("build")
  }
  return required
}

function compareNullableString(left: string | null, right: string | null): number {
  return compareCodePoints(left ?? "", right ?? "")
}

/** Chiave totale source, design §9.2. */
function compareSourceCandidates(
  left: ContinuitySourceIssueV1,
  right: ContinuitySourceIssueV1,
): number {
  const severity = (issue: ContinuitySourceIssueV1) => (issue.severity === "corrupt" ? 0 : 1)
  return (
    severity(left) - severity(right) ||
    SOURCE_ORDER.indexOf(left.source) - SOURCE_ORDER.indexOf(right.source) ||
    SOURCE_CODE_ORDER.indexOf(left.code) - SOURCE_CODE_ORDER.indexOf(right.code) ||
    compareNullableString(left.preserved?.path ?? null, right.preserved?.path ?? null) ||
    compareNullableString(left.preserved?.sha256 ?? null, right.preserved?.sha256 ?? null) ||
    (left.preserved?.bytes ?? -1) - (right.preserved?.bytes ?? -1)
  )
}

function p0SourceCandidates(
  snapshot: ScopedContinuitySnapshotV1,
): readonly ContinuitySourceIssueV1[] {
  const required = requiredSourceSet(snapshot)
  // Una issue corrupt è sempre P0, anche su sorgente opzionale. Una degraded
  // entra in P0 solo se la sua sorgente è nel required set (design §9.1).
  const candidates = snapshot.issues.filter((entry) => (
    entry.severity === "corrupt" || required.has(entry.source)
  ))
  // Deduplica solo issue byte-identiche, mai evidence occurrence.
  const byKey = new Map<string, ContinuitySourceIssueV1>()
  for (const entry of candidates) byKey.set(JSON.stringify(entry), entry)
  return [...byKey.values()].sort(compareSourceCandidates)
}
```

Poi nel ramo non-corrupt, prima del `return`, inserisci:

```ts
  const sortedIssues = [...issues].sort(compareSourceCandidates)
  const p0 = p0SourceCandidates(snapshot)
  const nextAction: ContinuityNextActionV1 = p0.length > 0
    ? Object.freeze({
        kind: "recover-continuity" as const,
        priority: 0 as const,
        reason: Object.freeze({
          kind: "source" as const,
          source: p0[0]!.source,
          severity: p0[0]!.severity,
          code: p0[0]!.code,
          preserved: p0[0]!.preserved,
        }),
        href: continuityRecoveryHref(identity),
        evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
      })
    : openLoops.length > 0
      ? Object.freeze({
          kind: "resume-open-loop" as const,
          priority: 2 as const,
          errorId: openLoops[0]!.errorId,
          href: continuityLessonHref(identity),
          evidence: Object.freeze([]) as readonly ContinuityEvidenceV1[],
        })
      : Object.freeze({
          kind: "reopen-lesson" as const,
          priority: 4 as const,
          href: continuityLessonHref(identity),
          evidence: Object.freeze([]) as readonly [],
        })
```

e usa `sortedIssues` in `sourceHealth.issues` e `nextAction` nel return. Applica lo stesso `compareSourceCandidates` anche al ramo corrupt, scegliendo `p0SourceCandidates(snapshot)[0]` invece di `issues.find(...)`.

- [ ] **Step 4: Eseguire e verificare il PASS**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityProjection.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: PASS, 27 test. Il permutation oracle deve passare **al primo colpo**: se fallisce in modo intermittente, l'ordine non è totale — non aggiungere un tie-break casuale, torna al comparator.

- [ ] **Step 5: Typecheck e commit**

```bash
npm --prefix apps/studio run typecheck
git add apps/studio/src/lessonos/continuityProjection.ts apps/studio/src/__tests__/ContinuityProjection.test.ts
git commit -m "feat(continuity): select the single next action by a total P0 order

A corrupt issue is always P0; a degraded one only when its source is in the
required set, so an optional degraded source never hides a safe action. The
comparator falls through severity, source, code, path, sha256 and bytes, and a
permutation oracle over 3! orders plus 100 seeded shuffles asserts the whole
projection serialises to identical bytes.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Chiusura della slice ARD-06-A — ledger, gate, PR

**Files:**
- Modify: `apps/studio/STATUS.md`
- Modify: `apps/studio/log.jsonl`

**Interfaces:**
- Consumes: i commit dei Task 3-8
- Produces: la PR che il Task 10 usa come base (dopo il merge)

- [ ] **Step 1: Appendere la voce STATUS.md**

Aggiungi **in coda** al file una voce nel formato esistente (`data — task — ipotesi — file:line — gate — costo — next`). Fatti e numeri, zero narrativa:

```markdown
- **2026-07-24 — ARD-06-A schema + projector puro.** Nuovo `src/lessonos/continuityProjection.ts`: tipi `Continuity*V1` estratti verbatim dal design §5.1/§5.4/§6, `validateContinuityScopeV1` senza default, `projectContinuityV1` puro. Precedenza phase corrupt>degraded>empty|ready con normalizzazione corrupt che azzera i fatti di contenuto. Open loop per seq append-only (RED-06-04). Simulation fail-closed: G2 non accepted ⇒ `ready`/`error-open` irraggiungibili per costruzione (RED-06-06). `nextAction` singola con required set §9.1 e ordine P0 totale §9.2; permutation oracle 3!+100 shuffle seeded byte-identico (RED-06-05). Fixture `@ts-expect-error` congelano 5 stati impossibili al typecheck. **Gate: vitest 27/27 su ContinuityProjection.test.ts, typecheck exit 0.** Nessun I/O, nessun import di TeacherDashboardView/projectTeacherDashboard, zero `readAll`/flat path. Prossima: **ARD-06-B loader session-scoped + indice query**.
```

- [ ] **Step 2: Appendere il record log.jsonl — in coda, mai riordinare**

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717"
BASE=$(git rev-parse origin/main)
HEAD=$(git rev-parse HEAD)
python3 - "$BASE" "$HEAD" <<'PY'
import json, sys, datetime, pathlib
base, head = sys.argv[1], sys.argv[2]
record = {
    "v": 1,
    "ts": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
    "repo": "studio",
    "task": "ARD-06-A-CONTINUITY-PROJECTION",
    "base": base,
    "head": head,
    "files": [
        "apps/studio/src/lessonos/continuityProjection.ts",
        "apps/studio/src/__tests__/ContinuityProjection.test.ts",
        "apps/studio/src/__tests__/ContinuityProjectionImpossibleStates.test-d.ts",
    ],
    "red": ["RED-06-04", "RED-06-05", "RED-06-06"],
    "gates": {"vitest": "27 passed", "typecheck": "exit 0"},
    "notes": "G2 non accepted: Simulation ready/error-open irraggiungibili per costruzione.",
}
path = pathlib.Path("apps/studio/log.jsonl")
with path.open("a", encoding="utf-8") as handle:
    handle.write(json.dumps(record, ensure_ascii=False) + "\n")
PY
```

- [ ] **Step 3: Verificare che il ledger sia integro**

```bash
python3 - <<'PY'
import json, pathlib
lines = pathlib.Path("apps/studio/log.jsonl").read_text().splitlines()
bad = [i + 1 for i, line in enumerate(lines) if line.strip() and not _ok(line)] if False else None
def ok(line):
    try:
        json.loads(line); return True
    except Exception:
        return False
invalid = [i + 1 for i, line in enumerate(lines) if line.strip() and not ok(line)]
print("righe:", len(lines), "invalide:", invalid)
PY
git diff --stat origin/main -- apps/studio/log.jsonl
```

Atteso: `invalide: []`, e il diff mostra **solo aggiunte** (`1 insertion`, `0 deletions`).

- [ ] **Step 4: Gate completi della slice**

```bash
npm --prefix apps/studio run typecheck
npm --prefix apps/studio run test -- \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
(cd apps/studio && bash eval/gate.sh)
UV_CACHE_DIR=/private/tmp/ardesia-uv-cache npm run verify; echo "VERIFY=$?"
```

Atteso: typecheck exit 0; suite intera verde con **almeno** i 27 test nuovi in più rispetto alla baseline 1935; `gate.sh` verde; `VERIFY=0`.

- [ ] **Step 5: Verificare i divieti §15 sul diff**

```bash
git diff origin/main --unified=0 -- apps/studio/src/lessonos/continuityProjection.ts \
  | grep -nE '^\+' \
  | grep -nE 'readAll|PATHS\.JOURNAL|PATHS\.SESSION|raw/events\.jsonl|raw/session\.yaml|deserializeEvents|TeacherDashboard|"current"' \
  || echo "OK: nessun divieto §15 nel codice nuovo"
```

Atteso: `OK: nessun divieto §15 nel codice nuovo`.

- [ ] **Step 6: Commit e PR**

```bash
git add apps/studio/STATUS.md apps/studio/log.jsonl
git commit -m "docs(studio): record the ARD-06-A slice in STATUS and the ledger

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin HEAD:refs/heads/codex/ard06-a-projection-20260723
gh pr create --repo AndreaMarro/ardesia --base main \
  --title "ARD-06-A: Continuity projection schema and pure projector" \
  --body "Prima slice del design ARD-06. Additiva e read-only: nessun file esistente cambia comportamento, TeacherDashboardProjection non è toccata, il cruscotto storico resta sulla route storica.

RED-06-04 (open loop), RED-06-05 (required set + ordine P0 totale + permutation oracle 3!+100 shuffle), RED-06-06 (Simulation fail-closed).

G2 non è accepted: gli stati Simulation ready/error-open sono irraggiungibili per costruzione, e cinque fixture @ts-expect-error congelano al typecheck le combinazioni impossibili della union.

Gate: vitest 27/27 focused, suite intera verde, typecheck exit 0, gate.sh verde, npm run verify exit 0."
```

- [ ] **Step 7: Attendere la CI e la review**

```bash
gh pr checks --repo AndreaMarro/ardesia --watch
```

Atteso: 3/3 required SUCCESS. Poi triage completo dei finding CodeRabbit — ogni finding va FIXATO o CONFUTATO con evidenza nel thread, zero ignorati. Il merge segue le stesse due condizioni scoperte su #198: nessun `CHANGES_REQUESTED` pendente e **tutti i thread risolti** (`required_conversation_resolution: true`).

---

# FASE 2 — Slice ARD-06-B0 e ARD-06-B: indice composto, poi loader session-scoped

> Precondizione: la PR ARD-06-A è mergiata in `main`. Il branch di questa fase nasce dalla main risultante.

## Task 10: Slice B0 — indice composto `by_lesson_session_seq`

Stato verificato su `origin/main@fddda617` (`apps/studio/src/lessonos/indexedDbEventLog.ts`):
`DB_NAME = "lessonos-eventlog"` (r.41), `STORE_NAME = "lessonos_events"` (r.42),
`DB_VERSION = 1` (r.43), store creato con `keyPath: "seq"` dentro `open()` (r.462), e:

```ts
async readEnvelopesBySession(lessonId: string, sessionId: string): Promise<AppendedEventEnvelopeV2[]> {
  return (await this.readAllEnvelopes()).filter(
    (event) => event.lessonId === lessonId && event.sessionId === sessionId,
  )
}
```

È esattamente lo scan-then-filter che §3.3 del design chiama «non ancora un oracolo privacy».
Nota: `readEnvelopesBySession` è un **metodo di istanza** e `dbName` è per-istanza — non
esiste alcuna funzione di modulo da esportare.

**Files:**
- Modify: `apps/studio/src/lessonos/indexedDbEventLog.ts`
- Modify: `apps/studio/src/__tests__/IndexedDbEventLog.test.ts`

**Interfaces:**
- Consumes: la classe `IndexedDbEventLog` esistente
- Produces: `IndexedDbEventLog.prototype.readEnvelopesBySession` che NON passa da `readAllEnvelopes`; il Task 11 lo consuma tramite la porta `ContinuityEventReaderV1`

- [ ] **Step 1: Creare il branch della slice B0 e confermare le righe**

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717"
git fetch origin --prune
git checkout -b codex/ard06-b0-session-index-20260723 origin/main
sed -n '41,43p' apps/studio/src/lessonos/indexedDbEventLog.ts
sed -n '458,466p' apps/studio/src/lessonos/indexedDbEventLog.ts
grep -n "async readEnvelopesBySession" apps/studio/src/lessonos/indexedDbEventLog.ts
```

Atteso: le tre costanti, il blocco `onupgradeneeded`, e due occorrenze del metodo (la classe
IndexedDB e la variante in-memory). **Modifica solo quella della classe IndexedDB.**

- [ ] **Step 2: Scrivere il test RED nel file esistente**

Apri `apps/studio/src/__tests__/IndexedDbEventLog.test.ts` e riusa l'helper di seeding già
presente (cerca `new IndexedDbEventLog(` e la costruzione di envelope canonici). Aggiungi in coda:

```ts
describe("readEnvelopesBySession — indice composto (ARD-06 §5.2)", () => {
  const SA = "11111111-1111-4111-8111-111111111111"
  const SB = "22222222-2222-4222-8222-222222222222"

  it("legge solo la coppia (lesson, session) richiesta, ordinata per seq", async () => {
    const log = new IndexedDbEventLog({ factory: indexedDB, dbName: `idx-${Date.now()}` })
    await log.open()
    await seedCanonicalEvent(log, { lessonId: "lezione-a", sessionId: SA })
    await seedCanonicalEvent(log, { lessonId: "lezione-a", sessionId: SB })
    await seedCanonicalEvent(log, { lessonId: "lezione-a", sessionId: SA })
    await seedCanonicalEvent(log, { lessonId: "lezione-b", sessionId: SA })

    const rows = await log.readEnvelopesBySession("lezione-a", SA)

    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.lessonId === "lezione-a" && row.sessionId === SA)).toBe(true)
    expect(rows.map((row) => row.seq)).toEqual([...rows.map((row) => row.seq)].sort((a, b) => a - b))
  })

  it("non passa da readAllEnvelopes: una regressione scan-then-filter FALLISCE", async () => {
    const log = new IndexedDbEventLog({ factory: indexedDB, dbName: `idx-${Date.now()}-b` })
    await log.open()
    await seedCanonicalEvent(log, { lessonId: "lezione-a", sessionId: SA })

    // Monkey-patch sull'ISTANZA: se l'implementazione torna a leggere tutto e
    // filtrare, il test esplode invece di limitarsi a rallentare.
    let scanned = false
    ;(log as unknown as { readAllEnvelopes: () => Promise<never> }).readAllEnvelopes = () => {
      scanned = true
      throw new Error("scan-then-filter vietato nel path Founder")
    }

    const rows = await log.readEnvelopesBySession("lezione-a", SA)

    expect(scanned).toBe(false)
    expect(rows).toHaveLength(1)
  })
})
```

> `seedCanonicalEvent(log, { lessonId, sessionId })` va scritta accanto ai test usando lo
> stesso costruttore di envelope già presente nel file. Non inventare un secondo formato:
> userebbe campi che l'indice non vede.

- [ ] **Step 3: Eseguire e verificare il FAIL**

```bash
npm --prefix apps/studio run test -- src/__tests__/IndexedDbEventLog.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: il primo test **PASSA** (il filtro in memoria funziona già), il secondo **FALLISCE** con
`scan-then-filter vietato nel path Founder`. È il RED che conta: prova che oggi la query passa
davvero da `readAllEnvelopes`. Se anche il secondo passasse, il monkey-patch non morde:
correggilo prima di implementare.

- [ ] **Step 4: Implementare migration additiva e query per key-range**

Accanto alle costanti esistenti:

```ts
const DB_VERSION = 2
const SESSION_INDEX_NAME = "by_lesson_session_seq"
```

Dentro `open()`, sostituisci il callback:

```ts
      request.onupgradeneeded = () => {
        const db = request.result
        const upgrade = request.transaction!
        const store = db.objectStoreNames.contains(STORE_NAME)
          ? upgrade.objectStore(STORE_NAME)
          : db.createObjectStore(STORE_NAME, { keyPath: "seq" })
        // Migration additiva (design §5.2): nessuno store cancellato, nessun
        // record riscritto. Le righe fisiche V1 prive di lessonId/sessionId
        // canonici non entrano nell'indice e restano materia di recovery.
        if (!store.indexNames.contains(SESSION_INDEX_NAME)) {
          store.createIndex(SESSION_INDEX_NAME, ["lessonId", "sessionId", "seq"], {
            unique: false,
          })
        }
      }
```

E il metodo della classe IndexedDB (NON quello in-memory):

```ts
  /**
   * Query esatta (lessonId, sessionId) sul solo key-range dell'indice composto
   * (design §5.2). NON legge tutto per poi filtrare: quello non è un oracolo
   * privacy, è soltanto un filtro più lento.
   */
  async readEnvelopesBySession(
    lessonId: string,
    sessionId: string,
  ): Promise<AppendedEventEnvelopeV2[]> {
    const db = this.db
    if (!db) throw new Error("LessonOS event log: database non aperto")
    const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME)
    const range = IDBKeyRange.bound(
      [lessonId, sessionId, 0],
      [lessonId, sessionId, Number.MAX_SAFE_INTEGER],
    )
    const rows = (await requestToPromise(
      store.index(SESSION_INDEX_NAME).getAll(range),
    )) as AppendedEventEnvelopeV2[]
    return [...rows].sort((left, right) => left.seq - right.seq)
  }
```

> `requestToPromise` è già usata nel file (~r.468): riusala, non scrivere una seconda utility.

- [ ] **Step 5: Verificare il GREEN e la non-regressione**

```bash
npm --prefix apps/studio run test -- src/__tests__/IndexedDbEventLog.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run typecheck
```

Atteso: **tutti** i test del file verdi, inclusi i preesistenti. Se un test preesistente fallisce
perché apre il database alla versione 1, è un difetto reale della migration: correggi la
migration, non il test.

- [ ] **Step 6: Ledger, gate e PR della slice B0**

```bash
npm --prefix apps/studio run test -- \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
(cd apps/studio && bash eval/gate.sh)
UV_CACHE_DIR=/private/tmp/ardesia-uv-cache npm run verify; echo "VERIFY=$?"
```

Poi appendi a `STATUS.md` una voce e a `log.jsonl` un record con lo stesso script Python del
Task 9 Step 2, cambiando `"task": "ARD-06-B0-SESSION-INDEX"`, i file di questa slice e
`"red": ["RED-06-02"]`. Verifica che il diff del ledger sia di sole aggiunte, poi:

```bash
git add apps/studio/src/lessonos/indexedDbEventLog.ts apps/studio/src/__tests__/IndexedDbEventLog.test.ts apps/studio/STATUS.md apps/studio/log.jsonl
git commit -m "feat(lessonos): query events by a composite lesson+session+seq index

readEnvelopesBySession read every envelope and filtered in memory, which is a
slower filter rather than a privacy oracle. DB_VERSION goes to 2 with an
additive migration — no store dropped, no record rewritten — and the query now
reads only its key range. The test monkey-patches readAllEnvelopes on the
instance, so a scan-then-filter regression fails instead of merely getting slow.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin HEAD:refs/heads/codex/ard06-b0-session-index-20260723
gh pr create --repo AndreaMarro/ardesia --base main \
  --title "ARD-06-B0: composite lesson+session index for the event log" \
  --body "Prerequisito della slice ARD-06-B. Migration additiva a DB_VERSION 2; readEnvelopesBySession non passa piu da readAllEnvelopes.

Il taglio del design paragrafo 13 metteva questa modifica dentro ARD-06-B: non ci sta, perche tocca open()/DB_VERSION e i test esistenti della classe. Separata per restare dentro il vincolo dei 5 file tracked."
gh pr checks --repo AndreaMarro/ardesia --watch
```

Atteso: 3/3 required SUCCESS, poi triage CodeRabbit completo e merge con tutti i thread risolti.

## Task 11: Porte read-only e gate di scope a effetto zero (RED-06-01, RED-06-02)

> Precondizione: la PR ARD-06-B0 è mergiata. Questa è la slice ARD-06-B vera e propria.

**Files:**
- Create: `apps/studio/src/lessonos/continuityLoader.ts`
- Create: `apps/studio/src/__tests__/ContinuityLoader.test.ts`

**Interfaces:**
- Consumes: `validateContinuityScopeV1`, `ContinuityScopeV1`, `ContinuitySourceIssueV1`, `ScopedContinuitySnapshotV1` da `./continuityProjection`; `roomPaths` da `../store/roomPaths`; `sessionPaths` da `../store/sessionState`. La query indicizzata del Task 10 arriva **iniettata** dalla porta `ContinuityEventReaderV1`, non importata direttamente.
- Produces: `ContinuityEventReaderV1`, `ContinuityWorkspaceReaderV1`, `ContinuityLoaderDepsV1`, `loadContinuitySnapshotV1(scope, deps)`, consumati dai Task 12-13 e dalla futura slice ARD-06-D

- [ ] **Step 1: Creare il branch della slice B dalla main che include B0**

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-wt-founder-beta-20260717"
git fetch origin --prune
git checkout -b codex/ard06-b-loader-20260723 origin/main
git show origin/main:apps/studio/src/lessonos/indexedDbEventLog.ts | grep -c "by_lesson_session_seq"
```

Atteso: `2` (la costante e il suo uso nella query). Se è `0`, la PR B0 non è ancora mergiata: **fermati**, il loader iniettato leggerebbe una porta che fa ancora scan-then-filter.

- [ ] **Step 2: Scrivere i test RED**

```ts
// --- RED-06-01 / RED-06-02: scope, effetto zero, call ledger esatto ---
import { loadContinuitySnapshotV1 } from "../lessonos/continuityLoader"

type Call = string

function spyDeps(files: Map<string, string> = new Map()) {
  const calls: Call[] = []
  return {
    calls,
    reader: {
      persistence: { kind: "verified-indexeddb" as const, database: "ardesia-eventlog" },
      readEnvelopesBySession: async (lessonId: string, sessionId: string) => {
        calls.push(`query:${lessonId}:${sessionId}`)
        return []
      },
      // Presente ma vietato: se il loader lo tocca, il test esplode.
      readAll: () => { throw new Error("readAll è vietato nel path Founder") },
    },
    workspace: {
      read: async (path: string) => {
        calls.push(`read:${path}`)
        const text = files.get(path)
        return text === undefined ? null : new Blob([text])
      },
    },
  }
}

describe("loadContinuitySnapshotV1 — scope ed effetto zero (RED-06-01)", () => {
  it("roomId diverso da lessonId fallisce PRIMA di ogni read", async () => {
    const deps = spyDeps()
    await expect(loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-b", sessionId: SA },
      deps,
    )).rejects.toThrow(/room-lesson-mismatch/)
    expect(deps.calls).toEqual([])
  })

  it("un sessionId non canonico fallisce prima di ogni read", async () => {
    const deps = spyDeps()
    await expect(loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: "NON-UN-UUID" },
      deps,
    )).rejects.toThrow(/invalid-session-id/)
    expect(deps.calls).toEqual([])
  })

  it("non inventa mai uno scope di default", async () => {
    const deps = spyDeps()
    await expect(loadContinuitySnapshotV1(
      { lessonId: "", roomId: "", sessionId: "" },
      deps,
    )).rejects.toThrow(/invalid-lesson-id/)
    expect(deps.calls).toEqual([])
  })
})

describe("loadContinuitySnapshotV1 — call ledger esatto (RED-06-02)", () => {
  it("legge esattamente session A/SA, journal A, scene A e la query A/SA", async () => {
    const deps = spyDeps()
    await loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA },
      deps,
    )
    expect(deps.calls.sort()).toEqual([
      `query:lezione-a:${SA}`,
      "read:raw/lezione-a/board.excalidraw",
      "read:raw/lezione-a/events.jsonl",
      `read:raw/lezione-a/${SA}/session.yaml`,
    ].sort())
  })

  it("non tocca mai i path flat legacy", async () => {
    const deps = spyDeps()
    await loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA },
      deps,
    )
    for (const forbidden of ["raw/events.jsonl", "raw/session.yaml"]) {
      expect(deps.calls).not.toContain(`read:${forbidden}`)
    }
  })

  it("un envelope con lessonId di un'altra lezione rende la sorgente corrupt", async () => {
    const deps = spyDeps()
    deps.reader.readEnvelopesBySession = async () => [
      { lessonId: "lezione-b", sessionId: SA, seq: 1, eventId: "x", kind: "lesson.started", payload: {} },
    ] as never
    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA },
      deps,
    )
    expect(snapshot.issues.some((entry) => (
      entry.source === "event-union" && entry.code === "scope-violation" && entry.severity === "corrupt"
    ))).toBe(true)
    expect(snapshot.lessonEvents).toEqual([])
  })
})
```

- [ ] **Step 3: Eseguire e verificare il FAIL**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityLoader.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: FAIL con `loadContinuitySnapshotV1 is not a function`.

- [ ] **Step 4: Implementare il loader**

```ts
// ARDESIA Studio — ARD-06 loader session-scoped.
//
// Porta minima (design §5.2): readAll non è rappresentabile in questo tipo.
// Path unici letti (design §5.3): session A/SA, journal A, scene A, query A/SA.
// Nessun fallback InMemory travestito da event log vuoto verificato.

import {
  validateContinuityScopeV1,
  type ContinuityScopeV1,
  type ContinuitySourceIssueV1,
  type ScopedContinuitySnapshotV1,
} from "./continuityProjection"
import type { AppendedEventEnvelopeV2 } from "./eventlog"
import { roomPaths } from "../store/roomPaths"
import { sessionPaths } from "../store/sessionState"

export interface ContinuityEventReaderV1 {
  readonly persistence:
    | { kind: "verified-indexeddb"; database: string }
    | { kind: "unavailable"; code: string }
    | { kind: "data-loss"; code: string }
    | { kind: "corrupt"; code: string }
  readEnvelopesBySession(
    lessonId: string,
    sessionId: string,
  ): Promise<readonly AppendedEventEnvelopeV2[]>
}

export interface ContinuityWorkspaceReaderV1 {
  read(path: string): Promise<Blob | null>
}

export type ContinuityLoaderDepsV1 = Readonly<{
  reader: ContinuityEventReaderV1
  workspace: ContinuityWorkspaceReaderV1
}>

export async function loadContinuitySnapshotV1(
  scopeInput: { lessonId: unknown; roomId: unknown; sessionId: unknown },
  deps: ContinuityLoaderDepsV1,
): Promise<ScopedContinuitySnapshotV1> {
  // Gate di scope PRIMA di qualunque I/O: un mismatch non deve produrre
  // nemmeno una read (design §5.1 invariante 5).
  const scope: ContinuityScopeV1 = validateContinuityScopeV1(scopeInput)

  const paths = roomPaths(scope.lessonId)
  const session = sessionPaths({ lessonId: scope.lessonId, sessionId: scope.sessionId })
  const issues: ContinuitySourceIssueV1[] = []

  const [sessionBlob, journalBlob, sceneBlob, rawEvents] = await Promise.all([
    deps.workspace.read(session.session),
    deps.workspace.read(paths.journal),
    deps.workspace.read(paths.scene),
    deps.reader.readEnvelopesBySession(scope.lessonId, scope.sessionId),
  ])

  // Un record fuori scope restituito dalla query non viene filtrato in
  // silenzio: è scope-violation e azzera la sorgente (design §5.3).
  const outOfScope = rawEvents.some((event) => (
    event.lessonId !== scope.lessonId || event.sessionId !== scope.sessionId
  ))
  const lessonEvents = outOfScope ? [] : [...rawEvents].sort((a, b) => a.seq - b.seq)
  if (outOfScope) {
    issues.push({
      source: "event-union",
      severity: "corrupt",
      code: "scope-violation",
      preserved: null,
    })
  }

  void sessionBlob
  void journalBlob
  void sceneBlob

  return Object.freeze({
    scope,
    session: null,
    lessonEvents: Object.freeze(lessonEvents),
    journalEvents: Object.freeze([]),
    scene: null,
    buildCommitSha: null,
    evidenceByOccurrence: new Map(),
    issues: Object.freeze(issues),
  })
}
```

> I `void sessionBlob/journalBlob/sceneBlob` sono deliberati: il parsing di session, journal e scena arriva nel Task 12. Questo task congela il **call ledger** e il gate di scope, che sono gli oracoli RED-06-01/02.

- [ ] **Step 5: Eseguire, typecheck, commit**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityLoader.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run typecheck
git add apps/studio/src/lessonos/continuityLoader.ts apps/studio/src/__tests__/ContinuityLoader.test.ts
git commit -m "feat(continuity): add the session-scoped loader with a zero-effect scope gate

The port type cannot express readAll, the scope is validated before any I/O so
a mismatch produces zero reads, and the call ledger is asserted exactly: session
A/SA, journal A, scene A and the A/SA query. An out-of-scope record returned by
the query is a corrupt scope-violation, never a silent filter.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: Journal multi-sessione e unicità globale degli eventId (RED-06-03)

**Files:**
- Modify: `apps/studio/src/lessonos/continuityLoader.ts`
- Modify: `apps/studio/src/__tests__/ContinuityLoader.test.ts`

**Interfaces:**
- Consumes: `loadContinuitySnapshotV1` dal Task 11
- Produces: lo snapshot con `journalEvents` popolato e il gate `duplicate-event-id`

- [ ] **Step 1: Scrivere i test RED**

```ts
describe("loadContinuitySnapshotV1 — journal multi-sessione (RED-06-03)", () => {
  function journalLine(eventId: string, sessionId: string, kind = "journal.math.insert"): string {
    return JSON.stringify({
      schemaVersion: 2, eventId, lessonId: "lezione-a", sessionId, kind,
      occurredAt: "2026-07-23T00:00:01.000Z",
      actor: { type: "teacher", id: "docente" },
      producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.0.0", commitSha: "a".repeat(40) },
      causationId: null, idempotencyKey: null,
      evidence: [{ ref: "journal:math-input", resolution: "verified" }],
      payload: { latex: "x" },
    }) + "\n"
  }

  it("conserva solo SA e ne preserva l'ordine fisico", async () => {
    const files = new Map([["raw/lezione-a/events.jsonl",
      journalLine("00000000-0000-4000-8000-000000000001", SA)
      + journalLine("00000000-0000-4000-8000-000000000002", SB)
      + journalLine("00000000-0000-4000-8000-000000000003", SA),
    ]])
    const deps = spyDeps(files)
    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA }, deps,
    )
    expect(snapshot.journalEvents.map((entry) => entry.envelope.eventId)).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000003",
    ])
    expect(snapshot.journalEvents.map((entry) => entry.line)).toEqual([1, 3])
  })

  it("lo stesso eventId in LessonOS e journal produce duplicate-event-id e zero fatti", async () => {
    const shared = "00000000-0000-4000-8000-00000000000d"
    const files = new Map([["raw/lezione-a/events.jsonl", journalLine(shared, SA)]])
    const deps = spyDeps(files)
    deps.reader.readEnvelopesBySession = async () => [
      { lessonId: "lezione-a", sessionId: SA, seq: 1, eventId: shared, kind: "lesson.started", payload: { room: "lezione-a" } },
    ] as never
    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA }, deps,
    )
    expect(snapshot.issues.some((entry) => (
      entry.source === "event-union" && entry.code === "duplicate-event-id" && entry.severity === "corrupt"
    ))).toBe(true)
    expect(snapshot.lessonEvents).toEqual([])
    expect(snapshot.journalEvents).toEqual([])
    expect(snapshot.evidenceByOccurrence.size).toBe(0)
  })

  it("una riga V2 malformed rende il journal corrupt e non viene saltata", async () => {
    const files = new Map([["raw/lezione-a/events.jsonl",
      journalLine("00000000-0000-4000-8000-000000000001", SA) + '{"schemaVersion":2,"eventId":\n',
    ]])
    const deps = spyDeps(files)
    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA }, deps,
    )
    expect(snapshot.issues.some((entry) => (
      entry.source === "journal" && entry.severity === "corrupt"
    ))).toBe(true)
    expect(snapshot.journalEvents).toEqual([])
  })
})
```

- [ ] **Step 2: Eseguire e verificare il FAIL**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityLoader.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: FAIL — `journalEvents` è sempre `[]`.

- [ ] **Step 3: Implementare parsing del journal e gate dell'unione**

Nel loader, sostituisci `void journalBlob` con:

```ts
  // Il journal è lesson-level per design ARD-05: può contenere altre sessioni
  // della stessa lezione. Si conserva SOLO sessionId===scope.sessionId, PRIMA
  // di costruire l'input puro (design §5.3). Una riga V2 malformed rende il
  // journal corrupt: non viene saltata come legacy (design §12 RED-06-03).
  let journalEvents: { line: number; envelope: JournalEnvelopeV2 }[] = []
  if (journalBlob !== null) {
    try {
      const decoded = decodeJournalJsonl(await journalBlob.text(), paths.journal)
      journalEvents = decoded.envelopes
        .filter((entry) => entry.envelope.sessionId === scope.sessionId)
        .map((entry) => ({ line: entry.line, envelope: entry.envelope }))
    } catch {
      journalEvents = []
      issues.push({
        source: "journal", severity: "corrupt", code: "invalid-schema", preserved: null,
      })
    }
  }
```

> **Attenzione — `decodeJournalJsonl` va esteso prima.** Oggi (`ReplayEngine.ts:198-202`) restituisce `envelopes: readonly JournalEnvelopeV2[]`, **senza** il numero di riga: il `line` esiste solo dentro `issues`. L'indice dell'array **non è** la riga fisica, perché le righe legacy vengono adattate a envelope e quelle invalide saltate. Usare l'indice produrrebbe `line` sbagliati che nessun test di questa slice smaschererebbe.

- [ ] **Step 3b: Estendere `decodeJournalJsonl` in modo additivo e retrocompatibile**

In `apps/studio/src/store/ReplayEngine.ts`, cambia il tipo del risultato e la costruzione:

```ts
export type JournalDecodedEnvelope = Readonly<{
  line: number
  envelope: JournalEnvelopeV2
}>

export type JournalDecodeResult = Readonly<{
  /** Ordine fisico preservato; `line` è la riga 1-based del file, non l'indice. */
  envelopes: readonly JournalDecodedEnvelope[]
  legacy: readonly JournalEvent[]
  issues: readonly JournalDecodeIssue[]
}>
```

Dentro `decodeJournalJsonl`, dichiara `const envelopes: JournalDecodedEnvelope[] = []` e cambia `addEnvelope` perché riceva anche la riga:

```ts
  const addEnvelope = (envelope: JournalEnvelopeV2, line: number): void => {
    if (eventIds.has(envelope.eventId)) {
      throw new Error(`duplicate eventId ${envelope.eventId}`)
    }
    if (
      envelope.idempotencyKey !== null &&
      idempotencyKeys.has(envelope.idempotencyKey)
    ) {
      throw new Error(`duplicate idempotency key ${envelope.idempotencyKey}`)
    }
    eventIds.add(envelope.eventId)
    if (envelope.idempotencyKey !== null) idempotencyKeys.add(envelope.idempotencyKey)
    envelopes.push({ line, envelope })
  }
```

e passa `line` in entrambe le due chiamate esistenti (`addEnvelope(envelope, line)` nel ramo V2 e `addEnvelope(envelope, line)` nel ramo legacy adattato).

Poi aggiorna i **chiamanti esistenti** di `.envelopes`:

```bash
grep -rn "\.envelopes" apps/studio/src --include='*.ts' --include='*.tsx' | grep -v __tests__
grep -rn "decodeJournalJsonl" apps/studio/src --include='*.ts' --include='*.tsx'
```

Per ciascuno, sostituisci l'uso diretto dell'envelope con `.envelope`. `deserializeEvents` usa `.legacy` e **non** cambia.

- [ ] **Step 3c: Verificare che nulla sia regredito**

```bash
npm --prefix apps/studio run typecheck
npm --prefix apps/studio run test -- \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: typecheck exit 0 e suite intera verde. `tsc` è qui l'oracolo che trova ogni chiamante rimasto indietro — vitest da solo non lo farebbe.

Poi, dopo aver calcolato `lessonEvents` e `journalEvents`, aggiungi il gate dell'unione:

```ts
  // Unicità GLOBALE dell'eventId su LessonOS ∪ journal, PRIMA della evidence
  // Map (design §5.4, I2). Una seconda occurrence — anche byte-identica, anche
  // dall'altra sorgente — azzera la projection.
  const seen = new Set<string>()
  let duplicate = false
  for (const eventId of [
    ...lessonEvents.map((event) => event.eventId),
    ...journalEvents.map((entry) => entry.envelope.eventId),
  ]) {
    if (seen.has(eventId)) { duplicate = true; break }
    seen.add(eventId)
  }
  if (duplicate) {
    issues.push({
      source: "event-union", severity: "corrupt", code: "duplicate-event-id", preserved: null,
    })
  }

  const unionPoisoned = duplicate || outOfScope
```

e usa `unionPoisoned ? [] : lessonEvents` e `unionPoisoned ? [] : journalEvents` nel return, lasciando `evidenceByOccurrence` vuota quando `unionPoisoned` è vero.

Aggiungi gli import:

```ts
import { decodeJournalJsonl } from "../store/ReplayEngine"
import type { JournalEnvelopeV2 } from "../store/JournalRecorder"
```

- [ ] **Step 4: Eseguire, typecheck, commit**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityLoader.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run typecheck
git add apps/studio/src/lessonos/continuityLoader.ts apps/studio/src/__tests__/ContinuityLoader.test.ts
git commit -m "feat(continuity): keep only the requested session and gate the event-id union

The journal is lesson-level, so other sessions of the same lesson are dropped
before the pure input is built, keeping physical line order. A repeated eventId
anywhere across LessonOS and the journal poisons the union: both lists are
emptied and no evidence map is built, so a duplicate can never reach it.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Gate di ridondanza `payload.room` (design §5.4, I1)

**Files:**
- Modify: `apps/studio/src/lessonos/continuityLoader.ts`
- Modify: `apps/studio/src/__tests__/ContinuityLoader.test.ts`

**Interfaces:**
- Consumes: il loader del Task 12
- Produces: il loader completo della slice B

- [ ] **Step 1: Scrivere i test RED**

```ts
describe("loadContinuitySnapshotV1 — ridondanza payload.room (I1)", () => {
  const SENTINEL = "SENTINELLA-DI-LEZIONE-B"

  for (const kind of ["lesson.started", "lesson.ended", "plugin.mounted"]) {
    it(`${kind} con payload.room diverso produce scope-violation e zero fatti`, async () => {
      const deps = spyDeps()
      deps.reader.readEnvelopesBySession = async () => [
        { lessonId: "lezione-a", sessionId: SA, seq: 1, eventId: "00000000-0000-4000-8000-000000000001", kind, payload: { room: SENTINEL } },
      ] as never
      const snapshot = await loadContinuitySnapshotV1(
        { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA }, deps,
      )
      expect(snapshot.issues.some((entry) => (
        entry.source === "event-union" && entry.code === "scope-violation"
      ))).toBe(true)
      expect(snapshot.lessonEvents).toEqual([])
      // La sentinella non deve sopravvivere nella serializzazione.
      expect(JSON.stringify(snapshot)).not.toContain(SENTINEL)
    })

    it(`${kind} senza payload.room è invalid-schema`, async () => {
      const deps = spyDeps()
      deps.reader.readEnvelopesBySession = async () => [
        { lessonId: "lezione-a", sessionId: SA, seq: 1, eventId: "00000000-0000-4000-8000-000000000002", kind, payload: {} },
      ] as never
      const snapshot = await loadContinuitySnapshotV1(
        { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA }, deps,
      )
      expect(snapshot.issues.some((entry) => (
        entry.source === "event-union" && entry.code === "invalid-schema"
      ))).toBe(true)
    })
  }

  it("un kind non ridondante senza room non è un errore", async () => {
    const deps = spyDeps()
    deps.reader.readEnvelopesBySession = async () => [
      { lessonId: "lezione-a", sessionId: SA, seq: 1, eventId: "00000000-0000-4000-8000-000000000003", kind: "error.observed", payload: { errorId: "e" } },
    ] as never
    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: "lezione-a", roomId: "lezione-a", sessionId: SA }, deps,
    )
    expect(snapshot.issues).toEqual([])
    expect(snapshot.lessonEvents).toHaveLength(1)
  })
})
```

> Nota sul `plugin.mounted` senza room: il design §5.4 lo tratta come `unsupported-event-contract/degraded` finché ARD-07 non lo rende strict, NON come `invalid-schema`. Se il Task 2 ha confermato quella lettura, cambia l'asserzione del secondo test per `plugin.mounted` in `unsupported-event-contract` con `severity: "degraded"` e implementa di conseguenza. Decidilo **prima** di scrivere l'implementazione, non dopo aver visto il test rosso.

- [ ] **Step 2: Eseguire e verificare il FAIL**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityLoader.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Atteso: FAIL — nessuna issue viene prodotta.

- [ ] **Step 3: Implementare**

```ts
const ROOM_REDUNDANT_KINDS = new Set(["lesson.started", "lesson.ended", "plugin.mounted"])

/**
 * Seconda ridondanza di scope (design §5.4, I1): per i tre kind di lifecycle
 * il payload deve dichiarare la room, canonica ed esattamente uguale a
 * scope.roomId === scope.lessonId. Un valore presente ma diverso è
 * scope-violation e azzera la projection, così una sentinella dentro il
 * payload non può comparire nella UI diagnostica.
 */
function checkRoomRedundancy(
  events: readonly AppendedEventEnvelopeV2[],
  scope: ContinuityScopeV1,
): ContinuitySourceIssueV1 | null {
  for (const event of events) {
    if (!ROOM_REDUNDANT_KINDS.has(event.kind)) continue
    const room = (event.payload as { room?: unknown }).room
    if (typeof room !== "string") {
      return {
        source: "event-union",
        severity: event.kind === "plugin.mounted" ? "degraded" : "corrupt",
        code: event.kind === "plugin.mounted" ? "unsupported-event-contract" : "invalid-schema",
        preserved: null,
      }
    }
    if (room !== scope.roomId) {
      return { source: "event-union", severity: "corrupt", code: "scope-violation", preserved: null }
    }
  }
  return null
}
```

Nel loader, dopo il gate dei duplicati:

```ts
  const roomIssue = outOfScope ? null : checkRoomRedundancy(lessonEvents, scope)
  if (roomIssue !== null) issues.push(roomIssue)
  const unionPoisoned = duplicate || outOfScope || roomIssue?.severity === "corrupt"
```

- [ ] **Step 4: Eseguire, typecheck, commit**

```bash
npm --prefix apps/studio run test -- src/__tests__/ContinuityLoader.test.ts \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run typecheck
git add apps/studio/src/lessonos/continuityLoader.ts apps/studio/src/__tests__/ContinuityLoader.test.ts
git commit -m "feat(continuity): verify the redundant payload room on lifecycle events

lesson.started, lesson.ended and plugin.mounted must carry a canonical room
equal to both route identities. A different value is a corrupt scope violation
that empties the projection, so a sentinel hidden in the payload cannot reach
the serialisation or the diagnostic UI; a historic plugin.mounted without a
room degrades instead, until ARD-07 makes it strict.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: Chiusura della slice ARD-06-B — ledger, gate, PR

**Files:**
- Modify: `apps/studio/STATUS.md`
- Modify: `apps/studio/log.jsonl`

- [ ] **Step 1: Appendere la voce STATUS.md**

```markdown
- **2026-07-25 — ARD-06-B loader session-scoped + indice query.** Nuovo `src/lessonos/continuityLoader.ts`: porte `ContinuityEventReaderV1`/`ContinuityWorkspaceReaderV1` in cui `readAll` non è rappresentabile; gate di scope prima di ogni I/O (zero read su mismatch, RED-06-01); call ledger esatto session A/SA + journal A + scene A + query A/SA, zero path flat (RED-06-02); journal lesson-level filtrato alla sola sessione con ordine fisico preservato, riga V2 malformed = corrupt non skip, unicità GLOBALE eventId su LessonOS ∪ journal prima della evidence Map (RED-06-03); ridondanza `payload.room` sui tre kind di lifecycle. `ReplayEngine.ts`: `decodeJournalJsonl` restituisce ora gli envelope con la loro riga fisica 1-based (prima il `line` esisteva solo nelle issue, e l'indice dell'array non era la riga). Cambio additivo, `deserializeEvents` invariato. **Gate: vitest focused verde, suite intera verde, typecheck exit 0.** L'indice composto `by_lesson_session_seq` è arrivato nella slice B0 separata. Prossima: **ARD-06-C resolver evidence chiuso**.
```

- [ ] **Step 2: Appendere il record log.jsonl**

Stesso script Python del Task 9 Step 2, con `"task": "ARD-06-B-CONTINUITY-LOADER"`, i file di questa slice e `"red": ["RED-06-01", "RED-06-02", "RED-06-03"]`.

- [ ] **Step 3: Gate completi**

```bash
python3 - <<'PY'
import json, pathlib
lines = pathlib.Path("apps/studio/log.jsonl").read_text().splitlines()
def ok(line):
    try:
        json.loads(line); return True
    except Exception:
        return False
print("invalide:", [i + 1 for i, line in enumerate(lines) if line.strip() and not ok(line)])
PY
git diff --stat origin/main -- apps/studio/log.jsonl
npm --prefix apps/studio run typecheck
npm --prefix apps/studio run test -- \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
(cd apps/studio && bash eval/gate.sh)
UV_CACHE_DIR=/private/tmp/ardesia-uv-cache npm run verify; echo "VERIFY=$?"
```

Atteso: `invalide: []`; diff del ledger di sole aggiunte; typecheck exit 0; suite verde; `gate.sh` verde; `VERIFY=0`.

- [ ] **Step 4: Verificare i divieti §15 sul diff della slice**

```bash
git diff origin/main --unified=0 -- apps/studio/src/lessonos/continuityLoader.ts apps/studio/src/store/ReplayEngine.ts \
  | grep -nE '^\+' \
  | grep -nE 'readAll|PATHS\.JOURNAL|PATHS\.SESSION|raw/events\.jsonl|raw/session\.yaml|TeacherDashboard|"current"' \
  || echo "OK: nessun divieto §15 nel codice nuovo"
```

Atteso: `OK`. Le stringhe `raw/events.jsonl` e `raw/session.yaml` possono comparire nei **test** come path vietati da asserire: il grep sopra controlla solo il file di produzione.

- [ ] **Step 5: Commit, PR, CI**

```bash
git add apps/studio/STATUS.md apps/studio/log.jsonl
git commit -m "docs(studio): record the ARD-06-B slice in STATUS and the ledger

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin HEAD:refs/heads/codex/ard06-b-loader-20260723
gh pr create --repo AndreaMarro/ardesia --base main \
  --title "ARD-06-B: session-scoped continuity loader and composite index query" \
  --body "Seconda slice del design ARD-06. Additiva e read-only.

RED-06-01 (scope a effetto zero), RED-06-02 (call ledger esatto, zero flat path, readAll che lancia se toccato), RED-06-03 (journal multi-sessione, unicità globale eventId, riga V2 malformed corrupt).

La migration IndexedDB è additiva: nessuno store cancellato, nessun record riscritto, righe V1 prive di identità canonica fuori dall'indice e materia di recovery.

Gate: vitest focused verde, suite intera verde, typecheck exit 0, gate.sh verde, npm run verify exit 0."
gh pr checks --repo AndreaMarro/ardesia --watch
```

- [ ] **Step 6: Receipt nel vault**

Crea `~/ARDESIA-KNOWLEDGE/30-Evidence-Receipts/2026-07-25-ARD06-AB-SLICES.md` con base/head full SHA delle due PR, i RED coperti, i gate con output, i divieti §15 verificati, e la dichiarazione esplicita che **FB-06 resta rossa**: ARD-06-C/D/E/F non sono fatte e ARD-07/ARD-08 non sono accepted. Poi:

```bash
cd ~/ARDESIA-KNOWLEDGE && python3 bin/vault-graph-kpi.py 0.95 >/dev/null; echo "EXIT=$?"
git add 30-Evidence-Receipts/2026-07-25-ARD06-AB-SLICES.md 00-INDEX.md
git commit -m "docs(ard-06): receipt delle slice A e B

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Criteri di accettazione del piano

| # | Criterio | Oracolo |
|---|---|---|
| A1 | Premessa stale corretta in append-only | i byte v2 hanno lo stesso SHA-256 di prima; §17 esiste |
| A2 | Verdetto pieno emesso | riga `verdict:` in `D-ARD06-REVIEW.md`, con i 5 Important e i 7 punti di attacco |
| A3 | Nessun codice prima del verdetto | il primo commit di `codex/ard06-a-*` è successivo al commit del verdetto |
| A4 | ARD-06-A: RED→GREEN documentati | 27 test in `ContinuityProjection.test.ts` + 5 `@ts-expect-error` |
| A5 | Ordine P0 totale | permutation oracle 3! + 100 shuffle seeded, byte-identico |
| A6 | ARD-06-B0 + B: call ledger esatto | 4 sole chiamate, zero flat path, `readAll`/`readAllEnvelopes` mai invocati |
| A7 | Zero divieti §15 nel codice di produzione | il grep dello Step «divieti» stampa `OK` in entrambe le slice |
| A8 | Ledger append-only | `git diff --stat` su `log.jsonl` mostra solo inserzioni; zero righe JSON invalide |
| A9 | Gate verdi sullo stesso head | typecheck, vitest, `gate.sh`, `verify`, CI 3/3 |
| A10 | Nessun claim non provato | il receipt dichiara FB-06 rossa e ARD-07/08 non accepted |

## Ordine di caduta

Se il tempo finisce: **Task 1-2 sono irrinunciabili** (senza verdetto non si scrive codice, e la premessa falsa è un rischio attivo). Poi Task 3-9 (slice A, completa e mergiabile da sola). Poi Task 10 (slice B0, indipendente e mergiabile da sola). Poi Task 11-14 (slice B). Ogni task saltato è una riga NOT_RUN nel receipt, mai un silenzio.
