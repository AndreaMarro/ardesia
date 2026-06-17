// ============================================
// ELAB Data Server — Express + SQLite
// Student data sync, Teacher Dashboard API,
// GDPR compliance, audit logging
// © Andrea Marro — 30/03/2026
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const db = require('./db');

// ─── HMAC Secret for token verification ───────
const HMAC_SECRET = process.env.HMAC_SECRET || '';
if (!HMAC_SECRET) {
  console.warn('[ELAB Data Server] ⚠ HMAC_SECRET non configurato — token verificati solo per formato/expiry (DEV MODE)');
}

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ──────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://elab-builder.vercel.app',
  'https://elab-tutor.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl)
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorizzato'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());
app.use(express.json({ limit: '2mb' }));

// ─── Trust proxy (Render puts a reverse proxy in front) ──
app.set('trust proxy', 1);

// ─── Rate Limiting (in-memory, per IP) ─────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = process.env.NODE_ENV === 'test' ? 500 : 30; // 30 req/min per IP (relaxed in test)

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    db.logAudit({
      userId: null,
      action: 'rate_limit_exceeded',
      endpoint: req.path,
      ip,
      statusCode: 429,
    });
    return res.status(429).json({ error: 'Troppi tentativi. Riprova tra un minuto.' });
  }

  next();
}

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

app.use(rateLimit);

// ─── Token Parsing + HMAC Verification ───────
function parseTokenPayload(token) {
  try {
    if (!token || !token.includes('.')) return null;
    const payloadB64 = token.split('.')[0];
    const padding = '='.repeat((4 - (payloadB64.length % 4)) % 4);
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * Verify HMAC-SHA256 signature of token.
 * Token format: base64url(payload).base64url(HMAC-SHA256(payload, secret))
 * Returns { valid: true, payload } or { valid: false }
 */
function verifyHmacToken(token, secret) {
  if (!token || !token.includes('.')) return { valid: false };

  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [payloadB64, signatureB64] = parts;

  // Recompute HMAC
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  // Timing-safe comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signatureB64, 'base64url');
    const expectedBuffer = Buffer.from(expectedSig, 'base64url');

    if (sigBuffer.length !== expectedBuffer.length) return { valid: false };
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return { valid: false };
  } catch {
    return { valid: false };
  }

  // Parse payload
  const payload = parseTokenPayload(token);
  if (!payload) return { valid: false };

  return { valid: true, payload };
}

function isTokenExpired(payload) {
  if (!payload || !payload.exp) return true;
  return payload.exp < (Date.now() + 60 * 1000);
}

// ─── Auth Middleware ────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  const token = authHeader.slice(7);
  let payload;

  if (HMAC_SECRET) {
    // PRODUCTION: verify HMAC signature
    const result = verifyHmacToken(token, HMAC_SECRET);
    if (!result.valid) {
      return res.status(401).json({ error: 'Firma token non valida' });
    }
    payload = result.payload;
  } else {
    // DEV MODE: parse-only (no secret configured)
    payload = parseTokenPayload(token);
    if (!payload) {
      return res.status(401).json({ error: 'Token non valido' });
    }
  }

  if (isTokenExpired(payload)) {
    return res.status(401).json({ error: 'Token scaduto', loginRequired: true });
  }

  // Attach user info to request
  req.userId = payload.userId || payload.sub || payload.id;
  req.userRole = payload.ruolo || payload.role || 'student';
  req.tokenPayload = payload;
  next();
}

// ─── Audit Middleware ──────────────────────────
function audit(action) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      db.logAudit({
        userId: req.userId || null,
        action,
        endpoint: req.path,
        ip: req.ip,
        details: { method: req.method },
        statusCode: res.statusCode,
      });
      return originalJson(body);
    };
    next();
  };
}

// ─── Input Sanitization ────────────────────────
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[sanitizeString(key)] = sanitizeObject(value);
  }
  return result;
}

// ═════════════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════════════

// ─── Health Check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'elab-data-server',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    region: process.env.RENDER_REGION || 'local',
    hmacEnabled: !!HMAC_SECRET,
  });
});

// ─── POST /api/sync — Student data sync ────────
app.post('/api/sync', requireAuth, audit('sync_write'), (req, res) => {
  try {
    const { studentData, classId } = req.body;

    if (!studentData || typeof studentData !== 'object') {
      return res.status(400).json({ error: 'studentData obbligatorio (oggetto)' });
    }

    // Sanitize before storing
    const sanitized = sanitizeObject(studentData);
    db.upsertStudentData(req.userId, classId || null, sanitized);

    res.json({
      success: true,
      userId: req.userId,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[SYNC ERROR]', err.message);
    res.status(500).json({ error: 'Errore sincronizzazione dati' });
  }
});

// ─── GET /api/sync — Read own student data ─────
app.get('/api/sync', requireAuth, audit('sync_read'), (req, res) => {
  try {
    const row = db.getStudentData(req.userId);
    res.json({
      success: true,
      studentData: row ? row.data : null,
    });
  } catch (err) {
    console.error('[SYNC READ ERROR]', err.message);
    res.status(500).json({ error: 'Errore lettura dati' });
  }
});

// ─── GET /api/class/:id — Teacher: class data ──
app.get('/api/class/:id', requireAuth, audit('class_read'), (req, res) => {
  try {
    // Only teachers/admins can read class data
    if (req.userRole !== 'teacher' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo i docenti possono accedere ai dati della classe' });
    }

    const classId = req.params.id;
    const students = db.getStudentsByClass(classId === 'all' ? null : classId);

    res.json({
      success: true,
      students,
      count: Object.keys(students).length,
      classId,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[CLASS READ ERROR]', err.message);
    res.status(500).json({ error: 'Errore lettura dati classe' });
  }
});

// ─── GET /api/student-data-sync — Backward compat ──
// The existing frontend calls /student-data-sync
app.get('/student-data-sync', requireAuth, audit('sync_read_compat'), (req, res) => {
  try {
    const classId = req.query.classId;
    const students = db.getStudentsByClass(classId || null);

    res.json({
      success: true,
      students,
    });
  } catch (err) {
    console.error('[COMPAT SYNC READ ERROR]', err.message);
    res.status(500).json({ error: 'Errore lettura dati' });
  }
});

// ─── POST /student-data-sync — Backward compat ──
app.post('/student-data-sync', requireAuth, audit('sync_write_compat'), (req, res) => {
  try {
    const { studentData } = req.body;
    if (!studentData || typeof studentData !== 'object') {
      return res.status(400).json({ error: 'studentData obbligatorio' });
    }

    const sanitized = sanitizeObject(studentData);
    db.upsertStudentData(req.userId, null, sanitized);

    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[COMPAT SYNC WRITE ERROR]', err.message);
    res.status(500).json({ error: 'Errore sincronizzazione' });
  }
});

// ─── POST /api/auth/verify — Verify token ──────
app.post('/api/auth/verify', audit('auth_verify'), (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Token mancante' });
  }

  const token = authHeader.slice(7);
  let payload;

  if (HMAC_SECRET) {
    const result = verifyHmacToken(token, HMAC_SECRET);
    if (!result.valid) {
      return res.status(401).json({ valid: false, error: 'Firma token non valida' });
    }
    payload = result.payload;
  } else {
    payload = parseTokenPayload(token);
    if (!payload) {
      return res.status(401).json({ valid: false, error: 'Token non valido' });
    }
  }

  if (isTokenExpired(payload)) {
    return res.status(401).json({ valid: false, error: 'Token scaduto' });
  }

  res.json({
    valid: true,
    userId: payload.userId || payload.sub || payload.id,
    role: payload.ruolo || payload.role,
    exp: payload.exp,
    hmacVerified: !!HMAC_SECRET,
  });
});

// ─── DELETE /api/student/:id — GDPR Art.17 ─────
app.delete('/api/student/:id', requireAuth, audit('gdpr_delete'), (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Users can only delete their own data, unless admin
    if (req.userId !== targetUserId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato a cancellare dati di altri utenti' });
    }

    const result = db.deleteStudentData(targetUserId);

    // Log GDPR deletion specifically
    db.logAudit({
      userId: req.userId,
      action: 'gdpr_data_deletion',
      endpoint: `/api/student/${targetUserId}`,
      ip: req.ip,
      details: { targetUserId, deletedRows: result.changes },
      statusCode: 200,
    });

    res.json({
      success: true,
      deleted: result.changes > 0,
      message: result.changes > 0
        ? 'Dati studente eliminati con successo (GDPR Art.17)'
        : 'Nessun dato trovato per questo utente',
    });
  } catch (err) {
    console.error('[GDPR DELETE ERROR]', err.message);
    res.status(500).json({ error: 'Errore eliminazione dati' });
  }
});

// ─── GET /api/audit/:userId — GDPR audit log ───
app.get('/api/audit/:userId', requireAuth, audit('audit_read'), (req, res) => {
  try {
    // Only admins or the user themselves
    if (req.userId !== req.params.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const logs = db.getAuditLog(req.params.userId);
    res.json({ success: true, logs });
  } catch (err) {
    console.error('[AUDIT READ ERROR]', err.message);
    res.status(500).json({ error: 'Errore lettura audit log' });
  }
});

// ─── POST /api/admin/cleanup — Data retention ──
app.post('/api/admin/cleanup', requireAuth, audit('admin_cleanup'), (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo admin' });
    }

    const result = db.cleanupExpiredData();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[CLEANUP ERROR]', err.message);
    res.status(500).json({ error: 'Errore pulizia dati' });
  }
});

// ─── 404 Handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// ─── Error Handler ─────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[SERVER ERROR]', err.message);
  if (err.message === 'CORS non autorizzato') {
    return res.status(403).json({ error: 'Origine non autorizzata' });
  }
  res.status(500).json({ error: 'Errore interno del server' });
});

// ─── Start ─────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[ELAB Data Server] Avviato su porta ${PORT}`);
  console.log(`[ELAB Data Server] Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[ELAB Data Server] SIGTERM ricevuto, chiusura...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

module.exports = { app, server };
