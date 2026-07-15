import { expect, test, type Page } from "@playwright/test"

const MODULE = "/src/adapters/indexeddb/indexedDbObservationStore.ts"
let nonLoopbackAttempts: string[] = []

test.use({ serviceWorkers: "block" })

async function preparePage(page: Page) {
  await page.route("**/__k2_blank__", async (route) => {
    await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>K2 IndexedDB proof</title>" })
  })
  await page.goto("/__k2_blank__")
}

async function deletePartition(page: Page, workspaceId: string, audienceSpaceId: string) {
  await page.evaluate(async ({ modulePath, workspaceId, audienceSpaceId }) => {
    const module = await import(modulePath)
    const name = await module.partitionDatabaseName({ workspaceId, audienceSpaceId })
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => reject(new Error("delete blocked"))
    })
  }, { modulePath: MODULE, workspaceId, audienceSpaceId })
}

async function appendRange(page: Page, start: number, end: number, lessonId = "lesson-a") {
  return page.evaluate(async ({ modulePath, start, end, lessonId }) => {
    const { openIndexedDbObservationStore } = await import(modulePath)
    const scope = {
      workspaceId: "workspace-k2",
      audienceSpaceId: "audience-k2",
      lessonId,
      boardId: `board-${lessonId}`,
      pathId: "path-k2",
      meetingId: "meeting-k2",
    }
    const store = await openIndexedDbObservationStore(scope)
    const make = (i: number) => ({
      schemaVersion: 1,
      eventId: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      producer: { producerId: "studio-host", producerKind: "host" },
      scope,
      privacy: "didactic-sensitive",
      authority: "observed",
      occurredAt: "2026-07-15T08:00:00.000Z",
      recordedAt: "2026-07-15T08:00:00.100Z",
      kind: "synthetic.observed",
      payload: { ordinal: i },
      evidence: [],
      consent: { status: "not-required" },
      contentHash: "a".repeat(64),
      sourceIdempotencyKey: `source-${i}`,
    })
    const receipts = await Promise.all(Array.from({ length: end - start + 1 }, (_, offset) => store.append(make(start + offset))))
    store.close()
    return receipts
  }, { modulePath: MODULE, start, end, lessonId })
}

async function readRows(page: Page, workspaceId = "workspace-k2", audienceSpaceId = "audience-k2") {
  return page.evaluate(async ({ modulePath, workspaceId, audienceSpaceId }) => {
    const module = await import(modulePath)
    const name = await module.partitionDatabaseName({ workspaceId, audienceSpaceId })
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name, 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const rows = await new Promise<Array<{ partitionSeq: number; envelope: { eventId: string } }>>((resolve, reject) => {
      const request = db.transaction("observations").objectStore("observations").getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return rows
  }, { modulePath: MODULE, workspaceId, audienceSpaceId })
}

test.beforeEach(async ({ page }) => {
  nonLoopbackAttempts = []
  await page.context().route("**/*", async (route) => {
    const url = new URL(route.request().url())
    if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.port === "5199") {
      await route.continue()
    } else {
      nonLoopbackAttempts.push(`${url.protocol}//${url.host}`)
      await route.abort("blockedbyclient")
    }
  })
  await page.context().routeWebSocket(/.*/, async (route) => {
    const url = new URL(route.url())
    if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.port === "5199") {
      route.connectToServer()
    } else {
      nonLoopbackAttempts.push(`${url.protocol}//${url.host}`)
      await route.close({ code: 1008, reason: "non-loopback denied" })
    }
  })
  await preparePage(page)
  await deletePartition(page, "workspace-k2", "audience-k2")
})

test.afterEach(async ({ context }) => {
  expect(nonLoopbackAttempts).toEqual([])
  expect(context.serviceWorkers()).toEqual([])
})

test("two pages allocate 100 contiguous unique sequences", async ({ page, context }) => {
  const second = await context.newPage()
  await preparePage(second)
  const [left, right] = await Promise.all([appendRange(page, 1, 50), appendRange(second, 51, 100, "lesson-b")])
  const rows = await readRows(second)
  expect(rows.map((row) => row.partitionSeq)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1))
  expect(new Set([...left, ...right].map((receipt) => receipt.partitionSeq)).size).toBe(100)
})

test("exact concurrent retry converges while conflicts do not mutate", async ({ page, context }) => {
  const second = await context.newPage()
  await preparePage(second)
  const [first, retry] = await Promise.all([appendRange(page, 1, 1), appendRange(second, 1, 1)])
  expect(first[0]).toEqual(retry[0])
  expect(first[0].partition).toEqual({ workspaceId: "workspace-k2", audienceSpaceId: "audience-k2" })
  expect(await readRows(page)).toHaveLength(1)

  const conflict = async (target: Page, eventId: string, source: string, value: number) => target.evaluate(async (args) => {
    const { openIndexedDbObservationStore } = await import(args.modulePath)
    const scope = { workspaceId: "workspace-k2", audienceSpaceId: "audience-k2", lessonId: "lesson-a", boardId: "board-a", pathId: "path-k2", meetingId: "meeting-k2" }
    const store = await openIndexedDbObservationStore(scope)
    try {
      await store.append({ schemaVersion: 1, eventId: args.eventId, producer: { producerId: "studio-host", producerKind: "host" }, scope, privacy: "didactic-sensitive", authority: "observed", occurredAt: "2026-07-15T08:00:00.000Z", recordedAt: "2026-07-15T08:00:00.100Z", kind: "synthetic.observed", payload: { ordinal: args.value }, evidence: [], consent: { status: "not-required" }, contentHash: "a".repeat(64), sourceIdempotencyKey: args.source })
      return "none"
    } catch (error) {
      return error instanceof Error && "code" in error ? String(error.code) : "unexpected"
    } finally {
      store.close()
    }
  }, { modulePath: MODULE, eventId, source, value })
  expect(await conflict(page, "00000000-0000-4000-8000-000000000001", "source-1", 2)).toBe("event-conflict")
  expect(await conflict(second, "00000000-0000-4000-8000-000000000002", "source-1", 2)).toBe("source-conflict")
  expect(await readRows(page)).toHaveLength(1)
})

test("aborted raw transaction rolls back its record and generated key", async ({ page }) => {
  await appendRange(page, 1, 1)
  await deletePartition(page, "workspace-k2", "audience-k2")
  const rolledBackKey = await page.evaluate(async ({ modulePath }) => {
    const module = await import(modulePath)
    const scope = { workspaceId: "workspace-k2", audienceSpaceId: "audience-k2", lessonId: "lesson-a", boardId: "board-a", pathId: "path-k2", meetingId: "meeting-k2" }
    const store = await module.openIndexedDbObservationStore(scope)
    store.close()
    const name = await module.partitionDatabaseName(scope)
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open(name, 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
    const tx = db.transaction("observations", "readwrite")
    const request = tx.objectStore("observations").add({ envelope: { eventId: "raw-abort", sourceIdempotencyKey: "raw-abort" } })
    const key = await new Promise<number>((resolve, reject) => { request.onsuccess = () => { resolve(Number(request.result)); tx.abort() }; request.onerror = () => reject(request.error) })
    await new Promise<void>((resolve) => { tx.onabort = () => resolve() })
    db.close()
    return key
  }, { modulePath: MODULE })
  expect(rolledBackKey).toBe(1)
  const receipt = (await appendRange(page, 2, 2))[0]
  expect(receipt.partitionSeq).toBe(1)
  expect((await readRows(page))[0].partitionSeq).toBe(1)
})

test("partitions are independent and append resolves after native transaction completion", async ({ page }) => {
  const committed = await page.evaluate(async ({ modulePath }) => {
    const module = await import(modulePath)
    const scope = { workspaceId: "workspace-k2", audienceSpaceId: "audience-k2", lessonId: "lesson-a", boardId: "board-a", pathId: "path-k2", meetingId: "meeting-k2" }
    const order: string[] = []
    const original = IDBDatabase.prototype.transaction
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase["transaction"]>) {
      const tx = original.apply(this, args)
      if (args[1] === "readwrite") tx.addEventListener("complete", () => order.push("native-complete"), { once: true })
      return tx
    }
    try {
      const store = await module.openIndexedDbObservationStore(scope)
      const receipt = await store.append({ schemaVersion: 1, eventId: "00000000-0000-4000-8000-000000000001", producer: { producerId: "studio-host", producerKind: "host" }, scope, privacy: "didactic-sensitive", authority: "observed", occurredAt: "2026-07-15T08:00:00.000Z", recordedAt: "2026-07-15T08:00:00.100Z", kind: "synthetic.observed", payload: { ordinal: 1 }, evidence: [], consent: { status: "not-required" }, contentHash: "a".repeat(64), sourceIdempotencyKey: "source-1" })
      order.push("public-resolve")
      store.close()
      return { order, receipt }
    } finally {
      IDBDatabase.prototype.transaction = original
    }
  }, { modulePath: MODULE })
  expect(committed.order).toEqual(["native-complete", "public-resolve"])
  const receipt = committed.receipt
  expect((await readRows(page)).map((row) => row.partitionSeq)).toEqual([receipt.partitionSeq])
  await deletePartition(page, "workspace-other", "audience-k2")
  const other = await page.evaluate(async ({ modulePath }) => {
    const module = await import(modulePath)
    const scope = { workspaceId: "workspace-other", audienceSpaceId: "audience-k2", lessonId: "lesson-a", boardId: "board-a", pathId: "path-k2", meetingId: "meeting-k2" }
    const store = await module.openIndexedDbObservationStore(scope)
    const receipt = await store.append({ schemaVersion: 1, eventId: "00000000-0000-4000-8000-000000000999", producer: { producerId: "studio-host", producerKind: "host" }, scope, privacy: "didactic-sensitive", authority: "observed", occurredAt: "2026-07-15T08:00:00.000Z", recordedAt: "2026-07-15T08:00:00.100Z", kind: "synthetic.observed", payload: {}, evidence: [], consent: { status: "not-required" }, contentHash: "a".repeat(64), sourceIdempotencyKey: "source-other" })
    store.close()
    return receipt
  }, { modulePath: MODULE })
  expect(other.partitionSeq).toBe(1)
})

test("a malformed pre-existing v1 schema is rejected before handle return", async ({ page }) => {
  const workspaceId = "workspace-malformed"
  const audienceSpaceId = "audience-k2"
  const results: string[] = []
  for (const malformed of ["wrong-shape", "extra-store", "extra-index"] as const) {
    await deletePartition(page, workspaceId, audienceSpaceId)
    try {
      results.push(await page.evaluate(async ({ modulePath, workspaceId, audienceSpaceId, malformed }) => {
        const module = await import(modulePath)
        const scope = { workspaceId, audienceSpaceId, lessonId: "lesson-a", boardId: "board-a", pathId: "path-k2", meetingId: "meeting-k2" }
        const name = await module.partitionDatabaseName(scope)
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(name, 1)
          request.onupgradeneeded = () => {
            const store = request.result.createObjectStore("observations", {
              keyPath: malformed === "wrong-shape" ? "wrong" : "partitionSeq",
              autoIncrement: malformed !== "wrong-shape",
            })
            store.createIndex("by_event_id", "envelope.eventId", { unique: malformed !== "wrong-shape" })
            store.createIndex("by_source_idempotency", malformed === "wrong-shape" ? "wrong.source" : "envelope.sourceIdempotencyKey", { unique: malformed !== "wrong-shape" })
            if (malformed === "extra-store") request.result.createObjectStore("unexpected")
            if (malformed === "extra-index") store.createIndex("unexpected_unique", "envelope.scope.lessonId", { unique: true })
          }
          request.onsuccess = () => { request.result.close(); resolve() }
          request.onerror = () => reject(request.error)
        })
        try {
          const handle = await module.openIndexedDbObservationStore(scope)
          handle.close()
          return "accepted"
        } catch (error) {
          return error instanceof Error && "code" in error ? String(error.code) : "unexpected"
        }
      }, { modulePath: MODULE, workspaceId, audienceSpaceId, malformed }))
    } finally {
      await deletePartition(page, workspaceId, audienceSpaceId)
    }
  }
  expect(results).toEqual(["unknown", "unknown", "unknown"])
})
