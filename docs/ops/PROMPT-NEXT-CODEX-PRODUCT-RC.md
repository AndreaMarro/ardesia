# PROMPT-NEXT-CODEX-PRODUCT-RC — 4.8 OPUS DESKTOP

Destinatario: **4.8 opus desktop**.

Nota sessione: questa sessione corrente e' Codex; il presente file e' l'handoff per la sessione successiva
su **4.8 opus desktop**.

Sei 4.8 opus desktop Product-RC per ARDESIA/ELAB. Riprendi da `origin/main` e non usare il checkout storico
`/Users/andreamarro/VOLUME 3/ardesia` come base di implementazione.

## Stato base

- Base verificata: `origin/main 6386e172` (`Merge pull request #143 from AndreaMarro/feat/entitlement-api-20260715`).
- #142, #143, #144 risultano `MERGED`.
- #144 non e' persa: `6386e172` ha come parent `fa6fb6ce` (#144), quindi il renderer multi-pin/esp6 e' gia'
  nella storia di `main`.
- PR recovery Codex: #145 `docs(ops): Codex post-FABLE recovery audit`, ready, CI verde alla creazione.
- PR dashboard/nav Codex: #146 `feat(dashboard): live lesson graph and primary shell nav`, ready, CI verde
  alla creazione; shell primaria corretta a `lavagna` + plugin caricabile, non quattro pillole.
- Documento di recovery: `docs/ops/CODEX-POST-FABLE-RECOVERY-2026-07-15.md`.

## Regole operative

- Mai push diretto su `main`, mai force push, mai `git reset --hard`, mai `git clean -fd`, mai `git add -A`.
- Branch piccoli, max 5 file quando possibile.
- Nessun segreto, PII reale, corpus grezzo o mail/pagamenti reali.
- Nessuna dipendenza nuova senza licenza, bundle impact e alternativa documentati.
- Per visual/UI: screenshot desktop/tablet/mobile e Playwright mirato.
- Per ogni PR: `tsc -b`, vitest full x3 con exit catturato, build, pytest se FastAPI, NUL scan, secret scan,
  PII scan, `gh pr checks`; `bin/pr-merge-verify.sh` prima di merge se disponibile.
- Andrea ha autorizzato autonomia piena per merge, deploy e test live prodotto: procedi con PR mergeate e deploy
  solo se check verdi, worktree pulita e nessun segreto/PII/corpus grezzo/pagamento reale e' coinvolto.

## AgentMemory obbligatorio

- Per questo progetto **Codex e Opus devono usare AgentMemory** prima di decidere architettura o codice.
- Primo step della prossima sessione Opus: richiamare `memory_sessions` / `memory_smart_search` / `memory_recall`
  su ARDESIA, LessonOS, Fabbrica, ELABTutorPlugin, Graphify/Grapiphy, dashboard docente/scuola.
- Se gli strumenti MCP `memory_*` non sono esposti nella sessione, usare fallback REST/CLI:
  `agentmemory status`, `agentmemory doctor --dry-run`, e se necessario il server su `http://localhost:3111`.
- Stato MacBook verificato in questa sessione Codex:
  - AgentMemory locale healthy su `http://localhost:3111`, viewer `http://localhost:3113`.
  - `agentmemory status`: 85 sessioni, 12602 osservazioni, grafo 142 nodi / 142 archi.
  - Codex CLI/Desktop cablati in `~/.codex/config.toml`; hook workaround installato in `~/.codex/hooks.json`.
  - Claude Code CLI cablato in `~/.claude.json`.
  - Claude Desktop cablato in `~/Library/Application Support/Claude/claude_desktop_config.json`.
  - Claude-3p Desktop cablato in `~/Library/Application Support/Claude-3p/claude_desktop_config.json`.
  - Skills AgentMemory aggiornate con `npx skills add rohitg00/agentmemory -y`.
- Dopo apertura nuova sessione, riavviare/riaprire Codex o Claude/Opus se i tool non appaiono: i config MCP
  vengono letti al launch.

## Stato fabbrica da analizzare con Opus

- Leggere `docs/ops/FACTORY-LIVE-STATUS.md`, `ops/knowledge/FACTORY-STATE.md`,
  `docs/vault/11-ARCH-fabbrica-autonoma-2026-06-16.md` e richiamare AgentMemory sullo stesso tema.
- Stato documentato piu' recente nel repo: factory live ma storicamente degradata da AgentMemory sul Mini;
  MacBook ora ha AgentMemory locale healthy, ma il Mini/fabbrica va verificato di nuovo via fonti vive.
- Non assumere che la fabbrica sia pronta: fare audit di scheduler, Mini, Headroom, LiteLLM, Hermes,
  LessonOS, queue/worktree sporchi, e solo poi decidere merge/deploy.

## Correzione prodotto Andrea — shell e plugin

- Il prodotto principale percepito deve essere la **lavagna Ardesia**: semplice, bella, LIM/iPad-first.
- ELABTutorPlugin / ELAB Plugin / Simulation Plugin devono essere **caricabili** dalla lavagna e molto completi,
  ma **non** devono apparire come feature primaria o come tab principale aggressiva.
- La shell primaria deve restare corta: `lavagna` + ingresso plugin caricabile. Cruscotto, lezioni salvate,
  dashboard scuola e strumenti avanzati restano route/superfici interne contestuali, non la prima cosa che vede
  il docente.
- Ogni plugin deve sentirsi come un'estensione professionale della lavagna, non come un prodotto separato:
  caricamento chiaro, stato installato/attivo, permessi, provenance, test live, fallback onesto.
- Next UI work: migliorare bellezza/semplicita' della lavagna e rendere il caricamento ELABTutorPlugin evidente
  ma sobrio; evitare nav a quattro pillole e feature creep visibile in header.
- Pagina Tutor: il grafo deve essere **un vero grafo visuale Graphify/Grapiphy navigabile**, non una lista di
  nodi/archi. Deve evolvere mentre cresce LessonOS: vedere nodi nuovi, archi, sottoparti, provenance, evidenze,
  descrittori didattici, concetti, materiali, errori, esercizi, quiz, student-pack e stati di completamento.
- Il grafo Tutor deve raccontare "come cresce LessonOS": snapshot temporali, timeline/replay, highlight del delta,
  focus/expand/collapse, filtri per descrittore, livelli classe/studente pseudonimo/materiale, e link alle fonti.
- Se Graphify/Grapiphy e' disponibile nel repo/tooling, usarlo davvero; se manca, creare adapter esplicito e
  documentare il fallback visuale temporaneo. Vietato spacciare chips o liste statiche per grafo prodotto.

## Cosa FABLE ha gia' chiuso

- #142: Product Readiness Audit, Ownership Matrix, Release Checklist.
- #144: renderer/bridge multi-pin; `v1-cap9-esp6` a `verified-structural` 4/8 con fixture, wire paths,
  overlay/report, crop pp.71-74, test ed e2e.
- #143: servizio `services/entitlement/` FastAPI sandbox/GDPR-ready tecnico con 51 pytest.

## Prossima PR consigliata: Dashboard Docente/Scuola

Obiettivo: trasformare il cruscotto da architettura corretta ma sottoutilizzata a superficie vendibile interna
con grafici e grafo navigabile da event-log reale, senza PII default. Non promuoverlo a feature primaria
nella shell: resta dashboard contestuale per docente/scuola.

Vincoli:

- Dati derivati solo da event-log LessonOS e journal reali/sintetici di test non-PII.
- Nessun secondo store parallelo per il grafo.
- `graph.query` resta read-only e auditato.
- La pagina Tutor deve avere un vero grafo Graphify/Grapiphy evolutivo, visibile e navigabile, che mostri
  crescita LessonOS e descrittori; `graph.query` e' solo una capability dati, non la UI finale.
- Classi/studenti pseudonimi; niente nomi, email, telefoni.
- UI sobria, operativa, adatta a docente/scuola, no landing page.

Test RED iniziali suggeriti:

1. `TeacherDashboardView` in live passa `journalEvents` e `focusNodeId` a `projectTeacherDashboard`.
2. La shell produce `lesson.started` e `lesson.ended` reali quando una sessione inizia/finisce.
3. Il cruscotto mostra almeno un grafico derivato da event-log non vuoto.
4. La zona grafo e' navigabile: nodo focus selezionabile, vicini visibili, `graph.query` auditata.
5. Pagina Tutor: grafo Graphify/Grapiphy renderizzato come canvas/SVG reale, con delta visibile dopo append
   di un evento LessonOS.
6. E2E Playwright dashboard/tutor desktop/tablet/mobile con fixture non-PII e screenshot non vuoti.

File probabili:

- `apps/studio/src/design/TeacherDashboardView.tsx`
- `apps/studio/src/lessonos/teacherDashboardProjection.ts`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/toolhost/panelHost.ts`
- test in `apps/studio/src/__tests__/` ed e2e in `apps/studio/e2e/`

## Stato prodotto sintetico

- ELABTutorPlugin: contenuti e visibilita' 8/8 presenti, ma solo 4/8 con fixture/overlay structural.
- Simulation Plugin: esp1/2/3/6 solidi structural; Vol.2 e Vol.3 breakout restano il collo di bottiglia.
- FastAPI/GDPR-ready: servizio sandbox pronto, non ancora cablato alla UI/prodotto.
- UI/UX Studente/Tutor/Scuola: shell navigabile, ma LIM/iPad e dashboard vendibile ancora aperti.
- Plugin/Skill Factory: manifest/install/signing solidi; mancano plugin utili installabili e trust story remota.
- Posizionamento UX aggiornato: lavagna come prodotto primario; ELABTutorPlugin caricabile e completo ma non
  headline feature.

## Handoff breve

Parti dal recovery audit #145, poi apri una PR dashboard chirurgica. Non rifare esp6: e' gia' dentro `main`.
Il prossimo valore vendibile e' cruscotto docente/scuola con metriche reali, grafo navigabile, pseudonimi e zero PII.
