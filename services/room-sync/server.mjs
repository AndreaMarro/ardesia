import { createServer } from 'node:http';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { RoomError, RoomStore, ensure } from './store.mjs';

const MAX_BODY_BYTES = 30 * 1024 * 1024;
const LOCAL_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/;

async function jsonBody(request, beforeParse) {
  ensure(request.headers['content-type']?.split(';')[0].trim().toLowerCase() === 'application/json', 415, 'json_required');
  const declared = Number(request.headers['content-length'] || 0);
  ensure(Number.isFinite(declared) && declared <= MAX_BODY_BYTES, 413, 'request_too_large');
  const chunks = []; let total = 0;
  for await (const chunk of request) { total += chunk.length; ensure(total <= MAX_BODY_BYTES, 413, 'request_too_large'); chunks.push(chunk); }
  if (beforeParse) await beforeParse();
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new RoomError(400, 'invalid_json'); }
  ensure(body !== null && typeof body === 'object' && !Array.isArray(body), 400, 'invalid_payload');
  return body;
}

export async function createRoomSyncServer(options = {}) {
  const host = options.host ?? process.env.ROOM_SYNC_HOST ?? '127.0.0.1';
  const dataDir = path.resolve(options.dataDir ?? process.env.ROOM_SYNC_DATA_DIR ?? path.join(homedir(), '.local', 'share', 'ardesia', 'room-sync'));
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  ensure(dataDir !== repoRoot && !dataDir.startsWith(`${repoRoot}${path.sep}`), 400, 'data_directory_must_be_outside_repository');
  const allowedOrigins = options.allowedOrigins ?? (process.env.ROOM_SYNC_ALLOWED_ORIGINS ? process.env.ROOM_SYNC_ALLOWED_ORIGINS.split(',').map(value => value.trim()).filter(Boolean) : null);
  ensure(allowedOrigins === null || (Array.isArray(allowedOrigins) && allowedOrigins.every(origin => {
    try { const url = new URL(origin); return ['http:', 'https:'].includes(url.protocol) && url.origin === origin; } catch { return false; }
  })), 400, 'invalid_origin_allowlist');
  const allowedHosts = new Set(['localhost', '127.0.0.1', '[::1]', host, ...(options.allowedHosts ?? process.env.ROOM_SYNC_ALLOWED_HOSTS?.split(',').map(value => value.trim()) ?? [])]);
  const store = await RoomStore.open(dataDir, { now: options.now });
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Vary', 'Origin');
    const send = (status, body) => { response.statusCode = status; response.end(body === undefined ? undefined : JSON.stringify(body)); };
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      ensure(allowedHosts.has(url.hostname), 403, 'host_not_allowed');
      const origin = request.headers.origin;
      if (origin) {
        ensure(allowedOrigins ? allowedOrigins.includes(origin) : LOCAL_ORIGIN.test(origin), 403, 'origin_not_allowed');
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        response.setHeader('Access-Control-Max-Age', '600');
      }
      if (request.method === 'OPTIONS') return send(204);
      if (request.method === 'GET' && url.pathname === '/health') return send(200, { status: 'ok', service: 'ardesia-room-sync', protocol: 1 });
      if (request.method === 'POST' && url.pathname === '/rooms') return send(201, await store.create(await jsonBody(request)));
      const match = /^\/rooms\/([A-Za-z0-9_-]+)\/(snapshot|operations|undo|events|grants|presence|pdf)(?:\/([A-Za-z0-9_-]+))?$/.exec(url.pathname);
      ensure(match, 404, 'not_found');
      const [, roomId, resource, itemId] = match;
      const token = /^Bearer ([A-Za-z0-9_-]+)$/.exec(request.headers.authorization ?? '')?.[1];
      if (resource === 'pdf') {
        // Reject missing/revoked/wrong-room grants before consuming a large body.
        const preflight = () => store.access(roomId, token, (_room, grant) => {
          if (request.method === 'POST') store.editor(grant);
        });
        await preflight();
        const body = request.method === 'POST' ? await jsonBody(request, preflight) : undefined;
        const result = await store.access(roomId, token, async (room, grant) => {
          if (!itemId && request.method === 'GET') return store.listPdfs(room);
          ensure(itemId, 404, 'not_found');
          if (request.method === 'POST') return store.publishPdf(room, grant, itemId, body);
          if (request.method === 'DELETE') return store.withdrawPdf(room, grant, itemId);
          if (request.method === 'GET') return store.getPdf(room, itemId);
          throw new RoomError(405, 'method_not_allowed');
        });
        if (request.method === 'GET' && itemId) {
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/pdf');
          response.setHeader('Content-Length', result.bytes.length);
          response.setHeader('Content-Disposition', 'attachment');
          return response.end(result.bytes);
        }
        return send(200, result);
      }
      // Read a bounded request before locking the room, so a slow sender cannot
      // prevent another participant's read or edit from making progress.
      const body = request.method === 'POST' ? await jsonBody(request) : undefined;
      const result = await store.access(roomId, token, async (room, grant) => {
        ensure(!itemId || resource === 'grants', 404, 'not_found');
        if (resource === 'snapshot' && request.method === 'GET') return store.snapshot(room, grant);
        if (resource === 'operations' && request.method === 'POST') return store.apply(room, grant, body);
        if (resource === 'undo' && request.method === 'POST') return store.undo(room, grant, body);
        if (resource === 'events' && request.method === 'GET') return store.events(room, grant, Number(url.searchParams.get('since') ?? 0));
        if (resource === 'grants' && !itemId && request.method === 'POST') return store.createGrant(room, grant, body);
        if (resource === 'grants' && !itemId && request.method === 'GET') return store.listGrants(room, grant);
        if (resource === 'grants' && itemId && request.method === 'DELETE') return store.revoke(room, grant, itemId);
        if (resource === 'presence' && request.method === 'POST') return store.updatePresence(room, grant, body);
        if (resource === 'presence' && request.method === 'GET') return store.getPresence(room);
        throw new RoomError(405, 'method_not_allowed');
      });
      send(200, result);
    } catch (error) {
      // Error messages, headers, request paths and bodies can contain private
      // material or capability tokens. Do not log any of them.
      if (error instanceof RoomError) send(error.status, error.detail);
      else send(500, { error: 'internal_error' });
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 1000;
  return {
    server,
    async listen(port = Number(process.env.ROOM_SYNC_PORT ?? 4318)) {
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, () => { server.off('error', reject); resolve(); }); });
    },
    async close() {
      if (!server.listening) return;
      await new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeIdleConnections(); });
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const app = await createRoomSyncServer();
    await app.listen();
    console.log(`ARDesia room sync listening on ${app.server.address().address}:${app.server.address().port}`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { app.close().then(() => process.exit(0)); });
  } catch {
    console.error('Room sync could not start. Check the bind address, port, origin configuration and private storage permissions.');
    process.exitCode = 1;
  }
}
