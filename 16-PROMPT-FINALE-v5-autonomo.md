---
tipo: prompt-ripartenza
versione: v5 FINALE (autonomo, tutta la notte)
data: 2026-06-17
supersede: 12-v3, 15-v4
incolla-per: far ripartire ARDESIA in autonomia, parallelo su tutto, tutta la notte
---
# ARDESIA — PROMPT RIPARTENZA v5 FINALE  `/ultrathink:ultrathink`  `/using-superpowers`

## MANDATO NOTTURNO (esplicito)
- **VAI AVANTI SENZA FARE DOMANDE.** Decidi col tuo giudizio, agisci, documenta. Niente domande ad Andrea durante la notte.
- **FAI PARTIRE TUTTO**: loop Hermes a PIENO RITMO + le **2 cron-routine auto-miglioranti** (research + control/meta-dev) + il closed-loop ROI auto-migliorante.
- **SESSIONE PARALLELA TUTTA LA NOTTE + DOPPIO CRON.**
- **Hermes a pieno ritmo = sessioni maratona ~40 min** (NON bursts da 20): concatena task (una context-window per task, regola Ralph), FT/timeout adeguati, tutta la notte. Imposta i parametri se servono.
- **DOCUMENTA TUTTO**: STATUS.md, log.jsonl, COORDINATION, vault Obsidian, memoria SoT, digest TG. Ogni decisione tracciata con la prova.
- **Sistema PROATTIVO**: usa al meglio CIO CHE E GIA FATTO (non ricostruire), proponi e agisci.
- **LIMITI che restano (onestà scientifica, NON sono "domande" — sono guardrail):** MAI auto-merge a `main`; antiregressione totale (gate frozen + ratchet + CI affected + branch-protection + canary); **deploy in PRODUZIONE solo con OK Andrea**; rispetta il cap-$ LiteLLM; PII fuori dai nodi-agente. L'autonomia e nel COSTRUIRE+committare-a-`auto/main`+auto-migliorare, NON nel deployare-prod ne nel fare azioni irreversibili/outward (monorepo-bootstrap-location, OAuth, prod-deploy) → quelle si LASCIANO in coda documentate per Andrea, NON si bloccano la notte, NON si fanno alla cieca.

## 🟥 MAI DIMENTICARE (stampato in memoria)
- **Il moat «book-fidelity (circuiti identici ai libri) + GDPR-minori + MePA/PNRR + filiera-editori (Omaric/Fagherazzi/Arduino), guida-con-quelli-NON-col-marketplace, blocca-relazioni-editori» = MOTTO/MOAT del PLUGIN ELAB-tutor, NON di tutto il progetto ARDESIA.**
- **ARDESIA = la PIATTAFORMA** (lavagna unica + ecosistema plugin-LEGO + AI-method-graph lessonos + marketplace); moat-piattaforma = (1) GDPR-local-first by-architecture [reale], (2) workflow-docente tutor-first [reale], (3) method-graph per-docente [aspirazionale = priorita di costruzione, oggi rado], (4) ecosystem [late]. L'architettura lavagna+plugin = ABILITATORE, NON moat (copiabile 6-18mesi).
- **FABBRICA vs PRODOTTO**: FABBRICA = sistema di sviluppo (loop+crons+gate+bridge+Obsidian-spec, NON spedita); PRODOTTO = lavagna+engine+ToolHost+plugin-SDK+CRM+grafo+recensioni (GDPR runtime SOLO qui, no PII nei nodi-agente). Mai confonderle.
- **NUMERIA = a parte, NON guardare/toccare ora.** Mai confondere ARDESIA/ELAB/NUMERIA.

## Regole ferree
Andrea = UNICO dev, reputazione sua. Massima ONESTA e oggettivita scientifica, NON compiacere mai, **verifica i claim a `file:riga`**, criteri di successo FALSIFICABILI, risultato-negativo onesto ACCETTABILE (non forzare). Niente dati finti/mock. **Niente Workflow-background (muoiono al resume) → SINCRONO (Agent foreground).**

## Modelli (policy corretta 17/06)
- **`claude -p` = SOLO `claude-opus-4-8` ULTRACODE** (NIENTE fallback sonnet; 2 Max a turno, salta l'account interattivo di Andrea).
- **Grind cheap = DeepSeek-V4-Pro + Kimi-2.7** via LiteLLM capped (review codex→kimi; adversarial kimi).
- **GLM-5.2 = TRIAL DOMANI.** fable-5 SOSPESO.
- ⚠️ Runtime ANCORA su config vecchia (route.sh opus→sonnet; LiteLLM deepseek-chat/kimi-k2; hermes deepseek-reasoner) → **STEP-0 stanotte: verifica id-API esatti DeepSeek-V4-Pro+Kimi-2.7, aggiorna `~/litellm/config.yaml`+`route.sh`(togli sonnet)+`~/.hermes/config.yaml`, restart+test atomico.**

## PRIMA DI TUTTO
1. Memoria: `MEMORY.md` (invariante in cima) + `ardesia-audit-headless-cutover-15jun.md` (SoT) + `maestro-loop-operativo.md`.
2. Vault: `14-ELAB-PLUGIN-LAVAGNA-spec-competitive`, `13-AUTOMIGLIORAMENTO-BRAINSTORM`, `08-FUNZIONALITA-E-ARCHITETTURA-PARALLELE`, `02-METAPIANO`, `11-ARCH-fabbrica-autonoma`, `_status/litellm-keystone`.
3. PDF: `_inbox/01-specifiche-funzionali.pdf` (RF A-L, SDK §6, dati §5; NO-fee lezioni).
4. Live (RI-verifica, non assumere): `ssh macmini`; `python3 ~/maestro-tools/factory-metrics.py --digest` (KPI); `ssh macmini gh ...` (canale GitHub autenticato); `~/litellm/spend-report.sh`.

## ✅ FATTO + DURABILE 16/06 (su GitHub, NON rifare)
factory-metrics+cost+digest-TG (ardesia-tools `6e2efb6`); cap-fix `cc59677` (conta build veri) + deadman BUILD-STARVATION `a141ea3` (= 2 bug root-cause stallo-3g CHIUSI); RunAtLoad tick `4abb7fa` (post-reboot kickstart se serve); GS-1 (betweenness, 5 commit) + GS-2 `7499b57` (fuzzy zero-falsi, densificazione MARGINALE 32→33 onesta); canale GitHub via Mini-gh; brainstorm `659b9d9` + spec-ELAB `49c05d7/94ef85f` + questo v5.

## DA FARE STANOTTE (autonomo, ordine, SENZA chiedere)
0. **Policy-modelli runtime** (step-0 sopra): opus-only + DeepSeek-V4-Pro + Kimi-2.7.
1. **Hermes pieno-ritmo 40min** (FT/maratona params) + loop attivo tutta la notte.
2. **Triage CRITICO `205dd8a`** su GS-2 (probabile FP; verifica a file:riga, chiudi onestamente).
3. **Fix gridlock**: autoheal marca `[PIN-DONE]` su blocked/noop di pin-gia-chiuso (Hermes-lane) → niente piu thrash.
4. **Deploy le 2 CRON-ROUTINE auto-miglioranti** (launchd-Mini, account-isolato dall'interattivo, PROPONENTI non esecutori — scrivono vault/COORD, il loop esegue sotto gate):
   - **RESEARCH-cron** (~3-6h): cheap scansiona arxiv/GitHub/dominio → note `_agent-out/` + candidati `[AUTO-OK]`/skill-patch (ratifica via gate, mai auto-merge).
   - **CONTROL/META-DEV-cron** (orario): legge factory-metrics/deadman/spend/COORD → auto-heal (ruota pin, refill coda, escala TG) + propone trim-prompt/skill-fix/route come PR gated. NON merge, NON tocca gate/cap/deadman.
5. **Closed-loop ROI auto-migliorante**: instrumenta ogni build → meta-agente propone 1 cambio max-ROI → canary+gate+MISURA → keep/revert (KPI: $/task↓, regression-rate↓). Ogni bug-class confermata → un gate frozen O una skill (chiudi la classe).
6. **Code piene per le lane** (pin via ROADMAP-AUTO):
   - ENGINE (lessonos): **GS-3 method-graph UPSTREAM** (ingest LLM canonicalizza nomi-prereq a concetti ESISTENTI, o embedding-semantico — string-match e MORTO: GS-1 no-op, GS-2 +1) = costruisce il moat-piattaforma liv.3; poi CRM-primitives, retrieval-hybrid M7.
   - STUDIO: plugin-SDK = **Layer-0 contratti** (sblocca il parallelo) + ToolHost + plugins/elab; verifica su cosa e costruito il canvas (Konva/Excalidraw/custom; tldraw=evita $6k+kill-switch).
   - PLUGIN ELAB-tutor (moat=contenuto+editori): build-on **avr8js+wokwi-elements (MIT)**; **breadboard+analog+layout-LIBRI = costruire noi** (nessuna lib MIT, riusa netlist union-find SIM-C); pilota 1 esperimento book-accurate end-to-end.
   - COMMERCE (dopo wedge/parallelo se WTP): identity/booking/web/payments(NO-fee)/video/notify/admin, GDPR-local-first.
7. **mossa #2 LiteLLM cutover** completa (Hermes/review/adversarial → gateway capped, opus resta diretto).

## LAVORO PARALLELO SU TUTTO (modello)
Il LOOP autonomo macina ENGINE+STUDIO sotto gate (maratona 40min, code piene allineate alla visione); le 2 CRON coprono research+control/meta-dev; il closed-loop ROI auto-migliora prompt/skill/route sotto canary. **Contratti Layer-0 PRIMA** (`packages/contracts`+`plugin-sdk`+ToolHost+`ui`+auth/consenso-minori) → 3 lane parallele ENGINE/STUDIO/COMMERCE (1 package=1 worktree=1 gate). **Monorepo `ardesia` Nx = da bootstrappare → LASCIA in coda per Andrea** (dove + forche GDPR/dati), NON deciderlo da solo. Antiregressione totale, MAI auto-merge, deploy-prod solo OK Andrea. Telegram = control-plane (stato/coda/pin/modello/foto) — usalo per documentare i progressi notturni ad Andrea.

## Memoria / architettura
agentmemory = memoria FABBRICA (ri-popola da import → distilla via LLM capped); mem0 = PRODOTTO (da deployare). claude-mem degradato (no SPOF). Aggiorna SEMPRE SoT + vault + digest TG ad ogni milestone.

## Connettori e strumenti (RICORDALI — usa il tool giusto per ogni task)
- **GitHub — connessione + UTILIZZO VERO**: `gh` AUTENTICATO sul Mini (scopes repo/workflow/read:org/gist) → `ssh macmini gh ...`. Usa GitHub DAVVERO, non solo push: **Issues** (traccia backlog/bug/decisioni notturne), **PR** (ogni cambio gated = branch+PR, MAI auto-merge), **Actions/CI** (leggi/triggera workflow), **release/tag**, **branch-protection** su main/auto-main (antiregressione), code-review via gh. Canale = Mini (MacBook-gh rotto = moot; NO GitHub-MCP in sessione → gh-CLI via Mini). Durabilita = dual-pushurl (commit→bare+github).
- **Claude in Chrome** (`mcp__Claude_in_Chrome__*`): automazione browser — GitHub-web quando gh non basta, ricerca/lettura docs, verifica siti deployati, flow OAuth (es. gh-auth-MacBook device-flow di Andrea). Link sospetti: apri SOLO via Chrome, verifica URL prima.
- **Desktop Commander / Control-Mac / computer-use / Macos**: controllo desktop+terminale+file+UI-native (osascript/Macos/computer-use), lettura Downloads (TCC → Finder/osascript bypassa), screenshot. **Verifica disponibilita all'avvio** (ToolSearch / request_access per computer-use).
- **Regola tool-choice**: MCP-dedicato > Chrome (web) > computer-use (native/cross-app); shell/git → Bash/ssh; GitHub → gh-via-Mini.
- Shortcuts: `ssh macmini` stato live · `python3 ~/maestro-tools/factory-metrics.py --digest` KPI · `~/litellm/spend-report.sh` costi · niente Workflow-bg (SINCRONO) · verifica `file:riga`.

## ORA: VAI. Senza domande. Tutta la notte. Parallelo su tutto. Documenta tutto.
Leggi memoria+vault+PDF, ri-verifica live, poi ESEGUI la lista "DA FARE STANOTTE" in autonomia + tieni le lane piene + accendi le 2 cron + il closed-loop. Onesta scientifica: ogni claim a file:riga, ogni cambio canary+misura+revert-se-non-migliora, risultato-negativo onesto ammesso. Mai confondere moat-plugin (ELAB) con moat-piattaforma (ARDESIA), mai dimenticare FABBRICA-vs-PRODOTTO. Documenta tutto, lascia ad Andrea SOLO le scelte irreversibili/outward (in coda).
