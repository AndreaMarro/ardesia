// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import JSZip from 'jszip'
import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import SavedLessonsView from '../design/SavedLessonsView'
import { WorkspaceStore } from '../store/WorkspaceStore'
import { roomPaths } from '../store/roomPaths'
import { loadReplayTimeline } from '../store/replayTimeline'
import { IndexedDbEventLog } from '../lessonos/indexedDbEventLog'

const current = 'wbstudio-new-current'
const original = 'closure1-1c-studio-20261028-669b5d20'
const fixture = readFileSync(join(__dirname, 'fixtures/replay/hydrostatic-history-669b5d20.lesson'))
let logs: IndexedDbEventLog[] = []
beforeEach(() => {
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    get length() { return entries.size }, clear: () => entries.clear(), getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null, removeItem: (key: string) => { entries.delete(key) },
    setItem: (key: string, value: string) => { entries.set(key, String(value)) },
  } satisfies Storage)
  vi.stubGlobal('Blob', NodeBlob); vi.stubGlobal('File', NodeFile); vi.stubGlobal('crypto', webcrypto)
  // Bridge browser ZIP reads to Node Blob in jsdom; keep the actual importer.
  vi.stubGlobal('FileReader', class {
    result: ArrayBuffer | null = null
    error: unknown = null
    onload: ((event: { target: unknown }) => void) | null = null
    onerror: ((event: { target: unknown }) => void) | null = null
    readAsArrayBuffer(blob: Blob) {
      void blob.arrayBuffer().then(value => { this.result = Uint8Array.from(new Uint8Array(value)).buffer; this.onload?.({ target: this }) }, error => { this.error = error; this.onerror?.({ target: this }) })
    }
  })
  history.replaceState(null, '', '/?vista=lezioni-salvate#' + current)
})
afterEach(async () => { cleanup(); for (const log of logs) await log.close(); logs = []; vi.restoreAllMocks(); vi.unstubAllGlobals() })
const bundle = () => new File([Uint8Array.from(fixture)], 'hydrostatic.lesson', { type: 'application/zip' })
async function bytes(store: WorkspaceStore, prefix?: string) {
  return Promise.all((await store.list(prefix)).map(async entry => [entry.path, Array.from(new Uint8Array(await entry.data.arrayBuffer()))]))
}
async function setup() {
  const store = new WorkspaceStore(); await store.init()
  await store.write(roomPaths(current).scene, new Blob([JSON.stringify({ elements: [{ id: 'current-draft', version: 4 }], appState: {}, files: {} })]))
  const log = new IndexedDbEventLog({ factory: new IDBFactory() }); await log.open(); logs.push(log)
  const view = render(<SavedLessonsView store={store} eventLogFactory={async () => log} />)
  await waitFor(() => expect((screen.getByLabelText('Seleziona bundle .lesson') as HTMLInputElement).disabled).toBe(false))
  return { store, log, view }
}
function selectOriginal(file = bundle()) {
  fireEvent.click(screen.getByRole('button', { name: 'Apri lezione salvata' }))
  fireEvent.change(screen.getByLabelText('Seleziona lezione salvata da aprire'), { target: { files: [file] } })
}

it('opens the real bundle in its verified original identity only after confirmation, preserving the current room', async () => {
  const { store, log } = await setup(), before = await bytes(store), currentBytes = await bytes(store, `raw/${current}/`)
  const write = vi.spyOn(store, 'write'), restore = vi.spyOn(store, 'importLessonBlobForRoom')
  selectOriginal()
  await screen.findByRole('heading', { name: 'Anteprima lezione salvata' })
  expect(screen.getByText(original)).toBeTruthy()
  expect(write).not.toHaveBeenCalled(); expect(restore).not.toHaveBeenCalled(); expect(await bytes(store)).toEqual(before)
  expect(screen.queryByRole('link', { name: 'Apri la lezione importata' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Conferma import nella lezione originale' }))
  const link = await screen.findByRole('link', { name: 'Apri la lezione importata' })
  expect(link.getAttribute('href')).toBe('/#' + original)
  expect(restore).toHaveBeenCalledWith(expect.any(File), original, log)
  expect(await bytes(store, `raw/${current}/`)).toEqual(currentBytes)
  expect((await loadReplayTimeline(store, original)).events).toHaveLength(14)
  expect(await store.loadScene(original)).toContain('GccyG_PFvXf7LEbsSCeGk')
  expect(localStorage.getItem('studio-scene:' + original)).toContain('GccyG_PFvXf7LEbsSCeGk')
  expect((await log.readAllEnvelopes()).length).toBeGreaterThan(0)
  expect(location.hash).toBe('#' + current)
})

it('cancels a validated preview without writes, import or navigation', async () => {
  const { store } = await setup(), before = await bytes(store), write = vi.spyOn(store, 'write'), restore = vi.spyOn(store, 'importLessonBlobForRoom')
  selectOriginal(); await screen.findByRole('heading', { name: 'Anteprima lezione salvata' })
  fireEvent.click(screen.getByRole('button', { name: 'Annulla import' }))
  expect(screen.queryByRole('heading', { name: 'Anteprima lezione salvata' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Apri la lezione importata' })).toBeNull()
  expect(write).not.toHaveBeenCalled(); expect(restore).not.toHaveBeenCalled(); expect(await bytes(store)).toEqual(before)
  expect(location.hash).toBe('#' + current)
})

it('the existing current-room restore still rejects the real foreign bundle without writing', async () => {
  const { store } = await setup(), before = await bytes(store), write = vi.spyOn(store, 'write')
  fireEvent.change(screen.getByLabelText('Seleziona bundle .lesson'), { target: { files: [bundle()] } })
  expect((await screen.findByRole('alert')).textContent).toContain('lessonId non coincide con la destinazione')
  expect(write).not.toHaveBeenCalled(); expect(await bytes(store)).toEqual(before)
  expect(screen.queryByRole('button', { name: 'Importa il bundle' })).toBeNull()
})

it.each(['zip', 'hash', 'identity', 'unassigned'] as const)('rejects %s input through the real validator without creating any target', async kind => {
  const { store } = await setup(), before = await bytes(store), write = vi.spyOn(store, 'write'), restore = vi.spyOn(store, 'importLessonBlobForRoom')
  let file = new File(['not a zip'], 'bad.lesson')
  if (kind !== 'zip') {
    const zip = kind === 'unassigned' ? new JSZip().file('raw/board.excalidraw', '{"elements":[]}') : await JSZip.loadAsync(bundle())
    if (kind === 'hash') zip.file('raw/board.excalidraw', '{"elements":[]}')
    if (kind === 'identity') { const manifest = JSON.parse(await zip.file('manifest.json')!.async('text')); manifest.lessonId = current; zip.file('manifest.json', JSON.stringify(manifest)) }
    file = new File([Uint8Array.from(await zip.generateAsync({ type: 'uint8array' }))], 'bad.lesson')
  }
  selectOriginal(file)
  await screen.findByRole('alert')
  expect(screen.queryByRole('button', { name: 'Conferma import nella lezione originale' })).toBeNull()
  expect(write).not.toHaveBeenCalled(); expect(restore).not.toHaveBeenCalled(); expect(await bytes(store)).toEqual(before)
})

it('preserves a nonempty existing LessonOS log and makes the skipped restore visible', async () => {
  const { store, log } = await setup()
  await log.append({ kind: 'lesson.started', room: current, t: 1, evidence: ['lesson:' + current] })
  const before = await log.readAllEnvelopes(), restoreLog = vi.spyOn(log, 'importSnapshot')
  selectOriginal(); await screen.findByRole('heading', { name: 'Anteprima lezione salvata' })
  fireEvent.click(screen.getByRole('button', { name: 'Conferma import nella lezione originale' }))
  await screen.findByRole('link', { name: 'Apri la lezione importata' })
  expect(screen.getByRole('status').textContent).toContain('memoria LessonOS esistente non è stata unita')
  expect(restoreLog).not.toHaveBeenCalled(); expect(await log.readAllEnvelopes()).toEqual(before)
  expect((await loadReplayTimeline(store, original)).events).toHaveLength(14)
})
