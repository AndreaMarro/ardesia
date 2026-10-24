import { parseSessionYamlV2, sessionPaths, type LessonSessionIdentityV1, type SessionYamlV2 } from "./sessionState"

type ReadPort = Readonly<{ read(path: string): Promise<Blob | null> }>
type TransactionBinding = Readonly<{ entries: readonly Readonly<{ targetPath: string; stagePath: string; backupPath: string | null }>[] }>

export function canonicalAudioIdentity(path: string): LessonSessionIdentityV1 | null {
  const match = /^raw\/([^/]+)\/([^/]+)\/(?:session\.yaml|audio\/[^/]+)$/.exec(path)
  if (!match) return null
  try {
    const identity = { lessonId: match[1]!, sessionId: match[2]! }
    sessionPaths(identity)
    return identity
  } catch { return null }
}
export function isAudioWriteFencedPath(path: string): boolean {
  return canonicalAudioIdentity(path) !== null || /^raw\/\.ardesia\/import-transactions\/[^/]+\/(?:stage|backup)\/\d+\.blob$/.test(path)
}
async function sessionValue(port: ReadPort, path: string): Promise<SessionYamlV2 | null> {
  const data = await port.read(path)
  return data ? parseSessionYamlV2(new Uint8Array(await data.arrayBuffer())) : null
}
async function transactionBinding(port: ReadPort, path: string): Promise<TransactionBinding | null> {
  const match = /^(raw\/\.ardesia\/import-transactions\/[^/]+)\/(?:stage|backup)\/\d+\.blob$/.exec(path)
  if (!match) return null
  const record = await port.read(`${match[1]}/transaction.json`)
  if (!record) throw new Error("Audio fence: import copy has no transaction binding")
  const parsed: unknown = JSON.parse(await record.text())
  if (typeof parsed !== "object" || parsed === null || !Array.isArray((parsed as TransactionBinding).entries)) throw new Error("Audio fence: invalid transaction binding")
  return parsed as TransactionBinding
}

/** Called inside the existing WorkspaceStore mutation lease, immediately before driver.write. */
export async function assertAudioWriteAllowed(port: ReadPort, requestedPath: string, data: Blob): Promise<void> {
  const transaction = await transactionBinding(port, requestedPath)
  const binding = transaction?.entries.find((entry) => entry.stagePath === requestedPath || entry.backupPath === requestedPath)
  const targetPath = binding?.targetPath ?? requestedPath
  const identity = canonicalAudioIdentity(targetPath)
  if (!identity) return
  const paths = sessionPaths(identity)
  const current = await sessionValue(port, paths.session)
  if (targetPath === paths.session) {
    // Generic raw writes can still introduce corruption for observable recovery;
    // well-formed session snapshots must never overwrite a newer CAS decision.
    let next: SessionYamlV2
    try { next = parseSessionYamlV2(new Uint8Array(await data.arrayBuffer())) } catch { return }
    if (next.lessonId !== identity.lessonId || next.sessionId !== identity.sessionId) throw new Error("Audio fence: session identity mismatch")
    if (current && ((current.revision > 0 && !current.audioConsent && next.audioConsent) || current.revision > next.revision || (current.revision === next.revision && (
      current.audioConsent !== next.audioConsent || current.audioStartEpoch !== next.audioStartEpoch || current.created !== next.created
    )))) throw new Error("Audio fence: newer session decision exists; stale session write refused")
    return
  }
  if (current?.audioConsent) return
  // A fresh import stages its consent before writing any targets. A later OFF
  // has a higher revision and cannot be bypassed by those staged bytes.
  const stagedSession = transaction?.entries.find((entry) => entry.targetPath === paths.session)
  const incoming = stagedSession ? await sessionValue(port, stagedSession.stagePath) : null
  if (incoming?.audioConsent && (!current || (current.revision === 0 && incoming.revision > current.revision))) return
  throw new Error("Audio fence: media write refused after revocation or without canonical consent")
}
