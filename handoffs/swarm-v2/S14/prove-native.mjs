import { createRequire } from 'node:module'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

// One owned browser; run only in the serial host slot. No API/session mock.
const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '../../..')
const require = createRequire(path.join(repo, 'apps/studio/package.json'))
const { chromium } = require('playwright')
const JSZip = require('jszip')
const origin = process.env.ARDESIA_S14_ORIGIN ?? 'http://127.0.0.1:55714'
const source = process.env.ARDESIA_S14_SOURCE_ROOT
const output = process.env.ARDESIA_S14_OUTPUT
if (!source || !output) throw new Error('Set ARDESIA_S14_SOURCE_ROOT and ARDESIA_S14_OUTPUT to the exact rehearsal source and a fresh output directory')
await mkdir(output, { recursive: true })
const sha256 = data => createHash('sha256').update(data).digest('hex')
const fixture = JSON.parse(await readFile(path.join(here, 'native-board-fixture.json'), 'utf8'))
const key = 'maestro:raw/s14-native/board.excalidraw'
const report = { status: 'IN_PROGRESS', sourceBase: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim(),
  sourceFiles: {}, scope: 'local Room composition with real Excalidraw and canonical WorkspaceStore/bundle; no remote ACL certification', checks: [], errors: [] }
for (const rel of ['apps/studio/src/Room.tsx', 'apps/studio/src/whiteboard-library/libraryScene.ts', 'apps/studio/src/whiteboard-library/libraryImport.ts']) {
  report.sourceFiles[rel] = sha256(await readFile(path.join(source, rel)))
}
const check = (name, detail = {}) => {
  report.checks.push({ name, status: 'PASS', ...detail })
  writeFileSync(path.join(output, 'native-progress.json'), JSON.stringify(report, null, 2) + '\n')
  process.stdout.write(name + '\n')
}
let browser
try {
  writeFileSync(path.join(output, 'native-progress.json'), JSON.stringify(report, null, 2) + '\n')
  browser = await chromium.launch({ headless: true, timeout: 30_000 })
  report.browserVersion = browser.version()
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'it-IT', reducedMotion: 'reduce', acceptDownloads: true })
  await context.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem('s14-synthetic-seeded')) {
      localStorage.setItem(key, value)
      sessionStorage.setItem('s14-synthetic-seeded', 'true')
    }
  }, { key, value: Buffer.from(JSON.stringify(fixture)).toString('base64') })
  const page = await context.newPage()
  page.setDefaultTimeout(30_000)
  page.on('pageerror', error => report.errors.push({ kind: 'pageerror', message: error.message }))
  page.on('console', message => { if (message.type() === 'error') report.errors.push({ kind: 'console', message: message.text() }) })
  const ready = () => page.waitForFunction(() => window.__MAESTRO_TEST__?.ready === true)
  const waitCount = (elements, items) => page.waitForFunction(({ key, elements, items }) => {
    const value = localStorage.getItem(key)
    if (!value) return false
    const scene = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value), c => c.charCodeAt(0))))
    return scene.elements.filter(element => !element.isDeleted).length === elements && scene.libraryItems?.length === items
  }, { key, elements, items })
  const openLibrary = async () => {
    const button = page.getByRole('button', { name: 'Apri raccolta della lezione', exact: true })
    if (!await button.isVisible()) await page.getByRole('button', { name: 'Apri menu', exact: true }).click()
    if (!await page.locator('.library-unit:not(:has(.library-unit__adder)) .library-unit__dragger[draggable="true"]').first().isVisible()) await button.click()
  }
  const started = performance.now()
  await page.goto(`${origin}/#s14-native`)
  await ready()
  check('real Room ready', { elapsedMs: Math.round(performance.now() - started) })
  await openLibrary()
  const tile = page.locator('.library-unit:not(:has(.library-unit__adder)) .library-unit__dragger[draggable="true"]').first()
  await tile.waitFor({ state: 'visible' })
  await tile.click()
  await waitCount(1, 1)
  check('native collection inserts a component and canonical Room autosaves')
  await page.reload(); await ready(); await waitCount(1, 1)
  check('cold page reload retains board and collection')
  await page.screenshot({ path: path.join(output, 'library-1440.png'), fullPage: true })

  await page.getByRole('link', { name: 'Materiali', exact: true }).click()
  const exportButton = page.getByRole('button', { name: 'Esporta .lesson', exact: true })
  await exportButton.waitFor({ state: 'visible' })
  const downloaded = page.waitForEvent('download')
  await exportButton.click()
  const download = await downloaded
  const bundlePath = path.join(output, 's14-native.lesson')
  await download.saveAs(bundlePath)
  const bundleBytes = await readFile(bundlePath)
  const zip = await JSZip.loadAsync(bundleBytes)
  const exported = JSON.parse(await zip.file('raw/board.excalidraw').async('text'))
  assert.equal(exported.libraryItems.length, 1)
  assert.equal(exported.elements.filter(element => !element.isDeleted).length, 1)
  check('UI export includes exact native collection in canonical bundle', { sha256: sha256(bundleBytes) })

  // A legacy archive is derived from the real export, with an updated canonical
  // manifest, to make the native replacement test discriminate empty/nonempty.
  const legacy = { ...exported }; delete legacy.libraryItems
  const legacyBytes = Buffer.from(JSON.stringify(legacy))
  zip.file('raw/board.excalidraw', legacyBytes)
  const manifest = JSON.parse(await zip.file('manifest.json').async('text'))
  const record = manifest.files.find(file => file.path === 'raw/board.excalidraw')
  record.bytes = legacyBytes.length; record.sha256 = sha256(legacyBytes)
  zip.file('manifest.json', JSON.stringify(manifest))
  const legacyPath = path.join(output, 's14-legacy.lesson')
  await writeFile(legacyPath, await zip.generateAsync({ type: 'nodebuffer' }))
  await page.getByRole('link', { name: 'Lezione', exact: true }).click(); await ready()
  const media = page.locator('input[type="file"][accept="image/*,application/pdf,.lesson"]')
  await media.setInputFiles(legacyPath)
  await waitCount(1, 0)
  await media.setInputFiles(bundlePath)
  await waitCount(1, 1)
  await openLibrary(); await tile.waitFor({ state: 'visible' })
  check('UI import replaces native library including legacy empty collection')

  await page.evaluate(key => {
    window.__s14SetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('S14 synthetic quota failure', 'QuotaExceededError')
      return window.__s14SetItem.call(this, name, value)
    }
  }, key)
  await tile.click()
  await page.getByText(/Salvataggio non riuscito:.*S14 synthetic quota failure/).waitFor({ state: 'visible' })
  await page.evaluate(() => { Storage.prototype.setItem = window.__s14SetItem; delete window.__s14SetItem })
  await openLibrary(); await tile.click(); await waitCount(3, 1)
  check('quota error is visible; next real edit retries the retained draft')

  await page.setViewportSize({ width: 390, height: 844 })
  await openLibrary(); await tile.waitFor({ state: 'visible' })
  await page.screenshot({ path: path.join(output, 'library-390.png'), fullPage: true })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  assert.equal(overflow, false)
  check('390px collection visible without document overflow')
  await page.setViewportSize({ width: 1440, height: 1000 })
  const libraryButton = page.getByRole('button', { name: 'Apri raccolta della lezione', exact: true })
  await libraryButton.focus(); await page.keyboard.press('Enter')
  check('collection opener reachable by keyboard', { nativeTileKeyboardWorkflow: 'NOT_VERIFIED' })
  await page.goto(`${origin}/?vista=studente#s14-native`)
  await ready()
  assert.equal(await page.getByRole('button', { name: 'Apri raccolta della lezione', exact: true }).count(), 0)
  check('existing local read-only student view has no collection write opener')
  assert.deepEqual(report.errors, [])
  report.status = 'PASS'
} catch (error) {
  report.status = 'FAIL'; report.failure = error.stack ?? String(error)
  throw error
} finally {
  await browser?.close()
  report.browserCleanup = 'CLOSED_OWNED_BROWSER'
  await writeFile(path.join(output, 'native-result.json'), JSON.stringify(report, null, 2) + '\n')
}
