// @vitest-environment node
//
// Primo plugin CONCRETO ELAB — simulazione Arduino Blink book-accurate montata
// sulla lavagna via ToolHost. Due livelli:
//   1) modello puro (arduino.ts): costanti/semantica fedeli alla Language Reference,
//      clock virtuale deterministico, snapshot/restore.
//   2) integrazione: plugin reale (start/step da plugins/elab/main.ts) connesso
//      al ToolHost reale via MessageChannel + SDK reale (connectTool); il LED del
//      pin 13 si rispecchia su un board adapter (la stessa BoardApiLike che in
//      produzione è alimentata dall'API Excalidraw).
import { afterEach, describe, expect, it } from "vitest"
import {
  ArduinoRuntime,
  HIGH,
  INPUT,
  INPUT_PULLUP,
  LED_BUILTIN,
  LOW,
  OUTPUT,
  SketchScheduler,
  blinkSketch,
  isArduinoSnapshot,
} from "../../plugins/elab/arduino.ts"
import type { Sketch } from "../../plugins/elab/arduino.ts"
import { start } from "../../plugins/elab/main.ts"
import type { LedEmbedState } from "../../plugins/elab/main.ts"
import { manifest as elabManifest } from "../../plugins/elab/manifest.ts"
import { ToolHost, statePath } from "../toolhost/host.ts"
import { EMBED_DATA_KEY } from "../toolhost/caps/board.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import type { CapabilityName } from "../toolhost-protocol/index.ts"
import type { WindowLike } from "../sdk/index.ts"

const EMBED_ID = `${elabManifest.id}:led`

// ----------------------------- modello puro -----------------------------------

describe("arduino model — costanti book-accurate (Language Reference)", () => {
  it("i valori coincidono col core AVR reale", () => {
    expect(LOW).toBe(0)
    expect(HIGH).toBe(1)
    expect(INPUT).toBe(0)
    expect(OUTPUT).toBe(1)
    expect(INPUT_PULLUP).toBe(2)
    expect(LED_BUILTIN).toBe(13)
  })
})

describe("arduino model — semantica pin", () => {
  it("default: pin INPUT, livello LOW, clock a 0", () => {
    const rt = new ArduinoRuntime()
    expect(rt.getMode(7)).toBe(INPUT)
    expect(rt.digitalRead(7)).toBe(LOW)
    expect(rt.millis()).toBe(0)
  })

  it("isLit SOLO se OUTPUT && HIGH: un HIGH su INPUT abilita il pull-up ma non accende", () => {
    const rt = new ArduinoRuntime()
    rt.digitalWrite(LED_BUILTIN, HIGH) // pin ancora INPUT
    expect(rt.digitalRead(LED_BUILTIN)).toBe(HIGH)
    expect(rt.isLit(LED_BUILTIN)).toBe(false)

    rt.pinMode(LED_BUILTIN, OUTPUT)
    expect(rt.isLit(LED_BUILTIN)).toBe(true) // ora il livello HIGH pilota il LED
    rt.digitalWrite(LED_BUILTIN, LOW)
    expect(rt.isLit(LED_BUILTIN)).toBe(false)
  })

  it("INPUT_PULLUP porta il livello a riposo a HIGH", () => {
    const rt = new ArduinoRuntime()
    rt.pinMode(2, INPUT_PULLUP)
    expect(rt.digitalRead(2)).toBe(HIGH)
    expect(rt.isLit(2)).toBe(false) // INPUT, non OUTPUT → niente LED
  })

  it("delay avanza il clock virtuale; millis lo rispecchia", () => {
    const rt = new ArduinoRuntime()
    rt.delay(250)
    rt.delay(750)
    expect(rt.millis()).toBe(1000)
  })

  it("input invalidi falliscono fail-fast (guardie didattiche)", () => {
    const rt = new ArduinoRuntime()
    expect(() => rt.delay(-1)).toThrow(/delay richiede/)
    expect(() => rt.delay(1.5)).toThrow(/delay richiede/)
    expect(() => rt.delay(Number.NaN)).toThrow(/delay richiede/)
    expect(() => rt.pinMode(13, 9 as never)).toThrow(/mode non valido/)
    expect(() => rt.digitalWrite(13, 2 as never)).toThrow(/valore digitale/)
    expect(() => rt.digitalWrite(-3, HIGH)).toThrow(/pin non valido/)
  })
})

describe("arduino model — sketch Blink via scheduler", () => {
  it("setup imposta OUTPUT; loop alterna il LED a passi di 1000ms (deterministico)", () => {
    const rt = new ArduinoRuntime()
    const sched = new SketchScheduler(blinkSketch, rt)
    expect(rt.getMode(LED_BUILTIN)).toBe(OUTPUT) // setup() eseguito alla costruzione
    expect(rt.isLit(LED_BUILTIN)).toBe(false)

    const trace: { lit: boolean; millis: number; held: number }[] = []
    for (let i = 0; i < 5; i++) {
      const held = sched.step()
      trace.push({ lit: rt.isLit(LED_BUILTIN), millis: rt.millis(), held })
    }
    expect(trace).toEqual([
      { lit: true, millis: 1000, held: 1000 }, // HIGH, tiene 1000ms
      { lit: false, millis: 2000, held: 1000 }, // LOW, tiene 1000ms
      { lit: true, millis: 3000, held: 1000 }, // loop() riparte → HIGH
      { lit: false, millis: 4000, held: 1000 },
      { lit: true, millis: 5000, held: 1000 },
    ])
  })

  it("snapshot/restore: lo stato elettrico sopravvive (clock + livelli + modi)", () => {
    const rt = new ArduinoRuntime()
    const sched = new SketchScheduler(blinkSketch, rt)
    sched.step() // LED ON, millis 1000
    const snap = rt.snapshot()
    expect(snap).toEqual({ v: 1, millis: 1000, modes: { 13: OUTPUT }, levels: { 13: HIGH } })

    // muta, poi ripristina
    rt.delay(9999)
    rt.digitalWrite(LED_BUILTIN, LOW)
    rt.restoreSnapshot(snap)
    expect(rt.millis()).toBe(1000)
    expect(rt.isLit(LED_BUILTIN)).toBe(true)
  })

  it("reset riavvia loop() dall'inizio senza azzerare il clock", () => {
    const rt = new ArduinoRuntime()
    const sched = new SketchScheduler(blinkSketch, rt)
    sched.step() // HIGH
    sched.reset()
    sched.step() // loop() da capo → HIGH di nuovo
    expect(rt.isLit(LED_BUILTIN)).toBe(true)
    expect(rt.millis()).toBe(2000)
  })

  it("loop() senza delay() → errore esplicito, niente ricorsione infinita", () => {
    const rt = new ArduinoRuntime()
    const noYield: Sketch = {
      setup() {},
      // eslint-disable-next-line require-yield
      *loop() {},
    }
    const sched = new SketchScheduler(noYield, rt)
    expect(() => sched.step()).toThrow(/nessun confine di esecuzione/)
  })

  it("isArduinoSnapshot scarta forme non valide", () => {
    expect(isArduinoSnapshot({ v: 1, millis: 0, modes: {}, levels: {} })).toBe(true)
    expect(isArduinoSnapshot(null)).toBe(false)
    expect(isArduinoSnapshot({ v: 2, millis: 0, modes: {}, levels: {} })).toBe(false)
    expect(isArduinoSnapshot({ v: 1, millis: "x", modes: {}, levels: {} })).toBe(false)
    expect(isArduinoSnapshot({ v: 1, millis: 0, modes: null, levels: {} })).toBe(false)
  })
})

// ------------------------- integrazione via ToolHost --------------------------

class MemoryWorkspace implements StorageDriverLike, AuditStore {
  files = new Map<string, Blob>()
  async read(path: string): Promise<Blob | null> {
    return this.files.get(path) ?? null
  }
  async write(path: string, data: Blob): Promise<void> {
    this.files.set(path, data)
  }
  async delete(path: string): Promise<void> {
    this.files.delete(path)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this.files.entries()]
      .filter(([p]) => prefix === undefined || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

class FakeBoard implements BoardApiLike {
  elements: BoardElementLike[] = []
  selected: Record<string, boolean> = {}
  getSceneElements(): readonly BoardElementLike[] {
    return this.elements
  }
  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: this.selected }
  }
  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = scene.elements
  }
}

/** Finestra finta del tool: connectTool ci ascolta, l'harness consegna l'hello. */
class FakeToolWindow implements WindowLike {
  private _listeners = new Set<(ev: { data: unknown; ports?: readonly unknown[] }) => void>()
  addEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.add(l)
  }
  removeEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.delete(l)
  }
  deliver(data: unknown, ports: readonly unknown[]): void {
    for (const l of [...this._listeners]) l({ data, ports })
  }
}

const openChannels: MessageChannel[] = []
afterEach(() => {
  for (const ch of openChannels.splice(0)) {
    ch.port1.close()
    ch.port2.close()
  }
})

interface Harness {
  host: ToolHost
  board: FakeBoard
  store: MemoryWorkspace
  plugin: Awaited<ReturnType<typeof start>>
}

/** Monta il plugin reale sul ToolHost reale via MessageChannel + SDK reale. */
async function mountPlugin(
  approved: readonly CapabilityName[] = ["board.read", "board.write"],
  opts: { board?: FakeBoard; store?: MemoryWorkspace; sketch?: Sketch; now?: () => number } = {},
): Promise<Harness> {
  const board = opts.board ?? new FakeBoard()
  const store = opts.store ?? new MemoryWorkspace()
  const host = new ToolHost(elabManifest, resolveGrant(elabManifest, approved), {
    store,
    board,
    bearerToken: "bearer-test",
    now: opts.now,
  })
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  const win = new FakeToolWindow()
  const pluginPromise = start({ windowRef: win, sketch: opts.sketch })
  win.deliver(session.hello, [ch.port2])
  return { host, board, store, plugin: await pluginPromise }
}

function ledEmbed(board: FakeBoard): { owner: string; state: LedEmbedState } | undefined {
  const el = board.elements.find((e) => e.id === EMBED_ID)
  if (el === undefined) return undefined
  return el.customData?.[EMBED_DATA_KEY] as { owner: string; state: LedEmbedState }
}

describe("plugin concreto — montaggio via ToolHost", () => {
  it("handshake completo: grantedCaps esposti, setup() eseguito, embed iniziale spento", async () => {
    const { plugin, board } = await mountPlugin()
    expect(plugin.conn.grantedCaps["board.read"]).toBeDefined()
    expect(plugin.conn.grantedCaps["board.write"]).toBeDefined()
    expect(plugin.runtime.getMode(LED_BUILTIN)).toBe(OUTPUT) // setup() ha girato
    expect(plugin.ledOn()).toBe(false)

    const embed = ledEmbed(board)
    expect(embed?.owner).toBe(elabManifest.id)
    expect(embed?.state).toEqual({ ledOn: false, pin: LED_BUILTIN, millis: 0 })
  })

  it("step() fa lampeggiare il LED sulla lavagna (board.write rispecchia il pin 13)", async () => {
    const { plugin, board } = await mountPlugin()

    const wrote1 = await plugin.step()
    expect(wrote1).toBe(true)
    expect(ledEmbed(board)?.state).toEqual({ ledOn: true, pin: LED_BUILTIN, millis: 1000 })

    const wrote2 = await plugin.step()
    expect(wrote2).toBe(true)
    expect(ledEmbed(board)?.state).toEqual({ ledOn: false, pin: LED_BUILTIN, millis: 2000 })

    await plugin.step()
    expect(ledEmbed(board)?.state.ledOn).toBe(true)
    // un solo embed: lo stesso id viene aggiornato, non duplicato
    expect(board.elements.filter((e) => e.id === EMBED_ID)).toHaveLength(1)
  })

  it("nessun board.write quando lo stato del LED non cambia (sketch che non tocca il pin)", async () => {
    // sketch che fa solo delay: il LED resta spento → dopo l'embed iniziale, zero scritture
    const idleSketch: Sketch = {
      setup(rt) {
        rt.pinMode(LED_BUILTIN, OUTPUT)
      },
      *loop() {
        yield 500
      },
    }
    const { plugin, board } = await mountPlugin(["board.read", "board.write"], { sketch: idleSketch })
    expect(await plugin.step()).toBe(false)
    expect(await plugin.step()).toBe(false)
    expect(ledEmbed(board)?.state).toEqual({ ledOn: false, pin: LED_BUILTIN, millis: 0 })
    expect(plugin.runtime.millis()).toBe(1000) // i delay sono comunque avanzati
  })

  it("degrada in sicurezza: senza board.write il LED gira nel modello ma niente embed", async () => {
    const { plugin, board } = await mountPlugin(["board.read"])
    expect(plugin.conn.grantedCaps["board.write"]).toBeUndefined()
    expect(await plugin.step()).toBe(false)
    expect(plugin.ledOn()).toBe(true) // il modello lampeggia comunque
    expect(plugin.runtime.millis()).toBe(1000) // step() ha davvero avanzato lo sketch
    expect(board.elements).toHaveLength(0) // ma nulla è stato disegnato
  })

  it("board.write rispetta own-embeds: id namespacizzato sull'owner del plugin", async () => {
    const board = new FakeBoard()
    board.elements = [{ id: "disegno-docente", type: "rectangle" }]
    board.selected = { "disegno-docente": true }
    const { plugin } = await mountPlugin(["board.read", "board.write"], { board })
    await plugin.step()
    // il disegno del docente è intatto, l'embed del plugin è separato
    expect(board.elements.find((e) => e.id === "disegno-docente")?.customData).toBeUndefined()
    expect(ledEmbed(board)?.owner).toBe(elabManifest.id)
  })
})

describe("plugin concreto — lifecycle suspend/restore via host", () => {
  it("lo stato elettrico sopravvive a suspend → restore (clock + livello LED)", async () => {
    const store = new MemoryWorkspace()
    let t = 7000
    const a = await mountPlugin(["board.read", "board.write"], { store, now: () => t++ })
    await a.plugin.step() // ON, millis 1000
    await a.plugin.step() // OFF, millis 2000
    await a.plugin.step() // ON, millis 3000
    expect(a.plugin.ledOn()).toBe(true)

    await a.host.suspend()
    const persisted = JSON.parse(await store.files.get(statePath(elabManifest.id))!.text())
    expect(persisted.state).toEqual({ v: 1, millis: 3000, modes: { 13: OUTPUT }, levels: { 13: HIGH } })
    a.host.unmount()

    // nuovo mount sullo stesso store → restore consegna lo snapshot al nuovo plugin
    const b = await mountPlugin(["board.read", "board.write"], { store })
    expect(b.plugin.runtime.millis()).toBe(0) // appena avviato
    expect(await b.host.restore()).toBe(true)
    expect(b.plugin.runtime.millis()).toBe(3000)
    expect(b.plugin.ledOn()).toBe(true)
  })

  it("restore con stato corrotto è ignorato dalla guardia (runtime intatto)", async () => {
    const store = new MemoryWorkspace()
    const { host, plugin } = await mountPlugin(["board.read", "board.write"], { store })
    // forza un documento di stato dalla forma sbagliata (snapshot non-arduino)
    store.files.set(statePath(elabManifest.id), new Blob(['{"v":1,"t":1,"state":{"garbage":true}}']))
    expect(await host.restore()).toBe(true) // l'host consegna; la guardia del tool scarta
    expect(plugin.runtime.millis()).toBe(0)
    expect(plugin.runtime.getMode(LED_BUILTIN)).toBe(OUTPUT) // setup originale intatto
  })
})
