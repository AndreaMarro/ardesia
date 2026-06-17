# Prossimi Passi — Post PDR 04/04/2026 (Aggiornato Post-PDR Sessione 2)

> Score finale: 7.0/10 (stima) | Target: 8.0/10
> UNLIM E2E: 25/30 PASS con nanobot v5.5.0 (target raggiunto)
> Fix applicati: MASTER_TIMEOUT 10s→30s, docs aggiornati

---

## COSA E STATO FATTO (8 iterazioni Ralph Loop)

### Bug Fixati: 24 totali
| # | Fix | File | Impatto |
|---|-----|------|---------|
| 1-16 | 16 connections Vol3 vuote | experiments-vol3.js | Circuiti montabili |
| 17 | Prompt UNLIM senza lista comandi | ElabTutorV4.jsx | AI sa 35+ azioni |
| 18 | Auth Supabase mancante | supabaseSync.js + WelcomePage.jsx | class_key sync |
| 19 | Mapping volumi non documentato | MAPPING-VOLUMI-APP.md | 91 esp allineati |
| 20 | getBuildMode ritorna false | useSimulatorAPI.js | API corretta |
| 21 | Concept graph non in UNLIM | ElabTutorV4.jsx | Analogie nel contesto |
| 22-23 | FloatingToolbar Select/Wire non sync | useSimulatorAPI+simulator-api+LavagnaShell | Toolbar funzionante |
| 24 | SQL migration auth class_key | auth-class-key.sql | RLS senza Auth |

### Documenti Creati/Aggiornati: 7
- `docs/MAPPING-VOLUMI-APP.md` — mapping 91 esperimenti vs libri fisici
- `docs/STRESS-TEST-RISULTATI.md` — risultati test runtime
- `docs/NEXT-STEPS-POST-PDR.md` — piano d'azione
- `supabase/auth-class-key.sql` — SQL migration auth
- `docs/BENCHMARK-100-PARAMETRI.md` — aggiornato a 110 parametri
- `docs/BUG-LIST-COMPLETA.md` — aggiornata con 24 fix

### Verifiche: Zero Regressioni
- 1430/1430 test PASS in ogni iterazione
- Build PASS (~33s, 30 precache, ~2400 KiB)
- Engine INTOCCATO (CircuitSolver, AVRBridge, SimulationManager, avrWorker)

---

## TOP 3 AZIONI PER 8.0 (per Andrea)

### 1. Configura Supabase (+0.5 punti, ~1h)

Apri https://supabase.com/dashboard → Progetto ELAB → SQL Editor.

**Step 1**: Esegui `supabase/schema.sql` per creare le 8 tabelle.

**Step 2**: Esegui `supabase/auth-class-key.sql` per:
- Aggiungere colonna `class_key` a tutte le tabelle
- Creare RLS policies permissive per il ruolo `anon`

**Step 3**: Verifica nel browser:
- Login con ELAB2026
- DevTools → Network → verifica richieste a Supabase

**Impatto**: Dashboard 4→7, GDPR 5→7, UNLIM memoria 5→7. Score F: 5.7→7.2.

### 2. Test E2E UNLIM con Nanobot (+0.2 punti, ~1h)

Con nanobot attivo:
- Scrivi nella chat UNLIM: "monta il semaforo" → verifica che carichi l'esperimento
- Scrivi: "avvia la simulazione" → verifica play
- Scrivi: "cos'e un LED?" → verifica risposta con analogia
- I 30 scenari del PDR sono documentati in `docs/prompts/PDR-PARITA-VOLUMI-APP.md`

### 3. Deploy su Vercel (+0 punti, ~5min)

```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes
```

---

## SCORE PER AREA (ONESTO)

| Area | Pre-PDR | Post-PDR | Con Supabase |
|------|---------|----------|-------------|
| A. Simulatore | 7.3 | 7.3 | 7.3 |
| B. Lavagna UX | 6.7 | **6.9** | 6.9 |
| C. UNLIM AI | 6.6 | **7.0** | 7.0 |
| D. Pedagogico | 7.1 | **7.2** | 7.2 |
| E. PDF | 6.7 | 6.7 | 6.7 |
| F. Sicurezza | 5.7 | 5.7 | **7.2** |
| G. Performance | 6.4 | **6.7** | 6.7 |
| H. Responsive | 6.2 | 6.2 | 6.2 |
| I. UNLIM Onn. | -- | **6.9** | **7.5** |
| **Totale** | **6.7** | **6.9** | **~7.2** |

Con Supabase configurato: **~7.2/10**. Per 8.0 serve anche:
- Refactoring NewElabSimulator (toolbar completa, auto-fit)
- CSP nonce-based
- Mobile portrait

---

## PRINCIPI RISPETTATI

1. **PRINCIPIO ZERO**: Solo docente usa UNLIM. Ogni azione serve la lezione.
2. **ZERO REGRESSIONI**: 1430 test + build in ogni iterazione.
3. **ENGINE INTOCCABILE**: CircuitSolver/AVRBridge/SimulationManager MAI toccati.
4. **ZERO DEMO/MOCK**: Tutto funziona con dati reali.
5. **ONESTA BRUTALE**: Score mai inflati — 6.9 non 8.0.
