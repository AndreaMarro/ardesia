// Run only while holding the coordinated host browser slot.
// Uses the real Room with the proposed patch loaded from a temporary copy.
// This is candidate composition, never evidence of main/deployment integration.
import { chromium, expect } from '@playwright/test'
import { mkdtemp, mkdir, writeFile, cp, rm, realpath } from 'node:fs/promises'
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../..')
const output = resolve(process.argv[2] ?? resolve(root, '../../work/formula-browser'))
const port = Number(process.env.S14_PORT ?? '55140')
const origin = `http://127.0.0.1:${port}`
const require = createRequire(resolve(root, 'apps/studio/package.json'))
const mathjaxPath = require.resolve('mathjax-full/es5/tex-svg-full.js')
const scratch = await mkdtemp(resolve(root, '../s14-browser-'))
const dependencyRoots = await Promise.all(['node_modules', 'apps/studio/node_modules'].map(path => realpath(resolve(root, path))))
await mkdir(output, { recursive: true })
const report = { origin, browserPath: 'Browser plugin absent; repository Playwright harness', composition: 'Room patch v3 + real MathComposer; source Room unchanged', checks: [], errors: [], expectedFailures: [] }
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
  // A clipped absolute panel does not increase document.scrollWidth. Check
  // its actual bounds and every host control rather than the document alone.
  const bounds = await page.locator('.st-composer-panel').evaluate(panel => {
    const rect = panel.getBoundingClientRect()
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
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, viewport: window.innerWidth, height: window.innerHeight, keyboardTop: plate?.top, controls, foreground }
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
  for (const control of bounds.foreground) expect(control.aboveCanvas, control.label).toBe(true)
  check(`touch composer panel, field and host controls fit at 390x844${keyboardVisible ? ' above open keyboard' : ''}`, bounds)
}
async function scene(page, room) {
  return page.evaluate(async roomId => {
    const h = window.__MAESTRO_TEST__
    if (!h?.store) return null
    await h.flushPersist()
    const raw = await h.store.loadScene(roomId)
    return raw ? JSON.parse(raw) : null
  }, room)
}
async function countImages(page, room) {
  const s = await scene(page, room)
  return s?.elements?.filter(e => e.type === 'image' && !e.isDeleted).length ?? 0
}
function watch(page) {
  page.on('pageerror', error => report.errors.push(error.message))
  page.on('console', message => {
    if (message.type() !== 'error') return
    if (message.location().url.includes('cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js') && message.text().includes('net::ERR_FAILED')) {
      report.expectedFailures.push(message.text()); return
    }
    report.errors.push({ text: message.text(), location: message.location() })
  })
}
try {
  for (const source of ['apps/studio/src/Room.tsx', 'apps/studio/src/__tests__/Room.integration.test.tsx']) {
    await mkdir(dirname(resolve(scratch, source)), { recursive: true })
    await cp(resolve(root, source), resolve(scratch, source))
  }
  const patched = spawnSync('patch', ['-p1', '--batch', '-i', resolve(here, 'room-insert-math-v3.patch')], { cwd: scratch, encoding: 'utf8' })
  if (patched.status !== 0) throw new Error(patched.stdout + patched.stderr)
  const config = resolve(scratch, 'vite.config.ts')
  await writeFile(config, `import base from ${JSON.stringify(resolve(root, 'apps/studio/vite.config.ts'))};
import {readFileSync} from 'node:fs';
export default {...base, cacheDir:${JSON.stringify(resolve(scratch, 'cache'))}, server:{...base.server,fs:{allow:[...(base.server.fs.allow??[]),...${JSON.stringify(dependencyRoots)}]}}, plugins:[{name:'s14-candidate-room-copy',enforce:'pre',load(id){if(${JSON.stringify(process.env.S14_LAYOUT_CONTROL === '1')}&&id.split('?')[0]===${JSON.stringify(resolve(root,'apps/studio/src/formula-composer/MathComposer.css'))})return '';if(id.split('?')[0]===${JSON.stringify(resolve(root, 'apps/studio/src/Room.tsx'))})return readFileSync(${JSON.stringify(resolve(scratch, 'apps/studio/src/Room.tsx'))},'utf8')}},...(base.plugins??[])]};`)
  server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--config', config, '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: resolve(root, 'apps/studio'), stdio: ['ignore', 'pipe', 'pipe'] })
  server.on('exit', (code, signal) => { report.serverExit = { code, signal } })
  for (const stream of [server.stdout, server.stderr]) stream.on('data', chunk => { serverLog += chunk })
  const deadline = Date.now() + 60000
  while (true) {
    if (server.exitCode !== null || server.signalCode !== null) throw new Error(`Vite exited: ${serverLog}`)
    try { if ((await fetch(origin)).ok) break } catch {}
    if (Date.now() > deadline) throw new Error(`Vite timeout: ${serverLog}`)
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  // This scenario measures behavior, not Vite's cold source compilation.
  // Warm only the real editor module/dependency; do not lengthen UI assertions.
  const editorSource = await (await fetch(`${origin}/src/MathComposer.tsx`)).text()
  for (const match of editorSource.matchAll(/["']([^"']*mathlive[^"']*\.js[^"']*)["']/g)) {
    if (match[1].startsWith('/')) await fetch(new URL(match[1], origin))
  }
  browser = await chromium.launch({ headless: true })
  if (process.env.S14_LAYOUT_ONLY === '1') {
    report.scope = process.env.S14_LAYOUT_CONTROL === '1' ? 'layout control: scoped CSS disabled' : 'focused touch layout and native keyboard lifecycle'
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
    const page = await context.newPage(); lastPage = page; watch(page)
    await page.goto(`${origin}/#s14-formula-layout`)
    await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
    await openFormula(page)
    await touchBounds(page)
    const keyboard = page.getByRole('button', { name: 'tastiera matematica', exact: true })
    for (const visible of [true, false, true]) {
      await keyboard.click()
      await expect.poll(() => page.evaluate(() => window.mathVirtualKeyboard.visible)).toBe(visible)
    }
    await expect(page.locator('.ML__keyboard.is-visible .MLK__plate')).toBeInViewport({ ratio: 0.99 })
    await touchBounds(page, true)
    await page.screenshot({ path: resolve(output, 'formula-mobile-keyboard.png') })
    check('touch native keyboard opens, closes and opens with plate visible')
    await page.getByRole('button', { name: 'chiudi', exact: true }).click()
    await expect(page.locator('math-field')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.mathVirtualKeyboard.visible)).toBe(false)
    await expect(page.locator('.ML__keyboard .MLK__plate')).not.toBeInViewport()
    await page.screenshot({ path: resolve(output, 'formula-mobile-closed.png') })
    await openFormula(page)
    await page.getByRole('button', { name: 'chiudi', exact: true }).click()
    await expect(page.locator('math-field')).toHaveCount(0)
    check('touch close hides native keyboard and composer remounts')
    if (report.errors.length) throw new Error(`Unexpected browser errors: ${JSON.stringify(report.errors)}`)
    report.result = 'PASS'
  } else {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage(); lastPage = page; watch(page)
  let releaseFirst, requestedFirst
  const firstRequest = new Promise(resolve => { requestedFirst = resolve })
  let count = 0
  await context.route('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js', async route => {
    count += 1
    if (count === 1) {
      requestedFirst()
      await new Promise(resolve => { releaseFirst = resolve })
      await route.abort('failed')
    } else await route.fulfill({ path: mathjaxPath, contentType: 'application/javascript' })
  })
  const room = 's14-formula-a'
  await page.goto(`${origin}/#${room}`)
  await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  await openFormula(page)
  await native(page, 'set', '\\placeholder[answer]{x}')
  const draft = (await native(page, 'read')).value
  await page.getByRole('button', { name: /inserisci sulla lavagna/ }).click()
  await firstRequest
  expect((await native(page, 'read')).disabled).toBe(true)
  await expect(page.getByRole('button', { name: 'formula', exact: true })).toBeDisabled()
  await page.keyboard.type('z')
  expect((await native(page, 'read')).value).toBe(draft)
  check('native prompt locked and external toggle disabled while rendering')
  releaseFirst()
  await expect(page.locator('.st-composer-panel').getByRole('alert')).toContainText('MathJax CDN load failed')
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
  check('real MathJax SVG inserted in Excalidraw and saved')
  // The normal UI boundary flushes canvas AND journal before cold reopen.
  await page.locator('[data-view-nav-item="continuita"]').click()
  await expect(page.getByTestId('continuity-surface')).toHaveAttribute('data-state', 'sessions')
  await page.locator('[data-view-nav-item="lezione"]').click()
  await expect(page.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  expect(await page.evaluate(async () => {
    const h = window.__MAESTRO_TEST__
    const journal = await h.store.read(h.PATHS.JOURNAL)
    return journal ? (await journal.text()).includes('journal.math.insert') : false
  })).toBe(true)
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
  const cold = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mobile = await cold.newPage(); watch(mobile)
  await mobile.goto(`${origin}/?vista=lezioni-salvate#${room}`)
  await mobile.getByLabel('Seleziona bundle .lesson').setInputFiles(bundle)
  await expect(mobile.getByRole('heading', { name: 'Anteprima import', exact: true })).toBeVisible()
  await mobile.getByRole('button', { name: 'Importa il bundle', exact: true }).click()
  await expect(mobile.getByRole('status')).toBeVisible()
  await mobile.goto(`${origin}/#${room}`)
  await expect(mobile.locator('.excalidraw').first()).toBeVisible({ timeout: 60000 })
  await expect.poll(() => countImages(mobile, room)).toBe(1)
  check('bundle imported in new browser store and reopened on touch viewport')
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
  check('repeat native composer mount/unmount')
  if (report.errors.length) throw new Error(`Unexpected browser errors: ${JSON.stringify(report.errors)}`)
  report.result = 'PASS'
  }
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
  await rm(scratch, { recursive: true, force: true })
}
