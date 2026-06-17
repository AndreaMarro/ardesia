# RALPH LOOP DEFINITIVO — Sessione 18 Aprile 2026

## PRINCIPI FONDAMENTALI (non negoziabili)

1. **Principio Zero**: chiunque apra ELAB Tutor deve poter spiegare ai ragazzi SENZA conoscenze pregresse. UNLIM produce contenuto per la classe (10-14 anni) che il docente proietta sulla LIM.
2. **Parallelismo volumi 100%**: `bookText` nel simulatore DEVE dire ciò che il libro fisico dice. Zero `bookDivergence`. Se diverge → aggiorna il simulatore, non documenta il problema.
3. **UNLIM Jarvis-like**: onnisciente (contesto completo + libro + storia) + onnipotente (37 azioni + vision + voce). Ogni risposta cita il libro quando `experimentId` presente.
4. **I ragazzi usano il KIT FISICO, non il simulatore**. Il simulatore è per il docente sulla LIM.
5. **Onestà brutale**: ogni numero VERIFICATO con comando fresh. Score solo da `honesty-audit.sh` (mai self-eval). Ogni claim accompagnato da evidenza.
6. **Zero regressioni**: `npm run gate` prima/dopo ogni task. Se drop > 50 test → STOP e investiga.
7. **Test comportamentali non triviali**: no "campo esiste", solo "utente reale fa X → risultato Y". Playwright/Control Chrome obbligatorio per UI.
8. **Ricerca web necessaria**: TTS 2026, LLM pricing, competitor — mai fidarsi di numeri cached.
9. **Quando pensi di aver finito, NON HAI FINITO**. Rifai test, riprova scenari, cerca edge case. Solo debug sistematico finale chiude la sessione.
10. **I ragazzi lavorano sui kit, mai sul simulatore**. Ripeti: i ragazzi lavorano sui kit, mai sul simulatore. Internalizzalo.

## OBIETTIVO

Portare ELAB Tutor al suo stato definitivo e professionale. UNLIM onnisciente e onnipotente (prepara lezioni con linguaggio 10-14 anni dai volumi + storia sessioni; può eseguire qualsiasi azione sul simulatore; è proattivo quando il docente è impreparato). Parallelismo volumi ↔ simulatore al 100%. Bug lavagna e toolbar risolti. Test E2E reali con Control Chrome / Playwright non triviali.

## ATTIVAZIONE

**Prompt per Ralph Loop:**

```
Esegui PDR v3 DEFINITIVO (docs/plans/2026-04-18-PDR-v3-DEFINITIVO.md). Leggi PRIMA:
- docs/plans/2026-04-17-session-summary.md (handoff precedente)
- CLAUDE.md (contesto + regole ferree)
- docs/strategia/2026-04-17-stack-tts-llm-slm.md

PRIORITA: (1) allineare 3 esperimenti Vol3 al libro fisico, (2) UNLIM onnisciente-onnipotente con citazione libro in ogni risposta, (3) bug lavagna persistenza + trascinamento toolbar, (4) test E2E Playwright+Control Chrome non triviali (docente impreparato, vision live, voice E2E), (5) useUnlimNudge integrato in EmbeddedGuide, (6) proxy CORS Edge TTS, (7) dashboard docente con dati reali Supabase.

PRINCIPIO ZERO: chiunque apre ELAB deve spiegare ai ragazzi senza conoscenze pregresse. UNLIM produce contenuto che il docente proietta sulla LIM (non si rivolge al docente). Docente guarda con la coda dell'occhio. Se impreparato, UNLIM diventa piu proattivo e pone domande direttamente alla classe.

REGOLE FERREE:
- npx vitest run PRIMA e DOPO ogni modifica (baseline 11983 PASS)
- npm run build dopo ogni task
- Commit con "Test: NNNN/NNNN PASS"
- CoV audit ogni 3 task
- Mai inflazionare score
- Test comportamentali non strutturali
- Playwright MCP per UI E2E (docente impreparato reale)
- Baseline VERIFICATA: 11983 test, build OK, Supabase vivo, compiler OK

ANTI-REGRESSIONE: se test count scende → git stash && npx vitest run (isola causa).

DEBUG SISTEMATICO FINALE alla fine.

Metodo AGILE: commit frequenti, task bite-sized, fresh agent per task complessi, code review fra uno e l'altro.

Baseline git: c6b04a0. Test baseline: 11983/11983 PASS. Score onesto: 8.5/10. Target finale: 9.5/10.

Ralph Loop max 30 iter, completion promise: quando tutti i task del PDR sono completati e tutti i test passano e debug sistematico produce zero P0.
```

## STRINGA RALPH LOOP (copia-incolla)

```
/ralph-loop:ralph-loop PDR v3 DEFINITIVO: allinea 3 Vol3 al libro + UNLIM onnisciente-onnipotente con Kokoro TTS e Porcupine wake word + fix bug lavagna e toolbar + E2E Playwright/Control Chrome + ricerca web TTS/LLM 2026 + useUnlimNudge integrato + dashboard dati reali Supabase. Leggi docs/plans/2026-04-17-session-summary.md + docs/plans/2026-04-18-PDR-v3-DEFINITIVO.md + docs/strategia/2026-04-17-unlim-jarvis-architecture.md + docs/strategia/2026-04-17-stack-tts-llm-slm.md. Principio Zero, CoV ogni 3 task, zero regressioni. Baseline 11983 test PASS. MCP OBBLIGATORI: WebSearch + Playwright + Control Chrome. --max-iterations 100
```

## CHECKLIST OPERATIVA PRIMA DI INIZIARE (BLOCCANTI)

- [ ] Git status pulito o stash salvato
- [ ] `npx vitest run` → 11983 PASS (se non: ripristina baseline)
- [ ] `curl https://www.elabtutor.school` → 200
- [ ] **WebSearch / WebFetch disponibili** (OBBLIGATORI per ricerca TTS/LLM 2026, Porcupine pricing, competitor)
- [ ] **Playwright MCP connesso** (OBBLIGATORIO per test E2E)
- [ ] **Control Chrome / Claude-in-Chrome** (OBBLIGATORIO per test docente impreparato su produzione)
- [ ] Supabase token `sbp_REVOKED_20260423_REDACTED` valido
- [ ] `/tmp/vol1.txt`, `vol2.txt`, `vol3.txt` presenti (se no: `pdftotext` da VOLUME 3/CONTENUTI/volumi-pdf/)
- [ ] Skills attive: `superpowers:executing-plans`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`, `superpowers:test-driven-development`
- [ ] Ralph Loop plugin disponibile

**Se uno dei 3 MCP (WebSearch, Playwright, Control Chrome) NON è disponibile all'avvio: FERMATI e chiedi ad Andrea di connetterli. NON procedere — la qualità del risultato dipende da loro.**

## FLUSSO SUGGERITO

### Fase 1 (iter 1-5): Bug Lavagna + Toolbar
1. Task 1: persistenza disegni lavagna
2. Task 2: trascinamento toolbar
3. CoV audit

### Fase 2 (iter 6-12): Parallelismo Vol3
4. Task 3: v3-cap6-esp1
5. Task 4: v3-cap7-esp1
6. Task 5: v3-cap7-esp5
7. CoV audit

### Fase 3 (iter 13-20): UNLIM Onnipotente
8. Task 6: useUnlimNudge in EmbeddedGuide
9. Task 7: UNLIM cita libro in ogni risposta
10. Task 8: Vision E2E Playwright
11. Task 9: Voice E2E
12. CoV audit

### Fase 4 (iter 21-28): Infra + Dashboard + Ricerca web + OpenClaw
13. Task 10: CORS Edge TTS proxy
14. Task 11: Dashboard dati reali
15. **Task 11a: Valutazione OpenClaw SERIA** (Andrea priorità) — 3 use case concreti (dev ops Ralph, classe Telegram report, commerciale KPI), fattibilità, costo, PoC se <2h
16. Task 11b: **Ricerca web** (WebSearch MCP) — benchmark TTS 2026, Porcupine pricing, Gemini costs, competitor analysis corrente → aggiornare doc strategia

### Fase 5 (iter 27-60): Debug sistematico + Stress test + Handoff
16. Task 12: debug sistematico completo
17. Task 13: 50 stress test utente reale (docente impreparato, bambino frustrato, classe rumorosa)
18. Task 14: simulazione 200 insegnanti (vari scenari)
19. Task 15: `npm run audit:honesty` — verifica trivial_ratio, todos, console_logs
20. Task 16: aggiorna `commercial-readiness.json` con score OGGETTIVO
21. Task 17: crea PDR v4 per sessione successiva

### Fase 6 (iter 61-100): Self-doubt loop (anti-complacency)
**Se in qualsiasi momento pensi di aver finito:**
22. Rifai `npm run gate` → ci sono regressioni?
23. Esegui 20 scenari Playwright utente cattivi (tap casuali, offline, tab nuove)
24. Apri 10 esperimenti random via Control Chrome e verifica UI integrity
25. Cerca TODO/FIXME in src/ → fissane almeno 5
26. Fai `honesty-audit.sh` → leggi `trivial_ratio` e `todos_and_fixmes` → agisci
27. Ricomincia da capo fino a debug sistematico PULITO

**Non uscire dal Ralph Loop finché:** `gate-result.json` verdict=PASS AND `honesty-audit.json` trivial_ratio < 0.3 AND todos_and_fixmes < 50 AND 11983 test diventano 14000+.

## DOCUMENTI UTILI AL NUOVO CLAUDE

Creati in questa sessione 17/04:
- `docs/plans/2026-04-17-session-summary.md`
- `docs/plans/2026-04-18-PDR-v3-DEFINITIVO.md` (questo PDR)
- `docs/strategia/2026-04-17-stack-tts-llm-slm.md`
- `automa/state/d2-api.json` (verità verificata)

Creati in sessioni precedenti:
- `docs/plans/2026-04-15-PDR-v2-ULTRA.md` (PDR precedente)
- `docs/prompts/2026-04-15-RALPH-LOOP-ULTRA.md` (prompt precedente)
- `CLAUDE.md` (contesto codice)
- `automa/state/commercial-readiness.json` (audit 30 criteri)
- `automa/state/volume-parity-audit-v2.json` (parità volumi sample)
- `automa/state/a2-unlim.json` (qualità UNLIM)
- `automa/state/t1-utenti.json` (simulazione utenti)
- `automa/state/a1-volumes.json` (audit volumi iniziale)
- `automa/state/d1-ux.json` (accessibilità)

## ASPETTATIVE DI RISULTATO

**Per Andrea alla fine della sessione:**
- Prodotto commerciale completo per demo Fagherazzi
- Vol3 allineato al libro (parallelismo 100%)
- UNLIM cita libro sempre, risposte <60 parole, tono classe 10-14
- Lavagna + toolbar funzionano perfettamente
- Dashboard docente con dati reali
- Vision + Voice verificati live
- TTS naturale in produzione (proxy CORS)
- Score onesto 9.5/10 (CoV indipendente)

**Deliverable fisici:**
- Commit firmati su main (con PR se branch protection attiva)
- PDR v4 per sessione successiva
- Documento handoff completo
- Commercial readiness 27+/30
- Test suite >14000 con coverage comportamentale

---

*Prompt generato 17/04/2026 — per Ralph Loop DEFINITIVO del 18/04/2026. ZERO compromessi. ONESTÀ BRUTALE.*
