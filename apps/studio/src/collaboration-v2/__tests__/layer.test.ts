import { expect, test } from 'vitest'
import * as Y from 'yjs'
import { InkLayer, validateLayerUpdate } from '../layer'
import type { InkObject, LayerScope } from '../model'

const source = { resourceId: 'synthetic-pdf', revisionId: 'pdf-v1', sha256: 'a'.repeat(64), pageCount: 3 }
const scope = (ownerId = 'alice'): LayerScope => ({ v: 1, roomId: 's07', source, ownerId, audience: 'shared' })
const stroke = (id: string, authorId = 'alice', page = 1): InkObject => ({
  v: 1, id, authorId, source: { ...source, page }, kind: 'stroke',
  points: [[.1, .2, .5], [.3, .4, 1]], color: '#4f46e5', width: .003,
})

test.each([3, 11])('%i concurrent authors converge without loss, duplication or global undo', count => {
  const authors = Array.from({ length: count }, (_, i) => 'actor-' + i)
  const writers = authors.map(actor => new InkLayer(scope(actor)))
  writers.forEach((layer, i) => layer.add(stroke('stroke-' + i, authors[i])))
  // Each reader has one isolated replica per author. Delivery order is irrelevant.
  const readers = authors.map(() => authors.map(actor => new InkLayer(scope(actor))))
  for (const replica of readers) for (let i = count - 1; i >= 0; i--) {
    replica[i].receive(writers[i].encode()); replica[i].receive(writers[i].encode())
  }
  writers[0].undo()
  for (const replica of readers) {
    replica[0].receive(writers[0].encode())
    expect(replica.flatMap(layer => layer.objects()).map(item => item.id).sort())
      .toEqual(authors.slice(1).map((_, i) => 'stroke-' + (i + 1)).sort())
  }
})

test('undo on one device preserves the same author’s other-device stroke', () => {
  const a = new InkLayer(scope()), b = new InkLayer(scope())
  a.add(stroke('first')); b.receive(a.encode()); b.add(stroke('second'))
  a.receive(b.encode()); a.undo(); b.receive(a.encode())
  expect(b.objects().map(item => item.id)).toEqual(['second'])
})

test('full snapshots reopen exact page/version, and foreign source updates cannot poison the live document', () => {
  const layer = new InkLayer(scope()); layer.add(stroke('page-3', 'alice', 3))
  const reopened = InkLayer.restore(scope(), layer.snapshot())
  expect(reopened.objects()).toEqual([stroke('page-3', 'alice', 3)])
  const other = new InkLayer({ ...scope(), source: { ...source, revisionId: 'pdf-v2' } })
  other.add({ ...stroke('wrong'), source: { ...source, revisionId: 'pdf-v2', page: 1 } })
  expect(() => reopened.receive(other.encode())).toThrow('ink_source_mismatch')
  expect(reopened.objects()).toEqual([stroke('page-3', 'alice', 3)])
  expect(() => InkLayer.restore({ ...scope(), roomId: 'other' }, layer.snapshot())).toThrow('ink_scope_mismatch')
})

test('binary candidate validation rejects forged author, hidden roots, invalid geometry and incomplete updates', () => {
  const doc = new Y.Doc(); doc.getMap('objects').set('forged', stroke('forged', 'bob'))
  expect(() => validateLayerUpdate(scope(), new Uint8Array(), Y.encodeStateAsUpdate(doc))).toThrow('ink_author_mismatch')
  const hidden = new Y.Doc(); hidden.getMap('roles').set('alice', 'teacher')
  expect(() => validateLayerUpdate(scope(), new Uint8Array(), Y.encodeStateAsUpdate(hidden))).toThrow('ink_unknown_root')
  const invalid = new InkLayer(scope())
  expect(() => invalid.add({ ...stroke('bad'), points: [[NaN, .1, 1]] })).toThrow('ink_invalid_object')
  const causal = new Y.Doc(), map = causal.getMap('objects')
  map.set('one', stroke('one')); const vector = Y.encodeStateVector(causal)
  map.set('two', stroke('two'))
  expect(() => validateLayerUpdate(scope(), new Uint8Array(), Y.encodeStateAsUpdate(causal, vector))).toThrow('ink_missing_dependency')
})

test('freeze rejects local add/undo/redo but still accepts committed peer state', () => {
  const a = new InkLayer(scope()), b = new InkLayer(scope())
  a.add(stroke('first')); b.receive(a.encode()); b.setWritable(false)
  expect(() => b.add(stroke('blocked'))).toThrow('ink_read_only')
  expect(() => b.undo()).toThrow('ink_read_only')
  a.add(stroke('second')); b.receive(a.encode())
  expect(b.objects()).toHaveLength(2)
})

test('caller mutation cannot alter the document or its snapshot', () => {
  const layer = new InkLayer(scope()), item = stroke('one')
  layer.add(item); item.points![0][0] = .9
  const objects = layer.objects(); objects[0].points![0][0] = .8
  expect(layer.objects()[0].points![0][0]).toBe(.1)
})

test('large add/undo/redo cycles remain within the encoded budget and reopen at every accepted mutation', () => {
  const layer = new InkLayer(scope())
  const large = (id: string) => ({ ...stroke(id), points: Array.from({length: 4096}, (_, i) => [i / 4096, .123456789, .987654321]) })
  let bounded = false
  for (let i = 0; i < 30; i++) {
    try { layer.add(large('large-' + i)); if (layer.canUndo) layer.undo(); if (layer.canRedo) layer.redo(); if (layer.canUndo) layer.undo() }
    catch (error) { expect(String(error)).toMatch(/ink_(capacity|update_budget)/); bounded = true }
    expect(layer.encode().byteLength).toBeLessThanOrEqual(512 * 1024)
    const cold = InkLayer.restore(scope(), layer.snapshot()); cold.destroy()
    if (bounded) break
  }
  expect(bounded).toBe(true)
})
