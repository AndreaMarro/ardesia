const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const OUT = __dirname;
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const names = ['README.md', 'verify-remote.cjs', 'finalize-evidence.cjs', 'freeze-evidence.cjs',
  'remote-report.json', 'remote-validation-summary.json', 'candidate-binding.json', 'upload-inventory.json',
  'privacy-check.json', 'remote-run.log', 'finalize.log',
  ...[360, 390, 820, 1440].map(width => `remote-hydro-${width}.png`)];
const privateUrl = new URL(JSON.parse(fs.readFileSync('/private/tmp/ardesia-r2-vercel-access-36cdba3.json')).url);
const privateStrings = [privateUrl.href, privateUrl.search, ...[...privateUrl.searchParams.values()].filter(value => value.length >= 8)]
  .filter(Boolean).flatMap(value => [value, encodeURIComponent(value)]);
const allNames = fs.readdirSync(OUT).filter(name => fs.statSync(path.join(OUT, name)).isFile() && name !== 'selection.json');
const matched = allNames.filter(name => {
  const bytes = fs.readFileSync(path.join(OUT, name));
  return privateStrings.some(value => bytes.includes(Buffer.from(value)));
});
const authTraceFiles = allNames.filter(name => /(^|[._-])(har|trace|cookie|storage.?state|auth)([._-]|$)/i.test(name));
const privacy = { privateValuesReadOnlyInMemory: true, filesChecked: allNames.length,
  matchedPrivateValues: matched.length, authTraceFiles: authTraceFiles.length,
  privateQueryOrCookiesPrinted: false, pass: matched.length === 0 && authTraceFiles.length === 0 };
fs.writeFileSync(path.join(OUT, 'privacy-check.json'), JSON.stringify(privacy, null, 2) + '\n');
const summary = JSON.parse(fs.readFileSync(path.join(OUT, 'remote-validation-summary.json')));
if (!summary.pass || !privacy.pass) throw new Error('SanitizedEvidenceNotReady');
const files = names.map(name => {
  const bytes = fs.readFileSync(path.join(OUT, name));
  return { path: name, bytes: bytes.length, sha256: sha(bytes) };
});
const selection = { schema: 'ardesia.r2.remote-public-selection.v1', recordedAtUTC: new Date().toISOString(),
  status: 'FROZEN_REMOTE_PUBLIC_36CDBA3', physicalDeploymentId: summary.physicalDeploymentId,
  physicalSourceCommit: summary.physicalSourceCommit, sourceTreeSha256: summary.sourceTreeSha256,
  candidateManifestSha256: summary.candidateManifestSha256,
  all20LocalBytesEquivalentToBec05cc: summary.all20LocalBytesEquivalentToBec05cc,
  policy: 'Public product evidence only; no private access values/query, cookies, auth traces or donor assets.', files };
const text = JSON.stringify(selection, null, 2) + '\n';
if (privateStrings.some(value => text.includes(value))) throw new Error('SelectionPrivacyFailure');
fs.writeFileSync(path.join(OUT, 'selection.json'), text);
const mismatches = files.filter(file => sha(fs.readFileSync(path.join(OUT, file.path))) !== file.sha256);
if (mismatches.length) throw new Error('SelectionDigestMismatch');
console.log(JSON.stringify({ status: selection.status, selectedFiles: files.length,
  selectionSha256: sha(text), privacyPass: privacy.pass, hashMismatches: mismatches.length }));
