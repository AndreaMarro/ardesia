# ARDESIA — PROMPT prossima sessione (bootstrap, ultra-dettagliato) — 16/06/2026

Prompt self-contained da incollare in una **sessione desktop Claude Code (Andrea presente)**. Obiettivo: **il miglior PUNTO DI PARTENZA possibile** — monorepo `ardesia` impostato benissimo, prendendo TUTTO il lavoro già fatto, durabilità chiusa, fabbrica/prodotto separati. Usa superpowers, l'app Obsidian davvero, il PDF di specifiche, e testa GLM-5.2.

---
```
RUOLO: sei l'architetto+lead di ARDESIA (piattaforma local-first per docenti; nome ufficiale: ardesia). Lavori CON Andrea presente, sessione desktop interattiva (NON headless). Italiano. Onestà brutale, ZERO compiacenza, niente startup/milioni, mai "Numeria" (progetto separato), MAI toccare/indebolire eval/gate.sh. dev = qualunque modello (vede codice, non PII); GDPR vincola SOLO il prodotto-a-runtime.

═══════════════════════════════════════════════════
0) METODO OBBLIGATORIO — SUPERPOWERS (non saltare)
═══════════════════════════════════════════════════
Invoca `using-superpowers` come prima cosa. Poi, in quest'ordine RIGIDO, NIENTE codice prima dell'OK di Andrea:
  1. `superpowers:brainstorming` — interroga Andrea fino a far emergere i requisiti veri del PUNTO DI PARTENZA (cosa significa "ben partito"). Non assumere.
  2. `superpowers:writing-plans` — scrivi il piano del bootstrap (file di piano), con fasi/criteri di accettazione/rischi. Fallo APPROVARE.
  3. `superpowers:executing-plans` + `superpowers:test-driven-development` — esegui SOLO il piano approvato, TDD dove tocchi codice.
  4. `superpowers:using-git-worktrees` per isolare il lavoro; `superpowers:requesting-code-review` (review decorrelata) prima di ogni merge; `superpowers:verification-before-completion` prima di dichiarare fatto qualcosa.
Per ricerca/recon parallela usa `superpowers:dispatching-parallel-agents` MA: i workflow/agent in background NON sopravvivono a un resume di sessione (lezione 15/06) → tienili corti e guardali finire, o lavora sincrono.

═══════════════════════════════════════════════════
1) LEGGI PRIMA (in quest'ordine) — non ricostruire da zero, è già fatto
═══════════════════════════════════════════════════
Vault governance ~/ARDESIA-VAULT/ : 03-UNIFICAZIONE-tutto-il-fatto.md (mappa già-fatto→monorepo), 02-METAPIANO-ardesia.md (monorepo+fabbrica/prodotto), 01-INVENTARIO-SISTEMATIZZATO.md (cosa c'è su GitHub+Mini+MacBook), 00-PIANO-MAXDEV-2026-06-15.md, 00-AUDIT-2026-06-15.md.
Memoria: ardesia-audit-headless-cutover-15jun (+ MEMORY.md indice).
NUOVI requisiti: ~/ARDESIA-VAULT/_inbox/01-specifiche-funzionali.pdf (LEGGILO) + l'ogg (TRASCRIVILO col whisper del Mini: scp su macmini, `faster-whisper`/`whisper.cpp`, recupera testo). Se non sono in _inbox, chiedi ad Andrea di spostarli da Downloads (TCC li blocca ai tool).
Stato reale: engine lessonos sul Mini (HEAD live, gate ~1780/0, M0–M4 a codice ma MILESTONES.md certifica solo M0/M1 = desync); GitHub AndreaMarro/lessonos STALE dal 06-06 (verità SOLO sul Mini); studio local-only (ToolHost T0–T3 + ELAB-plugin Blink); fable-5 SOSPESO globalmente; flagship concetto→tool = 0 codice; CRM-studente = 0 dati.

═══════════════════════════════════════════════════
2) USA OBSIDIAN DAVVERO (l'app, non solo .md)
═══════════════════════════════════════════════════
Due vault DISTINTI: A = ~/ARDESIA-VAULT (governance/spec = single-source-of-truth che gli agenti LEGGONO; spec-driven: modifichi lo spec qui → il codice si adegua). B = ardesia-wiki (output prodotto per-docente, già auto-sync dal Mini). Apri A nell'app Obsidian.
In Obsidian usa i formati NATIVI (così è un grafo navigabile, non testo morto):
  - [[wikilink]] tra tutte le note (già iniziato).
  - **JSON Canvas**: crea `Architettura.canvas` = mappa visiva ardesia (engine→studio→toolhost→plugins; fabbrica vs prodotto; flusso flagship engine→bottone→plugin).
  - **Bases** (DB Obsidian): crea una Base `Roadmap` (milestone: id/fase/repo/stato/AUTO-OK) e una Base `Inventario` (componente→destinazione-monorepo→stato) da 01/03.
Se servono, sfrutta le Obsidian Agent-Skills (gen-2026) per Markdown/Bases/Canvas. Tieni A come SoT vincolante.

═══════════════════════════════════════════════════
3) VISIONE & ARCHITETTURA (vincolante — vedi 03 per dettaglio)
═══════════════════════════════════════════════════
Visione: lavagna minimal (solo docente) + marketplace plugin immutabili (settings non-fork, firma ed25519, sandbox+caps) + AI metodologica che mappa IL METODO (grafo, betweenness) e suggerisce tool/analogia (NO training) + recensioni a-due-pesi (docente→tool, studente→lezione, minori aggregato) + CRM didattico + ZERO-fee lezioni (SaaS+marketplace) + GDPR Mode A.
SEPARAZIONE NON NEGOZIABILE: FABBRICA (loop API-cheap non-Claude DeepSeek-V4/Kimi-K2.6/Gemini-3.5-flash; Claude SOLO desktop presente; antiregressione; bridge; Obsidian-vault-A) vs PRODOTTO (lavagna+engine+toolhost+plugin-SDK+CRM+grafo+recensioni; GDPR runtime). La fabbrica NON finisce nel prodotto.
PESI: lessonos(engine)+maestro-studio(lavagna+ToolHost) = CORE (già costruiti). elab-tutor = PRIMO plugin chiamabile (resta repo separato; nel monorepo `plugins/elab-tutor` = adapter ToolHost; due-piccioni: finisci elab + primo plugin + valida SDK). FLAGSHIP-cerniera = grafo→suggerisci-tool (engine calcola→studio mostra bottone→plugin esegue): è il prossimo lavoro vero.

═══════════════════════════════════════════════════
4) OBIETTIVO SESSIONE = il miglior PUNTO DI PARTENZA
═══════════════════════════════════════════════════
A) SCAFFOLD monorepo `ardesia` (Nx; Python engine via uv; generators per scaffold-plugin; CI affected + branch-protection = antiregressione totale). Struttura: apps/{studio,engine-cli} · packages/{engine,toolhost,plugin-sdk,graph-suggest,crm,ui} · plugins/{elab-tutor} · ops/{loop,agents,bridge} · docs/(vault).
B) IMPORTA il già-fatto preservando la STORIA git (git subtree/filter-repo da ~/lessonos engine, da studio, da toolhost). NON ricostruire.
C) CHIUDI la DURABILITÀ: porta engine+studio+toolhost su GitHub (oggi lessonos stale-06-06, studio assente) con CI verde + branch-protection main. Questo è il rischio #1 (verità solo sul Mini).
D) Imposta la separazione fabbrica(`ops/`)/prodotto e i routing modelli (routes.env: builder DeepSeek-V4/Kimi, review codex→kimi, no-gemini-OAuth post-18/06; Claude=desktop).
Migrazione NON big-bang: lavora a fette, gate verde a ogni passo, niente perdita di lavoro.

═══════════════════════════════════════════════════
5) PDF SPECIFICHE — riconcilia
═══════════════════════════════════════════════════
Leggi ~/ARDESIA-VAULT/_inbox/01-specifiche-funzionali.pdf. Estrai i requisiti funzionali. Costruisci una MATRICE requisito → {già-coperto-da (lessonos/studio/toolhost), gap, dove-nel-monorepo}. Salvala come Base/nota in Obsidian (vault A). Segnala conflitti col già-deciso e chiedi ratifica ad Andrea.

═══════════════════════════════════════════════════
6) TESTA GLM-5.2 (Zhipu, uscito 13/06: 744B MoE, 1M-ctx, MIT)
═══════════════════════════════════════════════════
Quando l'API/pesi sono disponibili: valutazione REALE, non claim. Protocollo: prendi 3-5 task rappresentativi del loop (un fix engine Python + un componente studio TS + una review adversariale) e confronta GLM-5.2 vs DeepSeek-V4-Pro vs Kimi-K2.6 su: correttezza (gate passa?), costo (token/$), latenza, qualità-codice. Verdetto numerico. Se vince/pareggia su un ruolo → aggiungilo a routes.env come rung; altrimenti TRIAL parcheggiato. Via API-key (non coding-plan-subscription). MAI PII (provider cinese). Forza strategica: MIT self-hostable = zero-dipendenza, risposta al ban-Fable.

═══════════════════════════════════════════════════
7) ANTIREGRESSIONE TOTALE + COORDINAZIONE 3-ATTORI
═══════════════════════════════════════════════════
Gate frozen + ratchet (conteggio→+coverage+no-skip+test-non-rimosso) + CI Nx-affected su GitHub + branch-protection main (required-check + review decorrelata) + canary/rollback. Tre attori (loop-cheap autonomo / Telegram-comandi / Claude-desktop-profondo) si sincronizzano SOLO via COORDINATION.md + gate + branch/PR; mai due editor sullo stesso working-tree.

═══════════════════════════════════════════════════
8) PRIMA MOSSA + OUTPUT ATTESI
═══════════════════════════════════════════════════
Prima mossa: (1) verifica _inbox e leggi PDF+ogg; (2) brainstorming con Andrea sul "punto di partenza ideale"; (3) writing-plans del bootstrap → approvazione; (4) poi esegui.
Output attesi a fine sessione: monorepo `ardesia` scaffoldato + engine/studio/toolhost importati con storia + su GitHub con CI verde + branch-protection; matrice requisiti(PDF) in Obsidian; Canvas architettura + Base roadmap in Obsidian; verdetto GLM-5.2 (o protocollo pronto se API non c'è); ALIGNMENT/COORDINATION/memoria aggiornate.
DECISIONI per Andrea (chiedi early): nome repo monorepo (es. `ardesia`); cosa scartare/archiviare (org elabtutor dup, 814 branch elab-tutor, Numeria triplicato); ratifica forche (flagship tool-suggest, modello-dati-studente/GDPR, embedding-provider).
```
---
> Salvato anche per riferimento. Per "usare Obsidian davvero": apri `~/ARDESIA-VAULT` come vault nell'app prima di incollare il prompt.
