// @vitest-environment jsdom
// Student Pack come ARTEFATTO (NOTTE-13): "Esporta" produce un FILE JSON
// versionato e re-importabile — round-trip chiuso, parse fail-closed, zero
// PII (solo id, etichette didattiche ed evidenze del libro).

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { InMemoryEventLog, type AppendedEvent, type LessonOsEvent } from "../lessonos/eventlog"
import TeacherDashboardView from "../design/TeacherDashboardView"
import {
  STUDENT_PACK_FORMAT,
  buildStudentPackArtifact,
  parseStudentPackArtifact,
  studentPackFileName,
} from "../lessonos/studentPackArtifact"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

const CANDIDATE = {
  candidateId: "sp-error:corto-1",
  errorId: "error:corto-1",
  fromRoom: "3b-elab",
  label: { it: "Corto circuito sulla riga i", en: "Short circuit on row i" },
  evidenceRefs: ["board:wire9", "manual:vol1:p29"],
}

describe("studentPackArtifact — build/parse round-trip puro", () => {
  it("build → serialize → parse restituisce lo stesso pack (round-trip)", () => {
    const artifact = buildStudentPackArtifact(CANDIDATE, { now: 12345 })
    expect(artifact.format).toBe(STUDENT_PACK_FORMAT)
    expect(artifact.exportedAt).toBe(12345)
    const parsed = parseStudentPackArtifact(JSON.stringify(artifact))
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.artifact.packs[0]?.candidateId).toBe("sp-error:corto-1")
      expect(parsed.artifact.packs[0]?.evidence).toEqual(["board:wire9", "manual:vol1:p29"])
    }
  })

  it("FALSIFICA: JSON rotto, formato sconosciuto e schema violato = errore dichiarato", () => {
    expect(parseStudentPackArtifact("{non-json").ok).toBe(false)
    expect(
      parseStudentPackArtifact(JSON.stringify({ format: "altro/1", exportedAt: 1, packs: [] })).ok,
    ).toBe(false)
    const noPacks = parseStudentPackArtifact(
      JSON.stringify({ format: STUDENT_PACK_FORMAT, exportedAt: 1, packs: [] }),
    )
    expect(noPacks.ok).toBe(false)
    if (!noPacks.ok) expect(noPacks.error).toContain(STUDENT_PACK_FORMAT)
  })

  it("il filename è sanificato e riproducibile", () => {
    expect(studentPackFileName("sp-error:corto-1", 99)).toBe("studentpack-sp-error_corto-1-99.json")
  })
})

const CANDIDATE_EVENTS: LessonOsEvent[] = [
  { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
  {
    kind: "error.observed",
    errorId: "error:corto-1",
    conceptId: "ohm_law",
    labels: { it: "Corto circuito sulla riga i" },
    t: 1500,
    evidence: ["board:wire9", "manual:vol1:p29"],
  },
  { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
]

async function mountDashboard() {
  const log = new InMemoryEventLog()
  for (const ev of CANDIDATE_EVENTS) await log.append(ev)
  const deps = {
    loadEvents: (): Promise<readonly AppendedEvent[]> => log.readAll(),
    appendEvent: async (event: LessonOsEvent) => {
      await log.append(event)
    },
    eventLog: { readAll: () => log.readAll() },
  }
  const utils = render(<TeacherDashboardView deps={deps} />)
  await waitFor(() => {
    if (utils.container.querySelector("[data-z7-candidate]") === null) {
      throw new Error("coda non montata")
    }
  })
  return utils
}

describe("cruscotto Z7 — export scarica il file, import lo riapre", () => {
  it("Genera → Esporta: parte il download dell'artefatto (blob JSON, filename studentpack-…)", async () => {
    const { container } = await mountDashboard()
    const created: string[] = []
    const clicked: string[] = []
    const realCreate = URL.createObjectURL
    URL.createObjectURL = vi.fn(() => "blob:studentpack-test") as never
    URL.revokeObjectURL = vi.fn() as never
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        created.push(this.href)
        clicked.push(this.download)
      })
    try {
      fireEvent.click(container.querySelector("[data-z7-generate]")!)
      await waitFor(() => {
        if (container.querySelector("[data-z7-export]") === null) throw new Error("non generated")
      })
      fireEvent.click(container.querySelector("[data-z7-export]")!)
      await waitFor(() => {
        if (clicked.length === 0) throw new Error("download non partito")
      })
      expect(clicked[0]).toMatch(/^studentpack-sp-error_corto-1-\d+\.json$/)
      expect(created[0]).toBe("blob:studentpack-test")
    } finally {
      clickSpy.mockRestore()
      URL.createObjectURL = realCreate
    }
  })

  it("import di un pack valido: pannello riaperto con label ed evidenze; invalido: errore visibile", async () => {
    const { container } = await mountDashboard()
    const artifact = buildStudentPackArtifact(CANDIDATE, { now: 777 })
    const file = new File([JSON.stringify(artifact)], "studentpack.json", {
      type: "application/json",
    })
    const input = container.querySelector<HTMLInputElement>("[data-z7-import]")!
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => {
      if (container.querySelector("[data-imported-pack]") === null) {
        throw new Error("pack non riaperto")
      }
    })
    expect(container.textContent).toContain("Corto circuito sulla riga i")
    expect(container.textContent).toContain("manual:vol1:p29")

    const bad = new File(["{rotto"], "x.json", { type: "application/json" })
    fireEvent.change(input, { target: { files: [bad] } })
    await waitFor(() => {
      if (container.querySelector("[data-z7-import-error]") === null) {
        throw new Error("errore import non visibile")
      }
    })
    expect(container.textContent).toContain("Import fallito")
  })
})
