import type { PageGeometry } from './canvasBinding'
import type { InkSession, InkTransport } from './session'
import type { InkLayer } from './layer'
import type { InkSource } from './model'
import type { RoomPresentationAdapter } from './presentation'

/** Host supplies sessions and exact PDF page geometry after resolving its Core session.
 * No query-string actor/role/provider is accepted or constructed by Room.
 */
export type RoomInkAdapter = {
  roomId: string
  sessions: { personal: InkSession; shared: InkSession }
  pages: readonly PageGeometry[]
  peers?: readonly InkLayer[]
  signal: AbortSignal
  transport?: InkTransport
  presentation?: RoomPresentationAdapter
}
function sameSource(a: InkSource, b: InkSource): boolean {
  return a.resourceId === b.resourceId && a.revisionId === b.revisionId
    && a.sha256 === b.sha256 && a.pageCount === b.pageCount
}
export function validateRoomInkAdapter(adapter: RoomInkAdapter): void {
  const a = adapter.sessions.personal.scope, b = adapter.sessions.shared.scope
  if (a.roomId !== adapter.roomId || b.roomId !== adapter.roomId || a.ownerId !== b.ownerId
      || a.audience !== 'personal' || b.audience !== 'shared' || !sameSource(a.source, b.source)
      || adapter.pages.length !== a.source.pageCount || adapter.pages.some((p, i) => p.page !== i + 1
        || ![p.x, p.y, p.width, p.height].every(Number.isFinite) || p.width <= 0 || p.height <= 0))
    throw Error('ink_scope_mismatch')
  for (const peer of adapter.peers ?? []) if (peer.scope.ownerId === a.ownerId || peer.scope.audience !== 'shared' || peer.scope.roomId !== adapter.roomId
      || !sameSource(peer.scope.source, a.source)) throw Error('ink_scope_mismatch')
}
