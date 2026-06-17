#!/usr/bin/env node
/**
 * Coherence Check — ELAB workflow integrity
 *
 * Run: node scripts/coherence-check.mjs
 * Target: <30s, zero side effects, exit 0 PASS / exit 1 FAIL
 *
 * Checks:
 *   C1. CLAUDE.md references automa/baseline-tests.txt (no hardcoded outdated count)
 *   C2. docs/unlim-wiki/index.md catalog matches actual files in concepts/ experiments/ lessons/
 *   C3. scripts/openclaw/tools-registry.ts has no duplicate names + every handler path well-formed
 *   C4. src/data/rag-chunks.json + rag-chunks-v2.json IDs are unique
 *   C5. No secrets in git-tracked files
 *   C6. docs/superpowers/plans/*.md referenced in CLAUDE.md exist
 *   C7. Branch not main (must be feature/* or fix/*)
 *   C8. Pending tasks have valid YAML front-matter
 *
 * Non-blocking warnings print yellow, blocking errors print red.
 * Suitable as pre-push or nightly cron check.
 *
 * (c) ELAB Tutor — 2026-04-23
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

let errors = 0;
let warnings = 0;
const out = [];

function log(level, msg) {
  const c = level === 'ERR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : level === 'OK' ? '\x1b[32m' : '\x1b[0m';
  const reset = '\x1b[0m';
  out.push(`${c}[${level}]${reset} ${msg}`);
  if (level === 'ERR') errors++;
  if (level === 'WARN') warnings++;
}

function safeRead(path) {
  try { return readFileSync(path, 'utf8'); } catch { return null; }
}

function walkDir(dir, ext = '.md') {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walkDir(full, ext));
    else if (full.endsWith(ext)) out.push(full);
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════
// C1: CLAUDE.md baseline reference
// ════════════════════════════════════════════════════════════════════

function checkC1() {
  const claude = safeRead('CLAUDE.md');
  if (!claude) return log('ERR', 'C1: CLAUDE.md not found');
  if (!claude.includes('automa/baseline-tests.txt')) {
    log('ERR', 'C1: CLAUDE.md does not reference automa/baseline-tests.txt (single source of truth)');
    return;
  }
  // Must NOT have outdated hardcoded counts like "9846" or "12056"
  const outdated = ['9846', '12056'];
  for (const n of outdated) {
    if (new RegExp(`\\b${n}\\b`).test(claude)) {
      log('WARN', `C1: CLAUDE.md still mentions outdated baseline "${n}" — remove or update`);
    }
  }
  log('OK', 'C1: CLAUDE.md baseline reference healthy');
}

// ════════════════════════════════════════════════════════════════════
// C2: wiki index vs filesystem
// ════════════════════════════════════════════════════════════════════

function checkC2() {
  const indexPath = 'docs/unlim-wiki/index.md';
  if (!existsSync(indexPath)) return log('WARN', 'C2: docs/unlim-wiki/index.md missing (wiki not seeded yet)');
  const index = safeRead(indexPath) || '';

  const dirs = ['concepts', 'experiments', 'lessons', 'errors'];
  for (const d of dirs) {
    const dirPath = `docs/unlim-wiki/${d}`;
    if (!existsSync(dirPath)) continue;
    const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const relLink = `${d}/${f}`;
      if (!index.includes(relLink)) {
        log('WARN', `C2: wiki file ${relLink} not listed in index.md`);
      }
    }
  }
  log('OK', 'C2: wiki index vs filesystem consistent');
}

// ════════════════════════════════════════════════════════════════════
// C3: tools-registry duplicates + handler shape
// ════════════════════════════════════════════════════════════════════

function checkC3() {
  const reg = safeRead('scripts/openclaw/tools-registry.ts');
  if (!reg) return log('WARN', 'C3: scripts/openclaw/tools-registry.ts not present — skip');

  // Extract all name: 'xxx' and handler: 'xxx' declarations
  const nameMatches = reg.matchAll(/name:\s*'([a-zA-Z][a-zA-Z0-9_]*)'/g);
  const names = [...nameMatches].map(m => m[1]);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length > 0) {
    log('ERR', `C3: duplicate ToolSpec names: ${[...new Set(dupes)].join(', ')}`);
  }

  const handlerMatches = reg.matchAll(/handler:\s*'([^']+)'/g);
  const handlers = [...handlerMatches].map(m => m[1]);
  const badShape = handlers.filter(h => !/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)?$/.test(h));
  if (badShape.length > 0) {
    log('ERR', `C3: bad handler paths: ${badShape.join(', ')}`);
  }

  if (dupes.length === 0 && badShape.length === 0) {
    log('OK', `C3: tools-registry healthy (${names.length} names, ${handlers.length} handlers)`);
  }
}

// ════════════════════════════════════════════════════════════════════
// C4: RAG chunks unique IDs
// ════════════════════════════════════════════════════════════════════

function checkC4() {
  for (const path of ['src/data/rag-chunks.json', 'src/data/rag-chunks-v2.json']) {
    if (!existsSync(path)) continue;
    let chunks;
    try { chunks = JSON.parse(safeRead(path)); } catch (e) { log('ERR', `C4: ${path} invalid JSON`); continue; }
    if (!Array.isArray(chunks)) { log('ERR', `C4: ${path} not an array`); continue; }
    const ids = chunks.map(c => c.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length > 0) {
      log('ERR', `C4: ${path} has ${dupes.length} duplicate IDs (sample: ${dupes.slice(0, 3).join(', ')})`);
    } else {
      log('OK', `C4: ${path} ${chunks.length} chunks, all IDs unique`);
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// C5: secrets scan
// ════════════════════════════════════════════════════════════════════

function checkC5() {
  try {
    const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
    const patterns = [
      { re: /sk-ant-[a-zA-Z0-9_-]{20,}/, label: 'ANTHROPIC API KEY' },
      { re: /sbp_[a-zA-Z0-9_-]{30,}/, label: 'SUPABASE ACCESS TOKEN' },
      { re: /eyJhbGciOiJ[a-zA-Z0-9_-]{50,}/, label: 'JWT (service role?)' },
    ];
    const offenders = [];
    for (const f of tracked) {
      if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.pdf') || f.endsWith('.json') && f.includes('rag-chunks')) continue;
      try {
        const content = safeRead(f);
        if (!content) continue;
        for (const p of patterns) {
          if (p.re.test(content)) offenders.push(`${f} (${p.label})`);
        }
      } catch {}
    }
    if (offenders.length > 0) {
      for (const o of offenders) log('ERR', `C5: secret-like string in ${o}`);
    } else {
      log('OK', `C5: no secrets in ${tracked.length} tracked files`);
    }
  } catch {
    log('WARN', 'C5: git ls-files failed, skip secret scan');
  }
}

// ════════════════════════════════════════════════════════════════════
// C6: plans referenced in CLAUDE.md exist
// ════════════════════════════════════════════════════════════════════

function checkC6() {
  const claude = safeRead('CLAUDE.md') || '';
  const planRefs = [...claude.matchAll(/docs\/superpowers\/plans\/[^\s`]+\.md/g)].map(m => m[0]);
  let missing = 0;
  for (const ref of planRefs) {
    if (!existsSync(ref)) {
      log('WARN', `C6: plan referenced in CLAUDE.md missing: ${ref}`);
      missing++;
    }
  }
  if (missing === 0 && planRefs.length > 0) {
    log('OK', `C6: ${planRefs.length} plan refs all exist`);
  }
}

// ════════════════════════════════════════════════════════════════════
// C7: branch protection
// ════════════════════════════════════════════════════════════════════

function checkC7() {
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
    if (branch === 'main' || branch === 'master') {
      log('ERR', `C7: on protected branch "${branch}" — must work on feature/* or fix/*`);
    } else {
      log('OK', `C7: on branch "${branch}"`);
    }
  } catch {
    log('WARN', 'C7: cannot determine branch');
  }
}

// ════════════════════════════════════════════════════════════════════
// C8: pending tasks YAML front-matter
// ════════════════════════════════════════════════════════════════════

function checkC8() {
  const dir = 'automa/tasks/pending';
  if (!existsSync(dir)) return log('OK', 'C8: no pending tasks dir (skip)');
  const files = readdirSync(dir).filter(f => f.endsWith('.md'));
  if (files.length === 0) return log('OK', 'C8: no pending tasks (skip)');
  let bad = 0;
  let legacy = 0;
  for (const f of files) {
    const content = safeRead(join(dir, f)) || '';
    const hasYaml = content.startsWith('---\n') && content.includes('\n---\n');
    const isLegacy = content.startsWith('# ATOM-'); // Pre-protocol-v1 format (tolerated)
    if (!hasYaml) {
      if (isLegacy) {
        log('WARN', `C8: ${f} uses legacy format (pre-protocol-v1) — migration recommended`);
        legacy++;
      } else {
        log('ERR', `C8: ${f} missing YAML front-matter AND not legacy format`);
        bad++;
      }
    }
  }
  if (bad === 0) {
    const valid = files.length - legacy;
    log('OK', `C8: ${files.length} pending tasks (${valid} new-format, ${legacy} legacy)`);
  }
}

// ════════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════════

console.log('=== ELAB Coherence Check ===\n');

const t0 = Date.now();
checkC1();
checkC2();
checkC3();
checkC4();
checkC5();
checkC6();
checkC7();
checkC8();
const elapsed = Date.now() - t0;

console.log(out.join('\n'));
console.log(`\n─ SUMMARY ─`);
console.log(`Errors:   ${errors}`);
console.log(`Warnings: ${warnings}`);
console.log(`Elapsed:  ${elapsed}ms`);

process.exit(errors > 0 ? 1 : 0);
