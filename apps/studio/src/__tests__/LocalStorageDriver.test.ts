// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { LocalStorageDriver } from "../store/drivers/localStorage"

const PREFIX = "maestro:"
const TYPE_PREFIX = "maestro::type"

type InstrumentedStorage = {
  storage: Storage
  operations: string[]
  seed: (key: string, value: string) => void
  failRead: (key: string, error: unknown) => void
}

function makeInstrumentedStorage(): InstrumentedStorage {
  const values = new Map<string, string>()
  const readErrors = new Map<string, unknown>()
  const operations: string[] = []

  const storage: Storage = {
    get length() {
      return values.size
    },
    clear() {
      operations.push("clear")
      values.clear()
    },
    getItem(key: string) {
      operations.push(`get:${key}`)
      if (readErrors.has(key)) throw readErrors.get(key)
      return values.get(key) ?? null
    },
    key(index: number) {
      operations.push(`key:${index}`)
      return [...values.keys()][index] ?? null
    },
    removeItem(key: string) {
      operations.push(`remove:${key}`)
      values.delete(key)
    },
    setItem(key: string, value: string) {
      operations.push(`set:${key}`)
      values.set(key, value)
    },
  }

  return {
    storage,
    operations,
    seed: (key, value) => values.set(key, value),
    failRead: (key, error) => readErrors.set(key, error),
  }
}

function encode(bytes: Iterable<number>): string {
  return btoa(String.fromCharCode(...bytes))
}

function expectNoMutation(operations: readonly string[]): void {
  expect(operations.some((entry) => /^(set|remove|clear)(:|$)/.test(entry))).toBe(false)
}

describe("LocalStorageDriver.read lossless boundary", () => {
  let instrumented: InstrumentedStorage
  let driver: LocalStorageDriver
  const nativeAtob = globalThis.atob
  const originalAtobDescriptor = Object.getOwnPropertyDescriptor(globalThis, "atob")
  const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage")

  beforeEach(() => {
    instrumented = makeInstrumentedStorage()
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: instrumented.storage,
    })
    Object.defineProperty(globalThis, "atob", {
      configurable: true,
      value: nativeAtob,
    })
    driver = new LocalStorageDriver()
  })

  afterEach(() => {
    if (originalAtobDescriptor) {
      Object.defineProperty(globalThis, "atob", originalAtobDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, "atob")
    }
    if (originalLocalStorageDescriptor) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorageDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, "localStorage")
    }
  })

  it("returns null only when the data key is absent and does not read MIME", async () => {
    await expect(driver.read("raw/session.yaml")).resolves.toBeNull()

    expect(instrumented.operations).toEqual(["get:maestro:raw/session.yaml"])
    expectNoMutation(instrumented.operations)
  })

  it("returns a present zero-byte Blob when the stored payload is an empty string", async () => {
    instrumented.seed(`${PREFIX}raw/empty.bin`, "")
    instrumented.seed(`${TYPE_PREFIX}raw/empty.bin`, "application/x-empty")

    const result = await driver.read("raw/empty.bin")

    expect(result).not.toBeNull()
    expect(result?.size).toBe(0)
    expect(result?.type).toBe("application/x-empty")
    expect(instrumented.operations).toEqual([
      "get:maestro:raw/empty.bin",
      "get:maestro::typeraw/empty.bin",
    ])
    expectNoMutation(instrumented.operations)
  })

  it("round-trips binary bytes and MIME without text conversion", async () => {
    const expectedBytes = Uint8Array.from([0x00, 0x80, 0xff, 0x0a])
    instrumented.seed(`${PREFIX}raw/image.bin`, encode(expectedBytes))
    instrumented.seed(`${TYPE_PREFIX}raw/image.bin`, "application/x-ardesia-binary")

    const result = await driver.read("raw/image.bin")

    expect(result).not.toBeNull()
    expect(result?.type).toBe("application/x-ardesia-binary")
    expect(new Uint8Array(await result!.arrayBuffer())).toEqual(expectedBytes)
    expectNoMutation(instrumented.operations)
  })

  it("propagates the exact data-key storage error without reading MIME", async () => {
    const storageReadError = new DOMException("data key blocked", "SecurityError")
    instrumented.failRead(`${PREFIX}raw/session.yaml`, storageReadError)

    await expect(driver.read("raw/session.yaml")).rejects.toBe(storageReadError)

    expect(instrumented.operations).toEqual(["get:maestro:raw/session.yaml"])
    expectNoMutation(instrumented.operations)
  })

  it("propagates the exact MIME-key storage error without falling back", async () => {
    const metadataReadError = new DOMException("metadata blocked", "SecurityError")
    instrumented.seed(`${PREFIX}raw/session.yaml`, encode([0x61]))
    instrumented.failRead(`${TYPE_PREFIX}raw/session.yaml`, metadataReadError)

    await expect(driver.read("raw/session.yaml")).rejects.toBe(metadataReadError)

    expect(instrumented.operations).toEqual([
      "get:maestro:raw/session.yaml",
      "get:maestro::typeraw/session.yaml",
    ])
    expectNoMutation(instrumented.operations)
  })

  it("rejects malformed stored base64 through the real atob decoder", async () => {
    instrumented.seed(`${PREFIX}raw/corrupt.bin`, "%%%not-base64%%")

    await expect(driver.read("raw/corrupt.bin")).rejects.toMatchObject({
      name: "InvalidCharacterError",
    })

    expectNoMutation(instrumented.operations)
  })

  it("propagates the exact atob error object for a valid base64 input", async () => {
    const decodeError = new DOMException("invalid base64", "InvalidCharacterError")
    let decodedInput: string | undefined
    instrumented.seed(`${PREFIX}raw/corrupt.bin`, "YQ==")
    Object.defineProperty(globalThis, "atob", {
      configurable: true,
      value: (input: string) => {
        decodedInput = input
        throw decodeError
      },
    })

    await expect(driver.read("raw/corrupt.bin")).rejects.toBe(decodeError)

    expect(decodedInput).toBe("YQ==")
    expectNoMutation(instrumented.operations)
  })

  it("returns validly decoded bytes even when they are invalid UTF-8 or YAML", async () => {
    const expectedBytes = Uint8Array.from([0xff, 0x80, 0x00])
    instrumented.seed(`${PREFIX}raw/session.yaml`, encode(expectedBytes))

    const result = await driver.read("raw/session.yaml")

    expect(result).not.toBeNull()
    expect(new Uint8Array(await result!.arrayBuffer())).toEqual(expectedBytes)
    expectNoMutation(instrumented.operations)
  })

  it("returns a present Blob with the codec default when MIME metadata is absent", async () => {
    instrumented.seed(`${PREFIX}raw/no-type.bin`, encode([0x01, 0x02]))

    const result = await driver.read("raw/no-type.bin")

    expect(result).not.toBeNull()
    expect(result?.type).toBe("application/octet-stream")
    expect(new Uint8Array(await result!.arrayBuffer())).toEqual(Uint8Array.from([0x01, 0x02]))
    expect(instrumented.operations).toEqual([
      "get:maestro:raw/no-type.bin",
      "get:maestro::typeraw/no-type.bin",
    ])
    expectNoMutation(instrumented.operations)
  })
})
