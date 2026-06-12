// TOOLHOST-SPEC-v0 §3 — superficie iframe del tool, modello vscode-webview:
// allow-same-origin è NECESSARIO oltre che sicuro. Sicuro perché l'origin
// per-tool è DISTINTA dallo Studio (il browser partiziona storage/cookie per
// tool gratis); necessario perché senza, il documento avrebbe origin OPACA e
// postMessage con targetOrigin concreto non consegnerebbe MAI l'hello.
// No allow-popups, no allow-top-navigation (spec §3). MAI token in URL: il
// bearer arriva solo nel ReadyAck post-nonce, sulla porta nei transferables.

import { useEffect, useMemo, useRef } from "react"
import type { ToolHost } from "./host.ts"
import type { ToolOriginServer } from "./originServer.ts"
import { postHello } from "./session.ts"

export const TOOL_IFRAME_SANDBOX = "allow-scripts allow-forms allow-same-origin"

export interface ToolFrameProps {
  host: ToolHost
  originServer: ToolOriginServer
  title?: string
  className?: string
}

export function ToolFrame({ host, originServer, title, className }: ToolFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  // un render-instance = un document-load = un nonce (monouso lato origin-server)
  const src = useMemo(() => originServer.issueEntryUrl(), [originServer])

  useEffect(() => {
    return () => host.unmount()
  }, [host])

  // onLoad scatta a OGNI navigazione dell'iframe: il targetOrigin stretto fa sì
  // che un documento navigato fuori dall'origin del tool non riceva mai l'hello.
  // Nota v0: un reload interno ri-colpisce l'entry con nonce già consumato → 403
  // (il documento va ri-emesso dall'host, non auto-ricaricato).
  function handleLoad(): void {
    const cw = frameRef.current?.contentWindow
    if (cw === null || cw === undefined) return
    const channel = new MessageChannel()
    const session = host.mount(channel.port1)
    postHello(cw, session.hello, channel.port2, originServer.origin)
  }

  return (
    <iframe
      ref={frameRef}
      src={src}
      sandbox={TOOL_IFRAME_SANDBOX}
      onLoad={handleLoad}
      title={title ?? host.manifest.name}
      className={className}
    />
  )
}
