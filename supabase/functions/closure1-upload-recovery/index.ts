import { API,PROJECT,ProviderStorage,createHandler } from './core.ts';
import { cleanupDatabase } from './postgres.ts';
import { operatorConfig } from './operator-config.ts';

// Built-in secrets remain inside the worker. They are never responses or logs.
const api=Deno.env.get('SUPABASE_URL');
const database=Deno.env.get('SUPABASE_DB_URL') || '';
let validDatabase=false;
try { validDatabase=new URL(database).hostname===`db.${PROJECT}.supabase.co`; } catch { /* fail closed */ }
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
let handler: (request: Request)=>Response|Promise<Response>=()=>Response.json({error:'recovery_unconfigured'},{status:503});
try {
  if (api===API && validDatabase && key) {
    handler=createHandler(operatorConfig,cleanupDatabase(database),new ProviderStorage(key));
  }
} catch { /* Never log credentials or provider exception details. */ }
Deno.serve(handler);
