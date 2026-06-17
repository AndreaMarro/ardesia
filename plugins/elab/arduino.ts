// Modello Arduino book-accurate — nucleo del primo plugin concreto ELAB.
// Riproduce la semantica del Linguaggio Arduino (Language Reference) per ciò che
// serve all'esempio canonico Blink (File ▸ Examples ▸ 01.Basics ▸ Blink):
// costanti di pin/livello, pinMode/digitalWrite/digitalRead, delay()/millis() su
// un clock VIRTUALE deterministico (nessun Date.now/timer reale → replay stabile).
// Puro: non importa nulla: l'unico accoppiamento del plugin al sistema è il
// boundary src/sdk in main.ts.

// ---- Costanti del Linguaggio Arduino (valori reali del core AVR) ------------
export const LOW = 0
export const HIGH = 1
export const INPUT = 0
export const OUTPUT = 1
export const INPUT_PULLUP = 2
/** LED integrato su Uno/Nano/Leonardo: pin digitale 13 (Language Reference). */
export const LED_BUILTIN = 13

export type PinMode = typeof INPUT | typeof OUTPUT | typeof INPUT_PULLUP
export type DigitalValue = typeof LOW | typeof HIGH

/** Snapshot serializzabile dello stato elettrico — per lifecycle suspend/restore. */
export interface ArduinoSnapshot {
  readonly v: 1
  readonly millis: number
  readonly modes: Readonly<Record<number, PinMode>>
  readonly levels: Readonly<Record<number, DigitalValue>>
}

function isPinMode(value: unknown): value is PinMode {
  return value === INPUT || value === OUTPUT || value === INPUT_PULLUP
}

function isDigitalValue(value: unknown): value is DigitalValue {
  return value === LOW || value === HIGH
}

function assertPin(pin: number): void {
  if (!Number.isInteger(pin) || pin < 0) throw new Error(`pin non valido: ${pin}`)
}

/**
 * Runtime AVR virtuale. Modella i due registri osservabili da uno sketch: la
 * direzione del pin (DDR, via pinMode) e il suo livello logico (PORT, via
 * digitalWrite). Il clock avanza SOLO con delay(): nessuna sorgente di tempo
 * reale, così il replay è deterministico (invariante MAESTRO sugli eventi).
 */
export class ArduinoRuntime {
  private _millis = 0
  private _modes = new Map<number, PinMode>()
  private _levels = new Map<number, DigitalValue>()

  /** pinMode(pin, mode): fissa la direzione del pin (default INPUT all'avvio). */
  pinMode(pin: number, mode: PinMode): void {
    assertPin(pin)
    if (!isPinMode(mode)) throw new Error(`mode non valido: ${String(mode)}`)
    this._modes.set(pin, mode)
    // INPUT_PULLUP attiva il pull-up interno: il livello a riposo è HIGH.
    if (mode === INPUT_PULLUP && !this._levels.has(pin)) this._levels.set(pin, HIGH)
  }

  /** modalità corrente del pin (INPUT di default, come il core all'avvio). */
  getMode(pin: number): PinMode {
    return this._modes.get(pin) ?? INPUT
  }

  /**
   * digitalWrite(pin, value): scrive il registro PORT. Book-accurate: su un pin
   * OUTPUT imposta la tensione (HIGH=5V/LOW=0V); su un pin INPUT abilita/disabilita
   * il pull-up. In entrambi i casi il valore è memorizzato; è la modalità a
   * decidere se un LED pilotato si accende (vedi isLit).
   */
  digitalWrite(pin: number, value: DigitalValue): void {
    assertPin(pin)
    if (!isDigitalValue(value)) throw new Error(`valore digitale non valido: ${String(value)}`)
    this._levels.set(pin, value)
  }

  /** digitalRead(pin): legge il livello logico corrente (LOW di default). */
  digitalRead(pin: number): DigitalValue {
    assertPin(pin)
    return this._levels.get(pin) ?? LOW
  }

  /**
   * Un LED pilotato sul pin è ACCESO solo se il pin è OUTPUT e il livello è HIGH.
   * Un HIGH su un pin INPUT abilita il pull-up ma NON accende un LED in uscita
   * (alta impedenza) — distinzione che il modello rende esplicita per la didattica.
   */
  isLit(pin: number): boolean {
    return this.getMode(pin) === OUTPUT && this.digitalRead(pin) === HIGH
  }

  /** delay(ms): blocca per ms millisecondi → avanza il clock virtuale. */
  delay(ms: number): void {
    if (!Number.isFinite(ms) || ms < 0 || !Number.isInteger(ms)) {
      throw new Error(`delay richiede un intero >= 0 (unsigned long), ricevuto: ${String(ms)}`)
    }
    this._millis += ms
  }

  /** millis(): millisecondi trascorsi dall'avvio dello sketch (clock virtuale). */
  millis(): number {
    return this._millis
  }

  snapshot(): ArduinoSnapshot {
    return {
      v: 1,
      millis: this._millis,
      modes: Object.fromEntries(this._modes),
      levels: Object.fromEntries(this._levels),
    }
  }

  /** Ricarica lo stato elettrico da uno snapshot (lifecycle restore). */
  restoreSnapshot(snap: ArduinoSnapshot): void {
    this._millis = snap.millis
    this._modes = new Map(Object.entries(snap.modes).map(([k, v]) => [Number(k), v]))
    this._levels = new Map(Object.entries(snap.levels).map(([k, v]) => [Number(k), v]))
  }
}

/** Forma di uno sketch Arduino: setup() una volta, loop() ripetuto in eterno. */
export interface Sketch {
  setup(rt: ArduinoRuntime): void
  /**
   * loop() come coroutine: ogni `yield ms` è una chiamata delay(ms). Tra due
   * yield i registri sono stabili, quindi lo scheduler può rispecchiare il LED
   * sulla lavagna a ogni confine — è così che un loop continuo diventa una
   * sequenza osservabile di transizioni discrete.
   */
  loop(rt: ArduinoRuntime): Generator<number, void, void>
}

/**
 * Esempio canonico Blink, fedele alla Language Reference:
 *   void setup() { pinMode(LED_BUILTIN, OUTPUT); }
 *   void loop()  { digitalWrite(LED_BUILTIN, HIGH); delay(1000);
 *                  digitalWrite(LED_BUILTIN, LOW);  delay(1000); }
 */
export const blinkSketch: Sketch = {
  setup(rt: ArduinoRuntime): void {
    rt.pinMode(LED_BUILTIN, OUTPUT)
  },
  *loop(rt: ArduinoRuntime): Generator<number, void, void> {
    rt.digitalWrite(LED_BUILTIN, HIGH)
    yield 1000
    rt.digitalWrite(LED_BUILTIN, LOW)
    yield 1000
  },
}

/**
 * Scheduler cooperativo: esegue setup() una volta, poi avanza loop() di un
 * confine delay() alla volta riavviandolo quando termina (loop() gira per
 * sempre). Mappa la natura continua del firmware su passi discreti osservabili.
 */
export class SketchScheduler {
  private _gen: Generator<number, void, void> | null = null
  private readonly _sketch: Sketch
  private readonly _rt: ArduinoRuntime

  constructor(sketch: Sketch, rt: ArduinoRuntime) {
    this._sketch = sketch
    this._rt = rt
    this._sketch.setup(this._rt)
  }

  /**
   * Avanza fino al prossimo confine delay(): esegue le istruzioni dello sketch,
   * applica il delay (clock avanza), e ritorna la durata appena trascorsa (ms).
   * I registri sono stabili per tutto l'intervallo restituito.
   */
  step(): number {
    // Riavvia loop() AL PIÙ una volta per chiamata: uno sketch che non chiama mai
    // delay() (es. `void loop(){}`) terminerebbe subito e ricorrerebbe all'infinito
    // (stack overflow). Due tentativi bastano: il generatore corrente, poi un
    // loop() fresco; se anche quello finisce senza yield, è un loop senza confini.
    for (let restart = 0; restart < 2; restart++) {
      if (this._gen === null) this._gen = this._sketch.loop(this._rt)
      const next = this._gen.next()
      if (next.done !== true) {
        this._rt.delay(next.value)
        return next.value
      }
      this._gen = null // loop() terminato → riparte dall'inizio
    }
    throw new Error("loop() non chiama mai delay(): nessun confine di esecuzione (loop infinito)")
  }

  /** Posizione del generatore NON serializzabile: il restore riparte loop() da capo. */
  reset(): void {
    this._gen = null
  }
}

/** Type-guard per uno snapshot ricevuto dal restore (state opaco dal host). */
export function isArduinoSnapshot(value: unknown): value is ArduinoSnapshot {
  if (typeof value !== "object" || value === null) return false
  const s = value as Record<string, unknown>
  return (
    s.v === 1 &&
    typeof s.millis === "number" &&
    typeof s.modes === "object" &&
    s.modes !== null &&
    typeof s.levels === "object" &&
    s.levels !== null
  )
}
