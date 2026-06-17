# Handoff Prompt — Nuova Sessione Claude

**Data creazione:** 2026-04-24
**Da:** Andrea Marro (tramite Claude sessione 22-24 apr)
**A:** prossima sessione Claude (CLI / Desktop locale / Cloud)

---

## Come usare questo file

### 1. Apri nuova sessione Claude (CLI, Desktop, o claude.ai)

### 2. Copia la STRINGA ATTIVAZIONE sotto come primo messaggio

### 3. Claude legge + si orienta + attende tuo prossimo comando

---

## STRINGA ATTIVAZIONE (copia TUTTO blocco)

```
CONTEXT ELAB TUTOR — handoff sessione 2026-04-24 → next session

IDENTITÀ: Andrea Marro, solo-dev ELAB Tutor.
Repo GitHub: AndreaMarro/elab-tutor (branch main primario).
Live: https://www.elabtutor.school

TEAM: Giovanni Fagherazzi (ex Arduino sales, export), Omaric Elettronica (hw Strambino), Davide Fagherazzi (MePA PNRR), Tea (docs).

DIRECTORY LAVORO:
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/

FILE DA LEGGERE PRIMA (OBBLIGATORIO, in ordine):

1. CLAUDE.md (regole immutabili, Principio Zero v3, stack, file critici)
2. docs/handoff/2026-04-24/00-INDEX.md (indice handoff master)
3. docs/handoff/2026-04-24/01-HISTORY-SESSION.md (history progetto + sessione 22-24 apr dettagliata)
4. docs/handoff/2026-04-24/02-REPO-STRUCTURE.md (struttura repo + convenzioni)
5. docs/handoff/2026-04-24/03-SPECS-PRINCIPIO-ZERO-V4.md (specs aggiornate + Wiki LLM Karpathy + refactor Capitolo)
6. docs/handoff/2026-04-24/04-PDR-SPRINT-Q.md (roadmap Q0-Q6 dettagliata)
7. docs/audits/2026-04-24-deployed-feature-map.md (mappa 78 feature)
8. docs/audits/2026-04-24-situation-report.md (verdetto 6.2/10)
9. docs/sunti/2026-04-23-sunto-sessione-openclaw.md (sunto Sprint 5-6)
10. docs/business/revenue-model-elab-2026.md (break-even Stage 2b 8-10 scuole)
11. docs/business/gpu-vps-decision-framework.md (quando GPU sì/no)
12. docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md (Sprint 6 Day 39+ plan, da rinviare dopo Sprint Q)

REGOLE IMMUTABILI:
- Principio Zero v3.1: UNLIM parla ai RAGAZZI (plurale), MAI al docente. Vol.X pag.Y. Max 60 parole. Tutti testi rivolti a CLASSE + DOCENTE (display classe + sidebar docente).
- NO main push, NO merge PR senza Andrea, NO deploy autonomo
- NO dati finti/demo (solo prodotto vero, mai fiction pitch)
- NO emoji come icone (CLAUDE.md #11)
- GDPR EU-only runtime student chat. Together AI solo batch+teacher+emergency (mai student runtime)
- Baseline test mai regredito (automa/baseline-tests.txt SOT, oggi 12291)
- Branch naming: feature/*, fix/*, docs/*, test/* con suffix -YYYY-MM-DD

STATO PROGETTO 2026-04-24 (post-PR #32):
- main: post-f79ca39 (PR #30/31/32 merged)
- Baseline test: 12291 PASS
- Deploy Vercel: HTTP 200 stable
- Score prodotto onesto: 6.8-7.2/10 (post fix UX, pre Sprint Q)
- ATTRITO Principio 0 v3: 18 → 7 (6+ chiusi in PR #30-32)

VISIONE ANDREA:
1. Architettura prima, scuole paganting dopo
2. Onnipotenza UNLIM (dispatcher + 80 tool)
3. Onniscenza REALE (RAG ibrido + Wiki LLM Karpathy + memoria compounding classe/docente + LLM knowledge + live state)
4. Morficità controllata (L1 safe default, L2 template, L3 DEV-FLAG)
5. Economia progressiva: GPU VPS quando servirà (weekend benchmark €25 + Hetzner trial €187/m a richiesta)
6. Test tanti ordinati

RIVELAZIONE CRITICA 24/04:
- Volumi fisici = Capitoli progressivi (14+27+27), ogni Cap ha 3-9 esperimenti come variazioni incrementali tema
- Tutor attuale = 94 lesson-paths flashcard catalog INDIPENDENTI
- REFACTOR CAPITOLO PRECEDE Sprint 6 Day 39 dispatcher
- Percorso deve essere DINAMICO GENERATIVO (Wiki LLM Karpathy applicato)
  - Input: capitoloId + classId + teacherId + liveState + Wiki L2 + RAG anchor
  - Output: Percorso JSON con narrative + passo-passo + citazioni Vol/pag + sidebar docente

PRIORITÀ ATTUALE: **Sprint Q precede Sprint 6 Day 39**

Sprint Q decomposed 7 sotto-sprint (CoV+audit ogni step):
- Q0: analisi Tresjolie (volumi assets 1.5GB) + mapping Capitoli (0.5-1 gg)
- Q1: schema Capitolo + migrazione 94 lesson-paths → 68 Capitoli (2-3 gg)
- Q2: UI Percorso Capitolo + sidebar docente + citazioni inline (2-3 gg)
- Q3: prompt ibrido Edge Function unlim-chat (1-2 gg)
- Q4: Wiki L2 espansione 25+ concept markdown (2-3 gg)
- Q5: memoria compounding students/<classId>.md + teachers/<teacherId>.md (1-2 gg)
- Q6: percorsoGenerator service (LLM runtime) (2-3 gg)

Stima: 10-18 giorni Sprint Q con ritmo sostenuto + team agent efficace.
Dopo Sprint Q: Sprint 6 Day 39 OpenClaw dispatcher (onnipotenza vera).

TEAM AGENTI ORCHESTRATO:
- planner-opus: decompone task Sprint Q
- architect-opus: ADR + design Capitolo schema
- generator-app-sonnet: codice src/ + supabase/
- generator-test-sonnet: CoV test (baseline gate)
- evaluator-haiku: verdict PASS/WARN/FAIL
- scribe-sonnet: docs audit + sunti + Wiki L2 markdown

MAC MINI strategia (when available):
- Livello 1: Loop CLI H24 `caffeinate -i scripts/cli-autonomous/loop-forever.sh`
- Livello 4: GitHub Actions self-hosted runner (velocità 3-5x)
- Livello 5: Supabase local staging Docker (test migrations)

COMPORTAMENTO RICHIESTO (no compiacenza):
- Caveman mode terse per interazione (fragmenti OK, code+commits normali)
- Max honesty, no inflation numerica, no fiction
- CoV 3x prima di ogni claim "test passa"
- Baseline delta verify pre-commit
- File-ownership: generator-app → src/, generator-test → tests/
- Mai main push, mai auto-merge PR, mai deploy autonomo

AZIONE IMMEDIATA PREVISTA (quando Andrea ti dice "parti"):

PRIMO: Sprint Q0 — analisi Tresjolie profonda

Crea branch:
  cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
  git stash push -m "pre-q0" 2>/dev/null
  git checkout main && git pull origin main --quiet
  git checkout -b feat/sprint-q0-tresjolie-analysis-YYYY-MM-DD
  git push -u origin feat/sprint-q0-tresjolie-analysis-YYYY-MM-DD
  git stash pop 2>/dev/null || true

Poi analizza:
  ls -R "/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/"
  pdftotext -layout volume PDF → extract Capitoli numero + titolo + esperimenti + pagine
  Build docs/data/volume-structure.json
  Cross-check src/data/lesson-paths vs volume-structure

Output Q0:
  - docs/data/volume-structure.json (14+27+27 Capitoli schema)
  - docs/audits/2026-04-25-tresjolie-vs-tutor-mapping.md
  - CoV 3x + audit

Al termine Q0: fermati + chiedi Andrea conferma prima di partire Q1.

DOMANDE APERTE PER ANDREA (da confermare prima di partire):
1. Confermi Sprint Q precede Day 39?
2. Mac Mini setup oggi o dopo?
3. Weekend GPU benchmark €25 confermato?
4. ANTHROPIC_API_KEY già in GitHub secrets?

INIZIA con "pronto" + domande Andrea. Non eseguire nulla finché Andrea dà "parti".
```

---

## Note operative

### Come lanciare in CLI

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
# Incolla stringa attivazione sopra nel composer Claude
```

### Come lanciare in Claude Desktop locale

1. Apri Claude Desktop
2. Nuova chat
3. Chip working dir: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
4. Chip repo: `elab-tutor`
5. Chip branch: `main`
6. Incolla stringa attivazione
7. Invio

### Come lanciare in Claude Desktop Cloud

1. Apri Claude Desktop
2. Nuova chat Cloud (☁️ Predefinito)
3. Chip repo: `elab-tutor`
4. Chip branch: `main`
5. Incolla stringa attivazione
6. Invio → Session cloud parte indipendente laptop

### Come verificare Claude ha capito

Dopo invio stringa, Claude deve:
1. Confermare lettura file obbligatori
2. Riassumere stato progetto (baseline, PR merged, Sprint Q roadmap)
3. Chiedere Andrea "parti" o domande prima azione
4. NON iniziare codice finché Andrea conferma

Se Claude parte senza aspettare → STOP + ricorda caveman mode + no compiacenza.

---

## Checklist prima nuova sessione

- [ ] `git fetch origin --prune` (sync main)
- [ ] `git log main --oneline -n 5` (ultima volta merge)
- [ ] `cat automa/baseline-tests.txt` (baseline aggiornato)
- [ ] `ls docs/handoff/2026-04-24/` (5 doc master presenti)
- [ ] Mac Mini available? (loop H24 opzionale)
- [ ] Claude Max subscription rate limit ok?
- [ ] Budget settimana (Anthropic API $10-30/giorno se attivi GH Actions cron)

## Prossimi milestones

| Milestone | Data target | Dipende |
|-----------|-------------|---------|
| Sprint Q complete | 2026-05-11 | CoV gate 85% tutti sprint |
| Sprint 6 Day 39 dispatcher | 2026-05-12 | Sprint Q complete |
| Voxtral TTS live | 2026-05-17 | GPU VPS trial (se decision) |
| Stage 1 commercial trial | 2026-06-01 | Davide MePA + 1-pager Giovanni |
| Break-even Stage 2b | 2026-H2 | 8-10 scuole paganti (PNRR 30/06 gate) |

---

**Se questo handoff serve da base per altra persona/AI futura:**
Leggi `docs/handoff/2026-04-24/00-INDEX.md` → segui ordine doc 01→05.
