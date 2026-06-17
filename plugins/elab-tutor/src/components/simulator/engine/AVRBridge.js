/**
 * ELAB Simulator — AVRBridge
 * Wrapper per avr8js: emulazione ATmega328p + GPIO bridge
 * Lazy-loaded solo per esperimenti Vol3 (simulationMode: "avr")
 *
 * Dual-mode: Web Worker (preferred) or main-thread fallback.
 * Worker mode offloads CPU execution to keep UI responsive.
 * Public API is identical in both modes.
 *
 * © Andrea Marro — 12/02/2026
 */

import logger from '../../../utils/logger';

/**
 * AVRBridge — collega avr8js ai componenti del simulatore ELAB
 *
 * Flusso:
 * 1. Carica hex file → parse in flash memory
 * 2. Crea CPU ATmega328p + timer + GPIO
 * 3. Loop esecuzione: avrInstruction(cpu) + cpu.tick() in RAF (time-sliced)
 * 4. GPIO bridge: legge pin output → aggiorna stato componenti
 * 5. GPIO bridge: legge input componenti → scrive pin input
 */
class AVRBridge {
  constructor() {
    // Main-thread mode state
    this.cpu = null;
    this.timer0 = null;
    this.timer1 = null;
    this.timer2 = null;
    this.portB = null;  // D8-D13
    this.portC = null;  // A0-A7
    this.portD = null;  // D0-D7
    this.usart = null;  // Serial
    this.running = false;
    this.rafId = null;
    this.flash = null;
    this.onPinChange = null;    // callback: (pin, value) => void
    this.onSerialOutput = null; // callback: (char) => void
    this.serialBuffer = '';
    this.avr8jsLoaded = false;
    this.avr8js = null;         // modulo lazy-loaded
    this.PinState = null;       // PinState enum from avr8js
    this.cyclesPerFrame = 16000000 / 60; // 16MHz / 60fps
    this.MS_PER_FRAME = 8;      // max ms of CPU execution per RAF frame
    this._analogValues = {};     // channel → 0-1023 value for ADC
    this.avrInstruction = null;  // avrInstruction() from avr8js module
    this._externalOverrides = new Set(); // pins explicitly set by components (e.g. button press)

    // Worker mode state
    this._worker = null;
    this._useWorker = false;
    this._workerReady = false;
    this._workerPinStates = {};  // cached pin states from worker
    this._workerPWM = {};        // cached PWM duties from worker
    this._pendingHex = null;
    this._hexLoadResolve = null;
    this._hexLoadTimeoutId = null;
    this._workerHexLoadTimeoutMs = 10000;
    this._cachedBaudRate = null;
    this._baudRequestId = 0;
    this._lastBaudResponseId = 0;
    this._pendingBaudRequestId = null;
    this._baudRequestPending = false;
    this._baudRequestTimeoutId = null;
    this._workerBaudTimeoutMs = 400;

    // LCD HD44780 emulation state (4-bit mode)
    this._lcdState = {
      text: ['                ', '                '],
      cursorPos: { row: 0, col: 0 },
      cursorVisible: false,
      displayOn: true,
      backlight: true,
      _nibbleHigh: null,   // first nibble waiting for second
      _lastRS: 0,          // last RS value seen
      _lastE: 0,           // last E value (for edge detection)
      _lcdPins: null,      // { rs, e, d4, d5, d6, d7 } — Arduino pin numbers
    };

    // Servo state
    this._servoAngles = {};  // { [signalPin]: angle 0-180 }

    // BUG-E-07: Pending LCD config (applied before start)
    this._pendingLCDConfig = null;
  }

  // ─── Worker mode detection and initialization ─────────────────

  /**
   * Try to create a Web Worker for AVR execution.
   * Falls back to main-thread mode if Worker is unavailable.
   */
  _initWorker() {
    if (typeof Worker === 'undefined') {
      this._useWorker = false;
      return;
    }

    try {
      this._worker = new Worker(
        new URL('./avrWorker.js', import.meta.url),
        { type: 'module' }
      );

      this._worker.onmessage = (e) => this._handleWorkerMessage(e.data);

      this._worker.onerror = (err) => {
        this._useWorker = false;
        this._resetWorkerBaudTracking(true);
        if (this._worker) {
          this._worker.terminate();
          this._worker = null;
        }
        this._fallbackPendingHexLoadToMainThread();
      };

      this._useWorker = true;
    } catch (err) {
      logger.warn('[ELAB AVRBridge] Worker creation failed, using main thread:', err.message);
      this._useWorker = false;
      this._worker = null;
    }
  }

  /**
   * Handle messages from the Web Worker
   */
  _handleWorkerMessage(msg) {
    switch (msg.type) {
      case 'ready':
        this._workerReady = true;
        break;

      case 'hexLoaded':
        if (msg.success) {
          this._finalizePendingHexLoad(true);
        } else {
          // Worker hex load failed — fall back to main thread
          this._useWorker = false;
          this._resetWorkerBaudTracking(true);
          if (this._worker) {
            this._worker.terminate();
            this._worker = null;
          }
          this._fallbackPendingHexLoadToMainThread();
        }
        break;

      case 'pinChange':
        // CoVe Fix #12: Supporta sia messaggi batch (changes array) che singoli (pin/value)
        if (msg.changes && Array.isArray(msg.changes)) {
          // Nuovo formato batch - processa tutti i cambiamenti
          for (const change of msg.changes) {
            this._workerPinStates[`D${change.pin}`] = change.value;
            if (change.pin === 13) this._workerPinStates.d13Led = change.value;
            if (this.onPinChange) this.onPinChange(change.pin, change.value, change.state);
            // LCD pin edge detection
            this._checkLCDPinChange(change.pin, change.value);
          }
        } else if (msg.pin !== undefined) {
          // Vecchio formato singolo - retrocompatibilità
          this._workerPinStates[`D${msg.pin}`] = msg.value;
          if (msg.pin === 13) this._workerPinStates.d13Led = msg.value;
          if (this.onPinChange) this.onPinChange(msg.pin, msg.value, msg.state);
          this._checkLCDPinChange(msg.pin, msg.value);
        }
        break;

      case 'serialOutput':
        // CoVe Fix #8: Supporta sia messaggi singoli (char) che batch (text)
        if (msg.text) {
          // Nuovo formato batch
          this.serialBuffer += msg.text;
          if (this.onSerialOutput) {
            // Chiama callback per ogni carattere per retrocompatibilità
            for (const char of msg.text) {
              this.onSerialOutput(char);
            }
          }
        } else if (msg.char) {
          // Vecchio formato singolo
          this.serialBuffer += msg.char;
          if (this.onSerialOutput) this.onSerialOutput(msg.char);
        }
        break;

      case 'pwm':
        this._workerPWM = msg.duties || {};
        // Update servo angles from PWM
        this._updateServoAnglesFromPWM(this._workerPWM);
        break;

      case 'pinStates':
        this._workerPinStates = msg.states || {};
        break;

      case 'baudRate':
        if (typeof msg.requestId === 'number' && msg.requestId < this._lastBaudResponseId) {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          break;
        }
        if (typeof msg.requestId === 'number') {
          this._lastBaudResponseId = msg.requestId;
        }
        this._cachedBaudRate = this._normalizeBaudRate(msg.baud);
        if (typeof msg.requestId === 'number') {
          if (msg.requestId === this._pendingBaudRequestId) {
            this._pendingBaudRequestId = null;
            this._baudRequestPending = false;
            this._clearBaudRequestTimeout();
          }
        } else {
          this._pendingBaudRequestId = null;
          this._baudRequestPending = false;
          this._clearBaudRequestTimeout();
        }
        break;

      case 'error':
        break;
    }
  }

  // ─── Lazy-load avr8js ─────────────────────────────────────────

  /**
   * Lazy-load avr8js module
   * Solo chiamato quando serve (Vol3)
   */
  async loadAVR8js() {
    if (this.avr8jsLoaded) return;

    try {
      // Dynamic import — non incluso nel bundle di Vol1/Vol2
      this.avr8js = await import('avr8js');
      this.PinState = this.avr8js.PinState;
      this.avrInstruction = this.avr8js.avrInstruction;
      this.avr8jsLoaded = true;
    } catch (err) {
      logger.warn('[ELAB AVRBridge] avr8js non disponibile:', err.message);
      this.avr8jsLoaded = false;
    }
  }

  // ─── Hex loading ──────────────────────────────────────────────

  /**
   * Carica un file .hex e prepara la CPU
   * @param {string} hexUrl — URL del file hex (es. "/hex/v3-cap6-blink.hex")
   */
  async loadHex(hexUrl) {
    // Fetch hex text first (always on main thread)
    let hexText;
    try {
      const response = await fetch(hexUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      hexText = await response.text();
    } catch (err) {
      logger.error('[ELAB AVRBridge] Errore fetch hex:', err);
      return false;
    }

    return this.loadHexFromString(hexText);
  }

  /**
   * Carica un hex da stringa (compilazione live) e re-inizializza la CPU.
   * Chiamato dopo compilazione reale via backend/arduino-cli.
   * @param {string} hexText — contenuto del file .hex (Intel HEX format)
   * @returns {boolean} true se caricamento riuscito
   */
  async loadHexFromString(hexText) {
    // Try Worker mode first
    if (!this._worker && !this._useWorker) {
      this._initWorker();
    }

    if (this._useWorker && this._worker) {
      return this._loadHexWorker(hexText);
    }

    // Main-thread fallback
    return this._loadHexMainThread(hexText);
  }

  /**
   * Load hex via Worker
   */
  async _loadHexWorker(hexText) {
    this.pause();
    this.serialBuffer = '';
    this._resetWorkerBaudTracking(true);
    this._workerPinStates = {};
    this._workerPWM = {};
    this._lcdState._nibbleHigh = null;
    this._servoAngles = {};

    // Save hex for main-thread retry if worker fails
    this._pendingHex = hexText;

    if (this._hexLoadResolve) {
      this._finalizePendingHexLoad(false);
    }

    return new Promise((resolve) => {
      this._hexLoadResolve = resolve;
      this._hexLoadTimeoutId = setTimeout(() => {
        this._useWorker = false;
        this._resetWorkerBaudTracking(true);
        if (this._worker) {
          this._worker.terminate();
          this._worker = null;
        }
        this._fallbackPendingHexLoadToMainThread();
      }, this._workerHexLoadTimeoutMs);
      try {
        this._worker.postMessage({ type: 'loadHex', hexText });
      } catch (err) {
        logger.warn('[ELAB AVRBridge] Worker postMessage failed, retrying on main thread:', err?.message || err);
        this._useWorker = false;
        this._resetWorkerBaudTracking(true);
        if (this._worker) {
          this._worker.terminate();
          this._worker = null;
        }
        this._fallbackPendingHexLoadToMainThread();
      }
    });
  }

  _clearHexLoadTimeout() {
    if (this._hexLoadTimeoutId) {
      clearTimeout(this._hexLoadTimeoutId);
      this._hexLoadTimeoutId = null;
    }
  }

  _normalizeBaudRate(baud) {
    const parsed = Number(baud);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }
    return Math.round(parsed);
  }

  _clearBaudRequestTimeout() {
    if (this._baudRequestTimeoutId) {
      clearTimeout(this._baudRequestTimeoutId);
      this._baudRequestTimeoutId = null;
    }
  }

  _resetWorkerBaudTracking(resetCache = true) {
    this._clearBaudRequestTimeout();
    this._pendingBaudRequestId = null;
    this._baudRequestPending = false;
    if (resetCache) {
      this._cachedBaudRate = null;
    }
  }

  _requestWorkerBaudRate() {
    if (!this._useWorker || !this._worker || this._baudRequestPending) {
      return;
    }

    const requestId = ++this._baudRequestId;
    this._pendingBaudRequestId = requestId;
    this._baudRequestPending = true;
    this._clearBaudRequestTimeout();
    this._baudRequestTimeoutId = setTimeout(() => {
      if (this._pendingBaudRequestId === requestId) {
        this._pendingBaudRequestId = null;
        this._baudRequestPending = false;
      }
      this._baudRequestTimeoutId = null;
    }, this._workerBaudTimeoutMs);
    this._worker.postMessage({ type: 'getBaudRate', requestId });
  }

  _finalizePendingHexLoad(result) {
    this._clearHexLoadTimeout();
    if (this._hexLoadResolve) {
      const resolve = this._hexLoadResolve;
      this._hexLoadResolve = null;
      resolve(Boolean(result));
    }
    this._pendingHex = null;
  }

  _fallbackPendingHexLoadToMainThread() {
    this._clearHexLoadTimeout();
    const resolve = this._hexLoadResolve;
    const hex = this._pendingHex;
    this._hexLoadResolve = null;
    this._pendingHex = null;

    if (!resolve) return;
    if (!hex) {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      resolve(false);
      return;
    }

    this._loadHexMainThread(hex)
      .then(resolve)
      .catch(() => resolve(false));
  }

  /**
   * Load hex on main thread (original behavior)
   */
  async _loadHexMainThread(hexText) {
    await this.loadAVR8js();

    if (!this.avr8jsLoaded || !this.avr8js) {
      return false;
    }

    try {
      // Stop running CPU first
      this.pause();

      // Config objects sono export del modulo avr8js, NON proprieta CPU
      const {
        CPU, AVRTimer, AVRIOPort, AVRUSART,
        timer0Config, timer1Config, timer2Config,
        portBConfig, portCConfig, portDConfig,
        usart0Config
      } = this.avr8js;

      // Preserve callbacks
      const savedOnPinChange = this.onPinChange;
      const savedOnSerialOutput = this.onSerialOutput;

      // Cleanup old peripherals to avoid stale references / GC delays
      this.timer0 = null;
      this.timer1 = null;
      this.timer2 = null;
      this.portB = null;
      this.portC = null;
      this.portD = null;
      this.usart = null;
      this.cpu = null;

      // Create fresh flash + CPU
      this.flash = new Uint16Array(16384);
      this._parseIntelHex(hexText, this.flash);
      this.cpu = new CPU(this.flash);

      // Re-initialize peripherals (config objects dal modulo, non dalla CPU)
      this.timer0 = new AVRTimer(this.cpu, timer0Config);
      this.timer1 = new AVRTimer(this.cpu, timer1Config);
      this.timer2 = new AVRTimer(this.cpu, timer2Config);
      this.portB = new AVRIOPort(this.cpu, portBConfig);
      this.portC = new AVRIOPort(this.cpu, portCConfig);
      this.portD = new AVRIOPort(this.cpu, portDConfig);
      this.usart = new AVRUSART(this.cpu, usart0Config, 16000000);

      // Restore callbacks
      this.onPinChange = savedOnPinChange;
      this.onSerialOutput = savedOnSerialOutput;

      // Re-attach serial handler
      this.usart.onByteTransmit = (byte) => {
        const char = String.fromCharCode(byte);
        this.serialBuffer += char;
        if (this.onSerialOutput) this.onSerialOutput(char);
      };

      // Re-attach GPIO listeners
      this.portB.addListener(() => this._handlePinChange('B'));
      this.portC.addListener(() => this._handlePinChange('C'));
      this.portD.addListener(() => this._handlePinChange('D'));

      // Pull-up simulation: auto-set HIGH for INPUT_PULLUP pins
      this._setupPullUpSimulation();
      this._externalOverrides.clear();

      // Re-hook ADC
      this._hookADC();

      // Clear serial buffer + LCD + Servo
      this.serialBuffer = '';
      this._cachedBaudRate = null;
      this._analogValues = {};
      this._lcdState._nibbleHigh = null;
      this._servoAngles = {};

      return true;
    } catch (err) {
      logger.error('[ELAB AVRBridge] Errore loadHexFromString:', err);
      return false;
    }
  }

  // ─── ADC Hook ─────────────────────────────────────────────────

  /**
   * Hook into the ADC conversion to supply analog values
   * ATmega328p ADC registers: ADMUX (0x7C), ADCSRA (0x7A), ADCL (0x78), ADCH (0x79)
   */
  _hookADC() {
    if (!this.cpu) return;

    // Watch ADCSRA writes to detect ADC conversion start
    const ADCSRA = 0x7A;
    const ADMUX = 0x7C;
    const ADCL = 0x78;
    const ADCH = 0x79;

    // Use writeHooks to intercept ADC start conversion (ADSC bit)
    this.cpu.writeHooks[ADCSRA] = (value) => {
      if (value & 0x40) { // ADSC bit set — start conversion
        const mux = this.cpu.data[ADMUX] & 0x0F; // channel 0-7
        const analogValue = this._analogValues[mux] || 0; // 0-1023

        // Write result to ADC data registers
        this.cpu.data[ADCL] = analogValue & 0xFF;
        this.cpu.data[ADCH] = (analogValue >> 8) & 0x03;

        // Clear ADSC, set ADIF (conversion complete)
        this.cpu.data[ADCSRA] = (value & ~0x40) | 0x10;

        return true; // handled
      }
      return false;
    };
  }

  // ─── Analog / Pin I/O ─────────────────────────────────────────

  /**
   * Set analog value for a channel (called from simulator when pot changes)
   * @param {number} channel — ADC channel (0-7, maps to A0-A7)
   * @param {number} value — 0-1023
   */
  setAnalogValue(channel, value) {
    const clamped = Math.max(0, Math.min(1023, Math.round(value)));

    if (this._useWorker && this._worker) {
      this._worker.postMessage({ type: 'setAnalog', channel, value: clamped });
    }

    this._analogValues[channel] = clamped;
  }

  /**
   * Parse Intel HEX format in flash array
   */
  _parseIntelHex(hex, flash) {
    const lines = hex.split('\n').filter(l => l.startsWith(':'));
    for (const line of lines) {
      const byteCount = parseInt(line.substr(1, 2), 16);
      const address = parseInt(line.substr(3, 4), 16);
      const recordType = parseInt(line.substr(7, 2), 16);

      if (recordType === 0) { // Data record
        for (let i = 0; i < byteCount; i += 2) {
          const low = parseInt(line.substr(9 + i * 2, 2), 16);
          const high = parseInt(line.substr(11 + i * 2, 2), 16);
          const wordAddress = (address + i) / 2;
          if (wordAddress < flash.length) {
            flash[wordAddress] = (high << 8) | low;
          }
        }
      }
    }
  }

  /**
   * Handler cambio pin GPIO → notifica componenti
   */
  _handlePinChange(port) {
    if (!this.onPinChange) return;

    const portObj = port === 'B' ? this.portB : port === 'C' ? this.portC : this.portD;
    if (!portObj) return;

    for (let bit = 0; bit < 8; bit++) {
      const state = portObj.pinState(bit);
      // Use PinState enum for proper comparison
      const value = this.PinState
        ? (state === this.PinState.High || state === this.PinState.InputPullUp ? 1 : 0)
        : ((state >> 0) & 1); // fallback
      let arduinoPin;

      if (port === 'B') arduinoPin = 8 + bit;       // PB0=D8 ... PB5=D13
      else if (port === 'C') arduinoPin = 14 + bit;  // PC0=A0 ... PC7=A7
      else arduinoPin = bit;                           // PD0=D0 ... PD7=D7

      this.onPinChange(arduinoPin, value, state);

      // LCD pin edge detection (main-thread mode)
      this._checkLCDPinChange(arduinoPin, value);
    }
  }

  /**
   * Simulate INPUT_PULLUP behavior.
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
   * In real hardware, enabling INPUT_PULLUP pulls the pin HIGH via internal resistor.
   * avr8js doesn't do this automatically — pinValue defaults to 0, so digitalRead()
   * returns LOW even with pull-up enabled. We hook into port register writes to detect
   * when a pin becomes INPUT_PULLUP and set external input HIGH (unless a component
   * like a pressed button is actively driving it LOW).
   */
  _setupPullUpSimulation() {
    if (!this.cpu || !this.PinState) return;

    const ports = [
      { port: this.portD, offset: 0 },   // D0-D7
      { port: this.portB, offset: 8 },   // D8-D13
      { port: this.portC, offset: 14 },  // A0-A7
    ];

    for (const { port, offset } of ports) {
      if (!port) continue;
      port.addListener(() => {
        for (let bit = 0; bit < 8; bit++) {
          const arduinoPin = offset + bit;
          const state = port.pinState(bit);
          if (state === this.PinState.InputPullUp) {
            // Pin is INPUT_PULLUP — if no external override is forcing it LOW, set it HIGH
            if (!this._externalOverrides.has(arduinoPin)) {
              port.setPin(bit, true); // simulate pull-up: external input = HIGH
            }
          }
        }
      });
    }
  }

  /**
   * Scrivi un valore su un pin di input (da componente → CPU)
   * @param {number} arduinoPin — numero pin Arduino (0-19)
   * @param {number} value — 0 o 1 (digitale) oppure 0-1023 (analogico via setAnalogValue)
   */
  setInputPin(arduinoPin, value) {
    if (this._useWorker && this._worker) {
      this._worker.postMessage({ type: 'setPin', arduinoPin, value });
      return;
    }

    if (!this.cpu) return;

    // Track external overrides (e.g. button press sets pin LOW)
    if (value === 0 || value === false) {
      this._externalOverrides.add(arduinoPin);
    } else {
      this._externalOverrides.delete(arduinoPin);
    }

    if (arduinoPin >= 14) {
      // Pin analogico (A0-A7) — always update ADC channel + digital pin
      const channel = arduinoPin - 14;
      // Always set the analog value for ADC reads (analogRead)
      this.setAnalogValue(channel, typeof value === 'number' ? value : (value ? 1023 : 0));
      // Also set the digital pin state for digitalRead
      if (this.portC) {
        this.portC.setPin(channel, value ? true : false);
      }
    } else if (arduinoPin >= 8) {
      // Port B (D8-D13)
      if (this.portB) {
        this.portB.setPin(arduinoPin - 8, value ? true : false);
      }
    } else {
      // Port D (D0-D7)
      if (this.portD) {
        this.portD.setPin(arduinoPin, value ? true : false);
      }
    }
  }

  /**
   * Leggi lo stato di un pin di output
   * @param {number} arduinoPin
   * @returns {number} 0 o 1
   */
  readOutputPin(arduinoPin) {
    if (this._useWorker) {
      return this._workerPinStates[`D${arduinoPin}`] || 0;
    }

    if (!this.cpu) return 0;

    const readPin = (portObj, bit) => {
      if (!portObj) return 0;
      const state = portObj.pinState(bit);
      if (this.PinState) {
        return (state === this.PinState.High || state === this.PinState.InputPullUp) ? 1 : 0;
      }
      return (state >> 0) & 1;
    };

    if (arduinoPin >= 8 && arduinoPin <= 13) {
      return readPin(this.portB, arduinoPin - 8);
    } else if (arduinoPin >= 0 && arduinoPin <= 7) {
      return readPin(this.portD, arduinoPin);
    }
    return 0;
  }

  // ─── Execution control ────────────────────────────────────────

  /**
   * Avvia esecuzione CPU — time-sliced per non bloccare il main thread
   * In Worker mode: sends 'start' message to worker
   * In main-thread mode: runs via MessageChannel (non-throttled)
   *
   * BUG-E-07 fix: configureLCDPins() MUST be called before start().
   * We apply any pending LCD config before sending 'start' to the worker,
   * so _checkLCDPinChange() will have _lcdPins set when pin changes arrive.
   */
  start() {
    if (this.running) return;

    // BUG-E-07: Apply pending LCD configuration before starting execution
    if (this._pendingLCDConfig && !this._lcdState._lcdPins) {
      this.configureLCDPins(this._pendingLCDConfig);
      this._pendingLCDConfig = null;
    }

    if (this._useWorker && this._worker) {
      this.running = true;
      this._worker.postMessage({ type: 'start' });
      return;
    }

    // Main-thread fallback
    if (!this.cpu) return;
    if (!this.avrInstruction) {
      return;
    }
    this.running = true;

    const execInstruction = this.avrInstruction;
    const cpu = this.cpu;
    const CYCLES_PER_MS = 16000; // 16MHz clock

    // Salva il wall-clock start e il conteggio cicli iniziale per il throttle
    const startWall = performance.now();
    const startCycles = Number(cpu.cycles);

    // MessageChannel per scheduling non-throttled
    this._channel = new MessageChannel();

    this._channel.port1.onmessage = () => {
      if (!this.running) return;

      try {
        const now = performance.now();
        const elapsedMs = now - startWall;
        const targetCycles = startCycles + (elapsedMs * CYCLES_PER_MS);
        const currentCycles = Number(cpu.cycles);

        // Se siamo avanti rispetto al tempo reale, saltiamo questo frame
        if (currentCycles >= targetCycles) {
          // Schedule prossimo check dopo 1ms (non bruciamo CPU inutilmente)
          this._throttleTimer = setTimeout(() => {
            if (this.running && this._channel) {
              this._channel.port2.postMessage(null);
            }
          }, 1);
          return;
        }

        // Esegui istruzioni fino a raggiungere il target o esaurire il time-slice
        const deadline = now + this.MS_PER_FRAME;
        const batchSize = 1000;

        while (performance.now() < deadline && Number(cpu.cycles) < targetCycles) {
          for (let i = 0; i < batchSize; i++) {
            execInstruction(cpu);
            cpu.tick();
          }
        }
      } catch (err) {
        logger.error('[ELAB AVRBridge] CPU tick error:', err.message);
        this.running = false;
        return;
      }

      // Schedule next frame via MessageChannel (non-throttled)
      this._channel.port2.postMessage(null);
    };

    // Kick off the first iteration
    this._channel.port2.postMessage(null);
  }

  /**
   * Pausa esecuzione
   */
  pause() {
    this.running = false;

    if (this._useWorker && this._worker) {
      this._worker.postMessage({ type: 'stop' });
      return;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    }

    if (this._throttleTimer) {
      clearTimeout(this._throttleTimer);
      this._throttleTimer = null;
    }
    if (this._channel) {
      this._channel.port1.close();
      this._channel.port2.close();
      this._channel = null;
    }
  }

  /**
   * Reset CPU
   */
  reset() {
    this.pause();
    this._resetWorkerBaudTracking(true);

    if (this._useWorker && this._worker) {
      // Worker doesn't have a reset message — reload hex would be needed
      this._workerPinStates = {};
      this._workerPWM = {};
    } else if (this.cpu) {
      try {
        this.cpu.reset();
      } catch (_) {
        // avr8js versions may not have reset()
        // Reinitialize CPU from flash
        if (this.flash && this.avr8js) {
          this.cpu = new this.avr8js.CPU(this.flash);
        }
      }
    }

    this.serialBuffer = '';
    this._analogValues = {};
    this._externalOverrides.clear();
    this._lcdState._nibbleHigh = null;
    this._servoAngles = {};
  }

  // ─── PWM ──────────────────────────────────────────────────────

  /**
   * Read PWM duty cycle for a given Arduino pin (0.0 – 1.0).
   * Returns null if the pin is not in PWM mode.
   *
   * PWM pins and their timer registers (ATmega328p):
   *  D3  → Timer2 OC2B  (TCCR2A COM2B1, OCR2B 0xB4)
   *  D5  → Timer0 OC0B  (TCCR0A COM0B1, OCR0B 0x48)
   *  D6  → Timer0 OC0A  (TCCR0A COM0A1, OCR0A 0x47)
   *  D9  → Timer1 OC1A  (TCCR1A COM1A1, OCR1AL 0x88)  — 16-bit but analogWrite uses 8-bit
   *  D10 → Timer1 OC1B  (TCCR1A COM1B1, OCR1BL 0x8A)  — 16-bit
   *  D11 → Timer2 OC2A  (TCCR2A COM2A1, OCR2A 0xB3)
   */
  getPWMDutyCycle(arduinoPin) {
    if (this._useWorker) {
      const duty = this._workerPWM[arduinoPin];
      return duty !== undefined ? duty : null;
    }

    if (!this.cpu) return null;
    const d = this.cpu.data;

    // Timer register addresses
    // CoVe Fix #2: Aggiunti indirizzi high byte per Timer1 (OCR 16-bit)
    const TCCR0A = 0x44, OCR0A = 0x47, OCR0B = 0x48;
    const TCCR1A = 0x80, OCR1AL = 0x88, OCR1BL = 0x8A;
    const OCR1AH = 0x89, OCR1BH = 0x8B; // High bytes per Timer1
    const TCCR2A = 0xB0, OCR2A = 0xB3, OCR2B = 0xB4;

    switch (arduinoPin) {
      case 3: // Timer2 OC2B
        if (d[TCCR2A] & 0x20) return d[OCR2B] / 255; // COM2B1 bit
        return null;
      case 5: // Timer0 OC0B
        if (d[TCCR0A] & 0x20) return d[OCR0B] / 255; // COM0B1 bit
        return null;
      case 6: // Timer0 OC0A
        if (d[TCCR0A] & 0x80) return d[OCR0A] / 255; // COM0A1 bit
        return null;
      case 9: { // Timer1 OC1A
        if (d[TCCR1A] & 0x80) { // COM1A1 bit
          const ocr1a = (d[OCR1AH] << 8) | d[OCR1AL]; // Leggi 16-bit completo
          return (ocr1a & 0xFF) / 255; // Usa byte basso per analogWrite
        }
        return null;
      }
      case 10: { // Timer1 OC1B
        if (d[TCCR1A] & 0x20) { // COM1B1 bit
          const ocr1b = (d[OCR1BH] << 8) | d[OCR1BL]; // Leggi 16-bit completo
          return (ocr1b & 0xFF) / 255; // Usa byte basso per analogWrite
        }
        return null;
      }
      case 11: // Timer2 OC2A
        if (d[TCCR2A] & 0x80) return d[OCR2A] / 255; // COM2A1 bit
        return null;
      default:
        return null;
    }
  }

  /**
   * Get all PWM duty cycles for pins that are currently in PWM mode.
   * @returns {Object} e.g. { 3: 0.5, 9: 0.75 } — only PWM-active pins included
   */
  getAllPWMDutyCycles() {
    if (this._useWorker) {
      return { ...this._workerPWM };
    }

    const pwmPins = [3, 5, 6, 9, 10, 11];
    const result = {};
    for (const pin of pwmPins) {
      const duty = this.getPWMDutyCycle(pin);
      if (duty !== null) {
        result[pin] = duty;
      }
    }
    return result;
  }

  /**
   * Ottieni lo stato corrente di tutti i pin Arduino
   * @returns {Object} { D0: 0|1, D1: 0|1, ..., D13: 0|1, _pwm: { 3: 0.5, ... } }
   */
  getPinStates() {
    if (this._useWorker) {
      return {
        ...this._workerPinStates,
        _pwm: { ...this._workerPWM },
      };
    }

    const states = {};

    // Digital pins
    for (let i = 0; i <= 13; i++) {
      states[`D${i}`] = this.readOutputPin(i);
    }

    // LED D13 (built-in)
    states.d13Led = this.readOutputPin(13);

    // PWM duty cycles
    states._pwm = this.getAllPWMDutyCycles();

    return states;
  }

  /**
   * Leggi il baud rate configurato dallo sketch via UBRR0 register.
   * Formula: baud = F_CPU / (16 * (UBRR + 1))  per U2X0=0
   *          baud = F_CPU / (8  * (UBRR + 1))  per U2X0=1
   * @returns {number|null} baud rate o null se non configurato
   */
  getConfiguredBaudRate() {
    if (this._useWorker && this._worker) {
      this._requestWorkerBaudRate();
      return this._cachedBaudRate;
    }

    if (!this.cpu) return null;
    const UBRR0L = 0xC4;
    const UBRR0H = 0xC5;
    const UCSR0A = 0xC0;
    const ubrrVal = (this.cpu.data[UBRR0H] << 8) | this.cpu.data[UBRR0L];
    if (ubrrVal === 0) return null; // not yet configured
    const u2x = (this.cpu.data[UCSR0A] & 0x02) ? 1 : 0;
    const divisor = u2x ? 8 : 16;
    return Math.round(16000000 / (divisor * (ubrrVal + 1)));
  }

  // ─── Serial ───────────────────────────────────────────────────

  /**
   * Invia dati alla Serial (input utente → CPU)
   * @param {string} text
   */
  serialWrite(text) {
    if (this._useWorker && this._worker) {
      this._worker.postMessage({ type: 'serialInput', text });
      return;
    }

    if (!this.usart) return;
    for (const char of text) {
      this.usart.writeByte(char.charCodeAt(0));
    }
  }

  /**
   * Ottieni e svuota il buffer serial
   * @returns {string}
   */
  getSerialBuffer() {
    const buf = this.serialBuffer;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    this.serialBuffer = '';
    return buf;
  }

  // ─── Servo Motor support ──────────────────────────────────────

  /**
   * Get servo angle for a given signal pin.
   * Servo uses 50Hz PWM: pulse width 1ms (0°) to 2ms (180°) in a 20ms period.
   * Duty cycle: 0.05 (1ms/20ms) = 0°, 0.10 (2ms/20ms) = 180°
   *
   * @param {number} signalPin — Arduino pin number (typically 9 or 10)
   * @returns {number|null} angle 0-180 or null if not in servo-compatible PWM
   */
  getServoAngle(signalPin) {
    return this._servoAngles[signalPin] !== undefined ? this._servoAngles[signalPin] : null;
  }

  /**
   * Get all servo angles
   * @returns {Object} e.g. { 9: 90, 10: 45 }
   */
  getAllServoAngles() {
    return { ...this._servoAngles };
  }

  /**
   * Update servo angles from PWM duty cycles.
   * Called from main-thread PWM reads or worker PWM messages.
   * Standard Arduino Servo: 50Hz PWM, pulse width 544-2400 microseconds.
   * In a 20ms period: 544us = duty 0.0272, 2400us = duty 0.12
   * Formula: angle = map(pulseWidth, 544, 2400, 0, 180)
   */
  _updateServoAnglesFromPWM(duties) {
    // Servo typically uses Timer1 pins: D9 (OC1A) or D10 (OC1B)
    // But we check all PWM pins for flexibility
    const MIN_DUTY = 544 / 20000;   // 0.0272 — 544us / 20ms period
    const MAX_DUTY = 2400 / 20000;  // 0.12   — 2400us / 20ms period

    for (const [pin, duty] of Object.entries(duties)) {
      const pinNum = Number(pin);
      // Only treat as servo if duty is in servo range
      // Normal analogWrite(128) = 0.502 — way outside servo range
      if (duty >= MIN_DUTY * 0.9 && duty <= MAX_DUTY * 1.1) {
        // Clamp duty to valid range, then map to 0-180 degrees
        const clampedDuty = Math.max(MIN_DUTY, Math.min(MAX_DUTY, duty));
        const angle = ((clampedDuty - MIN_DUTY) / (MAX_DUTY - MIN_DUTY)) * 180;
        this._servoAngles[pinNum] = Math.round(Math.max(0, Math.min(180, angle)));
      }
    }
  }

  // ─── LCD HD44780 emulation (4-bit mode) ───────────────────────

  /**
   * Configure which Arduino pins are connected to the LCD.
   * Must be called before simulation starts for LCD to work.
   * @param {Object} pinMapping — { rs, e, d4, d5, d6, d7 } Arduino pin numbers
   */
  configureLCDPins(pinMapping) {
    this._lcdState._lcdPins = pinMapping;
    // BUG-E-07: Store config so start() can re-apply if needed
    this._pendingLCDConfig = pinMapping;
    // Reset LCD state
    this._lcdState.text = ['                ', '                '];
    this._lcdState.cursorPos = { row: 0, col: 0 };
    this._lcdState._nibbleHigh = null;
    this._lcdState.displayOn = true;
    this._lcdState.cursorVisible = false;
  }

  /**
   * Check if a pin change affects the LCD (E pin falling edge).
   * Called from both main-thread and worker mode pin change handlers.
   */
  _checkLCDPinChange(arduinoPin, value) {
    const pins = this._lcdState._lcdPins;
    if (!pins) return;

    // Only care about E pin transitions
    if (arduinoPin !== pins.e) {
      // Track pin values for reading later
      if (arduinoPin === pins.rs) this._lcdState._lastRS = value;
      return;
    }

    const prevE = this._lcdState._lastE;
    this._lcdState._lastE = value;

    // Detect HIGH → LOW falling edge on E pin
    if (prevE === 1 && value === 0) {
      this._lcdOnEFallingEdge();
    }
  }

  /**
   * Handle E pin falling edge — read nibble from D4-D7
   */
  _lcdOnEFallingEdge() {
    const pins = this._lcdState._lcdPins;
    if (!pins) return;

    // Read D4-D7 values
    const d4 = this.readOutputPin(pins.d4);
    const d5 = this.readOutputPin(pins.d5);
    const d6 = this.readOutputPin(pins.d6);
    const d7 = this.readOutputPin(pins.d7);
    const nibble = (d7 << 3) | (d6 << 2) | (d5 << 1) | d4;
    const rs = this._lcdState._lastRS;

    if (this._lcdState._nibbleHigh === null) {
      // First nibble (high nibble)
      this._lcdState._nibbleHigh = nibble;
    } else {
      // Second nibble (low nibble) — assemble full byte
      const byte = (this._lcdState._nibbleHigh << 4) | nibble;
      this._lcdState._nibbleHigh = null;

      if (rs === 0) {
        this._lcdProcessCommand(byte);
      } else {
        this._lcdProcessData(byte);
      }
    }
  }

  /**
   * Process LCD command byte (RS=0)
   */
  _lcdProcessCommand(byte) {
    if (byte === 0x01) {
      // Clear display
      this._lcdState.text = ['                ', '                '];
      this._lcdState.cursorPos = { row: 0, col: 0 };
    } else if (byte === 0x02) {
      // Return home
      this._lcdState.cursorPos = { row: 0, col: 0 };
    } else if ((byte & 0xF8) === 0x08) {
      // Display on/off control: 0x08-0x0F
      this._lcdState.displayOn = !!(byte & 0x04);
      this._lcdState.cursorVisible = !!(byte & 0x02);
    } else if (byte & 0x80) {
      // Set DDRAM address (set cursor position)
      const addr = byte & 0x7F;
      if (addr >= 0x40) {
        this._lcdState.cursorPos = { row: 1, col: Math.min(15, addr - 0x40) };
      } else {
        this._lcdState.cursorPos = { row: 0, col: Math.min(15, addr) };
      }
    }
    // Other commands (entry mode, shift, function set) — no-op for basic simulation
  }

  /**
   * Process LCD data byte (RS=1) — write character at cursor
   */
  _lcdProcessData(byte) {
    const { row, col } = this._lcdState.cursorPos;
    if (row >= 0 && row <= 1 && col >= 0 && col <= 15) {
      const char = (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : ' ';
      const line = this._lcdState.text[row].split('');
      line[col] = char;
      this._lcdState.text[row] = line.join('');

      // Advance cursor
      if (col < 15) {
        this._lcdState.cursorPos.col = col + 1;
      } else if (row === 0) {
        this._lcdState.cursorPos = { row: 1, col: 0 };
      }
    }
  }

  /**
   * Get current LCD display state
   * @returns {Object} { text: [row0, row1], cursorPos, cursorVisible, displayOn, backlight }
   */
  getLCDState() {
    return {
      text: [...this._lcdState.text],
      cursorPos: { ...this._lcdState.cursorPos },
      cursorVisible: this._lcdState.cursorVisible,
      displayOn: this._lcdState.displayOn,
      backlight: this._lcdState.backlight,
    };
  }

  // ─── Cleanup ──────────────────────────────────────────────────

  /**
   * Distruggi (cleanup)
   */
  destroy() {
    this.pause();
    this._resetWorkerBaudTracking(true);

    // Terminate worker if active
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      this._useWorker = false;
      this._workerReady = false;
    }

    this.cpu = null;
    this.timer0 = null;
    this.timer1 = null;
    this.timer2 = null;
    this.portB = null;
    this.portC = null;
    this.portD = null;
    this.usart = null;
    this.flash = null;
    this.onPinChange = null;
    this.onSerialOutput = null;
    this.serialBuffer = '';
    this.PinState = null;
    this._analogValues = {};
    this._workerPinStates = {};
    this._workerPWM = {};
    this._servoAngles = {};
    this._lcdState = {
      text: ['                ', '                '],
      cursorPos: { row: 0, col: 0 },
      cursorVisible: false,
      displayOn: true,
      backlight: true,
      _nibbleHigh: null,
      _lastRS: 0,
      _lastE: 0,
      _lcdPins: null,
    };
  }
}

export default AVRBridge;
