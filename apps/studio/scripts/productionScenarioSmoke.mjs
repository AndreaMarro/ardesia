#!/usr/bin/env node
import { chromium } from "@playwright/test"
import { mkdirSync } from "node:fs"
import { dirname, isAbsolute, resolve } from "node:path"

const repoRoot = resolve(import.meta.dirname, "../../..")
const targetUrl = process.env.ARDESIA_STUDIO_SMOKE_URL || "https://ardesia-lavagna.vercel.app"
const timeoutMs = Number(
  process.env.ARDESIA_STUDIO_SCENARIO_TIMEOUT_MS ||
    process.env.ARDESIA_STUDIO_SMOKE_TIMEOUT_MS ||
    "90000",
)
const screenshotPath = resolveOutputPath(
  process.env.ARDESIA_STUDIO_SCENARIO_SCREENSHOT ||
    "output/playwright/studio-production-scenario-smoke.png",
)

function resolveOutputPath(value) {
  return isAbsolute(value) ? value : resolve(repoRoot, value)
}

function pushLimited(list, value) {
  if (list.length < 20) list.push(value)
}

function assertHttpUrl(value) {
  const url = new URL(value)
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`unsupported smoke URL protocol: ${url.protocol}`)
  }
  return url
}

function requireMatch(value, pattern, label) {
  if (!pattern.test(value)) throw new Error(`${label} did not match ${pattern}: ${value}`)
}

async function visible(locator, label, timeout = 20_000) {
  await locator.first().waitFor({ state: "visible", timeout })
  return label
}

async function optionalText(locator) {
  try {
    return (await locator.first().innerText({ timeout: 3_000 })).replace(/\s+/g, " ").trim()
  } catch {
    return null
  }
}

async function main() {
  const target = assertHttpUrl(targetUrl)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 1000 },
  })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []
  const badResponses = []
  const checkpoints = []

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

    checkpoints.push(await visible(page.locator(".st-word"), "brand"))
    checkpoints.push(await visible(page.locator(".excalidraw"), "home canvas"))
    checkpoints.push(await visible(page.locator("[data-view-nav]"), "view nav"))

    const roomHash = new URL(page.url()).hash
    requireMatch(roomHash, /^#wbstudio-[a-z0-9]+$/, "room hash")
    const nav = page.locator("[data-view-nav]").first()
    const lavagnaCurrent = await nav
      .locator('[data-view-nav-item="lavagna"]')
      .getAttribute("aria-current")
    if (lavagnaCurrent !== "page") {
      throw new Error(`expected lavagna nav current=page, got ${lavagnaCurrent}`)
    }

    await nav.locator('[data-view-nav-item="elab-lab"]').click()
    await page.waitForLoadState("networkidle", { timeout: 20_000 })
    checkpoints.push(await visible(page.locator("[data-elab-lab-state=mounted]"), "ELAB Lab"))
    checkpoints.push(await visible(page.locator("[data-elab-lab-citation]"), "book citation"))
    checkpoints.push(await visible(page.locator("[data-elab-lab-solve=ok]"), "ELAB solve"))
    const elabCurrent = await page
      .locator('[data-view-nav-item="elab-lab"]')
      .getAttribute("aria-current")
    if (elabCurrent !== "page") {
      throw new Error(`expected elab-lab nav current=page, got ${elabCurrent}`)
    }
    const elabUrl = page.url()
    const citationExcerpt = await optionalText(page.locator("[data-elab-lab-citation]"))

    await page.locator('[data-view-nav-item="lavagna"]').click()
    await page.waitForLoadState("networkidle", { timeout: 20_000 })
    checkpoints.push(await visible(page.locator(".excalidraw"), "same-room return"))
    const returnedHash = new URL(page.url()).hash
    if (returnedHash !== roomHash) {
      throw new Error(`room hash changed after view round trip: ${roomHash} -> ${returnedHash}`)
    }

    await page.getByRole("button", { name: "Inserisci Simulation Plugin sulla lavagna" }).click()
    checkpoints.push(
      await visible(
        page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]'),
        "simulation scene canvas",
      ),
    )
    checkpoints.push(await visible(page.locator("[data-elab-core-canvas-host] svg"), "core SVG"))

    const catalogSummary = await page
      .locator("[data-elab-catalog-summary]")
      .first()
      .getAttribute("data-elab-catalog-summary", { timeout: 10_000 })
    if (!catalogSummary) throw new Error("missing data-elab-catalog-summary")

    await page.keyboard.press("Escape")
    await page.waitForTimeout(500)
    mkdirSync(dirname(screenshotPath), { recursive: true })
    await page.screenshot({ path: screenshotPath, fullPage: true })

    const title = await page.title()
    const bodyText = (await page.locator("body").innerText({ timeout: 10_000 }))
      .replace(/\s+/g, " ")
      .trim()
    const summary = {
      url: target.toString(),
      httpStatus: response?.status() ?? null,
      finalUrl: page.url(),
      title,
      roomHash,
      elabUrl,
      checkpoints,
      catalogSummary,
      citationExcerpt: citationExcerpt?.slice(0, 240) ?? null,
      bodyExcerpt: bodyText.slice(0, 240),
      consoleErrors,
      pageErrors,
      failedRequests,
      badResponses,
      screenshotPath,
    }

    console.log(JSON.stringify(summary, null, 2))

    const failures = []
    if (response?.status() !== 200) failures.push(`expected HTTP 200, got ${response?.status()}`)
    if (!title.includes("Ardesia")) failures.push(`expected title to include Ardesia, got ${title}`)
    if (checkpoints.length < 8) failures.push(`expected >=8 checkpoints, got ${checkpoints.length}`)
    if (consoleErrors.length > 0) failures.push(`console errors: ${consoleErrors.length}`)
    if (pageErrors.length > 0) failures.push(`page errors: ${pageErrors.length}`)
    if (failedRequests.length > 0) failures.push(`failed requests: ${failedRequests.length}`)
    if (badResponses.length > 0) failures.push(`bad same-origin responses: ${badResponses.length}`)

    if (failures.length > 0) {
      throw new Error(`production scenario smoke failed: ${failures.join("; ")}`)
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
