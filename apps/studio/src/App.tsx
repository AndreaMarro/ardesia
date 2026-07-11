import { Suspense, lazy } from "react"
import StudioShell from "./design/StudioShell"
import { isReferenceBlinkDemo } from "./store/referenceBlinkDemo"
import { isToolLabView } from "./store/toolLabView"
import { isSavedLessonsView } from "./store/savedLessonsView"
import { isPluginWizardView } from "./store/pluginWizardView"
import { isTeacherDashboardView } from "./store/teacherDashboardView"

// Code-split per vista: Excalidraw (~MB) e le viste che lo usano escono
// dall'entry — l'entry resta il solo router. Ogni vista arriva come chunk
// lazy alla prima navigazione.
const Room = lazy(() => import("./Room"))
const ReferenceBlinkDemo = lazy(() => import("./design/ReferenceBlinkDemo"))
const ToolLab = lazy(() => import("./design/ToolLab"))
const SavedLessonsView = lazy(() => import("./design/SavedLessonsView"))
const PluginWizard = lazy(() => import("./design/PluginWizard"))
const TeacherDashboardView = lazy(() => import("./design/TeacherDashboardView"))
const KnowledgeExplorerView = lazy(() => import("./design/KnowledgeExplorerView"))
const LibraryView = lazy(() => import("./design/LibraryView"))

/** Fallback neutro: header brand senza testo di stato (nessun flash di layout). */
function ViewFallback() {
  return <div className="st-bar" aria-busy="true" />
}

function isKnowledgeExplorerView(): boolean {
  try {
    if (typeof window === "undefined") return false
    return new URL(window.location.href).searchParams.get("vista") === "knowledge"
  } catch {
    return false
  }
}

function isLibraryView(): boolean {
  try {
    if (typeof window === "undefined") return false
    return new URL(window.location.href).searchParams.get("vista") === "library"
  } catch {
    return false
  }
}

function isMarketplaceView(): boolean {
  try {
    if (typeof window === "undefined") return false
    return new URL(window.location.href).searchParams.get("vista") === "marketplace"
  } catch {
    return false
  }
}

function MarketplaceView() {
  return (
    <StudioShell current="marketplace" searchLabel="Cerca nel Marketplace">
      <section data-marketplace-view aria-labelledby="marketplace-heading">
        <h1 id="marketplace-heading">Marketplace</h1>
        <p>Nessun elemento del catalogo e' disponibile in questa vista.</p>
      </section>
    </StudioShell>
  )
}

export default function App() {
  return (
    <Suspense fallback={<ViewFallback />}>
      {isTeacherDashboardView() ? <TeacherDashboardView /> : isKnowledgeExplorerView() ? <KnowledgeExplorerView /> : isLibraryView() ? <LibraryView /> : isMarketplaceView() ? <MarketplaceView /> : isPluginWizardView() ? <PluginWizard /> : isSavedLessonsView() ? <SavedLessonsView /> : isToolLabView() ? <ToolLab /> : isReferenceBlinkDemo() ? <ReferenceBlinkDemo /> : <Room />}
    </Suspense>
  )
}
