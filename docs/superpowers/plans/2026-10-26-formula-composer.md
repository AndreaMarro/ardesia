# Formula composer Implementation Plan

> **For agentic workers:** execute with superpowers:executing-plans, task by task.

**Goal:** input matematico nativo con selezione, history e retry senza perdita.

**Architecture:** MathLive gestisce editing e tastiera; React gestisce la singola
richiesta asincrona. Room propaga il fallimento tramite patch applicata dal writer.

**Tech Stack:** React 19, TypeScript, MathLive 0.111.1 MIT, Vitest, Chromium.

**Spec:** ../specs/2026-10-26-formula-composer-design.md

## Global Constraints

- Nessuna nuova dipendenza; niente edit Room/latexToImage/Vite/font.
- RUNLOG/NEXT writer unico S00; handoff datato append-only.
- Browser/build/typecheck soltanto nella finestra coordinata.

## Review Focus

- Doppio clic prima del rerender: una sola richiesta.
- Rigetto asincrono: bozza conservata e retry possibile.
- Smontaggio durante pending: nessuna chiusura tardiva.
- Clipboard negata/assente: errore leggibile, formula conservata.
- Selezione/caret e history: template non sostituisce tutta l'espressione.

### Task 1: native composer e contratto del consumer

**Files:** MathComposer.tsx; formula-composer/MathComposer.integration.test.tsx;
handoffs/swarm-v2/S14/formula-composer/**; patch Room consegnata separatamente.

**Interfaces:** onInsert(latex: string): void | Promise<void>, resolve indica
inserimento riuscito; reject indica failure. Callback invariata.

- [x] Scrivere e osservare RED per pending, error/retry, unmount e clipboard.
- [x] Attivare insert/executeCommand/canUndo/canRedo nativi e cleanup listener.
- [x] Verificare GREEN mirato e produrre patch puntuale Room con controprova.
- [ ] Verificare typecheck, build, browser reale e round-trip con writer consumer.
- [x] Review separata, commit, draft PR, handoff e checkpoint GitHub306.

## Ledger

2026-10-26: esecuzione richiesta dall'utente con «continua»; scelte ordinarie
risolte nel perimetro autorizzato. S00 ha delegato il composer, preservando Room
S07. Il raccordo deve essere applicato dal writer prima di dichiarare DONE.

2026-10-26: review indipendente3P2 accettati; patch consumer su copie3RED→3GREEN. Browser inizialeFAIL conservato; claim modeLaTeX rettificato dopo rilettura del risultato. Aggiunto complete prima dei template, host15PASS. Raccordo sorgenteRoom non applicato; native controprova pendente.

2026-10-26: patch v3 con chiusura menu mobile; 4 controlli consumer RED→GREEN
su copie, 15 host PASS. Runner 12: 15 comportamenti nativi PASS, round-trip
reale incluso; ispezione screenshot trova pannello mobile tagliato, claim
scrollWidth insufficiente ritirato. Delta 5142865 nel namespace composer;
controprova layout pendente. Review/commit/draft PR318/handoff/306 eseguiti;
integrazione del writer Room e gate sul prodotto consolidato restano aperti.
