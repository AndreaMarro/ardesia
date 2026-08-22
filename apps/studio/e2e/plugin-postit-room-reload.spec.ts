import { mkdir, stat, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "@playwright/test"
import JSZip from "jszip"

import { createPluginPostitBoardScene } from "../src/design/multiPostitBoardPersistence"
import { createMultiPostitWorkbenchPostits } from "../src/design/multiPostitWorkbenchModel"

const EVIDENCE_DIR = fileURLToPath(new URL("../../../output/playwright", import.meta.url))
const EXPECTED_INSTANCES = ["elab-consumer", "sim-a", "sim-b"] as const

type ViewportTarget = {
  name: "desktop" | "tablet"
  size: { width: number; height: number }
}

type DomRectEvidence = {
  id: string
  instance: string
  plugin: string
  x: number
  y: number
  width: number
  height: number
  text: string
  // #C — quanto del riquadro che Excalidraw gli assegna il post-it riempie
  // davvero. Una soglia assoluta (`width > 120`) non vede un post-it disegnato
  // al 40% di un riquadro da 320px: restano 128px, e passa.
  frameWidth: number
  frameHeight: number
  fillRatioX: number
  fillRatioY: number
}

const VIEWPORTS: ViewportTarget[] = [
  { name: "desktop", size: { width: 1440, height: 960 } },
  { name: "tablet", size: { width: 768, height: 1024 } },
]

async function createPluginPostitLessonBuffer() {
  const scene = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())
  const zip = new JSZip()

  zip.file("raw/board.excalidraw", JSON.stringify(scene))
  zip.file("raw/events.jsonl", "")
  zip.file("raw/session.yaml", "v: 1\naudioConsent: false\n")

  return zip.generateAsync({ type: "nodebuffer", mimeType: "application/zip" })
}

function overlappingPairs(rects: readonly DomRectEvidence[]): string[] {
  const pairs: string[] = []
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i]!
      const b = rects[j]!
      const overlaps =
        a.x < b.x + b.width - 1 &&
        a.x + a.width > b.x + 1 &&
        a.y < b.y + b.height - 1 &&
        a.y + a.height > b.y + 1
      if (overlaps) pairs.push(`${a.instance}:${b.instance}`)
    }
  }
  return pairs
}

for (const target of VIEWPORTS) {
  test(`Room import .lesson renders plugin post-it board in real Excalidraw (${target.name})`, async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text())
    })
    page.on("pageerror", (error) => {
      consoleErrors.push(`pageerror: ${error.message}`)
    })

    await page.setViewportSize(target.size)
    await page.addInitScript(() => {
      window.localStorage.clear()
    })

    const route = `/#p22b-plugin-postit-${target.name}-${testInfo.workerIndex}`
    await page.goto(route)
    await expect(page.locator(".excalidraw")).toBeVisible({ timeout: 20_000 })
    await page.waitForFunction(
      () =>
        (window as Window & { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__
          ?.ready === true,
    )
    const preImportDuplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll<HTMLElement | SVGElement>("[id]"))
        .map((element) => element.id)
        .filter(Boolean)
      return Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index))).filter(
        (id) => !id.startsWith("radix-"),
      )
    })

    const lessonBuffer = await createPluginPostitLessonBuffer()
    await page
      .locator('input[type="file"][accept*=".lesson"]')
      .setInputFiles({
        name: "plugin-postit-room.lesson",
        mimeType: "application/zip",
        buffer: lessonBuffer,
      })

    const postits = page.locator("[data-plugin-postit-instance]")
    await expect(postits).toHaveCount(3, { timeout: 20_000 })

    for (const instanceId of EXPECTED_INSTANCES) {
      await expect(page.locator(`[data-plugin-postit-instance="${instanceId}"]`)).toBeVisible()
    }

    const evidence = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>("[data-plugin-postit-instance]"),
      )
      const elementsWithIds = Array.from(document.querySelectorAll<HTMLElement | SVGElement>("[id]"))
      const ids = elementsWithIds.map((element) => element.id).filter(Boolean)
      const duplicateIds = Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index)))
      const duplicateDetails = duplicateIds
        .filter((id) => !id.startsWith("radix-"))
        .map((id) => ({
          id,
          nodes: elementsWithIds
            .filter((element) => element.id === id)
            .map((element) => {
              const rect = element.getBoundingClientRect()
              const className =
                typeof element.className === "string"
                  ? element.className
                  : element.className.baseVal
              return {
                tagName: element.tagName,
                namespaceURI: element.namespaceURI,
                className,
                role: element.getAttribute("role"),
                ariaLabel: element.getAttribute("aria-label"),
                text: (element.textContent ?? "").trim().slice(0, 160),
                nearestExcalidrawClass:
                  element.closest("[class*='excalidraw']")?.getAttribute("class") ?? null,
                nearestPluginInstance:
                  element.closest("[data-plugin-postit-instance]")?.getAttribute(
                    "data-plugin-postit-instance",
                  ) ?? null,
                rect: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                },
                outerHTML: element.outerHTML.slice(0, 400),
              }
            }),
        }))
      const canvas = document.querySelector<HTMLCanvasElement>(".excalidraw canvas")
      const canvasRect = canvas?.getBoundingClientRect()
      const sceneElements = (
        (window as Window & {
          __MAESTRO_TEST__?: {
            apiRef?: {
              current?: {
                getSceneElements?: () => Array<{
                  id?: string
                  type?: string
                  index?: string | null
                  link?: string | null
                }>
              }
            }
          }
        }).__MAESTRO_TEST__?.apiRef?.current?.getSceneElements?.() ?? []
      ).map((element) => ({
        id: element.id ?? null,
        type: element.type ?? null,
        index: element.index ?? null,
        link: element.link ?? null,
      }))

      return {
        cards: cards
          .map((card) => {
            const rect = card.getBoundingClientRect()
            const frame = (card.parentElement ?? card).getBoundingClientRect()
            return {
              id: card.id,
              instance: card.dataset.pluginPostitInstance ?? "",
              plugin: card.dataset.pluginPostitPlugin ?? "",
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              text: card.innerText.trim(),
              frameWidth: frame.width,
              frameHeight: frame.height,
              fillRatioX: frame.width === 0 ? 0 : rect.width / frame.width,
              fillRatioY: frame.height === 0 ? 0 : rect.height / frame.height,
            }
          })
          .sort((a, b) => a.instance.localeCompare(b.instance)),
        duplicateIds: duplicateIds.filter((id) => !id.startsWith("radix-")),
        duplicateDetails,
        pluginDuplicateIds: duplicateIds.filter((id) => id.startsWith("plugin-postit-")),
        sceneElements,
        canvasRect:
          canvasRect === undefined
            ? null
            : {
                width: canvasRect.width,
                height: canvasRect.height,
              },
      }
    })

    expect(evidence.cards.map((card) => card.instance)).toEqual([...EXPECTED_INSTANCES])
    expect(evidence.cards.filter((card) => card.plugin === "io.ardesia.simulation")).toHaveLength(2)
    expect(evidence.cards.filter((card) => card.plugin === "io.elab.tutor")).toHaveLength(1)
    const postImportNewDuplicateIds = evidence.duplicateIds.filter(
      (id) => !preImportDuplicateIds.includes(id),
    )
    expect(postImportNewDuplicateIds).toEqual([])
    expect(evidence.pluginDuplicateIds).toEqual([])
    expect(overlappingPairs(evidence.cards)).toEqual([])
    expect(evidence.canvasRect?.width).toBeGreaterThan(240)
    expect(evidence.canvasRect?.height).toBeGreaterThan(240)

    for (const card of evidence.cards) {
      expect(card.id).toContain(card.instance)
      expect(card.width).toBeGreaterThan(120)
      expect(card.height).toBeGreaterThan(120)
      expect(card.text.length).toBeGreaterThan(20)
      // Il post-it deve RIEMPIRE il riquadro che Excalidraw gli assegna, e la
      // soglia e' relativa apposta. Misurato il 2026-08-22 sull'albero pulito:
      // riquadri da 560x384 e 740x424, rapporti 0.99. Con `width: "40%"` in
      // `cardStyle` il post-it scende a ~224px e le due asserzioni assolute qui
      // sopra restano VERDI — 224 > 120 — mentre il rapporto crolla a 0.4.
      // La suite unitaria non puo' vedere questo difetto: jsdom non ha
      // geometria, `getBoundingClientRect` restituisce zeri.
      expect(card.frameWidth).toBeGreaterThan(240)
      expect(card.frameHeight).toBeGreaterThan(240)
      expect(card.fillRatioX).toBeGreaterThan(0.9)
      expect(card.fillRatioY).toBeGreaterThan(0.9)
    }

    await mkdir(EVIDENCE_DIR, { recursive: true })
    const screenshotPath = join(EVIDENCE_DIR, `plugin-postit-room-${target.name}.png`)
    const resultPath = join(EVIDENCE_DIR, `plugin-postit-room-${target.name}.json`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    const screenshot = await stat(screenshotPath)
    await writeFile(
      resultPath,
      JSON.stringify(
        {
          route,
          viewport: target.size,
          screenshotPath,
          screenshotBytes: screenshot.size,
          consoleErrors,
          preImportDuplicateIds,
          postImportNewDuplicateIds,
          cards: evidence.cards,
          duplicateIds: evidence.duplicateIds,
          duplicateDetails: evidence.duplicateDetails,
          pluginDuplicateIds: evidence.pluginDuplicateIds,
          sceneElements: evidence.sceneElements,
          canvasRect: evidence.canvasRect,
        },
        null,
        2,
      ),
    )

    expect(screenshot.size).toBeGreaterThan(10_000)
    expect(consoleErrors).toEqual([])
  })
}
