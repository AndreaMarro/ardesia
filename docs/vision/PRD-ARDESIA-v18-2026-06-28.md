# PRD ARDESIA — v18 — 2026-06-28

> Aggiorna v17. Profondità completa in `ARDESIA-VISIONE-TOTALE-2026-06-27.md` (fonte-di-verità). Questo = PRD formale sintetico + delta-stato. `[DECISO]`/`[APERTO]`/`[SPEDITO]`/`[GREENFIELD]`.

## 1. Prodotto (1 frase)
ARDESIA = **OS didattico local-first: una canvas/lavagna infinita per prendere appunti, per CHIUNQUE**, plugin-native (monta plugin firmati come tile), dove materiali/lezioni/errori sedimentano in un grafo del metodo; gli account docente sbloccano vendita/visibilità/potenza su un marketplace. `[DECISO]`

## 2. Utenti & tier
- **Base (gratis, TUTTI)**: studenti, tutor, chi prende appunti → la canvas + plugin gratuiti. `[DECISO]`
- **Pro / Docente (opzionale, a pagamento)**: vendita contenuti/plugin, **più potenza/API**, **visibilità** sul marketplace. `[DECISO, provvisorio — non blindare arch su B]`
- Minore <14 + tutore = protezione rinforzata, no-PII-egress, teacher-in-control (AI suggerisce, mai auto-corregge/insegna, no-training-sui-dati). `[DECISO]`

## 3. Architettura a strati `[DECISO]`
```
L0  ARDESIA host/OS = CANVAS                      [SPEDITO: ardesia-lavagna]
L1  PLUGIN (tile via ToolHost/renderEmbeddable):
      • Simulatore = plugin GENERICO professionale [IN CORSO: simulatore-pro]
      • ELAB = Pack-contenuti che USA il simulatore [GREENFIELD: estrazione]
      • ∞ altri (6 plugin demo già spediti)
L2  ACCOUNT  anon → docente                        [GREENFIELD]
L3  MARKETPLACE  publish/discover/buy + payments   [GREENFIELD]
```
ELAB **non è** il prodotto né il simulatore: è contenuto sopra un simulatore generico (non incollato).

## 4. Requisiti funzionali
- **R1 Canvas** [SPEDITO]: infinita, penna/evid/gomma/testo/zoom/pan/undo/save/export; persistenza locale; export lezione `.ardesia.json` (seme `.ardz`).
- **R2 Plugin-host** [SPEDITO base]: ToolHost (iframe + JSON-RPC2.0 + manifest Zod, handshake nonce→bearer, caps deny-default board.*/storage.*); plugin = single-file (gotcha opaque-origin: module-script CORS-fetched → blocca iframe sandbox; build inline). 6 plugin demo (LED/conta-tratti/nota/grafico/resistenze/**Arduino-Blockly**).
- **R3 Simulatore PRO generico** [IN CORSO]: più avanzato/editabile di elab-tutor; riusa **avr8js(MIT)** + **@wokwi/elements(MIT)** + **CircuitSolver-in-casa MNA (no-GPL)**; **F0 = pacchettizza la pipeline R4 ESISTENTE di `elab-builder`** (compileNanoR4→arduino-cli renesas; **upload WebUSB-DFU** `webDfuFlash.js`; Blockly→C++; validatori geometry/pin/physics) come plugin-compile a sé. **Nano R4 = Renesas RA4M1 (NON AVR)**. Piano: `ardesia-lavagna/docs/SIMULATOR-PLUGIN-PLAN.md`.
- **R4 Board-citation / manuali-vivi** [PARZIALE→GREENFIELD]: manuale/PDF → citazione → oggetto sulla canvas; data-model Core mancante.
- **R5 Student-pack** [v0.1]: export PDF/PNG + manifest; v0.2 = board+plugin-state, schema `.ardz`.
- **R6 Method-graph / moat** [PARZIALE]: il grafo fonda grounding/retrieval; oggi inerte (1 lezione) + da misurare gold-blind.
- **R7 Account+Marketplace** [GREENFIELD]: anon→docente, publish/sell, payments/KYC.
- **R8 Integrazione** [SPEC]: 1 MCP server (Claude/ChatGPT-Apps/Gemini) + nanobot key-swap.

## 5. Non-goals (v18)
Auto-grading · training sui dati studente · PII-egress · multi-app-ELAB-dentro-ARDESIA · pagamenti/marketplace-live (prima il prodotto base usabile).

## 6. Metriche di successo
- **Nord**: ≥1 persona reale usa la canvas (apre URL, prende appunti, riusa). Oggi: **0 utenti reali** (pattern churn da rompere).
- Canvas pubblica usabile · ≥1 plugin reale ospitato [SPEDITO Arduino] · simulatore-pro che compila+flasha un R4 reale · grafo che cresce (nodi↑) · costo<soglia.

## 7. Stato fabbrica (28giu) `[V]`
Fabbrica viva ma: **AgentMemory VUOTO (regressione 696→0, fixare PRIMA)** · A1/A2 Opus OUT (usage→29giu) · Hermes/finder 402/OFF · served frozen · web corpus disallineato. Fabbrica tende a **churn** (~51% bookkeeping) → puntarla al PRODOTTO.

## 8. Roadmap (stage, uno per volta)
1. [FATTO] Canvas + plugin-host + 6 plugin (ardesia-lavagna).
2. [ORA] **Simulatore-PRO** (F0 pacchettizza pipeline R4 esistente → plugin-compile montato).
3. ELAB = pack sopra il simulatore.
4. Account anon→docente.
5. Marketplace + payments.
- Parallelo fabbrica: fixa AgentMemory · finder-Qwen-4B · cost-enforce · grafo-vivo · Telegram-two-way.

## 9. Decisioni-aperte
pubblico-breadth(confermato A+B-provvisorio) · pricing · payments/KYC-provider · ELAB-extraction · moat-misura · promote-prod (gate, =primo-utente). Tool/abbonamenti: Fugu=già-base · Sakana=no-ora · ChatGPT-Pro/Codex=no-ora · GLM/DeepSeek=worker-cloud-opzionale-dopo-Qwen-locale.
