# Handoff — Iter 19 → Iter 20 (Sprint T)

**Date**: 2026-04-29
**Sprint**: T iter 18-30 | **From**: iter 19 PHASE 1 close 8.7-8.8/10 ONESTO | **To**: iter 20 entrance target 8.8-9.0/10
**Author**: scribe-opus PHASE 2 sequential
**Cross-link**: `docs/audits/iter-19-PHASE-1-audit-2026-04-29.md` + `PDR-ITER-19-ATOMS.md`

---

## §1 — Iter 20 Activation String (paste-ready)

```
[Sprint T iter 20 entrance — 2026-04-29 AM CEST]

Carry-over iter 19 PHASE 1 close: 8.7-8.8/10 ONESTO. PHASE 3 still pending (harness EXECUTE + commit + Mac Mini trigger).

P0 iter 20 entrance:
1. Read docs/audits/iter-19-PHASE-1-audit-2026-04-29.md §6 PHASE 3 next steps + execute remainder if not done.
2. composite-handler.ts → dispatcher.ts wire-up (per ADR-024 §6 + iter 19 A9 ATOM, gate `COMPOSITE_HANDLER_PROD_ACTIVE` flip plan).
3. onniscenza-bridge.ts → unlim-chat Edge Function wire-up (4 lines pre-LLM call addition + smoke).
4. content-safety-guard.ts deploy supabase functions deploy --project-ref euqpdueopmlllqjmqnyb (post curl smoke 5 evil prompts ≥80% block).
5. Andrea ratify ADR-025 + ADR-026 + ADR-027 (Telegram approve queue voci 1-6+11+12).
6. Mac Mini D2 Tea Glossario ingest dry-run (A8 deliverable iter 20 first).
7. Pattern S 4-agent OPUS PHASE-PHASE iter 20 spawn (planner + architect + gen-app + gen-test → scribe Phase 2 sequential).

Iter 20 score target: 8.8-9.0/10 ONESTO (G45 cap, NO inflation >9 senza Opus indipendente cross-verify).
```

---

## §2 — Iter 20 P0 Entrance Tasks (concrete)

### P0.1 — composite-handler.ts → dispatcher.ts wire-up

- **File**: `scripts/openclaw/dispatcher.ts` MODIFY +40 LOC
- **Action**: branch composite-tool dispatch when `COMPOSITE_HANDLER_PROD_ACTIVE === 'true'`. Iter 19 gen-app extended composite-handler runtime active code (492 → 634 LOC) but dispatcher branch still opt-in.
- **CoV gate**: vitest openclaw 129 PASS preserved (current baseline) + 8 NEW composite tests target (extend 5 → 13). Build PASS.
- **ADR cross-link**: ADR-024 §6 + ADR-013 D2 + ADR-026 §pre-execute consapevolezza.
- **Duration**: ~1.5h

### P0.2 — onniscenza-bridge.ts → unlim-chat Edge Function wire-up

- **File**: `supabase/functions/unlim-chat/index.ts` MODIFY +15-20 LOC pre-LLM section
- **Action**: import `getOnniscenzaSnapshot` from `_shared/onniscenza-bridge.ts`. Call pre-LLM with `{ intent, exp_id, user_id, class_key }` from request ctx. Inject snapshot.layers into prompt context (RAG + Wiki + memory currently flat → structured 7-layer post-bridge).
- **Stub fallback**: L3+L5+L6 still stub (return empty arrays). Verify NO crash.
- **CoV gate**: smoke 1 unlim-chat call → 200 OK + response includes plurale "Ragazzi" + Vol/pag.
- **Duration**: ~1h

### P0.3 — content-safety-guard.ts deploy production

- **Pre-deploy**: curl smoke 5 evil prompts (volgari + off-topic + privacy minore + imperativo docente + Vol/pag falso) → ≥80% block+retry.
- **Deploy command**:
  ```bash
  SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
  ```
- **Post-deploy verify**: re-run R5 50-prompt stress fixture → check `safety_guard_fires` counter telemetry per ADR-026 §11.
- **Rollback**: deploy previous git tag if regression on R5 baseline 91.80%.
- **Duration**: ~30 min (Andrea OAuth approve + curl + deploy)

### P0.4 — Andrea ratify ADR-025 + ADR-026 + ADR-027

- **Channel**: Telegram (sibling to Andrea queue tracker `automa/state/andrea-ratify-queue-iter-19.md` per A15).
- **Decisions needed**:
  - ADR-025: voci 1+2+3 modalità simplification + Libero auto-Percorso + Già Montato new mode.
  - ADR-026: voce 5 content safety 10 rules deploy.
  - ADR-027: voce 6 volumi narrative refactor (Davide co-review separate, deadline iter 25).
- **Plus voci 11+12 NEW iter 19 PHASE 1**: harness fixtures protocol + ADR over-cap LOC justification.
- **Duration**: ~10 min Andrea reading + Y/N response.

---

## §3 — Iter 20 ATOMs Continuation (from PDR-ITER-19-ATOMS unfinished)

PDR-ITER-19-ATOMS §17 dispatch order had PHASE 1 parallel (4 agents) + Phase 1 background (Mac Mini D1+D3) + Phase 2 sequential (scribe A16). Iter 19 PHASE 1 actually shipped:

| ATOM | Owner | Status iter 19 PHASE 1 | Iter 20 carry-over |
|------|-------|------------------------|--------------------|
| A1 (ADR-025 modalità) | architect | DONE 357 LOC | Andrea ratify pending |
| A2 (ADR-026 ClawBot consapevolezza) | architect | DONE 536 LOC (over-cap +136) | Andrea ratify pending |
| A3 (content safety 10 rules) | gen-app | CODE SHIPPED 306+15+15 LOC | DEPLOY iter 20 P0.3 |
| A4 (Volumi narrative Vol1+2+3 audit) | Mac Mini D3 | BLOCKED SSH .local | Iter 20 retry Tailscale IP |
| A5 (harness 2.0 enumerate) | gen-test | DONE 87/94 8 vitest PASS | Iter 20 EXECUTE live + golden fixtures iter 21 |
| A6 (RunPod bench integration) | gen-app | NOT VISIBLE PHASE 1 | Iter 20 verify file or re-dispatch |
| A7 (Mistral PAYG migration prep) | gen-app | NOT VISIBLE PHASE 1 | Iter 20 verify file or re-dispatch (Andrea voce 9 deadline 31/05) |
| A8 (Tea PDF Glossario ingest pipeline) | gen-app | NOT VISIBLE PHASE 1 | Iter 20 P0.6 dry-run + iter 21 live ingest |
| A9 (composite-handler runtime active EXTEND) | gen-app | DONE 492 → 634 LOC | Dispatcher wire-up iter 20 P0.1 |
| A10 (onniscenza-bridge.ts NEW) | gen-app | DONE 254 LOC STUB | Edge Function wire-up iter 20 P0.2 + L3+L5+L6 iter 22+ |
| A11 (Gold-set v4 30 queries Italian) | gen-test | DONE 30 queries 5 cat × 6 + provenance | Iter 20 cross-verify recall@5 ≥0.55 (B2 bench live) |
| A12 (8 NEW L2 templates Mac Mini D1) | Mac Mini D1 | BLOCKED SSH .local | Iter 20 retry Tailscale IP |
| A13 (Vercel env compile-proxy switch) | orchestrator | PENDING Andrea OAuth | Iter 20 voce 8 deadline iter 19 PAST → escalate iter 20 entrance |
| A14 (Mac Mini D1-D8 dispatch protocol YAML) | orchestrator | NOT VISIBLE PHASE 1 | Iter 20 author YAML if missing |
| A15 (Andrea ratify queue 12 voci tracker) | scribe | DONE in §5 of audit (this handoff §4 mirror) | Iter 20 update with Andrea decisions |
| A16 (CoV continuous + score recalibrate) | scribe + orch | DONE PHASE 1 (this audit + handoff) | PHASE 3 orchestrator post-scribe |

**Iter 20 ATOM continuation focus**: A3 deploy + A6+A7+A8+A14 verify-or-redispatch + A4+A12 Mac Mini retry + composite/onniscenza wire-up.

---

## §4 — Mac Mini D1-D8 Status Check

Per `docs/handoff/2026-04-28-mac-mini-ssh-access-debug.md` + memoria `mac-mini-autonomous-design.md`:

| D | Task | Status iter 19 close | Iter 20 entrance action |
|---|------|---------------------|------------------------|
| D1 | A12 8 NEW L2 templates overnight ~5h | BLOCKED SSH .local | retry `ssh progettibelli@100.124.198.59` Tailscale |
| **D2** | **Tea Glossario ingest dry-run (A8)** | **PENDING (priority iter 20 first deliverable)** | **first overnight target iter 20** |
| D3 | A4 Volumi audit ~6h | BLOCKED SSH .local | retry Tailscale post D1 success |
| D4 | Build verification cross-branch continuous | PENDING dispatch | iter 20 enable post Tailscale OK |
| D5 | Lighthouse audit /scuole + lavagna weekly Sunday | PENDING dispatch | iter 21 Sunday |
| D6 | Cost monitor Gemini/Mistral/Scaleway daily 08:00 CEST | PENDING dispatch | iter 20 enable |
| D7 | Supabase backup nightly + RLS audit 02:00 CEST | PENDING dispatch | iter 20 enable |
| D8 | GitHub PR review CodeRabbit AI continuous | PENDING dispatch | iter 20 enable |

**Iter 20 entrance**: SSH retry + escalate Andrea Telegram if 3 retry fail. Per CLAUDE.md SSH key policy enforced (id_ed25519_elab MacBook only).

---

## §5 — Score Progression Iter 20 Target

| Iter | Phase | Score ONESTO | Delta | Drivers |
|------|-------|--------------|-------|---------|
| 18 | close | 8.5/10 | — | (PDR-MASTER §1 carry-over) |
| 19 | entry | 8.5-8.7 | +0.0-0.2 | iter 18 PM addendum mandates registered |
| 19 | PHASE 1 close | **8.7-8.8** | +0.1-0.2 | 4 agents OPUS deliverables (4661 LOC + 76 NEW tests + ZERO regression) |
| 19 | PHASE 3 close PROJECTION | 8.8-9.0 | +0.1-0.2 | harness EXECUTE + Andrea ratify ADR-025/026/027 + content-safety deploy |
| **20** | **entry** | **8.8-9.0** | **+0.0** | (carry-over from 19 PHASE 3) |
| **20** | **close TARGET** | **9.0-9.2** | **+0.2-0.3** | dispatcher wire-up + onniscenza wire-up + content-safety deployed prod + Mac Mini D2+D1 PASS |

NO inflation auto-score >9 senza Opus indipendente cross-verify (G45 anti-inflation per CLAUDE.md gate). Score 9.0-9.2 conditional iter 20 close, NOT auto-claim.

---

## §6 — Open Andrea Ratify Queue 12 voci (sync with audit §5)

Per audit §5 ratify queue 12 unique voci dedup:

**Past deadline (escalate iter 20 entrance)**:
- voce 7 RunPod stessi modelli — DONE pending verify
- voce 8 Vercel env switch compile-proxy — Andrea OAuth required iter 20 entrance

**Iter 22 deadline**:
- voce 1+2+3 (modalità) → ADR-025
- voce 4 (ClawBot consapevolezza) → ADR-024 §5 + ADR-026
- voce 5 (content safety 10 rules deploy) → ADR-026
- voce 10 (Tea co-dev formalize) → TBD pending Andrea decision (termini NON specificati)
- voce 12 (ADR-026 over-cap LOC justify)

**Iter 23 deadline**:
- voce 3 (Già Montato new mode UX spec)
- voce 4 (ClawBot Onniscenza-bridge ratify)

**Iter 25 deadline**:
- voce 6 (Volumi narrative refactor Davide co-review) → ADR-027
- voce 12 (ADR-027 over-cap LOC justify)

**31/05 deadline**:
- voce 9 (Mistral PAYG OAuth + €500 first month)

**Iter 21 deadline**:
- voce 11 (Harness 2.0 golden fixtures protocol)

**Tracker file**: `automa/state/andrea-ratify-queue-iter-19.md` (planner A15 owner). If file missing iter 19 close, scribe-opus iter 20 author from this §6.

---

## §7 — Pre-Iter-20 Setup Checklist (~5-10 min Andrea)

1. [ ] Andrea read this handoff §1 activation string
2. [ ] Andrea Tailscale verify Mac Mini reachable (`ping 100.124.198.59`)
3. [ ] Andrea Telegram approve voci 1-6+11+12 (~10 min)
4. [ ] Andrea OAuth Vercel env switch compile-proxy (voce 8, ~5 min)
5. [ ] Andrea decide if Mistral PAYG signup imminent (voce 9, deadline 31/05)
6. [ ] Andrea env provision PHASE 3 if needed: `SUPABASE_ACCESS_TOKEN`, `VOYAGE_API_KEY`, `ELAB_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
7. [ ] Andrea Telegram authorize iter 20 spawn 4-agent OPUS PHASE-PHASE

---

## §8 — Cross-references

- `docs/audits/iter-19-PHASE-1-audit-2026-04-29.md` (sibling, score 8.7-8.8/10 ONESTO)
- `docs/pdr/2026-04-29-sprint-T-iter-18+/PDR-ITER-19-ATOMS.md` (16 ATOMs)
- `docs/pdr/2026-04-29-sprint-T-iter-18+/PDR-MASTER-2026-04-29.md` (master Sprint T)
- `docs/pdr/2026-04-29-sprint-T-iter-18+/ANDREA-MANDATES-ITER-18-PM-ADDENDUM.md` (mandates §1-§6)
- `docs/architectures/ADR-025-modalita-4-simplification-2026-04-29.md`
- `docs/architectures/ADR-026-content-safety-guard-runtime-2026-04-29.md`
- `docs/architectures/ADR-027-volumi-narrative-refactor-schema-2026-04-29.md`
- `docs/handoff/2026-04-28-mac-mini-ssh-access-debug.md` (SSH .local debug)
- memoria `mac-mini-autonomous-design.md` (D1-D8 protocol)
- memoria `G45-audit-brutale.md` (anti-inflation methodology)
- `automa/state/iter-19-harness-2.0-results.json` (87/87 stub-mode PASS)
- `automa/baseline-tests.txt` (12290 — re-run mandatory)

---

**FINE handoff iter-19-to-iter-20**. Iter 20 entrance score 8.8-9.0/10 (carry-over post-PHASE 3 lift). Iter 20 close target 9.0-9.2/10 ONESTO conditional dispatcher+onniscenza wire-up + content-safety deploy + Mac Mini D2+D1 PASS + Andrea ratify 5+ voci. NO push main. NO `--no-verify`. NO inflation >9.
