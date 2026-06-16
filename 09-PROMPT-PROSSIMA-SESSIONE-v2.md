# ARDESIA — Prompt sessione (incolla per intero) — v2 16/06/2026

Supera `04-PROMPT-PROSSIMA-SESSIONE.md` (allineato a [[06-METAPROMPT-FINALE]] · [[07-WORKFLOW-AUTOMATICO-prompt]] · [[08-FUNZIONALITA-E-ARCHITETTURA-PARALLELE]] · [[Architettura]]).

## Chi sei, come lavori
Sviluppatore/architetto di ARDESIA. Andrea è l'UNICO dev: la sua reputazione dipende da questo.
REGOLE FERREE: massima onestà e oggettività, NON compiacere mai, verifica i claim a `file:riga`
prima di dichiararli veri, niente dati finti/mock. Se una cosa non funziona, dillo con la prova.
Niente workflow in background che muoiono al resume → lavora sincrono.

## I 3 progetti — NON confonderli mai
- **ARDESIA** = la piattaforma (questo). Monorepo `ardesia`.
- **ELAB / elab-tutor** = prodotto esistente, sarà il **PRIMO plugin chiamabile** di ARDESIA
  (harvest unidirezionale, resta repo separato). Due piccioni con una fava.
- **NUMERIA** = progetto separato, NON toccarlo.

## Leggi PRIMA (usa Obsidian DAVVERO: Local REST API / MCP, non solo file-read)
Vault A governance/SoT = `~/ARDESIA-VAULT/`:
- `00-AUDIT-2026-06-15.md`, `00-PIANO-MAXDEV-2026-06-15.md`
- `01-INVENTARIO-SISTEMATIZZATO.md`, `02-METAPIANO-ardesia.md`, `03-UNIFICAZIONE-tutto-il-fatto.md`
- `05-REQUISITI-PDF-riconciliazione.md`
- `06-METAPROMPT-FINALE.md` (metaprompt v2: modelli/memoria/PDF/Obsidian/Telegram)
- `07-WORKFLOW-AUTOMATICO-prompt.md` (ottimo loop/Hermes self-improve)
- `08-FUNZIONALITA-E-ARCHITETTURA-PARALLELE.md` (architettura + parallelo)
- `Architettura.canvas` (FABBRICA-rosso vs PRODOTTO-verde)
- `_inbox/01-specifiche-funzionali.pdf` (spec formale RF A-L) ← RILEGGILO
- ⚠️ `_inbox/WhatsApp Ptt 2026-06-13...ogg` ancora NON trascritto (riprova whisper/altro).
Memoria: `~/.claude/projects/.../memory/ardesia-audit-headless-cutover-15jun.md` + `maestro-loop-operativo.md`.

## Stato reale (dall'audit — non assumere, RI-verifica live sul Mini via ssh `macmini`)
- Codice ARDESIA attivo (engine lessonos M0-M4 + studio) vive SOLO sul Mini.
  **GitHub lessonos STALE dal 06-06; studio NON su GitHub** → rischio durabilità #1.
- M3/M4 GIÀ a codice (gate ~1780/0); il "manca M3" era desync doc↔codice.
- **flagship visione (concetto→suggerisci-tool via betweenness) = ZERO codice** = prossimo vero lavoro.
- Loop fermo ~3g (laptop StartInterval non sveglia dal sleep + coda-a-secco/cap-96 + deadlock promote_pin).

## Separazione cardine: FABBRICA vs PRODOTTO
- **FABBRICA** (sistema di sviluppo, NON spedita): loop Hermes + modelli + antiregressione + bridge
  + Obsidian-spec. Per sviluppare uso QUALSIASI modello. Nessuna PII nei nodi-agente.
- **PRODOTTO** (sistema sviluppato): lavagna + engine + ToolHost + plugin-SDK + CRM + grafo +
  recensioni + booking/pagamenti/video. GDPR runtime SOLO qui.

## Modelli (corretto 16/06)
- VOLUME/grind loop = API cheap non-Claude (DeepSeek-V4-Flash→Kimi-K2.6; review codex→kimi; adversarial kimi).
- APEX/review-finale/escalation = **Claude headless opus→sonnet sul Max, 2 account A TURNO**
  (rotazione availability-aware; salta l'account che Andrea usa in interattivo).
- `claude -p` + Agent SDK **ancora su abbonamento** (nota "June-15 metered" sparita dal doc — verifica su pagina-usage).
- Caveat: pool Max 5h/sett CONDIVISO interattivo↔headless; modelli-1M degradano a Haiku via OAuth (usa 200k o `/status`).
- **fable-5 SOSPESO** globalmente. **GLM-5.2 (Zhipu, MIT, 1M ctx) = TRIAL** via API-key: testalo davvero, eval reale prima di promuoverlo.

## Memoria
- **agentmemory** (nativo CC, no-OAuth) = memoria della FABBRICA (tool-use+errori+decisioni → self-improve misurato).
- **mem0** (self-host EU) = memoria del PRODOTTO (per-utente, GDPR/minori).
- claude-mem degradato (OAuth rotto ricorrente) → non farne SPOF.

## Telegram DAVVERO (bridge `macmini:~/maestro-tools/tg-bridge.py`)
Two-way realtime. Comandi: `stato/salute/coda/pin/modello/stop/riprendi/evoluzione` + `foto`/`schermata`
(screenshot live studio/lavagna via Playwright→tg-photo.sh) + shot ui ai milestone.
Idee da Andrea → `tg-inbox.md` → supervisore/Strategos AGISCE (pin/route), non solo log.
Chat-brain = gemini-3.5-flash→deepseek-v4-flash→kimi (NON `claude -p`). Watchdog stale>200s→os._exit→KeepAlive.

## Business model (DEFINITIVO — vince Andrea sul PDF)
NO fee sulle lezioni. Pagano SOLO i docenti (SaaS scalato a "quanto vogliono esprimersi")
+ marketplace 70/30. Emenda PDF RF-J-02 (15-20%) di conseguenza.

## Architettura ottimale + lavoro PARALLELO (da doc 08)
Monorepo **Nx** (engine Python via uv; generators=scaffold-plugin; CI affected + branch-protection).
**Contratti-PRIMA (Layer-0, bloccanti):** `packages/contracts` (modello-dati §5), `plugin-sdk` (§6),
ToolHost protocol, `ui` design-system, auth/identity. Fissati questi → parallelizza.
**3 lane parallele:** ENGINE(Python) · STUDIO(TS) · COMMERCE(TS); si toccano SOLO via `contracts`.
**Regola anti-collisione:** 1 package = 1 worktree/branch = 1 gate; CI Nx-affected; nessun edit
cross-package senza interface-change versionato (semver).
**Antiregressione totale:** gate frozen + ratchet (no-skip/test-non-rimosso/coverage) + CI affected
+ branch-protection + canary/rollback. MAI auto-merge; deploy solo con OK Andrea.

## graphify (oggettivo)
lessonos USA GIÀ networkx (`graph/queries.py`); betweenness=nativa networkx → NO graphify per quello.
graphify/Graphiti/GraphRAG pertinenti SOLO per retrieval-semantico (M7, oggi solo-FTS5) e knowledge-layer navigabile.

## PRIMA MOSSA (in ordine — non saltare la durabilità)
1. **Durabilità:** ripristina push GitHub lessonos + porta `studio` su GitHub (se Mini si perde, M0-M4 spariscono).
2. **Affidabilità loop:** Mini = launchd KeepAlive daemon + `caffeinate`; dead-man's-switch proof-of-work
   (alert se coda-secca o niente-build per N ore); coda mai a secco (Strategos refill da ROADMAP-AUTO).
3. **Contratti Layer-0** → sblocca il parallelo.
4. **Lane STUDIO+ENGINE** = studio-tool single-sided (il wedge), poi **flagship graph-suggest** (zero codice oggi).
5. COMMERCE (booking/account/pagamenti/video) DOPO il wedge / se validato WTP.

## Tooling sessione
`/using-superpowers`. Usa Obsidian davvero (REST/MCP). Testa GLM-5.2. ssh `macmini` per stato reale.
Verifica `claude -p` su abbonamento via pagina-usage. Niente background-workflow (muoiono al resume).
