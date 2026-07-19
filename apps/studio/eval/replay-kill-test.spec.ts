// @playwright/test
// MAESTRO-Studio — T1b KILL-TEST A SCHERMO
// Replay deterministico da journal REALE (generato disegnando con Excalidraw API).
// Criterio di accettazione UFFICIALE di T1: confronto elementi replayed vs scena originale.
// Se questo test non passa, T1 NON è chiuso e T2 NON parte.

import { test, expect } from "@playwright/test"

test("replay kill-test: da journal reale ricostruisce scena equivalente a board.excalidraw", async ({
  page,
}) => {
  await page.goto("/")

  // Aspetta che l'app sia completamente caricata (Excalidraw montato, initialLoadDone=true)
  await page.waitForFunction(() => {
    const w = window as any
    return w.__MAESTRO_TEST__?.ready === true && w.__MAESTRO_TEST__?.apiRef?.current
  })

  // Esegue la sequenza di test nel browser
  const result = await page.evaluate(async () => {
    const W = window as any
    const H = W.__MAESTRO_TEST__
    const api = H.apiRef.current
    const recorder = H.recorder
    const store = H.store
    const ReplayEngineCls = H.ReplayEngine
    const deserialize = H.deserializeEvents
    const PATHS = H.PATHS

    function wait(ms: number): Promise<void> {
      return new Promise((r) => setTimeout(r, ms))
    }

    // Helper per early-exit: restituisce match:false con mismatches POPOLATO (mai undefined)
    function fail(error: string, extra: Record<string, any> = {}): Record<string, any> {
      return { match: false, error, mismatches: [error], truthLength: 0, replayedLength: 0,
               renderedLength: 0, journalEventCount: 0, journalLinesCount: 0, elementIds: "", ...extra }
    }

    // Helper: elemento Excalidraw minimale
    function makeEl(
      id: string,
      type: string,
      overrides: Record<string, any> = {},
    ): Record<string, any> {
      return {
        id,
        type,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: "#000",
        backgroundColor: "#fff",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        groupIds: [],
        boundElements: null,
        link: null,
        locked: false,
        version: 1,
        versionNonce: 0,
        isDeleted: false,
        seed: Math.floor(Math.random() * 100000),
        roundness: null,
        ...overrides,
      }
    }

    // --- FASE 1: Disegna elementi uno per uno (simula uso reale) ---

    // 1a. Rettangolo
    const r1 = makeEl("r1", "rectangle", { x: 0, y: 0, width: 200, height: 100 })
    api.updateScene({ elements: [r1] })
    await wait(300)

    // 1b. Diamante
    const d1 = makeEl("d1", "diamond", { x: 300, y: 50, width: 120, height: 80 })
    api.updateScene({ elements: [r1, d1] })
    await wait(300)

    // 1c. Testo
    const t1 = makeEl("t1", "text", {
      x: 100,
      y: 200,
      width: 160,
      height: 30,
      text: "Ciao mondo",
      fontSize: 20,
    })
    api.updateScene({ elements: [r1, d1, t1] })
    await wait(300)

    // 1d. Aggiorna rettangolo (version bump = spostamento o resize)
    const r1v2 = makeEl("r1", "rectangle", {
      x: 50,
      y: 20,
      width: 250,
      height: 120,
      version: 2,
      versionNonce: 10,
      seed: r1.seed + 1,
    })
    api.updateScene({ elements: [r1v2, d1, t1] })
    await wait(300)

    // 1e. Freccia (arrow)
    const a1 = makeEl("a1", "arrow", {
      x: 300,
      y: 250,
      width: 100,
      height: 0,
      points: [
        [0, 0] as [number, number],
        [100, 0] as [number, number],
      ],
      endBinding: { elementId: "t1", focus: 0, gap: 5 },
    })
    api.updateScene({ elements: [r1v2, d1, t1, a1] })
    await wait(300)

    // Aspetta che persist() abbia scritto board.excalidraw (debounce 700ms + buffer)
    await wait(1500)

    // --- FASE 2: Leggi board.excalidraw dallo store (la "verità" persistita) ---
    // Usa store.loadScene(room) con fallback per-room (raw/<room>/board.excalidraw) -> legacy -> localStorage
    const sceneText = await store.loadScene(H.room)
    if (!sceneText) {
      return fail("board.excalidraw non trovato via loadScene", { room: H.room })
    }
    let sceneParsed: any
    try {
      sceneParsed = JSON.parse(sceneText)
    } catch {
      return fail("board.excalidraw JSON non valido")
    }
    const truthElements: Record<string, any>[] = sceneParsed.elements ?? []
    const truthMap = new Map<string, Record<string, any>>()
    for (const el of truthElements) {
      truthMap.set(el.id, el)
    }

    // --- FASE 3: Leggi il journal dallo store (flush forzato per sicurezza) ---
    await recorder.flush()
    await wait(200)
    const journalBlob = await store.read(PATHS.JOURNAL)
    if (!journalBlob) {
      return fail("journal non trovato", { truthLength: truthElements.length })
    }
    const journalText = await journalBlob.text()
    const journalLines = journalText.trim().split("\n").filter(Boolean)

    // --- FASE 4: Replay dal journal ---
    const engine = new ReplayEngineCls()
    // Il live journal è room-scoped e v2: il decoder deve ricevere la stessa
    // authority path esposta dalla Room, mai il default flat legacy.
    const events = deserialize(journalText, PATHS.JOURNAL)
    if (events.length === 0) {
      return fail("zero eventi nel journal", { truthLength: truthElements.length })
    }
    const replayed = engine.replay(events)

    // --- FASE 5: Monta la scena replayed a schermo ---
    api.updateScene({ elements: replayed })
    await wait(500)
    const renderedElements = api.getSceneElements()
    const renderedMap = new Map<string, Record<string, any>>()
    for (const el of renderedElements) {
      renderedMap.set(el.id, el)
    }

    // --- FASE 6: Confronto board.excalidraw vs elementi renderizzati (id/tipo/posizione/contenuto) ---
    const allIds = new Set([
      ...Array.from(truthMap.keys()),
      ...Array.from(renderedMap.keys()),
    ])
    const mismatches: string[] = []

    for (const id of allIds) {
      const t = truthMap.get(id)
      const r = renderedMap.get(id)

      if (!t) {
        mismatches.push(`${id}: presente nel render ma assente in board.excalidraw`)
        continue
      }
      if (!r) {
        mismatches.push(`${id}: presente in board.excalidraw ma assente nel render`)
        continue
      }

      // Confronto campi strutturali (id, tipo, posizione — NON version: Excalidraw la bumpa internamente)
      if (t.type !== r.type) mismatches.push(`${id}: type ${t.type} vs ${r.type}`)
      if (Math.abs(t.x - r.x) > 5) mismatches.push(`${id}: x ${t.x} vs ${r.x}`)
      if (Math.abs(t.y - r.y) > 5) mismatches.push(`${id}: y ${t.y} vs ${r.y}`)
      if (Math.abs(t.width - r.width) > 5) mismatches.push(`${id}: width ${t.width} vs ${r.width}`)
      if (Math.abs(t.height - r.height) > 5) mismatches.push(`${id}: height ${t.height} vs ${r.height}`)

      // Se è un elemento di testo, confronta il contenuto
      if (t.type === "text" && r.type === "text") {
        if (t.text !== r.text) mismatches.push(`${id}: text "${t.text}" vs "${r.text}"`)
      }
    }

    // Pulisci: rimuovi il test harness
    delete (window as any).__MAESTRO_TEST__

    return {
      match: mismatches.length === 0,
      truthLength: truthElements.length,
      replayedLength: replayed.length,
      renderedLength: renderedElements.length,
      journalEventCount: events.length,
      journalLinesCount: journalLines.length,
      elementIds: Array.from(allIds).sort().join(","),
      mismatches: mismatches.length > 0 ? mismatches : [],
    }
  })

  // --- ASSERT ---
  expect(result.match, `Replay mismatch: ${JSON.stringify(result.mismatches)}`).toBe(true)
  expect(result.truthLength).toBeGreaterThanOrEqual(4) // almeno 4 elementi creati
  expect(result.renderedLength).toBe(result.truthLength) // stesso numero a schermo
  expect(result.journalEventCount).toBeGreaterThanOrEqual(4) // almeno 4 eventi (1 per ogni add/update)
  expect(result.journalLinesCount).toBe(result.journalEventCount)
  expect(result.elementIds).toContain("r1")
  expect(result.elementIds).toContain("d1")
  expect(result.elementIds).toContain("t1")
  expect(result.elementIds).toContain("a1")
})
