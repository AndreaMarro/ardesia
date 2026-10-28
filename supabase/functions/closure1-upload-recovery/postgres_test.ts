import assert from 'node:assert/strict';
import postgres from 'postgres';
import {cleanOne,uploadLockKey} from './core.ts';
import {cleanupDatabase} from './postgres.ts';

const url=Deno.env.get('ARDESIA_TEST_RECOVERY_DB') || '';
const ID='e'.repeat(32),COMMITTED='f'.repeat(32),RECONCILE='1'.repeat(32),RACE='2'.repeat(32);
Deno.test({name:'real local PG17: narrow RLS, lock identity, metadata-wins and request-key cascade',ignore:!url,fn:async()=>{
  assert.equal(new URL(url).hostname,'127.0.0.1','test may only mutate isolated local PostgreSQL');
  const runtimeUrl=new URL(url);runtimeUrl.username='ardesia_test_runtime';
  const runtime=postgres(runtimeUrl.toString(),{max:1,prepare:false,ssl:'require'});
  const admin=postgres(url,{max:2,prepare:false,ssl:'require'}),db=cleanupDatabase(url);
  try {
    await admin`TRUNCATE public.study_upload_requests,public.study_upload_intents,public.study_assets`;
    for (const [id,state] of [[ID,'cleanup_required'],[COMMITTED,'committed'],[RECONCILE,'cleanup_required'],[RACE,'pending']]) {
      await admin`INSERT INTO study_upload_intents VALUES(${id},'synthetic','revoked-owner',${state},0,0)`;
    }
    await admin`INSERT INTO study_upload_requests VALUES('revoked-owner','same-key','same-hash',${ID})`;
    for (const id of [COMMITTED,RECONCILE]) await admin`INSERT INTO study_assets VALUES(${id},'confirmed synthetic original')`;
    assert.deepEqual(await db.candidates(100),[RECONCILE,RACE,ID]);
    // A revoked/unavailable application actor still sees none, and cannot assume cleanup authority.
    await runtime.begin(async tx=>{
      await tx`SET LOCAL ROLE ardesia_app`;
      assert.equal((await tx`SELECT id FROM study_upload_intents`).length,0);
      assert.equal((await tx`SELECT id FROM study_assets`).length,0);
    });
    await assert.rejects(()=>runtime.begin(async tx=>{await tx`SET LOCAL ROLE ardesia_app`;await tx`SET LOCAL ROLE ardesia_upload_cleanup`;}),/permission denied/);
    await assert.rejects(()=>admin.begin(async tx=>{await tx`SET LOCAL ROLE ardesia_upload_cleanup`;await tx`SELECT marker FROM study_assets`;}),/permission denied/);
    await assert.rejects(()=>admin.begin(async tx=>{await tx`SET LOCAL ROLE ardesia_upload_cleanup`;await tx`INSERT INTO study_upload_intents(id) VALUES('arbitrary')`;}),/permission denied/);
    await admin.begin(async tx=>{await tx`SET LOCAL ROLE ardesia_upload_cleanup`;assert.equal((await tx`DELETE FROM study_upload_intents WHERE id=${COMMITTED}`).count,0);});
    let deleted=0;
    const storage={removeAndVerifyAbsent:async(id:string)=>{
      assert.equal(id,ID);deleted++;
      // The actual transaction lock is held while privileged provider deletion runs.
      await admin.begin(async tx=>{assert.equal((await tx`SELECT pg_try_advisory_xact_lock(hashtextextended(${uploadLockKey(id)},0)) AS acquired`)[0].acquired,false);});
    }};
    assert.equal(await cleanOne(db,storage,RECONCILE),'skipped');
    assert.equal((await admin`SELECT state FROM study_upload_intents WHERE id=${RECONCILE}`)[0].state,'committed');
    assert.equal(await cleanOne(db,storage,COMMITTED),'skipped');
    assert.equal(deleted,0);
    assert.equal(await cleanOne(db,storage,ID),'cleaned');
    assert.equal(deleted,1);
    assert.equal((await admin`SELECT * FROM study_upload_requests`).length,0);
    assert.equal((await admin`SELECT * FROM study_assets`).length,2);
    // Candidate selected before uploader completes: the same lock makes metadata win.
    let recovery:Promise<'cleaned'|'skipped'>|undefined;
    await admin.begin(async uploader=>{
      const pythonKey='["asset.upload", "'+RACE+'"]';
      await uploader`SELECT pg_advisory_xact_lock(hashtextextended(${pythonKey},0))`;
      recovery=cleanOne(db,{removeAndVerifyAbsent:async()=>{throw new Error('must preserve racing commit');}},RACE);
      await new Promise(resolve=>setTimeout(resolve,100));
      await uploader`INSERT INTO study_assets VALUES(${RACE},'racing committed original')`;
      await uploader`UPDATE study_upload_intents SET state='committed' WHERE id=${RACE}`;
    });
    assert.equal(await recovery,'skipped');
    assert.equal((await admin`SELECT * FROM study_assets`).length,3);
  } finally {await db.close?.();await admin.end({timeout:5});await runtime.end({timeout:5});}
}});
