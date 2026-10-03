import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { request } from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { createRoomSyncServer } from './server.mjs';

const element = (id, x = 0) => ({ id, type: 'rectangle', x, y: 0, width: 100, height: 70, version: 1 });
async function fixture(t, options = {}) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'ardesia-room-sync-test-'));
  const app = await createRoomSyncServer({ dataDir, ...options });
  await app.listen(0);
  let base = `http://127.0.0.1:${app.server.address().port}`;
  t.after(() => app.close());
  const call = async (method, route, token, body, headers = {}) => {
    const response = await fetch(`${base}${route}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, body: response.status === 204 ? null : await response.json(), headers: response.headers };
  };
  const created = await call('POST', '/rooms', null, { clientId: 'owner-browser', title: 'Circuit lesson' });
  assert.equal(created.status, 201);
  const owner = created.body;
  const route = `/rooms/${owner.roomId}`;
  return { app, dataDir, owner, route, call, setBase(value) { base = value; } };
}

test('two clients merge independent objects, reject stale same-object edits, and recover through snapshot/events', async t => {
  const { call, owner, route } = await fixture(t);
  const editor = (await call('POST', `${route}/grants`, owner.token, { role: 'editor' })).body;
  const op = (id, clientId, changes) => ({ operationId: id, clientId, changes });
  const a = await call('POST', `${route}/operations`, owner.token, op('a', 'owner-browser', [{ id: 'A', baseVersion: 0, element: element('A') }]));
  assert.equal(a.status, 200);
  const b = await call('POST', `${route}/operations`, editor.token, op('b', 'student-browser', [{ id: 'B', baseVersion: null, element: element('B', 200) }]));
  assert.equal(b.status, 200);
  assert.equal(b.body.elements.length, 2);
  const changed = await call('POST', `${route}/operations`, editor.token, op('c', 'student-browser', [{ id: 'A', baseVersion: 1, element: element('A', 50) }]));
  assert.equal(changed.status, 200);
  const replayAfterRemoteEdit = await call('POST', `${route}/operations`, owner.token, op('a', 'owner-browser', [{ id: 'A', baseVersion: 0, element: element('A') }]));
  assert.equal(replayAfterRemoteEdit.body.operationVersions.A, 1);
  assert.equal(replayAfterRemoteEdit.body.objectVersions.A, 2);
  const stale = await call('POST', `${route}/operations`, owner.token, op('d', 'owner-browser', [{ id: 'A', baseVersion: 1, element: element('A', 99) }, { id: 'B', baseVersion: 1, element: element('B', 500) }]));
  assert.equal(stale.status, 409);
  assert.equal(stale.body.conflicts[0].actualVersion, 2);
  assert.equal(stale.body.conflicts[0].current.x, 50);
  assert.equal(stale.body.snapshot.elements.find(e => e.id === 'B').x, 200);
  const snapshot = await call('GET', `${route}/snapshot`, editor.token);
  assert.equal(snapshot.body.role, 'editor');
  assert.equal(snapshot.body.grantId, editor.grantId);
  assert.deepEqual(snapshot.body.objectVersions, { A: 2, B: 1 });
  const events = await call('GET', `${route}/events?since=1`, editor.token);
  assert.deepEqual(events.body.events.map(e => e.operationId), ['b', 'c']);
  assert.equal(events.body.revision, 3);
});

test('roles come from revocable grants; viewer, forged role, and revoked tokens cannot mutate', async t => {
  const { call, owner, route } = await fixture(t);
  const viewer = (await call('POST', `${route}/grants`, owner.token, { role: 'viewer' })).body;
  const editor = (await call('POST', `${route}/grants`, owner.token, { role: 'editor' })).body;
  assert.equal((await call('GET', `${route}/snapshot?role=owner`, viewer.token)).body.role, 'viewer');
  assert.equal((await call('GET', `${route}/snapshot?role=owner`, null)).status, 401);
  assert.equal((await call('POST', `${route}/operations`, viewer.token, { operationId: 'forbidden', clientId: 'reader', changes: [] })).status, 403);
  assert.equal((await call('POST', `${route}/grants`, editor.token, { role: 'owner' })).status, 403);
  assert.equal((await call('DELETE', `${route}/grants/${viewer.grantId}`, editor.token)).status, 403);
  assert.equal((await call('DELETE', `${route}/grants/${viewer.grantId}`, owner.token)).status, 200);
  assert.equal((await call('GET', `${route}/snapshot`, viewer.token)).status, 401);
  assert.equal((await call('DELETE', `${route}/grants/${owner.snapshot.grantId}`, owner.token)).status, 400);
  const grants = await call('GET', `${route}/grants`, owner.token);
  assert.ok(grants.body.grants.find(g => g.grantId === viewer.grantId).revokedAt);
  assert.ok(!JSON.stringify(grants.body).includes('tokenHash'));
});

test('undo affects only the caller operation and is conditional on unchanged versions', async t => {
  const { call, owner, route } = await fixture(t);
  const editor = (await call('POST', `${route}/grants`, owner.token, { role: 'editor' })).body;
  await call('POST', `${route}/operations`, owner.token, { operationId: 'first', clientId: 'one', changes: [{ id: 'A', baseVersion: 0, element: element('A') }] });
  await call('POST', `${route}/operations`, editor.token, { operationId: 'second', clientId: 'two', changes: [{ id: 'B', baseVersion: 0, element: element('B') }] });
  assert.equal((await call('POST', `${route}/undo`, editor.token, { operationId: 'steal', clientId: 'one', targetOperationId: 'first' })).status, 403);
  const undone = await call('POST', `${route}/undo`, owner.token, { operationId: 'undo-first', clientId: 'one', targetOperationId: 'first' });
  assert.equal(undone.status, 200);
  assert.deepEqual(undone.body.elements.map(e => e.id), ['B']);
  assert.equal(undone.body.objectVersions.A, 2);
  await call('POST', `${route}/operations`, owner.token, { operationId: 'other-edit', clientId: 'one', changes: [{ id: 'B', baseVersion: 1, element: element('B', 44) }] });
  const blocked = await call('POST', `${route}/undo`, editor.token, { operationId: 'undo-second', clientId: 'two', targetOperationId: 'second' });
  assert.equal(blocked.status, 409);
  assert.equal(blocked.body.conflicts[0].current.x, 44);
});

test('retry remains idempotent across restart and private disk persistence contains no bearer tokens', async t => {
  const { app, call, dataDir, owner, route, setBase } = await fixture(t);
  const payload = { operationId: 'durable', clientId: 'one', changes: [{ id: 'A', baseVersion: 0, element: element('A') }] };
  assert.equal((await call('POST', `${route}/operations`, owner.token, payload)).status, 200);
  const replay = await call('POST', `${route}/operations`, owner.token, payload);
  assert.equal(replay.body.revision, 1);
  assert.equal(replay.body.idempotent, true);
  assert.equal((await call('POST', `${route}/operations`, owner.token, { ...payload, changes: [] })).status, 409);
  await app.close();
  const restarted = await createRoomSyncServer({ dataDir });
  await restarted.listen(0);
  t.after(() => restarted.close());
  setBase(`http://127.0.0.1:${restarted.server.address().port}`);
  const restored = await call('POST', `${route}/operations`, owner.token, payload);
  assert.equal(restored.body.idempotent, true);
  assert.equal(restored.body.revision, 1);
  assert.equal(restored.body.elements[0].id, 'A');
  const diskFile = path.join(dataDir, `${owner.roomId}.json`);
  assert.ok(!(await readFile(diskFile, 'utf8')).includes(owner.token));
  assert.equal((await stat(diskFile)).mode & 0o777, 0o600);
  assert.equal((await stat(dataDir)).mode & 0o777, 0o700);
});

test('image/PDF files travel with the snapshot, reject remote URLs, and cannot be overwritten', async t => {
  const { call, owner, route } = await fixture(t);
  const png = { id: 'imageA', mimeType: 'image/png', dataURL: 'data:image/png;base64,iVBORw0KGgo=', created: 1 };
  const operation = { operationId: 'with-file', clientId: 'one', changes: [{ id: 'A', baseVersion: 0, element: { ...element('A'), type: 'image', fileId: 'imageA' } }], files: { imageA: png } };
  assert.equal((await call('POST', `${route}/operations`, owner.token, operation)).status, 200);
  const snapshot = await call('GET', `${route}/snapshot`, owner.token);
  assert.deepEqual(snapshot.body.files.imageA, png);
  const overwrite = await call('POST', `${route}/operations`, owner.token, { ...operation, operationId: 'overwrite', changes: [], files: { imageA: { ...png, dataURL: 'data:image/png;base64,YQ==' } } });
  assert.equal(overwrite.status, 409);
  const remote = await call('POST', `${route}/operations`, owner.token, { ...operation, operationId: 'remote', changes: [], files: { imageB: { ...png, id: 'imageB', dataURL: 'https://example.com/private.png' } } });
  assert.equal(remote.status, 400);
});

test('CORS and content type guard browser access; presence expires and revocation removes it', async t => {
  let clock = 1000;
  const { call, owner, route } = await fixture(t, { now: () => clock });
  assert.equal((await call('GET', `${route}/snapshot`, owner.token, undefined, { Origin: 'https://evil.example' })).status, 403);
  const allowed = await call('GET', `${route}/snapshot`, owner.token, undefined, { Origin: 'http://localhost:5173' });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal((await call('POST', '/rooms', null, {}, { 'Content-Type': 'text/plain' })).status, 415);
  const viewer = (await call('POST', `${route}/grants`, owner.token, { role: 'viewer' })).body;
  assert.equal((await call('POST', `${route}/presence`, viewer.token, { clientId: 'reader', cursor: { x: 10, y: 20 }, name: 'Reader' })).status, 200);
  assert.equal((await call('GET', `${route}/presence`, owner.token)).body.peers.length, 1);
  clock += 30001;
  assert.equal((await call('GET', `${route}/presence`, owner.token)).body.peers.length, 0);
  await call('POST', `${route}/presence`, viewer.token, { clientId: 'reader', cursor: null });
  await call('DELETE', `${route}/grants/${viewer.grantId}`, owner.token);
  assert.equal((await call('GET', `${route}/presence`, owner.token)).body.peers.length, 0);
});

test('simultaneous HTTP requests serialize; tombstone versions prevent stale resurrection', async t => {
  const { call, owner, route } = await fixture(t);
  const editor = (await call('POST', `${route}/grants`, owner.token, { role: 'editor' })).body;
  const competing = await Promise.all([
    call('POST', `${route}/operations`, owner.token, { operationId: 'race-a', clientId: 'a', changes: [{ id: 'A', baseVersion: 0, element: element('A', 1) }] }),
    call('POST', `${route}/operations`, editor.token, { operationId: 'race-b', clientId: 'b', changes: [{ id: 'A', baseVersion: 0, element: element('A', 2) }] }),
  ]);
  assert.deepEqual(competing.map(result => result.status).sort(), [200, 409]);
  const independent = await Promise.all([
    call('POST', `${route}/operations`, owner.token, { operationId: 'race-c', clientId: 'a', changes: [{ id: 'C', baseVersion: 0, element: element('C') }] }),
    call('POST', `${route}/operations`, editor.token, { operationId: 'race-d', clientId: 'b', changes: [{ id: 'D', baseVersion: 0, element: element('D') }] }),
  ]);
  assert.deepEqual(independent.map(result => result.status), [200, 200]);
  const deleted = await call('POST', `${route}/operations`, owner.token, { operationId: 'delete', clientId: 'a', changes: [{ id: 'A', baseVersion: 1, element: null }] });
  assert.equal(deleted.body.objectVersions.A, 2);
  assert.equal(deleted.body.elements.length, 2);
  const stale = await call('POST', `${route}/operations`, editor.token, { operationId: 'resurrect', clientId: 'b', changes: [{ id: 'A', baseVersion: 0, element: element('A') }] });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.conflicts[0].current, null);
  const reset = await call('GET', `${route}/events?since=900`, owner.token);
  assert.equal(reset.body.resetRequired, true);
  assert.equal(reset.body.snapshot.revision, 4);
});

test('invalid IDs, duplicate objects, private metadata and missing files fail without partial writes', async t => {
  const { call, owner, route } = await fixture(t);
  const base = { operationId: 'invalid', clientId: 'a', changes: [{ id: 'A', baseVersion: 0, element: element('A') }] };
  assert.equal((await call('POST', `${route}/operations`, owner.token, { ...base, privateNotes: 'do not share' })).status, 400);
  assert.equal((await call('POST', `${route}/operations`, owner.token, { ...base, changes: [...base.changes, ...base.changes] })).status, 400);
  assert.equal((await call('POST', `${route}/operations`, owner.token, { ...base, changes: [{ id: '__proto__', baseVersion: 0, element: element('__proto__') }] })).status, 400);
  assert.equal((await call('POST', `${route}/operations`, owner.token, { ...base, changes: [{ id: 'A', baseVersion: 0, element: { ...element('A'), type: 'image', fileId: 'absent' } }] })).status, 400);
  const snapshot = await call('GET', `${route}/snapshot`, owner.token);
  assert.equal(snapshot.body.revision, 0);
  assert.deepEqual(snapshot.body.elements, []);
});

test('explicit origin allowlist replaces localhost defaults, and DNS rebinding Host is rejected', async t => {
  const { app, call, owner, route } = await fixture(t, { allowedOrigins: ['https://classroom.example'] });
  assert.equal((await call('GET', `${route}/snapshot`, owner.token, undefined, { Origin: 'http://localhost:5173' })).status, 403);
  assert.equal((await call('GET', `${route}/snapshot`, owner.token, undefined, { Origin: 'https://classroom.example' })).status, 200);
  // fetch controls its own Host header; use raw HTTP to exercise DNS rebinding.
  const deniedHost = await new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: app.server.address().port, path: `${route}/snapshot`, headers: { Host: 'attacker.example', Authorization: `Bearer ${owner.token}` } }, response => { response.resume(); resolve(response.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(deniedHost, 403);
  const preflight = await call('OPTIONS', `${route}/operations`, null, undefined, { Origin: 'https://classroom.example', 'Access-Control-Request-Method': 'POST' });
  assert.equal(preflight.status, 204);
  assert.ok(preflight.headers.get('access-control-allow-headers').includes('Authorization'));
});
