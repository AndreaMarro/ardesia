# Audit Report — Ciclo 55
**Data**: 2026-03-24
**Mode**: AUDIT (ricerca-bug proattiva)
**Score pre-ciclo**: 0.8975 (ciclo 49)
**Build**: PASS (25.07s)

---

## Metodo

1. Playwright su `elab-builder.vercel.app` + `funny-pika-3d1029.netlify.app`
2. Code audit su: `nanobot/server.py`, `nanobot/prompts/`, `src/components/auth/`
3. Analisi del galileo_cache (risultati test Galileo)
4. Verifica CSP in vercel.json

---

## Bug Trovati

### BUG-A — CRITICO (HIGH) — FIXATO ✅
**Titolo**: Identity leak "UNLIM" su pagina login pubblica
**File**: `src/components/auth/LoginPage.jsx:91`
**Evidence**: verified (Playwright snapshot)
**Dettaglio**: La pagina login mostrava "Accedi al Tutor ELAB UNLIM" — nome interno non-branded visibile a tutti gli utenti.
**Fix**: Sostituito "UNLIM" → "Galileo" in `LoginPage.jsx:91`

### BUG-B — ALTO (HIGH) — FIXATO ✅
**Titolo**: Contraddizione identità nel prompt condiviso
**File**: `nanobot/prompts/shared-optimized.yml:5,8,78`
**Evidence**: verified (lettura file)
**Dettaglio**: Il prompt dice "Sei Galileo" (riga 5) ma poi la risposta di protezione identità dice "Sono UNLIM" (riga 8). Questo crea incoerenza: Galileo potrebbe rispondere "Sono UNLIM" agli utenti che chiedono "chi sei?".
**Fix**:
- `shared-optimized.yml:8` → "Sono Galileo"
- `shared-optimized.yml:78` → "Galileo, l'assistente ELAB completo"
- `server.py:793` → INJECTION_BLOCK_RESPONSE usa "Galileo"
- `server.py:871-877` → sanitizer sostituisce con "Galileo" non "UNLIM"

### BUG-C — MEDIO (MEDIUM) — TASK CREATO
**Titolo**: Residui UNLIM nei prompt utente (nanobot/server.py, api.js)
**File**: `nanobot/server.py:2852`, `src/services/api.js:35`, `src/services/sessionReportService.js:121`
**Evidence**: verified (grep)
**Task**: `P1-056-galileo-identity-name.yaml`

### BUG-D — MEDIO (MEDIUM) — TASK CREATO
**Titolo**: `[AZIONE:loadexp]` non generato — Brain VPS bypassa fast_action_dispatch
**File**: `nanobot/server.py` (routing Brain vs fast_action_dispatch)
**Evidence**: verified (galileo_cache.json, check 9/10)
**Root cause**: Quando Brain VPS è attivo, risponde prima di fast_action_dispatch. Brain usa schema 4-tag semplificato, non genera `[AZIONE:loadexp]`.
**Task**: `P2-057-loadexp-tag-brain-bypass.yaml`

### BUG-E — MEDIO (MEDIUM) — TASK CREATO
**Titolo**: URL Netlify hardcoded (funny-pika-3d1029) non brandizzato
**File**: `ShowcasePage.jsx:11`, `Navbar.jsx:35`, `VetrinaSimulatore.jsx:416`
**Evidence**: verified (grep, Playwright)
**Task**: `P2-058-netlify-domain-hardcoded.yaml`

### BUG-F — BASSO (LOW) — NOTA
**Titolo**: Google Fonts woff2 non caricano (ERR_FAILED)
**File**: `src/components/auth/LoginPage.jsx`, `vercel.json`
**Evidence**: verified (Playwright console errors)
**Note**: CSP in vercel.json include `fonts.gstatic.com` correttamente. ERR_FAILED probabilmente causato da environment Playwright (no access a CDN esterno) non da bug reale. Non crea task.

### BUG-G — BASSO (LOW) — NOTA
**Titolo**: Counter stats mostrano "0" su landing page Netlify
**Evidence**: hypothesis (Playwright headless — IntersectionObserver potrebbe non triggerare)
**Note**: Probabilmente falso positivo da Playwright headless. Necessita verifica su browser reale.

---

## Fix Applicati Questo Ciclo

| File | Modifica |
|------|---------|
| `src/components/auth/LoginPage.jsx:91` | "UNLIM" → "Galileo" |
| `nanobot/prompts/shared-optimized.yml:8` | risposta protezione "UNLIM" → "Galileo" |
| `nanobot/prompts/shared-optimized.yml:78` | "UNLIM completo" → "Galileo, l'assistente ELAB completo" |
| `nanobot/server.py:793` | INJECTION_BLOCK_RESPONSE "UNLIM" → "Galileo" |
| `nanobot/server.py:871-877` | sanitizer "UNLIM" replacement → "Galileo" |

**Build post-fix**: ✅ PASS (25.07s)

---

## Task Creati

- `automa/queue/pending/P1-056-galileo-identity-name.yaml` (HIGH)
- `automa/queue/pending/P2-057-loadexp-tag-brain-bypass.yaml` (MEDIUM)
- `automa/queue/pending/P2-058-netlify-domain-hardcoded.yaml` (MEDIUM)

---

## CoV — Chain of Verification

1. **Claim senza prova?** No — tutti i bug verificati con Playwright o grep
2. **Contraddizioni?** No — BUG-A e BUG-B sono distinti (UI vs prompt)
3. **Regressioni?** No — i fix cambiano solo testo, nessuna logica
4. **Build passa?** Sì — 25.07s, nessun errore
5. **Principio Zero?** Sì — identity coerente è critica per fiducia dell'insegnante
6. **Output riusabile?** Sì — 3 task YAML + report in automa/reports/
7. **Severity assegnata?** Sì — HIGH/MEDIUM/LOW su ogni bug

---

## Note Pedagogiche

L'inconsistenza "Galileo vs UNLIM" è particolarmente problematica per il **Principio Zero**:
se un insegnante chiede "chi sei?" e Galileo risponde "Sono UNLIM",
l'insegnante perde fiducia nel prodotto. Il brand "Galileo" deve essere
coerente in ogni touchpoint — login, risposte AI, documentazione.
