#!/usr/bin/env node

/**
 * ARD-11 Studio install-policy oracle.
 *
 * This file deliberately depends only on Node built-ins.  It is both the
 * read-only policy checker and the byte-authoritative implementation used by
 * the mutation harness and the post-commit publication verifier.
 */

import {
  chmodSync,
  copyFileSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { homedir, platform, arch, tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';

const ORACLE_SCHEMA = 'studio-install-policy-oracle/v1';
const HARNESS_SCHEMA = 'studio-install-policy-harness/v1';
const PUBLICATION_SCHEMA = 'studio-install-policy-publication-binding/v1';
const INDEX_SCHEMA = 'publication-binding-index/v1';
const ORACLE_PATH = 'scripts/studio-install-policy-oracle.mjs';
const WORKFLOW_PATH = '.github/workflows/ci.yml';
const LEDGER_PATH = 'apps/studio/log.jsonl';
const PENDING_TASK = 'ARD-11-D0P-B-STUDIO-INSTALL-POLICY';
const SHA_RE = /^[0-9a-f]{40}$/u;
const SHA256_RE = /^[0-9a-f]{64}$/u;
const MATERIALIZE = 'npm --prefix apps/studio ci --ignore-scripts --no-audit --no-fund';
const LOCAL_MATERIALIZE = 'npm ci --ignore-scripts --no-audit --no-fund';
const LOCK_ONLY = 'npm install --package-lock-only --ignore-scripts --no-audit --no-fund';
const POLICY_CALL = 'bash bin/monorepo.sh policy-studio-install-check';
const ATOMIC_MATERIALIZE = `${POLICY_CALL} && ${MATERIALIZE}`;
const EVIDENCE_INDEX_PATH = 'docs/ops/evidence/studio-install-policy/index.jsonl';
const EVIDENCE_RECORDS_DIR = 'docs/ops/evidence/studio-install-policy/records';
const EVIDENCE_CANONICAL_DIR = 'docs/ops/evidence/studio-install-policy/canonical';
const EVIDENCE_REVOCATIONS_DIR = 'docs/ops/evidence/studio-install-policy/revocations';
const ACCEPT_RECORD_KEYS = Object.freeze([
  'schema', 'task', 'operation', 'receiptSha', 'functionalSha', 'receiptOperation',
  'policyState', 'receiptBlobSha256', 'auditTargetSha', 'producerTranche', 'auditMode',
  'oraclePath', 'oracleAnchorSha', 'oracleSha256', 'workflowPath', 'workflowAnchorSha',
  'workflowSha256', 'canonicalPath', 'canonicalRawSha256', 'counts',
  'bindingVerifierCounts', 'bootstrapIntegrityCounts', 'preReceiptTransitionCounts',
  'rollbackRecoveryCounts', 'stateMachineCounts', 'githubSupplement',
]);

const A_PATHS = Object.freeze([
  '.github/workflows/ci.yml',
  '.github/workflows/studio-preview-readiness.yml',
  'apps/studio/.npmrc',
  'bin/monorepo.sh',
  'vercel.json',
].sort());
const B_PATHS = Object.freeze([
  'apps/studio/.github/workflows/gate.yml',
  'apps/studio/AGENTS.md',
  'docs/ops/RELEASE-CHECKLIST-PRODUCT-RC.md',
].sort());
const LEGACY_DEBT = Object.freeze({
  'apps/studio/AGENTS.md': '9915c521ed07c5807c5d02de835c79a4acb65d61516755720e9f2be15874585c',
  'apps/studio/.github/workflows/gate.yml': '2cabd45ab54954b5ba0bcee0d41d83586723a201641800099313cb34f031ff8d',
  'docs/ops/RELEASE-CHECKLIST-PRODUCT-RC.md': 'bba49fb6d17ff7b9df9aa35380c1c27a382ca8f8a1caae42993ee89b577dd636',
});

const HISTORICAL = Object.freeze([
  {
    id: 'H01',
    path: 'docs/ops/HANDOFF-20260702-MONOREPO-PRODUCT.md',
    sha256: '0320250892ac23676d26e9f602631e7160e2f64065d99614d7d9135310505816',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['npm --prefix apps/studio ci'],
  },
  {
    id: 'H02',
    path: 'docs/ops/MONOREPO-COMMAND-SURFACE-COV.md',
    sha256: '2111614ce4537ecde86fca512cd8715e43aa0e2bc172af1f990a7153abc8993b',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['npm --prefix apps/studio ci', 'npm install` or `npm ci', 'npm run bootstrap'],
  },
  {
    id: 'H03',
    path: 'docs/ops/V1-LOOP-STATE.md',
    sha256: 'a87ab89e4a5592160533e64b9523b20bdd3702f265d07ebbb1c88b07d1db4bde',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['npm --prefix apps/studio ci --no-fund', '`npm ci` durante build', '`npm ci` in Vercel build'],
  },
  {
    id: 'H04',
    path: 'docs/ops/V1-DECISION-LOG.md',
    sha256: 'ef8d120064a1c45b7e70275b3b180441ccfa2663dbd2d131d60328c1da791a8b',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['Vercel build usa `npm --prefix apps/studio ci`'],
  },
  {
    id: 'H05',
    path: 'docs/ops/VERCEL-MAP.md',
    sha256: '30c5433d11f574e7c83b899e1e532cc7dc259bd75de4216a89da772b44af548f',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['build-time `npm ci`', '`npm --prefix apps/studio ci` still reports'],
  },
  {
    id: 'H06',
    path: 'docs/ops/V1-CLAIM-REGISTER.md',
    sha256: '64f13be77ae7e82954fce1622ceb3ec44f90e1122bfdaac0a4e018162ef81956',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['npm --prefix apps/studio ci --no-fund', 'Studio `npm ci`', 'dopo commit `742ed1e4`'],
  },
  {
    id: 'H07',
    path: 'docs/ops/V1-FAILURE-LEDGER.md',
    sha256: 'a4fe0457d7faa627dff415e60bac01d3ee24c0fff58ee723d29de74364473a54',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['dopo `npm ci`'],
  },
  {
    id: 'H08',
    path: 'docs/ops/V1-RISK-REGISTER.md',
    sha256: '2e39c07a16de77e75d4a612d7cac7ecbf732bef9d935481d2190da5f4cfca076',
    className: 'HISTORICAL_NON_OPERATIONAL',
    anchors: ['override mirati e `npm ci`'],
  },
  {
    id: 'H09',
    path: 'docs/ops/FACTORY-LIVE-STATUS.md',
    sha256: 'ab08c65a80acf56f258871d309a27d068f8f8db3bfd9ca2eca412ca178c5a381',
    className: 'HISTORICAL_SNIPPET_NON_OPERATIONAL',
    anchors: ['npm run bootstrap'],
  },
]);

const EXCLUDED_SEGMENTS = new Set([
  '.git',
  '.superpowers',
  'node_modules',
  'dist',
  'storybook-static',
  '.cache',
  'coverage',
]);

const HELP = Object.freeze({
  root: [
    'Usage: node scripts/studio-install-policy-oracle.mjs <command> [arguments]',
    '',
    'Commands:',
    '  check',
    '  harness --output <absolute-empty-directory> [frozen arguments]',
    '  postcommit-binding-check <frozen arguments>',
    '  self-test --profile all',
  ].join('\n'),
  check: 'Usage: node scripts/studio-install-policy-oracle.mjs check',
  harness: [
    'Usage: node scripts/studio-install-policy-oracle.mjs harness --output <absolute-empty-directory>',
    '  [--candidate-sha <40-hex>] [--oracle-anchor-sha <40-hex>]',
    '  [--workflow-anchor-sha <40-hex>] [--audit-mode functional|receipt-intent]',
    '  [--producer-tranche ARD-11-E-POSTCOMMIT] [--canonical-output <absolute-file>]',
    '  [--no-materialize] [--expected-core 43] [--expected-ledger-generic 3]',
    '  [--expected-receipt-semantic 16] [--forbid-receipt-semantic-output]',
  ].join('\n'),
  postcommit: [
    'Usage: node scripts/studio-install-policy-oracle.mjs postcommit-binding-check',
    '  --candidate-sha <40-hex> --oracle-anchor-sha <40-hex>',
    '  --workflow-anchor-sha <40-hex> --pending-task ARD-11-D0P-B-STUDIO-INSTALL-POLICY',
    '  --index-path <exact-path> --records-dir <exact-path> --canonical-dir <exact-path>',
    '  --revocations-dir <exact-path> --state-output <absolute-file>',
    '  --audit-mode receipt-intent --expected-core 43',
    '  --expected-ledger-generic 3 --expected-receipt-semantic 16',
  ].join('\n'),
  selfTest: 'Usage: node scripts/studio-install-policy-oracle.mjs self-test --profile all',
});

class PolicyViolation extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'PolicyViolation';
    this.reason = reason;
  }
}

function policyRed(reason) {
  throw new PolicyViolation(reason.startsWith('POLICY_RED:') ? reason : `POLICY_RED:${reason}`);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function gitBlobId(bytes, algorithm = 'sha1') {
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return createHash(algorithm).update(header).update(bytes).digest('hex');
}

function bytewise(values) {
  return [...values].sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function firstSetDifference(actual, expected) {
  const actualSorted = bytewise(actual);
  const expectedSet = new Set(expected);
  const unexpected = actualSorted.find((path) => !expectedSet.has(path));
  if (unexpected) return unexpected;
  const actualSet = new Set(actual);
  return bytewise(expected).find((path) => !actualSet.has(path)) ?? 'UNKNOWN';
}

function safeToken(value) {
  return /^[A-Za-z0-9_.:/@+-]+$/u.test(String(value)) ? String(value) : 'REDACTED';
}

function readBytes(root, path) {
  return readFileSync(join(root, path));
}

function readText(root, path) {
  return readBytes(root, path).toString('utf8');
}

function runFile(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: options.encoding ?? 'utf8',
    maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
    input: options.input,
  });
  return {
    status: result.status ?? 1,
    signal: result.signal,
    stdout: typeof result.stdout === 'string' ? result.stdout : (result.stdout ?? Buffer.alloc(0)),
    stderr: typeof result.stderr === 'string' ? result.stderr : (result.stderr ?? Buffer.alloc(0)),
    error: result.error,
  };
}

function requireRun(command, args, options = {}, reason = 'SUBPROCESS_FAILED') {
  const result = runFile(command, args, options);
  if (result.status !== 0) policyRed(reason);
  return String(result.stdout);
}

function git(root, args, options = {}) {
  return requireRun('git', ['-C', root, ...args], options, options.reason ?? 'GIT_COMMAND_FAILED').trimEnd();
}

function gitBuffer(root, args, reason = 'GIT_COMMAND_FAILED') {
  const result = runFile('git', ['-C', root, ...args], { encoding: null });
  if (result.status !== 0) policyRed(reason);
  return Buffer.from(result.stdout);
}

function resolveRepositoryRoot(start = process.cwd()) {
  const result = runFile('git', ['-C', start, 'rev-parse', '--show-toplevel']);
  if (result.status !== 0) policyRed('NOT_A_GIT_REPOSITORY');
  return realpathSync(String(result.stdout).trim());
}

function parseNul(bytes) {
  if (bytes.length === 0) return [];
  const parts = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] !== 0) continue;
    try {
      parts.push(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(start, index)));
    } catch {
      policyRed('GIT_PATH_UTF8_INVALID');
    }
    start = index + 1;
  }
  if (start !== bytes.length) policyRed('GIT_NUL_STREAM_UNTERMINATED');
  return parts;
}

function assertRelativeGitPath(path) {
  if (!path || path.includes('\0') || isAbsolute(path)) policyRed('UNSAFE_GIT_PATH');
  const normalized = path.split('/');
  if (normalized.some((part) => part === '' || part === '.' || part === '..')) {
    policyRed('UNSAFE_GIT_PATH');
  }
}

function isExcluded(path) {
  return path.split('/').some((segment) => EXCLUDED_SEGMENTS.has(segment));
}

function enumerateCandidatePaths(root) {
  const bytes = gitBuffer(root, ['ls-files', '-co', '--exclude-standard', '-z']);
  return bytewise(parseNul(bytes).filter((path) => {
    assertRelativeGitPath(path);
    return !isExcluded(path) && existsSync(join(root, path));
  }));
}

function modeForPath(absolutePath) {
  const entry = lstatSync(absolutePath);
  if (entry.isSymbolicLink()) return '120000';
  if (!entry.isFile()) policyRed('CANDIDATE_ENTRY_NOT_FILE');
  return (entry.mode & 0o111) !== 0 ? '100755' : '100644';
}

function bytesForPath(absolutePath) {
  const entry = lstatSync(absolutePath);
  if (entry.isSymbolicLink()) return Buffer.from(readlinkSync(absolutePath), 'utf8');
  return readFileSync(absolutePath);
}

function candidateManifest(root) {
  const objectFormat = git(root, ['rev-parse', '--show-object-format']);
  if (!['sha1', 'sha256'].includes(objectFormat)) policyRed('GIT_OBJECT_FORMAT_UNSUPPORTED');
  const records = enumerateCandidatePaths(root).map((path) => {
    const absolute = join(root, path);
    const bytes = bytesForPath(absolute);
    return { path, mode: modeForPath(absolute), blob: gitBlobId(bytes, objectFormat), sha256: sha256(bytes) };
  });
  const tsv = records.map((record) => `${JSON.stringify(record.path)}\t${record.mode}\t${record.blob}\t${record.sha256}`).join('\n') + '\n';
  return { records, tsv, sha256: sha256(Buffer.from(tsv, 'utf8')) };
}

function hasLoneSurrogate(value) {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      return true;
    }
  }
  return false;
}

function canonicalizeJcs(value, seen = new Set()) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') {
    if (hasLoneSurrogate(value)) policyRed('JCS_NON_IJSON_STRING');
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) policyRed('JCS_NON_FINITE_NUMBER');
    return JSON.stringify(value);
  }
  if (typeof value !== 'object') policyRed('JCS_UNSUPPORTED_VALUE');
  if (seen.has(value)) policyRed('JCS_CYCLE');
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      return `[${value.map((item) => canonicalizeJcs(item, seen)).join(',')}]`;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) policyRed('JCS_NON_PLAIN_OBJECT');
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => {
      if (hasLoneSurrogate(key)) policyRed('JCS_NON_IJSON_STRING');
      const member = value[key];
      if (member === undefined || typeof member === 'function' || typeof member === 'symbol') {
        policyRed('JCS_UNSUPPORTED_VALUE');
      }
      return `${JSON.stringify(key)}:${canonicalizeJcs(member, seen)}`;
    }).join(',')}}`;
  } finally {
    seen.delete(value);
  }
}

function jcsLf(value) {
  return Buffer.from(`${canonicalizeJcs(value)}\n`, 'utf8');
}

function parseJsonObjectFatal(bytes, reason) {
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    policyRed(reason);
  }
  if (text.trim().length === 0) policyRed(reason);
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    policyRed(reason);
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) policyRed(reason);
  return value;
}

function assertJcsLf(bytes, reason) {
  if (bytes.length === 0 || bytes.at(-1) !== 0x0a || bytes.subarray(0, -1).includes(0x0a)) {
    policyRed(reason);
  }
  const value = parseJsonObjectFatal(bytes.subarray(0, -1), reason);
  if (!bytes.equals(jcsLf(value))) policyRed(reason);
  return value;
}

function validateOutputDirectory(rawPath, repositoryRoot) {
  if (!isAbsolute(rawPath)) policyRed('OUTPUT_PATH_NOT_ABSOLUTE');
  const target = resolve(rawPath);
  const forbidden = new Set([resolve('/'), resolve(homedir()), resolve(tmpdir()), resolve(repositoryRoot)]);
  if (forbidden.has(target)) policyRed('OUTPUT_PATH_FORBIDDEN');
  const repoPrefix = `${resolve(repositoryRoot)}${sep}`;
  if (target.startsWith(repoPrefix)) policyRed('OUTPUT_PATH_INSIDE_REPOSITORY');
  let component = resolve('/');
  for (const part of target.split(sep).filter(Boolean)) {
    component = join(component, part);
    if (!existsSync(component)) break;
    if (lstatSync(component).isSymbolicLink()) policyRed('OUTPUT_PATH_SYMLINK');
  }
  let cursor = target;
  const pending = [];
  while (!existsSync(cursor)) {
    pending.push(basename(cursor));
    const parent = dirname(cursor);
    if (parent === cursor) policyRed('OUTPUT_PARENT_MISSING');
    cursor = parent;
  }
  if (lstatSync(cursor).isSymbolicLink()) policyRed('OUTPUT_PATH_SYMLINK');
  if (!statSync(cursor).isDirectory()) policyRed('OUTPUT_PARENT_NOT_DIRECTORY');
  if (existsSync(target)) {
    const entry = lstatSync(target);
    if (entry.isSymbolicLink() || !entry.isDirectory()) policyRed('OUTPUT_PATH_NOT_EMPTY_DIRECTORY');
    if (readdirSync(target).length !== 0) policyRed('OUTPUT_PATH_NOT_EMPTY_DIRECTORY');
  } else {
    mkdirSync(target, { recursive: true, mode: 0o700 });
  }
  return realpathSync(target);
}

function validateOutputFile(rawPath, repositoryRoot) {
  if (!isAbsolute(rawPath)) policyRed('OUTPUT_PATH_NOT_ABSOLUTE');
  const target = resolve(rawPath);
  if (target === resolve('/') || target === resolve(homedir()) || target.startsWith(`${resolve(repositoryRoot)}${sep}`)) {
    policyRed('OUTPUT_PATH_FORBIDDEN');
  }
  if (existsSync(target)) {
    const entry = lstatSync(target);
    if (entry.isSymbolicLink()) policyRed('OUTPUT_PATH_SYMLINK');
    if (!entry.isFile()) policyRed('OUTPUT_PATH_NOT_FILE');
    policyRed('OUTPUT_PATH_ALREADY_EXISTS');
  }
  const parent = dirname(target);
  let cursor = resolve('/');
  for (const part of parent.split(sep).filter(Boolean)) {
    cursor = join(cursor, part);
    if (!existsSync(cursor)) break;
    if (lstatSync(cursor).isSymbolicLink()) policyRed('OUTPUT_PATH_SYMLINK');
  }
  if (!existsSync(parent)) mkdirSync(parent, { recursive: true, mode: 0o700 });
  const realParent = realpathSync(parent);
  if (lstatSync(realParent).isSymbolicLink() || !statSync(realParent).isDirectory()) {
    policyRed('OUTPUT_PARENT_NOT_DIRECTORY');
  }
  return join(realParent, basename(target));
}

function npmConfigProbe(root, env = process.env) {
  const local = runFile('npm', ['config', 'get', 'ignore-scripts'], { cwd: join(root, 'apps/studio'), env });
  const prefixed = runFile('npm', ['--prefix', 'apps/studio', 'config', 'get', 'ignore-scripts'], { cwd: root, env });
  if (local.status !== 0 || String(local.stdout) !== 'true\n') policyRed('NPM_CONFIG_LOCAL_NOT_TRUE');
  if (prefixed.status !== 0 || String(prefixed.stdout) !== 'true\n') policyRed('NPM_CONFIG_PREFIX_NOT_TRUE');
}

function validateNpmrc(root, env, probe = true) {
  const path = join(root, 'apps/studio/.npmrc');
  if (!existsSync(path)) policyRed('NPMRC_MISSING');
  const entry = lstatSync(path);
  if (entry.isSymbolicLink()) policyRed('NPMRC_SYMLINK');
  if (!entry.isFile()) policyRed('NPMRC_NOT_REGULAR');
  const text = readFileSync(path, 'utf8');
  const active = text.split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#') && !line.startsWith(';'));
  const assignments = active.filter((line) => /^ignore-scripts\s*=/u.test(line));
  if (assignments.length !== 1 || active.length !== 1) policyRed('NPMRC_AMBIGUOUS');
  const match = assignments[0].match(/^ignore-scripts\s*=\s*(.*)$/u);
  if (!match || match[1] !== 'true') policyRed('NPMRC_NOT_TRUE');
  if (/[${}]/u.test(assignments[0])) policyRed('NPMRC_AMBIGUOUS');
  if (probe) npmConfigProbe(root, env);
}

function extractFunctionBody(text, name) {
  const declaration = new RegExp(`^${name}\\(\\)\\s*\\{\\s*(?:#.*)?$`, 'gmu');
  const matches = [...text.matchAll(declaration)];
  if (matches.length === 0) return null;
  if (matches.length !== 1) policyRed(`BASH_FUNCTION_PARSE_AMBIGUOUS:${name}`);
  const declarationEnd = (matches[0].index ?? 0) + matches[0][0].length;
  const firstNewline = text.indexOf('\n', declarationEnd);
  if (firstNewline < 0) policyRed(`BASH_FUNCTION_PARSE_INCOMPLETE:${name}`);
  const bodyStart = firstNewline + 1;
  let depth = 1;
  let offset = bodyStart;
  let heredoc = null;
  while (offset <= text.length) {
    const newline = text.indexOf('\n', offset);
    const lineEnd = newline < 0 ? text.length : newline;
    const line = text.slice(offset, lineEnd);
    if (heredoc !== null) {
      const candidate = heredoc.stripTabs ? line.replace(/^\t+/u, '') : line;
      if (candidate === heredoc.delimiter) heredoc = null;
      if (newline < 0) break;
      offset = newline + 1;
      continue;
    }
    let quote = null;
    let escaped = false;
    let closingIndex = -1;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (quote === "'") {
        if (character === "'") quote = null;
        continue;
      }
      if (quote === '"' || quote === '`') {
        if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        continue;
      }
      if (character === "'" || character === '"' || character === '`') {
        quote = character;
        continue;
      }
      if (character === '#') break;
      if (character === '<' && line[index + 1] === '<') {
        const rest = line.slice(index);
        const match = rest.match(/^<<(-)?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\2/u);
        if (!match) policyRed(`BASH_FUNCTION_HEREDOC_AMBIGUOUS:${name}`);
        heredoc = { stripTabs: Boolean(match[1]), delimiter: match[3] };
        index += match[0].length - 1;
        continue;
      }
      if (character === '{') depth += 1;
      if (character === '}') {
        depth -= 1;
        if (depth < 0) policyRed(`BASH_FUNCTION_PARSE_AMBIGUOUS:${name}`);
        if (depth === 0) {
          closingIndex = index;
          break;
        }
      }
    }
    if (closingIndex >= 0) {
      const before = line.slice(0, closingIndex);
      const after = line.slice(closingIndex + 1);
      if (before.trim() !== '' || (after.trim() !== '' && !after.trim().startsWith('#'))) {
        policyRed(`BASH_FUNCTION_PARSE_AMBIGUOUS:${name}`);
      }
      return text.slice(bodyStart, offset);
    }
    if (newline < 0) break;
    offset = newline + 1;
  }
  policyRed(`BASH_FUNCTION_PARSE_INCOMPLETE:${name}`);
}

function normalizeCommandWhitespace(value) {
  return String(value).trim().replace(/\s+/gu, ' ');
}

function packageManagerInvocation(command) {
  const normalized = normalizeCommandWhitespace(command)
    .replace(/^[`'"(\[]+/u, '')
    .replace(/[`'"),\]}]+$/u, '');
  const tokens = normalized.split(/\s+/u).filter(Boolean)
    .map((token) => token.replace(/^[`'"([{]+|[`'"),\]}]+$/gu, ''));
  const manager = tokens[0];
  if (!['npm', 'pnpm', 'yarn', 'bun'].includes(manager)) return null;
  let subcommand = null;
  let workspaceTarget = null;
  let studioTarget = false;
  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    const next = tokens[index + 1];
    if (['--prefix', '-C', '--cwd', '--dir'].includes(token)) {
      workspaceTarget = next ?? null;
      if (next === 'apps/studio') studioTarget = true;
      index += 1;
      continue;
    }
    const inlineTarget = token.match(/^(?:--prefix|--cwd|--dir)=(.+)$/u)
      ?? token.match(/^-C(?:=)?(.+)$/u);
    if (inlineTarget) {
      workspaceTarget = inlineTarget[1];
      if (workspaceTarget === 'apps/studio') studioTarget = true;
      continue;
    }
    if (['ci', 'install', 'rebuild', 'add'].includes(token)) {
      subcommand = token;
      break;
    }
  }
  if (subcommand === null) return null;
  return { manager, subcommand, workspaceTarget, studioTarget, normalized };
}

function isExcludedNonStudioWorkspaceMaterializer(invocation) {
  return invocation.manager === 'npm'
    && ['plugins/elab-tutor', 'ops/tools'].includes(invocation.workspaceTarget);
}

function materializerLines(text) {
  const source = String(text).replace(/\\\r?\n/gu, (match) => ' '.repeat(match.length));
  const commands = [];
  const expression = /\b(?:npm|pnpm|yarn|bun)\b/gu;
  for (const match of source.matchAll(expression)) {
    const offset = match.index ?? 0;
    let end = source.length;
    for (const separator of ['\n', ';', '&&', '||']) {
      const found = source.indexOf(separator, offset);
      if (found >= 0 && found < end) end = found;
    }
    const rawLine = source.slice(offset, end).trim();
    const invocation = packageManagerInvocation(rawLine);
    if (invocation) commands.push({ rawLine, normalized: invocation.normalized, offset, ...invocation });
  }
  return commands;
}

function validateMaterializer(surface, command, expected = MATERIALIZE) {
  const normalized = normalizeCommandWhitespace(command);
  if (/npm_config_ignore_scripts\s*=\s*false/iu.test(normalized)
    || /--ignore-scripts(?:=|\s+)false\b/iu.test(normalized)) {
    policyRed(`IGNORE_SCRIPTS_OVERRIDE_FALSE:${surface}`);
  }
  if (/(?:--omit(?:=|\s+)optional|--no-optional\b|--ignore-optional\b)/iu.test(normalized)) {
    policyRed(`OPTIONAL_OMISSION_FORBIDDEN:${surface}`);
  }
  if (/\b(?:pnpm|yarn|bun)\b/iu.test(normalized)) {
    policyRed(`ALTERNATE_MATERIALIZER_FORBIDDEN:${surface}`);
  }
  if (/\bnpm\s+(?:--prefix=|-C(?:=|\s+))apps\/studio\b/u.test(normalized)) {
    policyRed(`MATERIALIZER_PREFIX_FORM_FORBIDDEN:${surface}`);
  }
  const materializer = normalized.match(/\bnpm(?:\s+--prefix\s+apps\/studio)?\s+(ci|install|rebuild)\b/u);
  if (!materializer || materializer[1] !== 'ci') policyRed(`MATERIALIZER_NOT_CI:${surface}`);
  for (const flag of ['ignore-scripts', 'no-audit', 'no-fund']) {
    const exactFlag = new RegExp(`(?:^|\\s)--${flag}(?=\\s|$)`, 'u');
    if (!exactFlag.test(normalized)) policyRed(`REQUIRED_FLAG_MISSING:${surface}:${flag}`);
  }
  if (normalized !== expected) policyRed(`MATERIALIZER_COMMAND_NOT_CLOSED:${surface}`);
}

function extractAtomicCommands(text) {
  const commands = [];
  for (const rawLine of String(text).split('\n')) {
    if (!rawLine.includes(POLICY_CALL)) continue;
    let command = rawLine.trim();
    if (command.startsWith('- ')) command = command.slice(2).trim();
    if (command.startsWith('run:')) command = command.slice(4).trim();
    commands.push(command);
  }
  return commands;
}

function validateAtomicCallsite(surface, text) {
  if (!String(text).includes(POLICY_CALL)) policyRed(`CALLSITE_GATE_MISSING:${surface}`);
  const commands = extractAtomicCommands(text);
  if (commands.length !== 1) policyRed(`GATE_NOT_ATOMIC:${surface}`);
  const command = normalizeCommandWhitespace(commands[0]);
  if (!command.startsWith(`${POLICY_CALL} && `)) policyRed(`GATE_NOT_ATOMIC:${surface}`);
  validateMaterializer(surface, command.slice(`${POLICY_CALL} && `.length), MATERIALIZE);
  if (command !== ATOMIC_MATERIALIZE) policyRed(`GATE_NOT_ATOMIC:${surface}`);
}

function validateActiveCallsites(root) {
  const ci = readText(root, '.github/workflows/ci.yml');
  const preview = readText(root, '.github/workflows/studio-preview-readiness.yml');
  const monorepo = readText(root, 'bin/monorepo.sh');
  const vercelText = readText(root, 'vercel.json');

  if (/npm_config_ignore_scripts\s*=\s*false/iu.test(ci)) policyRed('IGNORE_SCRIPTS_OVERRIDE_FALSE:A1');
  validateAtomicCallsite('A1', ci);
  if (!ci.includes('working-directory: ${{ github.workspace }}')) policyRed('GATE_NOT_ATOMIC:A1');
  const ciMaterializers = materializerLines(ci);
  if (ciMaterializers.length !== 1 || ciMaterializers[0].normalized !== MATERIALIZE) {
    policyRed('UNSAFE_STUDIO_INSTALL_GUIDANCE:.github/workflows/ci.yml');
  }
  validateAtomicCallsite('A2', preview);
  const previewMaterializers = materializerLines(preview);
  if (previewMaterializers.length !== 1 || previewMaterializers[0].normalized !== MATERIALIZE) {
    policyRed('UNSAFE_STUDIO_INSTALL_GUIDANCE:.github/workflows/studio-preview-readiness.yml');
  }

  const body = extractFunctionBody(monorepo, 'bootstrap_core');
  if (body === null || !body.includes('policy_studio_install_check')) policyRed('CALLSITE_GATE_MISSING:A3');
  const meaningful = body.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line !== 'cd "$ROOT"');
  if (meaningful[0] !== 'policy_studio_install_check') policyRed('BOOTSTRAP_GATE_NOT_FIRST:A3');
  const bootstrapMaterializers = materializerLines(body);
  if (bootstrapMaterializers.length !== 1) policyRed('MATERIALIZER_COMMAND_NOT_CLOSED:A3');
  validateMaterializer('A3', bootstrapMaterializers[0].normalized, MATERIALIZE);
  if (!monorepo.includes(MATERIALIZE) || !monorepo.includes(LOCK_ONLY)) {
    policyRed('UNSAFE_STUDIO_INSTALL_GUIDANCE:bin/monorepo.sh');
  }
  for (const invocation of materializerLines(monorepo)) {
    if (isExcludedNonStudioWorkspaceMaterializer(invocation)) continue;
    const { normalized } = invocation;
    const allowed = normalized === MATERIALIZE
      || normalized === LOCAL_MATERIALIZE
      || normalized === LOCK_ONLY;
    if (!allowed) policyRed('UNSAFE_STUDIO_INSTALL_GUIDANCE:bin/monorepo.sh');
  }
  const incompleteHelp = /run npm --prefix apps\/studio ci(?:[,`)])/u;
  if (incompleteHelp.test(monorepo)) policyRed('UNSAFE_STUDIO_INSTALL_GUIDANCE:bin/monorepo.sh');

  let vercel;
  try {
    vercel = JSON.parse(vercelText);
  } catch {
    policyRed('VERCEL_JSON_INVALID');
  }
  if (vercel.installCommand === undefined || !String(vercel.installCommand).includes(POLICY_CALL)) {
    policyRed('CALLSITE_GATE_MISSING:A4');
  }
  validateAtomicCallsite('A4', String(vercel.installCommand));
  if (materializerLines(String(vercel.installCommand)).length !== 1) {
    policyRed('UNSAFE_STUDIO_INSTALL_GUIDANCE:vercel.json');
  }
}

function validateHistorical(root) {
  const rows = [];
  for (const record of HISTORICAL) {
    const absolute = join(root, record.path);
    if (!existsSync(absolute)) policyRed(`HISTORICAL_EVIDENCE_MISSING:${record.id}`);
    const bytes = readFileSync(absolute);
    const text = bytes.toString('utf8');
    if (!record.anchors.every((anchor) => text.includes(anchor))) {
      policyRed(`HISTORICAL_ANCHOR_MISSING:${record.id}`);
    }
    const digest = sha256(bytes);
    if (digest !== record.sha256) policyRed(`HISTORICAL_EVIDENCE_DRIFT:${record.id}`);
    rows.push(`${record.id}|${record.path}|${record.sha256}|${record.className}`);
  }
  return rows;
}

function validateSafeDebtReader(reader) {
  const agents = reader('apps/studio/AGENTS.md').toString('utf8');
  if (!agents.includes(LOCK_ONLY) || !agents.includes(LOCAL_MATERIALIZE)) return false;
  if (/npm install(?! --package-lock-only)/u.test(agents)) return false;
  if (!/(?:lifecycle|ignore-scripts)/iu.test(agents) || !/(?:optional|omit)/iu.test(agents)) return false;

  const archive = reader('apps/studio/.github/workflows/gate.yml').toString('utf8');
  if (!archive.includes('archived_evidence:') || !archive.includes('operational: false')) return false;
  if (/^\s*(?:on|jobs|uses|run):/mu.test(archive) || /npm\s+(?:ci|install)/u.test(archive)) return false;

  const checklist = reader('docs/ops/RELEASE-CHECKLIST-PRODUCT-RC.md').toString('utf8');
  if (!checklist.includes(POLICY_CALL) || !checklist.includes(MATERIALIZE)) return false;
  if (!checklist.includes('H01') || !checklist.includes('H09') || !/stor|histor/iu.test(checklist)) return false;
  return true;
}

function validateSafeDebtFiles(root) {
  return validateSafeDebtReader((path) => readBytes(root, path));
}

function deriveFunctionalPolicyState(root, functionalSha) {
  const reader = (path) => gitFile(root, functionalSha, path);
  const legacy = B_PATHS.every((path) => sha256(reader(path)) === LEGACY_DEBT[path]);
  if (legacy) return 'ACTIVE_GREEN_D0P_B_PENDING';
  if (validateSafeDebtReader(reader)) return 'FULL_GREEN_FUNCTIONAL_ONLY';
  policyRed('FUNCTIONAL_POLICY_STATE_INVALID');
}

function classifyDebtState(root) {
  const digests = Object.fromEntries(B_PATHS.map((path) => [path, sha256(readBytes(root, path))]));
  const legacy = B_PATHS.map((path) => digests[path] === LEGACY_DEBT[path]);
  if (legacy.every(Boolean)) return 'ACTIVE_GREEN_D0P_B_PENDING';
  const legacyCount = legacy.filter(Boolean).length;
  if (legacyCount === 2) {
    const index = legacy.findIndex((value) => !value);
    const label = B_PATHS[index] === 'apps/studio/AGENTS.md' ? 'B1'
      : B_PATHS[index] === 'apps/studio/.github/workflows/gate.yml' ? 'B2' : 'B3';
    policyRed(`DEBT_HASH_DRIFT:${label}`);
  }
  if (legacyCount === 1) {
    const index = legacy.findIndex(Boolean);
    const label = B_PATHS[index] === 'apps/studio/AGENTS.md' ? 'B1'
      : B_PATHS[index] === 'apps/studio/.github/workflows/gate.yml' ? 'B2' : 'B3';
    policyRed(`UNSAFE_CURRENT_GUIDANCE:${label}`);
  }
  if (!validateSafeDebtFiles(root)) {
    const bad = B_PATHS.find((path) => sha256(readBytes(root, path)) !== LEGACY_DEBT[path]);
    const label = bad === 'apps/studio/AGENTS.md' ? 'B1'
      : bad === 'apps/studio/.github/workflows/gate.yml' ? 'B2' : 'B3';
    policyRed(`UNSAFE_CURRENT_GUIDANCE:${label}`);
  }
  return 'FULL_GREEN';
}

function commandMatches(text, path) {
  const studioContext = path.startsWith('apps/studio/')
    || HISTORICAL.some((record) => record.path === path)
    || /working-directory\s*:\s*['"]?apps\/studio['"]?/u.test(text)
    || /cd\s+(?:"?\$ROOT\/)?apps\/studio/u.test(text);
  const activePolicyPath = [WORKFLOW_PATH, '.github/workflows/studio-preview-readiness.yml', 'bin/monorepo.sh', 'vercel.json']
    .includes(path);
  return materializerLines(text)
    .filter((match) => studioContext || activePolicyPath || match.studioTarget)
    .map((match) => ({ ...match, index: match.offset }))
    .sort((left, right) => left.index - right.index);
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function inventoryDisposition(path, state) {
  const historical = HISTORICAL.find((record) => record.path === path);
  if (historical) return { className: 'historical', disposition: historical.className };
  if (path === ORACLE_PATH) return { className: 'active', disposition: 'ORACLE_IMPLEMENTATION_NON_CALLSITE' };
  if ([WORKFLOW_PATH, '.github/workflows/studio-preview-readiness.yml', 'bin/monorepo.sh', 'vercel.json'].includes(path)) {
    return { className: 'active', disposition: 'SAFE_ACTIVE_POLICY' };
  }
  if (B_PATHS.includes(path)) {
    return state === 'ACTIVE_GREEN_D0P_B_PENDING'
      ? { className: 'prescriptive', disposition: 'FROZEN_DEBT_PENDING' }
      : { className: 'prescriptive', disposition: 'SAFE_CURRENT_GUIDANCE' };
  }
  if (path.startsWith('plugins/elab-tutor/')) return { className: 'unrelated', disposition: 'NON_STUDIO_WORKSPACE' };
  return null;
}

function buildInventory(root, state) {
  const rows = [];
  for (const path of enumerateCandidatePaths(root)) {
    const absolute = join(root, path);
    const entry = lstatSync(absolute);
    if (entry.isSymbolicLink()) {
      if (/(?:^|\/)\.github\/workflows\/|(?:\.npmrc|package\.json|vercel\.json|Dockerfile|\.(?:sh|bash|zsh|js|ts|mjs|cjs|md|ya?ml))$/u.test(path)) {
        policyRed(`INVENTORY_SYMLINK_FORBIDDEN:${path}`);
      }
      continue;
    }
    if (!entry.isFile()) continue;
    const bytes = readFileSync(absolute);
    if (bytes.includes(0)) continue;
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      continue;
    }
    for (const match of commandMatches(text, path)) {
      if (path === 'bin/monorepo.sh' && isExcludedNonStudioWorkspaceMaterializer(match)) continue;
      const disposition = inventoryDisposition(path, state);
      if (!disposition) policyRed(`UNCLASSIFIED_STUDIO_INSTALL:${path}`);
      if (disposition.disposition !== 'ORACLE_IMPLEMENTATION_NON_CALLSITE' && match.manager !== 'npm') {
        policyRed(`ALTERNATE_MATERIALIZER_FORBIDDEN:${path}`);
      }
      if (disposition.disposition !== 'ORACLE_IMPLEMENTATION_NON_CALLSITE'
        && disposition.disposition !== 'FROZEN_DEBT_PENDING'
        && disposition.className !== 'historical'
        && ![MATERIALIZE, LOCAL_MATERIALIZE, LOCK_ONLY].includes(match.normalized)) {
        policyRed(`UNSAFE_STUDIO_INSTALL_GUIDANCE:${path}`);
      }
      rows.push({
        path,
        line: lineAt(text, match.index),
        className: disposition.className,
        normalizedCommand: match.normalized.replace(/\s+/gu, ' '),
        sha256: sha256(bytes),
        disposition: disposition.disposition,
      });
    }
  }
  return rows.sort((left, right) => {
    const pathOrder = Buffer.compare(Buffer.from(left.path), Buffer.from(right.path));
    return pathOrder === 0 ? left.line - right.line : pathOrder;
  });
}

function checkRepository(root, options = {}) {
  validateNpmrc(root, options.env ?? process.env, options.probeNpm !== false);
  validateActiveCallsites(root);
  const state = classifyDebtState(root);
  const historicalRows = validateHistorical(root);
  const inventory = buildInventory(root, state);
  return { state, historicalRows, inventory };
}

function ensureDirectory(path) {
  mkdirSync(path, { recursive: true, mode: 0o700 });
}

let atomicWriteCounter = 0;

function writeBytes(path, bytes, mode = 0o600) {
  ensureDirectory(dirname(path));
  atomicWriteCounter += 1;
  const temporary = `${path}.ardesia-policy-${process.pid}-${atomicWriteCounter}.tmp`;
  if (existsSync(temporary)) policyRed('ATOMIC_WRITE_TEMP_EXISTS');
  writeFileSync(temporary, bytes, { mode, flag: 'wx' });
  try {
    renameSync(temporary, path);
  } catch (error) {
    if (existsSync(temporary)) rmSync(temporary, { force: false });
    throw error;
  }
}

function writeJson(path, value) {
  writeBytes(path, jcsLf(value));
}

function checkedTempRoot(prefix) {
  const base = realpathSync(tmpdir());
  const root = realpathSync(mkdtempSync(join(base, prefix)));
  if (!root.startsWith(`${base}${sep}`) || basename(root).length <= prefix.length) {
    policyRed('TEMP_ROOT_VALIDATION_FAILED');
  }
  return root;
}

function removeCheckedTemp(root, prefix) {
  const base = realpathSync(tmpdir());
  const resolved = realpathSync(root);
  if (!resolved.startsWith(`${base}${sep}`) || !basename(resolved).startsWith(prefix)) {
    policyRed('TEMP_CLEANUP_TARGET_INVALID');
  }
  rmSync(resolved, { recursive: true, force: false, maxRetries: 2 });
}

function copyCandidateEntry(sourceRoot, destinationRoot, path) {
  const source = join(sourceRoot, path);
  const destination = join(destinationRoot, path);
  ensureDirectory(dirname(destination));
  const entry = lstatSync(source);
  if (entry.isSymbolicLink()) {
    symlinkSync(readlinkSync(source), destination);
  } else if (entry.isFile()) {
    copyFileSync(source, destination);
    chmodSync(destination, entry.mode & 0o777);
  } else {
    policyRed('CANDIDATE_ENTRY_NOT_FILE');
  }
}

function linkCandidateEntry(sourceRoot, destinationRoot, path) {
  const source = join(sourceRoot, path);
  const destination = join(destinationRoot, path);
  ensureDirectory(dirname(destination));
  const entry = lstatSync(source);
  if (entry.isSymbolicLink()) {
    symlinkSync(readlinkSync(source), destination);
  } else if (entry.isFile()) {
    try {
      linkSync(source, destination);
    } catch {
      copyFileSync(source, destination);
      chmodSync(destination, entry.mode & 0o777);
    }
  } else {
    policyRed('CANDIDATE_ENTRY_NOT_FILE');
  }
}

function fixedGitEnvironment() {
  return {
    ...process.env,
    GIT_AUTHOR_NAME: 'ARDESIA policy harness',
    GIT_AUTHOR_EMAIL: 'policy-harness@invalid.local',
    GIT_COMMITTER_NAME: 'ARDESIA policy harness',
    GIT_COMMITTER_EMAIL: 'policy-harness@invalid.local',
    GIT_AUTHOR_DATE: '2000-01-01T00:00:00Z',
    GIT_COMMITTER_DATE: '2000-01-01T00:00:00Z',
    TZ: 'UTC',
    LC_ALL: 'C',
  };
}

function createSeedRepository(sourceRoot, tempRoot) {
  const sourceManifest = candidateManifest(sourceRoot);
  const seedRoot = join(tempRoot, 'seed');
  ensureDirectory(seedRoot);
  for (const record of sourceManifest.records) copyCandidateEntry(sourceRoot, seedRoot, record.path);
  requireRun('git', ['init', '--initial-branch=harness', seedRoot], { env: fixedGitEnvironment() }, 'SEED_GIT_INIT_FAILED');
  requireRun('git', ['-C', seedRoot, 'config', 'user.name', 'ARDESIA policy harness'], {}, 'SEED_GIT_CONFIG_FAILED');
  requireRun('git', ['-C', seedRoot, 'config', 'user.email', 'policy-harness@invalid.local'], {}, 'SEED_GIT_CONFIG_FAILED');
  requireRun('git', ['-C', seedRoot, 'add', '-f', '-A'], {}, 'SEED_GIT_ADD_FAILED');
  requireRun('git', ['-C', seedRoot, 'commit', '-m', 'harness seed'], { env: fixedGitEnvironment() }, 'SEED_GIT_COMMIT_FAILED');
  const seedManifest = candidateManifest(seedRoot);
  if (sourceManifest.tsv !== seedManifest.tsv) policyRed('SEED_MANIFEST_MISMATCH');
  const seedCommit = git(seedRoot, ['rev-parse', 'HEAD']);
  const seedTree = git(seedRoot, ['rev-parse', 'HEAD^{tree}']);
  const sourceHead = git(sourceRoot, ['rev-parse', 'HEAD']);
  const dirtyRaw = gitBuffer(sourceRoot, ['status', '--porcelain=v1', '-z']);
  const statusFrames = parseNul(dirtyRaw);
  const dirtyPaths = [];
  for (let index = 0; index < statusFrames.length; index += 1) {
    const frame = statusFrames[index];
    if (frame.length < 4) policyRed('GIT_STATUS_FRAME_INVALID');
    const status = frame.slice(0, 2);
    dirtyPaths.push(frame.slice(3));
    if (status.includes('R') || status.includes('C')) {
      index += 1;
      if (index >= statusFrames.length) policyRed('GIT_STATUS_FRAME_INVALID');
      dirtyPaths.push(statusFrames[index]);
    }
  }
  if (dirtyPaths.length === 0 && git(sourceRoot, ['rev-parse', 'HEAD^{tree}']) !== seedTree) {
    policyRed('SEED_TREE_MISMATCH');
  }
  return {
    seedRoot,
    seedCommit,
    seedTree,
    sourceHead,
    dirtyPaths,
    manifest: sourceManifest,
  };
}

function cloneSeed(seed, destination) {
  requireRun('git', [
    'clone', '--quiet', '--shared', '--no-checkout', '--local', '--', seed.seedRoot, destination,
  ], {}, 'HARNESS_CLONE_FAILED');
  for (const record of seed.manifest.records) {
    linkCandidateEntry(seed.seedRoot, destination, record.path);
  }
  requireRun('git', ['-C', destination, 'read-tree', seed.seedCommit], {}, 'HARNESS_CLONE_INDEX_FAILED');
  if (git(destination, ['rev-parse', 'HEAD']) !== seed.seedCommit) {
    policyRed('HARNESS_CLONE_HEAD_MISMATCH');
  }
  const tree = git(destination, ['rev-parse', 'HEAD^{tree}']);
  if (tree !== seed.seedTree) policyRed('HARNESS_CLONE_TREE_MISMATCH');
  if (gitBuffer(destination, ['status', '--porcelain=v1', '-z']).length !== 0) {
    policyRed('HARNESS_CLONE_WORKTREE_MISMATCH');
  }
}

function createFakeTools(tempRoot) {
  const fakeBin = join(tempRoot, 'fake-bin');
  ensureDirectory(fakeBin);
  const npm = `#!/bin/sh
set -eu
case " $* " in
  *" config get ignore-scripts "*) printf 'true\\n'; exit 0 ;;
  *" ci "*|*" install "*|*" rebuild "*)
    : "\${POLICY_NPM_SENTINEL:?}"
    printf '%s\\n' started > "$POLICY_NPM_SENTINEL"
    exit 97
    ;;
  *) exit 98 ;;
esac
`;
  const uv = `#!/bin/sh
set -eu
case " $* " in
  *" sync "*)
    : "\${POLICY_UV_SENTINEL:?}"
    printf '%s\\n' started > "$POLICY_UV_SENTINEL"
    exit 97
    ;;
  *) exit 98 ;;
esac
`;
  writeBytes(join(fakeBin, 'npm'), Buffer.from(npm, 'utf8'), 0o700);
  writeBytes(join(fakeBin, 'uv'), Buffer.from(uv, 'utf8'), 0o700);
  chmodSync(join(fakeBin, 'npm'), 0o700);
  chmodSync(join(fakeBin, 'uv'), 0o700);
  return fakeBin;
}

function caseEnvironment(fakeBin, caseRoot) {
  return {
    ...process.env,
    PATH: `${fakeBin}:${process.env.PATH ?? ''}`,
    POLICY_NPM_SENTINEL: join(caseRoot, 'NPM_MATERIALIZER_STARTED'),
    POLICY_UV_SENTINEL: join(caseRoot, 'UV_SYNC_STARTED'),
    POLICY_CANDIDATE_SHA: '',
    POLICY_EVENT_SHA: '',
    POLICY_PR_MERGE_SHA: '',
    GITHUB_ACTIONS: '',
  };
}

function invokeCheck(root, env) {
  return runFile(process.execPath, [join(root, ORACLE_PATH), 'check'], { cwd: root, env });
}

function exactCheckState(result) {
  if (result.status !== 0) return null;
  const output = String(result.stdout).trim();
  return output === 'ACTIVE_GREEN_D0P_B_PENDING' || output === 'FULL_GREEN' ? output : null;
}

function replaceOnce(text, needle, replacement, reason = 'HARNESS_MUTATION_TARGET_MISSING') {
  const first = text.indexOf(needle);
  if (first < 0 || text.indexOf(needle, first + needle.length) >= 0) policyRed(reason);
  return `${text.slice(0, first)}${replacement}${text.slice(first + needle.length)}`;
}

function mutateText(root, path, transform) {
  const absolute = join(root, path);
  const before = readFileSync(absolute, 'utf8');
  const after = transform(before);
  if (after === before) policyRed('HARNESS_MUTATION_NO_EFFECT');
  writeBytes(absolute, Buffer.from(after, 'utf8'), lstatSync(absolute).mode & 0o777);
}

function surfacePath(surface) {
  if (surface === 'A1') return '.github/workflows/ci.yml';
  if (surface === 'A2') return '.github/workflows/studio-preview-readiness.yml';
  if (surface === 'A3') return 'bin/monorepo.sh';
  if (surface === 'A4') return 'vercel.json';
  policyRed('HARNESS_UNKNOWN_SURFACE');
}

function replaceFlagOnSurface(root, surface, flag, replacement = '') {
  const path = surfacePath(surface);
  mutateText(root, path, (text) => {
    const marker = surface === 'A3' ? extractFunctionBody(text, 'bootstrap_core') : text;
    if (!marker?.includes(`--${flag}`)) policyRed('HARNESS_MUTATION_TARGET_MISSING');
    const markerAfter = replaceOnce(marker, ` --${flag}`, replacement ? ` ${replacement}` : '');
    return replaceOnce(text, marker, markerAfter);
  });
}

function replaceMaterializerOnSurface(root, surface) {
  const path = surfacePath(surface);
  mutateText(root, path, (text) => {
    const marker = surface === 'A3' ? extractFunctionBody(text, 'bootstrap_core') : text;
    if (!marker) policyRed('HARNESS_MUTATION_TARGET_MISSING');
    const markerAfter = marker.replace(/npm(\s+--prefix\s+apps\/studio)?\s+ci\b/u, 'npm$1 install');
    if (markerAfter === marker) policyRed('HARNESS_MUTATION_TARGET_MISSING');
    return replaceOnce(text, marker, markerAfter);
  });
}

function removeGateOnSurface(root, surface) {
  const path = surfacePath(surface);
  mutateText(root, path, (text) => {
    if (surface === 'A3') return replaceOnce(text, '  policy_studio_install_check\n', '');
    return replaceOnce(text, `${POLICY_CALL} && `, '');
  });
}

function breakAtomicSurface(root, surface) {
  const path = surfacePath(surface);
  mutateText(root, path, (text) => replaceOnce(text, `${POLICY_CALL} && `, `${POLICY_CALL}; `));
}

function mutateBootstrapOrder(root) {
  mutateText(root, 'bin/monorepo.sh', (text) => {
    const body = extractFunctionBody(text, 'bootstrap_core');
    if (!body) policyRed('HARNESS_MUTATION_TARGET_MISSING');
    const moved = body.replace('  policy_studio_install_check\n  uv --directory packages/engine sync', '  uv --directory packages/engine sync\n  policy_studio_install_check');
    return replaceOnce(text, body, moved);
  });
}

function debtLabel(path) {
  if (path === 'apps/studio/AGENTS.md') return 'B1';
  if (path === 'apps/studio/.github/workflows/gate.yml') return 'B2';
  return 'B3';
}

function buildCoreCases(state, legacyBytes) {
  const cases = [
    {
      id: 'N01', expected: 'POLICY_RED:NPMRC_MISSING', mode: 'atomic-callsite',
      mutate(root) { rmSync(join(root, 'apps/studio/.npmrc')); },
    },
    {
      id: 'N02', expected: 'POLICY_RED:NPMRC_NOT_TRUE', mode: 'atomic-callsite',
      mutate(root) { mutateText(root, 'apps/studio/.npmrc', (text) => replaceOnce(text, 'true', 'false')); },
    },
    {
      id: 'N03', expected: 'POLICY_RED:NPMRC_AMBIGUOUS', mode: 'atomic-callsite',
      mutate(root) { mutateText(root, 'apps/studio/.npmrc', (text) => `${text}ignore-scripts=true\n`); },
    },
  ];
  for (const surface of ['A1', 'A2', 'A3', 'A4']) {
    cases.push({
      id: `N04-${surface}`, expected: `POLICY_RED:REQUIRED_FLAG_MISSING:${surface}:ignore-scripts`, mode: 'atomic-callsite', surface,
      mutate(root) { replaceFlagOnSurface(root, surface, 'ignore-scripts'); },
    });
  }
  for (const surface of ['A1', 'A2', 'A3', 'A4']) {
    cases.push({
      id: `N05-${surface}`, expected: `POLICY_RED:REQUIRED_FLAG_MISSING:${surface}:no-audit`, mode: 'atomic-callsite', surface,
      mutate(root) { replaceFlagOnSurface(root, surface, 'no-audit'); },
    });
  }
  for (const surface of ['A1', 'A2', 'A3', 'A4']) {
    cases.push({
      id: `N06-${surface}`, expected: `POLICY_RED:REQUIRED_FLAG_MISSING:${surface}:no-fund`, mode: 'atomic-callsite', surface,
      mutate(root) { replaceFlagOnSurface(root, surface, 'no-fund'); },
    });
  }
  for (const surface of ['A1', 'A2', 'A3', 'A4']) {
    cases.push({
      id: `N07-${surface}`, expected: `POLICY_RED:MATERIALIZER_NOT_CI:${surface}`, mode: 'atomic-callsite', surface,
      mutate(root) { replaceMaterializerOnSurface(root, surface); },
    });
  }
  for (const surface of ['A1', 'A2', 'A4']) {
    cases.push({
      id: `N08-${surface}`, expected: `POLICY_RED:GATE_NOT_ATOMIC:${surface}`, mode: 'static-supervisor', surface,
      mutate(root) { breakAtomicSurface(root, surface); },
    });
  }
  cases.push({ id: 'N09-A3', expected: 'POLICY_RED:BOOTSTRAP_GATE_NOT_FIRST:A3', mode: 'static-supervisor', surface: 'A3', mutate: mutateBootstrapOrder });
  cases.push({
    id: 'N10-A1', expected: 'POLICY_RED:OPTIONAL_OMISSION_FORBIDDEN:A1', mode: 'atomic-callsite', surface: 'A1',
    mutate(root) { replaceFlagOnSurface(root, 'A1', 'no-fund', '--no-fund --omit=optional'); },
  });
  for (const path of B_PATHS) {
    const label = debtLabel(path);
    cases.push({
      id: `N11-${state === 'FULL_GREEN' ? 'B' : 'A'}-${label}`,
      expected: state === 'FULL_GREEN' ? `POLICY_RED:UNSAFE_CURRENT_GUIDANCE:${label}` : `POLICY_RED:DEBT_HASH_DRIFT:${label}`,
      mode: 'atomic-callsite',
      mutate(root) {
        if (state === 'FULL_GREEN') {
          const legacy = legacyBytes[path];
          if (!legacy || sha256(legacy) !== LEGACY_DEBT[path]) policyRed(`HARNESS_LEGACY_FIXTURE_MISSING:${label}`);
          const absolute = join(root, path);
          writeBytes(absolute, legacy, lstatSync(absolute).mode & 0o777);
        } else {
          const absolute = join(root, path);
          writeBytes(
            absolute,
            Buffer.concat([readFileSync(absolute), Buffer.from(' ', 'utf8')]),
            lstatSync(absolute).mode & 0o777,
          );
        }
      },
    });
  }
  for (const historical of HISTORICAL) {
    cases.push({
      id: `N12-${historical.id}`, expected: `POLICY_RED:HISTORICAL_EVIDENCE_DRIFT:${historical.id}`, mode: 'atomic-callsite',
      mutate(root) {
        const absolute = join(root, historical.path);
        writeBytes(
          absolute,
          Buffer.concat([readFileSync(absolute), Buffer.from(' ', 'utf8')]),
          lstatSync(absolute).mode & 0o777,
        );
      },
    });
  }
  cases.push({
    id: 'N13', expected: 'POLICY_RED:UNCLASSIFIED_STUDIO_INSTALL:.hidden/.github/workflows/copy.yml', mode: 'atomic-callsite',
    mutate(root) {
      writeBytes(join(root, '.hidden/.github/workflows/copy.yml'), Buffer.from('jobs:\n  unsafe:\n    defaults:\n      run:\n        working-directory: apps/studio\n    steps:\n      - run: npm ci\n', 'utf8'));
    },
  });
  cases.push({
    id: 'N14', expected: 'POLICY_RED:UNSAFE_STUDIO_INSTALL_GUIDANCE:bin/monorepo.sh', mode: 'atomic-callsite',
    mutate(root) {
      mutateText(root, 'bin/monorepo.sh', (text) => `${text}\n# unsafe-copyable-guidance: npm --prefix apps/studio ci\n`);
    },
  });
  cases.push({
    id: 'N15', expected: 'POLICY_RED:IGNORE_SCRIPTS_OVERRIDE_FALSE:A1', mode: 'atomic-callsite', surface: 'A1',
    mutate(root) { mutateText(root, WORKFLOW_PATH, (text) => `${text}\n# npm_config_ignore_scripts=false\n`); },
  });
  for (const surface of ['A1', 'A2', 'A3', 'A4']) {
    cases.push({
      id: `N16-${surface}`, expected: `POLICY_RED:CALLSITE_GATE_MISSING:${surface}`, mode: 'static-supervisor', surface,
      mutate(root) { removeGateOnSurface(root, surface); },
    });
  }
  if (cases.length !== 43) policyRed('HARNESS_CORE_CASE_COUNT_INTERNAL');
  return cases;
}

function commandForAtomicCase(caseDefinition) {
  if (caseDefinition.surface === 'A3') return ['bash', ['bin/monorepo.sh', 'bootstrap']];
  return ['bash', ['-c', ATOMIC_MATERIALIZE]];
}

function ensurePatchIncludesUntracked(caseRoot) {
  const status = parseNul(gitBuffer(caseRoot, ['status', '--porcelain=v1', '-z']));
  for (const entry of status) {
    if (!entry.startsWith('?? ')) continue;
    const path = entry.slice(3);
    requireRun('git', ['-C', caseRoot, 'add', '-N', '--', path], {}, 'HARNESS_INTENT_TO_ADD_FAILED');
  }
}

function runCoreCases(seed, outputRoot, fakeBin, state, legacyBytes) {
  const results = [];
  const seedRecords = new Map(seed.manifest.records.map((record) => [record.path, record]));
  for (const definition of buildCoreCases(state, legacyBytes)) {
    const caseRoot = join(dirname(seed.seedRoot), `case-${definition.id}`);
    cloneSeed(seed, caseRoot);
    const env = caseEnvironment(fakeBin, caseRoot);
    const positive = invokeCheck(caseRoot, env);
    const positiveState = exactCheckState(positive);
    if (positiveState !== state) {
      policyRed(`HARNESS_RED:POSITIVE_BASELINE_FAILED:${definition.id}`);
    }
    definition.mutate(caseRoot);
    ensurePatchIncludesUntracked(caseRoot);
    const patch = gitBuffer(caseRoot, ['diff', '--binary', '--no-ext-diff']);
    if (patch.length === 0) policyRed(`HARNESS_RED:MUTATION_PATCH_EMPTY:${definition.id}`);
    for (const path of parseNul(gitBuffer(caseRoot, ['diff', '--name-only', '-z']))) {
      const record = seedRecords.get(path);
      if (!record) continue;
      const absolute = join(seed.seedRoot, path);
      if (modeForPath(absolute) !== record.mode || sha256(bytesForPath(absolute)) !== record.sha256) {
        policyRed(`HARNESS_SEED_MUTATED:${definition.id}:${path}`);
      }
    }
    if (gitBuffer(seed.seedRoot, ['status', '--porcelain=v1', '-z']).length !== 0) {
      policyRed(`HARNESS_SEED_MUTATED:${definition.id}`);
    }
    const negative = invokeCheck(caseRoot, env);
    const actualReason = String(negative.stderr || negative.stdout).trim().split('\n').at(-1) ?? '';
    if (negative.status === 0 || actualReason !== definition.expected) {
      policyRed(`HARNESS_RED:REASON_MISMATCH:${definition.id}:${safeToken(actualReason || 'EMPTY')}`);
    }
    let supervisor = { status: 'not-run' };
    if (definition.mode === 'atomic-callsite') {
      const [command, args] = commandForAtomicCase(definition);
      const run = runFile(command, args, { cwd: caseRoot, env });
      supervisor = { status: run.status, stdout: String(run.stdout), stderr: String(run.stderr) };
      if (run.status === 0) policyRed(`HARNESS_RED:UNSAFE_CALLSITE_SUCCEEDED:${definition.id}`);
    }
    const npmStarted = existsSync(join(caseRoot, 'NPM_MATERIALIZER_STARTED'));
    const uvStarted = existsSync(join(caseRoot, 'UV_SYNC_STARTED'));
    if (npmStarted || uvStarted) policyRed(`HARNESS_RED:MATERIALIZER_STARTED:${definition.id}`);

    const positiveDir = join(outputRoot, 'positive');
    const negativeDir = join(outputRoot, 'negative');
    writeBytes(join(positiveDir, `${definition.id}.stdout`), Buffer.from(String(positive.stdout), 'utf8'));
    writeBytes(join(positiveDir, `${definition.id}.stderr`), Buffer.from(String(positive.stderr), 'utf8'));
    writeJson(join(positiveDir, `${definition.id}.json`), {
      schema: HARNESS_SCHEMA,
      caseId: definition.id,
      exit: positive.status,
      state: positiveState,
    });
    writeBytes(join(negativeDir, `${definition.id}.patch`), patch);
    writeBytes(join(negativeDir, `${definition.id}.stdout`), Buffer.from(String(negative.stdout), 'utf8'));
    writeBytes(join(negativeDir, `${definition.id}.stderr`), Buffer.from(String(negative.stderr), 'utf8'));
    writeJson(join(negativeDir, `${definition.id}.json`), {
      schema: HARNESS_SCHEMA,
      caseId: definition.id,
      positiveState,
      positiveExit: positive.status,
      mutationPatchSha256: sha256(patch),
      expectedReason: definition.expected,
      actualReason,
      oracleMode: definition.mode,
      npmMaterializerStarted: npmStarted,
      uvSyncStarted: uvStarted,
      supervisorExit: supervisor.status,
    });
    results.push({ id: definition.id, reason: actualReason, oracleMode: definition.mode });
    removeCheckedTemp(caseRoot, 'case-');
  }
  return results;
}

function lfPositions(bytes) {
  const positions = [];
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0x0a) positions.push(index);
  }
  return positions;
}

function evaluateLedgerBuffers(parentBytes, candidateBytes, metadata = {}) {
  const base = {
    schema: 'ledger-append/v1',
    candidateSha: metadata.candidateSha ?? null,
    parentSha: metadata.parentSha ?? null,
    parentBlob: metadata.parentBlob ?? null,
    candidateBlob: metadata.candidateBlob ?? null,
    parentRawSha256: sha256(parentBytes),
    candidateRawSha256: sha256(candidateBytes),
  };
  if (candidateBytes.equals(parentBytes)) return { ...base, status: 'not_applicable', reason: null };
  if (candidateBytes.length <= parentBytes.length) {
    return { ...base, status: 'RED', reason: 'POLICY_RED:LEDGER_NOT_APPEND' };
  }
  const prefix = candidateBytes.subarray(0, parentBytes.length);
  if (!prefix.equals(parentBytes)) {
    return {
      ...base,
      status: 'RED',
      reason: 'POLICY_RED:LEDGER_PREFIX_DRIFT',
      historicalPrefixByteIdentical: false,
    };
  }
  if (parentBytes.length > 0 && parentBytes.at(-1) !== 0x0a) {
    return { ...base, status: 'RED', reason: 'POLICY_RED:LEDGER_PARENT_NOT_LF_TERMINATED' };
  }
  const suffix = candidateBytes.subarray(parentBytes.length);
  const positions = lfPositions(suffix);
  const hasCr = suffix.includes(0x0d);
  const hasNul = suffix.includes(0x00);
  const common = {
    ...base,
    historicalPrefixByteIdentical: true,
    prefixByteCount: parentBytes.length,
    prefixSha256: sha256(parentBytes),
    suffixByteCount: suffix.length,
    suffixSha256: sha256(suffix),
    lfPositions: positions,
    hasCr,
    hasNul,
  };
  if (positions.length !== 1 || positions[0] !== suffix.length - 1 || hasCr || hasNul) {
    return { ...common, status: 'RED', reason: 'POLICY_RED:LEDGER_NOT_EXACTLY_ONE_LINE' };
  }
  const payloadBytes = suffix.subarray(0, -1);
  let payloadText;
  try {
    payloadText = new TextDecoder('utf-8', { fatal: true }).decode(payloadBytes);
  } catch {
    return { ...common, status: 'RED', reason: 'POLICY_RED:LEDGER_JSON_INVALID', utf8FatalDecode: false };
  }
  if (payloadText.includes('\ufffd')) {
    return { ...common, status: 'RED', reason: 'POLICY_RED:LEDGER_JSON_INVALID', utf8FatalDecode: false };
  }
  let parsedObject;
  try {
    parsedObject = payloadText.trim().length === 0 ? null : JSON.parse(payloadText);
  } catch {
    parsedObject = null;
  }
  if (parsedObject === null || typeof parsedObject !== 'object' || Array.isArray(parsedObject)) {
    return {
      ...common,
      status: 'RED',
      reason: 'POLICY_RED:LEDGER_JSON_INVALID',
      utf8FatalDecode: true,
      jsonObjectParsed: false,
    };
  }
  return {
    ...common,
    status: 'GREEN',
    reason: null,
    utf8FatalDecode: true,
    jsonObjectParsed: true,
    parsedObject,
  };
}

function receiptPrimaryReason(rawReason) {
  const mapping = {
    'POLICY_RED:LEDGER_PREFIX_DRIFT': 'POLICY_RED:RECEIPT_PREFIX_DRIFT',
    'POLICY_RED:LEDGER_NOT_EXACTLY_ONE_LINE': 'POLICY_RED:RECEIPT_NOT_EXACTLY_ONE_LINE',
    'POLICY_RED:LEDGER_JSON_INVALID': 'POLICY_RED:RECEIPT_JSON_INVALID',
  };
  return mapping[rawReason] ?? rawReason;
}

function actualPolicyState(operation) {
  if (operation === 'apply') return 'FULL_GREEN_FUNCTIONAL_ONLY';
  if (operation === 'rollback_applied') return 'ACTIVE_GREEN_D0P_B_PENDING';
  return null;
}

function boundedActual(value) {
  if (value === undefined) return 'MISSING';
  if (typeof value !== 'string') return 'INVALID_TYPE';
  if (value === 'FULL_GREEN_FUNCTIONAL_ONLY' || value === 'ACTIVE_GREEN_D0P_B_PENDING') return value;
  return 'UNKNOWN';
}

function assertExactKeys(value, expectedKeys, reason) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) policyRed(reason);
  const actual = bytewise(Object.keys(value));
  const expected = bytewise(expectedKeys);
  if (!arraysEqual(actual, expected)) policyRed(reason);
  return value;
}

function historicalRegistryFromReader(reader) {
  return HISTORICAL.map((record) => {
    const bytes = reader(record.path);
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      policyRed(`HISTORICAL_EVIDENCE_UTF8_INVALID:${record.id}`);
    }
    const lines = text.split('\n');
    const anchors = [...new Set(bytewise(record.anchors).flatMap((anchor) => {
      const matches = [];
      for (let index = 0; index < lines.length; index += 1) {
        if (lines[index].includes(anchor)) matches.push(index + 1);
      }
      if (matches.length === 0) policyRed(`HISTORICAL_ANCHOR_MISSING:${record.id}`);
      return matches;
    }))].sort((left, right) => left - right);
    return {
      id: record.id,
      path: record.path,
      anchors,
      sha256: sha256(bytes),
      class: record.className,
    };
  });
}

function historicalRegistryAtCommit(root, sha) {
  return historicalRegistryFromReader((path) => gitFile(root, sha, path));
}

function equalJcsValue(left, right) {
  return canonicalizeJcs(left) === canonicalizeJcs(right);
}

function hasReceiptSemanticPreattribution(value) {
  if (value === null || typeof value !== 'object') return false;
  for (const [key, nested] of Object.entries(value)) {
    if (/receiptSemantic/iu.test(key)) return true;
    if (hasReceiptSemanticPreattribution(nested)) return true;
  }
  return false;
}

function receiptProvenanceDigest(context) {
  return sha256(jcsLf({
    schema: 'studio-install-policy-receipt-provenance/v1',
    functionalSha: context.functionalSha,
    oracleAnchorSha: context.oracleAnchorSha,
    oracleSha256: context.oracleSha256,
    workflowAnchorSha: context.workflowAnchorSha,
    workflowSha256: context.workflowSha256,
  }));
}

function validateReceiptObject(payload, context) {
  assertExactKeys(payload, [
    'v', 'task', 'base', 'testedImplementationSha', 'receiptCommitBinding', 'status',
    'operation', 'policyState', 'functionalFiles', 'harness', 'evidence',
    'historicalNonOperational', 'functionalAudit', 'binding', 'externalActions',
  ], 'RECEIPT_SCHEMA_INVALID');
  if (payload.v !== 1 || payload.base !== context.functionalParents?.[0]) policyRed('RECEIPT_SCHEMA_INVALID');
  if (payload.task !== PENDING_TASK) policyRed('RECEIPT_TASK_MISMATCH');
  if (payload.status !== 'POSTCOMMIT_BINDING_PENDING') policyRed('RECEIPT_STATUS_MISMATCH');
  const expectedPolicy = actualPolicyState(payload.operation);
  const actual = boundedActual(payload.policyState);
  if (expectedPolicy === null || payload.operation !== context.expectedOperation
    || payload.policyState !== expectedPolicy || context.functionalState !== expectedPolicy) {
    policyRed(`RECEIPT_OPERATION_POLICY_STATE_MISMATCH:${safeToken(payload.operation ?? 'MISSING')}:${actual}`);
  }
  if (payload.testedImplementationSha !== context.functionalSha) policyRed('RECEIPT_PARENT_SHA_MISMATCH');
  if (!Array.isArray(payload.functionalFiles)
    || new Set(payload.functionalFiles).size !== B_PATHS.length
    || !arraysEqual(bytewise(payload.functionalFiles), B_PATHS)) {
    policyRed('RECEIPT_FUNCTIONAL_FILES_MISMATCH');
  }
  if (hasReceiptSemanticPreattribution(payload.functionalAudit)) {
    policyRed('RECEIPT_SEMANTIC_COUNTS_PREATTRIBUTED');
  }
  const audit = payload.functionalAudit;
  assertExactKeys(audit, [
    'auditTargetSha', 'producerSha', 'auditMode', 'receiptIntentV1', 'core',
    'ledgerGeneric', 'totals', 'npmMaterializerStarted', 'uvSyncStarted',
  ], 'RECEIPT_FUNCTIONAL_AUDIT_INVALID');
  assertExactKeys(audit.core, ['positiveBaselines', 'cases', 'exactReasonMatches'], 'RECEIPT_FUNCTIONAL_AUDIT_INVALID');
  assertExactKeys(audit.ledgerGeneric, ['positiveBaselines', 'cases', 'exactReasonMatches'], 'RECEIPT_FUNCTIONAL_AUDIT_INVALID');
  assertExactKeys(audit.totals, ['positiveBaselines', 'cases', 'exactReasonMatches'], 'RECEIPT_FUNCTIONAL_AUDIT_INVALID');
  if (!audit || audit.receiptIntentV1 !== 'not_applicable'
    || audit.auditTargetSha !== context.functionalSha || audit.producerSha !== context.functionalSha
    || audit.auditMode !== 'pre-receipt'
    || audit.core?.positiveBaselines !== 43 || audit.core?.cases !== 43 || audit.core?.exactReasonMatches !== 43
    || audit.ledgerGeneric?.positiveBaselines !== 3 || audit.ledgerGeneric?.cases !== 3 || audit.ledgerGeneric?.exactReasonMatches !== 3
    || audit.totals?.positiveBaselines !== 46 || audit.totals?.cases !== 46 || audit.totals?.exactReasonMatches !== 46
    || audit.npmMaterializerStarted !== 0 || audit.uvSyncStarted !== 0) {
    policyRed('RECEIPT_FUNCTIONAL_AUDIT_INVALID');
  }
  assertExactKeys(payload.binding, [
    'receiptCommit', 'requiredFinalCheck', 'requiredTranche', 'requiredCanonicalRoot', 'status',
  ], 'RECEIPT_BINDING_CLAIM_INVALID');
  if (payload.binding?.status !== 'POSTCOMMIT_BINDING_PENDING'
    || payload.binding?.receiptCommit !== 'self_sha_intentionally_unbound'
    || payload.binding?.requiredFinalCheck !== 'ci / studio-install-policy'
    || payload.binding?.requiredCanonicalRoot !== 'docs/ops/evidence/studio-install-policy'
    || payload.binding?.requiredTranche !== 'ARD-11-E-POSTCOMMIT') {
    policyRed('RECEIPT_BINDING_CLAIM_INVALID');
  }
  if (payload.receiptCommitBinding !== 'git_postcommit_e_required') policyRed('RECEIPT_BINDING_CLAIM_INVALID');
  assertExactKeys(payload.harness, [
    'oracleSchema', 'schema', 'commit', 'candidateSha', 'oraclePath', 'oracleAnchorSha',
    'oracleSha256', 'workflowPath', 'workflowAnchorSha', 'workflowSha256',
  ], 'RECEIPT_HARNESS_PROVENANCE_INVALID');
  if (!payload.harness || payload.harness.oracleSchema !== ORACLE_SCHEMA || payload.harness.schema !== HARNESS_SCHEMA
    || payload.harness.commit !== context.functionalSha || payload.harness.candidateSha !== context.functionalSha
    || payload.harness.oraclePath !== ORACLE_PATH || payload.harness.oracleAnchorSha !== context.oracleAnchorSha
    || payload.harness.oracleSha256 !== context.oracleSha256 || payload.harness.workflowPath !== WORKFLOW_PATH
    || payload.harness.workflowAnchorSha !== context.workflowAnchorSha
    || payload.harness.workflowSha256 !== context.workflowSha256) {
    policyRed('RECEIPT_HARNESS_PROVENANCE_INVALID');
  }
  assertExactKeys(payload.evidence, [
    'artifactRef', 'summaryRawSha256', 'sha256sumsRef', 'sha256sumsRawSha256', 'precommitPolicyInputDigest',
  ], 'RECEIPT_EVIDENCE_INVALID');
  if (!payload.evidence || typeof payload.evidence.artifactRef !== 'string'
    || typeof payload.evidence.sha256sumsRef !== 'string'
    || !payload.evidence.artifactRef.startsWith('local-scratch:')
    || !payload.evidence.sha256sumsRef.startsWith('local-scratch:')
    || !SHA256_RE.test(payload.evidence.summaryRawSha256 ?? '')
    || !SHA256_RE.test(payload.evidence.sha256sumsRawSha256 ?? '')
    || payload.evidence.precommitPolicyInputDigest !== receiptProvenanceDigest(context)) {
    policyRed('RECEIPT_EVIDENCE_INVALID');
  }
  const expectedHistorical = context.historicalExpected;
  if (!Array.isArray(payload.historicalNonOperational) || payload.historicalNonOperational.length !== 9
    || !Array.isArray(expectedHistorical) || expectedHistorical.length !== 9) {
    policyRed('RECEIPT_HISTORICAL_REGISTRY_INVALID');
  }
  for (let index = 0; index < HISTORICAL.length; index += 1) {
    const actualRecord = payload.historicalNonOperational[index];
    const expectedRecord = expectedHistorical[index];
    assertExactKeys(actualRecord, ['id', 'path', 'anchors', 'sha256', 'class'], `RECEIPT_HISTORICAL_REGISTRY_INVALID:${HISTORICAL[index].id}`);
    if (!equalJcsValue(actualRecord, expectedRecord)) {
      policyRed(`RECEIPT_HISTORICAL_REGISTRY_INVALID:${HISTORICAL[index].id}`);
    }
  }
  return payload;
}

function validateReceiptSemantic(context) {
  if ((context.candidateParents ?? []).length !== 1) policyRed('RECEIPT_MERGE_COMMIT:R');
  if (!context.functionalSha) policyRed('RECEIPT_FUNCTIONAL_COMMIT_NOT_FOUND');
  if ((context.functionalParents ?? []).length !== 1) policyRed('RECEIPT_MERGE_COMMIT:F');
  if (context.candidateParents[0] !== context.functionalSha) {
    policyRed(`RECEIPT_INTERMEDIATE_COMMIT:${context.candidateParents[0]}`);
  }
  const functionalPaths = bytewise(context.functionalPaths ?? []);
  const extraF = functionalPaths.find((path) => !B_PATHS.includes(path));
  if (extraF) policyRed(`RECEIPT_SCOPE_EXTRA:F:${extraF}`);
  const missingF = B_PATHS.find((path) => !functionalPaths.includes(path));
  if (missingF) policyRed(`RECEIPT_SCOPE_MISSING:F:${missingF}`);
  const receiptPaths = bytewise(context.receiptPaths ?? []);
  const extraR = receiptPaths.find((path) => path !== LEDGER_PATH);
  if (extraR) policyRed(`RECEIPT_SCOPE_EXTRA:R:${extraR}`);
  if (!receiptPaths.includes(LEDGER_PATH)) policyRed(`RECEIPT_SCOPE_MISSING:R:${LEDGER_PATH}`);
  const ledger = evaluateLedgerBuffers(context.parentLog, context.candidateLog, {
    candidateSha: context.candidateSha,
    parentSha: context.functionalSha,
  });
  if (ledger.status !== 'GREEN') policyRed(receiptPrimaryReason(ledger.reason));
  const payload = validateReceiptObject(ledger.parsedObject, context);
  return {
    status: 'GREEN',
    receiptStructuralAcceptanceV1: 'GREEN',
    publicationBindingV1: 'INCOMPLETE',
    ledger,
    payload,
  };
}

function gitParents(root, sha) {
  const line = git(root, ['rev-list', '--parents', '-n', '1', sha]);
  const values = line.split(' ');
  return values.slice(1);
}

function changedPaths(root, parent, candidate) {
  const bytes = gitBuffer(root, ['diff-tree', '--no-commit-id', '--name-only', '-r', '-z', parent, candidate]);
  return bytewise(parseNul(bytes));
}

function gitFile(root, sha, path, missing = null) {
  const result = runFile('git', ['-C', root, 'show', `${sha}:${path}`], { encoding: null });
  if (result.status !== 0) {
    if (missing !== null) return Buffer.from(missing);
    policyRed(`GIT_EVIDENCE_MISSING:${path}`);
  }
  return Buffer.from(result.stdout);
}

function gitBlob(root, sha, path) {
  const result = runFile('git', ['-C', root, 'rev-parse', `${sha}:${path}`]);
  return result.status === 0 ? String(result.stdout).trim() : null;
}

function validateReceiptCommit(root, functionalSha, receiptSha, functionalState, expectedOperation = null, provenance = {}) {
  const parentLog = gitFile(root, functionalSha, LEDGER_PATH, Buffer.alloc(0));
  const candidateLog = gitFile(root, receiptSha, LEDGER_PATH, Buffer.alloc(0));
  return validateReceiptSemantic({
    candidateSha: receiptSha,
    candidateParents: gitParents(root, receiptSha),
    functionalSha,
    functionalParents: gitParents(root, functionalSha),
    functionalPaths: changedPaths(root, gitParents(root, functionalSha)[0], functionalSha),
    receiptPaths: changedPaths(root, functionalSha, receiptSha),
    parentLog,
    candidateLog,
    functionalState,
    expectedOperation: expectedOperation ?? (functionalState === 'FULL_GREEN_FUNCTIONAL_ONLY' ? 'apply' : 'rollback_applied'),
    historicalExpected: historicalRegistryAtCommit(root, functionalSha),
    ...provenance,
  });
}

const TEST_SHA = Object.freeze({
  P0: '0000000000000000000000000000000000000001',
  O: '0000000000000000000000000000000000000002',
  A: '0000000000000000000000000000000000000003',
  F: '0000000000000000000000000000000000000004',
  R: '0000000000000000000000000000000000000005',
  I: '0000000000000000000000000000000000000006',
  OTHER: '0000000000000000000000000000000000000007',
});

function receiptHistoricalFixture() {
  return HISTORICAL.map((record) => ({
    id: record.id,
    path: record.path,
    anchors: [1],
    sha256: record.sha256,
    class: record.className,
  }));
}

function goodReceiptPayload(overrides = {}) {
  const digest = 'a'.repeat(64);
  const provenance = {
    functionalSha: TEST_SHA.F,
    oracleAnchorSha: TEST_SHA.O,
    oracleSha256: digest,
    workflowAnchorSha: TEST_SHA.A,
    workflowSha256: digest,
  };
  const payload = {
    v: 1,
    task: PENDING_TASK,
    base: TEST_SHA.A,
    testedImplementationSha: TEST_SHA.F,
    receiptCommitBinding: 'git_postcommit_e_required',
    status: 'POSTCOMMIT_BINDING_PENDING',
    operation: 'apply',
    policyState: 'FULL_GREEN_FUNCTIONAL_ONLY',
    functionalFiles: [...B_PATHS],
    harness: {
      oracleSchema: ORACLE_SCHEMA,
      schema: HARNESS_SCHEMA,
      commit: TEST_SHA.F,
      candidateSha: TEST_SHA.F,
      oraclePath: ORACLE_PATH,
      oracleAnchorSha: TEST_SHA.O,
      oracleSha256: digest,
      workflowPath: WORKFLOW_PATH,
      workflowAnchorSha: TEST_SHA.A,
      workflowSha256: digest,
    },
    evidence: {
      artifactRef: 'local-scratch:/tmp/policy#summary.json',
      summaryRawSha256: digest,
      sha256sumsRef: 'local-scratch:/tmp/policy#sha256sums.txt',
      sha256sumsRawSha256: digest,
      precommitPolicyInputDigest: receiptProvenanceDigest(provenance),
    },
    historicalNonOperational: receiptHistoricalFixture(),
    functionalAudit: {
      auditTargetSha: TEST_SHA.F,
      producerSha: TEST_SHA.F,
      auditMode: 'pre-receipt',
      receiptIntentV1: 'not_applicable',
      core: { positiveBaselines: 43, cases: 43, exactReasonMatches: 43 },
      ledgerGeneric: { positiveBaselines: 3, cases: 3, exactReasonMatches: 3 },
      totals: { positiveBaselines: 46, cases: 46, exactReasonMatches: 46 },
      npmMaterializerStarted: 0,
      uvSyncStarted: 0,
    },
    binding: {
      receiptCommit: 'self_sha_intentionally_unbound',
      requiredFinalCheck: 'ci / studio-install-policy',
      requiredTranche: 'ARD-11-E-POSTCOMMIT',
      requiredCanonicalRoot: 'docs/ops/evidence/studio-install-policy',
      status: 'POSTCOMMIT_BINDING_PENDING',
    },
    externalActions: 'no deploy/production promotion; Git E required',
  };
  return Object.assign(payload, overrides);
}

function receiptFixture(payload = goodReceiptPayload()) {
  const parentLog = Buffer.from('{"historical":true}\n', 'utf8');
  return {
    candidateSha: TEST_SHA.R,
    candidateParents: [TEST_SHA.F],
    functionalSha: TEST_SHA.F,
    functionalParents: [TEST_SHA.A],
    functionalPaths: [...B_PATHS],
    receiptPaths: [LEDGER_PATH],
    parentLog,
    candidateLog: Buffer.concat([parentLog, Buffer.from(`${JSON.stringify(payload)}\n`, 'utf8')]),
    functionalState: 'FULL_GREEN_FUNCTIONAL_ONLY',
    expectedOperation: 'apply',
    historicalExpected: receiptHistoricalFixture(),
    oracleAnchorSha: TEST_SHA.O,
    oracleSha256: 'a'.repeat(64),
    workflowAnchorSha: TEST_SHA.A,
    workflowSha256: 'a'.repeat(64),
  };
}

function capturePolicyReason(operation) {
  try {
    operation();
    return null;
  } catch (error) {
    if (!(error instanceof PolicyViolation)) throw error;
    return error.reason;
  }
}

function runLedgerCases(outputRoot) {
  const parent = Buffer.from('{"historical":true}\n', 'utf8');
  const unrelated = Buffer.from('{"task":"HARNESS-UNRELATED-LEDGER-CONTROL"}\n', 'utf8');
  const definitions = [
    {
      id: 'L01', expected: 'POLICY_RED:LEDGER_PREFIX_DRIFT',
      candidate: Buffer.concat([Buffer.from('{"historical":falsf}\n', 'utf8'), unrelated]),
    },
    {
      id: 'L02', expected: 'POLICY_RED:LEDGER_NOT_EXACTLY_ONE_LINE',
      candidate: Buffer.concat([parent, unrelated, unrelated]),
    },
    {
      id: 'L03', expected: 'POLICY_RED:LEDGER_JSON_INVALID',
      candidate: Buffer.concat([parent, Buffer.from([0xff, 0x0a])]),
    },
  ];
  return definitions.map((definition, index) => {
    const positive = evaluateLedgerBuffers(parent, Buffer.concat([parent, unrelated]));
    if (positive.status !== 'GREEN') policyRed(`HARNESS_RED:LEDGER_POSITIVE_FAILED:L-P01${String.fromCharCode(97 + index)}`);
    const negative = evaluateLedgerBuffers(parent, definition.candidate);
    if (negative.reason !== definition.expected) policyRed(`HARNESS_RED:LEDGER_REASON_MISMATCH:${definition.id}`);
    writeJson(join(outputRoot, 'positive', `${definition.id}.json`), {
      schema: HARNESS_SCHEMA,
      caseId: `L-P01${String.fromCharCode(97 + index)}`,
      ledgerAppendV1: 'GREEN',
      newArd11LastLine: false,
      ledgerAfterFunctionalB: false,
      newPendingBindingState: false,
      receiptIntentV1: 'not_applicable',
      bindingState: 'ACCEPTED_E_DESCENDANT',
      publicationBindingV1: 'COMPLETE',
    });
    writeJson(join(outputRoot, 'negative', `${definition.id}.json`), {
      schema: HARNESS_SCHEMA,
      caseId: definition.id,
      expectedReason: definition.expected,
      actualReason: negative.reason,
      receiptIntentV1: 'not_applicable',
    });
    return { id: definition.id, reason: negative.reason };
  });
}

function receiptProvenanceForHistory(root, history) {
  return {
    oracleAnchorSha: history.O,
    oracleSha256: sha256(gitFile(root, history.O, ORACLE_PATH)),
    workflowAnchorSha: history.A,
    workflowSha256: sha256(gitFile(root, history.A, WORKFLOW_PATH)),
  };
}

function createReceiptCaseHistory(sourceRoot, fixtureRoot) {
  ensureDirectory(fixtureRoot);
  for (const path of [...B_PATHS, ...HISTORICAL.map((record) => record.path)]) {
    copyCandidateEntry(sourceRoot, fixtureRoot, path);
  }
  const legacyBytes = findLegacyDebtBytes(sourceRoot);
  if (!B_PATHS.every((path) => legacyBytes[path])) policyRed('HARNESS_RECEIPT_LEGACY_FIXTURE_MISSING');
  writeContentMap(fixtureRoot, legacyBytes);
  writeBytes(join(fixtureRoot, LEDGER_PATH), Buffer.from('{"historical":true}\n'));
  writeContentMap(fixtureRoot, {
    'apps/studio/.npmrc': Buffer.from('ignore-scripts=false\n'),
    '.github/workflows/ci.yml': Buffer.from('name: legacy-ci\n'),
    '.github/workflows/studio-preview-readiness.yml': Buffer.from('name: legacy-preview\n'),
    'bin/monorepo.sh': Buffer.from('#!/usr/bin/env bash\nexit 64\n'),
    'vercel.json': Buffer.from('{}\n'),
  });
  initializeFixtureRepository(fixtureRoot);
  const history = { root: fixtureRoot, P0: git(fixtureRoot, ['rev-parse', 'HEAD']) };
  copyCandidateEntry(sourceRoot, fixtureRoot, ORACLE_PATH);
  history.O = commitFixture(fixtureRoot, 'receipt oracle O', [ORACLE_PATH]);
  const safe = safeDebtContents();
  writeContentMap(fixtureRoot, activeEpochContents(
    history.O,
    sha256(readBytes(fixtureRoot, ORACLE_PATH)),
    manifestDigestForContents(safe),
  ));
  history.A = commitFixture(fixtureRoot, 'receipt workflow A', A_PATHS);
  writeContentMap(fixtureRoot, safe);
  history.F = commitFixture(fixtureRoot, 'receipt functional F', B_PATHS);
  history.R = appendReceiptCommit(fixtureRoot, history, history.F, 'apply', 'FULL_GREEN_FUNCTIONAL_ONLY');
  return history;
}

function runReceiptCases(sourceRoot, outputRoot) {
  const tempRoot = checkedTempRoot('ardesia-policy-receipts-');
  try {
    const history = createReceiptCaseHistory(sourceRoot, join(tempRoot, 'receipt-base'));
    const definitions = [
      ['R01', 'POLICY_RED:RECEIPT_PREFIX_DRIFT'],
      ['R02', 'POLICY_RED:RECEIPT_PREFIX_DRIFT'],
      ['R03', 'POLICY_RED:RECEIPT_NOT_EXACTLY_ONE_LINE'],
      ['R04', 'POLICY_RED:RECEIPT_NOT_EXACTLY_ONE_LINE'],
      ['R05', 'POLICY_RED:RECEIPT_NOT_EXACTLY_ONE_LINE'],
      ['R06', 'POLICY_RED:RECEIPT_JSON_INVALID'],
      ['R07', 'POLICY_RED:RECEIPT_JSON_INVALID'],
      ['R08', 'POLICY_RED:RECEIPT_JSON_INVALID'],
      ['R09', 'POLICY_RED:RECEIPT_PARENT_SHA_MISMATCH'],
      ['R10', 'POLICY_RED:RECEIPT_PARENT_SHA_MISMATCH'],
      ['R11', 'POLICY_RED:RECEIPT_PARENT_SHA_MISMATCH'],
      ['R12', 'POLICY_RED:RECEIPT_PARENT_SHA_MISMATCH'],
      ['R13', 'POLICY_RED:RECEIPT_SCOPE_EXTRA:R:apps/studio/receipt-extra.txt'],
      ['R14', 'POLICY_RED:RECEIPT_SCOPE_EXTRA:F:apps/studio/receipt-extra.txt'],
      ['R15', null],
      ['R16', 'POLICY_RED:RECEIPT_MERGE_COMMIT:R'],
    ];
    return definitions.map(([id, staticExpected]) => {
      const caseRoot = join(tempRoot, `receipt-${id}`);
      cloneFixture(history.root, caseRoot, history.R);
      const provenance = receiptProvenanceForHistory(caseRoot, history);
      const positive = validateReceiptCommit(
        caseRoot, history.F, history.R, 'FULL_GREEN_FUNCTIONAL_ONLY', 'apply', provenance,
      );
      if (positive.status !== 'GREEN') policyRed(`HARNESS_RED:RECEIPT_POSITIVE_FAILED:${id}`);
      checkoutFixture(caseRoot, history.F);
      const parentLog = gitFile(caseRoot, history.F, LEDGER_PATH, Buffer.alloc(0));
      const goodPayload = receiptPayloadForHistory(caseRoot, history, history.F, 'apply', 'FULL_GREEN_FUNCTIONAL_ONLY');
      let functionalSha = history.F;
      let candidateSha;
      let expected = staticExpected;
      if (id === 'R01') {
        const prefix = Buffer.from(parentLog); prefix[5] ^= 1;
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([prefix, Buffer.from(`${JSON.stringify(goodPayload)}\n`)]));
      } else if (id === 'R02') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog.subarray(0, -2), Buffer.from(`${JSON.stringify(goodPayload)}\n`)]));
      } else if (id === 'R03') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from(`${JSON.stringify(goodPayload)}\n\n`)]));
      } else if (id === 'R04') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from(JSON.stringify(goodPayload))]));
      } else if (id === 'R05') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from(`${JSON.stringify(goodPayload)}\n{"task":"other"}\n`)]));
      } else if (id === 'R06') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from([0x20, 0x09, 0x20, 0x0a])]));
      } else if (id === 'R07') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from('{broken\n')]));
      } else if (id === 'R08') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from('[]\n')]));
      } else if (['R09', 'R10', 'R11', 'R12'].includes(id)) {
        const wrong = { R09: history.A, R10: history.R, R11: history.O, R12: history.P0 }[id];
        goodPayload.testedImplementationSha = wrong;
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from(`${JSON.stringify(goodPayload)}\n`)]));
      } else if (id === 'R13') {
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from(`${JSON.stringify(goodPayload)}\n`)]));
        writeBytes(join(caseRoot, 'apps/studio/receipt-extra.txt'), Buffer.from('extra\n'));
      } else if (id === 'R14') {
        checkoutFixture(caseRoot, history.A);
        writeContentMap(caseRoot, safeDebtContents());
        writeBytes(join(caseRoot, 'apps/studio/receipt-extra.txt'), Buffer.from('extra\n'));
        functionalSha = commitFixture(caseRoot, 'R14 functional superset', [...B_PATHS, 'apps/studio/receipt-extra.txt']);
        const payload = receiptPayloadForHistory(caseRoot, history, functionalSha, 'apply', 'FULL_GREEN_FUNCTIONAL_ONLY');
        const log = gitFile(caseRoot, functionalSha, LEDGER_PATH, Buffer.alloc(0));
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([log, Buffer.from(`${JSON.stringify(payload)}\n`)]));
      } else if (id === 'R15') {
        const intermediate = writeUnrelatedCommit(caseRoot, 'R15');
        const payload = receiptPayloadForHistory(caseRoot, history, history.F, 'apply', 'FULL_GREEN_FUNCTIONAL_ONLY');
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from(`${JSON.stringify(payload)}\n`)]));
        expected = `POLICY_RED:RECEIPT_INTERMEDIATE_COMMIT:${intermediate}`;
      } else if (id === 'R16') {
        const sideSha = writeUnrelatedCommit(caseRoot, 'R16-side');
        checkoutFixture(caseRoot, history.F);
        writeBytes(join(caseRoot, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from(`${JSON.stringify(goodPayload)}\n`)]));
        const receiptTreeSha = commitFixture(caseRoot, 'R16 receipt tree', [LEDGER_PATH]);
        const tree = git(caseRoot, ['rev-parse', `${receiptTreeSha}^{tree}`]);
        candidateSha = git(caseRoot, ['commit-tree', tree, '-p', history.F, '-p', sideSha, '-m', 'R16 merge receipt'], {
          env: fixedGitEnvironment(),
        });
        checkoutFixture(caseRoot, candidateSha);
      }
      if (!candidateSha) {
        const paths = id === 'R13' ? [LEDGER_PATH, 'apps/studio/receipt-extra.txt'] : [LEDGER_PATH];
        candidateSha = commitFixture(caseRoot, `receipt mutation ${id}`, paths);
      }
      const intent = detectReceiptIntentV1(caseRoot, candidateSha, postcommitFixtureOptions(history, candidateSha));
      if (!intent.detected) policyRed(`HARNESS_RED:RECEIPT_INTENT_NOT_DETECTED:${id}`);
      if (id === 'R14' && intent.nearestFunctionalSha !== functionalSha) {
        policyRed('HARNESS_RED:RECEIPT_FUNCTIONAL_SUPERSET_NOT_DETECTED:R14');
      }
      const reason = capturePolicyReason(() => validateReceiptCommit(
        caseRoot,
        functionalSha,
        candidateSha,
        deriveFunctionalPolicyState(caseRoot, functionalSha),
        'apply',
        receiptProvenanceForHistory(caseRoot, history),
      ));
      if (reason !== expected) policyRed(`HARNESS_RED:RECEIPT_REASON_MISMATCH:${id}`);
      const patchBytes = gitBuffer(caseRoot, ['show', '--format=', '--binary', candidateSha]);
      const caseProvenance = {
        repositoryKind: 'fresh-local-git-clone',
        candidateSha,
        candidateTree: git(caseRoot, ['rev-parse', `${candidateSha}^{tree}`]),
        parents: gitParents(caseRoot, candidateSha),
        functionalSha,
        functionalScope: changedPaths(caseRoot, gitParents(caseRoot, functionalSha)[0], functionalSha),
        patchSha256: sha256(patchBytes),
      };
      writeJson(join(outputRoot, 'positive', `${id}.json`), {
        schema: HARNESS_SCHEMA, caseId: id, receiptStructuralAcceptanceV1: 'GREEN',
        publicationBindingV1: 'INCOMPLETE', baselineReceiptSha: history.R,
        baselineTree: git(caseRoot, ['rev-parse', `${history.R}^{tree}`]),
      });
      writeJson(join(outputRoot, 'negative', `${id}.json`), {
        schema: HARNESS_SCHEMA, caseId: id, expectedReason: expected, actualReason: reason,
        receiptIntentV1: intent, gitProvenance: caseProvenance,
      });
      return { id, reason };
    });
  } finally {
    removeCheckedTemp(tempRoot, 'ardesia-policy-receipts-');
  }
}

const CONTROL_COUNTS = Object.freeze({
  bootstrapIntegrityCounts: Object.freeze({ positiveBaselines: 3, negativeCases: 3 }),
  preReceiptTransitionCounts: Object.freeze({ positiveBaselines: 5, negativeCases: 3 }),
  bindingVerifierCounts: Object.freeze({ positiveBaselines: 7, negativeCases: 7, robustnessGreen: 1 }),
  stateMachineCounts: Object.freeze({ validTransitions: 7, rejectedTransitions: 7 }),
  rollbackRecoveryCounts: Object.freeze({ validChains: 1, rejectedChains: 5 }),
});

let controlPlaneDepth = 0;
const canonicalReplayCache = new Map();
let canonicalReplayInvocation = 0;
const canonicalReplayEvidence = [];

function safeDebtContents() {
  return {
    'apps/studio/AGENTS.md': Buffer.from([
      '# Studio dependency policy',
      `lock-only: ${LOCK_ONLY}`,
      `materialize: ${LOCAL_MATERIALIZE}`,
      'Lifecycle scripts, optional omission, install fallback, wizard and generator use are forbidden.',
      'Every dependency change requires authorization and an exact package/lock tranche.',
      '',
    ].join('\n'), 'utf8'),
    'apps/studio/.github/workflows/gate.yml': Buffer.from([
      'archived_evidence:',
      '  operational: false',
      '  reason: nested_workflow_never_loaded_by_github',
      '  authoritative_workflows:',
      '    - /.github/workflows/ci.yml',
      '    - /.github/workflows/studio-preview-readiness.yml',
      '',
    ].join('\n'), 'utf8'),
    'docs/ops/RELEASE-CHECKLIST-PRODUCT-RC.md': Buffer.from([
      '# Release checklist',
      '',
      '```bash',
      `${POLICY_CALL} && \\`,
      `  ${MATERIALIZE}`,
      '```',
      '',
      'H01 H02 H03 H04 H05 H06 H07 H08 H09 are historical evidence only; their commands are not operational shortcuts.',
      '',
    ].join('\n'), 'utf8'),
  };
}

function manifestDigestForContents(contents) {
  const pieces = [];
  for (const path of bytewise(B_PATHS)) {
    pieces.push(Buffer.from(path), Buffer.from([0]), Buffer.from(sha256(contents[path])), Buffer.from([0]));
  }
  return sha256(Buffer.concat(pieces));
}

function activeEpochContents(oracleSha, oracleDigest, manifestDigest) {
  const markers = [
    `  # ARD11_D0P_A_ORACLE_COMMIT_V3=${oracleSha}`,
    `  # ARD11_D0P_A_ORACLE_BINDING_V3=${oracleDigest}`,
    `  # ARD11_D0P_A_EXPECTED_F_MANIFEST_V3=${manifestDigest}`,
  ].join('\n');
  return {
    'apps/studio/.npmrc': Buffer.from('ignore-scripts=true\n'),
    '.github/workflows/ci.yml': Buffer.from(`name: ci\n${markers}\njobs:\n  studio:\n    steps:\n      - name: install\n        working-directory: \${{ github.workspace }}\n        run: ${ATOMIC_MATERIALIZE}\n`),
    '.github/workflows/studio-preview-readiness.yml': Buffer.from(`name: preview\njobs:\n  preview:\n    steps:\n      - run: ${ATOMIC_MATERIALIZE}\n`),
    'bin/monorepo.sh': Buffer.from(syntheticMonorepoScript()),
    'vercel.json': Buffer.from(`${JSON.stringify({ installCommand: ATOMIC_MATERIALIZE, buildCommand: 'npm --prefix apps/studio run build', outputDirectory: 'apps/studio/dist' }, null, 2)}\n`),
  };
}

function writeContentMap(root, contents) {
  for (const [path, bytes] of Object.entries(contents)) writeBytes(join(root, path), bytes, path.endsWith('.sh') ? 0o700 : 0o600);
  if (contents['bin/monorepo.sh']) chmodSync(join(root, 'bin/monorepo.sh'), 0o700);
}

function commitFixture(root, message, paths) {
  requireRun('git', ['-C', root, 'add', '--', ...bytewise(paths)], {}, 'CONTROL_GIT_ADD_FAILED');
  requireRun('git', ['-C', root, 'commit', '-m', message], { env: fixedGitEnvironment() }, 'CONTROL_GIT_COMMIT_FAILED');
  return git(root, ['rev-parse', 'HEAD']);
}

function checkoutFixture(root, sha) {
  requireRun('git', ['-C', root, 'checkout', '--quiet', '--detach', sha], {}, 'CONTROL_GIT_CHECKOUT_FAILED');
}

function cloneFixture(source, destination, sha) {
  requireRun('git', ['clone', '--quiet', '--no-hardlinks', '--local', source, destination], {}, 'CONTROL_GIT_CLONE_FAILED');
  checkoutFixture(destination, sha);
}

function receiptPayloadForHistory(root, history, functionalSha, operation, policyState) {
  const digest = 'a'.repeat(64);
  const parentSha = gitParents(root, functionalSha)[0];
  const provenance = {
    functionalSha,
    oracleAnchorSha: history.O,
    oracleSha256: sha256(gitFile(root, history.O, ORACLE_PATH)),
    workflowAnchorSha: history.A,
    workflowSha256: sha256(gitFile(root, history.A, WORKFLOW_PATH)),
  };
  return {
    v: 1,
    task: PENDING_TASK,
    base: parentSha,
    testedImplementationSha: functionalSha,
    receiptCommitBinding: 'git_postcommit_e_required',
    status: 'POSTCOMMIT_BINDING_PENDING',
    operation,
    policyState,
    functionalFiles: [...B_PATHS],
    harness: {
      oracleSchema: ORACLE_SCHEMA, schema: HARNESS_SCHEMA, commit: functionalSha,
      candidateSha: functionalSha, oraclePath: ORACLE_PATH, oracleAnchorSha: history.O,
      oracleSha256: provenance.oracleSha256, workflowPath: WORKFLOW_PATH,
      workflowAnchorSha: history.A, workflowSha256: provenance.workflowSha256,
    },
    evidence: {
      artifactRef: 'local-scratch:/tmp/policy#summary.json', summaryRawSha256: digest,
      sha256sumsRef: 'local-scratch:/tmp/policy#sha256sums.txt', sha256sumsRawSha256: digest,
      precommitPolicyInputDigest: receiptProvenanceDigest(provenance),
    },
    historicalNonOperational: historicalRegistryAtCommit(root, functionalSha),
    functionalAudit: {
      auditTargetSha: functionalSha, producerSha: functionalSha, auditMode: 'pre-receipt',
      receiptIntentV1: 'not_applicable',
      core: { positiveBaselines: 43, cases: 43, exactReasonMatches: 43 },
      ledgerGeneric: { positiveBaselines: 3, cases: 3, exactReasonMatches: 3 },
      totals: { positiveBaselines: 46, cases: 46, exactReasonMatches: 46 },
      npmMaterializerStarted: 0, uvSyncStarted: 0,
    },
    binding: {
      receiptCommit: 'self_sha_intentionally_unbound', requiredFinalCheck: 'ci / studio-install-policy',
      requiredTranche: 'ARD-11-E-POSTCOMMIT', requiredCanonicalRoot: 'docs/ops/evidence/studio-install-policy',
      status: 'POSTCOMMIT_BINDING_PENDING',
    },
    externalActions: 'no deploy/production promotion; Git E required',
  };
}

function appendReceiptCommit(root, history, functionalSha, operation, policyState, mutate = null) {
  const payload = receiptPayloadForHistory(root, history, functionalSha, operation, policyState);
  if (mutate) mutate(payload);
  const parent = gitFile(root, functionalSha, LEDGER_PATH, Buffer.alloc(0));
  writeBytes(join(root, LEDGER_PATH), Buffer.concat([parent, Buffer.from(`${JSON.stringify(payload)}\n`)]));
  return commitFixture(root, `control receipt ${operation}`, [LEDGER_PATH]);
}

function postcommitFixtureOptions(history, candidateSha) {
  return {
    candidateSha, oracleAnchorSha: history.O, workflowAnchorSha: history.A,
    pendingTask: PENDING_TASK, indexPath: EVIDENCE_INDEX_PATH, recordsDir: EVIDENCE_RECORDS_DIR,
    canonicalDir: EVIDENCE_CANONICAL_DIR, revocationsDir: EVIDENCE_REVOCATIONS_DIR,
    auditMode: 'receipt-intent', expectedCore: 43, expectedLedgerGeneric: 3, expectedReceiptSemantic: 16,
  };
}

function canonicalCacheKey(receiptSha, oracleSha, workflowSha) {
  return `${receiptSha}:${oracleSha}:${workflowSha}`;
}

function canonicalCacheIdentity(root, receiptSha, oracleSha, workflowSha) {
  return sha256(jcsLf({
    receiptSha,
    receiptTree: git(root, ['rev-parse', `${receiptSha}^{tree}`]),
    receiptLedgerBlob: gitBlob(root, receiptSha, LEDGER_PATH),
    oracleSha,
    oracleBlob: gitBlob(root, oracleSha, ORACLE_PATH),
    workflowSha,
    workflowBlob: gitBlob(root, workflowSha, WORKFLOW_PATH),
  }));
}

function generateCanonicalForReceipt(root, history, receiptSha, fakeBin, scratchRoot) {
  checkoutFixture(root, receiptSha);
  canonicalReplayInvocation += 1;
  const caseKey = sha256(Buffer.from(`${realpathSync(root)}\0${receiptSha}\0${canonicalReplayInvocation}`, 'utf8')).slice(0, 16);
  const caseRoot = join(scratchRoot, 'canonical-replays', `${String(canonicalReplayInvocation).padStart(4, '0')}-${caseKey}`);
  const output = join(caseRoot, 'raw');
  const canonicalOutput = join(caseRoot, 'canonical.json');
  runHarness(root, {
    output, canonicalOutput, candidateSha: receiptSha, oracleAnchorSha: history.O,
    workflowAnchorSha: history.A, auditMode: 'receipt-intent', producerTranche: 'ARD-11-E-POSTCOMMIT',
    noMaterialize: true, expectedCore: 43, expectedLedgerGeneric: 3, expectedReceiptSemantic: 16,
  }, { env: caseEnvironment(fakeBin, root), controlFrozen: true });
  const bytes = readFileSync(canonicalOutput);
  const cacheKey = canonicalCacheKey(receiptSha, history.O, history.A);
  const identity = canonicalCacheIdentity(root, receiptSha, history.O, history.A);
  const prior = canonicalReplayCache.get(cacheKey);
  if (prior && (prior.identity !== identity || !prior.bytes.equals(bytes))) {
    policyRed('CANONICAL_REPLAY_CACHE_COLLISION');
  }
  canonicalReplayCache.set(cacheKey, { identity, bytes: Buffer.from(bytes) });
  canonicalReplayEvidence.push({
    cacheKey,
    identity,
    outputPath: output,
    canonicalPath: canonicalOutput,
    canonicalSha256: sha256(bytes),
  });
  return bytes;
}

function acceptanceRecord(root, history, receiptSha, functionalSha, canonicalPath, canonicalBytes, rollbackRecoveryV1 = undefined) {
  const canonical = assertJcsLf(canonicalBytes, 'CONTROL_CANONICAL_INVALID');
  const operation = parseJsonObjectFatal(
    gitFile(root, receiptSha, LEDGER_PATH).subarray(gitFile(root, functionalSha, LEDGER_PATH, Buffer.alloc(0)).length, -1),
    'CONTROL_RECEIPT_INVALID',
  ).operation;
  const record = {
    schema: PUBLICATION_SCHEMA, task: 'ARD-11-E-POSTCOMMIT', operation: 'accept',
    receiptSha, functionalSha, receiptOperation: operation, policyState: deriveFunctionalPolicyState(root, functionalSha),
    receiptBlobSha256: sha256(gitFile(root, receiptSha, LEDGER_PATH)), auditTargetSha: receiptSha,
    producerTranche: 'ARD-11-E-POSTCOMMIT', auditMode: 'receipt-intent', oraclePath: ORACLE_PATH,
    oracleAnchorSha: history.O, oracleSha256: sha256(gitFile(root, history.O, ORACLE_PATH)),
    workflowPath: WORKFLOW_PATH, workflowAnchorSha: history.A,
    workflowSha256: sha256(gitFile(root, history.A, WORKFLOW_PATH)), canonicalPath,
    canonicalRawSha256: sha256(canonicalBytes), counts: {
      core: canonical.counts.core,
      ledgerGeneric: canonical.counts.ledgerGeneric,
      receiptSemantic: canonical.counts.receiptSemantic,
      total: canonical.counts.total,
    },
    bindingVerifierCounts: CONTROL_COUNTS.bindingVerifierCounts,
    bootstrapIntegrityCounts: CONTROL_COUNTS.bootstrapIntegrityCounts,
    preReceiptTransitionCounts: CONTROL_COUNTS.preReceiptTransitionCounts,
    rollbackRecoveryCounts: CONTROL_COUNTS.rollbackRecoveryCounts,
    stateMachineCounts: CONTROL_COUNTS.stateMachineCounts, githubSupplement: null,
  };
  if (rollbackRecoveryV1 !== undefined) record.rollbackRecoveryV1 = rollbackRecoveryV1;
  return record;
}

function indexEntryForRecord(operation, sequence, receiptSha, recordPath, recordBytes, canonicalPath, canonicalBytes) {
  return {
    schema: INDEX_SCHEMA, operation, sequence, receiptSha, recordPath,
    recordSha256: sha256(recordBytes), canonicalPath, canonicalRawSha256: sha256(canonicalBytes),
  };
}

function appendIndexBytes(parentBytes, entry) {
  return Buffer.concat([parentBytes, jcsLf(entry)]);
}

function writeAcceptanceCommit(root, history, receiptSha, functionalSha, canonicalBytes, rollbackRecoveryV1 = undefined, mutate = null) {
  const canonicalPath = `${EVIDENCE_CANONICAL_DIR}/${receiptSha}.json`;
  const recordPath = `${EVIDENCE_RECORDS_DIR}/${receiptSha}.json`;
  const record = acceptanceRecord(root, history, receiptSha, functionalSha, canonicalPath, canonicalBytes, rollbackRecoveryV1);
  const state = { canonicalPath, recordPath, record, canonicalBytes: Buffer.from(canonicalBytes), extraPaths: [] };
  if (mutate) mutate(state);
  const recordBytes = jcsLf(state.record);
  const parentIndex = gitFile(root, receiptSha, EVIDENCE_INDEX_PATH, Buffer.alloc(0));
  const entry = indexEntryForRecord('accept', parentIndex.length === 0 ? 1 : parseIndexBytes(parentIndex).length + 1,
    state.record.receiptSha, state.recordPath, recordBytes, state.canonicalPath, state.canonicalBytes);
  if (state.indexMutate) state.indexMutate(entry);
  writeBytes(join(root, state.recordPath), recordBytes);
  if (!state.omitCanonical) writeBytes(join(root, state.canonicalPath), state.canonicalBytes);
  writeBytes(join(root, EVIDENCE_INDEX_PATH), appendIndexBytes(parentIndex, entry));
  for (const path of state.extraPaths) writeBytes(join(root, path), Buffer.from('forbidden\n'));
  return commitFixture(root, 'control evidence accept', [
    EVIDENCE_INDEX_PATH, state.recordPath, ...(state.omitCanonical ? [] : [state.canonicalPath]), ...state.extraPaths,
  ]);
}

function createControlHistory(sourceRoot, fixtureRoot, fakeBin, scratchRoot) {
  ensureDirectory(fixtureRoot);
  for (const path of [...B_PATHS, ...HISTORICAL.map((record) => record.path)]) copyCandidateEntry(sourceRoot, fixtureRoot, path);
  const legacyBytes = findLegacyDebtBytes(sourceRoot);
  if (!B_PATHS.every((path) => legacyBytes[path])) policyRed('CONTROL_LEGACY_FIXTURE_MISSING');
  writeContentMap(fixtureRoot, legacyBytes);
  writeBytes(join(fixtureRoot, LEDGER_PATH), Buffer.from('{"historical":true}\n'));
  writeContentMap(fixtureRoot, {
    'apps/studio/.npmrc': Buffer.from('ignore-scripts=false\n'),
    '.github/workflows/ci.yml': Buffer.from('name: legacy-ci\n'),
    '.github/workflows/studio-preview-readiness.yml': Buffer.from('name: legacy-preview\n'),
    'bin/monorepo.sh': Buffer.from('#!/usr/bin/env bash\nexit 64\n'),
    'vercel.json': Buffer.from('{}\n'),
  });
  writeBytes(join(fixtureRoot, 'apps/studio/package.json'), Buffer.from('{}\n'));
  writeBytes(join(fixtureRoot, 'apps/studio/package-lock.json'), Buffer.from('{}\n'));
  initializeFixtureRepository(fixtureRoot);
  const history = { root: fixtureRoot, P0: git(fixtureRoot, ['rev-parse', 'HEAD']) };
  copyCandidateEntry(sourceRoot, fixtureRoot, ORACLE_PATH);
  history.O = commitFixture(fixtureRoot, 'control oracle O', [ORACLE_PATH]);
  const safe = safeDebtContents();
  const active = activeEpochContents(history.O, sha256(readBytes(fixtureRoot, ORACLE_PATH)), manifestDigestForContents(safe));
  writeContentMap(fixtureRoot, active);
  history.A = commitFixture(fixtureRoot, 'control workflow A', A_PATHS);
  writeContentMap(fixtureRoot, safe);
  history.F = commitFixture(fixtureRoot, 'control functional F', B_PATHS);
  history.R = appendReceiptCommit(fixtureRoot, history, history.F, 'apply', 'FULL_GREEN_FUNCTIONAL_ONLY');
  history.canonicalBytes = generateCanonicalForReceipt(fixtureRoot, history, history.R, fakeBin, scratchRoot);
  history.E = writeAcceptanceCommit(fixtureRoot, history, history.R, history.F, history.canonicalBytes);
  return history;
}

function runPostcommitAt(root, history, candidateSha) {
  checkoutFixture(root, candidateSha);
  return postcommitBindingCheck(root, postcommitFixtureOptions(history, candidateSha));
}

function expectPostcommitState(root, history, candidateSha, expected, id) {
  const result = runPostcommitAt(root, history, candidateSha);
  if (result.state !== expected) policyRed(`SELF_TEST_CONTROL_STATE_MISMATCH:${id}:${safeToken(result.state)}`);
  return result;
}

function expectPostcommitReason(root, history, candidateSha, expected, id) {
  checkoutFixture(root, candidateSha);
  const reason = capturePolicyReason(() => postcommitBindingCheck(root, postcommitFixtureOptions(history, candidateSha)));
  if (reason !== expected) policyRed(`SELF_TEST_CONTROL_REASON_MISMATCH:${id}:${safeToken(reason ?? 'GREEN')}`);
  return reason;
}

function cloneControlCase(history, tempRoot, id, sha) {
  const root = join(tempRoot, `control-${id}`);
  cloneFixture(history.root, root, sha);
  return { ...history, root };
}

function effectiveRecordSha(root, history) {
  return sha256(gitFile(root, history.E, `${EVIDENCE_RECORDS_DIR}/${history.R}.json`));
}

function writeCorrectionCommit(root, history, operation, options = {}) {
  const parent = git(root, ['rev-parse', 'HEAD']);
  const parentIndex = gitFile(root, parent, EVIDENCE_INDEX_PATH);
  const sequence = parseIndexBytes(parentIndex).length + 1;
  const canonicalPath = `${EVIDENCE_CANONICAL_DIR}/${history.R}.correction.${sequence}.json`;
  const recordPath = `${EVIDENCE_RECORDS_DIR}/${history.R}.correction.${sequence}.json`;
  const canonicalBytes = Buffer.from(history.canonicalBytes);
  const record = acceptanceRecord(root, history, history.R, history.F, canonicalPath, canonicalBytes);
  record.operation = operation;
  record.sequence = sequence;
  record.supersedesRecordSha256 = options.supersedesRecordSha256 ?? effectiveRecordSha(root, history);
  if (operation === 'replacement') record.replacesRevocationSha256 = options.replacesRevocationSha256;
  if (options.mutateRecord) options.mutateRecord(record);
  const recordBytes = jcsLf(record);
  const entry = indexEntryForRecord(operation, sequence, history.R, recordPath, recordBytes, canonicalPath, canonicalBytes);
  if (options.mutateIndex) options.mutateIndex(entry);
  const indexBytes = options.rewriteIndexPrefix
    ? Buffer.concat([Buffer.from('{"rewritten":true}\n'), jcsLf(entry)])
    : appendIndexBytes(parentIndex, entry);
  writeBytes(join(root, EVIDENCE_INDEX_PATH), indexBytes);
  writeBytes(join(root, recordPath), recordBytes);
  writeBytes(join(root, canonicalPath), canonicalBytes);
  const extraPaths = options.extraPaths ?? [];
  for (const path of extraPaths) writeBytes(join(root, path), Buffer.from('extra\n'));
  return commitFixture(root, `control ${operation}`, [EVIDENCE_INDEX_PATH, recordPath, canonicalPath, ...extraPaths]);
}

function writeRevocationCommit(root, history, reasonCode, options = {}) {
  const parent = git(root, ['rev-parse', 'HEAD']);
  const parentIndex = gitFile(root, parent, EVIDENCE_INDEX_PATH);
  const sequence = parseIndexBytes(parentIndex).length + 1;
  const revocationPath = `${EVIDENCE_REVOCATIONS_DIR}/${history.R}.revocation.${sequence}.json`;
  const record = {
    schema: 'studio-install-policy-publication-revocation/v1', operation: 'revocation',
    receiptSha: history.R, sequence, revokesRecordSha256: options.revokesRecordSha256 ?? effectiveRecordSha(root, history),
    status: 'REVOKED', reasonCode,
  };
  if (reasonCode === 'B_ROLLBACK') {
    record.lineageReceiptSha = history.R;
    record.revokedFunctionalSha = history.F;
    record.rollbackTargetSha = gitParents(root, history.F)[0];
  }
  if (options.mutateRecord) options.mutateRecord(record);
  const bytes = jcsLf(record);
  const entry = {
    schema: INDEX_SCHEMA, operation: 'revocation', sequence, receiptSha: history.R,
    revocationPath, revocationSha256: sha256(bytes),
  };
  if (options.mutateIndex) options.mutateIndex(entry);
  if (!options.omitIndex) writeBytes(join(root, EVIDENCE_INDEX_PATH), appendIndexBytes(parentIndex, entry));
  if (!options.omitRecord) writeBytes(join(root, revocationPath), bytes);
  const extraPaths = options.extraPaths ?? [];
  for (const path of extraPaths) writeBytes(join(root, path), Buffer.from('extra\n'));
  const paths = [...(options.omitIndex ? [] : [EVIDENCE_INDEX_PATH]), ...(options.omitRecord ? [] : [revocationPath]), ...extraPaths];
  const sha = commitFixture(root, `control revocation ${reasonCode}`, paths);
  return { sha, path: revocationPath, bytes, record };
}

function writeUnrelatedCommit(root, id, contents = 'unrelated\n') {
  const path = `control-fixtures/${id}.txt`;
  writeBytes(join(root, path), Buffer.from(contents));
  return commitFixture(root, `control unrelated ${id}`, [path]);
}

function writeRollbackFunctional(root, history, paths = B_PATHS, extraPaths = []) {
  for (const path of paths) writeBytes(join(root, path), gitFile(root, history.A, path));
  for (const path of extraPaths) writeBytes(join(root, path), Buffer.from('rollback extra\n'));
  return commitFixture(root, 'control rollback functional', [...paths, ...extraPaths]);
}

function buildRollbackChain(root, history, fakeBin, scratchRoot, options = {}) {
  checkoutFixture(root, history.E);
  const revocation = writeRevocationCommit(root, history, 'B_ROLLBACK');
  const functionalRollbackSha = writeRollbackFunctional(root, history);
  const receiptRollbackSha = appendReceiptCommit(
    root,
    history,
    functionalRollbackSha,
    'rollback_applied',
    options.wrongPolicyState ? 'FULL_GREEN_FUNCTIONAL_ONLY' : 'ACTIVE_GREEN_D0P_B_PENDING',
  );
  if (options.stopAtReceipt) return { revocation, functionalRollbackSha, receiptRollbackSha };
  const canonicalBytes = generateCanonicalForReceipt(root, history, receiptRollbackSha, fakeBin, scratchRoot);
  const rollbackRecovery = {
    lineageReceiptSha: history.R,
    revokedFunctionalSha: history.F,
    rollbackTargetSha: history.A,
    revocationCommitSha: revocation.sha,
    rollbackFunctionalSha: functionalRollbackSha,
    rollbackReceiptSha: receiptRollbackSha,
    revocationRecordPath: revocation.path,
    revocationRecordSha256: sha256(revocation.bytes),
    revocationParentSha: history.E,
    rollbackFunctionalParentSha: revocation.sha,
    rollbackReceiptParentSha: functionalRollbackSha,
    evidenceParentSha: receiptRollbackSha,
  };
  const evidenceRollbackSha = writeAcceptanceCommit(
    root, history, receiptRollbackSha, functionalRollbackSha, canonicalBytes, rollbackRecovery,
  );
  return { revocation, functionalRollbackSha, receiptRollbackSha, evidenceRollbackSha, canonicalBytes };
}

function runControlPlaneGitCases(sourceRoot) {
  const tempRoot = checkedTempRoot('ardesia-policy-control-');
  controlPlaneDepth += 1;
  try {
    const fakeBin = createFakeTools(tempRoot);
    const history = createControlHistory(sourceRoot, join(tempRoot, 'control-base'), fakeBin, tempRoot);

    {
      const fixture = cloneControlCase(history, tempRoot, 'INTENT-GIT-ACCEPTED', history.E);
      writeUnrelatedCommit(fixture.root, 'intent-accepted-U');
      const parent = git(fixture.root, ['rev-parse', 'HEAD']);
      const parentLog = gitFile(fixture.root, parent, LEDGER_PATH, Buffer.alloc(0));
      writeBytes(join(fixture.root, LEDGER_PATH), Buffer.concat([
        parentLog,
        Buffer.from('{"task":"HARNESS-UNRELATED-LEDGER-CONTROL"}\n'),
      ]));
      const candidate = commitFixture(fixture.root, 'intent accepted unrelated ledger', [LEDGER_PATH]);
      const intent = detectReceiptIntentV1(fixture.root, candidate, postcommitFixtureOptions(fixture, candidate));
      if (intent.detected || intent.newArd11LastLine || intent.ledgerAfterFunctionalB
        || intent.newPendingBindingState || intent.nearestAcceptedEvidenceSha !== history.E
        || intent.ledger.status !== 'GREEN') {
        policyRed('SELF_TEST_RECEIPT_ACCEPTED_WINDOW_RESOLUTION_FAILED');
      }
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'INTENT-GIT-OPEN', history.F);
      writeUnrelatedCommit(fixture.root, 'intent-open-I');
      const parent = git(fixture.root, ['rev-parse', 'HEAD']);
      const parentLog = gitFile(fixture.root, parent, LEDGER_PATH, Buffer.alloc(0));
      writeBytes(join(fixture.root, LEDGER_PATH), Buffer.concat([parentLog, Buffer.from([0x20, 0x09, 0x20, 0x0a])]));
      const candidate = commitFixture(fixture.root, 'intent open whitespace receipt', [LEDGER_PATH]);
      const intent = detectReceiptIntentV1(fixture.root, candidate, postcommitFixtureOptions(fixture, candidate));
      if (!intent.detected || !intent.ledgerAfterFunctionalB || intent.nearestFunctionalSha !== history.F
        || intent.newArd11LastLine || intent.newPendingBindingState) {
        policyRed('SELF_TEST_RECEIPT_CAUSAL_WINDOW_FAILED');
      }
    }

    for (const [id, sha] of [['V-P01', history.F], ['V-P02', history.F], ['V-P03', history.F]]) {
      const fixture = cloneControlCase(history, tempRoot, id, sha);
      expectPostcommitState(fixture.root, fixture, sha, 'FUNCTIONAL_GREEN_F_RECEIPT_PENDING', id);
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'V01', history.A);
      writeContentMap(fixture.root, safeDebtContents());
      writeBytes(join(fixture.root, ORACLE_PATH), Buffer.concat([gitFile(fixture.root, history.O, ORACLE_PATH), Buffer.from('\n// mutant\n')]));
      const candidate = commitFixture(fixture.root, 'V01 verifier drift', [...B_PATHS, ORACLE_PATH]);
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_VERIFIER_DRIFT_FROM_A', 'V01');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'V02', history.O);
      const active = activeEpochContents(history.O, '0'.repeat(64), manifestDigestForContents(safeDebtContents()));
      writeContentMap(fixture.root, active);
      fixture.A = commitFixture(fixture.root, 'V02 bad expected digest A', A_PATHS);
      writeContentMap(fixture.root, safeDebtContents());
      const candidate = commitFixture(fixture.root, 'V02 F', B_PATHS);
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_EXPECTED_DIGEST_DRIFT_FROM_A', 'V02');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'V03', history.A);
      writeContentMap(fixture.root, safeDebtContents());
      writeBytes(join(fixture.root, WORKFLOW_PATH), Buffer.concat([gitFile(fixture.root, history.A, WORKFLOW_PATH), Buffer.from('# drift\n')]));
      const candidate = commitFixture(fixture.root, 'V03 workflow drift F', [...B_PATHS, WORKFLOW_PATH]);
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_WORKFLOW_DRIFT_FROM_A', 'V03');
    }

    for (const [id, sha, expected] of [
      ['T-P-O', history.O, 'ORACLE_FROZEN_O'], ['T-P-A', history.A, 'ACTIVE_GREEN_D0P_B_PENDING'],
      ['T-P-F', history.F, 'FUNCTIONAL_GREEN_F_RECEIPT_PENDING'], ['T-P-R', history.R, 'POSTCOMMIT_BINDING_PENDING'],
      ['T-P-E', history.E, 'ACCEPTED_E'],
    ]) {
      const fixture = cloneControlCase(history, tempRoot, id, sha);
      expectPostcommitState(fixture.root, fixture, sha, expected, id);
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'T01', history.A);
      writeBytes(join(fixture.root, 'apps/studio/package-lock.json'), Buffer.from('{"d0":1}\n'));
      writeBytes(join(fixture.root, 'apps/studio/package.json'), Buffer.from('{"d0":1}\n'));
      const d0 = commitFixture(fixture.root, 'T01 D0', ['apps/studio/package-lock.json', 'apps/studio/package.json']);
      expectPostcommitReason(fixture.root, fixture, d0, 'POLICY_RED:PRE_RECEIPT_EXPECTED_F_AFTER_A:apps/studio/package-lock.json', 'T01');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'T02', history.A);
      const originalLock = gitFile(fixture.root, history.A, 'apps/studio/package-lock.json');
      const originalPackage = gitFile(fixture.root, history.A, 'apps/studio/package.json');
      writeBytes(join(fixture.root, 'apps/studio/package-lock.json'), Buffer.from('{"d0":2}\n'));
      writeBytes(join(fixture.root, 'apps/studio/package.json'), Buffer.from('{"d0":2}\n'));
      const d0 = commitFixture(fixture.root, 'T02 D0', ['apps/studio/package-lock.json', 'apps/studio/package.json']);
      writeBytes(join(fixture.root, 'apps/studio/package-lock.json'), originalLock);
      writeBytes(join(fixture.root, 'apps/studio/package.json'), originalPackage);
      commitFixture(fixture.root, 'T02 revert D0', ['apps/studio/package-lock.json', 'apps/studio/package.json']);
      writeContentMap(fixture.root, safeDebtContents());
      const candidate = commitFixture(fixture.root, 'T02 candidate F', B_PATHS);
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:PRE_RECEIPT_INTERMEDIATE_COMMIT:A_F:${d0}`, 'T02');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'T03', history.O);
      writeBytes(join(fixture.root, 'control-fixtures/intermediate.txt'), Buffer.from('I\n'));
      const intermediate = commitFixture(fixture.root, 'T03 I', ['control-fixtures/intermediate.txt']);
      const active = Object.fromEntries(A_PATHS.map((path) => [path, gitFile(fixture.root, history.A, path)]));
      writeContentMap(fixture.root, active);
      fixture.A = commitFixture(fixture.root, 'T03 A candidate', A_PATHS);
      expectPostcommitReason(fixture.root, fixture, fixture.A, `POLICY_RED:PRE_RECEIPT_INTERMEDIATE_COMMIT:O_A:${intermediate}`, 'T03');
    }

    for (let index = 1; index <= 7; index += 1) {
      const id = `E-P0${index}`;
      const fixture = cloneControlCase(history, tempRoot, id, history.E);
      expectPostcommitState(fixture.root, fixture, history.E, 'ACCEPTED_E', id);
    }
    const recreateEvidence = (id, mutate) => {
      const fixture = cloneControlCase(history, tempRoot, id, history.R);
      const candidate = writeAcceptanceCommit(fixture.root, fixture, history.R, history.F, history.canonicalBytes, undefined, mutate);
      return { fixture, candidate };
    };
    {
      const { fixture, candidate } = recreateEvidence('E01', (state) => { state.record.selfHash = 'f'.repeat(64); });
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_SELF_ATTESTATION_FORBIDDEN:selfHash', 'E01');
    }
    {
      const wrong = 'b'.repeat(64);
      const { fixture, candidate } = recreateEvidence('E02', (state) => {
        state.record.canonicalRawSha256 = wrong;
        state.indexMutate = (entry) => { entry.canonicalRawSha256 = wrong; };
      });
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_CANONICAL_HASH_MISMATCH', 'E02');
    }
    {
      const { fixture, candidate } = recreateEvidence('E03', (state) => { state.record.receiptSha = history.F; });
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_RECEIPT_SHA_MISMATCH', 'E03');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'E04', history.R);
      const tree = git(fixture.root, ['rev-parse', `${history.P0}^{tree}`]);
      const declared = git(fixture.root, ['commit-tree', tree, '-m', 'E04 nonancestor'], { env: fixedGitEnvironment() });
      const candidate = writeAcceptanceCommit(fixture.root, fixture, history.R, history.F, history.canonicalBytes, undefined,
        (state) => { state.record.receiptSha = declared; });
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_RECEIPT_NOT_ANCESTOR', 'E04');
    }
    {
      const extra = 'apps/studio/src/e-postcommit-forbidden.ts';
      const { fixture, candidate } = recreateEvidence('E05', (state) => { state.extraPaths.push(extra); });
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_SCOPE_FORBIDDEN:${extra}`, 'E05');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'E06', history.E);
      const recordPath = `${EVIDENCE_RECORDS_DIR}/${history.R}.json`;
      writeBytes(join(fixture.root, recordPath), Buffer.concat([gitFile(fixture.root, history.E, recordPath), Buffer.from(' ')]));
      const candidate = commitFixture(fixture.root, 'E06 rewrite record', [recordPath]);
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_HISTORY_REWRITE:${recordPath}#${history.R}`, 'E06');
    }
    {
      const canonicalPath = `${EVIDENCE_CANONICAL_DIR}/${history.R}.json`;
      const { fixture, candidate } = recreateEvidence('E07', (state) => { state.omitCanonical = true; });
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_CANONICAL_EVIDENCE_MISSING:${canonicalPath}`, 'E07');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'E08', history.E);
      const result = expectPostcommitState(fixture.root, fixture, history.E, 'ACCEPTED_E', 'E08');
      if (result.publicationBindingV1 !== 'COMPLETE') policyRed('SELF_TEST_BINDING_ROBUSTNESS_FAILED:E08');
    }

    {
      const fixture = cloneControlCase(history, tempRoot, 'SM01', history.R);
      expectPostcommitState(fixture.root, fixture, history.R, 'POSTCOMMIT_BINDING_PENDING', 'SM01');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM02', history.E);
      expectPostcommitState(fixture.root, fixture, history.E, 'ACCEPTED_E', 'SM02');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM03', history.E);
      const candidate = writeUnrelatedCommit(fixture.root, 'SM03');
      expectPostcommitState(fixture.root, fixture, candidate, 'ACCEPTED_E_DESCENDANT', 'SM03');
    }
    let correctionSha;
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM04', history.E);
      correctionSha = writeCorrectionCommit(fixture.root, fixture, 'correction');
      expectPostcommitState(fixture.root, fixture, correctionSha, 'E_CORRECTION', 'SM04');
    }
    let revocationForReuse;
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM05', history.E);
      revocationForReuse = writeRevocationCommit(fixture.root, fixture, 'MANUAL');
      expectPostcommitState(fixture.root, fixture, revocationForReuse.sha, 'E_REVOCATION', 'SM05');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM06', history.E);
      const revocation = writeRevocationCommit(fixture.root, fixture, 'MANUAL');
      const replacement = writeCorrectionCommit(fixture.root, fixture, 'replacement', {
        replacesRevocationSha256: sha256(revocation.bytes),
      });
      expectPostcommitState(fixture.root, fixture, replacement, 'E_CORRECTION', 'SM06');
    }
    let rollbackValid;
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM07', history.E);
      rollbackValid = buildRollbackChain(fixture.root, fixture, fakeBin, tempRoot);
      expectPostcommitState(fixture.root, fixture, rollbackValid.evidenceRollbackSha, 'ACCEPTED_E', 'SM07');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM08', history.E);
      const path = `${EVIDENCE_RECORDS_DIR}/${history.R}.json`;
      writeBytes(join(fixture.root, path), Buffer.concat([gitFile(fixture.root, history.E, path), Buffer.from(' ')]));
      const candidate = commitFixture(fixture.root, 'SM08 history rewrite', [path]);
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_HISTORY_REWRITE:${path}#${history.R}`, 'SM08');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM09', history.E);
      const candidate = writeCorrectionCommit(fixture.root, fixture, 'correction', { supersedesRecordSha256: 'c'.repeat(64) });
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_CORRECTION_SUPERSEDES_MISMATCH', 'SM09');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM10', history.E);
      const extra = 'apps/studio/src/extra.ts';
      const candidate = writeCorrectionCommit(fixture.root, fixture, 'correction', { extraPaths: [extra] });
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_SCOPE_FORBIDDEN:${extra}`, 'SM10');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM11', history.E);
      const extra = `${EVIDENCE_REVOCATIONS_DIR}/extra.json`;
      const revocation = writeRevocationCommit(fixture.root, fixture, 'MANUAL', { extraPaths: [extra] });
      expectPostcommitReason(fixture.root, fixture, revocation.sha, `POLICY_RED:E_REVOCATION_SCOPE_INVALID:${extra}`, 'SM11');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM12', history.E);
      writeRevocationCommit(fixture.root, fixture, 'MANUAL');
      const candidate = writeUnrelatedCommit(fixture.root, 'SM12');
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_BINDING_REVOKED:${history.R}`, 'SM12');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM13', history.R);
      const candidate = writeUnrelatedCommit(fixture.root, 'SM13');
      expectPostcommitReason(fixture.root, fixture, candidate, 'POLICY_RED:E_BINDING_REQUIRED_BEFORE_NEXT_TRANCHE', 'SM13');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'SM14', history.E);
      const candidate = writeCorrectionCommit(fixture.root, fixture, 'correction', { rewriteIndexPrefix: true });
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_HISTORY_REWRITE:${EVIDENCE_INDEX_PATH}#${history.R}`, 'SM14');
    }

    {
      const fixture = cloneControlCase(history, tempRoot, 'RB01', history.E);
      const candidate = writeRollbackFunctional(fixture.root, fixture);
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_ROLLBACK_REVOCATION_REQUIRED:${history.R}`, 'RB01');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'RB02', history.E);
      const chain = buildRollbackChain(fixture.root, fixture, fakeBin, tempRoot);
      expectPostcommitState(fixture.root, fixture, chain.evidenceRollbackSha, 'ACCEPTED_E', 'RB02');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'RB03', history.E);
      writeRevocationCommit(fixture.root, fixture, 'B_ROLLBACK');
      const candidate = writeUnrelatedCommit(fixture.root, 'RB03');
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_BINDING_REVOKED:${history.R}`, 'RB03');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'RB04', history.E);
      const extra = 'apps/studio/src/rollback-extra.ts';
      const candidate = writeRollbackFunctional(fixture.root, fixture, B_PATHS, [extra]);
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_ROLLBACK_REVOCATION_REQUIRED:${history.R}`, 'RB04');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'RB05', history.E);
      const candidate = writeRollbackFunctional(fixture.root, fixture, ['apps/studio/AGENTS.md']);
      expectPostcommitReason(fixture.root, fixture, candidate, `POLICY_RED:E_ROLLBACK_REVOCATION_REQUIRED:${history.R}`, 'RB05');
    }
    {
      const fixture = cloneControlCase(history, tempRoot, 'RB06', history.E);
      const chain = buildRollbackChain(fixture.root, fixture, fakeBin, tempRoot, { wrongPolicyState: true, stopAtReceipt: true });
      expectPostcommitReason(
        fixture.root, fixture, chain.receiptRollbackSha,
        'POLICY_RED:RECEIPT_OPERATION_POLICY_STATE_MISMATCH:rollback_applied:FULL_GREEN_FUNCTIONAL_ONLY', 'RB06',
      );
    }
    return CONTROL_COUNTS;
  } finally {
    controlPlaneDepth -= 1;
    removeCheckedTemp(tempRoot, 'ardesia-policy-control-');
  }
}

function findLegacyDebtBytes(root) {
  const found = {};
  const commits = git(root, ['rev-list', '--first-parent', 'HEAD']).split('\n').filter(Boolean);
  for (const path of B_PATHS) {
    const current = readBytes(root, path);
    if (sha256(current) === LEGACY_DEBT[path]) {
      found[path] = current;
      continue;
    }
    for (const commit of commits) {
      const candidate = gitFile(root, commit, path, Buffer.alloc(0));
      if (sha256(candidate) === LEGACY_DEBT[path]) {
        found[path] = candidate;
        break;
      }
    }
  }
  return found;
}

function validateRuntimeIdentity(root, options) {
  const head = git(root, ['rev-parse', 'HEAD']);
  const candidateEnv = process.env.POLICY_CANDIDATE_SHA ?? '';
  const eventEnv = process.env.POLICY_EVENT_SHA ?? '';
  const mergeEnv = process.env.POLICY_PR_MERGE_SHA ?? '';
  for (const [name, value] of [['CANDIDATE', candidateEnv], ['EVENT', eventEnv], ['PR_MERGE', mergeEnv]]) {
    if (value !== '' && !SHA_RE.test(value)) policyRed(`${name}_SHA_INVALID`);
  }
  const candidate = options.candidateSha ?? (candidateEnv || head);
  if (!SHA_RE.test(candidate)) policyRed('CANDIDATE_SHA_INVALID');
  if (candidate !== head) policyRed('CANDIDATE_SHA_MISMATCH');
  if (candidateEnv && candidateEnv !== candidate) policyRed('CANDIDATE_SHA_MISMATCH');
  return {
    head,
    candidateSha: candidate,
    eventSha: eventEnv || null,
    prMergeSha: mergeEnv || null,
    headAsserted: true,
  };
}

function validateOptionalAnchors(root, options, identity) {
  let oracleSha256 = sha256(readBytes(root, ORACLE_PATH));
  let workflowBlob = null;
  let workflowSha256 = existsSync(join(root, WORKFLOW_PATH)) ? sha256(readBytes(root, WORKFLOW_PATH)) : null;
  if (options.oracleAnchorSha !== undefined) {
    if (!SHA_RE.test(options.oracleAnchorSha)) policyRed('ORACLE_ANCHOR_SHA_INVALID');
    const oracleAtAnchor = gitFile(root, options.oracleAnchorSha, ORACLE_PATH);
    oracleSha256 = sha256(oracleAtAnchor);
    if (!oracleAtAnchor.equals(readBytes(root, ORACLE_PATH))) policyRed('E_VERIFIER_DRIFT_FROM_A');
    const ancestor = runFile('git', ['-C', root, 'merge-base', '--is-ancestor', options.oracleAnchorSha, identity.candidateSha]);
    if (ancestor.status !== 0) policyRed('ORACLE_ANCHOR_NOT_ANCESTOR');
  }
  if (options.workflowAnchorSha !== undefined) {
    if (!SHA_RE.test(options.workflowAnchorSha)) policyRed('WORKFLOW_ANCHOR_SHA_INVALID');
    const ancestor = runFile('git', ['-C', root, 'merge-base', '--is-ancestor', options.workflowAnchorSha, identity.candidateSha]);
    if (ancestor.status !== 0) policyRed('WORKFLOW_ANCHOR_NOT_ANCESTOR');
    const workflowAtAnchor = gitFile(root, options.workflowAnchorSha, WORKFLOW_PATH);
    const workflowCurrent = readBytes(root, WORKFLOW_PATH);
    if (!workflowAtAnchor.equals(workflowCurrent)) policyRed('E_WORKFLOW_DRIFT_FROM_A');
    workflowBlob = gitBlob(root, options.workflowAnchorSha, WORKFLOW_PATH);
    workflowSha256 = sha256(workflowAtAnchor);
  }
  return { oracleSha256, workflowBlob, workflowSha256 };
}

function platformEvidence() {
  const npm = runFile('npm', ['--version']);
  const bash = runFile('bash', ['--version']);
  const uname = runFile('uname', ['-a']);
  return {
    runnerOs: process.env.RUNNER_OS ?? platform(),
    runnerArch: process.env.RUNNER_ARCH ?? arch(),
    uname: uname.status === 0 ? String(uname.stdout).trim().split('\n')[0] : 'unavailable',
    node: process.version,
    npm: npm.status === 0 ? String(npm.stdout).trim() : 'unavailable',
    bash: bash.status === 0 ? String(bash.stdout).trim().split('\n')[0] : 'unavailable',
  };
}

function inventoryTsv(rows) {
  return rows.map((row) => [
    JSON.stringify(row.path),
    row.line,
    row.className,
    JSON.stringify(row.normalizedCommand),
    row.sha256,
    row.disposition,
  ].join('\t')).join('\n') + '\n';
}

function walkFiles(root, current = root) {
  const result = [];
  for (const name of bytewise(readdirSync(current))) {
    const absolute = join(current, name);
    const entry = lstatSync(absolute);
    if (entry.isDirectory()) result.push(...walkFiles(root, absolute));
    else if (entry.isFile()) result.push(relative(root, absolute).split(sep).join('/'));
  }
  return result;
}

function writeSha256Sums(outputRoot) {
  const files = walkFiles(outputRoot).filter((path) => path !== 'sha256sums.txt');
  const body = bytewise(files).map((path) => `${sha256(readFileSync(join(outputRoot, path)))}  ${path}`).join('\n') + '\n';
  writeBytes(join(outputRoot, 'sha256sums.txt'), Buffer.from(body, 'utf8'));
  return sha256(Buffer.from(body, 'utf8'));
}

function makeCanonicalAudit(context) {
  const allCases = [
    ...context.coreCases.map((entry) => ({ id: entry.id, result: 'RED_EXPECTED', reason: entry.reason })),
    ...context.ledgerCases.map((entry) => ({ id: entry.id, result: 'RED_EXPECTED', reason: entry.reason })),
    ...context.receiptCases.map((entry) => ({ id: entry.id, result: 'RED_EXPECTED', reason: entry.reason })),
  ].sort((left, right) => Buffer.compare(Buffer.from(left.id), Buffer.from(right.id)));
  return {
    schema: 'studio-install-policy-canonical-audit/v1',
    oracleSchema: ORACLE_SCHEMA,
    harnessSchema: HARNESS_SCHEMA,
    task: PENDING_TASK,
    auditMode: context.auditMode,
    auditTargetSha: context.identity.candidateSha,
    testedImplementationSha: context.functionalSha,
    producerTranche: context.producerTranche,
    candidateTree: context.seed.seedTree,
    oraclePath: ORACLE_PATH,
    oracleAnchorSha: context.oracleAnchorSha,
    oracleSha256: context.anchors.oracleSha256,
    workflowPath: WORKFLOW_PATH,
    workflowAnchorSha: context.workflowAnchorSha,
    workflowSha256: context.anchors.workflowSha256,
    historicalNonOperational: HISTORICAL.map((record) => ({
      id: record.id,
      path: record.path,
      sha256: record.sha256,
      class: record.className,
    })),
    cases: allCases,
    counts: {
      core: context.coreCases.length,
      ledgerGeneric: context.ledgerCases.length,
      receiptSemantic: context.receiptCases.length,
      total: allCases.length,
      positiveBaselines: allCases.length,
      exactReasonMatches: allCases.length,
    },
    bootstrapIntegrityCounts: context.control.bootstrapIntegrityCounts,
    preReceiptTransitionCounts: context.control.preReceiptTransitionCounts,
    bindingVerifierCounts: context.control.bindingVerifierCounts,
    stateMachineCounts: context.control.stateMachineCounts,
    rollbackRecoveryCounts: context.control.rollbackRecoveryCounts,
    npmMaterializerStarted: 0,
    uvSyncStarted: 0,
  };
}

function containsReceiptSignal(bytes) {
  return bytes.includes(Buffer.from(PENDING_TASK, 'utf8'))
    || bytes.includes(Buffer.from('POSTCOMMIT_BINDING_PENDING', 'utf8'));
}

function nearestFunctionalCommit(root, candidateSha) {
  const commits = git(root, ['rev-list', '--first-parent', candidateSha]).split('\n').filter(Boolean);
  for (const commit of commits) {
    const parents = gitParents(root, commit);
    if (parents.length !== 1) continue;
    const scope = changedPaths(root, parents[0], commit);
    if (B_PATHS.every((path) => scope.includes(path))) return commit;
  }
  return null;
}

function verifyAcceptedEvidenceCandidate(root, parent, candidate, options) {
  const scope = changedPaths(root, parent, candidate);
  if (!scope.includes(options.indexPath ?? EVIDENCE_INDEX_PATH)) return null;
  const indexPath = options.indexPath ?? EVIDENCE_INDEX_PATH;
  const parentIndex = gitFile(root, parent, indexPath, Buffer.alloc(0));
  const candidateIndex = gitFile(root, candidate, indexPath, Buffer.alloc(0));
  const entry = validateIndexEntryShape(validateIndexAppend(parentIndex, candidateIndex));
  const expectedSequence = parentIndex.length === 0 ? 1 : parseIndexBytes(parentIndex).length + 1;
  if (entry.sequence !== expectedSequence) policyRed('E_INDEX_SEQUENCE_INVALID');
  if (entry.operation === 'revocation') {
    const revocationsDir = options.revocationsDir ?? EVIDENCE_REVOCATIONS_DIR;
    const revocationPath = `${revocationsDir}/${entry.receiptSha}.revocation.${entry.sequence}.json`;
    assertScope(scope, [indexPath, revocationPath], 'E_REVOCATION_SCOPE_INVALID');
    if (entry.revocationPath !== revocationPath) policyRed('E_REVOCATION_RECORD_INVALID');
    const revocationBytes = gitFile(root, candidate, revocationPath);
    if (entry.revocationSha256 !== sha256(revocationBytes)) policyRed('E_REVOCATION_RECORD_INVALID');
    const revocation = assertJcsLf(revocationBytes, 'E_REVOCATION_RECORD_INVALID');
    validateRevocationRecordShape(revocation);
    if (revocation.receiptSha !== entry.receiptSha || revocation.sequence !== entry.sequence) {
      policyRed('E_REVOCATION_RECORD_INVALID');
    }
    return { operation: 'revocation', accepted: false, entry, receiptSha: entry.receiptSha };
  }
  const recordsDir = options.recordsDir ?? EVIDENCE_RECORDS_DIR;
  const canonicalDir = options.canonicalDir ?? EVIDENCE_CANONICAL_DIR;
  const recordPath = entry.recordPath;
  const canonicalPath = entry.canonicalPath;
  const expectedRecordPath = entry.operation === 'accept'
    ? `${recordsDir}/${entry.receiptSha}.json`
    : `${recordsDir}/${entry.receiptSha}.correction.${entry.sequence}.json`;
  const expectedCanonicalPath = entry.operation === 'accept'
    ? `${canonicalDir}/${entry.receiptSha}.json`
    : `${canonicalDir}/${entry.receiptSha}.correction.${entry.sequence}.json`;
  assertScope(scope, [indexPath, expectedRecordPath, expectedCanonicalPath], 'E_SCOPE_FORBIDDEN');
  if (recordPath !== expectedRecordPath || canonicalPath !== expectedCanonicalPath) policyRed('E_INDEX_SCHEMA_INVALID');
  const recordBytes = gitFile(root, candidate, recordPath);
  const canonicalBytes = gitFile(root, candidate, canonicalPath);
  if (sha256(recordBytes) !== entry.recordSha256 || sha256(canonicalBytes) !== entry.canonicalRawSha256) {
    policyRed('E_CANONICAL_HASH_MISMATCH');
  }
  const record = assertJcsLf(recordBytes, 'E_RECORD_SCHEMA_INVALID');
  const canonical = assertJcsLf(canonicalBytes, 'E_CANONICAL_SCHEMA_INVALID');
  const forbidden = forbiddenSelfField(record) ?? forbiddenSelfField(entry);
  if (forbidden) policyRed(`E_SELF_ATTESTATION_FORBIDDEN:${forbidden}`);
  validatePublicationRecordShape(record, entry.operation);
  const functionalSha = gitParents(root, entry.receiptSha)[0];
  if (!functionalSha) policyRed('RECEIPT_FUNCTIONAL_COMMIT_NOT_FOUND');
  const epoch = {
    oracleSha256: sha256(gitFile(root, options.oracleAnchorSha, ORACLE_PATH)),
    workflowSha256: sha256(gitFile(root, options.workflowAnchorSha, WORKFLOW_PATH)),
  };
  const provenance = {
    oracleAnchorSha: options.oracleAnchorSha,
    oracleSha256: epoch.oracleSha256,
    workflowAnchorSha: options.workflowAnchorSha,
    workflowSha256: epoch.workflowSha256,
  };
  const receipt = validateReceiptCommit(
    root, functionalSha, entry.receiptSha, deriveFunctionalPolicyState(root, functionalSha), null, provenance,
  );
  validateCanonicalAuditShape(canonical, {
    receiptSha: entry.receiptSha, functionalSha, epoch, options,
  });
  validateRecordCounts(record);
  validateRecordCounts(canonical, true);
  if (record.receiptSha !== entry.receiptSha || record.functionalSha !== functionalSha
    || record.receiptOperation !== receipt.payload.operation
    || record.policyState !== deriveFunctionalPolicyState(root, functionalSha)
    || record.receiptBlobSha256 !== sha256(gitFile(root, entry.receiptSha, LEDGER_PATH))
    || record.auditTargetSha !== entry.receiptSha || record.producerTranche !== 'ARD-11-E-POSTCOMMIT'
    || record.auditMode !== 'receipt-intent' || record.oraclePath !== ORACLE_PATH
    || record.oracleAnchorSha !== provenance.oracleAnchorSha || record.oracleSha256 !== provenance.oracleSha256
    || record.workflowPath !== WORKFLOW_PATH || record.workflowAnchorSha !== provenance.workflowAnchorSha
    || record.workflowSha256 !== provenance.workflowSha256
    || record.canonicalPath !== canonicalPath || record.canonicalRawSha256 !== sha256(canonicalBytes)
    || canonical.auditTargetSha !== entry.receiptSha || canonical.testedImplementationSha !== functionalSha) {
    policyRed('E_PROVENANCE_MISMATCH');
  }
  return { operation: entry.operation, accepted: true, entry, receiptSha: entry.receiptSha };
}

function nearestAcceptedEvidenceCommit(root, candidateSha, options) {
  const commits = git(root, ['rev-list', '--first-parent', candidateSha]).split('\n').filter(Boolean);
  let revoked = false;
  for (const commit of commits) {
    if (commit === options.workflowAnchorSha) break;
    const parents = gitParents(root, commit);
    if (parents.length !== 1) continue;
    const scope = changedPaths(root, parents[0], commit);
    if (!scope.includes(options.indexPath ?? EVIDENCE_INDEX_PATH)) continue;
    const evidence = verifyAcceptedEvidenceCandidate(root, parents[0], commit, options);
    if (evidence?.operation === 'revocation') {
      revoked = true;
      continue;
    }
    if (evidence?.accepted) return { sha: commit, effective: !revoked, receiptSha: evidence.receiptSha };
  }
  return null;
}

function containsNewPendingReceipt(bytes) {
  if (bytes.length === 0) return false;
  const frames = bytes.toString('binary').split('\n');
  return frames.some((frame) => {
    const raw = Buffer.from(frame, 'binary');
    return raw.includes(Buffer.from(PENDING_TASK, 'utf8'))
      && raw.includes(Buffer.from('POSTCOMMIT_BINDING_PENDING', 'utf8'));
  });
}

function receiptDeltaSinceAnchor(anchorBytes, candidateBytes) {
  const tokensFor = (bytes) => {
    const tokens = [];
    const occurrences = new Map();
    let offset = 0;
    while (offset < bytes.length) {
      const newline = bytes.indexOf(0x0a, offset);
      const end = newline < 0 ? bytes.length : newline + 1;
      const frame = bytes.subarray(offset, end);
      const digest = sha256(frame);
      const ordinal = (occurrences.get(digest) ?? 0) + 1;
      occurrences.set(digest, ordinal);
      tokens.push({ key: `${digest}:${ordinal}`, frame: Buffer.from(frame) });
      offset = end;
    }
    return tokens;
  };
  const anchor = new Set(tokensFor(anchorBytes).map((token) => token.key));
  const delta = tokensFor(candidateBytes).filter((token) => !anchor.has(token.key));
  return {
    bytes: Buffer.concat(delta.map((token) => token.frame)),
    frameCount: delta.length,
  };
}

function detectReceiptIntentV1(root, candidateSha, options = {}) {
  const parents = gitParents(root, candidateSha);
  if (parents.length !== 1) {
    return {
      schema: 'receipt-intent/v1', detected: true, newArd11LastLine: false,
      ledgerAfterFunctionalB: false, newPendingBindingState: false,
      nearestFunctionalSha: null, nearestAcceptedEvidenceSha: null,
    };
  }
  const parentSha = parents[0];
  const parentLog = gitFile(root, parentSha, LEDGER_PATH, Buffer.alloc(0));
  const candidateLog = gitFile(root, candidateSha, LEDGER_PATH, Buffer.alloc(0));
  const ledgerChanged = !candidateLog.equals(parentLog);
  const edgeSuffix = candidateLog.length > parentLog.length && candidateLog.subarray(0, parentLog.length).equals(parentLog)
    ? candidateLog.subarray(parentLog.length) : candidateLog;
  const edgeTaskSignal = edgeSuffix.includes(Buffer.from(PENDING_TASK, 'utf8'));
  const nearestFunctionalSha = nearestFunctionalCommit(root, candidateSha);
  const acceptedEvidence = nearestAcceptedEvidenceCommit(root, candidateSha, options);
  const nearestAcceptedEvidenceSha = acceptedEvidence?.sha ?? null;
  const ledgerAfterFunctionalB = Boolean(nearestFunctionalSha && candidateSha !== nearestFunctionalSha
    && ledgerChanged && !acceptedEvidence?.effective);
  const deltaAnchorSha = nearestAcceptedEvidenceSha ?? options.workflowAnchorSha ?? parentSha;
  const anchorLog = gitFile(root, deltaAnchorSha, LEDGER_PATH, Buffer.alloc(0));
  const receiptDelta = receiptDeltaSinceAnchor(anchorLog, candidateLog);
  const newPendingBindingState = containsNewPendingReceipt(receiptDelta.bytes);
  const ledger = evaluateLedgerBuffers(parentLog, candidateLog, { parentSha, candidateSha });
  const newArd11LastLine = ledgerChanged && edgeTaskSignal;
  return {
    schema: 'receipt-intent/v1',
    detected: newArd11LastLine || ledgerAfterFunctionalB || newPendingBindingState,
    newArd11LastLine,
    ledgerAfterFunctionalB,
    newPendingBindingState,
    nearestFunctionalSha,
    nearestAcceptedEvidenceSha,
    acceptedEvidenceEffective: acceptedEvidence?.effective ?? false,
    receiptDeltaAnchorSha: deltaAnchorSha,
    receiptDeltaSha256: sha256(receiptDelta.bytes),
    receiptDeltaFrameCount: receiptDelta.frameCount,
    ledger,
  };
}

function runHarness(root, options, internal = {}) {
  const outputRoot = internal.outputValidated
    ? options.output
    : validateOutputDirectory(options.output, root);
  const identity = validateRuntimeIdentity(root, options);
  const check = checkRepository(root, { env: internal.env ?? process.env });
  const anchors = validateOptionalAnchors(root, options, identity);
  const auditMode = options.auditMode ?? 'functional';
  if (!['functional', 'receipt-intent'].includes(auditMode)) policyRed('AUDIT_MODE_INVALID');
  if (options.expectedCore !== 43) policyRed('EXPECTED_CORE_MISMATCH');
  if (options.expectedLedgerGeneric !== 3) policyRed('EXPECTED_LEDGER_GENERIC_MISMATCH');
  if (auditMode === 'receipt-intent' && options.expectedReceiptSemantic !== 16) {
    policyRed('EXPECTED_RECEIPT_SEMANTIC_MISMATCH');
  }
  if (auditMode === 'functional' && options.forbidReceiptSemanticOutput !== true) {
    policyRed('FUNCTIONAL_AUDIT_MUST_FORBID_RECEIPT_OUTPUT');
  }
  if (auditMode === 'functional' && options.producerTranche !== undefined) {
    policyRed('FUNCTIONAL_AUDIT_PRODUCER_FORBIDDEN');
  }
  if (auditMode === 'receipt-intent' && options.producerTranche !== 'ARD-11-E-POSTCOMMIT' && !internal.selfTest) {
    policyRed('PRODUCER_TRANCHE_INVALID');
  }
  if (auditMode === 'receipt-intent' && !internal.selfTest) {
    if (options.noMaterialize !== true) policyRed('NO_MATERIALIZE_REQUIRED');
    if (options.canonicalOutput === undefined) policyRed('CANONICAL_OUTPUT_REQUIRED');
    if (options.candidateSha === undefined) policyRed('CANDIDATE_SHA_REQUIRED');
    if (options.oracleAnchorSha === undefined || options.workflowAnchorSha === undefined) {
      policyRed('RECEIPT_ANCHORS_REQUIRED');
    }
  }

  writeJson(join(outputRoot, 'schema.json'), {
    schema: HARNESS_SCHEMA,
    oracleSchema: ORACLE_SCHEMA,
    auditMode,
  });
  const tempRoot = checkedTempRoot('ardesia-policy-harness-');
  try {
    const seed = createSeedRepository(root, tempRoot);
    writeBytes(join(outputRoot, 'candidate-manifest.tsv'), Buffer.from(seed.manifest.tsv, 'utf8'));
    writeBytes(join(outputRoot, 'inventory.tsv'), Buffer.from(inventoryTsv(check.inventory), 'utf8'));
    const fakeBin = createFakeTools(tempRoot);
    const legacyBytes = findLegacyDebtBytes(root);
    const coreCases = runCoreCases(seed, outputRoot, fakeBin, check.state, legacyBytes);
    const ledgerCases = runLedgerCases(outputRoot);
    let receiptCases = [];
    let receiptReport = {
      schema: 'receipt-intent/v1',
      status: 'not_applicable',
      detected: false,
      newArd11LastLine: false,
      ledgerAfterFunctionalB: false,
      newPendingBindingState: false,
      publicationBindingV1: 'INCOMPLETE',
    };
    let functionalSha = identity.candidateSha;
    if (auditMode === 'receipt-intent') {
      if (!internal.selfTest) {
        const intent = detectReceiptIntentV1(root, identity.candidateSha, options);
        receiptReport = { ...receiptReport, ...intent };
        if (!intent.detected) policyRed('RECEIPT_INTENT_NOT_DETECTED');
        if (!intent.nearestFunctionalSha) policyRed('RECEIPT_FUNCTIONAL_COMMIT_NOT_FOUND');
        functionalSha = intent.nearestFunctionalSha;
        const semantic = validateReceiptCommit(
          root,
          functionalSha,
          identity.candidateSha,
          deriveFunctionalPolicyState(root, functionalSha),
          null,
          {
            oracleAnchorSha: options.oracleAnchorSha,
            oracleSha256: anchors.oracleSha256,
            workflowAnchorSha: options.workflowAnchorSha,
            workflowSha256: anchors.workflowSha256,
          },
        );
        receiptReport = {
          schema: 'receipt-intent/v1',
          status: 'GREEN',
          detected: intent.detected,
          newArd11LastLine: intent.newArd11LastLine,
          ledgerAfterFunctionalB: intent.ledgerAfterFunctionalB,
          newPendingBindingState: intent.newPendingBindingState,
          nearestFunctionalSha: intent.nearestFunctionalSha,
          nearestAcceptedEvidenceSha: intent.nearestAcceptedEvidenceSha,
          receiptStructuralAcceptanceV1: semantic.receiptStructuralAcceptanceV1,
          publicationBindingV1: 'INCOMPLETE',
          candidateSha: identity.candidateSha,
          functionalSha,
          ledgerRawReason: semantic.ledger.reason,
        };
      }
      receiptCases = runReceiptCases(root, outputRoot);
    }
    const parentSha = gitParents(root, identity.candidateSha)[0] ?? null;
    const ledgerReport = parentSha
      ? evaluateLedgerBuffers(
        gitFile(root, parentSha, LEDGER_PATH, Buffer.alloc(0)),
        gitFile(root, identity.candidateSha, LEDGER_PATH, Buffer.alloc(0)),
        { candidateSha: identity.candidateSha, parentSha },
      )
      : { schema: 'ledger-append/v1', status: 'not_applicable', reason: null };
    writeJson(join(outputRoot, 'ledger-append.json'), ledgerReport);
    writeJson(join(outputRoot, 'receipt-append.json'), receiptReport);

    const control = internal.controlFrozen || controlPlaneDepth > 0
      ? CONTROL_COUNTS
      : runControlPlaneGitCases(root);
    const context = {
      coreCases,
      ledgerCases,
      receiptCases,
      auditMode,
      identity,
      functionalSha,
      producerTranche: options.producerTranche ?? null,
      oracleAnchorSha: options.oracleAnchorSha ?? null,
      workflowAnchorSha: options.workflowAnchorSha ?? null,
      anchors,
      seed,
      control,
    };
    const canonical = makeCanonicalAudit(context);
    if (options.canonicalOutput !== undefined) {
      const canonicalOutput = validateOutputFile(options.canonicalOutput, root);
      writeBytes(canonicalOutput, jcsLf(canonical));
    }
    const summary = {
      schema: HARNESS_SCHEMA,
      oracleSchema: ORACLE_SCHEMA,
      state: check.state,
      auditMode,
      candidateSha: identity.candidateSha,
      candidateTree: seed.seedTree,
      oracleAnchorSha: options.oracleAnchorSha ?? null,
      oracleSha256: anchors.oracleSha256,
      workflowAnchorSha: options.workflowAnchorSha ?? null,
      workflowBlob: anchors.workflowBlob,
      eventSha: identity.eventSha,
      prMergeSha: identity.prMergeSha,
      headAsserted: identity.headAsserted,
      seedCommit: seed.seedCommit,
      seedTree: seed.seedTree,
      sourceHead: seed.sourceHead,
      sourceDirtyPaths: seed.dirtyPaths,
      candidateManifestSha256: seed.manifest.sha256,
      precommitPolicyInputDigest: seed.manifest.sha256,
      historicalInventory: check.historicalRows,
      counts: {
        core: { positiveBaselines: coreCases.length, cases: coreCases.length, exactReasonMatches: coreCases.length },
        ledgerGeneric: { positiveBaselines: ledgerCases.length, cases: ledgerCases.length, exactReasonMatches: ledgerCases.length },
        receiptSemantic: auditMode === 'receipt-intent'
          ? { positiveBaselines: receiptCases.length, cases: receiptCases.length, exactReasonMatches: receiptCases.length }
          : 'not_applicable',
        total: coreCases.length + ledgerCases.length + receiptCases.length,
      },
      ...control,
      npmMaterializerStarted: 0,
      uvSyncStarted: 0,
      platform: platformEvidence(),
      timestampUtc: new Date().toISOString(),
      binMonorepoSha256Supplement: sha256(readBytes(root, 'bin/monorepo.sh')),
    };
    writeJson(join(outputRoot, 'summary.json'), summary);
    writeJson(join(outputRoot, 'binding.json'), {
      schema: 'studio-install-policy-binding/v1',
      candidateSha: identity.candidateSha,
      testedImplementationSha: functionalSha,
      receiptStructuralAcceptanceV1: auditMode === 'receipt-intent' ? 'GREEN' : 'not_applicable',
      publicationBindingV1: 'INCOMPLETE',
      canonicalRawSha256: sha256(jcsLf(canonical)),
    });
    const sumsSha256 = writeSha256Sums(outputRoot);
    return { outputRoot, summary, canonical, sumsSha256 };
  } finally {
    removeCheckedTemp(tempRoot, 'ardesia-policy-harness-');
  }
}

function initializeFixtureRepository(root) {
  requireRun('git', ['init', '--initial-branch=harness', root], { env: fixedGitEnvironment() }, 'FIXTURE_GIT_INIT_FAILED');
  requireRun('git', ['-C', root, 'config', 'user.name', 'ARDESIA policy harness'], {}, 'FIXTURE_GIT_CONFIG_FAILED');
  requireRun('git', ['-C', root, 'config', 'user.email', 'policy-harness@invalid.local'], {}, 'FIXTURE_GIT_CONFIG_FAILED');
  requireRun('git', ['-C', root, 'add', '-A'], {}, 'FIXTURE_GIT_ADD_FAILED');
  requireRun('git', ['-C', root, 'commit', '-m', 'fixture candidate'], { env: fixedGitEnvironment() }, 'FIXTURE_GIT_COMMIT_FAILED');
}

function syntheticMonorepoScript() {
  return `#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
policy_studio_install_check() {
  exec node "$ROOT/${ORACLE_PATH}" check "$@"
}
bootstrap_core() {
  cd "$ROOT"
  policy_studio_install_check
  uv --directory packages/engine sync
  ${MATERIALIZE}
}
bootstrap_all() {
  bootstrap_core
  npm --prefix plugins/elab-tutor ci
  npm --prefix ops/tools ci
}
require_studio_deps() {
  echo "run ${MATERIALIZE}"
}
require_studio_playwright() {
  echo "run ${MATERIALIZE}"
}
lock_only_guidance() {
  echo "run ${LOCK_ONLY}"
}
case "\${1:-}" in
  policy-studio-install-check) shift; policy_studio_install_check "$@" ;;
  bootstrap) shift; bootstrap_core "$@" ;;
  *) exit 64 ;;
esac
`;
}

function createSyntheticPolicyRepository(sourceRoot, fixtureRoot) {
  const files = {
    'apps/studio/.npmrc': 'ignore-scripts=true\n',
    '.github/workflows/ci.yml': `name: ci
jobs:
  studio:
    steps:
      - name: Studio install policy + materialize
        working-directory: \${{ github.workspace }}
        run: ${ATOMIC_MATERIALIZE}
`,
    '.github/workflows/studio-preview-readiness.yml': `name: studio-preview-readiness
jobs:
  readiness:
    steps:
      - name: Studio install policy + materialize
        run: ${ATOMIC_MATERIALIZE}
`,
    'vercel.json': `${JSON.stringify({ framework: 'vite', installCommand: ATOMIC_MATERIALIZE, buildCommand: 'npm --prefix apps/studio run build', outputDirectory: 'apps/studio/dist' }, null, 2)}\n`,
    'bin/monorepo.sh': syntheticMonorepoScript(),
  };
  for (const [path, text] of Object.entries(files)) writeBytes(join(fixtureRoot, path), Buffer.from(text, 'utf8'), path.endsWith('.sh') ? 0o700 : 0o600);
  chmodSync(join(fixtureRoot, 'bin/monorepo.sh'), 0o700);
  for (const path of [...B_PATHS, ...HISTORICAL.map((record) => record.path), ORACLE_PATH]) {
    copyCandidateEntry(sourceRoot, fixtureRoot, path);
  }
  initializeFixtureRepository(fixtureRoot);
  const ignoredTrackedProbe = 'tracked-but-ignored-policy-probe.txt';
  writeBytes(join(fixtureRoot, '.gitignore'), Buffer.from(`${ignoredTrackedProbe}\n`, 'utf8'));
  writeBytes(join(fixtureRoot, ignoredTrackedProbe), Buffer.from('tracked fixture\n', 'utf8'));
  requireRun('git', ['-C', fixtureRoot, 'add', '.gitignore'], {}, 'FIXTURE_GIT_ADD_FAILED');
  requireRun('git', ['-C', fixtureRoot, 'add', '-f', ignoredTrackedProbe], {}, 'FIXTURE_GIT_ADD_FAILED');
  requireRun('git', ['-C', fixtureRoot, 'commit', '-m', 'fixture tracked ignored probe'], {
    env: fixedGitEnvironment(),
  }, 'FIXTURE_GIT_COMMIT_FAILED');
}

function makeDebtFilesSafe(root) {
  writeContentMap(root, safeDebtContents());
}

function runAuditRegressionFalsifiers(fixtureRoot, env) {
  const failures = [];
  const hiddenPath = join(fixtureRoot, '.hidden', 'studio-materializer.sh');
  const unsafeCommands = [
    ['extra-npm-install', 'npm install'],
    ['npm-prefix-option', 'npm --silent --prefix apps/studio install'],
    ['npm-cwd-option', 'npm --silent -C apps/studio install'],
    ['pnpm-prefix-option', 'pnpm --silent --dir apps/studio install'],
    ['yarn-cwd-option', 'yarn --silent --cwd apps/studio install'],
    ['bun-cwd-option', 'bun --silent --cwd apps/studio install'],
  ];
  for (const [id, command] of unsafeCommands) {
    const targetPath = id === 'extra-npm-install' ? join(fixtureRoot, 'bin', 'monorepo.sh') : hiddenPath;
    const original = id === 'extra-npm-install' ? readFileSync(targetPath) : Buffer.alloc(0);
    writeBytes(targetPath, Buffer.concat([original, Buffer.from(`\n${command}\n`, 'utf8')]), 0o700);
    const reason = capturePolicyReason(() => checkRepository(fixtureRoot, { env }));
    if (reason === null) failures.push(`materializer:${id}`);
    if (id === 'extra-npm-install') writeBytes(targetPath, original, 0o700);
    else rmSync(hiddenPath, { force: true });
  }

  const provenanceFixture = receiptFixture();
  provenanceFixture.oracleAnchorSha = TEST_SHA.O;
  provenanceFixture.oracleSha256 = 'a'.repeat(64);
  provenanceFixture.workflowAnchorSha = TEST_SHA.A;
  provenanceFixture.workflowSha256 = 'a'.repeat(64);
  const wrongProvenance = goodReceiptPayload();
  wrongProvenance.harness.oracleAnchorSha = TEST_SHA.OTHER;
  provenanceFixture.candidateLog = Buffer.concat([
    provenanceFixture.parentLog,
    Buffer.from(`${JSON.stringify(wrongProvenance)}\n`, 'utf8'),
  ]);
  const provenanceReason = capturePolicyReason(() => validateReceiptSemantic(provenanceFixture));
  if (provenanceReason !== 'POLICY_RED:RECEIPT_HARNESS_PROVENANCE_INVALID') {
    failures.push('receipt-provenance');
  }

  const record = {
    counts: { core: 43, ledgerGeneric: 3, receiptSemantic: 16, total: 62 },
    bindingVerifierCounts: { ...CONTROL_COUNTS.bindingVerifierCounts },
    bootstrapIntegrityCounts: { ...CONTROL_COUNTS.bootstrapIntegrityCounts },
    preReceiptTransitionCounts: { ...CONTROL_COUNTS.preReceiptTransitionCounts },
    rollbackRecoveryCounts: { ...CONTROL_COUNTS.rollbackRecoveryCounts },
    stateMachineCounts: { ...CONTROL_COUNTS.stateMachineCounts },
  };
  for (const field of [
    'counts', 'bindingVerifierCounts', 'bootstrapIntegrityCounts',
    'preReceiptTransitionCounts', 'rollbackRecoveryCounts', 'stateMachineCounts',
  ]) {
    const mutated = structuredClone(record);
    mutated[field].unexpected = 1;
    const reason = capturePolicyReason(() => validateRecordCounts(mutated));
    if (reason === null) failures.push(`closed-schema:${field}`);
  }
  const canonicalCounts = structuredClone(record);
  canonicalCounts.counts.positiveBaselines = 62;
  canonicalCounts.counts.exactReasonMatches = 62;
  canonicalCounts.counts.unexpected = 1;
  if (capturePolicyReason(() => validateRecordCounts(canonicalCounts, true)) === null) {
    failures.push('closed-schema:canonical-counts');
  }
  const recovery = Object.fromEntries(ROLLBACK_RECOVERY_KEYS.map((field) => {
    if (field === 'revocationRecordPath') return [field, `${EVIDENCE_REVOCATIONS_DIR}/${TEST_SHA.R}.revocation.2.json`];
    if (field === 'revocationRecordSha256') return [field, 'a'.repeat(64)];
    return [field, TEST_SHA.R];
  }));
  recovery.unexpected = true;
  if (capturePolicyReason(() => validateRollbackRecoveryShape(recovery)) === null) {
    failures.push('closed-schema:rollbackRecoveryV1');
  }

  if (failures.length > 0) {
    policyRed(`SELF_TEST_AUDIT_REGRESSION_RED:${failures.join(',')}`);
  }
}

function runSelfTest(root) {
  const tempRoot = checkedTempRoot('ardesia-policy-selftest-');
  try {
    const fixtureRoot = join(tempRoot, 'candidate');
    ensureDirectory(fixtureRoot);
    createSyntheticPolicyRepository(root, fixtureRoot);
    const seedRegressionRoot = join(tempRoot, 'tracked-ignored-seed-regression');
    ensureDirectory(seedRegressionRoot);
    const seedRegression = createSeedRepository(fixtureRoot, seedRegressionRoot);
    const cloneRegressionRoot = join(tempRoot, 'tracked-ignored-clone-regression');
    cloneSeed(seedRegression, cloneRegressionRoot);
    const seedNpmrc = readBytes(seedRegression.seedRoot, 'apps/studio/.npmrc');
    writeBytes(join(cloneRegressionRoot, 'apps/studio/.npmrc'), Buffer.from('mutated clone\n', 'utf8'));
    if (!readBytes(seedRegression.seedRoot, 'apps/studio/.npmrc').equals(seedNpmrc)) {
      policyRed('SELF_TEST_CLONE_ISOLATION_FAILED');
    }
    removeCheckedTemp(cloneRegressionRoot, 'tracked-ignored-clone-regression');
    const fakeBin = createFakeTools(tempRoot);
    const env = caseEnvironment(fakeBin, fixtureRoot);
    const excludedWorkspaceBaseline = capturePolicyReason(() => checkRepository(fixtureRoot, { env }));
    if (excludedWorkspaceBaseline !== null) {
      policyRed('SELF_TEST_NON_STUDIO_WORKSPACE_EXCLUSION_RED');
    }
    runAuditRegressionFalsifiers(fixtureRoot, env);
    makeDebtFilesSafe(fixtureRoot);
    commitFixture(fixtureRoot, 'fixture safe source regression', B_PATHS);
    const replayEvidenceOffset = canonicalReplayEvidence.length;
    const control = runControlPlaneGitCases(fixtureRoot);
    const output = join(tempRoot, 'evidence');
    const result = runHarness(fixtureRoot, {
      output,
      auditMode: 'receipt-intent',
      producerTranche: 'ARD-11-E-POSTCOMMIT',
      expectedCore: 43,
      expectedLedgerGeneric: 3,
      expectedReceiptSemantic: 16,
    }, { env, selfTest: true, controlFrozen: true });
    if (result.summary.counts.total !== 62) policyRed('SELF_TEST_AUDIT_TOTAL_MISMATCH');
    if (!equalJcsValue(control, CONTROL_COUNTS)) policyRed('SELF_TEST_CONTROL_COUNTS_MISMATCH');
    makeDebtFilesSafe(fixtureRoot);
    const full = checkRepository(fixtureRoot, { env });
    if (full.state !== 'FULL_GREEN') policyRed('SELF_TEST_FULL_GREEN_TRANSITION_FAILED');
    if (canonicalizeJcs({ b: 1, a: 2 }) !== '{"a":2,"b":1}') policyRed('SELF_TEST_JCS_KEY_ORDER_FAILED');
    if (canonicalizeJcs(-0) !== '0') policyRed('SELF_TEST_JCS_NEGATIVE_ZERO_FAILED');
    if (capturePolicyReason(() => canonicalizeJcs('\ud800')) !== 'POLICY_RED:JCS_NON_IJSON_STRING') {
      policyRed('SELF_TEST_JCS_IJSON_FAILED');
    }
    const bashFixture = [
      'demo() {',
      '  echo "}"',
      "  cat <<'EOF'",
      '}',
      'EOF',
      '  { echo nested; }',
      '}',
      '',
    ].join('\n');
    const parsedBody = extractFunctionBody(bashFixture, 'demo');
    if (!parsedBody?.includes('echo nested') || !parsedBody.includes("cat <<'EOF'")) {
      policyRed('SELF_TEST_BASH_FUNCTION_BALANCE_FAILED');
    }
    const duplicateReason = capturePolicyReason(() => extractFunctionBody(`${bashFixture}${bashFixture}`, 'demo'));
    if (duplicateReason !== 'POLICY_RED:BASH_FUNCTION_PARSE_AMBIGUOUS:demo') {
      policyRed('SELF_TEST_BASH_FUNCTION_AMBIGUITY_FAILED');
    }
    const replacementLedger = evaluateLedgerBuffers(
      Buffer.from('{"old":true}\n', 'utf8'),
      Buffer.from('{"old":true}\n{"value":"\ufffd"}\n', 'utf8'),
    );
    if (replacementLedger.reason !== 'POLICY_RED:LEDGER_JSON_INVALID') {
      policyRed('SELF_TEST_UTF8_REPLACEMENT_REJECTION_FAILED');
    }
    const replayEvidence = canonicalReplayEvidence.slice(replayEvidenceOffset);
    const replayPaths = replayEvidence.flatMap((entry) => [entry.outputPath, entry.canonicalPath]);
    if (replayEvidence.length < 3 || new Set(replayPaths).size !== replayPaths.length
      || replayEvidence.some((entry) => !SHA256_RE.test(entry.identity)
        || !SHA256_RE.test(entry.canonicalSha256))) {
      policyRed('SELF_TEST_CANONICAL_OUTPUT_ISOLATION_FAILED');
    }
    const summaryPath = join(result.outputRoot, 'summary.json');
    const sumsPath = join(result.outputRoot, 'sha256sums.txt');
    const ephemeralArtifacts = [
      { path: summaryPath, sha256: sha256(readFileSync(summaryPath)) },
      { path: sumsPath, sha256: sha256(readFileSync(sumsPath)) },
      ...replayEvidence.map((entry) => ({ path: entry.canonicalPath, sha256: entry.canonicalSha256 })),
    ];
    return {
      schema: ORACLE_SCHEMA,
      profile: 'all',
      core: '43/43',
      ledgerGeneric: '3/3',
      receiptSemantic: '16/16',
      bootstrapIntegrity: '3/3+3/3',
      preReceiptTransitions: '5/5+3/3',
      bindingVerifier: '7/7+7/7+1/1',
      stateMachine: '7/7',
      rollbackRecovery: '1/5',
      npmMaterializerStarted: 0,
      uvSyncStarted: 0,
      gitCausalReceiptCases: 'R01-R16',
      canonicalReplayOutputs: {
        count: replayEvidence.length,
        uniquePerInvocation: true,
        provenanceDigest: sha256(jcsLf(replayEvidence)),
      },
      ephemeralArtifacts,
      temporaryOutputsRemovedOnExit: true,
    };
  } finally {
    removeCheckedTemp(tempRoot, 'ardesia-policy-selftest-');
  }
}

function commitScope(root, sha) {
  const parents = gitParents(root, sha);
  if (parents.length !== 1) policyRed(`E_COMMIT_PARENT_AMBIGUOUS:${sha}`);
  return changedPaths(root, parents[0], sha);
}

function assertScope(actual, expected, reasonPrefix) {
  if (arraysEqual(bytewise(actual), bytewise(expected))) return;
  policyRed(`${reasonPrefix}:${firstSetDifference(actual, expected)}`);
}

function markerValue(workflowBytes, marker, length) {
  const text = workflowBytes.toString('utf8');
  const expression = new RegExp(`^  # ${marker}=([0-9a-f]{${length}})$`, 'gmu');
  const matches = [...text.matchAll(expression)];
  return matches.length === 1 ? matches[0][1] : null;
}

function functionalManifestDigestFromCommit(root, sha) {
  const pieces = [];
  for (const path of bytewise(B_PATHS)) {
    const bytes = gitFile(root, sha, path);
    pieces.push(Buffer.from(path, 'utf8'), Buffer.from([0]), Buffer.from(sha256(bytes), 'ascii'), Buffer.from([0]));
  }
  return sha256(Buffer.concat(pieces));
}

function verifyFrozenEpoch(root, candidateSha, oracleAnchorSha, workflowAnchorSha) {
  const oracleParents = gitParents(root, oracleAnchorSha);
  if (oracleParents.length !== 1) policyRed('E_ORACLE_ANCHOR_PARENT_INVALID');
  const p0 = oracleParents[0];
  assertScope(changedPaths(root, p0, oracleAnchorSha), [ORACLE_PATH], 'E_ORACLE_ANCHOR_SCOPE_INVALID');
  const workflowParents = gitParents(root, workflowAnchorSha);
  if (workflowParents.length !== 1 || workflowParents[0] !== oracleAnchorSha) {
    const actual = workflowParents[0] ?? 'MISSING';
    policyRed(`PRE_RECEIPT_INTERMEDIATE_COMMIT:O_A:${actual}`);
  }
  assertScope(changedPaths(root, oracleAnchorSha, workflowAnchorSha), A_PATHS, 'E_WORKFLOW_ANCHOR_SCOPE_INVALID');
  const ancestry = runFile('git', ['-C', root, 'merge-base', '--is-ancestor', workflowAnchorSha, candidateSha]);
  if (ancestry.status !== 0) policyRed('E_WORKFLOW_ANCHOR_NOT_ANCESTOR');
  const currentOracle = gitFile(root, candidateSha, ORACLE_PATH);
  const frozenOracle = gitFile(root, oracleAnchorSha, ORACLE_PATH);
  if (!currentOracle.equals(frozenOracle)) policyRed('E_VERIFIER_DRIFT_FROM_A');
  const currentWorkflow = gitFile(root, candidateSha, WORKFLOW_PATH);
  const frozenWorkflow = gitFile(root, workflowAnchorSha, WORKFLOW_PATH);
  if (!currentWorkflow.equals(frozenWorkflow)) policyRed('E_WORKFLOW_DRIFT_FROM_A');
  const markerOracle = markerValue(frozenWorkflow, 'ARD11_D0P_A_ORACLE_COMMIT_V3', 40);
  const markerDigest = markerValue(frozenWorkflow, 'ARD11_D0P_A_ORACLE_BINDING_V3', 64);
  const markerManifest = markerValue(frozenWorkflow, 'ARD11_D0P_A_EXPECTED_F_MANIFEST_V3', 64);
  if (markerOracle !== oracleAnchorSha) policyRed('PRE_RECEIPT_O_ANCHOR_INVALID');
  if (markerDigest !== sha256(frozenOracle)) policyRed('E_EXPECTED_DIGEST_DRIFT_FROM_A');
  if (!markerManifest) policyRed('PRE_RECEIPT_F_MANIFEST_ANCHOR_INVALID');
  const commitsText = git(root, ['rev-list', '--first-parent', '--reverse', `${workflowAnchorSha}..${candidateSha}`]);
  const commits = commitsText ? commitsText.split('\n') : [];
  for (const commit of commits) {
    const scope = commitScope(root, commit);
    if (scope.includes(ORACLE_PATH)) policyRed('E_VERIFIER_DRIFT_FROM_A');
    if (scope.includes(WORKFLOW_PATH)) policyRed('E_WORKFLOW_DRIFT_FROM_A');
    if (!gitFile(root, commit, ORACLE_PATH).equals(frozenOracle)) policyRed('E_VERIFIER_DRIFT_FROM_A');
    if (!gitFile(root, commit, WORKFLOW_PATH).equals(frozenWorkflow)) policyRed('E_WORKFLOW_DRIFT_FROM_A');
  }
  return {
    p0,
    commits,
    oracleSha256: markerDigest,
    workflowSha256: sha256(frozenWorkflow),
    workflowBlob: gitBlob(root, workflowAnchorSha, WORKFLOW_PATH),
    expectedFunctionalManifest: markerManifest,
  };
}

function deriveInitialLineage(root, candidateSha, oracleAnchorSha, workflowAnchorSha) {
  const epoch = verifyFrozenEpoch(root, candidateSha, oracleAnchorSha, workflowAnchorSha);
  if (candidateSha === workflowAnchorSha) {
    return { epoch, state: 'ACTIVE_GREEN_D0P_B_PENDING', publication: 'INCOMPLETE' };
  }
  const [functionalSha, receiptSha, evidenceSha, ...descendants] = epoch.commits;
  if (!functionalSha) policyRed('PRE_RECEIPT_EXPECTED_F_AFTER_A:UNKNOWN');
  const functionalParents = gitParents(root, functionalSha);
  const functionalScope = commitScope(root, functionalSha);
  if (functionalParents[0] !== workflowAnchorSha) {
    policyRed(`PRE_RECEIPT_INTERMEDIATE_COMMIT:A_F:${functionalSha}`);
  }
  if (!arraysEqual(functionalScope, B_PATHS)) {
    if (epoch.commits.length > 1) policyRed(`PRE_RECEIPT_INTERMEDIATE_COMMIT:A_F:${functionalSha}`);
    policyRed(`PRE_RECEIPT_EXPECTED_F_AFTER_A:${firstSetDifference(functionalScope, B_PATHS)}`);
  }
  const actualManifest = functionalManifestDigestFromCommit(root, functionalSha);
  if (actualManifest !== epoch.expectedFunctionalManifest) {
    policyRed(`PRE_RECEIPT_F_CONTENT_MISMATCH:${actualManifest}`);
  }
  if (candidateSha === functionalSha) {
    return { epoch, functionalSha, state: 'FUNCTIONAL_GREEN_F_RECEIPT_PENDING', publication: 'INCOMPLETE' };
  }
  if (!receiptSha) policyRed('PRE_RECEIPT_EXPECTED_R_AFTER_F:UNKNOWN');
  const receiptParents = gitParents(root, receiptSha);
  const receiptScope = commitScope(root, receiptSha);
  if (receiptParents[0] !== functionalSha || !arraysEqual(receiptScope, [LEDGER_PATH])) {
    policyRed(`PRE_RECEIPT_EXPECTED_R_AFTER_F:${firstSetDifference(receiptScope, [LEDGER_PATH])}`);
  }
  const functionalState = deriveFunctionalPolicyState(root, functionalSha);
  if (functionalState !== 'FULL_GREEN_FUNCTIONAL_ONLY') {
    policyRed('FUNCTIONAL_POLICY_STATE_INVALID');
  }
  const receipt = validateReceiptCommit(root, functionalSha, receiptSha, functionalState, null, {
    oracleAnchorSha,
    oracleSha256: epoch.oracleSha256,
    workflowAnchorSha,
    workflowSha256: epoch.workflowSha256,
  });
  if (candidateSha === receiptSha) {
    return {
      epoch,
      functionalSha,
      receiptSha,
      receipt,
      state: 'POSTCOMMIT_BINDING_PENDING',
      publication: 'INCOMPLETE',
    };
  }
  if (!evidenceSha) policyRed('E_BINDING_REQUIRED_BEFORE_NEXT_TRANCHE');
  const expectedEvidence = [
    'docs/ops/evidence/studio-install-policy/index.jsonl',
    `docs/ops/evidence/studio-install-policy/records/${receiptSha}.json`,
    `docs/ops/evidence/studio-install-policy/canonical/${receiptSha}.json`,
  ];
  const evidenceScope = commitScope(root, evidenceSha);
  if (!evidenceScope.includes(expectedEvidence[0]) || !evidenceScope.includes(expectedEvidence[1])) {
    policyRed('E_BINDING_REQUIRED_BEFORE_NEXT_TRANCHE');
  }
  return { epoch, functionalSha, receiptSha, receipt, evidenceSha, descendants };
}

function forbiddenSelfField(value, path = '') {
  if (value === null || typeof value !== 'object') return null;
  for (const key of bytewise(Object.keys(value))) {
    if (['selfHash', 'bindingCommitSha', 'evidenceCommitSha', 'accepted', 'publicationBindingV1'].includes(key)) return key;
    const nested = forbiddenSelfField(value[key], path ? `${path}.${key}` : key);
    if (nested) return nested;
  }
  return null;
}

function validateIndexEntryShape(entry) {
  const common = ['schema', 'operation', 'sequence', 'receiptSha'];
  if (entry?.operation === 'revocation') {
    assertExactKeys(entry, [...common, 'revocationPath', 'revocationSha256'], 'E_INDEX_SCHEMA_INVALID');
    if (entry.schema !== INDEX_SCHEMA || !Number.isSafeInteger(entry.sequence) || entry.sequence < 1
      || !SHA_RE.test(entry.receiptSha ?? '') || typeof entry.revocationPath !== 'string'
      || !SHA256_RE.test(entry.revocationSha256 ?? '')) policyRed('E_INDEX_SCHEMA_INVALID');
    return entry;
  }
  if (!['accept', 'correction', 'replacement'].includes(entry?.operation)) policyRed('E_INDEX_OPERATION_INVALID');
  assertExactKeys(entry, [
    ...common, 'recordPath', 'recordSha256', 'canonicalPath', 'canonicalRawSha256',
  ], 'E_INDEX_SCHEMA_INVALID');
  if (entry.schema !== INDEX_SCHEMA || !Number.isSafeInteger(entry.sequence) || entry.sequence < 1
    || !SHA_RE.test(entry.receiptSha ?? '') || typeof entry.recordPath !== 'string'
    || !SHA256_RE.test(entry.recordSha256 ?? '') || typeof entry.canonicalPath !== 'string'
    || !SHA256_RE.test(entry.canonicalRawSha256 ?? '')) policyRed('E_INDEX_SCHEMA_INVALID');
  return entry;
}

function validateCanonicalAuditShape(canonical, context) {
  assertExactKeys(canonical, [
    'schema', 'oracleSchema', 'harnessSchema', 'task', 'auditMode', 'auditTargetSha',
    'testedImplementationSha', 'producerTranche', 'candidateTree', 'oraclePath',
    'oracleAnchorSha', 'oracleSha256', 'workflowPath', 'workflowAnchorSha',
    'workflowSha256', 'historicalNonOperational', 'cases', 'counts',
    'bootstrapIntegrityCounts', 'preReceiptTransitionCounts', 'bindingVerifierCounts',
    'stateMachineCounts', 'rollbackRecoveryCounts', 'npmMaterializerStarted', 'uvSyncStarted',
  ], 'E_CANONICAL_SCHEMA_INVALID');
  if (canonical.schema !== 'studio-install-policy-canonical-audit/v1'
    || canonical.oracleSchema !== ORACLE_SCHEMA || canonical.harnessSchema !== HARNESS_SCHEMA
    || canonical.task !== PENDING_TASK || canonical.auditMode !== 'receipt-intent'
    || canonical.auditTargetSha !== context.receiptSha
    || canonical.testedImplementationSha !== context.functionalSha
    || canonical.producerTranche !== 'ARD-11-E-POSTCOMMIT'
    || canonical.oraclePath !== ORACLE_PATH || canonical.oracleAnchorSha !== context.options.oracleAnchorSha
    || canonical.oracleSha256 !== context.epoch.oracleSha256
    || canonical.workflowPath !== WORKFLOW_PATH || canonical.workflowAnchorSha !== context.options.workflowAnchorSha
    || canonical.workflowSha256 !== context.epoch.workflowSha256
    || canonical.npmMaterializerStarted !== 0 || canonical.uvSyncStarted !== 0) {
    policyRed('E_CANONICAL_PROVENANCE_INVALID');
  }
  if (!equalJcsValue(canonical.historicalNonOperational, HISTORICAL.map((record) => ({
    id: record.id, path: record.path, sha256: record.sha256, class: record.className,
  })))) policyRed('E_CANONICAL_HISTORICAL_INVALID');
  return canonical;
}

function validatePublicationRecordShape(record, operation) {
  const additional = operation === 'accept' ? []
    : operation === 'correction' ? ['sequence', 'supersedesRecordSha256']
      : ['sequence', 'supersedesRecordSha256', 'replacesRevocationSha256'];
  const optionalRollback = record.rollbackRecoveryV1 === undefined ? [] : ['rollbackRecoveryV1'];
  assertExactKeys(record, [...ACCEPT_RECORD_KEYS, ...additional, ...optionalRollback], 'E_RECORD_SCHEMA_INVALID');
  if (record.schema !== PUBLICATION_SCHEMA || record.task !== 'ARD-11-E-POSTCOMMIT'
    || record.operation !== operation) policyRed('E_RECORD_SCHEMA_INVALID');
  if (operation !== 'accept') {
    if (!Number.isSafeInteger(record.sequence) || record.sequence < 2
      || !SHA256_RE.test(record.supersedesRecordSha256 ?? '')) policyRed('E_RECORD_SCHEMA_INVALID');
    if (operation === 'replacement' && !SHA256_RE.test(record.replacesRevocationSha256 ?? '')) {
      policyRed('E_RECORD_SCHEMA_INVALID');
    }
  }
  return record;
}

function validateRevocationRecordShape(record) {
  const lineage = record.reasonCode === 'B_ROLLBACK'
    ? ['lineageReceiptSha', 'revokedFunctionalSha', 'rollbackTargetSha'] : [];
  assertExactKeys(record, [
    'schema', 'operation', 'receiptSha', 'sequence', 'revokesRecordSha256',
    'status', 'reasonCode', ...lineage,
  ], 'E_REVOCATION_RECORD_INVALID');
  if (record.schema !== 'studio-install-policy-publication-revocation/v1'
    || record.operation !== 'revocation' || record.status !== 'REVOKED'
    || !SHA_RE.test(record.receiptSha ?? '') || !Number.isSafeInteger(record.sequence)
    || record.sequence < 2 || !SHA256_RE.test(record.revokesRecordSha256 ?? '')
    || !/^[A-Z0-9_]+$/u.test(record.reasonCode ?? '')) policyRed('E_REVOCATION_RECORD_INVALID');
  if (lineage.length > 0 && lineage.some((field) => !SHA_RE.test(record[field] ?? ''))) {
    policyRed('E_REVOCATION_RECORD_INVALID');
  }
  return record;
}

function parseIndexBytes(bytes, reasonPrefix = 'E_INDEX_INVALID') {
  if (bytes.length === 0 || bytes.at(-1) !== 0x0a || bytes.includes(0x0d) || bytes.includes(0x00)) {
    policyRed(reasonPrefix);
  }
  const frames = bytes.subarray(0, -1).toString('binary').split('\n');
  const records = [];
  let offset = 0;
  for (const frameBinary of frames) {
    const frame = bytes.subarray(offset, offset + Buffer.byteLength(frameBinary, 'binary'));
    offset += frame.length + 1;
    const record = parseJsonObjectFatal(frame, reasonPrefix);
    if (!jcsLf(record).subarray(0, -1).equals(frame)) policyRed(reasonPrefix);
    records.push(validateIndexEntryShape(record));
  }
  return records;
}

function validateIndexAppend(parentBytes, candidateBytes, reason = 'E_HISTORY_REWRITE:docs/ops/evidence/studio-install-policy/index.jsonl#index') {
  if (candidateBytes.length <= parentBytes.length || !candidateBytes.subarray(0, parentBytes.length).equals(parentBytes)) {
    policyRed(reason);
  }
  if (parentBytes.length > 0 && parentBytes.at(-1) !== 0x0a) policyRed(reason);
  const suffix = candidateBytes.subarray(parentBytes.length);
  if (suffix.length === 0 || suffix.at(-1) !== 0x0a || lfPositions(suffix).length !== 1 || suffix.includes(0x0d) || suffix.includes(0x00)) {
    policyRed('E_INDEX_APPEND_INVALID');
  }
  const record = assertJcsLf(suffix, 'E_INDEX_APPEND_INVALID');
  return record;
}

function validateRecordCounts(record, canonicalAudit = false) {
  const countKeys = canonicalAudit
    ? ['core', 'ledgerGeneric', 'receiptSemantic', 'total', 'positiveBaselines', 'exactReasonMatches']
    : ['core', 'ledgerGeneric', 'receiptSemantic', 'total'];
  assertExactKeys(record.counts, countKeys, 'E_AUDIT_COUNTS_MISMATCH');
  assertExactKeys(record.bindingVerifierCounts, ['positiveBaselines', 'negativeCases', 'robustnessGreen'], 'E_CONTROL_COUNTS_MISMATCH');
  assertExactKeys(record.bootstrapIntegrityCounts, ['positiveBaselines', 'negativeCases'], 'E_CONTROL_COUNTS_MISMATCH');
  assertExactKeys(record.preReceiptTransitionCounts, ['positiveBaselines', 'negativeCases'], 'E_CONTROL_COUNTS_MISMATCH');
  assertExactKeys(record.rollbackRecoveryCounts, ['validChains', 'rejectedChains'], 'E_CONTROL_COUNTS_MISMATCH');
  assertExactKeys(record.stateMachineCounts, ['validTransitions', 'rejectedTransitions'], 'E_CONTROL_COUNTS_MISMATCH');
  if (record.counts?.core !== 43 || record.counts?.ledgerGeneric !== 3
    || record.counts?.receiptSemantic !== 16 || record.counts?.total !== 62
    || (canonicalAudit && (record.counts?.positiveBaselines !== 62
      || record.counts?.exactReasonMatches !== 62))) {
    policyRed('E_AUDIT_COUNTS_MISMATCH');
  }
  if (record.bindingVerifierCounts?.positiveBaselines !== 7 || record.bindingVerifierCounts?.negativeCases !== 7
    || record.bindingVerifierCounts?.robustnessGreen !== 1
    || record.bootstrapIntegrityCounts?.positiveBaselines !== 3 || record.bootstrapIntegrityCounts?.negativeCases !== 3
    || record.preReceiptTransitionCounts?.positiveBaselines !== 5 || record.preReceiptTransitionCounts?.negativeCases !== 3
    || record.rollbackRecoveryCounts?.validChains !== 1 || record.rollbackRecoveryCounts?.rejectedChains !== 5
    || record.stateMachineCounts?.validTransitions !== 7 || record.stateMachineCounts?.rejectedTransitions !== 7) {
    policyRed('E_CONTROL_COUNTS_MISMATCH');
  }
}

const ROLLBACK_RECOVERY_KEYS = Object.freeze([
  'lineageReceiptSha', 'revokedFunctionalSha', 'rollbackTargetSha',
  'revocationCommitSha', 'rollbackFunctionalSha', 'rollbackReceiptSha',
  'revocationRecordPath', 'revocationRecordSha256', 'revocationParentSha',
  'rollbackFunctionalParentSha', 'rollbackReceiptParentSha', 'evidenceParentSha',
]);

function validateRollbackRecoveryShape(recovery) {
  assertExactKeys(recovery, ROLLBACK_RECOVERY_KEYS, 'E_ROLLBACK_LINEAGE_MISMATCH:schema');
  for (const field of ROLLBACK_RECOVERY_KEYS) {
    if (field === 'revocationRecordPath') {
      if (typeof recovery[field] !== 'string'
        || !recovery[field].startsWith(`${EVIDENCE_REVOCATIONS_DIR}/`)) {
        policyRed(`E_ROLLBACK_LINEAGE_MISMATCH:${field}`);
      }
    } else if (field === 'revocationRecordSha256') {
      if (!SHA256_RE.test(recovery[field] ?? '')) policyRed(`E_ROLLBACK_LINEAGE_MISMATCH:${field}`);
    } else if (!SHA_RE.test(recovery[field] ?? '')) {
      policyRed(`E_ROLLBACK_LINEAGE_MISMATCH:${field}`);
    }
  }
  return recovery;
}

function validatePublicationProvenance(record, context) {
  const receiptOperation = context.receipt.payload.operation;
  const expectedState = context.functionalState ?? deriveFunctionalPolicyState(context.root, context.functionalSha);
  if (record.receiptSha !== context.receiptSha || record.functionalSha !== context.functionalSha
    || record.receiptOperation !== receiptOperation || record.policyState !== expectedState
    || record.auditTargetSha !== context.receiptSha || record.producerTranche !== 'ARD-11-E-POSTCOMMIT'
    || record.auditMode !== 'receipt-intent' || record.oraclePath !== ORACLE_PATH
    || record.oracleAnchorSha !== context.options.oracleAnchorSha
    || record.oracleSha256 !== context.epoch.oracleSha256 || record.workflowPath !== WORKFLOW_PATH
    || record.workflowAnchorSha !== context.options.workflowAnchorSha
    || record.workflowSha256 !== context.epoch.workflowSha256
    || record.canonicalPath !== context.canonicalPath || record.githubSupplement !== null) {
    policyRed('E_PROVENANCE_MISMATCH');
  }
  if (record.receiptBlobSha256 !== sha256(gitFile(context.root, context.receiptSha, LEDGER_PATH))) {
    policyRed('E_RECEIPT_BLOB_MISMATCH');
  }
}

function verifyInitialEvidenceBytes(root, lineage, options) {
  const { receiptSha, functionalSha, evidenceSha, epoch } = lineage;
  const expectedPaths = bytewise([
    options.indexPath,
    `${options.recordsDir}/${receiptSha}.json`,
    `${options.canonicalDir}/${receiptSha}.json`,
  ]);
  const evidenceParents = gitParents(root, evidenceSha);
  if (evidenceParents.length !== 1 || evidenceParents[0] !== receiptSha) policyRed('E_RECEIPT_SHA_MISMATCH');
  const scope = commitScope(root, evidenceSha);
  const unexpected = scope.find((path) => !expectedPaths.includes(path));
  if (unexpected) policyRed(`E_SCOPE_FORBIDDEN:${unexpected}`);
  const canonicalPath = `${options.canonicalDir}/${receiptSha}.json`;
  if (!scope.includes(canonicalPath)) policyRed(`E_CANONICAL_EVIDENCE_MISSING:${canonicalPath}`);
  const missingExpected = expectedPaths.find((path) => !scope.includes(path));
  if (missingExpected) policyRed(`E_EXPECTED_EVIDENCE_MISSING:${missingExpected}`);

  const parentIndex = gitFile(root, receiptSha, options.indexPath, Buffer.alloc(0));
  const candidateIndex = gitFile(root, evidenceSha, options.indexPath);
  const indexEntry = validateIndexEntryShape(validateIndexAppend(parentIndex, candidateIndex));
  const expectedSequence = parentIndex.length === 0 ? 1 : parseIndexBytes(parentIndex).length + 1;
  const recordPath = `${options.recordsDir}/${receiptSha}.json`;
  const recordBytes = gitFile(root, evidenceSha, recordPath);
  const canonicalBytes = gitFile(root, evidenceSha, canonicalPath, Buffer.alloc(0));
  if (canonicalBytes.length === 0) policyRed(`E_CANONICAL_EVIDENCE_MISSING:${canonicalPath}`);
  const record = assertJcsLf(recordBytes, `E_RECORD_INVALID:${recordPath}`);
  const canonical = assertJcsLf(canonicalBytes, `E_CANONICAL_INVALID:${canonicalPath}`);
  const forbidden = forbiddenSelfField(record) ?? forbiddenSelfField(indexEntry);
  if (forbidden) policyRed(`E_SELF_ATTESTATION_FORBIDDEN:${forbidden}`);
  validatePublicationRecordShape(record, 'accept');
  validateCanonicalAuditShape(canonical, { receiptSha, functionalSha, epoch, options });
  if (record.receiptSha !== receiptSha || indexEntry.receiptSha !== receiptSha || canonical.auditTargetSha !== receiptSha) {
    const declared = record.receiptSha;
    if (SHA_RE.test(declared ?? '') && runFile('git', ['-C', root, 'merge-base', '--is-ancestor', declared, evidenceSha]).status !== 0) {
      policyRed('E_RECEIPT_NOT_ANCESTOR');
    }
    policyRed('E_RECEIPT_SHA_MISMATCH');
  }
  if (record.functionalSha !== functionalSha || canonical.testedImplementationSha !== functionalSha) {
    policyRed('E_FUNCTIONAL_SHA_MISMATCH');
  }
  validatePublicationProvenance(record, {
    root, receiptSha, functionalSha, receipt: lineage.receipt, epoch, options, canonicalPath,
  });
  const canonicalDigest = sha256(canonicalBytes);
  if (record.canonicalRawSha256 !== canonicalDigest || indexEntry.canonicalRawSha256 !== canonicalDigest
    || indexEntry.canonicalPath !== canonicalPath || indexEntry.recordPath !== recordPath
    || indexEntry.recordSha256 !== sha256(recordBytes)) {
    policyRed('E_CANONICAL_HASH_MISMATCH');
  }
  if (indexEntry.operation !== 'accept' || indexEntry.sequence !== expectedSequence) {
    policyRed('E_INDEX_SCHEMA_INVALID');
  }
  if (lineage.rollbackRecovery) {
    const actualRecovery = validateRollbackRecoveryShape(record.rollbackRecoveryV1);
    for (const [field, expected] of Object.entries(lineage.rollbackRecovery)) {
      if (actualRecovery?.[field] !== expected) policyRed(`E_ROLLBACK_LINEAGE_MISMATCH:${field}`);
    }
  } else if (record.rollbackRecoveryV1 !== undefined) {
    policyRed('E_ROLLBACK_LINEAGE_MISMATCH:unexpected');
  }
  validateRecordCounts(record);
  validateRecordCounts(canonical, true);
  return { record, recordBytes, canonical, canonicalBytes, canonicalPath, recordPath, indexEntry, indexBytes: candidateIndex };
}

function reproduceCanonicalAudit(root, lineage, options) {
  const cacheKey = canonicalCacheKey(lineage.receiptSha, options.oracleAnchorSha, options.workflowAnchorSha);
  if (controlPlaneDepth > 0 && canonicalReplayCache.has(cacheKey)) {
    const cached = canonicalReplayCache.get(cacheKey);
    const identity = canonicalCacheIdentity(root, lineage.receiptSha, options.oracleAnchorSha, options.workflowAnchorSha);
    if (cached.identity !== identity) policyRed('CANONICAL_REPLAY_CACHE_COLLISION');
    return Buffer.from(cached.bytes);
  }
  const tempRoot = checkedTempRoot('ardesia-policy-binding-');
  try {
    const cloneRoot = join(tempRoot, 'detached-R');
    requireRun('git', ['clone', '--quiet', '--no-hardlinks', '--local', root, cloneRoot], {}, 'E_DETACHED_CLONE_FAILED');
    requireRun('git', ['-C', cloneRoot, 'checkout', '--quiet', '--detach', lineage.receiptSha], {}, 'E_DETACHED_CHECKOUT_FAILED');
    const output = join(tempRoot, 'raw-R');
    const canonicalOutput = join(tempRoot, 'canonical-R.json');
    const saved = {
      candidate: process.env.POLICY_CANDIDATE_SHA,
      event: process.env.POLICY_EVENT_SHA,
      merge: process.env.POLICY_PR_MERGE_SHA,
    };
    process.env.POLICY_CANDIDATE_SHA = '';
    process.env.POLICY_EVENT_SHA = '';
    process.env.POLICY_PR_MERGE_SHA = '';
    try {
      runHarness(cloneRoot, {
        output,
        canonicalOutput,
        candidateSha: lineage.receiptSha,
        oracleAnchorSha: options.oracleAnchorSha,
        workflowAnchorSha: options.workflowAnchorSha,
        auditMode: 'receipt-intent',
        producerTranche: 'ARD-11-E-POSTCOMMIT',
        noMaterialize: true,
        expectedCore: 43,
        expectedLedgerGeneric: 3,
        expectedReceiptSemantic: 16,
      });
    } finally {
      if (saved.candidate === undefined) delete process.env.POLICY_CANDIDATE_SHA;
      else process.env.POLICY_CANDIDATE_SHA = saved.candidate;
      if (saved.event === undefined) delete process.env.POLICY_EVENT_SHA;
      else process.env.POLICY_EVENT_SHA = saved.event;
      if (saved.merge === undefined) delete process.env.POLICY_PR_MERGE_SHA;
      else process.env.POLICY_PR_MERGE_SHA = saved.merge;
    }
    return readFileSync(canonicalOutput);
  } finally {
    removeCheckedTemp(tempRoot, 'ardesia-policy-binding-');
  }
}

function verifyCorrectionEvidence(root, context, parent, candidate, scope, entry, sequence, options) {
  const recordPath = `${options.recordsDir}/${context.receiptSha}.correction.${sequence}.json`;
  const canonicalPath = `${options.canonicalDir}/${context.receiptSha}.correction.${sequence}.json`;
  assertScope(scope, [options.indexPath, recordPath, canonicalPath], 'E_SCOPE_FORBIDDEN');
  if (gitBlob(root, parent, recordPath) || gitBlob(root, parent, canonicalPath)) {
    policyRed(`E_HISTORY_REWRITE:${gitBlob(root, parent, recordPath) ? recordPath : canonicalPath}#${context.receiptSha}`);
  }
  const recordBytes = gitFile(root, candidate, recordPath);
  const canonicalBytes = gitFile(root, candidate, canonicalPath);
  const record = assertJcsLf(recordBytes, 'E_CORRECTION_RECORD_INVALID');
  const canonical = assertJcsLf(canonicalBytes, 'E_CORRECTION_CANONICAL_INVALID');
  const forbidden = forbiddenSelfField(record) ?? forbiddenSelfField(entry);
  if (forbidden) policyRed(`E_SELF_ATTESTATION_FORBIDDEN:${forbidden}`);
  validatePublicationRecordShape(record, entry.operation);
  validateCanonicalAuditShape(canonical, {
    receiptSha: context.receiptSha,
    functionalSha: context.functionalSha,
    epoch: context.epoch,
    options,
  });
  if (record.operation !== entry.operation || !['correction', 'replacement'].includes(record.operation)
    || record.receiptSha !== context.receiptSha || record.sequence !== sequence
    || record.supersedesRecordSha256 !== context.effectiveRecordSha256) {
    policyRed('E_CORRECTION_SUPERSEDES_MISMATCH');
  }
  if (record.operation === 'replacement') {
    if (context.publication !== 'REVOKED' || record.replacesRevocationSha256 !== context.effectiveRevocationSha256) {
      policyRed('E_CORRECTION_SUPERSEDES_MISMATCH');
    }
  } else if (context.publication === 'REVOKED') {
    policyRed(`E_BINDING_REVOKED:${context.receiptSha}`);
  }
  if (record.canonicalPath !== canonicalPath || record.canonicalRawSha256 !== sha256(canonicalBytes)
    || entry.recordPath !== recordPath || entry.recordSha256 !== sha256(recordBytes)
    || entry.canonicalPath !== canonicalPath || entry.canonicalRawSha256 !== sha256(canonicalBytes)
    || canonical.auditTargetSha !== context.receiptSha || canonical.testedImplementationSha !== context.functionalSha) {
    policyRed('E_CANONICAL_HASH_MISMATCH');
  }
  validatePublicationProvenance(record, {
    root,
    receiptSha: context.receiptSha,
    functionalSha: context.functionalSha,
    receipt: context.receipt,
    epoch: context.epoch,
    options,
    canonicalPath,
  });
  validateRecordCounts(record);
  validateRecordCounts(canonical, true);
  const rerun = reproduceCanonicalAudit(root, {
    receiptSha: context.receiptSha,
    functionalSha: context.functionalSha,
  }, options);
  if (!rerun.equals(canonicalBytes)) policyRed('E_CANONICAL_REPRO_MISMATCH');
  return {
    record,
    recordBytes,
    canonicalBytes,
    effectiveRecordSha256: sha256(recordBytes),
    effectiveRevocationSha256: null,
  };
}

function validateGenericLedgerEdge(root, parent, candidate) {
  const parentBytes = gitFile(root, parent, LEDGER_PATH, Buffer.alloc(0));
  const candidateBytes = gitFile(root, candidate, LEDGER_PATH, Buffer.alloc(0));
  const suffix = candidateBytes.length >= parentBytes.length && candidateBytes.subarray(0, parentBytes.length).equals(parentBytes)
    ? candidateBytes.subarray(parentBytes.length) : candidateBytes;
  const receiptSignal = containsReceiptSignal(suffix);
  const ledger = evaluateLedgerBuffers(
    parentBytes,
    candidateBytes,
    { parentSha: parent, candidateSha: candidate },
  );
  if (ledger.status === 'RED') policyRed(receiptSignal ? receiptPrimaryReason(ledger.reason) : ledger.reason);
  if (ledger.status === 'GREEN') {
    const raw = JSON.stringify(ledger.parsedObject);
    if (receiptSignal || ledger.parsedObject.task === PENDING_TASK || raw.includes('POSTCOMMIT_BINDING_PENDING')) {
      policyRed('RECEIPT_FUNCTIONAL_COMMIT_NOT_FOUND');
    }
  }
  return ledger;
}

function verifyRollbackTarget(root, targetSha, candidateSha) {
  for (const path of B_PATHS) {
    if (!gitFile(root, targetSha, path).equals(gitFile(root, candidateSha, path))) {
      policyRed(`E_ROLLBACK_LINEAGE_MISMATCH:${path}`);
    }
  }
}

function verifyDescendants(root, lineage, initialEvidence, options) {
  let effective = {
    operation: 'accept',
    publication: 'COMPLETE',
    receiptSha: lineage.receiptSha,
    functionalSha: lineage.functionalSha,
    receipt: lineage.receipt,
    epoch: lineage.epoch,
    effectiveRecordSha256: sha256(initialEvidence.recordBytes),
    effectiveRevocationSha256: null,
    lastAcceptedEvidenceSha: lineage.evidenceSha,
    recovery: null,
  };
  let parent = lineage.evidenceSha;
  let indexBytes = initialEvidence.indexBytes;
  let terminalState = 'ACCEPTED_E';
  for (const candidate of lineage.descendants) {
    const candidateParents = gitParents(root, candidate);
    if (candidateParents.length !== 1 || candidateParents[0] !== parent) {
      policyRed(`E_INTERMEDIATE_OR_MERGE_COMMIT:${candidate}`);
    }
    const scope = commitScope(root, candidate);
    const bIntersection = scope.filter((path) => B_PATHS.includes(path));
    if (bIntersection.length > 0) {
      if (effective.publication !== 'REVOKED' || effective.operation !== 'revocation'
        || effective.recovery?.reasonCode !== 'B_ROLLBACK' || parent !== effective.recovery.revocationCommitSha
        || !arraysEqual(scope, B_PATHS)) {
        policyRed(`E_ROLLBACK_REVOCATION_REQUIRED:${effective.receiptSha}`);
      }
      verifyRollbackTarget(root, effective.recovery.rollbackTargetSha, candidate);
      effective.recovery.functionalRollbackSha = candidate;
      effective.recovery.functionalRollbackParentSha = parent;
      effective.operation = 'rollback-functional';
      terminalState = 'POST_REVOCATION_FUNCTIONAL_PENDING';
      parent = candidate;
      continue;
    }

    if (effective.operation === 'rollback-functional') {
      if (!arraysEqual(scope, [LEDGER_PATH])) policyRed(`E_BINDING_REVOKED:${effective.receiptSha}`);
      const receipt = validateReceiptCommit(root, parent, candidate, 'ACTIVE_GREEN_D0P_B_PENDING', null, {
        oracleAnchorSha: options.oracleAnchorSha,
        oracleSha256: effective.epoch.oracleSha256,
        workflowAnchorSha: options.workflowAnchorSha,
        workflowSha256: effective.epoch.workflowSha256,
      });
      if (receipt.payload.operation !== 'rollback_applied') {
        policyRed(`RECEIPT_OPERATION_POLICY_STATE_MISMATCH:${safeToken(receipt.payload.operation)}:${boundedActual(receipt.payload.policyState)}`);
      }
      effective.recovery.receiptRollbackSha = candidate;
      effective.recovery.receiptRollbackParentSha = parent;
      effective.operation = 'rollback-receipt';
      effective.receipt = receipt;
      terminalState = 'POSTCOMMIT_BINDING_PENDING';
      parent = candidate;
      continue;
    }

    if (effective.operation === 'rollback-receipt') {
      const newLineage = {
        epoch: lineage.epoch,
        functionalSha: effective.recovery.functionalRollbackSha,
        receiptSha: effective.recovery.receiptRollbackSha,
        receipt: effective.receipt,
        evidenceSha: candidate,
        rollbackRecovery: {
          lineageReceiptSha: effective.recovery.lineageReceiptSha,
          revokedFunctionalSha: effective.recovery.revokedFunctionalSha,
          rollbackTargetSha: effective.recovery.rollbackTargetSha,
          revocationCommitSha: effective.recovery.revocationCommitSha,
          rollbackFunctionalSha: effective.recovery.functionalRollbackSha,
          rollbackReceiptSha: effective.recovery.receiptRollbackSha,
          revocationRecordPath: effective.recovery.revocationRecordPath,
          revocationRecordSha256: effective.recovery.revocationRecordSha256,
          revocationParentSha: effective.recovery.revocationParentSha,
          rollbackFunctionalParentSha: effective.recovery.functionalRollbackParentSha,
          rollbackReceiptParentSha: effective.recovery.receiptRollbackParentSha,
          evidenceParentSha: effective.recovery.receiptRollbackSha,
        },
      };
      const acceptance = verifyInitialEvidenceBytes(root, newLineage, options);
      const rerun = reproduceCanonicalAudit(root, newLineage, options);
      if (!rerun.equals(acceptance.canonicalBytes)) policyRed('E_CANONICAL_REPRO_MISMATCH');
      indexBytes = acceptance.indexBytes;
      effective = {
        operation: 'accept',
        publication: 'COMPLETE',
        receiptSha: newLineage.receiptSha,
        functionalSha: newLineage.functionalSha,
        receipt: newLineage.receipt,
        epoch: lineage.epoch,
        effectiveRecordSha256: sha256(acceptance.recordBytes),
        effectiveRevocationSha256: null,
        lastAcceptedEvidenceSha: candidate,
        recovery: null,
      };
      terminalState = 'ACCEPTED_E';
      parent = candidate;
      continue;
    }

    const evidenceChanges = scope.filter((path) => path === options.indexPath
      || path.startsWith(`${options.recordsDir}/`) || path.startsWith(`${options.canonicalDir}/`)
      || path.startsWith(`${options.revocationsDir}/`));
    if (evidenceChanges.length === 0) {
      if (effective.publication === 'REVOKED') policyRed(`E_BINDING_REVOKED:${effective.receiptSha}`);
      if (scope.includes(LEDGER_PATH)) validateGenericLedgerEdge(root, parent, candidate);
      terminalState = 'ACCEPTED_E_DESCENDANT';
      parent = candidate;
      continue;
    }

    for (const path of evidenceChanges) {
      if (path === options.indexPath) continue;
      if (gitBlob(root, parent, path)) policyRed(`E_HISTORY_REWRITE:${path}#${effective.receiptSha}`);
    }
    const candidateIndex = gitFile(root, candidate, options.indexPath);
    const entry = validateIndexEntryShape(validateIndexAppend(
      indexBytes,
      candidateIndex,
      `E_HISTORY_REWRITE:${options.indexPath}#${effective.receiptSha}`,
    ));
    const sequence = parseIndexBytes(indexBytes).length + 1;
    if (entry.sequence !== sequence || entry.receiptSha !== effective.receiptSha) policyRed('E_INDEX_SEQUENCE_INVALID');
    if (entry.operation === 'revocation') {
      const revocationPath = `${options.revocationsDir}/${effective.receiptSha}.revocation.${sequence}.json`;
      assertScope(scope, [options.indexPath, revocationPath], 'E_REVOCATION_SCOPE_INVALID');
      const revocationBytes = gitFile(root, candidate, revocationPath);
      const revocation = assertJcsLf(revocationBytes, 'E_REVOCATION_RECORD_INVALID');
      const revocationForbidden = forbiddenSelfField(revocation) ?? forbiddenSelfField(entry);
      if (revocationForbidden) policyRed(`E_SELF_ATTESTATION_FORBIDDEN:${revocationForbidden}`);
      validateRevocationRecordShape(revocation);
      if (revocation.operation !== 'revocation' || revocation.status !== 'REVOKED'
        || revocation.receiptSha !== effective.receiptSha || !/^[A-Z0-9_]+$/u.test(revocation.reasonCode ?? '')
        || revocation.sequence !== sequence || revocation.revokesRecordSha256 !== effective.effectiveRecordSha256
        || entry.revocationPath !== revocationPath || entry.revocationSha256 !== sha256(revocationBytes)) {
        policyRed('E_REVOCATION_RECORD_INVALID');
      }
      const rollbackTargetSha = gitParents(root, effective.functionalSha)[0];
      if (!rollbackTargetSha) policyRed('E_REVOCATION_LINEAGE_MISMATCH:rollbackTargetSha');
      if (revocation.reasonCode === 'B_ROLLBACK') {
        const derived = {
          lineageReceiptSha: effective.receiptSha,
          revokedFunctionalSha: effective.functionalSha,
          rollbackTargetSha,
        };
        for (const [field, expected] of Object.entries(derived)) {
          if (revocation[field] !== expected) policyRed(`E_REVOCATION_LINEAGE_MISMATCH:${field}`);
        }
      }
      effective = {
        ...effective,
        operation: 'revocation',
        publication: 'REVOKED',
        effectiveRevocationSha256: sha256(revocationBytes),
        recovery: {
          reasonCode: revocation.reasonCode,
          lineageReceiptSha: effective.receiptSha,
          revokedFunctionalSha: effective.functionalSha,
          rollbackTargetSha,
          revocationCommitSha: candidate,
          revocationParentSha: parent,
          revocationRecordPath: revocationPath,
          revocationRecordSha256: sha256(revocationBytes),
        },
      };
      terminalState = 'E_REVOCATION';
    } else if (entry.operation === 'correction' || entry.operation === 'replacement') {
      const correction = verifyCorrectionEvidence(root, effective, parent, candidate, scope, entry, sequence, options);
      effective = {
        ...effective,
        operation: entry.operation,
        publication: 'COMPLETE',
        effectiveRecordSha256: correction.effectiveRecordSha256,
        effectiveRevocationSha256: correction.effectiveRevocationSha256,
        recovery: null,
      };
      terminalState = 'E_CORRECTION';
    } else {
      policyRed('E_INDEX_OPERATION_INVALID');
    }
    indexBytes = candidateIndex;
    parent = candidate;
  }
  return {
    state: terminalState,
    publication: effective.publication,
    lastCommit: parent,
  };
}

function postcommitBindingCheck(root, options) {
  const identity = validateRuntimeIdentity(root, { candidateSha: options.candidateSha });
  if (!readBytes(root, ORACLE_PATH).equals(gitFile(root, identity.candidateSha, ORACLE_PATH))) {
    policyRed('E_RUNTIME_ORACLE_DRIFT');
  }
  if (identity.candidateSha === options.oracleAnchorSha) {
    const parents = gitParents(root, options.oracleAnchorSha);
    if (parents.length !== 1) policyRed('E_ORACLE_ANCHOR_PARENT_INVALID');
    assertScope(changedPaths(root, parents[0], options.oracleAnchorSha), [ORACLE_PATH], 'E_ORACLE_ANCHOR_SCOPE_INVALID');
    return { state: 'ORACLE_FROZEN_O', publicationBindingV1: 'INCOMPLETE', receiptSha: null };
  }
  const lineage = deriveInitialLineage(root, identity.candidateSha, options.oracleAnchorSha, options.workflowAnchorSha);
  if (!lineage.evidenceSha) {
    return { state: lineage.state, publicationBindingV1: lineage.publication, receiptSha: lineage.receiptSha ?? null };
  }
  const initialEvidence = verifyInitialEvidenceBytes(root, lineage, options);
  const reproduced = reproduceCanonicalAudit(root, lineage, options);
  if (!reproduced.equals(initialEvidence.canonicalBytes)) policyRed('E_CANONICAL_REPRO_MISMATCH');
  const descendant = verifyDescendants(root, lineage, initialEvidence, options);
  if (descendant.publication !== 'COMPLETE') {
    return { state: descendant.state, publicationBindingV1: 'REVOKED', receiptSha: lineage.receiptSha };
  }
  return {
    state: descendant.state,
    publicationBindingV1: 'COMPLETE',
    receiptSha: lineage.receiptSha,
    functionalSha: lineage.functionalSha,
    evidenceSha: lineage.evidenceSha,
    oracleAnchorSha: options.oracleAnchorSha,
    workflowAnchorSha: options.workflowAnchorSha,
  };
}

function parseOptions(args, definitions) {
  const result = {};
  const seen = new Set();
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    const definition = definitions[token];
    if (!definition) policyRed(`CLI_UNKNOWN_ARGUMENT:${safeToken(token)}`);
    if (seen.has(token)) policyRed(`CLI_DUPLICATE_ARGUMENT:${safeToken(token)}`);
    seen.add(token);
    if (definition.kind === 'boolean') {
      result[definition.property] = true;
      continue;
    }
    if (index + 1 >= args.length || args[index + 1].startsWith('--')) {
      policyRed(`CLI_REQUIRED_ARGUMENT_MISSING:${token.slice(2)}`);
    }
    const raw = args[index + 1];
    index += 1;
    if (definition.kind === 'integer') {
      if (!/^(?:0|[1-9][0-9]*)$/u.test(raw)) policyRed(`CLI_ARGUMENT_INVALID:${token.slice(2)}`);
      result[definition.property] = Number(raw);
    } else {
      result[definition.property] = raw;
    }
  }
  for (const [token, definition] of Object.entries(definitions)) {
    if (definition.required && result[definition.property] === undefined) {
      policyRed(`CLI_REQUIRED_ARGUMENT_MISSING:${token.slice(2)}`);
    }
  }
  return result;
}

const HARNESS_OPTIONS = Object.freeze({
  '--output': { property: 'output', kind: 'string', required: true },
  '--candidate-sha': { property: 'candidateSha', kind: 'string' },
  '--oracle-anchor-sha': { property: 'oracleAnchorSha', kind: 'string' },
  '--workflow-anchor-sha': { property: 'workflowAnchorSha', kind: 'string' },
  '--audit-mode': { property: 'auditMode', kind: 'string' },
  '--producer-tranche': { property: 'producerTranche', kind: 'string' },
  '--canonical-output': { property: 'canonicalOutput', kind: 'string' },
  '--no-materialize': { property: 'noMaterialize', kind: 'boolean' },
  '--expected-core': { property: 'expectedCore', kind: 'integer' },
  '--expected-ledger-generic': { property: 'expectedLedgerGeneric', kind: 'integer' },
  '--expected-receipt-semantic': { property: 'expectedReceiptSemantic', kind: 'integer' },
  '--forbid-receipt-semantic-output': { property: 'forbidReceiptSemanticOutput', kind: 'boolean' },
});

const POSTCOMMIT_OPTIONS = Object.freeze({
  '--candidate-sha': { property: 'candidateSha', kind: 'string', required: true },
  '--oracle-anchor-sha': { property: 'oracleAnchorSha', kind: 'string', required: true },
  '--workflow-anchor-sha': { property: 'workflowAnchorSha', kind: 'string', required: true },
  '--pending-task': { property: 'pendingTask', kind: 'string', required: true },
  '--index-path': { property: 'indexPath', kind: 'string', required: true },
  '--records-dir': { property: 'recordsDir', kind: 'string', required: true },
  '--canonical-dir': { property: 'canonicalDir', kind: 'string', required: true },
  '--revocations-dir': { property: 'revocationsDir', kind: 'string', required: true },
  '--state-output': { property: 'stateOutput', kind: 'string', required: true },
  '--audit-mode': { property: 'auditMode', kind: 'string', required: true },
  '--expected-core': { property: 'expectedCore', kind: 'integer', required: true },
  '--expected-ledger-generic': { property: 'expectedLedgerGeneric', kind: 'integer', required: true },
  '--expected-receipt-semantic': { property: 'expectedReceiptSemantic', kind: 'integer', required: true },
});

function validatePostcommitOptions(options, root) {
  if (!SHA_RE.test(options.candidateSha)) policyRed('CANDIDATE_SHA_INVALID');
  if (!SHA_RE.test(options.oracleAnchorSha)) policyRed('ORACLE_ANCHOR_SHA_INVALID');
  if (!SHA_RE.test(options.workflowAnchorSha)) policyRed('WORKFLOW_ANCHOR_SHA_INVALID');
  if (options.pendingTask !== PENDING_TASK) policyRed('PENDING_TASK_INVALID');
  const exact = {
    indexPath: 'docs/ops/evidence/studio-install-policy/index.jsonl',
    recordsDir: 'docs/ops/evidence/studio-install-policy/records',
    canonicalDir: 'docs/ops/evidence/studio-install-policy/canonical',
    revocationsDir: 'docs/ops/evidence/studio-install-policy/revocations',
  };
  for (const [field, expected] of Object.entries(exact)) {
    if (options[field] !== expected) policyRed(`POSTCOMMIT_PATH_INVALID:${field}`);
  }
  if (options.auditMode !== 'receipt-intent') policyRed('AUDIT_MODE_INVALID');
  if (options.expectedCore !== 43 || options.expectedLedgerGeneric !== 3 || options.expectedReceiptSemantic !== 16) {
    policyRed('POSTCOMMIT_EXPECTED_COUNTS_INVALID');
  }
  options.stateOutput = validateOutputFile(options.stateOutput, root);
  return options;
}

function checkCiIdentity(root) {
  const inCi = process.env.GITHUB_ACTIONS === 'true';
  const values = [
    process.env.POLICY_CANDIDATE_SHA ?? '',
    process.env.POLICY_EVENT_SHA ?? '',
    process.env.POLICY_PR_MERGE_SHA ?? '',
  ];
  if (inCi && (values[0] === '' || values[1] === '')) policyRed('CI_IDENTITY_ENV_MISSING');
  if (values.some((value) => value !== '')) validateRuntimeIdentity(root, {});
}

function defaultHarnessOptions(parsed) {
  const auditMode = parsed.auditMode ?? 'functional';
  return {
    ...parsed,
    auditMode,
    expectedCore: parsed.expectedCore ?? 43,
    expectedLedgerGeneric: parsed.expectedLedgerGeneric ?? 3,
    expectedReceiptSemantic: parsed.expectedReceiptSemantic ?? (auditMode === 'receipt-intent' ? 16 : 0),
    forbidReceiptSemanticOutput: parsed.forbidReceiptSemanticOutput ?? auditMode === 'functional',
  };
}

function emitHelp(text) {
  process.stdout.write(`${text}\n`);
}

function main(argv) {
  if (argv.length === 0) policyRed('CLI_REQUIRED_ARGUMENT_MISSING:command');
  if (argv.length === 1 && argv[0] === '--help') {
    emitHelp(HELP.root);
    return;
  }
  const [command, ...args] = argv;
  const root = resolveRepositoryRoot();
  if (command === 'check') {
    if (args.length === 1 && args[0] === '--help') {
      emitHelp(HELP.check);
      return;
    }
    if (args.length !== 0) policyRed(`CLI_UNKNOWN_ARGUMENT:${safeToken(args[0])}`);
    checkCiIdentity(root);
    const result = checkRepository(root);
    process.stdout.write(`${result.state}\n`);
    return;
  }
  if (command === 'harness') {
    if (args.length === 1 && args[0] === '--help') {
      emitHelp(HELP.harness);
      return;
    }
    const options = defaultHarnessOptions(parseOptions(args, HARNESS_OPTIONS));
    const result = runHarness(root, options);
    process.stdout.write(`${result.summary.state}\n`);
    process.stdout.write(`HARNESS_GREEN:${result.summary.counts.total}/${result.summary.counts.total}\n`);
    return;
  }
  if (command === 'postcommit-binding-check') {
    if (args.length === 1 && args[0] === '--help') {
      emitHelp(HELP.postcommit);
      return;
    }
    const options = validatePostcommitOptions(parseOptions(args, POSTCOMMIT_OPTIONS), root);
    const result = postcommitBindingCheck(root, options);
    writeJson(options.stateOutput, {
      schema: 'studio-install-policy-publication-state/v1',
      candidateSha: options.candidateSha,
      ...result,
    });
    process.stdout.write(`${result.state}\n`);
    process.stdout.write(result.publicationBindingV1 === 'COMPLETE'
      ? 'PUBLICATION_BINDING_COMPLETE\n'
      : `${result.publicationBindingV1}\n`);
    return;
  }
  if (command === 'self-test') {
    if (args.length === 1 && args[0] === '--help') {
      emitHelp(HELP.selfTest);
      return;
    }
    if (args.length !== 2 || args[0] !== '--profile' || args[1] !== 'all') {
      policyRed('SELF_TEST_PROFILE_INVALID');
    }
    const result = runSelfTest(root);
    process.stdout.write(`SELF_TEST_GREEN:${canonicalizeJcs(result)}\n`);
    return;
  }
  policyRed(`CLI_UNKNOWN_COMMAND:${safeToken(command)}`);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  if (error instanceof PolicyViolation) {
    process.stderr.write(`${error.reason}\n`);
    process.exitCode = 1;
  } else {
    if (process.env.POLICY_DEBUG === '1') {
      const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
      process.stderr.write(`${detail}\n`);
    }
    process.stderr.write('POLICY_RED:INTERNAL_ERROR\n');
    process.exitCode = 1;
  }
}
