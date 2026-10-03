import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createRoomSyncServer } from './server.mjs';

const source=await readFile(new URL('../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf',import.meta.url));
const sha=createHash('sha256').update(source).digest('hex');
const payload={consent:'share-complete-document',name:'deck.pdf',totalPages:7,base64:source.toString('base64')};
async function fixture(t) {
  const dataDir=await mkdtemp(path.join(tmpdir(),'ardesia-pdf-http-'));
  const app=await createRoomSyncServer({dataDir});await app.listen(0);t.after(()=>app.close());
  const port=app.server.address().port,base=`http://127.0.0.1:${port}`;
  const call=(route,token,method='GET',body)=>fetch(base+route,{method,headers:{Authorization:`Bearer ${token??''}`,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const owner=await(await call('/rooms',null,'POST',{clientId:'owner'})).json();
  return {call,owner,port,route:`/rooms/${owner.roomId}`};
}

test('two authenticated HTTP clients share exact PDF bytes only after document consent; token and publication revocation apply',async t=>{
  const {call,owner,route}=await fixture(t);
  const viewer=await(await call(route+'/grants',owner.token,'POST',{role:'viewer'})).json();
  assert.equal((await call(route+'/pdf/'+sha,viewer.token)).status,404);
  assert.equal((await call(route+'/operations',owner.token,'POST',{operationId:'bypass',clientId:'one',changes:[],files:{original:{id:'original',mimeType:'application/pdf',dataURL:'data:application/pdf;base64,'+source.toString('base64')}}})).status,400);
  assert.equal((await call(route+'/pdf/'+sha,owner.token,'POST',{...payload,consent:undefined})).status,400);
  assert.equal((await call(route+'/pdf/'+sha,owner.token,'POST',payload)).status,200);
  const downloaded=await call(route+'/pdf/'+sha,viewer.token);
  assert.equal(downloaded.headers.get('content-type'),'application/pdf');
  assert.equal(downloaded.headers.get('cache-control'),'no-store');
  assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),source);
  const other=await(await call('/rooms',null,'POST',{clientId:'other'})).json();
  assert.equal((await call(`/rooms/${other.roomId}/pdf/${sha}`,viewer.token)).status,401);
  assert.equal((await call(route+'/pdf/'+sha,viewer.token,'DELETE')).status,403);
  assert.equal((await call(route+'/pdf/'+sha,owner.token,'DELETE')).status,200);
  assert.equal((await call(route+'/pdf/'+sha,viewer.token)).status,404);
  await call(route+'/pdf/'+sha,owner.token,'POST',payload);
  await call(route+'/grants/'+viewer.grantId,owner.token,'DELETE');
  assert.equal((await call(route+'/pdf/'+sha,viewer.token)).status,401);
  assert.equal((await call(route+'/pdf',viewer.token)).status,401);
});

test('missing/revoked/wrong-room/viewer grants fail before an unfinished large body is read',async t=>{
  const {call,owner,route,port}=await fixture(t);
  const viewer=await(await call(route+'/grants',owner.token,'POST',{role:'viewer'})).json();
  const editor=await(await call(route+'/grants',owner.token,'POST',{role:'editor'})).json();
  await call(route+'/grants/'+editor.grantId,owner.token,'DELETE');
  const other=await(await call('/rooms',null,'POST',{clientId:'other'})).json();
  for(const [token,status] of [[undefined,401],[viewer.token,403],[editor.token,401],[other.token,401]]) {
    await new Promise((resolve,reject)=>{
      const req=request({host:'127.0.0.1',port,path:route+'/pdf/'+sha,method:'POST',headers:{...(token?{Authorization:`Bearer ${token}`} : {}),'Content-Type':'application/json','Content-Length':20*1024*1024}},res=>{
        try{assert.equal(res.statusCode,status);res.resume();req.destroy();resolve();}catch(error){reject(error);}
      });
      req.on('error',error=>{if(error.code!=='ECONNRESET')reject(error);});
      req.setTimeout(2000,()=>{req.destroy();reject(new Error('server waited for unauthorized body'));});
      req.flushHeaders(); // Deliberately never send body/end; authorization must already reject it.
    });
  }
});

test('revocation while a permitted upload is in flight prevents publication',async t=>{
  const {call,owner,route,port}=await fixture(t);
  const editor=await(await call(route+'/grants',owner.token,'POST',{role:'editor'})).json();
  const raw=JSON.stringify(payload);
  let continueUpload;
  const response=new Promise((resolve,reject)=>{
    const req=request({host:'127.0.0.1',port,path:route+'/pdf/'+sha,method:'POST',headers:{Authorization:`Bearer ${editor.token}`,'Content-Type':'application/json','Content-Length':Buffer.byteLength(raw)}},res=>{res.resume();resolve(res.statusCode);});
    req.on('error',reject);req.write(raw.slice(0,20));continueUpload=()=>req.end(raw.slice(20));
  });
  await call(route+'/grants/'+editor.grantId,owner.token,'DELETE');continueUpload();
  assert.equal(await response,401);
  assert.equal((await call(route+'/pdf/'+sha,owner.token)).status,404);
});
