// @vitest-environment node
//
// Entitlement scuola/classe (Obiettivo C) — core puro, nessuna UI, nessuna
// rete. Modello (External Research Ledger NOTTE-11: Stripe Entitlements +
// OWASP Session/Forgot-Password + classroom codes):
//
//   license key (distribuzione, ELAB-XXXX-XXXX-XXXX-XXXX)
//     → redeem → EntitlementRecord(schoolId/classId, featureLookupKey, expiry)
//     → issueAccessToken (128-bit CSPRNG, consegna SOLO via EmailAdapter,
//        store = hash+expiry+used, TTL 15 min, one-time)
//     → redeemAccessToken → sessione NUOVA (anti-fixation)
//
// Regole non negoziabili verificate qui:
//   E1  chiave/token MAI in chiaro nello store (solo hash SHA-256);
//   E2  token one-time: il secondo redeem fallisce;
//   E3  TTL: token scaduto rifiutato;
//   E4  risposta di errore IDENTICA per ogni causa (anti-enumeration);
//   E5  revoca entitlement → accesso e token negati;
//   E6  la consegna del token passa SOLO dall'adapter (mail-sink nei test,
//       provider reale = gate-Andrea);
//   E7  nessuna PII persistita: l'email non entra mai nello store.

import { beforeEach, describe, expect, it } from "vitest"

import {
  LICENSE_KEY_PATTERN,
  checkAccess,
  generateLicenseKey,
  issueAccessToken,
  redeemAccessToken,
  redeemLicenseKey,
  registerLicenseKey,
  revokeEntitlement,
} from "../entitlements/entitlementCore"
import { LocalMailSink } from "../entitlements/mailSink"

// Store in-memory con la stessa interfaccia Blob di killList/installer.
function memoryStore() {
  const files = new Map<string, Blob>()
  return {
    files,
    async read(path: string) {
      return files.get(path) ?? null
    },
    async write(path: string, data: Blob) {
      files.set(path, data)
    },
    async delete(path: string) {
      files.delete(path)
    },
    async dump(): Promise<string> {
      let out = ""
      for (const [path, blob] of files) out += `${path}\n${await blob.text()}\n`
      return out
    },
  }
}

const T0 = 1_800_000_000_000
const CLASS_SCOPE = {
  schoolId: "school-iis-galilei",
  classId: "3A-elettronica",
  featureLookupKey: "elab.class.tutor",
}

async function redeemedEntitlement(store: ReturnType<typeof memoryStore>) {
  const rawKey = generateLicenseKey()
  await registerLicenseKey(store, rawKey, { ...CLASS_SCOPE, expiresAt: T0 + 365 * 86_400_000 })
  const result = await redeemLicenseKey(store, rawKey, T0)
  if (!result.ok) throw new Error("redeem chiave fallito nel setup")
  return { rawKey, entitlement: result.entitlement }
}

describe("license key — formato e hash-only (E1)", () => {
  it("generateLicenseKey: formato ELAB-XXXX-XXXX-XXXX-XXXX, alfabeto senza ambigui, mai ripetuta", () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i += 1) {
      const key = generateLicenseKey()
      expect(key).toMatch(LICENSE_KEY_PATTERN)
      // Solo la parte random: il prefisso fisso "ELAB" contiene la L.
      expect(key.slice("ELAB-".length)).not.toMatch(/[01OIL]/)
      seen.add(key)
    }
    expect(seen.size).toBe(50)
  })

  it("la chiave registrata NON compare in chiaro nello store", async () => {
    const store = memoryStore()
    const rawKey = generateLicenseKey()
    await registerLicenseKey(store, rawKey, { ...CLASS_SCOPE, expiresAt: T0 + 1000 })
    expect(await store.dump()).not.toContain(rawKey)
  })
})

describe("redeem license key (E4)", () => {
  it("chiave valida → entitlement con scope scuola/classe e feature", async () => {
    const store = memoryStore()
    const { entitlement } = await redeemedEntitlement(store)
    expect(entitlement.schoolId).toBe(CLASS_SCOPE.schoolId)
    expect(entitlement.classId).toBe(CLASS_SCOPE.classId)
    expect(entitlement.featureLookupKey).toBe(CLASS_SCOPE.featureLookupKey)
  })

  it("chiave sconosciuta, chiave già usata e chiave scaduta: STESSA risposta generica", async () => {
    const store = memoryStore()
    const { rawKey } = await redeemedEntitlement(store)

    const unknown = await redeemLicenseKey(store, "ELAB-AAAA-BBBB-CCCC-DDDD", T0)
    const replay = await redeemLicenseKey(store, rawKey, T0)

    const expiredKey = generateLicenseKey()
    await registerLicenseKey(store, expiredKey, { ...CLASS_SCOPE, expiresAt: T0 - 1 })
    const expired = await redeemLicenseKey(store, expiredKey, T0)

    for (const result of [unknown, replay, expired]) {
      expect(result).toEqual({ ok: false, reason: "invalid" })
    }
  })
})

describe("access token (E1/E2/E3/E6/E7)", () => {
  let store: ReturnType<typeof memoryStore>
  let sink: LocalMailSink
  let entitlementId: string

  beforeEach(async () => {
    store = memoryStore()
    sink = new LocalMailSink()
    const setup = await redeemedEntitlement(store)
    entitlementId = setup.entitlement.id
  })

  it("E6: il token raw arriva SOLO al mail adapter; E1: nello store solo hash; E7: email mai persistita", async () => {
    await issueAccessToken(store, entitlementId, "docente@scuola.example", sink, T0)
    expect(sink.deliveries).toHaveLength(1)
    const { to, token } = sink.deliveries[0]
    expect(to).toBe("docente@scuola.example")
    expect(token).toMatch(/^[a-f0-9]{32}$/) // 128 bit hex

    const dump = await store.dump()
    expect(dump).not.toContain(token)
    expect(dump).not.toContain("docente@scuola.example")
  })

  it("E2: redeem valido una sola volta, sessione NUOVA a ogni redeem valido", async () => {
    await issueAccessToken(store, entitlementId, "a@b.example", sink, T0)
    const token = sink.deliveries[0].token

    const first = await redeemAccessToken(store, token, T0 + 60_000)
    expect(first.ok).toBe(true)
    if (!first.ok) throw new Error("unreachable")
    expect(first.session.entitlementId).toBe(entitlementId)
    expect(first.session.sessionId).toMatch(/^[a-f0-9]{32}$/)
    expect(first.session.sessionId).not.toBe(token)

    const replay = await redeemAccessToken(store, token, T0 + 61_000)
    expect(replay).toEqual({ ok: false, reason: "invalid" })
  })

  it("E3: TTL 15 minuti — token scaduto rifiutato con risposta generica", async () => {
    await issueAccessToken(store, entitlementId, "a@b.example", sink, T0)
    const token = sink.deliveries[0].token
    const late = await redeemAccessToken(store, token, T0 + 15 * 60_000 + 1)
    expect(late).toEqual({ ok: false, reason: "invalid" })
  })

  it("E4: token sconosciuto/malformato → stessa risposta generica", async () => {
    const junk = await redeemAccessToken(store, "deadbeef".repeat(4), T0)
    const malformed = await redeemAccessToken(store, "not-a-token", T0)
    expect(junk).toEqual({ ok: false, reason: "invalid" })
    expect(malformed).toEqual({ ok: false, reason: "invalid" })
  })
})

describe("accesso e revoca (E5)", () => {
  it("checkAccess vero solo con entitlement attivo; revoca → accesso e token negati", async () => {
    const store = memoryStore()
    const sink = new LocalMailSink()
    const { entitlement } = await redeemedEntitlement(store)

    expect(await checkAccess(store, CLASS_SCOPE, T0)).toBe(true)
    expect(
      await checkAccess(store, { ...CLASS_SCOPE, classId: "altra-classe" }, T0),
    ).toBe(false)

    await issueAccessToken(store, entitlement.id, "a@b.example", sink, T0)
    const token = sink.deliveries[0].token

    await revokeEntitlement(store, entitlement.id, T0 + 1)
    expect(await checkAccess(store, CLASS_SCOPE, T0 + 2)).toBe(false)
    expect(await redeemAccessToken(store, token, T0 + 2)).toEqual({
      ok: false,
      reason: "invalid",
    })
  })
})
