// @vitest-environment jsdom
// Consumer contract for S00's Room patch. Intentionally RED until that patch is
// applied; this file travels with the patch, outside the unmounted utility suite.
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { WorkspaceStore } from "../store/WorkspaceStore"
import Room from "../Room"

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
