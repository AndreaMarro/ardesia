// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import LessonPassageAuthor from "../LessonPassageAuthor"
import type { SessionAudioRecorder } from "../store/SessionAudioRecorder"
import type { WorkspaceStore } from "../store/WorkspaceStore"

afterEach(cleanup)
function props() {
  const state = { stage: "idle", error: null, lastRecording: null }
  const recorder = { identity: { lessonId: "aula-test", sessionId: "11111111-1111-4111-8111-111111111111" }, getSnapshot: () => state,
    subscribe: () => () => {}, setObjectRefs: vi.fn(), start: vi.fn(), stop: vi.fn(), revoke: vi.fn() }
  const selected = [{ elementId: "existing-formula", version: 7, label: "Formula già sulla lavagna" }]
  return { recorder: recorder as unknown as SessionAudioRecorder,
    store: { read: async () => null } as unknown as WorkspaceStore,
    onAnnotate: vi.fn(async () => selected), onLinkSelection: vi.fn(async () => selected), selectedObjects: selected }
}
describe("teacher's passage panel", () => {
  it("links an existing selected object without adding a second annotation or starting capture", async () => {
    const p = props(); render(<LessonPassageAuthor {...p} />)
    fireEvent.click(screen.getByRole("button", { name: "Registra e collega un passaggio" }))
    fireEvent.click(screen.getByRole("button", { name: "Collega oggetto selezionato" }))
    expect(await screen.findByText(/Passaggio collegato: Formula già sulla lavagna/)).toBeTruthy()
    expect(p.onLinkSelection).toHaveBeenCalledOnce()
    expect(p.onAnnotate).not.toHaveBeenCalled()
    expect(p.recorder.start).not.toHaveBeenCalled()
  })
  it("returns focus to the panel trigger on Escape and leaves recording default off", () => {
    const p = props(); render(<LessonPassageAuthor {...p} />)
    const trigger = screen.getByRole("button", { name: "Registra e collega un passaggio" })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText("Oppure aggiungi un'annotazione"))
    const field = screen.getByRole("textbox", { name: "Annotazione del docente" }); field.focus()
    fireEvent.keyDown(field, { key: "Escape" })
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(p.recorder.start).not.toHaveBeenCalled()
  })
})
