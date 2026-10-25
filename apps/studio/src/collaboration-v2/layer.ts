import * as Y from 'yjs'
import { copy, MAX_OBJECTS, MAX_UPDATE_BYTES, scopeKey, validateObject, validateScope } from './model'
import type { InkObject, LayerScope, LayerSnapshot } from './model'

function validateDocument(doc: Y.Doc, scope: LayerScope): void {
  if ([...doc.share.keys()].some(key => key !== 'objects')) throw Error('ink_unknown_root')
  if (doc.store.pendingStructs !== null || doc.store.pendingDs !== null) throw Error('ink_missing_dependency')
  const objects = doc.getMap<InkObject>('objects')
  if (objects.size > MAX_OBJECTS) throw Error('ink_capacity')
  for (const [key, value] of objects) {
    validateObject(value, scope)
    if (key !== value.id) throw Error('ink_invalid_object')
  }
}
/** This validates data, not identity. A server must check Core session/scope ACL first.
 * Incomplete updates are rejected: retry with the complete layer snapshot.
 */
export function validateLayerUpdate(scope: LayerScope, committed: Uint8Array, update: Uint8Array): Uint8Array {
  validateScope(scope)
  if (!(update instanceof Uint8Array) || update.byteLength === 0 || update.byteLength > MAX_UPDATE_BYTES
      || committed.byteLength > MAX_UPDATE_BYTES) throw Error('ink_update_budget')
  const candidate = new Y.Doc()
  try {
    if (committed.byteLength) Y.applyUpdate(candidate, committed)
    Y.applyUpdate(candidate, update)
    validateDocument(candidate, scope)
    const result = Y.encodeStateAsUpdate(candidate)
    if (result.byteLength > MAX_UPDATE_BYTES) throw Error('ink_update_budget')
    return result
  } finally { candidate.destroy() }
}

export class InkLayer {
  private readonly boundScope: LayerScope
  get scope(): LayerScope { return copy(this.boundScope) }
  private readonly doc = new Y.Doc()
  private readonly localOrigin = Symbol('local-ink')
  private readonly remoteOrigin = Symbol('committed-ink')
  private readonly objectsMap = this.doc.getMap<InkObject>('objects')
  private readonly history: Y.UndoManager
  private writable = true
  constructor(scope: LayerScope) {
    validateScope(scope); this.boundScope = copy(scope)
    this.history = new Y.UndoManager(this.objectsMap, { trackedOrigins: new Set([this.localOrigin]), captureTimeout: 0 })
  }
  setWritable(value: boolean): void { this.writable = value }
  private assertWritable(): void { if (!this.writable) throw Error('ink_read_only') }
  add(value: InkObject): void {
    this.assertWritable(); validateObject(value, this.scope)
    if (this.objectsMap.has(value.id)) throw Error('ink_duplicate_id')
    if (this.objectsMap.size >= MAX_OBJECTS) throw Error('ink_capacity')
    const item = copy(value), probe = new Y.Doc()
    try {
      Y.applyUpdate(probe, this.encode()); probe.getMap('objects').set(item.id, item)
      if (Y.encodeStateAsUpdate(probe).byteLength > MAX_UPDATE_BYTES) throw Error('ink_update_budget')
    } finally { probe.destroy() }
    this.doc.transact(() => this.objectsMap.set(item.id, item), this.localOrigin)
  }
  undo(): void { this.assertWritable(); this.history.undo() }
  redo(): void { this.assertWritable(); this.history.redo() }
  get canUndo(): boolean { return this.writable && this.history.undoStack.length > 0 }
  get canRedo(): boolean { return this.writable && this.history.redoStack.length > 0 }
  objects(): InkObject[] { return copy([...this.objectsMap.values()].sort((a, b) => a.id.localeCompare(b.id))) }
  encode(): Uint8Array { return Y.encodeStateAsUpdate(this.doc) }
  receive(update: Uint8Array): void {
    validateLayerUpdate(this.scope, this.encode(), update)
    Y.applyUpdate(this.doc, update, this.remoteOrigin)
  }
  snapshot(): LayerSnapshot { return { v: 1, scope: copy(this.scope), update: Array.from(this.encode()) } }
  static restore(scope: LayerScope, snapshot: LayerSnapshot): InkLayer {
    if (!snapshot || snapshot.v !== 1 || !snapshot.scope || scopeKey(scope) !== scopeKey(snapshot.scope)) throw Error('ink_scope_mismatch')
    if (!Array.isArray(snapshot.update) || snapshot.update.length > MAX_UPDATE_BYTES
        || snapshot.update.some(n => !Number.isInteger(n) || n < 0 || n > 255)) throw Error('ink_invalid_snapshot')
    const layer = new InkLayer(scope)
    try { layer.receive(Uint8Array.from(snapshot.update)); return layer }
    catch (error) { layer.destroy(); throw error }
  }
  destroy(): void { this.history.destroy(); this.doc.destroy() }
}
