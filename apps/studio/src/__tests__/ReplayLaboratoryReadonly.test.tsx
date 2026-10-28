// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash, webcrypto } from 'node:crypto'
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import ReplayView from '../ReplayView'
import { WorkspaceStore } from '../store/WorkspaceStore'
import { loadReplayTimeline } from '../store/replayTimeline'
import { roomPaths } from '../store/roomPaths'
import { getSimulationTool, registerSimulationTool } from '../toolhost/simulationPluginRegistry'
import { renderToolCanvasEmbeddable } from '../toolhost/ToolCanvasEmbeddable'
import { createFluidThermoEmbed, registerFluidThermoTool } from '../../plugins/fluid-thermo/register'
import { FluidThermoLab } from '../../plugins/fluid-thermo/FluidThermoLab'
import { newLabSnapshot } from '../../plugins/fluid-thermo/snapshot'
import { getLab } from '../../plugins/fluid-thermo/definitions'
import type { LabId } from '../../plugins/fluid-thermo/types'
import { EMBED_DATA_KEY } from '../toolhost/caps/board'
import { buildDefaultPluginWindowCatalog, createPluginWindowInsertRequest } from '../design/pluginWindowCatalog'
import { createPostitFromPluginWindowInsert } from '../design/multiPostitWorkbenchModel'
import { createPluginPostitBoardScene } from '../design/multiPostitBoardPersistence'

vi.mock('@excalidraw/excalidraw', async () => {
  const React = await import('react')
  return { FONT_FAMILY: { Nunito: 6 }, Excalidraw: (props: any) => {
    const [elements, setElements] = React.useState<any[]>(props.initialData.elements)
    React.useEffect(() => { props.excalidrawAPI({ updateScene: ({ elements }: any) => setElements(elements), scrollToContent() {} }) }, [])
    return <div data-testid="replay-canvas" data-readonly={props.viewModeEnabled}>
      {elements.filter(element => element.type === 'embeddable').map(element => <div key={element.id} data-element-id={element.id} data-element-version={element.version}>
        {props.validateEmbeddable?.test(element.link) ? props.renderEmbeddable?.(freeze(element)) : null}
      </div>)}
    </div>
  } }
})
vi.mock('@excalidraw/excalidraw/index.css', () => ({}))
// Camera interactions are local; no WebGL is needed to verify their boundary.
vi.mock('../../plugins/fluid-thermo/LabScene3D', () => ({ LabScene3D: ({ parameters }: any) =>
  <div aria-label="Geometria 3D"><p>Profondità 3D: {parameters.depth}</p><button>Ruota a sinistra</button></div> }))

const room = 'closure1-1c-studio-20261028-669b5d20'
const plugin = 'io.ardesia.fluid-thermo'
const fixture = readFileSync(join(__dirname, 'fixtures/replay/hydrostatic-history-669b5d20.lesson'))
beforeEach(() => {
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    get length() { return entries.size }, clear: () => entries.clear(), getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null, removeItem: (key: string) => { entries.delete(key) },
    setItem: (key: string, value: string) => { entries.set(key, String(value)) },
  } satisfies Storage)
  vi.stubGlobal('Blob', NodeBlob); vi.stubGlobal('crypto', webcrypto)
  // JSZip uses FileReader in a browser; bridge it to the Node Blob used by
  // the real store in jsdom without replacing the ZIP parser or importer.
  vi.stubGlobal('FileReader', class {
    result: ArrayBuffer | null = null
    error: unknown = null
    onload: ((event: { target: unknown }) => void) | null = null
    onerror: ((event: { target: unknown }) => void) | null = null
    readAsArrayBuffer(blob: Blob) {
      void blob.arrayBuffer().then(value => { this.result = Uint8Array.from(new Uint8Array(value)).buffer; this.onload?.({ target: this }) }, error => { this.error = error; this.onerror?.({ target: this }) })
    }
  })
  window.history.replaceState(null, '', '/?vista=replay#' + room)
  registerFluidThermoTool()
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}
async function imported() {
  const store = new WorkspaceStore(); await store.init()
  await store.importLessonBlobForRoom(new Blob([Uint8Array.from(fixture)]), room)
  return store
}
async function bytes(store: WorkspaceStore) {
  return Promise.all((await store.list()).map(async entry => [entry.path, await entry.data.text()]))
}
const readonlyLab = () => screen.getByRole('region', { name: 'Laboratorio registrato · sola lettura' })

it('replays the real 669 export at h2 → h5 → h2 with exact recorded text and no storage writes', async () => {
  expect(createHash('sha256').update(fixture).digest('hex')).toBe('b5a416b0980d5a9f17735f9f152b895065c3c11d04e2299ebcbd9896e885a1c0')
  const store = await imported(), timeline = await loadReplayTimeline(store, room)
  expect(timeline.events).toHaveLength(14)
  const before = await bytes(store), write = vi.spyOn(store, 'write'), save = vi.spyOn(store, 'saveScene')
  const mutable = vi.spyOn(getSimulationTool(plugin)!, 'render')
  await act(async () => { render(<ReplayView store={store} room={room} />) })
  await screen.findByRole('region', { name: 'Laboratorio registrato · sola lettura' })
  const slider = screen.getByRole('slider', { name: 'linea del tempo della lezione' })
  function assertState(depth: number, version: number) {
    const lab = readonlyLab()
    expect(within(lab).getByLabelText('Profondità [m]').textContent).toBe(String(depth))
    expect(lab.closest('[data-element-version]')?.getAttribute('data-element-version')).toBe(String(version))
    expect(lab.querySelector('input,select,textarea,[contenteditable="true"]')).toBeNull()
    expect(within(lab).getByText(/Risultati ricalcolati/)).toBeTruthy()
    const row = within(lab).getByRole('row', { name: /Pressione assoluta alla profondità scelta/ })
    // Independent Stevino oracle, rounded by the existing six-significant-digit display.
    const pressure = (101325 + 1000 * 9.81 * depth).toLocaleString('it-IT', { maximumSignificantDigits: 6, useGrouping: false })
    expect(within(row).getByRole('cell', { name: pressure })).toBeTruthy()
    expect(within(lab).queryByRole('button', { name: 'Confronta con il modello' })).toBeNull()
  }
  assertState(2, 2)
  expect(readonlyLab().parentElement?.style.overflow).toBe('auto')
  expect(readonlyLab().parentElement?.style.height).toBe('100%')
  for (const [index, version, depth] of [[3,3,3.25],[4,4,3.25],[5,5,3.25],[6,6,4.25],[7,7,4.25],[10,8,4],[11,9,5],[12,10,5],[13,11,5]]) {
    fireEvent.change(slider, { target: { value: timeline.events[index].t } })
    await waitFor(() => assertState(depth, version))
    const prediction = index >= 12 ? 'La sovrapressione a cinque metri è maggiore di quella iniziale.'
      : index >= 4 && index <= 7 ? 'La sovrapressione cresce con la profondità.' : 'Nessuna previsione registrata.'
    expect(within(readonlyLab()).getByText(prediction)).toBeTruthy()
    expect(within(readonlyLab()).getByText('Nessuna osservazione registrata.')).toBeTruthy()
  }
  expect(within(readonlyLab()).getByText('La sovrapressione a cinque metri è maggiore di quella iniziale.')).toBeTruthy()
  expect(within(readonlyLab()).getByRole('table', { name: 'Misure ricalcolate' })).toBeTruthy()
  expect(within(readonlyLab()).queryByRole('button', { name: 'Esplora la geometria 3D' })).toBeNull()
  fireEvent.click(within(readonlyLab()).getByRole('button', { name: 'Sezione e diagramma 2D' }))
  fireEvent.change(slider, { target: { value: timeline.firstEventTime! } })
  await waitFor(() => assertState(2, 2))
  expect(screen.queryByText('La sovrapressione a cinque metri è maggiore di quella iniziale.')).toBeNull()
  expect(screen.queryByText('Profondità 3D: 5')).toBeNull()
  expect(mutable).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled()
  expect(await bytes(store)).toEqual(before)
})

it('never offers draft callbacks or editable controls even when read-only props include them', async () => {
  const snapshot = freeze({ ...newLabSnapshot('pascal'), prediction: 'Registrata', note: 'Nota registrata' })
  const change = vi.fn(), interaction = vi.fn(), save = vi.fn()
  render(<FluidThermoLab readOnly initialSnapshot={snapshot} onSnapshotChange={change} onInteraction={interaction} onSave={save} authoringTools allowModelSelection />)
  const lab = readonlyLab()
  expect(within(lab).getByText('Registrata')).toBeTruthy()
  expect(within(lab).getByText('Nota registrata')).toBeTruthy()
  expect(lab.querySelector('input,select,textarea')).toBeNull()
  expect(within(lab).queryByText('Valida e riapri')).toBeNull()
  fireEvent.click(within(lab).getByRole('button', { name: 'Esplora la geometria 3D' }))
  await screen.findByLabelText('Geometria 3D')
  fireEvent.click(screen.getByRole('button', { name: 'Ruota a sinistra' }))
  fireEvent.click(within(lab).getByRole('button', { name: 'Sezione e diagramma 2D' }))
  expect(change).not.toHaveBeenCalled(); expect(interaction).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled()
  expect(snapshot.view).toBe('2d')
})

it.each(['missing', 'invalid', 'plugin-version', 'model-version', 'owner', 'identity'] as const)('shows %s stored state as unavailable without a modern default', kind => {
  const element: any = createFluidThermoEmbed('exact-element')
  const marker = element.customData[EMBED_DATA_KEY]
  if (kind === 'missing') delete marker.state
  if (kind === 'invalid') marker.state.configuration.parameters.depth = -1
  if (kind === 'plugin-version') marker.state.pluginVersion = '2.0.0'
  if (kind === 'model-version') marker.state.configuration.modelVersion = 2
  if (kind === 'owner') marker.owner = 'other-plugin'
  if (kind === 'identity') element.link = `maestro-tool://${plugin}/another-element`
  freeze(element)
  const host = { persistEmbedState: vi.fn(), emitLessonEvent: vi.fn() }
  render(renderToolCanvasEmbeddable(element, host, { readOnly: true }))
  expect(screen.getByRole('alert').textContent).toMatch(/non disponibile|non valid|non riconosciut|dominio/i)
  expect(screen.queryByRole('region', { name: 'Laboratorio registrato · sola lettura' })).toBeNull()
  expect(document.querySelector('input,select,textarea,svg')).toBeNull()
  expect(host.persistEmbedState).not.toHaveBeenCalled(); expect(host.emitLessonEvent).not.toHaveBeenCalled()
})

it('rejects mutable-only, unknown and retired renderers and does not mount the generic interactive post-it', () => {
  const mutable = vi.fn(() => <button>Mutable plugin</button>)
  registerSimulationTool('org.test.mutable-only', { embedId: 'example', render: mutable, createEmbed: () => ({ id: 'example', type: 'embeddable' }) })
  const item = buildDefaultPluginWindowCatalog().find(item => item.pluginId === plugin)!
  const postit = createPostitFromPluginWindowInsert(createPluginWindowInsertRequest(item), [])
  const board = createPluginPostitBoardScene([postit]).elements[0]
  for (const element of [board, ...['org.test.mutable-only', 'org.test.absent', 'io.ardesia.simulation'].map(id => ({ id: 'example', link: `maestro-tool://${id}/example` }))]) {
    const view = render(renderToolCanvasEmbeddable(element, undefined, { readOnly: true }))
    expect(screen.getByRole('alert').textContent).toContain('non disponibile')
    expect(document.querySelector('button,input,select,textarea')).toBeNull()
    view.unmount()
  }
  expect(mutable).not.toHaveBeenCalled()
})


it.each(['missing', 'invalid', 'plugin-version', 'model-version'] as const)('ReplayView shows a %s final snapshot as unavailable and restores the exact earlier state on seek', async kind => {
  const store = await imported(), path = roomPaths(room).journal
  const rows = (await (await store.read(path))!.text()).trim().split('\n').map(line => JSON.parse(line))
  const marker = rows.at(-1).payload.element.customData[EMBED_DATA_KEY]
  if (kind === 'missing') delete marker.state
  if (kind === 'invalid') marker.state.configuration.parameters.depth = -1
  if (kind === 'plugin-version') marker.state.pluginVersion = '2.0.0'
  if (kind === 'model-version') marker.state.configuration.modelVersion = 2
  await store.write(path, new Blob([rows.map(row => JSON.stringify(row)).join('\n') + '\n']))
  const before = await bytes(store), write = vi.spyOn(store, 'write'), save = vi.spyOn(store, 'saveScene')
  const timeline = await loadReplayTimeline(store, room)
  await act(async () => { render(<ReplayView store={store} room={room} />) })
  await screen.findByRole('region', { name: 'Laboratorio registrato · sola lettura' })
  const slider = screen.getByRole('slider', { name: 'linea del tempo della lezione' })
  fireEvent.change(slider, { target: { value: timeline.lastEventTime! } })
  await screen.findByRole('alert')
  expect(screen.queryByRole('region', { name: 'Laboratorio registrato · sola lettura' })).toBeNull()
  fireEvent.change(slider, { target: { value: timeline.firstEventTime! } })
  await screen.findByRole('region', { name: 'Laboratorio registrato · sola lettura' })
  expect(within(readonlyLab()).getByLabelText('Profondità [m]').textContent).toBe('2')
  expect(write).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled()
  expect(await bytes(store)).toEqual(before)
})

it('does not synthesize a missing snapshot through the component readOnly prop', () => {
  render(<FluidThermoLab readOnly />)
  expect(screen.getByRole('alert').textContent).toContain('non disponibile')
  expect(document.querySelector('input,select,textarea,svg')).toBeNull()
})

it.each(['null', 'throw'] as const)('makes a readonly renderer returning %s unavailable without mutable fallback', kind => {
  const mutable = vi.fn(() => <button>Mutable fallback</button>)
  registerSimulationTool('org.test.readonly', { embedId: 'exact', render: mutable, createEmbed: () => ({ id: 'exact', type: 'embeddable' }),
    renderReadOnly() { if (kind === 'throw') throw Error('unsupported'); return null } })
  render(renderToolCanvasEmbeddable({ id: 'exact', link: 'maestro-tool://org.test.readonly/exact' }, undefined, { readOnly: true }))
  expect(screen.getByRole('alert').textContent).toContain('non disponibile')
  expect(mutable).not.toHaveBeenCalled()
})


const inactiveCases: [LabId, string, number, string[]][] = [
  ['poiseuille', 'boundary', 0, ['flowRate']],
  ['poiseuille', 'boundary', 1, ['pressureDifference']],
  ['capillary', 'surfaceMode', 0, []],
  ['capillary', 'surfaceMode', 1, ['contactAngleDeg', 'density', 'gravity']],
  ['capillary', 'surfaceMode', 2, ['contactAngleDeg', 'density', 'gravity']],
  ...[0, 1, 2, 3, 4].map(path => ['process', 'path', path, [path === 2 ? 'volume2' : 'temperature2K']] as [LabId, string, number, string[]]),
]
it.each(inactiveCases)('distinguishes archived inactive parameters from independent data in %s %s=%s', (modelId, mode, value, inactive) => {
  const snapshot = newLabSnapshot(modelId)
  snapshot.configuration.parameters[mode] = value
  if (modelId === 'process' && value === 2) snapshot.configuration.parameters.volume2 = snapshot.configuration.parameters.volume1
  freeze(snapshot)
  const before = JSON.stringify(snapshot), change = vi.fn(), interaction = vi.fn(), save = vi.fn()
  render(<FluidThermoLab readOnly initialSnapshot={snapshot} onSnapshotChange={change} onInteraction={interaction} onSave={save} />)
  const lab = readonlyLab()
  for (const field of getLab(modelId).parameters) {
    const archived = within(lab).getByLabelText(`${field.label} [${field.unit}]`)
    const marker = within(archived.parentElement!).queryByText('Valore archiviato non utilizzato come parametro indipendente dal vincolo selezionato.')
    expect(Boolean(marker)).toBe(inactive.includes(field.key))
    if (inactive.includes(field.key)) {
      expect(archived.textContent).toBe(String(snapshot.configuration.parameters[field.key]))
      expect(archived.getAttribute('aria-describedby')).toBe(marker!.id)
    }
  }
  if (modelId === 'poiseuille') {
    expect(within(lab).getByLabelText('Differenza di pressione imposta [Pa]').textContent).toBe('100')
    expect(within(lab).getByLabelText('Portata imposta [m³/s]').textContent).toBe('1e-7')
    const table = within(lab).getByRole('table', { name: 'Misure ricalcolate' })
    const row = within(table).getByRole('row', { name: value === 0 ? /Portata volumetrica/ : /Differenza di pressione/ })
    const expected = value === 0 ? Math.PI * .001 ** 4 * 100 / (8 * .001 * .5) : 1e-7 * 8 * .001 * .5 / (Math.PI * .001 ** 4)
    expect(within(row).getByRole('cell', { name: expected.toLocaleString('it-IT', { maximumSignificantDigits: 6, useGrouping: false }) })).toBeTruthy()
  }
  expect(JSON.stringify(snapshot)).toBe(before)
  expect(change).not.toHaveBeenCalled(); expect(interaction).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled()
})

it.each(inactiveCases)('shares the same inactive presentation in the draft controls for %s %s=%s', (modelId, mode, value, inactive) => {
  const snapshot = newLabSnapshot(modelId)
  snapshot.configuration.parameters[mode] = value
  if (modelId === 'process' && value === 2) snapshot.configuration.parameters.volume2 = snapshot.configuration.parameters.volume1
  render(<FluidThermoLab initialSnapshot={snapshot} />)
  for (const field of getLab(modelId).parameters) {
    const input = screen.getByRole(field.key === mode || field.key === 'path' || field.key === 'boundary' || field.key === 'surfaceMode' ? 'combobox' : 'spinbutton', { name: `${field.label} [${field.unit}]` }) as HTMLInputElement
    expect(input.disabled).toBe(modelId === 'process' && inactive.includes(field.key))
    expect(Boolean(within(input.parentElement!).queryByText('Valore archiviato non utilizzato come parametro indipendente dal vincolo selezionato.'))).toBe(inactive.includes(field.key))
  }
})


it.each([
  ['poiseuille', 'boundary', 0, 1, 'pressureDifference', 100],
  ['poiseuille', 'boundary', 1, 0, 'flowRate', 1e-7],
  ['capillary', 'surfaceMode', 0, 1, 'contactAngleDeg', 30],
  ['capillary', 'surfaceMode', 0, 2, 'density', 1000],
  ['capillary', 'surfaceMode', 0, 1, 'gravity', 9.81],
] as [LabId, string, number, number, string, number][])('recovers an empty raw %s parameter after changing %s without disabling it', (modelId, mode, from, to, key, restored) => {
  const snapshot = newLabSnapshot(modelId), change = vi.fn()
  snapshot.configuration.parameters[mode] = from
  render(<FluidThermoLab initialSnapshot={snapshot} onSnapshotChange={change} />)
  const definition = getLab(modelId), field = definition.parameters.find(field => field.key === key)!, modeField = definition.parameters.find(field => field.key === mode)!
  const input = screen.getByRole('spinbutton', { name: `${field.label} [${field.unit}]` }) as HTMLInputElement
  fireEvent.change(input, { target: { value: '' } })
  fireEvent.change(screen.getByRole('combobox', { name: `${modeField.label} [${modeField.unit}]` }), { target: { value: to } })
  expect(screen.getByRole('alert').textContent).toContain('Completa tutti i parametri')
  expect(input.disabled).toBe(false); expect(input.value).toBe('')
  expect(within(input.parentElement!).getByText('Valore archiviato non utilizzato come parametro indipendente dal vincolo selezionato.')).toBeTruthy()
  expect(change).not.toHaveBeenCalled()
  fireEvent.change(input, { target: { value: String(restored) } })
  expect(screen.queryByRole('alert')).toBeNull()
  const emitted = change.mock.lastCall![0]
  expect(emitted.configuration.parameters).toEqual({ ...snapshot.configuration.parameters, [mode]: to, [key]: restored })
})
