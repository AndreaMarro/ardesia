// @vitest-environment node
//
// ELABTutor Pack data drift guard (slice 3, ELAB-AS-PLUGIN-CANON §2).
// Il Pack porta i dati S1-S3; il plugin li consuma. Questo test sorveglia:
//   S1  packs/elab-tutor/data/lesson-paths/ e' la sede canonica (88 percorsi),
//   S2  volume-references copre ogni lesson-path,
//   S3  la grammatica citazione "Vol.N pag.M" e' unica e condivisa
//       (book_reference.label nei JSON == formatter del Pack).
// La sede vecchia nel plugin non deve riapparire (migrazione senza doppioni).

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const packDataDir = path.join(repoRoot, "packs/elab-tutor/data")
const lessonPathsDir = path.join(packDataDir, "lesson-paths")
const legacyPluginData = path.join(repoRoot, "plugins/elab-tutor/src/data")

type BookReference = { volume: number; page: number; label: string }
type LessonPath = { experiment_id: string; book_reference?: BookReference }

type VolumeCitationModule = {
  VALID_VOLUMES: readonly number[]
  isValidVolumeCitation: (volume: unknown, page: unknown) => boolean
  formatVolumeCitationLabel: (volume: number, page: number) => string
}

type VolumeReferencesModule = {
  default: Record<string, { volume: number; bookPage: number }>
}

function listLessonPathJson(): string[] {
  return fs
    .readdirSync(lessonPathsDir)
    .filter((name) => /^v\d-cap\d+-esp\d+\.json$/.test(name))
    .sort()
}

describe("ELABTutor Pack — dati S1-S3 (sede canonica packs/)", () => {
  it("S1: il Pack contiene gli 88 lesson-path e la sede vecchia nel plugin non esiste piu", () => {
    expect(listLessonPathJson()).toHaveLength(88)
    expect(fs.existsSync(path.join(lessonPathsDir, "index.js"))).toBe(true)
    expect(fs.existsSync(path.join(legacyPluginData, "lesson-paths"))).toBe(false)
    expect(fs.existsSync(path.join(legacyPluginData, "volume-references.js"))).toBe(false)
  })

  it("S2: volume-references copre ogni lesson-path del Pack", async () => {
    const module = (await import(
      path.join(packDataDir, "volume-references.js")
    )) as VolumeReferencesModule
    const references = module.default

    for (const name of listLessonPathJson()) {
      const id = name.replace(/\.json$/, "")
      expect(references[id], `volume-references senza voce per ${id}`).toBeDefined()
      expect(references[id].volume).toBe(Number(id[1]))
    }
  })

  it("S3: book_reference.label dei lesson-path segue la grammatica del Pack", async () => {
    const citation = (await import(
      path.join(packDataDir, "volume-citation.js")
    )) as VolumeCitationModule

    let checked = 0
    for (const name of listLessonPathJson()) {
      const lesson = JSON.parse(
        fs.readFileSync(path.join(lessonPathsDir, name), "utf-8"),
      ) as LessonPath
      const ref = lesson.book_reference
      if (!ref) continue
      expect(
        citation.isValidVolumeCitation(ref.volume, ref.page),
        `${name}: citazione fuori dominio (volume ${ref.volume}, pagina ${ref.page})`,
      ).toBe(true)
      expect(ref.label, `${name}: label fuori grammatica`).toBe(
        citation.formatVolumeCitationLabel(ref.volume, ref.page),
      )
      checked += 1
    }
    expect(checked).toBeGreaterThan(0)
  })

  it("S3: la sostanza VolumeCitation valida solo volumi 1-3 e pagine positive", async () => {
    const citation = (await import(
      path.join(packDataDir, "volume-citation.js")
    )) as VolumeCitationModule

    expect([...citation.VALID_VOLUMES]).toEqual([1, 2, 3])
    expect(citation.isValidVolumeCitation(1, 29)).toBe(true)
    expect(citation.isValidVolumeCitation(3, 1)).toBe(true)
    expect(citation.isValidVolumeCitation(0, 29)).toBe(false)
    expect(citation.isValidVolumeCitation(4, 29)).toBe(false)
    expect(citation.isValidVolumeCitation(1, 0)).toBe(false)
    expect(citation.isValidVolumeCitation(1, -3)).toBe(false)
    expect(citation.isValidVolumeCitation(1, "29")).toBe(false)
    expect(citation.formatVolumeCitationLabel(1, 29)).toBe("Vol.1 pag.29")
  })
})
