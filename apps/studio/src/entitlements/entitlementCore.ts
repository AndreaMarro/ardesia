// Entitlement scuola/classe ARDESIA (Obiettivo C) — core puro local-first.
//
// Catena (modellata su Stripe Entitlements + OWASP Session Management /
// Forgot Password, vedi External Research Ledger NOTTE-11):
//
//   license key  ARDESIA-XXXX-XXXX-XXXX-XXXX   (artefatto di DISTRIBUZIONE)
//     → redeemLicenseKey → EntitlementRecord {schoolId, classId,
//         featureLookupKey, expiresAt}                     (stato locale)
//     → issueAccessToken → token 128-bit CSPRNG consegnato SOLO via
//         EmailAdapter; nello store solo SHA-256(token) + TTL 15 min + used
//     → redeemAccessToken → sessione NUOVA (id 128-bit, anti-fixation)
//
// Proprietà di sicurezza (verificate in EntitlementCore.test.ts):
//   - chiavi e token MAI in chiaro nello store (solo hash);
//   - confronto hash constant-time;
//   - one-time: used=true al primo redeem valido;
//   - risposta di errore IDENTICA per ogni causa (anti-enumeration);
//   - revoca entitlement nega accesso e token;
//   - nessuna PII persistita (l'email attraversa solo l'adapter).
//
// Fuori scope qui (dichiarato): provider email reale, licenza firmata
// ed25519 per verifica offline, rate limiting di superficie, UI. Tutti
// gate-Andrea o slice successive.

import type { EmailAdapter } from "./mailSink"

// Stessa interfaccia Blob-based di killList/installer: nessun nuovo storage.
export interface EntitlementStore {
  read(path: string): Promise<Blob | null>
  write(path: string, data: Blob): Promise<void>
  delete(path: string): Promise<void>
}

// Alfabeto senza caratteri ambigui (niente 0/O, 1/I/L) — pattern classroom.
const KEY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
const KEY_GROUPS = 4
const KEY_GROUP_LEN = 4
export const LICENSE_KEY_PATTERN = /^ARDESIA(-[A-HJ-NP-Z2-9]{4}){4}$/

const TOKEN_TTL_MS = 15 * 60_000 // norma magic-link 10-15 min (OWASP-aligned)
const TOKEN_BYTES = 16 // 128 bit
const INVALID = { ok: false as const, reason: "invalid" as const }

export type EntitlementScope = {
  schoolId: string
  classId: string
  featureLookupKey: string
}

export type EntitlementRecord = EntitlementScope & {
  id: string
  redeemedAt: number
  expiresAt: number
  revokedAt: number | null
}

type StoredLicense = EntitlementScope & {
  v: 1
  keyHash: string
  expiresAt: number
  redeemed: boolean
}

type StoredToken = {
  v: 1
  tokenHash: string
  entitlementId: string
  issuedAt: number
  expiresAt: number
  used: boolean
}

const licensePath = (keyHash: string) => `entitlements/licenses/${keyHash}.json`
const entitlementPath = (id: string) => `entitlements/records/${id}.json`
const tokenPath = (tokenHash: string) => `entitlements/tokens/${tokenHash}.json`
// Indice per scope: lo store è read puntuale (niente list), quindi il redeem
// mantiene un puntatore "latest" per scope e checkAccess passa da lì.
const scopeLatestPath = (scope: EntitlementScope) =>
  `entitlements/by-scope/${encodeURIComponent(scope.schoolId)}/${encodeURIComponent(scope.classId)}/${encodeURIComponent(scope.featureLookupKey)}/latest.json`

function randomFromAlphabet(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (const byte of bytes) out += KEY_ALPHABET[byte % KEY_ALPHABET.length]
  return out
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("")
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
}

/** Confronto constant-time su stringhe hex di pari lunghezza. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let acc = 0
  for (let i = 0; i < a.length; i += 1) acc |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return acc === 0
}

async function readJson<T>(store: EntitlementStore, path: string): Promise<T | null> {
  const blob = await store.read(path)
  if (blob === null) return null
  try {
    return JSON.parse(await blob.text()) as T
  } catch {
    return null
  }
}

async function writeJson(store: EntitlementStore, path: string, value: unknown): Promise<void> {
  await store.write(path, new Blob([JSON.stringify(value)], { type: "application/json" }))
}

/** Chiave di licenza ARDESIA-XXXX-XXXX-XXXX-XXXX (~79 bit, artefatto di distribuzione). */
export function generateLicenseKey(): string {
  const groups: string[] = []
  for (let i = 0; i < KEY_GROUPS; i += 1) groups.push(randomFromAlphabet(KEY_GROUP_LEN))
  return `ARDESIA-${groups.join("-")}`
}

/** Registra una chiave emessa: nello store SOLO l'hash + scope + scadenza. */
export async function registerLicenseKey(
  store: EntitlementStore,
  rawKey: string,
  options: EntitlementScope & { expiresAt: number },
): Promise<void> {
  const keyHash = await sha256Hex(rawKey)
  const record: StoredLicense = {
    v: 1,
    keyHash,
    schoolId: options.schoolId,
    classId: options.classId,
    featureLookupKey: options.featureLookupKey,
    expiresAt: options.expiresAt,
    redeemed: false,
  }
  await writeJson(store, licensePath(keyHash), record)
}

export type RedeemKeyResult =
  | { ok: true; entitlement: EntitlementRecord }
  | { ok: false; reason: "invalid" }

/**
 * Redeem one-time della chiave → EntitlementRecord attivo.
 * Ogni fallimento (sconosciuta, già usata, scaduta, corrotta) restituisce la
 * STESSA risposta generica: mai rivelare quale controllo è fallito.
 */
export async function redeemLicenseKey(
  store: EntitlementStore,
  rawKey: string,
  now: number,
): Promise<RedeemKeyResult> {
  // Full match rejects retired distribution keys without changing stored grants.
  if (LICENSE_KEY_PATTERN.exec(rawKey)?.[0] !== rawKey) return INVALID
  const keyHash = await sha256Hex(rawKey)
  const license = await readJson<StoredLicense>(store, licensePath(keyHash))
  if (
    license === null ||
    license.v !== 1 ||
    !timingSafeEqualHex(license.keyHash, keyHash) ||
    license.redeemed ||
    license.expiresAt <= now
  ) {
    return INVALID
  }

  const entitlement: EntitlementRecord = {
    id: randomHex(8),
    schoolId: license.schoolId,
    classId: license.classId,
    featureLookupKey: license.featureLookupKey,
    redeemedAt: now,
    expiresAt: license.expiresAt,
    revokedAt: null,
  }
  await writeJson(store, licensePath(keyHash), { ...license, redeemed: true })
  await writeJson(store, entitlementPath(entitlement.id), entitlement)
  await writeJson(store, scopeLatestPath(entitlement), { id: entitlement.id })
  return { ok: true, entitlement }
}

async function readActiveEntitlement(
  store: EntitlementStore,
  id: string,
  now: number,
): Promise<EntitlementRecord | null> {
  const record = await readJson<EntitlementRecord>(store, entitlementPath(id))
  if (record === null || record.revokedAt !== null || record.expiresAt <= now) return null
  return record
}

/**
 * Emette un token di accesso one-time per l'entitlement e lo consegna SOLO
 * all'EmailAdapter. Nello store finisce l'hash, mai il token né l'email.
 */
export async function issueAccessToken(
  store: EntitlementStore,
  entitlementId: string,
  email: string,
  adapter: EmailAdapter,
  now: number,
): Promise<{ ok: boolean }> {
  const entitlement = await readActiveEntitlement(store, entitlementId, now)
  if (entitlement === null) return { ok: false }

  const token = randomHex(TOKEN_BYTES)
  const stored: StoredToken = {
    v: 1,
    tokenHash: await sha256Hex(token),
    entitlementId,
    issuedAt: now,
    expiresAt: now + TOKEN_TTL_MS,
    used: false,
  }
  await writeJson(store, tokenPath(stored.tokenHash), stored)
  await adapter.deliverToken({ to: email, token })
  return { ok: true }
}

export type RedeemTokenResult =
  | { ok: true; session: { sessionId: string; entitlementId: string } }
  | { ok: false; reason: "invalid" }

/**
 * Redeem one-time del token: hash del presentato, confronto constant-time,
 * TTL, used-flag, entitlement ancora attivo. Sessione NUOVA a ogni redeem
 * valido (mai riusare il token come identificatore di sessione).
 */
export async function redeemAccessToken(
  store: EntitlementStore,
  rawToken: string,
  now: number,
): Promise<RedeemTokenResult> {
  const tokenHash = await sha256Hex(rawToken)
  const stored = await readJson<StoredToken>(store, tokenPath(tokenHash))
  if (
    stored === null ||
    stored.v !== 1 ||
    !timingSafeEqualHex(stored.tokenHash, tokenHash) ||
    stored.used ||
    stored.expiresAt <= now
  ) {
    return INVALID
  }
  const entitlement = await readActiveEntitlement(store, stored.entitlementId, now)
  if (entitlement === null) return INVALID

  await writeJson(store, tokenPath(tokenHash), { ...stored, used: true })
  return {
    ok: true,
    session: { sessionId: randomHex(TOKEN_BYTES), entitlementId: stored.entitlementId },
  }
}

/** Revoca immediata: nega checkAccess e ogni token futuro dell'entitlement. */
export async function revokeEntitlement(
  store: EntitlementStore,
  entitlementId: string,
  now: number,
): Promise<void> {
  const record = await readJson<EntitlementRecord>(store, entitlementPath(entitlementId))
  if (record === null) return
  await writeJson(store, entitlementPath(entitlementId), { ...record, revokedAt: now })
}

/** Accesso per scope: esiste un entitlement attivo (non revocato, non scaduto). */
export async function checkAccess(
  store: EntitlementStore,
  scope: EntitlementScope,
  now: number,
): Promise<boolean> {
  const latest = await readJson<{ id: string }>(store, scopeLatestPath(scope))
  if (latest === null) return false
  return (await readActiveEntitlement(store, latest.id, now)) !== null
}
