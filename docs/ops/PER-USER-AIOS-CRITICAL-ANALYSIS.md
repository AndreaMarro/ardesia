# Per-User AIOS per ARDESIA: analisi critica e proposta utile

Data: 2026-07-01
Stato: proposta architetturale, non implementazione
Scope: ARDESIA / LessonOS / cruscotto / iPad / ChatGPT-MCP / multilingua

## Verdetto sintetico

L'idea e' valida se viene resa concreta: per ogni utente ARDESIA puo' avere un piccolo "sistema operativo didattico" personale, non un assistente generico onnipotente. Il nome interno piu' pulito e' `UserAIOS` o `Personal Learning Kernel`.

La forma giusta non e': installare `agiresearch/AIOS`, `openhuman` o altri repo dentro ARDESIA. La forma giusta e': prendere i pattern buoni, costruire un kernel ARDESIA nativo, leggero, multilingue, ispezionabile e collegabile a modelli diversi.

Verdetto operativo:

- Tenere l'idea.
- Non importare codice esterno ora.
- Progettare un `UserAIOS` ARDESIA con memoria, tool, routing modelli, audit tecnico, lingua, import/export e stato LessonOS.
- Primo prototipo: cruscotto read-only + event log + memory map + model router simulato.
- Secondo prototipo: collegamento MCP/ChatGPT con tool read-only e widget.

## Fatti verificati

- ARDESIA ha gia' direzione coerente con lavagna, memoria, manual-object, plugin, LessonOS graph e student-pack. Fonti locali: `docs/PRODUCT-CANON.md`, `docs/ARCHITECTURE-CANON.md`, `docs/ops/ARDESIA-KNOWLEDGE-PACKET-FOR-AGENTS.md`.
- Stato fabbrica letto dai packet locali: viva ma degradata. LessonOS main work non sta atterrando in modo sano; quota corretta: A3 non esiste, A1 senza quota fino a venerdi' 2026-07-03, A2 unico account Opus actionable.
- `agiresearch/AIOS` dichiara un AI Agent Operating System con kernel, SDK, scheduling, context switch, memory management, storage management e tool management. Il README include anche modalita' remote/personal kernel per device limitati. Fonte: [agiresearch/AIOS](https://github.com/agiresearch/AIOS).
- `SynkraAI/aiox-core` e' orientato a sviluppo full-stack agentico, non a runtime didattico per studenti/docenti. Fonte: [SynkraAI/aiox-core](https://github.com/SynkraAI/aiox-core).
- `tinyhumansai/openhuman` e' un assistente personale con dashboard, memoria e molte integrazioni; GitHub CLI indica licenza GPL-3.0. Fonte: [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman).
- `TencentCloud/TencentDB-Agent-Memory` propone memoria locale a pipeline progressiva, short-term compression e long-term memory a livelli; GitHub CLI indica licenza "Other". Fonte: [TencentCloud/TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory).
- `letta-ai/letta` e `mem0ai/mem0` sono riferimenti forti per agenti stateful/memoria, entrambi Apache-2.0 via GitHub CLI. Fonti: [Letta](https://github.com/letta-ai/letta), [mem0](https://github.com/mem0ai/mem0).
- Il video YouTube indicato risulta intitolato "Crea il tuo AI Operating System da Zero (CORSO COMPLETO)" ed e' utile come spunto, non come fonte tecnica verificata finche' non viene estratto un transcript/testabile. Fonte: [YouTube](https://www.youtube.com/watch?v=WwFbYxrg3uE).
- OpenAI Apps SDK collega ChatGPT a un MCP server con tool, auth, dati strutturati e widget iframe. Fonte: [OpenAI Apps SDK MCP server](https://developers.openai.com/apps-sdk/build/mcp-server).
- Apple BackgroundTasks/App Sandbox confermano il modello di app con permessi e task schedulati, non un processo general-purpose sempre acceso su iPad. Fonti: [BackgroundTasks](https://developer.apple.com/documentation/backgroundtasks), [App Sandbox](https://developer.apple.com/documentation/security/app-sandbox).

## Inferenze

- `AIOS` e' una buona metafora architetturale, ma ARDESIA deve implementare una versione piccola, domain-specific e didattica.
- La parte piu' utile non e' "un LLM sempre attivo", ma un kernel che decide quale memoria, tool, lingua e modello usare in quel momento.
- Il cruscotto ARDESIA puo' diventare il posto dove si vede il `UserAIOS`: memoria, plugin, route modelli, stato LessonOS, export, errori, prossime azioni.
- iPad e' fattibile come client principale se il kernel e' leggero e la computazione pesante puo' vivere su Mac mini/server/edge.
- ChatGPT e altri modelli sono fattibili come adapter, non come cervello unico.

## Target

Obiettivo prodotto:

```text
Ogni utente ARDESIA ha un UserAIOS:
  ricorda cio' che serve,
  sa quali tool puo' usare,
  parla nella lingua giusta,
  conosce il suo stato LessonOS,
  prepara/exporta student-pack,
  puo' delegare a ChatGPT o modelli locali,
  resta ispezionabile dal cruscotto.
```

Non-obiettivo:

- assistente onnisciente;
- agente nascosto che decide tutto;
- import diretto di repo esterni;
- lock-in su un provider LLM;
- dashboard spettacolare ma non operativa;
- memoria solo testuale senza fonti e senza struttura;
- app iPad che tenta di comportarsi come un daemon desktop.

## Architettura proposta

Nome interno: `UserAIOS`.

Nome prodotto possibile: `Personal Learning Kernel`, `Kernel Personale`, `Ardesia Kernel`, oppure evitare il nome e mostrarlo come "Memoria e strumenti".

```text
UserAIOS
  IdentityProfile
  LocaleProfile
  LessonOSState
  MemoryManager
    L0 Working Context
    L1 Session Memory
    L2 Durable Learning Memory
    L3 Course/Class/Curriculum Memory
  ToolManager
    board
    manual-reader
    solver
    plugin-marketplace
    student-pack
    import/export
  ModelRouter
    local model
    school/edge model
    ChatGPT/OpenAI
    other providers
  ContextScheduler
  EventLog
  DashboardProjection
```

### MemoryManager

Cosa deve fare:

- separare memoria di sessione e memoria duratura;
- salvare fonte, lingua, oggetto ARDESIA collegato e tool che ha generato l'evento;
- supportare cancellazione/import/export come feature tecnica;
- creare una vista compatta per LLM, senza mandare tutto il grafo a ogni richiesta;
- indicizzare concetti, errori ricorrenti, materiali, esercizi, step risolutivi, pack generati.

Pattern da prendere:

- da `TencentDB-Agent-Memory`: livelli di memoria, compressione del contesto, visual debug;
- da `mem0`: memory layer esplicito e retrieval multi-segnale;
- da Letta: agente stateful con memoria governata da API;
- da `openhuman`: cruscotto personale comprensibile, non solo tabella tecnica.

### ToolManager

Cosa deve fare:

- sapere quali tool sono disponibili per quell'utente;
- esporre board, plugin, manuali, solver, export/import, student-pack;
- registrare input/output tecnico dei tool;
- offrire modalita' dry-run, preview, confirm, apply per azioni che modificano stato.

Pattern da prendere:

- da `agiresearch/AIOS`: tool management come risorsa di kernel;
- da OpenAI Apps SDK/MCP: tool server + widget + structured result;
- da ARDESIA canon: plugin host, manual-object, student-pack, marketplace locale.

### ModelRouter

Cosa deve fare:

- scegliere tra modello locale, modello edge, ChatGPT/OpenAI o altri provider;
- distinguere task brevi, generazione lunga, traduzione, riepilogo, retrieval, coding/factory;
- avere fallback espliciti;
- registrare quale modello ha prodotto quale output;
- non far dipendere LessonOS da un solo provider.

Target minimo:

```text
route(task)
  if task.kind == "board_state_summary": local/edge
  if task.kind == "student_pack_generation": edge or OpenAI
  if task.kind == "translation": local/edge/OpenAI by quality target
  if task.kind == "plugin_code_or_factory": A2/Headroom/Codex lane
```

### ContextScheduler

Cosa deve fare:

- decidere quale pezzo di memoria entra nel contesto;
- evitare prompt enormi;
- comprimere conversazioni/tool logs;
- separare "serve ora" da "archivia";
- preparare contesto diverso per docente, studente, cruscotto, ChatGPT.

Pattern da prendere:

- da `agiresearch/AIOS`: scheduling e context switch;
- da `TencentDB-Agent-Memory`: short-term compression;
- da LessonOS: lesson graph come fonte strutturata.

### DashboardProjection

Cosa deve mostrare:

- memory map per utente;
- cosa e' stato imparato dall'ultima sessione;
- tool usati e output generati;
- stato LessonOS;
- lingua sorgente e lingua UI;
- export/import disponibili;
- route modello usata;
- errori o conflitti di memoria;
- pulsanti per "dimentica", "correggi", "blocca", "esporta", "usa in student-pack".

Qui `openhuman` e `TencentDB-Agent-Memory` sono i riferimenti piu' utili.

## Impatto su LessonOS

LessonOS dovrebbe diventare una delle app principali del `UserAIOS`.

Flusso:

```text
board event
  -> lesson object
  -> plugin state
  -> concept/error/evidence extraction
  -> UserAIOS memory event
  -> LessonOS graph update
  -> student-pack candidate
  -> dashboard projection
```

Per docente:

- prepara lezione e materiali;
- vede lacune ricorrenti della classe;
- richiama esempi gia' usati;
- genera student-pack con stato board/plugin;
- mantiene stile e lingua preferiti.

Per studente:

- riprende il punto esatto della lezione;
- riceve esercizi collegati agli errori reali;
- vede spiegazioni nella lingua giusta;
- esporta o importa pack;
- mantiene stato tra iPad/web/desktop.

Nota onesta: questa e' una grande feature platform, non una patch. Non va fatta dentro la verticale demo finche' export/import/student-pack base non sono solidi.

## Impatto sul cruscotto ARDESIA

Il cruscotto puo' avere una nuova area: `UserAIOS`.

Widget utili:

- `Memory Map`: grafo compatto di concetti, materiali, errori, pack.
- `Timeline`: eventi board/plugin/manuale/export.
- `Model Routes`: quale modello/tool e' stato usato.
- `Context Preview`: cosa verrebbe mandato al prossimo agente.
- `Conflicts`: memorie contraddittorie o obsolete.
- `Language Matrix`: contenuto originale, traduzioni disponibili, lacune lingua.
- `Student-Pack Queue`: elementi candidati per pack.
- `Tool Permissions`: tool attivi, tool bloccati, tool solo-preview.

Da non fare:

- cruscotto solo estetico;
- feed infinito di eventi non aggregati;
- LLM che modifica memoria senza preview;
- metriche opache senza evidenza.

## Fattibilita' iPad

### Fattibile bene

- Lavagna, manual reader, annotazioni, plugin interattivi.
- UserAIOS locale leggero: stato, cache, ultimi eventi, lingua, export/import.
- Background limitato per sync, salvataggi, preparazione cache.
- Collegamento a server/Mac mini per indicizzazione pesante.
- Piccoli modelli locali per classificazione o riassunti brevi, se performance e batteria reggono.
- ChatGPT/MCP come estensione esterna, non come processo residente.

### Fattibile male o non realistico

- agente sempre attivo che osserva altre app;
- indicizzazione continua di schermo/microfono/file;
- modelli grandi sempre in background;
- elaborazione pesante solo sul device;
- comportamento da desktop assistant general-purpose.

Architettura iPad consigliata:

```text
iPad ARDESIA app
  local board state
  local UserAIOS cache
  local event log
  explicit sync
  remote/edge heavy jobs
  MCP/ChatGPT optional connector
```

Verdetto iPad: fattibile come client intelligente. Non fattibile come AIOS completo always-on.

## Multilingua nativo

Questo e' un requisito strutturale, non una traduzione finale.

Ogni memoria deve distinguere:

- `concept_id`: stabile e non legato a una lingua;
- `source_language`: lingua della fonte originale;
- `ui_locale`: lingua preferita dell'utente;
- `labels`: label per lingua;
- `evidence_ref`: riferimento a board/manuale/plugin/export;
- `generated_text`: output generato con lingua e modello;
- `translation_status`: originale, macchina, revisionata, da rifare.

Schema minimo:

```json
{
  "concept_id": "ohm_law",
  "source_language": "it",
  "labels": {
    "it": "Legge di Ohm",
    "en": "Ohm's law",
    "es": "Ley de Ohm"
  },
  "evidence_refs": ["board:abc", "manual:vol1:p42"],
  "memory_type": "concept",
  "confidence": 0.82
}
```

Regola dura: niente testo UI o memoria hardcoded in italiano come fonte unica.

## Collegamento a ChatGPT e altri LLM

Fattibile.

Forma consigliata:

```text
ARDESIA UserAIOS
  -> MCP Gateway
  -> tool schemas
  -> widget UI
  -> ChatGPT / OpenAI
  -> altri client MCP
```

Tool MCP iniziali:

- `ardesia.search_lesson_graph`
- `ardesia.get_board_state`
- `ardesia.preview_student_pack`
- `ardesia.list_plugins`
- `ardesia.get_memory_map`
- `ardesia.summarize_context`

Widget ChatGPT utili:

- board snapshot;
- student-pack preview;
- memory map;
- lesson timeline;
- plugin state inspector.

Limite onesto: ChatGPT puo' essere una grande interfaccia e un ottimo motore generativo, ma non deve essere il database del `UserAIOS`. La fonte di verita' resta ARDESIA.

## Valutazione fonti e cosa prendere

| Fonte | Cosa prendere | Cosa evitare | Nota |
| --- | --- | --- | --- |
| `agiresearch/AIOS` | kernel, resource manager, context switch, tool manager, personal/remote kernel | import runtime completo | Ottimo modello concettuale |
| `SynkraAI/aiox-core` | workflow agentico, ruoli dev/qa/sm, file-driven orchestration | uso come prodotto finale | Utile per factory ARDESIA, meno per classe |
| GitHub topic `ai-operating-system` | radar periodico di progetti | decidere architettura da topic | Fonte esplorativa |
| `openhuman` | cruscotto personale, memory UX, integrazioni, local-first posture | copiare codice GPL nel core | Fortissimo come ispirazione UI |
| `TencentDB-Agent-Memory` | memory layers, context compression, visual debug | dipendenza prima di audit licenza | Molto vicino al cruscotto |
| Letta | agenti stateful via API, memoria governata | autonomia incontrollata | Apache-2.0, buono per spike server |
| mem0 | universal memory layer, retrieval multi-segnale | affidarsi ai benchmark senza riprodurli | Apache-2.0, buono per confronto |
| OpenAI Apps SDK/MCP | tool + widget + structured data | fare di ChatGPT la sorgente di verita' | Perfetto per adapter |

## Claim non provati

- Il video YouTube non e' stato validato tecnicamente: serve transcript o replica dei passaggi.
- Le performance di `openhuman` non sono state testate su ARDESIA.
- `TencentDB-Agent-Memory` non e' stato provato con dati LessonOS o board events.
- La licenza "Other" di AIOS/aiox-core/TencentDB richiede lettura prima di riuso di codice.
- Non e' provato che mem0 o Letta siano migliori del grafo ARDESIA nativo per LessonOS.
- Non e' provato che iPad regga modelli locali utili per tutti i casi; serve benchmark su device reale.
- Non e' provato che ChatGPT widget renda bene la lavagna; serve prototipo mobile.

## Roadmap consigliata

### Fase 0: design contract

- Definire schema `UserAIOS`.
- Definire `MemoryEvent`.
- Definire `ToolCallEvent`.
- Definire `ModelRouteEvent`.
- Definire `LocaleProfile`.
- Definire `DashboardProjection`.

### Fase 1: cruscotto read-only

- Mostrare memory map finta ma da eventi reali.
- Mostrare timeline board/plugin/export.
- Mostrare route modello anche se simulata.
- Nessun agente che scrive memoria da solo.

### Fase 2: LessonOS event bridge

- Board event -> LessonOS event.
- Plugin state -> memory candidate.
- Export/import -> event log.
- Student-pack preview -> dashboard queue.

### Fase 3: MCP/ChatGPT adapter

- MCP gateway read-only.
- Tool schemas stabili.
- Widget student-pack preview.
- Widget memory map.
- Test su ChatGPT web e mobile.

### Fase 4: memory engine bakeoff

Confrontare:

- ARDESIA native graph;
- TencentDB-Agent-Memory pattern;
- mem0;
- Letta;
- semplice SQLite + embeddings.

Metriche:

- latenza;
- qualita' retrieval;
- spiegabilita' della fonte;
- dimensione context payload;
- costo runtime;
- qualita' multilingua;
- facilita' export/import.

## Valutazione implementazione sul repo locale

Confidenza: media. Il monorepo locale contiene abbastanza struttura per progettare il primo slice, ma i canon locali dichiarano `packages/engine` e `apps/studio` snapshot non necessariamente allineati ai repo vivi Mini. Sul Mac corrente `~/lessonos` e `~/maestro-studio` non erano presenti, quindi questa valutazione non pretende di descrivere il runtime Mini live.

### Cosa e' gia' riusabile

1. `apps/studio/src/store/WorkspaceStore.ts`
   - Ha gia' un driver unico con `raw/` e `derived/`.
   - Supporta File System Access, localStorage fallback, export/import bundle e `.lesson`.
   - E' il posto naturale per salvare snapshot `UserAIOS` derivati, senza inventare storage nuovo.

2. `apps/studio/src/store/JournalRecorder.ts`
   - Registra `events.jsonl` append-style per board, formule, PDF page view e chunk audio marker.
   - E' gia' il seme dell'`EventLog` UserAIOS.
   - Primo slice possibile: proiettare `events.jsonl` in una memory map tecnica, senza LLM.

3. `apps/studio/src/store/lessonBundle.ts`
   - `.lesson` e' gia' ZIP portabile con `raw/events.jsonl`, `raw/session.yaml`, `raw/board.excalidraw`.
   - UserAIOS puo' aggiungere `derived/useraios/snapshot.json` e `derived/useraios/memory-map.json` senza rompere il formato raw.

4. `apps/studio/src/toolhost-protocol/manifest.ts`
   - Manifest strict Zod con `id`, `version`, `surfaces`, `capabilities`, `publisher`, `i18n`.
   - Manca `kind`, quindi non distingue tool/pack/manual/workflow/copilot.
   - Primo intervento ad alta leva: aggiungere `kind` e usare `i18n` come base per plugin/packs multilingua.

5. `apps/studio/src/toolhost-protocol/capabilities.ts` e `messages.ts`
   - Capability gia' dichiarano `graph.query`, `graph.proposeClaims`, `llm.generate`, `net.fetch`, `ui`.
   - Wire reale oggi copre solo `board.*` e `storage.*`.
   - Quindi UserAIOS non deve partire dai tool remoti: deve partire come proiezione locale read-only, poi aprire `graph.query`/`llm.generate` in un PR dedicato.

6. `packages/engine/lessonos/mcp/grounded_memory.py`
   - Ha gia' un server MCP-style in-process con recall, progression e prerequisites.
   - Buon candidato per il futuro `UserAIOS -> MCP Gateway -> LessonOS memory`.
   - Non va usato come sorgente unica del kernel: e' piu' narrow, teacher/lesson oriented.

7. `packages/engine/lessonos/graph/path_memory.py`
   - `PathMemory` aggrega concetti, misconceptions, esercizi, stato percorso.
   - Utile come modello concettuale.
   - Limite: e' costruito da capsule; non basta per memoria personale persistente e dashboard live.

### Implementazione minima consigliata

Primo slice: `UserAIOS` come projection layer, non come agente.

File probabili, massimo 5 per PR:

1. `apps/studio/src/useraios/types.ts`
2. `apps/studio/src/useraios/projector.ts`
3. `apps/studio/src/useraios/projector.test.ts`
4. `apps/studio/src/store/types.ts`
5. `docs/ops/PER-USER-AIOS-CRITICAL-ANALYSIS.md`

Contratto minimo:

```ts
type UserAIOSSnapshot = {
  v: 1
  userId: string
  room: string
  locale: string
  lessonState: {
    roomName: string
    updatedAt: number
  }
  memoryMap: Array<{
    id: string
    kind: "board" | "formula" | "manual-page" | "plugin" | "student-pack"
    label: Record<string, string>
    evidenceRefs: string[]
    updatedAt: number
  }>
  modelRoutes: Array<{
    id: string
    taskKind: string
    provider: "local" | "edge" | "openai" | "other"
    status: "planned" | "used" | "failed"
    at: number
  }>
}
```

Projection v0:

```text
raw/events.jsonl
  -> parse JournalEvent
  -> group by event type
  -> derive memory candidates
  -> write derived/useraios/<room>.snapshot.json
```

Nessun LLM richiesto. Nessun MCP richiesto. Nessuna modifica gate. Questo produce valore visibile e testabile: "cosa ha visto UserAIOS da questa lezione?".

### Secondo slice

Integrare dashboard read-only nello studio:

- nuovo componente `UserAIOSPanel`;
- mostra memory map;
- mostra timeline;
- mostra route modelli pianificate;
- mostra lingua corrente e label mancanti;
- nessuna scrittura automatica nel grafo LessonOS.

File probabili:

1. `apps/studio/src/useraios/UserAIOSPanel.tsx`
2. `apps/studio/src/useraios/UserAIOSPanel.test.tsx`
3. `apps/studio/src/Room.tsx`
4. `apps/studio/src/index.css`
5. `apps/studio/src/useraios/projector.ts`

### Terzo slice

Toolhost alignment:

- aggiungere `kind` al manifest;
- aggiungere test compat;
- non aprire ancora `llm.generate`;
- usare `kind: "pack"` per ELABTutor e `kind: "tool"` per simulation/reference.

File probabili:

1. `apps/studio/src/toolhost-protocol/manifest.ts`
2. `apps/studio/src/__tests__/Toolhost.conformance.test.ts`
3. `apps/studio/plugins/reference/manifest.ts`
4. `apps/studio/plugins/outline/manifest.ts`
5. `docs/PLUGIN-MARKETPLACE-CANON.md`

### Quarto slice

MCP/ChatGPT adapter:

- non prima del dashboard read-only;
- tool read-only iniziali: `get_memory_map`, `get_board_state`, `preview_student_pack`;
- usare lo schema gia' disegnato in `docs/ops/FASTAPI-CHATGPT-MCP-GATEWAY.md`;
- tenere ARDESIA come source of truth.

### Cosa non implementare ora

- agente autonomo che scrive LessonOS memory;
- routing LLM dentro plugin prima del panel read-only;
- app iPad nativa;
- import di `openhuman` o `AIOS`;
- per-student durable memory complessa prima di export/import/student-pack funzionanti;
- dashboard con metriche inventate.

### Rischio tecnico principale

Il rischio non e' "manca AI". Il rischio e' creare un secondo grafo parallelo a LessonOS. Per evitarlo:

- `UserAIOS` v0 deve essere projection, non database canonico;
- eventi raw restano fonte locale;
- LessonOS resta proprietario del graph didattico;
- Studio resta proprietario di board e plugin state;
- MCP/ChatGPT legge, non decide la struttura.

## Decisione raccomandata

Creare `UserAIOS` come architettura ARDESIA, non adottare un repo esterno.

Prima PR utile:

1. aggiungere data contract `UserAIOS`;
2. aggiungere event types per board/plugin/student-pack;
3. aggiungere mock dashboard projection;
4. aggiungere test su multilingua memory labels;
5. aggiungere doc MCP tool list.

Non farlo entrare nella demo finche' la verticale board -> plugin -> interaction -> export/import -> student-pack non e' verificata.

## Comandi / evidenze

```bash
gh repo view agiresearch/AIOS --json nameWithOwner,description,stargazerCount,forkCount,licenseInfo,primaryLanguage,pushedAt,url
gh repo view SynkraAI/aiox-core --json nameWithOwner,description,stargazerCount,forkCount,licenseInfo,primaryLanguage,pushedAt,url
gh repo view tinyhumansai/openhuman --json nameWithOwner,description,stargazerCount,forkCount,licenseInfo,primaryLanguage,pushedAt,url
gh repo view TencentCloud/TencentDB-Agent-Memory --json nameWithOwner,description,stargazerCount,forkCount,licenseInfo,primaryLanguage,pushedAt,url
gh repo view letta-ai/letta --json nameWithOwner,description,stargazerCount,forkCount,licenseInfo,primaryLanguage,pushedAt,url
gh repo view mem0ai/mem0 --json nameWithOwner,description,stargazerCount,forkCount,licenseInfo,primaryLanguage,pushedAt,url
```

Ultimo controllo GitHub CLI del 2026-07-01:

- `agiresearch/AIOS`: 6000 star, 843 fork, Python, licenza "Other", pushed 2026-06-22.
- `SynkraAI/aiox-core`: 3005 star, 935 fork, JavaScript, licenza "Other", pushed 2026-06-13.
- `tinyhumansai/openhuman`: 34027 star, 3306 fork, Rust, GPL-3.0, pushed 2026-07-01.
- `TencentCloud/TencentDB-Agent-Memory`: 6359 star, 588 fork, TypeScript, licenza "Other", pushed 2026-06-26.
- `letta-ai/letta`: 23607 star, 2503 fork, Python, Apache-2.0, pushed 2026-06-26.
- `mem0ai/mem0`: 59833 star, 6935 fork, Python, Apache-2.0, pushed 2026-06-30.

## Fonti

- [YouTube: Crea il tuo AI Operating System da Zero](https://www.youtube.com/watch?v=WwFbYxrg3uE)
- [agiresearch/AIOS](https://github.com/agiresearch/AIOS)
- [AIOS paper](https://arxiv.org/html/2403.16971v2)
- [SynkraAI/aiox-core](https://github.com/SynkraAI/aiox-core)
- [GitHub topic ai-operating-system](https://github.com/topics/ai-operating-system)
- [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman)
- [TencentCloud/TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory)
- [letta-ai/letta](https://github.com/letta-ai/letta)
- [mem0ai/mem0](https://github.com/mem0ai/mem0)
- [OpenAI Apps SDK MCP server](https://developers.openai.com/apps-sdk/build/mcp-server)
- [OpenAI Apps SDK ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
- [Model Context Protocol introduction](https://modelcontextprotocol.io/docs/getting-started/intro)
- [Apple BackgroundTasks](https://developer.apple.com/documentation/backgroundtasks)
- [Apple App Sandbox](https://developer.apple.com/documentation/security/app-sandbox)
