# ADR-0004 — Una sola autorità mutabile per la storia LessonOS

- **Stato**: PROPOSED (ratifica = Andrea; nessuna migrazione di scrittura eseguita da questo ADR)
- **Data**: 2026-07-24
- **Programma**: convergenza a dieci azioni — Action 4
- **Base misurata**: `ad8f0f9f`; regole esecutive introdotte su `4d697f5e`

## Contesto misurato firsthand (24-07)

La storia della lezione è append-only e vive nel log eventi TypeScript dello
Studio. Ma **chi può scriverla non è ristretto da nulla**: `createEventLogStore`
è costruito direttamente dalle viste, e una vista arriva ad appendere.

Violazioni reali contate oggi (`boundary_check.py --json`, 7 su `4d697f5e`):

| File | Riga | Cosa fa |
|---|---|---|
| `apps/studio/src/design/TeacherDashboardView.tsx` | 54, 60, 79 | costruisce lo store |
| `apps/studio/src/design/TeacherDashboardView.tsx` | 80 | **appende** un evento da una vista |
| `apps/studio/src/design/ElabLab.tsx` | 160 | costruisce lo store |
| `apps/studio/src/design/MultiPostitWorkbench.tsx` | 99 | `eventLog?.append(...)` |
| `apps/studio/src/RecapView.tsx` | 54 | costruisce lo store |

Contro-esempio nella stessa base, che mostra che il rimedio è già praticato:
`design/SavedLessonsView.tsx` **riceve** `eventLogFactory = createEventLogStore`
come parametro iniettato invece di costruirlo. Il gate non lo segnala, ed è
corretto: iniettare la factory non è scegliere il driver.

Misurato anche il lato positivo: le tre proiezioni
(`continuityProjection`, `learningDebtProjection`, `teacherDashboardProjection`)
oggi **non scrivono**. L'invariante regge; finora nulla lo teneva.

## Decisione proposta

1. **Uno scrittore.** La storia mutabile di lezione/sessione ha un solo
   proprietario: `apps/studio/src/lessonos/**` più il bridge ToolHost
   (`toolhost/host.ts`), che è la sede della *grounding* dei comandi plugin.
2. **Le viste sono lettrici.** `design/**` e i pannelli di primo livello
   ricevono una porta di lettura ed emettono comandi; non costruiscono store,
   non appendono.
3. **Le proiezioni sono pure.** Una proiezione ricostruisce dal log e ritorna
   una vista; non muta la sorgente. Vale sia per le proiezioni TS sia per il
   consumo Python (Engine): l'Engine è un consumatore riproducibile legato a un
   digest della sorgente, mai un secondo scrittore.
4. **I lettori legacy restano di sola lettura.** Un percorso di recovery non
   diventa uno scrittore implicito.

## Come diventa esecutiva

Due regole nel checker dei confini (`bin/convergence/boundary_check.py`):

- `LESSONOS-SINGLE-WRITER` — viste che costruiscono lo store o appendono;
  porta: la storia mutabile ha un solo scrittore.
- `PROJECTION-NO-MUTATION` — proiezioni che scrivono; porta: le proiezioni sono
  pure.

Modello ratchet: le 7 violazioni odierne sono **congelate in baseline**, il gate
fallisce solo su violazioni *nuove*.

**Questo non ripara nulla.** Congelare non è ripagare: le 7 restano debito
aperto, e sono il backlog di Action 4. Ciò che cambia è che l'ottavo scrittore
non può più entrare in silenzio.

Prova che il gate morde (24-07): iniettando `createEventLogStore()` in
`design/SavedLessonsView.tsx` il gate esce **1** e nomina regola e porta;
rimossa l'iniezione, esce **0**.

Controlli negativi: 15 in `bin/convergence/test_boundary.py`, inclusi
`eventLog?.append(...)` con optional chaining (la forma realmente usata oggi) e
il caso della factory iniettata, che **deve** passare.

## Ordine di smontaggio proposto (non eseguito qui)

1. `RecapView` e `ElabLab` — sola lettura: sostituire la costruzione dello store
   con una porta di lettura iniettata;
2. `MultiPostitWorkbench` — l'`append` diventa un comando verso lo scrittore;
3. `TeacherDashboardView` — è il caso più grosso (4 violazioni, una in
   scrittura): richiede prima la porta di comando, poi l'estrazione.

Ogni passo è una slice a sé con il proprio controllo negativo; nessuno di essi è
parte di questo ADR.

## Cosa resta umano

- la **ratifica** di questa autorità;
- qualunque periodo di doppia scrittura (dual-write) durante una migrazione;
- la decisione se il repository LessonOS esterno resti upstream di ricerca
  importato consapevolmente con drift guard.

## Conseguenze

- Positive: un solo posto dove la storia cambia; le proiezioni restano
  ricostruibili; l'Engine può diventare più sofisticato senza moltiplicare le
  sorgenti.
- Negative: finché le 7 violazioni restano, la regola descrive l'intento e non
  ancora lo stato. Va detto così, non come «autorità unica implementata».
