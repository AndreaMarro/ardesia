import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test"

const ADAPTER = "/src/adapters/indexeddb/indexedDbObservationStore.ts"
const REPLAY = "/src/core/kernel/observationReplay.ts"
const GOLDEN_HASH = "d67f4e192f77ee25adad4cf35372f9182296f097150971bb90710e5deeed0813"
const RUN = `k3-${process.pid}-${crypto.randomUUID()}`

test.describe.configure({ mode: "serial", retries: 0 })

interface Harness {
  context: BrowserContext
  pages: Set<Page>
  databaseNames: Set<string>
  nonLoopbackAttempts: string[]
}

async function createHarness(browser: Browser): Promise<Harness> {
  const context = await browser.newContext({ serviceWorkers: "block" })
  const nonLoopbackAttempts: string[] = []
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url())
    if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.port === "5199") {
      await route.continue()
    } else {
      nonLoopbackAttempts.push(`${url.protocol}//${url.host}`)
      await route.abort("blockedbyclient")
    }
  })
  await context.routeWebSocket(/.*/, async (route) => {
    const url = new URL(route.url())
    if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.port === "5199") {
      route.connectToServer()
    } else {
      nonLoopbackAttempts.push(`${url.protocol}//${url.host}`)
      await route.close({ code: 1008, reason: "non-loopback denied" })
    }
  })
  return { context, pages: new Set(), databaseNames: new Set(), nonLoopbackAttempts }
}

async function newPage(harness: Harness): Promise<Page> {
  const page = await harness.context.newPage()
  harness.pages.add(page)
  await page.route("**/__k3_blank__", async (route) => {
    await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>K3 proof</title>" })
  })
  await page.goto("/__k3_blank__")
  return page
}

function partition(workspaceLabel: string, audienceLabel = workspaceLabel) {
  return {
    workspaceId: `workspace-${RUN}-${workspaceLabel}`,
    audienceSpaceId: `audience-${RUN}-${audienceLabel}`,
    lessonId: `lesson-${workspaceLabel}-${audienceLabel}`,
    boardId: `board-${workspaceLabel}-${audienceLabel}`,
    pathId: `path-${workspaceLabel}-${audienceLabel}`,
    meetingId: `meeting-${workspaceLabel}-${audienceLabel}`,
  }
}

async function registerDatabase(harness: Harness, page: Page, scope: ReturnType<typeof partition>) {
  const name = await page.evaluate(async ({ adapterPath, scope }) => {
    const module = await import(adapterPath)
    return module.partitionDatabaseName(scope)
  }, { adapterPath: ADAPTER, scope })
  harness.databaseNames.add(name)
  return name
}

async function cleanup(harness: Harness) {
  let cleanupPage: Page | undefined
  try {
    for (const page of harness.pages) {
      if (page.isClosed()) continue
      await page.evaluate(() => {
        const state = globalThis as typeof globalThis & {
          __k3Stores?: Array<{ close(): void }>
          __k3Raw?: IDBDatabase[]
        }
        for (const store of state.__k3Stores ?? []) store.close()
        for (const db of state.__k3Raw ?? []) db.close()
        state.__k3Stores = []
        state.__k3Raw = []
      })
      await page.close()
    }
    cleanupPage = await harness.context.newPage()
    await cleanupPage.route("**/__k3_cleanup__", async (route) => {
      await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>K3 cleanup</title>" })
    })
    await cleanupPage.goto("/__k3_cleanup__")
    const remaining = await cleanupPage.evaluate(async (names) => {
      for (const name of names) {
        await new Promise<void>((resolve, reject) => {
          let blocked = false
          const request = indexedDB.deleteDatabase(name)
          const timer = setTimeout(() => reject(new Error(blocked ? "delete blocked timeout" : "delete timeout")), 3_000)
          request.onsuccess = () => { clearTimeout(timer); resolve() }
          request.onerror = () => { clearTimeout(timer); reject(request.error) }
          request.onblocked = () => { blocked = true }
        })
      }
      const databases = await indexedDB.databases()
      return databases.flatMap((entry) => entry.name && names.includes(entry.name) ? [entry.name] : [])
    }, [...harness.databaseNames])
    expect(remaining).toEqual([])
  } finally {
    await cleanupPage?.close().catch(() => undefined)
    for (const page of harness.pages) await page.close().catch(() => undefined)
    await harness.context.close().catch(() => undefined)
  }
}

async function append(page: Page, scope: ReturnType<typeof partition>, ordinals: number[]) {
  return page.evaluate(async ({ adapterPath, scope, ordinals }) => {
    const module = await import(adapterPath)
    const store = await module.openIndexedDbObservationStore(scope)
    const state = globalThis as typeof globalThis & { __k3Stores?: Array<{ close(): void }> }
    state.__k3Stores = [...state.__k3Stores ?? [], store]
    const receipts = []
    for (const ordinal of ordinals) {
      const occurredAt = new Date(Date.UTC(2026, 6, 15, 8, 0, ordinal)).toISOString()
      const recordedAt = new Date(Date.UTC(2026, 6, 15, 8, 0, ordinal, 100)).toISOString()
      receipts.push(await store.append({
        schemaVersion: 1,
        eventId: `00000000-0000-4000-8000-${String(ordinal).padStart(12, "0")}`,
        producer: { producerId: "studio-host", producerKind: "host" },
        scope: { ...scope, lessonId: `lesson-${ordinal}`, boardId: `board-${ordinal}` },
        privacy: "didactic-sensitive",
        authority: "observed",
        occurredAt,
        recordedAt,
        kind: "synthetic.observed",
        payload: { ordinal, points: [ordinal, ordinal + 1] },
        evidence: [],
        consent: { status: "not-required" },
        contentHash: "a".repeat(64),
        sourceIdempotencyKey: `source-${ordinal}`,
      }))
    }
    store.close()
    return receipts
  }, { adapterPath: ADAPTER, scope, ordinals })
}

async function readReplay(page: Page, scope: ReturnType<typeof partition>) {
  return page.evaluate(async ({ adapterPath, replayPath, scope }) => {
    const adapter = await import(adapterPath)
    const replay = await import(replayPath)
    let readonlyComplete = false
    let readonlyTransactions = 0
    let store: Awaited<ReturnType<typeof adapter.openIndexedDbObservationStore>> | undefined
    let original: typeof IDBDatabase.prototype.transaction | undefined
    try {
      store = await adapter.openIndexedDbObservationStore(scope)
      const state = globalThis as typeof globalThis & { __k3Stores?: Array<{ close(): void }> }
      state.__k3Stores = [...state.__k3Stores ?? [], store]
      original = IDBDatabase.prototype.transaction
      IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase["transaction"]>) {
        const tx = original!.apply(this, args)
        if ((args[1] ?? "readonly") === "readonly") {
          readonlyTransactions += 1
          tx.addEventListener("complete", () => { readonlyComplete = true })
        }
        return tx
      }
      const rows = await store.readPartition(scope)
      const readonlyCompleteAtReadResolution = readonlyComplete
      const result = await replay.replayObservationJournal(rows, scope)
      return { ...result, readonlyCompleteAtReadResolution, readonlyTransactions }
    } finally {
      store?.close()
      if (original) IDBDatabase.prototype.transaction = original
    }
  }, { adapterPath: ADAPTER, replayPath: REPLAY, scope })
}

test("shares the hardcoded tagged-structural golden hash with Vitest", async ({ browser }) => {
  const harness = await createHarness(browser)
  try {
    const page = await newPage(harness)
    const result = await page.evaluate(async ({ replayPath, goldenScope }) => {
      const replay = await import(replayPath)
      const rows = [1, 2].map((ordinal) => ({
        partitionSeq: ordinal,
        envelope: {
          schemaVersion: 1,
          eventId: `00000000-0000-4000-8000-${String(ordinal).padStart(12, "0")}`,
          producer: { producerId: "studio-host", producerKind: "host" },
          scope: { ...goldenScope, lessonId: `lesson-${ordinal}`, boardId: `board-${ordinal}` },
          privacy: "didactic-sensitive",
          authority: "observed",
          occurredAt: `2026-07-15T08:00:0${ordinal}.000Z`,
          recordedAt: `2026-07-15T08:00:0${ordinal}.100Z`,
          kind: "synthetic.observed",
          payload: { ordinal, points: [ordinal, ordinal + 1] },
          evidence: [],
          consent: { status: "not-required" },
          contentHash: "a".repeat(64),
          sourceIdempotencyKey: `source-${ordinal}`,
        },
      }))
      return replay.replayObservationJournal(rows.reverse(), goldenScope)
    }, {
      replayPath: REPLAY,
      goldenScope: {
        workspaceId: "workspace-k3-golden",
        audienceSpaceId: "audience-k3-golden",
        lessonId: "lesson-a",
        boardId: "board-a",
        pathId: "path-a",
        meetingId: "meeting-a",
      },
    })
    expect(result.hash).toBe(GOLDEN_HASH)
    expect(harness.nonLoopbackAttempts).toEqual([])
    expect(harness.context.serviceWorkers()).toEqual([])
  } finally {
    await cleanup(harness)
  }
})

test("reads one quiescent journal identically across two pages and reopen", async ({ browser }) => {
  const harness = await createHarness(browser)
  try {
    const first = await newPage(harness)
    const second = await newPage(harness)
    const scope = partition("continuity")
    await registerDatabase(harness, first, scope)
    await append(first, scope, [1, 2])
    await append(second, scope, [3, 4])

    const firstRead = await readReplay(first, scope)
    const secondRead = await readReplay(second, scope)
    expect(firstRead.projection).toEqual(secondRead.projection)
    expect(firstRead.hash).toBe(secondRead.hash)
    expect(firstRead.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(firstRead.readonlyCompleteAtReadResolution).toBe(true)
    expect(secondRead.readonlyCompleteAtReadResolution).toBe(true)
    expect(firstRead.readonlyTransactions).toBe(1)
    expect(secondRead.readonlyTransactions).toBe(1)
    expect(harness.nonLoopbackAttempts).toEqual([])
  } finally {
    await cleanup(harness)
  }
})

test("separates workspace and audience and rejects cross-scope access before DB use", async ({ browser }) => {
  const harness = await createHarness(browser)
  try {
    const page = await newPage(harness)
    const scopes = [
      partition("workspace-a", "audience-shared"),
      partition("workspace-b", "audience-shared"),
      partition("workspace-a", "audience-other"),
    ]
    const names = []
    for (const [index, scope] of scopes.entries()) {
      names.push(await registerDatabase(harness, page, scope))
      await append(page, scope, [20 + index])
    }
    expect(new Set(names).size).toBe(3)
    const observedNames = await page.evaluate(() => indexedDB.databases().then((items) => items.map((item) => item.name)))
    expect(names.every((name) => observedNames.includes(name))).toBe(true)

    const denied = await page.evaluate(async ({ adapterPath, ownScope, otherScope }) => {
      const adapter = await import(adapterPath)
      const store = await adapter.openIndexedDbObservationStore(ownScope)
      const original = IDBDatabase.prototype.transaction
      let transactionCalls = 0
      IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase["transaction"]>) {
        transactionCalls += 1
        return original.apply(this, args)
      }
      try {
        await store.readPartition(otherScope)
        return { code: "accepted", transactionCalls }
      } catch (error) {
        return { code: error instanceof Error && "code" in error ? String(error.code) : "unexpected", transactionCalls }
      } finally {
        IDBDatabase.prototype.transaction = original
        store.close()
      }
    }, { adapterPath: ADAPTER, ownScope: scopes[0], otherScope: scopes[1] })
    expect(denied).toEqual({ code: "scope-mismatch", transactionCalls: 0 })
    expect(harness.nonLoopbackAttempts).toEqual([])
  } finally {
    await cleanup(harness)
  }
})

test("rejects the whole read for raw cross-partition contamination", async ({ browser }) => {
  const harness = await createHarness(browser)
  try {
    const page = await newPage(harness)
    const ownScope = partition("contaminated")
    const otherScope = partition("foreign")
    const name = await registerDatabase(harness, page, ownScope)
    await append(page, ownScope, [1])
    const result = await page.evaluate(async ({ adapterPath, ownScope, otherScope, name }) => {
      const adapter = await import(adapterPath)
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(name, 1)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      const state = globalThis as typeof globalThis & { __k3Raw?: IDBDatabase[] }
      state.__k3Raw = [...state.__k3Raw ?? [], db]
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("observations", "readwrite")
        tx.objectStore("observations").add({
          partitionSeq: 2,
          envelope: {
            schemaVersion: 1,
            eventId: "00000000-0000-4000-8000-000000000099",
            producer: { producerId: "studio-host", producerKind: "host" },
            scope: otherScope,
            privacy: "didactic-sensitive",
            authority: "observed",
            occurredAt: "2026-07-15T08:00:09.000Z",
            recordedAt: "2026-07-15T08:00:09.100Z",
            kind: "synthetic.observed",
            payload: { ordinal: 99 },
            evidence: [],
            consent: { status: "not-required" },
            contentHash: "b".repeat(64),
            sourceIdempotencyKey: "source-99",
          },
        })
        tx.oncomplete = () => resolve()
        tx.onabort = () => reject(tx.error)
      })
      db.close()
      const store = await adapter.openIndexedDbObservationStore(ownScope)
      try {
        const rows = await store.readPartition(ownScope)
        return { code: "accepted", rows: rows.length }
      } catch (error) {
        return { code: error instanceof Error && "code" in error ? String(error.code) : "unexpected", rows: 0 }
      } finally {
        store.close()
      }
    }, { adapterPath: ADAPTER, ownScope, otherScope, name })
    expect(result).toEqual({ code: "scope-mismatch", rows: 0 })
    expect(harness.nonLoopbackAttempts).toEqual([])
  } finally {
    await cleanup(harness)
  }
})
