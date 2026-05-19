#!/usr/bin/env node
/**
 * EPIC 1 / A4.1a — lesson-path validation gate (READ-ONLY).
 *
 * Compares every src/data/lesson-paths/*.json against its a3-corrections.json
 * entry (the correction contract). At A4.1a-time this reports RED — it IS the
 * A4.1 divergence work-list. It turns GREEN as A4.1b-e land.
 *
 * Usage: node scripts/epic1/validate-lesson-paths.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { norm } from './build-alignment-records.mjs';

export function checkLessonPath(id, lessonPath, correction) {
  const issues = [];
  if (!correction) {
    return { id, action: null, ok: false, issues: [`no correction entry for ${id}`] };
  }
  if (correction.action === 'remove') {
    // pending-removal fires ONLY while the lesson-path file still exists.
    // Once removed (lessonPath == null), the removal is complete → ok.
    if (lessonPath) {
      issues.push(`pending-removal: correction.action=remove but lesson-path ${id} still exists`);
    }
  } else if (correction.action === 'consolidate') {
    // pending-consolidation fires ONLY while the numbered-id lesson-path still
    // exists. Once consolidated (lessonPath == null), the consolidation is
    // complete → ok. Mirrors the A4.1b pending-removal fix (commit 36121f8f).
    if (lessonPath) {
      issues.push(`pending-consolidation: ${id} should be consolidated into ${correction.consolidateInto}`);
    }
  } else {
    // action keep | correct — the lesson-path must exist and match the contract.
    // The contract FULLY specifies title/chapter/nextId for keep/correct entries
    // (A4.1a Task-2 spec: title/chapter are never null for keep/correct). The
    // `!= null` guards on title/chapter are defensive. nextId is checked
    // UNCONDITIONALLY on purpose: `nextId: null` is a MEANINGFUL value here
    // (capstone = no next), not "unspecified" — a capstone whose lesson-path
    // has a next_experiment.id IS a real divergence to flag.
    if (!lessonPath) {
      issues.push(`missing-lesson-path: ${id} has a ${correction.action} correction but no lesson-path file`);
    } else {
      if (correction.bookFaithfulTitle != null
          && norm(lessonPath.title) !== norm(correction.bookFaithfulTitle)) {
        issues.push(`title: "${lessonPath.title}" != contract "${correction.bookFaithfulTitle}"`);
      }
      if (correction.chapter != null && Number(lessonPath.chapter) !== Number(correction.chapter)) {
        issues.push(`chapter: ${lessonPath.chapter} != contract ${correction.chapter}`);
      }
      const lpNext = lessonPath.next_experiment?.id ?? null;
      if (lpNext !== correction.nextId) {
        issues.push(`nextId: ${lpNext} != contract ${correction.nextId}`);
      }
    }
  }
  return { id, action: correction.action, ok: issues.length === 0, issues };
}

/**
 * EPIC 1 / A4.1d — reference-integrity check.
 * Every `next_experiment.id`, `session_save.next_suggested`, and
 * `prerequisites[]` entry must resolve to an existing lesson-path id, or be
 * `null` (a meaningful terminus / no-prerequisite value).
 *
 * `checkLessonPath` above compares a lesson-path's `nextId` against the
 * CONTRACT's `nextId` — if both are stale in the same direction (e.g. both
 * point at a removed id) it still passes. This check is independent: it
 * resolves references against the actual lesson-path registry, so a pointer
 * to a removed/non-existent id is caught regardless of the contract.
 *
 * @param {Record<string, object>} lessonPaths  keyed by experiment_id
 * @returns {string[]} one issue string per unresolved reference
 */
export function checkReferenceIntegrity(lessonPaths) {
  const validIds = new Set(Object.keys(lessonPaths));
  const issues = [];
  for (const [id, lp] of Object.entries(lessonPaths)) {
    const refs = [];
    const ne = lp.next_experiment?.id;
    if (ne !== undefined) refs.push(["next_experiment.id", ne]);
    const ns = lp.session_save?.next_suggested;
    if (ns !== undefined) refs.push(["session_save.next_suggested", ns]);
    for (const pr of lp.prerequisites ?? []) refs.push(["prerequisites[]", pr]);
    for (const [field, val] of refs) {
      if (val == null) continue; // null = meaningful terminus / no prerequisite
      if (!validIds.has(val)) {
        issues.push(`${id}: ${field} -> "${val}" does not resolve to a lesson-path`);
      }
    }
  }
  return issues;
}

/**
 * Pure cycle-detection over a `narrative_flow.transitions` array.
 * Each `transitions[].between` `[a, b]` pair is a directed edge a -> b.
 * Returns the node a cycle closes through, or `null` if the graph is acyclic.
 *
 * @param {Array<{between?: [string, string]}>} transitions
 * @returns {string|null}
 */
export function transitionsCycleNode(transitions) {
  if (!Array.isArray(transitions)) return null;
  const adj = new Map();
  for (const t of transitions) {
    const [a, b] = t?.between ?? [];
    if (a == null || b == null) continue;
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);
  }
  // DFS three-colour cycle detection (white=unseen, gray=on-stack, black=done)
  const color = new Map();
  let cycleThrough = null;
  const dfs = (n) => {
    color.set(n, 1); // gray
    for (const m of adj.get(n) ?? []) {
      if (color.get(m) === 1) {
        cycleThrough = m;
        return true;
      }
      if (color.get(m) === undefined && dfs(m)) return true;
    }
    color.set(n, 2); // black
    return false;
  };
  for (const n of adj.keys()) {
    if (color.get(n) === undefined && dfs(n)) return cycleThrough;
  }
  return null;
}

/**
 * EPIC 1 / A4.1d — narrative-flow acyclicity check.
 * Each `capitoli/*.json` `narrative_flow.transitions[].between` pair is a
 * directed edge; the per-chapter graph must be acyclic — Andrea's core
 * mandate is a CONTINUOUS narrative arc, not a loop. This catches the kind of
 * `semaforo <-> morse` 2-cycle A4.1c introduced (and which was invisible to
 * the contract check, because the validator never read capitoli files).
 *
 * @param {string} capitoliDir  absolute path to src/data/capitoli
 * @returns {string[]} one issue string per capitoli file whose graph has a cycle
 */
export function checkNarrativeAcyclic(capitoliDir) {
  const issues = [];
  for (const f of readdirSync(capitoliDir).filter((f) => f.endsWith(".json"))) {
    let cap;
    try {
      cap = JSON.parse(readFileSync(join(capitoliDir, f), "utf8"));
    } catch {
      continue; // malformed JSON is a separate concern, not this check's job
    }
    const cycleThrough = transitionsCycleNode(cap?.narrative_flow?.transitions);
    if (cycleThrough != null) {
      issues.push(
        `${f}: narrative_flow.transitions contains a directed cycle (through "${cycleThrough}")`,
      );
    }
  }
  return issues;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const OUT = join(REPO, "docs", "audits", "2026-05-14-epic1-a4-1a-contract-validation.md");

function main() {
  const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
  const corrections = readJson(join(HERE, "a3-corrections.json")).experiments;
  const lpDir = join(REPO, "src", "data", "lesson-paths");
  const lessonPaths = {};
  for (const f of readdirSync(lpDir).filter((f) => f.endsWith(".json"))) {
    const j = readJson(join(lpDir, f));
    if (j.experiment_id) lessonPaths[j.experiment_id] = j;
  }
  const allIds = [...new Set([...Object.keys(corrections), ...Object.keys(lessonPaths)])].sort();
  const results = allIds.map((id) => checkLessonPath(id, lessonPaths[id] ?? null, corrections[id]));

  const failing = results.filter((r) => !r.ok);
  const byAction = (a) => results.filter((r) => r.action === a);

  // A4.1d regression guards (independent of the contract check above).
  const refIssues = checkReferenceIntegrity(lessonPaths);
  const cycleIssues = checkNarrativeAcyclic(join(REPO, "src", "data", "capitoli"));
  const md = `# EPIC 1 A4.1a — contract validation (the A4.1 work-list)

> Generated by \`scripts/epic1/validate-lesson-paths.mjs\` — READ-ONLY.
> RED at A4.1a-time is expected: this IS the divergence work-list for A4.1b-e.

## Summary
| Metric | Value |
|---|---|
| Experiments checked | ${results.length} |
| PASS (already match contract) | ${results.length - failing.length} |
| FAIL (need A4.1b-e work) | ${failing.length} |
| action=keep | ${byAction("keep").length} |
| action=correct | ${byAction("correct").length} |
| action=remove (pending A4.1b) | ${byAction("remove").length} |
| action=consolidate (pending A4.1c) | ${byAction("consolidate").length} |

## Divergences
${failing.map((r) => `### ${r.id} (${r.action ?? 'NO CONTRACT'})\n${r.issues.map((i) => `- ${i}`).join('\n')}`).join('\n\n') || '_(none — contract fully satisfied)_'}

## Reference integrity (A4.1d guard)
> Every \`next_experiment.id\` / \`session_save.next_suggested\` / \`prerequisites[]\` entry must resolve to an existing lesson-path id (or be \`null\`).

${refIssues.map((i) => `- ${i}`).join('\n') || '_(none — all references resolve)_'}

## Narrative acyclicity (A4.1d guard)
> Each \`capitoli/*.json\` \`narrative_flow.transitions\` graph must be acyclic — a continuous arc, not a loop.

${cycleIssues.map((i) => `- ${i}`).join('\n') || '_(none — all narrative graphs acyclic)_'}
`;
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, md, "utf8");
  console.log(`✓ ${OUT}`);
  console.log(`  ${results.length} checked · ${results.length - failing.length} pass · ${failing.length} fail`);
  console.log(`  reference integrity: ${Object.keys(lessonPaths).length} lesson-paths · ${refIssues.length} unresolved ref${refIssues.length === 1 ? '' : 's'}`);
  console.log(`  narrative acyclicity: ${cycleIssues.length} cyclic capitoli graph${cycleIssues.length === 1 ? '' : 's'}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
