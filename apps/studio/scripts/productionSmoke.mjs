#!/usr/bin/env node
import { chromium } from "@playwright/test"
import { mkdirSync } from "node:fs"
import { dirname, isAbsolute, resolve } from "node:path"

const repoRoot = resolve(import.meta.dirname, "../../..")
const targetUrl = process.env.ARDESIA_STUDIO_SMOKE_URL || "https://ardesia-lavagna.vercel.app"
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
