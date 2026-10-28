import assert from 'node:assert/strict';
import {cleanOne,createHandler,ProviderStorage,uploadLockKey,API,BUCKET,type CleanupDatabase,type CleanupTransaction} from './core.ts';

const ID='a'.repeat(32),OTHER='b'.repeat(32),CAP='c'.repeat(64);
function database(state='cleanup_required',metadata=false,expires=900) {
  const data={intent:{id:ID,state,expires_at:expires},metadata,lock:false};
  const calls:string[]=[];
  const db:CleanupDatabase={
    candidates:async limit=>{calls.push('candidates');return data.intent&&data.intent.state!=='committed'&&data.intent.expires_at<=1000?[ID].slice(0,limit):[];},
    transaction:async apply=>{
      const before=structuredClone(data);
      try {return await apply({
        lock:async id=>{assert.equal(id,ID);data.lock=true;calls.push('lock');},
        intent:async()=>{assert(data.lock);calls.push('intent');return data.intent;},
        clock:async()=>1000,
        hasMetadata:async()=>{assert(data.lock);calls.push('metadata');return data.metadata;},
        reconcile:async()=>{assert(data.lock);data.intent.state='committed';calls.push('reconcile');},
        deleteIntent:async()=>{assert(data.lock);assert(!data.metadata);delete (data as {intent?:unknown}).intent;calls.push('deleteIntent');},
      });} catch(error) {Object.assign(data,before);throw error;} finally {data.lock=false;}
    },
  };
  return {db,data,calls};
}

Deno.test('same lock namespace as Python json.dumps, exact orphan deletion and retry-safe state',async()=>{
  assert.equal(uploadLockKey(ID),'["asset.upload", "'+ID+'"]');
  const {db,data,calls}=database();const objects=new Map([[ID,new Uint8Array([1,2,3])],[OTHER,new Uint8Array([9])]]);
  const storage={removeAndVerifyAbsent:async(id:string)=>{assert(data.lock);calls.push('remove');objects.delete(id);assert(!objects.has(id));}};
  assert.equal(await cleanOne(db,storage,ID),'cleaned');
  assert.equal(objects.has(ID),false);assert.equal(objects.has(OTHER),true);
  assert.deepEqual(calls,['lock','intent','metadata','remove','deleteIntent']);
  assert.equal(await cleanOne(db,storage,ID),'skipped');
});

Deno.test('metadata wins after candidate selection; committed and leased originals never deleted',async()=>{
  for (const [state,metadata,expires] of [['cleanup_required',true,900],['committed',true,900],['pending',false,1001]] as const) {
    const {db,data,calls}=database(state,metadata,expires);
    const storage={removeAndVerifyAbsent:async()=>{throw new Error('must not delete original');}};
    assert.equal(await cleanOne(db,storage,ID),'skipped');
    if (metadata) assert.equal(data.intent.state,'committed');
    assert(!calls.includes('deleteIntent'));
  }
});

Deno.test('storage outage and unverifiable absence retain durable intent',async()=>{
  const {db,data}=database();
  await assert.rejects(()=>cleanOne(db,{removeAndVerifyAbsent:async()=>{throw new Error('provider outage');}},ID));
  assert.equal(data.intent.state,'cleanup_required');
  assert.equal(await cleanOne(db,{removeAndVerifyAbsent:async()=>{}},ID),'cleaned');
});

Deno.test('provider is pinned to exact project/bucket/ID and confirms absence without bytes',async()=>{
  const calls:{url:string;options:RequestInit}[]=[];
  const fetcher=(async(input:RequestInfo|URL,options:RequestInit)=>{calls.push({url:String(input),options});return new Response(null,{status:options.method==='GET'?404:200});}) as typeof fetch;
  const storage=new ProviderStorage('internal-test-only-key',fetcher);
  await storage.removeAndVerifyAbsent(ID);
  assert.equal(calls[0].url,API+'/storage/v1/object/'+BUCKET);
  assert.deepEqual(JSON.parse(String(calls[0].options.body)),{prefixes:[ID]});
  assert.equal(calls[1].url,API+'/storage/v1/object/info/authenticated/'+BUCKET+'/'+ID);
  assert.equal(calls[1].options.method,'GET');
  assert(calls.every(call=>call.options.redirect==='error'));
  await assert.rejects(()=>storage.removeAndVerifyAbsent('../other-bucket/id'));
  assert.equal(calls.length,2);
  const retained=new ProviderStorage('internal-test-only-key',(async()=>new Response(null,{status:200})) as typeof fetch);
  await assert.rejects(()=>retained.removeAndVerifyAbsent(ID),/cleanup_not_verified/);
  const absent=new ProviderStorage('internal-test-only-key',(async()=>new Response(null,{status:404})) as typeof fetch);
  await absent.removeAndVerifyAbsent(ID); // A retry after a partial cleanup remains idempotent.
});

async function config(expiresAt=2000) {
  const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(CAP)));
  return {capabilitySha256:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join(''),expiresAt};
}
function request(body:unknown,authorization='Bearer '+CAP,extra:Record<string,string>={}) {
  return new Request(API+'/functions/v1/closure1-upload-recovery',{method:'POST',headers:{Authorization:authorization,...extra},body:JSON.stringify(body)});
}
Deno.test('operator capability is header-only, expiring and rejects browser/extra target parameters',async()=>{
  const {db,data,calls}=database();const handler=createHandler(await config(),db,{removeAndVerifyAbsent:async()=>{}},()=>1000);
  assert.equal((await handler(request({action:'candidates',limit:1},''))).status,401);
  assert.equal((await handler(request({action:'candidates',limit:1},'Bearer '+'d'.repeat(64)))).status,401);
  assert.equal((await handler(request({action:'candidates',limit:1},undefined,{Origin:'https://preview.example'}))).status,403);
  for (const body of [{action:'candidates',limit:101},{action:'candidates',limit:true},{action:'recover',id:ID,bucket:'other'},{action:'recover',id:'../x'},{action:'candidates',limit:1,url:'https://evil.example'}]) {
    assert.equal((await handler(request(body))).status,422);
  }
  assert.deepEqual(calls,[]);
  const expired=createHandler(await config(999),db,{removeAndVerifyAbsent:async()=>{}},()=>1000);
  assert.equal((await expired(request({action:'candidates',limit:1}))).status,401);
  const future=createHandler(await config(5000),db,{removeAndVerifyAbsent:async()=>{}},()=>1000);
  assert.equal((await future(request({action:'candidates',limit:1}))).status,401);
  assert.deepEqual(await (await handler(request({action:'candidates',limit:1}))).json(),{ids:[ID]});
  assert.deepEqual(await (await handler(request({action:'recover',id:ID}))).json(),{outcome:'cleaned'});
  assert.equal(data.intent,undefined);
});

Deno.test('observed legacy object-info HTTP400 structured404 proves absence',async()=>{
  const observed={statusCode:'404',error:'not_found',message:'Object not found',code:'NoSuchKey'};
  const calls:string[]=[];
  const storage=new ProviderStorage('internal-test-only-key',(async(_input:RequestInfo|URL,options:RequestInit)=>{
    calls.push(String(options.method));
    return options.method==='DELETE'?new Response(null,{status:200}):Response.json(observed,{status:400});
  }) as typeof fetch);
  await storage.removeAndVerifyAbsent(ID);
  assert.deepEqual(calls,['DELETE','GET']);
});

Deno.test('metadata verification rejects existing objects, authorization failures and inexact legacy errors',async()=>{
  const observed={statusCode:'404',error:'not_found',message:'Object not found',code:'NoSuchKey'};
  const failures=[
    {status:200,body:observed},{status:401,body:observed},{status:403,body:observed},{status:500,body:observed},
    {status:400,body:{message:'Object not found'}},{status:400,body:{...observed,code:'OtherFailure'}},
    {status:400,body:{...observed,error:'unauthorized'}},{status:400,body:{...observed,statusCode:404}},
  ];
  for (const failure of failures) {
    const storage=new ProviderStorage('internal-test-only-key',(async(_input:RequestInfo|URL,options:RequestInit)=>
      options.method==='DELETE'?new Response(null,{status:200}):Response.json(failure.body,{status:failure.status})) as typeof fetch);
    await assert.rejects(()=>storage.removeAndVerifyAbsent(ID),/cleanup_not_verified/);
  }
});

Deno.test('legacy metadata error JSON is bounded to4096bytes',async()=>{
  const observed=JSON.stringify({statusCode:'404',error:'not_found',code:'NoSuchKey'});
  for (const [size,accepted] of [[4096,true],[4097,false]] as const) {
    const storage=new ProviderStorage('internal-test-only-key',(async(_input:RequestInfo|URL,options:RequestInit)=>
      options.method==='DELETE'?new Response(null,{status:200}):new Response(observed+' '.repeat(size-observed.length),{status:400})) as typeof fetch);
    if (accepted) await storage.removeAndVerifyAbsent(ID);
    else await assert.rejects(()=>storage.removeAndVerifyAbsent(ID),/cleanup_not_verified/);
  }
});
