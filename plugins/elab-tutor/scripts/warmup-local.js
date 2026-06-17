#!/usr/bin/env node
/**
 * warmup-local.js — Manual trigger for Render warmup (T1-003 dev helper).
 * Usage: node scripts/warmup-local.js [url]
 * Env: RENDER_HEALTH_URL (fallback: https://elab-galileo.onrender.com/health)
 */
import { warmupOnce } from '../src/services/renderWarmup.js';

const arg = process.argv[2];
const url = (arg && arg.trim()) || (process.env.RENDER_HEALTH_URL && process.env.RENDER_HEALTH_URL.trim()) || 'https://elab-galileo.onrender.com/health';

const main = async () => {
  const t0 = Date.now();
  const res = await warmupOnce(url, { timeoutMs: 20000 });
  const ms = Date.now() - t0;
  const line = JSON.stringify({ url, ok: res.ok, status: res.status, error: res.error, ttftMs: ms });
  console.log(line);
  process.exit(res.ok ? 0 : 1);
};

main().catch((err) => {
  console.error(JSON.stringify({ url, ok: false, error: err && err.message }));
  process.exit(1);
});
