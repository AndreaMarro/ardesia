// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import { removeHostedFirebaseConfig, localFontFallback } from "../../build/localExcalidrawEnvironment"

it("removes the hosted app config from the actual locked component without allowing credentials", () => {
  const root = fileURLToPath(new URL("../../node_modules/@excalidraw/excalidraw/", import.meta.url))
  expect(JSON.parse(readFileSync(`${root}/package.json`, "utf8")).version).toBe("0.18.1")
  const original = readFileSync(`${root}/dist/prod/chunk-ZUYEQ4TG.js`, "utf8")
  expect(original).toMatch(/VITE_APP_FIREBASE_CONFIG:/)
  const embedded = removeHostedFirebaseConfig(original)
  expect(embedded).toContain("VITE_APP_FIREBASE_CONFIG:'{}'")
  expect(embedded).not.toMatch(/\bAIza[0-9A-Za-z_-]{35}\b/)
  expect(embedded).not.toContain('"authDomain":"excalidraw-room-persistence.firebaseapp.com"')
  expect(removeHostedFirebaseConfig("export const other = 'unchanged'")).toBe("export const other = 'unchanged'")
})

it.each(["/", "/studio/"])("replaces the locked CDN font fallback with local assets at %s", (base) => {
  const root = fileURLToPath(new URL("../../node_modules/@excalidraw/excalidraw/", import.meta.url))
  const original = readFileSync(`${root}/dist/prod/chunk-K2UTITRG.js`, "utf8")
  expect(original).toContain("https://esm.sh/")
  const embedded = localFontFallback(original, base)
  expect(embedded).not.toContain("https://esm.sh/")
  expect(embedded).toContain(JSON.stringify(base + "excalidraw-assets/"))
})
