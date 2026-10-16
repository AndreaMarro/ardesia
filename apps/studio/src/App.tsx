import { Suspense, lazy } from "react"
import { isReferenceBlinkDemo } from "./store/referenceBlinkDemo"
import { isToolLabView } from "./store/toolLabView"
import { isElabLabView } from "./store/elabLabView"
import { isSimulationPluginView } from "./store/simulationPluginView"
import { isSavedLessonsView } from "./store/savedLessonsView"
import { isPluginWizardView } from "./store/pluginWizardView"
import { isTeacherDashboardView } from "./store/teacherDashboardView"
import { isContinuityView } from "./store/continuityView"
import { isRecapView } from "./store/isRecapView"

// Code-split per vista: Excalidraw (~MB) e le viste che lo usano escono
// dall'entry — l'entry resta il solo router. Ogni vista arriva come chunk
// lazy alla prima navigazione.
const Room = lazy(() => import("./Room"))
const ReferenceBlinkDemo = lazy(() => import("./design/ReferenceBlinkDemo"))
const ToolLab = lazy(() => import("./design/ToolLab"))
const SimulationPluginWorkbench = lazy(() => import("./design/SimulationPluginWorkbench"))
const MultiPostitWorkbench = lazy(() => import("./design/MultiPostitWorkbench"))
const ElabLab = lazy(() => import("./design/ElabLab"))
const SavedLessonsView = lazy(() => import("./design/SavedLessonsView"))
const PluginWizard = lazy(() => import("./design/PluginWizard"))
const TeacherDashboardView = lazy(() => import("./design/TeacherDashboardView"))
const ContinuityView = lazy(() => import("./design/ContinuityView"))
const RecapPage = lazy(() => import("./RecapPage"))

/** Fallback neutro: header brand senza testo di stato (nessun flash di layout). */
function ViewFallback() {
  return <div className="st-bar" aria-busy="true" />
}

function isMultiPostitWorkbenchView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "simulatore-postit"
  } catch {
    return false
  }
}

export default function App() {
  return (
    <Suspense fallback={<ViewFallback />}>
      {isRecapView() ? <RecapPage /> : isContinuityView() ? <ContinuityView /> : isTeacherDashboardView() ? <TeacherDashboardView /> : isPluginWizardView() ? <PluginWizard /> : isSavedLessonsView() ? <SavedLessonsView /> : isMultiPostitWorkbenchView() ? <MultiPostitWorkbench /> : isSimulationPluginView() ? <SimulationPluginWorkbench /> : isElabLabView() ? <ElabLab /> : isToolLabView() ? <ToolLab /> : isReferenceBlinkDemo() ? <ReferenceBlinkDemo /> : <Room />}
    </Suspense>
  )
}
