# G43 — PRE-RELEASE AUDIT TOTALE

**Sprint H** — Terza sessione
**Deadline PNRR**: 30/06/2026 (91 giorni)
**Score attuale**: 9.2/10 | Target G43: 9.2/10 (nessuna feature nuova — solo audit)

---

## CONTESTO

### G42 — Stress Test + Memory Leaks + WCAG (COMPLETATO 31/03/2026)
- 3 memory leaks fixati (pointerup, annotation churn, timer)
- localStorage bounded: pruning >730gg + max 3MB
- WCAG AA contrast compliant: --color-muted #737373, --color-vol2-text #B87A00
- Toast warning: dark text su orange (11.5:1)
- 14 file modificati, 972/972 test, build PASS
- Handoff completo: automa/handoff.md

### Questa sessione: AUDIT TOTALE — NO CODICE NUOVO
Solo verifiche, fix di bug trovati, documentazione.

---

## TASK

### Task 1: Quality Gate Completa (tutti i 10 check)

### Task 2: Fix Storage P1 (da audit G42)

Issues critici trovati dagli agenti G42:
1. **Notebooks Base64** (ElabTutorV4.jsx) — toDataURL JPEG in localStorage senza cap. Fix: max 10 notebooks, max 10 pages, o LRU eviction.
2. **Whiteboard rasters** (WhiteboardOverlay.jsx) — canvas toDataURL per esperimento senza eviction. Fix: max N whiteboard salvati, LRU.
3. **compileCache** (compileCache.js) — TTL 24h solo su read, no proactive cleanup. Fix: cleanup su write + max entries.

### Task 3: 5 Agenti Ultra-Severi

1. UNLIM Torture — verificare che 44 azioni siano nel system prompt, memory iniettata
2. Simulator Torture — 6/6 Scratch, compiler chain, MNA
3. Dashboard Torture — OGNI tab, pagination funziona, nudge persistito
4. Specs Compliance — 8 requisiti Andrea vs realta' ATTUALE
5. Stress Test — memory leaks fixati, localStorage bounded, offline funziona

### Task 3: Test Browser Completo (OGNI Funzione)

Testare in Chrome preview a 1024x768:
1. Homepage -> "Inizia in 3 secondi" -> simulatore
2. UNLIM: inviare "mostra BOM", "undo", "compila" — verificare azioni
3. UNLIM: verificare welcome contestuale per 3 esperimenti diversi
4. Dashboard: OGNI tab con click, verificare dati reali
5. Dashboard Report: KPI cards, grafici (se ci sono dati)
6. Scratch: caricare v3-cap6-semaforo, verificare blocchi
7. Passo Passo: attivare modo Passo Passo su Vol1, verificare step
8. Landing #scuole: form contatto, tabella comparativa
9. Login/Logout: flusso completo
10. Offline: disabilitare rete, verificare app carica

### Task 4: Report per Giovanni — 2 Pagine (1h)

Creare `docs/report-giovanni.md`:
1. Pagina 1: Screenshot key features (simulatore, dashboard, UNLIM, Scratch)
2. Pagina 2: Numeri (62 esperimenti, 21 componenti, 3 volumi, 44 azioni AI, GDPR compliant)
3. Comparison table: ELAB vs Tinkercad vs Arduino IDE
4. Next steps: timeline release, pricing, MePA

### Task 5: Bug Triage Finale

Ogni bug residuo classificato:
- **SHIP**: non blocca il deploy, fix post-release
- **NO-SHIP**: blocca il deploy, DEVE essere fixato

### Task 6: Score Card Finale ONESTA

---

## DELIVERABLE ATTESI G43

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | Audit 5 agenti ripetuto | Score per agente documentato |
| 2 | 10 test browser | Tutti PASS o bug documentato |
| 3 | Report Giovanni | 2 pagine in docs/ |
| 4 | Bug triage | SHIP vs NO-SHIP per ogni bug |
| 5 | Score >= 9.2 | Confermato senza regressioni |
