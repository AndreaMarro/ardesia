# PROMPT PROSSIMA SESSIONE — ARDESIA — 2026-06-27 (DEFINITIVO, contesto perfetto)

## RUOLO
Sei il driver A1 (claude-opus-4-8). Obiettivo unico: **spedire ARDESIA reale, una feature viva alla volta.** Andrea è frustrato da 2 settimane di analisi>spedizione. **Regola: ogni ciclo avvicina una cosa che un utente usa, o è churn.** Verità=evidenza, UI=screenshot, claim=prova. Niente sciami-giganti d'analisi: costruisci e spedisci.

## LEGGI PRIMA (fondamentali, in ordine)
1. `ARDESIA-VISIONE-TOTALE-2026-06-27.md` — fonte di verità (prodotto/arch/business/moat/modelli/stato/roadmap).
2. `INVENTARIO-CE-MANCA-2026-06-27.md` — c'è/manca, **riusa-non-ripartire**.
3. `FABBRICA-DEFINITIVA-2026-06-27.md` — operating model fabbrica.
4. `session-logs/COV-AUDIT-FULLSYSTEM-2026-06-27.md` — stato reale (audit).
5. ADR: `ADR-HOST-BOUNDARY` · `ADR-MODEL-RETHINK` · `ARDESIA-MODEL-ARCHITECTURE-FINAL` · canon `ARCHITECTURE-CANON`/`ELAB-AS-PLUGIN-CANON`.
> Tutti questi sono ANCHE su GitHub: `github.com/AndreaMarro/ardesia` branch `docs/canon-2026-06-27` (draft PR #5). AgentMemory :3111 + MEMORY.md = continuità/recall.

## DECISIONI RATIFICATE (Andrea)
- **Pubblico = A base** (canvas-appunti per TUTTI, gratis) **+ B tier-pro opzionale** (docente: potenza/API/visibilità/qualità-SaaS). *(provvisorio — NON blindare arch su B).*
- ARDESIA = **OS/canvas plugin-native**. **NON è ELAB.** Simulatore = plugin generico. **ELAB = Pack-contenuti SOPRA il simulatore** (non il prodotto, non incollato).

## STATO REALE SPEDITO [V 27jun]
- **🚀 CANVAS LIVE PUBBLICA**: `https://ardesia-canvas.vercel.app` (single-file `~/VOLUME 3/ardesia-canvas/index.html`; SSO disabilitato; penna/evid/gomma/testo/zoom/pan/undo/save/export-PNG). Verificato: carica, 0 errori, UI ok. ⚠️ pen-drag non auto-verificabile nel harness → test = Andrea (drag rende live).
- **⚠️ GIÀ COSTRUITO (riconciliare, NON duplicare)**: **`ardesia-lavagna.vercel.app`** (Vite+TS perfect-freehand GoodNotes-parity, `~/VOLUME 3/ardesia-lavagna`) = lavagna PIÙ ricca del seed → probabile **base vera**. **`ardesia-workspace`** (UI lezioni). **`elabtutor.school`** (ELAB live). **`ardesia-api-vercel`** (API, corpus 4-vs-1224 rotto).
- Host **toolhost ~90% costruito, NON montato** (`~/ardesia/apps/studio/src/toolhost`). Lavagna-11-strumenti in `~/ardesia/plugins/elab-tutor`. Boundary-gate branch `boundary/host-gate-2026-06-27`@0892780a (lavagna↔simulator baseline 8).
- **GitHub**: ardesia/lessonos/ardesia-vault/ardesia-studio/elab-tutor = repo AndreaMarro/* esistono (mini origin=bare-locale, mirror github presenti, possibili stale → riallineare).

## BUILD-ORDER PRODOTTO (uno per volta, spedisci)
- **Stage 1 — CANVAS (FATTO base)**: decidi seed-vs-ardesia-lavagna → UNA canvas pubblica solida.
- **Stage 2 — PLUGIN-HOST montato**: monta toolhost esistente in route prodotto (MOUNT-CANVAS) → carica un plugin-tile sulla canvas. *(NON riscrivere il host)*.
- **Stage 3 — Simulatore generico** (generalizza ELAB-CircuitSim) + **ELAB estratto** dietro boundary-gate.
- **Stage 4 — Account** (anon→docente) + **Marketplace** + payments.

## ATTORI PARALLELI (da stasera, SICURO) /using-git-worktrees
- **claude-p A1/A2 Opus** (un-proxati) = builder/driver, su **worktree isolati** (1 builder = 1 worktree, no conflitti). Pattern già in uso (ardesia wt-docs/wt-syncguard).
- **Hermes**: `hermes2-adjudicate.sh` (worker-trova + Opus-adjudica) = sfruttare al MAX su feature-prodotto. NON il CLI-orfano (ritirato).
- **Worker locale = Qwen-4B MANAGED** (NON 8B: ha OOM-wedged il mini il 27jun → reboot). On-demand/KV-cap, MAI KeepAlive-pesante. Controllato dagli Hermes.
- **AgentMemory :3111** = UN grafo (consolidate ri-armato, distill via Gemini funziona). **Far crescere il grafo** = ri-trigger consolidate + popolare (vedi knowledge-fabric). Graphify/Wiki = viste.
- **Telegram** `com.maestro.tg-bridge` UP = comunica/ascolta (verificare two-way reale).
- **mini + MacBook paralleli**: mini=build-host, MacBook=supervisor/verifier; bus = git + vault + ssh. Comunicano via git/AgentMemory, NO federazione magica.
- **Automiglioramenti visibili** = grafo che cresce (nodes_post↑ in consolidate.log) + gate test↑ SOLO se nuova-copertura (non churn) + feature-prodotto spedite.

## GATE-ANDREA (non superare senza OK)
prod-deploy-altro · main-merge · secrets/PII · force-push · clear-STOP · model-default-change · payments · marketplace-live · ricarica-OpenRouter(€) · **re-deploy daemon-modello-pesante** (incidente).

## GOTCHA (a caro prezzo)
- **NO daemon-modello-pesante-permanente su mini-16GB** (8B KeepAlive→OOM→box wedged 27jun). Worker=4B managed/on-demand+KV-cap.
- `mlx_lm.server /v1/models` lista TUTTI i cached → usa **id ESATTO** (`data[0]` può essere gpt-oss). gpt-oss tool-call ROTTO (harmony). macOS no `setsid`.
- vault git Syncthing → **NEVER `git add -A`**. `launchctl kickstart -k`≠reload-env. semgrep-hook-senza-token = errori innocui.
- mini = `ssh macmini` (progettibelli). budget WARN $3.99>$3.3 (enforcement detect-only → da chiudere).
- **Riusa-non-ripartire**: prima di costruire X, cerca se esiste già (Vercel projects, github repos, vault). Andrea: "ti sei perso cose già fatte."

## PRIMO PASSO
1. Andrea testa `ardesia-canvas.vercel.app` (disegna) → conferma/segnala → fix.
2. **Decidi canvas**: seed pulito vs `ardesia-lavagna` (più ricca) → UNA.
3. **Stage 2**: monta toolhost → plugin-tile sulla canvas (la cosa che dimostra OS+plugin).
4. Parallelo: fabbrica punta a PRODOTTO (non churn) · grafo cresce · Telegram-two-way.
