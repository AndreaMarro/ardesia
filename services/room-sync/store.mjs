import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { chmod, mkdir, open, readFile, readdir, rename, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const ID = /^[A-Za-z0-9_-]{1,128}$/;
const FILE_BYTES = 4 * 1024 * 1024;
const TOTAL_FILE_BYTES = 20 * 1024 * 1024;
export const PDF_LIMITS = Object.freeze({ file: 20 * 1024 * 1024, total: 100 * 1024 * 1024, count: 32 });
const SHA256 = /^[0-9a-f]{64}$/;
const MAX_ELEMENTS = 10000;
const MAX_OPERATIONS = 20000;
const clone = value => structuredClone(value);
const own = (object, key) => Object.hasOwn(object, key);
const hash = value => createHash('sha256').update(value).digest('hex');
const canonical = value => JSON.stringify(value, function (_key, item) {
  return item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item;
});

export class RoomError extends Error {
  constructor(status, code, detail = {}) { super(code); this.status = status; this.detail = { error: code, ...detail }; }
}
export function ensure(condition, status, code, detail) {
  if (!condition) throw new RoomError(status, code, detail);
}
export function validId(id) { return typeof id === 'string' && ID.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id); }
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function fields(body, allowed) { ensure(record(body) && Object.keys(body).every(key => allowed.includes(key)), 400, 'invalid_payload'); }
function cleanFiles(input = {}) {
  ensure(record(input), 400, 'invalid_files');
  const result = {};
  for (const [id, file] of Object.entries(input)) {
    ensure(validId(id) && record(file) && file.id === id, 400, 'invalid_file');
    ensure(typeof file.dataURL === 'string' && typeof file.mimeType === 'string', 400, 'invalid_file');
    const match = /^data:(image\/(?:png|jpeg|gif|webp|svg\+xml)|application\/pdf);base64,([A-Za-z0-9+/]*={0,2})$/.exec(file.dataURL);
    ensure(match && match[1] === file.mimeType && match[2].length % 4 === 0 && match[2].length > 0, 400, 'invalid_file_data_url');
    ensure(match[1] !== 'application/pdf', 400, 'pdf_requires_explicit_sharing');
    const bytes = Buffer.from(match[2], 'base64');
    ensure(bytes.toString('base64') === match[2], 400, 'invalid_file_base64');
    ensure(bytes.length <= FILE_BYTES, 413, 'file_too_large');
    result[id] = { id, mimeType: file.mimeType, dataURL: file.dataURL };
    for (const key of ['created', 'lastRetrieved']) {
      if (file[key] !== undefined) { ensure(Number.isFinite(file[key]) && file[key] >= 0, 400, 'invalid_file_time'); result[id][key] = file[key]; }
    }
  }
  return result;
}

export class RoomStore {
  constructor(dataDir, now) { this.dataDir = dataDir; this.now = now; this.rooms = new Map(); this.queues = new Map(); this.presence = new Map(); }
  static async open(dataDir, { now = Date.now } = {}) {
    await mkdir(dataDir, { recursive: true, mode: 0o700 });
    await chmod(dataDir, 0o700);
    const store = new RoomStore(dataDir, now);
    for (const filename of await readdir(dataDir)) {
      if (!filename.endsWith('.json')) continue;
      const room = JSON.parse(await readFile(path.join(dataDir, filename), 'utf8'));
      ensure(room.schemaVersion === 1 && validId(room.roomId) && filename === `${room.roomId}.json`, 500, 'unsupported_store');
      store.rooms.set(room.roomId, room);
    }
    return store;
  }
  async serialize(key, callback) {
    const previous = this.queues.get(key) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(callback);
    this.queues.set(key, next);
    try { return await next; } finally { if (this.queues.get(key) === next) this.queues.delete(key); }
  }
  async persist(room) {
    const serialized = JSON.stringify(room);
    ensure(Buffer.byteLength(serialized) <= 128 * 1024 * 1024, 507, 'room_storage_limit');
    const target = path.join(this.dataDir, `${room.roomId}.json`);
    const temporary = path.join(this.dataDir, `.${room.roomId}.${randomUUID()}.tmp`);
    const file = await open(temporary, 'wx', 0o600);
    try {
      await file.writeFile(serialized); await file.sync(); await file.close();
      await rename(temporary, target);
      const directory = await open(this.dataDir, 'r');
      try { await directory.sync(); } finally { await directory.close(); }
    } catch (error) { await file.close().catch(() => {}); await unlink(temporary).catch(() => {}); throw error; }
    this.rooms.set(room.roomId, room);
  }
  grant(role) {
    const token = randomBytes(32).toString('base64url');
    return { token, grant: { grantId: randomUUID(), role, tokenHash: hash(token), createdAt: this.now(), revokedAt: null } };
  }
  async create(body) {
    fields(body, ['title', 'clientId']);
    ensure(validId(body.clientId), 400, 'invalid_client_id');
    ensure(body.title === undefined || (typeof body.title === 'string' && body.title.length <= 200), 400, 'invalid_title');
    return this.serialize('__rooms__', async () => {
      ensure(this.rooms.size < 128, 507, 'room_count_limit');
      const { token, grant } = this.grant('owner');
      const room = { schemaVersion: 1, roomId: randomUUID(), title: body.title || 'Lezione condivisa', createdAt: this.now(), revision: 0, elements: {}, objectVersions: {}, files: {}, grants: { [grant.grantId]: grant }, operations: {}, order: [] };
      await this.persist(room);
      return { roomId: room.roomId, token, role: grant.role, grantId: grant.grantId, snapshot: this.snapshot(room, grant) };
    });
  }
  authenticate(room, token) {
    ensure(typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token), 401, 'unauthorized');
    const digest = hash(token);
    const grant = Object.values(room.grants).find(item => item.tokenHash === digest && item.revokedAt === null);
    ensure(grant, 401, 'unauthorized');
    return grant;
  }
  async access(roomId, token, callback) {
    ensure(validId(roomId), 404, 'room_not_found');
    return this.serialize(roomId, async () => {
      const room = this.rooms.get(roomId);
      ensure(room, 404, 'room_not_found');
      const grant = this.authenticate(room, token);
      return callback(room, grant);
    });
  }
  snapshot(room, grant) {
    return { roomId: room.roomId, title: room.title, role: grant.role, grantId: grant.grantId, revision: room.revision, elements: Object.values(room.elements), objectVersions: room.objectVersions, files: room.files, pdfRevision: room.pdfRevision ?? 0, pdfDocuments: this.listPdfs(room).documents };
  }
  owner(grant) { ensure(grant.role === 'owner', 403, 'owner_required'); }
  editor(grant) { ensure(grant.role !== 'viewer', 403, 'read_only'); }
  async createGrant(room, grant, body) {
    this.owner(grant); fields(body, ['role']);
    ensure(['editor', 'viewer'].includes(body.role), 400, 'invalid_role');
    ensure(Object.values(room.grants).filter(item => item.revokedAt === null).length < 128, 507, 'grant_limit');
    const minted = this.grant(body.role); const updated = clone(room);
    updated.grants[minted.grant.grantId] = minted.grant;
    await this.persist(updated);
    return { grantId: minted.grant.grantId, token: minted.token, role: minted.grant.role };
  }
  listGrants(room, grant) {
    this.owner(grant);
    return { grants: Object.values(room.grants).map(({ tokenHash: _secret, ...publicGrant }) => publicGrant) };
  }
  async revoke(room, grant, grantId) {
    this.owner(grant);
    ensure(validId(grantId) && own(room.grants, grantId), 404, 'grant_not_found');
    ensure(room.grants[grantId].role !== 'owner', 400, 'owner_cannot_be_revoked');
    const updated = clone(room);
    updated.grants[grantId].revokedAt ??= this.now();
    await this.persist(updated);
    const peers = this.presence.get(room.roomId);
    if (peers) for (const [key, value] of peers) if (value.grantId === grantId) peers.delete(key);
    return { revoked: true, grantId };
  }
  pdfDirectory(room) { return path.join(this.dataDir, 'pdf', room.roomId); }
  pdfPath(room, sha256) {
    ensure(typeof sha256 === 'string' && SHA256.test(sha256), 400, 'invalid_pdf_hash');
    return path.join(this.pdfDirectory(room), `${sha256}.pdf`);
  }
  listPdfs(room) {
    return { revision: room.pdfRevision ?? 0, documents: Object.values(room.pdfDocuments ?? {}).filter(document => document.withdrawnAt === null) };
  }
  async readPdfBytes(room, sha256) {
    const target = this.pdfPath(room, sha256);
    let bytes;
    try {
      const info = await stat(target);
      ensure(info.isFile() && info.size > 0 && info.size <= PDF_LIMITS.file, 409, 'pdf_stored_size_invalid');
      bytes = await readFile(target);
    } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    ensure(hash(bytes) === sha256 && bytes.subarray(0, 1024).includes(Buffer.from('%PDF-')), 409, 'pdf_stored_integrity_error');
    return bytes;
  }
  async getPdf(room, sha256) {
    this.pdfPath(room, sha256);
    const document = room.pdfDocuments?.[sha256];
    ensure(document && document.withdrawnAt === null, 404, 'pdf_not_shared');
    const bytes = await this.readPdfBytes(room, sha256);
    ensure(bytes && bytes.length === document.bytes, 409, 'pdf_stored_integrity_error');
    return { document, bytes };
  }
  async publishPdf(room, grant, sha256, body) {
    this.editor(grant);
    const target = this.pdfPath(room, sha256);
    fields(body, ['consent', 'name', 'totalPages', 'base64']);
    ensure(body.consent === 'share-complete-document', 400, 'pdf_explicit_consent_required');
    ensure(typeof body.name === 'string' && body.name.trim() && body.name.length <= 255 && !/[\u0000-\u001f\u007f/\\]/.test(body.name), 400, 'invalid_pdf_name');
    ensure(Number.isSafeInteger(body.totalPages) && body.totalPages > 0 && body.totalPages <= 10000, 400, 'invalid_pdf_page_count');
    ensure(typeof body.base64 === 'string' && body.base64.length <= Math.ceil(PDF_LIMITS.file / 3) * 4, 413, 'pdf_too_large');
    ensure(body.base64.length > 0 && body.base64.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(body.base64), 400, 'invalid_pdf_base64');
    const bytes = Buffer.from(body.base64, 'base64');
    ensure(bytes.length <= PDF_LIMITS.file && bytes.toString('base64') === body.base64, 400, 'invalid_pdf_base64');
    ensure(bytes.subarray(0, 1024).includes(Buffer.from('%PDF-')), 400, 'invalid_pdf_header');
    ensure(hash(bytes) === sha256, 409, 'pdf_hash_mismatch');
    const priorBytes = await this.readPdfBytes(room, sha256);
    ensure(!priorBytes || priorBytes.equals(bytes), 409, 'pdf_hash_collision');
    const directory = this.pdfDirectory(room);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await chmod(path.dirname(directory), 0o700); await chmod(directory, 0o700);
    const inventory = new Map();
    for (const filename of await readdir(directory)) {
      if (!filename.endsWith('.pdf')) continue;
      ensure(/^[0-9a-f]{64}\.pdf$/.test(filename), 409, 'pdf_storage_inventory_invalid');
      inventory.set(filename, (await stat(path.join(directory, filename))).size);
    }
    // Retained/withdrawn files and interrupted uploads still consume storage.
    inventory.set(`${sha256}.pdf`, bytes.length);
    ensure(inventory.size <= PDF_LIMITS.count, 413, 'pdf_document_count_limit');
    ensure([...inventory.values()].reduce((sum, size) => sum + size, 0) <= PDF_LIMITS.total, 413, 'pdf_room_size_limit');
    if (!priorBytes) {
      const temporary = path.join(directory, `.${sha256}.${randomUUID()}.tmp`);
      const file = await open(temporary, 'wx', 0o600);
      try {
        await file.writeFile(bytes); await file.sync(); await file.close();
        await rename(temporary, target);
        const folder = await open(directory, 'r');
        try { await folder.sync(); } finally { await folder.close(); }
      } catch (error) { await file.close().catch(() => {}); await unlink(temporary).catch(() => {}); throw error; }
    }
    const prior = room.pdfDocuments?.[sha256];
    if (prior?.withdrawnAt === null) {
      ensure(prior.bytes === bytes.length && prior.totalPages === body.totalPages, 409, 'pdf_metadata_conflict');
      return { document: prior, revision: room.pdfRevision ?? 0, idempotent: true };
    }
    const updated = clone(room);
    updated.pdfRevision = (room.pdfRevision ?? 0) + 1;
    const document = { schema: 'shared-pdf.v1', sha256, name: body.name, bytes: bytes.length, totalPages: body.totalPages,
      publishedBy: grant.grantId, publishedAt: this.now(), withdrawnAt: null };
    updated.pdfDocuments = { ...room.pdfDocuments, [sha256]: document };
    // This durable receipt is the publication commit point. An orphan file is
    // private and may be reused by a retry, but getPdf never serves it.
    await this.persist(updated);
    return { document, revision: updated.pdfRevision, idempotent: false };
  }
  async withdrawPdf(room, grant, sha256) {
    this.pdfPath(room, sha256);
    const document = room.pdfDocuments?.[sha256];
    ensure(document, 404, 'pdf_not_shared');
    ensure(grant.role === 'owner' || grant.role === 'editor' && grant.grantId === document.publishedBy, 403, 'pdf_publisher_or_owner_required');
    if (document.withdrawnAt !== null) return { withdrawn: true, revision: room.pdfRevision ?? 0 };
    const updated = clone(room);
    updated.pdfRevision = (room.pdfRevision ?? 0) + 1;
    updated.pdfDocuments[sha256].withdrawnAt = this.now();
    await this.persist(updated);
    return { withdrawn: true, revision: updated.pdfRevision };
  }
  operationIdentity(body) {
    ensure(validId(body.operationId) && validId(body.clientId), 400, 'invalid_operation_identity');
  }
  replay(room, grant, body, fingerprint) {
    if (!own(room.operations, body.operationId)) return null;
    const previous = room.operations[body.operationId];
    ensure(previous.grantId === grant.grantId && previous.clientId === body.clientId && previous.fingerprint === fingerprint, 409, 'operation_id_reused');
    return { ...this.snapshot(room, grant), accepted: true, operationId: body.operationId, idempotent: true, operationVersions: Object.fromEntries(previous.changes.map(change => [change.id, change.version])) };
  }
  conflicts(room, grant, changes) {
    const conflicts = changes.filter(change => (room.objectVersions[change.id] ?? 0) !== change.baseVersion).map(change => ({ id: change.id, expectedVersion: change.baseVersion, actualVersion: room.objectVersions[change.id] ?? 0, current: room.elements[change.id] ?? null }));
    ensure(conflicts.length === 0, 409, 'conflict', { conflicts, snapshot: this.snapshot(room, grant) });
  }
  async apply(room, grant, body) {
    this.editor(grant); fields(body, ['operationId', 'clientId', 'changes', 'files']); this.operationIdentity(body);
    ensure(Array.isArray(body.changes) && body.changes.length <= MAX_ELEMENTS, 400, 'invalid_changes');
    const unique = new Set();
    const changes = body.changes.map(change => {
      fields(change, ['id', 'baseVersion', 'element']);
      const baseVersion = change.baseVersion === null ? 0 : change.baseVersion;
      ensure(validId(change.id) && !unique.has(change.id) && Number.isSafeInteger(baseVersion) && baseVersion >= 0, 400, 'invalid_change');
      unique.add(change.id);
      ensure(change.element === null || (record(change.element) && change.element.id === change.id && typeof change.element.type === 'string'), 400, 'invalid_element');
      ensure(change.element === null || Buffer.byteLength(JSON.stringify(change.element)) <= 512 * 1024, 413, 'element_too_large');
      return { id: change.id, baseVersion, element: change.element };
    });
    const files = cleanFiles(body.files);
    const fingerprint = hash(canonical({ kind: 'edit', changes, files }));
    const replay = this.replay(room, grant, body, fingerprint); if (replay) return replay;
    this.conflicts(room, grant, changes);
    for (const [id, file] of Object.entries(files)) {
      ensure(!own(room.files, id) || (room.files[id].dataURL === file.dataURL && room.files[id].mimeType === file.mimeType), 409, 'file_id_conflict', { fileId: id });
    }
    const mergedFiles = { ...room.files, ...files };
    ensure(Object.values(mergedFiles).reduce((total, file) => total + Buffer.from(file.dataURL.split(',')[1], 'base64').length, 0) <= TOTAL_FILE_BYTES, 413, 'room_files_too_large');
    for (const change of changes) {
      if (change.element?.type === 'image' && change.element.fileId && !change.element.isDeleted) ensure(own(mergedFiles, change.element.fileId), 400, 'missing_image_file', { fileId: change.element.fileId });
    }
    return this.commit(room, grant, body, changes, mergedFiles, fingerprint, 'edit');
  }
  async commit(room, grant, body, changes, files, fingerprint, kind, undoTarget) {
    ensure(room.order.length < MAX_OPERATIONS, 507, 'operation_history_limit');
    const updated = clone(room); updated.revision += 1; updated.files = files;
    const storedChanges = changes.map(change => {
      const before = updated.elements[change.id] ?? null;
      const version = (updated.objectVersions[change.id] ?? 0) + 1;
      updated.objectVersions[change.id] = version;
      if (change.element === null) delete updated.elements[change.id];
      else updated.elements[change.id] = clone(change.element);
      return { id: change.id, before, element: change.element, version };
    });
    ensure(Object.keys(updated.elements).length <= MAX_ELEMENTS, 413, 'element_count_limit');
    const receipt = { operationId: body.operationId, clientId: body.clientId, grantId: grant.grantId, fingerprint, revision: updated.revision, kind, changes: storedChanges, createdAt: this.now() };
    updated.operations[body.operationId] = receipt; updated.order.push(body.operationId);
    if (undoTarget) updated.operations[undoTarget].undoneBy = body.operationId;
    await this.persist(updated);
    return { ...this.snapshot(updated, grant), accepted: true, operationId: body.operationId, idempotent: false, operationVersions: Object.fromEntries(storedChanges.map(change => [change.id, change.version])) };
  }
  async undo(room, grant, body) {
    this.editor(grant); fields(body, ['operationId', 'clientId', 'targetOperationId']); this.operationIdentity(body);
    ensure(validId(body.targetOperationId), 400, 'invalid_target_operation');
    const fingerprint = hash(canonical({ kind: 'undo', targetOperationId: body.targetOperationId }));
    const replay = this.replay(room, grant, body, fingerprint); if (replay) return replay;
    const target = room.operations[body.targetOperationId]; ensure(target, 404, 'operation_not_found');
    ensure(target.grantId === grant.grantId && target.clientId === body.clientId, 403, 'operation_not_yours');
    ensure(target.kind === 'edit' && !target.undoneBy, 409, 'operation_already_undone');
    const changes = target.changes.map(change => ({ id: change.id, baseVersion: change.version, element: change.before }));
    this.conflicts(room, grant, changes);
    return this.commit(room, grant, body, changes, room.files, fingerprint, 'undo', body.targetOperationId);
  }
  events(room, grant, since) {
    ensure(Number.isSafeInteger(since) && since >= 0, 400, 'invalid_revision');
    if (since > room.revision) return { revision: room.revision, pdfRevision: room.pdfRevision ?? 0, events: [], resetRequired: true, snapshot: this.snapshot(room, grant) };
    const recent = room.order.slice(-1000).map(id => room.operations[id]);
    if (recent.length && since < recent[0].revision - 1) return { revision: room.revision, pdfRevision: room.pdfRevision ?? 0, events: [], resetRequired: true, snapshot: this.snapshot(room, grant) };
    return { revision: room.revision, pdfRevision: room.pdfRevision ?? 0, resetRequired: false, events: recent.filter(event => event.revision > since).map(({ revision, operationId, clientId, kind, changes }) => ({ revision, operationId, clientId, kind, changes: changes.map(({ id, element }) => ({ id, element })), objectVersions: Object.fromEntries(changes.map(({ id, version }) => [id, version])) })) };
  }
  updatePresence(room, grant, body) {
    fields(body, ['clientId', 'name', 'cursor']);
    ensure(validId(body.clientId) && (body.name === undefined || (typeof body.name === 'string' && body.name.length <= 60)), 400, 'invalid_presence');
    ensure(body.cursor === null || (record(body.cursor) && Number.isFinite(body.cursor.x) && Number.isFinite(body.cursor.y)), 400, 'invalid_cursor');
    const peers = this.presence.get(room.roomId) ?? new Map();
    const key = `${grant.grantId}:${body.clientId}`;
    for (const [id, peer] of peers) if (this.now() - peer.seenAt > 30000) peers.delete(id);
    ensure(peers.has(key) || peers.size < 256, 429, 'presence_limit');
    peers.set(key, { clientId: body.clientId, grantId: grant.grantId, role: grant.role, name: body.name ?? '', cursor: body.cursor, seenAt: this.now() });
    this.presence.set(room.roomId, peers);
    return this.getPresence(room);
  }
  getPresence(room) {
    const peers = this.presence.get(room.roomId) ?? new Map();
    for (const [id, peer] of peers) if (this.now() - peer.seenAt > 30000 || room.grants[peer.grantId]?.revokedAt !== null) peers.delete(id);
    return { peers: [...peers.values()] };
  }
}
