# ARDESIA V1 — claim register

Snapshot: 2026-07-10 · base SHA `204ffefc`.

| ID | Claim | Stato | Evidenza | Confidenza / limite |
|---|---|---|---|---|
| C-001 | `AndreaMarro/ardesia` è la struttura canonica candidata | VERIFIED | remote + `docs/CANON-INDEX.md` | alta; behavior repo indicati dal canon possono essere superati |
| C-002 | `origin/main` osservato è `204ffefc` | VERIFIED | `git rev-parse origin/main` dopo fetch | alta; ultima verifica 2026-07-10 |
| C-003 | P31/P32 anchor esiste a `f6321975` | VERIFIED | ref locale/remoto e log commit | alta; non re-esegue i test storici |
| C-004 | PR #150 ha CI core verde | VERIFIED | GitHub check rollup sullo SHA PR | alta; non prova e2e/V1/deploy |
| C-005 | PR #150 è pronta al merge | RED | draft + titolo `e2e RED_BLOCKER` | alta |
| C-006 | Suite Vitest ≈1597 passa oggi | REPORTED | mandato/P32 | bassa finché non eseguita sullo SHA selezionato |
| C-007 | ToolHost è applicato a tutto il percorso prodotto | RED | audit P33: `ToolCanvasEmbeddable`/`Room` usano callback dirette | nessun claim fino a RPC/capability/audit reale |
| C-008 | Esiste un percorso LessonOS end-to-end | RED | log/graph locale presenti, sync backend e reidratazione reopen assenti | unit/event wiring non prova backend/graph/tutor |
| C-009 | Tinkercad parity | RED come claim globale | nessuna matrice completa | vietato pubblicizzarlo |
| C-010 | Un Certified LED Lesson Scenario esiste | REPORTED | P29/P30 docs e CI | deve passare book, pointer, reopen, tutor, deploy sullo stesso SHA |
| C-011 | Principio Zero autentico è recuperato | VERIFIED | `plugins/elab-tutor/CLAUDE.md:5-16` | alta; fonte canonica di progetto |
| C-012 | Backend/RLS/deploy sono verificati sullo SHA | RED come claim | nessun event-sync, policy/test RLS o deploy Studio legato a `204ffefc` | HTTP 200 o config non bastano |
| C-013 | Repository/prassi privi di segreti esposti | UNKNOWN / SECURITY HOLD | `V1-SECURITY-MATRIX.md`; nessun valore provider verificato | design client-secret RED, validità credential-like da verificare |
| C-014 | V1 è usabile in lezione | UNKNOWN | nessun test Andrea sul deploy osservato | claim vietato |
| C-015 | Gli `automa/ORDERS` del plugin sono tutti applicabili oggi | RED | ordini 2026-04-07 confliggono su priorità e operazioni Git | richiede riconciliazione umana; prevalgono guardrail correnti |
| C-016 | Il prompt runtime UNLIM rispetta il requisito verbatim/citazioni | RED | `src/services/api.js:126-127` contraddice `CLAUDE.md:11-15` | alta sul conflitto statico; comportamento end-to-end non rieseguito |
| C-017 | Il secret scan CI copre integralmente S-001/S-002 | RED / PARTIAL | S0 aggiunge ratchet per Google API key e JWT generici, ma non risolve i finding legacy allowlistati né il design client-side `VITE_*` | alta; non dichiarare sicurezza pulita |
| C-018 | La chiave privata ToolHost è assente da HEAD | VERIFIED | `f2fb36b2` ancestor; `keys.json` ha solo `pubkey` | alta per HEAD, history/rotazione ancora UNKNOWN |
| C-019 | Steps e mounted sono book-equivalent | RED come prova corrente | `simulationSceneModes.ts:57-83` usa un solo step finale sintetico | test attuale è tautologico, non prova sequenza editoriale |
| C-020 | Il Simulation Plugin attraversa ToolHost reale | RED | `ToolCanvasEmbeddable.tsx:1125-1174`, `Room.tsx:913-927` usano callback dirette | alta, audit statico + test gap |
| C-021 | LessonOS locale sincronizza backend e si reidrata al reopen | RED | API senza event sync; `lessonBundle.ts:47-56,137-192` conserva raw file senza import log | alta sullo SHA 204ffefc |
| C-022 | RLS tenant isolation è provata | UNKNOWN | nessuna migration/policy/test tenant-negative tracked | alta sulla mancanza di prova |
| C-023 | Deploy Studio corrisponde a `204ffefc` | RED come claim | CI ha `no-deploy-check`; Vercel map non lega live allo SHA | alta |
| C-024 | `BookCircuitSpec` è un tipo canonico esistente | RED | nessun simbolo/canon tracciato; modello corrente è `SimulationScene`/`ElabScene` | richiede ADR, non assunzione dal prompt |
| C-025 | S0 blocca nuovi `.env*`, Google API key e JWT generici in CI | GREEN_SLICE locale | branch `codex/v1-security-s0-20260710`: `git check-ignore -v`, `python3 bin/ci/test_secret_scan.py`, `python3 bin/ci/secret_scan.py`, synthetic repo leak test | non chiude i 23 finding legacy allowlistati, né i segreti client-side `VITE_*` |

Regola: aggiornare una riga solo con comando/test/URL e SHA; non cancellare
un RED storico, chiuderlo con nuova evidenza e data.

## Comandi di riproduzione

- C-002: `git rev-parse origin/main` dopo `git fetch --all --prune`.
- C-003/C-004: `git show f6321975`; `gh pr view 150 --json ...`.
- C-017: `python3 bin/ci/secret_scan.py`; `python3 bin/ci/test_secret_scan.py`;
  synthetic temp git repo leak test; `V1-SECURITY-MATRIX.md` S-001/S-002.
- C-018: `git merge-base --is-ancestor f2fb36b2 HEAD`; `jq keys apps/studio/sim/keys.json`.
- C-019–C-024: audit statico sul base SHA `204ffefc`; path/line nelle righe.
- C-025: `git check-ignore -v .env ...`, `python3 bin/ci/test_secret_scan.py`,
  `python3 bin/ci/secret_scan.py`, synthetic temp git repo with one unallowlisted
  Google-key-shaped value returning exit 1.

Ultima verifica di tutti i comandi sopra: 2026-07-10 Europe/Rome.
