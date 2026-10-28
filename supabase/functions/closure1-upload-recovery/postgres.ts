import postgres from 'postgres';
import { uploadLockKey, type CleanupDatabase, type CleanupTransaction } from './core.ts';

export function cleanupDatabase(connectionString: string): CleanupDatabase {
  const sql=postgres(connectionString,{max:1,prepare:false,ssl:'require',connect_timeout:5,idle_timeout:10});
  async function transaction<T>(apply: (tx: CleanupTransaction)=>Promise<T>): Promise<T> {
    return await sql.begin(async connection=>{
      await connection`SET LOCAL ROLE ardesia_upload_cleanup`;
      await connection`SET LOCAL search_path = pg_catalog, public`;
      await connection`SET LOCAL lock_timeout = '2s'`;
      await connection`SET LOCAL statement_timeout = '25s'`;
      return await apply({
        lock:async id=>{ await connection`SELECT pg_advisory_xact_lock(hashtextextended(${uploadLockKey(id)},0))`; },
        intent:async id=>{
          const row=(await connection`SELECT id,state,expires_at FROM public.study_upload_intents WHERE id=${id}`)[0];
          if (!row) return undefined;
          if (!Number.isFinite(Number(row.expires_at))) throw new Error('invalid_upload_lease');
          return {id:String(row.id),state:String(row.state),expires_at:Number(row.expires_at)};
        },
        clock:async()=>Number((await connection`SELECT extract(epoch FROM clock_timestamp()) AS now`)[0].now),
        hasMetadata:async id=>(await connection`SELECT id FROM public.study_assets WHERE id=${id}`).length>0,
        reconcile:async id=>{ await connection`UPDATE public.study_upload_intents SET state='committed' WHERE id=${id}`; },
        deleteIntent:async id=>{
          const result=await connection`DELETE FROM public.study_upload_intents WHERE id=${id}`;
          if (result.count!==1) throw new Error('cleanup_intent_not_deleted');
        },
      });
    }) as T;
  }
  return {
    transaction,
    close:async()=>{await sql.end({timeout:5});},
    candidates:async limit=>await sql.begin(async connection=>{
      await connection`SET LOCAL ROLE ardesia_upload_cleanup`;
      await connection`SET LOCAL statement_timeout = '5s'`;
      const rows=await connection`SELECT id FROM public.study_upload_intents
        WHERE state IN ('pending','cleanup_required') AND expires_at<=extract(epoch FROM clock_timestamp())
        ORDER BY created_at,id LIMIT ${limit}`;
      return rows.map(row=>String(row.id));
    }) as string[],
  };
}
