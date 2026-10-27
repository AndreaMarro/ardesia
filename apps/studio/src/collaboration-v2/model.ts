/** Canonical page coordinates; viewport scroll/zoom never enter shared state. */
export type InkSource = {
  resourceId: string; revisionId: string; sha256: string; pageCount: number
}
export type LayerScope = {
  v: 1; roomId: string; source: InkSource; ownerId: string; audience: 'personal' | 'shared'
}
export type InkObject = {
  v: 1; id: string; authorId: string; source: InkSource & { page: number }
  kind: 'stroke' | 'formula' | 'proposal'; color: string; width: number
  points?: number[][]; text?: string; targetId?: string
}
export type LayerSnapshot = { v: 1; scope: LayerScope; update: number[] }
export const MAX_UPDATE_BYTES = 512 * 1024
export const MAX_OBJECTS = 2000
const id = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
const sourceId = (value: unknown): value is string => typeof value === 'string' && /^[^\u0000-\u0020]{1,256}$/.test(value)
const unit = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
export const copy = <T>(value: T): T => structuredClone(value)
export function scopeKey(scope: LayerScope): string {
  return JSON.stringify([scope.v, scope.roomId, scope.source.resourceId, scope.source.revisionId,
    scope.source.sha256, scope.source.pageCount, scope.ownerId, scope.audience])
}
export function validateScope(scope: LayerScope): void {
  if (!scope || scope.v !== 1 || !id(scope.roomId) || !id(scope.ownerId)
      || !scope.source || !sourceId(scope.source.resourceId) || !sourceId(scope.source.revisionId)
      || !/^[a-f0-9]{64}$/.test(scope.source.sha256) || !Number.isInteger(scope.source.pageCount)
      || scope.source.pageCount < 1 || scope.source.pageCount > 200
      || !['personal', 'shared'].includes(scope.audience)) throw Error('ink_invalid_scope')
}
export function validateObject(item: InkObject, scope: LayerScope): void {
  if (!item || item.v !== 1 || !id(item.id)) throw Error('ink_invalid_object')
  if (item.authorId !== scope.ownerId) throw Error('ink_author_mismatch')
  const source = item.source
  if (!source || source.resourceId !== scope.source.resourceId || source.revisionId !== scope.source.revisionId
      || source.sha256 !== scope.source.sha256 || source.pageCount !== scope.source.pageCount)
    throw Error('ink_source_mismatch')
  if (!Number.isInteger(source.page) || source.page < 1 || source.page > source.pageCount
      || !['stroke', 'formula', 'proposal'].includes(item.kind) || !/^#[a-fA-F0-9]{6}$/.test(item.color)
      || !unit(item.width) || item.width <= 0 || item.width > .05
      || Object.keys(item).some(key => !['v', 'id', 'authorId', 'source', 'kind', 'color', 'width', 'points', 'text', 'targetId'].includes(key)))
    throw Error('ink_invalid_object')
  if (!Array.isArray(item.points) || item.points.length < (item.kind === 'stroke' ? 2 : 1)
      || item.points.length > 4096 || item.points.some(p => !Array.isArray(p) || p.length !== 3 || !p.every(unit)))
    throw Error('ink_invalid_object')
  if (item.kind !== 'stroke' && (typeof item.text !== 'string' || !item.text.trim() || item.text.length > 4000 || item.text.includes('\0')))
    throw Error('ink_invalid_object')
  if (item.kind === 'proposal' && !id(item.targetId)) throw Error('ink_invalid_object')
}
