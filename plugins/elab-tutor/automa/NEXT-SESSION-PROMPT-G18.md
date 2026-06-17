# G18 MARATHON — "IL GIORNO DEL GIUDIZIO" (QA Finale + Deploy + Score)

Data: [INSERISCI DATA]. Durata: Sessione lunga (ultima della sprint). Principio Zero: Verificare TUTTO. Deploy. Score finale ONESTO. Nessun bluff. Se fa schifo, scrivi che fa schifo. Se e' eccezionale, dimostralo con numeri.

PREREQUISITI: G12-G17 completate. Leggi G15 audit mid-point per eventuali course corrections applicate.

LEGGI OBBLIGATORIAMENTE: 1. CLAUDE.md. 2. automa/STATE.md. 3. automa/PIANO-2-SETTIMANE.md. 4. automa/reports/G11-MEGA-AUDIT-ONESTO.md (baseline). 5. automa/reports/G15-AUDIT-MIDPOINT.md. 6. TUTTI i report G12-G17. 7. automa/context/UNLIM-VISION-COMPLETE.md. 8. Questo prompt.

FASE 1: Verifica Massiva 10 Layer (3-4 ore).

Usa 5+ agenti paralleli. Ogni layer ha un PASS/FAIL con prova.

Layer 1 — BUILD: npm run build → exit 0. Documenta: tempo, warnings, PWA entries.

Layer 2 — BROWSER E2E (10 esperimenti): v1-cap6-esp1, v1-cap7-esp1, v1-cap7-esp3, v1-cap8-esp2, v1-cap9-esp4, v2-cap6-esp1, v2-cap6-esp3, v2-cap7-esp1, v3-cap6-semaforo, v3-cap7-mini. Per ogni esperimento: carica → circuito appare → Play → simulazione funziona → Console 0 errori.

Layer 3 — CONSOLE ERRORS: Target 0 errori NUOVI. Documenta pre-esistenti vs nuovi.

Layer 4 — TEACHER DASHBOARD: 8 tab funzionano, dati reali, export JSON/CSV, tab PNRR stampabile.

Layer 5 — ACCESSO ZERO-FRICTION: #prova → 2 tap al LED. Deep-link ?exp=xxx funziona. Banner non-bloccante.

Layer 6 — PROGRESSIVE DISCLOSURE: Quanti bottoni visibili nella toolbar? (target: 3). Quanti tab visibili? (target: 0, simulatore default). fontSize < 14px nel tutor? (target: 0).

Layer 7 — MASCOTTE + MESSAGGI: La mascotte e' il robot SVG? (non "U"). I messaggi appaiono accanto ai componenti? 3 stati animati (idle/speaking/thinking)?

Layer 8 — VOCE: STT funziona in Chrome? TTS funziona? Toggle on/off?

Layer 9 — SESSIONI + REPORT: Sessione salvata in localStorage? Contesto classe nel benvenuto? Report PDF fumetto generato? Leggibile?

Layer 10 — GALILEO: 5 domande rapide live. Tempo risposta. Qualita'. Azioni corrette.

FASE 2: Score Card Finale (1 ora).

Usa la STESSA tabella del mega-audit G11. Stesse aree, stessa pesatura. Calcola ENTRAMBI i compositi (tecnico e insegnante).

| Area | G11 baseline | G18 target | G18 REALE | Delta | Prova |
|------|-------------|-----------|-----------|-------|-------|
| Simulatore engine | 9.5 | 9.5 | ? | ? | Build + 10 E2E |
| Contenuto pedagogico | 8.5 | 8.5 | ? | ? | 62/67 paths |
| LIM/iPad usabilita' | 4.0 | 7.0 | ? | ? | bottoni, font, voce |
| Teacher Dashboard | 6.5 | 7.0 | ? | ? | 8 tab, export |
| WCAG/A11y | 6.0 | 7.5 | ? | ? | font, touch, focus |
| Code Quality | 4.5 | 5.0 | ? | ? | test?, console |
| Performance | 7.5 | 7.5 | ? | ? | PWA, build time |
| Business readiness | 3.5 | 6.0 | ? | ? | demo, report, #prova |
| UNLIM vision | 1.5 | 6.5 | ? | ? | 7 capacita' checklist |
| **Composito tecnico** | **7.3** | **7.8** | ? | | |
| **Composito insegnante** | **5.7** | **8.0** | ? | | |

CHECKLIST 7 CAPACITA' UNLIM (per score UNLIM vision):
1. Mascotte reale (robot, non "U")? ___/10
2. Messaggi posizionati (accanto ai componenti)? ___/10
3. Voce input STT? ___/10
4. Voce output TTS? ___/10
5. Sessioni salvate con contesto? ___/10
6. Report fumetto PDF? ___/10
7. Progressive disclosure (3 bottoni, 0 tab)? ___/10
Media 7 capacita' = Score UNLIM vision.

FASE 3: Confronto con Promesse (30 min). Tabella: cosa era promesso nel PIANO-2-SETTIMANE → cosa e' stato fatto → PASS/FAIL.

FASE 4: Deploy (30 min). Se score composito insegnante >= 7.5: npm run build && npx vercel --prod --yes. Se score < 7.5: NON deployare. Documenta perche' e cosa manca. Il deploy non e' un premio automatico — e' una gate di qualita'.

FASE 5: Handoff Definitivo (30 min). automa/STATE.md aggiornato con TUTTI i numeri. automa/handoff.md con: cosa funziona, cosa no, prossimi passi. memory/session-summaries.md con riepilogo G12-G18. memory/scores.md con score finali VERI. Se Giovanni deve vedere qualcosa, prepara: un link alla demo, 5 screenshot, 1 PDF report esempio.

REGOLA FINALE: Questo documento e' l'ultimo checkpoint prima della deadline. Se i numeri sono buoni, celebra. Se sono brutti, documentali onestamente — perche' la prossima sprint parte da qui, non da una fantasia.
