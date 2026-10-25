import { copy, scopeKey, validateObject } from './model'
import type { InkObject, LayerScope } from './model'

export type PageGeometry = { x: number; y: number; width: number; height: number; page: number }
export type CanvasStroke = {
  id: string; type: string; x: number; y: number; angle?: number; isDeleted?: boolean
  points?: readonly (readonly number[])[]; pressures?: readonly number[]; strokeColor: string; strokeWidth: number
}
export type InkCanvasElement = {
  id: string; type: 'freedraw' | 'text'; x: number; y: number; width: number; height: number
  angle: number; strokeColor: string; strokeWidth: number; locked: true
  points?: number[][]; pressures?: number[]; text?: string; fontSize?: number
  customData: { ardesiaInkV1: { scope: string; objectId: string; authorId: string; page: number; revisionId: string } }
}
function validatePage(page: PageGeometry): void {
  if (![page.x, page.y, page.width, page.height].every(Number.isFinite) || page.width <= 0 || page.height <= 0)
    throw Error('ink_unsupported_geometry')
}
/** Call only after Excalidraw pointer-up: in-progress strokes stay local. */
export function captureInkStroke(element: CanvasStroke, scope: LayerScope, page: PageGeometry): InkObject {
  validatePage(page)
  if (element.type !== 'freedraw' || element.isDeleted || (element.angle ?? 0) !== 0 || !element.points)
    throw Error('ink_unsupported_geometry')
  const item: InkObject = {
    v: 1, id: element.id, authorId: scope.ownerId, source: { ...copy(scope.source), page: page.page },
    kind: 'stroke', color: element.strokeColor, width: element.strokeWidth / page.width,
    points: element.points.map((point, i) => [
      (element.x + point[0] - page.x) / page.width, (element.y + point[1] - page.y) / page.height,
      element.pressures?.[i] ?? .5,
    ]),
  }
  validateObject(item, scope)
  return item
}
export function projectInk(item: InkObject, scope: LayerScope, page: PageGeometry): InkCanvasElement {
  validatePage(page); validateObject(item, scope)
  if (item.source.page !== page.page) throw Error('ink_page_mismatch')
  const points = item.points!, first = points[0]
  const xs = points.map(p => p[0]), ys = points.map(p => p[1])
  return {
    id: `ink-${scope.ownerId}-${scope.audience}-${item.id}`, type: item.kind === 'stroke' ? 'freedraw' : 'text',
    x: page.x + first[0] * page.width, y: page.y + first[1] * page.height,
    width: (Math.max(...xs) - Math.min(...xs)) * page.width,
    height: (Math.max(...ys) - Math.min(...ys)) * page.height,
    angle: 0, strokeColor: item.color, strokeWidth: item.width * page.width, locked: true,
    ...(item.kind === 'stroke' ? { points: points.map(p => [(p[0] - first[0]) * page.width, (p[1] - first[1]) * page.height]),
      pressures: points.map(p => p[2]) } : { text: item.kind === 'proposal' ? `Proposta: ${item.text}` : item.text, fontSize: 20 }),
    customData: { ardesiaInkV1: { scope: scopeKey(scope), objectId: item.id, authorId: item.authorId,
      page: item.source.page, revisionId: item.source.revisionId } },
  }
}
/** Replaces only the named ink projections. PDF and ordinary canvas objects keep their coordinates and order. */
export function applyInkProjection<T extends { id: string }>(
  scene: readonly T[], projected: readonly InkCanvasElement[], scopes: readonly LayerScope[],
): (T | InkCanvasElement)[] {
  const owned = new Set(scopes.map(scopeKey))
  return [...scene.filter(item => {
    const metadata = (item as T & { customData?: InkCanvasElement['customData'] }).customData?.ardesiaInkV1
    return !metadata || !owned.has(metadata.scope)
  }), ...projected]
}
