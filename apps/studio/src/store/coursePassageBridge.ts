// Ephemeral transport only: no actor, credential, recording bytes or session authority.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
export function createStudioCourseBridge(host: Window): {
  getSnapshot(): { available: boolean; connected: boolean }
  subscribe(listener: () => void): () => void
  send(descriptor: unknown): void
  dispose(): void
} {
  const url = new URL(host.location.href)
  const channel = url.searchParams.get("courseBridge")
  const peer = host.opener
  let peerOrigin: string | null = null
  if (url.pathname === "/studio/" || url.pathname === "/studio") peerOrigin = url.origin
  else if (url.origin === "http://127.0.0.1:5197") peerOrigin = "http://127.0.0.1:5320"
  else if (url.origin === "http://localhost:5197") peerOrigin = "http://localhost:5320"
  let disposed = false
  let state: Readonly<{ available: boolean; connected: boolean }> = Object.freeze({ available: !!peer && !!peerOrigin && channel !== null && UUID.test(channel) && url.searchParams.getAll("courseBridge").length === 1, connected: false })
  const listeners = new Set<() => void>()
  const publish = (connected: boolean) => {
    state = Object.freeze({ ...state, connected })
    for (const listener of listeners) listener()
  }
  const receive = (event: MessageEvent) => {
    if (disposed || !state.available || event.origin !== peerOrigin || event.source !== peer || peer?.closed) return
    const data: unknown = event.data
    if (typeof data !== "object" || data === null || Array.isArray(data)) return
    const message = data as Record<string, unknown>
    if (Object.keys(message).sort().join() !== "channel,type" || message.type !== "ardesia.lesson-passage.connect.v1" || message.channel !== channel) return
    publish(true)
  }
  host.addEventListener("message", receive)
  if (state.available) peer!.postMessage({ type: "ardesia.lesson-passage.ready.v1", channel }, peerOrigin!)
  return {
    getSnapshot: () => state,
    subscribe: (listener) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    send: (descriptor) => {
      if (disposed || !state.connected || !peer || peer.closed || !peerOrigin) {
        if (state.connected) publish(false)
        throw new Error("Aula non collegata: riapri Studio dal corso.")
      }
      peer.postMessage({ type: "ardesia.lesson-passage.proposed.v1", channel, descriptor }, peerOrigin)
    },
    dispose: () => { disposed = true; host.removeEventListener("message", receive); publish(false); listeners.clear() },
  }
}
