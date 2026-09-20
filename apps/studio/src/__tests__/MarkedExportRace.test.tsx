// @vitest-environment jsdom
// Temporal durability: PERSISTED_CONFIRMATION_INVARIANT.
// If the UI communicates "errori segnati: 1", an immediately following
// export must observe that error as persisted. The append delay lives IN
// THE TEST (deferred log), never in production code.
import { describe, it, expect, afterEach, vi } from "vitest"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import JSZip from "jszip"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"
import type { AppendedEvent, AnyEventEnvelopeV2, EventLogStore, LessonOsEvent } from "../lessonos/eventlog"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { FileEntry } from "../store/types"
import { exportLesson } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"

const ROOM = "v1-cap6-esp1"
const MISTAKE_TEXT = "LED inserito al contrario"
const CONCEPT_LABEL = "polarità LED"

let host: HTMLDivElement | null = null
let root: Root | null = null

async function renderView(eventLog: EventLogStore): Promise<HTMLDivElement> {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(<ElabLab eventLog={eventLog} />)
  })
  return host
}

afterEach(async () => {
  if (root !== null) {
    const r = root
    await act(async () => r.unmount())
    root = null
  }
  host?.remove()
  host = null
})

/** Event log with controllable append resolution (delay lives in the test). */
class DeferredLog implements EventLogStore {
  private inner = new InMemoryEventLog()
  private gate: Promise<void> = Promise.resolve()
  private releaseGate!: () => void
  private armed = false

  /** Next append stays pending until release() is called. */
  armPendingAppend(): void {
    this.armed = true
    this.gate = new Promise<void>((resolve) => { this.releaseGate = resolve })
  }

  release(): void {
    this.armed = false
    this.releaseGate()
  }

  async append(event: LessonOsEvent): Promise<AppendedEvent> {
    if (this.armed) await this.gate
    return this.inner.append(event)
  }

  async readAll(): Promise<AppendedEvent[]> {
    return this.inner.readAll()
  }

  /** Envelope scope over resolved facts only (single-room test log). */
  async readAllEnvelopes(): Promise<AnyEventEnvelopeV2[]> {
    return this.readEnvelopesByLesson(ROOM)
  }

  async readEnvelopesByLesson(lessonId: string): Promise<AnyEventEnvelopeV2[]> {
    if (lessonId !== ROOM) return []
    const events = await this.inner.readAll()
    return events
      .filter((e) => e.kind === "error.observed")
        .map((e, i) => ({
          ...createEventEnvelopeV2(
        {
          lessonId: ROOM,
          sessionId: "11111111-1111-4111-8111-111111111111",
          kind: "error.observed",
          actor: { type: "teacher", id: "synthetic-teacher" },
          producer: { id: "test.local.durability-probe", version: "0.0.0", commitSha: "a".repeat(40) },
          causationId: null,
          idempotencyKey: `durability-probe:${i}`,
          evidence: ((e as { evidence: string[] }).evidence ?? []).map(
            (ref) => ({ ref, resolution: "verified" }),
          ),
          payload: {
            errorId: (e as { errorId: string }).errorId,
            conceptId: (e as { conceptId: string }).conceptId,
            labels: (e as { labels: object }).labels,
          },
        } as never,
        { eventId: () => `12340000-0000-4000-8000-${String(i).padStart(12, "0")}`, now: () => new Date(1000 + i) },
          ),
          seq: i + 1,
        }) as unknown as AnyEventEnvelopeV2)
  }

  async readEnvelopesBySession(lessonId: string, _s: string): Promise<AnyEventEnvelopeV2[]> {
    return this.readEnvelopesByLesson(lessonId)
  }
}

function conceptRadio(view: HTMLElement, label: string): HTMLInputElement {
  const input = [...view.querySelectorAll<HTMLInputElement>("input[type=radio]")].find(
    (el) => el.closest("label")?.textContent?.includes(label),
  )
  if (!input) throw new Error(`radio concetto "${label}" non trovata`)
  return input
}

function mistakeButton(view: HTMLElement, text: string): HTMLButtonElement {
  const button = [...view.querySelectorAll<HTMLButtonElement>("button[data-mistake-id]")].find(
    (el) => el.textContent?.includes(text),
  )
  if (!button) throw new Error(`bottone mistake "${text}" non trovato`)
  return button
}

function markedText(view: HTMLElement): string {
  return view.querySelector("[data-marked-count]")?.textContent ?? ""
}

async function exportSnapshotText(store: WorkspaceStore, log: DeferredLog): Promise<string> {
  const bundle = await exportLesson(store, ROOM, log as never)
  const zip = await JSZip.loadAsync(bundle)
  const entry = zip.file("raw/lessonos-events.jsonl")
  if (!entry) return ""
  return entry.async("text")
}

describe("temporal durability: UI confirmation vs immediate export", () => {
  it("PERSISTED_CONFIRMATION_INVARIANT: confirmed mark survives immediate export", async () => {
    const log = new DeferredLog()
    log.armPendingAppend()
    const view = await renderView(log)

    await act(async () => {
      conceptRadio(view, CONCEPT_LABEL).click()
    })
    await act(async () => {
      mistakeButton(view, MISTAKE_TEXT).click()
    })

    // UI truth at click time, append still pending.
    const persistedBefore = await log.readAll()

    // Production export of the CURRENT persisted state.
    const store = new WorkspaceStore()
    const mem = new Map<string, ArrayBuffer>()
    const mock = {
      available: () => true,
      init: async () => true,
      read: async (p: string) => { const b = mem.get(p); return b ? new Blob([b]) : null },
      write: async (p: string, d: Blob) => { mem.set(p, await d.arrayBuffer()) },
      delete: async (p: string) => { mem.delete(p) },
      list: async (prefix?: string) => [...mem.entries()]
        .filter(([p]) => !prefix || p.startsWith(prefix))
        .map(([p, data]) => ({ path: p, data: new Blob([data]), mtime: 0 }) as FileEntry),
      getLegacyScene: () => null,
      setLegacyScene: () => {},
    }
    ;(store as unknown as { driver: unknown }).driver = mock
    ;(store as unknown as { fallback: unknown }).fallback = mock
    await store.write(roomPaths(ROOM).journal, new Blob(["{}\n"], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const snapshot = await exportSnapshotText(store, log)

    // The invariant: a communicated confirmation must be export-observable.
    // While the append is pending, the UI must NOT claim the mark yet, and
    // the export honestly reflects the empty persisted state (window exists,
    // lie removed).
    expect(markedText(view)).toBe("errori segnati: 0")
    expect(persistedBefore).toHaveLength(0)
    expect(snapshot).not.toContain("v1-cap6-esp1:mistake-1")

    log.release()
    await vi.waitFor(async () => {
      expect(await log.readAll()).toHaveLength(1)
    })
    await vi.waitFor(() => {
      expect(markedText(view)).toBe("errori segnati: 1")
    })

    // After acknowledgement, the immediate export observes the confirmed fact.
    const snapshotAfter = await exportSnapshotText(store, log)
    expect(snapshotAfter).toContain("v1-cap6-esp1:mistake-1")
  })
})
