import { describe, expect, it, vi } from "vitest"
import { createStudioCourseBridge } from "../store/coursePassageBridge"

const CHANNEL = "1eeec131-e0e0-445b-8db2-4a5b3ae97c28"
function host(href = `https://courses.example.test/studio/?courseBridge=${CHANNEL}#aula-test`) {
  const parent = { postMessage: vi.fn(), closed: false }
  const listeners = new Set<(event: MessageEvent) => void>()
  const window = { location: { href }, opener: parent,
    addEventListener: (_name: string, listener: (event: MessageEvent) => void) => listeners.add(listener),
    removeEventListener: (_name: string, listener: (event: MessageEvent) => void) => listeners.delete(listener),
  }
  return { window: window as unknown as Window, parent, listeners,
    message(data: unknown, origin = "https://courses.example.test", source: unknown = parent) {
      for (const listener of listeners) listener({ data, origin, source } as MessageEvent)
    } }
}
const connect = { type: "ardesia.lesson-passage.connect.v1", channel: CHANNEL }
describe("ephemeral Studio → Aula passage bridge", () => {
  it("waits for a pinned opener handshake and sends only after the teacher's explicit send", () => {
    const h = host(); const bridge = createStudioCourseBridge(h.window)
    expect(h.parent.postMessage).toHaveBeenCalledExactlyOnceWith({ type: "ardesia.lesson-passage.ready.v1", channel: CHANNEL }, "https://courses.example.test")
    expect(() => bridge.send({ schema: "ardesia.lesson-passage.v1" })).toThrow(/collegata/)
    h.message(connect)
    expect(bridge.getSnapshot()).toEqual({ available: true, connected: true })
    const descriptor = { schema: "ardesia.lesson-passage.v1", recordingId: "synthetic" }
    bridge.send(descriptor)
    expect(h.parent.postMessage).toHaveBeenLastCalledWith({ type: "ardesia.lesson-passage.proposed.v1", channel: CHANNEL, descriptor }, "https://courses.example.test")
    bridge.dispose(); expect(h.listeners.size).toBe(0)
  })
  it.each(["origin", "source", "channel", "extra-field"])("rejects hostile %s before connecting", (attack) => {
    const h = host(); const bridge = createStudioCourseBridge(h.window)
    h.message(attack === "channel" ? { ...connect, channel: crypto.randomUUID() } : attack === "extra-field" ? { ...connect, origin: "https://evil.example" } : connect,
      attack === "origin" ? "https://evil.example" : "https://courses.example.test", attack === "source" ? {} : h.parent)
    expect(bridge.getSnapshot().connected).toBe(false)
    expect(() => bridge.send({})).toThrow()
  })
  it("pins matching loopback dev origins and never accepts an origin from query", () => {
    const h = host(`http://127.0.0.1:5197/?courseBridge=${CHANNEL}&origin=https://evil.example`)
    const bridge = createStudioCourseBridge(h.window)
    expect(h.parent.postMessage).toHaveBeenCalledWith({ type: "ardesia.lesson-passage.ready.v1", channel: CHANNEL }, "http://127.0.0.1:5320")
    h.message(connect, "http://localhost:5320"); expect(bridge.getSnapshot().connected).toBe(false)
    h.message(connect, "http://127.0.0.1:5320"); expect(bridge.getSnapshot().connected).toBe(true)
  })
  it.each(["http://127.0.0.1:5999/", "https://evil.example/", "http://localhost:5197/?courseBridge=invalid&", `http://localhost:5197/?courseBridge=${CHANNEL}&courseBridge=${CHANNEL}&`])("disables an invalid bridge launch at %s", (base) => {
    const h = host(`${base}${base.includes("?") ? "" : "?"}courseBridge=${CHANNEL}`)
    const bridge = createStudioCourseBridge(h.window)
    expect(bridge.getSnapshot().available).toBe(false)
    expect(h.parent.postMessage).not.toHaveBeenCalled()
  })
  it("invalidates a disposed bridge and a closed opener instead of sending to a replacement", () => {
    const h = host(); const bridge = createStudioCourseBridge(h.window)
    h.message(connect); h.parent.closed = true
    expect(() => bridge.send({})).toThrow()
    bridge.dispose(); h.parent.closed = false; h.message(connect)
    expect(() => bridge.send({})).toThrow()
  })
})
