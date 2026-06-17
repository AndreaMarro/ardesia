/**
 * Supabase Client — singleton per ELAB Tutor
 * Configurazione via env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * Se non configurato, ritorna null (fallback a auth locale).
 * © Andrea Marro — 31/03/2026
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function decodeJwtPayload(token) {
  try {
    const payload = String(token || '').split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split('.')[0] || '';
  } catch {
    return '';
  }
}

function hasUsableSupabaseConfig(url, key) {
  if (!url || !key) return false;
  const payload = decodeJwtPayload(key);
  if (!payload || payload.role !== 'anon') return false;
  const ref = projectRefFromUrl(url);
  if (!ref || payload.ref !== ref) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  // The legacy sync project currently returns 401 "Invalid API key" in
  // browser smoke. Keep session sync offline instead of polluting console
  // health until a fresh key/project is provisioned.
  if (ref === 'vxvqalmxqtezvgiboxyv') return false;
  return true;
}

const supabase = hasUsableSupabaseConfig(supabaseUrl, supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default supabase;

/** @returns {boolean} true se Supabase e configurato e pronto */
export function isSupabaseConfigured() {
  return !!supabase;
}
