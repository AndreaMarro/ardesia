# Visual Test Report — Ciclo 4
**Data**: 2026-03-25 01:45
**Mode**: TEST
**Score prima**: 0.9403

---

## Persona 1 — Insegnante inesperto alla LIM (1024×768)

### Step 1: Homepage (vetrina)
- **Tempo per capire cosa fare**: < 5 secondi. "Accedi" e "Registrati Gratis" sono chiari e ben visibili.
- **Screenshot**: `2026-03-25-lim-insegnante-step1-homepage.png`

### Step 2: Login
- **È ovvio dove cliccare?** SÌ — form pulito, centrato, CTA verde "Accedi" evidente.
- **Screenshot**: `2026-03-25-lim-insegnante-step2-login.png`

### Step 3-5: Simulatore
- **Non testabile** — richiede credenziali di accesso. Nessun account demo disponibile.
- **Suggerimento**: Creare un account demo guest per test automatizzati.

### Valutazione Persona 1
**"Questo insegnante riuscirebbe a fare lezione senza manuale?"**
- Entrata: **SÌ** — il flusso vetrina→login è chiaro
- Simulatore: **NON VERIFICABILE** senza login

### Misurazioni LIM (1024×768)
| Metrica | Risultato | Target | Status |
|---------|-----------|--------|--------|
| Touch targets ≥ 44px | 20/20 (100%) | 100% | ✅ PASS |
| Bottoni < 44px | 0 | 0 | ✅ PASS |
| Overflow orizzontale | No | No | ✅ PASS |
| Font hero h1 | 35.2px | ≥ 24px | ✅ PASS |
| Elementi font < 14px | 24 | 0 | ⚠️ WARN |

---

## Persona 2 — Studente 10 anni su iPad (810×1080)

### Step 1: Homepage
- **Bottoni grandi abbastanza?** SÌ — "Accedi" e "Registrati Gratis" sono ben dimensionati.
- **Screenshot**: `2026-03-25-ipad-bambino-step1-vetrina.png`

### Step 2: Login
- **Form chiaro?** SÌ — form grande, centrato, facile da usare col dito.
- **Screenshot**: `2026-03-25-ipad-bambino-step2-login.png`

### Step 3-5: Simulatore
- **Non testabile** senza login.

### Valutazione Persona 2
**"Un bambino di 10 anni userebbe questo volentieri?"**
- La vetrina è professionale ma non "invitante" per un bambino — manca elemento ludico.
- Il login è chiaro ma il placeholder "la-tua@email.com" potrebbe confondere un bambino (non ha email).
- **Risposta: PARZIALE** — funzionale ma non coinvolgente per target 8-12.

### Misurazioni iPad (810×1080)
| Metrica | Risultato | Target | Status |
|---------|-----------|--------|--------|
| Touch targets ≥ 44px | 20/20 (100%) | 100% | ✅ PASS |
| Bottoni < 44px | 0 | 0 | ✅ PASS |
| Overflow orizzontale | No | No | ✅ PASS |
| Elementi font < 17px (HIG) | 142 | 0 | ❌ FAIL |

---

## Persona 3 — Lezione 45 min (flusso completo)

### Non testabile
Il flusso completo (apertura → 3 esperimenti → Galileo) richiede autenticazione.
Non è possibile simulare una lezione completa senza credenziali.

**Task creato**: account demo per test automatizzati.

---

## Problemi Trovati

### 1. [medium] Font troppo piccoli su iPad (< 17px Apple HIG)
- **142 elementi** con font < 17px sulla vetrina
- Section labels ("Simulatore", "AI Tutor", "Strumenti"): 12.5px
- Nav links: 14.4px
- Stats labels ("Esperimenti", "Quiz"): 13.1px
- **File**: `newcartella/vetrina.html` (CSS)
- **Impatto**: testo illeggibile per bambini su iPad a distanza naturale

### 2. [low] woff2 font ERR_FAILED persistente
- Un font Google Fonts woff2 ancora referenziato fallisce il caricamento
- Presente su TUTTE le pagine (vetrina + app)
- **File**: probabile residuo in index.html o CSS
- **Impatto**: potenziale CLS, font fallback visibile

### 3. [medium] Nessun account demo per test automatizzati
- Impossibile testare il simulatore senza credenziali
- I cicli TEST perdono valore se non possono testare il core product
- **Impatto**: i test Playwright coprono solo ~30% dell'esperienza

### 4. [low] Contatori animati mostrano "0" al primo render su LIM
- I counter (69 Esperimenti, 138 Quiz, 21 Componenti) mostrano "0" iniziale su LIM 1024×768
- Su iPad mostrano i valori corretti (69, 138, 21)
- **Causa probabile**: IntersectionObserver non triggerato su viewport grande

### 5. [low] Estetica "adulta" — manca elemento ludico per bambini
- Gemini ha confermato: design pulito ma sterile per target 8-12
- Nessun personaggio, colori caldi, o gamification nella vetrina
- **Nota**: questo è un trade-off deliberato (professionale per insegnanti vs ludico per bambini)

---

## Confronto con Screenshot Precedenti

| Screenshot precedente | Screenshot attuale | Differenza |
|---|---|---|
| `20260325-014200-www.elabtutor.school.png` | `2026-03-25-lim-insegnante-step1-homepage.png` | Nessuna regressione visiva |
| `2026-03-25-ipad-bambino-step1-login.png` (C2) | `2026-03-25-ipad-bambino-step2-login.png` (C4) | Login invariato, stabile |

---

## Metriche Riassuntive

| Check | Vetrina LIM | Vetrina iPad | Login LIM | Login iPad |
|-------|-------------|--------------|-----------|------------|
| Touch ≥ 44px | 20/20 ✅ | 20/20 ✅ | 6/6 ✅ | 6/6 ✅ |
| Overflow | No ✅ | No ✅ | No ✅ | No ✅ |
| Font ≥ 17px | ⚠️ 24 fail | ❌ 142 fail | ⚠️ 8 fail | ⚠️ 8 fail |
| Console errors | 1 (woff2) | 1 (CSP) | 1 (woff2) | 1 (woff2) |

---

## Brutale Sincerità

**"Questo ciclo ha prodotto valore REALE per un insegnante alla LIM?"**

**SÌ, ma limitato.** Il valore è nella VERIFICA: abbiamo confermato che il fix touch targets dei cicli 63-65 tiene. Zero bottoni < 44px su tutte le pagine testate. Ma non abbiamo potuto testare il simulatore (core product) per mancanza di credenziali. Il vero valore per l'insegnante è nel simulatore, non nella vetrina.

**Cosa manca per un test completo:**
1. Account demo per Playwright
2. Test del simulatore (toolbar, canvas, Galileo chat)
3. Test transizione tra esperimenti

---

## Task YAML Creati
- `P2-vetrina-font-size-ipad.yaml` — fix font < 17px sulla vetrina per iPad
- `P2-demo-account-playwright.yaml` — creare account demo per test automatizzati
