// @vitest-environment jsdom
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import Room from '../Room'
import { WorkspaceStore } from '../store/WorkspaceStore'
import { openLessonOsSession } from '../lessonos/bootstrap'
import { normalizeDuplicatedToolEmbeds, parseToolLink } from '../toolhost/ToolCanvasEmbeddable'
import { createFluidThermoEmbed } from '../../plugins/fluid-thermo/register'

const canvas = vi.hoisted(() => ({ props: null as any, ready: false, elements: [] as any[], selected: {} as Record<string, boolean> }))
vi.mock('@excalidraw/excalidraw', async importOriginal => {
  // jsdom lacks canvas; the SDK checks filter support while importing its UI.
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ filter: '' })) as never
  const actual = await importOriginal<typeof import('@excalidraw/excalidraw')>()
  const React = await import('react')
  return {
    ...actual,
    // Only the canvas UI is substituted. Conversion and serialization are the
    // installed public SDK implementations, including default ID regeneration.
    Excalidraw: (props: any) => {
      canvas.props = props
      React.useEffect(() => {
        canvas.elements = props.initialData?.elements ?? []
        props.excalidrawAPI({
          getSceneElements: () => canvas.elements,
          getSceneElementsIncludingDeleted: () => canvas.elements,
          getAppState: () => ({ selectedElementIds: canvas.selected }), getFiles: () => ({}),
          updateScene: ({ elements, appState }: any) => {
            if (elements) canvas.elements = elements
            if (appState?.selectedElementIds) canvas.selected = appState.selectedElementIds
          },
          updateLibrary: async () => [], addFiles: vi.fn(),
          onPointerDown: () => () => {}, onPointerUp: () => () => {},
        })
        canvas.ready = true
      }, [])
      return React.createElement('div', { 'data-testid': 'canvas' })
    },
    MainMenu: Object.assign(() => null, { DefaultItems: { ClearCanvas: () => null, SaveAsImage: () => null } }),
    WelcomeScreen: Object.assign(() => null, { Center: { Heading: () => null, Logo: () => null }, Hints: { ToolbarHint: () => null, MenuHint: () => null, HelpHint: () => null } }),
  }
})
vi.mock('@excalidraw/excalidraw/index.css', () => ({}))
vi.mock('../loadFile', () => ({ imageToDataURL: vi.fn(), pdfToImages: vi.fn() }))
vi.mock('../latexToImage', () => ({ latexToImage: vi.fn() }))
vi.mock('../collaboration-v2/RoomCollaboration', () => ({ RoomCollaboration: () => null }))

const room = 'laboratory-identity'
function embed(id: string) {
  return createFluidThermoEmbed(id) as NonNullable<Parameters<typeof convertToExcalidrawElements>[0]>[number]
}
beforeEach(() => {
  canvas.props = null; canvas.ready = false; canvas.elements = []; canvas.selected = {}
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    get length() { return entries.size }, clear: () => entries.clear(), getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null, removeItem: (key: string) => { entries.delete(key) },
    setItem: (key: string, value: string) => { entries.set(key, String(value)) },
  } satisfies Storage)
  vi.stubGlobal('Blob', NodeBlob)
  window.history.replaceState(null, '', '/#' + room)
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('uses real SDK conversion, whose default regenerates a supplied ID', () => {
  const input = [embed('assigned-before-conversion')]
  expect(convertToExcalidrawElements(input)[0].id).not.toBe(input[0].id)
  expect(convertToExcalidrawElements(input, { regenerateIds: false })[0].id).toBe(input[0].id)
})

it('persists distinct converted IDs matching selection, tool link and mounted evidence without repairing old history', async () => {
  const store = new WorkspaceStore()
  await store.init()
  // A pre-fix board may have a regenerated ID while its historical event
  // still claims the catalogue ID. New insertions must not acquire that ID.
  // The existing onChange normalizes the old scene link, but cannot repair
  // the already appended historical event. Seed that actual durable shape.
  const old = normalizeDuplicatedToolEmbeds(convertToExcalidrawElements([embed('fluid-thermo-lab')])).elements[0]
  await store.saveScene(room, JSON.stringify({ type: 'excalidraw', elements: [old], files: {}, appState: {}, libraryItems: [] }))
  const runtime = await openLessonOsSession({ room, env: { indexedDB: undefined, markerStorage: undefined } })
  await runtime.store.append({ kind: 'plugin.mounted', pluginId: 'io.ardesia.fluid-thermo', pluginKind: 'simulation',
    instanceId: 'fluid-thermo-lab', room, labels: { it: 'Laboratorio storico' }, evidence: ['board:fluid-thermo-lab'], t: 100 })
  const historical = await runtime.store.readAll()
  const append = vi.spyOn(runtime.store, 'append')
  await act(async () => { render(<Room store={store} lessonOsOpener={async () => runtime} />) })
  await waitFor(() => expect(canvas.ready).toBe(true))
  const ids: string[] = []
  for (let index = 0; index < 3; index++) {
    fireEvent.click(screen.getByRole('button', { name: 'laboratori' }))
    fireEvent.click(screen.getByRole('button', { name: 'Inserisci nella lezione' }))
    await waitFor(() => expect(append).toHaveBeenCalledTimes(index + 1))
    const added = canvas.elements.at(-1)!
    expect(added.id).not.toBe('fluid-thermo-lab')
    expect(canvas.selected).toEqual({ [added.id]: true })
    expect(parseToolLink(added.link)).toEqual({ toolId: 'io.ardesia.fluid-thermo', embedId: added.id })
    expect(append.mock.calls[index][0]).toMatchObject({ kind: 'plugin.mounted', instanceId: added.id, room,
      evidence: ['plugin:io.ardesia.fluid-thermo@1.0.0', 'board:' + added.id] })
    ids.push(added.id)
  }
  expect(new Set(ids).size).toBe(3)
  expect(canvas.elements[0]).toEqual(old)
  await act(async () => {
    canvas.props.onChange(canvas.elements, {}, {})
    await (window as any).__MAESTRO_TEST__.flushPersist()
  })
  const saved = JSON.parse((await store.loadScene(room))!)
  expect(saved.elements.map((element: { id: string }) => element.id)).toEqual([old.id, ...ids])
  expect((await runtime.store.readAll()).slice(0, historical.length)).toEqual(historical)
})
