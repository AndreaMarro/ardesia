// @vitest-environment jsdom
// Stanza "unassigned" nell'hash: la Room non deve montare una lezione di
// prodotto sul contenitore di recovery. Solo sintetici.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"

vi.mock("@excalidraw/excalidraw", () => {
  const FONT_FAMILY = { Nunito: 1 }
  return {
    FONT_FAMILY,
    Excalidraw: () => "mock-excalidraw",
    MainMenu: Object.assign(() => null, {
      DefaultItems: { ClearCanvas: () => null, SaveAsImage: () => null },
    }),
    WelcomeScreen: Object.assign(() => null, {
      Center: Object.assign(() => null, {
        Heading: () => null,
        Logo: () => null,
      }),
      Hints: { ToolbarHint: () => null, MenuHint: () => null, HelpHint: () => null },
    }),
    convertToExcalidrawElements: (v: unknown) => v,
    serializeAsJSON: () => "{}",
  }
})

vi.mock("../store/WorkspaceStore", () => ({
  workspaceStore: {
    registerActiveLesson: async (lessonId: string) => {
      const completion = Promise.resolve()
      return { lessonId, release: () => completion }
    },
    init: () => Promise.resolve(),
    mode: "localStorage",
    loadScene: () => Promise.resolve(null),
    saveScene: () => Promise.resolve(),
    loadMeta: () => Promise.resolve(null),
    saveMeta: () => Promise.resolve(),
    listRooms: () => Promise.resolve([]),
    connectFolder: () => Promise.resolve(false),
    exportLesson: () => Promise.resolve(new Blob()),
    usage: () => ({ used: 0, quota: 5 * 1024 * 1024 }),
  },
}))

vi.mock("../store/AudioRecorder", () => ({
  AudioRecorder: () => ({
    start: () => Promise.resolve(),
    stop: () => {},
    dispose: () => {},
    recording: false,
    consent: false,
    lastRevoke: Promise.resolve(),
  }),
}))

vi.mock("../store/studentView", () => ({ isStudentView: () => false }))
vi.mock("../store/isRecapView", () => ({ isRecapView: () => false }))
vi.mock("../store/isReplayView", () => ({ isReplayView: () => false }))
vi.mock("../latexToImage", () => ({ latexToImage: () => Promise.resolve({ dataURL: "", width: 100, height: 50 }) }))
vi.mock("../loadFile", () => ({ imageToDataURL: () => {}, pdfToImages: () => Promise.resolve([]) }))
vi.mock("pdfjs-dist", () => ({}))
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({}))
vi.mock("../design/icons", () => ({ IconAlert: () => null, IconCheck: () => null, IconArrowUpRight: () => null }))
vi.mock("../MathComposer", () => ({ default: () => null }))
vi.mock("../RecapView", () => ({ default: () => null }))
vi.mock("../ReplayView", () => ({ default: () => null }))

import Room from "../Room"

const SESSION = "44444444-4444-4444-8444-444444444444"

function stubStore() {
  return {
    registerActiveLesson: async (lessonId: string) => ({ lessonId, release: async () => {} }),
    init: async () => "localStorage",
    mode: "localStorage",
    loadScene: async () => null,
    saveScene: async () => {},
    loadMeta: async () => null,
    saveMeta: async () => {},
    listRooms: async () => [],
  }
}

function stubOpener() {
  return vi.fn(async ({ room }: { room: string }) => ({
    store: { append: async () => ({}), readAll: async () => [] },
    capabilities: { indexedDb: true },
    persistent: true,
    dataLoss: false,
    corrupted: false,
    identity: { lessonId: room, sessionId: SESSION, actor: { type: "teacher", id: "synthetic" } },
    producer: { id: "test.unb.ui", version: "1.0.0", commitSha: "d".repeat(40) },
    appendFact: async () => ({ event: {}, appended: true }),
    close: async () => ({ event: {}, appended: true }),
  }))
}

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
  const mem: Record<string, string> = {}
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => { mem[k] = v },
      removeItem: (k: string) => { delete mem[k] },
      clear: () => { for (const k in mem) delete mem[k] },
      get length() { return Object.keys(mem).length },
      key: (i: number) => Object.keys(mem)[i] ?? null,
    },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState(null, "", "/")
})

describe("Room with reserved hash", () => {
  it("blocks the unassigned hash with an explicit outcome and never opens a session", async () => {
    window.history.replaceState(null, "", "/#unassigned")
    const opener = stubOpener()
    const container = document.getElementById("root")!
    const root: Root = createRoot(container)
    root.render(<Room store={stubStore() as never} lessonOsOpener={opener as never} />)
    await vi.waitFor(() => {
      expect(container.textContent).toMatch(/non disponibile|riservat|non valida/i)
    }, { timeout: 2000, interval: 25 })
    expect(opener).not.toHaveBeenCalled()
    expect(container.textContent).not.toMatch(/mock-excalidraw/)
    root.unmount()
  })

  it("still mounts an ordinary room and opens its session", async () => {
    window.history.replaceState(null, "", "/#unb-ordinary")
    const opener = stubOpener()
    const container = document.getElementById("root")!
    const root: Root = createRoot(container)
    root.render(<Room store={stubStore() as never} lessonOsOpener={opener as never} />)
    await vi.waitFor(() => {
      expect(opener).toHaveBeenCalledWith({ room: "unb-ordinary" })
    }, { timeout: 2000, interval: 25 })
    root.unmount()
  })
})
