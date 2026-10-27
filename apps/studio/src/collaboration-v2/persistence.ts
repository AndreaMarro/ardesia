import { InkLayer } from './layer'
import { MAX_UPDATE_BYTES, scopeKey, validateScope } from './model'
import type { LayerScope, LayerSnapshot } from './model'
import { roomPaths } from '../store/roomPaths'

export type InkCheckpoint = { v: 1; scope: LayerScope; committed: LayerSnapshot; pending: LayerSnapshot | null; pendingRequestId: string | null }
type Reader = { read(path: string): Promise<Blob | null> }
type Writer = { write(path: string, value: Blob): Promise<void> }
const MAX_CHECKPOINT_BYTES = MAX_UPDATE_BYTES * 8 + 8192
async function checkpointPath(scope: LayerScope): Promise<string> {
  validateScope(scope)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(scopeKey(scope)))
  const key = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('')
  return roomPaths(scope.roomId).scene.replace('board.excalidraw', `collaboration-v2/${key}.json`)
}
export function validateInkCheckpoint(value: InkCheckpoint, expected: LayerScope): void {
  if (!value || value.v !== 1 || !value.scope || scopeKey(value.scope) !== scopeKey(expected)) throw Error('ink_scope_mismatch')
  if ((value.pending === null) !== (value.pendingRequestId === null)
      || (value.pendingRequestId !== null && (typeof value.pendingRequestId !== 'string' || !/^[a-f0-9-]{36}$/.test(value.pendingRequestId))))
    throw Error('ink_invalid_snapshot')
  const committed = InkLayer.restore(expected, value.committed)
  try { if (value.pending !== null) InkLayer.restore(expected, value.pending).destroy() }
  finally { committed.destroy() }
}
/** WorkspaceStore remains the storage port. localStorage mode is only a device cache. */
export async function writeInkCheckpoint(store: Writer, value: InkCheckpoint): Promise<void> {
  validateInkCheckpoint(value, value.scope)
  const blob = new Blob([JSON.stringify(value)], { type: 'application/json' })
  if (blob.size > MAX_CHECKPOINT_BYTES) throw Error('ink_checkpoint_budget')
  await store.write(await checkpointPath(value.scope), blob)
}
export async function readInkCheckpoint(store: Reader, scope: LayerScope): Promise<InkCheckpoint | null> {
  const blob = await store.read(await checkpointPath(scope))
  if (!blob) return null
  if (blob.size > MAX_CHECKPOINT_BYTES) throw Error('ink_checkpoint_budget')
  const value = JSON.parse(await blob.text()) as InkCheckpoint
  validateInkCheckpoint(value, scope)
  return value
}
