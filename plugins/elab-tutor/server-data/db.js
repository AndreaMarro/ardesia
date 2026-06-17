// ============================================
// ELAB Data Server — SQLite Database Layer
// better-sqlite3 for sync performance
// © Andrea Marro — 30/03/2026
// ============================================

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Persistent data directory (Render uses /opt/render/project/src for persistence)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'elab.db');
const db = new Database(DB_PATH, { verbose: process.env.NODE_ENV === 'development' ? console.log : undefined });

// WAL mode for concurrent reads during writes
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS student_data (
    user_id       TEXT PRIMARY KEY,
    class_id      TEXT,
    data          TEXT NOT NULL,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_student_class ON student_data(class_id);
  CREATE INDEX IF NOT EXISTS idx_student_updated ON student_data(updated_at);

  CREATE TABLE IF NOT EXISTS audit_log (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp     TEXT NOT NULL DEFAULT (datetime('now')),
    user_id       TEXT,
    action        TEXT NOT NULL,
    endpoint      TEXT NOT NULL,
    ip            TEXT,
    details       TEXT,
    status_code   INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
`);

// ─── Prepared Statements (performance) ─────────

const stmts = {
  upsertStudent: db.prepare(`
    INSERT INTO student_data (user_id, class_id, data, updated_at, created_at)
    VALUES (@userId, @classId, @data, datetime('now'), datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      data = @data,
      class_id = COALESCE(@classId, student_data.class_id),
      updated_at = datetime('now')
  `),

  getStudent: db.prepare(`
    SELECT * FROM student_data WHERE user_id = ?
  `),

  getStudentsByClass: db.prepare(`
    SELECT * FROM student_data WHERE class_id = ?
  `),

  getAllStudents: db.prepare(`
    SELECT * FROM student_data ORDER BY updated_at DESC
  `),

  deleteStudent: db.prepare(`
    DELETE FROM student_data WHERE user_id = ?
  `),

  insertAudit: db.prepare(`
    INSERT INTO audit_log (user_id, action, endpoint, ip, details, status_code)
    VALUES (@userId, @action, @endpoint, @ip, @details, @statusCode)
  `),

  getAuditByUser: db.prepare(`
    SELECT * FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100
  `),

  cleanupOldData: db.prepare(`
    DELETE FROM student_data WHERE updated_at < datetime('now', '-730 days')
  `),

  cleanupOldAudit: db.prepare(`
    DELETE FROM audit_log WHERE timestamp < datetime('now', '-730 days')
  `),
};

// ─── Public API ────────────────────────────────

function upsertStudentData(userId, classId, data) {
  return stmts.upsertStudent.run({
    userId,
    classId: classId || null,
    data: typeof data === 'string' ? data : JSON.stringify(data),
  });
}

function getStudentData(userId) {
  const row = stmts.getStudent.get(userId);
  if (!row) return null;
  return { ...row, data: JSON.parse(row.data) };
}

function getStudentsByClass(classId) {
  const rows = classId ? stmts.getStudentsByClass.all(classId) : stmts.getAllStudents.all();
  const result = {};
  for (const row of rows) {
    try {
      result[row.user_id] = JSON.parse(row.data);
    } catch {
      // Skip corrupted rows
    }
  }
  return result;
}

function deleteStudentData(userId) {
  return stmts.deleteStudent.run(userId);
}

function logAudit({ userId, action, endpoint, ip, details, statusCode }) {
  return stmts.insertAudit.run({
    userId: userId || null,
    action,
    endpoint,
    ip: ip || null,
    details: details ? JSON.stringify(details) : null,
    statusCode: statusCode || 200,
  });
}

function getAuditLog(userId) {
  return stmts.getAuditByUser.all(userId);
}

function cleanupExpiredData() {
  const students = stmts.cleanupOldData.run();
  const audit = stmts.cleanupOldAudit.run();
  return { studentsDeleted: students.changes, auditDeleted: audit.changes };
}

function close() {
  db.close();
}

module.exports = {
  db,
  upsertStudentData,
  getStudentData,
  getStudentsByClass,
  deleteStudentData,
  logAudit,
  getAuditLog,
  cleanupExpiredData,
  close,
};
