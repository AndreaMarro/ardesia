// L'alias storico ?vista=lezioni-salvate è la superficie Founder Beta
// Materiali. Questa CoV usa un bundle canonico locale e attraversa nel browser
// reale preview → commit → export → cold reopen → preview replace.
import { createHash } from "node:crypto"
import { test, expect } from "@playwright/test"
import JSZip from "jszip"

const ROOM = "wbstudio-materials-e2e"
const SESSION_ID = "11111111-1111-4111-8111-111111111111"
const EVENT_ID = "22222222-2222-4222-8222-222222222222"
const COMMIT_SHA = "a".repeat(40)

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex")
}

async function canonicalLessonBundle(): Promise<Buffer> {
  const producer = {
    id: "com.example.ardesia.e2e",
    version: "1.0.0",
    commitSha: COMMIT_SHA,
  }
  const payloads = new Map<string, Buffer>([
    ["raw/board.excalidraw", Buffer.from(JSON.stringify({ elements: [], appState: {}, files: {} }))],
    ["raw/events.jsonl", Buffer.from(`${JSON.stringify({
      schemaVersion: 2,
      eventId: EVENT_ID,
      lessonId: ROOM,
      sessionId: SESSION_ID,
      kind: "journal.pointer.down",
      occurredAt: "2026-07-19T20:00:00.000Z",
      actor: { type: "teacher", id: "teacher-e2e" },
      producer,
      causationId: null,
      idempotencyKey: "materials-e2e:pointer-down",
      evidence: [{ ref: "board:materials-e2e", resolution: "verified" }],
      payload: {},
    })}\n`)],
    ["raw/session.yaml", Buffer.from("v: 1\ncreated: 1784491200000\naudioConsent: false\n")],
  ])
  const requiredArtifacts = [
    "raw/board.excalidraw",
    "raw/events.jsonl",
    "raw/session.yaml",
  ]
  const manifest = {
    bundleVersion: 1,
    schemaVersion: 1,
    lessonId: ROOM,
    sessionIds: [SESSION_ID],
    producer,
    requiredArtifacts,
    optionalArtifacts: ["raw/lessonos-events.jsonl", "raw/audio/*"],
    files: [...payloads.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([path, bytes]) => ({
        path,
        bytes: bytes.byteLength,
        sha256: sha256(bytes),
        required: requiredArtifacts.includes(path),
      })),
    lessonOs: { status: "missing", warnings: ["LessonOS snapshot missing"] },
    compatibility: { minimumReaderSchemaVersion: 1, migrations: [] },
  }

  const zip = new JSZip()
  for (const [path, bytes] of payloads) zip.file(path, bytes)
  zip.file("manifest.json", JSON.stringify(manifest))
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
}

test("Materiali locale: preview → commit → export → cold reopen", async ({ page }) => {
  const consoleErrors: string[] = []
  const nonLocalRequests: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`))
  page.on("request", (request) => {
    const host = new URL(request.url()).hostname
    if (host !== "localhost" && host !== "127.0.0.1") nonLocalRequests.push(request.url())
  })

  await page.goto(`/?vista=lezioni-salvate#${ROOM}`)
  await expect(page.getByText("Materiali locali")).toBeVisible()

  await page.getByLabel("Seleziona bundle .lesson").setInputFiles({
    name: "materiali-e2e.lesson",
    mimeType: "application/zip",
    buffer: await canonicalLessonBundle(),
  })
  await expect(page.getByRole("heading", { name: "Anteprima import" })).toBeVisible()
  await expect(page.getByText(ROOM, { exact: true })).toBeVisible()
  await expect(page.getByText("raw/board.excalidraw", { exact: true })).toBeVisible()
  await expect(page.getByText("Crea").first()).toBeVisible()

  await page.getByRole("button", { name: "Importa il bundle" }).click()
  await expect(page.getByRole("status")).toContainText(
    "il bundle non contiene memoria LessonOS",
  )

  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Esporta .lesson" }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe(`lezione-${ROOM}.lesson`)
  const exportedPath = await download.path()
  expect(exportedPath).not.toBeNull()

  await page.reload()
  await expect(page.getByText("Materiali locali")).toBeVisible()
  await page.getByLabel("Seleziona bundle .lesson").setInputFiles(exportedPath!)
  await expect(page.getByRole("heading", { name: "Anteprima import" })).toBeVisible()
  await expect(page.getByText("Sostituisce").first()).toBeVisible()

  expect(nonLocalRequests).toEqual([])
  expect(consoleErrors).toEqual([])
})
