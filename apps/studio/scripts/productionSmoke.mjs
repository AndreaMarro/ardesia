#!/usr/bin/env node
import { chromium } from "@playwright/test"
import { mkdirSync } from "node:fs"
import { dirname, isAbsolute, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(import.meta.dirname, "../../..")
const targetUrl = process.env.ARDESIA_STUDIO_SMOKE_URL || "https://ardesia-lavagna.vercel.app"
// SHA attesa: se c'e', questo smoke smette di essere un test di raggiungibilita'
// e diventa un test di IDENTITA'. Vedi il commento lungo sotto `expectedSha`.
const expectedSha = (process.env.ARDESIA_STUDIO_SMOKE_EXPECT_SHA || "").trim()
const timeoutMs = Number(process.env.ARDESIA_STUDIO_SMOKE_TIMEOUT_MS || "60000")
const screenshotPath = resolveOutputPath(
  process.env.ARDESIA_STUDIO_SMOKE_SCREENSHOT ||
    "output/playwright/studio-production-smoke.png",
)

function resolveOutputPath(value) {
  return isAbsolute(value) ? value : resolve(repoRoot, value)
}

function pushLimited(list, value) {
  if (list.length < 20) list.push(value)
}

/**
 * Confronto fra SHA dichiarata e SHA servita.
 *
 * Perche' esiste, e non e' un dettaglio: il 2026-07-30 questo script e' uscito
 * **0** contro `https://ardesia-lavagna.vercel.app` **senza che nessun deploy
 * fosse avvenuto**, su un build del 2026-07-10 distante 116 commit. Le sue
 * asserzioni erano HTTP 200, un `<title>` statico dentro `index.html`, la parola
 * «Ardesia» nel body e l'assenza di errori: nessuna di queste distingue «ho
 * deployato la SHA giusta» da «non ho deployato affatto», e l'URL di default e'
 * cablato, quindi il verde si otteneva misurando la produzione vecchia.
 *
 * Regole, tutte fail-closed:
 * - prefisso, minimo 7 caratteri: si accetta sia la forma corta sia quella lunga,
 *   ma non un frammento cosi' breve da combaciare per caso;
 * - se l'attesa c'e' e la SHA servita NON e' leggibile, e' un FALLIMENTO, non un
 *   salto. Un build che non sa dire chi e' non ha dimostrato di essere quello
 *   giusto — ed e' esattamente quello che succede oggi in produzione, che
 *   precede l'introduzione di `window.__ARDESIA_BUILD__`.
 */
const SHA_ESADECIMALE = /^[0-9a-f]{7,40}$/

export function shaMismatch(expected, served) {
  if (expected === "") return null
  const atteso = expected.toLowerCase()
  if (!SHA_ESADECIMALE.test(atteso)) {
    return (
      `ARDESIA_STUDIO_SMOKE_EXPECT_SHA non e' una SHA valida: "${expected}". ` +
      `Attese 7-40 cifre esadecimali (un prefisso piu' corto combacia per caso).`
    )
  }
  if (typeof served !== "string" || served === "") {
    return (
      `SHA attesa ${expected} ma il build servito non dichiara la propria identita' ` +
      `(window.__ARDESIA_BUILD__.commitSha assente). Un build che non sa dire chi e' ` +
      `non ha dimostrato di essere quello giusto: fallisco chiuso.`
    )
  }
  const servita = served.toLowerCase()
  // Anche la SHA SERVITA va validata, e il confronto e' A SENSO UNICO.
  //
  // La prima versione validava solo l'attesa e confrontava simmetricamente
  // (`a.startsWith(b) || b.startsWith(a)`). La revisione avversariale ha
  // eseguito la funzione e ha mostrato due modi di passare con un'identita'
  // fasulla: atteso pieno + servito `"7930"` (il prefisso corto stava dalla
  // parte non validata), e servito `"79304d81-not-a-sha"` (nessun vincolo di
  // forma). Un «fail-closed» con un buco e' peggio di un controllo assente,
  // perche' viene creduto.
  if (!SHA_ESADECIMALE.test(servita)) {
    return (
      `il build servito dichiara un'identita' malformata: "${served}". ` +
      `Attese 7-40 cifre esadecimali.`
    )
  }
  // L'attesa e' il PREFISSO della servita, mai il contrario: la servita e' il
  // dato completo, l'attesa puo' essere la forma corta.
  if (!servita.startsWith(atteso)) {
    return `SHA servita ${served} != SHA attesa ${expected}`
  }
  return null
}

function assertHttpUrl(value) {
  const url = new URL(value)
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`unsupported smoke URL protocol: ${url.protocol}`)
  }
  return url
}

async function main() {
  const target = assertHttpUrl(targetUrl)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []
  const badResponses = []

  page.on("console", (message) => {
    if (message.type() === "error") pushLimited(consoleErrors, message.text())
  })
  page.on("pageerror", (error) => {
    pushLimited(pageErrors, error.message)
  })
  page.on("requestfailed", (request) => {
    pushLimited(
      failedRequests,
      `${request.method()} ${request.url()} :: ${request.failure()?.errorText || "failed"}`,
    )
  })
  page.on("response", (response) => {
    const status = response.status()
    let responseUrl
    try {
      responseUrl = new URL(response.url())
    } catch {
      return
    }
    if (responseUrl.origin === target.origin && status >= 400) {
      pushLimited(badResponses, `${status} ${response.url()}`)
    }
  })

  let response
  try {
    response = await page.goto(target.toString(), { waitUntil: "networkidle", timeout: timeoutMs })
    await page.locator("body").waitFor({ state: "attached", timeout: 15_000 })
    await page.waitForFunction(
      () => document.body?.innerText.includes("Ardesia"),
      undefined,
      { timeout: 15_000 },
    )
    await page.waitForTimeout(1_000)

    // Identita' del build servito. `?? null` e non un throw: l'assenza e' un
    // dato, e va riportata insieme al resto invece di far esplodere lo smoke
    // prima che abbia stampato il riepilogo.
    const servedCommitSha = await page.evaluate(() => {
      const b = globalThis.__ARDESIA_BUILD__
      return b && typeof b.commitSha === "string" ? b.commitSha : null
    })

    const title = await page.title()
    const bodyText = (await page.locator("body").innerText({ timeout: 10_000 }))
      .replace(/\s+/g, " ")
      .trim()
    mkdirSync(dirname(screenshotPath), { recursive: true })
    await page.screenshot({ path: screenshotPath, fullPage: true })

    const summary = {
      url: target.toString(),
      httpStatus: response?.status() ?? null,
      finalUrl: page.url(),
      expectedCommitSha: expectedSha || null,
      servedCommitSha,
      title,
      bodyExcerpt: bodyText.slice(0, 240),
      consoleErrors,
      pageErrors,
      failedRequests,
      badResponses,
      screenshotPath,
    }

    console.log(JSON.stringify(summary, null, 2))

    const failures = []
    const mismatch = shaMismatch(expectedSha, servedCommitSha)
    if (mismatch) failures.push(mismatch)
    if (response?.status() !== 200) failures.push(`expected HTTP 200, got ${response?.status()}`)
    if (!title.includes("Ardesia")) failures.push(`expected title to include Ardesia, got ${title}`)
    if (!bodyText.includes("Ardesia")) failures.push("expected body text to include Ardesia")
    if (consoleErrors.length > 0) failures.push(`console errors: ${consoleErrors.length}`)
    if (pageErrors.length > 0) failures.push(`page errors: ${pageErrors.length}`)
    if (failedRequests.length > 0) failures.push(`failed requests: ${failedRequests.length}`)
    if (badResponses.length > 0) failures.push(`bad same-origin responses: ${badResponses.length}`)

    if (failures.length > 0) {
      throw new Error(`production smoke failed: ${failures.join("; ")}`)
    }
  } finally {
    await browser.close()
  }
}

// Esegui SOLO se lanciato direttamente. Senza questa guardia, un test che
// importa `shaMismatch` da questo modulo farebbe partire `main()` come effetto
// collaterale dell'import: lancerebbe un browser vero contro l'URL di default,
// che e' la PRODUZIONE. Un file di test non deve poter aprire la produzione.
const lanciatoDirettamente =
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (lanciatoDirettamente) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
