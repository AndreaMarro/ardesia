# Piano di Lavoro ELAB Tutor — 12 Aprile 2026

> Riunione lunedi Omaric + Giovanni Fagherazzi
> Score attuale: 6.8/10 | Target: 8.0/10 | Test: 3611

---

## Worker Programmati (attivi ogni ora)

| Worker | Schedule | Ruolo | Output |
|--------|----------|-------|--------|
| elab-audit-worker | :17 | Pull, test, build, report | docs/sprint/AUDIT-HOURLY-*.md |
| elab-debugger-worker | :32 | Colma gap test categorie zero | Commit + push test |
| elab-critic-worker | :47 | Trova bug, credenziali, pattern | docs/sprint/CRITIC-*.md |

## Gap da Colmare (7 categorie a zero)

| Priorita | Categoria | Test attuali | Target | Chi |
|----------|-----------|-------------|--------|-----|
| P0 | UNLIM Chat | 0 | 15+ | Debugger worker |
| P0 | WCAG AA | 0 | 15+ | Debugger worker |
| P1 | Tablet 768px | 0 | 5+ | Playwright agent |
| P1 | Performance FCP | 0 | 5+ | Playwright agent |
| P2 | Offline PWA | 0 | 5+ | Debugger worker |
| P2 | AVR Bridge | 0 | 5+ | Debugger worker |
| P3 | Design System | 0 | 5+ | Debugger worker |

## Fix Completati Oggi

| Fix | Impatto | Stato |
|-----|---------|-------|
| UNLIM parte minimizzato | Alto — Principio Zero | DONE + pushato |
| Tab UNLIM rinominate (CHAT/PERCORSO/GUIDA) | Medio — no confusione | DONE + pushato |
| Idle threshold 60→120s | Basso — meno invasivo | DONE + pushato |
| Frontend → Supabase Edge Functions | Alto — no Render | DONE + pushato |
| RAG 638 chunk uploadati | Alto — UNLIM onnisciente | DONE su Supabase |
| logger.log → logger.info | Basso — bug runtime | DONE + pushato |

## Fix Necessari per Lunedi (non ancora fatti)

| Fix | Impatto | Effort | Chi |
|-----|---------|--------|-----|
| Vercel env vars (VITE_NANOBOT_URL) | Critico — senza questo UNLIM non risponde live | 5 min | Andrea (dashboard Vercel) |
| Deploy Vercel con fix P0 | Critico — fix UNLIM minimizzato non e' live | 2 min | Andrea o CI |
| Test UNLIM su Chrome live | Alto — verificare che risponda dal sito | 10 min | Andrea |

## Sessioni Parallele Claude Web

### Account Andrea Marro
Prompt: "Pull da main. Leggi docs/plans/2026-04-12-piano-lavoro-completo.md. I tuoi task: (1) Scrivi 20 test per UNLIM Chat — mock fetch, verifica safety filter, test risposta vuota/errore/timeout. (2) Scrivi 15 test WCAG — contrasto, aria-label, focus trap, tab order. (3) Scrivi 10 test Design System — palette hex, font-family, no emoji come icone. Pusha su main di entrambi i repo. Test >= 3611."

### Account Progettibelli
Prompt: "Pull da main. Leggi docs/sprint/DESIGN-CRITIQUE-12-APR-2026.md. I tuoi task: (1) Proponi fix CSS per i problemi di design critique — header troncato, mobile UNLIM bottom sheet, breadcrumb. (2) Verifica parita volumi — leggi docs/volumi-originali/ e confronta con experiments-vol*.js. (3) Proponi prototipi per Cap1 Benvenuto Breadboard. Lavora su branch proposal/. NON mergiare su main."

## Metriche di Successo

| Metrica | Attuale | Target Lunedi | Target Settimana |
|---------|---------|---------------|------------------|
| Test totali | 3611 | 4000+ | 5000+ |
| Categorie a zero | 7 | 3 | 0 |
| Score benchmark | 6.8/10 | 7.5/10 | 8.5/10 |
| Build | PASS | PASS | PASS |
| Deploy live | Vecchio | Nuovo con fix P0 | Stabile |
| UNLIM risponde live | No (env var mancante) | Si | Si + RAG |
