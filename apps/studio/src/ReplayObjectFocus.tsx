import type { AudioObjectReference } from "./store/audioRecording"
export default function ReplayObjectFocus({ scene, target, viewport }: {
  scene: readonly Record<string, unknown>[]
  target: AudioObjectReference | null
  viewport: { scrollX: number; scrollY: number; zoom: number }
}) {
  const element = target && scene.find((item) => item.id === target.elementId && item.version === target.version)
  if (!element || !target) return null
  const { x, y, width, height } = element
  if (![x, y, width, height].every((value) => typeof value === "number" && Number.isFinite(value))) return null
  const angle = typeof element.angle === "number" ? element.angle : 0
  const rotatedWidth = Math.abs((width as number) * Math.cos(angle)) + Math.abs((height as number) * Math.sin(angle))
  const rotatedHeight = Math.abs((width as number) * Math.sin(angle)) + Math.abs((height as number) * Math.cos(angle))
  const left = (x as number) + (width as number) / 2 - rotatedWidth / 2
  const top = (y as number) + (height as number) / 2 - rotatedHeight / 2
  return <div className="st-replay-object-focus" role="img" aria-label={`Oggetto collegato evidenziato: ${target.label}`} style={{
    left: (left + viewport.scrollX) * viewport.zoom - 8,
    top: (top + viewport.scrollY) * viewport.zoom - 8,
    width: rotatedWidth * viewport.zoom + 16, height: rotatedHeight * viewport.zoom + 16,
  }} />
}
