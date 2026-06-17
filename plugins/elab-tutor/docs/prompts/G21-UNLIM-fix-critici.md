# G21 — UNLIM FIX CRITICI

Esegui il piano in `docs/plans/2026-03-29-volume-sections-and-roadmap.md` — sessione G21.

## CONTESTO RAPIDO
- G20: audit brutale con 3 agenti. Score composito 6.2/10.
- UNLIM interazione: 3/10. Il problema #1 del prodotto.
- Build PASSA, 911/911 test, deploy Vercel LIVE.
- UNLIM risponde 419 parole (target 60). Click mascotte = analisi auto non richiesta.

## OBIETTIVO G21
UNLIM passa da 3/10 a 7/10. 4 fix critici in una sessione.

## TASK (in ordine)

### Task 1: Prompt nanobot max 60 parole (2h)
- Leggere i prompt attuali del nanobot (cercare in src/services/api.js i system prompt)
- Aggiungere regola: "MASSIMO 3 frasi + 1 analogia. Mai superare 60 parole. Se la risposta e' piu lunga, taglia."
- Testare con 5 domande diverse nel browser
- Contare le parole di ogni risposta con JavaScript

### Task 2: Click mascotte = input bar (4h)
- Leggere src/components/unlim/UnlimWrapper.jsx — capire cosa succede al click mascotte
- CAMBIARE: click mascotte apre/chiude la barra input (UnlimInputBar) — NON fa analisi automatica
- L'analisi immagine deve partire SOLO se il docente scrive "analizza" o "cosa vedi"
- Testare: click mascotte → barra input visibile con cursore attivo

### Task 3: Renderizzare markdown (2h)
- Trovare dove le risposte AI vengono renderizzate (ChatOverlay o UnlimOverlay)
- Usare un renderer markdown leggero (react-markdown o parser custom)
- Verificare: `**grassetto**` → **grassetto** (non raw `**`)
- NON aggiungere dipendenze pesanti (react-markdown e' ~50KB — valutare)

### Task 4: Vocabolario forbidden nel prompt (4h)
- Leggere il lesson path JSON dell'esperimento corrente (getLessonPath)
- Estrarre `vocabulary.forbidden`
- Iniettare nel system prompt: "NON usare MAI queste parole: [lista]"
- Testare: esperimento v1-cap6-esp1, chiedere "cos'e' una resistenza?" → UNLIM NON deve usare "ohm"

## VERIFICA 8 STRATI CoV
1. Build & Test Gate: `npm run build && npx vitest run`
2. Browser: click mascotte → input bar (non analisi)
3. Browser: risposta UNLIM < 60 parole (contare con JS: `text.split(/\s+/).length`)
4. Browser: markdown renderizzato (no `**` visibili)
5. Browser: chiedere "cos'e' una resistenza?" a Cap 6 → UNLIM non usa "ohm"
6. Code audit: grep `forbidden` nel contesto AI
7. LIM 1024x768: risposta leggibile (preview_resize)
8. Prof.ssa Rossi: clicca UNLIM, capisce cosa fare?

## 5 QUALITY AUDIT GATE
- #1: Post-fix UNLIM (< 60 parole verificato su 5 risposte)
- #2: Vocabolario (3 test forbidden terms — tutti passano)
- #3: Markdown (0 raw `**` visibili in 5 risposte)
- #4: Pre-deploy (build + test PASS)
- #5: Post-deploy (sito live verificato)

## REGOLE
- ZERO REGRESSIONI: `npm run build + npx vitest run` dopo ogni modifica
- Non toccare engine/ (CircuitSolver, AVRBridge, avrWorker)
- Linguaggio 10-14 anni in ogni testo visibile
- UNLIM e' un AGENTE. ELAB Tutor e' la piattaforma.
- Test mentale: "La Prof.ssa Rossi capirebbe in 5 secondi?"
