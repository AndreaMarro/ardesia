/** Operator-only reconciliation of the existing durable upload-intent protocol. */
export const PROJECT = 'gavfmrynhsdxdqbmdkxq';
export const API = `https://${PROJECT}.supabase.co`;
export const BUCKET = 'ardesia-originals';
export const MAX_LIMIT = 100;
const ID = /^[a-f0-9]{32}$/;

type Intent = { id: string; state: string; expires_at: number };
export interface CleanupTransaction {
  lock(id: string): Promise<void>;
  intent(id: string): Promise<Intent | undefined>;
  clock(): Promise<number>;
  hasMetadata(id: string): Promise<boolean>;
  reconcile(id: string): Promise<void>;
  deleteIntent(id: string): Promise<void>;
}
export interface CleanupDatabase {
  candidates(limit: number): Promise<string[]>;
  transaction<T>(apply: (tx: CleanupTransaction) => Promise<T>): Promise<T>;
  close?(): Promise<void>;
}
export interface CleanupStorage { removeAndVerifyAbsent(id: string): Promise<void> }
export type OperatorConfig = { capabilitySha256: string; expiresAt: number };

// Python PostgresStudyStore.lock_aggregate uses json.dumps with a comma-space.
// JSON.stringify alone would acquire a DIFFERENT lock and break metadata-wins.
export function uploadLockKey(id: string): string {
  if (!ID.test(id)) throw new Error('invalid_upload_id');
  return '["asset.upload", ' + JSON.stringify(id) + ']';
}

export async function cleanOne(db: CleanupDatabase, storage: CleanupStorage, id: string): Promise<'cleaned'|'skipped'> {
  if (!ID.test(id)) throw new Error('invalid_upload_id');
  return await db.transaction(async tx => {
    await tx.lock(id);
    const intent = await tx.intent(id);
    if (!intent || intent.state === 'committed') return 'skipped';
    // Recovery waits the entire durable ten-minute lease, including a failed
    // compensation attempt. The browser runtime's immediate path is unchanged.
    if (!['pending','cleanup_required'].includes(intent.state) || intent.expires_at > await tx.clock()) return 'skipped';
    if (await tx.hasMetadata(id)) {
      await tx.reconcile(id);
      return 'skipped';
    }
    await storage.removeAndVerifyAbsent(id);
    await tx.deleteIntent(id); // FK cascade releases the existing idempotency key.
    return 'cleaned';
  });
}

export class ProviderStorage implements CleanupStorage {
  constructor(private key: string, private fetcher: typeof fetch = fetch) {}
  async removeAndVerifyAbsent(id: string): Promise<void> {
    if (!ID.test(id) || !this.key) throw new Error('cleanup_unavailable');
    const headers = { apikey:this.key, Authorization:'Bearer '+this.key, 'Content-Type':'application/json' };
    const response = await this.fetcher(`${API}/storage/v1/object/${BUCKET}`, {
      method:'DELETE',headers,body:JSON.stringify({prefixes:[id]}),redirect:'error',signal:AbortSignal.timeout(15000),
    });
    await response.body?.cancel();
    if (!response.ok && response.status!==404) throw new Error('cleanup_unavailable');
    const absent = await this.fetcher(`${API}/storage/v1/object/info/authenticated/${BUCKET}/${id}`, {
      method:'GET',headers,redirect:'error',signal:AbortSignal.timeout(5000),
    });
    if (absent.status===404) { await absent.body?.cancel(); return; }
    if (absent.status!==400 || !absent.body) {
      await absent.body?.cancel(); throw new Error('cleanup_not_verified');
    }
    // This provider returns HTTP400 for a missing object's metadata, with the
    // actual404 in its JSON. HEAD omits that body and cannot prove absence.
    const reader=absent.body.getReader();const chunks:Uint8Array[]=[];let total=0;
    while (true) {
      const {value,done}=await reader.read();
      if (done) break;
      total+=value.length;
      if (total>4096) { await reader.cancel(); throw new Error('cleanup_not_verified'); }
      chunks.push(value);
    }
    const bytes=new Uint8Array(total);let offset=0;
    for (const chunk of chunks) { bytes.set(chunk,offset);offset+=chunk.length; }
    let metadata;
    try { metadata=JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error('cleanup_not_verified'); }
    if (!metadata || metadata.statusCode!=='404' || metadata.error!=='not_found' || metadata.code!=='NoSuchKey') {
      throw new Error('cleanup_not_verified');
    }
  }
}

async function authorized(request: Request, config: OperatorConfig, now: number): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(config.capabilitySha256) || !Number.isInteger(config.expiresAt)
      || config.expiresAt <= now || config.expiresAt > now+3600) return false;
  const match = /^Bearer ([a-f0-9]{64})$/.exec(request.headers.get('Authorization') || '');
  if (!match) return false;
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(match[1])));
  const hash = Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('');
  let different = 0;
  for (let i=0;i<hash.length;i++) different |= hash.charCodeAt(i)^config.capabilitySha256.charCodeAt(i);
  return different===0;
}

async function boundedBody(request: Request): Promise<Record<string,unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid_body');
  const chunks: Uint8Array[] = []; let total=0;
  while (true) {
    const {value,done}=await reader.read();
    if (done) break;
    total+=value.length;
    if (total>512) { await reader.cancel(); throw new Error('invalid_body'); }
    chunks.push(value);
  }
  const bytes=new Uint8Array(total);let offset=0;
  for (const chunk of chunks) { bytes.set(chunk,offset);offset+=chunk.length; }
  const body=JSON.parse(new TextDecoder().decode(bytes));
  if (!body || Array.isArray(body) || typeof body!=='object') throw new Error('invalid_body');
  return body;
}

export function createHandler(config: OperatorConfig, db: CleanupDatabase, storage: CleanupStorage, now=()=>Date.now()/1000) {
  const reply=(body: unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  return async (request: Request): Promise<Response> => {
    if (!await authorized(request,config,now())) return reply({error:'operator_denied'},401);
    if (request.headers.has('Origin')) return reply({error:'operator_denied'},403);
    if (request.method!=='POST') return reply({error:'method_not_allowed'},405);
    let body: Record<string,unknown>;
    try { body=await boundedBody(request); } catch { return reply({error:'invalid_recovery_command'},422); }
    if (body.action==='candidates' && Object.keys(body).sort().join(',')==='action,limit'
        && typeof body.limit==='number' && Number.isInteger(body.limit) && body.limit>=1 && body.limit<=MAX_LIMIT) {
      try { return reply({ids:await db.candidates(body.limit)}); } catch { return reply({error:'recovery_unavailable'},503); }
    }
    if (body.action==='recover' && Object.keys(body).sort().join(',')==='action,id'
        && typeof body.id==='string' && ID.test(body.id)) {
      try { return reply({outcome:await cleanOne(db,storage,body.id)}); } catch { return reply({error:'recovery_unavailable'},503); }
    }
    return reply({error:'invalid_recovery_command'},422);
  };
}
