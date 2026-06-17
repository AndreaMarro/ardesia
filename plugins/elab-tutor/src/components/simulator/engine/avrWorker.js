// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
/**
 * ELAB Simulator — AVR Web Worker
 * Runs ATmega328p CPU emulation off the main thread via avr8js.
 * Communicates with AVRBridge through postMessage protocol.
 *
 * Main→Worker messages:
 *   { type: 'loadHex', hexText: string }
 *   { type: 'start' }
 *   { type: 'stop' }
 *   { type: 'setPin', arduinoPin: number, value: number }
 *   { type: 'setAnalog', channel: number, value: number }
 *   { type: 'serialInput', text: string }
 *   { type: 'getBaudRate', requestId?: number }
 *
 * Worker→Main messages:
 *   { type: 'ready' }
 *   { type: 'hexLoaded', success: boolean }
 *   { type: 'pinChange', pin: number, value: number }
 *   { type: 'serialOutput', char: string }
 *   { type: 'pwm', duties: { [pin]: number } }
 *   { type: 'pinStates', states: { [key]: number } }
 *   { type: 'baudRate', baud: number|null, requestId?: number|null }
 *   { type: 'error', message: string }
 *
 * © Andrea Marro — 12/02/2026
 */

let avr8js = null;
let cpu = null;
let timer0 = null;
let timer1 = null;
let timer2 = null;
let portB = null; // D8-D13
let portC = null; // A0-A7
let portD = null; // D0-D7
let usart = null;
let flash = null;
let running = false;
let PinState = null;
let avrInstruction = null;
const analogValues = {};
const externalOverrides = new Set();

// Batching: accumulate pin changes and send every 8ms (125fps) to capture fast pulses
let pinChangeBatch = {};
let pinBatchTimer = null;
const PIN_BATCH_INTERVAL = 8;

// PWM: send duty cycles every 50ms
let pwmTimer = null;
const PWM_INTERVAL = 50;

// CoVe Fix #8: Serial output buffering - accumula caratteri e flush ogni 16ms
let serialOutputBuffer = '';
let serialFlushTimer = null;
const SERIAL_FLUSH_INTERVAL = 16; // ~60fps

// Throttle for CPU execution
const CYCLES_PER_MS = 16000; // 16MHz
const MS_PER_FRAME = 8;

/**
 * Parse Intel HEX format into flash array
 */
function parseIntelHex(hex, flashArr) {
  const lines = hex.split('\n').filter(l => l.startsWith(':'));
  for (const line of lines) {
    const byteCount = parseInt(line.substr(1, 2), 16);
    const address = parseInt(line.substr(3, 4), 16);
    const recordType = parseInt(line.substr(7, 2), 16);

    if (recordType === 0) {
      for (let i = 0; i < byteCount; i += 2) {
        const low = parseInt(line.substr(9 + i * 2, 2), 16);
        const high = parseInt(line.substr(11 + i * 2, 2), 16);
        const wordAddress = (address + i) / 2;
        if (wordAddress < flashArr.length) {
          flashArr[wordAddress] = (high << 8) | low;
        }
      }
    }
  }
}

/**
 * Flush batched pin changes to main thread
 * CoVe Fix #12: Invia tutti i cambiamenti in un UNICO messaggio
 * Before: N messaggi individuali (overhead eccessivo)
 * After: 1 messaggio con array di cambiamenti
 */
function flushPinBatch() {
  const entries = Object.entries(pinChangeBatch);
  if (entries.length > 0) {
    // Ottimizzazione: invia tutto in un unico messaggio
    self.postMessage({
      type: 'pinChange',
      changes: entries.map(([pin, data]) => ({ pin: Number(pin), value: data.value, state: data.state }))
    });
    pinChangeBatch = {};
  }
}

/**
 * Handle GPIO port change — batch pin values
 */
function handlePinChange(port) {
  const portObj = port === 'B' ? portB : port === 'C' ? portC : portD;
  if (!portObj) return;

  for (let bit = 0; bit < 8; bit++) {
    const state = portObj.pinState(bit);
    const value = PinState
      ? (state === PinState.High || state === PinState.InputPullUp ? 1 : 0)
      : ((state >> 0) & 1);

    let arduinoPin;
    if (port === 'B') arduinoPin = 8 + bit;
    else if (port === 'C') arduinoPin = 14 + bit;
    else arduinoPin = bit;

    pinChangeBatch[arduinoPin] = { value, state };
  }
}

/**
 * Hook ADC reads to return analog values
 */
function hookADC() {
  if (!cpu) return;

  const ADCSRA = 0x7A;
  const ADMUX = 0x7C;
  const ADCL = 0x78;
  const ADCH = 0x79;

  cpu.writeHooks[ADCSRA] = (value) => {
    if (value & 0x40) {
      const mux = cpu.data[ADMUX] & 0x0F;
      const analogValue = analogValues[mux] || 0;

      cpu.data[ADCL] = analogValue & 0xFF;
      cpu.data[ADCH] = (analogValue >> 8) & 0x03;
      cpu.data[ADCSRA] = (value & ~0x40) | 0x10;

      return true;
    }
    return false;
  };
}

/**
 * Setup INPUT_PULLUP simulation
 */
function setupPullUpSimulation() {
  if (!cpu || !PinState) return;

  const ports = [
    { port: portD, offset: 0 },
    { port: portB, offset: 8 },
    { port: portC, offset: 14 },
  ];

  for (const { port, offset } of ports) {
    if (!port) continue;
    port.addListener(() => {
      for (let bit = 0; bit < 8; bit++) {
        const arduinoPin = offset + bit;
        const state = port.pinState(bit);
        if (state === PinState.InputPullUp) {
          if (!externalOverrides.has(arduinoPin)) {
            port.setPin(bit, true);
          }
        }
      }
    });
  }
}

/**
 * Get PWM duty cycle for a pin
 * CoVe Fix #2: Corretta lettura OCR 16-bit per Timer1 (pin 9-10)
 * Timer1 usa registri OCR a 16-bit: OCR1A = OCR1AH:OCR1AL, OCR1B = OCR1BH:OCR1BL
 */
function getPWMDutyCycle(arduinoPin) {
  if (!cpu) return null;
  const d = cpu.data;

  const TCCR0A = 0x44, OCR0A = 0x47, OCR0B = 0x48;
  const TCCR1A = 0x80, OCR1AL = 0x88, OCR1BL = 0x8A;
  const OCR1AH = 0x89, OCR1BH = 0x8B; // High bytes per Timer1 16-bit
  const TCCR2A = 0xB0, OCR2A = 0xB3, OCR2B = 0xB4;

  switch (arduinoPin) {
    case 3: if (d[TCCR2A] & 0x20) return d[OCR2B] / 255; return null;
    case 5: if (d[TCCR0A] & 0x20) return d[OCR0B] / 255; return null;
    case 6: if (d[TCCR0A] & 0x80) return d[OCR0A] / 255; return null;
    case 9: {
      // Pin 9 (OC1A) - Timer1 usa registro 16-bit OCR1A
      if (d[TCCR1A] & 0x80) {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        const ocr1a = (d[OCR1AH] << 8) | d[OCR1AL]; // Leggi 16-bit completo
        return (ocr1a & 0xFF) / 255; // Usiamo byte basso per analogWrite (8-bit)
      }
      return null;
    }
    case 10: {
      // Pin 10 (OC1B) - Timer1 usa registro 16-bit OCR1B
      if (d[TCCR1A] & 0x20) {
        const ocr1b = (d[OCR1BH] << 8) | d[OCR1BL]; // Leggi 16-bit completo
        return (ocr1b & 0xFF) / 255; // Usiamo byte basso per analogWrite (8-bit)
      }
      return null;
    }
    case 11: if (d[TCCR2A] & 0x80) return d[OCR2A] / 255; return null;
    default: return null;
  }
}

/**
 * Get all PWM duty cycles
 */
function getAllPWMDutyCycles() {
  const pwmPins = [3, 5, 6, 9, 10, 11];
  const result = {};
  for (const pin of pwmPins) {
    const duty = getPWMDutyCycle(pin);
    if (duty !== null) {
      result[pin] = duty;
    }
  }
  return result;
}

/**
 * Send PWM duty cycles to main thread
 */
function sendPWMUpdate() {
  if (!running || !cpu) return;
  const duties = getAllPWMDutyCycles();
  self.postMessage({ type: 'pwm', duties });
}

/**
 * Load hex text and initialize the CPU + peripherals
 */
async function loadHex(hexText) {
  try {
    // Lazy-load avr8js
    if (!avr8js) {
      avr8js = await import('avr8js');
      PinState = avr8js.PinState;
      avrInstruction = avr8js.avrInstruction;
    }

    const {
      CPU, AVRTimer, AVRIOPort, AVRUSART,
      timer0Config, timer1Config, timer2Config,
      portBConfig, portCConfig, portDConfig,
      usart0Config
    } = avr8js;

    // Parse hex into flash
    flash = new Uint16Array(16384);
    parseIntelHex(hexText, flash);

    // Create CPU
    cpu = new CPU(flash);

    // Timers
    timer0 = new AVRTimer(cpu, timer0Config);
    timer1 = new AVRTimer(cpu, timer1Config);
    timer2 = new AVRTimer(cpu, timer2Config);

    // GPIO Ports
    portB = new AVRIOPort(cpu, portBConfig);
    portC = new AVRIOPort(cpu, portCConfig);
    portD = new AVRIOPort(cpu, portDConfig);

    // USART
    usart = new AVRUSART(cpu, usart0Config, 16000000);

    // CoVe Fix #8: Serial output handler con buffering
    usart.onByteTransmit = (byte) => {
      serialOutputBuffer += String.fromCharCode(byte);
      if (!serialFlushTimer) {
        serialFlushTimer = setTimeout(() => {
          if (serialOutputBuffer.length > 0) {
            self.postMessage({ type: 'serialOutput', text: serialOutputBuffer });
            serialOutputBuffer = '';
          }
          serialFlushTimer = null;
        }, SERIAL_FLUSH_INTERVAL);
      }
    };

    // GPIO change handlers
    portB.addListener(() => handlePinChange('B'));
    portC.addListener(() => handlePinChange('C'));
    portD.addListener(() => handlePinChange('D'));

    // Pull-up simulation
    setupPullUpSimulation();

    // ADC hook
    hookADC();

    // Clear state
    externalOverrides.clear();

    self.postMessage({ type: 'hexLoaded', success: true });
  } catch (err) {
    self.postMessage({ type: 'error', message: `loadHex failed: ${err.message}` });
    self.postMessage({ type: 'hexLoaded', success: false });
  }
}

/**
 * CPU execution loop — time-sliced via MessageChannel
 */
function startExecution() {
  if (running || !cpu || !avrInstruction) return;
  running = true;

  const execInstruction = avrInstruction;
  const startWall = performance.now();
  const startCycles = Number(cpu.cycles);

  // Start pin batch flush timer
  pinBatchTimer = setInterval(flushPinBatch, PIN_BATCH_INTERVAL);

  // Start PWM update timer
  pwmTimer = setInterval(sendPWMUpdate, PWM_INTERVAL);

  // MessageChannel for non-throttled scheduling
  const channel = new MessageChannel();

  channel.port1.onmessage = () => {
    if (!running) return;

    try {
      const now = performance.now();
      const elapsedMs = now - startWall;
      const targetCycles = startCycles + (elapsedMs * CYCLES_PER_MS);
      const currentCycles = Number(cpu.cycles);

      // If ahead of real time, wait
      if (currentCycles >= targetCycles) {
        setTimeout(() => {
          if (running) channel.port2.postMessage(null);
        }, 1);
        return;
      }

      // Execute instructions until target or time-slice budget
      const deadline = now + MS_PER_FRAME;
      const batchSize = 1000;

      while (performance.now() < deadline && Number(cpu.cycles) < targetCycles) {
        for (let i = 0; i < batchSize; i++) {
          execInstruction(cpu);
          cpu.tick();
        }
      }
    } catch (err) {
      self.postMessage({ type: 'error', message: `CPU tick error: ${err.message}` });
      running = false;
      return;
    }

    channel.port2.postMessage(null);
  };

  // Kick off first iteration
  channel.port2.postMessage(null);

  // Store channel reference for stop
  self._channel = channel;
}

/**
 * Stop CPU execution
 */
function stopExecution() {
  running = false;

  if (pinBatchTimer) {
    clearInterval(pinBatchTimer);
    pinBatchTimer = null;
  }
  if (pwmTimer) {
    clearInterval(pwmTimer);
    pwmTimer = null;
  }

  // Flush remaining pin changes
  flushPinBatch();

  if (self._channel) {
    self._channel.port1.close();
    self._channel.port2.close();
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    self._channel = null;
  }
}

/**
 * Set input pin value (from main thread component → CPU)
 */
function setInputPin(arduinoPin, value) {
  if (!cpu) return;

  if (value === 0 || value === false) {
    externalOverrides.add(arduinoPin);
  } else {
    externalOverrides.delete(arduinoPin);
  }

  if (arduinoPin >= 14) {
    const channel = arduinoPin - 14;
    analogValues[channel] = Math.max(0, Math.min(1023, typeof value === 'number' ? value : (value ? 1023 : 0)));
    if (portC) portC.setPin(channel, value ? true : false);
  } else if (arduinoPin >= 8) {
    if (portB) portB.setPin(arduinoPin - 8, value ? true : false);
  } else {
    if (portD) portD.setPin(arduinoPin, value ? true : false);
  }
}

/**
 * Set analog value for ADC channel
 */
function setAnalogValue(channel, value) {
  analogValues[channel] = Math.max(0, Math.min(1023, Math.round(value)));
}

/**
 * Serial input from main thread → USART
 */
function serialWrite(text) {
  if (!usart) return;
  for (const char of text) {
    usart.writeByte(char.charCodeAt(0));
  }
}

// ─── Message handler ─────────────────────────────────────────────
self.onmessage = async (e) => {
  const { type } = e.data;

  switch (type) {
    case 'loadHex':
      await loadHex(e.data.hexText);
      break;

    case 'start':
      startExecution();
      break;

    case 'stop':
      stopExecution();
      break;

    case 'setPin':
      setInputPin(e.data.arduinoPin, e.data.value);
      break;

    case 'setAnalog':
      setAnalogValue(e.data.channel, e.data.value);
      break;

    case 'serialInput':
      serialWrite(e.data.text);
      break;

    case 'getPinStates': {
      if (!cpu) {
        self.postMessage({ type: 'pinStates', states: {} });
        break;
      }
      const states = {};
      for (let i = 0; i <= 13; i++) {
        const readPin = (portObj, bit) => {
          if (!portObj) return 0;
          const state = portObj.pinState(bit);
          if (PinState) return (state === PinState.High || state === PinState.InputPullUp) ? 1 : 0;
          return (state >> 0) & 1;
        };
        if (i >= 8) states[`D${i}`] = readPin(portB, i - 8);
        else states[`D${i}`] = readPin(portD, i);
      }
      states.d13Led = states.D13 || 0;
      states._pwm = getAllPWMDutyCycles();
      self.postMessage({ type: 'pinStates', states });
      break;
    }

    case 'getBaudRate': {
      const requestId = Number.isFinite(e.data.requestId) ? e.data.requestId : null;
      if (!cpu) {
        self.postMessage({ type: 'baudRate', baud: null, requestId });
        break;
      }
      const UBRR0L = 0xC4, UBRR0H = 0xC5, UCSR0A = 0xC0;
      const ubrrVal = (cpu.data[UBRR0H] << 8) | cpu.data[UBRR0L];
      let baud = null;
      if (ubrrVal !== 0) {
        const u2x = (cpu.data[UCSR0A] & 0x02) ? 1 : 0;
        const divisor = u2x ? 8 : 16;
        baud = Math.round(16000000 / (divisor * (ubrrVal + 1)));
      }
      self.postMessage({ type: 'baudRate', baud, requestId });
      break;
    }

    default:
      break;
  }
};

// Signal ready
self.postMessage({ type: 'ready' });
