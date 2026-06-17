// Versione del protocollo ToolHost (TOOLHOST-SPEC-v0 §2: semver, host supporta major N e N-1).
export const PROTOCOL_VERSION = "1.0.0"

const VERSION_RE = /^(\d+)\.(\d+)(?:\.(\d+))?$/

export function parseVersion(v: string): [number, number, number] | null {
  const m = VERSION_RE.exec(v.trim())
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3] ?? "0")]
}

function compare(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1
  }
  return 0
}

/**
 * Range minimale stile manifest ("`>=1.0 <2.0`"): comparatori separati da spazi,
 * operatori ammessi `>=` e `<`. Niente prerelease/caret/tilde — vocabolario chiuso v0.
 */
export function isValidProtocolRange(range: string): boolean {
  const parts = range.trim().split(/\s+/)
  if (parts.length === 0) return false
  for (const part of parts) {
    const m = /^(>=|<)(.+)$/.exec(part)
    if (!m || parseVersion(m[2]) === null) return false
  }
  return true
}

export function protocolSatisfies(version: string, range: string): boolean {
  const v = parseVersion(version)
  if (v === null || !isValidProtocolRange(range)) return false
  for (const part of range.trim().split(/\s+/)) {
    const m = /^(>=|<)(.+)$/.exec(part)
    if (!m) return false
    const bound = parseVersion(m[2])
    if (bound === null) return false
    const c = compare(v, bound)
    if (m[1] === ">=" ? c < 0 : c >= 0) return false
  }
  return true
}
