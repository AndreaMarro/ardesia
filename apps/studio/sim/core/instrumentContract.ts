import {
  providerCapabilityProfile,
  providerStatus,
  type ProviderId,
  type ProviderMode,
  type ProviderPhysics,
  type SolverResult,
} from "../providers/simulationProviders"

export type SimulationInstrumentId =
  | "ammeter"
  | "voltmeter"
  | "probe"
  | "logic-probe"
  | "oscilloscope"
  | "serial-monitor"
  | "serial-plotter"
  | "spice-transient"
  | "custom-chip"

export type SimulationInstrumentOperationKind = "probe" | "run"

export type SimulationInstrumentReadingPolicy = "provider-result-only"

export type SimulationInstrumentCapability = {
  id: SimulationInstrumentId
  label: string
  operationKind: SimulationInstrumentOperationKind
  providerMode: ProviderMode
  physics: ProviderPhysics
  readingPolicy: SimulationInstrumentReadingPolicy
  requiredProvider?: ProviderId
}

export type SimulationInstrumentDiagnostic = {
  code:
    | "instrument-provider-bound"
    | "instrument-provider-unsupported"
    | "instrument-reading-available"
    | "instrument-reading-unresolved"
  severity: "info" | "blocker"
  providerId: ProviderId
  providerMode: ProviderMode
  physics: ProviderPhysics
  reason: string
  message: string
}

export type SimulationInstrumentCapabilityInput = {
  instrumentId: SimulationInstrumentId
  providerId: ProviderId
  providerMode: ProviderMode
}

export type SimulationInstrumentCapabilityResult = {
  ok: boolean
  providerBound: boolean
  capability: SimulationInstrumentCapability
  diagnostics: SimulationInstrumentDiagnostic[]
  readings: SimulationInstrumentReading[]
}

export type SimulationProbeInstrumentId = Extract<
  SimulationInstrumentId,
  "ammeter" | "logic-probe" | "probe" | "voltmeter"
>

export type SimulationRunInstrumentId = Extract<
  SimulationInstrumentId,
  "custom-chip" | "oscilloscope" | "serial-monitor" | "serial-plotter" | "spice-transient"
>

export type SimulationInstrumentReading =
  | {
      kind: "voltage"
      instrumentId: Extract<SimulationProbeInstrumentId, "probe" | "voltmeter">
      probeId: string
      providerId: ProviderId
      providerMode: ProviderMode
      unit: "V"
      positiveRef: string
      negativeRef: string
      positiveVolts: number
      negativeVolts: number
      value: number
    }
  | {
      kind: "current"
      instrumentId: Extract<SimulationProbeInstrumentId, "ammeter">
      probeId: string
      providerId: ProviderId
      providerMode: ProviderMode
      unit: "A"
      currentRef: string
      value: number
    }

export type SimulationInstrumentReadingInput = {
  instrumentId: SimulationProbeInstrumentId
  providerId: ProviderId
  providerMode: ProviderMode
  probeId: string
  positiveRef: string
  negativeRef?: string
  currentRef?: string
  solverResult: SolverResult
}

export type SimulationInstrumentReadingResult = SimulationInstrumentCapabilityResult

const SIMULATION_INSTRUMENT_CAPABILITIES: SimulationInstrumentCapability[] = [
  {
    id: "ammeter",
    label: "Ammeter",
    operationKind: "probe",
    providerMode: "static",
    physics: "static-dc-circuit",
    readingPolicy: "provider-result-only",
  },
  {
    id: "voltmeter",
    label: "Voltmeter",
    operationKind: "probe",
    providerMode: "static",
    physics: "static-dc-circuit",
    readingPolicy: "provider-result-only",
  },
  {
    id: "probe",
    label: "Probe",
    operationKind: "probe",
    providerMode: "static",
    physics: "static-dc-circuit",
    readingPolicy: "provider-result-only",
  },
  {
    id: "logic-probe",
    label: "Logic probe",
    operationKind: "probe",
    providerMode: "run",
    physics: "runtime-microcontroller",
    readingPolicy: "provider-result-only",
  },
  {
    id: "oscilloscope",
    label: "Oscilloscope",
    operationKind: "run",
    providerMode: "run",
    physics: "spice-analog-transient",
    readingPolicy: "provider-result-only",
    requiredProvider: "ngspice-wasm",
  },
  {
    id: "serial-monitor",
    label: "Serial monitor",
    operationKind: "run",
    providerMode: "run",
    physics: "runtime-microcontroller",
    readingPolicy: "provider-result-only",
  },
  {
    id: "serial-plotter",
    label: "Serial plotter",
    operationKind: "run",
    providerMode: "run",
    physics: "runtime-microcontroller",
    readingPolicy: "provider-result-only",
  },
  {
    id: "spice-transient",
    label: "SPICE transient",
    operationKind: "run",
    providerMode: "run",
    physics: "spice-analog-transient",
    readingPolicy: "provider-result-only",
    requiredProvider: "ngspice-wasm",
  },
  {
    id: "custom-chip",
    label: "Custom chip",
    operationKind: "run",
    providerMode: "run",
    physics: "custom-chip-wasm",
    readingPolicy: "provider-result-only",
  },
]

export function simulationInstrumentCapabilities(): SimulationInstrumentCapability[] {
  return SIMULATION_INSTRUMENT_CAPABILITIES.map((capability) => ({ ...capability }))
}

export function evaluateSimulationInstrumentCapability(
  input: SimulationInstrumentCapabilityInput,
): SimulationInstrumentCapabilityResult {
  const capability = requireInstrumentCapability(input.instrumentId)
  const status = providerStatus(input.providerId)
  const profile = providerCapabilityProfile(input.providerId)
  const providerMatches =
    capability.requiredProvider === undefined || capability.requiredProvider === input.providerId
  const supportsRequestedMode =
    input.providerMode === capability.providerMode &&
    profile.supportedModes.includes(capability.providerMode)
  const supportsPhysics =
    profile.targetPhysics.includes(capability.physics) &&
    !profile.unsupportedPhysics.includes(capability.physics)
  const ok = providerMatches && status.available && supportsRequestedMode && supportsPhysics
  const diagnostic = ok
    ? providerBoundDiagnostic(capability, input.providerId)
    : providerBlockedDiagnostic(
        capability,
        input.providerId,
        input.providerMode,
        blockReason(input.providerId, status.available ? null : status.reason),
      )

  return {
    ok,
    providerBound: true,
    capability: { ...capability },
    diagnostics: [diagnostic],
    readings: [],
  }
}

export function evaluateSimulationInstrumentReading(
  input: SimulationInstrumentReadingInput,
): SimulationInstrumentReadingResult {
  const capabilityResult = evaluateSimulationInstrumentCapability(input)
  if (!capabilityResult.ok) return capabilityResult

  const unresolvedReason = unresolvedReadingReason(input)
  if (unresolvedReason !== null) {
    return {
      ...capabilityResult,
      ok: false,
      diagnostics: [
        ...capabilityResult.diagnostics,
        readingUnresolvedDiagnostic(input, capabilityResult.capability, unresolvedReason),
      ],
    }
  }

  if (input.instrumentId === "ammeter") {
    const currentRef = input.currentRef ?? input.positiveRef
    const current = currentFor(input.solverResult, currentRef)
    if (current === null) {
      return {
        ...capabilityResult,
        ok: false,
        diagnostics: [
          ...capabilityResult.diagnostics,
          readingUnresolvedDiagnostic(
            input,
            capabilityResult.capability,
            `provider result does not include current for ${currentRef}`,
          ),
        ],
      }
    }

    const reading: SimulationInstrumentReading = {
      kind: "current",
      instrumentId: "ammeter",
      probeId: input.probeId,
      providerId: input.providerId,
      providerMode: input.providerMode,
      unit: "A",
      currentRef,
      value: roundCurrent(current),
    }

    return {
      ...capabilityResult,
      diagnostics: [
        ...capabilityResult.diagnostics,
        readingAvailableDiagnostic(input, capabilityResult.capability, reading),
      ],
      readings: [reading],
    }
  }

  if (input.instrumentId === "logic-probe") {
    return {
      ...capabilityResult,
      ok: false,
      diagnostics: [
        ...capabilityResult.diagnostics,
        readingUnresolvedDiagnostic(
          input,
          capabilityResult.capability,
          "logic probe readings require a runtime provider trace, not static voltage inference",
        ),
      ],
    }
  }

  const negativeRef = input.negativeRef
  if (negativeRef === undefined) {
    return {
      ...capabilityResult,
      ok: false,
      diagnostics: [
        ...capabilityResult.diagnostics,
        readingUnresolvedDiagnostic(
          input,
          capabilityResult.capability,
          "negativeRef is required for provider-derived differential voltage",
        ),
      ],
    }
  }

  const positiveVolts = voltageFor(input.solverResult, input.positiveRef)
  const negativeVolts = voltageFor(input.solverResult, negativeRef)
  if (positiveVolts === null || negativeVolts === null) {
    return {
      ...capabilityResult,
      ok: false,
      diagnostics: [
        ...capabilityResult.diagnostics,
        readingUnresolvedDiagnostic(
          input,
          capabilityResult.capability,
          missingVoltageReason(input, positiveVolts, negativeVolts),
        ),
      ],
    }
  }

  const reading: SimulationInstrumentReading = {
    kind: "voltage",
    instrumentId: input.instrumentId,
    probeId: input.probeId,
    providerId: input.providerId,
    providerMode: input.providerMode,
    unit: "V",
    positiveRef: input.positiveRef,
    negativeRef,
    positiveVolts,
    negativeVolts,
    value: roundVolts(positiveVolts - negativeVolts),
  }

  return {
    ...capabilityResult,
    diagnostics: [
      ...capabilityResult.diagnostics,
      readingAvailableDiagnostic(input, capabilityResult.capability, reading),
    ],
    readings: [reading],
  }
}

function requireInstrumentCapability(
  instrumentId: SimulationInstrumentId,
): SimulationInstrumentCapability {
  const capability = SIMULATION_INSTRUMENT_CAPABILITIES.find(
    (candidate) => candidate.id === instrumentId,
  )
  if (capability === undefined) {
    throw new Error(`unknown instrument capability: ${instrumentId}`)
  }
  return capability
}

function providerBoundDiagnostic(
  capability: SimulationInstrumentCapability,
  providerId: ProviderId,
): SimulationInstrumentDiagnostic {
  return {
    code: "instrument-provider-bound",
    severity: "info",
    providerId,
    providerMode: capability.providerMode,
    physics: capability.physics,
    reason: "instrument readings must be derived from provider result data",
    message: `${capability.id} is bound to ${providerId} ${capability.providerMode} ${capability.physics} provider result`,
  }
}

function providerBlockedDiagnostic(
  capability: SimulationInstrumentCapability,
  providerId: ProviderId,
  requestedMode: ProviderMode,
  reason: string,
): SimulationInstrumentDiagnostic {
  return {
    code: "instrument-provider-unsupported",
    severity: "blocker",
    providerId,
    providerMode: requestedMode,
    physics: capability.physics,
    reason,
    message: `${capability.id} requires ${capability.providerMode} ${capability.physics} provider support`,
  }
}

function readingAvailableDiagnostic(
  input: SimulationInstrumentReadingInput,
  capability: SimulationInstrumentCapability,
  reading: SimulationInstrumentReading,
): SimulationInstrumentDiagnostic {
  const readingSummary =
    reading.kind === "current"
      ? `${input.probeId} reads ${reading.value} A through ${reading.currentRef}`
      : `${input.probeId} reads ${reading.value} V between ${reading.positiveRef} and ${reading.negativeRef}`
  return {
    code: "instrument-reading-available",
    severity: "info",
    providerId: input.providerId,
    providerMode: input.providerMode,
    physics: capability.physics,
    reason: `instrument reading derived from provider ${reading.kind} result`,
    message: readingSummary,
  }
}

function readingUnresolvedDiagnostic(
  input: SimulationInstrumentReadingInput,
  capability: SimulationInstrumentCapability,
  reason: string,
): SimulationInstrumentDiagnostic {
  const resultKind =
    input.instrumentId === "ammeter"
      ? "current"
      : input.instrumentId === "logic-probe"
        ? "runtime trace"
        : "voltage"
  return {
    code: "instrument-reading-unresolved",
    severity: "blocker",
    providerId: input.providerId,
    providerMode: input.providerMode,
    physics: capability.physics,
    reason,
    message: `${input.probeId} cannot read ${input.positiveRef}${
      input.negativeRef === undefined ? "" : ` to ${input.negativeRef}`
    } from provider ${resultKind} result`,
  }
}

function unresolvedReadingReason(input: SimulationInstrumentReadingInput): string | null {
  if (input.solverResult.provider !== input.providerId) {
    return `provider result belongs to ${input.solverResult.provider}, not ${input.providerId}`
  }
  if (!input.solverResult.ok) {
    return "provider result did not solve successfully"
  }
  return null
}

function missingVoltageReason(
  input: SimulationInstrumentReadingInput,
  positiveVolts: number | null,
  negativeVolts: number | null,
): string {
  if (positiveVolts === null && negativeVolts === null) {
    return `provider result does not include voltages for ${input.positiveRef} or ${input.negativeRef}`
  }
  if (positiveVolts === null) {
    return `provider result does not include voltage for ${input.positiveRef}`
  }
  return `provider result does not include voltage for ${input.negativeRef}`
}

function voltageFor(result: SolverResult, ref: string | undefined): number | null {
  if (ref === undefined) return null
  const voltage = result.voltages[ref]
  if (typeof voltage === "number" && Number.isFinite(voltage)) return voltage
  return null
}

function currentFor(result: SolverResult, ref: string | undefined): number | null {
  if (ref === undefined) return null
  const current = result.currents[ref]
  if (typeof current === "number" && Number.isFinite(current)) return current
  return null
}

function roundVolts(value: number): number {
  return Math.round(value * 1000) / 1000
}

function roundCurrent(value: number): number {
  return Math.round(value * 10000) / 10000
}

function blockReason(providerId: ProviderId, unavailableReason: string | null): string {
  if (unavailableReason !== null) return normalizeProviderReason(providerId, unavailableReason)
  if (providerId === "local") {
    return "local provider supports static mode and static-dc-circuit physics only"
  }
  return `${providerId} provider does not expose the required instrument capability`
}

function normalizeProviderReason(providerId: ProviderId, reason: string): string {
  if (providerId === "fastapi") return reason.replace(/^FastAPI/, "fastapi")
  return reason
}
