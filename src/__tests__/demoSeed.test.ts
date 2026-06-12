// @vitest-environment jsdom
// S-DESIGN-9b: seed demo deterministico per gli screenshot.
// Il rischio vero: entries che NON combaciano con chiavi/encoding del
// LocalStorageDriver reale → lavagna vuota negli shot. Si testa il roundtrip VERO.

import { describe, it, expect, beforeEach } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
// @ts-expect-error — modulo ESM .mjs condiviso con scripts/shots.mjs (niente tipi)
import { buildDemoScene, buildDemoSeedEntries, DEMO_LESSON_NAME, DEMO_BOARD_TITLE, DEMO_MTIME } from "../../scripts/demoSeed.mjs"

const ROOM = "visual-smoke-test"

let storage: Record<string, string> = {}
beforeEach(() => {
  storage = {}
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => { storage[k] = v },
      removeItem: (k: string) => { delete storage[k] },
      clear: () => { storage = {} },
      get length() { return Object.keys(storage).length },
      key: (i: number) => Object.keys(storage)[i] ?? null,
    },
    configurable: true,
    writable: true,
  })
})

describe("S-DESIGN-9b: scena demo deterministica", () => {
  it("due chiamate producono ESATTAMENTE gli stessi byte (zero Date.now/random)", () => {
    expect(JSON.stringify(buildDemoScene())).toBe(JSON.stringify(buildDemoScene()))
    expect(JSON.stringify(buildDemoSeedEntries(ROOM))).toBe(JSON.stringify(buildDemoSeedEntries(ROOM)))
  })

  it("le entry :mtime e il createdAt del meta sono l'epoch fisso DEMO_MTIME", () => {
    const entries = Object.fromEntries(buildDemoSeedEntries(ROOM))
    expect(entries[`maestro:raw/${ROOM}/board.excalidraw:mtime`]).toBe(String(DEMO_MTIME))
    expect(entries[`maestro:raw/${ROOM}/meta.json:mtime`]).toBe(String(DEMO_MTIME))
    const metaB64 = entries[`maestro:raw/${ROOM}/meta.json`]
    const meta = JSON.parse(Buffer.from(metaB64, "base64").toString("utf8"))
    expect(meta.createdAt).toBe(DEMO_MTIME)
  })

  it("la scena contiene il titolo e 3 stroke freedraw non banali", () => {
    const scene = buildDemoScene()
    expect(scene.type).toBe("excalidraw")

    const texts = scene.elements.filter((e: any) => e.type === "text")
    expect(texts).toHaveLength(1)
    expect(texts[0].text).toBe(DEMO_BOARD_TITLE)

    const strokes = scene.elements.filter((e: any) => e.type === "freedraw")
    expect(strokes).toHaveLength(3)
    for (const s of strokes) {
      expect(s.points.length).toBeGreaterThanOrEqual(5)
      expect(s.isDeleted).toBe(false)
      // ogni stroke ha estensione reale (non un punto degenere)
      expect(s.width + s.height).toBeGreaterThan(50)
    }
    // nessun timestamp dinamico: updated è l'epoch fisso
    for (const e of scene.elements) expect(e.updated).toBe(DEMO_MTIME)
  })

  it("le entries seminate sono leggibili dal VERO LocalStorageDriver + WorkspaceStore", async () => {
    for (const [k, v] of buildDemoSeedEntries(ROOM)) localStorage.setItem(k, v)

    const { WorkspaceStore } = await import("../store/WorkspaceStore")
    const { localStorageDriver } = await import("../store/drivers/localStorage")
    const store = new WorkspaceStore()
    ;(store as any).driver = localStorageDriver
    ;(store as any).fallback = localStorageDriver
    ;(store as any)._mode = "localStorage"

    // Scena: roundtrip byte-exact attraverso base64ToBlob del codec reale
    const sceneJson = await store.loadScene(ROOM)
    expect(sceneJson).not.toBeNull()
    const scene = JSON.parse(sceneJson!)
    expect(scene.elements.map((e: any) => e.type)).toEqual(["text", "freedraw", "freedraw", "freedraw"])
    expect(scene.elements[0].text).toBe(DEMO_BOARD_TITLE)

    // Meta: il nome lezione passa la validazione di loadMeta (v=1, name string)
    const meta = await store.loadMeta(ROOM)
    expect(meta).not.toBeNull()
    expect(meta!.name).toBe(DEMO_LESSON_NAME)

    // Drawer: la lezione demo compare in listRooms col nome giusto
    const rooms = await store.listRooms()
    const demo = rooms.find((r) => r.room === ROOM)
    expect(demo).toBeDefined()
    expect(demo!.name).toBe(DEMO_LESSON_NAME)
  })

  it("shots.mjs semina la scena PRIMA delle navigazioni 02 e 03", () => {
    const src = readFileSync(resolve(__dirname, "../../scripts/shots.mjs"), "utf8")
    expect(src).toContain("buildDemoSeedEntries")
    expect(src).toContain("addInitScript")
    // il seed avviene prima del goto di page2 e page3 (regex: non ingannabile da commenti)
    expect(src).toMatch(/await seedDemoScene\(page2\)[\s\S]*?await page2\.goto/)
    expect(src).toMatch(/await seedDemoScene\(page3\)[\s\S]*?await page3\.goto/)
  })
})
