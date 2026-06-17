# ARDESIA — Piano per sviluppare al massimo (15/06/2026)

Capstone: ricostruzione (visione + ruoli Hermes + stato reale) + nuove condizioni al contorno + decisioni d'architettura ratificate da Andrea stasera. Fonti: workflow `weefsp1cw` (5 agenti recon, gate ri-eseguito live) + audit `wl0cde5eb` + ricerca online. Tutto verificato READ-ONLY; le mutazioni fatte stasera sono elencate in §7.

---

## 1. Stato REALE (correzioni dalla recon — il quadro era sbagliato nei doc)

- **Engine `lessonos`** (Python, sul Mini): gate **1780/0 verde** (ri-eseguito live). M0+M1+M2 completi **E M3+M4 GIÀ COSTRUITI**: `graph/{path_memory,didactic_delta,learning_debt,next_lesson_planner,queries,aggregator}.py`, testati, cablati in `lessonos run-path`. Power-law retention, FSRS difficulty-aware.
- **Il "manca M3" era una contraddizione documentale**, non lavoro mancante: `MILESTONES.md` (riscritto 06-12) dice "M2 in attesa di pin" ignorando che M3/M4 di `PLAN.md` sono già a codice. Da qui il **gridlock NOOP** del loop (coda vuota → stop): il motore si è fermato perché ha fatto **più** di quanto la roadmap-corrente ammette, e la prossima mossa è una **decisione di prodotto**, non un build.
- **GitHub `lessonos` è STALE dal 06-06** (main `0331632`, auto/main `3471689`). Il loop non pusha più. **Fonte di verità = SOLO il Mini.** → rischio durabilità + blocca lavoro-parallelo-via-clone + la CI testerebbe codice vecchio. **Enabler #1.**
- **Flagship della VISIONE NON costruito:** `grep betweenness|centrality|pagerank` su lessonos = **0 hit**. Il "suggerisci il tool/analogia giusto al momento giusto" (cuore di ARDESIA) non esiste. `suggest` = solo topic/review-day del planner. **È il vero prossimo lavoro.**
- **CRM per-studente assente a livello dati:** `node_type` emessi = solo {concept, exercise, lesson}. Niente Student/Objective/Roster. Lista-studenti/obiettivi/PDF/recap = da costruire.
- Tassonomia grafo sotto-usata (11 edge-type definiti, 3 emessi); retrieval solo-FTS5 (no ibrido/embeddings, PLAN §13); M3/M4 non esposti come subcommand; `course/planner.py` LLM = STUB; **blind-test aperto** (giudizio Andrea ≥7/10 mai chiuso).
- **`studio`** (Whiteboard, LOCAL-only): lavagna + ToolHost ed25519 + ELAB primo plugin (demo Blink). Mancano: UI marketplace, palette tool, recensioni a-due-pesi, vista CRM, AI-suggest, SDK pubblicabile da terzi.

## 2. Ruoli Hermes (operativo, da kernel-rule-6)
fable=sviluppatore (MORTO, vedi §3) · Hermes/DeepSeek=orchestrazione+grind · HERMES-2/kimi=red-team · review ladder cross-family · gate frozen=arbitro · audit 2x/g · auto-heal · Strategos propone (non applica). Loop launchd 300s, dual-lane lessonos+studio, maratona promote_pin.

## 3. Nuove condizioni al contorno (oggi)
1. **Cutover 15/06:** `claude -p` headless = credito Agent-SDK metered → **irrilevante** con la decisione §4 (loop non usa Claude).
2. **Fable 5 SOSPESO globalmente** (ordine governo USA 12/06, non token) → rimosso ovunque come primario, non "atteso".
3. **Gemini OAuth/CLI consumer chiuso 18-19/06** → Gemini solo via **API key ristretta**, mai account Pro.
4. **dev = QUALUNQUE modello** (ordine Andrea). GDPR = solo runtime-prodotto, NON la scelta del builder.

## 4. Architettura ratificata (le decisioni di stasera)
**Separazione netta: macchina-che-lavora-sola = NON-Claude; Claude = uomo+desktop.**
- **Loop autonomo (Mini, 24/7) = SOLO API economiche** (DeepSeek-V4-Flash/Pro, Kimi-K2.6, Gemini-3.5-Flash via API-key). Zero Claude headless → cutover/credito/fable/downgrade **spariscono**. Cheap, autosufficiente, mai bloccato da limiti Claude.
- **Claude Code = interattivo, desktop, Andrea PRESENTE** = qualità/steer/review/fix. Pool Max (gratis, non-metered). Apex opus solo qui, con lui. **2 account Max = 2 sedute interattive** (20× pesante/lunga, 5× seconda seduta/overflow; sync = `/login` switch; stato condiviso via COORDINATION+memoria).
- **Codex/ChatGPT Pro (opzionale)** = 2° agente presente **decorrelato** da Claude → rinforza l'antiregressione cross-family. Da prendere solo se userà la review incrociata. **Gemini Pro: NO.**
- **Telegram = chat API-economica + comandi** (pin/modello/stop/coda). Async dal telefono. Niente Claude headless.
- **3 attori, 3 punti di sync:** loop(cheap,auto) + Telegram(comandi) + Claude-desktop(profondo). Si incontrano su **COORDINATION.md** (pin), **gate frozen** (arbitro), **branch/PR** (merge). Mai due editor sullo stesso working-tree; mai due driver insieme.

## 5. Autosufficienza (il loop non ti aspetta)
- **Sblocco gridlock:** M3-RECONCILE (allinea MILESTONES.md↔PLAN.md↔codice; ZERO motore, gate invariato).
- **Coda mai a secco:** Strategos auto-promuove dalla ROADMAP-AUTO le milestone **meccaniche [AUTO-OK]** (sotto). Il loop le macina da solo.
- **Le forche STRATEGICHE** (flagship, CRM, retrieval, content-planner, recensioni) richiedono **ratifica Andrea** (decisioni prodotto/GDPR) → le decidi nelle **sedute Claude desktop**, poi diventano pin. Questa è la divisione onesta: loop macina il meccanico; tu (desktop+Claude) ratifichi le forche.

## 6. Antiregressione TOTALE (pilastro — model-agnostic)
Base esistente: **gate frozen + ratchet sul conteggio test** ("passed non regredisce") + HERMES-2 adversarial + audit 2x/g + pre-commit (lessonos). Da completare per renderla **totale**:
1. **Ripristinare il push GitHub** (enabler #1) — senza, niente CI/durabilità/parallelo.
2. **CI GitHub Actions** che rilancia `eval/gate.sh` su ogni push+PR (rete esterna indipendente; oggi solo dependabot). Anche su studio (dopo push).
3. **Branch protection `main`**: required-check = CI-gate + PR review decorrelata; no merge senza. Adattare prima il merge del loop (auto/main→main via PR).
4. **Ratchet totale**: oltre al conteggio → coverage monotòna + guard no-new-skip/xfail + guard test-non-rimosso (diff-level) + mutation-spot su path critici (grounding/GDPR-purge).
5. **Canary+rollback** su ogni deploy (già pattern; il bridge stasera fatto così).

## 7. Roadmap (ordinata per impatto)

### Fase 0 — Enabler / sblocco (subito)
- [AUTO-OK] **M3-RECONCILE** (docs, sblocca il NOOP) · **ripristina push GitHub** lessonos · **push studio→GitHub** (privato) · **strip Claude-headless** da bridge + routes.env (loop 100% non-Claude: review=codex→kimi, brain/audit=kimi/deepseek-v4-pro).
- **FATTO stasera:** bridge sbloccato (era wedged 5h) + cervello chat → DeepSeek-V4/Kimi/Gemini-3.5-flash + watchdog + retry (PID live).

### Fase 1 — Antiregressione totale (§6) — la rete prima di accelerare
- CI-gate (lessonos+studio) · branch-protection main · ratchet→totale · pre-commit su entrambi.

### Fase 2 — Backlog autosufficiente [AUTO-OK] (il loop macina da solo)
- **M5-EDGE-TAXONOMY** (materializza i 11 edge-type, M) · **M3-CLI-ENTRYPOINTS** (espone plan-next/learning-debt/path-memory/didactic-delta, M) · **S-MKT-1** (UI tool + palette, sblocca dogfooding ELAB) · **S-MKT-2** (SDK scaffold + CLI publish + docs, precondizione plugin-di-terzi).

### Fase 3 — Flagship + prodotto [RATIFICA ANDREA, sedute Claude desktop]
- **M5-TOOL-GRAPH-SUGGEST** ⭐ — concetto→suggerisci-tool via betweenness/centralità (il cuore della visione; serve tassonomia tool-tag = contratto col marketplace).
- **M6-CRM-PER-STUDENTE** — nodi Student/Objective + roster + recap fine-lezione + learning-debt per-studente (tocca GDPR-runtime minori).
- **M7-RETRIEVAL-HYBRID** — FTS5 + dense (sqlite-vec, local-first) + scope gerarchico.
- **M3-LLM-COURSE-PLANNER** — planner reale (oggi stub): raw→corso nello stile del docente + teacher-review loop (builder cheap).
- **S-MKT-3** — recensioni a-due-pesi (docente→tool, studente→lezione, minori aggregato) + UI marketplace/classifica.
- **M2-1-BLIND-TEST** — chiudere il giudizio qualitativo dispensa (≥7/10).

## 8. Modelli (routing per ruolo, post-stasera)
- **Loop (API-key cheap):** builder=DeepSeek-V4-Flash→Kimi-K2.6 ; review=codex→kimi (no gemini-OAuth post-18/06) ; adversarial=kimi→ (2° cheap) ; brain/audit=Kimi-K2.6/DeepSeek-V4-Pro. **Niente fable, niente Claude headless.**
- **Desktop (presente):** Claude (2 Max) + opzionale Codex/ChatGPT Pro decorrelato.
- **Bridge:** gemini-3.5-flash→deepseek-v4-flash→kimi-k2.6.

## 9. Aperti per Andrea (decisioni, in seduta desktop)
1. Quale account è 20× e quale 5× (per assegnare le sedute).
2. Nome repo per `studio`→GitHub (`studio`/`maestro-studio`/`ardesia-studio`).
3. Ratifica delle forche Fase 3 (flagship tool-suggest, modello dati studente/GDPR, embedding-provider, contratto teacher-review).
4. ChatGPT Pro sì/no (solo se userai Codex per review decorrelata).

## 10. Prompt nuova sessione (incolla per ripartire)
> Riprendi ARDESIA (ex-MAESTRO). Leggi `~/ARDESIA-VAULT/00-PIANO-MAXDEV-2026-06-15.md` + memoria `ardesia-audit-headless-cutover-15jun`. Stato: engine lessonos gate 1780/0 (M0-M4 a codice, GitHub stale dal 06-06 → Mini=verità); studio lavagna+ToolHost+ELAB-plugin. Regole: **loop=solo API cheap (DeepSeek-V4/Kimi/Gemini-API), Claude=solo desktop con me presente**; antiregressione totale (gate+CI+branch-protection+ratchet); 3 attori loop/Telegram/Claude-desktop sincronizzati via COORDINATION+gate+branch; dev=any-model, GDPR=solo-runtime. Prima mossa: Fase 0 (reconcile docs + ripristina push GitHub + studio→GitHub + strip Claude-headless). Onestà brutale, niente compiacenza, niente startup/milioni, mai "Numeria", mai toccare eval/gate.sh.
