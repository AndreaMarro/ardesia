// @vitest-environment jsdom
// L'alias storico ?vista=lezioni-salvate ospita la superficie Founder Beta
// Materiali. Il workflow è soltanto locale: export, preview read-only,
// commit esplicito e recovery esplicita; nessuna richiesta backend.

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  isSavedLessonsView,
  LESSONOS_BASE_URL_STORAGE_KEY,
  LESSONOS_TOKEN_STORAGE_KEY,
  readSavedLessonsConfig,
} from "../store/savedLessonsView"
import SavedLessonsView from "../design/SavedLessonsView"
import type { LessonImportPreview } from "../store/lessonBundle"

beforeEach(() => {
  window.history.replaceState(null, "", "/?vista=lezioni-salvate")
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState(null, "", "/")
})

describe("isSavedLessonsView", () => {
  it("vera solo per ?vista=lezioni-salvate", () => {
    expect(isSavedLessonsView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=elab-lab")
    expect(isSavedLessonsView()).toBe(false)
    window.history.replaceState(null, "", "/")
    expect(isSavedLessonsView()).toBe(false)
  })
})

describe("readSavedLessonsConfig", () => {
  it("senza baseUrl configurata: null (fail-closed, nessun default inventato)", () => {
    expect(readSavedLessonsConfig()).toBeNull()
  })

  it("baseUrl e token da localStorage; room dal parametro URL (non sensibile)", () => {
    window.localStorage.setItem(LESSONOS_BASE_URL_STORAGE_KEY, "https://lessonos.example")
    window.localStorage.setItem(LESSONOS_TOKEN_STORAGE_KEY, "tok-locale")
    window.history.replaceState(null, "", "/?vista=lezioni-salvate&room=4B")
    expect(readSavedLessonsConfig()).toEqual({
      baseUrl: "https://lessonos.example",
      token: "tok-locale",
      room: "4B",
    })
  })

  it("il token NON viene MAI letto dall'URL", () => {
    window.localStorage.setItem(LESSONOS_BASE_URL_STORAGE_KEY, "https://lessonos.example")
    window.history.replaceState(
      null,
      "",
      "/?vista=lezioni-salvate&token=trappola&lessonosToken=trappola",
    )
    const config = readSavedLessonsConfig()
    expect(config).not.toBeNull()
    expect(config?.token).toBeUndefined()
  })
})

describe("SavedLessonsView", () => {
  const readyPreview: LessonImportPreview = {
    kind: "validated",
    identity: { kind: "embedded", lessonId: "wbstudio-room1" },
    manifest: {
      bundleVersion: 1,
      schemaVersion: 1,
      lessonId: "wbstudio-room1",
      sessionIds: [],
      producer: {
        id: "com.github.andreamarro.ardesia.studio",
        version: "0.0.0",
        commitSha: "a".repeat(40),
      },
      requiredArtifacts: [],
      optionalArtifacts: [],
      files: [],
      lessonOs: { status: "included", warnings: [] },
      compatibility: { minimumReaderSchemaVersion: 1, migrations: [] },
    },
    lessonOs: "included",
    files: [
      {
        sourcePath: "raw/board.excalidraw",
        targetPath: "raw/wbstudio-room1/board.excalidraw",
        bytes: 42,
        action: "replace",
      },
    ],
    pendingRecovery: null,
    commitReady: true,
  }

  function fakeStore(preview: LessonImportPreview = readyPreview) {
    return {
      mode: "localStorage",
      init: vi.fn(async () => "localStorage"),
      connectFolder: vi.fn(async () => true),
      exportLesson: vi.fn(async () => new Blob(["export"], { type: "application/zip" })),
      previewLessonBlobForRoom: vi.fn(async (): Promise<LessonImportPreview> => preview),
      importLessonBlobForRoom: vi.fn(async () => ({
        identity: { kind: "embedded", lessonId: "wbstudio-room1" },
        lessonOsRestore: { kind: "restored", recovered: 3 },
      })),
      recoverPendingLessonImport: vi.fn(async () => null),
    }
  }

  const fakeLog = {
    append: vi.fn(),
    readAll: vi.fn(async () => []),
    appendEnvelope: vi.fn(),
    readAllEnvelopes: vi.fn(async () => []),
    readEnvelopesByLesson: vi.fn(async () => []),
    readEnvelopesBySession: vi.fn(async () => []),
    close: vi.fn(async () => undefined),
  }

  it("export → preview → commit resta locale e mostra identità, azioni e integrità", async () => {
    window.history.replaceState(null, "", "/?vista=lezioni-salvate#wbstudio-room1")
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const store = fakeStore()
    const download = vi.fn()
    render(
      <SavedLessonsView
        store={store as never}
        eventLogFactory={async () => fakeLog as never}
        download={download}
      />,
    )

    expect(await screen.findByText("Materiali locali")).toBeTruthy()
    expect(fetchSpy).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: "Esporta .lesson" }))
    await waitFor(() => expect(store.exportLesson).toHaveBeenCalledWith("wbstudio-room1", fakeLog))
    expect(download).toHaveBeenCalledWith(expect.any(Blob), "lezione-wbstudio-room1.lesson")

    const file = new File(["bundle"], "lezione.lesson", { type: "application/zip" })
    fireEvent.change(screen.getByLabelText("Seleziona bundle .lesson"), {
      target: { files: [file] },
    })
    expect(await screen.findByText("Anteprima import")).toBeTruthy()
    expect(screen.getByText("wbstudio-room1")).toBeTruthy()
    expect(screen.getByText("raw/board.excalidraw")).toBeTruthy()
    expect(screen.getByText("Sostituisce")).toBeTruthy()
    expect(screen.getByText(/SHA a{12}/)).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Importa il bundle" }))
    await waitFor(() => {
      expect(store.importLessonBlobForRoom).toHaveBeenCalledWith(
        file,
        "wbstudio-room1",
        fakeLog,
      )
    })
    expect(await screen.findByText(/3 eventi LessonOS ripristinati/)).toBeTruthy()
  })

  it("una recovery pendente blocca il commit finché il docente non la riprende", async () => {
    window.history.replaceState(null, "", "/?vista=lezioni-salvate#wbstudio-room1")
    const blockedPreview = {
      ...readyPreview,
      pendingRecovery: {
        id: "txn-1",
        phase: "restoring",
        createdAt: "2026-07-19T20:00:00.000Z",
      },
      commitReady: false,
    } satisfies LessonImportPreview
    const store = fakeStore(blockedPreview)
    store.previewLessonBlobForRoom
      .mockResolvedValueOnce(blockedPreview)
      .mockResolvedValueOnce(readyPreview)
    render(
      <SavedLessonsView
        store={store as never}
        eventLogFactory={async () => fakeLog as never}
        download={vi.fn()}
      />,
    )

    const file = new File(["bundle"], "lezione.lesson", { type: "application/zip" })
    fireEvent.change(await screen.findByLabelText("Seleziona bundle .lesson"), {
      target: { files: [file] },
    })
    expect(await screen.findByText(/Recovery pendente: restoring/)).toBeTruthy()
    expect(
      (screen.getByRole("button", { name: "Importa il bundle" }) as HTMLButtonElement).disabled,
    ).toBe(true)

    fireEvent.click(screen.getByRole("button", { name: "Riprendi recovery" }))
    await waitFor(() => expect(store.recoverPendingLessonImport).toHaveBeenCalledWith(fakeLog))
    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: "Importa il bundle" }) as HTMLButtonElement).disabled,
      ).toBe(false)
    })
    expect(store.importLessonBlobForRoom).not.toHaveBeenCalled()
  })

  it("un bundle legacy resta bloccato finché il claim stanza non è esplicito e ri-validato", async () => {
    window.history.replaceState(null, "", "/?vista=lezioni-salvate#wbstudio-room1")
    const unassignedPreview: LessonImportPreview = {
      ...readyPreview,
      identity: { kind: "unassigned" },
      manifest: null,
    }
    const claimedPreview: LessonImportPreview = {
      ...unassignedPreview,
      identity: { kind: "claimed", lessonId: "wbstudio-room1" },
    }
    const store = fakeStore(unassignedPreview)
    store.previewLessonBlobForRoom
      .mockResolvedValueOnce(unassignedPreview)
      .mockResolvedValueOnce(claimedPreview)
    render(
      <SavedLessonsView
        store={store as never}
        eventLogFactory={async () => fakeLog as never}
        download={vi.fn()}
      />,
    )

    const file = new File(["legacy"], "legacy.lesson", { type: "application/zip" })
    fireEvent.change(await screen.findByLabelText("Seleziona bundle .lesson"), {
      target: { files: [file] },
    })
    await screen.findByText("Legacy non assegnato")
    expect(
      (screen.getByRole("button", { name: "Importa il bundle" }) as HTMLButtonElement).disabled,
    ).toBe(true)

    fireEvent.click(
      screen.getByRole("button", { name: "Assegna alla lezione wbstudio-room1" }),
    )
    await waitFor(() => {
      expect(store.previewLessonBlobForRoom).toHaveBeenLastCalledWith(
        file,
        "wbstudio-room1",
        { userConfirmed: true },
      )
    })
    expect(
      (screen.getByRole("button", { name: "Importa il bundle" }) as HTMLButtonElement).disabled,
    ).toBe(false)

    fireEvent.click(screen.getByRole("button", { name: "Importa il bundle" }))
    await waitFor(() => {
      expect(store.importLessonBlobForRoom).toHaveBeenCalledWith(
        file,
        "wbstudio-room1",
        fakeLog,
        { userConfirmed: true },
      )
    })
  })

  it("senza hash stanza fallisce chiuso e non inizializza lo storage", async () => {
    window.history.replaceState(null, "", "/?vista=lezioni-salvate")
    const store = fakeStore()
    render(
      <SavedLessonsView
        store={store as never}
        eventLogFactory={async () => fakeLog as never}
        download={vi.fn()}
      />,
    )
    expect(await screen.findByText("Nessuna lezione selezionata")).toBeTruthy()
    expect(store.init).not.toHaveBeenCalled()
  })
})
