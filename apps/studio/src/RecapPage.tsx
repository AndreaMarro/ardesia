import { useEffect, useMemo, useState } from "react"
import { workspaceStore } from "./store/WorkspaceStore"
import { validateRoomId } from "./store/roomPaths"
import RecapView from "./RecapView"
import ViewNav from "./design/ViewNav"
import EmptyState from "./design/EmptyState"

/** A readonly route: no Room, session writer or activity registration. */
export default function RecapPage() {
  const room = useMemo(() => {
    try { return validateRoomId(window.location.hash.replace(/^#/, "")) }
    catch { return null }
  }, [])
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (room === null) return
    let cancelled = false
    workspaceStore.init().then(() => { if (!cancelled) setInitialized(true) })
      .catch((failure: unknown) => { if (!cancelled) setError(failure instanceof Error ? failure.message : String(failure)) })
    return () => { cancelled = true }
  }, [room])
  if (room !== null && initialized) return <RecapView store={workspaceStore} room={room} />
  return <div>
    <header className="st-bar"><ViewNav current="materiali" /></header>
    <main style={{ padding: 24 }}>
      {room === null ? <EmptyState tone="error" title="Nessuna lezione selezionata"
        detail="Apri il riepilogo da Materiali per conservare il riferimento alla lezione." />
        : error ? <EmptyState tone="error" title="Archivio non disponibile" detail={error} />
          : <p role="status">Apro gli appunti salvati…</p>}
    </main>
  </div>
}
