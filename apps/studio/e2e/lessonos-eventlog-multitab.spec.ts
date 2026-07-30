import { test, expect, type Page } from "@playwright/test"

const LOG_HANDLE = "__fb2IndexedDbEventLog"
const EVENTS_PER_TAB = 50

async function openAdapter(page: Page, dbName: string): Promise<void> {
  await page.evaluate(
    async ({ databaseName, handle }) => {
      const { IndexedDbEventLog } = await import("/src/lessonos/indexedDbEventLog.ts")
      const log = new IndexedDbEventLog({ dbName: databaseName })
      await log.open()
      Object.defineProperty(globalThis, handle, { value: log, configurable: true })
    },
    { databaseName: dbName, handle: LOG_HANDLE },
  )
}

async function appendTabEvents(page: Page, tab: "a" | "b"): Promise<Array<{ seq: number; id: string }>> {
  return page.evaluate(
    async ({ handle, tabId, count }) => {
      const log = Reflect.get(globalThis, handle) as {
        append(event: {
          kind: "lesson.started"
          room: string
          t: number
          evidence: string[]
        }): Promise<{ seq: number; room: string }>
      }
      const offset = tabId === "a" ? 100_000 : 200_000
      const events = Array.from({ length: count }, (_, index) => {
        const room = `fb2-${tabId}-${index}`
        const t = offset + index
        return {
          kind: "lesson.started" as const,
          room,
          t,
          evidence: [`lesson:${room}@${t}`],
        }
      })
      const appended = await Promise.all(events.map((event) => log.append(event)))
      return appended.map((event) => ({ seq: event.seq, id: event.room }))
    },
    { handle: LOG_HANDLE, tabId: tab, count: EVENTS_PER_TAB },
  )
}

test("due tab appendono 100 eventi exactly-once, contigui e durevoli al cold reopen", async ({
  context,
}, testInfo) => {
  const dbName = `lessonos-eventlog-fb2-${testInfo.workerIndex}-${Date.now()}`
  const first = await context.newPage()
  const second = await context.newPage()
  await Promise.all([first.goto("/"), second.goto("/")])
  await Promise.all([openAdapter(first, dbName), openAdapter(second, dbName)])

  const [fromFirst, fromSecond] = await Promise.all([
    appendTabEvents(first, "a"),
    appendTabEvents(second, "b"),
  ])
  const returned = [...fromFirst, ...fromSecond]
  expect(returned.map((event) => event.seq).sort((a, b) => a - b)).toEqual(
    Array.from({ length: 100 }, (_, index) => index + 1),
  )
  expect(new Set(returned.map((event) => event.id)).size).toBe(100)

  await Promise.all([first.close(), second.close()])

  const cold = await context.newPage()
  await cold.goto("/")
  const evidence = await cold.evaluate(async (databaseName) => {
    const { IndexedDbEventLog } = await import("/src/lessonos/indexedDbEventLog.ts")
    const log = new IndexedDbEventLog({ dbName: databaseName })
    const recovery = await log.open()
    const logical = (await log.readAll()).map((event) => ({
      seq: event.seq,
      kind: event.kind,
      room: String((event as unknown as Record<string, unknown>).room),
      t: event.t,
    }))
    const physicalKeys = await new Promise<number[]>((resolve, reject) => {
      // Stessa ragione della spec del cruscotto: l'adapter ha gia' aperto a
      // DB_VERSION = 2, e chiedere la 1 qui e' un VersionError garantito.
      const open = indexedDB.open(databaseName)
      open.onerror = () => reject(open.error)
      open.onsuccess = () => {
        const db = open.result
        const txn = db.transaction("lessonos_events", "readonly")
        const keys = txn.objectStore("lessonos_events").getAllKeys()
        keys.onerror = () => reject(keys.error)
        txn.onabort = () => reject(txn.error)
        txn.onerror = () => reject(txn.error)
        txn.oncomplete = () => {
          db.close()
          resolve(keys.result.filter((key): key is number => typeof key === "number"))
        }
      }
    })
    await log.close()
    return { recovery, logical, physicalKeys }
  }, dbName)

  expect(evidence.recovery).toEqual({
    recovered: 100,
    lastSeq: 100,
    droppedTail: 0,
    corrupted: false,
  })
  const contiguous = Array.from({ length: 100 }, (_, index) => index + 1)
  expect(evidence.physicalKeys).toEqual(contiguous)
  expect(evidence.logical).toHaveLength(100)
  expect(evidence.logical.map((event) => event.seq)).toEqual(contiguous)
  const expectedIds = (["a", "b"] as const).flatMap((tab) =>
    Array.from({ length: EVENTS_PER_TAB }, (_, index) => `fb2-${tab}-${index}`),
  )
  const logicalIds = evidence.logical.map((event) => event.room)
  expect(new Set(logicalIds).size).toBe(100)
  expect(logicalIds.slice().sort()).toEqual(expectedIds.sort())
})
