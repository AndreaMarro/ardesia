export const DEFAULT_ENTITLEMENT_FEATURE = "tutor-monthly-15eur"

export type EntitlementScope = {
  schoolId: string
  classId: string
  featureLookupKey: string
}

type EntitlementApiConfigured = {
  kind: "configured"
  baseUrl: string
  scope: EntitlementScope
}

type EntitlementApiNotConfigured = {
  kind: "not-configured"
  reason: "missing-base-url" | "missing-scope"
}

export type EntitlementApiConfig = EntitlementApiConfigured | EntitlementApiNotConfigured

export type EntitlementAccessResult =
  | {
      kind: "granted"
      endpoint: string
      scope: EntitlementScope
    }
  | {
      kind: "denied"
      endpoint: string
      scope: EntitlementScope
    }
  | {
      kind: "not-configured"
      reason: EntitlementApiNotConfigured["reason"]
    }
  | {
      kind: "unreachable"
      endpoint: string
      detail: string
      scope: EntitlementScope | null
    }

type EnvLike = Record<string, string | boolean | undefined>
type FetchLike = typeof fetch

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function cleanBaseUrl(value: unknown): string {
  return cleanString(value).replace(/\/+$/, "")
}

function appendPath(baseUrl: string, path: string): string {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function readEntitlementApiConfig(env: EnvLike = import.meta.env): EntitlementApiConfig {
  const baseUrl = cleanBaseUrl(env.VITE_ENTITLEMENT_API_URL)
  if (baseUrl === "") return { kind: "not-configured", reason: "missing-base-url" }

  const schoolId = cleanString(env.VITE_ENTITLEMENT_SCHOOL_ID)
  const classId = cleanString(env.VITE_ENTITLEMENT_CLASS_ID)
  if (schoolId === "" || classId === "") {
    return { kind: "not-configured", reason: "missing-scope" }
  }

  return {
    kind: "configured",
    baseUrl,
    scope: {
      schoolId,
      classId,
      featureLookupKey:
        cleanString(env.VITE_ENTITLEMENT_FEATURE) || DEFAULT_ENTITLEMENT_FEATURE,
    },
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function buildAccessUrl(baseUrl: string, scope: EntitlementScope): string {
  const params = new URLSearchParams({
    school_id: scope.schoolId,
    class_id: scope.classId,
    feature: scope.featureLookupKey,
  })
  return `${appendPath(baseUrl, "/access")}?${params.toString()}`
}

export async function checkEntitlementAccess(options: {
  config?: EntitlementApiConfig
  fetcher?: FetchLike
} = {}): Promise<EntitlementAccessResult> {
  const config = options.config ?? readEntitlementApiConfig()
  if (config.kind === "not-configured") {
    return { kind: "not-configured", reason: config.reason }
  }

  const fetcher = options.fetcher ?? fetch
  const healthUrl = appendPath(config.baseUrl, "/healthz")
  try {
    const health = await fetcher(healthUrl, { headers: { accept: "application/json" } })
    const healthPayload = await readJson(health)
    if (!health.ok || healthPayload === null || (healthPayload as { ok?: unknown }).ok !== true) {
      return {
        kind: "unreachable",
        endpoint: healthUrl,
        detail: "healthz",
        scope: config.scope,
      }
    }

    const accessUrl = buildAccessUrl(config.baseUrl, config.scope)
    const access = await fetcher(accessUrl, { headers: { accept: "application/json" } })
    const accessPayload = await readJson(access)
    if (!access.ok || accessPayload === null || typeof (accessPayload as { access?: unknown }).access !== "boolean") {
      return {
        kind: "unreachable",
        endpoint: accessUrl,
        detail: "access",
        scope: config.scope,
      }
    }

    return {
      kind: (accessPayload as { access: boolean }).access ? "granted" : "denied",
      endpoint: config.baseUrl,
      scope: config.scope,
    }
  } catch (error) {
    return {
      kind: "unreachable",
      endpoint: config.baseUrl,
      detail: error instanceof Error ? error.message : "network",
      scope: config.scope,
    }
  }
}
