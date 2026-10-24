import { afterEach, describe, expect, it, vi } from "vitest"
import * as configuration from "../../vite.config"
import { viewHref } from "../design/ViewNav"
afterEach(() => vi.unstubAllEnvs())
describe("isolated Studio release base", () => {
  it("keeps standalone development at root and supports the unified /studio/ artifact", () => {
    expect(configuration.default.base).toBe("/")
    expect(configuration.resolveStudioBase({})).toBe("/")
    expect(configuration.resolveStudioBase({ ARDESIA_STUDIO_BASE: "/studio/" })).toBe("/studio/")
  })
  it.each(["https://evil.example/", "/private/", "../", "//evil.example/", "/studio", "/%73tudio/"])("rejects an unreviewed build base %s", (value) => {
    expect(() => configuration.resolveStudioBase({ ARDESIA_STUDIO_BASE: value })).toThrow(/base/i)
  })
  it("keeps the current lesson inside /studio/ when navigating to materials and continuity", () => {
    vi.stubEnv("BASE_URL", "/studio/")
    expect(viewHref("materiali", "#aula-test")).toBe("/studio/?vista=lezioni-salvate#aula-test")
    expect(viewHref("continuita", "#aula-test")).toBe("/studio/?vista=continuita#aula-test")
    expect(viewHref("lavagna", "#aula-test")).toBe("/studio/#aula-test")
  })
})
