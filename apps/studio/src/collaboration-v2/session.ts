import { InkLayer } from './layer'
import { copy, scopeKey } from './model'
import type { InkObject, LayerScope } from './model'
import { validateInkCheckpoint, type InkCheckpoint } from './persistence'

export type InkRequest = { requestId: string; scope: LayerScope; update: Uint8Array }
/** Adapter must use Core authentication; the scope in a request grants no authority. */
export type InkTransport = { submit(request: InkRequest, signal: AbortSignal): Promise<InkRequest> }
export type InkStatus = 'local' | 'offline' | 'syncing' | 'committed' | 'revoked' | 'error'
export type InkSessionState = { status: InkStatus; pending: boolean; error: string | null; canUndo: boolean; canRedo: boolean; frozen: boolean }
const sameBytes = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((n, i) => n === b[i])

export class InkSession {
  private readonly boundScope: LayerScope
  get scope(): LayerScope { return copy(this.boundScope) }
  private readonly live: InkLayer
  private readonly committed: InkLayer
  private readonly cancellation = new AbortController()
  private pendingId: string | null = null
  private status: InkStatus = 'local'
  private error: string | null = null
  private inFlight: Promise<void> | null = null
  private readonly listeners = new Set<() => void>()
  private frozen = false
  constructor(scope: LayerScope, checkpoint?: InkCheckpoint) {
    this.boundScope = copy(scope)
    if (checkpoint) validateInkCheckpoint(checkpoint, scope)
    this.committed = checkpoint ? InkLayer.restore(scope, checkpoint.committed) : new InkLayer(scope)
    this.live = checkpoint ? InkLayer.restore(scope, checkpoint.pending ?? checkpoint.committed) : new InkLayer(scope)
    if (checkpoint?.pending) { this.pendingId = checkpoint.pendingRequestId; this.status = 'offline' }
  }
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private emit(): void { for (const listener of this.listeners) listener() }
  state(): InkSessionState { return { status: this.status, pending: this.pendingId !== null, error: this.error,
    canUndo: this.live.canUndo, canRedo: this.live.canRedo, frozen: this.frozen } }
  objects(): InkObject[] { return this.live.objects() }
  committedObjects(): InkObject[] { return this.committed.objects() }
  private changed(): void {
    this.pendingId = crypto.randomUUID(); this.status = 'offline'; this.error = null; this.emit()
  }
  add(item: InkObject): void { this.live.add(item); this.changed() }
  undo(): void { if (!this.live.canUndo) { if (this.cancellation.signal.aborted || this.frozen) throw Error('ink_read_only'); return }
    this.live.undo(); this.changed() }
  redo(): void { if (!this.live.canRedo) { if (this.cancellation.signal.aborted || this.frozen) throw Error('ink_read_only'); return }
    this.live.redo(); this.changed() }
  setFrozen(value: boolean): void { this.frozen = value; this.live.setWritable(!value && !this.cancellation.signal.aborted); this.emit() }
  revoke(): void {
    this.cancellation.abort(); this.live.setWritable(false); this.status = 'revoked'; this.error = null; this.emit()
  }
  checkpoint(): InkCheckpoint { return { v: 1, scope: copy(this.scope), committed: this.committed.snapshot(),
    pending: this.pendingId ? this.live.snapshot() : null, pendingRequestId: this.pendingId } }
  flush(transport: InkTransport): Promise<void> {
    if (this.inFlight) return this.inFlight
    if (!this.pendingId || this.cancellation.signal.aborted || this.frozen) return Promise.resolve()
    const request: InkRequest = { requestId: this.pendingId, scope: copy(this.scope), update: this.live.encode() }
    this.status = 'syncing'; this.error = null; this.emit()
    const run = async () => {
      try {
        const ack = await transport.submit(copy(request), this.cancellation.signal)
        if (this.cancellation.signal.aborted) return
        if (!ack || ack.requestId !== request.requestId || scopeKey(ack.scope) !== scopeKey(this.scope)
            || !sameBytes(ack.update, request.update)) throw Error('ink_ack_mismatch')
        this.committed.receive(ack.update)
        if (this.pendingId === request.requestId) this.pendingId = null
        this.status = this.pendingId ? 'offline' : 'committed'
      } catch (failure) {
        if (this.cancellation.signal.aborted) return
        const status = (failure as { status?: number })?.status
        if (status === 401 || status === 403) { this.revoke(); return }
        this.status = 'error'; this.error = failure instanceof Error ? failure.message : 'ink_transport_failed'
      } finally { this.emit() }
    }
    this.inFlight = run().finally(() => { this.inFlight = null })
    return this.inFlight
  }
  destroy(): void { this.revoke(); this.listeners.clear(); this.live.destroy(); this.committed.destroy() }
}
