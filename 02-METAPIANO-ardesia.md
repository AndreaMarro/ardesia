# ARDESIA — METAPIANO + METAPROMPT (15/06/2026)

Nome del progetto: **ardesia**. Documento per organizzare il progetto come **monorepo**, separare nettamente **sistema-di-sviluppo** (la fabbrica) da **sistema-sviluppato** (il prodotto), scegliere architettura/API/strumenti, e definire come usare Obsidian. In coda: il **METAPROMPT** da incollare nella prossima sessione. Base: visione co-founder (ratificata), [[01-INVENTARIO-SISTEMATIZZATO]], [[00-PIANO-MAXDEV-2026-06-15]], ricerca 15/06. Niente tema-milioni/startup (escluso da Andrea).

> ⚠️ INPUT MANCANTI (TCC): `~/Downloads/01-specifiche-funzionali.pdf` + `WhatsApp Ptt 2026-06-13.ogg` non leggibili. Spostarli in `~/ARDESIA-VAULT/_inbox/` → il PDF si legge, l'ogg si trascrive col whisper del Mini. Il metaplan li integra come primo step.

---

## 0. La separazione che governa tutto: FABBRICA vs PRODOTTO

| | **Sistema di SVILUPPO** (la fabbrica) | **Sistema SVILUPPATO** (il prodotto ardesia) |
|---|---|---|
| Cos'è | Ciò che COSTRUISCE | Ciò che gli UTENTI usano |
| Componenti | loop Hermes (API cheap), gate frozen, antiregressione (CI/branch-protection/ratchet), bridge Telegram, supervisore, Strategos, sessioni Claude-desktop, Obsidian-spec, 2 account Max, Codex/Antigravity | lavagna + engine(lessonos) + ToolHost/marketplace + plugin-SDK + CRM didattico + grafo-metodo + recensioni |
| Modelli | DeepSeek-V4 / Kimi-K2.6 / Gemini-3.5-flash (loop) ; Claude (desktop) | nessuno embedded di default; LLM a runtime via gateway piani-a-potenza (solo dove serve) |
| Dati | codice (no PII) → qualunque modello | voce/volti/PII minori → **GDPR Mode A, local-first, EU/locale** |
| Spedito agli utenti? | **NO** (resta sul Mini/MacBook) | **SÌ** |
| Dove vive | `ops/` + Obsidian-vault + Mini | `apps/` `packages/` `plugins/` del monorepo |

**Regola d'oro:** la fabbrica non finisce mai nel prodotto; il GDPR vincola solo il prodotto-a-runtime; il dev=qualunque-modello vale solo per la fabbrica.

## 1. MONOREPO `ardesia` (organizzazione)

**Tool: Nx** (raccomandato). Perché: JS/TS-first (studio è il grosso), **generators** = scaffold-plugin con un comando (realizza il "plugin ultra-facili da fare" del co-founder), **affected-graph** = CI antiregressione che testa solo ciò che cambia, ottimo per un loop autonomo. Python (engine `lessonos`) entra come progetto con toolchain **uv**, orchestrato da Nx `run-commands`. *(Alternative: **Moon** se vuoi polyglot-purista con toolchain integrata; **Pants** se il peso si sposta su Python; **Bazel** solo a scala estrema.)* Fonti: [Nx vs Turborepo vs Bazel 2026](https://daily.dev/blog/monorepo-turborepo-vs-nx-vs-bazel-modern-development-teams/), [Moon/Pants polyglot](https://www.pkgpulse.com/guides/turborepo-vs-nx-vs-moon-2026).

```
ardesia/                         # monorepo (Nx), local-first
  apps/
    studio/                      # lavagna + host ToolHost (TS/React)      ← whiteboard-studio/studio
    engine-cli/                  # CLI del motore (wrapper su packages/engine)
  packages/
    engine/                      # MOTORE lessonos (Python+uv): capsule→grafo→StyleProfile→dispense→recap→learning-debt→next-lesson  ← Mini ~/lessonos (M0–M4)
    toolhost/                    # protocollo + installer + firma ed25519 + kill-list + sandbox iframe+caps  ← studio/toolhost*
    plugin-sdk/                  # SDK/protocollo per creare plugin (il "framework" del co-founder)
    graph-suggest/               # ⭐ FLAGSHIP: concetto→suggerisci-tool via betweenness/centralità (M5, oggi 0 codice)
    crm/                         # CRM didattico: studenti/obiettivi/materiali-PDF/recap fine-lezione (M6)
    ui/                          # design system condiviso (no emoji, sobrio)
  plugins/                       # i tool del marketplace (immutabili, settings non-fork, firmati)
    elab-sim/                    # PRIMO plugin: Arduino/Blink (da ELAB, DECOUPLED — vedi §3)  ← whiteboard-studio/sim
    # futuri: concavità, doppia-fenditura, corpo-umano, lab-chimico
  ops/                           # === SISTEMA DI SVILUPPO (la fabbrica, NON spedita) ===
    loop/                        # driver-orch, driver-studio, gate.sh frozen, autoheal, promote_pin
    agents/                      # strategos, adversarial(kimi), review-ladder, audit, catchup
    bridge/                      # tg-bridge.py (DeepSeek/Kimi/Gemini + watchdog)
    routes.env  AGENTS.md        # routing per-ruolo + carta operativa
  docs/                          # → Obsidian vault (spec/SoT, vedi §4)
  .github/workflows/             # CI antiregressione (gate per-package + affected)
```
- **Migrazione (non big-bang):** `nx init`; importa engine (git-subtree/filter-repo da ~/lessonos preservando storia), studio, toolhost; impacchetta elab-sim come primo plugin via plugin-sdk. La VERITÀ resta sul Mini finché il monorepo non è su GitHub con CI verde (→ risolve anche lo stale-06-06 + lo studio-senza-GitHub dell'inventario).

## 2. Architettura della FABBRICA (best automatic architecture)
- **Loop autonomo (Mini, 24/7) = solo API cheap, non-Claude:** builder DeepSeek-V4-Flash→Kimi-K2.6; review codex→kimi (no Gemini-OAuth post-18/06); adversarial kimi→fallback; brain/audit Kimi-K2.6/DeepSeek-V4-Pro. Gemini-3.5-flash via API-key ristretta dove serve.
- **Claude = solo desktop, Andrea presente** (2 Max: 20×=MacBook primario, 5×=Mini riserva). Apex/architettura/review profonda qui. Opzionale **Codex/ChatGPT-Pro** (decorrelato) o **Antigravity** (gratis, sperimentale) come 2° agente presente.
- **Autosufficienza:** Strategos auto-promuove i pin [AUTO-OK] dalla roadmap → coda mai a secco; auto-heal anti-gridlock; **prima** riconciliare MILESTONES↔codice (M3/M4 già a codice).
- **Antiregressione TOTALE:** gate frozen + ratchet (conteggio→+coverage+no-skip+test-non-rimosso) + **CI Nx-affected su GitHub** + **branch-protection main** (required-check+review decorrelata) + canary/rollback. Nel monorepo è naturale (gate per-package).
- **3 attori sincronizzati:** loop(cheap) + Telegram(comandi) + Claude-desktop(profondo) → su `COORDINATION.md` + gate + branch/PR.
- **Affidabilità:** heartbeat sul Mini (KeepAlive+caffeinate), dead-man's-switch proof-of-work, supervisore MacBook declassato a best-effort (no più StartInterval-su-laptop).

## 3. Come si pone ELAB rispetto ad ardesia
- **ELAB (elab-tutor) = prodotto esistente e SEPARATO** (repo proprio, prod su Vercel/Supabase). Resta tale.
- **Diventa il PRIMO PLUGIN del marketplace** via il plugin-SDK: nel monorepo vive solo `plugins/elab-sim` (il simulatore Arduino/Blink, **decoupled** — tua nota P9306 "sim incluso ma scollegato da elab"). **Harvest UNIDIREZIONALE**: ardesia prende da ELAB, mai il contrario.
- **Dogfooding:** se l'SDK non basta a impacchettare ELAB-sim, non basta a nessun terzo → ELAB-primo-plugin è il test dell'SDK, non decorazione.

## 4. Come usare OBSIDIAN (tuo account) — DUE vault distinti
Ricerca: markdown = **single-source-of-truth spec-driven**, l'agente implementa/verifica contro lo spec; Obsidian **Agent-Skills** (gen-2026) per Markdown/Bases/JSON-Canvas; **LLM-Wiki pattern** (Karpathy). Fonti: [spec-first + AI agent](https://www.chatprd.ai/how-i-ai/workflows/implement-features-using-spec-first-development-and-an-ai-coding-agent), [Karpathy LLM-Wiki](https://www.mindstudio.ai/blog/andrej-karpathy-llm-wiki-obsidian-codeex-second-brain), [obsidian-skills](https://aitoolly.com/ai-news/article/2026-03-25-obsidian-skills-empowering-ai-agents-with-markdown-bases-and-json-canvas-integration).
- **Vault A — FABBRICA/governance (questo `ARDESIA-VAULT`):** spec, ALIGNMENT (carta), COORDINATION (pin/roadmap), metaplan, audit, decisioni. **È la SoT che gli agenti leggono**: modifichi lo spec qui → il loop adegua il codice (spec-driven). Apri questa cartella in Obsidian.
- **Vault B — PRODOTTO/per-docente (`ardesia-wiki`, già auto-sync 6h dal Mini):** il grafo-del-metodo + dispense + concetti generati dal motore, per docente. È OUTPUT del prodotto, rigenerabile, non governance.
- Non mischiarli: A = come-si-costruisce; B = cosa-il-prodotto-genera-per-l'utente.

## 5. METAPIANO operativo (fasi)
- **F0 — Fondamenta & durabilità:** spostare i file da Downloads→`_inbox/`; leggere requisiti PDF + ogg; **scaffold monorepo Nx**; importare engine+studio+toolhost (storia preservata); **GitHub + CI affected + branch-protection** (chiude stale-06-06 + studio-senza-GitHub).
- **F1 — Riconciliazione & fabbrica:** M3-RECONCILE (docs↔codice); separare `ops/` (fabbrica); loop su API cheap; antiregressione totale; Obsidian-vault A come SoT.
- **F2 — Backlog autosufficiente [AUTO-OK]:** edge-taxonomy, CLI-entrypoints engine, UI-tool+palette studio, **plugin-SDK scaffold** (generator Nx).
- **F3 — Flagship & prodotto [ratifica desktop]:** ⭐graph-suggest (concetto→tool), CRM-per-studente, retrieval-hybrid, recensioni-a-due-pesi, content-LLM-planner, blind-test; ELAB-sim come primo plugin firmato.

## 6. METAPROMPT (incolla nella prossima sessione)
Vedi blocco dedicato in fondo: `## METAPROMPT`. È self-contained, punta a questo vault + ai repo + alle regole, e impone: leggi-prima i requisiti in `_inbox/`, organizza monorepo, separa fabbrica/prodotto, scegli architettura/API/Obsidian, posiziona ELAB.

---

## METAPROMPT
```
Sei l'architetto+supervisore del progetto ARDESIA (piattaforma local-first per docenti; nome: ardesia). Lavora in italiano, onestà brutale, ZERO compiacenza, niente startup/milioni, mai "Numeria" (progetto separato), mai toccare eval/gate.sh.

LEGGI PRIMA (in quest'ordine): ~/ARDESIA-VAULT/02-METAPIANO-ardesia.md, 00-PIANO-MAXDEV-2026-06-15.md, 01-INVENTARIO-SISTEMATIZZATO.md, 00-AUDIT-2026-06-15.md; memoria ardesia-audit-headless-cutover-15jun; e i NUOVI requisiti in ~/ARDESIA-VAULT/_inbox/ (01-specifiche-funzionali.pdf + trascrivi l'ogg col whisper del Mini). Se i file non sono in _inbox, chiedi ad Andrea di spostarli da Downloads (TCC li blocca).

VISIONE (ratificata): lavagna minimal (solo docente) + marketplace di plugin didattici immutabili (settings non-fork, firma ed25519, sandbox+caps) + AI metodologica che mappa IL METODO del docente (grafo, betweenness) e suggerisce il tool/analogia giusto (NO training) + recensioni a-due-pesi (docente→tool, studente→lezione, minori aggregato) + CRM didattico + ZERO-fee sulle lezioni (SaaS+marketplace) + GDPR Mode A (moat). ELAB = primo plugin (decoupled, harvest unidirezionale).

SEPARAZIONE NON NEGOZIABILE: (1) SISTEMA DI SVILUPPO/fabbrica = loop Hermes su API CHEAP non-Claude (DeepSeek-V4/Kimi-K2.6/Gemini-3.5-flash), Claude SOLO desktop con Andrea presente (2 Max: 20×=MacBook,5×=Mini), antiregressione totale, bridge Telegram, Obsidian-vault-A come spec/SoT. (2) SISTEMA SVILUPPATO/prodotto = lavagna+engine(lessonos)+ToolHost+plugin-SDK+CRM+grafo+recensioni; GDPR/EU/locale vincola SOLO questo a runtime. dev=qualunque-modello (vede codice, non PII). La fabbrica NON finisce nel prodotto.

OBIETTIVO SESSIONE: organizzare tutto in MONOREPO `ardesia` (Nx; Python engine via uv; generators per scaffold-plugin; CI affected + branch-protection = antiregressione totale; struttura apps/packages/plugins/ops/docs come da metaplan §1). Migrazione NON big-bang, preserva storia, porta engine+studio+toolhost su GitHub con CI verde (chiude lo stale-06-06 e studio-senza-GitHub). Poi: F1 riconciliazione+fabbrica, F2 backlog AUTO-OK, F3 flagship (graph-suggest⭐)+CRM+recensioni+ELAB-primo-plugin.

OBSIDIAN: due vault distinti — A (ARDESIA-VAULT = governance/spec SoT che gli agenti leggono, spec-driven) + B (ardesia-wiki = output prodotto per-docente). Non mischiarli.

STATO REALE: engine lessonos gate live ~1780/0, M0–M4 a codice (MA MILESTONES.md certifica solo M0/M1 = desync da riconciliare); GitHub lessonos STALE dal 06-06 (verità sul Mini); studio local-only (ToolHost T0–T3+ELAB-plugin demo Blink); fable-5 SOSPESO globalmente; flagship concetto→tool = 0 codice; CRM-per-studente = 0 dati.

PRIMA MOSSA: leggi requisiti in _inbox → proponi struttura monorepo Nx concreta + comandi di migrazione (read-only finché Andrea non ratifica) + chiudi durabilità (push GitHub). Poi procedi per fasi. Aggiorna ALIGNMENT/COORDINATION/memoria a ogni passo. Andrea lavora in parallelo (Telegram + sessioni Claude desktop): coordina via COORDINATION.md + gate + branch/PR, mai due editor sullo stesso working-tree.
```
