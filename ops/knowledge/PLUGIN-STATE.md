# PLUGIN-STATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — GitHub deep, ELAB PR triage

## Architecture (canon, from prior sessions, not re-verified this pass)

ARDESIA is plugin-native: OS → Plugin → Pack → Workflow. The plugin host lives in ardesia-studio (mini name `maestro-studio` / ToolHost). Per canon it is production-grade-built but NOT mounted in prod (not re-verified in WF1 — see unknowns).

## What WF1 evidence touches

- **ardesia-studio** is the only canonical code repo with a real CI gate on its default branch (`main`: required status check `gate`, strict=false, enforce_admins=false). It is the ToolHost / plugin-host repo. Open PR **#2** (CLEAN, MERGEABLE) ratifies auto/main → main (3 commits, stale since 2026-06-18).
- **ELAB PR #195** (DRAFT, additive-only, +11192/0) ships a real **ELAB domain graph + CircuitScene model + simulator audit**. WF1 verdict: **plugin-port-to-Ardesia** — port CircuitScene + domain graph into the ARDESIA plugin host rather than landing in ELAB core. This is the simulator/plugin substrate referenced in canon.

## Flags
- ardesia-studio has **NO docs/** folder (README only) → plugin-host docs gap.
- Divergent lineage on ardesia-studio (mini `899a350` ≠ GitHub auto/main `f881a78`) complicates any plugin-host promotion (gate-Andrea reconcile).

## Unknowns (not verified this pass)
- Whether the plugin host is mounted in prod (canon says built-not-mounted; WF1 did not re-verify).
- CircuitScene provenance / LessonMode enum implementation status.

## Gate-Andrea
- Merge ardesia-studio #2 (ratifica).
- Decision to port ELAB #195 CircuitScene/domain-graph into the plugin host.
