# PROMPT-NEXT-CODEX-PRODUCT-RC — 4.8 OPUS DESKTOP

Destinatario: **4.8 opus desktop**.

Nota sessione: questa sessione corrente e' Codex; il presente file e' l'handoff per la sessione successiva
su **4.8 opus desktop**.

Sei 4.8 opus desktop Product-RC per ARDESIA/ELAB. Riprendi da `origin/main` e non usare il checkout storico
`/Users/andreamarro/VOLUME 3/ardesia` come base di implementazione.

## Stato base

- Base finale verificata a fine sessione Codex 2026-07-07: `origin/main e9267801`
  (`Merge pull request #146 from AndreaMarro/feat/teacher-dashboard-live-graph-20260715`).
- #142, #143, #144 risultano `MERGED`.
- #144 non e' persa: `6386e172` ha come parent `fa6fb6ce` (#144), quindi il renderer multi-pin/esp6 e' gia'
  nella storia di `main`.
- PR recovery Codex: #145 `docs(ops): Codex post-FABLE recovery audit`, `MERGED`.
- PR dashboard/nav Codex: #146 `feat(dashboard): live lesson graph and primary shell nav`, `MERGED`;
  shell primaria corretta a `lavagna` + `ELAB Plugin`, non quattro pillole.
- Documento di recovery: `docs/ops/CODEX-POST-FABLE-RECOVERY-2026-07-15.md`.

## Stato live/deploy finale

- Vercel CLI autenticata come `andreamarro`; lista progetti letta via CLI.
- Il monorepo `ardesia` non ha `.vercel/project.json`: `npm run preview:studio:preflight` ha passato typecheck,
  vitest e build locali, ma ha chiuso con `blocked: local build passed, but preview deploy is not ready`.
- Non e' stato eseguito deploy monorepo per evitare link/progetto Vercel cieco.
- Smoke live read-only 2026-07-07:
  - `https://ardesia-lavagna.vercel.app/` -> HTTP 200, browser desktop/mobile OK, titolo
    `ARDESIA · la lavagna del docente`, plugin presenti, zero console/pageerror.
  - `https://ardesia-api-vercel.vercel.app/health` -> HTTP 200.
  - `https://www.elabtutor.school/` -> HTTP 401, gated/protetto.
- Screenshot live locali:
  - `/Users/andreamarro/VOLUME 3/smoke-evidence-20260715/live/ardesia-lavagna-live-desktop.png`
  - `/Users/andreamarro/VOLUME 3/smoke-evidence-20260715/live/ardesia-lavagna-live-mobile.png`
- Interpretazione: il live pubblico e' ancora la demo separata `ardesia-lavagna`, non il monorepo appena
  merged. Prima del prossimo deploy Opus deve scegliere e cablare esplicitamente il progetto Vercel target.

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
- Memoria salvata via REST per questa chiusura: `mem_mralr7jn_d6b0f6c18ec7`.
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

## Prossima PR consigliata: Tutor Graphify reale + UX lavagna

Obiettivo: portare la superficie visiva al livello prodotto che Andrea ha chiesto: lavagna piu' bella e facile,
ELAB Plugin caricabile ma non protagonista, e pagina Tutor con un vero grafo Graphify/Grapiphy evolutivo.
La dashboard docente/scuola ha una prima slice merged in #146, ma non basta ancora come prodotto vendibile.

Vincoli:

- Dati derivati solo da event-log LessonOS e journal reali/sintetici di test non-PII.
- Nessun secondo store parallelo per il grafo.
- `graph.query` resta read-only e auditato.
- La pagina Tutor deve avere un vero grafo Graphify/Grapiphy evolutivo, visibile e navigabile, che mostri
  crescita LessonOS e descrittori; `graph.query` e' solo una capability dati, non la UI finale.
- Classi/studenti pseudonimi; niente nomi, email, telefoni.
- UI sobria, operativa, adatta a docente/scuola, no landing page.
- Shell primaria sempre corta: `lavagna` + `ELAB Plugin`.
- ELABTutorPlugin completo e caricabile, ma non headline feature.
- Nessun deploy monorepo finche' non esiste link Vercel esplicito e documentato.

Test RED iniziali suggeriti:

1. Pagina Tutor: grafo Graphify/Grapiphy renderizzato come canvas/SVG reale, con delta visibile dopo append
   di un evento LessonOS.
2. Timeline/replay mostra crescita LessonOS: nodi nuovi, archi, sottoparti, provenance e descrittori.
3. Focus/expand/collapse del grafo seleziona un nodo e aggiorna pannello descrittori senza PII.
4. Shell e lavagna restano pulite su mobile/tablet: niente overlap, touch target coerenti, header non affollato.
5. ELAB Plugin si carica dalla lavagna con stato installato/attivo/permessi/provenance, senza diventare tab primario.
6. E2E Playwright tutor/lavagna desktop/tablet/mobile con fixture non-PII e screenshot non vuoti.

File probabili:

- `apps/studio/src/design/TeacherDashboardView.tsx`
- `apps/studio/src/design/ViewNav.tsx`
- `apps/studio/src/lessonos/teacherDashboardProjection.ts`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/toolhost/panelHost.ts`
- test in `apps/studio/src/__tests__/` ed e2e in `apps/studio/e2e/`

## Stato prodotto sintetico

- ELABTutorPlugin: contenuti e visibilita' 8/8 presenti, ma solo 4/8 con fixture/overlay structural.
- Simulation Plugin: esp1/2/3/6 solidi structural; Vol.2 e Vol.3 breakout restano il collo di bottiglia.
- FastAPI/GDPR-ready: servizio sandbox pronto, non ancora cablato alla UI/prodotto.
- UI/UX Studente/Tutor/Scuola: shell primaria corretta in #146; LIM/iPad polish e grafo Tutor prodotto ancora aperti.
- Dashboard docente/scuola: prima slice live da event-log/journal e grafo interno merged in #146; serve ancora
  Graphify/Grapiphy reale nella pagina Tutor e profondita' scuola.
- Plugin/Skill Factory: manifest/install/signing solidi; mancano plugin utili installabili e trust story remota.
- Posizionamento UX aggiornato: lavagna come prodotto primario; ELABTutorPlugin caricabile e completo ma non
  headline feature.

## Handoff breve

Parti da `origin/main e9267801`, leggi recovery audit #145 e la slice dashboard/nav #146, poi apri una PR
chirurgica su UX lavagna + grafo Tutor Graphify reale. Non rifare esp6: e' gia' dentro `main`.
Il prossimo valore vendibile e' una lavagna piu' bella/facile con ELAB Plugin caricabile e un Tutor che mostra
visivamente come cresce LessonOS, con metriche/grafo, pseudonimi e zero PII.
