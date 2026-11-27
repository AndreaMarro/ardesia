import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {sha256, validateBatchSpec, validateCompletion, validateReport} from '../../../tests/corpus/browser-batches-resume.mjs';

const [commit, artifacts] = process.argv.slice(2);
const app = process.cwd();
const blob = name => execFileSync('git', ['show', commit + ':' + name], {cwd:app, maxBuffer: 20_000_000});
const request = JSON.parse(blob('.github/cric-preview-request.json'));
const registryBytes = blob('officina-di-fisica/editorial/batches/registry.json');
assert.equal(sha256(registryBytes),request.registrySha256);
const registry = JSON.parse(registryBytes);
const inputs = {
  protocolSha256: request.protocolFiles['tests/corpus/browser-drafts.mjs'],
  runnerSha256: request.protocolFiles['tests/corpus/browser-batches.mjs'],
  helperSha256: request.protocolFiles['tests/corpus/browser-batches-resume.mjs'],
  runtimeFingerprint: JSON.parse(execFileSync('python3',['-B','-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:app})),
};
assert.equal(inputs.runtimeFingerprint.sha256, request.runtimeSha256);
for (const [name,value] of Object.entries(request.protocolFiles)) {
  assert.equal(sha256(blob('officina-di-fisica/'+name)),value);
  assert.equal(sha256(readFileSync(path.join(app,name))),value);
}
const specs = [...registry.batches.map(batch=>({id:batch.id,questionIds:batch.questionIds})),
  ...(registry.activityBatches||[]).flatMap(batch=>batch.revisionPackage?[{id:batch.revisionPackage,activityIds:batch.activityIds}]:[])];
const passed = [], rejected = [];
for (const spec of specs) {
  const bytes = blob('officina-di-fisica/editorial/batches/'+spec.id+'.json');
  const pack = JSON.parse(bytes);
  validateBatchSpec(pack,spec);
  const folder = path.join(artifacts,spec.id);
  const reportBytes = readFileSync(path.join(folder,'report.json'));
  const markerPath = path.join(folder,'completion.json');
  const exact = {...inputs,batch:spec.id,packageFileSha256:sha256(bytes)};
  if (existsSync(markerPath)) {
    const marker = JSON.parse(readFileSync(markerPath));
    validateCompletion(marker,reportBytes,pack,exact);
    passed.push({id:spec.id,cases:marker.caseCount ?? JSON.parse(reportBytes).records.length,
      packageFileSha256:exact.packageFileSha256,reportSha256:sha256(reportBytes),markerSha256:sha256(readFileSync(markerPath))});
    continue;
  }
  const report = JSON.parse(reportBytes);
  assert.throws(()=>validateReport(report,pack,exact));
  assert.equal(report.packageFileSha256,exact.packageFileSha256);
  assert.deepEqual(report.runtimeFingerprint,inputs.runtimeFingerprint);
  assert.equal(report.testSha256,inputs.protocolSha256);
  const failures = report.records.filter(row=>row.violations.length||row.overflow>1||
    row.formulas.some(formula=>formula.scroll>formula.width+1||formula.typeset>formula.width+1));
  rejected.push({id:spec.id,totalCases:report.records.length,reportSha256:sha256(reportBytes),failures});
}
assert.deepEqual(rejected.map(group=>group.id),['cric-c2-l002']);
assert.deepEqual(rejected[0].failures.map(row=>[row.id,row.width,row.overflow]),[['C2-Q013',320,74]]);
console.log(JSON.stringify({sourceCommit:commit,registrySha256:request.registrySha256,runtimeSha256:request.runtimeSha256,
  packagesExpected:specs.length,positiveTerminalMarkers:passed.length,passed,failed:rejected,
  actualBrowserCasesInPositiveMarkers:passed.reduce((total,row)=>total+row.cases,0),
  humanApproval:'NOT_RUN',publicationAction:'NONE'},null,2));
