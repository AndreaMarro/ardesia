// Il gate locale documentato (`npm run verify` → bin/monorepo.sh verify-core →
// `npm --prefix apps/studio test`) e il gate che decide il merge (job "studio"
// di .github/workflows/ci.yml) devono eseguire lo STESSO runner. Fino ad
// ad8f0f9f divergevano: la CI inlineava `npx vitest run --pool=threads
// --maxWorkers=1 --testTimeout=30000 …`, il locale girava con i default
// (pool forks, testTimeout 15s). Un gate locale che non è il gate di merge
// lascia passare in locale ciò che la CI boccia, e viceversa.
//
// Sorgente unica: apps/studio/vitest.config.ts. La CI chiama `npm test`.

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const workflow = readFileSync(join(process.cwd(), "../..", ".github/workflows/ci.yml"), "utf8")
const vitestConfig = readFileSync(join(process.cwd(), "vitest.config.ts"), "utf8")

describe("parità del profilo tra gate locale e gate di merge", () => {
  it("la CI non reinlinea le opzioni del runner: chiama npm test", () => {
    expect(workflow).not.toContain("npx vitest run")
    expect(workflow).toContain("run: npm test")
  })

  it("il profilo deterministico vive in vitest.config.ts, non nel workflow", () => {
    expect(vitestConfig).toContain('pool: "threads"')
    expect(vitestConfig).toContain("maxWorkers: 1")
    expect(vitestConfig).toContain("fileParallelism: false")
    expect(vitestConfig).toContain("testTimeout: 30000")
    expect(vitestConfig).toContain("hookTimeout: 30000")
    expect(vitestConfig).toContain("teardownTimeout: 30000")
  })
})
