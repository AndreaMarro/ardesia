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
  // Famiglia `service.*`: NON è una facoltà del Core (board/graph/lesson/storage/ui),
  // è l'uso host-mediato del servizio di un ALTRO modulo. Serve a comporre — un Pack
  // disciplinare (ELABTutor) usa il Simulation Plugin senza importarne il codice.
  // Il nome dichiara la famiglia: il secondo servizio sarà additivo, non una riscrittura.
  // `apiVersion` è pinnata a manifest: un tool non può scoprire a runtime un contratto
  // diverso da quello per cui è stato revisionato.
  "service.simulation": z.strictObject({ apiVersion: z.literal("simulation-runtime/1") }).optional(),
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
