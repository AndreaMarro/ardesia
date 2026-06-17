# G45 — BUFFER PNRR (Solo Bug Fix + Hardening)

**Sprint G** — Decima sessione
**Deadline PNRR**: 30/06/2026 (18 giorni)
**Score attuale**: 9.8/10 | Target G45: 9.8/10 (mantenere)

---

## CONTESTO

### G44 — Release Candidate
- Deploy produzione completato
- 10 smoke test PASS su URL live
- Email team preparata
- Score: 9.8

### Questa sessione: BUFFER — solo cio' che serve
Nessuna feature nuova. Solo:
1. Bug fix da feedback team (Giovanni, Davide, Omaric)
2. Bug fix da uso reale su LIM
3. Performance tuning se necessario
4. Documentazione finale

---

## TASK

### Task 1: Raccogliere Feedback Team
- Leggere email/messaggi da Giovanni, Davide, Omaric
- Classificare ogni richiesta: BUG / ENHANCEMENT / NICE-TO-HAVE
- Solo BUG vengono fixati in questa sessione

### Task 2: Fix Bug da Feedback (tempo variabile)
Fixare SOLO bug critici. Nessuna feature nuova.

### Task 3: Performance Tuning (se necessario)
- Lighthouse audit su URL produzione
- FCP (First Contentful Paint) < 2s
- LCP (Largest Contentful Paint) < 4s
- CLS (Cumulative Layout Shift) < 0.1
- Se metriche buone -> skip

### Task 4: Documentazione Finale
1. Aggiornare CLAUDE.md con stato attuale
2. Aggiornare README.md (se esiste)
3. Aggiornare handoff finale

### Task 5: AUDIT FINALE DEFINITIVO
L'ultimo audit. Score card finale che va nel report per Giovanni.

### Task 6: Tag Release
```bash
git tag v1.0.0
```

---

## DELIVERABLE ATTESI G45

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | Bug fix da feedback | Tutti i BUG critici fixati |
| 2 | Performance OK | Lighthouse score ragionevole |
| 3 | Documentazione aggiornata | CLAUDE.md, README |
| 4 | Tag v1.0.0 | Release ufficiale |
| 5 | Score >= 9.8 | PRODUZIONE PRONTA |
