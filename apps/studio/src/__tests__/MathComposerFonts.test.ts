// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest"

vi.mock("mathlive", () => ({ MathfieldElement: class {
  static fontsDirectory: string | null = ""
  static soundsDirectory: string | null = ""
} }))
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

it.each(["/", "/studio/"])("configures locked local MathLive fonts before use under base %s", async (base) => {
  vi.stubEnv("BASE_URL", base)
  await import("../MathComposer")
  const { MathfieldElement } = await import("mathlive")
  expect(MathfieldElement.fontsDirectory).toBe(`${base}mathlive-fonts`)
  expect(MathfieldElement.soundsDirectory).toBeNull()
})
