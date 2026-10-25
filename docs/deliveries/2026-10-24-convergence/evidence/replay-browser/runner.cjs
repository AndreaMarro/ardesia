/* Portable QA runner adapted after the historical browser run.
 * The exact executed runner is preserved as runner-original.cjs.
 * Synthetic browser-only data; no source or server edits.
 * Browser plugin failed in root: Browser access requires originating browser context.
 * Parent/user mandate explicitly allows Playwright fallback. Chromium needs the
 * executor's escalated process permission; standard sandbox launch failed before UI.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const PLAYWRIGHT = process.env.ARDESIA_STUDIO_QA_PLAYWRIGHT || path.resolve(__dirname, '../../../../../apps/studio/node_modules/@playwright/test');
const { chromium, expect } = require(PLAYWRIGHT);

const BASE = process.env.ARDESIA_STUDIO_QA_URL || 'http://127.0.0.1:5197';
const OUT = process.env.ARDESIA_STUDIO_QA_OUT || path.join(__dirname, 'run-output');
const CHROMIUM = process.env.ARDESIA_STUDIO_QA_BROWSER; // omitted: use Playwright's installed Chromium
const BASELINE = process.env.ARDESIA_STUDIO_QA_BASELINE || 'operator-supplied working tree; record SHA and diff separately';
const ROOMS = ['audit-replay-a', 'audit-replay-b'];
const evidence = {
  status: 'RUNNING', startedAt: new Date().toISOString(), baseURL: BASE,
  browserPath: CHROMIUM || 'Playwright managed Chromium', playwrightModule: PLAYWRIGHT, baseline: BASELINE,
  syntheticDataOnly: true, storage: 'isolated browser localStorage fallback; not FSA or remote persistence',
  fallbackReason: 'Browser access requires originating browser context; task explicitly permits Playwright fallback',
  flow: 'Room A UI drawing -> canonical journal flush -> replay A -> Room B UI drawing -> replay B -> cold reopen A -> empty room with flat legacy distractor -> mobile replay',
  console: [], requestFailures: [], checks: [], rooms: {}, screenshots: [], limitations: [
    'Replay route is reached by deep link, not by a claimed visible navigation control.',
    'No real microphone, audio capture, semantic association, server auth or FSA is tested.',
    'Synthetic fixture generation/inspection uses the existing DEV harness; drawing uses real mouse and keyboard.',
    'Room snapshots its ID at mount. Hash-only navigation is followed by reload, matching navigateToLesson; hash-only SPA routing is not claimed.',
  ],
};

function collect(page, label) {
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) evidence.console.push({ label, type: message.type(), text: message.text(), location: message.location() });
  });
  page.on('pageerror', error => evidence.console.push({ label, type: 'pageerror', text: error.message, stack: error.stack }));
  page.on('requestfailed', request => evidence.requestFailures.push({ label, url: request.url(), failure: request.failure()?.errorText }));
}

async function identity(page, label) {
  const title = await page.title();
  assert.match(title, /Ardesia/i);
  const text = await page.locator('body').innerText();
  assert.ok(text.includes('Ardesia') && text.length > 30, 'meaningful app content');
  assert.equal(await page.locator('vite-error-overlay').count(), 0, 'no Vite overlay');
  evidence.checks.push({ label, pageIdentity: true, nonblank: true, noFrameworkOverlay: true, title, url: page.url() });
}

async function screenshot(page, name) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const filename = path.join(OUT, name + '.png');
  await page.screenshot({ path: filename, fullPage: false });
  evidence.screenshots.push(filename);
}

async function navigateRoomDocument(page, url) {
  const before = new URL(page.url());
  const target = new URL(url);
  const hashOnly = before.origin === target.origin && before.pathname === target.pathname && before.search === target.search && before.hash !== target.hash;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // Room intentionally snapshots room/query at mount. Its own lesson navigation
  // changes hash and reloads, so a cold-reopen test must do the same.
  if (hashOnly) await page.reload({ waitUntil: 'domcontentloaded' });
}

async function makeRoom(page, room, toolKey, label) {
  await page.goto(`${BASE}/#${room}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__MAESTRO_TEST__?.ready && window.__MAESTRO_TEST__?.apiRef?.current, null, { timeout: 30000 });
  await expect(page.locator('.excalidraw').first()).toBeVisible();
  await identity(page, room + '-edit');
  // Excalidraw shortcuts require canvas focus. The initial unfocused run created
  // real text but no rectangle; explicitly verify the shape before continuing.
  await page.mouse.click(340, 255);
  await page.keyboard.press(toolKey);
  const shapeType = toolKey === 'r' ? 'rectangle' : 'ellipse';
  await page.waitForFunction(type => window.__MAESTRO_TEST__?.apiRef?.current?.getAppState().activeTool.type === type, shapeType);
  await page.mouse.move(440, 255);
  await page.mouse.down();
  await page.mouse.move(930, 470, { steps: 14 });
  await page.mouse.up();
  await page.waitForFunction(type => window.__MAESTRO_TEST__?.apiRef?.current?.getSceneElements().some(el => el.type === type), shapeType);
  await page.keyboard.press('Escape');
  await page.keyboard.press('t');
  await page.mouse.click(485, 310);
  await page.keyboard.insertText(label);
  await page.keyboard.press('Escape');
  await page.waitForFunction(expected => window.__MAESTRO_TEST__?.apiRef?.current?.getSceneElements().some(el => el.type === 'text' && el.text.includes(expected)), label, { timeout: 10000 });
  const observed = await page.evaluate(async ({ room, label }) => {
    const h = window.__MAESTRO_TEST__;
    if (!h?.recorder || !h?.store || h.room !== room) throw new Error('wrong live room harness');
    await h.flushPersist();
    await h.recorder.flush();
    await h.store.saveMeta(room, { v: 1, name: room.endsWith('-a') ? 'Lezione A · Poiseuille' : 'Lezione B · Vincolo', createdAt: Date.now() });
    const blob = await h.store.read(h.PATHS.JOURNAL);
    if (!blob) throw new Error('canonical journal missing');
    const raw = await blob.text();
    const rows = raw.trim().split('\n').map(line => JSON.parse(line));
    const elements = h.apiRef.current.getSceneElements();
    if (!rows.length || rows.some(row => row.schemaVersion !== 2 || row.lessonId !== room)) throw new Error('journal is not canonical room-scoped v2');
    const times = rows.map(row => Date.parse(row.occurredAt));
    const labelElement = elements.find(el => el.type === 'text' && el.text.includes(label));
    if (!labelElement) throw new Error('real text drawing missing');
    // Legacy distractor is deliberate and isolated. The v1 serialization helper
    // is the same one used by replayTimelineRoom.test.ts; no invented v2 payload.
    if (room.endsWith('-a')) {
      const shape = elements.find(el => el.type !== 'text');
      if (!shape?.id || !shape?.type) throw new Error('real shape required for a valid legacy distractor');
      const legacy = { ...shape, id: 'unassigned-legacy-distractor', x: 150, y: 150, strokeColor: '#ff0000' };
      await h.store.write('raw/events.jsonl', new Blob([h.serializeEvents([
        { t: 1000, type: 'element.add', element: legacy },
        { t: 2000, type: 'element.update', element: { ...legacy, width: 180 } },
      ])]));
    }
    return { room, journalPath: h.PATHS.JOURNAL, min: Math.min(...times), max: Math.max(...times),
      eventCount: rows.length, schemaVersions: [...new Set(rows.map(row => row.schemaVersion))],
      eventKinds: [...new Set(rows.map(row => row.kind))], elementIds: elements.map(el => el.id),
      textElementId: labelElement.id, text: labelElement.text, journal: raw };
  }, { room, label });
  assert.ok(observed.eventKinds.includes('journal.element.add'), 'drawing emitted canonical element event');
  await fs.writeFile(path.join(OUT, room + '-events.jsonl'), observed.journal);
  delete observed.journal;
  evidence.rooms[room] = observed;
  await screenshot(page, room + '-drawing-desktop');
  return observed;
}

async function replay(page, room, expected, label) {
  await navigateRoomDocument(page, `${BASE}/?vista=replay#${room}`);
  const timeline = page.getByRole('slider', { name: 'linea del tempo della lezione' });
  await expect(timeline).toBeVisible({ timeout: 30000 });
  await expect(timeline).toHaveAttribute('min', String(expected.min));
  await expect(timeline).toHaveAttribute('max', String(expected.max));
  const bounds = { min: Number(await timeline.getAttribute('min')), max: Number(await timeline.getAttribute('max')) };
  assert.equal(bounds.min, expected.min, `rendered ${room} timeline must start at its own canonical first event, not legacy or another room`);
  assert.equal(bounds.max, expected.max, `rendered ${room} timeline must end at its own canonical last event`);
  await timeline.focus();
  await page.keyboard.press('End');
  await expect(timeline).toHaveValue(String(expected.max));
  await identity(page, label);
  evidence.checks.push({ label, canonicalTimelineMatches: true, legacyDistractorNotRead: bounds.min !== 1000, bounds });
  await screenshot(page, label);
}

(async () => {
  await fs.mkdir(OUT, { recursive: true });
  let browser, page;
  try {
    browser = await chromium.launch({ executablePath: CHROMIUM, headless: true, args: ['--no-sandbox'] });
    evidence.chromiumVersion = browser.version();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
    page = await context.newPage(); collect(page, 'desktop');
    const a = await makeRoom(page, ROOMS[0], 'r', 'LEZIONE A\nPoiseuille: pressione fissata\nr = 2 r0  ->  Q = 16 Q0');
    await replay(page, ROOMS[0], a, 'room-a-replay-desktop');
    const b = await makeRoom(page, ROOMS[1], 'o', 'LEZIONE B\nPortata fissata\nr = r0 / 2  ->  Dp = 16 Dp0');
    assert.notEqual(a.min, b.min, 'room timelines differ');
    assert.equal(a.elementIds.some(id => b.elementIds.includes(id)), false, 'synthetic room elements are disjoint');
    await replay(page, ROOMS[1], b, 'room-b-replay-desktop');
    await replay(page, ROOMS[0], a, 'room-a-cold-reopen-desktop');
    await navigateRoomDocument(page, `${BASE}/?vista=replay#audit-replay-empty`);
    await expect(page.getByText('Ancora nessuna lezione registrata', { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('slider', { name: 'linea del tempo della lezione' })).toHaveCount(0);
    await identity(page, 'empty-room');
    evidence.checks.push({ label: 'empty-room', noFallbackToUnassignedLegacy: true });
    await screenshot(page, 'empty-room-no-legacy');
    const storageState = await context.storageState();
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, storageState });
    const mobilePage = await mobile.newPage(); collect(mobilePage, 'mobile');
    await replay(mobilePage, ROOMS[0], a, 'room-a-replay-mobile');
    const recoverContent = mobilePage.getByRole('button', { name: 'Scorri indietro fino al contenuto', exact: true });
    const initialContentOutsideViewport = await recoverContent.isVisible();
    evidence.mobileInitialContentOutsideViewport = initialContentOutsideViewport;
    if (initialContentOutsideViewport) {
      await recoverContent.tap();
      await expect(recoverContent).not.toBeVisible();
      evidence.checks.push({ label: 'mobile-content-recovery', visibleControlTapSucceeded: true });
      await screenshot(mobilePage, 'room-a-replay-mobile-recovered');
    }
    const layout = await mobilePage.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, height: innerHeight }));
    evidence.mobileLayout = layout;
    assert.ok(layout.scrollWidth <= layout.innerWidth + 1, 'mobile document has no horizontal overflow');
    await mobile.close();
    await context.tracing.stop({ path: path.join(OUT, 'replay-browser-trace.zip') });
    await context.close();
    const knownCertificateErrors = evidence.console.filter(entry => entry.type === 'error' && (
      entry.text === 'Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID' ||
      entry.text.startsWith('MathLive 0.110.0: The math fonts could not be loaded from "https://unpkg.com/mathlive/fonts"')
    ));
    evidence.environmentalFontErrors = knownCertificateErrors.length;
    const relevantErrors = evidence.console.filter(entry => entry.type !== 'warning' && !knownCertificateErrors.includes(entry));
    assert.deepEqual(relevantErrors, [], 'no unexplained app console or page errors');
    evidence.status = knownCertificateErrors.length ? 'PASS_WITH_EXTERNAL_FONT_ERRORS' : 'PASS';
  } catch (error) {
    evidence.status = 'FAIL'; evidence.failure = { message: error.message, stack: error.stack };
    if (page && !page.isClosed()) {
      await screenshot(page, 'failure').catch(() => {});
      evidence.failureBody = (await page.locator('body').innerText().catch(() => '')).slice(0, 5000);
    }
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    evidence.finishedAt = new Date().toISOString();
    await fs.writeFile(path.join(OUT, 'replay-browser-result.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify({ status: evidence.status, checks: evidence.checks.length, rooms: Object.keys(evidence.rooms), consoleEntries: evidence.console.length, screenshots: evidence.screenshots.length, failure: evidence.failure?.message, output: OUT }));
  }
})();
