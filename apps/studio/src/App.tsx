import { Suspense, lazy } from "react"
import { isReferenceBlinkDemo } from "./store/referenceBlinkDemo"
import { isToolLabView } from "./store/toolLabView"

// Code-split per vista: Excalidraw (~MB) e le viste che lo usano escono
// dall'entry — l'entry resta il solo router. Ogni vista arriva come chunk
// lazy alla prima navigazione.
const Room = lazy(() => import("./Room"))
const ReferenceBlinkDemo = lazy(() => import("./design/ReferenceBlinkDemo"))
const ToolLab = lazy(() => import("./design/ToolLab"))

/** Fallback neutro: header brand senza testo di stato (nessun flash di layout). */
function ViewFallback() {
  return <div className="st-bar" aria-busy="true" />
}

export default function App() {
  return (
    <Suspense fallback={<ViewFallback />}>
      {isToolLabView() ? <ToolLab /> : isReferenceBlinkDemo() ? <ReferenceBlinkDemo /> : <Room />}
    </Suspense>
  )
}
