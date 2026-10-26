type SceneObject = { id: string; type?: string; customData?: Record<string, unknown> | null }
export function isInkProjection(element: SceneObject): boolean {
  return !!element.customData && Object.hasOwn(element.customData, 'ardesiaInkV1')
}
/** Reserved projections are never a legacy board/journal/export authority.
 * During a gesture, new freedraw drafts are also excluded until scoped capture.
 */
export function legacyBoardScene<T extends SceneObject>(elements: readonly T[], legacyInkIds?: ReadonlySet<string>): T[] {
  return elements.filter(element => !isInkProjection(element)
    && (!legacyInkIds || element.type !== 'freedraw' || legacyInkIds.has(element.id)))
}
/** The public Excalidraw pointerDown fires AFTER insertion. Seed before attachment. */
export class CompletedInkCapture {
  private readonly attempted: Set<string>
  constructor(initial: readonly SceneObject[]) { this.attempted = new Set(initial.map(element => element.id)) }
  completed<T extends SceneObject>(elements: readonly T[]): T[] {
    const fresh = elements.filter(element => element.type === 'freedraw' && !isInkProjection(element) && !this.attempted.has(element.id))
    for (const element of fresh) this.attempted.add(element.id)
    return fresh
  }
}
