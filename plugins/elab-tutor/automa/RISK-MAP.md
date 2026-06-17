# ELAB Tutor — Mappa Rischi (24/03/2026)

## BLOCKER — Impediscono l'uso del prodotto

| ID | Rischio | Probabilità | Impatto | Mitigazione | Owner |
|----|---------|-------------|---------|-------------|-------|
| R01 | **Galileo latenza 19.8s** — bambini non aspettano, insegnante perde controllo classe | CERTA | CRITICO | Cache risposte comuni, streaming SSE, upgrade Render paid | Loop P0 |
| R02 | **Zero validazione utente reale** — potrebbe non funzionare in contesto classe | ALTA | CRITICO | 1 test con insegnante reale entro 2 settimane | Umano |
| R03 | **Input non sanitizzati** (circuitState, session messages) — XSS su piattaforma minori | MEDIA | CRITICO | Sanitize con DOMPurify, test automatico | Loop P1 |

## HIGH — Degradano significativamente il prodotto

| ID | Rischio | Probabilità | Impatto | Mitigazione |
|----|---------|-------------|---------|-------------|
| R04 | iPad/LIM 13 bottoni <44px — insegnante non riesce a usare su LIM | CERTA | ALTO | Fix CSS touch targets |
| R05 | Gulpease 74 (target 85) — testo troppo complesso per bambini 10-14 | CERTA | ALTO | Riscrivere prompt Galileo per semplicità |
| R06 | God component 4479 LOC — ogni modifica rischia regressioni | ALTA | ALTO | Split incrementale in moduli |
| R07 | Nessun E2E test — regressioni invisibili | CERTA | ALTO | Playwright suite base |
| R08 | Lighthouse 62/100 — caricamento lento su hardware scolastico | ALTA | ALTO | Code-split, lazy loading |
| R09 | GDPR non verificato — rischio legale per dati minori | MEDIA | CRITICO | DPIA, audit, implementazione |

## MEDIUM — Limitano crescita e affidabilità

| ID | Rischio | Probabilità | Impatto | Mitigazione |
|----|---------|-------------|---------|-------------|
| R10 | Render free tier cold start 30s — prima richiesta sempre lenta | CERTA | MEDIO | Ping keep-alive o upgrade |
| R11 | state.json inflazionato — decisioni basate su dati falsi | CERTA | MEDIO | Agganciare a evaluate.py |
| R12 | CLAUDE.md non aggiornato — sessioni future partono con contesto sbagliato | CERTA | MEDIO | Aggiornare dopo ogni sprint |
| R13 | 0 marketing — nessuno sa che ELAB esiste | CERTA | ALTO | Primo articolo, SEO base |
| R14 | Brain V13 piccolo (1.9B) — potrebbe non scalare su casi complessi | MEDIA | MEDIO | Monitorare accuracy, retraining |

## LOW — Debito tecnico accettabile a breve termine

| ID | Rischio | Probabilità | Impatto | Mitigazione |
|----|---------|-------------|---------|-------------|
| R15 | 248 inline styles — manutenibilità | BASSA | BASSO | Migrazione incrementale |
| R16 | i18n assente — mercato limitato all'Italia | CERTA | BASSO (ora) | Futuro: react-i18next |
| R17 | No voice mode — limitazione interazione | BASSA | BASSO | P2 ricerca |
| R18 | window.confirm blocca UI | MEDIA | BASSO | Sostituire con modal React |

## RISCHIO SISTEMICO

Il rischio più grande è **l'auto-inganno**: il sistema produce score inflazionati (state.json 9.2 vs realtà 4.1), documenti non aggiornati (CLAUDE.md LOC sbagliati), e ricerca senza conseguenze (22 doc, 0 task completati). Se il loop perpetua questo pattern, non produrrà valore reale.

**Contromisura**: state.json DEVE essere scritto SOLO da evaluate.py. Nessun score manuale.
