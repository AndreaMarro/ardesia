// @vitest-environment node

import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_ENTITLEMENT_FEATURE,
  checkEntitlementAccess,
  readEntitlementApiConfig,
} from "../entitlements/entitlementApiClient"

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  })
}

describe("entitlementApiClient — FastAPI sandbox contract", () => {
  it("legge config VITE_* trim-only e usa feature sandbox di default", () => {
    expect(
      readEntitlementApiConfig({
        VITE_ENTITLEMENT_API_URL: " https://entitlement.example.test/ ",
        VITE_ENTITLEMENT_SCHOOL_ID: " scuola-pseudo ",
        VITE_ENTITLEMENT_CLASS_ID: " 3b-pseudo ",
      }),
    ).toEqual({
      kind: "configured",
      baseUrl: "https://entitlement.example.test",
      scope: {
        schoolId: "scuola-pseudo",
        classId: "3b-pseudo",
        featureLookupKey: DEFAULT_ENTITLEMENT_FEATURE,
      },
    })
  })

  it("fallisce chiuso senza endpoint o senza scope, e non fa fetch", async () => {
    const fetcher = vi.fn()
    await expect(
      checkEntitlementAccess({
        config: { kind: "not-configured", reason: "missing-base-url" },
        fetcher: fetcher as unknown as typeof fetch,
      }),
    ).resolves.toEqual({ kind: "not-configured", reason: "missing-base-url" })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it("controlla /healthz e /access con lo scope FastAPI e distingue granted/denied", async () => {
    const calls: string[] = []
    const fetcher = vi.fn(async (url: RequestInfo | URL) => {
      calls.push(String(url))
      if (String(url).endsWith("/healthz")) return jsonResponse({ ok: true })
      return jsonResponse({ access: true })
    })

    const result = await checkEntitlementAccess({
      config: {
        kind: "configured",
        baseUrl: "https://entitlement.example.test/api",
        scope: {
          schoolId: "scuola-pseudo",
          classId: "3b-pseudo",
          featureLookupKey: "tutor-monthly-15eur",
        },
      },
      fetcher: fetcher as unknown as typeof fetch,
    })

    expect(result.kind).toBe("granted")
    expect(calls).toEqual([
      "https://entitlement.example.test/api/healthz",
      "https://entitlement.example.test/api/access?school_id=scuola-pseudo&class_id=3b-pseudo&feature=tutor-monthly-15eur",
    ])
  })

  it("risposta FastAPI access=false diventa denied, non unreachable", async () => {
    const fetcher = vi.fn(async (url: RequestInfo | URL) =>
      String(url).endsWith("/healthz") ? jsonResponse({ ok: true }) : jsonResponse({ access: false }),
    )

    await expect(
      checkEntitlementAccess({
        config: {
          kind: "configured",
          baseUrl: "https://entitlement.example.test",
          scope: {
            schoolId: "s",
            classId: "c",
            featureLookupKey: "f",
          },
        },
        fetcher: fetcher as unknown as typeof fetch,
      }),
    ).resolves.toMatchObject({ kind: "denied" })
  })
})
