// Actual production Studio build: run npm --prefix apps/studio run build first.
// No source transforms, DEV harness, storage writes or synthetic successful renderer.
// The first local MathJax request is deliberately aborted; retry uses the emitted asset.
import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawn, execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../..')
const output = resolve(process.argv[2] ?? '/tmp/ardesia-formula-browser')
const port = Number(process.env.S14_PORT ?? '55140')
const origin = `http://127.0.0.1:${port}`
const require = createRequire(resolve(root, 'apps/studio/package.json'))
const JSZip = require('jszip')
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const sourcePaths = ['apps/studio/src/Room.tsx', 'apps/studio/src/MathComposer.tsx', 'apps/studio/src/formula-composer/MathComposer.css', 'apps/studio/src/latexToImage.ts', 'apps/studio/src/features/living-lesson/serialization.ts']
const sources = await Promise.all(sourcePaths.map(async path => ({ path, sha256: createHash('sha256').update(await readFile(resolve(root, path))).digest('hex') })))
await mkdir(output, { recursive: true })
const report = { origin, commit: sha, sources, composition: 'ordinary production Studio build and Vite preview, actual Room source; no transforms or DEV harness', checks: [], errors: [], expectedFailures: [], limits: ['Local synthetic lesson and Chromium microphone; not a physical device or human scientific review', 'Read-only localStorage observations are cache evidence; portable truth checked in actual exported .lesson', 'No remote CI, deployed build or G0/G1 completion claim'] }
let browser, server, lastPage, serverLog = ''
function check(name, data = true) { report.checks.push({ name, data }); console.log(`PASS ${name}`) }
async function native(page, action, value) {
  return page.locator('math-field').evaluate((mf, input) => {
    if (input.action === 'set') { mf.setValue(input.value, { silenceNotifications: false }); mf.position = mf.lastOffset; mf.focus() }
    if (input.action === 'select') mf.executeCommand('selectAll')
    if (input.action === 'mode') mf.executeCommand(['switchMode', input.value])
    return { value: mf.value, disabled: mf.disabled, readOnly: mf.readOnly }
  }, { action, value })
}
async function openFormula(page) {
  const button = page.getByRole('button', { name: 'formula', exact: true })
  if (!(await button.isVisible())) await page.getByRole('button', { name: 'Apri menu', exact: true }).click()
  await button.click()
  await expect(page.locator('math-field')).toBeVisible()
}
async function touchBounds(page, keyboardVisible = false) {
  await page.locator('.st-composer-panel').hover()
  // A clipped absolute panel does not increase document.scrollWidth. Check
  // its actual bounds and every host control rather than the document alone.
  const bounds = await page.locator('.st-composer-panel').evaluate(panel => {
    const rect = panel.getBoundingClientRect()
    const background = getComputedStyle(panel).backgroundColor
    const controls = [...panel.querySelectorAll('button, math-field, .st-composer-field')].map(control => {
      const r = control.getBoundingClientRect()
      return { label: control.getAttribute('aria-label') || control.textContent, left: r.left, right: r.right, top: r.top, bottom: r.bottom }
    })
    const foreground = [...panel.querySelectorAll('button, math-field, .st-card-title')].map(control => {
      const r = control.getBoundingClientRect()
      const hit = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)
      return { label: control.getAttribute('aria-label') || control.textContent, aboveCanvas: hit !== null && panel.contains(hit) }
    })
    const plate = document.querySelector('.ML__keyboard.is-visible .MLK__plate')?.getBoundingClientRect()
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, viewport: window.innerWidth, height: window.innerHeight, keyboardTop: plate?.top, controls, foreground, background }
  })
  expect(bounds.top).toBeGreaterThanOrEqual(0)
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.height)
  if (keyboardVisible) {
    expect(bounds.keyboardTop).toBeDefined()
    expect(bounds.bottom).toBeLessThanOrEqual(bounds.keyboardTop + 1)
  }
  expect(bounds.left).toBeGreaterThanOrEqual(0)
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport)
  for (const control of bounds.controls) {
    expect(control.top, control.label).toBeGreaterThanOrEqual(bounds.top)
    expect(control.bottom, control.label).toBeLessThanOrEqual(bounds.bottom)
    expect(control.left, control.label).toBeGreaterThanOrEqual(bounds.left)
    expect(control.right, control.label).toBeLessThanOrEqual(bounds.right)
  }
  expect(bounds.background).not.toMatch(/^rgba\(.+,\s*0(?:\.|\))/)
  for (const control of bounds.foreground) expect(control.aboveCanvas, control.label).toBe(true)
  check(`touch composer panel, field and host controls fit at 390x844${keyboardVisible ? ' above open keyboard' : ''}`, bounds)
}
async function persistedText(page, path) {
  return page.evaluate(path => {
    const encoded = localStorage.getItem(`maestro:${path}`)
    return encoded ? new TextDecoder().decode(Uint8Array.from(atob(encoded), value => value.charCodeAt(0))) : null
  }, path)
}
async function scene(page, room) {
  const text = await persistedText(page, `raw/${room}/board.excalidraw`)
  return text ? JSON.parse(text) : null
}
async function countImages(page, room) {
  const s = await scene(page, room)
  return s?.elements?.filter(e => e.type === 'image' && !e.isDeleted).length ?? 0
}
function watch(page) {
  page.on('pageerror', error => report.errors.push(error.message))
  page.on('console', message => {
    if (message.type() !== 'error') return
    if (message.location().url === `${origin}/mathjax/tex-svg-full.js` && message.text().includes('net::ERR_FAILED')) {
      report.expectedFailures.push(message.text()); return
    }
    report.errors.push({ text: message.text(), location: message.location() })
  })
}
try {
  server = spawn(process.execPath, [resolve(root, 'apps/studio/node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: resolve(root, 'apps/studio'), stdio: ['ignore', 'pipe', 'pipe'] })
  server.on('exit', (code, signal) => { report.serverExit = { code, signal } })
  for (const stream of [server.stdout, server.stderr]) stream.on('data', chunk => { serverLog += chunk })
  const deadline = Date.now() + 60000
  while (true) {
    if (server.exitCode !== null || server.signalCode !== null) throw new Error(`Vite exited: ${serverLog}`)
    try { if ((await fetch(origin)).ok) break } catch {}
    if (Date.now() > deadline) throw new Error(`Vite timeout: ${serverLog}`)
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  browser = await chromium.launch({ headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] })
  report.browser = browser.version()
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write', 'microphone'], reducedMotion: 'reduce' })
  const page = await context.newPage(); lastPage = page; watch(page)
  let releaseFirst
  let count = 0
  await context.route(`${origin}/mathjax/tex-svg-full.js`, async route => {
    count += 1
    if (count === 1) {
      await new Promise(resolve => { releaseFirst = resolve })
      await route.abort('failed')
    } else await route.continue()
  })
  const room = 's14-formula-a'
  await page.goto(`${origin}/#${room}`)
  await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  expect(await page.evaluate(() => window.__MAESTRO_TEST__)).toBeUndefined()
  check('production Room has no DEV test harness')
  // Create an actual editorial chapter before the formula board save.
  await page.getByRole('button', { name: 'Registra e collega un passaggio' }).click()
  await expect(page.getByRole('checkbox', { name: 'Solo il mio microfono docente' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Registra audio', exact: true })).toBeDisabled()
  await page.getByLabel('Annotazione del docente', { exact: true }).fill('Formula e passaggio: Q fissata, Δp ∝ 1/r⁴')
  await page.getByRole('button', { name: 'Annota passaggio', exact: true }).click()
  await page.locator('.st-linked-source').getByText(/Formula e passaggio/).waitFor()
  await page.getByRole('checkbox', { name: 'Solo il mio microfono docente' }).check()
  await page.getByRole('button', { name: 'Registra audio', exact: true }).click()
  await page.getByRole('status').getByText('Registrazione in corso', { exact: true }).waitFor()
  await page.waitForTimeout(1200) // Real MediaRecorder duration on the synthetic teacher microphone.
  await page.getByRole('button', { name: 'Termina registrazione', exact: true }).click()
  await page.getByText('Audio salvato nella lezione.', { exact: true }).waitFor()
  await page.locator('summary').filter({ hasText: 'Dai un nome al passaggio salvato' }).click()
  await page.getByLabel('Titolo del passaggio', { exact: true }).fill('Portata costante e formula')
  await page.getByRole('button', { name: 'Salva capitolo', exact: true }).click()
  await page.getByText('Capitolo salvato nella lezione. Lo ritrovi in Rivedi e nel file .lesson.', { exact: true }).waitFor()
  const originalScene = await scene(page, room)
  const editorial = originalScene.livingLesson
  expect(editorial.moments).toHaveLength(1)
  await page.getByRole('button', { name: 'Chiudi pannello passaggio', exact: true }).click()
  check('actual teacher consent and recorded chapter precede formula save', editorial)
  await openFormula(page)
  await native(page, 'set', '\\placeholder[answer]{x}')
  const draft = (await native(page, 'read')).value
  await page.getByRole('button', { name: /inserisci sulla lavagna/ }).click()
  await expect.poll(() => count, { timeout: 30000 }).toBe(1)
  expect((await native(page, 'read')).disabled).toBe(true)
  await expect(page.getByRole('button', { name: 'formula', exact: true })).toBeDisabled()
  await page.keyboard.type('z')
  expect((await native(page, 'read')).value).toBe(draft)
  check('native prompt locked and external toggle disabled while rendering')
  releaseFirst()
  await expect(page.locator('.st-composer-panel').getByRole('alert')).toContainText('MathJax local bundle load failed')
  expect((await native(page, 'read')).value).toBe(draft)
  await expect(page.getByRole('button', { name: 'formula', exact: true })).toBeEnabled()
  check('real Room rejection retains native formula for retry')
  await native(page, 'set', 'x+1')
  await page.getByRole('button', { name: 'frazione', exact: true }).click()
  let value = (await native(page, 'read')).value
  expect(value).toContain('x+1'); expect(value).toContain('\\frac'); expect(value).not.toContain('#?')
  await page.getByRole('button', { name: 'annulla', exact: true }).click()
  expect((await native(page, 'read')).value).toBe('x+1')
  await page.getByRole('button', { name: 'ripeti', exact: true }).click()
  expect((await native(page, 'read')).value).toContain('\\frac')
  check('native template preserves rest of formula and undo/redo')
  await native(page, 'set', 'x+1'); await native(page, 'select')
  await page.getByRole('button', { name: 'radice', exact: true }).click()
  expect((await native(page, 'read')).value).toBe('\\sqrt{x+1}')
  check('native selected expression enters structure')
  for (const mode of ['text', 'latex']) {
    await native(page, 'set', 'x+1'); await native(page, 'mode', mode)
    await page.getByRole('button', { name: 'frazione', exact: true }).click()
    value = (await native(page, 'read')).value
    expect(value).not.toContain('#0'); expect(value).not.toContain('#?')
    expect(value).toContain('\\frac')
    check(`native math template from ${mode} mode`, value)
  }
  await native(page, 'set', 'E=mc^2')
  await page.getByRole('button', { name: 'copia LaTeX', exact: true }).click()
  await expect(page.locator('.st-composer-panel').getByRole('status').filter({ hasText: 'LaTeX copiato.' })).toHaveText('LaTeX copiato.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('E=mc^2')
  check('native expression copied through real clipboard')
  await page.getByRole('button', { name: 'tastiera matematica', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.mathVirtualKeyboard.visible)).toBe(true)
  await expect(page.locator('.ML__keyboard')).toBeVisible()
  await page.screenshot({ path: resolve(output, 'formula-desktop.png') })
  await page.getByRole('button', { name: 'tastiera matematica', exact: true }).click()
  check('native virtual keyboard opens and closes on desktop')
  await page.getByRole('button', { name: /inserisci sulla lavagna/ }).click()
  await expect(page.locator('math-field')).toHaveCount(0)
  await expect.poll(() => countImages(page, room)).toBe(1)
  const formulaScene = await scene(page, room)
  expect(formulaScene.livingLesson).toEqual(editorial)
  const formula = formulaScene.elements.find(element => element.type === 'image' && !element.isDeleted)
  const annotation = originalScene.elements.find(element => element.id === editorial.moments[0].objectRefs[0].elementId)
  expect(formula.y).toBeGreaterThanOrEqual(annotation.y + annotation.height + 24)
  expect(formulaScene.elements.find(element => element.id === annotation.id)).toEqual(annotation)
  check('formula is below the existing annotation, whose exact element is unchanged', { formula: { x: formula.x, y: formula.y, width: formula.width, height: formula.height }, annotation: { x: annotation.x, y: annotation.y, width: annotation.width, height: annotation.height } })
  check('real local MathJax SVG saved by the canonical writer preserves exact editorial chapter')
  // The normal UI boundary flushes canvas AND journal before cold reopen.
  await page.locator('[data-view-nav-item="continuita"]').click()
  await expect(page.getByTestId('continuity-surface')).toHaveAttribute('data-state', 'sessions')
  await page.locator('[data-view-nav-item="lezione"]').click()
  await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  expect(await persistedText(page, `raw/${room}/events.jsonl`)).toContain('journal.math.insert')
  check('normal Continuity navigation flushes formula journal before reopen')
  await page.reload()
  await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  await expect.poll(() => countImages(page, room)).toBe(1)
  await page.screenshot({ path: resolve(output, 'formula-cold-reopen.png') })
  check('saved formula survives Room reload')
  await page.goto(`${origin}/#s14-formula-b`)
  await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  expect(await countImages(page, 's14-formula-b')).toBe(0)
  check('second lesson has no formula from the first')
  await page.goto(`${origin}/#${room}`)
  await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  await page.locator('[data-view-nav-item="materiali"]').click()
  await expect(page.getByText('Materiali locali')).toBeVisible()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Esporta .lesson', exact: true }).click()
  const download = await downloaded
  const bundle = resolve(output, 'formula.lesson'); await download.saveAs(bundle)
  const bundleBytes = await readFile(bundle)
  const zip = await JSZip.loadAsync(bundleBytes)
  const exported = JSON.parse(await zip.file('raw/board.excalidraw').async('string'))
  expect(exported.livingLesson).toEqual(editorial)
  const exportedImages = exported.elements.filter(element => element.type === 'image' && !element.isDeleted)
  expect(exportedImages).toHaveLength(1)
  expect(exported.files[exportedImages[0].fileId].mimeType).toBe('image/svg+xml')
  const journalText = await zip.file('raw/events.jsonl').async('string')
  expect(journalText).toContain('journal.math.insert')
  const manifest = JSON.parse(await zip.file('manifest.json').async('string'))
  expect(manifest.producer.commitSha).toBe(sha)
  report.bundle = { bytes: bundleBytes.byteLength, sha256: createHash('sha256').update(bundleBytes).digest('hex'), manifest }
  check('portable .lesson retains SVG bytes, journal, exact chapter and build SHA')
  const cold = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mobile = await cold.newPage(); lastPage = mobile; watch(mobile)
  await mobile.goto(`${origin}/?vista=lezioni-salvate#${room}`)
  await mobile.getByLabel('Seleziona bundle .lesson').setInputFiles(bundle)
  await expect(mobile.getByRole('heading', { name: 'Anteprima import', exact: true })).toBeVisible()
  await mobile.getByRole('button', { name: 'Importa il bundle', exact: true }).click()
  await expect(mobile.getByText(/^Import completato:/)).toBeVisible()
  await mobile.goto(`${origin}/#${room}`)
  await expect(mobile.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  await expect.poll(() => countImages(mobile, room)).toBe(1)
  expect((await scene(mobile, room)).livingLesson).toEqual(editorial)
  expect(await persistedText(mobile, `raw/${room}/events.jsonl`)).toContain('journal.math.insert')
  check('new mobile browser imports exact formula, journal and editorial chapter from .lesson')
  await openFormula(mobile)
  await touchBounds(mobile)
  const keyboard = mobile.getByRole('button', { name: 'tastiera matematica', exact: true })
  let before = await mobile.evaluate(() => window.mathVirtualKeyboard.visible)
  await keyboard.click()
  await expect.poll(() => mobile.evaluate(() => window.mathVirtualKeyboard.visible)).toBe(!before)
  before = !before
  await keyboard.click()
  await expect.poll(() => mobile.evaluate(() => window.mathVirtualKeyboard.visible)).toBe(!before)
  if (!before) await expect(mobile.locator('.ML__keyboard')).toBeVisible()
  await mobile.screenshot({ path: resolve(output, 'formula-mobile.png') })
  expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  check('touch keyboard toggles both ways without horizontal overflow')
  await keyboard.click()
  await expect.poll(() => mobile.evaluate(() => window.mathVirtualKeyboard.visible)).toBe(true)
  await expect(mobile.locator('.ML__keyboard.is-visible .MLK__plate')).toBeInViewport({ ratio: 0.99 })
  await touchBounds(mobile, true)
  await mobile.screenshot({ path: resolve(output, 'formula-mobile-keyboard.png') })
  await mobile.getByRole('button', { name: 'chiudi', exact: true }).click()
  await expect(mobile.locator('math-field')).toHaveCount(0)
  await openFormula(mobile)
  await mobile.getByRole('button', { name: 'chiudi', exact: true }).click()
  await expect(mobile.locator('math-field')).toHaveCount(0)
  await expect.poll(() => mobile.evaluate(() => window.mathVirtualKeyboard.visible)).toBe(false)
  await expect(mobile.locator('.ML__keyboard .MLK__plate')).not.toBeInViewport()
  await mobile.reload()
  await expect(mobile.locator('.excalidraw').first()).toBeVisible()
  await expect.poll(() => countImages(mobile, room)).toBe(1)
  expect((await scene(mobile, room)).livingLesson).toEqual(editorial)
  check('repeat native mount/unmount closes keyboard and imported formula survives cold mobile reload')
  if (report.errors.length) throw new Error(`Unexpected browser errors: ${JSON.stringify(report.errors)}`)
  report.result = 'PASS'
} catch (error) {
  report.result = 'FAIL'; report.failure = String(error); console.error(error); process.exitCode = 1
  if (lastPage && !lastPage.isClosed()) {
    report.lastScreen = await lastPage.locator('body').innerText().catch(() => 'unavailable')
    await lastPage.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {})
  }
} finally {
  await browser?.close()
  server?.kill('SIGTERM')
  await writeFile(resolve(output, 'vite.log'), serverLog)
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n')
}
