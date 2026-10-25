// Independent bounded probe: evaluates production AST expressions/closures,
// without importing React, writing product files, or starting a test suite.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const repo = process.argv[2] || '/private/tmp/ardesia-r2-20261024';
const requireRepo = createRequire(path.join(repo, 'package.json'));
const ts = requireRepo('typescript');
const base = 'bec05cc8172393b153b7d8ea56ae48f1afa95ef0';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');
const compile = text => ts.transpileModule(`const probe = (${text});`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 }
}).outputText.replace(/^"use strict";\s*/, '').replace(/^const probe = /, '').replace(/;\s*$/, '');
function findNode(source, predicate) {
  let found;
  const ast = ts.createSourceFile('probe.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (!found && predicate(node, ast)) found = node;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (!found) throw new Error('Production AST node missing');
  return found.getText(ast);
}
const replayPath = 'apps/studio/src/ReplayView.tsx';
const replay = read(replayPath);
const callback = findNode(replay, (node, ast) => ts.isArrowFunction(node) &&
  ts.isCallExpression(node.parent) && node.parent.expression.getText(ast) === 'useEffect' &&
  node.parent.arguments[1]?.getText(ast) === '[apiReady, timeline]' &&
  node.getText(ast).includes('canvasRef.current'));
function harness(callbackText, { observer = true, ready = true, canvas = true } = {}) {
  let width = 1440, height = 600, next = 0, notify;
  const frames = new Map(), fits = [], listeners = new Map();
  let disconnects = 0;
  const fitSceneRef = { current: () => fits.push([width, height, 'initial']) };
  const sandbox = {
    apiReady: ready,
    canvasRef: { current: canvas ? { getBoundingClientRect: () => ({ width, height }) } : null },
    fitSceneRef,
    requestAnimationFrame: callback => { frames.set(++next, callback); return next; },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: observer ? class {
      constructor(callback) { notify = callback; }
      observe() {}
      disconnect() { disconnects++; }
    } : undefined,
    window: { addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: name => listeners.delete(name) },
  };
  const cleanup = vm.runInNewContext(`(${compile(callbackText)})()`, sandbox);
  return {
    fits, frames, listeners,
    resize(w, h = 600) { width = w; height = h; (notify || listeners.get('resize'))?.(); },
    tick() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(0)); },
    settle() { this.tick(); this.tick(); },
    reset() { fits.length = 0; },
    latest() { fitSceneRef.current = () => fits.push([width, height, 'latest']); },
    cleanup() { cleanup?.(); },
    get disconnects() { return disconnects; },
  };
}
const checks = [];
function check(id, run) {
  try { if (!run()) throw new Error('Oracle mismatch'); checks.push({ id, pass: true }); }
  catch (error) { checks.push({ id, pass: false, error: error.message }); }
}
check('replay-fit-after-two-layout-frames', () => {
  const h = harness(callback); h.tick(); const pending = h.fits.length === 0;
  h.tick(); return pending && JSON.stringify(h.fits) === '[[1440,600,"initial"]]';
});
check('replay-coalesces-to-latest-positive-bounds', () => {
  const h = harness(callback); h.settle(); h.reset(); h.resize(390); h.resize(820); h.settle();
  return JSON.stringify(h.fits) === '[[820,600,"initial"]]';
});
function zeroWhilePending(callbackText) {
  const h = harness(callbackText); h.settle(); h.reset(); h.resize(390); h.tick(); h.resize(0); h.settle();
  const zero = h.fits.length === 0 && h.frames.size === 0;
  h.resize(390); h.settle();
  return zero && JSON.stringify(h.fits) === '[[390,600,"initial"]]';
}
check('replay-pending-390-zero-390-cancels-and-rearms', () => zeroWhilePending(callback));
for (const ticks of [0, 1]) check(`replay-cleanup-cancels-frame-stage-${ticks + 1}`, () => {
  const h = harness(callback); if (ticks) h.tick(); h.cleanup(); h.settle();
  return h.fits.length === 0 && h.frames.size === 0 && h.disconnects === 1 && h.listeners.size === 0;
});
check('replay-same-bounds-preserves-camera-and-uses-latest-scene-on-resize', () => {
  const h = harness(callback); h.settle(); h.reset(); h.latest(); h.resize(1440); h.settle();
  const noFit = h.fits.length === 0; h.resize(390); h.settle();
  return noFit && JSON.stringify(h.fits) === '[[390,600,"latest"]]';
});
check('replay-height-change-fits', () => {
  const h = harness(callback); h.settle(); h.reset(); h.resize(1440, 300); h.settle();
  return JSON.stringify(h.fits) === '[[1440,300,"initial"]]';
});
check('replay-window-fallback-and-cleanup', () => {
  const h = harness(callback, { observer: false }); h.settle(); h.reset(); h.resize(390); h.settle(); h.cleanup();
  return JSON.stringify(h.fits) === '[[390,600,"initial"]]' && h.listeners.size === 0;
});
for (const options of [{ ready: false }, { canvas: false }]) check(`replay-inactive-${Object.keys(options)[0]}`, () => {
  const h = harness(callback, options); h.settle(); h.cleanup(); return h.fits.length === 0 && h.frames.size === 0;
});
const priorGuard = callback.replace(/if \(bounds\.width <= 0 \|\| bounds\.height <= 0\) \{\s*cancelFit\(\)\s*width = height = -1\s*return\s*\}/,
  'if (bounds.width <= 0 || bounds.height <= 0) return');
if (priorGuard === callback) throw new Error('Counterfactual guard did not match production');
const controlledRed = { id: 'replay-prior-zero-guard-controlled-red',
  pass: zeroWhilePending(priorGuard), expected: false,
  note: 'Counterfactual removes only zero-size cancel/reset; not a claim about native scheduling.' };
const diaryPath = 'apps/web/src/features/Diary.tsx';
const diary = read(diaryPath);
function diaryExpression(source) {
  const attribute = findNode(source, (node, ast) => ts.isJsxAttribute(node) && node.name.getText(ast) === 'activityId' &&
    ts.isJsxSelfClosingElement(node.parent.parent) && node.parent.parent.tagName.getText(ast) === 'DiaryCard');
  return attribute.slice(attribute.indexOf('{') + 1, -1);
}
const predicate = diaryExpression(diary);
const baseDiary = execFileSync('git', ['show', `${base}:${diaryPath}`], { cwd: repo, encoding: 'utf8' });
const basePredicate = diaryExpression(baseDiary);
const cases = [
  ['poiseuille-exact', 'poiseuille-v1', 'fluidi', 'poiseuille-v1', 'fluidi', 'poiseuille-v1'],
  ['taylor-exact', 'taylor-exp-v1', 'analisi', 'taylor-exp-v1', 'analisi', 'taylor-exp-v1'],
  ['hydro-cannot-inherit-poiseuille', 'hydrostatic-v1', 'fluidi', 'poiseuille-v1', 'fluidi', null],
  ['missing-origin', undefined, 'fluidi', 'poiseuille-v1', 'fluidi', null],
  ['null-origin', null, 'fluidi', 'poiseuille-v1', 'fluidi', null],
  ['unknown-origin', 'unknown-v1', 'fluidi', 'poiseuille-v1', 'fluidi', null],
  ['assigned-transfer', 'transfer-another-thread', 'fluidi', 'poiseuille-v1', 'fluidi', null],
  ['different-capability', 'taylor-exp-v1', 'fluidi', 'poiseuille-v1', 'fluidi', null],
  ['different-edition', 'poiseuille-v1', 'other-edition', 'poiseuille-v1', 'fluidi', null],
  ['no-capability', 'poiseuille-v1', 'fluidi', null, 'fluidi', null],
];
function evaluate(expression, item) {
  const [, origin, threadEdition, activityId, editionId] = item;
  return vm.runInNewContext(compile(expression), {
    thread: { originalExerciseId: origin, editionId: threadEdition, conceptId: 'radius-power' }, activityId, editionId,
  });
}
for (const item of cases) check(`diary-${item[0]}`, () => evaluate(predicate, item) === item[5]);
const diaryBaseRed = cases.filter(item => evaluate(basePredicate, item) !== item[5]).map(item => item[0]);
const paths = [replayPath, 'apps/studio/src/__tests__/ReplayView.test.tsx', diaryPath,
  'apps/web/src/__tests__/diary-activity-provenance.test.tsx', 'packages/engine/lessonos/study/diary.py'];
const report = {
  schema: 'ardesia.r2.independent-final-fixes-probe.v1', recordedAt: new Date().toISOString(),
  runtime: process.version, repo, base,
  files: Object.fromEntries(paths.map(file => [file, sha(fs.readFileSync(path.join(repo, file)))])),
  technique: 'Production AST closure/expression evaluation with deterministic fake layout/RAF and canonical provenance matrix; no React/native layout claim.',
  checks, controlledRed, diaryBaseRed,
  passed: checks.filter(item => item.pass).length, failed: checks.filter(item => !item.pass).length,
  limits: ['No broad suite, native browser, real ResizeObserver scheduling, audio decode, or final artifact binding performed by this probe.',
    'Author native final candidate review remains a separate gate.'],
};
fs.writeFileSync(path.join(__dirname, 'probe-result.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, failed: report.failed, controlledRedRejected: !controlledRed.pass,
  diaryBaseRed: diaryBaseRed.length, files: report.files }, null, 2));
if (report.failed || controlledRed.pass || diaryBaseRed.length !== 7) process.exitCode = 1;
