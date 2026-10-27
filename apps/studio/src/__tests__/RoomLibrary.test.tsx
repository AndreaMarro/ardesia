// @vitest-environment jsdom
// Consumer contract for the mounted lesson collection and canonical save queue.
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { WorkspaceStore } from "../store/WorkspaceStore"
import Room from "../Room"
import type { RoomInkAdapter } from "../collaboration-v2/RoomCollaboration"

const native = vi.hoisted(() => ({ props: null as any, ready: false, elements: [] as any[], library: [] as any[], toggle: vi.fn() }))
vi.mock("@excalidraw/excalidraw", async () => {
  const React = await import("react")
  return {
    Excalidraw: (props: any) => {
      native.props = props
      React.useEffect(() => {
        native.elements = props.initialData?.elements ?? []
        native.library = props.initialData?.libraryItems ?? []
        props.excalidrawAPI({
          getSceneElements: () => native.elements,
          getSceneElementsIncludingDeleted: () => native.elements,
          getAppState: () => ({}), getFiles: () => ({}),
          toggleSidebar: native.toggle, addFiles: vi.fn(),
          updateScene: ({ elements }: any) => { native.elements = elements ?? native.elements },
          updateLibrary: async ({ libraryItems }: any) => {
            native.library = typeof libraryItems === "function" ? libraryItems(native.library) : libraryItems
            native.props.onLibraryChange?.(native.library)
            return native.library
          },
          onPointerDown: () => () => {}, onPointerUp: () => () => {},
        })
        native.ready = true
      }, [])
      return React.createElement("div", { "data-testid": "native-canvas" })
    },
    MainMenu: Object.assign(() => null, { DefaultItems: { ClearCanvas: () => null, SaveAsImage: () => null } }),
    WelcomeScreen: Object.assign(() => null, { Center: { Heading: () => null, Logo: () => null }, Hints: { ToolbarHint: () => null, MenuHint: () => null, HelpHint: () => null } }),
    FONT_FAMILY: { Nunito: 6 }, convertToExcalidrawElements: (elements: any) => elements,
    serializeAsJSON: (elements: any, appState: any, files: any) => JSON.stringify({ type: "excalidraw", elements, appState, files }),
  }
})
vi.mock("@excalidraw/excalidraw/index.css", () => ({}))
vi.mock("../loadFile", () => ({ imageToDataURL: vi.fn(), pdfToImages: vi.fn() }))
vi.mock("../latexToImage", () => ({ latexToImage: vi.fn() }))
vi.mock("../toolhost/ToolCanvasEmbeddable", () => ({ buildSimulationInsert: vi.fn(), normalizeDuplicatedToolEmbeds: (elements: any) => ({ changed: false, elements }), renderToolCanvasEmbeddable: vi.fn() }))
// These tests exercise Room's durable scene boundary, not the separately tested
// transport adapter. The canvas still supplies real callback ordering below.
vi.mock("../collaboration-v2/RoomCollaboration", () => ({ RoomCollaboration: () => null }))

const item = { id: "axes", status: "unpublished", created: 0, elements: [{ id: "axis", type: "arrow", x: 0, y: 0, width: 20, height: 0 }] }
beforeEach(() => {
  native.props = null; native.ready = false; native.elements = []; native.library = []; native.toggle.mockClear()
  const entries = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    get length() { return entries.size }, clear: () => entries.clear(), getItem: (key: string) => entries.get(key) ?? null,
    key: (i: number) => [...entries.keys()][i] ?? null, removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, String(value)),
  } })
  window.history.replaceState(null, "", "/#library-consumer")
})
afterEach(cleanup)

it("opens the native collection and persists a library-only edit through the existing Room save queue", async () => {
  const store = new WorkspaceStore()
  await store.init()
  render(<Room store={store} />)
  await waitFor(() => expect(native.props?.onLibraryChange).toBeTypeOf("function"))
  await waitFor(() => expect(native.ready).toBe(true))
  fireEvent.click(document.querySelector('[aria-label="Apri raccolta della lezione"]')!)
  expect(native.toggle).toHaveBeenCalledWith({ name: "default", tab: "library" })
  native.props.onLibraryChange([item])
  await waitFor(async () => expect(JSON.parse((await store.loadScene("library-consumer"))!).libraryItems).toEqual([item]))
})

it("does not overwrite a corrupt collection after the SDK reports an initial empty library", async () => {
  const store = new WorkspaceStore()
  await store.init()
  const original = JSON.stringify({ type: "excalidraw", elements: [], libraryItems: null })
  await store.saveScene("library-consumer", original)
  render(<Room store={store} />)
  await waitFor(() => expect(native.props?.onLibraryChange).toBeTypeOf("function"))
  await waitFor(() => expect(native.ready).toBe(true))
  native.props.onLibraryChange([])
  native.props.onChange([], {}, {})
  await waitFor(() => expect(document.body.textContent).toContain("Salvataggio non riuscito"))
  expect(await store.loadScene("library-consumer")).toBe(original)
})

it("ignores a retired SDK library callback after the store lifecycle changes", async () => {
  const first = new WorkspaceStore()
  const second = new WorkspaceStore()
  await first.init(); await second.init()
  const view = render(<Room store={first} />)
  await waitFor(() => expect(native.ready).toBe(true))
  const retired = native.props.onLibraryChange
  native.ready = false
  view.rerender(<Room store={second} />)
  await waitFor(() => expect(native.ready).toBe(true))
  native.props.onChange([], {}, {})
  retired([item])
  await (window as any).__MAESTRO_TEST__.flushPersist()
  expect(JSON.parse((await second.loadScene("library-consumer"))!).libraryItems).toEqual([])
})

it("retains a valid library edit delivered while a rejected edit repair is completing", async () => {
  const store = new WorkspaceStore()
  await store.init()
  render(<Room store={store} />)
  await waitFor(() => expect(native.ready).toBe(true))
  native.props.onChange([], {}, {})
  native.props.onLibraryChange([{ ...item, elements: [{ ...item.elements[0], customData: { ardesiaInkV1: {} } }] }])
  native.library = [item]
  native.props.onLibraryChange([item])
  await (window as any).__MAESTRO_TEST__.flushPersist()
  expect(JSON.parse((await store.loadScene("library-consumer"))!).libraryItems).toEqual([item])
})

it("keeps the original legacy ink boundary while a queued save outlives its store lifecycle", async () => {
  const first = new WorkspaceStore()
  const second = new WorkspaceStore()
  await first.init(); await second.init()
  const pen = { id: "first-legacy-pen", type: "freedraw", version: 1 }
  const original = JSON.stringify({ type: "excalidraw", elements: [pen], libraryItems: [item] })
  await first.saveScene("library-consumer", original)
  vi.spyOn(second, "loadScene").mockResolvedValueOnce(JSON.stringify({
    type: "excalidraw", elements: [{ ...pen, id: "second-legacy-pen" }], libraryItems: [],
  }))
  const collaboration = { roomId: "library-consumer", signal: new AbortController().signal } as RoomInkAdapter
  const view = render(<Room store={first} collaboration={collaboration} />)
  await waitFor(() => expect(native.ready).toBe(true))
  native.props.onChange(native.elements, {}, {})
  let releaseRead!: (value: string) => void
  const pendingRead = new Promise<string>(resolve => { releaseRead = resolve })
  const loading = vi.spyOn(first, "loadScene").mockImplementationOnce(() => pendingRead)
  const saving = (window as any).__MAESTRO_TEST__.flushPersist()
  try {
    await waitFor(() => expect(loading).toHaveBeenCalled())
    native.ready = false
    view.rerender(<Room store={second} collaboration={collaboration} />)
    await waitFor(() => expect(native.ready).toBe(true))
  } finally {
    releaseRead(original)
  }
  await saving
  const saved = JSON.parse((await first.loadScene("library-consumer"))!)
  expect(saved.elements).toEqual([pen])
  expect(saved.libraryItems).toEqual([item])
})

it("preserves exact audio editorial markers on a library edit without persisting private scene fields", async () => {
  const store = new WorkspaceStore()
  await store.init()
  const editorial = { v: 1, lessonId: "library-consumer", moments: [{
    id: "chapter-1", title: "Formula spiegata", kind: "chapter", lessonId: "library-consumer",
    sessionId: "11111111-1111-4111-8111-111111111111", recordingId: "22222222-2222-4222-8222-222222222222",
    sha256: "a".repeat(64), epoch: 1500, objectRefs: [{ elementId: "formula", version: 1, label: "F = ma" }],
  }] }
  await store.saveScene("library-consumer", JSON.stringify({ type: "excalidraw", livingLesson: editorial,
    elements: [{ id: "formula", type: "text", version: 1, text: "F = ma" },
      { id: "private-projection", type: "freedraw", customData: { ardesiaInkV1: { audience: "personal" } } }],
    privateInk: "must remain private", libraryItems: [], files: {},
  }))
  render(<Room store={store} />)
  await waitFor(() => expect(native.ready).toBe(true))
  native.props.onLibraryChange([item])
  await (window as any).__MAESTRO_TEST__.flushPersist()
  const serialized = (await store.loadScene("library-consumer"))!
  const saved = JSON.parse(serialized)
  expect(saved.livingLesson).toEqual(editorial)
  expect(saved.libraryItems).toEqual([item])
  expect(saved.elements.map((element: { id: string }) => element.id)).toEqual(["formula"])
  for (const secret of ["private-projection", "privateInk", "ardesiaInkV1", "must remain private"]) {
    expect(serialized).not.toContain(secret)
  }
})
