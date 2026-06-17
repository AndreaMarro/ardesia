# Next Session Prompt — 2026-04-26 onwards

**Activation string per nuova sessione Claude Code:**

---

```
Carica context da:
1. CLAUDE.md
2. docs/sprint-q/SPRINT-Q-HISTORY-COMPREHENSIVE.md
3. docs/pdr/PDR-MASTER-NEXT-DAYS-2026-04-26.md
4. docs/pdr/PDR-DEPLOY.md (se esiste)
5. docs/pdr/PDR-INTEGRATION.md
6. docs/pdr/PDR-MAC-MINI.md
7. docs/pdr/PDR-AGENT-ORCHESTRATION.md

STATO CHIUSURA SESSIONE 2026-04-25:
- Sprint Q TUTTO Q0→Q6 consegnato
- 7 PR draft aperte: #34 (Q0), #35 (Q1), #36 (Q2), #37 (Q3), #38 (Q4), #39 (Q5), #40 (Q6)
- Baseline test: 12498 PASS (Sprint Q +207, zero regression)
- main: post-PR #33, deploy Vercel HTTP 200
- Documentation comprehensive in docs/sprint-q/ + docs/pdr/

PRIORITÀ NEXT SESSION (in ordine):
1. Andrea review + merge cascade 7 PR Sprint Q (#34→#40 sequenziale)
2. Wire-up Edge Function unlim-chat (Q3 production)
3. Q2 UI integration LavagnaShell (replace PercorsoPanel)
4. GDPR remediation production (Together gate + Gemini EU endpoint)
5. Mac Mini infrastructure (livello 1 loop H24 + livello 4 GH runner + livello 5 Supabase local)
6. Sprint 6 Day 39 OpenClaw dispatcher (PDR esistente docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md)
7. Volumi TRES JOLIE assets import (1.5GB)
8. Weekend GPU benchmark Hetzner trial €25

REGOLE IMMUTABILI (CLAUDE.md):
- Principio Zero v3.1: UNLIM parla ai RAGAZZI plurale, MAI al docente
- NO main push, NO merge PR senza Andrea, NO deploy autonomo
- NO dati finti/demo
- NO emoji come icone (BookIcon ElabIcons)
- GDPR EU-only runtime student chat
- Baseline test mai regredito (automa/baseline-tests.txt SOT)
- Branch naming feature/* fix/* docs/* + suffix YYYY-MM-DD
- TDD strict Red-Green-Refactor ogni feature
- CoV 3x prima ogni claim "test passa"

TEAM AGENTI:
- planner-opus, architect-opus (read-only ADR)
- generator-app-sonnet (src/, supabase/)
- generator-test-sonnet (tests/, CoV TDD)
- evaluator-haiku (verdict PASS/WARN/FAIL)
- scribe-sonnet (docs/audits, sunti, Wiki L2)

ORCHESTRAZIONE:
- Sprint major (Sprint 6+): 5 agenti × 4 iterazioni + 3 agenti × 2 iterazioni con CoV/audit periodico
- Iterazioni rapide: 1 agent + TDD strict + CoV
- File ownership rigido (generator-app → src/, generator-test → tests/)

INFRASTRUCTURE:
- MacBook Air Andrea (primary dev)
- Mac Mini Strambino (loop H24, target setup completo Day +5)
- Weekend GPU Hetzner €25 (parallelo non blocca)

COMPORTAMENTO:
- Caveman mode terse (fragmenti OK, code+commits normali)
- Max honesty, no inflation numerica, no compiacenza
- CoV 3x prima ogni "test passa"
- Baseline delta verify pre-commit
- Mai main push, mai auto-merge PR, mai deploy autonomo

INIZIA leggendo i file context ordine sopra, poi ricevi conferma Andrea sequenza priorità prima eseguire.
```

---

## Comandi quick start

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git fetch --all
git checkout main
git pull origin main --quiet
npx vitest run 2>&1 | grep "Tests" | head -1   # verify baseline
gh pr list --state open --limit 10
```

## Stato repo expected al riavvio

```
main @ post-PR #33 (o post-merge #34-40 se Andrea ha mergiato)
Baseline: 12291 (pre Sprint Q) o 12498 (post Sprint Q merge)
PR aperte: 0-7 a seconda merge Andrea
Branch attivi: feat/sprint-* (post Sprint Q) o nuovi (Sprint 6+)
```

## Cose NON fare

- Non bypassare pre-commit hook
- Non skippare CoV 3x
- Non chiamare LLM provider USA (Together AI) per student runtime
- Non emoji come icone in componenti
- Non violare PRINCIPIO ZERO (linguaggio plurale ragazzi, citazioni Vol/pag, max 60 parole, no comandi docente)
- Non fare auto-deploy in produzione
- Non mergare PR senza Andrea OK

## Cose SI fare

- TDD strict ogni feature
- CoV 3x ogni gate
- Audit doc per ogni Sprint
- Branch dedicato + PR draft
- Pre-commit hook PASS sempre
- Baseline test mai regredito
- File ownership rispettato
