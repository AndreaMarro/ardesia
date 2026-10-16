// ELAB Lab (?vista=elab-lab) — P0 accoppiato canon ELAB-AS-PLUGIN §6:
// l'host di prodotto consuma l'UNICO entry renderEmbeddable() del Simulation
// Plugin (MOUNT-CANVAS: il plugin possiede solo il canvas, la shell è
// dell'host) e il calcolo elettrico passa ESCLUSIVAMENTE dal dispatch
// simulationPluginRegistry.solve (motore reale dietro registry, deny-by-
// default) — mai un import diretto del solver dalla vista.
//
// PRECISAZIONE (2026-07-31, F5-1): «mai un import diretto» vale per il
// CALCOLO. Dal modulo del solver questa vista importa solo tipi e proiezioni
// PURE di un SolveResult già ottenuto dal registry (rgbChannelsFromSolve,
// formatRgbChannelMa): nessuna di esse chiama il motore. La garanzia è
// verificata dal test «il solve passa dal REGISTRY», che sostituisce l'entry
// del registry e pretende che il pannello mostri i numeri finti.
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
  filterVisibleExperiments,
  isVisibleExperiment,
} from "@elab-tutor-plugin/data/experiment-visibility"
import {
  ELAB_LAB_DEFAULT_EXPERIMENT_ID,
  readElabLabExperimentId,
} from "../store/elabLabView"
import { getLessonPath } from "@elab-pack/data/lesson-paths"
import { getVolumeLabel, getVolumeRef } from "@elab-pack/data/volume-references"
import { getSimulationTool } from "../toolhost/simulationPluginRegistry"
import { measureReadout } from "../core/contracts/ledReadout"
// Import con side-effect deliberato: registra l'entry del Simulation Plugin
// (render + solve reale) nel registry — lo stesso dispatch usato dal canvas.
import { REFERENCE_SIM_TOOL_ID } from "../toolhost/ToolCanvasEmbeddable"
import {
  formatRgbChannelMa,
  monoLedStateFromSolve,
  rgbChannelsFromSolve,
  type RgbChannels,
  type SolveResult,
  type SolverExperiment,
} from "../../sim/solver/elabSolver"
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
import { analyzeFreeAssembly } from "../../sim/freeAssembly"
import ViewNav from "./ViewNav"

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
    const result = entry.solve(toSolverExperiment(experiment))
    if (!result.ok) return { kind: "error", detail: result.diagnostics.shortCircuit ? "Corto circuito rilevato" : "Solve rifiutato dal motore" }
    return { kind: "ok", result }
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
  // Montaggio libero: null = modalità spenta (diagnostica sul Pack).
  // Attivata = copia di pinAssignments E componenti del manuale, poi dello
  // studente (aggiungi/togli componenti e terminali: la diagnostica giudica).
  const [studentAssignments, setStudentAssignments] = useState<Record<
    string,
    string
  > | null>(null)
  const [studentComponents, setStudentComponents] = useState<Array<{
    id: string
    type: string
  }> | null>(null)
  const [newAssignmentPin, setNewAssignmentPin] = useState("")
  const [newAssignmentRef, setNewAssignmentRef] = useState("")
  const [newComponentId, setNewComponentId] = useState("")
  const [newComponentType, setNewComponentType] = useState("")

  const startFreeAssembly = () => {
    if (experiment === null) return
    setStudentAssignments({ ...experiment.pinAssignments })
    setStudentComponents(
      experiment.components.map((component) => ({
        id: component.id,
        type: component.type,
      })),
    )
    setNewAssignmentPin("")
    setNewAssignmentRef("")
    setNewComponentId("")
    setNewComponentType("")
  }

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

  // Diagnostica montaggio (report unico #82 sulla vista). Semantica dati
  // (probe firsthand, issue #92): le connections del corpus sono topologia
  // LOGICA, non fili fisici — l'occupazione si valuta sui SOLI pinAssignments
  // (cross-check #74: esattamente i 3 bug canon, 0 falsi positivi;
  // connections-as-wires darebbe 69/88 falsi positivi).
  // In modalità montaggio libero il report gira LIVE sul montaggio dello
  // studente (studentAssignments); spenta = montaggio del Pack.
  const diagnostics = useMemo(
    () =>
      experiment === null
        ? null
        : analyzeFreeAssembly({
            components: studentComponents ?? experiment.components,
            wires: [],
            pinAssignments: studentAssignments ?? experiment.pinAssignments ?? {},
          }),
    [experiment, studentAssignments, studentComponents],
  )
  // type-unregistered = tipo fuori dal catalogo elettrico vendored (60/88
  // esperimenti): il solve lo rifiuta comunque (deny-by-default) — nella
  // vista è un aggregato informativo, non un problema di montaggio per-ref.
  const diagnosticProblems =
    diagnostics === null
      ? []
      : diagnostics.findings.filter((finding) =>
          finding.source === "occupancy" ? true : finding.flag.kind !== "type-unregistered",
        )
  const unregisteredTypes =
    diagnostics === null
      ? new Set<string>()
      : new Set(
          diagnostics.pinVocabulary.flags
            .filter((flag) => flag.kind === "type-unregistered")
            .map((flag) => flag.type),
        )

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

  // F5-1 — l'id del componente luminoso si LEGGE dall'esperimento, non si
  // indovina. Fino al 2026-07-30 questa vista leggeva `led1` costante: per la
  // lampada RGB (v1-cap9-esp6, componente `rgb1`) `componentStates.led1?.on`
  // vale false perché l'id non esiste, e la vista stampava «spento» mentre il
  // motore diceva acceso su tutti e tre i canali. `?.` collassa «assente» e
  // «negativo»: un'assenza travestita da verdetto.
  // TUTTI i componenti luminosi, non uno. 14 esperimenti su 88 ne hanno due o
  // tre (misurato): sceglierne uno e chiamarlo «LED» faceva sparire gli altri
  // in silenzio dietro un indicatore che sembrava riferito all'intero circuito.
  const lights = useMemo(
    () =>
      experiment === null
        ? []
        : experiment.components.filter(
            (component) => component.type === "rgb-led" || component.type === "led",
          ),
    [experiment],
  )

  // Lettura per componente. `missing` NON è «spento»: il registry non
  // garantisce che `componentStates` contenga ogni componente, e normalizzare
  // l'assenza a zero produrrebbe tre correnti «0.0 mA» mai calcolate da
  // nessuno. È la classe di difetto che questa unità chiude: un'assenza
  // stampata come verdetto.
  type LightReading =
    | { kind: "missing"; id: string }
    | { kind: "led"; id: string; on: boolean; burned: boolean; currentAmps: number | undefined }
    | { kind: "rgb"; id: string; on: boolean; channels: RgbChannels }

  const componentStates = useMemo(() => {
    if (solve?.kind !== "ok") return {}
    const states = { ...solve.result.componentStates }
    for (const light of lights) {
      if (light.type === "led") states[light.id] = monoLedStateFromSolve(solve.result, light.id) ?? { measurementStatus: "unknown" }
    }
    return states
  }, [lights, solve])

  const readings = useMemo<LightReading[]>(() => {
    if (solve?.kind !== "ok") return []
    return lights.map((light): LightReading => {
      const state = componentStates[light.id]
      if (state === undefined || typeof state.on !== "boolean") return { kind: "missing", id: light.id }
      if (light.type === "rgb-led") {
        const channels = rgbChannelsFromSolve(solve.result, light.id)
        if (Object.values(channels).some(channel => !channel.available)) return { kind: "missing", id: light.id }
        return {
          kind: "rgb",
          id: light.id,
          on: state.on === true,
          channels,
        }
      }
      return {
        kind: "led",
        id: light.id,
        on: state.on === true,
        // Verdetto onesto del motore: un LED bruciato (es. v1-cap6-esp2, senza
        // resistore) NON è un generico "spento" — è la lezione del libro (p.32).
        burned: (state as { burned?: boolean }).burned === true,
        currentAmps: solve.result.currents[light.id],
      }
    })
  }, [lights, solve, componentStates])

  const missingLights = readings.filter((reading) => reading.kind === "missing")
  /** Un verdetto esiste solo se OGNI componente luminoso ha uno stato. */
  const hasVerdict = readings.length > 0 && missingLights.length === 0
  const ledOn = hasVerdict && readings.some((reading) => reading.kind !== "missing" && reading.on)
  const ledBurned =
    hasVerdict && readings.some((reading) => reading.kind === "led" && reading.burned)
  // Forma singola conservata quando la luce è una sola: è il caso di 74
  // esperimenti su 88, e i selettori esistenti restano univoci.
  const single = hasVerdict && readings.length === 1 ? readings[0] : null
  const ledCurrent = single?.kind === "led" ? single.currentAmps : undefined
  const rgbChannels = single?.kind === "rgb" ? single.channels : null

  useEffect(() => {
    const node = canvasRef.current
    if (node === null || experiment === null) return
    const handle = renderEmbeddable(node, {
      experiment,
      componentStates: hasVerdict ? componentStates : {},
    })
    return () => handle.dispose()
  }, [experiment, componentStates, hasVerdict])

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
        <ViewNav current="elab-lab" />
        {/* Disciplina Scene Forge: il picker offre SOLO la whitelist
            VISIBLE_EXP_IDS (fonte di verità, selezione Andrea 25/05/2026).
            La scelta naviga (?esperimento=) — la vista resta URL-driven e la
            resurrezione via URL di un id fuori whitelist resta possibile:
            in quel caso l'id corrente compare come voce disabilitata. */}
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
          {filterVisibleExperiments(ALL_EXPERIMENTS).map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title}
            </option>
          ))}
          {experiment !== null && !isVisibleExperiment(experimentId) && (
            <option key={experimentId} value={experimentId} disabled>
              {experiment.title} (fuori catalogo oggi)
            </option>
          )}
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
                  {/* Nessuno stato per uno dei componenti luminosi ⇒ NESSUN
                      verdetto. L'attributo data-led-on non viene emesso
                      affatto: la sua assenza è il segnale, e non può essere
                      letta come «spento». */}
                  {missingLights.length > 0 ? (
                    <div role="alert" data-led-state="missing">
                      <strong>Verdetto non disponibile.</strong> Il registry non ha restituito
                      lo stato di: {missingLights.map((reading) => reading.id).join(", ")}.
                    </div>
                  ) : readings.length === 0 ? (
                    <div role="alert" data-led-state="no-light">
                      Nessun componente luminoso in questo esperimento.
                    </div>
                  ) : (
                    <>
                      <div>
                        <dt style={{ display: "inline" }}>
                          {readings.length === 1 ? "LED: " : `LED (${readings.length}): `}
                        </dt>
                        <dd
                          style={{ display: "inline", margin: 0 }}
                          data-led-on={ledOn ? "1" : "0"}
                          data-led-burned={ledBurned ? "1" : "0"}
                          data-led-count={String(readings.length)}
                        >
                          {ledBurned
                            ? "BRUCIATO (sovracorrente!)"
                            : ledOn
                              ? readings.length === 1
                                ? "acceso"
                                : "almeno uno acceso"
                              : "spento"}
                        </dd>
                      </div>
                      {single !== null && single.kind === "led" && (
                        <div>
                          <dt style={{ display: "inline" }}>Corrente LED (mA): </dt>
                          <dd style={{ display: "inline", margin: 0 }} data-led-current-ma>
                            {ledCurrent === undefined ? "—" : measureReadout(ledCurrent * 1000)}
                          </dd>
                        </div>
                      )}
                      {rgbChannels !== null && (
                        <div>
                          <dt style={{ display: "inline" }}>Canali RGB: </dt>
                          <dd style={{ display: "inline", margin: 0 }} data-rgb-channels>
                            {`R ${formatRgbChannelMa(rgbChannels.red)} · G ${formatRgbChannelMa(
                              rgbChannels.green,
                            )} · B ${formatRgbChannelMa(rgbChannels.blue)}`}
                          </dd>
                        </div>
                      )}
                      {/* Più di una luce: ognuna NOMINATA con il suo valore.
                          L'aggregato qui sopra dice «almeno uno», non «il
                          circuito»: la differenza è ciò che il docente legge. */}
                      {readings.length > 1 &&
                        readings.map((reading) =>
                          reading.kind === "missing" ? null : (
                            <div key={reading.id} data-light-id={reading.id}>
                              <dt style={{ display: "inline" }}>{reading.id}: </dt>
                              <dd style={{ display: "inline", margin: 0 }}>
                                {reading.kind === "rgb"
                                  ? `${reading.on ? "acceso" : "spento"} · R ${formatRgbChannelMa(
                                      reading.channels.red,
                                    )} · G ${formatRgbChannelMa(
                                      reading.channels.green,
                                    )} · B ${formatRgbChannelMa(reading.channels.blue)}`
                                  : `${
                                      reading.burned
                                        ? "BRUCIATO (sovracorrente!)"
                                        : reading.on
                                          ? "acceso"
                                          : "spento"
                                    } · ${
                                      reading.currentAmps === undefined
                                        ? "—"
                                        : `${measureReadout(reading.currentAmps * 1000)} mA`
                                    }`}
                              </dd>
                            </div>
                          ),
                        )}
                    </>
                  )}
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

            {diagnostics !== null && (
              <div
                className="reference-tool-panel"
                data-elab-lab-diagnostica
                data-diagnostica-problemi={diagnosticProblems.length}
              >
                <div className="reference-tool-panel-bar">
                  diagnostica montaggio (fori + vocabolario pin)
                </div>
                <div style={{ padding: "4px 8px" }}>
                  {diagnosticProblems.length === 0 ? (
                    <div data-diagnostica-ok>nessun problema di montaggio rilevato</div>
                  ) : (
                    <ul style={{ margin: "4px 0", paddingLeft: 18 }}>
                      {diagnosticProblems.map((finding) => (
                        <li key={finding.message} data-diagnostica-finding>
                          {finding.message}
                        </li>
                      ))}
                    </ul>
                  )}
                  {unregisteredTypes.size > 0 && (
                    <div data-diagnostica-tipi-fuori-catalogo>
                      {unregisteredTypes.size} tipi fuori dal catalogo elettrico: il solve
                      li rifiuta (deny-by-default).
                    </div>
                  )}
                </div>
              </div>
            )}

            {experiment.pinAssignments !== undefined &&
              Object.keys(experiment.pinAssignments).length > 0 && (
                <div className="reference-tool-panel" data-elab-lab-montaggio-libero>
                  <div className="reference-tool-panel-bar">
                    montaggio libero (monta tu)
                  </div>
                  <div style={{ padding: "4px 8px" }}>
                    {studentAssignments === null ? (
                      <button
                        type="button"
                        data-montaggio-attiva
                        title="Parti dal montaggio del manuale e modificalo: la diagnostica segue TE"
                        onClick={startFreeAssembly}
                      >
                        Monta tu (parti dal manuale)
                      </button>
                    ) : (
                      <>
                        <div data-montaggio-componenti>
                          <strong>componenti dichiarati</strong>
                          {(studentComponents ?? []).map((component) => (
                            <div key={component.id} style={{ margin: "2px 0" }}>
                              <code>{component.id}</code> ({component.type}){" "}
                              <button
                                type="button"
                                data-montaggio-rimuovi-componente={component.id}
                                title="Togli il componente: i terminali rimasti nei fori diventano orfani (la diagnostica lo dice)"
                                onClick={() =>
                                  setStudentComponents((previous) =>
                                    previous === null
                                      ? previous
                                      : previous.filter(
                                          (entry) => entry.id !== component.id,
                                        ),
                                  )
                                }
                              >
                                togli
                              </button>
                            </div>
                          ))}
                          <div style={{ margin: "2px 0" }}>
                            <input
                              data-montaggio-nuovo-componente-id
                              placeholder="id (es. led2)"
                              value={newComponentId}
                              size={7}
                              onChange={(event) => setNewComponentId(event.target.value)}
                            />{" "}
                            <input
                              data-montaggio-nuovo-componente-tipo
                              placeholder="tipo (es. led)"
                              value={newComponentType}
                              size={7}
                              onChange={(event) => setNewComponentType(event.target.value)}
                            />{" "}
                            <button
                              type="button"
                              data-montaggio-aggiungi-componente
                              disabled={
                                newComponentId.trim() === "" ||
                                newComponentType.trim() === ""
                              }
                              onClick={() => {
                                setStudentComponents((previous) =>
                                  previous === null
                                    ? previous
                                    : [
                                        ...previous,
                                        {
                                          id: newComponentId.trim(),
                                          type: newComponentType.trim(),
                                        },
                                      ],
                                )
                                setNewComponentId("")
                                setNewComponentType("")
                              }}
                            >
                              aggiungi componente
                            </button>
                          </div>
                        </div>
                        <div data-montaggio-assegnazioni style={{ marginTop: 6 }}>
                          <strong>terminali nei fori</strong>
                          {Object.entries(studentAssignments).map(([pin, ref]) => (
                            <div key={pin} style={{ margin: "2px 0" }}>
                              <label>
                                <code>{pin}</code>{" → "}
                                <input
                                  data-montaggio-pin={pin}
                                  value={ref}
                                  size={8}
                                  onChange={(event) =>
                                    setStudentAssignments((previous) =>
                                      previous === null
                                        ? previous
                                        : { ...previous, [pin]: event.target.value },
                                    )
                                  }
                                />
                              </label>{" "}
                              <button
                                type="button"
                                data-montaggio-rimuovi-pin={pin}
                                title="Togli il terminale dal foro"
                                onClick={() =>
                                  setStudentAssignments((previous) => {
                                    if (previous === null) return previous
                                    const next = { ...previous }
                                    delete next[pin]
                                    return next
                                  })
                                }
                              >
                                togli
                              </button>
                            </div>
                          ))}
                          <div style={{ margin: "2px 0" }}>
                            <input
                              data-montaggio-nuovo-pin
                              placeholder="pin (es. led2:anode)"
                              value={newAssignmentPin}
                              size={12}
                              onChange={(event) => setNewAssignmentPin(event.target.value)}
                            />{" "}
                            <input
                              data-montaggio-nuovo-foro
                              placeholder="foro (es. bb1:a1)"
                              value={newAssignmentRef}
                              size={7}
                              onChange={(event) => setNewAssignmentRef(event.target.value)}
                            />{" "}
                            <button
                              type="button"
                              data-montaggio-aggiungi-pin
                              disabled={
                                newAssignmentPin.trim() === "" ||
                                newAssignmentRef.trim() === ""
                              }
                              onClick={() => {
                                setStudentAssignments((previous) =>
                                  previous === null
                                    ? previous
                                    : {
                                        ...previous,
                                        [newAssignmentPin.trim()]:
                                          newAssignmentRef.trim(),
                                      },
                                )
                                setNewAssignmentPin("")
                                setNewAssignmentRef("")
                              }}
                            >
                              aggiungi
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          data-montaggio-ripristina
                          style={{ marginTop: 6 }}
                          onClick={startFreeAssembly}
                        >
                          Ripristina dal manuale
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

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
