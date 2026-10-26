import { copy } from './model'
import type { InkSource } from './model'
import type { PageGeometry } from './canvasBinding'

export type PresentationTarget = { v: 1; roomId: string; source: InkSource; page: number; center: [number, number] }
export type PresentationFocus = { channelId: string; sequence: number; target: PresentationTarget }
/** Host resolves the active Core presentation/grant before supplying this port.
 * Client validation below checks data only; this is neither a relay nor an ACL.
 */
export type RoomPresentationAdapter = {
  channelId: string
  focus?: PresentationFocus | null
  publish?: (target: PresentationTarget, signal: AbortSignal) => Promise<void>
}
const validChannel = (value: unknown) => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
function validateFocus(focus: PresentationFocus, channelId: string, roomId: string, source: InkSource): void {
  const target = focus?.target, actual = target?.source
  if (!focus || focus.channelId !== channelId || !Number.isSafeInteger(focus.sequence) || focus.sequence < 0
      || !target || target.v !== 1 || target.roomId !== roomId || !actual
      || actual.resourceId !== source.resourceId || actual.revisionId !== source.revisionId
      || actual.sha256 !== source.sha256 || actual.pageCount !== source.pageCount
      || !Number.isInteger(target.page) || target.page < 1 || target.page > source.pageCount
      || !Array.isArray(target.center) || target.center.length !== 2
      || target.center.some(value => !Number.isFinite(value) || value < 0 || value > 1)) throw Error('ink_focus_mismatch')
}
/** Local, ephemeral opt-in policy. Camera movement never becomes ink/history. */
export class PresentationFollower {
  private readonly roomId: string
  private readonly source: InkSource
  private channelId: string | null = null
  private latest: PresentationFocus | null = null
  private appliedSequence = -1
  private receivedSequence = -1
  private following = false
  private interacting = false
  private revoked = false
  constructor(roomId: string, source: InkSource) { this.roomId = roomId; this.source = copy(source) }
  get isFollowing(): boolean { return this.following }
  receive(adapter?: RoomPresentationAdapter): PresentationTarget | null {
    if (this.revoked) return null
    if (!adapter) { this.channelId = null; this.latest = null; this.following = false; this.appliedSequence = -1; this.receivedSequence = -1; return null }
    if (!validChannel(adapter.channelId)) throw Error('ink_focus_mismatch')
    if (adapter.focus) validateFocus(adapter.focus, adapter.channelId, this.roomId, this.source)
    if (adapter.channelId !== this.channelId) {
      this.channelId = adapter.channelId; this.latest = null; this.following = false; this.appliedSequence = -1; this.receivedSequence = -1
    }
    if (!adapter.focus) { this.latest = null; return null }
    if (adapter.focus.sequence <= this.receivedSequence) return null
    this.receivedSequence = adapter.focus.sequence
    this.latest = copy(adapter.focus)
    return this.take()
  }
  setFollowing(value: boolean): PresentationTarget | null {
    if (this.revoked) return null
    if (value && !this.following) this.appliedSequence = -1
    this.following = value
    return this.take()
  }
  beginInteraction(): void { this.interacting = true }
  endInteraction(): PresentationTarget | null { this.interacting = false; return this.take() }
  revoke(): void { this.revoked = true; this.following = false; this.latest = null }
  private take(): PresentationTarget | null {
    if (this.revoked || !this.following || this.interacting || !this.latest || this.latest.sequence <= this.appliedSequence) return null
    this.appliedSequence = this.latest.sequence
    return copy(this.latest.target)
  }
}
export function presentationPoint(target: PresentationTarget, geometry: PageGeometry): { x: number; y: number } {
  if (target.page !== geometry.page || ![geometry.x, geometry.y, geometry.width, geometry.height].every(Number.isFinite)
      || geometry.width <= 0 || geometry.height <= 0) throw Error('ink_focus_mismatch')
  return { x: geometry.x + target.center[0] * geometry.width, y: geometry.y + target.center[1] * geometry.height }
}
