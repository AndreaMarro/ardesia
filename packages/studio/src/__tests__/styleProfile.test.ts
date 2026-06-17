// MAESTRO-Studio — PL-1: contratto StyleProfile v1 + loader FAIL-CLOSED.
// Ogni difetto del profilo deve produrre null (tema neutro), MAI un throw.

import { describe, it, expect, vi } from "vitest"
import {
  parseStyleProfile,
  loadStyleProfile,
  MIN_LESSONS_ANALYZED,
  type ProfileSource,
} from "../design/styleProfile"
import { PATHS } from "../store/types"

function validProfile() {
  return {
    v: 1,
    teacher_id: "doc-ts",
    lessons_analyzed: 5,
    exercise_density: 0.7,
    question_density: 0.2,
    registro: 0.9,
    concept_granularity: 0.4,
    prereq_explicitness: 0.5,
    tics: ["diciamo", "un attimino"],
  }
}

describe("PL-1 parseStyleProfile — contratto v1 strict", () => {
  it("accetta un profilo v1 valido e lo restituisce intero", () => {
    const p = parseStyleProfile(validProfile())
    expect(p).not.toBeNull()
    expect(p!.teacher_id).toBe("doc-ts")
    expect(p!.exercise_density).toBe(0.7)
    expect(p!.tics).toEqual(["diciamo", "un attimino"])
  })

  it("FAIL-CLOSED: chiave extra → null (strictObject)", () => {
    expect(parseStyleProfile({ ...validProfile(), sorpresa: true })).toBeNull()
  })

  it("FAIL-CLOSED: chiave mancante → null", () => {
    const senzaRegistro: Record<string, unknown> = { ...validProfile() }
    delete senzaRegistro.registro
    expect(parseStyleProfile(senzaRegistro)).toBeNull()
  })

  it("FAIL-CLOSED: own-property __proto__ da JSON.parse = chiave extra → null", () => {
    const conProto = JSON.parse(
      JSON.stringify(validProfile()).replace(/}$/, ',"__proto__":{"polluted":true}}'),
    )
    expect(parseStyleProfile(conProto)).toBeNull()
  })

  it("FAIL-CLOSED: getter che throwa nell'input → null, MAI throw", () => {
    const ostile = {
      ...validProfile(),
      get registro(): number {
        throw new Error("boom")
      },
    }
    expect(() => parseStyleProfile(ostile)).not.toThrow()
    expect(parseStyleProfile(ostile)).toBeNull()
  })

  it("FAIL-CLOSED: Infinity/-Infinity fuori range → null", () => {
    expect(parseStyleProfile({ ...validProfile(), registro: Infinity })).toBeNull()
    expect(parseStyleProfile({ ...validProfile(), exercise_density: -Infinity })).toBeNull()
  })

  it("FAIL-CLOSED: v ≠ 1 → null", () => {
    expect(parseStyleProfile({ ...validProfile(), v: 2 })).toBeNull()
    expect(parseStyleProfile({ ...validProfile(), v: "1" })).toBeNull()
  })

  it("FAIL-CLOSED: metrica fuori range [0,1] → null", () => {
    expect(parseStyleProfile({ ...validProfile(), exercise_density: 1.2 })).toBeNull()
    expect(parseStyleProfile({ ...validProfile(), question_density: -0.1 })).toBeNull()
    expect(parseStyleProfile({ ...validProfile(), registro: Number.NaN })).toBeNull()
  })

  it("range: gli estremi 0 e 1 sono AMMESSI", () => {
    const p = parseStyleProfile({
      ...validProfile(),
      exercise_density: 0,
      registro: 1,
    })
    expect(p).not.toBeNull()
  })

  it(`FAIL-CLOSED: lessons_analyzed < ${MIN_LESSONS_ANALYZED} → null (il sistema tace, non etichetta)`, () => {
    expect(parseStyleProfile({ ...validProfile(), lessons_analyzed: 2 })).toBeNull()
    expect(parseStyleProfile({ ...validProfile(), lessons_analyzed: 0 })).toBeNull()
    expect(parseStyleProfile({ ...validProfile(), lessons_analyzed: 3 })).not.toBeNull()
  })

  it("FAIL-CLOSED: lessons_analyzed non intero o negativo → null", () => {
    expect(parseStyleProfile({ ...validProfile(), lessons_analyzed: 3.5 })).toBeNull()
    expect(parseStyleProfile({ ...validProfile(), lessons_analyzed: -1 })).toBeNull()
  })

  it("FAIL-CLOSED: tipi sbagliati / non-oggetti → null, MAI throw", () => {
    for (const garbage of [null, undefined, 42, "{}", [], { v: 1 }, { ...validProfile(), tics: "diciamo" }]) {
      expect(() => parseStyleProfile(garbage)).not.toThrow()
      expect(parseStyleProfile(garbage)).toBeNull()
    }
  })

  it("FAIL-CLOSED: teacher_id vuoto → null", () => {
    expect(parseStyleProfile({ ...validProfile(), teacher_id: "" })).toBeNull()
  })
})

describe("PL-1 loadStyleProfile — loader dal workspace", () => {
  function sourceWith(content: string | null): ProfileSource & { read: ReturnType<typeof vi.fn> } {
    return {
      read: vi.fn(async () =>
        content === null ? null : new Blob([content], { type: "application/json" }),
      ),
    }
  }

  it("legge ESATTAMENTE derived/style_profile.json (PATHS.STYLE_PROFILE)", async () => {
    const src = sourceWith(JSON.stringify(validProfile()))
    const p = await loadStyleProfile(src)
    expect(src.read).toHaveBeenCalledWith(PATHS.STYLE_PROFILE)
    expect(PATHS.STYLE_PROFILE).toBe("derived/style_profile.json")
    expect(p).not.toBeNull()
  })

  it("file assente → null (fail-closed)", async () => {
    expect(await loadStyleProfile(sourceWith(null))).toBeNull()
  })

  it("JSON malformato → null, MAI throw", async () => {
    const src = sourceWith("{ not json !!!")
    await expect(loadStyleProfile(src)).resolves.toBeNull()
  })

  it("JSON valido ma contratto violato → null", async () => {
    const src = sourceWith(JSON.stringify({ ...validProfile(), extra: 1 }))
    expect(await loadStyleProfile(src)).toBeNull()
  })

  it("read che RIGETTA (driver rotto) → null, MAI throw", async () => {
    const src: ProfileSource = { read: () => Promise.reject(new Error("disk on fire")) }
    await expect(loadStyleProfile(src)).resolves.toBeNull()
  })
})
