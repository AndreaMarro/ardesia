# CODEX Teacher Dashboard Z-Zones Audit - 2026-07-11

Packet: `PKT-CODEX-4`
Repo: `/Users/andreamarro/VOLUME 3/ardesia`
Mode: read-only audit + docs-only output
Working checkout at audit time: branch `codex/ardesia-ops-headroom-20260701`, dirty
Canonical source used for teacher-dashboard code findings: `origin/main` at `12d61081` (`Merge pull request #124 from AndreaMarro/feat/installer-transactional-20260711`)

## 1. Executive summary

Il cruscotto docente ARDESIA non e' piu' solo spec: su `origin/main` esistono route, projector LessonOS, zona statistiche, zona Z7 student-pack, plugin ripasso live via `graph.query`, event-log persistente IndexedDB, materializer, e producer reali per `error.observed`, `material.cited`, `quiz.attempted`, `studentpack.generated/exported`.

Pero' la teacher page non e' ancora una pagina docente "reale, utile e coerente" nel senso richiesto:

- la UI montata mostra solo **Statistiche + Z7 + Ripasso**, non Z1-Z12;
- la zona statistiche live non riceve i `journalEvents`, quindi i contatori board/manuale/formule/audio restano di fatto scollegati dal lavoro reale della lavagna;
- i segmenti lezione dipendono da `lesson.started`/`lesson.ended`, ma oggi quei kind non hanno una produzione runtime vera fuori dai test;
- marketplace/materiali/plugin registry esistono come primitive locali, ma non entrano ancora nella projection;
- pagamenti, marketplace pubblico, PII studente e profilo pubblico restano correttamente fuori scope.

In sintesi: **le fondamenta dati ci sono; la superficie teacher e' ancora una micro-slice dimostrativa, non una dashboard completa**.

## 2. Stato attuale teacher dashboard

### 2.1 Cosa esiste davvero

- Route dedicata `?vista=cruscotto` montata in `origin/main:apps/studio/src/App.tsx:25-29`.
- View dedicata `TeacherDashboardView` in `origin/main:apps/studio/src/design/TeacherDashboardView.tsx:21-384`.
- Projector puro `projectTeacherDashboard()` in `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:387-426`.
- Event-log append-only LessonOS in `origin/main:apps/studio/src/lessonos/eventlog.ts:45-97` con backend IndexedDB in `origin/main:apps/studio/src/lessonos/indexedDbEventLog.ts:63-293`.
- Materializer grafo e recall deterministico in:
  - `origin/main:apps/studio/src/lessonos/materializer.ts:61-147`
  - `origin/main:apps/studio/src/lessonos/recall.ts:29-80`
- `graph.query` live nel ToolHost read-only in `origin/main:apps/studio/src/toolhost/caps/graph.ts:45-82`.
- Plugin `ripasso` come primo consumatore reale di `graph.query`:
  - `origin/main:apps/studio/plugins/ripasso/main.ts:48-90`
  - `origin/main:apps/studio/plugins/ripasso/ripasso.ts:60-115`
- Z7 con azioni append-only `studentpack.generated/exported` in `origin/main:apps/studio/src/design/TeacherDashboardView.tsx:138-180`.
- Saved lessons / quiz / flashcards con producer reale `quiz.attempted`:
  - `origin/main:apps/studio/src/design/SavedLessonsView.tsx:21-70`
  - `origin/main:apps/studio/src/SavedLessonsPanel.tsx:171-185`
  - `origin/main:apps/studio/src/lessonos/quizAttemptProducer.ts:30-82`
- Produzione reale di `error.observed` da ElabLab:
  - `origin/main:apps/studio/src/design/ElabLab.tsx:99-105`
  - `origin/main:apps/studio/src/design/ElabLab.tsx:163-183`
- Promozione reale `pdf.page.view -> material.cited` via journal bridge:
  - `origin/main:apps/studio/src/Room.tsx:417-440`
  - `origin/main:apps/studio/src/lessonos/journalBridge.ts:77-107`

### 2.2 Quali Z-zone sono reali oggi

| Zona | Stato reale su `origin/main` | Nota |
|---|---|---|
| Z1 Grafo navigabile | **PARTIAL** | il projector lo costruisce (`graphView`), il plugin ripasso usa il grafo, ma non esiste ancora una UI docente navigabile generale |
| Z2 Lezioni/timeline | **PARTIAL** | il projector ha `lessons[]`, ma la view non la mostra |
| Z3 Studenti | **SPEC/PARTIAL data only** | schema con `studentId` esiste, UI assente, aggregati non proiettati |
| Z4 Calendario | **SPEC ONLY** | il projector dichiara `lesson.planned` mancante |
| Z5 Materiali & marketplace | **PARTIAL primitives, no dashboard zone** | manifest/local catalog esistono, zona docente no |
| Z6 Plugin | **PARTIAL primitives, no dashboard zone** | catalogo locale esiste, projection oggi restituisce `plugins: []` |
| Z7 Student-pack | **REAL but partial** | coda e status reali; generazione/export reali del pack no |
| Z8 Errori ricorrenti | **PARTIAL** | `recurringErrors[]` esiste, UI dedicata no; ripasso copre solo una sotto-vista |
| Z9 Statistiche | **REAL but incomplete** | cards esistono, ma il path live non passa i journal counts |
| Z10 Export/Import | **SPEC/PARTIAL** | export lesson esiste altrove, zona docente no |
| Z11 Drive | **SPEC ONLY** | placeholder corretto |
| Z12 Profilo pubblico | **SPEC ONLY** | contratto esiste, source locale no, UI no |

### 2.3 Quali Z-zone sono solo spec o onesta indisponibilita'

Il projector dichiara esplicitamente indisponibili `Z3`, `Z4`, `Z5`, `Z6`, `Z10`, `Z11`, `Z12` in `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:416-423`, coerente con `origin/main:docs/product/TEACHER-DASHBOARD-SPEC.md:17-20`.

Il problema non e' la mancanza di onesta' nel projector. Il problema e' che la view **non renderizza affatto** `unavailable[]`: mostra solo tre sezioni e nasconde il resto.

## 3. Data map

### 3.1 Event-log LessonOS

Schema:

- `origin/main:apps/studio/src/lessonos/eventlog.ts:45-97`

Kind supportati dal contratto:

- `lesson.started`, `lesson.ended`
- `concept.introduced`
- `material.cited`
- `error.observed`
- `exercise.completed`
- `quiz.attempted`
- `studentpack.generated`
- `studentpack.exported`

Producer runtime reali trovati:

- `error.observed` via `ElabLab.tsx:173-183` + `busEventLogBinding.ts:34-62`
- `material.cited` via `Room.tsx:417-440` + `journalBridge.ts:77-107`
- `quiz.attempted` via `SavedLessonsPanel.tsx:171-185` + `quizAttemptProducer.ts:30-82`
- `studentpack.generated/exported` via `TeacherDashboardView.tsx:158-180`

Kind definiti ma senza producer runtime chiaro nel codice letto:

- `lesson.started`
- `lesson.ended`
- `concept.introduced`
- `exercise.completed`
- `lesson.planned` nemmeno esiste nello schema v0, ed e' citato come dipendenza futura in `teacherDashboardProjection.ts:418`

### 3.2 Graph query / materializer / projection

- Materializer puro: `origin/main:apps/studio/src/lessonos/materializer.ts:61-147`
- Recall deterministico: `origin/main:apps/studio/src/lessonos/recall.ts:29-80`
- ToolHost graph capability read-only: `origin/main:apps/studio/src/toolhost/caps/graph.ts:45-82`
- Projector teacher dashboard: `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:387-426`

Pipeline reale oggi:

```text
LessonOS events
  -> materialize()
  -> ToolGraph.query()
  -> ripasso plugin / teacher projector
```

### 3.3 Student-pack events

- Candidati Z7 derivati da `error.observed` mai corretti: `teacherDashboardProjection.ts:248-305`
- Lift di stato da eventi append-only:
  - `studentpack.generated`
  - `studentpack.exported`
- UI che appende questi eventi: `TeacherDashboardView.tsx:138-180`

Limite reale: non ho trovato una pipeline docente che generi un pack concreto o un export study-pack dal cruscotto. Oggi la teacher page muove lo stato nel log, non il file/prodotto.

### 3.4 Plugin ripasso

- Manifest minimal read-only: `origin/main:apps/studio/plugins/ripasso/manifest.ts:11-31`
- Runtime: `origin/main:apps/studio/plugins/ripasso/main.ts:48-90`
- Modello puro: `origin/main:apps/studio/plugins/ripasso/ripasso.ts:60-115`
- Mount di produzione con ToolHost reale: `origin/main:apps/studio/src/toolhost/panelHost.ts:87-115`

Ruolo: e' la prima prova reale che `graph.query` e la teacher page possono leggere il grafo senza secondo store.

### 3.5 Pagamenti / materiali vendibili / plugin marketplace

Pagamenti:

- esplicitamente fuori scope in `origin/main:packages/engine/docs/PLATFORM-MAESTRO.md:99-103`

Marketplace / metadata plugin:

- manifest supporta `kind`, `author`, `visibility`, `license`, `pricing` in `origin/main:apps/studio/src/toolhost-protocol/manifest.ts:42-59` e `:81-86`
- scaffolder propaga i campi marketplace in `origin/main:apps/studio/src/toolhost/authoring/scaffoldPlugin.ts:74-85` e `:283-297`
- catalogo locale legge tool installati e mostra `kind/author/visibility/license/state` in `origin/main:apps/studio/src/toolhost/marketplace/localCatalog.ts:24-76`

Limite:

- la teacher projection corrente restituisce comunque `plugins: []` e `publicProfile: null` in `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:412-415`

### 3.6 LessonOS / event-log connection surfaces

- Room bootstrap dello store: `origin/main:apps/studio/src/Room.tsx:137-153`
- Journal raw recorder: `origin/main:apps/studio/src/store/JournalRecorder.ts:75-258`
- Journal -> LessonOS promotion solo per `material.cited`: `Room.tsx:417-440`
- Saved lessons path con `quiz.attempted`: `SavedLessonsView.tsx:21-70`

Questo significa che oggi la memoria docente vive su piu' superfici reali, ma ancora con copertura semantica incompleta.

## 4. Findings P0 / P1 / P2

### P0-1 - Le statistiche live non ricevono i `journalEvents`, quindi board/manuale/formule/audio restano scollegati dalla lezione reale

**Evidenza**

- `origin/main:apps/studio/src/design/TeacherDashboardView.tsx:115-123`
- `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:193-220`
- `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:363-383`

**Scenario**

La view chiama `projectTeacherDashboard()` passando solo `lessonEvents`. I counts di elementi, formule, pagine manuale e audio vengono invece derivati solo da `journalEvents`.

**Impatto**

La zona Z9 sembra reale ma oggi non puo' riflettere con onesta' il lavoro effettivo fatto sulla lavagna. Le card piu' utili per il docente rischiano di restare sempre a zero.

**Test falsificabile**

Aprire una room, creare elementi Excalidraw, inserire una formula, vedere pagine PDF, poi aprire `?vista=cruscotto`: `board.elements.created`, `math.inserts.count`, `manual.pages.viewed` dovrebbero essere `> 0`. Con il wiring attuale la projection live non ha i dati.

**Fix minimo**

Far leggere alla teacher view il journal reale della room corrente e passare `journalEvents` + `journalRoom` al projector.

**Ownership**

Studio teacher dashboard / LessonOS projection.

**Conflitto con FABLE P0-LIVE / P0-C**

No, se confinato a `TeacherDashboardView` + helper di lettura journal.

### P0-2 - Timeline, finestre lezione e assegnazione `fromRoom` dipendono da `lesson.started/lesson.ended`, ma quei kind non hanno ancora una produzione runtime reale

**Evidenza**

- `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:164-166`
- `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:255-305`
- `origin/main:apps/studio/src/Room.tsx:447-449`
- `origin/main:apps/studio/src/Room.tsx:786-789`
- `origin/main:apps/studio/src/__tests__/TeacherDashboardStatsZone.test.tsx:26-37` e `TeacherDashboardZ7View.test.tsx:28-39` usano fixture con `lesson.started/lesson.ended`

**Scenario**

Il projector segmenta la lezione solo se nel log esistono eventi di inizio/fine. Nel runtime, `Room.tsx` documenta ancora l'export come stand-in di fine lezione e il primo gesto come stand-in finche' non esiste `lesson.started`.

**Impatto**

Z2 timeline, Z4 storico, `lessons.count`, finestre temporali delle stat e `studentPackQueue.fromRoom` non sono affidabili su dati live.

**Test falsificabile**

Fare una sessione reale in `Room`, poi leggere l'event-log IndexedDB: se non compaiono `lesson.started` e `lesson.ended`, il projector deve restituire `lessons: []` oppure candidati `fuori lezione`.

**Fix minimo**

Appendere `lesson.started` al primo gesto intenzionale o all'apertura effettiva della sessione, e `lesson.ended` su export/chiusura/fine-sessione.

**Ownership**

Studio / `Room.tsx` / LessonOS runtime.

**Conflitto con FABLE P0-LIVE / P0-C**

Si'. Tocca `Room.tsx`, che e' anche nell'area WIP parallela. Da coordinare.

### P1-1 - La UI del cruscotto nasconde quasi tutte le zone mancanti invece di dichiararle

**Evidenza**

- Spec: `origin/main:docs/product/TEACHER-DASHBOARD-SPEC.md:17-20`
- Projector: `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:416-423`
- View: `origin/main:apps/studio/src/design/TeacherDashboardView.tsx:195-380`

**Scenario**

Il projector produce `unavailable[]` con ragioni esplicite per Z3/Z4/Z5/Z6/Z10/Z11/Z12. La view non mostra quella lista: rende solo Statistiche, Student-pack e Ripasso.

**Impatto**

Il docente non vede cosa manca davvero, e la pagina appare piu' "vuota" che "onesta". Questo contraddice il principio della spec: zone senza fonte reale devono dichiararsi, non sparire.

**Test falsificabile**

Montare `TeacherDashboardView` su event-log vuoto o minimale e verificare che compaia almeno una sezione "non disponibile". Oggi non compare nulla del genere.

**Fix minimo**

Renderizzare una banda finale "Zone non ancora disponibili" leggendo `projection.unavailable`.

**Ownership**

Teacher dashboard UI.

**Conflitto con FABLE P0-LIVE / P0-C**

No.

### P1-2 - Z7 oggi muove lo stato nel log, ma non genera/esporta un vero student-pack

**Evidenza**

- `origin/main:apps/studio/src/design/TeacherDashboardView.tsx:138-180`
- `origin/main:docs/PRODUCT-CANON.md:23-25`
- `origin/main:apps/studio/src/lessonos/apiClient.ts:1-5`

**Scenario**

I bottoni "Genera pack" ed "Esporta" appendono `studentpack.generated/exported` con le evidenze del candidato, ma non ho trovato una chiamata a una route reale di study-pack o a un writer di bundle pack dal cruscotto.

**Impatto**

La zona Z7 sembra operativa prima che esista il prodotto concreto che promette. Questo crea un falso positivo di readiness.

**Test falsificabile**

Premere "Genera pack" e cercare un nuovo artefatto esportabile o una chiamata API study-pack: con il wiring attuale cambia lo stato nel log, non il deliverable.

**Fix minimo**

O collegare Z7 a una pipeline reale di studio-pack/export, o rinominare l'azione in modo onesto finche' il producer non esiste.

**Ownership**

Teacher dashboard + LessonOS saved-lessons/study-pack path.

**Conflitto con FABLE P0-LIVE / P0-C**

No diretto, se resta fuori da ToolHost core/Room.

### P1-3 - Primitive di marketplace/materiali/plugin registry esistono, ma la projection le azzera

**Evidenza**

- `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:412-415`
- `origin/main:apps/studio/src/toolhost/marketplace/localCatalog.ts:24-76`
- `origin/main:apps/studio/src/toolhost-protocol/manifest.ts:42-59`
- `origin/main:apps/studio/src/toolhost-protocol/manifest.ts:81-86`

**Scenario**

Il monorepo ha gia' metadata locali per plugin installati, tipo modulo, autore, visibilita', licenza e pricing. La projection docente continua pero' a restituire `plugins: []` e `publicProfile: null`.

**Impatto**

Z5/Z6/Z12 non sono bloccate da assenza totale di primitive, ma da mancato cablaggio tra catalogo locale e proiettore docente.

**Test falsificabile**

Installare un tool locale e costruire il catalogo con `buildLocalCatalog()`: la teacher projection non lo mostra comunque.

**Fix minimo**

Aggiungere al projector input un catalog snapshot locale e renderizzare almeno id/version/kind/publisher/state.

**Ownership**

Teacher dashboard / local catalog.

**Conflitto con FABLE P0-LIVE / P0-C**

No, se si evita `installer.ts` e si consuma solo il catalogo gia' esistente.

### P1-4 - Il modello dichiara classi e studenti aggregati, ma l'output reale si ferma a `room`

**Evidenza**

- Contratto: `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:13-17`
- Output reale: `origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts:404-408`
- Supporto schema a `studentId`: `origin/main:apps/studio/src/lessonos/eventlog.ts:50-57`, `:58-67`, `:68-77`
- Projection per-studente gia' disponibile per debt: `origin/main:apps/studio/src/lessonos/learningDebtProjection.ts:23-31`, `:42-86`

**Scenario**

Il contratto parla di `class | room | student-aggregate`, ma il projector emette solo scope di tipo `room`. Esistono gia' eventi con `studentId` opzionale e una projection di debt per-studente.

**Impatto**

Lezioni di gruppo, aggregati classe e percorso tutor 1:1 non trovano ancora una rappresentazione docente coerente.

**Test falsificabile**

Aggiungere eventi con `studentId` pseudonimo e verificare che la teacher projection non cambi struttura scope né produca aggregati studente/classe.

**Fix minimo**

Introdurre una piccola derivazione `room -> class scope` e una vista aggregata pseudonima basata solo su eventi con `studentId`.

**Ownership**

Teacher dashboard / LessonOS projection.

**Conflitto con FABLE P0-LIVE / P0-C**

No.

### P2-1 - Pagamenti reali restano fuori scope per design, non per backlog tecnico

**Evidenza**

- `origin/main:packages/engine/docs/PLATFORM-MAESTRO.md:99-103`
- `origin/main:docs/product/TEACHER-DASHBOARD-SPEC.md:179-189`

**Scenario**

Il prodotto dichiara esplicitamente che non fa l'esattore e che marketplace transazionale e pagamenti non stanno nella v0/v1 del cruscotto.

**Impatto**

Qualsiasi card "pagamenti" o "ricavi" sarebbe oggi per forza mock o integrazione esterna non ratificata.

**Test falsificabile**

Cercare una route runtime o uno store per pagamenti nella superficie teacher di Studio: non c'e'.

**Fix minimo**

Nessun fix in questo pacchetto. Resti gate-Andrea.

**Ownership**

Andrea / prodotto / infra esterna.

**Conflitto con FABLE P0-LIVE / P0-C**

No.

### P2-2 - La copertura E2E del cruscotto oggi prova solo uno smoke vuoto della Z7

**Evidenza**

- `origin/main:apps/studio/e2e/cruscotto.spec.ts:1-26`

**Scenario**

Il test browser controlla solo che `?vista=cruscotto` si apra, mostri heading Student-pack e empty state su event-log vuoto.

**Impatto**

Non c'e' una prova end-to-end del flusso dati reale per statistiche, timeline o ripasso.

**Test falsificabile**

Aggiungere una fixture live di event-log/journal e pretendere card statistiche > 0 e ripasso ordinato aperti/corretti.

**Fix minimo**

Una sola E2E nuova dopo il wiring P0-1/P0-2.

**Ownership**

Teacher dashboard tests.

**Conflitto con FABLE P0-LIVE / P0-C**

No.

## 5. Product map del pannello docente ideale

Il pannello docente utile, coerente e local-first dovrebbe essere:

| Zona | UI minima utile | Fonte vera |
|---|---|---|
| Z1 Grafo | pannello laterale con focus node + vicinato depth 1/2 + click su evidenze | `graph.query` read-only |
| Z2 Timeline | lista lezioni per room con durata, pagine viste, elementi creati, errori osservati | `lesson.started/ended` + journal bridged/projection |
| Z3 Allievi | solo aggregati pseudonimi e solo con consenso; vista 1:1 separata | `studentId` opzionale in event-log |
| Z4 Calendario | storico vero ora, pianificato dopo con `lesson.planned` | event-log append-only |
| Z5 Materiali | PDF/manuali/`.lesson` usati e ultimi import/export | workspace raw/derived |
| Z6 Plugin | tool installati, versione, publisher, ultimo uso, capability principali | manifest registry + local catalog + events |
| Z7 Student-pack | coda candidati + producer/export reale, non solo stato | graph + engine route + export |
| Z8 Errori ricorrenti | errori per concetto con correzioni collegate | materializer + recurringErrors |
| Z9 Statistiche | solo conteggi deterministici cliccabili verso le evidenze | event-log + graph |
| Z10 Export/Import | ultimi bundle, stato export, restore consigliato | lesson bundle + event-log |
| Z11 Drive | solo placeholder finche' non c'e' spec/import vero | nessuna fonte oggi |
| Z12 Profilo pubblico | card locale semplice, no publishing transazionale | workspace locale + marketplace futuro |

Vincoli non negoziabili:

- nessun secondo store;
- niente PII per default;
- niente mock;
- tutto derivabile da event-log/grafo/catalogo/workspace;
- teacher page privata, non da proiettare come prima superficie;
- pagamenti e marketplace pubblico fuori dal primo slice.

## 6. Quali statistiche si possono fare ORA solo da event-log reale senza mock/PII

### Gia' fattibili con producer runtime reali trovati

- conteggio `error.observed`
- elenco errori aperti / corretti solo dove esiste anche `exercise.completed`
- conteggio `material.cited`
- conteggio `quiz.attempted`
- somma `correct/total` dei quiz tentati
- conteggio `studentpack.generated`
- conteggio `studentpack.exported`
- coda Z7 di errori mai corretti

### Fattibili dal contratto, ma oggi non ancora oneste sul live path

- numero lezioni
- durata per lezione
- elementi creati sulla lavagna
- formule inserite
- pagine manuale viste
- audio marker per lezione
- aggregati per classe/room

Queste richiedono almeno uno tra:

- producer reali di `lesson.started/lesson.ended`
- passaggio dei `journalEvents` reali alla teacher projection

### Non oneste oggi senza uscire dal perimetro

- pagamenti/ricavi
- ranking studenti
- mastery/progress score
- marketplace revenue
- profilo pubblico pubblicato
- analytics cross-account / deploy esterno

## 7. 5 PR ordinate, piccole e verificabili

### PR-1 - Teacher dashboard honesty band

**Obiettivo**: mostrare `unavailable[]`, Z2 mini-summary e Z8 recurring errors gia' calcolati dal projector.
**File target**: `TeacherDashboardView.tsx` + test vista.
**Verifica**: con event-log minimale compaiono sezioni "non disponibile" con ragione esplicita.
**Conflitto FABLE**: no.

### PR-2 - Live journal -> stats bridge per il cruscotto

**Obiettivo**: far arrivare `journalEvents` reali al projector della teacher page, senza toccare ToolHost.
**File target**: helper lettura journal + `TeacherDashboardView.tsx` + test.
**Verifica**: una sessione con `element.add`, `math.insert`, `pdf.page.view` produce stat `> 0`.
**Conflitto FABLE**: no.

### PR-3 - Producer reale `lesson.started` / `lesson.ended`

**Obiettivo**: rendere vere timeline, finestre e `fromRoom`.
**File target**: `Room.tsx` + test mirati LessonOS.
**Verifica**: dopo uso reale della room il log contiene start/end; `lessons.count` e `fromRoom` non restano vuoti.
**Conflitto FABLE**: **si**, perche' tocca `Room.tsx`.

### PR-4 - Z5/Z6 locali: materiali e plugin installati

**Obiettivo**: popolare dashboard con catalogo locale e materiali workspace gia' esistenti.
**File target**: nuovo adapter read-only + `TeacherDashboardView.tsx`.
**Verifica**: un tool installato compare con `id/version/kind/publisher`; materiale locale compare nella zona.
**Conflitto FABLE**: basso, evitando `installer.ts`.

### PR-5 - Z7 da stato-log a producer reale

**Obiettivo**: sostituire "Genera pack / Esporta" come semplice append-event con una pipeline vera o, in alternativa, rendere la zona read-only finche' il producer non esiste.
**File target**: `TeacherDashboardView.tsx`, `apiClient.ts` o adapter dedicato, test.
**Verifica**: click produce un artefatto o una chiamata backend reale; se non esiste artefatto, UI non promette piu' export.
**Conflitto FABLE**: no diretto.

## 8. Cosa lasciare a gate-Andrea

- pagamenti reali, billing, revenue sharing
- marketplace pubblico/transazionale
- publishing pubblico del profilo docente
- PII studente, profili individuali persistenti, consensi
- deploy, auth multi-tenant, infra esterna
- Drive/LMS/Moodle/Teams
- trust store publisher / policy commerciale del marketplace

## 9. CoV: comandi eseguiti e limiti dell'audit

### Comandi iniziali richiesti

```bash
git -C "/Users/andreamarro/VOLUME 3/ardesia" log -1 origin/main --oneline --decorate
git -C "/Users/andreamarro/VOLUME 3/ardesia" status --short --branch
gh pr list -R AndreaMarro/ardesia --state open --json number,title,isDraft,headRefName,updatedAt --limit 20
```

### Comandi principali di audit

```bash
rg --files "/Users/andreamarro/VOLUME 3/ardesia" -g 'AGENTS.md' -g 'CLAUDE.md' -g 'AUTOPILOT.md' -g 'docs/GOVERNANCE.md'
sed -n '1,220p' "/Users/andreamarro/VOLUME 3/ardesia/AGENTS.md"
sed -n '1,260p' "/Users/andreamarro/VOLUME 3/ardesia/apps/studio/AGENTS.md"
sed -n '1,260p' "/Users/andreamarro/VOLUME 3/ardesia/apps/studio/CLAUDE.md"
sed -n '1,260p' "/Users/andreamarro/VOLUME 3/ardesia/plugins/elab-tutor/AGENTS.md"
sed -n '1,260p' "/Users/andreamarro/VOLUME 3/ardesia/plugins/elab-tutor/CLAUDE.md"
sed -n '1,260p' "/Users/andreamarro/VOLUME 3/ardesia/plugins/elab-tutor/AUTOPILOT.md"
git -C "/Users/andreamarro/VOLUME 3/ardesia" show origin/main:docs/product/TEACHER-DASHBOARD-SPEC.md | nl -ba
git -C "/Users/andreamarro/VOLUME 3/ardesia" show origin/main:apps/studio/src/lessonos/teacherDashboardProjection.ts | nl -ba
git -C "/Users/andreamarro/VOLUME 3/ardesia" show origin/main:apps/studio/src/design/TeacherDashboardView.tsx | nl -ba
git -C "/Users/andreamarro/VOLUME 3/ardesia" grep -n 'bootstrapLessonOs\|appendJournalBridgeTail\|recordQuizAttempt' origin/main -- 'apps/studio/src/**'
git -C "/Users/andreamarro/VOLUME 3/ardesia" diff --name-only HEAD..origin/main -- 'apps/studio/src/**Teacher*' 'apps/studio/src/lessonos/**' 'apps/studio/plugins/ripasso/**'
```

### Limiti dell'audit

- **Nessun test eseguito**: audit statico/read-only. Motivazione: il checkout locale e' su branch sporco/stantio e non contiene le superfici teacher canoniche viste su `origin/main`.
- `docs/product/TEACHER-DASHBOARD-SPEC.md` e `docs/ops/PARALLEL-WORK-PACKETS-FABLE-CODEX-2026-07-08.md` **non erano presenti nel working tree corrente**, ma **esistono su `origin/main`** e sono stati letti via `git show`.
- Le finding codice sono quindi ancorate a `origin/main`, non al checkout locale `codex/ardesia-ops-headroom-20260701`.
- Nessun file di codice e' stato modificato. Nessun `git add`, commit, push o checkout.

## 10. HANDOFF CODEX PKT-CODEX-4

Il teacher dashboard ARDESIA ha finalmente una base concreta: route dedicata, LessonOS event-log, materializer, `graph.query`, plugin ripasso, stat cards, Z7, saved-lessons e producer reali per alcuni eventi. Ma la pagina docente utile non e' ancora arrivata: i dati live piu' importanti non passano ancora bene nel projector, i segmenti lezione dipendono da event types non emessi, e la UI nasconde quasi tutte le zone dichiarate dalla spec.

La via piu' pragmatica e' chiara:

1. rendere la pagina onesta sulle zone mancanti;
2. portare dentro `journalEvents` reali;
3. emettere `lesson.started/ended`;
4. agganciare catalogo locale/materiali;
5. rendere Z7 veramente produttiva o esplicitamente read-only.

Questo basta per arrivare alla **prima teacher page reale, utile, coerente con i dati esistenti, senza secondo store e senza mock/PII**.
