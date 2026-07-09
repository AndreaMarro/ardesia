# TEACHER-DASHBOARD-SPEC — Pagina Personale come projection del grafo LessonOS

- **Status**: spec di prodotto, zero codice UI. Nessun claim di implementazione.
- **Data**: 2026-07-02
- **Naming prodotto**: la superficie user-facing si chiama **Pagina Personale**.
  Non usare "pagina docente", "cruscotto docente" o "teacher dashboard" come
  label di prodotto. Il filename e i tipi tecnici storici possono restare finché
  rinominarli non diventa una slice dedicata.
- **Fonti** (lette firsthand in questa sessione):
  - `docs/ops/PER-USER-AIOS-CRITICAL-ANALYSIS.md` (§DashboardProjection, §Implementazione minima → `UserAIOSSnapshot`, secondo slice → `UserAIOSPanel`) — *local-only, import pending*
  - `docs/product/UI-UX-DESIGN-DIRECTION.md` (paper-first, plugin-on-paper, layouts, accessibilità) — *in PR #20*
  - `docs/ops/LESSONOS-MEMORY-ARCHITECTURE-RESEARCH.md` + `docs/ops/LESSONOS-DYNAMIC-GRAPH-RESEARCH.md` (event log append-only → materialized graph → evidence refs) — *local-only, import pending*
  - Verifica firsthand codice: `apps/studio/src/store/JournalRecorder.ts` (eventi `element.add/update/delete`, `t0/t1`, `math.insert`, `pdf.page.view`, `audio.chunk` in `raw/events.jsonl`), `WorkspaceStore.ts` (`raw/`+`derived/`), `lessonBundle.ts` (`.lesson` ZIP).

## 0. Principio non negoziabile

> **La Pagina Personale è una PROJECTION read-only del grafo LessonOS e dell'event log. MAI un secondo store.**

Conseguenze vincolanti:

1. Nessuna tabella/DB/file della Pagina Personale possiede dati propri. Ogni pixel deve essere derivabile (e ri-derivabile da zero) da: **event log** (`raw/events.jsonl` oggi, SQLite domani) + **grafo LessonOS materializzato** + **manifest registry plugin** + **WorkspaceStore `derived/`**.
2. Le azioni della Pagina Personale (fase ②) **non scrivono mai il grafo direttamente**: appendono eventi all'event log; il materializer aggiorna il grafo; la projection si rinfresca. Un solo flusso di scrittura.
3. Ogni dato mostrato ha **evidence ref** (lesson-id, board object, manuale vol:pagina, plugin state). Niente numeri senza provenienza — coerente con `docs/PRODUCT-CANON.md` (vietate metriche inventate).
4. Se una zona non ha ancora una fonte dati reale, la zona mostra "non disponibile" con la ragione — **mai** dati mock spacciati per veri.

Pipeline di riferimento (da PER-USER-AIOS, già decisa):

```text
board event → lesson object → plugin state → concept/error/evidence extraction
  → UserAIOS memory event → LessonOS graph update → student-pack candidate
  → personal page projection   ← la Pagina Personale vive QUI, in fondo, read-only
```

## 1. Personas

| Persona | Contesto | Cosa gli serve dalla Pagina Personale |
|---|---|---|
| **P1 — Docente curricolare** | Scuola secondaria; LIM in classe + iPad a casa; 3–6 classi, ~25 studenti/classe | Riprendere il filo tra lezioni, vedere lacune ricorrenti della classe, preparare la prossima lezione, generare student-pack |
| **P2 — Tutor 1:1** (caso ELAB) | Lezioni individuali; percorso personalizzato per studente; manuali come fonte | Stato del percorso del singolo studente, errori ricorrenti individuali, materiali/esperimenti già usati, cosa assegnare dopo |
| **P3 — Docente-creator** (secondaria) | Pubblica pack/materiali sul marketplace | Vetrina del proprio profilo pubblico, stato dei materiali pubblicati |

Non-persona della Pagina Personale: lo **studente** (la sua superficie è lo student-pack e la vista studente della lavagna, non questa pagina).

## 2. Jobs-to-be-done

1. **Ripresa contesto**: "Cosa ho fatto ieri con la 3B? Dove eravamo rimasti?" → timeline lezioni + ultimo stato board.
2. **Diagnosi**: "Quali errori stanno ricorrendo? Su quali concetti la classe è debole?" → nodi errore/concetto del grafo con conteggi e evidenze.
3. **Preparazione**: "Preparo domani: quali materiali, plugin, esperimenti ho già pronti su questo argomento?" → ricerca nel grafo per concetto → materiali/lezioni collegate.
4. **Consegna**: "Genero lo student-pack di oggi" → coda candidati student-pack dalla lezione.
5. **Organizzazione**: "Che lezioni ho questa settimana? Che pack ho installato?" → calendario (storico + pianificate) + plugin installati.
6. **Rendicontazione onesta**: "Come sta andando la classe?" → statistiche deterministiche (conteggi con evidenza), non punteggi opachi.
7. **Presenza pubblica** (P3): "Come appare il mio profilo? Cosa ho pubblicato?" → profilo pubblico + materiali pubblicati.

## 3. Zone della Pagina Personale → informazione → fonte dati

Regola UI ereditata da UI-UX-DESIGN-DIRECTION: la Pagina Personale **non è la prima schermata** (paper-first); è una superficie di consultazione raggiungibile dalla lavagna. Desktop: pannelli collassabili; iPad: drawer/schermata dedicata; LIM: non prioritario (è una pagina privata, non da proiettare).

| # | Zona | Informazione mostrata | Fonte (projection di…) | Fase |
|---|---|---|---|---|
| Z1 | **Grafo navigabile** | Vicinato di un nodo (concetto/lezione/errore/materiale), profondità 1–2; backlink cita/citato-da; attributi temporali `introdotto_a`/`corretto_a` | Grafo LessonOS materializzato; query `neighbors(node, depth≤2)` O(vicinato), mai O(grafo) | ① |
| Z2 | **Lezioni (timeline)** | Sessioni passate per room/classe: data, durata, oggetti creati, pagine manuale viste, formule inserite, audio marker | Event log (`t0/t1`, `element.*`, `pdf.page.view`, `math.insert`, `audio.chunk`) | ① |
| Z3 | **Studenti** | v0: aggregati per classe/room (pseudonimi/iniziali di default); v1+: percorso individuale (P2 tutor) | Grafo (nodi percorso/errore per scope) + event log | ① aggregati / ② individuale |
| Z4 | **Calendario** | Storico lezioni (derivato) + prossime lezioni pianificate (richiede nuovo event type `lesson.planned`) | Event log; storico = derivazione pura; pianificazione = evento nuovo | ① storico / ② pianificazione |
| Z5 | **Materiali & marketplace** | Materiali locali usati/importati (PDF, immagini, `.lesson`); pack installati; link al marketplace | WorkspaceStore (`raw/`, bundle) + manifest registry; transazioni marketplace FUORI scope | ① |
| Z6 | **Plugin** | Plugin/pack installati (id, versione, publisher, capabilities dichiarate, superfici); ultimo uso per lezione | Manifest registry (`toolhost-protocol/manifest.ts`) + event log | ① |
| Z7 | **Student-pack** | Coda candidati (da lezione corrente/passate), pack generati, stato export | Grafo (candidati) + `derived/` + eventi export/import | ① lista / ② genera |
| Z8 | **Errori ricorrenti** | Errori per concetto con conteggio, prima/ultima occorrenza, arco `corregge` verso esercizi; evidenza per ogni riga | Grafo (nodi errore + archi) — il test canonico della micro-slice memoria è esattamente "evento errore → arco corregge" | ① |
| Z9 | **Statistiche** | SOLO conteggi deterministici: n. lezioni, n. oggetti board, n. esercizi svolti, n. errori per concetto, copertura manuale (pagine viste/totali) | Event log + grafo; ogni numero clicca → evidenze | ① |
| Z10 | **Export/Import** | Bundle `.lesson` disponibili, ultimo export, import recenti | `lessonBundle.ts` + eventi | ① |
| Z11 | **Drive (futuro)** | Placeholder dichiarato "integrazione futura" — nessuna promessa, nessun mock che simuli sync | — (spec dedicata `GOOGLE-DRIVE-INTEGRATION.md` ancora mancante) | fuori v0/v1 |
| Z12 | **Profilo pubblico** | Card profilo (nome, materie, bio, lingue) + elenco pubblicazioni | v0: dati locali (WorkspaceStore); publishing reale dipende dal marketplace nel monorepo (oggi in `ardesia-lavagna`, repo separato) | ① card locale |

Privacy (vincolo GDPR Mode A su `apps/`+`packages/`+`plugins/`, README §Guardrail): Z3 in v0 mostra **aggregati pseudonimi**; nessun profilo individuale persistente finché il modello consensi non è definito; nessun dato studente committato o esportato senza azione esplicita del docente.

## 4. Data contract

### 4.1 Rapporto con `UserAIOSSnapshot` (già disegnato)

`UserAIOSSnapshot` (PER-USER-AIOS §Implementazione minima: `v, userId, room, locale, lessonState, memoryMap[], modelRoutes[]`) resta il contratto della projection **per-utente/per-room**. La Pagina Personale è una vista **sopra** quelle snapshot più il grafo: NON si duplica ciò che la snapshot già porta — si aggrega.

```text
raw/events.jsonl (per room)
  → projector UserAIOS → derived/useraios/<room>.snapshot.json   (già disegnato)
  → projector Dashboard → derived/dashboard/teacher.projection.json (NUOVO, questo doc)
                            legge: snapshot UserAIOS + grafo LessonOS + manifests
```

### 4.2 `TeacherDashboardProjection` (contratto proposto, v0)

```ts
type EvidenceRef = string // es. "board:<elementId>" | "lesson:<room>@<t>" | "manual:vol1:p30" | "plugin:<id>@<version>"

type TeacherDashboardProjection = {
  v: 1
  generatedAt: number          // timestamp projection (rigenerabile, mai editata a mano)
  teacherId: string
  locale: string               // ui_locale; ogni label è Record<lang,string> (multilingua strutturale)
  scopes: Array<{              // una classe/room/studente = uno scope
    scopeId: string
    kind: "class" | "room" | "student-aggregate"
    label: Record<string, string>
  }>
  lessons: Array<{             // Z2/Z4 storico — derivato da t0/t1 + eventi
    room: string
    startedAt: number
    endedAt: number | null
    counts: { elements: number; mathInserts: number; pdfPagesViewed: number; audioChunks: number }
    evidenceRefs: EvidenceRef[]
  }>
  graphView: {                 // Z1 — vicinato pre-materializzato dell'ultimo focus, NON il grafo intero
    focusNodeId: string | null
    nodes: Array<{ id: string; kind: "concept" | "lesson" | "material" | "error" | "exercise"
                   label: Record<string, string>; evidenceRefs: EvidenceRef[] }>
    edges: Array<{ from: string; to: string
                   kind: "cita" | "deriva-da" | "corregge"
                   introducedAt?: number; correctedAt?: number }>
  }
  recurringErrors: Array<{     // Z8
    conceptId: string          // id neutro rispetto alla lingua
    label: Record<string, string>
    count: number
    firstSeen: number
    lastSeen: number
    correctedBy: string[]      // exercise node ids (archi "corregge")
    evidenceRefs: EvidenceRef[]
  }>
  plugins: Array<{             // Z6 — dal manifest registry, MAI hardcoded
    id: string; version: string; publisher: string
    kind?: "tool" | "pack"     // dipende dall'intervento `kind` sul manifest (alta leva, non ancora fatto)
    lastUsedAt: number | null
  }>
  studentPackQueue: Array<{    // Z7
    candidateId: string
    fromRoom: string
    label: Record<string, string>
    status: "candidate" | "generated" | "exported"
    evidenceRefs: EvidenceRef[]
  }>
  stats: Array<{               // Z9 — SOLO deterministiche
    key: string                // es. "lessons.count", "manual.pages.viewed"
    value: number
    window: { from: number; to: number }
    evidenceRefs: EvidenceRef[]
  }>
  publicProfile: {             // Z12 — v0 locale
    displayName: string
    subjects: string[]
    published: Array<{ id: string; kind: "pack" | "material"; label: Record<string, string> }>
  } | null
  unavailable: Array<{ zone: string; reason: string }>  // onestà: zone senza fonte reale
}
```

Note di contratto:

- **Nessun campo "score"/"mastery"/"progresso %"**: solo conteggi + finestre temporali + evidenze. Qualsiasi metrica interpretativa richiede una spec dedicata e una validazione (lezione appresa: moat "+0.33" vietato).
- `concept_id` neutro + `labels` per lingua ovunque (requisito multilingua strutturale di PER-USER-AIOS §Multilingua).
- La projection è **rigenerabile da zero**: cancellarla non perde nulla (tutto rientra da event log + grafo). Questo è il test di conformità al principio §0.
- Eventi **nuovi** richiesti dalla fase ② (non dalla ①): `lesson.planned`, `studentpack.generated`, `studentpack.exported`, `dashboard.action.confirmed` (audit). Tutti appesi all'event log, mai stato del cruscotto.

## 5. Micro-slice implementative

### Slice ① — read-only (fattibile ora, ≤5 file, zero LLM, zero MCP)

Veicolo: lo `UserAIOSPanel` (secondo slice di PER-USER-AIOS) **è** la prima incarnazione del cruscotto: pannello nello studio, dati veri, sola lettura.

1. `apps/studio/src/useraios/dashboardProjection.ts` — tipo `TeacherDashboardProjection` + projector puro `projectDashboard(events, graph?, manifests?)` (grafo opzionale finché la micro-slice event-log→grafo non è atterrata: allora Z1/Z8 stanno in `unavailable` con ragione dichiarata).
2. `apps/studio/src/useraios/dashboardProjection.test.ts` — fixture di eventi reali (formato `JournalEvent`) → asserzioni su lessons/counts/stats + su `unavailable` esplicito.
3. `apps/studio/src/useraios/UserAIOSPanel.tsx` — pannello read-only con zone Z2/Z5/Z6/Z9/Z10 (quelle con fonte già esistente).
4. `apps/studio/src/Room.tsx` — solo entry point del pannello (bottone/drawer).
5. `apps/studio/src/useraios/UserAIOSPanel.test.tsx`.

Definition of done ①: pannello montato nello studio che mostra dati derivati da un `events.jsonl` reale; test verdi 3×; nessuna scrittura; nessuna nuova dipendenza.

### Slice ② — interattiva (solo dopo ① e dopo la micro-slice event-log/grafo)

- Navigazione grafo Z1 (`neighbors` depth 1–2) + Z8 errori ricorrenti.
- Azioni con **preview → confirm → append evento**: "usa in student-pack", "correggi", "dimentica", "pianifica lezione" (Z4). Pattern dry-run/preview/confirm/apply da PER-USER-AIOS §ToolManager.
- Ogni azione = evento nell'event log con audit; il grafo si aggiorna via materializer, mai dal pannello.

### Fuori sequenza (non promesse)

Drive (Z11), profili studente individuali (Z3 v1+), marketplace transazionale, MCP/ChatGPT adapter (dopo, via gateway già speccato in `FASTAPI-CHATGPT-MCP-GATEWAY.md`), notifiche.

## 6. Cosa NON fa la v0 (esplicito)

1. **Non scrive**: nessuna azione mutante (tutta la ① è read-only).
2. **Niente LLM/agenti**: nessun riassunto generato, nessun suggerimento AI, nessuna memoria scritta da modelli.
3. **Niente secondo store/grafo**: nessuna persistenza propria oltre la projection rigenerabile in `derived/`.
4. **Niente metriche interpretative**: no mastery, no percentuali di progresso, no ranking studenti.
5. **Niente dati studente individuali**: solo aggregati pseudonimi per scope.
6. **Niente Drive/LMS/calendari esterni**: Z11 è un placeholder dichiarato; nessun sync simulato.
7. **Niente marketplace transazionale**: Z12 è una card locale; publishing reale = dipendenza esterna dichiarata.
8. **Niente realtime/multi-device**: la projection si rigenera on-demand; niente websocket/sync.
9. **Niente nuova app**: il cruscotto vive nello studio (pannello), non è una seconda shell (ELAB-AS-PLUGIN-CANON vale anche qui).
10. **Niente UI grande senza micro-slice**: ogni zona nuova = PR piccola con test (regola UI-UX-DESIGN-DIRECTION).

## 7. Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| Il cruscotto diventa un secondo store "per comodità" | Test di conformità: cancellare `derived/dashboard/` non deve perdere alcun dato (rigenerabile). Review obbligatoria su ogni PR che tocca `useraios/` |
| Feed infinito di eventi non aggregati (anti-pattern dichiarato) | La projection aggrega SEMPRE (counts/finestre); il raw log non si mostra mai direttamente |
| Metriche che "sembrano utili" ma non provate | Contratto senza campi score; ogni nuova metrica = spec + fonte + evidenza |
| Z1/Z8 dipendono dalla micro-slice grafo non ancora atterrata | `unavailable[]` con ragione; le slice restano indipendenti e sequenziabili |
| Privacy dati studenti | Aggregati pseudonimi di default; niente export implicito; GDPR Mode A |

## 8. COV

- Basata su lettura firsthand delle 4 fonti dichiarate + verifica firsthand di `JournalRecorder.ts`/`WorkspaceStore.ts`/`lessonBundle.ts` su `origin/main` (2026-07-02).
- Zero codice UI scritto o modificato.
- Nessun claim che il cruscotto esista: oggi NON esiste (la mappa full-context §14.3 lo lista tra le spec mancanti — questo doc colma quel gap).
- I riferimenti a doc local-only (PER-USER-AIOS, LESSONOS-*-RESEARCH) sono marcati; diventeranno path validi su main con i rispettivi import.
