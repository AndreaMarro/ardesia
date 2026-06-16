import { describe, it, expect } from "vitest"
import { lessonSlug } from "../lessonSlug"

describe("lessonSlug", () => {
  it("slugifica un nome normale", () => {
    expect(lessonSlug("Teoria dei Segnali", "room1")).toBe("teoria-dei-segnali")
  })

  it("collassa spazi multipli e trattini ripetuti", () => {
    expect(lessonSlug("  Onde   --  Sonore ", "room1")).toBe("onde-sonore")
  })

  it("ricade sul fallback quando il nome non ha caratteri utili", () => {
    // Bug pre-fix: produceva `lezione-.lesson` (slug vuoto).
    expect(lessonSlug("©™", "room42")).toBe("room42")
    expect(lessonSlug("   ", "room42")).toBe("room42")
    expect(lessonSlug("", "room42")).toBe("room42")
  })

  it("strip dei trattini di bordo PRIMA del taglio (nome lungo con spazio iniziale)", () => {
    // Regressione: lo spazio iniziale collassa in un trattino di testa che va
    // tolto prima del taglio, altrimenti consuma uno slot dei 48 char.
    const name = " " + "a".repeat(60)
    expect(lessonSlug(name, "room1")).toBe("a".repeat(48))
  })

  it("taglia a 48 char senza lasciare un trattino finale", () => {
    // 'a' * 47 + ' x'  → il taglio a 48 cade sul trattino prima di 'x'.
    const name = "a".repeat(47) + " x"
    const slug = lessonSlug(name, "room1")
    expect(slug.length).toBeLessThanOrEqual(48)
    expect(slug.endsWith("-")).toBe(false)
    expect(slug).toBe("a".repeat(47))
  })
})
