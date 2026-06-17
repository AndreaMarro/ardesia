// Runtime del primo plugin CONCRETO ELAB: una simulazione Arduino Blink
// book-accurate montata sulla lavagna via ToolHost. Esercita i quattro pilastri
// del contratto SDK Layer-0 usando SOLO la superficie pubblica `src/sdk`:
//   manifest (manifest.ts) · capabilities (grantedCaps) · message-protocol (call)
//   · lifecycle (handlers suspend/restore).
// La logica del microcontrollore vive in ./arduino.ts (puro, deterministico):
// qui c'è solo il ponte modello ⇄ lavagna (board.read/board.write) e il
// lifecycle. Non monta nulla da solo: espone start() che l'host invoca dentro
// l'iframe e step() che il tick di rendering chiama per far lampeggiare il LED.
import { connectTool, isGranted } from "../../src/sdk/index.ts"
import type { Capabilities, ToolConnection, WindowLike } from "../../src/sdk/index.ts"
import {
  ArduinoRuntime,
  LED_BUILTIN,
  SketchScheduler,
  blinkSketch,
  isArduinoSnapshot,
} from "./arduino.ts"
import type { Sketch } from "./arduino.ts"
import { manifest } from "./manifest.ts"

const EMBED_ID = `${manifest.id}:led`

/** Stato dell'embed depositato sulla lavagna: lo specchio del LED del pin 13. */
export interface LedEmbedState {
  ledOn: boolean
  pin: number
  millis: number
}

export interface StartOptions {
  /** Finestra su cui attendere host.hello (default globalThis); override nei test. */
  windowRef?: WindowLike
  /** Sketch da eseguire (default Blink canonico); override per test/lezioni. */
  sketch?: Sketch
}

/** Controller del plugin montato: il tick di rendering chiama step() per animare. */
export interface ElabPlugin {
  readonly conn: ToolConnection
  readonly runtime: ArduinoRuntime
  /**
   * Avanza la simulazione al prossimo confine delay(); se lo stato ACCESO del
   * LED integrato è cambiato, lo riflette sulla lavagna (board.write). Ritorna
   * true se ha scritto sulla lavagna.
   */
  step(): Promise<boolean>
  /** Il LED integrato è acceso ORA? (pin 13 OUTPUT + HIGH). */
  ledOn(): boolean
}

/**
 * Handshake col host e prima sincronizzazione. Tutte le chiamate sono gated dalle
 * capability EFFETTIVAMENTE concesse (grantedCaps), non da quelle dichiarate nel
 * manifest: il docente può negarne alcune e il plugin deve degradare in sicurezza.
 */
export async function start(opts: StartOptions = {}): Promise<ElabPlugin> {
  const runtime = new ArduinoRuntime()
  const sketch = opts.sketch ?? blinkSketch

  const conn = await connectTool({
    windowRef: opts.windowRef,
    handlers: {
      suspend: () => runtime.snapshot(),
      restore: (saved: unknown): void => {
        if (isArduinoSnapshot(saved)) runtime.restoreSnapshot(saved)
      },
    },
  })

  // setup() dello sketch (pinMode OUTPUT) gira alla costruzione dello scheduler.
  const scheduler = new SketchScheduler(sketch, runtime)
  const caps = conn.grantedCaps

  // Contesto iniziale: leggi la selezione del docente, se concesso.
  if (isGranted(caps, "board.read")) {
    await conn.call("board.read", { target: "selection" })
  }

  let lastLit = runtime.isLit(LED_BUILTIN)
  // Sincronizzazione iniziale dello stato del LED (anche se spento: l'embed nasce).
  await syncBoard(conn, caps, runtime)

  return {
    conn,
    runtime,
    ledOn: () => runtime.isLit(LED_BUILTIN),
    async step(): Promise<boolean> {
      scheduler.step()
      const lit = runtime.isLit(LED_BUILTIN)
      if (lit === lastLit) return false
      lastLit = lit
      return syncBoard(conn, caps, runtime)
    },
  }
}

/** Disegna lo stato corrente del LED sul proprio embed, se board.write è concesso. */
async function syncBoard(conn: ToolConnection, caps: Capabilities, runtime: ArduinoRuntime): Promise<boolean> {
  if (!isGranted(caps, "board.write")) return false
  const state: LedEmbedState = {
    ledOn: runtime.isLit(LED_BUILTIN),
    pin: LED_BUILTIN,
    millis: runtime.millis(),
  }
  await conn.call("board.write", { embedId: EMBED_ID, state })
  return true
}
