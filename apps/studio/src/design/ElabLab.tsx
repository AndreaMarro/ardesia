// ELAB Lab (?vista=elab-lab) — P0 accoppiato canon ELAB-AS-PLUGIN §6:
// l'host di prodotto consuma l'UNICO entry renderEmbeddable() del Simulation
// Plugin (MOUNT-CANVAS: il plugin possiede solo il canvas, la shell è
// dell'host) e il calcolo elettrico passa ESCLUSIVAMENTE dal dispatch
// simulationPluginRegistry.solve (motore reale dietro registry, deny-by-
// default) — mai un import diretto del solver dalla vista.
//
// Dato montato: l'esperimento reale del Pack v1-cap6-esp1 ("Accendi il tuo
// primo LED", Vol.1 cap.6) — zero mock, stessa topologia del golden elettrico
// (ElabSolver.test.ts).

import { useEffect, useMemo, useRef, useState } from "react"
import { renderEmbeddable } from "@elab-tutor-plugin/plugin/renderEmbeddable"
import type { ElabVolumeExperiment } from "@elab-tutor-plugin/data/experiments-vol1"
import {
  ALL_EXPERIMENTS,
  findExperimentById,
} from "@elab-tutor-plugin/data/experiments-index"
import {
  ELAB_LAB_DEFAULT_EXPERIMENT_ID,
  readElabLabExperimentId,
} from "../store/elabLabView"
import { getLessonPath } from "@elab-pack/data/lesson-paths"
import { getVolumeLabel, getVolumeRef } from "@elab-pack/data/volume-references"
import { getSimulationTool } from "../toolhost/simulationPluginRegistry"
// Import con side-effect deliberato: registra l'entry del Simulation Plugin
// (render + solve reale) nel registry — lo stesso dispatch usato dal canvas.
import { REFERENCE_SIM_TOOL_ID } from "../toolhost/ToolCanvasEmbeddable"
import type { SolveResult, SolverExperiment } from "../../sim/solver/elabSolver"
import { createTypedEventBus, type ArdesiaEventMap } from "../core/contracts/eventBus"
import { bindBusToEventLog } from "../lessonos/busEventLogBinding"
import { createEventLogStore } from "../lessonos/indexedDbEventLog"
import type { EventLogStore } from "../lessonos/eventlog"
import {
  listLessonConcepts,
  listMistakeObservations,
  mistakeObservedBusEvent,
  type MistakeObservation,
} from "../lessonos/mistakeObservation"
import {
  buildLessonMemoryExport,
  lessonMemoryFileName,
} from "../lessonos/exportLessonMemory"

export const ELAB_LAB_EXPERIMENT_ID = ELAB_LAB_DEFAULT_EXPERIMENT_ID

/**
 * L'esperimento reale del corpus (88, vol.1-3) montato dalla vista.
 * null = id ignoto (fail-closed, mai un fallback silenzioso sul default).
 */
export function findElabLabExperiment(
  experimentId: string = ELAB_LAB_EXPERIMENT_ID,
): ElabVolumeExperiment | null {
  return findExperimentById(experimentId)
}

/** Proiezione dell'esperimento Pack sul contratto del solve (solo i campi elettrici). */
export function toSolverExperiment(experiment: ElabVolumeExperiment): SolverExperiment {
  return {
    components: experiment.components,
    connections: experiment.connections,
    pinAssignments: experiment.pinAssignments,
  }
}

type SolveOutcome =
  | { kind: "ok"; result: SolveResult }
  | { kind: "no-solve" }
  | { kind: "error"; detail: string }

function dispatchSolve(experiment: ElabVolumeExperiment): SolveOutcome {
  const entry = getSimulationTool(REFERENCE_SIM_TOOL_ID)
  if (entry?.solve === undefined) return { kind: "no-solve" }
  try {
    return { kind: "ok", result: entry.solve(toSolverExperiment(experiment)) }
  } catch (error) {
    return { kind: "error", detail: String(error) }
  }
}

interface ElabLabProps {
  /**
   * Event-log della lezione (iniettabile nei test); assente = creato qui
   * (IndexedDB, fallback InMemory — la marcatura parte comunque).
   */
  eventLog?: EventLogStore
}

export default function ElabLab({ eventLog }: ElabLabProps = {}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const experimentId = useMemo(readElabLabExperimentId, [])
  const experiment = useMemo(() => findElabLabExperiment(experimentId), [experimentId])
  const solve = useMemo(
    () => (experiment === null ? null : dispatchSolve(experiment)),
    [experiment],
  )

  // Marcatura errori (emittente error.observed): dati dal Pack, concetto
  // SCELTO dal docente (mai un mapping inventato), transito via bus tipizzato,
  // persistenza via bindBusToEventLog. Fallimenti di registrazione VISIBILI.
  // Citazione dal libro (Pack volume-references, estratto dai PDF ufficiali):
  // mostrata VERBATIM. Riferimento assente = pannello assente (Principio
  // Zero: mai testo inventato al suo posto).
  const bookRef = useMemo(() => getVolumeRef(experimentId), [experimentId])
  const bookLabel = useMemo(() => getVolumeLabel(experimentId), [experimentId])
  const lessonPath = useMemo(() => getLessonPath(experimentId), [experimentId])
  const observations = useMemo(
    () => (lessonPath === null ? [] : listMistakeObservations(lessonPath)),
    [lessonPath],
  )
  const concepts = useMemo(
    () => (lessonPath === null ? [] : listLessonConcepts(lessonPath)),
    [lessonPath],
  )
  const bus = useMemo(() => createTypedEventBus<ArdesiaEventMap>(), [])
  const [log, setLog] = useState<EventLogStore | null>(eventLog ?? null)
  const [conceptId, setConceptId] = useState<string | null>(null)
  const [markedCount, setMarkedCount] = useState(0)
  const [recordError, setRecordError] = useState<string | null>(null)

  useEffect(() => {
    if (eventLog !== undefined) return
    let cancelled = false
    void createEventLogStore().then((store) => {
      if (!cancelled) setLog(store)
    })
    return () => {
      cancelled = true
    }
  }, [eventLog])

  useEffect(() => {
    if (log === null) return
    return bindBusToEventLog(bus, log, {
      onRecordError: () =>
        setRecordError("Errore osservato NON registrato nella memoria della lezione."),
    })
  }, [bus, log])

  const selectedConcept = concepts.find((concept) => concept.conceptId === conceptId) ?? null

  const markMistake = (observation: MistakeObservation) => {
    if (selectedConcept === null || log === null) return
    bus.emit(
      "error.observed",
      mistakeObservedBusEvent({
        experimentId,
        observation,
        concept: selectedConcept,
        t: Date.now(),
      }),
    )
    setMarkedCount((count) => count + 1)
  }

  // Export della memoria della lezione (golden-path §8, segmento export):
  // il modulo costruisce il JSON versionato dall'event-log, qui SOLO il
  // download. Timestamp del click: l'export fotografa un momento reale.
  const exportMemory = async () => {
    if (log === null) return
    const data = await buildLessonMemoryExport(log, {
      experimentId,
      now: Date.now(),
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = lessonMemoryFileName(data.experimentId, data.exportedAt)
    anchor.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const node = canvasRef.current
    if (node === null || experiment === null) return
    const handle = renderEmbeddable(node, { experiment })
    return () => handle.dispose()
  }, [experiment])

  const ledOn = solve?.kind === "ok" && solve.result.componentStates.led1?.on === true
  const ledCurrent = solve?.kind === "ok" ? solve.result.currents.led1 : undefined

  return (
    <div
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}
      data-elab-lab-state={experiment === null ? "no-experiment" : "mounted"}
    >
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">ELAB Lab — Simulation Plugin (motore reale via registry)</span>
        </span>
        {/* Parallelismo ai libri: un'opzione per OGNI esperimento del corpus.
            La scelta naviga (?esperimento=) — la vista resta URL-driven. */}
        <select
          data-elab-experiment-select
          value={experimentId}
          title="Scegli l'esperimento del libro"
          onChange={(event) => {
            const url = new URL(window.location.href)
            url.searchParams.set("esperimento", event.target.value)
            window.location.assign(url.toString())
          }}
        >
          {ALL_EXPERIMENTS.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title}
            </option>
          ))}
        </select>
        {experiment !== null && (
          <span className="st-chip-student st-chip-lesson" title="Esperimento del Pack ELAB">
            {experiment.title}
          </span>
        )}
      </header>

      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {experiment === null && (
          <div role="alert" className="reference-tool-panel" style={{ padding: 16 }}>
            <strong>Esperimento del Pack non trovato (fail-closed).</strong>
            <div>id richiesto: {experimentId}</div>
          </div>
        )}

        {experiment !== null && (
          <>
            <div ref={canvasRef} data-elab-canvas style={{ position: "absolute", inset: 0 }} />
            <div className="elab-lab-panels">
            <div className="reference-tool-panel" data-elab-lab-solve={solve?.kind ?? "no-solve"}>
              <div className="reference-tool-panel-bar">
                <span className="reference-tool-dot" data-on={ledOn ? "1" : "0"} aria-hidden />
                verifica circuito (registry.solve)
              </div>
              {solve?.kind === "ok" && (
                <dl style={{ margin: 0, padding: "4px 8px" }}>
                  <div>
                    <dt style={{ display: "inline" }}>LED: </dt>
                    <dd style={{ display: "inline", margin: 0 }} data-led-on={ledOn ? "1" : "0"}>
                      {ledOn ? "acceso" : "spento"}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ display: "inline" }}>Corrente LED (mA): </dt>
                    <dd style={{ display: "inline", margin: 0 }} data-led-current-ma>
                      {ledCurrent === undefined ? "—" : (ledCurrent * 1000).toFixed(1)}
                    </dd>
                  </div>
                  {solve.result.diagnostics.shortCircuit && (
                    <div role="alert">
                      <strong>Corto circuito rilevato.</strong>
                    </div>
                  )}
                  {solve.result.warnings.map((warning) => (
                    <div key={warning} data-solve-warning>
                      {warning}
                    </div>
                  ))}
                </dl>
              )}
              {solve?.kind === "no-solve" && (
                <div role="alert" style={{ padding: "4px 8px" }}>
                  solve non dispatchabile: tool non registrato (deny-by-default)
                </div>
              )}
              {solve?.kind === "error" && (
                <div role="alert" style={{ padding: "4px 8px" }}>
                  solve fallito: {solve.detail}
                </div>
              )}
            </div>

            {bookRef !== null && (
              <div className="reference-tool-panel" data-elab-lab-citation>
                <div className="reference-tool-panel-bar">dal libro — {bookLabel}</div>
                <div style={{ padding: "4px 8px" }}>
                  <div data-book-chapter style={{ fontWeight: 600 }}>
                    {bookRef.chapter}
                  </div>
                  {bookRef.bookText !== undefined && (
                    <p style={{ margin: "4px 0" }}>{bookRef.bookText}</p>
                  )}
                  {bookRef.bookInstructions !== undefined &&
                    bookRef.bookInstructions.length > 0 && (
                      <ol style={{ margin: "4px 0", paddingLeft: 18 }}>
                        {bookRef.bookInstructions.map((step) => (
                          <li key={step} data-book-step>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                  {bookRef.bookQuote !== undefined && (
                    <blockquote style={{ margin: "4px 0", fontStyle: "italic" }}>
                      {bookRef.bookQuote}
                    </blockquote>
                  )}
                </div>
              </div>
            )}

            {observations.length > 0 && (
              <div
                className="reference-tool-panel"
                data-elab-lab-marcatura
                style={{ maxWidth: 360 }}
              >
                <div className="reference-tool-panel-bar">
                  errori osservati (CHIEDI → memoria della lezione)
                </div>
                <div style={{ padding: "4px 8px" }}>
                  <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                    <legend>Concetto coinvolto (scegli tu, non lo inventa il sistema):</legend>
                    {concepts.map((concept) => (
                      <label key={concept.conceptId} style={{ display: "block" }}>
                        <input
                          type="radio"
                          name="elab-lab-concept"
                          value={concept.conceptId}
                          checked={conceptId === concept.conceptId}
                          onChange={() => setConceptId(concept.conceptId)}
                        />{" "}
                        {concept.label}
                      </label>
                    ))}
                  </fieldset>
                  <div role="group" aria-label="Errori comuni della fase CHIEDI">
                    {observations.map((observation) => (
                      <button
                        key={observation.errorId}
                        type="button"
                        data-mistake-id={observation.errorId}
                        disabled={selectedConcept === null || log === null}
                        title={observation.teacherResponse}
                        onClick={() => markMistake(observation)}
                        style={{ display: "block", margin: "4px 0" }}
                      >
                        {observation.mistake}
                      </button>
                    ))}
                  </div>
                  <div data-marked-count>errori segnati: {markedCount}</div>
                  {recordError && <div role="alert">{recordError}</div>}
                </div>
              </div>
            )}

            <div className="reference-tool-panel" data-elab-lab-export>
              <div className="reference-tool-panel-bar">memoria della lezione</div>
              <div style={{ padding: "4px 8px" }}>
                <button type="button" disabled={log === null} onClick={() => void exportMemory()}>
                  Esporta memoria (JSON)
                </button>
              </div>
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
