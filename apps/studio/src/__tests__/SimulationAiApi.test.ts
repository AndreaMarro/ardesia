// @vitest-environment node

import { describe, expect, it } from "vitest"

import {
  SIMULATION_AI_API_VERSION,
  addComponent,
  compareToTarget,
  connectPins,
  deleteTarget,
  diagnose,
  loadExperiment,
  moveComponent,
  moveWireWaypoint,
  probe,
  replaceWirePath,
  runInstrument,
  retargetWireEndpoint,
  rotateComponent,
  runRuntime,
  runSolve,
  setValue,
} from "../../sim/core/simulationAiApi"
import { createReferenceSimulationScene } from "../toolhost/ToolCanvasEmbeddable"
import { solveSeriesLoop } from "../../sim/breadboard/simulationBreadboard"

describe("Simulation AI API", () => {
  it("exposes typed AI operations that mutate runtime scene and run provider diagnostics", () => {
    const scene = createReferenceSimulationScene()
    const loaded = loadExperiment({
      instanceId: "ai-sim-v1",
      scene,
      diagnostics: ["loaded by ai api"],
    })

    const moved = moveComponent(
      { state: loaded, operationId: "ai-move-led1" },
      { componentId: "led1", pose: { x: 333, y: 222, rotation: 90 } },
    )
    expect(moved.report).toEqual({ ok: true, issues: [] })
    expect(moved.state.scene.layout?.led1).toEqual({ x: 333, y: 222, rotation: 90 })
    expect(moved.state.appliedOperations.at(-1)).toMatchObject({
      id: "ai-move-led1",
      actor: "ai",
      origin: "llm",
      operation: { kind: "move-component", componentId: "led1" },
    })
    expect(moved.state.lastSolverResult?.provider).toBe("local")
    expect(moved.state.diagnostics).toContain("local solver available")

    const recolored = setValue(
      { state: moved.state, operationId: "ai-set-led-color" },
      { componentId: "led1", field: "color", value: "green" },
    )
    expect(recolored.state.scene.components?.find((component) => component.id === "led1")).toMatchObject({
      color: "green",
      attrs: { color: "green" },
    })

    const rotated = rotateComponent(
      { state: recolored.state, operationId: "ai-rotate-r1" },
      { componentId: "r1", rotation: 180 },
    )
    expect(rotated.state.scene.layout?.r1?.rotation).toBe(180)

    const solved = runSolve(rotated.state)
    expect(solved.result.providerDiagnostics).toContainEqual({
      code: "provider-available",
      severity: "info",
      message: "local solver available",
    })
    expect(diagnose(solved.state).provider).toBe("local")
  })

  it("COSTRUZIONE LIBERA: monta un circuito arbitrario (2 resistori in serie) via operazioni, fisica corretta", () => {
    // "Costruire qualsiasi cosa": topologia NON dei volumi (R1 220Ω + R2 330Ω in
    // serie + LED), montata da scena VUOTA con le sole operazioni tipate.
    const loaded = loadExperiment({
      instanceId: "ai-free-series",
      scene: { components: [], connections: [], pinAssignments: {}, layout: {} },
    })
    const s1 = addComponent({ state: loaded, operationId: "add-bb" }, { id: "bb1", type: "breadboard-half", pose: { x: 0, y: 0 } })
    const s2 = addComponent({ state: s1.state, operationId: "add-bat" }, { id: "bat1", type: "battery9v", pose: { x: 0, y: 0 }, pins: [{ id: "positive" }, { id: "negative" }] })
    const s3 = addComponent({ state: s2.state, operationId: "add-r1" }, { id: "r1", type: "resistor", value: 220, pose: { x: 0, y: 0 }, pins: [{ id: "pin1" }, { id: "pin2" }] })
    const s4 = addComponent({ state: s3.state, operationId: "add-r2" }, { id: "r2", type: "resistor", value: 330, pose: { x: 0, y: 0 }, pins: [{ id: "pin1" }, { id: "pin2" }] })
    const s5 = addComponent({ state: s4.state, operationId: "add-led" }, { id: "led1", type: "led", color: "red", pose: { x: 0, y: 0 }, pins: [{ id: "anode" }, { id: "cathode" }] })
    const w1 = connectPins({ state: s5.state, operationId: "w1" }, { id: "w1", from: "bat1:positive", to: "r1:pin1", color: "red" })
    const w2 = connectPins({ state: w1.state, operationId: "w2" }, { id: "w2", from: "r1:pin2", to: "r2:pin1", color: "red" })
    const w3 = connectPins({ state: w2.state, operationId: "w3" }, { id: "w3", from: "r2:pin2", to: "led1:anode", color: "red" })
    const w4 = connectPins({ state: w3.state, operationId: "w4" }, { id: "w4", from: "led1:cathode", to: "bat1:negative", color: "black" })

    // Fisica REALE: solveSeriesLoop somma le resistenze sul cammino elettrico.
    // La scena runtime ha campi extra/opzionali: la restringo alla forma
    // SeriesCircuitScene attesa dal motore fisico.
    const toSeries = (scene: typeof w4.state.scene) => ({
      components: scene.components ?? [],
      pinAssignments: scene.pinAssignments ?? {},
      connections: scene.connections ?? [],
    })
    const loop = solveSeriesLoop(toSeries(w4.state.scene))
    expect(loop.closed).toBe(true)
    expect(loop.resistanceOhms).toBe(550) // 220 + 330 in serie — non una formula fissa da fixture
    expect(loop.ledCount).toBe(1)

    // Rompi la serie: togli il ponte r1→r2 → circuito aperto (fisica coerente).
    const broken = deleteTarget({ state: w4.state, operationId: "del-w2" }, { kind: "wire", id: "w2" })
    expect(solveSeriesLoop(toSeries(broken.state.scene)).closed).toBe(false)
  })

  it("builds a complete LED scene through addComponent/connectPins and compares it to a target", () => {
    const loaded = loadExperiment({
      instanceId: "ai-empty-led",
      scene: {
        components: [],
        connections: [],
        pinAssignments: {},
        layout: {},
      },
    })

    const withBreadboard = addComponent(
      { state: loaded, operationId: "ai-add-bb1" },
      {
        id: "bb1",
        type: "breadboard-half",
        pose: { x: 0, y: 0 },
      },
    )
    const withBattery = addComponent(
      { state: withBreadboard.state, operationId: "ai-add-bat" },
      {
        id: "bat1",
        type: "battery9v",
        pose: { x: 10, y: 10 },
        pins: [{ id: "positive" }, { id: "negative" }],
      },
    )
    const withResistor = addComponent(
      { state: withBattery.state, operationId: "ai-add-r1" },
      {
        id: "r1",
        type: "resistor",
        value: 470,
        pose: { x: 80, y: 30 },
        pins: [{ id: "pin1" }, { id: "pin2" }],
        pinAssignments: {
          "r1:pin1": "bb1:j4",
          "r1:pin2": "bb1:j8",
        },
      },
    )
    const withLed = addComponent(
      { state: withResistor.state, operationId: "ai-add-led1" },
      {
        id: "led1",
        type: "led",
        color: "red",
        pose: { x: 140, y: 30 },
        pins: [{ id: "anode" }, { id: "cathode" }],
        pinAssignments: {
          "led1:anode": "bb1:j5",
          "led1:cathode": "bb1:j6",
        },
      },
    )
    const wired1 = connectPins(
      { state: withLed.state, operationId: "ai-wire-bat-r" },
      { id: "w1", from: "bat1:positive", to: "bb1:bus-top-plus-1", color: "red" },
    )
    const wired2 = connectPins(
      { state: wired1.state, operationId: "ai-wire-r-led" },
      { id: "w2", from: "bb1:bus-top-plus-9", to: "r1:pin1", color: "red" },
    )
    const wired3 = connectPins(
      { state: wired2.state, operationId: "ai-wire-led-gnd" },
      { id: "w3", from: "r1:pin2", to: "led1:anode", color: "red" },
    )
    const wired4 = connectPins(
      { state: wired3.state, operationId: "ai-wire-led-bat-negative" },
      { id: "w4", from: "led1:cathode", to: "bat1:negative", color: "black" },
    )

    expect(compareToTarget(wired4.state, wired4.state.scene)).toEqual({
      ok: true,
      missingComponents: [],
      extraComponents: [],
      missingConnections: [],
      extraConnections: [],
      pinMismatches: [],
    })
    expect(wired4.state.lastSolverResult?.providerDiagnostics).toContainEqual({
      code: "provider-available",
      severity: "info",
      message: "local solver available",
    })

    const withoutWire = deleteTarget(
      { state: wired4.state, operationId: "ai-delete-wire2" },
      { kind: "wire", id: "w2" },
    )
    expect(compareToTarget(withoutWire.state, wired4.state.scene)).toMatchObject({
      ok: false,
      missingConnections: ["bb1:bus-top-plus-9->r1:pin1:red"],
    })
  })

  it("reads probe voltage through provider-derived instrument results", () => {
    const loaded = loadExperiment({
      instanceId: "ai-probe-provider-bound",
      scene: createReferenceSimulationScene(),
    })
    const solved = runSolve(loaded)
    const voltageEntries = Object.entries(solved.result.voltages).sort(
      ([, left], [, right]) => left - right,
    )
    expect(voltageEntries.length).toBeGreaterThanOrEqual(2)

    const [negativeRef, negativeVolts] = voltageEntries[0]!
    const [positiveRef, positiveVolts] = voltageEntries.at(-1)!
    const measured = probe(
      { state: solved.state, operationId: "ai-probe-supply" },
      {
        probeId: "meter-supply",
        instrumentId: "voltmeter",
        positiveRef,
        negativeRef,
      },
    )

    expect(measured.report).toEqual({ ok: true, issues: [] })
    expect(measured.instrument?.ok).toBe(true)
    expect(measured.instrument?.readings).toEqual([
      expect.objectContaining({
        kind: "voltage",
        instrumentId: "voltmeter",
        probeId: "meter-supply",
        positiveRef,
        negativeRef,
        positiveVolts,
        negativeVolts,
        value: Math.round((positiveVolts - negativeVolts) * 1000) / 1000,
      }),
    ])
    expect(diagnose(measured.state).instrumentReadings).toEqual(
      measured.instrument?.readings,
    )

    expect(solved.result.currents.led1).toBeGreaterThan(0)
    const currentMeasured = probe(
      { state: measured.state, operationId: "ai-ammeter-led" },
      {
        probeId: "ammeter-led",
        instrumentId: "ammeter",
        positiveRef: "led1",
        currentRef: "led1",
      },
    )
    expect(currentMeasured.instrument?.ok).toBe(true)
    expect(currentMeasured.instrument?.readings).toEqual([
      expect.objectContaining({
        kind: "current",
        instrumentId: "ammeter",
        probeId: "ammeter-led",
        currentRef: "led1",
        value: solved.result.currents.led1,
      }),
    ])

    const unresolved = probe(
      { state: measured.state, operationId: "ai-probe-floating" },
      {
        probeId: "probe-floating",
        positiveRef: "bb1:z99",
        negativeRef,
      },
    )
    expect(unresolved.instrument?.ok).toBe(false)
    expect(unresolved.instrument?.readings).toEqual([])
    expect(diagnose(unresolved.state).instrumentDiagnostics.at(-1)).toMatchObject({
      code: "instrument-reading-unresolved",
      severity: "blocker",
    })

    const unsupportedProvider = probe(
      {
        state: measured.state,
        operationId: "ai-probe-fastapi",
        targetProvider: "fastapi",
      },
      {
        probeId: "probe-fastapi",
        positiveRef,
        negativeRef,
      },
    )
    expect(unsupportedProvider.instrument?.ok).toBe(false)
    expect(unsupportedProvider.instrument?.readings).toEqual([])
    expect(unsupportedProvider.instrument?.diagnostics[0]).toMatchObject({
      code: "instrument-provider-unsupported",
      providerId: "fastapi",
    })
  })

  it("scopes runtime execution without claiming Nano R4 AVR parity", () => {
    const loaded = loadExperiment({
      instanceId: "ai-runtime-scope",
      scene: createReferenceSimulationScene(),
    })

    const nanoR4 = runRuntime(
      {
        state: loaded,
        operationId: "ai-run-nano-r4",
        providerMode: "run",
      },
      {
        boardId: "arduino-nano-r4-renesas-ra4m1",
        sketchRef: "sketches/nano-r4.hex",
      },
    )

    expect(nanoR4.report).toEqual({ ok: true, issues: [] })
    expect(nanoR4.runtimeScope).toMatchObject({
      ok: false,
      canRun: false,
      boardId: "arduino-nano-r4-renesas-ra4m1",
      engineId: "renesas-ra4m1-runtime-unavailable",
    })
    expect(nanoR4.runtimeScope?.diagnostics).toEqual([
      expect.objectContaining({
        code: "runtime-board-unsupported",
        reason: "Nano R4 uses Renesas RA4M1; ATmega328p runtime cannot emulate it",
      }),
    ])
    expect(diagnose(nanoR4.state).runtimeScopeDiagnostics).toEqual(
      nanoR4.runtimeScope?.diagnostics,
    )
    expect(nanoR4.state.lastSolverResult?.providerDiagnostics).toEqual([
      {
        code: "provider-mode-unsupported",
        severity: "blocker",
        message: "local provider supports static solving only; runtime run mode requires a runtime provider",
      },
    ])

    const atmega = runRuntime(
      {
        state: nanoR4.state,
        operationId: "ai-run-uno",
        providerMode: "run",
      },
      {
        boardId: "arduino-uno-atmega328p",
      },
    )

    expect(atmega.runtimeScope?.ok).toBe(false)
    expect(atmega.runtimeScope?.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "runtime-scope-atmega328p",
      "runtime-provider-unwired",
    ])
    expect(atmega.runtimeScope?.diagnostics[0]).toMatchObject({
      severity: "info",
      reason: "ATmega328p runtime scope only; not a Nano R4/Renesas RA4M1 runtime",
    })
  })

  it("routes advanced run instruments through provider-bound AI operations", () => {
    const loaded = loadExperiment({
      instanceId: "ai-run-instrument",
      scene: createReferenceSimulationScene(),
    })

    const serialMonitor = runInstrument(
      {
        state: loaded,
        operationId: "ai-run-serial-monitor",
        providerMode: "run",
      },
      {
        instrumentId: "serial-monitor",
        boardId: "arduino-uno-atmega328p",
        sketchRef: "sketches/blink.hex",
      },
    )

    expect(serialMonitor.report).toEqual({ ok: true, issues: [] })
    expect(serialMonitor.instrument?.ok).toBe(false)
    expect(serialMonitor.instrument?.diagnostics[0]).toMatchObject({
      code: "instrument-provider-unsupported",
      providerId: "local",
      providerMode: "run",
      physics: "runtime-microcontroller",
      message: "serial-monitor requires run runtime-microcontroller provider support",
    })
    expect(diagnose(serialMonitor.state).instrumentDiagnostics).toEqual(
      serialMonitor.instrument?.diagnostics,
    )
    expect(serialMonitor.state.appliedOperations.at(-1)).toMatchObject({
      id: "ai-run-serial-monitor",
      operation: {
        kind: "run",
        instrumentId: "serial-monitor",
        boardId: "arduino-uno-atmega328p",
      },
    })
  })

  it("fails closed when AI placement collides or targets an impossible pin", () => {
    const loaded = loadExperiment({
      instanceId: "ai-placement-invalid",
      scene: {
        components: [{ id: "bb1", type: "breadboard-half" }],
        connections: [],
        pinAssignments: {},
        layout: { bb1: { x: 0, y: 0 } },
      },
    })

    const collision = addComponent(
      { state: loaded, operationId: "ai-add-colliding-led" },
      {
        id: "led1",
        type: "led",
        color: "red",
        pose: { x: 120, y: 30 },
        pins: [{ id: "anode" }, { id: "cathode" }],
        pinAssignments: {
          "led1:anode": "bb1:j4",
          "led1:cathode": "bb1:j4",
        },
      },
    )

    expect(collision.report).toEqual({ ok: true, issues: [] })
    expect(collision.placement?.ok).toBe(false)
    expect(collision.state.scene.components?.map((component) => component.id)).toEqual(["bb1"])
    expect(collision.state.appliedOperations.map((operation) => operation.id)).toEqual([])
    expect(diagnose(collision.state).placementDiagnostics).toContain(
      "occupancy conflict at bb1:j4: led1:anode, led1:cathode",
    )

    const impossiblePin = addComponent(
      { state: loaded, operationId: "ai-add-impossible-resistor" },
      {
        id: "r1",
        type: "resistor",
        pose: { x: 80, y: 30 },
        pins: [{ id: "pin1" }, { id: "pin2" }],
        pinAssignments: {
          "r1:pin3": "bb1:j8",
        },
      },
    )

    expect(impossiblePin.placement?.ok).toBe(false)
    expect(impossiblePin.state.scene.components?.map((component) => component.id)).toEqual(["bb1"])
    expect(diagnose(impossiblePin.state).placementDiagnostics).toEqual(
      expect.arrayContaining([
        "unknown-pin-name: r1:pin3",
        "unknown pin r1:pin3 for type resistor at pinAssignments r1:pin3",
      ]),
    )
  })

  it("edits wire waypoints and endpoints through the runtime placement pipeline", () => {
    const loaded = loadExperiment({
      instanceId: "ai-wire-editor",
      scene: {
        components: [
          { id: "bb1", type: "breadboard-half" },
          {
            id: "led1",
            type: "led",
            color: "red",
            pins: [{ id: "anode" }, { id: "cathode" }],
          },
        ],
        connections: [
          {
            id: "wire-tie",
            from: "bb1:j7",
            to: "bb1:f7",
            color: "green",
            path: {
              kind: "polyline",
              points: [
                { x: 17.75, y: 33.75 },
                { x: 30, y: 30 },
                { x: 17.75, y: 63.75 },
              ],
            },
          },
          {
            id: "wire-led-ground",
            from: "led1:cathode",
            to: "bb1:bus-bot-minus-5",
            color: "black",
          },
        ],
        pinAssignments: {
          "led1:anode": "bb1:j4",
          "led1:cathode": "bb1:a6",
        },
        layout: {
          bb1: { x: 0, y: 0 },
          led1: { x: 120, y: 80 },
        },
      },
    })

    const moved = moveWireWaypoint(
      { state: loaded, operationId: "ai-move-wire-waypoint" },
      {
        wireId: "wire-tie",
        pointIndex: 1,
        point: { x: 48, y: 20 },
      },
    )

    expect(moved.report).toEqual({ ok: true, issues: [] })
    expect(moved.placement?.ok).toBe(true)
    expect(moved.state.scene.connections?.find((wire) => wire.id === "wire-tie")?.path?.points).toEqual([
      { x: 17.75, y: 33.75 },
      { x: 48, y: 20 },
      { x: 17.75, y: 63.75 },
    ])
    expect(compareToTarget(moved.state, loaded.scene)).toEqual({
      ok: true,
      missingComponents: [],
      extraComponents: [],
      missingConnections: [],
      extraConnections: [],
      pinMismatches: [],
    })

    const splitPath = replaceWirePath(
      { state: moved.state, operationId: "ai-replace-wire-path" },
      {
        wireId: "wire-tie",
        path: {
          kind: "polyline",
          points: [
            { x: 17.75, y: 33.75 },
            { x: 48, y: 20 },
            { x: 70, y: 42 },
            { x: 17.75, y: 63.75 },
          ],
        },
      },
    )

    expect(splitPath.report).toEqual({ ok: true, issues: [] })
    expect(splitPath.placement?.ok).toBe(true)
    expect(splitPath.state.scene.connections?.find((wire) => wire.id === "wire-tie")?.path?.points).toEqual([
      { x: 17.75, y: 33.75 },
      { x: 48, y: 20 },
      { x: 70, y: 42 },
      { x: 17.75, y: 63.75 },
    ])

    const retargeted = retargetWireEndpoint(
      { state: splitPath.state, operationId: "ai-retarget-wire-endpoint" },
      {
        wireId: "wire-tie",
        side: "to",
        endpoint: "bb1:bus-top-plus-2",
      },
    )

    expect(retargeted.placement?.ok).toBe(true)
    expect(retargeted.state.scene.connections?.find((wire) => wire.id === "wire-tie")).toMatchObject({
      from: "bb1:j7",
      to: "bb1:bus-top-plus-2",
      color: "green",
    })
    expect(compareToTarget(retargeted.state, moved.state.scene)).toMatchObject({
      ok: false,
      missingConnections: ["bb1:j7->bb1:f7:green"],
      extraConnections: ["bb1:j7->bb1:bus-top-plus-2:green"],
    })

    const rejected = retargetWireEndpoint(
      { state: retargeted.state, operationId: "ai-retarget-wire-invalid" },
      {
        wireId: "wire-tie",
        side: "to",
        endpoint: "bb1:z99",
      },
    )

    expect(rejected.placement?.ok).toBe(false)
    expect(rejected.state.scene.connections?.find((wire) => wire.id === "wire-tie")?.to).toBe(
      "bb1:bus-top-plus-2",
    )
    expect(rejected.state.appliedOperations.map((operation) => operation.id)).not.toContain(
      "ai-retarget-wire-invalid",
    )
    expect(diagnose(rejected.state).placementDiagnostics).toContain(
      "invalid-wire-endpoint: wire-tie to bb1:z99",
    )
  })

  it("documents the AI API version without exposing DOM mutation authority", () => {
    expect(SIMULATION_AI_API_VERSION).toBe("simulation-ai-api/1")
  })
})
