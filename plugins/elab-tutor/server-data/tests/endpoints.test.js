// ============================================
// ELAB Data Server — Endpoint Tests
// Node.js built-in test runner (node --test)
// © Andrea Marro — 30/03/2026
// ============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const crypto = require('crypto');

// Test setup
let server;
const PORT = 3099; // Avoid conflict with dev server
const TEST_HMAC_SECRET = 'test-hmac-secret-for-elab-unit-tests-2026';

// Helper: create a HMAC-signed Bearer token (same format as authService)
function makeToken(payload, secret = TEST_HMAC_SECRET) {
  const json = JSON.stringify(payload);
  const payloadB64 = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

// Helper: create an unsigned token (for testing rejection)
function makeUnsignedToken(payload) {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString('base64url') + '.fakesignature';
}

const TEACHER_TOKEN = makeToken({ userId: 'teacher-1', ruolo: 'teacher', exp: Date.now() + 3600000 });
const STUDENT_TOKEN = makeToken({ userId: 'student-1', ruolo: 'student', exp: Date.now() + 3600000 });
const EXPIRED_TOKEN = makeToken({ userId: 'expired', ruolo: 'student', exp: Date.now() - 100000 });
const ADMIN_TOKEN = makeToken({ userId: 'admin-1', ruolo: 'admin', exp: Date.now() + 3600000 });
const FORGED_TOKEN = makeUnsignedToken({ userId: 'hacker', ruolo: 'admin', exp: Date.now() + 3600000 });
const WRONG_SECRET_TOKEN = makeToken({ userId: 'hacker', ruolo: 'admin', exp: Date.now() + 3600000 }, 'wrong-secret');

function request(method, path, { body, token, headers: extraHeaders } = {}) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json', ...extraHeaders };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({ hostname: 'localhost', port: PORT, path, method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

before(() => {
  // Override env before requiring
  process.env.PORT = String(PORT);
  process.env.NODE_ENV = 'test';
  process.env.DATA_DIR = require('path').join(__dirname, '.test-data');
  process.env.HMAC_SECRET = TEST_HMAC_SECRET;
  const { server: s } = require('../index.js');
  server = s;
});

after(() => {
  server.close();
  if (server.closeAllConnections) server.closeAllConnections();
  // Cleanup test database
  const fs = require('fs');
  const path = require('path');
  const testDir = path.join(__dirname, '.test-data');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  // Force exit after cleanup (server keep-alive prevents clean shutdown)
  setTimeout(() => process.exit(0), 200);
});

// ═════════════════════════════════════════════════
// HEALTH CHECK
// ═════════════════════════════════════════════════

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'elab-data-server');
    assert.equal(res.body.hmacEnabled, true);
  });
});

// ═════════════════════════════════════════════════
// AUTH + HMAC
// ═════════════════════════════════════════════════

describe('Authentication', () => {
  it('rejects requests without token (401)', async () => {
    const res = await request('POST', '/api/sync', { body: { studentData: {} } });
    assert.equal(res.status, 401);
  });

  it('rejects expired tokens (401)', async () => {
    const res = await request('POST', '/api/sync', {
      body: { studentData: {} },
      token: EXPIRED_TOKEN,
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.loginRequired, true);
  });

  it('rejects malformed tokens (401)', async () => {
    const res = await request('POST', '/api/sync', {
      body: { studentData: {} },
      token: 'not-a-valid-token',
    });
    assert.equal(res.status, 401);
  });

  it('rejects forged tokens with fake signature (401)', async () => {
    const res = await request('POST', '/api/sync', {
      body: { studentData: {} },
      token: FORGED_TOKEN,
    });
    assert.equal(res.status, 401);
    assert.ok(res.body.error.includes('Firma'));
  });

  it('rejects tokens signed with wrong secret (401)', async () => {
    const res = await request('POST', '/api/sync', {
      body: { studentData: {} },
      token: WRONG_SECRET_TOKEN,
    });
    assert.equal(res.status, 401);
    assert.ok(res.body.error.includes('Firma'));
  });

  it('POST /api/auth/verify confirms valid HMAC token', async () => {
    const res = await request('POST', '/api/auth/verify', { token: TEACHER_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.valid, true);
    assert.equal(res.body.userId, 'teacher-1');
    assert.equal(res.body.hmacVerified, true);
  });

  it('POST /api/auth/verify rejects expired token', async () => {
    const res = await request('POST', '/api/auth/verify', { token: EXPIRED_TOKEN });
    assert.equal(res.status, 401);
    assert.equal(res.body.valid, false);
  });

  it('POST /api/auth/verify rejects forged token', async () => {
    const res = await request('POST', '/api/auth/verify', { token: FORGED_TOKEN });
    assert.equal(res.status, 401);
    assert.equal(res.body.valid, false);
  });
});

// ═════════════════════════════════════════════════
// SYNC
// ═════════════════════════════════════════════════

describe('POST /api/sync', () => {
  it('accepts valid student data', async () => {
    const res = await request('POST', '/api/sync', {
      token: STUDENT_TOKEN,
      body: {
        studentData: { esperimenti: [{ id: 'e1', nome: 'LED' }], tempoTotale: 60 },
        classId: 'class-test',
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('rejects missing studentData (400)', async () => {
    const res = await request('POST', '/api/sync', {
      token: STUDENT_TOKEN,
      body: {},
    });
    assert.equal(res.status, 400);
  });

  it('sanitizes XSS in payload', async () => {
    const res = await request('POST', '/api/sync', {
      token: STUDENT_TOKEN,
      body: {
        studentData: { nome: '<script>alert("xss")</script>' },
      },
    });
    assert.equal(res.status, 200);
    // Verify sanitized data is stored
    const read = await request('GET', '/api/sync', { token: STUDENT_TOKEN });
    assert.ok(!read.body.studentData.nome.includes('<script>'));
  });
});

describe('GET /api/sync', () => {
  it('returns stored student data', async () => {
    const res = await request('GET', '/api/sync', { token: STUDENT_TOKEN });
    assert.equal(res.status, 200);
    assert.ok(res.body.studentData);
  });
});

// ═════════════════════════════════════════════════
// CLASS DATA (Teacher)
// ═════════════════════════════════════════════════

describe('GET /api/class/:id', () => {
  it('returns class data for teachers', async () => {
    // First sync some data with a classId
    await request('POST', '/api/sync', {
      token: STUDENT_TOKEN,
      body: { studentData: { esperimenti: [] }, classId: 'class-a' },
    });

    const res = await request('GET', '/api/class/class-a', { token: TEACHER_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.count >= 1);
  });

  it('denies students access to class data (403)', async () => {
    const res = await request('GET', '/api/class/class-a', { token: STUDENT_TOKEN });
    assert.equal(res.status, 403);
  });

  it('returns all students when classId is "all"', async () => {
    const res = await request('GET', '/api/class/all', { token: TEACHER_TOKEN });
    assert.equal(res.status, 200);
    assert.ok(res.body.count >= 1);
  });
});

// ═════════════════════════════════════════════════
// BACKWARD COMPATIBILITY
// ═════════════════════════════════════════════════

describe('Legacy /student-data-sync', () => {
  it('POST accepts data (compat)', async () => {
    const res = await request('POST', '/student-data-sync', {
      token: STUDENT_TOKEN,
      body: { studentData: { test: true } },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('GET returns students (compat)', async () => {
    const res = await request('GET', '/student-data-sync', { token: TEACHER_TOKEN });
    assert.equal(res.status, 200);
    assert.ok(res.body.students);
  });
});

// ═════════════════════════════════════════════════
// GDPR DELETE
// ═════════════════════════════════════════════════

describe('DELETE /api/student/:id (GDPR Art.17)', () => {
  it('allows users to delete their own data', async () => {
    // Sync data first
    await request('POST', '/api/sync', {
      token: STUDENT_TOKEN,
      body: { studentData: { to_delete: true } },
    });

    const res = await request('DELETE', '/api/student/student-1', { token: STUDENT_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.deleted, true);

    // Verify data is gone
    const check = await request('GET', '/api/sync', { token: STUDENT_TOKEN });
    assert.equal(check.body.studentData, null);
  });

  it('denies deleting other users data (403)', async () => {
    const res = await request('DELETE', '/api/student/someone-else', { token: STUDENT_TOKEN });
    assert.equal(res.status, 403);
  });

  it('allows admin to delete any user data', async () => {
    // Sync data for teacher
    await request('POST', '/api/sync', {
      token: TEACHER_TOKEN,
      body: { studentData: { admin_test: true } },
    });

    const res = await request('DELETE', '/api/student/teacher-1', { token: ADMIN_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════
// AUDIT LOG
// ═════════════════════════════════════════════════

describe('GET /api/audit/:userId', () => {
  it('returns audit log for own user', async () => {
    // Generate some audit entries by making requests
    await request('GET', '/api/sync', { token: STUDENT_TOKEN });

    const res = await request('GET', '/api/audit/student-1', { token: STUDENT_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.logs));
    assert.ok(res.body.logs.length > 0);
  });

  it('denies access to other users audit log (403)', async () => {
    const res = await request('GET', '/api/audit/admin-1', { token: STUDENT_TOKEN });
    assert.equal(res.status, 403);
  });

  it('allows admin to read any audit log', async () => {
    const res = await request('GET', '/api/audit/student-1', { token: ADMIN_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════
// RATE LIMITING
// ═════════════════════════════════════════════════

describe('Rate Limiting', () => {
  it('allows normal request volume', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request('GET', '/api/health');
      assert.equal(res.status, 200);
    }
  });
});

// ═════════════════════════════════════════════════
// 404
// ═════════════════════════════════════════════════

describe('404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request('GET', '/api/nonexistent');
    assert.equal(res.status, 404);
  });
});
