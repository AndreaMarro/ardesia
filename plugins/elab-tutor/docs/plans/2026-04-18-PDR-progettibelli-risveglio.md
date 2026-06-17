# PDR #2 — progettibelli-go "Risveglio + Macro-obiettivo"
## 18 aprile 2026 — Prompt dedicato per Claude Agent SDK headless

> **Contesto**: progettibelli-go è un agent con Claude Agent SDK che ha pushato 27 PR sul repo `elabtutor` tra 8-11 aprile (vedi `gh pr list --repo AndreaMarro/elabtutor --state all`), poi è rimasto **silenzioso per 7 giorni**. L'ultimo PR MERGED è #70 del 11/04.
>
> **Questo PDR**: dargli UN solo macro-obiettivo ben definito, non 50 micro-task. Serve risveglio + focus.

---

## Come eseguire questo PDR

Andrea, tu esegui in terminale su tua macchina o su server:

```bash
# Da macchina dove gira progettibelli-go (il suo ambiente Claude Agent SDK)
# Incolla il prompt finale (a fondo documento) alla prossima sessione del tuo agent SDK
# Il prompt è self-contained, include baseline + regole + macro-obiettivo + criteri successo
```

Il risultato atteso: **UNA sola PR ben documentata** su `elabtutor` (NON 14 PR frammentate). Sessione 10-20h. Supervisionato asincrono via git.

---

## Contesto da dare al progettibelli-go (all'inizio del suo prompt)

### Chi sei

Sei **progettibelli-go**, agent Claude Agent SDK collegato al repository `AndreaMarro/elabtutor` (NB: nome con trattino differente dal repo principale `AndreaMarro/elab-tutor`).

Le tue ultime attività:
- 8-11 aprile 2026: 27 PR pushate, quasi tutte mergiate (#44-#70)
- 11-17 aprile 2026: **silenzio totale**. Nessuna attività.
- Oggi: Andrea ti rilancia con un prompt focalizzato.

Hai operato bene fino all'11 aprile. Poi hai perso il filo. Andrea non sa il motivo esatto (probabilmente contesto saturato o prompt mono-turno esaurito). Questa volta hai un macro-obiettivo chiaro e 20h per completarlo.

### Stato reale del progetto (NON quello mitologico)

- Repository primario (mergiato su Vercel): `AndreaMarro/elab-tutor`
- Repository secondario (dove lavori tu): `AndreaMarro/elabtutor`
- Baseline test (sul repo primario `elab-tutor`): **12056/12056 PASS** (verificato da Andrea 17/04 notte)
- Branch principale: `main`
- Commit recenti rilevanti:
  - 6b0cacd (17/04): fix vitest pool=forks per flakiness sotto carico
  - ba3f9af (17/04): fix UNLIM down (Gemini 3.x preview → 2.5 GA, 5 Edge Functions redeploy)
  - ab204b6 (17/04): Kokoro TTS LIVE su VPS 8881
  - 91c6793 (17/04): CSP fixes + audit Vol3 vs sketch ufficiali ELAB
- UNLIM backend: ✅ LIVE (verificato live su elabtutor.school 17/04)
- Kokoro VPS: ✅ LIVE su 72.60.129.50:8881

Tu lavori su `elabtutor` (il tuo repo). Andrea pusha su `elab-tutor` (il repo Vercel). I due repo sono **separati**. Periodicamente Andrea cherry-pick dal tuo in `elab-tutor`.

### PR tua status

Nessuna PR tua attualmente aperta. Le 27 che hai fatto sono tutte MERGED. Tea ha 1 PR aperta (#73 su `elabtutor`) ma non è tua, quella la gestisce Andrea.

**NON DEVI fare "triage 14 PR orfane"** — è una narrativa errata. Devi fare UN solo macro-obiettivo nuovo.

---

## Macro-obiettivo scelto (UNO solo)

Andrea ha 3 scelte da proporti. Lui deciderà prima di lanciarti.

**Raccomandazione CoV-verificata (18/04 02:15):**
Dopo analisi fredda di impatto × rischio × reperibilità dati:

| Opzione | Impatto PNRR | Rischio regressione | Reperibilità dati | Verdetto |
|---------|--------------|----------------------|-------------------|----------|
| A - Dashboard | ★★★★★ (blocca vendite B2B) | basso (no engine) | alto (schema Supabase esiste) | **PREFERITA** |
| B - Cap 9 buzzer | ★★ (contenuto marginale) | medio (tocca AVRBridge se `tone()` non supportato) | alto (sketch ufficiali) | secondaria |
| C - UNLIM memory | ★★★ (retention) | medio (schema DB da creare) | medio (richiede admin Andrea) | terza scelta |

**Default: Opzione A**. Se Andrea vuole stretching engine skills → B; se vuole retention play → C.

### OPZIONE A — "Dashboard Docente con dati Supabase reali" (preferita)

**Gap reale**: la dashboard docente in produzione è oggi uno shell minimale. Non mostra dati reali di classe (progressi studenti, tempo speso per esperimento, errori ricorrenti). Il PNRR richiede questa feature per competere con CampuStore/Tinkercad Teacher.

**Cosa fare**:

1. Creare `src/components/dashboard/TeacherDashboardShell.jsx` da zero
2. Query Supabase `student_sessions`, `student_progress`, `confusion_reports`, `nudges`, `daily_metrics` (tabelle esistono — verificate da Andrea su project `ghost-tutor` ref `vxvqalmxqtezvgiboxyv`)
3. Visualizzazioni con `recharts` (già in deps):
   - Grafico linea: esperimenti completati per settimana (ultimi 30gg)
   - Grafico barre: top 5 esperimenti con più errori
   - Tabella: studenti recenti (nome o class_key, data, tempo, esp)
4. Export CSV: download di `student_sessions` filtrata (ultimi 30gg, classe specifica se filtro applicato)
5. Routing: hash `#/dashboard` o `#tutor?tab=dashboard` (verifica convenzione esistente leggendo `src/App.jsx`)
6. Filtro per classe: input text "class key" + bottone "Applica"
7. Fallback: se Supabase non risponde (401/timeout), mostra banner "Connetti il tuo Supabase" e placeholder demo data da `src/data/dashboard-placeholder.js` (creare)
8. Accessibility: WCAG AA (contrasto ≥4.5:1 testi, ≥3:1 grafici, tabelle con `<caption>`, aria-label bottoni)
9. Test: `tests/integration/teacher-dashboard.test.jsx` (min 15 test) con mock Supabase client

**Success criteria**:
- Test count iniziale `elab-tutor` main = 12056. Dopo il tuo lavoro su `elabtutor`: quando Andrea cherry-pick sul repo primario il count deve crescere di almeno +15 nuovi test, TUTTI comportamentali
- Build PASS
- `hash #/dashboard` renderizza componente senza errori console
- Playwright spec `tests/e2e/dashboard-teacher.spec.ts` crea utente fake, naviga dashboard, verifica tabella presente
- Export CSV funzionante (download file con >0 righe o header only se 0 studenti)
- Doc utente `docs/user/dashboard-docente.md` scritto

**Scope files**:
- Nuovo: `src/components/dashboard/TeacherDashboardShell.jsx`
- Nuovo: `src/components/dashboard/DashboardCharts.jsx`
- Nuovo: `src/components/dashboard/CSVExportButton.jsx`
- Nuovo: `src/data/dashboard-placeholder.js` (fallback data)
- Nuovo: `tests/integration/teacher-dashboard.test.jsx`
- Nuovo: `tests/e2e/dashboard-teacher.spec.ts`
- Nuovo: `docs/user/dashboard-docente.md`
- Modifica: `src/App.jsx` (routing)
- Modifica: `src/services/supabaseClient.js` (se serve extender)

**Non tocca**:
- `src/components/simulator/engine/**` (vietato)
- `src/services/api.js` (modifiche minime se proprio inevitabili)
- `package.json` (no nuove dipendenze)

**Tempo stimato**: 10-15 ore con TDD rigorosa.

### OPZIONE B — "Cap 9 Buzzer/Tone + audit sketches ultimi"

**Gap**: dall'audit 17/04 risulta che gli sketch ufficiali Cap 9 (`Sketch_Capitolo_9_1/9_2/9_3.ino` buzzer + tone + piano 4 tasti) **mancano completamente** nel simulatore. Il libro Vol3 Cap 9 è buzzer-based.

**Cosa fare**:
1. Leggere `/tmp/SKETCH/Sketch_Capitolo_9_*/` per codice ufficiale
2. Creare 3 nuovi esperimenti in `src/data/experiments-vol3.js`:
   - v3-cap9-esp1: tone base su D10, delay, noTone
   - v3-cap9-esp2: tone con durata 3° arg
   - v3-cap9-esp3: piano 4 tasti (INPUT_PULLUP su A0/A3/6/A5 + tone DO4/RE4/MI4/FA4)
3. Aggiungere componente `buzzer` al palette (se non esiste già) e verificare in `AVRBridge` se `tone()` è supportato
4. Aggiornare `src/data/volume-references.js` con entries v3-cap9-esp1..3 con bookPage reali
5. Test parity: `tests/unit/v3Cap9BuzzerToneParityLibro.test.js` (min 15 test)

**Rischio**: tocca `AVRBridge.js` se `tone()` non già supportato → richiede `authorized-engine-change` in commit body. Vedi regola ferrea #4.

### OPZIONE C — "Memoria UNLIM cross-session reale"

**Gap**: oggi `unlimMemory.js` salva solo localStorage. Quando studente cambia device o localStorage svanisce, UNLIM "dimentica".

**Cosa fare**:
1. Estendere `src/services/unlimMemory.js` per:
   - Sync a Supabase `unlim_memory` tabella (schema nuovo se non esiste)
   - Retrieve prioritizzato: cloud → localStorage → RAG
   - Compression summary via Claude API chiamata batch fine-sessione
2. Nuovo schema Supabase `unlim_memory`:
   - `session_id text primary key`
   - `class_key text`
   - `last_experiment text`
   - `errors_common jsonb`
   - `summary text`
   - `created_at timestamptz`
3. Migration SQL in `supabase/migrations/2026-04-18-unlim-memory.sql`
4. Test integration `tests/integration/unlim-memory-cross-session.test.js` (min 12 test)
5. Endpoint Edge Function `unlim-memory-sync` se serve (opzionale, meglio client-side direct)

**Rischio**: tocca schema DB Supabase → richiede credentials admin. Andrea deve eseguire migration.

---

## Infrastruttura Triade disponibile (18/04 03:00, commit `3c98266` su elab-tutor)

Prima di cominciare, sappi che Andrea ha appena pushato su `elab-tutor` una nuova orchestration layer. Se lavori su `elabtutor` (tuo repo), puoi o (a) pull da `elab-tutor` per allinearti, o (b) ignorarla e lavorare solo con regole ferree standard. Se la usi:

- **`automa/baseline-tests.txt`** = hard floor (oggi 12056). Se il tuo commit fa scendere sotto → revert automatico.
- **`scripts/benchmark.cjs --fast --write`** = score oggettivo 0-10 su 10 metriche (test_count, build_size, e2e_pass_rate, volume_ref_coverage, dashboard_live, unlim_latency_p95, git_hygiene, documentation, accessibility_wcag, worker_uptime). Run all'inizio e alla fine: scrivi il delta nella PR.
- **`scripts/guard-critical-files.sh`** = blocca modifiche a CircuitSolver/AVRBridge/PlacementEngine/SimulatorCanvas/package.json/vite.config.js. Bypass: `authorized-engine-change` nel commit body (USA SOLO se necessario per Opzione B).
- **`.claude/agents/{planner,generator-app,generator-test,evaluator}.md`** = 4 agent specs della triade. NON sei tu — tu sei progettibelli-go indipendente, ma puoi ispirarti al modello Evaluator (pessimismo forzato: "3 cose che potrebbero essere rotte") per la tua self-review.
- **`automa/tasks/pending/ATOM-*.md`** = atomic task queue del planner CLI. NON li consumare tu — quelli sono per la triade CLI di Andrea. Tu lavori UN macro-obiettivo scelto.

**Se pull da `elab-tutor`**, il tuo flow diventa:
```bash
# Inizio sessione
node scripts/benchmark.cjs --fast --write  # baseline
# ... tuo lavoro ...
node scripts/benchmark.cjs --fast --write  # finale
cat automa/state/benchmark.json | jq '{score, delta}'  # delta da mettere in PR
```

Se il delta è negativo → hai regredito su qualche metrica. Indaga prima di chiudere PR.

---

## Regole ferree per progettibelli-go

1. **Baseline test ≥ 12056**. Se scendi → REVERT.
2. **Build PASS** sempre dopo modifica codice.
3. **MAI `git push --force`** (mai).
4. **MAI `git reset --hard` su main** (mai). Su branch feature solo se isolato e tu sei l'unico.
5. **MAI toccare file critici** (CircuitSolver, AVRBridge, PlacementEngine, SimulatorCanvas, NewElabSimulator) senza `authorized-engine-change` in commit body E 3 test prima/3 test dopo.
6. **MAI nuove dipendenze npm** senza autorizzazione esplicita Andrea.
7. **Commit format**: `tipo(area): descrizione — Test: NNNN/NNNN PASS`
8. **MAI `git add -A`** → solo file mirati.
9. **MAI `--no-verify`**.
10. **MAI push diretto su main** → solo PR via `gh pr create`.
11. **Branch unico** per questa sessione: `feature/progettibelli-macro-<opzione>` (es. `feature/progettibelli-macro-A-dashboard`). NON creare altri branch.
12. **Una sola PR alla fine**, ben documentata. NON 20 PR frammentate come ad aprile.

## Principi pedagogici (ELAB-specific)

1. **Linguaggio UI per 10-14 anni**: niente "data esporta", meglio "scarica i dati"; niente "user", meglio "studente".
2. **Mobile-first**: iPad portrait è il device più comune in classe.
3. **Accessibility WCAG AA**: contrasto, focus visibile, aria-label.
4. **Principio Zero**: il docente impreparato deve poter usare la feature senza studiare la documentazione.

## Protocollo esecuzione

### Step iniziale (prima 30 min)

1. `git fetch --all`
2. `git checkout main`
3. `git pull origin main` — sync su `elabtutor` repo
4. `git checkout -b feature/progettibelli-macro-<opzione>`
5. `git tag bootstrap-progettibelli-$(date +%Y%m%d-%H%M)`
6. `npx vitest run --reporter=dot | tail -3` → verifica count
7. `npm run build | tail -3` → verifica PASS
8. Crea `automa/state/progettibelli-session.md` con stato iniziale + piano 20 sub-task

### Step loop (ogni 60-90 min)

1. Prendi 1 sub-task dal piano
2. TDD: scrivi test RED
3. Implementa minimo per GREEN
4. `npx vitest run --reporter=dot` → verifica no regression
5. `npm run build` → verifica PASS
6. Commit atomico: `tipo(area): descrizione — Test: NNNN/NNNN PASS`
7. Aggiorna `automa/state/progettibelli-session.md` con ✅ task fatto
8. Ogni 3 task: `git tag progettibelli-ckpt-$(date +%H%M)` + stress test breve (10 scenarios Playwright)

### Step intermedio (ogni 4-5h)

1. Genera report intermedio in `automa/evals/progettibelli-midpoint-<N>.md`
2. Metriche: task completati / totali, test aggiunti, build status, bugs trovati
3. Se hai trovato bug fuori scope → segnali in `automa/state/progettibelli-bugs-found.md`, NON fixare (fuori scope della tua PR)

### Step finale

1. Completa tutti sub-task scope
2. Esegui stress test 50 scenari utenti realistici (vedi lista sotto)
3. Genera report `automa/evals/progettibelli-stress-test-50.md` con pass/fail
4. Aggiorna `docs/user/<feature>.md` con guida utente
5. PR singola: `gh pr create --base main --title "..." --body-file docs/plans/progettibelli-pdr-result.md`
6. Tag finale: `git tag progettibelli-macro-<opzione>-done`

## Stress test 50 scenari (da eseguire con Playwright)

Lista scenari realistici ispirata a comportamenti docenti/studenti reali. Obiettivo: trovare bug prima di Andrea.

1. Docente non tecnico apre ELAB da iPad, prova UNLIM con voce "Ehi UNLIM"
2. Docente con screen reader (VoiceOver macOS) naviga intera dashboard
3. Studente zoom browser 300% sul simulatore — toolbar si vede ancora?
4. Tablet in orientamento portrait, drag componente resistore
5. Network 3G lenta (Chrome DevTools throttle), primo load
6. Offline mode: disconnetti, prova simulatore
7. Ri-connessione dopo offline: sync queue funziona?
8. Cold cache: svuota cache Chrome, apri elabtutor.school
9. Hash URL bookmarked: `https://elabtutor.school/#v1-cap6-esp1` → apre direttamente
10. Click rapidi (50 click/secondo) su "Prossimo esperimento" — race condition?
11. 100 messaggi UNLIM in 5 minuti — rate limit?
12. UNLIM vision: screenshot LED rosso girato → risposta citata libro p.29?
13. Export CSV con 0 studenti → file con header only, no errore
14. Export CSV con 1000+ studenti → performance OK?
15. Filtro classe con caratteri speciali (`'; DROP TABLE;`) → nessuna injection
16. Filtro classe caso-insensitive funziona
17. Grafico progressi con solo 1 punto dato → renderizza senza crash
18. Grafico progressi con 0 punti dato → banner "nessun dato disponibile"
19. Dashboard si carica in <3s su iPad WiFi scolastica tipica
20. Dashboard responsive a breakpoint 768px (iPad portrait)
21. Dashboard responsive a breakpoint 1024px (iPad landscape)
22. Dashboard responsive a breakpoint 1920px (LIM 1080p)
23. CSV export download apre direttamente (non popup bloccato)
24. Refresh pagina su dashboard → mantiene filtro classe (sessionStorage)
25. Logout → back-button browser: no dati leak
26. Light mode default: contrasto WCAG AA verificato via axe
27. Font sizes ≥13px, label ≥10px (regola progetto)
28. Touch target ≥44x44px su tutti bottoni (regola progetto)
29. Aria-label presente su ogni bottone senza testo
30. Focus visible su tutti i bottoni (outline 2px)
31. Pulsante "Filtro" keyboard accessible (Tab + Enter)
32. Tabella keyboard navigabile (arrow keys su rows)
33. Grafico recharts ha aria-label descrittivo
34. CSV download su Safari iOS funziona (no popup)
35. Edge case: nessun esperimento per studente X → tabella vuota gracefully
36. Edge case: studente con 999 esperimenti → pagination?
37. Edge case: nome studente con emoji 🎯 → rendering corretto
38. Edge case: nome studente con apostrofi "D'Angelo" → no injection
39. Edge case: data nel futuro (orologio sbagliato) → handled
40. Edge case: 2 studenti stesso nome → distingue per class_key
41. Timeout Supabase 5s → banner degradato, no crash
42. Token Supabase scaduto → refresh transparente
43. Utente rimuove cookie → fallback localStorage
44. localStorage pieno (5MB) → cleanup vecchie sessioni
45. 2 tab browser aperti — concurrent edits — no conflict
46. Autocomplete browser password nel form → no leak
47. Print dialog funziona sulla dashboard (stampa tabella)
48. Lingua sistema tedesco → fallback IT (ELAB IT-only)
49. Retry automatico su fetch fallito (transient error)
50. User agent bot (Googlebot) → renderizza pagina seo

Report: `automa/evals/progettibelli-stress-test-50.md` con:
- Tabella scenario | passed | failed | notes
- Per ogni failed: screenshot + stack trace + reproduction steps
- Bug trovati catalogati in `automa/state/progettibelli-bugs-found.md`

---

## Se blocchi

NON inventare lavoro. NON fingere completamento.

Scrivi `automa/state/progettibelli-blocked-<area>.md` con:
- Cosa hai tentato (log comando + output)
- Perché ha fallito (diagnosi)
- Cosa ti serve da Andrea per sbloccare

Committi lo stato parziale. Apri PR "DRAFT" con titolo `[WIP-BLOCKED] <descrizione>` così Andrea vede il tuo stato.

## Deliverable attesi (fine sessione)

- **1 sola PR** aperta su `elabtutor` repo (NON 10+)
- Branch `feature/progettibelli-macro-<opzione>` con 15-30 commit atomici
- Benchmark oggettivo pre/post via `node scripts/benchmark.cjs --fast --write` (script ora presente dal commit `3c98266` su `elab-tutor`; se su `elabtutor` manca, pull da `elab-tutor` o skip)
- Delta benchmark atteso: **>= +1.0 punti** sul weighted score 0-10 (baseline 2.77 fast mode del 18/04)
- Report stress test 50 scenari
- Doc utente scritta
- `automa/state/progettibelli-session.md` aggiornato a 100% o con blocchi esplicitati
- `docs/HISTORY.md` aggiornato (numeri verificati, CoV-compliant)

## Cosa NON deliverare

- 14 PR separate
- Refactor non richiesti
- Micro-ottimizzazioni su codice esistente non correlato
- Nuove feature fuori scope macro-obiettivo
- Dipendenze npm nuove
- Modifiche a file critici engine

---

## PROMPT FINALE da incollare nella tua sessione Claude Agent SDK

```
PROGETTIBELLI-GO — RISVEGLIO 18/04/2026

Sei un agent Claude Agent SDK collegato al repository AndreaMarro/elabtutor. Le tue ultime attività risalgono all'11/04 (PR #70 MERGED). Sei stato silenzioso per 7 giorni. Andrea ti rilancia ora con UN macro-obiettivo chiaro.

## Baseline verificata (17/04/2026 notte)
- Repo tuo: AndreaMarro/elabtutor (NB: nome DIFFERENTE dal repo principale elab-tutor che sta su Vercel)
- Repo principale (dove Andrea pusha): AndreaMarro/elab-tutor — baseline 12056/12056 test PASS
- Sito: https://www.elabtutor.school → 200 OK
- UNLIM: LIVE (verificato via Playwright 17/04)
- Kokoro TTS: LIVE su 72.60.129.50:8881

## Il tuo macro-obiettivo (UNO solo)
[Andrea incolla qui: OPZIONE A (Dashboard) o B (Cap 9) o C (Memory)]

## Regole ferree inviolabili
1. Baseline test mai sotto 12056. Se scende → REVERT IMMEDIATO.
2. npm run build sempre dopo modifica .js/.jsx/.json.
3. MAI git add -A. MAI --no-verify. MAI push su main.
4. MAI git push --force. MAI git reset --hard su main.
5. MAI file critici (CircuitSolver, AVRBridge, PlacementEngine, SimulatorCanvas, NewElabSimulator) senza authorized-engine-change nel commit body.
6. MAI dipendenze npm nuove senza esplicito OK Andrea.
7. Commit format: "tipo(area): descrizione — Test: NNNN/NNNN PASS".
8. Una sola PR alla fine. UN solo branch feature/progettibelli-macro-<opzione>.
9. Stress test 50 scenari Playwright prima di chiudere.

## Principi Karpathy (obbligatori)
- Think Before Coding: no assunzioni silenziose
- Simplicity First: no over-engineering
- Surgical Changes: tocca SOLO quello che serve
- Goal-Driven Execution: success criteria verificabili

## Protocollo
1. Setup iniziale: sync main, crea branch, tag bootstrap, verifica baseline
2. Loop 60-90 min: 1 sub-task, TDD, commit atomico, aggiorna state file
3. Ogni 4-5h: report intermedio in automa/evals/
4. Se blocchi: NON inventare. Scrivi automa/state/progettibelli-blocked-<area>.md + PR [WIP-BLOCKED]
5. Fine: stress test 50 scenari, report, doc utente, 1 PR

## Se non hai accesso a qualcosa
- Credenziali Supabase: vedi env.local (se esistente) o chiedi Andrea
- SSH VPS: chiave ~/.ssh/id_ed25519_elab (se disponibile nel tuo ambiente)
- Gemini API: secrets Supabase project elab-unlim (se hai accesso admin) — Andrea ha BrCG_8gv come primary e CroZ77vZ come fallback

## Output atteso fine sessione
- 1 PR aperta con 15-30 commit
- 15+ test nuovi comportamentali (ognuno con almeno 1 expect comportamentale, NO test smoke vuoti)
- Stress test 50 scenari eseguito (report)
- Doc utente scritta
- automa/state/progettibelli-session.md 100% o blocchi esplicitati
- Se ti sei allineato a elab-tutor (commit 3c98266+): benchmark delta documentato in PR body via `node scripts/benchmark.cjs --fast --write`

## Anti-inflation (CoV obbligatoria)
- Ogni claim numerico nel commit message DEVE essere preceduto da comando di verifica.
  Esempio: "Test: 12106/12106 PASS" ⇒ DEVI aver appena fatto girare `npx vitest run` e mostrato l'output (anche solo `tail -3`).
- VIETATI: numeri arrotondati a tema marketing ("oltre 1000 test"), aggettivi auto-laudativi nel commit, claim su feature non testate.
- Se hai inventato anche solo un numero → revert + commit fix con disclaimer.

ONESTÀ RIGOROSA. NESSUN NUMERO INFLAZIONATO. CLAIM SOLO CON FONTE VERIFICATA.

Inizia dallo step 1 di Setup iniziale. VAI.
```

---

## Note per Andrea (supervisione async)

### Come controllare progresso senza interrompere

- `git log --oneline feature/progettibelli-macro-* | head -10` — commit recenti
- `cat automa/state/progettibelli-session.md` — stato task
- `cat automa/state/progettibelli-bugs-found.md` — bug trovati (non fixa lui)
- `gh pr list --repo AndreaMarro/elabtutor --state open` — PR aperte

### Quando intervenire manualmente

- Se hai 48h di silenzio → rilancia con stesso prompt (probabilmente contesto saturato)
- Se PR è in DRAFT `[WIP-BLOCKED]` → leggi `automa/state/progettibelli-blocked-*.md` e sblocca
- Se commit ha pattern strani (es. `git push --force` o `--no-verify`) → REVERT + riprompt con regole rinforzate

### Dopo completamento

1. Review sua PR
2. Cherry-pick su `elab-tutor` (repo primario): `git cherry-pick <range>` su branch `feature/progettibelli-integration-YYYY-MM-DD`
3. Risolvi conflitti se emersi
4. Merge su `elab-tutor` main dopo CI verde
5. Aggiorna `docs/HISTORY.md` con credits + SHA

---

*Documento self-contained. Include prompt finale da incollare. Fine PDR #2.*
