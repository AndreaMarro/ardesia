import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { RoomStore, PDF_LIMITS } from './store.mjs';

const source = await readFile(new URL('../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const body = bytes => ({consent:'share-complete-document',name:'ELAB-Collaborator-Deck.pdf',totalPages:7,base64:bytes.toString('base64')});
async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'ardesia-pdf-store-'));
  const store = await RoomStore.open(directory);
  const owner = await store.create({clientId:'owner'});
  const access = (token, call) => store.access(owner.roomId, token, call);
  return {store, owner, directory, access};
}

test('PDF is private by default, explicitly published, exact after restart, and absent from canvas file bytes', async () => {
  const {store, owner, directory, access} = await fixture(), sha = digest(source);
  await assert.rejects(access(owner.token, room=>store.getPdf(room,sha)), /pdf_not_shared/);
  await assert.rejects(access(owner.token,(room,grant)=>store.apply(room,grant,{operationId:'bypass',clientId:'owner',changes:[],files:{original:{id:'original',mimeType:'application/pdf',dataURL:'data:application/pdf;base64,'+source.toString('base64')}}})), /pdf_requires_explicit_sharing/);
  await assert.rejects(access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,{...body(source),consent:undefined})), /pdf_explicit_consent_required/);
  const published = await access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source)));
  assert.equal(published.idempotent,false);
  assert.equal(published.revision,1);
  const snapshot = await access(owner.token,(room,grant)=>store.snapshot(room,grant));
  assert.equal(snapshot.pdfDocuments[0].sha256,sha);
  assert.equal(snapshot.pdfRevision,1);
  assert.equal(snapshot.revision,0);
  assert.deepEqual(snapshot.files,{});
  assert.ok(!JSON.stringify(snapshot).includes(source.toString('base64')));
  const replay = await access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source)));
  assert.equal(replay.idempotent,true);
  assert.equal(replay.revision,1);
  const restarted = await RoomStore.open(directory);
  const restored = await restarted.access(owner.roomId,owner.token,room=>restarted.getPdf(room,sha));
  assert.deepEqual(restored.bytes,source);
  assert.equal((await stat(path.join(directory,'pdf',owner.roomId,sha+'.pdf'))).mode & 0o777,0o600);
  assert.equal((await stat(path.join(directory,'pdf',owner.roomId))).mode & 0o777,0o700);
});

test('current roles and revocation protect upload/download/withdrawal; another room token cannot read', async () => {
  const {store,owner,access} = await fixture(), sha=digest(source);
  const viewer = await access(owner.token,(room,grant)=>store.createGrant(room,grant,{role:'viewer'}));
  const editor = await access(owner.token,(room,grant)=>store.createGrant(room,grant,{role:'editor'}));
  const otherEditor = await access(owner.token,(room,grant)=>store.createGrant(room,grant,{role:'editor'}));
  await assert.rejects(access(viewer.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source))),/read_only/);
  await access(editor.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source)));
  assert.deepEqual((await access(viewer.token,room=>store.getPdf(room,sha))).bytes,source);
  await assert.rejects(access(otherEditor.token,(room,grant)=>store.withdrawPdf(room,grant,sha)),/pdf_publisher_or_owner_required/);
  const another = await store.create({clientId:'other-room'});
  await assert.rejects(store.access(another.roomId,viewer.token,room=>store.getPdf(room,sha)),/unauthorized/);
  await access(owner.token,(room,grant)=>store.revoke(room,grant,viewer.grantId));
  await assert.rejects(access(viewer.token,room=>store.getPdf(room,sha)),/unauthorized/);
  await access(editor.token,(room,grant)=>store.withdrawPdf(room,grant,sha));
  assert.deepEqual((await access(owner.token,room=>store.listPdfs(room))).documents,[]);
  await assert.rejects(access(owner.token,room=>store.getPdf(room,sha)),/pdf_not_shared/);
  await access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source)));
  assert.deepEqual((await access(owner.token,room=>store.getPdf(room,sha))).bytes,source);
});

test('uncommitted bytes are never served and retry completes the existing publication transaction', async () => {
  const {store,owner,access,directory}=await fixture(), sha=digest(source);
  const persist=store.persist.bind(store);
  store.persist=async()=>{throw new Error('disk receipt failure');};
  await assert.rejects(access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source))),/disk receipt failure/);
  await assert.rejects(access(owner.token,room=>store.getPdf(room,sha)),/pdf_not_shared/);
  assert.deepEqual(await readFile(path.join(directory,'pdf',owner.roomId,sha+'.pdf')),source);
  store.persist=persist;
  await access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source)));
  assert.deepEqual((await access(owner.token,room=>store.getPdf(room,sha))).bytes,source);
});

test('tampered body, metadata conflicts, stored collisions and limits fail without replacing documents', async () => {
  const {store,owner,access,directory}=await fixture(), sha=digest(source);
  await assert.rejects(access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(Buffer.concat([source,Buffer.from('\n% changed')])))),/pdf_hash_mismatch/);
  await assert.rejects(access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,{...body(source),base64:'x'.repeat(Math.ceil(PDF_LIMITS.file/3)*4+4)})),/pdf_too_large/);
  await access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source)));
  await assert.rejects(access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,{...body(source),totalPages:1})),/pdf_metadata_conflict/);
  const assetPath=path.join(directory,'pdf',owner.roomId,sha+'.pdf');
  await writeFile(assetPath,'%PDF- altered on disk');
  await assert.rejects(access(owner.token,room=>store.getPdf(room,sha)),/pdf_stored_integrity_error/);
  await assert.rejects(access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(source))),/pdf_stored_integrity_error/);
  assert.equal(await readFile(assetPath,'utf8'),'%PDF- altered on disk');
});

test('quota counts retained bytes, including withdrawn documents, and deduplicates retries', async () => {
  const {store,owner,access}=await fixture();
  for(let i=0;i<32;i++) {
    const bytes=Buffer.concat([source,Buffer.from(`\n% source ${i}\n`)]), sha=digest(bytes);
    await access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(bytes)));
    if(i===0) {
      await access(owner.token,(room,grant)=>store.withdrawPdf(room,grant,sha));
      await access(owner.token,(room,grant)=>store.publishPdf(room,grant,sha,body(bytes)));
    }
  }
  await assert.rejects(access(owner.token,(room,grant)=>store.publishPdf(room,grant,digest(source),body(source))),/pdf_document_count_limit/);
  assert.equal((await access(owner.token,room=>store.listPdfs(room))).documents.length,32);
  const {store:large,owner:owner2,access:access2}=await fixture();
  for(let i=0;i<5;i++) {
    const padding=Buffer.alloc(PDF_LIMITS.file-source.length,0x20);padding.write(`\n% ${i}`);
    const bytes=Buffer.concat([source,padding]);
    await access2(owner2.token,(room,grant)=>large.publishPdf(room,grant,digest(bytes),body(bytes)));
  }
  await assert.rejects(access2(owner2.token,(room,grant)=>large.publishPdf(room,grant,digest(source),body(source))),/pdf_room_size_limit/);
  assert.equal((await access2(owner2.token,room=>large.listPdfs(room))).documents.length,5);
});
