// Sanitized final derivation. Private access values are used for leak checks
// only in memory and never written to the report, log, or errors.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const { request } = createRequire('/private/tmp/ardesia-r2-20261024/package.json')('playwright');
const OUT = __dirname;
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(OUT, name)));
const write = (name, value) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
(async () => {
  const report = read('remote-report.json');
  const binding = read('candidate-binding.json');
  const publicRoutes = report.routes.filter(r => ['/', '/esperienza/'].includes(r.path));
  const exactPolicy = publicRoutes.length === 2 && publicRoutes.every(r => {
    const rules = Object.fromEntries(r.headers.contentSecurityPolicy.split(';').map(rule => rule.trim().split(/\s+/)).filter(parts => parts[0]).map(([key, ...value]) => [key, value.join(' ')]));
    return r.status === 200 && rules['default-src'] === "'none'" && rules['connect-src'] === "'none'" &&
      rules['media-src'] === "'self'" && rules['object-src'] === "'none'" && rules['frame-ancestors'] === "'none'";
  });
  const noindex = publicRoutes.every(r => r.headers.robots.includes('noindex') && r.headers.robots.includes('nofollow'));
  const noStore = publicRoutes.every(r => r.headers.cacheControl === 'no-store');
  const anonymous = await request.newContext({ ignoreHTTPSErrors: false });
  let anonymousStatus;
  try {
    const response = await anonymous.get('https://' + report.host + '/', { maxRedirects: 0, timeout: 20000 });
    anonymousStatus = response.status();
  } finally { await anonymous.dispose(); }
  const summary = {
    schema: 'ardesia.r2.remote-public-final.v1', recordedAtUTC: new Date().toISOString(),
    physicalDeploymentId: binding.physicalDeploymentId, physicalSourceCommit: binding.physicalSourceCommit,
    host: report.host, sourceTreeSha256: binding.sourceTreeSha256, sourceFileCount: binding.sourceFileCount,
    candidateManifestSha256: binding.candidateManifestSha256,
    uploadInventorySha256: sha(fs.readFileSync(path.join(OUT, 'upload-inventory.json'))),
    all20LocalBytesEquivalentToBec05cc: binding.all20LocalBytesEquivalentToBec05cc,
    twentyRemoteAssetsMatch: report.all20AssetBytesMatch,
    journeyChecks: report.journeyChecks, allFourJourneysPass: report.journeysPass,
    cspDirectivesBothPublicPages: exactPolicy, noindexBothPublicPages: noindex, noStoreBothPublicPages: noStore,
    privateAndUnknownRoutes404: report.privatePaths404,
    failedRequests: report.failedRequests, consoleErrors: report.consoleErrorCount, pageErrors: report.pageErrorCount,
    nonProductRequestHosts: report.nonProductRequestHosts,
    nativeBrowserVersion: report.browserVersion, anonymousRootStatus: anonymousStatus,
    authorizedShareProductStatus: report.access.finalStatus,
    screenshotsReviewed: [360, 390, 820, 1440],
    launchAllowed: false, humanScientificApproval: 'NOT_ATTESTED',
    notClaimed: ['Private beta deployment/readiness', 'Human scientific or editorial approval',
      'Launch authorization', 'Screen reader or other browser certification',
      'Native audio playback from an asset hash or a CSP header',
      'A fresh diagnosis of the historical bec05cc runner load-fence failure'],
  };
  summary.pass = report.pass && exactPolicy && noindex && noStore && anonymousStatus === 302 &&
    binding.all20LocalBytesEquivalentToBec05cc;
  write('remote-validation-summary.json', summary);
  const privateUrl = new URL(JSON.parse(fs.readFileSync('/private/tmp/ardesia-r2-vercel-access-36cdba3.json')).url);
  const privateStrings = [privateUrl.href, privateUrl.search, ...[...privateUrl.searchParams.values()].filter(value => value.length >= 8)]
    .filter(Boolean).flatMap(value => [value, encodeURIComponent(value)]);
  const files = fs.readdirSync(OUT).filter(name => fs.statSync(path.join(OUT, name)).isFile() && !['privacy-check.json', 'selection.json'].includes(name));
  const leaks = files.filter(name => {
    const bytes = fs.readFileSync(path.join(OUT, name));
    return privateStrings.some(value => bytes.includes(Buffer.from(value)));
  });
  const authTraces = files.filter(name => /(^|[._-])(har|trace|cookie|storage.?state|auth)([._-]|$)/i.test(name));
  const privacy = { privateValuesReadOnlyInMemory: true, filesChecked: files.length,
    matchedPrivateValues: leaks.length, authTraceFiles: authTraces.length,
    privateQueryOrCookiesPrinted: false, pass: leaks.length === 0 && authTraces.length === 0 };
  write('privacy-check.json', privacy);
  console.log(JSON.stringify({ pass: summary.pass && privacy.pass, journeyChecks: summary.journeyChecks,
    assets: report.assetCount, anonymousRootStatus: anonymousStatus, privacyPass: privacy.pass }));
  if (!summary.pass || !privacy.pass) process.exitCode = 1;
})().catch(error => { console.log(JSON.stringify({ pass: false, errorType: error.name || 'Error' })); process.exitCode = 1; });
