import { z } from "zod"

// TOOLHOST-SPEC-v0 §2: vocabolario CHIUSO, deny-by-default. Capability fs/shell/Node
// NON ESISTONO nel protocollo: non concedibili nemmeno per bug.
const domainRe = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/

export const CapabilitiesSchema = z.strictObject({
  "board.read": z.strictObject({}).optional(),
  "board.write": z.strictObject({ scope: z.literal("own-embeds") }).optional(),
  "graph.query": z.strictObject({}).optional(),
  "graph.proposeClaims": z.strictObject({}).optional(),
  "lesson.event.emit": z.strictObject({}).optional(),
  "simulation.scene.read": z.strictObject({}).optional(),
  "simulation.command": z.strictObject({}).optional(),
  "simulation.diagnostics": z.strictObject({}).optional(),
  "simulation.events": z.strictObject({}).optional(),
  "arduino.project": z.strictObject({}).optional(),
  "arduino.board.catalog": z.strictObject({}).optional(),
  "arduino.compile": z.strictObject({
    providers: z.array(z.enum(["browser-avr", "local-agent", "remote"])).min(1),
  }).optional(),
  "arduino.upload": z.strictObject({ requiresHumanConfirm: z.literal(true) }).optional(),
  "arduino.serial": z.strictObject({}).optional(),
  storage: z.strictObject({ quotaMB: z.number().int().min(1).max(1024) }).optional(),
  "llm.generate": z.strictObject({ maxTokensPerCall: z.number().int().min(1).max(200_000) }).optional(),
  "net.fetch": z.strictObject({ domains: z.array(z.string().regex(domainRe)).min(1) }).optional(),
  ui: z.strictObject({}).optional(),
})

export type Capabilities = z.infer<typeof CapabilitiesSchema>
export type CapabilityName = keyof Capabilities

export function isGranted(caps: Capabilities, cap: CapabilityName): boolean {
  return caps[cap] !== undefined
}
