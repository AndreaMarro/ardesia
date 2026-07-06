// @vitest-environment node
//
// P0-D authoring — lint automatico manifest+entry PRIMA di firmare/spedire.
// Non è un gate di sicurezza E oggi non c'è enforcement runtime dietro i flag
// rete/risorse (srcDoc senza CSP): il lint verifica la POLICY DICHIARATA;
// l'enforcement vero è ADR-0001 (PROPOSED, gate Andrea). Vocabolario flag
// chiuso e falsificabile.

import { describe, expect, it } from "vitest"
import { lintAuthoring } from "../toolhost/authoring/authoringLint.ts"
import { generateDevKeypair, scaffoldPlugin } from "../toolhost/authoring/scaffoldPlugin.ts"

const keysPromise = generateDevKeypair()

async function scaffolded(spec: Parameters<typeof scaffoldPlugin>[0]) {
  return scaffoldPlugin(spec, await keysPromise)
}

describe("lintAuthoring", () => {
  it("output dello scaffolder di default: pulito (nessun flag)", async () => {
    const out = await scaffolded({ id: "io.test.lint-clean", name: "Lint Clean" })
    const report = lintAuthoring(out.manifest, out.entryHtml)
    expect(report.ok).toBe(true)
    expect(report.flags).toEqual([])
  })

  it("onestà dichiarativa: i flag rete/risorse citano la policy e ADR-0001, mai un blocco CSP inesistente", async () => {
    // Oggi l'iframe ToolLab è srcDoc allow-same-origin SENZA CSP: nessun
    // blocco attivo esiste. Il lint deve dire "contro la policy dichiarata,
    // enforcement = ADR-0001", non fingere una CSP che blocca.
    const out = await scaffolded({ id: "io.test.lint-honesty", name: "Honesty" })
    const entry = out.entryHtml
      .replace("<script>", '<script src="https://cdn.example.com/lib.js"></script>\n<script>')
      .replace("</body>", '<img src="http://tracker.example.com/pixel.png"></body>')
      .replace("</script>", ';fetch("https://x.example.com").catch(function(){});</script>')
    const report = lintAuthoring(out.manifest, entry)
    const declarative = report.flags.filter((flag) =>
      ["entry-external-script", "entry-external-resource", "net-fetch-undeclared"].includes(flag.code),
    )
    expect(declarative.length).toBeGreaterThanOrEqual(3)
    for (const flag of declarative) {
      expect(flag.detail).toContain("ADR-0001")
      expect(flag.detail).not.toMatch(/bloccherà|CSP chiusa|fallirà/)
    }
  })

  it("script esterno nell'entry → entry-external-script (contro la policy dichiarata)", async () => {
    const out = await scaffolded({ id: "io.test.lint-extscript", name: "Ext Script" })
    const entry = out.entryHtml.replace(
      "<script>",
      '<script src="https://cdn.example.com/lib.js"></script>\n<script>',
    )
    const report = lintAuthoring(out.manifest, entry)
    expect(report.ok).toBe(false)
    expect(report.flags).toContainEqual({
      code: "entry-external-script",
      severity: "error",
      detail: expect.stringContaining("cdn.example.com") as unknown as string,
    })
  })

  it("risorsa esterna (img/link http) → entry-external-resource", async () => {
    const out = await scaffolded({ id: "io.test.lint-extres", name: "Ext Res" })
    const entry = out.entryHtml.replace(
      "</body>",
      '<img src="http://tracker.example.com/pixel.png"></body>',
    )
    const report = lintAuthoring(out.manifest, entry)
    // warn: segnala senza abbattere ok (solo error blocca)
    expect(report.ok).toBe(true)
    expect(report.flags.some((f) => f.code === "entry-external-resource" && f.severity === "warn")).toBe(true)
  })

  it("fetch( nell'entry senza capability net.fetch → net-fetch-undeclared (deny-by-default)", async () => {
    const out = await scaffolded({ id: "io.test.lint-fetch", name: "Fetch NoCap" })
    const entry = out.entryHtml.replace(
      "</script>",
      ';fetch("api/data").catch(function(){});</script>',
    )
    const report = lintAuthoring(out.manifest, entry)
    // warn: segnala senza abbattere ok (solo error blocca)
    expect(report.ok).toBe(true)
    expect(report.flags.some((f) => f.code === "net-fetch-undeclared" && f.severity === "warn")).toBe(true)
  })

  it("fetch( CON net.fetch dichiarata: nessun net-fetch-undeclared", async () => {
    const out = await scaffolded({
      id: "io.test.lint-fetch-ok",
      name: "Fetch Cap",
      capabilities: { "net.fetch": { domains: ["api.example.com"] } },
    })
    const entry = out.entryHtml.replace(
      "</script>",
      ';fetch("api/data").catch(function(){});</script>',
    )
    const report = lintAuthoring(out.manifest, entry)
    expect(report.flags.some((f) => f.code === "net-fetch-undeclared")).toBe(false)
  })

  it("surface board-embed senza board.read/board.write → board-caps-missing (info)", async () => {
    const out = await scaffolded({
      id: "io.test.lint-board",
      name: "Board NoCaps",
      surfaces: ["board-embed"],
    })
    const report = lintAuthoring(out.manifest, out.entryHtml)
    const flag = report.flags.find((f) => f.code === "board-caps-missing")
    expect(flag?.severity).toBe("info")
    // info non abbatte ok: solo error lo fa
    expect(report.ok).toBe(true)
  })

  it("ok = false SOLO con severity error (warn/info non bloccano)", async () => {
    const out = await scaffolded({ id: "io.test.lint-sev", name: "Sev" })
    const entryWarnOnly = out.entryHtml.replace(
      "</script>",
      ';fetch("x").catch(function(){});</script>',
    )
    const report = lintAuthoring(out.manifest, entryWarnOnly)
    expect(report.flags.every((f) => f.severity !== "error")).toBe(true)
    expect(report.ok).toBe(true)
  })
})
