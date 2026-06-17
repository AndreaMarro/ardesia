# Persona Completion — Sprint U Cycle 1 Iter 1

**Timestamp**: 2026-05-01T14:30:00+02:00
**Agent**: Persona (RETRY — simulazione offline completa post-stall)
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Status**: COMPLETE (simulazione offline su dati audit)

---

## Output Creato

**`docs/audits/sprint-u-cycle1-iter1-persona-simulation.md`** (~430 LOC)
- 80 scenari totali (4 personas × 4 modalità × 5 esperimenti)
- Per-scenario: experiment ID, score comprehensibility, friction codes, confusion note
- Top 10 friction points (per frequenza × impatto)
- Top 10 confusion points (per impatto pedagogico)
- Score potenziali post-fix (proiezione)
- Raccomandazioni per Cycle 2

---

## Score per Persona

| Persona | Profilo | Score pre-fix | Score post-fix proiezione |
|---------|---------|--------------|--------------------------|
| P1 Maria | 4ª primaria, bassa exp | **4.1/10** | 6.5/10 |
| P2 Giovanni | 1ª secondaria, intermedio | **5.0/10** | 7.5/10 |
| P3 Lucia | 3ª media, esperta | **5.4/10** | 7.8/10 |
| P4 Marco | Sostituto last-minute | **2.9/10** | 5.5/10 |
| **Media globale** | | **4.35/10** | **6.8/10** |

---

## Top 3 Friction Points (per impatto score)

1. **F1-ROUTING** (75/80 scenari, −2.5 media): L2 routing dà LED blink per 93/94 esperimenti. Blocker assoluto per Percorso e Già Montato mode. NESSUNA persona si fida di UNLIM post-primo-fallimento.

2. **F6-NOMOUNT** (2/80 scenari, −5.0): v3-cap7-mini e v3-cap8-serial = 0 componenti su #tutor. P3 Lucia ha preso 1/10 in entrambi. Lezione bloccata.

3. **F8-TITLEDUP** (4/80 scenari, −2.0): P4 Marco ha preso 1/10 su v3-cap6-esp3 (title dice "Esp. 2" ma è esp3) — confusion totale, ha abbandonato la sessione.

---

## Top 3 Confusion Points (per impatto pedagogico)

1. **C1-ROUTING**: "Cosa c'entrano i LED con il multimetro?" — P4 Marco su v2-cap3-esp1
2. **C2-LINGUAGGIO**: "Premi Play — chi preme? Io o i ragazzi?" — P1 Maria su v1-cap8-esp1
3. **C5-NOMOUNT**: "Ho aperto l'esperimento ma non vedo niente" — P3 Lucia su v3-cap7-mini

---

## Fix Nuovi da Simulazione (non in audit precedente)

- **P4 onboarding gap**: Score 2.9/10 riflette assenza totale di quick-start tutorial. Cycle 3+: "tutorial modalità 0" per nuovi utenti.
- **Modalità Libero nome ambiguo**: "Libero" senza sottotitolo è incomprensibile per P1 + P4. Suggerito rinominar in "Esplora" o aggiungere tooltip.
- **Extra label ambigua**: v3-extra-* senza riferimento al volume confonde P3 Lucia sulla coerenza col curriculum.

---

## Caveats

- Simulazione offline basata su audit data — NON testing live con utenti reali
- Score potenziali post-fix sono proiezioni, non misurazioni
- F1-ROUTING impact potrebbe essere peggiore di −2.5 se il docente attende la risposta a lungo
- F6-NOMOUNT potrebbe non impattare #lavagna route (LiveTest-2 ipotesi da verificare Cycle 2)

---

## Files Creati

- `docs/audits/sprint-u-cycle1-iter1-persona-simulation.md` (~430 LOC, 80 scenari)
- `automa/team-state/messages/persona-sprint-u-cycle1-iter1-completed.md` (questo file)
