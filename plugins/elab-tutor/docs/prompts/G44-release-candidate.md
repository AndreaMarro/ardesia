# G44 — RELEASE CANDIDATE + DEPLOY PRODUZIONE

**Sprint G** — Nona sessione
**Deadline PNRR**: 30/06/2026 (25 giorni)
**Score attuale**: 9.7/10 | Target G44: 9.8/10

---

## CONTESTO

### G43 — Pre-Release Audit
- Audit 5 agenti completato senza regressioni
- Bug triage: tutti NO-SHIP fixati
- Report Giovanni pronto
- Score confermato >= 9.7

### Questa sessione: DEPLOY TO PRODUCTION
Freeze feature. Solo deploy, monitoring, smoke test.

---

## TASK

### Task 1: Feature Freeze
Da questo momento: ZERO feature nuove. Solo bug fix e deploy.

### Task 2: Build di Produzione Finale (30min)
```bash
npm run build
```
Verificare:
- 0 errori, 0 warning critici
- ElabTutorV4 < 1200KB
- Bundle totale ragionevole

### Task 3: Environment Variables Check (30min)

Verificare che TUTTE le env var necessarie siano documentate:
```
VITE_DATA_SERVER_URL=     # Server EU per sync dati
VITE_AUTH_URL=            # Server autenticazione
VITE_NANOBOT_URL=         # Nanobot AI su Render
VITE_CONTACT_WEBHOOK=     # Webhook form contatto
VITE_OLLAMA_URL=          # Brain VPS locale (opzionale)
```
Creare `.env.example` se non esiste.

### Task 4: Deploy Vercel Production (30min)
```bash
npx vercel --prod --yes
```
Verificare URL live funzionante.

### Task 5: Smoke Test Produzione (1h)

Sul URL LIVE (non localhost), testare:
1. Homepage carica in < 3 secondi
2. "Inizia" porta al simulatore
3. Esperimento Vol1 Cap6 Esp1 carica con componenti
4. UNLIM risponde (anche se lento — server cold start)
5. Dashboard carica (login necessario)
6. Landing #scuole visibile
7. Scratch carica su Vol3
8. Print/PDF funziona dal Report tab
9. Offline: mettere in airplane mode -> app carica da cache
10. Mobile: aprire su telefono -> rotate overlay appare

### Task 6: Monitoring Setup (30min)

1. Verificare che Sentry o analytics siano configurati (PostHog?)
2. Se non configurati, aggiungere almeno `window.onerror` logging a un endpoint
3. Verificare service worker registrazione su produzione

### Task 7: Comunicazione Team (30min)

Preparare email per Giovanni, Davide, Omaric:
```markdown
Oggetto: ELAB Tutor v1.0-rc1 — Pronto per Review

URL: https://elab-builder.vercel.app
Dashboard: https://elab-builder.vercel.app/#teacher

Cosa include:
- 62 esperimenti (3 volumi)
- 21 componenti simulati
- UNLIM AI tutor con 44 azioni
- Dashboard docente con grafici e report PDF
- Scratch editor per Arduino
- GDPR compliant (consenso parentale, cifratura)
- Funziona su LIM 1024x768

Da testare:
- [ ] Aprire su LIM scolastica
- [ ] Provare 3 esperimenti diversi
- [ ] Chiedere qualcosa a UNLIM
- [ ] Aprire Dashboard e verificare dati
```

### Task 8: AUDIT FINALE
### Task 9: Handoff + Prompt G45

---

## DELIVERABLE ATTESI G44

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | Build produzione | 0 errori |
| 2 | Deploy Vercel | URL live funzionante |
| 3 | 10 smoke test | Tutti PASS su URL live |
| 4 | .env.example | Documentato |
| 5 | Email team | Pronta da inviare |
| 6 | Score >= 9.8 | Release candidate |
