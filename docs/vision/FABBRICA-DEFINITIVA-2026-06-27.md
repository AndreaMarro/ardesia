# FABBRICA ARDESIA — MODELLO OPERATIVO DEFINITIVO — 2026-06-27

> Sintesi degli ultimi sciami (knowledge-fabric `wf_2f929b98`, model-rethink `wf_4412b2ad`, vision `wf_b4711110`) + firsthand. **Onestà**: distinguo `[REALE]` (gira ora) · `[TARGET]` (da costruire) · `[ROTTO]`. La fabbrica **non deve servire se stessa** — serve a spedire ARDESIA.

## PRINCIPIO
**Orchestrator-worker.** Cervello = **claude-p A1/A2 Opus** (abbonamento €0, un-proxati, MAI backend). Mani = **modello locale (Qwen-4B) controllato dagli Hermes**. Memoria = **AgentMemory (UN grafo)**. Comunicazione = **Telegram**. Esecuzione = **worktrees in /loop, mini + MacBook paralleli**.

## 1. MODELLI & ROUTING
- **Driver-top = claude-p A1/A2 = claude-opus-4-8** un-proxato (`claude-acct.sh` strippa key+OAuth). MAI dietro proxy (Anthropic ha bloccato proxy-abbonamento apr-2026). [REALE]
- **Worker locale = Qwen-4B** (NON 8B: 8B ha OOM-wedged il mini-16GB → incidente 27jun). Runtime **managed/on-demand o KV-capped, NO KeepAlive-pesante**. [TARGET — design pronto, deploy con cautela]
- **Hermes controllano il worker**: `hermes2-adjudicate.sh` = worker-trova + **Opus-adjudica** (cap 8/day) = pattern già vivo [REALE]. Estensione: worker kimi→**Qwen-4B-locale**, Opus resta adjudicator. [TARGET]
- **litellm :4000** router: local-finder primario + **OpenRouter OPZIONALE** (oggi 402 crediti-finiti → o ricarichi o resti solo-locale). Fallback-group local→gemini per degrade. [REALE router / TARGET wiring-locale]
- **Vincolo RAM** (lezione incidente): mini 16GB/13.3 wired, tutor 3.6GB co-residente → worker ≤4.5GB, **mai daemon-pesante-permanente**, KV-cap, health-cooldown. Budget **enforcement** (oggi detect-only $3.99>$3.3 → aggiungere consumer di `.litellm_budget_tripped`→STOP). [ROTTO→TARGET]

## 2. GRAFI = KNOWLEDGE DI PROGETTO (one-graph-two-views)
- **UN solo grafo vivo = AgentMemory :3111** (iii engine, 696 mem; proiezione-grafo 43n/0e da ricostruire; consolidate ri-armato post-reboot). NON store paralleli. [REALE store / TARGET proiezione]
- **Graphify + Wiki = VISTE** sopra AgentMemory (markdown-wiki Karpathy-pattern su `~/factory-wiki` già esistente + graphify-render). **SKIP nashsu/llm_wiki** (Tauri-GUI, GPL-3.0, store-parallelo). [TARGET]
- **Distill**: oggi via Gemini (funziona, fermo dal 21jun→ri-armato). Upgrade a Qwen-locale-orchestrato-Opus = **REFUTED-come-low-debt** finché: alias no-think (Qwen reasoning→content:null), 4B-OOM-guard, fallback-group. Prerequisiti prima. [TARGET-gated]
- **ARDESIA funziona via grafi (modelli locali)**: il method-graph fonda il retrieval/grounding del prodotto; oggi inerte (1 lezione). Rinforzare dati = popolare il grafo. [TARGET]

## 3. ESECUZIONE PARALLELA
- **Worktrees**: già in uso (ardesia: wt-docs, wt-syncguard). Pattern: ogni builder-parallelo su un worktree isolato (no conflitti). [REALE pattern]
- **/loop**: il tick orario (`com.elab.lessonos-hourly`) è il driver. Per parallelo: più builder claude-p su worktree diversi, coordinati. [REALE base / TARGET fan-out]
- **mini + MacBook paralleli**: mini = build-host (modelli, daemon); MacBook = supervisor/verifier (vault, git, COV). Comunicano via `ssh macmini` + git + vault-Syncthing. NO federazione cross-machine magica — git/vault è il bus. [REALE]
- **Telegram** `com.maestro.tg-bridge` UP: canale "che ascolta". Bidirezionale-che-esegue-comandi-Andrea = **da verificare/rinforzare**. [REALE bridge / TARGET two-way-reale]

## 4. PERCHÉ "NON FUNZIONA DAVVERO" OGGI — i 4 colli
1. **Served↔github↔web disallineati**: served frozen, web 4/1224, lessonos+studio non-su-github. → la fabbrica macina ma l'utente non vede nulla.
2. **Finder locale instabile** (8B OOM) → fabbrica single-thread su Opus, fallback-cloud 402.
3. **Cost non-enforced** + **churn ~51% bookkeeping** (la fabbrica serve se stessa).
4. **Grafo prodotto inerte/non-misurato** + **0 spedito a un utente**.

## 5. BUILD-ORDER FABBRICA (per "funzionare davvero", sicuro)
1. **Allinea consegna**: porta lessonos+studio su github; ripara web-corpus (export 1224); served-SHA-gate. (sblocca: l'output diventa visibile)
2. **Stabilizza worker**: Qwen-4B managed (no-KeepAlive-pesante) + KV-cap + fallback-group → finder locale affidabile.
3. **Enforce cost**: consumer `.litellm_budget_tripped`→STOP.
4. **Grafo vivo**: ri-trigger consolidate AgentMemory → proiezione>0 → graphify-vista.
5. **Telegram two-way reale** (esegue comandi, riporta stato).
6. **Anti-churn**: la fabbrica costruisce SOLO feature-prodotto (no bookkeeping); ogni tick = avanzamento-utente o blocker-con-evidenza.

> **Regola d'oro**: la fabbrica è VALIDA solo se ogni ciclo avvicina **una cosa che un utente usa**. Altrimenti è churn.
