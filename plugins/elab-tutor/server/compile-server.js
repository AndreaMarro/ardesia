/**
 * ELAB Arduino Compile Server
 * Micro-server Express che wrappa arduino-cli per compilazione real-time.
 * Gira sul VPS Hostinger (stesso server di n8n).
 *
 * Endpoint: POST /compile
 * Body: { code: "void setup()...", board: "arduino:avr:nano:cpu=atmega328old" }
 * Response: { success: true, hex: "...", errors: null, output: "..." }
 *
 * Installazione:
 *   1. npm install (nella cartella server/)
 *   2. Installa arduino-cli sul VPS
 *   3. node compile-server.js   (o pm2 start compile-server.js)
 *
 * Andrea Marro — 13/03/2026
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execFile, execFileSync } = require('child_process');
const os = require('os');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8000;
const ARDUINO_CLI = process.env.ARDUINO_CLI || 'arduino-cli';
const DEFAULT_BOARD = 'arduino:avr:nano:cpu=atmega328old';
const COMPILE_TIMEOUT = 60000; // 60 secondi max
const MAX_CODE_SIZE = 100000; // 100KB max

// Librerie Arduino richieste dagli esperimenti Vol3
const REQUIRED_LIBS = ['Servo', 'LiquidCrystal'];

// ─── Middleware ───
app.use(cors({
  origin: [
    'https://www.elabtutor.school',
    'https://elab-builder.vercel.app',
    /^https:\/\/elab-builder-.*\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5179',
    'http://localhost:3000',
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '200kb' }));

// ─── Rate limiting semplice (in-memory) ───
const rateLimit = new Map(); // ip → { count, resetTime }
const RATE_WINDOW = 60000; // 1 minuto
const RATE_MAX = 10; // max 10 compilazioni/minuto per IP

function checkRate(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

// Pulizia periodica rate limit
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit) {
    if (now > entry.resetTime) rateLimit.delete(ip);
  }
}, 60000);

// ─── Health check ───
app.get('/', (req, res) => {
  res.json({
    service: 'ELAB Arduino Compile Server',
    status: 'running',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  // Verifica che arduino-cli sia disponibile
  execFile(ARDUINO_CLI, ['version'], { timeout: 5000 }, (err, stdout) => {
    if (err) {
      return res.status(503).json({
        status: 'error',
        message: 'arduino-cli non disponibile',
        error: err.message,
      });
    }
    res.json({
      status: 'ok',
      arduinoCli: stdout.trim(),
    });
  });
});

// ─── Compilazione ───
app.post('/compile', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Rate limit
  if (!checkRate(ip)) {
    return res.status(429).json({
      success: false,
      hex: null,
      errors: 'Troppe richieste. Riprova tra qualche secondo.',
      output: null,
    });
  }

  const { code, board } = req.body;

  // Validazione
  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      hex: null,
      errors: 'Campo "code" mancante o non valido.',
      output: null,
    });
  }

  if (code.length > MAX_CODE_SIZE) {
    return res.status(400).json({
      success: false,
      hex: null,
      errors: `Codice troppo lungo (max ${MAX_CODE_SIZE / 1000}KB).`,
      output: null,
    });
  }

  const fqbn = board || DEFAULT_BOARD;

  // Crea directory temporanee uniche
  const id = crypto.randomBytes(8).toString('hex');
  const tmpDir = path.join(os.tmpdir(), `elab_${id}`);
  const sketchDir = path.join(tmpDir, 'sketch');
  const outputDir = path.join(tmpDir, 'output');
  const sketchFile = path.join(sketchDir, 'sketch.ino');

  try {
    fs.mkdirSync(sketchDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(sketchFile, code, 'utf-8');

    console.log(`[${new Date().toISOString()}] Compiling for ${fqbn} (${code.length} bytes)...`);

    // Esegui arduino-cli
    const result = await new Promise((resolve) => {
      execFile(
        ARDUINO_CLI,
        [
          'compile',
          '--fqbn', fqbn,
          '--output-dir', outputDir,
          sketchDir,
        ],
        {
          timeout: COMPILE_TIMEOUT,
          maxBuffer: 1024 * 1024, // 1MB output buffer
        },
        (err, stdout, stderr) => {
          resolve({
            exitCode: err ? err.code || 1 : 0,
            stdout: stdout || '',
            stderr: stderr || '',
            killed: err?.killed || false,
          });
        }
      );
    });

    if (result.killed) {
      return res.json({
        success: false,
        hex: null,
        errors: 'Compilazione terminata per timeout (60s).',
        output: result.stdout,
      });
    }

    if (result.exitCode === 0) {
      // Cerca il file .hex nella directory output
      const files = fs.readdirSync(outputDir);
      const hexFile = files.find(f => f.endsWith('.hex'));

      if (hexFile) {
        const hex = fs.readFileSync(path.join(outputDir, hexFile), 'utf-8');
        console.log(`[${new Date().toISOString()}] Compilation OK (${hex.length} bytes hex)`);

        return res.json({
          success: true,
          hex,
          errors: null,
          output: result.stdout,
        });
      } else {
        return res.json({
          success: false,
          hex: null,
          errors: 'Compilazione riuscita ma file .hex non trovato.',
          output: result.stdout,
        });
      }
    } else {
      // Compilazione fallita — restituisci errori
      const errorText = result.stderr || result.stdout || 'Errore di compilazione sconosciuto';
      console.log(`[${new Date().toISOString()}] Compilation FAILED`);

      return res.json({
        success: false,
        hex: null,
        errors: errorText,
        output: result.stdout,
      });
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Server error:`, err);
    return res.status(500).json({
      success: false,
      hex: null,
      errors: 'Errore interno del server: ' + err.message,
      output: null,
    });
  } finally {
    // Cleanup: rimuovi file temporanei
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
});

// ─── Auto-install librerie mancanti all'avvio ───
function ensureLibraries() {
  try {
    const out = execFileSync(ARDUINO_CLI, ['lib', 'list'], { timeout: 10000, encoding: 'utf-8' });
    REQUIRED_LIBS.forEach(lib => {
      if (!out.includes(lib)) {
        execFileSync(ARDUINO_CLI, ['lib', 'install', lib], { timeout: 30000, encoding: 'utf-8' });
      }
    });
  } catch { /* ignore — will fail at compile time if libs missing */ }
}

// ─── CORS preflight ───
app.options('/compile', cors());

// ─── Start ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║   ELAB Arduino Compile Server v1.1.0    ║
║   Port: ${PORT}                            ║
║   Board: ${DEFAULT_BOARD}    ║
╚══════════════════════════════════════════╝
  `);

  // Verifica arduino-cli all'avvio
  execFile(ARDUINO_CLI, ['version'], { timeout: 5000 }, (err, stdout) => {
    if (err) {
      console.error('WARNING: arduino-cli non trovato!');
      console.error('Installa: curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh');
      console.error('Poi: arduino-cli core install arduino:avr');
    } else {
      // Verifica e installa librerie mancanti (Servo, LiquidCrystal)
      ensureLibraries();
    }
  });
});
