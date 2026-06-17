# SPRINT G — MASTER PLAN G36-G45 (Rimodulato Post-Audit Brutale)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Portare ELAB da 7.4/10 a 9.5/10 per deploy produzione entro PNRR 30/06/2026

## DOVE TROVARE I PROMPT

```
docs/prompts/
├── G36-unlim-brain-fix.md       ← UNLIM 17->44 azioni + memory inject
├── G37-dashboard-reale.md       ← Pagination + Nudge reale + Docs + Classi
├── G38-principio-zero-ux.md     ← Steve Jobs mode, first-load magic
├── G39-landing-onboarding.md    ← Landing #scuole + onboarding 3 click
├── G40-voice-offline.md         ← Voice shortcuts + offline caching
├── G41-scratch-perfetto.md      ← 6/6 Scratch E2E + LIM test
├── G42-stress-wcag.md           ← Memory leaks + WCAG + localStorage
├── G43-pre-release-audit.md     ← Audit totale + report Giovanni
├── G44-release-candidate.md     ← Deploy produzione + smoke test
├── G45-buffer-pnrr.md           ← Solo bug fix + tag v1.0.0
└── SPRINT-G-MASTER-PLAN.md      ← QUESTO FILE (indice)
```

**Architecture:** Fix-first (P0/P1 prima di feature nuove), poi UX/Principio Zero, poi polish. Ogni sessione include CoV intermedi e audit finale con 5 agenti.

**Baseline Post-Audit G35:**
- Build: 956/956 test, 20/20 E2E, 47s build
- Score REALE: 7.4/10
- UNLIM: 6.5/10 | Simulatore: 7.9/10 | Dashboard: 6.5/10 | GDPR: 7/10

**Deadline PNRR:** 30/06/2026 (82 giorni)

---

## PANORAMICA 10 SESSIONI

```
     G36             G37             G38            G39            G40
  +------------+ +------------+ +------------+ +------------+ +------------+
  | UNLIM      | | DASHBOARD  | | PRINCIPIO  | | LANDING +  | | VOICE +    |
  | BRAIN FIX  | | REALE      | | ZERO UX    | | ONBOARDING | | STT/TTS    |
  | 17->44 act | | Pagination | | Steve Jobs | | 1-click    | | Offline    |
  | +memory inj| | +Nudge real| | + estetica | | + MePA     | | indicator  |
  +------------+ +------------+ +------------+ +------------+ +------------+
    P0-P1 fix      P1 fix         UX/Design      Conversione    Resilienza
    +1.0 UNLIM     +1.0 Dash      +0.5 UX        +0.5 Conv      +0.3 Resil

     G41             G42             G43            G44            G45
  +------------+ +------------+ +------------+ +------------+ +------------+
  | SCRATCH    | | STRESS     | | PRE-REL    | | RELEASE    | | BUFFER     |
  | PERFETTO   | | TEST +     | | AUDIT      | | CANDIDATE  | | Solo bug   |
  | + compiler | | mem leaks  | | TOTALE     | | + deploy   | | fix per    |
  | fallback   | | + WCAG     | | 50 check   | | produzione | | PNRR       |
  +------------+ +------------+ +------------+ +------------+ +------------+
    Simulatore     Robustezza     Audit finale   Deploy         Buffer
    +0.3 Sim       +0.3 Stress    Score card     GO/NO-GO       Safety net
```

**Target progressione:**
| Sessione | Score Target | Focus |
|----------|-------------|-------|
| G36 | 8.4 | UNLIM brain fix (+1.0) |
| G37 | 9.0 | Dashboard reale (+0.6) |
| G38 | 9.3 | Principio Zero UX (+0.3) |
| G39 | 9.5 | Landing + onboarding (+0.2) |
| G40 | 9.6 | Voice + offline (+0.1) |
| G41 | 9.6 | Scratch polish (=) |
| G42 | 9.7 | Stress test + fix (+0.1) |
| G43 | 9.7 | Pre-release audit (=) |
| G44 | 9.8 | Release candidate |
| G45 | 9.8 | Buffer PNRR |

---

## REGOLE INVARIANTI (TUTTE LE SESSIONI)

1. **ZERO DEMO, ZERO MOCK, ZERO DATI FINTI**
2. **62 lesson paths INTOCCABILI** (38+18+6)
3. **Non toccare engine/** -- CircuitSolver, AVRBridge, avrWorker sono stabili
4. **CoV dopo OGNI task**: `npm run build && npx vitest run`
5. **Principio Zero** sovrascrive ogni altra considerazione
6. **Budget <= 50 euro/mese**
7. **Audit finale OGNI sessione** con 5 agenti paralleli ultra-severi
8. **MASSIMA ONESTA'** -- se qualcosa non funziona, scriverlo

---

## AUDIT FINALE TEMPLATE (da copiare in OGNI sessione)

```
## AUDIT FINALE (OBBLIGATORIO)

Esegui in ordine:
1. `npm run build` -- DEVE passare
2. `npx vitest run` -- 956+ test, 0 fail
3. `npm run test:e2e` -- 20+ test, 0 fail
4. Lancia 5 agenti ultra-severi paralleli:
   - UNLIM Torture: verifica 44 azioni, memory injection, STT/TTS
   - Simulator Torture: Scratch, compiler, MNA, AVR, 21 componenti
   - Dashboard Torture: OGNI tab (11), dati reali, empty states
   - Specs Compliance: 8 requisiti Andrea vs realta'
   - Stress Test: XSS, memory leaks, offline, pagination, localStorage
5. Test browser reale: Prof.ssa Rossi (LIM 1024x768) + Marco (10 anni)
6. Score card ONESTA con delta vs sessione precedente
7. Aggiorna handoff + scrivi prompt sessione successiva
```

</content>
</invoke>