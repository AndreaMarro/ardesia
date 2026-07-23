import type { WorkspaceStore } from "./WorkspaceStore"

export const LESSON_IMPORT_TRANSACTION_ROOT = "raw/.ardesia/import-transactions"
const ACTIVE_TRANSACTION_PATH = `${LESSON_IMPORT_TRANSACTION_ROOT}/active.json`

type TransactionPhase =
  | "staging"
  | "prepared"
  | "committing"
  | "restoring"
  | "rollback-needed"
  | "rolled-back"
  | "aborted"
  | "committed"

type BlobReceipt = Readonly<{
  bytes: number
  sha256: string
  type: string
}>

type TransactionEntry = Readonly<{
  sourcePath: string
  targetPath: string
  stagePath: string
  backupPath: string | null
  previous: BlobReceipt | null
  next: BlobReceipt
}>

export type PendingLessonImport = Readonly<{
  v: 1
  id: string
  phase: TransactionPhase
  createdAt: string
  entries: readonly TransactionEntry[]
  recordPath: string
}>

export type LessonImportCandidate = Readonly<{
  sourcePath: string
  targetPath: string
  data: Blob
}>

type ActivePointer = Readonly<{
  v: 1
  id: string
  recordPath: string
}>

const TRANSACTION_ID_PATTERN = /^[0-9a-f-]{36}$/
const SHA256_PATTERN = /^[0-9a-f]{64}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function randomTransactionId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

async function sha256Hex(blob: Blob): Promise<string> {
  const bytes = Uint8Array.from(new Uint8Array(await blob.arrayBuffer()))
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function receipt(blob: Blob): Promise<BlobReceipt> {
  return {
    bytes: blob.size,
    sha256: await sha256Hex(blob),
    type: blob.type,
  }
}

function parseReceipt(value: unknown): BlobReceipt {
  if (!isRecord(value)) throw new Error("Lesson import recovery: receipt non valido")
  if (
    !Number.isSafeInteger(value.bytes) ||
    (value.bytes as number) < 0 ||
    typeof value.sha256 !== "string" ||
    !SHA256_PATTERN.test(value.sha256) ||
    typeof value.type !== "string"
  ) {
    throw new Error("Lesson import recovery: receipt non valido")
  }
  return { bytes: value.bytes as number, sha256: value.sha256, type: value.type }
}

function transactionRoot(id: string): string {
  if (!TRANSACTION_ID_PATTERN.test(id)) {
    throw new Error("Lesson import recovery: transaction id non valido")
  }
  return `${LESSON_IMPORT_TRANSACTION_ROOT}/${id}`
}

function assertTransactionPath(path: unknown, root: string): string {
  if (typeof path !== "string" || !path.startsWith(`${root}/`) || path.includes("..")) {
    throw new Error("Lesson import recovery: path transazione non valido")
  }
  return path
}

function parsePhase(value: unknown): TransactionPhase {
  const phases: readonly TransactionPhase[] = [
    "staging",
    "prepared",
    "committing",
    "restoring",
    "rollback-needed",
    "rolled-back",
    "aborted",
    "committed",
  ]
  if (!phases.includes(value as TransactionPhase)) {
    throw new Error("Lesson import recovery: fase non valida")
  }
  return value as TransactionPhase
}

function parseTransaction(value: unknown, recordPath: string): PendingLessonImport {
  if (!isRecord(value) || value.v !== 1 || typeof value.id !== "string") {
    throw new Error("Lesson import recovery: record non valido")
  }
  const root = transactionRoot(value.id)
  if (recordPath !== `${root}/transaction.json`) {
    throw new Error("Lesson import recovery: record path non valido")
  }
  if (typeof value.createdAt !== "string" || !Array.isArray(value.entries)) {
    throw new Error("Lesson import recovery: record incompleto")
  }
  const targets = new Set<string>()
  const entries = value.entries.map((raw, index): TransactionEntry => {
    if (!isRecord(raw)) throw new Error("Lesson import recovery: entry non valida")
    if (
      typeof raw.sourcePath !== "string" ||
      typeof raw.targetPath !== "string" ||
      !raw.targetPath.startsWith("raw/") ||
      raw.targetPath.startsWith(`${LESSON_IMPORT_TRANSACTION_ROOT}/`) ||
      raw.targetPath.split("/").some((part) => part === "..") ||
      targets.has(raw.targetPath)
    ) {
      throw new Error("Lesson import recovery: target non valido o duplicato")
    }
    targets.add(raw.targetPath)
    const stagePath = assertTransactionPath(raw.stagePath, root)
    const expectedStage = `${root}/stage/${index}.blob`
    if (stagePath !== expectedStage) {
      throw new Error("Lesson import recovery: stage path non canonico")
    }
    const previous = raw.previous === null ? null : parseReceipt(raw.previous)
    const backupPath = raw.backupPath === null
      ? null
      : assertTransactionPath(raw.backupPath, root)
    if ((previous === null) !== (backupPath === null)) {
      throw new Error("Lesson import recovery: backup non coerente")
    }
    if (backupPath !== null && backupPath !== `${root}/backup/${index}.blob`) {
      throw new Error("Lesson import recovery: backup path non canonico")
    }
    return {
      sourcePath: raw.sourcePath,
      targetPath: raw.targetPath,
      stagePath,
      backupPath,
      previous,
      next: parseReceipt(raw.next),
    }
  })
  return {
    v: 1,
    id: value.id,
    phase: parsePhase(value.phase),
    createdAt: value.createdAt,
    entries,
    recordPath,
  }
}

async function readJson(store: WorkspaceStore, path: string): Promise<unknown | null> {
  const blob = await store.read(path)
  if (!blob) return null
  try {
    return JSON.parse(await blob.text()) as unknown
  } catch {
    throw new Error(`Lesson import recovery: JSON corrotto (${path})`)
  }
}

async function writeJson(store: WorkspaceStore, path: string, value: unknown): Promise<void> {
  await store.write(path, new Blob([`${JSON.stringify(value, null, 2)}\n`], {
    type: "application/json",
  }))
}

async function assertBlobMatches(
  store: WorkspaceStore,
  path: string,
  expected: BlobReceipt,
): Promise<Blob> {
  const blob = await store.read(path)
  if (!blob || blob.size !== expected.bytes || await sha256Hex(blob) !== expected.sha256) {
    throw new Error(`Lesson import transaction: verifica fallita (${path})`)
  }
  return blob
}

async function setPhase(
  store: WorkspaceStore,
  transaction: PendingLessonImport,
  phase: TransactionPhase,
): Promise<PendingLessonImport> {
  const next = { ...transaction, phase }
  const { recordPath: _recordPath, ...persisted } = next
  void _recordPath
  await writeJson(store, transaction.recordPath, persisted)
  return next
}

async function clearActivePointer(store: WorkspaceStore): Promise<void> {
  await store.delete(ACTIVE_TRANSACTION_PATH)
  if (await store.read(ACTIVE_TRANSACTION_PATH)) {
    throw new Error("Lesson import recovery: active pointer non eliminato")
  }
}

export async function readPendingLessonImport(
  store: WorkspaceStore,
): Promise<PendingLessonImport | null> {
  const rawPointer = await readJson(store, ACTIVE_TRANSACTION_PATH)
  if (rawPointer === null) return null
  if (
    !isRecord(rawPointer) ||
    rawPointer.v !== 1 ||
    typeof rawPointer.id !== "string" ||
    typeof rawPointer.recordPath !== "string"
  ) {
    throw new Error("Lesson import recovery: active pointer non valido")
  }
  const root = transactionRoot(rawPointer.id)
  const expectedRecordPath = `${root}/transaction.json`
  if (rawPointer.recordPath !== expectedRecordPath) {
    throw new Error("Lesson import recovery: active pointer fuori namespace")
  }
  const rawRecord = await readJson(store, expectedRecordPath)
  if (rawRecord === null) {
    throw new Error("Lesson import recovery: record attivo mancante")
  }
  return parseTransaction(rawRecord, expectedRecordPath)
}

export async function prepareLessonImport(
  store: WorkspaceStore,
  candidates: readonly LessonImportCandidate[],
): Promise<PendingLessonImport> {
  if (await readPendingLessonImport(store)) {
    throw new Error("Lesson import transaction: esiste gia una transazione attiva")
  }
  const id = randomTransactionId()
  const root = transactionRoot(id)
  const recordPath = `${root}/transaction.json`
  const targets = new Set<string>()
  const entries: TransactionEntry[] = []

  for (const [index, candidate] of candidates.entries()) {
    if (
      !candidate.targetPath.startsWith("raw/") ||
      candidate.targetPath.startsWith(`${LESSON_IMPORT_TRANSACTION_ROOT}/`) ||
      candidate.targetPath.split("/").some((part) => part === "..") ||
      targets.has(candidate.targetPath)
    ) {
      throw new Error("Lesson import transaction: target non valido o duplicato")
    }
    targets.add(candidate.targetPath)
    const previousBlob = await store.read(candidate.targetPath)
    entries.push({
      sourcePath: candidate.sourcePath,
      targetPath: candidate.targetPath,
      stagePath: `${root}/stage/${index}.blob`,
      backupPath: previousBlob ? `${root}/backup/${index}.blob` : null,
      previous: previousBlob ? await receipt(previousBlob) : null,
      next: await receipt(candidate.data),
    })
  }

  let transaction: PendingLessonImport = {
    v: 1,
    id,
    phase: "staging",
    createdAt: new Date().toISOString(),
    entries,
    recordPath,
  }
  const { recordPath: _recordPath, ...persisted } = transaction
  void _recordPath
  await writeJson(store, recordPath, persisted)
  const pointer: ActivePointer = { v: 1, id, recordPath }
  await writeJson(store, ACTIVE_TRANSACTION_PATH, pointer)

  for (const [index, entry] of entries.entries()) {
    await store.write(entry.stagePath, candidates[index]!.data)
    await assertBlobMatches(store, entry.stagePath, entry.next)
    if (entry.backupPath && entry.previous) {
      const previousBlob = await store.read(entry.targetPath)
      if (!previousBlob) {
        throw new Error(`Lesson import transaction: originale scomparso (${entry.targetPath})`)
      }
      await store.write(entry.backupPath, previousBlob)
      await assertBlobMatches(store, entry.backupPath, entry.previous)
    }
  }

  transaction = await setPhase(store, transaction, "prepared")
  return transaction
}

export async function commitLessonImportWorkspace(
  store: WorkspaceStore,
  transaction: PendingLessonImport,
): Promise<PendingLessonImport> {
  if (transaction.phase !== "prepared") {
    throw new Error("Lesson import transaction: commit senza prepare")
  }
  let current = await setPhase(store, transaction, "committing")
  for (const entry of current.entries) {
    const staged = await assertBlobMatches(store, entry.stagePath, entry.next)
    await store.write(entry.targetPath, staged)
  }
  for (const entry of current.entries) {
    await assertBlobMatches(store, entry.targetPath, entry.next)
  }
  current = await setPhase(store, current, "restoring")
  return current
}

export async function rollbackLessonImport(
  store: WorkspaceStore,
  transaction: PendingLessonImport,
): Promise<void> {
  let current = transaction
  try {
    current = await setPhase(store, current, "rollback-needed")
  } catch {
    // Il record precedente resta sufficiente per riprovare il rollback.
  }
  for (const entry of [...current.entries].reverse()) {
    if (entry.previous === null) {
      await store.delete(entry.targetPath)
      continue
    }
    if (!entry.backupPath) {
      throw new Error(`Lesson import rollback: backup mancante (${entry.targetPath})`)
    }
    const backup = await assertBlobMatches(store, entry.backupPath, entry.previous)
    await store.write(entry.targetPath, backup)
  }
  for (const entry of current.entries) {
    if (entry.previous === null) {
      if (await store.read(entry.targetPath)) {
        throw new Error(`Lesson import rollback: target nuovo non eliminato (${entry.targetPath})`)
      }
    } else {
      await assertBlobMatches(store, entry.targetPath, entry.previous)
    }
  }
  current = await setPhase(store, current, "rolled-back")
  await clearActivePointer(store)
}

export async function abandonStagedLessonImport(
  store: WorkspaceStore,
  transaction: PendingLessonImport,
): Promise<void> {
  if (transaction.phase !== "staging" && transaction.phase !== "prepared") {
    throw new Error("Lesson import recovery: transazione non soltanto staged")
  }
  await setPhase(store, transaction, "aborted")
  await clearActivePointer(store)
}

export async function lessonImportWorkspaceMatchesNext(
  store: WorkspaceStore,
  transaction: PendingLessonImport,
): Promise<boolean> {
  try {
    for (const entry of transaction.entries) {
      await assertBlobMatches(store, entry.targetPath, entry.next)
    }
    return true
  } catch {
    return false
  }
}

export async function stagedLessonImportSource(
  store: WorkspaceStore,
  transaction: PendingLessonImport,
  sourcePath: string,
): Promise<Blob | null> {
  const entry = transaction.entries.find((candidate) => candidate.sourcePath === sourcePath)
  return entry ? assertBlobMatches(store, entry.stagePath, entry.next) : null
}

export async function finalizeLessonImport(
  store: WorkspaceStore,
  transaction: PendingLessonImport,
): Promise<void> {
  let current = transaction
  if (current.phase === "rolled-back" || current.phase === "aborted") {
    await clearActivePointer(store)
    return
  }
  if (current.phase !== "committed") {
    current = await setPhase(store, current, "committed")
  }
  await clearActivePointer(store)

  // Cleanup best-effort: dopo la rimozione verificata del pointer lo stato live e
  // gia committato. Un residuo non attivo e soltanto evidenza ricostruibile.
  for (const entry of current.entries) {
    try { await store.delete(entry.stagePath) } catch { /* best effort */ }
    if (entry.backupPath) {
      try { await store.delete(entry.backupPath) } catch { /* best effort */ }
    }
  }
  try { await store.delete(current.recordPath) } catch { /* best effort */ }
}
